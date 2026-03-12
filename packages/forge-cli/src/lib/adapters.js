const path = require('path');
const { repoRoot, isWindows, verifyScripts, clientHomes } = require('./constants');
const { detectClient } = require('./detection');
const { installClaude } = require('./claude-installer');
const { runShell } = require('./process');

function backendScript(client) {
  const base = client === 'codex' ? path.join(repoRoot, 'codex', 'scripts', 'backends') : path.join(repoRoot, 'gemini', 'scripts', 'backends');
  return path.join(base, isWindows ? `install-${client}.ps1` : `install-${client}.sh`);
}

function buildEnv(options, client) {
  return {
    FORGE_NONINTERACTIVE: '1',
    FORGE_SKIP_BACKUP: options.skipBackup ? '1' : '0',
    FORGE_INSTALL_MODE: options.installMode,
    FORGE_LANG: options.lang,
    FORGE_CODEX_EXA_KEY: client === 'codex' ? (options.exaApiKey || '') : process.env.FORGE_CODEX_EXA_KEY || '',
    FORGE_GEMINI_EXA_KEY: client === 'gemini' ? (options.exaApiKey || '') : process.env.FORGE_GEMINI_EXA_KEY || '',
    FORGE_CONFIGURE_CODEX_MCP: '1',
  };
}

const adapters = {
  claude: {
    detect: () => detectClient('claude'),
    install: (options) => installClaude(options),
    verify: (options = {}) => runShell(verifyScripts.claude, {}, { allowFailure: true, capture: Boolean(options.capture) }),
    repair: (options) => installClaude({ ...options, installMode: 'incremental', skipBackup: true }),
  },
  codex: {
    detect: () => detectClient('codex'),
    install: (options) => runShell(backendScript('codex'), buildEnv(options, 'codex')),
    verify: (options = {}) => runShell(verifyScripts.codex, {}, { allowFailure: true, capture: Boolean(options.capture) }),
    repair: (options) => runShell(backendScript('codex'), buildEnv({ ...options, installMode: 'incremental', skipBackup: true, nonInteractive: true }, 'codex')),
  },
  gemini: {
    detect: () => detectClient('gemini'),
    install: (options) => runShell(backendScript('gemini'), buildEnv(options, 'gemini')),
    verify: (options = {}) => runShell(verifyScripts.gemini, {}, { allowFailure: true, capture: Boolean(options.capture) }),
    repair: (options) => runShell(backendScript('gemini'), buildEnv({ ...options, installMode: 'incremental', skipBackup: true, nonInteractive: true }, 'gemini')),
  },
};

module.exports = { adapters, clientHomes };
