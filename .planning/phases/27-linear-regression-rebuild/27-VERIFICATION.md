---
phase: 27-linear-regression-rebuild
verified: 2026-07-30T09:33:15Z
status: gaps_found
score: 51/52 must-haves verified
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 41/52
  gaps_closed:
    - "One strict Bike package now drives the simulation facade, all six workbench selectors, and the visible numerical outputs; cross-authority tests compare source CSV, published JSON/CSVs, selectors, compact baseline, and facade snapshots."
    - "The final lesson bridge now targets the existing Phase 28 housing project route and is asserted by source and browser checks."
    - "Plan 27-03 now declares the actual ignored staging package paths under .cache/linear-regression/phase-27-staging/notebooks/linear-regression/."
    - "The committed browser matrix was independently rerun: 36/36 cases, four semantic interaction runs, eight failure injections, and zero route/layout/request/console/warning failures."
  gaps_remaining:
    - "Learner-facing linear-regression UI still renders the prohibited standalone terms 证据 / Evidence."
  regressions: []
gaps:
  - truth: "Learner-facing linear-regression copy uses plain result/observation/comparison/reference-output terminology and does not use 证据 / Evidence as a navigation label or unexplained teaching term."
    status: failed
    reason: "LinearRegressionUnivariateView renders 锁定证据, 逐行损失证据, 证据, Locked evidence, Per-row loss evidence, and Evidence in the visible panel heading and SVG accessible name. The current terminology test scans only linearRegressionModule.ts, so it passes without examining this rendered component."
    artifacts:
      - path: "src/components/LinearRegressionUnivariateView.vue"
        issue: "Lines 40-49 and 70-79 define prohibited learner-facing labels; lines 355-363 render them visibly and in the SVG aria-label."
      - path: "tests/linear-regression-content.test.mjs"
        issue: "Lines 212-223 claim a plain-terminology contract but only apply the 证据 exclusion to moduleSource, not the Phase 27 Vue components."
    missing:
      - "Replace the visible 证据 / Evidence labels with the approved result, observation, comparison, or reference-output wording in both locales."
      - "Expand the terminology test to scan the rendered linear-regression component copy, especially LinearRegressionUnivariateView.vue, so this regression fails closed."
---

# Phase 27: Linear Regression Rebuild Verification Report

**Phase Goal:** Rebuild `linear-regression` around one reproducible regression case that connects matrix prediction, MSE gradients, three fitting methods, coefficient meaning, and held-out residual diagnosis.
**Verified:** 2026-07-30T09:33:15Z
**Status:** gaps_found
**Re-verification:** Yes — after closure of the three prior blocking concerns

## Goal Achievement

The prior numerical-authority, hollow-control, Phase 28 bridge, staging-metadata, and browser-behavior gaps are closed in the live code and independently exercised. The phase remains blocked by one directly observable contract violation: the primary univariate view uses the explicitly prohibited learner-facing `证据 / Evidence` terminology, while its test scans only the course-data file and therefore gives a misleading green result.

### Observable Truths

The 52 truths below merge all five ROADMAP success criteria with every PLAN frontmatter truth. Passed truths from the prior report received quick regression checks; previously failed or behavior-unverified truths received full artifact, wiring, data-flow, and behavioral verification.

| ID | Truth | Status | Evidence |
| --- | --- | --- | --- |
| R1 | One bilingual notation contract links affine prediction, residuals, MSE gradients, coefficients, and code names. | ✓ VERIFIED | Module, pure math, strict outputs, and both executed Notebooks use `prediction - actual`, `Xw+b`, `grad_w`, and `grad_b`; tests pass. |
| R2 | Clean-kernel Notebook reproduction compares NumPy batch GD, normal equation/lstsq, and sklearn on one fixed split. | ✓ VERIFIED | Isolated `--check --offline` independently reran both locale Notebooks; full suite repeated the check successfully. |
| R3 | Three-method coefficients, predictions, and metrics agree within documented tolerances with objective differences explicit. | ✓ VERIFIED | Strict summary/parser and authority tests preserve full-precision deltas below `1e-6`; OLS, Ridge, and Lasso roles remain distinct. |
| R4 | Held-out residual/coefficient-stability views identify model limitations after optimization proof. | ✓ VERIFIED | Strict package, selectors, results panel, and browser matrix show hourly shape, spread, named cases, atemp instability, regularization, and log1p after convergence. |
| R5 | Existing route, checkpoint, interactive lab, downloads, tests, and both builds remain valid. | ✓ VERIFIED | 940 tests pass; both builds pass; exact browser matrix passes 36/36 with six semantic outputs and nine downloads. |
| P01.1 | A DOM-free authority implements feature order, prediction, residual, MSE gradients, metrics, and coefficient conversion. | ✓ VERIFIED | `linearRegressionBike.ts` and focused math tests remain substantive and green. |
| P01.2 | Exact split, train-only scaling, unscaled workingday, and leakage exclusions are represented. | ✓ VERIFIED | Source, manifest, parsers, and tests lock 13,903/3,476, four scaled continuous features, unscaled `workingday`, and excluded leakage fields. |
| P01.3 | Deterministic zero-init GD uses 0.1/5,000/1e-8, stops at 772, and checks 1e-6 agreement. | ✓ VERIFIED | Generated trace contains updates 0–772; strict package and tests agree. |
| P01.4 | Pure reducers expose residual shape, spread, named cases, atemp/Ridge, and log1p concepts. | ✓ VERIFIED | Reducers and published baseline remain finite, guarded, exact, and tested. |
| P01.5 | Stable facade remains while synthetic/California values cease to be the primary numerical authority. | ✓ VERIFIED | Facade snapshots now come from the published full-precision baseline; cross-authority tests compare all seven facade states with source/published data. |
| P02.1 | The committed 17,379-row Bike snapshot is the sole source and ordinary generation is local/offline. | ✓ VERIFIED | Source bridge and manifest lock the local CSV and SHA; no runtime remote source exists. |
| P02.2 | One indivisible inventory owns two executed Notebooks and all seven supporting files. | ✓ VERIFIED | Public and staging packages each contain the exact nine declared members. |
| P02.3 | Generator freezes features, leakage, split, scaler, intercept, and method roles. | ✓ VERIFIED | Manifest contract and fail-closed generator checks remain exact. |
| P02.4 | Bilingual normal-equation mapping and deterministic teaching-row roles precede generation. | ✓ VERIFIED | Notebook markdown, manifest, and strict tests preserve terminology, formula, mapping, five instants, and tie-break rules. |
| P02.5 | Staging is ignored/non-public and failures clean without partial publication. | ✓ VERIFIED | Transaction, rollback, lock, residue, and corruption tests pass. |
| P02.6 | No registry resolution/package drift is introduced. | ✓ VERIFIED | Exact inherited eight-pin offline environment verifies with local wheels and no network. |
| P03.1 | Full calculation uses raw `cnt`, five primary features, controlled `atemp`, and no leakage input. | ✓ VERIFIED | Source, Notebook code, summary, manifest, and parser agree. |
| P03.2 | All three methods share split, scaler, transformed matrix, and intercept convention. | ✓ VERIFIED | Clean-kernel code and method records use one design and pass parity. |
| P03.3 | Both Notebooks teach augmented normal equation, theta mapping, and stable `lstsq`. | ✓ VERIFIED | Both locale Notebooks contain the complete bilingual contract and identical code cells. |
| P03.4 | GD, lstsq, and sklearn fulfill distinct roles and pass coefficient/prediction tolerance. | ✓ VERIFIED | Published full-precision agreement and parser tests pass. |
| P03.5 | Locale Notebooks share code, run independently, and normalize to identical outputs. | ✓ VERIFIED | Manifest parity hashes and two isolated verifier reruns pass. |
| P03.6 | Candidate includes complete coefficient/trace/residual output and staged diagnosis. | ✓ VERIFIED | Exact 24 coefficient, 773 trace, and 3,476 residual data rows exist and parse. |
| P03.7 | Representative/named selection freezes instants and tie-break rules. | ✓ VERIFIED | Instants 11550, 17213, 15628, 14965, and 15604 remain exact across source, outputs, selectors, and baseline. |
| P04.1 | Nine public members publish only after complete transaction verification. | ✓ VERIFIED | Publisher and complete-package tests pass. |
| P04.2 | Absent/replacement publication rolls back exact bytes/modes on injected failures. | ✓ VERIFIED | Full rollback and lock-contention matrices pass. |
| P04.3 | Offline check reruns both Notebooks externally and proves repository immutability. | ✓ VERIFIED | Canonical verifier run reports 9 members, 2 rerun Notebooks, and 1,377 entries byte/size/mtime clean. |
| P04.4 | Public package preserves compact/full residual values with no runtime network/partial package. | ✓ VERIFIED | Exact local package, complete residual CSV, runtime registry, and no-remote scan pass. |
| P04.5 | Tolerance/hash/contract/parity/non-finite corruption fails closed. | ✓ VERIFIED | Parser, candidate, publication, and offline corruption matrices pass. |
| P05.1 | Runtime consumers use only nine typed, local, base-safe assets. | ✓ VERIFIED | Literal registry and `withPublicBase` wiring pass root and Pages tests. |
| P05.2 | Summary parser locks source, split, features, sign, tolerance, finite values, and bounds. | ✓ VERIFIED | Exact-key validation and corruption tests pass. |
| P05.3 | Bad/cross-generation data fails closed without component repair. | ✓ VERIFIED | Strict four-file constructor rejects drift; browser failure injections expose only the audited compact fallback. |
| P05.4 | Typed chapter bindings expose all semantic outputs/downloads. | ✓ VERIFIED | Eight chapters map only to registered output/asset IDs. |
| P05.5 | Parser locks the five teaching instants and selection contract. | ✓ VERIFIED | Exact summary/manifest/source equality checks pass. |
| P05.6 | Root and Pages base paths work without remote fallback. | ✓ VERIFIED | Both builds and base-path/download tests pass. |
| P06.1 | Eight preserved chapter IDs remain reachable in locked order/titles. | ✓ VERIFIED | Module, adapter, router, progress, and 36-case browser navigation agree. |
| P06.2 | Every chapter has complete paired teaching-loop content and next step. | ✓ VERIFIED | Bilingual chapter content and next-step assertions pass. |
| P06.3 | Narrative preserves raw target, leakage, method roles, coefficient meaning, and objective distinctions. | ✓ VERIFIED | Typed content and exact output bindings remain aligned. |
| P06.4 | Chapter 5 teaches normal equation/正规方程, pseudoinverse, theta mapping, `lstsq`, and three methods. | ✓ VERIFIED | Exact bilingual formula/code assertions pass. |
| P06.5 | Diagnosis follows optimization and covers nonlinearity, spread, atemp, cases, log1p, and review. | ✓ VERIFIED | Selector sequence, results panel, and semantic matrix verify the progression. |
| P06.6 | Module/route/chapter/checkpoint/progress, safe rendering, Pages, responsive and media contracts remain compatible. | ✓ VERIFIED | Identity/progress/safety tests, both builds, and exact browser matrix pass. |
| P07.1 | Learners trace one locked real row through prediction/residual/loss/gradient to a matching batch state. | ✓ VERIFIED | Row/batch selectors expose the exact representative row and strict batch metrics; browser semantic checks pass in four locale/viewport runs. |
| P07.2 | Controls replay actual GD trace, methods, and coefficient spaces without Vue-owned fitting. | ✓ VERIFIED | Vue computeds call pure package selectors; exact selected values render under stable output hooks. |
| P07.3 | Guided controls prove convergence then expose the complete limitation sequence. | ✓ VERIFIED | Strict workbench construction, selector tests, and exact browser interactions verify all six outputs. |
| P07.4 | States have labels/current values/reset/keyboard support and non-color/non-motion cues. | ✓ VERIFIED | Source structure, CSS, reduced-motion probes, and browser runs pass. |
| P07.5 | No synthetic primary result remains and retained visuals match the Bike case. | ✓ VERIFIED | Runtime baseline is full precision and audited against source/published outputs; facade parity tests pass. |
| P07.6 | Deterministic plots/current workbench carry the exact teaching contract without new 3D/Manim critical path. | ✓ VERIFIED | Existing SVG/table views consume package-backed facade values; no new critical media path exists. |
| P08.1 | Paged lesson composes chapters, checkpoint, one download area, and correct next-step bridge. | ✓ VERIFIED | Final `linear-phase-28-bridge` targets `/learn/housing-price-project`; source and browser matrix assert it. |
| P08.2 | Typed base-safe loads/downloads fail closed to bilingual static content. | ✓ VERIFIED | Four-file abortable load and eight injected failure paths pass without full-data leakage. |
| P08.3 | Both locales/viewports can navigate and operate every lab/download without layout/link/accessibility failure. | ✓ VERIFIED | Exact matrix passes 36/36; semantic checks pass in all four locale/viewport pairs with zero layout/link/request/console/warning issues. |
| P08.4 | Copy is learner-facing and no semantically inconsistent media remains. | ✗ FAILED | Media now matches the Bike authority, but `LinearRegressionUnivariateView.vue` visibly renders the prohibited `证据 / Evidence` terminology in both locales. |
| P08.5 | Offline/tests/build/browser/Pages/security gates all block release. | ✓ VERIFIED | Offline replay, 940-test suite, both builds, exact browser matrix, and audit were independently rerun successfully. |
| P08.6 | Protected hashes/status/index, scope allowlists, residue, and no-remote scans are enforced. | ✓ VERIFIED | Only the pre-existing protected changes remain; hashes are exact; no preview listener or verifier browser session remains. |

**Score:** 51/52 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/simulations/linearRegressionBike.ts` | Pure Bike math and diagnostics | ✓ VERIFIED | Substantive, guarded, imported, and tested. |
| `scripts/linear-regression/build-phase-27-assets.py` | Offline generation/publication authority | ✓ VERIFIED | Canonical offline check and full transaction suite pass. |
| `.cache/linear-regression/phase-27-staging/notebooks/linear-regression/*` | Exact ignored nine-member candidate | ✓ VERIFIED | All nine Plan 27-03 paths now exist at the declared location. |
| `public/notebooks/linear-regression/*` | Exact published nine-member package | ✓ VERIFIED | Inventory, hashes, strict JSON/CSV, parity, and rerun proofs pass. |
| `src/data/linearRegressionAssets.ts` | Typed strict registry/parsers/bindings | ✓ VERIFIED | Exact-key, finite, ordering, cross-generation, and immutable-copy gates pass. |
| `src/data/linearRegressionModule.ts` | Eight-chapter bilingual course | ✓ VERIFIED | Complete and wired through the asynchronous catalog. |
| `src/simulations/linearRegressionWorkbench.ts` | Strict package constructor, selectors, compact authority | ✓ VERIFIED | Substantive and cross-checked against source and published outputs. |
| `src/components/LinearRegressionLessonLab.vue` | Six package-backed interactive outputs | ✓ VERIFIED | All refs drive pure selectors and visible `aria-live` output hooks. |
| `src/components/LinearRegressionUnivariateView.vue` | Bike SVG/table with learner-facing localized copy | ✗ PARTIAL | Numerical data is aligned, but visible and accessible copy violates D-26. |
| `src/components/LinearRegressionResults.vue` | Strict generated-result presentation | ✓ VERIFIED | Real package results flow into methods and diagnostics. |
| `src/components/LinearRegressionPagedLesson.vue` | Lesson composition and Phase 28 bridge | ✓ VERIFIED | Bridge has stable hook and exact housing-project target. |
| `src/components/LinearRegressionDownloads.vue` | Nine local downloads | ✓ VERIFIED | One base-safe download area exposes all members. |
| `scripts/qa/linearRegressionBrowserMatrix.js` | 36-case semantic release matrix | ✓ VERIFIED | Independently executed with 36/36, 4 interactions, and 8 failure injections. |
| `tests/linear-regression-authority.test.ts` | Non-self-referential authority chain | ✓ VERIFIED | Reads source CSV and published JSON/CSVs through production parsers, then compares selectors/baseline/facade. |
| `tests/linear-regression-content.test.mjs` | Bilingual content and terminology gate | ⚠️ PARTIAL | Substantive and passing, but the terminology assertion does not scan rendered component copy. |
| `.planning/phases/27-linear-regression-rebuild/27-03-PLAN.md` | Literal staging metadata | ✓ VERIFIED | Declares the actual `notebooks/linear-regression/` candidate root and `environment.json`. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| Source CSV/public outputs | workbench baseline | production parsers plus equality-chain test | ✓ WIRED | Full-precision values agree across authorities. |
| `LinearRegressionLessonLab.vue` | strict four-file package | abortable base-safe fetch and constructor | ✓ WIRED | Complete package required before controls enable. |
| Six controls | six pure selectors | computed selection | ✓ WIRED | Each changes its corresponding visible numerical output. |
| Simulation facade | published baseline | exact shared authority | ✓ WIRED | Seven facade snapshots pass parity tests. |
| Final lesson bridge | Phase 28 housing project | stable router-link | ✓ WIRED | Exact href verified in source and browser. |
| Plan 27-03 metadata | staging package | literal paths | ✓ WIRED | All declared candidates exist. |
| Terminology test | rendered univariate copy | source scan | ✗ NOT_WIRED | Test scans `linearRegressionModule.ts` only and misses the component that renders the prohibited terms. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| Executed Notebooks/results | weights, metrics, traces, residuals | Committed Bike CSV through verified generator | Yes | ✓ FLOWING |
| `linearRegressionAssets.ts` | strict summary/CSV objects | Nine-member public package | Yes, exact and fail-closed | ✓ FLOWING |
| `linearRegressionWorkbench.ts` | package and six selector outputs | Strict parsed four-file set | Yes, cross-file consistent | ✓ FLOWING |
| `LinearRegressionLessonLab.vue` | six numerical result panels | Pure selectors | Yes; exact browser changes observed | ✓ FLOWING |
| Simulation SVG/table facade | samples, fit, cases, bins | Published compact baseline | Yes; equality chain passes | ✓ FLOWING |
| Final lesson bridge | next route | Fixed `/learn/housing-price-project` target | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Focused Phase 27 regression suite | `node --test tests/linear-regression-*.test.* ...` | 144 pass, 0 fail | ✓ PASS |
| Independent offline reproduction | `python3 scripts/linear-regression/build-phase-27-assets.py --check --offline` | 9 members; 2 independent Notebook reruns; 1,377 entries unchanged | ✓ PASS |
| Full workspace suite | `npm test` | 940 pass, 0 fail, 0 skipped | ✓ PASS |
| Standard production build | `npm run build` | Build succeeds; existing large-chunk advisory only | ✓ PASS |
| GitHub Pages build | `npm run build:pages` | Build succeeds under Pages base | ✓ PASS |
| Exact browser matrix | Vite root preview plus `linearRegressionBrowserMatrix.js` | 36/36; 4/4 six-output semantic runs; 8/8 failure injections; zero route issues | ✓ PASS |
| Security audit | `npm run security:audit` | 0 vulnerabilities | ✓ PASS |
| Protected baseline/cleanup | SHA-256, status, listener, session checks | Hashes exact; only protected pre-existing changes; port free; verifier session closed | ✓ PASS |

One diagnostic run launched a second offline replay concurrently with an already-running replay and observed output drift. The canonical isolated command and the normal full-suite command subsequently passed independently. Concurrency between two verification processes is not a declared Phase 27 contract, so this did not change a must-have status.

### Probe Execution

No `scripts/**/tests/probe-*.sh` probe is declared or present for Phase 27. The phase-declared offline CLI check and browser release matrix were executed directly and are recorded above.

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| LINR-01 | 01, 05–10 | Connect affine prediction, residuals, MSE gradients, and coefficients | ✓ SATISFIED | Pure authority, strict package, selectors, bilingual narrative, and browser outputs align. |
| LINR-02 | 01–04, 06–11 | Reproduce locked NumPy batch GD | ✓ SATISFIED | Both clean-kernel Notebooks rerun offline to update 772. |
| LINR-03 | 01–11 | Compare normal equation, GD, and sklearn on one split | ✓ SATISFIED | Exact published method deltas and runtime selector/facade parity pass. |
| LINR-04 | 01, 03–11 | Diagnose held-out residual/coefficient limitations | ✓ SATISFIED | Strict residual/case/atemp/regularization/log1p sequence is visible and interactive. |

No Phase 27 requirement is orphaned. The remaining D-26 learner-copy failure is a PLAN/CONTEXT must-have rather than an unmapped REQUIREMENTS.md ID.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `src/components/LinearRegressionUnivariateView.vue` | 40–49, 70–79, 355–363 | Prohibited learner-facing audit jargon | 🛑 Blocker | Both visible panel copy and accessible SVG names violate the locked plain-language contract. |
| `tests/linear-regression-content.test.mjs` | 212–223 | Misleading narrow terminology gate | ⚠️ Warning | Test title claims learner terminology coverage but scans only `linearRegressionModule.ts`. |
| Production builds | n/a | Existing chunks above the configured advisory threshold | ℹ️ Info | Builds succeed; not introduced as a Phase 27 goal failure. |

No unreferenced `TBD`, `FIXME`, or `XXX` marker and no `test.skip`/`test.todo` were found in the Phase 27 runtime/test files.

### Human Verification Required

None. The remaining gap is directly observable in source and rendered browser copy; the runtime interaction/layout contract was exercised automatically.

### Gaps Summary

The numerical and behavioral phase goal is otherwise implemented: all three previous blocker groups are closed, the exact browser matrix is green, and every roadmap success criterion has supporting code and execution evidence. Release remains blocked because D-26 explicitly forbids `证据 / Evidence` as a standalone learner-facing label, yet the univariate view renders exactly those labels in both locales and its test does not cover that component.

This is not deferred. Phase 31 may re-audit cross-module consistency, but Phase 27 Plans 06, 08, 10, and 11 explicitly own the current learner-facing terminology gate.

**Next action:** plan the single copy/test gap, then re-run Phase 27 verification (`/gsd:plan-phase 27 --gaps`).

---

_Verified: 2026-07-30T09:33:15Z_
_Verifier: the agent (gsd-verifier)_
