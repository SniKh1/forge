#!/usr/bin/env bash
set -euo pipefail

FORGE_AGENT_HOME="${FORGE_AGENT_HOME:-$HOME/.gemini}" node "$(cd "$(dirname "$0")/../../scripts/codex-learning" && pwd)/codex-learning.js" evolve "$@"
