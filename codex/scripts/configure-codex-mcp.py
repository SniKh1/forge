#!/usr/bin/env python3

import argparse
import os
import sys
import tomllib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
from forge_core import ensure_uvx, resolve_servers  # noqa: E402


def load_config(path: Path):
    if not path.exists():
        return {}
    with path.open("rb") as fh:
        return tomllib.load(fh)


def format_scalar(value):
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    escaped = str(value).replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def format_array(values):
    return "[" + ", ".join(format_scalar(v) for v in values) + "]"


def dump_config(data):
    lines = []

    for key, value in data.items():
        if key == "mcp_servers":
            continue
        if isinstance(value, list):
            lines.append(f"{key} = {format_array(value)}")
        else:
            lines.append(f"{key} = {format_scalar(value)}")

    if lines:
        lines.append("")

    lines.append("[mcp_servers]")
    lines.append("")

    for name, server in data.get("mcp_servers", {}).items():
        lines.append(f"[mcp_servers.{name}]")
        for key, value in server.items():
            if key == "env":
                continue
            if isinstance(value, list):
                lines.append(f"{key} = {format_array(value)}")
            else:
                lines.append(f"{key} = {format_scalar(value)}")
        env = server.get("env")
        if isinstance(env, dict) and env:
            lines.append("")
            lines.append(f"[mcp_servers.{name}.env]")
            for env_key, env_value in env.items():
                lines.append(f"{env_key} = {format_scalar(env_value)}")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default=os.path.expanduser("~/.codex/config.toml"))
    parser.add_argument("--exa-key", default=os.environ.get("FORGE_CODEX_EXA_KEY", ""))
    parser.add_argument("--with-pencil", action="store_true")
    parser.add_argument("--with-exa", action="store_true")
    parser.add_argument("--install-uv", action="store_true")
    parser.add_argument("--servers", default="")
    args = parser.parse_args()

    config_path = Path(args.config).expanduser()
    config_path.parent.mkdir(parents=True, exist_ok=True)

    ensure_uvx(args.install_uv)

    data = load_config(config_path)
    mcp_servers = dict(data.get("mcp_servers", {}))

    resolved = resolve_servers(
        "codex",
        exa_key=args.exa_key if args.with_exa else "",
        include_optional=True,
        selected_servers=[item.strip() for item in args.servers.split(",") if item.strip()],
    )

    if not args.with_pencil and "pencil" in resolved:
        del resolved["pencil"]

    for name, server in resolved.items():
        mcp_servers[name] = server

    data["mcp_servers"] = mcp_servers
    config_path.write_text(dump_config(data), encoding="utf-8")
    print(f"WROTE {config_path}")
    print("SERVERS " + ", ".join(sorted(mcp_servers.keys())))


if __name__ == "__main__":
    main()
