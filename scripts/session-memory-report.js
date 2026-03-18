#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');

function getCodexHome() {
  return process.env.FORGE_AGENT_HOME || process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
}

function toWorkspaceSlug(inputPath) {
  const abs = path.resolve(inputPath || process.cwd());
  return abs.replace(/[:\\/]+/g, '-').replace(/-+/g, '-').replace(/^-/, '');
}

function parseArgs(argv) {
  const options = {
    json: false,
    write: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (current === '--json') {
      options.json = true;
      continue;
    }
    if (current === '--write') {
      options.write = true;
      continue;
    }
    if (current === '--session' || current === '--id') {
      options.sessionId = argv[index + 1];
      index += 1;
      continue;
    }
    if (current === '--codex-home') {
      options.codexHome = argv[index + 1];
      index += 1;
      continue;
    }
    if (current === '--cwd') {
      options.cwd = argv[index + 1];
      index += 1;
      continue;
    }
    if (!current.startsWith('--') && !options.sessionId) {
      options.sessionId = current;
    }
  }

  return options;
}

function readJsonLines(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const records = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      records.push(JSON.parse(line));
    } catch {
      // Ignore malformed partial lines in active sessions.
    }
  }
  return records;
}

function findRolloutPath(baseDir, sessionId) {
  if (!fs.existsSync(baseDir)) return null;
  const queue = [baseDir];
  while (queue.length > 0) {
    const current = queue.shift();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.includes(sessionId) && entry.name.endsWith('.jsonl')) {
        return fullPath;
      }
    }
  }
  return null;
}

function getTextFromContent(content) {
  if (!Array.isArray(content)) return '';
  return content
    .filter(item => item && item.type === 'input_text' && item.text)
    .map(item => item.text)
    .join('\n')
    .trim();
}

function isMeaningfulUserText(text) {
  const normalized = String(text || '').trim();
  if (!normalized) return false;
  if (/^<environment_context>/i.test(normalized)) return false;
  if (/^<turn_aborted>/i.test(normalized)) return false;
  return true;
}

function shorten(text, limit = 400) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit - 3)}...`;
}

function collectSessionData(events) {
  const sessionMeta = events.find(event => event.type === 'session_meta')?.payload || {};
  const userMessages = [];
  const assistantMessages = [];
  let lastAgentMessage = '';

  for (const event of events) {
    if (event.type === 'response_item') {
      const payload = event.payload || {};
      if (payload.type === 'message' && payload.role === 'user') {
        const text = getTextFromContent(payload.content);
        if (isMeaningfulUserText(text)) {
          userMessages.push({
            timestamp: event.timestamp,
            text
          });
        }
      }
      if (payload.type === 'message' && payload.role === 'assistant') {
        const text = Array.isArray(payload.content)
          ? payload.content
            .filter(item => item && item.type === 'output_text' && item.text)
            .map(item => item.text)
            .join('\n')
            .trim()
          : '';
        if (text) {
          assistantMessages.push({
            timestamp: event.timestamp,
            phase: payload.phase || null,
            text
          });
        }
      }
    }

    if (event.type === 'event_msg' && event.payload?.type === 'task_complete') {
      lastAgentMessage = event.payload.last_agent_message || lastAgentMessage;
    }
  }

  const lastUserInstruction = userMessages[userMessages.length - 1] || null;
  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1] || null;

  return {
    sessionMeta,
    userMessages,
    assistantMessages,
    lastUserInstruction,
    lastAssistantMessage,
    lastAgentMessage
  };
}

function readMemoryFiles(codexHome, workspacePath) {
  if (!workspacePath) {
    return {
      workspaceSlug: null,
      memoryFile: null,
      projectMemoryFile: null,
      memory: null,
      projectMemory: null
    };
  }

  const workspaceSlug = toWorkspaceSlug(workspacePath);
  const memoryDir = path.join(codexHome, 'projects', workspaceSlug, 'memory');
  const memoryFile = path.join(memoryDir, 'MEMORY.md');
  const projectMemoryFile = path.join(memoryDir, 'PROJECT-MEMORY.md');

  return {
    workspaceSlug,
    memoryFile,
    projectMemoryFile,
    memory: fs.existsSync(memoryFile) ? fs.readFileSync(memoryFile, 'utf8') : null,
    projectMemory: fs.existsSync(projectMemoryFile) ? fs.readFileSync(projectMemoryFile, 'utf8') : null
  };
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resolveTargetPaths(codexHome, cwd, sessionId) {
  const targetCwd = path.resolve(cwd || process.cwd());
  const workspaceSlug = toWorkspaceSlug(targetCwd);
  const memoryDir = path.join(codexHome, 'projects', workspaceSlug, 'memory');
  const sessionReportsDir = path.join(memoryDir, 'session-reports');
  const sessionReportFile = path.join(sessionReportsDir, `${sessionId}.md`);
  return {
    targetCwd,
    workspaceSlug,
    memoryDir,
    sessionReportsDir,
    sessionReportFile
  };
}

function renderTextReport(report) {
  const lines = [];

  lines.push(`Session ID: ${report.sessionId}`);
  lines.push(`Rollout: ${report.rolloutPath}`);
  lines.push(`Workspace: ${report.workspace || '(unknown)'}`);
  lines.push(`Workspace Slug: ${report.workspaceSlug || '(unknown)'}`);
  lines.push(`Started At: ${report.startedAt || '(unknown)'}`);
  lines.push('');
  lines.push('Last User Instruction:');
  lines.push(report.lastUserInstruction ? report.lastUserInstruction.text : '(none)');
  lines.push('');
  lines.push('All User Instructions:');
  if (report.userInstructions.length === 0) {
    lines.push('(none)');
  } else {
    for (const item of report.userInstructions) {
      lines.push(`- [${item.timestamp}] ${shorten(item.text, 300)}`);
    }
  }
  lines.push('');
  lines.push('Last Agent Message:');
  lines.push(report.lastAgentMessage || '(none)');
  lines.push('');
  lines.push('Memory Files:');
  lines.push(`- MEMORY.md: ${report.memoryFile || '(missing)'}`);
  lines.push(`- PROJECT-MEMORY.md: ${report.projectMemoryFile || '(missing)'}`);
  lines.push('');
  lines.push('Memory Preview:');
  lines.push(shorten(report.memory || '(missing)', 800));
  lines.push('');
  lines.push('Project Memory Preview:');
  lines.push(shorten(report.projectMemory || '(missing)', 800));

  return `${lines.join('\n')}\n`;
}

function renderMarkdownReport(report) {
  const lines = [];
  lines.push(`# Session Memory Report`);
  lines.push('');
  lines.push(`- Session ID: \`${report.sessionId}\``);
  lines.push(`- Source Workspace: \`${report.workspace || '(unknown)'}\``);
  lines.push(`- Source Workspace Slug: \`${report.workspaceSlug || '(unknown)'}\``);
  lines.push(`- Rollout: \`${report.rolloutPath}\``);
  lines.push(`- Started At: \`${report.startedAt || '(unknown)'}\``);
  lines.push('');
  lines.push(`## Last User Instruction`);
  lines.push('');
  lines.push(report.lastUserInstruction ? report.lastUserInstruction.text : '(none)');
  lines.push('');
  lines.push(`## Last Agent Message`);
  lines.push('');
  lines.push(report.lastAgentMessage || '(none)');
  lines.push('');
  lines.push(`## Source Memory Files`);
  lines.push('');
  lines.push(`- MEMORY.md: \`${report.memoryFile || '(missing)'}\``);
  lines.push(`- PROJECT-MEMORY.md: \`${report.projectMemoryFile || '(missing)'}\``);
  lines.push('');
  lines.push(`## All User Instructions`);
  lines.push('');
  if (report.userInstructions.length === 0) {
    lines.push('- (none)');
  } else {
    for (const item of report.userInstructions) {
      lines.push(`- [${item.timestamp}] ${shorten(item.text, 500)}`);
    }
  }
  lines.push('');
  lines.push('## MEMORY.md Preview');
  lines.push('');
  lines.push('```md');
  lines.push((report.memory || '(missing)').trim());
  lines.push('```');
  lines.push('');
  lines.push('## PROJECT-MEMORY.md Preview');
  lines.push('');
  lines.push('```md');
  lines.push((report.projectMemory || '(missing)').trim());
  lines.push('```');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.sessionId) {
    console.error('Usage: node scripts/session-memory-report.js <session-id> [--json] [--write] [--cwd <path>] [--codex-home <path>]');
    process.exit(1);
  }

  const codexHome = path.resolve(options.codexHome || getCodexHome());
  const rolloutPath = findRolloutPath(path.join(codexHome, 'sessions'), options.sessionId)
    || findRolloutPath(path.join(codexHome, 'archived_sessions'), options.sessionId);

  if (!rolloutPath) {
    console.error(`Session rollout not found for ${options.sessionId}`);
    process.exit(2);
  }

  const events = readJsonLines(rolloutPath);
  const session = collectSessionData(events);
  const workspace = session.sessionMeta.cwd || null;
  const memory = readMemoryFiles(codexHome, workspace);

  const report = {
    sessionId: options.sessionId,
    codexHome,
    rolloutPath,
    workspace,
    workspaceSlug: memory.workspaceSlug,
    startedAt: session.sessionMeta.timestamp || null,
    lastUserInstruction: session.lastUserInstruction,
    userInstructions: session.userMessages,
    lastAgentMessage: session.lastAgentMessage || session.lastAssistantMessage?.text || '',
    memoryFile: memory.memoryFile,
    projectMemoryFile: memory.projectMemoryFile,
    memory: memory.memory,
    projectMemory: memory.projectMemory
  };

  if (options.write) {
    const target = resolveTargetPaths(codexHome, options.cwd, options.sessionId);
    ensureDir(target.sessionReportsDir);
    fs.writeFileSync(target.sessionReportFile, renderMarkdownReport(report), 'utf8');
    report.writtenReportFile = target.sessionReportFile;
    report.targetWorkspace = target.targetCwd;
    report.targetWorkspaceSlug = target.workspaceSlug;
  }

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  let output = renderTextReport(report);
  if (report.writtenReportFile) {
    output += `\nWritten Report:\n${report.writtenReportFile}\n`;
  }
  process.stdout.write(output);
}

main();
