#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const { GUIDES, REFERENCES_DIR, buildSkillFiles } = require('../bin/lib/guides');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

function build() {
  if (!fs.existsSync(SKILLS_DIR)) fs.mkdirSync(SKILLS_DIR, { recursive: true });

  let failed = false;
  for (const guide of GUIDES) {
    const source = path.join(REPO_ROOT, guide.file);
    if (!fs.existsSync(source)) {
      console.error(`  skip ${guide.skillName}: source missing (${guide.file})`);
      continue;
    }

    let files;
    try {
      files = buildSkillFiles(guide, fs.readFileSync(source, 'utf8'));
    } catch (err) {
      console.error(`  failed ${guide.skillName}:\n    ${err.message.split('\n').join('\n    ')}`);
      failed = true;
      continue;
    }

    const skillDir = path.join(SKILLS_DIR, guide.skillName);
    if (!fs.existsSync(skillDir)) fs.mkdirSync(skillDir, { recursive: true });
    // Wipe references/ so renamed or removed sections don't leave orphans.
    fs.rmSync(path.join(skillDir, REFERENCES_DIR), { recursive: true, force: true });

    for (const file of files) {
      const dest = path.join(skillDir, file.path);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, file.content);
    }
    const refs = files.length - 1;
    console.log(`  built skills/${guide.skillName}/SKILL.md${refs ? ` + ${refs} reference files` : ''}`);
  }

  if (failed) process.exit(1);
}

build();
