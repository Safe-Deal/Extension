# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
yarn dev              # Chrome - webpack watch + hot reload (port 9090)
yarn dev:ff           # Firefox - webpack watch + web-ext runner

# Production
yarn dist:build       # Webpack prod build
yarn dist:rel         # Full Chrome release: format → lint → build → pack → version bump → tag
yarn dist:rel:ff      # Full Firefox release

# Tests
yarn test             # All unit tests
yarn test:unit        # Jest (config: test/jest.config.js)
yarn test:e2e         # Playwright E2E (config: test/playwright.config.ts)

# Quality
yarn prettier         # Format code
yarn eslint           # Lint with auto-fix
```

## Architecture

Safe Deal is a Chrome/Firefox extension for e-commerce protection. Dual-manifest support: Manifest V3 (Chrome) and V2 (Firefox) via separate webpack configs.

### Entry Points (webpack → `dist/scripts/`)

| Entry | Purpose |
|---|---|
| `service_worker.ts` | Background orchestrator — initializes all feature workers, hosts Pegasus message bus |
| `popup/index.tsx` | Browser action UI (React + Zustand) |
| `content-script-ecommerce.tsx` | Injects deal/coupon widgets on Amazon & eBay |
| `content-script-anti-scam.ts` | Injects scam warning UI on all HTTP/S pages |
| `content-script-shutaf.tsx` | Injects affiliate link button on all HTTP/S pages |
| `content-script-supplier.tsx` | B2B tools on Alibaba.com |
| `content-script-auth.tsx` | OAuth flow on localhost & joinsafedeal.com |

### Communication Pattern

Content scripts **never talk directly to the background**. All cross-context messaging goes through **Pegasus** (`src/utils/pegasus/`), a typed message-passing bus. Workers live in the service worker and own their Zustand stores. Content scripts read/mutate stores via Pegasus.

```
Content Script ──Pegasus messages──▶ Worker (service_worker context)
                                          │
                                     Zustand Store ◀── Popup UI
```

### Feature Modules (`src/`)

- `anti-scam/` — Domain scam risk analysis (dangerous / safe / unknown)
- `e-commerce/` — Amazon & AliExpress deals, coupons, review summarization
- `shutaf/` — Affiliate link generation & commission tracking
- `supplier/` — B2B supplier intelligence (Alibaba)
- `auth/` — Supabase OAuth + premium subscription state
- `store/` — Zustand stores shared across contexts (AuthState, AntiScamState, ShutafState, EcommerceStore)
- `utils/extension/` — Chrome API wrappers (`ext.*`)
- `utils/site/` — Site detection & metadata helpers

### Webpack Aliases

Import using aliases instead of relative paths:
- `@utils` → `src/utils`
- `@store` → `src/store`
- `@anti-scam` → `src/anti-scam`
- (see `webpack/webpack.common.js` for full list)

## Code Style

- Functional React components only
- TypeScript strict — no `any`, no placeholders, no TODOs in committed code
- DRY + SOLID; readability over micro-optimizations
- Never remove existing functionality — only add or modify as instructed
