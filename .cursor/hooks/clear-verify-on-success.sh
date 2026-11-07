#!/usr/bin/env bash
# afterShellExecution: clear verify flag skills when matching yarn verify:* looks successful.
# Fail-open: always exit 0. Does not run Jest/Playwright itself.
set +e
set +o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

main() {
  local input root flag cmd output skill
  input="$(read_stdin_json)"
  root="$(repo_root "$PWD")"
  flag="$(flag_path "$root")"

  if ! require_jq || [[ ! -f "$flag" ]]; then
    exit 0
  fi

  cmd="$(printf '%s' "$input" | jq -r '.command // empty' 2>/dev/null)" || exit 0
  output="$(printf '%s' "$input" | jq -r '.output // empty' 2>/dev/null)" || output=""

  skill="$(detect_verify_command_skill "$cmd" || true)"
  [[ -z "$skill" ]] && exit 0

  if ! output_looks_successful "$output"; then
    exit 0
  fi

  remove_skill_from_flag "$flag" "$skill"
  exit 0
}

main
exit 0
