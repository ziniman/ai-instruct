## Checklist

### Before deploying a new page or feature

- [ ] LCP element identified (image or text) before optimizing
- [ ] Images have explicit `width` and `height` attributes; `sizes` attribute set for responsive images
- [ ] Above-the-fold (LCP) image is in the server-rendered HTML, is not lazy-loaded, and has `fetchpriority="high"` (`fetchPriority="high"` plus `loading="eager"` on `next/image`; `priority` only on Next.js 15 and earlier)
- [ ] Web fonts loaded via self-hosting or preconnect hints, not `@import` in CSS
- [ ] Heavy dependencies checked in the bundle analyzer - dynamic import if they add > 20 KB gzipped
- [ ] Third-party scripts scoped to the routes that need them, not the root layout
- [ ] `browserslist` set in `package.json` if not already present
- [ ] Dynamic class name assembly avoided (full class name literals in source)
- [ ] `preconnect` hints added in `<head>` for third-party origins that load within 2 seconds; `dns-prefetch` for later-loading origins; `crossorigin` attribute present on font origin preconnects
- [ ] Analytics and tag managers load with `defer` or `async` (not blocking), and a self-written GTM loader keeps the `gtm.js` dataLayer push; chat widgets, video players, and heatmaps deferred to user interaction or `requestIdleCallback`
- [ ] LCP image preload used only when the image is discovered late (CSS background, JS-set `src`); if used, it is in `<head>` and has `fetchpriority="high"`
- [ ] If critical CSS is inlined, CSP `style-src` directive allows it via `'unsafe-inline'`, per-request nonce, or SHA-256 hash
- [ ] No `unload` listeners; HTML not served with `no-store` unless it holds sensitive data (bfcache eligible)
- [ ] For multi-page sites: speculation rules added with `moderate` or `conservative` eagerness, excluding logout, cart, and other side-effect URLs

### After deploying to production

- [ ] PageSpeed Insights run on the changed URL - mobile and desktop
- [ ] LCP, CLS, INP in "Good" range (or no regression from baseline)
- [ ] Cache headers confirmed on static assets: `public, max-age=31536000, immutable`
- [ ] Cache headers confirmed on HTML pages: `no-cache` (`no-store` only on sensitive pages)
- [ ] Text responses served with Brotli or zstd (`content-encoding` header checked with `curl`)
- [ ] Back/forward cache verified in Chrome DevTools > Application > Back/forward cache
- [ ] Redirect chain verified: one redirect maximum before 200 (`curl -IL https://yourdomain.com/`)
- [ ] Third-party scripts not loading on pages that don't require them
- [ ] No console errors related to image sizing or missing `alt` attributes
