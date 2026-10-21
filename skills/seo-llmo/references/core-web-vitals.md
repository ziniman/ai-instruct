## Core Web Vitals

Applies when: site targets Google search ranking, or is a SPA.

Core Web Vitals are Google ranking signals measured in the field (real user data via Chrome). The three metrics as of 2026:

- **LCP (Largest Contentful Paint):** Time until the largest visible content element loads. Target: under 2.5 seconds. Common causes of poor LCP: large unoptimized hero images, render-blocking resources, slow server response.
- **CLS (Cumulative Layout Shift):** Visual instability from elements moving after initial render. Target: under 0.1. Common causes: images without explicit `width`/`height`, ads injecting content, late-loading fonts.
- **INP (Interaction to Next Paint):** Replaced FID (First Input Delay) in March 2024. Measures the latency of all user interactions throughout the page visit, not just the first. Target: under 200 ms. Common causes in SPAs: heavy JavaScript on the main thread, large React re-renders on input events.

INP is the most impactful change for SPA developers  -  FID only measured the first interaction, making it easy to pass while the app remained sluggish. INP catches ongoing interaction delays.

### LCP quick wins

**Image format and sizing:** Convert images to AVIF (supported in Chrome 85+, Firefox 93+, Safari 16+). AVIF consistently achieves 90-95% size reduction over JPEG for photographic content at equivalent visual quality. On macOS: `sips -s format avif input.jpg --out output.avif`. Cross-platform: `squoosh`, `sharp`, or `cwebp` for WebP.

Serve images at 2x the display size, not the original upload resolution. A 5000px image used as a decorative background is visually identical to a 1920px version at a fraction of the weight. Use `sips -Z 1920 input.jpg` to resize before converting.

For CSS `background-image` (inline styles or Tailwind `bg-*`), there is no `<picture>` element available for format negotiation, so use AVIF directly. Browser support for modern audiences is effectively universal.

**Font loading:** If using Google Fonts, load them from `index.html` with preconnect hints, not via `@import` inside component CSS or inline `<style>` tags. An `@import` inside JS-rendered styles means the browser cannot start the font download until after the JS bundle executes, adding 300-450ms to the critical path:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=YourFont&display=swap" />
```

Check your scores: [PageSpeed Insights](https://pagespeed.web.dev/) (field + lab data) and [Google Search Console](https://search.google.com/search-console/) > Core Web Vitals report (field data only, requires traffic).
