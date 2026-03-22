#!/usr/bin/env python3

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from forge_core import load_json, write_claude_mcp_config  # noqa: E402

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

    remove_proc = subprocess.run(
        ["codex", "mcp", "remove", server_name],
        capture_output=True,
        text=True,
    )
    _ = remove_proc
    cmd = ["codex", "mcp", "add", server_name]
    for key, value in env.items():
        cmd += ["--env", f"{key}={value}"]
    cmd += ["--", command, *argv]
    add_proc = subprocess.run(cmd, capture_output=True, text=True)
    if add_proc.returncode != 0:
        raise RuntimeError((add_proc.stderr or add_proc.stdout or "").strip() or f"codex mcp add failed for {server_name}")
    print('UPDATED Codex MCP registry via codex mcp')
    print(f'SERVER {server_name}')


if __name__ == '__main__':
    main()
