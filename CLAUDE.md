# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of markdown guides for developers using AI coding assistants. The guides are consumed by other projects (pasted into chat, added to CLAUDE.md, `.cursorrules`, etc.) — this repo itself is not a web app or library.

The only runnable code is the CLI in `bin/init.js`, which users run via `npx ai-instruct init` in their own projects.

## CLI

**Run locally:**
```sh
node bin/init.js
```

**Test the published package:**
```sh
npx ai-instruct init
```

The CLI has no dependencies — it uses only Node.js built-ins (`fs`, `path`, `readline`) plus the global `fetch` (Node 18+). Do not add external packages.

To publish a new version to npm: bump `version` in `package.json`, then `npm publish`.

## Guide format (enforced by CONTRIBUTING.md)

Every guide must follow this structure in order:

1. **H1 title** + metadata blockquote (`> Applies to: ... | Updated: Month YYYY`)
2. **Section 0: Before You Start** — 4–6 plain-English questions with defaults, followed by a `> **AI assistant:**` instruction line
3. **Table of contents** (for guides longer than ~150 lines)
4. **Content sections** — one concept per section, self-contained

The Section 0 pattern is the core of the approach: questions replace generic boilerplate. Defaults must be detectable from the project (e.g. framework in `package.json`) or a best-practice baseline.

## Adding a new guide

1. Create `kebab-case-name.md` at the repo root
2. Follow the guide format above (read CONTRIBUTING.md for the full spec)
3. Add a row to the `## Guides` table in `README.md` (Guide name | filename link | description)
4. Add the guide to the `GUIDES` array in `bin/init.js` with `name`, `file`, `desc`, and `topic` fields
5. Add the guide's raw GitHub URL to `llms.txt`

## Commit style

- No `Co-Authored-By` lines
- Commit message body explains *why*, not just what changed
