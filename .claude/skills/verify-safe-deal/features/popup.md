# Toolbar popup

Clicking the extension's toolbar icon opens a popup with the brand, navigation, sharing links, feedback and mobile app links, a "Why is free to use?" explanation, and the version.

## Sub-features

- `popup-identity` shows the brand and the current version.
- `popup-share` has a link per network carrying the share URL.
- `popup-why-free` opens and closes the explanation.
- `popup-no-banner` shows no affiliate banner on an unlisted site.
- `popup-account-menu` shows the account avatar. Sign-in is not mapped.

## How to get to it (user POV)

- Click the extension's icon in the browser toolbar on any page.

## Driving it with sd.mjs

Preconditions:

- Baseline preconditions only. The journey serves `https://plain-site-fixture.test/`.

- **Identity.** Run `node $SD run popup-home`. `.safe-deal-popup__header__brand` reads `Safe Deal`, and `.safe-deal-popup__footer__version` contains `v` plus the `package.json` version.
- **Share links.** In the same run, each of `twitter`, `linkedin`, `facebook`, `whatsapp`, `telegram`, `reddit`, and `email` has a link containing the share URL.
- **Why free.** In the same run, the `Why is free to use?` button toggles `.safe-deal-popup__home__dropdown__content`.
- **No banner.** In the same run, `.affiliation-banner` is absent and the badge is empty.
- **Proof.** Use `01-popup-dropdown-open.png`. It shows the popup with the explanation open.

## Gotchas

- Use `h.openPopup()`, never `popup.html` in a tab. The banner reads the active tab, which would be the popup itself.
- The popup is invisible to `h.context.pages()`. Only the page `h.openPopup()` returns can drive it.
- Any new tab or lost focus closes the popup, so that page object can die mid-journey.
- Do not click share or navigation links during a run. Check their addresses. The journey makes no outgoing click.
