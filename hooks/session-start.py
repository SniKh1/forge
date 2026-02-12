#!/usr/bin/env python3
"""
session-start.py - Session Start Context Loader

SessionStart hook that loads previous context when a new session begins.
Collects: developer identity, active tasks, recent journal entries,
git status, and project guidelines index.

Writes context summary to stderr for the agent to consume.
"""

import json
import sys
import os
import subprocess

def find_project_root():
    """Walk up from cwd to find .trellis directory."""
    path = os.getcwd()
    while path != os.path.dirname(path):
        if os.path.isdir(os.path.join(path, ".trellis")):
            return path
        path = os.path.dirname(path)
    return None

def get_developer(project_root):
    """Read developer identity."""
    dev_file = os.path.join(project_root, ".trellis", ".developer")
    if os.path.isfile(dev_file):
        try:
            with open(dev_file, "r", encoding="utf-8") as f:
                return f.read().strip()
        except IOError:
            pass
    return None

def get_active_tasks(project_root):
    """List active tasks."""
    tasks_dir = os.path.join(project_root, ".trellis", "tasks")
    if not os.path.isdir(tasks_dir):
        return []

    tasks = []
    for entry in sorted(os.listdir(tasks_dir)):
        if entry == "archive":
            continue
        task_json = os.path.join(tasks_dir, entry, "task.json")
        if os.path.isfile(task_json):
            try:
                with open(task_json, "r", encoding="utf-8") as f:
                    task = json.load(f)
                tasks.append({
                    "name": entry,
                    "title": task.get("title", entry),
                    "status": task.get("status", "unknown")
                })
            except (json.JSONDecodeError, IOError):
                tasks.append({"name": entry, "title": entry, "status": "unknown"})
    return tasks

def get_recent_journal(project_root, developer):
    """Get last few lines from most recent journal."""
    if not developer:
        return None

    workspace_dir = os.path.join(project_root, ".trellis", "workspace", developer)
    if not os.path.isdir(workspace_dir):
        return None

    # Find latest journal file
    journals = sorted(
        [f for f in os.listdir(workspace_dir) if f.startswith("journal-")],
        reverse=True
    )
    if not journals:
        return None

    journal_path = os.path.join(workspace_dir, journals[0])
    try:
        with open(journal_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        # Return last 30 lines
        return "".join(lines[-30:]).strip()
    except IOError:
        return None

def get_git_summary():
    """Get brief git status."""
    try:
        branch = subprocess.run(
            ["git", "branch", "--show-current"],
            capture_output=True, text=True, timeout=5
        ).stdout.strip()

        log = subprocess.run(
            ["git", "log", "--oneline", "-5"],
            capture_output=True, text=True, timeout=5
        ).stdout.strip()

        status = subprocess.run(
            ["git", "status", "--short"],
            capture_output=True, text=True, timeout=5
        ).stdout.strip()

        return {"branch": branch, "recent_commits": log, "status": status or "(clean)"}
    except Exception:
        return None

def main():
    project_root = find_project_root()
    if not project_root:
        sys.stderr.write("[Session] No .trellis directory found\n")
        return

    developer = get_developer(project_root)
    tasks = get_active_tasks(project_root)
    journal = get_recent_journal(project_root, developer)
    git = get_git_summary()

    # Build context summary
    parts = ["[Session Start Context]"]

    if developer:
        parts.append(f"Developer: {developer}")

    if git:
        parts.append(f"Branch: {git['branch']}")
        parts.append(f"Git Status: {git['status']}")
        if git["recent_commits"]:
            parts.append(f"Recent Commits:\n{git['recent_commits']}")

    if tasks:
        task_lines = []
        for t in tasks:
            task_lines.append(f"  - [{t['status']}] {t['title']} ({t['name']})")
        parts.append(f"Active Tasks:\n" + "\n".join(task_lines))

    if journal:
        parts.append(f"Last Journal Entry:\n{journal}")

    parts.append(f"Project Root: {project_root}")

    sys.stderr.write("\n".join(parts) + "\n")

if __name__ == "__main__":
    main()
