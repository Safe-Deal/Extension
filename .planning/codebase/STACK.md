# Technology Stack

**Analysis Date:** 2026-04-01

## Languages

**Primary:**
- TypeScript (~5.6) — all extension logic under `src/`, compiled via `ts-loader` in `webpack/webpack.common.js`
- TSX — React UI (popup, content scripts, feature modules)
- SCSS/CSS — `sass-loader` / `css-loader` / `style-loader` in `webpack/webpack.common.js`

**Secondary:**
- JavaScript — webpack configs (`webpack/webpack.common.js`, `webpack/webpack.dev.js`, `webpack/webpack.prod.js`), build helpers (`webpack/ver.js`, `webpack/rel.js`, `webpack/zip.js`)
- JSON — `_locales` messages, copied static assets via `copy-webpack-plugin` from `src/browser-extension/public`

## Runtime

**Environment:**
- Browser extension contexts: MV3 service worker (`src/browser-extension/service_worker.ts`), content scripts, popup (`src/browser-extension/popup/index.tsx`)
- Node.js — build pipeline, Jest, Playwright runner; CI uses Node 20 per `.github/workflows/ci.yml`

**Package Manager:**
- Yarn 1.x — `packageManager` field in `package.json`, `yarn.lock` present

## Frameworks

**Core:**
- React ~18.3 — UI across popup and injected scripts
- Material UI (@mui/material, @mui/icons-material, @mui/x-data-grid) + Emotion — theming and components
- Zustand — state (`src/store/`, e.g. `src/store/AuthState.ts`)
- Framer Motion — animation where used in client components

**Cross-context messaging:**
- Pegasus-style bus — `src/utils/pegasus/` (typed messages between service worker and content/popup)

**Testing:**
- Jest 29 — `test/jest.config.js`, `yarn test:unit` / `yarn test:ci:unit`
- Playwright — `@playwright/test`, `test/playwright.config.ts`, `yarn test:e2e`
- Testing Library — `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`

**Build / Dev:**
- Webpack 5 — prod `webpack/webpack.prod.js`, dev watch `webpack/webpack.dev.js`, shared `webpack/webpack.common.js`
- `dotenv-webpack` — injects `process.env` at build time from `.env` (file existence only; do not commit secrets)
- `webpack-ext-reloader` — hot reload on port 9090 in dev (`webpack/webpack.dev.js`)
- `tsconfig-paths-webpack-plugin` — aligns with `tsconfig.json` `paths` aliases

## Key Dependencies

**Critical (product behavior):**
- `webextension-polyfill` + `@types/chrome` / `@types/firefox-webext-browser` — cross-browser APIs via `src/utils/extension/ext.ts`
- `@supabase/supabase-js` — auth client wired in `src/utils/supabase/index.ts`, `src/auth/auth-worker.ts`
- `axios` / `axios-retry` — listed in `package.json` (tests and/or HTTP paths; primary remote layer often `src/utils/downloaders/remote/remoteFetcher.ts` + `fetch` in `src/utils/downloaders/fetch.ts`)
- `zod` — runtime validation where used
- `cheerio`, `node-html-parser` — HTML parsing (incl. anti-scam and e-commerce extraction)
- `p-queue`, `lru-cache` — concurrency / caching
- `apexcharts` / `react-apexcharts` — charts (e.g. price history UI)
- `shepherd.js` — onboarding / tours (`src/browser-extension/app-tour/`)

**Bundled but not referenced in application source (as of scan):**
- `@sentry/node`, `@sentry/profiling-node`, `@sentry/webpack-plugin` — present in `package.json`; no imports located under `src/` or `webpack/*.js`

**Other runtime deps (sample):**
- `lodash`, `date-fns`, `classnames`, `tldjs`, `tiny-uid`, `nanoevents`, `serialize-error`, `tippy.js`, `@tippyjs/react`, `swiper`, `react-slick`, `react-share`, etc. — UI and utilities across feature folders

**Dev / quality:**
- ESLint (Airbnb + React + TypeScript + Prettier integration) — `.eslintrc.json`
- Prettier — `.prettierrc`
- `esbuild-loader` listed in `package.json` (verify active rules in webpack if used)
- `express`, `newman` — in `package.json` dependencies; no `src/` imports found for `express`; likely auxiliary/API testing tooling

## Configuration

**Environment:**
- Build-time: `Dotenv` in `webpack/webpack.common.js` reads standard dotenv files; Supabase keys consumed via `process.env` in `src/constants/supabase.ts`
- Runtime flags: `IS_DEBUGGER_ON` from `webpack.DefinePlugin` in `webpack/webpack.dev.js` / `webpack/webpack.prod.js`; `IS_DEBUG_ON` for Node in `src/utils/analytics/logger.ts`

**TypeScript:**
- `tsconfig.json` — `target`/`lib` ES2018, `module` CommonJS, `jsx` react, path aliases `@anti-scam/*`, `@e-commerce/*`, `@utils/*`, `@store/*`, `@pegasus/*`, `@auth/*`, etc.

**Build:**
- Entry map in `webpack/webpack.common.js` — popup, service worker, five content script bundles
- Manifest swap: `yarn conf:chrome` / `conf:firefox` copy `webpack/manifest_v3/manifest.json` or `webpack/manifest_v2/manifest.json` into `src/browser-extension/public`
- Performance budget: `performance.maxEntrypointSize` / `maxAssetSize` 4MB in `webpack/webpack.common.js`

**Note:** `webpack/webpack.common.js` registers `postcss-loader` for `.pcss`; `postcss-loader` is not listed in `package.json` — verify install if `.pcss` files are used. `.gql` rule references `graphql-tag/loader`; `graphql-tag` not listed in `package.json` — rule may be unused or needs dependency.

## Platform Requirements

**Development:**
- Yarn, Node (20+ recommended to match CI)
- Chrome or Firefox for manual testing; `yarn dev` (webpack watch + reloader), `yarn dev:ff` (Firefox via `web-ext`)

**Production / distribution:**
- Packed zips via `webpack/zip.js` — artifacts uploaded in `.github/workflows/ci.yml` as `chrome-extension` / `firefox-extension`
- No traditional server host for the extension artifact itself; backend is separate (see `INTEGRATIONS.md`)

---

*Stack analysis: 2026-04-01*
