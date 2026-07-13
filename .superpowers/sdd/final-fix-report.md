# Curriculum V3 Final Fix Report

**Date:** 2026-07-11
**Result:** DONE
**Scope:** Curriculum V3 blueprint, deterministic documentation, review tests, and pilot design approval only. No runtime course, route, progress, or UI files changed.

## Finding-to-fix map

1. **Fourteen dangling `project-tabular-baseline` references**
   - Replaced the unknown placeholder with formal `project-tabular-regression` and/or `project-classification-evaluation` links according to each module's data, regression, classification, or evaluation responsibility.
   - Added exact mapping coverage for all 14 machine-learning modules.
   - Added pure validation regression prefix `unknown-project-reference:<module>:<project>`.

2. **Broken introduced/revisited concept chain**
   - Added explicit entry concepts and pure chronological revisit validation.
   - Added stable prefixes `concept-revisit-before-introduction:<module>:<concept>` and `project-revisit-module-id:<project>:<module>`.
   - Replaced project prerequisite IDs in `revisits` with the actual concepts each project integrates.
   - Preserved semantic revisits by introducing `generalization-gap`, `linear-prediction`, `vector-similarity`, and `optimizer` at their owning lessons; made `weight-sharing` a CNN introduction; replaced module-name revisits with concepts such as `decision-boundary`, `gradient`, `learning-rate`, and `optimization-trajectory`.

3. **Incorrect source and migration classifications**
   - `sequence-models-rnn`: `sourceModuleIds: []`, `migrationAction: add` because Catalog has no source module.
   - `complexity-regularization`: audit action changed from `keep` to `rebuild`, matching its blueprint action and approved evidence-gap rule.
   - Added exact source/action assertions and regenerated audit/inventory docs.

4. **Implementation waves violated approved stage ownership**
   - Rebuilt 12 waves spanning V3.1–V3.7, each containing 4–6 modules and preserving prerequisite order.
   - V3.2 now owns deeper mathematics plus the complete data-to-feature pipeline; V3.3 classical ML; V3.4 neural foundations; V3.5 deep-learning structures.
   - Added `wave-stage-responsibility:<wave>:<module>` validation and a mutation-based regression test.

5. **Pilot design review state and whitespace**
   - Removed trailing spaces on lines 3–4 and changed status to `Approved`.
   - Added a whitespace/status regression test.

6. **Generated and planning artifacts**
   - Regenerated `docs/curriculum-v3` from the typed source.
   - Synchronized the V3 implementation plan and completion summary with the source/action, concept-validation, and stage-responsibility facts.

## Red/green evidence

- Initial focused run: `node --test tests/curriculumV3Audit.test.ts tests/curriculumV3Schema.test.ts tests/curriculumV3Dependencies.test.ts`
  - Output: 32 tests; 24 passed, 8 failed for the newly asserted missing validators, dangling project mappings, incorrect source/action, and incorrect audit keep set.
- Pilot design regression: `node --test tests/curriculumV3Docs.test.ts`
  - Output before fix: 3 tests; 2 passed, 1 failed because status was awaiting review and lines 3–4 had trailing spaces.
- Focused green run: `node --test tests/curriculumV3Audit.test.ts tests/curriculumV3Schema.test.ts tests/curriculumV3Dependencies.test.ts`
  - Output: 32 passed, 0 failed.
- Generated docs focused run: `node --test tests/curriculumV3Docs.test.ts`
  - Output: 3 passed, 0 failed.

## Verification command record

- `npm test`
  - Exit 0; 331 passed, 0 failed, 0 skipped.
- `npm run build`
  - Exit 0; `vue-tsc -b` and Vite production build completed; 2399 modules transformed. Existing chunk-size advisory only.
- `npm run build:pages`
  - Exit 0; `vue-tsc -b` and GitHub Pages Vite build completed; 2399 modules transformed. Existing chunk-size advisory only.
- `node scripts/generateCurriculumV3Docs.ts`
  - Exit 0; deterministic files regenerated.
- `git diff --exit-code -- docs/curriculum-v3`
  - Exit 0 after regeneration verification against a second generator run.
- `git diff --check`
  - Exit 0; no whitespace errors.
- `rg -n "curriculum/v3" src/router src/views src/components src/main.ts`
  - Exit 1 with no output, confirming no runtime imports.
- `rg -n "project-tabular-baseline" src/curriculum/v3 docs/curriculum-v3 tests`
  - Exit 1 with no output, confirming removal of the dangling placeholder.

## Notes

- `docs/gpt_advice.md` was not read, modified, staged, or committed.
- No runtime files were modified.

## Final re-review follow-up: wave adjacency and inventory order

### Finding and fix

- Final review found `v3.2-calculus-optimization` grouped instructional positions `15,16,17,22`, then the next wave regressed to position `18`.
- Repartitioned the same approved V3.2 responsibility without changing stage scope:
  - `v3.2-calculus-probability-foundations`: positions `15–19`.
  - `v3.2-probability-optimization-project`: positions `20–22` plus adjacent `project-math-to-code`.
  - `v3.2-data-pipeline`: positions `23–27` remains the complete data-to-feature pipeline.
- The blueprint still has 12 waves, 4–6 members per wave, V3.1–V3.7 coverage, dependency order, full module coverage, and the approved V3.2–V3.5 responsibilities.
- Added pure validation prefixes:
  - `wave-instructional-contiguity:<wave>:<positions>` for gaps among a wave's instructional inventory positions.
  - `wave-inventory-order:<wave>:<position>` when the flattened instructional sequence regresses within or across waves.
- Projects are ignored for position arithmetic, so they may remain beside adjacent instructional work.

### TDD evidence

- Initial mutation-test run: `node --test tests/curriculumV3Audit.test.ts`
  - Output: 14 tests; 12 passed and 2 failed because the two new stable prefixes were not implemented.
- Validator-only run before wave repair:
  - Output exposed exactly `wave-instructional-contiguity:v3.2-calculus-optimization:15,16,17,22` and `wave-inventory-order:v3.2-probability-project:18`.
- Focused green run: `node --test tests/curriculumV3Audit.test.ts tests/curriculumV3Dependencies.test.ts tests/curriculumV3Schema.test.ts tests/curriculumV3Docs.test.ts`
  - Exit 0; 37 passed, 0 failed.

### Follow-up verification

- `npm test`
  - Exit 0; 333 passed, 0 failed, 0 skipped.
- `npm run build`
  - Exit 0; TypeScript and production Vite build passed; 2399 modules transformed. Existing chunk-size advisory only.
- `npm run build:pages`
  - Exit 0; TypeScript and GitHub Pages Vite build passed; 2399 modules transformed. Existing chunk-size advisory only.
- `node scripts/generateCurriculumV3Docs.ts`
  - Exit 0; implementation backlog regenerated from the corrected wave declarations.
- `git diff --exit-code -- docs/curriculum-v3`
  - Exit 0 after the follow-up commit and a fresh generator run.
- `git diff --check`
  - Exit 0; no whitespace errors.

## AI Overview final whole-branch review closure — 2026-07-13

**Result:** DONE_WITH_CONCERNS
**Scope:** final findings in the approved Curriculum V3.1 AI Overview branch. No new completion, progress, scoring, submit, teacher-acceptance, or navigation-gate path was introduced.

### Finding-to-fix map

1. Moved the five existing formative checkpoint items to their owning chapters as groups of 2/1/2 and suppressed only the AI Overview page-bottom duplicate.
2. Replaced the paradigm checkpoint with three unseen, bilingual signal-recognition scenarios.
3. Rebuilt the ML process record around `L-07`, candidate score 62, selected `x = 3 h`, target `y = 68`, and a separate unseen evaluation record.
4. Added synchronized regression data/candidate/comparison tables and current-versus-best readouts backed by the existing deterministic math.
5. Replaced the Q fallback's aggregate second frame with a deterministic real one-action update from the shared Q-learning utility.
6. Replaced stale scenario-card/highlight protocol declarations with the three actual mounted algorithm labs and their real controls/readouts.
7. Added full greedy tie-priority and deterministic goal-termination coverage.
8. Synchronized the authoritative Manim episode-1 label (`26 steps`, reward `-25`) across checked JSON, runtime content, and integrity metadata.

### Assessment-boundary adjudication

The chapter-local checkpoint surface is formative explanation only. Answer selection reveals reasoning, misconception tags, and a revisit link immediately. It emits no score, submit event, attempt record, completion/progress mutation, navigation restriction, teacher-acceptance state, or backend request. Existing localStorage completion data and route access are preserved.

### TDD evidence

- Initial focused RED: 70 tests, 60 passed, 10 failed for the newly asserted review semantics.
- Focused GREEN: 73/73 passed.
- Expanded AI Overview set: 97/97 passed.
- Full-suite integration RED: 515/517 passed; two generic protocol-registration assertions caught incompatible distinct lab IDs.
- Protocol compatibility GREEN: 12/12 passed after retaining the registered `ai-overview-task-lab` compatibility ID.
- Final complete suite: 517/517 passed.

### Browser evidence

- Desktop: local checkpoint counts `[2,1,2]`, no global duplicate, all three desktop labs mounted, process-record roles correct, and regression table row counts `5/7/2`.
- Real regression step: current/best advanced from `w=4, b=48, MSE=39.60` to `w=5, b=48, MSE=9.40`, with row and plot values synchronized.
- Mobile 390 × 844: no page overflow, no desktop lab controls, Q fallback exactly four frames, no range input, and the single-action terms were visible and finite.
- Reduced motion: no desktop labs, fallback counts `[4,4,4]`, videos hidden, teaching information retained.
- Final clean session: 0 console errors, 0 warnings, no failed requests; MP4 traffic used expected 206 range responses.

### Verification command record

- `node --test tests/aiOverviewContent.test.ts tests/algorithm-checkpoints-layout.test.mjs tests/aiOverviewVisualContracts.test.ts tests/aiOverviewLabs.test.ts tests/aiOverviewLabBehavior.test.ts tests/aiOverviewQLearning.test.ts tests/aiOverviewResponsive.test.ts tests/aiOverviewManimAssets.test.ts` — 73/73 passed after the recorded RED run.
- `node --test tests/aiOverview*.test.ts tests/ai-overview-module.test.mjs tests/algorithm-checkpoints-layout.test.mjs` — 97/97 passed.
- `node --test tests/curriculumMilestoneAudit.test.ts tests/teachingInteractionProtocol.test.ts tests/aiOverviewContent.test.ts` — 12/12 passed.
- `npm test` — 517 passed; 0 failed, skipped, cancelled, or todo.
- `npm run build:pages` — passed; Vite 8.0.16 transformed 2,464 modules.
- `npm run security:audit` — passed; 0 vulnerabilities.
- `npm run build` — passed as the final build; Vite 8.0.16 transformed 2,464 modules.
- `python scripts/manim/render_ai_overview.py --check` — passed.

### Asset and concern disposition

- The Manim MP4, poster, and keyframe assets were not rerendered. The existing outputs passed the official check; only the authoritative checked label payload and matching integrity hash changed.
- `traffic-signals` remains the single approved deferred image record.
- Vite retains the pre-existing advisory for chunks larger than 1400 kB.
- `.superpowers/sdd/task-5-report.md` was preserved as pre-existing work and excluded from staging.
- `docs/gpt_advice.md` was not read, modified, staged, or committed.
