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

- **Danger modal and choices.** Run `node $SD run anti-scam-dangerous`. `#safe-deal-anti-scam-root .anti-scam-modal` appears once and `#anti-scam-modal-title` contains `dangerous`. `This site is trustworthy` raises a confirm and, once accepted, closes the modal for good. After clearing `localStorage` and reloading, `Leave this website now` closes the tab.
- **Trusted site.** Run `node $SD run anti-scam-safe`. `SG_MARKED_AS_SAFE` appears in `localStorage`, no modal root exists, and a reload adds no rater requests.
- **Proof.** Use `01-danger-modal.png` and `.html`, and rater calls in `service-worker-network.jsonl`.

## Gotchas

- The verdict is the worker's reply to the page's own `ANALYZE_DOMAIN` request, not shared store state, so one tab's verdict never reaches another tab. A check for that needs two pages in one journey.
- The verdict counts only WOT, URLVoid, and Norton, and needs 2 dangerous votes. `serveScamRaters` answers Norton with rating `u`, which is no data, so WOT and URLVoid decide.
- Chrome's favicon fetch skips Playwright routes, so `guard.jsonl` shows `proxy-offline` for the fixture host. That is the proxy doing its job, not a leak.
- `Leave` closes `h.page`, so it must be the journey's last use of it.
