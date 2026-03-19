$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
. (Join-Path $RepoRoot "scripts\lib\powershell-utf8.ps1")
Initialize-ForgeEncoding
if (-not $env:CODEX_CONFIG) {
    $env:CODEX_CONFIG = Join-Path $HOME ".codex\\config.toml"
}
python (Join-Path $ScriptDir "test-codex-mcp.py")
