import { PanelCard } from '../shared/PanelCard';

export function ToolsPage() {
  return (
    <div className="wb-grid two">
      <PanelCard title="工具层定位" note="MCP 是工具依赖，不是产品主轴。新工作台会把工具放在技能工作流之后，由 Prompt + Skill 驱动何时调用。" />
      <PanelCard title="高价值外部能力" note="GitHub、Figma、Notion、Slack、Linear、Atlassian 等能力会作为 skill 支撑层进入新模型，而不是散乱地堆在页面上。" />
    </div>
  );
}
