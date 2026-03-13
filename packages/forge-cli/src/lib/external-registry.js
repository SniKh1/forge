const fs = require('fs');
const os = require('os');
const path = require('path');
const { repoRoot, clientHomes } = require('./constants');
const { run } = require('./process');

const EXTERNAL_CACHE_ROOT = path.join(repoRoot, '.cache', 'external-registry');
const EXTERNAL_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function loadRegistrySources() {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, 'core', 'registry-sources.json'), 'utf8'));
}

function stripAnsi(value) {
  return String(value || '').replace(/\x1B\[[0-9;]*m/g, '');
}

function sanitizeName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'external-item';
}

function ensureCacheRoot() {
  fs.mkdirSync(EXTERNAL_CACHE_ROOT, { recursive: true });
}

function cachePath(kind, query) {
  return path.join(EXTERNAL_CACHE_ROOT, `${sanitizeName(`${kind}-${query || 'all'}`)}.json`);
}

function readCache(kind, query) {
  if (process.env.FORGE_BYPASS_EXTERNAL_CACHE === '1') return null;
  const file = cachePath(kind, query);
  if (!fs.existsSync(file)) return null;
  try {
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!payload || typeof payload !== 'object') return null;
    if (Date.now() - Number(payload.cachedAt || 0) > EXTERNAL_CACHE_TTL_MS) return null;
    return payload.data || null;
  } catch {
    return null;
  }
}

function writeCache(kind, query, data) {
  if (process.env.FORGE_BYPASS_EXTERNAL_CACHE === '1') return;
  ensureCacheRoot();
  fs.writeFileSync(cachePath(kind, query), JSON.stringify({
    kind,
    query,
    cachedAt: Date.now(),
    data,
  }, null, 2));
}

function versionParts(id) {
  const match = String(id || '').match(/@(\d+(?:\.\d+){0,3})$/);
  if (!match) return [];
  return match[1].split('.').map((item) => Number(item));
}

function compareVersionParts(left, right) {
  const max = Math.max(left.length, right.length);
  for (let index = 0; index < max; index += 1) {
    const a = left[index] || 0;
    const b = right[index] || 0;
    if (a !== b) return a - b;
  }
  return 0;
}

function dedupeMcpEntries(items) {
  const grouped = new Map();
  for (const item of items) {
    const key = sanitizeName(item.name || item.title || item.id);
    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, item);
      continue;
    }
    const installableDiff = Number(item.installable) - Number(current.installable);
    if (installableDiff > 0) {
      grouped.set(key, item);
      continue;
    }
    if (installableDiff < 0) continue;
    const versionDiff = compareVersionParts(versionParts(item.id), versionParts(current.id));
    if (versionDiff > 0) {
      grouped.set(key, item);
      continue;
    }
    if ((item.title || '').localeCompare(current.title || '') < 0) {
      grouped.set(key, item);
    }
  }
  return Array.from(grouped.values());
}

function parseSkillsFindOutput(output) {
  const lines = stripAnsi(output)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const results = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^([^\s]+\/[^\s@]+)@([^\s]+)\s+([\d.]+[KM]?)\s+installs$/i);
    if (!match) continue;
    const source = match[1];
    const skill = match[2];
    const installs = match[3];
    const urlLine = lines[index + 1] && lines[index + 1].startsWith('└ ') ? lines[index + 1].slice(2).trim() : '';
    results.push({
      id: `${source}@${skill}`,
      source,
      skill,
      title: skill,
      installs,
      url: urlLine,
      description: `来自 ${source} 的外部 skill，可安装到当前客户端 skill 目录。`,
      sourceLabel: 'skills.sh',
      trust: 'curated-external',
      kind: 'skills',
      installable: true,
    });
  }
  return results;
}

function searchExternalSkills(query) {
  const cached = readCache('skills', query);
  if (cached) return cached;
  const args = ['-y', 'skills', 'find'];
  if (query) args.push(query);
  const result = run('npx', args, { capture: true, allowFailure: true });
  const stdout = `${result.stdout || ''}${result.stderr || ''}`;
  if (result.status !== 0) {
    throw new Error(stripAnsi(stdout).trim() || 'skills find failed');
  }
  const parsed = parseSkillsFindOutput(stdout);
  writeCache('skills', query, parsed);
  return parsed;
}

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function installExternalSkill({ client, source, skill }) {
  if (!clientHomes[client]) throw new Error(`Unknown client: ${client}`);
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-ext-skill-'));
  try {
    const result = run('npx', ['-y', 'skills', 'add', source, '--skill', skill, '--agent', 'codex', '-y', '--copy'], {
      cwd: tempRoot,
      capture: true,
      allowFailure: true,
    });
    const output = `${result.stdout || ''}${result.stderr || ''}`;
    if (result.status !== 0) {
      throw new Error(stripAnsi(output).trim() || 'skills add failed');
    }
    const installedDir = path.join(tempRoot, '.agents', 'skills', skill);
    if (!fs.existsSync(installedDir)) {
      throw new Error(`Installed skill directory not found: ${installedDir}`);
    }
    const targetDir = path.join(clientHomes[client], 'skills', skill);
    copyDir(installedDir, targetDir);
    return {
      client,
      skill,
      source,
      targetDir,
      output: stripAnsi(output).trim(),
    };
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'accept': 'application/json',
      'user-agent': 'forge-cli/0.3.x',
    },
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function buildNpmInstallSpec(server) {
  const packages = Array.isArray(server.packages) ? server.packages : [];
  const pkg = packages.find((item) => {
    const transport = item?.transport?.type;
    const registryType = item?.registryType;
    const runtimeHint = item?.runtimeHint || 'npx';
    return transport === 'stdio' && registryType === 'npm' && runtimeHint === 'npx';
  });
  if (!pkg) return null;
  const identifier = pkg.identifier;
  const version = pkg.version ? `@${pkg.version}` : '';
  const env = Object.fromEntries(
    (pkg.environmentVariables || []).map((item) => [item.name, item.isRequired ? '' : ''])
  );
  return {
    name: sanitizeName(server.name),
    transport: 'stdio',
    command: 'npx',
    args: ['-y', `${identifier}${version}`],
    env,
    requiredSecrets: (pkg.environmentVariables || []).map((item) => item.name),
    packageIdentifier: identifier,
  };
}

function normalizeMcpEntry(entry) {
  const server = entry.server || {};
  const official = entry._meta?.['io.modelcontextprotocol.registry/official'] || {};
  const installSpec = buildNpmInstallSpec(server);
  return {
    id: `${server.name || 'unknown'}@${server.version || 'latest'}`,
    name: server.name || 'unknown',
    title: server.title || server.name || 'unknown',
    description: server.description || '',
    url: server.repository?.url || server.websiteUrl || server.remotes?.[0]?.url || '',
    sourceLabel: 'Official MCP Registry',
    kind: 'mcp',
    trust: 'curated-external',
    officialStatus: official.status || 'unknown',
    installable: Boolean(installSpec),
    installReason: installSpec ? 'npm-stdio' : 'browse-only',
    requiredSecrets: installSpec?.requiredSecrets || [],
    installSpec,
  };
}

async function searchExternalMcp(query) {
  const cached = readCache('mcp', query);
  if (cached) return cached;
  const sources = loadRegistrySources();
  const source = (sources.mcp || []).find((item) => item.id === 'official-mcp-registry');
  const url = new URL(source.api);
  url.searchParams.set('limit', '20');
  if (query) url.searchParams.set('search', query);
  const payload = await fetchJson(url.toString());
  const normalized = dedupeMcpEntries((payload.servers || []).map(normalizeMcpEntry));
  writeCache('mcp', query, normalized);
  return normalized;
}

module.exports = {
  loadRegistrySources,
  searchExternalSkills,
  installExternalSkill,
  searchExternalMcp,
  stripAnsi,
  sanitizeName,
};
