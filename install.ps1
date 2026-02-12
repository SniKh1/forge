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
Write-Host "[1/7] Checking dependencies..." -ForegroundColor Yellow

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "  Error: git is not installed" -ForegroundColor Red
    exit 1
}

$hasPython = $false
if (Get-Command python3 -ErrorAction SilentlyContinue) {
    $hasPython = $true
}
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $hasPython = $true
}
if (-not $hasPython) {
    Write-Host "  Warning: python3 not found. Trellis hooks (Pipeline Agents, Ralph Loop) will not work." -ForegroundColor Yellow
    Write-Host "  Install Python 3.8+ to enable full Trellis pipeline support." -ForegroundColor Yellow
}
else {
    Write-Host "  python3: OK" -ForegroundColor Green
}

Write-Host "  git: OK" -ForegroundColor Green

# --- Step 2: Backup existing config ---
Write-Host "[2/7] Checking existing configuration..." -ForegroundColor Yellow

if (Test-Path $ClaudeHome) {
    Write-Host "  Found existing ~/.claude/"
    $doBackup = Read-Host "  Backup existing config? (y/n)"
    if ($doBackup -eq "y") {
        Copy-Item -Recurse $ClaudeHome $BackupDir
        Write-Host "  Backed up to $BackupDir" -ForegroundColor Green
    }
}
else {
    New-Item -ItemType Directory -Path $ClaudeHome | Out-Null
    Write-Host "  Created ~/.claude/"
}

# --- Step 3: Copy core files ---
Write-Host "[3/7] Installing configuration files..." -ForegroundColor Yellow

# Helper: robocopy wrapper that mirrors src into dest without nesting
function Copy-DirMerge($src, $dest) {
    # robocopy /E = recurse including empty dirs, /IS /IT = overwrite same/tweaked
    # robocopy exit codes 0-7 are success, 8+ are errors
    robocopy $src $dest /E /IS /IT /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null
    if ($LASTEXITCODE -ge 8) {
        Write-Host "  Warning: robocopy error copying $src" -ForegroundColor Yellow
    }
}

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
        Copy-DirMerge $src (Join-Path $ClaudeHome $d)
    }
}

# Trellis
$trellisSrc = Join-Path $ScriptDir ".trellis"
if (Test-Path $trellisSrc) {
    Copy-DirMerge $trellisSrc (Join-Path $ClaudeHome ".trellis")
}

# Cursor
$cursorSrc = Join-Path $ScriptDir ".cursor"
if (Test-Path $cursorSrc) {
    Copy-DirMerge $cursorSrc (Join-Path $ClaudeHome ".cursor")
}

Write-Host "  Core files installed" -ForegroundColor Green

# --- Step 4: Create required directories ---
Write-Host "[4/7] Creating directory structure..." -ForegroundColor Yellow

$requiredDirs = @(
    "$ClaudeHome\homunculus\instincts\personal",
    "$ClaudeHome\homunculus\instincts\inherited",
    "$ClaudeHome\sessions",
    "$ClaudeHome\commands\trellis"
)

foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created $($dir -replace [regex]::Escape($ClaudeHome), '~/.claude')" -ForegroundColor Gray
    }
}

$gitkeepDirs = @(
    "$ClaudeHome\homunculus\instincts\personal",
    "$ClaudeHome\homunculus\instincts\inherited",
    "$ClaudeHome\sessions"
)

foreach ($dir in $gitkeepDirs) {
    $gitkeep = Join-Path $dir ".gitkeep"
    if (-not (Test-Path $gitkeep)) {
        New-Item -ItemType File -Path $gitkeep -Force | Out-Null
    }
}

Write-Host "  Directories created" -ForegroundColor Green

# --- Step 5: Apply templates ---
Write-Host "[5/7] Applying templates..." -ForegroundColor Yellow

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

# --- Step 6: Verify Trellis integration ---
Write-Host "[6/7] Verifying Trellis integration..." -ForegroundColor Yellow

$trellisChecks = @{
    "Pipeline Agents"  = @(
        "$ClaudeHome\agents\implement.md",
        "$ClaudeHome\agents\check.md",
        "$ClaudeHome\agents\debug.md",
        "$ClaudeHome\agents\research.md",
        "$ClaudeHome\agents\dispatch.md",
        "$ClaudeHome\agents\plan.md"
    )
    "Trellis Commands" = @(
        "$ClaudeHome\commands\trellis\start.md",
        "$ClaudeHome\commands\trellis\parallel.md",
        "$ClaudeHome\commands\trellis\finish-work.md",
        "$ClaudeHome\commands\trellis\break-loop.md",
        "$ClaudeHome\commands\trellis\record-session.md",
        "$ClaudeHome\commands\trellis\before-backend-dev.md",
        "$ClaudeHome\commands\trellis\before-frontend-dev.md",
        "$ClaudeHome\commands\trellis\check-backend.md",
        "$ClaudeHome\commands\trellis\check-frontend.md",
        "$ClaudeHome\commands\trellis\check-cross-layer.md",
        "$ClaudeHome\commands\trellis\create-command.md",
        "$ClaudeHome\commands\trellis\integrate-skill.md",
        "$ClaudeHome\commands\trellis\onboard.md",
        "$ClaudeHome\commands\trellis\update-spec.md"
    )
    "Trellis Hooks"    = @(
        "$ClaudeHome\hooks\inject-subagent-context.py",
        "$ClaudeHome\hooks\ralph-loop.py",
        "$ClaudeHome\hooks\session-start.py"
    )
}

$allOk = $true
foreach ($category in $trellisChecks.Keys) {
    $files = $trellisChecks[$category]
    $missing = @()
    foreach ($f in $files) {
        if (-not (Test-Path $f)) {
            $missing += Split-Path -Leaf $f
        }
    }
    if ($missing.Count -eq 0) {
        Write-Host "  $category ($($files.Count)/$($files.Count)): OK" -ForegroundColor Green
    }
    else {
        Write-Host "  $category ($($files.Count - $missing.Count)/$($files.Count)): MISSING $($missing -join ', ')" -ForegroundColor Red
        $allOk = $false
    }
}

if ($allOk) {
    Write-Host "  Trellis integration verified" -ForegroundColor Green
}
else {
    Write-Host "  Some Trellis components are missing!" -ForegroundColor Red
}

# --- Step 7: Optional Skills ---
Write-Host "[7/7] Optional components..." -ForegroundColor Yellow

$installSkills = Read-Host "  Install Skills from everything-claude-code? (y/n)"
if ($installSkills -eq "y") {
    Write-Host "  Cloning everything-claude-code..."
    $eccDir = "$env:TEMP\ecc-$(Get-Random)"
    try {
        git clone --depth 1 https://github.com/affaan-m/everything-claude-code $eccDir 2>&1
        if (Test-Path "$eccDir\skills") {
            $skillsDest = Join-Path $ClaudeHome "skills"
            if (-not (Test-Path $skillsDest)) {
                New-Item -ItemType Directory -Path $skillsDest -Force | Out-Null
            }
            Copy-DirMerge "$eccDir\skills" $skillsDest
            Write-Host "  Skills installed" -ForegroundColor Green
        }
        else {
            Write-Host "  Warning: Clone succeeded but skills/ directory not found" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "  Warning: Failed to clone repository (network issue?)" -ForegroundColor Yellow
        Write-Host "  You can install skills later by running:" -ForegroundColor Yellow
        Write-Host "    git clone --depth 1 https://github.com/affaan-m/everything-claude-code /tmp/ecc" -ForegroundColor Gray
        Write-Host "    Copy-Item -Recurse /tmp/ecc/skills $ClaudeHome/skills" -ForegroundColor Gray
    }
    finally {
        if (Test-Path $eccDir) {
            Remove-Item -Recurse -Force $eccDir -ErrorAction SilentlyContinue
        }
    }
}
else {
    Write-Host "  Skipped Skills installation"
}

# --- Summary ---
Write-Host ""
Write-Host "  =======================================" -ForegroundColor Green
Write-Host "       Installation complete!            " -ForegroundColor Green
Write-Host "  =======================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Config location: $ClaudeHome" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Installed components:" -ForegroundColor Cyan
Write-Host "    Interactive Agents:  10" -ForegroundColor Gray
Write-Host "    Pipeline Agents:      6" -ForegroundColor Gray
Write-Host "    Commands (general):  20" -ForegroundColor Gray
Write-Host "    Commands (trellis):  14" -ForegroundColor Gray
Write-Host "    Rules:                8" -ForegroundColor Gray
Write-Host "    Contexts:             3" -ForegroundColor Gray
Write-Host "    Hooks (JS):           8" -ForegroundColor Gray
Write-Host "    Hooks (Python):       3" -ForegroundColor Gray
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Cyan
Write-Host "    1. Run /trellis:onboard in Claude Code for first-time setup" -ForegroundColor Gray
Write-Host "    2. Run /trellis:start at the beginning of each session" -ForegroundColor Gray
Write-Host ""
