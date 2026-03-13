# Forge Codex Verification (Windows)
$ErrorActionPreference = "SilentlyContinue"

$CodexHome = Join-Path $HOME ".codex"
$ForgeHome = Join-Path $CodexHome "forge"

$pass = 0
$fail = 0
$warn = 0

function Pass([string]$m) { Write-Host "[PASS] $m" -ForegroundColor Green; $script:pass++ }
function Fail([string]$m) { Write-Host "[FAIL] $m" -ForegroundColor Red; $script:fail++ }
function Warn([string]$m) { Write-Host "[WARN] $m" -ForegroundColor Yellow; $script:warn++ }

Write-Host "Forge Codex verification" -ForegroundColor Cyan
Write-Host "Target: $CodexHome"
Write-Host ""

if (Test-Path (Join-Path $CodexHome "AGENTS.md")) { Pass "AGENTS.md" } else { Fail "AGENTS.md missing" }
if (Test-Path (Join-Path $ForgeHome "CLAUDE.md")) { Pass "forge/CLAUDE.md" } else { Fail "forge/CLAUDE.md missing" }
if (Test-Path (Join-Path $ForgeHome "core")) { Pass "forge/core" } else { Fail "forge/core missing" }
if (Test-Path (Join-Path $ForgeHome "core\skill-registry.json")) { Pass "forge/core/skill-registry.json" } else { Fail "forge/core/skill-registry.json missing" }
if (Test-Path (Join-Path $ForgeHome "roles")) { Pass "forge/roles" } else { Fail "forge/roles missing" }
if (Test-Path (Join-Path $ForgeHome "agents")) { Pass "forge/agents" } else { Fail "forge/agents missing" }
if (Test-Path (Join-Path $ForgeHome "rules")) { Pass "forge/rules" } else { Fail "forge/rules missing" }
if (Test-Path (Join-Path $ForgeHome "stacks")) { Pass "forge/stacks" } else { Fail "forge/stacks missing" }
if (Test-Path (Join-Path $ForgeHome "hooks")) { Pass "forge/hooks" } else { Fail "forge/hooks missing" }
if (Test-Path (Join-Path $ForgeHome "scripts")) { Pass "forge/scripts" } else { Fail "forge/scripts missing" }
if (Test-Path (Join-Path $ForgeHome "scripts\codex-learning\codex-learning.js")) { Pass "forge/scripts/codex-learning/codex-learning.js" } else { Fail "codex-learning script missing" }

$skills = Join-Path $CodexHome "skills"
if (Test-Path $skills) {
  $count = (Get-ChildItem -Path $skills -Directory | Measure-Object).Count
  if ($count -gt 0) { Pass "skills: $count" } else { Warn "skills directory exists but empty" }
} else {
  Fail "skills directory missing"
}

$dupScript = Join-Path $ForgeHome "scripts\check-runtime-skill-duplicates.js"
if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path $dupScript) -and (Test-Path $skills)) {
  $dupJson = node $dupScript --json --warn-only $skills
  $dupData = $dupJson | ConvertFrom-Json
  if ($dupData.duplicateCount -gt 0) {
    $dupIds = ($dupData.duplicates | ForEach-Object { $_.id }) -join ", "
    Warn "duplicate runtime skills detected: $dupIds"
  } else {
    Pass "no duplicate runtime skills"
  }
}

if (Test-Path (Join-Path $CodexHome "skills\learned")) { Pass "skills/learned" } else { Fail "skills/learned missing" }
if (Test-Path (Join-Path $CodexHome "homunculus\instincts\personal")) { Pass "homunculus/instincts/personal" } else { Fail "homunculus/instincts/personal missing" }
if (Test-Path (Join-Path $CodexHome "homunculus\evolved")) { Pass "homunculus/evolved" } else { Fail "homunculus/evolved missing" }
if (Test-Path (Join-Path $CodexHome "projects")) { Pass "projects/ exists" } else { Fail "projects/ missing" }

if ((Test-Path (Join-Path $ForgeHome "rules\security.md")) -and (Test-Path (Join-Path $ForgeHome "agents\planner.md")) -and (Test-Path (Join-Path $ForgeHome "stacks\frontend.md")) -and (Test-Path (Join-Path $ForgeHome "roles\developer.md"))) {
  Pass "key governance packs installed"
} else {
  Fail "key governance packs missing"
}

Write-Host ""
Write-Host "PASS: $pass  FAIL: $fail  WARN: $warn"
if ($fail -gt 0) { exit 1 } else { exit 0 }
