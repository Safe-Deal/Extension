# Conventions

## Language + Typing
- TypeScript is default for app code (`src/**/*.ts`, `src/**/*.tsx`).
- Strictness is mixed:
  - Strong interfaces/enums common in workers/stores.
  - Some files still use `any`, `@ts-ignore`, and `@ts-nocheck` (ex: `src/utils/extension/ext.ts`, `src/browser-extension/service_worker.ts`).

## Formatting + Linting
- Prettier (`.prettierrc`): `printWidth 120`, `trailingComma none`, `lf`.
- ESLint (`.eslintrc.json`): Airbnb + TS + React + Jest + Testing Library.
- Rule posture is warn-heavy (many style/safety checks downgraded to warnings).

## Import + Module Style
- Path aliases preferred (`tsconfig.json`): `@utils/*`, `@store/*`, `@e-commerce/*`, etc.
- Mix of named exports and default exports; no single enforced pattern.
- Shared infra referenced through utils modules (logger/downloader/transport) to avoid deep duplication.

## Architectural Coding Patterns
- Feature modules split by domain (`auth`, `e-commerce`, `supplier`, etc.).
- Background worker pattern:
  - init function per feature (ex: `initAuthWorker`, `initCommerce`).
  - registration from central `service_worker.ts`.
- Message/event bus pattern via Pegasus for cross-context interactions.
- Store pattern via Zustand + selectors + action setters in `src/store/*State.ts`.

## Error Handling Pattern
- Central logging helpers in `src/utils/analytics/logger.ts` (`debug`, `logError`, `handleError`).
- Common pattern: catch and report, then return null/fallback in downloader/services.
- Production/debug behavior toggled by `IS_DEBUGGER_ON` build define.

## Naming Patterns
- Worker files: `*-worker.ts`.
- Content scripts: `content-script-*.ts(x)`.
- Store files: `*State.ts`.
- Domain logic commonly under `logic/`, `engine/`, `client/`.

## Notable Deviations
- Some legacy typos in identifiers (`cashingKey`, `ignoreCashing`) indicate older naming drift.
- Mixed strict/loose TS style in same codebase increases refactor friction.
- Console/debug traces exist but mostly gated by debug flag.
# Coding Conventions

**Analysis Date:** 2026-04-01

## Naming Patterns

**Files:**

- React UI: `PascalCase.tsx` for components (e.g. `src/e-commerce/client/components/product/components/Rules/Rules.tsx`, `src/e-commerce/client/components/toolbar/FloatingToolbar.tsx`).
- Unit tests: `*.test.ts`, `*.test.tsx` co-located under `__tests__/` or beside implementation (e.g. `src/utils/general/__tests__/general.test.ts`, `src/utils/date/date.test.ts`).
- Integration tests: filename or path contains `integration` (e.g. `src/utils/downloaders/remote/__tests__/remoteFetcher.integration.test.ts`) — drives `test/jest.integration.js` behavior.
- E2E: `*.e2e.ts` under `test/e2e/` (e.g. `test/e2e/Amazon/item.positive.e2e.ts`).
- Mocks: `*.mock.*` excluded from Jest test path matching (`test/jest.config.js` `testPathIgnorePatterns`).

**Directories:**

- Feature areas under `src/` as lowercase or kebab-case folders: `anti-scam/`, `e-commerce/`, `shutaf/`, `auth/`, `supplier/`, engine subfolders like `ali-express/`, `amazon/`.

**Functions and variables:**

- Prefer `camelCase` for functions and locals (ESLint `camelcase` is warn-level in `.eslintrc.json`).
- Exported helpers use `camelCase` or descriptive verb phrases (e.g. `isExist`, `parsePrice` in `src/utils/general/general.ts`).

**Types and interfaces:**

- `PascalCase` for types/interfaces/enums (e.g. `ErrorMessageType`, `IErrorMessageBus` in `src/utils/analytics/logger.ts`).
- Project docs (`CLAUDE.md`) state preference for strict typing and avoiding `any`; ESLint warns on `@typescript-eslint/no-explicit-any` (warn, not error).

## Code Style

**Formatting:**

- Prettier: `.prettierrc` — `printWidth` 120, `endOfLine` "lf", `trailingComma` "none".
- ESLint integrates Prettier via `eslint-plugin-prettier` (`prettier/prettier` error with `endOfLine: "auto"` override in `.eslintrc.json`).

**Linting:**

- Base: Airbnb + `@typescript-eslint/recommended` + Prettier + React + Jest + Testing Library (`.eslintrc.json`).
- Common relaxations: `import/prefer-default-export` off, `react/jsx-props-no-spreading` off, `react/function-component-definition` off, `no-await-in-loop` off, `import/extensions` off.
- Many style rules downgraded to `warn` (e.g. `eqeqeq`, `no-param-reassign`, `consistent-return`).

**Scripts:**

- `yarn prettier` — format `src/` (see `package.json`).
- `yarn eslint` — `eslint ./src --ext .ts,.tsx --fix --quiet`.

## Import Organization

**Path aliases (use for cross-feature imports):**

- Defined in `tsconfig.json` `compilerOptions.paths` and resolved in webpack via `tsconfig-paths-webpack-plugin` (`webpack/webpack.common.js`).
- Examples: `@utils/*` → `src/utils/*`, `@store/*` → `src/store/*`, `@e-commerce/*` → `src/e-commerce/*`, `@anti-scam/*`, `@shutaf/*`, `@auth/*`, `@pegasus/*`, `@constants/*`, `@data/*`, `@browser-extension/*`.

**Observed mix:**

- Prefer aliases for shared layers (e.g. `import { definePegasusMessageBus } from "@utils/pegasus/transport"` in `src/utils/analytics/logger.ts`).
- Deep relative imports still appear in feature-local UI (e.g. `Rules.tsx` uses long `../../../../..` paths to engine and constants). New code should prefer `@e-commerce/*` / `@constants/*` where it reduces churn and matches existing alias usage in workers/utils.

**Order:**

- No enforced import-sort plugin in `.eslintrc.json`; convention is external packages first, then internal (alias or relative).

## React

- Functional components only (project rule in `CLAUDE.md` / `.cursorrules`).
- JSX only in `.tsx` (`react/jsx-filename-extension` in `.eslintrc.json`).
- MUI and Emotion are standard UI stack (`package.json` dependencies); tests may mock providers (e.g. ThemeProvider mock in `src/e-commerce/client/components/toolbar/__tests__/FloatingToolbar.test.tsx`).

## Architectural Patterns (coding-level)

- **Extension entrypoints:** Webpack entries in `webpack/webpack.common.js` — `popup`, `service_worker`, content scripts per feature (`content-script-ecommerce`, `content-script-anti-scam`, etc.).
- **Cross-context messaging:** Pegasus bus under `src/utils/pegasus/`; stores in `src/store/` (Zustand) consumed from popup/content via typed messages (`CLAUDE.md` architecture).
- **Feature modules:** Business logic grouped under `src/e-commerce/`, `src/anti-scam/`, `src/shutaf/`, `src/auth/`, `src/supplier/` with `client/` (React), `engine/`, and content script roots as applicable.

## Error Handling

**Patterns:**

- **Throw for invalid state:** Pure utilities throw `Error` when invariants break (e.g. `selectFromRange` in `src/utils/general/general.ts`).
- **Centralized logging and reporting:** `logError` / `handleError` in `src/utils/analytics/logger.ts` — formats message, attaches context (rule name, version, URL, worker vs page), skips some fetch errors (`STATUS_NOT_200`), uses `sendLog` / Pegasus `sendErrorMessage` in non-debug paths.
- **Node vs browser:** `IS_NODE` branch uses `global.reportErrorToServer` or `debug` to `console.error` (`src/utils/analytics/logger.ts`).
- **Async boundaries:** Integration test wrapper catches failures, persists status under `test/timing/`, then rethrows (`test/jest.integration.js`).

## Logging

- **Module:** `src/utils/analytics/logger.ts` — `debug`, `logError`, `sendLog`, `initLog`, Pegasus-backed error forwarding.
- **Debug gating:** `IS_DEBUG` from env (`IS_DEBUG_ON` in Node) or `IS_DEBUGGER_ON` global in extension contexts; Jest forces debug off in logger’s `getDebugFlag` when `typeof jest !== "undefined"`.
- **Tests:** `test/jest.setup.js` mocks `src/utils/analytics/logger` so logs go through `jest.fn` / `console` without hitting the network.

## Comments

- Sparse inline comments for non-obvious parsing or regex (e.g. metric extraction in `Rules.tsx`).
- ESLint disables used sparingly for bitwise GUID generation and similar (`src/utils/general/general.ts`).

## Function and Module Design

- **Exports:** Named exports common; default exports allowed by ESLint config (`import/prefer-default-export` off).
- **Barrel files:** Not required project-wide; import from concrete modules.
- **TypeScript:** Root `tsconfig.json` targets ES2018, CommonJS modules, JSX `react`; no `strict` flag shown in `compilerOptions` — treat as gradual typing with ESLint as the main guardrail.

---

*Convention analysis: 2026-04-01*
