---
name: self-improving-agent
description: A universal self-improving agent that learns from skill experiences and enriches Forge's shared memory system. Uses semantic, episodic, and working-memory concepts as analysis tools, but durable output should land in Forge memory, problem-solution records, instincts, and learned outputs.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
metadata:
  hooks:
    before_start:
      - trigger: session-logger
        mode: auto
        context: "Start {skill_name}"
    after_complete:
      - trigger: create-pr
        mode: ask_first
        condition: skills_modified
        reason: "Submit improvements to repository"
      - trigger: session-logger
        mode: auto
        context: "Self-improvement cycle complete"
    on_error:
      - trigger: session-logger
        mode: auto
        context: "Error captured in {skill_name}"
---

# Self-Improving Agent

`self-improving-agent` 是 Forge 的统一学习入口。它不再维护一套平行的 durable memory tree，而是把学习结果写回 Forge 已经定义好的 canonical memory targets。

## 何时使用

当你遇到下面这些情况时，应使用 `self-improving-agent`：
- 一次任务里暴露出可复用的问题 -> 根因 -> 方案
- 某种 workflow 在多个任务里重复出现
- 某个角色或 stack 的默认做法应该更新
- 你想把经验沉淀成 `instinct`、`learned skill`、`role-pack` 或 `stack-pack` 更新建议

## Canonical Memory Targets

Forge 的 durable output 只认这四类目标：
- `project memory`
- `problem-solution memory`
- `instincts`
- `learned skills / evolved outputs`

canonical policy source：
- `rules/learning-memory.md`
- `core/problem-solution-schema.json`
- `core/learning-promotion-rules.json`

## 关键原则

- `self-improving-agent` 是学习语义入口，不是第二套存储系统。
- semantic / episodic / working memory 仍然可以作为分析视角使用，但**不能**再把它们当成独立 durable 目录。
- durable writes 必须落回 Forge 的 canonical targets。
- promotion 可以由 script / hook 生成建议，但最终仍保留 human review。

## Reasoning Model vs Durable Storage

可以继续用三种 memory 视角来分析问题，但它们和实际存储目标的映射必须固定：

| Reasoning lens | 用途 | Durable target |
|---|---|---|
| semantic memory | 提炼抽象规律、长期原则 | `learned skills / evolved outputs` 或 `project memory` |
| episodic memory | 记录具体案例和发生过什么 | `problem-solution memory` |
| working memory | 当前会话临时思考和上下文 | 不单独做 durable tree；只在需要时转写到上面三类 |

结论：
- 允许用 semantic / episodic / working 的语言帮助分析
- 不允许再新增 `memory/semantic-*`、`memory/episodic/*`、`memory/working/*` 这类独立 durable source of truth

## Standard Flow

```text
Task or session finishes
  -> capture problem-solution scaffold
  -> review / fill rootCause, chosenFix, verification
  -> generate promotion suggestion
  -> decide target by promotion rules
  -> write to Forge canonical targets
```

## Expected Artifacts

每次学习至少尽量留下这两类文件：
- 一个 Markdown summary，方便人工复核
- 一个 JSON sidecar，方便脚本判断与 promotion

推荐字段：
- `problem`
- `rootCause`
- `chosenFix`
- `verification`
- `reuseTags`
- `upgradeTarget`
- `candidateSkillIds`
- `candidateRolePacks`
- `candidateStackPacks`

## Runtime Integration

### Claude
- `scripts/hooks/problem-solution-memory.js`
  - 在 `problem-solution memory` 下生成 scaffold
- `scripts/hooks/promotion-suggestion.js`
  - 刷新 review queue
  - 对 reviewed records 生成 promotion suggestions

### Codex
- `scripts/codex-learning/codex-learning.js record`
  - 写 reviewed record
- `scripts/codex-learning/codex-learning.js suggest`
  - 读取 reviewed records 并输出 Markdown + JSON suggestion report

### Gemini
- 采用与 Forge 统一 schema 对齐的 problem-solution / promotion 结构
- 当前自动化程度低于 Claude / Codex，但 canonical targets 一致

## Promotion Order

promotion 顺序固定为：
1. `stack-pack`
2. `role-pack`
3. `learned-skill`
4. `instinct`
5. `memory`

如果一个模式明显会改变默认技术约束或角色工作方式，就不应该只停留在普通 memory。

## Manual Cues

当用户表达以下意图时，应显式进入这条学习链：
- “总结这次经验”
- “把这次方案沉淀下来”
- “看看能不能升级成 skill / instinct”
- “分析这次问题的根因和可复用做法”

## Good Output Example

```yaml
problem: Form submission succeeds but data does not refresh
rootCause: onRefresh callback was passed but implementation was empty
chosenFix: replace placeholder callback with real refetch logic
verification:
  - user flow re-run passed
  - data updated after submit
reuseTags:
  - callback-verification
  - post-submit-refresh
upgradeTarget: stack-pack
candidateSkillIds:
  - systematic-debugging
candidateRolePacks:
  - developer
candidateStackPacks:
  - frontend
```

上面的记录应该先进入 `problem-solution memory`，再由 promotion rules 判断是否值得升级到 `stack-pack` 或 `instinct`。

## What Not To Do

- 不要再创建平行 durable memory 目录作为主真值
- 不要把 working memory 直接当长期记忆保存
- 不要跳过 `verification`
- 不要在没有 reviewed evidence 时直接 promotion
- 不要让 `self-improving-agent` 和 Forge memory 体系双轨运行
