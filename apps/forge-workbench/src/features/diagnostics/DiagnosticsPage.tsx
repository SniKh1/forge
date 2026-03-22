import type { ShellSnapshot } from '../../domain/model';
import { PanelCard } from '../shared/PanelCard';

export function DiagnosticsPage({ snapshot }: { snapshot: ShellSnapshot }) {
  return (
    <div className="wb-grid two">
      <PanelCard title="运行环境" note={snapshot.repoRoot || '尚未获取仓库根目录'} />
      <PanelCard title="诊断目标" note="后续这里会接入客户端健康、工具依赖、配置路径、验证日志与异常映射。" />
    </div>
  );
}
