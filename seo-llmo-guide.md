# SEO & LLMO Implementation Guide

> Applies to: Any website or web app | Updated: February 2026

A practical guide for implementing Search Engine Optimization (SEO) and Large Language Model Optimization (LLMO) — making your site discoverable by both search engines and AI tools.

---

## Section 0: Before You Start

Answer these questions before generating any code. Each has a default — use it if the user hasn't said otherwise.

**Q: What kind of site is this?**
(blog, online shop, company/marketing site, web app, documentation)
Default: company/marketing site — drives which schema types to prioritize.

**Q: How is the site built?**
(plain HTML, React/Vue/Angular SPA, Next.js/Astro/Nuxt with server rendering, WordPress/CMS)
Default: if a framework config file (e.g. `vite.config.*`, `next.config.*`, `astro.config.*`) is visible in the project, detect from that; otherwise assume plain HTML.

**Q: Where are your visitors?**
(one country, multiple countries/languages, worldwide)
Default: worldwide, single language — skip hreflang unless multiple languages are confirmed.

**Q: What's your main goal with SEO?**
(show up in Google search, get cited by AI tools like ChatGPT/Perplexity, both, social sharing)
Default: both Google and AI tools.

**Q: Do you already have a robots.txt, sitemap, or structured data set up?**
Default: no — but check for existing files before creating new ones, and merge rather than overwrite.

> **AI assistant:** Read the user's answers (or use the defaults above) before generating any code. Skip sections that don't apply to their setup.

---

## Contents

1. [Structured Data (JSON-LD)](#structured-data-json-ld)
2. [llms.txt and llms-full.txt](#llmstxt-and-llms-fulltxt)
3. [robots.txt for AI and Search Crawlers](#robotstxt-for-ai-and-search-crawlers)
4. [Sitemap](#sitemap)
5. [Meta Tags and Social Sharing](#meta-tags-and-social-sharing)
6. [Core Web Vitals](#core-web-vitals)
7. [SPA Considerations](#spa-considerations)
8. [Static Hosting Notes](#static-hosting-notes)
9. [Validation](#validation)

---

## Structured Data (JSON-LD)

Applies when: any site where you want Google rich results or AI citation.

JSON-LD (JavaScript Object Notation for Linked Data) is the highest-impact addition for both SEO and LLMO. Add it in `<head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [ ... ]
}
</script>
```

**CSP interaction:** If your site uses a strict `Content-Security-Policy` with `script-src`, inline `<script type="application/ld+json">` blocks are treated as inline scripts and will be blocked unless you add `'unsafe-inline'` or a per-request nonce. Add the nonce to the JSON-LD script tag the same way you would for any other inline script.

### @graph with @id cross-referencing

Use `@graph` to put multiple schema objects in one block and wire them together with `@id` references. This lets Google and AI parsers understand the relationships between entities on your site:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://yourdomain.com/#org",
      "name": "Your Company Name",
      "url": "https://yourdomain.com",
      "logo": "https://yourdomain.com/logo.svg",
      "description": "What you do, in one sentence.",
      "email": "contact@yourdomain.com",
      "sameAs": [
        "https://linkedin.com/company/your-company",
        "https://x.com/yourhandle"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://yourdomain.com/#website",
      "url": "https://yourdomain.com",
      "name": "Your Site Name",
      "publisher": { "@id": "https://yourdomain.com/#org" }
    }
  ]
}
```

The `"publisher": { "@id": "..." }` pattern replaces duplicating the full Organization object everywhere. Use the same `#id` fragment consistently across all pages.

### FAQPage schema

Use on any page with a Q&A section. FAQPage triggers Google rich results (expandable Q&A in search) and is a reliable citation target for AI tools that answer direct questions:

```json
{
  "@type": "FAQPage",
  "@id": "https://yourdomain.com/faq#faqpage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does your product do?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A specific, self-contained answer that makes sense without surrounding context."
      }
    }
  ]
}
```

Write answers that make sense in isolation — AI tools extract and quote them without the surrounding page.

### Service and Article schema

**For service pages:**
```json
{
  "@type": "Service",
  "@id": "https://yourdomain.com/services/your-service#service",
  "name": "Service Name",
  "description": "What this service provides.",
  "provider": { "@id": "https://yourdomain.com/#org" }
}
```

**For blog posts or articles:**
```json
{
  "@type": "Article",
  "@id": "https://yourdomain.com/blog/post-slug#article",
  "headline": "Article Title",
  "datePublished": "2026-01-15",
  "dateModified": "2026-02-01",
  "author": { "@id": "https://yourdomain.com/#org" },
  "publisher": { "@id": "https://yourdomain.com/#org" }
}
```

**Other useful types:** `Review`, `AggregateRating`, `Event`, `HowTo`, `BreadcrumbList`

Verify: [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema.org Validator](https://validator.schema.org/)

---

## llms.txt and llms-full.txt

Applies when: goal includes AI tool visibility.

`llms.txt` is an emerging convention (not a ratified standard as of 2026) for giving AI tools a structured, Markdown-formatted overview of your site. Place it at your site root so it's served at `https://yourdomain.com/llms.txt`.

### llms.txt format

```markdown
# Site Name

> One-paragraph summary of what the site is and who it's for. Be specific — this is the context an AI tool will use when answering questions about your brand.

## Main Content

- [Page Title](https://yourdomain.com/page): What this page covers and why it matters.
- [Another Page](https://yourdomain.com/other): One-line description.

## Products / Services

- [Product Name](https://yourdomain.com/product): What it does.

## Optional

- [Legal](https://yourdomain.com/privacy): Can be skipped for shorter context windows.
```

Rules:
- H1 (site name) is required
- Blockquote summary immediately after H1 is recommended — it's the first thing read
- H2 sections organize links by category
- `## Optional` marks resources that can be omitted when context window is limited
- Links follow the pattern: `[Name](URL): Description`

### llms-full.txt

For sites with substantial content, add `llms-full.txt` alongside `llms.txt`. This companion file contains the full text of your key pages (not just links) for AI tools using larger context windows. Include the actual prose content, not just summaries. Link to it from `llms.txt`:

```markdown
## Full content

- [Full text version](https://yourdomain.com/llms-full.txt): Complete content for larger context windows.
```

Verify: `curl -s https://yourdomain.com/llms.txt` — confirm the file is accessible and the H1 and blockquote render correctly.

---

## robots.txt for AI and Search Crawlers

Applies when: any public-facing site.

A complete robots.txt that explicitly handles both search and AI crawlers. Add this to your `public/` directory (or site root):

```
User-agent: *
Allow: /

# Search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# AI retrieval crawlers (these fetch content on demand for AI search products)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

# AI training crawlers (these feed static training datasets — blocking does not affect live AI search)
User-agent: CCBot
Disallow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Bytespider
Disallow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

### Training crawlers vs. retrieval crawlers

These are different things with different implications for blocking:

- **Retrieval crawlers** (`GPTBot` when used by ChatGPT Search, `PerplexityBot`, `ChatGPT-User`) fetch your content at query time for AI search products. Blocking these removes your site from those products' answers — freshness matters here.
- **Training crawlers** (`CCBot`, `Bytespider`) collect data for static training datasets with a fixed cutoff date. Blocking them does not affect whether AI tools cite you in live searches.

`Google-Extended` covers Google's AI features (Gemini, AI Overviews) and is separate from `Googlebot`. Block one without affecting the other.

Known AI crawler user-agents (as of 2026):
- `GPTBot` — OpenAI training + ChatGPT Search retrieval
- `ChatGPT-User` — ChatGPT browsing/retrieval
- `ClaudeBot` — Anthropic
- `PerplexityBot` — Perplexity AI (retrieval)
- `Google-Extended` — Google AI features / Gemini
- `Applebot-Extended` — Apple Intelligence
- `Meta-ExternalAgent` — Meta AI
- `Amazonbot` — Amazon Alexa/AI
- `CCBot` — Common Crawl (used by many training pipelines)
- `Bytespider` — ByteDance/TikTok

Verify: `curl -s https://yourdomain.com/robots.txt` — confirm the `Sitemap:` line and your intended Allow/Disallow rules are present.

---

## Sitemap

Applies when: site has more than one page and you want search engine indexing.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2026-02-01</lastmod>
  </url>
  <url>
    <loc>https://yourdomain.com/about</loc>
    <lastmod>2026-01-15</lastmod>
  </url>
  <url>
    <loc>https://yourdomain.com/services</loc>
    <lastmod>2026-01-10</lastmod>
  </url>
</urlset>
```

`<changefreq>` and `<priority>` are largely ignored by Google — omit them to keep the sitemap clean. `<lastmod>` is used and should reflect when the page content actually changed.

After deploying, submit the sitemap URL in Google Search Console (Index > Sitemaps). For Bing and Yandex, use the **IndexNow** protocol for instant URL submission rather than waiting for crawl discovery:

```
POST https://api.indexnow.org/indexnow
Content-Type: application/json

{
  "host": "yourdomain.com",
  "key": "your-indexnow-key",
  "urlList": [
    "https://yourdomain.com/new-page",
    "https://yourdomain.com/updated-page"
  ]
}
```

Generate your IndexNow key at [indexnow.org](https://www.indexnow.org/). Host the key as a text file at `https://yourdomain.com/{key}.txt`.

Verify: Submit sitemap in Google Search Console and check for errors under Index > Sitemaps.

---

## Meta Tags and Social Sharing

Applies when: goal includes social sharing or Google click-through rates.

Every page needs these — they're table stakes, not differentiators:

```html
<title>Page Title - Brand Name</title>
<meta name="description" content="150-160 character description with primary keywords near the start." />
<link rel="canonical" href="https://yourdomain.com/page" />
```

The canonical tag prevents duplicate content penalties when the same page is reachable at multiple URLs (e.g. with/without trailing slash, HTTP vs HTTPS).

### Open Graph

The non-obvious parts of Open Graph tags:

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://yourdomain.com/" />
<meta property="og:title" content="Page Title - Brand Name" />
<meta property="og:description" content="Description for social shares." />
<meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
<!-- Width and height prevent the platform from fetching the image to determine dimensions -->
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

OG image: 1200x630px. Include `og:image:width` and `og:image:height` — without them, some platforms fetch the image before rendering the preview card, adding latency.

### Twitter/X Card

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@yourhandle" />
```

Twitter inherits `og:title`, `og:description`, and `og:image` if the corresponding `twitter:*` tags are absent — you don't need to duplicate them. The Twitter Card Validator at `cards-dev.twitter.com` is deprecated and unreliable; use [opengraph.xyz](https://www.opengraph.xyz/) or the LinkedIn Post Inspector for testing OG previews.

Verify: [opengraph.xyz](https://www.opengraph.xyz/) for OG/Twitter preview, [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) for LinkedIn.

---

## Core Web Vitals

Applies when: site targets Google search ranking, or is a SPA.

Core Web Vitals are Google ranking signals measured in the field (real user data via Chrome). The three metrics as of 2026:

- **LCP (Largest Contentful Paint):** Time until the largest visible content element loads. Target: under 2.5 seconds. Common causes of poor LCP: large unoptimized hero images, render-blocking resources, slow server response.
- **CLS (Cumulative Layout Shift):** Visual instability from elements moving after initial render. Target: under 0.1. Common causes: images without explicit `width`/`height`, ads injecting content, late-loading fonts.
- **INP (Interaction to Next Paint):** Replaced FID (First Input Delay) in March 2024. Measures the latency of all user interactions throughout the page visit, not just the first. Target: under 200 ms. Common causes in SPAs: heavy JavaScript on the main thread, large React re-renders on input events.

INP is the most impactful change for SPA developers — FID only measured the first interaction, making it easy to pass while the app remained sluggish. INP catches ongoing interaction delays.

Check your scores: [PageSpeed Insights](https://pagespeed.web.dev/) (field + lab data) and [Google Search Console](https://search.google.com/search-console/) > Core Web Vitals report (field data only, requires traffic).

---

## SPA Considerations

Applies when: site is built with React, Vue, Angular, or another client-side-only framework.

SPAs render content via JavaScript. This creates two distinct problems:

- **AI crawlers** (`GPTBot`, `ClaudeBot`, etc.) generally do not execute JavaScript — they see only the initial HTML shell.
- **Social crawlers** (LinkedIn, Slack, iMessage) do not execute JavaScript — OG tags must be in the static HTML.
- **Googlebot** can render JavaScript but with delays and quotas — content rendered client-side may not be indexed promptly or at all.

### Mitigations without SSR

Add these to your `index.html` (they work without JavaScript):

1. **JSON-LD in `<head>`** — AI crawlers and Google parse it without executing JS
2. **Complete meta tags** — title, description, canonical, OG tags in static HTML
3. **llms.txt** — gives AI tools your full content as a separate file

For specific routes that need unique meta tags (e.g. blog posts), use **prerendering** at build time. Tools: `vite-plugin-prerender`, `react-snap`.

### Full solution

For reliable SEO and LLMO with dynamic content, use a framework that generates static HTML:

- **Astro** — best for content sites; generates static HTML with optional JS hydration
- **Next.js** with `output: 'export'` or SSR — generates per-route HTML
- **Nuxt** with `ssr: true` — same for Vue

These generate actual HTML files that all crawlers read without JavaScript.

---

## Static Hosting Notes

### AWS Amplify

- Files in `public/` (Vite) are copied to `dist/` and served as-is
- Amplify's SPA rewrite rule (`/<*> -> /index.html` with 404→200) only fires when no matching file exists — `robots.txt`, `sitemap.xml`, and `llms.txt` are served directly without triggering the rewrite
- No additional config needed for new static files placed in `public/`

### CloudFront + S3

Upload static files to the S3 bucket root. Set explicit `Content-Type` metadata on each object — S3 does not infer content type reliably:

| File | Content-Type |
|------|--------------|
| `robots.txt` | `text/plain` |
| `sitemap.xml` | `application/xml` |
| `llms.txt` | `text/plain` |
| `llms-full.txt` | `text/plain` |

If `Content-Type` is wrong, crawlers may reject the file even when the content is valid.

### Netlify / Vercel

Files in `public/` (or `static/` in some frameworks) are served automatically with correct content types. No additional config needed.

---

## Validation

Run these checks after deploying. One command or tool per concern — no separate "validation section" needed at the end of a project.

### Structured data

- [Google Rich Results Test](https://search.google.com/test/rich-results) — validates JSON-LD and shows which rich result types are eligible
- [Schema.org Validator](https://validator.schema.org/) — catches schema errors the Rich Results Test doesn't flag

### Social sharing previews

- [opengraph.xyz](https://www.opengraph.xyz/) — shows OG and Twitter Card previews as they appear on each platform
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) — LinkedIn-specific preview and cache refresh

### Crawl access

```bash
# Verify static files are served and accessible
curl -I https://yourdomain.com/robots.txt
curl -I https://yourdomain.com/sitemap.xml
curl -I https://yourdomain.com/llms.txt

# Check robots.txt content
curl -s https://yourdomain.com/robots.txt

# Spot-check JSON-LD is present in HTML source (not rendered by JS)
curl -s https://yourdomain.com/ | grep 'application/ld+json'
```

### Performance

- [PageSpeed Insights](https://pagespeed.web.dev/) — Core Web Vitals field + lab data per URL
- Google Search Console > Core Web Vitals — aggregate field data across your site (requires traffic)

### Indexing

- Google Search Console > Index > Sitemaps — submit and monitor sitemap processing
- Google Search Console > URL Inspection — check individual page indexing status and last crawl date
