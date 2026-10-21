## Measurement and Validation

Run these after deploying changes. One tool per concern.

### Before making changes

- [PageSpeed Insights](https://pagespeed.web.dev/) - run on the target URL first to establish a baseline. Note the LCP element type, TTFB, the insights and diagnostics flagged, and whether field data is available. Run both mobile and desktop tabs.

### Lab data (synthetic, instant results)

- [PageSpeed Insights](https://pagespeed.web.dev/) - Lighthouse score, lab metrics, insights, and diagnostics. As of 2026 it runs Lighthouse 13, which replaced the older "opportunity" audits with insight audits shared with the DevTools Performance panel (for example "LCP request discovery", "Render-blocking requests", "Legacy JavaScript", "3rd parties", "Use efficient cache lifetimes"). If a tutorial or CI script references an old audit ID such as `render-blocking-resources` or `uses-rel-preconnect`, it no longer exists. The performance score is weighted TBT 30%, LCP 25%, CLS 25%, First Contentful Paint (FCP) 10%, Speed Index 10%; INP is not part of the lab score.
- [WebPageTest](https://www.webpagetest.org/) - waterfall view of all requests, shows what is blocking, filmstrip view of visual loading. More diagnostic than PageSpeed Insights for root-cause analysis. Use the "Redirect Chains" view to confirm redirect consolidation.
- Bundler analysis (`npx next analyze`, `ANALYZE=true npm run build`, or `rollup-plugin-visualizer`) - treemap of what is in each JavaScript bundle

### Field data (real users, requires traffic)

- [Google Search Console](https://search.google.com/search-console/) > Core Web Vitals - aggregate CrUX data by URL group. Only shows pages with sufficient traffic. The most authoritative source for ranking-relevant scores.
- [PageSpeed Insights](https://pagespeed.web.dev/) - shows CrUX field data for the specific URL if it has enough traffic (28-day window)

### Network and runtime inspection

```bash
# Check redirect chain (count Location: headers before 200)
curl -IL https://yourdomain.com/

# Check cache headers on static assets
curl -I https://yourdomain.com/assets/main-abc123.js

# Verify Cache-Control on HTML pages (should be no-cache)
curl -I https://yourdomain.com/

# Confirm no third-party auth JS on public pages (example: search for 'clerk')
curl -s https://yourdomain.com/ | grep -i clerk

# Check that next/image is generating WebP
curl -I "https://yourdomain.com/_next/image?url=%2Fimages%2Fhero.png&w=1200&q=75"
```

### In-browser tools

- Chrome DevTools > Network tab: filter by JS, CSS, or Font to see sizes and cache status. The "Size" column shows the transferred size vs. the decoded size - a large gap indicates good compression.
- Chrome DevTools > Performance tab: shows your local LCP and CLS live as soon as it opens, and INP once you interact with the page. Under "Field data", connect it to CrUX to compare your local numbers with real-user data for the URL. Record a page load or interaction to see long tasks (red bars), their stack traces, and the same insights PageSpeed Insights reports. Long tasks above 50 ms contribute to INP.
- Chrome DevTools > Lighthouse tab: run locally against `localhost` during development for instant feedback without deploying.

### Continuous monitoring

Set up alerts in Google Search Console for Core Web Vitals regressions. Search Console sends email notifications when a URL group drops from "Good" to "Needs improvement."

For real-user measurement when CrUX data is insufficient (low traffic), or to see non-Chrome users that CrUX excludes, use the `web-vitals` npm package (v5 as of 2026). `onLCP` and `onINP` report in Chromium, Firefox, and Safari 26.2+; `onCLS` reports in Chromium only. Expect RUM numbers to differ from CrUX because the browser mix differs:

```js
// Works in any framework - wire to your analytics endpoint
import { onLCP, onCLS, onINP } from 'web-vitals';

onLCP(({ name, value, rating }) => {
  sendToAnalytics({ name, value, rating });
});
onCLS(({ name, value, rating }) => {
  sendToAnalytics({ name, value, rating });
});
onINP(({ name, value, rating }) => {
  sendToAnalytics({ name, value, rating });
});
```
