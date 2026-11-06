# Anti-scam warning

When several rating services flag a site, a blocking modal warns the shopper, who can leave (the tab closes) or declare the site trustworthy (after a browser confirmation, and remembered for that site). A trusted site shows nothing and is not analyzed again on the next visit.

## Sub-features

- `scam-modal` blocks the page on a flagged site.
- `scam-stay` confirms, closes the modal, and remembers the choice across reloads.
- `scam-leave` closes the tab.
- `scam-safe` records a trusted site and skips the raters next time.

## How to get to it (user POV)

- Visit any `http` or `https` site that is not on the built-in whitelist in `src/anti-scam/logic/anti-scam-white-list.ts`.

## Driving it with sd.mjs

Preconditions:

- Baseline preconditions only. The journey serves `http://suspect-fixture.test/` plus WOT, URLVoid, and Norton responses.

- **Danger modal and choices.** Run `node $SD run anti-scam-dangerous`. `#safe-deal-anti-scam-root .anti-scam-modal` appears once and `#anti-scam-modal-title` contains `dangerous`. `This site is trustworthy` raises a confirm and, once accepted, closes the modal for good. After clearing `localStorage` and reloading, `Leave this website now` closes the tab. Known failing, see Gotchas.
- **Trusted site.** Run `node $SD run anti-scam-safe`. `SG_MARKED_AS_SAFE` appears in `localStorage`, no modal root exists, and a reload adds no rater requests. Known failing, see Gotchas.
- **Proof.** Use `01-danger-modal.png` and `.html`, and rater calls in `service-worker-network.jsonl`.

## Gotchas

- **Both journeys fail at `c3875ad`, and the danger journey also fails at `5ddbe2c`: the feature does nothing for shoppers.** The worker reaches a conclusion, but `src/anti-scam/content-script-anti-scam.ts` subscribes to the store without calling `antiScamStoreReady()`, so the page never hears it. No modal appears, and no site is recorded as safe.
- **A second bug sits behind the first.** The same subscribe callback paints on every store update, so adding only the ready call stacks 10 or more modals, and the locator reports a strict-mode violation. A fix needs both. A temporary build with both changes passed every step of both journeys on 2026-11-06. Its patch and evidence are in `.tmp/verify-safe-deal/probe-evidence/`, which is local and gitignored.
- The danger vote changes on the unmerged branch `creuven/verify-safe-to-buy` (`5ddbe2c`). It stops counting the tab's own score. If that merges, `serveScamRaters` must be rechecked against the new vote.
- Chrome's favicon fetch skips Playwright routes, so `guard.jsonl` shows `proxy-offline` for the fixture host. That is the proxy doing its job, not a leak.
- The tab score counts `http`, a title of 10 characters or fewer, and no favicon as dangerous. The fixture relies on that.
- `Leave` closes `h.page`, so it must be the journey's last use of it.
