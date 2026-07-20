# Logit-bias calibration: root finding

This 80-second silent animation solves the same residual used in the finite-difference lesson. Continuity, opposite endpoint signs on $[-4,4]$, and strict monotonicity establish one root. The scene then compares the geometry and locked costs of bisection, Newton, and secant iterations.

The executed Notebook records 37 bisection updates and 39 function evaluations; three Newton updates with four function and four derivative evaluations; and five secant updates with seven function evaluations. All methods reach the locked root near $b=0.7302907403$, where mean probability is about 0.62. A cost table prevents iteration-only ranking, and failure cards cover a non-sign-changing bracket and an unsafe Newton step in sigmoid saturation.

The ending limits the interpretation: matching a single mean solves only this scalar equation. It then connects zero finding to the following numerical-optimization lesson.
