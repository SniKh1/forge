# ============================================
# Forge - Claude Code Configuration Framework
# install.ps1 - Windows 安装脚本
# ============================================

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeHome = "$env:USERPROFILE\.claude"
$BackupDir = "$env:USERPROFILE\.claude-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host ""
Write-Host "  =======================================" -ForegroundColor Cyan
Write-Host "       Forge - Claude Code Framework     " -ForegroundColor Cyan
Write-Host "          Installation Script            " -ForegroundColor Cyan
Write-Host "  =======================================" -ForegroundColor Cyan
Write-Host ""

# --- Step 1: Check dependencies ---
Write-Host "[1/5] Checking dependencies..." -ForegroundColor Yellow

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "  Error: git is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "  OK" -ForegroundColor Green

# --- Step 2: Backup existing config ---
Write-Host "[2/5] Checking existing configuration..." -ForegroundColor Yellow

if (Test-Path $ClaudeHome) {
    Write-Host "  Found existing ~/.claude/"
    $doBackup = Read-Host "  Backup existing config? (y/n)"
    if ($doBackup -eq "y") {
        Copy-Item -Recurse $ClaudeHome $BackupDir
        Write-Host "  Backed up to $BackupDir" -ForegroundColor Green
    }
} else {
    New-Item -ItemType Directory -Path $ClaudeHome | Out-Null
    Write-Host "  Created ~/.claude/"
}

# --- Step 3: Copy files ---
Write-Host "[3/5] Installing configuration files..." -ForegroundColor Yellow

$files = @("CLAUDE.md", "CAPABILITIES.md", "USAGE-GUIDE.md", "AGENTS.md", "GUIDE.md")
foreach ($f in $files) {
    $src = Join-Path $ScriptDir $f
    if (Test-Path $src) {
        Copy-Item $src (Join-Path $ClaudeHome $f) -Force
    }
}

$dirs = @("agents", "commands", "contexts", "rules", "stacks", "hooks", "scripts")
foreach ($d in $dirs) {
    $src = Join-Path $ScriptDir $d
    if (Test-Path $src) {
        Copy-Item -Recurse $src (Join-Path $ClaudeHome $d) -Force
    }
}

# Trellis
$trellisSrc = Join-Path $ScriptDir ".trellis"
if (Test-Path $trellisSrc) {
    Copy-Item -Recurse $trellisSrc (Join-Path $ClaudeHome ".trellis") -Force
}

# Cursor
$cursorSrc = Join-Path $ScriptDir ".cursor"
if (Test-Path $cursorSrc) {
    Copy-Item -Recurse $cursorSrc (Join-Path $ClaudeHome ".cursor") -Force
}

Write-Host "  Files installed" -ForegroundColor Green

# --- Step 4: Apply templates ---
Write-Host "[4/5] Applying templates..." -ForegroundColor Yellow

$settingsTemplate = Join-Path $ClaudeHome "settings.json.template"
if (Test-Path $settingsTemplate) {
    Copy-Item $settingsTemplate (Join-Path $ClaudeHome "settings.json") -Force
}

$mcpTemplate = Join-Path $ClaudeHome "mcp.json.template"
if (Test-Path $mcpTemplate) {
    Copy-Item $mcpTemplate (Join-Path $ClaudeHome ".mcp.json") -Force
}

$hooksTemplate = Join-Path $ClaudeHome "hooks\hooks.json.template"
if (Test-Path $hooksTemplate) {
    $content = Get-Content $hooksTemplate -Raw
    $escapedPath = $ClaudeHome -replace '\\', '\\'
    $content = $content -replace '\{\{CLAUDE_HOME\}\}', $escapedPath
    Set-Content -Path (Join-Path $ClaudeHome "hooks\hooks.json") -Value $content
}

Write-Host "  Templates applied" -ForegroundColor Green

# --- Step 5: Optional Skills ---
Write-Host "[5/5] Optional components..." -ForegroundColor Yellow

$installSkills = Read-Host "  Install Skills from everything-claude-code? (y/n)"
if ($installSkills -eq "y") {
    Write-Host "  Cloning everything-claude-code..."
    $eccDir = "$env:TEMP\ecc-$(Get-Random)"
    git clone --depth 1 https://github.com/affaan-m/everything-claude-code $eccDir
    Copy-Item -Recurse "$eccDir\skills" "$ClaudeHome\skills" -Force
    Remove-Item -Recurse -Force $eccDir
    Write-Host "  Skills installed" -ForegroundColor Green
} else {
    Write-Host "  Skipped Skills installation"
}

Write-Host ""
Write-Host "  Installation complete!" -ForegroundColor Green
Write-Host "  Config location: $ClaudeHome" -ForegroundColor Cyan
Write-Host ""
