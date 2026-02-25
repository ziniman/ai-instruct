# Deploying a Static SPA on AWS

> Applies to: React/Vite SPAs on AWS (Amplify + CDK) | Updated: February 2026

A focused guide for deploying a React/Vite single-page app on AWS with optional API backend using CDK (Cloud Development Kit). Covers Amplify hosting, Lambda + API Gateway, and SES email.

## Contents

1. [Before you start](#before-you-start)
2. [Architecture](#architecture)
3. [Costs at a glance](#costs-at-a-glance)
4. [Amplify Hosting](#amplify-hosting)
5. [CDK Backend](#cdk-backend)
6. [SES Email](#ses-email)
7. [Common problems](#common-problems)

---

## Before you start

Answer these questions before generating any code. Each has a default assumption  -  confirm or override before proceeding.

**Q: Do you need a backend API, or is this a static site with no server logic?**
Default: static only  -  if yes, skip the entire CDK section.

**Q: Do you have a custom domain name you want to use?**
Default: no  -  skip the domain and SSL subsections.

**Q: What is your target AWS region, and does it match your default AWS CLI region?**
Default: us-east-1. Check with `aws configure get region`. If they differ, pass `--region` explicitly to every CLI command and use the explicit bootstrap form (see CDK section).

**Q: Do you need to send emails from the site (contact forms, notifications)?**
Default: no  -  skip the SES section entirely.

**Q: Is this a brand new AWS account?**
Default: no (existing account). If new: SES starts in sandbox mode (can only send to verified addresses), and CDK bootstrap is required before any deploy.

**Q: What is the expected traffic?**
Default: low (a few visitors per day)  -  free tier covers this entirely. See cost table below.

> **AI assistant:** If the user only needs static hosting, generate only the Amplify Hosting section. Only include CDK/Lambda/SES content if they confirm they need a backend.

---

## Architecture

```
Static Site (Amplify = S3 + CloudFront)
    |
    +--> API Gateway (HTTP API) --> Lambda --> SES / DynamoDB / etc.
         OR
    +--> Lambda Function URL --> Lambda --> SES / DynamoDB / etc.
```

- Static site hosted on **Amplify** (auto-deploys on git push, CDN via CloudFront)
- Backend in a separate **CDK stack** deployed independently
- `VITE_*` environment variables bridge frontend to backend (baked into the JS bundle at build time, not available at runtime)

**This guide uses Amplify Gen 1 (console-based) for static hosting only.** If the Amplify console shows a code-first Gen 2 setup (with an `amplify/` directory in the repo), the hosting and SPA rewrite rules still apply the same way, but the backend configuration sections differ from what is described here.

---

## Costs at a glance

| Service | Free tier | What triggers billing |
|---|---|---|
| Amplify Hosting | 1,000 build minutes/month, 5 GB storage, 15 GB served | Exceeding any of those limits |
| Lambda | 1M requests/month, 400,000 GB-seconds compute | High request volume or large memory × long duration |
| API Gateway (HTTP API) | 1M requests/month for 12 months | After 12 months or >1M/month |
| Lambda Function URL | Same as Lambda  -  no API Gateway charge | High Lambda invocations |
| SES | 62,000 emails/month when sending from EC2/Lambda | Dedicated IPs, high volume beyond free tier |
| ACM SSL cert | Free | Never (ACM certs are always free) |

For a typical low-traffic SPA (contact form, a few hundred visitors/month), the effective monthly cost is $0.

---

## Amplify Hosting

1. Create an Amplify app in the console and connect your git repo.
2. Amplify auto-detects Vite and sets the build command to `npm run build` with output directory `dist`. Verify this in the build settings.
3. Add a **SPA rewrite rule** under App settings > Rewrites and redirects:
   - Source: `/<*>` → Target: `/index.html` → Type: `404-200`
   - The type must be `404-200` (not 301 or 302). A redirect would cause the browser to navigate to `/index.html` on every deep link, breaking the URL. A rewrite silently serves `index.html` while keeping the original URL.
4. If you want `www` to redirect to apex: add `https://www.yourdomain.com` → `https://yourdomain.com` with type `301`.

### Custom Domain and SSL

Add your domain under App settings > Domain management. Amplify provisions an SSL certificate via ACM (AWS Certificate Manager) automatically.

**ACM cert region gotcha:** The certificate is always provisioned in `us-east-1` regardless of your Amplify app's region. CloudFront requires certificates in `us-east-1`. If you check ACM in any other region you will see nothing  -  check `us-east-1` specifically.

Add the CNAME records that Amplify provides to your DNS registrar. Propagation typically takes a few minutes but can take up to 48 hours.

### Environment Variables

Vite env vars must be prefixed with `VITE_`. They are baked into the JS bundle at build time  -  they are not accessible at runtime and must not contain secrets.

Set them in Amplify Console > Environment variables, or via CLI:

```bash
aws amplify update-app \
  --app-id YOUR_APP_ID \
  --environment-variables VITE_API_URL=https://your-api-url.amazonaws.com \
  --region your-region
```

After changing env vars, trigger a new build  -  existing deployments are not updated automatically.

### Build Cache

Without an `amplify.yml` cache configuration, `node_modules` is rebuilt from scratch on every deploy, adding 2 - 4 minutes per build. Add this file to your repo root to cache dependencies:

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

## CDK Backend

### When to use API Gateway vs Lambda Function URLs

**Use API Gateway (HTTP API)** when you have multiple routes, need request validation, or plan to add auth (JWT authorizers, IAM). It adds a small latency overhead and a per-request cost after the free tier.

**Use Lambda Function URLs** when you have a single endpoint (contact form, webhook handler) and do not need routing or auth middleware. They are free beyond Lambda's own cost, have no additional latency layer, and require less CDK code.

Lambda Function URL example (simpler):

```typescript
const handler = new lambda.Function(this, 'Handler', {
  runtime: lambda.Runtime.NODEJS_22_X,
  handler: 'handler.handler',
  code: lambda.Code.fromAsset('lambda'),
  memorySize: 256,
  timeout: cdk.Duration.seconds(10),
});

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

### Project Structure

```
infra/
├── bin/app.ts           # CDK app entry
├── lib/api-stack.ts     # Stack definition
├── lambda/handler.mjs   # Lambda handler (ESM, use .mjs extension)
├── cdk.json
├── package.json
└── tsconfig.json
```

### Bootstrap

CDK bootstrap creates the S3 bucket and IAM roles that CDK needs to deploy. Run it once per account/region combination.

```bash
# Explicit form  -  use this to avoid deploying to the wrong region
npx cdk bootstrap aws://YOUR_ACCOUNT_ID/your-region
```

Running `npx cdk bootstrap` without arguments uses your AWS CLI default region. If your CLI default region differs from the target deployment region, CDK resources land in the wrong region with no error. Always use the explicit `aws://ACCOUNT_ID/REGION` form.

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
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('lambda'),
      memorySize: 256,          // Lambda default is 128 MB  -  causes slow cold starts for Node.js/SES/DynamoDB workloads. Use 256 MB or 512 MB.
      timeout: cdk.Duration.seconds(10),
      environment: { /* your env vars */ },
    });

    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      corsPreflight: {
        allowOrigins: [
          'https://yourdomain.com',
          'http://localhost:5173',   // Vite dev server
          'http://localhost:4173',   // Vite preview
        ],
        allowMethods: [apigwv2.CorsHttpMethod.POST, apigwv2.CorsHttpMethod.OPTIONS],
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

### CORS: configure in one place only

CORS headers can be set in two places: API Gateway's `corsPreflight` config, or returned directly from the Lambda function (`Access-Control-Allow-Origin` etc.). **Configure CORS in only one place.** If both are set, the browser receives duplicate headers and the request fails.

- Use API Gateway CORS config (as shown above) when you want the gateway to handle all CORS logic before it ever reaches Lambda.
- Use Lambda-returned headers when using Lambda Function URLs or when you need dynamic origin logic.

API Gateway CORS config does **not** support wildcards in origin values. `http://localhost:*` will fail. List each port explicitly  -  Vite uses `5173` for dev and `4173` for preview.

The `OPTIONS` preflight method must be included in `allowMethods`. Browsers send an `OPTIONS` request before POST for cross-origin requests with a `Content-Type: application/json` header. If OPTIONS is not allowed, the preflight fails before any POST is attempted.

### Deploy order

Always deploy CDK before pushing the frontend. The frontend build needs `VITE_API_URL` (the API Gateway endpoint), which only exists after CDK has deployed. CDK first, then frontend push.

---

## SES Email

### Verify your sending domain

```bash
# SES v2 API (use this  -  ses verify-domain-identity is the deprecated v1 API)
aws sesv2 create-email-identity \
  --email-identity yourdomain.com \
  --region your-region
```

This returns DNS records to add. Add the DKIM CNAME records to your DNS registrar. SES checks for them automatically  -  verification usually completes within a few minutes.

**Sending address must match verified identity.** If you verify `yourdomain.com`, you can send from any address at that domain (`no-reply@yourdomain.com`, `hello@yourdomain.com`). If you only verified `mail.yourdomain.com` (a subdomain), only addresses at that subdomain are authorized. Sending from a non-matching address results in an authorization error even if the domain looks similar.

### Scope IAM permissions to specific identities

Do not grant `ses:SendEmail` on `*`. Scope to the verified identity ARN:

```typescript
import * as iam from 'aws-cdk-lib/aws-iam';

handler.addToRolePolicy(new iam.PolicyStatement({
  actions: ['ses:SendEmail'],
  resources: [
    `arn:aws:ses:${this.region}:${this.account}:identity/yourdomain.com`,
  ],
}));
```

### SES sandbox

New AWS accounts start with SES in sandbox mode. In sandbox mode, you can only send to email addresses you have individually verified in SES. To send to arbitrary addresses (i.e., real users), request production access in the SES console under "Account dashboard". AWS typically responds within 24 hours.

---

## Common problems

### Symptom → fix

| Symptom | Likely cause | Fix |
|---|---|---|
| Deep links return a blank page or 404 | SPA rewrite rule missing or wrong type | Add `/<*>` → `/index.html` rewrite, type must be `404-200` not 301/302 |
| `VITE_API_URL` is `undefined` at runtime | Env var not set before build, or missing `VITE_` prefix | Set in Amplify Console, trigger a new build |
| CORS error on POST but not on GET | `OPTIONS` preflight blocked | Add `OPTIONS` to `allowMethods` in API Gateway CORS config |
| CORS error despite correct API Gateway config | CORS headers set in both API Gateway and Lambda | Remove CORS headers from one of the two  -  keep only API Gateway or only Lambda |
| CORS error with `localhost:*` | API Gateway does not support wildcard ports | List `http://localhost:5173` and `http://localhost:4173` explicitly |
| Lambda times out on first request after inactivity | Cold start with 128 MB memory | Set `memorySize: 256` or higher in the Lambda definition |
| CDK deployed to wrong region | Bootstrap used CLI default region | Use `npx cdk bootstrap aws://ACCOUNT_ID/REGION` explicitly |
| ACM cert not visible in console | Looking in the wrong region | ACM cert for CloudFront is always in `us-east-1` regardless of app region |
| SES authorization error | Sending from address does not match verified identity | Verify the exact domain or subdomain the `From` address uses |
| SES email rejected without sandbox error | Still in sandbox mode, recipient not verified | Request SES production access in the SES console |

### Finding Amplify build logs

In the Amplify Console, open your app, select the failing deployment from the build history, and expand each build phase (preBuild, build, postBuild). The log for each phase is fully scrollable. If the build fails before the `build` phase, check `preBuild`  -  a missing `npm ci` or wrong Node.js version shows up there.

### Diagnosing CORS errors

1. Open browser DevTools > Network tab.
2. Find the failing request. If the preflight `OPTIONS` request is shown separately and returns a non-200 status, the issue is in API Gateway CORS config (check `allowMethods` includes OPTIONS, check origins list).
3. If OPTIONS returns 200 but the POST still fails with a CORS error, check the response headers on the POST. If `Access-Control-Allow-Origin` appears twice, both API Gateway and Lambda are setting it  -  remove one.
4. If no CORS header appears at all on the POST response, the Lambda function threw an error before returning headers. Check Lambda logs in CloudWatch.

### Detecting Lambda timeout

In CloudWatch Logs, a timeout looks like:

```
REPORT RequestId: ... Duration: 10000.00 ms  Billed Duration: 10000 ms ...
Task timed out after 10.00 seconds
```

The duration matches the configured timeout exactly. If you see this, either increase `timeout` in the CDK definition or investigate what the Lambda is waiting on (SES call, DynamoDB query, external HTTP request).
