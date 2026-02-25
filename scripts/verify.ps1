# ============================================
# Forge - Claude Code Configuration Framework
# verify.ps1 - Installation Verification
# ============================================

$ErrorActionPreference = "Continue"

$ClaudeHome = if ($env:CLAUDE_HOME) { $env:CLAUDE_HOME } else { "$env:USERPROFILE\.claude" }

$script:PassCount = 0
$script:FailCount = 0
$script:WarnCount = 0

function Pass($msg) { Write-Host "  [PASS] $msg" -ForegroundColor Green; $script:PassCount++ }
function Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red; $script:FailCount++ }
function Warn($msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow; $script:WarnCount++ }

Write-Host ""
Write-Host "  =======================================" -ForegroundColor Cyan
Write-Host "     Forge - Installation Verification   " -ForegroundColor Cyan
Write-Host "  =======================================" -ForegroundColor Cyan
Write-Host "  Target: $ClaudeHome" -ForegroundColor Gray
Write-Host ""

# ---- 1. Core Files ----
Write-Host "[1/6] Core files..." -ForegroundColor Cyan

foreach ($f in @("CLAUDE.md", "settings.json", ".mcp.json")) {
    if (Test-Path (Join-Path $ClaudeHome $f)) {
        Pass $f
    } else {
        Fail "$f not found"
    }
}

$hooksJson = Join-Path $ClaudeHome "hooks\hooks.json"
if (Test-Path $hooksJson) {
    Pass "hooks\hooks.json"
} else {
    Fail "hooks\hooks.json not found"
}

# ---- 2. Configuration Content ----
Write-Host ""
Write-Host "[2/6] Configuration content..." -ForegroundColor Cyan

# CLAUDE.md version
$claudeMd = Join-Path $ClaudeHome "CLAUDE.md"
if (Test-Path $claudeMd) {
    $ver = (Select-String -Path $claudeMd -Pattern 'v(\d+\.\d+)' | Select-Object -First 1)
    if ($ver) {
        Pass "CLAUDE.md version: $($ver.Matches[0].Value)"
    } else {
        Warn "CLAUDE.md version not detected"
    }
}

# settings.json permission count
$settingsFile = Join-Path $ClaudeHome "settings.json"
if (Test-Path $settingsFile) {
    $permCount = (Select-String -Path $settingsFile -Pattern '"Bash|"Read|"Write|"Edit|"Glob|"Grep|"Web|"Todo|"Task|"Skill|"mcp__').Count
    if ($permCount -ge 20) {
        Pass "settings.json permissions: $permCount entries"
    } else {
        Warn "settings.json permissions: only $permCount entries (expected 20+)"
    }
}

# .mcp.json server count
$mcpFile = Join-Path $ClaudeHome ".mcp.json"
if (Test-Path $mcpFile) {
    $mcpCount = (Select-String -Path $mcpFile -Pattern '"command"').Count
    if ($mcpCount -ge 4) {
        Pass ".mcp.json servers: $mcpCount configured"
    } else {
        Warn ".mcp.json servers: only $mcpCount (expected 4+)"
    }
}

# hooks.json template variable check
if (Test-Path $hooksJson) {
    $unresolvedVars = Select-String -Path $hooksJson -Pattern '\{\{CLAUDE_HOME\}\}|\{\{PYTHON_CMD\}\}'
    if ($unresolvedVars) {
        Fail "hooks.json contains unresolved template variables"
    } else {
        Pass "hooks.json template variables resolved"
    }
}

# ---- 3. Directory Completeness ----
Write-Host ""
Write-Host "[3/6] Directory completeness..." -ForegroundColor Cyan

function Test-DirFiles($label, $dir, $files) {
    $total = $files.Count
    $missingList = @()
    foreach ($f in $files) {
        if (-not (Test-Path (Join-Path $dir $f))) {
            $missingList += $f
        }
    }
    $ok = $total - $missingList.Count
    if ($missingList.Count -eq 0) {
        Pass "$label ($ok/$total)"
    } else {
        Fail "$label ($ok/$total) missing: $($missingList -join ', ')"
    }
}

Test-DirFiles "Pipeline Agents" "$ClaudeHome\agents" @(
    "implement.md", "check.md", "debug.md",
    "research.md", "dispatch.md", "plan.md"
)

Test-DirFiles "Trellis Commands" "$ClaudeHome\commands\trellis" @(
    "start.md", "parallel.md", "finish-work.md", "break-loop.md",
    "record-session.md", "before-backend-dev.md", "before-frontend-dev.md",
    "check-backend.md", "check-frontend.md", "check-cross-layer.md",
    "create-command.md", "integrate-skill.md", "onboard.md", "update-spec.md"
)

Test-DirFiles "Trellis Hooks" "$ClaudeHome\hooks" @(
    "inject-subagent-context.py", "ralph-loop.py", "session-start.py"
)

Test-DirFiles "Rules" "$ClaudeHome\rules" @(
    "agents.md", "coding-style.md", "git-workflow.md", "hooks.md",
    "patterns.md", "performance.md", "security.md", "testing.md"
)

Test-DirFiles "Stacks" "$ClaudeHome\stacks" @(
    "frontend.md", "java.md", "python.md"
)

# ---- 4. Asset Counts ----
Write-Host ""
Write-Host "[4/6] Asset counts..." -ForegroundColor Cyan

$skillsDir = Join-Path $ClaudeHome "skills"
if (Test-Path $skillsDir) {
    $skillCount = (Get-ChildItem -Directory $skillsDir).Count
    if ($skillCount -ge 10) {
        Pass "Skills: $skillCount installed"
    } else {
        Warn "Skills: only $skillCount (expected 10+)"
    }
} else {
    Fail "Skills directory not found"
}

$agentsDir = Join-Path $ClaudeHome "agents"
if (Test-Path $agentsDir) {
    $agentCount = (Get-ChildItem -Filter "*.md" $agentsDir).Count
    Pass "Agents: $agentCount total"
}

$cmdsDir = Join-Path $ClaudeHome "commands"
if (Test-Path $cmdsDir) {
    $cmdCount = (Get-ChildItem -Filter "*.md" $cmdsDir -Recurse).Count
    Pass "Commands: $cmdCount total"
}

# ---- 5. Runtime Dependencies ----
Write-Host ""
Write-Host "[5/6] Runtime dependencies..." -ForegroundColor Cyan

if (Get-Command git -ErrorAction SilentlyContinue) {
    Pass "git: $(git --version)"
} else {
    Fail "git not found"
}

if (Get-Command node -ErrorAction SilentlyContinue) {
    Pass "node: $(node --version)"
} else {
    Warn "node not found (needed for hooks)"
}

if (Get-Command npx -ErrorAction SilentlyContinue) {
    Pass "npx: available"
} else {
    Warn "npx not found (needed for MCP servers)"
}

if (Get-Command python3 -ErrorAction SilentlyContinue) {
    Pass "python3: $(python3 --version 2>&1)"
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    Pass "python: $(python --version 2>&1)"
} else {
    Warn "python not found (needed for Trellis hooks)"
}

# ---- 6. Summary ----
Write-Host ""
Write-Host "[6/6] Summary" -ForegroundColor Cyan
Write-Host "  =======================================" -ForegroundColor Cyan
$total = $script:PassCount + $script:FailCount + $script:WarnCount
Write-Host "  PASS: $($script:PassCount)  FAIL: $($script:FailCount)  WARN: $($script:WarnCount)  Total: $total"

if ($script:FailCount -eq 0) {
    Write-Host ""
    Write-Host "  Installation verified successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "  Installation has $($script:FailCount) issue(s), check output above." -ForegroundColor Red
    exit 1
}
