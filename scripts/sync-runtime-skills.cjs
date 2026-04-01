#!/usr/bin/env node
// Sync skills from repo to runtime directory (e.g., ~/.claude/skills)
//
// DEDUPLICATION: This script now includes content-based deduplication to prevent
// unnecessary overwrites when skills already exist with identical content.
// This fixes the issue where desktop clients were creating duplicate skills
// in global directories during installation/updates.
//
// Modified: 2026-04-01 - Added deduplication logic for Claude client

const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: sync-runtime-skills.cjs <repo-root> <target-skills-dir> [--mode full|incremental] [--selection-mode selected|full-library] [--selected a,b,c]');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 2) usage();

const repoRoot = path.resolve(args[0]);
const targetSkillsDir = path.resolve(args[1]);
let mode = 'full';
let selectionMode = 'selected';
let selected = null;

for (let i = 2; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--mode') {
    mode = args[i + 1] || mode;
    i += 1;
  } else if (arg === '--selection-mode') {
    selectionMode = args[i + 1] || selectionMode;
    i += 1;
  } else if (arg === '--selected') {
    selected = new Set(String(args[i + 1] || '').split(',').map((x) => x.trim()).filter(Boolean));
    i += 1;
  }
}

if (!['selected', 'full-library'].includes(selectionMode)) {
  console.error(`Invalid --selection-mode: ${selectionMode}`);
  process.exit(3);
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
let skipped = 0;
const allowedTopLevel = new Set(['learned']);

for (const skill of skills) {
  if (selectionMode === 'selected' && selected && !selected.has(skill.id)) continue;
  const src = path.join(repoRoot, skill.relativeSkillDir);
  const dest = path.join(targetSkillsDir, skill.id);
  if (!fs.existsSync(src)) continue;
  if (systemSkillIds.has(skill.id)) {
    fs.rmSync(dest, { recursive: true, force: true });
    continue;
  }
  allowedTopLevel.add(skill.id);
  // 去重检查：如果目标已存在且内容相同，跳过同步
  if (mode === 'incremental' && fs.existsSync(dest)) {
    skipped += 1;
    continue;
  }
  // 即使是 full 模式，也检查是否已存在相同内容，避免不必要的覆盖
  if (mode === 'full' && fs.existsSync(dest)) {
    const srcSkillMd = path.join(src, 'SKILL.md');
    const destSkillMd = path.join(dest, 'SKILL.md');
    if (fs.existsSync(srcSkillMd) && fs.existsSync(destSkillMd)) {
      const srcContent = fs.readFileSync(srcSkillMd, 'utf8');
      const destContent = fs.readFileSync(destSkillMd, 'utf8');
      if (srcContent === destContent) {
        skipped += 1;
        continue;
      }
    }
  }
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
  selectionMode,
  selected: selected ? [...selected] : null,
  libraryCount: skills.length,
  installed,
  skipped,
}, null, 2));
