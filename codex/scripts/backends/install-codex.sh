#!/bin/bash
# Forge Codex Installer (macOS/Linux)

set -e

BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_DIR="$(cd "$BACKEND_DIR/../.." && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CODEX_HOME="$HOME/.codex"
FORGE_HOME="$CODEX_HOME/forge"
BACKUP_DIR="$HOME/.codex-forge-backup-$(date +%Y%m%d-%H%M%S)"

LANG="zh"
INSTALL_MODE="incremental" # incremental|full
NON_INTERACTIVE="${FORGE_NONINTERACTIVE:-0}"
SKIP_BACKUP="${FORGE_SKIP_BACKUP:-0}"
CONFIGURE_MCP="${FORGE_CONFIGURE_CODEX_MCP:-1}"
COMPONENTS="${FORGE_COMPONENTS:-mcp,skills,memory}"
MCP_SERVERS="${FORGE_MCP_SERVERS:-}"
SKILLS_LIST="${FORGE_SKILLS:-}"

if [ -n "${FORGE_LANG:-}" ]; then
  LANG="$FORGE_LANG"
fi
if [ -n "${FORGE_INSTALL_MODE:-}" ]; then
  INSTALL_MODE="$FORGE_INSTALL_MODE"
fi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m'

log_info() { echo -e "${CYAN}$1${NC}"; }
log_ok() { echo -e "${GREEN}✓ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
log_err() { echo -e "${RED}✗ $1${NC}"; }
step() { echo -e "${YELLOW}[$1/$2] $3${NC}"; }

has_component() {
  case ",$COMPONENTS," in
    *",$1,"*) return 0 ;;
    *) return 1 ;;
  esac
}

has_selected_skill() {
  [ -z "$SKILLS_LIST" ] && return 0
  case ",$SKILLS_LIST," in
    *",$1,"*) return 0 ;;
    *) return 1 ;;
  esac
}

msg() {
  local key="$1"
  if [ "$LANG" = "zh" ]; then
    case "$key" in
      title) echo "Forge - Codex 配置安装" ;;
      checking) echo "检查依赖" ;;
      backup) echo "检测到现有 Codex Forge 配置，是否备份？" ;;
      install) echo "安装 Forge 资产" ;;
      gen) echo "生成 AGENTS.md" ;;
      mcp) echo "配置 Codex MCP" ;;
      verify) echo "验证安装" ;;
      done) echo "安装完成" ;;
      *) echo "$key" ;;
    esac
  else
    case "$key" in
      title) echo "Forge - Codex setup installer" ;;
      checking) echo "Checking dependencies" ;;
      backup) echo "Existing Codex Forge setup found. Create backup?" ;;
      install) echo "Installing Forge assets" ;;
      gen) echo "Generating AGENTS.md" ;;
      mcp) echo "Configure Codex MCP" ;;
      verify) echo "Verifying installation" ;;
      done) echo "Installation complete" ;;
      *) echo "$key" ;;
    esac
  fi
}

select_language() {
  if [ "$NON_INTERACTIVE" = "1" ]; then
    return 0
  fi
  echo ""
  log_info "Select language / 选择语言"
  echo "  1) English"
  echo "  2) 简体中文"
  read -r -p "Choice (1-2): " c
  [ "$c" = "1" ] && LANG="en" || LANG="zh"
}

select_mode() {
  if [ "$NON_INTERACTIVE" = "1" ]; then
    return 0
  fi
  echo ""
  if [ "$LANG" = "zh" ]; then
    log_info "选择安装模式"
    echo "  1) 增量模式（保留已有）"
    echo "  2) 完整模式（覆盖 Forge 文件）"
  else
    log_info "Select install mode"
    echo "  1) Incremental (preserve existing)"
    echo "  2) Full (overwrite Forge files)"
  fi
  read -r -p "Choice (1-2): " c
  [ "$c" = "2" ] && INSTALL_MODE="full" || INSTALL_MODE="incremental"
}

check_deps() {
  step 1 7 "$(msg checking)"
  command -v git >/dev/null 2>&1 || { log_err "git not found"; exit 1; }
  log_ok "git: $(git --version | head -1)"
  if command -v node >/dev/null 2>&1; then
    log_ok "node: $(node --version)"
  else
    log_warn "node not found (skills still installable)"
  fi
  echo ""
}

init_learning_dirs() {
  mkdir -p "$CODEX_HOME/skills/learned"
  mkdir -p "$CODEX_HOME/homunculus/instincts/personal"
  mkdir -p "$CODEX_HOME/homunculus/instincts/inherited"
  mkdir -p "$CODEX_HOME/homunculus/evolved"
}

init_workspace_memory() {
  local workspace_abs workspace_slug project_root memory_dir
  workspace_abs="$(cd "$ROOT_DIR" && pwd)"
  workspace_slug="$(printf '%s' "$workspace_abs" | sed 's#[/:\\]#-#g' | sed 's#--*#-#g' | sed 's#^-##')"
  project_root="$CODEX_HOME/projects/$workspace_slug"
  memory_dir="$project_root/memory"

  mkdir -p "$memory_dir"
  if [ ! -f "$memory_dir/MEMORY.md" ]; then
    cat > "$memory_dir/MEMORY.md" <<EOF
# Workspace Memory

- Workspace: \`$workspace_abs\`
- Updated: $(date +%Y-%m-%d)

## Active Focus

- (fill in current priorities)

## Decisions

- (record key decisions and rationale)

## Risks

- (track unresolved risks)
EOF
  fi

  if [ ! -f "$memory_dir/PROJECT-MEMORY.md" ]; then
    cat > "$memory_dir/PROJECT-MEMORY.md" <<'EOF'
# Project Memory

> Workspace summary and durable knowledge.

## Overview

- Scope:
- Stack:
- Current stage:

## Architecture Notes

-

## Conventions

-

## Known Issues

-
EOF
  fi
}

backup_existing() {
  if [ "$SKIP_BACKUP" = "1" ]; then
    return 0
  fi
  if [ -d "$FORGE_HOME" ] || [ -f "$CODEX_HOME/AGENTS.md" ]; then
    step 2 7 "$(msg backup)"
    if [ "$NON_INTERACTIVE" = "1" ]; then
      mkdir -p "$BACKUP_DIR"
      [ -d "$FORGE_HOME" ] && cp -r "$FORGE_HOME" "$BACKUP_DIR/forge"
      [ -f "$CODEX_HOME/AGENTS.md" ] && cp "$CODEX_HOME/AGENTS.md" "$BACKUP_DIR/AGENTS.md"
      log_ok "Backup: $BACKUP_DIR"
      echo ""
      return 0
    fi
    echo -e "${YELLOW}(y/n)${NC}"
    read -r resp
    if [[ "$resp" =~ ^[Yy]$ ]]; then
      mkdir -p "$BACKUP_DIR"
      [ -d "$FORGE_HOME" ] && cp -r "$FORGE_HOME" "$BACKUP_DIR/forge"
      [ -f "$CODEX_HOME/AGENTS.md" ] && cp "$CODEX_HOME/AGENTS.md" "$BACKUP_DIR/AGENTS.md"
      log_ok "Backup: $BACKUP_DIR"
    else
      log_ok "Backup skipped"
    fi
    echo ""
  fi
}

sync_dir() {
  local src="$1"
  local dst="$2"
  if [ "$INSTALL_MODE" = "full" ]; then
    rm -rf "$dst"
    cp -r "$src" "$dst"
  else
    mkdir -p "$dst"
    rsync -a --ignore-existing "$src/" "$dst/" 2>/dev/null || cp -rn "$src/." "$dst/" 2>/dev/null || true
  fi
}

install_assets() {
  step 3 7 "$(msg install) ($INSTALL_MODE)"
  mkdir -p "$FORGE_HOME" "$CODEX_HOME/skills"
  init_learning_dirs
  mkdir -p "$CODEX_HOME/projects"
  if has_component "memory"; then
    init_workspace_memory
  fi

  # Core docs mirror for policy parity
  for f in CLAUDE.md CAPABILITIES.md USAGE-GUIDE.md AGENTS.md GUIDE.md; do
    if [ -f "$ROOT_DIR/$f" ]; then
      cp "$ROOT_DIR/$f" "$FORGE_HOME/$f"
    fi
  done

  for d in agents commands contexts core roles rules stacks hooks scripts; do
    [ -d "$ROOT_DIR/$d" ] && sync_dir "$ROOT_DIR/$d" "$FORGE_HOME/$d"
  done
  log_ok "Playbooks/rules/stacks/hooks/scripts installed"

  local skills=0
  if has_component "skills"; then
    if command -v node >/dev/null 2>&1 && [ -f "$ROOT_DIR/scripts/sync-runtime-skills.cjs" ]; then
      sync_args=("$ROOT_DIR/scripts/sync-runtime-skills.cjs" "$ROOT_DIR" "$CODEX_HOME/skills" "--mode" "$INSTALL_MODE")
      if [ -n "$FORGE_SKILLS" ]; then
        sync_args+=("--selected" "$FORGE_SKILLS")
      fi
      skills=$(node "${sync_args[@]}" | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(String(d.installed||0));')
    else
      for skill_dir in "$ROOT_DIR"/skills/*/; do
        [ -d "$skill_dir" ] || continue
        local name
        name="$(basename "$skill_dir")"
        [ "$name" = "learned" ] && continue
        has_selected_skill "$name" || continue

        if [ "$INSTALL_MODE" = "full" ] || [ ! -d "$CODEX_HOME/skills/$name" ]; then
          rm -rf "$CODEX_HOME/skills/$name" 2>/dev/null || true
          cp -r "$skill_dir" "$CODEX_HOME/skills/$name"
          skills=$((skills + 1))
        fi
      done
    fi
  fi
  if ! has_component "skills"; then
    log_ok "Skills: skipped"
  elif [ "$INSTALL_MODE" = "incremental" ]; then
    log_ok "Skills: $skills new installed"
  else
    log_ok "Skills: $skills installed"
  fi
  echo ""
}

generate_agents() {
  step 4 7 "$(msg gen)"
  mkdir -p "$CODEX_HOME"

  local escaped_codex escaped_forge
  escaped_codex=$(printf '%s' "$CODEX_HOME" | sed 's/[\/&]/\\&/g')
  escaped_forge=$(printf '%s' "$FORGE_HOME" | sed 's/[\/&]/\\&/g')

  sed -e "s/{{CODEX_HOME}}/$escaped_codex/g" -e "s/{{FORGE_HOME}}/$escaped_forge/g" \
    "$SCRIPT_DIR/AGENTS.md.template" > "$CODEX_HOME/AGENTS.md"
  log_ok "$CODEX_HOME/AGENTS.md generated"
  echo ""
}

configure_mcp() {
  step 5 7 "$(msg mcp)"
  if ! has_component "mcp"; then
    log_warn "Codex MCP configuration skipped by component selection"
    echo ""
    return 0
  fi
  if [ "$CONFIGURE_MCP" != "1" ]; then
    log_warn "Codex MCP configuration skipped"
    echo ""
    return 0
  fi
  if ! command -v python3 >/dev/null 2>&1; then
    log_warn "python3 not found; skip Codex MCP configuration"
    echo ""
    return 0
  fi
  local mcp_args=()
  if [ -n "$MCP_SERVERS" ]; then
    mcp_args+=(--servers "$MCP_SERVERS")
  fi
  FORGE_CODEX_EXA_KEY="${FORGE_CODEX_EXA_KEY:-}" bash "$SCRIPT_DIR/scripts/configure-codex-mcp.sh" "${mcp_args[@]}"
  echo ""
}

verify_install() {
  step 6 7 "$(msg verify)"
  local errors=0

  if command -v codex >/dev/null 2>&1; then
    log_ok "codex command"
  else
    log_err "codex command not found in PATH"
    errors=$((errors + 1))
  fi

  for f in \
    "$CODEX_HOME/AGENTS.md" \
    "$FORGE_HOME/CLAUDE.md" \
    "$FORGE_HOME/rules/security.md" \
    "$FORGE_HOME/agents/planner.md"; do
    if [ -f "$f" ]; then
      log_ok "$f"
    else
      log_err "missing: $f"
      errors=$((errors + 1))
    fi
  done

  local skill_total
  skill_total=$(find "$CODEX_HOME/skills" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
  if [ "${skill_total:-0}" -ge 1 ]; then
    log_ok "skills/: $skill_total"
  else
    log_err "skills/: empty"
    errors=$((errors + 1))
  fi

  for d in "$FORGE_HOME/hooks" "$FORGE_HOME/scripts"; do
    if [ -d "$d" ]; then
      log_ok "$d"
    else
      log_err "missing dir: $d"
      errors=$((errors + 1))
    fi
  done

  for d in \
    "$CODEX_HOME/skills/learned" \
    "$CODEX_HOME/homunculus/instincts/personal" \
    "$CODEX_HOME/homunculus/evolved"; do
    if [ -d "$d" ]; then
      log_ok "$d"
    else
      log_err "missing dir: $d"
      errors=$((errors + 1))
    fi
  done

  if [ -f "$FORGE_HOME/scripts/codex-learning/codex-learning.js" ]; then
    log_ok "$FORGE_HOME/scripts/codex-learning/codex-learning.js"
  else
    log_err "missing: $FORGE_HOME/scripts/codex-learning/codex-learning.js"
    errors=$((errors + 1))
  fi

  echo ""
  if [ "$errors" -eq 0 ]; then
    log_ok "Verification: OK"
  else
    log_err "Verification failed: $errors error(s)"
    exit 1
  fi
  echo ""
}

summary() {
  step 7 7 "$(msg done)"
  log_info "Codex home: $CODEX_HOME"
  log_info "Forge home: $FORGE_HOME"
  log_info "Next: restart Codex app/session"
  if [ -d "$BACKUP_DIR" ]; then
    log_info "Backup: $BACKUP_DIR"
  fi
}

main() {
  select_language
  select_mode
  echo ""
  log_info "======================================="
  log_info "  $(msg title)"
  log_info "======================================="
  echo ""

  check_deps
  backup_existing
  install_assets
  generate_agents
  configure_mcp
  verify_install
  summary
}

main
