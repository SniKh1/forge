const fs = require('fs');
const path = require('path');
const { clientHomes } = require('./constants');
const { commandExists } = require('./utils');

function detectClient(name) {
  const home = clientHomes[name];
  const marker = {
    claude: path.join(home, 'CLAUDE.md'),
    codex: path.join(home, 'AGENTS.md'),
    gemini: path.join(home, 'GEMINI.md'),
  }[name];

  const commandMap = {
    claude: 'claude',
    codex: 'codex',
    gemini: 'gemini',
  };

  const homeExists = fs.existsSync(home);
  const commandAvailable = commandExists(commandMap[name]);
  const markerExists = fs.existsSync(marker);

  return {
    name,
    home,
    homeExists,
    commandAvailable,
    detected: commandAvailable,
    configured: markerExists,
  };
}

function detectAll() {
  return ['claude', 'codex', 'gemini'].map(detectClient);
}

module.exports = { detectClient, detectAll };
