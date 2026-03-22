import type { ShellSnapshot } from '../../domain/model';

function MetricCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="wb-panel rounded-[22px] px-4 py-4">
      <div className="wb-kicker">{title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{value}</div>
      <div className="mt-2 text-sm text-[#655e57]">{note}</div>
    </div>
  );
}

export function OverviewPage({ snapshot }: { snapshot: ShellSnapshot }) {
  return (
    <div className="wb-grid">
      <div className="wb-grid three">
        <MetricCard title="客户端" value={String(snapshot.clientCount)} note="Claude / Codex / Gemini" />
        <MetricCard title="角色体系" value={String(snapshot.roleCount)} note="主角色已强收敛" />
        <MetricCard title="栈包体系" value={String(snapshot.stackCount)} note="主栈包能力域" />
      </div>
      <div className="wb-grid two">
        <div className="wb-panel rounded-[28px] px-5 py-5">
          <div className="wb-kicker">产品重定义</div>
          <div className="mt-3 text-lg font-semibold">Forge Desktop 不再是安装器，而是团队级 AI Workbench。</div>
          <div className="mt-3 text-sm leading-7 text-[#5f5953]">
            新项目会用工作空间作为核心对象，把客户端、角色、栈包、Prompt Pack、Skill Pack、工具依赖、诊断与发布组织到一个桌面控制台里。
          </div>
        </div>
        <div className="wb-panel rounded-[28px] px-5 py-5">
          <div className="wb-kicker">当前推进</div>
          <div className="mt-3 space-y-3 text-sm leading-7 text-[#5f5953]">
            <div>前台要强收敛，后台能力要更丰富，尤其是 Prompt + Skill 组合。</div>
            <div>MCP 继续保留，但它属于工具层和依赖层，而不是首页主角。</div>
            <div>当前仓库路径：{snapshot.repoRoot || '尚未获取仓库路径'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
