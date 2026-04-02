# Coding Conventions

**Analysis Date:** 2026-04-02

## Naming Patterns

**Files:**

- React entry and UI: `PascalCase.tsx` for components (e.g. `FloatingToolbar.tsx`); tests often `ComponentName.test.tsx` or co-located under `__tests__/`.
- Stores: `*State.ts` in `src/store/` with a `STORE_NAME` constant and `useXStore` hook (see `src/store/AuthState.ts`).
- Content scripts and bundles: kebab-case entry names in webpack (`content-script-ecommerce.tsx`) under `src/browser-extension/` or feature roots.
- Utilities: `camelCase.ts` under `src/utils/<area>/`; nested `__tests__/` for unit tests.
- E2E specs: `*.e2e.ts` under `test/e2e/` (site folders like `Amazon/`, `Ebay/`).

**Functions:**

- Use `camelCase` for functions and methods. ESLint `camelcase` is **warn** (`.eslintrc.json`).
- Async network/data helpers often named `fetchX`, `getX`, `postX` in downloaders (`src/utils/downloaders/`).

**Variables:**

- `camelCase` for locals; `UPPER_SNAKE` for module-level constants (e.g. `STORE_NAME`, timeouts in configs).
- Boolean flags: `isX`, `hasX`, `loading` patterns in Zustand state shapes.

**Types / interfaces:**

- Interfaces prefixed with `I` in some legacy modules (e.g. `IErrorMessageBus` in `src/utils/analytics/logger.ts`); feature types often plain `PascalCase` or `*Type` enums (`ScamSiteType` in `src/anti-scam/types/`).
- Prefer explicit TypeScript types; `@typescript-eslint/no-explicit-any` is **warn**, not error.

## Code Style

**Formatting:**

- **Prettier** `3.3.3` — config in `.prettierrc`: `printWidth` 120, `endOfLine` `lf`, `trailingComma` `"none"`.
- ESLint integrates Prettier via `eslint-plugin-prettier` with `endOfLine: "auto"` in rule config (overrides Prettier file default when linting).

**Linting:**

- **ESLint** `^8.56.0` extends Airbnb + `@typescript-eslint/recommended` + Prettier + React + Jest + Testing Library (`.eslintrc.json`).
- Many Airbnb-adjacent rules downgraded to **warn** (e.g. `eqeqeq`, `no-param-reassign`, `consistent-return`) — fix incrementally; CI uses `eslint ./src --ext .ts,.tsx --fix --quiet` so **errors** fail the build; warns may still print depending on ESLint version behavior with `--quiet` (typically errors only).
- `import/extensions` off (allow extensionless imports matching TS paths).
- `react/function-component-definition` off — arrow or plain functions both allowed.
- `react/jsx-filename-extension` restricts JSX to `.jsx` / `.tsx`.

**TypeScript compiler:**

- `tsconfig.json` sets `baseUrl`, path aliases, `jsx: "react"`, `module` CommonJS, target ES2018 — **no `strict` flag**; rely on ESLint + review for null safety.

## Import Organization

**Order (prescriptive for new code):**

1. External packages (`react`, `zustand`, `@mui/*`, etc.).
2. Aliased internal imports (`@utils/*`, `@store/*`, `@anti-scam/*`, `@e-commerce/*`, `@pegasus/*`, `@auth/*`, `@constants/*`, `@data/*`, `@shutaf/*`, `@browser-extension/*`).
3. Relative imports only when no alias exists or for tight co-location.

**Path aliases:**

- Defined in `tsconfig.json` `compilerOptions.paths` and resolved in webpack via `tsconfig-paths-webpack-plugin` (`webpack/webpack.common.js`).
- Jest mirrors paths via `pathsToModuleNameMapper` in `test/jest.config.js`.

**Extension in imports:**

- Prefer paths **without** `.ts`/`.tsx` in production imports; tests occasionally mock with `.ts` suffix (`FloatingToolbar.test.tsx` mocks `AuthState.ts`) — prefer consistent extensionless mocks when touching tests.

## React / TypeScript Patterns

**Components:**

- **Functional components only** (project rule in `CLAUDE.md` / `.cursorrules`). No class components for new UI.
- UI stack: **React 18**, **MUI v6** + **Emotion** (`@emotion/react`, `@emotion/styled`).
- Client widgets live under feature trees (e.g. `src/e-commerce/client/components/`).

**Hooks:**

- Custom hooks in `hooks/` next to features; test with `@testing-library/react-hooks` `renderHook` + `act` (see `src/e-commerce/client/hooks/__tests__/useTimedState.test.ts`).

**State management:**

- **Zustand** `create()` stores; cross-context sync via **Pegasus** helpers (`initPegasusZustandStoreBackend`, `pegasusZustandStoreReady` from `@utils/pegasus/store-zustand`, implementation under `src/utils/pegasus/store-zustand/src/`).
- `subscribeWithSelector` middleware used where needed (`AuthState.ts`).
- Each store exports: `STORE_NAME`, `useXStore`, `initXStoreBackend`, optional `xStoreReady`.

**Browser extension APIs:**

- Use `webextension-polyfill` / typed Chrome APIs; in unit tests `chrome` is stubbed globally in `test/jest.setup.js`.

## Error Handling

**Logging and errors:**

- Central analytics/logging in `src/utils/analytics/logger.ts`: `debug`, `logError`, `sendLog`, Sentry-oriented paths for extension vs Node; `serialize-error` in dependencies for structured errors elsewhere.
- Pegasus error bus typing: `ErrorMessageType`, `IErrorMessageBus` in `logger.ts`.
- Network layer: sentinel values like `STATUS_NOT_200` from `src/utils/downloaders/fetch.ts`; callers return `null` or structured results on failure (see `Remote.get` behavior in `remoteFetcherMocked.test.ts`).

**Patterns:**

- Prefer explicit `try/catch` at async boundaries that talk to network or extension APIs; avoid swallowing errors without `logError` or rethrow in critical paths.
- `jest.setup.js` mocks the logger module to avoid real telemetry during tests.

## Comments

**When to comment:**

- Project culture minimizes comments (`.cursorrules`); add comments only for non-obvious invariants, security, or extension API quirks.
- ESLint disable lines appear where needed (e.g. `jest.integration.js`, `logger.ts` for `console` / `@ts-ignore`).

**JSDoc / TSDoc:**

- Not required project-wide; use TSDoc on public utilities and Pegasus message types when behavior is non-obvious.

## Function Design

**Size:**

- Prefer small, single-purpose functions; large rule engines live under `src/e-commerce/engine/` — new rules should mirror existing rule file layout.

**Parameters:**

- Options objects for complex calls; boolean flags grouped at end or in a config object where patterns already exist.

**Return values:**

- Prefer discriminated unions or explicit `null` for failure over exceptions for expected failures (fetch/download paths).

## Module Design

**Exports:**

- Named exports predominate; `import/prefer-default-export` is off.

**Barrel files:**

- Feature-internal `index` barrels used sparingly; import from concrete modules with aliases for clarity.

**Webpack exclusion:**

- Test and mock files excluded from TS loader: `__tests__`, `__test__`, `*.test.*`, `*.e2e.*`, `*.mock.*` in `webpack/webpack.common.js` — keep tests out of production bundles.

---

*Convention analysis: 2026-04-02*
