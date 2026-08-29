# ML Atlas Milestone Retrospective

## Milestone: v1.0 — Curriculum Foundation

**Shipped:** 2026-07-26  
**Recorded scope:** 31 roadmap phase entries  
**Canonical archive:** Phase 25, 13 plans, 22 tasks

### What Was Built

- A typed curriculum catalog and compatibility routing layer across Algorithm,
  Math Lab, and Data Lab content.
- Unified navigation, progress migration, LessonPage pilots, interaction
  contracts, and Curriculum Spine metadata.
- A typed Curriculum V3 blueprint and content audit covering the complete planned
  course inventory.
- Detailed Python Data Tools and mathematical-foundation content with local,
  reproducible teaching assets.
- Four numerical-methods batches culminating in the verified UCI Banknote
  optimization and diagnostics case.

### What Worked

- Progressive migration kept legacy URLs, existing lessons, and local progress
  stores available.
- Reusing one reproducible case across formulas, code, outputs, labs,
  illustrations, and videos produced strong numerical consistency.
- Separating core calculations from Vue components made deterministic tests and
  Notebook parity checks practical.
- Small content batches were easier to verify and release than a broad curriculum
  rewrite.

### What Was Inefficient

- Planning history for Phases 1–24A lacked canonical phase directories,
  summaries, and requirement frontmatter.
- The original requirements file was not updated continuously, so the final audit
  could not reconstruct clean three-source provenance.
- Several roadmap eras accumulated in one file and confused automated milestone
  detection.

### Patterns Established

- Use typed bilingual lesson schemas and local public assets.
- Bind page examples and interactive calculations to executed Notebook anchors.
- Keep one independently reviewable phase per content slice.
- Preserve browser computation in deterministic TypeScript and use Python/Manim
  for reproducible source assets.

### Key Lessons

- Define requirement IDs and verification mappings before implementation.
- Archive every canonical phase directory before switching milestones.
- Scope backend-dependent progress with identity, synchronization, and ownership
  instead of patching it into static frontend state.

### Cost Observations

- Reliable model/session percentages are unavailable across the early planning
  eras.
- Canonical Phase 25 used 13 separately verified plans; the granularity improved
  rollback and release confidence.

## Milestone: v1.1 — Classical Supervised Learning

**Shipped:** 2026-08-30
**Phases:** 9 | **Plans:** 37 | **Summary-recorded tasks:** 59

### What Was Built

- A bilingual, reproducible corridor from stable losses through fitted regression
  baselines to probability calibration and cost-aware class decisions.
- Local LaDe, SECOM, Bike, Housing, and Banknote packages with executed
  Notebooks, locked outputs, strict manifests, and rollback-safe publication.
- Six focused gradient-descent lessons, deterministic optimizer state machines,
  an MLP comparison, and a leakage-safe Banknote transfer.
- AI Foundations Part B plus a shared five-step navigator connecting canonical
  course units to existing learning resources.

### What Worked

- One numerical authority per teaching case prevented prose, formulas, Python,
  TypeScript, media, and lab outputs from drifting.
- Wave-based asset transactions separated source authorization, generation,
  publication, content integration, and release verification.
- Whole-stage publication kept incomplete AI Foundations units visible only as
  goals and status, never as empty links.
- Compatibility tests treated routes and localStorage bytes as first-class
  release contracts rather than cleanup work.

### What Was Inefficient

- Phase 26 and 27 were split into many highly defensive plans; the safety was
  useful, but several publication-boundary plans repeated similar checks.
- Automated milestone accomplishments extracted noisy bug-fix one-liners and
  required human consolidation before becoming a useful release summary.
- Adding missing summary/validation provenance after verification made Phase 30
  and 31 formally stale, requiring a second browser verification pass.
- The Vite large-chunk advisory remained throughout the milestone and obscured
  otherwise clean build output.

### Patterns Established

- Freeze split, preprocessing, selection policy, and test disclosure rules before
  generating learner assets.
- Publish assets as complete hash-bound packages and validate them again through
  the GitHub Pages base path.
- Keep learner exercises selective and non-blocking while preserving one explicit
  misconception and self-check loop per unit.
- Run canonical readiness after all planning-only closeout edits, not only before
  writing audit documents.

### Key Lessons

- A verification report must be the newest phase evidence at closeout; otherwise
  correct implementation can still fail the freshness gate.
- Stage publication is the right unit for learner-facing completeness, while
  phases remain the right unit for engineering review and rollback.
- Validation/test separation and one-time locked-test disclosure should be taught
  as product behavior, not buried in methodology notes.
- Release summaries should report both tool-derived task counts and plan-level
  task counts when the source schemas differ.

### Cost Observations

- Model/session percentages are unavailable, but 37 atomic plans and two focused
  closeout PRs kept provenance reviewable.
- The final browser reruns were deliberate verification work, not implementation
  rework; they exposed and closed a lifecycle-tool freshness edge case.

## Cross-Milestone Trends

| Milestone | Content depth | Reproducibility | Planning provenance | Primary lesson |
| --- | --- | --- | --- | --- |
| v1.0 Curriculum Foundation | Strong and expanding | Strong in later batches | Incomplete before Phase 25 | Keep content batches small and update canonical requirements continuously |
| v1.1 Classical Supervised Learning | Complete classical corridor | Strong across data, code, media, and browser evidence | Complete for all nine phases | Recheck verification freshness after every closeout-only document change |
