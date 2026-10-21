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
