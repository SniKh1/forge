import { legacyCapabilities } from '../../domain/seed';
import { formatCapabilityStatus } from '../../domain/selectors';
import { PanelCard } from '../shared/PanelCard';

export function ReleasePage() {
  const releaseCapability = legacyCapabilities.find((item) => item.targetSection === 'release');

  return (
    <div className="wb-grid two">
      <PanelCard
        kicker="Release"
        title="发布工作区"
        note="这里会承接变更摘要、发布前检查、风险面板、验证记录、回滚预案和团队广播，不再只是版本号或 changelog 的附属页面。"
      />

      <div className="wb-panel rounded-[28px] px-5 py-5">
        <div className="wb-kicker">当前发布迁移</div>
        {releaseCapability ? (
          <div className="mt-4 rounded-[20px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-base font-semibold">{releaseCapability.title}</div>
              <span className="wb-chip">{formatCapabilityStatus(releaseCapability.status)}</span>
            </div>
            <div className="mt-2 text-sm leading-6 text-[#5f5953]">{releaseCapability.summary}</div>
            <div className="mt-2 text-xs leading-5 text-[#8a8177]">下一步：{releaseCapability.nextStep}</div>
          </div>
        ) : null}

        <div className="mt-4 space-y-3 text-sm leading-6 text-[#5f5953]">
          <div>后续会把发布流程拆成负责人可操作的工作区，而不是散落在脚本、commit 和文档里的步骤。</div>
          <div>目标是让“发布前要看什么、风险在哪里、出了问题怎么回滚”都能在桌面端一眼看清。</div>
        </div>
      </div>
    </div>
  );
}
