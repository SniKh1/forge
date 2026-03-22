import type { ShellSnapshot } from '../../domain/model';
import { legacyCapabilities } from '../../domain/seed';
import { formatCapabilityStatus } from '../../domain/selectors';
import { PanelCard } from '../shared/PanelCard';

export function DiagnosticsPage({ snapshot }: { snapshot: ShellSnapshot }) {
  const diagnosticCapabilities = legacyCapabilities.filter((item) => item.targetSection === 'diagnostics');

  return (
    <div className="wb-grid two">
      <PanelCard
        kicker="Runtime"
        title="运行环境"
        note={`当前仓库根目录：${snapshot.repoRoot || '尚未获取仓库路径'}。后续这里会挂接客户端健康、工具依赖、配置路径、验证日志和异常映射。`}
      />

      <div className="wb-panel rounded-[28px] px-5 py-5">
        <div className="wb-kicker">诊断迁移路线</div>
        <div className="mt-4 space-y-3">
          {diagnosticCapabilities.map((capability) => (
            <div key={capability.id} className="rounded-[20px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold">{capability.title}</div>
                <span className="wb-chip">{formatCapabilityStatus(capability.status)}</span>
              </div>
              <div className="mt-2 text-sm leading-6 text-[#5f5953]">{capability.summary}</div>
              <div className="mt-2 text-xs leading-5 text-[#8a8177]">下一步：{capability.nextStep}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
