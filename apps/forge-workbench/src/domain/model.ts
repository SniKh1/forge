export type ClientId = 'claude' | 'codex' | 'gemini';

export type WorkbenchSection =
  | 'overview'
  | 'workspaces'
  | 'roles-stacks'
  | 'skills-prompts'
  | 'tools'
  | 'diagnostics'
  | 'release'
  | 'settings';

export type PrimaryRole =
  | 'frontend-lead'
  | 'backend-lead'
  | 'ai-workflow-lead'
  | 'product-lead'
  | 'design-lead'
  | 'qa-lead'
  | 'platform-lead'
  | 'engineering-lead';

export type PrimaryStackDomain =
  | 'frontend-experience'
  | 'design-systems'
  | 'backend-systems'
  | 'data-automation'
  | 'ai-workflows'
  | 'product-delivery'
  | 'quality-testing'
  | 'security-risk'
  | 'platform-release'
  | 'knowledge-collaboration';

export type SkillCluster =
  | 'planning'
  | 'delivery'
  | 'quality'
  | 'knowledge'
  | 'design'
  | 'release-ops'
  | 'skill-engineering';

export type PromptPack =
  | 'planning'
  | 'execution'
  | 'review'
  | 'diagnostics'
  | 'design'
  | 'release'
  | 'handoff'
  | 'knowledge';

export type ToolDependency = {
  id: string;
  title: string;
  summary: string;
  type: 'mcp' | 'local' | 'service';
  status: 'ready' | 'missing' | 'optional';
};

export type WorkspaceCard = {
  id: string;
  name: string;
  summary: string;
  role: PrimaryRole;
  stacks: PrimaryStackDomain[];
  clients: ClientId[];
  clusters: SkillCluster[];
  promptPacks: PromptPack[];
  tools: ToolDependency[];
  status: 'healthy' | 'attention' | 'draft';
  focus: string;
};

export type LegacyCapability = {
  id: string;
  title: string;
  summary: string;
  source: string;
  targetSection: WorkbenchSection;
  status: 'mapped' | 'in-progress' | 'planned';
  nextStep: string;
};

export type ResearchSource = {
  id: string;
  title: string;
  summary: string;
  implication: string;
};

export type ShellSnapshot = {
  repoRoot: string;
  clientCount: number;
  roleCount: number;
  stackCount: number;
  skillCount: number;
  primarySkillCount: number;
};
