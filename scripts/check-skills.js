#!/usr/bin/env node

'use strict';

// Validates the generated skills/ tree: every SKILL.md is within the line
// limit, every relative link (and #anchor) resolves, SKILL.md links only one
// level deep, and every reference file is reachable from its SKILL.md.

const fs = require('fs');
const path = require('path');

const { GUIDES, MAX_SKILL_LINES, REFERENCES_DIR, githubSlug, scanLines } = require('../bin/lib/guides');

const SKILLS_DIR = path.resolve(__dirname, '..', 'skills');

function anchorsOf(text) {
  const anchors = new Set();
  const counts = new Map();
  for (const [line, inFence] of scanLines(text.split('\n'))) {
    const m = !inFence && line.match(/^#{1,6}\s+(.*?)\s*#*\s*$/);
    if (!m) continue;
    const base = githubSlug(m[1]);
    const n = counts.get(base) || 0;
    counts.set(base, n + 1);
    anchors.add(n ? `${base}-${n}` : base);
  }
  return anchors;
}

function linksOf(text) {
  const links = [];
  for (const [line, inFence] of scanLines(text.split('\n'))) {
    if (inFence) continue;
    const prose = line.split(/`+[^`]*`+/).join('');
    for (const m of prose.matchAll(/\]\(([^)\s]+)\)/g)) links.push(m[1]);
  }
  return links;
}

function check() {
  const problems = [];
  for (const guide of GUIDES) {
    const skillDir = path.join(SKILLS_DIR, guide.skillName);
    const skillFile = path.join(skillDir, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      problems.push(`${guide.skillName}: SKILL.md missing`);
      continue;
    }

    const files = ['SKILL.md'];
    const refDir = path.join(skillDir, REFERENCES_DIR);
    if (fs.existsSync(refDir)) {
      for (const f of fs.readdirSync(refDir).sort()) files.push(`${REFERENCES_DIR}/${f}`);
    }

    const skillLines = fs.readFileSync(skillFile, 'utf8').replace(/\n$/, '').split('\n').length;
    if (skillLines > MAX_SKILL_LINES) {
      problems.push(`${guide.skillName}/SKILL.md: ${skillLines} lines (max ${MAX_SKILL_LINES})`);
    }

    const linkedFromSkill = new Set();
    for (const rel of files) {
      const text = fs.readFileSync(path.join(skillDir, rel), 'utf8');
      for (const link of linksOf(text)) {
        if (/^[a-z][a-z0-9+.-]*:/i.test(link)) continue; // absolute URL
        const [target, anchor] = link.split('#');
        const targetRel = target ? path.posix.normalize(path.posix.join(path.posix.dirname(rel), target)) : rel;
        const where = `${guide.skillName}/${rel}: ${link}`;
        if (targetRel.startsWith('..')) {
          problems.push(`${where} points outside the skill`);
          continue;
        }
        const targetPath = path.join(skillDir, targetRel);
        if (!fs.existsSync(targetPath)) {
          problems.push(`${where} does not resolve`);
          continue;
        }
        if (anchor && !anchorsOf(fs.readFileSync(targetPath, 'utf8')).has(anchor)) {
          problems.push(`${where} has no matching heading`);
        }
        if (rel === 'SKILL.md' && target) {
          if (targetRel.split('/').length > 2) problems.push(`${where} is more than one level deep`);
          linkedFromSkill.add(targetRel);
        }
      }
    }

    for (const rel of files.slice(1)) {
      if (!linkedFromSkill.has(rel)) problems.push(`${guide.skillName}/${rel}: not linked from SKILL.md`);
    }
  }

  if (problems.length) {
    console.error(problems.map(p => `  ${p}`).join('\n'));
    process.exit(1);
  }
  console.log(`  skills/ ok (${GUIDES.length} skills)`);
}

check();
