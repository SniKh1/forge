#!/bin/bash
# Forge Codex Verification (macOS/Linux)

set -e

CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
FORGE_HOME="$CODEX_HOME/forge"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

ok() { echo -e "${GREEN}[PASS] $1${NC}"; PASS=$((PASS + 1)); }
bad() { echo -e "${RED}[FAIL] $1${NC}"; FAIL=$((FAIL + 1)); }
warn() { echo -e "${YELLOW}[WARN] $1${NC}"; WARN=$((WARN + 1)); }

echo -e "${CYAN}Forge Codex verification${NC}"
echo "Target: $CODEX_HOME"
echo ""

[ -f "$CODEX_HOME/AGENTS.md" ] && ok "AGENTS.md" || bad "AGENTS.md missing"
[ -f "$FORGE_HOME/CLAUDE.md" ] && ok "forge/CLAUDE.md" || bad "forge/CLAUDE.md missing"
[ -d "$FORGE_HOME/agents" ] && ok "forge/agents" || bad "forge/agents missing"
[ -d "$FORGE_HOME/rules" ] && ok "forge/rules" || bad "forge/rules missing"
[ -d "$FORGE_HOME/stacks" ] && ok "forge/stacks" || bad "forge/stacks missing"
[ -d "$FORGE_HOME/hooks" ] && ok "forge/hooks" || bad "forge/hooks missing"
[ -d "$FORGE_HOME/scripts" ] && ok "forge/scripts" || bad "forge/scripts missing"
[ -f "$FORGE_HOME/scripts/codex-learning/codex-learning.js" ] && ok "forge/scripts/codex-learning/codex-learning.js" || bad "codex-learning script missing"

if [ -d "$CODEX_HOME/skills" ]; then
  sc=$(find "$CODEX_HOME/skills" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ')
  if [ "${sc:-0}" -gt 0 ]; then
    ok "skills: $sc"
  else
    warn "skills directory exists but empty"
  fi
else
  bad "skills directory missing"
fi

[ -d "$CODEX_HOME/skills/learned" ] && ok "skills/learned" || bad "skills/learned missing"
[ -d "$CODEX_HOME/homunculus/instincts/personal" ] && ok "homunculus/instincts/personal" || bad "homunculus/instincts/personal missing"
[ -d "$CODEX_HOME/homunculus/evolved" ] && ok "homunculus/evolved" || bad "homunculus/evolved missing"

if [ -d "$CODEX_HOME/projects" ]; then
  ok "projects/ exists"
else
  bad "projects/ missing"
fi

if [ -f "$FORGE_HOME/rules/security.md" ] && [ -f "$FORGE_HOME/agents/planner.md" ] && [ -f "$FORGE_HOME/stacks/frontend.md" ]; then
  ok "key playbooks installed"
else
  bad "key playbooks missing"
fi

echo ""
echo "PASS: $PASS  FAIL: $FAIL  WARN: $WARN"
[ "$FAIL" -eq 0 ]
