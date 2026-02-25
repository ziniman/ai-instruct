# Testing Patterns

**Analysis Date:** 2026-02-25

## Test Framework

**Runner:**
- Not configured - no test framework in use
- No jest, vitest, mocha, or other test runner installed
- `package.json` has no `devDependencies` section

**Assertion Library:**
- Not used

**Run Commands:**
- No test scripts defined in `package.json`
- Manual testing required

## Test File Organization

**Location:**
- No test files found in codebase
- No `__tests__`, `test`, `spec` directories present

**Naming:**
- Not applicable - no test files exist

**Structure:**
- Not applicable - no test files exist

## Testing Approach

**Current State:**
- Manual testing only
- CLI (`bin/init.js`) is tested by running `node bin/init.js` locally or `npx ai-instruct init` against published package
- No automated test suite

**Recommended Testing Strategy (if tests were to be added):**

### Unit Test Patterns

**For utility functions:**

```javascript
// Example structure (not in codebase, but would follow this pattern)
async function testDownloadFile() {
  // Mock fetch response
  const mockFetch = () => Promise.resolve({
    ok: true,
    text: () => Promise.resolve('file contents')
  });

  // Test success case
  try {
    await downloadFile('http://example.com/file.md', '/tmp/test.md');
    // Assert file was written
  } catch (e) {
    // Test should fail
  }

  // Test failure case
  const mockFetchFail = () => Promise.resolve({
    ok: false,
    status: 404
  });
  // Assert throws "HTTP 404" error
}
```

**For synchronous functions:**

```javascript
// Example: testing detectTools()
function testDetectTools() {
  // Would require mocking fs.existsSync
  // Expected: returns array of detected tools based on file existence
}

function testAlreadyReferenced() {
  // Mock fs.existsSync and fs.readFileSync
  // Test when config file exists and contains guide
  // Test when config file exists and doesn't contain guide
  // Test when config file doesn't exist
}
```

## Mocking

**What would need to be mocked:**
- `fs.existsSync()` - for testing tool detection and file existence checks
- `fs.readFileSync()` - for testing guide reference detection
- `fs.writeFileSync()` - for testing guide appending
- `fetch()` - for testing guide download functionality
- `readline.createInterface()` - for testing user input simulation
- Console output methods - for testing UI output and progress reporting

**What should NOT be mocked (if integration tests added):**
- Actual file system operations in a sandboxed temp directory
- Real network requests to GitHub raw content (in end-to-end tests)

## Test Coverage

**Requirements:**
- No coverage requirements defined or enforced
- No coverage reporting tools configured

**Critical paths (if tests were implemented):**
1. Tool detection (detectTools)
2. Guide download (downloadFile with success/failure)
3. Guide selection logic (filtering valid selections)
4. Config file updates (detecting already-referenced guides, appending content)
5. Directory creation (mkdirSync with recursive flag)
6. User input handling (question parsing, default selection)

## Manual Testing Checklist

**Happy path:**
- [ ] Run `node bin/init.js` locally
- [ ] Detect existing AI tool config files correctly
- [ ] Prompt user to update detected configs or select from list
- [ ] Download selected guides to `ai-docs/` directory
- [ ] Append guide references to config files correctly
- [ ] Don't duplicate references if guide already present
- [ ] Create `ai-docs/` directory if it doesn't exist
- [ ] Use existing `ai-docs/` if already present

**Error cases:**
- [ ] Network failure during download shows "✗ {error message}"
- [ ] Invalid selection (out of range) is filtered out silently
- [ ] No guides selected prompts "No valid guides selected. Exiting."
- [ ] Top-level error caught and logged with process exit code 1

**User input variations:**
- [ ] User selects "n" to skip config updates
- [ ] User selects "Skip" option (index 5 for 4 tools)
- [ ] User enters comma-separated guide numbers: `1,3,4`
- [ ] User enters "Enter" for all guides (default)
- [ ] User enters out-of-range numbers mixed with valid (filters correctly)

**Network scenarios:**
- [ ] Successful download with HTTP 200
- [ ] HTTP error responses (404, 500) throw and are caught
- [ ] Network timeout is caught as error

**File system scenarios:**
- [ ] Creating `ai-docs/` in non-existent parent directory (uses `recursive: true`)
- [ ] Creating nested config directory `.github/copilot-instructions.md` with `recursive: true`
- [ ] Appending to existing config file preserves content
- [ ] Downloading to existing `ai-docs/` directory overwrites previous version

## End-to-End Testing (Manual)

**Full workflow test:**
```bash
# Create test directory
mkdir test-project && cd test-project

# Create config files to detect
touch CLAUDE.md .cursorrules

# Run CLI
node ../ai-instruct/bin/init.js

# Expected flow:
# 1. Shows ASCII art and version
# 2. Detects "Claude Code, Cursor"
# 3. Asks to update these configs
# 4. Shows available guides with descriptions
# 5. Prompts for guide selection (1-4, comma-separated)
# 6. Creates ai-docs/ directory
# 7. Downloads guides (✓ for success, ✗ with error for failure)
# 8. Updates config files with references
# 9. Shows summary with count and next steps
# 10. Exits cleanly with code 0
```

**Test against published npm package:**
```bash
npx ai-instruct init
# Same flow as above, validates actual npm distribution
```

## Code Quality Patterns Observed

**Defensive programming:**
- All file operations check existence before reading/writing
- Array filtering removes invalid entries: `.filter(Boolean)` removes null/undefined from guide selection
- Async error handling with try-catch blocks around all external operations

**User experience:**
- Clear progress feedback with status symbols (✓, ✗)
- Helpful prompts with defaults shown in brackets `[Y/n]`, `[1-4]`
- Summary at end explains what was done and next steps
- ASCII art and color codes for visual clarity

---

*Testing analysis: 2026-02-25*
