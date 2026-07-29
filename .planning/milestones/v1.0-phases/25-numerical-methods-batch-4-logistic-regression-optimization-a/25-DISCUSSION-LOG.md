# Phase 25: Numerical Methods Batch 4 — Logistic Regression Optimization and Training Diagnostics - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-20
**Phase:** 25-numerical-methods-batch-4-logistic-regression-optimization-a
**Areas discussed:** continuous case, reproducible outputs, chapter boundary, visual media, code depth, metric boundary, browser labs and failure feedback

---

## Continuous Case

| Decision | Alternatives considered | Selected |
|---|---|---|
| Model | Small logistic regression; two-layer MLP; polynomial regression | Small logistic regression ✓ |
| Dataset | UCI Banknote snapshot; project-authored fixture; Two Moons | UCI Banknote snapshot ✓ |
| Optimization line | Fixed-step GD + Armijo; full-batch vs mini-batch; GD + Newton/IRLS | Fixed-step GD + Armijo ✓ |
| Failure scope | Real Banknote runs plus labeled synthetic support; force every failure on Banknote; only natural Banknote failures | Real runs plus labeled synthetic support ✓ |

**User's choice:** Recommended option for all four decisions.
**Notes:** The user wants one continuous case without pulling deep-network mechanisms forward or weakening the existing complete diagnosis coverage.

---

## Reproducible Outputs

| Decision | Alternatives considered | Selected |
|---|---|---|
| Run matrix | Five runs + extreme-logit check; three-run minimum; eight-run sweep | Five runs + extreme-logit check ✓ |
| Split | Stratified 70/15/15; 60/20/20; 80/20 without validation | Stratified 70/15/15 ✓ |
| Stops | Separate convergence, early stopping, and safety exits; any threshold; validation-only | Separate semantics ✓ |
| Page output | Anchor checkpoints + complete downloads; every iteration inline; chart/final only | Anchor checkpoints + complete downloads ✓ |

**User's choice:** Recommended option for all four decisions.
**Notes:** Standardization must fit training data only; full traces remain locally downloadable.

---

## Chapter Boundary

| Decision | Alternatives considered | Selected |
|---|---|---|
| Optimization depth | Numerical training mechanisms; repeat optimizer family; add Newton/IRLS | Numerical training mechanisms ✓ |
| Diagnosis teaching | Four-step observation chain; lookup table; scored guessing exercise | Four-step observation chain ✓ |
| Notebook split | One shared Notebook; two independent Notebooks; main + appendix | One shared Notebook ✓ |
| Labs | Upgrade existing labs; create two replacements; static Notebook output only | Upgrade existing labs ✓ |

**User's choice:** Recommended option for all four decisions.
**Notes:** Each page remains teaching-led with one primary lab and no new exercise bank.

---

## Visual Media

| Decision | Alternatives considered | Selected |
|---|---|---|
| Illustration | One shared three-panel map; one per chapter; charts only | Shared three-panel map ✓ |
| Video count | Two chapter videos; one long video; three short videos | Three short videos ✓ |
| Numeric source | Notebook-bound values; schematic values; mixed values | Notebook-bound values ✓ |
| Media language | Chinese labels + bilingual support; text-light; separate locale renders | Chinese labels + bilingual support ✓ |

**User's choice:** Three short videos instead of the recommended two; recommended options for the other three decisions.
**Notes:** The three videos cover feature scaling, fixed step versus Armijo, and trace diagnosis.

---

## Code Depth

| Decision | Alternatives considered | Selected |
|---|---|---|
| Implementation authority | Manual core + library reference; scikit-learn training; fully manual primitives | Manual NumPy authority plus scikit-learn final baseline ✓ |
| Library comparison | Final results; per-step trace alignment; code snippet only | Final results ✓ |
| Code presentation | Layered functions; one monolithic trainer; pseudocode only | Layered functions ✓ |
| Independent checks | Finite-difference gradient check + library result; library result only; hidden tests only | Two-layer check ✓ |

**User's choice:** Combined the first two initial options, then selected final-result-only library comparison and the recommended layered/check structure.
**Notes:** Add a pinned scikit-learn dependency; do not let it replace or obscure the manual numerical path.

---

## Metric Boundary

| Decision | Alternatives considered | Selected |
|---|---|---|
| Metrics | Optimization trace + compact final classification report; optimization only; complete evaluation suite | Trace + compact report ✓ |
| Regularization | Fixed small L2; no regularization; validation-tuned L2 | Fixed small L2 ✓ |
| Threshold | Fixed 0.5; validation-tuned; interactive threshold | Fixed 0.5 ✓ |
| Page allocation | Optimization owns runs, diagnostics owns curves/final report; full report every run; report only in Notebook | Layered allocation ✓ |

**User's choice:** Recommended option for all four decisions.
**Notes:** Intercept is not penalized; exact L2 value is determined through the reproducible Notebook rather than selected arbitrarily.

---

## Browser Labs and Failure Feedback

| Decision | Alternatives considered | Selected |
|---|---|---|
| Interaction | Presets + bounded advanced controls; fully free panel; presets only | Presets + bounded controls ✓ |
| Exposed controls | Teaching-essential controls; all Armijo/L2/patience settings; learning rate only | Teaching-essential controls ✓ |
| Failures | Safe explicit terminal reason; silent auto-correction; allow NaN/Infinity to propagate | Safe explicit reason ✓ |
| Runtime | Deterministic TypeScript recomputation; trace playback; browser Python | TypeScript recomputation ✓ |

**User's choice:** Recommended option for all four decisions.
**Notes:** Failure states preserve the last finite checkpoint and suggest one next variable to change.

---

## the agent's Discretion

- Exact seed, fixed L2, learning rates, tolerances, Armijo constants, patience, library pin, milestone rows, and video timing are implementation details to lock only after deterministic execution checks.

## Deferred Ideas

- Full optimizer-family repetition, Newton/IRLS, full classification evaluation, threshold/L2 tuning, separate locale media, and browser Python.
