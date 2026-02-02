#!/usr/bin/env node
/**
 * Auto Learn - Pattern Extraction from Observations
 *
 * Analyzes observations.jsonl and extracts reusable patterns as instincts.
 * Runs automatically on SessionEnd hook.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Paths
const HOME = os.homedir();
const CONFIG_DIR = path.join(HOME, '.claude', 'homunculus');
const OBSERVATIONS_FILE = path.join(CONFIG_DIR, 'observations.jsonl');
const INSTINCTS_DIR = path.join(CONFIG_DIR, 'instincts', 'personal');
const LEARNED_SKILLS_DIR = path.join(HOME, '.claude', 'skills', 'learned');

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Read observations from file
function readObservations() {
  if (!fs.existsSync(OBSERVATIONS_FILE)) return [];

  const content = fs.readFileSync(OBSERVATIONS_FILE, 'utf8');
  const lines = content.trim().split('\n').filter(Boolean);

  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

// Analyze tool usage patterns
function analyzeToolPatterns(observations) {
  const toolCounts = {};
  const toolSequences = [];
  let currentSequence = [];

  for (const obs of observations) {
    if (obs.event === 'tool_start') {
      toolCounts[obs.tool] = (toolCounts[obs.tool] || 0) + 1;
      currentSequence.push(obs.tool);

      if (currentSequence.length >= 3) {
        toolSequences.push([...currentSequence]);
        currentSequence = currentSequence.slice(-2);
      }
    }
  }

  return { toolCounts, toolSequences };
}

// Detect repeated patterns
function detectPatterns(toolSequences) {
  const patternCounts = {};

  for (const seq of toolSequences) {
    const key = seq.join(' -> ');
    patternCounts[key] = (patternCounts[key] || 0) + 1;
  }

  // Filter patterns that appear 3+ times
  return Object.entries(patternCounts)
    .filter(([_, count]) => count >= 3)
    .map(([pattern, count]) => ({ pattern, count }));
}

// Generate instinct from pattern
function generateInstinct(pattern, count) {
  const tools = pattern.split(' -> ');
  const id = `workflow-${tools.join('-').toLowerCase()}`;
  const confidence = Math.min(0.3 + (count * 0.1), 0.9);

  return {
    id,
    trigger: `When starting ${tools[0]} task`,
    action: `Follow sequence: ${pattern}`,
    confidence: confidence.toFixed(2),
    domain: 'workflow',
    source: 'auto-observation',
    evidence: [`Observed ${count} times in session`],
    createdAt: new Date().toISOString()
  };
}

// Save instinct to file
function saveInstinct(instinct) {
  ensureDir(INSTINCTS_DIR);

  const filename = `${instinct.id}.json`;
  const filepath = path.join(INSTINCTS_DIR, filename);

  // Merge with existing if present
  if (fs.existsSync(filepath)) {
    const existing = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    instinct.confidence = Math.min(
      parseFloat(existing.confidence) + 0.05,
      0.95
    ).toFixed(2);
    instinct.evidence = [...(existing.evidence || []), ...instinct.evidence];
  }

  fs.writeFileSync(filepath, JSON.stringify(instinct, null, 2));
  return filepath;
}

// Main function
async function main() {
  console.error('[AutoLearn] Starting pattern analysis...');

  ensureDir(CONFIG_DIR);
  ensureDir(INSTINCTS_DIR);
  ensureDir(LEARNED_SKILLS_DIR);

  const observations = readObservations();

  if (observations.length < 10) {
    console.error(`[AutoLearn] Not enough observations (${observations.length}), skipping`);
    process.exit(0);
  }

  console.error(`[AutoLearn] Analyzing ${observations.length} observations...`);

  const { toolCounts, toolSequences } = analyzeToolPatterns(observations);
  const patterns = detectPatterns(toolSequences);

  if (patterns.length === 0) {
    console.error('[AutoLearn] No significant patterns detected');
    process.exit(0);
  }

  console.error(`[AutoLearn] Found ${patterns.length} patterns`);

  // Generate and save instincts
  for (const { pattern, count } of patterns) {
    const instinct = generateInstinct(pattern, count);
    const filepath = saveInstinct(instinct);
    console.error(`[AutoLearn] Saved instinct: ${instinct.id} (confidence: ${instinct.confidence})`);
  }

  // Log summary
  console.error('[AutoLearn] Tool usage summary:');
  const sorted = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]);
  for (const [tool, count] of sorted.slice(0, 5)) {
    console.error(`  - ${tool}: ${count} times`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[AutoLearn] Error:', err.message);
  process.exit(0);
});
