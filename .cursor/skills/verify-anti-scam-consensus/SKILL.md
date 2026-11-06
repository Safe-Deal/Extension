---
name: verify-anti-scam-consensus
description: Side check. Use when a change touches ApiScamPartners.evaluate, concludeFromVotes, SCAM_ENGINES_IN_PRIORITY, MIN_DANGEROUS_VOTES, or ApiScamNorton rating codes in the Safe Deal extension. The core product and seller verdict is verify-safe-to-buy. This skill has a Jest vote-function check only and no extension validation.
---

# Verify anti-scam partner consensus

Side check. The extension's main job is the product and seller verdict, covered by `verify-safe-to-buy`.

## Property

Only `ApiScamWOT`, `ApiScamNorton`, and `ApiScamVoidUrl` vote, and only a fulfilled `SAFE` or `DANGEROUS` is a vote. `NO_DATA` and a rejected engine are not votes. With no votes, `evaluate` returns `NO_DATA`. It returns `DANGEROUS` when at least two engines voted `DANGEROUS` and they outnumber the `SAFE` votes. It returns `SAFE` when `SAFE` votes outnumber `DANGEROUS` votes. Every other tally, a tie or one lone `DANGEROUS`, returns `NO_DATA`. The open tab does not change the conclusion.

Norton votes `SAFE` on rating `g` and `DANGEROUS` on rating `b`. Every other rating, or none, is `NO_DATA`.

## Harm

A shopper misses a scam warning when two engines agree the site is dangerous and a weak `SAFE` (the tab score, or Norton's `g`) vetoes them. Or the extension whitelists a site because no engine answered, since the content script calls `markAsSafe()` on `SAFE`.

## Why this promise replaced the old one

Old property: `evaluate` returns `DANGEROUS` when at least two engines returned `DANGEROUS` and none returned `SAFE`. Any `SAFE` wins, and no `SAFE` with fewer than two dangers is `SAFE`.

New property: the majority rule above, with `NO_DATA` for no votes or an inconclusive tally.

Evidence, from the anti-scam verdict bug fix (bug 2 in `BUG_REPORT.md`). All three engines unreachable returned `SAFE` and whitelisted the site. Norton returns `g` for google.com, amazon.com, unrated and nonexistent domains, and wicar.org (a malware test site), so one `g` must not veto two dangers. Norton's `b` means blocked and was counted as `SAFE`. The tab heuristic is no longer consulted, and `tab-content-rater.ts` is unchanged.

## Covered code

- `src/anti-scam/logic/anti-scam-logic.ts`
  - `SCAM_ENGINES_IN_PRIORITY` lists `ApiScamWOT`, `ApiScamNorton`, `ApiScamVoidUrl`, in that order.
  - `MIN_DANGEROUS_VOTES` is 2.
  - `concludeFromVotes({ dangerous, safe })` is the pure vote rule.
  - `ApiScamPartners.evaluate` runs `Promise.allSettled` on the three `get` calls, tallies fulfilled `SAFE` and `DANGEROUS`, and returns `concludeFromVotes(tally)`. Its `catch` returns `NO_DATA`. `examineTab` is not called.
- `src/anti-scam/scam-rater/api-scam-norton.ts` maps the rating code to a verdict.

If an engine is added, removed, or reordered, or `evaluate` calls `examineTab` again, update the tests.

## Logic check, not extension validation

The check is Jest, run by `yarn test`:

```bash
npx jest --config ./test/jest.config.js --coverage=false src/anti-scam/__tests__/anti-scam-logic.test.ts src/anti-scam/scam-rater/__tests__/api-scam-norton.test.ts
```

`anti-scam-logic.test.ts` checks `concludeFromVotes` on a tally table and drives the real `evaluate` through all 64 WOT x Norton x VoidURL outcomes (`SAFE`, `DANGEROUS`, `NO_DATA`, `reject`) with each engine's `get` stubbed on its prototype and `examineTab` mocked, so no network runs. `api-scam-norton.test.ts` stubs `Remote.getJson` and checks each rating code, a missing body, and a failed request.

The `yarn verify:anti-scam-consensus` script and `test/jest.anti-scam-consensus.config.js` point at `src/anti-scam/verification/api-scam-partners-consensus.test.ts`, which does not exist. Use the command above.

A pass does not cover the WOT and VoidURL parsers, the whitelist, `initAntiScamWorker`, or the modal on a page.

## Extension validation

None yet. A Playwright lane needs `PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS=1`, because the engines are fetched from the service worker and Playwright 1.48 does not route those requests otherwise. An earlier attempt without the flag never saw the three engine requests. Retry with the flag before building anything else.

## How to read a failure

A failing combination names what each engine returned. Count the fulfilled `SAFE` and `DANGEROUS` results, apply the property, and compare with `evaluate`'s result. If the property gives the received value, the test oracle is wrong. Otherwise it is a bug in `evaluate` or `concludeFromVotes`. Do not drop a case to make the run pass.

## When the promise changes on purpose

Change the property only when the change says the vote rule is intended to be different: the commit message, a test, or a comment on `evaluate`. Write the old sentence, the new sentence, and that evidence here, then rerun. Otherwise keep the property and report the failure.
