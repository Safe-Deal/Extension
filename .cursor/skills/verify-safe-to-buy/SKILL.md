---
name: verify-safe-to-buy
description: Use when a change touches the product and seller verdict in the Safe Deal extension (ConclusionProduct, rule weights or bonus values, the Amazon or AliExpress item-page rules, or how rule results reach the deal box). Extension validation loads the built extension. The Jest command checks the verdict function only and is not that validation.
---

# Verify the safe-to-buy verdict

## Property

On an item page, the deal box says `RECOMMENDED` only when at least one product-review or seller-feedback rule produced valid data. With none, the verdict is `INSUFFICIENT_DATA`. Raising a valid rule's value or bonus never lowers the verdict.

## Harm

A shopper sees "Recommended Product" for an item whose reviews and seller were never checked, and buys on the strength of a badge or sales rank alone.

## Covered code

- `src/e-commerce/engine/logic/conclusion/conclusion-product.ts`: `ConclusionProduct.conclusion`. One call is one check. The indivisible steps are: the `numOfValidRules <= 1` guard, the regular-rule count, the divider, the value and bonus sum, and the threshold comparison.
- Rule shapes come from the real item-page rule lists: `RULES_PER_PAGE` in `amazon-site-rules.ts` and `ali-express-site-rules.ts`. Weights are read off the real rule instances.
- Run path in the extension: `src/e-commerce/worker/worker.ts` runs `RuleManager` in the service worker, so rule fetches leave from the service worker.

## Extension validation

Run from the Extension repo:

```bash
yarn verify:safe-to-buy-extension
```

It builds `dist`, then `test/playwright.ts` launches Chromium with `--load-extension` on that `dist`. `test/e2e/safe-to-buy/amazon-verdict.e2e.ts` serves a fixture item page and fixture responses with `context.route`, so no live Amazon and no `api.joinsafedeal.com` is reached. Playwright 1.48 only routes service-worker requests when `PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS=1`. The spec sets it before the context is created. Without it the service worker reaches the real network and the run is not a fixture run.

| Test | Fixture | Pass means |
|---|---|---|
| positive control | reviews 4.7 of 5, seller 99% positive, Choice badge, rank #12, sold and shipped by Amazon | box says Recommended |
| sign-in wall | same product document, reviews and seller pages return a sign-in form | box shows the "Conclusion indeterminate" icon and no Recommended text |

The positive control proves the lane can produce Recommended. Keep it. A run with only the second test would pass if the extension rendered nothing.

AliExpress has no extension lane. A 2026-10-27 attempt served an item page with `og:url`, `.product-main-wrap` and a `window.runParams` document. The content script mounted its toolbar, but the box never rendered and the service worker never fetched the item URL. The cause was not found. The spec and fixtures were removed. AliExpress is covered by the logic check and the fixed verdicts only.

Playwright MCP and Chrome DevTools MCP do not load `dist`. Do not use them as this validation.

## Logic check, not extension validation

```bash
yarn verify:safe-to-buy-verdict
```

Runs two Jest files against the real `ConclusionProduct`, with no stubs except the logger. `conclusion-product-verdict.test.ts` covers every combination of rule states. `conclusion-product-fixed-verdicts.test.ts` pins 25 hand-computed cases (16 Amazon, 9 AliExpress) to the documented formula: ratio = (sum of value x weight + bonuses) / (regular rules x 100), Recommended from 0.65, Doubtful from 0.4. Each case name states its arithmetic. Cases sit exactly on 0.65 and 0.4 and one step below. A case whose evidence is not a real rule state throws, so the table cannot drift off the real rule outputs. Amazon item page: 7,392 states. AliExpress item page: 2,058 states. It does not build the extension, open Chrome, or paint the box. A pass is not validation of the extension. Config: `test/jest.safe-to-buy-verdict.config.js`. The file is ignored by `yarn test`.

Rule states per rule are `invalid` or one valid value from the real algorithm's output table:

- Amazon: product reviews 1 to 10; seller feedback -20, 2, 6, 8, 9, 10; Choice bonus 80; best seller rank bonus 1 to 6 or 10; sold or shipped by Amazon bonus 7 or 10; pricing bonus 0.
- AliExpress: product reviews 1, 4, 7, 8, 9, 10; seller feedback as Amazon; top seller bonus 0 or 10; shop open years bonus -20, 0, 3, 7, 12, 15; pricing bonus 0.

An invalid rule keeps its real weight and value 0, as the real rule results do. Amazon reviews 1 to 10 is a superset of what the algorithm returns. If a rule's output table changes, update `rule-domains.ts` before trusting a pass.

## What the checks catch

Mutation run on 2026-10-27, each change made to `conclusion-product.ts` alone and reverted:

| Change | Caught by |
|---|---|
| Remove the regular-rule guard | logic check and extension check |
| Subtract bonuses | logic check and extension check |
| Recommended threshold 0.65 to 0.95 | fixed verdicts (5 cases) |
| Ignore rule weights | fixed verdicts (3 cases) |
| Doubtful threshold 0.4 to 0.5 | fixed verdicts (1 case) |
| Divider max 100 to 90 | fixed verdicts (5 cases) |

The extension check alone does not catch threshold or weight changes, because it runs one input per case. Over 16 consecutive runs it passed 16 times. The service worker can still register its message handlers after the page loads, which prints a `No handler registered in 'background'` error on the page. The Amazon lane tolerates it today. If the lane turns flaky, wait for that handler first.

## How to read a failure

Logic check: each example is `verdict <- rule: state | rule: state ...`. Replay it: build those rule results, call `conclusion()`. Count rules that are valid with weight above 0 (guard needs at least 2). Count valid rules that are not bonus rules (the divider is that count times 100). If that count is 0 the divider is 0 and the ratio is `Infinity` or `NaN`.

Extension validation: the failing test names the scenario. The fixture documents are in `amazon-fixtures.ts`. If the control fails, the harness or a selector changed. Fix that first. If only the sign-in test fails, read the verdict text in the box.

If a step cannot happen in the code, the harness is wrong. Fix the harness, not the property. Do not change product code unless the user asks. Do not drop a state to make the command pass.

## Known finding

Fixed on 2026-10-27. Both commands pass.

- Defect: on Amazon, Choice, rank, sold-by-Amazon, and pricing are bonus rules. The "enough data" guard counted them, but the divider counts regular rules only. Two valid bonus rules and no regular rule gave a divider of 0, a ratio of `Infinity`, and `RECOMMENDED`. The built extension showed "Recommended Product" when Amazon hid reviews and seller behind sign-in.
- Fix: `ConclusionProduct.conclusion` returns `INSUFFICIENT_DATA` when no regular rule is valid (`MIN_REGULAR_RULES_FOR_CONCLUSION`). The unit test that expected `RECOMMENDED` from bonus rules alone now expects `INSUFFICIENT_DATA`, and a new test keeps "great bonus plus one valid regular rule" as `RECOMMENDED`.
- Live Amazon, clean logged-out Chromium: the service worker's `/product-reviews/<ASIN>/` fetch redirects to `/ap/signin`. Whether signed-in shoppers get the same page was not checked.

Not a property, because the intent is not settled: 162 Amazon states where every valid review or seller value is 2 or below still return `RECOMMENDED`, because Choice adds 80 of a 100-point divider.

## When the promise changes on purpose

Change the property only when the change says the verdict rule is intended to be different: the commit message, a test, or a comment on `conclusion()`. Write the old sentence, the new sentence, and that evidence here, then rerun. Otherwise keep the property and report the failure.
