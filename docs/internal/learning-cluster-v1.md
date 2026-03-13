# Learning Cluster Governance v1

## Scope
这个 cluster 用来治理 Forge 当前与“学习、复盘、记忆晋级”有关的 3 个 skill：
- `self-improving-agent`
- `continuous-learning`
- `continuous-learning-v2`

目标不是删除旧能力，而是明确谁是主入口、谁是补充层、谁负责 hook/observation。

## Cluster Ownership
- primary:
  - `self-improving-agent`
- support:
  - `continuous-learning`
  - `continuous-learning-v2`

## Primary Skill: `self-improving-agent`
`self-improving-agent` 是当前 learning cluster 的主入口。

职责：
- 用更高语义密度的方式理解一次任务中的 problem、root cause、chosen fix、verification。
- 把 durable output 统一写入 Forge 现有记忆体系，而不是另起一套平行 memory tree。
- 作为“是否值得晋级为 instinct / learned skill / role-pack update / stack-pack update”的主要分析入口。

适用场景：
- 一次任务已经形成可复用经验。
- 出现了值得沉淀的问题解决模式。
- 需要把经验升级成长期资产。

## Support Skill: `continuous-learning`
`continuous-learning` 保留为 support，不再作为默认高频主路由。

职责：
- 偏向会话结束后的模式提取。
- 适合作为 legacy end-of-session extractor，补充收集 observation。
- 当主要目标是“快速从一次 session 中抽取可复用模式”，而不是做完整语义复盘时使用。

保留原因：
- 它仍然适合作为轻量级学习补充链路。
- 但不应取代 Forge 的统一 memory / promotion 体系。

## Support Skill: `continuous-learning-v2`
`continuous-learning-v2` 也保留为 support，不再作为默认用户可见学习主入口。

职责：
- 偏向 hooks + observation + instinct 候选采集。
- 适合作为行为层与 instinct 层的补充能力。
- 当重点是“自动观察工作模式”，而不是结构化总结问题解决过程时使用。

保留原因：
- 它对 hook-based observation 仍有价值。
- 但 durable output 必须回到 Forge 统一 memory targets。

## Routing Rules
默认路由：
- 遇到“学习、复盘、沉淀经验、升级模式”类请求，主 skill 使用 `self-improving-agent`。
- 只有当任务更像“session 结束后的 observation 提取”时，才调用 `continuous-learning`。
- 只有当任务更像“hook/instinct observation”时，才调用 `continuous-learning-v2`。

## Durable Output Policy
无论由哪个 support skill 触发，durable output 都应该回到 Forge 的统一路径：
- project memory
- problem-solution memory
- homunculus instincts
- learned skills / evolved outputs

不允许再把 support skill 输出当作独立真值系统。

## Next Actions
后续执行重点：
- 让 `self-improving-agent` 成为默认学习语义入口。
- 让 `continuous-learning*` 只承担 observation / support 角色。
- 逐步把 transcript -> structured problem-solution extraction 自动化。
