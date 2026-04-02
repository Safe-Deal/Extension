# External Integrations

**Analysis Date:** 2026-04-02

## APIs & External Services

**Safe Deal backend (first-party):**
- REST API base `https://api.joinsafedeal.com` — constant `API_URL` in `src/constants/api-params.ts`
  - JSON POST via `ApiDownloader` (`src/utils/downloaders/apiDownloader.ts`) — subclasses pass paths appended to `API_URL`
  - Client error reporting: `fetch` to `${API_URL}/error` in `src/utils/analytics/logger.ts` (`ERROR_URL`)
  - Extension lifecycle: `ext.runtime.setUninstallURL` → `${API_URL}/goodbye`; install opens `${API_URL}/get` — `src/browser-extension/extension/life-cycle.ts`

**Safe Deal web properties (HTTPS, deep links / embeds):**
- `https://www.joinsafedeal.com` — OAuth/auth path `EXTENSION_AUTH_PATH` in `src/constants/api-params.ts`; content script `src/auth/content-script-auth.tsx` matches localhost + this origin (`webpack/manifest_v3/manifest.json` / `webpack/manifest_v2/manifest.json`); marketing/support links in `src/browser-extension/popup/components/home.tsx`, `src/constants/messages.ts`, `src/browser-extension/popup/components/shared/navigation.tsx`
- `https://www.joinsafedeal.com/shopping?mode=ext` — `SHOPPING_URL` in `src/constants/api-params.ts`
- `https://shop.joinsafedeal.com/` — popup nav `src/browser-extension/popup/components/shared/navigation.tsx`
- `https://const.joinsafedeal.com/shutafim.json` — remote config `src/shutaf/logic/ShutafRemotesService.ts`
- `https://const.joinsafedeal.com/ads/?url=` — affiliate referrer prefix `src/shutaf/logic/ShutafTabManger.ts`
- Product/chat/opinions URLs — e.g. `src/e-commerce/client/components/product/ProductChat.tsx`, `src/e-commerce/client/components/product/components/Opinions/Opinions.tsx`, share link in `src/browser-extension/popup/components/home.tsx`
- Embedded iframe origin check — `src/e-commerce/client/components/shared/EmbeddedComponent.tsx` uses `https://www.joinsafedeal.com`

**Supabase (auth / user identity):**
- SDK: `@supabase/supabase-js`
- Client: `src/utils/supabase/index.ts` — `createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { autoRefreshToken, persistSession, detectSessionInUrl: false } })`
- Constants: `src/constants/supabase.ts` — reads `process.env.SUPABASE_URL`, `process.env.SUPABASE_ANON_KEY` (injected at webpack build via `dotenv-webpack`)
- Session orchestration: `src/auth/auth-worker.ts` (service worker), messaging enums in `src/constants/supabase.ts`; content bridge `src/auth/content-script-auth.tsx`

**Third-party reputation / safety (anti-scam):**
- Web of Trust (HTML scrape): `https://www.mywot.com/scorecard/{domain}` — `src/anti-scam/scam-rater/api-scam-wot.ts`
- Norton Safe Web API: `https://safeweb.norton.com/safeweb/sites/v1/details?url={domain}&insert=0` — `src/anti-scam/scam-rater/api-scam-norton.ts` via `Remote.getJson`
- URLVoid (HTML scrape): `https://www.urlvoid.com/scan/{domain}/` — `src/anti-scam/scam-rater/api-scam-void-url.ts`
- Engine merge: `src/anti-scam/logic/anti-scam-logic.ts` (`ApiScamPartners`) runs WOT, Norton, URLVoid in parallel with tab-content heuristics (`src/anti-scam/scam-rater/tab-content-rater.ts`)

**E-commerce target sites (in-page integration, not REST partners):**
- Amazon, eBay, AliExpress (regional TLDs), Alibaba.com — `content_scripts` match patterns in `webpack/manifest_v3/manifest.json` / `webpack/manifest_v2/manifest.json`; scripts `scripts/content-script-ecommerce.js`, `scripts/content-script-supplier.js`
- Logic lives under `src/e-commerce/`, `src/supplier/` — scraping and UI injection use `Remote`/`fetch` and `node-html-parser` against the active page’s origin

## Data Storage

**Databases:**
- None embedded in the extension bundle; subscription/user state comes from Supabase auth/session and backend API responses

**Local / browser storage:**
- `chrome.storage` / `browser.storage` via extension APIs (wrapped in `src/utils/extension/ext.ts` and feature persistence such as `src/anti-scam/logic/anti-scam-persistance.ts`)

**File storage:**
- Local filesystem only for build output (`dist/`), test artifacts under `test/`

**Caching:**
- In-memory caches in `src/utils/cashing/memoryCache.ts` used by `src/utils/downloaders/remote/remoteFetcher.ts` and concurrency limits per domain

## Authentication & Identity

**Auth provider:**
- Supabase Auth — email/OAuth flows mediated through `https://www.joinsafedeal.com/accounts/authorize/extension` (`EXTENSION_AUTH_PATH` in `src/constants/api-params.ts`)
- Session propagation: `auth-worker` in service worker; content script on auth surfaces syncs via Pegasus message types in `src/constants/supabase.ts`

**Premium / subscription:**
- `SubscriptionStatus` enum in `src/constants/supabase.ts`; consumed in `src/auth/auth-worker.ts` and related store (`src/store/AuthState.ts`)

## Monitoring & Observability

**Error reporting:**
- Custom POST to `${API_URL}/error` from `src/utils/analytics/logger.ts` (`logError`)

**Logs:**
- `debug` / `logError` in `src/utils/analytics/logger.ts`; behavior tied to `IS_DEBUGGER_ON` webpack `DefinePlugin` (`webpack/webpack.dev.js` / `webpack/webpack.prod.js`) and `src/browser-extension/service_worker.ts`

**Sentry:**
- Packages present in `package.json` but no application integration found in `src/` or webpack merge files — treat as unused unless wired later

## CI/CD & Deployment

**CI pipeline:**
- GitHub Actions `.github/workflows/ci.yml` — checkout, Node 20, `yarn install --frozen-lockfile`, `yarn dist:pretty` (prettier + eslint), `yarn test:ci`, `yarn dist:build`, Chrome + Firefox zip builds, artifact upload

**Hosting:**
- Extension artifacts stored as CI artifacts (`chrome-extension`, `firefox-extension`); distribution via Chrome Web Store / Firefox AMI (not defined in repo)

## Environment Configuration

**Required at build (typical):**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — consumed in `src/constants/supabase.ts` / `src/utils/supabase/index.ts`

**Optional tooling:**
- `GOOGLE_TRANSLATE_API_KEY` — `tools/translate-json.js` for `yarn translate`

**Secrets location:**
- Local `.env` loaded by webpack (`dotenv-webpack` in `webpack/webpack.common.js`); never commit values

## Webhooks & Callbacks

**Incoming:**
- None in extension process (no HTTP server in bundle)

**Outgoing:**
- All network calls are client-initiated `fetch` (and test-only `axios` in integration tests) to the URLs above; install/uninstall URLs registered with browser APIs point at `api.joinsafedeal.com`

---

## Browser-extension integration points

**Manifest & permissions:**
- MV3 Chrome: `webpack/manifest_v3/manifest.json` — `permissions`: `tabs`; `host_permissions`: `http://*/*`, `https://*/*`; background service worker `scripts/service_worker.js`
- MV2 Firefox: `webpack/manifest_v2/manifest.json` — `tabs` + broad `http(s)://*/*` in `permissions`; persistent background `scripts/service_worker.js`

**Entry bundles (webpack → `dist/scripts/`):**
- `src/browser-extension/service_worker.ts` — registers Pegasus transport, workers (`initAuthWorker`, `initAntiScamWorker`, e-commerce, shutaf, supplier, reviews, deals)
- `src/browser-extension/popup/index.tsx` — browser action UI
- Content scripts: `src/auth/content-script-auth.tsx`, `src/shutaf/content-script-shutaf.tsx`, `src/anti-scam/content-script-anti-scam.ts`, `src/e-commerce/content-script-ecommerce.tsx`, `src/supplier/content-script-supplier.tsx`

**Cross-context messaging:**
- Pegasus — `initPegasusTransport` in `src/utils/pegasus/transport/background.ts`; content scripts use Pegasus client APIs under `src/utils/pegasus/` to reach Zustand-backed workers in the service worker (pattern described in `CLAUDE.md`)

**Browser API surface:**
- `src/utils/extension/ext.ts` — merges `chrome.*` and `browser.*` for listed APIs (`tabs`, `runtime`, `storage`, `webRequest`, `webNavigation`, etc.) for cross-browser calls

**Localization:**
- `default_locale` + `__MSG_*__` in manifests; messages under `src/browser-extension/public/_locales/`

---

*Integration audit: 2026-04-02*
