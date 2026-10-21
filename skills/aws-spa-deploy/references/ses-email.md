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

- **Reserved concurrency (function URL path).** Add `reservedConcurrentExecutions: 2` to the `lambda.Function` props as a hard cap on simultaneous executions. Sustained throughput is then roughly the reserved concurrency divided by the average invocation time (two executions of a 500 ms SES call handle about 4 requests per second; Lambda also never exceeds 10 requests per second per unit of concurrency), and requests beyond the cap are throttled with a 429. It costs nothing, but you can only reserve up to your unreserved account concurrency minus 100, and new accounts start with reduced concurrency quotas, so check Service Quotas > AWS Lambda > Concurrent executions first or the deploy fails.
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
