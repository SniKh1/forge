#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { getClaudeDir, getDateString, getSessionIdShort, ensureDir, getProjectName, writeFile, countInFile, readFile } = require('../lib/utils');
const { extractProblemSolutionFromTranscript } = require('../lib/transcript-extraction');

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
  const extracted = extractProblemSolutionFromTranscript(transcriptPath);
  const record = {
    schemaVersion: '1.0',
    createdAt: new Date().toISOString(),
    workspaceSlug,
    sessionId: shortId,
    source: 'forge-hooks',
    status: extracted.status,
    transcriptPath,
    userMessageCount: messageCount,
    problem: extracted.problem,
    rootCause: extracted.rootCause,
    chosenFix: extracted.chosenFix,
    verification: extracted.verification,
    reuseTags: extracted.reuseTags,
    upgradeTarget: 'memory',
    candidateSkillIds: extracted.candidateSkillIds,
    candidateRolePacks: extracted.candidateRolePacks,
    candidateStackPacks: extracted.candidateStackPacks,
    extraction: extracted.extraction
  };
  const lines = [
    `# Problem-Solution Record: ${date}-${shortId}`,
    `**Workspace:** ${workspaceSlug}`,
    `**Session:** ${shortId}`,
    `**Transcript:** ${transcriptPath}`,
    `**Status:** ${record.status}`,
    `**Schema:** 1.0`,
    `**User Messages:** ${messageCount}`,
    ''
  ];

  if (record.extraction) {
    lines.push('## Extraction Summary');
    lines.push(`- Mode: ${record.extraction.mode}`);
    lines.push(`- Completed fields: ${record.extraction.completedFieldCount}/4`);
    lines.push(`- Confidence: problem=${record.extraction.confidence.problem}, rootCause=${record.extraction.confidence.rootCause}, chosenFix=${record.extraction.confidence.chosenFix}, verification=${record.extraction.confidence.verification}`);
    lines.push('');
  }

  lines.push('## Problem');
  lines.push(record.problem ? `- ${record.problem}` : '- ');
  lines.push('');
  lines.push('## Root Cause');
  lines.push(record.rootCause ? `- ${record.rootCause}` : '- ');
  lines.push('');
  lines.push('## Chosen Fix');
  lines.push(record.chosenFix ? `- ${record.chosenFix}` : '- ');
  lines.push('');
  lines.push('## Verification');
  lines.push(record.verification ? `- ${record.verification}` : '- ');
  lines.push('');
  lines.push('## Reuse Tags');
  lines.push(record.reuseTags.length ? `- ${record.reuseTags.join(', ')}` : '- ');
  lines.push('');
  lines.push('## Upgrade Target');
  lines.push('- memory | instinct | learned-skill | role-pack | stack-pack');
  lines.push('');
  lines.push('## Session Context Snippet');
  lines.push('```');
  lines.push(transcriptSnippet);
  lines.push('```');

  const content = `${lines.join('\n')}\n`;

  writeFile(target, content);
  writeFile(jsonTarget, JSON.stringify(record, null, 2) + '\n');
  console.error(`[ProblemSolution] ${record.status === 'reviewed' ? 'Reviewed record created' : 'Scaffold created'}: ${target}`);
}

main();
