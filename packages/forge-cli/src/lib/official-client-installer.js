const { isWindows } = require('./constants');
const { detectClient } = require('./detection');
const { run } = require('./process');
const { commandExists } = require('./utils');

const officialClientPackages = {
  claude: {
    packageName: '@anthropic-ai/claude-code',
    command: 'claude',
  },
  codex: {
    packageName: '@openai/codex',
    command: 'codex',
  },
  gemini: {
    packageName: '@google/gemini-cli',
    command: 'gemini',
  },
};

function npmExecutable() {
  return isWindows ? 'npm.cmd' : 'npm';
}

function ensureOfficialClientInstalled(client) {
  const meta = officialClientPackages[client];
  if (!meta) {
    return {
      ok: false,
      changed: false,
      detected: false,
      status: 1,
      stdout: '',
      stderr: `Unsupported client: ${client}`,
      packageName: '',
      command: client,
    };
  }

  const before = detectClient(client);
  if (before.detected) {
    return {
      ok: true,
      changed: false,
      detected: true,
      status: 0,
      stdout: `${client} is already installed.`,
      stderr: '',
      ...meta,
    };
  }

  if (!commandExists('npm')) {
    return {
      ok: false,
      changed: false,
      detected: false,
      status: 1,
      stdout: '',
      stderr: 'npm is not available. Install Node.js with npm first.',
      ...meta,
    };
  }

  const result = run(npmExecutable(), ['install', '-g', meta.packageName], {
    capture: true,
    allowFailure: true,
  });
  const after = detectClient(client);
  return {
    ok: result.status === 0 && after.detected,
    changed: true,
    detected: after.detected,
    status: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    ...meta,
  };
}

module.exports = {
  officialClientPackages,
  ensureOfficialClientInstalled,
};
