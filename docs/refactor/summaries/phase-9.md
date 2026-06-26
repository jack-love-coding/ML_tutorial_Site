# Phase 9 Summary: Curriculum Spine V1

**Status:** Phase 9A implemented and verified.

## Phase 9A - Spine Data Contract

Phase 9A turns the approved Curriculum Spine V1 design into a typed, testable contract without changing routes, progress storage, homepage UI, or lesson body content.

## Decisions Encoded

- The beginner-facing route is a mixed spiral route, not separate Math Lab, Data Lab, and Algorithm tracks.
- The route is data first: raw tables, numeric features, categorical features, and data quality come before formal linear algebra.
- `optimizer-comparison` is required before deeper neural architecture modules.
- `attention-transformer` is the Spine V1 endpoint.
- `llm-rag` remains an advanced application extension outside the required route.
- `housing-price-project` and `classification-project` are recommended validation capstones, not hard blockers.
- The missing sequence/embedding bridge is documented as a known gap instead of added as a fake module reference.

## Files

- `src/curriculum/types.ts`
- `src/curriculum/spine.ts`
- `tests/curriculumSpine.test.ts`
- `docs/refactor/designs/phase-9-curriculum-spine-v1.md`

## Verification

- `node --test tests/curriculumSpine.test.ts`: pass.
- `node --test tests/curriculumSpine.test.ts tests/curriculumMilestoneAudit.test.ts tests/curriculumPrerequisites.test.ts tests/curriculumCatalog.test.ts`: pass.
- `npm test`: pass, 244 tests.
- `npm run build`: pass with existing large-chunk warning.
- `npm run build:pages`: pass with existing large-chunk warning.

## Next Step

Phase 9B should make the homepage and navigation present the default spine as the primary learner path, while preserving legacy URLs and keeping Math Lab/Data Lab as support lenses.
