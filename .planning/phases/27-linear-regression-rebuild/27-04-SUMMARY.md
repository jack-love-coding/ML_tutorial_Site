---
phase: 27-linear-regression-rebuild
plan: "04"
subsystem: reproducible-assets
tags: [atomic-publication, offline-rerun, bike-sharing, bilingual-notebooks, rollback]

requires:
  - phase: 27-linear-regression-rebuild
    plan: "03"
    provides: Frozen nine-member Bike regression candidate with two clean-kernel proofs
provides:
  - Exact nine-member Bike regression Notebook package under public/notebooks/linear-regression
  - One lock-scoped complete-directory transaction for absent and seeded targets
  - Exact byte-and-mode rollback across every injected transaction failure and interruption
  - Two independent external network-blocked Notebook reruns with regenerated output parity
  - Root and GitHub Pages base-path, repository immutability, and public integrity gates
affects: [27-05-runtime-assets, 27-06-course-content, 27-08-release, linear-regression]

tech-stack:
  added: []
  patterns:
    - Frozen candidate-generator provenance separated from later publication code identity
    - Validate-copy-lock-directory-swap-final-verify with exact absence or backup restoration
    - One external temporary package and fresh kernel per locale with loopback-only Jupyter transport
    - Git-visible repository hash, byte-size, and mtime snapshot around offline verification

key-files:
  created:
    - public/notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb
    - public/notebooks/linear-regression/bike-linear-regression.en.ipynb
    - public/notebooks/linear-regression/linear-regression-summary.json
    - public/notebooks/linear-regression/gradient-descent-trace.csv
    - public/notebooks/linear-regression/coefficients.csv
    - public/notebooks/linear-regression/heldout-residuals.csv
    - public/notebooks/linear-regression/requirements.txt
    - public/notebooks/linear-regression/environment.json
    - public/notebooks/linear-regression/output-manifest.json
  modified:
    - scripts/linear-regression/build-phase-27-assets.py
    - tests/linear-regression-notebook-assets.test.ts

key-decisions:
  - "Treat the validated Plan 27-03 manifest and its notebooks/linear-regression/environment.json member as the immutable nine-member authority, rather than rewriting bytes to match stale plan path examples."
  - "Keep the Plan 27-03 generator SHA-256 frozen in publication verification so later publisher and offline-check edits cannot retroactively invalidate or rewrite the candidate."
  - "Publish one complete directory: absent targets require no backup, while existing complete targets move to backup and are restored by rename on any failure or interrupt."
  - "Rerun each locale Notebook in a separate external package and fresh kernel, then independently regenerate and byte-compare the summary and three CSV outputs."

patterns-established:
  - "Atomic directory boundary: the canonical public target changes only through one complete directory rename after candidate and private-copy verification."
  - "Exact rollback: injected candidate, preparation, backup, target, post-move, final-verification, cleanup, and interruption failures restore prior absence or prior bytes and permission modes."
  - "Read-only offline proof: external network is blocked, local dataset inputs are copied outside the repository, and every git-visible entry must retain its hash, size, and mtime."

requirements-completed: [LINR-02, LINR-03, LINR-04]

coverage:
  - id: D1
    description: Complete-only publication supports absent and seeded targets without mixed generations
    requirement: LINR-03
    verification:
      - kind: integration
        ref: "tests/linear-regression-notebook-assets.test.ts#publication succeeds from an absent target as one complete directory move"
        status: pass
      - kind: integration
        ref: "tests/linear-regression-notebook-assets.test.ts#replacement succeeds from a seeded existing target without partial visibility or residue"
        status: pass
    human_judgment: false
  - id: D2
    description: Every transaction failure restores exact prior state and rejects corrupted packages before public mutation
    requirement: LINR-04
    verification:
      - kind: integration
        ref: "tests/linear-regression-notebook-assets.test.ts#rollback restores absent or seeded targets after every transaction-stage failure and interrupt"
        status: pass
      - kind: integration
        ref: "tests/linear-regression-notebook-assets.test.ts#publication corruption matrix fails before public mutation and removes private residue"
        status: pass
    human_judgment: false
  - id: D3
    description: Both public locale Notebooks reproduce offline and leave repository bytes, sizes, and mtimes unchanged
    requirement: LINR-02
    verification:
      - kind: integration
        ref: "python3 scripts/linear-regression/build-phase-27-assets.py --check --offline"
        status: pass
      - kind: integration
        ref: "tests/linear-regression-notebook-assets.test.ts#offline rerun independently reproduces both public Notebooks without repository writes"
        status: pass
    human_judgment: false

duration: 22 min
completed: 2026-07-29
status: complete
---

# Phase 27 Plan 04: Atomic Bike Asset Publication Summary

**The exact 704,691-byte Bike regression package now publishes as one rollback-safe public directory, with both bilingual Notebooks independently reproduced offline under network and repository-immutability gates.**

## Performance

- **Duration:** 22 min
- **Started:** 2026-07-29T11:43:45Z
- **Completed:** 2026-07-29T12:05:25Z
- **Tasks:** 3
- **Files modified:** 11 implementation, test, and public package files, plus this summary

## Accomplishments

- Published exactly nine learner-visible members from the verified Plan 27-03 candidate without regenerating or hand-editing any Notebook, JSON, CSV, requirements, environment, or manifest byte.
- Added a single complete-package CLI with a lock-scoped directory transaction for first publication and replacement, exact byte/mode rollback, and cleanup after failures or interrupts.
- Rejected missing/extra files, source/split/feature/scaler/residual/tolerance/metric/environment/generator drift, malformed CSV, nonfinite JSON, code/output parity changes, hash drift, lock contention, and partial selectors before public acceptance.
- Independently reran the Chinese and English Notebooks in separate external packages and fresh kernels with external DNS/socket access blocked, then regenerated and byte-compared the summary, gradient trace, coefficient table, and complete 3,476-row residual output.
- Proved all nine public paths resolve locally under both `/` and `/ML_tutorial_Site/`, and that offline verification leaves every git-visible repository hash, byte size, and mtime unchanged.

## Task Commits

1. **Task 27-04-01 RED: Add failing atomic publication contract** — `ab6e3f0` (test)
2. **Task 27-04-01 GREEN: Add rollback-safe package publisher** — `eedeffd` (feat)
3. **Task 27-04-02: Publish verified Bike Notebook package** — `4704293` (feat)
4. **Task 27-04-03: Prove offline public reproducibility** — `b995482` (feat)

## Files Created/Modified

- `scripts/linear-regression/build-phase-27-assets.py` — Frozen-provenance public validator, lock, atomic directory publisher, exact rollback, isolated rerun worker, regenerated-output comparison, and read-only repository gate.
- `tests/linear-regression-notebook-assets.test.ts` — Absent/seeded publication, failure/interruption, byte/mode, lock, corruption, public integrity, offline, network, repository-clean, and base-path coverage.
- `public/notebooks/linear-regression/` — Exact two Notebooks, summary, three CSVs, requirements, environment, and output manifest from one verified generation.

## Decisions Made

- The verified Plan 27-03 on-disk package is authoritative. Its exact path layout uses `notebooks/linear-regression/` under staging and names the environment member `environment.json`; publication preserves that package instead of rewriting it to match stale plan examples.
- Candidate validation uses the frozen creating-generator SHA-256 `c7220cb2c10bc73cfe1ec68de023e0f64e873c44218dc1692e31ffbd8b0e5047`, while the current script may safely evolve publication and verification behavior.
- The canonical target is one ownership directory. Initial publication performs one complete target move with no backup; replacement first renames the prior complete target into a private backup.
- Offline verification does not trust repository execution state: each locale receives its own external package and fresh kernel, with only local copied dataset inputs and the exact audited no-index environment.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reconciled stale staging and environment path examples with the validated Plan 27-03 authority**

- **Found during:** Task 27-04-01 required-read gate
- **Issue:** The plan examples referenced `.cache/linear-regression/phase-27-staging/public/notebooks/.../environment-contract.json`, while the completed and verified Plan 27-03 manifest owns `.cache/linear-regression/phase-27-staging/notebooks/.../environment.json`.
- **Fix:** Used the completed 27-03 package and manifest as instructed, preserved all nine names and bytes, and published the directory to the canonical `public/notebooks/linear-regression/` target.
- **Files modified:** `scripts/linear-regression/build-phase-27-assets.py`, `tests/linear-regression-notebook-assets.test.ts`, `public/notebooks/linear-regression/**`
- **Verification:** Public and candidate directory snapshots are byte-and-mode identical; manifest inventory and all public hashes pass.
- **Committed in:** `eedeffd`, `4704293`

---

**Total deviations:** 1 auto-fixed Rule 3 blocking path reconciliation.
**Impact on plan:** The change avoids invalidating the already verified generation and preserves the intended exact nine-member public package, atomicity, integrity, and offline behavior.

## Issues Encountered

- The first full Notebook-suite run retained two earlier staging-only assertions that expected `--check` and the public target not to exist. They were updated to the completed Plan 27-04 lifecycle contract, and the rerun passed 30/30.
- No package installation, authentication, external service, architectural decision, or blocking checkpoint was encountered.

## Validation

- Task 27-04-01 focused publication/rollback/corruption matrix — passed 14/14.
- `python3 scripts/linear-regression/build-phase-27-assets.py --publish-candidates --staging-root .cache/linear-regression/phase-27-staging` — passed once from an absent target; published 9 members totaling 704,691 bytes.
- Task 27-04-02 public inventory/hash/strict-JSON/CSV/parity group — passed 6/6.
- `python3 scripts/linear-regression/build-phase-27-assets.py --check --offline` — passed; 2 independent external Notebook reruns, network blocked, 1,354 repository entries byte/size/mtime-clean.
- `node --test tests/linear-regression-notebook-assets.test.ts` — passed 30/30.
- `npm test` — passed 877/877.
- Exact public/candidate byte-and-mode comparison, transaction-residue scan, protected-file SHA-256 check, `python3 -m py_compile`, and `git diff --check` — passed.
- `npm run build` and `npm run build:pages` were not run because this plan publishes offline Notebook/data assets and does not yet add a runtime registry, route, Vue component, TypeScript consumer, or style change; root and Pages path behavior is covered directly in the focused test.

## Known Stubs

- `tests/linear-regression-notebook-assets.test.ts:722` — The literal `"placeholder"` is an intentional malformed-candidate inventory fixture; it is not learner-facing data or incomplete implementation.

## User Setup Required

None - publication and verification use the committed local Bike snapshot and existing audited offline wheelhouse; no secret, account, registry, or manual action is required.

## Next Phase Readiness

- Plan 27-05 can bind its typed runtime registry and strict parsers to the exact public manifest and nine local assets.
- The public package has complete hashes, two locale parity proofs, 3,476 downloadable residual rows, deterministic output files, and root/Pages resolution coverage.
- No lock, backup, private transaction, kernel, external environment, or temporary package residue remains.

## Self-Check: PASSED

- All 11 plan-owned implementation/test/public files and this summary exist.
- Task commits `ab6e3f0`, `eedeffd`, `4704293`, and `b995482` are present in Git history in RED/GREEN/task order.
- The public directory contains exactly nine members and matches the frozen candidate byte-for-byte and mode-for-mode.
- Focused publication, public integrity, offline rerun, full Notebook, 877-test repository, residue, protected-workspace, and diff checks pass.

---
*Phase: 27-linear-regression-rebuild*
*Completed: 2026-07-29*
