---
name: web-performance
description: 'Use this skill whenever the user is improving Core Web Vitals or page load performance, or mentions slow pages, PageSpeed Insights / Lighthouse failures or insights, LCP/CLS/INP scores, bundle size, image/font optimization, or third-party script impact. Covers Core Web Vitals, LCP image priority (fetchpriority, preload, lazy loading), image formats (AVIF/WebP), font loading, JavaScript bundle size, legacy polyfills and browserslist, CSS build size, script loading (async/defer, tag managers), preconnect/dns-prefetch, critical CSS and CSP, CDN cache headers and compression, bfcache and Speculation Rules prerendering, and measurement tools (CrUX, web-vitals). Skip for backend latency tuning, database query optimization, or CI build speed.'
---

# Web Performance Guide

> Applies to: Any website or web app | Updated: October 2026

A practical reference for measuring and improving web performance - covering Core Web Vitals, image and font optimization, JavaScript bundle size, CSS build size, CDN caching, instant navigations, third-party JavaScript impact, and validation tools.

---

## Section 0: Before You Start

Answer these questions before making any performance changes. Each has a default - use it if the user hasn't said otherwise.

**Q: Which pages are the priority targets?**
(landing page, dashboard, auth-gated app pages, all pages)
Default: public-facing pages first - these are indexed by search engines and directly affect user experience. Auth-gated pages matter less for search: the Chrome User Experience Report (CrUX) only publishes page-level data for publicly discoverable (indexable) URLs, although visits to those pages still count toward the origin-level score.

**Q: What is the current performance baseline?**
Default: unknown - run PageSpeed Insights on the target URL before making any changes, so you have a before/after comparison. Note the LCP (Largest Contentful Paint) element type (image or text), TTFB (Time to First Byte), and the specific insights and diagnostics flagged.

**Q: Are you optimizing for lab scores (Lighthouse) or field data (real users)?**
Default: both - but prioritize fixing field data issues flagged in Google Search Console > Core Web Vitals first. Lab scores are easier to game; field data reflects real users on real devices and networks.

**Q: What framework or rendering model is the site using?**
(plain HTML, single-page app (SPA) with Vite, Next.js App Router, Astro, Nuxt, WordPress)
Default: detect from config files (`next.config.*`, `vite.config.*`, `astro.config.*`) if visible; otherwise assume plain HTML. Framework-specific advice is in clearly labeled subsections throughout this guide.

**Q: How are images and web fonts currently served?**
(JPEG/PNG vs WebP/AVIF; Google Fonts via `<link>`, `@import` in CSS, self-hosted, framework font utility)
Default: JPEG/PNG images and Google Fonts via `<link>` - check the `public/` or `assets/` directory, the HTML `<head>`, and global CSS files before assuming.

**Q: Is a CDN or hosting platform configured with custom cache headers?**
Default: no - many platforms (plain S3, some shared hosts) do not send long-lived browser cache headers on static assets by default. Check the hosting config and run `curl -I` on a deployed asset before assuming.

> **AI assistant:** Read the user's answers (or use the defaults above) before generating any code, and run PageSpeed Insights first if no baseline exists. Identify the LCP element type before optimizing images - if it is a `<p>` or `<h1>`, TTFB and render-blocking CSS matter more than image work. Also check `package.json` for a `browserslist` entry and the framework version (Next.js 16 renamed several APIs used in this guide), and skip framework-specific subsections that don't match the stack.

---

## Contents

This guide is split into reference files. Use the Section 0 answers to decide which apply, then read only those; skip the rest.

- [Core Web Vitals Overview](references/core-web-vitals-overview.md): Any public-facing page.
- [LCP: Largest Contentful Paint](references/lcp-largest-contentful-paint.md): Any page with a hero section, large image, or above-the-fold text block.
- [CLS: Cumulative Layout Shift](references/cls-cumulative-layout-shift.md): Any page with images, dynamically loaded content, or web fonts.
- [INP: Interaction to Next Paint](references/inp-interaction-to-next-paint.md): Any page with user interactions - especially dashboards, data-entry forms, and interactive app flows.
- [Image Optimization](references/image-optimization.md): Any page with images.
- [Font Loading](references/font-loading.md): Any page using custom web fonts.
- [JavaScript Bundle Size](references/javascript-bundle-size.md): Any site with a JavaScript build step.
- [Legacy JavaScript and Browser Targets](references/legacy-javascript-and-browser-targets.md): Any site with a JavaScript build step.
- [Third-Party JavaScript](references/third-party-javascript.md): Any page that loads scripts from external services (analytics, auth, chat, ads, video embeds).
- [CSS Build Size](references/css-build-size.md): Any site using a CSS framework or build-time CSS processing.
- [CDN and Caching](references/cdn-and-caching.md): Any site deployed to a hosting platform or CDN.
- [Instant Navigations: bfcache and Speculation Rules](references/instant-navigations-bfcache-and-speculation-rules.md): Any multi-page site (marketing sites, blogs, e-commerce, docs). SPAs that handle routing client-side benefit less from speculation rules.
- [Measurement and Validation](references/measurement-and-validation.md): Measuring before and after changes: lab data, field data, network and runtime inspection, in-browser tools, continuous monitoring.
- [Checklist](references/checklist.md): Before deploying a new page or feature, and after deploying to production.
