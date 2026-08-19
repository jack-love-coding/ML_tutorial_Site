---
phase: 29-logistic-regression-rebuild
verified: 2026-08-19T18:50:04Z
status: human_needed
score: 34/34 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Read all six Chinese chapters at 1200px, then linear-score, likelihood, log-loss, and linear-limits in both languages at 1440px, 768px, and 390px. Use each lab by keyboard and touch where available."
    expected: "The content-first order is easy to follow, controls remain touch-comfortable, the SVG/table fallbacks are understandable, and no important teaching relationship relies on colour or motion alone."
    why_human: "The automated 30-case browser matrix proves DOM order, interaction, reset, reduced-motion state, overflow, and fallback presence, but cannot judge instructional pacing, legibility, or touch comfort."
  - test: "Play each of the four logistic-regression videos, open transcripts, seek with chapter markers, and force or simulate a media failure."
    expected: "The visual explanation, SVG poster, bilingual transcript, marker labels, and unavailable-video fallback are all legible and pedagogically equivalent enough to continue learning."
    why_human: "ffprobe/hash checks and browser failure injection prove the artifacts and fallback paths exist; clarity of the animation/poster/transcript remains perceptual."
  - test: "Review learner-facing Chinese and English copy in all six chapters, especially class labels and the final calibration/XOR/circles explanation."
    expected: "Class 0/class 1 remain intentionally uninterpreted, and XOR/circles remain clearly synthetic capacity diagnostics rather than Banknote observations or model-selection evidence."
    why_human: "Static wording and browser assertions reject known forbidden phrases and preserve provenance labels, but this is a judgement-tier curriculum boundary that merits explicit human semantic approval."
---

# Phase 29: Logistic Regression Rebuild Verification Report

**Phase Goal:** Rebuild `logistic-regression` so learners can trace linear scores through sigmoid probabilities, likelihood, stable BCE, scratch gradients, library parity, calibration, and linear-boundary failure.
**Verified:** 2026-08-19T18:50:04Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

I treated the summaries and prior reviews as pointers only. This report rechecked the final worktree's source, public package, hashes, media metadata, route wiring, and release commands. The two original review cycles are present and their nine numerical/media/lab findings plus three browser-release findings have code-level fixes on `HEAD`; their labels were not accepted without re-running the affected checks.

### Observable Truths

| ID | Truth | Status | Evidence |
| --- | --- | --- | --- |
| R1 | One bilingual fixed case consistently connects score, sigmoid, log-odds, likelihood, BCE, and gradient notation. | ✓ VERIFIED | `course.ts` contains six typed bilingual chapters using `String.raw`; `engine.ts` provides the matching score/odds/BCE/gradient functions. The real-browser matrix rendered both locales with no raw delimiters or `katex-error`; content/rendering tests passed. |
| R2 | NumPy BCE is stable at extreme logits, finite-difference checks pass, and a deterministic scratch trace is reproducible. | ✓ VERIFIED | `phase29_analysis.py`, executed bilingual notebooks, `gradient-check.json`, and the public trace use the locked Armijo configuration. Math/parity tests passed, asset check passed, and `h=1e-6` stays below the locked `2e-9` component-error bound. |
| R3 | Scratch and scikit-learn coefficients/probabilities are compared under documented preprocessing, intercept, regularization, and stopping settings. | ✓ VERIFIED | `LOGISTIC_PARITY_CONTRACT`, `outputs/parity.json`, and the notebooks separate the unregularized parity objective from the L2 comparison. Focused parity tests passed with immutable `2e-4` parameter/intercept and `1e-6` validation-probability tolerances. |
| R4 | Calibration distinguishes probability quality from class accuracy and a nonlinear example demonstrates one linear boundary's limit. | ✓ VERIFIED | `CalibrationLimitsScene.vue` consumes validation calibration bins and separately labelled XOR/circle diagnostics. All ten bins are retained (including explicit empty bins); browser and model tests verify provenance, localized fallbacks, and no browser refit. |
| R5 | Existing routes, checkpoint, labs, downloadable package, focused tests, and both builds remain valid. | ✓ VERIFIED | Router preserves the root redirect and six deep links; `AlgorithmView.vue` routes logistic pages to `LogisticRegressionPagedLesson.vue`; browser matrix passed all 30 Pages-base cases. `npm run test:ci` passed 1090/1090 executed tests, and standard plus Pages builds completed. |
| P00-1 | Production work is behind non-vacuous fail-first contracts. | ✓ VERIFIED | All ten `tests/logistic-regression-*` contract files exist, are substantive, and their final 50 focused assertions pass. Git history shows Wave 0 tests before the engine/assets/labs/media commits. |
| P00-2 | Numeric contracts lock BCE, finite differences, training/library settings, tolerances, calibration boundaries, and Phase 29/30 disclosure rules. | ✓ VERIFIED | Direct inspection of `engine.ts`, `tests/logistic-regression-{math,parity,calibration,assets}.test.ts`, manifest, and `29-RESEARCH.md` agrees on every listed constant and boundary. |
| P00-3 | Content/rendering/compatibility/labs/media/release have executable contracts. | ✓ VERIFIED | Content, rendering, labs, cockpit, media, and release suites all ran green; the release suite is also wired to the deployed Pages workflow. |
| P01-1 | `/learn/logistic-regression/linear-score` traces an audited four-feature Banknote row into score, probability, and log-odds without changing identity. | ✓ VERIFIED | Router redirect/deep link, `logisticCourseChapters`, `LinearScoreScene.vue`, and the published `linear-score.json` are connected. The real browser read row-specific contributions, intercept, logit, probability, and class labels from the validated payload. |
| P01-2 | Pure deterministic finite-guarded TypeScript covers score through batch gradients, finite differences, calibration, and capacity helpers. | ✓ VERIFIED | `engine.ts` exports the planned authority functions, imports the established stable BCE/sigmoid primitives, rejects invalid dimensions/targets/non-finite inputs, and passed named numerical tests. |
| P01-3 | Six chapter IDs, module/checkpoint identity, V1/V2 progress, safe rendering, and code copy stay compatible. | ✓ VERIFIED | `logisticRegressionModule.ts`, router, `AlgorithmView.vue`, cockpit tests, and browser matrix preserve IDs/routes/checkpoint; `MarkdownMathContent` gives sanitized math rendering and localized copy feedback. |
| P02-1 | A Phase-29 bilingual executed notebook/public package reproduces the fixed Banknote workflow independently of Batch 4. | ✓ VERIFIED | Two 7-cell executed notebooks, `phase29_analysis.py`, `build-phase-29-assets.py`, manifest, figures, outputs, and six interaction payloads are present in `public/logistic-regression/phase-29/`; asset check passed. |
| P02-2 | Scratch/sklearn first share the exact unregularized objective; L2 is distinct. | ✓ VERIFIED | Analysis/code/course output separately label no-penalty parity and `lambda=0.05` L2. Tests reject conflating the objectives. |
| P02-3 | Fixed parity and finite-difference tolerances fail closed. | ✓ VERIFIED | Direct test run verified the full eight-step centered-difference table and configured tolerances; parity output is within the locked limits and `allowToleranceRelaxation` is false. |
| P02-4 | Phase 29 exposes only train/validation teaching data while a hash-bound Phase 30 handoff exists off the learner surface. | ✓ VERIFIED | Raw package validates the sealed handoff, while `parseLogisticManifest()` returns only locales and six approved scene assets. Course downloads omit frozen predictions; browser matrix found no learner-visible test labels/metrics/records or handoff request. The downloadable manifest contains only integrity metadata about the Phase 30 handoff, not its records. |
| P02-5 | Runtime JSON is versioned, source/hash-bound, finite, immutable, abortable, and Pages-safe. | ✓ VERIFIED | `assets.ts` validates exact keys, scene/source-cell IDs, SHA-256 via Web Crypto, finite tree limits, freezes copies, uses `withPublicBase`, and passes `AbortSignal` to fetch. Asset/lab tests exercise corruption, mismatch, and abort handling. |
| P03-1 | Four language-neutral Manim specifications and two foundational knowledge packages use manifest numeric anchors. | ✓ VERIFIED | `logistic_regression.py` loads `PHASE_DIR/manifest.json`, validates cell IDs/hashes before scene construction, and declares exactly four scene classes. `render_logistic_regression.py --check` passed. |
| P03-2 | Foundational media has prerequisite ordering, MathTex, prompts, transcripts, non-colour cues, and markers. | ✓ VERIFIED | Source trees/prompts/transcripts for score and likelihood are non-empty and metadata markers are duration-bounded; media tests and renderer source validation passed. |
| P03-3 | Selective media renderer can validate/check/publish one named scene safely. | ✓ VERIFIED | Renderer supports `--scene`, preview/publish, `--validate-sources`, and read-only `--check`; it rejects unknown IDs and checks the manifest before invoking Manim. |
| P04-1 | Confident-mistake and regularization packages are complete and bound to Phase 29 anchors. | ✓ VERIFIED | The repaired confident-mistake source validates the published `y=1` high-loss row against `softplus(z)-yz`; both diagnostic source packages, transcripts, posters, and trees pass renderer/media checks. |
| P04-2 | All four videos are local 1920×1080 30fps H.264 MP4s with posters and bounded markers. | ✓ VERIFIED | Independent `ffprobe` returned H.264, 1920×1080, 30/1 for all four files; metadata records 37.3–48.0 second durations and valid marker positions. |
| P04-3 | Metadata hash-binds media, prompts, trees, transcripts, Manim version, and source manifest. | ✓ VERIFIED | `metadata.json` has four records with asset/poster/source/prompt/tree/transcript SHA-256 values plus `sourceManifestSha256`; renderer `--check` recomputed them successfully. |
| P04-4 | Existing stems and new likelihood media resolve through the Pages-safe player contract. | ✓ VERIFIED | Typed `logisticMediaRegistry` flows through `ChapteredMediaPlayer`; the browser matrix verified normal asset request paths and injected MP4 fallback with poster/transcript. |
| P05-1 | Each chapter resolves exactly one route-lazy scene and current validated payload. | ✓ VERIFIED | `LogisticLessonLab.vue` maps exactly six IDs using `defineAsyncComponent`, calls `loadLogisticInteraction`, aborts stale loads, and the browser matrix saw exactly one current interaction request per route. |
| P05-2 | Six labs provide bounded guided controls, real/replayed results, plus semantic fallback. | ✓ VERIFIED | Each scene imports a pure `sceneModels.ts` builder and renders SVG plus an always-visible table. Browser interaction changed and reset every scene successfully. |
| P05-3 | Inputs/control lifecycle/reduced-motion/mobile fallback are safe and accessible. | ✓ VERIFIED | Scene models restore last finite values; Vue scenes support keyboard/reset and user-started playback; interval cleanup is tested. The 390px matrix had no overflow and reduced-motion was active in every record. |
| P05-4 | Banknote/calibration/XOR/circles provenance stays distinct; browser does not retrain sklearn. | ✓ VERIFIED | Published payload labels the two synthetic diagnostics; final content repeats the boundary; course/lab tests and browser text/request checks reject mixing or training. |
| P06-1 | All six unchanged deep links render full bilingual content-first chapters with code, output, media, lab, observation, misconception, conclusion. | ✓ VERIFIED | `course.ts` has six ordered bilingual typed registries; `LogisticRegressionPagedLesson.vue` renders their blocks; all six Chinese routes and four key chapters in both locales passed browser probes. |
| P06-2 | References/downloads/checkpoint/Phase 30 bridge appear only in the final chapter and handoff is not a course download. | ✓ VERIFIED | Final-only conditional in `LogisticRegressionPagedLesson.vue`; browser records show zero resources/checkpoints before `linear-limits` and exactly one on it. Download registry contains notebooks, manifest, and gradient output only. |
| P06-3 | Sanitized math, clipboard feedback, lazy media/labs, single-column reading and responsive TOC are live without the old cockpit. | ✓ VERIFIED | `MarkdownMathContent` invokes shared sanitized renderer; page composes a single content flow; styles switch TOC below 1440px; browser checks copy success/failure, base paths, overflow, and no old cockpit mount. |
| P06-4 | Module/route/chapter/progress/checkpoint/catalog identities and Pages bases stay unchanged. | ✓ VERIFIED | Cockpit compatibility tests and root/deep-link browser matrix passed; no production changes touch the three existing Progress storage sources. |
| P07-1 | Browser release matrix is real, deterministic, 30-case, and validates interactions/fallbacks. | ✓ VERIFIED | `npm run test:phase29:browser` rebuilt Pages then emitted `cases:30`, `failures:0`, six successful interactions, and four successful failure injections. No preview/Playwright process remained after completion. |
| P07-2 | Drift, parity, safe rendering, compatibility, both builds, and audit succeed together. | ✓ VERIFIED | Verifier ran asset and Manim checks, 50 focused tests, full `test:ci`, browser matrix, and standard build. Pages build ran within the browser gate; all succeeded. |
| P07-3 | Release avoids Phase 30 workflow/test disclosure and unrelated tracked changes. | ✓ VERIFIED | Course/component/download registry and browser text show no reserved test records or decision metrics; `git status` contains only pre-existing ignored/untracked `.gsd/` and `.planning/research/`, with config/advice untouched. |

**Score:** 34/34 truths verified (0 present-but-behaviour-unverified).

### Required Artifacts

| Plan | Artifacts checked at existence/substance/wiring levels | Status | Details |
| --- | --- | --- | --- |
| 29-00 | 10 logistic contract suites | ✓ VERIFIED | All parse, contain named assertions, run in the focused 50-test set, and cover math/assets/parity/calibration/content/rendering/labs/cockpit/media/release. |
| 29-01 | `types.ts`, `engine.ts`, `data/course.ts` | ✓ VERIFIED | Typed contracts, finite guarded numerical authority, and six-chapter bilingual registry are imported by runtime consumers. |
| 29-02 | Analysis/publisher scripts, manifest, handoff CSV, runtime asset loader | ✓ VERIFIED | Deterministic Python authority checks the Banknote CSV/manifest via `load_banknote_source`; strict asset loader consumes the published manifest and only returns the sealed learner projection. |
| 29-03 | Manim scene source/renderer/media registry/media suite | ✓ VERIFIED | Scene module reads the absolute `PHASE_DIR / manifest.json` construction (not the plan's literal relative string) and registry feeds the shared player. |
| 29-04 | Metadata and four MP4 files | ✓ VERIFIED | Four complete local files pass `ffprobe`, hash, source package, marker, and source-manifest checks. |
| 29-05 | Lazy lab shell, pure scene models, calibration scene, lab suite | ✓ VERIFIED | Shell calls the renamed final loader `loadLogisticInteraction`; all six direct scene imports call model builders. The plan's earlier `loadLogisticInteractionAsset` text is an interface-name drift, not an orphan. |
| 29-06 | Course registry, paged lesson, legacy module, sources record | ✓ VERIFIED | One lesson page composes content → media → lab → final resources/checkpoint and retains the legacy module contract. |
| 29-07 | Browser matrix, release test, validation record | ✓ VERIFIED | Local exact Playwright CLI is pinned; runner has bounded preview/command handling, close, and process-group cleanup tests. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `engine.ts` | `banknoteLogistic.ts` | stable primitives | ✓ WIRED | Explicit import and calls to `stableSigmoid`/`stableBinaryCrossEntropy`. |
| Asset publisher | Banknote CSV/manifest | `load_banknote_source()` | ✓ WIRED | The generic link probe missed the literal filename because it is owned by `phase29_analysis.py`; the publisher imports analysis, which enforces dataset/schema/split/hash before fitting. |
| Manifest | six interaction JSON files | hash/source-cell inventory | ✓ WIRED | 19 file hashes recomputed independently with zero mismatch; runtime verifies current scene hash before parsing. |
| Lesson page | labs/media/course/module | typed component props and registries | ✓ WIRED | Current chapter selects typed blocks, `LogisticLessonLab`, media registry/player, and final checkpoint using unchanged module props. |
| Manim sources/media metadata | Phase-29 manifest | validated anchor/source-manifest SHA | ✓ WIRED | Renderer validates anchors pre-render and every published MP4 metadata record carries matching source manifest hash. |
| Browser runner | Pages lesson | stable test IDs and semantic probes | ✓ WIRED | Real browser used `logistic-current-chapter`/`logistic-course-lab`, checked content order and live scene tables, then closed session. |

### Data-Flow Trace (Level 4)

| Rendered artifact | Data source | Flow | Status |
| --- | --- | --- | --- |
| Score/lab figures and tables | Published scene JSON + manifest hash | `loadLogisticInteraction` → frozen parsed payload → scene model → SVG/table | ✓ FLOWING |
| Teaching code/output | Executed Phase-29 notebooks | builder → manifest/output/interaction records → typed course blocks → sanitized renderer | ✓ FLOWING |
| Media/video/poster/transcript | Typed media registry + local `/manim/...` assets | lesson `mediaFor()` → `ChapteredMediaPlayer` → `withPublicBase` | ✓ FLOWING |
| Calibration/capacity table | Validation JSON plus isolated synthetic records | `CalibrationLimitsScene` → pure model → SVG and semantic table | ✓ FLOWING |
| Phase-30 handoff | Raw public package only | raw manifest validation → stripped learner manifest; no page/download registry reference to frozen records | ✓ ISOLATED |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Numerical/content/lab/media/release contracts | `node --test tests/logistic-regression-*.test.*` (explicit ten Phase-29 files) | 50 pass, 0 fail | ✓ PASS |
| Asset/package integrity | `python3 scripts/logistic-regression/build-phase-29-assets.py --check` | Deterministic package check passed | ✓ PASS |
| Manim package integrity | `python3 scripts/manim/render_logistic_regression.py --check` | Four sources, hashes, anchors, metadata, ffprobe and markers passed | ✓ PASS |
| Full workspace regression | `npm run test:ci` | 1,090 pass, 28 skip, 0 fail | ✓ PASS |
| Standard production build | `npm run build` | Passed; only pre-existing large-chunk advisory | ✓ PASS |
| Pages browser release | `npm run test:phase29:browser` | 30 cases, six interactions, four fallbacks, zero failures; explicit browser close and no residual runner process | ✓ PASS |
| Browser cleanup paths | `tests/logistic-regression-browser-runner.test.mjs` within full suite | Spawn error, child error, timeout, SIGTERM/SIGKILL, preview timeout, and explicit close tests passed | ✓ PASS |

### Requirements Coverage

| Requirement | Source plans | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| LOGR-01 | 00, 01, 03, 04, 05, 06, 07 | Connect scores, sigmoid, log-odds, maximum likelihood and BCE. | ✓ SATISFIED | Bilingual course, score/sigmoid/likelihood/loss labs, pure functions, media and browser flow share the same fixed Banknote case. |
| LOGR-02 | 00, 01, 02, 03, 04, 05, 06, 07 | Stable BCE, gradients, deterministic training, finite differences in NumPy. | ✓ SATISFIED | Python analysis/notebooks and TS engine agree with locked traces, finite guards, full h sweep, and published gradient output. |
| LOGR-03 | 00, 02, 05, 06, 07 | Compare scratch with scikit-learn under aligned preprocessing/regularization. | ✓ SATISFIED | Manifest/notebook/parity output and training lab preserve unregularized comparison and separate L2 objective with fixed tolerance checks. |
| LOGR-04 | 00, 02, 05, 06, 07 | Inspect calibration and explain linear-boundary limitation. | ✓ SATISFIED | Validation-only calibration transform, all deciles, isolated XOR/circles, localized fallback, and browser interaction are implemented and tested. |

### Prohibition Checks

| Plan boundary | Automated evidence | Status |
| --- | --- | --- |
| Do not assign unsupported real-world meanings to class 0/1. | Typed course copy calls the targets only `class 0`/`class 1`; content/browser contracts reject alternate target semantics. | ⚠️ Human semantic approval requested |
| Do not disclose test labels, test metrics, test calibration bins, or test-driven choices in Phase 29 learner flow. | Learner manifest projection strips handoff fields; course downloads omit frozen predictions; browser matrix observes no handoff request or reserved-test copy. | ✓ VERIFIED |
| Do not present synthetic XOR/circles as Banknote data, fitting inputs, selection results, or a way to bend a line. | Data types, course wording, localized table/provenance labels, lab tests, and browser matrix keep sources separate. | ⚠️ Human semantic approval requested |

### Anti-Patterns Found

| File | Line/pattern | Severity | Assessment |
| --- | --- | --- | --- |
| `scripts/manim/render_logistic_regression.py` | “not available yet” in a missing-media error | ℹ️ Info | Genuine fail-closed error path, not a placeholder implementation. |
| `package-lock.json` | `XXX` substring inside integrity hashes | ℹ️ Info | Hash bytes, not a debt marker. |
| `package-lock.json` / audit | `nanoid@3.3.16` is below advisory-fixed `<3.3.18` threshold | ⚠️ Pre-existing | `npm run security:audit` reports one high advisory. Phase 29 did not change nanoid; its only dependency addition pins `@playwright/cli@0.1.18`. This is not counted as a Phase 29 gap. |

### Disconfirmation Pass

- **Potential partial requirement checked:** the raw reproducibility manifest necessarily mentions a Phase 30 handoff. I traced the learner data flow rather than accepting the flag: the runtime parser strips the handoff, the lesson never links frozen predictions, and the live browser found neither a request nor learner-visible labels/results. The manifest download contains integrity metadata, not the records themselves.
- **Potentially misleading test checked:** `tests/logistic-regression-release.test.mjs` has source-inspection assertions that alone would not prove a browser flow. The real `test:phase29:browser` run independently exercised its 30 cases, six lab mutations/resets, copy failure, corrupt/HTTP asset failures, and MP4 failure.
- **Potential uncovered error path checked:** browser runner timeout/cleanup could otherwise leave processes. The runner has bounded process and preview APIs with tests for spawn/child/timeout/SIGKILL paths; this verification's matrix also ended with no matching preview or Playwright process.

### Human Verification Required

### 1. Bilingual instructional reading and interaction quality

**Test:** Read and use the chapters at the viewport/locale matrix in the frontmatter.

**Expected:** The content-first lesson progression, responsive TOC, controls, SVG descriptions, and tables remain genuinely comfortable and comprehensible.

**Why human:** Browser automation can detect overflow/DOM/focus outcomes, not teaching clarity or touch ergonomics.

### 2. Media clarity and fallback equivalence

**Test:** Exercise all four videos, markers/transcripts, and media fallback.

**Expected:** A learner can follow the same mathematical point from video, poster, and transcript.

**Why human:** Asset validity and fallback visibility are automated; visual explanation quality is perceptual.

### Gaps Summary

No Phase 29-owned implementation gap was found. Automated goal evidence is complete; the status is `human_needed` solely because the validation plan correctly reserves visual/instructional quality for human review. The `nanoid` audit advisory predates this phase and remains visible rather than being suppressed or silently upgraded.

---

_Verified: 2026-08-19T18:50:04Z_  
_Verifier: the agent (gsd-verifier)_
