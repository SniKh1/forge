$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ScriptsRoot = Split-Path -Parent $ScriptDir
. (Join-Path $ScriptsRoot "lib\powershell-utf8.ps1")
Initialize-ForgeEncoding
node (Join-Path $ScriptDir "codex-learning.js") status $args
