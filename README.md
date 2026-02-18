# AI Instruct

Practical markdown guides for developers building websites with AI coding assistants (Cursor, Claude Code, Copilot, etc.). Useful whether you have a coding background or not.

Each guide is a focused, copy-paste-friendly reference you can drop directly into your AI chat context to get better, more accurate help on a specific topic.

## Guides

| Guide | File | Description |
|-------|------|-------------|
| SEO & LLMO Implementation | [seo-llmo-guide.md](./seo-llmo-guide.md) | SEO & LLMO (Large Language Model Optimization) implementation for static sites — meta tags, Open Graph, structured data (JSON-LD), llms.txt, robots.txt for AI crawlers, sitemaps, and validation tools. Based on practices as of early 2026. |
| Deploying a Static SPA on AWS | [aws-spa-deployment-guide.md](./aws-spa-deployment-guide.md) | Deploying a static single-page app (React/Vite) on AWS — Amplify hosting, custom domains, CDK backend with API Gateway + Lambda, SES email, CORS, and environment variables. |
| Google Analytics 4 Implementation | [google-analytics-guide.md](./google-analytics-guide.md) | Google Analytics 4 (GA4) implementation — installation (gtag.js and GTM), event tracking, user properties, e-commerce, Consent Mode v2, and debugging. |

## How to Use

The guides are written to be read by both humans and AI models. There are three main ways to use them:

### 1. Paste into chat

Copy a guide's contents (or a relevant section) and paste it directly into your AI chat before asking your question. Best for one-off tasks.

### 2. Add to your project's AI instructions file (recommended)

Most AI coding assistants read a persistent instructions file from your project root. Download the relevant guide(s) into your project and reference them from your instructions file — the assistant will have the context automatically on every session.

| Assistant | Instructions file | How to reference a guide |
|-----------|------------------|--------------------------|
| **Claude Code** | `CLAUDE.md` | Add a line like `Read seo-llmo-guide.md for SEO/LLMO practices.` |
| **Cursor** | `.cursor/rules/` (one `.mdc` file per rule) or `.cursorrules` | Paste guide contents into a new `.mdc` file in `.cursor/rules/` |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Paste guide contents or add `See seo-llmo-guide.md for SEO context.` |
| **Windsurf** | `.windsurfrules` | Paste guide contents or reference the file path |
| **Aider** | Pass with `--read` flag | `aider --read seo-llmo-guide.md` |

**Best practices for instruction files:**

- Keep guides as separate files rather than pasting everything into one giant instructions file — it's easier to update individual guides and keeps the instructions file readable
- Only include guides relevant to your project to avoid unnecessary context
- Put guides in a dedicated folder (e.g. `ai-docs/`) and reference them from your instructions file
- When a guide is updated in this repo, re-download it to get the latest practices

### 3. Global AI assistant instructions

Some assistants support a global (user-level) instructions file that applies to all projects. Useful for guides you always want active.

| Assistant | Global instructions location |
|-----------|------------------------------|
| **Claude Code** | `~/.claude/CLAUDE.md` |
| **Cursor** | Settings → Rules for AI → User Rules |
| **GitHub Copilot** | Not supported (project-level only) |

## Contributing

Pull requests are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for guide format and writing guidelines. You can:

- **Add a new guide** — create a focused `.md` file on a specific topic (deployment, accessibility, performance, auth, etc.)
- **Update an existing guide** — fix outdated information, add missing patterns, or improve clarity
- **Fix errors** — typos, broken examples, wrong commands

### Guidelines for new guides

- Keep guides focused on a single topic
- Write for an audience that may not have deep coding experience
- Include working code snippets and real commands
- Note the date/context for time-sensitive information (e.g. "as of 2026")
- Use tables and checklists where appropriate

## License

Apache 2.0 — see [LICENSE](./LICENSE). Free to use, modify, and redistribute.
