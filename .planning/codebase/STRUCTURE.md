# Codebase Structure

**Analysis Date:** 2026-02-25

## Directory Layout

```
ai-instruct/
├── bin/                    # CLI executable
│   └── init.js            # Main CLI script (Node.js entry point)
├── .planning/             # GSD planning documents (not committed to npm)
│   └── codebase/          # This folder
├── aws-spa-deployment-guide.md     # Guide: AWS SPA deployment patterns
├── google-analytics-guide.md        # Guide: GA4 implementation
├── seo-llmo-guide.md               # Guide: SEO and AI crawler practices
├── web-accessibility-guide.md      # Guide: WCAG 2.2 AA implementation
├── CLAUDE.md              # Claude Code instructions (project-level)
├── CONTRIBUTING.md        # Contribution guidelines for new guides
├── README.md              # Project overview, usage instructions
├── package.json           # npm package metadata
├── LICENSE                # Apache 2.0 license
├── llms.txt               # Raw GitHub URLs of all guides (for AI crawlers)
└── .gitignore             # Excludes node_modules, .env files
```

## Directory Purposes

**`bin/`:**
- Purpose: Executable scripts (npm bin field points here)
- Contains: Single CLI entry point
- Key files: `bin/init.js`

**`ai-instruct/` (root):**
- Purpose: Guide files and project documentation
- Contains: Markdown guides, project metadata, license
- Key files: All `-guide.md` files, README.md, CONTRIBUTING.md, CLAUDE.md

**`.planning/codebase/`:**
- Purpose: GSD (Generalist Self-Directed) codebase analysis documents
- Contains: Architecture, structure, conventions, testing, and concerns analysis
- Not committed to npm package

## Key File Locations

**Entry Points:**
- `bin/init.js`: CLI executable - runs via `npx ai-instruct init` or `node bin/init.js`
- Shebang: `#!/usr/bin/env node` (line 1)

**Configuration:**
- `package.json`: npm package metadata, version, bin field
- CONTRIBUTING.md: Guide format rules and writing guidelines
- CLAUDE.md: Project instructions for Claude Code

**Core Logic:**
- `bin/init.js`: Entire application - tool detection, guide management, file download, config updates
  - GUIDES array (lines 13-38): Available guides metadata
  - TOOL_CONFIGS array (lines 40-61): AI tool config definitions
  - detectTools() (line 63): Find installed AI tools
  - downloadFile() (line 76): Fetch from GitHub and write locally
  - main() (line 82): Orchestration logic, user prompts, flow control

**Guides (Content):**
- `aws-spa-deployment-guide.md`: AWS Amplify, CDK, API Gateway, Lambda, SES
- `google-analytics-guide.md`: GA4 implementation, events, e-commerce, Consent Mode
- `seo-llmo-guide.md`: Structured data, llms.txt, AI crawlers, Core Web Vitals
- `web-accessibility-guide.md`: WCAG 2.2 AA, ARIA, keyboard nav, testing

**Project Documentation:**
- `README.md`: Overview, usage instructions, contribution guidelines
- `CONTRIBUTING.md`: Guide format requirements, writing style, file naming
- `CLAUDE.md`: Development instructions for Claude Code (this file)
- `llms.txt`: Raw GitHub URLs for guide discovery by AI crawlers

## Naming Conventions

**Files:**
- Guides: `kebab-case-name-guide.md` (e.g., `seo-llmo-guide.md`)
- Config files: UPPERCASE (e.g., `CLAUDE.md`, `README.md`, `CONTRIBUTING.md`) or dotfiles (e.g., `.gitignore`)
- CLI script: lowercase with .js extension (e.g., `init.js`)

**Directories:**
- Private dirs: Single letter or acronym (e.g., `bin`, `.planning`)
- No nested directories in guides (flat structure)

**Internal Variables (in bin/init.js):**
- Constants: UPPERCASE_SNAKE_CASE (e.g., `GUIDES`, `TOOL_CONFIGS`, `REPO_RAW`)
- Functions: camelCase (e.g., `detectTools()`, `downloadFile()`, `alreadyReferenced()`)
- Single-letter color codes: `C` (red), `D` (dim), `R` (reset)

## Where to Add New Code

**New Guide:**
- Location: Create `kebab-case-name-guide.md` at repo root
- Format: Follow CONTRIBUTING.md structure (H1 title, metadata, Section 0: Before You Start, content)
- Registration: Add entry to GUIDES array in `bin/init.js` with `name`, `file`, `desc`, `topic`
- Documentation: Add row to Guides table in README.md
- Discovery: Add raw GitHub URL to `llms.txt`

**New CLI Feature:**
- Location: `bin/init.js` (single file, no dependencies)
- Pattern: Add function or extend main() logic
- Dependencies: Use only Node.js built-ins (fs, path, readline) and native fetch
- No external npm packages allowed

**Tool Support:**
- Location: Add entry to TOOL_CONFIGS array in `bin/init.js`
- Requirements: Define `name`, `file` (config filename), and `ref(guide)` function (generates reference text)
- Example: Windsurf entry (lines 57-60) shows format for new tools

## Special Directories

**`.planning/`:**
- Purpose: GSD codebase analysis (not part of published npm package)
- Generated: No (manually created by GSD agents)
- Committed: Yes (to git, but excluded from npm package via .npmignore)

**`node_modules/` (if created):**
- Purpose: Not used - no external dependencies
- Generated: Only if user manually installs (not required)
- Committed: No (in .gitignore)

## npm Package Exclusion

**`.npmignore`:**
- Excludes `.planning/`, `.git/`, development files
- Only the CLI, guides, and metadata are published

---

*Structure analysis: 2026-02-25*
