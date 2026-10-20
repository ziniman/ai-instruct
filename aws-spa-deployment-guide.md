# Deploying a Static SPA on AWS

> Applies to: React/Vite SPAs on AWS (Amplify Hosting + CDK) | Updated: October 2026

A focused guide for deploying a React/Vite single-page app on AWS with an optional API backend built with the AWS CDK (Cloud Development Kit). Covers Amplify Hosting, Lambda behind API Gateway or a function URL, and SES (Simple Email Service) email.

---

## Section 0: Before You Start

Answer these questions before generating any code. Each has a default assumption  -  confirm or override before proceeding.

**Q: Do you need a backend API, or is this a static site with no server logic?**
Default: static only, with no backend. In that case skip the entire CDK section.

**Q: Do you have a custom domain name you want to use?**
Default: no  -  skip the domain and SSL subsections.

**Q: What is your target AWS region, and does it match your default AWS CLI region?**
Default: us-east-1. Check with `aws configure get region`. If they differ, pass `--region` explicitly to every CLI command and pin the region in the CDK app (see CDK section).

**Q: Do you need to send emails from the site (contact forms, notifications)?**
Default: no  -  skip the SES section entirely.

**Q: Is this a brand new AWS account?**
Default: no (existing account). If new: SES starts in sandbox mode in every region (it can only send to verified addresses), CDK bootstrap is required before any deploy, and accounts created on or after July 15, 2025 use the credit-based Free Tier (see cost table).

**Q: What is the expected traffic?**
Default: low (a few visitors per day)  -  this typically costs $0 to a few cents per month. See cost table below.

> **AI assistant:** If the user only needs static hosting, generate only the Amplify Hosting section. Only include CDK/Lambda/SES content if they confirm they need a backend. For new Lambda functions use `lambda.Runtime.NODEJS_24_X` with an async handler.

## Contents

1. [Architecture](#architecture)
2. [Costs at a glance](#costs-at-a-glance)
3. [Amplify Hosting](#amplify-hosting)
4. [CDK Backend](#cdk-backend)
5. [SES Email](#ses-email)
6. [Common problems](#common-problems)

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

**This guide uses Amplify Hosting only, with no Amplify-managed backend.** You connect a git repo in the Amplify console, Amplify builds and serves the static site, and the backend lives in a separate CDK app. Amplify Gen 1 (the `amplify` CLI backend workflow) entered maintenance mode on May 1, 2026 and reaches end of life on May 1, 2027 (as of 2026), so do not start new projects on it. If the repo has an `amplify/` directory, it uses a Gen 2 code-first backend: the hosting, rewrite, and header steps below still apply, but the CDK backend sections of this guide describe a different setup.

---

## Costs at a glance

Free allowances and prices as of October 2026, from each service's pricing page:

| Service | Free allowance | What you pay after that |
|---|---|---|
| Amplify Hosting | No 12-month allowance applies as of 2026; new accounts use Free Tier credits | $0.01 per build minute, $0.023 per GB stored per month, $0.15 per GB served |
| Lambda | 1M requests and 400,000 GB-seconds per month (Always Free) | High request volume or large memory × long duration |
| API Gateway (HTTP API) | No 12-month allowance applies as of 2026; new accounts use Free Tier credits | About $1.00 per million requests |
| Lambda Function URL | No charge for the URL itself | Lambda invocations only |
| SES | No SES-specific free quota; Free Tier credits apply | $0.10 per 1,000 emails (a la carte). New SES accounts start on the Essentials plan ($0.16 per 1,000) since July 21, 2026 and can switch to a la carte at any time |
| ACM public certificate | No cost for certificates used by AWS services (including Amplify-managed ones) | Only exportable certificates are charged |

**Accounts created on or after July 15, 2025** get $100 in Free Tier credits at sign-up (up to $200 total) and choose a Free plan (ends after 6 months or when credits run out) or a Paid plan. Always Free offers such as Lambda's continue on both plans. Check Billing and Cost Management > Free Tier to see which offers your account has.

For a typical low-traffic SPA (contact form, a few hundred visitors/month), the effective monthly cost is $0 to a few cents.

---

## Amplify Hosting

1. Create an Amplify app in the console and connect your git repo.
2. Amplify auto-detects Vite and sets the build command to `npm run build` with output directory `dist`. Verify this in the build settings.
3. Make sure the **SPA rewrite rule** exists under Hosting > Rewrites and redirects (Amplify adds a default 404 rewrite to new apps; re-add it if it was removed or edited):
   - Source: `/<*>` → Target: `/index.html` → Type: `404-200`
   - The type must be a rewrite (`404-200`), not 301 or 302. A redirect would cause the browser to navigate to `/index.html` on every deep link, breaking the URL. A rewrite silently serves `index.html` while keeping the original URL.
   - Prefer `404-200` over the regex-based `200` rewrite shown in some AWS examples. `404-200` serves `index.html` only when no file exists at the path, so every real file is still served. The regex version rewrites every extension missing from its allow-list (for example `.xml` and `.webmanifest`), which silently breaks files such as `/sitemap.xml` and `/site.webmanifest`.
4. If you want `www` to redirect to apex: add `https://www.yourdomain.com` → `https://yourdomain.com` with type `301`. Domain-based sources cannot include a path; Amplify appends the path automatically.

The same rules in the console's JSON editor:

```json
[
  { "source": "https://www.yourdomain.com", "target": "https://yourdomain.com", "status": "301" },
  { "source": "/<*>", "target": "/index.html", "status": "404-200" }
]
```

Rules apply top to bottom, so keep specific redirects above the catch-all rewrite.

### Custom Domain and SSL

Add your domain under Custom domains in the Amplify console. By default Amplify issues a managed certificate through ACM (AWS Certificate Manager), which renews automatically while the CNAME (canonical name) validation record stays in DNS.

- **Keep the CNAME verification record in DNS.** Amplify cannot renew the managed certificate if that record is modified or deleted. The only fix is to remove the domain and add it again.
- **Custom certificates must be in `us-east-1`.** If you bring your own certificate instead of the managed one, request or import it in ACM in US East (N. Virginia), regardless of your Amplify app's region. Amplify serves through CloudFront, which requires that region.

Add the DNS records that Amplify provides to your DNS registrar (Route 53 can add them automatically). Propagation typically takes a few minutes but can take up to 48 hours.

### Environment Variables

Vite exposes only variables prefixed with `VITE_` to client code, through `import.meta.env`, and replaces them statically at build time. They are not readable at runtime, and their values end up in the public JS bundle, so they must not contain secrets.

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

Set them in Amplify Console > Hosting > Environment variables (they apply to all branches unless you add a branch override), or via CLI:

```bash
aws amplify update-app \
  --app-id YOUR_APP_ID \
  --environment-variables VITE_API_URL=https://your-api-url.amazonaws.com \
  --region your-region
```

`update-app --environment-variables` replaces all app-level variables rather than merging, so pass the complete set every time (run `aws amplify get-app --app-id YOUR_APP_ID` first to see the current values).

Vite reads variables from the build environment as well as from `.env` files, and build-environment values take priority, so an Amplify variable overrides the same key in a committed `.env` file.

After changing env vars, trigger a new build  -  existing deployments are not updated automatically.

### Build cache and Node.js version

`npm ci` deletes any existing `node_modules` before it installs, so caching `node_modules` alongside `npm ci` saves nothing. Cache npm's download cache instead, which is the pattern AWS uses in its own Amplify examples. Add this file to your repo root:

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm install 22                        # pin the Node.js major your project needs (installs if missing, switches if present)
        - npm ci --cache .npm --prefer-offline
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - .npm/**/*
```

- Cache paths must be relative to the project root. Amplify silently skips absolute paths.
- Pin the Node.js version with `nvm install` (as above) or with a live package update under Build settings > Build image settings, instead of relying on the build image default, which changes over time. Do not set the live package version to `latest`; that makes builds fail.
- Apps created on the older Amazon Linux 2 build image do not support Node.js 20 or later out of the box. Switch the build image to Amazon Linux 2023 (AL2023) in the console.

### Security headers

Amplify adds custom response headers from a `customHttp.yml` file in the repo root (or from Hosting > Custom headers in the console; the file wins if both exist). Redeploy after changing them.

```yaml
# customHttp.yml
customHeaders:
  - pattern: '**'
    headers:
      - key: 'Strict-Transport-Security'
        value: 'max-age=31536000; includeSubDomains'
      - key: 'X-Content-Type-Options'
        value: 'nosniff'
      - key: 'X-Frame-Options'
        value: 'SAMEORIGIN'
      - key: 'Content-Security-Policy'
        value: "default-src 'self'; connect-src 'self' https://your-api-url.amazonaws.com"
```

Add your API origin to the CSP (Content Security Policy) `connect-src` directive; a bare `default-src 'self'` blocks the SPA's `fetch` calls to API Gateway or a function URL.

---

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

---

## SES Email

### Verify your sending domain

```bash
# SES API v2. The older v1 command (ses verify-domain-identity) uses a TXT-record flow;
# v2 creates the identity and sets up Easy DKIM (DomainKeys Identified Mail) in one call.
aws sesv2 create-email-identity \
  --email-identity yourdomain.com \
  --region your-region
```

This returns three DKIM tokens. Add them as CNAME records at your DNS provider (SES can publish them for you if the domain is in Route 53 in the same account). SES verifies the domain automatically once it detects the records; this often takes minutes, but DNS changes can take up to 72 hours.

**Identities are per region.** Verify the domain in the same region your Lambda function sends from (the SDK client defaults to the function's own region).

**Sending address must match a verified identity.** If you verify `yourdomain.com`, you can send from any address at that domain or its subdomains (`no-reply@yourdomain.com`, `hello@mail.yourdomain.com`). If you only verified `mail.yourdomain.com` (a subdomain), only addresses at that subdomain are authorized. Sending from a non-matching address results in an error even if the domain looks similar.

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

### Send from Lambda

```javascript
// lambda/handler.mjs
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

const ses = new SESv2Client({}); // created once per execution environment, reused across invocations

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

const badRequest = (error) => ({ statusCode: 400, body: JSON.stringify({ error }) });

export const handler = async (event) => {
  let data;
  try {
    data = JSON.parse(event.body ?? '{}');
  } catch {
    return badRequest('Invalid JSON');
  }
  // JSON.parse('null') or '[]' succeeds, so reject anything that is not a plain object
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return badRequest('Body must be a JSON object');
  }

  const { name = '', email, message, website } = data;

  // Honeypot: a hidden "website" input that humans leave empty. Bots fill it in.
  // Return 200 so the bot sees success, but send nothing.
  if (website) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  if (typeof name !== 'string' || name.length > MAX_NAME) {
    return badRequest(`name must be a string of at most ${MAX_NAME} characters`);
  }
  if (typeof message !== 'string' || message.trim() === '' || message.length > MAX_MESSAGE) {
    return badRequest(`message is required, at most ${MAX_MESSAGE} characters`);
  }
  // Basic format check before the address goes into a mail header
  if (typeof email !== 'string' || email.length > MAX_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequest('Invalid email address');
  }

  const safeName = name.replace(/[\r\n]+/g, ' ').trim() || 'anonymous';

  try {
    await ses.send(new SendEmailCommand({
      FromEmailAddress: process.env.FROM_ADDRESS,   // must be on a verified identity
      Destination: { ToAddresses: [process.env.TO_ADDRESS] },
      ReplyToAddresses: [email],                    // replies go to the visitor
      Content: {
        Simple: {
          Subject: { Data: `Contact form: ${safeName}` },
          Body: { Text: { Data: message } },
        },
      },
    }));
  } catch (err) {
    console.error('SES send failed', err);          // details go to CloudWatch Logs, not the browser
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not send message' }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
```

- Never put the visitor's address in `FromEmailAddress`. It is not a verified identity, so SES rejects the send. Use `ReplyToAddresses` instead.
- The handler returns no CORS headers on purpose; the HTTP API or function URL config adds them (see the CORS section).
- The Node.js runtimes include the AWS SDK for JavaScript v3, but AWS recommends bundling the clients you use so runtime updates cannot change them under you: run `npm install @aws-sdk/client-sesv2` inside `lambda/`.

### Abuse controls

The endpoint is public and unauthenticated, so a script can flood your inbox and burn SES quota and spend. Layer these:

- **HTTP API stage throttling.** `HttpApi` does not accept throttle settings for the default stage it creates, so disable it and add the `$default` stage yourself. The limit applies to all callers combined, not per IP.

```typescript
const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
  createDefaultStage: false,
  corsPreflight: { /* same config as the minimal stack */ },
});

httpApi.addStage('DefaultStage', {
  stageName: '$default',
  autoDeploy: true,
  throttle: { rateLimit: 5, burstLimit: 10 },   // steady requests per second, short burst
});
```

- **Reserved concurrency (function URL path).** Add `reservedConcurrentExecutions: 2` to the `lambda.Function` props as a hard cap; a function URL then accepts at most 10 times that many requests per second. It costs nothing, but you can only reserve up to your unreserved account concurrency minus 100, and new accounts start with reduced concurrency quotas, so check Service Quotas > AWS Lambda > Concurrent executions first or the deploy fails.
- **Honeypot field.** The handler above silently drops any submission with a non-empty `website` field. Add that input to the form, hide it off-screen with CSS (not `type="hidden"`, which bots skip), and give it `tabIndex={-1}`, `autoComplete="off"`, and `aria-hidden="true"` so people and assistive tech never fill it.
- **AWS WAF rate-based rules** (per-IP limits) cannot attach to an HTTP API or a function URL directly. WAF protects CloudFront distributions, API Gateway REST APIs, and Amplify apps, among others, so per-IP limiting means putting CloudFront in front of the API or using a REST API.

### SES sandbox

New accounts start with SES in sandbox mode, separately in each region. In the sandbox you can only send to verified addresses or domains (or the SES mailbox simulator), up to 200 messages per 24 hours and 1 message per second.

To send to real users, request production access in the SES console (Account dashboard > View Get set up page > Request production access), or from the CLI:

```bash
aws sesv2 put-account-details \
  --production-access-enabled \
  --mail-type TRANSACTIONAL \
  --website-url https://yourdomain.com \
  --contact-language EN \
  --region your-region
```

Verify your domain first; AWS says that speeds up approval. AWS Support sends an initial response within 96 hours. Until then, test with a verified recipient address.

---

## Common problems

### Symptom → fix

| Symptom | Likely cause | Fix |
|---|---|---|
| Deep links return a blank page or 404 | SPA rewrite rule missing or wrong type | Add `/<*>` → `/index.html` rewrite, type must be `404-200` not 301/302 |
| `/sitemap.xml` or `/site.webmanifest` returns the app's HTML | Regex-based `200` rewrite catches extensions missing from its allow-list (`.txt` is on it, `.xml` and `.webmanifest` are not) | Replace it with the `/<*>` → `/index.html` `404-200` rule |
| `VITE_API_URL` is `undefined` at runtime | Env var not set before build, or missing `VITE_` prefix | Set in Amplify Console, trigger a new build |
| Amplify build fails on Node.js 20+ syntax or engine checks | App still uses the Amazon Linux 2 build image or an old Node.js | Switch the build image to AL2023 and pin the version with `nvm install` in `amplify.yml` |
| CORS error on POST but not on GET | Preflight fails: `Content-Type` missing from allowed headers, or origin not listed exactly | Add `Content-Type` to `allowHeaders`; check the origin string (scheme, host, port, no trailing slash) |
| `Access-Control-Allow-Origin` contains multiple values | Function URL CORS config plus CORS headers returned by the handler | Remove CORS headers from the handler |
| CORS headers set in Lambda have no effect | HTTP API with `corsPreflight` ignores integration CORS headers | Change the `corsPreflight` config instead |
| CORS error with `localhost:*` | API Gateway does not support wildcard ports | List `http://localhost:5173` and `http://localhost:4173` explicitly |
| Function URL returns `403 Forbidden` with auth type `NONE` | Resource policy lacks `lambda:InvokeFunction` (required for new URLs since October 2025) | Upgrade `aws-cdk-lib` to 2.224.0 or later and redeploy |
| Lambda console warns the runtime is deprecated | `nodejs20.x` was deprecated April 30, 2026 | Change to `lambda.Runtime.NODEJS_24_X` and redeploy |
| Lambda times out on first request after inactivity | Cold start with 128 MB memory | Set `memorySize: 256` or higher in the Lambda definition |
| CDK deployed to wrong region | Stack has no `env`, so it used the CLI profile's region | Set `env: { account, region }` in `bin/app.ts` |
| `SSM parameter /cdk-bootstrap/hnb659fds/version not found` | Target account/region not bootstrapped | Run `npx cdk bootstrap aws://ACCOUNT_ID/REGION` |
| Custom certificate not selectable in Amplify | Certificate is not in `us-east-1` | Request or import it in ACM in `us-east-1` |
| Amplify managed certificate fails to renew | CNAME verification record was changed or deleted | Remove the domain in Amplify and add it again |
| SES authorization error | Sending from address does not match verified identity | Verify the exact domain or subdomain the `From` address uses |
| SES rejects sends to some recipients even though the `From` identity is verified | Account is still in the SES sandbox, which only allows verified recipients | Request SES production access in the SES console; until then, verify each test recipient |

### Finding Amplify build logs

In the Amplify Console, open your app, select the failing deployment from the build history, and expand each build phase (preBuild, build, postBuild). The log for each phase is fully scrollable. If the build fails before the `build` phase, check `preBuild`  -  a missing `npm ci` or wrong Node.js version shows up there.

### Diagnosing CORS errors

1. Open browser DevTools > Network tab.
2. Find the failing request. If the preflight `OPTIONS` request is shown separately and fails, the issue is in the CORS config: check that the origin is listed exactly and that `Content-Type` is in the allowed headers.
3. If OPTIONS succeeds but the POST still fails with a CORS error, check the POST status. A 500 or 502 means the function threw; check CloudWatch Logs.
4. If no CORS header appears at all on the POST response, the Lambda function threw an error before returning headers. Check Lambda logs in CloudWatch.

### Detecting Lambda timeout

In CloudWatch Logs, a timeout looks like:

```
REPORT RequestId: ... Duration: 10000.00 ms  Billed Duration: 10000 ms ...
Task timed out after 10.00 seconds
```

The duration matches the configured timeout exactly. If you see this, either increase `timeout` in the CDK definition or investigate what the Lambda is waiting on (SES call, DynamoDB query, external HTTP request).
