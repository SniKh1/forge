import { PanelCard } from '../shared/PanelCard';

export function SettingsPage() {
  return (
    <div className="wb-grid two">
      <PanelCard title="默认语言" note="中文优先，后续继续保留英文与日文。" />
      <PanelCard title="当前策略" note="当前是 greenfield 重写项目，旧项目仅作功能参考，不再承接旧结构。" />
    </div>
  );
}
