# Affiliate link

On a store in the affiliate list, the extension lights the action badge, visits its affiliate link in a pinned background tab that it then closes, and offers a support banner in the popup. Active subscribers are excluded.

## Sub-features

- `affiliate-badge` shows `1` on the action icon.
- `affiliate-background-tab` schedules the link through `const.joinsafedeal.com/ads/`.
- `affiliate-banner` shows in the popup and opens the link when clicked.
- `affiliate-api-stores` covers Amazon, eBay, and AliExpress links from `/links`. On item pages, `amazon-live` records the `/links` response as `affiliate-link-generated`.
- `affiliate-subscriber-off` turns all of this off for subscribers. Needs a signed-in subscriber, so not verified.

## How to get to it (user POV)

- Visit a store listed in `src/shutaf/shutafim.json`. Stores with target `/` qualify on any page.
- Open the toolbar popup on that store.

## Driving it with sd.mjs

Preconditions:

- Baseline preconditions only. The journey serves `https://idee-shop.com/` locally, so the real store is never contacted.

- **Badge.** Run `node $SD run affiliate-link`. `h.badgeText()` returns `1`.
- **Background tab.** In the same run, within 45 seconds, `h.guardEvents("affiliate-click")` holds an entry whose target is on `ad.admitad.com` and contains `idee-shop.com`. `report.json` records it as `scheduledAffiliateTarget`.
- **Banner.** In the same run, `.affiliation-banner` in the real popup reads `Verified safe site. Support us via our affiliate link.`.
- **Banner click.** In the same run, clicking it produces a new blocked `affiliate-host` or `proxy-denied` record.
- **Proof.** Use `02-popup-with-banner.png` and `affiliate-click` records in `guard.jsonl`. A pass means the guard stopped the clicks.

## Gotchas

- The tab opens on a random 6 to 24 second timer, so use a poll and not a fixed sleep.
- Clicking the banner opens a tab, and Chrome closes the popup during the click, so Playwright's click can reject. That is real behavior, and the journey allows it only when the popup really closed.
- Never add `const.joinsafedeal.com` or an affiliate host to a journey's `h.serve`. Guard rules run first, but the intent should stay obvious to the next reader.
- For Amazon from Israel on 2026-11-06, `/links` returned `NOT_POSSIBLE_TO_GET_SHUTAFF_LINK`, so no background tab opened. Absence on a live Amazon run is not a failure.
