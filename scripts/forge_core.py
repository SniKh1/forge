#!/usr/bin/env python3

import json
import os
import shutil
import stat
import subprocess
import sys
from copy import deepcopy
from pathlib import Path


def repo_root():
    return Path(__file__).resolve().parents[1]


def core_dir():
    return repo_root() / "core"


def load_mcp_catalog():
    with (core_dir() / "mcp-servers.json").open("r", encoding="utf-8") as fh:
        return json.load(fh)


def shell_ok(cmd):
    return shutil.which(cmd) is not None


def ensure_uvx(install_uv):
    if shell_ok("uvx"):
        return
    if not install_uv:
        print("WARN missing uvx; fetch MCP may not run until uvx is installed", file=sys.stderr)
        return
    if sys.platform.startswith("win"):
        subprocess.run(
            [
                "powershell",
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                "irm https://astral.sh/uv/install.ps1 | iex",
            ],
            check=True,
        )
        return
    subprocess.run("curl -LsSf https://astral.sh/uv/install.sh | sh", shell=True, check=True)


def resolve_servers(client, exa_key="", include_optional=True, selected_servers=None):
    catalog = load_mcp_catalog()["servers"]
    resolved = {}
    selected = set(selected_servers or [])

    for name, item in catalog.items():
        if client not in item.get("clients", []):
            continue
        if selected and name not in selected:
            continue
        if not include_optional and item.get("optional"):
            continue
        if item.get("platforms") and sys.platform not in item["platforms"]:
            continue

        config = deepcopy(item["config"])
        if item.get("overrides", {}).get(client):
            override = item["overrides"][client]
            config.update(deepcopy(override))

        if name == "exa":
            if not exa_key:
                continue
            env = config.get("env", {})
            for key, value in list(env.items()):
                if value == "{{EXA_API_KEY}}":
                    env[key] = exa_key
            config["env"] = env

        if name == "pencil" and not Path(config["command"]).exists():
            continue

        resolved[name] = config

    return resolved


def dump_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        try:
            path.chmod(stat.S_IWRITE | stat.S_IREAD)
        except OSError:
            pass

    temp_path = path.with_name(f".{path.name}.tmp")
    temp_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(temp_path, path)


def load_json(path):
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def format_toml_scalar(value):
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    escaped = str(value).replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def format_toml_array(values):
    return "[" + ", ".join(format_toml_scalar(v) for v in values) + "]"


def _collect_toml_sections(mapping, prefix=()):
    sections = []
    scalar_lines = []
    child_tables = []

    for key, value in mapping.items():
        if isinstance(value, dict):
            child_tables.append((key, value))
            continue
        if isinstance(value, list):
            scalar_lines.append(f"{key} = {format_toml_array(value)}")
            continue
        scalar_lines.append(f"{key} = {format_toml_scalar(value)}")

    if prefix:
        if scalar_lines or not child_tables:
            sections.append([f"[{'.'.join(prefix)}]", *scalar_lines])
    elif scalar_lines:
        sections.append(scalar_lines)

    for key, value in child_tables:
        sections.extend(_collect_toml_sections(value, prefix + (key,)))

    return sections


def dump_toml_document(data):
    sections = _collect_toml_sections(data)
    if not sections:
        return ""
    return "\n\n".join("\n".join(section) for section in sections) + "\n"


def write_claude_mcp_config(claude_home, payload):
    claude_home = Path(claude_home).expanduser()
    primary_path = claude_home / ".mcp.json"
    fallback_path = claude_home.parent / ".claude.json"

    try:
        dump_json(primary_path, payload)
        return primary_path, None
    except PermissionError as primary_error:
        fallback_payload = load_json(fallback_path)
        fallback_payload["mcpServers"] = payload.get("mcpServers", {})
        try:
            dump_json(fallback_path, fallback_payload)
            return fallback_path, primary_error
        except PermissionError as fallback_error:
            raise PermissionError(
                f"Unable to write Claude MCP config to {primary_path} or fallback {fallback_path}"
            ) from fallback_error
