const fs = require('fs');
const path = require('path');

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function incrementCount(map, key) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function requiredFieldsPresent(record, fields) {
  return (fields || []).every(field => normalizeText(record[field]).length > 0);
}

function loadPromotionRules(repoRoot) {
  return readJson(path.join(repoRoot, 'core', 'learning-promotion-rules.json')) || {
    targets: {},
    decisionOrder: ['stack-pack', 'role-pack', 'learned-skill', 'instinct', 'memory']
  };
}

function loadProblemSolutionRecords(dir, options = {}) {
  const includeScaffold = !!options.includeScaffold;
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const fullPath = path.join(dir, file);
      const data = readJson(fullPath);
      return data ? { ...data, _file: fullPath } : null;
    })
    .filter(Boolean)
    .filter(record => includeScaffold || (record.status || 'scaffold') !== 'scaffold');
}

function buildRecordStats(records) {
  const stackCounts = new Map();
  const roleCounts = new Map();
  const skillCounts = new Map();
  const tagCounts = new Map();
  const fixCounts = new Map();

  for (const record of records) {
    for (const item of record.candidateStackPacks || []) incrementCount(stackCounts, item);
    for (const item of record.candidateRolePacks || []) incrementCount(roleCounts, item);
    for (const item of record.candidateSkillIds || []) incrementCount(skillCounts, item);
    for (const item of record.reuseTags || []) incrementCount(tagCounts, item);
    incrementCount(fixCounts, normalizeText(record.chosenFix));
  }

  return { stackCounts, roleCounts, skillCounts, tagCounts, fixCounts };
}

function suggestTarget(record, stats, rules) {
  const targets = rules.targets || {};
  const stackReq = targets['stack-pack']?.requires || {};
  const roleReq = targets['role-pack']?.requires || {};
  const skillReq = targets['learned-skill']?.requires || {};
  const instinctReq = targets.instinct?.requires || {};

  for (const stack of record.candidateStackPacks || []) {
    const count = stats.stackCounts.get(stack) || 0;
    if (count >= Number(stackReq.minOccurrences || 2)) {
      return { target: 'stack-pack', confidence: 'high', reason: `Stack pack '${stack}' appears in ${count} reviewed records.` };
    }
  }

  for (const role of record.candidateRolePacks || []) {
    const count = stats.roleCounts.get(role) || 0;
    if (count >= Number(roleReq.minOccurrences || 2)) {
      return { target: 'role-pack', confidence: 'high', reason: `Role pack '${role}' appears in ${count} reviewed records.` };
    }
  }

  if (requiredFieldsPresent(record, skillReq.mustInclude)) {
    for (const skill of record.candidateSkillIds || []) {
      const count = stats.skillCounts.get(skill) || 0;
      if (count >= Number(skillReq.minOccurrences || 2)) {
        return { target: 'learned-skill', confidence: 'medium', reason: `Skill '${skill}' appears in ${count} reviewed records with required fields present.` };
      }
    }
  }

  for (const tag of record.reuseTags || []) {
    const count = stats.tagCounts.get(tag) || 0;
    if (count >= Number(instinctReq.minOccurrences || 3)) {
      return { target: 'instinct', confidence: 'medium', reason: `Reuse tag '${tag}' appears in ${count} reviewed records.` };
    }
  }

  const normalizedFix = normalizeText(record.chosenFix);
  const fixCount = normalizedFix ? (stats.fixCounts.get(normalizedFix) || 0) : 0;
  if (fixCount >= Number(instinctReq.minOccurrences || 3)) {
    return { target: 'instinct', confidence: 'medium', reason: `A similar chosen fix appears in ${fixCount} reviewed records.` };
  }

  return { target: 'memory', confidence: 'default', reason: 'Not enough repeated evidence yet; keep as durable memory.' };
}

function createSuggestions(records, repoRoot) {
  const rules = loadPromotionRules(repoRoot);
  const stats = buildRecordStats(records);
  return records.map(record => {
    const suggestion = suggestTarget(record, stats, rules);
    return {
      file: record._file,
      title: path.basename(record._file, '.json'),
      currentTarget: record.upgradeTarget || 'memory',
      suggestedTarget: suggestion.target,
      confidence: suggestion.confidence,
      reason: suggestion.reason,
      candidateSkillIds: record.candidateSkillIds || [],
      candidateRolePacks: record.candidateRolePacks || [],
      candidateStackPacks: record.candidateStackPacks || []
    };
  });
}

function renderPromotionMarkdown({ workspaceSlug, reviewedCount, suggestions, createdAt }) {
  const lines = [
    `# Promotion Suggestions (${createdAt.slice(0, 10)})`,
    '',
    `- Workspace: ${workspaceSlug}`,
    `- Reviewed records: ${reviewedCount}`,
    `- Generated at: ${createdAt}`,
    ''
  ];

  if (!suggestions.length) {
    lines.push('No reviewed problem-solution records available.');
    return lines.join('\n');
  }

  for (const item of suggestions) {
    lines.push(`## ${item.title}`);
    lines.push(`- Current target: ${item.currentTarget}`);
    lines.push(`- Suggested target: ${item.suggestedTarget}`);
    lines.push(`- Confidence: ${item.confidence}`);
    lines.push(`- Reason: ${item.reason}`);
    lines.push(`- File: ${item.file}`);
    if (item.candidateRolePacks?.length) lines.push(`- Candidate role-packs: ${item.candidateRolePacks.join(', ')}`);
    if (item.candidateStackPacks?.length) lines.push(`- Candidate stack-packs: ${item.candidateStackPacks.join(', ')}`);
    if (item.candidateSkillIds?.length) lines.push(`- Candidate skills: ${item.candidateSkillIds.join(', ')}`);
    lines.push('');
  }

  return lines.join('\n');
}

function buildReviewQueue(records) {
  const scaffolds = records.filter(record => (record.status || 'scaffold') === 'scaffold');
  const reviewed = records.filter(record => (record.status || 'scaffold') !== 'scaffold');
  return {
    scaffolds: scaffolds.length,
    reviewed: reviewed.length,
    latestScaffolds: scaffolds
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .slice(0, 10)
      .map(record => ({
        title: path.basename(record._file, '.json'),
        file: record._file,
        createdAt: record.createdAt || null,
        transcriptPath: record.transcriptPath || null,
        userMessageCount: record.userMessageCount || null
      }))
  };
}

function uniqueSorted(values) {
  const list = values == null
    ? []
    : Array.isArray(values)
      ? values
      : Array.from(values);
  return Array.from(new Set(list.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
}

function normalizeHeading(value) {
  return String(value || '')
    .replace(/^#+\s*/, '')
    .replace(/^\d+(?:\.\d+)*\s*/, '')
    .toLowerCase()
    .replace(/[():/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readMarkdownHeadings(file) {
  if (!file || !fs.existsSync(file)) return [];
  const text = fs.readFileSync(file, 'utf8');
  return text
    .split(/\r?\n/)
    .map((line, index) => {
      const match = line.match(/^(#{2,6})\s+(.+?)\s*$/);
      if (!match) return null;
      return {
        line: index + 1,
        level: match[1].length,
        raw: match[2],
        normalized: normalizeHeading(match[2])
      };
    })
    .filter(Boolean);
}

function findHeadingByAliases(headings, aliases) {
  const normalizedAliases = (aliases || []).map(normalizeHeading).filter(Boolean);
  if (!normalizedAliases.length) return null;
  return headings.find(item => normalizedAliases.includes(item.normalized)) || null;
}

function resolveSectionPlacement(headings, config) {
  const existing = findHeadingByAliases(headings, config.aliases);
  if (existing) {
    return {
      resolvedHeading: existing.raw,
      headingMatchType: 'exact',
      insertionHint: `追加到现有 \`${'#'.repeat(existing.level)} ${existing.raw}\` 后（约第 ${existing.line} 行附近）`
    };
  }

  const after = findHeadingByAliases(headings, config.preferAfter);
  if (after) {
    return {
      resolvedHeading: null,
      headingMatchType: 'missing',
      insertionHint: `新增 \`## ${config.heading}\`，建议放在 \`${'#'.repeat(after.level)} ${after.raw}\` 后`
    };
  }

  const before = findHeadingByAliases(headings, config.preferBefore);
  if (before) {
    return {
      resolvedHeading: null,
      headingMatchType: 'missing',
      insertionHint: `新增 \`## ${config.heading}\`，建议放在 \`${'#'.repeat(before.level)} ${before.raw}\` 前`
    };
  }

  return {
    resolvedHeading: null,
    headingMatchType: 'missing',
    insertionHint: config.fallbackHint || `目标文件缺少对应 section，建议新增 \`## ${config.heading}\``
  };
}

function summarizeText(value, maxLen = 160) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen - 1)}…`;
}

function toSentence(value) {
  const text = summarizeText(value, 220);
  if (!text) return '';
  return text.replace(/^[\-\d.\s]+/, '').trim();
}

function takeTop(values, limit = 5) {
  return uniqueSorted(values).slice(0, limit);
}

function formatBullets(values, fallback = '- 暂无足够证据') {
  if (!values || !values.length) return [fallback];
  return values.map(value => `- ${value}`);
}

function mergeUniqueBullets(...groups) {
  return takeTop(groups.flat().filter(Boolean), 6);
}

const ROLE_COLLABORATION_FOCUS = {
  developer: '实现边界、验证路径和回归范围',
  'product-manager': '目标、scope、acceptance criteria 和优先级',
  'ui-designer': '状态覆盖、层级、交互反馈和 handoff note',
  'solution-architect': '边界、接口、演进路径和 tradeoff',
  'qa-strategist': '风险路径、测试层次和回归范围',
  'release-devex': 'release gate、构建入口、版本线和诊断信息'
};

const STACK_COLLABORATION_FOCUS = {
  frontend: '状态覆盖、浏览器验证与交付说明',
  java: 'service boundary、transaction 和 verification',
  python: 'async path、validation、后台任务与 verification',
  product: '目标、scope、验收标准和 rollout 节奏',
  design: '层级、组件一致性、交互反馈和 visual QA',
  architecture: '边界、接口、ownership 和演进约束',
  qa: '测试层次、回归范围和 risk matrix',
  release: 'artifact、release gate 和 diagnostics',
  ecommerce: '转化路径、异常订单流和运营可用性',
  'video-creation': '内容结构、素材处理和交付格式',
  'image-generation': '视觉方向、prompt 约束和输出一致性',
  'workflow-automation': '触发链路、容错、observability 和 rollback'
};

const DOMAIN_OUTPUT_FOCUS = {
  ecommerce: [
    '输出应覆盖商品、购物车、结算、订单和售后等关键转化路径。',
    '交付物要明确运营入口、异常状态和用户可见反馈。'
  ],
  'video-creation': [
    '输出应覆盖脚本、镜头结构、素材处理和最终交付格式。',
    '交付物要明确时长、节奏、字幕/封面和发布要求。'
  ],
  'image-generation': [
    '输出应覆盖视觉方向、prompt 约束、素材来源和最终图像规格。',
    '交付物要明确尺寸、风格一致性和可复用素材规范。'
  ],
  'workflow-automation': [
    '输出应覆盖触发条件、执行步骤、失败处理和回滚路径。',
    '交付物要明确 observability、告警、幂等与人工接管点。'
  ]
};

const DOMAIN_VALIDATION_FOCUS = {
  ecommerce: [
    '验证关键转化链路、价格/库存一致性与异常订单流。',
    '验证登录态、支付前后状态和运营可用性。'
  ],
  'video-creation': [
    '验证素材可用性、导出格式、时长与画面/音频同步。',
    '验证发布平台所需的封面、字幕和元数据是否齐全。'
  ],
  'image-generation': [
    '验证最终图像尺寸、风格一致性、文本准确性和版权风险。',
    '验证 prompt、素材和导出规格是否可复用。'
  ],
  'workflow-automation': [
    '验证触发链路、幂等行为、失败重试和回滚能力。',
    '验证日志、告警和人工接管路径是否可用。'
  ]
};

const DOMAIN_COLLABORATION_FOCUS = {
  ecommerce: '把商品、营销、履约和运营约束转成可验证的交付标准。',
  'video-creation': '把内容目标、素材要求和发布规格转成统一制作流程。',
  'image-generation': '把视觉方向、prompt 约束和输出规格对齐给设计与实现方。',
  'workflow-automation': '把 trigger、状态流转、容错和 observability 对齐给实现与运维。'
};

const SKILL_REASON_MAP = {
  brainstorming: '用于先做问题建模和范围澄清。',
  'frontend-design': '用于页面结构、组件实现和可落地前端方案。',
  aesthetic: '用于提升视觉层级、节奏和界面完成度。',
  'browser-use': '用于真实浏览器、真实 profile 和已登录流程验证。',
  'webapp-testing': '用于 UI 路径验证、状态检查和 browser-based regression。',
  'code-review': '用于在完成前做主审查与风险复核。',
  'backend-development': '用于服务实现、接口设计和后端约束落地。',
  'better-auth': '用于认证、session 和权限相关实现。',
  'systematic-debugging': '用于 bug / failure 的系统化排查。',
  'doc-coauthoring': '用于把需求、brief 和决策写成可协作文档。',
  'internal-comms': '用于内部沟通稿、状态同步和交付说明。',
  'mcp-management': '用于选择、接入和管理外部 MCP 能力。',
  devops: '用于构建、发布、部署和诊断链路治理。',
  'deployment-patterns': '用于 release / deploy 结构和回滚策略。',
  'changelog-generator': '用于 release notes 和用户可见变更摘要。',
  'ui-styling': '用于样式实现、组件库落地和 design token 收口。',
  'web-design-guidelines': '用于 UI 规范核对和设计一致性审查。',
  'self-improving-agent': '用于把可复用经验沉淀进 Forge learning。',
  'tdd-workflow': '用于 testing / TDD 主路径。',
  'test-driven-development': '用于更窄的 TDD 方法约束。',
  'python-testing': '用于 Python 栈的测试与验证。',
  'springboot-tdd': '用于 Spring Boot 栈的测试与验证。',
  'django-tdd': '用于 Django 栈的测试与验证。',
  'golang-testing': '用于 Go 栈的测试与验证。'
};

function describeSkillForDraft(skillId) {
  return SKILL_REASON_MAP[skillId] || '用于补充该场景下重复出现的稳定能力。';
}

function formatSkillDraftLines(skillIds, fallbackLabel, limit = 6) {
  const list = takeTop(skillIds, limit);
  if (!list.length) return [`- ${fallbackLabel}`];
  return list.map(skill => `- \`${skill}\`：${describeSkillForDraft(skill)}`);
}

function describeRoleCollaboration(targetRoleId, collaboratorId) {
  const roleFocus = ROLE_COLLABORATION_FOCUS[targetRoleId] || '边界、输入和验收方式';
  const stackFocus = STACK_COLLABORATION_FOCUS[collaboratorId];
  if (stackFocus) {
    return `与 \`${collaboratorId}\` 结合时，把 ${stackFocus} 明确成可执行约束，而不是只停留在口头要求。`;
  }
  return `与 \`${collaboratorId}\` 协作时，优先把 ${roleFocus} 对齐清楚，再进入具体实现。`;
}

function describeStackCollaboration(targetStackId, collaboratorId) {
  const stackFocus = STACK_COLLABORATION_FOCUS[targetStackId] || '交付边界和验证路径';
  const roleFocus = ROLE_COLLABORATION_FOCUS[collaboratorId];
  if (roleFocus) {
    return `与 \`${collaboratorId}\` 配合时，把 ${stackFocus} 明确成这个角色可执行、可验证的标准。`;
  }
  return `对 \`${collaboratorId}\` 相关场景保持一致的 ${stackFocus} 规则。`;
}

function isDomainStack(targetStackId) {
  return Object.prototype.hasOwnProperty.call(DOMAIN_OUTPUT_FOCUS, targetStackId);
}

function describeDomainCollaboration(targetStackId, collaboratorId) {
  const focus = DOMAIN_COLLABORATION_FOCUS[targetStackId] || '把领域约束转成可执行的交付标准。';
  const roleFocus = ROLE_COLLABORATION_FOCUS[collaboratorId];
  if (roleFocus) {
    return `与 \`${collaboratorId}\` 协作时，优先围绕 ${focus}`;
  }
  return `对 \`${collaboratorId}\` 相关场景，保持 ${focus}`;
}

function extractPrimaryPackCandidates(item, targetType) {
  const list = targetType === 'role-pack'
    ? (item.candidateRolePacks || [])
    : (item.candidateStackPacks || []);
  return uniqueSorted(list);
}

function getPackFile(repoRoot, targetType, packId) {
  const rootDir = targetType === 'role-pack' ? 'roles' : 'stacks';
  return path.join(repoRoot, rootDir, `${packId}.md`);
}

function buildProposalEntry(packId, targetType, packFile) {
  return {
    targetType,
    targetId: packId,
    targetFile: packFile,
    exists: fs.existsSync(packFile),
    evidenceCount: 0,
    sourceRecords: [],
    candidateSkillIds: new Set(),
    reuseTags: new Set(),
    candidateRolePacks: new Set(),
    candidateStackPacks: new Set(),
    problemSummaries: [],
    rootCauseSummaries: [],
    chosenFixSummaries: [],
    verificationSummaries: []
  };
}

function finalizeProposalEntry(entry) {
  return {
    targetType: entry.targetType,
    targetId: entry.targetId,
    targetFile: entry.targetFile,
    exists: entry.exists,
    evidenceCount: entry.evidenceCount,
    sourceRecords: entry.sourceRecords,
    candidateSkillIds: uniqueSorted(Array.from(entry.candidateSkillIds)),
    reuseTags: uniqueSorted(Array.from(entry.reuseTags)),
    candidateRolePacks: uniqueSorted(Array.from(entry.candidateRolePacks)),
    candidateStackPacks: uniqueSorted(Array.from(entry.candidateStackPacks)),
    problemSummaries: uniqueSorted(entry.problemSummaries),
    rootCauseSummaries: uniqueSorted(entry.rootCauseSummaries),
    chosenFixSummaries: uniqueSorted(entry.chosenFixSummaries),
    verificationSummaries: uniqueSorted(entry.verificationSummaries),
    draftSections: buildDraftSections(entry)
  };
}

function buildRoleDraftSections(entry) {
  const headings = readMarkdownHeadings(entry.targetFile);
  const candidateSkillIds = Array.from(entry.candidateSkillIds || []);
  const candidateRolePacks = Array.from(entry.candidateRolePacks || []);
  const candidateStackPacks = Array.from(entry.candidateStackPacks || []);
  const defaultSkills = formatSkillDraftLines(candidateSkillIds, '暂无足够证据新增 Default Skills', 6);
  const triggerCues = mergeUniqueBullets(
    entry.problemSummaries.map(value => `当任务出现：${toSentence(value)}`),
    entry.rootCauseSummaries.map(value => `当反复出现：${toSentence(value)}`)
  );
  const validationChecklist = mergeUniqueBullets(
    entry.verificationSummaries.map(value => `是否验证：${toSentence(value)}`),
    entry.chosenFixSummaries.map(value => `是否覆盖类似修复路径：${toSentence(value)}`)
  );
  const collaborationContract = mergeUniqueBullets(
    candidateStackPacks.map(value => describeRoleCollaboration(entry.targetId, value)),
    candidateRolePacks
      .filter(value => value !== entry.targetId)
      .map(value => describeRoleCollaboration(entry.targetId, value))
  );

  const sectionConfigs = [
    {
      heading: 'Default Skills',
      aliases: ['Default Skills'],
      preferAfter: ['Default Operating Mode', 'Mission'],
      preferBefore: ['Default Playbooks', 'Browser Automation Default', 'Typical Outputs'],
      fallbackHint: '目标文件缺少 `## Default Skills`，建议放在 `## Default Operating Mode` 后'
    },
    {
      heading: 'Trigger Cues',
      aliases: ['Trigger Cues', 'Auto-Trigger Guidance'],
      preferAfter: ['Typical Outputs', 'Browser Automation Default'],
      preferBefore: ['Validation Checklist', 'Do Not'],
      fallbackHint: '目标文件缺少 `## Trigger Cues`，建议放在 `## Typical Outputs` 后'
    },
    {
      heading: 'Validation Checklist',
      aliases: ['Validation Checklist', 'Delivery Checklist', 'Verification Before Completion'],
      preferAfter: ['Trigger Cues', 'Typical Outputs'],
      preferBefore: ['Collaboration Contract', 'Do Not'],
      fallbackHint: '目标文件缺少 `## Validation Checklist`，建议放在 `## Trigger Cues` 后'
    },
    {
      heading: 'Collaboration Contract',
      aliases: ['Collaboration Contract'],
      preferAfter: ['Validation Checklist', 'Trigger Cues'],
      preferBefore: ['Do Not', 'Role-to-Stack Mapping'],
      fallbackHint: '目标文件缺少 `## Collaboration Contract`，建议放在 `## Validation Checklist` 后'
    }
  ];

  return {
    targetKindLabel: 'role-pack',
    sections: [
      {
        heading: 'Default Skills',
        rationale: '下面这些 skill 在近期记录里重复出现，适合补进默认组合。',
        ...resolveSectionPlacement(headings, sectionConfigs[0]),
        draftLines: defaultSkills
      },
      {
        heading: 'Trigger Cues',
        rationale: '这些触发信号来自近期重复问题和根因，适合补进自动触发说明。',
        ...resolveSectionPlacement(headings, sectionConfigs[1]),
        draftLines: formatBullets(triggerCues)
      },
      {
        heading: 'Validation Checklist',
        rationale: '这些验证项来自近期修复和验证记录，适合补进完成定义。',
        ...resolveSectionPlacement(headings, sectionConfigs[2]),
        draftLines: formatBullets(validationChecklist)
      },
      {
        heading: 'Collaboration Contract',
        rationale: '这些协同建议来自近期 role/stack 组合使用痕迹。',
        ...resolveSectionPlacement(headings, sectionConfigs[3]),
        draftLines: formatBullets(collaborationContract)
      }
    ]
  };
}

function buildStackDraftSections(entry) {
  const headings = readMarkdownHeadings(entry.targetFile);
  const candidateSkillIds = Array.from(entry.candidateSkillIds || []);
  const candidateRolePacks = Array.from(entry.candidateRolePacks || []);
  const reuseTags = Array.from(entry.reuseTags || []);
  const domainMode = isDomainStack(entry.targetId);
  const preferredSkills = formatSkillDraftLines(candidateSkillIds, '暂无足够证据新增 Preferred Skills', 8);
  const outputShape = mergeUniqueBullets(
    entry.problemSummaries.map(value => `需要覆盖：${toSentence(value)}`),
    entry.chosenFixSummaries.map(value => `应能支持：${toSentence(value)}`),
    domainMode ? DOMAIN_OUTPUT_FOCUS[entry.targetId] : []
  );
  const validationChecklist = mergeUniqueBullets(
    entry.verificationSummaries.map(value => `是否验证：${toSentence(value)}`),
    entry.rootCauseSummaries.map(value => `是否避免再次出现：${toSentence(value)}`),
    domainMode ? DOMAIN_VALIDATION_FOCUS[entry.targetId] : []
  );
  const collaborationContract = mergeUniqueBullets(
    candidateRolePacks.map(value => domainMode
      ? describeDomainCollaboration(entry.targetId, value)
      : describeStackCollaboration(entry.targetId, value)),
    reuseTags.map(value => `对 \`${value}\` 相关场景保持一致的 ${(domainMode ? DOMAIN_COLLABORATION_FOCUS[entry.targetId] : STACK_COLLABORATION_FOCUS[entry.targetId]) || '交付规则'}。`)
  );

  const sectionConfigs = [
    {
      heading: 'Preferred Skills',
      aliases: ['Preferred Skills', 'Default Skills'],
      preferAfter: ['Defaults', 'Purpose', 'Scope'],
      preferBefore: ['Recommended MCP', 'Recommended MCP / Tools', 'Output Shape'],
      fallbackHint: '目标文件缺少 `## Preferred Skills`，建议放在 `## Defaults` 或 `## Purpose` 后'
    },
    {
      heading: 'Output Shape',
      aliases: ['Output Shape', 'Typical Outputs'],
      preferAfter: ['Preferred Skills', 'Recommended MCP', 'Recommended MCP / Tools'],
      preferBefore: ['Validation Checklist', 'Delivery Checklist', 'Collaboration Contract'],
      fallbackHint: '目标文件缺少 `## Output Shape`，建议放在 `## Preferred Skills` 或 `## Recommended MCP` 后'
    },
    {
      heading: 'Validation Checklist',
      aliases: ['Validation Checklist', 'Delivery Checklist', 'Verification Before Completion'],
      preferAfter: ['Output Shape', 'Recommended MCP', 'Recommended MCP / Tools'],
      preferBefore: ['Collaboration Contract'],
      fallbackHint: '目标文件缺少 `## Validation Checklist`，建议放在 `## Output Shape` 后'
    },
    {
      heading: 'Collaboration Contract',
      aliases: ['Collaboration Contract'],
      preferAfter: ['Validation Checklist', 'Delivery Checklist'],
      preferBefore: [],
      fallbackHint: '目标文件缺少 `## Collaboration Contract`，建议放在 `## Validation Checklist` 后'
    }
  ];

  return {
    targetKindLabel: 'stack-pack',
    sections: [
      {
        heading: 'Preferred Skills',
        rationale: '这些 skill 在该 stack 上重复出现，适合进入优先工具组合。',
        ...resolveSectionPlacement(headings, sectionConfigs[0]),
        draftLines: preferredSkills
      },
      {
        heading: 'Output Shape',
        rationale: '这些输出模式来自近期实际问题与修复记录。',
        ...resolveSectionPlacement(headings, sectionConfigs[1]),
        draftLines: formatBullets(outputShape)
      },
      {
        heading: 'Validation Checklist',
        rationale: '这些验证项来自近期验证和根因记录。',
        ...resolveSectionPlacement(headings, sectionConfigs[2]),
        draftLines: formatBullets(validationChecklist)
      },
      {
        heading: 'Collaboration Contract',
        rationale: '这些协同建议来自近期 role/stack 组合使用痕迹。',
        ...resolveSectionPlacement(headings, sectionConfigs[3]),
        draftLines: formatBullets(collaborationContract)
      }
    ]
  };
}

function buildDraftSections(entry) {
  return entry.targetType === 'role-pack'
    ? buildRoleDraftSections(entry)
    : buildStackDraftSections(entry);
}

function createUpdateProposals(records, suggestions, repoRoot) {
  const byFile = new Map(records.map(record => [record._file, record]));
  const proposals = new Map();

  for (const item of suggestions) {
    if (!['role-pack', 'stack-pack'].includes(item.suggestedTarget)) continue;
    const record = byFile.get(item.file);
    if (!record) continue;

    const packIds = extractPrimaryPackCandidates(item, item.suggestedTarget);
    for (const packId of packIds) {
      const key = `${item.suggestedTarget}:${packId}`;
      if (!proposals.has(key)) {
        proposals.set(key, buildProposalEntry(
          packId,
          item.suggestedTarget,
          getPackFile(repoRoot, item.suggestedTarget, packId)
        ));
      }

      const entry = proposals.get(key);
      entry.evidenceCount += 1;
      entry.sourceRecords.push({
        title: item.title,
        file: item.file,
        reason: item.reason,
        confidence: item.confidence
      });

      for (const skillId of record.candidateSkillIds || []) entry.candidateSkillIds.add(skillId);
      for (const tag of record.reuseTags || []) entry.reuseTags.add(tag);
      for (const roleId of record.candidateRolePacks || []) entry.candidateRolePacks.add(roleId);
      for (const stackId of record.candidateStackPacks || []) entry.candidateStackPacks.add(stackId);

      const problem = summarizeText(record.problem);
      const rootCause = summarizeText(record.rootCause);
      const chosenFix = summarizeText(record.chosenFix);
      const verification = summarizeText(record.verification);

      if (problem) entry.problemSummaries.push(problem);
      if (rootCause) entry.rootCauseSummaries.push(rootCause);
      if (chosenFix) entry.chosenFixSummaries.push(chosenFix);
      if (verification) entry.verificationSummaries.push(verification);
    }
  }

  return Array.from(proposals.values())
    .map(finalizeProposalEntry)
    .sort((a, b) => {
      const diff = b.evidenceCount - a.evidenceCount;
      if (diff !== 0) return diff;
      return `${a.targetType}:${a.targetId}`.localeCompare(`${b.targetType}:${b.targetId}`);
    });
}

function renderUpdateProposalsMarkdown({ workspaceSlug, proposals, createdAt }) {
  const lines = [
    `# Role/Stack Update Proposals (${createdAt.slice(0, 10)})`,
    '',
    `- Workspace: ${workspaceSlug}`,
    `- Generated at: ${createdAt}`,
    `- Proposal count: ${proposals.length}`,
    ''
  ];

  if (!proposals.length) {
    lines.push('No role-pack or stack-pack update proposals generated from reviewed records.');
    return lines.join('\n');
  }

  for (const proposal of proposals) {
    lines.push(`## ${proposal.targetType}: ${proposal.targetId}`);
    lines.push(`- Target file: ${proposal.targetFile}`);
    lines.push(`- Existing file: ${proposal.exists ? 'yes' : 'no'}`);
    lines.push(`- Evidence count: ${proposal.evidenceCount}`);
    if (proposal.candidateSkillIds.length) lines.push(`- Candidate skills: ${proposal.candidateSkillIds.join(', ')}`);
    if (proposal.reuseTags.length) lines.push(`- Reuse tags: ${proposal.reuseTags.join(', ')}`);
    if (proposal.candidateRolePacks.length) lines.push(`- Candidate role-packs: ${proposal.candidateRolePacks.join(', ')}`);
    if (proposal.candidateStackPacks.length) lines.push(`- Candidate stack-packs: ${proposal.candidateStackPacks.join(', ')}`);
    lines.push('');

    lines.push('### Suggested Additions');
    lines.push('');
    if (proposal.problemSummaries.length) {
      lines.push('- Problem patterns:');
      for (const value of proposal.problemSummaries.slice(0, 5)) lines.push(`  - ${value}`);
    }
    if (proposal.rootCauseSummaries.length) {
      lines.push('- Root cause patterns:');
      for (const value of proposal.rootCauseSummaries.slice(0, 5)) lines.push(`  - ${value}`);
    }
    if (proposal.chosenFixSummaries.length) {
      lines.push('- Fix patterns:');
      for (const value of proposal.chosenFixSummaries.slice(0, 5)) lines.push(`  - ${value}`);
    }
    if (proposal.verificationSummaries.length) {
      lines.push('- Verification patterns:');
      for (const value of proposal.verificationSummaries.slice(0, 5)) lines.push(`  - ${value}`);
    }
    if (!proposal.problemSummaries.length && !proposal.rootCauseSummaries.length && !proposal.chosenFixSummaries.length && !proposal.verificationSummaries.length) {
      lines.push('- No structured problem/fix/verification summaries available yet.');
    }
    lines.push('');

    lines.push('### Patch Draft');
    lines.push('');
    for (const section of proposal.draftSections.sections) {
      lines.push(`#### ${section.heading}`);
      lines.push(`- 用途：${section.rationale}`);
      if (section.headingMatchType === 'exact' && section.resolvedHeading) {
        lines.push(`- 目标 section：\`${section.resolvedHeading}\``);
      } else if (section.headingMatchType === 'missing') {
        lines.push('- 目标 section：当前文件缺少同类标题，以下是新增建议。');
      }
      lines.push(`- 建议位置：${section.insertionHint}`);
      lines.push('');
      lines.push('```md');
      for (const line of section.draftLines) lines.push(line);
      lines.push('```');
      lines.push('');
    }

    lines.push('### Source Records');
    lines.push('');
    for (const item of proposal.sourceRecords.slice(0, 10)) {
      lines.push(`- ${item.title}`);
      lines.push(`  - Confidence: ${item.confidence}`);
      lines.push(`  - Reason: ${item.reason}`);
      lines.push(`  - File: ${item.file}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

module.exports = {
  loadPromotionRules,
  loadProblemSolutionRecords,
  createSuggestions,
  renderPromotionMarkdown,
  buildReviewQueue,
  createUpdateProposals,
  renderUpdateProposalsMarkdown
};
