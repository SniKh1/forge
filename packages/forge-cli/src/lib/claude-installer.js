const fs = require('fs');
const path = require('path');
const os = require('os');
const { repoRoot, clientHomes, isWindows } = require('./constants');
const { ensureDir, copyDir, commandExists } = require('./utils');
const { run, runShell } = require('./process');

function workspaceSlug(cwd) {
  return cwd.replace(/[:\\/]+/g, '-').replace(/-+/g, '-').replace(/^-/, '');
}

function hasOptionalComponent(options, name) {
  const selected = Array.isArray(options.components) ? options.components : [];
  return selected.includes(name);
}

function selectedSkills(options) {
  return new Set(Array.isArray(options.skillNames) ? options.skillNames : []);
}

function scaffoldMemory(homeDir, cwd) {
  const projectDir = path.join(homeDir, 'projects', workspaceSlug(cwd), 'memory');
  ensureDir(projectDir);
  const files = {
    'MEMORY.md': `# Workspace Memory\n\n- Workspace: \`${cwd}\`\n- Updated: ${new Date().toISOString().slice(0, 10)}\n\n## Active Focus\n\n- (fill in current priorities)\n`,
    'PROJECT-MEMORY.md': '# Project Memory\n\n> Workspace summary and durable knowledge.\n\n## Overview\n\n- Scope:\n- Stack:\n- Current stage:\n',
  };
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(projectDir, file);
    if (!fs.existsSync(target)) fs.writeFileSync(target, content);
  }
  ensureDir(path.join(homeDir, 'skills', 'learned'));
}

function copyAssets(mode, options) {
  const homeDir = clientHomes.claude;
  ensureDir(homeDir);
  for (const file of ['CLAUDE.md', 'CAPABILITIES.md', 'USAGE-GUIDE.md', 'AGENTS.md', 'GUIDE.md']) {
    const src = path.join(repoRoot, file);
    const dest = path.join(homeDir, file);
    if (!fs.existsSync(src)) continue;
    if (mode === 'full' || !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
    }
  }
  for (const dir of ['agents', 'commands', 'contexts', 'rules', 'stacks', 'hooks', 'scripts']) {
    const src = path.join(repoRoot, dir);
    const dest = path.join(homeDir, dir);
    if (fs.existsSync(src)) copyDir(src, dest, mode);
  }
  const skillsDest = path.join(homeDir, 'skills');
  ensureDir(skillsDest);
  if (hasOptionalComponent(options, 'skills')) {
    const skillSelection = selectedSkills(options);
    const skillsSrc = path.join(repoRoot, 'skills');
    if (fs.existsSync(skillsSrc)) {
      for (const entry of fs.readdirSync(skillsSrc, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name === 'learned') continue;
        if (skillSelection.size && !skillSelection.has(entry.name)) continue;
        const src = path.join(skillsSrc, entry.name);
        const dest = path.join(skillsDest, entry.name);
        if (mode === 'full' || !fs.existsSync(dest)) {
          fs.rmSync(dest, { recursive: true, force: true });
          fs.cpSync(src, dest, { recursive: true });
        }
      }
    }
  }
}

function configureTemplates(mode) {
  const homeDir = clientHomes.claude;
  const settingsTemplate = path.join(repoRoot, 'settings.json.template');
  if (fs.existsSync(settingsTemplate)) {
    fs.copyFileSync(settingsTemplate, path.join(homeDir, 'settings.json.template'));
    const settingsTarget = path.join(homeDir, 'settings.json');
    if (mode === 'full' || !fs.existsSync(settingsTarget)) {
      fs.copyFileSync(settingsTemplate, settingsTarget);
    }
  }

  const hooksTemplate = path.join(homeDir, 'hooks', 'hooks.json.template');
  if (fs.existsSync(hooksTemplate)) {
    const content = fs.readFileSync(hooksTemplate, 'utf8').replace(/\{\{CLAUDE_HOME\}\}/g, homeDir.replace(/\\/g, '\\\\'));
    fs.writeFileSync(path.join(homeDir, 'hooks', 'hooks.json'), content);
  }

  for (const dir of [
    path.join(homeDir, 'homunculus', 'instincts', 'personal'),
    path.join(homeDir, 'homunculus', 'instincts', 'inherited'),
    path.join(homeDir, 'sessions'),
  ]) {
    ensureDir(dir);
  }
}

function maybeBackup(skipBackup) {
  const homeDir = clientHomes.claude;
  if (skipBackup || !fs.existsSync(homeDir)) return null;
  const backupDir = path.join(os.homedir(), `.claude-backup-${new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)}`);
  fs.cpSync(homeDir, backupDir, { recursive: true });
  return backupDir;
}

function installClaude(options) {
  const backupDir = maybeBackup(options.skipBackup);
  copyAssets(options.installMode, options);
  configureTemplates(options.installMode);
  if (hasOptionalComponent(options, 'memory')) {
    scaffoldMemory(clientHomes.claude, options.cwd);
  } else {
    ensureDir(path.join(clientHomes.claude, 'skills', 'learned'));
  }

  const python = commandExists('python3') ? 'python3' : (commandExists('python') ? 'python' : null);
  if (python && hasOptionalComponent(options, 'mcp')) {
    const args = [path.join(repoRoot, 'scripts', 'configure-claude-mcp.py'), '--install-uv'];
    if (options.syncMcpCli) args.push('--sync-cli');
    if (options.exaApiKey) {
      args.push('--exa-key', options.exaApiKey);
    }
    if (Array.isArray(options.mcpServers) && options.mcpServers.length) {
      args.push('--servers', options.mcpServers.join(','));
    }
    run(python, args, {
      env: {
        FORGE_EXA_KEY: options.exaApiKey || '',
      },
    });
  }

  const verifyScript = isWindows ? path.join(repoRoot, 'scripts', 'verify.ps1') : path.join(repoRoot, 'scripts', 'verify.sh');
  runShell(verifyScript, {}, { allowFailure: false });
  return { client: 'claude', home: clientHomes.claude, backupDir };
}

module.exports = { installClaude };
