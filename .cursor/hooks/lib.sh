#!/usr/bin/env bash
# Shared helpers for Safe Deal agent verify hooks. Fail-open callers must trap errors.

FLAG_REL=".tmp/agent-verify-needed.json"

repo_root() {
  local start="${1:-$PWD}"
  if command -v git >/dev/null 2>&1; then
    local root
    root="$(git -C "$start" rev-parse --show-toplevel 2>/dev/null)" || true
    if [[ -n "$root" ]]; then
      printf '%s\n' "$root"
      return 0
    fi
  fi
  printf '%s\n' "$start"
}

flag_path() {
  local root
  root="$(repo_root "${1:-$PWD}")"
  printf '%s/%s\n' "$root" "$FLAG_REL"
}

require_jq() {
  command -v jq >/dev/null 2>&1
}

read_stdin_json() {
  cat
}

# Normalize absolute or relative paths to repo-relative form with forward slashes.
rel_path() {
  local file_path="$1"
  local root="$2"
  local rel="$file_path"
  if [[ "$file_path" == "$root"/* ]]; then
    rel="${file_path#"$root"/}"
  fi
  rel="${rel#./}"
  printf '%s\n' "${rel//\\//}"
}

empty_flag_json() {
  printf '%s\n' '{"skills":[],"paths":[],"stop_reminded":false}'
}

ensure_flag_file() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  if [[ ! -f "$path" ]]; then
    empty_flag_json >"$path"
  fi
}

# Classify a repo-relative path. Prints skill id or nothing.
# Skills: verify-safe-to-buy | verify-anti-scam-consensus
classify_path() {
  local rel="$1"

  case "$rel" in
    src/anti-scam/logic/anti-scam-logic.ts)
      printf '%s\n' "verify-anti-scam-consensus"
      return 0
      ;;
  esac

  case "$rel" in
    src/e-commerce/engine/logic/conclusion/*) ;;
    src/e-commerce/engine/stores/*/rules|src/e-commerce/engine/stores/*/rules/*) ;;
    src/e-commerce/engine/stores/*/*-site-rules.ts) ;;
    src/e-commerce/worker/worker.ts) ;;
    *)
      return 1
      ;;
  esac
  printf '%s\n' "verify-safe-to-buy"
}

skill_command_hint() {
  case "$1" in
    verify-safe-to-buy)
      printf '%s\n' "Read and run .cursor/skills/verify-safe-to-buy/SKILL.md — yarn verify:safe-to-buy-verdict (and yarn verify:safe-to-buy-extension if deal-box/UI path touched)."
      ;;
    verify-anti-scam-consensus)
      printf '%s\n' "Read and run .cursor/skills/verify-anti-scam-consensus/SKILL.md — yarn verify:anti-scam-consensus."
      ;;
    *)
      printf '%s\n' "Run the matching verify skill under .cursor/skills/."
      ;;
  esac
}

# Match blocked shipping commands while verify flag is set.
is_blocked_shipping_command() {
  local cmd="$1"
  # Normalize whitespace for matching.
  local compact
  compact="$(printf '%s' "$cmd" | tr '\n' ' ')"

  if printf '%s' "$compact" | grep -Eq '(^|[[:space:];|&])git[[:space:]]+commit([[:space:]]|$)'; then
    return 0
  fi
  if printf '%s' "$compact" | grep -Eq '(^|[[:space:];|&])git[[:space:]]+push([[:space:]]|$)'; then
    return 0
  fi
  if printf '%s' "$compact" | grep -Eq '(^|[[:space:];|&])gh[[:space:]]+pr[[:space:]]+create([[:space:]]|$)'; then
    return 0
  fi
  if printf '%s' "$compact" | grep -Eq '(^|[[:space:];|&])gh[[:space:]]+pr[[:space:]]+create\b'; then
    return 0
  fi
  return 1
}

# Detect which verify skill a shell command satisfies (if any).
# Prints skill id or nothing.
detect_verify_command_skill() {
  local cmd="$1"
  local compact
  compact="$(printf '%s' "$cmd" | tr '\n' ' ')"

  if printf '%s' "$compact" | grep -Eq 'yarn[[:space:]]+verify:anti-scam-consensus|npm[[:space:]]+run[[:space:]]+verify:anti-scam-consensus'; then
    printf '%s\n' "verify-anti-scam-consensus"
    return 0
  fi
  if printf '%s' "$compact" | grep -Eq 'yarn[[:space:]]+verify:safe-to-buy-(verdict|extension)|npm[[:space:]]+run[[:space:]]+verify:safe-to-buy-(verdict|extension)'; then
    printf '%s\n' "verify-safe-to-buy"
    return 0
  fi
  return 1
}

# Heuristic success from Jest/Playwright output (afterShellExecution has no exit_code).
output_looks_successful() {
  local output="$1"
  if printf '%s' "$output" | grep -Eq 'Test Suites:.*[1-9][0-9]* failed'; then
    return 1
  fi
  if printf '%s' "$output" | grep -Eq '(^|[^0-9])[1-9][0-9]* failed'; then
    return 1
  fi
  if printf '%s' "$output" | grep -Eq 'Test Suites:[[:space:]]*[1-9][0-9]* passed'; then
    return 0
  fi
  if printf '%s' "$output" | grep -Eq '(^|[^0-9])[1-9][0-9]* passed' \
    && ! printf '%s' "$output" | grep -Eq '(^|[^0-9])[1-9][0-9]* failed'; then
    return 0
  fi
  return 1
}

remove_skill_from_flag() {
  local path="$1"
  local skill="$2"
  if [[ ! -f "$path" ]] || ! require_jq; then
    return 0
  fi
  local tmp
  tmp="$(mktemp)"
  jq --arg skill "$skill" '
    .skills |= map(select(. != $skill))
    | .paths |= map(select(.skill != $skill))
    | if (.skills | length) == 0 then empty else . end
  ' "$path" >"$tmp" 2>/dev/null || {
    rm -f "$tmp"
    return 0
  }
  if [[ ! -s "$tmp" ]]; then
    rm -f "$path" "$tmp"
  else
    mv "$tmp" "$path"
  fi
}
