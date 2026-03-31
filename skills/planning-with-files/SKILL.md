---
name: planning-with-files
description: Use persistent markdown planning files as working memory on disk for multi-step tasks, long research sessions, and resumable execution.
---

# Planning With Files

Use this skill when the task is large enough that chat context alone is not a reliable source of truth.

## When To Use

- Multi-step tasks that will take more than a few tool calls
- Research or implementation work that spans phases
- Work that may need to survive session resets or resumptions
- Tasks where findings, progress, and next actions need durable tracking

## Core Files

Create these in the project working directory:

- `task_plan.md`
- `findings.md`
- `progress.md`

## Workflow

1. Create the planning files before deep execution
2. Re-read `task_plan.md` before major decisions
3. Write discoveries to `findings.md` instead of keeping them only in chat context
4. Log progress and failures in `progress.md`
5. Update phase status whenever a phase meaningfully changes

## Rules

- Do not start complex execution without a plan file
- After a couple of browse/search/read actions, write down what matters
- Record failed approaches so the same bad path is not repeated
- Treat these files as durable execution state, not optional notes

## Good Fit

- Architecture work
- Release planning
- Long debugging sessions
- Research pipelines
- Multi-agent or multi-session handoffs
