#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = path.resolve(import.meta.dirname, '..');
const skillsRoot = path.join(repoRoot, 'skills');
const preserveExisting = !process.argv.includes('--force');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-upstream-skills-'));

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

function fetchJson(url) {
  return JSON.parse(run('curl', ['--http1.1', '--connect-timeout', '10', '--max-time', '20', '-L', '-sS', url]));
}

function fetchFile(url) {
  return execFileSync('curl', ['--http1.1', '--connect-timeout', '10', '--max-time', '20', '-L', '-sS', url], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
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

function shouldCopyFile(filePath) {
  const ext = path.extname(filePath);
  if (TEXT_EXTENSIONS.has(ext)) return true;
  return path.basename(filePath) === 'SKILL.md' || path.basename(filePath) === 'skill.md';
}

function repoTree(owner, repo, branch) {
  return fetchJson(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`).tree ?? [];
}

function rawUrls(owner, repo, branch, filePath) {
  return [
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
    `https://github.com/${owner}/${repo}/raw/${branch}/${filePath}`,
    `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${filePath}`,
  ];
}

function fetchFileWithFallbacks(urls) {
  let lastError = null;
  for (const url of urls) {
    try {
      return fetchFile(url);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function writeRepoFiles(owner, repo, branch, filePaths, destDir) {
  const stagingDir = path.join(tempRoot, 'staging', path.basename(destDir));
  rmDir(stagingDir);
  ensureDir(stagingDir);
  for (const filePath of filePaths) {
    if (!shouldCopyFile(filePath)) continue;
    const relative = filePath.split('/').slice(1).join('/');
    const fileName = normalizeTargetFileName(path.basename(relative));
    const destPath = path.join(stagingDir, path.dirname(relative), fileName);
    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, fetchFileWithFallbacks(rawUrls(owner, repo, branch, filePath)));
  }
  rmDir(destDir);
  ensureDir(path.dirname(destDir));
  fs.cpSync(stagingDir, destDir, { recursive: true });
}

function collectSkillFilesFromTree(tree, rootPrefix, skillId) {
  const prefix = `${rootPrefix}/${skillId}/`;
  return tree
    .filter((entry) => entry.type === 'blob' && entry.path.startsWith(prefix))
    .map((entry) => entry.path);
}

function syncSkill(owner, repo, branch, filePaths, skillId, { overwrite = false } = {}) {
  const destDir = path.join(skillsRoot, skillId);
  if (preserveExisting && !overwrite && fs.existsSync(path.join(destDir, 'SKILL.md'))) {
    return { skillId, action: 'preserved' };
  }
  try {
    writeRepoFiles(owner, repo, branch, filePaths, destDir);
    return { skillId, action: fs.existsSync(path.join(destDir, 'SKILL.md')) ? 'synced' : 'missing-skill-md' };
  } catch (error) {
    rmDir(destDir);
    return {
      skillId,
      action: 'failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function syncAllSkillsUnderPrefix(owner, repo, branch, rootPrefix, { overwrite = false } = {}) {
  const tree = repoTree(owner, repo, branch);
  const skillIds = Array.from(
    new Set(
      tree
        .filter((entry) => {
          if (entry.type !== 'blob') return false;
          if (!entry.path.startsWith(`${rootPrefix}/`)) return false;
          const relative = entry.path.slice(`${rootPrefix}/`.length);
          const parts = relative.split('/');
          if (parts.length !== 2) return false;
          return parts[1] === 'SKILL.md' || parts[1] === 'skill.md';
        })
        .map((entry) => entry.path.slice(`${rootPrefix}/`.length).split('/')[0])
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right, 'en'));

  return skillIds.map((skillId) =>
    syncSkill(owner, repo, branch, collectSkillFilesFromTree(tree, rootPrefix, skillId), skillId, { overwrite })
  );
}

function syncNotebookLm() {
  const owner = 'PleasePrompto';
  const repo = 'notebooklm-skill';
  const branch = 'master';
  const tree = repoTree(owner, repo, branch);
  const filePaths = tree
    .filter((entry) => entry.type === 'blob')
    .map((entry) => entry.path)
    .filter((filePath) => {
      const top = filePath.split('/')[0];
      if (top === '.github') return false;
      if (top.startsWith('.')) return top === '.codex';
      return true;
    });
  return syncSkill(owner, repo, branch, filePaths, 'notebooklm', { overwrite: true });
}

function syncPlanningWithFiles() {
  const owner = 'OthmanAdi';
  const repo = 'planning-with-files';
  const branch = 'master';
  const tree = repoTree(owner, repo, branch);
  return syncSkill(
    owner,
    repo,
    branch,
    collectSkillFilesFromTree(tree, '.codex/skills', 'planning-with-files'),
    'planning-with-files',
    { overwrite: true }
  );
}

function syncExternalBundles() {
  const results = [];
  results.push(syncNotebookLm());
  results.push(syncPlanningWithFiles());
  results.push(
    ...syncAllSkillsUnderPrefix('kepano', 'obsidian-skills', 'main', 'skills', { overwrite: true })
  );
  results.push(
    ...syncAllSkillsUnderPrefix('huangserva', 'skill-prompt-generator', 'main', '.claude/skills', { overwrite: true })
  );
  return results;
}

function main() {
  ensureDir(skillsRoot);
  const summary = [];

  summary.push(
    ...syncAllSkillsUnderPrefix('affaan-m', 'everything-claude-code', 'main', 'skills')
  );
  summary.push(
    ...syncAllSkillsUnderPrefix('obra', 'superpowers', 'main', 'skills')
  );
  summary.push(...syncExternalBundles());

  const counts = summary.reduce((acc, item) => {
    acc[item.action] = (acc[item.action] || 0) + 1;
    return acc;
  }, {});

  process.stdout.write(
    JSON.stringify(
      {
        preserveExisting,
        total: summary.length,
        counts,
        sample: summary.slice(0, 80),
      },
      null,
      2
    )
  );
}

try {
  main();
} finally {
  rmDir(tempRoot);
}
