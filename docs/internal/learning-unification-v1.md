# Forge Learning Unification v1

**Updated**: 2026-03-12

## Goal

把 Forge learning 统一成一套体系，让 `self-improving-agent`、hooks、project memory、instincts、learned skills 都写入同一个 memory model，而不是并行存在多个 silo。

## Canonical Memory Targets

- `project memory`
  - 项目事实、约束、决策、长期上下文
- `problem-solution memory`
  - 问题 -> 根因 -> chosen fix -> verification
- `instincts`
  - 重复出现的 workflow behavior 和 action pattern
- `learned skills / evolved outputs`
  - 经多次验证后升级出的抽象能力

## Canonical Schema

机器可读真值：
- `core/problem-solution-schema.json`
- `core/learning-promotion-rules.json`

默认 durable record 位置：
- Claude: `~/.claude/projects/<workspace-slug>/memory/problem-solutions/`
- Codex: `~/.codex/projects/<workspace-slug>/memory/problem-solutions/`
- Gemini: `~/.gemini/projects/<workspace-slug>/memory/problem-solutions/`

每条记录应至少包含：
- 便于人工复核的 Markdown summary
- 便于脚本判断与 promotion 的 JSON sidecar

## Current Hook / Script Flow

### Claude
- `observe.js`
  - 捕获 tool start / completion observation
- `auto-learn.js`
  - 把重复 workflow pattern 抽成 instincts
- `evaluate-session.js`
  - 判断当前 session 是否值得进入 learning review
- `problem-solution-memory.js`
  - 在 problem-solution memory 下创建 durable scaffold
- `promotion-suggestion.js`
  - 刷新 scaffold review queue
  - 对 reviewed records 生成 Markdown + JSON promotion suggestion

### Codex
- `scripts/codex-learning/codex-learning.js ensure`
  - 确保 memory、instincts、learned outputs 和 problem-solution 目录存在
- `scripts/codex-learning/codex-learning.js record`
  - 手动创建 canonical problem-solution record
- `scripts/codex-learning/codex-learning.js suggest`
  - 审阅已有 problem-solution 记录并给出 promotion suggestion

## Promotion Logic

- 一次性但有长期价值的 fix:
  - 留在 `problem-solution memory`
- 重复行为:
  - 升到 `instinct`
- 可跨任务复用的实现模式:
  - 升到 `learned skill`
- 明显是角色默认行为变化:
  - 提议 `role-pack` update
- 明显是 stack 默认规则变化:
  - 提议 `stack-pack` update

## Current Status

已经实现：
- shared schema file
- durable problem-solution markdown + json scaffold
- transcript-aware heuristic extraction v2 for `problem` / `rootCause` / `chosenFix` / `verification`
- empty transcript detection（例如只有 `file-history-snapshot` 的 transcript 会显式标记为 `heuristic-v2-empty`）
- Codex manual record command
- Codex promotion suggestion command（Markdown + JSON）
- role / stack update proposal generation（Markdown + JSON 草案）
- role / stack patch draft generation v1（为 pack 文档生成更接近可 merge 的 section insertion 片段）
- file-aware patch hint（能识别目标 pack 文件中的真实 section 变体，并给出更贴近现状的插入提示）
- semantic-aware patch draft（为 `Default Skills / Preferred Skills / Collaboration Contract` 等 section 补充更贴近具体 role-pack / stack-pack 的用途说明与协同语义）
- Claude hooks-driven scaffold creation
- Claude hook-driven review queue + promotion suggestion
- machine-readable promotion rules

仍待完成：
- 更高质量的 transcript semantic extraction（减少噪音、提升 root cause / fix 精度）
- automatic promotion application
- Gemini 的等价自动捕获
- 让 domain pack 也具备同等级别的专属 patch 建议能力
