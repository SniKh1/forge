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

if (await isServerUp()) {
  console.log(`[forge-desktop] Reusing existing dev server at http://${HOST}:${PORT}`);
  process.exit(0);
}

const child = spawn(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'dev', '--', '--host', HOST, '--strictPort'],
  {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  },
);

const relay = (signal) => forwardSignal(child, signal);
process.on('SIGINT', relay);
process.on('SIGTERM', relay);

child.on('exit', (code, signal) => {
  process.off('SIGINT', relay);
  process.off('SIGTERM', relay);

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
