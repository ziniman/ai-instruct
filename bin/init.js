#!/usr/bin/env node

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

const { version } = require('../package.json');
const { GUIDES, buildSkillFrontmatter } = require('./lib/guides');
const REPO_RAW = 'https://raw.githubusercontent.com/ziniman/ai-instruct/main';
const DOCS_DIR = 'ai-docs';
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const PACKAGE_SKILLS_DIR = path.join(PACKAGE_ROOT, 'skills');

const TOOL_CONFIGS = [
  {
    name: 'Claude Code',
    file: 'CLAUDE.md',
    ref: (guide) => `\nRead ${DOCS_DIR}/${guide.file} for ${guide.topic}.\n`,
  },
  {
    name: 'Cursor',
    file: '.cursorrules',
    ref: (guide) => `\n# ${guide.name}\nRefer to ${DOCS_DIR}/${guide.file} for ${guide.topic} guidance.\n`,
  },
  {
    name: 'GitHub Copilot',
    file: '.github/copilot-instructions.md',
    ref: (guide) => `\n## ${guide.name}\nRefer to ${DOCS_DIR}/${guide.file} for ${guide.topic} guidance.\n`,
  },
  {
    name: 'Windsurf',
    file: '.windsurfrules',
    ref: (guide) => `\n# ${guide.name}\nRefer to ${DOCS_DIR}/${guide.file} for ${guide.topic} guidance.\n`,
  },
];

function detectTools() {
  return TOOL_CONFIGS.filter(t => fs.existsSync(t.file));
}

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

function alreadyReferenced(configFile, guide) {
  if (!fs.existsSync(configFile)) return false;
  return fs.readFileSync(configFile, 'utf8').includes(guide.file);
}

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  fs.writeFileSync(dest, await res.text());
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function runSkillsFlow(rl, userScope) {
  const baseDir = userScope
    ? path.join(os.homedir(), '.claude', 'skills')
    : path.join('.claude', 'skills');

  console.log(`Installing as Claude Code skills (${userScope ? 'user' : 'project'} scope).`);
  console.log(`Target: ${baseDir}/\n`);

  console.log('Available guides:');
  GUIDES.forEach((g, i) => console.log(`  ${i + 1}. ${g.name}\n     ${g.desc}`));
  const sel = await ask(rl, `\nWhich guides? [1-${GUIDES.length}, comma-separated, or Enter for all]: `);

  const selected = sel === ''
    ? GUIDES
    : sel.split(',').map(s => GUIDES[parseInt(s.trim()) - 1]).filter(Boolean);

  if (selected.length === 0) {
    console.log('\nNo valid guides selected. Exiting.');
    return;
  }

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
    console.log(`\nCreated ${baseDir}/`);
  } else {
    console.log(`\nUsing existing ${baseDir}/`);
  }

  console.log('');
  for (const guide of selected) {
    const skillDir = path.join(baseDir, guide.skillName);
    if (!fs.existsSync(skillDir)) fs.mkdirSync(skillDir, { recursive: true });

    const dest = path.join(skillDir, 'SKILL.md');
    const localSkill = path.join(PACKAGE_SKILLS_DIR, guide.skillName, 'SKILL.md');
    process.stdout.write(`  Installing ${guide.skillName}... `);
    try {
      let content;
      if (fs.existsSync(localSkill)) {
        content = fs.readFileSync(localSkill, 'utf8');
      } else {
        const body = await fetchText(`${REPO_RAW}/${guide.file}`);
        content = buildSkillFrontmatter(guide) + body;
      }
      fs.writeFileSync(dest, content);
      console.log('✓');
    } catch (err) {
      console.log(`✗  ${err.message}`);
    }
  }

  console.log('\n--------------------------------------------------');
  console.log(`Done! ${selected.length} skill(s) installed in ${baseDir}/`);
  console.log('Claude Code will auto-discover them on next session.');
  if (!userScope) {
    console.log('Commit .claude/skills/ if you want your team to share these.\n');
  } else {
    console.log('');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const skillsMode = args.includes('--skills');
  const userScope = args.includes('--user');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const C = '\x1b[31m';  // red
  const D = '\x1b[2m';   // dim
  const R = '\x1b[0m';   // reset

  console.log(`
${C}   █████╗ ██╗${R}
${C}  ██╔══██╗██║${R}
${C}  ███████║██║${R}
${C}  ██╔══██║██║${R}
${C}  ██║  ██║██║${R}
${C}  ╚═╝  ╚═╝╚═╝${R}

  ${C}instruct${R}  ${D}v${version}${R}
  AI coding assistant guides
`);

  if (skillsMode) {
    try {
      await runSkillsFlow(rl, userScope);
    } finally {
      rl.close();
    }
    return;
  }

  // Detect AI tools
  const detected = detectTools();
  let configsToUpdate = [];

  if (detected.length > 0) {
    const names = detected.map(t => t.name).join(', ');
    console.log(`Detected: ${names}`);
    const ans = await ask(rl, `Update ${detected.length > 1 ? 'these configs' : 'this config'}? [Y/n] `);
    if (ans.toLowerCase() !== 'n') {
      configsToUpdate = detected;
    }
  } else {
    console.log('No AI tool config detected in the current directory.');
    console.log('\nSupported tools:');
    TOOL_CONFIGS.forEach((t, i) => console.log(`  ${i + 1}. ${t.name}  (${t.file})`));
    console.log(`  ${TOOL_CONFIGS.length + 1}. Skip - download guides only`);
    const ans = await ask(rl, `\nSelect [1-${TOOL_CONFIGS.length + 1}]: `);
    const idx = parseInt(ans) - 1;
    if (idx >= 0 && idx < TOOL_CONFIGS.length) {
      configsToUpdate = [TOOL_CONFIGS[idx]];
    }
  }

  // Guide selection
  console.log('\nAvailable guides:');
  GUIDES.forEach((g, i) => console.log(`  ${i + 1}. ${g.name}\n     ${g.desc}`));
  const sel = await ask(rl, `\nWhich guides? [1-${GUIDES.length}, comma-separated, or Enter for all]: `);

  const selected = sel === ''
    ? GUIDES
    : sel.split(',').map(s => GUIDES[parseInt(s.trim()) - 1]).filter(Boolean);

  if (selected.length === 0) {
    console.log('\nNo valid guides selected. Exiting.');
    rl.close();
    return;
  }

  // Create ai-docs/ directory
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR);
    console.log(`\nCreated ${DOCS_DIR}/`);
  } else {
    console.log(`\nUsing existing ${DOCS_DIR}/`);
  }

  // Download guides
  console.log('');
  for (const guide of selected) {
    const dest = path.join(DOCS_DIR, guide.file);
    process.stdout.write(`  Downloading ${guide.file}... `);
    try {
      await downloadFile(`${REPO_RAW}/${guide.file}`, dest);
      console.log('✓');
    } catch (err) {
      console.log(`✗  ${err.message}`);
    }
  }

  // Update config files
  for (const tool of configsToUpdate) {
    const dir = path.dirname(tool.file);
    if (dir !== '.' && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const added = [];
    for (const guide of selected) {
      if (alreadyReferenced(tool.file, guide)) continue;
      fs.appendFileSync(tool.file, tool.ref(guide));
      added.push(guide.name);
    }

    if (added.length > 0) {
      console.log(`\nUpdated ${tool.file}:`);
      added.forEach(name => console.log(`  + ${name}`));
    } else {
      console.log(`\n${tool.file}: all selected guides already referenced - no changes.`);
    }
  }

  // Done
  console.log('\n──────────────────────────────────────────────────');
  console.log(`Done! ${selected.length} guide(s) downloaded to ${DOCS_DIR}/`);

  if (configsToUpdate.length > 0) {
    console.log('Commit ai-docs/ and your updated config file(s).\n');
  } else {
    console.log('\nNext: reference the guides from your AI tool\'s config file.');
    console.log('Example for Claude Code (CLAUDE.md):');
    selected.forEach(g => console.log(`  Read ${DOCS_DIR}/${g.file} for ${g.topic}.`));
    console.log('');
  }

  rl.close();
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
