---
phase: 27
slug: linear-regression-rebuild
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-29
---

# Phase 27 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Final
> task IDs and wave owners are synchronized with the approved PLAN.md files
> before execution begins.

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
- **After every plan wave:** Run the complete Phase 27 focused suite and `npm test`.
- **Before phase verification:** Run the offline asset check, bilingual fresh-kernel Notebook reruns, `npm test`, `npm run build`, `npm run build:pages`, `npm run security:audit`, and the bilingual desktop/mobile production-preview matrix.
- **Max feedback latency:** 60 seconds for task-local checks. Clean-kernel, full-suite, build, audit, and browser checks are declared integration gates rather than replaced by weaker sampling.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 27-W0-01 | assigned by planner | 0 | LINR-01 | T-27-01/05 | Feature order, row/batch prediction, residual sign, MSE gradients, finite guards, and coefficient conversion have one DOM-free authority. | unit/numerical | `node --test tests/linear-regression-math.test.ts` | ❌ W0 | ⬜ pending |
| 27-W0-02 | assigned by planner | 0 | LINR-02, LINR-03 | T-27-02/03/04 | Source hash, chronological membership, train-only preprocessing, solver matrices, intercept convention, tolerances, and publication inventory fail closed. | contract/integration | `node --test tests/linear-regression-assets.test.ts` | ❌ W0 | ⬜ pending |
| 27-W0-03 | assigned by planner | 0 | LINR-02, LINR-03 | T-27-03/04 | Both clean-kernel locale variants share code and numerical outputs, avoid network/shell/install behavior, and publish only complete verified candidates. | notebook/integration | `node --test tests/linear-regression-notebook-assets.test.ts` | ❌ W0 | ⬜ pending |
| 27-W0-04 | assigned by planner | 0 | LINR-04 | T-27-01/05 | Residual, spread, named-row, `atemp`-only, OLS/Ridge, and optimization-before-diagnosis states are finite, deterministic, and correctly labeled. | unit/asset integration | `node --test tests/linear-regression-assets.test.ts tests/linear-regression-simulation.test.ts` | ⚠️ simulation test exists and requires rewrite | ⬜ pending |
| 27-W0-05 | assigned by planner | 0 | LINR-01, LINR-02, LINR-03, LINR-04 | T-27-06/07/08 | Eight IDs, routes, checkpoint/progress identity, bilingual safe rendering, copy behavior, base-safe assets, fallback, mobile, and reduced motion remain intact. | structure/build/browser | `node --test tests/linear-regression-layout.test.mjs tests/algorithm-progress.test.ts` | ⚠️ existing tests require updated expectations | ⬜ pending |
| 27-GATE | final plan | final | LINR-01, LINR-02, LINR-03, LINR-04 | T-27-01 through T-27-08 | No partial or stale package can pass the complete offline, repository, build, audit, and responsive browser gates. | full/release | `npm test && npm run build && npm run build:pages && npm run security:audit` plus the finalized offline asset and browser commands | partial infrastructure exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/linear-regression-math.test.ts` — canonical feature order, finite guards, row/batch formulas, finite differences, train/model/original coefficient conversions, and locked numerical anchors.
- [ ] `tests/linear-regression-assets.test.ts` — immutable source identity, chronological split, leakage rejection, strict result schemas, exact order, finite values, public-base paths, typed fallback, and publication inventory.
- [ ] `tests/linear-regression-notebook-assets.test.ts` — exact environment/source hash, no network/shell/install, fresh kernels, locale code parity, normalized numerical parity, complete solver tables/trace/tolerances, manifest, and transactional publication behavior.
- [ ] Rewrite or extend `tests/linear-regression-simulation.test.ts` around the Bike Sharing numerical contract while retaining deterministic interaction coverage.
- [ ] Update `tests/linear-regression-layout.test.mjs` and adjacent route/progress assertions for the new chapter order and responsibilities without changing the eight literal IDs.
- [ ] Add generator failure-injection coverage for split membership, leakage columns, CSV hash/schema/order, candidate completeness, rollback, and read-only offline checks.

---

## Manual-Only Verifications

None planned. Bilingual desktop/mobile production-preview checks, reduced-motion
fallbacks, downloads, code copy, and representative residual explanations must
be automated in the release plan rather than treated as unrecorded manual
approval.

---

## Validation Sign-Off

- [ ] Every finalized PLAN.md task has an automated command or an explicit dependency on a Wave 0 owner.
- [x] Sampling continuity requires task-local feedback and a full-suite run after every wave.
- [x] Wave 0 lists every missing or rewritten Phase 27 test contract identified by research.
- [x] No watch-mode command is permitted.
- [x] Task-local feedback targets under 60 seconds; longer checks are declared blocking integration gates.
- [x] `nyquist_compliant: true` records that all four phase requirements, compatibility behavior, security classes, and missing-test owners have a validation path.
- [ ] `wave_0_complete: true` — pending execution-created tests and final plan synchronization.

**Approval:** pending plan verification
