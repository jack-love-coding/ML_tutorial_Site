---
phase: 31-corridor-integration-and-release
plan: "01"
type: execute
wave: 1
depends_on: [26-loss-functions-rebuild, 27-linear-regression-rebuild, 28-tabular-regression-project, 29-logistic-regression-rebuild, 30-classification-decisions-rebuild]
requirements: [QLTY-01, QLTY-02, QLTY-03, QLTY-04, QLTY-05]
status: complete
completed: 2026-08-29
---

# Phase 31: Corridor Integration and Release Plan

## Objective

Turn the five independently rebuilt modules into one explicit bilingual route: `loss-functions → linear-regression → project-tabular-regression/housing-price-project → logistic-regression → classification`. Learners must be able to move between modules without losing the content-first lesson body, reach the matching AI Foundations unit for artifact self-checks, and retain every legacy route and progress store.

## Scope and boundaries

- Add one typed corridor contract; do not create a second curriculum catalog or route tree.
- Keep the runtime project ID `housing-price-project` and record `project-tabular-regression` only as its V3 blueprint identity.
- Make Housing depend on Linear Regression and Logistic Regression depend on the completed regression corridor; preserve every existing module ID and URL.
- Add one lightweight, accessible navigator to the five existing pages. It shows sequence and current position but never infers completion or locks content.
- Reuse AI Foundations units 08, 09, and 14 through canonical course routes; do not copy lesson bodies, experiment outputs, or progress data.
- Preserve Algorithm, Math Lab, Data Lab, Learning Progress V2, and course-progress storage behavior.

## Tasks

1. Define the exact five-step typed corridor with bilingual roles, canonical routes, explicit previous/next handoffs, and AI Foundations unit mappings.
2. Align Curriculum Catalog prerequisites and regenerate lightweight metadata without changing identities or legacy routes.
3. Mount one shared responsive navigator on all five modules and add explicit Housing → Logistic, Logistic → Classification, and Classification → self-check copy.
4. Add integration tests for order, DAG safety, routes, bilingual content, checkpoints, course mappings, and the no-new-progress-side-effects boundary.
5. Add a GitHub Pages browser matrix covering five modules, two locales, desktop and 390px, keyboard traversal, formulas, assets, reduced motion, overflow, and preservation of three legacy progress stores.
6. Run the full test, standard build, Pages build, browser, and security gates; update roadmap, requirements, state, and verification evidence.

## Acceptance contract

- The exact sequence and previous/next links are identical in the typed contract, Curriculum Catalog, visible navigator, and browser output.
- Every page exposes five route links, exactly one `aria-current="step"`, and a canonical AI Foundations unit link.
- The navigator does not write storage, gate content, or present earlier steps as completed.
- Both languages work at 1440px and 390px without horizontal overflow or KaTeX errors.
- Keyboard activation reaches the next module while preserving existing chapter canonicalization.
- Math Lab V1, Data Lab V1, and Learning Progress V2 sentinel bytes remain unchanged across the browser traversal.
- `npm test`, `npm run build`, `npm run build:pages`, `npm run test:phase31:browser`, and `npm run security:audit` pass.
