# Coding Conventions

**Analysis Date:** 2026-04-01

## Naming Patterns

**Files:**
- React entry and feature files: `index.tsx`, `content-script-*.tsx` / `content-script-*.ts` under feature roots (see `webpack/webpack.common.js` entries).
- Unit/integration tests: `*.test.ts`, `*.test.tsx` co-located next to code or under `__tests__/` (examples: `src/utils/general/__tests__/general.test.ts`, `src/e-commerce/client/components/toolbar/__tests__/FloatingToolbar.test.tsx`).
- E2E: `*.e2e.ts` under `test/e2e/` (site folders: `Amazon/`, `Ebay/`, `AliExpress/`, `AliExpress.ru/`).
- Mock files: Jest ignores paths matching `.*\.mock\..*` per `test/jest.config.js` (not counted in glob search for `.test.`).

**Functions:**
- `camelCase` for functions and variables (Airbnb baseline; several style rules downgraded to `warn` in ESLint).

**Types:**
- TypeScript throughout `src/`; `@typescript-eslint/no-explicit-any` is **warn**, not error (`.eslintrc.json`).

**Components:**
- Functional React components observed (e.g. `src/e-commerce/client/components/toolbar/FloatingToolbar.tsx` and tests).

## Code Style

**Formatting:**
- **Tool:** Prettier `3.3.3` (`package.json`).
- **Config:** `.prettierrc` — `printWidth` 120, `endOfLine` lf, `trailingComma` "none".
- **Script:** `yarn prettier` runs `prettier --write ./src` with stdout/stderr redirected to `/dev/null` (silent).

**Linting:**
- **Tool:** ESLint `^8.56.0` with `yarn eslint` → `eslint ./src --ext .ts,.tsx --fix --quiet` (`package.json`).
- **Stack:** Extends `airbnb`, `plugin:@typescript-eslint/recommended`, `prettier`, `plugin:react/recommended`, `plugin:jest/recommended`, `plugin:testing-library/react` (`.eslintrc.json`).
- **Notable overrides:** `react/function-component-definition` off, `import/prefer-default-export` off, `react/jsx-props-no-spreading` off, `no-await-in-loop` off, `no-restricted-syntax` off, `testing-library/no-debugging-utils` off.
- **Many Airbnb/core rules set to `warn`** (e.g. `eqeqeq`, `no-param-reassign`, `consistent-return`, `import/no-unresolved`), so CI can pass while warnings exist locally depending on invocation (`--quiet` suppresses warnings in the lint script).

**Release/quality gate:**
- `yarn dist:pretty` runs `prettier` then `eslint` (`package.json`).
- CI (`.github/workflows/ci.yml`) runs `yarn dist:pretty` then `yarn test:ci`.

## Import Organization

**Path aliases (TypeScript + Jest + Webpack):**
- Declared in `tsconfig.json` `compilerOptions.paths` and mirrored in Jest via `pathsToModuleNameMapper` in `test/jest.config.js`.
- Webpack resolves paths with `tsconfig-paths-webpack-plugin` in `webpack/webpack.common.js`.

**Aliases in use:**

| Prefix | Maps to |
|--------|---------|
| `@anti-scam/*` | `src/anti-scam/*` |
| `@browser-extension/*` | `src/browser-extension/*` |
| `@data/*` | `src/data/*` |
| `@e-commerce/*` | `src/e-commerce/*` |
| `@shutaf/*` | `src/shutaf/*` |
| `@constants/*` | `src/constants/*` |
| `@utils/*` | `src/utils/*` |
| `@store/*` | `src/store/*` |
| `@pegasus/*` | `src/utils/pegasus/*` |
| `@auth/*` | `src/auth/*` |

**Note:** `src/supplier/` exists as a webpack entry (`content-script-supplier`) but has **no** matching `paths` entry in `tsconfig.json` (imports there are expected to use relative paths or another pattern—verify at call sites when adding code).

**ESLint import resolver:** `.eslintrc.json` `settings.import.resolver` configures **node** only. The repo lists `eslint-import-resolver-typescript` in `devDependencies` but it is **not** wired in the committed ESLint config; `import/no-unresolved` is **warn**. Uncertain how reliably `@/` aliases are validated by ESLint vs TypeScript alone.

**Suggested order (observed, not enforced by a documented rule):**
1. External packages (`react`, `@testing-library/react`, etc.).
2. Internal aliased or relative imports.
3. Type-only imports mixed with value imports as in existing files.

## TypeScript Compiler Conventions

**Config:** `tsconfig.json` — `target` ES2018, `module` CommonJS, `jsx` react, `sourceMap` true.
**Strictness:** `strict` (and related strict flags) are **not** set in the root `tsconfig.json`; default compiler strictness applies unless overridden per file. **Uncertain** whether omitting `strict` is intentional project-wide policy.

## Error Handling

**Patterns:** No single documented standard; follow existing modules. Logger is mocked globally in Jest (`test/jest.setup.js` mocks `src/utils/analytics/logger`).

## Logging

**Production/analytics:** `src/utils/analytics/logger` (mocked in unit tests).

## Comments

**When to comment:** Project docs (e.g. `CLAUDE.md`) discourage TODOs/placeholders in committed code; `.cursorrules` align with strict cleanliness—follow existing file style.

**ESLint:** `@typescript-eslint/ban-ts-comment` is **warn**.

## Function Design

**Tests:** Global `it` is **replaced** in `test/jest.setup.env.js` with `integration.itWorks` from `test/jest.integration.js`. All tests use `it("...", () => {})` but integration-tagged tests get date-based skip behavior (see TESTING.md).

**Size/parameters:** No enforced limits in config; Airbnb defaults mostly warnings.

## Module Design

**Exports:** Named and default exports both appear; `import/prefer-default-export` is off.

**Barrel files:** Feature-level barrels exist in places; no global requirement documented in config.

## Architectural Conventions (observed)

- Cross-context messaging via Pegasus (`src/utils/pegasus/`); Zustand stores under `src/store/` (per `CLAUDE.md` and codebase layout).
- Webpack excludes test/mock files from the TS loader: `__tests__`, `__test__`, `*.test.*`, `*.e2e.*`, `*.mock.*` in `webpack/webpack.common.js`.

## Visible Quality Gaps

- ESLint `--quiet` in `yarn eslint` hides warnings; `dist:pretty` still runs ESLint with `--quiet`—warnings may not surface in that pipeline.
- Many rules at `warn` with `import/no-unresolved` at `warn` and Node-only import resolver in ESLint settings.
- No `strict` in root `tsconfig.json`.
- `@supplier/*` path alias absent while other features have aliases.

---

*Convention analysis: 2026-04-01*
