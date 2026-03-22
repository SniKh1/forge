import { promptPacks, skillClusters } from '../../domain/seed';

export function SkillsPromptsPage() {
  return (
    <div className="wb-grid two">
      <div className="wb-panel rounded-[28px] px-5 py-5">
        <div className="wb-kicker">Skill Clusters</div>
        <div className="mt-4 space-y-3">
          {skillClusters.map((cluster) => (
            <div key={cluster.id} className="flex items-center justify-between rounded-[20px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
              <div className="text-base font-semibold">{cluster.title}</div>
              <span className="wb-chip">{cluster.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="wb-panel rounded-[28px] px-5 py-5">
        <div className="wb-kicker">Prompt Packs</div>
        <div className="mt-4 flex flex-wrap gap-3">
          {promptPacks.map((pack) => (
            <span key={pack.id} className="wb-chip">{pack.title}</span>
          ))}
        </div>
        <div className="mt-4 text-sm leading-6 text-[#5f5953]">
          新项目会把角色 prompt、任务态 prompt 与 skill routing 分开管理，避免当前产品只有角色文案、没有完整工作模式的问题。
        </div>
      </div>
    </div>
  );
}
