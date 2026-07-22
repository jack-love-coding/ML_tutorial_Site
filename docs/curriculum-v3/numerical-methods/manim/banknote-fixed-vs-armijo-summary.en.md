# Banknote fixed step versus Armijo backtracking

This 72-second silent scene compares a fixed standardized step of 32 with Armijo backtracking from the exact same Banknote iteration-0 state and training gradient. It loads the committed `numerical-methods-batch-4-v1` optimization summary and accepted-state trace JSON at render time. The scene checks the output ID `banknote-logistic-optimization-summary`, dataset/constants hashes, run IDs, methods, shared start, Armijo constants, first reject/accept anchors, every accepted sufficient-decrease inequality, and both terminal records before drawing.

No network source, random value, browser computation, or schematic replacement number participates. Plan 25-11 will render the final MP4 and poster; this source package deliberately contains no binary media.

## The quantity Armijo tests

The line search tests only the penalized training objective

$$
J(\theta)=\operatorname{BCE}_{\text{train}}(\theta)
+\frac{\lambda}{2}\lVert w\rVert_2^2,
$$

with the intercept excluded from L2. For descent direction $d=-g$, a trial is accepted only when

$$
J(\theta+\alpha d)
\le J(\theta)+c\alpha(g^\top d)
=J(\theta)-c\alpha\lVert g\rVert_2^2.
$$

The locked constants are initial alpha 32, `c=0.0001`, and contraction `rho=0.5`. Validation BCE never participates in this accept/reject inequality. Only after a finite step has been accepted does validation update the best-checkpoint and patience state.

## One shared alpha-32 candidate, two method rules

Both selected runs use standardized features and share the exact iteration-0 record: objective `0.6931471805599453`, gradient norm `0.44123397955093496`, and five zero parameters.

The `standardized-too-large` fixed run applies alpha 32 directly. Its accepted iteration-1 row has:

- penalized training objective `1.0016959769489993`;
- training BCE `0.903576571052853`;
- parameter-step norm `14.119487345629919`;
- backtrack count 0.

The objective rises above the start value, but a fixed-step rule has no sufficient-decrease gate, so this candidate becomes a trace row.

Armijo initially tests that exact alpha-32 candidate. The allowed bound derived from the loaded start row is `0.6925241808008722`. Since candidate objective `1.0016959769489993` is greater than the bound, the trial is rejected. The optimization summary independently records `initialTrialAccepted=false`. A rejected trial is not an accepted trace row.

## One backtrack accepts alpha 16

Multiplying 32 by the locked contraction 0.5 gives 16. The alpha-16 bound is `0.6928356806804087`. The first `standardized-armijo` accepted row has:

- penalized training objective `0.5246184695107567`;
- training BCE `0.5000886180367202`;
- parameter-step norm `7.059743672814959`;
- accepted step 16;
- backtrack count 1.

The candidate objective is below its sufficient-decrease bound, so it becomes accepted iteration 1. The scene source repeats this objective-only check over every later accepted Armijo row. It also confirms the summary flag `allAcceptedRowsSatisfySufficientDecrease=true` rather than trusting a copied label.

## Accepted traces and terminal meanings

The comparison plot uses every committed accepted finite state and displays `log10(objective)` against recorded iteration. It does not add rejected trials, smoothing points, or substitute values.

The fixed path is dashed and ends in a square. It contains iteration 0 plus 73 adopted updates. The run stops at iteration 73 with kind `model-selection` and reason `validation-patience`. That terminal means validation patience was exhausted; it does not prove gradient convergence.

The Armijo path is solid and ends in a circle. It contains iteration 0 plus 48 accepted updates. It stops at iteration 48 with kind `mathematical-convergence` and reason `gradient-norm`; its best validation BCE is `0.06824699289297452`. This states what happened under the locked tolerance. It is not a universal claim that Armijo is always superior to every fixed step.

## Reduced-motion, video-failure, and non-color fallback

The final frame is intentionally poster-ready and self-contained:

- square/dashed fixed 32: the first objective rises but the step is adopted; validation-patience stop at iteration 73;
- circle/solid Armijo: 32 is rejected, 16 is accepted after exactly one backtrack; gradient-norm convergence at iteration 48;
- written boundary: sufficient decrease reads `training BCE + L2` and the training gradient only; validation BCE does not participate in line search.

The Chinese transcript, this English summary, and `banknote-fixed-vs-armijo-labels.json` preserve the same candidate arithmetic, trace semantics, terminal meanings, and bounded conclusion without motion, audio, or color perception.
