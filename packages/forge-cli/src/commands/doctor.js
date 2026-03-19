const { adapters } = require('../lib/adapters');
const { detectAll } = require('../lib/detection');
const { loadCapabilityMatrix, renderCapabilityTable } = require('../lib/capabilities');
const { relativeToHome } = require('../lib/utils');

function doctor(clients, options = {}) {
  const detection = detectAll();
  if (!options.json) {
    console.log('Client detection');
    for (const item of detection) {
      console.log(
        `- ${item.name}: detected=${item.detected ? 'yes' : 'no'}, configured=${item.configured ? 'yes' : 'no'}, command=${item.commandAvailable ? 'yes' : 'no'}, homeExists=${item.homeExists ? 'yes' : 'no'}, home=${relativeToHome(item.home)}`,
      );
    }
    console.log('\nCapability matrix');
    console.log(renderCapabilityTable(['claude', 'codex', 'gemini']));
  }

  const summary = [];
  for (const client of clients) {
    const result = adapters[client].verify({ capture: Boolean(options.json) });
    summary.push({
      client,
      ok: result.status === 0,
      exitCode: result.status ?? 1,
      stdout: options.json ? (result.stdout || '') : undefined,
      stderr: options.json ? (result.stderr || '') : undefined,
    });
  }

  if (!options.json) {
    console.log('\nSupport summary');
    for (const item of summary) {
      console.log(`- ${item.client}: ${item.ok ? 'healthy' : 'needs repair'} (share this line and the verify output with support)`);
    }
  }

  const report = {
    detection: detection.map((item) => ({
      ...item,
      homeLabel: relativeToHome(item.home),
    })),
    capabilityMatrix: loadCapabilityMatrix(),
    support: summary,
  };

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    // Always exit 0 in JSON mode so the frontend can parse the report
    process.exitCode = 0;
  }

  return report;
}

module.exports = { doctor };
