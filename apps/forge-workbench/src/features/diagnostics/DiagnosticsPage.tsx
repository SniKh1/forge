import React from 'react';
import type { ClientId, DiagnosticsSnapshot, ShellSnapshot } from '../../domain/model';
import { getDiagnosticsSnapshot, isTauriRuntime, verifyClient } from '../../lib/backend';
import { legacyCapabilities } from '../../domain/seed';
import { formatCapabilityStatus } from '../../domain/selectors';

function runtimeState(ok: boolean) {
  return ok ? '可用' : '缺失';
}

function clientState(item: DiagnosticsSnapshot['clients'][number]) {
  if (item.verifyOk) return '健康';
  if (item.detected || item.configured) return '需修复';
  return '未就绪';
}

export function DiagnosticsPage({ snapshot }: { snapshot: ShellSnapshot }) {
  const [diagnostics, setDiagnostics] = React.useState<DiagnosticsSnapshot | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [runningClient, setRunningClient] = React.useState<ClientId | null>(null);

  const diagnosticCapabilities = legacyCapabilities.filter((item) => item.targetSection === 'diagnostics');

  const loadSnapshot = React.useCallback(async () => {
    setLoading(true);
    try {
      const next = await getDiagnosticsSnapshot();
      setDiagnostics(next);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSnapshot();
  }, [loadSnapshot]);

  async function handleVerify(client: ClientId) {
    setRunningClient(client);
    try {
      await verifyClient(client);
      await loadSnapshot();
    } finally {
      setRunningClient(null);
    }
  }

  return (
    <div className="wb-grid">
      <div className="wb-grid two">
        <div className="wb-panel rounded-[28px] px-5 py-5">
          <div className="wb-kicker">运行环境</div>
          <div className="mt-3 text-lg font-semibold">把旧 verify / doctor 能力接回新工作台。</div>
          <div className="mt-3 text-sm leading-7 text-[#5f5953]">
            当前仓库根目录：{diagnostics?.repoRoot || snapshot.repoRoot || '尚未获取仓库路径'}。
            这一页已经可以直接读取运行状态，并对单个客户端执行验证。
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="wb-chip">Node {runtimeState(Boolean(diagnostics?.nodeAvailable))}</span>
            <span className="wb-chip">npm {runtimeState(Boolean(diagnostics?.npmAvailable))}</span>
            <span className="wb-chip">Python {runtimeState(Boolean(diagnostics?.pythonAvailable))}</span>
            <span className="wb-chip">Git {runtimeState(Boolean(diagnostics?.gitAvailable))}</span>
            <span className="wb-chip">{isTauriRuntime() ? 'Tauri Runtime' : 'Preview Mode'}</span>
          </div>
        </div>

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

      <div className="wb-panel rounded-[28px] px-5 py-5">
        <div className="wb-kicker">客户端诊断</div>
        <div className="mt-4 space-y-3">
          {loading && <div className="text-sm text-[#655e57]">正在读取诊断状态...</div>}
          {!loading && diagnostics?.clients.map((item) => (
            <div key={item.client} className="rounded-[20px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold uppercase">{item.client}</div>
                  <div className="mt-1 text-sm text-[#5f5953]">{item.home}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="wb-chip">{clientState(item)}</span>
                  <button
                    type="button"
                    className="wb-chip"
                    disabled={runningClient === item.client}
                    onClick={() => void handleVerify(item.client)}
                  >
                    {runningClient === item.client ? '验证中...' : '重新验证'}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="wb-chip">命令 {item.commandAvailable ? '已检测' : '缺失'}</span>
                <span className="wb-chip">Home {item.homeExists ? '存在' : '不存在'}</span>
                <span className="wb-chip">配置 {item.configured ? '已配置' : '未配置'}</span>
                <span className="wb-chip">Exit {item.verifyExitCode}</span>
              </div>
              {item.stdout && (
                <pre className="mt-4 overflow-x-auto rounded-[18px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.9)] px-4 py-4 text-xs leading-6 text-[#544d45]">{item.stdout}</pre>
              )}
              {!item.stdout && item.stderr && (
                <pre className="mt-4 overflow-x-auto rounded-[18px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.9)] px-4 py-4 text-xs leading-6 text-[#544d45]">{item.stderr}</pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
