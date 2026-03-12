#!/usr/bin/env bash
set -e
node "$(cd "$(dirname "$0")" && pwd)/codex-learning.js" ensure "$@"
