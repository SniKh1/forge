#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { getClaudeDir, getDateString, getSessionIdShort, ensureDir, getProjectName, writeFile, countInFile, readFile } = require('../lib/utils');

function slugify(value) {
  return String(value || 'workspace')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'workspace';
}

function main() {
  const transcriptPath = process.env.CLAUDE_TRANSCRIPT_PATH;
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    process.exit(0);
  }

  const messageCount = countInFile(transcriptPath, /"type":"user"/g);
  if (messageCount < 6) {
    process.exit(0);
  }

  const workspaceSlug = slugify(getProjectName() || path.basename(process.cwd()));
  const date = getDateString();
  const shortId = getSessionIdShort();
  const memoryDir = path.join(getClaudeDir(), 'projects', workspaceSlug, 'memory', 'problem-solutions');
  ensureDir(memoryDir);

  const target = path.join(memoryDir, `${date}-${shortId}.md`);
  const jsonTarget = path.join(memoryDir, `${date}-${shortId}.json`);
  if (fs.existsSync(target)) {
    process.exit(0);
  }

  const transcriptSnippet = (readFile(transcriptPath) || '').slice(0, 1200);
  const record = {
    schemaVersion: '1.0',
    createdAt: new Date().toISOString(),
    workspaceSlug,
    sessionId: shortId,
    source: 'forge-hooks',
    status: 'scaffold',
    transcriptPath,
    userMessageCount: messageCount,
    problem: '',
    rootCause: '',
    chosenFix: '',
    verification: '',
    reuseTags: [],
    upgradeTarget: 'memory',
    candidateSkillIds: [],
    candidateRolePacks: ['developer'],
    candidateStackPacks: []
  };
  const content = `# Problem-Solution Record: ${date}-${shortId}
**Workspace:** ${workspaceSlug}
**Session:** ${shortId}
**Transcript:** ${transcriptPath}
**Status:** scaffold
**Schema:** 1.0
**User Messages:** ${messageCount}

## Problem
- 

## Root Cause
- 

## Chosen Fix
- 

## Verification
- 

## Reuse Tags
- 

## Upgrade Target
- memory | instinct | learned-skill | role-pack | stack-pack

## Session Context Snippet
\`\`\`
${transcriptSnippet}
\`\`\`
`;

  writeFile(target, content);
  writeFile(jsonTarget, JSON.stringify(record, null, 2) + '\n');
  console.error(`[ProblemSolution] Scaffold created: ${target}`);
}

main();
