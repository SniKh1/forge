#!/bin/bash
# ============================================
# Forge - Claude Code Configuration Framework
# install.sh - macOS/Linux
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_HOME="$HOME/.claude"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;34m'
GRAY='\033[0;90m'
NC='\033[0m'

echo ""
echo -e "${CYAN}  =======================================${NC}"
echo -e "${CYAN}       Forge - Claude Code Framework     ${NC}"
echo -e "${CYAN}  =======================================${NC}"
echo ""

# --- Step 1: Check dependencies ---
PYTHON_CMD="python3"

echo -e "${YELLOW}[1/5] Checking dependencies...${NC}"

if ! command -v git &> /dev/null; then
  echo -e "${RED}  Error: git is not installed${NC}"
  exit 1
fi
echo -e "${GREEN}  git: OK${NC}"

if command -v python3 &> /dev/null; then
  PYTHON_CMD="python3"
  echo -e "${GREEN}  python3: OK${NC}"
elif command -v python &> /dev/null; then
  PYTHON_CMD="python"
  echo -e "${GREEN}  python: OK${NC}"
else
  echo -e "${YELLOW}  Warning: python not found, Trellis hooks will not work${NC}"
fi

# --- Step 2: Install files ---
echo -e "${YELLOW}[2/5] Installing files...${NC}"

mkdir -p "$CLAUDE_HOME"

# Markdown docs
doc_count=0
for f in CLAUDE.md CAPABILITIES.md USAGE-GUIDE.md AGENTS.md GUIDE.md; do
  if [ -f "$SCRIPT_DIR/$f" ]; then
    cp "$SCRIPT_DIR/$f" "$CLAUDE_HOME/$f"
    doc_count=$((doc_count + 1))
  fi
done
echo -e "${GRAY}  Docs: $doc_count files${NC}"

# Directories
dir_count=0
for d in agents commands contexts rules stacks hooks scripts skills; do
  if [ -d "$SCRIPT_DIR/$d" ]; then
    mkdir -p "$CLAUDE_HOME/$d"
    cp -r "$SCRIPT_DIR/$d/." "$CLAUDE_HOME/$d/"
    dir_count=$((dir_count + 1))
  fi
done

# Trellis + Cursor
for d in .trellis .cursor; do
  if [ -d "$SCRIPT_DIR/$d" ]; then
    mkdir -p "$CLAUDE_HOME/$d"
    cp -r "$SCRIPT_DIR/$d/." "$CLAUDE_HOME/$d/"
    dir_count=$((dir_count + 1))
  fi
done
echo -e "${GRAY}  Directories: $dir_count synced${NC}"

# Ensure runtime directories exist
for dir in \
  "$CLAUDE_HOME/homunculus/instincts/personal" \
  "$CLAUDE_HOME/homunculus/instincts/inherited" \
  "$CLAUDE_HOME/sessions"; do
  mkdir -p "$dir"
  [ ! -f "$dir/.gitkeep" ] && touch "$dir/.gitkeep"
done

echo -e "${GREEN}  Files installed${NC}"

# --- Step 3: Apply templates ---
echo -e "${YELLOW}[3/5] Applying templates...${NC}"

# settings.json (only if not exists, preserve user customizations)
if [ -f "$CLAUDE_HOME/settings.json.template" ] && [ ! -f "$CLAUDE_HOME/settings.json" ]; then
  cp "$CLAUDE_HOME/settings.json.template" "$CLAUDE_HOME/settings.json"
  echo -e "${GRAY}  settings.json: created${NC}"
else
  echo -e "${GRAY}  settings.json: exists, skipped${NC}"
fi

# .mcp.json (only if not exists)
if [ -f "$CLAUDE_HOME/mcp.json.template" ] && [ ! -f "$CLAUDE_HOME/.mcp.json" ]; then
  cp "$CLAUDE_HOME/mcp.json.template" "$CLAUDE_HOME/.mcp.json"
  echo -e "${GRAY}  .mcp.json: created${NC}"
else
  echo -e "${GRAY}  .mcp.json: exists, skipped${NC}"
fi

# hooks.json (always regenerate from template)
if [ -f "$CLAUDE_HOME/hooks/hooks.json.template" ]; then
  ESCAPED_HOME=$(echo "$CLAUDE_HOME" | sed 's/\//\\\//g')
  sed -e "s/{{CLAUDE_HOME}}/$ESCAPED_HOME/g" \
      -e "s/{{PYTHON_CMD}}/$PYTHON_CMD/g" \
    "$CLAUDE_HOME/hooks/hooks.json.template" > "$CLAUDE_HOME/hooks/hooks.json"
  echo -e "${GRAY}  hooks.json: generated${NC}"
fi

echo -e "${GREEN}  Templates applied${NC}"

# --- Step 4: Verify installation ---
echo -e "${YELLOW}[4/5] Verifying...${NC}"

all_ok=true

# Helper: check file list
check_files() {
  local label="$1"
  local dir="$2"
  shift 2
  local files=("$@")
  local total=${#files[@]}
  local missing=0
  for f in "${files[@]}"; do
    [ ! -f "$dir/$f" ] && missing=$((missing + 1))
  done
  local ok=$((total - missing))
  if [ $missing -eq 0 ]; then
    echo -e "${GREEN}  $label ($ok/$total): OK${NC}"
  else
    echo -e "${RED}  $label ($ok/$total): $missing MISSING${NC}"
    all_ok=false
  fi
}

check_files "Pipeline Agents" "$CLAUDE_HOME/agents" \
  implement.md check.md debug.md research.md dispatch.md plan.md

check_files "Trellis Commands" "$CLAUDE_HOME/commands/trellis" \
  start.md parallel.md finish-work.md break-loop.md \
  record-session.md before-backend-dev.md before-frontend-dev.md \
  check-backend.md check-frontend.md check-cross-layer.md \
  create-command.md integrate-skill.md onboard.md update-spec.md

check_files "Trellis Hooks" "$CLAUDE_HOME/hooks" \
  inject-subagent-context.py ralph-loop.py session-start.py

# Skills count
if [ -d "$CLAUDE_HOME/skills" ]; then
  skill_count=$(find "$CLAUDE_HOME/skills" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ')
  echo -e "${GREEN}  Skills: $skill_count installed${NC}"
else
  echo -e "${RED}  Skills: MISSING${NC}"
  all_ok=false
fi

# Agents total
if [ -d "$CLAUDE_HOME/agents" ]; then
  agent_total=$(find "$CLAUDE_HOME/agents" -maxdepth 1 -name "*.md" | wc -l | tr -d ' ')
  echo -e "${GREEN}  Agents (total): $agent_total${NC}"
fi

# Commands total
if [ -d "$CLAUDE_HOME/commands" ]; then
  cmd_total=$(find "$CLAUDE_HOME/commands" -name "*.md" | wc -l | tr -d ' ')
  echo -e "${GREEN}  Commands (total): $cmd_total${NC}"
fi

if ! $all_ok; then
  echo ""
  echo -e "${RED}  Some components are missing, check the output above${NC}"
fi

# --- Step 5: Done ---
echo ""
echo -e "${GREEN}[5/5] Done!${NC}"
echo ""
echo -e "${CYAN}  Location: $CLAUDE_HOME${NC}"
echo ""
echo -e "${CYAN}  Next steps:${NC}"
echo -e "${GRAY}    1. Run /trellis:onboard in Claude Code${NC}"
echo -e "${GRAY}    2. Run /trellis:start at the beginning of each session${NC}"
echo ""
