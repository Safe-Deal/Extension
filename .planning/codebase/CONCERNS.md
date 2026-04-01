# Codebase Concerns

**Analysis Date:** 2026-04-01

## Tech Debt

**Pegasus transport typing:**
- Issue: `any` and eslint suppressions in message-bus internals; `background.ts` carries a TODO to fix type casting.
- Files: `src/utils/pegasus/transport/background.ts`, `src/utils/pegasus/transport/src/types-internal.ts`, `src/utils/pegasus/transport/src/MessageRuntime.ts`, `src/utils/pegasus/transport/src/definePegasusMessageBus.ts`, `src/utils/pegasus/transport/src/definePegasusEventBus.ts`
- Impact: Harder refactors; runtime shape errors slip past compile time.
- Fix approach: Narrow generic boundaries; replace `any` with serializable payload types; remove casts once bus contracts are explicit.

**E-commerce worker helpers:**
- Issue: `reportError` and related paths use untyped destructuring parameters (`emitBroadcastEvent`, etc.).
- Files: `src/e-commerce/worker/worker.ts`
- Impact: Same as implicit-any elsewhere; regressions when changing worker API.
- Fix approach: Add interfaces for error-report payloads and event emitter signatures.

**Naming typo propagated:**
- Issue: `ShutafTabManger` (filename and class) vs expected `Manager`; tests use `ShutafTabManager.test.ts` importing the typo’d symbol.
- Files: `src/shutaf/logic/ShutafTabManger.ts`, `src/shutaf/logic/__tests__/ShutafTabManager.test.ts`, `src/shutaf/shutaf-worker.ts`, `src/shutaf/logic/product-shutaff.ts`
- Impact: Confusing onboarding; grep/refactor friction.
- Fix approach: Rename with re-export alias if backward compatibility needed.

**Inline TODOs in production paths:**
- Files: `src/e-commerce/client/components/constants.ts` (z-index / potential old bug), `src/e-commerce/apps/shopping/ui/ShoppingApp.tsx` (favorite state), `src/supplier/worker/worker.ts` (tab ids), `src/utils/pegasus/store-zustand/src/pegasusZustandStoreReady.ts` (edge case)
- Impact: Known unfinished behavior; risk of silent UX bugs.
- Fix approach: Ticket each; add tests or remove after verification.

**Service worker bootstrap:**
- Issue: `// @ts-ignore` for `IS_DEBUGGER_ON` global.
- Files: `src/browser-extension/service_worker.ts`
- Impact: Build-time symbol can drift without TypeScript catching misuse.
- Fix approach: Declare in `webpack/declarations.d.ts` or use `DefinePlugin` types.

## Known Bugs

**`DOLLAR_ICON` asset in `visual.ts` (verify at runtime):**
- Symptoms: `DOLLAR_ICON` in `src/constants/visual.ts` is an extremely large template literal whose payload does not match the pattern of neighboring valid PNG/SVG data URIs (appears conflated with unrelated binary/text). **Uncertain** whether browsers still decode a usable image.
- Files: `src/constants/visual.ts`
- Trigger: Any UI that renders `DOLLAR_ICON`.
- Workaround: Not established in this audit; compare with other icons in the same file or replace from design source.

## Security Considerations

**Swallowed errors in extension wrappers:**
- Risk: Failures in `chrome.*` / polyfill calls disappear silently.
- Files: `src/utils/extension/ext.ts` (multiple empty `catch` blocks with eslint `no-empty` disabled)
- Current mitigation: Call sites avoid throwing into user-visible paths (assumption; not fully traced).
- Recommendations: Log at debug level or centralize error reporting; avoid empty catch without documented rationale.

**Third-party surface:**
- Risk: `colors` on npm has a history of maintainer incidents; `lodash` partial imports reduce tree size but full `get` usage remains in hot paths.
- Files: `package.json`, e.g. `src/supplier/worker/worker.ts`
- Current mitigation: Pinned versions in `package.json`.
- Recommendations: Prefer `lodash/get` → native optional chaining where possible; audit `colors` usage (not observed under `src/` in this pass — **uncertain** if only tooling).

## Performance Bottlenecks

**Large static modules:**
- Problem: `anti-scam-white-list.ts` is ~785 lines of domain data loaded as code; inflates parse/eval cost in anti-scam content paths.
- Files: `src/anti-scam/logic/anti-scam-white-list.ts`
- Cause: Monolithic whitelist instead of split or remote config.
- Improvement path: Lazy load, compress, or serve from extension storage with caching.

**Webpack asset budget:**
- Problem: `performance.maxEntrypointSize` / `maxAssetSize` set to 4MB in `webpack/webpack.common.js`.
- Files: `webpack/webpack.common.js`, bundled entries under `src/constants/visual.ts` (many embedded data URIs)
- Cause: Large inline assets and MUI/React stacks.
- Improvement path: Externalize icons to `asset/resource`, code-split where manifest allows.

**Jest always collects coverage:**
- Problem: `collectCoverage: true` in `test/jest.config.js` slows every `yarn test` / `yarn test:unit`.
- Files: `test/jest.config.js`
- Improvement path: Enable coverage only in CI or via env flag.

## Fragile Areas

**Pegasus + multi-context orchestration:**
- Files: `src/utils/pegasus/transport/background.ts`, `src/browser-extension/service_worker.ts`, feature workers under `src/*/worker/`, `src/*/*-worker.ts`
- Why fragile: Single background coordinates many workers; ordering in `service_worker.ts` init matters; cross-browser manifest differences (V2 vs V3).
- Safe modification: Add workers behind `initPegasusTransport()` after reviewing port lifecycle; run both Chrome and Firefox smoke paths.
- Test coverage: Integration-style tests exist for some domains; full bus matrix **not** exhaustively covered.

**Site-specific downloaders / DOM:**
- Files: `src/e-commerce/engine/stores/ali-express/product/ali-express-product-downloader.ts`, `src/utils/dom/html.ts`, `src/utils/downloaders/fetch.ts`
- Why fragile: Retailer HTML changes break selectors; long files concentrate failure.
- Safe modification: Prefer extending rule tests under `src/e-commerce/engine/stores/**/__tests__/` before DOM edits.

## Scaling Limits

**In-memory product queue:**
- Current capacity: `PQueue` concurrency 8 in `src/e-commerce/worker/worker.ts`.
- Limit: Tab storms or many listings may backlog or timeout user-visible conclusions.
- Scaling path: Tune concurrency, add backpressure signals to UI, or persist queue metrics.

## Dependencies at Risk

**Declared but unused in `src/` (this audit):**
- Packages in `package.json` with **no** import hits under `src/` for: `@sentry/node`, `@sentry/profiling-node`, `@sentry/webpack-plugin`, `newman`, `express`, `@types/express`.
- Risk: Supply-chain noise, larger installs, confusion about observability story.
- Impact: **Uncertain** whether used from `webpack/`, `tools/`, or dead; confirm before removal.
- Migration plan: Grep full repo; move dev-only tools to `devDependencies` or remove.

## Missing Critical Features

Not assessed as “missing product features” in this technical pass — scope was code health only.

## Test Coverage Gaps

**Auth module:**
- What's not tested: No `*.test.*` under `src/auth/` observed.
- Files: `src/auth/auth-worker.ts`, `src/auth/content-script-auth.tsx`
- Risk: OAuth / subscription regressions undetected by unit suite.
- Priority: High (billing and identity).

**Browser extension shell / popup:**
- What's not tested: No tests under `src/browser-extension/popup/` observed.
- Files: `src/browser-extension/popup/**/*.tsx`
- Risk: Regression in settings, premium UI, navigation.
- Priority: Medium.

**Supplier (Alibaba) pipeline:**
- What's not tested: No `*.test.*` under `src/supplier/` (excluding mocks).
- Files: `src/supplier/worker/worker.ts`, `src/supplier/stores/alibaba/alibaba-store.ts`
- Risk: AI + DOM preprocessing breaks silently.
- Priority: Medium–High.

**E-commerce React client vs engine:**
- Observation: ~41 `*.tsx` files under `src/e-commerce/client` vs ~3 test files in that subtree (pattern `**/__tests__/**`); engine/rules have denser coverage.
- Risk: UI regressions rely on manual or E2E only.
- Priority: Medium.

**E2E scope:**
- Present: `test/e2e/*.e2e.ts` (Amazon, eBay, AliExpress variants) via `test/playwright.config.ts`.
- Gap: No E2E observed for auth flow, popup, supplier, or shutaf in the same directory pattern — **uncertain** if covered elsewhere.

## TypeScript configuration

**Strictness:**
- `tsconfig.json` does not set `strict` or `noImplicitAny` (defaults apply: not strict).
- Impact: Allows implicit `any` unless ESLint catches it.
- Fix approach: Enable `strict` incrementally per package area.

---

*Concerns audit: 2026-04-01*
