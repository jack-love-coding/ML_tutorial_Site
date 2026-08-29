---
phase: 26-loss-functions-rebuild
plan: "02"
subsystem: numerical-engine
tags: [typescript, loss-functions, stable-bce, finite-differences, tdd]

requires:
  - phase: 26-loss-functions-rebuild
    plan: "01"
    provides: Pinned Phase 26 source/data contract and strict non-finite serialization precedent
provides:
  - Guarded immutable MSE, MAE, and stable logit-BCE evaluations with per-element and mean gradients
  - Typed naive/clipped/stable BCE comparison for ten fixed extreme-logit probes
  - Guarded coordinate central differences and a locked nine-step gradient-verification sweep
  - Backward-compatible loss simulation composed from one pure numerical authority
affects: [26-03-notebook-pipeline, 26-04-candidate-generation, 26-06-content-integration, 26-07-release]

tech-stack:
  added: []
  patterns:
    - DOM-free loss authority with immutable typed result records
    - Stable logit-domain BCE as canonical calculation; clipping remains comparison-only metadata
    - Mean-objective finite differences checked against gradients that expose the batch factor

key-files:
  created:
    - src/simulations/lossFunctionsMath.ts
    - tests/loss-functions-math.test.ts
  modified:
    - src/simulations/lossFunctions.ts
    - src/utils/datasets.ts
    - .planning/phases/26-loss-functions-rebuild/deferred-items.md

key-decisions:
  - "Keep stable logit-domain BCE as the only canonical binary-loss path; probability clipping is exposed only as objective-changing comparison metadata."
  - "Represent the MAE zero-residual convention as subgradient 0 with differentiable false and kink status, never as a certified unique derivative."
  - "Lock the central-difference sweep to h=10^-1 through 10^-9 with tolerance 5e-7 and compare against mean-objective gradients."

patterns-established:
  - "Loss evaluation contract: per-element losses/gradients and mean objective/gradients remain separate immutable fields."
  - "Numerical failure contract: malformed or non-finite inputs throw typed errors; demonstrative non-finite naive BCE uses status plus null."

requirements-completed: [LOSS-01, LOSS-02, LOSS-03]

coverage:
  - id: D1
    description: Guarded MSE, MAE, and stable BCE return deterministic per-element losses, mean objectives, and both gradient scales
    requirement: LOSS-01
    verification:
      - kind: unit
        ref: "tests/loss-functions-math.test.ts#MSE keeps per-element losses and gradients separate from the mean objective"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-math.test.ts#MAE exposes the zero-residual kink and uses subgradient convention zero"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-math.test.ts#BCE uses stable logit losses and exposes per-logit plus mean-objective gradients"
        status: pass
    human_judgment: false
  - id: D2
    description: Ten fixed synthetic probes distinguish naive non-finite behavior, objective-changing clipping, and finite stable logit BCE
    requirement: LOSS-02
    verification:
      - kind: unit
        ref: "tests/loss-functions-math.test.ts#BCE probe publishes ten typed naive, clipped, and stable comparisons"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-math.test.ts#BCE stable sigmoid and softplus remain finite at fixed extreme logits"
        status: pass
    human_judgment: false
  - id: D3
    description: Coordinate central differences and the locked h sweep verify smooth loss gradients while preserving MAE kink semantics
    requirement: LOSS-03
    verification:
      - kind: unit
        ref: "tests/loss-functions-math.test.ts#MSE MAE and BCE h sweeps expose locked diagnostics and pass at h=1e-5"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-math.test.ts#MAE h sweep reports a kink and never certifies zero residual as a derivative pass"
        status: pass
      - kind: integration
        ref: "npm run build"
        status: pass
    human_judgment: false
  - id: D4
    description: Existing loss simulation preserves its deterministic single-snapshot contract while consuming the pure authority
    requirement: LOSS-01
    verification:
      - kind: integration
        ref: "tests/loss-functions-math.test.ts#loss simulation preserves one deterministic snapshot while consuming the pure authority"
        status: pass
      - kind: integration
        ref: "npm run build"
        status: pass
    human_judgment: false

duration: 12 min
completed: 2026-07-28
status: complete
---

# Phase 26 Plan 02: Pure Loss and Gradient Authority Summary

**A guarded TypeScript engine now keeps MSE, MAE, and stable BCE formulas, gradients, extreme-logit probes, and finite-difference verification consistent behind the existing loss simulation.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-28T13:26:11Z
- **Completed:** 2026-07-28T13:38:27Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Added immutable, typed MSE/MAE/BCE results with per-element loss, mean objective, per-element gradient, mean-objective gradient, and explicit differentiability metadata.
- Added branch-stable sigmoid/softplus/logit BCE plus a ten-row fixed probe whose naive non-finite results use status and `null`, while clipped values declare their epsilon and objective change.
- Added copied-vector coordinate central differences and a locked `h=10^-1...10^-9` sweep with analytic/numerical values, absolute/scaled-relative errors, tolerance, and pass/fail/kink status.
- Refactored `simulateLossFunctions()` to preserve one deterministic `TrainingSnapshot` while removing its duplicate MSE, MAE, clipped probability-BCE, and gradient formula authority.

## Task Commits

Each TDD task was committed through explicit RED and GREEN gates:

1. **Task 1 RED: Lock guarded loss primitive behavior** — `3381a4b` (test)
2. **Task 1 GREEN: Implement guarded loss primitives** — `f10b1e8` (feat)
3. **Task 2 RED: Lock finite-difference and simulation behavior** — `9480157` (test)
4. **Task 2 GREEN: Add finite differences and refactor simulation** — `01a96a2` (feat)

## Files Created/Modified

- `src/simulations/lossFunctionsMath.ts` — Pure loss, gradient, stability-probe, guard, and finite-difference authority.
- `tests/loss-functions-math.test.ts` — Deterministic value, gradient, guard, probe, kink, sweep, and simulation-regression coverage.
- `src/simulations/lossFunctions.ts` — Existing orchestration refactored to consume the pure authority while retaining likelihood/NLL/MLE/Softmax support and snapshot shape.
- `src/utils/datasets.ts` — Uses an explicit `.ts` runtime import so the seeded dataset dependency is resolvable by the Node regression test.
- `.planning/phases/26-loss-functions-rebuild/deferred-items.md` — Records both historical Phase-25-only planning assertions found by the optional full suite.

## Decisions Made

- Stable logit-domain BCE is canonical everywhere in the loss snapshot; clipped probability BCE exists only in the explicit comparison result.
- MAE at zero residual uses subgradient convention `0`, `differentiable: false`, and `status: kink`; a near-zero symmetric difference cannot produce `pass`.
- The locked sweep uses nine powers of ten from `10^-1` through `10^-9`, with `5e-7` as the published smooth-point absolute-error tolerance.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Made the seeded dataset dependency directly resolvable in the Node regression test**

- **Found during:** Task 2 GREEN simulation-regression verification
- **Issue:** `lossFunctions.ts` could use explicit TypeScript imports, but its existing `src/utils/datasets.ts` dependency still imported `./rng` without an extension, so Node 24 could not load the simulation during the focused test.
- **Fix:** Changed only that runtime import to `./rng.ts`; no dataset behavior or generated content changed.
- **Files modified:** `src/utils/datasets.ts`
- **Verification:** `node --test tests/loss-functions-math.test.ts` passes 13/13 and `npm run build` passes.
- **Committed in:** `01a96a2`

---

**Total deviations:** 1 auto-fixed (1 blocking issue)

**Impact on plan:** The fix is a module-resolution-only change required for the planned simulation regression; it does not alter dataset generation or broaden Phase 26 behavior.

## Issues Encountered

- The optional repository-wide `npm test` still fails two pre-existing historical assertions in `tests/curriculumMilestoneAudit.test.ts` and `tests/python-data-tools-contract.test.ts`; both hardcode Phase 25 planning-state text while the repository is executing Phase 26. This was already identified in Plan 26-01 for the Python contract and is now recorded for both files in `deferred-items.md`. The Phase 26 loss suite passes 13/13.
- Production build succeeds with the existing Vite warning for chunks larger than 1400 kB.

## Known Stubs

None.

## Threat Flags

None. This plan adds only guarded DOM-free transforms and no endpoint, authentication path, file-access surface, or schema boundary.

## User Setup Required

None - no package, secret, account, or external service was added.

## Next Phase Readiness

- Plans 26-03 and 26-04 can consume the same loss/gradient/finite-difference contract when generating NumPy candidates and locked Notebook outputs.
- Vue and lesson-content migration remain untouched for their assigned later plans.
- No module ID, route, checkpoint, Progress store, dataset, Notebook, or public asset changed.

## Self-Check: PASSED

- All four implementation/test files exist and all four RED/GREEN task commits resolve.
- Focused loss tests pass 13/13 and production build succeeds.
- Source inspection confirms `lossFunctions.ts` imports the pure authority and contains no duplicate local MSE, MAE, canonical BCE, or clipping helper.
- No `Self-Check: FAILED` marker, blocking stub, or untracked generated output exists.

---
*Phase: 26-loss-functions-rebuild*
*Completed: 2026-07-28*
