import { spawn } from 'node:child_process';
import http from 'node:http';
import process from 'node:process';

const HOST = '127.0.0.1';
const PORT = 5173;

function isServerUp() {
  return new Promise((resolve) => {
    const request = http.get(
      {
        host: HOST,
        port: PORT,
        path: '/',
        timeout: 800,
      },
      (response) => {
        response.resume();
        resolve(true);
      },
    );

    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });

    request.on('error', () => resolve(false));
  });
}

function forwardSignal(child, signal) {
  if (!child.killed) {
    child.kill(signal);
  }
}

function buildSpawnOptions() {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key, value]) => (
      Boolean(key)
      && !key.startsWith('=')
      && !key.includes('\u0000')
      && typeof value === 'string'
      && !value.includes('\u0000')
    )),
  );

  return {
    cwd: process.cwd(),
    stdio: 'inherit',
    env,
    windowsHide: false,
  };
}

function startDevServer() {
  const options = buildSpawnOptions();

  if (process.platform === 'win32') {
    const shell = process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe';
    return spawn(
      shell,
      ['/d', '/s', '/c', `npm run dev -- --host ${HOST} --strictPort`],
      options,
    );
  }

  return spawn(
    'npm',
    ['run', 'dev', '--', '--host', HOST, '--strictPort'],
    options,
  );
}

if (await isServerUp()) {
  console.log(`[forge-desktop] Reusing existing dev server at http://${HOST}:${PORT}`);
  process.exit(0);
}

const child = startDevServer();

const relay = (signal) => forwardSignal(child, signal);
process.on('SIGINT', relay);
process.on('SIGTERM', relay);

child.on('error', (error) => {
  process.off('SIGINT', relay);
  process.off('SIGTERM', relay);
  console.error('[forge-desktop] Failed to start dev server.');
  console.error(error);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  process.off('SIGINT', relay);
  process.off('SIGTERM', relay);

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
