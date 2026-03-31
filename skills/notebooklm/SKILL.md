---
name: notebooklm
description: Query Google NotebookLM notebooks for source-grounded answers, manage notebook entries, and work with persistent document-backed research flows.
---

# NotebookLM Research Assistant

Use this skill when the user wants to work against NotebookLM rather than open web search.

## When To Use

- The user mentions NotebookLM explicitly
- The user shares a NotebookLM URL
- The task is to query a notebook, add a notebook, or manage a notebook library
- The user wants document-grounded answers with citations rather than general web answers

## Core Workflow

1. Check auth state first
2. If not authenticated, guide the user through a visible browser login flow
3. List or activate the correct notebook
4. Ask the notebook a concrete question
5. Return notebook-grounded results and note which notebook was used

## Command Pattern

Always use the upstream wrapper pattern:

```bash
python scripts/run.py auth_manager.py status
python scripts/run.py notebook_manager.py list
python scripts/run.py ask_question.py --question "..."
```

Do not call the individual scripts directly without the wrapper.

## Practical Guidance

- If the user gives a notebook URL but no metadata, inspect the notebook first, then name and describe it from its actual contents.
- Prefer notebook-specific answers over generic recall when a notebook is available.
- If the notebook inventory is ambiguous, list notebooks before asking questions.
- If the user asks to add a notebook, capture name, description, and topics rather than inventing vague placeholders.

## Expected Outputs

- Active notebook chosen or confirmed
- Question asked against NotebookLM
- Answer returned as notebook-grounded output
- Any auth or setup blockers called out clearly
