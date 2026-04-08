#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = path.resolve(import.meta.dirname, '..');
const skillsRoot = path.join(repoRoot, 'skills');
const sourceRegistryPath = path.join(repoRoot, 'scripts', 'lib', 'skills-registry.json');
const preserveExisting = !process.argv.includes('--force');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-upstream-skills-'));
const sourceRegistry = JSON.parse(fs.readFileSync(sourceRegistryPath, 'utf8'));
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

function fetchFile(url) {
  return withRetries(`fetch file ${url}`, () =>
    execFileSync('curl', ['--http1.1', '--connect-timeout', '10', '--max-time', '20', '-L', '-sS', url], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  );
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

function shouldCopyFile(filePath) {
  const ext = path.extname(filePath);
  if (TEXT_EXTENSIONS.has(ext)) return true;
  return TEXT_FILE_NAMES.has(path.basename(filePath));
}

function repoTree(owner, repo, branch) {
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

function readEntryContent(owner, repo, branch, entry) {
  if (entry.localPath) {
    return fs.readFileSync(entry.localPath);
  }
  return fetchFileWithFallbacks(rawUrls(owner, repo, branch, entry.path));
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

function buildSourceInstallMap(sourceId) {
  return new Map(
    Object.entries(sourceRegistry.skills ?? {})
      .filter(([, meta]) => meta?.source === sourceId)
      .map(([skillId, meta]) => {
        const upstreamPath = typeof meta.path === 'string' && meta.path && meta.path !== '.'
          ? meta.path
          : skillId;
        const installAs = typeof meta.install_as === 'string' && meta.install_as
          ? meta.install_as
          : skillId;
        return [upstreamPath, { skillId, installAs }];
      })
  );
}

const sourceInstallMaps = new Map(
  Object.keys(sourceRegistry.sources ?? {}).map((sourceId) => [sourceId, buildSourceInstallMap(sourceId)])
);

function resolveSkillTarget(sourceId, upstreamSkillId) {
  const target = sourceInstallMaps.get(sourceId)?.get(upstreamSkillId);
  return {
    skillId: target?.skillId || upstreamSkillId,
    installAs: target?.installAs || upstreamSkillId,
  };
}

function writeRepoFiles(owner, repo, branch, fileEntries, destDir, sourceBase = '') {
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
    fs.writeFileSync(destPath, readEntryContent(owner, repo, branch, entry));
    copied += 1;
  }

  if (copied === 0) {
    throw new Error(`No syncable files found for ${path.relative(repoRoot, destDir).replace(/\\/g, '/')}`);
  }

  rmDir(destDir);
  ensureDir(path.dirname(destDir));
  fs.cpSync(stagingDir, destDir, { recursive: true });
}

function collectSkillFilesFromTree(tree, rootPrefix, skillId) {
  const prefix = `${rootPrefix}/${skillId}/`;
  return tree
    .filter((entry) => entry.type === 'blob' && entry.path.startsWith(prefix))
    .map((entry) => entry);
}

function syncSkill(owner, repo, branch, filePaths, skillId, {
  overwrite = false,
  sourceBase = '',
  destDir = path.join(skillsRoot, skillId),
  legacyDirs = [],
} = {}) {
  if (preserveExisting && !overwrite && fs.existsSync(path.join(destDir, 'SKILL.md'))) {
    return {
      skillId,
      action: 'preserved',
      targetDir: path.relative(repoRoot, destDir).replace(/\\/g, '/'),
    };
  }

  try {
    writeRepoFiles(owner, repo, branch, filePaths, destDir, sourceBase);
    for (const legacyDir of legacyDirs) {
      if (legacyDir !== destDir) rmDir(legacyDir);
    }
    return {
      skillId,
      action: fs.existsSync(path.join(destDir, 'SKILL.md')) ? 'synced' : 'missing-skill-md',
      targetDir: path.relative(repoRoot, destDir).replace(/\\/g, '/'),
    };
  } catch (error) {
    return {
      skillId,
      action: 'failed',
      targetDir: path.relative(repoRoot, destDir).replace(/\\/g, '/'),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function syncAllSkillsUnderPrefix(owner, repo, branch, rootPrefix, { overwrite = false, sourceId } = {}) {
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

  return skillIds.map((upstreamSkillId) => {
    const target = resolveSkillTarget(sourceId, upstreamSkillId);
    const destDir = path.join(skillsRoot, ...target.installAs.split('/'));
    const legacyDirs = target.installAs !== upstreamSkillId
      ? [path.join(skillsRoot, upstreamSkillId)]
      : [];
    return syncSkill(
      owner,
      repo,
      branch,
      collectSkillFilesFromTree(tree, rootPrefix, upstreamSkillId),
      target.skillId,
      {
        overwrite,
        sourceBase: `${rootPrefix}/${upstreamSkillId}`,
        destDir,
        legacyDirs,
      }
    );
  });
}

function syncNotebookLm() {
  const owner = 'PleasePrompto';
  const repo = 'notebooklm-skill';
  const branch = 'master';
  const tree = repoTree(owner, repo, branch);
  const fileEntries = tree
    .filter((entry) => entry.type === 'blob')
    .filter((entry) => {
      const top = entry.path.split('/')[0];
      if (top === '.github') return false;
      if (top.startsWith('.')) return top === '.codex';
      return true;
    });

  return syncSkill(owner, repo, branch, fileEntries, 'notebooklm', {
    overwrite: true,
    sourceBase: '',
  });
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
    {
      overwrite: true,
      sourceBase: '.codex/skills/planning-with-files',
    }
  );
}

function syncExternalBundles() {
  return [
    ...safeSync('notebooklm', () => syncNotebookLm()),
    ...safeSync('planning-with-files', () => syncPlanningWithFiles()),
    ...safeSync('obsidian-skills', () =>
      syncAllSkillsUnderPrefix('kepano', 'obsidian-skills', 'main', 'skills', {
        overwrite: true,
        sourceId: 'obsidian-skills',
      })
    ),
    ...safeSync('skill-prompt-generator', () =>
      syncAllSkillsUnderPrefix('huangserva', 'skill-prompt-generator', 'main', '.claude/skills', {
        overwrite: true,
        sourceId: 'skill-prompt-generator',
      })
    ),
  ];
}

function safeSync(label, action) {
  try {
    const result = action();
    return Array.isArray(result) ? result : [result];
  } catch (error) {
    return [{
      skillId: label,
      action: 'failed-source',
      targetDir: null,
      error: error instanceof Error ? error.message : String(error),
    }];
  }
}

function main() {
  ensureDir(skillsRoot);
  const summary = [];

  summary.push(
    ...safeSync('ecc-skills', () =>
      syncAllSkillsUnderPrefix('affaan-m', 'everything-claude-code', 'main', 'skills', {
        sourceId: 'ecc-skills',
      })
    )
  );
  summary.push(
    ...safeSync('superpowers', () =>
      syncAllSkillsUnderPrefix('obra', 'superpowers', 'main', 'skills', {
        sourceId: 'superpowers',
      })
    )
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
