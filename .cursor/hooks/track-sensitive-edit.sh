#!/usr/bin/env bash
# afterFileEdit: mark sensitive Safe Deal paths for verify skills.
# Fail-open: always exit 0.
set +e
set +o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

main() {
  local input root file_path rel skill flag
  input="$(read_stdin_json)"
  root="$(repo_root "$PWD")"
  flag="$(flag_path "$root")"

  if ! require_jq; then
    exit 0
  fi

  file_path="$(printf '%s' "$input" | jq -r '.file_path // empty' 2>/dev/null)" || exit 0
  [[ -z "$file_path" ]] && exit 0

  rel="$(rel_path "$file_path" "$root")"
  skill="$(classify_path "$rel" || true)"
  [[ -z "$skill" ]] && exit 0

  ensure_flag_file "$flag"
  local tmp
  tmp="$(mktemp)"
  jq --arg skill "$skill" --arg path "$rel" '
    .skills = ((.skills // []) + [$skill] | unique)
    | .paths = (
        ((.paths // []) + [{path: $path, skill: $skill}])
        | unique_by(.path)
      )
    | .stop_reminded = false
  ' "$flag" >"$tmp" 2>/dev/null && mv "$tmp" "$flag" || rm -f "$tmp"

  exit 0
}

main
exit 0
