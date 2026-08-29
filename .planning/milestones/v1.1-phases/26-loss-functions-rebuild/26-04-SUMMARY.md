---
phase: 26-loss-functions-rebuild
plan: "04"
subsystem: reproducible-assets
tags: [real-data, nbclient, bilingual-notebooks, stable-bce, offline-candidates]

requires:
  - phase: 26-loss-functions-rebuild
    plan: "01"
    provides: Exact locally cached LaDe-D Jilin and UCI SECOM source identities
  - phase: 26-loss-functions-rebuild
    plan: "02"
    provides: TypeScript MSE, MAE, stable BCE, and finite-difference numerical authority
  - phase: 26-loss-functions-rebuild
    plan: "03"
    provides: Indivisible 16-member candidate inventory, four-job kernel shell, and audited offline environment
provides:
  - Complete privacy-minimized 31,415-row LaDe and 1,567-row SECOM dataset candidates
  - Four independently executed bilingual Notebooks with exact locale code and output parity
  - Locked regression and BCE summaries, deterministic annotated PNG plots, and strict complete manifest
  - Failure-closed dataset, numerical, locale, output, environment, and corruption verification
affects: [26-05-atomic-publication, 26-06-content-integration, loss-functions-course]

tech-stack:
  added: []
  patterns:
    - Complete offline candidate generation inside one cleanup-safe ignored transaction
    - Explicit TypeScript-order floating-point aggregation for cross-runtime parity
    - Deterministic standard-library PNG generation with embedded accessibility metadata

key-files:
  created: []
  modified:
    - scripts/loss-functions/build-phase-26-assets.py
    - tests/loss-functions-dataset-contract.test.ts
    - tests/loss-functions-notebook-assets.test.ts

key-decisions:
  - "Preserve all 590 observed SECOM measurement fields and 41,951 missing values in the canonical CSV; train-fold imputation and OOF scores remain auxiliary Notebook inputs only."
  - "Use explicit left-fold means and the TypeScript branch sigmoid for exact cross-runtime diagnostics while retaining np.logaddexp as the canonical stable BCE implementation."
  - "Generate deterministic 960x540 labeled PNGs with the Python standard library so the audited eight-pin environment remains unchanged."
  - "Keep the exact 16-member package staging-only and indivisible; Plan 26-05 remains the sole public publication boundary."

patterns-established:
  - "Real-data contract: manifests bind source, generator, transformation, candidate hashes, privacy/schema policy, representative rows, units, labels, and missing-value behavior."
  - "Notebook parity contract: four fresh kernels execute independently, locale pairs share exact code IDs/sources/normalized outputs, and machine-specific kernel identities never enter artifacts."
  - "Candidate integrity contract: all 16 paths, strict JSON, deterministic plots, environment identities, standalone rerun expectations, and corruption probes verify before publication."

requirements-completed: [LOSS-01, LOSS-02, LOSS-03]

coverage:
  - id: D1
    description: Complete LaDe and SECOM transformations preserve approved rows, privacy, schema, labels, missing values, provenance, and deterministic teaching references
    requirement: LOSS-01
    verification:
      - kind: integration
        ref: "tests/loss-functions-dataset-contract.test.ts#LaDe candidate keeps all real rows, the eight-field privacy boundary, and representative loss arithmetic"
        status: pass
      - kind: integration
        ref: "tests/loss-functions-dataset-contract.test.ts#SECOM candidate preserves 590 measurements and missing values while publishing deterministic OOF auxiliary scores"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-dataset-contract.test.ts#candidate privacy, schema, license, and hash drift fail closed"
        status: pass
    human_judgment: false
  - id: D2
    description: Four bilingual Notebooks publish real regression and manufacturing loss behavior with exact TypeScript numerical and locale parity
    requirement: LOSS-02
    verification:
      - kind: integration
        ref: "tests/loss-functions-notebook-assets.test.ts#all four candidate Notebooks execute independently in clean kernels without errors"
        status: pass
      - kind: integration
        ref: "tests/loss-functions-notebook-assets.test.ts#real delivery rows expose full MSE MAE objectives and output-gradient parity"
        status: pass
      - kind: integration
        ref: "tests/loss-functions-notebook-assets.test.ts#real manufacturing BCE, fixed probes, gradients, and finite differences match TypeScript"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-notebook-assets.test.ts#locale pairs retain exact code cell IDs, sources, and normalized output hashes"
        status: pass
    human_judgment: false
  - id: D3
    description: One complete staging-only 16-member package passes manifest, strict-JSON, plot, environment, corruption, and no-publication gates
    requirement: LOSS-03
    verification:
      - kind: integration
        ref: "python3 scripts/loss-functions/build-phase-26-assets.py --verify-candidates --staging-root .cache/loss-functions/phase-26-staging --offline"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-notebook-assets.test.ts#complete candidate manifest covers all 16 members, hashes, requirements, and rerun expectations"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-notebook-assets.test.ts#candidate verification rejects changed output values and incomplete manifest inventory"
        status: pass
      - kind: other
        ref: "git check-ignore and public-tree diff gate"
        status: pass
    human_judgment: false

duration: 41 min
completed: 2026-07-28
status: complete
---

# Phase 26 Plan 04: Real-Data Notebook Candidate Package Summary

**A complete ignored 16-member package now transforms full LaDe and SECOM sources, executes four bilingual clean-kernel Notebooks, and locks real regression/BCE outputs, plots, provenance, and cross-runtime parity without changing public bytes.**

## Performance

- **Duration:** 41 min
- **Started:** 2026-07-28T14:09:35Z
- **Completed:** 2026-07-28T14:50:55Z
- **Tasks:** 2
- **Files modified:** 3 tracked implementation/test files plus 16 ignored candidate artifacts

## Accomplishments

- Transformed all 31,415 LaDe-D Jilin rows into the approved eight-field derivative, removed courier/GPS/location identifiers, derived rollover-safe finite durations, and bound the 175-minute reference with zero, kink, and long-duration representatives.
- Transformed all 1,567 SECOM rows with the declared-591/observed-590 discrepancy and all 41,951 missing measurements intact, mapped labels to 0/1, and produced deterministic five-fold train-only OOF scores with a real confident-error row.
- Executed delivery and manufacturing Notebooks separately for `zh-CN` and `en` in four fresh kernels; code cells and normalized outputs are exact across locale pairs.
- Produced strict regression/BCE summaries, fixed extreme-logit and `h=10^-1..10^-9` diagnostics, two deterministic 960×540 non-color-only plots, copied environment records, and one verified 16-path manifest.
- Enforced atomic staging cleanup, source/generator/artifact hashes, strict JSON, standalone rerun expectations, corruption rejection, and a zero-publication boundary.

## Task Commits

Each TDD task was committed through explicit RED and GREEN gates:

1. **Task 1 RED: Transform full LaDe and SECOM sources** — `683ada1` (test)
2. **Task 1 GREEN: Build validated real-data candidates** — `1512e32` (feat)
3. **Task 2 RED: Execute and validate four Notebook candidates** — `1c2ffa3` (test)
4. **Task 2 GREEN: Execute complete Notebook candidate package** — `b929226` (feat)
5. **Task 2 regression fix: Isolate the transaction failure probe** — `46a026b` (fix)

## Files Created/Modified

- `scripts/loss-functions/build-phase-26-assets.py` — Full source transformations, OOF baseline, four Notebook bodies, clean execution, strict summaries, deterministic PNG writer, complete manifest, and candidate verifier.
- `tests/loss-functions-dataset-contract.test.ts` — Full-row, privacy, schema, arithmetic, 590/591, OOF, hash, license, and failure-injection assertions.
- `tests/loss-functions-notebook-assets.test.ts` — Four-kernel, locale parity, cross-runtime numerical parity, plot, complete-manifest, corruption, and transaction-isolation assertions.
- `.cache/loss-functions/phase-26-staging/**` — Ignored complete 16-member candidate package; intentionally not committed.

## Decisions Made

- The SECOM CSV remains the canonical no-repair data artifact. Its 590 measurements and missing cells are preserved; fold-local median imputation, constant-feature removal, scaling, logistic predictions, and OOF scores are explicitly auxiliary teaching inputs.
- Regression aggregate calculations use explicit left-to-right division/addition matching JavaScript, avoiding Python 3.12's improved built-in `sum` algorithm from changing locked cross-runtime results.
- Fixed probability-domain BCE diagnostics use the same sign-branch sigmoid as TypeScript. Canonical stable logit BCE remains `np.logaddexp(0, z) - y*z`.
- The generator emits deterministic PNG bytes and accessibility-oriented labels/pattern metadata without adding Matplotlib or widening the audited environment.
- Manifest verification derives the complete inventory count and validates every non-self artifact hash while avoiding a recursive self-hash contract.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed cross-runtime floating-point drift in Notebook diagnostics**

- **Found during:** Task 2 (execute and validate four Notebook candidates)
- **Issue:** NumPy-derived sigmoid probabilities differed by one ULP at a fixed extreme logit, and Python 3.12's improved built-in `sum` differed from TypeScript's left-fold aggregate by about `2.3e-10`.
- **Fix:** Used the shared sign-branch sigmoid for probability-domain probes and an explicit left-fold mean for regression aggregates; retained `np.logaddexp` for the canonical stable BCE.
- **Files modified:** `scripts/loss-functions/build-phase-26-assets.py`, `tests/loss-functions-notebook-assets.test.ts`
- **Verification:** Candidate verifier passed; the specified cross-runtime/manifest suite passed 18/18.
- **Committed in:** `b929226`

**2. [Rule 1 - Bug] Prevented the transaction failure test from deleting the verified candidate package**

- **Found during:** Overall verification after Task 2
- **Issue:** The pre-existing transaction cleanup probe used the canonical staging root, so the full parallel test run could remove the package before new artifact tests read it.
- **Fix:** Ran the destructive transaction probe against its own temporary root while leaving production root validation unchanged.
- **Files modified:** `tests/loss-functions-notebook-assets.test.ts`
- **Verification:** The complete related suite passed 41/41 in parallel and the canonical 16-member package remained present.
- **Committed in:** `46a026b`

---

**Total deviations:** 2 auto-fixed Rule 1 bugs.
**Impact on plan:** Both fixes were required for deterministic cross-runtime correctness and reliable parallel verification; no new feature or publication scope was added.

## Issues Encountered

- The first cross-runtime run passed 15/18 checks. Detailed probes isolated one-ULP sigmoid propagation, Python 3.12 compensated summation, and failure-injection root handling; all three were resolved before Task 2 GREEN.
- `state.update-progress` correctly reported 4/7 summaries and 57%, but the known handler limitation left nested frontmatter `progress.percent` at `0`. The registered handlers still advanced the body to Plan 5, patched `current_plan` to `26-05`, recorded metrics/decisions/session, and updated ROADMAP to 4/7; the nested percentage was recorded once and not retried or edited directly.
- No package installation, authentication, external service, or public publication gate was encountered.

## Validation

- `python3 -m py_compile scripts/loss-functions/build-phase-26-assets.py` — passed.
- `python3 scripts/loss-functions/build-phase-26-assets.py --prepare-candidates --source-cache .cache/loss-functions/phase-26-sources --wheel-cache .cache/numerical-methods/batch-4-wheelhouse --staging-root .cache/loss-functions/phase-26-staging --offline` — passed; produced 16 members and four fresh-kernel proofs.
- `python3 scripts/loss-functions/build-phase-26-assets.py --verify-candidates --source-cache .cache/loss-functions/phase-26-sources --wheel-cache .cache/numerical-methods/batch-4-wheelhouse --staging-root .cache/loss-functions/phase-26-staging --offline` — passed.
- Focused cross-runtime/manifest/plot suite — passed 18/18.
- `node --test tests/loss-functions-dataset-contract.test.ts tests/loss-functions-notebook-assets.test.ts tests/loss-functions-math.test.ts` — passed 41/41.
- `npm test` — passed 797/797.
- Exact ignore gate, 16-file inventory check, and `git diff 0f36f645..HEAD -- public` — passed with no staged cache and no public change.
- `npm run build` and `npm run build:pages` were not run because this plan changes only the offline Python asset pipeline and Node contract tests; no Vue runtime, route, stylesheet, or public artifact changed.

## Known Stubs

None. Both full transformations, all four actual Notebook executions, summaries, plots, environment records, and the complete manifest are wired and verified. Public publication is an intentional Plan 26-05 boundary, not a Plan 26-04 stub.

## User Setup Required

None - generation reused the already audited offline wheel cache and requires no secret, account, or service.

## Next Phase Readiness

- Plan 26-05 can verify this exact ignored package again and atomically publish all 16 members as one transaction.
- Dataset privacy/schema, numerical parity, locale parity, plot metadata, environment identity, and artifact corruption now fail closed before publication.
- The public tree remains byte-unchanged and no candidate/cache file is staged or committed.

## Self-Check: PASSED

- All three tracked implementation/test files and this SUMMARY exist.
- All five Task 1–2 RED/GREEN/fix commits exist in order.
- The exact 16-member ignored candidate package and its manifest exist.
- The related 41/41 suite, repository 797/797 suite, candidate verifier, ignore gate, and zero-publication gate pass.

---
*Phase: 26-loss-functions-rebuild*
*Completed: 2026-07-28*
