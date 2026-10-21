'use strict';

// Turns one guide into the files of a Claude Code skill.
//
// Short guides become a single SKILL.md (frontmatter + guide body). Guides whose
// single-file output would exceed MAX_SKILL_LINES use progressive disclosure:
// SKILL.md keeps the header, Section 0 and an index, and every other H2 section
// moves to references/<slug>.md. Intra-guide anchor links are rewritten so they
// keep pointing at the right file.
//
// Used by scripts/build-skills.js (strict) and by the CLI fallback when the
// package ships without prebuilt skills (lenient).

const { buildSkillFrontmatter } = require('./guides');

// Agent Skills guidance: keep SKILL.md under 500 lines.
const MAX_SKILL_LINES = 500;
const REFERENCES_DIR = 'references';

function lineCount(text) {
  return text.replace(/\n$/, '').split('\n').length;
}

// Returns [line, inFence] for every line, where inFence is true for fenced code
// lines including the fence markers themselves.
function scanLines(lines) {
  const out = [];
  let fence = null;
  for (const line of lines) {
    if (fence) {
      out.push([line, true]);
      const close = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
      continue;
    }
    const open = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (open) {
      fence = open[1];
      out.push([line, true]);
      continue;
    }
    out.push([line, false]);
  }
  return out;
}

function headingOf(line) {
  const m = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
  return m ? { level: m[1].length, text: m[2] } : null;
}

// GitHub-style anchor slug (what `#anchor` links in the guides are written against).
function githubSlug(text) {
  return text
    .replace(/`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '')
    .replace(/ /g, '-');
}

// File-name slug for a reference file: lowercase ASCII words joined by hyphens.
function fileSlug(text) {
  return text
    .replace(/`/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function trimSection(lines) {
  const out = lines.slice();
  for (;;) {
    while (out.length && out[0].trim() === '') out.shift();
    while (out.length && out[out.length - 1].trim() === '') out.pop();
    if (out.length && out[out.length - 1].trim() === '---') {
      out.pop();
      continue;
    }
    return out;
  }
}

// Splits the guide body into its preamble (before the first H2) and H2 sections.
function splitSections(body) {
  const scanned = scanLines(body.split('\n'));
  const preamble = [];
  const sections = [];
  let current = null;
  for (const [line, inFence] of scanned) {
    const h = inFence ? null : headingOf(line);
    if (h && h.level === 2) {
      current = { title: h.text, lines: [line] };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  }
  return { preamble, sections };
}

function summaryFor(guide, section) {
  const override = (guide.sectionSummaries || {})[section.title];
  if (override) return override;
  for (const [line, inFence] of scanLines(section.lines.slice(1))) {
    if (inFence || line.trim() === '') continue;
    const m = line.match(/^Applies when:\s*(.+)$/);
    return m ? m[1].trim() : null;
  }
  return null;
}

// Rewrites `](#anchor)` links outside code so they resolve from `fromFile`.
function rewriteLinks(lines, fromFile, anchors, problems) {
  return scanLines(lines).map(([line, inFence]) => {
    if (inFence) return line;
    return line
      .split(/(`+[^`]*`+)/)
      .map((part, i) => {
        if (i % 2 === 1) return part;
        return part.replace(/\]\(#([^)\s]+)\)/g, (whole, anchor) => {
          const target = anchors.get(anchor);
          if (!target) {
            problems.push(`${fromFile}: link to unknown anchor #${anchor}`);
            return whole;
          }
          if (target.file === fromFile) return `](#${target.slug})`;
          const fromDir = fromFile.includes('/') ? fromFile.slice(0, fromFile.lastIndexOf('/') + 1) : '';
          let rel;
          if (fromDir && target.file.startsWith(fromDir)) rel = target.file.slice(fromDir.length);
          else if (fromDir) rel = `../${target.file}`;
          else rel = target.file;
          return target.isFileTop ? `](${rel})` : `](${rel}#${target.slug})`;
        });
      })
      .join('');
  });
}

// Returns [{ path, content }] relative to the skill directory. With strict,
// throws on anything that would ship a broken or oversized skill; otherwise
// passes each problem to onProblem and returns the files anyway.
function buildSkillFiles(guide, body, { strict = true, onProblem = () => {} } = {}) {
  const frontmatter = buildSkillFrontmatter(guide);
  const single = frontmatter + body;
  if (lineCount(single) <= MAX_SKILL_LINES) {
    return [{ path: 'SKILL.md', content: single }];
  }

  const problems = [];
  const { preamble, sections } = splitSections(body);
  const section0 = sections.find(s => /^Section 0\b/.test(s.title));
  if (!section0) throw new Error(`${guide.file}: no "Section 0" H2 found`);

  // Every other H2 except the guide's own table of contents becomes a reference.
  const refs = sections
    .filter(s => s !== section0 && s.title !== 'Contents')
    .map(s => ({ src: s, title: s.title, lines: s.lines, file: `${REFERENCES_DIR}/${fileSlug(s.title)}.md`, summary: summaryFor(guide, s) }));

  const seenFiles = new Set();
  for (const r of refs) {
    if (seenFiles.has(r.file)) problems.push(`${guide.file}: two sections map to ${r.file}`);
    seenFiles.add(r.file);
    if (!r.summary) problems.push(`${guide.file}: section "${r.title}" needs an "Applies when:" line or a sectionSummaries entry in bin/lib/guides.js`);
  }
  const titles = new Set(sections.map(s => s.title));
  for (const key of Object.keys(guide.sectionSummaries || {})) {
    if (!titles.has(key)) problems.push(`${guide.file}: sectionSummaries has "${key}" but the guide has no such H2`);
  }

  // Map every guide-level anchor to the file and file-level anchor it lands in.
  const anchors = new Map();
  const guideCounts = new Map();
  const fileCounts = new Map();
  const place = (lines, file) => {
    for (const [line, inFence] of scanLines(lines)) {
      const h = inFence ? null : headingOf(line);
      if (!h) continue;
      const base = githubSlug(h.text);
      const g = guideCounts.get(base) || 0;
      guideCounts.set(base, g + 1);
      const key = `${file}\0${base}`;
      const f = fileCounts.get(key) || 0;
      fileCounts.set(key, f + 1);
      anchors.set(g ? `${base}-${g}` : base, {
        file,
        slug: f ? `${base}-${f}` : base,
        isFileTop: file !== 'SKILL.md' && h.level === 2,
      });
    }
  };
  place(preamble, 'SKILL.md');
  for (const s of sections) {
    const ref = refs.find(r => r.src === s);
    place(s.lines, ref ? ref.file : 'SKILL.md');
  }

  const index = [
    '## Contents',
    '',
    'This guide is split into reference files. Use the Section 0 answers to decide which apply, then read only those; skip the rest.',
    '',
    ...refs.map(r => `- [${r.title}](${r.file})${r.summary ? `: ${r.summary.replace(/^\w/, c => c.toUpperCase())}` : ''}`),
  ];

  const skillBody = [
    ...rewriteLinks(trimSection(preamble), 'SKILL.md', anchors, problems),
    '',
    '---',
    '',
    ...rewriteLinks(trimSection(section0.lines), 'SKILL.md', anchors, problems),
    '',
    '---',
    '',
    ...index,
    '',
  ].join('\n');

  const files = [{ path: 'SKILL.md', content: frontmatter + skillBody }];
  for (const r of refs) {
    files.push({ path: r.file, content: rewriteLinks(trimSection(r.lines), r.file, anchors, problems).join('\n') + '\n' });
  }

  const skillLines = lineCount(files[0].content);
  if (skillLines > MAX_SKILL_LINES) {
    problems.push(`${guide.file}: split SKILL.md is still ${skillLines} lines (max ${MAX_SKILL_LINES})`);
  }

  if (problems.length && strict) throw new Error(problems.join('\n'));
  problems.forEach(onProblem);
  return files;
}

module.exports = { MAX_SKILL_LINES, REFERENCES_DIR, buildSkillFiles, githubSlug, fileSlug, scanLines };
