# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of markdown guides for developers using AI coding assistants. The guides are consumed by other projects (pasted into chat, added to CLAUDE.md, `.cursorrules`, etc.)  -  this repo itself is not a web app or library.

The only runnable code is the CLI in `bin/init.js`, which users run via `npx ai-instruct init` in their own projects.

## CLI

**Run locally:**
```sh
node bin/init.js                  # standard flow (detect tool, write to ai-docs/)
node bin/init.js --skills         # install as Claude Code skills in .claude/skills/
node bin/init.js --skills --user  # install in ~/.claude/skills/ (user scope)
```

**Test the published package:**
```sh
npx ai-instruct init
```

The CLI has no dependencies  -  it uses only Node.js built-ins (`fs`, `os`, `path`, `readline`) plus the global `fetch` (Node 18+). Do not add external packages.

`bin/lib/guides.js` is the single source of truth for the guide list (filenames, descriptions, skill names, skill descriptions). Both the CLI and the build script import from it.

## Plugin and skills (Claude Code)

The repo also publishes itself as a Claude Code plugin. The plugin bundles all 5 guides as skills under `skills/<skill-name>/SKILL.md`.

- `skills/` is **generated** by `scripts/build-skills.js` from the canonical `*-guide.md` files plus the metadata in `bin/lib/guides.js`. Do not edit `skills/<name>/SKILL.md` by hand  -  edit the source guide and rebuild.
- `skills/` is committed to the repo (not gitignored) so users installing via `/plugin install` get the files without running a build.
- `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` describe the plugin and the marketplace (this repo is its own marketplace, so users can `/plugin marketplace add ziniman/ai-instruct`).
- Versions in those two JSON files are synced from `package.json` by `scripts/sync-versions.js`, which runs automatically as part of `npm version`.

## Release process

The `npm version` and `npm publish` lifecycle hooks handle build and version sync automatically. The full release flow:

1. **Edit content** - update one or more `*-guide.md` files (or add a new guide, see below).
2. **Run the build to verify locally:**
   ```sh
   npm run build:skills          # regenerates skills/<name>/SKILL.md
   ```
   Inspect the diff in `skills/` to make sure the changes look right.
3. **Bump version and sync everything:**
   ```sh
   npm version patch             # or minor / major
   ```
   The `version` lifecycle hook runs `sync-versions.js` (writes new version to `.claude-plugin/plugin.json` and `marketplace.json`) and `build-skills.js`, then `git add`s the updated files. `npm version` itself creates the version bump commit and a git tag.
4. **Push to GitHub:**
   ```sh
   git push && git push --tags
   ```
   This is what `/plugin marketplace add ziniman/ai-instruct` reads from.
5. **Publish to npm:**
   ```sh
   npm publish
   ```
   The `prepublishOnly` hook runs `build-skills.js` again as a safety net.

**Never commit a version bump without running `npm version`** - hand-editing `package.json` skips the sync hook and leaves the plugin/marketplace JSON files out of date.

If you only edit a guide and want to ship a patch without bumping the version (e.g. typo fix on already-released content), just commit the source edit and the regenerated `skills/<name>/SKILL.md` together.

## Guide format (enforced by CONTRIBUTING.md)

Every guide must follow this structure in order:

1. **H1 title** + metadata blockquote (`> Applies to: ... | Updated: Month YYYY`)
2. **Section 0: Before You Start**  -  4 - 6 plain-English questions with defaults, followed by a `> **AI assistant:**` instruction line
3. **Table of contents** (for guides longer than ~150 lines)
4. **Content sections**  -  one concept per section, self-contained

The Section 0 pattern is the core of the approach: questions replace generic boilerplate. Defaults must be detectable from the project (e.g. framework in `package.json`) or a best-practice baseline.

## Adding a new guide

1. Create `kebab-case-name.md` at the repo root
2. Follow the guide format above (read CONTRIBUTING.md for the full spec)
3. Add a row to the `## Guides` table in `README.md` (Guide name | filename link | description)
4. Add the guide to the `GUIDES` array in `bin/lib/guides.js` with `name`, `file`, `desc`, `topic`, `skillName`, and `skillDescription` fields. The `skillDescription` is what triggers the skill in Claude Code  -  write it in the "Use this skill whenever..." style with explicit trigger contexts and skip-for cases (see existing entries).
5. Run `npm run build:skills` to generate `skills/<skillName>/SKILL.md` and commit it alongside the guide
6. Add the guide's raw GitHub URL to `llms.txt`

## Changelog

`CHANGELOG.md` in the repo root tracks all meaningful changes. Update it on every commit that adds, modifies, or removes guide content, CLI behaviour, skills, or plugin metadata. Skip changelog entries for typo fixes, formatting-only changes, and version-bump-only commits.

Format: add a new `## vX.Y.Z · YYYY-MM-DD` section at the top with one bold entry per changed area:

```markdown
## vX.Y.Z &nbsp;·&nbsp; YYYY-MM-DD

**`skill-name`** — One-line description of what changed and why it matters

**`another-skill`** — Another change
```

Use backtick skill names (`seo-llmo`, `web-accessibility`, etc.) or `all guides`, `CLI`, `README` when the change is not skill-specific.

## Commit style

- No `Co-Authored-By` lines
- Commit message body explains *why*, not just what changed
