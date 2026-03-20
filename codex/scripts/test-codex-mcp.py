#!/usr/bin/env python3

import json
import subprocess


def main():
    names = ["sequential-thinking", "context7", "memory", "fetch", "playwright", "deepwiki", "exa", "pencil"]

    for name in names:
        proc = subprocess.run(
            ["codex", "mcp", "get", name, "--json"],
            capture_output=True,
            text=True,
        )
        if proc.returncode != 0:
            print(f"[SKIP] {name}: not configured")
            continue

        try:
            payload = json.loads(proc.stdout or "{}")
        except json.JSONDecodeError:
            payload = {}

        if payload:
            print(f"[PASS] {name}")
        else:
            print(f"[FAIL] {name}: empty response")


if __name__ == "__main__":
    main()
