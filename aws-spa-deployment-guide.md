# Deploying a Static SPA on AWS

A concise guide for deploying a static single-page app (React/Vite) on AWS with an optional API backend using CDK.

## Architecture

```
Static Site (Amplify = S3 + CloudFront)
    |
    +--> API Gateway (HTTP API) --> Lambda --> SES / DynamoDB / etc.
```

- Static site hosted on **Amplify** (auto-deploys on git push)
- Backend APIs in a separate **CDK stack** (deployed independently)
- `VITE_*` environment variables bridge frontend to backend (baked at build time)

## Amplify Hosting

1. Create an Amplify app and connect your git repo
2. Amplify auto-detects Vite and configures build settings
3. Add a **SPA rewrite rule** (Rewrites and redirects):
   - `/<*>` -> `/index.html` with type `404-200`
4. Optionally add a www redirect: `https://www.yourdomain.com` -> `https://yourdomain.com` (301)

### Custom Domain & SSL

Add your domain in Amplify Console > Domain management. Amplify provisions an SSL cert via ACM automatically. Add the CNAME records it provides to your DNS.

### Environment Variables

Vite env vars must be prefixed with `VITE_` and are baked into the JS bundle at build time. Set them in Amplify Console or via CLI:

```bash
aws amplify update-app \
  --app-id YOUR_APP_ID \
  --environment-variables VITE_API_URL=https://your-api-url.amazonaws.com \
  --region your-region
```

After changing env vars, trigger a new build.

## CDK Backend

### Project Structure

```
infra/
├── bin/app.ts           # CDK app entry
├── lib/api-stack.ts     # Stack: API Gateway + Lambda
├── lambda/handler.mjs   # Lambda handler (ESM)
├── cdk.json
├── package.json
└── tsconfig.json
```

### Commands

```bash
cd infra
npm install
npx cdk bootstrap   # First time only
npx cdk synth        # Preview CloudFormation (no deploy)
npx cdk deploy       # Deploy
npx cdk diff         # Show pending changes
```

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
      timeout: cdk.Duration.seconds(10),
      environment: { /* your env vars */ },
    });

    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      corsPreflight: {
        allowOrigins: [
          'https://yourdomain.com',
          'http://localhost:5173',   // Vite dev
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

Use **HTTP API** (v2) over REST API -- it's cheaper, faster, and simpler.

### CORS Gotcha

API Gateway does **not** support wildcards in origins (e.g. `http://localhost:*` will fail). List each port explicitly.

## SES Email (if needed)

1. **Verify your domain** in SES (same region as Lambda):
   ```bash
   aws ses verify-domain-identity --domain yourdomain.com --region your-region
   # Add the returned TXT record to DNS as _amazonses.yourdomain.com
   ```

2. **Sandbox mode** only allows sending to verified addresses. Request production access in SES Console when ready.

3. **Scope IAM permissions** to specific identities:
   ```typescript
   handler.addToRolePolicy(new iam.PolicyStatement({
     actions: ['ses:SendEmail'],
     resources: [
       `arn:aws:ses:${this.region}:${this.account}:identity/yourdomain.com`,
     ],
   }));
   ```

## Frontend API Call

```javascript
const res = await fetch(`${import.meta.env.VITE_API_URL}/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

if (!res.ok) {
  const error = await res.json().catch(() => ({}));
  throw new Error(error.message || 'Something went wrong');
}
```

## Deployment Workflow

| What changed | Action |
|---|---|
| Frontend only | `git push` (Amplify auto-builds) |
| Backend only | `cd infra && npx cdk deploy` |
| Both | Deploy CDK first, then push frontend |
| Env var | Update in Amplify Console, trigger new build |

## First-Time Checklist

1. Create Amplify app and connect repo
2. Configure custom domain and SPA rewrite rule
3. `cd infra && npm install && npx cdk bootstrap && npx cdk deploy`
4. Set `VITE_API_URL` in Amplify environment variables
5. Verify SES domain (if using email)
6. Request SES production access (if sending to unverified addresses)
