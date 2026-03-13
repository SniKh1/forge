#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const skillsRoot = path.join(root, 'skills');
const overridesPath = path.join(root, 'core', 'skill-overrides.json');
const registryPath = path.join(root, 'core', 'skill-registry.json');
const catalogPath = path.join(root, 'apps', 'forge-desktop', 'src', 'generated-catalog.ts');
const roleMcpMatrixPath = path.join(root, 'core', 'role-mcp-matrix.json');
const roleMcpCatalogPath = path.join(root, 'apps', 'forge-desktop', 'src', 'generated-role-mcp.ts');
const domainMcpMatrixPath = path.join(root, 'core', 'domain-mcp-matrix.json');
const domainMcpCatalogPath = path.join(root, 'apps', 'forge-desktop', 'src', 'generated-domain-mcp.ts');

const overrides = fs.existsSync(overridesPath)
  ? JSON.parse(fs.readFileSync(overridesPath, 'utf8'))
  : {};

const roleMcpMatrix = fs.existsSync(roleMcpMatrixPath)
  ? JSON.parse(fs.readFileSync(roleMcpMatrixPath, 'utf8'))
  : { version: '1.0', updated: new Date().toISOString().slice(0, 10), roles: {} };

const domainMcpMatrix = fs.existsSync(domainMcpMatrixPath)
  ? JSON.parse(fs.readFileSync(domainMcpMatrixPath, 'utf8'))
  : { version: '1.0', updated: new Date().toISOString().slice(0, 10), stacks: {} };

function walk(dir, rel = '') {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    const relPath = path.join(rel, entry.name);
    if (entry.isDirectory()) {
      if (fs.existsSync(path.join(full, 'SKILL.md'))) {
        results.push(relPath);
      }
      results.push(...walk(full, relPath));
    }
  }
  return results;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};
  const body = match[1];
  const data = {};
  for (const line of body.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    data[key] = value;
  }
  return data;
}

function extractSummary(content, fm) {
  if (fm.description && fm.description !== 'Forge installable skill.') return fm.description;
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const afterTitle = lines.find((line) => !line.startsWith('#') && !line.startsWith('---'));
  return afterTitle || 'Forge installable skill.';
}

const discovered = walk(skillsRoot);
const chosenById = new Map();
for (const relPath of discovered) {
  const id = path.basename(relPath);
  const existing = chosenById.get(id);
  if (!existing || relPath.split(path.sep).length < existing.split(path.sep).length) {
    chosenById.set(id, relPath);
  }
}

const skills = [...chosenById.entries()].map(([id, relPath]) => {
  const skillFile = path.join(skillsRoot, relPath, 'SKILL.md');
  const content = fs.readFileSync(skillFile, 'utf8');
  const fm = parseFrontmatter(content);
  const summary = extractSummary(content, fm);
  const o = overrides[id] || {};
  const explicitPrimaryFor = Array.isArray(o.primaryFor) ? o.primaryFor : [];
  const explicitRecommendedByRole = Array.isArray(o.recommendedByRole) ? o.recommendedByRole : null;
  const inferredRecommendedByRole = explicitRecommendedByRole
    ? explicitRecommendedByRole
    : ['core', 'extended'].includes(o.layer || '') ? explicitPrimaryFor : [];
  return {
    id,
    title: fm.name || id,
    summary,
    layer: o.layer || 'specialized',
    primaryFor: explicitPrimaryFor,
    secondaryFor: o.secondaryFor || [],
    recommendedByRole: [...new Set(inferredRecommendedByRole)],
    recommendedByStack: o.recommendedByStack || [],
    overlapGroup: o.overlapGroup || null,
    clusterRole: o.clusterRole || null,
    supportWhen: o.supportWhen || [],
    preferred: !!o.preferred,
    clients: ['claude', 'codex', 'gemini'],
    sourcePath: path.join('skills', relPath, 'SKILL.md').replace(/\\/g, '/'),
    relativeSkillDir: path.join('skills', relPath).replace(/\\/g, '/')
  };
}).sort((a, b) => a.id.localeCompare(b.id));

const registry = {
  generatedAt: new Date().toISOString(),
  totalSkills: skills.length,
  layers: {
    core: skills.filter((s) => s.layer === 'core').length,
    extended: skills.filter((s) => s.layer === 'extended').length,
    specialized: skills.filter((s) => s.layer === 'specialized').length,
    experimental: skills.filter((s) => s.layer === 'experimental').length
  },
  skills
};

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');

const tsItems = JSON.stringify(skills.map((skill) => ({
  id: skill.id,
  title: skill.title,
  summary: skill.summary.slice(0, 240),
  clients: skill.clients,
  layer: skill.layer,
  primaryFor: skill.primaryFor,
  recommendedByRole: skill.recommendedByRole,
  recommendedByStack: skill.recommendedByStack,
  overlapGroup: skill.overlapGroup,
  clusterRole: skill.clusterRole,
  supportWhen: skill.supportWhen
})), null, 2);

fs.writeFileSync(
  catalogPath,
  `export const forgeSkillOptions = ${tsItems} as const;\n`
);

const roleTsItems = JSON.stringify(roleMcpMatrix, null, 2);
fs.writeFileSync(
  roleMcpCatalogPath,
  `export const forgeRoleMcpMatrix = ${roleTsItems} as const;\n`
);

const domainTsItems = JSON.stringify(domainMcpMatrix, null, 2);
fs.writeFileSync(
  domainMcpCatalogPath,
  `export const forgeDomainMcpMatrix = ${domainTsItems} as const;\n`
);

console.log(`Generated ${skills.length} skill entries, role MCP matrix, and domain MCP matrix`);
