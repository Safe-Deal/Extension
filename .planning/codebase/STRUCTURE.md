# Codebase Structure

**Analysis Date:** 2026-04-01

## Directory Layout

```
Extension/
├── webpack/                 # webpack.common|dev|prod.js, manifest_v2|v3/, zip/ver tooling
├── src/                     # All extension source
├── test/                    # Jest + Playwright configs, e2e, unit tests, timing helpers
├── tools/                   # Separate package (e.g. translate); yarn --cwd ./tools
├── dist/                    # Webpack output (generated; not source of truth)
└── package.json
```

## Directory Purposes

**`webpack/`:**
- Purpose: Build pipeline, dual manifest sources, release helpers.
- Contains: Entry map in `webpack.common.js`, env via `dotenv-webpack`, asset copy from `src/browser-extension/public`.
- Key files: `webpack/webpack.common.js`, `webpack/webpack.dev.js`, `webpack/webpack.prod.js`, `webpack/manifest_v3/manifest.json`, `webpack/manifest_v2/manifest.json`

**`src/browser-extension/`:**
- Purpose: Extension shell: SW, popup, public assets, lifecycle.
- Contains: `service_worker.ts`, `popup/`, `public/` (manifest, icons, `_locales`), `extension/life-cycle.ts`, `app-tour/`
- Key files: `src/browser-extension/service_worker.ts`, `src/browser-extension/popup/index.tsx`

**`src/e-commerce/`:**
- Purpose: Largest feature — deals/rules UI, per-marketplace engine, auxiliary apps, reviews, background worker.
- Contains:
  - `content-script-ecommerce.tsx` — webpack entry; Pegasus + client bootstrap
  - `client/` — React components, styles (`assets/*.scss`), `events/ecommerceInit.tsx`, `ECommerceClient`, processing (`client/processing/`)
  - `engine/` — site detection, store-specific downloaders/rules under `engine/stores/{amazon,ebay,ali-express}/`, conclusion logic
  - `worker/worker.ts` — `initCommerce`, Pegasus message/event buses, `p-queue` + `MemoryCache`
  - `reviews/` — review summarization worker utilities (`reviews-worker.ts`, etc.)
  - `apps/` — feature apps (e.g. `deals-ali-express/`, `shopping/`) with UI entry components
  - `components/` — small shared leaf (e.g. `SocialShare.tsx`); most UI lives under `client/components/`

**`src/anti-scam/`:**
- Purpose: Scam analysis content script + background worker + UI paint modules.
- Key files: `content-script-anti-scam.ts`, `anti-scam-worker.ts`, `logic/`

**`src/auth/`:**
- Purpose: OAuth/content script for auth origins + `auth-worker.ts` for session/store.
- Key files: `content-script-auth.tsx`, `auth-worker.ts`

**`src/shutaf/`:**
- Purpose: Affiliate/shutaf content script, background worker, tab logic.
- Key files: `content-script-shutaf.tsx`, `shutaf-worker.ts`, `logic/`

**`src/supplier/`:**
- Purpose: Alibaba B2B UI + worker + Alibaba-focused store.
- Key files: `content-script-supplier.tsx`, `worker/worker.ts`, `client/SupplierClient.tsx`, `stores/alibaba/`

**`src/store/`:**
- Purpose: Zustand stores + Pegasus backend init/ready exports per domain.
- Contains: `AuthState.ts`, `AntiScamState.ts`, `EcommerceStore.ts`, `ShutafState.ts`, `SupplierState.ts`, `ReviewSummaryState.ts`, `AmazonCouponsState.ts`, `AliexpressDealsState.ts`, `ShoppingAppState.ts`

**`src/data/`:**
- Purpose: Shared e-commerce domain: entities, sites, rules, selectors, conclusion types.
- Contains: `entities/`, `sites/`, `rules/`, `rules-conclusion/`, `selectors/`

**`src/constants/`:**
- Purpose: API URLs, Supabase constants, display helpers referenced across features.
- Key files: `src/constants/api-params.ts`, `src/constants/supabase.ts`, `src/constants/display.ts`

**`src/utils/`:**
- Purpose: Shared non-feature-specific code.
- Notable: `pegasus/` (transport + store + rpc), `extension/ext.ts`, `analytics/`, `supabase/`, `site/`, `downloaders/`, `paint/`, `react/` (theme/emotion), `validators/`, `dom/`, `cashing/`, `multilang/`

**`test/`:**
- Purpose: `jest.config.js` (referenced from `package.json` as `test/jest.config.js`), Playwright `playwright.config.ts`, e2e specs under `test/e2e/`, unit tests co-located or under `test/` per existing patterns.

**`tools/`:**
- Purpose: Auxiliary tooling (e.g. translation); invoked via `yarn translate` from repo root.

## Key File Locations

**Entry Points:**
- `webpack/webpack.common.js` — authoritative webpack `entry` map
- `src/browser-extension/service_worker.ts` — background bootstrap
- `src/browser-extension/popup/index.tsx` — popup bootstrap
- `src/e-commerce/content-script-ecommerce.tsx`, `src/anti-scam/content-script-anti-scam.ts`, `src/shutaf/content-script-shutaf.tsx`, `src/supplier/content-script-supplier.tsx`, `src/auth/content-script-auth.tsx` — content script entries

**Configuration:**
- `tsconfig.json` — `baseUrl`, `paths` aliases (`@utils/*`, `@store/*`, `@e-commerce/*`, `@pegasus/*`, etc.)
- `webpack/webpack.common.js` — resolve + `TsconfigPathsPlugin`; extra `alias` only for MUI/Emotion paths
- `src/browser-extension/public/manifest.json` — output manifest after `conf:chrome` / `conf:firefox` copy step

**Core logic (e-commerce pipeline):**
- `src/e-commerce/worker/worker.ts` — orchestration queue + Pegasus + store updates
- `src/data/rules/rule-manager.ts` (and siblings) — rule execution (imported from worker path)
- `src/e-commerce/engine/` — marketplace-specific implementations

**Cross-context messaging:**
- `src/utils/pegasus/transport/background.ts`, `content-script.ts`, `popup.ts`
- `src/utils/pegasus/store-zustand/` — Zustand sync layer

**Testing:**
- `test/jest.config.js`, `test/playwright.config.ts`

## Naming Conventions

**Files:**
- React: `PascalCase.tsx` for components; `camelCase.ts` for logic.
- Workers: `*-worker.ts` in feature roots or `worker/worker.ts`.
- Content scripts: `content-script-<feature>.ts(x)` at feature root matching webpack entry name.

**Directories:**
- Feature-first under `src/` (`e-commerce`, `anti-scam`, …).
- Engine code grouped by marketplace under `src/e-commerce/engine/stores/<marketplace>/`.

## Where to Add New Code

**New browser feature (content + background + state):**
- Content entry: new webpack entry in `webpack.common.js` + new file alongside sibling features (e.g. `src/<feature>/content-script-<feature>.tsx`).
- Background handler: register `init<Feature>()` from `src/browser-extension/service_worker.ts` (follow `initShutafWorker` pattern).
- Shared state: add `src/store/<Feature>State.ts` with `initPegasusZustandStoreBackend` / `pegasusZustandStoreReady` mirroring existing stores.
- Manifest: update `webpack/manifest_v3/manifest.json` and `webpack/manifest_v2/manifest.json` content script / permissions as required.

**New e-commerce rule or marketplace branch:**
- Domain types/rules: `src/data/` and/or `src/e-commerce/engine/stores/<marketplace>/rules/`.
- Background processing: extend `src/e-commerce/worker/worker.ts` only if pipeline or message types change.

**New UI in existing popup:**
- Components under `src/browser-extension/popup/`; ensure `initPegasusTransport` from `transport/popup` remains entry pattern.

**New shared helper:**
- Prefer `src/utils/<area>/` with focused module; import via `@utils/...` per `tsconfig.json` paths.

**Tests:**
- Co-locate `*.test.ts(x)` next to source where already done in repo, or under `test/` mirroring existing e-commerce and anti-scam tests.

## Special Directories

**`dist/`:**
- Purpose: Webpack build output (`scripts/`, `assets/`, copied `public/`).
- Generated: Yes
- Committed: Typically no (verify `.gitignore`; not relied on for structure docs)

**`src/browser-extension/public/`:**
- Purpose: Static extension files consumed by CopyWebpackPlugin; manifest template overwritten by `conf:*` scripts from `webpack/manifest_*`.
- Generated: Partially (manifest copy step before build)
- Committed: Yes (as project convention)

**`src/e-commerce/components/` (root):**
- Purpose: Minor shared component(s); primary component tree is `src/e-commerce/client/components/`.
- Uncertainty: Prefer new UI under `client/components/` unless matching existing `SocialShare.tsx`-style shared usage.

---

*Structure analysis: 2026-04-01*
