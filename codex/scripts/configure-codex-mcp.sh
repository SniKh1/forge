#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ARGS=(--install-uv --with-pencil)

if [ -n "${FORGE_CODEX_EXA_KEY:-}" ]; then
  ARGS+=(--with-exa --exa-key "$FORGE_CODEX_EXA_KEY")
fi

if [ "${1:-}" = "--no-pencil" ]; then
  ARGS=(--install-uv)
  shift
  if [ -n "${FORGE_CODEX_EXA_KEY:-}" ]; then
    ARGS+=(--with-exa --exa-key "$FORGE_CODEX_EXA_KEY")
  fi
fi

python3 "$SCRIPT_DIR/configure-codex-mcp.py" "${ARGS[@]}" "$@"
