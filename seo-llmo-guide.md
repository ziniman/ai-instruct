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

JSON-LD (JavaScript Object Notation for Linked Data) is the highest-impact addition for both SEO and LLMO. Add it in `<head>`. Set expectations correctly: Google states that AI Overviews and AI Mode need no special schema.org markup (as of 2026), so the payoff is rich result eligibility in Google plus unambiguous entity data for other AI tools and agents that parse it. Keep every value consistent with the visible page text.

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

Use only on pages with a genuine, visible Q&A section. Google stopped showing FAQ rich results for all sites on May 7, 2026 and removed the documentation in June 2026, so FAQPage no longer changes how you appear in Google Search. The markup is still valid schema.org and harmless to keep; its remaining value is giving other AI tools and agent-readiness scanners a clean question/answer structure. Do not add it to pages just to chase a rich result:

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

Key fields for AI visibility: `description` (write it to stand alone, without surrounding page context), `offers.availability` (keep it accurate and current - AI tools actively surface in-stock status), and `aggregateRating` (AI shopping results weight social proof heavily). Only mark up ratings that come from real reviews shown on the page: Google's review snippet guidelines (updated July 2026) explicitly cover fake and undisclosed incentivized reviews.

If the product has variants (sizes, colors), add a `hasVariant` array or use `variesBy` - see [schema.org/Product](https://schema.org/Product) for the full spec.

### SoftwareApplication schema

Applies when: site type is a web app, SaaS product, or developer tool.

`SoftwareApplication` is the right schema type when your product IS the software - as opposed to `Product` for physical goods or `Service` for professional services. Add it alongside `Organization` and `WebSite` in the `@graph` array. Without it, agents can identify that an organization exists but cannot programmatically identify your product type:

```json
{
  "@type": "SoftwareApplication",
  "@id": "https://yourdomain.com/#app",
  "name": "App Name",
  "description": "What the app does and who it's for. Write for someone who has never used it.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://yourdomain.com",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "provider": { "@id": "https://yourdomain.com/#org" }
}
```

`applicationCategory` describes what the app does, not where it runs. Common values from Google's supported list: `BusinessApplication`, `DeveloperApplication`, `EducationalApplication`, `FinanceApplication`, `UtilitiesApplication`. `WebApplication` is not a category; it is a schema.org subtype. To say "this runs in the browser", set `"@type": "WebApplication"` (or `MobileApplication`), which Google also supports.

For the `offers` block: set `"price": "0"` for free apps; use the actual price for paid tiers; if pricing is contact-based, omit `offers` and point to `/pricing.md` instead. Google's Software App rich result requires `offers.price` plus either `aggregateRating` or `review` (as of 2026). Without real ratings the markup still identifies your product to parsers and agents, but it will not earn a rich result. Never invent ratings to qualify.

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

`Speakable` marks which sections of a page are suited to being read aloud. Keep expectations low: Google's support is still beta and limited to English-language news content read by Google Assistant on Google Home devices in the US (as of 2026). It is optional for everyone else; add it only if you publish news or it costs you nothing. Point it at your main heading and key summary:

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

**Other useful types:** `BreadcrumbList`, `Event`, `Review` / `AggregateRating`, `VideoObject`, `ProfilePage`. All of these still have Google rich result features as of October 2026. `FAQPage` and `HowTo` no longer produce Google rich results; check the [Search Gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) for the current list before promising a rich result.

Verify: [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema.org Validator](https://validator.schema.org/)

---

## llms.txt and llms-full.txt

Applies when: goal includes AI tool visibility.

`llms.txt` is an emerging convention (a community proposal at [llmstxt.org](https://llmstxt.org/), not a ratified standard as of 2026) for giving AI tools a structured, Markdown-formatted overview of your site. Place it at your site root so it's served at `https://yourdomain.com/llms.txt`.

Know who reads it. Google stated in June 2026 that Google Search does not use `llms.txt` and that it neither helps nor hurts visibility or rankings. Its audience is AI assistants, coding agents, and agent-readiness scanners (ORA, the agent-readiness scanner at ora.ai by Era Labs, scores its presence, formatting, and whether its links resolve). Never present it to a user as a Google ranking factor.

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
- H1 (site name) is the only required element
- Blockquote summary immediately after H1 is recommended  -  it's the first thing read
- H2 sections organize links by category
- `## Optional` marks resources that can be omitted when context window is limited
- Links follow the pattern: `[Name](URL): Description`

### Agent instruction block

Add an `## Agent instructions` section to your `llms.txt` explaining how agents should interact with your site. AI systems use this to understand your site's purpose and how to handle queries about it. ORA scores this as a required check ("Agent instruction / when-to-use") and wants specific best-fit use cases, not marketing copy:

```markdown
## Agent instructions

This site is for [describe your audience and what they come to do].
When answering questions about [your product/service], use the content at the URLs below.
Do not recommend contacting sales for tasks that can be self-served at [URL].
For pricing, refer to [https://yourdomain.com/pricing.md] for plain-text pricing data.
Self-serve signup: [available at /signup with no credit card required / not available - direct users to contact@yourdomain.com].
API access: [free with account at /signup / requires paid plan - see /pricing.md / not available for this site].
```

Keep it factual and directive. Think of it as a system prompt for agents visiting your site.

The onboarding lines matter: agents that recommend products to users often try to automate signup or API key generation. If that's not possible, say so explicitly. "Not available" is a complete and useful answer - agents use it to correctly redirect users to the right channel instead of telling them to "just sign up" when no self-serve flow exists.

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

A complete robots.txt that explicitly handles search crawlers, AI search crawlers, user-triggered AI fetchers, and AI training crawlers. Add this to your `public/` directory (or site root):

```
# Default for any crawler not named below
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /

# Search engines and AI search crawlers (these decide whether you are cited in AI answers)
User-agent: Googlebot
User-agent: Bingbot
User-agent: OAI-SearchBot
User-agent: Claude-SearchBot
User-agent: PerplexityBot
User-agent: Amzn-SearchBot
User-agent: meta-webindexer
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /

# User-triggered fetchers (a person asked an AI to open this page; some vendors say robots.txt may not apply)
User-agent: ChatGPT-User
User-agent: Claude-User
User-agent: Perplexity-User
User-agent: Meta-ExternalFetcher
User-agent: Amzn-User
User-agent: Google-Agent
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /

# AI training crawlers and training control tokens (blocking these does not remove you from AI search answers)
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: Meta-ExternalAgent
User-agent: Amazonbot
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /

User-agent: CCBot
User-agent: Bytespider
Content-Signal: search=no, ai-input=no, ai-train=no
Disallow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

Under RFC 9309, a crawler that finds a group naming its user agent obeys that group (if several groups name it, their rules are merged) and ignores the `*` group entirely. So repeat `Content-Signal` in every group rather than only under `*`. Multiple `User-agent` lines can share one group, which keeps the file short.

### Training crawlers vs. search crawlers vs. user fetchers

Most AI vendors now run three separate agents (as of 2026), and blocking each has a different effect:

- **AI search crawlers** (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Amzn-SearchBot`, `meta-webindexer`) index your pages for AI search products. Blocking these removes or reduces your site in those products' answers.
- **User-triggered fetchers** (`ChatGPT-User`, `Claude-User`, `Perplexity-User`, `Meta-ExternalFetcher`, `Amzn-User`, `Google-Agent`) load a page because a person asked an assistant or agent to. OpenAI, Perplexity, Meta, Amazon, and Google each state their fetchers may not follow robots.txt, since a human initiated the request; Anthropic says its bots, including `Claude-User`, honor it. ORA scores whether your robots.txt states a policy for `ChatGPT-User`, `Claude-User`, and `Perplexity-User`, but general rules and the default (`*`) count, so naming each fetcher is optional; do it when you want a policy different from `*`.
- **Training crawlers** (`GPTBot`, `ClaudeBot`, `Meta-ExternalAgent`, `Amazonbot`, `CCBot`, `Bytespider`) collect data that may be used to train models (Meta says `Meta-ExternalAgent` is also used to improve products by indexing content directly). Blocking them does not affect whether AI tools cite you in live searches. OpenAI states that `GPTBot` and `OAI-SearchBot` are controlled independently; `GPTBot` is not the ChatGPT search crawler.

**Control tokens are not crawlers.** `Google-Extended` and `Applebot-Extended` never fetch pages; they only tell Google and Apple whether content their main crawlers already fetched may be used for AI. `Google-Extended` controls Gemini model training and grounding in Gemini Apps and Vertex AI. It does **not** affect Google Search inclusion or ranking, and it is not the control for AI Overviews or AI Mode, which are part of Search. To limit what Google shows in AI Overviews and AI Mode, use the same controls as regular Search: `nosnippet`, `data-nosnippet`, `max-snippet`, or `noindex`. Blocking `Applebot-Extended` opts out of Apple's foundation model training without affecting Spotlight, Siri, or Safari results.

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

A signal you don't list is neither granted nor denied  -  it's just unstated. The isitagentready.com scanner only checks that the directive is present and parses, not the values. Cloudflare's Markdown for Agents also sends a `Content-Signal` response header on Markdown responses (your origin's value if set, otherwise all three set to `yes`).

**Standards status (as of October 2026):** `Content-Signal` is a Cloudflare-led convention, not an IETF standard; its individual Internet-Draft (`draft-romm-aipref-contentsignals`) expired in April 2026. Separately, the IETF AIPREF working group is drafting a `Content-Usage` robots.txt rule and HTTP header with different labels (`train-ai`, `ai-use`, `search`, values `y`/`n`), for example `Content-Usage: train-ai=n`. Those drafts (`draft-ietf-aipref-vocab`, `draft-ietf-aipref-attach`) are still in progress and the vocabulary is explicitly marked as lacking consensus. Use `Content-Signal` today because that is what scanners check; watch AIPREF and do not present `Content-Usage` as a finished standard.

### NLWeb schemamap directive

`schemamap` is a robots.txt extension from the NLWeb project's Schema Feeds proposal (v0.1 draft, January 2026). It points agents at a Schema Map file that lists your aggregated structured data feeds (JSON Lines of schema.org objects, or RSS), so they can fetch all your structured data without crawling page by page. The spec says it follows the `Sitemap` pattern and its example puts it next to `Sitemap:`, so this guide reads it as a standalone line placed outside `User-agent` groups:

```
Sitemap: https://yourdomain.com/sitemap.xml
schemamap: https://yourdomain.com/schemamap.xml
```

The Schema Map reuses the sitemap format. The spec puts the content type in an `sf:contentType` element, while the NLWeb reference crawler reads a `contentType` attribute on `<url>`; include both so either parser finds it:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:sf="http://schema.org/schemas/schemafeed/0.1">
  <url contentType="structuredData/schema.org">
    <loc>https://yourdomain.com/feeds/structured-data.jsonl</loc>
    <lastmod>2026-10-01</lastmod>
    <sf:contentType>structuredData/schema.org</sf:contentType>
  </url>
</urlset>
```

Each line of the `.jsonl` feed is one complete schema.org JSON-LD object. This is a proposal, not a standard; ORA lists it as an emerging-tier check worth at most 1 point (as of October 2026). Add it only once you can generate the feed from the same source as your on-page JSON-LD.

Known AI crawler user-agents (as of October 2026):

| Vendor | Search / indexing | User-triggered | Training |
|--------|-------------------|----------------|----------|
| OpenAI | `OAI-SearchBot` | `ChatGPT-User` | `GPTBot` |
| Anthropic | `Claude-SearchBot` | `Claude-User` | `ClaudeBot` |
| Perplexity | `PerplexityBot` | `Perplexity-User` | (none) |
| Google | `Googlebot` (also feeds AI Overviews / AI Mode) | `Google-Agent` | `Google-Extended` (control token, no crawling) |
| Apple | `Applebot` | (none) | `Applebot-Extended` (control token, no crawling) |
| Meta | `meta-webindexer` | `Meta-ExternalFetcher` | `Meta-ExternalAgent` (training and product indexing) |
| Amazon | `Amzn-SearchBot` | `Amzn-User` | `Amazonbot` |
| Common Crawl | (none) | (none) | `CCBot` (open dataset used by many training pipelines) |
| ByteDance | (none) | (none) | `Bytespider` |

Older tokens such as `anthropic-ai` and `claude-web` are no longer listed in Anthropic's documentation; you do not need to add them.

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

> **Explicit absence beats silence.** For every agent-facing resource in this section, "this doesn't apply to my site" should be stated somewhere an agent will look - not left as silence. For free-form files like `pricing.md`, that means a short file that says so. When an agent requests `pricing.md` and gets a 404, it doesn't know whether your product is free, pricing is hidden, or the file just doesn't exist yet. All three look identical from outside. A `pricing.md` that says "this service is free" resolves the ambiguity immediately. For protocol files with strict schemas (the A2A Agent Card, MCP Server Cards), do not publish an empty stub: their specs make an empty card invalid. Express absence in two spec-clean ways instead: (a) declare it in `llms.txt` (see the `## Agent protocols` block below), and (b) serve a real `404` with a short Markdown body for the missing path, saying what is missing and pointing to `/llms.txt` (SPA hosts return a soft 200 here unless you configure them; see Static Hosting Notes). ORA's "Agent-friendly 404s" check gives partial credit for a real 404 or 410 status and full credit when a Markdown error body is also available.

> **Agentic search discoverability.** Agent-readiness scanners like ORA also test whether agents can find your site when searching for your brand name, your use case, or your developer resources - three checks worth about 12 of ORA's 100 points combined (as of October 2026). It's primarily a content strategy concern: building topical authority through tutorials, comparison pages, and use-case landing pages. The technical baseline: make sure your product name is in your `<h1>` and page title, and list all developer resources (API docs, OpenAPI spec, SDKs) in `llms.txt` so they're findable by name.

Cloudflare runs a free scanner at [isitagentready.com](https://isitagentready.com/) that scores these (plus robots.txt, sitemap, Content-Signal from the sections above). Use it as your acceptance test. It offers **All Checks**, **Content Site**, and **API / Application** scan types; use Content Site for sites without an API.

### Markdown content negotiation

Agents ask for Markdown with an `Accept: text/markdown` HTTP header. If the server returns `Content-Type: text/markdown`, the agent uses it; otherwise it falls back to HTML + a full DOM parse. Also return `Vary: Accept`, so shared caches never serve the Markdown version to a browser (or HTML to an agent). ORA checks for `Vary: Accept` on the homepage's Markdown response, and browsers must still get HTML.

**If your site is behind Cloudflare:** turn on **Markdown for Agents** under AI Crawl Control in the dashboard (Pro, Business, and Enterprise plans plus SSL for SaaS, as of October 2026). Cloudflare converts HTML to Markdown at the edge and sets `Vary: Accept` for you, no code changes. Only HTML up to 6 MiB is converted. See [developers.cloudflare.com/fundamentals/reference/markdown-for-agents/](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/).

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

Attach this as a `viewer-request` CloudFront Function. Then:

- Upload every `.md` object with `Content-Type: text/markdown; charset=utf-8` metadata (for example `aws s3 cp dist/ s3://your-bucket/ --recursive --exclude "*" --include "*.md" --content-type "text/markdown; charset=utf-8"`). S3 serves whatever type the object was stored with, and guesses wrong for `.md`. A Response Headers Policy is the wrong tool here: CloudFront picks the cache behavior from the original path (`/`), before the function rewrites it to `/index.md`.
- Add a Response Headers Policy with a custom header `Vary: Accept` to the cache behavior that serves your pages.

**Produce the .md files** by converting your built HTML at build time. The `turndown` package has no CLI, so use a short Node script (`npm install --save-dev turndown`):

```javascript
// scripts/html-to-md.mjs - run after your build: node scripts/html-to-md.mjs dist
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import TurndownService from 'turndown';

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
td.remove(['script', 'style', 'nav', 'footer']); // drop page chrome agents don't need

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith('.html')) {
      const html = readFileSync(path, 'utf8');
      // Prefer <main> so the Markdown holds content, not layout
      const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
      writeFileSync(path.replace(/\.html$/, '.md'), td.turndown(main));
    }
  }
}

walk(process.argv[2] ?? 'dist');
```

For hand-rolled static sites, author the content in Markdown to begin with and render both formats from the same source.

**HTML hint (lightweight fallback):** even without content negotiation, tell agents where the Markdown version lives via a `<link>` tag in `<head>`. The llms.txt proposal recommends it, and ORA scores it as a separate emerging check; the isitagentready.com scanner does not count it:

```html
<link rel="alternate" type="text/markdown" href="/index.md" />
```

### Link HTTP response headers

The `Link:` response header (RFC 8288) advertises relationships from the current resource to others. Agents read it before parsing HTML, so it's the cheapest way to expose machine-readable entry points.

The agent-useful rel values as of 2026:

| `rel` value | Points to |
|-------------|-----------|
| `api-catalog` | Your API catalog at `/.well-known/api-catalog` (RFC 9727), a list of all your APIs |
| `service-doc` | Human-readable API docs |
| `service-desc` | Machine-readable API description (OpenAPI) |
| `describedby` | Metadata about this resource (for a whole site, your `/llms.txt`) |
| `alternate` | Same content, different format or language (add `type="text/markdown"` for the Markdown version) |
| `sitemap` | Your `sitemap.xml` (not a registered IANA link relation, but ORA recognizes it) |

isitagentready.com passes the check when it finds at least one of `api-catalog`, `service-desc`, `service-doc`, or `describedby`. ORA's version of the check also looks for sitemap and Markdown alternate links.

Example output for a homepage that has an OpenAPI spec at `/api/openapi.json` and HTML API docs at `/api/`:

```
HTTP/2 200
Link: </api/>; rel="service-doc", </api/openapi.json>; rel="service-desc", </index.md>; rel="alternate"; type="text/markdown"
Content-Type: text/html
```

**How to add it, by platform:**

- **Cloudflare Workers / Pages**: set `response.headers.append('Link', '...')` in your worker
- **CloudFront + S3**: attach a Response Headers Policy with a Custom Header named `Link`
- **AWS Amplify Hosting**: `customHeaders` in `amplify.yml` (format: one header per URL pattern)
- **Netlify**: in `netlify.toml`, add `[[headers]]` block with `Link = "</api/>; rel=\"service-doc\""`
- **Vercel**: `headers` array in `vercel.json`
- **Nginx / Apache**: `add_header Link` / `Header set Link`

If you have no API, point `describedby` at your `llms.txt` (the llms.txt proposal suggests this relation) and add your sitemap and Markdown alternate:

```
Link: </llms.txt>; rel="describedby", </sitemap.xml>; rel="sitemap", </index.md>; rel="alternate"; type="text/markdown"
```

**HTML link from homepage:** ORA checks for a visible `<a>` link from your homepage HTML to your API or developer documentation as a separate check ("Public API/docs linked from homepage"), independently of the Link header. Only docs you own count. If you publish API docs, add a link in your footer or navigation:

```html
<a href="/docs">Developer documentation</a>
<!-- or -->
<a href="/developers">API reference</a>
```

Link headers handle machine-readable discovery at the HTTP layer; the HTML link handles discovery by crawlers that parse page content. Both are checked independently - passing one does not satisfy the other. If you have no public API, this check doesn't apply, but consider adding a footer link to your `llms.txt` or `pricing.md` instead so crawlers can surface them.

### Agent Skills index

Applies when: you publish agent-runnable skills (instructions, scripts, references) that others should be able to discover and install.

The [Agent Skills spec](https://agentskills.io/specification) defines a folder format (`SKILL.md` + bundled resources) originally from Anthropic, now adopted by Claude, Cursor, Copilot, Gemini CLI, Codex, Goose, and others. Sites that host such skills publish a JSON index at a well-known path, defined by Cloudflare's [Agent Skills Discovery RFC](https://github.com/cloudflare/agent-skills-discovery-rfc) (v0.2.0, still a draft as of October 2026).

Serve the index at `/.well-known/agent-skills/index.json`. Version 0.2.0 renamed the path from `/.well-known/skills/` and replaced the old `files` array with one artifact per skill, so update any index that still uses `files`:

```json
{
  "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  "skills": [
    {
      "name": "my-skill",
      "type": "skill-md",
      "description": "One sentence description of what the skill does and when to load it.",
      "url": "/.well-known/agent-skills/my-skill/SKILL.md",
      "digest": "sha256:REPLACE_WITH_64_HEX_CHARS"
    }
  ]
}
```

- `type` is `skill-md` for a single `SKILL.md` file, or `archive` for a bundle (for example `.tar.gz`) when the skill includes scripts or reference files.
- `digest` is the SHA-256 of the exact bytes served at `url`, as `sha256:` plus 64 lowercase hex characters. Generate it at build time (`shasum -a 256 SKILL.md`) because clients must reject content that doesn't match.
- `name` must be lowercase letters, digits, and hyphens, and `description` should match the `SKILL.md` frontmatter.

Both isitagentready.com and ORA validate the v0.2.0 format, and ORA's "agent discovery file" check now looks for this index. Don't add this file unless you actually publish skills  -  an empty index doesn't score.

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

**If your product has no paid tiers, still create the file.** Agents that can't find pricing often assume it's hidden or expensive. Explicit beats absent:

```markdown
# Pricing - Your Product Name

This service is free. No account or payment required.
[Get started here](https://yourdomain.com/signup)
```

For contact-based pricing:

```markdown
# Pricing - Your Product Name

Pricing is based on your requirements. [Contact us](https://yourdomain.com/contact) for a quote.
We do not have self-serve pricing; agents should direct users to the contact page.
```

### Agent discovery file

`/.well-known/agent.json` (or the older `/.well-known/ai-plugin.json` format from ChatGPT plugins) is an informal, machine-readable description of your site's agent-accessible capabilities. Treat it as optional: no standard defines it, and as of October 2026 neither isitagentready.com nor ORA checks for it (ORA's "agent discovery file" check now looks for the Agent Skills index instead). The files that scanners and agents actually read are `llms.txt`, `/.well-known/agent-card.json`, and, if you run an MCP server, an AI Catalog (see below). Add `agent.json` only if a specific consumer you care about reads it.

For a content site with no programmatic API:

```json
{
  "schema_version": "v1",
  "name_for_human": "Your Site Name",
  "name_for_model": "your_site",
  "description_for_human": "What your site does, in one sentence.",
  "description_for_model": "Use this to answer questions about [your topic]. The site provides [what content/services]. Prefer /llms.txt for a content overview.",
  "api": null,
  "contact_email": "contact@yourdomain.com",
  "legal_info_url": "https://yourdomain.com/privacy"
}
```

For a site that exposes an API or OpenAPI spec, replace `"api": null` with:

```json
"api": {
  "type": "openapi",
  "url": "https://yourdomain.com/api/openapi.json"
}
```

Serve with `Content-Type: application/json`. The `"api": null` declaration is intentional - it tells agents there is no programmatic API, which is more informative than omitting the field.

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

### A2A Agent Card

`/.well-known/agent-card.json` is the discovery document of the [Agent2Agent (A2A) protocol](https://a2a-protocol.org/latest/specification/), originally from Google, donated to the Linux Foundation, and moved into the Linux Foundation's Agentic AI Foundation (AAIF) in August 2026. It describes what agent-to-agent interactions your service supports. Both isitagentready.com and ORA (as a bonus check) probe this path.

**If you don't run an A2A agent, don't publish a card.** A2A requires `supportedInterfaces` and `skills`, and the spec states that required arrays must contain at least one element, so an "empty capabilities" card is invalid. Declare the absence in `llms.txt` and return a Markdown 404 for `/.well-known/agent-card.json` instead (see "Explicit absence beats silence" above).

A2A v1.0 (current as of October 2026) changed the card format. The required fields are `name`, `description`, `supportedInterfaces`, `version`, `capabilities`, `defaultInputModes`, `defaultOutputModes`, and `skills`; each skill requires `id`, `name`, `description`, and `tags`. The old top-level `url` field is gone: endpoints now live in `supportedInterfaces`, each with `url`, `protocolBinding` (`JSONRPC`, `GRPC`, or `HTTP+JSON`), and `protocolVersion`. Update any card written for v0.x.

**For a site that exposes an A2A agent:**

```json
{
  "name": "Your Service Name",
  "description": "What your agent does and who should use it.",
  "supportedInterfaces": [
    {
      "url": "https://yourdomain.com/a2a/v1",
      "protocolBinding": "JSONRPC",
      "protocolVersion": "1.0"
    }
  ],
  "provider": {
    "organization": "Your Company Name",
    "url": "https://yourdomain.com"
  },
  "version": "1.0.0",
  "capabilities": {
    "streaming": false,
    "pushNotifications": false
  },
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"],
  "skills": [
    {
      "id": "your-skill-id",
      "name": "Skill Name",
      "description": "What this skill does and when to invoke it.",
      "tags": ["your-domain", "your-task"]
    }
  ]
}
```

Serve with `Content-Type: application/json`.

### MCP server discovery

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) is the standard for AI assistants to call external tools and data sources. If you don't have an MCP server (or an A2A agent), say so in `llms.txt` rather than letting agents search for one that doesn't exist.

**In your `llms.txt`** - add an `## Agent protocols` section whether or not you run anything:

```markdown
## Agent protocols

No A2A agent. No MCP server.
```

Or if you do run them:

```markdown
## Agent protocols

- [MCP Server](https://yourdomain.com/mcp): What the server provides and what tools it exposes.
- [A2A Agent Card](https://yourdomain.com/.well-known/agent-card.json): What the agent does.
```

**For the protocol paths you don't serve** (`/.well-known/agent-card.json`, `/.well-known/ai-catalog.json`, `/.well-known/mcp/server-card.json`), return a real `404` with a short Markdown body rather than an HTML error page or a soft 200:

```markdown
# Not found

This site does not run an A2A agent or an MCP server.
See https://yourdomain.com/llms.txt for what is available.
```

SPA hosting turns these into soft 200s by default, because the fallback rule serves `index.html` with status 200 for every missing path. See "Static Hosting Notes" below for the Amplify and CloudFront fixes, then confirm the status:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://yourdomain.com/.well-known/agent-card.json
# Expected: 404 (a 200 means the SPA fallback is still catching it)
```

**If you run a remote MCP server, publish a Server Card and an AI Catalog.** This is MCP's official discovery mechanism: the Server Card extension (SEP-2127, where SEP means MCP Specification Enhancement Proposal; an Extensions Track proposal marked Final in October 2026, whose wire format still lives in the extension repository and may change). It has two parts:

1. A **Server Card** describing the server, served at your MCP endpoint URL plus `/server-card` (for example `https://yourdomain.com/mcp/server-card`). Its `description` must be 100 characters or fewer:

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
  "name": "com.yourdomain/your-server",
  "version": "1.0.0",
  "description": "Search and manage Your Product projects from any MCP client.",
  "title": "Your Product MCP Server",
  "websiteUrl": "https://yourdomain.com",
  "remotes": [
    {
      "type": "streamable-http",
      "url": "https://yourdomain.com/mcp"
    }
  ]
}
```

2. An **AI Catalog** at `/.well-known/ai-catalog.json` (served as `application/ai-catalog+json`) that lists the card, so clients can discover servers from your domain alone:

```json
{
  "specVersion": "1.0",
  "entries": [
    {
      "identifier": "urn:air:yourdomain.com:mcp:your-server",
      "type": "application/mcp-server-card+json",
      "url": "https://yourdomain.com/mcp/server-card"
    }
  ]
}
```

The AI Catalog is a cross-protocol format worked on by MCP, A2A, and other groups at [ai-catalog.io](https://ai-catalog.io/); it is still evolving (as of October 2026). The same catalog also serves Agentic Resource Discovery (ARD): ORA's ARD check reads `/.well-known/ard.json` and falls back to `/.well-known/ai-catalog.json`, and isitagentready.com's ARD manifest check looks for `/.well-known/ai-catalog.json`.

**Scanner compatibility only:** isitagentready.com currently looks for an older-format card at `/.well-known/mcp/server-card.json` (live scans also request `/.well-known/mcp.json`), with `serverInfo.name`, `serverInfo.version`, a transport endpoint, and `capabilities`. The Server Card extension does not recommend that path. ORA accepts the AI Catalog, a card at `<server URL>/server-card`, `/.well-known/mcp/server-card.json`, `/.well-known/mcp.json`, or the server URL in `llms.txt`, and notes that the `.well-known/mcp` paths are conventions no MCP spec defines. If you want both scanners to pass, publish the spec-track AI Catalog and card above, plus a second card in isitagentready's expected shape at `/.well-known/mcp/server-card.json`. Generate both cards from one source (the same name, version, description, and endpoint) at build time so they never drift.

**If you have no MCP server,** the `## Agent protocols` block in `llms.txt` is the explicit declaration, backed by a Markdown 404 on the discovery paths. Do not publish an empty `/.well-known/mcp.json` stub: no MCP spec defines that file or its format.

### ?mode=agent lightweight view

Adding `?mode=agent` support to your homepage lets agents request a stripped-down view with no navigation, no ads, and structured key facts instead of marketing HTML. This is ORA's "agent mode view" criterion, an emerging bonus check (as of October 2026), so do it after the Markdown negotiation above.

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

isitagentready.com and ORA also check API catalogs (RFC 9727), OAuth discovery, OAuth Protected Resource Metadata (RFC 9728), agent auth files (`auth.md`), Web Bot Auth, WebMCP, DNS-based agent discovery, and agentic commerce protocols (x402, MPP, UCP, ACP, AP2). These require active server infrastructure and only apply to sites that expose **authenticated programmatic actions** - booking, purchasing, querying user-specific data via OAuth. If you're building that, see:

- [webmcp.org](https://webmcp.org/) for exposing MCP capabilities from a browser context
- [RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728) for OAuth Protected Resource Metadata
- [x402.org](https://www.x402.org/), [ucp.dev](https://ucp.dev/), [agenticcommerce.dev](https://agenticcommerce.dev) for agent payments

MCP server discovery and the A2A Agent Card are covered above - even without implementing them, every site should declare their status explicitly in `llms.txt`.

Verify: scan at [isitagentready.com](https://isitagentready.com/) (aim for level 4+) and [ora.ai](https://ora.ai/) (formerly ora.run; aim for grade B or above). Both are free.

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

Agent-readiness scanners fetch your pages with JavaScript off. ORA's "Content without JavaScript" check (as of October 2026) wants at least 500 characters of meaningful homepage content in the raw HTML, a clear `<h1>`, sequential heading levels, and not too much non-content markup. A typical SPA homepage fails because the initial HTML is a near-empty shell with a large JSON hydration blob and many `<div>` wrappers. At the other extreme, ORA's "Page token budget" check flags pages whose extracted text exceeds about 100K characters (roughly 25K tokens); split very long reference pages into linked per-topic pages.

Quick wins without switching frameworks:
- Server-render at least your `<h1>` and first 500 characters of body text into the initial HTML
- Move large JSON hydration blobs to a separate `<script src>` rather than inline
- Strip unused inline styles from the HTML shell

Check what a non-JS agent sees: `curl -s https://yourdomain.com/ | sed 's/<[^>]*>//g' | tr -s ' \n' | head -c 1000`. If your headline and value proposition are not in that output, server-render the hero copy.

### Semantic HTML structure

AI vector stores don't just measure text volume - they parse document structure to understand hierarchy and chunk content accurately. A page where everything is in flat `<div>` elements is harder to index than one using semantic HTML, even with identical word count.

Key structural signals for AI indexability:

- **Heading hierarchy** - use `<h1>` for the page title, `<h2>` for major sections, `<h3>` for sub-sections. Don't skip levels. Agents use headings as chunk boundaries when breaking a page into retrievable segments.
- **Landmark elements** - wrap your main content in `<main>`, navigation in `<nav>`, and complementary content in `<aside>`. AI crawlers use these to separate page chrome from actual content.
- **Lists** - use `<ul>` or `<ol>` for list-like content instead of comma-separated inline text. Agents can enumerate list items; they can't reliably parse "apples, oranges, and bananas" as a structured list.
- **Tables** - use `<table>` with `<th>` headers for tabular data. Styled divs that look like a table visually are invisible to most AI parsers.
- **Descriptive attributes** - `alt` on images, `<figcaption>` for figures, `<time datetime="...">` for dates.

Check: `curl -s https://yourdomain.com/ | grep -c '<h[1-6]'` - a count of 0 means no headings at all; 1 means only an H1, no section structure. `curl -s https://yourdomain.com/ | grep -i '<main'` should return a result on every page.

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
- That same SPA rule returns `index.html` with status 200 for missing agent discovery paths. Amplify applies rules from the top of the list down, so add a `404` rule **above** the SPA rule that sends `/.well-known/` misses to a Markdown 404 file (put `404.md` in `public/`):

```json
[
  {
    "source": "/.well-known/<*>",
    "status": "404",
    "target": "/404.md",
    "condition": null
  },
  {
    "source": "/<*>",
    "status": "404-200",
    "target": "/index.html",
    "condition": null
  }
]
```

Amplify's docs describe the `404` type as showing the target page for addresses that don't exist, so files you do publish under `/.well-known/` (such as `agent-skills/index.json`) should still be served. After deploying, re-run the curl check above and confirm a file you do publish still returns 200.

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
| `.well-known/agent-card.json` (if you publish one) | `application/json; charset=utf-8` |
| `.well-known/ai-catalog.json` (if you publish one) | `application/ai-catalog+json` |

If `Content-Type` is wrong, crawlers may reject the file even when the content is valid.

**Keep `/.well-known/` misses as real 404s.** SPA setups often add a custom error response that maps 403/404 to `/index.html` with status 200. Custom error responses are set on the distribution, not per cache behavior, so they catch `/.well-known/` too. A CloudFront Function that returns a 400-or-above status bypasses custom error pages for that status, so answer the protocol paths you don't serve directly in your `viewer-request` function, before the Markdown rewrite logic:

```javascript
// Protocol discovery paths this site does not serve
var NOT_SERVED = ['/.well-known/agent-card.json', '/.well-known/ai-catalog.json', '/.well-known/mcp/server-card.json'];

function handler(event) {
  var request = event.request;
  if (NOT_SERVED.indexOf(request.uri) !== -1) {
    return {
      statusCode: 404,
      statusDescription: 'Not Found',
      headers: { 'content-type': { value: 'text/markdown; charset=utf-8' } },
      body: '# Not found\n\nThis site does not run an A2A agent or an MCP server.\nSee https://yourdomain.com/llms.txt for what is available.\n'
    };
  }
  return request; // in production, merge this check into the Markdown handler above (one viewer-request function per behavior)
}
```

Remove a path from `NOT_SERVED` when you start publishing that file.

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
# Confirm Markdown content negotiation works end-to-end (use GET, not HEAD)
curl -sL -D - -o /dev/null -H "Accept: text/markdown" https://yourdomain.com/ | grep -iE '^(content-type|vary):'
# Expected: content-type: text/markdown; charset=utf-8  and  vary: Accept
curl -sL -D - -o /dev/null -H "Accept: text/html" https://yourdomain.com/ | grep -i '^content-type:'
# Expected: content-type: text/html (browsers must still get HTML)

# Confirm Link response headers are present
curl -sI https://yourdomain.com/ | grep -i '^link:'
# Expected at least one rel: api-catalog | service-doc | service-desc | describedby
```

- [isitagentready.com](https://isitagentready.com/)  -  Cloudflare's agent-readiness scanner. Run `https://isitagentready.com/yourdomain.com` and aim for level 4+ out of 5. Failing checks come with AI-generated fix snippets you can paste into your coding agent, and `POST https://isitagentready.com/api/scan` with `{"url": "https://yourdomain.com"}` returns the same results as JSON for CI.
- [ora.ai](https://ora.ai/)  -  ORA by Era Labs (moved from ora.run, which now redirects). Scores 0-100 with letter grades A-F across four layers: Discovery, Access, Usability, and Payments (as of October 2026). Open `https://ora.ai/score/yourdomain.com`, or run `npx ax audit yourdomain.com` from the terminal. Add the badge to your README: `[![ora score](https://ora.ai/api/badge/yourdomain.com)](https://ora.ai/score/yourdomain.com)`

### Cross-platform consistency

```bash
# Check that your identity description is consistent across all agent-facing surfaces:
# 1. meta description in HTML
curl -s https://yourdomain.com/ | grep -i 'name="description"'
# 2. JSON-LD description field
curl -s https://yourdomain.com/ | python3 -c "import sys,json,re; [print(b['description']) for b in json.loads(re.search(r'application/ld\+json[^>]*>(.*?)</script>', sys.stdin.read(), re.S).group(1)).get('@graph', []) if 'description' in b]"
# 3. A2A Agent Card description (if you publish one)
curl -s https://yourdomain.com/.well-known/agent-card.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('description',''))"
# 4. llms.txt opening blockquote
curl -s https://yourdomain.com/llms.txt | head -5
```

Inconsistent descriptions across these surfaces confuse agents that cross-reference them. The meta description, the JSON-LD `description`, the Agent Card `description` (if any), and the `llms.txt` blockquote (plus `description_for_model` if you publish `agent.json`) should all describe the same product in compatible terms - not contradictory or wildly different levels of detail.

### Performance

- [PageSpeed Insights](https://pagespeed.web.dev/)  -  Core Web Vitals field + lab data per URL
- Google Search Console > Core Web Vitals  -  aggregate field data across your site (requires traffic)

### Indexing

- Google Search Console > Index > Sitemaps  -  submit and monitor sitemap processing
- Google Search Console > URL Inspection  -  check individual page indexing status and last crawl date
