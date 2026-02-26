#!/bin/bash
# ============================================
# Forge - Claude Code Configuration Framework
# verify.sh - Installation Verification
# ============================================

set -e

CLAUDE_HOME="${CLAUDE_HOME:-$HOME/.claude}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;34m'
GRAY='\033[0;90m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

pass() { echo -e "${GREEN}  [PASS] $1${NC}"; PASS=$((PASS + 1)); }
fail() { echo -e "${RED}  [FAIL] $1${NC}"; FAIL=$((FAIL + 1)); }
warn() { echo -e "${YELLOW}  [WARN] $1${NC}"; WARN=$((WARN + 1)); }

echo ""
echo -e "${CYAN}  =======================================${NC}"
echo -e "${CYAN}     Forge - Installation Verification   ${NC}"
echo -e "${CYAN}  =======================================${NC}"
echo -e "${GRAY}  Target: $CLAUDE_HOME${NC}"
echo ""

# ---- 1. Core Files ----
echo -e "${CYAN}[1/6] Core files...${NC}"

for f in CLAUDE.md settings.json .mcp.json; do
  if [ -f "$CLAUDE_HOME/$f" ]; then
    pass "$f"
  else
    fail "$f not found"
  fi
done

if [ -f "$CLAUDE_HOME/hooks/hooks.json" ]; then
  pass "hooks/hooks.json"
else
  fail "hooks/hooks.json not found"
fi

# ---- 2. Configuration Content ----
echo ""
echo -e "${CYAN}[2/6] Configuration content...${NC}"

if [ -f "$CLAUDE_HOME/CLAUDE.md" ]; then
  version=$(sed -n 's/.*版本.*v\([0-9.]*\).*/\1/p' "$CLAUDE_HOME/CLAUDE.md" 2>/dev/null | head -1)
  if [ -n "$version" ]; then
    pass "CLAUDE.md version: v$version"
  else
    warn "CLAUDE.md version not detected"
  fi
fi

if [ -f "$CLAUDE_HOME/settings.json" ]; then
  perm_count=$(grep -c '"Bash\|"Read\|"Write\|"Edit\|"Glob\|"Grep\|"Web\|"Todo\|"Task\|"Skill\|"mcp__' "$CLAUDE_HOME/settings.json" 2>/dev/null || echo 0)
  if [ "$perm_count" -ge 20 ]; then
    pass "settings.json permissions: $perm_count entries"
  else
    warn "settings.json permissions: only $perm_count entries (expected 20+)"
  fi
fi

if [ -f "$CLAUDE_HOME/.mcp.json" ]; then
  mcp_count=$(grep -c '"command"' "$CLAUDE_HOME/.mcp.json" 2>/dev/null || echo 0)
  if [ "$mcp_count" -ge 4 ]; then
    pass ".mcp.json servers: $mcp_count configured"
  else
    warn ".mcp.json servers: only $mcp_count (expected 4+)"
  fi
fi

if [ -f "$CLAUDE_HOME/hooks/hooks.json" ]; then
  if grep -q '{{CLAUDE_HOME}}' "$CLAUDE_HOME/hooks/hooks.json" 2>/dev/null; then
    fail "hooks.json contains unresolved template variables"
  else
    pass "hooks.json template variables resolved"
  fi
fi

# ---- 3. Directory Completeness ----
echo ""
echo -e "${CYAN}[3/6] Directory completeness...${NC}"

check_dir_files() {
  local label="$1"
  local dir="$2"
  shift 2
  local files=("$@")
  local total=${#files[@]}
  local missing=0
  local missing_list=""
  for f in "${files[@]}"; do
    if [ ! -f "$dir/$f" ]; then
      missing=$((missing + 1))
      missing_list="$missing_list $f"
    fi
  done
  local ok=$((total - missing))
  if [ $missing -eq 0 ]; then
    pass "$label ($ok/$total)"
  else
    fail "$label ($ok/$total) missing:$missing_list"
  fi
}

check_dir_files "Agents" "$CLAUDE_HOME/agents" \
  planner.md architect.md tdd-guide.md code-reviewer.md \
  security-reviewer.md build-error-resolver.md e2e-runner.md \
  refactor-cleaner.md doc-updater.md database-reviewer.md

check_dir_files "Rules" "$CLAUDE_HOME/rules" \
  agents.md coding-style.md git-workflow.md hooks.md \
  patterns.md performance.md security.md testing.md

check_dir_files "Stacks" "$CLAUDE_HOME/stacks" \
  frontend.md java.md python.md

# ---- 4. Asset Counts ----
echo ""
echo -e "${CYAN}[4/6] Asset counts...${NC}"

if [ -f "$CLAUDE_HOME/installed-skills.json" ]; then
  skill_count=$(node -e '
    var d = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
    console.log((d.skills||[]).length);
  ' "$CLAUDE_HOME/installed-skills.json" 2>/dev/null || echo 0)
  pass "Skills: $skill_count installed (via install-skills.sh)"
elif [ -d "$CLAUDE_HOME/skills" ]; then
  skill_count=$(find "$CLAUDE_HOME/skills" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ')
  if [ "$skill_count" -ge 1 ]; then
    pass "Skills: $skill_count directories found"
  else
    warn "Skills: none installed. Run: bash ~/.claude/scripts/install-skills.sh"
  fi
else
  warn "Skills: not installed yet. Run: bash ~/.claude/scripts/install-skills.sh"
fi

if [ -d "$CLAUDE_HOME/agents" ]; then
  agent_count=$(find "$CLAUDE_HOME/agents" -maxdepth 1 -name "*.md" | wc -l | tr -d ' ')
  pass "Agents: $agent_count total"
fi

if [ -d "$CLAUDE_HOME/commands" ]; then
  cmd_count=$(find "$CLAUDE_HOME/commands" -name "*.md" | wc -l | tr -d ' ')
  pass "Commands: $cmd_count total"
fi

# ---- 5. Runtime Dependencies ----
echo ""
echo -e "${CYAN}[5/6] Runtime dependencies...${NC}"

if command -v git &> /dev/null; then
  pass "git: $(git --version | head -1)"
else
  fail "git not found"
fi

if command -v node &> /dev/null; then
  pass "node: $(node --version)"
else
  warn "node not found (needed for hooks)"
fi

if command -v npx &> /dev/null; then
  pass "npx: available"
else
  warn "npx not found (needed for MCP servers)"
fi

# ---- 6. Summary ----
echo ""
echo -e "${CYAN}[6/6] Summary${NC}"
echo -e "${CYAN}  =======================================${NC}"
TOTAL=$((PASS + FAIL + WARN))
echo -e "${GREEN}  PASS: $PASS${NC}  ${RED}FAIL: $FAIL${NC}  ${YELLOW}WARN: $WARN${NC}  Total: $TOTAL"

if [ $FAIL -eq 0 ]; then
  echo ""
  echo -e "${GREEN}  Installation verified successfully!${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}  Installation has $FAIL issue(s), check output above.${NC}"
  exit 1
fi
