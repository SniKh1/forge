$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
. (Join-Path $RepoRoot "scripts\lib\powershell-utf8.ps1")
Initialize-ForgeEncoding
python (Join-Path $ScriptDir "test-gemini-mcp.py")
