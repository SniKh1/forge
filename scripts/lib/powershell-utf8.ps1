$script:ForgeUtf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Initialize-ForgeEncoding {
    try {
        [Console]::InputEncoding = $script:ForgeUtf8NoBom
        [Console]::OutputEncoding = $script:ForgeUtf8NoBom
    } catch {
        # Ignore host-specific console encoding failures and still set pipeline encoding.
    }

    $global:OutputEncoding = $script:ForgeUtf8NoBom
}

function Read-Utf8File {
    param([string]$Path)

    return [System.IO.File]::ReadAllText($Path, $script:ForgeUtf8NoBom)
}

function Write-Utf8File {
    param(
        [string]$Path,
        [string]$Content
    )

    $parent = Split-Path -Parent $Path
    if ($parent -and -not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    [System.IO.File]::WriteAllText($Path, $Content, $script:ForgeUtf8NoBom)
}
