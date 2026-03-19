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

function syncRuntimeSkills(syncScript, mode, repoRootPath, skillsDest, skillSelection) {
  const args = [syncScript, repoRootPath, skillsDest, '--mode', mode];
  if (skillSelection.length) {
    args.push('--selected', skillSelection.join(','));
  }

  const result = run(process.execPath, args, { capture: true });
  if (result.status !== 0) {
    throw new Error(`${process.execPath} ${args.join(' ')} failed with code ${result.status}`);
  }

  try {
    const payload = JSON.parse(result.stdout || '{}');
    return Number(payload.installed || 0);
  } catch {
    return 0;
  }
}

function ensureSettingsDefaults(settingsTarget, templatePath) {
  if (!fs.existsSync(templatePath)) return;
  const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  if (!fs.existsSync(settingsTarget)) {
    fs.copyFileSync(templatePath, settingsTarget);
    return;
  }

  let current;
  try {
    current = JSON.parse(fs.readFileSync(settingsTarget, 'utf8'));
  } catch {
    current = {};
  }

  const next = { ...current };
  if (!next.permissions || typeof next.permissions !== 'object') {
    next.permissions = template.permissions;
  } else {
    const currentAllow = Array.isArray(next.permissions.allow) ? next.permissions.allow : [];
    const currentDeny = Array.isArray(next.permissions.deny) ? next.permissions.deny : [];
    next.permissions = {
      ...next.permissions,
      allow: currentAllow.length > 0 ? currentAllow : (template.permissions?.allow || []),
      deny: currentDeny.length > 0 ? currentDeny : (template.permissions?.deny || []),
    };
  }

  if (!next.env || typeof next.env !== 'object') {
    next.env = template.env || {};
  }

  fs.writeFileSync(settingsTarget, `${JSON.stringify(next, null, 2)}\n`);
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
    const syncScript = path.join(repoRoot, 'scripts', 'sync-runtime-skills.cjs');
    const skillSelection = [...selectedSkills(options)];
    if (fs.existsSync(syncScript)) {
      syncRuntimeSkills(syncScript, mode, repoRoot, skillsDest, skillSelection);
    } else {
      const skillsSrc = path.join(repoRoot, 'skills');
      if (fs.existsSync(skillsSrc)) {
        for (const entry of fs.readdirSync(skillsSrc, { withFileTypes: true })) {
          if (!entry.isDirectory() || entry.name === 'learned' || entry.name.startsWith('.')) continue;
          if (skillSelection.length && !skillSelection.includes(entry.name)) continue;
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
}

function configureTemplates(mode) {
  const homeDir = clientHomes.claude;
  const settingsTemplate = path.join(repoRoot, 'settings.json.template');
  if (fs.existsSync(settingsTemplate)) {
    fs.copyFileSync(settingsTemplate, path.join(homeDir, 'settings.json.template'));
    const settingsTarget = path.join(homeDir, 'settings.json');
    if (mode === 'full') {
      fs.copyFileSync(settingsTemplate, settingsTarget);
    } else {
      ensureSettingsDefaults(settingsTarget, settingsTemplate);
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
        FORGE_SECRET_VALUES_BASE64: options.secretValuesBase64 || '',
      },
    });
  }

  const verifyScript = isWindows ? path.join(repoRoot, 'scripts', 'verify.ps1') : path.join(repoRoot, 'scripts', 'verify.sh');
  runShell(verifyScript, {}, { allowFailure: false });
  return { client: 'claude', home: clientHomes.claude, backupDir };
}

module.exports = { installClaude };
