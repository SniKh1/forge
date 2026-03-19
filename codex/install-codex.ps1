param(
    [switch]$NonInteractive,
    [ValidateSet('zh', 'en')][string]$LangOverride,
    [ValidateSet('incremental', 'full')][string]$InstallModeOverride,
    [switch]$SkipBackup
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
. (Join-Path $RootDir 'scripts\lib\powershell-utf8.ps1')
Initialize-ForgeEncoding
$Cli = Join-Path $RootDir 'packages/forge-cli/bin/forge.js'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host 'Forge compatibility entrypoint: codex/install-codex.ps1' -ForegroundColor Yellow
    Write-Host 'Node.js 18+ is required. Install Node.js and rerun, or use the desktop installer.' -ForegroundColor Red
    exit 1
}

Write-Host 'Forge compatibility entrypoint: codex/install-codex.ps1' -ForegroundColor Yellow
Write-Host 'Delegating to: forge install codex' -ForegroundColor Cyan

$argsList = @('install', 'codex')
if ($NonInteractive -or $env:FORGE_NONINTERACTIVE -eq '1') { $argsList += '--non-interactive' }
if ($LangOverride) { $argsList += @('--lang', $LangOverride) }
elseif ($env:FORGE_LANG) { $argsList += @('--lang', $env:FORGE_LANG) }
if ($InstallModeOverride) { $argsList += @('--install-mode', $InstallModeOverride) }
elseif ($env:FORGE_INSTALL_MODE) { $argsList += @('--install-mode', $env:FORGE_INSTALL_MODE) }
if ($SkipBackup -or $env:FORGE_SKIP_BACKUP -eq '1') { $argsList += '--skip-backup' }
if ($env:FORGE_CODEX_EXA_KEY) { $argsList += @('--exa-api-key', $env:FORGE_CODEX_EXA_KEY) }

& node $Cli @argsList
