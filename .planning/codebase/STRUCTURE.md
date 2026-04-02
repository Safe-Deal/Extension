# Codebase Structure

**Analysis Date:** 2026-04-02

## Directory Layout

```
Extension/
├── src/                          # All extension source (TS/TSX, SCSS, public assets)
│   ├── anti-scam/                # Scam analysis content script + worker + UI paint
│   ├── auth/                     # OAuth content script + background auth worker
│   ├── browser-extension/        # service worker, popup, public manifest shell, lifecycle
│   ├── constants/              # API, Supabase, display, shared enums
│   ├── e-commerce/               # Largest feature: client, engine, apps, reviews, worker
│   ├── shutaf/                   # Affiliate content script + worker + tab logic
│   ├── store/                    # Zustand stores + Pegasus backend registration
│   ├── supplier/                 # Alibaba B2B content script + worker + client
│   └── utils/                    # pegasus, extension, site, downloaders, analytics, …
├── webpack/                      # webpack.*.js, manifest_v2 / manifest_v3 copies
├── test/                         # Jest (jest.config.js), Playwright e2e, timing tests
├── tools/                        # Auxiliary tooling (e.g. translate)
├── dist/                         # Build output (generated; scripts/, assets, manifest)
└── package.json
```

## Directory Purposes

**`src/browser-extension/`:**
- Purpose: Extension shell not tied to a single product feature.
- Contains: `service_worker.ts`, `popup/`, `extension/life-cycle.ts`, `public/` (manifest, `popup.html`, locales, icons)
- Key files: `src/browser-extension/service_worker.ts`, `src/browser-extension/popup/index.tsx`, `src/browser-extension/extension/life-cycle.ts`

**`src/utils/pegasus/`:**
- Purpose: Messaging and synced store infrastructure.
- Contains: `transport/` (per-context `initPegasusTransport`), `store/`, `store-zustand/`, `rpc/`
- Key files: `src/utils/pegasus/transport/background.ts`, `content-script.ts`, `popup.ts`, `src/utils/pegasus/store-zustand/index.ts`

**`src/store/`:**
- Purpose: One file per logical store; exports Zustand hook, `STORE_NAME`, `init*StoreBackend`, `*StoreReady`.
- Key files: `AuthState.ts`, `AntiScamState.ts`, `EcommerceStore.ts`, `ShutafState.ts`, `SupplierState.ts`, `ReviewSummaryState.ts`, `AmazonCouponsState.ts`, `AliexpressDealsState.ts`, `ShoppingAppState.ts`

**`src/e-commerce/`:**
- Purpose: Deals/coupons/reviews UI and product rule engine for Amazon, eBay, AliExpress.
- Contains: `content-script-ecommerce.tsx`, `client/` (React, SCSS), `engine/` (stores, rules, conclusion), `apps/` (e.g. `deals-ali-express`, `deals-amazon`, `shopping`), `reviews/`, `worker/worker.ts`, `data/`
- Key files: `src/e-commerce/content-script-ecommerce.tsx`, `src/e-commerce/client/events/ecommerceInit.tsx`, `src/e-commerce/worker/worker.ts`

**`src/anti-scam/`:**
- Purpose: Universal-page scam overlay and background domain check.
- Contains: `content-script-anti-scam.ts`, `anti-scam-worker.ts`, `logic/`, `types/`, `components/`, `__tests__/`

**`src/shutaf/`:**
- Purpose: Affiliate link tooling on general pages.
- Contains: `content-script-shutaf.tsx`, `shutaf-worker.ts`, `logic/ShutafTabManger.ts`

**`src/supplier/`:**
- Purpose: Alibaba supplier intelligence.
- Contains: `content-script-supplier.tsx`, `worker/worker.ts`, `client/SupplierClient.tsx`, `stores/alibaba/`, `supplier-ai-api-service.ts`

**`src/auth/`:**
- Purpose: Login flow pages and background session sync.
- Contains: `content-script-auth.tsx`, `auth-worker.ts`

**`src/constants/`:**
- Purpose: Shared configuration and feature flags consumed from multiple contexts.
- Key files: `api-params.ts`, `supabase.ts`, `display` (import path `@constants/display`)

**`webpack/`:**
- Purpose: Build and dual-manifest selection.
- Key files: `webpack.common.js` (entries), `manifest_v3/manifest.json`, `manifest_v2/manifest.json`

**`test/`:**
- Purpose: Unit tests (Jest config `test/jest.config.js`), E2E (`test/e2e/`, `test/playwright.config.ts`).

## Key File Locations

**Entry Points (webpack `entry` in `webpack/webpack.common.js`):**
- `src/browser-extension/popup/index.tsx` → `dist/scripts/popup.js`
- `src/browser-extension/service_worker.ts` → `dist/scripts/service_worker.js`
- `src/e-commerce/content-script-ecommerce.tsx` → `dist/scripts/content-script-ecommerce.js`
- `src/anti-scam/content-script-anti-scam.ts` → `dist/scripts/content-script-anti-scam.js`
- `src/shutaf/content-script-shutaf.tsx` → `dist/scripts/content-script-shutaf.js`
- `src/supplier/content-script-supplier.tsx` → `dist/scripts/content-script-supplier.js`
- `src/auth/content-script-auth.tsx` → `dist/scripts/content-script-auth.js`

**Configuration:**
- `tsconfig.json` — `paths`: `@utils/*`, `@store/*`, `@e-commerce/*`, `@anti-scam/*`, `@shutaf/*`, `@auth/*`, `@browser-extension/*`, `@constants/*`, `@data/*`, `@pegasus/*`
- `webpack/webpack.common.js` — aliases for MUI/Emotion only (see `resolve.alias`); TS paths via `TsconfigPathsPlugin`
- `package.json` — scripts: `conf:chrome` / `conf:firefox` copy manifest into `src/browser-extension/public/manifest.json`

**Core logic:**
- Background orchestration: `src/browser-extension/service_worker.ts`
- Pegasus hub: `src/utils/pegasus/transport/background.ts`
- E-commerce processing: `src/e-commerce/worker/worker.ts`
- Extension APIs: `src/utils/extension/ext.ts`

**Testing:**
- Jest: `test/jest.config.js`, tests co-located as `*.test.ts` / `__tests__/` under `src/`
- Playwright: `test/playwright.config.ts`, specs under `test/e2e/`

## Naming Conventions

**Files:**
- Content script entries: `content-script-<feature>.ts(x)` at feature root (`src/e-commerce/content-script-ecommerce.tsx`, etc.)
- Background feature modules: `*-worker.ts` (`anti-scam-worker.ts`, `shutaf-worker.ts`, `auth-worker.ts`) or `worker/worker.ts` (`e-commerce`, `supplier`)
- React components: `PascalCase.tsx` under `client/` or `components/`
- SCSS partials: `_name.scss` next to components or under `client/assets/`

**Directories:**
- Feature folders: lowercase with hyphen (`anti-scam`, `e-commerce`)
- Engine subdomains: `engine/stores/<market>/` (e.g. `amazon`, `ebay`, `ali-express`)

**Stores:**
- File name `*State.ts` in `src/store/`; export `STORE_NAME` string constant for Pegasus registration

## Where to Add New Code

**New feature area (content script + background + optional UI):**
- Add webpack entry in `webpack/webpack.common.js` and a `content_scripts` block in `webpack/manifest_v3/manifest.json` and `webpack/manifest_v2/manifest.json`
- Content script: `src/<feature>/content-script-<feature>.tsx` (or `.ts`); first line pattern: `initPegasusTransport` from `src/utils/pegasus/transport/content-script.ts` (with `allowWindowMessagingForNamespace` only if page scripts must participate)
- Worker: `src/<feature>/<feature>-worker.ts` or `src/<feature>/worker/worker.ts`; register in `src/browser-extension/service_worker.ts`
- Store (if shared UI state): new file under `src/store/` using `initPegasusZustandStoreBackend` / `pegasusZustandStoreReady` from `src/utils/pegasus/store-zustand/index.ts`

**New e-commerce site or rule:**
- Site detection / factory: `src/e-commerce/data/sites/`, `src/e-commerce/engine/logic/site/display-site-factory.ts`, `src/e-commerce/engine/logic/utils/site-utils.ts`
- Rules and downloaders: `src/e-commerce/engine/stores/<market>/`
- UI: `src/e-commerce/client/components/` or new app under `src/e-commerce/apps/`

**New Pegasus message type:**
- Define `enum` + `interface I...MessageBus` next to the worker (see `src/anti-scam/anti-scam-worker.ts`)
- Implement `onMessage` in worker; call `sendMessage` from content script or popup with the same interface imported

**Utilities shared across features:**
- Prefer `src/utils/<area>/`; if constants-only, `src/constants/`

**Tests:**
- Unit: co-locate `*.test.ts` or `__tests__/` next to source (Jest excludes `*.e2e.*` via webpack/ts-loader patterns)
- E2E: `test/e2e/<Site>/`

## Special Directories

**`src/browser-extension/public/`:**
- Purpose: Static extension files copied verbatim to `dist/` root.
- Generated: No (source of truth for locales, icons, HTML)
- Committed: Yes; `manifest.json` here is overwritten by `yarn conf:chrome` / `conf:firefox` from `webpack/manifest_*/`

**`dist/`:**
- Purpose: Loadable extension directory.
- Generated: Yes (`yarn dist:build` / `yarn dev`)
- Committed: Typically no (verify `.gitignore`)

---

*Structure analysis: 2026-04-02*
