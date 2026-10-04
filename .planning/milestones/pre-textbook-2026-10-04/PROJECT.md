# ML Atlas Curriculum V3 Content Delivery

## What This Is

ML Atlas is a Vue 3, TypeScript, and Vite machine-learning teaching site for
beginners and weak-foundation students. It combines bilingual explanations,
visual labs, reproducible simulations, checkpoints, and local static assets so
learners can connect formulas, data preparation, code, model behavior, and
evaluation evidence.

The compatibility-first Curriculum V2 adapters remain the runtime foundation.
Delivery follows the typed Curriculum V3 blueprint and improves one coherent
teaching corridor at a time without rewriting Math Lab, Data Lab, or Algorithm
content wholesale.

## Current State

**Shipped:** v1.1 Classical Supervised Learning on 2026-08-30

The site now provides a verified bilingual corridor from loss functions through
linear regression, a tabular regression project, gradient descent and optimizer
behavior, logistic regression, and cost-aware classification decisions. The
corridor uses auditable local datasets, executed Notebooks, deterministic
TypeScript engines, locked outputs, responsive labs, and base-safe media while
preserving every existing route and progress store.

The v1.1 closeout passed 43/43 requirements, 9/9 phase verifications, 5/5
integration checks, and 4/4 end-to-end flows. The final repository baseline is
1,120 passing tests with 28 intentional skips, both production builds passing,
zero moderate-or-higher dependency vulnerabilities, and bilingual real-browser
coverage across desktop and mobile.

Historical planning is available in `.planning/milestones/`; the live planning
files are intentionally compact until the next milestone is defined.

## Next Milestone Goals

The approved direction is AI Foundations Part C, covering units 15–21:

- MLP forward propagation, backpropagation, and numerical gradient intuition.
- A complete PyTorch training engineering loop with deterministic evaluation and
  failure diagnosis.
- CNN image classification, transfer learning, and a practical ViT bridge.
- Object detection and semantic segmentation foundations.
- TF-IDF text baselines followed by RNN/LSTM and an Attention bridge.
- One stage-level bilingual teaching loop that is published only when all seven
  units meet their content, asset, accessibility, and release gates.

Detailed requirements and phase boundaries will be created by the next
`$gsd-new-milestone` workflow rather than being carried forward from v1.1.

## Core Value

Students should always know where they are in the learning path, why the current
lesson matters, and what evidence shows they are ready for the next step.

## Requirements

### Validated

- ✓ Static Vue/TypeScript delivery, typed bilingual content, safe rendering, and
  local public assets remain the product foundation — v1.0/v1.1.
- ✓ Algorithm, Math Lab, and Data Lab content share catalog, route, navigation,
  and progress adapters while retaining their specialized labs — v1.0.
- ✓ Legacy URLs and the Algorithm, Math Lab, Data Lab, Learning Progress V2, and
  course-progress stores remain compatible and byte-preserving — v1.0/v1.1.
- ✓ AI Foundations Parts A and B provide a curriculum-backed course path without
  exposing incomplete later-stage unit links — v1.1.
- ✓ The classical supervised-learning route forms one coherent loss → regression
  → probability → threshold → decision corridor — v1.1.
- ✓ Formulas, variable names, code, executed Notebook outputs, and browser-side
  deterministic examples agree under audited numerical contracts — v1.1.
- ✓ Learner datasets, Notebooks, figures, animations, manifests, and locked run
  outputs are local, hash-bound, downloadable, and GitHub Pages-safe — v1.1.
- ✓ Bilingual desktop/mobile learning, keyboard use, reduced motion, failure
  fallbacks, checkpoints, and non-blocking practice survive the rebuild — v1.1.

### Active

- [ ] Define the next milestone requirements for AI Foundations Part C units
  15–21 before implementation begins.
- [ ] Reuse canonical course resources and existing numerical engines instead of
  duplicating lesson bodies or progress schemas.
- [ ] Keep Part D planned and unlinked until Part C reaches its whole-stage
  publication gate.

### Out of Scope

- Backend accounts, cloud synchronization, or teacher assessment — the product
  remains static and local until identity and ownership are designed together.
- Deleting or rewriting legacy localStorage keys — learner progress retention is
  mandatory.
- A big-bang rewrite of Math Lab, Data Lab, Algorithm modules, or the visual
  system — migration remains adapter-first and incremental.
- Publishing unfinished AI Foundations stages or empty Kaggle course cards —
  stage-level teaching closure remains the release gate.

## Context

- Primary runtime systems remain Algorithm modules in `src/data/`, Math Lab in
  `src/modules/math-lab/`, Data Lab in `src/modules/data-lab/`, and the generic
  course layer in `src/curriculum/` and `src/modules/course/`.
- The current source, test, and authoring-script footprint is approximately
  210,673 lines across TypeScript, Vue, JavaScript, and Python.
- The known Vite large-chunk advisory remains non-blocking; current route-level
  lazy loading and failure fallbacks continue to pass release tests.
- v1.0 historical provenance gaps remain accepted technical debt and are
  explicitly preserved in the v1.0 archive rather than retroactively fabricated.

## Constraints

- **Tech stack:** Stay on Vue 3, TypeScript, Vite, Vue Router, Pinia, D3,
  Three.js, KaTeX, markdown-it, and sanitize-html.
- **Compatibility:** Preserve `/spine`, `/learn/*`, `/math-lab/*`,
  `/data-lab/*`, course deep links, and existing progress identities.
- **Content safety:** Keep bilingual content, formulas, local assets, sources,
  hashes, and fallback transcripts auditable.
- **Delivery:** One phase and one teaching stage must remain independently
  reviewable, verifiable, and releasable.
- **Validation:** Runtime phases require tests, both production builds, security
  audit, and relevant bilingual browser matrices.

## Key Decisions

| Decision | Rationale | Outcome |
| --- | --- | --- |
| Use a catalog read model and adapters first | Avoids moving all content before compatibility tests exist | ✓ Validated across v1.0 and v1.1 |
| Preserve legacy URLs and progress bytes | Protects saved links, local evidence, and rollback | ✓ Verified through the five-module corridor |
| Keep complex labs bespoke behind typed registries | Rich teaching interactions should not be flattened into weak generic blocks | ✓ Validated across Algorithm, Math Lab, and Data Lab |
| Use frozen local datasets and executed Notebook authorities | Keeps formulas, code, outputs, and browser evidence reproducible | ✓ Validated for LaDe, SECOM, Bike, Housing, and Banknote cases |
| Select thresholds on validation and reveal locked test evidence once | Prevents evaluation leakage and misleading model selection | ✓ Validated in classification decisions |
| Publish AI Foundations by complete stage | Learners should never encounter clickable empty units | ✓ Parts A and B published; Parts C and D remain gated |
| Archive v1.1 only after canonical freshness checks | Planning-only changes must not silently invalidate release evidence | ✓ Phase 30/31 evidence refreshed before closeout |
| Make AI Foundations Part C the next direction | It is the next curriculum bridge from classical ML into deep learning, CV, and NLP | — Pending next-milestone definition |

## Evolution

At each phase transition, move verified requirements to Validated, preserve
explicit deferrals, and update decisions with evidence. At each milestone,
archive full requirements and phase history, reconfirm the Core Value, and start
the next requirements file fresh.

---
*Last updated: 2026-08-30 after v1.1 milestone completion*
