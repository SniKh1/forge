import React from 'react';
import ReactDOMClient from 'react-dom/client';
import { createPortal } from 'react-dom';
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
import {
  bootstrapOfficialClient,
  getAppState,
  installClientConfig,
  installExternalMcp,
  installExternalSkill,
  isTauriRuntime,
  loadBuiltinMcpSecrets,
  openTarget,
  openTerminalHere,
  repairClientConfig,
  saveBuiltinMcpSecrets,
  searchExternalMcp,
  searchExternalSkills,
  verifyClientConfig,
} from './lib/backend';
import type {
  ActionPayload,
  ActionResult,
  AppStatePayload,
  Client,
  DetectionItem,
  DoctorReport,
  ExternalMcpInstallSpec,
  ExternalRegistrySource,
  ExternalSearchPayload,
  RuntimeStatus,
  SupportItem,
} from './lib/backend';
import { forgeSkillOptions } from './generated-catalog';
import { forgeRoleMcpMatrix } from './generated-role-mcp';
import { forgeDomainMcpMatrix } from './generated-domain-mcp';
import builtInMcpCatalogJson from '../../../core/mcp-servers.json';
import forgeBloomIcon from './assets/forge-bloom.png';
import claudeIcon from './assets/platform-icons/claude.png';
import codexIcon from './assets/platform-icons/codex.png';
import geminiIcon from './assets/platform-icons/gemini.png';

type Lang = 'zh' | 'en' | 'ja';
type Section = 'platform' | 'community' | 'settings';
type CommunityKind = 'skills' | 'mcp';
type OptionalComponent = 'mcp' | 'skills' | 'memory';
type BaseComponent = 'hooks' | 'rules' | 'stacks' | 'commands';
type RolePack = keyof typeof forgeRoleMcpMatrix.roles;
type InstallRolePack = RolePack;
type StackPack =
  | 'frontend-web'
  | 'frontend-desktop'
  | 'mobile-app'
  | 'mobile-ui'
  | 'design-system'
  | 'java-service'
  | 'service-integration'
  | 'security-engineering'
  | 'threat-modeling'
  | 'python-service'
  | 'data-platform'
  | 'data-pipeline'
  | 'agent-automation'
  | 'workflow-automation'
  | 'product-discovery'
  | 'product-delivery'
  | 'delivery-management'
  | 'visual-design'
  | 'interaction-design'
  | 'system-architecture'
  | 'test-automation'
  | 'quality-governance'
  | 'observability'
  | 'platform-infrastructure'
  | 'release-orchestration'
  | 'ecommerce'
  | 'video-creation'
  | 'image-generation';
type DomainStackPack = keyof typeof forgeDomainMcpMatrix.stacks;
type ActionKind = 'install' | 'repair' | 'verify' | 'bootstrap';
type ActionTone = 'running' | 'success' | 'warn' | 'error';
type ActionFeedbackState = {
  id: number;
  kind: ActionKind;
  tone: ActionTone;
  title: string;
  detail: string;
};

type RuntimeBlocker =
  | {
      kind: 'node';
      detail: string;
    }
  | null;

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
  requiredSecrets?: readonly string[];
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

type BuiltInMcpCatalogEntry = {
  optional?: boolean;
  summary?: string;
  note?: string;
  clients: Client[];
  platforms?: string[];
  config: {
    env?: Record<string, string>;
  };
};

type BuiltInMcpCatalog = {
  servers: Record<string, BuiltInMcpCatalogEntry>;
};

type BuiltInSecretField = {
  key: string;
  clients: readonly Client[];
  mcpIds: readonly string[];
  mcpTitles: readonly string[];
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

const clientOrder: Client[] = ['claude', 'codex', 'gemini'];
const installRoleOrder: InstallRolePack[] = [
  'frontend-engineer',
  'mobile-engineer',
  'java-backend-engineer',
  'python-backend-engineer',
  'data-engineer',
  'security-engineer',
  'ai-automation-engineer',
  'product-manager',
  'ui-designer',
  'solution-architect',
  'qa-strategist',
  'platform-engineer',
  'release-devex',
  'engineering-manager',
];
const hiddenInstallStacks = new Set<StackPack>(['ecommerce']);
const stackOrder: StackPack[] = [
  'frontend-web',
  'frontend-desktop',
  'mobile-app',
  'mobile-ui',
  'design-system',
  'java-service',
  'service-integration',
  'security-engineering',
  'threat-modeling',
  'python-service',
  'data-platform',
  'data-pipeline',
  'agent-automation',
  'workflow-automation',
  'product-discovery',
  'product-delivery',
  'delivery-management',
  'visual-design',
  'interaction-design',
  'system-architecture',
  'test-automation',
  'quality-governance',
  'observability',
  'platform-infrastructure',
  'release-orchestration',
  'video-creation',
  'image-generation',
  'ecommerce',
];
const stackRecommendationAliases: Record<StackPack, string[]> = {
  'frontend-web': ['frontend'],
  'frontend-desktop': ['frontend', 'release'],
  'mobile-app': ['frontend', 'design'],
  'mobile-ui': ['frontend', 'design'],
  'design-system': ['frontend', 'design'],
  'java-service': ['java'],
  'service-integration': ['java', 'python', 'architecture'],
  'security-engineering': ['frontend', 'java', 'python', 'release', 'architecture'],
  'threat-modeling': ['architecture', 'qa', 'release'],
  'python-service': ['python'],
  'data-platform': ['python', 'architecture', 'release'],
  'data-pipeline': ['python', 'workflow-automation'],
  'agent-automation': ['python', 'workflow-automation', 'architecture'],
  'workflow-automation': ['workflow-automation'],
  'product-discovery': ['product'],
  'product-delivery': ['product', 'release'],
  'delivery-management': ['product', 'release'],
  'visual-design': ['design', 'image-generation'],
  'interaction-design': ['design', 'frontend'],
  'system-architecture': ['architecture'],
  'test-automation': ['qa', 'frontend'],
  'quality-governance': ['qa', 'release'],
  'observability': ['qa', 'release', 'architecture'],
  'platform-infrastructure': ['release', 'architecture', 'workflow-automation'],
  'release-orchestration': ['release', 'workflow-automation'],
  ecommerce: ['ecommerce'],
  'video-creation': ['video-creation'],
  'image-generation': ['image-generation'],
};
const fallbackExternalSources: Record<CommunityKind, ExternalRegistrySource[]> = {
  skills: [
    {
      id: 'skills-sh',
      name: 'skills.sh',
      kind: 'skills',
      type: 'search-install',
      url: 'https://skills.sh/',
      trust: 'curated-external',
      note: '通过 skills CLI 搜索并显式安装第三方 skill。',
    },
    {
      id: 'anthropics-skills',
      name: 'anthropics/skills',
      kind: 'skills',
      type: 'browse',
      url: 'https://github.com/anthropics/skills',
      trust: 'browse-only',
      note: '官方参考仓库，适合浏览结构、命名和目录组织方式。',
    },
    {
      id: 'awesome-claude-skills',
      name: 'ComposioHQ/awesome-claude-skills',
      kind: 'skills',
      type: 'browse',
      url: 'https://github.com/ComposioHQ/awesome-claude-skills',
      trust: 'browse-only',
      note: '聚合型社区仓库，适合扩展浏览和灵感搜集。',
    },
  ],
  mcp: [
    {
      id: 'official-mcp-registry',
      name: 'Official MCP Registry',
      kind: 'mcp',
      type: 'search-install',
      url: 'https://registry.modelcontextprotocol.io/',
      trust: 'curated-external',
      note: '官方 Registry，优先返回可安全映射为当前客户端配置的条目。',
    },
    {
      id: 'modelcontextprotocol-servers',
      name: 'modelcontextprotocol/servers',
      kind: 'mcp',
      type: 'browse',
      url: 'https://github.com/modelcontextprotocol/servers',
      trust: 'browse-only',
      note: '官方示例仓库，适合浏览更多实现方式与 server 目录。',
    },
  ],
};
const stackToolGuideMatrix: Partial<Record<StackPack, {
  recommendedMcp: readonly { id: string; label: string; type: string; why: string; source: string }[];
  recommendedToolMcp?: readonly { id: string; label: string; type: string; why: string }[];
}>> = {
  'frontend-web': {
    recommendedMcp: [
      { id: 'figma-mcp', label: 'Figma MCP Server', type: 'official-remote-or-desktop', why: '联动设计稿、组件实现与界面对照，适合前端开发日常迭代。', source: 'https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server' },
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '结合前端仓库、PR 和 issue 上下文进行实现与 review。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'playwright', label: 'Playwright', type: 'tooling', why: '做真实浏览器交互验证、截图和回归检查。' },
      { id: 'context7', label: 'Context7', type: 'tooling', why: '快速对齐框架文档、组件 API 和升级差异。' },
    ],
  },
  'frontend-desktop': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '桌面前端通常与构建链路、PR 和壳层改动紧密耦合。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'playwright', label: 'Playwright', type: 'tooling', why: '做桌面内 WebView/前端界面的回归与截图。' },
      { id: 'fetch', label: 'fetch', type: 'tooling', why: '抓桌面运行时、打包说明和外部诊断文档。' },
    ],
  },
  'mobile-app': {
    recommendedMcp: [
      { id: 'figma-mcp', label: 'Figma MCP Server', type: 'official-remote-or-desktop', why: '移动端交互、尺寸约束和视觉稿需要始终回到设计源头。', source: 'https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server' },
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '移动端代码、PR、issue 与发布节奏都需要 repo 级上下文。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'context7', label: 'Context7', type: 'tooling', why: '查 SwiftUI、平台 API、移动端框架与系统能力文档。' },
      { id: 'fetch', label: 'fetch', type: 'tooling', why: '抓 Apple 官方说明、SDK 变更和外部能力文档。' },
    ],
  },
  'mobile-ui': {
    recommendedMcp: [
      { id: 'figma-mcp', label: 'Figma MCP Server', type: 'official-remote-or-desktop', why: '移动端视觉、状态稿和组件规范要围绕设计稿统一。', source: 'https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server' },
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '移动端 UI 落地需要同步查看设计系统实现和界面改动历史。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'context7', label: 'Context7', type: 'tooling', why: '查移动端 UI、动效和平台组件官方文档。' },
    ],
  },
  'design-system': {
    recommendedMcp: [
      { id: 'figma-mcp', label: 'Figma MCP Server', type: 'official-remote-or-desktop', why: '组件规范、设计 token 和实现映射应始终回到设计系统源头。', source: 'https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server' },
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '设计系统需要同时读实现代码和 PR 历史。', source: 'https://github.com/github/github-mcp-server' },
    ],
  },
  'java-service': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '跟踪 Java 服务代码、PR、issue 和发布上下文。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'context7', label: 'Context7', type: 'tooling', why: '查官方框架、JDK、Spring 与生态文档。' },
      { id: 'deepwiki', label: 'DeepWiki', type: 'tooling', why: '快速理解陌生 Java 仓库结构和实现套路。' },
    ],
  },
  'service-integration': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '跨服务调用、消息流和外部 API 集成的真实边界都在仓库和 PR 里。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'fetch', label: 'fetch', type: 'tooling', why: '补抓远端 API 文档、状态页和集成说明。' },
      { id: 'context7', label: 'Context7', type: 'tooling', why: '查 SDK、协议和官方集成文档。' },
    ],
  },
  'security-engineering': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '安全 review 需要定位代码入口、变更历史和具体风险面。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'context7', label: 'Context7', type: 'tooling', why: '查安全配置、框架默认值和官方加固文档。' },
    ],
  },
  'threat-modeling': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '威胁建模需要基于真实调用链、权限边界和历史改动来识别风险。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'context7', label: 'Context7', type: 'tooling', why: '查认证、授权、平台安全模型和框架加固文档。' },
      { id: 'memory', label: 'memory', type: 'tooling', why: '沉淀威胁枚举、风险假设和修复证据。' },
    ],
  },
  'python-service': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '结合 Python 服务仓库、issue 与提交历史做修复和开发。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'context7', label: 'Context7', type: 'tooling', why: '查 FastAPI、数据科学和 Python 生态官方文档。' },
      { id: 'deepwiki', label: 'DeepWiki', type: 'tooling', why: '快速建立第三方仓库和依赖库理解。' },
    ],
  },
  'data-platform': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '数据平台改动通常牵涉 schema、任务编排、存储边界与 repo 级上下文。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'fetch', label: 'fetch', type: 'tooling', why: '抓取源系统、仓库、数据平台和外部接口文档。' },
      { id: 'context7', label: 'Context7', type: 'tooling', why: '查数据库、流处理和数据平台官方文档。' },
    ],
  },
  'data-pipeline': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '数据任务、批处理脚本和 schema 变更都要回到仓库事实。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'fetch', label: 'fetch', type: 'tooling', why: '抓源数据接口、格式说明和外部系统文档。' },
    ],
  },
  'agent-automation': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: 'agent / MCP / workflow 设计需要 repo、PR 和实现上下文。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'context7', label: 'Context7', type: 'tooling', why: '查 MCP SDK、模型框架和官方文档。' },
      { id: 'fetch', label: 'fetch', type: 'tooling', why: '抓外部 API、模型说明和自动化文档。' },
    ],
  },
  'product-discovery': {
    recommendedMcp: [
      { id: 'notion-mcp', label: 'Notion MCP', type: 'official-hosted', why: '需求、文档和知识库是产品场景的核心信息面。', source: 'https://developers.notion.com/docs/mcp' },
      { id: 'linear-mcp', label: 'Linear MCP', type: 'official-remote', why: '产品排期、issue、优先级和反馈闭环都适合接入。', source: 'https://linear.app/docs/mcp' },
      { id: 'slack-mcp', label: 'Slack MCP', type: 'official-hosted', why: '跨团队对齐、发布协同和决策反馈经常发生在团队沟通面。', source: 'https://slack.com/help/articles/48855576908307-Guide-to-the-Slack-MCP-server' },
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '产品判断最终仍要回到 issue、PR 和交付事实。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'fetch', label: 'fetch', type: 'tooling', why: '快速抓取竞品、文档、状态页和外部参考。' },
      { id: 'memory', label: 'memory', type: 'tooling', why: '持续沉淀决策、历史问题与上下文。' },
    ],
  },
  'product-delivery': {
    recommendedMcp: [
      { id: 'notion-mcp', label: 'Notion MCP', type: 'official-hosted', why: 'PRD、brief、rollout note 与 acceptance criteria 的主要沉淀面。', source: 'https://developers.notion.com/docs/mcp' },
      { id: 'linear-mcp', label: 'Linear MCP', type: 'official-remote', why: '交付路径、issue 优先级和推进节奏集中在工作项系统。', source: 'https://linear.app/docs/mcp' },
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '对齐交付节奏时需要回到代码和 PR 事实。', source: 'https://github.com/github/github-mcp-server' },
    ],
  },
  'delivery-management': {
    recommendedMcp: [
      { id: 'linear-mcp', label: 'Linear MCP', type: 'official-remote', why: '里程碑、阻塞、优先级和依赖最适合在线性 issue 流里统一管理。', source: 'https://linear.app/docs/mcp' },
      { id: 'slack-mcp', label: 'Slack MCP', type: 'official-hosted', why: '跨团队推进和状态同步要依赖实时沟通面。', source: 'https://slack.com/help/articles/48855576908307-Guide-to-the-Slack-MCP-server' },
    ],
  },
  'visual-design': {
    recommendedMcp: [
      { id: 'figma-mcp', label: 'Figma MCP Server', type: 'official-remote-or-desktop', why: '设计资产、组件规范和界面对照是设计场景的关键上下文。', source: 'https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server' },
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '设计 review 需要同时看到实现代码、PR 和 design-system 变更。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'playwright', label: 'Playwright', type: 'tooling', why: '做界面走查、录屏和交互复检。' },
      { id: 'browser-use', label: 'browser-use', type: 'tooling', why: '在真实登录态下回看产品体验和视觉一致性。' },
    ],
  },
  'interaction-design': {
    recommendedMcp: [
      { id: 'figma-mcp', label: 'Figma MCP Server', type: 'official-remote-or-desktop', why: '交互稿、原型和状态设计仍然应围绕设计源头展开。', source: 'https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server' },
    ],
    recommendedToolMcp: [
      { id: 'playwright', label: 'Playwright', type: 'tooling', why: '验证交互过渡、状态切换和关键流程行为。' },
      { id: 'browser-use', label: 'browser-use', type: 'tooling', why: '用真实会话回看完整用户动线。' },
    ],
  },
  'system-architecture': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '架构决策需要 repo 全局上下文和改动边界。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'context7', label: 'Context7', type: 'tooling', why: '查设计决策涉及的基础设施与框架文档。' },
      { id: 'deepwiki', label: 'DeepWiki', type: 'tooling', why: '快速建立陌生系统的结构模型。' },
    ],
  },
  'test-automation': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '追踪回归、缺陷、提交和 PR 关联。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'playwright', label: 'Playwright', type: 'tooling', why: '自动化回归与验收测试的主力工具。' },
      { id: 'memory', label: 'memory', type: 'tooling', why: '记录缺陷历史、排查结论和验证证据。' },
    ],
  },
  'quality-governance': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '质量门槛、回归面和代码事实必须对齐。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'memory', label: 'memory', type: 'tooling', why: '沉淀回归历史、缺陷模式和验证证据。' },
    ],
  },
  observability: {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '观测入口、日志点和诊断路径最终要回到代码和配置。', source: 'https://github.com/github/github-mcp-server' },
    ],
    recommendedToolMcp: [
      { id: 'fetch', label: 'fetch', type: 'tooling', why: '抓线上状态页、日志入口和远端诊断文档。' },
    ],
  },
  'platform-infrastructure': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: 'CI、infra 和部署链路仍以仓库和 PR 为主控制面。', source: 'https://github.com/github/github-mcp-server' },
      { id: 'slack-mcp', label: 'Slack MCP', type: 'official-hosted', why: '基础设施和发布问题需要实时同步和广播。', source: 'https://slack.com/help/articles/48855576908307-Guide-to-the-Slack-MCP-server' },
    ],
    recommendedToolMcp: [
      { id: 'context7', label: 'Context7', type: 'tooling', why: '查云平台、容器和运行时文档。' },
      { id: 'fetch', label: 'fetch', type: 'tooling', why: '抓部署说明、状态页和远端诊断信息。' },
    ],
  },
  'release-orchestration': {
    recommendedMcp: [
      { id: 'github-mcp', label: 'GitHub MCP Server', type: 'official-remote-or-local', why: '发布管理、CI、PR 和 issue 是 release 的主要控制面。', source: 'https://github.com/github/github-mcp-server' },
      { id: 'slack-mcp', label: 'Slack MCP', type: 'official-hosted', why: '适合发布沟通、状态同步和故障广播。', source: 'https://slack.com/help/articles/48855576908307-Guide-to-the-Slack-MCP-server' },
    ],
    recommendedToolMcp: [
      { id: 'fetch', label: 'fetch', type: 'tooling', why: '抓取 release notes、发布文档和线上状态页信息。' },
    ],
  },
};

type ClientMeta = {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

function roleLabel(role: InstallRolePack, lang: Lang) {
  const labels: Record<InstallRolePack, Record<Lang, string>> = {
    'frontend-engineer': { zh: '前端工程师', en: 'Frontend Engineer', ja: 'フロントエンドエンジニア' },
    'mobile-engineer': { zh: '移动端工程师', en: 'Mobile Engineer', ja: 'モバイルエンジニア' },
    'java-backend-engineer': { zh: 'Java 后端工程师', en: 'Java Backend Engineer', ja: 'Java バックエンドエンジニア' },
    'python-backend-engineer': { zh: 'Python 后端工程师', en: 'Python Backend Engineer', ja: 'Python バックエンドエンジニア' },
    'data-engineer': { zh: '数据工程师', en: 'Data Engineer', ja: 'データエンジニア' },
    'security-engineer': { zh: '安全工程师', en: 'Security Engineer', ja: 'セキュリティエンジニア' },
    'ai-automation-engineer': { zh: 'AI 自动化工程师', en: 'AI Automation Engineer', ja: 'AI オートメーションエンジニア' },
    'product-manager': { zh: '产品经理', en: 'Product Manager', ja: 'プロダクトマネージャー' },
    'ui-designer': { zh: 'UI 设计', en: 'UI Designer', ja: 'UI デザイナー' },
    'solution-architect': { zh: '架构设计', en: 'Solution Architect', ja: 'ソリューションアーキテクト' },
    'qa-strategist': { zh: 'QA 策略', en: 'QA Strategist', ja: 'QA ストラテジスト' },
    'platform-engineer': { zh: '平台工程师', en: 'Platform Engineer', ja: 'プラットフォームエンジニア' },
    'release-devex': { zh: '发布与 DevEx', en: 'Release / DevEx', ja: 'リリース / DevEx' },
    'engineering-manager': { zh: '工程经理', en: 'Engineering Manager', ja: 'エンジニアリングマネージャー' },
  };
  return labels[role][lang];
}

function stackLabel(stack: StackPack, lang: Lang) {
  const labels: Record<StackPack, Record<Lang, string>> = {
    'frontend-web': { zh: 'Web 前端', en: 'Frontend Web', ja: 'Web フロントエンド' },
    'frontend-desktop': { zh: '桌面前端', en: 'Frontend Desktop', ja: 'デスクトップフロントエンド' },
    'mobile-app': { zh: '移动应用', en: 'Mobile App', ja: 'モバイルアプリ' },
    'mobile-ui': { zh: '移动界面', en: 'Mobile UI', ja: 'モバイル UI' },
    'design-system': { zh: '设计系统', en: 'Design System', ja: 'デザインシステム' },
    'java-service': { zh: 'Java 服务', en: 'Java Service', ja: 'Java サービス' },
    'service-integration': { zh: '服务集成', en: 'Service Integration', ja: 'サービス連携' },
    'security-engineering': { zh: '安全工程', en: 'Security Engineering', ja: 'セキュリティエンジニアリング' },
    'threat-modeling': { zh: '威胁建模', en: 'Threat Modeling', ja: '脅威モデリング' },
    'python-service': { zh: 'Python 服务', en: 'Python Service', ja: 'Python サービス' },
    'data-platform': { zh: '数据平台', en: 'Data Platform', ja: 'データプラットフォーム' },
    'data-pipeline': { zh: '数据流水线', en: 'Data Pipeline', ja: 'データパイプライン' },
    'agent-automation': { zh: 'Agent 自动化', en: 'Agent Automation', ja: 'エージェント自動化' },
    ecommerce: { zh: '电商', en: 'Ecommerce', ja: 'Eコマース' },
    'product-discovery': { zh: '产品探索', en: 'Product Discovery', ja: 'プロダクトディスカバリー' },
    'product-delivery': { zh: '产品交付', en: 'Product Delivery', ja: 'プロダクトデリバリー' },
    'delivery-management': { zh: '交付管理', en: 'Delivery Management', ja: 'デリバリーマネジメント' },
    'visual-design': { zh: '视觉设计', en: 'Visual Design', ja: 'ビジュアルデザイン' },
    'interaction-design': { zh: '交互设计', en: 'Interaction Design', ja: 'インタラクションデザイン' },
    'system-architecture': { zh: '系统架构', en: 'System Architecture', ja: 'システムアーキテクチャ' },
    'test-automation': { zh: '测试自动化', en: 'Test Automation', ja: 'テスト自動化' },
    'quality-governance': { zh: '质量治理', en: 'Quality Governance', ja: '品質ガバナンス' },
    observability: { zh: '可观测性', en: 'Observability', ja: 'オブザーバビリティ' },
    'platform-infrastructure': { zh: '平台基础设施', en: 'Platform Infrastructure', ja: 'プラットフォーム基盤' },
    'release-orchestration': { zh: '发布编排', en: 'Release Orchestration', ja: 'リリースオーケストレーション' },
    'video-creation': { zh: '视频创作', en: 'Video Creation', ja: '動画制作' },
    'image-generation': { zh: '图像生成', en: 'Image Generation', ja: '画像生成' },
    'workflow-automation': { zh: '工作流自动化', en: 'Workflow Automation', ja: 'ワークフロー自動化' },
  };
  return labels[stack][lang];
}

function visibleStacks(stacks: readonly StackPack[]) {
  return stacks.filter((stack) => !hiddenInstallStacks.has(stack));
}

function stackRecommendationTargets(stack: StackPack) {
  return [stack, ...(stackRecommendationAliases[stack] || [])];
}

function matchesRecommendedStack(recommendedStacks: readonly string[] | undefined, stack: StackPack) {
  if (!recommendedStacks || recommendedStacks.length === 0) return false;
  const targets = new Set(stackRecommendationTargets(stack));
  return recommendedStacks.some((item) => targets.has(item));
}

function orderStacks(stacks: readonly StackPack[]) {
  const set = new Set(stacks);
  return stackOrder.filter((stack) => set.has(stack));
}

function joinWithLocale(values: string[], lang: Lang) {
  if (values.length <= 1) return values[0] || '';
  if (lang === 'en') return values.join(' + ');
  if (lang === 'ja') return values.join('・');
  return values.join(' / ');
}

function stripAnsi(value: string) {
  return value.replace(/\u001b\[[0-9;]*m/g, '');
}

function extractFailureSummary(output: string) {
  const lines = stripAnsi(output)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const failure = lines.find((line) => line.includes('[FAIL]') || line.startsWith('FAIL'));
  if (!failure) return '';
  return failure
    .replace(/^\[FAIL\]\s*/i, '')
    .replace(/^FAIL:?\s*/i, '')
    .trim();
}

function extractOutputSummary(output: string) {
  if (output?.trimStart().startsWith('{')) return '';
  return extractFailureSummary(output) || stripAnsi(output).split('\n').map((line) => line.trim()).filter((line) => !line.startsWith('[bootstrap]') && !line.startsWith('- package:') && !line.startsWith('- command:')).find(Boolean) || '';
}

function extractSupportIssue(item?: SupportItem | null) {
  return extractFailureSummary(`${item?.stdout || ''}\n${item?.stderr || ''}`);
}

function detectRuntimeBlocker(output: string): RuntimeBlocker {
  const text = stripAnsi(output).toLowerCase();
  if (
    text.includes('node.js runtime not found')
    || text.includes('node.js is required')
    || text.includes('install node.js 18+')
    || text.includes('set forge_node_path')
    || text.includes('npm is not available. install node.js with npm first')
  ) {
    return {
      kind: 'node',
      detail: extractOutputSummary(output),
    };
  }
  return null;
}

function itemNoteOrClients(item: DetailOption, lang: Lang) {
  if (item.note) return item.note;
  if (!item.clients?.length) return '';
  return joinWithLocale(item.clients.map((client) => clientMeta(client).label), lang);
}

function optionalDetailNote(item: unknown) {
  if (!item || typeof item !== 'object' || !('note' in item)) return '';
  const note = (item as { note?: unknown }).note;
  return typeof note === 'string' ? note : '';
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
  return forgeRoleMcpMatrix.roles[role];
}

function combineInstallGuide(roles: InstallRolePack[]) {
  type RecommendedMcpEntry = ReturnType<typeof installRoleGuide>['recommendedMcp'][number];
  const recommendedSkills = Array.from(new Set(
    roles.flatMap((role) => installRoleGuide(role).recommendedSkills),
  ));
  const recommendedMcp = Array.from(
    roles.reduce((map, role) => {
      for (const entry of installRoleGuide(role).recommendedMcp) {
        if (!map.has(entry.id)) map.set(entry.id, entry);
      }
      return map;
    }, new Map<string, RecommendedMcpEntry>()),
  ).map(([, entry]) => entry);
  const recommendedStacks = orderStacks(
    visibleStacks(
      roles.flatMap((role) => installRoleGuide(role).recommendedStacks as readonly StackPack[]),
    ),
  );
  return {
    recommendedSkills,
    recommendedMcp,
    recommendedStacks,
  };
}

function roleGuideExtraTools(guide: unknown) {
  const localTools = (
    guide
    && typeof guide === 'object'
    && 'recommendedLocalTools' in guide
    && Array.isArray(guide.recommendedLocalTools)
  ) ? guide.recommendedLocalTools : [];
  const toolMcp = (
    guide
    && typeof guide === 'object'
    && 'recommendedToolMcp' in guide
    && Array.isArray(guide.recommendedToolMcp)
  ) ? guide.recommendedToolMcp : [];
  return [...localTools, ...toolMcp];
}

function domainGuideExtraTools(guide: (typeof forgeDomainMcpMatrix.stacks)[DomainStackPack]) {
  const localTools = 'recommendedLocalTools' in guide ? guide.recommendedLocalTools : [];
  const toolMcp = 'recommendedToolMcp' in guide ? guide.recommendedToolMcp : [];
  return [...localTools, ...toolMcp];
}

function stackGuide(stack: StackPack) {
  if (isDomainStackPack(stack)) return forgeDomainMcpMatrix.stacks[stack];
  return stackToolGuideMatrix[stack] || null;
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
    detectNeedsAttention: '已读取 Forge 状态，但当前平台仍有待修复项。',
    detectFailed: '无法读取 Forge 状态，请检查 Tauri bridge 与 Forge CLI。',
    detectPreview: '浏览器预览模式，当前使用本地 mock 状态。',
    refresh: '刷新',
    installForge: '安装 Forge',
    updateForge: '更新 Forge',
    repairForge: '修复当前平台配置',
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
    clientMissingState: '缺少客户端',
    needsRepair: '需要修复',
    platformNeedsRepair: '当前平台已接入，但仍有配置问题需要修复。',
    platformClientMissing: 'Forge 配置已存在，但官方客户端命令不可用。请先安装或修复官方 Codex CLI。',
    issueSummary: '问题摘要',
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
    stackRecommendations: '按栈推荐',
    installPersona: '安装画像',
    installPersonaHint: '先选一个最贴近当前职责的角色，再按需要补充多个相关栈包，安装推荐会以角色主栈为核心收敛。',
    rolePackLabel: '角色包',
    stackPackLabel: '栈包',
    stackPackSelectAll: '全选栈包',
    stackPackAllSelected: '已全选',
    restoreRecommendedStacks: '恢复推荐栈',
    recommendedPreset: '按推荐预选',
    recommendedBadge: '推荐',
    roleStacksInstalled: '当前平台已内置该角色对应栈包',
    roleStacksPending: '当前平台尚未写入 Forge 基础层，对应栈包会在安装后自动内置',
    addToInstallList: '加入安装清单',
    switchToPlatform: '回到平台安装',
    currentPersona: '当前画像',
    selectedStacksLabel: '已选栈包',
    selectedSkillsLabel: '已选 Skills',
    selectedMcpLabel: '已选 MCP',
    switchRole: '切换角色',
    hideRolePicker: '收起角色',
    adjustStacks: '调整栈包',
    hideStackAdjustments: '收起栈包',
    quickApplyHint: '默认会随角色自动应用推荐栈与推荐 Skills。MCP 保持独立选择，只提供建议不自动勾选。',
    additionalStacksLabel: '补充栈',
    customStacksLabel: '自定义栈',
    roleStackModeHint: '角色负责给出默认匹配；栈包只用于补充当前角色没有覆盖到的工作面。',
    roleBoundInstallHint: '内置项可以直接加入当前平台安装清单；社区仓库仍然作为浏览入口。',
    roleRecommendationHint: '先看角色推荐，再决定要不要从下面的社区仓库继续扩展。',
    stackRecommendationHint: '先按当前栈查看推荐，再决定要不要继续扩展社区能力。',
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
    exaSection: 'MCP 与令牌',
    saveSecrets: '保存令牌配置',
    resetSecrets: '恢复已保存',
    secretPending: '未保存',
    secretSavedHint: '这里统一管理 MCP 需要的令牌；保存后会在安装 Forge 内置 MCP 时自动注入当前客户端配置。',
    secretDirtyHint: '你有未保存的令牌修改；当前安装仍只会使用上次保存的值。',
    secretUsedBy: '用于',
    secretSkipHint: '未填写时，依赖该令牌的内置 MCP 会在安装时自动跳过。',
    savedSecretsCount: '已保存令牌',
    selectedSecretsCount: '当前安装依赖',
    missingSecretsCount: '当前仍缺少',
    savedSecretsList: '已保存项',
    noSavedSecrets: '当前还没有保存任何内置 MCP 的 token。',
    logSection: '命令日志',
    confirmTitleInstall: '确认安装当前平台配置',
    confirmTitleUpdate: '确认更新当前平台配置',
    confirmTitleRepair: '确认修复当前平台配置',
    actionInstallRunning: '正在安装当前平台配置...',
    actionRepairRunning: '正在修复当前平台配置...',
    actionVerifyRunning: '正在验证当前平台状态...',
    actionInstallSuccess: '当前平台配置已写入完成。',
    actionRepairSuccess: '当前平台配置修复已执行完成。',
    actionVerifySuccess: '当前平台验证通过。',
    actionVerifyWarn: '验证已完成，但发现仍需处理的问题。',
    actionFailed: '操作未完成，请查看日志并按提示修复。',
    actionRunningBadge: '进行中',
    actionSuccessBadge: '已完成',
    actionWarnBadge: '待处理',
    actionErrorBadge: '失败',
    confirmAction: '继续执行',
    cancel: '取消',
    confirmHint: '确认后才会写入当前平台配置。下面列出本次会安装或保持的内容。',
    selectedOptionalEmpty: '当前没有勾选可选内容，只会保留 Forge 基础层。',
    modalBase: '基础层（固定）',
    modalOptional: '可选层（本次选择）',
    noSecretYet: '当前没有额外 token/key。',
    secretEmpty: '未填写',
    secretReady: '已填写',
    secretsCollapsedHint: 'MCP 独立于画像管理；这里统一保存内置 MCP 所需的 key 与 token。',
    logCollapsedHint: '默认折叠，需要时再看详细输出。',
    saveSelection: '当前平台会安装',
    restartHint: '安装完成后，如客户端已在运行，建议重启该客户端。',
    nodeRequiredTitle: '需要先安装 Node.js 18+ 运行时',
    nodeRequiredHint: 'Forge 当前通过本地 Node/npm 驱动安装、修复与验证流程。请先安装 Node.js LTS，再回到 Forge 刷新状态。',
    nodeRequiredAction: '打开 Node 安装页',
    nodeRequiredSecondary: '安装后刷新',
    nodeRequiredDisabledHint: '缺少 Node.js 时，安装官方客户端、安装 Forge、修复与验证按钮会暂时禁用。',
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
    browseMode: '浏览模式',
    searchMode: '搜索模式',
    browseModeHint: '按栈查看推荐、Forge 内置与社区入口，先收敛当前栈再补扩展。',
    searchModeHint: '搜索只看外部结果，但排序仍会参考当前选中的单个栈。',
    searchAction: '搜索',
    clearSearch: '返回浏览',
    searchReady: '输入关键词后回车或点搜索，结果会只保留外部来源。',
    platformFilterLabel: '适用平台',
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
    detectNeedsAttention: 'Forge state loaded, but this platform still needs attention.',
    detectFailed: 'Unable to read Forge state. Check the Tauri bridge and Forge CLI.',
    detectPreview: 'Browser preview mode is using local mock data.',
    refresh: 'Refresh',
    installForge: 'Install Forge',
    updateForge: 'Update Forge',
    repairForge: 'Repair current client',
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
    clientMissingState: 'Client missing',
    needsRepair: 'Needs repair',
    platformNeedsRepair: 'The platform is connected, but some configuration issues still need repair.',
    platformClientMissing: 'Forge config exists, but the official client command is unavailable. Install or repair the official Codex CLI first.',
    issueSummary: 'Issue summary',
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
    stackRecommendations: 'Stack recommendations',
    installPersona: 'Install persona',
    installPersonaHint: 'Pick the single role closest to your current responsibility, then add multiple related stacks as needed.',
    rolePackLabel: 'Role pack',
    stackPackLabel: 'Stack pack',
    stackPackSelectAll: 'Select all stacks',
    stackPackAllSelected: 'All stacks selected',
    restoreRecommendedStacks: 'Restore recommended stacks',
    recommendedPreset: 'Apply recommended',
    recommendedBadge: 'Recommended',
    roleStacksInstalled: 'This client already has the stacks for the selected role built in',
    roleStacksPending: 'Forge base assets are not installed yet. These stacks will be bundled on install',
    addToInstallList: 'Add to install list',
    switchToPlatform: 'Back to platform install',
    currentPersona: 'Current persona',
    selectedStacksLabel: 'Selected stacks',
    selectedSkillsLabel: 'Selected skills',
    selectedMcpLabel: 'Selected MCP',
    switchRole: 'Switch role',
    hideRolePicker: 'Hide roles',
    adjustStacks: 'Adjust stacks',
    hideStackAdjustments: 'Hide stack adjustments',
    quickApplyHint: 'Selecting a role automatically applies the recommended stacks and skills. MCP remains independently selected and is only suggested, not auto-applied.',
    additionalStacksLabel: 'Additional stacks',
    customStacksLabel: 'Custom stacks',
    roleStackModeHint: 'The role defines the default match. Use stacks only to extend coverage beyond that role.',
    roleBoundInstallHint: 'Built-in items can be added directly to the current platform install list. Community repositories remain browse-only.',
    roleRecommendationHint: 'Start from role-based recommendations, then expand with community sources only when needed.',
    stackRecommendationHint: 'Start from stack-based recommendations, then expand only when the current stack still needs more capability.',
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
    exaSection: 'MCP and tokens',
    saveSecrets: 'Save token settings',
    resetSecrets: 'Reset to saved',
    secretPending: 'Unsaved',
    secretSavedHint: 'Manage MCP tokens here. Saved values are injected automatically when Forge installs built-in MCP servers.',
    secretDirtyHint: 'You have unsaved token changes. The current install still uses the last saved values.',
    secretUsedBy: 'Used by',
    secretSkipHint: 'If left empty, built-in MCP servers that require this token are skipped during install.',
    savedSecretsCount: 'Saved tokens',
    selectedSecretsCount: 'Required now',
    missingSecretsCount: 'Still missing',
    savedSecretsList: 'Saved items',
    noSavedSecrets: 'No built-in MCP token has been saved yet.',
    logSection: 'Command log',
    confirmTitleInstall: 'Confirm current client install',
    confirmTitleUpdate: 'Confirm current client update',
    confirmTitleRepair: 'Confirm current client repair',
    actionInstallRunning: 'Installing current client configuration...',
    actionRepairRunning: 'Repairing current client configuration...',
    actionVerifyRunning: 'Verifying the current platform...',
    actionInstallSuccess: 'Current client configuration was written successfully.',
    actionRepairSuccess: 'Current client configuration repair finished.',
    actionVerifySuccess: 'Platform verification passed.',
    actionVerifyWarn: 'Verification finished, but there are still issues to resolve.',
    actionFailed: 'The action did not finish successfully. Check the log for details.',
    actionRunningBadge: 'Running',
    actionSuccessBadge: 'Done',
    actionWarnBadge: 'Needs work',
    actionErrorBadge: 'Failed',
    confirmAction: 'Continue',
    cancel: 'Cancel',
    confirmHint: 'Forge will only write into the current platform after you confirm. This is the exact scope for this run.',
    selectedOptionalEmpty: 'No optional components are selected. Only the Forge base layer will remain.',
    modalBase: 'Base layer (fixed)',
    modalOptional: 'Optional layer (selected)',
    noSecretYet: 'No extra token or key is set yet.',
    secretEmpty: 'Empty',
    secretReady: 'Saved',
    secretsCollapsedHint: 'MCP is managed independently from persona. Store built-in MCP keys and tokens here.',
    logCollapsedHint: 'Logs stay collapsed by default and only expand when needed.',
    saveSelection: 'Current platform will install',
    restartHint: 'If the client is already running, restart it after installation.',
    nodeRequiredTitle: 'Install Node.js 18+ first',
    nodeRequiredHint: 'Forge currently uses local Node/npm to run install, repair, and verify flows. Install the LTS release first, then return to Forge and refresh.',
    nodeRequiredAction: 'Open Node download',
    nodeRequiredSecondary: 'Refresh after install',
    nodeRequiredDisabledHint: 'Install, repair, verify, and official-client bootstrap stay disabled until Node.js is available.',
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
    browseMode: 'Browse',
    searchMode: 'Search',
    browseModeHint: 'Browse stack-based recommendations, Forge built-ins, and community sources in separate lanes.',
    searchModeHint: 'Search only shows external results, while ranking still follows the single active stack.',
    searchAction: 'Search',
    clearSearch: 'Back to browse',
    searchReady: 'Enter keywords and press Enter or Search. Only external sources will be shown.',
    platformFilterLabel: 'Platform',
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
    detectNeedsAttention: 'Forge 状態は読み込めましたが、このプラットフォームには未解決項目があります。',
    detectFailed: 'Forge 状態を読み込めません。Tauri bridge と Forge CLI を確認してください。',
    detectPreview: 'ブラウザプレビューではローカル mock 状態を使っています。',
    refresh: '更新',
    installForge: 'Forge を導入',
    updateForge: 'Forge を更新',
    repairForge: '現在のクライアント設定を修復',
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
    clientMissingState: 'クライアント未導入',
    needsRepair: '修復が必要',
    platformNeedsRepair: 'このプラットフォームは接続済みですが、まだ修復すべき設定問題があります。',
    platformClientMissing: 'Forge 設定はありますが、公式クライアントのコマンドが利用できません。先に公式 Codex CLI を導入または修復してください。',
    issueSummary: '問題要約',
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
    stackRecommendations: 'スタック別の推奨',
    installPersona: '導入プロファイル',
    installPersonaHint: '現在の責務に最も近い単一ロールを選び、必要に応じて複数の関連スタックを追加します。',
    rolePackLabel: 'ロールパック',
    stackPackLabel: 'スタックパック',
    stackPackSelectAll: 'スタックをすべて選択',
    stackPackAllSelected: 'すべて選択済み',
    restoreRecommendedStacks: '推奨スタックに戻す',
    recommendedPreset: '推奨で選択',
    recommendedBadge: '推奨',
    roleStacksInstalled: 'このクライアントには選択ロール向けスタックがすでに組み込まれています',
    roleStacksPending: 'Forge 基本レイヤーはまだ未導入です。これらのスタックは導入時にまとめて入ります',
    addToInstallList: '導入一覧に追加',
    switchToPlatform: 'プラットフォーム導入へ戻る',
    currentPersona: '現在のプロファイル',
    selectedStacksLabel: '選択中スタック',
    selectedSkillsLabel: '選択中 Skills',
    selectedMcpLabel: '選択中 MCP',
    switchRole: 'ロールを切り替え',
    hideRolePicker: 'ロールを閉じる',
    adjustStacks: 'スタックを調整',
    hideStackAdjustments: 'スタック調整を閉じる',
    quickApplyHint: 'ロール選択では推奨 stack と Skills のみ自動適用します。MCP は独立選択のままで、自動チェックはしません。',
    additionalStacksLabel: '追加スタック',
    customStacksLabel: 'カスタムスタック',
    roleStackModeHint: 'ロールが標準の組み合わせを決め、stack はそのロールで不足する作業面を補うためにだけ使います。',
    roleBoundInstallHint: '内蔵項目は現在のプラットフォーム導入一覧へ直接追加できます。コミュニティリポジトリは閲覧入口のままです。',
    roleRecommendationHint: 'まず役割別の推奨を見て、必要な場合だけ下のコミュニティソースを追加してください。',
    stackRecommendationHint: 'まず現在のスタックに合わせた推奨を確認し、その後で必要な拡張だけを追加してください。',
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
    exaSection: 'MCP とトークン',
    saveSecrets: 'トークン設定を保存',
    resetSecrets: '保存済みに戻す',
    secretPending: '未保存',
    secretSavedHint: 'MCP 用トークンはここで一元管理します。保存済みトークンは Forge 内蔵 MCP の導入時に自動で現在のクライアント設定へ注入されます。',
    secretDirtyHint: '未保存のトークン変更があります。現在の導入では最後に保存した値だけを使います。',
    secretUsedBy: '対象',
    secretSkipHint: '未入力の場合、そのトークンが必要な内蔵 MCP は導入時に自動でスキップされます。',
    savedSecretsCount: '保存済みトークン',
    selectedSecretsCount: '今回必要',
    missingSecretsCount: '未充足',
    savedSecretsList: '保存済み項目',
    noSavedSecrets: '内蔵 MCP 用トークンはまだ保存されていません。',
    logSection: 'コマンドログ',
    confirmTitleInstall: '現在のクライアント設定の導入確認',
    confirmTitleUpdate: '現在のクライアント設定の更新確認',
    confirmTitleRepair: '現在のクライアント設定の修復確認',
    actionInstallRunning: '現在のクライアント設定を導入中...',
    actionRepairRunning: '現在のクライアント設定を修復中...',
    actionVerifyRunning: '現在のプラットフォームを検証中...',
    actionInstallSuccess: '現在のクライアント設定を書き込みました。',
    actionRepairSuccess: '現在のクライアント設定の修復が完了しました。',
    actionVerifySuccess: 'プラットフォーム検証に成功しました。',
    actionVerifyWarn: '検証は完了しましたが、まだ対処すべき問題があります。',
    actionFailed: '操作は完了していません。ログを確認して修正してください。',
    actionRunningBadge: '実行中',
    actionSuccessBadge: '完了',
    actionWarnBadge: '要対応',
    actionErrorBadge: '失敗',
    confirmAction: '実行する',
    cancel: 'キャンセル',
    confirmHint: '確認後にだけ現在のプラットフォーム設定へ書き込みます。今回の対象を下にまとめています。',
    selectedOptionalEmpty: '任意項目は未選択です。Forge の基本レイヤーのみ保持します。',
    modalBase: '基本レイヤー（固定）',
    modalOptional: '任意レイヤー（今回の選択）',
    noSecretYet: '追加の token / key はまだ設定されていません。',
    secretEmpty: '未入力',
    secretReady: '入力済み',
    secretsCollapsedHint: 'MCP は画像設定から独立して管理します。内蔵 MCP に必要な key と token はここにまとめます。',
    logCollapsedHint: 'ログは普段は折りたたみ、必要な時だけ開きます。',
    saveSelection: '現在のプラットフォームへ導入',
    restartHint: 'クライアントが起動中なら、導入後に再起動してください。',
    nodeRequiredTitle: '先に Node.js 18+ を導入してください',
    nodeRequiredHint: 'Forge は導入・修復・検証フローをローカルの Node/npm で実行します。先に Node.js LTS を導入し、その後 Forge に戻って状態を更新してください。',
    nodeRequiredAction: 'Node 導入ページを開く',
    nodeRequiredSecondary: '導入後に更新',
    nodeRequiredDisabledHint: 'Node.js が見つかるまで、公式クライアント導入・Forge 導入・修復・検証は無効になります。',
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
    browseMode: '閲覧モード',
    searchMode: '検索モード',
    browseModeHint: '現在のスタックを軸に、Forge 内蔵とコミュニティ入口を分けて閲覧します。',
    searchModeHint: '検索では外部結果だけを表示し、順位付けは選択中の単一スタックを参照します。',
    searchAction: '検索',
    clearSearch: '閲覧へ戻る',
    searchReady: 'キーワードを入力して Enter または検索を押すと、外部ソースだけを表示します。',
    platformFilterLabel: '対象プラットフォーム',
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

const builtInMcpCatalog = builtInMcpCatalogJson as BuiltInMcpCatalog;
const BUILT_IN_SECRET_STORAGE_KEY = 'forge.desktop.built-in-secrets.v1';
const SECRET_PLACEHOLDER_PATTERN = /^\{\{\s*([A-Z0-9_]+)\s*\}\}$/;

function extractRequiredSecrets(env?: Record<string, string>) {
  if (!env) return [] as string[];
  const secrets = new Set<string>();
  Object.values(env).forEach((value) => {
    const match = typeof value === 'string' ? value.match(SECRET_PLACEHOLDER_PATTERN) : null;
    if (match?.[1]) secrets.add(match[1]);
  });
  return Array.from(secrets);
}

const mcpDetailOptions: DetailOption[] = Object.entries(builtInMcpCatalog.servers).map(([id, entry]) => ({
  id,
  title: id,
  summary: entry.summary || `${id} MCP`,
  note: entry.note,
  clients: entry.clients,
  requiredSecrets: extractRequiredSecrets(entry.config.env),
}));

const builtInSecretFields: BuiltInSecretField[] = Array.from(
  Object.entries(builtInMcpCatalog.servers).reduce((map, [id, entry]) => {
    const requiredSecrets = extractRequiredSecrets(entry.config.env);
    requiredSecrets.forEach((key) => {
      const existing = map.get(key) || {
        key,
        clients: new Set<Client>(),
        mcpIds: new Set<string>(),
        mcpTitles: new Set<string>(),
      };
      entry.clients.forEach((client) => existing.clients.add(client));
      existing.mcpIds.add(id);
      existing.mcpTitles.add(id);
      map.set(key, existing);
    });
    return map;
  }, new Map<string, { key: string; clients: Set<Client>; mcpIds: Set<string>; mcpTitles: Set<string> }>()),
).map(([, value]) => ({
  key: value.key,
  clients: Array.from(value.clients),
  mcpIds: Array.from(value.mcpIds),
  mcpTitles: Array.from(value.mcpTitles).sort((a, b) => a.localeCompare(b)),
})).sort((a, b) => a.key.localeCompare(b.key));

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

const nodeDownloadUrl = 'https://nodejs.org/en/download';

const mockDoctorReport: DoctorReport = {
  detection: [
    { name: 'claude', home: '~/.claude', homeLabel: '~/.claude', detected: true, configured: true },
    { name: 'codex', home: '~/.codex', homeLabel: '~/.codex', detected: true, configured: true },
    { name: 'gemini', home: '~/.gemini', homeLabel: '~/.gemini', detected: false, configured: false },
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

function sanitizeToken(value: string) {
  if (!value) return '';
  if (value.length <= 8) return '••••';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function normalizeSecretValues(values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values)
      .map(([key, value]) => [key, value.trim()])
      .filter(([, value]) => value.length > 0),
  );
}

function secretMapsEqual(left: Record<string, string>, right: Record<string, string>) {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key]);
}

function loadStoredBuiltInSecrets() {
  if (typeof window === 'undefined') return {} as Record<string, string>;
  try {
    const raw = window.localStorage.getItem(BUILT_IN_SECRET_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([key, value]) => typeof key === 'string' && typeof value === 'string')
        .map(([key, value]) => [key, value]),
    ) as Record<string, string>;
  } catch {
    return {};
  }
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

async function openTerminal(cwd: string) {
  try {
    await openTerminalHere(cwd);
  } catch {
    window.alert(`Open terminal manually in:\n${cwd}`);
  }
}

async function openExternalTarget(target: string) {
  try {
    await openTarget(target);
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
  const [communityMode, setCommunityMode] = React.useState<'browse' | 'search'>('browse');
  const [communityStackPack, setCommunityStackPack] = React.useState<StackPack>('frontend-web');
  const [selectedInstallRole, setSelectedInstallRole] = React.useState<InstallRolePack>('frontend-engineer');
  const [selectedInstallStacks, setSelectedInstallStacks] = React.useState<StackPack[]>(['frontend-web']);
  const [workspace, setWorkspace] = React.useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('forge.desktop.workspace') || '';
  });
  const [lang, setLang] = React.useState<Lang>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('forge.desktop.lang') : null;
    return (saved as Lang) || detectSystemLanguage();
  });
  const [activeClient, setActiveClient] = React.useState<Client>('claude');
  const [report, setReport] = React.useState<DoctorReport | null>(null);
  const [runtimeStatus, setRuntimeStatus] = React.useState<RuntimeStatus | null>(null);
  const [statusMessage, setStatusMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRunning, setIsRunning] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<string>('');
  const [savedSecretValues, setSavedSecretValues] = React.useState<Record<string, string>>(() => loadStoredBuiltInSecrets());
  const [secretDraftValues, setSecretDraftValues] = React.useState<Record<string, string>>(() => loadStoredBuiltInSecrets());
  const [logExpanded, setLogExpanded] = React.useState(false);
  const [secretExpanded, setSecretExpanded] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingExternalMcp, setPendingExternalMcp] = React.useState<ExternalMcpConfirmData | null>(null);
  const [resultLog, setResultLog] = React.useState('Ready.');
  const [copiedKey, setCopiedKey] = React.useState('');
  const [searchDraft, setSearchDraft] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedOptional, setSelectedOptional] = React.useState<Record<OptionalComponent, boolean>>({
    mcp: true,
    skills: true,
    memory: true,
  });
  const [selectedMcpDetails, setSelectedMcpDetails] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(mcpDetailOptions.map((item) => [item.id, false])),
  );
  const [selectedSkillDetails, setSelectedSkillDetails] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(skillDetailOptions.map((item) => [item.id, false])),
  );
  const [mcpSelectionMode, setMcpSelectionMode] = React.useState<'recommended' | 'custom'>('custom');
  const [skillSelectionMode, setSkillSelectionMode] = React.useState<'recommended' | 'custom'>('recommended');
  const [externalSearchLoading, setExternalSearchLoading] = React.useState(false);
  const [externalSearchError, setExternalSearchError] = React.useState('');
  const [externalSkillResults, setExternalSkillResults] = React.useState<ExternalSkillResult[]>([]);
  const [externalMcpResults, setExternalMcpResults] = React.useState<ExternalMcpResult[]>([]);
  const [externalSources, setExternalSources] = React.useState<ExternalRegistrySource[]>([]);
  const [selectedExternalSourceIds, setSelectedExternalSourceIds] = React.useState<Record<CommunityKind, string[]>>({
    skills: fallbackExternalSources.skills.map((item) => item.id),
    mcp: fallbackExternalSources.mcp.map((item) => item.id),
  });
  const [searchSourceMenuOpen, setSearchSourceMenuOpen] = React.useState(false);
  const [communityPanels, setCommunityPanels] = React.useState({
    roleRecommendations: true,
    builtIns: true,
    repositories: false,
  });
  const [externalInstallBusy, setExternalInstallBusy] = React.useState('');
  const [communityExpanded, setCommunityExpanded] = React.useState<Record<string, boolean>>({});
  const [actionFeedback, setActionFeedback] = React.useState<ActionFeedbackState | null>(null);
  const [runtimeBlocker, setRuntimeBlocker] = React.useState<RuntimeBlocker>(null);

  const t = messages[lang];
  const installGuide = React.useMemo(() => installRoleGuide(selectedInstallRole), [selectedInstallRole]);
  const recommendedInstallStacks = React.useMemo(
    () => visibleStacks(installGuide.recommendedStacks as readonly StackPack[]),
    [installGuide],
  );
  const availableInstallStacks = React.useMemo(
    () => {
      const seen = new Set<StackPack>();
      const ordered: StackPack[] = [];
      [...recommendedInstallStacks, ...visibleStacks(stackOrder)].forEach((stack) => {
        if (!seen.has(stack)) {
          seen.add(stack);
          ordered.push(stack);
        }
      });
      return ordered;
    },
    [recommendedInstallStacks],
  );
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const hasCommittedSearch = deferredSearchQuery.trim().length > 0;

  React.useEffect(() => {
    window.localStorage.setItem('forge.desktop.lang', lang);
  }, [lang]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('forge.desktop.workspace', workspace);
  }, [workspace]);

  React.useEffect(() => {
    if (!isTauriRuntime()) return;
    void (async () => {
      const result = await loadBuiltinMcpSecrets();
      if (!result.ok || !result.data) return;
      setSavedSecretValues(result.data);
      setSecretDraftValues(result.data);
    })();
  }, []);

  React.useEffect(() => {
    setActionFeedback(null);
    setLogExpanded(false);
    setResultLog('Ready.');
  }, [activeClient]);

  React.useEffect(() => {
    if (section !== 'platform') {
      setActionFeedback(null);
    }
    if (section !== 'community') {
      setSearchSourceMenuOpen(false);
    }
  }, [section]);

  React.useEffect(() => {
    if (communityMode !== 'search') {
      setSearchSourceMenuOpen(false);
    }
  }, [communityMode]);

  React.useEffect(() => {
    const allowed = availableInstallStacks;
    setSelectedInstallStacks((current) => {
      const next = current.filter((stack) => allowed.includes(stack));
      if (next.length > 0) return next;
      return allowed.length > 0 ? [allowed[0]] : ['frontend-web'];
    });
  }, [availableInstallStacks]);

  React.useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const previous = document.body.style.overflow;
    if (confirmOpen || pendingExternalMcp || isRunning) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previous || '';
    }
    return () => {
      document.body.style.overflow = previous || '';
    };
  }, [confirmOpen, isRunning, pendingExternalMcp]);

  React.useEffect(() => {
    if (section !== 'community' || communityMode !== 'search') return undefined;
    const q = deferredSearchQuery.trim();
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
        const result = communityKind === 'skills'
          ? await searchExternalSkills(q)
          : await searchExternalMcp(q);
        if (!active) return;
        if (!result.ok || !result.data) {
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
        const payload = result.data as ExternalSearchPayload;
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
  }, [communityKind, communityMode, deferredSearchQuery, section, t.externalSearchError, workspace]);

  const loadState = React.useCallback(async (preserveClient = false) => {
    setIsLoading(true);
    setStatusMessage(t.detectRunning);
    if (!isTauriRuntime()) {
      setRuntimeBlocker(null);
      setReport(mockDoctorReport);
      setRuntimeStatus(null);
      if (!preserveClient) setActiveClient(mockDoctorReport.detection.find((item) => item.detected)?.name || 'claude');
      setStatusMessage(t.detectPreview);
      setLastUpdated(new Date().toLocaleString());
      setIsLoading(false);
      return;
    }

    const result = await getAppState();
    if (!result.ok || !result.data) {
      const detail = extractOutputSummary(result.raw);
      setRuntimeBlocker(detectRuntimeBlocker(result.raw));
      setResultLog(result.raw || 'Failed to read Forge state.');
      setStatusMessage(detail ? `${t.detectFailed} ${detail}` : t.detectFailed);
      setIsLoading(false);
      return;
    }

    const next = result.data.report;
    setRuntimeStatus(result.data.runtime);
    setRuntimeBlocker(result.data.runtime.nodeAvailable ? null : { kind: 'node', detail: 'Node.js runtime is not available.' });
    setReport(next);
    if (!preserveClient) {
      const firstDetected = next.detection.find((item) => item.detected)?.name;
      setActiveClient((current) => {
        const stillVisible = next.detection.some((item) => item.name === current && item.detected);
        return stillVisible ? current : (firstDetected || current);
      });
    }
    setLastUpdated(new Date().toLocaleString());
    setIsLoading(false);
  }, [t.detectFailed, t.detectRunning]);

  React.useEffect(() => {
    setStatusMessage(t.detectRunning);
  }, [t.detectRunning]);

  React.useEffect(() => {
    if (!report || isLoading) return;
    const activeSupport = report.support.find((item) => item.client === activeClient);
    const issue = extractSupportIssue(activeSupport);
    setStatusMessage(issue ? `${t.detectNeedsAttention} ${t.issueSummary}: ${issue}` : t.detectLoaded);
  }, [report, activeClient, isLoading, t.detectLoaded, t.detectNeedsAttention, t.issueSummary]);

  React.useEffect(() => {
    void loadState();
  }, [loadState]);

  const runAction = React.useCallback(async <T,>(kind: ActionKind, runner: () => Promise<ActionResult<T>>) => {
    const runningTitle = platformActionRunningText(kind, activeClient, lang);
    setIsRunning(true);
    setResultLog(runningTitle);
    setActionFeedback({
      id: Date.now(),
      kind,
      tone: 'running',
      title: runningTitle,
      detail: '',
    });
    const result = await runner();
    const displayOutput = stripAnsi(result.raw || result.summary || 'Completed without output.');
    const effectiveOk = result.ok;
    const detail = extractOutputSummary(displayOutput);

    setResultLog(displayOutput);
    setLogExpanded(true);
    setRuntimeBlocker(detectRuntimeBlocker(displayOutput));
    await loadState(kind === 'bootstrap');
    if (effectiveOk) {
      setActionFeedback({
        id: Date.now(),
        kind,
        tone: 'success',
        title: platformActionSuccessText(kind, activeClient, lang),
        detail: detail || t.detectLoaded,
      });
    } else if (kind === 'verify') {
      setActionFeedback({
        id: Date.now(),
        kind,
        tone: 'warn',
        title: t.actionVerifyWarn,
        detail: detail || t.detectNeedsAttention,
      });
    } else {
      setActionFeedback({
        id: Date.now(),
        kind,
        tone: 'error',
        title: t.actionFailed,
        detail: detail || t.detectFailed,
      });
    }
    setIsRunning(false);
  }, [
    activeClient,
    lang,
    loadState,
    t.actionFailed,
    t.actionVerifyWarn,
    t.detectFailed,
    t.detectLoaded,
    t.detectNeedsAttention,
  ]);

  const detection = React.useMemo<DetectionItem>(
    () => report?.detection.find((item) => item.name === activeClient) || {
      name: activeClient,
      home: '',
      homeLabel: '',
      detected: false,
      configured: false,
    },
    [report, activeClient],
  );
  const support = React.useMemo(() => report?.support.find((item) => item.client === activeClient) || null, [report, activeClient]);
  const capabilityMap = report?.capabilityMatrix.capabilities || {};
  const supportIssue = React.useMemo(() => extractSupportIssue(support), [support]);
  const installRoleLabelText = React.useMemo(
    () => roleLabel(selectedInstallRole, lang),
    [lang, selectedInstallRole],
  );
  const recommendedRoleStackLabelText = React.useMemo(
    () => joinWithLocale(recommendedInstallStacks.map((stack) => stackLabel(stack, lang)), lang),
    [lang, recommendedInstallStacks],
  );
  const selectedInstallStackLabels = React.useMemo(
    () => selectedInstallStacks.map((stack) => stackLabel(stack, lang)),
    [lang, selectedInstallStacks],
  );
  const installStackLabelText = React.useMemo(
    () => joinWithLocale(selectedInstallStackLabels, lang),
    [lang, selectedInstallStackLabels],
  );
  const communityStackLabelText = React.useMemo(
    () => stackLabel(communityStackPack, lang),
    [communityStackPack, lang],
  );

  const currentStatus: 'healthy' | 'needs-repair' | 'client-missing' | 'unknown' = React.useMemo(() => {
    if (!detection?.detected && detection?.configured) return 'client-missing';
    if (!detection?.detected) return 'unknown';
    if (support?.ok) return 'healthy';
    if (detection.detected) return 'needs-repair';
    return 'unknown';
  }, [detection, support]);
  const nodeBlocked = runtimeBlocker?.kind === 'node';

  const optionalComponentList = React.useMemo(() => optionalOptions.filter((item) => true), []);
  const activeStackGuides = React.useMemo(
    () => selectedInstallStacks
      .map((stack) => ({ stack, guide: stackGuide(stack) }))
      .filter((entry): entry is { stack: StackPack; guide: NonNullable<ReturnType<typeof stackGuide>> } => Boolean(entry.guide)),
    [selectedInstallStacks],
  );
  const communityStackGuide = React.useMemo(() => stackGuide(communityStackPack), [communityStackPack]);
  const communityRecommendedSkillIdSet = React.useMemo<Set<string>>(() => new Set(
    forgeSkillOptions
      .filter((item) => matchesRecommendedStack(item.recommendedByStack as readonly string[] | undefined, communityStackPack))
      .map((item) => item.id),
  ), [communityStackPack]);
  const communityRecommendedMcpEntries = React.useMemo(() => {
    const guide = communityStackGuide;
    if (!guide) return [] as Array<{ id: string; label: string; why: string; type?: string; source?: string }>;
    const direct = (guide.recommendedMcp || []).map((item) => ({ ...item }));
    const tools = roleGuideExtraTools(guide).map((item) => ({
      id: item.id,
      label: item.label,
      why: item.why,
      type: item.type || 'tooling',
      source: '',
    }));
    return [...direct, ...tools];
  }, [communityStackGuide]);
  const recommendedMcpIdSet = React.useMemo<Set<string>>(() => new Set([
    ...installGuide.recommendedMcp.map((entry) => String(entry.id)),
    ...activeStackGuides.flatMap((entry) => (entry.guide.recommendedMcp || []).map((item) => String(item.id))),
  ]), [installGuide, activeStackGuides]);
  const recommendedSkillIdSet = React.useMemo<Set<string>>(() => new Set(
    forgeSkillOptions
      .filter((item) => item.clients.includes(activeClient))
      .filter((item) => (
        (item.recommendedByRole as readonly string[] | undefined)?.includes(selectedInstallRole)
        || selectedInstallStacks.some((stack) => matchesRecommendedStack(item.recommendedByStack as readonly string[] | undefined, stack))
        || (item.primaryFor as readonly string[] | undefined)?.includes(selectedInstallRole)
      ))
      .map((item) => String(item.id)),
  ), [activeClient, selectedInstallRole, selectedInstallStacks]);
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
  const activeStackRecommendedMcp = React.useMemo(() => Array.from(
    activeStackGuides.reduce((map, entry) => {
      for (const item of entry.guide.recommendedMcp || []) {
        if (!map.has(item.id)) map.set(item.id, item);
      }
      return map;
    }, new Map<string, { id: string; label: string; why: string; type?: string; source?: string }>()),
  ).map(([, item]) => item), [activeStackGuides]);
  const activeStackRecommendedTools = React.useMemo(() => Array.from(
    activeStackGuides.reduce((map, entry) => {
      for (const item of roleGuideExtraTools(entry.guide)) {
        if (!map.has(item.id)) map.set(item.id, item);
      }
      return map;
    }, new Map<string, { id: string; label: string; why: string; type?: string }>()),
  ).map(([, item]) => item), [activeStackGuides]);
  const domainPackLabelText = React.useMemo(() => {
    const domainStacks = selectedInstallStacks.filter((stack) => isDomainStackPack(stack));
    if (domainStacks.length === 0) return null;
    return joinWithLocale(domainStacks.map((stack) => stackLabel(stack, lang)), lang);
  }, [lang, selectedInstallStacks]);
  const selectedMcpServerIds = React.useMemo(
    () => mcpDetailList.filter((item) => selectedMcpDetails[item.id]).map((item) => item.id),
    [mcpDetailList, selectedMcpDetails],
  );
  const selectedRecommendedMcpCount = React.useMemo(
    () => mcpDetailList.filter((item) => selectedMcpDetails[item.id] && recommendedMcpIdSet.has(item.id)).length,
    [mcpDetailList, recommendedMcpIdSet, selectedMcpDetails],
  );
  const recommendedMcpCount = React.useMemo(
    () => mcpDetailList.filter((item) => recommendedMcpIdSet.has(item.id)).length,
    [mcpDetailList, recommendedMcpIdSet],
  );
  const activeSecretFields = React.useMemo(
    () => builtInSecretFields.filter((field) => field.clients.includes(activeClient)),
    [activeClient],
  );
  const normalizedSavedSecrets = React.useMemo(
    () => normalizeSecretValues(savedSecretValues),
    [savedSecretValues],
  );
  const normalizedSecretDrafts = React.useMemo(
    () => normalizeSecretValues(secretDraftValues),
    [secretDraftValues],
  );
  const hasUnsavedSecretChanges = React.useMemo(
    () => !secretMapsEqual(normalizedSavedSecrets, normalizedSecretDrafts),
    [normalizedSavedSecrets, normalizedSecretDrafts],
  );
  const savedSecretKeys = React.useMemo(
    () => Object.keys(normalizedSavedSecrets).sort((a, b) => a.localeCompare(b)),
    [normalizedSavedSecrets],
  );
  const selectedSecretKeys = React.useMemo(
    () => Array.from(new Set(
      mcpDetailList
        .filter((item) => selectedMcpDetails[item.id])
        .flatMap((item) => item.requiredSecrets || []),
    )).sort((a, b) => a.localeCompare(b)),
    [mcpDetailList, selectedMcpDetails],
  );
  const savedSecretValuesForInstall = React.useMemo(
    () => Object.fromEntries(
      selectedSecretKeys
        .map((key) => [key, normalizedSavedSecrets[key] || ''])
        .filter(([, value]) => Boolean(value)),
    ),
    [normalizedSavedSecrets, selectedSecretKeys],
  );
  const missingSelectedSecretKeys = React.useMemo(
    () => selectedSecretKeys.filter((key) => !normalizedSavedSecrets[key]),
    [normalizedSavedSecrets, selectedSecretKeys],
  );
  const selectedSkillIds = React.useMemo(
    () => skillDetailList.filter((item) => selectedSkillDetails[item.id]).map((item) => item.id),
    [skillDetailList, selectedSkillDetails],
  );
  const selectedRecommendedSkillCount = React.useMemo(
    () => skillDetailList.filter((item) => selectedSkillDetails[item.id] && recommendedSkillIdSet.has(item.id)).length,
    [recommendedSkillIdSet, selectedSkillDetails, skillDetailList],
  );
  const recommendedSkillCount = React.useMemo(
    () => skillDetailList.filter((item) => recommendedSkillIdSet.has(item.id)).length,
    [skillDetailList, recommendedSkillIdSet],
  );
  const selectedComponentIds = React.useMemo(() => {
    const ids: OptionalComponent[] = [];
    if (selectedMcpServerIds.length) ids.push('mcp');
    if (selectedSkillIds.length) ids.push('skills');
    if (selectedOptional.memory) ids.push('memory');
    return ids;
  }, [selectedMcpServerIds.length, selectedOptional.memory, selectedSkillIds.length]);
  const allInstallStacksSelected = React.useMemo(
    () => availableInstallStacks.length > 0 && availableInstallStacks.every((stack) => selectedInstallStacks.includes(stack)),
    [availableInstallStacks, selectedInstallStacks],
  );
  const additionalInstallStacks = React.useMemo(
    () => availableInstallStacks.filter((stack) => !recommendedInstallStacks.includes(stack)),
    [availableInstallStacks, recommendedInstallStacks],
  );
  const matchesRecommendedInstallStacks = React.useMemo(
    () => selectedInstallStacks.length === recommendedInstallStacks.length
      && selectedInstallStacks.every((stack) => recommendedInstallStacks.includes(stack)),
    [recommendedInstallStacks, selectedInstallStacks],
  );
  const hasInstalledForgeBase = Boolean(detection?.configured);

  const restoreRecommendedInstallStacks = React.useCallback(() => {
    const recommended: StackPack[] = recommendedInstallStacks.length > 0
      ? recommendedInstallStacks
      : (availableInstallStacks.length > 0 ? [availableInstallStacks[0]] : ['frontend-web']);
    setSelectedInstallStacks(recommended);
  }, [availableInstallStacks, recommendedInstallStacks]);

  const applyRecommendedPreset = React.useCallback(() => {
    restoreRecommendedInstallStacks();
    setSkillSelectionMode('recommended');
    setSelectedSkillDetails((current) => ({
      ...current,
      ...Object.fromEntries(skillDetailList.map((item) => [item.id, recommendedSkillIdSet.has(item.id)])),
    }));
    setSelectedOptional((current) => ({
      ...current,
      skills: skillDetailList.some((item) => recommendedSkillIdSet.has(item.id)),
      memory: true,
    }));
  }, [recommendedSkillIdSet, restoreRecommendedInstallStacks, skillDetailList]);

  React.useEffect(() => {
    if (skillSelectionMode !== 'recommended') return;
    setSelectedSkillDetails((current) => ({
      ...current,
      ...Object.fromEntries(skillDetailList.map((item) => [item.id, recommendedSkillIdSet.has(item.id)])),
    }));
    setSelectedOptional((current) => ({
      ...current,
      skills: skillDetailList.some((item) => recommendedSkillIdSet.has(item.id)),
    }));
  }, [recommendedSkillIdSet, skillDetailList, skillSelectionMode]);
  const toggleInstallStackPreset = React.useCallback(() => {
    if (allInstallStacksSelected) {
      restoreRecommendedInstallStacks();
      return;
    }
    setSelectedInstallStacks(availableInstallStacks);
  }, [allInstallStacksSelected, availableInstallStacks, restoreRecommendedInstallStacks]);

  const installLabel = React.useMemo(() => {
    if (detection?.configured && support?.ok) return platformActionLabel('update', activeClient, lang);
    return platformActionLabel('install', activeClient, lang);
  }, [activeClient, detection, lang, support]);

  const searchResults = React.useMemo(
    () => communityEntries.filter((item) => item.kind === communityKind),
    [communityKind],
  );
  const availableExternalSources = React.useMemo(() => {
    const base = fallbackExternalSources[communityKind];
    const current = externalSources.filter((item) => item.kind === communityKind);
    const merged = new Map(base.map((item) => [item.id, item]));
    current.forEach((item) => merged.set(item.id, item));
    return Array.from(merged.values());
  }, [communityKind, externalSources]);
  const selectedExternalSourceSet = React.useMemo(() => {
    const selected = selectedExternalSourceIds[communityKind];
    if (selected && selected.length > 0) return new Set(selected);
    return new Set(availableExternalSources.map((item) => item.id));
  }, [availableExternalSources, communityKind, selectedExternalSourceIds]);
  const selectedExternalSourceNames = React.useMemo(() => new Set(
    availableExternalSources
      .filter((item) => selectedExternalSourceSet.has(item.id))
      .map((item) => item.name),
  ), [availableExternalSources, selectedExternalSourceSet]);
  const browseOnlySourceResults = React.useMemo(() => {
    const q = deferredSearchQuery.trim().toLowerCase();
    return availableExternalSources
      .filter((item) => selectedExternalSourceSet.has(item.id))
      .filter((item) => item.type !== 'search-install')
      .filter((item) => {
        if (!q) return true;
        const text = [item.name, item.note, item.url, item.trust].join(' ').toLowerCase();
        return text.includes(q);
      });
  }, [availableExternalSources, deferredSearchQuery, selectedExternalSourceSet]);
  const builtInSkillResults = React.useMemo(() => {
    const layerOrder: SkillLayer[] = ['core', 'extended', 'specialized', 'experimental'];
    return [...forgeSkillOptions]
      .sort((a: DetailOption, b: DetailOption) => {
        const recommendedDiff = Number(communityRecommendedSkillIdSet.has(b.id)) - Number(communityRecommendedSkillIdSet.has(a.id));
        if (recommendedDiff !== 0) return recommendedDiff;
        const stackDiff = Number(matchesRecommendedStack(b.recommendedByStack as readonly string[] | undefined, communityStackPack))
          - Number(matchesRecommendedStack(a.recommendedByStack as readonly string[] | undefined, communityStackPack));
        if (stackDiff !== 0) return stackDiff;
        const layerDiff = layerOrder.indexOf(normalizeSkillLayer(a.layer)) - layerOrder.indexOf(normalizeSkillLayer(b.layer));
        if (layerDiff !== 0) return layerDiff;
        return a.title.localeCompare(b.title);
      });
  }, [communityRecommendedSkillIdSet, communityStackPack]);
  const builtInSkillGroups = React.useMemo(() => groupSkillsByLayer(builtInSkillResults), [builtInSkillResults]);
  const communityRepoResults = React.useMemo(
    () => searchResults.filter((entry) => entry.kind === 'skills'),
    [searchResults],
  );
  const externalSkillResultsSorted = React.useMemo(
    () => [...externalSkillResults]
      .filter((entry) => selectedExternalSourceNames.has(entry.sourceLabel))
      .sort((a, b) => {
      const communityTerms = tokenizeSearchTerms(communityStackPack, stackLabel(communityStackPack, lang));
      const scoreDiff = scoreExternalSkill(b, deferredSearchQuery, communityRecommendedSkillIdSet, communityTerms)
        - scoreExternalSkill(a, deferredSearchQuery, communityRecommendedSkillIdSet, communityTerms);
      if (scoreDiff !== 0) return scoreDiff;
      return a.title.localeCompare(b.title);
    }),
    [communityRecommendedSkillIdSet, communityStackPack, deferredSearchQuery, externalSkillResults, lang, selectedExternalSourceNames],
  );
  const externalMcpResultsSorted = React.useMemo(
    () => [...externalMcpResults]
      .filter((entry) => selectedExternalSourceNames.has(entry.sourceLabel))
      .sort((a, b) => {
      const communityMcpIds = new Set(communityRecommendedMcpEntries.map((item) => item.id));
      const communityTerms = tokenizeSearchTerms(communityStackPack, stackLabel(communityStackPack, lang), ...communityRecommendedMcpEntries.map((item) => item.label));
      const scoreDiff = scoreExternalMcp(b, deferredSearchQuery, communityMcpIds, communityTerms)
        - scoreExternalMcp(a, deferredSearchQuery, communityMcpIds, communityTerms);
      if (scoreDiff !== 0) return scoreDiff;
      return a.title.localeCompare(b.title);
    }),
    [communityRecommendedMcpEntries, communityStackPack, deferredSearchQuery, externalMcpResults, lang, selectedExternalSourceNames],
  );
  const hasExternalSkillDisplayResults = externalSkillResultsSorted.length > 0 || browseOnlySourceResults.length > 0;
  const hasExternalMcpDisplayResults = externalMcpResultsSorted.length > 0 || browseOnlySourceResults.length > 0;
  const communityRecommendedSkills = React.useMemo(
    () => {
      const ids = new Set<string>(
        forgeSkillOptions
          .filter((item) => matchesRecommendedStack(item.recommendedByStack as readonly string[] | undefined, communityStackPack))
          .map((item) => item.id),
      );
      return forgeSkillOptions
        .filter((item) => ids.has(item.id))
        .sort((a, b) => {
          const stackBoost = Number(matchesRecommendedStack(b.recommendedByStack as readonly string[] | undefined, communityStackPack))
            - Number(matchesRecommendedStack(a.recommendedByStack as readonly string[] | undefined, communityStackPack));
          if (stackBoost !== 0) return stackBoost;
          const layerOrder: SkillLayer[] = ['core', 'extended', 'specialized', 'experimental'];
          const diff = layerOrder.indexOf(normalizeSkillLayer(a.layer)) - layerOrder.indexOf(normalizeSkillLayer(b.layer));
          return diff !== 0 ? diff : a.title.localeCompare(b.title);
        });
    },
    [communityStackPack],
  );

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

  const selectInstallRole = React.useCallback((role: InstallRolePack) => {
    setSelectedInstallRole(role);
    const recommended = visibleStacks(installRoleGuide(role).recommendedStacks as readonly StackPack[]);
    setSelectedInstallStacks(recommended.length > 0 ? recommended : ['frontend-web']);
  }, []);

  const toggleInstallStack = React.useCallback((stack: StackPack) => {
    setSelectedInstallStacks((current) => {
      const exists = current.includes(stack);
      if (exists) {
        return current.length === 1 ? current : current.filter((item) => item !== stack);
      }
      return orderStacks([...current, stack]);
    });
  }, []);

  const actionBadge = React.useCallback((kind: ActionKind) => {
    if (!actionFeedback || actionFeedback.kind !== kind) return null;
    if (actionFeedback.tone === 'running') {
      return { text: t.actionRunningBadge, tone: 'running' as ActionTone };
    }
    if (actionFeedback.tone === 'success') {
      return { text: t.actionSuccessBadge, tone: 'success' as ActionTone };
    }
    if (actionFeedback.tone === 'warn') {
      return { text: t.actionWarnBadge, tone: 'warn' as ActionTone };
    }
    return { text: t.actionErrorBadge, tone: 'error' as ActionTone };
  }, [actionFeedback, t.actionErrorBadge, t.actionRunningBadge, t.actionSuccessBadge, t.actionWarnBadge]);

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

  const submitCommunitySearch = React.useCallback(() => {
    const next = searchDraft.trim();
    setCommunityMode('search');
    React.startTransition(() => {
      setSearchQuery(next);
    });
  }, [searchDraft]);

  const resetCommunitySearch = React.useCallback(() => {
    setSearchDraft('');
    setCommunityMode('browse');
    setSearchSourceMenuOpen(false);
    React.startTransition(() => {
      setSearchQuery('');
    });
  }, []);

  const toggleCommunityExpanded = React.useCallback((id: string) => {
    setCommunityExpanded((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  const toggleCommunityPanel = React.useCallback((panel: 'roleRecommendations' | 'builtIns' | 'repositories') => {
    setCommunityPanels((current) => ({ ...current, [panel]: !current[panel] }));
  }, []);

  const toggleExternalSource = React.useCallback((id: string) => {
    setSelectedExternalSourceIds((current) => {
      const currentList = current[communityKind];
      const exists = currentList.includes(id);
      const nextList = exists
        ? (currentList.length === 1 ? currentList : currentList.filter((item) => item !== id))
        : [...currentList, id];
      return { ...current, [communityKind]: nextList };
    });
  }, [communityKind]);

  const stageKey = React.useMemo(() => {
    if (section === 'platform') return `platform-${activeClient}`;
    if (section === 'community') return `community-${communityKind}-${communityMode}-${activeClient}-${communityStackPack}`;
    return 'settings';
  }, [activeClient, communityKind, communityMode, communityStackPack, section]);

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
    const result = await installExternalSkill({
      client: activeClient,
      source: entry.source,
      skill: entry.skill,
    });
    if (!result.ok) {
      setResultLog(`${t.externalInstallFailed}\n${entry.skill}`);
      setLogExpanded(true);
      setExternalInstallBusy('');
      return;
    }
    const targetDir = result.data && typeof result.data === 'object' && 'targetDir' in result.data
      ? String(result.data.targetDir ?? '')
      : '';
    setResultLog(`${t.externalInstallDone}\n${entry.skill}\n${targetDir}`.trim());
    setSection('platform');
    setSelectedOptional((current) => ({ ...current, skills: true }));
    setSelectedSkillDetails((current) => ({ ...current, [entry.skill]: true }));
    setLogExpanded(true);
    setExternalInstallBusy('');
    await loadState();
  }, [activeClient, loadState, t.externalInstallDone, t.externalInstallFailed]);

  const confirmExternalMcpInstall = React.useCallback(async () => {
    if (!pendingExternalMcp) return;
    const { entry, busyKey } = pendingExternalMcp;
    setPendingExternalMcp(null);
    setExternalInstallBusy(busyKey);
    const result = await installExternalMcp({
      client: activeClient,
      spec: entry.installSpec!,
    });
    if (!result.ok) {
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
  }, [activeClient, loadState, pendingExternalMcp, t.externalInstallDone, t.externalInstallFailed]);

  const requestExternalMcpInstall = React.useCallback(async (entry: ExternalMcpResult) => {
    if (!entry.installable || !entry.installSpec) {
      if (entry.url) {
        await openExternalTarget(entry.url);
      }
      return;
    }
    const busyKey = `mcp:${entry.id}`;
    setPendingExternalMcp({ entry, busyKey });
  }, []);

  const openConfirm = React.useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const saveSecretValues = React.useCallback(async () => {
    const next = normalizeSecretValues(secretDraftValues);
    if (!isTauriRuntime()) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(BUILT_IN_SECRET_STORAGE_KEY, JSON.stringify(next));
      }
      setSavedSecretValues(next);
      return;
    }
    const result = await saveBuiltinMcpSecrets(next);
    if (!result.ok || !result.data) {
      setResultLog(result.raw || result.summary || 'Failed to save MCP secrets.');
      setLogExpanded(true);
      return;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(BUILT_IN_SECRET_STORAGE_KEY, JSON.stringify(next));
    }
    setSavedSecretValues(result.data);
    setSecretDraftValues(result.data);
  }, [secretDraftValues]);

  const resetSecretValues = React.useCallback(() => {
    setSecretDraftValues(savedSecretValues);
  }, [savedSecretValues]);

  const buildPlatformActionPayload = React.useCallback((): ActionPayload => {
    const encodedSecrets = Object.keys(savedSecretValuesForInstall).length > 0
      ? encodeBase64Json(savedSecretValuesForInstall)
      : null;
    return {
      client: activeClient,
      cwd: workspace.trim() || undefined,
      lang,
      components: selectedComponentIds,
      mcpServers: selectedMcpServerIds,
      skillNames: selectedSkillIds,
      secretValuesBase64: encodedSecrets,
    };
  }, [activeClient, lang, savedSecretValuesForInstall, selectedComponentIds, selectedMcpServerIds, selectedSkillIds, workspace]);

  const runRepairAction = React.useCallback(async () => {
    await runAction('repair', () => repairClientConfig(buildPlatformActionPayload()));
  }, [buildPlatformActionPayload, runAction]);

  const executeConfirmedAction = React.useCallback(async () => {
    setConfirmOpen(false);
    await runAction('install', () => installClientConfig(buildPlatformActionPayload()));
  }, [buildPlatformActionPayload, runAction]);

  const platformTabs = clientOrder.map((client) => ({
    id: client,
    ...clientMeta(client),
  }));
  const repairLabel = platformActionLabel('repair', activeClient, lang);
  const confirmTitle = platformConfirmTitle(
    detection?.configured ? 'update' : 'install',
    activeClient,
    lang,
  );
  const runningOverlayDetail = actionFeedback?.kind ? platformBusyHint(actionFeedback.kind, lang) : '';

  return (
    <div className="min-h-screen bg-[#f3f1ea] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-4 py-4">
        <header className="flex items-center justify-between gap-5 pb-5">
          <div className="flex items-center gap-4">
            <AppForgeMark className="h-10 w-10 rounded-[12px] shadow-[0_12px_24px_rgba(15,23,42,0.18)]" />
            <div>
              <div className="text-[16px] font-semibold tracking-[-0.02em]">{t.productName}</div>
              <div className="text-[13px] text-slate-500">{t.currentWorkspace}: <span className="font-mono text-[11px] text-slate-600">{workspace || '(auto)'}</span></div>
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

        <section key={`summary-${stageKey}`} className="forge-stage-strip mb-5 grid grid-cols-[minmax(0,1fr)_160px_160px_160px] gap-3">
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
          {section === 'platform' && (
            <div key={stageKey} className="forge-stage-view forge-stage-stack flex min-h-0 flex-col gap-4">
              {actionFeedback && (
                <ActionFeedbackBanner key={actionFeedback.id} state={actionFeedback} />
              )}
              {nodeBlocked && (
                <section className="overflow-hidden rounded-[12px] border border-blue-200 bg-blue-50 shadow-[0_10px_24px_rgba(59,130,246,0.10)]">
                  <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-[14px] font-semibold text-blue-950">{t.nodeRequiredTitle}</div>
                      <div className="mt-1 text-[12px] leading-6 text-blue-800">{t.nodeRequiredHint}</div>
                      <div className="mt-2 text-[11px] text-blue-700">{runtimeBlocker?.detail || t.nodeRequiredDisabledHint}</div>
                      <div className="mt-1 text-[11px] text-blue-700">{t.nodeRequiredDisabledHint}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => void openExternalTarget(nodeDownloadUrl)} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900 px-3 py-2 text-[12px] font-medium text-white shadow-[0_10px_18px_rgba(15,23,42,0.16)]">
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t.nodeRequiredAction}
                      </button>
                      <button type="button" onClick={() => void loadState()} disabled={isLoading || isRunning} className="inline-flex items-center gap-2 rounded-[10px] border border-blue-200 bg-white px-3 py-2 text-[12px] font-medium text-blue-800 disabled:opacity-50">
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        {t.nodeRequiredSecondary}
                      </button>
                    </div>
                  </div>
                </section>
              )}
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
                    <p className="mt-1 text-[13px] text-slate-500">
                      {nodeBlocked
                        ? t.nodeRequiredHint
                        : currentStatus === 'client-missing'
                        ? t.platformClientMissing
                        : detection.detected
                        ? (currentStatus === 'needs-repair' ? t.platformNeedsRepair : t.platformReady)
                        : t.platformBlocked}
                    </p>
                  </div>
                  <div className={`rounded-[14px] bg-gradient-to-br px-3 py-2.5 text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)] ${clientAccent(activeClient)}`}>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/75">{t.forgeState}</div>
                    <div className="mt-1 text-[17px] font-semibold">{currentStatus === 'healthy' ? t.healthyState : currentStatus === 'needs-repair' ? t.needsRepair : currentStatus === 'client-missing' ? t.clientMissingState : t.notConfigured}</div>
                  </div>
                </div>

                <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <StatusMetric title={t.environment} value={detection.detected ? t.detected : t.missing} tone={detection.detected ? 'good' : 'neutral'} compact />
                      <StatusMetric title={t.forgeState} value={detection.configured ? t.configured : t.notConfigured} tone={detection.configured ? 'good' : 'neutral'} compact />
                      <StatusMetric title={t.status} value={currentStatus === 'healthy' ? t.healthyState : currentStatus === 'needs-repair' ? t.needsRepair : currentStatus === 'client-missing' ? t.clientMissingState : t.unknown} tone={currentStatus === 'healthy' ? 'good' : currentStatus === 'needs-repair' || currentStatus === 'client-missing' ? 'warn' : 'neutral'} compact />
                      <StatusMetric title={t.supported} value={currentSupportLabel('mcp')} tone="neutral" compact />
                    </div>

                    <div className="mt-4 rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="text-[13px] font-medium text-slate-900">{detection.detected ? t.systemDetected : t.systemMissing}</div>
                      <div className="mt-1 text-[11px] text-slate-500">{t.installedPath}: <span className="font-mono text-slate-700">{detection.home}</span></div>
                    </div>

                    {currentStatus === 'needs-repair' && (
                      <div className="mt-4 rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-3">
                        <div className="text-[13px] font-medium text-amber-900">{t.platformNeedsRepair}</div>
                        <div className="mt-1 text-[11px] text-amber-700">
                          {t.issueSummary}: {supportIssue || t.detectNeedsAttention}
                        </div>
                      </div>
                    )}

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
                      <ActionButton
                        label={t.officialInstall}
                        onClick={() => void runAction('bootstrap', () => bootstrapOfficialClient(activeClient))}
                        disabled={isRunning || nodeBlocked || Boolean(detection.detected)}
                        loading={Boolean(isRunning && actionFeedback?.kind === 'bootstrap')}
                        badgeText={actionBadge('bootstrap')?.text}
                        badgeTone={actionBadge('bootstrap')?.tone}
                        icon={<Plus className="h-3.5 w-3.5" />}
                        compact
                      />
                      <ActionButton
                        label={t.verifyNow}
                        onClick={() => void runAction('verify', () => verifyClientConfig({
                          client: activeClient,
                          cwd: workspace.trim() || undefined,
                          lang,
                          components: [],
                          mcpServers: [],
                          skillNames: [],
                          secretValuesBase64: null,
                        }))}
                        disabled={isRunning || nodeBlocked || !detection.detected}
                        loading={Boolean(isRunning && actionFeedback?.kind === 'verify')}
                        badgeText={actionBadge('verify')?.text}
                        badgeTone={actionBadge('verify')?.tone}
                        icon={<CheckCheck className="h-3.5 w-3.5" />}
                        compact
                      />
                      <ActionButton
                        label={repairLabel}
                        onClick={() => void runRepairAction()}
                        disabled={isRunning || nodeBlocked}
                        loading={Boolean(isRunning && actionFeedback?.kind === 'repair')}
                        badgeText={actionBadge('repair')?.text}
                        badgeTone={actionBadge('repair')?.tone}
                        icon={<RefreshCw className="h-3.5 w-3.5" />}
                        compact
                      />
                      <ActionButton label={t.openConfig} onClick={() => void openExternalTarget(detection.home)} disabled={!detection.home} icon={<FolderOpen className="h-3.5 w-3.5" />} compact />
                      <ActionButton label={t.openTerminal} onClick={() => void openTerminal(workspace)} disabled={!workspace.trim()} icon={<TerminalSquare className="h-3.5 w-3.5" />} compact />
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
                <div className="space-y-4 px-4 py-4">
                  <div className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 space-y-3">
                          <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.currentPersona}</div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-900">{installRoleLabelText}</span>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${hasInstalledForgeBase ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                              {hasInstalledForgeBase ? t.roleStacksInstalled : t.roleStacksPending}
                            </span>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${matchesRecommendedInstallStacks ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                              {matchesRecommendedInstallStacks ? t.recommendedPreset : t.customStacksLabel}
                            </span>
                            {!matchesRecommendedInstallStacks && recommendedRoleStackLabelText && (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
                                {t.recommendedBadge}: {recommendedRoleStackLabelText}
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-slate-500">{matchesRecommendedInstallStacks ? t.quickApplyHint : t.roleStackModeHint}</div>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={openConfirm}
                            disabled={isRunning || nodeBlocked}
                            className="inline-flex items-center justify-center rounded-[10px] bg-slate-900 px-3 py-2.5 text-[12px] font-medium text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {installLabel}
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <div className="rounded-[12px] border border-slate-200 bg-white px-3 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.rolePackLabel}</div>
                              <div className="mt-1 text-[12px] text-slate-500">{t.currentPersona}</div>
                            </div>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                              单选
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {installRoleOrder.map((role) => (
                              <RoleChip
                                key={role}
                                label={roleLabel(role, lang)}
                                selected={selectedInstallRole === role}
                                onClick={() => selectInstallRole(role)}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[12px] border border-slate-200 bg-white px-3 py-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.stackPackLabel}</div>
                              <div className="mt-1 text-[12px] text-slate-500">{t.roleStackModeHint}</div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {!matchesRecommendedInstallStacks && (
                                <button
                                  type="button"
                                  onClick={applyRecommendedPreset}
                                  className="inline-flex items-center justify-center rounded-[10px] bg-white px-3 py-2 text-[12px] font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:ring-slate-300"
                                >
                                  {t.recommendedPreset}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={toggleInstallStackPreset}
                                className="inline-flex items-center justify-center rounded-[10px] bg-white px-3 py-2 text-[12px] font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:ring-slate-300"
                              >
                                {allInstallStacksSelected ? t.restoreRecommendedStacks : t.stackPackSelectAll}
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 space-y-3">
                            <div>
                              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-amber-700">{t.recommendedStacksLabel}</div>
                              <div className="flex flex-wrap gap-2">
                                {recommendedInstallStacks.map((stack) => (
                                  <StackChip
                                    key={stack}
                                    label={stackLabel(stack, lang)}
                                    selected={selectedInstallStacks.includes(stack)}
                                    emphasized
                                    onClick={() => toggleInstallStack(stack)}
                                  />
                                ))}
                              </div>
                            </div>

                            {additionalInstallStacks.length > 0 && (
                              <div>
                                <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.additionalStacksLabel}</div>
                                <div className="flex flex-wrap gap-2">
                                  {additionalInstallStacks.map((stack) => (
                                    <StackChip
                                      key={stack}
                                      label={stackLabel(stack, lang)}
                                      selected={selectedInstallStacks.includes(stack)}
                                      onClick={() => toggleInstallStack(stack)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700">
                          {t.selectedStacksLabel} {selectedInstallStacks.length}/{availableInstallStacks.length}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700">
                          {t.selectedSkillsLabel} {selectedSkillIds.length}/{skillDetailList.length}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700">
                          {t.selectedMcpLabel} {selectedMcpServerIds.length}/{mcpDetailList.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <FoldSection title={t.exaSection} hint={t.secretsCollapsedHint} expanded={secretExpanded} onToggle={() => setSecretExpanded((value) => !value)}>
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <SummaryCard label={t.savedSecretsCount} value={String(savedSecretKeys.length)} />
                    <SummaryCard label={t.selectedSecretsCount} value={String(selectedSecretKeys.length)} />
                    <SummaryCard label={t.missingSecretsCount} value={String(missingSelectedSecretKeys.length)} />
                  </div>
                  <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.savedSecretsList}</div>
                    {savedSecretKeys.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {savedSecretKeys.map((key) => (
                          <span key={key} className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700">
                            {key}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-[12px] text-slate-500">{t.noSavedSecrets}</div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[12px] text-slate-500">
                      {hasUnsavedSecretChanges ? t.secretDirtyHint : t.secretSavedHint}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={resetSecretValues}
                        disabled={!hasUnsavedSecretChanges}
                        className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t.resetSecrets}
                      </button>
                      <button
                        type="button"
                        onClick={saveSecretValues}
                        className="rounded-[10px] bg-slate-900 px-3 py-2 text-[11px] font-medium text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]"
                      >
                        {t.saveSecrets}
                      </button>
                    </div>
                  </div>
                  {activeSecretFields.length === 0 ? (
                    <div className="rounded-[12px] border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-[12px] text-slate-500">
                      {t.noSecretYet}
                    </div>
                  ) : (
                    activeSecretFields.map((field) => {
                      const draftValue = secretDraftValues[field.key] || '';
                      const savedValue = normalizedSavedSecrets[field.key] || '';
                      const pending = draftValue.trim() !== savedValue;
                      return (
                        <div key={field.key} className="rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400">{field.key}</div>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${pending ? 'bg-amber-50 text-amber-700 ring-amber-200' : savedValue ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                              {pending ? t.secretPending : savedValue ? t.secretReady : t.secretEmpty}
                            </span>
                          </div>
                          <input
                            type="password"
                            value={draftValue}
                            onChange={(event) => setSecretDraftValues((current) => ({ ...current, [field.key]: event.target.value }))}
                            placeholder={field.key}
                            className="mt-3 h-12 w-full rounded-[12px] border border-slate-200 bg-white px-4 font-mono text-[13px] outline-none transition focus:border-slate-400"
                          />
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
                            <span>{t.secretUsedBy}: {field.mcpTitles.join(', ')}</span>
                            {savedValue && <span className="font-mono text-slate-400">{sanitizeToken(savedValue)}</span>}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-400">{t.secretSkipHint}</div>
                        </div>
                      );
                    })
                  )}
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
                  title={confirmTitle}
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
                  onToggleMcp={(id) => {
                    setMcpSelectionMode('custom');
                    setSelectedMcpDetails((current) => ({ ...current, [id]: !current[id] }));
                  }}
                  onToggleAllMcp={() => {
                    setMcpSelectionMode('custom');
                    setSelectedMcpDetails(
                      Object.fromEntries(
                        mcpDetailList.map((item) => [
                          item.id,
                          !(mcpDetailList.length > 0 && selectedMcpServerIds.length === mcpDetailList.length),
                        ]),
                      ),
                    );
                  }}
                  skillItems={skillDetailList}
                  selectedSkillDetails={selectedSkillDetails}
                  onToggleSkill={(id) => {
                    setSkillSelectionMode('custom');
                    setSelectedSkillDetails((current) => ({ ...current, [id]: !current[id] }));
                  }}
                  onToggleAllSkill={() => {
                    setSkillSelectionMode('custom');
                    setSelectedSkillDetails(
                      Object.fromEntries(
                        skillDetailList.map((item) => [
                          item.id,
                          !(skillDetailList.length > 0 && selectedSkillIds.length === skillDetailList.length),
                        ]),
                      ),
                    );
                  }}
                  memoryEnabled={selectedOptional.memory}
                  onToggleMemory={() => setSelectedOptional((current) => ({ ...current, memory: !current.memory }))}
                  installRoleLabel={installRoleLabelText}
                  installStackLabel={installStackLabelText}
                  installStackLabels={selectedInstallStackLabels}
                  domainPackLabel={domainPackLabelText}
                  domainPackHint={domainPackLabelText ? t.domainPackHint : null}
                  domainRecommendedMcpLabel={t.domainRecommendedMcpLabel}
                  domainRecommendedToolsLabel={t.domainRecommendedToolsLabel}
                  domainRecommendedMcp={activeStackRecommendedMcp}
                  domainRecommendedTools={activeStackRecommendedTools}
                  recommendedMcpIds={recommendedMcpIdSet}
                  recommendedSkillIds={recommendedSkillIdSet}
                  recommendedMcpCount={recommendedMcpCount}
                  recommendedSkillCount={recommendedSkillCount}
                  onApplyRecommended={applyRecommendedPreset}
                />
              )}
              {isRunning && actionFeedback && (
                <BusyOverlay title={actionFeedback.title} detail={runningOverlayDetail} />
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
            <div key={stageKey} className="forge-stage-view forge-stage-stack flex min-h-0 flex-col gap-4">
              <section className="forge-panel forge-community-shell relative z-30 rounded-[16px] border border-slate-200 bg-white px-5 py-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="text-[20px] font-semibold tracking-[-0.03em] text-slate-950">{t.communityWorkbench}</div>
                    <div className="mt-2 max-w-3xl text-[13px] text-slate-500">{t.communityHint}</div>
                  </div>
                  <div className="forge-community-pill-grid flex flex-wrap gap-2">
                    <div className="forge-segment inline-flex rounded-[12px] border border-slate-200 bg-slate-50 p-1">
                      <button type="button" onClick={() => setCommunityKind('skills')} className={`forge-surface forge-segment-button rounded-[10px] px-3 py-2 text-[12px] font-medium ${communityKind === 'skills' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>{t.skillsTab}</button>
                      <button type="button" onClick={() => setCommunityKind('mcp')} className={`forge-surface forge-segment-button rounded-[10px] px-3 py-2 text-[12px] font-medium ${communityKind === 'mcp' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>{t.mcpTab}</button>
                    </div>
                    <div className="forge-segment inline-flex rounded-[12px] border border-slate-200 bg-slate-50 p-1">
                      <button type="button" onClick={() => setCommunityMode('browse')} className={`forge-surface forge-segment-button rounded-[10px] px-3 py-2 text-[12px] font-medium ${communityMode === 'browse' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>{t.browseMode}</button>
                      <button type="button" onClick={() => setCommunityMode('search')} className={`forge-surface forge-segment-button rounded-[10px] px-3 py-2 text-[12px] font-medium ${communityMode === 'search' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>{t.searchMode}</button>
                    </div>
                  </div>
                </div>

                <div className="forge-mode-panel mt-5 flex flex-col gap-3 rounded-[16px] border border-slate-200 bg-slate-50 p-3">
                  <div className="forge-community-platform-strip flex flex-wrap items-center gap-2">
                    {platformTabs.map((tab) => (
                      <button
                        key={`community-platform-${tab.id}`}
                        type="button"
                        onClick={() => setActiveClient(tab.id)}
                        className={`forge-surface forge-platform-chip inline-flex items-center gap-2 rounded-[12px] px-3 py-2 text-[12px] font-medium ${activeClient === tab.id ? 'bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}
                      >
                        <tab.Icon className="h-[18px] w-[18px]" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="forge-community-search-row flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="forge-search-shell flex min-w-0 flex-1 items-center gap-3 rounded-[14px] border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
                      <Search className={`h-4 w-4 shrink-0 ${communityMode === 'search' && externalSearchLoading ? 'animate-spin text-slate-900' : 'text-slate-400'}`} />
                      <input
                        value={searchDraft}
                        onChange={(event) => setSearchDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            submitCommunitySearch();
                          }
                        }}
                        placeholder={t.searchPlaceholder}
                        className="forge-search-input min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] text-slate-900 outline-none"
                      />
                      {searchDraft.trim() && (
                        <button type="button" onClick={resetCommunitySearch} className="forge-surface rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                          {t.clearSearch}
                        </button>
                      )}
                    </div>
                    <button type="button" onClick={submitCommunitySearch} className="forge-surface forge-search-action inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-slate-900 px-4 text-[12px] font-medium text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
                      <Search className={`h-4 w-4 ${communityMode === 'search' && externalSearchLoading ? 'animate-spin' : ''}`} />
                      {t.searchAction}
                    </button>
                  </div>
                  <div className="forge-community-stack-row flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.stackRecommendations}</div>
                      <div className="forge-community-stack-strip flex flex-wrap gap-2">
                        {orderStacks(visibleStacks(stackOrder)).map((stack) => (
                          <button
                            key={`community-stack-${stack}`}
                            type="button"
                            onClick={() => setCommunityStackPack(stack)}
                            className={`forge-surface forge-chip-button rounded-[12px] px-3 py-2 text-[12px] font-medium ${communityStackPack === stack ? 'bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}
                          >
                            {stackLabel(stack, lang)}
                          </button>
                        ))}
                      </div>
                    </div>
                    {communityMode === 'search' && (
                      <div className="forge-source-selector relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setSearchSourceMenuOpen((current) => !current)}
                          className={`forge-surface inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 text-[12px] font-medium text-slate-700 shadow-[0_10px_22px_rgba(15,23,42,0.06)] ${searchSourceMenuOpen ? 'border-slate-900 text-slate-950' : ''}`}
                        >
                          <Sparkles className="h-4 w-4" />
                          {t.externalSourceLabel}
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                            {selectedExternalSourceSet.size}
                          </span>
                          {searchSourceMenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {searchSourceMenuOpen && (
                          <div className="forge-source-menu absolute right-0 top-[calc(100%+10px)] w-[320px] rounded-[16px] border border-slate-200 bg-white p-3 shadow-[0_24px_56px_rgba(15,23,42,0.16)]">
                            <div className="mb-2 text-[12px] font-semibold text-slate-900">{t.externalSourceLabel}</div>
                            <div className="space-y-2">
                              {availableExternalSources.map((source) => (
                                <button
                                  key={source.id}
                                  type="button"
                                  onClick={() => toggleExternalSource(source.id)}
                                  className={`forge-surface flex w-full items-start justify-between gap-3 rounded-[12px] border px-3 py-3 text-left ${selectedExternalSourceSet.has(source.id) ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'}`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className="text-[12px] font-semibold text-slate-900">{source.name}</div>
                                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${source.type === 'search-install' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                                        {source.type === 'search-install' ? t.installableNow : t.browseOnlyTag}
                                      </span>
                                    </div>
                                    <div className="mt-1 text-[11px] leading-5 text-slate-500">{source.note}</div>
                                  </div>
                                  <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${selectedExternalSourceSet.has(source.id) ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 text-slate-400'}`}>
                                    {selectedExternalSourceSet.has(source.id) ? <Check className="h-3.5 w-3.5" /> : ''}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="forge-community-hint-row flex flex-col gap-2 text-[12px] text-slate-500 lg:flex-row lg:items-center lg:justify-between">
                    <span>{communityMode === 'search' ? t.searchModeHint : t.browseModeHint}</span>
                    <span>{t.stackPackLabel}: {communityStackLabelText}</span>
                  </div>
                </div>
              </section>

              {communityMode === 'browse' && (
                <div className="forge-mode-content relative z-0 space-y-4">
                  <CommunitySectionCard
                    title={t.stackRecommendations}
                    hint={t.stackRecommendationHint}
                    count={communityKind === 'skills' ? communityRecommendedSkills.length : communityRecommendedMcpEntries.length}
                    collapsible
                    expanded={communityPanels.roleRecommendations}
                    onToggle={() => toggleCommunityPanel('roleRecommendations')}
                  >
                    <div className="space-y-3">
                      {communityKind === 'skills' ? (
                        communityRecommendedSkills.map((entry) => (
                          <CommunityAccordionItem
                            key={`role-skill-${entry.id}`}
                            title={entry.title}
                            summary={entry.summary}
                            expanded={Boolean(communityExpanded[`role-skill-${entry.id}`])}
                            onToggle={() => toggleCommunityExpanded(`role-skill-${entry.id}`)}
                            badges={[
                              { label: t.recommendedBadge, tone: 'warn' },
                              { label: skillLayerLabel(normalizeSkillLayer(entry.layer), lang), tone: 'good' },
                            ]}
                            meta={skillSupportHint(entry) || undefined}
                            supportClients={entry.clients}
                          >
                            <div className="space-y-3">
                              {optionalDetailNote(entry) && <div className="text-[12px] text-slate-500">{optionalDetailNote(entry)}</div>}
                              <div className="flex justify-end">
                                <button type="button" onClick={() => addBuiltInSkillToInstall(entry.id)} className="forge-surface inline-flex items-center gap-2 rounded-[12px] bg-slate-900 px-3 py-2 text-[12px] font-medium text-white">
                                  <PlusIcon className="h-3.5 w-3.5" />
                                  {t.addToInstallList}
                                </button>
                              </div>
                            </div>
                          </CommunityAccordionItem>
                        ))
                      ) : (
                        <>
                          {communityRecommendedMcpEntries.map((entry) => (
                            <CommunityAccordionItem
                              key={`domain-mcp-${entry.id}`}
                              title={entry.label}
                              summary={entry.why || ''}
                              expanded={Boolean(communityExpanded[`domain-mcp-${entry.id}`])}
                              onToggle={() => toggleCommunityExpanded(`domain-mcp-${entry.id}`)}
                              badges={[
                                { label: t.stackPackLabel, tone: 'sky' },
                                { label: 'MCP', tone: 'good' },
                              ]}
                            >
                              <div className="flex justify-end">
                                {builtInMcpIds.has(entry.id) ? (
                                  <button type="button" onClick={() => addBuiltInMcpToInstall(entry.id)} className="forge-surface inline-flex items-center gap-2 rounded-[12px] bg-slate-900 px-3 py-2 text-[12px] font-medium text-white">
                                    <PlusIcon className="h-3.5 w-3.5" />
                                    {t.addToInstallList}
                                  </button>
                                ) : entry.source ? (
                                  <button type="button" onClick={() => void openExternalTarget(entry.source!)} className="forge-surface inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700">
                                    <ExternalLink className="h-4 w-4" />
                                    {t.openRepo}
                                  </button>
                                ) : (
                                  <span className="text-[12px] text-slate-400">{communityStackLabelText}</span>
                                )}
                              </div>
                            </CommunityAccordionItem>
                          ))}
                        </>
                      )}
                    </div>
                  </CommunitySectionCard>

                  {communityKind === 'skills' ? (
                    <>
                      <CommunitySectionCard
                        title={t.builtInSkillsSection}
                        hint={t.builtInSkillsHint}
                        count={builtInSkillResults.length}
                        collapsible
                        expanded={communityPanels.builtIns}
                        onToggle={() => toggleCommunityPanel('builtIns')}
                      >
                        <div className="space-y-3">
                          {builtInSkillResults.map((entry: DetailOption) => (
                            <CommunityAccordionItem
                              key={`builtin-skill-${entry.id}`}
                              title={entry.title}
                              summary={entry.summary}
                              expanded={Boolean(communityExpanded[`builtin-skill-${entry.id}`])}
                              onToggle={() => toggleCommunityExpanded(`builtin-skill-${entry.id}`)}
                              badges={[
                                ...(communityRecommendedSkillIdSet.has(entry.id) ? [{ label: t.recommendedBadge, tone: 'warn' as const }] : []),
                                { label: skillLayerLabel(normalizeSkillLayer(entry.layer), lang), tone: 'good' },
                              ]}
                              meta={[skillSupportHint(entry), optionalDetailNote(entry)].filter(Boolean).join(' · ') || undefined}
                              supportClients={entry.clients}
                            >
                              <div className="flex justify-end">
                                <button type="button" onClick={() => addBuiltInSkillToInstall(entry.id)} className="forge-surface inline-flex items-center gap-2 rounded-[12px] bg-slate-900 px-3 py-2 text-[12px] font-medium text-white">
                                  <PlusIcon className="h-3.5 w-3.5" />
                                  {t.addToInstallList}
                                </button>
                              </div>
                            </CommunityAccordionItem>
                          ))}
                        </div>
                      </CommunitySectionCard>

                    </>
                  ) : (
                    <>
                      <CommunitySectionCard
                        title="Forge MCP"
                        hint="当前平台可直接加入安装清单的 MCP 能力。"
                        count={mcpDetailList.length}
                        collapsible
                        expanded={communityPanels.builtIns}
                        onToggle={() => toggleCommunityPanel('builtIns')}
                      >
                        <div className="space-y-3">
                          {mcpDetailList.map((entry) => (
                            <CommunityAccordionItem
                              key={`builtin-mcp-${entry.id}`}
                              title={entry.title}
                              summary={entry.summary}
                              expanded={Boolean(communityExpanded[`builtin-mcp-${entry.id}`])}
                              onToggle={() => toggleCommunityExpanded(`builtin-mcp-${entry.id}`)}
                              badges={[
                                ...(recommendedMcpIdSet.has(entry.id) ? [{ label: t.recommendedBadge, tone: 'warn' as const }] : []),
                                { label: 'MCP', tone: 'sky' },
                              ]}
                              meta={[itemNoteOrClients(entry, lang), entry.note].filter(Boolean).join(' · ') || undefined}
                            >
                              <div className="flex justify-end">
                                <button type="button" onClick={() => addBuiltInMcpToInstall(entry.id)} className="forge-surface inline-flex items-center gap-2 rounded-[12px] bg-slate-900 px-3 py-2 text-[12px] font-medium text-white">
                                  <PlusIcon className="h-3.5 w-3.5" />
                                  {t.addToInstallList}
                                </button>
                              </div>
                            </CommunityAccordionItem>
                          ))}
                        </div>
                      </CommunitySectionCard>

                      <CommunitySectionCard title="MCP Directory" hint="浏览 Forge 内置目录与社区入口，按需展开查看详情。" count={searchResults.length}>
                        <div className="space-y-3">
                          {searchResults.map((entry) => (
                            <CommunityAccordionItem
                              key={`directory-${entry.id}`}
                              title={entry.name}
                              summary={entry.description}
                              expanded={Boolean(communityExpanded[`directory-${entry.id}`])}
                              onToggle={() => toggleCommunityExpanded(`directory-${entry.id}`)}
                              badges={[{ label: 'MCP', tone: 'sky' }, { label: entry.source, tone: 'neutral' }]}
                              meta={entry.note}
                            >
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                  {entry.clients.map((client) => {
                                    const tab = platformTabs.find((item) => item.id === client);
                                    if (!tab) return null;
                                    return (
                                      <span key={`${entry.id}-${client}`} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${clientTint(client)}`}>
                                        <tab.Icon className="h-[18px] w-[18px]" />
                                        <span>{tab.label}</span>
                                      </span>
                                    );
                                  })}
                                </div>
                                <div className="flex justify-end gap-2">
                                  {builtInMcpIds.has(entry.id) && (
                                    <button type="button" onClick={() => addBuiltInMcpToInstall(entry.id)} className="forge-surface inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700">
                                      <PlusIcon className="h-4 w-4" />
                                      {t.addToInstallList}
                                    </button>
                                  )}
                                  <button type="button" onClick={() => void openExternalTarget(entry.url)} className="forge-surface inline-flex items-center gap-2 rounded-[12px] bg-slate-900 px-3 py-2 text-[12px] text-white">
                                    <ExternalLink className="h-4 w-4" />
                                    {t.openRepo}
                                  </button>
                                </div>
                              </div>
                            </CommunityAccordionItem>
                          ))}
                        </div>
                      </CommunitySectionCard>
                    </>
                  )}

                  {communityKind === 'skills' && (
                    <CommunitySectionCard
                      title={t.communityReposSection}
                      hint={t.communityReposHint}
                      count={communityRepoResults.length}
                      collapsible
                      expanded={communityPanels.repositories}
                      onToggle={() => toggleCommunityPanel('repositories')}
                    >
                      <div className="space-y-3">
                        {communityRepoResults.map((entry) => (
                          <CommunityAccordionItem
                            key={`repo-${entry.id}`}
                            title={entry.name}
                            summary={entry.description}
                            expanded={Boolean(communityExpanded[`repo-${entry.id}`])}
                            onToggle={() => toggleCommunityExpanded(`repo-${entry.id}`)}
                            badges={[{ label: entry.source, tone: 'neutral' }]}
                            meta={entry.note}
                            supportClients={entry.clients}
                          >
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {entry.clients.map((client) => {
                                  const tab = platformTabs.find((item) => item.id === client);
                                  if (!tab) return null;
                                  return (
                                    <span key={`${entry.id}-${client}`} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${clientTint(client)}`}>
                                      <tab.Icon className="h-[18px] w-[18px]" />
                                      <span>{tab.label}</span>
                                    </span>
                                  );
                                })}
                              </div>
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => void openExternalTarget(entry.url)} className="forge-surface inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700">
                                  <ExternalLink className="h-4 w-4" />
                                  {t.openRepo}
                                </button>
                                <button type="button" onClick={() => void handleCopy(entry.id, entry.url)} className="forge-surface inline-flex items-center gap-2 rounded-[12px] bg-slate-900 px-3 py-2 text-[12px] text-white">
                                  <Copy className="h-4 w-4" />
                                  {copiedKey === entry.id ? t.copied : t.copySource}
                                </button>
                              </div>
                            </div>
                          </CommunityAccordionItem>
                        ))}
                      </div>
                    </CommunitySectionCard>
                  )}
                </div>
              )}

              {communityMode === 'search' && (
                <div className="forge-mode-content relative z-0">
                <CommunitySectionCard
                  title={t.externalSearchSection}
                  hint={communityKind === 'skills' ? t.externalSearchHintSkills : t.externalSearchHintMcp}
                  count={communityKind === 'skills' ? externalSkillResultsSorted.length : externalMcpResultsSorted.length}
                >
                  {!hasCommittedSearch ? (
                    <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-[13px] text-slate-500">
                      {t.searchReady}
                    </div>
                  ) : externalSearchLoading ? (
                    <div className="forge-loading-pulse rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-[13px] text-slate-500">
                      {t.searchingExternal}
                    </div>
                  ) : externalSearchError ? (
                    <div className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-4 text-[13px] text-rose-700">
                      {externalSearchError}
                    </div>
                  ) : communityKind === 'skills' ? (
                    <div className="space-y-3 forge-search-results">
                      {!hasExternalSkillDisplayResults ? (
                        <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-[13px] text-slate-500">{t.noItems}</div>
                      ) : externalSkillResultsSorted.map((entry) => (
                        <CommunityAccordionItem
                          key={`external-skill-${entry.id}`}
                          title={entry.title}
                          summary={entry.description}
                          expanded={Boolean(communityExpanded[`external-skill-${entry.id}`])}
                          onToggle={() => toggleCommunityExpanded(`external-skill-${entry.id}`)}
                          badges={[
                            { label: entry.sourceLabel, tone: 'good' },
                            ...(entry.installs ? [{ label: `${entry.installs} installs`, tone: 'neutral' as const }] : []),
                          ]}
                          meta={entry.source}
                        >
                          <div className="flex justify-end gap-2">
                            {entry.url && (
                              <button type="button" onClick={() => void openExternalTarget(entry.url!)} className="forge-surface inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700">
                                <ExternalLink className="h-4 w-4" />
                                {t.openRepo}
                              </button>
                            )}
                            <button type="button" onClick={() => void installExternalSkillToCurrent(entry)} disabled={externalInstallBusy === `skill:${entry.id}`} className="forge-surface inline-flex items-center gap-2 rounded-[12px] bg-slate-900 px-3 py-2 text-[12px] font-medium text-white disabled:opacity-50">
                              <PlusIcon className="h-3.5 w-3.5" />
                              {externalInstallBusy === `skill:${entry.id}` ? t.installToCurrentPlatformBusy : t.installToCurrentPlatform}
                            </button>
                          </div>
                        </CommunityAccordionItem>
                      ))}
                      {browseOnlySourceResults.map((source) => (
                        <CommunityAccordionItem
                          key={`search-source-${source.id}`}
                          title={source.name}
                          summary={source.note}
                          expanded={Boolean(communityExpanded[`search-source-${source.id}`])}
                          onToggle={() => toggleCommunityExpanded(`search-source-${source.id}`)}
                          badges={[{ label: t.browseOnlyTag, tone: 'neutral' }, { label: source.trust, tone: 'good' }]}
                          meta={source.url}
                        >
                          <div className="flex justify-end">
                            <button type="button" onClick={() => void openExternalTarget(source.url)} className="forge-surface inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700">
                              <ExternalLink className="h-4 w-4" />
                              {t.openRepo}
                            </button>
                          </div>
                        </CommunityAccordionItem>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 forge-search-results">
                      {!hasExternalMcpDisplayResults ? (
                        <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-[13px] text-slate-500">{t.noItems}</div>
                      ) : externalMcpResultsSorted.map((entry) => (
                        <CommunityAccordionItem
                          key={`external-mcp-${entry.id}`}
                          title={entry.title}
                          summary={entry.description}
                          expanded={Boolean(communityExpanded[`external-mcp-${entry.id}`])}
                          onToggle={() => toggleCommunityExpanded(`external-mcp-${entry.id}`)}
                          badges={[
                            { label: entry.installable ? t.installableNow : t.browseOnlyTag, tone: entry.installable ? 'good' : 'neutral' },
                            ...(entry.officialStatus ? [{ label: entry.officialStatus, tone: 'sky' as const }] : []),
                          ]}
                          meta={entry.installReason || entry.sourceLabel}
                        >
                          <div className="space-y-3">
                            {entry.requiredSecrets && entry.requiredSecrets.length > 0 && (
                              <div className="text-[12px] text-slate-500">{t.requiresSecrets}: {entry.requiredSecrets.join(', ')}</div>
                            )}
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => void openExternalTarget(entry.url || 'https://registry.modelcontextprotocol.io/')} className="forge-surface inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700">
                                <ExternalLink className="h-4 w-4" />
                                {t.openRepo}
                              </button>
                              <button type="button" onClick={() => void requestExternalMcpInstall(entry)} disabled={externalInstallBusy === `mcp:${entry.id}`} className={`forge-surface inline-flex items-center gap-2 rounded-[12px] px-3 py-2 text-[12px] font-medium disabled:opacity-50 ${entry.installable ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
                                <PlusIcon className="h-4 w-4" />
                                {externalInstallBusy === `mcp:${entry.id}` ? t.installToCurrentPlatformBusy : entry.installable ? t.installToCurrentPlatform : t.browseOnlyTag}
                              </button>
                            </div>
                          </div>
                        </CommunityAccordionItem>
                      ))}
                      {browseOnlySourceResults.map((source) => (
                        <CommunityAccordionItem
                          key={`search-source-${source.id}`}
                          title={source.name}
                          summary={source.note}
                          expanded={Boolean(communityExpanded[`search-source-${source.id}`])}
                          onToggle={() => toggleCommunityExpanded(`search-source-${source.id}`)}
                          badges={[{ label: t.browseOnlyTag, tone: 'neutral' }, { label: source.trust, tone: 'good' }]}
                          meta={source.url}
                        >
                          <div className="flex justify-end">
                            <button type="button" onClick={() => void openExternalTarget(source.url)} className="forge-surface inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700">
                              <ExternalLink className="h-4 w-4" />
                              {t.openRepo}
                            </button>
                          </div>
                        </CommunityAccordionItem>
                      ))}
                    </div>
                  )}
                </CommunitySectionCard>
                </div>
              )}
            </div>
          )}

          {section === 'settings' && (
            <div key={stageKey} className="forge-stage-view forge-stage-grid grid h-full grid-cols-[minmax(0,1fr)_360px] gap-4">
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
                  {runtimeStatus && (
                    <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-3">
                      <div className="text-[13px] font-medium text-slate-800">Runtime Cache</div>
                      <div className="mt-2 text-[12px] text-slate-600">Isolation: {runtimeStatus.isolated ? 'Enabled' : 'Disabled'}</div>
                      <div className="mt-1 break-all font-mono text-[11px] text-slate-500">{runtimeStatus.runtimeCacheRoot}</div>
                    </div>
                  )}
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

function platformActionLabel(mode: 'install' | 'update' | 'repair', client: Client, lang: Lang) {
  const clientName = clientMeta(client).label;
  if (lang === 'zh') {
    if (mode === 'install') return `安装 ${clientName} 配置`;
    if (mode === 'update') return `更新 ${clientName} 配置`;
    return `修复 ${clientName} 配置`;
  }
  if (lang === 'ja') {
    if (mode === 'install') return `${clientName} 設定をインストール`;
    if (mode === 'update') return `${clientName} 設定を更新`;
    return `${clientName} 設定を修復`;
  }
  if (mode === 'install') return `Install ${clientName} config`;
  if (mode === 'update') return `Update ${clientName} config`;
  return `Repair ${clientName} config`;
}

function platformActionRunningText(kind: ActionKind, client: Client, lang: Lang) {
  const clientName = clientMeta(client).label;
  if (lang === 'zh') {
    if (kind === 'bootstrap') return `正在安装 ${clientName} 官方客户端...`;
    if (kind === 'install') return `正在安装 ${clientName} 配置...`;
    if (kind === 'repair') return `正在修复 ${clientName} 配置...`;
    return `正在验证 ${clientName} 状态...`;
  }
  if (lang === 'ja') {
    if (kind === 'bootstrap') return `${clientName} 公式クライアントを導入中...`;
    if (kind === 'install') return `${clientName} 設定をインストール中...`;
    if (kind === 'repair') return `${clientName} 設定を修復中...`;
    return `${clientName} の状態を検証中...`;
  }
  if (kind === 'bootstrap') return `Installing the official ${clientName} client...`;
  if (kind === 'install') return `Installing ${clientName} config...`;
  if (kind === 'repair') return `Repairing ${clientName} config...`;
  return `Verifying ${clientName} status...`;
}

function platformActionSuccessText(kind: ActionKind, client: Client, lang: Lang) {
  const clientName = clientMeta(client).label;
  if (lang === 'zh') {
    if (kind === 'bootstrap') return `${clientName} 官方客户端安装完成。`;
    if (kind === 'install') return `${clientName} 配置已写入当前平台。`;
    if (kind === 'repair') return `${clientName} 配置修复已执行完成。`;
    return `${clientName} 状态验证通过。`;
  }
  if (lang === 'ja') {
    if (kind === 'bootstrap') return `${clientName} 公式クライアントの導入が完了しました。`;
    if (kind === 'install') return `${clientName} 設定を現在のクライアントへ書き込みました。`;
    if (kind === 'repair') return `${clientName} 設定の修復が完了しました。`;
    return `${clientName} の検証が完了しました。`;
  }
  if (kind === 'bootstrap') return `The official ${clientName} client was installed.`;
  if (kind === 'install') return `${clientName} config was written to the current client.`;
  if (kind === 'repair') return `${clientName} config repair finished.`;
  return `${clientName} verification passed.`;
}

function platformConfirmTitle(mode: 'install' | 'update' | 'repair', client: Client, lang: Lang) {
  const clientName = clientMeta(client).label;
  if (lang === 'zh') {
    if (mode === 'install') return `确认安装 ${clientName} 配置`;
    if (mode === 'update') return `确认更新 ${clientName} 配置`;
    return `确认修复 ${clientName} 配置`;
  }
  if (lang === 'ja') {
    if (mode === 'install') return `${clientName} 設定のインストール確認`;
    if (mode === 'update') return `${clientName} 設定の更新確認`;
    return `${clientName} 設定の修復確認`;
  }
  if (mode === 'install') return `Confirm ${clientName} install`;
  if (mode === 'update') return `Confirm ${clientName} update`;
  return `Confirm ${clientName} repair`;
}

function platformBusyHint(kind: ActionKind, lang: Lang) {
  if (lang === 'zh') {
    if (kind === 'bootstrap') return '正在后台安装官方客户端，请稍候。完成后会自动刷新状态并展开日志。';
    if (kind === 'verify') return '正在后台执行验证，请稍候。完成后会自动刷新状态并展开日志。';
    return '正在后台执行配置任务，请稍候。完成后会自动刷新状态并展开日志。';
  }
  if (lang === 'ja') {
    if (kind === 'bootstrap') return '公式クライアントをバックグラウンドで導入しています。完了後に状態を再読み込みし、ログを展開します。';
    if (kind === 'verify') return '検証をバックグラウンドで実行しています。完了後に状態を再読み込みし、ログを展開します。';
    return '構成タスクをバックグラウンドで実行しています。完了後に状態を再読み込みし、ログを展開します。';
  }
  if (kind === 'bootstrap') return 'The official client is being installed in the background. The app will refresh status and open the log when it finishes.';
  if (kind === 'verify') return 'Verification is running in the background. The app will refresh status and open the log when it finishes.';
  return 'The configuration task is running in the background. The app will refresh status and open the log when it finishes.';
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
    <button type="button" onClick={onClick} className={`forge-surface inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-[13px] font-medium ${active ? 'bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]' : 'text-slate-600 hover:bg-slate-100'}`}>
      {icon}
      {label}
    </button>
  );
}

function CounterCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`forge-panel forge-surface rounded-[14px] border px-3 py-2.5 shadow-[0_14px_28px_rgba(15,23,42,0.05)] ${accent ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className="mt-2 text-[34px] font-semibold tracking-[-0.05em]">{value}</div>
    </div>
  );
}

function ActionFeedbackBanner({ state }: { state: ActionFeedbackState }) {
  const toneClass = state.tone === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : state.tone === 'warn'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : state.tone === 'error'
        ? 'border-rose-200 bg-rose-50 text-rose-900'
        : 'border-sky-200 bg-sky-50 text-sky-900';
  const Icon = state.tone === 'success' ? CheckCheck : state.tone === 'warn' ? ShieldCheck : state.tone === 'error' ? X : RefreshCw;

  return (
    <section className={`forge-panel forge-feedback-banner forge-surface rounded-[12px] border px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)] ${toneClass}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-white/80 p-2">
          <Icon className={`h-4 w-4 ${state.tone === 'running' ? 'animate-spin' : ''}`} />
        </div>
        <div>
          <div className="text-[13px] font-semibold">{state.title}</div>
          {state.detail && <div className="mt-1 text-[12px] text-current/80">{state.detail}</div>}
        </div>
      </div>
    </section>
  );
}

function ActionButton({
  label,
  onClick,
  icon,
  primary,
  disabled,
  compact,
  loading,
  badgeText,
  badgeTone,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  primary?: boolean;
  disabled?: boolean;
  compact?: boolean;
  loading?: boolean;
  badgeText?: string;
  badgeTone?: ActionTone;
}) {
  const badgeClass = badgeTone === 'success'
    ? 'bg-emerald-100 text-emerald-700'
    : badgeTone === 'warn'
      ? 'bg-amber-100 text-amber-700'
      : badgeTone === 'error'
        ? 'bg-rose-100 text-rose-700'
        : 'bg-sky-100 text-sky-700';

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`forge-surface inline-flex w-full items-center justify-between rounded-[10px] px-3 ${compact ? 'py-2.5 text-[13px]' : 'py-3 text-sm'} font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${primary ? 'bg-slate-900 text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)]' : 'border border-slate-200 bg-white text-slate-700 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]'}`}>
      <span className="inline-flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </span>
      <span className="inline-flex items-center gap-2">
        {badgeText && (
          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${primary && badgeTone !== 'running' ? 'bg-white/15 text-white' : badgeClass}`}>
            {badgeText}
          </span>
        )}
        {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <span className="text-[11px] text-current/70">›</span>}
      </span>
    </button>
  );
}

function StatusMetric({ title, value, tone, compact }: { title: string; value: string; tone: 'good' | 'warn' | 'neutral'; compact?: boolean }) {
  const toneClass = tone === 'good' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : tone === 'warn' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-slate-100 text-slate-700 ring-slate-200';
  return (
    <div className={`forge-panel forge-surface rounded-[12px] border border-slate-200 bg-white ${compact ? 'px-3 py-3' : 'px-4 py-4'}`}>
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
    <section className="forge-panel overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <button type="button" onClick={onToggle} className="forge-surface flex w-full items-center justify-between px-4 py-3 text-left">
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

function CommunitySectionCard({
  title,
  hint,
  count,
  children,
  collapsible,
  expanded,
  onToggle,
}: {
  title: string;
  hint: string;
  count: number;
  children: React.ReactNode;
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const showContent = collapsible ? Boolean(expanded) : true;
  const HeaderTag = collapsible ? 'button' : 'div';
  return (
    <section className="forge-panel forge-community-section rounded-[16px] border border-slate-200 bg-white px-4 py-4 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
      <HeaderTag
        {...(collapsible ? { type: 'button', onClick: onToggle } : {})}
        className={`flex w-full items-start justify-between gap-4 ${collapsible ? 'forge-surface rounded-[12px] text-left' : ''}`}
      >
        <div>
          <div className="text-[16px] font-semibold tracking-[-0.02em] text-slate-950">{title}</div>
          <div className="mt-1 text-[13px] text-slate-500">{hint}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{count}</span>
          {collapsible && (
            <span className={`forge-community-toggle-icon inline-flex rounded-full bg-slate-100 p-2 text-slate-500 ring-1 ring-slate-200 ${showContent ? 'is-expanded' : ''}`}>
              {showContent ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          )}
        </div>
      </HeaderTag>
      {showContent && <div className="forge-community-section-body mt-4">{children}</div>}
    </section>
  );
}

function CommunityAccordionItem({
  title,
  summary,
  badges,
  meta,
  supportClients,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  badges?: Array<{ label: string; tone: 'neutral' | 'good' | 'warn' | 'sky' }>;
  meta?: string;
  supportClients?: readonly Client[];
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <article className="forge-panel forge-community-item overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
      <button type="button" onClick={onToggle} className="forge-surface flex w-full items-start justify-between gap-4 px-4 py-4 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[15px] font-semibold tracking-[-0.02em] text-slate-950">{title}</div>
            {badges?.map((badge) => (
              <span
                key={`${title}-${badge.label}`}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium ring-1 ${
                  badge.tone === 'good'
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    : badge.tone === 'warn'
                      ? 'bg-amber-50 text-amber-700 ring-amber-200'
                      : badge.tone === 'sky'
                        ? 'bg-sky-50 text-sky-700 ring-sky-200'
                        : 'bg-slate-100 text-slate-600 ring-slate-200'
                }`}
              >
                {badge.label}
              </span>
            ))}
          </div>
          <div className="mt-2 text-[13px] text-slate-600">{summary}</div>
          {meta && <div className="mt-2 text-[12px] text-slate-400">{meta}</div>}
        </div>
        <div className="flex shrink-0 items-start gap-2">
          {supportClients && supportClients.length > 0 && (
            <div className="forge-community-support-icons mt-0.5 flex items-center gap-1.5">
              {supportClients.map((client) => {
                const { Icon, label } = clientMeta(client);
                return (
                  <span key={`${title}-${client}`} className={`forge-community-support-icon inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 ${clientTint(client)}`} title={label} aria-label={label}>
                    <Icon className="h-[15px] w-[15px]" />
                  </span>
                );
              })}
            </div>
          )}
          <div className={`forge-community-toggle-icon mt-0.5 rounded-full bg-slate-100 p-2 text-slate-500 ring-1 ring-slate-200 ${expanded ? 'is-expanded' : ''}`}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>
      {expanded && <div className="forge-accordion-content border-t border-slate-100 px-4 py-4">{children}</div>}
    </article>
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
  installStackLabels,
  domainPackLabel,
  domainPackHint,
  domainRecommendedMcpLabel,
  domainRecommendedToolsLabel,
  domainRecommendedMcp,
  domainRecommendedTools,
  recommendedMcpIds,
  recommendedSkillIds,
  recommendedMcpCount,
  recommendedSkillCount,
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
  installStackLabels: string[];
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
  recommendedMcpCount: number;
  recommendedSkillCount: number;
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
  const selectedRecommendedMcpCount = mcpItems.filter((item) => selectedMcpDetails[item.id] && recommendedMcpIds.has(item.id)).length;
  const selectedRecommendedSkillCount = skillItems.filter((item) => selectedSkillDetails[item.id] && recommendedSkillIds.has(item.id)).length;
  const allMcpSelected = mcpItems.length > 0 && selectedMcpCount === mcpItems.length;
  const allSkillsSelected = skillItems.length > 0 && selectedSkillCount === skillItems.length;
  const groupedSkillItems = React.useMemo(() => groupSkillsByLayer(skillItems), [skillItems]);

  return (
    <ModalPortal>
      <div className="forge-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-[2px]">
        <div className="forge-modal-panel flex max-h-[calc(100vh-32px)] w-full max-w-[860px] flex-col overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4">
            <div>
              <div className="text-[18px] font-semibold tracking-[-0.02em]">{title}</div>
              <div className="mt-1 text-[13px] text-slate-500">{hint}</div>
            </div>
            <button type="button" onClick={onCancel} className="rounded-[10px] border border-slate-200 bg-white p-2 text-slate-500"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-4 overflow-y-auto px-4 py-4">
            <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.currentPersona}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-900">{installRoleLabel}</span>
                      {domainPackLabel && (
                        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
                          {t.domainPackLabel}: {domainPackLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={onApplyRecommended} className="shrink-0 rounded-[10px] bg-slate-900 px-3 py-2 text-[12px] font-medium text-white shadow-[0_8px_18px_rgba(15,23,42,0.12)]">
                    {t.recommendedPreset}
                  </button>
                </div>

                <div className="grid gap-2 md:grid-cols-3">
                  <SelectionMetricCard
                    label={t.selectedStacksLabel}
                    value={`${installStackLabels.length}`}
                    hint={installStackLabel || undefined}
                  />
                  <SelectionMetricCard
                    label={t.selectedSkillsLabel}
                    value={`${selectedSkillCount}/${skillItems.length}`}
                    hint={`${t.recommendedBadge} ${selectedRecommendedSkillCount}/${recommendedSkillCount}`}
                  />
                  <SelectionMetricCard
                    label={t.selectedMcpLabel}
                    value={`${selectedMcpCount}/${mcpItems.length}`}
                    hint={`${t.recommendedBadge} ${selectedRecommendedMcpCount}/${recommendedMcpCount}`}
                  />
                </div>

                {installStackLabels.length > 0 && (
                  <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-3">
                    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.stackPackLabel}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {installStackLabels.map((label) => (
                        <span key={label} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-700">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {domainPackLabel && (
              <div className="rounded-[12px] border border-indigo-200 bg-indigo-50/60 px-4 py-4">
                {domainPackHint && <div className="mt-2 text-[12px] text-slate-500">{domainPackHint}</div>}
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  {domainRecommendedMcp.length > 0 && (
                    <div className="rounded-[10px] border border-indigo-200/70 bg-white/70 px-3 py-3">
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
                    <div className="rounded-[10px] border border-slate-200 bg-white/70 px-3 py-3">
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
    </ModalPortal>
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
    <ModalPortal>
      <div className="forge-modal-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]">
        <div className="forge-modal-panel flex max-h-[calc(100vh-32px)] w-full max-w-[760px] flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
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
    </ModalPortal>
  );
}

function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 break-words text-[13px] font-medium text-slate-900">{value}</div>
    </div>
  );
}

function SelectionMetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-[16px] font-semibold tracking-[-0.02em] text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
}

function RoleChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[36px] items-center rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${selected ? 'border-slate-900 bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.14)]' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
    >
      {label}
    </button>
  );
}

function StackChip({
  label,
  selected,
  emphasized,
  onClick,
}: {
  label: string;
  selected: boolean;
  emphasized?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[34px] items-center rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
        selected
          ? 'border-slate-900 bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.14)]'
          : emphasized
            ? 'border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
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

function BusyOverlay({ title, detail }: { title: string; detail: string }) {
  return (
    <ModalPortal>
      <div className="forge-modal-backdrop fixed inset-0 z-[55] flex items-center justify-center bg-slate-900/28 p-4 backdrop-blur-[2px]">
        <div className="forge-modal-panel w-full max-w-[420px] overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.2)]">
          <div className="px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-slate-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)]">
                <RefreshCw className="h-5 w-5 animate-spin" />
              </div>
              <div>
                <div className="text-[16px] font-semibold tracking-[-0.02em] text-slate-900">{title}</div>
                <div className="mt-1 text-[12px] leading-5 text-slate-500">{detail}</div>
              </div>
            </div>
            <div className="forge-loading-pulse mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-sky-400 via-slate-900 to-orange-400 opacity-90" />
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

ReactDOMClient.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
