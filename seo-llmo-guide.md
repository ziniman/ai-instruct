# SEO & LLMO Implementation Guide

> Applies to: Any website or web app | Updated: April 2026

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

1. [Structured Data (JSON-LD)](#structured-data-json-ld)
2. [llms.txt and llms-full.txt](#llmstxt-and-llms-fulltxt)
3. [robots.txt for AI and Search Crawlers](#robotstxt-for-ai-and-search-crawlers)
4. [Sitemap](#sitemap)
5. [Meta Tags and Social Sharing](#meta-tags-and-social-sharing)
6. [Agent-Readiness](#agent-readiness)
7. [Core Web Vitals](#core-web-vitals)
8. [SPA Considerations](#spa-considerations)
9. [Static Hosting Notes](#static-hosting-notes)
10. [Validation](#validation)

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
        "https://x.com/yourhandle",
        "https://github.com/your-org",
        "https://www.wikidata.org/wiki/Q123456",
        "https://en.wikipedia.org/wiki/Your_Company"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "contact@yourdomain.com",
        "contactType": "customer support"
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      }
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

Write answers that make sense in isolation  -  AI tools extract and quote them without the surrounding page.

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

### Product schema

Applies when: site type is online shop.

`Product` schema is the highest-impact schema type for e-commerce. It surfaces pricing, availability, and ratings directly in Google Shopping results and is a primary signal AI tools use when answering product queries. Add one block per product page:

```json
{
  "@type": "Product",
  "@id": "https://yourdomain.com/products/product-slug#product",
  "name": "Product Name",
  "description": "What this product is and what problem it solves. Write for someone who has never seen your site.",
  "image": [
    "https://yourdomain.com/images/product-front.jpg",
    "https://yourdomain.com/images/product-side.jpg"
  ],
  "brand": {
    "@type": "Brand",
    "name": "Your Brand"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://yourdomain.com/products/product-slug",
    "priceCurrency": "USD",
    "price": "49.00",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "128"
  }
}
```

Key fields for AI visibility: `description` (write it to stand alone, without surrounding page context), `offers.availability` (keep it accurate and current - AI tools actively surface in-stock status), and `aggregateRating` (AI shopping results weight social proof heavily).

If the product has variants (sizes, colors), add a `hasVariant` array or use `variesBy` - see [schema.org/Product](https://schema.org/Product) for the full spec.

### sameAs entity linking

`sameAs` in your Organization block is how AI models disambiguate your brand from similarly-named entities. Include every authoritative profile you have:

```json
"sameAs": [
  "https://linkedin.com/company/your-company",
  "https://x.com/yourhandle",
  "https://github.com/your-org",
  "https://www.youtube.com/@yourchannel",
  "https://www.wikidata.org/wiki/Q123456",
  "https://en.wikipedia.org/wiki/Your_Company"
]
```

Wikidata and Wikipedia are the highest-trust signals for AI disambiguation. Even a minimal Wikidata entry (a few lines, published via wikidata.org) is enough to anchor your brand identity in AI training data.

### Speakable schema

`Speakable` tells AI assistants and voice interfaces which sections of your page are worth reading aloud. Point it at your key value proposition and main heading:

```json
{
  "@type": "WebPage",
  "@id": "https://yourdomain.com/#webpage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".hero-description", ".value-prop"]
  },
  "url": "https://yourdomain.com"
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

> One-paragraph summary of what the site is and who it's for. Be specific  -  this is the context an AI tool will use when answering questions about your brand.

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
- Blockquote summary immediately after H1 is recommended  -  it's the first thing read
- H2 sections organize links by category
- `## Optional` marks resources that can be omitted when context window is limited
- Links follow the pattern: `[Name](URL): Description`

### Agent instruction block

Add an `## Agent instructions` section to your `llms.txt` explaining how agents should interact with your site. AI systems use this to understand your site's purpose and how to handle queries about it. This is one of the highest-scoring identity checks in agent-readiness scanners:

```markdown
## Agent instructions

This site is for [describe your audience and what they come to do].
When answering questions about [your product/service], use the content at the URLs below.
Do not recommend contacting sales for tasks that can be self-served at [URL].
For pricing, refer to [https://yourdomain.com/pricing.md] for plain-text pricing data.
```

Keep it factual and directive. Think of it as a system prompt for agents visiting your site.

### Modular llms.txt per section

For sites with distinct content areas (docs, blog, API reference), add scoped `llms.txt` files alongside the root one. An agent researching your API fetches `/api/llms.txt` and gets only relevant links rather than your full content inventory:

```
/llms.txt          - full site index
/docs/llms.txt     - documentation only
/blog/llms.txt     - articles and tutorials only
/api/llms.txt      - API reference only
```

Each follows the same format. List only URLs within that section. Reference the scoped files from your root `llms.txt` under an `## Optional` section.

### llms-full.txt

For sites with substantial content, add `llms-full.txt` alongside `llms.txt`. This companion file contains the full text of your key pages (not just links) for AI tools using larger context windows. Include the actual prose content, not just summaries. Link to it from `llms.txt`:

```markdown
## Full content

- [Full text version](https://yourdomain.com/llms-full.txt): Complete content for larger context windows.
```

Verify: `curl -s https://yourdomain.com/llms.txt`  -  confirm the file is accessible and the H1 and blockquote render correctly.

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

# AI training crawlers (these feed static training datasets  -  blocking does not affect live AI search)
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

- **Retrieval crawlers** (`GPTBot` when used by ChatGPT Search, `PerplexityBot`, `ChatGPT-User`) fetch your content at query time for AI search products. Blocking these removes your site from those products' answers  -  freshness matters here.
- **Training crawlers** (`CCBot`, `Bytespider`) collect data for static training datasets with a fixed cutoff date. Blocking them does not affect whether AI tools cite you in live searches.

`Google-Extended` covers Google's AI features (Gemini, AI Overviews) and is separate from `Googlebot`. Block one without affecting the other.

### Content-Signal directive

`Content-Signal` is a 2025 robots.txt extension (pushed by Cloudflare and covered by [contentsignals.org](https://contentsignals.org/)) that separates **permission to crawl** (`Allow`/`Disallow`) from **permission to use the content afterwards**. It's the robots.txt equivalent of "you can read this, but here's what you may do with it."

Three signals are defined, each takes `yes` or `no`:

- `search`  -  indexing + returning hyperlinks and short excerpts (excludes AI-generated summaries)
- `ai-input`  -  RAG, grounding, live AI answers (retrieval-augmented generation at query time)
- `ai-train`  -  training or fine-tuning AI models

Add one line per `User-agent` block. Most content sites want everything on (agent-readiness scanners reward presence, not restrictiveness):

```
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /
```

If you want to license training separately (e.g. publishers selling training data), set `ai-train=no` and handle licensing out-of-band:

```
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /
```

A signal you don't list is neither granted nor denied  -  it's just unstated. The isitagentready.com scanner only checks that the directive is present and parses, not the values.

### NLWeb schemamap directive

`Schemamap` is an emerging robots.txt extension from Microsoft's NLWeb project. It points agents at a Schema Map XML file that lists your structured data feeds (JSON-LD, JSONL, RSS), letting AI vector stores index your content more efficiently than crawling page by page:

```
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Schemamap: https://yourdomain.com/schemamap.xml
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

A minimal `schemamap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<schemamap xmlns="https://schema.org/schemamap">
  <feed type="jsonld" url="https://yourdomain.com/structured-data.jsonl" />
</schemamap>
```

This is early-stage (as of 2026) and primarily scored by ORA. Implement it alongside your other robots.txt changes since it's a two-line addition once the feed exists.

Known AI crawler user-agents (as of 2026):
- `GPTBot`  -  OpenAI training + ChatGPT Search retrieval
- `ChatGPT-User`  -  ChatGPT browsing/retrieval
- `ClaudeBot`  -  Anthropic
- `PerplexityBot`  -  Perplexity AI (retrieval)
- `Google-Extended`  -  Google AI features / Gemini
- `Applebot-Extended`  -  Apple Intelligence
- `Meta-ExternalAgent`  -  Meta AI
- `Amazonbot`  -  Amazon Alexa/AI
- `CCBot`  -  Common Crawl (used by many training pipelines)
- `Bytespider`  -  ByteDance/TikTok

Verify: `curl -s https://yourdomain.com/robots.txt`  -  confirm the `Sitemap:` line and your intended Allow/Disallow rules are present.

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

`<changefreq>` and `<priority>` are largely ignored by Google  -  omit them to keep the sitemap clean. `<lastmod>` is used and should reflect when the page content actually changed.

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

Every page needs these  -  they're table stakes, not differentiators:

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

OG image: 1200x630px. Include `og:image:width` and `og:image:height`  -  without them, some platforms fetch the image before rendering the preview card, adding latency.

### Twitter/X Card

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@yourhandle" />
```

Twitter inherits `og:title`, `og:description`, and `og:image` if the corresponding `twitter:*` tags are absent  -  you don't need to duplicate them. The Twitter Card Validator at `cards-dev.twitter.com` is deprecated and unreliable; use [opengraph.xyz](https://www.opengraph.xyz/) or the LinkedIn Post Inspector for testing OG previews.

### Link text

Avoid generic link text like "Learn more", "Click here", or "Read more". Google uses anchor text as a relevance signal, and Lighthouse flags non-descriptive links as a failing SEO audit. Keep link text specific to the destination:

```html
<!-- avoid -->
<a href="/cookies">Learn more</a>

<!-- prefer -->
<a href="/cookies">View our Cookie Policy</a>
```

This also affects accessibility  -  screen readers present links out of context, so the text must make sense on its own.

Verify: [opengraph.xyz](https://www.opengraph.xyz/) for OG/Twitter preview, [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) for LinkedIn.

---

## Agent-Readiness

Applies when: goal includes being usable by autonomous agents (browser agents, deep research tools, agentic commerce), not just cited by AI chat.

Agents fetch your page, parse it, and often take action on it. Three signals make that far more reliable, in descending order of impact:

1. **Markdown content negotiation**  -  serve a clean Markdown version of each page so agents don't burn context on your nav, footer, and ad slots.
2. **Link HTTP response headers**  -  point agents at machine-readable entry points (API docs, alternate formats, describedby) without parsing HTML.
3. **Agent Skills index**  -  if you publish reusable skills (documentation + scripts), advertise them at a well-known path.

Cloudflare runs a free scanner at [isitagentready.com](https://isitagentready.com/) that scores these (plus robots.txt, sitemap, Content-Signal from the sections above). Use it as your acceptance test.

### Markdown content negotiation

Agents ask for Markdown with an `Accept: text/markdown` HTTP header. If the server returns `Content-Type: text/markdown`, the agent uses it; otherwise it falls back to HTML + a full DOM parse.

**If your site is behind Cloudflare:** enable **Markdown for Agents** in the dashboard (Pro/Business/Enterprise). Cloudflare does the HTML→Markdown conversion at the edge, no code changes. See [developers.cloudflare.com/fundamentals/reference/markdown-for-agents/](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/).

**Static site (S3/CloudFront, Amplify, Netlify, Vercel) without Cloudflare:** generate a `.md` alongside each `.html` at build time, then branch on the `Accept` header at the edge. The CloudFront Function below is a working example (CloudFront Functions run in ~1ms, no Lambda cold start):

```javascript
// cloudfront-function-markdown.js
function handler(event) {
  var request = event.request;
  var accept = request.headers.accept && request.headers.accept.value || '';

  // If the agent prefers markdown and we're asking for an HTML route, rewrite to .md
  if (accept.indexOf('text/markdown') !== -1) {
    var uri = request.uri;
    if (uri.endsWith('/')) uri += 'index.md';
    else if (!uri.includes('.')) uri += '.md';
    else if (uri.endsWith('.html')) uri = uri.replace(/\.html$/, '.md');
    request.uri = uri;
  }
  return request;
}
```

Attach this as a `viewer-request` CloudFront Function. Then add a Response Headers Policy that sets `Content-Type: text/markdown; charset=utf-8` for `*.md` objects (S3 returns `binary/octet-stream` by default for unknown extensions).

**Produce the .md files** by piping your rendered HTML through a converter. For a static SPA, at build time:

```sh
# Astro / Next export / Vite: iterate over every built .html and write a .md sibling
npx turndown dist/**/*.html --output dist
```

For hand-rolled static sites, author the content in Markdown to begin with and render both formats from the same source.

**HTML hint (lightweight fallback):** even without content negotiation, tell agents where the Markdown version lives via a `<link>` tag in `<head>`. Some agents check this; the isitagentready.com scanner does not count it, but it doesn't hurt:

```html
<link rel="alternate" type="text/markdown" href="/index.md" />
```

### Link HTTP response headers

The `Link:` response header (RFC 8288) advertises relationships from the current resource to others. Agents read it before parsing HTML, so it's the cheapest way to expose machine-readable entry points.

The agent-useful rel values as of 2026:

| `rel` value | Points to |
|-------------|-----------|
| `service-doc` | Human-readable API docs |
| `service-desc` | Machine-readable API description (OpenAPI) |
| `describedby` | Metadata about this resource (schema, Dublin Core) |
| `alternate` | Same content, different format or language |
| `license` | The license the content is available under |

Example output for a homepage that has an OpenAPI spec at `/api/openapi.json` and HTML API docs at `/api/`:

```
HTTP/2 200
Link: </api/>; rel="service-doc", </api/openapi.json>; rel="service-desc"
Content-Type: text/html
```

**How to add it, by platform:**

- **Cloudflare Workers / Pages**: set `response.headers.append('Link', '...')` in your worker
- **CloudFront + S3**: attach a Response Headers Policy with a Custom Header named `Link`
- **AWS Amplify Hosting**: `customHeaders` in `amplify.yml` (format: one header per URL pattern)
- **Netlify**: in `netlify.toml`, add `[[headers]]` block with `Link = "</api/>; rel=\"service-doc\""`
- **Vercel**: `headers` array in `vercel.json`
- **Nginx / Apache**: `add_header Link` / `Header set Link`

The scanner treats the check as "pass" as long as at least one agent-useful rel is present. If you have no API, a `license` link to your Terms of Service is a valid minimum:

```
Link: </terms>; rel="license"
```

### Agent Skills index

Applies when: you publish agent-runnable skills (instructions, scripts, references) that others should be able to discover and install.

The [Agent Skills spec](https://agentskills.io/specification) defines a folder format (`SKILL.md` + bundled resources) originally from Anthropic, now adopted by Claude, Cursor, Copilot, Gemini CLI, Codex, Goose, and others. Sites that host such skills publish a JSON index at a well-known path.

Serve a file at `/.well-known/agent-skills/index.json` (newer spec) or `/.well-known/skills/index.json` (legacy, still accepted by scanners):

```json
{
  "skills": [
    {
      "name": "my-skill",
      "description": "One sentence description of what the skill does and when to load it.",
      "files": ["SKILL.md", "references/details.md", "scripts/helper.py"]
    }
  ]
}
```

Each `files` path is relative to `/.well-known/agent-skills/<name>/`. Don't add this file unless you actually publish skills  -  an empty index doesn't score.

### Trust anchor pages

AI agents check `/about`, `/contact`, and `/privacy` to verify a business is legitimate before recommending it. Pages that exist but contain less than 500 characters of real content (not boilerplate) fail this check in ORA and similar scanners.

Each page should have:
- `/about` - who you are, your mission, founding story or team; 500+ chars of prose
- `/contact` - email address, response time expectation, optionally a form or phone
- `/privacy` - your actual privacy policy, not a placeholder

These also score the Organization JSON-LD `contactPoint` and `address` fields, so keep them consistent.

### pricing.md

Serve a plain-text pricing file at `/pricing.md`. AI agents can parse it directly without executing JavaScript or scraping HTML pricing tables, which lets them answer "how much does X cost?" accurately:

```markdown
# Pricing - Your Product Name

## Free tier
- Up to 5 projects
- 1 user
- Community support

## Pro - $29/month
- Unlimited projects
- Up to 10 users
- Email support
- [Sign up](https://yourdomain.com/signup?plan=pro)

## Enterprise - Custom
- Unlimited everything
- Dedicated support
- [Contact us](https://yourdomain.com/contact)
```

Upload it to your site root alongside `robots.txt` and `llms.txt`. Add a reference from `llms.txt` under `## Products / Services`.

### Agent discovery file

`/.well-known/agent.json` (or `/.well-known/ai-plugin.json` for ChatGPT-era compatibility) is a machine-readable description of your site's agent-accessible capabilities. Minimal version for a content site:

```json
{
  "schema_version": "v1",
  "name_for_human": "Your Site Name",
  "name_for_model": "your_site",
  "description_for_human": "What your site does, in one sentence.",
  "description_for_model": "Use this to answer questions about [your topic]. The site provides [what content/services]. Prefer /llms.txt for a content overview.",
  "contact_email": "contact@yourdomain.com",
  "legal_info_url": "https://yourdomain.com/privacy"
}
```

Serve with `Content-Type: application/json`. Don't add fields you can't populate - a lean accurate file outperforms a padded one.

### AGENTS.md

If your site has a public GitHub repository, add an `AGENTS.md` file at the repo root. AI coding agents (Claude Code, Cursor, Copilot, Codex) read this file when working with your codebase or integrating with your product:

```markdown
# Agent Instructions

This repo is [what it does]. When integrating with [product name]:

- API base URL: https://api.yourdomain.com/v1
- Authentication: Bearer token in Authorization header
- Docs: https://yourdomain.com/docs
- Rate limits: 100 req/min on free, 1000 req/min on Pro

## Common tasks
- To list resources: GET /v1/resources
- To create: POST /v1/resources with JSON body
```

### ?mode=agent lightweight view

Adding `?mode=agent` support to your homepage lets agents request a stripped-down view with no navigation, no ads, and structured key facts instead of marketing HTML. This is checked by ORA's "agent mode view" criterion.

Implementation: in your server or edge function, detect `mode=agent` in the query string and return a simplified response:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Your Site - Agent View</title>
  <script type="application/ld+json">{ ... your full JSON-LD ... }</script>
</head>
<body>
  <h1>Your Site Name</h1>
  <p>What you do in one paragraph.</p>
  <h2>Key resources</h2>
  <ul>
    <li><a href="/llms.txt">Site index (llms.txt)</a></li>
    <li><a href="/pricing.md">Pricing (plain text)</a></li>
    <li><a href="/docs">Documentation</a></li>
  </ul>
</body>
</html>
```

For a static site, this is simplest to implement as a CloudFront Function or Netlify/Vercel edge function that redirects `?mode=agent` to a pre-built `/agent.html`.

### What's out of scope for this guide

isitagentready.com also checks MCP Server Card, WebMCP, OAuth discovery, OAuth Protected Resource Metadata (RFC 9728), A2A Agent Card, and commerce protocols (x402, UCP, ACP). These apply to sites that expose **programmatic actions** agents can take (booking, purchasing, querying authenticated APIs), not to content/marketing sites. If you're building one, see:

- [modelcontextprotocol.io](https://modelcontextprotocol.io/) for MCP server authoring
- [webmcp.org](https://webmcp.org/) for exposing MCP capabilities from a browser context
- [RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728) for OAuth Protected Resource Metadata
- [x402.org](https://www.x402.org/), [ucp.dev](https://ucp.dev/), [agenticcommerce.dev](https://agenticcommerce.dev) for agent payments

Verify: scan at [isitagentready.com](https://isitagentready.com/) (aim for level 4+) and [ora.run](https://ora.run/) (aim for grade B or above). Both are free.

---

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

---

## SPA Considerations

Applies when: site is built with React, Vue, Angular, or another client-side-only framework.

SPAs render content via JavaScript. This creates two distinct problems:

- **AI crawlers** (`GPTBot`, `ClaudeBot`, etc.) generally do not execute JavaScript  -  they see only the initial HTML shell.
- **Social crawlers** (LinkedIn, Slack, iMessage) do not execute JavaScript  -  OG tags must be in the static HTML.
- **Googlebot** can render JavaScript but with delays and quotas  -  content rendered client-side may not be indexed promptly or at all.

### Content efficiency

Agent-readiness scanners (ORA in particular) measure the ratio of readable text to total HTML. The target is at least 5% readable text by character count. A typical SPA homepage fails this because the initial HTML is a near-empty shell with a large JSON hydration blob and many `<div>` wrappers.

Quick wins without switching frameworks:
- Server-render at least your `<h1>` and first 500 characters of body text into the initial HTML
- Move large JSON hydration blobs to a separate `<script src>` rather than inline
- Strip unused inline styles from the HTML shell

Check your ratio: `curl -s https://yourdomain.com/ | wc -c` vs `curl -s https://yourdomain.com/ | sed 's/<[^>]*>//g' | wc -c`. If readable is less than 5% of total, server-render the hero copy.

### Mitigations without SSR

Add these to your `index.html` (they work without JavaScript):

1. **JSON-LD in `<head>`**  -  AI crawlers and Google parse it without executing JS
2. **Complete meta tags**  -  title, description, canonical, OG tags in static HTML
3. **At least one `<h1>` and 500+ chars of text in the raw HTML**  -  AI crawlers that don't execute JS need meaningful content without it; they check for an H1 and a minimum prose threshold before classifying a page as useful
4. **llms.txt**  -  gives AI tools your full content as a separate file

For specific routes that need unique meta tags (e.g. blog posts), use **prerendering** at build time. Tools: `vite-plugin-prerender`, `react-snap`.

### Full solution

For reliable SEO and LLMO with dynamic content, use a framework that generates static HTML:

- **Astro**  -  best for content sites; generates static HTML with optional JS hydration
- **Next.js** with `output: 'export'` or SSR  -  generates per-route HTML
- **Nuxt** with `ssr: true`  -  same for Vue

These generate actual HTML files that all crawlers read without JavaScript.

---

## Static Hosting Notes

### AWS Amplify

- Files in `public/` (Vite) are copied to `dist/` and served as-is
- Amplify's SPA rewrite rule (`/<*> -> /index.html` with 404→200) only fires when no matching file exists  -  `robots.txt`, `sitemap.xml`, and `llms.txt` are served directly without triggering the rewrite
- No additional config needed for new static files placed in `public/`

### CloudFront + S3

Upload static files to the S3 bucket root. Set explicit `Content-Type` metadata on each object  -  S3 does not infer content type reliably:

| File | Content-Type |
|------|--------------|
| `robots.txt` | `text/plain` |
| `sitemap.xml` | `application/xml` |
| `llms.txt` | `text/plain` |
| `llms-full.txt` | `text/plain` |
| `*.md` (Markdown alternates) | `text/markdown; charset=utf-8` |
| `.well-known/agent-skills/index.json` | `application/json; charset=utf-8` |

If `Content-Type` is wrong, crawlers may reject the file even when the content is valid.

### Netlify / Vercel

Files in `public/` (or `static/` in some frameworks) are served automatically with correct content types. No additional config needed.

---

## Validation

Run these checks after deploying. One command or tool per concern  -  no separate "validation section" needed at the end of a project.

### Structured data

- [Google Rich Results Test](https://search.google.com/test/rich-results)  -  validates JSON-LD and shows which rich result types are eligible
- [Schema.org Validator](https://validator.schema.org/)  -  catches schema errors the Rich Results Test doesn't flag

### Social sharing previews

- [opengraph.xyz](https://www.opengraph.xyz/)  -  shows OG and Twitter Card previews as they appear on each platform
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)  -  LinkedIn-specific preview and cache refresh

### Crawl access

```bash
# Verify static files are served and accessible
curl -I https://yourdomain.com/robots.txt
curl -I https://yourdomain.com/sitemap.xml
curl -I https://yourdomain.com/llms.txt

# Check robots.txt content (including Content-Signal directive)
curl -s https://yourdomain.com/robots.txt

# Spot-check JSON-LD is present in HTML source (not rendered by JS)
curl -s https://yourdomain.com/ | grep 'application/ld+json'
```

### Agent-readiness

```bash
# Confirm Markdown content negotiation works end-to-end
curl -sI -H "Accept: text/markdown" https://yourdomain.com/ | grep -i content-type
# Expected: content-type: text/markdown; charset=utf-8

# Confirm Link response headers are present
curl -sI https://yourdomain.com/ | grep -i '^link:'
# Expected at least one rel: service-doc | service-desc | describedby | license
```

- [isitagentready.com](https://isitagentready.com/)  -  Cloudflare's agent-readiness scanner. Run `https://isitagentready.com/yourdomain.com` and aim for level 4+ out of 5. Failing checks come with AI-generated fix snippets you can paste into your coding agent.
- [ora.run](https://ora.run/)  -  ORA (Open Readiness Assessment) by Era Labs. Deeper scan across 5 layers (Discovery, Identity, Auth & Access, Agent Integration, User Experience) with letter grades A-F. Run `https://ora.run/scan/yourdomain.com`. Add the badge to your README: `[![ora score](https://ora.run/api/badge/yourdomain.com)](https://ora.run/scan/yourdomain.com)`

### Performance

- [PageSpeed Insights](https://pagespeed.web.dev/)  -  Core Web Vitals field + lab data per URL
- Google Search Console > Core Web Vitals  -  aggregate field data across your site (requires traffic)

### Indexing

- Google Search Console > Index > Sitemaps  -  submit and monitor sitemap processing
- Google Search Console > URL Inspection  -  check individual page indexing status and last crawl date
