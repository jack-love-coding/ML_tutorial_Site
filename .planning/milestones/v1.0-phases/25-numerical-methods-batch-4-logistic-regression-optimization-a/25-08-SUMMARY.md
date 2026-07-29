---
phase: 25-numerical-methods-batch-4-logistic-regression-optimization-a
plan: "08"
subsystem: numerical-methods-media
tags: [manim, logistic-regression, training-diagnostics, json, bilingual, accessibility]

requires:
  - phase: 25-03
    provides: Executed Banknote Notebook, exact five-run diagnostics summary, complete accepted-state traces, typed terminals, and compact endpoint report
provides:
  - Notebook-bound `BanknoteTrainingDiagnosticsScene` source for the canonical `banknote-training-diagnostics` scene ID
  - Depth-three six-role diagnostic teaching tree and verbose production prompt
  - Complete Chinese transcript, English summary, and bilingual label table with non-motion and non-color fallbacks
affects: [25-05, 25-10, 25-11, 25-12]

tech-stack:
  added: []
  patterns:
    - Manim source fails closed on exact diagnostic chains, hashes, accepted trace rows, best-validation markers, terminals, and endpoint-only report boundaries
    - Original/problem traces use dashed-square encoding while controlled-next traces use solid-circle encoding and best validation uses a written diamond marker

key-files:
  created:
    - scripts/manim/numerical_methods_batch_4/banknote_training_diagnostics.py
    - scripts/manim/numerical_methods_batch_4/banknote_training_diagnostics_prompt.md
    - scripts/manim/numerical_methods_batch_4/banknote_training_diagnostics_tree.json
    - docs/curriculum-v3/numerical-methods/manim/banknote-training-diagnostics-transcript.zh-CN.md
    - docs/curriculum-v3/numerical-methods/manim/banknote-training-diagnostics-summary.en.md
    - docs/curriculum-v3/numerical-methods/manim/banknote-training-diagnostics-labels.json
  modified: []

key-decisions:
  - "Validate all five locked four-step diagnoses at render time while focusing the animated teaching beats on the two required controlled comparisons."
  - "Format every learner-visible numerical anchor from the loaded JSON; expected constants exist only as fail-closed drift assertions."
  - "Keep best-validation and typed terminal markers distinct through written labels plus diamond, square, circle, dashed, and solid encodings."

patterns-established:
  - "Diagnostic action mapping: visible trace → plausible cause → exactly one variable change → expected next trace."
  - "Media provenance boundary: real Banknote traces are loaded locally; existing synthetic overfit/vanishing/exploding examples remain separate support content."
  - "Poster contract: the fully composed final beat carries both action mappings, four terminal meanings, marker semantics, and provenance without motion or color."

requirements-completed: [P25-SC5]

coverage:
  - id: D1
    description: The scene source loads the exact Plan 25-03 diagnostics summary and complete traces, validates all five four-step chains, and plots the two required real-data comparisons with exact markers and terminal semantics.
    requirement: P25-SC5
    verification:
      - kind: integration
        ref: "banknote_training_diagnostics.py#load_locked_inputs over 5 diagnoses and 1,222 accepted trace rows"
        status: pass
      - kind: other
        ref: "python3 -m py_compile scripts/manim/numerical_methods_batch_4/banknote_training_diagnostics.py"
        status: pass
    human_judgment: false
  - id: D2
    description: The six-role package includes an exact depth-three tree, production prompt, Chinese transcript, English summary, and unique bilingual labels with complete fallback and provenance boundaries.
    requirement: P25-SC5
    verification:
      - kind: unit
        ref: "tests/numerical-methods-batch-4-manim.test.ts#three six-role source packages are complete"
        status: pass
      - kind: other
        ref: "python3 -m json.tool plus jq depth, uniqueness, bilingual, fallback, and exact-output binding checks"
        status: pass
    human_judgment: false
  - id: D3
    description: The 65–72 second final beat is source-ready as a self-contained poster/reduced-motion frame with both one-variable mappings, four terminals, and non-color marker meanings.
    requirement: P25-SC5
    verification:
      - kind: other
        ref: "banknote_training_diagnostics.py#_poster_ready_conclusion source inspection"
        status: pass
    human_judgment: true
    rationale: Plan 25-11 owns rendering and visual poster verification; Plan 25-08 intentionally produces no MP4 or PNG.

duration: 13 min
completed: 2026-07-22
status: complete
---

# Phase 25 Plan 08: Banknote Training Diagnostics Manim Package Summary

**Runtime-audited real Banknote trace diagnosis with two controlled one-variable comparisons, distinct best/terminal semantics, and complete bilingual motion-independent fallbacks**

## Performance

- **Duration:** 13 min
- **Started:** 2026-07-22T11:03:32Z
- **Completed:** 2026-07-22T11:16:28Z
- **Tasks:** 1
- **Files modified:** 6

## Accomplishments

- Added `BanknoteTrainingDiagnosticsScene`, which fails closed unless the exact five diagnostic chains, output/hash links, 1,222 accepted states, best-validation rows, terminal records, selected checkpoint, and endpoint-only report all remain consistent.
- Taught `standardized-too-small → standardized-stable` and `standardized-too-large → standardized-armijo` as visible trace → plausible cause → one variable → expected next trace, with no scoring and no synthetic-as-Banknote claim.
- Added the complete six-role package and motion/color-independent fallbacks, including all five Plan 25-03 diagnostic chains and a poster-ready final beat for later rendering.

## Task Commits

Each task was committed atomically:

1. **Task 1: Author the training-diagnostics package from real trace patterns** - `de6c47d` (feat)

## Files Created/Modified

- `scripts/manim/numerical_methods_batch_4/banknote_training_diagnostics.py` - Exact JSON loaders/validators plus the seven-beat Banknote trace-diagnosis scene.
- `scripts/manim/numerical_methods_batch_4/banknote_training_diagnostics_prompt.md` - Six-stage production and renderer-handoff contract.
- `scripts/manim/numerical_methods_batch_4/banknote_training_diagnostics_tree.json` - Exact depth-three prerequisite and teaching structure.
- `docs/curriculum-v3/numerical-methods/manim/banknote-training-diagnostics-transcript.zh-CN.md` - Full Chinese no-motion transcript with all five locked diagnoses.
- `docs/curriculum-v3/numerical-methods/manim/banknote-training-diagnostics-summary.en.md` - English no-motion summary and bounded endpoint interpretation.
- `docs/curriculum-v3/numerical-methods/manim/banknote-training-diagnostics-labels.json` - Stable bilingual labels, exact value bindings, and fallback metadata.

## Decisions Made

- Validated all five diagnostic records at runtime so the source cannot silently accept a reordered or edited Plan 25-03 action chain, while keeping the animation itself bounded to the two required comparisons.
- Derived learner-visible numbers from loaded JSON instead of using presentation literals; expected numeric constants remain only as drift checks.
- Used dashed-square problem traces, solid-circle next traces, and diamond best markers with written kind/reason labels so color and motion are never the sole carriers of meaning.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed learner-visible numerical literals from the scene**
- **Found during:** Task 1 D-28 source audit
- **Issue:** The initial scene validated the exact trace anchors but still embedded a few values such as steps and terminal iterations directly in Chinese frame strings.
- **Fix:** Read all visible steps, accepted-step values, thresholds, iterations, confusion matrix values, and report anchors from the loaded summary/trace objects; retained constants only for fail-closed drift validation.
- **Files modified:** `scripts/manim/numerical_methods_batch_4/banknote_training_diagnostics.py`
- **Verification:** Runtime loader passed over all five diagnoses and 1,222 accepted rows; exact label/output bindings, Python compilation, and focused source tests passed.
- **Committed in:** `de6c47d`

---

**Total deviations:** 1 auto-fixed (1 Rule 1 bug)
**Impact on plan:** The correction strengthened D-28 auditability without changing the teaching scope, scene duration, or output package roles.

## Issues Encountered

- `requirements.mark-complete P25-SC5` returned `not_found` because `.planning/REQUIREMENTS.md` contains no Phase 25 `P25-SC5` record. The Summary frontmatter preserves the plan's requirement ID; no unplanned checklist entry was invented.
- No rendering, package installation, authentication, or external network gate was required.

## Authentication Gates

None.

## Known Stubs

None. Plan 25-11 intentionally owns the MP4/poster binaries; their absence is an explicit phase boundary rather than a stub in this source package.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 25-10 can consume the exact source/tree/prompt/document roles when implementing the shared transactional renderer and consolidated source-contract tests.
- Plan 25-11 can render second 68 as the poster after the shared helpers and renderer exist.
- No blocker remains; `.planning/config.json` and `docs/gpt_advice.md` were left untouched and unstaged.

## Self-Check: PASSED

- All six package files and this Summary exist and are non-empty.
- Task commit `de6c47d` exists in Git history and contains exactly the six Plan 25-08 package roles.
- Python compilation, tree/label JSON parsing, runtime binding over five diagnoses and 1,222 accepted rows, focused six-role tests, coverage classification, and `git diff --check` passed.
- No MP4/poster was rendered, no synthetic curve was labeled as Banknote, and no user/orchestrator-owned excluded file was staged.

---
*Phase: 25-numerical-methods-batch-4-logistic-regression-optimization-a*
*Completed: 2026-07-22*
