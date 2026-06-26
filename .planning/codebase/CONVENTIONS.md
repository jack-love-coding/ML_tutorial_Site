# Coding Conventions

**Analysis Date:** 2026-06-25
**Mapped Commit:** `95a3eab`

## Naming Patterns

**Files:**
- Vue components use PascalCase, for example `src/components/AppShell.vue`.
- Data modules use camelCase or descriptive kebab-domain names, for example `gradientDescentModule.ts` and `src/modules/math-lab/`.
- Tests use `*.test.ts` or `*.test.mjs` in `tests/`.

**Functions and Variables:**
- Functions and variables use camelCase.
- Vue event handlers often use `handleX` or action verbs such as `toggleMenu`, `closeNavigation`, `refreshMathLabProgress`.
- Storage constants use local `STORAGE_KEY` variables and exported `*StorageKey` aliases.

**Types:**
- Interfaces and type aliases use PascalCase.
- Course schemas use descriptive domain names such as `AlgorithmModuleDefinition`, `MathLabModule`, and `DataLabModule`.
- `LocalizedCopy` is repeated across schemas and always uses `'zh-CN'` and `en`.

## Code Style

**Formatting:**
- Existing code uses two-space indentation.
- Strings use single quotes.
- Semicolons are omitted.
- Vue components prefer `<script setup lang="ts">`.

**Imports:**
- External imports appear before internal imports.
- Type-only imports use `import type`.
- Relative paths are used; there is no configured `@/` alias in mapped files.

## Vue Patterns

**Composition API:**
- Components use `ref`, `computed`, `watch`, lifecycle hooks, and local helper functions.
- Page components assemble state and delegate math/data work to utilities or child labs.

**Routing:**
- Route components are lazy-loaded in `src/router/index.ts`.
- Bespoke chapter routes must be declared before the generic `/learn/:slug` route.

**i18n:**
- UI copy uses vue-i18n keys or typed localized records.
- Course content must provide both `'zh-CN'` and `en`.

## Content Patterns

**Algorithm Modules:**
- Follow `AlgorithmModuleDefinition` in `src/types/ml.ts`.
- Include `chapters`, `controls`, `presets`, default config, simulation callback, checkpoints, and optional visuals/sources.

**Math Lab Modules:**
- Follow `MathLabModule` in `src/modules/math-lab/types/mathLab.ts`.
- Include concepts, sections, visuals, labs, quizzes, misconceptions, prerequisites, and next modules.

**Data Lab Modules:**
- Follow `DataLabModule` in `src/modules/data-lab/types/dataLab.ts`.
- Include data concepts, sections, visuals, labs, quizzes, misconceptions, and source references.

## Error Handling

**Storage:**
- Progress wrappers delegate malformed JSON and write-failure tolerance to `src/utils/progressStorage.ts`.
- Tests cover malformed progress and fallback behavior.

**Routes:**
- Unknown algorithm slugs redirect to `/`.
- Invalid bespoke chapter IDs redirect to the first chapter for those modules.

**User Input:**
- Labs should clamp or validate ranges and handle NaN/Infinity in utility code.

## Comments

- Comments are sparse and should explain non-obvious behavior.
- Prefer typed data and helper names over explanatory comments.
- Do not add broad comments that duplicate code behavior.

## Refactor Conventions

- Add tests before changing shared curriculum, routing, storage, or sanitizer behavior.
- Keep old URLs and v1 progress wrappers until compatibility tests prove the migration.
- Prefer adapter layers over moving all course content in the same phase.
- Treat generated assets in `public/**/generated/` as owned content unless the task explicitly updates them.

---
*Convention analysis: 2026-06-25*
