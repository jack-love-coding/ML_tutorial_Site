# Testing Patterns

**Analysis Date:** 2026-06-25
**Mapped Commit:** `95a3eab`

## Test Framework

**Runner:**
- Node built-in test runner.
- Command: `node --test tests/*.test.*` through `npm test`.

**Assertion Library:**
- Tests use Node assertions from `node:assert/strict`.
- Some structure tests read source files directly to assert route, component, style, or asset wiring.

## Run Commands

```bash
npm test
npm run build
npm run build:pages
npm run security:audit
```

## Test File Organization

**Location:**
- All mapped tests live under `tests/`.
- Test names follow feature or module names, for example `tests/site-navigation.test.ts`, `tests/math-lab-core.test.ts`, and `tests/mlp-simulation.test.mjs`.

**Common Types:**
- Unit tests for pure utilities and simulations.
- Content schema tests for module definitions and localization.
- Layout/source tests that inspect Vue and CSS files as text.
- Build config tests for Vite assumptions and public path handling.

## Existing Coverage Areas

**Course Registration:**
- `tests/site-navigation.test.ts` checks navigation coverage.
- `tests/ai-overview-module.test.mjs` and related module tests check ordering and required teaching surfaces.

**Simulation Logic:**
- `tests/classification-simulation.test.ts`
- `tests/linear-regression-simulation.test.ts`
- `tests/mlp-simulation.test.mjs`

**Progress and Quiz:**
- `tests/algorithm-progress.test.ts`
- `tests/math-lab-core.test.ts`
- `tests/data-lab.test.ts`

**Safety and Public Paths:**
- Markdown sanitizer and math delimiter behavior are covered in `tests/math-lab-core.test.ts`.
- Public asset base behavior is covered by existing public path tests.

**Layout and Structure:**
- `tests/math-lab-layout.test.mjs`
- `tests/data-lab-layout.test.mjs`
- `tests/algorithm-checkpoints-layout.test.mjs`
- `tests/gradient-chapter-lab-layout.test.mjs`

## Baseline Result

On 2026-06-25:

```text
npm test
202 tests passed
```

Both production builds passed:

```text
npm run build
npm run build:pages
```

Both emitted the existing Vite chunk-size warning for large chunks over `1400 kB`.

## Patterns for Curriculum V2 Tests

**Catalog Tests:**
- Validate unique canonical module and lesson IDs.
- Validate every localized title/summary has both `'zh-CN'` and `en`.
- Validate legacy source IDs map to canonical IDs.

**Prerequisite Tests:**
- Validate prerequisite IDs exist.
- Validate prerequisite graph has no cycles.
- Validate the core track order respects prerequisites.

**Route Tests:**
- Validate canonical `/learn/:moduleId` and `/learn/:moduleId/:lessonId` routes.
- Validate legacy `/math-lab/*`, `/data-lab/*`, and bespoke chapter URLs redirect or still render.
- Validate GitHub Pages base path assumptions remain compatible.

**Progress Tests:**
- Validate v1 algorithm, Math Lab, and Data Lab stores migrate idempotently into v2.
- Validate corrupted JSON, missing stores, and duplicate migration runs.
- Validate v1 data is not deleted during this milestone.

**Lesson Renderer Tests:**
- Validate AI Overview, Gradient Descent, and MLP adapter parity before migrating more content.
- Validate lab registry references exist before rendering lab blocks.

## Test Gaps to Address

- No single test currently checks a unified curriculum contract across Math, Data, and Algorithm modules.
- No test currently verifies a unified continue-learning recommendation.
- No test currently asserts the intended product-level core track order from math/data/model/deep-learning.
- No browser-level visual regression exists for homepage information architecture or mobile overlap.

---
*Testing analysis: 2026-06-25*
