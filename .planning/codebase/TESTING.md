# Testing Patterns

**Analysis Date:** 2026-04-02

## Test Framework

**Runner:**

- **Jest** `^29.7.0` with **ts-jest** preset.
- Config: `test/jest.config.js`.

**Environment:**

- `jest-environment-jsdom` for DOM APIs in unit tests.

**Assertion / DOM:**

- **@testing-library/react** `^16.0.1`, **@testing-library/jest-dom** `^6.5.0`, **@testing-library/user-event** `^14.5.2`.
- Hooks: **@testing-library/react-hooks** `^8.0.1` with `renderHook` / `act`.

**E2E:**

- **Playwright** `@playwright/test` `^1.47.2`.
- Config: `test/playwright.config.ts` — Chromium project, `test/e2e`, `testMatch: **/*.e2e.*`, HTML + list reporters, `globalSetup: ./playwright.setup`, 10s timeout (see `MAX_TIMEOUT_IN_MS`).

**Run commands:**

```bash
yarn test              # same as test:unit (package.json)
yarn test:unit         # jest --config ./test/jest.config.js --bail
yarn test:ci:unit      # jest --verbose --runInBand --config ./test/jest.config.js
yarn test:dist         # clean, build, then unit tests
yarn test:e2e          # clean e2e artifacts then playwright
yarn test:ci:e2e       # chrome manifest + dist build + e2e
```

## Test File Organization

**Location:**

- **Co-located** under `__tests__/` next to source (majority), or `*.test.ts` / `*.test.tsx` beside implementation (e.g. `src/utils/date/date.test.ts`, e-commerce rule folders).
- Integration tests: filename or path contains `integration` (triggers custom runner behavior — see below).

**Naming:**

- Unit: `*.test.ts`, `*.test.tsx`.
- E2E: `*.e2e.ts` under `test/e2e/<Site>/`.
- Jest ignores `*.mock.*` via `testPathIgnorePatterns` in `test/jest.config.js` (use for hand-maintained mock modules if needed).

**Structure example:**

```
src/utils/downloaders/remote/__tests__/remoteFetcher.test.ts
src/utils/downloaders/remote/__tests__/remoteFetcher.integration.test.ts
src/e-commerce/client/components/toolbar/__tests__/FloatingToolbar.test.tsx
test/e2e/Amazon/item.positive.e2e.ts
```

## Jest Setup and Globals

**`test/jest.setup.js`:**

- `cross-fetch/polyfill` for fetch in tests.
- `global.chrome` mock: `runtime.sendMessage`, `storage.local`, `tabs.get`, `i18n.getMessage`, `runtime.connect` / port shape for messaging.
- `jest.mock` for `src/utils/analytics/logger` (no real logging).
- `jest.mock("p-queue")` with a small in-process concurrency simulator.
- `IntersectionObserver` stub class.

**`test/jest.setup.env.js`:**

- `@testing-library/jest-dom` matchers.
- `global.user` = `userEvent.setup()` from `@testing-library/user-event`.
- **Global `it` override:** bound to `IntegrationTestManager.itWorks` from `test/jest.integration.js` — use normal `it("name", fn)`; integration tests are detected by name/path/dir containing `integration`.

**Integration test gating (`test/jest.integration.js`):**

- Writes per-test status JSON under `test/timing/` keyed by test file path.
- If a test passed earlier **today** (same calendar date) and `DEBUG` is not set, the integration test is replaced with a skipped-style passing stub (fast reruns).
- Set `DEBUG` to force integration tests to always run.
- `yarn test:clean` removes `test/timing` among other dirs.

## Test Structure

**Suite organization:**

```typescript
describe("FloatingToolbar", () => {
  beforeEach(() => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({ ... });
  });

  it("initially renders the minimal version", () => {
    renderComponent();
    expect(screen.getByText("Minimal Content")).toBeInTheDocument();
  });
});
```

**Patterns:**

- Use `describe` per module or component; `beforeEach` for mock resets and default store values.
- Prefer `screen` queries from Testing Library over destructured `render` return when asserting visibility.
- `getByTestId` used for stable hooks (`data-testid`) where text is ambiguous (e.g. `initial-loader`, `drag-handle` in `FloatingToolbar.test.tsx`).

## Mocking

**Framework:** Jest (`jest.mock`, `jest.fn`, `jest.spyOn`).

**Patterns:**

- **Module mock:** `jest.mock("../../fetch", () => ({ fetchHtml: jest.fn(), ... }))` then cast imports `(fetchHtml as jest.Mock).mockResolvedValue(...)` (`remoteFetcherMocked.test.ts`).
- **Zustand / store:** `jest.mock("../../../../../store/AuthState.ts")` and `(useAuthStore as unknown as jest.Mock).mockReturnValue({ ... })` (`FloatingToolbar.test.tsx`).
- **MUI / theme:** lightweight component mocks when full ThemeProvider is unnecessary (`jest.mock("@mui/material/styles/ThemeProvider", ...)`).
- **Timers:** `jest.useFakeTimers()` in `beforeAll`, `jest.useRealTimers()` in `afterAll`, `act` + `jest.advanceTimersByTime` for hooks (`useTimedState.test.ts`).

**What to mock:**

- Extension APIs (`chrome` — already global in setup).
- Logger, `p-queue`, network modules under test, external UI providers that pull in heavy trees.

**What NOT to mock:**

- Prefer real implementations for pure utilities and parsers unless tests become flaky or slow; integration tests hit live HTTP for some anti-scam APIs (`src/anti-scam/__tests__/anti-scam-integration.test.ts`).

## Module Name Mapper

**`test/jest.config.js`:**

- `identity-obj-proxy` for CSS/SCSS imports.
- `pathsToModuleNameMapper(compilerOptions.paths)` aligned with `tsconfig.json` — use `@utils/`, `@store/`, etc. in tests same as app code.
- `transformIgnorePatterns` allows transforming `@mui` and `swiper` inside `node_modules`.

## Coverage

**Configuration:**

- `collectCoverage: true` in `test/jest.config.js` — coverage is generated on runs (no `coverageThreshold` in repo; **no enforced minimum** in config).

**View coverage:**

- Run `yarn test:unit` and inspect Jest’s coverage output directory (default `coverage/` at project root unless overridden — not customized in config).

## Test Types

**Unit tests:**

- Dominant style: isolated functions, downloaders, rule algorithms, site utils, Zustand-less logic.

**Integration tests (Jest):**

- Filenames/paths/`describe` names containing `integration` participate in the timing cache behavior.
- Examples: `src/utils/downloaders/remote/__tests__/remoteFetcher.integration.test.ts`, `*.integration.test.ts` under e-commerce product downloaders, `src/utils/downloaders/apis.integration.test.ts`.
- Live API tests exist in `src/anti-scam/__tests__/anti-scam-integration.test.ts` (network-dependent, may fail if external services change).

**E2E (Playwright):**

- Custom fixture in `test/playwright.ts`: launches **Chromium** with extension loaded from `dist/` (`--load-extension`, `--disable-extensions-except`).
- Aborts routes matching `https://api.joinsafedeal.com/(get|start)` during tests.
- Exposes `extensionId` from service worker URL.
- Many specs call `test.skip()` when `IS_CI` (see `test/e2e/utils/constants.ts`) — **e-commerce E2E often skipped in CI**; local runs need built extension + non-headless nuances (`IS_HEADLESS`).

## Async Testing

**Pattern:**

```typescript
it("closes when clicking away", async () => {
  renderComponent();
  await userEvent.click(screen.getByText("Minimal Content"));
  await userEvent.click(document.body);
  expect(screen.getByText("Minimal Content")).toBeInTheDocument();
});
```

- Use `async` `it` + `await userEvent.*` / `waitFor` as needed; Playwright uses `await expect(locator).toBeVisible()` with shared `expect` from extended test.

## Error Testing

**Pattern:**

- Mock rejection: `(fetchHtml as jest.Mock).mockRejectedValue(new Error("Network error"))` then assert `result` is `null` or error path (`remoteFetcherMocked.test.ts`).
- Integration manager wraps failures and records failed status in timing JSON for next run behavior.

## Inferred Coverage Gaps

- **React components:** Only a small set of `*.test.tsx` files (toolbar, product subcomponents, one `PinButton.tests.tsx` alternate suffix) — most UI under `src/` lacks component tests.
- **Service worker / Pegasus:** Background messaging and `initPegasusZustandStoreBackend` paths rely on integration/E2E and manual testing; few direct unit tests on `src/browser-extension/service_worker.ts` and pegasus transport layers.
- **Popup:** Limited automated coverage for `src/browser-extension/popup/` compared to engine utilities.
- **Supplier / auth content scripts:** Sparse test files compared to `e-commerce/engine` and `utils`.
- **Strictness:** `tsconfig.json` without `strict` increases reliance on tests and review — new code should still avoid `any` (ESLint warn).
- **E2E CI:** Skips under `IS_CI` mean regressions may not be caught in pipeline without `test:ci:e2e` and environment that supports extension loading.

---

*Testing analysis: 2026-04-02*
