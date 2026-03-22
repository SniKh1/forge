import type { ToolDependency, WorkspaceCard } from './model';

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
