import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const projectRoot = path.resolve(import.meta.dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const codexRoot = path.join(os.homedir(), '.codex');
const forgeCoreRoot = path.join(codexRoot, 'forge', 'core');
const forgeRolesRoot = path.join(codexRoot, 'forge', 'roles');
const forgeStacksRoot = path.join(codexRoot, 'forge', 'stacks');
const localSkillsRoot = path.join(codexRoot, 'skills');
const codexConfigPath = path.join(codexRoot, 'config.toml');

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

function listLocalSkills(rootDir) {
  if (!fs.existsSync(rootDir)) return [];
  return fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(rootDir, name, 'SKILL.md')))
    .sort((left, right) => left.localeCompare(right, 'en'));
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

const skillRegistry = readJson(path.join(forgeCoreRoot, 'skill-registry.json'));
const roleMcpMatrix = readJson(path.join(forgeCoreRoot, 'role-mcp-matrix.json'));
const domainMcpMatrix = readJson(path.join(forgeCoreRoot, 'domain-mcp-matrix.json'));
const mcpServers = readJson(path.join(forgeCoreRoot, 'mcp-servers.json'));
const roleDisplayPath = path.join(forgeCoreRoot, 'role-display.json');
const roleDisplay = fs.existsSync(roleDisplayPath)
  ? readJson(roleDisplayPath)
  : { visibleRoleIds: listForgeFiles(forgeRolesRoot), roles: {} };

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
    forgeCoreRoot,
    localSkillsRoot,
    codexConfigPath,
  },
  forge: {
    skillRegistryGeneratedAt: skillRegistry.generatedAt,
    totalSkills: skillRegistry.totalSkills,
    roleIds: listForgeFiles(forgeRolesRoot),
    stackIds: listForgeFiles(forgeStacksRoot),
    builtinMcpServerIds: Object.keys(mcpServers.servers ?? {}).sort((left, right) => left.localeCompare(right, 'en')),
  },
  device: {
    configuredCodexMcpServerIds: parseConfiguredMcpServers(codexConfigPath),
    localSkillIds: listLocalSkills(localSkillsRoot),
  },
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
