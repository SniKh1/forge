#Requires -Version 5.1
<#
.SYNOPSIS
    Forge Installation Verification Script
.DESCRIPTION
    Verifies that the Forge (Claude Code configuration framework) installation
    is complete and correctly configured. Checks core files, configuration
    content, directory completeness, asset counts, and runtime dependencies.
.NOTES
    Version: 1.0.0
    Run from any directory - paths are resolved from $HOME/.claude
#>

param(
    [switch]$Verbose,
    [switch]$NoColor
)

# ============================================================================
# Initialization
# ============================================================================

$ErrorActionPreference = 'SilentlyContinue'

$script:PassCount = 0
$script:FailCount = 0
$script:WarnCount = 0

$ClaudeDir = Join-Path $HOME ".claude"
$SettingsFile = Join-Path $ClaudeDir "settings.json"
$McpFile = Join-Path $ClaudeDir ".mcp.json"
$ClaudeMd = Join-Path $ClaudeDir "CLAUDE.md"
$HooksFile = Join-Path $ClaudeDir "hooks" "hooks.json"
$AgentsDir = Join-Path $ClaudeDir "agents"
$RulesDir = Join-Path $ClaudeDir "rules"
$StacksDir = Join-Path $ClaudeDir "stacks"
$SkillsDir = Join-Path $ClaudeDir "skills"
$CommandsDir = Join-Path $ClaudeDir "commands"

# ============================================================================
# Helper Functions
# ============================================================================

function Write-Status {
    param(
        [string]$Status,
        [string]$Message
    )
    switch ($Status) {
        "PASS" {
            $script:PassCount++
            if ($NoColor) { Write-Host "  [PASS] $Message" }
            else { Write-Host "  [PASS] " -ForegroundColor Green -NoNewline; Write-Host $Message }
        }
        "FAIL" {
            $script:FailCount++
            if ($NoColor) { Write-Host "  [FAIL] $Message" }
            else { Write-Host "  [FAIL] " -ForegroundColor Red -NoNewline; Write-Host $Message }
        }
        "WARN" {
            $script:WarnCount++
            if ($NoColor) { Write-Host "  [WARN] $Message" }
            else { Write-Host "  [WARN] " -ForegroundColor Yellow -NoNewline; Write-Host $Message }
        }
        "INFO" {
            if ($NoColor) { Write-Host "  [INFO] $Message" }
            else { Write-Host "  [INFO] " -ForegroundColor Cyan -NoNewline; Write-Host $Message }
        }
    }
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    if ($NoColor) { Write-Host "=== $Title ===" }
    else { Write-Host "=== $Title ===" -ForegroundColor White }
}

function Test-FileExists {
    param(
        [string]$Path,
        [string]$Label
    )
    if (Test-Path $Path) {
        Write-Status "PASS" "$Label exists"
        return $true
    } else {
        Write-Status "FAIL" "$Label missing: $Path"
        return $false
    }
}

function Test-DirFiles {
    param(
        [string]$Dir,
        [string]$Label,
        [string[]]$ExpectedFiles
    )
    if (-not (Test-Path $Dir)) {
        Write-Status "FAIL" "$Label directory missing: $Dir"
        return
    }
    foreach ($file in $ExpectedFiles) {
        $filePath = Join-Path $Dir $file
        if (Test-Path $filePath) {
            if ($Verbose) { Write-Status "PASS" "$Label/$file" }
        } else {
            Write-Status "FAIL" "$Label/$file missing"
        }
    }
    $found = (Get-ChildItem -Path $Dir -File | Measure-Object).Count
    $expected = $ExpectedFiles.Count
    if ($found -ge $expected) {
        Write-Status "PASS" "$Label complete ($found/$expected files)"
    } else {
        Write-Status "WARN" "$Label incomplete ($found/$expected files)"
    }
}

# ============================================================================
# Section 1: Core Files
# ============================================================================

function Test-CoreFiles {
    Write-Section "1. Core Files"

    Test-FileExists $ClaudeMd "CLAUDE.md" | Out-Null
    Test-FileExists $SettingsFile "settings.json" | Out-Null
    Test-FileExists $McpFile ".mcp.json" | Out-Null
    Test-FileExists $HooksFile "hooks/hooks.json" | Out-Null
}

# ============================================================================
# Section 2: Configuration Content
# ============================================================================

function Test-ConfigContent {
    Write-Section "2. Configuration Content"

    # Check CLAUDE.md version
    if (Test-Path $ClaudeMd) {
        $content = Get-Content $ClaudeMd -Raw
        if ($content -match 'v\d+\.\d+') {
            $version = $Matches[0]
            Write-Status "PASS" "CLAUDE.md version detected: $version"
        } else {
            Write-Status "WARN" "CLAUDE.md version string not found"
        }

        # Check for template variables (unreplaced placeholders)
        if ($content -match '\{\{[^}]+\}\}') {
            Write-Status "FAIL" "CLAUDE.md contains unreplaced template variables"
        } else {
            Write-Status "PASS" "CLAUDE.md has no unreplaced template variables"
        }
    }

    # Check settings.json permissions count
    if (Test-Path $SettingsFile) {
        $settingsContent = Get-Content $SettingsFile -Raw
        $settings = $settingsContent | ConvertFrom-Json

        # Count permissions in allowedTools
        $permCount = 0
        if ($settings.permissions -and $settings.permissions.allow) {
            $permCount = ($settings.permissions.allow | Measure-Object).Count
        }
        if ($permCount -gt 0) {
            Write-Status "PASS" "settings.json has $permCount permission rules"
        } else {
            Write-Status "WARN" "settings.json has no permission rules configured"
        }

        # Check for template variables
        if ($settingsContent -match '\{\{[^}]+\}\}') {
            Write-Status "FAIL" "settings.json contains unreplaced template variables"
        } else {
            Write-Status "PASS" "settings.json has no unreplaced template variables"
        }
    }

    # Check .mcp.json server count
    if (Test-Path $McpFile) {
        $mcpContent = Get-Content $McpFile -Raw
        $mcp = $mcpContent | ConvertFrom-Json

        $serverCount = 0
        if ($mcp.mcpServers) {
            $serverCount = ($mcp.mcpServers.PSObject.Properties | Measure-Object).Count
        }
        if ($serverCount -gt 0) {
            Write-Status "PASS" ".mcp.json has $serverCount MCP server(s) configured"
        } else {
            Write-Status "WARN" ".mcp.json has no MCP servers configured"
        }

        # Check for template variables
        if ($mcpContent -match '\{\{[^}]+\}\}') {
            Write-Status "FAIL" ".mcp.json contains unreplaced template variables"
        } else {
            Write-Status "PASS" ".mcp.json has no unreplaced template variables"
        }
    }
}

# ============================================================================
# Section 3: Directory Completeness
# ============================================================================

function Test-DirectoryCompleteness {
    Write-Section "3. Directory Completeness"

    # Agents
    $agentFiles = @(
        "planner.md",
        "architect.md",
        "tdd-guide.md",
        "code-reviewer.md",
        "security-reviewer.md",
        "build-error-resolver.md",
        "e2e-runner.md",
        "refactor-cleaner.md",
        "doc-updater.md",
        "database-reviewer.md"
    )
    Test-DirFiles $AgentsDir "Agents" $agentFiles

    # Rules
    $ruleFiles = @(
        "agents.md",
        "coding-style.md",
        "git-workflow.md",
        "hooks.md",
        "patterns.md",
        "performance.md",
        "security.md",
        "testing.md"
    )
    Test-DirFiles $RulesDir "Rules" $ruleFiles

    # Stacks
    $stackFiles = @(
        "frontend.md",
        "java.md",
        "python.md"
    )
    Test-DirFiles $StacksDir "Stacks" $stackFiles
}

# ============================================================================
# Section 4: Asset Counts
# ============================================================================

function Test-AssetCounts {
    Write-Section "4. Asset Counts"

    # Skills count (check installed-skills.json first, then directory)
    $InstalledFile = Join-Path $ClaudeDir "installed-skills.json"
    if (Test-Path $InstalledFile) {
        $installed = Get-Content $InstalledFile -Raw | ConvertFrom-Json
        $skillCount = ($installed.skills | Measure-Object).Count
        Write-Status "PASS" "Skills: $skillCount installed (via install-skills)"
    } elseif (Test-Path $SkillsDir) {
        $skillCount = (Get-ChildItem -Path $SkillsDir -Directory | Measure-Object).Count
        if ($skillCount -ge 1) {
            Write-Status "PASS" "Skills: $skillCount directories found"
        } else {
            Write-Status "WARN" "Skills: none installed. Run: ~/.claude/scripts/install-skills.ps1"
        }
    } else {
        Write-Status "WARN" "Skills: not installed yet. Run: ~/.claude/scripts/install-skills.ps1"
    }

    # Agents total count
    if (Test-Path $AgentsDir) {
        $agentCount = (Get-ChildItem -Path $AgentsDir -File -Filter "*.md" | Measure-Object).Count
        Write-Status "INFO" "Agents: $agentCount total"
    } else {
        Write-Status "FAIL" "Agents directory not found"
    }

    # Commands total count
    if (Test-Path $CommandsDir) {
        $cmdCount = (Get-ChildItem -Path $CommandsDir -File -Filter "*.md" | Measure-Object).Count
        Write-Status "INFO" "Commands: $cmdCount total"
    } else {
        Write-Status "WARN" "Commands directory not found: $CommandsDir"
    }
}

# ============================================================================
# Section 5: Runtime Dependencies
# ============================================================================

function Test-RuntimeDeps {
    Write-Section "5. Runtime Dependencies"

    # Check git
    $gitPath = Get-Command git -ErrorAction SilentlyContinue
    if ($gitPath) {
        $gitVersion = & git --version 2>&1
        Write-Status "PASS" "git available: $gitVersion"
    } else {
        Write-Status "FAIL" "git not found in PATH"
    }

    # Check node
    $nodePath = Get-Command node -ErrorAction SilentlyContinue
    if ($nodePath) {
        $nodeVersion = & node --version 2>&1
        Write-Status "PASS" "node available: $nodeVersion"
    } else {
        Write-Status "FAIL" "node not found in PATH"
    }

    # Check npx
    $npxPath = Get-Command npx -ErrorAction SilentlyContinue
    if ($npxPath) {
        $npxVersion = & npx --version 2>&1
        Write-Status "PASS" "npx available: v$npxVersion"
    } else {
        Write-Status "FAIL" "npx not found in PATH"
    }
}

# ============================================================================
# Section 6: Summary
# ============================================================================

function Write-Summary {
    Write-Section "Verification Summary"

    $total = $script:PassCount + $script:FailCount + $script:WarnCount

    if ($NoColor) {
        Write-Host "  PASS: $($script:PassCount)  FAIL: $($script:FailCount)  WARN: $($script:WarnCount)  TOTAL: $total"
    } else {
        Write-Host "  " -NoNewline
        Write-Host "PASS: $($script:PassCount)" -ForegroundColor Green -NoNewline
        Write-Host "  " -NoNewline
        Write-Host "FAIL: $($script:FailCount)" -ForegroundColor Red -NoNewline
        Write-Host "  " -NoNewline
        Write-Host "WARN: $($script:WarnCount)" -ForegroundColor Yellow -NoNewline
        Write-Host "  TOTAL: $total"
    }

    Write-Host ""
    if ($script:FailCount -eq 0 -and $script:WarnCount -eq 0) {
        if ($NoColor) { Write-Host "  Result: ALL CHECKS PASSED" }
        else { Write-Host "  Result: ALL CHECKS PASSED" -ForegroundColor Green }
    } elseif ($script:FailCount -eq 0) {
        if ($NoColor) { Write-Host "  Result: PASSED with $($script:WarnCount) warning(s)" }
        else { Write-Host "  Result: PASSED with $($script:WarnCount) warning(s)" -ForegroundColor Yellow }
    } else {
        if ($NoColor) { Write-Host "  Result: FAILED - $($script:FailCount) check(s) failed" }
        else { Write-Host "  Result: FAILED - $($script:FailCount) check(s) failed" -ForegroundColor Red }
    }
    Write-Host ""
}

# ============================================================================
# Main Execution
# ============================================================================

Write-Host ""
if ($NoColor) { Write-Host "Forge Installation Verification" }
else { Write-Host "Forge Installation Verification" -ForegroundColor Cyan }
Write-Host "Target: $ClaudeDir"
Write-Host ""

Test-CoreFiles
Test-ConfigContent
Test-DirectoryCompleteness
Test-AssetCounts
Test-RuntimeDeps
Write-Summary

# Exit with appropriate code
if ($script:FailCount -gt 0) { exit 1 }
elseif ($script:WarnCount -gt 0) { exit 0 }
else { exit 0 }
