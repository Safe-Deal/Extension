# External Integrations

**Analysis Date:** 2026-04-01

## APIs & External Services

**Safe Deal backend (first-party):**
- Base API URL defined in `src/constants/api-params.ts` as `API_URL` (`https://api.joinsafedeal.com`).
- HTTP client pattern: `src/utils/downloaders/apiDownloader.ts` prepends `API_URL` to path segments; uses `Remote.postJson` / network layer in `src/utils/downloaders/remote/remoteFetcher.ts`.
- Documented REST-style usage (non-exhaustive):
  - `POST /price` — Amazon / AliExpress price intelligence via `ApiDownloader` in `src/e-commerce/engine/stores/amazon/rules/pricing/pricing-rule-result.ts` and `src/e-commerce/engine/stores/ali-express/rules/pricing/pricing-rule-result.ts` (uses `PRICE_TYPE` from `apiDownloader.ts`).
  - `POST /product` — product infusion / reporting from `src/data/rules-conclusion/conclusion-reporter.ts` (`ignoreCaching: true` on that downloader).
  - `POST /links` — affiliate / “shutaf” link resolution in `src/shutaf/logic/product-shutaff.ts` (`SHUTAF_URL`).
  - `POST /error` — client error payload from `src/utils/analytics/logger.ts` (`sendLog` → `${API_URL}/error`).
  - Review summarization: `AI_REVIEW_SUMMARIZATION_URL` in `src/e-commerce/reviews/reviews-service.ts` → `/products/{store}/{productId}/reviews/summaries?lang=...`.
  - Supplier AI: `AI_SUPPLIER_ANALYZE_URL` in `src/supplier/supplier-ai-api-service.ts` → `/wholesale-stores/{storeId}/products/{productId}/analysis` with `Authorization: Bearer` from `useAuthStore` session.
- Supplier reviews API path constructed in `src/supplier/reviews/reviews-service.ts` (uses same `ApiDownloader` pattern).

**Safe Deal web properties:**
- `SHOPPING_URL`, `EXTENSION_AUTH_PATH` in `src/constants/api-params.ts` — shopping flow and OAuth extension handoff on `joinsafedeal.com`.
- Additional marketing/product URLs hardcoded in UI e.g. `SAFE_DEAL_SIGN_UP_URL` in `src/e-commerce/client/components/constants.ts`, chat base in `src/e-commerce/client/components/product/ProductChat.tsx`.
- Affiliate redirect base: `src/shutaf/logic/ShutafTabManger.ts` references `https://const.joinsafedeal.com/ads/?url=`.

**Anti-scam third-party sources (HTML/JSON fetched, not proprietary SDKs):**
- Web of Trust — `src/anti-scam/scam-rater/api-scam-wot.ts` scrapes `https://www.mywot.com/scorecard/{domain}`.
- Norton Safe Web — `src/anti-scam/scam-rater/api-scam-norton.ts` calls `https://safeweb.norton.com/safeweb/sites/v1/details?url=...`.
- URLVoid — `src/anti-scam/scam-rater/api-scam-void-url.ts` fetches `https://www.urlvoid.com/scan/{domain}/`.

**E-commerce site / marketplace surfaces:**
- Product pages on Amazon, AliExpress, eBay, Walmart, Alibaba, etc. — matched in `webpack/manifest_v3/manifest.json` content_scripts; logic under `src/e-commerce/`, `src/supplier/`.
- AliExpress-related public endpoint referenced in `src/e-commerce/engine/stores/ali-express/product/apiAliExpressRelated.ts` (`aliexpress.ru` aer-api path).

**Alibaba CPS / offer links:**
- Shutaf URL manipulation and examples reference `offer.alibaba.com` and product-detail URLs — see `src/shutaf/logic/ShutafUtils.ts` and tests in `src/shutaf/logic/__tests__/ShutafUtils.test.ts`.

## Data Storage

**Databases:**
- None embedded in the extension. Product/session/subscription state uses Supabase Auth (remote) and in-memory/local patterns via extension APIs where applicable.

**Local / extension storage:**
- Chrome / browser `storage` API exposed through wrapper list in `src/utils/extension/ext.ts` (`"storage"` in `apis` array). Persisted data patterns live in feature modules (e.g. anti-scam persistence `src/anti-scam/logic/anti-scam-persistance.ts`).

**File storage:**
- Local filesystem only at build time (`dist/`, zip artifacts). No cloud blob SDK in scanned `src/` paths.

**Caching:**
- In-memory caches e.g. `src/utils/cashing/memoryCache.ts`, `lru-cache` dependency; HTTP caching behavior in `src/utils/downloaders/remote/remoteFetcher.ts` and related fetch utilities.

## Authentication & Identity

**Auth provider:**
- Supabase — `createClient` in `src/utils/supabase/index.ts` with `SUPABASE_URL` and `SUPABASE_ANON_KEY` from `src/constants/supabase.ts` (`process.env` at build time).
- Session lifecycle — `src/auth/auth-worker.ts` (`onAuthStateChange`, `setSession`, sign-out); content bridge `src/auth/content-script-auth.tsx`; Zustand `src/store/AuthState.ts` stores `User` / `Session` types from `@supabase/supabase-js`.
- OAuth / login UX targets `EXTENSION_AUTH_PATH` (`src/constants/api-params.ts`) on `joinsafedeal.com`; manifest injects `content-script-auth` on `localhost` and `joinsafedeal.com` (`webpack/manifest_v3/manifest.json`).

## Monitoring & Observability

**Error reporting:**
- Custom POST to `${API_URL}/error` from `src/utils/analytics/logger.ts` (`sendLog`, Pegasus `ErrorMessageType.SEND_ERROR` path for non-background contexts).
- `debug` / `logError` gated by `IS_DEBUG` and background vs content context.

**Third-party error SaaS:**
- Sentry packages in `package.json` but no wiring found in `src/` or webpack configs — treat as inactive until integrated.

**Logs:**
- Console logging behind `IS_DEBUG` in `src/utils/analytics/logger.ts`; Node path can call `global.reportErrorToServer` when defined.

## CI/CD & Deployment

**Hosting:**
- Extension artifacts built and uploaded as GitHub Actions artifacts (`.github/workflows/ci.yml`).

**CI pipeline:**
- GitHub Actions — checkout, Node 20, `yarn install --frozen-lockfile`, `yarn dist:pretty` (prettier + eslint), `yarn test:ci`, `yarn dist:build`, version check `webpack/ver.js`, `yarn dist:rel` / `dist:rel:ff`, artifact upload.

## Environment Configuration

**Required build-time vars (for full auth/features):**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — referenced in `src/constants/supabase.ts`.

**Optional / tooling:**
- `IS_DEBUG_ON` — Node tests or tooling (`src/utils/analytics/logger.ts`).

**Secrets location:**
- `.env` used by webpack Dotenv plugin — **do not commit**; not read for this document.

## Webhooks & Callbacks

**Incoming:**
- None in-repo (extension is client-only).

**Outgoing:**
- User-initiated navigation to web OAuth and shopping URLs; HTTP POSTs to Safe Deal API and error endpoint as above. No dedicated webhook registration in scanned extension code.

## Analytics & Product Telemetry

**Named analytics SDKs (Segment, GA, etc.):**
- Not detected in `src/`. Folder `src/utils/analytics/` implements logging/error reporting, not a third-party analytics vendor.

---

*Integration audit: 2026-04-01*
