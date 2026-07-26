---
phase: 25-numerical-methods-batch-4-logistic-regression-optimization-a
plan: "11"
subsystem: numerical-methods-media
tags: [manim, h264, ffprobe, atomic-publication, integrity, accessibility]

requires:
  - phase: 25-05
    provides: Typed bilingual Banknote lesson modules and exact optimization/training-diagnostics route identities
  - phase: 25-10
    provides: Three-scene source contract, transactional renderer, offline checker, and rollback semantics
provides:
  - Three silent H.264 1920x1080@30fps Banknote videos with 1920x1080 local posters
  - Complete Batch 4 source, document, Notebook output, dataset, and media integrity metadata
  - Typed bilingual route bindings with poster, transcript, summary, label, reduced-motion, and video-failure fallbacks
affects: [25-12, 25-13, optimization, training-diagnostics]

tech-stack:
  added: []
  patterns:
    - Verified temporary media package followed by atomic public-directory replacement
    - Public Manim assets bind through typed bilingual VisualAsset records with static poster and transcript fallbacks

key-files:
  created:
    - public/manim/numerical-methods/banknote-feature-scaling.mp4
    - public/manim/numerical-methods/banknote-feature-scaling-poster.png
    - public/manim/numerical-methods/banknote-fixed-vs-armijo.mp4
    - public/manim/numerical-methods/banknote-fixed-vs-armijo-poster.png
    - public/manim/numerical-methods/banknote-training-diagnostics.mp4
    - public/manim/numerical-methods/banknote-training-diagnostics-poster.png
    - public/manim/numerical-methods/batch-4-metadata.json
  modified:
    - scripts/manim/numerical_methods_batch_4/banknote_feature_scaling.py
    - src/modules/math-lab/data/numericalBatch4Modules.ts

key-decisions:
  - "Treat only the verified temporary-package swap as the successful publication; the failed pre-publication Manim attempt left public media and Notebook outputs byte-identical."
  - "Bind all three packages through typed bilingual VisualAsset records so local posters and transcripts carry the lesson when motion is reduced or video fails."
  - "Use Manim 0.20.1 stretch_to_fit_width for non-proportional label sizing instead of the unsupported set_width stretch keyword."

patterns-established:
  - "Publication invariant: compare every non-Batch-4 Numerical Methods media byte and every upstream Notebook output byte before and after atomic publication."
  - "Motion fallback: canonical metadata links each MP4 to its poster, Chinese transcript, English summary, bilingual label table, and reduced-motion/video-failure text."

requirements-completed: [P25-SC5]

coverage:
  - id: D1
    description: Exactly three silent H.264 1920x1080@30fps videos and three 1920x1080 posters publish atomically with bounded 72-second durations.
    requirement: P25-SC5
    verification:
      - kind: integration
        ref: "python3 scripts/manim/render_numerical_methods_batch_4.py --check"
        status: pass
      - kind: integration
        ref: "tests/numerical-methods-batch-4-manim.test.ts#[Plan 25-11] renderer check and ffprobe verify deterministic H.264 packages"
        status: pass
    human_judgment: false
  - id: D2
    description: Batch 4 metadata contains complete source, document, dataset, Notebook output, and media hashes while all Batches 1-3 media and upstream Notebook outputs remain byte-identical.
    requirement: P25-SC5
    verification:
      - kind: integration
        ref: "tests/numerical-methods-batch-4-manim.test.ts#[Plan 25-11] metadata, videos, posters, and hashes form three complete packages"
        status: pass
      - kind: other
        ref: "pre/post SHA-256 comparison: 17/17 prior media files and 5/5 Notebook output files"
        status: pass
    human_judgment: false
  - id: D3
    description: The optimization and training-diagnostics routes bind the exact local packages with posters, localized transcripts, English summaries, bilingual labels, and reduced-motion/video-failure/non-color fallbacks.
    requirement: P25-SC5
    verification:
      - kind: integration
        ref: "tests/numerical-methods-batch-4-manim.test.ts#[Plan 25-05/11] both route chapters bind the declared local packages"
        status: pass
      - kind: integration
        ref: "explicit three-scene fallback audit: poster+localized transcript+English summary+reducedMotion/videoFailure/nonColor labels"
        status: pass
    human_judgment: false

duration: 8 min
completed: 2026-07-22
status: complete
---

# Phase 25 Plan 11: Batch 4 Manim Publication Summary

**Three Notebook-bound Banknote animations now ship as silent 1080p30 H.264 packages with exact route bindings, static fallbacks, complete integrity hashes, and byte-preserved prior batches**

## Performance

- **Duration:** 8 min
- **Started:** 2026-07-22T12:36:07Z
- **Completed:** 2026-07-22T12:44:02Z
- **Tasks:** 1
- **Files modified:** 9

## Accomplishments

- Rendered, validated, and atomically published exactly three non-empty Batch 4 MP4/poster pairs plus `batch-4-metadata.json`.
- Verified silent H.264 video at 1920x1080 and 30fps, declared 72-second bounds, 1920x1080 PNG posters, and 38 complete source/document/output/dataset/media integrity entries.
- Preserved all 17 pre-existing Numerical Methods media files and all five upstream Batch 4 Notebook output files byte-for-byte across the failed pre-publication attempt and successful publication.
- Bound feature scaling and fixed-versus-Armijo to `optimization`, and training diagnostics to `training-diagnostics`, with typed bilingual transcripts and static reduced-motion/video-failure fallbacks.

## Task Commits

Each task was committed atomically:

1. **Task 1: Render, publish, and integrity-check all Batch 4 media** - `b90e1cb` (feat)

## Published Media

| Package | MP4 bytes | MP4 SHA-256 | Probe | Poster bytes | Poster SHA-256 |
| --- | ---: | --- | --- | ---: | --- |
| `banknote-feature-scaling` | 3,584,782 | `0a260e68e9fdcd80311d821e017358a2a0440dbdf936d2528d2bfcfca4be51f3` | H.264, 1920x1080, 30/1, silent, 72.000000s | 397,818 | `c5a83532a1986f8defa7db9a6d0039735b0e9b8c6dcb29ed94697181ff98adb2` |
| `banknote-fixed-vs-armijo` | 3,135,040 | `7bd5d0ecb9fd8b5d319304a47edc72f4a7f4949bcf3c11bf1ed87111298aa07c` | H.264, 1920x1080, 30/1, silent, 71.999344s | 291,659 | `96ba155791870cd8ddf37f74fc3a1e86846575b2c0b151391bf87a46b75a2879` |
| `banknote-training-diagnostics` | 3,934,479 | `70bc0c71b6677ba764f384f370df61565b107bf781f66197addfaa6a9a769292` | H.264, 1920x1080, 30/1, silent, 71.997400s | 306,249 | `2a7ae7fc919bf5b948fe38301ec0c20c18f8a003c8251fd498e332681a00b417` |

`batch-4-metadata.json` is 10,034 bytes with SHA-256 `84b8463fa33317d1c686f8238c0d0f85950af0b04ed3e07986dc34c3b00d25e9`.

## Files Created/Modified

- `public/manim/numerical-methods/banknote-feature-scaling.mp4` - Feature-scale and fixed-step animation.
- `public/manim/numerical-methods/banknote-feature-scaling-poster.png` - Static 68-second fallback frame.
- `public/manim/numerical-methods/banknote-fixed-vs-armijo.mp4` - Fixed-step versus Armijo animation.
- `public/manim/numerical-methods/banknote-fixed-vs-armijo-poster.png` - Static 68-second fallback frame.
- `public/manim/numerical-methods/banknote-training-diagnostics.mp4` - Real-trace diagnostic animation.
- `public/manim/numerical-methods/banknote-training-diagnostics-poster.png` - Static 68-second fallback frame.
- `public/manim/numerical-methods/batch-4-metadata.json` - Exact scene, route, output, media, and integrity manifest.
- `scripts/manim/numerical_methods_batch_4/banknote_feature_scaling.py` - Manim 0.20.1-compatible non-proportional label sizing.
- `src/modules/math-lab/data/numericalBatch4Modules.ts` - Typed bilingual MP4/poster/transcript bindings and section placements.

## Decisions Made

- A renderer failure before public-directory replacement is not publication. After fixing the source compatibility bug, one successful temporary-package verification and atomic swap published the complete directory.
- Static access is a first-class route contract: every video has a local poster, Chinese and English page transcript, English document summary, bilingual labels, and explicit reduced-motion, video-failure, and non-color descriptions.
- The canonical poster names use the Plan 25-10 renderer contract (`*-poster.png`) and are referenced identically by metadata, route records, and tests.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Replaced unsupported Manim width-stretch call**

- **Found during:** Task 1 first render attempt
- **Issue:** Manim 0.20.1 raised `TypeError` for `set_width(2.25, stretch=True)` while rendering the feature-scale scene.
- **Fix:** Used the documented `stretch_to_fit_width(2.25)` API, preserving the intended non-proportional label width.
- **Files modified:** `scripts/manim/numerical_methods_batch_4/banknote_feature_scaling.py`
- **Verification:** Python compilation, a direct Manim 0.20.1 API probe, successful three-scene render, renderer `--check`, and 8/8 media tests.
- **Committed in:** `b90e1cb`

**2. [Rule 2 - Missing Critical] Added the required route and fallback bindings**

- **Found during:** Task 1 pre-publication contract review
- **Issue:** The metadata declared exact module IDs, but `numericalBatch4Modules.ts` exposed only the shared illustration, so the final route-binding owner would fail and learners could not reach the published videos or page-level fallbacks.
- **Fix:** Added three typed `manim-video` records, exact MP4/poster paths, bilingual transcripts/alt/captions, section placements, and imported asset paths.
- **Files modified:** `src/modules/math-lab/data/numericalBatch4Modules.ts`
- **Verification:** Exact route-binding test, explicit three-scene fallback audit, TypeScript production build, and full media test.
- **Committed in:** `b90e1cb`

---

**Total deviations:** 2 auto-fixed (1 Rule 1 bug, 1 Rule 2 missing critical functionality)
**Impact on plan:** Both fixes were necessary to complete the locked renderer and route contracts. No new media package, route, framework, or numerical value was introduced.

## Issues Encountered

- The initial renderer invocation stopped during scene 1 before any public-directory replacement. Zero Batch 4 targets existed afterward, and pre-existing media plus Notebook outputs matched their captured SHA-256 manifests. The corrected renderer then completed one successful atomic publication.
- `python3 -m manim --version` emits an upstream `runpy` warning in this local installation; Manim 0.20.1 still rendered all three packages successfully.
- `requirements.mark-complete P25-SC5` returned `not_found` because `.planning/REQUIREMENTS.md` has no Phase 25 requirement record. The Summary retains the plan's requirement ID; no unplanned checklist entry was invented.

## Authentication Gates

None.

## Known Stubs

None. All three videos, posters, route bindings, transcripts, summaries, labels, and integrity records are concrete local assets.

## Verification

- `python3 scripts/manim/render_numerical_methods_batch_4.py --check` - pass; source, documents, Notebook anchors, media, and hashes are in sync.
- `node --test tests/numerical-methods-batch-4-manim.test.ts` - pass, 8/8 tests.
- Independent `ffprobe` checks - pass for all three silent H.264 1920x1080@30fps videos and all three 1920x1080 PNG posters.
- Pre/post SHA-256 comparison - pass for 17/17 prior Numerical Methods media files and 5/5 upstream Notebook output files.
- Explicit fallback audit - pass for poster, localized transcript, English summary, reduced-motion, video-failure, and non-color label paths on all three packages.
- `npm run build` - pass; Vite's existing large-chunk warning remains unchanged.
- `git diff --check` and task-commit `git show --check` - pass.

## Threat Flags

None. The planned public-media trust boundary remains local and hash-audited; publication used verified temporary output, atomic replacement, post-publish validation, and rollback logic.

## User Setup Required

None - no external service, runtime network, secret, or browser Python is required.

## Next Phase Readiness

- Plan 25-12 can run the offline Notebook/media drift gates, full suite, standard/Pages builds, and security audit without re-rendering media.
- Plan 25-13 can exercise the bilingual desktop/mobile browser matrix and exact non-finite control probe against the now-published local fallbacks.
- No blocker remains. `.planning/config.json` and `docs/gpt_advice.md` remain untouched and unstaged.

## Self-Check: PASSED

- All seven publication artifacts, both modified source files, and this Summary exist.
- Task commit `b90e1cb` exists in repository history with no tracked-file deletion.
- All task acceptance criteria and plan-level verification commands passed.
- Coverage classification reports 3/3 deliverables automatically covered with no schema errors.

---
*Phase: 25-numerical-methods-batch-4-logistic-regression-optimization-a*
*Completed: 2026-07-22*
