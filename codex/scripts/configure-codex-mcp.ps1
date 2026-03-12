$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$argsList = @("--install-uv")

if ($IsMacOS) {
    $argsList += "--with-pencil"
}

if ($env:FORGE_CODEX_EXA_KEY) {
    $argsList += @("--with-exa", "--exa-key", $env:FORGE_CODEX_EXA_KEY)
}

python (Join-Path $ScriptDir "configure-codex-mcp.py") @argsList @args
