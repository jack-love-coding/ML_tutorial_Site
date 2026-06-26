# Curriculum V2 Baseline

**Recorded:** 2026-06-25
**Branch:** `refactor/curriculum-v2`
**Base commit:** `95a3eab`
**Scope:** Baseline before Curriculum V2 planning artifacts and source refactor work.

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| `npm test` | Pass | 202 tests passed. |
| `npm run build` | Pass | Vite emitted existing chunk-size warning. |
| `npm run build:pages` | Pass | Same chunk-size warning under GitHub Pages base path. |

## Existing Warnings

- Vite reports chunks larger than `1400 kB` after minification.
- Largest observed chunks in both builds:
  - `dist/assets/modules-*.js`: about `1,537.54 kB`
  - `dist/assets/dist-*.js`: about `1,082.26 kB`
  - `dist/assets/index-*.js`: about `739.55 kB`
  - `dist/assets/MarkdownMathContent-*.js`: about `592.40 kB`
  - `dist/assets/AlgorithmView-*.js`: about `551.88 kB`
- This warning predates the refactor implementation and should be treated as a baseline architecture signal, not a regression introduced by Curriculum V2 planning.

## Known Structural Concerns

- `src/data/moduleCatalog.ts` registers projects and advanced topics before several foundation model modules.
- `src/views/HomeView.vue` hand-writes a long beginner roadmap and imports Math Lab progress directly.
- `src/views/AlgorithmView.vue` uses slug-specific branches to select bespoke lesson components.
- Progress is split across:
  - `ml-atlas:algorithm-progress:v1`
  - `ml-atlas:math-lab-progress:v1`
  - `ml-atlas:data-lab-progress:v1`
- Top navigation exposes Math Lab, Data Lab, and ML modules as separate products instead of one curriculum model.

## Baseline Policy

- Do not treat the existing chunk-size warning as a phase failure unless a phase increases it or blocks lazy-loading goals.
- Do not delete legacy routes or storage keys during the Curriculum V2 milestone.
- Re-run this baseline command set before each phase PR.
