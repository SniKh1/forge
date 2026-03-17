$ErrorActionPreference = "Continue"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$ReportDir = Join-Path $RepoRoot ".tmp"
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ReportFile = Join-Path $ReportDir ("forge-runtime-diagnose-{0}.md" -f $Stamp)

New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null
New-Item -ItemType File -Path $ReportFile -Force | Out-Null

$Warnings = New-Object System.Collections.Generic.List[string]

function Add-Line([string]$Text = "") {
    [System.IO.File]::AppendAllText($ReportFile, $Text + [Environment]::NewLine, [System.Text.Encoding]::UTF8)
    Write-Host $Text
}

function Add-Section([string]$Title) {
    Add-Line
    Add-Line ("## {0}" -f $Title)
}

function Add-CodeBlock([string]$Language, [string]$Content) {
    Add-Line ('```' + $Language)
    if ([string]::IsNullOrWhiteSpace($Content)) {
        Add-Line "<no output>"
    } else {
        $Content -split "`r?`n" | ForEach-Object { Add-Line $_ }
    }
    Add-Line '```'
}

function Add-Warning([string]$Message) {
    $Warnings.Add($Message) | Out-Null
}

function Report-Command([string]$Name, [string[]]$VersionArgs) {
    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $command) {
        Add-Line ("- {0}: missing" -f $Name)
        return $null
    }

    $version = ""
    try {
        $version = & $command.Source @VersionArgs 2>$null | Select-Object -First 1
    } catch {
        $version = ""
    }

    $suffix = ""
    if (-not [string]::IsNullOrWhiteSpace($version)) {
        $suffix = " ($version)"
    }

    Add-Line ("- {0}: {1}{2}" -f $Name, $command.Source, $suffix)
    return $command.Source
}

function Check-PathState([string]$Target, [string]$Kind) {
    $exists = $false
    if ($Kind -eq "file") { $exists = Test-Path $Target -PathType Leaf }
    if ($Kind -eq "dir") { $exists = Test-Path $Target -PathType Container }

    if ($exists) {
        Add-Line ("- {0}: present" -f $Target)
        return $true
    }

    Add-Line ("- {0}: missing" -f $Target)
    return $false
}

function Run-AndCapture([string]$Title, [string]$FilePath, [string[]]$ArgumentList) {
    Add-Section $Title
    Add-Line ('Command: "{0} {1}"' -f $FilePath, ($ArgumentList -join ' '))
    $output = & $FilePath @ArgumentList 2>&1
    $status = $LASTEXITCODE
    if ($null -eq $status) { $status = 0 }
    Add-Line ("Exit code: {0}" -f $status)
    Add-CodeBlock "text" ($output | Out-String)
    return @{ Output = ($output | Out-String); ExitCode = $status }
}

function Write-ValueBlock([string]$Label, [string]$Value) {
    Add-Line ("- {0}:" -f $Label)
    if ([string]::IsNullOrWhiteSpace($Value)) {
        Add-CodeBlock "text" "<empty>"
    } else {
        Add-CodeBlock "text" $Value
    }
}

Add-Line "# Forge Runtime Diagnostic Report"
Add-Line
Add-Line ("- Generated: {0}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"))
Add-Line ("- Repo root: {0}" -f $RepoRoot)
Add-Line ("- Report file: {0}" -f $ReportFile)

Add-Section "System"
Add-Line ("- OS: {0}" -f [System.Environment]::OSVersion.VersionString)
Add-Line ("- PowerShell: {0}" -f $PSVersionTable.PSVersion)
Add-Line ("- User: {0}" -f $env:USERNAME)
Add-Line ("- Home: {0}" -f $HOME)
Add-Line ("- Working directory: {0}" -f (Get-Location))

Add-Section "Process Environment"
Write-ValueBlock "PATH" $env:PATH
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
$MachinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
Write-ValueBlock "User PATH" $UserPath
Write-ValueBlock "Machine PATH" $MachinePath

Add-Section "Command Availability"
$NodePath = Report-Command "node" @("--version")
[void](Report-Command "git" @("--version"))
[void](Report-Command "python" @("--version"))
[void](Report-Command "python3" @("--version"))
[void](Report-Command "codex" @("--version"))
[void](Report-Command "claude" @("--version"))
[void](Report-Command "gemini" @("--version"))

if (-not $NodePath) {
    Add-Warning "Node.js is missing. Forge Desktop currently needs Node.js 18+ at runtime to read status, install, verify, and repair."
} elseif ($NodePath -match "nvm|fnm|Volta|scoop") {
    Add-Warning ("Node.js appears to come from a user-managed runtime path ({0}). Make sure Explorer-launched apps inherit the same PATH." -f $NodePath)
}

Add-Section "Client Homes"
if (-not (Check-PathState (Join-Path $HOME ".codex") "dir")) { Add-Warning "~/.codex is missing." }
if (-not (Check-PathState (Join-Path $HOME ".codex\AGENTS.md") "file")) { Add-Warning "~/.codex/AGENTS.md is missing." }
if (-not (Check-PathState (Join-Path $HOME ".codex\forge") "dir")) { Add-Warning "~/.codex/forge is missing." }
[void](Check-PathState (Join-Path $HOME ".claude") "dir")
[void](Check-PathState (Join-Path $HOME ".claude\CLAUDE.md") "file")
[void](Check-PathState (Join-Path $HOME ".gemini") "dir")
[void](Check-PathState (Join-Path $HOME ".gemini\GEMINI.md") "file")

Add-Section "Installed Forge Desktop"
$AppCandidates = @()
if ($env:LOCALAPPDATA) { $AppCandidates += (Join-Path $env:LOCALAPPDATA "Programs\Forge\Forge.exe") }
if ($env:ProgramFiles) { $AppCandidates += (Join-Path $env:ProgramFiles "Forge\Forge.exe") }
if (${env:ProgramFiles(x86)}) { $AppCandidates += (Join-Path ${env:ProgramFiles(x86)} "Forge\Forge.exe") }

$FoundApp = $false
foreach ($AppPath in $AppCandidates | Where-Object { $_ }) {
    if (Test-Path $AppPath -PathType Leaf) {
        $FoundApp = $true
        Add-Line ("- Forge executable: {0}" -f $AppPath)
        $InstallRoot = Split-Path -Parent $AppPath
        [void](Check-PathState (Join-Path $InstallRoot "resources\packages\forge-cli\bin\forge.js") "file")
    }
}
if (-not $FoundApp) {
    Add-Line "- Forge.exe not found in the common install locations"
}

$CliEntry = Join-Path $RepoRoot "packages\forge-cli\bin\forge.js"
if ($NodePath -and (Test-Path $CliEntry -PathType Leaf)) {
    $doctor = Run-AndCapture "Forge CLI doctor" $NodePath @($CliEntry, "doctor", "--client", "claude,codex,gemini", "--json")
    if ($doctor.ExitCode -ne 0) {
        Add-Warning "forge doctor returned a non-zero exit code."
    }

    $verify = Run-AndCapture "Forge CLI verify" $NodePath @($CliEntry, "verify", "--client", "claude,codex,gemini", "--json")
    if ($verify.ExitCode -ne 0) {
        Add-Warning "forge verify returned a non-zero exit code."
    }
} else {
    Add-Section "Forge CLI"
    Add-Line "- Skipped running forge doctor/verify because node or the local repo CLI entrypoint is missing."
}

Add-Section "Summary"
if ($Warnings.Count -eq 0) {
    Add-Line "- No high-confidence runtime blockers were detected."
    Add-Line "- If Forge Desktop still cannot read status, compare the GUI environment against this report."
} else {
    foreach ($Warning in $Warnings) {
        Add-Line ("- {0}" -f $Warning)
    }
}

Add-Line
Add-Line ("Diagnostic report saved to: {0}" -f $ReportFile)
