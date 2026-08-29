---
phase: 27
slug: linear-regression-rebuild
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-29
---

# Phase 27 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. The
> finalized 27-01 through 27-08 plans, Wave 0 owners, task IDs, threat
> references, and automated commands are synchronized below.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in test runner through the repository `npm test` script; isolated Python clean-kernel checks; production-preview browser matrix |
| **Config file** | none — `package.json` defines test discovery; Notebook pins live in the Phase 27 public environment contract |
| **Quick run command** | `node --test tests/linear-regression-math.test.ts tests/linear-regression-simulation.test.ts tests/linear-regression-assets.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | task-local unit/content/contract checks under 60 seconds; clean-kernel, full-build, and browser checks are explicit longer blocking gates |

---

## Sampling Rate

- **After every task commit:** Run the narrow command associated with that task in the verification map or its finalized PLAN.md entry.
- **After Wave 1:** Run the Plan 27-01 math/simulation suite, the Plan 27-02 source/environment/Notebook scaffold suite, and `npm test`.
- **After Wave 2:** Prepare/verify the complete ignored candidate, run math plus Notebook tests, and `npm test`.
- **After Wave 3:** Publish atomically, run `--check --offline`, run math/Notebook tests, and `npm test`.
- **After Wave 4:** Run asset/parser/Notebook tests and `npm test`.
- **After Wave 5:** Run content/layout/asset/progress tests, `npm test`, and `npm run build`.
- **After Wave 6:** Run lab/math/simulation/asset tests, `npm test`, and `npm run build`.
- **After Wave 7:** Run the exact multiline release command in 27-08 Task 27-08-03.
- **Before phase verification:** Run the offline asset check, bilingual fresh-kernel Notebook reruns, `npm test`, `npm run build`, `npm run build:pages`, `npm run security:audit`, and the bilingual desktop/mobile production-preview matrix.
- **Max feedback latency:** 60 seconds for task-local checks. Clean-kernel, full-suite, build, audit, and browser checks are declared integration gates rather than replaced by weaker sampling.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Wave 0 Owner / Readiness | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 27-01-01 | 27-01 | 1 | LINR-01, LINR-04 | T-27-01/05/08 | Formula, guard, diagnostic, and facade contracts exist before implementation. | Wave 0 unit/source | `node --test --test-name-pattern="hand-checkable\|guard\|feature order\|split scaffold\|facade preservation" tests/linear-regression-math.test.ts tests/linear-regression-simulation.test.ts` | ❌ owner 27-W0-01/04 | ⬜ pending |
| 27-01-02 | 27-01 | 1 | LINR-01, LINR-02, LINR-03 | T-27-01/05 | DOM-free formulas, coefficient conversion, finite differences, and bounded deterministic GD pass. | unit/numerical | `node --test --test-name-pattern="prediction\|residual\|MSE\|MAE\|R2\|gradient\|finite difference\|coefficient\|GD\|guard\|split" tests/linear-regression-math.test.ts` | → 27-01-01 | ⬜ pending |
| 27-01-03 | 27-01 | 1 | LINR-02, LINR-03, LINR-04 | T-27-01/05/08 | Stable facade composes optimization gate and same-case diagnostics without duplicate authority. | unit/build | `node --test tests/linear-regression-math.test.ts tests/linear-regression-simulation.test.ts && npm run build` | → 27-01-01 | ⬜ pending |
| 27-02-01 | 27-02 | 1 | LINR-02, LINR-03 | T-27-02/03/04/SC | Exact environment/inventory/safe-code staging plus normal-equation teaching and deterministic row-role assertions are locked. | Wave 0 contract | `node --test --test-name-pattern="inventory scaffold\|environment contract\|safety\|staging scaffold" tests/linear-regression-notebook-assets.test.ts && git check-ignore -q .cache/linear-regression/phase-27-staging` | ❌ owner 27-W0-02/03 | ⬜ pending |
| 27-02-02 | 27-02 | 1 | LINR-02, LINR-03 | T-27-02/03/04/SC | Existing Bike contract bridge and no-index isolated candidate shell fail closed. | integration/source | `python3 -m py_compile scripts/linear-regression/build-phase-27-assets.py && node scripts/linear-regression/verify-bike-source.mjs >/tmp/phase-27-bike-source.json && node --test --test-name-pattern="source bridge\|inventory\|environment\|kernel\|safety\|staging\|cleanup" tests/linear-regression-notebook-assets.test.ts && python3 scripts/linear-regression/build-phase-27-assets.py --verify-environment --offline` | → 27-02-01 | ⬜ pending |
| 27-03-01 | 27-03 | 2 | LINR-02, LINR-03, LINR-04 | T-27-01/02/04/SC | Full fit teaches the bilingual augmented-design normal equation while executing stable `lstsq`, compares all three methods, and freezes deterministic representative/named IDs plus diagnostics. | integration/numerical | `python3 scripts/linear-regression/build-phase-27-assets.py --prepare-data-candidates --staging-root .cache/linear-regression/phase-27-staging --offline && node --test --test-name-pattern="source\|split\|feature\|leakage\|scaler\|GD\|normal equation\|正规方程\|augmented\|lstsq\|sklearn\|three-method\|method delta\|representative row\|named case\|residual\|atemp\|Ridge\|Lasso\|log1p" tests/linear-regression-notebook-assets.test.ts tests/linear-regression-math.test.ts` | → 27-01-01/27-02-01 | ⬜ pending |
| 27-03-02 | 27-03 | 2 | LINR-02, LINR-03, LINR-04 | T-27-03/04/SC | Locale Notebooks execute in distinct kernels with identical code/numbers, bilingual normal-equation/lstsq mapping, frozen five-case IDs, and an exact candidate manifest. | integration/notebook | `python3 scripts/linear-regression/build-phase-27-assets.py --prepare-candidates --staging-root .cache/linear-regression/phase-27-staging --offline && python3 scripts/linear-regression/build-phase-27-assets.py --verify-candidates --staging-root .cache/linear-regression/phase-27-staging --offline && node --test tests/linear-regression-notebook-assets.test.ts tests/linear-regression-math.test.ts` | → 27-02-01 | ⬜ pending |
| 27-04-01 | 27-04 | 3 | LINR-02, LINR-03, LINR-04 | T-27-03/04/07/SC | Absent-target initial publication and seeded-existing replacement prove complete-only moves; every injected failure restores exact prior absence or bytes/modes and removes all residue. | integration/atomicity | `node --test --test-name-pattern="publication\|absent target\|seeded existing target\|replacement\|inventory\|subset\|rollback\|lock\|mode\|residue\|corruption" tests/linear-regression-notebook-assets.test.ts` | → 27-02-01 | ⬜ pending |
| 27-04-02 | 27-04 | 3 | LINR-02, LINR-03, LINR-04 | T-27-04/07 | The exact nine-member package publishes atomically from an absent target without backup; replacement success remains separately proven. | integration/publication | `python3 scripts/linear-regression/build-phase-27-assets.py --publish-candidates --staging-root .cache/linear-regression/phase-27-staging && node --test --test-name-pattern="publication\|public inventory\|public hash\|strict JSON\|CSV\|parity" tests/linear-regression-notebook-assets.test.ts` | → 27-02-01/27-04-01 | ⬜ pending |
| 27-04-03 | 27-04 | 3 | LINR-02, LINR-03 | T-27-03/04/07/SC | Both public Notebooks rerun offline outside the repo and repository bytes/mtimes stay unchanged. | integration/offline | `python3 scripts/linear-regression/build-phase-27-assets.py --check --offline && node --test tests/linear-regression-notebook-assets.test.ts && git diff --check` | → 27-02-01 | ⬜ pending |
| 27-05-01 | 27-05 | 4 | LINR-01, LINR-02, LINR-03, LINR-04 | T-27-04/05/07 | Exact parser/base/manifest/corruption contract exists before runtime consumption. | Wave 0 asset contract | `node --test --test-name-pattern="public inventory scaffold\|base path\|manifest existence" tests/linear-regression-assets.test.ts` | ❌ owner 27-W0-02 | ⬜ pending |
| 27-05-02 | 27-05 | 4 | LINR-01, LINR-02, LINR-03, LINR-04 | T-27-04/05/07 | Registry and parser accept only exact finite, bounded, local, manifest-backed outputs. | unit/integration/build | `node --test tests/linear-regression-assets.test.ts tests/linear-regression-notebook-assets.test.ts && npm run build` | → 27-05-01 | ⬜ pending |
| 27-06-01 | 27-06 | 5 | LINR-01, LINR-02, LINR-03, LINR-04 | T-27-06/07/08 | Content/order/route/checkpoint/progress/safe-render contracts plus exact bilingual normal-equation formula/mapping assertions precede mutation. | Wave 0 content/compat | `node --test --test-name-pattern="identity scaffold\|route preservation\|checkpoint preservation\|progress preservation" tests/linear-regression-content.test.mjs tests/linear-regression-layout.test.mjs tests/algorithm-progress.test.ts tests/curriculumProgress.test.ts` | ❌ owner 27-W0-05 | ⬜ pending |
| 27-06-02 | 27-06 | 5 | LINR-01, LINR-02, LINR-03, LINR-04 | T-27-06/07 | Eight bilingual chapters implement consistent notation/outputs; Chapter 5 teaches the augmented normal equation, stable `lstsq` mapping, and same-split three-method comparison. | content/asset | `node --test --test-name-pattern="fit-line\|multivariate\|residual-loss\|training-motion\|polynomial\|model-limits\|overfitting\|regularization\|bilingual\|notation\|normal equation\|正规方程\|augmented\|lstsq\|three-method\|sklearn" tests/linear-regression-content.test.mjs tests/linear-regression-assets.test.ts` | → 27-06-01 | ⬜ pending |
| 27-06-03 | 27-06 | 5 | LINR-01, LINR-04 | T-27-06/07/08 | Adapter reorder preserves all deep links, checkpoints, V1/V2 progress, and builds. | compatibility/build | `node --test tests/linear-regression-content.test.mjs tests/linear-regression-layout.test.mjs tests/linear-regression-assets.test.ts tests/algorithm-progress.test.ts tests/curriculumProgress.test.ts && npm run build` | → 27-06-01 | ⬜ pending |
| 27-07-01 | 27-07 | 6 | LINR-01, LINR-02, LINR-03, LINR-04 | T-27-05/06/07/08 | Lab registry/loading/fallback/accessibility/pure-math boundary is locked. | Wave 0 UI/source | `node --test --test-name-pattern="lab scaffold\|asset loading scaffold\|pure math boundary\|accessibility scaffold" tests/linear-regression-labs.test.mjs` | ❌ owner 27-W0-05 UI portion | ⬜ pending |
| 27-07-02 | 27-07 | 6 | LINR-01, LINR-02, LINR-03, LINR-04 | T-27-05/06/07 | Workbench/results consume strict assets and pure snapshots with bounded/resettable controls. | component/unit/build | `node --test --test-name-pattern="registry\|loading\|abort\|fallback\|control\|reset\|row to batch\|method\|coefficient\|diagnostic\|named case" tests/linear-regression-labs.test.mjs tests/linear-regression-assets.test.ts tests/linear-regression-simulation.test.ts && npm run build` | → 27-07-01/27-01-01/27-05-01 | ⬜ pending |
| 27-07-03 | 27-07 | 6 | LINR-01, LINR-04 | T-27-05/08 | Same-case SVG/table visuals retain static/non-color meaning and no component math. | component/unit/build | `node --test tests/linear-regression-labs.test.mjs tests/linear-regression-math.test.ts tests/linear-regression-simulation.test.ts && npm run build` | → 27-07-01/27-01-01 | ⬜ pending |
| 27-08-01 | 27-08 | 7 | LINR-01, LINR-02, LINR-03, LINR-04 | T-27-05/06/07/08 | Final page/browser contract plus no-remote executable-region scan and staged/worktree scope-classifier fixtures exist before composition. | Wave 0 release/source | `node --test --test-name-pattern="release scaffold\|browser matrix source\|route matrix contract" tests/linear-regression-release.test.mjs tests/linear-regression-layout.test.mjs` | ❌ owner 27-W0-05/27-GATE | ⬜ pending |
| 27-08-02 | 27-08 | 7 | LINR-01, LINR-02, LINR-03, LINR-04 | T-27-05/06/07/08 | Page composition, downloads, fallbacks, styles, checkpoint, and progress contracts pass. | component/compat/build | `node --test tests/linear-regression-content.test.mjs tests/linear-regression-layout.test.mjs tests/linear-regression-labs.test.mjs tests/linear-regression-release.test.mjs tests/linear-regression-assets.test.ts tests/algorithm-progress.test.ts tests/curriculumProgress.test.ts && npm run build` | → all Wave 0 owners | ⬜ pending |
| 27-08-03 | 27-08 | 7 | LINR-01, LINR-02, LINR-03, LINR-04 | T-27-01 through T-27-08, T-27-SC | Offline/full/browser/Pages/security gates plus exact protected SHA/status/index baseline, staged/worktree allowlists, no-remote scan, and diff check all block release without error suppression. | full/release/browser/scope | Use the multiline `<automated>` command in `27-08-PLAN.md` Task 27-08-03 exactly. | → all Wave 0 owners | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/linear-regression-math.test.ts` — owner 27-01-01; canonical feature order, finite guards, row/batch formulas, finite differences, coefficient conversions, and locked anchors.
- [ ] `tests/linear-regression-simulation.test.ts` — owner 27-01-01; Bike snapshots, stable facade, staged diagnostics, and deterministic interaction coverage.
- [ ] `tests/linear-regression-notebook-assets.test.ts` — owner 27-02-01, extended by 27-03/04; environment/source hash, safe cells, bilingual normal-equation/lstsq mapping, deterministic row-role IDs, kernels, locale parity, complete outputs, manifest, absent/existing atomic publication, exact rollback, and offline checks.
- [ ] `tests/linear-regression-assets.test.ts` — owner 27-05-01; strict runtime schemas, source/split/feature/residual/tolerance/finite contracts, manifest inventory, and base paths.
- [ ] `tests/linear-regression-content.test.mjs` plus existing layout/progress tests — owner 27-06-01; eight-ID bilingual content, exact Chapter 5 normal-equation formula/intercept/lstsq/three-method assertions, route/checkpoint/progress preservation, safe rendering, and terminology.
- [ ] `tests/linear-regression-labs.test.mjs` — owner 27-07-01; lab registry, pure-math wiring, loading/fallback, controls, staged diagnosis, and accessible visuals.
- [ ] `tests/linear-regression-release.test.mjs` and `scripts/qa/linearRegressionBrowserMatrix.js` — owner 27-08-01; page/download/style/reduced-motion, 36-case browser matrix, executable-region no-remote scan, and Phase 27 scope-classifier fixtures.
- [ ] Generator failure injections — owners 27-02-01 and 27-04-01; split/leakage/hash/schema/order/candidate completeness, absent-target and seeded-existing-target publication, byte/mode/absence rollback, residue cleanup, and read-only offline behavior.

---

## Manual-Only Verifications

None planned. Bilingual desktop/mobile production-preview checks, reduced-motion
fallbacks, downloads, code copy, and representative residual explanations must
be automated in the release plan rather than treated as unrecorded manual
approval.

---

## Validation Sign-Off

- [x] All 21 finalized tasks have a plan/wave owner, threat references, and an automated command or explicit dependency on a Wave 0 owner.
- [x] Sampling continuity requires task-local feedback and a full-suite run after every wave.
- [x] Wave 0 lists every missing or rewritten Phase 27 test contract identified by research.
- [x] No watch-mode command is permitted.
- [x] Task-local feedback targets under 60 seconds; longer checks are declared blocking integration gates.
- [x] `nyquist_compliant: true` records that all four phase requirements, compatibility behavior, security classes, and missing-test owners have a validation path.
- [x] Final plan synchronization is complete for 27-01 through 27-08.
- [x] Research open questions are explicitly RESOLVED: deterministic row/case IDs are frozen and no new Manim/Three.js asset is in the Phase 27 critical path.
- [x] `wave_0_complete: true` — execution-created and rewritten tests are present and green.

**Approval:** validated 2026-08-29

## Validation Audit 2026-08-29

| Metric | Count |
| --- | ---: |
| Requirements audited | 4 |
| Covered | 4 |
| Gaps found | 0 |

The passed Phase 27 verification, current linear-regression test inventory, full-suite retry, both builds, and zero-vulnerability audit close the former execution-time pending state.
