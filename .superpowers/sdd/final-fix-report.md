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
