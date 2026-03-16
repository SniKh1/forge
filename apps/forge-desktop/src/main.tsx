import React from 'react';
import ReactDOM from 'react-dom/client';
import { invoke } from '@tauri-apps/api/core';
import {
  Bot,
  Boxes,
  BrainCircuit,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FolderOpen,
  Hammer,
  Plus,
  PlugZap,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  X,
} from 'lucide-react';
import './styles.css';
import { forgeSkillOptions } from './generated-catalog';
import { forgeRoleMcpMatrix } from './generated-role-mcp';
import { forgeDomainMcpMatrix } from './generated-domain-mcp';
import forgeBloomIcon from './assets/forge-bloom.png';
import claudeIcon from './assets/platform-icons/claude.png';
import codexIcon from './assets/platform-icons/codex.png';
import geminiIcon from './assets/platform-icons/gemini.png';

type Client = 'claude' | 'codex' | 'gemini';
type Lang = 'zh' | 'en' | 'ja';
type Section = 'platform' | 'community' | 'settings';
type CommunityKind = 'skills' | 'mcp';
type OptionalComponent = 'mcp' | 'skills' | 'memory';
type BaseComponent = 'hooks' | 'rules' | 'stacks' | 'commands';
type RolePack = keyof typeof forgeRoleMcpMatrix.roles;
type InstallRolePack = RolePack | 'developer';
type StackPack = 'frontend' | 'java' | 'python' | 'product' | 'design' | 'architecture' | 'qa' | 'release' | 'ecommerce' | 'video-creation' | 'image-generation' | 'workflow-automation';
type DomainStackPack = keyof typeof forgeDomainMcpMatrix.stacks;

type DetectionItem = {
  name: Client;
  home: string;
  homeLabel: string;
  detected: boolean;
  configured: boolean;
};

type SupportItem = {
  client: Client;
  ok: boolean;
  exitCode: number;
  stdout?: string;
  stderr?: string;
};

type DoctorReport = {
  detection: DetectionItem[];
  capabilityMatrix: { capabilities: Record<string, Record<Client, string>> };
  support: SupportItem[];
};

type Messages = Record<string, string>;

type InstallOption = {
  id: OptionalComponent | BaseComponent;
  title: string;
  summary: string;
  effect: string;
  required: boolean;
  icon: React.ComponentType<{ className?: string }>;
};

type DetailOption = {
  id: string;
  title: string;
  summary: string;
  note?: string;
  clients: readonly Client[];
  layer?: string;
  primaryFor?: readonly string[];
  recommendedByRole?: readonly string[];
  recommendedByStack?: readonly string[];
  overlapGroup?: string | null;
  clusterRole?: string | null;
  supportWhen?: readonly string[];
};

type SkillLayer = 'core' | 'extended' | 'specialized' | 'experimental';

type CommunityEntry = {
  id: string;
  name: string;
  source: string;
  description: string;
  url: string;
  kind: CommunityKind;
  clients: Client[];
  note: string;
};

type ExternalSkillResult = {
  id: string;
  source: string;
  skill: string;
  title: string;
  installs?: string;
  url?: string;
  description: string;
  sourceLabel: string;
  trust: string;
  kind: 'skills';
  installable: boolean;
};

type ExternalMcpInstallSpec = {
  name: string;
  transport: 'stdio';
  command: string;
  args: string[];
  env?: Record<string, string>;
  requiredSecrets?: string[];
  packageIdentifier?: string;
};

type ExternalMcpResult = {
  id: string;
  name: string;
  title: string;
  description: string;
  url?: string;
  sourceLabel: string;
  kind: 'mcp';
  trust: string;
  officialStatus?: string;
  installable: boolean;
  installReason?: string;
  requiredSecrets?: string[];
  installSpec?: ExternalMcpInstallSpec | null;
};

type ExternalMcpConfirmData = {
  entry: ExternalMcpResult;
  busyKey: string;
};

type ExternalRegistrySource = {
  id: string;
  name: string;
  kind: CommunityKind;
  type: string;
  url: string;
  trust: string;
  note: string;
};

type ExternalSearchPayload = {
  kind: CommunityKind;
  query: string;
  sources: ExternalRegistrySource[];
  results: Array<ExternalSkillResult | ExternalMcpResult>;
};

const clientOrder: Client[] = ['claude', 'codex', 'gemini'];
const roleOrder: RolePack[] = ['product-manager', 'ui-designer', 'solution-architect', 'qa-strategist', 'release-devex'];
const installRoleOrder: InstallRolePack[] = ['developer', 'product-manager', 'ui-designer', 'solution-architect', 'qa-strategist', 'release-devex'];
const installRoleStacks: Record<InstallRolePack, StackPack[]> = {
  developer: ['frontend', 'java', 'python', 'workflow-automation', 'ecommerce'],
  'product-manager': ['product', 'ecommerce', 'video-creation', 'image-generation'],
  'ui-designer': ['design', 'frontend', 'image-generation', 'video-creation', 'ecommerce'],
  'solution-architect': ['architecture', 'workflow-automation', 'ecommerce', 'java', 'python', 'frontend'],
  'qa-strategist': ['qa', 'workflow-automation', 'ecommerce', 'frontend', 'java', 'python'],
  'release-devex': ['release', 'workflow-automation', 'ecommerce'],
};
const stackOrder: StackPack[] = ['frontend', 'java', 'python', 'product', 'design', 'architecture', 'qa', 'release', 'ecommerce', 'video-creation', 'image-generation', 'workflow-automation'];

type ClientMeta = {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

function roleLabel(role: InstallRolePack, lang: Lang) {
  const labels: Record<InstallRolePack, Record<Lang, string>> = {
    developer: { zh: '开发者', en: 'Developer', ja: '開発者' },
    'product-manager': { zh: '产品经理', en: 'Product Manager', ja: 'プロダクトマネージャー' },
    'ui-designer': { zh: 'UI 设计', en: 'UI Designer', ja: 'UI デザイナー' },
    'solution-architect': { zh: '架构设计', en: 'Solution Architect', ja: 'ソリューションアーキテクト' },
    'qa-strategist': { zh: 'QA 策略', en: 'QA Strategist', ja: 'QA ストラテジスト' },
    'release-devex': { zh: '发布与 DevEx', en: 'Release / DevEx', ja: 'リリース / DevEx' },
  };
  return labels[role][lang];
}

function stackLabel(stack: StackPack, lang: Lang) {
  const labels: Record<StackPack, Record<Lang, string>> = {
    frontend: { zh: '前端', en: 'Frontend', ja: 'フロントエンド' },
    java: { zh: 'Java', en: 'Java', ja: 'Java' },
    python: { zh: 'Python', en: 'Python', ja: 'Python' },
    product: { zh: '产品', en: 'Product', ja: 'プロダクト' },
    design: { zh: '设计', en: 'Design', ja: 'デザイン' },
    architecture: { zh: '架构', en: 'Architecture', ja: 'アーキテクチャ' },
    qa: { zh: 'QA', en: 'QA', ja: 'QA' },
    release: { zh: '发布', en: 'Release', ja: 'リリース' },
    ecommerce: { zh: '电商', en: 'Ecommerce', ja: 'Eコマース' },
    'video-creation': { zh: '视频创作', en: 'Video Creation', ja: '動画制作' },
    'image-generation': { zh: '图像生成', en: 'Image Generation', ja: '画像生成' },
    'workflow-automation': { zh: '工作流自动化', en: 'Workflow Automation', ja: 'ワークフロー自動化' },
  };
  return labels[stack][lang];
}

function normalizeSkillLayer(layer?: string | null): SkillLayer {
  if (layer === 'core' || layer === 'extended' || layer === 'specialized' || layer === 'experimental') {
    return layer;
  }
  return 'specialized';
}

function skillLayerLabel(layer: SkillLayer, lang: Lang) {
  const labels: Record<SkillLayer, Record<Lang, string>> = {
    core: { zh: '核心层', en: 'Core', ja: 'コア層' },
    extended: { zh: '支撑层', en: 'Support', ja: 'サポート層' },
    specialized: { zh: '专业层', en: 'Specialized', ja: '専門層' },
    experimental: { zh: '实验层', en: 'Experimental', ja: '実験層' },
  };
  return labels[layer][lang];
}

function skillLayerHint(layer: SkillLayer, lang: Lang) {
  const hints: Record<SkillLayer, Record<Lang, string>> = {
    core: {
      zh: '高频主能力，优先展示，适合大多数当前角色和栈。',
      en: 'High-frequency primary skills shown first for the current role and stack.',
      ja: '高頻度の主力 skill。現在の role と stack に最優先で推奨します。',
    },
    extended: {
      zh: '作为补充和协作能力使用，适合在主技能之外增强工作流。',
      en: 'Support skills that extend the main workflow without being the primary route.',
      ja: '主力 skill を補強する支援系の skill です。',
    },
    specialized: {
      zh: '低频但有价值，适合特定领域、格式或平台场景。',
      en: 'Specialized inventory for domain-specific, format-specific, or platform-specific work.',
      ja: '特定領域・形式・プラットフォーム向けの専門 skill です。',
    },
    experimental: {
      zh: '实验性能力，建议显式判断后再安装或启用。',
      en: 'Experimental capabilities that should be enabled deliberately.',
      ja: '実験段階の capability。明示的に判断して有効化します。',
    },
  };
  return hints[layer][lang];
}

function skillClusterRoleLabel(clusterRole: string | null | undefined, lang: Lang) {
  if (clusterRole === 'primary') {
    return {
      zh: '主入口',
      en: 'Primary',
      ja: '主入口',
    }[lang];
  }
  if (clusterRole === 'support') {
    return {
      zh: '支撑',
      en: 'Support',
      ja: '支援',
    }[lang];
  }
  if (clusterRole === 'experimental') {
    return {
      zh: '实验',
      en: 'Experimental',
      ja: '実験',
    }[lang];
  }
  return '';
}

function skillClusterRoleTint(clusterRole: string | null | undefined) {
  if (clusterRole === 'primary') {
    return 'bg-sky-50 text-sky-700 ring-sky-200';
  }
  if (clusterRole === 'support') {
    return 'bg-violet-50 text-violet-700 ring-violet-200';
  }
  if (clusterRole === 'experimental') {
    return 'bg-rose-50 text-rose-700 ring-rose-200';
  }
  return 'bg-slate-100 text-slate-600 ring-slate-200';
}

function skillSupportHint(item: DetailOption) {
  return item.supportWhen && item.supportWhen.length > 0 ? item.supportWhen[0] : '';
}

function installRoleGuide(role: InstallRolePack) {
  if (role === 'developer') {
    return {
      recommendedStacks: installRoleStacks.developer,
      recommendedSkills: ['brainstorming', 'frontend-design', 'backend-development', 'systematic-debugging', 'code-review'],
      recommendedMcp: [
        { id: 'context7', label: 'Context7' },
        { id: 'deepwiki', label: 'DeepWiki' },
        { id: 'playwright', label: 'Playwright MCP' },
        { id: 'memory', label: 'memory' },
        { id: 'fetch', label: 'fetch' },
        { id: 'exa', label: 'exa' },
        { id: 'sequential-thinking', label: 'sequential-thinking' },
      ],
    } as const;
  }
  return forgeRoleMcpMatrix.roles[role];
}

function roleGuideExtraTools(guide: (typeof forgeRoleMcpMatrix.roles)[RolePack]) {
  const localTools = 'recommendedLocalTools' in guide ? guide.recommendedLocalTools : [];
  const toolMcp = 'recommendedToolMcp' in guide ? guide.recommendedToolMcp : [];
  return [...localTools, ...toolMcp];
}

function domainGuideExtraTools(guide: (typeof forgeDomainMcpMatrix.stacks)[DomainStackPack]) {
  const localTools = 'recommendedLocalTools' in guide ? guide.recommendedLocalTools : [];
  const toolMcp = 'recommendedToolMcp' in guide ? guide.recommendedToolMcp : [];
  return [...localTools, ...toolMcp];
}

function isDomainStackPack(stack: StackPack): stack is DomainStackPack {
  return stack in forgeDomainMcpMatrix.stacks;
}

function groupSkillsByLayer(items: DetailOption[]) {
  const order: SkillLayer[] = ['core', 'extended', 'specialized', 'experimental'];
  return order
    .map((layer) => ({
      layer,
      items: items.filter((item) => normalizeSkillLayer(item.layer) === layer),
    }))
    .filter((group) => group.items.length > 0);
}

function tokenizeSearchTerms(...values: Array<string | null | undefined>) {
  return Array.from(new Set(
    values
      .flatMap((value) => String(value || '').toLowerCase().split(/[^a-z0-9-]+/))
      .map((item) => item.trim())
      .filter((item) => item.length >= 3),
  ));
}

function joinExternalSkillText(entry: ExternalSkillResult) {
  return [
    entry.id,
    entry.source,
    entry.skill,
    entry.title,
    entry.description,
    entry.url,
    entry.sourceLabel,
  ].join(' ').toLowerCase();
}

function joinExternalMcpText(entry: ExternalMcpResult) {
  return [
    entry.id,
    entry.name,
    entry.title,
    entry.description,
    entry.url,
    entry.sourceLabel,
    entry.installReason,
  ].join(' ').toLowerCase();
}

function scoreExternalSkill(entry: ExternalSkillResult, query: string, preferredIds: Set<string>, preferredTerms: readonly string[]) {
  const text = joinExternalSkillText(entry);
  let score = 0;
  if (preferredIds.has(entry.skill) || preferredIds.has(entry.id)) score += 120;
  for (const term of preferredTerms) {
    if (entry.skill.toLowerCase() === term || entry.id.toLowerCase() === term) {
      score += 45;
      continue;
    }
    if (text.includes(term)) score += 14;
  }
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery) {
    if (entry.skill.toLowerCase() === normalizedQuery || entry.title.toLowerCase() === normalizedQuery) {
      score += 24;
    } else if (text.includes(normalizedQuery)) {
      score += 10;
    }
  }
  return score;
}

function scoreExternalMcp(entry: ExternalMcpResult, query: string, preferredIds: Set<string>, preferredTerms: readonly string[]) {
  const text = joinExternalMcpText(entry);
  let score = Number(entry.installable) * 90;
  if (preferredIds.has(entry.name) || preferredIds.has(entry.id)) score += 120;
  for (const term of preferredTerms) {
    if (entry.name.toLowerCase() === term || entry.id.toLowerCase() === term) {
      score += 45;
      continue;
    }
    if (text.includes(term)) score += 14;
  }
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery) {
    if (entry.name.toLowerCase() === normalizedQuery || entry.title.toLowerCase() === normalizedQuery) {
      score += 24;
    } else if (text.includes(normalizedQuery)) {
      score += 10;
    }
  }
  if (entry.officialStatus === 'active') score += 4;
  return score;
}

const messages: Record<Lang, Messages> = {
  zh: {
    productName: 'Forge',
    platform: '平台',
    community: '社区扩展',
    settings: '设置',
    detectRunning: '正在检测当前平台环境...',
    detectLoaded: '已加载当前平台环境状态。',
    detectFailed: '无法读取 Forge 状态，请检查 Tauri bridge 与 Forge CLI。',
    detectPreview: '浏览器预览模式，当前使用本地 mock 状态。',
    refresh: '刷新',
    installForge: '安装 Forge',
    updateForge: '更新 Forge',
    repairForge: '修复 Forge',
    verifyNow: '立即验证',
    openTerminal: '打开终端',
    openConfig: '打开配置目录',
    officialInstall: '安装官方客户端',
    currentWorkspace: '当前工作区',
    detected: '已检测',
    configured: '已配置',
    healthy: '健康',
    missing: '未安装',
    status: '状态',
    platformWorkbench: '平台工作台',
    communityWorkbench: '社区扩展',
    installContents: '本次安装内容',
    baseLayer: '基础层',
    optionalLayer: '可选层',
    alwaysInstalled: '基础必装',
    selectedInstall: '已选安装',
    installScope: '安装范围',
    environment: '环境检测',
    forgeState: 'Forge 状态',
    supported: '支持级别',
    installedPath: '路径',
    notConfigured: '尚未安装 Forge 配置',
    healthyState: '已可用',
    needsRepair: '需要修复',
    unknown: '未知',
    systemDetected: '系统已检测到客户端，可直接安装 Forge 配置。',
    systemMissing: '当前平台 CLI 或配置目录不可用，需要先安装官方客户端。',
    officialCommand: '官方安装命令',
    copied: '已复制',
    copy: '复制',
    viewLog: '查看日志',
    hideLog: '收起日志',
    commandLog: '命令日志',
    clearLog: '清空日志',
    communityHint: '这里保留 Forge 内置能力清单和社区入口。内置 MCP 会随“安装 Forge”中的 MCP 选项一起写入当前平台。',
    roleRecommendations: '按角色推荐',
    installPersona: '安装画像',
    installPersonaHint: '先选当前工作角色和栈，安装弹窗会按这个上下文推荐与排序。',
    rolePackLabel: '角色包',
    stackPackLabel: '栈包',
    recommendedPreset: '按推荐预选',
    recommendedBadge: '推荐',
    addToInstallList: '加入安装清单',
    switchToPlatform: '回到平台安装',
    currentPersona: '当前画像',
    roleBoundInstallHint: '内置项可以直接加入当前平台安装清单；社区仓库仍然作为浏览入口。',
    roleRecommendationHint: '先看角色推荐，再决定要不要从下面的社区仓库继续扩展。',
    recommendedStacksLabel: '推荐栈',
    recommendedSkillsLabel: '推荐 Skills',
    officialMcpLabel: '官方 MCP',
    companionToolsLabel: '配套工具',
    domainPackLabel: '领域栈',
    domainPackHint: '当前领域栈会补充一组更贴近业务场景的 MCP 和工具建议。',
    domainRecommendedMcpLabel: '领域推荐 MCP',
    domainRecommendedToolsLabel: '领域配套工具',
    searchPlaceholder: '搜索名称、来源或说明',
    skillsTab: 'Skills',
    mcpTab: 'MCP',
    openRepo: '打开仓库',
    copySource: '复制来源',
    builtIn: 'Forge 内置',
    manualImport: '社区导入',
    language: '语言',
    theme: '主题',
    lightTheme: '浅色',
    systemTheme: '跟随系统',
    exaKey: 'EXA API Key',
    exaHint: '仅在你勾选 MCP 时写入当前平台配置。输出和日志会自动脱敏。',
    exaSection: '密钥与令牌',
    logSection: '命令日志',
    confirmTitleInstall: '确认安装',
    confirmTitleUpdate: '确认更新',
    confirmTitleRepair: '确认修复',
    confirmAction: '继续执行',
    cancel: '取消',
    confirmHint: '确认后才会写入当前平台配置。下面列出本次会安装或保持的内容。',
    selectedOptionalEmpty: '当前没有勾选可选内容，只会保留 Forge 基础层。',
    modalBase: '基础层（固定）',
    modalOptional: '可选层（本次选择）',
    noSecretYet: '当前没有额外 token/key。',
    secretsCollapsedHint: '后续更多 MCP 或社区技能需要 key 时，也放在这里。',
    logCollapsedHint: '默认折叠，需要时再看详细输出。',
    saveSelection: '当前平台会安装',
    restartHint: '安装完成后，如客户端已在运行，建议重启该客户端。',
    lastUpdated: '最后更新',
    noItems: '没有匹配项',
    baseInstallNote: '以下 4 项是 Forge 的基础层，当前版本保持必装，用来保证规则、角色、脚本和工作流完整。',
    optionalInstallNote: '以下 3 项支持按需安装，并已接到真实安装链路。',
    optionalSelectHint: '按组件纵向展开；在具体项里勾选你要写入当前平台的 MCP 或 Skill。',
    detailItems: '具体项',
    selectedCount: '已选',
    noDetails: '当前平台没有可选的具体项。',
    memoryDetailsHint: '当前版本会一起初始化项目 memory、learned 目录和工作区脚手架，暂不拆分安装。',
    detailChoose: '选择安装',
    detailIncluded: '将写入',
    selectAll: '全选',
    clearAll: '清空',
    platformReady: '当前平台已满足 Forge 安装前置。',
    platformBlocked: '当前平台缺少前置，Forge 不会盲目写入配置。',
    supportedOn: '适用平台',
    openSource: '开源来源',
    installViaHome: '通过首页安装',
    browseOnly: '浏览入口',
    builtInSkillsSection: 'Forge 内置 Skills',
    builtInSkillsHint: '这里是当前平台可直接加入安装清单的内置 skill，会按角色和栈优先级排序。',
    communityReposSection: '社区仓库',
    communityReposHint: '这些是外部技能仓库入口，适合继续扩展，但默认不会直接写入当前平台。',
    externalSearchSection: '外部搜索',
    externalSearchHintSkills: '从 skills.sh 搜索第三方 skill，确认后可直接安装到当前客户端配置。',
    externalSearchHintMcp: '从 Official MCP Registry 搜索可用条目。只有能安全映射到当前客户端配置的项才提供直接安装。',
    searchingExternal: '正在搜索外部来源...',
    externalSearchError: '外部搜索失败，请检查网络或 CLI 输出。',
    externalSourceLabel: '搜索来源',
    installToCurrentPlatform: '安装到当前平台',
    installToCurrentPlatformBusy: '正在安装...',
    requiresSecrets: '需要配置',
    browseOnlyReason: '当前只提供浏览入口',
    searchFromSkillsSh: '当前使用 skills.sh 作为外部 skill 来源。',
    searchFromOfficialMcp: '当前使用 Official MCP Registry 作为外部 MCP 来源。',
    externalInstallDone: '已安装到当前平台配置。',
    externalInstallFailed: '安装失败，请查看命令日志。',
    officialStatus: '官方状态',
    installableNow: '可直接安装',
    browseOnlyTag: '仅浏览',
    externalMcpConfirmTitle: '确认安装 external MCP',
    externalMcpConfirmHint: '会把下面这组 command / args / env 写入当前客户端配置。涉及 secrets 的项会按变量名展示，不会直接展开真实值。',
    targetClientLabel: '目标客户端',
    commandLabel: 'command',
    argsLabel: 'args',
    envLabel: 'env',
    noArgs: '当前没有额外 args。',
    noEnv: '当前没有额外 env。',
    noSecrets: '当前没有额外 secrets。',
    installSourceLabel: '安装来源',
    zh: '中文',
    en: 'English',
    ja: '日本語',
  },
  en: {
    productName: 'Forge',
    platform: 'Platform',
    community: 'Community',
    settings: 'Settings',
    detectRunning: 'Detecting current platform environment...',
    detectLoaded: 'Loaded current platform state.',
    detectFailed: 'Unable to read Forge state. Check the Tauri bridge and Forge CLI.',
    detectPreview: 'Browser preview mode is using local mock data.',
    refresh: 'Refresh',
    installForge: 'Install Forge',
    updateForge: 'Update Forge',
    repairForge: 'Repair Forge',
    verifyNow: 'Verify now',
    openTerminal: 'Open terminal',
    openConfig: 'Open config',
    officialInstall: 'Install official client',
    currentWorkspace: 'Workspace',
    detected: 'Detected',
    configured: 'Configured',
    healthy: 'Healthy',
    missing: 'Missing',
    status: 'Status',
    platformWorkbench: 'Platform workbench',
    communityWorkbench: 'Community extensions',
    installContents: 'Installation contents',
    baseLayer: 'Base layer',
    optionalLayer: 'Optional layer',
    alwaysInstalled: 'Always installed',
    selectedInstall: 'Selected',
    installScope: 'Install scope',
    environment: 'Environment',
    forgeState: 'Forge state',
    supported: 'Support level',
    installedPath: 'Path',
    notConfigured: 'Forge is not configured yet',
    healthyState: 'Ready',
    needsRepair: 'Needs repair',
    unknown: 'Unknown',
    systemDetected: 'The client is available. Forge can install configuration now.',
    systemMissing: 'The CLI or config directory is unavailable. Install the official client first.',
    officialCommand: 'Official install command',
    copied: 'Copied',
    copy: 'Copy',
    viewLog: 'Show log',
    hideLog: 'Hide log',
    commandLog: 'Command log',
    clearLog: 'Clear log',
    communityHint: 'This page keeps Forge built-ins and community entry points. Built-in MCP servers are written when MCP is selected on the platform page.',
    roleRecommendations: 'Role recommendations',
    installPersona: 'Install persona',
    installPersonaHint: 'Choose the current role and stack first. The install modal will sort and recommend items from that context.',
    rolePackLabel: 'Role pack',
    stackPackLabel: 'Stack pack',
    recommendedPreset: 'Apply recommended',
    recommendedBadge: 'Recommended',
    addToInstallList: 'Add to install list',
    switchToPlatform: 'Back to platform install',
    currentPersona: 'Current persona',
    roleBoundInstallHint: 'Built-in items can be added directly to the current platform install list. Community repositories remain browse-only.',
    roleRecommendationHint: 'Start from role-based recommendations, then expand with community sources only when needed.',
    recommendedStacksLabel: 'Recommended stacks',
    recommendedSkillsLabel: 'Recommended skills',
    officialMcpLabel: 'Official MCP',
    companionToolsLabel: 'Companion tools',
    domainPackLabel: 'Domain stack',
    domainPackHint: 'The current domain stack adds MCP and tool suggestions that are closer to the business workflow.',
    domainRecommendedMcpLabel: 'Domain MCP',
    domainRecommendedToolsLabel: 'Domain companion tools',
    searchPlaceholder: 'Search by name, source, or description',
    skillsTab: 'Skills',
    mcpTab: 'MCP',
    openRepo: 'Open repo',
    copySource: 'Copy source',
    builtIn: 'Built-in',
    manualImport: 'Community import',
    language: 'Language',
    theme: 'Theme',
    lightTheme: 'Light',
    systemTheme: 'System',
    exaKey: 'EXA API Key',
    exaHint: 'Only written to the current platform when MCP is selected. Output and logs stay redacted.',
    exaSection: 'Secrets and tokens',
    logSection: 'Command log',
    confirmTitleInstall: 'Confirm install',
    confirmTitleUpdate: 'Confirm update',
    confirmTitleRepair: 'Confirm repair',
    confirmAction: 'Continue',
    cancel: 'Cancel',
    confirmHint: 'Forge will only write into the current platform after you confirm. This is the exact scope for this run.',
    selectedOptionalEmpty: 'No optional components are selected. Only the Forge base layer will remain.',
    modalBase: 'Base layer (fixed)',
    modalOptional: 'Optional layer (selected)',
    noSecretYet: 'No extra token or key is set yet.',
    secretsCollapsedHint: 'Future MCPs or community skills that need keys will also live here.',
    logCollapsedHint: 'Logs stay collapsed by default and only expand when needed.',
    saveSelection: 'Current platform will install',
    restartHint: 'If the client is already running, restart it after installation.',
    lastUpdated: 'Last updated',
    noItems: 'No matching items',
    baseInstallNote: 'These four items stay mandatory in the current version so rules, roles, scripts, and workflows remain intact.',
    optionalInstallNote: 'These three items are connected to the real install pipeline and can be toggled.',
    optionalSelectHint: 'Expand each component vertically, then choose the exact MCPs or skills to write into the current client.',
    detailItems: 'Detailed items',
    selectedCount: 'Selected',
    noDetails: 'No detailed items are available for this platform.',
    memoryDetailsHint: 'This version initializes project memory, learned skills, and workspace scaffolding together.',
    detailChoose: 'Choose install',
    detailIncluded: 'Will write',
    selectAll: 'Select all',
    clearAll: 'Clear',
    platformReady: 'This platform already meets Forge install prerequisites.',
    platformBlocked: 'This platform is missing prerequisites, so Forge will not write configs yet.',
    supportedOn: 'Supported on',
    openSource: 'Source',
    installViaHome: 'Install from platform page',
    browseOnly: 'Browse only',
    builtInSkillsSection: 'Forge built-in skills',
    builtInSkillsHint: 'Built-in skills that can be added directly to the current install list, sorted by role and stack priority.',
    communityReposSection: 'Community repositories',
    communityReposHint: 'External skill repositories for further expansion. They remain browse-only by default.',
    externalSearchSection: 'External search',
    externalSearchHintSkills: 'Search third-party skills from skills.sh and install them directly into the current client after confirmation.',
    externalSearchHintMcp: 'Search the Official MCP Registry. Only entries that map safely into the current client config expose direct install.',
    searchingExternal: 'Searching external sources...',
    externalSearchError: 'External search failed. Check network access or CLI output.',
    externalSourceLabel: 'Search source',
    installToCurrentPlatform: 'Install to current client',
    installToCurrentPlatformBusy: 'Installing...',
    requiresSecrets: 'Requires secrets',
    browseOnlyReason: 'Browse-only entry',
    searchFromSkillsSh: 'Using skills.sh as the external skill source.',
    searchFromOfficialMcp: 'Using the Official MCP Registry as the external MCP source.',
    externalInstallDone: 'Installed into the current client config.',
    externalInstallFailed: 'Install failed. Check the command log.',
    officialStatus: 'Official status',
    installableNow: 'Installable now',
    browseOnlyTag: 'Browse only',
    externalMcpConfirmTitle: 'Confirm external MCP install',
    externalMcpConfirmHint: 'Forge will write the command / args / env below into the current client config. Secret-backed entries are shown by variable name only.',
    targetClientLabel: 'Target client',
    commandLabel: 'command',
    argsLabel: 'args',
    envLabel: 'env',
    noArgs: 'No additional args.',
    noEnv: 'No extra env entries.',
    noSecrets: 'No extra secrets.',
    installSourceLabel: 'Install source',
    zh: '中文',
    en: 'English',
    ja: '日本語',
  },
  ja: {
    productName: 'Forge',
    platform: 'プラットフォーム',
    community: 'コミュニティ',
    settings: '設定',
    detectRunning: '現在のプラットフォーム環境を検出中...',
    detectLoaded: 'プラットフォーム状態を読み込みました。',
    detectFailed: 'Forge 状態を読み込めません。Tauri bridge と Forge CLI を確認してください。',
    detectPreview: 'ブラウザプレビューではローカル mock 状態を使っています。',
    refresh: '更新',
    installForge: 'Forge を導入',
    updateForge: 'Forge を更新',
    repairForge: 'Forge を修復',
    verifyNow: '今すぐ検証',
    openTerminal: 'ターミナルを開く',
    openConfig: '設定ディレクトリを開く',
    officialInstall: '公式クライアントを導入',
    currentWorkspace: 'ワークスペース',
    detected: '検出',
    configured: '設定済み',
    healthy: '正常',
    missing: '未導入',
    status: '状態',
    platformWorkbench: 'プラットフォーム作業台',
    communityWorkbench: 'コミュニティ拡張',
    installContents: '今回の導入内容',
    baseLayer: '基本レイヤー',
    optionalLayer: '任意レイヤー',
    alwaysInstalled: '必須',
    selectedInstall: '選択済み',
    installScope: '導入範囲',
    environment: '環境検出',
    forgeState: 'Forge 状態',
    supported: '対応レベル',
    installedPath: 'パス',
    notConfigured: 'Forge はまだ設定されていません',
    healthyState: '利用可能',
    needsRepair: '修復が必要',
    unknown: '不明',
    systemDetected: 'クライアントは利用可能です。Forge をそのまま導入できます。',
    systemMissing: 'CLI または設定ディレクトリがありません。先に公式クライアントを導入してください。',
    officialCommand: '公式インストールコマンド',
    copied: 'コピー済み',
    copy: 'コピー',
    viewLog: 'ログを表示',
    hideLog: 'ログを閉じる',
    commandLog: 'コマンドログ',
    clearLog: 'クリア',
    communityHint: 'ここでは Forge 内蔵の機能一覧とコミュニティ入口を扱います。内蔵 MCP はプラットフォーム画面で MCP を選ぶと一緒に書き込まれます。',
    roleRecommendations: '役割別の推奨',
    installPersona: '導入プロファイル',
    installPersonaHint: '先に現在の役割とスタックを選ぶと、導入ダイアログ内の項目がその文脈で並び替え・推薦されます。',
    rolePackLabel: 'ロールパック',
    stackPackLabel: 'スタックパック',
    recommendedPreset: '推奨で選択',
    recommendedBadge: '推奨',
    addToInstallList: '導入一覧に追加',
    switchToPlatform: 'プラットフォーム導入へ戻る',
    currentPersona: '現在のプロファイル',
    roleBoundInstallHint: '内蔵項目は現在のプラットフォーム導入一覧へ直接追加できます。コミュニティリポジトリは閲覧入口のままです。',
    roleRecommendationHint: 'まず役割別の推奨を見て、必要な場合だけ下のコミュニティソースを追加してください。',
    recommendedStacksLabel: '推奨スタック',
    recommendedSkillsLabel: '推奨 Skills',
    officialMcpLabel: '公式 MCP',
    companionToolsLabel: '補助ツール',
    domainPackLabel: 'ドメインスタック',
    domainPackHint: '現在のドメイン stack に合わせて、より業務寄りの MCP とツール候補を補います。',
    domainRecommendedMcpLabel: 'ドメイン推奨 MCP',
    domainRecommendedToolsLabel: 'ドメイン補助ツール',
    searchPlaceholder: '名前、ソース、説明で検索',
    skillsTab: 'Skills',
    mcpTab: 'MCP',
    openRepo: 'リポジトリを開く',
    copySource: 'ソースをコピー',
    builtIn: 'Forge 内蔵',
    manualImport: 'コミュニティ導入',
    language: '言語',
    theme: 'テーマ',
    lightTheme: 'ライト',
    systemTheme: 'システム',
    exaKey: 'EXA API Key',
    exaHint: 'MCP を選択したときだけ現在のプラットフォーム設定へ書き込みます。出力とログは自動的にマスクされます。',
    exaSection: 'シークレットとトークン',
    logSection: 'コマンドログ',
    confirmTitleInstall: '導入確認',
    confirmTitleUpdate: '更新確認',
    confirmTitleRepair: '修復確認',
    confirmAction: '実行する',
    cancel: 'キャンセル',
    confirmHint: '確認後にだけ現在のプラットフォーム設定へ書き込みます。今回の対象を下にまとめています。',
    selectedOptionalEmpty: '任意項目は未選択です。Forge の基本レイヤーのみ保持します。',
    modalBase: '基本レイヤー（固定）',
    modalOptional: '任意レイヤー（今回の選択）',
    noSecretYet: '追加の token / key はまだ設定されていません。',
    secretsCollapsedHint: '今後 key が必要な MCP やコミュニティ skill もここに置きます。',
    logCollapsedHint: 'ログは普段は折りたたみ、必要な時だけ開きます。',
    saveSelection: '現在のプラットフォームへ導入',
    restartHint: 'クライアントが起動中なら、導入後に再起動してください。',
    lastUpdated: '更新時刻',
    noItems: '一致する項目がありません',
    baseInstallNote: 'この 4 項目は現行版では必須です。ルール、ロール、スクリプト、ワークフローを壊さないためです。',
    optionalInstallNote: 'この 3 項目は実際のインストール処理に接続されていて、切り替えできます。',
    optionalSelectHint: '各コンポーネントを縦に展開し、現在のプラットフォームへ書き込む MCP / Skill を個別に選択します。',
    detailItems: '詳細項目',
    selectedCount: '選択済み',
    noDetails: 'このプラットフォームで選べる詳細項目はありません。',
    memoryDetailsHint: '現行版では project memory、learned ディレクトリ、workspace 雛形をまとめて初期化します。',
    detailChoose: '導入を選択',
    detailIncluded: '書き込み対象',
    selectAll: 'すべて選択',
    clearAll: 'クリア',
    platformReady: 'このプラットフォームは Forge 導入の前提を満たしています。',
    platformBlocked: 'このプラットフォームは前提不足のため、Forge は設定を書き込みません。',
    supportedOn: '対応プラットフォーム',
    openSource: 'ソース',
    installViaHome: 'プラットフォーム画面から導入',
    browseOnly: '閲覧のみ',
    builtInSkillsSection: 'Forge 内蔵 Skills',
    builtInSkillsHint: '現在のプラットフォームへ直接追加できる内蔵 skill です。役割とスタックの優先度で並び替えます。',
    communityReposSection: 'コミュニティリポジトリ',
    communityReposHint: 'さらに拡張するための外部 skill リポジトリ入口です。既定では閲覧のみです。',
    externalSearchSection: '外部検索',
    externalSearchHintSkills: 'skills.sh から第三者 skill を検索し、確認後に現在のクライアントへ直接導入できます。',
    externalSearchHintMcp: 'Official MCP Registry を検索します。現在のクライアント設定へ安全に写せる項目だけ直接導入を表示します。',
    searchingExternal: '外部ソースを検索中...',
    externalSearchError: '外部検索に失敗しました。ネットワークまたは CLI 出力を確認してください。',
    externalSourceLabel: '検索ソース',
    installToCurrentPlatform: '現在のクライアントへ導入',
    installToCurrentPlatformBusy: '導入中...',
    requiresSecrets: '必要な secrets',
    browseOnlyReason: '閲覧のみの項目',
    searchFromSkillsSh: '外部 skill ソースとして skills.sh を使用します。',
    searchFromOfficialMcp: '外部 MCP ソースとして Official MCP Registry を使用します。',
    externalInstallDone: '現在のクライアント設定へ導入しました。',
    externalInstallFailed: '導入に失敗しました。コマンドログを確認してください。',
    officialStatus: '公式ステータス',
    installableNow: '直接導入可',
    browseOnlyTag: '閲覧のみ',
    externalMcpConfirmTitle: 'external MCP 導入の確認',
    externalMcpConfirmHint: '下の command / args / env を現在のクライアント設定へ書き込みます。secret が必要な項目は変数名だけを表示します。',
    targetClientLabel: '対象クライアント',
    commandLabel: 'command',
    argsLabel: 'args',
    envLabel: 'env',
    noArgs: '追加の args はありません。',
    noEnv: '追加の env はありません。',
    noSecrets: '追加の secrets はありません。',
    installSourceLabel: '導入ソース',
    zh: '中文',
    en: 'English',
    ja: '日本語',
  },
};

const optionalOptions: InstallOption[] = [
  {
    id: 'mcp',
    title: 'MCP',
    summary: '联网搜索、记忆、浏览器、文档查询等外部能力。',
    effect: '安装时会把 Forge 内置的 MCP 服务器写入当前平台配置，EXA key 也只在这里生效。',
    required: false,
    icon: PlugZap,
  },
  {
    id: 'skills',
    title: 'Skills',
    summary: '前端、调试、后端、文档等专项能力包。',
    effect: '安装时会把 Forge 技能复制到当前平台的 skills 目录，保留 learned 目录。',
    required: false,
    icon: Sparkles,
  },
  {
    id: 'memory',
    title: 'Memory / Learned',
    summary: '项目记忆、learned 技能、工作区沉淀。',
    effect: '安装时会初始化项目 memory、learned 目录与工作区脚手架。',
    required: false,
    icon: BrainCircuit,
  },
];

const baseOptions: InstallOption[] = [
  {
    id: 'hooks',
    title: 'Hooks',
    summary: '关键时机的自动检查与学习触发。',
    effect: '当前版本作为 Forge 基础层安装，避免规则链断开。',
    required: true,
    icon: Hammer,
  },
  {
    id: 'rules',
    title: 'Rules',
    summary: '统一行为规范、强制提示词和守则。',
    effect: '当前版本作为 Forge 基础层安装，保证三端行为收敛。',
    required: true,
    icon: ShieldCheck,
  },
  {
    id: 'stacks',
    title: 'Stacks',
    summary: '前端、Java、Python 等技术栈约束。',
    effect: '当前版本作为 Forge 基础层安装，确保 stack prompt 工程完整。',
    required: true,
    icon: Boxes,
  },
  {
    id: 'commands',
    title: 'Commands / Playbooks',
    summary: 'planner、architect、tdd 等固定工作流入口。',
    effect: '当前版本作为 Forge 基础层安装，保证任务路由和脚本可用。',
    required: true,
    icon: Bot,
  },
];

const mcpDetailOptions: DetailOption[] = [
  { id: 'sequential-thinking', title: 'sequential-thinking', summary: '复杂问题分步推理。', clients: ['claude', 'codex', 'gemini'] },
  { id: 'context7', title: 'context7', summary: '文档与示例检索。', clients: ['claude', 'codex', 'gemini'] },
  { id: 'memory', title: 'memory', summary: '跨会话记忆。', clients: ['claude', 'codex', 'gemini'] },
  { id: 'fetch', title: 'fetch', summary: '通用 HTTP 抓取。', clients: ['claude', 'codex', 'gemini'] },
  { id: 'playwright', title: 'playwright', summary: '浏览器自动化与网页验证。', clients: ['claude', 'codex', 'gemini'] },
  { id: 'deepwiki', title: 'deepwiki', summary: '开源仓库说明与结构检索。', clients: ['claude', 'codex', 'gemini'] },
  { id: 'exa', title: 'exa', summary: '联网搜索，需要 EXA key。', note: '未填写 EXA key 时不会写入。', clients: ['claude', 'codex', 'gemini'] },
  { id: 'pencil', title: 'pencil', summary: '设计画布与视觉编辑。', note: '仅在 Codex / Gemini 的 macOS 环境可用。', clients: ['codex', 'gemini'] },
];

const skillDetailOptions: DetailOption[] = forgeSkillOptions.map((item) => ({ ...item }));

const communityEntries: CommunityEntry[] = [
  {
    id: 'anthropic-skills',
    name: 'anthropics/skills',
    source: 'GitHub',
    description: 'Anthropic 官方技能仓库，适合参考 Forge 与 Claude 能力建模。',
    url: 'https://github.com/anthropics/skills',
    kind: 'skills',
    clients: ['claude', 'codex', 'gemini'],
    note: '可作为社区 Skills 源仓库。',
  },
  {
    id: 'awesome-claude-skills',
    name: 'ComposioHQ/awesome-claude-skills',
    source: 'GitHub',
    description: '聚合型社区技能仓库，适合浏览外部技能来源。',
    url: 'https://github.com/ComposioHQ/awesome-claude-skills',
    kind: 'skills',
    clients: ['claude', 'codex', 'gemini'],
    note: '当前页面提供仓库浏览和来源复制。',
  },
  {
    id: 'baoyu-skills',
    name: 'JimLiu/baoyu-skills',
    source: 'GitHub',
    description: '中文社区技能集合，适合补充本地技能库。',
    url: 'https://github.com/JimLiu/baoyu-skills',
    kind: 'skills',
    clients: ['claude', 'codex', 'gemini'],
    note: '适合用于社区 Skills 参考与扩展。',
  },
  {
    id: 'mcp-servers',
    name: 'modelcontextprotocol/servers',
    source: 'GitHub',
    description: 'MCP 官方服务器集合，适合扩展非 Forge 内置的 server。',
    url: 'https://github.com/modelcontextprotocol/servers',
    kind: 'mcp',
    clients: ['claude', 'codex', 'gemini'],
    note: 'Forge 内置 MCP 已通过首页的 MCP 选项安装。',
  },
  {
    id: 'context7',
    name: '@upstash/context7-mcp',
    source: 'npm / GitHub',
    description: '文档与代码示例检索 MCP，已属于 Forge 默认内置集。',
    url: 'https://github.com/upstash/context7',
    kind: 'mcp',
    clients: ['claude', 'codex', 'gemini'],
    note: '勾选 MCP 后会随 Forge 一起安装。',
  },
  {
    id: 'playwright-mcp',
    name: '@executeautomation/playwright-mcp-server',
    source: 'npm / GitHub',
    description: '浏览器自动化 MCP，适合验证 UI 和网页操作。',
    url: 'https://github.com/executeautomation/mcp-playwright',
    kind: 'mcp',
    clients: ['claude', 'codex', 'gemini'],
    note: 'Forge 已内置浏览器 MCP 路由。',
  },
];

const officialInstallCommands: Record<Client, { label: string; command: string }> = {
  claude: {
    label: 'Anthropic docs',
    command: 'npm install -g @anthropic-ai/claude-code',
  },
  codex: {
    label: 'OpenAI docs',
    command: 'npm i -g @openai/codex',
  },
  gemini: {
    label: 'Google Gemini CLI',
    command: 'npm install -g @google/gemini-cli',
  },
};

const mockDoctorReport: DoctorReport = {
  detection: [
    { name: 'claude', home: '/Users/uui6yee/.claude', homeLabel: '~/.claude', detected: true, configured: true },
    { name: 'codex', home: '/Users/uui6yee/.codex', homeLabel: '~/.codex', detected: true, configured: true },
    { name: 'gemini', home: '/Users/uui6yee/.gemini', homeLabel: '~/.gemini', detected: false, configured: false },
  ],
  capabilityMatrix: {
    capabilities: {
      mcp: { claude: 'Native', codex: 'Native', gemini: 'Native' },
      rules_policy_routing: { claude: 'Native', codex: 'Adapted', gemini: 'Adapted' },
      stacks: { claude: 'Native', codex: 'Adapted', gemini: 'Adapted' },
      learned_skills: { claude: 'Native', codex: 'Adapted', gemini: 'Adapted' },
      project_memory: { claude: 'Native', codex: 'Adapted', gemini: 'Adapted' },
      hooks: { claude: 'Native', codex: 'Adapted', gemini: 'Fallback' },
      slash_like_commands: { claude: 'Native', codex: 'Adapted', gemini: 'Fallback' },
    },
  },
  support: [
    { client: 'claude', ok: true, exitCode: 0 },
    { client: 'codex', ok: true, exitCode: 0 },
    { client: 'gemini', ok: false, exitCode: 1 },
  ],
};

function detectSystemLanguage(): Lang {
  const value = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
  if (value.startsWith('zh')) return 'zh';
  if (value.startsWith('ja')) return 'ja';
  return 'en';
}

function isTauriRuntime() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function sanitizeToken(value: string) {
  if (!value) return '';
  if (value.length <= 8) return '••••';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function toneForStatus(status: 'healthy' | 'needs-repair' | 'unknown') {
  if (status === 'healthy') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  if (status === 'needs-repair') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}

function clientTint(client: Client) {
  if (client === 'claude') return 'bg-orange-50 text-orange-700 ring-orange-200';
  if (client === 'codex') return 'bg-slate-100 text-slate-700 ring-slate-200';
  return 'bg-sky-50 text-sky-700 ring-sky-200';
}

function clientAccent(client: Client) {
  if (client === 'claude') return 'from-orange-500 to-amber-400';
  if (client === 'codex') return 'from-slate-700 to-slate-500';
  return 'from-sky-500 to-blue-500';
}

async function runForge(args: string[], cwd?: string) {
  try {
    return await invoke<string>('run_forge_cli', { args, cwd });
  } catch (error) {
    if (typeof error === 'string' && error.trim()) return error;
    if (error && typeof error === 'object') {
      const message = 'message' in error && typeof error.message === 'string' ? error.message : '';
      if (message.trim()) return message;
    }
    return `Tauri bridge unavailable. Run manually:\nnode packages/forge-cli/bin/forge.js ${args.join(' ')}`;
  }
}

async function runForgeJson<T>(args: string[], cwd?: string): Promise<T | null> {
  const output = await runForge(args, cwd);
  try {
    return JSON.parse(output) as T;
  } catch {
    return null;
  }
}

async function openTerminal(cwd: string) {
  try {
    await invoke('open_terminal_here', { cwd });
  } catch {
    window.alert(`Open terminal manually in:\n${cwd}`);
  }
}

async function openTarget(target: string) {
  try {
    await invoke('open_target', { target });
  } catch {
    window.open(target, '_blank', 'noopener,noreferrer');
  }
}

function encodeBase64Json(value: unknown) {
  const payload = JSON.stringify(value);
  const bytes = new TextEncoder().encode(payload);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function App() {
  const [section, setSection] = React.useState<Section>('platform');
  const [communityKind, setCommunityKind] = React.useState<CommunityKind>('skills');
  const [activeRolePack, setActiveRolePack] = React.useState<RolePack>('product-manager');
  const [installRolePack, setInstallRolePack] = React.useState<InstallRolePack>('developer');
  const [installStackPack, setInstallStackPack] = React.useState<StackPack>('frontend');
  const [workspace, setWorkspace] = React.useState('/Users/uui6yee/Desktop/dev/forge');
  const [lang, setLang] = React.useState<Lang>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('forge.desktop.lang') : null;
    return (saved as Lang) || detectSystemLanguage();
  });
  const [activeClient, setActiveClient] = React.useState<Client>('claude');
  const [report, setReport] = React.useState<DoctorReport | null>(null);
  const [statusMessage, setStatusMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRunning, setIsRunning] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<string>('');
  const [exaKey, setExaKey] = React.useState('');
  const [logExpanded, setLogExpanded] = React.useState(false);
  const [secretExpanded, setSecretExpanded] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmMode, setConfirmMode] = React.useState<'install' | 'repair'>('install');
  const [pendingExternalMcp, setPendingExternalMcp] = React.useState<ExternalMcpConfirmData | null>(null);
  const [resultLog, setResultLog] = React.useState('Ready.');
  const [copiedKey, setCopiedKey] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selectedOptional, setSelectedOptional] = React.useState<Record<OptionalComponent, boolean>>({
    mcp: true,
    skills: true,
    memory: true,
  });
  const [selectedMcpDetails, setSelectedMcpDetails] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(mcpDetailOptions.map((item) => [item.id, true])),
  );
  const [selectedSkillDetails, setSelectedSkillDetails] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(skillDetailOptions.map((item) => [item.id, true])),
  );
  const [externalSearchLoading, setExternalSearchLoading] = React.useState(false);
  const [externalSearchError, setExternalSearchError] = React.useState('');
  const [externalSkillResults, setExternalSkillResults] = React.useState<ExternalSkillResult[]>([]);
  const [externalMcpResults, setExternalMcpResults] = React.useState<ExternalMcpResult[]>([]);
  const [externalSources, setExternalSources] = React.useState<ExternalRegistrySource[]>([]);
  const [externalInstallBusy, setExternalInstallBusy] = React.useState('');

  const t = messages[lang];

  React.useEffect(() => {
    window.localStorage.setItem('forge.desktop.lang', lang);
  }, [lang]);

  React.useEffect(() => {
    const allowed = installRoleStacks[installRolePack];
    if (!allowed.includes(installStackPack)) {
      setInstallStackPack(allowed[0]);
    }
  }, [installRolePack, installStackPack]);

  React.useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const previous = document.body.style.overflow;
    if (confirmOpen || pendingExternalMcp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previous || '';
    }
    return () => {
      document.body.style.overflow = previous || '';
    };
  }, [confirmOpen, pendingExternalMcp]);

  React.useEffect(() => {
    if (section !== 'community') return undefined;
    const q = search.trim();
    if (!q) {
      setExternalSearchError('');
      setExternalSearchLoading(false);
      setExternalSources([]);
      setExternalSkillResults([]);
      setExternalMcpResults([]);
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        setExternalSearchLoading(true);
        setExternalSearchError('');
        const payload = await runForgeJson<ExternalSearchPayload>(
          ['external-search', '--kind', communityKind, '--query', q],
          workspace,
        );
        if (!active) return;
        if (!payload) {
          setExternalSources([]);
          if (communityKind === 'skills') {
            setExternalSkillResults([]);
          } else {
            setExternalMcpResults([]);
          }
          setExternalSearchError(t.externalSearchError);
          setExternalSearchLoading(false);
          return;
        }
        setExternalSources(payload.sources || []);
        if (communityKind === 'skills') {
          setExternalSkillResults((payload.results || []) as ExternalSkillResult[]);
          setExternalMcpResults([]);
        } else {
          setExternalMcpResults((payload.results || []) as ExternalMcpResult[]);
          setExternalSkillResults([]);
        }
        setExternalSearchLoading(false);
      })();
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [communityKind, search, section, t.externalSearchError, workspace]);

  const loadState = React.useCallback(async () => {
    setIsLoading(true);
    setStatusMessage(t.detectRunning);
    const next = await runForgeJson<DoctorReport>(['doctor', '--client', 'claude,codex,gemini', '--json'], workspace);
    if (!next) {
      if (!isTauriRuntime()) {
        setReport(mockDoctorReport);
        setActiveClient(mockDoctorReport.detection.find((item) => item.detected)?.name || 'claude');
        setStatusMessage(t.detectPreview);
        setLastUpdated(new Date().toLocaleString());
        setIsLoading(false);
        return;
      }

      setStatusMessage(t.detectFailed);
      setIsLoading(false);
      return;
    }

    setReport(next);
    const firstDetected = next.detection.find((item) => item.detected)?.name;
    setActiveClient((current) => {
      const stillVisible = next.detection.some((item) => item.name === current && item.detected);
      return stillVisible ? current : (firstDetected || current);
    });
    setStatusMessage(t.detectLoaded);
    setLastUpdated(new Date().toLocaleString());
    setIsLoading(false);
  }, [t.detectFailed, t.detectLoaded, t.detectRunning, workspace]);

  React.useEffect(() => {
    setStatusMessage(t.detectRunning);
  }, [t.detectRunning]);

  React.useEffect(() => {
    void loadState();
  }, [loadState]);

  const runAction = React.useCallback(async (args: string[]) => {
    setIsRunning(true);
    setResultLog('Running...');
    const output = await runForge(args, workspace);
    setResultLog(output || 'Completed without output.');
    setLogExpanded(true);
    await loadState();
    setIsRunning(false);
  }, [loadState, workspace]);

  const detection = React.useMemo(() => report?.detection.find((item) => item.name === activeClient) || null, [report, activeClient]);
  const support = React.useMemo(() => report?.support.find((item) => item.client === activeClient) || null, [report, activeClient]);
  const capabilityMap = report?.capabilityMatrix.capabilities || {};

  const currentStatus: 'healthy' | 'needs-repair' | 'unknown' = React.useMemo(() => {
    if (!detection?.detected) return 'unknown';
    if (support?.ok) return 'healthy';
    if (detection.detected) return 'needs-repair';
    return 'unknown';
  }, [detection, support]);

  const optionalComponentList = React.useMemo(() => optionalOptions.filter((item) => true), []);
  const installGuide = React.useMemo(() => installRoleGuide(installRolePack), [installRolePack]);
  const activeDomainGuide = React.useMemo(
    () => (isDomainStackPack(installStackPack) ? forgeDomainMcpMatrix.stacks[installStackPack] : null),
    [installStackPack],
  );
  const activeRoleGuide = React.useMemo(() => forgeRoleMcpMatrix.roles[activeRolePack], [activeRolePack]);
  const recommendedMcpIdSet = React.useMemo<Set<string>>(() => new Set([
    ...installGuide.recommendedMcp.map((entry) => String(entry.id)),
    ...(activeDomainGuide?.recommendedMcp?.map((entry) => String(entry.id)) || []),
  ]), [installGuide, activeDomainGuide]);
  const recommendedSkillIdSet = React.useMemo<Set<string>>(() => new Set(
    forgeSkillOptions
      .filter((item) => item.clients.includes(activeClient))
      .filter((item) => (item.recommendedByRole as readonly string[] | undefined)?.includes(installRolePack) || (item.recommendedByStack as readonly string[] | undefined)?.includes(installStackPack) || (item.primaryFor as readonly string[] | undefined)?.includes(installRolePack))
      .map((item) => String(item.id)),
  ), [activeClient, installRolePack, installStackPack]);
  const mcpDetailList = React.useMemo(
    () => mcpDetailOptions
      .filter((item) => item.clients.includes(activeClient))
      .sort((a, b) => Number(recommendedMcpIdSet.has(b.id)) - Number(recommendedMcpIdSet.has(a.id)) || a.title.localeCompare(b.title)),
    [activeClient, recommendedMcpIdSet],
  );
  const skillDetailList = React.useMemo(
    () => skillDetailOptions
      .filter((item) => item.clients.includes(activeClient))
      .sort((a, b) => Number(recommendedSkillIdSet.has(b.id)) - Number(recommendedSkillIdSet.has(a.id)) || a.title.localeCompare(b.title)),
    [activeClient, recommendedSkillIdSet],
  );
  const preferredExternalSkillTerms = React.useMemo(
    () => tokenizeSearchTerms(
      ...Array.from(recommendedSkillIdSet),
      installRolePack,
      installStackPack,
      roleLabel(installRolePack, lang),
      stackLabel(installStackPack, lang),
    ),
    [installRolePack, installStackPack, lang, recommendedSkillIdSet],
  );
  const preferredExternalMcpTerms = React.useMemo(
    () => tokenizeSearchTerms(
      ...Array.from(recommendedMcpIdSet),
      ...installGuide.recommendedMcp.map((entry) => entry.label),
      ...activeRoleGuide.recommendedMcp.map((entry) => entry.label),
      ...roleGuideExtraTools(activeRoleGuide).map((entry) => entry.label),
      ...(activeDomainGuide?.recommendedMcp?.map((entry) => entry.label) || []),
      ...(activeDomainGuide ? domainGuideExtraTools(activeDomainGuide).map((entry) => entry.label) : []),
      installRolePack,
      installStackPack,
      roleLabel(installRolePack, lang),
      stackLabel(installStackPack, lang),
    ),
    [activeDomainGuide, activeRoleGuide, installGuide, installRolePack, installStackPack, lang, recommendedMcpIdSet],
  );
  const selectedMcpServerIds = React.useMemo(
    () => mcpDetailList.filter((item) => selectedMcpDetails[item.id]).map((item) => item.id),
    [mcpDetailList, selectedMcpDetails],
  );
  const selectedSkillIds = React.useMemo(
    () => skillDetailList.filter((item) => selectedSkillDetails[item.id]).map((item) => item.id),
    [skillDetailList, selectedSkillDetails],
  );
  const selectedComponentIds = React.useMemo(() => {
    const ids: OptionalComponent[] = [];
    if (selectedMcpServerIds.length) ids.push('mcp');
    if (selectedSkillIds.length) ids.push('skills');
    if (selectedOptional.memory) ids.push('memory');
    return ids;
  }, [selectedMcpServerIds.length, selectedOptional.memory, selectedSkillIds.length]);

  const applyRecommendedPreset = React.useCallback(() => {
    setSelectedMcpDetails((current) => ({
      ...current,
      ...Object.fromEntries(mcpDetailList.map((item) => [item.id, recommendedMcpIdSet.has(item.id)])),
    }));
    setSelectedSkillDetails((current) => ({
      ...current,
      ...Object.fromEntries(skillDetailList.map((item) => [item.id, recommendedSkillIdSet.has(item.id)])),
    }));
    setSelectedOptional((current) => ({
      ...current,
      mcp: mcpDetailList.some((item) => recommendedMcpIdSet.has(item.id)),
      skills: skillDetailList.some((item) => recommendedSkillIdSet.has(item.id)),
      memory: true,
    }));
  }, [mcpDetailList, recommendedMcpIdSet, recommendedSkillIdSet, skillDetailList]);

  const installLabel = React.useMemo(() => {
    if (!detection?.detected) return t.officialInstall;
    if (detection.configured && support?.ok) return t.updateForge;
    return t.installForge;
  }, [detection, support, t.installForge, t.officialInstall, t.updateForge]);

  const searchResults = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return communityEntries.filter((item) => {
      if (item.kind !== communityKind) return false;
      if (!q) return true;
      return [item.name, item.source, item.description, item.note].join(' ').toLowerCase().includes(q);
    });
  }, [communityKind, search]);
  const builtInSkillResults = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const layerOrder: SkillLayer[] = ['core', 'extended', 'specialized', 'experimental'];
    return forgeSkillOptions
      .filter((item) => item.clients.includes(activeClient))
      .filter((item) => {
        if (!q) return true;
        return [
          item.id,
          item.title,
          item.summary,
          ...(item.primaryFor || []),
          ...(item.recommendedByRole || []),
          ...(item.recommendedByStack || []),
        ].join(' ').toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const recommendedDiff = Number(recommendedSkillIdSet.has(b.id)) - Number(recommendedSkillIdSet.has(a.id));
        if (recommendedDiff !== 0) return recommendedDiff;
        const layerDiff = layerOrder.indexOf(normalizeSkillLayer(a.layer)) - layerOrder.indexOf(normalizeSkillLayer(b.layer));
        if (layerDiff !== 0) return layerDiff;
        return a.title.localeCompare(b.title);
      });
  }, [activeClient, recommendedSkillIdSet, search]);
  const builtInSkillGroups = React.useMemo(() => groupSkillsByLayer(builtInSkillResults), [builtInSkillResults]);
  const communityRepoResults = React.useMemo(
    () => searchResults.filter((entry) => entry.kind === 'skills'),
    [searchResults],
  );
  const externalSkillResultsSorted = React.useMemo(
    () => [...externalSkillResults].sort((a, b) => {
      const scoreDiff = scoreExternalSkill(b, search, recommendedSkillIdSet, preferredExternalSkillTerms)
        - scoreExternalSkill(a, search, recommendedSkillIdSet, preferredExternalSkillTerms);
      if (scoreDiff !== 0) return scoreDiff;
      return a.title.localeCompare(b.title);
    }),
    [externalSkillResults, preferredExternalSkillTerms, recommendedSkillIdSet, search],
  );
  const externalMcpResultsSorted = React.useMemo(
    () => [...externalMcpResults].sort((a, b) => {
      const scoreDiff = scoreExternalMcp(b, search, recommendedMcpIdSet, preferredExternalMcpTerms)
        - scoreExternalMcp(a, search, recommendedMcpIdSet, preferredExternalMcpTerms);
      if (scoreDiff !== 0) return scoreDiff;
      return a.title.localeCompare(b.title);
    }),
    [externalMcpResults, preferredExternalMcpTerms, recommendedMcpIdSet, search],
  );
  const roleRecommendedSkills = React.useMemo(
    () => {
      const ids = new Set<string>(activeRoleGuide.recommendedSkills as readonly string[]);
      return forgeSkillOptions
        .filter((item) => ids.has(item.id))
        .sort((a, b) => {
          const layerOrder: SkillLayer[] = ['core', 'extended', 'specialized', 'experimental'];
          const diff = layerOrder.indexOf(normalizeSkillLayer(a.layer)) - layerOrder.indexOf(normalizeSkillLayer(b.layer));
          return diff !== 0 ? diff : a.title.localeCompare(b.title);
        });
    },
    [activeRoleGuide],
  );
  const roleRecommendedSkillGroups = React.useMemo(() => groupSkillsByLayer(roleRecommendedSkills), [roleRecommendedSkills]);

  const builtInMcpIds = React.useMemo(() => new Set(mcpDetailOptions.map((item) => item.id)), []);
  const builtInSkillIds = React.useMemo(() => new Set(skillDetailOptions.map((item) => item.id)), []);

  const detectionCounts = React.useMemo(() => ({
    detected: report?.detection.filter((item) => item.detected).length || 0,
    configured: report?.detection.filter((item) => item.configured).length || 0,
    healthy: report?.support.filter((item) => item.ok).length || 0,
  }), [report]);

  const currentSupportLabel = React.useCallback((name: string) => {
    const value = capabilityMap[name]?.[activeClient] || 'Unknown';
    return value;
  }, [activeClient, capabilityMap]);

  const handleCopy = React.useCallback(async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(''), 1800);
    } catch {
      setResultLog(`Copy failed.\n${value}`);
      setLogExpanded(true);
    }
  }, []);

  const addBuiltInSkillToInstall = React.useCallback((id: string) => {
    setSelectedOptional((current) => ({ ...current, skills: true }));
    setSelectedSkillDetails((current) => ({ ...current, [id]: true }));
    setSection('platform');
    setResultLog(`Added skill to install list: ${id}`);
  }, []);

  const addBuiltInMcpToInstall = React.useCallback((id: string) => {
    setSelectedOptional((current) => ({ ...current, mcp: true }));
    setSelectedMcpDetails((current) => ({ ...current, [id]: true }));
    setSection('platform');
    setResultLog(`Added MCP to install list: ${id}`);
  }, []);

  const installExternalSkillToCurrent = React.useCallback(async (entry: ExternalSkillResult) => {
    const busyKey = `skill:${entry.id}`;
    setExternalInstallBusy(busyKey);
    const result = await runForgeJson<{ ok: boolean; installed?: { targetDir?: string } }>(
      ['external-install-skill', '--client', activeClient, '--source', entry.source, '--skill', entry.skill],
      workspace,
    );
    if (!result?.ok) {
      setResultLog(`${t.externalInstallFailed}\n${entry.skill}`);
      setLogExpanded(true);
      setExternalInstallBusy('');
      return;
    }
    setResultLog(`${t.externalInstallDone}\n${entry.skill}\n${result.installed?.targetDir || ''}`.trim());
    setSection('platform');
    setSelectedOptional((current) => ({ ...current, skills: true }));
    setSelectedSkillDetails((current) => ({ ...current, [entry.skill]: true }));
    setLogExpanded(true);
    setExternalInstallBusy('');
    await loadState();
  }, [activeClient, loadState, t.externalInstallDone, t.externalInstallFailed, workspace]);

  const confirmExternalMcpInstall = React.useCallback(async () => {
    if (!pendingExternalMcp) return;
    const { entry, busyKey } = pendingExternalMcp;
    setPendingExternalMcp(null);
    setExternalInstallBusy(busyKey);
    const specBase64 = encodeBase64Json(entry);
    const result = await runForgeJson<{ ok: boolean }>(
      ['external-install-mcp', '--client', activeClient, '--name', entry.installSpec?.name || entry.name, '--spec-base64', specBase64],
      workspace,
    );
    if (!result?.ok) {
      setResultLog(`${t.externalInstallFailed}\n${entry.title}`);
      setLogExpanded(true);
      setExternalInstallBusy('');
      return;
    }
    setResultLog(`${t.externalInstallDone}\n${entry.title}`);
    setSection('platform');
    setSelectedOptional((current) => ({ ...current, mcp: true }));
    if (entry.installSpec?.name) {
      setSelectedMcpDetails((current) => ({ ...current, [entry.installSpec?.name || entry.name]: true }));
    }
    setLogExpanded(true);
    setExternalInstallBusy('');
    await loadState();
  }, [activeClient, loadState, pendingExternalMcp, t.externalInstallDone, t.externalInstallFailed, workspace]);

  const requestExternalMcpInstall = React.useCallback(async (entry: ExternalMcpResult) => {
    if (!entry.installable || !entry.installSpec) {
      if (entry.url) {
        await openTarget(entry.url);
      }
      return;
    }
    const busyKey = `mcp:${entry.id}`;
    setPendingExternalMcp({ entry, busyKey });
  }, []);

  const openConfirm = React.useCallback((mode: 'install' | 'repair') => {
    if (!detection?.detected) {
      void handleCopy(`${activeClient}-official`, officialInstallCommands[activeClient].command);
      return;
    }
    setConfirmMode(mode);
    setConfirmOpen(true);
  }, [activeClient, detection, handleCopy]);

  const executeConfirmedAction = React.useCallback(async () => {
    const args = [
      confirmMode === 'repair' ? 'repair' : 'install',
      activeClient,
      '--non-interactive',
      '--components',
      selectedComponentIds.join(','),
    ];
    if (selectedMcpServerIds.length) {
      args.push('--mcp-servers', selectedMcpServerIds.join(','));
    }
    if (selectedSkillIds.length) {
      args.push('--skills-list', selectedSkillIds.join(','));
    }
    if (exaKey && selectedMcpServerIds.includes('exa')) {
      args.push('--exa-api-key', exaKey);
    }
    setConfirmOpen(false);
    await runAction(args);
  }, [activeClient, confirmMode, exaKey, runAction, selectedComponentIds, selectedMcpServerIds, selectedSkillIds]);

  const platformTabs = clientOrder.map((client) => ({
    id: client,
    ...clientMeta(client),
  }));

  return (
    <div className="min-h-screen bg-[#f3f1ea] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-4 py-4">
        <header className="flex items-center justify-between gap-5 pb-5">
          <div className="flex items-center gap-4">
            <AppForgeMark className="h-10 w-10 rounded-[12px] shadow-[0_12px_24px_rgba(15,23,42,0.18)]" />
            <div>
              <div className="text-[16px] font-semibold tracking-[-0.02em]">{t.productName}</div>
              <div className="text-[13px] text-slate-500">{t.currentWorkspace}: <span className="font-mono text-[11px] text-slate-600">{workspace}</span></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-[14px] border border-slate-200 bg-white/90 p-1 shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
              {platformTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSection('platform');
                    setActiveClient(tab.id);
                  }}
                  className={`rounded-[10px] px-4 py-2 text-[13px] font-medium transition ${section === 'platform' && activeClient === tab.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <tab.Icon className="h-[20px] w-[20px] shrink-0" />
                    <span>{tab.label}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="inline-flex items-center gap-1 rounded-[14px] border border-slate-200 bg-white/90 p-1 shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
              <TopAction label={t.community} active={section === 'community'} onClick={() => setSection('community')} icon={<Search className="h-4 w-4" />} />
              <TopAction label={t.settings} active={section === 'settings'} onClick={() => setSection('settings')} icon={<Settings2 className="h-4 w-4" />} />
            </div>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-[minmax(0,1fr)_160px_160px_160px] gap-3">
          <div className={`rounded-[14px] border px-3 py-2.5 shadow-[0_14px_28px_rgba(15,23,42,0.05)] ${isLoading ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{section === 'platform' ? t.platformWorkbench : section === 'community' ? t.communityWorkbench : t.settings}</div>
                <div className="mt-2 text-[17px] font-semibold tracking-[-0.02em]">{section === 'platform' ? platformTabs.find((item) => item.id === activeClient)?.label : section === 'community' ? t.communityWorkbench : t.settings}</div>
                <div className="mt-1 text-[13px] text-slate-600">{statusMessage}</div>
              </div>
              <button type="button" onClick={() => void loadState()} disabled={isLoading || isRunning} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-600 disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {t.refresh}
              </button>
            </div>
          </div>
          <CounterCard label={t.detected} value={detectionCounts.detected} />
          <CounterCard label={t.configured} value={detectionCounts.configured} />
          <CounterCard label={t.healthy} value={detectionCounts.healthy} accent />
        </section>

        <main className="min-h-0 flex-1">
          {section === 'platform' && detection && (
            <div className="flex min-h-0 flex-col gap-4">
              <section className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-4">
                  <div>
                    <div className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${clientTint(activeClient)}`}>
                      {(() => {
                        const activeTab = platformTabs.find((item) => item.id === activeClient);
                        if (!activeTab) return null;
                        return (
                          <>
                            <activeTab.Icon className="h-[18px] w-[18px]" />
                            <span>{activeTab.label}</span>
                          </>
                        );
                      })()}
                    </div>
                    <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.03em]">{t.platformWorkbench}</h2>
                    <p className="mt-1 text-[13px] text-slate-500">{detection.detected ? t.platformReady : t.platformBlocked}</p>
                  </div>
                  <div className={`rounded-[14px] bg-gradient-to-br px-3 py-2.5 text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)] ${clientAccent(activeClient)}`}>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/75">{t.forgeState}</div>
                    <div className="mt-1 text-[17px] font-semibold">{currentStatus === 'healthy' ? t.healthyState : currentStatus === 'needs-repair' ? t.needsRepair : t.notConfigured}</div>
                  </div>
                </div>

                <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <StatusMetric title={t.environment} value={detection.detected ? t.detected : t.missing} tone={detection.detected ? 'good' : 'neutral'} compact />
                      <StatusMetric title={t.forgeState} value={detection.configured ? t.configured : t.notConfigured} tone={detection.configured ? 'good' : 'neutral'} compact />
                      <StatusMetric title={t.status} value={currentStatus === 'healthy' ? t.healthyState : currentStatus === 'needs-repair' ? t.needsRepair : t.unknown} tone={currentStatus === 'healthy' ? 'good' : currentStatus === 'needs-repair' ? 'warn' : 'neutral'} compact />
                      <StatusMetric title={t.supported} value={currentSupportLabel('mcp')} tone="neutral" compact />
                    </div>

                    <div className="mt-4 rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="text-[13px] font-medium text-slate-900">{detection.detected ? t.systemDetected : t.systemMissing}</div>
                      <div className="mt-1 text-[11px] text-slate-500">{t.installedPath}: <span className="font-mono text-slate-700">{detection.home}</span></div>
                    </div>

                    {!detection.detected && (
                      <div className="mt-4 rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[13px] font-medium text-slate-900">{t.officialCommand}</div>
                            <div className="mt-1 font-mono text-[11px] text-slate-600">{officialInstallCommands[activeClient].command}</div>
                          </div>
                          <button type="button" onClick={() => handleCopy(`${activeClient}-official-inline`, officialInstallCommands[activeClient].command)} className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
                            {copiedKey === `${activeClient}-official-inline` ? t.copied : t.copy}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="grid gap-2">
                      <ActionButton label={installLabel} primary onClick={() => openConfirm('install')} disabled={isRunning} icon={<Hammer className="h-3.5 w-3.5" />} compact />
                      <ActionButton label={t.verifyNow} onClick={() => void runAction(['verify', '--client', activeClient])} disabled={isRunning || !detection.detected} icon={<CheckCheck className="h-3.5 w-3.5" />} compact />
                      <ActionButton label={t.repairForge} onClick={() => openConfirm('repair')} disabled={isRunning || !detection.detected} icon={<RefreshCw className="h-3.5 w-3.5" />} compact />
                      <ActionButton label={t.openConfig} onClick={() => void openTarget(detection.home)} disabled={!detection.home} icon={<FolderOpen className="h-3.5 w-3.5" />} compact />
                      <ActionButton label={t.openTerminal} onClick={() => void openTerminal(workspace)} icon={<TerminalSquare className="h-3.5 w-3.5" />} compact />
                    </div>
                    <div className="mt-3 text-[11px] text-slate-500">{t.restartHint}</div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                <div className="border-b border-slate-100 px-4 py-4">
                  <div className="text-[15px] font-semibold text-slate-900">{t.installPersona}</div>
                  <div className="mt-1 text-[12px] text-slate-500">{t.installPersonaHint}</div>
                </div>
                <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_160px]">
                  <div>
                    <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.rolePackLabel}</div>
                    <div className="flex flex-wrap gap-2">
                      {installRoleOrder.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setInstallRolePack(role)}
                          className={`rounded-[10px] border px-3 py-2 text-[12px] font-medium ${installRolePack === role ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                        >
                          {roleLabel(role, lang)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.stackPackLabel}</div>
                    <div className="flex flex-wrap gap-2">
                      {installRoleStacks[installRolePack].map((stack) => (
                        <button
                          key={stack}
                          type="button"
                          onClick={() => setInstallStackPack(stack)}
                          className={`rounded-[10px] border px-3 py-2 text-[12px] font-medium ${installStackPack === stack ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                        >
                          {stackLabel(stack, lang)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button type="button" onClick={applyRecommendedPreset} className="inline-flex w-full items-center justify-center rounded-[10px] bg-slate-900 px-3 py-2.5 text-[12px] font-medium text-white">{t.recommendedPreset}</button>
                  </div>
                </div>
              </section>

              <FoldSection title={t.exaSection} hint={t.secretsCollapsedHint} expanded={secretExpanded} onToggle={() => setSecretExpanded((value) => !value)}>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]">
                  <div>
                    <input
                      type="password"
                      value={exaKey}
                      onChange={(event) => setExaKey(event.target.value)}
                      placeholder="EXA_API_KEY"
                      className="w-full rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-[13px] outline-none transition focus:border-slate-400"
                    />
                    <div className="mt-2 text-[11px] text-slate-500">{t.exaHint}</div>
                  </div>
                  <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-3 text-[11px] text-slate-600">
                    <div>{t.status}: <span className="font-mono text-slate-900">{sanitizeToken(exaKey) || t.noSecretYet}</span></div>
                  </div>
                </div>
              </FoldSection>

              <FoldSection title={t.logSection} hint={t.logCollapsedHint} expanded={logExpanded} onToggle={() => setLogExpanded((value) => !value)}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">{t.lastUpdated}: {lastUpdated || '...'}</div>
                  <button type="button" onClick={() => setResultLog('Ready.')} className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">{t.clearLog}</button>
                </div>
                <pre className="max-h-[420px] overflow-auto rounded-[12px] bg-[#07111f] p-3 font-mono text-[11px] leading-5 text-slate-100">{resultLog}</pre>
              </FoldSection>

              {confirmOpen && (
                <ConfirmModal
                  title={confirmMode === 'repair' ? t.confirmTitleRepair : detection.configured ? t.confirmTitleUpdate : t.confirmTitleInstall}
                  hint={t.confirmHint}
                  lang={lang}
                  baseTitle={t.modalBase}
                  optionalTitle={t.modalOptional}
                  emptyText={t.selectedOptionalEmpty}
                  confirmLabel={t.confirmAction}
                  cancelLabel={t.cancel}
                  onCancel={() => setConfirmOpen(false)}
                  onConfirm={() => void executeConfirmedAction()}
                  baseOptions={baseOptions}
                  t={t}
                  mcpItems={mcpDetailList}
                  selectedMcpDetails={selectedMcpDetails}
                  onToggleMcp={(id) => setSelectedMcpDetails((current) => ({ ...current, [id]: !current[id] }))}
                  onToggleAllMcp={() => setSelectedMcpDetails(
                    Object.fromEntries(
                      mcpDetailList.map((item) => [
                        item.id,
                        !(mcpDetailList.length > 0 && selectedMcpServerIds.length === mcpDetailList.length),
                      ]),
                    ),
                  )}
                  skillItems={skillDetailList}
                  selectedSkillDetails={selectedSkillDetails}
                  onToggleSkill={(id) => setSelectedSkillDetails((current) => ({ ...current, [id]: !current[id] }))}
                  onToggleAllSkill={() => setSelectedSkillDetails(
                    Object.fromEntries(
                      skillDetailList.map((item) => [
                        item.id,
                        !(skillDetailList.length > 0 && selectedSkillIds.length === skillDetailList.length),
                      ]),
                    ),
                  )}
                  memoryEnabled={selectedOptional.memory}
                  onToggleMemory={() => setSelectedOptional((current) => ({ ...current, memory: !current.memory }))}
                  installRoleLabel={roleLabel(installRolePack, lang)}
                  installStackLabel={stackLabel(installStackPack, lang)}
                  domainPackLabel={isDomainStackPack(installStackPack) ? stackLabel(installStackPack, lang) : null}
                  domainPackHint={activeDomainGuide ? t.domainPackHint : null}
                  domainRecommendedMcpLabel={t.domainRecommendedMcpLabel}
                  domainRecommendedToolsLabel={t.domainRecommendedToolsLabel}
                  domainRecommendedMcp={activeDomainGuide?.recommendedMcp || []}
                  domainRecommendedTools={activeDomainGuide ? domainGuideExtraTools(activeDomainGuide) : []}
                  recommendedMcpIds={recommendedMcpIdSet}
                  recommendedSkillIds={recommendedSkillIdSet}
                  onApplyRecommended={applyRecommendedPreset}
                />
              )}
              {pendingExternalMcp && (
                <ExternalMcpConfirmModal
                  entry={pendingExternalMcp.entry}
                  activeClient={activeClient}
                  lang={lang}
                  t={t}
                  onCancel={() => setPendingExternalMcp(null)}
                  onConfirm={() => void confirmExternalMcpInstall()}
                />
              )}
            </div>
          )}
          {section === 'community' && (
            <div className="grid h-full grid-rows-[auto_1fr] gap-4">
              <section className="rounded-[14px] border border-slate-200 bg-white px-4 py-4 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[20px] font-semibold tracking-[-0.03em]">{t.communityWorkbench}</div>
                    <div className="mt-2 max-w-3xl text-[13px] text-slate-500">{t.communityHint}</div>
                  </div>
                  <div className="inline-flex rounded-[12px] border border-slate-200 bg-slate-50 p-1">
                    <button type="button" onClick={() => setCommunityKind('skills')} className={`rounded-[14px] px-4 py-2 text-[13px] ${communityKind === 'skills' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>{t.skillsTab}</button>
                    <button type="button" onClick={() => setCommunityKind('mcp')} className={`rounded-[14px] px-4 py-2 text-[13px] ${communityKind === 'mcp' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>{t.mcpTab}</button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                  <label className="rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Search className="h-4 w-4" />
                      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.searchPlaceholder} className="w-full border-0 bg-transparent p-0 text-[13px] text-slate-900 outline-none" />
                    </div>
                  </label>
                  <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <span>{t.supportedOn}:</span>
                      {(() => {
                        const activeTab = platformTabs.find((item) => item.id === activeClient);
                        if (!activeTab) return null;
                        return (
                          <span className="inline-flex items-center gap-1.5 text-slate-900">
                            <activeTab.Icon className="h-[20px] w-[20px]" />
                            <span>{activeTab.label}</span>
                          </span>
                        );
                      })()}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-[14px] border border-slate-200 bg-white px-4 py-4 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[16px] font-semibold tracking-[-0.02em] text-slate-950">{t.roleRecommendations}</div>
                    <div className="mt-1 text-[13px] text-slate-500">{t.roleRecommendationHint}</div>
                    <div className="mt-2 text-[12px] text-slate-400">{t.currentPersona}: {roleLabel(installRolePack, lang)} / {stackLabel(installStackPack, lang)} · {t.roleBoundInstallHint}</div>
                  </div>
                  <div className="inline-flex flex-wrap rounded-[12px] border border-slate-200 bg-slate-50 p-1">
                    {roleOrder.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setActiveRolePack(role)}
                        className={`rounded-[10px] px-3 py-2 text-[12px] font-medium ${
                          activeRolePack === role ? 'bg-slate-900 text-white' : 'text-slate-600'
                        }`}
                      >
                        {roleLabel(role, lang)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.recommendedStacksLabel}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeRoleGuide.recommendedStacks.map((stack) => (
                        <span key={stack} className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                          {stackLabel(stack as StackPack, lang)}
                        </span>
                      ))}
                    </div>
                    {activeDomainGuide && (
                      <div className="mt-5">
                        <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.domainPackLabel}</div>
                        <div className="mt-2 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                          {stackLabel(installStackPack, lang)}
                        </div>
                        <div className="mt-2 text-[12px] text-slate-500">{t.domainPackHint}</div>
                      </div>
                    )}
                    {communityKind === 'skills' && (
                      <div className="mt-5">
                        <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.recommendedSkillsLabel}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {activeRoleGuide.recommendedSkills.map((skillId) => (
                            <span key={skillId} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                              {skillId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {communityKind === 'mcp' ? activeRoleGuide.recommendedMcp.map((entry) => (
                      <article
                        key={entry.id}
                        className="rounded-[12px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[15px] font-semibold text-slate-950">{entry.label}</div>
                            <div className="mt-1 text-[13px] text-slate-500">{entry.why}</div>
                          </div>
                          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-200">
                            MCP
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="text-[12px] text-slate-500">{entry.type}</span>
                          <button
                            type="button"
                            onClick={() => void openTarget(entry.source)}
                            className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {t.openRepo}
                          </button>
                        </div>
                      </article>
                    )) : roleRecommendedSkillGroups.map((group) => (
                      <div key={group.layer} className="md:col-span-2 overflow-hidden rounded-[12px] border border-slate-200 bg-slate-50">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                          <div>
                            <div className="text-[13px] font-medium text-slate-900">{skillLayerLabel(group.layer, lang)}</div>
                            <div className="mt-1 text-[12px] text-slate-500">{skillLayerHint(group.layer, lang)}</div>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                            {group.items.length}
                          </span>
                        </div>
                        <div className="grid gap-3 p-3 md:grid-cols-2">
                          {group.items.map((entry) => (
                            <article
                              key={entry.id}
                              className="rounded-[12px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="text-[15px] font-semibold text-slate-950">{entry.title}</div>
                                    {entry.clusterRole && (
                                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${skillClusterRoleTint(entry.clusterRole)}`}>
                                        {skillClusterRoleLabel(entry.clusterRole, lang)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 text-[13px] text-slate-500">{entry.summary}</div>
                                  {skillSupportHint(entry) && <div className="mt-1 text-[12px] text-slate-400">{skillSupportHint(entry)}</div>}
                                </div>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                                  {skillLayerLabel(normalizeSkillLayer(entry.layer), lang)}
                                </span>
                              </div>
                              <div className="mt-4 flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={() => addBuiltInSkillToInstall(entry.id)}
                                  className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900 px-3 py-2 text-[12px] font-medium text-white"
                                >
                                  <PlusIcon className="h-3.5 w-3.5" />
                                  {t.addToInstallList}
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    ))}
                    {communityKind === 'mcp' && roleGuideExtraTools(activeRoleGuide).length > 0 && (
                      <article className="md:col-span-2 rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.companionToolsLabel}</div>
                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                          {roleGuideExtraTools(activeRoleGuide).map((tool) => (
                            <div key={tool.id} className="rounded-[10px] border border-slate-200 bg-white px-3 py-3">
                              <div className="text-[13px] font-medium text-slate-900">{tool.label}</div>
                              <div className="mt-1 text-[12px] text-slate-500">{tool.why}</div>
                            </div>
                          ))}
                        </div>
                      </article>
                    )}
                    {communityKind === 'mcp' && activeDomainGuide && (
                      <article className="md:col-span-2 rounded-[12px] border border-indigo-200 bg-indigo-50/50 px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-indigo-500">{t.domainPackLabel}</div>
                            <div className="mt-1 text-[14px] font-semibold text-slate-950">{stackLabel(installStackPack, lang)}</div>
                            <div className="mt-1 text-[12px] text-slate-500">{t.domainPackHint}</div>
                          </div>
                        </div>
                        {activeDomainGuide.recommendedMcp?.length > 0 && (
                          <div className="mt-4">
                            <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.domainRecommendedMcpLabel}</div>
                            <div className="mt-3 grid gap-2 md:grid-cols-2">
                              {activeDomainGuide.recommendedMcp.map((entry) => (
                                <div key={entry.id} className="rounded-[10px] border border-indigo-200 bg-white px-3 py-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="text-[13px] font-medium text-slate-900">{entry.label}</div>
                                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">MCP</span>
                                  </div>
                                  <div className="mt-1 text-[12px] text-slate-500">{entry.why}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {domainGuideExtraTools(activeDomainGuide).length > 0 && (
                          <div className="mt-4">
                            <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.domainRecommendedToolsLabel}</div>
                            <div className="mt-3 grid gap-2 md:grid-cols-2">
                              {domainGuideExtraTools(activeDomainGuide).map((tool) => (
                                <div key={tool.id} className="rounded-[10px] border border-indigo-200 bg-white px-3 py-3">
                                  <div className="text-[13px] font-medium text-slate-900">{tool.label}</div>
                                  <div className="mt-1 text-[12px] text-slate-500">{tool.why}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </article>
                    )}
                  </div>
                </div>
              </section>

              {communityKind === 'skills' ? (
                <div className="space-y-4">
                  <section className="rounded-[14px] border border-slate-200 bg-white px-4 py-4 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[16px] font-semibold tracking-[-0.02em] text-slate-950">{t.externalSearchSection}</div>
                        <div className="mt-1 text-[13px] text-slate-500">{t.externalSearchHintSkills}</div>
                        <div className="mt-2 text-[12px] text-slate-400">
                          {t.externalSourceLabel}: {externalSources[0]?.name || 'skills.sh'} · {t.searchFromSkillsSh}
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {externalSkillResultsSorted.length}
                      </span>
                    </div>
                    <div className="mt-4">
                      {externalSearchLoading ? (
                        <div className="rounded-[12px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
                          {t.searchingExternal}
                        </div>
                      ) : externalSearchError ? (
                        <div className="rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-4 text-[13px] text-rose-700">
                          {externalSearchError}
                        </div>
                      ) : search.trim() && externalSkillResultsSorted.length === 0 ? (
                        <div className="rounded-[12px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
                          {t.noItems}
                        </div>
                      ) : (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {externalSkillResultsSorted.map((entry) => (
                            <article key={entry.id} className="flex flex-col rounded-[12px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-[15px] font-semibold text-slate-950">{entry.title}</div>
                                  <div className="mt-1 text-[13px] text-slate-500">{entry.description}</div>
                                </div>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                                  {entry.sourceLabel}
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 ring-1 ring-slate-200">{entry.source}</span>
                                {entry.installs && <span className="rounded-full bg-slate-100 px-2.5 py-1 ring-1 ring-slate-200">{entry.installs} installs</span>}
                              </div>
                              <div className="mt-auto flex items-center justify-end gap-2 pt-4">
                                {entry.url && (
                                  <button type="button" onClick={() => void openTarget(entry.url!)} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700">
                                    <ExternalLink className="h-4 w-4" />
                                    {t.openRepo}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => void installExternalSkillToCurrent(entry)}
                                  disabled={externalInstallBusy === `skill:${entry.id}`}
                                  className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900 px-3 py-2 text-[12px] font-medium text-white disabled:opacity-50"
                                >
                                  <PlusIcon className="h-3.5 w-3.5" />
                                  {externalInstallBusy === `skill:${entry.id}` ? t.installToCurrentPlatformBusy : t.installToCurrentPlatform}
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="rounded-[14px] border border-slate-200 bg-white px-4 py-4 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[16px] font-semibold tracking-[-0.02em] text-slate-950">{t.builtInSkillsSection}</div>
                        <div className="mt-1 text-[13px] text-slate-500">{t.builtInSkillsHint}</div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {builtInSkillResults.length}
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {builtInSkillGroups.length === 0 ? (
                        <div className="rounded-[12px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
                          {t.noItems}
                        </div>
                      ) : builtInSkillGroups.map((group) => (
                        <div key={group.layer} className="overflow-hidden rounded-[12px] border border-slate-200 bg-slate-50">
                          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                            <div>
                              <div className="text-[13px] font-medium text-slate-900">{skillLayerLabel(group.layer, lang)}</div>
                              <div className="mt-1 text-[12px] text-slate-500">{skillLayerHint(group.layer, lang)}</div>
                            </div>
                            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                              {group.items.length}
                            </span>
                          </div>
                          <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
                            {group.items.map((entry) => (
                              <article key={entry.id} className="flex flex-col rounded-[12px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <div className="text-[15px] font-semibold tracking-[-0.02em] text-slate-950">{entry.title}</div>
                                      {entry.clusterRole && (
                                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${skillClusterRoleTint(entry.clusterRole)}`}>
                                          {skillClusterRoleLabel(entry.clusterRole, lang)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-1 text-[13px] text-slate-500">{entry.summary}</div>
                                    {skillSupportHint(entry) && <div className="mt-1 text-[12px] text-slate-400">{skillSupportHint(entry)}</div>}
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    {recommendedSkillIdSet.has(entry.id) && (
                                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
                                        {t.recommendedBadge}
                                      </span>
                                    )}
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                                      {skillLayerLabel(normalizeSkillLayer(entry.layer), lang)}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-4 flex items-center justify-end">
                                  <button
                                    type="button"
                                    onClick={() => addBuiltInSkillToInstall(entry.id)}
                                    className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900 px-3 py-2 text-[12px] font-medium text-white"
                                  >
                                    <PlusIcon className="h-3.5 w-3.5" />
                                    {t.addToInstallList}
                                  </button>
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[14px] border border-slate-200 bg-white px-4 py-4 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[16px] font-semibold tracking-[-0.02em] text-slate-950">{t.communityReposSection}</div>
                        <div className="mt-1 text-[13px] text-slate-500">{t.communityReposHint}</div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {communityRepoResults.length}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-3">
                      {communityRepoResults.length === 0 && (
                        <div className="col-span-full rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-slate-500">
                          {t.noItems}
                        </div>
                      )}
                      {communityRepoResults.map((entry) => (
                        <article key={entry.id} className="flex flex-col rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[17px] font-semibold tracking-[-0.02em] text-slate-950">{entry.name}</div>
                              <div className="mt-1 text-[13px] text-slate-500">{entry.description}</div>
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                              {t.skillsTab}
                            </span>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {entry.clients.map((client) => (
                              <span key={`${entry.id}-${client}`} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${clientTint(client)}`}>
                                {(() => {
                                  const tab = platformTabs.find((item) => item.id === client);
                                  if (!tab) return null;
                                  return (
                                    <>
                                      <tab.Icon className="h-[18px] w-[18px]" />
                                      <span>{tab.label}</span>
                                    </>
                                  );
                                })()}
                              </span>
                            ))}
                          </div>
                          <div className="mt-4 rounded-[12px] bg-slate-50 px-4 py-4 text-[13px] text-slate-600">
                            <div className="font-medium text-slate-900">{t.openSource}</div>
                            <div className="mt-1">{entry.source}</div>
                            <div className="mt-3 text-slate-500">{entry.note}</div>
                          </div>
                          <div className="mt-auto flex items-center justify-end gap-2 pt-5">
                            <button type="button" onClick={() => void openTarget(entry.url)} className="inline-flex items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700">
                              <ExternalLink className="h-4 w-4" />
                              {t.openRepo}
                            </button>
                            <button type="button" onClick={() => void handleCopy(entry.id, entry.url)} className="inline-flex items-center gap-2 rounded-[14px] bg-slate-900 px-3 py-2 text-[13px] text-white">
                              <Copy className="h-4 w-4" />
                              {copiedKey === entry.id ? t.copied : t.copySource}
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="space-y-4">
                  <section className="rounded-[14px] border border-slate-200 bg-white px-4 py-4 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[16px] font-semibold tracking-[-0.02em] text-slate-950">{t.externalSearchSection}</div>
                        <div className="mt-1 text-[13px] text-slate-500">{t.externalSearchHintMcp}</div>
                        <div className="mt-2 text-[12px] text-slate-400">
                          {t.externalSourceLabel}: {externalSources[0]?.name || 'Official MCP Registry'} · {t.searchFromOfficialMcp}
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {externalMcpResultsSorted.length}
                      </span>
                    </div>
                    <div className="mt-4">
                      {externalSearchLoading ? (
                        <div className="rounded-[12px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
                          {t.searchingExternal}
                        </div>
                      ) : externalSearchError ? (
                        <div className="rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-4 text-[13px] text-rose-700">
                          {externalSearchError}
                        </div>
                      ) : search.trim() && externalMcpResultsSorted.length === 0 ? (
                        <div className="rounded-[12px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
                          {t.noItems}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                          {externalMcpResultsSorted.map((entry) => (
                            <article key={entry.id} className="flex flex-col rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-[17px] font-semibold tracking-[-0.02em] text-slate-950">{entry.title}</div>
                                  <div className="mt-1 text-[13px] text-slate-500">{entry.description}</div>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${entry.installable ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                                  {entry.installable ? t.installableNow : t.browseOnlyTag}
                                </span>
                              </div>
                              <div className="mt-4 rounded-[12px] bg-slate-50 px-4 py-4 text-[13px] text-slate-600">
                                <div className="font-medium text-slate-900">{entry.sourceLabel}</div>
                                {entry.officialStatus && <div className="mt-1">{t.officialStatus}: {entry.officialStatus}</div>}
                                {entry.requiredSecrets && entry.requiredSecrets.length > 0 && (
                                  <div className="mt-3 text-slate-500">{t.requiresSecrets}: {entry.requiredSecrets.join(', ')}</div>
                                )}
                                {!entry.installable && <div className="mt-3 text-slate-500">{entry.installReason || t.browseOnlyReason}</div>}
                              </div>
                              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                                <button type="button" onClick={() => void openTarget(entry.url || 'https://registry.modelcontextprotocol.io/')} className="inline-flex items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700">
                                  <ExternalLink className="h-4 w-4" />
                                  {t.openRepo}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void requestExternalMcpInstall(entry)}
                                  disabled={externalInstallBusy === `mcp:${entry.id}`}
                                  className={`inline-flex items-center gap-2 rounded-[14px] px-3 py-2 text-[13px] ${entry.installable ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'} disabled:opacity-50`}
                                >
                                  <PlusIcon className="h-4 w-4" />
                                  {externalInstallBusy === `mcp:${entry.id}` ? t.installToCurrentPlatformBusy : entry.installable ? t.installToCurrentPlatform : t.browseOnlyTag}
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                <section className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                  {searchResults.length === 0 && (
                    <div className="col-span-full rounded-[14px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500">
                      {t.noItems}
                    </div>
                  )}

                  {searchResults.map((entry) => (
                    <article key={entry.id} className="flex flex-col rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[17px] font-semibold tracking-[-0.02em] text-slate-950">{entry.name}</div>
                          <div className="mt-1 text-[13px] text-slate-500">{entry.description}</div>
                        </div>
                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
                          MCP
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entry.clients.map((client) => (
                          <span key={`${entry.id}-${client}`} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${clientTint(client)}`}>
                            {(() => {
                              const tab = platformTabs.find((item) => item.id === client);
                              if (!tab) return null;
                              return (
                                <>
                                  <tab.Icon className="h-[18px] w-[18px]" />
                                  <span>{tab.label}</span>
                                </>
                              );
                            })()}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 rounded-[12px] bg-slate-50 px-4 py-4 text-[13px] text-slate-600">
                        <div className="font-medium text-slate-900">{t.openSource}</div>
                        <div className="mt-1">{entry.source}</div>
                        <div className="mt-3 text-slate-500">{entry.note}</div>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                        <button type="button" onClick={() => void openTarget(entry.url)} className="inline-flex items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700">
                          <ExternalLink className="h-4 w-4" />
                          {t.openRepo}
                        </button>
                        <div className="flex items-center gap-2">
                          {(entry.kind === 'mcp' && builtInMcpIds.has(entry.id)) && (
                            <button type="button" onClick={() => addBuiltInMcpToInstall(entry.id)} className="inline-flex items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700">
                              <PlusIcon className="h-4 w-4" />
                              {t.addToInstallList}
                            </button>
                          )}
                          <button type="button" onClick={() => void handleCopy(entry.id, entry.url)} className="inline-flex items-center gap-2 rounded-[14px] bg-slate-900 px-3 py-2 text-[13px] text-white">
                            <Copy className="h-4 w-4" />
                            {copiedKey === entry.id ? t.copied : t.copySource}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </section>
                </div>
              )}
            </div>
          )}

          {section === 'settings' && (
            <div className="grid h-full grid-cols-[minmax(0,1fr)_360px] gap-4">
              <section className="rounded-[14px] border border-slate-200 bg-white px-4 py-4 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
                <div className="text-[20px] font-semibold tracking-[-0.03em]">{t.settings}</div>
                <div className="mt-6 space-y-6">
                  <div>
                    <div className="mb-3 text-[13px] font-medium text-slate-800">{t.language}</div>
                    <div className="inline-flex rounded-[12px] border border-slate-200 bg-slate-50 p-1">
                      {(['zh', 'en', 'ja'] as Lang[]).map((code) => (
                        <button key={code} type="button" onClick={() => setLang(code)} className={`rounded-[14px] px-4 py-2 text-[13px] ${lang === code ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>{t[code]}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-3 text-[13px] font-medium text-slate-800">{t.theme}</div>
                    <div className="inline-flex rounded-[12px] border border-slate-200 bg-slate-50 p-1">
                      <span className="rounded-[14px] bg-slate-900 px-4 py-2 text-[13px] text-white">{t.lightTheme}</span>
                      <span className="px-4 py-2 text-[13px] text-slate-500">{t.systemTheme}</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-3 text-[13px] font-medium text-slate-800">{t.currentWorkspace}</div>
                    <input value={workspace} onChange={(event) => setWorkspace(event.target.value)} className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-[13px] outline-none focus:border-slate-400" />
                  </div>
                </div>
              </section>

              <section className="rounded-[14px] border border-slate-200 bg-white px-4 py-4 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
                <div className="text-[17px] font-semibold">{t.platform}</div>
                <div className="mt-4 space-y-3">
                  {platformTabs.map((tab) => {
                    const item = report?.detection.find((entry) => entry.name === tab.id);
                    const ok = report?.support.find((entry) => entry.client === tab.id)?.ok;
                    return (
                      <div key={tab.id} className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="inline-flex items-center gap-2 font-medium text-slate-900">
                              <tab.Icon className="h-[20px] w-[20px]" />
                              <span>{tab.label}</span>
                            </div>
                            <div className="mt-1 text-[13px] text-slate-500">{item?.homeLabel || '...'}</div>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${toneForStatus(ok ? 'healthy' : item?.detected ? 'needs-repair' : 'unknown')}`}>
                            {ok ? t.healthyState : item?.detected ? t.needsRepair : t.unknown}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function clientMeta(client: Client): ClientMeta {
  if (client === 'claude') return { label: 'Claude', Icon: ClaudeMark };
  if (client === 'gemini') return { label: 'Gemini', Icon: GeminiMark };
  return { label: 'Codex', Icon: CodexMark };
}

function PlusIcon({ className }: { className?: string }) {
  return <Plus className={className} />;
}

function AppForgeMark({ className }: { className?: string }) {
  return <BrandImageIcon className={className} />;
}

function ClaudeMark({ className }: { className?: string }) {
  return <PlatformImageIcon src={claudeIcon} className={className} />;
}

function CodexMark({ className }: { className?: string }) {
  return <PlatformImageIcon src={codexIcon} className={className} />;
}

function GeminiMark({ className }: { className?: string }) {
  return <PlatformImageIcon src={geminiIcon} className={className} />;
}

function BrandImageIcon({ className }: { className?: string }) {
  return (
    <img src={forgeBloomIcon} alt="" className={className} aria-hidden="true" />
  );
}

function PlatformImageIcon({ src, className }: { src: string; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      className={`${className || ''} rounded-[6px] object-contain`}
      aria-hidden="true"
    />
  );
}

function supportKeyForOption(id: InstallOption['id']) {
  if (id === 'mcp') return 'mcp';
  if (id === 'hooks') return 'hooks';
  if (id === 'rules') return 'rules_policy_routing';
  if (id === 'stacks') return 'stacks';
  if (id === 'commands') return 'slash_like_commands';
  return 'project_memory';
}

function TopAction({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-[13px] font-medium ${active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
      {icon}
      {label}
    </button>
  );
}

function CounterCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-[14px] border px-3 py-2.5 shadow-[0_14px_28px_rgba(15,23,42,0.05)] ${accent ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className="mt-2 text-[34px] font-semibold tracking-[-0.05em]">{value}</div>
    </div>
  );
}

function ActionButton({ label, onClick, icon, primary, disabled, compact }: { label: string; onClick: () => void; icon: React.ReactNode; primary?: boolean; disabled?: boolean; compact?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex w-full items-center justify-between rounded-[10px] px-3 ${compact ? 'py-2.5 text-[13px]' : 'py-3 text-sm'} font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${primary ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
      <span className="inline-flex items-center gap-2">{icon}{label}</span>
      <span className="text-[11px] text-current/70">›</span>
    </button>
  );
}

function StatusMetric({ title, value, tone, compact }: { title: string; value: string; tone: 'good' | 'warn' | 'neutral'; compact?: boolean }) {
  const toneClass = tone === 'good' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : tone === 'warn' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-slate-100 text-slate-700 ring-slate-200';
  return (
    <div className={`rounded-[12px] border border-slate-200 bg-white ${compact ? 'px-3 py-3' : 'px-4 py-4'}`}>
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{title}</div>
      <div className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ${toneClass}`}>{value}</div>
    </div>
  );
}

function SectionTitle({ title, badge }: { title: string; badge: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-[17px] font-semibold text-slate-900">{title}</div>
      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">{badge}</div>
    </div>
  );
}

function FoldSection({ title, hint, expanded, onToggle, children }: { title: string; hint: string; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <div>
          <div className="text-[15px] font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-[12px] text-slate-500">{hint}</div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {expanded && <div className="border-t border-slate-100 px-4 py-4">{children}</div>}
    </section>
  );
}

function ConfirmModal({
  title,
  hint,
  lang,
  baseTitle,
  optionalTitle,
  emptyText,
  confirmLabel,
  cancelLabel,
  onCancel,
  onConfirm,
  baseOptions,
  t,
  mcpItems,
  selectedMcpDetails,
  onToggleMcp,
  onToggleAllMcp,
  skillItems,
  selectedSkillDetails,
  onToggleSkill,
  onToggleAllSkill,
  memoryEnabled,
  onToggleMemory,
  installRoleLabel,
  installStackLabel,
  domainPackLabel,
  domainPackHint,
  domainRecommendedMcpLabel,
  domainRecommendedToolsLabel,
  domainRecommendedMcp,
  domainRecommendedTools,
  recommendedMcpIds,
  recommendedSkillIds,
  onApplyRecommended,
}: {
  title: string;
  hint: string;
  lang: Lang;
  baseTitle: string;
  optionalTitle: string;
  emptyText: string;
  confirmLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  baseOptions: InstallOption[];
  t: Messages;
  mcpItems: DetailOption[];
  selectedMcpDetails: Record<string, boolean>;
  onToggleMcp: (id: string) => void;
  onToggleAllMcp: () => void;
  skillItems: DetailOption[];
  selectedSkillDetails: Record<string, boolean>;
  onToggleSkill: (id: string) => void;
  onToggleAllSkill: () => void;
  memoryEnabled: boolean;
  onToggleMemory: () => void;
  installRoleLabel: string;
  installStackLabel: string;
  domainPackLabel: string | null;
  domainPackHint: string | null;
  domainRecommendedMcpLabel: string;
  domainRecommendedToolsLabel: string;
  domainRecommendedMcp: readonly {
    id: string;
    label: string;
    why: string;
  }[];
  domainRecommendedTools: readonly {
    id: string;
    label: string;
    why: string;
  }[];
  recommendedMcpIds: Set<string>;
  recommendedSkillIds: Set<string>;
  onApplyRecommended: () => void;
}) {
  const [expanded, setExpanded] = React.useState<{ mcp: boolean; skills: boolean; memory: boolean }>({
    mcp: false,
    skills: false,
    memory: false,
  });
  const [skillLayerExpanded, setSkillLayerExpanded] = React.useState<Record<SkillLayer, boolean>>({
    core: true,
    extended: false,
    specialized: false,
    experimental: false,
  });
  const selectedMcpCount = mcpItems.filter((item) => selectedMcpDetails[item.id]).length;
  const selectedSkillCount = skillItems.filter((item) => selectedSkillDetails[item.id]).length;
  const allMcpSelected = mcpItems.length > 0 && selectedMcpCount === mcpItems.length;
  const allSkillsSelected = skillItems.length > 0 && selectedSkillCount === skillItems.length;
  const groupedSkillItems = React.useMemo(() => groupSkillsByLayer(skillItems), [skillItems]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[calc(100vh-32px)] w-full max-w-[720px] flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4">
          <div>
            <div className="text-[18px] font-semibold tracking-[-0.02em]">{title}</div>
            <div className="mt-1 text-[13px] text-slate-500">{hint}</div>
          </div>
          <button type="button" onClick={onCancel} className="rounded-[10px] border border-slate-200 bg-white p-2 text-slate-500"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 overflow-y-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700">{t.rolePackLabel}: {installRoleLabel}</span>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700">{t.stackPackLabel}: {installStackLabel}</span>
            </div>
            <button type="button" onClick={onApplyRecommended} className="text-[12px] font-medium text-slate-700">{t.recommendedPreset}</button>
          </div>
          {domainPackLabel && (
            <div className="rounded-[10px] border border-indigo-200 bg-indigo-50/60 px-3 py-3">
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-600">
                <span className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 font-medium text-slate-700">{t.domainPackLabel}: {domainPackLabel}</span>
              </div>
              {domainPackHint && <div className="mt-2 text-[12px] text-slate-500">{domainPackHint}</div>}
              {domainRecommendedMcp.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-indigo-500">{domainRecommendedMcpLabel}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {domainRecommendedMcp.map((entry) => (
                      <span key={entry.id} className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700">
                        {entry.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {domainRecommendedTools.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{domainRecommendedToolsLabel}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {domainRecommendedTools.map((tool) => (
                      <span key={tool.id} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700">
                        {tool.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div>
            <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400">{baseTitle}</div>
            <div className="space-y-2">
              {baseOptions.map((option) => <ConfirmRow key={option.id} option={option} />)}
            </div>
          </div>
          <div>
            <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400">{optionalTitle}</div>
            <div className="space-y-3">
              <ModalSelectGroup
                title="MCP"
                expanded={expanded.mcp}
                selectedCount={selectedMcpCount}
                selectedLabel={t.selectedCount}
                bulkLabel={allMcpSelected ? t.clearAll : t.selectAll}
                onToggleExpand={() => setExpanded((current) => ({ ...current, mcp: !current.mcp }))}
                onToggleAll={onToggleAllMcp}
              >
                {mcpItems.length === 0 ? (
                  <div className="rounded-[8px] border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-[12px] text-slate-500">{emptyText}</div>
                ) : (
                  <div className="space-y-2">
                    {mcpItems.map((item) => (
                                <DetailCheckboxRow
                                  key={item.id}
                                  item={item}
                                  lang={lang}
                                  checked={Boolean(selectedMcpDetails[item.id])}
                                  recommended={recommendedMcpIds.has(item.id)}
                                  recommendedLabel={t.recommendedBadge}
                                  onToggle={() => onToggleMcp(item.id)}
                                />
                    ))}
                  </div>
                )}
              </ModalSelectGroup>

              <ModalSelectGroup
                title="Skills"
                expanded={expanded.skills}
                selectedCount={selectedSkillCount}
                selectedLabel={t.selectedCount}
                bulkLabel={allSkillsSelected ? t.clearAll : t.selectAll}
                onToggleExpand={() => setExpanded((current) => ({ ...current, skills: !current.skills }))}
                onToggleAll={onToggleAllSkill}
              >
                {skillItems.length === 0 ? (
                  <div className="rounded-[8px] border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-[12px] text-slate-500">{emptyText}</div>
                ) : (
                  <div className="space-y-3">
                    {groupedSkillItems.map((group) => {
                      const selectedInGroup = group.items.filter((item) => selectedSkillDetails[item.id]).length;
                      return (
                        <div key={group.layer} className="overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
                          <button
                            type="button"
                            onClick={() => setSkillLayerExpanded((current) => ({ ...current, [group.layer]: !current[group.layer] }))}
                            className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                          >
                            <div>
                              <div className="text-[13px] font-medium text-slate-900">{skillLayerLabel(group.layer, lang)}</div>
                              <div className="mt-1 text-[11px] text-slate-500">
                                {skillLayerHint(group.layer, lang)} · {t.selectedCount} {selectedInGroup}/{group.items.length}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                                {group.items.length}
                              </span>
                              {skillLayerExpanded[group.layer] ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                            </div>
                          </button>
                          {skillLayerExpanded[group.layer] && (
                            <div className="space-y-2 border-t border-slate-200 bg-white px-3 py-3">
                              {group.items.map((item) => (
                                <DetailCheckboxRow
                                  key={item.id}
                                  item={item}
                                  lang={lang}
                                  checked={Boolean(selectedSkillDetails[item.id])}
                                  recommended={recommendedSkillIds.has(item.id)}
                                  recommendedLabel={t.recommendedBadge}
                                  onToggle={() => onToggleSkill(item.id)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ModalSelectGroup>

              <ModalSelectGroup
                title="Memory / Learned"
                expanded={expanded.memory}
                selectedCount={memoryEnabled ? 1 : 0}
                selectedLabel={t.selectedCount}
                onToggleExpand={() => setExpanded((current) => ({ ...current, memory: !current.memory }))}
              >
                <DetailCheckboxRow
                  item={{ id: 'memory', title: 'Memory / Learned', summary: t.memoryDetailsHint, clients: ['claude', 'codex', 'gemini'] }}
                  lang={lang}
                  checked={memoryEnabled}
                  onToggle={onToggleMemory}
                />
              </ModalSelectGroup>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-4">
          <button type="button" onClick={onCancel} className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700">{cancelLabel}</button>
          <button type="button" onClick={onConfirm} className="rounded-[10px] bg-slate-900 px-3 py-2 text-[13px] text-white">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmRow({ option }: { option: InstallOption }) {
  const Icon = option.icon;
  return (
    <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="flex items-center gap-2 text-[13px] font-medium text-slate-900"><Icon className="h-4 w-4 text-slate-600" />{option.title}</div>
      <div className="mt-1 text-[12px] text-slate-500">{option.effect}</div>
    </div>
  );
}

function ExternalMcpConfirmModal({
  entry,
  activeClient,
  lang,
  t,
  onCancel,
  onConfirm,
}: {
  entry: ExternalMcpResult;
  activeClient: Client;
  lang: Lang;
  t: Messages;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const spec = entry.installSpec;
  if (!spec) return null;
  const envEntries = Object.entries(spec.env || {});
  const secrets = entry.requiredSecrets || spec.requiredSecrets || [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[calc(100vh-32px)] w-full max-w-[760px] flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4">
          <div>
            <div className="text-[18px] font-semibold tracking-[-0.02em] text-slate-950">{t.externalMcpConfirmTitle}</div>
            <div className="mt-1 text-[13px] text-slate-500">{t.externalMcpConfirmHint}</div>
          </div>
          <button type="button" onClick={onCancel} className="rounded-[10px] border border-slate-200 bg-white p-2 text-slate-500"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 overflow-y-auto px-4 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <SummaryCard label={t.targetClientLabel} value={clientMeta(activeClient).label} />
            <SummaryCard label={t.installSourceLabel} value={entry.sourceLabel} />
            <SummaryCard label={t.officialStatus} value={entry.officialStatus || t.unknown} />
            <SummaryCard label={t.requiresSecrets} value={secrets.length > 0 ? secrets.join(', ') : t.noSecrets} />
          </div>

          <SpecBlock label={t.commandLabel} mono>
            {spec.command}
          </SpecBlock>

          <SpecBlock label={t.argsLabel} mono>
            {spec.args.length > 0 ? spec.args.join('\n') : t.noArgs}
          </SpecBlock>

          <SpecBlock label={t.envLabel} mono>
            {envEntries.length > 0 ? envEntries.map(([key, value]) => `${key}=${value || '<from secret>'}`).join('\n') : t.noEnv}
          </SpecBlock>

          {entry.description && (
            <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                {lang === 'zh' ? '说明' : lang === 'ja' ? '説明' : 'Description'}
              </div>
              <div className="mt-2 text-[13px] text-slate-600">{entry.description}</div>
            </div>
          )}

          {entry.installReason && (
            <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-3 text-[12px] text-amber-800">
              {entry.installReason}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-4">
          <button type="button" onClick={onCancel} className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700">{t.cancel}</button>
          <button type="button" onClick={onConfirm} className="rounded-[10px] bg-slate-900 px-3 py-2 text-[13px] text-white">{t.installToCurrentPlatform}</button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-[13px] font-medium text-slate-900">{value}</div>
    </div>
  );
}

function SpecBlock({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <pre className={`mt-2 whitespace-pre-wrap break-all rounded-[8px] border border-slate-200 bg-white px-3 py-3 text-[12px] text-slate-700 ${mono ? 'font-mono' : ''}`}>{children}</pre>
    </div>
  );
}

function ModalSelectGroup({
  title,
  expanded,
  selectedCount,
  selectedLabel,
  bulkLabel,
  onToggleExpand,
  onToggleAll,
  children,
}: {
  title: string;
  expanded: boolean;
  selectedCount: number;
  selectedLabel: string;
  bulkLabel?: string;
  onToggleExpand: () => void;
  onToggleAll?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between gap-3 px-3 py-3">
        <button type="button" onClick={onToggleExpand} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
          <div>
            <div className="text-[13px] font-medium text-slate-900">{title}</div>
            <div className="mt-1 text-[11px] text-slate-500">{selectedLabel} {selectedCount}</div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>
        {bulkLabel && onToggleAll && (
          <button type="button" onClick={onToggleAll} className="shrink-0 text-[12px] font-medium text-slate-700">
            {bulkLabel}
          </button>
        )}
      </div>
      {expanded && <div className="border-t border-slate-200 bg-white px-3 py-3">{children}</div>}
    </div>
  );
}

function InstallCard({
  option,
  t,
  support,
  checked,
  readOnly,
  onToggle,
  compact,
}: {
  option: InstallOption;
  t: Messages;
  support: string;
  checked: boolean;
  readOnly?: boolean;
  onToggle?: () => void;
  compact?: boolean;
}) {
  const Icon = option.icon;
  return (
    <div className={`border border-slate-200 bg-slate-50 ${compact ? 'rounded-[10px] p-3' : 'rounded-[22px] p-4'}`}>
      <div className="flex items-start gap-4">
        <div className={`mt-1 flex items-center justify-center rounded-[8px] bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.05)] ${compact ? 'h-9 w-9' : 'h-11 w-11'}`}>
          <Icon className={compact ? 'h-4.5 w-4.5' : 'h-5 w-5'} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={`${compact ? 'text-[14px]' : 'text-base'} font-semibold text-slate-900`}>{option.title}</div>
              <div className="mt-1 text-[12px] text-slate-500">{option.summary}</div>
            </div>
            {readOnly ? (
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">{t.alwaysInstalled}</span>
            ) : (
              <button type="button" onClick={onToggle} className={`inline-flex h-7 min-w-[54px] items-center rounded-full px-1 transition ${checked ? 'bg-slate-900 justify-end' : 'bg-slate-300 justify-start'}`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm">
                  {checked && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            )}
          </div>
          <div className="mt-3 rounded-[8px] bg-white px-3 py-2.5 text-[12px] text-slate-600">{option.effect}</div>
          <div className="mt-3 flex items-center justify-between gap-3 text-[12px]">
            <span className="text-slate-500">{t.supported}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{support}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionalInstallGroup({
  option,
  t,
  checked,
  expanded,
  support,
  selectedCount,
  bulkActionLabel,
  onBulkAction,
  onToggleChecked,
  onToggleExpanded,
  children,
}: {
  option: InstallOption;
  t: Messages;
  checked: boolean;
  expanded: boolean;
  support: string;
  selectedCount: number;
  bulkActionLabel?: string;
  onBulkAction?: () => void;
  onToggleChecked: () => void;
  onToggleExpanded: () => void;
  children: React.ReactNode;
}) {
  const Icon = option.icon;
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
      <div className="flex items-start gap-3 px-3 py-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[8px] bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[14px] font-semibold text-slate-900">{option.title}</div>
              <div className="mt-1 text-[12px] text-slate-500">{option.summary}</div>
            </div>
            <button
              type="button"
              onClick={onToggleChecked}
              className={`inline-flex h-6 min-w-[48px] items-center rounded-full px-1 transition ${checked ? 'bg-slate-900 justify-end' : 'bg-slate-300 justify-start'}`}
            >
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm">
                {checked && <Check className="h-3 w-3" />}
              </span>
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-[12px]">
            <div className="flex flex-wrap items-center gap-2 text-slate-500">
              <span>{t.supported}: <span className="font-medium text-slate-700">{support}</span></span>
              <span>·</span>
              <span>{t.selectedCount} {selectedCount}</span>
            </div>
            <div className="flex items-center gap-3">
              {bulkActionLabel && onBulkAction && (
                <button type="button" onClick={onBulkAction} disabled={!checked} className="text-[12px] font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300">
                  {bulkActionLabel}
                </button>
              )}
              <button type="button" onClick={onToggleExpanded} className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-700">
                {t.detailItems}
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      {expanded && <div className="border-t border-slate-200 bg-white px-3 py-3">{children}</div>}
    </div>
  );
}

function DetailCheckboxRow({
  item,
  lang,
  checked,
  disabled,
  recommended,
  recommendedLabel,
  onToggle,
}: {
  item: DetailOption;
  lang: Lang;
  checked: boolean;
  disabled?: boolean;
  recommended?: boolean;
  recommendedLabel?: string;
  onToggle: () => void;
}) {
  return (
    <label className={`flex items-start justify-between gap-3 rounded-[8px] border px-3 py-3 ${disabled ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-slate-200 bg-slate-50'}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-medium text-slate-900">{item.title}</div>
          {recommended && recommendedLabel && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">{recommendedLabel}</span>
          )}
          {item.clusterRole && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${skillClusterRoleTint(item.clusterRole)}`}>
              {skillClusterRoleLabel(item.clusterRole, lang)}
            </span>
          )}
        </div>
        <div className="mt-1 text-[12px] text-slate-500">{item.summary}</div>
        {skillSupportHint(item) && <div className="mt-1 text-[11px] text-slate-400">{skillSupportHint(item)}</div>}
        {item.note && <div className="mt-1 text-[11px] text-slate-400">{item.note}</div>}
      </div>
      <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-slate-900" checked={checked} disabled={disabled} onChange={onToggle} />
    </label>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
