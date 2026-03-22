import type {
  ClientId,
  LegacyCapability,
  PrimaryRole,
  PrimaryStackDomain,
  PromptPack,
  ResearchSource,
  ShellSnapshot,
  SkillCluster,
  WorkspaceCard,
} from './model';

export const primaryRoles: Array<{ id: PrimaryRole; title: string; summary: string }> = [
  { id: 'frontend-lead', title: '前端负责人', summary: '负责桌面界面、设计系统、多客户端交互质量与体验收敛。' },
  { id: 'backend-lead', title: '后端负责人', summary: '负责服务边界、配置编排、数据契约与系统稳定性。' },
  { id: 'ai-workflow-lead', title: 'AI 工作流负责人', summary: '负责 Prompt、Skill、Agent 编排与自动化执行链路。' },
  { id: 'product-lead', title: '产品负责人', summary: '负责需求拆解、路线规划、交付标准与文档沉淀。' },
  { id: 'design-lead', title: '设计负责人', summary: '负责界面语言、视觉一致性、信息层级与交互策略。' },
  { id: 'qa-lead', title: '质量负责人', summary: '负责测试策略、回归验证、诊断证据与异常收敛。' },
  { id: 'platform-lead', title: '平台负责人', summary: '负责运行环境、基础设施、发布流程与桌面端兼容性。' },
  { id: 'engineering-lead', title: '工程负责人', summary: '负责跨角色协同、架构治理、能力编组与执行闭环。' },
];

export const primaryStacks: Array<{ id: PrimaryStackDomain; title: string; summary: string }> = [
  { id: 'frontend-experience', title: '前端体验', summary: '覆盖 Web、Desktop 与多端交互实现。' },
  { id: 'design-systems', title: '设计系统', summary: '统一组件、Token、状态规范与设计落地。' },
  { id: 'backend-systems', title: '后端系统', summary: '聚焦服务、接口、认证、集成与数据边界。' },
  { id: 'data-automation', title: '数据与自动化', summary: '组织数据流、任务流、脚本链路与自动化编排。' },
  { id: 'ai-workflows', title: 'AI 工作流', summary: '强调 Prompt、Skill、Agent 与 Tool 的协作模式。' },
  { id: 'product-delivery', title: '产品交付', summary: '管理需求、路线图、迭代、协作与交付对齐。' },
  { id: 'quality-testing', title: '质量测试', summary: '建立测试、验证、诊断、证据与回归治理。' },
  { id: 'security-risk', title: '安全与风险', summary: '承接安全审查、边界建模、权限控制与风险识别。' },
  { id: 'platform-release', title: '平台发布', summary: '管理环境、构建、发布、回滚与运行维护。' },
  { id: 'knowledge-collaboration', title: '知识协作', summary: '沉淀团队记忆、规范、沟通与操作手册。' },
];

export const skillClusters: Array<{ id: SkillCluster; title: string; count: number; summary: string }> = [
  { id: 'planning', title: '规划', count: 18, summary: '拆需求、定范围、列风险、拉里程碑。' },
  { id: 'delivery', title: '交付', count: 21, summary: '写代码、做迁移、补脚本、完成交付动作。' },
  { id: 'quality', title: '质量', count: 16, summary: '跑验证、做回归、给诊断证据与质量判断。' },
  { id: 'knowledge', title: '知识', count: 15, summary: '沉淀记忆、交接信息与团队背景上下文。' },
  { id: 'design', title: '设计', count: 14, summary: '处理信息架构、交互和视觉表达。' },
  { id: 'release-ops', title: '发布运维', count: 12, summary: '承接构建、发布、环境和运行状态。' },
  { id: 'skill-engineering', title: 'Skill 工程', count: 14, summary: '组织技能包、提示词包与能力治理。' },
];

export const promptPacks: Array<{ id: PromptPack; title: string; summary: string }> = [
  { id: 'planning', title: 'Planning Pack', summary: '用于目标定义、方案规划与里程碑拆解。' },
  { id: 'execution', title: 'Execution Pack', summary: '用于实现、修复、迁移与推进执行。' },
  { id: 'review', title: 'Review Pack', summary: '用于代码审查、方案复核与风险识别。' },
  { id: 'diagnostics', title: 'Diagnostics Pack', summary: '用于定位运行异常、依赖问题和环境偏差。' },
  { id: 'design', title: 'Design Pack', summary: '用于界面、结构、内容与交互策略。' },
  { id: 'release', title: 'Release Pack', summary: '用于发布准备、风险核对与交付广播。' },
  { id: 'handoff', title: 'Handoff Pack', summary: '用于交接、说明和团队同步。' },
  { id: 'knowledge', title: 'Knowledge Pack', summary: '用于知识沉淀、规范维护与团队记忆。' },
];

export const clients: Array<{ id: ClientId; title: string; summary: string }> = [
  { id: 'claude', title: 'Claude', summary: '偏重规划、写作、产品梳理与团队协作流程。' },
  { id: 'codex', title: 'Codex', summary: '偏重编码、执行、修复、自动化与开发交付。' },
  { id: 'gemini', title: 'Gemini', summary: '偏重研究、多模态理解、资料吸收与外部信息连接。' },
];

export const demoWorkspaces: WorkspaceCard[] = [
  {
    id: 'team-workbench',
    name: '团队工作台',
    summary: '面向工程负责人和小团队的主工作空间，统一三端客户端、角色、Stack 与 Skill 工作流。',
    role: 'engineering-lead',
    stacks: ['ai-workflows', 'platform-release', 'knowledge-collaboration'],
    clients: ['claude', 'codex', 'gemini'],
    clusters: ['planning', 'delivery', 'quality', 'knowledge'],
    promptPacks: ['planning', 'execution', 'review', 'diagnostics', 'release'],
    tools: [
      { id: 'github-mcp', title: 'GitHub MCP', summary: '连接仓库、PR、Issue 与交付历史。', type: 'mcp', status: 'ready' },
      { id: 'notion-mcp', title: 'Notion MCP', summary: '承接方案文档、团队说明与沉淀信息。', type: 'mcp', status: 'optional' },
      { id: 'browser-use', title: 'Browser Use', summary: '用于浏览器验证、抓取与流程辅助。', type: 'local', status: 'ready' },
    ],
    status: 'healthy',
    focus: '把多客户端协作变成一个统一、可执行、可交接的工作流。',
  },
  {
    id: 'delivery-hub',
    name: '交付中枢',
    summary: '面向版本推进、评审、验证与发布治理的集中工作流，强调负责人视角的交付闭环。',
    role: 'platform-lead',
    stacks: ['product-delivery', 'quality-testing', 'platform-release'],
    clients: ['claude', 'codex'],
    clusters: ['planning', 'quality', 'release-ops'],
    promptPacks: ['planning', 'review', 'diagnostics', 'release', 'handoff'],
    tools: [
      { id: 'slack-mcp', title: 'Slack MCP', summary: '连接团队广播、风险同步与发布沟通。', type: 'mcp', status: 'missing' },
      { id: 'linear-mcp', title: 'Linear MCP', summary: '对齐交付项、缺陷、状态推进与责任归属。', type: 'mcp', status: 'optional' },
    ],
    status: 'attention',
    focus: '把 changelog、验证、回滚预案和发布协同放到同一个工作台。',
  },
  {
    id: 'skill-factory',
    name: '能力工坊',
    summary: '围绕 Prompt、Skill、角色包、知识沉淀与外部来源吸收构建新的能力生产线。',
    role: 'ai-workflow-lead',
    stacks: ['ai-workflows', 'design-systems', 'knowledge-collaboration'],
    clients: ['claude', 'codex', 'gemini'],
    clusters: ['planning', 'design', 'knowledge', 'skill-engineering'],
    promptPacks: ['planning', 'design', 'execution', 'knowledge', 'handoff'],
    tools: [
      { id: 'github-mcp', title: 'GitHub MCP', summary: '追踪 skill 代码、文档和评审上下文。', type: 'mcp', status: 'ready' },
      { id: 'figma-mcp', title: 'Figma MCP', summary: '承接视觉系统、交互稿与工作台界面设计。', type: 'mcp', status: 'optional' },
      { id: 'notion-mcp', title: 'Notion MCP', summary: '沉淀研究资料、操作准则和能力目录。', type: 'mcp', status: 'optional' },
    ],
    status: 'draft',
    focus: '把 Prompt + Skill 从零散文档变成产品能力层。',
  },
];

export const legacyCapabilities: LegacyCapability[] = [
  {
    id: 'install',
    title: '安装与初始化',
    summary: '旧桌面端负责客户端配置、规则包与基础组件安装。',
    source: 'apps/forge-desktop 的 install / bootstrap 流程',
    targetSection: 'workspaces',
    status: 'mapped',
    nextStep: '把安装结果映射成工作空间初始化状态，而不是单独的安装页。',
  },
  {
    id: 'repair',
    title: '修复与补救',
    summary: '旧项目对客户端配置、MCP 注册和缺失依赖提供 repair 操作。',
    source: 'apps/forge-desktop 的 repair 流程',
    targetSection: 'diagnostics',
    status: 'mapped',
    nextStep: '将 repair 操作接入诊断结果卡片，使每类异常有明确恢复动作。',
  },
  {
    id: 'verify',
    title: '验证与体检',
    summary: '旧项目会做客户端检测、路径核对和基础可用性检查。',
    source: 'apps/forge-desktop 的 verify / doctor 流程',
    targetSection: 'diagnostics',
    status: 'in-progress',
    nextStep: '把 doctor 报告转成工作台可读的诊断摘要和证据面板。',
  },
  {
    id: 'external-discovery',
    title: '外部 MCP / Skill 发现',
    summary: '旧桌面端已经具备搜索与安装外部能力源的基础流程。',
    source: 'apps/forge-desktop 的 external search / install 流程',
    targetSection: 'tools',
    status: 'in-progress',
    nextStep: '把外部能力从“工具列表”提升为按角色和工作流推荐的能力目录。',
  },
  {
    id: 'release',
    title: '发布与交付协同',
    summary: '旧项目已经开始承接 changelog、构建和发布相关流程。',
    source: 'release: prepare v0.4.8 native client runtime cut',
    targetSection: 'release',
    status: 'planned',
    nextStep: '把发布前检查、风险摘要、验证记录和广播动作整合成发布工作区。',
  },
];

export const researchSources: ResearchSource[] = [
  {
    id: 'anthropic',
    title: 'Anthropic Prompt / Agent Guidance',
    summary: '强调先定义成功标准，再用链式任务组织 prompt engineering。',
    implication: 'Prompt Pack 不能只是角色文案，需要拆成规划、执行、评审、诊断、交接等任务包。',
  },
  {
    id: 'openai',
    title: 'OpenAI Agent Workflow / Safety',
    summary: '强调 workflow、typed edges、可调试步骤和 tool safety。',
    implication: 'Workbench 的核心对象应继续围绕 workspace 和 workflow，而不是 provider 配置页。',
  },
  {
    id: 'gemini',
    title: 'Google Gemini Prompt Best Practices',
    summary: '强调 clear instructions、多模态上下文与材料整合。',
    implication: 'Gemini 在新工作台里不该只是第三个客户端，而是研究和资料整合能力入口。',
  },
];

export const currentMilestones = [
  '让 apps/forge-workbench 成为独立、可构建的桌面工作台壳层。',
  '用角色、Stack、Prompt、Skill 重写产品信息架构。',
  '开始把旧 forge-desktop 能力按工作流映射回新工作台。',
  '为后续诊断、发布和工具接线留出稳定入口。',
];

export const emptySnapshot: ShellSnapshot = {
  repoRoot: '',
  clientCount: 3,
  roleCount: primaryRoles.length,
  stackCount: primaryStacks.length,
  skillCount: 110,
  primarySkillCount: 36,
};
