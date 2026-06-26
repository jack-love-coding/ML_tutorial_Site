# Curriculum V2 Refactor Brief

**Date:** 2026-06-25
**Inputs:** `docs/refactor.md`, `docs/grill_gsd.md`, `AGENTS.md`, `.planning/codebase/*`
**Status:** Project-level decision brief for GSD planning. Defaults follow `docs/grill_gsd.md` unless the user explicitly rejects them.

## Problem Statement

ML Atlas has grown into three strong but separate teaching products: Math Lab, Data Lab, and `/learn/*` algorithm modules. Each has its own schema, route model, navigation, page templates, and progress storage. The result is a confusing learning route: the README and homepage describe a math-to-data-to-model-to-deep-learning path, while module registration and navigation can surface projects and advanced topics before foundational loss, optimization, regression, classification, and MLP lessons.

The project does not need more courses first. It needs one curriculum contract that preserves existing content while making the student path, progress, and teaching interaction model coherent.

## Target Users

- Primary learner: beginners or weak-foundation students learning ML/AI through visual intuition, reproducible experiments, and bilingual explanations.
- Secondary learner: students who already know some coding/math but need a coherent bridge from formulas and data processing to model behavior.
- Maintainer: the developer adding courses, labs, assets, tests, and source notes without breaking old routes or progress.

## Desired Information Architecture

```text
Home
├─ Core Learning Path
│  ├─ Orientation and shared language
│  ├─ How models learn
│  ├─ Neural network core
│  └─ Deep learning specials
├─ Topic Library
│  ├─ Math
│  ├─ Data
│  └─ Models and training
├─ Projects
└─ Progress
```

Top navigation should converge toward:

1. Learning Path
2. Topic Library
3. Projects
4. Progress

Math Lab and Data Lab remain valuable domains, but they should become topic-library domains under the unified curriculum rather than isolated products.

## Core Learning Track

1. AI Overview
2. Data, vectors, tensors, sample/feature/batch/shape
3. First small learning loop
4. Loss functions, residuals, and linear regression
5. Gradient and gradient descent
6. Logistic regression, probability, and classification thresholds
7. Generalization, regularization, and model selection
8. MLP forward pass and activations
9. Chain rule, backpropagation, and autodiff
10. Training diagnostics, optimizers, and regularization

Projects should summarize stages after the required concepts are available:

- Housing project after data handling, linear regression, loss, and evaluation basics.
- Classification project after logistic regression, thresholds, and metrics.

## Topic-Library Structure

**Math:**
- Vectors, matrices, norms, dot products, similarity, tensor shape.
- Calculus, gradients, Taylor intuition, finite differences, optimization.
- Probability, likelihood, entropy, distributions, Bayes.
- SVD, PCA, condition numbers, numerical stability.
- Deep architecture math for attention, convolution, and backprop.

**Data:**
- Numerical and categorical features.
- Cleaning, missingness, EDA, leakage-safe split/fit/transform order.
- Complexity, regularization, and evaluation.

**Models and Training:**
- Loss, optimization, linear/logistic regression, classification metrics.
- MLP, CNN, attention/transformer, optimizers, LLM/RAG.

## Decisions

| Decision | Default | Rationale |
| --- | --- | --- |
| Migration style | Gradual, no big-bang rewrite | Reduces risk across content, routes, progress, and assets. |
| Source of truth during milestone | Existing module files remain source; catalog is read model | Avoids moving all content before validation exists. |
| Legacy routes | Preserve through redirects or direct support | Avoids breaking saved links and tests. |
| Progress migration | Read v1, normalize, merge, write v2, set marker | Makes migration idempotent and reversible. |
| v1 storage retention | Do not delete v1 stores in this milestone | Protects user progress and rollback. |
| First renderer pilots | AI Overview, Gradient Descent, MLP | Covers overview, optimization lab, and deep-learning flagship. |
| Lesson page approach | Generic skeleton plus bespoke lab registry | Keeps complex labs intact while normalizing learning flow. |
| Interaction protocol | prediction, manipulation, evidence, reflection, success criteria | Turns static tabs into measurable learning activities. |
| Phase policy | One phase, one validation loop, one PR | Keeps reviews small and rollback possible. |

## Rejected Alternatives

- Rewriting all Math Lab, Data Lab, and Algorithm content into one new schema in a single phase.
- Deleting legacy URLs after canonical routes land.
- Deleting v1 localStorage during Progress V2 migration.
- Building a generic renderer before a stable catalog and route contract exist.
- Making all labs conform to the renderer by rewriting complex interactive components.
- Expanding course inventory before the curriculum path and progress model are coherent.

## Invariants

- Existing lessons remain reachable throughout the milestone.
- Both `'zh-CN'` and `en` copy are required for new curriculum-facing records.
- Public assets use runtime-safe public paths and remain local.
- Tests must cover route, catalog, localization, prerequisite, and migration behavior before deletion or replacement.
- Math/data/model variable names must stay consistent across formula, code, lab, checkpoint, and feedback.
- Reduced-motion and mobile fallback requirements still apply to visual labs.

## Non-Goals

- No new course inventory during the Curriculum V2 milestone.
- No complete redesign of visual style or UI framework adoption.
- No backend, auth, cloud sync, or account system.
- No full content rewrite for all Math Lab or Data Lab modules.
- No removal of existing generated images, Manim assets, or CNN model assets.

## Compatibility Policy

- Canonical future routes should be `/learn/:moduleId`, `/learn/:moduleId/:lessonId`, `/tracks/:trackId`, `/library/:domain`, and `/progress`.
- Existing `/math-lab/*`, `/data-lab/*`, and bespoke algorithm chapter URLs remain supported until tests prove redirects and deep-link behavior.
- Route changes must keep lazy imports for large pages and labs.
- GitHub Pages base path behavior must be verified with `npm run build:pages`.

## Data-Migration Policy

- Add `LearningProgressV2` only after canonical module and lesson IDs exist.
- Migration reads:
  - `ml-atlas:algorithm-progress:v1`
  - `ml-atlas:math-lab-progress:v1`
  - `ml-atlas:data-lab-progress:v1`
- Migration is idempotent and stores a schema-versioned marker.
- Corrupted JSON and missing stores fall back safely.
- Conflicts use conservative completion status and preserve quiz attempt source namespace.
- v1 data remains untouched in this milestone.

## Acceptance Criteria

- A unified catalog can list every current module with canonical ID, legacy source, domain, level, route, localized title/summary, estimated minutes, prerequisites, outcomes, and lesson references.
- The core track is generated from curriculum data and respects prerequisites.
- Navigation and homepage can consume curriculum/progress data instead of hand-authored divergent order.
- Progress V2 can recommend a next lesson across Algorithm, Math Lab, and Data Lab.
- AI Overview, Gradient Descent, and MLP prove the Lesson Block Renderer and lab registry approach.
- Every phase passes `npm test`, `npm run build`, and `npm run build:pages`.
- Each phase leaves old routes, old progress, bilingual copy, and checkpoints usable.

## Proposed Milestone and Phase Boundaries

| Phase | Goal | Main Deliverables | Explicitly Not Doing |
| --- | --- | --- | --- |
| 1 | Unified Curriculum Contract | `src/curriculum/` types, catalog, tracks, prerequisites, validation tests, adapters | Do not change homepage or move all content. |
| 2 | Unified Routing and Navigation | canonical routes, legacy redirects, catalog-derived navigation, route tests | Do not change progress. |
| 3 | Progress V2 | merged model, v1-to-v2 migration, continue-learning recommendation, migration tests | Do not delete v1 storage. |
| 4 | Homepage and IA | start/continue/route/library/progress surfaces, mobile and bilingual checks | Do not rewrite lesson body content. |
| 5 | LessonPage and Renderer | block renderer, lab registry, pilots for AI Overview, Gradient Descent, MLP | Do not migrate every course. |
| 6 | Teaching Interaction Protocol | prediction/manipulation/evidence/reflection/success criteria model and pilot upgrades | Do not bulk-redesign all labs. |
| 7 | Milestone Audit | content reachability, URL compatibility, progress retention, bilingual, build, and UI audit | Do not add new courses. |

## Next Action

Stress-test Phase 1 with `docs/refactor/decisions/phase-1.md`, then create a fine-grained implementation plan for Curriculum Catalog adapters and validation tests.
