#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const { GUIDES, buildSkillFrontmatter } = require('../bin/lib/guides');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

function build() {
  if (!fs.existsSync(SKILLS_DIR)) fs.mkdirSync(SKILLS_DIR, { recursive: true });

  for (const guide of GUIDES) {
    const source = path.join(REPO_ROOT, guide.file);
    if (!fs.existsSync(source)) {
      console.error(`  skip ${guide.skillName}: source missing (${guide.file})`);
      continue;
    }

    const skillDir = path.join(SKILLS_DIR, guide.skillName);
    if (!fs.existsSync(skillDir)) fs.mkdirSync(skillDir, { recursive: true });

    const body = fs.readFileSync(source, 'utf8');
    const out = buildSkillFrontmatter(guide) + body;
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), out);
    console.log(`  built skills/${guide.skillName}/SKILL.md`);
  }
}

build();
