# Concerns

## Type Safety Debt
- Multiple suppressions reduce TS guarantees:
  - `@ts-nocheck` in `src/utils/extension/ext.ts`
  - `@ts-ignore` in `src/browser-extension/service_worker.ts`
  - `any` usage across API/logging paths (`src/utils/analytics/logger.ts`, downloader/service layers)
- Risk: hidden runtime failures during refactors, weaker IDE/static assurance.

## Error Handling + Silent Failures
- Several broad `try/catch` blocks swallow or down-rank errors (ex: extension API probing in `src/utils/extension/ext.ts`).
- Downloader methods often return `null` on failure (`src/utils/downloaders/apiDownloader.ts`, `src/utils/downloaders/remote/remoteFetcher.ts`) which can mask upstream problems if callers skip null checks.

## Messaging/State Complexity
- Pegasus transport core (`src/utils/pegasus/transport/background.ts`) is complex, stateful, and central.
- Subtle session/disconnect behaviors and pending response handling are fragile areas.
- Risk: hard-to-debug cross-context race conditions.

## Startup Coupling
- `src/browser-extension/service_worker.ts` initializes many workers in one async bootstrap.
- Ordering assumptions may create side effects (auth/log/setup/store readiness dependencies).
- Failure in one init path can degrade multiple feature areas.

## Security/Privacy Surface
- Auth token passed as Bearer header in supplier AI path (`src/supplier/supplier-ai-api-service.ts`); ensure strict endpoint validation and least-privilege backend scopes.
- Error reporter sends payloads to backend in `src/utils/analytics/logger.ts`; review payload sanitization to avoid leaking page/user-sensitive data.
- `.env` exists in repo root; ensure secret hygiene policies and non-commit guarantees stay enforced.

## Performance/Resource Hotspots
- E-commerce worker queue (`src/e-commerce/worker/worker.ts`) and site-rule execution can be expensive under heavy page churn.
- Remote fetch layer caching keys include URL+body; cache growth/eviction strategy should be periodically audited.
- Service worker wake/sleep cycles plus reconnection sync in Pegasus may cause bursty CPU work.

## Maintainability
- Large legacy footprint with mixed patterns (strict TS style in some modules, permissive legacy in others).
- Naming drift (`cashing*`) and mixed conventions increase cognitive load.
- Release/build flow has many scripts; process complexity may hide failures without strong CI gates.
# Codebase Concerns

**Analysis Date:** 2026-04-01

## Tech Debt

**Pegasus transport typing:**
- Issue: `connMap.get(...)` forced through `as PortConnection`; TODO marks unsafe casting at delivery path.
- Files: `src/utils/pegasus/transport/background.ts`
- Impact: Runtime `undefined` from map misses can throw inside `deliver()`; harder refactors without stricter types.
- Fix approach: Narrow `Map` value type, guard before deliver, or use branded keys + `Map.has` checks.

**Global / escape hatches:**
- Issue: `@ts-ignore` and `eslint-disable` for empty catches and cross-context globals (`IS_DEBUGGER_ON`).
- Files: `src/browser-extension/service_worker.ts`, `src/utils/extension/ext.ts`, `src/utils/analytics/logger.ts`
- Impact: TypeScript and lint stop signaling real mistakes; extension API surface changes may slip through.
- Fix approach: Declare globals in `declarations.d.ts`, typed `chrome.*` / `browser.*` branches, log or rethrow in catch blocks where appropriate.

**Explicit `any` in download pipeline:**
- Issue: `DownloadResult.response` and `fetchData` request callback use `Promise<any>` / `any`.
- Files: `src/utils/downloaders/remote/remoteFetcher.ts`
- Impact: Callers can misuse shapes; refactors break silently.
- Fix approach: Generic `Remote.getJson<T>()` / discriminated unions per endpoint.

**Supplier DOM typing:**
- Issue: `(dom as any).getElementsByTagName` to reach scripts on nonstandard document types.
- Files: `src/supplier/stores/alibaba/alibaba-store.ts`
- Impact: Hides invalid assumptions if `dom` shape changes.
- Fix approach: Narrow type with type guard or adapter interface for supplier HTML documents.

**Naming typo frozen in API:**
- Issue: Public class `ShutafTabManger` (and `shutaffTabId`) mismatches “Manager”; tests use `as any` to reach private methods.
- Files: `src/shutaf/logic/ShutafTabManger.ts`, `src/shutaf/logic/__tests__/ShutafTabManager.test.ts`
- Impact: Confusing imports; tests coupled to implementation details.
- Fix approach: Alias rename with deprecation or single breaking rename; expose test doubles or `export` test hooks instead of `as any`.

**Tracked TODOs in product code:**
- Files: `src/e-commerce/client/components/constants.ts` (z-index / old bug), `src/supplier/worker/worker.ts` (tab ids), `src/e-commerce/apps/shopping/ui/ShoppingApp.tsx` (favorites state), `src/utils/pegasus/store-zustand/src/pegasusZustandStoreReady.ts` (edge case)
- Impact: Known gaps without owners or tests.
- Fix approach: Ticket each; add regression tests where behavior is specified.

## Known Bugs

**Not confirmed as user-facing bugs** — symptoms live in comments/TODOs above. Treat `src/e-commerce/client/components/constants.ts` TODO as potential stacking-context regression on some sites.

## Security Considerations

**Broad host access:**
- Risk: MV3 manifest grants `host_permissions` `http://*/*` and `https://*/*` plus content scripts on all HTTP(S) pages for shutaf + anti-scam (`webpack/manifest_v3/manifest.json`). Elevates impact of any XSS or compromised fetch target.
- Files: `webpack/manifest_v3/manifest.json`, `webpack/manifest_v2/manifest.json` (parallel surface)
- Current mitigation: Feature code should only request needed origins; background orchestration in `src/browser-extension/service_worker.ts`.
- Recommendations: Periodically justify `<all_urls>` to store reviewers; avoid injecting untrusted HTML into `innerHTML`.

**HTML injection helpers:**
- Risk: `createHTMLElementFromHTMLString` assigns `innerHTML`; `paint-utils.ts` sets `innerHTML` for icons.
- Files: `src/utils/dom/html.ts`, `src/utils/paint/paint-utils.ts`
- Current mitigation: Call sites must pass trusted/static strings only (`createHTMLElementFromHTMLString` currently unused elsewhere — verify before new use).
- Recommendations: Prefer `DOMParser` + allowlist, or `textContent` for user-visible strings; document trust boundary at call sites.

**Secrets in build:**
- Risk: `SUPABASE_URL` / `SUPABASE_ANON_KEY` injected via `process.env` at build (`src/constants/supabase.ts`, `src/utils/supabase/index.ts`). Anon key is public by design but must not be confused with service role keys.
- Current mitigation: Standard Supabase anon client pattern.
- Recommendations: Ensure CI and local `.env` never commit service keys; `.env` present in repo root is expected for dev — do not commit values.

## Performance Bottlenecks

**Documented extension perf plan (not all implemented in code audit):**
- Problem: Leaked intervals/subscriptions, `onHrefChange` without teardown, no fetch timeout, `React.StrictMode` in prod paths, sequential anti-scam engine calls.
- Files: `PERFORMANCE_PLAN.md` references `src/shutaf/content-script-shutaf.tsx`, `src/anti-scam/content-script-anti-scam.ts`, `src/utils/dom/location.ts`, `src/utils/downloaders/remote/remoteFetcher.ts`, `src/e-commerce/client/events/ecommerceInit.tsx`, `src/anti-scam/logic/anti-scam-paint.tsx`, `src/supplier/content-script-supplier.tsx`, `src/anti-scam/logic/anti-scam-logic.ts`
- Cause: Long-lived content scripts + unbounded `fetch` + dev-only React behavior leaking to prod bundles.
- Improvement path: Implement items in `PERFORMANCE_PLAN.md` in the listed order; verify with Chrome Task Manager and timing notes in that doc.

**Large static data in repo:**
- Problem: `src/anti-scam/logic/anti-scam-white-list.ts` (~785 lines) and oversized embedded asset in `src/constants/visual.ts` inflate parse/bundle cost.
- Cause: Monolithic whitelist and inline base64.
- Improvement path: Split whitelist by domain hash or load chunk; move icons to `res/` and reference URLs.

**Concurrency vs timeouts:**
- Problem: `Remote.fetchData` has no global timeout; stuck network holds `inFlightRequests` until browser abort (if any).
- Files: `src/utils/downloaders/remote/remoteFetcher.ts`, `src/utils/downloaders/fetch.ts`
- Improvement path: `Promise.race` timeout as in `PERFORMANCE_PLAN.md` Fix 4.

## Fragile Areas

**Retailer DOM scrapers:**
- Files: `src/e-commerce/engine/stores/ali-express/product/ali-express-product-downloader.ts`, `src/e-commerce/engine/stores/amazon/product/amazon-feedback-downloader.ts`, `src/e-commerce/engine/logic/product/baseProductDownloader.ts`
- Why fragile: Selectors and HTML structure change without notice; captcha detection via `innerHTML` string match is heuristic.
- Safe modification: Run targeted integration tests under `src/e-commerce/engine/stores/**/__tests__/` and `*.integration.test.ts`; avoid broad selector churn without fixture HTML updates.
- Test coverage: Good unit/rule coverage; still depends on live HTML for integration tests.

**Dual-browser manifests + webpack:**
- Files: `webpack/manifest_v3/manifest.json`, `webpack/manifest_v2/manifest.json`, `webpack/webpack.common.js` (and siblings)
- Why fragile: Permission or entry mismatches between Chrome and Firefox break one build only.
- Safe modification: Change both manifests when altering permissions or script entries; run `yarn dist:build` for both targets in CI if available.

## Scaling Limits

**In-memory caches:**
- Current capacity: `MemoryCache` backs `Remote` static cache and in-flight map (`src/utils/downloaders/remote/remoteFetcher.ts`).
- Limit: Unbounded growth if unique URLs flood the extension; service worker may restart and clear, but long sessions on heavy sites increase RAM.
- Scaling path: TTL/eviction policy on `MemoryCache`, max entries per domain.

**Anti-scam engine fan-out:**
- Limit: Sequential engine calls increase latency linearly with engine count (`src/anti-scam/logic/anti-scam-logic.ts` per `PERFORMANCE_PLAN.md`).
- Scaling path: Parallelize with `Promise.allSettled` preserving “any SAFE wins” semantics.

## Dependencies at Risk

**Supabase JS:**
- Risk: Auth/session behavior tied to extension service worker lifecycle and `src/auth/auth-worker.ts`.
- Impact: SW restarts drop in-memory state unless persisted via existing store patterns.
- Migration plan: Stay on supported `@supabase/supabase-js` from `package.json`; test refresh flows after major upgrades.

**React 18 + extension roots:**
- Risk: Multiple `createRoot` entrypoints across content scripts; StrictMode double-effects if left enabled in production bundles.
- Files: E-commerce init, anti-scam paint, supplier script (see `PERFORMANCE_PLAN.md` Fix 5).

## Missing Critical Features

**Shopping favorites sync:** TODO in `src/e-commerce/apps/shopping/ui/ShoppingApp.tsx` — UI may not reflect server state after add/remove.

**Supplier tab identity:** TODO in `src/supplier/worker/worker.ts` — tab id edge cases may mis-route messages.

## Test Coverage Gaps

**Playwright E2E surface:**
- What's not tested: Full matrix of retailer locales and logged-in flows; scope is `test/e2e` with `**/*.e2e.*` only (`test/playwright.config.ts`).
- Risk: Regression on Amazon/eBay/AliExpress layout changes not caught until users report.
- Priority: Medium — complement with more fixture-based integration tests already present under `src/e-commerce/engine/`.

**Pegasus transport:**
- Files: `src/utils/pegasus/transport/background.ts`
- Risk: Complex port routing and fingerprinting; fewer tests visible at transport layer vs store layers.
- Priority: Medium — add focused tests for disconnect/reconnect and unknown endpoint behavior.

**Unused HTML helper:**
- File: `src/utils/dom/html.ts` (`createHTMLElementFromHTMLString`)
- Risk: Future use without security review.
- Priority: Low — delete or add tests + JSDoc trust contract if kept.

---

*Concerns audit: 2026-04-01*
