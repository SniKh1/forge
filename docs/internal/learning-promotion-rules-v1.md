# Forge Learning Promotion Rules v1

**Updated**: 2026-03-12

## Purpose

这份文档定义 Forge 应如何把学习记录从 durable memory 提升为更高价值资产。

机器可读真值来源：
- `core/learning-promotion-rules.json`

## Decision Order

当一条 reviewed problem-solution record 进入 promotion 判断时，按这个顺序评估：

1. `stack-pack`
2. `role-pack`
3. `learned-skill`
4. `instinct`
5. `memory`

这个顺序很重要，因为：
- 如果一个模式明显属于 role/stack 约束，就不应该被降级成普通 learned skill
- role / stack 的约束优先级本来就应高于局部技巧

## Promotion Heuristics

### Keep as `memory`
- 一次性但有长期参考价值的 fix
- 更适合保留项目历史
- 还没有重复到可抽象程度

### Promote to `instinct`
- 同一 workflow 至少在 3 个案例中重复出现
- 它更像稳定的操作路径，而不是完整独立 skill

### Promote to `learned-skill`
- 解决模式能跨任务或跨仓库复用
- 记录里已经包含 root cause、chosen fix、verification
- 触发条件足够清楚，能写成 skill 说明

### Promote to `role-pack`
- 行为明显是 role-specific
- 会改变某个角色的默认工作方式
- 例如：PM 的需求澄清方式、UI 的 review checklist、Release 的诊断纪律

### Promote to `stack-pack`
- 行为明显是 stack-specific
- 会改变某个 stack 的默认开发或验证方式
- 例如：Spring validation policy、frontend 浏览器验证默认值、Python async testing 规则

## Review Policy

- promotion 前必须保留 human review
- hooks 和 scripts 可以生成建议，但不能直接替你做最终晋级
- v1 阶段不允许完全自动 promotion

## Current Implementation Status

已经实现：
- canonical problem-solution schema
- durable markdown + json sidecars
- Codex manual record flow
- machine-readable promotion rules
- promotion suggestion script

仍待实现：
- transcript-aware extraction
- role / stack update proposal generator
- 更自动化但仍可审查的升级路径
