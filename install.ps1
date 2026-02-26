# ============================================
# Forge - Claude Code Configuration Framework
# install.ps1 - Windows
# ============================================

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeHome = "$env:USERPROFILE\.claude"

Write-Host ""
Write-Host "  =======================================" -ForegroundColor Cyan
Write-Host "       Forge - Claude Code Framework     " -ForegroundColor Cyan
Write-Host "  =======================================" -ForegroundColor Cyan
Write-Host ""

# --- Helper ---
function Copy-DirMerge($src, $dest) {
    if (-not (Test-Path $dest)) {
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
    }
    robocopy $src $dest /E /IS /IT /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null
    if ($LASTEXITCODE -ge 8) {
        Write-Host "    Warning: copy error for $src" -ForegroundColor Yellow
    }
}

# --- Step 1: Check dependencies ---
Write-Host "[1/6] Checking dependencies..." -ForegroundColor Yellow

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "  Error: git is not installed" -ForegroundColor Red
    exit 1
}
Write-Host "  git: OK" -ForegroundColor Green

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  Warning: node not found, hooks will not work" -ForegroundColor Yellow
} else {
    Write-Host "  node: OK" -ForegroundColor Green
}

# --- Step 2: Install files ---
Write-Host "[2/6] Installing files..." -ForegroundColor Yellow

if (-not (Test-Path $ClaudeHome)) {
    New-Item -ItemType Directory -Path $ClaudeHome | Out-Null
}

# Markdown docs
$docCount = 0
foreach ($f in @("CLAUDE.md", "CAPABILITIES.md", "USAGE-GUIDE.md", "AGENTS.md", "GUIDE.md")) {
    $src = Join-Path $ScriptDir $f
    if (Test-Path $src) {
        Copy-Item $src (Join-Path $ClaudeHome $f) -Force
        $docCount++
    }
}
Write-Host "  Docs: $docCount files" -ForegroundColor Gray

# Directories
$dirList = @("agents", "commands", "contexts", "rules", "stacks", "hooks", "scripts")
$dirCount = 0
foreach ($d in $dirList) {
    $src = Join-Path $ScriptDir $d
    if (Test-Path $src) {
        Copy-DirMerge $src (Join-Path $ClaudeHome $d)
        $dirCount++
    }
}
Write-Host "  Directories: $dirCount synced" -ForegroundColor Gray

# Skills (bundled): merge into existing, preserve learned/
$skillsSrc = Join-Path $ScriptDir "skills"
if (Test-Path $skillsSrc) {
    $skillsDest = Join-Path $ClaudeHome "skills"
    if (-not (Test-Path $skillsDest)) {
        New-Item -ItemType Directory -Path $skillsDest -Force | Out-Null
    }
    $bundled = 0
    Get-ChildItem -Path $skillsSrc -Directory | Where-Object { $_.Name -ne "learned" } | ForEach-Object {
        Copy-DirMerge $_.FullName (Join-Path $skillsDest $_.Name)
        $bundled++
    }
    Write-Host "  Bundled skills: $bundled copied" -ForegroundColor Gray
}

# Ensure runtime directories exist
foreach ($dir in @(
    "$ClaudeHome\homunculus\instincts\personal",
    "$ClaudeHome\homunculus\instincts\inherited",
    "$ClaudeHome\sessions"
)) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $gitkeep = Join-Path $dir ".gitkeep"
    if (-not (Test-Path $gitkeep)) {
        New-Item -ItemType File -Path $gitkeep -Force | Out-Null
    }
}

Write-Host "  Files installed" -ForegroundColor Green

# --- Step 3: Apply templates ---
Write-Host "[3/6] Applying templates..." -ForegroundColor Yellow

# settings.json (only if not exists)
$settingsDest = Join-Path $ClaudeHome "settings.json"
$settingsTemplate = Join-Path $ClaudeHome "settings.json.template"
if ((Test-Path $settingsTemplate) -and (-not (Test-Path $settingsDest))) {
    Copy-Item $settingsTemplate $settingsDest -Force
    Write-Host "  settings.json: created" -ForegroundColor Gray
} else {
    Write-Host "  settings.json: exists, skipped" -ForegroundColor Gray
}

# .mcp.json (only if not exists)
$mcpDest = Join-Path $ClaudeHome ".mcp.json"
$mcpTemplate = Join-Path $ClaudeHome "mcp.json.template"
if ((Test-Path $mcpTemplate) -and (-not (Test-Path $mcpDest))) {
    Copy-Item $mcpTemplate $mcpDest -Force
    Write-Host "  .mcp.json: created" -ForegroundColor Gray
} else {
    Write-Host "  .mcp.json: exists, skipped" -ForegroundColor Gray
}

# hooks.json (always regenerate from template)
$hooksTemplate = Join-Path $ClaudeHome "hooks\hooks.json.template"
if (Test-Path $hooksTemplate) {
    $content = Get-Content $hooksTemplate -Raw
    $escapedPath = $ClaudeHome -replace '\\', '\\'
    $content = $content -replace '\{\{CLAUDE_HOME\}\}', $escapedPath
    Set-Content -Path (Join-Path $ClaudeHome "hooks\hooks.json") -Value $content
    Write-Host "  hooks.json: generated" -ForegroundColor Gray
}

Write-Host "  Templates applied" -ForegroundColor Green

# --- Step 4: Verify installation ---
Write-Host "[4/6] Verifying..." -ForegroundColor Yellow

$verifyScript = Join-Path $ClaudeHome "scripts\verify.ps1"
if (Test-Path $verifyScript) {
    $env:CLAUDE_HOME = $ClaudeHome
    & $verifyScript
} else {
    Write-Host "  verify.ps1 not found, running basic checks..." -ForegroundColor Yellow
    foreach ($f in @("CLAUDE.md", "settings.json", ".mcp.json")) {
        if (Test-Path (Join-Path $ClaudeHome $f)) {
            Write-Host "  ${f}: OK" -ForegroundColor Green
        } else {
            Write-Host "  ${f}: MISSING" -ForegroundColor Red
        }
    }
}

# --- Step 5: Optional Skill modules ---
Write-Host ""
Write-Host "[5/6] Skill modules..." -ForegroundColor Yellow

$SkillScript = Join-Path $ClaudeHome "scripts\install-skills.ps1"
if (Test-Path $SkillScript) {
    $installSkills = Read-Host "  Install skill modules now? [Y/n]"
    if (-not $installSkills) { $installSkills = "Y" }
    if ($installSkills -match '^[Yy]') {
        & $SkillScript
    } else {
        Write-Host "  Skipped. Run later: powershell ~/.claude/scripts/install-skills.ps1" -ForegroundColor Gray
    }
} else {
    Write-Host "  install-skills.ps1 not found, skipping" -ForegroundColor Yellow
}

# --- Step 6: Done ---
Write-Host ""
Write-Host "[6/6] Done!" -ForegroundColor Green
Write-Host ""
Write-Host "  Location: $ClaudeHome" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Cyan
Write-Host "    1. Open Claude Code and start coding" -ForegroundColor Gray
Write-Host "    2. Use /plan, /tdd, /code-review commands" -ForegroundColor Gray
Write-Host ""
