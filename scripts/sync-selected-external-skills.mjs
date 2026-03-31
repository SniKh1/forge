#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = path.resolve(import.meta.dirname, '..');
const skillsRoot = path.join(repoRoot, 'skills');

function run(command, args) {
  return execFileSync(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
}

function fetchJson(url) {
  return JSON.parse(
    run('curl', ['--http1.1', '--connect-timeout', '10', '--max-time', '20', '-L', '-sS', url, '-H', 'User-Agent: forge-sync'])
  );
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

function writeFiles(owner, repo, branch, treeUrl, matcher, targetResolver) {
  const tree = fetchJson(treeUrl).tree ?? [];
  const matched = tree.filter((entry) => entry.type === 'blob' && matcher(entry.path));
  for (const entry of matched) {
    const targetPath = targetResolver(entry.path);
    ensureDir(path.dirname(targetPath));
    fs.writeFileSync(targetPath, fetchBlobContent(entry.url));
  }
  return matched.length;
}

function syncNotebookLm() {
  const owner = 'PleasePrompto';
  const repo = 'notebooklm-skill';
  const branch = 'master';
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  return writeFiles(
    owner,
    repo,
    branch,
    treeUrl,
    (filePath) => {
      if (filePath.startsWith('images/')) return false;
      if (filePath.startsWith('.github/')) return false;
      return true;
    },
    (filePath) => path.join(skillsRoot, 'notebooklm', filePath)
  );
}

function syncPlanningWithFiles() {
  const owner = 'OthmanAdi';
  const repo = 'planning-with-files';
  const branch = 'master';
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const prefix = '.codex/skills/planning-with-files/';
  return writeFiles(
    owner,
    repo,
    branch,
    treeUrl,
    (filePath) => filePath.startsWith(prefix),
    (filePath) => path.join(skillsRoot, 'planning-with-files', filePath.slice(prefix.length))
  );
}

function syncObsidianBundle() {
  const owner = 'kepano';
  const repo = 'obsidian-skills';
  const branch = 'main';
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const prefix = 'skills/';
  return writeFiles(
    owner,
    repo,
    branch,
    treeUrl,
    (filePath) => filePath.startsWith(prefix),
    (filePath) => path.join(skillsRoot, filePath.slice(prefix.length))
  );
}

function syncPromptBundle() {
  const owner = 'huangserva';
  const repo = 'skill-prompt-generator';
  const branch = 'main';
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const prefix = '.claude/skills/';
  return writeFiles(
    owner,
    repo,
    branch,
    treeUrl,
    (filePath) => {
      if (!filePath.startsWith(prefix)) return false;
      const relative = filePath.slice(prefix.length);
      const parts = relative.split('/');
      if (parts.length !== 2) return false;
      return parts[1] === 'SKILL.md' || parts[1] === 'skill.md';
    },
    (filePath) => {
      const relative = filePath.slice(prefix.length);
      const [skillId, fileName] = relative.split('/');
      const normalized = fileName === 'skill.md' ? 'SKILL.md' : fileName;
      return path.join(skillsRoot, skillId, normalized);
    }
  );
}

const summary = {
  notebooklm: syncNotebookLm(),
  planningWithFiles: syncPlanningWithFiles(),
  obsidianBundle: syncObsidianBundle(),
  promptBundle: syncPromptBundle(),
};

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
