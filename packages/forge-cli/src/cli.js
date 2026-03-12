const { createInterface, ask, askYesNo } = require('./lib/prompt');
const { detectAll } = require('./lib/detection');
const { renderCapabilityTable } = require('./lib/capabilities');
const { sanitizeToken, printHeader, commandExists } = require('./lib/utils');
const { installClients, printInstallSummary } = require('./commands/install');
const { verifyClients } = require('./commands/verify');
const { doctor } = require('./commands/doctor');
const { adapters } = require('./lib/adapters');

function parseArgs(argv) {
  const [command = 'setup', ...rest] = argv;
  const options = {
    clients: [],
    exaApiKey: process.env.FORGE_EXA_KEY || process.env.FORGE_CODEX_EXA_KEY || process.env.FORGE_GEMINI_EXA_KEY || '',
    installMode: process.env.FORGE_INSTALL_MODE || 'incremental',
    lang: process.env.FORGE_LANG || 'zh',
    syncMcpCli: true,
    includeOptionalMcp: true,
    nonInteractive: process.env.FORGE_NONINTERACTIVE === '1',
    skipBackup: process.env.FORGE_SKIP_BACKUP === '1',
    cwd: process.cwd(),
    json: false,
  };

  const positional = [];
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token === '--client' || token === '--clients') {
      options.clients = rest[++i].split(',').map((item) => item.trim()).filter(Boolean);
    } else if (token === '--exa-api-key' || token === '--exa-key') {
      options.exaApiKey = rest[++i] || '';
    } else if (token === '--install-mode') {
      options.installMode = rest[++i] || 'incremental';
    } else if (token === '--lang') {
      options.lang = rest[++i] || 'zh';
    } else if (token === '--non-interactive') {
      options.nonInteractive = true;
    } else if (token === '--skip-backup') {
      options.skipBackup = true;
    } else if (token === '--no-sync-mcp-cli') {
      options.syncMcpCli = false;
    } else if (token === '--no-optional-mcp') {
      options.includeOptionalMcp = false;
    } else if (token === '--json') {
      options.json = true;
    } else {
      positional.push(token);
    }
  }

  return { command, positional, options };
}

function resolveClients(options, fallbackDetected = true) {
  if (options.clients.length) return options.clients;
  const detected = detectAll().filter((item) => item.detected).map((item) => item.name);
  return detected.length || !fallbackDetected ? detected : ['claude', 'codex', 'gemini'];
}

async function runSetup(options) {
  printHeader('Forge setup');
  const detected = detectAll();
  console.log('Detected clients');
  for (const item of detected) {
    console.log(`- ${item.name}: ${item.detected ? 'detected' : 'not detected'}${item.configured ? ', configured' : ''}`);
  }
  console.log('\nCapability overview');
  console.log(renderCapabilityTable(['claude', 'codex', 'gemini']));

  if (!options.nonInteractive) {
    const rl = createInterface();
    const suggested = detected.filter((item) => item.detected).map((item) => item.name).join(',') || 'claude,codex,gemini';
    const clientAnswer = await ask(rl, `\nInstall clients [${suggested}]: `);
    options.clients = (clientAnswer || suggested).split(',').map((item) => item.trim()).filter(Boolean);
    const modeAnswer = await ask(rl, `Install mode [${options.installMode}]: `);
    if (modeAnswer) options.installMode = modeAnswer;
    const wantsBackup = await askYesNo(rl, 'Create backup before install?', !options.skipBackup);
    options.skipBackup = !wantsBackup;
    console.log(`EXA_API_KEY will be written into selected client configs. Current value: ${sanitizeToken(options.exaApiKey)}`);
    const tokenAnswer = await ask(rl, 'Enter EXA_API_KEY (press Enter to keep/skip): ');
    if (tokenAnswer) options.exaApiKey = tokenAnswer;
    rl.close();
  } else if (!options.clients.length) {
    options.clients = resolveClients(options);
  }

  if (!options.clients.length) {
    console.log('No client selected. Install Claude, Codex, or Gemini first, or rerun with --client.');
    return;
  }

  const results = await installClients(options.clients, options);
  const verifySummary = verifyClients(options.clients);
  printInstallSummary(results);
  console.log('\nVerify summary');
  for (const item of verifySummary) {
    console.log(`- ${item.client}: ${item.ok ? 'ok' : 'failed'}`);
  }
}

async function runInstall(positional, options) {
  const client = positional[0];
  if (!client || !adapters[client]) {
    throw new Error('Usage: forge install claude|codex|gemini');
  }
  options.clients = [client];
  const results = await installClients([client], options);
  printInstallSummary(results);
}

function runVerify(positional, options) {
  const clients = options.clients.length ? options.clients : (positional[0] ? [positional[0]] : resolveClients(options));
  const summary = verifyClients(clients, options);
  if (options.json) {
    console.log(JSON.stringify({ clients: summary }, null, 2));
  }
  const failed = summary.filter((item) => !item.ok);
  if (failed.length) process.exitCode = 1;
}

function runDoctor(positional, options) {
  const clients = options.clients.length ? options.clients : (positional[0] ? [positional[0]] : ['claude', 'codex', 'gemini']);
  const report = doctor(clients, options);
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  }
  if (report.support.some((item) => !item.ok)) process.exitCode = 1;
}

async function runRepair(positional, options) {
  const clients = options.clients.length ? options.clients : (positional[0] ? [positional[0]] : ['claude', 'codex', 'gemini']);
  for (const client of clients) {
    console.log(`\n[repair] ${client}`);
    adapters[client].repair({ ...options, nonInteractive: true, skipBackup: true });
  }
  runVerify([], { ...options, clients });
}

async function main() {
  const { command, positional, options } = parseArgs(process.argv.slice(2));
  if (!commandExists('node')) {
    throw new Error('Node.js is required.');
  }
  if (command === 'setup') {
    await runSetup(options);
    return;
  }
  if (command === 'install') {
    await runInstall(positional, options);
    return;
  }
  if (command === 'verify') {
    runVerify(positional, options);
    return;
  }
  if (command === 'doctor') {
    runDoctor(positional, options);
    return;
  }
  if (command === 'repair') {
    await runRepair(positional, options);
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
