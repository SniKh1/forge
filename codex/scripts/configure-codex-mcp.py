#!/usr/bin/env python3

import argparse
import os
import sys
import tomllib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
from forge_core import dump_toml_document, ensure_uvx, resolve_servers  # noqa: E402


def load_config(path: Path):
    if not path.exists():
        return {}
    with path.open("rb") as fh:
        return tomllib.load(fh)

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
    config_path.write_text(dump_toml_document(data), encoding="utf-8")
    print(f"WROTE {config_path}")
    print("SERVERS " + ", ".join(sorted(mcp_servers.keys())))


if __name__ == "__main__":
    main()
