$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $env:CODEX_CONFIG) {
    $env:CODEX_CONFIG = Join-Path $HOME ".codex\\config.toml"
}
python (Join-Path $ScriptDir "test-codex-mcp.py")
