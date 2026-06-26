# Curriculum V2 Milestone Audit

**Date:** 2026-06-25
**Branch:** `refactor/curriculum-v2`
**Scope:** Phases 1-7 of the Curriculum V2 refactor

## Result

The Curriculum V2 milestone is safe to review as a gradual refactor. It does not remove old content, old URLs, or old progress storage. It adds a unified curriculum read model, canonical route helpers, Progress V2 migration, homepage IA, LessonPage pilots, a teaching interaction protocol, and a final audit test.

## Audit Checks

| Area | Result | Evidence |
| --- | --- | --- |
| Current content reachability | Pass | `tests/curriculumMilestoneAudit.test.ts` verifies every catalog module has a route manifest entry and canonical resolver result. |
| Legacy URL compatibility | Pass | Audit test checks `/math-lab/modules/:moduleId`, `/data-lab/modules/:moduleId`, bespoke algorithm chapter routes, and canonical route entries remain wired. |
| Progress retention | Pass | Audit test verifies v1 algorithm, Math Lab, and Data Lab localStorage values remain unchanged after V2 migration. |
| Progress V2 write path | Pass | Audit test verifies V2 progress and migration marker keys are written. |
| Bilingual catalog completeness | Pass | Audit test runs `validateCurriculumLocalization(curriculumCatalog)`. |
| Pilot interaction protocol | Pass | Audit test verifies AI Overview, Gradient Descent, and MLP keep protocols aligned with the lab registry. |
| Phase documentation | Pass | Audit test verifies project state plus Phase 1-6 decision and summary documents exist. |
| Build and Pages build | Pass | Final verification runs `npm run build` and `npm run build:pages`. |
| Desktop/mobile pilot UI | Pass | Phase 6 Playwright checks verified protocol panels, lab presence, and no horizontal overflow at 1280px and 390px widths. |

## Verification Commands

- `npm test`
- `npm run build`
- `npm run build:pages`
- Playwright protocol checks for:
  - `/learn/ai-overview/what-is-ml`
  - `/learn/gradient-descent/learning-rate`
  - `/learn/mlp/linearLimits`

## Remaining Risks

- The new interaction protocol does not yet persist learner-written explanations or evidence.
- Only AI Overview, Gradient Descent, and MLP use the shared LessonPage/protocol path.
- Workflow-style modules that rely on `AppliedWorkflowLessonLab` still need deeper interaction redesign in a later milestone.
- Vite production builds still report existing large chunk warnings.
- Dev-mode browser checks still show existing Vite externalized module warnings for Node-oriented modules.
- Legacy route cleanup is intentionally deferred; this milestone preserves compatibility rather than removing old routes.

## Recommendation

Review this as one Curriculum V2 milestone branch, then split follow-up work by teaching surface:

1. Persist protocol evidence and connect it to checkpoints.
2. Upgrade selected workflow labs from static stage switching to challenge/evidence interactions.
3. Continue migrating algorithm lessons into `LessonPage` only when each module has a protocol and parity tests.
4. Address bundle chunking separately from curriculum behavior.
