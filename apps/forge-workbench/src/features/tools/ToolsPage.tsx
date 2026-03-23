import { demoWorkspaces, legacyCapabilities } from '../../domain/seed';
import { formatCapabilityStatus } from '../../domain/selectors';

export function ToolsPage() {
  const flattenedTools = demoWorkspaces.flatMap((workspace) =>
    workspace.tools.map((tool) => ({
      ...tool,
      workspace: workspace.name,
    })),
  );

  const toolCapabilities = legacyCapabilities.filter((item) => item.targetSection === 'tools');

  return (
    <div className="wb-grid two">
      <div className="wb-panel rounded-[28px] px-5 py-5">
        <div className="wb-kicker">工具层定位</div>
        <div className="mt-3 text-lg font-semibold">MCP 是依赖层，不再是产品首页的主角。</div>
        <div className="mt-3 text-sm leading-7 text-[#5f5953]">
          新工作台把工具放在角色、Prompt 和 Skill 之后。用户先在工作空间里定义目标和上下文，再根据任务阶段选择需要调用的工具。
        </div>
        <div className="mt-4 space-y-3">
          {flattenedTools.map((tool) => (
            <div key={`${tool.workspace}-${tool.id}`} className="rounded-[20px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold">{tool.title}</div>
                <span className="wb-chip">{tool.status}</span>
              </div>
              <div className="mt-2 text-sm text-[#5f5953]">{tool.summary}</div>
              <div className="mt-2 text-xs text-[#8a8177]">所在工作空间：{tool.workspace}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="wb-panel rounded-[28px] px-5 py-5">
        <div className="wb-kicker">迁移中的工具能力</div>
        <div className="mt-4 space-y-3">
          {toolCapabilities.map((capability) => (
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
