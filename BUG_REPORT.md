# Safe Deal extension: bug report

Date: 2026-11-06. Version audited: 5.8.23 (branch `main`, commit `c3875ad`).

How to read this report:

- **(measured)** means I ran it against the production build in a real Chromium extension, or in jest, and saw the result.
- **(read)** means I found it by reading the code and did not run it.
- Nothing was committed and no tracked file was changed.

## Baseline

- `tsc --noEmit` reports 2 real errors, both `Duplicate identifier 'content'`, in `src/constants/svg.d.ts:6` and `webpack/declarations.d.ts:3`. It also reports 2 errors inside `node_modules` (`react-share`, `shepherd.js`).
- Jest: 540 tests passed and 7 failed, across 4 suites that call live websites:
  - `src/anti-scam/__tests__/anti-scam-integration.test.ts`
  - `src/anti-scam/scam-rater/__tests__/integration/api-scam-void-url.test.ts`
  - `src/e-commerce/engine/stores/ebay/product/__tests__/ebay-product-downloader.integration.test.ts`
  - `src/utils/downloaders/apis.integration.test.ts`
- `yarn test:unit` and `yarn test:ci` run these live-network suites together with the unit tests, and `test:unit` uses `--bail`, so one network failure hides the rest.
- Checked and fine: the production bundle inlines only `SUPABASE_URL`, `SUPABASE_ANON_KEY` and the public URLs. `SCRAPFLY_API_KEY`, `GOOGLE_TRANSLATE_API_KEY` and `AUTH_API_KEY` are not in the bundle, and `.env` is gitignored.

## Summary

| # | Severity | Bug | Evidence |
|---|---|---|---|
| 1 | Critical | Scam warning modal never appears | measured |
| 2 | Critical | Anti-scam verdict logic almost never says dangerous, and says safe on no data | measured |
| 3 | Critical | Any `localhost` page can forge a login and premium status | measured |
| 4 | Critical | Any web page can write to extension stores | measured |
| 5 | High | Two content scripts collide on one endpoint | measured |
| 6 | High | Whitelist never expires and matches by substring | measured |
| 7 | High | A failed request poisons the cache for 15 minutes | measured |
| 8 | High | Amazon ASIN parser picks a word from the URL | measured |
| 9 | High | Number parsing is wrong for common formats | measured |
| 10 | High | Affiliate matching credits the wrong program | measured |
| 11 | High | One failed rule blanks the whole page | measured |
| 12 | High | Product verdict can be wrong (no regular rules, invalid rules counted) | measured / read |
| 13 | High | eBay delivery score breaks across New Year | measured |
| 14 | Medium | Stray `;` rendered in the toolbar | measured |
| 15 | Medium | Store `ready()` can hang forever | read |
| 16 | Medium | IndexedDB connection opened on every store read and write | read |
| 17 | Medium | `getStore` classifies by substring | measured |
| 18 | Medium | Amazon captcha check never fires | measured |
| 19 | Medium | Review error never clears | read |
| 20 | Medium | `Remote.postJson` drops headers, `getJson` misuses them | measured / read |
| 21 | Medium | Amazon pricing rewards overpriced items | measured |
| 22 | Medium | SPA navigation handler resends the initial URL | read |
| 23 | Medium | Shopping iframe leaks tokens in URL and posts to `*` | read |
| 24 | Medium | Supabase `SIGNED_OUT` not handled, auth listener race | read |
| 25 | Medium | Affiliate timers do not survive a service-worker restart | read |
| 26 | Medium | Amazon wholesale ID uses the AliExpress parser | read |
| 27 | Medium | `prettier` script hides its failures | read |
| 28 | Low | Regex targets are lowercased | measured |
| 29 | Low | Modal reads `trustworthiness` that is never set | read |
| 30 | Low | `anti-scam-worker` does not await `evaluate()` | read |
| 31 | Low | Alibaba feature gated behind `IS_DEBUG` | read |
| 32 | Low | AliExpress Russia price parsing can throw | read |
| 33 | Low | Duplicate `content` type declarations | measured |

---

## Critical

### 1. Scam warning modal never appears (measured, twice)

**Where:** `src/anti-scam/content-script-anti-scam.ts`, `src/anti-scam/components/AntiScamModal.tsx`.

**Evidence:**
- In my run the background verdict was `DANGEROUS` and the modal count was 0.
- The project's own `verify-safe-deal anti-scam-dangerous` journey fails at the same step: `#safe-deal-anti-scam-root .anti-scam-modal` is never found within 45 seconds.

**Cause:** the content script subscribes to its local `useAntiScamStore`, but never calls `antiScamStoreReady()`, so the local store is never synced with the background. The only caller of `antiScamStoreReady()` is `AntiScamModal`, which only mounts after the modal would already have been painted.

**Fix:**
1. `await antiScamStoreReady()` before subscribing.
2. After it resolves, read the current state once, because a subscription only fires on later changes.
3. Make the store per-domain. Today `conclusion` and `open` are global, so once the sync works, a DANGEROUS verdict for one site would paint on every open tab.

### 2. Verdict logic almost never says dangerous, and says safe on no data (measured)

**Where:** `src/anti-scam/logic/anti-scam-logic.ts`, `src/anti-scam/scam-rater/tab-content-rater.ts`, `src/anti-scam/scam-rater/api-scam-norton.ts`.

**Evidence:**
- `dangerousAmount === ENGINES_COUNT` (3) counts the tab heuristic as a vote. Norton never returns `DANGEROUS`, so `DANGEROUS` needs the tab heuristic, WOT and URLVoid to all agree.
- The tab heuristic scores an https page with a favicon and a title longer than 10 characters at 100, which is `SAFE`. The `hasSafe` short-circuit then returns `SAFE` even when WOT and URLVoid both say dangerous. Measured: `SAFE`.
- When all three raters are unreachable, the result is `SAFE` (measured). The content script then calls `markAsSafe()`, which whitelists the site.
- Norton's `isSafe` treats ratings `r`, `g`, `b` and `w` as safe. `b` and `w` may mean "bad" and "warning" (guess, confirm in Norton's docs). Live check: Norton returned `"g"` for `wicar.org`, a known malware test site.

**Fix:**
1. Compute the verdict only from engines that returned data.
2. Use a majority rule across those engines.
3. Return `NO_DATA` when nothing answered. Never whitelist on `NO_DATA`.
4. Treat the tab heuristic as one weak signal that cannot override an engine.
5. Check the Norton rating codes and fix `isSafe`.

### 3. Any page on `localhost` can forge a login (measured)

**Where:** `src/auth/content-script-auth.tsx`, `webpack/manifest_v3/manifest.json` (matches `http://localhost/*`, `https://localhost/*`).

**Evidence:** a plain page on `http://localhost:<port>` posted `{type: "AUTH_SESSION", payload: {session: {...}}}`. The auth store then held `FORGED-ACCESS` as the session and `isPremium: true`. That disables the affiliate flow and unlocks premium UI.

**Cause:** the `message` listener checks neither `event.origin` nor `event.source`.

**Fix:**
1. Accept only `event.source === window` and `event.origin === "https://www.joinsafedeal.com"`.
2. Remove the `localhost` matches from the production manifest and keep them in the dev manifest only.
3. Do not trust `user_metadata.subscription_status` from a message. Validate the session with `supabase.auth.setSession` / `getUser`.

### 4. Any web page can write to extension stores (measured)

**Where:** `initPegasusTransport({ allowWindowMessagingForNamespace })` in the anti-scam, shutaf, ecommerce and supplier content scripts. Background handling in `src/utils/pegasus/transport/background.ts` and `src/utils/pegasus/rpc/src/RPCServices.ts`.

**Evidence:**
- Any page script can answer the `webext-port-offer` handshake and get a port.
- Through that port a page overwrote the background auth session (`OVERWRITTEN-BY-PAGE`) and set the popup's affiliate link to `https://attacker.test/landing`, which the user then clicks.
- I did not prove a page can read tokens. My one read attempt got no reply. A page also received 0 messages back on its port.

**Fix:**
1. Do not enable window messaging in scripts that never talk to the page. That is all four listed scripts.
2. In `registerRPCService` and the background router, reject messages whose `origin.context` is `"window"`.
3. Add a per-store allow-list of actions for `dispatch`.

---

## High

### 5. Two content scripts collide on one endpoint (measured)

**Where:** `content-script-anti-scam.js` and `content-script-shutaf.js` both run in every frame (`manifest.json`). Both connect as `content-script@<tab>.<frame>` (`background.ts`, `connMap`).

**Evidence:** with two ports on the same endpoint name, a reply was delivered to only one of them (`{"A":[],"B":["reply"]}`). This may be a second cause of bug 1.

**Fix:** give each script a unique `endpointName`, for example `content-script:anti-scam@tab.frame`, or merge the scripts.

### 6. Whitelist never expires and matches by substring (measured)

**Where:** `src/anti-scam/logic/anti-scam-persistance.ts`, `src/anti-scam/logic/anti-scam-white-list.ts`.

**Evidence:**
- Expiry uses `diff.getUTCDate() - 1`, which is the day of the month of the time difference and can never exceed 30. A site marked safe 400 days ago was still whitelisted, against a 120-day limit.
- `inspected.includes(trusted)` whitelists `amazon.com.login-secure.ru`, `paypal.com-verify.net`, `contest.com` (because `test.com` is listed), `pineapple.com` (because `apple.com` is listed) and `notgoogle.com`.
- The list also contains `localhost:3000` and `test.com`.
- `USER_DECLARED_AS_SAFE_TIMESTAMP` is written but never read, so "stay" is permanent.

**Fix:**
1. `daysPassed = Math.floor((Date.now() - at) / 86_400_000)`.
2. Match with `host === d || host.endsWith("." + d)` after stripping the port.
3. Remove `localhost:3000` and `test.com` from the production list.
4. Apply the expiry to the user-declared whitelist too.

### 7. A failed request poisons the cache for 15 minutes (measured)

**Where:** `src/utils/downloaders/remote/remoteFetcher.ts` (`fetchData`), `src/e-commerce/engine/logic/product/baseProductDownloader.ts` (`download`).

**Evidence:** after a 503, three GETs to the same URL made 1 network call. In the non-200 branch the in-flight entry is never deleted, so later callers receive its `null` until the cache entry times out. `download()` also caches a `null` result for 15 minutes.

**Fix:** delete the in-flight key in a `finally`, and do not cache null or error documents.

### 8. Amazon ASIN parser picks a word from the URL (measured)

**Where:** `src/e-commerce/engine/stores/amazon/rules/shared/amazon-utils.ts` (`getAsinFromUrl`).

**Evidence:** `/Headphones/dp/B0CRMZ7TFZ` returns `Headphones`, and the extension requested `.../exec/obidos/ASIN/Headphones`. Any slug of exactly 10 alphanumeric characters breaks the verdict.

**Fix:** anchor on the marker, for example `/(?:dp|gp\/product|product-reviews|ASIN)\/([A-Z0-9]{10})(?:[/?#]|$)/`.

### 9. Number parsing is wrong for common formats (measured)

**Where:** `src/utils/text/strings.ts` (`castAsNumber`, `numberFromString`), `src/utils/general/general.ts` (`parsePrice`).

**Evidence:**

| Input | Result |
|---|---|
| `castAsNumber("4.5 out of 5")` | 4.55 |
| `castAsNumber("96% positive in the last 12 months")` | 9612 |
| `castAsNumber("12,50 €")` | 1250 |
| `castAsNumber("€1.299,00")` | 1.299 |
| `castAsNumber("1,234 Reviews", true)` | 1.234 |
| `castAsNumber("$1,234.56", true)` | 1.234 |
| `numberFromString("1,234,567")` | 1.234567 |
| `parsePrice("1,234,567.00")` | 1234 |

Visible effect: AliExpress products with more than 999 reviews are parsed as 1.xxx reviews and score 4/10 instead of 10/10 (measured).

Also in `numberFromString`, `countOfApostrophe` is computed from `"."` instead of `","`, so the comma branch is dead code.

**Fix:** extract the first numeric token with a regex, then decide the decimal separator from the last `.` or `,` and its distance from the end. Reuse one parser everywhere and add table tests for these inputs.

### 10. Affiliate matching credits the wrong program (measured)

**Where:** `src/shutaf/logic/ShutafUtils.ts` (`getShutafByUrl`).

**Evidence:** `url.host.includes(s.domain)` and first match wins. `makemytrip.com` and `cleartrip.com` matched Trip.com. `freebay.com` matched eBay. Among the 30,128 entries in `shutafim.json`, 2,330 domain pairs overlap this way.

**Fix:** match on the registrable domain (`host === d || host.endsWith("." + d)`, using `tldjs` which is already a dependency). For entries written as `ebay.`, match the second-level label exactly.

### 11. One failed rule blanks the whole page (measured)

**Where:** `src/data/rules/rule-manager.ts`, `src/e-commerce/engine/logic/site/display-site.ts`, `src/constants/rule-reliability-messages.ts`.

**Evidence:** `RuleManager.execute` returns `null` for a rule that threw. `new DisplaySite({... rules: [null]})` throws `TypeError: Cannot read properties of null (reading 'tooltipSummary')`.

**Fix:** filter nulls in `RuleManager.execute` (or return an invalid-rule object), and use `rule?.` in the consumers.

### 12. Product verdict can be wrong (measured / read)

**Where:** `src/e-commerce/engine/logic/conclusion/conclusion-product.ts`.

**Evidence:**
- (measured) Two valid bonus-only rules and zero regular rules give `normalizationDividerValue = 0`, and the verdict is `RECOMMENDED`.
- (read) `accumulateRulesValue` sums every rule including ones where `isValidRule` is false, while the denominator counts only valid regular rules.

**Fix:** if `numOfRegularRules === 0`, return `INSUFFICIENT_DATA`. Filter on `isValidRule` when summing.

### 13. eBay delivery score breaks across New Year (measured)

**Where:** `src/e-commerce/engine/stores/ebay/rules/delivery/rule-delivery-algorithm.ts` (`ebayDeliveryTextToDate`).

**Evidence:** the year is assumed to be the current one. On Dec 28, "Fri, Jan 15" becomes Jan 15 of the same year, which is -347 days, and gets the best score (10).

**Fix:** if the parsed date is more than about 30 days in the past, use next year.

---

## Medium

### 14. Stray `;` rendered in the toolbar (measured)
`src/e-commerce/client/ECommerceClient.tsx:111` and `src/supplier/client/SupplierClient.tsx:50` end with `<FloatingToolbar ... />;`. The `;` is rendered as text inside the toolbar root. Remove it.

### 15. Store `ready()` can hang forever (read)
`src/utils/pegasus/store/src/PegasusStore.ts`: when `fetchState()` fails, the code only logs and never rejects or retries, so `ready()` never resolves. `src/browser-extension/popup/index.tsx` renders only after `authStoreReady()`, and the ecommerce, shutaf and supplier scripts `await authStoreReady()`. A cold-started service worker can answer "No handler registered" before `registerRPCService` runs, because `initPegasusStoreBackend` awaits IndexedDB first. Fix: retry `fetchState` with backoff, reject after a timeout, and register the RPC service before reading storage.

### 16. IndexedDB connection opened on every read and write (read)
`src/utils/pegasus/store/src/StoreStorage.ts`: `initIndexedDB()` is called in the constructor, in `getState` and in every `setState`, and the connection is never closed. Open once, cache the promise, and handle its rejection.

### 17. `getStore` classifies by substring (measured)
`src/e-commerce/engine/logic/utils/site-utils.ts` and the `*SiteUtils.is*Site` helpers use `containsAny(url, "amazon")`. An eBay search URL for "amazon fire" returned `amazon`. Compare hostnames, not the whole URL.

### 18. Amazon captcha check never fires (measured)
`src/e-commerce/engine/stores/amazon/product/amazon-feedback-downloader.ts`: `parse()` sets `this.document = null` and then tests `this?.document?.innerHTML`, which is always undefined. A captcha page is returned as a document. Test `html` instead.

### 19. Review error never clears (read)
`src/e-commerce/reviews/reviews-worker.ts`: the success branch never calls `setError(null)`, and `Reviews.tsx` renders the error before the data. After one failure every later product shows the error until the service worker restarts.

### 20. `Remote.postJson` drops headers, `getJson` misuses them (measured / read)
`src/utils/downloaders/fetch.ts`: `postFetchJson` spreads `OPTIONS_AS_API` and then sets `headers: customHeaders`, which replaces it. With no custom headers the request goes out with `{}` and no `Content-Type` (measured). Callers affected: `aliexpress-reviews-service.ts` and `apiAliExpressRelated.ts`. `getFetchJson(url, params)` spreads `params` into the fetch init, but `Remote.getJson` passes a headers object there (read). Merge headers instead of replacing them.

### 21. Amazon pricing rewards overpriced items (measured)
`src/e-commerce/engine/stores/amazon/rules/pricing/rule-pricing-algorithm.ts`: at 20% above the average price the score is 1, at 50% above it is 2. `minPrices` and `maxPrices` are both mapped from `p.price`, so min and max averages are identical. Confirm the intended scale and use real min and max fields.

### 22. SPA navigation handler resends the initial URL (read)
`src/shutaf/content-script-shutaf.tsx:37` sends `url` from the first load, not the new `href`. Use the `href` argument.

### 23. Shopping iframe leaks tokens in the URL and posts to `*` (read)
`src/e-commerce/apps/shopping/ui/ShoppingApp.tsx` puts `JSON.stringify(session)` in a query parameter, so access and refresh tokens end up in logs and referrers. `react-iframe-comm` defaults `targetOrigin` to `"*"` (confirmed in `node_modules`). Pass the token by `postMessage` to a specific origin and set `targetOrigin`.

### 24. Supabase `SIGNED_OUT` not handled, auth listener race (read)
`src/auth/auth-worker.ts` only reacts to `SIGNED_IN` and `TOKEN_REFRESHED`. A refresh failure leaves a stale session and premium flag. In `content-script-auth.tsx` the `message` listener is added after `await authStoreReady()`, so an early login message can be missed. Handle `SIGNED_OUT` and register the listener first.

### 25. Affiliate timers do not survive a service-worker restart (read)
`src/shutaf/logic/ShutafTabManger.ts` uses `setTimeout` and an in-memory `requests` array, which an MV3 worker loses when it is suspended. Use `chrome.alarms` and persist the queue.

### 26. Amazon wholesale ID uses the AliExpress parser (read)
`src/e-commerce/engine/logic/product/product-locator.ts:101` calls `AliExpressSiteUtils.getWholesaleAliExpressProductIdFromHref(hef)` for Amazon links. Use `getAsinFromUrl`.

### 27. `prettier` script hides its failures (read)
`package.json`: `"prettier": "prettier --ignore-path .gitignore --write ./src >> /dev/null 2>&1"`. The CI step `yarn run dist:pretty` cannot fail on it. Remove the redirect, and use `--check` in CI.

---

## Low

28. **Regex targets are lowercased (measured).** `ShutafUtils.isOnItemPage` lowercases the `regexp:` pattern, so `\D` becomes `\d`. Only lowercase the tested string.
29. **Modal reads `trustworthiness` that is never set (read).** `ApiScamPartners.evaluate` returns only `{type, tabId}`, so the percent text in `AntiScamModal` is never shown. Return the score or remove the text.
30. **`anti-scam-worker` does not await `evaluate()` (read).** The `finally` sets `loading` to false immediately. Await it.
31. **Alibaba feature gated behind `IS_DEBUG` (read).** `src/supplier/content-script-supplier.tsx:36` has `if (!IS_DEBUG) return;`, so it never runs in production. Remove it if it is a leftover.
32. **AliExpress Russia price parsing can throw (read).** `ali-express-product-downloader.ts`: `price?.includes(..) || price.includes(..)` throws when `price` is undefined.
33. **Duplicate `content` type declarations (measured).** `src/constants/svg.d.ts` and `webpack/declarations.d.ts` both declare `content`. Keep one.

---

## Not proven or not run

- Service-worker restart behavior: my test was inconclusive, because the anti-scam verdict was recomputed rather than restored.
- Only one `verify-safe-deal` journey finished (`anti-scam-dangerous`, which failed). The other journeys were stopped before running.
- The extension opens a pinned affiliate tab with no user click. That is by design, but it is a Chrome Web Store affiliate-ads policy risk, not a code bug.

## Suggested order

1. Bugs 1 and 2 together (same code path), then 3 and 4 (security).
2. Bugs 5 to 13.
3. Medium and low items, with tests for the parsers (bugs 8, 9, 13) first.
