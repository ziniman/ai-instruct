#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const { version } = require(path.join(REPO_ROOT, 'package.json'));

const TARGETS = [
  {
    file: path.join(REPO_ROOT, '.claude-plugin', 'plugin.json'),
    update: (json) => { json.version = version; },
  },
  {
    file: path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json'),
    update: (json) => {
      if (Array.isArray(json.plugins)) {
        for (const p of json.plugins) {
          if (p.name === 'ai-instruct') p.version = version;
        }
      }
    },
  },
];

for (const target of TARGETS) {
  if (!fs.existsSync(target.file)) {
    console.error(`  skip ${path.relative(REPO_ROOT, target.file)}: missing`);
    continue;
  }
  const json = JSON.parse(fs.readFileSync(target.file, 'utf8'));
  target.update(json);
  fs.writeFileSync(target.file, JSON.stringify(json, null, 2) + '\n');
  console.log(`  synced ${path.relative(REPO_ROOT, target.file)} -> ${version}`);
}
