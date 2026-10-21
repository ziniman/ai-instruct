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
