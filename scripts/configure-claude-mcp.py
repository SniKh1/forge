#!/usr/bin/env python3

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from forge_core import dump_json, ensure_uvx, resolve_servers  # noqa: E402


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--claude-home", default=os.path.expanduser("~/.claude"))
    parser.add_argument("--exa-key", default=os.environ.get("FORGE_EXA_KEY", ""))
    parser.add_argument("--install-uv", action="store_true")
    parser.add_argument("--sync-cli", action="store_true")
    parser.add_argument("--servers", default="")
    args = parser.parse_args()

    ensure_uvx(args.install_uv)

    claude_home = Path(args.claude_home).expanduser()
    claude_home.mkdir(parents=True, exist_ok=True)

    selected_servers = [item.strip() for item in args.servers.split(",") if item.strip()]
    servers = resolve_servers("claude", exa_key=args.exa_key, include_optional=True, selected_servers=selected_servers)
    payload = {"mcpServers": {}}
    for name, config in servers.items():
        item = {"command": config["command"], "args": config.get("args", [])}
        if config.get("env"):
            item["env"] = config["env"]
        payload["mcpServers"][name] = item

    dump_json(claude_home / ".mcp.json", payload)

    if args.sync_cli:
        import shutil
        if shutil.which("claude"):
            for name, config in servers.items():
                subprocess.run(["claude", "mcp", "remove", name], check=False, capture_output=True)
                cmd = ["claude", "mcp", "add", name]
                for env_key, env_value in config.get("env", {}).items():
                    cmd.extend(["-e", f"{env_key}={env_value}"])
                cmd.extend(["--", config["command"], *config.get("args", [])])
                subprocess.run(cmd, check=True)

    print(f"WROTE {claude_home / '.mcp.json'}")
    print("SERVERS " + ", ".join(sorted(servers.keys())))


if __name__ == "__main__":
    main()
