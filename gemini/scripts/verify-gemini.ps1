$GeminiHome = Join-Path $HOME ".gemini"
$ForgeHome = Join-Path $GeminiHome "forge"
if (-not (Test-Path (Join-Path $GeminiHome "GEMINI.md"))) { exit 1 }
if (-not (Test-Path (Join-Path $GeminiHome "settings.json"))) { exit 1 }
if (-not (Test-Path $ForgeHome)) { exit 1 }
if (-not (Test-Path (Join-Path $ForgeHome "core"))) { exit 1 }
if (-not (Test-Path (Join-Path $ForgeHome "core\skill-registry.json"))) { exit 1 }
if (-not (Test-Path (Join-Path $ForgeHome "roles"))) { exit 1 }
if (-not (Test-Path (Join-Path $ForgeHome "stacks"))) { exit 1 }
if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path (Join-Path $ForgeHome "scripts\check-runtime-skill-duplicates.cjs")) -and (Test-Path (Join-Path $GeminiHome "skills"))) {
  $dupJson = node (Join-Path $ForgeHome "scripts\check-runtime-skill-duplicates.cjs") --json --warn-only (Join-Path $GeminiHome "skills")
  $dupData = $dupJson | ConvertFrom-Json
  if ($dupData.duplicateCount -gt 0) {
    $dupIds = ($dupData.duplicates | ForEach-Object { $_.id }) -join ", "
    Write-Host "WARN duplicate runtime skills: $dupIds"
  } else {
    Write-Host "PASS no duplicate runtime skills"
  }
}
if (-not (Test-Path (Join-Path $GeminiHome "skills\learned"))) { exit 1 }
if (-not (Test-Path (Join-Path $GeminiHome "projects"))) { exit 1 }
Write-Host "PASS gemini verification"
