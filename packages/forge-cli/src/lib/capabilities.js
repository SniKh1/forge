const path = require('path');
const { repoRoot } = require('./constants');
const { readJson } = require('./utils');

function loadCapabilityMatrix() {
  return readJson(path.join(repoRoot, 'core', 'capability-matrix.json'));
}

function renderCapabilityTable(clients) {
  const matrix = loadCapabilityMatrix().capabilities;
  const headers = ['capability', ...clients];
  const rows = Object.entries(matrix).map(([name, values]) => [name, ...clients.map((client) => values[client] || '-')]);
  const widths = headers.map((header, index) => Math.max(header.length, ...rows.map((row) => String(row[index]).length)));
  const format = (cells) => cells.map((cell, index) => String(cell).padEnd(widths[index])).join(' | ');
  return [format(headers), widths.map((width) => '-'.repeat(width)).join('-|-'), ...rows.map(format)].join('\n');
}

module.exports = { loadCapabilityMatrix, renderCapabilityTable };
