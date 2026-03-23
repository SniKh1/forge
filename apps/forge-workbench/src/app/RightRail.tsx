import type { ShellSnapshot } from '../domain/model';
import { currentMilestones, demoWorkspaces, legacyCapabilities, primaryRoles, primaryStacks } from '../domain/seed';
import { summarizeLegacyCapabilities, summarizeTools, summarizeWorkspaceStatus } from '../domain/selectors';

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
  const capabilitySummary = summarizeLegacyCapabilities(legacyCapabilities);

  return (
    <>
      <div className="wb-panel rounded-[24px] px-4 py-4">
        <div className="wb-kicker">右侧摘要</div>
        <div className="mt-4 wb-grid">
          <MetricCard title="工作空间" value={String(workspaceSummary.total)} note={`稳定 ${workspaceSummary.healthy} / 需推进 ${workspaceSummary.attention} / 起草中 ${workspaceSummary.draft}`} />
          <MetricCard title="主角色" value={String(primaryRoles.length)} note="用负责人视角重构前台展示。" />
          <MetricCard title="主 Stack" value={String(primaryStacks.length)} note="只保留高层能力域，不再平铺所有细分条目。" />
          <MetricCard title="Skill 总量" value={String(snapshot.skillCount)} note={`当前主干能力 ${snapshot.primarySkillCount}`} />
        </div>
      </div>

      <div className="mt-4 wb-panel rounded-[24px] px-4 py-4">
        <div className="wb-kicker">迁移进度</div>
        <div className="mt-4 space-y-3 text-sm leading-6 text-[#544d45]">
          <div>已映射：{capabilitySummary.mapped}</div>
          <div>迁移中：{capabilitySummary.inProgress}</div>
          <div>待接入：{capabilitySummary.planned}</div>
          <div>工具依赖：{toolSummary.total} 个，其中 ready {toolSummary.ready} / optional {toolSummary.optional} / missing {toolSummary.missing}</div>
        </div>
      </div>

      <div className="mt-4 wb-panel rounded-[24px] px-4 py-4">
        <div className="wb-kicker">本轮里程碑</div>
        <div className="mt-4 space-y-3 text-sm leading-6 text-[#544d45]">
          {currentMilestones.map((milestone) => (
            <div key={milestone} className="rounded-[18px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-3">
              {milestone}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
