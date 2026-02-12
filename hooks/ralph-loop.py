#!/usr/bin/env python3
"""
ralph-loop.py - Check Agent Quality Control Loop

SubagentStop hook that intercepts the check agent's completion.
Runs verify commands from worktree.yaml. If any fail, blocks the agent
from stopping and requires fixes. Max 5 iterations to prevent infinite loops.

State tracked in .trellis/.ralph-state.json
"""

import json
import sys
import os
import subprocess
import time

MAX_ITERATIONS = 5
STATE_TIMEOUT_MINUTES = 30

def find_project_root():
    """Walk up from cwd to find .trellis directory."""
    path = os.getcwd()
    while path != os.path.dirname(path):
        if os.path.isdir(os.path.join(path, ".trellis")):
            return path
        path = os.path.dirname(path)
    return None

def load_state(state_path):
    """Load Ralph Loop state."""
    if not os.path.isfile(state_path):
        return {"iterations": 0, "task_id": None, "started_at": None}
    try:
        with open(state_path, "r", encoding="utf-8") as f:
            state = json.load(f)
        # Check timeout
        started = state.get("started_at")
        if started:
            elapsed = (time.time() - started) / 60
            if elapsed > STATE_TIMEOUT_MINUTES:
                sys.stderr.write(f"[Ralph] State timed out ({elapsed:.0f}min), resetting\n")
                return {"iterations": 0, "task_id": None, "started_at": None}
        return state
    except (json.JSONDecodeError, IOError):
        return {"iterations": 0, "task_id": None, "started_at": None}

def save_state(state_path, state):
    """Save Ralph Loop state."""
    os.makedirs(os.path.dirname(state_path), exist_ok=True)
    with open(state_path, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

def load_verify_commands(project_root):
    """Load verify commands from worktree.yaml."""
    yaml_path = os.path.join(project_root, ".trellis", "worktree.yaml")
    if not os.path.isfile(yaml_path):
        return []

    commands = []
    in_verify = False
    try:
        with open(yaml_path, "r", encoding="utf-8") as f:
            for line in f:
                stripped = line.strip()
                if stripped.startswith("verify:"):
                    in_verify = True
                    continue
                if in_verify:
                    if stripped.startswith("- ") and not stripped.startswith("# "):
                        cmd = stripped[2:].strip()
                        if cmd and not cmd.startswith("#"):
                            commands.append(cmd)
                    elif stripped and not stripped.startswith("#") and not stripped.startswith("-"):
                        in_verify = False
    except IOError:
        pass

    return commands

def run_verify(commands, project_root):
    """Run verify commands, return (all_passed, results)."""
    results = []
    all_passed = True

    for cmd in commands:
        try:
            result = subprocess.run(
                cmd, shell=True, cwd=project_root,
                capture_output=True, text=True, timeout=120
            )
            passed = result.returncode == 0
            results.append({
                "command": cmd,
                "passed": passed,
                "output": result.stdout[-500:] if result.stdout else "",
                "error": result.stderr[-500:] if result.stderr else ""
            })
            if not passed:
                all_passed = False
        except subprocess.TimeoutExpired:
            results.append({"command": cmd, "passed": False, "error": "Timeout (120s)"})
            all_passed = False
        except Exception as e:
            results.append({"command": cmd, "passed": False, "error": str(e)})
            all_passed = False

    return all_passed, results

def main():
    raw = sys.stdin.read()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        print(raw)
        return

    # Only intercept check agent
    tool_input = data.get("tool_input", {})
    subagent_type = tool_input.get("subagent_type", "")

    if subagent_type != "check":
        print(raw)
        return

    project_root = find_project_root()
    if not project_root:
        print(raw)
        return

    state_path = os.path.join(project_root, ".trellis", ".ralph-state.json")
    state = load_state(state_path)

    verify_commands = load_verify_commands(project_root)
    if not verify_commands:
        sys.stderr.write("[Ralph] No verify commands configured, allowing completion\n")
        # Reset state
        if os.path.isfile(state_path):
            os.remove(state_path)
        print(raw)
        return

    # Initialize state if new
    if state["started_at"] is None:
        state["started_at"] = time.time()
        state["iterations"] = 0

    state["iterations"] += 1
    save_state(state_path, state)

    iteration = state["iterations"]
    sys.stderr.write(f"[Ralph] Iteration {iteration}/{MAX_ITERATIONS}\n")

    # Safety limit
    if iteration > MAX_ITERATIONS:
        sys.stderr.write(f"[Ralph] Max iterations reached, allowing completion\n")
        if os.path.isfile(state_path):
            os.remove(state_path)
        print(raw)
        return

    # Run verification
    sys.stderr.write(f"[Ralph] Running {len(verify_commands)} verify commands...\n")
    all_passed, results = run_verify(verify_commands, project_root)

    for r in results:
        status = "PASS" if r["passed"] else "FAIL"
        sys.stderr.write(f"[Ralph] {status}: {r['command']}\n")
        if not r["passed"] and r.get("error"):
            sys.stderr.write(f"[Ralph]   Error: {r['error'][:200]}\n")

    if all_passed:
        sys.stderr.write(f"[Ralph] All checks passed! Allowing completion.\n")
        if os.path.isfile(state_path):
            os.remove(state_path)
        print(raw)
    else:
        sys.stderr.write(f"[Ralph] Checks failed. Blocking completion, requesting fixes.\n")
        # Block by outputting decision to reject
        data["_ralph_blocked"] = True
        data["_ralph_message"] = (
            f"Verification failed (iteration {iteration}/{MAX_ITERATIONS}). "
            f"Fix the issues and try again."
        )
        print(json.dumps(data))

if __name__ == "__main__":
    main()
