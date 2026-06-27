# Phase 9F: Support Lens Guidance Design

**Created:** 2026-06-27  
**Status:** Implemented after Phase 9E review.

**Scope:** Stage-specific support-lens copy for the Curriculum Spine V1 learner route.

## Context

Phase 9E made each `/spine` stage explain why it comes next. The remaining route-copy gap is smaller: stages with support lenses still used one generic note, so learners could see optional math/data/model modules without knowing why those lenses mattered at that exact point.

## Goal

Make support lenses just-in-time and stage-specific without turning them into hard blockers.

Each stage that has `supportModuleIds` may carry one concise bilingual note that explains what those support modules help the learner inspect or understand.

## Chosen Design

Add an optional localized field to `CurriculumSpineStage`:

```ts
supportNote?: LocalizedCopy
```

Rules:

- Stages with support modules should provide `supportNote`.
- Stages without support modules should not carry unused support copy.
- The page renders `stage.supportNote` in the existing support-lens section.
- The old generic support note remains a fallback, not the primary learner-facing path.

## Rejected Alternatives

- Per-module support explanations were rejected for Phase 9F because they would create a second relationship-copy layer.
- A new support-lens schema was rejected because the current stage object already owns this route narration.
- Turning support lenses into prerequisites was rejected because support modules are just-in-time lenses, not required blockers.

## Acceptance Criteria

- Every stage with support modules has bilingual `supportNote` copy.
- `/spine` renders the stage-specific support note inside the existing support-lens section.
- No new modules, routes, backend state, progress checks, or layout concepts are added.
- Existing required module order, project validation copy, and flat track route stay unchanged.
