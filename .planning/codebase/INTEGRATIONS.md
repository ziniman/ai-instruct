# External Integrations

**Analysis Date:** 2026-02-25

## APIs & External Services

**GitHub Raw CDN:**
- Service: GitHub Raw CDN (raw.githubusercontent.com)
- What it's used for: Downloading guide markdown files when user runs CLI
- SDK/Client: Built-in `fetch` API
- Endpoint: `https://raw.githubusercontent.com/ziniman/ai-instruct/main/{guide-filename}` (defined in `bin/init.js` line 10)
- Auth: None required (public repository)
- Failure handling: HTTP error thrown if response not OK (status >= 400)

## Data Storage

**Databases:**
- None

**File Storage:**
- Local filesystem only
- Guides downloaded to user's project in `ai-docs/` directory (default location, created by CLI)
- Config files updated in-place: `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`

**Caching:**
- None - fresh download on every run

## Authentication & Identity

**Auth Provider:**
- None - This is a distribution tool with no authentication

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- CLI prints progress to stdout/stderr
- Error messages printed to stderr with exit code 1 on failure (line 196-199 in `bin/init.js`)

## CI/CD & Deployment

**Hosting:**
- Distributed via npm registry (npmjs.com)
- Source hosted on GitHub (https://github.com/ziniman/ai-instruct)

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- None

**Secrets location:**
- No secrets required for CLI operation

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## User Interaction via External Tools

**Detected Tools (via file existence checks):**
- Claude Code (`CLAUDE.md`)
- Cursor (`.cursorrules`)
- GitHub Copilot (`.github/copilot-instructions.md`)
- Windsurf (`.windsurfrules`)

The CLI automatically detects which tools are already configured in the user's project and offers to update them. References to guides are appended to existing config files or created if missing (see `bin/init.js` lines 40-61 for tool config definitions).

---

*Integration audit: 2026-02-25*
