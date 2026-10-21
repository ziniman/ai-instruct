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
