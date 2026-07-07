# Phase 16 Summary: Curriculum Role Metadata and Legacy Order Cleanup

**Date:** 2026-07-07
**Status:** Completed.

## Delivered

- Added `src/curriculum/roles.ts` as a derived curriculum role layer over the existing catalog and spine.
- Classified every current catalog module into exactly one primary role:
  - `required-core`
  - `just-in-time-support`
  - `project-validation`
  - `advanced-extension`
  - `reference-library`
  - `duplicate-or-overlap`
- Rendered localized role badges on Topic Library module cards.
- Realigned legacy algorithm `moduleOrder` so projects and advanced modules no longer appear before their required foundations.
- Updated older module registration tests that still encoded the pre-spine migration order.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new inventory, bulk lesson migration, or legacy route removal.

## Result

The remaining route/source-of-truth conflict from Phase 15 is resolved at the current learner-facing catalog layer:

- `housing-price-project` now follows loss and linear-regression foundations.
- `classification-project` now follows classification foundations.
- `model-selection`, `tree-forest`, `mlp`, `optimizer-comparison`, CNN, sequence bridge, Attention, and RAG follow a spine-safe algorithm order.
- Topic Library browsing now tells learners whether a module is required, support, project validation, advanced, reference, or overlap.

## Recommended Next Phase

Phase 17 should address the neural-network learning mechanism ambiguity found in Phase 15:

- Decide whether `matrix-calculus-autodiff` should be promoted, bridged inside MLP, or remain support-only.
- Make the required route's backprop/autodiff depth explicit.
- Add a compact prediction/evidence task only if it clarifies how neural networks learn, not as another progress/checklist surface.

## Verification

- `node --test tests/curriculumRoles.test.ts tests/curriculumRoutingNavigation.test.ts tests/curriculumCatalog.test.ts tests/curriculumSpine.test.ts tests/curriculumMilestoneAudit.test.ts tests/linear-regression-layout.test.mjs tests/deep-learning-extension-modules.test.mjs tests/logistic-regression-cockpit.test.mjs`: pass, 44 tests.
- `node --test tests/classification-project-module.test.mjs tests/mlp-workbench.test.mjs tests/model-selection-module.test.mjs tests/python-and-housing-modules.test.mjs tests/tree-forest-module.test.mjs`: pass, 18 tests.
- `npm test`: pass, 270 tests.
- `npm run build`: pass with existing Vite large-chunk warning.
- `npm run build:pages`: pass with existing Vite large-chunk warning.
- Playwright browser check:
  - `/library/math` desktop: role badges render, no horizontal overflow, 0 console errors.
  - `/library/deep-learning` at 390px width: role badges render, no horizontal overflow, 0 console errors.
