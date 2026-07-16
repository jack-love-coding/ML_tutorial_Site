---
phase: python-data-tools-stage-4
plan: "06"
subsystem: dependency-security
tags: [python-data-tools, plotly, supply-chain, npm, human-approval]

requires:
  - phase: python-data-tools-stage-3
    provides: Plotly.py 6.9.0 output assets whose embedded Plotly.js runtime is 3.7.0
  - phase: python-data-tools-stage-4-research
    provides: SUS classification and the required exact-version package-legitimacy gate
provides:
  - Current npm registry provenance and integrity audit for the two exact Plotly packages
  - Explicit human approval for plotly.js-basic-dist-min 3.7.0 and @types/plotly.js 3.0.10
  - Cleared dependency-security prerequisite for Plan 07 without mutating package files
affects: [python-data-tools-stage-4-07, plotly-runtime, dependency-lock]

tech-stack:
  added: []
  patterns:
    - Read-only registry audit followed by blocking exact-version human approval
    - Dependency installation remains isolated in the downstream installation plan

key-files:
  created:
    - docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-06-SUMMARY.md
  modified: []

key-decisions:
  - "The user explicitly approved exactly plotly.js-basic-dist-min@3.7.0 and @types/plotly.js@3.0.10 after reviewing the current read-only registry audit."
  - "Approval clears Plan 07 to install only those exact versions; Plan 06 performs no package, lock, import, or source mutation."

patterns-established:
  - "Supply-chain gate: official repository, install-script surface, exact version, registry integrity, and runtime compatibility are checked before dependency mutation."

requirements-completed: [R4, R8]

coverage:
  - id: D1
    description: Current registry metadata identifies both exact packages, their official repositories, install-script surface, and integrity hashes before installation.
    requirement: R4
    verification:
      - kind: manual_procedural
        ref: npm view plotly.js-basic-dist-min@3.7.0 name version repository scripts dist.integrity && npm view @types/plotly.js@3.0.10 name version repository scripts dist.integrity
        status: pass
    human_judgment: false
  - id: D2
    description: The approved Plotly.js version matches the 3.7.0 runtime embedded by the locked Stage 3 Plotly.py 6.9.0 environment.
    requirement: R8
    verification:
      - kind: integration
        ref: .python-data-tools-venv/bin/python -c "import plotly; from plotly.offline.offline import get_plotlyjs_version"
        status: pass
    human_judgment: false
  - id: D3
    description: The user explicitly approved the two exact versions while package.json and package-lock.json remained byte-identical to HEAD.
    requirement: R4
    verification:
      - kind: manual_procedural
        ref: User response on 2026-07-16 was “批准”; git diff --exit-code -- package.json package-lock.json
        status: pass
    human_judgment: true
    rationale: Package legitimacy approval is an intentionally blocking human supply-chain decision and cannot be inferred from automation or silence.

duration: 4 min
completed: 2026-07-16
status: complete
---

# Phase python-data-tools-stage-4 Plan 06: Plotly Package Approval Summary

**A current registry and runtime-compatibility audit cleared two exact official Plotly packages for downstream installation, with explicit human approval and no dependency mutation.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-07-16T14:23:00Z
- **Completed:** 2026-07-16T14:27:30Z
- **Tasks:** 2
- **Files modified:** 1 documentation file

## Accomplishments

- Reconfirmed that `plotly.js-basic-dist-min@3.7.0` resolves to the official `plotly/plotly.js` repository and has registry integrity `sha512-84KPQhLTrO5IHu6DCte2KwA4bzSoVIdIs3uDPWid3sgeTX8L5RjpDARjCG3spgOwQ8MYE8PL+MeQ0DQRWA1Emw==`; npm returned no package install scripts.
- Reconfirmed that `@types/plotly.js@3.0.10` resolves to `DefinitelyTyped/DefinitelyTyped` at `types/plotly.js`, has registry integrity `sha512-q+MgO4aajC2HrO7FllTYWzrpdfbTjboSMfjkz/aXKjg1v7HNo1zMEFfAW7quKfk6SL+bH74A5ThBEps/7hZxOA==`, and declares an empty scripts object.
- Verified the locked Stage 3 environment reports Plotly.py `6.9.0` with embedded Plotly.js `3.7.0`, then recorded the user's explicit approval of both exact npm versions.
- Kept `package.json` and `package-lock.json` byte-identical to their `HEAD` blobs; installation remains exclusively owned by Plan 07.

## Task Commits

Neither task produced a task-level file commit:

1. **Task 1: Re-run the read-only Plotly package legitimacy audit** - no commit (read-only registry and runtime audit)
2. **Task 2: Approve or reject the exact Plotly packages** - no task commit (explicit human decision recorded by this summary)

The plan metadata commit contains only this summary.

## Registry Provenance and Integrity

| Package | Exact version | Repository provenance | Install scripts | Registry integrity |
| --- | --- | --- | --- | --- |
| `plotly.js-basic-dist-min` | `3.7.0` | `git+https://github.com/plotly/plotly.js.git` | none returned | `sha512-84KPQhLTrO5IHu6DCte2KwA4bzSoVIdIs3uDPWid3sgeTX8L5RjpDARjCG3spgOwQ8MYE8PL+MeQ0DQRWA1Emw==` |
| `@types/plotly.js` | `3.0.10` | `https://github.com/DefinitelyTyped/DefinitelyTyped.git`, directory `types/plotly.js` | `{}` | `sha512-q+MgO4aajC2HrO7FllTYWzrpdfbTjboSMfjkz/aXKjg1v7HNo1zMEFfAW7quKfk6SL+bH74A5ThBEps/7hZxOA==` |

The Stage 4 research classified the Plotly bundle as SUS only because the release was new, not because of a provenance, integrity, install-script, or runtime-version mismatch. The current audit found no changed risk signal.

## Approval Decision

- **Decision:** approved.
- **Approval signal:** the user replied `批准` on 2026-07-16 after the audit was presented.
- **Approved scope:** exactly `plotly.js-basic-dist-min@3.7.0` and `@types/plotly.js@3.0.10`.
- **Effect:** Plan 07 may install these exact versions and update the dependency lock in its own isolated task.
- **Not authorized:** version substitution, CDN loading, another Plotly bundle, or installation during Plan 06.

## Files Created/Modified

- `docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-06-SUMMARY.md` - Records registry facts, exact-version approval, unchanged package-file verification, and downstream scope.

## Decisions Made

- Accepted the exact basic Plotly bundle and matching type package after confirming official provenance, integrity metadata, absence of install behavior, and Stage 3 runtime compatibility.
- Preserved the plan boundary: approval is recorded now, while package installation and lockfile changes remain Plan 07 work.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Verification

- `npm view plotly.js-basic-dist-min@3.7.0 name version repository scripts dist.integrity`: pass; exact version, official Plotly repository, no scripts field, and integrity hash confirmed.
- `npm view @types/plotly.js@3.0.10 name version repository scripts dist.integrity`: pass; exact version, DefinitelyTyped repository/directory, empty scripts object, and integrity hash confirmed.
- `.python-data-tools-venv/bin/python` runtime probe: pass; Plotly.py `6.9.0`, Plotly.js `3.7.0`.
- `git diff --exit-code -- package.json package-lock.json`: pass.
- Worktree/HEAD blob comparison: pass; `package.json` is `346ca6a8f20741802d47da69fe3026f6a6a9b6d7` and `package-lock.json` is `24ac103f1bb9beea535d3f783ffbb470fb83db73` in both locations.
- `npm test`, `npm run build`, and `npm run build:pages`: not run; this checkpoint created documentation only and did not change runtime, dependencies, routes, or assets.

## Known Stubs

None.

## User Setup Required

None - the required human approval is complete, and Plan 07 owns the automated package installation.

## Next Phase Readiness

- Plan 07's package legitimacy prerequisite is satisfied for the two exact approved versions.
- Plan 07 must still install with exact pins, verify resulting lockfile provenance/integrity, and run its planned output/build gates.
- No package or source changes were made in Plan 06.

## Self-Check: PASSED

- This summary exists at the plan's required output path.
- Current npm metadata, exact integrity hashes, official repositories, install-script surface, and Stage 3 Plotly.js runtime match were rechecked.
- `package.json` and `package-lock.json` match their `HEAD` blobs and have no working-tree diff.
- The user provided an explicit approval signal for both exact versions.
- `docs/gpt_advice.md` remains the only unrelated untracked file and was not read, modified, staged, or committed.

---
*Phase: python-data-tools-stage-4*
*Completed: 2026-07-16*
