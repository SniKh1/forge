const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { isWindows } = require('./constants');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function commandExists(command) {
  const { spawnSync: spawn } = require('child_process');
  const isWin = process.platform === 'win32';

  // Try where.exe / which directly first
  const probe = isWin ? 'where.exe' : 'which';
  const result = spawn(probe, [command], { stdio: 'ignore', windowsHide: true });
  if (result.status === 0) return true;

  // On Windows, also check common global npm bin locations
  if (isWin) {
    const candidates = [];
    if (process.env.APPDATA) candidates.push(path.join(process.env.APPDATA, 'npm', `${command}.cmd`));
    if (process.env.APPDATA) candidates.push(path.join(process.env.APPDATA, 'npm', `${command}.ps1`));
    if (process.env.LOCALAPPDATA) candidates.push(path.join(process.env.LOCALAPPDATA, 'Programs', 'nodejs', `${command}.cmd`));
    const nodeDir = path.dirname(process.execPath || '');
    if (nodeDir && nodeDir !== '.') {
      candidates.push(path.join(nodeDir, `${command}.cmd`));
      candidates.push(path.join(nodeDir, `${command}.ps1`));
    }
    for (const c of candidates) {
      if (fs.existsSync(c)) return true;
    }
  }

  return false;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDirIncremental(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirIncremental(srcPath, destPath);
    } else if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyDirFull(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
}

function copyDir(src, dest, mode) {
  if (mode === 'full') {
    copyDirFull(src, dest);
    return;
  }
  copyDirIncremental(src, dest);
}

function sanitizeToken(token) {
  if (!token) return '(not set)';
  if (token.length <= 8) return `${token.slice(0, 2)}***`;
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

function printHeader(title) {
  console.log(`\n=== ${title} ===`);
}

function relativeToHome(target) {
  const home = require('os').homedir();
  return target.startsWith(home) ? target.replace(home, '~') : target;
}

module.exports = {
  readJson,
  commandExists,
  ensureDir,
  copyDir,
  sanitizeToken,
  printHeader,
  relativeToHome,
};
