$GeminiHome = Join-Path $HOME ".gemini"
if (-not (Test-Path (Join-Path $GeminiHome "GEMINI.md"))) { exit 1 }
if (-not (Test-Path (Join-Path $GeminiHome "settings.json"))) { exit 1 }
if (-not (Test-Path (Join-Path $GeminiHome "forge"))) { exit 1 }
if (-not (Test-Path (Join-Path $GeminiHome "skills\\learned"))) { exit 1 }
if (-not (Test-Path (Join-Path $GeminiHome "projects"))) { exit 1 }
Write-Host "PASS gemini verification"
