# Changelog

All notable content and feature changes to ai-instruct. Ordered newest to oldest.

---

## v2.0.1 &nbsp;·&nbsp; 2026-04-27

**`seo-llmo`** — Expanded agent-readiness coverage from ORA (ora.run) scan analysis: sameAs entity linking (Wikidata/Wikipedia), Speakable schema, Organization contactPoint/address, agent instruction block in llms.txt, modular per-section llms.txt, NLWeb schemamap robots.txt directive, trust anchor pages (500+ chars), pricing.md, /.well-known/agent.json, AGENTS.md, ?mode=agent view, content efficiency (text:HTML ratio), and ORA scanner in validation

---

## v2.0.1 &nbsp;·&nbsp; 2026-04-20

**`seo-llmo`** — Added Agent-Readiness section: Markdown content negotiation (Cloudflare + CloudFront Function), Link response headers (RFC 8288), Agent Skills index, and Content-Signal robots.txt directive; scored by isitagentready.com

---

## v2.0.0 &nbsp;·&nbsp; 2026-04-20

**`all skills`** — Added Claude Code plugin and skills distribution; all 5 guides now published as native Claude Code skills under `.claude-plugin/` and `skills/`; install via `--skills` flag or `/plugin install ai-instruct@ai-instruct`

---

## v1.1.1 &nbsp;·&nbsp; 2026-03-29

**`seo-llmo`** — Added Product schema section with JSON-LD template covering offers, availability, aggregateRating, and variants for AI shopping visibility

---

## v1.1.0 &nbsp;·&nbsp; 2026-03-16

**`web-performance`** — Added new Web Performance guide covering Core Web Vitals (LCP/CLS/INP), image and font optimization, JS/CSS bundle size, CDN caching, and third-party script impact

**`web-accessibility`** — Extended with additional WCAG patterns

**`README`** — Clarified on-demand chat reference as the recommended usage pattern for one-time implementation guides

---

## v1.0.8 &nbsp;·&nbsp; 2026-02-27

**`seo-llmo`** — Added link text best practices (anchor text as SEO/accessibility signal) and LCP quick wins: AVIF conversion, image resizing with sips, and Google Fonts preconnect pattern

**`README`** — Added Base44 and Lovable to supported platforms; added on-demand chat reference as a usage method with per-assistant syntax

---

## v1.0.4 &nbsp;·&nbsp; 2026-02-25

**`CLI`** — Added `npx ai-instruct init` with AI tool auto-detection, guide download to `ai-docs/`, and config file injection (CLAUDE.md, .cursorrules, copilot-instructions.md, .windsurfrules)

**`all guides`** — Rewrote all 4 guides with question-first approach (Section 0: Before You Start) replacing generic boilerplate with context-aware defaults

---

## v1.0.0 &nbsp;·&nbsp; 2026-02-18

**`seo-llmo`** — Added SEO & LLMO guide covering structured data, llms.txt, robots.txt, sitemap, meta tags, Open Graph, and Core Web Vitals

**`web-accessibility`** — Added Web Accessibility guide covering WCAG 2.2 AA, semantic HTML, ARIA, keyboard navigation, focus management, color contrast, and testing

**`google-analytics-4`** — Added Google Analytics 4 guide covering gtag.js/GTM, event tracking, e-commerce, Consent Mode v2, SPA tracking, and BigQuery export

**`aws-spa-deploy`** — Added AWS SPA Deployment guide covering Amplify, custom domains, CDK, Lambda, API Gateway, SES, and CORS
