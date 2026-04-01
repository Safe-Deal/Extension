# Testing Patterns

**Analysis Date:** 2026-04-01

## Test Framework (Unit / Integration)

**Runner:**

- Jest `^29.7.0` with `ts-jest` preset (`test/jest.config.js`).
- Environment: `jest-environment-jsdom` for DOM and React tests.
- Config file: `test/jest.config.js`.

**Assertion / DOM:**

- `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` (see `package.json` and `test/jest.setup.env.js`).

**Run commands:**

```bash
yarn test                 # alias: test:unit — Jest with bail
yarn test:unit            # jest --config ./test/jest.config.js --bail
yarn test:ci:unit         # CI=1 jest --verbose --runInBand --config ./test/jest.config.js
yarn test:dist            # clean, chrome manifest, prod build, then unit tests
yarn test:clean           # removes test/timing, output, output-report, temp
```

## Jest Configuration Highlights

**Roots and transforms:**

- `roots: ["<rootDir>/../src"]` — tests live beside or under `src/`.
- `transform` uses `ts-jest` for `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`.
- `moduleNameMapper`: `identity-obj-proxy` for styles; `pathsToModuleNameMapper` from `tsconfig.json` paths with prefix `<rootDir>/../` so `@utils/*`, `@store/*`, etc. resolve in tests.

**Timeouts:**

- `testTimeout`: 120 seconds (`TIMEOUT_IN_SECONDS` in `test/jest.config.js`) — accommodates slow integration cases.

**Coverage:**

- `collectCoverage: true` always when Jest runs — **no** `coverageThreshold` or `coverageReporters` overrides in repo; coverage is collected but not gated by minimum percentages in config.
- Interpretation: local/CI runs produce coverage data; enforce quality via review rather than automated thresholds unless added later.

**ESM / vendor:**

- `transformIgnorePatterns: ["node_modules/(?!(@mui|swiper)/)"]` — allows transforming selected packages.

## Setup and Globals

**`test/jest.setup.js` (before env):**

- `cross-fetch` polyfill.
- `global.chrome` mock: `runtime`, `storage.local`, `tabs`, `i18n`, `connect` / `onConnect` with a fake port (`safe-deal-port`).
- Mocks: `../src/utils/analytics/logger`, `p-queue` (in-process concurrency limiter for tests).
- `IntersectionObserver` stub.

**`test/jest.setup.env.js` (after env):**

- `require("@testing-library/jest-dom")`.
- `global.user` = `userEvent.setup()` from `@testing-library/user-event`.
- **`global.it` is replaced** with `integration.itWorks` from `test/jest.integration.js` — all tests use the integration-aware wrapper.

## Integration Test Gating (`test/jest.integration.js`)

- Tests whose **name**, **file path**, or **directory** contain `integration` (case-insensitive) are treated as integration tests.
- Reads/writes per-file JSON under `test/timing/` mirroring source path (see `getTestTimingFilePath`).
- **Skip policy:** If latest recorded run for that test is **same calendar day** and **passed**, the test is replaced with a trivial pass (unless `DEBUG` env is set — then always run).
- On failure, status is stored as failed so the next run executes the real test again.
- Implementation wraps async body in `try` / `catch`: updates timing, then rethrows.

**Guidance for new tests:**

- Name files `*.integration.test.ts` or put under `__tests__` with `integration` in the name/path if they hit network or heavy I/O and should participate in this cache.
- Use `DEBUG` when forcing full integration runs locally.

## Test File Organization

**Location:**

- Primarily **co-located** under `src/`: `__tests__/` folders or `*.test.ts(x)` next to modules (e.g. `src/utils/general/__tests__/general.test.ts`, `src/e-commerce/engine/stores/amazon/rules/pricing/__tests__/rule-pricing-algorithm.test.ts`).
- E2E isolated under `test/e2e/` (not under `src/`).

**Naming:**

- Unit: `*.test.ts`, `*.test.tsx`.
- Integration: `*.integration.test.ts` or path/name containing `integration`.
- E2E: `*.e2e.ts` matched by Playwright `testMatch: "**/*.e2e.*"` (`test/playwright.config.ts`).

## Unit / Component Test Structure

**Typical unit suite:**

- Top-level `describe` for module or component; nested `describe` per function or behavior; `it` for cases (see `src/utils/general/__tests__/general.test.ts`).

**React component tests:**

- `render` / `screen` from Testing Library; `userEvent` for interactions; `jest.mock` for MUI or Zustand hooks (e.g. `FloatingToolbar.test.tsx` mocks `ThemeProvider` and `AuthState` store).

## Mocking

**Global mocks (Jest setup):**

- Chrome extension APIs, `p-queue`, analytics logger (`test/jest.setup.js`).

**Local mocks:**

- `jest.mock("module")` next to the suite for stores, heavy UI, or network (pattern in `src/e-commerce/client/components/toolbar/__tests__/FloatingToolbar.test.tsx`).

**What to mock:**

- Extension APIs, network (`fetch`/axios) in unit tests, logger to avoid side effects, concurrent queues that depend on real timers.

**What not to mock unnecessarily:**

- Pure utilities under test; prefer real implementations when fast and deterministic.

## E2E (Playwright)

**Config:**

- `test/playwright.config.ts` — Chromium project, `testDir: "./e2e"`, `testMatch: "**/*.e2e.*"`, `globalSetup: "./playwright.setup"`, retries, video/trace, HTML reporter to `./result-report`, `outputDir: "./results"`.

**Custom fixture:**

- `test/playwright.ts` extends Playwright `test` with persistent Chromium context loading unpacked extension from `dist/`, derives `extensionId` from service worker URL, aborts routes matching `api.joinsafedeal.com` `(get|start)` for stability.

**Commands:**

```bash
yarn test:e2e              # clean + playwright test
yarn test:e2e:run          # playwright test --config=./test/playwright.config.ts
yarn test:ci:e2e           # chrome manifest + dist:build + test:e2e
yarn test:res              # npx playwright show-report test/result-report
```

**Patterns:**

- Specs import `test`, `expect`, `echo` from `test/playwright.ts` (e.g. `test/e2e/Amazon/item.positive.e2e.ts`).
- CI skip: some suites check `IS_CI` and call `test.skip()` (same example file).

**Prerequisite:**

- Built extension in `dist/` (`yarn dist:build` or dev pipeline) before E2E.

## Coverage and Quality Posture

- Coverage is **on** for every Jest invocation (`collectCoverage: true`) but **no enforced minimums** in `test/jest.config.js`.
- E2E does not replace unit coverage for engine rules; large surface of rule algorithms under `src/e-commerce/engine/stores/*/rules/` has dedicated `*.test.ts` files — extend the same patterns for new rules.

## Async and Error Testing

- Use `async` `it` with `await` for promises; Jest timeout applies globally (120s).
- Integration wrapper propagates failures after recording state — assertions still fail the run normally.

---

*Testing analysis: 2026-04-01*
