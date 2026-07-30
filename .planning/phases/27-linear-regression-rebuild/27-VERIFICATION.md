---
phase: 27-linear-regression-rebuild
verified: 2026-07-29T14:25:17Z
status: gaps_found
score: 41/52 must-haves verified
behavior_unverified: 1
overrides_applied: 0
gaps:
  - truth: "One reproducible Bike case drives the interactive row-to-batch, fitting, and diagnostic workbench."
    status: failed
    reason: "The strict published package is coherent, but the simulation facade supplies different features, targets, predictions, residuals, and diagnostic-bin values for the same Bike instant IDs. Several lab controls update only their labels and do not drive the displayed evidence."
    artifacts:
      - path: "src/simulations/linearRegression.ts"
        issue: "BIKE_DISPLAY_RECORDS invents values for real instant IDs; every selected facade observation disagrees with the committed source and heldout-residuals.csv."
      - path: "src/simulations/linearRegressionBike.ts"
        issue: "LINEAR_REGRESSION_HELDOUT_DIAGNOSTIC_INPUT contains rounded/drifted prediction-bin and named-case fixtures that do not match the strict published summary."
      - path: "src/components/LinearRegressionLessonLab.vue"
        issue: "rowBatchMode, gdTraceStep, methodFocus, coefficientSpace, selectedHeldoutCase, and atempComparison are read mainly as control labels; they do not select matching trace rows/results/cases."
      - path: "tests/linear-regression-simulation.test.ts"
        issue: "Tests assert the drifted facade fixtures instead of cross-checking the source CSV, strict summary, or residual CSV."
    missing:
      - "Derive browser simulation/display rows and diagnostic arrays from the exact source/strict published contract, or use exact generated constants."
      - "Wire row/batch, GD trace, method, coefficient-space, named-case, and atemp controls to visible result changes."
      - "Add cross-authority tests that compare facade rows, predictions, residuals, bins, and cases with the strict summary/CSV package."
  - truth: "The completed lesson hands learners to the Phase 28 tabular-regression project."
    status: failed
    reason: "The regularization chapter copy promises the Phase 28 project, but the rendered final bridge links directly to /learn/logistic-regression. The browser matrix checks only that a bridge exists."
    artifacts:
      - path: "src/components/LinearRegressionPagedLesson.vue"
        issue: "Final router-link target and CTA point to logistic regression instead of the existing tabular/housing project identity."
      - path: "scripts/qa/linearRegressionBrowserMatrix.js"
        issue: "nextStepPresent validates presence but not href or the required Phase 28 destination."
    missing:
      - "Point the final bridge at the canonical existing tabular-regression/housing project route."
      - "Assert the exact bridge href and localized Phase 28 handoff in source and browser tests."
  - truth: "Every PLAN frontmatter artifact exists at its declared path or has an accepted verification override."
    status: partial
    reason: "Four Plan 27-03 staging paths under .cache/.../public/notebooks/... do not exist. Substantive equivalents exist under .cache/.../notebooks/... and were published successfully, but the documented deviation has no accepted override."
    artifacts:
      - path: ".cache/linear-regression/phase-27-staging/public/notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb"
        issue: "Missing; actual candidate is .cache/linear-regression/phase-27-staging/notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb."
      - path: ".cache/linear-regression/phase-27-staging/public/notebooks/linear-regression/bike-linear-regression.en.ipynb"
        issue: "Missing; actual candidate is under the reconciled notebooks/ path."
      - path: ".cache/linear-regression/phase-27-staging/public/notebooks/linear-regression/linear-regression-summary.json"
        issue: "Missing; actual candidate is under the reconciled notebooks/ path."
      - path: ".cache/linear-regression/phase-27-staging/public/notebooks/linear-regression/output-manifest.json"
        issue: "Missing; actual candidate is under the reconciled notebooks/ path."
    missing:
      - "Either align the declared Plan 27-03 paths with the generated package or record an explicit accepted verification override for the intentional path reconciliation."
behavior_unverified_items:
  - truth: "The committed root browser matrix is an effective release gate for both locales, desktop/390px layouts, interactions, and reduced motion."
    test: "Serve the root build on 127.0.0.1:4173 and run scripts/qa/linearRegressionBrowserMatrix.js, then repeat semantic checks after fixing the lab wiring."
    expected: "36/36 cases pass, all six lab controls change the corresponding visible evidence, the final bridge targets Phase 28, and no overflow, overlap, console, link, request, or reduced-motion failures occur."
    why_human: "No preview server was already running, and verifier spot-check rules prohibit starting a service. The full Node suite validates the matrix source but does not execute it."
---

# Phase 27: Linear Regression Rebuild Verification Report

**Phase Goal:** Rebuild `linear-regression` around one reproducible regression case that connects matrix prediction, MSE gradients, three fitting methods, coefficient meaning, and held-out residual diagnosis.
**Verified:** 2026-07-29T14:25:17Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

The clean-kernel, strict-asset, bilingual-content, route/checkpoint/progress, build, and offline-reproduction work is substantive. The phase goal is nevertheless not achieved because the interactive workbench is not using the same reproducible case as the published authority, several controls are presentation-only, and the final next-step route skips the promised Phase 28 project.

### Observable Truths

Statuses below merge all five ROADMAP success criteria with every PLAN frontmatter truth. No PLAN truth was used to narrow the ROADMAP contract.

| ID | Truth | Status | Evidence |
| --- | --- | --- | --- |
| R1 | One bilingual notation contract links affine prediction, residuals, MSE gradients, coefficients, and code names. | ✓ VERIFIED | `linearRegressionModule.ts`, `linearRegressionBike.ts`, both executed Notebooks, and strict content/math tests use `prediction - actual`, `Xw+b`, `grad_w`, and `grad_b`. |
| R2 | Clean-kernel Notebook reproduction compares NumPy batch GD, normal equation/lstsq, and sklearn on one fixed split. | ✓ VERIFIED | Independent `--check --offline` reran both locale Notebooks; manifest records distinct kernels and identical code/output hashes. |
| R3 | Three-method coefficients, predictions, and metrics agree within documented tolerances with method/objective differences explicit. | ✓ VERIFIED | Published summary reports max coefficient delta `2.7979e-8` and max prediction delta `2.3822e-8` against tolerance `1e-6`; OLS/Ridge/Lasso objectives are separate. |
| R4 | Held-out residual/coefficient-stability views identify model limitations after optimization proof. | ✓ VERIFIED | Strict summary and `LinearRegressionResults.vue` gate diagnostics behind converged GD/method agreement and show hourly shape, widening spread, atemp instability, named cases, and log1p scope. |
| R5 | Existing route, checkpoint, interactive lab, downloads, tests, and both builds remain valid. | ✗ FAILED | Route/checkpoint/download/builds pass, but the interactive lab displays drifted rows and has label-only controls. |
| P01.1 | A DOM-free authority implements feature order, prediction, residual, MSE gradients, metrics, and coefficient conversion. | ✓ VERIFIED | `linearRegressionBike.ts` exports guarded pure functions; focused math tests pass. |
| P01.2 | Exact split, train-only scaling, unscaled workingday, and leakage exclusions are represented. | ✓ VERIFIED | Constants/parser lock 13,903/3,476, `ddof=0`, four continuous features, unscaled `workingday`, and excluded `casual`/`registered`. |
| P01.3 | Deterministic zero-init GD uses 0.1/5,000/1e-8, stops at 772, and checks 1e-6 agreement. | ✓ VERIFIED | Source constants, generated trace (773 rows including update 0), summary, and tests agree. |
| P01.4 | Pure reducers expose residual shape, spread, named cases, atemp/Ridge, and log1p concepts. | ✓ VERIFIED | Reducer shapes and guard behavior exist and tests pass; exact browser data flow is separately failed below. |
| P01.5 | Stable facade remains while synthetic/California values cease to be the primary numerical authority. | ✗ FAILED | California was removed, but `BIKE_DISPLAY_RECORDS` and diagnostic fixtures are invented approximations presented under real Bike instant IDs. |
| P02.1 | The committed 17,379-row Bike snapshot is the sole source and ordinary generation is local/offline. | ✓ VERIFIED | Source bridge delegates to `bikeSharingContract.mjs`; SHA is `e03de4...504f`; no runtime dataset fetch exists. |
| P02.2 | One indivisible inventory owns two executed Notebooks and all seven supporting files. | ✓ VERIFIED | Public and reconciled staging packages each contain exactly nine members totaling 704,691 bytes. |
| P02.3 | Generator freezes features, leakage, split, scaler, intercept, and method roles. | ✓ VERIFIED | Manifest `contract` and strict generator checks contain every listed convention. |
| P02.4 | Bilingual normal-equation mapping and deterministic teaching-row roles precede generation. | ✓ VERIFIED | Both locale Notebook markdown and manifest contain terminology/formula/mappings and five locked instants. |
| P02.5 | Staging is ignored/non-public and failures clean without partial publication. | ✓ VERIFIED | `.gitignore`, candidate transaction checks, rollback tests, and residue checks pass. |
| P02.6 | No registry resolution/package drift is introduced. | ✓ VERIFIED | Requirements match inherited eight pins; offline environment verifies local wheel hashes with `--no-index`. |
| P03.1 | Full calculation uses raw `cnt`, five primary features, controlled `atemp`, and no leakage input. | ✓ VERIFIED | Summary/manifest/Notebook code and strict parsers agree. |
| P03.2 | All three methods share split, scaler, transformed matrix, and intercept convention. | ✓ VERIFIED | Notebook code and method metadata use the same matrices; parity is below `1e-6`. |
| P03.3 | Both Notebooks teach augmented normal equation, theta mapping, and stable `lstsq`. | ✓ VERIFIED | Seven executed code cells plus localized markdown contain the full contract. |
| P03.4 | GD, lstsq, and sklearn fulfill distinct roles and pass coefficient/prediction tolerance. | ✓ VERIFIED | Generated agreement record passes with full-precision deltas. |
| P03.5 | Locale Notebooks share code, run independently, and normalize to identical outputs. | ✓ VERIFIED | `codeSha256=23e673...2349`, `normalizedOutputSha256=ed1547...6480`, distinct execution proofs. |
| P03.6 | Candidate includes complete coefficient/trace/residual output and staged diagnosis. | ✓ VERIFIED | Reconciled staging/public package contains 24 coefficient rows, 773 trace rows, and 3,476 residual rows. |
| P03.7 | Representative/named selection freezes instants and tie-break rules. | ✓ VERIFIED | Manifest and strict parser lock 11550, 17213, 15628, 14965, 15604 and exact role rules. |
| P04.1 | Nine public members publish only after complete transaction verification. | ✓ VERIFIED | Publisher and transaction/corruption tests pass. |
| P04.2 | Absent/replacement publication rolls back exact bytes/modes on injected failures. | ✓ VERIFIED | Full suite executed the rollback matrix successfully. |
| P04.3 | Offline check reruns both Notebooks externally and proves repository immutability. | ✓ VERIFIED | Verifier rerun passed: 9 members, 2 Notebooks, 1,366 entries byte/size/mtime-clean. |
| P04.4 | Public package preserves compact/full residual values with no runtime network/partial package. | ✓ VERIFIED | Exact local inventory and complete residual CSV verified. |
| P04.5 | Tolerance/hash/contract/parity/non-finite corruption fails closed. | ✓ VERIFIED | Publication and strict parser corruption matrices pass. |
| P05.1 | Runtime consumers use only nine typed, local, base-safe assets. | ✓ VERIFIED | Literal registry plus `withPublicBase` wiring verified. |
| P05.2 | Summary parser locks source, split, features, sign, tolerance, finite values, and bounds. | ✓ VERIFIED | `parseLinearRegressionSummary` exact-key checks and corruption tests pass. |
| P05.3 | Bad/cross-generation data fails closed without component repair. | ✓ VERIFIED | Strict parser throws; Vue fallback hides locked metrics rather than recomputing them. |
| P05.4 | Typed chapter bindings expose all semantic outputs/downloads. | ✓ VERIFIED | Eight chapter IDs map only to registered output and asset IDs. |
| P05.5 | Parser locks the five teaching instants and selection contract. | ✓ VERIFIED | Exact checks at summary/manifest boundaries pass. |
| P05.6 | Root and Pages base paths work without remote fallback. | ✓ VERIFIED | Static base tests and both builds pass. |
| P06.1 | Eight preserved chapter IDs remain reachable in locked order/titles. | ✓ VERIFIED | Module, adapter, router, and progress tests agree on all eight IDs. |
| P06.2 | Every chapter has complete paired teaching-loop content and next step. | ✓ VERIFIED | Content tests pass for both locales; chapter-level next steps are present. |
| P06.3 | Narrative preserves raw target, leakage, method roles, coefficient meaning, and objective distinctions. | ✓ VERIFIED | Bilingual typed content and output bindings verify each concept. |
| P06.4 | Chapter 5 teaches normal equation/正规方程, pseudoinverse, theta mapping, `lstsq`, and three methods. | ✓ VERIFIED | Exact bilingual strings/formulas are present and tested. |
| P06.5 | Diagnosis follows optimization and covers nonlinearity, spread, atemp, cases, log1p, and review. | ✓ VERIFIED | Typed narrative and strict results panel preserve this sequence. |
| P06.6 | Module/route/chapter/checkpoint/progress, safe rendering, Pages, responsive and media contracts remain compatible. | ✓ VERIFIED | Identity/progress tests, safe source scans, styles, and both builds pass. |
| P07.1 | Learners trace one locked real row through prediction/residual/loss/gradient to a matching batch state. | ✗ FAILED | The strict result row is correct, but row/batch selection changes only its label and does not reveal a different matching state. |
| P07.2 | Controls replay actual GD trace, methods, and coefficient spaces without Vue-owned fitting. | ✗ FAILED | Core math stays outside Vue, but `gdTraceStep`, `methodFocus`, and `coefficientSpace` do not drive the visual/result data. |
| P07.3 | Guided controls prove convergence then expose the complete limitation sequence. | ✗ FAILED | Stage labels exist, but facade arrays differ from the published diagnostics and named-case/atemp selections do not change evidence. |
| P07.4 | States have labels/current values/reset/keyboard support and non-color/non-motion cues. | ✓ VERIFIED | Source structure and CSS meet the stated accessibility contract. |
| P07.5 | No synthetic primary result remains and retained visuals match the Bike case. | ✗ FAILED | Six real instant IDs are paired with non-source feature/target values in the primary SVG/table facade. |
| P07.6 | Deterministic plots/current workbench carry the exact teaching contract without new 3D/Manim critical path. | ✗ FAILED | No new 3D/Manim exists, but the deterministic plot data do not match the generated authority. |
| P08.1 | Paged lesson composes chapters, checkpoint, one download area, and correct next-step bridge. | ✗ FAILED | Composition/checkpoint/downloads pass; final bridge skips Phase 28 and targets logistic regression. |
| P08.2 | Typed base-safe loads/downloads fail closed to bilingual static content. | ✓ VERIFIED | Registered `withPublicBase` fetches, aborts, strict parsing, and static fallbacks are present. |
| P08.3 | Both locales/viewports can navigate and operate every lab/download without layout/link/accessibility failure. | ✗ FAILED | Several controls are hollow; source matrix checks input values, not corresponding evidence changes. |
| P08.4 | Copy is learner-facing and no semantically inconsistent media remains. | ✗ FAILED | Terminology passes, but primary Bike visuals display inconsistent data. |
| P08.5 | Offline/tests/build/browser/Pages/security gates all block release. | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Every non-browser gate was rerun successfully; the committed browser matrix could not be executed without starting a preview service. |
| P08.6 | Protected hashes/status/index, scope allowlists, residue, and no-remote scans are enforced. | ✓ VERIFIED | Source tests pass; protected hashes/status/index match after verifier checks. |

**Score:** 41/52 truths verified (1 present, behavior-unverified)

### Required Artifacts

| Plan | Artifact | Expected | Status | Details |
| --- | --- | --- | --- | --- |
| 01 | `src/simulations/linearRegressionBike.ts` | Pure Bike math/diagnostics | ⚠️ PARTIAL | Substantive and wired, but its built-in diagnostic fixtures drift from the generated authority. |
| 01 | `tests/linear-regression-math.test.ts` | Numerical/guard contract | ✓ VERIFIED | Substantive and executed. |
| 01 | `tests/linear-regression-simulation.test.ts` | Facade contract | ⚠️ PARTIAL | Executed, but certifies drifted fixtures rather than cross-authority parity. |
| 02 | `scripts/linear-regression/verify-bike-source.mjs` | Existing-source bridge | ✓ VERIFIED | Imports/calls `bikeSharingContract.mjs`; source check passes. |
| 02 | `scripts/linear-regression/build-phase-27-assets.py` | Offline transaction/generator | ✓ VERIFIED | 4,097 lines, substantive, all CLI gates exercised. |
| 02 | `tests/linear-regression-notebook-assets.test.ts` | Asset/candidate/release contract | ✓ VERIFIED | Substantive; full suite executed all active tests. |
| 03 | `.cache/.../public/notebooks/.../bike-linear-regression.zh-CN.ipynb` | Executed Chinese candidate | ✗ MISSING | Reconciled candidate exists under `.cache/.../notebooks/...`; no override accepts path deviation. |
| 03 | `.cache/.../public/notebooks/.../bike-linear-regression.en.ipynb` | Executed English candidate | ✗ MISSING | Reconciled candidate exists under `.cache/.../notebooks/...`. |
| 03 | `.cache/.../public/notebooks/.../linear-regression-summary.json` | Candidate summary | ✗ MISSING | Reconciled candidate exists under `.cache/.../notebooks/...`. |
| 03 | `.cache/.../public/notebooks/.../output-manifest.json` | Candidate manifest | ✗ MISSING | Reconciled candidate exists under `.cache/.../notebooks/...`. |
| 04 | `public/notebooks/linear-regression/output-manifest.json` | Published package authority | ✓ VERIFIED | Exact nine-member inventory/hashes/proofs. |
| 04 | `public/notebooks/linear-regression/heldout-residuals.csv` | Complete held-out rows | ✓ VERIFIED | 3,476 ordered data rows; arithmetic checked. |
| 04 | `scripts/linear-regression/build-phase-27-assets.py` | Publisher/rollback/offline check | ✓ VERIFIED | Wired and independently exercised. |
| 05 | `src/data/linearRegressionAssets.ts` | Typed registry/parsers/bindings | ✓ VERIFIED | Substantive exact-key validation and immutable copies. |
| 05 | `tests/linear-regression-assets.test.ts` | Parser/inventory/base tests | ✓ VERIFIED | Executed successfully. |
| 06 | `tests/linear-regression-content.test.mjs` | Bilingual corridor contract | ✓ VERIFIED | Executed successfully. |
| 06 | `src/data/linearRegressionModule.ts` | Rebuilt typed course | ✓ VERIFIED | Substantive paired content, wired through async catalog. |
| 06 | `src/curriculum/adapters/algorithmAdapter.ts` | Preserved/reordered IDs | ✓ VERIFIED | Module/adapter order and progress fixtures agree. |
| 07 | `tests/linear-regression-labs.test.mjs` | Lab/accessibility contract | ⚠️ PARTIAL | Active source tests pass, but four final tests remain skipped and behavior assertions do not catch hollow controls. |
| 07 | `src/components/LinearRegressionLessonLab.vue` | Eight-state interaction composition | ✗ HOLLOW | Substantive component, but major controls are not connected to displayed evidence. |
| 07 | `src/components/LinearRegressionResults.vue` | Strict generated-result presentation | ✓ VERIFIED | Loads/parses real summary and displays correct methods/diagnostics. |
| 08 | `src/components/LinearRegressionDownloads.vue` | Nine local downloads | ✓ VERIFIED | All nine descriptors grouped and base-safe. |
| 08 | `scripts/qa/linearRegressionBrowserMatrix.js` | 36-case browser matrix | ⚠️ PARTIAL | Substantive script; not rerun and semantic assertions miss control-output/bridge-target correctness. |
| 08 | `tests/linear-regression-release.test.mjs` | Final release source contract | ⚠️ PARTIAL | Executed, but checks matrix tokens/presence rather than goal-level semantics. |

### Key Link Verification

| Plan | From | To | Status | Details |
| --- | --- | --- | --- | --- |
| 01 | `linearRegression.ts` | `linearRegressionBike.ts` | ⚠️ PARTIAL | Imported/called, but facade adds a second drifted data authority. |
| 01 | math tests | research anchors | ✓ WIRED | Split/772/1e-6 anchors found and executed. |
| 02 | source bridge | Bike contract | ✓ WIRED | Direct import and invocation. |
| 02 | generator | environment contract | ✓ WIRED | Exact offline/no-index verification. |
| 03 | generator | TypeScript numerical contract | ✓ WIRED | Shared features/sign/stopping constants present. |
| 03 | manifest | locale Notebooks | ✓ WIRED (reconciled path) | Manifest carries Notebook hashes, code/output hashes, and fresh-kernel proofs under actual path. |
| 04 | publisher | public manifest | ✓ WIRED | Complete validate/copy/lock/swap/final-verify flow. |
| 04 | Notebook tests | public English Notebook | ✓ WIRED | External rerun/parity test executed. |
| 05 | registry | public manifest | ✓ WIRED | Exact inventory and generation checks. |
| 05 | registry/components | `publicPath.ts` | ✓ WIRED | Consumers call `withPublicBase`. |
| 06 | module | chapter asset bindings | ✓ WIRED | Typed output IDs, no copied full table. |
| 06 | adapter | progress tests | ✓ WIRED | Reordered IDs exercised through V1/V2 fixtures. |
| 07 | lesson lab | simulation facade | ✗ HOLLOW | Called, but several controls never alter facade/result selection. |
| 07 | results | strict asset parser | ✓ WIRED | Real generated summary flows into displayed results. |
| 08 | paged lesson | chapter assets/summary | ✓ WIRED | Registered fetch/parse/binding flow. |
| 08 | downloads | `withPublicBase` | ✓ WIRED | Every link resolves through helper. |
| 08 | browser matrix | deep routes | ⚠️ PRESENT | Exact route list exists; runtime execution was not repeated. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| Executed Notebooks/results | fit, metrics, diagnostics | Committed Bike CSV via verified generator | Yes | ✓ FLOWING |
| `linearRegressionAssets.ts` | strict summary/CSV objects | Nine-member public package | Yes, exact and fail-closed | ✓ FLOWING |
| `LinearRegressionResults.vue` | methods, coefficients, residuals, cases | Strict parsed summary | Yes | ✓ FLOWING |
| `LinearRegressionLessonLab.vue` controls | row/batch, GD step, method, coefficient, case, atemp | Local refs | Values change, evidence generally does not | ✗ HOLLOW |
| `LinearRegressionUnivariateView.vue` | samples and diagnostic evidence | Simulation facade | Non-empty but inconsistent with source/published package | ✗ DRIFTED |
| Final lesson bridge | next module route | Hardcoded router-link | Points to wrong downstream module | ✗ MISWIRED |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Independent offline reproducibility | `python3 scripts/linear-regression/build-phase-27-assets.py --check --offline` | 9 members; 2 independent Notebook reruns; 1,366 entries unchanged | ✓ PASS |
| Full repository suite | `npm test` | 928 pass, 0 fail, 4 skip | ✓ PASS with warning |
| Standard production build | `npm run build` | Build succeeded; existing large-chunk advisory | ✓ PASS |
| GitHub Pages build | `npm run build:pages` | Build succeeded under Pages mode | ✓ PASS |
| Security audit | `npm run security:audit` | 0 vulnerabilities | ✓ PASS |
| Facade/source parity | Inline Node comparison of all `selectedObservation` rows against `heldout-residuals.csv` | 0/7 observations matched; six unique instant IDs all drift | ✗ FAIL |
| Phase 28 handoff | Inspect final `router-link` | `/learn/logistic-regression` | ✗ FAIL |
| Root browser matrix | Existing server check plus matrix discovery | No server at 127.0.0.1:4173; matrix not started | ? SKIP / HUMAN |
| Whitespace/protected baseline | `git diff --check`, SHA-256, cached-index/status checks | Clean; protected hashes exact and unstaged | ✓ PASS |

### Probe Execution

Step 7c was skipped: no `scripts/**/tests/probe-*.sh` probe is declared or present for Phase 27. The documented offline CLI gate was executed directly and is recorded above.

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| LINR-01 | 01, 05–08 | Connect affine prediction, residuals, MSE gradients, coefficients | ✓ SATISFIED | Pure authority, bilingual content, strict representative row, and result panel implement the conceptual contract. |
| LINR-02 | 01–04, 06–08 | Reproduce locked NumPy batch GD | ✓ SATISFIED | Both Notebooks independently reran to the 772-update result offline. |
| LINR-03 | 01–08 | Compare normal equation, GD, sklearn on same split | ✓ SATISFIED | Exact generated method deltas and method table pass `1e-6`; the phase-level lab consistency gap remains separate. |
| LINR-04 | 01, 03–08 | Diagnose held-out residual/coefficient limitations | ✓ SATISFIED | Strict result panel exposes hourly/spread/case/atemp/Ridge/Lasso/log1p evidence after convergence. |

No Phase 27 requirement is orphaned: all four IDs appear in PLAN frontmatter and REQUIREMENTS.md maps no additional ID to this phase.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `src/simulations/linearRegression.ts` | 58 | Hardcoded fake values under real Bike IDs | 🛑 Blocker | Primary SVG/table evidence conflicts with source and downloadable results. |
| `src/simulations/linearRegressionBike.ts` | 750 | Second approximate diagnostic data authority | 🛑 Blocker | Simulation tests and browser visuals can drift from the strict generated package. |
| `src/components/LinearRegressionLessonLab.vue` | 174 | Label-only interaction refs | 🛑 Blocker | Controls appear operable but do not replay/select their promised evidence. |
| `src/components/LinearRegressionPagedLesson.vue` | 486 | Hardcoded wrong downstream route | 🛑 Blocker | Learning path skips the Phase 28 project promised by course content. |
| `tests/linear-regression-labs.test.mjs` | 220 | Four completed-phase tests remain skipped | ⚠️ Warning | Full suite is green without executing the deferred page/download/style/browser cases in this file. |

No unreferenced `TBD`, `FIXME`, or `XXX` markers were found in Phase 27 modified files.

### Human Verification Required

After the blocking fixes:

1. Run the committed 36-case browser matrix against the root preview.
2. In both locales at 1440×1000 and 390×844, confirm each control changes the corresponding visible numerical evidence, not just its selected label.
3. Verify the final bridge opens the existing Phase 28 tabular/housing project route.
4. Confirm focus, non-color cues, static/reduced-motion explanations, downloads, checkpoint feedback, and no-overflow behavior remain intact.

### Gaps Summary

The generated numerical package is excellent and independently reproducible. The phase misses its goal at the browser integration boundary: a second, inconsistent simulation data source feeds the interactive plots; the main controls are mostly hollow; and the final learning-path link skips the promised next project. The stale Plan 27-03 paths are additionally unresolved as literal must-have artifacts, despite valid reconciled equivalents.

The drift does not match a clearly deferred later-phase deliverable. Phase 31 will re-audit cross-module consistency, but Phase 27 itself explicitly requires the current lab and same-case numerical contract, so these gaps remain actionable here.

For the Plan 27-03 path deviation, the generated/public package clearly achieves the intent. To accept the deviation instead of changing the declared paths, add an explicit accepted override with the reconciled path reason, developer identity, and timestamp; the existing SUMMARY narration is not an override.

---

_Verified: 2026-07-29T14:25:17Z_
_Verifier: the agent (gsd-verifier)_
