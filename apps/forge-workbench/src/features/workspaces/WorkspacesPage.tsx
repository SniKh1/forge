import { demoWorkspaces, primaryRoles, primaryStacks } from '../../domain/seed';
import { formatWorkspaceStatus } from '../../domain/selectors';

export function WorkspacesPage() {
  return (
    <div className="wb-grid two">
      {demoWorkspaces.map((workspace) => {
        const role = primaryRoles.find((item) => item.id === workspace.role);
        const stackTitles = workspace.stacks
          .map((stackId) => primaryStacks.find((item) => item.id === stackId)?.title ?? stackId);

        return (
          <div key={workspace.id} className="wb-panel rounded-[28px] px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="wb-kicker">Workspace</div>
                <div className="mt-2 text-xl font-semibold">{workspace.name}</div>
              </div>
              <span className="wb-chip">{formatWorkspaceStatus(workspace.status)}</span>
            </div>

            <div className="mt-3 text-sm leading-6 text-[#5f5953]">{workspace.summary}</div>
            <div className="mt-4 rounded-[20px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4 text-sm leading-6 text-[#544d45]">
              当前焦点：{workspace.focus}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {workspace.clients.map((client) => <span key={client} className="wb-chip">{client}</span>)}
              {workspace.clusters.map((cluster) => <span key={cluster} className="wb-chip">{cluster}</span>)}
            </div>

            <div className="mt-4 space-y-2 text-sm text-[#655e57]">
              <div>主角色：{role?.title ?? workspace.role}</div>
              <div>主 Stack：{stackTitles.join(' / ')}</div>
              <div>Prompt Pack：{workspace.promptPacks.length} 个</div>
              <div>工具依赖：{workspace.tools.length} 个</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
