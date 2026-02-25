# Coding Conventions

**Analysis Date:** 2026-02-25

## Naming Patterns

**Files:**
- Kebab-case for guide files: `seo-llmo-guide.md`, `aws-spa-deployment-guide.md`, `web-accessibility-guide.md`
- Kebab-case for utility/bin files: `init.js` (short name, no special prefix)
- Standard config files: `package.json`, `README.md`, `CONTRIBUTING.md`, `CLAUDE.md`

**Functions:**
- camelCase for function names: `detectTools()`, `alreadyReferenced()`, `downloadFile()`, `ask()`
- Async functions use `async` keyword: `async function main()`, `async function downloadFile()`
- Descriptive, action-oriented names: `downloadFile()` not `getFile()`, `alreadyReferenced()` not `isReferenced()`

**Variables:**
- camelCase for all variables: `configsToUpdate`, `selectedGuides`, `DOCS_DIR`
- UPPER_SNAKE_CASE for module-level constants: `REPO_RAW`, `DOCS_DIR`, `GUIDES`, `TOOL_CONFIGS`
- Single-letter variables reserved for ANSI color codes: `C`, `D`, `R` (within limited scope in `bin/init.js`)

**Types:**
- Object properties use camelCase: `guide.name`, `guide.file`, `guide.desc`, `guide.topic`
- Array elements follow naming convention based on singular form: `GUIDES` array contains objects with properties like `name`, `file`, `desc`, `topic`

## Code Style

**Formatting:**
- No external formatter configured
- Line length: Generally 80-100 characters (see `bin/init.js` lines 89-99 for ASCII art that exceeds this for visual purposes)
- Indentation: 2 spaces (consistent throughout `bin/init.js`)
- Semicolons: Required at end of statements

**Linting:**
- No linting configured (no `.eslintrc`, `eslint.config.js`, or `biome.json` present)
- Style is enforced through code review and CONTRIBUTING.md guidelines

**String Style:**
- Single quotes for regular strings: `'use strict'`, `'utf8'`, `'#section-one'`
- Template literals with backticks for interpolation: `` `HTTP ${res.status}` ``, `` `Updated ${detected.length > 1 ? 'these configs' : 'this config'}?` ``

## Import Organization

**Pattern:**
Node.js built-ins only, listed in order of first use:
1. `const fs = require('fs');`
2. `const path = require('path');`
3. `const readline = require('readline');`

**Local imports:**
- Relative path imports from package.json: `const { version } = require('../package.json');`
- No path aliases configured

**Module imports:**
- CommonJS `require()` used throughout (not ES6 `import`)
- Standard Node.js built-ins only: `fs`, `path`, `readline`
- Browser global `fetch` used without import (available in Node 18+)

## Error Handling

**Patterns:**
- Synchronous try-catch for async operations: Wrapping `await` calls in try-catch blocks (see `bin/init.js` lines 152-157)
- Error propagation: Lower-level errors bubble up to `main()` catch block which logs and exits (lines 196-199)
- Fetch response validation: Check `res.ok` before processing, throw with descriptive message: `if (!res.ok) throw new Error(\`HTTP ${res.status}\`);`
- File existence checks before read/write: `fs.existsSync()` checks gate operations
- Process exit on error: `process.exit(1)` called from top-level catch handler

**Error messages:**
- User-facing: Simple format with context: `"Downloading {filename}... ✓"`, `"Error: {err.message}"`
- Technical: Descriptive and specific: `"HTTP ${res.status}"`, includes line numbers in comments where relevant

## Logging

**Framework:** No logging library - uses console

**Patterns:**
- `console.log()` for informational output and user feedback
- `console.error()` for error messages (used once in top-level catch handler)
- Progress indicators: `process.stdout.write()` for non-newline output (line 151)
- ANSI color codes for styling: Red (`\x1b[31m`), Dim (`\x1b[2m`), Reset (`\x1b[0m`)

**When to log:**
- User interactions (asking questions, reporting progress)
- State changes (file created, config updated, download complete)
- Errors (thrown in catch handlers)
- Completion summary (success/failure count, next steps)

## Comments

**When to Comment:**
- Inline comments for non-obvious logic: `// Detect AI tools`, `// Done` (line 180)
- ANSI color code explanations: Comments explain what each code represents (lines 85-87)
- Minimal commenting preferred - code should be self-documenting through naming

**JSDoc/TSDoc:**
- Not used in this codebase (pure Node.js CLI, not a library)

## Function Design

**Size:**
- Small, focused functions: `detectTools()` is 3 lines, `ask()` is 2 lines, `alreadyReferenced()` is 3 lines
- `main()` is the primary orchestrator (~110 lines), handling UI flow and coordination
- Larger functions separated into logical blocks with comments

**Parameters:**
- Single objects preferred over multiple parameters: `guide` object passed to functions
- Simple primitives for utility functions: `ask(rl, question)` takes readline instance and string
- `rl` (readline interface) threaded through call chain from `main()`

**Return Values:**
- Promises for async operations: `ask()` and `downloadFile()` return Promises
- Synchronous functions return immediately: boolean (`false`), arrays (`detectTools()`), or undefined

## Module Design

**Exports:**
- Single export pattern: No explicit exports, CLI is a standalone executable
- Shebang line (`#!/usr/bin/env node`) marks file as executable
- Entry point used via `npx` with no module re-export

**Code Organization:**
1. Shebang and 'use strict'
2. Require statements (Node built-ins, then local package.json)
3. Constants (REPO_RAW, DOCS_DIR, GUIDES array, TOOL_CONFIGS array)
4. Utility functions (detectTools, ask, alreadyReferenced, downloadFile)
5. Main async function (orchestrator)
6. Error handling and invocation (main().catch())

**Data Structures:**
- GUIDES: Array of objects with `{ name, file, desc, topic }`
- TOOL_CONFIGS: Array of objects with `{ name, file, ref(guide) }` where `ref` is a function returning formatted string
- guide objects: Immutable once created, passed around as references

## Markdown Documentation Style

**In guide files (.md):**
- H1 title required with metadata blockquote: `> Applies to: ... | Updated: Month YYYY`
- "Section 0: Before You Start" with 4-6 plain-English questions and defaults
- Table of contents for guides > ~150 lines using anchor links
- One concept per section, self-contained
- Code examples with placeholders clearly marked: `yourdomain.com`, `YOUR_APP_ID`, `your-region`
- Explanation of *why* before *what* (see CONTRIBUTING.md lines 79-87)
- Time-sensitive info flagged with "as of [YYYY]"
- Acronyms defined on first use: "JSON-LD (JavaScript Object Notation for Linked Data)"

---

*Convention analysis: 2026-02-25*
