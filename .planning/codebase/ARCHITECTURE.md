# Architecture

**Analysis Date:** 2026-04-01

## Pattern Overview

**Overall:** Multi-context browser extension (Chrome Manifest V3 primary; Firefox Manifest V2 via copied manifest + same webpack bundle layout).

**Key Characteristics:**
- Webpack multi-entry build: each entry compiles to `dist/scripts/[name].js`; static assets and `manifest.json` copied from `src/browser-extension/public` (`webpack/webpack.common.js`).
- A single service worker (`src/browser-extension/service_worker.ts`) bootstraps shared infrastructure then feature “workers” (in-process modules, not separate SW).
- Cross-context communication uses **Pegasus** under `src/utils/pegasus/` (ports, message/event runtimes, optional `window` postMessage path for namespaced page scripts).
- Persistent UI state uses **Zustand** stores in `src/store/`, bridged to other contexts via `@utils/pegasus/store-zustand` (`initPegasusZustandStoreBackend`, `pegasusZustandStoreReady`).

## Layers

**Extension shell (browser UI + lifecycle):**
- Purpose: Service worker entry, popup React root, static manifest/locales, install/uninstall hooks.
- Location: `src/browser-extension/`
- Contains: `service_worker.ts`, `popup/`, `public/`, `extension/life-cycle.ts`, `app-tour/`
- Depends on: `@utils/pegasus/transport/background` (SW), `@utils/pegasus/transport/popup` (popup), feature workers, `src/utils/extension/ext.ts`, `src/utils/analytics/logger.ts`
- Used by: Browser runtime (loads compiled scripts referenced in manifest)

**Feature modules (vertical slices):**
- Purpose: Domain-specific content scripts, background-side handlers, and local UI/logic.
- Location: `src/anti-scam/`, `src/auth/`, `src/e-commerce/`, `src/shutaf/`, `src/supplier/`
- Contains: `content-script-*.ts(x)` entries, `*-worker.ts` (background), client React trees where applicable
- Depends on: `src/store/`, `src/data/`, `src/utils/`, `src/constants/`
- Used by: Webpack entries and imports from shell

**Shared domain model & rules engine (e-commerce):**
- Purpose: Sites, products, rule definitions, conclusions — consumed by `src/e-commerce/worker/worker.ts`.
- Location: `src/data/` (`entities/`, `sites/`, `rules/`, `rules-conclusion/`, `selectors/`)
- Contains: TypeScript interfaces and rule/site orchestration (`RuleManager`, `ConclusionManager`, `SiteFactory`, etc. as referenced from worker)
- Depends on: `src/utils/` (e.g. site metadata, caching)
- Used by: `src/e-commerce/worker/worker.ts`, engine code under `src/e-commerce/engine/`

**Cross-cutting utilities:**
- Purpose: Extension API wrapper, logging, Pegasus, Supabase client helpers, downloaders, DOM/paint helpers, i18n-related utilities.
- Location: `src/utils/`
- Contains: `extension/ext.ts`, `pegasus/`, `analytics/`, `supabase/`, `site/`, `downloaders/`, etc.
- Depends on: `webextension-polyfill`, npm deps as imported per module
- Used by: All layers

**Global configuration constants:**
- Purpose: API base URLs, Supabase-related constants, display flags.
- Location: `src/constants/`
- Used by: Auth, workers, clients

## Data Flow

**E-commerce product analysis (background):**

1. Content script runs `initPegasusTransport` from `@utils/pegasus/transport/content-script` (`src/e-commerce/content-script-ecommerce.tsx`).
2. `initCommerce` in `src/e-commerce/worker/worker.ts` registers `initEcommerceStoreBackend` from `src/store/EcommerceStore.ts`, then `definePegasusMessageBus` / `definePegasusEventBus` handlers for `EcommerceMessageTypes`.
3. Incoming `PROCESS_PRODUCT` messages run `processProduct`: build `Site` via `SiteFactory`, execute `RuleManager` + `ConclusionManager`, update Zustand via `setConclusionResponse`, emit broadcast event `EMIT_CONCLUSION_RESPONSE_EVENT`.
4. UI contexts subscribed to the Pegasus-backed store receive updates (exact subscription sites: consumer components under `src/e-commerce/client/` and related).

**Anti-scam domain check:**

1. Background `initAntiScamWorker` (`src/anti-scam/anti-scam-worker.ts`) initializes `initAntiScamStoreBackend` from `src/store/AntiScamState.ts`, registers `definePegasusMessageBus` for `ANALYZE_DOMAIN`.
2. Handler calls `ApiScamPartners` (`src/anti-scam/logic/anti-scam-logic.ts`) and updates store; may close tab via `ext.tabs.remove` on sentinel payload (`CLOSE_TAB`).

**Auth / Supabase:**

1. `initAuthWorker` (`src/auth/auth-worker.ts`) calls `initAuthStoreBackend` from `src/store/AuthState.ts`, subscribes to store transitions, opens popup windows for auth paths using `src/utils/supabase` and `src/constants/supabase.ts`.

**State Management:**
- Zustand `create()` stores live in `src/store/*.ts`.
- Service worker initializes **backends** (`init*StoreBackend`) so state is authoritative in the extension background and replicated to popup/content via Pegasus store bridge.
- Content scripts often `await *StoreReady()` before rendering or sending messages (e.g. `authStoreReady` in `content-script-ecommerce.tsx`).

## Key Abstractions

**Pegasus transport API:**
- Purpose: Typed message bus (`definePegasusMessageBus`), event bus (`definePegasusEventBus`), and runtime routing between extension contexts.
- Examples: `src/utils/pegasus/transport/background.ts`, `content-script.ts`, `popup.ts`, `src/utils/pegasus/transport/src/MessageRuntime.ts`, `internalPacketTypeRouter.ts`
- Pattern: Persistent port from content/popup to background; background `initPegasusTransport()` maintains connection map and delivery logging.

**Pegasus + Zustand bridge:**
- Purpose: Serialize/sync store slices across contexts.
- Examples: `src/utils/pegasus/store-zustand/`, usage in `src/store/EcommerceStore.ts`, `src/store/AntiScamState.ts` (pattern repeated across store files).

**Extension API facade:**
- Purpose: Single import surface for `chrome.*` / Firefox APIs via polyfill.
- Examples: `src/utils/extension/ext.ts`

## Entry Points

**Webpack entries (see `webpack/webpack.common.js` `entry`):**

| Entry key | Source | Role |
|-----------|--------|------|
| `service_worker` | `src/browser-extension/service_worker.ts` | Init Pegasus background transport; start all `init*Worker` / `init*` feature modules |
| `popup` | `src/browser-extension/popup/index.tsx` | React popup; `initPegasusTransport` from `transport/popup`; `authStoreReady` then render |
| `content-script-ecommerce` | `src/e-commerce/content-script-ecommerce.tsx` | E-commerce UI injection; Pegasus with `allowWindowMessagingForNamespace: "CONTENT_SCRIPT_ECOMMERCE"` |
| `content-script-anti-scam` | `src/anti-scam/content-script-anti-scam.ts` | Scam UI on broad http(s) matches |
| `content-script-shutaf` | `src/shutaf/content-script-shutaf.tsx` | Affiliate/shutaf UI |
| `content-script-supplier` | `src/supplier/content-script-supplier.tsx` | Alibaba supplier UI |
| `content-script-auth` | `src/auth/content-script-auth.tsx` | OAuth on localhost / joinsafedeal |

**Manifest-driven loading:**
- Built manifest copied from `webpack/manifest_v3/manifest.json` or `webpack/manifest_v2/manifest.json` into `src/browser-extension/public/manifest.json` by `yarn conf:chrome` / `conf:firefox`; lists `scripts/*.js` and match patterns. Authoritative runtime graph is that file after build.

## Error Handling

**Strategy:** Per-feature `try/catch` around async boot IIFEs in content scripts; `logError` / `debug` from `src/utils/analytics/logger.ts`; workers catch and update store or log (e.g. `reportError` in `src/e-commerce/worker/worker.ts`).

**Patterns:**
- Service worker top-level async IIFE wraps feature `init*` in try/catch and calls `logError` (`service_worker.ts`).
- Failed product processing pushes error into `IConclusionResponse.error` and clears cache keys (`worker.ts`).

## Cross-Cutting Concerns

**Logging:** `src/utils/analytics/logger.ts` (`initLog`, `debug`, `logError`); Sentry packages present in `package.json` (usage scope not fully traced in this pass).

**Validation:** Zod in dependencies; domain validation patterns vary by module (not centralized in one schema layer).

**Authentication:** Supabase session via `src/auth/auth-worker.ts`, `src/utils/supabase`, content script `content-script-auth.tsx`; store flags drive login/logout window flow.

---

*Architecture analysis: 2026-04-01*
