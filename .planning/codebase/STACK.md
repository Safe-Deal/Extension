# Technology Stack

**Analysis Date:** 2026-04-02

## Languages

**Primary:**
- TypeScript (~5.6.x) — all extension logic, React UI, workers; compiled via `ts-loader` in `webpack/webpack.common.js`
- TSX — React components under `src/` (popup, content scripts, feature UIs)

**Secondary:**
- JavaScript — webpack configs (`webpack/webpack.common.js`, `webpack/webpack.dev.js`, `webpack/webpack.prod.js`), release helpers (`webpack/ver.js`, `webpack/rel.js`, `webpack/zip.js`), tooling (`tools/`)
- SCSS/CSS/PCSS — styles loaded with `style-loader`, `css-loader`, `sass-loader`; `.pcss` rule references `postcss-loader` in `webpack/webpack.common.js` (no `postcss` package in root `package.json` — verify if `.pcss` builds are exercised)
- JSON — manifests (`webpack/manifest_v3/manifest.json`, `webpack/manifest_v2/manifest.json`), `_locales` under `src/browser-extension/public/_locales/`

## Runtime

**Environment:**
- Node.js — CI uses 20 (`.github/workflows/ci.yml`); local dev typically aligned with CI
- Browsers — Chrome (Manifest V3) and Firefox (Manifest V2 persistent background); built bundles run as extension contexts (service worker / background script, content scripts, popup)

**Package Manager:**
- Yarn 1.x — `package.json` `packageManager` field pins `yarn@1.22.22`
- Lockfile: `yarn.lock` present at repo root

## Frameworks

**Core:**
- React ~18.3 — popup and injected UIs (`src/browser-extension/popup/`, feature modules)
- Emotion + MUI v6 — `@emotion/react`, `@emotion/styled`, `@mui/material`, `@mui/icons-material`, `@mui/x-data-grid` (webpack aliases in `webpack/webpack.common.js` force single copy)
- Zustand ~4.5 — shared stores (`src/store/`), used from workers and UI via Pegasus
- Zod ~3.23 — validation where used in feature code

**UI / UX libraries:**
- Framer Motion, Tippy.js / `@tippyjs/react`, Shepherd.js — tours, tooltips, motion
- ApexCharts + `react-apexcharts` — charts in popup/features
- Swiper, react-slick — carousels
- Additional: `classnames`, `react-share`, `react-magnifier`, `react-circular-progressbar`, `react-iframe`, `react-iframe-comm`

**State / events:**
- `nanoevents` — lightweight event emitters where used
- Custom Pegasus message bus — `src/utils/pegasus/` (typed cross-context messaging)

**Testing:**
- Jest 29 + `ts-jest` + `jest-environment-jsdom` — config `test/jest.config.js`, setup `test/jest.setup.js`, `test/jest.setup.env.js`
- Testing Library — `@testing-library/react`, `jest-dom`, `user-event`, `@testing-library/dom`
- Playwright — `@playwright/test`, config `test/playwright.config.ts`; `postinstall` runs `yarn playwright install`

**Build / Dev:**
- Webpack 5 — `webpack-cli`, `webpack-merge`; prod: `webpack/webpack.prod.js`, dev watch: `webpack/webpack.dev.js`
- `webpack-ext-reloader` — HMR/reload for Chrome dev on port 9090 (`webpack/webpack.dev.js`)
- `copy-webpack-plugin` — copies `src/browser-extension/public` to `dist/`
- `dotenv-webpack` — injects `.env` into client bundles at build time (`webpack/webpack.common.js`)
- `terser-webpack-plugin`, `css-minimizer-webpack-plugin` — minification
- `esbuild-loader` listed in devDependencies but primary TS path uses `ts-loader` in `webpack/webpack.common.js`

## Key Dependencies

**Critical (extension behavior):**
- `webextension-polyfill` — normalized `browser` API; Pegasus transport `src/utils/pegasus/transport/background.ts` imports `webextension-polyfill`
- `@types/chrome`, `@types/webextension-polyfill`, `@types/firefox-webext-browser` — typing for dual-browser support
- `@supabase/supabase-js` — auth/session; client `src/utils/supabase/index.ts`, worker `src/auth/auth-worker.ts`

**HTTP / parsing / data:**
- Native `fetch` wrappers — `src/utils/downloaders/fetch.ts`, orchestration + cache in `src/utils/downloaders/remote/remoteFetcher.ts` (primary network path for extension runtime)
- `node-html-parser` — DOM-like parse for scraped HTML (`src/utils/dom/html.ts`, AliExpress deals scraping)
- `lodash`, `date-fns`, `lru-cache`, `p-queue`, `tiny-uid`, `tldjs`, `url`, `serialize-error`, `type-fest` — utilities across modules

**Declared but not observed in `src/` (candidates for audit / removal):**
- `@sentry/node`, `@sentry/profiling-node`, `@sentry/webpack-plugin` — no Sentry imports under `src/`; not wired in webpack configs reviewed
- `axios`, `axios-retry` — axios only spotted in tests (`src/anti-scam/scam-rater/__tests__/integration/api-scam-wot.test.ts`)
- `cheerio`, `express`, `eventsource`, `newman` — no imports found in `src/` (may be legacy or tooling-only)

**Firefox dev:**
- `web-ext` — `yarn dev:ff` runs Firefox with loaded `dist/`

## Configuration

**Environment:**
- Build-time: `dotenv-webpack` loads `.env` from project root when webpack runs (file existence typical; do not commit secrets)
- Supabase: `process.env.SUPABASE_URL`, `process.env.SUPABASE_ANON_KEY` read in `src/constants/supabase.ts`
- Translation tool: `tools/translate-json.js` references `process.env.GOOGLE_TRANSLATE_API_KEY` (optional for `yarn translate`)

**Build:**
- TypeScript: `tsconfig.json` — `target` ES2018, `module` CommonJS, path aliases (`@utils/*`, `@store/*`, `@anti-scam/*`, etc.)
- Webpack entries: `webpack/webpack.common.js` — `popup`, `service_worker`, five content-script bundles
- Manifest swap: `yarn conf:chrome` / `yarn conf:firefox` copy `webpack/manifest_v3/manifest.json` or `webpack/manifest_v2/manifest.json` to `src/browser-extension/public/manifest.json` before build
- ESLint: `.eslintrc.json` (Airbnb + TypeScript + React + Jest + Testing Library)
- Prettier: `.prettierrc`

**Optional / partial:**
- Webpack includes `graphql-tag/loader` for `.gql` and `postcss-loader` for `.pcss`; no `.gql` files found; `graphql-tag` not listed in `package.json` — treat as unused pipeline unless you add GraphQL assets

## Platform Requirements

**Development:**
- Node 20+ (match CI), Yarn 1.x, Chrome and/or Firefox for manual testing; Playwright browsers after `yarn install`

**Production:**
- Ship as unpacked extension or zipped artifacts (`dist/extension.zip`, `dist/extension_firefox.zip` via `webpack/zip.js`); no traditional server deploy for the extension bundle itself — backend is external (`api.joinsafedeal.com`, Supabase project, marketing site)

---

*Stack analysis: 2026-04-02*
