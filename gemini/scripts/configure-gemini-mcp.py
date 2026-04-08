#!/usr/bin/env python3

import argparse
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
from forge_core import decode_secret_values, dump_json, ensure_uvx, resolve_servers  # noqa: E402


def load_json(path):
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--gemini-home", default=os.environ.get("GEMINI_HOME", os.path.expanduser("~/.gemini")))
    parser.add_argument("--exa-key", default=os.environ.get("FORGE_GEMINI_EXA_KEY", ""))
    parser.add_argument("--secret-values-base64", default=os.environ.get("FORGE_SECRET_VALUES_BASE64", ""))
    parser.add_argument("--install-uv", action="store_true")
    parser.add_argument("--servers", default="")
    args = parser.parse_args()

    ensure_uvx(args.install_uv)

    gemini_home = Path(args.gemini_home).expanduser()
    gemini_home.mkdir(parents=True, exist_ok=True)
    settings_path = gemini_home / "settings.json"
    data = load_json(settings_path)
    data.setdefault("mcpServers", {})

    servers = resolve_servers(
        "gemini",
        exa_key=args.exa_key,
        include_optional=True,
        selected_servers=[item.strip() for item in args.servers.split(",") if item.strip()],
        secret_values=decode_secret_values(args.secret_values_base64),
    )
    for name, config in servers.items():
        item = {
            "command": config["command"],
            "args": config.get("args", []),
            "timeout": 60000,
        }
        if config.get("env"):
            item["env"] = config["env"]
        data["mcpServers"][name] = item

    dump_json(settings_path, data)
    print(f"WROTE {settings_path}")
    print("SERVERS " + ", ".join(sorted(servers.keys())))


if __name__ == "__main__":
    main()
