#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = path.resolve(import.meta.dirname, '..');
const skillsRoot = path.join(repoRoot, 'skills');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-selected-skills-'));
const repoSnapshots = new Map();
const TEXT_FILE_NAMES = new Set([
  'SKILL.md',
  'skill.md',
  'README',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'AUTHENTICATION.md',
]);
const OBSIDIAN_SKILL_IDS = [
  'obsidian-markdown',
  'obsidian-bases',
  'obsidian-cli',
  'json-canvas',
  'defuddle',
];
const PROMPT_SKILL_IDS = [
  'prompt-analyzer',
  'intelligent-prompt-generator',
  'prompt-master',
  'universal-learner',
];

const TEXT_EXTENSIONS = new Set([
  '.md',
  '.txt',
  '.py',
  '.js',
  '.ts',
  '.tsx',
  '.json',
  '.yaml',
  '.yml',
  '.sh',
  '.ps1',
  '.toml',
  '.sql',
  '.html',
  '.css',
  '.xml',
  '.csv',
]);

function run(command, args) {
  return execFileSync(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
}

function withRetries(label, fn, attempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return fn();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
    }
  }
  throw new Error(
    `${label} failed after ${attempts} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}

function fetchJson(url) {
  return JSON.parse(withRetries(`fetch json ${url}`, () =>
    run('curl', ['--http1.1', '--connect-timeout', '10', '--max-time', '20', '-L', '-sS', url, '-H', 'User-Agent: forge-sync'])
  ));
}

function fetchBlobContent(url) {
  const payload = fetchJson(url);
  const content = payload.content ?? '';
  const encoding = payload.encoding ?? 'base64';
  if (encoding !== 'base64') {
    throw new Error(`Unsupported blob encoding: ${encoding}`);
  }
  return Buffer.from(content.replace(/\n/g, ''), 'base64');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function rmDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function normalizeTargetFileName(name) {
  return name === 'skill.md' ? 'SKILL.md' : name;
}

function cloneRepo(owner, repo, branch) {
  const cacheKey = `${owner}/${repo}@${branch}`;
  const cached = repoSnapshots.get(cacheKey);
  if (cached) return cached;

  const cloneDir = path.join(tempRoot, 'repos', cacheKey.replace(/[^a-zA-Z0-9._-]+/g, '-'));
  rmDir(cloneDir);
  run('git', ['clone', '--depth', '1', '--branch', branch, '--single-branch', `https://github.com/${owner}/${repo}.git`, cloneDir]);
  repoSnapshots.set(cacheKey, cloneDir);
  return cloneDir;
}

function walkLocalRepo(rootDir, currentDir = rootDir) {
  const entries = [];
  for (const dirent of fs.readdirSync(currentDir, { withFileTypes: true })) {
    if (dirent.name === '.git') continue;
    const fullPath = path.join(currentDir, dirent.name);
    if (dirent.isDirectory()) {
      entries.push(...walkLocalRepo(rootDir, fullPath));
      continue;
    }
    entries.push({
      type: 'blob',
      path: path.relative(rootDir, fullPath).replace(/\\/g, '/'),
      localPath: fullPath,
    });
  }
  return entries;
}

function readEntryContent(entry) {
  if (entry.localPath) {
    return fs.readFileSync(entry.localPath);
  }
  return fetchBlobContent(entry.url);
}

function shouldCopyFile(filePath) {
  const ext = path.extname(filePath);
  if (TEXT_EXTENSIONS.has(ext)) return true;
  return TEXT_FILE_NAMES.has(path.basename(filePath));
}

function relativeRepoPath(filePath, sourceBase = '') {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const normalizedBase = String(sourceBase || '').replace(/\\/g, '/').replace(/\/+$/, '');
  if (!normalizedBase) return normalizedPath;
  if (normalizedPath === normalizedBase) return '';
  if (!normalizedPath.startsWith(`${normalizedBase}/`)) {
    throw new Error(`Path ${normalizedPath} is outside source base ${normalizedBase}`);
  }
  return normalizedPath.slice(normalizedBase.length + 1);
}

function treeFromRepo(owner, repo, branch) {
  try {
    const payload = fetchJson(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
    if (Array.isArray(payload?.tree)) {
      return payload.tree;
    }
    throw new Error(
      `Tree response missing entries for ${owner}/${repo}@${branch}: ${payload?.message || 'unknown response'}`
    );
  } catch (error) {
    const cloneDir = cloneRepo(owner, repo, branch);
    const tree = walkLocalRepo(cloneDir);
    if (tree.length === 0) {
      throw error;
    }
    return tree;
  }
}

function stageAndCopyFiles(fileEntries, destDir, sourceBase = '') {
  const stagingDir = path.join(tempRoot, 'staging', destDir.replace(/[:\\/]+/g, '-'));
  rmDir(stagingDir);
  ensureDir(stagingDir);

  let copied = 0;
  for (const entry of fileEntries) {
    if (!shouldCopyFile(entry.path)) continue;
    const relative = relativeRepoPath(entry.path, sourceBase);
    if (!relative) continue;
    const relativeDir = path.posix.dirname(relative);
    const fileName = normalizeTargetFileName(path.posix.basename(relative));
    const destPath = relativeDir === '.'
      ? path.join(stagingDir, fileName)
      : path.join(stagingDir, relativeDir, fileName);
    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, readEntryContent(entry));
    copied += 1;
  }

  if (copied === 0) {
    throw new Error(`No syncable files found for ${path.relative(repoRoot, destDir).replace(/\\/g, '/')}`);
  }

  rmDir(destDir);
  ensureDir(path.dirname(destDir));
  fs.cpSync(stagingDir, destDir, { recursive: true });
  return copied;
}

function collectSkillIds(tree, prefix) {
  const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
  return Array.from(
    new Set(
      tree
        .filter((entry) => {
          if (entry.type !== 'blob') return false;
          if (!entry.path.startsWith(normalizedPrefix)) return false;
          const relative = entry.path.slice(normalizedPrefix.length);
          const parts = relative.split('/');
          if (parts.length !== 2) return false;
          return parts[1] === 'SKILL.md' || parts[1] === 'skill.md';
        })
        .map((entry) => entry.path.slice(normalizedPrefix.length).split('/')[0])
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right, 'en'));
}

function collectSkillEntries(tree, prefix, skillId) {
  const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
  const skillPrefix = `${normalizedPrefix}${skillId}/`;
  return tree.filter((entry) => entry.type === 'blob' && entry.path.startsWith(skillPrefix));
}

function syncSkillEntries(fileEntries, destDir, sourceBase = '') {
  return {
    targetDir: path.relative(repoRoot, destDir).replace(/\\/g, '/'),
    filesCopied: stageAndCopyFiles(fileEntries, destDir, sourceBase),
  };
}

function ensureWrapperSkill(skillId, content) {
  const skillDir = path.join(skillsRoot, skillId);
  ensureDir(skillDir);
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `${content.trim()}\n`);
}

function writeBundleWrappers() {
  ensureWrapperSkill(
    'obsidian-skills',
    `---
name: obsidian-skills
description: Wrapper skill for Obsidian vault workflows, routing to bundled Obsidian markdown, bases, canvas, CLI, and ingestion skills.
---

# Obsidian Skills

Use this as a routing wrapper when the task broadly involves an Obsidian vault and it is not yet clear which specialized Obsidian skill is the best fit.

## Routing Guidance

- Use \`obsidian-markdown\` for notes, wikilinks, embeds, callouts, and frontmatter
- Use \`obsidian-bases\` for \`.base\` files, filters, and database-like views
- Use \`obsidian-cli\` for terminal automation against a running Obsidian instance
- Use \`json-canvas\` for canvas documents and canvas graph structure
- Use \`defuddle\` when imported content needs cleanup before it becomes a note

Prefer the more specific downstream skill once the task focus becomes clear.
`
  );

  ensureWrapperSkill(
    'skill-prompt-generator',
    `---
name: skill-prompt-generator
description: Wrapper skill for bundled prompt-generation and prompt-analysis workflows.
---

# Skill Prompt Generator

Use this as a routing wrapper when the task is generally about prompt design, generation, inspection, or prompt-library evolution and the most specific prompt skill is not yet obvious.

## Routing Guidance

- Use \`intelligent-prompt-generator\` for generating a new prompt from intent
- Use \`prompt-analyzer\` for inspecting or comparing existing prompts
- Use \`prompt-master\` when the prompt workflow itself needs high-level coordination
- Use \`universal-learner\` for extracting reusable prompt patterns into a library

Prefer the more specific downstream skill whenever the task scope becomes clear.
`
  );

  return {
    obsidianSkills: OBSIDIAN_SKILL_IDS.filter((skillId) => fs.existsSync(path.join(skillsRoot, skillId, 'SKILL.md'))),
    promptBundle: PROMPT_SKILL_IDS.filter((skillId) => fs.existsSync(path.join(skillsRoot, skillId, 'SKILL.md'))),
  };
}

function safeSync(label, action) {
  try {
    return { label, ok: true, ...action() };
  } catch (error) {
    return {
      label,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function syncNotebookLm() {
  const owner = 'PleasePrompto';
  const repo = 'notebooklm-skill';
  const branch = 'master';
  const tree = treeFromRepo(owner, repo, branch);
  const fileEntries = tree.filter((entry) => {
    if (entry.type !== 'blob') return false;
    const top = entry.path.split('/')[0];
    if (top === '.github') return false;
    if (top.startsWith('.')) return top === '.codex';
    return true;
  });

  return syncSkillEntries(fileEntries, path.join(skillsRoot, 'notebooklm'), '');
}

function syncPlanningWithFiles() {
  const owner = 'OthmanAdi';
  const repo = 'planning-with-files';
  const branch = 'master';
  const prefix = '.codex/skills/planning-with-files';
  const tree = treeFromRepo(owner, repo, branch);
  const fileEntries = tree.filter((entry) => entry.type === 'blob' && entry.path.startsWith(`${prefix}/`));
  return syncSkillEntries(fileEntries, path.join(skillsRoot, 'planning-with-files'), prefix);
}

function syncObsidianBundle() {
  const owner = 'kepano';
  const repo = 'obsidian-skills';
  const branch = 'main';
  const prefix = 'skills';
  const tree = treeFromRepo(owner, repo, branch);
  const skillIds = collectSkillIds(tree, prefix);
  const results = skillIds.map((skillId) =>
    syncSkillEntries(
      collectSkillEntries(tree, prefix, skillId),
      path.join(skillsRoot, skillId),
      `${prefix}/${skillId}`
    )
  );
  return {
    skillCount: results.length,
    filesCopied: results.reduce((sum, item) => sum + item.filesCopied, 0),
  };
}

function syncPromptBundle() {
  const owner = 'huangserva';
  const repo = 'skill-prompt-generator';
  const branch = 'main';
  const prefix = '.claude/skills';
  const tree = treeFromRepo(owner, repo, branch);
  const skillIds = collectSkillIds(tree, prefix);
  const results = skillIds.map((skillId) =>
    syncSkillEntries(
      collectSkillEntries(tree, prefix, skillId),
      path.join(skillsRoot, skillId),
      `${prefix}/${skillId}`
    )
  );
  return {
    skillCount: results.length,
    filesCopied: results.reduce((sum, item) => sum + item.filesCopied, 0),
  };
}

try {
  const summary = {
    notebooklm: safeSync('notebooklm', syncNotebookLm),
    planningWithFiles: safeSync('planning-with-files', syncPlanningWithFiles),
    obsidianBundle: safeSync('obsidian-skills', syncObsidianBundle),
    promptBundle: safeSync('skill-prompt-generator', syncPromptBundle),
    wrappers: writeBundleWrappers(),
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
} finally {
  rmDir(tempRoot);
}
