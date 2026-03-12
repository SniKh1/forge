$env:FORGE_AGENT_HOME = if ($env:FORGE_AGENT_HOME) { $env:FORGE_AGENT_HOME } else { Join-Path $HOME ".gemini" }
node (Join-Path (Resolve-Path "$PSScriptRoot\..\..\scripts\codex-learning").Path "codex-learning.js") ensure $args
