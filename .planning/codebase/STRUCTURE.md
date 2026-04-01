# Structure

## Root Layout
- `src/` core extension source.
- `webpack/` build configs, manifest variants, release helpers.
- `test/` Jest + Playwright config, e2e suites, timing/coverage artifacts.
- `tools/` auxiliary scripts (ex: translations).
- `dist/` build output.

## Source Top-Level Domains (`src/`)
- `anti-scam/` scam detection logic + worker/content script.
- `auth/` auth content script + background auth worker.
- `browser-extension/` popup UI, public assets, extension lifecycle, service worker.
- `e-commerce/` main commerce engine, site rules, apps, content script, worker.
- `shutaf/` affiliate/partner feature logic + content script.
- `supplier/` supplier intelligence workflows + worker/content script.
- `store/` Zustand stores shared across contexts.
- `utils/` shared infrastructure (pegasus, downloader, extension wrappers, helpers).
- `constants/`, `data/` supporting entities/config/rules metadata.

## Key Structural Anchors
- Background bootstrap: `src/browser-extension/service_worker.ts`
- Popup entry: `src/browser-extension/popup/index.tsx`
- Main commerce injection: `src/e-commerce/content-script-ecommerce.tsx`
- Transport core: `src/utils/pegasus/transport/background.ts`
- Extension API compatibility wrapper: `src/utils/extension/ext.ts`

## Build/Manifest Structure
- Shared webpack config: `webpack/webpack.common.js`
- Mode overlays: `webpack/webpack.dev.js`, `webpack/webpack.prod.js`
- Manifests:
  - `webpack/manifest_v3/manifest.json` (Chrome)
  - `webpack/manifest_v2/manifest.json` (Firefox)

## Test Structure
- Unit/integration tests colocated under `src/**/__tests__` and `*.test.ts`.
- E2E suites by marketplace under `test/e2e/` (Amazon, Ebay, AliExpress, AliExpress.ru).
- Test runtime configs in `test/jest.config.js` and `test/playwright.config.ts`.

## Naming + Organization Patterns
- Feature-first folder organization, then subtype (`worker`, `client`, `engine`, `logic`, `components`).
- Many files use `*-worker.ts`, `content-script-*.tsx`, `*State.ts` naming.
- Alias imports configured in `tsconfig.json` (`@utils/*`, `@store/*`, etc.).
