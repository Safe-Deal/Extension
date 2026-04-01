# Technology Stack

**Analysis Date:** 2026-04-01

## Languages

**Primary:**
- TypeScript (~5.6.x per `package.json`) — all extension source under `src/`
- JavaScript — webpack configs and tooling under `webpack/`

**Secondary:**
- SCSS/CSS — component and global styles (see `webpack/webpack.common.js` loaders)
- JSON — manifests, locales (`src/browser-extension/public/_locales/`), static data

## Runtime

**Environment:**
- Browser extension contexts: MV3 service worker (Chrome/Chromium family), content scripts, popup React app, optional auth content script on localhost / joinsafedeal
- Firefox: same codebase built with Manifest V2 copy (`webpack/manifest_v2/manifest.json`) via `yarn conf:firefox`
- Node.js — build, tests, release scripts; CI uses Node 20 (`.github/workflows/ci.yml`)

**Package Manager:**
- Yarn 1.x (`packageManager` field pins `yarn@1.22.22`)
- Lockfile: `yarn.lock` present

## Frameworks

**Core UI:**
- React ~18.3 — popup and injected UIs
- MUI (`@mui/material`, `@mui/icons-material`, `@mui/system`, `@mui/x-data-grid` 7.19.0) + Emotion (`@emotion/react`, `@emotion/styled`)
- Framer Motion, Tippy.js, Shepherd.js, Swiper, react-slick, ApexCharts — feature UI

**State:**
- Zustand ~4.5 — shared stores (e.g. auth); backends initialized from service worker

**Validation / utilities:**
- Zod ~3.23
- Lodash, date-fns, classnames, `tiny-uid`, `nanoevents`, `p-queue`, `lru-cache`

**HTML parsing (in-extension):**
- cheerio, node-html-parser — DOM/string parsing where used

**Testing:**
- Jest 29 + `ts-jest`, `jest-environment-jsdom` — config `test/jest.config.js`
- Playwright (`@playwright/test` ~1.47) — E2E, config `test/playwright.config.ts`; `postinstall` runs `playwright install`
- Testing Library (`@testing-library/react`, `jest-dom`, `user-event`)

**Build / dev:**
- Webpack ~5.95 — `webpack/webpack.common.js`, `webpack.dev.js` (watch + `webpack-ext-reloader` port 9090), `webpack.prod.js`
- `ts-loader` for TS/TSX; `sass-loader` / `css-loader` / `style-loader`; `@svgr/webpack` for SVG-as-component
- `dotenv-webpack` injects `process.env` at bundle time (`webpack/webpack.common.js`)
- `esbuild-loader` listed in devDependencies (verify active use if optimizing build)
- Copy static assets from `src/browser-extension/public` to `dist/`

**Extension tooling:**
- `webextension-polyfill` 0.12 — cross-browser API surface
- `web-ext` — Firefox dev runner (`yarn dev:ff`)

## Key Dependencies

**Critical to product behavior:**
- `@supabase/supabase-js` — OAuth/session and subscription-related auth (`src/utils/supabase/index.ts`, `src/auth/auth-worker.ts`)
- `axios` + `axios-retry` — HTTP (alongside `fetch` in places like `src/utils/downloaders/fetch.ts`)
- `webextension-polyfill` / `chrome` types — extension APIs (`src/utils/extension/ext.ts`)

**Declared but not verified in source scan (may be unused or tooling-only):**
- `@sentry/node`, `@sentry/profiling-node`, `@sentry/webpack-plugin` — present in `package.json`; no `@sentry` imports found under `src/` or webpack configs reviewed
- `eventsource`, `express`, `newman` — no imports located in `src/` in this pass (possible legacy or indirect use)

**Not detected in `package.json`:**
- Tailwind CSS — not a dependency; styling is MUI + Emotion + SCSS/CSS

## Configuration

**Environment:**
- Build-time: `dotenv-webpack` loads `.env` (file existence typical; do not commit secrets)
- Runtime constants: `SUPABASE_URL` and `SUPABASE_ANON_KEY` read from `process.env` in `src/constants/supabase.ts`

**Build:**
- `tsconfig.json` — `target` ES2018, `module` CommonJS, path aliases (`@utils/*`, `@store/*`, `@pegasus/*`, etc.)
- Manifest selection: `yarn conf:chrome` / `yarn conf:firefox` copies manifest into `src/browser-extension/public/manifest.json` before build

**Quality:**
- ESLint (Airbnb + Prettier + TypeScript + React + Jest plugins), Prettier 3.3.3 — `yarn dist:pretty`

## Platform Requirements

**Development:**
- Node (≥ version implied by CI: 20)
- Yarn 1.x
- Chrome for `yarn dev` (webpack watch + extension reloader on 9090)
- Firefox + `web-ext` for `yarn dev:ff`

**Production artifact:**
- Packed zips: `extension.zip` (Chrome track), `extension_firefox.zip` — scripts `yarn dist:rel`, `yarn dist:rel:ff`

**Browser targets:**
- Chromium: Manifest V3 (`webpack/manifest_v3/manifest.json`) — service worker `scripts/service_worker.js`
- Firefox: Manifest V2 (`webpack/manifest_v2/manifest.json`) — same webpack entries, different manifest

---

*Stack analysis: 2026-04-01*
