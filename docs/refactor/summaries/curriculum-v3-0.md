# Curriculum V3.0 Blueprint Completion

**Completed:** 2026-07-11
**Decision boundary:** V3.1 Minimum Mathematical Foundation is next and has not started.

## Completed scope

- Defined a typed Curriculum V3.0 blueprint containing exactly 56 instructional modules and 6 projects.
- Classified all 53 audited current modules against the V3 target inventory.
- Organized the curriculum into exactly 10 learning arcs and 7 exit capabilities.
- Recorded learner entry assumptions, prerequisites, bilingual authoring gates, project evidence, implementation waves, and deterministic validators.

## Generated artifacts

- `docs/curriculum-v3/README.md`
- `docs/curriculum-v3/module-inventory.md`
- `docs/curriculum-v3/content-audit.md`
- `docs/curriculum-v3/project-map.md`
- `docs/curriculum-v3/coverage.md`
- `docs/curriculum-v3/implementation-backlog.md`

These files are deterministic projections generated from `src/curriculum/v3/` by `scripts/generateCurriculumV3Docs.ts`; they are not a second hand-maintained source of truth.

## Validation record

- `node --test tests/curriculumMilestoneAudit.test.ts`
- `npm test`
- `npm run build`
- `npm run build:pages`
- `node scripts/generateCurriculumV3Docs.ts`
- `git diff --exit-code -- docs/curriculum-v3`
- `git diff --check`
- `rg -n "curriculum/v3" src/router src/views src/components src/main.ts`

## Runtime non-goals and next boundary

- No runtime lesson changed.
- No runtime route changed.
- No Progress V1 or Progress V2 data or storage behavior changed.
- Phase 24B Homepage Focus and Phase 24C Spine progressive disclosure remain paused.
- V3.1 Minimum Mathematical Foundation is next, not started; its implementation requires a separately reviewed phase with explicit acceptance criteria.

## Remaining content risks

- The 53-module audit records migration decisions and contract gaps, but does not resolve those gaps or migrate course bodies.
- Modules marked `rebuild`, `merge`, or `demote-to-depth` still require wave-by-wave content work, formula/code/behavior checks, and focused assessment evidence.
- Chinese-first authoring review, English parity, runtime evidence verification, accessibility, mobile fallback, and promotion gates remain incomplete until each future module is implemented and validated.
- Project prerequisites and exit-capability evidence are blueprint contracts; executable project artifacts and locked evaluation evidence remain future work.
