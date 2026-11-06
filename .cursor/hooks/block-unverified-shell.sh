#!/usr/bin/env bash
# beforeShellExecution: deny commit/push/PR create while verify flag is set.
# Fail-open for non-shipping commands and on script errors.
set +e
set +o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

allow() {
  printf '%s\n' '{"permission":"allow"}'
  exit 0
}

deny() {
  local agent_msg="$1"
  local user_msg="$2"
  jq -n \
    --arg am "$agent_msg" \
    --arg um "$user_msg" \
    '{permission:"deny",agent_message:$am,user_message:$um}' 2>/dev/null \
    || printf '%s\n' '{"permission":"allow"}'
  exit 0
}

main() {
  local input root flag cmd skills
  input="$(read_stdin_json)"
  root="$(repo_root "$PWD")"
  flag="$(flag_path "$root")"

  if ! require_jq; then
    allow
  fi

  cmd="$(printf '%s' "$input" | jq -r '.command // empty' 2>/dev/null)" || allow
  [[ -z "$cmd" ]] && allow

  if ! is_blocked_shipping_command "$cmd"; then
    allow
  fi

  if [[ ! -f "$flag" ]]; then
    allow
  fi

  skills="$(jq -r '.skills // [] | join(", ")' "$flag" 2>/dev/null)"
  if [[ -z "$skills" || "$skills" == "null" ]]; then
    allow
  fi

  deny \
    "Verify flag is set (${skills}). Run the matching yarn verify:* command (see .cursor/skills/) and wait for exit 0 before git commit / git push / gh pr create." \
    "Blocked: sensitive Safe Deal edits are unverified (${skills})."
}

main
allow
