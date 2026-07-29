# Numerical Methods Batch 3 Contract

**Status:** Implementation in progress on 2026-07-20

**Modules:** `finite-difference-methods`, `nonlinear-equations`

**Route:** `numerical-deepening-path`

## Continuous teaching case

Both chapters use one deterministic logit-bias calibration problem. Given fixed model logits $z_i$, add one scalar bias $b$ and define

$$
p_i(b)=\sigma(z_i+b),
\qquad
F(b)=\frac{1}{n}\sum_{i=1}^{n}p_i(b)-0.62.
$$

The first chapter approximates $F'(b)$ from nearby function values and studies the step-size error curve. The second chapter solves $F(b)=0$ with bisection, Newton, and secant iterations. This is one continuous numerical story, not two unrelated textbook examples.

The fixture is project-authored and deterministic. It does not represent a production population, train a model, evaluate classification quality, or claim that matching one mean probability is sufficient calibration. In a real workflow, the target rate and calibration fit must come from an appropriate held-out set.

## Locked artifacts

- Fixture: `public/datasets/numerical-methods/logit-calibration-fixture.json`
- Fixture manifest: `public/datasets/numerical-methods/logit-calibration-manifest.json`
- Shared executed Notebook: `public/notebooks/numerical-methods/logit-bias-calibration.zh-CN.ipynb`
- Finite-difference output: `public/notebooks/numerical-methods/batch-3-outputs/finite-difference-calibration-summary.json`
- Root-finding output: `public/notebooks/numerical-methods/batch-3-outputs/nonlinear-calibration-summary.json`
- Batch output manifest: `public/notebooks/numerical-methods/batch-3-outputs/manifest.json`
- Shared illustration: `public/math-lab/numerical-methods/finite-difference-root-finding-calibration.png`
- Two Manim packages under `public/manim/numerical-methods/` with local posters, transcripts, summaries, labels, prompts, trees, and hash metadata.

## Numerical boundary

### Finite differences

- Probe point: $b_0=0.35$.
- Compare forward and central differences on $h=10^{-1},\ldots,10^{-12}$.
- Analytic derivative is

$$
F'(b)=\frac{1}{n}\sum_{i=1}^{n}p_i(b)(1-p_i(b)).
$$

- Page output must identify the best sampled step for each stencil and show that making $h$ smaller eventually increases floating-point error.
- Locked output at $b_0=0.35$: $F(b_0)=-0.06078698810485639$ and $F'(b_0)=0.1630982543997438$.
- In the sampled grid, forward difference is best at $h=10^{-7}$ with absolute error $6.082833126086484\times10^{-10}$; central difference is best at $h=10^{-5}$ with absolute error $2.3393509351876673\times10^{-12}$.
- The central-difference result is an independent check of the analytic derivative, not a proof that an arbitrary autodiff implementation is correct.

### Nonlinear equations

- Solve the same monotone residual $F(b)=0$ inside the fixed bracket $[-4,4]$.
- Compare bisection, Newton from $b_0=0$, and secant from $(-1,1)$ with explicit residual, iteration, and function/derivative-evaluation counts.
- Explain stopping by both residual and step/bracket width.
- Show at least one invalid-bracket or small-derivative failure path and the role of safeguarded methods.
- Keep multidimensional Newton as a later depth section; the primary lab and fixed output remain the scalar calibration case.
- Locked root output: $b^*=0.730290740297536$, $\bar p(b^*)=0.619999999995351$, and $F'(b^*)=0.15594569798407712$.
- Bisection records 37 updates / 39 function evaluations; Newton records 3 updates / 4 function and 4 derivative evaluations; secant records 5 updates / 7 function evaluations.

## Learner-facing structure

Each module must provide:

- detailed Chinese and English teaching copy;
- exactly one primary interactive lab already owned by the module, upgraded with the calibration case as its default;
- the shared executed Notebook, local fixture, pinned requirements, and chapter-specific fixed output;
- one chapter-specific Manim video and the shared illustration;
- a direct bridge to the next route chapter;
- existing URL, checkpoint, route query, and Progress behavior unchanged.

Learner-facing Chinese copy must not use `证据` as a generic UI label.

## Acceptance

- Fixture, Notebook, output, prompt, transcript, summary, poster, and video hashes are deterministic and checked offline.
- The downloaded Notebook reruns with only the sibling fixture JSON and pinned requirements.
- Formulas, code, page output, lab defaults, illustration labels, and video numbers use the same $z_i$, target rate, $b$, $F(b)$, and stopping rules.
- The finite-difference lab retains the existing textbook functions as comparison modes.
- The nonlinear-equations lab retains its existing cubic, cosine, and repeated-root comparison modes.
- Public assets resolve through the existing base-safe path utilities.
- `npm test`, `npm run build`, `npm run build:pages`, generator checks, Manim checks, security audit, and Chinese/English desktop plus 390px browser checks pass.
