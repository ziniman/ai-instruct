## Agent-Readiness

Applies when: goal includes being usable by autonomous agents (browser agents, deep research tools, agentic commerce), not just cited by AI chat.

Agents fetch your page, parse it, and often take action on it. Three signals make that far more reliable, in descending order of impact:

1. **Markdown content negotiation**  -  serve a clean Markdown version of each page so agents don't burn context on your nav, footer, and ad slots.
2. **Link HTTP response headers**  -  point agents at machine-readable entry points (API docs, alternate formats, describedby) without parsing HTML.
3. **Agent Skills index**  -  if you publish reusable skills (documentation + scripts), advertise them at a well-known path.

> **Explicit absence beats silence.** For every agent-facing resource in this section, "this doesn't apply to my site" should be stated somewhere an agent will look - not left as silence. For free-form files like `pricing.md`, that means a short file that says so. When an agent requests `pricing.md` and gets a 404, it doesn't know whether your product is free, pricing is hidden, or the file just doesn't exist yet. All three look identical from outside. A `pricing.md` that says "this service is free" resolves the ambiguity immediately. For protocol files with strict schemas (the A2A Agent Card, MCP Server Cards), do not publish an empty stub: their specs make an empty card invalid. Express absence in two spec-clean ways instead: (a) declare it in `llms.txt` (see the `## Agent protocols` block below), and (b) serve a real `404` with a short Markdown body for the missing path, saying what is missing and pointing to `/llms.txt` (SPA hosts return a soft 200 here unless you configure them; see Static Hosting Notes). ORA's "Agent-friendly 404s" check gives partial credit for a real 404 or 410 status and full credit when a Markdown error body is also available.

> **Agentic search discoverability.** Agent-readiness scanners like ORA also test whether agents can find your site when searching for your brand name, your use case, or your developer resources - three checks worth about 12 of ORA's 100 points combined (as of October 2026). It's primarily a content strategy concern: building topical authority through tutorials, comparison pages, and use-case landing pages. The technical baseline: make sure your product name is in your `<h1>` and page title, and list all developer resources (API docs, OpenAPI spec, SDKs) in `llms.txt` so they're findable by name.

Cloudflare runs a free scanner at [isitagentready.com](https://isitagentready.com/) that scores these (plus [robots.txt](robots-txt-for-ai-and-search-crawlers.md), [sitemap](sitemap.md), and [Content-Signal](robots-txt-for-ai-and-search-crawlers.md#content-signal-directive)). Use it as your acceptance test. It offers **All Checks**, **Content Site**, and **API / Application** scan types; use Content Site for sites without an API.

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

**Produce the .md files** by converting your built HTML at build time. This only works when the built HTML already contains each page's content: static site generators, server-rendered or prerendered builds. A client-rendered SPA's `index.html` is an empty shell, so converting it yields empty Markdown. For those, prerender each public route first (your framework's static export, or a headless-browser prerender step in the build), or generate the Markdown from the same content source (CMS, MDX, JSON) the app renders from. Check that a generated `.md` file contains real text before you turn on negotiation.

The `turndown` package has no CLI, so use a short Node script (`npm install --save-dev turndown`):

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
