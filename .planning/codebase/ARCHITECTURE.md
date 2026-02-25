# Architecture

**Analysis Date:** 2026-02-25

## Pattern Overview

**Overall:** CLI-driven guide distribution system with automatic AI tool configuration.

**Key Characteristics:**
- Single-file executable CLI (`bin/init.js`) - no framework, no build step
- Stateless operation - reads from GitHub, writes to user's project
- Metadata-driven guide selection and configuration
- Automatic tool detection (Claude Code, Cursor, Copilot, Windsurf)
- Zero external dependencies - Node.js built-ins only

## Layers

**Entry Point / CLI Handler:**
- Purpose: Parse user input, orchestrate the installation flow
- Location: `bin/init.js`
- Contains: Main flow logic, user prompts, orchestration
- Depends on: Node.js fs, path, readline modules; native fetch
- Used by: npm package entry point (executed via `npx ai-instruct init`)

**Tool Detection Layer:**
- Purpose: Identify which AI tools are configured in the target project
- Location: `bin/init.js` - `detectTools()` function
- Contains: Tool configuration definitions (TOOL_CONFIGS array), file existence checks
- Depends on: fs.existsSync
- Used by: Main flow to decide which configs to update

**Guide Management Layer:**
- Purpose: Define available guides with metadata and manage guide selection
- Location: `bin/init.js` - GUIDES array
- Contains: Guide definitions (name, file, description, topic), guide selection logic
- Depends on: None (pure data + filtering logic)
- Used by: Main flow for user selection and download operations

**Configuration Update Layer:**
- Purpose: Append guide references to AI tool configuration files
- Location: `bin/init.js` - tool reference generation and file appending
- Contains: Tool-specific reference formatters, file append logic, idempotency checks
- Depends on: fs.readFileSync, fs.appendFileSync, fs.existsSync
- Used by: Main flow after guide download

**File Download Layer:**
- Purpose: Fetch guides from GitHub and write to local filesystem
- Location: `bin/init.js` - `downloadFile()` function
- Contains: HTTP fetch logic, error handling for failed downloads
- Depends on: Native fetch (Node 18+), fs.writeFileSync
- Used by: Main flow to populate ai-docs/ directory

## Data Flow

**User Initialization Flow:**

1. User runs `npx ai-instruct init` in their project root
2. CLI loads version from `package.json`
3. Detect AI tool configs (CLAUDE.md, .cursorrules, .github/copilot-instructions.md, .windsurfrules)
4. If tools found: ask to update them; if none found: ask user to select a tool
5. Present list of available guides
6. Create `ai-docs/` directory (or use existing)
7. Download selected guides from GitHub raw CDN to `ai-docs/`
8. For each selected tool config: append guide references (skipping already-referenced guides)
9. Display completion summary with commit instructions

**State Management:**
- No persistent state - CLI is stateless
- Idempotency check: `alreadyReferenced()` prevents duplicate guide references
- All state exists in files: `package.json` (version), user's project config files, downloaded guides

## Key Abstractions

**Guide (data structure):**
- Purpose: Represents a single instructional document
- Examples: "SEO & LLMO Implementation", "Web Accessibility"
- Pattern: Object with `name`, `file`, `desc`, `topic` properties
- Location: `bin/init.js` - GUIDES array
- Used to: Drive guide selection UI, generate download URLs, create config references

**Tool Configuration (data structure):**
- Purpose: Represents an AI tool's instruction file and reference format
- Examples: Claude Code (CLAUDE.md), Cursor (.cursorrules), GitHub Copilot (.github/copilot-instructions.md)
- Pattern: Object with `name`, `file`, and `ref()` function (generates tool-specific reference text)
- Location: `bin/init.js` - TOOL_CONFIGS array
- Used to: Detect which tools are present, generate appropriate reference syntax for each

## Entry Points

**CLI Invocation:**
- Location: `bin/init.js` - `main()` function (async)
- Triggers: `npx ai-instruct init` or `node bin/init.js`
- Responsibilities: Orchestrate entire flow - detect tools, prompt user, download guides, update configs
- Error handling: Wraps main() in .catch(), exits with code 1 on error

## Error Handling

**Strategy:** Fail-safe per-operation, continue on partial failures.

**Patterns:**
- Download errors: Caught in try-catch, displays "✗ [error message]" but continues with other guides
- Missing directories: Created on-demand with `mkdirSync({ recursive: true })`
- Invalid guide selection: Filters out non-existent selections silently, exits if nothing selected
- HTTP errors: Thrown with descriptive message (e.g., "HTTP 404")

## Cross-Cutting Concerns

**Logging:** Console output only - prompts (readline), download status (process.stdout.write), completion messages. No file logging.

**Validation:**
- Guide selection validated with parseInt and array bounds checking
- Tool config file existence checked before attempting updates
- Already-referenced guides checked before appending (idempotency)

**Configuration:**
- Tool detection based on file existence (no config parsing needed)
- Guide metadata from GUIDES array (single source of truth)
- Tool reference formats defined per-tool in TOOL_CONFIGS

---

*Architecture analysis: 2026-02-25*
