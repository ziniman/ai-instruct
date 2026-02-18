# SEO & LLMO Implementation Guide

A practical guide for implementing Search Engine Optimization (SEO) and Large Language Model Optimization (LLMO) on static sites. Based on latest practices as of early 2026.

## Table of Contents

1. [SEO Essentials](#seo-essentials)
2. [LLMO Essentials](#llmo-essentials)
3. [Structured Data (JSON-LD)](#structured-data-json-ld)
4. [Static Files](#static-files)
5. [SPA Considerations](#spa-considerations)
6. [Amplify / Static Hosting Notes](#amplify--static-hosting-notes)
7. [Validation & Testing](#validation--testing)

---

## SEO Essentials

### Meta Tags (in `<head>`)

Every page should include:

```html
<title>Page Title - Brand Name</title>
<meta name="description" content="Concise 150-160 char description with key terms." />
<meta name="author" content="Author Name" />
<link rel="canonical" href="https://yourdomain.com/page" />
```

### Open Graph (social sharing)

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://yourdomain.com/" />
<meta property="og:site_name" content="Brand Name" />
<meta property="og:title" content="Page Title - Brand Name" />
<meta property="og:description" content="Description for social shares." />
<meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

OG image should be 1200x630px for best display across platforms.

### Twitter/X Card

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@YourHandle" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Description for Twitter." />
<meta name="twitter:image" content="https://yourdomain.com/og-image.jpg" />
```

### Semantic HTML

- Use one `<h1>` per page
- Use heading hierarchy (`h1` > `h2` > `h3`) logically
- Use `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` elements
- Use `alt` attributes on all images
- Use `lang` attribute on `<html>`

---

## LLMO Essentials

LLMO focuses on making your site discoverable and accurately represented by AI models (ChatGPT, Claude, Perplexity, etc.).

### Key Principles

1. **Content in initial HTML**: AI crawlers don't execute JavaScript. Any content rendered only via client-side JS is invisible to them. Put critical information in static HTML, structured data, or llms.txt.

2. **Clear, extractable sections**: Write content in standalone sections that can be quoted independently. Use clear headings and direct language.

3. **Entity consistency**: Ensure your brand name, descriptions, and key terms are consistent across your site, social profiles, and external directories.

4. **Original insights**: Content with unique data, quotes, and specific claims gets cited 30-40% more by LLMs.

5. **Freshness**: Content older than 3 months sees a drop in AI citations. Keep key pages updated.

### llms.txt

A Markdown file at your site root that gives LLMs a structured overview. Format:

```markdown
# Site Name

> Short summary of the site with key context.

Additional prose with important details.

## Section Name

- [Page Title](https://example.com/page): Brief description
- [Another Page](https://example.com/other): What this covers

## Optional

- [Less Critical Page](https://example.com/extra): Can be skipped
```

Rules:
- H1 heading (site name) is required
- Blockquote summary is recommended
- H2 sections organize links by category
- `## Optional` marks resources that can be skipped for shorter context
- Links follow: `[Name](URL): Description`

Place at `public/llms.txt` so it's served at `yourdomain.com/llms.txt`.

### robots.txt for AI Crawlers

Explicitly allow AI bots:

```
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /
```

To block AI crawlers from specific content, use `Disallow` rules per user-agent.

Known AI crawler user-agents (as of 2026):
- `GPTBot` - OpenAI (training + search)
- `ChatGPT-User` - ChatGPT browsing
- `ClaudeBot` - Anthropic
- `PerplexityBot` - Perplexity AI
- `Google-Extended` - Google AI/Gemini
- `Applebot-Extended` - Apple Intelligence
- `CCBot` - Common Crawl (used by many AI trainers)
- `Bytespider` - ByteDance/TikTok

---

## Structured Data (JSON-LD)

JSON-LD is the most impactful addition for both SEO and LLMO. Sites with structured data get 2-3x more AI citations.

### Placement

Add in `<head>` as:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [ ... ]
}
</script>
```

### Common Schema Types

**Organization / Business:**
```json
{
  "@type": "ProfessionalService",
  "name": "Business Name",
  "url": "https://yourdomain.com",
  "logo": "https://yourdomain.com/logo.svg",
  "description": "What you do.",
  "email": "contact@yourdomain.com",
  "founder": {
    "@type": "Person",
    "name": "Founder Name",
    "jobTitle": "Title"
  },
  "sameAs": [
    "https://x.com/handle",
    "https://linkedin.com/company/name"
  ]
}
```

**WebSite:**
```json
{
  "@type": "WebSite",
  "url": "https://yourdomain.com",
  "name": "Site Name",
  "description": "Brief description"
}
```

**Service (for service offerings):**
```json
{
  "@type": "Service",
  "name": "Service Name",
  "description": "What this service provides."
}
```

**FAQPage (highly favored by both search and AI):**
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Your question here?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The answer."
      }
    }
  ]
}
```

**Other useful types:** `Review`, `AggregateRating`, `Event`, `Article`, `HowTo`

### Using @graph

Use `@graph` to include multiple schema objects in a single JSON-LD block. Reference between objects using `@id`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://yourdomain.com/#org",
      "name": "Your Org"
    },
    {
      "@type": "WebSite",
      "publisher": { "@id": "https://yourdomain.com/#org" }
    }
  ]
}
```

---

## Static Files

Files to include in your `public/` directory:

| File | Purpose |
|------|---------|
| `robots.txt` | Crawler directives, sitemap reference |
| `sitemap.xml` | Page listing for search engines |
| `llms.txt` | AI-readable site summary |
| `favicon.svg` / `favicon.ico` | Browser tab icon |
| `og-image.jpg` | Social sharing image (1200x630px) |

### sitemap.xml Template

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

Priority values: 1.0 (homepage) > 0.8 (key pages) > 0.5 (secondary) > 0.3 (legal/utility)

---

## SPA Considerations

Single-page apps (React, Vue, etc.) render content via JavaScript. This is a problem because:

- Search engine crawlers (Googlebot) can render JS but with delays and limits
- AI crawlers (GPTBot, ClaudeBot, etc.) generally do NOT execute JavaScript
- Social media crawlers (LinkedIn, Twitter) do NOT execute JavaScript

### Mitigations (without SSR/SSG)

1. **JSON-LD structured data** in `index.html` - crawlable without JS
2. **llms.txt** - gives AI models your key content directly
3. **Complete meta tags** - title, description, OG tags in static HTML
4. **Prerendering** (if needed) - tools like `vite-plugin-prerender` can generate static HTML for key routes at build time

### Full Solution

For maximum SEO/LLMO, consider:
- **SSG (Static Site Generation)** via Astro, Next.js (export), or vite-ssg
- **Prerendering** specific routes at build time
- These generate real HTML that all crawlers can read

---

## Amplify / Static Hosting Notes

### AWS Amplify

- Files in `public/` (Vite) are copied to `dist/` and served as static assets
- Amplify's SPA rewrite rule (`/<*> -> /index.html` with `404-200`) only applies when no actual file exists, so `robots.txt`, `sitemap.xml`, and `llms.txt` are served directly
- No config changes needed for serving new static files
- Set environment variables in Amplify Console > Hosting > Environment variables (e.g., `VITE_API_URL`)

### CloudFront + S3

- Upload static files to S3 bucket root
- Ensure `Content-Type` headers are correct:
  - `robots.txt` -> `text/plain`
  - `sitemap.xml` -> `application/xml`
  - `llms.txt` -> `text/plain` or `text/markdown`

### Netlify / Vercel

- Files in `public/` are served automatically
- No additional config needed

---

## Validation & Testing

### SEO

- **Google Rich Results Test**: https://search.google.com/test/rich-results - validates JSON-LD
- **Schema.org Validator**: https://validator.schema.org/ - validates structured data
- **Google Search Console**: submit sitemap, monitor indexing
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/ - test OG tags
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator - test Twitter cards

### LLMO

- Verify `llms.txt` is accessible at `https://yourdomain.com/llms.txt`
- Verify `robots.txt` allows AI crawlers at `https://yourdomain.com/robots.txt`
- Test by asking AI chatbots about your site/brand and checking accuracy
- Monitor server logs for AI crawler user-agents

### Quick Checks

```bash
# Verify files are served
curl -s https://yourdomain.com/robots.txt | head
curl -s https://yourdomain.com/sitemap.xml | head
curl -s https://yourdomain.com/llms.txt | head

# Validate JSON-LD syntax
curl -s https://yourdomain.com/ | grep -o '<script type="application/ld+json">.*</script>'
```
