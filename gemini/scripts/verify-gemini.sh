#!/usr/bin/env bash
set -euo pipefail

GEMINI_HOME="${GEMINI_HOME:-$HOME/.gemini}"

test -f "$GEMINI_HOME/GEMINI.md"
test -f "$GEMINI_HOME/settings.json"
test -d "$GEMINI_HOME/forge"
test -d "$GEMINI_HOME/skills/learned"
test -d "$GEMINI_HOME/projects"
echo "PASS gemini verification"
