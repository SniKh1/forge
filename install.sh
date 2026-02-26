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
echo -e "${YELLOW}[1/5] Checking dependencies...${NC}"

if ! command -v git &> /dev/null; then
  echo -e "${RED}  Error: git is not installed${NC}"
  exit 1
fi
echo -e "${GREEN}  git: OK${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}  Warning: node not found, hooks will not work${NC}"
else
  echo -e "${GREEN}  node: OK${NC}"
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

# Directories (excluding skills, handled separately)
dir_count=0
for d in agents commands contexts rules stacks hooks scripts; do
  if [ -d "$SCRIPT_DIR/$d" ]; then
    mkdir -p "$CLAUDE_HOME/$d"
    cp -r "$SCRIPT_DIR/$d/." "$CLAUDE_HOME/$d/"
    dir_count=$((dir_count + 1))
  fi
done
echo -e "${GRAY}  Directories: $dir_count synced${NC}"

# Skills: full copy, preserve learned/
if [ -d "$SCRIPT_DIR/skills" ]; then
  mkdir -p "$CLAUDE_HOME/skills"
  skill_count=0
  for skill_dir in "$SCRIPT_DIR"/skills/*/; do
    skill_name=$(basename "$skill_dir")
    [ "$skill_name" = "learned" ] && continue
    cp -r "$skill_dir" "$CLAUDE_HOME/skills/"
    skill_count=$((skill_count + 1))
  done
  echo -e "${GRAY}  Skills: $skill_count copied (learned/ preserved)${NC}"
fi

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
    "$CLAUDE_HOME/hooks/hooks.json.template" > "$CLAUDE_HOME/hooks/hooks.json"
  echo -e "${GRAY}  hooks.json: generated${NC}"
fi

echo -e "${GREEN}  Templates applied${NC}"

# --- Step 4: Verify installation ---
echo -e "${YELLOW}[4/5] Verifying...${NC}"

VERIFY_SCRIPT="$CLAUDE_HOME/scripts/verify.sh"
if [ -f "$VERIFY_SCRIPT" ]; then
  chmod +x "$VERIFY_SCRIPT"
  CLAUDE_HOME="$CLAUDE_HOME" bash "$VERIFY_SCRIPT"
else
  echo -e "${YELLOW}  verify.sh not found, running basic checks...${NC}"
  for f in CLAUDE.md settings.json .mcp.json; do
    if [ -f "$CLAUDE_HOME/$f" ]; then
      echo -e "${GREEN}  $f: OK${NC}"
    else
      echo -e "${RED}  $f: MISSING${NC}"
    fi
  done
fi

# --- Step 5: Done ---
echo ""
echo -e "${GREEN}[5/5] Done!${NC}"
echo ""
echo -e "${CYAN}  Location: $CLAUDE_HOME${NC}"
skill_total=$(ls -d "$CLAUDE_HOME/skills"/*/ 2>/dev/null | grep -v learned | wc -l)
echo -e "${CYAN}  Skills:   $skill_total installed${NC}"
echo ""
echo -e "${CYAN}  Next steps:${NC}"
echo -e "${GRAY}    1. Open Claude Code and start coding${NC}"
echo -e "${GRAY}    2. Use /plan, /tdd, /code-review commands${NC}"
echo ""
