# Safe Deal verification map

This directory is the maintained source for verifying the extension's user-facing behavior. Read the index, then use the feature file as the recipe.

## Baseline preconditions

- `node $SD doctor` exits 0, where `SD=.claude/skills/verify-safe-deal/scripts/sd.mjs`, run from the repo root.
- Each journey starts from a fresh install with an empty profile, logged out.
- Live journeys need internet access. Fixture journeys need none.

## Driving conventions

- Run each recipe with `node $SD run <journey>`. Exit code `0` and `RESULT PASS` mean every step held.
- Treat a listed `Known failing` journey as still failing until a run shows otherwise. If it passes, update the entry.
- Add new checks to the journey file rather than performing them by hand.

## Proof and skip reporting

- Report the journey name, result, and evidence path.
- Report an unreachable path with the command tried and the unmet precondition. Do not report it as verified through a different path.
- Say which lane proved a claim. A fixture pass says nothing about whether the live site still matches.

## Feature entry contract

Each feature file has an H1, one paragraph of user-visible behavior, and four H2 sections in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with sd.mjs`, `Gotchas`.

## Current state

Recorded on 2026-11-06, version 5.8.23. Two commits were built in private worktrees and run in full or in part:

| Journey | Lane | `c3875ad` (main) | `5ddbe2c` (`creuven/verify-safe-to-buy`) |
|---|---|---|---|
| `amazon-verdict` | fixture | Pass | Pass |
| `amazon-verdict-signin-wall` | fixture | **Fail**: says Recommended Product | Pass: says Conclusion indeterminate |
| `amazon-live` | live | Pass, verdict Conclusion indeterminate | not run |
| `ebay-live` | live | **Fail**: eBay answers 403 | not run |
| `amazon-search-live` | live | Pass | not run |
| `anti-scam-dangerous` | fixture | **Fail**: modal never appears | **Fail**: same |
| `anti-scam-safe` | fixture | **Fail**: site never recorded as safe | not run |
| `affiliate-link` | fixture | Pass | not run |
| `popup-home` | fixture | Pass | not run |

The sign-in-wall journey fails before the fix and passes after it, so it detects the defect and not just the environment. A "Fail" here is a finding about the product or the environment, not a harness fault. Treat it as still failing until a run shows otherwise.

## Features

- [Product verdict](./product-verdict.md) covers the toolbar on Amazon and eBay item pages.
- [Search result shields](./search-results.md) covers Amazon result lists.
- [Anti-scam warning](./anti-scam.md) covers the danger modal, its choices, and trusted sites.
- [Affiliate link](./affiliate-link.md) covers the scheduled link, the badge, and the popup banner.
- [Toolbar popup](./popup.md) covers the popup's identity, share links, and dropdown.

## Not mapped

- **Sign-in and premium.** The flow needs a real joinsafedeal.com account and an OAuth login, which no fixture stands in for. Unmet precondition, not verified.
- **Alibaba supplier tools.** The content script exits unless the debug flag is on, so the production bundle never shows them.
- **Firefox.** The harness loads the Chrome manifest only.
- **First-run tour.** It starts on an item page with `?safe_deal_installed=1`. Not driven yet.
