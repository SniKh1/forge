import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const projectRoot = path.resolve(import.meta.dirname, '..');
const repoRoot = path.resolve(projectRoot, '..', '..');
const srcDir = path.join(projectRoot, 'src');
const codexRoot = path.join(os.homedir(), '.codex');
const repoForgeCoreRoot = path.join(repoRoot, 'core');
const repoForgeRolesRoot = path.join(repoRoot, 'roles');
const repoForgeStacksRoot = path.join(repoRoot, 'stacks');
const repoSkillsRoot = path.join(repoRoot, 'skills');
const localSkillsRoot = path.join(codexRoot, 'skills');
const codexConfigPath = path.join(codexRoot, 'config.toml');
const sourceRegistryPath = path.join(repoRoot, 'scripts', 'lib', 'skills-registry.json');
const modulesPath = path.join(repoRoot, 'scripts', 'lib', 'modules.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeGeneratedTs(targetPath, exportName, value) {
  const content = `export const ${exportName} = ${JSON.stringify(value, null, 2)} as const;\n`;
  fs.writeFileSync(targetPath, content);
}

function listForgeFiles(rootDir) {
  if (!fs.existsSync(rootDir)) return [];
  return fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name.replace(/\.md$/, ''))
    .sort((left, right) => left.localeCompare(right, 'en'));
}

function listSkillIds(rootDir, { includeLearned = false } = {}) {
  const ids = new Set();

  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'learned' && !includeLearned) continue;
      if (entry.name.startsWith('.') && entry.name !== '.system') continue;
      const full = path.join(currentDir, entry.name);
      if (fs.existsSync(path.join(full, 'SKILL.md'))) {
        ids.add(entry.name);
        continue;
      }
      walk(full);
    }
  }

  walk(rootDir);
  return Array.from(ids).sort((left, right) => left.localeCompare(right, 'en'));
}

function diffIds(left, right) {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item));
}

function resolveSourceRegistryHealth(skillRegistry, repoSkillIds, installedSkillIds, sourceRegistry, modules) {
  const canonicalIds = new Set(skillRegistry.skills.map((skill) => skill.id));
  const repoSkillSet = new Set(repoSkillIds);
  const installedSkillSet = new Set(installedSkillIds);
  const registrySkills = Object.entries(sourceRegistry.skills ?? {});

  function skillExists(id, meta = {}) {
    if (canonicalIds.has(id) || repoSkillSet.has(id) || installedSkillSet.has(id)) {
      return true;
    }
    const installAs = typeof meta.install_as === 'string' && meta.install_as ? path.basename(meta.install_as) : null;
    return Boolean(installAs && (canonicalIds.has(installAs) || repoSkillSet.has(installAs) || installedSkillSet.has(installAs)));
  }

  const sourceGhostSkillIds = registrySkills
    .filter(([id, meta]) => !skillExists(id, meta))
    .map(([id]) => id)
    .sort((left, right) => left.localeCompare(right, 'en'));

  const moduleSkillIds = Object.values(modules.modules ?? {})
    .flatMap((moduleDef) => (Array.isArray(moduleDef.skills) ? moduleDef.skills : []));
  const moduleGhostSkillIds = Array.from(new Set(moduleSkillIds))
    .filter((id) => !skillExists(id, sourceRegistry.skills?.[id] ?? {}))
    .sort((left, right) => left.localeCompare(right, 'en'));

  const repoMissingCanonicalSkillIds = diffIds(
    skillRegistry.skills.map((skill) => skill.id),
    repoSkillIds
  );
  const installedMissingCanonicalSkillIds = diffIds(
    skillRegistry.skills.map((skill) => skill.id),
    installedSkillIds
  );

  const snapshotWarnings = [];
  if (repoMissingCanonicalSkillIds.length > 0) {
    snapshotWarnings.push(`repo_missing_canonical_skills=${repoMissingCanonicalSkillIds.join(',')}`);
  }
  if (installedMissingCanonicalSkillIds.length > 0) {
    snapshotWarnings.push(`installed_missing_canonical_skills=${installedMissingCanonicalSkillIds.join(',')}`);
  }
  if (sourceGhostSkillIds.length > 0) {
    snapshotWarnings.push(`source_registry_ghost_skills=${sourceGhostSkillIds.join(',')}`);
  }
  if (moduleGhostSkillIds.length > 0) {
    snapshotWarnings.push(`module_ghost_skills=${moduleGhostSkillIds.join(',')}`);
  }

  return {
    repoSkillCount: repoSkillIds.length,
    installedSkillCount: installedSkillIds.length,
    repoMissingCanonicalSkillIds,
    installedMissingCanonicalSkillIds,
    sourceRegistrySkillCount: registrySkills.length,
    sourceGhostSkillIds,
    moduleGhostSkillIds,
    snapshotWarnings,
  };
}

function parseConfiguredMcpServers(configPath) {
  if (!fs.existsSync(configPath)) return [];
  const text = fs.readFileSync(configPath, 'utf8');
  const found = new Set();

  for (const line of text.split(/\r?\n/)) {
    const match = line.trim().match(/^\[mcp_servers\.([A-Za-z0-9_-]+)\]$/);
    if (match) {
      found.add(match[1]);
    }
  }

  return Array.from(found).sort((left, right) => left.localeCompare(right, 'en'));
}

const skillRegistry = readJson(path.join(repoForgeCoreRoot, 'skill-registry.json'));
const roleMcpMatrix = readJson(path.join(repoForgeCoreRoot, 'role-mcp-matrix.json'));
const domainMcpMatrix = readJson(path.join(repoForgeCoreRoot, 'domain-mcp-matrix.json'));
const mcpServers = readJson(path.join(repoForgeCoreRoot, 'mcp-servers.json'));
const roleDisplayPath = path.join(repoForgeCoreRoot, 'role-display.json');
const sourceRegistry = fs.existsSync(sourceRegistryPath) ? readJson(sourceRegistryPath) : { skills: {} };
const modules = fs.existsSync(modulesPath) ? readJson(modulesPath) : { modules: {} };
const repoSkillIds = listSkillIds(repoSkillsRoot);
const installedSkillIds = listSkillIds(localSkillsRoot);
const registryHealth = resolveSourceRegistryHealth(skillRegistry, repoSkillIds, installedSkillIds, sourceRegistry, modules);
const roleDisplay = fs.existsSync(roleDisplayPath)
  ? readJson(roleDisplayPath)
  : { visibleRoleIds: listForgeFiles(repoForgeRolesRoot), roles: {} };

const forgeSkillOptions = skillRegistry.skills.map((skill) => ({
  id: skill.id,
  title: skill.title,
  summary: skill.summary,
  clients: skill.clients,
  layer: skill.layer,
  primaryFor: skill.primaryFor,
  recommendedByRole: skill.recommendedByRole,
  recommendedByStack: skill.recommendedByStack,
  overlapGroup: skill.overlapGroup,
  clusterRole: skill.clusterRole,
  supportWhen: skill.supportWhen,
}));

const deviceContext = {
  updatedAt: new Date().toISOString(),
  sources: {
    repoRoot,
    forgeCoreRoot: repoForgeCoreRoot,
    repoSkillsRoot,
    localSkillsRoot,
    codexConfigPath,
  },
  forge: {
    skillRegistryGeneratedAt: skillRegistry.generatedAt,
    totalSkills: skillRegistry.totalSkills,
    roleIds: listForgeFiles(repoForgeRolesRoot),
    stackIds: listForgeFiles(repoForgeStacksRoot),
    builtinMcpServerIds: Object.keys(mcpServers.servers ?? {}).sort((left, right) => left.localeCompare(right, 'en')),
    repoSkillIds,
  },
  device: {
    configuredCodexMcpServerIds: parseConfiguredMcpServers(codexConfigPath),
    localSkillIds: installedSkillIds,
  },
  health: registryHealth,
};

writeGeneratedTs(path.join(srcDir, 'generated-catalog.ts'), 'forgeSkillOptions', forgeSkillOptions);
writeGeneratedTs(path.join(srcDir, 'generated-role-mcp.ts'), 'forgeRoleMcpMatrix', roleMcpMatrix);
writeGeneratedTs(path.join(srcDir, 'generated-domain-mcp.ts'), 'forgeDomainMcpMatrix', domainMcpMatrix);
writeGeneratedTs(path.join(srcDir, 'generated-role-display.ts'), 'forgeRoleDisplay', roleDisplay);
writeGeneratedTs(path.join(srcDir, 'generated-device-context.ts'), 'forgeDeviceContext', deviceContext);

console.log(
  JSON.stringify(
    {
      synced: true,
      skills: forgeSkillOptions.length,
      roles: deviceContext.forge.roleIds.length,
      stacks: deviceContext.forge.stackIds.length,
      builtinMcp: deviceContext.forge.builtinMcpServerIds.length,
      configuredCodexMcp: deviceContext.device.configuredCodexMcpServerIds.length,
      localSkills: deviceContext.device.localSkillIds.length,
    },
    null,
    2
  )
);
