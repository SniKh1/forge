import type { ClientId, ShellSnapshot } from '../../domain/model';
import { currentMilestones, legacyCapabilities, researchSources } from '../../domain/seed';
import { formatCapabilityStatus } from '../../domain/selectors';

function MetricCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="wb-panel rounded-[22px] px-4 py-4">
      <div className="wb-kicker">{title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{value}</div>
      <div className="mt-2 text-sm text-[#655e57]">{note}</div>
    </div>
  );
}

const clientFocus: Record<ClientId, string> = {
  claude: '当前更适合作为规划、PRD、交接和任务编排视角。',
  codex: '当前更适合作为实现、修复、脚本化和代码交付视角。',
  gemini: '当前更适合作为研究、多模态材料整理和外部信息吸收视角。',
};

export function OverviewPage({ snapshot, activeClient }: { snapshot: ShellSnapshot; activeClient: ClientId }) {
  return (
    <div className="wb-grid">
      <div className="wb-grid three">
        <MetricCard title="客户端" value={String(snapshot.clientCount)} note="Claude / Codex / Gemini" />
        <MetricCard title="角色体系" value={String(snapshot.roleCount)} note="已经收敛为主角色视角。" />
        <MetricCard title="Stack 体系" value={String(snapshot.stackCount)} note="已经切换为主能力域表达。" />
      </div>

      <div className="wb-grid two">
        <div className="wb-panel rounded-[28px] px-5 py-5">
          <div className="wb-kicker">产品重定义</div>
          <div className="mt-3 text-lg font-semibold">Forge Desktop 不再只是安装器，而是团队级 AI Workbench。</div>
          <div className="mt-3 text-sm leading-7 text-[#5f5953]">
            新项目用工作空间作为核心对象，把客户端、角色、Stack、Prompt Pack、Skill Cluster、工具依赖、诊断和发布组织到同一个桌面工作台里。
          </div>
          <div className="mt-4 rounded-[20px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4 text-sm leading-6 text-[#544d45]">
            当前客户端焦点：{clientFocus[activeClient]}
          </div>
        </div>

        <div className="wb-panel rounded-[28px] px-5 py-5">
          <div className="wb-kicker">当前推进</div>
          <div className="mt-3 space-y-3 text-sm leading-7 text-[#5f5953]">
            {currentMilestones.map((milestone) => (
              <div key={milestone} className="rounded-[18px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-3">
                {milestone}
              </div>
            ))}
            <div>当前仓库路径：{snapshot.repoRoot || '尚未获取仓库路径'}</div>
          </div>
        </div>
      </div>

      <div className="wb-grid two">
        <div className="wb-panel rounded-[28px] px-5 py-5">
          <div className="wb-kicker">旧能力迁移</div>
          <div className="mt-4 space-y-3">
            {legacyCapabilities.map((capability) => (
              <div key={capability.id} className="rounded-[20px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-base font-semibold">{capability.title}</div>
                  <span className="wb-chip">{formatCapabilityStatus(capability.status)}</span>
                </div>
                <div className="mt-2 text-sm leading-6 text-[#5f5953]">{capability.summary}</div>
                <div className="mt-2 text-xs text-[#8a8177]">来源：{capability.source}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="wb-panel rounded-[28px] px-5 py-5">
          <div className="wb-kicker">外部研究来源</div>
          <div className="mt-4 space-y-3">
            {researchSources.map((source) => (
              <div key={source.id} className="rounded-[20px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
                <div className="text-base font-semibold">{source.title}</div>
                <div className="mt-2 text-sm leading-6 text-[#5f5953]">{source.summary}</div>
                <div className="mt-2 text-xs leading-5 text-[#8a8177]">设计影响：{source.implication}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
