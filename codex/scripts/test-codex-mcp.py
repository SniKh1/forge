#!/usr/bin/env python3

import os
import subprocess
import sys
import tomllib


def main():
    config_path = os.environ.get("CODEX_CONFIG", os.path.expanduser("~/.codex/config.toml"))
    with open(config_path, "rb") as fh:
        data = tomllib.load(fh)

    servers = data.get("mcp_servers", {})

    for name in ["sequential-thinking", "context7", "memory", "fetch", "playwright", "deepwiki", "exa", "pencil"]:
        if name not in servers:
            print(f"[SKIP] {name}: not configured")
            continue

        server = servers[name]
        cmd = [server["command"], *server.get("args", [])]
        env = os.environ.copy()
        env.update(server.get("env", {}))

        if name == "pencil" and not os.path.exists(server["command"]):
            print(f"[SKIP] {name}: app binary missing")
            continue

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
            stderr = (proc.stderr or "").strip().splitlines()
            detail = stderr[0] if stderr else "tools/list failed"
            print(f"[FAIL] {name}: {detail}")


if __name__ == "__main__":
    main()
