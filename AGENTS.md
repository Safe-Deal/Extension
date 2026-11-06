# AGENTS

Safe Deal is a Chrome/Firefox extension for e-commerce protection (Amazon, AliExpress, eBay, Walmart) plus anti-scam warnings.

## Read first

- `CLAUDE.md` — architecture, entry points, yarn commands
- `.cursor/rules/pegasus-messaging.mdc` — content scripts / workers talk only via Pegasus (never direct `chrome.runtime` feature traffic)

## Verify before claiming done

Do not claim done on verdict, anti-scam, or full UI journeys until the matching skill’s command exits 0:

| Area | Skill | Command |
|---|---|---|
| Product/seller verdict, store rules, conclusion | `.cursor/skills/verify-safe-to-buy/SKILL.md` | `yarn verify:safe-to-buy-verdict` (+ `yarn verify:safe-to-buy-extension` if deal-box/UI path) |
| Anti-scam partner consensus | `.cursor/skills/verify-anti-scam-consensus/SKILL.md` | `yarn verify:anti-scam-consensus` |
| Full UI journeys | `.claude/skills/verify-safe-deal/SKILL.md` | per that skill |

Project hooks under `.cursor/hooks/` soft-remind on stop and block `git commit` / `git push` / `gh pr create` while sensitive edits are unverified. Tracking hooks fail open. Hooks need `jq` on PATH.
