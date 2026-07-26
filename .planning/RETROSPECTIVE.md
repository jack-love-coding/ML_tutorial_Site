# ML Atlas Milestone Retrospective

## Milestone: v1.0 — Curriculum Foundation

**Shipped:** 2026-07-26  
**Recorded scope:** 31 roadmap phase entries  
**Canonical archive:** Phase 25, 13 plans, 22 tasks

### What Was Built

- A typed curriculum catalog and compatibility routing layer across Algorithm, Math Lab, and Data Lab content.
- Unified navigation, progress migration, LessonPage pilots, interaction contracts, and Curriculum Spine metadata.
- A typed Curriculum V3 blueprint and content audit covering the complete planned course inventory.
- Detailed Python Data Tools and mathematical-foundation content with local, reproducible teaching assets.
- Four numerical-methods batches culminating in the verified UCI Banknote optimization and diagnostics case.

### What Worked

- Progressive migration kept legacy URLs, existing lessons, and local progress stores available.
- Reusing one reproducible case across formulas, code, outputs, labs, illustrations, and videos produced strong numerical consistency.
- Separating core calculations from Vue components made deterministic tests and Notebook parity checks practical.
- Small content batches were easier to verify and release than a broad curriculum rewrite.

### What Was Inefficient

- Planning history for Phases 1–24A was recorded in roadmap/state prose without canonical phase directories, summaries, or requirement frontmatter.
- The original requirements file was never updated as work completed, so the final audit could not reconstruct clean three-source provenance.
- Several overlapping roadmap eras accumulated in one file, confusing automated milestone and phase detection.
- Completion terminology emphasized progress mechanics even after the project priority shifted toward teaching-content depth.

### Patterns Established

- Use typed bilingual lesson schemas and local public assets.
- Bind page examples and interactive calculations to executed Notebook anchors.
- Keep one independently reviewable phase per content slice.
- Preserve browser computation in deterministic TypeScript and use Python/Manim for reproducible source assets.
- Describe learner-facing results as “运行结果”“分析发现” or “需要注意”, not internal audit language.

### Key Lessons

- Create requirement IDs and phase verification mappings before implementation, then update them at each phase transition.
- A shared dataset should be chosen for teaching continuity only when it genuinely serves each model and diagnostic question.
- Archive every completed phase directory before switching milestones; do not depend on roadmap prose as the only execution record.
- Backend-dependent progress behavior should be scoped with identity, synchronization, and ownership rather than patched into static frontend state.

### Cost Observations

- The milestone spans multiple planning eras, so reliable model/session cost percentages are unavailable.
- Canonical Phase 25 work used 13 separately verified plans; this granularity improved rollback and release confidence.

## Cross-Milestone Trends

| Milestone | Content depth | Reproducibility | Planning provenance | Primary lesson |
| --- | --- | --- | --- | --- |
| v1.0 Curriculum Foundation | Strong and expanding | Strong in later content batches | Incomplete before Phase 25 | Keep content batches small and update canonical requirements continuously |
