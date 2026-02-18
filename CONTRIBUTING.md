# Contributing to AI Instruct

Thank you for contributing! This repo is a collection of focused markdown guides for developers using AI coding assistants. Follow these guidelines so every guide works well both as human documentation and as AI context.

## Guide format

### Required header block

Every guide must start with an H1 title followed immediately by a metadata blockquote:

```markdown
# Guide Title

> Applies to: [stack/tools] | Updated: [Month YYYY]

One sentence describing what this guide covers.
```

The metadata line tells readers (and AI models) the scope and freshness of the guide at a glance.

### Table of contents

Include a table of contents for any guide longer than ~150 lines. Use anchor links:

```markdown
## Contents

1. [Section One](#section-one)
2. [Section Two](#section-two)
```

### Section structure

- One concept per section — don't mix unrelated topics under one heading
- Keep sections self-contained so they can be quoted or used in isolation
- Use `###` for subsections, `####` sparingly and only when genuinely needed

## Writing style

**Be specific and direct.** State the recommendation plainly.

| Instead of | Write |
|------------|-------|
| "You might want to consider using X" | "Use X" |
| "It is generally a good idea to..." | "Do this because..." |
| "There are several options available" | List the options with a clear recommendation |

**Explain the why.** AI models give better advice when they understand intent, not just rules.

```markdown
<!-- weak -->
Add a canonical tag to every page.

<!-- better -->
Add a canonical tag to every page — it prevents duplicate content penalties
when the same page is accessible at multiple URLs.
```

**Define acronyms on first use.** The model may not have surrounding context.

```markdown
Use JSON-LD (JavaScript Object Notation for Linked Data) for structured data.
```

## Code examples

- Include working code, not pseudocode
- Use placeholder values that are obviously placeholders: `yourdomain.com`, `YOUR_APP_ID`, `your-region`
- Add a comment when a line needs explanation — keep comments brief

```typescript
// Use HTTP API (v2) — cheaper and simpler than REST API
const httpApi = new apigwv2.HttpApi(this, 'HttpApi', { ... });
```

## Handling time-sensitive information

Flag anything that may become outdated:

```markdown
Known AI crawler user-agents (as of 2026):
- `GPTBot` — OpenAI
```

Update the `Updated:` date in the metadata block whenever time-sensitive content changes.

## File naming

Use lowercase kebab-case, descriptive and specific:

```
seo-llmo-guide.md          ✓
aws-spa-deployment-guide.md ✓
guide.md                    ✗  (too vague)
AWS_SPA_GUIDE.md            ✗  (wrong case)
```

## Submitting a pull request

1. **New guide** — create a new `.md` file following this format and add a row to the table in `README.md` with the guide name, filename, and description
2. **Update existing guide** — update the `Updated:` date in the metadata block
3. **Fix** — no extra steps needed beyond the fix itself

Keep PRs focused: one guide or one fix per PR. This makes review faster and keeps the git history clean.
