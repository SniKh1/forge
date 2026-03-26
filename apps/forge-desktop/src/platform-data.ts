import { forgeSkillOptions } from './generated-catalog';
import { forgeRoleDisplay } from './generated-role-display';
import { forgeRoleMcpMatrix } from './generated-role-mcp';
import type { Client } from './lib/backend';

export type PlatformSection = 'platform' | 'community' | 'settings';
export type SetupLayer = 'mcp' | 'skills' | 'memory';
export type ExtensionView = 'mcp' | 'memory';

type RoleMatrix = typeof forgeRoleMcpMatrix.roles;

export type RoleId = keyof RoleMatrix;
export type StackId = string;

export type ClientMeta = {
  id: Client;
  label: string;
  eyebrow: string;
  tagline: string;
  tone: string;
};

export type RoleDefinition = {
  id: RoleId;
  title: string;
  summary: string;
  fit: string;
  recommendedStacks: StackId[];
  recommendedSkills: string[];
};

export type StackDefinition = {
  id: StackId;
  title: string;
  summary: string;
  relatedSkillCount: number;
};

export type PersonaDraft = {
  roleIds: RoleId[];
  stackIds: StackId[];
  mcpServers: string[];
  extraSkillIds: string[];
  enabledLayers: SetupLayer[];
};

export const sectionTabs: Array<{ id: PlatformSection; label: string }> = [
  { id: 'platform', label: '平台' },
  { id: 'community', label: '社区' },
  { id: 'settings', label: '设置' },
];

export const clientMetas: ClientMeta[] = [
  {
    id: 'codex',
    label: 'Codex',
    eyebrow: '主基线',
    tagline: '当前这台机器上最完整的一套 Forge 能力',
    tone: 'bg-[#1f2937] text-white',
  },
  {
    id: 'claude',
    label: 'Claude',
    eyebrow: '稳定入口',
    tagline: '保留稳态工作流与常用扩展，不把细节铺满首屏',
    tone: 'bg-[#8b5e3c] text-white',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    eyebrow: '轻量接入',
    tagline: '先跑通核心工作方式，再按需补强能力层',
    tone: 'bg-[#2553a0] text-white',
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    eyebrow: 'Bridge',
    tagline: '先显示 bridge 状态，再分阶段接入真实 apply / repair',
    tone: 'bg-[#115e59] text-white',
  },
];

const roleCopy = forgeRoleDisplay.roles as Partial<Record<RoleId, { title: string; summary: string; fit: string }>>;
const visibleRoleIds = Array.from(forgeRoleDisplay.visibleRoleIds) as RoleId[];

function titleCaseSegment(value: string) {
  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

const stackCopy: Record<string, { title: string; summary: string }> = {
  architecture: { title: '架构设计', summary: '梳理系统边界、方案取舍和整体结构。' },
  'system-architecture': { title: '系统架构', summary: '面向复杂系统的边界设计和演进决策。' },
  'service-integration': { title: '服务集成', summary: '处理外部接口、边界衔接和服务契约。' },
  'frontend-web': { title: 'Web 前端', summary: '聚焦 Web UI 交付、界面实现和页面细节。' },
  'frontend-desktop': { title: '桌面前端', summary: '聚焦桌面端布局、壳层体验和窗口内交互。' },
  'design-system': { title: '设计系统', summary: '收拢组件风格、令牌和视觉一致性。' },
  'workflow-automation': { title: '工作流自动化', summary: '把步骤编排成可复用的任务流和工具流。' },
  'agent-automation': { title: 'Agent 自动化', summary: '围绕多代理、上下文和执行编排增强能力。' },
  'python-service': { title: 'Python 服务', summary: '用于自动化脚本、服务逻辑和工具后端。' },
  'java-service': { title: 'Java 服务', summary: '用于企业服务、接口层和事务型逻辑。' },
  'platform-infrastructure': { title: '平台基础设施', summary: '处理环境、构建、发布和平台级能力。' },
  observability: { title: '可观测性', summary: '收拢日志、诊断、度量和问题定位。' },
  'security-engineering': { title: '安全工程', summary: '聚焦认证、安全配置和防护策略。' },
  'threat-modeling': { title: '威胁建模', summary: '面向风险识别、攻击面和缓解路径。' },
  'product-discovery': { title: '产品发现', summary: '明确问题空间、用户目标和方案方向。' },
  'product-delivery': { title: '产品交付', summary: '保证需求落地、节奏推进和跨团队同步。' },
  'delivery-management': { title: '交付管理', summary: '聚焦排期、里程碑和团队协作。' },
  'mobile-app': { title: '移动应用', summary: '面向移动产品结构、页面和功能模块。' },
  'mobile-ui': { title: '移动界面', summary: '面向移动端视觉、交互和体验细节。' },
  'data-platform': { title: '数据平台', summary: '构建数据底座、任务编排和平台支撑。' },
  'data-pipeline': { title: '数据管道', summary: '处理采集、转换、计算和传输链路。' },
  release: { title: '发布流程', summary: '覆盖版本交付、验证和发布节奏。' },
  'release-orchestration': { title: '发布编排', summary: '协调发版动作、回滚和多端对齐。' },
  design: { title: '设计协作', summary: '强化视觉判断、设计语义和落地协作。' },
  'interaction-design': { title: '交互设计', summary: '强化反馈节奏、操作流和动效体验。' },
  frontend: { title: '前端基础', summary: '通用前端交付、组件结构和页面实现。' },
  product: { title: '产品工作', summary: '围绕产品定义、文档和方案推进。' },
  python: { title: 'Python 基础', summary: '通用 Python 语言能力和工程实践。' },
  java: { title: 'Java 基础', summary: '通用 Java 语言能力和工程实践。' },
  qa: { title: '质量验证', summary: '聚焦测试、回归和验证方法。' },
  ecommerce: { title: '电商场景', summary: '围绕商品、转化和运营场景增强能力。' },
  'image-generation': { title: '图像生成', summary: '处理图像生成、视觉素材和多模态场景。' },
  'video-creation': { title: '视频创作', summary: '处理视频生产、素材链路和创作工作流。' },
};

function stackFallback(id: string) {
  return {
    title: titleCaseSegment(id),
    summary: '用于补强当前角色的专项能力。',
  };
}

const stackScore = new Map<string, number>();

for (const role of Object.values(forgeRoleMcpMatrix.roles)) {
  for (const stackId of role.recommendedStacks) {
    stackScore.set(stackId, (stackScore.get(stackId) ?? 0) + 3);
  }
}

for (const skill of forgeSkillOptions) {
  for (const stackId of skill.recommendedByStack) {
    stackScore.set(stackId, (stackScore.get(stackId) ?? 0) + 1);
  }
}

const availableStackIds = Array.from(stackScore.keys()).sort((left, right) => {
  const scoreDiff = (stackScore.get(right) ?? 0) - (stackScore.get(left) ?? 0);
  if (scoreDiff !== 0) return scoreDiff;
  return left.localeCompare(right);
});

export const stackDefinitions: StackDefinition[] = availableStackIds.map((id) => {
  const copy = stackCopy[id] ?? stackFallback(id);
  return {
    id,
    title: copy.title,
    summary: copy.summary,
    relatedSkillCount: stackScore.get(id) ?? 0,
  };
});

export const roleDefinitions: RoleDefinition[] = visibleRoleIds.map((id) => {
  const value = forgeRoleMcpMatrix.roles[id];
  const copy = roleCopy[id];
  return {
    id,
    title: copy?.title ?? titleCaseSegment(id),
    summary: copy?.summary ?? '为当前工作目标选择一条明确的主线。',
    fit: copy?.fit ?? '适合围绕当前项目的主任务构建能力组合。',
    recommendedStacks: [...value.recommendedStacks],
    recommendedSkills: [...value.recommendedSkills],
  };
});

export function getRoleDefinition(roleId: RoleId) {
  return roleDefinitions.find((item) => item.id === roleId) ?? roleDefinitions[0];
}

export function getRoleDefinitions(roleIds: RoleId[]) {
  return roleIds.map(getRoleDefinition);
}

export function getStackDefinition(stackId: StackId) {
  return stackDefinitions.find((item) => item.id === stackId) ?? {
    id: stackId,
    title: stackFallback(stackId).title,
    summary: stackFallback(stackId).summary,
    relatedSkillCount: 0,
  };
}

export function createDefaultPersonaDrafts(): Record<Client, PersonaDraft> {
  return {
    codex: {
      roleIds: ['solution-architect'],
      stackIds: ['system-architecture', 'workflow-automation', 'frontend-web'],
      mcpServers: ['context7', 'memory', 'fetch', 'playwright', 'exa'],
      extraSkillIds: ['code-review', 'systematic-debugging'],
      enabledLayers: ['mcp', 'skills', 'memory'],
    },
    claude: {
      roleIds: ['frontend-engineer'],
      stackIds: ['frontend-web', 'design-system'],
      mcpServers: ['context7', 'memory', 'fetch'],
      extraSkillIds: ['code-review'],
      enabledLayers: ['mcp', 'skills', 'memory'],
    },
    gemini: {
      roleIds: ['frontend-engineer'],
      stackIds: ['frontend-web'],
      mcpServers: ['context7', 'fetch'],
      extraSkillIds: [],
      enabledLayers: ['mcp', 'skills'],
    },
    opencode: {
      roleIds: ['ai-automation-engineer'],
      stackIds: ['agent-automation', 'workflow-automation'],
      mcpServers: ['context7', 'fetch', 'memory', 'playwright'],
      extraSkillIds: ['code-review'],
      enabledLayers: ['mcp', 'skills', 'memory'],
    },
  };
}

export const secretLabels: Record<string, string> = {
  EXA_API_KEY: 'EXA 搜索密钥',
};

export const secretHints: Record<string, string> = {
  EXA_API_KEY: '用于 Exa 搜索；启用对应连接时需要补齐。',
};
