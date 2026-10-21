## Static Hosting Notes

### AWS Amplify

- Files in `public/` (Vite) are copied to `dist/` and served as-is
- Amplify's SPA rewrite rule (`/<*> -> /index.html` with 404→200) only fires when no matching file exists  -  `robots.txt`, `sitemap.xml`, and `llms.txt` are served directly without triggering the rewrite
- No additional config needed for new static files placed in `public/`
- That same SPA rule returns `index.html` with status 200 for missing agent discovery paths. Amplify applies rules from the top of the list down, so add a `404` rule **above** the SPA rule that sends `/.well-known/` misses to a Markdown 404 file (put `404.md` in `public/`):

```json
[
  {
    "source": "/.well-known/<*>",
    "status": "404",
    "target": "/404.md",
    "condition": null
  },
  {
    "source": "/<*>",
    "status": "404-200",
    "target": "/index.html",
    "condition": null
  }
]
```

Amplify's docs describe the `404` type as showing the target page for addresses that don't exist, so files you do publish under `/.well-known/` (such as `agent-skills/index.json`) should still be served. After deploying, re-run the curl check above and confirm a file you do publish still returns 200.

### CloudFront + S3

Upload static files to the S3 bucket root. Set explicit `Content-Type` metadata on each object  -  S3 does not infer content type reliably:

| File | Content-Type |
|------|--------------|
| `robots.txt` | `text/plain` |
| `sitemap.xml` | `application/xml` |
| `llms.txt` | `text/plain` |
| `llms-full.txt` | `text/plain` |
| `*.md` (Markdown alternates) | `text/markdown; charset=utf-8` |
| `.well-known/agent-skills/index.json` | `application/json; charset=utf-8` |
| `.well-known/agent-card.json` (if you publish one) | `application/json; charset=utf-8` |
| `.well-known/ai-catalog.json` (if you publish one) | `application/ai-catalog+json` |

If `Content-Type` is wrong, crawlers may reject the file even when the content is valid.

**Keep `/.well-known/` misses as real 404s.** SPA setups often add a custom error response that maps 403/404 to `/index.html` with status 200. Custom error responses are set on the distribution, not per cache behavior, so they catch `/.well-known/` too. A CloudFront Function that returns a 400-or-above status bypasses custom error pages for that status, so answer the protocol paths you don't serve directly in your `viewer-request` function, before the Markdown rewrite logic:

```javascript
// Protocol discovery paths this site does not serve
var NOT_SERVED = ['/.well-known/agent-card.json', '/.well-known/ai-catalog.json', '/.well-known/mcp/server-card.json'];

function handler(event) {
  var request = event.request;
  if (NOT_SERVED.indexOf(request.uri) !== -1) {
    return {
      statusCode: 404,
      statusDescription: 'Not Found',
      headers: { 'content-type': { value: 'text/markdown; charset=utf-8' } },
      body: '# Not found\n\nThis site does not run an A2A agent or an MCP server.\nSee https://yourdomain.com/llms.txt for what is available.\n'
    };
  }
  return request; // in production, merge this check into the Markdown handler above (one viewer-request function per behavior)
}
```

Remove a path from `NOT_SERVED` when you start publishing that file.

### Netlify / Vercel

Files in `public/` (or `static/` in some frameworks) are served automatically with correct content types. No additional config needed.
