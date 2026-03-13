const fs = require('fs');

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function cleanSentence(value) {
  return normalizeText(String(value || '')
    .replace(/\*\*/g, '')
    .replace(/`+/g, '')
    .replace(/\[(?:tool_result|tool_use)\]\s*/gi, '')
    .replace(/\s+[1-9]\.$/, '')
    .replace(/\s*[-:]\s*$/, '')
  );
}

function splitSentences(text) {
  return String(text || '')
    .split(/(?<=[。！？.!?])\s+|\n+/)
    .map(item => cleanSentence(item))
    .filter(Boolean);
}

function stripCommandNoise(text) {
  return String(text || '')
    .replace(/<command-message>[\s\S]*?<\/command-message>/g, ' ')
    .replace(/<command-name>[\s\S]*?<\/command-name>/g, ' ')
    .replace(/<local-command-caveat>[\s\S]*?<\/local-command-caveat>/g, ' ')
    .replace(/Base directory for this skill:[^\n]+/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, ' ')
    .replace(/#+\s+/g, '')
    .replace(/^[*-]\s+/gm, '')
    .trim();
}

function parseTranscript(file) {
  const events = [];
  const raw = fs.readFileSync(file, 'utf8');
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line));
    } catch {
      // Ignore malformed lines in partial transcripts.
    }
  }
  return events;
}

function extractUserText(event) {
  const content = event?.message?.content ?? event?.content;
  if (typeof content === 'string') return stripCommandNoise(content);
  if (Array.isArray(content)) {
    return content
      .filter(item => item && item.type === 'text')
      .map(item => stripCommandNoise(item.text || ''))
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

function extractAssistantText(event) {
  const content = event?.message?.content ?? event?.content;
  if (typeof content === 'string') return stripCommandNoise(content);
  if (!Array.isArray(content)) return '';
  return content
    .filter(item => item && item.type === 'text')
    .map(item => stripCommandNoise(item.text || ''))
    .filter(Boolean)
    .join('\n');
}

function extractToolResultEntries(event) {
  const content = event?.message?.content ?? event?.content;
  if (!Array.isArray(content)) return [];
  return content
    .filter(item => item && item.type === 'tool_result')
    .map(item => ({
      content: normalizeText(item.content || ''),
      isError: Boolean(item.is_error),
      toolUseId: item.tool_use_id || null
    }))
    .filter(item => item.content || item.isError);
}

function firstMeaningful(values, predicate = () => true) {
  for (const value of values) {
    if (value && predicate(value)) return value;
  }
  return '';
}

function summarizeToolError(text) {
  const sentence = splitSentences(text)[0] || cleanSentence(text).slice(0, 220);
  return sentence.replace(/^Error:\s*/i, '');
}

function scoreCandidates(sentences, scorer) {
  return sentences
    .map(sentence => ({ sentence: cleanSentence(sentence), score: scorer(cleanSentence(sentence)) }))
    .filter(item => item.sentence && item.score > 0)
    .sort((a, b) => b.score - a.score || b.sentence.length - a.sentence.length);
}

function inferProblem(userTexts) {
  return firstMeaningful(userTexts, text => text.length >= 12 && !/^todos have been modified successfully/i.test(text));
}

function inferRootCause(assistantTexts, toolErrors) {
  const diagnosisPatterns = [
    /(根因|原因|是因为|由于|因为|未配置|不存在|无法|失败|导致|没有读取到|路径算错|不匹配)/,
    /(not found|missing|failed to|could not|permission denied|dns|hostname|invalid|mismatch|unavailable|unable to resolve)/i
  ];
  const scored = scoreCandidates(
    [...assistantTexts].reverse().flatMap(splitSentences),
    sentence => {
      if (sentence.length < 8) return 0;
      let score = 0;
      if (diagnosisPatterns.some(pattern => pattern.test(sentence))) score += 4;
      if (/^这可能是|^可能是|检查：|告诉我|你想|请选择/.test(sentence)) score -= 3;
      if (/1\.|2\.|3\./.test(sentence)) score -= 2;
      if (/[?？]$/.test(sentence)) score -= 4;
      return score;
    }
  );
  if (scored.length) return scored[0].sentence;

  const errorText = toolErrors[toolErrors.length - 1];
  if (errorText) return summarizeToolError(errorText);
  return '';
}

function inferChosenFix(assistantTexts) {
  const fixPatterns = [
    /(修复|改为|改成|添加|配置|补上|切换|同步|创建|安装|更新|恢复|改用|接上|收口|统一|处理掉)/,
    /(use |switch to|replace|configure|set |update |add |install |sync |restore |wire |align |fix )/i
  ];
  const weakPromptPatterns = /(告诉我|你想|请选择|可以.*吗|哪种方式|是否需要)/;
  const scored = scoreCandidates(
    [...assistantTexts].reverse().flatMap(splitSentences),
    sentence => {
      if (sentence.length < 8) return 0;
      let score = 0;
      if (fixPatterns.some(pattern => pattern.test(sentence))) score += 4;
      if (/我(已经|已)/.test(sentence)) score += 2;
      if (/默认|优先|现在会|改成了|已改成/.test(sentence)) score += 1;
      if (weakPromptPatterns.test(sentence)) score -= 4;
      if (/[?？]$/.test(sentence)) score -= 5;
      return score;
    }
  );
  return scored.length ? scored[0].sentence : '';
}

function inferVerification(assistantTexts, toolSuccesses) {
  const verificationPatterns = [
    /(通过|成功|已完成|已修好|已同步|构建通过|校验通过|验证通过|生成了|已生成|已写入|已重启)/,
    /(passed|success|successful|verified|build through|build passed|validated|synced|written:|updated:|finished|built application)/i
  ];
  const assistantScored = scoreCandidates(
    [...assistantTexts].reverse().flatMap(splitSentences),
    sentence => {
      if (sentence.length < 6) return 0;
      let score = 0;
      if (verificationPatterns.some(pattern => pattern.test(sentence))) score += 4;
      if (/构建|校验|验证|测试|build|lint|typecheck|sync/i.test(sentence)) score += 2;
      if (/[?？]$/.test(sentence)) score -= 3;
      return score;
    }
  );
  if (assistantScored.length) return assistantScored[0].sentence;

  const successScored = scoreCandidates(
    [...toolSuccesses].reverse().flatMap(splitSentences),
    sentence => {
      if (sentence.length < 4) return 0;
      let score = 0;
      if (verificationPatterns.some(pattern => pattern.test(sentence))) score += 4;
      if (/finished|built application|written:|updated:|pass|ok|success/i.test(sentence)) score += 2;
      return score;
    }
  );
  return successScored.length ? successScored[0].sentence : '';
}

function inferReuseTags(corpus) {
  const rules = [
    ['browser', /(browser-use|browser|chrome|playwright|devtools)/i],
    ['frontend', /(frontend|react|vue|next\.js|ui|component|tauri|electron)/i],
    ['java', /(spring|spring boot|jpa|hibernate|java)/i],
    ['python', /(python|fastapi|django|pytest)/i],
    ['testing', /(test|testing|tdd|playwright|coverage|mock)/i],
    ['review', /(review|审查|审阅|code review)/i],
    ['planning', /(plan|方案|规划|设计稿|brainstorm)/i],
    ['mcp', /(mcp|model context protocol)/i],
    ['release', /(release|build|packaging|ci|workflow|deploy)/i],
    ['auth', /(auth|oauth|jwt|cookie|session|登录|认证)/i],
    ['docs', /(readme|document|文档|spec|roadmap)/i],
    ['debugging', /(debug|报错|异常|error|failed|failure)/i]
  ];
  return rules.filter(([, pattern]) => pattern.test(corpus)).map(([tag]) => tag);
}

function inferCandidates(tags, corpus) {
  const candidateSkillIds = ['self-improving-agent'];
  const candidateRolePacks = ['developer'];
  const candidateStackPacks = [];

  const add = (list, value) => {
    if (value && !list.includes(value)) list.push(value);
  };

  if (tags.includes('browser')) add(candidateSkillIds, 'browser-use');
  if (tags.includes('frontend')) {
    add(candidateSkillIds, 'frontend-design');
    add(candidateStackPacks, 'frontend');
  }
  if (tags.includes('java')) {
    add(candidateSkillIds, 'backend-development');
    add(candidateStackPacks, 'java');
  }
  if (tags.includes('python')) {
    add(candidateSkillIds, 'backend-development');
    add(candidateStackPacks, 'python');
  }
  if (tags.includes('testing')) add(candidateSkillIds, 'tdd-workflow');
  if (tags.includes('review')) add(candidateSkillIds, 'code-review');
  if (tags.includes('planning')) add(candidateSkillIds, 'brainstorming');
  if (tags.includes('mcp')) add(candidateSkillIds, 'mcp-management');
  if (tags.includes('release')) {
    add(candidateRolePacks, 'release-devex');
    add(candidateStackPacks, 'release');
  }
  if (tags.includes('auth')) add(candidateSkillIds, 'better-auth');
  if (tags.includes('docs')) add(candidateSkillIds, 'doc-coauthoring');
  if (tags.includes('debugging')) add(candidateSkillIds, 'systematic-debugging');

  if (/architect|架构|boundary|module/i.test(corpus)) add(candidateRolePacks, 'solution-architect');
  if (/design|视觉|布局|交互/i.test(corpus)) add(candidateRolePacks, 'ui-designer');
  if (/prd|需求|优先级|scope/i.test(corpus)) add(candidateRolePacks, 'product-manager');
  if (/qa|验收|回归|测试矩阵/i.test(corpus)) add(candidateRolePacks, 'qa-strategist');

  return { candidateSkillIds, candidateRolePacks, candidateStackPacks };
}

function fieldConfidence(value) {
  const length = normalizeText(value).length;
  if (length >= 80) return 'high';
  if (length >= 20) return 'medium';
  if (length > 0) return 'low';
  return 'none';
}

function extractProblemSolutionFromTranscript(file) {
  const events = parseTranscript(file);
  const userTexts = [];
  const assistantTexts = [];
  const toolErrors = [];
  const toolSuccesses = [];
  let semanticEventCount = 0;

  for (const event of events) {
    if (event.type === 'user') {
      const text = extractUserText(event);
      if (text) {
        userTexts.push(text);
        semanticEventCount += 1;
      }
      for (const entry of extractToolResultEntries(event)) {
        if (entry.isError || /^Error:/i.test(entry.content) || /exit code \d+/i.test(entry.content)) {
          toolErrors.push(entry.content);
        } else if (entry.content) {
          toolSuccesses.push(entry.content);
        }
      }
      if (typeof event.toolUseResult === 'string' && event.toolUseResult) {
        toolErrors.push(normalizeText(event.toolUseResult));
      }
    }

    if (event.type === 'assistant') {
      const text = extractAssistantText(event);
      if (text) {
        assistantTexts.push(text);
        semanticEventCount += 1;
      }
    }
  }

  const problem = inferProblem(userTexts);
  const rootCause = inferRootCause(assistantTexts, toolErrors);
  const chosenFix = inferChosenFix(assistantTexts);
  const verification = inferVerification(assistantTexts, toolSuccesses);
  const corpus = normalizeText([problem, rootCause, chosenFix, verification, ...userTexts.slice(0, 3), ...assistantTexts.slice(-3), ...toolErrors.slice(-2)].join(' '));
  const reuseTags = inferReuseTags(corpus);
  const candidates = inferCandidates(reuseTags, corpus);
  const completedFieldCount = [problem, rootCause, chosenFix, verification].filter(value => normalizeText(value)).length;
  const noSemanticMessages = semanticEventCount === 0;
  const status = completedFieldCount >= 3 ? 'reviewed' : 'scaffold';

  return {
    problem,
    rootCause,
    chosenFix,
    verification,
    reuseTags,
    status,
    extraction: {
      mode: noSemanticMessages ? 'heuristic-v2-empty' : 'heuristic-v2',
      completedFieldCount,
      noSemanticMessages,
      confidence: {
        problem: fieldConfidence(problem),
        rootCause: fieldConfidence(rootCause),
        chosenFix: fieldConfidence(chosenFix),
        verification: fieldConfidence(verification)
      },
      signals: {
        semanticEvents: semanticEventCount,
        userMessages: userTexts.length,
        assistantMessages: assistantTexts.length,
        toolErrors: toolErrors.length,
        toolSuccesses: toolSuccesses.length
      }
    },
    ...candidates
  };
}

module.exports = {
  extractProblemSolutionFromTranscript
};
