import { PanelCard } from '../shared/PanelCard';

export function SettingsPage() {
  return (
    <div className="wb-grid two">
      <PanelCard
        kicker="Language"
        title="默认语言策略"
        note="当前工作台以中文优先。后续可以保留英文和日文支持，但产品思路、信息架构和默认文案都先围绕中文团队场景收敛。"
      />
      <PanelCard
        kicker="Rewrite"
        title="当前重写约束"
        note="这是一次 greenfield rewrite。旧项目只作为能力参考与行为映射来源，不再作为新产品结构基础。"
      />
    </div>
  );
}
