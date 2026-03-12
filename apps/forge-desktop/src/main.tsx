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
};

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

const clientOrder: Client[] = ['claude', 'codex', 'gemini'];

type ClientMeta = {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const messages: Record<Lang, Messages> = {
  zh: {
    productName: 'Forge Desktop',
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
    zh: '中文',
    en: 'English',
    ja: '日本語',
  },
  en: {
    productName: 'Forge Desktop',
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
    zh: '中文',
    en: 'English',
    ja: '日本語',
  },
  ja: {
    productName: 'Forge Desktop',
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
  } catch {
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

function App() {
  const [section, setSection] = React.useState<Section>('platform');
  const [communityKind, setCommunityKind] = React.useState<CommunityKind>('skills');
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

  const t = messages[lang];

  React.useEffect(() => {
    window.localStorage.setItem('forge.desktop.lang', lang);
  }, [lang]);

  React.useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const previous = document.body.style.overflow;
    if (confirmOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previous || '';
    }
    return () => {
      document.body.style.overflow = previous || '';
    };
  }, [confirmOpen]);

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
  const mcpDetailList = React.useMemo(
    () => mcpDetailOptions.filter((item) => item.clients.includes(activeClient)),
    [activeClient],
  );
  const skillDetailList = React.useMemo(
    () => skillDetailOptions.filter((item) => item.clients.includes(activeClient)),
    [activeClient],
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
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${entry.kind === 'mcp' ? 'bg-sky-50 text-sky-700 ring-sky-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}`}>
                        {entry.kind === 'mcp' ? 'MCP' : 'Skill'}
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
                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
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
              </section>
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
}: {
  title: string;
  hint: string;
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
}) {
  const [expanded, setExpanded] = React.useState<{ mcp: boolean; skills: boolean; memory: boolean }>({
    mcp: false,
    skills: false,
    memory: false,
  });
  const selectedMcpCount = mcpItems.filter((item) => selectedMcpDetails[item.id]).length;
  const selectedSkillCount = skillItems.filter((item) => selectedSkillDetails[item.id]).length;
  const allMcpSelected = mcpItems.length > 0 && selectedMcpCount === mcpItems.length;
  const allSkillsSelected = skillItems.length > 0 && selectedSkillCount === skillItems.length;

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
                        checked={Boolean(selectedMcpDetails[item.id])}
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
                  <div className="space-y-2">
                    {skillItems.map((item) => (
                      <DetailCheckboxRow
                        key={item.id}
                        item={item}
                        checked={Boolean(selectedSkillDetails[item.id])}
                        onToggle={() => onToggleSkill(item.id)}
                      />
                    ))}
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
  checked,
  disabled,
  onToggle,
}: {
  item: DetailOption;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <label className={`flex items-start justify-between gap-3 rounded-[8px] border px-3 py-3 ${disabled ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-slate-200 bg-slate-50'}`}>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-slate-900">{item.title}</div>
        <div className="mt-1 text-[12px] text-slate-500">{item.summary}</div>
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
