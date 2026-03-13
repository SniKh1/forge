# Self-Improving Agent

A universal self-improvement system that learns from skill experience and enriches Forge's shared memory model.

## Overview

这个 skill 的定位已经固定：
- 它是 Forge 的学习语义入口
- 它不再维护平行的 durable memory tree
- 它负责把经验整理到 Forge 的 canonical memory targets

## Canonical Memory Targets

```text
Forge shared targets
├── project memory
├── problem-solution memory
├── instincts
└── learned skills / evolved outputs
```

Canonical policy source:
- `rules/learning-memory.md`
- `core/problem-solution-schema.json`
- `core/learning-promotion-rules.json`

## Reasoning Model

你仍然可以用这三种 memory 视角帮助分析：
- semantic memory
- episodic memory
- working memory

但 durable output 的落点必须统一：
- semantic insight -> `learned skills / evolved outputs` 或 `project memory`
- episodic evidence -> `problem-solution memory`
- working memory -> 只作为会话内分析，必要时再转写到上面几类

## Runtime Integration

### Claude
- `scripts/hooks/problem-solution-memory.js`
- `scripts/hooks/promotion-suggestion.js`

### Codex
- `scripts/codex-learning/codex-learning.js record`
- `scripts/codex-learning/codex-learning.js suggest`

### Gemini
- 与 Forge 统一 schema 对齐，逐步补齐自动化程度

## Standard Flow

```text
experience
  -> problem-solution record
  -> review
  -> promotion suggestion
  -> memory / instinct / learned-skill / role-pack / stack-pack decision
```

## Status

当前已经完成：
- shared schema
- durable Markdown + JSON sidecar
- reviewed-record suggestion tooling
- Claude review queue / promotion suggestion hook
- Forge canonical memory alignment

仍在持续补的：
- transcript-aware extraction
- 更自动的 role/stack update proposals
