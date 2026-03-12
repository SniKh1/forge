const path = require('path');
const os = require('os');

const repoRoot = path.resolve(__dirname, '../../../../');
const home = os.homedir();
const isWindows = process.platform === 'win32';

const clientHomes = {
  claude: path.join(home, '.claude'),
  codex: path.join(home, '.codex'),
  gemini: path.join(home, '.gemini'),
};

const verifyScripts = {
  claude: isWindows ? path.join(repoRoot, 'scripts', 'verify.ps1') : path.join(repoRoot, 'scripts', 'verify.sh'),
  codex: isWindows ? path.join(repoRoot, 'codex', 'scripts', 'verify-codex.ps1') : path.join(repoRoot, 'codex', 'scripts', 'verify-codex.sh'),
  gemini: isWindows ? path.join(repoRoot, 'gemini', 'scripts', 'verify-gemini.ps1') : path.join(repoRoot, 'gemini', 'scripts', 'verify-gemini.sh'),
};

module.exports = {
  repoRoot,
  home,
  isWindows,
  clientHomes,
  verifyScripts,
};
