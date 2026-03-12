const { adapters } = require('../lib/adapters');

function verifyClients(clients, options = {}) {
  const summary = [];
  for (const client of clients) {
    if (!options.json) {
      console.log(`\n[verify] ${client}`);
    }
    const result = adapters[client].verify({ capture: Boolean(options.json) });
    summary.push({
      client,
      ok: result.status === 0,
      exitCode: result.status ?? 1,
      stdout: options.json ? (result.stdout || '') : undefined,
      stderr: options.json ? (result.stderr || '') : undefined,
    });
  }
  return summary;
}

module.exports = { verifyClients };
