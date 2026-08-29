---
phase: 27-linear-regression-rebuild
plan: "02"
subsystem: reproducible-assets
tags: [bike-sharing, offline-wheels, bilingual-notebooks, fail-closed-staging, node-python-bridge]

requires:
  - phase: 26-loss-functions-rebuild
    provides: Exact eight-pin Python environment and audited 99-wheel offline cache
  - phase: 27-linear-regression-rebuild
    plan: "01"
    provides: Canonical Bike feature order, split, residual sign, and regression math authority
provides:
  - Thin deterministic JSON bridge to the committed Bike source/schema/hash authority
  - Exact offline two-kernel environment verification with temporary-state cleanup
  - One indivisible nine-member staging contract and shared bilingual Notebook blueprint
affects: [27-03-candidate-generation, 27-04-atomic-publication, 27-05-runtime-assets]

tech-stack:
  added: []
  patterns:
    - Existing Node source authority bridged into a standard-library Python outer process
    - Exact inherited wheel verification with no-index installation and scoped Jupyter state
    - Empty staging transaction shell before full candidate materialization

key-files:
  created:
    - scripts/linear-regression/verify-bike-source.mjs
    - scripts/linear-regression/build-phase-27-assets.py
    - scripts/linear-regression/requirements.txt
    - scripts/linear-regression/environment-contract.json
    - tests/linear-regression-notebook-assets.test.ts
  modified:
    - .gitignore

key-decisions:
  - "Use bikeSharingContract.mjs as the sole CSV/schema/hash authority; the Phase 27 bridge only projects its verified result into deterministic JSON."
  - "Reuse the Phase 26 requirements bytes and audited 99-wheel cache exactly; Phase 27 adds no package or registry path."
  - "Keep Plan 27-02 preparation as a fresh ignored empty transaction shell; Plan 27-03 owns all nine candidate bytes and Plan 27-04 alone owns public mutation."
  - "Generate both locale blueprints from one ordered code-cell tuple and separate complete markdown dictionaries."

patterns-established:
  - "Source bridge: validate manifest, dictionary, environment, requirements, snapshot, row order, and boundary records through the existing Bike authority."
  - "Candidate shell: reject public/remote roots, topic/locale/file subsets, unsafe code, stale source/environment identity, symlinks, and incomplete inventory."
  - "Teaching contract: freeze normal equation/正规方程 terminology, augmented-design/pseudoinverse mapping, stable lstsq rationale, and five deterministic row roles before calculation."

requirements-completed: [LINR-02, LINR-03, LINR-04]

coverage:
  - id: D1
    description: The committed 17,379-row Bike snapshot remains the sole source authority through a thin deterministic JSON bridge
    requirement: LINR-02
    verification:
      - kind: integration
        ref: "tests/linear-regression-notebook-assets.test.ts#source bridge delegates to the existing Bike authority and reports immutable boundaries"
        status: pass
      - kind: integration
        ref: "node scripts/linear-regression/verify-bike-source.mjs"
        status: pass
    human_judgment: false
  - id: D2
    description: Exact inherited pins and all 99 audited wheels verify in a temporary network-blocked venv and kernelspec with cleanup
    requirement: LINR-03
    verification:
      - kind: integration
        ref: "python3 scripts/linear-regression/build-phase-27-assets.py --verify-environment --offline"
        status: pass
      - kind: unit
        ref: "tests/linear-regression-notebook-assets.test.ts#environment shell validates every audited wheel and exact isolated settings"
        status: pass
    human_judgment: false
  - id: D3
    description: One nine-member non-public candidate contract binds shared locale code, bilingual teaching, two fresh kernels, safety, and cleanup
    requirement: LINR-04
    verification:
      - kind: integration
        ref: "tests/linear-regression-notebook-assets.test.ts#inventory shell exposes one exact package with no partial or public mode"
        status: pass
      - kind: unit
        ref: "tests/linear-regression-notebook-assets.test.ts#locale parity shell shares ordered code while localizing complete markdown"
        status: pass
      - kind: integration
        ref: "python3 scripts/linear-regression/build-phase-27-assets.py --prepare-candidates --staging-root .cache/linear-regression/phase-27-staging --offline"
        status: pass
    human_judgment: false

duration: 15 min
completed: 2026-07-29
status: complete
---

# Phase 27 Plan 02: Offline Bike Candidate Shell Summary

**A source-authority bridge, exact no-index environment, shared bilingual Notebook shell, and indivisible ignored transaction now block stale, unsafe, partial, or public candidate work before full-data generation.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-07-29T10:51:33Z
- **Completed:** 2026-07-29T11:06:33Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added a thin Node bridge that invokes the existing Bike parser/artifact/snapshot validators and emits the exact source SHA, 17,379 rows, schema, roles, target relationship, 13,903 split, and boundary records.
- Reused the Phase 26 requirements byte-for-byte and verified every audited wheel, package import, isolated interpreter, randomized kernelspec, no-index setting, and cleanup in a temporary scoped environment.
- Locked one exact nine-member candidate inventory, two independent locale jobs, one ordered code source, complete bilingual markdown, the augmented normal-equation mapping, and all five deterministic teaching-row roles.
- Enforced a staging-only preparation boundary: the successful Plan 27-02 transaction declares nine members but creates zero candidate files and cannot mutate `public/`.

## Task Commits

Each TDD task was committed through explicit RED and GREEN gates:

1. **Task 27-02-01 RED: Establish Notebook asset contracts** — `af2de5c` (test)
2. **Task 27-02-01 GREEN: Define offline candidate contract** — `00f9a0a` (feat)
3. **Task 27-02-02 RED: Add source and candidate shell tests** — `c547357` (test)
4. **Task 27-02-02 GREEN: Implement offline Bike candidate shell** — `9d60270` (feat)

## Files Created/Modified

- `scripts/linear-regression/verify-bike-source.mjs` — Existing-authority bridge for committed Bike identity, schema, roles, split, and boundary records.
- `scripts/linear-regression/build-phase-27-assets.py` — Standard-library environment, blueprint, inventory, staging, source, safety, and cleanup shell.
- `scripts/linear-regression/requirements.txt` — Byte-identical inherited eight-pin environment.
- `scripts/linear-regression/environment-contract.json` — Phase 27 two-job identity over the existing audited 99-wheel cache.
- `tests/linear-regression-notebook-assets.test.ts` — Wave 0 source/environment/kernel/locale/safety/staging tests plus explicit 27-03/04 owner boundaries.
- `.gitignore` — Exact `/.cache/linear-regression/phase-27-staging` exclusion.

## Decisions Made

- The bridge imports and invokes `bikeSharingContract.mjs`; it never implements another CSV parser, schema validator, or hash convention.
- The environment stays byte-identical to Phase 26 and installs only with `--no-index` from the audited local wheelhouse.
- `--prepare-candidates` validates the real source and real isolated environment, then creates only a fresh empty ignored transaction. Full candidate generation remains Plan 27-03 work.
- Publication and standalone public checking are absent from this CLI by design and remain exclusively owned by Plan 27-04.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Validation

- `python3 -m py_compile scripts/linear-regression/build-phase-27-assets.py` — passed.
- `node scripts/linear-regression/verify-bike-source.mjs` — passed; 17,379 rows, exact SHA-256, and 13,903/13,904 boundary instants.
- Focused source/inventory/environment/kernel/safety/staging/cleanup suite — passed 13/13.
- `node --test tests/linear-regression-notebook-assets.test.ts` — passed 17 current gates with 6 explicit future-owner TODOs and 0 failures.
- `python3 scripts/linear-regression/build-phase-27-assets.py --verify-environment --offline` — passed; isolated no-index environment and scoped state removed.
- `python3 scripts/linear-regression/build-phase-27-assets.py --prepare-candidates --staging-root .cache/linear-regression/phase-27-staging --offline` — passed; 9 declared members, 0 candidate files, no public mutation.
- `npm test` — passed 864, failed 0, with the same 6 Plan 27-03/04 TODOs across 870 tests.
- Requirements byte comparison, exact ignore check, `git diff --check`, and no-public-diff gate — passed.
- `npm run build` and `npm run build:pages` were not run because this plan changes only offline scripts, contracts, ignored staging, and Node contract tests; no Vue/runtime or public asset changed.

## Known Stubs

- `tests/linear-regression-notebook-assets.test.ts:585-590` — Six intentional `test.todo` cases name Plan 27-03 as owner of calculation/candidate verification and Plan 27-04 as owner of publication/rollback/offline/base-path verification. They do not block the Plan 27-02 source/environment/staging goal.
- `tests/linear-regression-notebook-assets.test.ts:570` — The string `placeholder` is temporary test-fixture content used only to assemble a synthetic complete inventory before injecting an unexpected file; it is not learner-facing or runtime data.

## Self-Check: PASSED

- All six task files and this summary exist.
- Task commits `af2de5c`, `00f9a0a`, `c547357`, and `9d60270` are present in Git history.
- The public Notebook target remains absent, and both protected user files remain unstaged.

## User Setup Required

None - no package, secret, external account, runtime service, or registry access was added.

## Next Phase Readiness

- Plan 27-03 can materialize all nine members inside the validated transaction, execute both locale Notebooks in distinct kernels, and turn its owned candidate/numerical TODOs green.
- Plan 27-04 retains the only public mutation boundary and its publication, rollback, standalone rerun, and base-path TODOs.
- The protected `.planning/config.json` and untracked `docs/gpt_advice.md` remain byte-identical and unstaged.

---
*Phase: 27-linear-regression-rebuild*
*Completed: 2026-07-29*
