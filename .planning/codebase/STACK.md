# Technology Stack

**Analysis Date:** 2026-02-25

## Languages

**Primary:**
- JavaScript (Node.js) - CLI tool in `bin/init.js`
- Markdown - Guide content files at repo root

**Secondary:**
- JSON - Package configuration and metadata

## Runtime

**Environment:**
- Node.js 18+ (specified in `package.json` engines field)

**Package Manager:**
- npm (implicit from `package.json`)
- Lockfile: Not present (no `package-lock.json` in repo)

## Frameworks

**Core:**
- Node.js built-in modules only - `fs`, `path`, `readline` (file I/O, path manipulation, interactive CLI)

**Build/Dev:**
- No build system - pure Node.js CLI
- No transpilation required

## Key Dependencies

**Critical:**
- None - The CLI uses only Node.js built-in modules (`fs`, `path`, `readline`) plus global `fetch` (available Node 18+)

**Infrastructure:**
- Global `fetch` API - Used in `bin/init.js` line 77 for downloading guides from GitHub Raw CDN (`REPO_RAW = 'https://raw.githubusercontent.com/ziniman/ai-instruct/main'`)

## Configuration

**Environment:**
- No environment variables required for CLI operation
- Configured via interactive prompts at runtime (`readline` interface)
- Detects existing AI tool config files at runtime (`CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`)

**Build:**
- No build configuration files present
- No transpilation, linting, or formatting tooling configured

## Platform Requirements

**Development:**
- Node.js 18 or higher
- No package dependencies - development requires no `npm install`

**Production (npm):**
- Published to npm as `ai-instruct`
- Installed via `npx ai-instruct init` or `npm install -g ai-instruct`
- Entry point: `bin/init.js` (defined in `package.json` bin field)

## Distribution

**Package:**
- Name: `ai-instruct`
- Current version: `1.0.4`
- License: Apache-2.0
- Repository: `https://github.com/ziniman/ai-instruct`
- Published to: npm registry

**Publishing:**
- Manual process: Update version in `package.json`, then run `npm publish`
- Files excluded from npm: `.claude/`, `CLAUDE.md`, `CONTRIBUTING.md`, `.git*`, `node_modules/`, `*.tgz`, `.DS_Store` (per `.npmignore`)

---

*Stack analysis: 2026-02-25*
