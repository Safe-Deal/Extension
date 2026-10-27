---
name: verify-anti-scam-consensus
description: Side check. Use when a change touches ApiScamPartners.evaluate, SCAM_ENGINES_IN_PRIORITY, or MIN_DANGEROUS_VOTES in the Safe Deal extension. The core product and seller verdict is verify-safe-to-buy. This skill has a Jest vote-function check only and no extension validation.
---

# Verify anti-scam partner consensus

Side check. The extension's main job is the product and seller verdict, covered by `verify-safe-to-buy`.

## Property

`ApiScamPartners.evaluate` returns `DANGEROUS` when at least two of `ApiScamWOT`, `ApiScamNorton`, and `ApiScamVoidUrl` returned `DANGEROUS` and none of them returned `SAFE`. Otherwise it does not return `DANGEROUS`. The open tab does not change the conclusion.

## Harm

A shopper misses a scam warning when two partner engines agree the site is dangerous, or gets a scam warning from the tab's title, favicon, and HTTPS score instead of those engines.

## Why this promise replaced the old one

Old property: `evaluate` returns `DANGEROUS` exactly when all three engines returned `DANGEROUS`.

That matched `dangerousAmount === ENGINES_COUNT` only if the tab was not counted. Norton's `get` never returns `DANGEROUS`, so a count of exactly 3 never happened without the tab. Removing the tab and keeping "all three" would have turned scam warnings off. The tab score is not an engine. Two agreeing engines, with no `SAFE` vote, is the warning that path was approximating. The user asked for that recommendation.

## Covered code

Describes the working tree of `src/anti-scam/logic/anti-scam-logic.ts` after the tab stopped voting. Base commit `c3875ad6d8071bc205efd3dc53ae5177fc051ba5` does not contain that edit. Move the sync commit forward only after a commit contains this description and you confirm the steps below still match `evaluate`. A passing run is not that confirmation.

- `src/anti-scam/logic/anti-scam-logic.ts`
  - `SCAM_ENGINES_IN_PRIORITY` — `ApiScamWOT`, `ApiScamNorton`, `ApiScamVoidUrl`, in that order
  - `MIN_DANGEROUS_VOTES` — 2
  - `ApiScamPartners.evaluate` — one call is one check. The indivisible steps are: `Promise.allSettled` on the three `get` calls, the fulfilled-result loop that increments `dangerousAmount`, the `hasSafe` return, the `dangerousAmount >= MIN_DANGEROUS_VOTES` return, the final `SAFE` return, and the `catch` that returns `NO_DATA`. `examineTab` is not called.

If an engine is added, removed, or reordered, or `evaluate` calls `examineTab` again, update the harness before you move the sync commit.

## Bounds and assumptions

The harness calls the real `evaluate`. It stubs `examineTab` and each engine `get`, so no network runs. Every combination is checked (5 × 4 × 4 × 4 = 320):

- tab: `absent` (tabId `0`), `SAFE`, `DANGEROUS`, `NO_DATA`, `throw`
- each engine: `SAFE`, `DANGEROUS`, `NO_DATA`, `reject`

Assumptions that match the code:

- `evaluate` does not call `examineTab`. A tab outcome, including a throw from the stub, must not change the conclusion. If a throw makes the conclusion `NO_DATA` while two engines returned `DANGEROUS`, `evaluate` is calling `examineTab` inside its `try` again.
- A rejected engine is not a vote. `NO_DATA` is a fulfilled verdict and is not `DANGEROUS` or `SAFE`.
- Any fulfilled `SAFE` returns `SAFE` before the danger count is checked.

This does not cover `validateTab` scoring, the WOT, Norton, or VoidURL parsers, the whitelist, or `initAntiScamWorker`. Norton's `get` today returns only `SAFE` or `NO_DATA`. The harness still feeds it `DANGEROUS`, because `evaluate` accepts that verdict.

## Extension validation

None yet. A Playwright lane needs `PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS=1`, because the engines are fetched from the service worker and Playwright 1.48 does not route those requests otherwise. An earlier attempt without the flag never saw the three engine requests. Retry with the flag before building anything else.

## Logic check, not extension validation

`yarn verify:anti-scam-consensus` calls `evaluate` in Jest and stubs `get` on the three engine classes. It does not build the extension, open Chrome, or paint the warning. Exit 0 means the vote function holds for 320 scripted combinations. Exit 1 means the received list is the violations. A pass here is not validation of the extension. Config: `test/jest.anti-scam-consensus.config.js`. Jest 29.7.0 and ts-jest 29.2.5. The file is ignored by `yarn test`.

## How to read a failure

Each violation is one sequence: what the tab did, what each engine returned, what `evaluate` returned, and which side of the property broke.

Replay it on `ApiScamPartners.evaluate`:

1. The three `get` calls run. The tab is not consulted.
2. Only `fulfilled` results are pushed. Only a `DANGEROUS` fulfilled result increments `dangerousAmount`.
3. Any pushed `SAFE` returns `SAFE`.
4. `dangerousAmount >= 2` returns `DANGEROUS`. Any smaller count returns `SAFE`.
5. A throw from an engine `get` is absorbed by `Promise.allSettled`. A throw outside that returns `NO_DATA`.

If a step cannot happen in that function, the harness is wrong. Fix the harness, not the property. If every step can happen, it is a bug in `evaluate`. Do not change product code unless the user asks. Do not drop a case to make the command pass.

## Known finding

Logic check: none. The previous failure was the tab being added into `dangerousAmount` and compared with 3. That code is gone. A new logic-check violation is a regression or a harness that no longer describes `evaluate`.

## When the promise changes on purpose

Change the property only when the change says the vote rule is intended to be different: the commit message, a test, or a comment on `evaluate`. Write the old sentence, the new sentence, and that evidence here, then rerun. Otherwise keep the property and report the failure.
