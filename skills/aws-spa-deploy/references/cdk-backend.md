## CDK Backend

### When to use API Gateway vs Lambda Function URLs

**Use API Gateway (HTTP API)** when you have multiple routes, need request validation, plan to add auth (JWT (JSON Web Token) authorizers or IAM (AWS Identity and Access Management) authorization), want throttling, or need a custom domain for the API (for example `api.yourdomain.com`). It adds a small latency overhead and a per-request cost after the free tier.

**Use Lambda Function URLs** when you have a single endpoint (contact form, webhook handler) and do not need routing, auth middleware, or a custom domain. They are free beyond Lambda's own cost, have no additional latency layer, and require less CDK code.

Lambda Function URL example (simpler):

```typescript
const handler = new lambda.Function(this, 'Handler', {
  runtime: lambda.Runtime.NODEJS_24_X,
  handler: 'handler.handler',
  code: lambda.Code.fromAsset('lambda'),
  memorySize: 256,
  timeout: cdk.Duration.seconds(10),
  environment: {
    FROM_ADDRESS: 'no-reply@yourdomain.com',
    TO_ADDRESS: 'you@yourdomain.com',
  },
});
// Grant SES access as shown in "Scope IAM permissions to specific identities" below;
// without it every send fails with AccessDenied.

const fnUrl = handler.addFunctionUrl({
  authType: lambda.FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: ['https://yourdomain.com', 'http://localhost:5173', 'http://localhost:4173'],
    allowedMethods: [lambda.HttpMethod.POST],
    allowedHeaders: ['Content-Type'],
  },
});

new cdk.CfnOutput(this, 'FunctionUrl', { value: fnUrl.url });
```

**Use `aws-cdk-lib` 2.224.0 or later.** That is the first release with `lambda.Runtime.NODEJS_24_X`, and it also includes the function URL permission fix from 2.220.0: since October 2025, new function URLs with auth type `NONE` need a resource policy that allows both `lambda:InvokeFunctionUrl` and `lambda:InvokeFunction`; without both, every request returns `403 Forbidden`. CDK 2.220.0 and later add both statements automatically in `addFunctionUrl`. Older versions add only the first.

### Lambda runtime

Use `lambda.Runtime.NODEJS_24_X` for new functions. As of 2026, Node.js 20 was deprecated on April 30, 2026, Node.js 22 is deprecated on April 30, 2027, and Node.js 24 on April 30, 2028. Node.js 24 drops callback-style handlers (`(event, context, callback)`), so write `export const handler = async (event) => { ... }`.

### Project Structure

```
infra/
├── bin/app.ts           # CDK app entry
├── lib/api-stack.ts     # Stack definition
├── lambda/
│   ├── handler.mjs      # Lambda handler (ESM, use .mjs extension)
│   └── package.json     # handler dependencies, e.g. @aws-sdk/client-sesv2
├── cdk.json
├── package.json
└── tsconfig.json
```

`Code.fromAsset('lambda')` uploads the folder as-is, so run `npm install --omit=dev` inside `lambda/` before `cdk deploy`. Alternatively, use `NodejsFunction` from `aws-cdk-lib/aws-lambda-nodejs`, which bundles the handler and its dependencies with esbuild.

### Bootstrap and pin the target environment

CDK bootstrap creates the S3 bucket and IAM roles that CDK needs to deploy. Run it once per account/region combination.

```bash
# Explicit form  -  use this to avoid bootstrapping the wrong region
npx cdk bootstrap aws://YOUR_ACCOUNT_ID/your-region
```

Then pin the stack's environment in the CDK app entry:

```typescript
// bin/app.ts
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

new ApiStack(app, 'ApiStack', {
  env: { account: 'YOUR_ACCOUNT_ID', region: 'your-region' },
});
```

A stack without `env` is environment-agnostic: CDK deploys it to whatever account and region your CLI profile resolves to at deploy time (the `default` profile unless you pass `--profile`). That is how stacks end up in the wrong region. A hard-coded `env` makes the target explicit, and AWS recommends it for production. If the pinned region was never bootstrapped, `cdk deploy` fails with `SSM parameter /cdk-bootstrap/hnb659fds/version not found`; bootstrap that account/region and deploy again.

### Minimal Stack (API Gateway + Lambda)

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambda.Function(this, 'Handler', {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('lambda'),
      memorySize: 256,          // Lambda default is 128 MB  -  causes slow cold starts for Node.js/SES/DynamoDB workloads. Use 256 MB or 512 MB.
      timeout: cdk.Duration.seconds(10),
      environment: {
        FROM_ADDRESS: 'no-reply@yourdomain.com',
        TO_ADDRESS: 'you@yourdomain.com',
      },
    });

    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      corsPreflight: {
        allowOrigins: [
          'https://yourdomain.com',
          'http://localhost:5173',   // Vite dev server
          'http://localhost:4173',   // Vite preview
        ],
        allowMethods: [apigwv2.CorsHttpMethod.POST],
        allowHeaders: ['Content-Type'],
      },
    });

    httpApi.addRoutes({
      path: '/your-endpoint',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('Integration', handler),
    });

    new cdk.CfnOutput(this, 'ApiUrl', { value: httpApi.apiEndpoint });
  }
}
```

### CORS: configure it at the edge, not in Lambda

CORS (cross-origin resource sharing) is the browser rule that blocks your SPA on `yourdomain.com` from reading responses from an API on another origin unless the API allows it. Put CORS on the HTTP API (`corsPreflight`) or on the function URL (`cors`), and do not also return `Access-Control-*` headers from the handler. The two front doors behave differently when both are set:

- **HTTP API:** with CORS configured, API Gateway answers `OPTIONS` preflight requests itself (no `OPTIONS` route needed) and **ignores** CORS headers returned by Lambda. Headers set in the handler are silently dropped, so change `corsPreflight` instead.
- **Function URL:** Lambda answers preflights from the URL config, but on the actual `POST` it returns **both** the configured headers and any the function returns. The browser then rejects the response with `The 'Access-Control-Allow-Origin' header contains multiple values`.
- Return CORS headers from the handler only if you configure no CORS at the gateway or URL level (for example, to compute the allowed origin dynamically).

**What the preflight checks.** A `POST` with `Content-Type: application/json` triggers a preflight because `application/json` is not a CORS-safelisted content type. The preflight passes only if `Content-Type` is in `allowHeaders` and the page's origin is in `allowOrigins`. `POST` is a CORS-safelisted method, and `OPTIONS` never needs to be listed in `allowMethods` (listing it is harmless).

**Origins must match exactly:** scheme, host, and port. The browser's `Origin` header never has a trailing slash, so write `https://yourdomain.com`, not `https://yourdomain.com/`. HTTP API accepts `*` or a scheme-wide `https://*` / `http://*`, but not port wildcards such as `http://localhost:*`. List each Vite port explicitly: `5173` for dev and `4173` for preview.

If you later add an authorizer to a `$default` route, also add an `OPTIONS /{proxy+}` route without authorization; otherwise preflight requests hit the authorizer and fail.

### Deploy order

Always deploy CDK before pushing the frontend. The frontend build needs `VITE_API_URL` (the API Gateway endpoint or function URL), which only exists after CDK has deployed. CDK first, then frontend push.
