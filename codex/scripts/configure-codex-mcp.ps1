$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
. (Join-Path $RepoRoot "scripts\lib\powershell-utf8.ps1")
Initialize-ForgeEncoding
$argsList = @("--install-uv")

if ($IsMacOS) {
    $argsList += "--with-pencil"
}

if ($env:FORGE_CODEX_EXA_KEY) {
    $argsList += @("--with-exa", "--exa-key", $env:FORGE_CODEX_EXA_KEY)
}

python (Join-Path $ScriptDir "configure-codex-mcp.py") @argsList @args
