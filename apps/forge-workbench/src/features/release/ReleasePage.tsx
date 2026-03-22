import { PanelCard } from '../shared/PanelCard';

export function ReleasePage() {
  return (
    <div className="wb-grid two">
      <PanelCard title="Release Workspace" note="后续会承接变更摘要、发布前检查、风险面板与产物状态。" />
      <PanelCard title="团队交付" note="以团队负责人视角整合 changelog、验证、回滚与广播。" />
    </div>
  );
}
