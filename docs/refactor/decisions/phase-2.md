# Phase 2 Decision Record: Routing and Navigation Unification

**Date:** 2026-06-25
**Phase:** 2 - Routing and Navigation Unification
**Source Brief:** `docs/refactor/curriculum-v2-brief.md`
**Previous Phase:** `docs/refactor/summaries/phase-1.md`

## Scope Boundary

Phase 2 introduces canonical route aliases and catalog-derived navigation surfaces. It does not change progress storage, lesson body schemas, homepage layout, checkpoint behavior, or lab internals.

## Settled Decisions

| Topic | Decision | Risk Resolved |
| --- | --- | --- |
| Canonical learn route | `/learn/:moduleId` is the canonical module route shape. | Stops API/UI vocabulary from depending on old `slug` naming. |
| Canonical lesson route | `/learn/:moduleId/:lessonId` is supported for algorithm lessons. | Gives a stable future route for chapter-level deep links. |
| Legacy Math/Data routes | `/learn/:moduleId` redirects Math/Data modules to existing `/math-lab/modules/:id` or `/data-lab/modules/:id`. | Keeps Phase 2 from rewriting Math/Data pages. |
| Legacy algorithm chapter routes | Existing linear/logistic/CNN chapter routes remain declared before generic routes. | Preserves tested bespoke lesson URLs. |
| Navigation IA | AppShell switches to Learning Path, Topic Library, Projects, Progress. | Moves top navigation toward Curriculum V2 without changing homepage content. |
| Legacy nav exports | Old `mathLabNavigationGroups`, `dataLabNavigationGroups`, and `coreExperimentNavigationGroups` remain exported for compatibility tests and later migration. | Avoids breaking existing tests and downstream imports in the same phase. |
| Progress link | `/progress` is a placeholder route in Phase 2; Progress V2 data lands in Phase 3. | Lets navigation structure exist without touching v1 stores. |

## Rejected Options

- Redirect every old `/math-lab/*` and `/data-lab/*` URL immediately to `/learn/*`.
- Delete `coreExperimentNavigationGroups` during the navigation switch.
- Use Progress V2 data in the `/progress` route before migration tests exist.
- Make the homepage consume the new navigation model in Phase 2.

## Invariants

- `/math-lab`, `/math-lab/diagnostic`, `/math-lab/modules/:moduleId`, `/data-lab`, and `/data-lab/modules/:moduleId` stay reachable.
- `/learn/linear-regression/:chapterId`, `/learn/logistic-regression/:chapterId`, and `/learn/cnn-visualization/:chapterId` stay declared before generic learn routes.
- No v1 localStorage keys are read, modified, migrated, or deleted in this phase.
- `npm test`, `npm run build`, and `npm run build:pages` pass.

## Acceptance Criteria

- `src/curriculum/routes.ts` maps canonical `/learn/:moduleId` inputs to current runtime routes.
- `src/router/index.ts` supports `/learn/:moduleId`, `/learn/:moduleId/:lessonId`, `/tracks/:trackId`, `/library/:domain`, and `/progress`.
- `src/data/navigationMenus.ts` exports `curriculumNavigationMenus` generated from Curriculum V2 track/domain/project data.
- `src/components/AppShell.vue` renders `curriculumNavigationMenus` rather than the old three-product top-level menu.
- Tests prove legacy URLs remain present and the new IA is exposed.

## Rollback Behavior

Remove the Phase 2 route aliases, new curriculum hub pages, `src/curriculum/routes.ts`, and AppShell/navigation changes. Old Math/Data/Algorithm routes remain intact because they are not deleted in this phase.

## Remaining Risks

- Using curriculum data in AppShell may still keep navigation coupled to course metadata. Phase 2 should avoid adding new heavy page imports to the router and should measure build output.
- The Algorithm manifest remains a temporary bridge until algorithm module imports become Node-test-friendly.
