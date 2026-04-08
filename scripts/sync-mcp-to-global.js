#!/usr/bin/env node
/**
 * Sync MCP servers from project config to global Claude config
 *
 * Problem: Project-level MCP config overrides global config
 * Solution: This script syncs project MCP to global so they work everywhere
 *
 * Usage: node scripts/sync-mcp-to-global.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const globalConfigPath = path.join(os.homedir(), '.claude.json');
const projectMcpPath = path.join(__dirname, '..', 'core', 'mcp-servers.json');

function main() {
  // Read project MCP config
  if (!fs.existsSync(projectMcpPath)) {
    console.error('Project MCP config not found:', projectMcpPath);
    process.exit(1);
  }

  const projectMcp = JSON.parse(fs.readFileSync(projectMcpPath, 'utf8'));

  // Read global Claude config
  if (!fs.existsSync(globalConfigPath)) {
    console.error('Global Claude config not found:', globalConfigPath);
    process.exit(1);
  }

  const globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, 'utf8'));

  // Convert project MCP format to Claude config format
  const mcpServers = {};

  for (const [name, server] of Object.entries(projectMcp.servers)) {
    // Skip if not for Claude client
    if (!server.clients.includes('claude')) continue;

    // Skip optional servers without required env vars
    if (server.optional && server.config.env) {
      const hasAllEnvVars = Object.values(server.config.env).every(v =>
        v && !v.startsWith('{{')
      );
      if (!hasAllEnvVars) continue;
    }

    // Use Claude-specific override if exists
    const config = { ...server.config };
    if (server.overrides?.claude) {
      Object.assign(config, server.overrides.claude);
    }

    mcpServers[name] = config;
  }

  // Update global config
  globalConfig.mcpServers = mcpServers;

  // Write back
  fs.writeFileSync(
    globalConfigPath,
    JSON.stringify(globalConfig, null, 2),
    'utf8'
  );

  console.log('✅ Synced', Object.keys(mcpServers).length, 'MCP servers to global config');
  console.log('Servers:', Object.keys(mcpServers).join(', '));
  console.log('\nRestart Claude Code to apply changes.');
}

main();
