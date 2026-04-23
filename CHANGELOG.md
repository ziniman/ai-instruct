# Changelog

All notable content and feature changes to ai-instruct. Ordered newest to oldest.

---

## 2026-04-20 - v2.0.1

| Date         | Affected skill(s)  | Change |
|--------------|--------------------|--------|
| 2026-04-20   | `seo-llmo`         | Added Agent-Readiness section: Markdown content negotiation (Cloudflare + CloudFront Function), Link response headers (RFC 8288), Agent Skills index, and Content-Signal robots.txt directive; scored by isitagentready.com |

---

## 2026-04-20 - v2.0.0

| Date         | Affected skill(s)  | Change |
|--------------|--------------------|--------|
| 2026-04-20   | all                | Added Claude Code plugin and skills distribution - all 5 guides now published as native Claude Code skills under `.claude-plugin/` and `skills/`; install via `--skills` flag or `/plugin install ai-instruct@ai-instruct` |

---

## 2026-03-29 - v1.1.1

| Date         | Affected skill(s)  | Change |
|--------------|--------------------|--------|
| 2026-03-29   | `seo-llmo`         | Added Product schema section with JSON-LD template covering offers, availability, aggregateRating, and variants for AI shopping visibility |

---

## 2026-03-16 - v1.1.0

| Date         | Affected skill(s)  | Change |
|--------------|--------------------|--------|
| 2026-03-16   | README             | Clarified on-demand chat reference as the recommended usage pattern for one-time implementation guides |
| 2026-03-11   | `web-performance`  | Added new Web Performance guide covering Core Web Vitals (LCP/CLS/INP), image and font optimization, JS/CSS bundle size, CDN caching, and third-party script impact |
| 2026-03-11   | `web-accessibility`| Extended Web Accessibility guide with additional patterns |

---

## 2026-02-27 - v1.0.8 / v1.0.6 / v1.0.5

| Date         | Affected skill(s)  | Change |
|--------------|--------------------|--------|
| 2026-02-27   | `seo-llmo`         | Added link text best practices (anchor text as SEO/accessibility signal) and LCP quick wins: AVIF conversion, image resizing with sips, and Google Fonts preconnect pattern |
| 2026-02-25   | README             | Added Base44 and Lovable to supported platforms table |
| 2026-02-25   | README             | Added on-demand chat reference as a usage method with per-assistant syntax |

---

## 2026-02-25 - v1.0.1 - v1.0.4

| Date         | Affected skill(s)  | Change |
|--------------|--------------------|--------|
| 2026-02-25   | all                | Added `npx ai-instruct init` CLI with AI tool auto-detection, guide download to `ai-docs/`, and config file injection (CLAUDE.md, .cursorrules, copilot-instructions.md, .windsurfrules) |
| 2026-02-25   | all                | Rewrote all 4 guides with question-first approach (Section 0: Before You Start) replacing generic boilerplate with context-aware defaults |

---

## 2026-02-18

| Date         | Affected skill(s)    | Change |
|--------------|----------------------|--------|
| 2026-02-18   | `web-accessibility`  | Added Web Accessibility guide covering WCAG 2.2 AA, semantic HTML, ARIA, keyboard navigation, focus management, color contrast, and testing |
| 2026-02-18   | `google-analytics-4` | Added Google Analytics 4 guide covering gtag.js/GTM, event tracking, e-commerce, Consent Mode v2, SPA tracking, and BigQuery export |
| 2026-02-18   | `aws-spa-deploy`     | Added AWS SPA Deployment guide covering Amplify, custom domains, CDK, Lambda, API Gateway, SES, and CORS |
| 2026-02-18   | `seo-llmo`           | Added SEO & LLMO guide covering structured data, llms.txt, robots.txt, sitemap, meta tags, Open Graph, and Core Web Vitals |
