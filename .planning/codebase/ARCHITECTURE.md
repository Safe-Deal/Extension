# Architecture

**Analysis Date:** 2026-04-02

## Pattern Overview

**Overall:** Multi-context browser extension with a central service worker, feature-specific content scripts, and typed cross-context messaging (Pegasus) over `runtime.connect` ports. Shared UI state uses Zustand stores mirrored from the background to popup and content scripts via Pegasus store sync.

**Key Characteristics:**
- Webpack produces one bundle per entry; manifests reference `dist/scripts/*.js` and static assets copied from `src/browser-extension/public`.
- Chrome uses Manifest V3 (`webpack/manifest_v3/manifest.json` copied to `src/browser-extension/public/manifest.json`); Firefox uses V2 (`webpack/manifest_v2/manifest.json`) via `yarn conf:firefox` before build.
- Background logic is split into small **init functions** (`initCommerce`, `initAntiScamWorker`, …) called from `src/browser-extension/service_worker.ts`.
- Content scripts call **no** `chrome.runtime.sendMessage` for feature work; they use `definePegasusMessageBus` / store hooks after `initPegasusTransport` from `src/utils/pegasus/transport/content-script.ts`.

## Layers

**Build / packaging:**
- Purpose: Compile TS/TSX, copy extension shell (manifest, locales, icons, `popup.html`).
- Location: `webpack/webpack.common.js`, `webpack/webpack.dev.js`, `webpack/webpack.prod.js`
- Contains: Entry map, loaders, `CopyWebpackPlugin` from `src/browser-extension/public`
- Depends on: `tsconfig.json` path aliases
- Used by: `yarn dev`, `yarn dist:build`

**Service worker (background):**
- Purpose: Host Pegasus router, initialize all feature workers and extension lifecycle hooks.
- Location: `src/browser-extension/service_worker.ts`
- Contains: Ordered `init*` calls after `initPegasusTransport()` from `src/utils/pegasus/transport/background.ts`
- Depends on: `@utils/pegasus`, feature `*-worker.ts` modules, `src/browser-extension/extension/life-cycle.ts`
- Used by: Browser (MV3 `background.service_worker`)

**Pegasus transport:**
- Purpose: Port-based messaging, broadcast events, endpoint identity (tab/frame), delivery receipts and reconnect handling.
- Location: `src/utils/pegasus/transport/` (`background.ts`, `content-script.ts`, `popup.ts`, `src/MessageRuntime.ts`, `src/PersistentPort.ts`, …)
- Contains: `initPegasusTransport`, `definePegasusMessageBus`, `definePegasusEventBus`, `definePegasusBrowserAPI`
- Depends on: `webextension-polyfill`
- Used by: Every extension context that participates in messaging

**Pegasus + Zustand stores:**
- Purpose: Authoritative store in service worker; subscribed copies in popup/content via bridge.
- Location: `src/utils/pegasus/store-zustand/`, `src/store/*.ts`
- Contains: `initPegasusZustandStoreBackend`, `pegasusZustandStoreReady`, per-feature `STORE_NAME` and `use*Store`
- Depends on: `zustand`, Pegasus transport
- Used by: Workers (`init*StoreBackend`) and UI / content scripts (`*StoreReady`, `use*Store.subscribe`)

**Feature modules (domain):**
- Purpose: User-facing behavior per product area (e-commerce UI + rules engine, anti-scam, shutaf, supplier, auth).
- Location: `src/e-commerce/`, `src/anti-scam/`, `src/shutaf/`, `src/supplier/`, `src/auth/`
- Contains: Content script entry, optional `worker/worker.ts` or `*-worker.ts`, client React, site-specific logic
- Depends on: `@store`, `@utils`, `@constants`
- Used by: Webpack entries and manifest `content_scripts`

**Shared utilities:**
- Purpose: Extension API surface, logging, site detection, downloaders, DOM helpers, Supabase client.
- Location: `src/utils/` (`extension/ext.ts`, `analytics/logger.ts`, `site/`, `downloaders/`, `supabase/`, …)
- Contains: Cross-feature helpers; avoid duplicating extension API usage—prefer `ext` where the project already uses it
- Depends on: Polyfill / Chrome types
- Used by: All layers

**Constants / config keys:**
- Purpose: API URLs, Supabase paths, display flags shared across contexts.
- Location: `src/constants/`
- Contains: `api-params.ts`, `supabase.ts`, `display` via `src/constants/display` (imported from e-commerce content script)

## Data Flow

**Anti-scam analyze flow:**

1. `src/anti-scam/content-script-anti-scam.ts` runs `initPegasusTransport({ allowWindowMessagingForNamespace: "CONTENT_SCRIPT_ANTI_SCAM" })`.
2. Content script `sendMessage(ANALYZE_DOMAIN, domain)` via `definePegasusMessageBus<IAntiScamMessageBus>()` (types from `src/anti-scam/anti-scam-worker.ts`).
3. `src/utils/pegasus/transport/background.ts` routes the packet to the connected port for the worker side; `src/anti-scam/anti-scam-worker.ts` handles the message.
4. Worker updates Zustand via `initAntiScamStoreBackend()` (`src/store/AntiScamState.ts`); store sync pushes state to subscribers in the tab.
5. Content script `useAntiScamStore.subscribe` runs `paintAntiScam` or persistence (`src/anti-scam/logic/anti-scam-paint.tsx`, `anti-scam-persistance`).

**E-commerce product processing flow:**

1. `src/e-commerce/content-script-ecommerce.tsx` initializes Pegasus (namespace `CONTENT_SCRIPT_ECOMMERCE`), `authStoreReady()`, then `initCommerceClient()` / `initApps()` from `src/e-commerce/client/events/ecommerceInit.tsx`.
2. Client sends `PROCESS_PRODUCT` (see `EcommerceMessageTypes` in `src/e-commerce/worker/worker.ts`) with DOM snapshot, URL metadata, and product model.
3. `initCommerce()` in `src/e-commerce/worker/worker.ts` runs `processProduct` with `RuleManager` / `ConclusionManager`, `MemoryCache`, and `p-queue` for wholesale concurrency.
4. Worker writes `setConclusionResponse` on `initEcommerceStoreBackend()` (`src/store/EcommerceStore.ts`) and emits `EMIT_CONCLUSION_RESPONSE_EVENT` via `definePegasusEventBus`.
5. React UI in `src/e-commerce/client/` consumes store / events and renders toolbars, product panels, apps under `src/e-commerce/apps/`.

**Popup auth gating:**

1. `src/browser-extension/popup/index.tsx` calls `initPegasusTransport()` from `src/utils/pegasus/transport/popup.ts`.
2. `authStoreReady()` from `src/store/AuthState.ts` resolves when the Pegasus-backed auth store is hydrated.
3. `createRoot` mounts `src/browser-extension/popup/Popup.tsx` (React).

**State Management:**
- **Authoritative:** Service worker Zustand slices registered with `initPegasusZustandStoreBackend(STORE_NAME, useXStore)` in `src/store/*.ts`.
- **Reactive UI:** Same `useXStore` in popup/content after `*StoreReady()`; subscribe or hook-based updates.
- **One-off commands / heavy work:** `definePegasusMessageBus` handlers in `*-worker.ts` files.
- **Fan-out updates:** `definePegasusEventBus` + `emitBroadcastEvent` (e.g. e-commerce conclusion events).

## Key Abstractions

**Pegasus message bus:**
- Purpose: Typed request/response and fire-and-forget messages between named logical endpoints.
- Examples: `src/utils/pegasus/transport/src/definePegasusMessageBus.ts`, usage in `src/anti-scam/anti-scam-worker.ts`, `src/e-commerce/worker/worker.ts`
- Pattern: `export interface IXMessageBus { [MessageEnum.KEY]: (payload) => Promise<...> }` co-located with worker; content script imports the same interface for `sendMessage` / `onMessage`.

**Pegasus event bus:**
- Purpose: Broadcast-style notifications (e.g. conclusion ready) to all connected contexts.
- Examples: `IEcommerceEventBus` in `src/e-commerce/worker/worker.ts`

**Feature worker initializer:**
- Purpose: Async side-effect module that wires store backend + message/event handlers once in the service worker.
- Examples: `initAuthWorker` → `src/auth/auth-worker.ts`, `initShutafWorker` → `src/shutaf/shutaf-worker.ts`, `initSupplier` → `src/supplier/worker/worker.ts`, `initReviewsSummarizeWorker` → `src/e-commerce/reviews/reviews-worker.ts`, deals workers under `src/e-commerce/apps/deals-amazon/background/`, `src/e-commerce/apps/deals-ali-express/worker/`

**Site / product engine (e-commerce):**
- Purpose: Map URL + DOM to `Site`, rules, and conclusion entities.
- Examples: `src/e-commerce/data/sites/site-factory.ts`, `src/e-commerce/data/rules/rule-manager.ts`, `src/e-commerce/engine/logic/conclusion/`, per-market stores under `src/e-commerce/engine/stores/amazon|ebay|ali-express/`

**Extension API facade:**
- Purpose: Normalize Chrome vs Firefox APIs.
- Examples: `src/utils/extension/ext.ts` (used across workers and lifecycle)

## Entry Points

**Service worker:**
- Location: `src/browser-extension/service_worker.ts`
- Triggers: Browser starts extension background context
- Responsibilities: `initPegasusTransport()`; `initAuthWorker`, `initLog`, `initExtensionSetup`, `initCommerce`, `initSupplier`, `initAntiScamWorker`, `initReviewsSummarizeWorker`, `initShutafWorker`, `initAmazonCouponsWorker`, `initAliExpressSuperDealsWorker`

**Popup:**
- Location: `src/browser-extension/popup/index.tsx` (HTML shell: `src/browser-extension/public/popup.html` after copy)
- Triggers: User clicks toolbar action
- Responsibilities: Pegasus popup transport; wait for `authStoreReady`; render `Popup`

**Content scripts (webpack entries → manifest):**
- `src/e-commerce/content-script-ecommerce.tsx` — Amazon / eBay / AliExpress matches (see `webpack/manifest_v3/manifest.json` `content_scripts`)
- `src/anti-scam/content-script-anti-scam.ts` + `src/shutaf/content-script-shutaf.tsx` — broad `http(s)://*/*` (bundled order: shutaf then anti-scam in manifest)
- `src/supplier/content-script-supplier.tsx` — `*.alibaba.com`
- `src/auth/content-script-auth.tsx` — localhost + `joinsafedeal.com`, `all_frames: true`

## Error Handling

**Strategy:** Try/catch at worker and content-script top-level async IIFEs; errors logged through `logError` / `debug` from `src/utils/analytics/logger.ts`. Service worker wraps the full init chain in one try/catch in `service_worker.ts`.

**Patterns:**
- Workers: per-message try/catch (e.g. `initAntiScamWorker` outer try/finally sets loading false)
- E-commerce: `reportError` helper in `src/e-commerce/worker/worker.ts` clears cache, sets conclusion error payload, emits event
- Content scripts: catch in IIFE, e.g. `PreDisplaySiteFactory.destroy()` on failure in `content-script-ecommerce.tsx`

## Cross-Cutting Concerns

**Logging:** `src/utils/analytics/logger.ts` (`initLog` in service worker, `debug` / `logError` elsewhere).

**Validation:** Domain-specific (e.g. Zod or manual checks inside handlers); no single global request validator in Pegasus layer.

**Authentication:** Supabase session and subscription state in `src/store/AuthState.ts`, worker-side window management in `src/auth/auth-worker.ts`, OAuth/content bridge in `src/auth/content-script-auth.tsx` and `src/utils/supabase/`.

---

*Architecture analysis: 2026-04-02*
