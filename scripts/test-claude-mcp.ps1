$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $ScriptDir "lib\powershell-utf8.ps1")
Initialize-ForgeEncoding
python (Join-Path $ScriptDir "test-claude-mcp.py")
