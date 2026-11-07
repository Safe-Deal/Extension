#!/usr/bin/env bash
# stop: soft-remind once per unverified sensitive edit batch.
# Keeps the flag so beforeShellExecution can still block shipping.
# Fail-open: print {} on errors.
set +e
set +o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

emit_empty() {
  printf '%s\n' '{}'
  exit 0
}

input="$(read_stdin_json)"
root="$(repo_root "$PWD")"
flag="$(flag_path "$root")"

if ! require_jq || [[ ! -f "$flag" ]]; then
  emit_empty
fi

status="$(printf '%s' "$input" | jq -r '.status // "completed"' 2>/dev/null)" || emit_empty
loop_count="$(printf '%s' "$input" | jq -r '.loop_count // 0' 2>/dev/null)" || loop_count=0

[[ "$status" == "completed" ]] || emit_empty

reminded="$(jq -r '.stop_reminded // false' "$flag" 2>/dev/null)" || emit_empty
if [[ "$reminded" == "true" ]] || [[ "${loop_count:-0}" -gt 0 ]]; then
  emit_empty
fi

mapfile -t skill_list < <(jq -r '.skills // [] | .[]' "$flag" 2>/dev/null)
if [[ ${#skill_list[@]} -eq 0 ]]; then
  emit_empty
fi

lines="Sensitive Safe Deal paths were edited this turn. Do not claim done until the listed command exits 0."
for skill in "${skill_list[@]}"; do
  [[ -z "$skill" ]] && continue
  lines+=$'\n'"- $(skill_command_hint "$skill")"
done
lines+=$'\n'"Hooks block git commit / git push / gh pr create until a matching yarn verify:* command succeeds."

tmp="$(mktemp)"
jq '.stop_reminded = true' "$flag" >"$tmp" 2>/dev/null && mv "$tmp" "$flag" || rm -f "$tmp"

jq -n --arg m "$lines" '{followup_message: $m}' 2>/dev/null || emit_empty
exit 0
