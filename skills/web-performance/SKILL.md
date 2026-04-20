---
name: web-performance
description: 'Use this skill whenever the user is improving Core Web Vitals or page load performance, or mentions slow pages, PageSpeed Insights / Lighthouse failures, LCP/CLS/INP scores, bundle size, image/font optimization, or third-party script impact. Covers Core Web Vitals, image and font optimization, JavaScript bundle size, CSS build size, CDN caching, third-party JavaScript impact, and measurement tools. Skip for backend latency tuning, database query optimization, or CI build speed.'
---

# Web Performance Guide

> Applies to: Any website or web app | Updated: March 2026

A practical reference for measuring and improving web performance - covering Core Web Vitals, image and font optimization, JavaScript bundle size, CSS build size, CDN caching, third-party JavaScript impact, and validation tools.

---

## Section 0: Before You Start

Answer these questions before making any performance changes. Each has a default - use it if the user hasn't said otherwise.

**Q: Which pages are the priority targets?**
(landing page, dashboard, auth-gated app pages, all pages)
Default: public-facing pages first - these are indexed by search engines and directly affect user experience. Auth-gated pages matter less for Core Web Vitals field data because CrUX only collects data from logged-in users on those routes.

**Q: What is the current performance baseline?**
Default: unknown - run PageSpeed Insights on the target URL before making any changes, so you have a before/after comparison. Note the LCP element type (image or text), TTFB, and the specific audits flagged as failing.

**Q: Are you optimizing for lab scores (Lighthouse) or field data (real users)?**
Default: both - but prioritize fixing field data issues flagged in Google Search Console > Core Web Vitals first. Lab scores are easier to game; field data reflects real users on real devices and networks.

**Q: What framework or rendering model is the site using?**
(plain HTML, SPA/Vite, Next.js App Router, Astro, Nuxt, WordPress)
Default: detect from config files (`next.config.*`, `vite.config.*`, `astro.config.*`) if visible; otherwise assume plain HTML. Framework-specific advice is in clearly labeled subsections throughout this guide.

**Q: What image formats are currently in use?**
Default: JPEG/PNG - check the `public/` or `assets/` directory and any image references in source before assuming.

**Q: How are web fonts loaded?**
(Google Fonts via `<link>`, `@import` in CSS, self-hosted, framework font utility)
Default: check the HTML `<head>` and any global CSS files before assuming.

**Q: Is a CDN or hosting platform configured with custom cache headers?**
Default: no - most platforms (AWS Amplify, plain S3, some shared hosts) do not set long-lived cache on static assets by default. Check the hosting config before assuming.

**Q: Is a `browserslist` target configured?**
Default: no - without it, many transpilers and bundlers use a conservative target and ship legacy polyfills for features that modern browsers have supported for years.

> **AI assistant:** Read the user's answers (or use the defaults above) before generating any code. Run PageSpeed Insights first if no baseline exists. Identify the LCP element type before optimizing images - if the LCP element is a `<p>` or `<h1>`, TTFB and render-blocking CSS reduction matter more than image optimization. Skip framework-specific subsections that don't match the user's stack.

---

## Contents

1. [Core Web Vitals Overview](#core-web-vitals-overview)
2. [LCP: Largest Contentful Paint](#lcp-largest-contentful-paint)
3. [CLS: Cumulative Layout Shift](#cls-cumulative-layout-shift)
4. [INP: Interaction to Next Paint](#inp-interaction-to-next-paint)
5. [Image Optimization](#image-optimization)
6. [Font Loading](#font-loading)
7. [JavaScript Bundle Size](#javascript-bundle-size)
8. [Legacy JavaScript and Browser Targets](#legacy-javascript-and-browser-targets)
9. [Third-Party JavaScript](#third-party-javascript)
10. [CSS Build Size](#css-build-size)
11. [CDN and Caching](#cdn-and-caching)
12. [Measurement and Validation](#measurement-and-validation)

---

## Core Web Vitals Overview

Applies when: any public-facing page.

Core Web Vitals are Google's user-experience metrics, measured in the field via the Chrome User Experience Report (CrUX). They are ranking signals. The three metrics as of 2026:

| Metric | Measures | Good | Needs improvement | Poor |
|---|---|---|---|---|
| **LCP** | Loading speed of the largest visible element | < 2.5 s | 2.5 - 4 s | > 4 s |
| **CLS** | Visual instability from layout shifts | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **INP** | Responsiveness of all interactions | < 200 ms | 200 - 500 ms | > 500 ms |

INP replaced FID (First Input Delay) in March 2024. FID only measured the first interaction; INP measures every interaction throughout the visit. A page that passes INP must remain responsive throughout the entire session, not just at initial load.

Field data appears in Google Search Console after a URL accumulates enough traffic. Until then, use PageSpeed Insights lab data (Lighthouse) as a proxy.

---

## LCP: Largest Contentful Paint

Applies when: any page with a hero section, large image, or above-the-fold text block.

**Identify the LCP element before optimizing.** The LCP element is not always an image. On text-heavy marketing pages it is often a `<p>` or `<h1>`. When the LCP element is text, the highest-impact fixes are TTFB reduction and eliminating render-blocking CSS - not image optimization.

> **Real-world example:** On a marketing home page, PageSpeed Insights identified the LCP element as a `<p>` paragraph tag, not an image. TTFB was 610 ms and element render delay was 230 ms. The correct optimization targets were redirect chains (adding 607 ms before the first byte) and render-blocking CSS chunks - not image format conversion.

### Eliminate render-blocking resources

Render-blocking resources delay the LCP element from painting. CSS files loaded as `<link rel="stylesheet">` in `<head>` block rendering until they download and parse.

> **Real-world example:** PageSpeed Insights flagged two render-blocking CSS chunks on a marketing page - 13.6 KiB and 1.2 KiB - adding approximately 400 ms to LCP. These were a global stylesheet and a component stylesheet generated by the framework's default CSS chunking behavior.

**Universal approach:** Inline critical CSS (the styles needed to render above-the-fold content) directly into the HTML `<head>`. Load the rest of the stylesheet asynchronously:

```html
<style>
  /* Critical CSS: only styles needed for the above-the-fold content */
  body { margin: 0; font-family: system-ui, sans-serif; }
  .hero { ... }
</style>
<link rel="stylesheet" href="/styles.css" media="print" onload="this.media='all'" />
<noscript><link rel="stylesheet" href="/styles.css" /></noscript>
```

#### Next.js App Router

Next.js 15 generates separate CSS chunks for `globals.css` and component styles. Two experimental options reduce or eliminate the render-blocking effect:

**Option 1: Enable CSS inlining.**
The `experimental.inlineCss` flag embeds CSS directly into the HTML `<head>` instead of linking external files, eliminating separate CSS download requests:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },
};
```

This is experimental as of Next.js 15. Test in staging before deploying. Real-world reports show Lighthouse scores improving from 94 to 100 after enabling this flag.

**Option 2: Use `cssChunking: 'strict'`.**
Loads CSS in exact import order, which can reduce out-of-order loading penalties:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    cssChunking: 'strict',
  },
};
```

`inlineCss` is the stronger fix for LCP. Neither fully resolves render-blocking CSS in Next.js 15; this is a known framework-level issue tracked in the Next.js repository.

### Reduce server response time (TTFB)

A slow Time to First Byte delays everything downstream.

**Universal strategies:**
- Serve static pages from a CDN edge node close to the user
- Avoid redirect chains before the HTML response (see [CDN and Caching](#cdn-and-caching))
- Cache rendered pages where content does not change per-request

#### Next.js App Router

Server Components that await slow database queries block initial HTML delivery:

- Move non-critical data fetching into child Server Components so the page shell renders immediately
- Use `loading.tsx` (React Suspense boundaries) to stream the shell while data loads
- Add `unstable_cache` or `cache()` to repeated queries that don't need to be fresh on every request

```tsx
import { Suspense } from 'react';

// Shell renders immediately; DataList streams in when data is ready
export default function Page() {
  return (
    <main>
      <h1>Page Title</h1>
      <Suspense fallback={<ListSkeleton />}>
        <DataList />
      </Suspense>
    </main>
  );
}
```

### Preload the LCP image

When the LCP element is an image, add an explicit preload hint so the browser fetches it as early as possible:

```html
<link rel="preload" as="image" href="/images/hero.webp" />
```

Only preload the LCP element. Adding preload hints to multiple images creates competing requests and can worsen LCP.

#### Next.js App Router

For images rendered via `next/image`, use the `priority` prop - it generates the preload link automatically and disables lazy loading:

```tsx
import Image from 'next/image';

<Image
  src="/images/hero.webp"
  alt="Hero image"
  width={1200}
  height={630}
  priority
/>
```

---

## CLS: Cumulative Layout Shift

Applies when: any page with images, dynamically loaded content, or web fonts.

CLS measures how much the page layout shifts after initial render. Shifts are jarring and cause accidental taps on mobile.

### Always set image dimensions

Every `<img>` must have explicit `width` and `height` attributes. Without these, the browser does not reserve space for the image, causing a layout shift when it loads:

```html
<!-- Correct: browser reserves space before image loads -->
<img src="/images/product.webp" alt="Product name" width="800" height="450" />

<!-- Wrong: no reserved space, layout shifts on load -->
<img src="/images/product.webp" alt="Product name" />
```

For images that fill their container (unknown intrinsic dimensions), use CSS `aspect-ratio` on the container:

```css
.image-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
```

### Avoid injecting content above existing content

Elements that load after the initial render and push content down cause high CLS. Common causes:

- Auth user interface components (avatar, username) rendering after hydration - reserve space with a fixed-size skeleton
- Toast notifications that push content down instead of overlaying it - use an overlay-based notification library positioned at the screen edge
- Ad or analytics scripts that inject banners - avoid this; if unavoidable, reserve the space before the script loads

### Stabilize font loading

Web fonts that load after the initial render cause text to reflow (FOUT: Flash of Unstyled Text). Use `font-display: optional` for body fonts to avoid shifts, or `font-display: swap` if the FOUT is visually acceptable.

---

## INP: Interaction to Next Paint

Applies when: any page with user interactions - especially dashboards, data-entry forms, and interactive app flows.

INP measures how quickly the browser responds to every tap, click, or key press. A 200 ms response budget is tight on slow devices.

### DOM size and INP

Larger DOM trees slow down style recalculation, layout, and paint operations that happen during every interaction. Google recommends fewer than 1,500 DOM nodes, a maximum depth of 32, and no more than 60 children per parent node.

> **Real-world example:** PageSpeed Insights measured 366 DOM nodes and a maximum depth of 13 on a marketing home page. At this scale the impact is minor, but it establishes a baseline to watch as the page grows. For pages with deeply nested component trees or large data tables, DOM size becomes a meaningful INP contributor.

### Long main-thread tasks

Any synchronous operation over 50 ms on the main thread will cause high INP for interactions that happen during or just after it. Long tasks appear in PageSpeed Insights under "Avoid long main-thread tasks" and in the Chrome DevTools Performance tab as red-marked task bars.

> **Real-world example:** PageSpeed Insights identified three long main-thread tasks on a marketing page: 80 ms and 64 ms from own JavaScript, and 60 ms from a third-party auth initialization script. The own-JS tasks should be profiled in Chrome DevTools Performance tab to identify the specific call stacks. The third-party task is addressed in [Third-Party JavaScript](#third-party-javascript).

### Debounce expensive input handlers

Text inputs that trigger live validation, filtering, or search on every keystroke create large INP values. Use `useDeferredValue` (React) or `debounce` to defer expensive work:

```tsx
import { useDeferredValue, useState } from 'react';

function SearchFilter({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // filteredItems uses the deferred value - won't block the input response
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(deferredQuery.toLowerCase())
  );

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ItemList items={filteredItems} />
    </>
  );
}
```

For non-React setups, use a debounce helper:

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

input.addEventListener('input', debounce(handleSearch, 150));
```

### Break up long synchronous tasks

Use `scheduler.yield()` (or `setTimeout(fn, 0)` as a fallback) to yield control back to the browser between chunks of work:

```js
async function processInChunks(items) {
  const CHUNK_SIZE = 100;
  const results = [];

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    results.push(...chunk.map(processItem));

    // Yield to the browser between chunks
    if ('scheduler' in window && 'yield' in window.scheduler) {
      await window.scheduler.yield();
    } else {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return results;
}
```

### Optimistic UI for slow server operations

Server requests that take more than 200 ms to return will cause the UI to appear frozen if button state is tied to the request's completion. Apply optimistic updates immediately and reconcile with the server response afterward:

```tsx
'use client';
import { useOptimistic, useTransition } from 'react';

function ToggleStatus({ item }: { item: Item }) {
  const [optimisticActive, setOptimisticActive] = useOptimistic(item.isActive);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      setOptimisticActive(!optimisticActive);
      await toggleItemAction(item.id);
    });
  }

  return (
    <button onClick={handleToggle} disabled={isPending}>
      {optimisticActive ? 'Active' : 'Inactive'}
    </button>
  );
}
```

---

## Image Optimization

Applies when: any page with images.

### Use an image component or build-time processing

Framework image components and build-time tools handle format conversion, responsive sizing, and lazy loading automatically. Use them instead of plain `<img>` tags for content images.

| Approach | Tools |
|---|---|
| Next.js | `next/image` - converts to WebP/AVIF, lazy loads, generates `srcset` |
| Vite / SPA | `vite-imagetools`, `@unpic/react`, or manual pre-conversion |
| Astro | `<Image>` component built into Astro core |
| Plain HTML | Pre-convert images to WebP/AVIF using `sharp`, `squoosh`, or `sips` |

#### Next.js App Router

```tsx
import Image from 'next/image';

<Image
  src="/images/hero.png"
  alt="Hero image"
  width={800}
  height={450}
  // sizes tells the browser which image to fetch at which viewport width
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
  placeholder="blur"
  blurDataURL="data:image/png;base64,..."
/>
```

The `sizes` attribute is the most commonly missed configuration. Without it, the image is generated at full width for every viewport, wasting bandwidth on mobile.

For images loaded from external sources (S3, a CDN, a third-party service), configure allowed domains:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-bucket.s3.amazonaws.com',
        pathname: '/uploads/**',
      },
    ],
  },
};
```

### Source format recommendations

| Source material | Recommended format | Notes |
|---|---|---|
| Photographs | WebP or AVIF | AVIF achieves 90-95% size reduction over JPEG at equivalent quality |
| Logos, icons | SVG | Inline SVG or `<img src="*.svg">` - bypass image processing for SVG |
| Screenshots | WebP | PNG source is fine; let the image tool convert |
| Animated content | WebP or AVIF (animated) | Avoid GIF; file sizes are 5-10x larger than equivalent WebP |

Keep the highest-quality source and let the image tool handle conversion. Pre-converting lossy-to-lossy degrades quality unnecessarily.

### Lazy loading and above-the-fold images

Lazy load all images below the fold. For images visible in the initial viewport without scrolling, disable lazy loading and add a preload hint:

```html
<!-- Above-the-fold LCP image: eager loading + preload -->
<link rel="preload" as="image" href="/images/hero.webp" />
<img src="/images/hero.webp" alt="..." loading="eager" width="1200" height="630" />

<!-- Below-the-fold images: lazy loading (default in modern browsers) -->
<img src="/images/product.webp" alt="..." loading="lazy" width="400" height="300" />
```

---

## Font Loading

Applies when: any page using custom web fonts.

### Prefer self-hosted fonts over Google Fonts CDN

Serving fonts from your own domain eliminates the external DNS lookup and connection to a third-party CDN. Self-hosted fonts load from the same origin as your HTML, which is almost always faster.

#### Next.js App Router

`next/font` self-hosts fonts automatically, eliminating the external network request to Google Fonts. It inlines the `@font-face` CSS and generates a preload hint:

```tsx
// src/app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

#### Vite / SPA

Use `fontsource` packages to bundle fonts with your build output:

```bash
npm install @fontsource/inter
```

```js
// main.js / main.ts
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
```

#### Plain HTML

Self-host font files in your static directory and reference them with `@font-face` in CSS. Add a `<link rel="preload">` hint in `<head>` for the most critical font weight:

```html
<link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin />
```

### font-display strategy

| Value | Behavior | Use when |
|---|---|---|
| `swap` | Invisible text until font loads, then swap | Headlines; FOUT is acceptable |
| `optional` | Browser uses fallback if font doesn't load in ~100 ms | Body text; eliminates CLS |
| `block` | Invisible text for up to 3 seconds | Never, for performance |

For body text that spans multiple lines, `optional` eliminates CLS entirely but means the custom font may not render on slow connections. `swap` is the better choice for branding-critical fonts.

### Avoid @import in CSS

Never load fonts via `@import` inside a `.css` file or a `<style>` block rendered by JavaScript. The browser cannot discover the font URL until the CSS is parsed, which adds 300-500 ms to the critical path on slow connections:

```css
/* Wrong: delays font discovery */
@import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');
```

If Google Fonts is required, load it from `<head>` with preconnect hints:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap" />
```

---

## JavaScript Bundle Size

Applies when: any site with a JavaScript build step.

### Measure before optimizing

Use your bundler's analysis tools to identify what is in each bundle before making changes.

#### Next.js App Router

```bash
npm install --save-dev @next/bundle-analyzer
```

```ts
// next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer';

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
```

```bash
ANALYZE=true npm run build
```

#### Vite / SPA

```bash
npm run build -- --reporter treemap
```

Or use `rollup-plugin-visualizer`:

```bash
npm install --save-dev rollup-plugin-visualizer
```

```js
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [visualizer({ open: true })],
};
```

### Code-split heavy components

Avoid loading code that is not needed for the initial render:

```js
// Vanilla JS / any bundler
const { heavyFunction } = await import('./heavy-module.js');
```

```tsx
// React with Next.js
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
  ssr: false,
});
```

```tsx
// React without Next.js
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

<Suspense fallback={<div>Loading...</div>}>
  <HeavyChart />
</Suspense>
```

### Avoid importing entire libraries

Importing a full library to use one function includes the entire library in the bundle:

```js
// Wrong: imports all of lodash (~70 KB gzipped)
import _ from 'lodash';
const result = _.groupBy(items, 'category');

// Correct: imports only groupBy (~1 KB gzipped)
import groupBy from 'lodash/groupBy';
const result = groupBy(items, 'category');
```

Prefer libraries that support tree-shaking (ES module exports with named exports). Verify tree-shaking is working by checking the bundle output after import.

### Next.js App Router: Server Components reduce client bundle

In Next.js App Router, every component defaults to a Server Component. Server Components run only on the server - their code is never sent to the browser. This is the single most impactful bundle size optimization in the App Router.

Common mistake: adding `'use client'` to components that don't need it (no event handlers, no hooks, no browser APIs). Audit `'use client'` directives and remove them where not required.

---

## Legacy JavaScript and Browser Targets

Applies when: any site with a JavaScript build step.

Without a defined browser target, most transpilers and bundlers default to a conservative target and ship polyfills for JavaScript features that modern browsers have natively supported since 2020-2021. These add roughly 10-20 KiB of dead weight to every page.

> **Real-world example:** PageSpeed Insights flagged 13 KiB of legacy polyfills on a marketing page: `Array.prototype.at`, `.flat`, `.flatMap`, `Object.fromEntries`, `Object.hasOwn`, and `String.prototype.trimEnd`/`trimStart`. The root cause was no `browserslist` config in `package.json` - the bundler defaulted to a conservative target. Fix: add a `browserslist` entry targeting Chrome 109+, Firefox 115+, Safari 15.6+. The bundler then skips polyfills for features those browsers support natively, eliminating all 13 KiB.

`browserslist` is a shared config format supported by most tools (Babel, SWC, PostCSS, ESLint). Add it to `package.json`:

```json
{
  "browserslist": [
    "Chrome >= 109",
    "Firefox >= 115",
    "Safari >= 15.6",
    "Edge >= 109"
  ]
}
```

Choose targets that match your actual user base. The targets above cover browsers released in late 2022 and later. Check your analytics data before tightening further.

### Next.js / SWC

SWC respects `browserslist` in Next.js 15 without any additional configuration. The old `experimental.browsersListForSwc` and `experimental.legacyBrowsers` flags have been removed - `browserslist` in `package.json` is the current mechanism.

**Important caveat:** A correct `browserslist` entry is necessary but not always sufficient in Next.js. Next.js maintains its own internal polyfill layer (`@next/polyfill-nomodule`) that may inject polyfills independently of your `browserslist` config. If PageSpeed Insights continues to flag legacy polyfills after setting `browserslist`, verify which bundle they originate from using the bundle analyzer.

Common polyfills that appear unnecessarily in Next.js output even with a modern `browserslist`:

- `Array.prototype.at`, `Array.prototype.flat`, `Array.prototype.flatMap`
- `Object.fromEntries`, `Object.hasOwn`
- `String.prototype.trimEnd`, `String.prototype.trimStart`

These are Baseline Widely Available features with full support in Chrome 109+, Firefox 115+, and Safari 15.6+. No polyfill is needed when targeting those versions. If the bundle analyzer shows these polyfills sourcing from `@next/polyfill-nomodule` rather than your own code, open an issue against the Next.js repo or pin a version that resolves it.

### Vite / esbuild

Vite's `build.target` option sets the transpile target directly. For consistency across all tools, set `browserslist` in `package.json` and use `browserslist:defaults` as the Vite target:

```ts
// vite.config.ts
export default {
  build: {
    target: 'es2022', // Or use browserslist query: 'browserslist:modern'
  },
};
```

### Babel

Babel reads `browserslist` automatically when `@babel/preset-env` is configured with `useBuiltIns: 'usage'`:

```json
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3
    }]
  ]
}
```

---

## Third-Party JavaScript

Applies when: any page that loads scripts from external services (analytics, auth, chat, ads, video embeds).

Third-party scripts are one of the most common performance problems on real-world pages. A single third-party script can add hundreds of kilobytes and 50-100+ ms of main-thread work to every page load.

### Measure the impact first

Before optimizing, measure which third-party scripts are loading and what they cost:

- PageSpeed Insights "Reduce the impact of third-party code" audit lists each script and its transfer size and main-thread blocking time
- Chrome DevTools > Network tab filtered by "third-party" (enable the "domain" column)
- WebPageTest > "Third-party summary" view

### Load third-party scripts only where needed

The single highest-impact fix is to stop loading scripts on pages that don't need them. A chat widget on your pricing page does not need to load on every blog post. An auth script does not need to load on unauthenticated marketing pages.

Scope third-party script loading to the routes that require the functionality:

```html
<!-- Wrong: loaded on every page via a shared layout -->
<script src="https://third-party-service.com/widget.js" defer></script>
```

```html
<!-- Correct: loaded only in the template for pages that use it -->
<!-- e.g. add to checkout.html but not blog.html -->
<script src="https://third-party-service.com/widget.js" defer></script>
```

In component-based frameworks, import or mount the third-party component only in the routes that need it, not in the root layout.

> **Real-world example:** PageSpeed Insights measured 305 KiB of auth provider JavaScript loading on a public marketing page, with 185 KiB unused. The root cause was the auth provider's wrapper component placed in the root layout, wrapping all routes. Fix: moved the auth provider wrapper out of the root layout and into only the layout files that need auth (dashboard, auth sign-in/sign-up, onboarding). Public marketing pages then load zero auth JavaScript, and the 60 ms auth initialization main-thread task disappears entirely from those pages.

#### Clerk v6 (Next.js App Router)

Move `<ClerkProvider>` out of the root `layout.tsx` and into only the route groups that need auth:

```
src/app/
  layout.tsx                <- root layout: NO ClerkProvider
  (marketing)/
    layout.tsx              <- no ClerkProvider needed
    page.tsx
  (dashboard)/
    layout.tsx              <- ClerkProvider here
  (auth)/
    layout.tsx              <- ClerkProvider here
```

Clerk v6 changed `<ClerkProvider>` behavior: it no longer opts the entire application into dynamic rendering by default. Routes that don't use auth data can be statically rendered even when `<ClerkProvider>` is present in a parent layout. When auth data is needed during server rendering, use `<ClerkProvider dynamic>` on the specific layout that requires it.

### Defer non-critical third-party scripts

Use `defer` or `async` on all third-party script tags. `defer` maintains execution order; `async` executes as soon as downloaded (use for independent scripts):

```html
<!-- Analytics: async is fine, order doesn't matter -->
<script src="https://analytics.example.com/script.js" async></script>

<!-- Scripts that depend on other scripts: defer preserves order -->
<script src="https://cdn.example.com/dependency.js" defer></script>
<script src="https://cdn.example.com/main.js" defer></script>
```

### Lazy-load third-party scripts on user interaction

For widgets that are only needed after a user action (chat, video player, share buttons), delay loading until the user interacts with the relevant element:

```js
document.getElementById('open-chat').addEventListener('click', () => {
  const script = document.createElement('script');
  script.src = 'https://chat-provider.example.com/widget.js';
  document.head.appendChild(script);
}, { once: true });
```

### Use the Partytown pattern for analytics

For analytics and tracking scripts that don't need DOM access, [Partytown](https://partytown.builder.io/) moves script execution to a Web Worker, removing it from the main thread entirely. This is most useful for Google Tag Manager, Google Analytics, and similar scripts.

### Self-host third-party scripts where possible

Self-hosting a third-party script (vendoring it into your own static assets) eliminates the external DNS lookup and connection. The tradeoff: you must update it manually. Appropriate for stable scripts (analytics libraries) but not for scripts that require a live connection to a third-party server.

---

## CSS Build Size

Applies when: any site using a CSS framework or build-time CSS processing.

Modern CSS frameworks eliminate unused styles at build time. The key is to avoid patterns that defeat purging.

### Avoid dynamic class name assembly

CSS purging tools scan source files statically. They cannot detect class names assembled at runtime from string concatenation:

```tsx
// Wrong: the tool cannot statically detect 'bg-red-500' or 'bg-green-500'
const color = isActive ? 'red' : 'green';
<div className={`bg-${color}-500`} />

// Correct: full class names must appear as literals in the source
const colorClass = isActive ? 'bg-red-500' : 'bg-green-500';
<div className={colorClass} />
```

This applies to any utility-first CSS framework (Tailwind, UnoCSS, Windi CSS).

### Tailwind CSS

#### Tailwind v3

Tailwind v3 uses a `content` array in `tailwind.config.js` to specify which files to scan for class names. Ensure all files that use Tailwind classes are included:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}',
    './public/**/*.html',
  ],
};
```

#### Tailwind v4

Tailwind CSS 4 scans all project files automatically - there is no `content` array to configure. The output for a typical project includes approximately 21 KiB of CSS at baseline (CSS variables, keyframes, `@property` rules, resets), plus only the utilities actually used. After minification and gzip, the final CSS is typically under 10 KiB even for large projects.

**`@layer components` vs. `@utility` in Tailwind 4.** In Tailwind 3, `@layer components` was the recommended way to define custom component classes and they were purged when unused. In Tailwind 4, `@layer components` behaves as a CSS cascade layer - its contents are always included in the output whether used or not. Use `@utility` instead for purgeable custom classes:

```css
/* globals.css */
@import "tailwindcss";

/* Wrong in v4: always included regardless of usage */
@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-md;
  }
}

/* Correct in v4: purged when unused */
@utility btn-primary {
  background-color: theme(colors.blue.600);
  color: white;
  padding: theme(spacing.2) theme(spacing.4);
  border-radius: theme(borderRadius.md);
}
```

### CSS Modules and scoped styles

CSS Modules (used in Next.js, Vite, and most modern bundlers) scope styles to the component they belong to. Unused component CSS is tree-shaken automatically when the component is not imported.

### Avoid `@apply` in component files

`@apply` in component CSS files extracts utility classes into a selector, duplicating styles in the output and defeating tree-shaking. Prefer utility classes directly in your HTML/JSX.

`@apply` is acceptable in global CSS files for base styles applied globally (e.g. `body`, heading elements, `:focus-visible`).

---

## CDN and Caching

Applies when: any site deployed to a hosting platform or CDN.

### Redirect chains add TTFB

Every redirect is a round-trip before the browser reaches the actual page. HTTP-to-HTTPS and non-www-to-www redirects are commonly configured as separate rules, creating a chain.

> **Real-world example:** PageSpeed Insights measured 3 redirect chains on a marketing page, adding 607 ms before the first byte arrived. The root cause was a hosting configuration where HTTP-to-HTTPS and www redirects were stacked as separate rules. Each redirect is a full network round-trip.

#### AWS Amplify redirect chain sources

On AWS Amplify, redirect chains on the initial page load URL typically come from three sources stacking on top of each other:

1. **Hosting layer:** Amplify adds an HTTP to HTTPS redirect automatically (1 redirect, expected).
2. **Next.js config:** Any entries in the `redirects()` array in `next.config.ts` add another hop.
3. **Auth middleware:** Clerk (or any other auth middleware) can issue its own redirect before serving the page, for example redirecting an unauthenticated user through a sign-in flow.

A single HTTP to HTTPS redirect is normal. If `curl -IL` shows 3 or more redirects on a marketing page root URL, the cause is almost certainly Next.js `redirects()` config or auth middleware firing on a route it should not touch.

> **Real-world example:** 3 redirects on a marketing page root URL added 614 ms before the first byte. Investigation found a Clerk middleware matcher pattern that was too broad, intercepting public marketing routes and issuing an unnecessary redirect before the page was served.

**Fix: consolidate to a single redirect per entry URL.** Combine protocol and subdomain normalization into one rule:

| Entry URL | Target | Redirects |
|---|---|---|
| `http://example.com/*` | `https://www.example.com/*` | 1 (correct) |
| `http://example.com/*` -> `https://example.com/*` -> `https://www.example.com/*` | - | 2 (avoid) |

Verify by running `curl -IL http://yourdomain.com/` and counting `Location:` headers before a 200 is reached. The target is one redirect maximum.

### Cache static assets aggressively

Assets with content-hash filenames (generated by most modern bundlers) are safe to cache indefinitely - any code change produces a new hash and therefore a new URL.

**Universal cache header strategy:**

| Asset type | Cache-Control value | Notes |
|---|---|---|
| Content-hashed JS/CSS | `public, max-age=31536000, immutable` | Safe: new file = new URL |
| Images (with hash) | `public, max-age=31536000, immutable` | Same: new file = new URL |
| Images (no hash) | `public, max-age=86400, stale-while-revalidate=604800` | Shorter TTL; no deployment guarantee |
| Fonts | `public, max-age=31536000, immutable` | Fonts rarely change |
| HTML pages | `no-cache, no-store, must-revalidate` | Must always be fresh |
| API routes | `no-store` | Never cache dynamic API responses |

### AWS Amplify

Amplify sets `Cache-Control: no-cache` on all responses by default. Add custom cache headers in `amplify.yml`:

```yaml
# amplify.yml
customHeaders:
  - pattern: '/_next/static/**/*'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'
  - pattern: '/assets/**/*'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'
  - pattern: '**/*.{png,jpg,jpeg,gif,webp,avif,svg,ico}'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=86400, stale-while-revalidate=604800'
  - pattern: '**/*.{woff,woff2,ttf,otf}'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'
  - pattern: '**/*.html'
    headers:
      - key: 'Cache-Control'
        value: 'no-cache, no-store, must-revalidate'
```

AWS Amplify released CDN caching improvements in February 2025, offering optimized cache key rules and increased cache hit ratios. These improvements must be explicitly enabled - they do not apply automatically to existing apps.

Note: AWS Amplify does not support Server-Sent Events (SSE) or HTTP streaming in serverless route handlers. Use polling or WebSockets via a separate service if real-time updates are required.

### Vercel / Netlify

Both platforms set appropriate cache headers for content-hashed assets automatically when using their native build integrations (Vercel for Next.js, Netlify for most frameworks). Verify with `curl -I` on a deployed static asset to confirm the `Cache-Control` header is set correctly.

For custom headers, use `vercel.json` or `netlify.toml`:

```json
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

```toml
# netlify.toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### CloudFront / CDN-agnostic

For CloudFront or any CDN where you control cache behavior, set cache policies based on path patterns. Ensure the CDN respects `Cache-Control` headers from your origin, or configure origin-side cache policies in the CDN console.

Verify cache hits using the `X-Cache` response header (present on most CDNs). `Hit from cloudfront` or `HIT` confirms the response was served from cache.

---

## Measurement and Validation

Run these after deploying changes. One tool per concern.

### Before making changes

- [PageSpeed Insights](https://pagespeed.web.dev/) - run on the target URL first to establish a baseline. Note the LCP element type, TTFB, specific audits flagged as failing, and whether field data is available. Run both mobile and desktop tabs.

### Lab data (synthetic, instant results)

- [PageSpeed Insights](https://pagespeed.web.dev/) - Lighthouse score, Core Web Vitals, specific opportunities and diagnostics
- [WebPageTest](https://www.webpagetest.org/) - waterfall view of all requests, shows what is blocking, filmstrip view of visual loading. More diagnostic than PageSpeed Insights for root-cause analysis. Use the "Redirect Chains" view to confirm redirect consolidation.
- Bundler analysis (`ANALYZE=true npm run build` or `rollup-plugin-visualizer`) - treemap of what is in each JavaScript bundle

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
- Chrome DevTools > Performance tab: record a page load or interaction to see long tasks (red bars) and their stack traces. Long tasks above 50 ms contribute to INP.
- Chrome DevTools > Lighthouse tab: run locally against `localhost` during development for instant feedback without deploying.

### Continuous monitoring

Set up alerts in Google Search Console for Core Web Vitals regressions. Search Console sends email notifications when a URL group drops from "Good" to "Needs improvement."

For real-user measurement when CrUX data is insufficient (low traffic), use the `web-vitals` npm package:

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

---

## Checklist

### Before deploying a new page or feature

- [ ] LCP element identified (image or text) before optimizing
- [ ] Images have explicit `width` and `height` attributes; `sizes` attribute set for responsive images
- [ ] Above-the-fold (LCP) image has a preload hint or `priority` prop; lazy loading disabled for it
- [ ] Web fonts loaded via self-hosting or preconnect hints, not `@import` in CSS
- [ ] Heavy dependencies checked in the bundle analyzer - dynamic import if they add > 20 KB gzipped
- [ ] Third-party scripts scoped to the routes that need them, not the root layout
- [ ] `browserslist` set in `package.json` if not already present
- [ ] Dynamic class name assembly avoided (full class name literals in source)

### After deploying to production

- [ ] PageSpeed Insights run on the changed URL - mobile and desktop
- [ ] LCP, CLS, INP in "Good" range (or no regression from baseline)
- [ ] Cache headers confirmed on static assets: `public, max-age=31536000, immutable`
- [ ] Cache headers confirmed on HTML pages: `no-cache, no-store, must-revalidate`
- [ ] Redirect chain verified: one redirect maximum before 200 (`curl -IL https://yourdomain.com/`)
- [ ] Third-party scripts not loading on pages that don't require them
- [ ] No console errors related to image sizing or missing `alt` attributes
