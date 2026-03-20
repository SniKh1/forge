#!/usr/bin/env python3

import argparse
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
from forge_core import decode_secret_values, ensure_uvx, load_mcp_catalog, resolve_servers  # noqa: E402


def codex_cmd():
    return os.environ.get("CODEX_BIN", "codex")


def codex_mcp_remove(name: str):
    proc = subprocess.run(
        [codex_cmd(), "mcp", "remove", name],
        capture_output=True,
        text=True,
    )
    return proc.returncode == 0


def codex_mcp_add(name: str, server: dict):
    base = [codex_cmd(), "mcp", "add", name]
    if server.get("url"):
        args = base + ["--url", server["url"]]
        bearer_env = server.get("bearer_token_env_var")
        if bearer_env:
            args += ["--bearer-token-env-var", bearer_env]
    else:
        args = list(base)
        env_map = server.get("env", {}) or {}
        for key, value in env_map.items():
            args += ["--env", f"{key}={value}"]
        args += ["--", server["command"], *server.get("args", [])]

    proc = subprocess.run(args, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError((proc.stderr or proc.stdout or "").strip() or f"codex mcp add failed for {name}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default=os.path.expanduser("~/.codex/config.toml"))
    parser.add_argument("--exa-key", default=os.environ.get("FORGE_CODEX_EXA_KEY", ""))
    parser.add_argument("--secret-values-base64", default=os.environ.get("FORGE_SECRET_VALUES_BASE64", ""))
    parser.add_argument("--with-pencil", action="store_true")
    parser.add_argument("--with-exa", action="store_true")
    parser.add_argument("--install-uv", action="store_true")
    parser.add_argument("--servers", default="")
    args = parser.parse_args()

    ensure_uvx(args.install_uv)

    resolved = resolve_servers(
        "codex",
        exa_key=args.exa_key if args.with_exa else "",
        include_optional=True,
        selected_servers=[item.strip() for item in args.servers.split(",") if item.strip()],
        secret_values=decode_secret_values(args.secret_values_base64),
    )

    if not args.with_pencil and "pencil" in resolved:
        del resolved["pencil"]

    catalog = load_mcp_catalog()["servers"]
    managed_names = {
        name for name, item in catalog.items()
        if "codex" in item.get("clients", [])
    }

    for name in sorted(managed_names):
        if name not in resolved:
            codex_mcp_remove(name)

    for name, server in resolved.items():
        codex_mcp_remove(name)
        codex_mcp_add(name, server)

    print(f"UPDATED Codex MCP registry via {codex_cmd()}")
    print("SERVERS " + ", ".join(sorted(resolved.keys())))


if __name__ == "__main__":
    main()
