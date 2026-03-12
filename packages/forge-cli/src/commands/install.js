const { adapters, clientHomes } = require('../lib/adapters');
const { relativeToHome } = require('../lib/utils');

async function installClients(clients, options) {
  const results = [];
  for (const client of clients) {
    console.log(`\n[install] ${client}`);
    adapters[client].install(options);
    results.push({ client, home: clientHomes[client] });
  }
  return results;
}

function printInstallSummary(results) {
  console.log('\nInstallation summary');
  for (const item of results) {
    console.log(`- ${item.client}: ${relativeToHome(item.home)}`);
  }
}

module.exports = { installClients, printInstallSummary };
