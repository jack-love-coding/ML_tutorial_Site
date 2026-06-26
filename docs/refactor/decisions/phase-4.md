# Phase 4 Decision: Homepage as Curriculum Decision Surface

Date: 2026-06-25

## Context

`HomeView.vue` had grown into a mixed surface: hero, full algorithm module gallery, Math Lab-only route summaries, a long cross-domain path list, and the beginner roadmap. This made the first screen harder to use and kept old product silos visible after Curriculum V2 introduced unified routes, navigation, and Progress V2.

## Decision

The homepage should stop acting as the complete curriculum catalog. Its first screen now has three jobs:

1. Send returning learners to the Progress V2 continue-learning target.
2. Help new learners choose one of the unified curriculum entry points.
3. Keep the detailed beginner roadmap as the lower-page explanation for zero-foundation learners.

The full module listing belongs in `/library/:domain`, track pages, and module-specific navigation. The homepage may link to those surfaces, but it should not import `moduleOrder`, Math Lab-only learning route data, or one-off module catalog objects.

## Implementation Rules

- Use `migrateLearningProgressV2()` and `selectContinueLearning()` for homepage continue-learning state.
- Use lightweight Curriculum V2 route/navigation manifests for homepage entry cards.
- Preserve the beginner roadmap and readiness checks because they explain the zero-foundation route in user-facing language.
- Remove the full `moduleOrder` gallery and the duplicate long `learningPath` list.
- Keep legacy Math Lab route dashboard components on Math Lab pages; the global homepage should not render `LearningRouteSummary`.

## Verification

Phase 4 adds `tests/homeCurriculumIA.test.ts` to protect the homepage responsibility split and updates stale module tests so module registration is verified through catalogs/manifests rather than homepage source strings.
