# Phase 6 Summary: Teaching Interaction Protocol

**Date:** 2026-06-25
**Branch:** `refactor/curriculum-v2`
**Status:** Implemented and verified

## Goal

Standardize what counts as an effective core-course interaction for the LessonPage pilots: learners should predict first, change meaningful variables, observe specific metrics, record evidence, and explain the result.

## Delivered

- Added `src/lessons/interactionProtocol.ts` with typed protocol fields:
  - `learningGoal`
  - `predictionPrompt`
  - `manipulableVariables`
  - `observableMetrics`
  - `successCriteria`
  - `reflectionPrompt`
  - `evidence`
- Added pilot protocols for:
  - AI Overview task decomposition.
  - Gradient Descent safe learning-rate search.
  - MLP XOR capacity and generalization reading.
- Added `src/lessons/LessonInteractionProtocolPanel.vue` to render protocol guidance before pilot labs.
- Updated `src/lessons/LessonPage.vue` and `src/lessons/LessonBlockRenderer.vue` to resolve and render the current section's protocol.
- Added responsive protocol styles in `src/styles/views/algorithm-shell.css`.
- Added `tests/teachingInteractionProtocol.test.ts`.
- Added the decision record `docs/refactor/decisions/phase-6.md`.

## Verification

| Command / Check | Result | Notes |
| --- | --- | --- |
| `npm test` | Pass | 232 tests passed. |
| `npm run build` | Pass | Existing large-chunk warning remains. |
| `npm run build:pages` | Pass | Existing large-chunk warning remains. |
| Playwright desktop pilot checks | Pass | One protocol panel and expected lab present on AI Overview, Gradient Descent, and MLP pilot URLs. |
| Playwright mobile pilot checks | Pass | No horizontal overflow at 390px viewport. |
| Playwright console check | Pass with known warnings | 0 errors; existing Vite dev-mode externalized module warnings remain. |

## Important Implementation Notes

- The protocol layer does not yet save learner-entered evidence.
- Each pilot currently has one protocol anchor to keep the story scroller from repeating identical task panels.
- Existing specialized labs remain unchanged except for being preceded by clearer task guidance.

## Deferred to Phase 7

- Milestone reachability and legacy URL audit.
- Progress retention audit.
- Bilingual completeness audit.
- Final build and UI regression review.
- Documented remaining risks for the next milestone.
