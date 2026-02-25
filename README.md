<div align="center">

# AI Instruct

**Practical markdown guides for developers building websites with AI coding assistants.**

**Each guide asks plain-English questions first  -  so your AI generates code for your project, not generic boilerplate.**

[![npm version](https://img.shields.io/npm/v/ai-instruct?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/ai-instruct)
[![npm downloads](https://img.shields.io/npm/dm/ai-instruct?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/ai-instruct)
[![GitHub stars](https://img.shields.io/github/stars/ziniman/ai-instruct?style=for-the-badge&logo=github&logoColor=white&color=181717)](https://github.com/ziniman/ai-instruct/stargazers)
[![license](https://img.shields.io/badge/license-Apache%202.0-blue?style=for-the-badge)](https://github.com/ziniman/ai-instruct/blob/main/LICENSE)
[![last commit](https://img.shields.io/github/last-commit/ziniman/ai-instruct?style=for-the-badge&logo=github&logoColor=white&color=181717)](https://github.com/ziniman/ai-instruct/commits/main)

```sh
npx ai-instruct init
```

</div>

The CLI detects your AI tool (Claude Code, Cursor, Copilot, Windsurf), lets you pick which guides to add, downloads them to `ai-docs/`, and adds the right reference lines to your config file automatically.

## Guides

| Guide | File | Description |
|-------|------|-------------|
| Deploying a Static SPA on AWS | [aws-spa-deployment-guide.md](./aws-spa-deployment-guide.md) | Deploying a static single-page app (React/Vite) on AWS  -  Amplify hosting, custom domains, CDK backend with API Gateway + Lambda, SES email, CORS, and environment variables. |
| Google Analytics 4 Implementation | [google-analytics-guide.md](./google-analytics-guide.md) | Google Analytics 4 (GA4) implementation  -  installation (gtag.js and GTM), event tracking, user properties, e-commerce, Consent Mode v2, and debugging. |
| SEO & LLMO Implementation | [seo-llmo-guide.md](./seo-llmo-guide.md) | SEO & LLMO (Large Language Model Optimization) implementation for static sites  -  meta tags, Open Graph, structured data (JSON-LD), llms.txt, robots.txt for AI crawlers, sitemaps, and validation tools. Based on practices as of early 2026. |
| Web Accessibility | [web-accessibility-guide.md](./web-accessibility-guide.md) | WCAG 2.2 AA implementation  -  semantic HTML, keyboard navigation, ARIA, forms, color contrast, focus management, motion, and testing with automated tools and screen readers. |

## How to Use

The guides are written to be read by both humans and AI models. There are four main ways to use them:

### 0. CLI setup (recommended)

```sh
npx ai-instruct init
```

Run in your project root. The CLI handles detection, download, and config file updates automatically.

### 1. Paste into chat

Copy a guide's contents (or a relevant section) and paste it directly into your AI chat before asking your question. Best for one-off tasks.

### 2. Add to your project's AI instructions file (recommended)

Most AI coding assistants read a persistent instructions file from your project root. Download the relevant guide(s) into your project and reference them from your instructions file  -  the assistant will have the context automatically on every session.

| Assistant | Instructions file | How to reference a guide |
|-----------|------------------|--------------------------|
| **Claude Code** | `CLAUDE.md` | Add a line like `Read seo-llmo-guide.md for SEO/LLMO practices.` |
| **Cursor** | `.cursor/rules/` (one `.mdc` file per rule) or `.cursorrules` | Paste guide contents into a new `.mdc` file in `.cursor/rules/` |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Paste guide contents or add `See seo-llmo-guide.md for SEO context.` |
| **Windsurf** | `.windsurfrules` | Paste guide contents or reference the file path |
| **Aider** | Pass with `--read` flag | `aider --read seo-llmo-guide.md` |

**Best practices for instruction files:**

- Keep guides as separate files rather than pasting everything into one giant instructions file  -  it's easier to update individual guides and keeps the instructions file readable
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

Pull requests are welcome  -  see [CONTRIBUTING.md](./CONTRIBUTING.md) for guide format and writing guidelines. You can:

> Building your own AI instruction guides for a different domain? [Use this repo as a template](https://github.com/ziniman/ai-instruct/generate) to get the folder structure, CONTRIBUTING guidelines, and CLI wired up from the start.

- **Add a new guide**  -  create a focused `.md` file on a specific topic (deployment, accessibility, performance, auth, etc.)
- **Update an existing guide**  -  fix outdated information, add missing patterns, or improve clarity
- **Fix errors**  -  typos, broken examples, wrong commands

### Guidelines for new guides

- Keep guides focused on a single topic
- Start with a "Before You Start" section  -  plain-English questions that let an AI assistant tailor its output (see [CONTRIBUTING.md](./CONTRIBUTING.md))
- Write for an audience that may not have deep coding experience
- Include working code snippets and real commands
- Note the date/context for time-sensitive information (e.g. "as of 2026")
- Use tables and checklists where appropriate

## License

Apache 2.0  -  see [LICENSE](./LICENSE). Free to use, modify, and redistribute.
