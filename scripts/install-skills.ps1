# ============================================
# Forge - Skill Module Installer
# install-skills.ps1 - Windows
# ============================================

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeHome = if ($env:CLAUDE_HOME) { $env:CLAUDE_HOME } else { "$env:USERPROFILE\.claude" }
$SkillsDir = "$ClaudeHome\skills"
$LibDir = "$ScriptDir\lib"
$Registry = "$LibDir\skills-registry.json"
$ModulesFile = "$LibDir\modules.json"
$InstalledFile = "$ClaudeHome\installed-skills.json"
$TmpDir = $null

# --- Helpers ---

function Cleanup {
  if ($TmpDir -and (Test-Path $TmpDir)) {
    Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue
  }
}

function Die($msg) {
  Write-Host "Error: $msg" -ForegroundColor Red
  Cleanup
  exit 1
}

function Need-Cmd($cmd) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Die "$cmd is required but not installed"
  }
}

function Run-Node {
  param([string]$Code, [string[]]$NodeArgs)
  $tmpJs = Join-Path $env:TEMP "forge-node-$(Get-Random).js"
  try {
    $fullCode = "process.argv.splice(1,1);" + "`n" + $Code
    [System.IO.File]::WriteAllText($tmpJs, $fullCode, (New-Object System.Text.UTF8Encoding $false))
    $allArgs = @($tmpJs) + $NodeArgs
    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $result = & node $allArgs 2>&1
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $prevEAP
    if ($exitCode -ne 0) {
      $errMsg = ($result | Where-Object { $_ -is [System.Management.Automation.ErrorRecord] }) -join "`n"
      if ($errMsg) { Write-Host "  node error: $errMsg" -ForegroundColor Red }
      return $null
    }
    return ($result | Where-Object { $_ -isnot [System.Management.Automation.ErrorRecord] }) -join "`n"
  } finally {
    Remove-Item $tmpJs -Force -ErrorAction SilentlyContinue
  }
}

# --- Show-Help ---

function Show-Help {
  Write-Host "Forge - Skill Module Installer" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Usage: install-skills.ps1 [options]"
  Write-Host "  -Preset <name>       Install a role preset"
  Write-Host "  -Modules <a,b,c>     Install specific modules"
  Write-Host "  -List                List modules and presets"
  Write-Host "  -Installed           Show installed skills"
  Write-Host "  -Help                Show this help"
  Write-Host ""
  Write-Host "No arguments: interactive mode."
  exit 0
}

# --- List-Modules ---

function List-Modules {
  Need-Cmd node
  $jsCode = @'
var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
console.log("\nAvailable Modules:\n");
for (var e of Object.entries(mf.modules)) {
  var tag = e[1].required ? " [required]" : "";
  console.log("  "+e[0]+" ("+e[1].skills.length+" skills)"+tag+" - "+e[1].description);
}
console.log("\nAvailable Presets:\n");
for (var p of Object.entries(mf.presets)) {
  console.log("  "+p[0]+" - "+p[1].description);
  console.log("    modules: "+p[1].modules.join(", "));
}
'@
  Run-Node -Code $jsCode -NodeArgs @($ModulesFile)
  exit 0
}

# --- Show-Installed ---

function Show-Installed {
  if (-not (Test-Path $InstalledFile)) {
    Write-Host "No skills installed yet."
    exit 0
  }
  $jsCode = @'
var d = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
console.log("Installed Skills:");
console.log("  Preset:  "+(d.preset||"custom"));
console.log("  Modules: "+(d.modules||[]).join(", "));
console.log("  Skills:  "+(d.skills||[]).length+" total");
console.log("  Date:    "+(d.installed_at||"unknown"));
'@
  Run-Node -Code $jsCode -NodeArgs @($InstalledFile)
  exit 0
}

# --- Download-Source ---

function Download-Source($sourceId) {
  $dest = "$TmpDir\$sourceId"
  if (Test-Path $dest) { return }

  $jsCode = @'
var r = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
var s = r.sources[process.argv[2]];
if(!s){console.error("Unknown source");process.exit(1)}
console.log(s.type+"|"+s.repo+"|"+(s.branch||"main"));
'@
  $info = Run-Node -Code $jsCode -NodeArgs @($Registry, $sourceId)
  if (-not $info) { Die "Failed to resolve source: $sourceId" }

  $parts = $info -split '\|'
  $srcType = $parts[0]
  $repo = $parts[1]
  $branch = $parts[2]

  if ($srcType -eq "github-archive") {
    Write-Host "  Downloading $repo..." -ForegroundColor Gray
    $url = "https://github.com/$repo/archive/refs/heads/$branch.zip"
    $zipFile = "$TmpDir\$sourceId.zip"
    Invoke-WebRequest -Uri $url -OutFile $zipFile -UseBasicParsing
    Expand-Archive -Path $zipFile -DestinationPath "$TmpDir\${sourceId}_raw" -Force
    $extracted = Get-ChildItem "$TmpDir\${sourceId}_raw" | Select-Object -First 1
    Move-Item $extracted.FullName $dest
    Remove-Item $zipFile -Force
    Remove-Item "$TmpDir\${sourceId}_raw" -Recurse -Force -ErrorAction SilentlyContinue
  }
  elseif ($srcType -eq "git-clone") {
    Write-Host "  Cloning $repo..." -ForegroundColor Gray
    git clone -q --depth 1 -b $branch "https://github.com/$repo.git" $dest
  }
  else {
    Die "Unknown source type: $srcType"
  }
}

# --- Do-Install ---

function Do-Install($modulesCsv, $presetName) {
  Need-Cmd git
  Need-Cmd node

  # Resolve skill list
  $jsResolve = @'
var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
var mods = process.argv[2].split(",").filter(Boolean);
if(mods.indexOf("core")<0) mods.unshift("core");
var skills = []; var seen = {};
for(var m of mods){
  var mod = mf.modules[m];
  if(!mod){console.error("Unknown module: "+m);process.exit(1)}
  for(var s of mod.skills){if(!seen[s]){seen[s]=1;skills.push(s)}}
}
console.log(skills.join("\n"));
'@
  $skillList = Run-Node -Code $jsResolve -NodeArgs @($ModulesFile, $modulesCsv)
  if (-not $skillList) { Die "Failed to resolve skill list" }

  $skills = $skillList -split "`n" | Where-Object { $_ }
  $skillCount = $skills.Count
  Write-Host "Installing $skillCount skills..." -ForegroundColor Cyan

  $script:TmpDir = Join-Path $env:TEMP "forge-skills-$(Get-Random)"
  New-Item -ItemType Directory -Path $TmpDir -Force | Out-Null

  # Clean existing skills directory (full overwrite, preserve learned/)
  if (Test-Path $SkillsDir) {
    Write-Host "  Cleaning existing skills directory..." -ForegroundColor Gray
    Get-ChildItem -Path $SkillsDir -Force | Where-Object { $_.Name -ne "learned" } | ForEach-Object {
      Remove-Item -Recurse -Force $_.FullName -ErrorAction SilentlyContinue
    }
  } else {
    New-Item -ItemType Directory -Path $SkillsDir -Force | Out-Null
  }

  # Find needed sources
  $jsSources = @'
var r = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
var sk = process.argv[2].split("\n").filter(Boolean);
var src = {};
for(var s of sk){if(r.skills[s]) src[r.skills[s].source]=1}
console.log(Object.keys(src).join("\n"));
'@
  $sourcesNeeded = Run-Node -Code $jsSources -NodeArgs @($Registry, ($skills -join "`n"))

  # Download sources
  Write-Host "[1/3] Downloading sources..." -ForegroundColor Yellow
  $srcList = $sourcesNeeded -split "`n" | Where-Object { $_ }
  foreach ($src in $srcList) {
    Download-Source $src
  }
  Write-Host "  Sources ready" -ForegroundColor Green

  # Copy skills
  Write-Host "[2/3] Installing skills..." -ForegroundColor Yellow
  $installedCount = 0
  $installedNames = @()

  $jsSkillInfo = @'
var r = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
var sk = r.skills[process.argv[2]];
if(!sk){process.exit(1)}
var src = r.sources[sk.source];
console.log(sk.source+"|"+sk.path+"|"+(src.base_path||"")+"|"+(sk.install_as||sk.path));
'@

  foreach ($skillName in $skills) {
    $skillInfo = Run-Node -Code $jsSkillInfo -NodeArgs @($Registry, $skillName)
    if (-not $skillInfo) { continue }

    $parts = $skillInfo -split '\|'
    $sourceId = $parts[0]
    $skillPath = $parts[1]
    $basePath = $parts[2]
    $installAs = $parts[3]

    $srcDir = "$TmpDir\$sourceId"
    if ($basePath) { $srcDir = "$srcDir\$basePath" }
    $srcDir = "$srcDir\$skillPath"
    $destDir = "$SkillsDir\$installAs"

    if (Test-Path $srcDir) {
      $parentDir = Split-Path $destDir -Parent
      if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
      }
      Copy-Item -Recurse -Force $srcDir $destDir
      $installedCount++
      $installedNames += $skillName
    } else {
      Write-Host "  Skip: $skillName" -ForegroundColor Yellow
    }
  }
  Write-Host "  $installedCount skills installed" -ForegroundColor Green

  # Save record
  Write-Host "[3/3] Saving install record..." -ForegroundColor Yellow
  $namesStr = $installedNames -join ","
  $jsSave = @'
var r = {
  preset: process.argv[1]||null,
  modules: process.argv[2].split(",").filter(Boolean),
  skills: process.argv[3].split(",").filter(Boolean),
  installed_at: new Date().toISOString(),
  version: "1.0"
};
require("fs").writeFileSync(process.argv[4],JSON.stringify(r,null,2));
'@
  Run-Node -Code $jsSave -NodeArgs @($presetName, $modulesCsv, $namesStr, $InstalledFile)
  Write-Host "  Record saved" -ForegroundColor Green

  Cleanup
  Write-Host ""
  Write-Host "Done! $installedCount skills installed to $SkillsDir" -ForegroundColor Green
}

# --- Interactive-Menu ---

function Interactive-Menu {
  Need-Cmd node

  Write-Host ""
  Write-Host "  =======================================" -ForegroundColor Cyan
  Write-Host "       Forge - Skill Module Installer    " -ForegroundColor Cyan
  Write-Host "  =======================================" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "  Select a role preset or customize:"
  Write-Host ""

  $jsPresets = @'
var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
var ps = Object.entries(mf.presets);
ps.forEach(function(e,i){
  var rec = (e[0]==="fullstack") ? " (recommended)" : "";
  console.log("    "+(i+1)+") "+e[0].padEnd(14)+"- "+e[1].description+rec);
});
console.log("    "+(ps.length+1)+") custom        - Pick individual modules");
'@
  Run-Node -Code $jsPresets -NodeArgs @($ModulesFile)

  $jsCount = @'
var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
console.log(Object.keys(mf.presets).length);
'@
  $presetCount = Run-Node -Code $jsCount -NodeArgs @($ModulesFile)

  Write-Host ""
  Write-Host "  Core module (26 skills) is always included."
  $maxChoice = [int]$presetCount + 1
  $choice = Read-Host "  Select [1-$maxChoice, default=1]"
  if (-not $choice) { $choice = "1" }

  if ([int]$choice -eq $maxChoice) {
    # Custom module selection
    Write-Host ""
    Write-Host "Available modules:" -ForegroundColor Cyan
    $jsListMods = @'
var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
var mods = Object.entries(mf.modules).filter(function(e){return !e[1].required});
mods.forEach(function(e,i){
  console.log("    "+(i+1)+") "+e[0]+" ("+e[1].skills.length+") - "+e[1].description);
});
'@
    Run-Node -Code $jsListMods -NodeArgs @($ModulesFile)
    Write-Host ""
    $modChoices = Read-Host "  Enter numbers (comma-separated, e.g. 1,2,5)"

    $jsSelMods = @'
var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
var mods = Object.entries(mf.modules).filter(function(e){return !e[1].required});
var ch = process.argv[2].split(",").map(Number).filter(function(n){return !isNaN(n)});
var sel = ch.map(function(i){return mods[i-1]}).filter(Boolean).map(function(e){return e[0]});
sel.unshift("core");
console.log(sel.join(","));
'@
    $selectedModules = Run-Node -Code $jsSelMods -NodeArgs @($ModulesFile, $modChoices)

    Write-Host "  Selected: $selectedModules"
    Do-Install $selectedModules ""
  }
  else {
    # Preset selection
    $jsPresetName = @'
var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
var names = Object.keys(mf.presets);
var idx = parseInt(process.argv[2]) - 1;
if(idx>=0 && idx<names.length) console.log(names[idx]);
else {console.error("Invalid");process.exit(1)}
'@
    $presetName = Run-Node -Code $jsPresetName -NodeArgs @($ModulesFile, $choice)

    $jsModsCsv = @'
var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
var p = mf.presets[process.argv[2]];
var m = ["core"].concat(p.modules);
console.log(m.filter(function(v,i,a){return a.indexOf(v)===i}).join(","));
'@
    $modulesCsv = Run-Node -Code $jsModsCsv -NodeArgs @($ModulesFile, $presetName)

    Write-Host "  Preset: $presetName"
    Write-Host "  Modules: $modulesCsv"
    Write-Host ""
    Do-Install $modulesCsv $presetName
  }
}

# --- Main ---

if (-not (Test-Path $Registry)) { Die "skills-registry.json not found" }
if (-not (Test-Path $ModulesFile)) { Die "modules.json not found" }

$action = $args[0]

$jsPresetModules = @'
var mf=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
var p=mf.presets[process.argv[2]];
if(!p){console.error("Unknown preset");process.exit(1)}
var m=["core"].concat(p.modules);
console.log(m.filter(function(v,i,a){return a.indexOf(v)===i}).join(","));
'@

switch ($action) {
  "--help"      { Show-Help }
  "-Help"       { Show-Help }
  "--list"      { List-Modules }
  "-List"       { List-Modules }
  "--installed"  { Show-Installed }
  "-Installed"   { Show-Installed }
  "--preset" {
    if (-not $args[1]) { Die "Missing preset name" }
    $mc = Run-Node -Code $jsPresetModules -NodeArgs @($ModulesFile, $args[1])
    Do-Install $mc $args[1]
  }
  "-Preset" {
    if (-not $args[1]) { Die "Missing preset name" }
    $mc = Run-Node -Code $jsPresetModules -NodeArgs @($ModulesFile, $args[1])
    Do-Install $mc $args[1]
  }
  "--modules" {
    if (-not $args[1]) { Die "Missing module list" }
    Do-Install "core,$($args[1])" ""
  }
  "-Modules" {
    if (-not $args[1]) { Die "Missing module list" }
    Do-Install "core,$($args[1])" ""
  }
  default {
    if ($action) { Die "Unknown option: $action" }
    Interactive-Menu
  }
}
