#!/usr/bin/env bash

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORT_DIR="$REPO_ROOT/.tmp"
STAMP="$(date +%Y%m%d-%H%M%S)"
REPORT_FILE="$REPORT_DIR/forge-runtime-diagnose-$STAMP.md"

mkdir -p "$REPORT_DIR"
touch "$REPORT_FILE"

WARNINGS=()

line() {
  printf '%s\n' "${1:-}" | tee -a "$REPORT_FILE"
}

blank() {
  printf '\n' | tee -a "$REPORT_FILE" >/dev/null
}

section() {
  blank
  line "## $1"
}

code_block() {
  local language="$1"
  local content="$2"
  line "\`\`\`$language"
  printf '%s\n' "$content" | tee -a "$REPORT_FILE"
  line "\`\`\`"
}

add_warning() {
  WARNINGS+=("$1")
}

run_and_capture() {
  local title="$1"
  shift
  section "$title"
  line "Command: \`$*\`"
  local output
  output="$("$@" 2>&1)"
  local status=$?
  line "Exit code: $status"
  code_block "text" "${output:-<no output>}"
  return 0
}

report_command() {
  local name="$1"
  local version_args="$2"
  local cmd_path
  cmd_path="$(command -v "$name" 2>/dev/null || true)"
  if [[ -z "$cmd_path" ]]; then
    line "- $name: missing"
    return 1
  fi

  local version
  version="$("$cmd_path" $version_args 2>/dev/null | head -n 1)"
  line "- $name: $cmd_path${version:+ ($version)}"
  return 0
}

check_path() {
  local target="$1"
  local kind="$2"
  if [[ "$kind" == "file" && -f "$target" ]]; then
    line "- $target: present"
    return 0
  fi
  if [[ "$kind" == "dir" && -d "$target" ]]; then
    line "- $target: present"
    return 0
  fi
  line "- $target: missing"
  return 1
}

path_has_segment() {
  local whole_path="$1"
  local segment="$2"
  [[ ":$whole_path:" == *":$segment:"* ]]
}

summarize_node_risk() {
  local node_path="$1"
  local launchctl_path="$2"

  if [[ -z "$node_path" ]]; then
    add_warning "Node.js is missing. Forge Desktop currently needs Node.js 18+ at runtime to read status, install, verify, and repair."
    return
  fi

  local node_dir
  node_dir="$(dirname "$node_path")"
  if [[ "$node_path" == *"/.nvm/"* || "$node_path" == *"/.fnm/"* || "$node_path" == *"/.asdf/"* || "$node_path" == *"/.volta/"* ]]; then
    add_warning "Node.js comes from a shell-managed path ($node_path). GUI apps often do not inherit this PATH on macOS."
  fi

  if [[ -n "$launchctl_path" ]] && ! path_has_segment "$launchctl_path" "$node_dir"; then
    add_warning "launchctl PATH does not include the node directory ($node_dir). Forge.app may fail to find node even if Terminal can."
  fi
}

line "# Forge Runtime Diagnostic Report"
line
line "- Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')"
line "- Repo root: $REPO_ROOT"
line "- Report file: $REPORT_FILE"

section "System"
line "- OS: $(uname -srmo 2>/dev/null || uname -a)"
line "- User: $(id -un 2>/dev/null || printf 'unknown')"
line "- Shell: ${SHELL:-unknown}"
line "- Home: $HOME"
line "- Working directory: $(pwd)"

section "Process Environment"
line "- PATH:"
code_block "text" "${PATH:-<empty>}"

LAUNCHCTL_PATH=""
if [[ "$(uname -s)" == "Darwin" ]] && command -v launchctl >/dev/null 2>&1; then
  LAUNCHCTL_PATH="$(launchctl getenv PATH 2>/dev/null || true)"
  line "- launchctl PATH:"
  code_block "text" "${LAUNCHCTL_PATH:-<empty>}"
fi

section "Command Availability"
report_command node "--version" || true
report_command git "--version" || true
report_command python "--version" || true
report_command python3 "--version" || true
report_command codex "--version" || true
report_command claude "--version" || true
report_command gemini "--version" || true

NODE_PATH="$(command -v node 2>/dev/null || true)"
summarize_node_risk "$NODE_PATH" "$LAUNCHCTL_PATH"

section "Client Homes"
check_path "$HOME/.codex" "dir" || add_warning "~/.codex is missing."
check_path "$HOME/.codex/AGENTS.md" "file" || add_warning "~/.codex/AGENTS.md is missing."
check_path "$HOME/.codex/forge" "dir" || add_warning "~/.codex/forge is missing."
check_path "$HOME/.claude" "dir" || true
check_path "$HOME/.claude/CLAUDE.md" "file" || true
check_path "$HOME/.gemini" "dir" || true
check_path "$HOME/.gemini/GEMINI.md" "file" || true

section "Installed Forge Desktop"
FOUND_APP=0
for app_path in "/Applications/Forge.app" "$HOME/Applications/Forge.app"; do
  if [[ -d "$app_path" ]]; then
    FOUND_APP=1
    line "- App bundle: $app_path"
    check_path "$app_path/Contents/MacOS/Forge" "file" || true
    check_path "$app_path/Contents/Resources/packages/forge-cli/bin/forge.js" "file" || add_warning "Forge.app exists but the bundled CLI resource is missing."
  fi
done
if [[ "$FOUND_APP" -eq 0 ]]; then
  line "- Forge.app not found in /Applications or ~/Applications"
fi

if [[ -n "$NODE_PATH" && -f "$REPO_ROOT/packages/forge-cli/bin/forge.js" ]]; then
  run_and_capture "Forge CLI doctor" node "$REPO_ROOT/packages/forge-cli/bin/forge.js" doctor --client claude,codex,gemini --json
  DOCTOR_OUTPUT="$(node "$REPO_ROOT/packages/forge-cli/bin/forge.js" doctor --client claude,codex,gemini --json 2>&1)"
  DOCTOR_STATUS=$?
  if [[ "$DOCTOR_STATUS" -ne 0 ]]; then
    add_warning "forge doctor returned a non-zero exit code."
  fi

  run_and_capture "Forge CLI verify" node "$REPO_ROOT/packages/forge-cli/bin/forge.js" verify --client claude,codex,gemini --json
  VERIFY_OUTPUT="$(node "$REPO_ROOT/packages/forge-cli/bin/forge.js" verify --client claude,codex,gemini --json 2>&1)"
  VERIFY_STATUS=$?
  if [[ "$VERIFY_STATUS" -ne 0 ]]; then
    add_warning "forge verify returned a non-zero exit code."
  fi
else
  section "Forge CLI"
  line "- Skipped running forge doctor/verify because node or the local repo CLI entrypoint is missing."
fi

section "Summary"
if [[ "${#WARNINGS[@]}" -eq 0 ]]; then
  line "- No high-confidence runtime blockers were detected."
  line "- If Forge Desktop still cannot read status, compare the GUI environment against this report."
else
  for warning in "${WARNINGS[@]}"; do
    line "- $warning"
  done
fi

blank
line "Diagnostic report saved to: $REPORT_FILE"
