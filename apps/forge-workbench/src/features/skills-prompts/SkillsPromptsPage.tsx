import { promptPacks, skillClusters } from '../../domain/seed';

export function SkillsPromptsPage() {
  return (
    <div className="wb-grid two">
      <div className="wb-panel rounded-[28px] px-5 py-5">
        <div className="wb-kicker">Skill Clusters</div>
        <div className="mt-4 space-y-3">
          {skillClusters.map((cluster) => (
            <div key={cluster.id} className="rounded-[20px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold">{cluster.title}</div>
                <span className="wb-chip">{cluster.count}</span>
              </div>
              <div className="mt-2 text-sm text-[#5f5953]">{cluster.summary}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="wb-panel rounded-[28px] px-5 py-5">
        <div className="wb-kicker">Prompt Packs</div>
        <div className="mt-4 space-y-3">
          {promptPacks.map((pack) => (
            <div key={pack.id} className="rounded-[20px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
              <div className="text-base font-semibold">{pack.title}</div>
              <div className="mt-2 text-sm text-[#5f5953]">{pack.summary}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm leading-6 text-[#5f5953]">
          这一步的目标，是把过去“只有角色文案”的结构，拆成更可复用的 Prompt Pack 与 Skill Cluster，
          让同一组能力可以在规划、执行、评审、诊断和交接等不同阶段被调用。
        </div>
      </div>
    </div>
  );
}
