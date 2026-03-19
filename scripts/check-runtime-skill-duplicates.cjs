#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const json = args.includes('--json');
const warnOnly = args.includes('--warn-only');
const cleanArgs = args.filter((arg) => !['--json', '--warn-only'].includes(arg));
const targetDir = cleanArgs[0];

if (!targetDir) {
  console.error('Usage: check-runtime-skill-duplicates.cjs [--json] [--warn-only] <skills-dir>');
  process.exit(1);
}

function walk(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.system') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const skillFile = path.join(full, 'SKILL.md');
      if (fs.existsSync(skillFile)) {
        results.push(full);
      }
      results.push(...walk(full));
    }
  }
  return results;
}

const skills = walk(targetDir);
const byId = new Map();
for (const skillDir of skills) {
  const id = path.basename(skillDir);
  if (!byId.has(id)) byId.set(id, []);
  byId.get(id).push(skillDir);
}

const duplicates = [...byId.entries()]
  .filter(([, paths]) => paths.length > 1)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([id, paths]) => ({ id, paths }));

const payload = {
  targetDir,
  totalSkillDirs: skills.length,
  duplicateCount: duplicates.length,
  duplicates
};

if (json) {
  process.stdout.write(JSON.stringify(payload, null, 2));
} else if (duplicates.length === 0) {
  console.log(`No duplicate skill IDs under ${targetDir}`);
} else {
  console.log(`Duplicate skill IDs under ${targetDir}:`);
  for (const entry of duplicates) {
    console.log(`- ${entry.id}`);
    for (const p of entry.paths) console.log(`  - ${p}`);
  }
}

if (!warnOnly && duplicates.length > 0) {
  process.exit(2);
}
