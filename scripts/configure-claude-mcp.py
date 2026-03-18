#!/usr/bin/env python3

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from forge_core import dump_json, ensure_uvx, resolve_servers  # noqa: E402


WINDOWS_NO_WINDOW = 0x08000000 if sys.platform.startswith("win") else 0


def get_claude_cmd():
    """Get the correct claude command for the current platform."""
    return "claude.cmd" if sys.platform.startswith("win") else "claude"


def run_cli(args, check=False, capture_output=False):
    kwargs = {
        "check": check,
        "text": False,
    }
    if capture_output:
        kwargs["capture_output"] = True
    if WINDOWS_NO_WINDOW:
        kwargs["creationflags"] = WINDOWS_NO_WINDOW
    result = subprocess.run(args, **kwargs)
    stdout = (result.stdout or b"").decode("utf-8", errors="replace") if capture_output else ""
    stderr = (result.stderr or b"").decode("utf-8", errors="replace") if capture_output else ""
    return result, stdout, stderr


def inspect_server_scope(name):
    result, stdout, _stderr = run_cli(
        [get_claude_cmd(), "mcp", "get", name],
        check=False,
        capture_output=True,
    )
    if result.returncode != 0:
        return None

    for line in stdout.splitlines():
        if "Scope:" not in line:
            continue
        _, value = line.split("Scope:", 1)
        label = value.strip().lower()
        if label.startswith("local"):
            return "local"
        if label.startswith("user"):
            return "user"
        if label.startswith("project"):
            return "project"
    return None


def sync_server_to_claude_cli(name, config):
    scope = inspect_server_scope(name) or "local"

    for existing_scope in ("local", "project", "user"):
        run_cli(
            [get_claude_cmd(), "mcp", "remove", name, "-s", existing_scope],
            check=False,
            capture_output=True,
        )

    cmd = [get_claude_cmd(), "mcp", "add", "-s", scope, name]
    for env_key, env_value in config.get("env", {}).items():
        cmd.extend(["-e", f"{env_key}={env_value}"])
    cmd.extend(["--", config["command"], *config.get("args", [])])
    run_cli(cmd, check=True, capture_output=False)


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
                sync_server_to_claude_cli(name, config)

    print(f"WROTE {claude_home / '.mcp.json'}")
    print("SERVERS " + ", ".join(sorted(servers.keys())))


if __name__ == "__main__":
    main()
