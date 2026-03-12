#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CLI="$ROOT_DIR/packages/forge-cli/bin/forge.js"

if ! command -v node >/dev/null 2>&1; then
  echo "Forge compatibility entrypoint: codex/install-codex.sh" >&2
  echo "Node.js 18+ is required. Install Node.js and rerun, or use the desktop installer." >&2
  exit 1
fi

echo "Forge compatibility entrypoint: codex/install-codex.sh"
echo "Delegating to: forge install codex"

ARGS=(install codex)
[ "${FORGE_NONINTERACTIVE:-0}" = "1" ] && ARGS+=(--non-interactive)
[ -n "${FORGE_LANG:-}" ] && ARGS+=(--lang "$FORGE_LANG")
[ -n "${FORGE_INSTALL_MODE:-}" ] && ARGS+=(--install-mode "$FORGE_INSTALL_MODE")
[ "${FORGE_SKIP_BACKUP:-0}" = "1" ] && ARGS+=(--skip-backup)
[ -n "${FORGE_CODEX_EXA_KEY:-}" ] && ARGS+=(--exa-api-key "$FORGE_CODEX_EXA_KEY")

node "$CLI" "${ARGS[@]}"
