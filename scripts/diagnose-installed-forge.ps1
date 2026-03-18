$ErrorActionPreference = "Continue"

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$Desktop = [Environment]::GetFolderPath("Desktop")
$ReportFile = Join-Path $Desktop ("forge-installed-diagnose-{0}.md" -f $Stamp)

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

Add-Line "# Forge Installed Runtime Diagnostic Report"
Add-Line
Add-Line ("- Generated: {0}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"))
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
$NpmPath = Report-Command "npm" @("--version")
[void](Report-Command "claude" @("--version"))
[void](Report-Command "codex" @("--version"))
[void](Report-Command "gemini" @("--version"))
[void](Report-Command "git" @("--version"))
[void](Report-Command "python" @("--version"))
[void](Report-Command "python3" @("--version"))

if (-not $NodePath) {
    Add-Warning "Node.js is missing. Forge Desktop currently needs Node.js 18+ at runtime."
}
if (-not $NpmPath) {
    Add-Warning "npm is missing. Forge cannot bootstrap official clients without npm."
}

Add-Section "Client Homes"
[void](Check-PathState (Join-Path $HOME ".claude") "dir")
[void](Check-PathState (Join-Path $HOME ".claude\CLAUDE.md") "file")
[void](Check-PathState (Join-Path $HOME ".codex") "dir")
[void](Check-PathState (Join-Path $HOME ".codex\AGENTS.md") "file")
[void](Check-PathState (Join-Path $HOME ".gemini") "dir")
[void](Check-PathState (Join-Path $HOME ".gemini\GEMINI.md") "file")

Add-Section "Installed Forge Desktop"
$AppCandidates = @()
if ($env:LOCALAPPDATA) { $AppCandidates += (Join-Path $env:LOCALAPPDATA "Programs\Forge\Forge.exe") }
if ($env:ProgramFiles) { $AppCandidates += (Join-Path $env:ProgramFiles "Forge\Forge.exe") }
if (${env:ProgramFiles(x86)}) { $AppCandidates += (Join-Path ${env:ProgramFiles(x86)} "Forge\Forge.exe") }

function Find-InstalledForgeFromRegistry {
    $roots = @(
        "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
    )

    foreach ($root in $roots) {
        $items = Get-ItemProperty -Path $root -ErrorAction SilentlyContinue
        foreach ($item in $items) {
            $displayName = [string]$item.DisplayName
            if ([string]::IsNullOrWhiteSpace($displayName) -or $displayName -notlike "Forge*") {
                continue
            }

            $installExe = ""
            if ($item.InstallLocation) {
                $installExe = Join-Path ([string]$item.InstallLocation) "Forge.exe"
            }
            $candidates = @(
                [string]$item.DisplayIcon,
                $installExe
            ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

            foreach ($candidate in $candidates) {
                $normalized = $candidate.Trim('"')
                if (Test-Path $normalized -PathType Leaf) {
                    return $normalized
                }
            }
        }
    }

    return $null
}

$AppPath = $AppCandidates | Where-Object { $_ -and (Test-Path $_ -PathType Leaf) } | Select-Object -First 1
if (-not $AppPath) {
    $AppPath = Find-InstalledForgeFromRegistry
}
if (-not $AppPath) {
    Add-Line "- Forge.exe not found in common install locations"
    Add-Warning "Forge.exe was not found."
} else {
    Add-Line ("- Forge executable: {0}" -f $AppPath)
}

$InstallRoot = if ($AppPath) { Split-Path -Parent $AppPath } else { "" }
$ResourceRoot = if ($InstallRoot) { Join-Path $InstallRoot "resources" } else { "" }
$CliEntry = if ($ResourceRoot) { Join-Path $ResourceRoot "packages\forge-cli\bin\forge.js" } else { "" }
$VerifyClaude = if ($ResourceRoot) { Join-Path $ResourceRoot "scripts\verify.ps1" } else { "" }
$VerifyCodex = if ($ResourceRoot) { Join-Path $ResourceRoot "codex\scripts\verify-codex.ps1" } else { "" }
$VerifyGemini = if ($ResourceRoot) { Join-Path $ResourceRoot "gemini\scripts\verify-gemini.ps1" } else { "" }

if ($ResourceRoot) {
    [void](Check-PathState $CliEntry "file")
    [void](Check-PathState $VerifyClaude "file")
    [void](Check-PathState $VerifyCodex "file")
    [void](Check-PathState $VerifyGemini "file")
}

if ($NodePath -and $CliEntry -and (Test-Path $CliEntry -PathType Leaf)) {
    [void](Run-AndCapture "Forge CLI doctor (detected only)" $NodePath @($CliEntry, "doctor", "--detected-only", "--json"))
    [void](Run-AndCapture "Forge CLI doctor (Claude only)" $NodePath @($CliEntry, "doctor", "--client", "claude", "--json"))
    [void](Run-AndCapture "Forge CLI doctor (all clients)" $NodePath @($CliEntry, "doctor", "--client", "claude,codex,gemini", "--json"))
} else {
    Add-Warning "Bundled forge.js was not found or node is unavailable."
}

if (-not [string]::IsNullOrWhiteSpace($VerifyClaude) -and (Test-Path $VerifyClaude -PathType Leaf)) {
    [void](Run-AndCapture "Verify Claude" "powershell" @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $VerifyClaude))
}
if (-not [string]::IsNullOrWhiteSpace($VerifyCodex) -and (Test-Path $VerifyCodex -PathType Leaf)) {
    [void](Run-AndCapture "Verify Codex" "powershell" @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $VerifyCodex))
}
if (-not [string]::IsNullOrWhiteSpace($VerifyGemini) -and (Test-Path $VerifyGemini -PathType Leaf)) {
    [void](Run-AndCapture "Verify Gemini" "powershell" @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $VerifyGemini))
}

Add-Section "Summary"
if ($Warnings.Count -eq 0) {
    Add-Line "- No high-confidence blockers were detected by the standalone checks."
    Add-Line "- Compare the doctor outputs above to see whether only missing Codex/Gemini caused the desktop status failure."
} else {
    foreach ($Warning in $Warnings) {
        Add-Line ("- {0}" -f $Warning)
    }
}

Add-Line
Add-Line ("Diagnostic report saved to: {0}" -f $ReportFile)
