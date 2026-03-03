#!/usr/bin/env node
/**
 * PreCompact Hook - Save state before context compaction
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs before Claude compacts context, giving you a chance to
 * preserve important state that might get lost in summarization.
 */

const path = require('path');
const {
  getSessionsDir,
  getDateTimeString,
  getTimeString,
  findFiles,
  ensureDir,
  appendFile,
  log
} = require('../lib/utils');

async function main() {
  const sessionsDir = getSessionsDir();
  const compactionLog = path.join(sessionsDir, 'compaction-log.txt');

  ensureDir(sessionsDir);

  // Log compaction event with timestamp
  const timestamp = getDateTimeString();
  appendFile(compactionLog, `[${timestamp}] Context compaction triggered\n`);

  // If there's an active session file, note the compaction
  const sessions = findFiles(sessionsDir, '*.tmp');

  if (sessions.length > 0) {
    const activeSession = sessions[0].path;
    const timeStr = getTimeString();
    appendFile(activeSession, `\n---\n**[Compaction occurred at ${timeStr}]** - Context was summarized\n`);
  }

  log('[PreCompact] State saved before compaction');

  // Signal Claude to run /learn before compaction proceeds
  console.error('');
  console.error('[LEARNING-TRIGGER] 上下文即将压缩');
  console.error('[LEARNING-TRIGGER] 请在压缩前立即运行 /learn，将本次会话的关键模式固化为 skill');
  console.error('[LEARNING-TRIGGER] 如果 instincts/personal/ 已积累 3+ 个文件，也请运行 /evolve');
  console.error('');

  process.exit(0);
}

main().catch(err => {
  console.error('[PreCompact] Error:', err.message);
  process.exit(0);
});
