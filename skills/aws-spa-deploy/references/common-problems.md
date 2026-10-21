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
