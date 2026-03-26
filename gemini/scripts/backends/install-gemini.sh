#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_DIR="$(cd "$BACKEND_DIR/../.." && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
GEMINI_HOME="${GEMINI_HOME:-$HOME/.gemini}"
FORGE_HOME="$GEMINI_HOME/forge"
COMPONENTS="${FORGE_COMPONENTS:-mcp,skills,memory}"
MCP_SERVERS="${FORGE_MCP_SERVERS:-}"
SKILLS_LIST="${FORGE_SKILLS:-}"

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

mkdir -p "$FORGE_HOME" "$GEMINI_HOME/skills/learned" "$GEMINI_HOME/projects"

for f in CLAUDE.md CAPABILITIES.md USAGE-GUIDE.md AGENTS.md GUIDE.md; do
  [ -f "$ROOT_DIR/$f" ] && cp "$ROOT_DIR/$f" "$FORGE_HOME/$f"
done

for d in agents commands contexts core roles rules stacks hooks scripts; do
  [ -d "$ROOT_DIR/$d" ] || continue
  mkdir -p "$FORGE_HOME/$d"
  rsync -a "$ROOT_DIR/$d/" "$FORGE_HOME/$d/"
done

if has_component "skills"; then
  mkdir -p "$GEMINI_HOME/skills"
  if command -v node >/dev/null 2>&1 && [ -f "$ROOT_DIR/scripts/sync-runtime-skills.cjs" ]; then
    sync_args=("$ROOT_DIR/scripts/sync-runtime-skills.cjs" "$ROOT_DIR" "$GEMINI_HOME/skills" "--mode" "full")
    if [ -n "$SKILLS_LIST" ]; then
      sync_args+=("--selected" "$SKILLS_LIST")
    fi
    node "${sync_args[@]}" >/dev/null
  else
    for skill_dir in "$ROOT_DIR"/skills/*/; do
      [ -d "$skill_dir" ] || continue
      name="$(basename "$skill_dir")"
      [ "$name" = "learned" ] && continue
      has_selected_skill "$name" || continue
      rm -rf "$GEMINI_HOME/skills/$name" 2>/dev/null || true
      cp -R "$skill_dir" "$GEMINI_HOME/skills/$name"
    done
  fi
fi

mkdir -p "$FORGE_HOME/gemini"
rsync -a "$SCRIPT_DIR/scripts/" "$FORGE_HOME/gemini/" 2>/dev/null || cp -R "$SCRIPT_DIR/scripts/." "$FORGE_HOME/gemini/"

escaped_home=$(printf '%s' "$GEMINI_HOME" | sed 's/[\/&]/\\&/g')
sed -e "s/{{GEMINI_HOME}}/$escaped_home/g" "$SCRIPT_DIR/GEMINI.md.template" > "$GEMINI_HOME/GEMINI.md"

if has_component "memory"; then
  FORGE_AGENT_HOME="$GEMINI_HOME" bash "$SCRIPT_DIR/scripts/ensure.sh" --cwd "$ROOT_DIR"
fi

if has_component "mcp"; then
  mcp_args=()
  if [ -n "$MCP_SERVERS" ]; then
    mcp_args+=(--servers "$MCP_SERVERS")
  fi
  FORGE_GEMINI_EXA_KEY="${FORGE_GEMINI_EXA_KEY:-}" bash "$SCRIPT_DIR/scripts/configure-gemini-mcp.sh" "${mcp_args[@]}"
fi
bash "$SCRIPT_DIR/scripts/verify-gemini.sh"
