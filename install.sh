#!/bin/bash
# ============================================
# Forge - Claude Code Configuration Framework
# Universal Installation Script (macOS/Linux)
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_HOME="$HOME/.claude"
BACKUP_DIR="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"

# Default settings
LANG="zh"  # zh or en
INSTALL_MODE="incremental"  # incremental or full

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m'

# ============================================
# Language Support
# ============================================

declare -A MSG_EN=(
  [title]="Forge - Claude Code Configuration Framework"
  [select_lang]="Select language / 选择语言:"
  [select_mode]="Select installation mode:"
  [mode_incremental]="Incremental (preserve existing files)"
  [mode_full]="Full (overwrite all files)"
  [checking_deps]="Checking dependencies"
  [backup_prompt]="Existing configuration found. Create backup?"
  [backup_created]="Backup created"
  [backup_skipped]="Backup skipped"
  [installing_files]="Installing files"
  [configuring_templates]="Configuring templates"
  [configuring_mcp]="Configuring MCP servers"
  [enter_exa_key]="Enter your Exa API key (or press Enter to skip):"
  [installing_uvx]="Installing uvx (uv package manager)..."
  [adding_mcp]="Adding MCP servers..."
  [verifying]="Verifying installation"
  [complete]="Installation Complete!"
  [location]="Location"
  [skills]="Skills"
  [next_steps]="Next steps:"
  [step1]="1. Restart Claude Code"
  [step2]="2. Test WebSearch and other MCP tools"
  [step3]="3. Use /plan, /tdd, /code-review commands"
  [error_git]="Error: git is required but not installed"
  [warning_node]="Warning: Node.js not found (hooks will not work)"
  [warning_claude]="Warning: Claude CLI not found (MCP configuration will be skipped)"
  [warning_uvx]="Warning: uvx not found (will be installed if needed)"
  [success]="✓"
  [error]="✗"
  [warning]="⚠"
)

declare -A MSG_ZH=(
  [title]="Forge - Claude Code 配置框架"
  [select_lang]="Select language / 选择语言:"
  [select_mode]="选择安装模式:"
  [mode_incremental]="增量模式（保留现有文件）"
  [mode_full]="完整模式（覆盖所有文件）"
  [checking_deps]="检查依赖"
  [backup_prompt]="发现现有配置。是否创建备份？"
  [backup_created]="备份已创建"
  [backup_skipped]="跳过备份"
  [installing_files]="安装文件"
  [configuring_templates]="配置模板"
  [configuring_mcp]="配置 MCP 服务器"
  [enter_exa_key]="输入你的 Exa API key（或按 Enter 跳过）:"
  [installing_uvx]="正在安装 uvx (uv 包管理器)..."
  [adding_mcp]="添加 MCP 服务器..."
  [verifying]="验证安装"
  [complete]="安装完成！"
  [location]="位置"
  [skills]="Skills"
  [next_steps]="下一步:"
  [step1]="1. 重启 Claude Code"
  [step2]="2. 测试 WebSearch 等 MCP 工具"
  [step3]="3. 使用 /plan, /tdd, /code-review 命令"
  [error_git]="错误: 需要 git 但未安装"
  [warning_node]="警告: 未找到 Node.js（hooks 将无法工作）"
  [warning_claude]="警告: 未找到 Claude CLI（将跳过 MCP 配置）"
  [warning_uvx]="警告: 未找到 uvx（需要时将自动安装）"
  [success]="✓"
  [error]="✗"
  [warning]="⚠"
)

# Get message based on current language
msg() {
  local key=$1
  if [ "$LANG" = "zh" ]; then
    echo "${MSG_ZH[$key]}"
  else
    echo "${MSG_EN[$key]}"
  fi
}

# ============================================
# Helper Functions
# ============================================

log_info() {
  echo -e "${CYAN}$1${NC}"
}

log_success() {
  echo -e "${GREEN}$(msg success) $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}$(msg warning) $1${NC}"
}

log_error() {
  echo -e "${RED}$(msg error) $1${NC}"
}

log_step() {
  echo -e "${YELLOW}[$1/6] $2${NC}"
}

# ============================================
# Interactive Setup
# ============================================

select_language() {
  echo ""
  log_info "$(msg select_lang)"
  echo "  1) English"
  echo "  2) 简体中文"
  echo ""
  read -p "Choice (1-2): " lang_choice

  case $lang_choice in
    2) LANG="zh" ;;
    *) LANG="en" ;;
  esac

  echo ""
}

select_install_mode() {
  log_info "$(msg select_mode)"
  echo "  1) $(msg mode_incremental)"
  echo "  2) $(msg mode_full)"
  echo ""
  read -p "Choice (1-2): " mode_choice

  case $mode_choice in
    2) INSTALL_MODE="full" ;;
    *) INSTALL_MODE="incremental" ;;
  esac

  echo ""
}

# ============================================
# Dependency Checks
# ============================================

check_dependencies() {
  log_step 1 6 "$(msg checking_deps)"

  # Git
  if ! command -v git &> /dev/null; then
    log_error "$(msg error_git)"
    exit 1
  fi
  log_success "git: $(git --version | head -1)"

  # Node.js
  if ! command -v node &> /dev/null; then
    log_warning "$(msg warning_node)"
  else
    log_success "node: $(node --version)"
  fi

  # Claude CLI
  if ! command -v claude &> /dev/null; then
    log_warning "$(msg warning_claude)"
    CLAUDE_CLI_AVAILABLE=false
  else
    log_success "claude: $(claude --version 2>&1 | head -1 || echo 'installed')"
    CLAUDE_CLI_AVAILABLE=true
  fi

  # uvx
  if ! command -v uvx &> /dev/null; then
    log_warning "$(msg warning_uvx)"
    UVX_AVAILABLE=false
  else
    log_success "uvx: $(uvx --version | head -1)"
    UVX_AVAILABLE=true
  fi

  echo ""
}

# ============================================
# Backup Existing Configuration
# ============================================

backup_existing() {
  if [ -d "$CLAUDE_HOME" ]; then
    log_step 2 6 "$(msg backup_prompt)"

    echo -e "${YELLOW}(y/n)${NC}"
    read -r response

    if [[ "$response" =~ ^[Yy]$ ]]; then
      mkdir -p "$BACKUP_DIR"
      cp -r "$CLAUDE_HOME/." "$BACKUP_DIR/"
      log_success "$(msg backup_created): $BACKUP_DIR"
    else
      log_success "$(msg backup_skipped)"
    fi
    echo ""
  fi
}

# ============================================
# Install Files
# ============================================

install_files() {
  log_step 3 6 "$(msg installing_files) ($INSTALL_MODE)"

  mkdir -p "$CLAUDE_HOME"

  # Core documentation
  local doc_count=0
  for f in CLAUDE.md CAPABILITIES.md USAGE-GUIDE.md AGENTS.md GUIDE.md; do
    if [ -f "$SCRIPT_DIR/$f" ]; then
      cp "$SCRIPT_DIR/$f" "$CLAUDE_HOME/$f"
      doc_count=$((doc_count + 1))
    fi
  done
  log_success "Documentation: $doc_count files"

  # Directories
  local dir_count=0
  for d in agents commands contexts rules stacks hooks scripts; do
    if [ -d "$SCRIPT_DIR/$d" ]; then
      mkdir -p "$CLAUDE_HOME/$d"

      if [ "$INSTALL_MODE" = "full" ]; then
        # Full mode: overwrite everything
        rm -rf "$CLAUDE_HOME/$d"
        cp -r "$SCRIPT_DIR/$d" "$CLAUDE_HOME/$d"
      else
        # Incremental mode: preserve existing
        rsync -a --ignore-existing "$SCRIPT_DIR/$d/" "$CLAUDE_HOME/$d/" 2>/dev/null || \
          cp -rn "$SCRIPT_DIR/$d/." "$CLAUDE_HOME/$d/" 2>/dev/null || true
      fi
      dir_count=$((dir_count + 1))
    fi
  done
  log_success "Directories: $dir_count synced"

  # Skills
  if [ -d "$SCRIPT_DIR/skills" ]; then
    mkdir -p "$CLAUDE_HOME/skills"
    local skill_count=0

    for skill_dir in "$SCRIPT_DIR"/skills/*/; do
      local skill_name=$(basename "$skill_dir")
      [ "$skill_name" = "learned" ] && continue

      if [ "$INSTALL_MODE" = "full" ] || [ ! -d "$CLAUDE_HOME/skills/$skill_name" ]; then
        rm -rf "$CLAUDE_HOME/skills/$skill_name" 2>/dev/null || true
        cp -r "$skill_dir" "$CLAUDE_HOME/skills/$skill_name"
        skill_count=$((skill_count + 1))
      fi
    done

    if [ "$INSTALL_MODE" = "incremental" ]; then
      log_success "Skills: $skill_count new skills added"
    else
      log_success "Skills: $skill_count skills installed"
    fi
  fi

  # Runtime directories
  for dir in \
    "$CLAUDE_HOME/homunculus/instincts/personal" \
    "$CLAUDE_HOME/homunculus/instincts/inherited" \
    "$CLAUDE_HOME/sessions"; do
    mkdir -p "$dir"
    [ ! -f "$dir/.gitkeep" ] && touch "$dir/.gitkeep"
  done

  echo ""
}

# ============================================
# Configure Templates
# ============================================

configure_templates() {
  log_step 4 6 "$(msg configuring_templates)"

  # settings.json
  if [ -f "$SCRIPT_DIR/settings.json.template" ]; then
    cp "$SCRIPT_DIR/settings.json.template" "$CLAUDE_HOME/settings.json.template"

    if [ "$INSTALL_MODE" = "full" ] || [ ! -f "$CLAUDE_HOME/settings.json" ]; then
      cp "$SCRIPT_DIR/settings.json.template" "$CLAUDE_HOME/settings.json"
      log_success "settings.json: created"
    else
      log_success "settings.json: preserved"
    fi
  fi

  # hooks.json
  if [ -f "$CLAUDE_HOME/hooks/hooks.json.template" ]; then
    local escaped_home=$(echo "$CLAUDE_HOME" | sed 's/\//\\\//g')
    sed "s/{{CLAUDE_HOME}}/$escaped_home/g" \
      "$CLAUDE_HOME/hooks/hooks.json.template" > "$CLAUDE_HOME/hooks/hooks.json"
    log_success "hooks.json: generated"
  fi

  echo ""
}

# ============================================
# Configure MCP Servers
# ============================================

install_uvx() {
  if [ "$UVX_AVAILABLE" = true ]; then
    return 0
  fi

  log_info "$(msg installing_uvx)"
  curl -LsSf https://astral.sh/uv/install.sh | sh

  export PATH="$HOME/.local/bin:$PATH"

  local shell_rc=""
  if [ -f ~/.zshrc ]; then
    shell_rc=~/.zshrc
  elif [ -f ~/.bashrc ]; then
    shell_rc=~/.bashrc
  fi

  if [ -n "$shell_rc" ] && ! grep -q '.local/bin' "$shell_rc"; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$shell_rc"
  fi

  log_success "uvx installed"
}

configure_mcp() {
  log_step 5 6 "$(msg configuring_mcp)"

  if [ "$CLAUDE_CLI_AVAILABLE" = false ]; then
    log_warning "$(msg warning_claude)"
    echo ""
    return
  fi

  # Prompt for Exa API key
  echo -e "${YELLOW}$(msg enter_exa_key)${NC}"
  read -r EXA_KEY

  # Install uvx if needed
  if [ "$UVX_AVAILABLE" = false ]; then
    install_uvx
  fi

  # Switch to home directory
  cd ~

  log_info "$(msg adding_mcp)"

  # exa
  if [ -n "$EXA_KEY" ]; then
    claude mcp remove exa 2>/dev/null || true
    claude mcp add exa -e EXA_API_KEY="$EXA_KEY" -- npx -y exa-mcp-server
    log_success "exa"
  fi

  # sequential-thinking
  claude mcp remove sequential-thinking 2>/dev/null || true
  claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
  log_success "sequential-thinking"

  # memory
  claude mcp remove memory 2>/dev/null || true
  claude mcp add memory -- npx -y @modelcontextprotocol/server-memory
  log_success "memory"

  # deepwiki
  claude mcp remove deepwiki 2>/dev/null || true
  claude mcp add deepwiki -- npx -y deepwiki-mcp
  log_success "deepwiki"

  # playwright
  claude mcp remove playwright 2>/dev/null || true
  claude mcp add playwright -- npx -y @executeautomation/playwright-mcp-server
  log_success "playwright"

  # fetch
  claude mcp remove fetch 2>/dev/null || true
  claude mcp add fetch -- uvx mcp-server-fetch
  log_success "fetch"

  cd "$SCRIPT_DIR"
  echo ""
}

# ============================================
# Verification
# ============================================

verify_installation() {
  log_step 6 6 "$(msg verifying)"

  local errors=0

  # Check core files
  for f in CLAUDE.md settings.json; do
    if [ -f "$CLAUDE_HOME/$f" ]; then
      log_success "$f"
    else
      log_error "$f: missing"
      errors=$((errors + 1))
    fi
  done

  # Check directories
  for d in agents commands skills; do
    if [ -d "$CLAUDE_HOME/$d" ]; then
      local count=$(ls -1 "$CLAUDE_HOME/$d" 2>/dev/null | wc -l)
      log_success "$d/: $count items"
    else
      log_error "$d/: missing"
      errors=$((errors + 1))
    fi
  done

  echo ""

  if [ $errors -eq 0 ]; then
    log_success "$(msg verifying): OK"
  else
    log_error "$(msg verifying): $errors errors"
  fi

  echo ""
}

# ============================================
# Main Installation Flow
# ============================================

main() {
  # Interactive setup
  select_language
  select_install_mode

  # Display header
  echo ""
  log_info "======================================="
  log_info "  $(msg title)"
  log_info "======================================="
  echo ""

  # Run installation
  check_dependencies
  backup_existing
  install_files
  configure_templates
  configure_mcp
  verify_installation

  # Summary
  log_info "======================================="
  log_info "  $(msg complete)"
  log_info "======================================="
  echo ""
  log_info "$(msg location): $CLAUDE_HOME"

  local skill_total=$(ls -d "$CLAUDE_HOME/skills"/*/ 2>/dev/null | grep -v learned | wc -l)
  log_info "$(msg skills): $skill_total"
  echo ""

  log_info "$(msg next_steps)"
  echo -e "${GRAY}  $(msg step1)${NC}"
  echo -e "${GRAY}  $(msg step2)${NC}"
  echo -e "${GRAY}  $(msg step3)${NC}"
  echo ""

  if [ -n "$BACKUP_DIR" ] && [ -d "$BACKUP_DIR" ]; then
    log_info "Backup: $BACKUP_DIR"
    echo ""
  fi
}

# Run installation
main
