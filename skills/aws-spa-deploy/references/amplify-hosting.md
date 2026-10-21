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

Tailor the CSP to every third-party script the site loads; `default-src 'self'` blocks all of them. For Google Analytics 4 without Ads features, Google's [CSP guide](https://developers.google.com/tag-platform/security/guides/csp) (as of 2026) adds these sources, and the inline gtag snippet also needs a hash of its contents (or a server-generated nonce) in `script-src`:

```text
script-src 'self' 'sha256-HASH_OF_INLINE_GTAG_SNIPPET' https://www.googletagmanager.com;
img-src 'self' https://www.googletagmanager.com https://*.google-analytics.com;
connect-src 'self' https://your-api-url.amazonaws.com https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com
```

A static Amplify site cannot generate per-request nonces, so use the hash: Chrome DevTools prints the exact `sha256-...` value in the console error for the blocked inline script. Recompute it whenever the snippet changes. Google Ads, Tag Manager, and GTM Preview Mode need further hosts listed in Google's guide; check Tag Assistant for anything still blocked.
