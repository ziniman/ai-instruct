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
