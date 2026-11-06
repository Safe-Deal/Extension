# Search result shields

On an Amazon search results page, the extension adds a small shield to listed products and a list-mode toolbar with a coupons badge.

## Sub-features

- `list-toolbar` mounts the toolbar in list mode.
- `list-shields` paints a shield on analyzed results.
- `list-coupons` shows the coupons badge. Not asserted yet.

## How to get to it (user POV)

- Search on Amazon: any URL containing `/s?k=`, `/b?k=`, or `/s?i=`.

## Driving it with sd.mjs

Preconditions:

- Baseline preconditions, plus amazon.com reachable (`live-lane-network` in doctor).

- **Toolbar and shields.** Run `node $SD run amazon-search-live`. `data-testid="floating-toolbar"` appears, more than one `.safe-deal-image-wholesale-product` appears, the first is visible after scrolling, and the count settles.
- **Proof.** `01-search-results.png` shows shields on result cards. `report.json` records `shieldedResults`.

## Gotchas

- Results analyze as they load, so the shield count grows. Do not assert an exact number.
- Live shields rendered gray for a logged-out session from Israel. Do not assert the shield's color.
- `test/e2e/Amazon/list.e2e.ts` covers similar ground but loads `dist/`. Do not use it. See the skill's warning on `yarn test:e2e`.
