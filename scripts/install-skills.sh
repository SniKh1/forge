#!/bin/bash
# ============================================
# Forge - Skill Module Installer
# install-skills.sh - macOS/Linux
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_HOME="${CLAUDE_HOME:-$HOME/.claude}"
SKILLS_DIR="$CLAUDE_HOME/skills"
LIB_DIR="$SCRIPT_DIR/lib"
REGISTRY="$LIB_DIR/skills-registry.json"
MODULES_FILE="$LIB_DIR/modules.json"
INSTALLED_FILE="$CLAUDE_HOME/installed-skills.json"
TMP_DIR=""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m'

cleanup() {
  [ -n "$TMP_DIR" ] && [ -d "$TMP_DIR" ] && rm -rf "$TMP_DIR"
}
trap cleanup EXIT

die() { echo -e "${RED}Error: $1${NC}" >&2; exit 1; }

need_cmd() {
  command -v "$1" &>/dev/null || die "$1 is required but not installed"
}

show_help() {
  echo "Forge - Skill Module Installer"
  echo ""
  echo "Usage: install-skills.sh [options]"
  echo "  --preset <name>       Install a role preset"
  echo "  --modules <a,b,c>     Install specific modules"
  echo "  --list                List modules and presets"
  echo "  --installed           Show installed skills"
  echo "  --help                Show this help"
  echo ""
  echo "No arguments: interactive mode."
  exit 0
}

list_modules() {
  need_cmd node
  node -e '
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
  ' "$MODULES_FILE"
  exit 0
}

show_installed() {
  if [ ! -f "$INSTALLED_FILE" ]; then
    echo "No skills installed yet."
    exit 0
  fi
  node -e '
    var d = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
    console.log("Installed Skills:");
    console.log("  Preset:  "+(d.preset||"custom"));
    console.log("  Modules: "+(d.modules||[]).join(", "));
    console.log("  Skills:  "+(d.skills||[]).length+" total");
    console.log("  Date:    "+(d.installed_at||"unknown"));
  ' "$INSTALLED_FILE"
  exit 0
}

download_source() {
  local source_id="$1"
  local dest="$TMP_DIR/$source_id"
  [ -d "$dest" ] && return 0

  local src_info
  src_info=$(node -e '
    var r = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
    var s = r.sources[process.argv[2]];
    if(!s){console.error("Unknown source");process.exit(1)}
    console.log(s.type+"|"+s.repo+"|"+(s.branch||"main"));
  ' "$REGISTRY" "$source_id")

  local src_type repo branch
  IFS='|' read -r src_type repo branch <<< "$src_info"

  if [ "$src_type" = "github-archive" ]; then
    echo -e "  ${GRAY}Downloading $repo...${NC}"
    mkdir -p "$dest"
    curl -sL "https://github.com/$repo/archive/refs/heads/$branch.tar.gz" \
      | tar xz -C "$dest" --strip-components=1
  elif [ "$src_type" = "git-clone" ]; then
    echo -e "  ${GRAY}Cloning $repo...${NC}"
    git clone -q --depth 1 -b "$branch" \
      "https://github.com/$repo.git" "$dest"
  else
    die "Unknown source type: $src_type"
  fi
}

do_install() {
  local modules_csv="$1"
  local preset_name="$2"

  need_cmd curl
  need_cmd git
  need_cmd node
  need_cmd tar

  local skill_list
  skill_list=$(node -e '
    var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
    var mods = process.argv[2].split(",").filter(Boolean);
    if(mods.indexOf("core")<0) mods.unshift("core");
    var skills = [];
    var seen = {};
    for(var m of mods){
      var mod = mf.modules[m];
      if(!mod){console.error("Unknown module: "+m);process.exit(1)}
      for(var s of mod.skills){if(!seen[s]){seen[s]=1;skills.push(s)}}
    }
    console.log(skills.join("\n"));
  ' "$MODULES_FILE" "$modules_csv")

  local skill_count
  skill_count=$(echo "$skill_list" | wc -l | tr -d ' ')
  echo -e "${CYAN}Installing $skill_count skills...${NC}"

  TMP_DIR=$(mktemp -d)

  # Clean existing skills directory (full overwrite, preserve learned/)
  if [ -d "$SKILLS_DIR" ]; then
    echo -e "  ${GRAY}Cleaning existing skills directory...${NC}"
    find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 ! -name "learned" -exec rm -rf {} +
  else
    mkdir -p "$SKILLS_DIR"
  fi

  # Find needed sources
  local sources_needed
  sources_needed=$(node -e '
    var reg = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
    var skills = process.argv[2].split("\n").filter(Boolean);
    var src = {};
    for(var s of skills){
      if(reg.skills[s]) src[reg.skills[s].source]=1;
    }
    console.log(Object.keys(src).join("\n"));
  ' "$REGISTRY" "$skill_list")

  # Download sources
  echo -e "${YELLOW}[1/3] Downloading sources...${NC}"
  while IFS= read -r src; do
    [ -z "$src" ] && continue
    download_source "$src"
  done <<< "$sources_needed"
  echo -e "${GREEN}  Sources ready${NC}"

  # Copy skills to target
  echo -e "${YELLOW}[2/3] Installing skills...${NC}"
  local installed_count=0
  local installed_names=""

  while IFS= read -r skill_name; do
    [ -z "$skill_name" ] && continue

    local skill_info
    skill_info=$(node -e '
      var r = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
      var sk = r.skills[process.argv[2]];
      if(!sk){process.exit(1)}
      var src = r.sources[sk.source];
      console.log(sk.source+"|"+sk.path+"|"+(src.base_path||"")+"|"+(sk.install_as||sk.path));
    ' "$REGISTRY" "$skill_name" 2>/dev/null) || continue

    local source_id skill_path base_path install_as
    IFS='|' read -r source_id skill_path base_path install_as <<< "$skill_info"

    local src_dir="$TMP_DIR/$source_id"
    [ -n "$base_path" ] && src_dir="$src_dir/$base_path"
    src_dir="$src_dir/$skill_path"
    local dest_dir="$SKILLS_DIR/$install_as"

    if [ -d "$src_dir" ]; then
      mkdir -p "$(dirname "$dest_dir")"
      cp -r "$src_dir" "$dest_dir"
      installed_count=$((installed_count + 1))
      [ -n "$installed_names" ] && installed_names="$installed_names,"
      installed_names="$installed_names$skill_name"
    else
      echo -e "  ${YELLOW}Skip: $skill_name${NC}"
    fi
  done <<< "$skill_list"
  echo -e "${GREEN}  $installed_count skills installed${NC}"

  # Save record
  echo -e "${YELLOW}[3/3] Saving install record...${NC}"
  node -e '
    var r = {
      preset: process.argv[1]||null,
      modules: process.argv[2].split(",").filter(Boolean),
      skills: process.argv[3].split(",").filter(Boolean),
      installed_at: new Date().toISOString(),
      version: "1.0"
    };
    require("fs").writeFileSync(process.argv[4],JSON.stringify(r,null,2));
  ' "${preset_name:-}" "$modules_csv" "$installed_names" "$INSTALLED_FILE"
  echo -e "${GREEN}  Record saved${NC}"
  echo ""
  echo -e "${GREEN}Done! $installed_count skills installed to $SKILLS_DIR${NC}"
}

interactive_menu() {
  need_cmd node

  echo ""
  echo -e "${CYAN}  =======================================${NC}"
  echo -e "${CYAN}       Forge - Skill Module Installer    ${NC}"
  echo -e "${CYAN}  =======================================${NC}"
  echo ""
  echo "  Select a role preset or customize:"
  echo ""

  node -e '
    var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
    var ps = Object.entries(mf.presets);
    ps.forEach(function(e,i){
      var rec = (e[0]==="fullstack") ? " (recommended)" : "";
      console.log("    "+(i+1)+") "+e[0].padEnd(14)+"- "+e[1].description+rec);
    });
    console.log("    "+(ps.length+1)+") custom        - Pick individual modules");
  ' "$MODULES_FILE"

  local preset_count
  preset_count=$(node -e '
    var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
    console.log(Object.keys(mf.presets).length);
  ' "$MODULES_FILE")

  echo ""
  echo "  Core module (26 skills) is always included."
  local max_choice=$((preset_count + 1))
  read -rp "  Select [1-$max_choice, default=1]: " choice
  choice=${choice:-1}

  if [ "$choice" -eq "$max_choice" ] 2>/dev/null; then
    # Custom module selection
    echo ""
    echo -e "${CYAN}Available modules:${NC}"
    node -e '
      var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
      var mods = Object.entries(mf.modules).filter(function(e){return !e[1].required});
      mods.forEach(function(e,i){
        console.log("    "+(i+1)+") "+e[0]+" ("+e[1].skills.length+") - "+e[1].description);
      });
    ' "$MODULES_FILE"
    echo ""
    read -rp "  Enter numbers (comma-separated, e.g. 1,2,5): " mod_choices

    local selected_modules
    selected_modules=$(node -e '
      var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
      var mods = Object.entries(mf.modules).filter(function(e){return !e[1].required});
      var ch = process.argv[2].split(",").map(Number).filter(function(n){return !isNaN(n)});
      var sel = ch.map(function(i){return mods[i-1]}).filter(Boolean).map(function(e){return e[0]});
      sel.unshift("core");
      console.log(sel.join(","));
    ' "$MODULES_FILE" "$mod_choices")

    echo -e "  Selected: ${BOLD}$selected_modules${NC}"
    do_install "$selected_modules" ""
  else
    # Preset selection
    local preset_name modules_csv
    preset_name=$(node -e '
      var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
      var names = Object.keys(mf.presets);
      var idx = parseInt(process.argv[2]) - 1;
      if(idx>=0 && idx<names.length) console.log(names[idx]);
      else {console.error("Invalid");process.exit(1)}
    ' "$MODULES_FILE" "$choice")

    modules_csv=$(node -e '
      var mf = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
      var p = mf.presets[process.argv[2]];
      var m = ["core"].concat(p.modules);
      console.log(m.filter(function(v,i,a){return a.indexOf(v)===i}).join(","));
    ' "$MODULES_FILE" "$preset_name")

    echo -e "  Preset: ${BOLD}$preset_name${NC}"
    echo -e "  Modules: $modules_csv"
    echo ""
    do_install "$modules_csv" "$preset_name"
  fi
}

# --- Main ---

main() {
  [ ! -f "$REGISTRY" ] && die "skills-registry.json not found"
  [ ! -f "$MODULES_FILE" ] && die "modules.json not found"

  case "${1:-}" in
    --help|-h)    show_help ;;
    --list)       list_modules ;;
    --installed)  show_installed ;;
    --preset)
      [ -z "${2:-}" ] && die "Missing preset name"
      local mc
      mc=$(node -e '
        var mf=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
        var p=mf.presets[process.argv[2]];
        if(!p){console.error("Unknown preset");process.exit(1)}
        var m=["core"].concat(p.modules);
        console.log(m.filter(function(v,i,a){return a.indexOf(v)===i}).join(","));
      ' "$MODULES_FILE" "$2")
      do_install "$mc" "$2"
      ;;
    --modules)
      [ -z "${2:-}" ] && die "Missing module list"
      do_install "core,$2" ""
      ;;
    "")
      interactive_menu
      ;;
    *)
      die "Unknown option: $1"
      ;;
  esac
}

main "$@"