import type {
  ClientId,
  PrimaryRole,
  PrimaryStackDomain,
  PromptPack,
  ShellSnapshot,
  SkillCluster,
  WorkspaceCard,
} from './model';

export const primaryRoles: Array<{ id: PrimaryRole; title: string; summary: string }> = [
  { id: 'frontend-lead', title: '前端负责人', summary: '负责桌面界面、设计系统、多客户端交互质量与体验收敛。' },
  { id: 'backend-lead', title: '后端负责人', summary: '负责服务边界、配置编排、数据契约与系统稳定性。' },
  { id: 'ai-workflow-lead', title: 'AI 工作流负责人', summary: '负责 Prompt、Skill、Agent 编排与自动化执行路径。' },
  { id: 'product-lead', title: '产品负责人', summary: '负责需求拆解、路线节奏、交付标准与文档沉淀。' },
  { id: 'design-lead', title: '设计负责人', summary: '负责界面语言、视觉一致性、信息层级与交互策略。' },
  { id: 'qa-lead', title: '质量负责人', summary: '负责测试策略、回归验证、质量证据与异常收束。' },
  { id: 'platform-lead', title: '平台负责人', summary: '负责运行环境、基础设施、发布流程与桌面端兼容性。' },
  { id: 'engineering-lead', title: '工程负责人', summary: '负责跨角色统筹、架构治理、能力编组与执行闭环。' },
];

export const primaryStacks: Array<{ id: PrimaryStackDomain; title: string; summary: string }> = [
  { id: 'frontend-experience', title: '前端体验', summary: 'Web、Desktop 与多端交互实现。' },
  { id: 'design-systems', title: '设计系统', summary: '组件、Token、状态规范与设计落地。' },
  { id: 'backend-systems', title: '后端系统', summary: '服务、接口、认证、集成与数据边界。' },
  { id: 'data-automation', title: '数据与自动化', summary: '数据流、任务流、脚本链路与自动化编排。' },
  { id: 'ai-workflows', title: 'AI 工作流', summary: 'Prompt、Skill、Agent 与 Tool 的协同模式。' },
  { id: 'product-delivery', title: '产品交付', summary: '需求、路线图、迭代、协作与对齐机制。' },
  { id: 'quality-testing', title: '质量测试', summary: '测试、验证、诊断、证据与回归治理。' },
  { id: 'security-risk', title: '安全与风险', summary: '安全审查、边界建模、权限控制与风险识别。' },
  { id: 'platform-release', title: '平台发布', summary: '环境、构建、发布、回滚与运行维护。' },
  { id: 'knowledge-collaboration', title: '知识协作', summary: '团队记忆、规范、沟通与操作手册。' },
];

export const skillClusters: Array<{ id: SkillCluster; title: string; count: number }> = [
  { id: 'planning', title: '规划', count: 18 },
  { id: 'delivery', title: '交付', count: 21 },
  { id: 'quality', title: '质量', count: 16 },
  { id: 'knowledge', title: '知识', count: 15 },
  { id: 'design', title: '设计', count: 14 },
  { id: 'release-ops', title: '发布运维', count: 12 },
  { id: 'skill-engineering', title: 'Skill 工程', count: 14 },
];

export const promptPacks: Array<{ id: PromptPack; title: string }> = [
  { id: 'planning', title: '规划包' },
  { id: 'execution', title: '执行包' },
  { id: 'review', title: '评审包' },
  { id: 'diagnostics', title: '诊断包' },
  { id: 'design', title: '设计包' },
  { id: 'release', title: '发布包' },
  { id: 'handoff', title: '交接包' },
  { id: 'knowledge', title: '知识包' },
];

export const clients: Array<{ id: ClientId; title: string; summary: string }> = [
  { id: 'claude', title: 'Claude', summary: '偏重规划、写作、产品梳理与团队协作流程。' },
  { id: 'codex', title: 'Codex', summary: '偏重编码、执行、修复、自动化与开发交付。' },
  { id: 'gemini', title: 'Gemini', summary: '偏重多模态、研究、资料吸收与外部信息连接。' },
];

export const demoWorkspaces: WorkspaceCard[] = [
  {
    id: 'team-workbench',
    name: '团队工作台',
    summary: '面向工程负责人和小团队的主工作空间，统一三端客户端、角色、栈包与 skill 工作流。',
    role: 'engineering-lead',
    stacks: ['ai-workflows', 'platform-release', 'knowledge-collaboration'],
    clients: ['claude', 'codex', 'gemini'],
    clusters: ['planning', 'delivery', 'quality', 'knowledge'],
    promptPacks: ['planning', 'execution', 'review', 'diagnostics', 'release'],
    tools: [
      { id: 'github-mcp', title: 'GitHub MCP', type: 'mcp', status: 'ready' },
      { id: 'notion-mcp', title: 'Notion MCP', type: 'mcp', status: 'optional' },
      { id: 'browser-use', title: 'browser-use', type: 'local', status: 'ready' },
    ],
    status: 'healthy',
  },
  {
    id: 'delivery-hub',
    name: '交付中枢',
    summary: '面向版本推进、评审、验证与发布治理的集中工作流。',
    role: 'platform-lead',
    stacks: ['product-delivery', 'quality-testing', 'platform-release'],
    clients: ['claude', 'codex'],
    clusters: ['planning', 'quality', 'release-ops'],
    promptPacks: ['planning', 'review', 'diagnostics', 'release', 'handoff'],
    tools: [
      { id: 'slack-mcp', title: 'Slack MCP', type: 'mcp', status: 'missing' },
      { id: 'linear-mcp', title: 'Linear MCP', type: 'mcp', status: 'optional' },
    ],
    status: 'attention',
  },
  {
    id: 'skill-factory',
    name: '能力工坊',
    summary: '围绕 Prompt、Skill、角色包、知识沉淀与外部来源吸收构建的新能力工作空间。',
    role: 'ai-workflow-lead',
    stacks: ['ai-workflows', 'design-systems', 'knowledge-collaboration'],
    clients: ['claude', 'codex', 'gemini'],
    clusters: ['planning', 'design', 'knowledge', 'skill-engineering'],
    promptPacks: ['planning', 'design', 'execution', 'knowledge', 'handoff'],
    tools: [
      { id: 'github-mcp', title: 'GitHub MCP', type: 'mcp', status: 'ready' },
      { id: 'figma-mcp', title: 'Figma MCP', type: 'mcp', status: 'optional' },
      { id: 'notion-mcp', title: 'Notion MCP', type: 'mcp', status: 'optional' },
    ],
    status: 'draft',
  },
];

export const emptySnapshot: ShellSnapshot = {
  repoRoot: '',
  clientCount: 3,
  roleCount: primaryRoles.length,
  stackCount: primaryStacks.length,
  skillCount: 110,
  primarySkillCount: 36,
};
