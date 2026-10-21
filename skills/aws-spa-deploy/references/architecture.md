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
