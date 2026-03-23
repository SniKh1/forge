import type { LegacyCapability, ToolDependency, WorkspaceCard } from './model';

export type WorkspaceStatusSummary = {
  total: number;
  healthy: number;
  attention: number;
  draft: number;
};

export type ToolDependencySummary = {
  total: number;
  ready: number;
  missing: number;
  optional: number;
};

export type CapabilityStatusSummary = {
  mapped: number;
  inProgress: number;
  planned: number;
};

export function summarizeWorkspaceStatus(workspaces: WorkspaceCard[]): WorkspaceStatusSummary {
  return workspaces.reduce<WorkspaceStatusSummary>(
    (summary, workspace) => {
      summary.total += 1;
      summary[workspace.status] += 1;
      return summary;
    },
    { total: 0, healthy: 0, attention: 0, draft: 0 },
  );
}

export function summarizeTools(workspaces: WorkspaceCard[]): ToolDependencySummary {
  const tools = workspaces.flatMap((workspace) => workspace.tools);
  return tools.reduce<ToolDependencySummary>(
    (summary, tool: ToolDependency) => {
      summary.total += 1;
      summary[tool.status] += 1;
      return summary;
    },
    { total: 0, ready: 0, missing: 0, optional: 0 },
  );
}

export function summarizeLegacyCapabilities(capabilities: LegacyCapability[]): CapabilityStatusSummary {
  return capabilities.reduce<CapabilityStatusSummary>(
    (summary, capability) => {
      if (capability.status === 'mapped') summary.mapped += 1;
      if (capability.status === 'in-progress') summary.inProgress += 1;
      if (capability.status === 'planned') summary.planned += 1;
      return summary;
    },
    { mapped: 0, inProgress: 0, planned: 0 },
  );
}

export function formatWorkspaceStatus(status: WorkspaceCard['status']) {
  if (status === 'healthy') return '稳定';
  if (status === 'attention') return '需推进';
  return '起草中';
}

export function formatCapabilityStatus(status: LegacyCapability['status']) {
  if (status === 'mapped') return '已映射';
  if (status === 'in-progress') return '迁移中';
  return '待接入';
}
