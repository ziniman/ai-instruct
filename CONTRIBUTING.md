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

### Section 0: Before You Start

Every guide must include a "Section 0: Before You Start" immediately after the header block (before the table of contents). This is the core of the tailored approach  -  it replaces generic boilerplate with targeted questions that let an AI assistant skip irrelevant sections and fill in the right details.

**Format:**

```markdown
## Section 0: Before You Start

Answer these questions before generating any code. Each has a default  -  confirm or change it.

**Q: [Plain-English question a non-expert can answer]**
Default: [sensible default based on what the model can detect from the project, or best practice]

**Q: ...**
Default: ...

> **AI assistant:** [One instruction telling the model what to do with these answers  -  e.g. which sections to skip, what to auto-detect from the project.]
```

**Rules for questions:**
- Write in plain English  -  assume the reader has no domain expertise
- Keep each question to one sentence
- Always include a default. The default should be either:
  - Something the AI can detect from the project (e.g. "check `package.json` for a SPA framework")
  - A best-practice baseline (e.g. "WCAG 2.2 AA")
- 4 - 6 questions per guide is the right range  -  fewer if the topic is narrow, no more than 6

**AI assistant instruction line:**
End the section with a `> **AI assistant:**` blockquote. This tells the model concretely what to do with the answers  -  which sections to skip, what to generate only if confirmed, what to auto-detect. Keep it to 2 - 3 sentences.

### Table of contents

Include a table of contents for any guide longer than ~150 lines. Use anchor links:

```markdown
## Contents

1. [Section One](#section-one)
2. [Section Two](#section-two)
```

### Section structure

- One concept per section  -  don't mix unrelated topics under one heading
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
Add a canonical tag to every page  -  it prevents duplicate content penalties
when the same page is accessible at multiple URLs.
```

**Define acronyms on first use.** The model may not have surrounding context.

```markdown
Use JSON-LD (JavaScript Object Notation for Linked Data) for structured data.
```

## Code examples

- Include working code, not pseudocode
- Use placeholder values that are obviously placeholders: `yourdomain.com`, `YOUR_APP_ID`, `your-region`
- Add a comment when a line needs explanation  -  keep comments brief

```typescript
// Use HTTP API (v2)  -  cheaper and simpler than REST API
const httpApi = new apigwv2.HttpApi(this, 'HttpApi', { ... });
```

## Handling time-sensitive information

Flag anything that may become outdated:

```markdown
Known AI crawler user-agents (as of 2026):
- `GPTBot`  -  OpenAI
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

1. **New guide**  -  create a new `.md` file following this format and add a row to the table in `README.md` with the guide name, filename, and description
2. **Update existing guide**  -  update the `Updated:` date in the metadata block
3. **Fix**  -  no extra steps needed beyond the fix itself

Keep PRs focused: one guide or one fix per PR. This makes review faster and keeps the git history clean.
