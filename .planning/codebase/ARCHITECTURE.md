# Architecture

**Analysis Date:** 2026-04-01

## Pattern Overview

**Overall:** Browser extension (Manifest V3 primary; Manifest V2 for Firefox) with **feature-sliced domains**, a **central service worker orchestrator**, and **typed cross-context messaging** (Pegasus). Heavy UI uses **React**; shared state uses **Zustand** synchronized across extension contexts via Pegasus store bridges.

**Key Characteristics:**
- Content scripts **do not** call extension APIs for cross-feature coordination; they use **Pegasus transport** (`initPegasusTransport` per context) to reach the background.
- **Workers** (init functions) run **only in the service worker** and own message handlers plus store backends.
- **E-commerce rule evaluation** runs in the worker against DOM snapshots and site metadata passed from the page.

## Layers

**Shell / browser integration:**
- Purpose: Webpack entries, popup shell, service worker bootstrap, static assets, i18n, install lifecycle.
- Location: `src/browser-extension/`
- Contains: `service_worker.ts`, `popup/`, `extension/life-cycle.ts`, `public/` (copied to `dist/`).
- Depends on: `@utils/pegasus`, feature `init*` workers, `@utils/analytics/logger`, `@utils/extension/ext`.
- Used by: Browser (loads compiled `dist/scripts/*.js` per `webpack/manifest_v3/manifest.json` and `webpack/manifest_v2/manifest.json`).

**Cross-context messaging & shared state:**
- Purpose: Port-based routing, message/event buses, Zustand ↔ extension sync.
- Location: `src/utils/pegasus/` (`transport/`, `store/`, `store-zustand/`, `rpc/`)
- Contains: `initPegasusTransport` implementations (`transport/background.ts`, `transport/content-script.ts`, `transport/popup.ts`), `definePegasusMessageBus`, `definePegasusEventBus`, `initPegasusZustandStoreBackend`.
- Depends on: `webextension-polyfill`, internal packet routing (`transport/src/utils/internalPacketTypeRouter.ts`).
- Used by: All extension contexts and feature workers.

**Feature domains (vertical slices):**
- Purpose: End-user capabilities (e-commerce, anti-scam, shutaf, supplier, auth) each with content script(s), optional UI, and a background worker.
- Location: `src/e-commerce/`, `src/anti-scam/`, `src/shutaf/`, `src/supplier/`, `src/auth/`
- Contains: `content-script-*.tsx|ts` at slice root where webpack points; `worker.ts` or `*-worker.ts` for background; React trees under `client/` or `components/`.
- Depends on: Pegasus, `@store/*`, `@utils/*`, domain-specific `data` and APIs.
- Used by: Matching host permissions in manifest content_scripts.

**Shared Zustand stores:**
- Purpose: Canonical state for auth, ecommerce conclusions, anti-scam, shutaf, supplier, coupons, deals, reviews.
- Location: `src/store/*.ts` (e.g. `EcommerceStore.ts`, `AuthState.ts`, `AntiScamState.ts`)
- Contains: `create()` stores, `init*StoreBackend` for Pegasus backend registration, `*StoreReady` for awaiting sync in UI contexts.
- Depends on: `@utils/pegasus/store-zustand`, domain types.
- Used by: Popup, content UIs, workers (after `init*StoreBackend`).

**E-commerce domain model & rules engine (shared data layer):**
- Purpose: Site detection, rule orchestration, conclusion types, product entities — consumed by `e-commerce/worker/worker.ts`.
- Location: `src/data/` (`sites/`, `rules/`, `rules-conclusion/`, `entities/`, `selectors/`)
- Contains: `SiteFactory`, `RuleManager`, `ConclusionManager`, interfaces for products and conclusions.
- Depends on: DOM/site helpers from e-commerce engine utilities.
- Used by: `src/e-commerce/worker/worker.ts` and engine code under `src/e-commerce/engine/`.

**Shared utilities:**
- Purpose: Extension API wrapper, logging, site/DOM helpers, downloaders, caching, paint, Supabase client helpers.
- Location: `src/utils/` (notably `extension/ext.ts`, `analytics/logger.ts`, `site/`, `downloaders/`, `cashing/memoryCache.ts`)
- Depends on: `webextension-polyfill`, optional third-party SDKs per module.
- Used by: All layers.

## Data Flow

**E-commerce product analysis (representative):**

1. Content script `src/e-commerce/content-script-ecommerce.tsx` calls `initPegasusTransport({ allowWindowMessagingForNamespace: "CONTENT_SCRIPT_ECOMMERCE" })`, awaits `authStoreReady()`, then mounts UI via `initCommerceClient()` in `src/e-commerce/client/events/ecommerceInit.tsx`.
2. Client code gathers product + URL + document snapshot and sends a **Pegasus message** (typed bus) to the background worker registered in `src/e-commerce/worker/worker.ts`.
3. `initCommerce()` initializes `initEcommerceStoreBackend()` from `src/store/EcommerceStore.ts`, subscribes with `definePegasusMessageBus` to `EcommerceMessageTypes.PROCESS_PRODUCT`, and processes via `processProduct()` using `SiteFactory` / `RuleManager` / `ConclusionManager` (`src/data/`).
4. Worker updates Zustand via `setConclusionResponse` / `setCurrentProduct` and emits `definePegasusEventBus` broadcast `EcommerceMessageTypes.EMIT_CONCLUSION_RESPONSE_EVENT` so all subscribed contexts receive the conclusion.

**State Management:**
- UI and worker share **one logical store per feature** when `initPegasusZustandStoreBackend` is used (pattern in `src/store/EcommerceStore.ts`).
- Workers may also use **in-memory caches** (e.g. `MemoryCache` in `src/e-commerce/worker/worker.ts`) and **queues** (`p-queue`) for concurrency control.

**Auth:**
- `src/auth/auth-worker.ts` runs in the service worker: initializes auth store backend, opens popup windows for OAuth paths, coordinates Supabase session via `src/utils/supabase` and `src/constants/supabase.ts`.

## Key Abstractions

**Pegasus message/event buses:**
- Purpose: Typed RPC-style messages and broadcast events across extension contexts.
- Examples: `src/utils/pegasus/transport/index.ts` exports `definePegasusMessageBus`, `definePegasusEventBus`; usage in `src/e-commerce/worker/worker.ts`.
- Pattern: Declare `interface IEcommerceMessageBus` / `IEcommerceEventBus` alongside enums for message keys; register `onMessage` / `emitBroadcastEvent` in the worker init.

**Site + rules pipeline:**
- Purpose: Map URL/DOM to a `Site` with rules, run extractions, produce conclusion entities.
- Examples: `src/data/sites/site-factory.ts`, `src/data/rules/rule-manager.ts`, `src/data/rules-conclusion/conclusion-manager.ts`; orchestration in `src/e-commerce/worker/worker.ts`.

**Extension API indirection:**
- Purpose: Single place for Chrome/Firefox compatibility.
- Examples: `src/utils/extension/ext.ts` consumed by `src/browser-extension/extension/life-cycle.ts`, `src/auth/auth-worker.ts`.

## Entry Points

**Webpack bundle entries (source → `dist/scripts/`):**
- Defined in `webpack/webpack.common.js`:
  - `popup` → `src/browser-extension/popup/index.tsx` — initializes Pegasus popup transport, awaits `authStoreReady()`, renders `Popup`.
  - `service_worker` → `src/browser-extension/service_worker.ts` — `initPegasusTransport()` then sequentially initializes workers: auth, logging, extension lifecycle, commerce, supplier, anti-scam, reviews, shutaf, Amazon coupons, AliExpress super deals.
  - `content-script-ecommerce` → `src/e-commerce/content-script-ecommerce.tsx`
  - `content-script-anti-scam` → `src/anti-scam/content-script-anti-scam.ts`
  - `content-script-shutaf` → `src/shutaf/content-script-shutaf.tsx`
  - `content-script-supplier` → `src/supplier/content-script-supplier.tsx`
  - `content-script-auth` → `src/auth/content-script-auth.tsx`

**Manifest linkage:**
- `webpack/manifest_v3/manifest.json` references `scripts/service_worker.js`, content script bundles, and popup HTML/assets under `dist/` after build.
- `webpack/manifest_v2/manifest.json` is the Firefox-oriented manifest variant.

## Error Handling

**Strategy:** Log via centralized logger; surface user-visible failures in React with boundaries where mounted; worker paths catch and report via store updates + broadcast events (e.g. ecommerce `reportError` in `src/e-commerce/worker/worker.ts`).

**Patterns:**
- `logError` / `debug` from `src/utils/analytics/logger.ts` in async workers and content scripts.
- `ErrorBoundary` wrapping ecommerce client root in `src/e-commerce/client/events/ecommerceInit.tsx`.
- Top-level `try/catch` in `src/browser-extension/service_worker.ts` boot IIFE.

## Cross-Cutting Concerns

**Logging:** `src/utils/analytics/logger.ts` — used across workers and content scripts.

**Validation:** Domain-specific (e.g. request checks in `src/e-commerce/worker/worker.ts`); shared validators under `src/utils/validators/` when applicable.

**Authentication:** Supabase-driven; `src/auth/auth-worker.ts` + `src/store/AuthState.ts` + auth content script on localhost / `joinsafedeal.com` per manifest.

---

*Architecture analysis: 2026-04-01*
