# Testing Patterns

**Analysis Date:** 2026-04-01

## Test Framework

**Runner:**
- **Jest** `^29.7.0` with **ts-jest** preset.
- **Config:** `test/jest.config.js`

**Environment:**
- `jest-environment-jsdom` (browser-like DOM for React and DOM utilities).

**Assertion / DOM:**
- `@testing-library/react`, `@testing-library/jest-dom` (via `test/jest.setup.env.js`), `@testing-library/user-event` exposed as `global.user` in `test/jest.setup.env.js`.

**Run commands (`package.json`):**

```bash
yarn test                 # run-s test:unit (unit only)
yarn test:unit            # jest --config ./test/jest.config.js --bail
yarn test:ci              # CI=1 run-s test:ci:unit
yarn test:ci:unit         # jest --verbose --runInBand --config ./test/jest.config.js
yarn test:dist            # clean, chrome manifest, dist build, then test
yarn test:e2e             # run-s test:e2e:clean test:e2e:run
yarn test:e2e:run         # yarn playwright test --config=./test/playwright.config.ts
yarn test:e2e:clean       # removes results/report/coverage/temp e2e auth json
yarn test:res             # npx playwright show-report test/result-report
yarn test:ci:e2e          # conf:chrome dist:build test:e2e (not used in default CI job)
```

**Timeouts:**
- Jest `testTimeout`: 120 × 1000 ms (`test/jest.config.js`).

## Test File Organization

**Location:**
- **Unit/integration tests:** Under `src/`, co-located as `*.test.ts(x)` or in `__tests__/` subdirectories.
- **E2E:** `test/e2e/**/*.e2e.ts` (Playwright `testMatch`).

**Scale (observed):**
- **69** files matching `*.test.ts` or `*.test.tsx` under `src/` (count on 2026-04-01).
- **12** Playwright spec files matching `**/*.e2e.*` under `test/e2e/`.

**Naming:**
- Unit: `*.test.ts`, `*.test.tsx`.
- Integration in name or path: substring `integration` triggers custom `it` behavior (see below).
- E2E: `*.e2e.ts` (e.g. `item.positive.e2e.ts`, `list.e2e.ts`).

## Jest Configuration Details

**Roots:** `["<rootDir>/../src"]` — tests live beside source.

**Setup:**
- `setupFiles`: `test/jest.setup.js` — `cross-fetch` polyfill, `global.chrome` mock, `IntersectionObserver` stub, mocks for `src/utils/analytics/logger` and `p-queue`.
- `setupFilesAfterEnv`: `test/jest.setup.env.js` — `@testing-library/jest-dom`, `global.user` from `@testing-library/user-event`, **global `it` override**.

**Module mapping:**
- Styles: `\\.(css|less|scss|sss|styl)$` → `identity-obj-proxy`.
- TS paths: `pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/../" })` from `tsconfig.json`.

**Transform:**
- `ts-jest` for `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`.
- `transformIgnorePatterns`: `node_modules/(?!(@mui|swiper)/)` — allows transforming those packages.

**Ignored test paths:**
- `testPathIgnorePatterns`: `.*\\.mock\\..*`

**Coverage:**
- `collectCoverage: true` is set in `test/jest.config.js`.
- No coverage thresholds observed in that config file.

## Global `it` Wrapper (Integration Gating)

`test/jest.setup.env.js` sets:

```javascript
global.it = integration.itWorks.bind(integration);
global.it.skip = test.skip;
```

`test/jest.integration.js` defines **integration** tests as those whose **name**, **file path**, or **directory** contains `integration` (case-insensitive). For those:

- Reads/writes per-test JSON under `test/timing/` keyed by test file path.
- If not `DEBUG` env: skips re-running a test that **already passed today** (replaces run with a trivial passing test).
- On run: updates status to passed/failed and date.

**Implication:** Local runs may skip network/integration tests that passed earlier the same day unless `DEBUG` is set—documented in `jest.integration.js` comments and `shouldRunTest` logic.

Non-integration tests use normal Jest `test()` behavior through the same `itWorks` branch.

## Test Structure (examples)

**Describe/it (unit):** `src/utils/general/__tests__/general.test.ts` — nested `describe`, multiple `it` cases, direct `expect`.

**React + mocks:** `src/e-commerce/client/components/toolbar/__tests__/FloatingToolbar.test.tsx` — `render`/`screen` from Testing Library, `jest.mock` for MUI `ThemeProvider` and store module, `beforeEach` mock return values, `userEvent` for interactions.

**Pattern:** Use path aliases where files use them; mocks may reference paths with `.ts` suffix (e.g. `jest.mock("../../../../../store/AuthState.ts")`)—match existing tests when adding new ones.

## Mocking

**Framework:** Jest (`jest.mock`, `jest.fn`).

**Global mocks:** `test/jest.setup.js` — Chrome extension APIs, logger, `p-queue`.

**What to mock:** External Chrome APIs, network, heavy queues, and modules already mocked in setup when extending similar tests.

**What not to mock:** Prefer real logic for pure functions and rule algorithms where existing tests do not mock internals.

## E2E (Playwright)

**Config:** `test/playwright.config.ts`
- **Projects:** Chromium only; `testDir` `./e2e` relative to config file → `test/e2e`.
- **testMatch:** `**/*.e2e.*`
- **Retries:** `RETRIES = 1`
- **Timeout:** `MAX_TIMEOUT_IN_MS` = 10_000 ms (10 s) for test and expect (short; may be brittle for slow pages).
- **Artifacts:** video `on` (default), trace `retain-on-failure`; project override video `retain-on-failure`, screenshot `on`.
- **globalSetup:** `test/playwright.setup.ts` (logs timeout/retries only).

**Custom fixture:** `test/playwright.ts` extends Playwright `test` with:
- Persistent Chromium context loading extension from `dist/` (`--load-extension`, `--disable-extensions-except`).
- `headless: false` on the persistent context; `IS_HEADLESS` adjusts args (`--headless=new` when headless).
- Route abort for `https://api.joinsafedeal.com/(get|start)...`
- Exports `test`, `expect`, `echo`.

**Prerequisites:** E2E assumes a built extension in `dist/` (see `yarn test:ci:e2e` vs manual `dist:build`).

**CI behavior:** Several specs early-return with `test.skip()` when `IS_CI` is true (`test/e2e/utils/constants.ts` exports `IS_CI` from `process.env.CI`). Example: `test/e2e/Amazon/item.positive.e2e.ts`. **Default GitHub Actions workflow** (`.github/workflows/ci.yml`) runs `yarn test:ci` (unit only), **not** `test:ci:e2e`—E2E is optional/manual unless another pipeline runs it.

## Coverage

**Requirements:** None enforced in `test/jest.config.js` (coverage collected but no `coverageThreshold` observed).

**Output:** Default Jest coverage output when running Jest with `collectCoverage: true` (exact reporter dirs not customized in the shown config).

## Test Types Summary

| Type | Tool | Where | CI (default workflow) |
|------|------|-------|------------------------|
| Unit | Jest + jsdom | `src/**/*.test.*` | Yes (`yarn test:ci`) |
| Integration (network/heavy) | Jest + gating | Name/path/dir `integration` | Yes, but may skip same-day passes |
| E2E | Playwright | `test/e2e/*.e2e.ts` | No (workflow does not call `test:ci:e2e`) |

## Common Patterns

**Async:** `async` `it` / `test` with `await` (see integration wrapper in `jest.integration.js`).

**Playwright:** `test.describe`, `page.goto`, `expect` from extended test, shared helpers in `test/e2e/utils/` (`constants.ts`, `utils.ts`).

## Visible Quality Gaps

- E2E not in default `ci.yml` job; many Amazon/AliExpress suites skip entirely when `CI` is set.
- Playwright global timeout 10s may be tight for real e-commerce pages (observed config value).
- No Jest `coverageThreshold` in committed config.
- `yarn test` does not run E2E or build—easy to forget `test:dist` / build before E2E.

---

*Testing analysis: 2026-04-01*
