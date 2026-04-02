# Codebase Concerns

**Analysis Date:** 2026-04-02

## Tech Debt

**Anti-scam whitelist maintenance:**
- Issue: `WHITELISTED_DOMAINS` in `src/anti-scam/logic/anti-scam-white-list.ts` is a single ~785-line hand-curated array with duplicate entries (e.g. repeated `google.co.*` blocks, duplicate `joinsafedeal.com` / `amazon.com`), prefix fragments (`"google."`, `"play.google."`), and a `localhost:3000` entry marked as temporary. Any edit risks merge conflicts and silent overlap bugs.
- Files: `src/anti-scam/logic/anti-scam-white-list.ts`
- Impact: Hard to audit; easy to add typos or overlapping rules; bundle size and parse cost on every anti-scam path.
- Fix approach: Generate from a sorted deduped source (JSON/TS module per category), validate with tests, replace substring matching with proper eTLD+1 / registrable-domain checks.

**Pegasus transport typing:**
- Issue: Explicit `TODO` and `as PortConnection` casts in background message delivery; transport types lean on `any` in internal types.
- Files: `src/utils/pegasus/transport/background.ts`, `src/utils/pegasus/transport/src/types-internal.ts`, `src/utils/pegasus/transport/src/types.ts`
- Impact: Runtime errors if connection map and serialized endpoints drift; harder refactors of messaging.
- Fix approach: Narrow `connMap` value type, guard `dest()`/`sender()` before use, remove casts with discriminated unions.

**Naming / structure drift:**
- Issue: Class file `ShutafTabManger` is misspelled (`Manger` vs `Manager`); imported consistently under the wrong name, so renaming is a wide refactor.
- Files: `src/shutaf/logic/ShutafTabManger.ts`, tests under `src/shutaf/logic/__tests__/`
- Impact: Onboarding confusion; grep-based tooling misses expected names.
- Fix approach: Rename file + symbol in one PR with re-export alias if needed for backward compatibility.

**Supplier worker tab handling:**
- Issue: `TODO: Tackle the problem of tab ids` left in production handler; AI analysis does not correlate results to a specific tab in a principled way.
- Files: `src/supplier/worker/worker.ts`
- Impact: Wrong-tab or stale-tab UI if user navigates quickly; future multi-tab Alibaba flows brittle.
- Fix approach: Thread `tabId` from content script through Pegasus payload and validate against `chrome.tabs` / active tab where appropriate.

**Walmart e-commerce path:**
- Issue: `DisplaySiteFactory` and engine support `ProductStore.WALMART`, but `webpack/manifest_v3/manifest.json` and `webpack/manifest_v2/manifest.json` do not include `walmart.com` (or related hosts) in `content-script-ecommerce` `matches`. No `registerContentScripts` usage in `src/`.
- Files: `src/e-commerce/engine/logic/site/display-site-factory.ts`, `src/e-commerce/engine/stores/walmart/**`, manifests under `webpack/manifest_v2/`, `webpack/manifest_v3/`
- Impact: Walmart-specific code and tests exist; shipped extension never injects e-commerce bundle on Walmart → dead feature or docs/UX mismatch.
- Fix approach: Add host matches to manifest (and Firefox parity) or remove Walmart from factory/popup copy if intentionally dropped.

**Outdated fetch / crawler impersonation:**
- Issue: `src/utils/downloaders/fetch.ts` uses fixed Chrome/Firefox/Edge/Safari versions from ~2021-era strings for random UA rotation; crawler UA list duplicates entries.
- Files: `src/utils/downloaders/fetch.ts`
- Impact: Higher bot-detection rate on merchant sites; misleading security posture (looks like “random real users” but is stale).
- Fix approach: Centralize UA policy, refresh periodically or use a minimal honest UA; dedupe crawler list.

**Build-time globals:**
- Issue: `src/browser-extension/service_worker.ts` uses `// @ts-ignore` for `IS_DEBUGGER_ON` webpack DefinePlugin symbol.
- Files: `src/browser-extension/service_worker.ts`, webpack DefinePlugin config (see `webpack/`)
- Impact: Typos in define names fail silently.
- Fix approach: `declare const IS_DEBUGGER_ON: boolean` in a `global.d.ts` or use `import.meta` pattern if build supports it.

## Known Bugs

**Whitelist matching uses unsafe substring logic:**
- Symptoms: Domains that merely *contain* a trusted token are treated as whitelisted (e.g. host strings where `"amazon.com"` appears as a substring inside a malicious registrable name).
- Files: `src/anti-scam/logic/anti-scam-persistance.ts` (`inspected.includes(trusted)`), `src/anti-scam/logic/anti-scam-white-list.ts`
- Trigger: Visit a domain whose normalized string includes a whitelist entry as substring.
- Workaround: None for users; security logic is wrong for edge-case hostnames.

**“Marked safe” expiry uses calendar day of epoch diff, not day count:**
- Symptoms: `daysPassed` is computed as `diff.getUTCDate() - 1` on a `Date` built from absolute time difference — not elapsed days. Whitelist TTL behavior does not match `WHITELISTING_PERIOD_IN_DAYS` intent.
- Files: `src/anti-scam/logic/anti-scam-persistance.ts`
- Trigger: Any flow using `MARK_AS_SAFE` / `markAsSafe()`.
- Workaround: None; logic should use `(today - at) / MS_PER_DAY`.

**Anti-scam integration tests encode incorrect expectations:**
- Symptoms: Tests assert `ScamSiteType.SAFE` for domains named `tratartledag.com`, `hihanin.com` via `ApiScamNorton`, contradicting test names (“dangerous” / “suspicious”). Live API or mocks may drift; tests do not guard product behavior.
- Files: `src/anti-scam/__tests__/anti-scam-integration.test.ts`
- Trigger: `yarn test` — passes while semantics are questionable.
- Workaround: Replace with deterministic mocks of `ScamRater` implementations.

**Anti-scam consensus logic short-circuits on any SAFE:**
- Symptoms: `ApiScamPartners.evaluate` returns SAFE if *any* engine returned SAFE, after collecting results — can mask DANGEROUS signals from other engines depending on order and `Promise.allSettled` iteration.
- Files: `src/anti-scam/logic/anti-scam-logic.ts`
- Trigger: Domains where one partner API errors toward SAFE while others flag risk.
- Workaround: Redesign scoring (majority, weighted, or require two-of-three DANGEROUS).

## Security Considerations

**Broad host and content-script exposure:**
- Risk: MV3 `host_permissions` are `http://*/*` and `https://*/*` (`webpack/manifest_v3/manifest.json`). Shutaf + anti-scam content scripts match all HTTP(S) pages. Store review and users see maximum permission surface; any content-script bug becomes cross-site.
- Files: `webpack/manifest_v3/manifest.json`, `webpack/manifest_v2/manifest.json`
- Current mitigation: Feature code scoped per module; still full read/modify potential where injected.
- Recommendations: Split optional permissions / activeTab where product allows; document threat model for Pegasus and DOM injection.

**HTML injection from parsed remote / DOM strings:**
- Risk: `innerHTML` assignment for rendering helper HTML (`src/utils/dom/html.ts`, `src/utils/paint/paint-utils.ts`). If upstream HTML is attacker-controlled or poisoned by MITM on fetch, scriptless markup injection still risks UX / phishing overlays in extension UI.
- Files: `src/utils/dom/html.ts`, `src/utils/paint/paint-utils.ts`
- Current mitigation: Used in extension isolated world context; not arbitrary web page XSS into page JS, but still powerful UI redress if data is malicious.
- Recommendations: Prefer `DOMParser` + explicit node creation for untrusted strings; CSP for extension pages.

**Supabase anon key in bundle:**
- Risk: `src/utils/supabase/index.ts` reads `SUPABASE_URL` / `SUPABASE_ANON_KEY` from `src/constants/supabase` — expected for Supabase, but RLS and API surface must be correct; anon key is public in every install.
- Files: `src/utils/supabase/index.ts`, `src/constants/supabase`
- Current mitigation: Supabase RLS (verify on backend); no secret key in client.
- Recommendations: Never move service role into extension; audit tables/policies when adding auth features.

**Window messaging namespace:**
- Risk: Pegasus documents shared `postMessage` namespace; misconfiguration could leak messages between scripts (`src/utils/pegasus/transport/src/post-message/index.ts` comments warn about consistent namespace).
- Files: `src/utils/pegasus/transport/**`, per-entry `initPegasusTransport({ allowWindowMessagingForNamespace: ... })` in content scripts
- Current mitigation: Per-feature namespaces (e.g. `CONTENT_SCRIPT_ECOMMERCE`).
- Recommendations: Centralize namespace constants; add runtime validation in dev builds.

## Performance Bottlenecks

**Large static whitelist array:**
- Problem: Every load of anti-scam module touches a huge array; `isWhitelisted` runs `Array.some` + string `includes` per trusted entry on many domains.
- Files: `src/anti-scam/logic/anti-scam-white-list.ts`, `src/anti-scam/logic/anti-scam-persistance.ts`
- Cause: O(n) substring checks over hundreds of entries.
- Improvement path: Trie or Set of registrable domains; early exit; move to lazy init.

**Parallel third-party scam API calls:**
- Problem: `ApiScamPartners` fires WOT, Norton, VoidURL together per analysis — latency and rate limits scale with traffic.
- Files: `src/anti-scam/logic/anti-scam-logic.ts`, `src/anti-scam/scam-rater/**`
- Cause: `Promise.allSettled` over full engine list every time.
- Improvement path: Cache per domain TTL in storage; stagger engines; single primary API with fallback.

**E-commerce product downloaders:**
- Problem: Large store-specific downloaders (e.g. AliExpress product downloader ~590 lines) perform heavy DOM queries and network — sensitive to page redesign.
- Files: `src/e-commerce/engine/stores/ali-express/product/ali-express-product-downloader.ts` and peers under `src/e-commerce/engine/stores/*/`
- Cause: Tight coupling to live site markup.
- Improvement path: Feature flags, faster failure, telemetry on selector misses (privacy-safe).

## Fragile Areas

**Site detection and selectors:**
- Files: `src/e-commerce/engine/stores/**/**-site-selector.ts`, `src/utils/site/site-information.ts`, `src/data/sites/**`
- Why fragile: Retailers A/B test and change classes; one selector break disables rules or widgets.
- Safe modification: Run integration tests against saved HTML fixtures; extend `*.integration.test.ts` pattern before shipping selector edits.
- Test coverage: Partial — many rule algorithms tested; live DOM tests fewer.

**Dual manifest + shared service worker bundle:**
- Files: `webpack/manifest_v2/manifest.json` (persistent background), `webpack/manifest_v3/manifest.json` (service worker), same `scripts/service_worker.js` entry name in both
- Why fragile: MV2 persistent vs MV3 ephemeral lifecycle differences (alarms, long tasks, `window` assumptions) can cause Firefox-only or Chrome-only bugs.
- Safe modification: Manual smoke on both targets after background changes; watch for `initExtensionSetup` and tab APIs.

**Supplier HTML pipeline:**
- Files: `src/supplier/stores/alibaba/alibaba-store.ts` (`as any` on script access), `src/supplier/worker/worker.ts`
- Why fragile: Relies on Alibaba page scripts and DOM shape; `as any` hides type drift.
- Safe modification: Type narrow `ParsedHtml` extensions; snapshot tests for `preprocessAlibabaData`.

## Scaling Limits

**Manifest content_scripts match list:**
- Current capacity: Dozens of explicit Amazon/eBay/AliExpress hosts in JSON; Chrome has match pattern limits (document if approaching).
- Limit: Adding every regional TLD duplicates entries (already long).
- Scaling path: Script-generated manifest from a single domain registry; optional programmatic registration when API stable.

**Shutaf tab queue:**
- Current capacity: `MAX_LINKS_OPENED_IN_TAB = 50`, randomized delays (`src/shutaf/logic/ShutafTabManger.ts`).
- Limit: Browser tab and rate-limit policy; user-visible tab spam risk.
- Scaling path: User setting for max concurrent / cooldown; align with affiliate program ToS.

## Dependencies at Risk

**Stale “browser-like” headers in downloader:**
- Risk: Sites increasingly fingerprint beyond UA; old versions may trigger hard blocks.
- Impact: Empty or error HTML → broken rules and “unknown” conclusions.
- Migration plan: See fetch.ts refresh above; consider first-party fetches only where extension permissions allow.

## Missing Critical Features

**None detected as “blocking all work”** — product ships. Notable gap: Walmart UX vs manifest alignment (see Tech Debt).

## Test Coverage Gaps

**Popup UI:**
- What's not tested: No `*.test.*` under `src/browser-extension/popup/`; React popup (`Popup.tsx`, settings, premium) is manual-only.
- Files: `src/browser-extension/popup/**/*.tsx`
- Risk: Regressions in auth display, navigation, premium copy.
- Priority: Medium.

**Auth worker and Supabase flows:**
- What's not tested: No unit tests under `src/auth/`; OAuth/session sync relies on manual and production.
- Files: `src/auth/auth-worker.ts`, `src/auth/content-script-auth.tsx`
- Risk: Session edge cases (expiry, sign-out, tab close).
- Priority: High for subscription-sensitive changes.

**Pegasus transport / workers integration:**
- What's not tested: No dedicated tests for `src/utils/pegasus/transport/background.ts` connection lifecycle, port teardown, or cross-tab routing errors.
- Risk: Subtle race when tabs close mid-message.
- Priority: High for new cross-context features (e.g. hover link scan, side panel).

**Supplier module:**
- What's not tested: No `worker.test` for `initSupplier` message handler; mocks like `src/supplier/mocks/alibaba-product-mock-old.ts` used ad hoc.
- Priority: Medium.

**Anti-scam whitelist / persistence logic:**
- What's not tested: No direct tests for `isWhitelisted` boundary cases (substring false positives, TTL math).
- Files: `src/anti-scam/logic/anti-scam-persistance.ts`
- Priority: High (security-adjacent).

**E2E scope:**
- What exists: Playwright tests under `test/e2e/` for Amazon, eBay, AliExpress (and .ru) flows only — `test/playwright.config.ts` `testMatch: "**/*.e2e.*"`.
- What's missing: Anti-scam, Shutaf, supplier, popup, auth, Walmart.
- CI note: `.github/workflows/ci.yml` runs `yarn test:ci` and build — Playwright E2E not invoked in shown workflow (verify `package.json` `test:ci`); risk of E2E rot.

## Planning / Execution Footguns

- **New “scan all links” or hover features:** Global `host_permissions` already grant fetch; still validate URL allowlists before background fetch to avoid SSRF-like abuse from malicious pages messaging the extension.
- **Touching anti-scam:** Any change to `isWhitelisted` or whitelist array affects security posture — require domain-parser tests and security review.
- **Adding marketplace:** Must update *both* manifests’ `content_scripts` matches and `SiteUtil` / factory wiring; forgetting one leaves silent no-ops (Walmart precedent).
- **Pegasus new message types:** Register in worker + content script + types; missing handler → silent hang or `TypeError` in background.
- **Renaming `ShutafTabManger`:** High grep surface; coordinate with tests using `as any` spies.
- **Visual assets:** `src/constants/visual.ts` embeds very large base64 strings — blows diffs and review noise; future art changes painful.
- **Integration tests hitting live APIs:** `anti-scam-integration.test.ts` couples CI/network to third parties or outdated mocks — flaky or misleading green builds.

---

*Concerns audit: 2026-04-02*
