$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$Cli = Join-Path $RootDir 'packages/forge-cli/bin/forge.js'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host 'Forge compatibility entrypoint: gemini/install-gemini.ps1' -ForegroundColor Yellow
    Write-Host 'Node.js 18+ is required. Install Node.js and rerun, or use the desktop installer.' -ForegroundColor Red
    exit 1
}

Write-Host 'Forge compatibility entrypoint: gemini/install-gemini.ps1' -ForegroundColor Yellow
Write-Host 'Delegating to: forge install gemini' -ForegroundColor Cyan

$argsList = @('install', 'gemini')
if ($env:FORGE_NONINTERACTIVE -eq '1') { $argsList += '--non-interactive' }
if ($env:FORGE_LANG) { $argsList += @('--lang', $env:FORGE_LANG) }
if ($env:FORGE_INSTALL_MODE) { $argsList += @('--install-mode', $env:FORGE_INSTALL_MODE) }
if ($env:FORGE_SKIP_BACKUP -eq '1') { $argsList += '--skip-backup' }
if ($env:FORGE_GEMINI_EXA_KEY) { $argsList += @('--exa-api-key', $env:FORGE_GEMINI_EXA_KEY) }

& node $Cli @argsList
