import type { ShellSnapshot } from '../domain/model';
import { demoWorkspaces, primaryRoles, primaryStacks } from '../domain/seed';
import { summarizeTools, summarizeWorkspaceStatus } from '../domain/selectors';

function MetricCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="wb-panel rounded-[22px] px-4 py-4">
      <div className="wb-kicker">{title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{value}</div>
      <div className="mt-2 text-sm text-[#655e57]">{note}</div>
    </div>
  );
}

export function RightRail({ snapshot }: { snapshot: ShellSnapshot }) {
  const workspaceSummary = summarizeWorkspaceStatus(demoWorkspaces);
  const toolSummary = summarizeTools(demoWorkspaces);

  return (
    <>
      <div className="wb-panel rounded-[24px] px-4 py-4">
        <div className="wb-kicker">右侧摘要</div>
        <div className="mt-4 wb-grid">
          <MetricCard title="工作空间" value={String(workspaceSummary.total)} note={`健康 ${workspaceSummary.healthy} / 关注 ${workspaceSummary.attention} / 草稿 ${workspaceSummary.draft}`} />
          <MetricCard title="主角色" value={String(primaryRoles.length)} note="前台强收敛的角色视图" />
          <MetricCard title="主栈包" value={String(primaryStacks.length)} note="前台展示主能力域" />
          <MetricCard title="Skill 总量" value={String(snapshot.skillCount)} note={`其中主干 ${snapshot.primarySkillCount}`} />
        </div>
      </div>

      <div className="mt-4 wb-panel rounded-[24px] px-4 py-4">
        <div className="wb-kicker">工具摘要</div>
        <div className="mt-4 space-y-3 text-sm leading-6 text-[#544d45]">
          <div>总依赖：{toolSummary.total}</div>
          <div>已就绪：{toolSummary.ready}</div>
          <div>缺失：{toolSummary.missing}</div>
          <div>可选：{toolSummary.optional}</div>
        </div>
      </div>
    </>
  );
}
