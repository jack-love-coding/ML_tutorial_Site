---
phase: 26
slug: loss-functions-rebuild
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-28
completed: 2026-07-28
---

# Phase 26 — Validation Strategy

> Per-phase validation contract used during execution. The LaDe authorization
> was explicitly approved on 2026-07-28; every Wave 0 owner created its test
> file and demonstrated the planned RED → GREEN sequence. The canonical final
> result is recorded in `26-VERIFICATION.md`.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node 24 built-in test runner; Python generator self-checks; Playwright CLI production-preview matrix |
| **Config file** | none — repository test discovery is defined by `package.json`; isolated Python pins are recorded in `public/notebooks/loss-functions/requirements.txt` |
| **Quick run command** | `node --test tests/loss-functions-*.test.* tests/algorithm-progress.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | focused source/math/content tests under 60 seconds; clean-kernel/generator and release gates are explicitly longer blocking checks |

---

## Sampling Rate

- **After every task commit:** Run the exact focused command in the Per-Task Verification Map.
- **After Wave 1:** Run `node --test tests/loss-functions-dataset-contract.test.ts tests/loss-functions-math.test.ts && npm test`.
- **After Wave 2:** Run `node --test tests/loss-functions-dataset-contract.test.ts tests/loss-functions-math.test.ts tests/loss-functions-notebook-assets.test.ts && npm test`.
- **After Wave 3:** Run `python3 scripts/loss-functions/build-phase-26-assets.py --verify-candidates --staging-root .cache/loss-functions/phase-26-staging --offline && node --test tests/loss-functions-dataset-contract.test.ts tests/loss-functions-math.test.ts tests/loss-functions-notebook-assets.test.ts && npm test`.
- **After Wave 4:** Run `python3 scripts/loss-functions/build-phase-26-assets.py --check --offline && node --test tests/loss-functions-dataset-contract.test.ts tests/loss-functions-math.test.ts tests/loss-functions-notebook-assets.test.ts && npm test`.
- **After Wave 5:** Run `node --test tests/loss-functions-content.test.mjs tests/loss-functions-compatibility.test.ts tests/algorithm-progress.test.ts && npm test`.
- **After Wave 6:** Run the complete Plan 26-07 Task 3 release command: offline check, focused tests, full tests, root build/preview/browser matrix, Pages build/static base checks, security audit, and diff check.
- **Before `$gsd-verify-work`:** `npm test`, `npm run build`, `npm run build:pages`, `npm run security:audit`, offline asset check, and the bilingual desktop/390px matrix must all be green.
- **Max feedback latency:** 60 seconds for task-local unit/content/source tests. Dataset bootstrap, four-kernel execution, standalone reruns, full suite, and browser matrix are declared blocking integration gates and are not substituted with lighter checks.

---

## Completion Record

- Phase verifier: **passed**, 37/37 must-haves, 0 unverified behaviors.
- Focused Phase 26 suite: **88/88 passed**.
- Repository suite: **837/837 passed**.
- Offline package: **16 exact members**, four independently rerun Notebooks,
  repository byte/mtime clean.
- Root browser matrix: **32/32 passed** across both locales and both viewports.
- Root build, Pages build, Pages asset tests, and security audit: **passed**.

The task table below is the historical pre-execution sampling map; its original
owner/readiness cells are retained as planning provenance. Completion evidence
is the report and release record above.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists (pre-execution) | Status (pre-execution) |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 26-01-01 | 01 | 1 | LOSS-01, LOSS-02 | T-26-03 | The resolved `approve-lade` authorization is bound to the pinned LaDe-D Jilin identity, complete evidence, and privacy denylist; drift fails closed. | automated contract/preflight | From repository root: `rg -q "Open Questions \\(RESOLVED\\)" .planning/phases/26-loss-functions-rebuild/26-RESEARCH.md && rg -q "2026-07-28.*approve-lade" .planning/phases/26-loss-functions-rebuild/26-RESEARCH.md && rg -q "be2cec02775cafc8d52230303f32134382bcc50b" .planning/phases/26-loss-functions-rebuild/26-RESEARCH.md && rg -q "12e2cf4664dd5b4475d39dddee8872f5a03b3082f08f0eece7f103baee6c6e73" .planning/phases/26-loss-functions-rebuild/26-RESEARCH.md && rg -q "courier_id" .planning/phases/26-loss-functions-rebuild/26-RESEARCH.md && rg -qi "GPS" .planning/phases/26-loss-functions-rebuild/26-RESEARCH.md && rg -qi "precise stop" .planning/phases/26-loss-functions-rebuild/26-RESEARCH.md && rg -q "approve-lade" docs/curriculum-v3/loss-functions/phase-26-data-contract.md && rg -q "be2cec02775cafc8d52230303f32134382bcc50b" docs/curriculum-v3/loss-functions/phase-26-data-contract.md && rg -q "12e2cf4664dd5b4475d39dddee8872f5a03b3082f08f0eece7f103baee6c6e73" docs/curriculum-v3/loss-functions/phase-26-data-contract.md && rg -q "courier_id" docs/curriculum-v3/loss-functions/phase-26-data-contract.md && rg -qi "GPS" docs/curriculum-v3/loss-functions/phase-26-data-contract.md && rg -qi "precise stop" docs/curriculum-v3/loss-functions/phase-26-data-contract.md` | ✅ research exists; contract created by 26-01-01 | ⬜ pending |
| 26-01-02 | 01 | 1 | LOSS-01, LOSS-02, LOSS-03 | T-26-01/02/03/04, T-26-SC | Source, license, privacy, strict-JSON, mode, and offline/write-free boundaries fail closed. | unit/contract | `python3 -m py_compile scripts/loss-functions/build-phase-26-assets.py && node --test tests/loss-functions-dataset-contract.test.ts && git check-ignore -q .cache/loss-functions/phase-26-sources` | ❌ W0 — owner 26-01-02 | ⬜ pending |
| 26-01-03 | 01 | 1 | LOSS-01, LOSS-02 | T-26-01/02/04 | Only the exact two official source archives enter the ignored verified cache. | integration | `python3 scripts/loss-functions/build-phase-26-assets.py --bootstrap-sources --source-cache .cache/loss-functions/phase-26-sources && python3 scripts/loss-functions/build-phase-26-assets.py --verify-source-cache --source-cache .cache/loss-functions/phase-26-sources --offline && node --test tests/loss-functions-dataset-contract.test.ts` | ❌ W0 → 26-01-02 | ⬜ pending |
| 26-02-01 | 02 | 1 | LOSS-01, LOSS-02 | T-26-05/06/07 | Guarded per-element/mean MSE, MAE, stable BCE, gradients, statuses, and kink semantics are DOM-free. | unit | `node --test --test-name-pattern="MSE\|MAE\|BCE\|guard\|probe" tests/loss-functions-math.test.ts` | ❌ W0 — owner 26-02-01 | ⬜ pending |
| 26-02-02 | 02 | 1 | LOSS-03 | T-26-05/06/07 | Central differences/h sweep are bounded and simulation uses one pure canonical math authority. | unit/build | `node --test tests/loss-functions-math.test.ts && npm run build` | ❌ W0 → 26-02-01 | ⬜ pending |
| 26-03-01 | 03 | 2 | LOSS-03 | T-26-08/09/10/11 | Candidate inventory is indivisible, bilingual code is shared, and staging cannot target public. | contract/source | `python3 -m py_compile scripts/loss-functions/build-phase-26-assets.py && node --test --test-name-pattern="inventory\|shared code\|locale\|staging\|network" tests/loss-functions-notebook-assets.test.ts && git check-ignore -q .cache/loss-functions/phase-26-staging` | ❌ W0 — owner 26-03-01 | ⬜ pending |
| 26-03-02 | 03 | 2 | LOSS-03 | T-26-09/10/11, T-26-SC | Exact no-index environment and four isolated kernel jobs fail before candidate work on drift. | integration | `python3 scripts/loss-functions/build-phase-26-assets.py --verify-environment --offline && node --test --test-name-pattern="environment\|kernel\|transaction\|cleanup" tests/loss-functions-notebook-assets.test.ts` | ❌ W0 → 26-03-01 | ⬜ pending |
| 26-04-01 | 04 | 3 | LOSS-01, LOSS-02 | T-26-12/13/15/16, T-26-SC | Complete LaDe/SECOM transformations preserve privacy, 590/591 truth, rows, labels, and honest real/fallback provenance in ignored staging. | integration/data | `python3 scripts/loss-functions/build-phase-26-assets.py --prepare-dataset-candidates --source-cache .cache/loss-functions/phase-26-sources --staging-root .cache/loss-functions/phase-26-staging && node --test --test-name-pattern="LaDe\|SECOM\|privacy\|590\|591\|representative\|OOF" tests/loss-functions-dataset-contract.test.ts tests/loss-functions-notebook-assets.test.ts` | ❌ W0 → 26-01-02/26-03-01 | ⬜ pending |
| 26-04-02 | 04 | 3 | LOSS-01, LOSS-02, LOSS-03 | T-26-14/15/16, T-26-SC | Four candidate Notebooks execute independently; JSON/plots/manifest/parity/numerical outputs validate as one staged package. | integration/numerical | `python3 scripts/loss-functions/build-phase-26-assets.py --prepare-candidates --source-cache .cache/loss-functions/phase-26-sources --staging-root .cache/loss-functions/phase-26-staging && python3 scripts/loss-functions/build-phase-26-assets.py --verify-candidates --staging-root .cache/loss-functions/phase-26-staging --offline && node --test --test-name-pattern="clean kernel\|locale\|BCE\|gradient\|finite difference\|manifest\|strict JSON\|plot" tests/loss-functions-notebook-assets.test.ts tests/loss-functions-math.test.ts` | ❌ W0 → 26-02-01/26-03-01 | ⬜ pending |
| 26-05-01 | 05 | 4 | LOSS-01, LOSS-02, LOSS-03 | T-26-17/21 | One complete inventory swaps all public groups together; subset or injected failure rolls back every byte. | integration/atomicity | `python3 scripts/loss-functions/build-phase-26-assets.py --publish-candidates --staging-root .cache/loss-functions/phase-26-staging && node --test --test-name-pattern="publication\|inventory\|subset\|rollback\|standards JSON" tests/loss-functions-dataset-contract.test.ts tests/loss-functions-notebook-assets.test.ts` | ❌ W0 → 26-01-02/26-03-01 | ⬜ pending |
| 26-05-02 | 05 | 4 | LOSS-01, LOSS-02, LOSS-03 | T-26-18/19/20/21 | Offline check is read-only; all four copied public Notebooks rerun; hashes/parity/base/schema checks fail on drift. | integration/standalone | `python3 scripts/loss-functions/build-phase-26-assets.py --check --offline && node --test --test-name-pattern="offline\|standalone\|parity\|hash\|finite\|base\|590\|591" tests/loss-functions-dataset-contract.test.ts tests/loss-functions-notebook-assets.test.ts tests/loss-functions-math.test.ts && git diff --check` | ❌ W0 → 26-01-02/26-02-01/26-03-01 | ⬜ pending |
| 26-06-01 | 06 | 5 | LOSS-01, LOSS-02, LOSS-03 | T-26-22/23/24/25 | Typed output validation and exact slug/route/chapter/checkpoint/Progress/base contracts precede content edits. | content/compatibility | `node --test --test-name-pattern="identity\|chapter\|asset\|output\|base\|progress\|checkpoint" tests/loss-functions-compatibility.test.ts tests/algorithm-progress.test.ts tests/loss-functions-content.test.mjs` | ❌ W0 — owner 26-06-01; algorithm-progress exists | ⬜ pending |
| 26-06-02 | 06 | 5 | LOSS-01, LOSS-02 | T-26-22/23 | First three bilingual chapters bind typed real outputs and stable BCE without copied numbers or expanded Softmax. | content | `node --test --test-name-pattern="why-loss\|regression-losses\|classification-losses\|Softmax\|bilingual" tests/loss-functions-content.test.mjs` | ❌ W0 → 26-06-01 | ⬜ pending |
| 26-06-03 | 06 | 5 | LOSS-01, LOSS-02, LOSS-03 | T-26-23/24/25 | Final four chapters complete the safe seven-chapter loop without route/progress/checkpoint drift. | content/compatibility/build | `node --test tests/loss-functions-content.test.mjs tests/loss-functions-compatibility.test.ts tests/algorithm-progress.test.ts && npm run build` | ❌ W0 → 26-06-01 | ⬜ pending |
| 26-07-01 | 07 | 6 | LOSS-01, LOSS-02, LOSS-03 | T-26-26/28/29/30 | Explicit seven-lab routing, typed local results, fallback, code copy, and base-safe downloads avoid unsafe/unknown fallthrough. | component/source | `node --test --test-name-pattern="registry\|gradient\|result\|download\|fallback\|copy" tests/loss-functions-labs.test.mjs tests/loss-functions-content.test.mjs tests/loss-functions-notebook-assets.test.ts` | ❌ W0 — owner 26-07-01 | ⬜ pending |
| 26-07-02 | 07 | 6 | LOSS-01, LOSS-02, LOSS-03 | T-26-27/30 | Bounded real-row labs use pure math, label synthetic probes, and retain responsive/non-color/reduced-motion meaning. | component/unit/build | `node --test tests/loss-functions-labs.test.mjs tests/loss-functions-math.test.ts && npm run build` | ❌ W0 → 26-07-01/26-02-01 | ⬜ pending |
| 26-07-03 | 07 | 6 | LOSS-01, LOSS-02, LOSS-03 | T-26-26/27/28/29/30, T-26-SC | Root browser matrix runs on root build before Pages overwrites dist; Pages base is then validated statically; all release gates block. | full/release/browser | Use the multiline `<automated>` command in `26-07-PLAN.md` Task 3 exactly. | ❌ W0 → all owners above | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `tests/loss-functions-dataset-contract.test.ts` — source/license/privacy/schema/strict-JSON/bootstrap/atomicity coverage for LOSS-01/02/03.
- [x] `tests/loss-functions-math.test.ts` — pure MSE/MAE/BCE/gradient/guard/probe/finite-difference coverage for LOSS-01/02/03.
- [x] `tests/loss-functions-notebook-assets.test.ts` — candidate inventory/environment/four-kernel/parity/staging/publication/base coverage for LOSS-01/02/03.
- [x] `tests/loss-functions-compatibility.test.ts` — module/route/deep-link/checkpoint/Progress/base/safe-render coverage.
- [x] `tests/loss-functions-content.test.mjs` — seven-chapter bilingual teaching-loop/formula/code/output/scope coverage.
- [x] `tests/loss-functions-labs.test.mjs` — explicit registry/result/download/bounds/accessibility/fallback/page placement coverage.
- [x] `tests/algorithm-progress.test.ts` — existing; Plan 26-06 changes only the exact loss chapter set.
- [x] Node test runner, npm build scripts, existing Python pins, audited wheel cache, and Playwright CLI — existing infrastructure; no framework or package installation is planned.

`wave_0_complete` is `true`: every listed file exists and the owning plans
recorded the required RED and GREEN commits.

---

## Manual-Only Verifications

None. The only policy decision was completed during planning on 2026-07-28 with the explicit response `approve-lade`; Task 26-01-01 now verifies and records its exact bounded scope automatically.

The bilingual desktop/390px browser matrix is automated in Task 26-07-03 and is not a manual-only substitute.

---

## Validation Sign-Off

- [x] All 17 tasks have an `<automated>` verification command or an explicit Wave 0 owner; Task 26-01-01 records and automatically preflights the completed planning-time decision.
- [x] Sampling continuity: no consecutive task lacks automated feedback, and no three-task gap exists.
- [x] Wave 0 covers every test file that is absent at planning time.
- [x] Every task maps to LOSS-01/02/03 and applicable threat references.
- [x] No watch-mode flag is used.
- [x] Task-local feedback targets under 60 seconds; longer bootstrap/kernel/full/browser work is declared as blocking integration sampling.
- [x] Root browser validation precedes Pages build; Pages base validation occurs after Pages output exists.
- [x] `nyquist_compliant: true` is set because the complete task/requirement/threat/command/ownership and resolved authorization contract is present.
- [ ] `wave_0_complete: true` — pending execution-created test files.

**Approval:** approved 2026-07-28
