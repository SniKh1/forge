import { forgeSkillOptions } from './generated-catalog';
import { forgeDeviceContext } from './generated-device-context';
import { forgeDomainMcpMatrix } from './generated-domain-mcp';
import { forgeRoleMcpMatrix } from './generated-role-mcp';
import type {
  ActionResult,
  AppStatePayload,
  BootstrapResultData,
  Client,
  DetectionItem,
  SupportItem,
} from './lib/backend';
import {
  clientMetas,
  getRoleDefinition,
  getRoleDefinitions,
  getStackDefinition,
  roleDefinitions,
  secretLabels,
  stackDefinitions,
  type ExtensionView,
  type PersonaDraft,
  type RoleId,
  type SetupLayer,
  type StackId,
} from './platform-data';

type DomainStackId = keyof typeof forgeDomainMcpMatrix.stacks;

export type ClientCardVM = {
  id: Client;
  label: string;
  eyebrow: string;
  tagline: string;
  tone: string;
  detected: boolean;
  configured: boolean;
  healthy: boolean;
  limited?: boolean;
  supportNote: string;
  installedMcpCount: number;
  installedSkillCount: number;
};

export type PlatformHeroVM = {
  statusTone: 'good' | 'warn' | 'blocked' | 'limited';
  title: string;
  summary: string;
  primaryAction: 'bootstrap' | 'install' | 'repair' | 'limited';
  primaryLabel: string;
  secondaryAction: 'verify' | 'requirements';
  secondaryLabel: string;
};

export type RequirementVM = {
  id: string;
  tone: 'warn' | 'blocked' | 'limited';
  title: string;
  detail: string;
  nextStep: string;
  actionLabel?: string;
  actionTarget?: 'secrets' | 'settings' | 'bootstrap' | 'toolbox';
};

export type ActionFeedbackVM = {
  tone: 'success' | 'warn' | 'error';
  title: string;
  impact: string;
  nextStep: string;
  installedSummary?: string;
  raw: string;
  details: string[];
  warnings: string[];
};

export type PlatformActionKind = 'install' | 'repair' | 'verify' | 'bootstrap';
export type WorkbenchView = 'persona' | 'connections' | 'extensions';

export type McpOptionVM = {
  id: string;
  label: string;
  description: string;
  selected: boolean;
  recommended: boolean;
  builtin: boolean;
  requiresSecret: boolean;
};

export type WorkbenchTabVM = {
  id: WorkbenchView;
  label: string;
  meta: string;
};

export type ExtensionMetaVM = {
  title: string;
  description: string;
  items: string[];
  enabled: boolean;
  suggestedItems: string[];
};

export type ApplyScopeVM = {
  writeItems: string[];
  skipItems: string[];
  blockerItems: string[];
  targetItems: Array<{ label: string; value: string }>;
};

export type RequirementActionVM = {
  label: string;
  target: NonNullable<RequirementVM['actionTarget']>;
};

export type ActionMenuItemVM = {
  key: PlatformActionKind;
  title: string;
  detail: string;
  disabled: boolean;
};

export type RoleOptionVM = {
  id: RoleId;
  title: string;
  summary: string;
  fit: string;
  recommendedStacks: string[];
  recommendedSkillCount: number;
  previewSkills: string[];
  selected: boolean;
};

export type StackOptionVM = {
  id: StackId;
  title: string;
  summary: string;
  selected: boolean;
  recommended: boolean;
};

export type SkillBadgeVM = {
  id: string;
  title: string;
  reason: string;
};

export type SkillCompositionVM = {
  selectedSkillIds: string[];
  primarySkills: SkillBadgeVM[];
  supportSkills: SkillBadgeVM[];
  hiddenSkillCount: number;
  totalCount: number;
  autoIncludedCount: number;
  manualIncludedCount: number;
};

export type SkillOptionVM = {
  id: string;
  title: string;
  summary: string;
  reason: string;
  selected: boolean;
  locked: boolean;
};

export function buildClientCards(appState: AppStatePayload | null): ClientCardVM[] {
  return clientMetas.map((clientMeta) => {
    const detection = findDetection(appState, clientMeta.id);
    const support = findSupport(appState, clientMeta.id);
    const installed = appState?.installed?.[clientMeta.id];

    let supportNote = '未检测';
    if (clientMeta.id === 'opencode') {
      supportNote = support?.ok
        ? '可直接使用'
        : detection?.detected && detection.configured
          ? '已接管，建议修复'
          : detection?.detected
            ? '已检测到，待应用'
            : '未检测到 OpenCode';
    } else if (support?.ok) {
      supportNote = '可直接使用';
    } else if (detection?.detected && detection.configured) {
      supportNote = '已接管，建议修复';
    } else if (detection?.detected) {
      supportNote = '已检测到，待应用';
    }

    return {
      id: clientMeta.id,
      label: clientMeta.label,
      eyebrow: clientMeta.eyebrow,
      tagline: clientMeta.tagline,
      tone: clientMeta.tone,
      detected: Boolean(detection?.detected),
      configured: Boolean(detection?.configured),
      healthy: Boolean(support?.ok),
      limited: false,
      supportNote,
      installedMcpCount: installed?.mcpServers.length ?? 0,
      installedSkillCount: installed?.skills.length ?? 0,
    };
  });
}

export function buildHero(
  client: Client,
  detection: DetectionItem | undefined,
  support: SupportItem | undefined,
  roleTitle: string
): PlatformHeroVM {
  if (!detection?.detected) {
    if (client === 'opencode') {
      return {
        statusTone: 'blocked',
        title: '还没检测到 OpenCode',
        summary: '先在这台设备上安装 OpenCode 客户端，再继续套用 Forge 组合。',
        primaryAction: 'bootstrap',
        primaryLabel: '安装 OpenCode',
        secondaryAction: 'requirements',
        secondaryLabel: '查看前提',
      };
    }
    return {
      statusTone: 'blocked',
      title: `还没检测到 ${clientLabel(client)}`,
      summary: `先安装官方客户端，再继续套用 ${roleTitle} 这套 Forge 组合。`,
      primaryAction: 'bootstrap',
      primaryLabel: '安装官方客户端',
      secondaryAction: 'requirements',
      secondaryLabel: '查看前提',
    };
  }

  if (!detection.configured) {
    return {
      statusTone: 'warn',
      title: `${clientLabel(client)} 已检测到，还没应用 Forge 配置`,
      summary: `可以直接把 ${roleTitle} 这套角色组合写入当前客户端。`,
      primaryAction: 'install',
      primaryLabel: '应用 Forge 配置',
      secondaryAction: 'verify',
      secondaryLabel: '验证当前状态',
    };
  }

  if (support?.ok) {
    return {
      statusTone: 'good',
      title: `${clientLabel(client)} 已由 Forge 接管`,
      summary: '当前配置稳定，可重新套用或校验。',
      primaryAction: 'repair',
      primaryLabel: '重新应用 / 修复',
      secondaryAction: 'verify',
      secondaryLabel: '重新验证',
    };
  }

  return {
    statusTone: 'warn',
    title: `${clientLabel(client)} 需要修复运行前提`,
    summary: '当前检查显示仍有前提项未满足。',
    primaryAction: 'repair',
    primaryLabel: '修复当前客户端',
    secondaryAction: 'verify',
    secondaryLabel: '再次验证',
  };
}

export function buildRoleOptions(selectedRoleIds: RoleId[]): RoleOptionVM[] {
  const selectedIds = new Set(selectedRoleIds);
  return roleDefinitions.map((role) => ({
    id: role.id,
    title: role.title,
    summary: role.summary,
    fit: role.fit,
    recommendedStacks: role.recommendedStacks.map((stackId) => getStackDefinition(stackId).title),
    recommendedSkillCount: role.recommendedSkills.length,
    previewSkills: role.recommendedSkills.slice(0, 3).map((skillId) => skillTitle(skillId)),
    selected: selectedIds.has(role.id),
  }));
}

export function buildStackOptions(selectedRoleIds: RoleId[], selectedStackIds: StackId[]): {
  recommended: StackOptionVM[];
  optional: StackOptionVM[];
} {
  const recommendedSeed: string[] = [];
  for (const roleId of selectedRoleIds) {
    const role = forgeRoleMcpMatrix.roles[roleId];
    for (const stackId of role.recommendedStacks as readonly string[]) {
      if (!recommendedSeed.includes(stackId)) {
        recommendedSeed.push(stackId);
      }
    }
  }
  const recommendedIds = new Set<string>(recommendedSeed);
  const selectedIds = new Set(selectedStackIds);

  const recommended = recommendedSeed.map((stackId) => {
    const stack = getStackDefinition(stackId);
    return {
      id: stackId,
      title: stack.title,
      summary: stack.summary,
      selected: selectedIds.has(stackId),
      recommended: true,
    };
  });

  const optionalSeed = stackDefinitions
    .filter((stack) => !recommendedIds.has(stack.id))
    .sort((left, right) => {
      const selectedDiff = Number(selectedIds.has(right.id)) - Number(selectedIds.has(left.id));
      if (selectedDiff !== 0) return selectedDiff;
      return right.relatedSkillCount - left.relatedSkillCount;
    });

  const optional = optionalSeed
    .filter((stack, index) => index < 10 || selectedIds.has(stack.id))
    .map((stack) => ({
      id: stack.id,
      title: stack.title,
      summary: stack.summary,
      selected: selectedIds.has(stack.id),
      recommended: false,
    }));

  return { recommended, optional };
}

export function buildSkillComposition(args: {
  client: Client;
  roleIds: RoleId[];
  stackIds: StackId[];
  extraSkillIds: string[];
}): SkillCompositionVM {
  const normalizedExtraSkillIds = normalizeSkillIds(args.extraSkillIds);
  const { sortedIds, scores } = collectSkillScores({
    ...args,
    extraSkillIds: normalizedExtraSkillIds,
  });
  const manualSelected = new Set(normalizedExtraSkillIds);
  const visible = sortedIds.slice(0, 10);
  const primarySkills = visible.slice(0, 5).map((skillId) => ({
    id: skillId,
    title: skillTitle(skillId),
    reason: Array.from(scores.get(skillId)?.reasons ?? []).slice(0, 2).join(' · '),
  }));
  const supportSkills = visible.slice(5, 10).map((skillId) => ({
    id: skillId,
    title: skillTitle(skillId),
    reason: Array.from(scores.get(skillId)?.reasons ?? []).slice(0, 2).join(' · '),
  }));

  return {
    selectedSkillIds: sortedIds,
    primarySkills,
    supportSkills,
    hiddenSkillCount: Math.max(0, sortedIds.length - visible.length),
    totalCount: sortedIds.length,
    autoIncludedCount: Math.max(0, sortedIds.length - manualSelected.size),
    manualIncludedCount: Array.from(manualSelected).filter((skillId) => sortedIds.includes(skillId)).length,
  };
}

export function buildSkillOptions(args: {
  client: Client;
  roleIds: RoleId[];
  stackIds: StackId[];
  extraSkillIds: string[];
}): {
  recommended: SkillOptionVM[];
  optional: SkillOptionVM[];
} {
  const { client, roleIds, stackIds } = args;
  const normalizedExtraSkillIds = normalizeSkillIds(args.extraSkillIds);
  const { sortedIds, scores } = collectSkillScores({
    ...args,
    extraSkillIds: normalizedExtraSkillIds,
  });
  const autoIncluded = new Set(sortedIds.filter((skillId) => !normalizedExtraSkillIds.includes(skillId)));
  const manualSelected = new Set(normalizedExtraSkillIds);
  const skillClient = client === 'opencode' ? 'codex' : client;

  const recommendedIds = sortedIds.slice(0, 8);
  const optionalPool = forgeSkillOptions
    .filter((skill) => (skill.clients as readonly string[]).includes(skillClient))
    .filter((skill) => !recommendedIds.includes(skill.id))
    .filter((skill) => !autoIncluded.has(skill.id) || manualSelected.has(skill.id))
    .sort((left, right) => {
      const leftScore = manualOptionScore(left, roleIds, stackIds, manualSelected);
      const rightScore = manualOptionScore(right, roleIds, stackIds, manualSelected);
      if (rightScore !== leftScore) return rightScore - leftScore;
      return left.title.localeCompare(right.title, 'zh-CN');
    });

  const optionalIds = optionalPool
    .filter((skill, index) => index < 10 || manualSelected.has(skill.id))
    .map((skill) => skill.id);

  function toOption(skillId: string): SkillOptionVM {
    const matched = forgeSkillOptions.find((item) => item.id === skillId);
    const reason = Array.from(scores.get(skillId)?.reasons ?? []);
    return {
      id: skillId,
      title: skillTitle(skillId),
      summary: matched?.summary ?? '用于补强当前角色组合。',
      reason: reason.slice(0, 2).join(' · ') || '可按需手动补强',
      selected: autoIncluded.has(skillId) || manualSelected.has(skillId),
      locked: autoIncluded.has(skillId),
    };
  }

  return {
    recommended: recommendedIds.map(toOption),
    optional: optionalIds.map(toOption),
  };
}

function collectSkillScores(args: {
  client: Client;
  roleIds: RoleId[];
  stackIds: StackId[];
  extraSkillIds: string[];
}) {
  const { client, roleIds, stackIds, extraSkillIds } = args;
  const scores = new Map<string, { score: number; reasons: Set<string> }>();

  function addScore(skillId: string, score: number, reason: string) {
    const current = scores.get(skillId) ?? { score: 0, reasons: new Set<string>() };
    current.score += score;
    current.reasons.add(reason);
    scores.set(skillId, current);
  }

  for (const roleId of roleIds) {
    const roleGuide = forgeRoleMcpMatrix.roles[roleId];
    for (const skillId of roleGuide.recommendedSkills) {
      addScore(skillId, 8, `${getRoleDefinition(roleId).title} 默认`);
    }
  }

  for (const extraSkillId of extraSkillIds) {
    addScore(extraSkillId, 10, '手动补强');
  }

  for (const skill of forgeSkillOptions) {
    const skillClient = client === 'opencode' ? 'codex' : client;
    if (!(skill.clients as readonly string[]).includes(skillClient)) continue;

    let matched = false;
    for (const roleId of roleIds) {
      if ((skill.recommendedByRole as readonly string[]).includes(roleId)) {
        addScore(skill.id, 4, `${getRoleDefinition(roleId).title} 相关`);
        matched = true;
      }
    }

    const matchedStacks = stackIds.filter((stackId) => (skill.recommendedByStack as readonly string[]).includes(stackId));
    if (matchedStacks.length > 0) {
      for (const stackId of matchedStacks) {
        addScore(skill.id, 2, `${getStackDefinition(stackId).title} 关联`);
      }
      matched = true;
    }

    if (matched && skill.layer === 'core') {
      addScore(skill.id, 1, '核心');
    }

    if (matched && skill.clusterRole === 'primary') {
      addScore(skill.id, 1, '主组合');
    }
  }

  const normalizedScores = new Map<string, { score: number; reasons: Set<string> }>();
  for (const [skillId, value] of scores.entries()) {
    const canonical = canonicalSkillId(skillId);
    const current = normalizedScores.get(canonical) ?? { score: 0, reasons: new Set<string>() };
    current.score += value.score;
    for (const reason of value.reasons) {
      current.reasons.add(reason);
    }
    normalizedScores.set(canonical, current);
  }

  const sortedIds = Array.from(normalizedScores.entries())
    .sort((left, right) => {
      const scoreDiff = right[1].score - left[1].score;
      if (scoreDiff !== 0) return scoreDiff;
      return skillTitle(left[0]).localeCompare(skillTitle(right[0]), 'zh-CN');
    })
    .map(([skillId]) => skillId);
  return { sortedIds, scores: normalizedScores };
}

export function buildRequirements(args: {
  client: Client;
  detection: DetectionItem | undefined;
  runtime: AppStatePayload['runtime'] | undefined;
  selectedMcpServers: string[];
  enabledLayers: SetupLayer[];
  secretValues: Record<string, string>;
}): RequirementVM[] {
  const { client, detection, runtime, selectedMcpServers, enabledLayers, secretValues } = args;
  const requirements: RequirementVM[] = [];

  if (!detection?.detected) {
    requirements.push({
      id: 'client-missing',
      tone: 'blocked',
      title: '还没检测到客户端',
      detail: `当前设备上还没有可用的 ${clientLabel(client)} 命令。`,
      nextStep: client === 'opencode' ? '先安装 OpenCode 客户端，再回到这里继续。' : '先执行 Bootstrap 安装官方客户端，再继续。',
      actionLabel: client === 'opencode' ? '查看详情' : '安装客户端',
      actionTarget: client === 'opencode' ? 'toolbox' : 'bootstrap',
    });
  }

  if (enabledLayers.includes('skills') && runtime && !runtime.nodeAvailable) {
    requirements.push({
      id: 'node-missing',
      tone: 'blocked',
      title: '缺少 Node.js',
      detail: '角色能力、skills 同步和部分连接配置依赖 Node.js。',
      nextStep: '先安装 Node.js 18+，再重新加载状态。',
      actionLabel: '查看环境',
      actionTarget: 'settings',
    });
  }

  if (enabledLayers.includes('mcp') && selectedMcpServers.includes('exa') && !secretValues.EXA_API_KEY) {
    requirements.push({
      id: 'exa-secret',
      tone: 'warn',
      title: `${secretLabels.EXA_API_KEY} 未填写`,
      detail: '当前连接组合启用了 Exa，但还没补齐密钥。',
      nextStep: '在 Advanced Details 里保存 EXA_API_KEY，再执行 Install 或 Repair。',
      actionLabel: '填写密钥',
      actionTarget: 'secrets',
    });
  }

  if (runtime && !runtime.pythonAvailable && client === 'claude' && enabledLayers.includes('mcp')) {
    requirements.push({
      id: 'python-missing',
      tone: 'warn',
      title: 'Python 运行时缺失',
      detail: 'Claude 的部分连接配置助手依赖本机 Python。',
      nextStep: '先安装 Python 3，再重新验证。',
      actionLabel: '查看环境',
      actionTarget: 'settings',
    });
  }

  return requirements;
}

export function buildActionFeedback<T>(
  action: PlatformActionKind,
  client: Client,
  result: ActionResult<T>
): ActionFeedbackVM {
  const missingMcp = extractDetailValues(result.details, 'missing_mcp');
  const missingSkills = extractDetailValues(result.details, 'missing_skills');
  const warningSummary = result.warnings[0];
  const tone = result.ok ? (result.warnings.length > 0 ? 'warn' : 'success') : 'error';
  const impact =
    missingMcp.length > 0 && missingSkills.length > 0
      ? `还有 ${missingSkills.length} 个能力、${missingMcp.length} 个连接未完成。`
      : missingMcp.length > 0
        ? `还有 ${missingMcp.length} 个连接未完成。`
        : missingSkills.length > 0
          ? `还有 ${missingSkills.length} 个能力未完成。`
          : result.summary;
  const nextStep =
    missingMcp.length > 0 || missingSkills.length > 0
      ? '先补齐缺失项，再重新执行 Verify 确认状态稳定。'
      : warningSummary
        ? `先处理提示项：${warningSummary}`
        : action === 'verify'
          ? result.ok
            ? '配置已验证，状态稳定。'
            : '先查看 Requirements 和 Advanced Details，再决定是否修复。'
          : result.ok
            ? '建议马上再跑一次 Verify，确认结果已经稳定。'
            : '先打开详情查看原始输出，再修复缺项。';

  const installedSummary = result.ok ? buildInstalledSummary(result.details) : undefined;

  return {
    tone,
    title: `${clientLabel(client)} · ${result.ok ? '已完成' : '未完成'}`,
    impact,
    nextStep,
    installedSummary,
    raw: result.raw,
    details: result.details,
    warnings: result.warnings,
  };
}

function buildInstalledSummary(details: string[]): string | undefined {
  // Backend emits: "verified_mcp=server1,server2 actual=server1,server2"
  // and "verified_skills=skill1,skill2 actual=skill1,skill2"
  const mcpLine = details.find((d) => d.startsWith('verified_mcp='));
  const skillsLine = details.find((d) => d.startsWith('verified_skills='));

  if (!mcpLine && !skillsLine) return undefined;

  const parts: string[] = [];

  if (skillsLine) {
    // Parse "verified_skills=s1,s2 actual=s1,s2" — take the actual= part
    const actualMatch = skillsLine.match(/actual=([^\s]+)/);
    const actualSkills = actualMatch
      ? actualMatch[1].split(',').filter(Boolean)
      : skillsLine.slice('verified_skills='.length).split(' ')[0].split(',').filter(Boolean);
    if (actualSkills.length > 0) {
      parts.push(`${actualSkills.length} 个能力`);
    }
  }

  if (mcpLine) {
    const actualMatch = mcpLine.match(/actual=([^\s]+)/);
    const actualMcp = actualMatch
      ? actualMatch[1].split(',').filter(Boolean)
      : mcpLine.slice('verified_mcp='.length).split(' ')[0].split(',').filter(Boolean);
    if (actualMcp.length > 0) {
      parts.push(`${actualMcp.length} 个连接器`);
    }
  }

  return parts.length > 0 ? `已写入全局配置：${parts.join(' · ')}` : undefined;
}

function extractDetailValues(details: string[], key: string) {
  return details
    .filter((item) => item.startsWith(`${key}=`))
    .flatMap((item) =>
      item
        .slice(key.length + 1)
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    );
}

export function buildWorkbenchTabs(args: {
  roleTitle: string;
  stackCount: number;
  skillCount: number;
  selectedMcpCount: number;
}): WorkbenchTabVM[] {
  const { roleTitle, stackCount, skillCount, selectedMcpCount } = args;
  return [
    { id: 'persona', label: '角色与能力', meta: roleTitle },
    { id: 'connections', label: '连接器', meta: `${selectedMcpCount} 个已选` },
    { id: 'extensions', label: '记忆层', meta: `${stackCount} 个模块 · ${skillCount} 个能力` },
  ];
}

export function buildRecommendedMcpIds(roleIds: RoleId[], stackIds: StackId[]) {
  const recommended = new Set<string>();
  for (const roleId of roleIds) {
    const roleGuide = forgeRoleMcpMatrix.roles[roleId];
    for (const item of roleGuide.recommendedMcp ?? []) {
      recommended.add(item.id);
    }
    if ('recommendedToolMcp' in roleGuide && roleGuide.recommendedToolMcp) {
      for (const item of roleGuide.recommendedToolMcp) {
        recommended.add(item.id);
      }
    }
  }

  for (const stackId of stackIds) {
    if (!isDomainStack(stackId)) continue;
    const stackGuide = forgeDomainMcpMatrix.stacks[stackId];
    for (const item of stackGuide.recommendedMcp ?? []) {
      recommended.add(item.id);
    }
    if ('recommendedToolMcp' in stackGuide && stackGuide.recommendedToolMcp) {
      for (const item of stackGuide.recommendedToolMcp) {
        recommended.add(item.id);
      }
    }
  }

  return Array.from(recommended);
}

const mcpLabels: Record<string, string> = {
  'sequential-thinking': 'Sequential Thinking',
  'context7': 'Context7',
  'memory': 'Memory',
  'fetch': 'Fetch',
  'playwright': 'Playwright',
  'deepwiki': 'DeepWiki',
  'exa': 'Exa Search',
  'pencil': 'Pencil',
  'bing-search': 'Bing Search',
  'firecrawl': 'Firecrawl',
  'n8n': 'n8n',
  'trendradar': 'Trend Radar',
  'drawio': 'Draw.io',
  'figma': 'Figma',
};

const mcpDescriptions: Record<string, string> = {
  'sequential-thinking': '复杂问题分步推理，适合多步骤分析任务。',
  'context7': '文档与示例检索，快速查阅库文档和 API 参考。',
  'memory': '跨会话记忆，让 AI 记住项目上下文和偏好。',
  'fetch': '通用 HTTP 抓取，读取网页内容和 API 数据。',
  'playwright': '浏览器自动化与网页验证，支持 E2E 测试。',
  'deepwiki': '开源仓库说明与结构检索，理解代码库架构。',
  'exa': '联网搜索，获取最新信息（需要 EXA API Key）。',
  'pencil': '设计画布与视觉编辑（仅 macOS Codex/Gemini）。',
  'bing-search': 'Bing 搜索（需要 Bing API Key）。',
  'firecrawl': 'Firecrawl 网页抓取（需要 Firecrawl API Key）。',
  'n8n': 'n8n 工作流接入（需要 API URL 和 Key）。',
  'trendradar': '趋势雷达与话题跟踪。',
  'drawio': 'draw.io 图表与流程图编辑。',
  'figma': 'Figma 设计文件读取（仅 Codex/Gemini，需要 OAuth Token）。',
};

const mcpRequiresSecret: Record<string, boolean> = {
  'exa': true,
  'bing-search': true,
  'firecrawl': true,
  'n8n': true,
  'figma': true,
};

export function buildMcpOptions(args: {
  client: Client;
  selectedMcpServers: string[];
  recommendedMcpIds: string[];
}): McpOptionVM[] {
  const { client, selectedMcpServers, recommendedMcpIds } = args;
  const selectedSet = new Set(selectedMcpServers);
  const recommendedSet = new Set(recommendedMcpIds);
  const builtinIds = forgeDeviceContext.forge.builtinMcpServerIds;

  // Filter by client compatibility using the known client restrictions
  const clientExcluded: Record<string, string[]> = {
    'pencil': ['claude'],
    'figma': ['claude'],
  };

  const options: McpOptionVM[] = builtinIds
    .filter((id) => {
      const excluded = clientExcluded[id];
      return !excluded || !excluded.includes(client);
    })
    .map((id) => ({
      id,
      label: mcpLabels[id] ?? id,
      description: mcpDescriptions[id] ?? '扩展 AI 客户端能力。',
      selected: selectedSet.has(id),
      recommended: recommendedSet.has(id),
      builtin: true,
      requiresSecret: mcpRequiresSecret[id] ?? false,
    }));

  // Sort: selected first, then recommended, then rest (alphabetical within groups)
  return options.sort((a, b) => {
    if (a.selected !== b.selected) return a.selected ? -1 : 1;
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    return a.label.localeCompare(b.label, 'zh-CN');
  });
}


export function buildExtensionMeta(args: {
  selectedMcpServers: string[];
  recommendedMcpIds: string[];
  memoryEnabled: boolean;
}): Record<ExtensionView, ExtensionMetaVM> {
  const { selectedMcpServers, recommendedMcpIds, memoryEnabled } = args;
  return {
    mcp: {
      title: 'MCP 连接',
      description: '连接器独立管理，只做补强，不替代角色、stacks 和 skills 主线。',
      items: selectedMcpServers,
      enabled: selectedMcpServers.length > 0,
      suggestedItems: recommendedMcpIds,
    },
    memory: {
      title: 'Memory',
      description: '决定是否把工作区与项目记忆一起带入当前客户端。',
      items: memoryEnabled ? ['工作区记忆', '项目记忆'] : ['当前未写入记忆层'],
      enabled: memoryEnabled,
      suggestedItems: ['工作区记忆', '项目记忆'],
    },
  };
}

export function buildApplyScope(args: {
  client: Client;
  roleTitle: string;
  selectedStackIds: StackId[];
  selectedSkills: string[];
  selectedMcpServers: string[];
  mcpEnabled: boolean;
  memoryEnabled: boolean;
  requirements: RequirementVM[];
  detectionHome?: string;
}): ApplyScopeVM {
  const {
    client,
    roleTitle,
    selectedStackIds,
    selectedSkills,
    selectedMcpServers,
    mcpEnabled,
    memoryEnabled,
    requirements,
    detectionHome,
  } = args;

  const writeItems = ['基础 Forge 组件', `角色画像 · ${roleTitle}`, `模块 · ${selectedStackIds.length} 项`, `能力 · ${selectedSkills.length} 项`];
  const skipItems: string[] = [];

  if (mcpEnabled && selectedMcpServers.length > 0) {
    writeItems.push(`连接器 · ${selectedMcpServers.length} 个`);
  } else {
    skipItems.push('连接器未写入');
  }

  if (memoryEnabled) {
    writeItems.push('Memory · 工作区与项目记忆');
  } else {
    skipItems.push('Memory 已关闭');
  }

  const blockerItems =
    requirements.length > 0 ? requirements.map((item) => item.title) : ['当前没有阻塞项'];

  const targetItems = [
    { label: '目标客户端', value: clientLabel(client) },
    { label: '角色', value: roleTitle },
    {
      label: 'Stacks',
      value: selectedStackIds.map((stackId) => getStackDefinition(stackId).title).join(' · ') || '未选择',
    },
    { label: '目标目录', value: detectionHome || '首次应用时创建或接管该目录' },
  ];

  return {
    writeItems,
    skipItems,
    blockerItems,
    targetItems,
  };
}

export function getPrimaryRequirementAction(requirements: RequirementVM[]): RequirementActionVM | null {
  const prioritized = requirements.find((item) => item.tone === 'blocked' && item.actionLabel && item.actionTarget);
  if (prioritized?.actionLabel && prioritized.actionTarget) {
    return { label: prioritized.actionLabel, target: prioritized.actionTarget };
  }

  const fallback = requirements.find((item) => item.actionLabel && item.actionTarget);
  if (fallback?.actionLabel && fallback.actionTarget) {
    return { label: fallback.actionLabel, target: fallback.actionTarget };
  }

  return null;
}

export function statusTone(card: { healthy: boolean; configured: boolean; detected: boolean; limited?: boolean }) {
  if (card.limited) return 'bg-sky-50 text-sky-700';
  if (card.healthy) return 'bg-emerald-50 text-emerald-700';
  if (card.configured || card.detected) return 'bg-amber-50 text-amber-800';
  return 'bg-slate-200 text-slate-500';
}

export function statusLabel(card: { healthy: boolean; configured: boolean; detected: boolean; limited?: boolean }) {
  if (card.limited) return '受限';
  if (card.healthy) return '就绪';
  if (card.configured) return '需修复';
  if (card.detected) return '待应用';
  return '未检测';
}

export function requirementTone(tone: 'warn' | 'blocked' | 'limited') {
  if (tone === 'blocked') return 'border-rose-200 bg-rose-50 text-rose-800';
  if (tone === 'limited') return 'border-sky-200 bg-sky-50 text-sky-800';
  return 'border-amber-200 bg-amber-50 text-amber-900';
}

export function feedbackTone(tone: ActionFeedbackVM['tone']) {
  if (tone === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (tone === 'warn') return 'border-amber-200 bg-amber-50 text-amber-900';
  return 'border-rose-200 bg-rose-50 text-rose-800';
}

export function supportLabel(ok: boolean | undefined) {
  if (ok === true) return '已就绪';
  if (ok === false) return '需处理';
  return '未知';
}

export function skillTitles(skillNames: string[]) {
  return skillNames.map((name) => skillTitle(name));
}

export function buildActionMenuItems(args: {
  canRunClientActions: boolean;
  runningAction: PlatformActionKind | null;
  detected: boolean;
}): ActionMenuItemVM[] {
  const { canRunClientActions, runningAction, detected } = args;
  return [
    {
      key: 'bootstrap',
      title: '安装客户端',
      detail: '先准备官方客户端，再继续套用 Forge 配置。',
      disabled: Boolean(runningAction) || !canRunClientActions || detected,
    },
    {
      key: 'install',
      title: '应用配置',
      detail: '把当前角色组合直接写入这个客户端。',
      disabled: Boolean(runningAction) || !canRunClientActions || !detected,
    },
    {
      key: 'repair',
      title: '修复配置',
      detail: '重新套用当前组合，并修复已有配置问题。',
      disabled: Boolean(runningAction) || !canRunClientActions || !detected,
    },
    {
      key: 'verify',
      title: '重新校验',
      detail: '检查当前配置是否真的可以工作。',
      disabled: Boolean(runningAction) || !canRunClientActions || !detected,
    },
  ];
}

function clientLabel(client: Client) {
  return clientMetas.find((item) => item.id === client)?.label ?? client;
}

function findDetection(appState: AppStatePayload | null, client: Client) {
  return appState?.report.detection.find((item) => item.name === client);
}

function findSupport(appState: AppStatePayload | null, client: Client) {
  return appState?.report.support.find((item) => item.client === client);
}

function manualOptionScore(
  skill: (typeof forgeSkillOptions)[number],
  roleIds: RoleId[],
  stackIds: StackId[],
  manualSelected: Set<string>
) {
  let score = 0;
  if (manualSelected.has(skill.id)) score += 100;
  for (const roleId of roleIds) {
    if ((skill.primaryFor as readonly string[]).includes(roleId)) score += 8;
    if ((skill.recommendedByRole as readonly string[]).includes(roleId)) score += 6;
  }
  const matchedStacks = stackIds.filter((stackId) => (skill.recommendedByStack as readonly string[]).includes(stackId));
  score += matchedStacks.length * 3;
  if (skill.layer === 'core') score += 2;
  if (skill.clusterRole === 'primary') score += 1;
  return score;
}

export function summarizeRoleSelection(roleIds: RoleId[]) {
  const roles = getRoleDefinitions(roleIds);
  if (roles.length === 0) return '未选择角色';
  if (roles.length === 1) return roles[0].title;
  if (roles.length === 2) return `${roles[0].title} + ${roles[1].title}`;
  return `${roles[0].title} + ${roles.length - 1} 个角色`;
}

const skillDisplayNames: Record<string, string> = {
  aesthetic: '审美强化',
  'ai-multimodal': '多模态能力',
  'api-design': 'API 设计',
  'backend-development': '后端构建',
  'better-auth': '鉴权实现',
  brainstorming: '需求梳理',
  'browser-use': '浏览器操作',
  'code-review': '代码评审',
  'context-engineering': '上下文工程',
  context7: '文档检索',
  databases: '数据库能力',
  devops: '工程运维',
  'docs-seeker': '文档搜索',
  'frontend-design': '前端界面',
  'mcp-builder': 'MCP 构建',
  'mcp-management': 'MCP 管理',
  'self-improving-agent': '自我进化',
  'springboot-patterns': 'Spring 模式',
  'systematic-debugging': '系统排障',
  'ui-styling': '界面样式',
  'web-frameworks': 'Web 框架',
  'webapp-testing': '界面验证',
  'writing-plans': '实现规划',
};

function skillTitle(skillId: string) {
  const canonical = canonicalSkillId(skillId);
  if (skillDisplayNames[canonical]) {
    return skillDisplayNames[canonical];
  }
  const matched = forgeSkillOptions.find((item) => item.id === canonical);
  const rawTitle = matched?.title ?? canonical;
  return rawTitle
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function canonicalSkillId(skillId: string) {
  const trimmed = skillId.trim();
  if (!trimmed) return trimmed;
  const matchedById = forgeSkillOptions.find((item) => item.id === trimmed);
  if (matchedById) return matchedById.id;
  const matchedByTitle = forgeSkillOptions.find((item) => item.title === trimmed);
  if (matchedByTitle) return matchedByTitle.id;
  return trimmed;
}

function normalizeSkillIds(skillIds: string[]) {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const skillId of skillIds) {
    const canonical = canonicalSkillId(skillId);
    if (!canonical || seen.has(canonical)) continue;
    seen.add(canonical);
    normalized.push(canonical);
  }
  return normalized;
}

function isDomainStack(stackId: StackId): stackId is DomainStackId {
  return stackId in forgeDomainMcpMatrix.stacks;
}
