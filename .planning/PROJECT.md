# ML Atlas Curriculum V3 Content Delivery

## What This Is

ML Atlas is a Vue 3, TypeScript, and Vite machine-learning teaching site for beginners and weak-foundation students. It uses bilingual explanations, visual labs, reproducible simulations, quizzes, and local static assets to connect math, data processing, model training behavior, and deep-learning intuition.

The Curriculum V2 adapter and navigation work remains the compatibility foundation. Current delivery follows the typed Curriculum V3 blueprint and incrementally rebuilds detailed teaching content without a big-bang rewrite of Math Lab, Data Lab, or Algorithm modules.

## Current Delivery Focus

- Curriculum V3.0 blueprint and content audit are complete.
- Python Data Tools Stages 1–4 and the detailed minimum-mathematics, linear-algebra, calculus, and probability routes are implemented.
- Numerical Methods Batch 1 (`least-squares-fitting`, `lu-decomposition`, `condition-numbers`) is complete.
- Numerical Methods Batch 2 (`sparse-matrices`, `pca`) is complete.
- Numerical Methods Batch 3 (`finite-difference-methods`, `nonlinear-equations`) is next for discussion and design; implementation has not started.
- Homepage Focus and Spine progressive-disclosure redesign remain paused while content depth is built.

## Core Value

Students should always know where they are in the learning path, why the current lesson matters, and what evidence shows they are ready for the next step.

## Requirements

### Validated

- ✓ The app runs as a static browser learning site with Vue, TypeScript, Vite, Vue Router, Pinia, D3, Three.js, KaTeX, markdown-it, and sanitize-html.
- ✓ Existing Algorithm, Math Lab, and Data Lab lessons expose typed content and bilingual copy.
- ✓ Current tests, production build, and GitHub Pages build pass on 2026-06-25.

### Active

- [ ] Introduce a unified curriculum read model through adapters.
- [ ] Preserve all legacy URLs until redirect tests prove compatibility.
- [ ] Preserve all v1 progress storage during the milestone.
- [ ] Derive navigation, homepage decisions, and continue-learning recommendations from curriculum/progress data.
- [ ] Prove the generic LessonPage and Lesson Block Renderer with AI Overview, Gradient Descent, and MLP only.
- [ ] Add validation tests before every shared curriculum, route, progress, or renderer behavior change.

### Out of Scope

- New course inventory during this milestone — coherence and migration safety come first.
- Backend accounts or cloud progress sync — current product is static and local.
- Full visual redesign — use existing style foundation and module CSS.
- Bulk rewrite of all Math Lab or Data Lab content — adapters come first.
- Deleting old localStorage keys — user progress retention is required.

## Context

- Current code has three parallel teaching systems: Algorithm modules in `src/data/`, Math Lab in `src/modules/math-lab/`, and Data Lab in `src/modules/data-lab/`.
- `docs/refactor.md` identifies contradictory learning paths, split progress, static workflow-tab interactions, and growing page conditionals.
- `docs/grill_gsd.md` recommends GSD mapping, Grill-style decision gates, a Curriculum V2 brief, and seven small phases.
- Baseline validation passed with a known Vite large-chunk warning.

## Constraints

- **Tech stack**: Stay on Vue 3, TypeScript, Vite, Vue Router, Pinia, D3, Three.js, KaTeX, markdown-it, and sanitize-html.
- **Compatibility**: Keep `/learn/*`, `/math-lab/*`, and `/data-lab/*` reachable until tests cover redirects and deep links.
- **Data safety**: Do not delete `ml-atlas:algorithm-progress:v1`, `ml-atlas:math-lab-progress:v1`, or `ml-atlas:data-lab-progress:v1` in this milestone.
- **Content safety**: Keep bilingual content and local public assets auditable.
- **Delivery**: One phase should remain independently reviewable and releasable.
- **Validation**: Each phase must pass `npm test`, `npm run build`, and `npm run build:pages`.

## Key Decisions

| Decision | Rationale | Outcome |
| --- | --- | --- |
| Use a catalog read model first | Avoids moving all course content before tests exist | — Pending |
| Preserve legacy URLs | Prevents broken saved links and route regressions | — Pending |
| Make Progress V2 idempotent | Protects local user progress and rollback | — Pending |
| Keep complex labs bespoke behind a registry | Avoids flattening rich labs into weak generic blocks | — Pending |
| Pilot AI Overview, Gradient Descent, and MLP | Covers orientation, optimization, and neural-network flagship lessons | — Pending |

---
*Last updated: 2026-07-20 for Curriculum V3 numerical-methods content delivery*
