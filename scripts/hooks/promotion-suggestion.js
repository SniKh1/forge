#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  getClaudeDir,
  ensureDir,
  getProjectName,
  writeFile,
  getDateString
} = require('../lib/utils');
const {
  loadProblemSolutionRecords,
  createSuggestions,
  renderPromotionMarkdown,
  buildReviewQueue,
  createUpdateProposals,
  renderUpdateProposalsMarkdown
} = require('../lib/promotion');

function slugify(value) {
  return String(value || 'workspace')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'workspace';
}

function getWorkspaceSlug() {
  return slugify(getProjectName() || path.basename(process.cwd()));
}

function writeReviewQueue(memoryDir, queue) {
  const mdFile = path.join(memoryDir, '_review-queue.md');
  const jsonFile = path.join(memoryDir, '_review-queue.json');
  const lines = [
    '# Problem-Solution Review Queue',
    '',
    `- Date: ${getDateString()}`,
    `- Scaffold records: ${queue.scaffolds}`,
    `- Reviewed records: ${queue.reviewed}`,
    ''
  ];

  if (!queue.latestScaffolds.length) {
    lines.push('No scaffold records pending review.');
  } else {
    lines.push('## Pending Review');
    lines.push('');
    for (const item of queue.latestScaffolds) {
      lines.push(`- ${item.title}`);
      lines.push(`  - File: ${item.file}`);
      if (item.createdAt) lines.push(`  - Created: ${item.createdAt}`);
      if (item.transcriptPath) lines.push(`  - Transcript: ${item.transcriptPath}`);
      if (item.userMessageCount) lines.push(`  - User messages: ${item.userMessageCount}`);
    }
  }

  writeFile(mdFile, lines.join('\n'));
  writeFile(jsonFile, JSON.stringify({
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    ...queue
  }, null, 2) + '\n');
}

function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const workspaceSlug = getWorkspaceSlug();
  const claudeDir = getClaudeDir();
  const problemSolutionsDir = path.join(claudeDir, 'projects', workspaceSlug, 'memory', 'problem-solutions');
  const evolvedDir = path.join(claudeDir, 'homunculus', 'evolved');

  if (!fs.existsSync(problemSolutionsDir)) {
    process.exit(0);
  }

  ensureDir(evolvedDir);
  const allRecords = loadProblemSolutionRecords(problemSolutionsDir, { includeScaffold: true });
  const reviewedRecords = allRecords.filter(record => (record.status || 'scaffold') !== 'scaffold');
  const queue = buildReviewQueue(allRecords);
  writeReviewQueue(problemSolutionsDir, queue);

  if (!reviewedRecords.length) {
    console.error(`[PromotionSuggestion] No reviewed records yet. Pending scaffolds: ${queue.scaffolds}`);
    process.exit(0);
  }

  const createdAt = new Date().toISOString();
  const stamp = Date.now();
  const suggestions = createSuggestions(reviewedRecords, repoRoot);
  const proposals = createUpdateProposals(reviewedRecords, suggestions, repoRoot);
  const mdFile = path.join(evolvedDir, `promotion-suggestions-${stamp}.md`);
  const jsonFile = path.join(evolvedDir, `promotion-suggestions-${stamp}.json`);
  const proposalMdFile = path.join(evolvedDir, `role-stack-update-proposals-${stamp}.md`);
  const proposalJsonFile = path.join(evolvedDir, `role-stack-update-proposals-${stamp}.json`);
  writeFile(mdFile, renderPromotionMarkdown({
    workspaceSlug,
    reviewedCount: reviewedRecords.length,
    suggestions,
    createdAt
  }));
  writeFile(jsonFile, JSON.stringify({
    schemaVersion: '1.0',
    createdAt,
    workspaceSlug,
    reviewedRecordCount: reviewedRecords.length,
    suggestions
  }, null, 2) + '\n');
  writeFile(proposalMdFile, renderUpdateProposalsMarkdown({
    workspaceSlug,
    proposals,
    createdAt
  }));
  writeFile(proposalJsonFile, JSON.stringify({
    schemaVersion: '1.0',
    createdAt,
    workspaceSlug,
    proposalCount: proposals.length,
    proposals
  }, null, 2) + '\n');

  console.error(`[PromotionSuggestion] Updated: ${mdFile}`);
}

main();
