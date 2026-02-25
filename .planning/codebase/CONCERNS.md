# Codebase Concerns

**Analysis Date:** 2026-02-25

## Tech Debt

**No external dependency pinning:**
- Issue: CLI relies on global `fetch` (Node 18+) which is available but not explicitly documented in code
- Files: `bin/init.js`
- Impact: Codebase is resilient and has zero external dependencies, but the Node version constraint in `package.json` (>= 18) should be enforced during testing
- Fix approach: Consider adding a version check at CLI startup that warns if Node < 18

**No automated testing framework:**
- Issue: No unit tests or integration tests for CLI functionality
- Files: `bin/init.js`
- Impact: File download, parsing, git detection, and config appending logic have no automated coverage. Changes to CLI behavior (guide selection, file detection, appending logic) cannot be validated without manual testing
- Fix approach: Add a test suite using Node's built-in `test` runner or Jest. Test coverage should include:
  - File download failure scenarios
  - Guide selection parsing (comma-separated, range validation)
  - Config file detection and existing reference detection
  - Proper directory creation for non-existent tool config directories (`.github/`, `.cursor/`)

**Single-file CLI architecture:**
- Issue: All CLI logic is in one 199-line `bin/init.js` file with multiple responsibilities
- Files: `bin/init.js`
- Impact: Hard to test in isolation; error handling for specific operations (download, append, directory creation) is minimal
- Fix approach: Break into modules: `lib/download.js`, `lib/detect.js`, `lib/append.js` for easier testing and maintenance

## Known Bugs

**Guide synchronization burden:**
- Issue: Guides are maintained in the repo, listed in `README.md`, registered in `GUIDES` array in `bin/init.js`, and referenced in `llms.txt`
- Files: `README.md`, `bin/init.js`, `llms.txt`, guide files
- Trigger: Adding a new guide requires changes in 4 places; easy to miss one and cause inconsistency
- Workaround: Checklist in CLAUDE.md helps but is manual. Consider generating `GUIDES` array from a JSON manifest file

**No handling for partial download failures:**
- Issue: If the network fails mid-download, `downloadFile` writes incomplete content to disk with no rollback
- Files: `bin/init.js` line 79 (`fs.writeFileSync(dest, await res.text())`)
- Impact: Incomplete guide files saved to `ai-docs/` directory, user may not notice until they try to read the guide
- Workaround: Manually delete the incomplete file and re-run the CLI
- Fix approach: Write to a temp file, verify content is valid (e.g., check for `# ` markdown heading), then move to final location

**Guide content consistency across files:**
- Issue: `GUIDES` array `desc` field is a brief summary, but README table and `.cursor/rules/` references may diverge in future
- Files: `bin/init.js` lines 13-38, `README.md` lines 24-29
- Impact: Users see different descriptions in different tools, which is confusing. No single source of truth for guide metadata
- Fix approach: Store guide metadata in a JSON file, generate both CLI and README from it

## Security Considerations

**CLI fetches and writes files from remote without validation:**
- Risk: `downloadFile` fetches from hardcoded GitHub raw URL without signature verification
- Files: `bin/init.js` line 10, lines 76-80
- Current mitigation: HTTPS used, repo is public on GitHub
- Recommendations:
  - Add optional checksum validation (e.g., SHA-256 hash in a manifest file)
  - Log which URL is being fetched (already done via console output)
  - Consider caching guide versions to reduce attack surface

**No input validation on guide selection:**
- Risk: User input parsed with `parseInt()` without bounds checking before array access
- Files: `bin/init.js` lines 118-119, 131
- Current mitigation: `.filter(Boolean)` removes invalid entries
- Recommendations: Add explicit validation that `idx >= 0 && idx < TOOL_CONFIGS.length` before accessing array (already done at 119, but guide selection at 131 lacks bounds check for edge cases with malformed input)

**Config file appending without merge logic:**
- Risk: `fs.appendFileSync(tool.file, tool.ref(guide))` blindly appends; if called multiple times, creates duplicates
- Files: `bin/init.js` line 168
- Current mitigation: `alreadyReferenced()` check prevents obvious duplicates
- Recommendations:
  - Verify `alreadyReferenced()` check is robust (currently a simple string search for `guide.file` in file contents)
  - Add a safety check to avoid appending more than once per guide per file in a single run
  - Consider idempotent appending (test with multiple runs)

## Performance Bottlenecks

**Synchronous I/O in CLI:**
- Problem: `fs.readFileSync`, `fs.writeFileSync`, `fs.mkdirSync` block execution
- Files: `bin/init.js` throughout
- Cause: CLI is short-lived (seconds), but synchronous I/O is slower than async for multiple file operations
- Impact: Minimal for typical use (few guides, few config files), but noticeable on slow file systems or with many guides
- Improvement path: Refactor to use async/await with `promises` API (`fs.promises.readFile`, etc.)

**Sequential file downloads:**
- Problem: Guides are downloaded in a loop, one at a time
- Files: `bin/init.js` line 149
- Cause: `for...of` loop awaits each download before starting the next
- Impact: Users with slow connections wait longer; downloading 4 guides takes ~4x longer than parallel
- Improvement path: Use `Promise.all()` to fetch all guides concurrently, handle errors individually

## Fragile Areas

**Guide title and topic consistency:**
- Files: `bin/init.js` lines 13-38
- Why fragile: `name`, `file`, `desc`, and `topic` fields in GUIDES array must all stay in sync. If `topic` is updated but `desc` is not, misleading messages appear
- Safe modification: Update both `topic` and `desc` in the same commit. Lint rule or test should verify they reference the same concept
- Test coverage: No validation that field values are non-empty strings or match expected patterns

**Guide format enforcement:**
- Files: All `.md` files at repo root
- Why fragile: CONTRIBUTING.md specifies strict format (H1 + blockquote, Section 0, table of contents), but no automated checking
- Safe modification: Manually validate against CONTRIBUTING.md checklist before committing
- Test coverage: No linter or validator runs on PRs to check guide format

**CLI assumes `ai-docs/` directory is safe to write to:**
- Files: `bin/init.js` line 141
- Why fragile: If a file named `ai-docs` (not a directory) exists, `mkdir` fails. If permissions are restricted, write fails
- Safe modification: Check if path exists and is a directory before creating; give clear error message if not
- Test coverage: No test for directory permission issues or pre-existing file name conflicts

## Scaling Limits

**Manual guide addition process:**
- Current capacity: 4 guides
- Limit: With 10-15 guides, the manual synchronization between README, GUIDES array, and llms.txt becomes error-prone
- Scaling path: Adopt a manifest file (e.g., `guides.json`) with a generation script that updates README and GUIDES array automatically

**CLI feature creep:**
- Current capacity: Single-responsibility CLI (detect tools, download guides, append references)
- Limit: If features like "update existing guides," "manage versions," or "verify guide format" are added, the CLI grows beyond 200 lines and becomes hard to maintain
- Scaling path: Keep CLI simple; add separate utilities (`cli/validate-guides.js`, `cli/generate-manifest.js`) for maintenance tasks

## Dependencies at Risk

**No external dependencies (actually a strength, but risky for maintenance):**
- Risk: Zero dependencies mean no active upstream maintenance, but also no leverage for security updates
- Impact: If fetch API changes or Node.js deprecates built-in readline, no npm update available
- Migration plan: Keep built-in dependencies only; if a feature requires an external package, that is a signal to keep the scope narrow

**Node.js version constraint (>= 18):**
- Risk: Node 18 reached LTS in October 2022; EOL is April 2025. Constraint should move to Node 20 LTS
- Impact: Users on older projects may not be able to run the CLI
- Migration plan: Update `engines.node` to `>= 20` in next major version; add deprecation notice for Node 18 in current release

## Missing Critical Features

**No mechanism to verify guides are correctly formatted:**
- Problem: CONTRIBUTING.md specifies strict format, but no linter enforces it
- Blocks: Cannot confidently add new guides without manual review
- Solution: Create a simple validator (markdown parser + checks for H1, Section 0, etc.) as `bin/validate-guides.js`

**No version tracking for guides:**
- Problem: Guides have `Updated:` dates but no semantic versioning
- Blocks: Users cannot know if a guide they downloaded is stale after 6 months
- Solution: Add version field to GUIDES array (e.g., "1.0.0") and include in download path or filename

**No rollback or uninstall mechanism:**
- Problem: CLI downloads guides and appends config, but no `uninstall` command to clean up
- Blocks: If a user changes their mind about a guide or tool, they must manually delete files and edit config
- Solution: Add `npx ai-instruct uninstall` command that removes guides and config references

**No validation of downloaded guide contents:**
- Problem: No check that downloaded files contain expected markdown structure
- Blocks: If GitHub is unavailable or returns error HTML instead of the guide, file is written and user sees corrupted content
- Solution: After download, parse markdown and verify structure matches CONTRIBUTING.md format before writing to disk

## Test Coverage Gaps

**CLI download and file I/O:**
- What's not tested: `downloadFile`, `alreadyReferenced`, file system operations
- Files: `bin/init.js` functions on lines 63, 71, 76
- Risk: Refactoring these functions can silently break functionality; network errors are not handled gracefully
- Priority: High (affects core CLI logic)

**Guide detection and user input parsing:**
- What's not tested: `ask()` function, guide selection parsing with edge cases (empty input, out-of-range numbers, non-numeric input)
- Files: `bin/init.js` lines 67, 127-131
- Risk: Invalid input silently passes through `.filter(Boolean)`, leading to unexpected behavior
- Priority: High (affects user interaction flow)

**Tool detection edge cases:**
- What's not tested: `detectTools()` when config files exist but are empty, or permissions are restricted
- Files: `bin/init.js` line 64
- Risk: May crash or skip tools unexpectedly
- Priority: Medium (affects setup flow but may not happen in most cases)

---

*Concerns audit: 2026-02-25*
