---
name: verify-safe-deal
description: Drive the built Safe Deal browser extension in a disposable Chromium and prove behavior with evidence, covering the Amazon and eBay product verdict toolbar, search result shields, the anti-scam modal, the affiliate link flow, and the toolbar popup. Use to confirm a change works in the real extension rather than only in unit tests, to reproduce a user-visible extension bug, or before claiming extension work is done.
---

# Verify Safe Deal

Safe Deal is a Chrome extension, so its surface is web pages it modifies plus a toolbar popup. This skill builds the production bundle, loads it into a throwaway Chromium, drives one scripted journey, and writes evidence. Every command runs from the repo root.

```bash
SD=.claude/skills/verify-safe-deal/scripts/sd.mjs
node $SD build                 # about 25s cold, reruns after any source change
node $SD doctor                # read-only, run first and whenever anything looks off
node $SD run amazon-verdict    # one browser, one journey, exit code 0 or 1
```

Read [`features/README.md`](features/README.md) for the feature map, then the file for the feature you changed. Run every journey that file lists. Passing one entry point does not prove the others.

## Do not use these instead

- **`dist/`, `yarn dev`, `yarn dist:*`.** `dist/` and port 9090 belong to the developer's watcher. `yarn dist:clean` and `yarn test:dist` delete `dist/`. This skill builds to `.tmp/verify-safe-deal/build` and touches neither.
- **`yarn test:e2e` and `test/playwright.ts`.** They load `dist/` and block the install page with a route added after launch, which is too late. With a production `dist/`, each test can open the real install page and fire real ad conversions.
- **Playwright MCP and Chrome DevTools MCP.** Their browsers do not load this extension.

## Real side effects the harness blocks

Do not remove these guards or route around them. They exist because each one fired, or would fire, against production:

| Behavior in the production bundle | What would happen | What the harness does |
|---|---|---|
| Install opens `api.joinsafedeal.com/get` | Google Ads, GA, Facebook, LinkedIn, Pinterest, and Quora record a fake install | Refuses that host at the proxy until the install tab is closed. It happens during launch, before any Playwright route can exist |
| Listed stores schedule a pinned tab to `const.joinsafedeal.com/ads/?url=<link>` 6 to 24 seconds later | A fake affiliate click | Aborts it and records the target as `affiliate-click` |
| The popup banner opens the affiliate link | A fake affiliate click | Refuses all 347 affiliate hosts from `shutafim.json`, plus any link `/links` returned |
| `logError` posts to `api.joinsafedeal.com/error` | Noise in the production error log | Answers 204 and keeps the body as `error-report` evidence |

Live journeys still reach Amazon or eBay, plus `api.joinsafedeal.com/links` and `/price`. Fixture journeys reach nothing: `h.offline()` makes the proxy refuse every host too.

## Launch

`node $SD run <journey>` launches, drives, and tears down in one process. There is no server to keep alive.

Ready means all of these held, and the run fails with the reason otherwise:

1. The install tab appeared, and the guard refused its host.
2. The tab was closed, and only then was the host released.
3. The extension worker exposes `chrome.runtime`. It exposes a bare `chrome` first, so never evaluate against it before this.
4. The loaded manifest is v3 and matches `package.json`.

`run` refuses a build older than the sources, so rerun `build` after any edit or branch switch. If the checkout moves between `build` and `run`, that refusal is correct: the build no longer matches the tree.

**Isolation.** Runs can overlap. Each gets its own copy of the build, a new profile, and an ephemeral proxy and debug port. Do not run two `build` commands at once, because they share webpack's cache.

The harness needs the Playwright Chromium in `doctor`'s output. Branded Chrome ignores `--load-extension`.

## Doctor

`node $SD doctor` answers whether a run is worth attempting. It checks the Playwright Chromium, `.env` presence, build freshness, manifest version, whether amazon.com is reachable, and abandoned runs. It exits 1 if any check fails and changes nothing.

## Drive

Shipped journeys are in `scripts/journeys/`. To test something else, write a one-off under `.tmp/verify-safe-deal/adhoc/`, which is gitignored:

```js
// .tmp/verify-safe-deal/adhoc/reviews-tab.mjs
import { AMAZON_ITEM_URL, serveAmazonItem } from "../../../.claude/skills/verify-safe-deal/scripts/lib/fixtures.mjs";

export default async (h) => {
  serveAmazonItem(h);
  await h.step("open the item", () => h.page.goto(AMAZON_ITEM_URL));
  await h.step("expand", () => h.page.locator(".safe-deal-container").click({ timeout: 30_000 }));
  await h.shot("expanded");
};
```

```bash
node $SD run .tmp/verify-safe-deal/adhoc/reviews-tab.mjs
```

A journey receives `h`:

| Member | Use |
|---|---|
| `h.page`, `h.context`, `h.worker`, `h.extensionId` | Playwright objects, already past the ready checks |
| `h.expect`, `h.sleep(ms)` | Playwright assertions (they default to 5s, so pass `timeout`) |
| `h.step(name, fn)` | A named check. A throw ends the run and saves `failure.png` |
| `h.openPopup()` | Opens the real toolbar popup over the current tab and returns its page |
| `h.serve(urlOrRegex, { html } or { json, status })` | Answers a URL with a fixture, including worker requests |
| `h.offline()` | Refuses everything not served, at the route and the proxy |
| `h.badgeText()` | The action badge text |
| `h.serviceWorkerRequests()` | Extension worker requests with their `disposition` |
| `h.guardEvents(kind?)` | Guard records such as `affiliate-click` or `proxy-denied` |
| `h.shot(name, page?)`, `h.saveHtml(name, locator)`, `h.observe(key, value)` | Evidence |

Stable handles, in preference order: `data-testid="floating-toolbar"`, `[data-sd-item="<id>"]` (present only once analysis finished), `.safe-deal-container`, `.sd-product-full__header__title`, the MUI tabs by role and name, `.safe-deal-image-wholesale-product`, `#safe-deal-anti-scam-root`, `#anti-scam-modal-title`, `.affiliation-banner`.

**Do not open `popup.html` in a tab.** The banner asks for the active tab, which would be the popup itself, so the banner silently never appears. Use `h.openPopup()`.

**Fixtures** replace only sites outside the extension: store pages and rater sites, in `scripts/lib/fixtures.mjs`. The bundle, content scripts, worker, and rule engine are always real. A fixture of `/links` or `/price` would hide the backend contract, so use a live journey for those.

## Evidence

Each run writes to `.tmp/verify-safe-deal/runs/<journey>-<time>-<id>/evidence/`, and `RESULT PASS|FAIL <path>` prints it. Cleanup never removes this directory.

| File | Holds |
|---|---|
| `report.json` | Status, the build's branch and commit, boot checks, steps, observations, guard counts |
| `steps.jsonl` | Each check with duration and error |
| `*.png`, `*.html` | Screenshots and DOM captured by the journey, and `failure.png` on failure |
| `service-worker-network.jsonl` | Every extension worker request and what happened to it |
| `guard.jsonl` | Every host the browser contacted with the decision, plus every block |
| `console-errors.jsonl` | Console errors from all pages |

Proof standards:

- Drive what a shopper does. Do not dispatch store actions, post Pegasus messages, or call worker functions.
- Capture the action and the resulting state, and check side effects as well as pixels: worker requests, `localStorage`, the badge, tabs closed.
- A fixture run proves the extension's logic against that document. It does not prove the live site still has that shape, so a change to selectors or rules also needs its live journey.
- Report a journey's failure with its reason. Never weaken a journey to make it pass. Live verdicts drift by region and sign-in state, so live journeys record the verdict and fixture journeys assert it.
- Look at the screenshots. Report anything visibly wrong, even when the steps passed.
- Check `guard.jsonl` for unexpected hosts in a run you claim is clean.

## Cleanup

A normal run removes its browser, profile, and build copy before exiting. After a killed or crashed run, `doctor` reports `no-abandoned-runs` as failing. Then:

```bash
node $SD cleanup
```

It kills only processes whose command line contains that run's unique profile path, removes that run's `work/`, skips runs whose harness is still alive, and keeps all evidence. Never kill Chromium or webpack by name, because the developer may be running them.

## Helpers

| Path | Purpose |
|---|---|
| `scripts/sd.mjs` | `build`, `doctor`, `run <journey>`, `cleanup` |
| `scripts/lib/runner.mjs` | Boot sequence, route dispatcher, evidence, the `h` object |
| `scripts/lib/guard.mjs` | The proxy and its host decisions |
| `scripts/lib/fixtures.mjs` | Store and rater fixtures |
| `scripts/journeys/*.mjs` | One journey per file, listed in the feature map |

To keep the map honest as the app changes, use `/maintain-verification-skill`.
