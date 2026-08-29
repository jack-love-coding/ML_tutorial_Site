---
phase: 26-loss-functions-rebuild
plan: "03"
subsystem: reproducible-assets
tags: [python-stdlib, nbclient, offline-wheels, bilingual-notebooks, atomic-staging]

requires:
  - phase: 26-loss-functions-rebuild
    plan: "01"
    provides: Pinned and locally verified LaDe-D Jilin and UCI SECOM source contracts
  - phase: 26-loss-functions-rebuild
    plan: "02"
    provides: Stable MSE, MAE, BCE, and finite-difference numerical authority
provides:
  - One indivisible 16-member candidate inventory across two datasets, two topics, and four locales
  - Shared ordered code cells with separate zh-CN/en markdown dictionaries and paired blueprint parity
  - Exact offline eight-pin environment verification against the audited 99-wheel cache
  - Four fresh-kernel NotebookClient job contracts and a cleanup-safe ignored staging transaction
affects: [26-04-candidate-generation, 26-05-atomic-publication, 26-06-content-integration]

tech-stack:
  added: []
  patterns:
    - Standard-library outer generator with isolated pinned Notebook execution
    - Complete-package staging contract with no topic or locale subset selection
    - Runtime-only random kernelspec identity with stable published proof IDs

key-files:
  created:
    - scripts/loss-functions/requirements.txt
    - scripts/loss-functions/environment-contract.json
    - tests/loss-functions-notebook-assets.test.ts
  modified:
    - scripts/loss-functions/build-phase-26-assets.py
    - .gitignore

key-decisions:
  - "Treat the exact 16 candidate paths as one package and reject every partial topic or locale selector."
  - "Reuse the Numerical Methods eight-pin requirements byte-for-byte and validate every existing wheel hash; Phase 26 adds no package or cache bootstrap path."
  - "Keep random isolated kernelspec names runtime-only while four stable proof IDs distinguish the required locale executions."
  - "Plans 26-03/04 may create only the ignored staging transaction; public publication remains exclusively owned by Plan 26-05."

patterns-established:
  - "Candidate contract: two datasets, two manifests, attribution, four Notebooks, two summaries, two plots, requirements, environment, and one manifest move as one inventory."
  - "Locale contract: each topic owns one code-cell sequence and two markdown dictionaries; code IDs/sources are structurally identical across locale blueprints."
  - "Environment contract: requirements, Python, platform, wheel manifest, every wheel byte/hash, and offline pip arguments fail closed before candidate work."

requirements-completed: [LOSS-01, LOSS-02, LOSS-03]

coverage:
  - id: D1
    description: One complete staging-only candidate inventory and shared bilingual code contract are enforced
    requirement: LOSS-01
    verification:
      - kind: unit
        ref: "tests/loss-functions-notebook-assets.test.ts#candidate inventory is complete and indivisible"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-notebook-assets.test.ts#shared code and locale dictionaries produce paired notebooks with exact code parity"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-notebook-assets.test.ts#staging candidate modes reject public roots and partial locale or topic selectors"
        status: pass
    human_judgment: false
  - id: D2
    description: The exact audited Python environment and wheel cache are verified offline with no added package
    requirement: LOSS-03
    verification:
      - kind: unit
        ref: "tests/loss-functions-notebook-assets.test.ts#environment requirements exactly reuse the audited Numerical Methods pins"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-notebook-assets.test.ts#environment verification rejects Python platform requirements and wheel cache drift"
        status: pass
      - kind: integration
        ref: "python3 scripts/loss-functions/build-phase-26-assets.py --verify-environment --offline"
        status: pass
    human_judgment: false
  - id: D3
    description: Four bounded fresh-kernel jobs and a failure-cleaning candidate transaction are ready for Plan 26-04
    requirement: LOSS-02
    verification:
      - kind: unit
        ref: "tests/loss-functions-notebook-assets.test.ts#kernel jobs lock NotebookClient execution and deterministic normalization"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-notebook-assets.test.ts#candidate transaction creates a fresh root and cleanup removes failed candidates"
        status: pass
      - kind: unit
        ref: "tests/loss-functions-notebook-assets.test.ts#network shell HTML and widget code are forbidden from candidate notebooks"
        status: pass
    human_judgment: false

duration: 15 min
completed: 2026-07-28
status: complete
---

# Phase 26 Plan 03: Shared Notebook and Candidate Pipeline Summary

**A staging-only 16-member candidate contract now binds two datasets, four bilingual Notebook executions, exact offline wheels, shared code cells, and failure cleanup before any learner-facing asset can exist.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-07-28T13:46:34Z
- **Completed:** 2026-07-28T14:02:03Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Froze one exact 16-path inventory covering both normalized datasets/manifests, attribution, four locale Notebooks, two JSON summaries, two plots, requirements, environment, and one output manifest.
- Added one ordered shared code-cell source per topic, separate complete zh-CN/en markdown dictionaries, paired blueprint parity, stable cell/topic/locale IDs, and forbidden network/shell/raw-HTML/widget guards.
- Reused the exact Numerical Methods eight-pin requirements and audited 99-wheel cache, failing closed on requirements, Python, platform, manifest, wheel-name, byte-size, or SHA-256 drift.
- Prepared four explicit NotebookClient jobs with clean execution counts, `allow_errors=False`, an explicit working directory/kernel, timing/widget cleanup, and a fresh ignored staging transaction that deletes failed candidates.

## Task Commits

Each TDD task was committed through explicit RED and GREEN gates:

1. **Task 1 RED: Freeze candidate and bilingual shared-code behavior** — `877cc78` (test)
2. **Task 1 GREEN: Define the complete staging-only candidate inventory** — `bcc2b53` (feat)
3. **Task 2 RED: Freeze environment, kernel, and transaction behavior** — `d0bf68d` (test)
4. **Task 2 GREEN: Verify the isolated environment and transaction shell** — `284a670` (feat)

## Files Created/Modified

- `scripts/loss-functions/build-phase-26-assets.py` — Candidate inventory, topic/locale blueprints, code safety, offline environment validation, isolated venv/kernel, Notebook worker contract, and staging transaction.
- `scripts/loss-functions/requirements.txt` — Byte-identical copy of the existing audited eight Python pins.
- `scripts/loss-functions/environment-contract.json` — Requirements, Python/platform, 99-wheel manifest, offline installation, and four-job execution identity.
- `tests/loss-functions-notebook-assets.test.ts` — Nine candidate, locale, environment, kernel, safety, and cleanup contract tests.
- `.gitignore` — Exact ignore boundary for `.cache/loss-functions/phase-26-staging`.

## Decisions Made

- The package cannot be selected or verified by topic/locale subset; all 16 members and all four jobs are always assembled before candidate work.
- Phase 26 points to the existing audited Batch 4 wheelhouse and copies its requirements bytes exactly rather than creating another dependency set or download mode.
- Temporary venv paths and randomized kernelspec names are never written to the environment contract or proof records; stable proof IDs identify each topic/locale execution.
- `--prepare-candidates` creates only a fresh ignored transaction shell. Plan 26-04 owns transformations and four executions; Plan 26-05 owns the complete public swap.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `state.update-progress` correctly reported 3/7 summaries and 43%, but the known handler limitation left nested frontmatter `progress.percent` at `0`. The registered handlers still advanced the body to Plan 4, updated `completed_plans`, patched `current_plan` to `26-04`, and updated ROADMAP to 3/7; the nested percentage was recorded once and not bypassed with a direct STATE edit.

## Validation

- `python3 -m py_compile scripts/loss-functions/build-phase-26-assets.py` — passed.
- `python3 scripts/loss-functions/build-phase-26-assets.py --verify-environment --offline` — passed; exact pins installed from 99 audited wheels, then the temporary venv/kernelspec/scoped state were removed.
- `node --test tests/loss-functions-notebook-assets.test.ts` — passed 9/9.
- `node --test tests/loss-functions-dataset-contract.test.ts tests/loss-functions-notebook-assets.test.ts` — passed 17/17.
- `npm test` — passed 786/786.
- `git check-ignore -q .cache/loss-functions/phase-26-staging` and the public-tree diff gate — passed.
- `npm run build` and `npm run build:pages` were not run because this plan changes only the Python build pipeline, contracts, ignore rule, and Node contract tests; no Vue/TypeScript runtime or public asset changed.

## Known Stubs

None. Candidate transformations, four actual Notebook executions, and public publication are deliberately absent phase boundaries owned by Plans 26-04 and 26-05, not incomplete Plan 26-03 behavior.

## User Setup Required

None - no package, secret, external account, or runtime service was added.

## Next Phase Readiness

- Plan 26-04 can enter one fresh staging transaction, transform both verified sources, materialize all 16 members, and execute the four prepared jobs independently.
- Environment, cache, locale, safety, and cleanup drift now fail before candidate work.
- The public tree remains unchanged; Plan 26-05 is still the sole publication boundary.

## Self-Check: PASSED

- All five implementation/test/contract files exist.
- All four Task 1–2 RED/GREEN commits exist in order.
- The 9/9 plan suite, 17/17 combined Phase 26 contract suite, 786/786 repository suite, offline isolated-environment verification, ignore check, and no-publication gate pass.

---
*Phase: 26-loss-functions-rebuild*
*Completed: 2026-07-28*
