---
phase: 26-loss-functions-rebuild
plan: "01"
subsystem: data-integrity
tags: [python-stdlib, dataset-provenance, privacy, sha256, offline-validation]

requires:
  - phase: v1.0-curriculum-foundation
    provides: Audited Numerical Methods generator, cache, strict-JSON, and atomic-publication patterns
provides:
  - Exact product-owner authorization and redistribution contract for LaDe-D Jilin
  - Fail-closed source bootstrap, offline verification, local generation, and read-only check modes
  - Validated ignored source cache for LaDe-D Jilin and UCI SECOM
affects: [26-03-notebook-pipeline, 26-04-candidate-generation, 26-05-atomic-publication]

tech-stack:
  added: []
  patterns:
    - Explicit network bootstrap separated from offline generation and verification
    - Source hash, schema, license, attribution, and privacy checks before candidate work

key-files:
  created:
    - docs/curriculum-v3/loss-functions/phase-26-data-contract.md
    - scripts/loss-functions/build-phase-26-assets.py
    - tests/loss-functions-dataset-contract.test.ts
    - .planning/phases/26-loss-functions-rebuild/deferred-items.md
  modified:
    - .gitignore

key-decisions:
  - "Authorize only LaDe-D Jilin revision be2cec02775cafc8d52230303f32134382bcc50b under the recorded approve-lade boundary."
  - "Publishable LaDe candidates retain exactly eight coarse/auditable fields and remove all order, courier, AOI identifier, and GPS fields."
  - "Preserve SECOM's upstream declaration of 591 features alongside the observed 590 raw values instead of repairing the source."

patterns-established:
  - "Fail-closed source cache: validate approval, contract, SHA-256, license, schema, rows, and privacy before accepting cached bytes."
  - "Strict teaching JSON: represent non-finite probes with status plus null and serialize with allow_nan disabled."

requirements-completed: [LOSS-01, LOSS-02, LOSS-03]

coverage:
  - id: D1
    description: Exact LaDe-D authorization, attribution, source, and privacy boundary is versioned and executable
    requirement: LOSS-02
    verification:
      - kind: unit
        ref: "tests/loss-functions-dataset-contract.test.ts#Phase 26 contract freezes the exact approved dual-source identities"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-dataset-contract.test.ts#authorization drift fails closed before generation"
        status: pass
    human_judgment: false
  - id: D2
    description: Generator separates explicit online bootstrap from offline generation, verification, and read-only byte checks
    requirement: LOSS-03
    verification:
      - kind: integration
        ref: "tests/loss-functions-dataset-contract.test.ts#source bootstrap, local generation, cache verification, and check are explicit exclusive modes"
        status: pass
      - kind: integration
        ref: "tests/loss-functions-dataset-contract.test.ts#--check is offline and read-only and rejects committed byte drift"
        status: pass
    human_judgment: false
  - id: D3
    description: Exact LaDe and SECOM sources pass hash, row, timestamp, privacy, missing-value, label, and 590/591 validation
    requirement: LOSS-01
    verification:
      - kind: integration
        ref: "python3 scripts/loss-functions/build-phase-26-assets.py --verify-source-cache --source-cache .cache/loss-functions/phase-26-sources --offline"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-dataset-contract.test.ts#LaDe validation locks row count, timestamp rollover, schema, and privacy-minimized candidates"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-dataset-contract.test.ts#SECOM validation preserves missing values and enforces labels plus the declared 591 observed 590 contract"
        status: pass
    human_judgment: false

duration: 18 min
completed: 2026-07-28
status: complete
---

# Phase 26 Plan 01: Real-Data Authorization and Source Contract Summary

**Pinned LaDe-D Jilin and UCI SECOM sources now cross an executable license, privacy, hash, and schema gate before any Phase 26 learner asset can be generated or published.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-07-28T13:01:45Z
- **Completed:** 2026-07-28T13:19:44Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Recorded the exact 2026-07-28 `approve-lade` authorization, attribution evidence, revision/hash, eight-field publication allowlist, and explicit privacy removals.
- Built a standard-library CLI whose only network-capable mode is explicit source bootstrap; generation, verification, and checks require offline operation.
- Bootstrapped and validated the exact ignored source cache: 31,415 LaDe rows and 1,567 SECOM rows with 1,463 pass/104 fail labels, 41,951 preserved missing values, and the declared 591/observed 590 discrepancy.

## Task Commits

Each task was committed atomically:

1. **Task 1: Record and preflight the resolved LaDe-D authorization boundary** — `a8253f0`
2. **Task 2 RED: Freeze dual-dataset contract behavior** — `dfb5429`
3. **Task 2 GREEN: Implement fail-closed source contract CLI** — `870d970`
4. **Task 3 RED: Add source-validation failure injections** — `7ef19a9`
5. **Task 3 GREEN: Bootstrap and validate exact official sources** — `7fc1095`

## Files Created/Modified

- `docs/curriculum-v3/loss-functions/phase-26-data-contract.md` — Durable authorization, provenance, privacy, schema, and mode contract.
- `scripts/loss-functions/build-phase-26-assets.py` — Exact-source bootstrap and offline fail-closed validation entry point.
- `tests/loss-functions-dataset-contract.test.ts` — Source, mode, strict-JSON, privacy, timestamp, row, label, and schema failure injections.
- `.gitignore` — Ignores only the Phase 26 source-cache root added by this plan.
- `.planning/phases/26-loss-functions-rebuild/deferred-items.md` — Records the unrelated stale historical planning-state assertion found by the optional full suite.

## Decisions Made

- The `approve-lade` decision cannot be inherited by another revision, field set, dataset, or use; any drift stops generation.
- LaDe course IDs and source-row numbers are generated locally while order, region, courier, AOI identifier, and every GPS-related source field are removed.
- SECOM raw `NaN` values and the 591-declared/590-observed discrepancy remain source facts; validation rejects padding, truncation, imputation, or label substitution.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Repaired malformed execution-state position through registered handlers**

- **Found during:** Plan metadata closeout
- **Issue:** The pre-existing orchestrator state contained `Phase null` and `Plan: 1 of ?`, so `state.advance-plan` could not parse the current position.
- **Fix:** Used the registered `state.update`, `state.begin-phase`, `state.advance-plan`, and `state.patch` handlers to restore Phase 26, Plan 2 of 7, `current_plan: 26-02`, and `ready_to_execute`.
- **Files modified:** `.planning/STATE.md`
- **Verification:** STATE frontmatter/body and ROADMAP now record one completed summary and the next plan.
- **Committed in:** Plan metadata commit

The handler could not update nested `progress.percent` because this STATE format has no body `Progress:` field; that tooling limitation is recorded in `deferred-items.md` and was not bypassed with a direct STATE edit.

---

**Total deviations:** 1 auto-fixed (1 blocking state-format issue)

**Impact on plan:** Dataset work and all plan verification are unaffected; the next-plan position is usable, with one deferred derived-percentage field.

## Issues Encountered

- The optional repository-wide `npm test` found one pre-existing, unrelated failure in `tests/python-data-tools-contract.test.ts`: it hardcodes Phase 25 planning-state values even though the repository was already on Phase 26 before this plan began. The issue is recorded in `deferred-items.md`; the Plan 26-01 focused suite passes 8/8.

## Known Stubs

- `--generate` currently materializes only the audited source-contract candidate. Plans 26-03 and 26-04 own the complete candidate inventory, transformations, environments, and four Notebook executions.
- Default `--check` currently verifies the exact source cache; its read-only tree comparator is already tested, while Plan 26-05 owns regeneration and comparison of the complete committed public package.

Both extension points are intentional phase boundaries and do not block this plan's source-integrity goal.

## User Setup Required

None - the authorized source bootstrap was completed and the cache is local and ignored.

## Next Phase Readiness

- The exact source cache is ready for Plan 26-03's shared environment/candidate-pipeline contract and Plan 26-04's full transformations.
- No source bytes were written under `public/`; Plan 26-05 remains the sole public publication boundary.
- No package, route, checkpoint, Progress store, or learner-facing asset changed.

## Self-Check: PASSED

- All five implementation/documentation files exist.
- All five Task 1–3 RED/GREEN commits exist.
- Python compilation, offline cache verification, the 8/8 focused suite, ignore-path check, and no-publication assertions pass.

---
*Phase: 26-loss-functions-rebuild*
*Completed: 2026-07-28*
