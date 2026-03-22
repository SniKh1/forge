# Forge Workbench Skill Sources v1

## Purpose

记录 Forge Workbench 新一轮 skill-first 重建时采用的外部参考来源，以及这些来源对角色、栈包、Prompt Pack、Skill Cluster 设计的直接影响。

## Source Notes

### Anthropic

- Source: https://docs.anthropic.com/en/docs/prompt-engineering
- Why it matters:
  - 强调先定义成功标准，再做 prompt engineering
  - 推荐把复杂任务拆成链式提示，而不是写成一个超长万能提示
  - 明确 role、examples、XML tags、long context 都是可以组合的结构化手段
- Design implication for Forge:
  - Prompt Pack 不能只是“角色文案”，而要拆成规划、执行、评审、诊断、交接等任务态包
  - Skill 应和 Prompt 分层，不再混成一段大 prompt
  - 需要在后续数据层补上 success criteria / eval hook 视角

- Source: https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk/
- Why it matters:
  - 工具是执行积木，不是产品主角
  - agent 价值来自任务编排、工具调用边界和可追踪执行
- Design implication for Forge:
  - MCP 保留，但下沉为工具层
  - 首页主轴继续放在 workspace、Prompt、Skill、role orchestration
  - 后续需要把“可追踪执行”和“工具调用结果”放进诊断与发布页

### OpenAI

- Source: https://platform.openai.com/docs/guides/prompting
- Why it matters:
  - 明确提示词应支持版本化、变量化、团队共享
  - 强调 prompt object、版本管理和复用
- Design implication for Forge:
  - Prompt Pack 后续应该具备版本感，而不是静态文本块
  - 角色包、任务包、handoff 包都适合做模板化

- Source: https://platform.openai.com/docs/guides/agent-builder
- Why it matters:
  - 把 agent workflow 拆成节点、 typed edge、可调试步骤
  - 强调 workflow 先于 deploy
- Design implication for Forge:
  - Workbench 的核心对象应继续是 workspace/workflow，而不是单个 provider 配置页
  - 后续 release/diagnostics 页面要支持步骤化回放与变更预览

- Source: https://platform.openai.com/docs/guides/agent-builder-safety
- Why it matters:
  - 明确多 agent / tool calling 的核心风险包括 prompt injection、数据泄露、错误调用工具
- Design implication for Forge:
  - 安全与风险必须作为主栈包保留
  - 后续要为工具依赖补“可信度、权限边界、敏感数据风险”视图

### Google Gemini

- Source: https://ai.google.dev/guide/prompt_best_practices
- Why it matters:
  - 强调 clear and specific instructions、few-shot、迭代式 prompt design
  - 对多模态输入天然友好
- Design implication for Forge:
  - Gemini 相关能力不应只是“第三个客户端”
  - 应补强研究、多模态理解、资料整合类 skill cluster

## Skill Expansion Directions

基于上面的资料，Forge Workbench 下一轮适合扩充的高价值 skill 方向：

- 规划与拆解类
  - PRD 拆解
  - 里程碑设计
  - 执行计划生成
  - 风险扫描
- 交付与实现类
  - 桌面端重构
  - 多客户端工作流编排
  - 配置迁移
  - 版本发布协同
- 质量与诊断类
  - Prompt 评测
  - Workflow 回放
  - Tool 调用审计
  - 回归验证
- 知识与协作类
  - Memory 沉淀
  - Handoff 文档
  - Team briefing
  - 规范治理
- 设计与内容类
  - 信息架构设计
  - 桌面产品交互
  - 视觉系统
  - 多语言内容维护

## Product Consequences

这些来源共同支持了当前 greenfield 方案的几个关键决策：

- Forge Desktop 继续保留三端，但产品主轴从“安装配置页”转向“团队工作台”
- Prompt + Skill 是主工作模式，MCP 是依赖层
- 角色和栈包前台强收敛，但后台 skill 能力要继续扩充
- 诊断、发布、安全、handoff 不是边角页，而是工作流闭环的一部分
