#!/bin/bash
# ============================================
# Forge - Claude Code Configuration Framework
# install.sh - macOS/Linux
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_HOME="$HOME/.claude"
BACKUP_DIR="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║     Forge - Claude Code Framework     ║"
echo "  ║         Installation Script           ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# --- Step 1: Check dependencies ---
PYTHON_CMD="python3"

check_deps() {
  echo -e "${YELLOW}[1/7] Checking dependencies...${NC}"

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
    echo -e "${YELLOW}  Warning: python not found. Trellis hooks (Pipeline Agents, Ralph Loop) will not work.${NC}"
    echo -e "${YELLOW}  Install Python 3.8+ to enable full Trellis pipeline support.${NC}"
  fi
}

# --- Step 2: Backup existing config ---
backup_existing() {
  echo -e "${YELLOW}[2/7] Checking existing configuration...${NC}"

  if [ -d "$CLAUDE_HOME" ]; then
    echo -e "  Found existing ~/.claude/"
    read -p "  Backup existing config? (y/n): " do_backup
    if [ "$do_backup" = "y" ]; then
      cp -r "$CLAUDE_HOME" "$BACKUP_DIR"
      echo -e "${GREEN}  Backed up to $BACKUP_DIR${NC}"
    fi
  else
    mkdir -p "$CLAUDE_HOME"
    echo -e "  Created ~/.claude/"
  fi
}

# --- Step 3: Copy core files ---
copy_files() {
  echo -e "${YELLOW}[3/7] Installing configuration files...${NC}"

  for f in CLAUDE.md CAPABILITIES.md USAGE-GUIDE.md AGENTS.md GUIDE.md; do
    [ -f "$SCRIPT_DIR/$f" ] && cp "$SCRIPT_DIR/$f" "$CLAUDE_HOME/$f"
  done

  for d in agents commands contexts rules stacks hooks scripts; do
    if [ -d "$SCRIPT_DIR/$d" ]; then
      mkdir -p "$CLAUDE_HOME/$d"
      cp -r "$SCRIPT_DIR/$d/." "$CLAUDE_HOME/$d/"
    fi
  done

  if [ -d "$SCRIPT_DIR/.trellis" ]; then
    mkdir -p "$CLAUDE_HOME/.trellis"
    cp -r "$SCRIPT_DIR/.trellis/." "$CLAUDE_HOME/.trellis/"
  fi

  if [ -d "$SCRIPT_DIR/.cursor" ]; then
    mkdir -p "$CLAUDE_HOME/.cursor"
    cp -r "$SCRIPT_DIR/.cursor/." "$CLAUDE_HOME/.cursor/"
  fi

  echo -e "${GREEN}  Core files installed${NC}"
}

# --- Step 4: Create required directories ---
create_dirs() {
  echo -e "${YELLOW}[4/7] Creating directory structure...${NC}"

  local dirs=(
    "$CLAUDE_HOME/homunculus/instincts/personal"
    "$CLAUDE_HOME/homunculus/instincts/inherited"
    "$CLAUDE_HOME/sessions"
    "$CLAUDE_HOME/commands/trellis"
  )

  for dir in "${dirs[@]}"; do
    if [ ! -d "$dir" ]; then
      mkdir -p "$dir"
      echo -e "${GRAY}  Created ${dir/$CLAUDE_HOME/\~\/.claude}${NC}"
    fi
  done

  # Create .gitkeep files to preserve empty directories
  local gitkeep_dirs=(
    "$CLAUDE_HOME/homunculus/instincts/personal"
    "$CLAUDE_HOME/homunculus/instincts/inherited"
    "$CLAUDE_HOME/sessions"
  )

  for dir in "${gitkeep_dirs[@]}"; do
    [ ! -f "$dir/.gitkeep" ] && touch "$dir/.gitkeep"
  done

  echo -e "${GREEN}  Directories created${NC}"
}

# --- Step 5: Apply templates ---
apply_templates() {
  echo -e "${YELLOW}[5/7] Applying templates...${NC}"

  # settings.json
  if [ -f "$CLAUDE_HOME/settings.json.template" ]; then
    cp "$CLAUDE_HOME/settings.json.template" "$CLAUDE_HOME/settings.json"
  fi

  # .mcp.json
  if [ -f "$CLAUDE_HOME/mcp.json.template" ]; then
    cp "$CLAUDE_HOME/mcp.json.template" "$CLAUDE_HOME/.mcp.json"
  fi

  # hooks.json - replace {{CLAUDE_HOME}} and {{PYTHON_CMD}}
  if [ -f "$CLAUDE_HOME/hooks/hooks.json.template" ]; then
    ESCAPED_HOME=$(echo "$CLAUDE_HOME" | sed 's/\//\\\//g')
    sed -e "s/{{CLAUDE_HOME}}/$ESCAPED_HOME/g" \
        -e "s/{{PYTHON_CMD}}/$PYTHON_CMD/g" \
      "$CLAUDE_HOME/hooks/hooks.json.template" > "$CLAUDE_HOME/hooks/hooks.json"
  fi

  echo -e "${GREEN}  Templates applied${NC}"
}

# --- Step 6: Verify Trellis integration ---
verify_trellis() {
  echo -e "${YELLOW}[6/7] Verifying Trellis integration...${NC}"

  local all_ok=true

  # Pipeline Agents
  local pipeline_agents=(
    "implement.md" "check.md" "debug.md"
    "research.md" "dispatch.md" "plan.md"
  )
  local pipeline_missing=0
  for f in "${pipeline_agents[@]}"; do
    [ ! -f "$CLAUDE_HOME/agents/$f" ] && pipeline_missing=$((pipeline_missing + 1))
  done
  local pipeline_total=${#pipeline_agents[@]}
  local pipeline_ok=$((pipeline_total - pipeline_missing))
  if [ $pipeline_missing -eq 0 ]; then
    echo -e "${GREEN}  Pipeline Agents ($pipeline_ok/$pipeline_total): OK${NC}"
  else
    echo -e "${RED}  Pipeline Agents ($pipeline_ok/$pipeline_total): $pipeline_missing MISSING${NC}"
    all_ok=false
  fi

  # Trellis Commands
  local trellis_cmds=(
    "start.md" "parallel.md" "finish-work.md" "break-loop.md"
    "record-session.md" "before-backend-dev.md" "before-frontend-dev.md"
    "check-backend.md" "check-frontend.md" "check-cross-layer.md"
    "create-command.md" "integrate-skill.md" "onboard.md" "update-spec.md"
  )
  local cmd_missing=0
  for f in "${trellis_cmds[@]}"; do
    [ ! -f "$CLAUDE_HOME/commands/trellis/$f" ] && cmd_missing=$((cmd_missing + 1))
  done
  local cmd_total=${#trellis_cmds[@]}
  local cmd_ok=$((cmd_total - cmd_missing))
  if [ $cmd_missing -eq 0 ]; then
    echo -e "${GREEN}  Trellis Commands ($cmd_ok/$cmd_total): OK${NC}"
  else
    echo -e "${RED}  Trellis Commands ($cmd_ok/$cmd_total): $cmd_missing MISSING${NC}"
    all_ok=false
  fi

  # Trellis Hooks
  local trellis_hooks=(
    "inject-subagent-context.py" "ralph-loop.py" "session-start.py"
  )
  local hook_missing=0
  for f in "${trellis_hooks[@]}"; do
    [ ! -f "$CLAUDE_HOME/hooks/$f" ] && hook_missing=$((hook_missing + 1))
  done
  local hook_total=${#trellis_hooks[@]}
  local hook_ok=$((hook_total - hook_missing))
  if [ $hook_missing -eq 0 ]; then
    echo -e "${GREEN}  Trellis Hooks ($hook_ok/$hook_total): OK${NC}"
  else
    echo -e "${RED}  Trellis Hooks ($hook_ok/$hook_total): $hook_missing MISSING${NC}"
    all_ok=false
  fi

  if $all_ok; then
    echo -e "${GREEN}  Trellis integration verified${NC}"
  else
    echo -e "${RED}  Some Trellis components are missing!${NC}"
  fi
}

# --- Step 7: Install Skills ---
install_skills() {
  echo -e "${YELLOW}[7/7] Installing Skills...${NC}"

  local skills_src="$SCRIPT_DIR/skills"
  if [ -d "$skills_src" ]; then
    mkdir -p "$CLAUDE_HOME/skills"
    cp -r "$skills_src/." "$CLAUDE_HOME/skills/"
    local skill_count
    skill_count=$(find "$CLAUDE_HOME/skills" -maxdepth 1 -mindepth 1 -type d | wc -l)
    echo -e "${GREEN}  Skills installed ($skill_count skills)${NC}"
  else
    echo -e "${YELLOW}  Warning: skills/ directory not found in repo${NC}"
  fi
}

# --- Summary ---
show_summary() {
  echo ""
  echo -e "${GREEN}  ╔═══════════════════════════════════════╗${NC}"
  echo -e "${GREEN}  ║       Installation complete!          ║${NC}"
  echo -e "${GREEN}  ╚═══════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  Config location: ${BLUE}$CLAUDE_HOME${NC}"
  echo ""
  echo -e "  ${BLUE}Installed components:${NC}"
  echo -e "  ${GRAY}  Interactive Agents:  10${NC}"
  echo -e "  ${GRAY}  Pipeline Agents:      6${NC}"
  echo -e "  ${GRAY}  Commands (general):  20${NC}"
  echo -e "  ${GRAY}  Commands (trellis):  14${NC}"
  echo -e "  ${GRAY}  Rules:                8${NC}"
  echo -e "  ${GRAY}  Contexts:             3${NC}"
  echo -e "  ${GRAY}  Hooks (JS):           8${NC}"
  echo -e "  ${GRAY}  Hooks (Python):       3${NC}"
  echo ""
  echo -e "  ${BLUE}Next steps:${NC}"
  echo -e "  ${GRAY}  1. Run /trellis:onboard in Claude Code for first-time setup${NC}"
  echo -e "  ${GRAY}  2. Run /trellis:start at the beginning of each session${NC}"
  echo ""
}

# --- Main ---
main() {
  check_deps
  backup_existing
  copy_files
  create_dirs
  apply_templates
  verify_trellis
  install_skills
  show_summary
}

main
