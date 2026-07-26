# ML Atlas Curriculum V3 Content Delivery

## What This Is

ML Atlas is a Vue 3, TypeScript, and Vite machine-learning teaching site for beginners and weak-foundation students. It uses bilingual explanations, visual labs, reproducible simulations, quizzes, and local static assets to connect math, data processing, model training behavior, and deep-learning intuition.

The Curriculum V2 adapter and navigation work remains the compatibility foundation. Current delivery follows the typed Curriculum V3 blueprint and incrementally rebuilds detailed teaching content without a big-bang rewrite of Math Lab, Data Lab, or Algorithm modules.

## Current Delivery Focus

- Curriculum V3.0 blueprint and content audit are complete.
- Python Data Tools Stages 1–4 and the detailed minimum-mathematics, linear-algebra, calculus, and probability routes are implemented.
- Numerical Methods Batch 1 (`least-squares-fitting`, `lu-decomposition`, `condition-numbers`) is complete.
- Numerical Methods Batch 2 (`sparse-matrices`, `pca`) is complete.
- Numerical Methods Batch 3 (`finite-difference-methods`, `nonlinear-equations`) is complete, using one logit-bias calibration case to connect finite-difference checks with nonlinear root finding.
- Numerical Methods Batch 4 (`optimization`, `training-diagnostics`) is complete. Phase 25 connects one reproducible UCI Banknote case to stable BCE, feature scaling, fixed-step gradient descent, Armijo backtracking, stopping semantics, failure recovery, and training-curve diagnosis.
- Phase 25 passed 45/45 must-have verification, 755 repository tests, standard and GitHub Pages builds, Notebook/Manim integrity checks, security audit, and bilingual desktop/mobile browser acceptance.
- Homepage Focus and Spine progressive-disclosure redesign remain paused while content depth is built.
- v1.0 was archived on 2026-07-26 with explicitly accepted planning-provenance and deferred-progress gaps.
- The selected next milestone is v1.1 Classical Supervised Learning.

## Current State

**Shipped:** v1.0 Curriculum Foundation

The compatibility foundation, Curriculum V3 blueprint, Python Data Tools Stages 1–4, detailed foundation-mathematics route, Numerical Methods Batches 1–4, and Phase 25 reproducible optimization case are available. Historical Phases 1–24A remain documented but lack canonical three-source requirement provenance; Phase 25 is fully preserved in the v1.0 archive.

## Current Milestone: v1.1 Classical Supervised Learning

**Goal:** Build one coherent, reproducible teaching corridor from loss values through fitted regression baselines to explainable classification decisions.

**Target features:**

- Rebuild `loss-functions` and `linear-regression` around numerically consistent worked cases, code, diagnostics, and failure modes.
- Deliver a reproducible `project-tabular-regression` with a local dataset, executed Notebook, controlled baseline improvement, residual analysis, and limitations.
- Rebuild `logistic-regression` and `classification` around probability scores, calibration, thresholds, costs, subgroup errors, and honest decision boundaries.
- Publish detailed bilingual lessons, downloadable local assets, page-visible run outputs, and selective formative checks without expanding backend or progress scope.

## Next Milestone Goals

- Build one continuous teaching path from loss values to fitted regression baselines and explainable classification decisions.
- Rebuild `loss-functions`, `linear-regression`, `project-tabular-regression`, `logistic-regression`, and `classification` with detailed bilingual teaching content.
- Provide local downloadable datasets, clean-kernel Notebooks, locked outputs, and page-visible reference results.
- Keep exercises selective and formative; do not expand checkpoint persistence, backend, or homepage redesign scope.

## Core Value

Students should always know where they are in the learning path, why the current lesson matters, and what evidence shows they are ready for the next step.

## Requirements

### Validated

- ✓ The app runs as a static browser learning site with Vue, TypeScript, Vite, Vue Router, Pinia, D3, Three.js, KaTeX, markdown-it, and sanitize-html.
- ✓ Existing Algorithm, Math Lab, and Data Lab lessons expose typed content and bilingual copy.
- ✓ The unified curriculum read model is introduced through adapters.
- ✓ Legacy URLs remain reachable with compatibility and redirect coverage.
- ✓ Progress V2 migration preserves all three v1 progress stores.
- ✓ Navigation, homepage decisions, and continue-learning recommendations derive from curriculum and progress data.
- ✓ The generic LessonPage and Lesson Block Renderer are proven with AI Overview, Gradient Descent, and MLP.
- ✓ Shared curriculum, route, progress, renderer, and Phase 25 numerical behavior have regression coverage.
- ✓ Phase 25 validation passed on 2026-07-23: 755 tests, production build, GitHub Pages build, and security audit.

### Active

- [ ] Rebuild the classical supervised-learning route as a coherent loss → regression → classification teaching sequence.
- [ ] Keep formulas, variable names, code, Notebook outputs, and browser-side deterministic examples numerically consistent.
- [ ] Publish auditable local datasets, downloadable Notebooks, and bilingual page-visible run outputs for the new content.
- [ ] Preserve existing routes, checkpoints, Progress V1/V2 storage, and GitHub Pages compatibility.

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
| Use a catalog read model first | Avoids moving all course content before tests exist | ✓ Validated through the adapter-backed catalog |
| Preserve legacy URLs | Prevents broken saved links and route regressions | ✓ Validated by route and redirect coverage |
| Make Progress V2 idempotent | Protects local user progress and rollback | ✓ Validated while retaining all v1 stores |
| Keep complex labs bespoke behind a registry | Avoids flattening rich labs into weak generic blocks | ✓ Validated across LessonPage pilots and specialized labs |
| Pilot AI Overview, Gradient Descent, and MLP | Covers orientation, optimization, and neural-network flagship lessons | ✓ Completed without bulk lesson migration |
| Rebuild Batch 4 around one reproducible case | Keeps formulas, code, media, and diagnostics numerically consistent | ✓ Validated in Phase 25 with 45/45 must-haves |
| Archive v1.0 with accepted gaps | Content delivery is the current priority; checkpoint persistence belongs with backend identity and sync design | ✓ Accepted on 2026-07-26 with audit and provenance debt preserved |
| Make classical supervised learning the next milestone | It is the missing bridge from mathematical foundations and data tools into practical model training | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**

1. Move verified requirements to Validated.
2. Move invalidated or explicitly deferred requirements to Out of Scope with a reason.
3. Add newly discovered requirements and decisions without widening the active phase silently.
4. Recheck that the product description and content-first priority remain accurate.

**After each milestone:**

1. Review every section against shipped behavior.
2. Reconfirm the Core Value.
3. Audit Out of Scope and known technical debt.
4. Update the project context and next milestone goals.

---
*Last updated: 2026-07-26 at v1.1 milestone start*
