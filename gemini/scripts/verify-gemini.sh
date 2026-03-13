#!/usr/bin/env bash
set -euo pipefail

GEMINI_HOME="${GEMINI_HOME:-$HOME/.gemini}"
FORGE_HOME="$GEMINI_HOME/forge"

test -f "$GEMINI_HOME/GEMINI.md"
test -f "$GEMINI_HOME/settings.json"
test -d "$FORGE_HOME"
test -d "$FORGE_HOME/core"
test -f "$FORGE_HOME/core/skill-registry.json"
test -d "$FORGE_HOME/roles"
test -d "$FORGE_HOME/stacks"
if command -v node >/dev/null 2>&1 && [ -f "$FORGE_HOME/scripts/check-runtime-skill-duplicates.js" ] && [ -d "$GEMINI_HOME/skills" ]; then
  dup_json=$(node "$FORGE_HOME/scripts/check-runtime-skill-duplicates.js" --json --warn-only "$GEMINI_HOME/skills")
  dup_count=$(printf '%s' "$dup_json" | node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(0,"utf8")); process.stdout.write(String(data.duplicateCount||0));')
  if [ "${dup_count:-0}" -gt 0 ]; then
    dup_ids=$(printf '%s' "$dup_json" | node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(0,"utf8")); process.stdout.write((data.duplicates||[]).map((x) => x.id).join(", "));')
    echo "WARN duplicate runtime skills: $dup_ids"
  else
    echo "PASS no duplicate runtime skills"
  fi
fi
test -d "$GEMINI_HOME/skills/learned"
test -d "$GEMINI_HOME/projects"
echo "PASS gemini verification"
