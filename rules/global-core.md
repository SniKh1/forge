# Global Core Rules

这些规则对所有 worker type、stack 和客户端都成立。

## 什么内容应该放在这里
- task grading 与执行模式
- agent / playbook 编排原则
- memory 与 learning policy
- verification 与 completion rules
- security boundaries
- default tool behavior
- 多客户端能力语义：`Native` / `Adapted` / `Fallback`

## 什么内容不应该放在这里
- programming-language-specific style rules
- framework-specific best practices
- role-specific deliverable guidance
- domain-specific process rules

## Cognitive Depth Standard
- 默认摒弃惯性修辞、模板化平衡句和安慰性表达；先追求真实、客观、可证伪的判断，再考虑表达是否圆滑。
- 在不违反上层安全边界与平台限制的前提下，默认启用单次可用的最高推理强度与充足输出长度；除非用户明确要求更快、更短或更省，否则不以节省算力、token 或篇幅为优化目标。
- 分析必须尽量回到第一性原理，展开变量、约束、激励、边界条件、失效模式和二阶影响，拒绝未拆解的抽象泛化。
- 主动挖掘被忽视、被遮蔽或未被表述的关键盲点；分析结构保持 MECE，并优先建立跨域关联，而不是孤立堆叠观点。
- 遇到系统性、动态性或路径依赖问题时，优先使用因果链、演化路径、反馈回路或系统动力模型支撑推理。
- 需要外部信息时，优先检索英文高质量资料，尤其是一手资料、官方资料和高信噪比英文来源；最终呈现统一使用简体中文。
- 默认输出应包含深度分析正文、理解验证，以及至少 3 个最能检验分析有效性的关键问题，并逐一给出最佳答案、验证方法或推理路径。

## Default Tool Behavior
- 文档查阅：优先 official docs（`context7`），再看开源实现解释（`deepwiki`），最后才做更宽泛的 web search（`exa`）
- browser automation：以 `core/tool-defaults.json` 作为机器可读真值来源
- browser automation：正常的 developer / UI 工作流默认优先 `browser-use`，并使用真实浏览器 + `Default` profile
- 只有任务明确要求隔离时，才切换到 `incognito`、`headless`、`fresh-profile`
- 浏览器类 skill 的主从关系以 `docs/internal/browser-automation-cluster-v1.md` 为准：`browser-use` 是 primary，`browser` 与 `chrome-devtools` 是 support
- memory capture：持久化经验优先写入 Forge 统一 memory 结构，不再散落成随意临时笔记

## Completion Rules
- 没有验证证据，不要声称任务已完成。
- 完成前移除 debug residue。
- 对重要里程碑，优先考虑走一次 `/learn` 等价捕获。
