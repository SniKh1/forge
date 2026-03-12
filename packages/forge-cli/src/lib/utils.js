const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { isWindows } = require('./constants');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function commandExists(command) {
  const probe = isWindows ? 'where' : 'command';
  const args = isWindows ? [command] : ['-v', command];
  const shell = isWindows ? 'cmd.exe' : process.env.SHELL || 'bash';
  const shellArgs = isWindows ? ['/c', `${probe} ${command}`] : ['-lc', `${probe} ${args.join(' ')}`];
  const result = spawnSync(shell, shellArgs, { stdio: 'ignore' });
  return result.status === 0;
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
