# ============================================
# Forge - Claude Code Configuration Framework
# Universal Installation Script (Windows)
# ============================================

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeHome = Join-Path $env:USERPROFILE ".claude"
$BackupDir = Join-Path $env:USERPROFILE (".claude-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))

# Default settings
$Lang = "zh"  # zh or en
$InstallMode = "incremental"  # incremental or full

# ============================================
# Language Support
# ============================================

$MSG_EN = @{
    title = "Forge - Claude Code Configuration Framework"
    select_lang = "Select language / 选择语言:"
    select_mode = "Select installation mode:"
    mode_incremental = "Incremental (preserve existing files)"
    mode_full = "Full (overwrite all files)"
    checking_deps = "Checking dependencies"
    backup_prompt = "Existing configuration found. Create backup?"
    backup_created = "Backup created"
    backup_skipped = "Backup skipped"
    installing_files = "Installing files"
    configuring_templates = "Configuring templates"
    configuring_mcp = "Configuring MCP servers"
    enter_exa_key = "Enter your Exa API key (or press Enter to skip):"
    installing_uvx = "Installing uvx (uv package manager)..."
    adding_mcp = "Adding MCP servers..."
    verifying = "Verifying installation"
    complete = "Installation Complete!"
    location = "Location"
    skills = "Skills"
    next_steps = "Next steps:"
    step1 = "1. Restart Claude Code"
    step2 = "2. Test WebSearch and other MCP tools"
    step3 = "3. Use /plan, /tdd, /code-review commands"
    error_git = "Error: git is required but not installed"
    warning_node = "Warning: Node.js not found (hooks will not work)"
    warning_claude = "Warning: Claude CLI not found (MCP configuration will be skipped)"
    warning_uvx = "Warning: uvx not found (will be installed if needed)"
    success = "✓"
    error = "✗"
    warning = "⚠"
}

$MSG_ZH = @{
    title = "Forge - Claude Code 配置框架"
    select_lang = "Select language / 选择语言:"
    select_mode = "选择安装模式:"
    mode_incremental = "增量模式（保留现有文件）"
    mode_full = "完整模式（覆盖所有文件）"
    checking_deps = "检查依赖"
    backup_prompt = "发现现有配置。是否创建备份？"
    backup_created = "备份已创建"
    backup_skipped = "跳过备份"
    installing_files = "安装文件"
    configuring_templates = "配置模板"
    configuring_mcp = "配置 MCP 服务器"
    enter_exa_key = "输入你的 Exa API key（或按 Enter 跳过）:"
    installing_uvx = "正在安装 uvx (uv 包管理器)..."
    adding_mcp = "添加 MCP 服务器..."
    verifying = "验证安装"
    complete = "安装完成！"
    location = "位置"
    skills = "Skills"
    next_steps = "下一步:"
    step1 = "1. 重启 Claude Code"
    step2 = "2. 测试 WebSearch 等 MCP 工具"
    step3 = "3. 使用 /plan, /tdd, /code-review 命令"
    error_git = "错误: 需要 git 但未安装"
    warning_node = "警告: 未找到 Node.js（hooks 将无法工作）"
    warning_claude = "警告: 未找到 Claude CLI（将跳过 MCP 配置）"
    warning_uvx = "警告: 未找到 uvx（需要时将自动安装）"
    success = "✓"
    error = "✗"
    warning = "⚠"
}

function Get-Message {
    param([string]$Key)
    if ($Lang -eq "zh") {
        return $MSG_ZH[$Key]
    } else {
        return $MSG_EN[$Key]
    }
}

# ============================================
# Helper Functions
# ============================================

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "$(Get-Message 'success') $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "$(Get-Message 'warning') $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "$(Get-Message 'error') $Message" -ForegroundColor Red
}

function Write-Step {
    param([int]$Current, [int]$Total, [string]$Message)
    Write-Host "[$Current/$Total] $Message" -ForegroundColor Yellow
}

# ============================================
# Interactive Setup
# ============================================

function Select-Language {
    Write-Host ""
    Write-Info (Get-Message "select_lang")
    Write-Host "  1) English"
    Write-Host "  2) 简体中文"
    Write-Host ""
    $choice = Read-Host "Choice (1-2)"

    if ($choice -eq "2") {
        $script:Lang = "zh"
    } else {
        $script:Lang = "en"
    }
    Write-Host ""
}

function Select-InstallMode {
    Write-Info (Get-Message "select_mode")
    Write-Host "  1) $(Get-Message 'mode_incremental')"
    Write-Host "  2) $(Get-Message 'mode_full')"
    Write-Host ""
    $choice = Read-Host "Choice (1-2)"

    if ($choice -eq "2") {
        $script:InstallMode = "full"
    } else {
        $script:InstallMode = "incremental"
    }
    Write-Host ""
}

# ============================================
# Dependency Checks
# ============================================

function Test-Dependencies {
    Write-Step 1 6 (Get-Message "checking_deps")

    # Git
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error (Get-Message "error_git")
        exit 1
    }
    Write-Success "git: $(git --version)"

    # Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Warning (Get-Message "warning_node")
    } else {
        Write-Success "node: $(node --version)"
    }

    # Claude CLI
    if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
        Write-Warning (Get-Message "warning_claude")
        $script:ClaudeCliAvailable = $false
    } else {
        Write-Success "claude: installed"
        $script:ClaudeCliAvailable = $true
    }

    # uvx
    if (-not (Get-Command uvx -ErrorAction SilentlyContinue)) {
        Write-Warning (Get-Message "warning_uvx")
        $script:UvxAvailable = $false
    } else {
        Write-Success "uvx: $(uvx --version)"
        $script:UvxAvailable = $true
    }

    Write-Host ""
}

# ============================================
# Backup Existing Configuration
# ============================================

function Backup-Existing {
    if (Test-Path $ClaudeHome) {
        Write-Step 2 6 (Get-Message "backup_prompt")
        Write-Host "(y/n)" -ForegroundColor Yellow
        $response = Read-Host

        if ($response -match "^[Yy]$") {
            New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
            Copy-Item -Path "$ClaudeHome\*" -Destination $BackupDir -Recurse -Force
            Write-Success "$(Get-Message 'backup_created'): $BackupDir"
        } else {
            Write-Success (Get-Message "backup_skipped")
        }
        Write-Host ""
    }
}

# ============================================
# Install Files
# ============================================

function Install-Files {
    Write-Step 3 6 "$(Get-Message 'installing_files') ($InstallMode)"

    if (-not (Test-Path $ClaudeHome)) {
        New-Item -ItemType Directory -Path $ClaudeHome -Force | Out-Null
    }

    # Core documentation
    $docCount = 0
    @("CLAUDE.md", "CAPABILITIES.md", "USAGE-GUIDE.md", "AGENTS.md", "GUIDE.md") | ForEach-Object {
        $file = Join-Path $ScriptDir $_
        if (Test-Path $file) {
            Copy-Item $file -Destination $ClaudeHome -Force
            $docCount++
        }
    }
    Write-Success "Documentation: $docCount files"

    # Directories
    $dirCount = 0
    @("agents", "commands", "contexts", "rules", "stacks", "hooks", "scripts") | ForEach-Object {
        $sourceDir = Join-Path $ScriptDir $_
        $destDir = Join-Path $ClaudeHome $_

        if (Test-Path $sourceDir) {
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }

            if ($InstallMode -eq "full") {
                Remove-Item -Path $destDir -Recurse -Force -ErrorAction SilentlyContinue
                Copy-Item -Path $sourceDir -Destination $ClaudeHome -Recurse -Force
            } else {
                Get-ChildItem -Path $sourceDir -Recurse | ForEach-Object {
                    $dest = $_.FullName.Replace($sourceDir, $destDir)
                    if (-not (Test-Path $dest)) {
                        $destParent = Split-Path $dest -Parent
                        if (-not (Test-Path $destParent)) {
                            New-Item -ItemType Directory -Path $destParent -Force | Out-Null
                        }
                        Copy-Item $_.FullName -Destination $dest -Force
                    }
                }
            }
            $dirCount++
        }
    }
    Write-Success "Directories: $dirCount synced"

    # Skills
    $skillsSource = Join-Path $ScriptDir "skills"
    $skillsDest = Join-Path $ClaudeHome "skills"

    if (Test-Path $skillsSource) {
        if (-not (Test-Path $skillsDest)) {
            New-Item -ItemType Directory -Path $skillsDest -Force | Out-Null
        }

        $skillCount = 0
        Get-ChildItem -Path $skillsSource -Directory | Where-Object { $_.Name -ne "learned" } | ForEach-Object {
            $skillDest = Join-Path $skillsDest $_.Name

            if ($InstallMode -eq "full" -or -not (Test-Path $skillDest)) {
                if (Test-Path $skillDest) {
                    Remove-Item -Path $skillDest -Recurse -Force
                }
                Copy-Item -Path $_.FullName -Destination $skillDest -Recurse -Force
                $skillCount++
            }
        }

        if ($InstallMode -eq "incremental") {
            Write-Success "Skills: $skillCount new skills added"
        } else {
            Write-Success "Skills: $skillCount skills installed"
        }
    }

    # Runtime directories
    @(
        "homunculus\instincts\personal",
        "homunculus\instincts\inherited",
        "sessions"
    ) | ForEach-Object {
        $dir = Join-Path $ClaudeHome $_
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            New-Item -ItemType File -Path (Join-Path $dir ".gitkeep") -Force | Out-Null
        }
    }

    Write-Host ""
}

# ============================================
# Configure Templates
# ============================================

function Configure-Templates {
    Write-Step 4 6 (Get-Message "configuring_templates")

    # settings.json
    $settingsTemplate = Join-Path $ScriptDir "settings.json.template"
    if (Test-Path $settingsTemplate) {
        Copy-Item $settingsTemplate -Destination (Join-Path $ClaudeHome "settings.json.template") -Force

        $settingsDest = Join-Path $ClaudeHome "settings.json"
        if ($InstallMode -eq "full" -or -not (Test-Path $settingsDest)) {
            Copy-Item $settingsTemplate -Destination $settingsDest -Force
            Write-Success "settings.json: created"
        } else {
            Write-Success "settings.json: preserved"
        }
    }

    # hooks.json
    $hooksTemplate = Join-Path $ClaudeHome "hooks\hooks.json.template"
    if (Test-Path $hooksTemplate) {
        $content = Get-Content $hooksTemplate -Raw
        $escapedPath = $ClaudeHome -replace '\\', '\\'
        $content = $content -replace '\{\{CLAUDE_HOME\}\}', $escapedPath
        Set-Content -Path (Join-Path $ClaudeHome "hooks\hooks.json") -Value $content
        Write-Success "hooks.json: generated"
    }

    Write-Host ""
}

# ============================================
# Configure MCP Servers
# ============================================

function Install-Uvx {
    if ($UvxAvailable) {
        return
    }

    Write-Info (Get-Message "installing_uvx")
    irm https://astral.sh/uv/install.ps1 | iex
    $env:PATH = "$env:USERPROFILE\.local\bin;$env:PATH"
    Write-Success "uvx installed"
}

function Configure-MCP {
    Write-Step 5 6 (Get-Message "configuring_mcp")

    if (-not $ClaudeCliAvailable) {
        Write-Warning (Get-Message "warning_claude")
        Write-Host ""
        return
    }

    # Prompt for Exa API key
    Write-Host (Get-Message "enter_exa_key") -ForegroundColor Yellow
    $exaKey = Read-Host

    # Install uvx if needed
    if (-not $UvxAvailable) {
        Install-Uvx
    }

    # Switch to home directory
    Push-Location ~

    Write-Info (Get-Message "adding_mcp")

    # exa
    if ($exaKey) {
        claude mcp remove exa 2>$null
        claude mcp add exa -e EXA_API_KEY="$exaKey" -- npx -y exa-mcp-server
        Write-Success "exa"
    }

    # sequential-thinking
    claude mcp remove sequential-thinking 2>$null
    claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
    Write-Success "sequential-thinking"

    # memory
    claude mcp remove memory 2>$null
    claude mcp add memory -- npx -y @modelcontextprotocol/server-memory
    Write-Success "memory"

    # deepwiki
    claude mcp remove deepwiki 2>$null
    claude mcp add deepwiki -- npx -y deepwiki-mcp
    Write-Success "deepwiki"

    # playwright
    claude mcp remove playwright 2>$null
    claude mcp add playwright -- npx -y @executeautomation/playwright-mcp-server
    Write-Success "playwright"

    # fetch
    claude mcp remove fetch 2>$null
    claude mcp add fetch -- uvx mcp-server-fetch
    Write-Success "fetch"

    Pop-Location
    Write-Host ""
}

# ============================================
# Verification
# ============================================

function Test-Installation {
    Write-Step 6 6 (Get-Message "verifying")

    $errors = 0

    # Check core files
    @("CLAUDE.md", "settings.json") | ForEach-Object {
        $file = Join-Path $ClaudeHome $_
        if (Test-Path $file) {
            Write-Success $_
        } else {
            Write-Error "$_: missing"
            $errors++
        }
    }

    # Check directories
    @("agents", "commands", "skills") | ForEach-Object {
        $dir = Join-Path $ClaudeHome $_
        if (Test-Path $dir) {
            $count = (Get-ChildItem $dir).Count
            Write-Success "$_/: $count items"
        } else {
            Write-Error "$_/: missing"
            $errors++
        }
    }

    Write-Host ""

    if ($errors -eq 0) {
        Write-Success "$(Get-Message 'verifying'): OK"
    } else {
        Write-Error "$(Get-Message 'verifying'): $errors errors"
    }

    Write-Host ""
}

# ============================================
# Main Installation Flow
# ============================================

function Main {
    # Interactive setup
    Select-Language
    Select-InstallMode

    # Display header
    Write-Host ""
    Write-Info "======================================="
    Write-Info "  $(Get-Message 'title')"
    Write-Info "======================================="
    Write-Host ""

    # Run installation
    Test-Dependencies
    Backup-Existing
    Install-Files
    Configure-Templates
    Configure-MCP
    Test-Installation

    # Summary
    Write-Info "======================================="
    Write-Info "  $(Get-Message 'complete')"
    Write-Info "======================================="
    Write-Host ""
    Write-Info "$(Get-Message 'location'): $ClaudeHome"

    $skillTotal = (Get-ChildItem (Join-Path $ClaudeHome "skills") -Directory | Where-Object { $_.Name -ne "learned" }).Count
    Write-Info "$(Get-Message 'skills'): $skillTotal"
    Write-Host ""

    Write-Info (Get-Message "next_steps")
    Write-Host "  $(Get-Message 'step1')" -ForegroundColor Gray
    Write-Host "  $(Get-Message 'step2')" -ForegroundColor Gray
    Write-Host "  $(Get-Message 'step3')" -ForegroundColor Gray
    Write-Host ""

    if (Test-Path $BackupDir) {
        Write-Info "Backup: $BackupDir"
        Write-Host ""
    }
}

# Run installation
Main
