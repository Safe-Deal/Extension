# External Integrations

**Analysis Date:** 2026-04-01

## APIs & External Services

**Safe Deal backend (first-party):**
- REST-style JSON API — base URL `https://api.joinsafedeal.com` (`src/constants/api-params.ts`)
  - Client wrapper: `src/utils/downloaders/apiDownloader.ts` (`ApiDownloader` prefixes paths onto `API_URL`)
  - Lifecycle pings: install/uninstall URLs built from `API_URL` in `src/browser-extension/extension/life-cycle.ts` (`/get`, `/goodbye`)
  - Server error ingestion: `POST ${API_URL}/error` from `src/utils/analytics/logger.ts` (`sendLog`)

**Safe Deal web properties (links, embeds, marketing):**
- `https://www.joinsafedeal.com/*` — auth flow, shopping, chat embeds, opinions, feedback, mobile, pricing, etc. (scattered constants; examples: `src/constants/api-params.ts`, `src/e-commerce/client/components/product/ProductChat.tsx`, `src/e-commerce/client/components/shared/EmbeddedComponent.tsx`)
- `https://const.joinsafedeal.com/` — static JSON for Shutaf config (`src/shutaf/logic/ShutafRemotesService.ts`: `shutafim.json`); affiliate referrer base (`src/shutaf/logic/ShutafTabManger.ts`)
- `https://shop.joinsafedeal.com/` — popup navigation (`src/browser-extension/popup/components/shared/navigation.tsx`)

**Authentication / subscriptions:**
- Supabase — `@supabase/supabase-js` client in `src/utils/supabase/index.ts`
  - Credentials: `SUPABASE_URL`, `SUPABASE_ANON_KEY` from `process.env` via `src/constants/supabase.ts` (bundled by webpack + dotenv)
  - OAuth UI entry: `EXTENSION_AUTH_PATH` → `https://www.joinsafedeal.com/accounts/authorize/extension`
  - Session handling: `src/auth/auth-worker.ts` (sign in/out, `onAuthStateChange`, popup windows via `ext.windows`)

**Third-party scam / reputation signals (anti-scam module):**
- Web of Trust scorecard pages — `https://www.mywot.com/scorecard/` (`src/anti-scam/scam-rater/api-scam-wot.ts`)
- URLVoid — `https://www.urlvoid.com/scan/` (`src/anti-scam/scam-rater/api-scam-void-url.ts`)
- Norton Safe Web API-shaped endpoint — `https://safeweb.norton.com/safeweb/sites/v1/details` (`src/anti-scam/scam-rater/api-scam-norton.ts`)
- Fetches use shared downloader abstractions (`src/utils/downloaders/remote/remoteFetcher.ts`) with browser-like headers where configured

## Data Storage

**Databases:**
- No local SQL/NoSQL client in-repo for app data; product data comes from APIs and page scraping

**Browser storage:**
- `chrome.storage` / extension storage via `src/utils/extension/ext.ts` and feature code (tabs, runtime, windows, etc.)

**File storage:**
- Local filesystem — build output `dist/`, test artifacts under `test/`

**Caching:**
- In-memory / request-level patterns via downloaders and `lru-cache` dependency (usage per feature files)

## Authentication & Identity

**Auth provider:**
- Supabase Auth + hosted authorize page on joinsafedeal.com (see above)
- Content script `content-script-auth` runs on `localhost` and `https://www.joinsafedeal.com/*` (see `webpack/manifest_v3/manifest.json` content_scripts)

## Monitoring & Observability

**Error reporting:**
- Custom: non-debug extension paths send structured errors to `api.joinsafedeal.com/error` (`src/utils/analytics/logger.ts`); content scripts forward to background via Pegasus message `SEND_ERROR` (`initLog` in service worker)

**Logs:**
- `debug` / `IS_DEBUG` gated console logging (`src/utils/analytics/logger.ts`); Node/tests use `IS_DEBUG_ON` when set

**Sentry:**
- Packages listed in `package.json` but no wiring observed in reviewed webpack/source files — treat as optional/unused unless configured elsewhere

## CI/CD & Deployment

**CI pipeline:**
- GitHub Actions — `.github/workflows/ci.yml`: checkout, Node 20, `yarn install --frozen-lockfile`, `yarn dist:pretty`, `yarn test:ci`, `yarn dist:build`, version check, Chrome + Firefox release zips, artifact upload

**Hosting:**
- Extension distributed as `.zip` artifacts, not a traditional web host for the app itself

## Environment Configuration

**Required env vars (build-time for Supabase client):**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

**Other:**
- `IS_DEBUG_ON` — Node/test debug (`src/utils/analytics/logger.ts`)

**Secrets location:**
- `.env` loaded by webpack (do not document values; not read for this audit)

## Webhooks & Callbacks

**Incoming:**
- None as HTTP server (extension is client-only)

**Outgoing:**
- HTTP calls to Safe Deal API, Supabase, third-party scam URLs, and static JSON on `const.joinsafedeal.com` as described above

---

# Internal Integration Boundaries

**Service worker orchestration:**
- `src/browser-extension/service_worker.ts` initializes Pegasus background transport, then feature workers: auth, commerce, supplier, anti-scam, reviews, Shutaf, Amazon coupons, AliExpress super deals

**Pegasus message bus:**
- Typed cross-context messaging — `src/utils/pegasus/` (e.g. `transport/background.ts`, `transport/content-script.ts`, `transport/popup.ts`, `transport/window.ts`, `transport/options.ts`, `transport/devtools.ts`)
- Content scripts must not call extension APIs for store sync directly; they go through Pegasus to background-owned Zustand backends

**Feature module boundaries (top-level domains under `src/`):**
- `anti-scam/` — domain risk UI + workers
- `e-commerce/` — Amazon/eBay/AliExpress deals, rules engine, reviews
- `shutaf/` — affiliate flow + remote config
- `supplier/` — Alibaba B2B
- `auth/` — Supabase session UX
- `store/` — Zustand definitions shared across contexts
- `utils/extension/` — `ext` wrapper around browser APIs
- `utils/site/` — site detection helpers

**Popup:**
- `src/browser-extension/popup/index.tsx` — React entry; participates in Pegasus/popup transport as configured

---

*Integration audit: 2026-04-01*
