# Numerical Methods Batch 3 Completion

**Completed:** 2026-07-20

**Branch:** `codex/numerical-methods-batch-3`

**Scope:** `finite-difference-methods` and `nonlinear-equations`

## Delivered

- Rebuilt both existing Math Lab lessons as detailed bilingual teaching flows without changing their URLs, checkpoint behavior, or Progress storage.
- Added a deterministic 12-logit calibration fixture and one shared, executed Notebook that carries the same residual function from derivative checking into root finding.
- Put the exact Notebook outputs on both teaching pages and aligned the residual, derivative, solver variables, formulas, code, prose, labs, and videos.
- Upgraded `FiniteDifferenceLab` with the calibration residual and its fixed `b=0.35`, `h=10^-5` starting state while preserving the exponential-shift and quadratic comparisons.
- Upgraded `NonlinearEquationsLab` with the calibration residual, Newton start `0`, and secant starts `-1, 1` while preserving the cubic, cosine, and flat-derivative comparisons.
- Added one shared generated illustration and two local 1080p/30fps Manim videos with posters, transcripts, English summaries, labels, prompts, and hash metadata.

## Locked Results

### Finite-difference calibration

- Evaluation point: `b=0.35`
- Residual: `-0.06078698810485639`
- Analytic derivative: `0.1630982543997438`
- Best forward step in the fixed sweep: `h=10^-7`, absolute error `6.082833126086484e-10`
- Best central step in the fixed sweep: `h=10^-5`, absolute error `2.3393509351876673e-12`
- Central-difference error at `h=10^-12`: `6.200323353955373e-05`, making the cancellation-error rebound visible.

### Nonlinear calibration

- Solved bias: `0.730290740297536`
- Mean calibrated probability: `0.619999999995351`
- Derivative at the root: `0.15594569798407712`
- Bisection: 37 displayed iterations, 39 function evaluations, no derivative evaluations.
- Newton: 3 displayed iterations, 4 function evaluations, 4 derivative evaluations.
- Secant: 5 displayed iterations, 7 function evaluations, no derivative evaluations.
- Explicit failure checks cover an invalid bisection bracket and a saturated Newton start with a near-zero derivative.

## Validation

- Shared standalone Notebook generation and clean-kernel rerun check: pass; fixture and output hashes match the manifest.
- Batch 3 Manim metadata, prompt, poster, video, transcript, label, and hash checks: pass.
- `npm test`: pass, 718 tests, 0 failures.
- `npm run build`: pass with the existing large-chunk warning.
- `npm run build:pages`: pass with the existing large-chunk warning.
- `npm run security:audit`: pass, 0 vulnerabilities.
- Playwright desktop and 390×844 checks: Chinese and English content, downloads, code-copy feedback, calibration defaults, shared illustration, and both videos load correctly; zero console errors and no horizontal overflow.

## Preserved Boundaries

- No new route, backend, browser Python runtime, progress store, scoring gate, or course inventory.
- The finite-difference chapter uses the analytic derivative only as a teaching reference; the numerical method remains independently computed from function values.
- The nonlinear-equation chapter does not claim one solver is universally best; the comparison keeps bracket, derivative, evaluation-cost, and failure-mode tradeoffs explicit.
- Phase 24B Homepage Focus and Phase 24C Spine progressive disclosure remain paused.
