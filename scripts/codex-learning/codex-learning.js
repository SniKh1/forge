#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

function getCodexHome() {
  return process.env.FORGE_AGENT_HOME || process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
}

function sanitizeName(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled';
}

function toWorkspaceSlug(inputPath) {
  const abs = path.resolve(inputPath || process.cwd());
  return abs.replace(/[:\\/]+/g, '-').replace(/-+/g, '-').replace(/^-/, '');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeFileIfMissing(file, content) {
  if (!fs.existsSync(file)) {
    ensureDir(path.dirname(file));
    fs.writeFileSync(file, content, 'utf8');
  }
}

function nowDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getLearningPaths(cwd) {
  const codexHome = getCodexHome();
  const workspaceSlug = toWorkspaceSlug(cwd);
  const projectRoot = path.join(codexHome, 'projects', workspaceSlug);
  return {
    codexHome,
    workspaceSlug,
    projectRoot,
    memoryDir: path.join(projectRoot, 'memory'),
    memoryFile: path.join(projectRoot, 'memory', 'MEMORY.md'),
    projectMemoryFile: path.join(projectRoot, 'memory', 'PROJECT-MEMORY.md'),
    learnedDir: path.join(codexHome, 'skills', 'learned'),
    instinctsPersonalDir: path.join(codexHome, 'homunculus', 'instincts', 'personal'),
    instinctsInheritedDir: path.join(codexHome, 'homunculus', 'instincts', 'inherited'),
    evolvedDir: path.join(codexHome, 'homunculus', 'evolved')
  };
}

function ensureStructure(cwd) {
  const p = getLearningPaths(cwd);

  ensureDir(p.memoryDir);
  ensureDir(p.learnedDir);
  ensureDir(p.instinctsPersonalDir);
  ensureDir(p.instinctsInheritedDir);
  ensureDir(p.evolvedDir);

  writeFileIfMissing(
    p.memoryFile,
    `# Workspace Memory\n\n- Workspace: \`${path.resolve(cwd || process.cwd())}\`\n- Updated: ${nowDate()}\n\n## Active Focus\n\n- (fill in current priorities)\n\n## Decisions\n\n- (record key decisions and rationale)\n\n## Risks\n\n- (track unresolved risks)\n`
  );

  writeFileIfMissing(
    p.projectMemoryFile,
    `# Project Memory\n\n> Workspace summary and durable knowledge.\n\n## Overview\n\n- Scope:\n- Stack:\n- Current stage:\n\n## Architecture Notes\n\n-\n\n## Conventions\n\n-\n\n## Known Issues\n\n-\n`
  );

  return p;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const cur = argv[i];
    if (cur.startsWith('--')) {
      const key = cur.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i += 1;
      }
    }
  }
  return args;
}

function cmdLearn(args) {
  const cwd = args.cwd || process.cwd();
  const p = ensureStructure(cwd);

  const title = args.title || `pattern-${nowDate()}`;
  const problem = args.problem || 'Describe the recurring problem.';
  const solution = args.solution || 'Describe the reusable solution pattern.';
  const whenToUse = args.when || 'Use when this scenario appears again.';
  const tags = args.tags || 'general';

  const fileName = `${sanitizeName(title)}.md`;
  const outFile = path.join(p.learnedDir, fileName);

  const content = `# ${title}\n\n## Problem\n\n${problem}\n\n## Solution Pattern\n\n${solution}\n\n## When to Use\n\n${whenToUse}\n\n## Tags\n\n${tags}\n\n## Source\n\n- Workspace: \`${path.resolve(cwd)}\`\n- Date: ${nowDate()}\n`;

  fs.writeFileSync(outFile, content, 'utf8');

  console.log(JSON.stringify({
    ok: true,
    action: 'learn',
    file: outFile,
    workspace_slug: p.workspaceSlug
  }, null, 2));
}

function loadInstincts(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => readJson(path.join(dir, f)))
    .filter(Boolean)
    .map(x => ({ ...x, _file: path.join(dir, `${x.id || 'unknown'}.json`) }));
}

function cmdStatus(args) {
  const cwd = args.cwd || process.cwd();
  const p = ensureStructure(cwd);
  const all = [...loadInstincts(p.instinctsPersonalDir), ...loadInstincts(p.instinctsInheritedDir)];

  all.sort((a, b) => (parseFloat(b.confidence || 0) - parseFloat(a.confidence || 0)));

  console.log(`Total instincts: ${all.length}`);
  for (const item of all.slice(0, 50)) {
    const id = item.id || 'unknown-id';
    const conf = item.confidence || 'n/a';
    const domain = item.domain || 'general';
    console.log(`- ${id} | confidence=${conf} | domain=${domain}`);
  }
}

function buildEvolutionGroups(instincts) {
  const grouped = new Map();
  for (const inst of instincts) {
    const key = (inst.domain || 'general').toLowerCase();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(inst);
  }
  return grouped;
}

function cmdEvolve(args) {
  const cwd = args.cwd || process.cwd();
  const p = ensureStructure(cwd);
  const threshold = Number(args.threshold || 3);
  const apply = !!args.apply;

  const all = [...loadInstincts(p.instinctsPersonalDir), ...loadInstincts(p.instinctsInheritedDir)];
  const groups = buildEvolutionGroups(all);

  const report = [];
  report.push(`# Evolve Report (${nowDate()})`);
  report.push('');
  report.push(`- Total instincts: ${all.length}`);
  report.push(`- Threshold: ${threshold}`);
  report.push(`- Apply: ${apply}`);
  report.push('');

  for (const [domain, list] of groups.entries()) {
    report.push(`## ${domain}`);
    report.push(`- count: ${list.length}`);

    if (list.length >= threshold) {
      const skillTitle = `evolved-${domain}-pattern`;
      const skillFile = path.join(p.learnedDir, `${skillTitle}.md`);
      report.push(`- candidate: ${skillTitle}`);

      if (apply) {
        const content = [
          `# ${skillTitle}`,
          '',
          '## Origin',
          '',
          `Derived from ${list.length} instincts in domain: ${domain}.`,
          '',
          '## Trigger',
          '',
          `Use when tasks match domain: ${domain}.`,
          '',
          '## Guidance',
          '',
          ...list.slice(0, 12).map(it => `- ${it.action || it.trigger || it.id || 'instinct'}`),
          ''
        ].join('\n');
        fs.writeFileSync(skillFile, content, 'utf8');
        report.push(`- written: ${skillFile}`);
      }
    }

    report.push('');
  }

  const outFile = path.join(p.evolvedDir, `evolve-report-${Date.now()}.md`);
  fs.writeFileSync(outFile, report.join('\n'), 'utf8');
  console.log(JSON.stringify({ ok: true, action: 'evolve', report: outFile, apply, threshold }, null, 2));
}

function cmdEnsure(args) {
  const p = ensureStructure(args.cwd || process.cwd());
  console.log(JSON.stringify({
    ok: true,
    action: 'ensure',
    paths: p
  }, null, 2));
}

function usage() {
  console.log('Usage: node codex-learning.js <ensure|learn|status|evolve> [--key value]');
}

function main() {
  const [sub, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  if (!sub || sub === '--help' || sub === '-h') {
    usage();
    process.exit(0);
  }

  if (sub === 'ensure') return cmdEnsure(args);
  if (sub === 'learn') return cmdLearn(args);
  if (sub === 'status') return cmdStatus(args);
  if (sub === 'evolve') return cmdEvolve(args);

  usage();
  process.exit(1);
}

main();
