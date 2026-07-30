---
phase: 27-linear-regression-rebuild
plan: "11"
subsystem: release-verification
tags: [linear-regression, notebooks, playwright, github-pages, offline-reproduction]

requires:
  - phase: 27-09
    provides: "One audited source/package/facade numerical authority"
  - phase: 27-10
    provides: "Six package-backed semantic workbench controls, 36-case browser matrix, and Phase 28 bridge"
provides:
  - "Truthful Plan 27-03 declarations for the actual ignored staging root and environment.json"
  - "Complete fail-fast release proof across offline reproduction, tests, builds, semantic UI, Pages, security, and workspace hygiene"
  - "Verified bilingual Phase 28 housing-project handoff with all six workbench outputs"
affects: [phase-28, linear-regression-release, curriculum-handoff]

tech-stack:
  added: []
  patterns:
    - "Historical artifact declarations point to the real ignored transaction tree rather than compatibility aliases"
    - "Release completion requires one fail-fast root-preview, Pages, security, and workspace-scope chain"

key-files:
  created:
    - .planning/phases/27-linear-regression-rebuild/27-11-SUMMARY.md
  modified:
    - .planning/phases/27-linear-regression-rebuild/27-03-PLAN.md

key-decisions:
  - "Correct historical metadata to the actual phase-27-staging/notebooks tree and environment.json without creating a compatibility tree or changing published assets."
  - "Keep Task 2 verification-only: pause on the first browser failure, resolve it in a separate debug workflow, then rerun the unchanged full gate from the beginning."
  - "Treat a release matrix pass as cases=36, failures=0, four six-check semantic interaction passes, and eight successful failure injections."

patterns-established:
  - "Immutable release audit: offline Notebook reproduction must leave repository bytes, sizes, and mtimes unchanged."
  - "Exact cleanup audit: the gate-owned browser session, preview PID, listener, and temporary directory must all be absent after exit."

requirements-completed: [LINR-01, LINR-02, LINR-03, LINR-04]

coverage:
  - id: D1
    description: "Plan 27-03 names the actual nine-member ignored staging package without changing the public package."
    verification:
      - kind: other
        ref: "Task 27-11-01 declaration/filesystem/public-diff command"
        status: pass
    human_judgment: false
  - id: D2
    description: "Affine prediction, residual/MSE gradients, coefficient spaces, and the source/package/facade equality chain remain consistent."
    requirement: LINR-01
    verification:
      - kind: integration
        ref: "node --test tests/linear-regression-*.test.* tests/algorithm-progress.test.ts tests/curriculumProgress.test.ts tests/python-and-housing-modules.test.mjs"
        status: pass
    human_judgment: false
  - id: D3
    description: "The locked NumPy batch-gradient trace reproduces offline and changes its matching browser output."
    requirement: LINR-02
    verification:
      - kind: e2e
        ref: "scripts/linear-regression/build-phase-27-assets.py --check --offline plus strict 36-case semantic matrix"
        status: pass
    human_judgment: false
  - id: D4
    description: "NumPy gradient descent, NumPy least squares, and sklearn remain tied to the same design and expose matching semantic output."
    requirement: LINR-03
    verification:
      - kind: automated_ui
        ref: "scripts/qa/linearRegressionBrowserMatrix.js method semantic check across zh-CN/en and desktop/mobile-390"
        status: pass
    human_judgment: false
  - id: D5
    description: "Held-out cases and atemp coefficient stability remain package-backed, interactive, and bilingual."
    requirement: LINR-04
    verification:
      - kind: automated_ui
        ref: "scripts/qa/linearRegressionBrowserMatrix.js heldoutCase and atempComparison checks across four locale/viewport pairs"
        status: pass
    human_judgment: false
  - id: D6
    description: "Root and Pages builds, the Phase 28 bridge, failure fallbacks, security audit, and protected workspace scope pass one fail-fast gate."
    verification:
      - kind: e2e
        ref: "Task 27-11-02 complete multiline automated gate"
        status: pass
    human_judgment: false

duration: 50min
completed: 2026-07-30
status: complete
---

# Phase 27 Plan 11: Staging Metadata and Complete Release Gate Summary

**Historical staging declarations now match the real nine-file transaction tree, backed by a clean offline-to-browser release proof with 36/36 semantic cases and zero vulnerabilities.**

## Performance

- **Duration:** 50 min total, including the blocking gate investigation; final clean rerun took 6 min 33 sec
- **Started:** 2026-07-30T08:22:50Z
- **Completed:** 2026-07-30T09:12:54Z
- **Tasks:** 2
- **Files modified:** 2 Plan 27-11 files

## Accomplishments

- Corrected all stale Plan 27-03 candidate declarations from the nonexistent `phase-27-staging/public/notebooks/...` tree to the actual ignored `phase-27-staging/notebooks/...` tree and changed the staged environment member to `environment.json`.
- Reproduced both published Notebooks with network access blocked and confirmed all nine package members without changing repository bytes, sizes, mtimes, or public assets.
- Passed the full release chain: 144 focused tests, the full test suite, standard and GitHub Pages builds, the exact semantic browser matrix, focused base/no-remote checks, security audit, and protected/scope/diff hygiene.
- Proved all four `zh-CN`/`en` × `desktop`/`mobile-390` interaction runs have all six semantic checks true, and all eight failure injections preserve the audited fallback without console errors or warnings.

## Task Commits

1. **Task 27-11-01: Correct the historical staging contract without changing the build** — `e7f28ef` (`docs`)
2. **Task 27-11-02: Run the complete semantic release gate** — verification-only; no product commit

Separate debug workflow commits used between the blocked run and the full rerun:

- `62b3f10` — contained the nested cockpit and corrected DOM-semantic probes with regression coverage
- `31f414e` — archived the resolved `phase27-mobile-toggle-click` investigation
- `6998400` — recorded the resolution in the debug knowledge base

## Files Created/Modified

- `.planning/phases/27-linear-regression-rebuild/27-03-PLAN.md` — truthful ignored staging root and `environment.json` declarations
- `.planning/phases/27-linear-regression-rebuild/27-11-SUMMARY.md` — complete execution, interruption, rerun, and release-gate record

The separate debug workflow changed `src/styles/modules/linear-regression-responsive.css`, `scripts/qa/linearRegressionBrowserMatrix.js`, `tests/linear-regression-layout.test.mjs`, and `tests/linear-regression-release.test.mjs`; Plan 27-11 did not edit those files.

## Verification Results

### Historical metadata and immutable package

- Task 1's declaration verifier found all nine staged candidates at `.cache/linear-regression/phase-27-staging/notebooks/linear-regression/`.
- No declaration retains the stale `phase-27-staging/public/notebooks` root or staged `environment-contract.json` name.
- `git diff --exit-code -- public/notebooks/linear-regression` passed.
- Offline check passed with network blocked: 9 members, 2 independently rerun public Notebooks, and 1,376 repository entries byte/size/mtime-clean.

### Tests and builds

- Focused Phase 27/progress/curriculum suite: 144 passed, 0 failed, 0 skipped.
- Full `npm test`: passed under the fail-fast chain.
- `npm run build`: passed; only the existing chunk-size advisory was emitted.
- `npm run build:pages`: passed; only the existing chunk-size advisory was emitted.
- Pages/base/asset/download/Phase 28/semantic-output selection: 11 passed, 0 failed.
- No-remote/scope/cross-authority selection: 5 passed, 0 failed.
- `npm run security:audit`: passed with 0 vulnerabilities.

### Semantic production matrix

- Exact matrix totals: `cases=36`, `failures=0`.
- Exact dimensions: locales `zh-CN`, `en`; viewports `desktop`, `mobile-390`.
- Four unique interaction records passed, one for each locale/viewport pair.
- Every interaction record returned all six named semantic checks as `true`: `rowBatch`, `gdTrace`, `method`, `coefficientSpace`, `heldoutCase`, and `atempComparison`.
- Eight unique `summary-failure`/`summary-corruption` injections passed with fallback visible, no full-data metric leak, no console errors, and zero warnings.
- The bilingual final bridge resolved to `/learn/housing-price-project` and retained the approved linear-model/tabular-regression boundary.

### Cleanup and workspace hygiene

- The gate-owned `phase-27-gap-*` Playwright session was closed and absent from the post-run session list.
- No preview process or TCP listener remained on port 4173.
- No `/tmp/phase-27-gap-gate.*` directory or gate output file remained.
- The index was empty after the gate.
- Worktree status remained exactly ` M .planning/config.json` and `?? docs/gpt_advice.md` before this summary was created.
- Protected hashes remained exact:
  - `.planning/config.json`: `a30166790b1080df599345c645cd3b38a797d2c8f9ce42bad32075f76d4e958a`
  - `docs/gpt_advice.md`: `31958b9a46fe97c6770228109d47594846ab26b3cdeed4be9bcb3b9d9b729f86`
- Pre-existing Phase 25 and debug-named browser sessions were present before the rerun and intentionally left untouched; none was created or used by this gate.
- `git diff --check` and the staged/worktree allowlist checks passed with no generated residue.

## Decisions Made

- Correct the historical claim rather than create files at a false compatibility path; audit truth takes precedence over preserving stale prose.
- Preserve the published nine-file package byte-for-byte while validating it through the existing offline generator.
- Keep Plan 27-11 verification-only after the UI failure. The root cause and regression tests were handled in a separate debug workflow, then the exact Plan 27-11 gate was rerun unchanged from its first command.
- Require machine-readable semantic evidence for completion; no manual visual exception or partial matrix result was accepted.

## Deviations from Plan

### Procedural deviation: gate paused for an independently resolved blocker

- **Found during:** Task 27-11-02's first exact full gate run
- **Issue:** Playwright could not click the atemp toggle because the nested desktop cockpit overflowed its narrower course column. Once contained, previously masked runner probes also incorrectly excluded CSS-hidden DOM semantics and approved hyphenated English boundary terms.
- **Handling:** Plan 27-11 stopped at the first failure without changing implementation. A separate debug workflow produced `62b3f10`, `31f414e`, and `6998400`; this executor then reran the complete unchanged gate from the beginning.
- **Impact:** No Plan 27-11 scope expansion and no skipped verification. The final proof includes every originally required stage.

**Total deviations:** 1 procedural interruption; 0 executor auto-fixes and 0 Plan 27-11 product-file changes.

## Issues Encountered

- The initial release run passed offline reproduction, focused/full tests, and the standard build, then timed out on `.linear-regression-lab .toggle-strip__button` because the intended control was outside the desktop viewport.
- The resolved investigation proved the root cause with runtime geometry, added a scoped containment regression, and fixed exact DOM-semantic QA probes without weakening numerical assertions.
- The final rerun started from offline reproduction rather than resuming after the browser stage and completed with exit code 0.

## Known Stubs

None. Plan 27-11 created only truthful planning and verification records; no incomplete runtime or mock-data path was introduced.

## Authentication Gates

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 27 now has a complete, machine-checked release record for all four LINR requirements.
- The existing `/learn/housing-price-project` bridge is verified in both locales and viewports, so Phase 28 can build on the audited linear-regression boundary.
- No Plan 27-11 blocker remains.

## Self-Check: PASSED

- Summary file exists and contains the required frontmatter, complete status, requirement IDs, and coverage records.
- Task 1 and all three referenced debug commits exist.
- Stub scan, public-package no-diff check, protected hashes, cleanup checks, and `git diff --check` all passed.

---
*Phase: 27-linear-regression-rebuild*
*Completed: 2026-07-30*
