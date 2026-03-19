$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
. (Join-Path $RepoRoot "scripts\lib\powershell-utf8.ps1")
Initialize-ForgeEncoding
$env:FORGE_AGENT_HOME = if ($env:FORGE_AGENT_HOME) { $env:FORGE_AGENT_HOME } else { Join-Path $HOME ".gemini" }
node (Join-Path (Resolve-Path "$PSScriptRoot\..\..\scripts\codex-learning").Path "codex-learning.js") learn $args
