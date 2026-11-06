# Product verdict

On a supported store's item page, a floating shield appears at the screen edge, shows progress while the extension analyzes the product, and settles on a verdict. Clicking it expands a panel with the verdict, the reasons, and tabs for reviews and opinions.

## Sub-features

- `verdict-mount` shows the toolbar and finishes with the product ID.
- `verdict-recommended` says Recommended Product when reviews and seller check out.
- `verdict-signin-wall` withholds Recommended when reviews and seller could not be read.
- `verdict-expand` opens the panel with its three tabs.
- `verdict-live-amazon` runs against the real amazon.com and backend.
- `verdict-live-ebay` runs against the real ebay.com.
- `verdict-reviews-tab` and `verdict-opinions-tab` show generated content. Not driven yet.
- `verdict-aliexpress` has no working lane. See Gotchas.

## How to get to it (user POV)

- Open an Amazon item page: any URL containing `/dp/`, `/product/`, or `/gp/aw/` plus an ASIN.
- Open an eBay item page: a URL containing `/itm/`, `/i/`, or `/p/`.
- Press `Alt+D` to toggle the panel, or `Escape` to close it.

## Driving it with sd.mjs

Preconditions:

- Baseline preconditions only. The fixture journeys serve their own product.

- **Positive control.** Run `node $SD run amazon-verdict`. The toolbar shows `[data-sd-item="B0FIXTURE1"]`, clicking `.safe-deal-container` shows `Recommended Product` in `.sd-product-full__header__title`, all three tabs are visible, and `service-worker-network.jsonl` shows reviews and seller fetched by the worker.
- **Sign-in wall.** Run `node $SD run amazon-verdict-signin-wall`. The expanded title must not contain `Recommended`. Known failing, see Gotchas.
- **Live Amazon.** Run `node $SD run amazon-live`, or set `SD_ASIN=<asin>` for another product. The toolbar finishes with the ASIN, the panel opens, and the worker called `/price` and `/product-reviews/<asin>`. `report.json` records the verdict under `observations`.
- **Live eBay.** Run `node $SD run ebay-live`. It takes a current listing from search, then expects the toolbar to finish with that item ID. Known failing, see Gotchas.
- **Proof.** Use `02-verdict-expanded.png` and `.html` with `report.json`. They show the verdict, the reasons, and the source product.

## Gotchas

- **`amazon-verdict-signin-wall` fails at `c3875ad`: the shopper sees Recommended Product for an item whose reviews and seller were never read.** Bonus rules alone reach Recommended. This matters in the field, because a logged-out worker's review fetch redirects to sign-in. Commit `57c47e4` on the unmerged branch `creuven/verify-safe-to-buy` is a candidate fix.
- `ebay-live` fails with HTTP 403 at the search step: eBay refused this headless browser from the Israel test network on 2026-11-06. Do not spoof the user agent or otherwise evade the block. The eBay item page has not been verified by this skill.
- Live Amazon from Israel, logged out, showed `Conclusion indeterminate` with `Currently unavailable` for the default ASIN. That is a real result, so do not assert a live verdict.
- `[data-sd-item]` exists on the placeholder before analysis finishes, but it is empty until then. Wait on the value, not the attribute.
- The panel closes on a click outside it unless pinned.
- A 2026-10-27 AliExpress fixture attempt mounted the toolbar, but the verdict never rendered and the worker never fetched the item. The cause is unknown, and `test/e2e/AliExpress` is skipped.
- The fixture's shopper page is minimal. It proves logic and mounting, and says nothing about how the panel looks on a real store.
