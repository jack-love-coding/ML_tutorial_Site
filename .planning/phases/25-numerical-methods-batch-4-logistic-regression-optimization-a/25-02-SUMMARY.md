---
phase: 25-numerical-methods-batch-4-logistic-regression-optimization-a
plan: "02"
subsystem: numerical-methods-foundation
tags: [logistic-regression, scikit-learn, uci-banknote, reproducibility, wave-0-tests]

requires:
  - phase: 25-01
    provides: Durable approval for the exact official scikit-learn 1.9.0 distribution
provides:
  - Immutable numerical-methods-batch-4-v1 contract with explicit D-01 through D-29 clauses
  - Hash-audited local UCI Banknote snapshot with persisted deterministic splits and train-only statistics
  - Offline isolated eight-pin Python environment backed by an audited ignored wheel cache
  - Failing-first numerical and Manim validation surfaces with named downstream owners
affects: [25-03, 25-04, 25-05, 25-06, 25-07, 25-08, 25-09, 25-10, 25-11]

tech-stack:
  added: [scikit-learn 1.9.0]
  patterns: [hash-gated source refresh, no-index isolated execution, atomic asset publication, named Wave 0 contract groups]

key-files:
  created:
    - docs/curriculum-v3/numerical-methods/batch-4-contract.md
    - scripts/numerical-methods/generate-batch-4-notebook.py
    - public/datasets/numerical-methods/banknote-authentication.csv
    - public/datasets/numerical-methods/banknote-authentication-manifest.json
    - public/datasets/numerical-methods/banknote-authentication-data-dictionary.json
    - tests/numerical-methods-batch-4.test.ts
    - tests/numerical-methods-batch-4-manim.test.ts
  modified:
    - public/notebooks/numerical-methods/requirements.txt
    - .gitignore

key-decisions:
  - "Treat the persisted Banknote split and train-only population statistics as authoritative in both Notebook and browser implementations."
  - "Allow package networking only through the exact audited wheel-cache bootstrap; every task execution environment installs with pip --no-index."
  - "Keep UCI target wording at class 0/class 1 because the source does not define semantic class meanings."
  - "Keep future numerical, lesson, illustration, and media assertions deliberately RED with explicit owning plans."

patterns-established:
  - "Isolated Python boundary: validate requirements, Python/platform identity, and every wheel hash before creating a disposable venv and temp-prefix kernel."
  - "Dataset publication boundary: verify upstream ZIP/member bytes, compute the locked split in the isolated environment, validate the normalized assets, then replace all three files atomically."
  - "Wave 0 ownership: current dataset/contract/preservation/media scaffold groups pass while missing later artifacts fail in tests named for their owning plans."

requirements-completed: [P25-SC1, P25-SC2, P25-SC3, P25-SC4, P25-SC5]

coverage:
  - id: D1
    description: "The Batch 4 objective, five-run matrix, terminal taxonomy, tolerances, output IDs, and every D-01 through D-29 boundary are immutable."
    requirement: P25-SC1
    verification:
      - kind: unit
        ref: "tests/numerical-methods-batch-4.test.ts#Batch 4 contract and isolated environment boundary freeze every downstream constant"
        status: pass
    human_judgment: false
  - id: D2
    description: "The approved scikit-learn 1.9.0 pin runs inside a verified disposable eight-pin environment installed only from the audited local wheel cache."
    requirement: P25-SC2
    verification:
      - kind: other
        ref: "python3 scripts/numerical-methods/generate-batch-4-notebook.py --verify-environment --wheel-cache .cache/numerical-methods/batch-4-wheelhouse"
        status: pass
    human_judgment: false
  - id: D3
    description: "The local UCI Banknote CSV, manifest, and dictionary preserve exact provenance, hashes, schema, split counts, and train-only statistics."
    requirement: P25-SC3
    verification:
      - kind: unit
        ref: "tests/numerical-methods-batch-4.test.ts#Batch 4 dataset provenance, schema, hashes, split counts, and train statistics are locked"
        status: pass
    human_judgment: false
  - id: D4
    description: "Existing optimization and training-diagnostics routes, lab IDs, checkpoint IDs, progress key, and five synthetic scenarios are protected before additive implementation."
    requirement: P25-SC4
    verification:
      - kind: unit
        ref: "tests/numerical-methods-batch-4.test.ts#Batch 4 preservation scaffold locks routes, labs, checkpoints, progress, and synthetic scenarios"
        status: pass
    human_judgment: false
  - id: D5
    description: "The three canonical Notebook-bound media packages and every later numerical, lesson, illustration, and media surface have named failing-first owners."
    requirement: P25-SC5
    verification:
      - kind: unit
        ref: "tests/numerical-methods-batch-4-manim.test.ts#Batch 4 media contract scaffold locks three canonical Notebook-bound packages"
        status: pass
      - kind: other
        ref: "Full Wave 0 RED run: 4 current groups pass and 10 explicitly later-owned groups fail on missing production artifacts"
        status: pass
    human_judgment: false

duration: 23min
completed: 2026-07-22
status: complete
---

# Phase 25 Plan 02: Contract, Dataset, and Wave 0 Validation Summary

**Hash-audited UCI Banknote data, a disposable no-index scikit-learn environment, and explicit failing-first contracts now anchor every later Batch 4 implementation**

## Performance

- **Duration:** 23 min
- **Started:** 2026-07-22T08:27:45Z
- **Completed:** 2026-07-22T08:50:28Z
- **Tasks:** 3
- **Files modified by tasks:** 9

## Accomplishments

- Locked `numerical-methods-batch-4-v1`, every D-01 through D-29 clause, the five-run matrix, stable-BCE anchors, terminal semantics, tolerances, output IDs, and media IDs before downstream runtime work.
- Added the approved `scikit-learn==1.9.0` pin and implemented one explicit audited wheel-cache bootstrap plus fail-closed, disposable, `--no-index` execution environments and kernels.
- Published a verified 1,372-row UCI Banknote snapshot with exact ZIP/member hashes, stable IDs, persisted 960/206/206 splits, class counts, train-only population statistics, bilingual dictionary, and atomic rollback.
- Added Wave 0 suites whose four current dataset/contract/preservation/media groups pass while ten named future groups remain RED only for artifacts owned by Plans 25-03 through 25-11.

## Task Commits

Each task was committed atomically:

1. **Task 1: Freeze the Batch 4 contract, pin, and isolated environment** - `98871b8` (feat)
2. **Task 2: Publish the verified local Banknote snapshot** - `b671317` (feat)
3. **Task 3: Establish Wave 0 Batch 4 contract tests** - `be38943` (test)

**Plan metadata:** committed separately with this summary and execution tracking.

## Files Created/Modified

- `.gitignore` - Keeps the audited Batch 4 wheelhouse out of version control.
- `docs/curriculum-v3/numerical-methods/batch-4-contract.md` - Records the numerical, data, chapter, browser, and media boundary with explicit D-01 through D-29 clauses.
- `public/notebooks/numerical-methods/requirements.txt` - Adds the exact approved `scikit-learn==1.9.0` pin once.
- `scripts/numerical-methods/generate-batch-4-notebook.py` - Owns wheel-cache bootstrap, offline environment verification, hash-gated UCI refresh, validation, cleanup, and atomic publication.
- `public/datasets/numerical-methods/banknote-authentication.csv` - Stores the normalized local data and persisted split labels.
- `public/datasets/numerical-methods/banknote-authentication-manifest.json` - Stores provenance, integrity, environment, split, schema, and statistic anchors.
- `public/datasets/numerical-methods/banknote-authentication-data-dictionary.json` - Provides bilingual field definitions and auditable source/license/class-semantics notes.
- `tests/numerical-methods-batch-4.test.ts` - Defines current dataset/contract/preservation assertions and later numerical/course/illustration owners.
- `tests/numerical-methods-batch-4-manim.test.ts` - Defines the current media scaffold plus later six-role package, metadata, route-binding, renderer, and ffprobe owners.

## Decisions Made

- Browser and Notebook implementations must consume the persisted split rather than reproduce scikit-learn RNG behavior.
- Package installation has no implicit network fallback: the exact bootstrap command is required when the cache identity or hashes drift.
- Source refresh may download only the exact UCI ZIP; package installation during refresh still uses the audited cache with `--no-index`.
- Existing synthetic training scenarios remain distinct support examples and cannot be labeled as Banknote observations.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Ignored the audited wheel cache**
- **Found during:** Task 1
- **Issue:** The required local wheelhouse path had no precise ignore rule and could be staged accidentally.
- **Fix:** Added `.cache/numerical-methods/batch-4-wheelhouse/` to `.gitignore`.
- **Files modified:** `.gitignore`
- **Verification:** `git check-ignore -q .cache/numerical-methods/batch-4-wheelhouse/`
- **Committed in:** `98871b8`

**2. [Rule 3 - Blocking issue] Made disposable venv creation compatible with the active macOS CPython**
- **Found during:** Task 1
- **Issue:** A copied executable could not locate this uv-managed CPython's standard library, so `ensurepip` failed before offline installation.
- **Fix:** Use platform-appropriate symlinked venv executables on non-Windows systems while preserving a fresh disposable environment.
- **Files modified:** `scripts/numerical-methods/generate-batch-4-notebook.py`
- **Verification:** Offline eight-version import verification and temp-prefix kernel selection passed, followed by complete cleanup.
- **Committed in:** `98871b8`

**3. [Rule 1 - Contract bug] Expanded grouped decision ranges into explicit clauses**
- **Found during:** Task 3
- **Issue:** The initial contract summarized D-01 through D-29 in range bullets, so individual decision labels were not machine-auditable.
- **Fix:** Replaced grouped ranges with one explicit clause per decision while preserving all locked meanings.
- **Files modified:** `docs/curriculum-v3/numerical-methods/batch-4-contract.md`
- **Verification:** The contract test asserts every exact `**D-01:**` through `**D-29:**` label.
- **Committed in:** `be38943`

---

**Total deviations:** 3 auto-fixed (1 Rule 1, 1 Rule 2, 1 Rule 3)
**Impact on plan:** All three changes were required for correctness, isolation, or auditability; no product scope was added.

## Issues Encountered

- The first Wave 0 RED run caught both the grouped decision labels and an incorrect test assumption about the existing synthetic evaluator's `series` return field. The test now preserves the actual 12-point deterministic contract.
- A direct failure-injection exercise confirmed that replacing any one dataset artifact cannot leave a partial publication; all prior bytes were restored.

## TDD Gate Compliance

- Task 3 has a `test(25-02)` Wave 0 commit. Its current dataset/contract/preservation/media scaffold groups pass, while later production groups intentionally remain RED with explicit Plan 25-03 through 25-11 owners. No later production implementation belongs in this plan.

## Known Stubs

None. Empty collections in the generator are bounded parsing/validation accumulators; missing downstream artifacts are represented only by explicit failing-first tests with future plan ownership.

## User Setup Required

None - no external service configuration required. The ignored wheel cache has already been explicitly bootstrapped and audited in this workspace.

## Next Phase Readiness

- Plan 25-03 can generate the executed Chinese Notebook, full traces, numerical summaries, and manifest against one immutable contract and local dataset.
- Plans 25-04 through 25-11 have named filterable tests for their TypeScript, course, illustration, and Manim deliverables.
- No unresolved blocker remains; `docs/gpt_advice.md` and the orchestrator-owned `.planning/config.json` change were left untouched and unstaged.

## Self-Check: PASSED

- All nine task-created or modified files exist.
- Task commits `98871b8`, `b671317`, and `be38943` exist in Git history.
- Python compilation, dataset asset validation, explicit D-01 through D-29 checks, exact pin count, cache-ignore check, and `git diff --check` passed.
- The filtered main Wave 0 groups passed 3/3 and the media scaffold passed 1/1.
- The full Wave 0 RED run passed the four current groups and failed exactly ten named future groups on their absent later-plan artifacts.
- `docs/gpt_advice.md` remains unmodified and unstaged; `.planning/config.json` remains unstaged.

---
*Phase: 25-numerical-methods-batch-4-logistic-regression-optimization-a*
*Completed: 2026-07-22*
