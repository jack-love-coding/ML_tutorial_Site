# Phase 26 Deferred Items

## Pre-existing full-suite planning-state assertion

- **Discovered during:** Plan 26-01 and Plan 26-02 optional repository-wide `npm test`
- **Tests:** `tests/python-data-tools-contract.test.ts` and
  `tests/curriculumMilestoneAudit.test.ts`
- **Issue:** The historical Python Data Tools and milestone-audit assertions hardcode Phase 25 state
  (`Updated: 2026-07-23`, `current_phase: 25`, 13 completed plans, and the Phase 25
  focus). The repository was already on Phase 26 before Plan 26-01 began, and the
  execution orchestrator had already modified `.planning/STATE.md`.
- **Scope decision:** Deferred. Updating a historical Stage 4 test is unrelated to
  the Phase 26 dataset contract and would weaken the plan's bounded file scope.
- **Current evidence:** The Plan 26-01 focused suite passes 8/8, and the Plan
  26-02 loss-math suite passes 13/13 with the production build succeeding.

## GSD nested progress percentage

- **Discovered during:** Plan 26-01 state closeout
- **Issue:** The current `STATE.md` format has no body-level `Progress:` field.
  `state.update-progress` therefore cannot update the nested frontmatter
  `progress.percent`; the supported `state.patch` handler also rejects
  `progress.percent`.
- **Current state:** The supported handlers correctly record Phase 26, Plan 2 of
  7, `completed_plans: 1`, `current_plan: 26-02`, the metric/session, and the
  ROADMAP 1/7 status. Only the derived frontmatter percentage remains at 0.
- **Scope decision:** Deferred to the GSD state-schema/tooling owner rather than
  directly editing `STATE.md` outside its registered mutation handlers.
