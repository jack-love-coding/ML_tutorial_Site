---
phase: 26-loss-functions-rebuild
plan: "05"
subsystem: reproducible-assets
tags: [atomic-publication, offline-rerun, bilingual-notebooks, rollback, public-assets]

requires:
  - phase: 26-loss-functions-rebuild
    plan: "04"
    provides: Exact validated 16-member LaDe and SECOM candidate package with four clean-kernel proofs
provides:
  - Exact 16-member loss-functions dataset and Notebook package in the two canonical public groups
  - One lock-scoped two-group publication transaction with pre/mid/post-swap rollback and cleanup
  - Four independent network-blocked public Notebook reruns from the pinned offline wheelhouse
  - Failure-closed public hashes, locale parity, strict JSON, SECOM schema, corruption, and base-path verification
affects: [26-06-content-integration, 26-07-final-verification, loss-functions-course]

tech-stack:
  added: []
  patterns:
    - Validate-copy-lock-swap-verify publication across two owned public groups
    - Frozen candidate generator identity separated from later publication code identity
    - One external temporary package and fresh kernel per standalone public Notebook rerun
    - Loopback-only socket policy permitting local Jupyter transport while rejecting external network access

key-files:
  created:
    - public/datasets/loss-functions/
    - public/notebooks/loss-functions/
  modified:
    - scripts/loss-functions/build-phase-26-assets.py
    - tests/loss-functions-notebook-assets.test.ts
    - tests/loss-functions-dataset-contract.test.ts

key-decisions:
  - "Publish only the byte-identical Plan 26-04 staging package: exactly 16 members totaling 22,011,681 bytes."
  - "Treat datasets/loss-functions and notebooks/loss-functions as one lock-scoped transaction, restoring both groups after any pre-, mid-, or post-swap failure."
  - "Keep the candidate manifest bound to the frozen Plan 26-04 generator hash while the Plan 26-05 publisher evolves independently."
  - "Prove standalone reproducibility by rerunning each public Notebook in its own external temporary package and fresh network-blocked kernel using only the pinned offline wheelhouse."

patterns-established:
  - "Atomic public boundary: validate the complete candidate before locking, stage both groups, swap both, validate published bytes, then remove backups and lock."
  - "Repository-clean rerun gate: snapshot hash, size, and mtime for every git-visible entry before four isolated executions and require exact equality afterward."
  - "Public portability gate: every Notebook reference resolves locally under both root and /ML_tutorial_Site/ public bases, with no remote runtime asset URL."

requirements-completed: [LOSS-01, LOSS-02, LOSS-03]

coverage:
  - id: D1
    description: The complete validated package publishes once as an indivisible two-group transaction and rolls back cleanly at every injected failure point
    requirement: LOSS-03
    verification:
      - kind: integration
        ref: "tests/loss-functions-notebook-assets.test.ts#publication atomically swaps both owned groups with the exact complete inventory"
        status: pass
      - kind: integration
        ref: "tests/loss-functions-notebook-assets.test.ts#publication rollback restores both previous groups after pre mid or post swap failure"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-notebook-assets.test.ts#publication refuses unexpected inventory and candidate hash drift before replacing public bytes"
        status: pass
    human_judgment: false
  - id: D2
    description: All four public bilingual Notebooks reproduce independently from pinned offline inputs with network blocked and without repository writes
    requirement: LOSS-02
    verification:
      - kind: integration
        ref: "python3 scripts/loss-functions/build-phase-26-assets.py --check --offline"
        status: pass
      - kind: integration
        ref: "tests/loss-functions-notebook-assets.test.ts#offline check reruns all four public Notebooks standalone without repository writes"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-notebook-assets.test.ts#public hash and locale parity corruption fail closed before standalone acceptance"
        status: pass
    human_judgment: false
  - id: D3
    description: Public provenance, hashes, strict finite JSON, 590/591 SECOM contract, exact inventory, and both deployment base paths remain locked
    requirement: LOSS-01
    verification:
      - kind: integration
        ref: "tests/loss-functions-notebook-assets.test.ts#public hashes strict finite statuses and SECOM 590 591 schema remain locked"
        status: pass
      - kind: integration
        ref: "tests/loss-functions-notebook-assets.test.ts#public assets resolve locally for root and ML_tutorial_Site base paths"
        status: pass
      - kind: regression
        ref: "npm test"
        status: pass
    human_judgment: false

duration: 26 min
completed: 2026-07-28
status: complete
---

# Phase 26 Plan 05: Atomic Loss Asset Publication Summary

**The exact 22,011,681-byte LaDe/SECOM package now lives in two canonical public groups behind an atomic rollback-safe publisher, with all four bilingual Notebooks independently reproduced offline under a network-blocked clean-kernel gate.**

## Performance

- **Duration:** 26 min
- **Started:** 2026-07-28T14:58:04Z
- **Completed:** 2026-07-28T15:24:11Z
- **Tasks:** 2
- **Files modified:** 19 tracked implementation, test, dataset, Notebook, manifest, environment, and plot files, plus this summary

## Accomplishments

- Published exactly five dataset members and eleven Notebook/output/environment members from the validated ignored staging package, preserving every candidate byte and excluding unrelated public files.
- Added an explicit publication CLI that refuses topic/locale subsets, unexpected members, missing/corrupt hashes, or invalid standards JSON before touching public bytes.
- Implemented a lock-scoped two-group transaction with private staging, backup restoration after injected pre-, mid-, and post-swap failures, final byte verification, and cleanup of all transaction residue.
- Reran each of the four public `zh-CN`/`en` Notebooks in its own external temporary package and fresh kernel using the pinned no-index wheelhouse while external sockets were blocked.
- Locked code and normalized-output parity, regenerated summary/plot bytes, strict finite JSON, the SECOM declared-591/observed-590 contract, root/GitHub Pages asset resolution, and a hash/size/mtime-clean repository snapshot.

## Task Commits

Each TDD task was committed through explicit RED and GREEN gates:

1. **Task 1 RED: Specify complete atomic publication and rollback** — `5d1f667` (test)
2. **Task 1 GREEN: Publish the complete loss asset package atomically** — `1addc1d` (feat)
3. **Task 2 RED: Specify offline rerun and public integrity gates** — `6192854` (test)
4. **Task 2 GREEN: Prove offline public-package reproducibility** — `04c7810` (feat)
5. **Overall regression fix: Preserve frozen candidate generator identity** — `9f70360` (fix)

## Files Created/Modified

- `public/datasets/loss-functions/**` — Five exact public dataset, manifest, and attribution members.
- `public/notebooks/loss-functions/**` — Four executed bilingual Notebooks plus six output/manifest/environment members and pinned requirements.
- `scripts/loss-functions/build-phase-26-assets.py` — Complete-only publisher, atomic rollback transaction, public validator, isolated rerun worker, loopback-only network guard, and repository-clean offline check.
- `tests/loss-functions-notebook-assets.test.ts` — Publication, rollback, cleanup, corruption, strict-JSON, four-kernel, locale, hash, schema, repository-write, and base-path gates.
- `tests/loss-functions-dataset-contract.test.ts` — Frozen candidate generator identity assertion retained after publisher extension.

## Decisions Made

- The public package is the exact Plan 26-04 candidate, not a regenerated approximation. Its 16 relative paths, hashes, and 22,011,681 total bytes are the publication authority.
- Candidate provenance keeps the generator hash from the plan that generated and validated it. Plan 26-05 publication behavior is tested separately and cannot retroactively rewrite that identity.
- The two canonical public roots are one logical unit: neither is considered published unless both swap and the complete final package validates.
- Public Notebook reproducibility is proven outside the repository with one fresh kernel per Notebook. Only local loopback transport is permitted for Jupyter; external DNS and sockets fail closed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Preserved immutable candidate provenance after extending the generator script**

- **Found during:** Task 1 publication validation and overall repository regression
- **Issue:** Comparing the Plan 26-04 candidate manifests with the current Plan 26-05 script hash would reject or require rewriting already validated candidate bytes.
- **Fix:** Bound existing-candidate validation and the dataset contract to the exact frozen Plan 26-04 generator SHA-256 while new generation paths continue to use their own current script identity.
- **Files modified:** `scripts/loss-functions/build-phase-26-assets.py`, `tests/loss-functions-notebook-assets.test.ts`, `tests/loss-functions-dataset-contract.test.ts`
- **Verification:** Atomic publication suite passed 8/8; offline/public suite passed 20/20; repository suite passed 806/806.
- **Committed in:** `1addc1d`, `9f70360`

**2. [Rule 1 - Bug] Canonicalized executed Notebook stream representation before parity comparison**

- **Found during:** Task 2 standalone public rerun
- **Issue:** `nbclient` exposed stream text as an in-memory string while the committed canonical Notebook JSON represented the same lines as a list, causing a representation-only normalized-output mismatch.
- **Fix:** Serialized and reparsed each executed Notebook with `nbformat` before computing normalized output hashes, matching the canonical artifact representation without weakening numerical or byte checks.
- **Files modified:** `scripts/loss-functions/build-phase-26-assets.py`
- **Verification:** Four independently executed public Notebooks matched code, normalized output, summary, and plot proofs.
- **Committed in:** `04c7810`

**3. [Rule 1 - Bug] Narrowed transaction-residue detection to exact publisher artifacts**

- **Found during:** Task 2 focused verification
- **Issue:** A broad substring check treated an unrelated `lu_nxn_block.png` asset as a lock residue because its filename contains `lock`.
- **Fix:** Matched only exact `.loss-functions-publication-*` transaction components.
- **Files modified:** `tests/loss-functions-notebook-assets.test.ts`
- **Verification:** Focused offline/public integrity suite passed 20/20 without ignoring real publisher residue.
- **Committed in:** `04c7810`

---

**Total deviations:** 3 auto-fixed Rule 1 bugs.
**Impact on plan:** The fixes preserve immutable provenance, canonical Notebook comparison, and precise cleanup verification; they add no curriculum, UI, route, or dependency scope.

## Issues Encountered

- The first standalone rerun exposed only the equivalent `nbclient` stream representation difference described above; regenerated numerical summaries and plots were already byte-identical.
- `state.update-progress` correctly reported 5/7 summaries and 71%, but the known handler limitation left nested frontmatter `progress.percent` at `0`; the registered handlers still advanced the body and roadmap to Plan 6, and `current_plan` was aligned to `26-06`.
- No package installation, authentication, external service, architectural decision, or blocking checkpoint was encountered.

## Validation

- `node --test tests/loss-functions-notebook-assets.test.ts --test-name-pattern='publication'` — Task 1 publication suite passed 8/8.
- `python3 scripts/loss-functions/build-phase-26-assets.py --publish-candidates --staging-root .cache/loss-functions/phase-26-staging` — passed once; published exactly 16 members and 22,011,681 bytes.
- `python3 scripts/loss-functions/build-phase-26-assets.py --check --offline` — passed; network blocked, four public Notebooks independently rerun, and 1,311 git-visible entries remained hash/size/mtime-clean.
- `node --test tests/loss-functions-notebook-assets.test.ts` — final Plan 26-05 offline/public suite passed 20/20.
- `npm test` — passed 806/806.
- Exact public inventory, byte total, transaction-residue scan, stub scan, TDD commit ordering, and `git diff --check` — passed.
- `npm run build` and `npm run build:pages` were not run because this plan changes the reproducible asset publication pipeline and public non-runtime data/Notebook assets without changing Vue, TypeScript runtime imports, routes, components, or styles.

## Known Stubs

None. The publisher, rollback paths, four isolated Notebook reruns, strict validators, public assets, plots, manifests, and deployment-base checks are fully wired.

## User Setup Required

None - publication and verification reuse the locally audited source cache and pinned offline wheelhouse; no secret, account, or external service is required.

## Next Phase Readiness

- Plan 26-06 can wire the exact public dataset and Notebook paths into the existing curriculum adapters without generating or republishing assets.
- Plan 26-07 can treat the 16-member manifest, four standalone execution proofs, hashes, and base-path checks as the locked final-verification boundary.
- No Phase 26-06/07 curriculum, UI, route, or styling work was pulled into this plan.

## Self-Check: PASSED

- The script, both contract-test files, all 16 public members, and this SUMMARY exist.
- All five Task 1–2 RED/GREEN/fix commits exist in order.
- The public package has exactly 16 members totaling 22,011,681 bytes.
- The focused publication and offline suites, repository 806/806 suite, transaction-residue scan, and protected-workspace check pass.

---
*Phase: 26-loss-functions-rebuild*
*Completed: 2026-07-28*
