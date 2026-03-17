import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const candidatePaths = [
  path.resolve(process.cwd(), '../../node_modules/typescript/lib/tsc.js'),
  path.resolve(process.cwd(), '../../node_modules/typescript/lib/_tsc.js'),
  path.resolve(process.cwd(), 'node_modules/typescript/lib/tsc.js'),
  path.resolve(process.cwd(), 'node_modules/typescript/lib/_tsc.js'),
];

const tscEntrypoint = candidatePaths.find((candidate) => fs.existsSync(candidate));

if (!tscEntrypoint) {
  console.error('[forge-desktop] Unable to locate a TypeScript compiler entrypoint.');
  process.exit(1);
}

const child = spawn(process.execPath, [tscEntrypoint, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: process.env,
});

child.on('error', (error) => {
  console.error('[forge-desktop] Failed to start the TypeScript compiler.');
  console.error(error);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
