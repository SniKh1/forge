#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: sync-runtime-skills.js <repo-root> <target-skills-dir> [--mode full|incremental] [--selected a,b,c]');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 2) usage();

const repoRoot = path.resolve(args[0]);
const targetSkillsDir = path.resolve(args[1]);
let mode = 'full';
let selected = null;

for (let i = 2; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--mode') {
    mode = args[i + 1] || mode;
    i += 1;
  } else if (arg === '--selected') {
    selected = new Set(String(args[i + 1] || '').split(',').map((x) => x.trim()).filter(Boolean));
    i += 1;
  }
}

const registryPath = path.join(repoRoot, 'core', 'skill-registry.json');
if (!fs.existsSync(registryPath)) {
  console.error(`Missing registry: ${registryPath}`);
  process.exit(2);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function syncDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
}

function listSystemSkillIds(skillsDir) {
  const systemDir = path.join(skillsDir, '.system');
  if (!fs.existsSync(systemDir)) return new Set();
  const ids = new Set();
  for (const entry of fs.readdirSync(systemDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillFile = path.join(systemDir, entry.name, 'SKILL.md');
    if (fs.existsSync(skillFile)) ids.add(entry.name);
  }
  return ids;
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const skills = Array.isArray(registry.skills) ? registry.skills : [];
ensureDir(targetSkillsDir);
const systemSkillIds = listSystemSkillIds(targetSkillsDir);

let installed = 0;
const allowedTopLevel = new Set(['learned']);

for (const skill of skills) {
  if (selected && !selected.has(skill.id)) continue;
  const src = path.join(repoRoot, skill.relativeSkillDir);
  const dest = path.join(targetSkillsDir, skill.id);
  if (!fs.existsSync(src)) continue;
  if (systemSkillIds.has(skill.id)) {
    fs.rmSync(dest, { recursive: true, force: true });
    continue;
  }
  allowedTopLevel.add(skill.id);
  if (mode === 'incremental' && fs.existsSync(dest)) continue;
  syncDir(src, dest);
  installed += 1;
}

for (const entry of fs.readdirSync(targetSkillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  if (entry.name.startsWith('.')) continue;
  if (allowedTopLevel.has(entry.name)) continue;
  const full = path.join(targetSkillsDir, entry.name);
  const skillFile = path.join(full, 'SKILL.md');
  if (fs.existsSync(skillFile)) continue;
  fs.rmSync(full, { recursive: true, force: true });
}

process.stdout.write(JSON.stringify({
  targetSkillsDir,
  mode,
  selected: selected ? [...selected] : null,
  installed,
}, null, 2));
