$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ScriptDir = Split-Path -Parent (Split-Path -Parent $BackendDir)
$RootDir = Split-Path -Parent $ScriptDir
. (Join-Path $RootDir "scripts\lib\powershell-utf8.ps1")
Initialize-ForgeEncoding
$GeminiHome = if ($env:GEMINI_HOME) { $env:GEMINI_HOME } else { Join-Path $HOME ".gemini" }
$ForgeHome = Join-Path $GeminiHome "forge"
$Components = if ($env:FORGE_COMPONENTS) { $env:FORGE_COMPONENTS.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ } } else { @("mcp", "skills", "memory") }
$McpServers = if ($env:FORGE_MCP_SERVERS) { $env:FORGE_MCP_SERVERS.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ } } else { @() }
$SelectedSkills = if ($env:FORGE_SKILLS) { $env:FORGE_SKILLS.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ } } else { @() }
$SkillSyncMode = if ($env:FORGE_SKILL_SYNC_MODE) { $env:FORGE_SKILL_SYNC_MODE } else { "selected" }

function Has-Component([string]$name) {
    return $Components -contains $name
}

function Has-SelectedSkill([string]$name) {
    if ($SkillSyncMode -eq "full-library") { return $true }
    if ($SelectedSkills.Count -eq 0) { return $true }
    return $SelectedSkills -contains $name
}

New-Item -ItemType Directory -Path $ForgeHome -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $GeminiHome "skills\\learned") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $GeminiHome "projects") -Force | Out-Null

@("CLAUDE.md", "CAPABILITIES.md", "USAGE-GUIDE.md", "AGENTS.md", "GUIDE.md") | ForEach-Object {
    $src = Join-Path $RootDir $_
    if (Test-Path $src) {
        Copy-Item $src -Destination (Join-Path $ForgeHome $_) -Force
    }
}

@("agents", "commands", "contexts", "core", "roles", "rules", "stacks", "hooks", "scripts") | ForEach-Object {
    $src = Join-Path $RootDir $_
    $dst = Join-Path $ForgeHome $_
    if (Test-Path $src) {
        New-Item -ItemType Directory -Path $dst -Force | Out-Null
        Copy-Item "$src\\*" -Destination $dst -Recurse -Force
    }
}

$GeminiScriptsHome = Join-Path $ForgeHome "gemini"
New-Item -ItemType Directory -Path $GeminiScriptsHome -Force | Out-Null
Copy-Item (Join-Path $ScriptDir "scripts\*") -Destination $GeminiScriptsHome -Recurse -Force

if (Has-Component "skills") {
    New-Item -ItemType Directory -Path (Join-Path $GeminiHome "skills") -Force | Out-Null
    $syncScript = Join-Path $RootDir "scripts\sync-runtime-skills.cjs"
    if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path $syncScript)) {
        $syncArgs = @($syncScript, $RootDir, (Join-Path $GeminiHome "skills"), "--mode", "full", "--selection-mode", $SkillSyncMode)
        if ($SkillSyncMode -ne "full-library" -and $env:FORGE_SKILLS) { $syncArgs += @("--selected", $env:FORGE_SKILLS) }
        & node @syncArgs | Out-Null
    } else {
        Get-ChildItem -Path (Join-Path $RootDir "skills") -Directory | Where-Object { $_.Name -ne "learned" -and -not $_.Name.StartsWith('.') } | ForEach-Object {
            if (-not (Has-SelectedSkill $_.Name)) { return }
            $dst = Join-Path (Join-Path $GeminiHome "skills") $_.Name
            if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
            Copy-Item $_.FullName -Destination $dst -Recurse -Force
        }
    }
}

$template = Read-Utf8File (Join-Path $ScriptDir "GEMINI.md.template")
$template = $template -replace '\{\{GEMINI_HOME\}\}', ($GeminiHome -replace '\\', '/')
Write-Utf8File (Join-Path $GeminiHome "GEMINI.md") $template

if (Has-Component "memory") {
    & (Join-Path $ScriptDir "scripts\ensure.ps1") --cwd $RootDir
}
if (Has-Component "mcp") {
    $argsList = @()
    if ($McpServers.Count -gt 0) {
        $argsList += @("--servers", ($McpServers -join ","))
    }
    & (Join-Path $ScriptDir "scripts\\configure-gemini-mcp.ps1") @argsList
}
& (Join-Path $ScriptDir "scripts\\verify-gemini.ps1")
