# Learning and Memory Rules

## Goals
Forge 的学习系统同时要记住两类东西：
- 可重复的执行模式
- 明确的问题 -> 根因 -> 解决方案 -> 验证记录

## Canonical Memory Targets
- Project memory：项目事实、约束、决策、背景上下文
- Problem-solution memory：问题与解决方案的耐久记录
- Instincts：可重复工作流行为和动作模式
- Learned skills / evolved outputs：经过重复验证后抽象出来的能力资产

## Canonical Schema and Paths
- 机器可读 schema：`core/problem-solution-schema.json`
- 晋级规则：`core/learning-promotion-rules.json`
- Claude 路径：`~/.claude/projects/<workspace-slug>/memory/problem-solutions/`
- Codex 路径：`~/.codex/projects/<workspace-slug>/memory/problem-solutions/`
- Gemini 路径：`~/.gemini/projects/<workspace-slug>/memory/problem-solutions/`

每条 durable record 都应该尽量同时包含：
- 一个便于人工复核的 Markdown summary
- 一个便于脚本判断和晋级的 JSON sidecar

## Unified Learning Policy
- `self-improving-agent` 的职责是增强 Forge 记忆体系，不是另起一套平行 memory tree。
- hooks 可以自动采集 observation，但只有形成可复核结构后，才适合进入 promotion 流程。

## Problem-Solution Record Format
每条 durable record 尽量记录：
- problem
- root cause
- chosen fix
- verification evidence
- reuse tags
- upgrade target（`memory`、`instinct`、`learned-skill`、`role-pack`、`stack-pack`）

## Promotion Rules
- 一次性但有长期价值的修复 -> problem-solution memory
- 重复出现的工作流 -> instinct
- 可在多个任务或仓库复用的解决模式 -> learned skill
- 明显是角色默认行为变化 -> role-pack update
- 明显是技术栈或领域约束变化 -> stack-pack update

promotion 决策顺序，以 `core/learning-promotion-rules.json` 为准。

## Implementation Direction
- `self-improving-agent` 应统一写入 Forge memory targets。
- hook 生成的记录默认先标记为 `status = scaffold`。
- v1 阶段不做完全自动晋级，必须保留可复核证据。

## Learning Cluster Governance
- learning cluster 的正式主从治理说明见 `docs/internal/learning-cluster-v1.md`。
- 默认学习语义入口是 `self-improving-agent`；`continuous-learning*` 只作为 support。
