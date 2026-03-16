const { spawnSync } = require('child_process');
const { isWindows } = require('./constants');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: options.capture ? 'pipe' : 'inherit',
    cwd: options.cwd,
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8',
    windowsHide: true,
  });
  if (options.capture) {
    return result;
  }
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(`${command} ${args.join(' ')} failed with code ${result.status}`);
  }
  return result;
}

function runShell(script, env, options = {}) {
  if (isWindows) {
    return run('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script], { env, ...options });
  }
  return run('bash', [script], { env, ...options });
}

module.exports = { run, runShell };
