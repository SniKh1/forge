# Forge Codex Installer (Windows)
$ErrorActionPreference = "Stop"
param(
    [switch]$NonInteractive,
    [ValidateSet("zh", "en")][string]$LangOverride,
    [ValidateSet("incremental", "full")][string]$InstallModeOverride,
    [switch]$SkipBackup
)

$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ScriptDir = Split-Path -Parent (Split-Path -Parent $BackendDir)
$RootDir = Split-Path -Parent $ScriptDir
$CodexHome = Join-Path $env:USERPROFILE ".codex"
$ForgeHome = Join-Path $CodexHome "forge"
$BackupDir = Join-Path $env:USERPROFILE (".codex-forge-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))

$Lang = "zh"
$InstallMode = "incremental" # incremental|full
$ConfigureMcp = if ($env:FORGE_CONFIGURE_CODEX_MCP) { $env:FORGE_CONFIGURE_CODEX_MCP } else { "1" }
$Components = if ($env:FORGE_COMPONENTS) { $env:FORGE_COMPONENTS.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ } } else { @("mcp", "skills", "memory") }
$McpServers = if ($env:FORGE_MCP_SERVERS) { $env:FORGE_MCP_SERVERS.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ } } else { @() }
$SelectedSkills = if ($env:FORGE_SKILLS) { $env:FORGE_SKILLS.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ } } else { @() }

if ($LangOverride) { $Lang = $LangOverride }
if ($InstallModeOverride) { $InstallMode = $InstallModeOverride }

function Write-Info([string]$m) { Write-Host $m -ForegroundColor Cyan }
function Write-Ok([string]$m) { Write-Host "✓ $m" -ForegroundColor Green }
function Write-Warn([string]$m) { Write-Host "⚠ $m" -ForegroundColor Yellow }
function Write-Step([int]$i,[int]$n,[string]$m) { Write-Host "[$i/$n] $m" -ForegroundColor Yellow }

function Get-Msg([string]$k) {
    if ($Lang -eq "zh") {
        switch ($k) {
            "title" { "Forge - Codex 配置安装" }
            "checking" { "检查依赖" }
            "backup" { "检测到现有 Codex Forge 配置，是否备份？" }
            "install" { "安装 Forge 资产" }
            "gen" { "生成 AGENTS.md" }
            "mcp" { "配置 Codex MCP" }
            "verify" { "验证安装" }
            "done" { "安装完成" }
            default { $k }
        }
    } else {
        switch ($k) {
            "title" { "Forge - Codex setup installer" }
            "checking" { "Checking dependencies" }
            "backup" { "Existing Codex Forge setup found. Create backup?" }
            "install" { "Installing Forge assets" }
            "gen" { "Generating AGENTS.md" }
            "mcp" { "Configure Codex MCP" }
            "verify" { "Verifying installation" }
            "done" { "Installation complete" }
            default { $k }
        }
    }
}

function Has-Component([string]$name) {
    return $Components -contains $name
}

function Has-SelectedSkill([string]$name) {
    if ($SelectedSkills.Count -eq 0) { return $true }
    return $SelectedSkills -contains $name
}

function Select-Language {
    if ($NonInteractive) { return }
    Write-Host ""
    Write-Info "Select language / 选择语言"
    Write-Host "  1) English"
    Write-Host "  2) 简体中文"
    $c = Read-Host "Choice (1-2)"
    if ($c -eq "1") { $script:Lang = "en" } else { $script:Lang = "zh" }
}

function Select-Mode {
    if ($NonInteractive) { return }
    Write-Host ""
    if ($Lang -eq "zh") {
        Write-Info "选择安装模式"
        Write-Host "  1) 增量模式（保留已有）"
        Write-Host "  2) 完整模式（覆盖 Forge 文件）"
    } else {
        Write-Info "Select install mode"
        Write-Host "  1) Incremental (preserve existing)"
        Write-Host "  2) Full (overwrite Forge files)"
    }
    $c = Read-Host "Choice (1-2)"
    if ($c -eq "2") { $script:InstallMode = "full" } else { $script:InstallMode = "incremental" }
}

function Test-Deps {
    Write-Step 1 7 (Get-Msg "checking")
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "git not found" }
    Write-Ok "git: $(git --version)"

    if (Get-Command node -ErrorAction SilentlyContinue) {
        Write-Ok "node: $(node --version)"
    } else {
        Write-Warn "node not found (skills still installable)"
    }
    Write-Host ""
}

function Initialize-LearningDirs {
    New-Item -ItemType Directory -Path (Join-Path $CodexHome "skills\\learned") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $CodexHome "homunculus\\instincts\\personal") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $CodexHome "homunculus\\instincts\\inherited") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $CodexHome "homunculus\\evolved") -Force | Out-Null
}

function Initialize-WorkspaceMemory {
    $workspaceAbs = (Resolve-Path $RootDir).Path
    $workspaceSlug = ($workspaceAbs -replace '[:\\/]+', '-') -replace '-+', '-'
    if ($workspaceSlug.StartsWith('-')) { $workspaceSlug = $workspaceSlug.Substring(1) }
    $memoryDir = Join-Path $CodexHome "projects\\$workspaceSlug\\memory"

    New-Item -ItemType Directory -Path $memoryDir -Force | Out-Null

    $memoryFile = Join-Path $memoryDir "MEMORY.md"
    if (-not (Test-Path $memoryFile)) {
        @"
# Workspace Memory

- Workspace: `$workspaceAbs`
- Updated: $(Get-Date -Format "yyyy-MM-dd")

## Active Focus

- (fill in current priorities)

## Decisions

- (record key decisions and rationale)

## Risks

- (track unresolved risks)
"@ | Set-Content -Path $memoryFile
    }

    $projectMemoryFile = Join-Path $memoryDir "PROJECT-MEMORY.md"
    if (-not (Test-Path $projectMemoryFile)) {
        @"
# Project Memory

> Workspace summary and durable knowledge.

## Overview

- Scope:
- Stack:
- Current stage:

## Architecture Notes

-

## Conventions

-

## Known Issues

-
"@ | Set-Content -Path $projectMemoryFile
    }
}

function Backup-Existing {
    if ($SkipBackup) { return }
    if ((Test-Path $ForgeHome) -or (Test-Path (Join-Path $CodexHome "AGENTS.md"))) {
        Write-Step 2 7 (Get-Msg "backup")
        if ($NonInteractive) {
            New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
            if (Test-Path $ForgeHome) { Copy-Item $ForgeHome -Destination (Join-Path $BackupDir "forge") -Recurse -Force }
            if (Test-Path (Join-Path $CodexHome "AGENTS.md")) { Copy-Item (Join-Path $CodexHome "AGENTS.md") -Destination $BackupDir -Force }
            Write-Ok "Backup: $BackupDir"
            Write-Host ""
            return
        }
        Write-Host "(y/n)" -ForegroundColor Yellow
        $resp = Read-Host
        if ($resp -match "^[Yy]$") {
            New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
            if (Test-Path $ForgeHome) { Copy-Item $ForgeHome -Destination (Join-Path $BackupDir "forge") -Recurse -Force }
            if (Test-Path (Join-Path $CodexHome "AGENTS.md")) { Copy-Item (Join-Path $CodexHome "AGENTS.md") -Destination $BackupDir -Force }
            Write-Ok "Backup: $BackupDir"
        } else {
            Write-Ok "Backup skipped"
        }
        Write-Host ""
    }
}

function Sync-Dir([string]$src, [string]$dst) {
    if ($InstallMode -eq "full") {
        if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
        Copy-Item $src -Destination $dst -Recurse -Force
    } else {
        if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Path $dst -Force | Out-Null }
        Get-ChildItem -Path $src -Recurse | ForEach-Object {
            $to = $_.FullName.Replace($src, $dst)
            if (-not (Test-Path $to)) {
                $parent = Split-Path $to -Parent
                if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
                Copy-Item $_.FullName -Destination $to -Recurse -Force
            }
        }
    }
}

function Install-Assets {
    Write-Step 3 7 "$(Get-Msg 'install') ($InstallMode)"
    New-Item -ItemType Directory -Path $ForgeHome -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $CodexHome "skills") -Force | Out-Null
    Initialize-LearningDirs
    New-Item -ItemType Directory -Path (Join-Path $CodexHome "projects") -Force | Out-Null
    if (Has-Component "memory") {
        Initialize-WorkspaceMemory
    }

    @("CLAUDE.md", "CAPABILITIES.md", "USAGE-GUIDE.md", "AGENTS.md", "GUIDE.md") | ForEach-Object {
        $srcFile = Join-Path $RootDir $_
        if (Test-Path $srcFile) {
            Copy-Item $srcFile -Destination (Join-Path $ForgeHome $_) -Force
        }
    }

    @("agents","commands","contexts","core","roles","rules","stacks","hooks","scripts") | ForEach-Object {
        $src = Join-Path $RootDir $_
        $dst = Join-Path $ForgeHome $_
        if (Test-Path $src) { Sync-Dir $src $dst }
    }
    Write-Ok "Playbooks/rules/stacks/hooks/scripts installed"

    $skillCount = 0
    if (Has-Component "skills") {
        $syncScript = Join-Path $RootDir "scripts\sync-runtime-skills.js"
        if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path $syncScript)) {
            $syncArgs = @($syncScript, $RootDir, (Join-Path $CodexHome "skills"), "--mode", $InstallMode)
            if ($env:FORGE_SKILLS) { $syncArgs += @("--selected", $env:FORGE_SKILLS) }
            $syncJson = & node @syncArgs
            $syncResult = $syncJson | ConvertFrom-Json
            $skillCount = [int]$syncResult.installed
        } else {
            Get-ChildItem -Path (Join-Path $RootDir "skills") -Directory | Where-Object { $_.Name -ne "learned" -and -not $_.Name.StartsWith('.') } | ForEach-Object {
                if (-not (Has-SelectedSkill $_.Name)) { return }
                $dst = Join-Path (Join-Path $CodexHome "skills") $_.Name
                if ($InstallMode -eq "full" -or -not (Test-Path $dst)) {
                    if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
                    Copy-Item $_.FullName -Destination $dst -Recurse -Force
                    $skillCount++
                }
            }
        }
    }

    if (-not (Has-Component "skills")) {
        Write-Ok "Skills: skipped"
    } elseif ($InstallMode -eq "incremental") {
        Write-Ok "Skills: $skillCount new installed"
    } else {
        Write-Ok "Skills: $skillCount installed"
    }
    Write-Host ""
}

function Generate-Agents {
    Write-Step 4 7 (Get-Msg "gen")
    New-Item -ItemType Directory -Path $CodexHome -Force | Out-Null

    $template = Join-Path $ScriptDir "AGENTS.md.template"
    $content = Get-Content $template -Raw
    $content = $content -replace '\{\{CODEX_HOME\}\}', ($CodexHome -replace '\\', '/')
    $content = $content -replace '\{\{FORGE_HOME\}\}', ($ForgeHome -replace '\\', '/')
    Set-Content -Path (Join-Path $CodexHome "AGENTS.md") -Value $content

    Write-Ok "$CodexHome\AGENTS.md generated"
    Write-Host ""
}

function Configure-Mcp {
    Write-Step 5 7 (Get-Msg "mcp")
    if (-not (Has-Component "mcp")) {
        Write-Warn "Codex MCP configuration skipped by component selection"
        Write-Host ""
        return
    }
    if ($ConfigureMcp -ne "1") {
        Write-Warn "Codex MCP configuration skipped"
        Write-Host ""
        return
    }
    if (-not (Get-Command python -ErrorAction SilentlyContinue) -and -not (Get-Command python3 -ErrorAction SilentlyContinue)) {
        Write-Warn "python not found; skip Codex MCP configuration"
        Write-Host ""
        return
    }
    $scriptPath = Join-Path $ScriptDir "scripts\\configure-codex-mcp.ps1"
    $argsList = @()
    if ($McpServers.Count -gt 0) {
        $argsList += @("--servers", ($McpServers -join ","))
    }
    & $scriptPath @argsList
    Write-Host ""
}

function Verify-Install {
    Write-Step 6 7 (Get-Msg "verify")
    $errors = 0

    @(
      (Join-Path $CodexHome "AGENTS.md"),
      (Join-Path $ForgeHome "CLAUDE.md"),
      (Join-Path $ForgeHome "rules\security.md"),
      (Join-Path $ForgeHome "agents\planner.md")
    ) | ForEach-Object {
        if (Test-Path $_) {
            Write-Ok $_
        } else {
            Write-Host "✗ missing: $_" -ForegroundColor Red
            $errors++
        }
    }

    $skillDir = Join-Path $CodexHome "skills"
    $count = 0
    if (Test-Path $skillDir) { $count = (Get-ChildItem -Path $skillDir -Directory | Measure-Object).Count }

    if ($count -gt 0) {
        Write-Ok "skills/: $count"
    } else {
        Write-Host "✗ skills/: empty" -ForegroundColor Red
        $errors++
    }

    @(
      (Join-Path $ForgeHome "hooks"),
      (Join-Path $ForgeHome "scripts")
    ) | ForEach-Object {
        if (Test-Path $_) {
            Write-Ok $_
        } else {
            Write-Host "✗ missing dir: $_" -ForegroundColor Red
            $errors++
        }
    }

    @(
      (Join-Path $CodexHome "skills\\learned"),
      (Join-Path $CodexHome "homunculus\\instincts\\personal"),
      (Join-Path $CodexHome "homunculus\\evolved")
    ) | ForEach-Object {
        if (Test-Path $_) {
            Write-Ok $_
        } else {
            Write-Host "✗ missing dir: $_" -ForegroundColor Red
            $errors++
        }
    }

    $learningScript = Join-Path $ForgeHome "scripts\\codex-learning\\codex-learning.js"
    if (Test-Path $learningScript) {
        Write-Ok $learningScript
    } else {
        Write-Host "✗ missing: $learningScript" -ForegroundColor Red
        $errors++
    }

    Write-Host ""
    if ($errors -eq 0) {
        Write-Ok "Verification: OK"
    } else {
        throw "Verification failed: $errors error(s)"
    }
}

function Summary {
    Write-Step 7 7 (Get-Msg "done")
    Write-Info "Codex home: $CodexHome"
    Write-Info "Forge home: $ForgeHome"
    Write-Info "Next: restart Codex app/session"
    if (Test-Path $BackupDir) { Write-Info "Backup: $BackupDir" }
}

Select-Language
Select-Mode
Write-Host ""
Write-Info "======================================="
Write-Info "  $(Get-Msg 'title')"
Write-Info "======================================="
Write-Host ""

Test-Deps
Backup-Existing
Install-Assets
Generate-Agents
Configure-Mcp
Verify-Install
Summary
