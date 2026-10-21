---
name: seo-llmo
description: 'Use this skill whenever the user is building, reviewing, or launching a public website or web app; SEO, LLMO, and agent-readiness are baseline for every public site. Covers meta tags, Open Graph, JSON-LD, robots.txt for AI search and training crawlers (OAI-SearchBot, GPTBot, Claude-SearchBot, ClaudeBot, PerplexityBot, Google-Extended) with Content-Signal, sitemap.xml, llms.txt, Markdown content negotiation, Link headers, A2A Agent Card, MCP Server Card and AI Catalog discovery, Agent Skills index, pricing.md, and the "explicit absence beats silence" rule. Trigger for marketing sites, landing pages, blogs, docs, and stores; before any launch or go-live; when the user mentions isitagentready.com, ORA, agent-readiness, AI Overviews, or wants ChatGPT, Claude, Perplexity, or browser agents to find and use the site; and when scaffolding a public site even if SEO is not mentioned. Skip for internal tools, admin panels, or auth-gated dashboards with no public surface.'
---

# SEO & LLMO Implementation Guide

> Applies to: Any website or web app | Updated: October 2026

A practical guide for implementing Search Engine Optimization (SEO), Large Language Model Optimization (LLMO), and agent-readiness  -  making your site discoverable and usable by search engines, AI chat tools, and autonomous agents.

Agents (ChatGPT deep research, Claude with web, Perplexity, Cloudflare Agents, browser agents) don't just index your page, they fetch and act on it. That raises the bar on three things beyond classic SEO: telling crawlers what they may do with your content (Content Signals), serving a clean Markdown version on demand, and advertising any programmatic entry points you expose. You can check your agent-readiness score at [isitagentready.com](https://isitagentready.com/).

---

## Section 0: Before You Start

Answer these questions before generating any code. Each has a default  -  use it if the user hasn't said otherwise.

**Q: What kind of site is this?**
(blog, online shop, company/marketing site, web app, documentation)
Default: company/marketing site  -  drives which schema types to prioritize.

**Q: How is the site built?**
(plain HTML, React/Vue/Angular SPA, Next.js/Astro/Nuxt with server rendering, WordPress/CMS)
Default: if a framework config file (e.g. `vite.config.*`, `next.config.*`, `astro.config.*`) is visible in the project, detect from that; otherwise assume plain HTML.

**Q: Where are your visitors?**
(one country, multiple countries/languages, worldwide)
Default: worldwide, single language  -  skip hreflang unless multiple languages are confirmed.

**Q: What's your main goal with SEO?**
(show up in Google search, get cited by AI chat tools like ChatGPT/Perplexity, be usable by autonomous agents, social sharing, all of the above)
Default: all of the above  -  the baseline checklist covers Google + AI chat citation + agent-readiness in one pass.

**Q: Do you already have a robots.txt, sitemap, or structured data set up?**
Default: no  -  but check for existing files before creating new ones, and merge rather than overwrite.

> **AI assistant:** Read the user's answers (or use the defaults above) before generating any code. Skip sections that don't apply to their setup.

---

## Contents

This guide is split into reference files. Use the Section 0 answers to decide which apply, then read only those; skip the rest.

- [Structured Data (JSON-LD)](references/structured-data-json-ld.md): Any site where you want Google rich results or AI citation.
- [llms.txt and llms-full.txt](references/llms-txt-and-llms-full-txt.md): Goal includes AI tool visibility.
- [robots.txt for AI and Search Crawlers](references/robots-txt-for-ai-and-search-crawlers.md): Any public-facing site.
- [Sitemap](references/sitemap.md): Site has more than one page and you want search engine indexing.
- [Meta Tags and Social Sharing](references/meta-tags-and-social-sharing.md): Goal includes social sharing or Google click-through rates.
- [Agent-Readiness](references/agent-readiness.md): Goal includes being usable by autonomous agents (browser agents, deep research tools, agentic commerce), not just cited by AI chat.
- [Core Web Vitals](references/core-web-vitals.md): Site targets Google search ranking, or is a SPA.
- [SPA Considerations](references/spa-considerations.md): Site is built with React, Vue, Angular, or another client-side-only framework.
- [Static Hosting Notes](references/static-hosting-notes.md): Deploying to AWS Amplify, CloudFront + S3, Netlify, or Vercel and you need SPA rewrites, headers, or content negotiation configured on that host.
- [Validation](references/validation.md): After deploying, to check structured data, social previews, crawl access, agent-readiness, cross-surface consistency, performance, and indexing.
