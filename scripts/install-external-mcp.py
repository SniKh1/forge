#!/usr/bin/env python3

import argparse
import json
import os
import sys
import tomllib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from forge_core import dump_toml_document, load_json, write_claude_mcp_config  # noqa: E402


def load_codex_config(path: Path):
    if not path.exists():
        return {}
    with path.open('rb') as fh:
        return tomllib.load(fh)
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--client', required=True, choices=['claude', 'codex', 'gemini'])
    parser.add_argument('--name', required=True)
    parser.add_argument('--command', required=True)
    parser.add_argument('--args-json', default='[]')
    parser.add_argument('--env-json', default='{}')
    parser.add_argument('--claude-home', default=os.path.expanduser('~/.claude'))
    parser.add_argument('--codex-config', default=os.path.expanduser('~/.codex/config.toml'))
    parser.add_argument('--gemini-home', default=os.path.expanduser('~/.gemini'))
    args = parser.parse_args()

    server_name = args.name
    command = args.command
    argv = json.loads(args.args_json)
    env = json.loads(args.env_json)

    if args.client == 'claude':
        claude_home = Path(args.claude_home).expanduser()
        claude_home.mkdir(parents=True, exist_ok=True)
        payload = {}
        target = claude_home / '.mcp.json'
        if target.exists():
            payload = load_json(target)
        else:
            fallback = claude_home.parent / '.claude.json'
            if fallback.exists():
                payload = load_json(fallback)
        payload.setdefault('mcpServers', {})
        item = {'command': command, 'args': argv}
        if env:
            item['env'] = env
        payload['mcpServers'][server_name] = item
        written_path, fallback_error = write_claude_mcp_config(claude_home, payload)
        if fallback_error is not None:
            print(f'WARN primary_write_failed {target}')
        print(f'WROTE {written_path}')
        print(f'SERVER {server_name}')
        return

    if args.client == 'gemini':
        gemini_home = Path(args.gemini_home).expanduser()
        gemini_home.mkdir(parents=True, exist_ok=True)
        target = gemini_home / 'settings.json'
        payload = {}
        if target.exists():
            payload = json.loads(target.read_text(encoding='utf-8'))
        payload.setdefault('mcpServers', {})
        item = {'command': command, 'args': argv, 'timeout': 60000}
        if env:
            item['env'] = env
        payload['mcpServers'][server_name] = item
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(f'WROTE {target}')
        print(f'SERVER {server_name}')
        return

    config_path = Path(args.codex_config).expanduser()
    config_path.parent.mkdir(parents=True, exist_ok=True)
    data = load_codex_config(config_path)
    mcp_servers = dict(data.get('mcp_servers', {}))
    item = {'command': command, 'args': argv}
    if env:
        item['env'] = env
    mcp_servers[server_name] = item
    data['mcp_servers'] = mcp_servers
    config_path.write_text(dump_toml_document(data), encoding='utf-8')
    print(f'WROTE {config_path}')
    print(f'SERVER {server_name}')


if __name__ == '__main__':
    main()
