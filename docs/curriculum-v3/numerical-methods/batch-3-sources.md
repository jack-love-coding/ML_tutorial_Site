# Numerical Methods Batch 3 Sources

## Teaching fixture

- `logit-calibration-fixture.json` is a project-authored deterministic fixture.
- It contains 12 fixed logits, a target mean probability of `0.62`, one finite-difference probe point, a root bracket, and fixed Newton/secant starts.
- It is intentionally small enough to audit and download with the Notebook.
- It is not copied from an external dataset, does not contain personal data, and does not model a production population.

## Interpretation boundary

Adding a scalar logit bias preserves score ordering and changes the average predicted probability. Solving the mean-rate equation is useful for teaching a monotone nonlinear residual, but it is not a complete probability-calibration method. The course must not infer accuracy, fairness, causal effects, or production readiness from this fixture.

## Numerical implementation

- NumPy array operations use the versions pinned in `public/notebooks/numerical-methods/requirements.txt`.
- `scipy.special.expit` may be used for a stable sigmoid, while the manual derivative and solver traces remain visible in the Notebook.
- All learner-facing fixed values are copied from committed output JSON, not recomputed independently inside Vue components.
- Forward and central differences evaluate the same residual function used by all three root solvers.
