#!/usr/bin/env python3

import json
import os
import subprocess
from pathlib import Path


def main():
    settings_path = Path(os.environ.get("GEMINI_SETTINGS", os.path.expanduser("~/.gemini/settings.json")))
    data = json.loads(settings_path.read_text(encoding="utf-8"))
    servers = data.get("mcpServers", {})
    for name in ["sequential-thinking", "context7", "memory", "fetch", "playwright", "deepwiki", "exa", "pencil"]:
        if name not in servers:
            print(f"[SKIP] {name}: not configured")
            continue
        server = servers[name]
        cmd = [server["command"], *server.get("args", [])]
        env = os.environ.copy()
        env.update(server.get("env", {}))
        proc = subprocess.run(
            [
                "npx",
                "-y",
                "@modelcontextprotocol/inspector",
                "--method",
                "tools/list",
                "--cli",
                "--transport",
                "stdio",
                "--",
                *cmd,
            ],
            capture_output=True,
            text=True,
            env=env,
        )
        if proc.returncode == 0 and '"tools"' in proc.stdout:
            print(f"[PASS] {name}")
        else:
            detail = (proc.stderr or "").strip().splitlines()
            print(f"[FAIL] {name}: {(detail[0] if detail else 'tools/list failed')}")


if __name__ == "__main__":
    main()
