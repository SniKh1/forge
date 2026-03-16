#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  GITHUB_TOKEN=... scripts/reset-github-releases.sh [--repo owner/name] [--prefix v0.3.] [--apply]

Description:
  Deletes GitHub Release objects and matching git tag refs whose tag names start with the given prefix.

Defaults:
  --repo   inferred from git origin remote
  --prefix v0.3.
  --apply  omitted means dry run
EOF
}

repo=""
prefix="v0.3."
apply="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      repo="${2:-}"
      shift 2
      ;;
    --prefix)
      prefix="${2:-}"
      shift 2
      ;;
    --apply)
      apply="true"
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "GITHUB_TOKEN is required." >&2
  exit 1
fi

if [[ -z "$repo" ]]; then
  origin_url="$(git remote get-url origin)"
  repo="$(printf '%s' "$origin_url" | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')"
fi

api="https://api.github.com/repos/$repo"
auth_header="Authorization: Bearer $GITHUB_TOKEN"
accept_header="Accept: application/vnd.github+json"

echo "Repository: $repo"
echo "Prefix:     $prefix"
echo "Mode:       $([[ "$apply" == "true" ]] && echo apply || echo dry-run)"
echo

release_json="$(curl -fsSL -H "$auth_header" -H "$accept_header" "$api/releases?per_page=100")"
mapfile -t releases < <(printf '%s' "$release_json" | python3 - "$prefix" <<'PY'
import json, sys
prefix = sys.argv[1]
data = json.load(sys.stdin)
for rel in data:
    tag = rel.get("tag_name", "")
    if tag.startswith(prefix):
        print(f"{rel['id']} {tag}")
PY
)

tag_json="$(curl -fsSL -H "$auth_header" -H "$accept_header" "$api/git/matching-refs/tags/$prefix")"
mapfile -t tags < <(printf '%s' "$tag_json" | python3 - "$prefix" <<'PY'
import json, sys
prefix = sys.argv[1]
data = json.load(sys.stdin)
if isinstance(data, dict) and data.get("message"):
    sys.exit(0)
for ref in data:
    full = ref.get("ref", "")
    if full.startswith("refs/tags/"):
        tag = full.removeprefix("refs/tags/")
        if tag.startswith(prefix):
            print(tag)
PY
)

echo "Releases to delete:"
if [[ ${#releases[@]} -eq 0 ]]; then
  echo "  (none)"
else
  printf '  %s\n' "${releases[@]}"
fi

echo
echo "Tags to delete:"
if [[ ${#tags[@]} -eq 0 ]]; then
  echo "  (none)"
else
  printf '  %s\n' "${tags[@]}"
fi

if [[ "$apply" != "true" ]]; then
  echo
  echo "Dry run only. Re-run with --apply to delete."
  exit 0
fi

for item in "${releases[@]}"; do
  release_id="${item%% *}"
  tag_name="${item#* }"
  echo "Deleting release $tag_name ($release_id)"
  curl -fsSL -X DELETE -H "$auth_header" -H "$accept_header" "$api/releases/$release_id" >/dev/null
done

for tag in "${tags[@]}"; do
  echo "Deleting tag $tag"
  encoded_tag="${tag//\//%2F}"
  curl -fsSL -X DELETE -H "$auth_header" -H "$accept_header" "$api/git/refs/tags/$encoded_tag" >/dev/null
done

echo
echo "Completed."
