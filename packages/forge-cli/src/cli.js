const { createInterface, ask, askYesNo } = require('./lib/prompt');
const { detectAll } = require('./lib/detection');
const { renderCapabilityTable } = require('./lib/capabilities');
const { sanitizeToken, printHeader, commandExists } = require('./lib/utils');
const { installClients, printInstallSummary } = require('./commands/install');
const { verifyClients } = require('./commands/verify');
const { doctor } = require('./commands/doctor');
const { adapters } = require('./lib/adapters');
const { ensureOfficialClientInstalled } = require('./lib/official-client-installer');
const {
  loadRegistrySources,
  searchExternalSkills,
  installExternalSkill,
  searchExternalMcp,
} = require('./lib/external-registry');
const { run } = require('./lib/process');
const path = require('path');

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
    detectedOnly: false,
    components: [],
    mcpServers: [],
    skillNames: [],
    kind: '',
    query: '',
    source: '',
    skill: '',
    specBase64: '',
    name: '',
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
    } else if (token === '--detected-only') {
      options.detectedOnly = true;
    } else if (token === '--components') {
      options.components = (rest[++i] || '').split(',').map((item) => item.trim()).filter(Boolean);
    } else if (token === '--mcp-servers') {
      options.mcpServers = (rest[++i] || '').split(',').map((item) => item.trim()).filter(Boolean);
    } else if (token === '--skills-list' || token === '--skills') {
      options.skillNames = (rest[++i] || '').split(',').map((item) => item.trim()).filter(Boolean);
    } else if (token === '--kind') {
      options.kind = rest[++i] || '';
    } else if (token === '--query') {
      options.query = rest[++i] || '';
    } else if (token === '--source') {
      options.source = rest[++i] || '';
    } else if (token === '--skill') {
      options.skill = rest[++i] || '';
    } else if (token === '--spec-base64') {
      options.specBase64 = rest[++i] || '';
    } else if (token === '--name') {
      options.name = rest[++i] || '';
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

function resolveDoctorClients(positional, options) {
  if (options.clients.length) {
    if (!options.detectedOnly) return options.clients;
    const detected = new Set(detectAll().filter((item) => item.detected).map((item) => item.name));
    return options.clients.filter((client) => detected.has(client));
  }
  if (positional[0]) return [positional[0]];
  return options.detectedOnly ? resolveClients(options, false) : ['claude', 'codex', 'gemini'];
}

function printBootstrapResult(client, result) {
  console.log(`- package: ${result.packageName}`);
  console.log(`- command: ${result.command}`);
  if (result.stdout && result.stdout.trim()) {
    console.log(result.stdout.trim());
  }
  if (result.stderr && result.stderr.trim()) {
    console.error(result.stderr.trim());
  }
  if (!result.ok) {
    throw new Error(`Failed to install the official ${client} client. ${result.stderr.trim() || result.stdout.trim() || 'No additional output.'}`);
  }
}

function resolveComponents(options) {
  if (options.components.length) return options.components;
  return ['mcp', 'skills', 'memory'];
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
    const componentAnswer = await ask(rl, 'Optional components [mcp,skills,memory]: ');
    options.components = (componentAnswer || 'mcp,skills,memory').split(',').map((item) => item.trim()).filter(Boolean);
    console.log(`EXA_API_KEY will be written into selected client configs. Current value: ${sanitizeToken(options.exaApiKey)}`);
    const tokenAnswer = await ask(rl, 'Enter EXA_API_KEY (press Enter to keep/skip): ');
    if (tokenAnswer) options.exaApiKey = tokenAnswer;
    rl.close();
  } else if (!options.clients.length) {
    options.clients = resolveClients(options);
  }
  options.components = resolveComponents(options);

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
  if (!adapters[client].detect().detected) {
    console.log(`\n[bootstrap] ${client}`);
    printBootstrapResult(client, ensureOfficialClientInstalled(client));
  }
  options.clients = [client];
  options.components = resolveComponents(options);
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
  const clients = resolveDoctorClients(positional, options);
  const report = doctor(clients, options);
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  }
  if (report.support.some((item) => !item.ok)) process.exitCode = 1;
}

function runBootstrapClient(positional) {
  const client = positional[0];
  if (!client || !adapters[client]) {
    throw new Error('Usage: forge bootstrap-client claude|codex|gemini');
  }
  const result = ensureOfficialClientInstalled(client);
  console.log(`\n[bootstrap] ${client}`);
  printBootstrapResult(client, result);
}

async function runRepair(positional, options) {
  const clients = options.clients.length ? options.clients : (positional[0] ? [positional[0]] : ['claude', 'codex', 'gemini']);
  options.components = resolveComponents(options);
  for (const client of clients) {
    if (!adapters[client].detect().detected) {
      console.log(`\n[bootstrap] ${client}`);
      printBootstrapResult(client, ensureOfficialClientInstalled(client));
    }
    console.log(`\n[repair] ${client}`);
    adapters[client].repair({ ...options, nonInteractive: true, skipBackup: true });
  }
  runVerify([], { ...options, clients });
}

function decodeSpec(specBase64) {
  return JSON.parse(Buffer.from(specBase64, 'base64').toString('utf8'));
}

function runExternalSearch(options) {
  if (!options.kind || !['skills', 'mcp'].includes(options.kind)) {
    throw new Error('Usage: forge external-search --kind skills|mcp --query <text>');
  }
  const sources = loadRegistrySources();
  const results = options.kind === 'skills'
    ? searchExternalSkills(options.query)
    : [];
  const output = {
    kind: options.kind,
    query: options.query,
    sources: sources[options.kind] || [],
    results,
  };
  if (options.kind === 'mcp') {
    return searchExternalMcp(options.query).then((mcpResults) => {
      output.results = mcpResults;
      console.log(JSON.stringify(output, null, 2));
    });
  }
  console.log(JSON.stringify(output, null, 2));
}

function runExternalInstallSkill(options) {
  const client = options.clients[0];
  if (!client || !adapters[client]) {
    throw new Error('Usage: forge external-install-skill --client claude|codex|gemini --source <owner/repo> --skill <skill>');
  }
  if (!options.source || !options.skill) {
    throw new Error('Missing required arguments: --source and --skill');
  }
  const result = installExternalSkill({
    client,
    source: options.source,
    skill: options.skill,
  });
  console.log(JSON.stringify({
    ok: true,
    kind: 'skills',
    client,
    installed: result,
  }, null, 2));
}

function runExternalInstallMcp(options) {
  const client = options.clients[0];
  if (!client || !adapters[client]) {
    throw new Error('Usage: forge external-install-mcp --client claude|codex|gemini --spec-base64 <base64-json>');
  }
  if (!options.specBase64) {
    throw new Error('Missing required argument: --spec-base64');
  }
  const spec = decodeSpec(options.specBase64);
  if (!spec.installSpec || !spec.installSpec.command || !Array.isArray(spec.installSpec.args)) {
    throw new Error('Unsupported MCP install spec');
  }
  const script = path.join(__dirname, '../../../scripts/install-external-mcp.py');
  const result = run('python3', [
    script,
    '--client', client,
    '--name', options.name || spec.installSpec.name || spec.name,
    '--command', spec.installSpec.command,
    '--args-json', JSON.stringify(spec.installSpec.args),
    '--env-json', JSON.stringify(spec.installSpec.env || {}),
  ], { capture: true, allowFailure: true });
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
  if (result.status !== 0) {
    throw new Error(output || 'external MCP install failed');
  }
  console.log(JSON.stringify({
    ok: true,
    kind: 'mcp',
    client,
    installed: {
      name: options.name || spec.installSpec.name || spec.name,
      output,
      requiredSecrets: spec.installSpec.requiredSecrets || [],
    },
  }, null, 2));
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
  if (command === 'bootstrap-client') {
    runBootstrapClient(positional);
    return;
  }
  if (command === 'external-search') {
    await runExternalSearch(options);
    return;
  }
  if (command === 'external-install-skill') {
    runExternalInstallSkill(options);
    return;
  }
  if (command === 'external-install-mcp') {
    runExternalInstallMcp(options);
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
