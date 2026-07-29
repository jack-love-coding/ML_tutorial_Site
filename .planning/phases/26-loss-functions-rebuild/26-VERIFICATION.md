---
phase: 26-loss-functions-rebuild
verified: 2026-07-28T17:01:34Z
status: passed
score: "37/37 must-haves verified"
behavior_unverified: 0
overrides_applied: 0
---

# Phase 26: Loss Functions Rebuild Verification Report

**Phase Goal:** Rebuild `loss-functions` so learners can move from fixed prediction errors to numerically verified MSE, MAE, stable BCE, gradients, and training-objective intuition.
**Verified:** 2026-07-28T17:01:34Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

The phase goal is achieved in the repository. This verdict is based on the
implementation, committed public assets, independent numerical recomputation,
focused behavioral tests, compatibility diffs, and release evidence. SUMMARY.md
claims were used only to discover scope and commands.

### Observable Truths

| # | Contract | Truth | Status | Evidence |
|---:|---|---|---|---|
| 1 | Roadmap SC1 | Fixed bilingual examples match across per-example and aggregate MSE, MAE, and stable BCE in teaching, NumPy, locked output, and labs. | ✓ VERIFIED | `src/data/lossFunctionsModule.ts`, typed bindings in `src/data/lossFunctionsAssets.ts`, the four executed Notebooks, and pure-math labs share the same variables/formulas. Independent full-data recomputation reproduced LaDe MSE `21178.123380550926`, MAE `106.08492758236584`, and SECOM BCE within floating-point tolerance. Focused tests passed 88/88. |
| 2 | Roadmap SC2 | Learners can explain outlier MSE/MAE influence and confident-wrong BCE/gradient influence. | ✓ VERIFIED | `RegressionLossLab.vue` compares squared versus linear contribution/gradient scale; `ClassificationLossLab.vue` traces the real SECOM OOF row `secom-1356` through label, logit, probability, BCE, and gradient. The committed browser matrix exercised both interactions and passed 32/32 in the supplied final release evidence. |
| 3 | Roadmap SC3 | Vectorized implementations remain finite at extreme logits and pass deterministic finite-difference checks. | ✓ VERIFIED | `stableBinaryCrossEntropy(-1000, 1)` and `(1000, 0)` both return `1000`; all smooth `h=1e-5` checks pass and all MAE-kink rows remain `kink`. `tests/loss-functions-math.test.ts` and Notebook parity tests passed in the verifier's 88/88 run. |
| 4 | Roadmap SC4 | Route/checkpoint compatibility and focused content, calculation, and Pages asset tests pass. | ✓ VERIFIED | Canonical route and seven deep links pass; checkpoint IDs/revisit links and V1/V2 keys are unchanged; focused Pages/base/asset tests passed 3/3. Recent release evidence records `npm test` 837/837 and successful standard/Pages builds. |
| 5 | 26-01 T1 | `approve-lade` is bounded to the pinned LaDe-D Jilin revision/hash, attribution/license, and privacy-minimized derivative. | ✓ VERIFIED | The exact decision, revision `be2cec...`, SHA-256 `12e2cf...`, and denylist are recorded in `phase-26-data-contract.md` and hard-coded/validated by `build-phase-26-assets.py`; authorization-drift failure injection passed. |
| 6 | 26-01 T2 | Explicit source bootstrap is the only online mode; ordinary generation and check fail closed offline. | ✓ VERIFIED | CLI exposes mutually exclusive modes; lines 4724-4738 reject invalid online/offline combinations. The focused suite's real `--check` path reran all four Notebooks under the external-network block without repository writes. |
| 7 | 26-01 T3 | LaDe and SECOM are pinned by official identity and SHA-256; source/schema drift stops generation. | ✓ VERIFIED | Public manifests record official URL/revision-or-DOI and exact source hashes. Tampered hash, schema, row, label, license, and source-member tests passed. |
| 8 | 26-01 T4 | LaDe removes courier/precise location fields; SECOM records declared 591 versus observed 590. | ✓ VERIFIED | LaDe CSV has exactly the approved eight columns and 31,415 rows. SECOM has 1,567 rows, 590 measurement columns, labels 1463/104, and 41,951 preserved missing values; its manifest records both 591 and 590. |
| 9 | 26-02 T1 | MSE, MAE, and stable BCE expose per-element losses, mean objective, per-element gradients, and mean-objective gradients. | ✓ VERIFIED | `LossGradientEvaluation` and `evaluateLossGradient()` keep all four quantities separate and immutable; exact value and batch-factor tests passed. |
| 10 | 26-02 T2 | Stable BCE is finite at ±1000 without clipping and distinguishes naive/clipped/stable semantics. | ✓ VERIFIED | Canonical BCE uses branch-stable softplus. Ten typed fixed probes use `null` plus status for non-finite naive results and set `objectiveChanged` on clipped extremes. |
| 11 | 26-02 T3 | Zero-residual MAE is nondifferentiable with convention 0 and never certified as a unique derivative. | ✓ VERIFIED | Pure math returns `differentiable: false`, note, subgradient 0, and `kink`; every kink sweep row is excluded from `pass`. The lab renders the same semantic explicitly. |
| 12 | 26-02 T4 | Central differences and the h sweep expose analytic/numerical values, both error metrics, tolerance, and pass/kink status. | ✓ VERIFIED | `evaluateStepSweep()` produces nine steps from `1e-1` through `1e-9`; the locked output and lab expose all required diagnostics. |
| 13 | 26-02 T5 | Public numerical entry points reject malformed/non-finite inputs and Vue contains no core loss math. | ✓ VERIFIED | Guard tests cover empty/mismatched/non-finite vectors, labels, coordinates, epsilon, and non-positive steps. Vue labs import `lossFunctionsMath.ts`; no alternate MSE/MAE/stable-BCE formula authority was found in the phase components. |
| 14 | 26-03 T1 | One indivisible pipeline owns both datasets, two topics, four locales, summaries, plots, and manifest; no subset publishes. | ✓ VERIFIED | `CANDIDATE_PATHS` is a closed 16-member inventory; topic/locale subset rejection tests and publication inventory tests passed. |
| 15 | 26-03 T2 | Each topic has shared ordered code cells, separate locale markdown, and four fresh-kernel jobs. | ✓ VERIFIED | Both Notebook locale pairs have identical code-cell IDs/sources and identical output hashes; committed execution counts begin at 1 with zero errors. Manifest contains four distinct fresh-kernel proof IDs. |
| 16 | 26-03 T3 | The exact audited Python pins/wheel cache are reused and drift fails before generation. | ✓ VERIFIED | Phase 26 and Numerical Methods requirements have identical SHA-256 `6aa97c...`; environment contract binds the 99-wheel manifest. Environment drift tests passed and no dependency was added. |
| 17 | 26-03 T4 | Candidate work targets only the ignored staging root and cannot publish early. | ✓ VERIFIED | Staging-root validation rejects `public/`, requires the exact ignored path, and rejects symlinks. Git history shows no public diff across Plans 26-03/04. |
| 18 | 26-04 T1 | Staging contains complete LaDe/SECOM transformations with provenance, privacy, schema, checksum, labels/targets, and representative rows. | ✓ VERIFIED | The ignored staging tree currently contains the exact 16 files. Dataset manifests and direct CSV inspection verify all listed contracts. |
| 19 | 26-04 T2 | Staging contains four executed Notebooks, two summaries, two plots, attribution, environment, and one complete manifest. | ✓ VERIFIED | Exact 16-file staging inventory exists and its contents match the public candidate package. Notebook inspection found 4/4 executed artifacts with no error output. |
| 20 | 26-04 T3 | Candidate outputs expose real regression loss/gradients and real OOF BCE/gradients plus fixed extremes and h sweeps. | ✓ VERIFIED | Regression summary contains all 31,415 rows and representative/high-contribution rows; BCE summary contains all 1,567 OOF rows, real confident error, ten fixed probes, and four sweep groups. Independent TypeScript recomputation matched. |
| 21 | 26-04 T4 | Candidate data/locale/code/output/plot/JSON/TS parity passes and Plans 03/04 wrote no public generated groups. | ✓ VERIFIED | Candidate-related tests passed; strict JSON and plot metadata are validated. Git history confirms the public groups first appear only in Plan 26-05. |
| 22 | 26-05 T1 | Publication succeeds only as the complete two-group, 16-member transaction. | ✓ VERIFIED | Git history shows all 16 public files added together in Plan 26-05. Current manifest has `packageComplete: true`; subset publication tests passed. |
| 23 | 26-05 T2 | Published files match candidate hash/path/size/schema/output identities before replacement. | ✓ VERIFIED | Independent verifier hash check passed 15/15 non-self entries; package is exactly 22,011,681 bytes. Publisher revalidates candidate and public packages around the swap. |
| 24 | 26-05 T3 | Offline check is externally network-blocked/write-free; four public Notebooks rerun; locale/code/output/cross-runtime parity holds. | ✓ VERIFIED | Verifier's focused run executed the real offline-check test in 57.35s; it reran all four Notebooks and passed repository byte/mtime checks. |
| 25 | 26-05 T4 | Pre/mid/post publication failures restore prior public bytes and leave no transaction residue. | ✓ VERIFIED | Named rollback test passed all three injection points; current public root contains no `.loss-functions-publication-*` residue. |
| 26 | 26-05 T5 | Root and `/ML_tutorial_Site/` resolve only committed local course assets. | ✓ VERIFIED | Typed paths are root-relative and `withPublicBase` is used by results/downloads. Focused base tests passed 3/3; Notebook/runtime source contains no Hugging Face/UCI fetch. |
| 27 | 26-06 T1 | Module identity and old six chapter IDs/order are preserved, with `gradient-verification` appended. | ✓ VERIFIED | Pre-phase Git comparison shows the original six IDs unchanged and ordered; current module adds only the seventh final chapter. Route remains `/learn/loss-functions`. |
| 28 | 26-06 T2 | All seven chapters have complete zh-CN/en teaching loops and teaching dominates selective exercises. | ✓ VERIFIED | Content tests validate non-empty bilingual core question, explanation, formula, code/output connection, misconception, and handoff; each chapter has at least five teaching sections and fewer exercise sections. |
| 29 | 26-06 T3 | Loss/gradient chapters bind typed output IDs and local assets instead of copying Notebook result numbers into prose. | ✓ VERIFIED | `lossFunctionsChapterBindings` is the shared typed contract; content tests reject copied result constants and validate registry/output bindings. |
| 30 | 26-06 T4 | Practical probability intuition precedes likelihood → negative log → MLE; Softmax remains a concise support bridge. | ✓ VERIFIED | Chapter order and scope tests pass; Softmax appears only in the binary-to-multiclass bridge and is absent from the other chapters/checkpoints/Notebook topic set. |
| 31 | 26-06 T5 | Checkpoints, revisit links, Progress V1/V2 keys, safe rendering, and deep links remain compatible. | ✓ VERIFIED | Protected production authorities have no Phase 26 diff. Markdown renders through the shared KaTeX/sanitizer path. Compatibility/progress tests passed. |
| 32 | 26-07 T1 | A real row flows through target/prediction, per-example loss, output/logit gradient, mean objective, and full-data summary. | ✓ VERIFIED | `WhyLossLab.vue` and `ClassificationLossLab.vue` consume validated real summary rows, recompute with the pure engine, and render full-data results beside the lab. |
| 33 | 26-07 T2 | Regression and classification labs show outlier/confident-error influence without arbitrary extreme inputs. | ✓ VERIFIED | Bounded row selectors/reset controls use locked examples; ±1000 appears only in the read-only fixed probe table. Browser matrix interaction evidence passed. |
| 34 | 26-07 T3 | Gradient lab shows MSE, smooth MAE, MAE kink, and BCE analytic/finite-difference diagnostics via the pure engine. | ✓ VERIFIED | Direct imports of `evaluateLossGradient()` and `evaluateStepSweep()` drive all lab readouts and the locked h selector. Named math/lab tests passed. |
| 35 | 26-07 T4 | Six existing labs and the seventh branch explicitly; unknown sections never fall through to MLE. | ✓ VERIFIED | `LossFunctionsLessonLab.vue` has seven explicit branches and an unsupported state; source test rejects a catch-all `MleBridgeLab`. |
| 36 | 26-07 T5 | Chapter-keyed locked tables/plots and one bilingual base-safe download area ship; no extra generated image/Manim was needed. | ✓ VERIFIED | `LossFunctionsResults.vue` selects typed results/plots; `LossFunctionsDownloads.vue` enumerates all 16 assets through `withPublicBase`. No Phase 26 Manim/generated-image asset exists. |
| 37 | 26-07 T6 | Canonical/deep routes, checkpoints, Progress, safe render, code copy, Pages, reduced motion, desktop, and 390px remain usable. | ✓ VERIFIED | Focused compatibility tests passed; recent supplied Playwright evidence records 32/32 across zh-CN/en × desktop/390px × root/seven deep links, with no overflow, overlap, dead fragment, console warning/error, or external course asset. |

**Score:** 37/37 truths verified (0 present-but-behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `docs/curriculum-v3/loss-functions/phase-26-data-contract.md` | Auditable authorization/source/privacy contract | ✓ VERIFIED | 175 substantive lines; exact approval, source identities, denylist, schema, and fail-closed rules. |
| `scripts/loss-functions/build-phase-26-assets.py` | Bootstrap/generate/verify/publish/check authority | ✓ VERIFIED | 4,838 substantive lines; explicit modes, strict JSON, staging, offline rerun, atomic swap, rollback, and verification. |
| `src/simulations/lossFunctionsMath.ts` | Pure guarded numerical authority | ✓ VERIFIED | 447 substantive lines; exported stable BCE, gradient, central-difference, sweep, and probe functions. |
| `src/simulations/lossFunctions.ts` | Backward-compatible simulation composition | ✓ VERIFIED | Imports the pure authority with explicit `.ts` suffix and preserves one deterministic snapshot. |
| `scripts/loss-functions/requirements.txt` and `environment-contract.json` | Exact offline environment | ✓ VERIFIED | Requirements bytes match the public and audited Numerical Methods pins; wheel/Python/platform contract is closed. |
| `.cache/loss-functions/phase-26-staging/**` | Complete ignored candidate package | ✓ VERIFIED | Exact 16-member package exists under the ignored non-public root. |
| `public/datasets/loss-functions/**` | Two normalized datasets, two manifests, attribution | ✓ VERIFIED | Exactly five public dataset-group members; schemas/rows/privacy/hashes verified. |
| `public/notebooks/loss-functions/**` | Four executed Notebooks, summaries, plots, environment, manifest | ✓ VERIFIED | Exactly eleven public Notebook-group members; execution/output/hash integrity verified. |
| `src/data/lossFunctionsAssets.ts` | Typed registry and runtime validators | ✓ VERIFIED | 16 exact local assets, seven chapter bindings, strict summary validators. |
| `src/data/lossFunctionsModule.ts` | Seven-chapter bilingual lesson | ✓ VERIFIED | Existing six chapters preserved; seventh gradient chapter and Phase 27/29 handoff present. |
| `src/components/LossFunctionsLessonLab.vue` | Explicit registry and validated result loading | ✓ VERIFIED | Seven explicit branches, abortable base-safe summary loads, clear unknown state. |
| `src/components/LossGradientVerificationLab.vue` | Bounded gradient verification interaction | ✓ VERIFIED | Pure-math driven, resettable, keyboard-native selects, kink semantics, nine-step sweep. |
| `src/components/LossFunctionsResults.vue` | Chapter-keyed locked results | ✓ VERIFIED | Validated JSON data flows to real rows, aggregates, fixed probes, sweeps, plots, and code/output. |
| `src/components/LossFunctionsDownloads.vue` | Consolidated reproducibility downloads | ✓ VERIFIED | All 16 registered assets are grouped, localized, and base-safe. |
| `WhyLossLab.vue`, `RegressionLossLab.vue`, `ClassificationLossLab.vue` | Real-row primary learning interactions | ✓ VERIFIED | Validated summary props feed the shared TypeScript math authority; bounded labeled fallbacks remain available. |
| `scripts/qa/lossFunctionsBrowserMatrix.js` | Bilingual responsive release behavior | ✓ VERIFIED | Covers root plus seven deep links, interactions, checkpoints, downloads, requests, console, overlap, overflow, and reduced motion. |
| Six focused loss test files plus `algorithm-progress.test.ts` | Numerical/content/asset/compatibility/UI coverage | ✓ VERIFIED | Verifier run passed 88/88, including the 57.35s standalone offline-check case. |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| Generator | Data contract | Exact approval/license/privacy checks | ✓ WIRED | Contract constants and required statements are consumed before generation. |
| Dataset tests | Generator | CLI and failure injections | ✓ WIRED | Bootstrap, offline, strict JSON, source/privacy/schema, candidate, and drift paths execute. |
| `lossFunctions.ts` | `lossFunctionsMath.ts` | Imported pure primitives | ✓ WIRED | The GSD pattern probe missed the explicit `.ts` suffix; manual inspection verifies the import and calls. |
| Math tests | `lossFunctionsMath.ts` | Direct numerical behavior | ✓ WIRED | Named tests passed for values, guards, stability, kink, sweep, and simulation. |
| Generator | Requirements/environment/wheel cache | Exact pins and no-index validation | ✓ WIRED | Hashes and environment drift are checked before candidate execution. |
| Generator | Ignored staging | Complete candidate transaction | ✓ WIRED | Only the exact ignored staging root is accepted. |
| Notebook tests | TypeScript math | Cross-runtime recomputation | ✓ WIRED | Full-row objectives, per-row values, gradients, probes, and sweeps match. |
| Staging | Public dataset/Notebook groups | Complete atomic swap | ✓ WIRED | One validated 16-member two-group publication transaction. |
| Output manifest | Four Notebooks and outputs | Path/hash/size/standalone proofs | ✓ WIRED | 15/15 non-self hash entries independently verified. |
| Public asset tests | `withPublicBase` | Root and Pages path checks | ✓ WIRED | Focused base tests passed 3/3. |
| Module | Typed asset registry | Topic/output/asset/code IDs | ✓ WIRED | Seven chapter bindings are imported and attached. |
| Module | Checkpoint registry | Existing `loss-functions` checkpoints | ✓ WIRED | The GSD regex probe was invalid; actual import/assignment is at module lines 3 and 25. |
| Compatibility tests | Progress stores | Exact V1/V2 identities | ✓ WIRED | Storage keys and submission behavior are tested without production authority edits. |
| Lesson registry | Pure math | Validated props into four math-owning child labs | ✓ WIRED | The direct parent does not duplicate math; child labs import the authority, which is the intended architecture. |
| Results | Typed asset registry | Validated output IDs and paths | ✓ WIRED | Active chapter selects, fetches, parses, and renders only registered summaries. |
| Downloads | `withPublicBase` | Base-safe links | ✓ WIRED | Every download href is computed from a registered local path. |
| Algorithm view | Loss lesson/results/downloads | Lazy special page branch | ✓ WIRED | StoryScroller renders lab/results per chapter, checkpoint remains, downloads appear once after it. |
| Generic router | Algorithm view | Lazy `/learn/:moduleId/:lessonId` | ✓ WIRED | All seven chapter URLs resolve without adding a special route. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|---|---|---|---|---|
| `LossFunctionsLessonLab.vue` | `regressionSummary`, `bceSummary` | Base-safe fetch of registered public summary, then strict parser | Yes — 31,415 LaDe rows / 1,567 SECOM OOF rows | ✓ FLOWING |
| Primary loss labs | Representative row arrays | Validated summary props; explicit labeled fallback only on load failure | Yes — locked real course row IDs and output/logit values | ✓ FLOWING |
| `LossFunctionsResults.vue` | Rows, aggregates, probes, sweeps, plot | Strictly validated public summary and typed plot descriptor | Yes — direct locked output tables and local PNG | ✓ FLOWING |
| `LossFunctionsDownloads.vue` | Grouped asset list | Exact 16-member typed registry | Yes — every path exists under `public/` | ✓ FLOWING |
| Executed Notebooks | Dataset arrays and output JSON/PNG | Package-relative normalized local CSVs | Yes — no runtime remote source | ✓ FLOWING |
| Public package | Manifest inventory | Staged candidate plus source/generator/environment hashes | Yes — exact candidate bytes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command/evidence | Result | Status |
|---|---|---|---|
| All focused phase behavior | `node --test` over six loss suites plus algorithm progress | 88/88 passed in 64.6s | ✓ PASS |
| Offline standalone reproducibility | Named focused test invokes real offline check | Four copied public Notebooks reran; repository bytes/mtimes unchanged | ✓ PASS |
| Full-data numerical parity | Verifier Node script recomputed LaDe MSE/MAE and SECOM BCE using `lossFunctionsMath.ts` | Exact MSE/MAE; BCE differed only by ~2e-16 aggregation order; representative rows, confident error, and sweeps matched | ✓ PASS |
| Public integrity | Independent SHA-256/size walk over manifest | 15/15 non-self entries; 16 members; 22,011,681 bytes | ✓ PASS |
| Root/Pages assets | `node --test --test-name-pattern="base|Pages|asset" ...` | 3/3 passed | ✓ PASS |
| Security | `npm run security:audit` | 0 vulnerabilities; installed PostCSS 8.5.24 / Nanoid 3.3.16 | ✓ PASS |
| Full repository and builds | Supplied final release evidence after dependency repair | `npm test` 837/837; standard build and Pages build passed, existing chunk warning only | ✓ PASS |
| Browser behavior | Supplied final Playwright release evidence | 32/32 across locale, viewport, root, and seven deep links | ✓ PASS |

### Probe Execution

| Probe | Command | Result | Status |
|---|---|---|---|
| Offline public package probe | `python3 scripts/loss-functions/build-phase-26-assets.py --check --offline` (executed by the focused standalone test; also present in final release evidence) | 16 exact members, four independent reruns, no external network/repository write | PASS |
| Browser release probe | `scripts/qa/lossFunctionsBrowserMatrix.js` through the committed Playwright CLI flow | Supplied final gate: 32/32, zero layout/console/request failures | PASS |
| Conventional shell probes | `find scripts -path '*/tests/probe-*.sh'` | No Phase 26 `probe-*.sh` is declared or present | N/A |

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|---|---|---|---|---|
| LOSS-01 | 26-01 through 26-07 | Calculate MSE, MAE, stable BCE on fixed examples and aggregate per-example losses. | ✓ SATISFIED | Pure math, real summaries, Notebooks, typed lesson bindings, and primary labs agree; independent full-data recomputation passed. |
| LOSS-02 | 26-01 through 26-07 | Explain outlier and confident-wrong influence using loss scale and gradients. | ✓ SATISFIED | Real long-duration LaDe comparison and real confident-error SECOM row are rendered and exercised by the browser matrix. |
| LOSS-03 | 26-01 through 26-07 | Run vectorized NumPy losses and verify displayed gradients with finite differences. | ✓ SATISFIED | Four clean-kernel Notebooks rerun offline; stable extremes, central differences, h sweep, errors/tolerances, and honest MAE kink all pass. |

No Phase 26 requirement is orphaned: REQUIREMENTS.md maps exactly LOSS-01,
LOSS-02, and LOSS-03 to Phase 26, and every plan declares all three.

### Anti-Patterns Found

| File | Line/area | Pattern | Severity | Impact |
|---|---|---|---|---|
| Phase-owned source/test files | Full scan of 25 text/source files | No `TBD`, `FIXME`, `XXX`, `TODO`, `HACK`, placeholder, or console-only implementation | None | No completion blocker. |
| `LossFunctionsResults.vue` | 162, 172 | `return []` | ℹ️ Info | Valid empty/loading guards; real data is populated by the active summary fetch and rendered when present. |
| `26-VALIDATION.md` | Frontmatter/status map | Still says `status: draft`, `wave_0_complete: false`, and planning-time pending rows | ℹ️ Info | Stale planning metadata is not accepted as evidence. It does not affect goal achievement because all planned test files now exist and verifier checks passed independently. |

### Disconfirmation Audit

The adversarial second pass found no failed or uncertain must-have, but it did
identify three evidence-quality caveats:

1. `tests/loss-functions-labs.test.mjs` is primarily a source-contract suite; by
   itself it would not prove live interaction. The separate 32/32 Playwright
   matrix supplies the behavioral evidence.
2. The GSD key-link query reported three apparent failures: an explicit `.ts`
   import suffix, an invalid generated checkpoint regex, and an intentionally
   indirect parent→child→math link. Manual source tracing resolves all three.
3. Malformed/missing summary JSON is covered by strict parser corruption tests
   and a deterministic visible fallback code path, but the final browser matrix
   exercises the successful local-asset path rather than injecting a live 404.
   This is not a must-have gap: formulas, examples, and labs are structurally
   independent of the result panel, and no required outcome depends on the
   error banner transition.

### Downstream Handoffs

- Full linear-regression parameter gradients/fitting are intentionally handed
  to Phase 27. Phase 27's roadmap goal explicitly covers MSE gradients and three
  fitting methods.
- Logistic parameter gradients/training are intentionally handed to Phase 29.
  The final Phase 26 chapters name both Phase 27 and Phase 29 and limit this
  phase to `dL/dŷ` and `dL/dz`.
- Equal-depth multiclass/threshold work remains in Phase 30. Phase 26 retains
  only the concise Softmax bridge required by its contract.

These are explicit later-phase boundaries, not deferred Phase 26 gaps.

### Human Verification Required

None. Visual/responsive behavior, reduced motion, interactions, code copy,
checkpoint presence, local requests, and console/layout checks have automated
browser evidence. All behavior-dependent numerical, rollback, read-only, and
compatibility truths have passing named tests.

### Gaps Summary

No gaps. No overrides were needed. The two pre-existing workspace changes
`.planning/config.json` and `docs/gpt_advice.md` were not modified.

---

_Verified: 2026-07-28T17:01:34Z_
_Verifier: the agent (gsd-verifier)_
