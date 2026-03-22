import { demoWorkspaces } from '../../domain/seed';

export function WorkspacesPage() {
  return (
    <div className="wb-grid two">
      {demoWorkspaces.map((workspace) => (
        <div key={workspace.id} className="wb-panel rounded-[28px] px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="wb-kicker">Workspace</div>
              <div className="mt-2 text-xl font-semibold">{workspace.name}</div>
            </div>
            <span className="wb-chip">{workspace.status === 'healthy' ? '健康' : workspace.status === 'attention' ? '需关注' : '草稿'}</span>
          </div>
          <div className="mt-3 text-sm leading-6 text-[#5f5953]">{workspace.summary}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {workspace.clients.map((client) => <span key={client} className="wb-chip">{client}</span>)}
            {workspace.clusters.map((cluster) => <span key={cluster} className="wb-chip">{cluster}</span>)}
          </div>
          <div className="mt-4 text-sm text-[#655e57]">
            角色：{workspace.role} · Prompt 包：{workspace.promptPacks.length} · 工具依赖：{workspace.tools.length}
          </div>
        </div>
      ))}
    </div>
  );
}
