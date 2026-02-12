#!/usr/bin/env python3
"""
inject-subagent-context.py - Pipeline Agent Context Injection Hook

PreToolUse hook that intercepts Task tool calls targeting Pipeline Agents
(implement, check, debug, research, dispatch, plan) and injects relevant
context from .trellis/tasks/<feature>/*.jsonl files.

Reads from stdin: JSON with tool_input containing subagent prompt
Writes to stdout: Modified JSON with injected context
Writes to stderr: Hook status messages
"""

import json
import sys
import os
import glob

PIPELINE_AGENTS = {"implement", "check", "debug", "research", "dispatch", "plan"}

def find_project_root():
    """Walk up from cwd to find .trellis directory."""
    path = os.getcwd()
    while path != os.path.dirname(path):
        if os.path.isdir(os.path.join(path, ".trellis")):
            return path
        path = os.path.dirname(path)
    return None

def get_active_task(project_root):
    """Find the currently active task directory."""
    tasks_dir = os.path.join(project_root, ".trellis", "tasks")
    if not os.path.isdir(tasks_dir):
        return None

    for entry in sorted(os.listdir(tasks_dir)):
        task_json = os.path.join(tasks_dir, entry, "task.json")
        if os.path.isfile(task_json):
            try:
                with open(task_json, "r", encoding="utf-8") as f:
                    task = json.load(f)
                if task.get("status") == "in_progress":
                    return os.path.join(tasks_dir, entry)
            except (json.JSONDecodeError, IOError):
                continue
    return None

def load_context_file(task_dir, agent_name):
    """Load .jsonl context file for a specific agent."""
    jsonl_path = os.path.join(task_dir, f"{agent_name}.jsonl")
    if not os.path.isfile(jsonl_path):
        return ""

    lines = []
    try:
        with open(jsonl_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        entry = json.loads(line)
                        lines.append(entry.get("content", line))
                    except json.JSONDecodeError:
                        lines.append(line)
    except IOError:
        return ""

    return "\n".join(lines)

def load_prd(task_dir):
    """Load PRD (Product Requirements Document) if exists."""
    prd_path = os.path.join(task_dir, "prd.md")
    if os.path.isfile(prd_path):
        try:
            with open(prd_path, "r", encoding="utf-8") as f:
                return f.read()
        except IOError:
            pass
    return ""

def main():
    raw = sys.stdin.read()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        print(raw)
        return

    tool_input = data.get("tool_input", {})
    subagent_type = tool_input.get("subagent_type", "")

    # Only intercept pipeline agents
    if subagent_type not in PIPELINE_AGENTS:
        print(raw)
        return

    project_root = find_project_root()
    if not project_root:
        sys.stderr.write("[Hook] No .trellis directory found, skipping context injection\n")
        print(raw)
        return

    task_dir = get_active_task(project_root)
    if not task_dir:
        sys.stderr.write("[Hook] No active task found, skipping context injection\n")
        print(raw)
        return

    task_name = os.path.basename(task_dir)
    sys.stderr.write(f"[Hook] Injecting context for {subagent_type} agent (task: {task_name})\n")

    # Build context injection
    context_parts = []

    # Always inject PRD for implement/check agents
    if subagent_type in ("implement", "check"):
        prd = load_prd(task_dir)
        if prd:
            context_parts.append(f"## PRD (Requirements)\n\n{prd}")

    # Inject agent-specific context
    agent_context = load_context_file(task_dir, subagent_type)
    if agent_context:
        context_parts.append(f"## Agent Context ({subagent_type})\n\n{agent_context}")

    if not context_parts:
        sys.stderr.write("[Hook] No context files found for this agent\n")
        print(raw)
        return

    # Prepend context to the prompt
    injected = "\n\n---\n\n".join(context_parts)
    original_prompt = tool_input.get("prompt", "")
    tool_input["prompt"] = f"<injected-context>\n{injected}\n</injected-context>\n\n{original_prompt}"

    data["tool_input"] = tool_input
    sys.stderr.write(f"[Hook] Context injected ({len(injected)} chars)\n")
    print(json.dumps(data))

if __name__ == "__main__":
    main()
