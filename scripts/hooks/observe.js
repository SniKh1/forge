#!/usr/bin/env node
/**
 * Continuous Learning v2 - Observation Hook (Windows Compatible)
 *
 * Captures tool use events for pattern analysis.
 * Claude Code passes hook data via stdin as JSON.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.claude', 'homunculus');
const OBSERVATIONS_FILE = path.join(CONFIG_DIR, 'observations.jsonl');
const MAX_FILE_SIZE_MB = 10;

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Get ISO timestamp
function getTimestamp() {
  return new Date().toISOString();
}

// Truncate string to max length
function truncate(str, maxLen = 5000) {
  if (typeof str === 'object') {
    str = JSON.stringify(str);
  }
  return String(str).slice(0, maxLen);
}

// Archive file if too large
function archiveIfNeeded() {
  if (!fs.existsSync(OBSERVATIONS_FILE)) return;

  const stats = fs.statSync(OBSERVATIONS_FILE);
  const sizeMB = stats.size / (1024 * 1024);

  if (sizeMB >= MAX_FILE_SIZE_MB) {
    const archiveDir = path.join(CONFIG_DIR, 'observations.archive');
    ensureDir(archiveDir);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.renameSync(
      OBSERVATIONS_FILE,
      path.join(archiveDir, `observations-${timestamp}.jsonl`)
    );
  }
}

// Main function
async function main() {
  ensureDir(CONFIG_DIR);

  // Check if disabled
  if (fs.existsSync(path.join(CONFIG_DIR, 'disabled'))) {
    process.exit(0);
  }

  // Read JSON from stdin
  let inputJson = '';
  for await (const chunk of process.stdin) {
    inputJson += chunk;
  }

  if (!inputJson.trim()) {
    process.exit(0);
  }

  try {
    const data = JSON.parse(inputJson);

    // Determine hook type from args or data
    const hookType = process.argv[2] || data.hook_type || 'unknown';
    const isPreHook = hookType.toLowerCase().includes('pre');

    // Extract fields
    const observation = {
      timestamp: getTimestamp(),
      event: isPreHook ? 'tool_start' : 'tool_complete',
      tool: data.tool_name || data.tool || 'unknown',
      session: data.session_id || process.env.CLAUDE_SESSION_ID || 'unknown'
    };

    if (isPreHook && data.tool_input) {
      observation.input = truncate(data.tool_input);
    }

    if (!isPreHook && data.tool_output) {
      observation.output = truncate(data.tool_output);
    }

    // Archive if needed
    archiveIfNeeded();

    // Append observation
    fs.appendFileSync(OBSERVATIONS_FILE, JSON.stringify(observation) + '\n');

    // Pass through original data
    console.log(inputJson);

  } catch (err) {
    // Log parse error
    const errorObs = {
      timestamp: getTimestamp(),
      event: 'parse_error',
      error: err.message,
      raw: inputJson.slice(0, 500)
    };
    fs.appendFileSync(OBSERVATIONS_FILE, JSON.stringify(errorObs) + '\n');
    console.log(inputJson);
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
