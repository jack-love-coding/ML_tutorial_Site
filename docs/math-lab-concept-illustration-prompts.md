# Math Lab Concept Illustration Prompts

Generated: 2026-05-19

This document records the GPT image-model prompt set used for the ML Atlas Math Lab concept illustrations. The runtime source of truth is `src/modules/math-lab/data/conceptIllustrations.ts`; generated PNG assets live under `public/math-lab/concepts/generated/`.

## Prompt Policy

- One prompt and one local PNG are maintained for each current Math Lab knowledge point.
- Prompts use `Use case: infographic-diagram` and `Asset type: ML Atlas Math Lab concept illustration`.
- Prompts avoid text-heavy diagrams so the same image can support both Chinese and English course copy.
- Registry status is `generated` only after the corresponding local PNG exists.
- Runtime paths stay under `/math-lab/concepts/generated/` and are rendered through the existing public base helper.

## Coverage

- Total registered prompts: 47
- Generated assets: 47

## Generation Batches

### Batch 1: vector, tensor, Taylor, autodiff, Monte Carlo

- `vectors-matrices-norms:dot-product-cosine-similarity` -> `/math-lab/concepts/generated/dot-product-cosine-similarity.png` (generated)
- `vectors-matrices-norms:matrix-as-linear-transform` -> `/math-lab/concepts/generated/matrix-as-linear-transform.png` (generated)
- `vectors-matrices-norms:induced-matrix-norm` -> `/math-lab/concepts/generated/induced-matrix-norm.png` (generated)
- `tensor-shapes-vectorization:linear-layer-shape-contract` -> `/math-lab/concepts/generated/linear-layer-shape-contract.png` (generated)
- `tensor-shapes-vectorization:broadcasting-compatibility` -> `/math-lab/concepts/generated/broadcasting-compatibility.png` (generated)
- `taylor-series:taylor-polynomial` -> `/math-lab/concepts/generated/taylor-polynomial.png` (generated)
- `taylor-series:taylor-remainder` -> `/math-lab/concepts/generated/taylor-remainder.png` (generated)
- `matrix-calculus-autodiff:local-linearization` -> `/math-lab/concepts/generated/local-linearization.png` (generated)
- `matrix-calculus-autodiff:vjp-jvp` -> `/math-lab/concepts/generated/vjp-jvp.png` (generated)
- `monte-carlo:monte-carlo-estimator-core` -> `/math-lab/concepts/generated/monte-carlo-estimator-core.png` (generated)

### Batch 2: probability, factorization, sparsity, conditioning, eigen concepts

- `probability-likelihood-entropy:softmax-cross-entropy` -> `/math-lab/concepts/generated/softmax-cross-entropy.png` (generated)
- `probability-likelihood-entropy:kl-divergence` -> `/math-lab/concepts/generated/kl-divergence.png` (generated)
- `lu-decomposition:lu-factorization-core` -> `/math-lab/concepts/generated/lu-factorization-core.png` (generated)
- `lu-decomposition:lup-pivoting-core` -> `/math-lab/concepts/generated/lup-pivoting-core.png` (generated)
- `sparse-matrices:sparse-nnz-core` -> `/math-lab/concepts/generated/sparse-nnz-core.png` (generated)
- `sparse-matrices:sparse-csr-rowptr-core` -> `/math-lab/concepts/generated/sparse-csr-rowptr-core.png` (generated)
- `condition-numbers:condition-number-core` -> `/math-lab/concepts/generated/condition-number-core.png` (generated)
- `condition-numbers:residual-error-bound` -> `/math-lab/concepts/generated/residual-error-bound.png` (generated)
- `eigenvalues-eigenvectors:eigenpair` -> `/math-lab/concepts/generated/eigenpair.png` (generated)
- `eigenvalues-eigenvectors:characteristic-polynomial` -> `/math-lab/concepts/generated/characteristic-polynomial.png` (generated)
- `eigenvalues-eigenvectors:rayleigh-quotient` -> `/math-lab/concepts/generated/rayleigh-quotient.png` (generated)

### Batch 3: stochastic processes, finite differences, nonlinear solving, optimization diagnostics

- `markov-chains:markov-property-core` -> `/math-lab/concepts/generated/markov-property-core.png` (generated)
- `markov-chains:markov-transition-matrix-core` -> `/math-lab/concepts/generated/markov-transition-matrix-core.png` (generated)
- `markov-chains:markov-stationary-pagerank-core` -> `/math-lab/concepts/generated/markov-stationary-pagerank-core.png` (generated)
- `finite-difference-methods:finite-difference-derivative-core` -> `/math-lab/concepts/generated/finite-difference-derivative-core.png` (generated)
- `finite-difference-methods:finite-difference-error-balance` -> `/math-lab/concepts/generated/finite-difference-error-balance.png` (generated)
- `finite-difference-methods:finite-difference-gradient-jacobian` -> `/math-lab/concepts/generated/finite-difference-gradient-jacobian.png` (generated)
- `nonlinear-equations:nonlinear-root-residual` -> `/math-lab/concepts/generated/nonlinear-root-residual.png` (generated)
- `nonlinear-equations:newton-step` -> `/math-lab/concepts/generated/newton-step.png` (generated)
- `nonlinear-equations:multidimensional-newton` -> `/math-lab/concepts/generated/multidimensional-newton.png` (generated)
- `optimization:optimization-minimizer` -> `/math-lab/concepts/generated/optimization-minimizer.png` (generated)
- `optimization:optimization-steepest-descent` -> `/math-lab/concepts/generated/optimization-steepest-descent.png` (generated)
- `optimization:optimization-newton-step` -> `/math-lab/concepts/generated/optimization-newton-step.png` (generated)
- `training-diagnostics:gradient-update-diagnostics` -> `/math-lab/concepts/generated/gradient-update-diagnostics.png` (generated)
- `training-diagnostics:validation-gap` -> `/math-lab/concepts/generated/validation-gap.png` (generated)

### Batch 4: least squares, SVD, PCA, architecture math

- `least-squares-fitting:least-squares-residual-objective` -> `/math-lab/concepts/generated/least-squares-residual-objective.png` (generated)
- `least-squares-fitting:least-squares-normal-equations` -> `/math-lab/concepts/generated/least-squares-normal-equations.png` (generated)
- `least-squares-fitting:least-squares-svd-pseudoinverse` -> `/math-lab/concepts/generated/least-squares-svd-pseudoinverse.png` (generated)
- `svd:singular-value-decomposition` -> `/math-lab/concepts/generated/singular-value-decomposition.png` (generated)
- `svd:rank-from-singular-values` -> `/math-lab/concepts/generated/rank-from-singular-values.png` (generated)
- `svd:svd-pseudoinverse` -> `/math-lab/concepts/generated/svd-pseudoinverse.png` (generated)
- `svd:svd-low-rank` -> `/math-lab/concepts/generated/svd-low-rank.png` (generated)
- `pca:pca-centered-projection` -> `/math-lab/concepts/generated/pca-centered-projection.png` (generated)
- `pca:pca-covariance-diagonalization` -> `/math-lab/concepts/generated/pca-covariance-diagonalization.png` (generated)
- `pca:pca-svd-explained-variance` -> `/math-lab/concepts/generated/pca-svd-explained-variance.png` (generated)
- `deep-architecture-math:convolution-output-size` -> `/math-lab/concepts/generated/convolution-output-size.png` (generated)
- `deep-architecture-math:scaled-dot-product-attention` -> `/math-lab/concepts/generated/scaled-dot-product-attention.png` (generated)

## Final Prompt List

### vectors-matrices-norms

#### dot-product-cosine-similarity

- Key: `vectors-matrices-norms:dot-product-cosine-similarity`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/dot-product-cosine-similarity.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a clean courseware illustration of two feature vectors sharing an origin, the angle between them, and one vector casting a soft projection shadow onto the other vector to show cosine similarity
Scene/backdrop: light scientific canvas with a subtle coordinate grid and small feature-space markers
Subject: two high-contrast arrows, a translucent projection band, and a similarity glow that becomes strongest when directions align
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered concept, readable at page-card size
Color palette: deep ink, cyan, amber, white, restrained accents
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: generic abstract math wallpaper, unreadable labels, photorealistic classroom scenes
```

#### matrix-as-linear-transform

- Key: `vectors-matrices-norms:matrix-as-linear-transform`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/matrix-as-linear-transform.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: an educational illustration showing a square coordinate grid entering a transparent matrix transform gate and leaving as a rotated, sheared parallelogram grid
Scene/backdrop: clean math lab canvas with subtle grid depth
Subject: input basis arrows, transformed basis arrows, and the deformed grid surface
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, left-to-right transformation flow, readable at page-card size
Color palette: deep ink, teal, violet, amber, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: random abstract cubes, photorealistic machinery, unreadable labels
```

#### induced-matrix-norm

- Key: `vectors-matrices-norms:induced-matrix-norm`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/induced-matrix-norm.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a unit circle made of many small input arrows transformed into a stretched ellipse, with the longest output arrow glowing to represent maximum amplification
Scene/backdrop: clean scientific canvas with two faint coordinate frames
Subject: unit input boundary, transformed output ellipse, highlighted worst-case stretch direction
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, before-and-after panels connected by a matrix transform arrow
Color palette: deep ink, cyan, magenta, amber, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: generic wave patterns, random matrices filled with numbers, photorealistic scenes
```

### tensor-shapes-vectorization

#### linear-layer-shape-contract

- Key: `tensor-shapes-vectorization:linear-layer-shape-contract`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/linear-layer-shape-contract.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a tensor-shape courseware diagram where parallel batch lanes enter a weight matrix panel, the feature axis is visibly consumed, and hidden output lanes emerge
Scene/backdrop: clean AI lab canvas with subtle array blocks
Subject: batch lanes preserved, feature columns reduced, hidden channels produced, small bias tile broadcast across outputs
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, left-to-right pipeline, readable at page-card size
Color palette: deep ink, cyan, green, amber, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: code screenshots, unreadable tensor labels, generic server racks
```

#### broadcasting-compatibility

- Key: `tensor-shapes-vectorization:broadcasting-compatibility`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/broadcasting-compatibility.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a clear broadcasting diagram showing a small bias strip being copied across rows of a larger activation matrix, with compatible axes snapping into place and one incompatible ghost strip rejected
Scene/backdrop: clean courseware canvas with subtle tensor tiles
Subject: large matrix block, reusable bias strip, repeated translucent copies, one rejected mismatch cue
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered tensor blocks, readable at page-card size
Color palette: deep ink, cyan, mint, red-orange warning accent, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense code, random spreadsheets, decorative abstract blocks
```

### taylor-series

#### taylor-polynomial

- Key: `taylor-series:taylor-polynomial`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/taylor-polynomial.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a teaching illustration of a smooth curve with several polynomial approximation ribbons of increasing accuracy hugging the curve near one glowing expansion center and drifting apart farther away
Scene/backdrop: clean scientific plotting canvas without numeric axes
Subject: true curve, first rough approximation, higher-order approximation, highlighted local neighborhood
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, central curve and expansion point, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense coordinate labels, generic chalkboard, photorealistic classroom scenes
```

#### taylor-remainder

- Key: `taylor-series:taylor-remainder`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/taylor-remainder.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a clean illustration of a true function curve and a truncated approximation curve with a shaded remainder band that grows wider as it moves away from the expansion center
Scene/backdrop: light courseware plotting canvas without numeric axes
Subject: true curve, approximation curve, shaded error region, center point, far-away warning region
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, wide curve view, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense tick labels, decorative math wallpaper
```

### matrix-calculus-autodiff

#### local-linearization

- Key: `matrix-calculus-autodiff:local-linearization`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/local-linearization.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a curved surface with one glowing point and a transparent tangent plane touching it, showing small displacement arrows on the plane as the local linear approximation
Scene/backdrop: clean 3D math lab canvas with subtle contour shadows
Subject: curved surface, tangent plane, local point, small input and output displacement arrows
Style/medium: polished vector-like educational illustration with gentle 3D depth, raster PNG
Composition/framing: 16:9, centered surface and plane, readable at page-card size
Color palette: deep ink, cyan, violet, amber, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: photorealistic terrain, dense labels, generic neural network art
```

#### vjp-jvp

- Key: `matrix-calculus-autodiff:vjp-jvp`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/vjp-jvp.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a computation graph with layered nodes, one bright tangent signal moving forward through the graph and one gradient signal moving backward through the same edges
Scene/backdrop: clean dark-on-light technical canvas with subtle node lanes
Subject: graph nodes, forward tangent arrows, backward adjoint arrows, no full Jacobian table
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, left-to-right graph, readable at page-card size
Color palette: deep ink, cyan for forward flow, amber for backward flow, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: code screenshots, crowded labels, generic AI brain imagery
```

### monte-carlo

#### monte-carlo-estimator-core

- Key: `monte-carlo:monte-carlo-estimator-core`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/monte-carlo-estimator-core.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a square sampling window filled with random dots, a smooth target region inside it, highlighted accepted samples, and a small stabilization trail showing the estimate settling as samples increase
Scene/backdrop: clean statistics lab canvas
Subject: random sample cloud, target region, accepted versus rejected dots, stable estimate trail
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, sampling window centered with margin, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: casino imagery, dice, generic randomness wallpaper
```

### probability-likelihood-entropy

#### softmax-cross-entropy

- Key: `probability-likelihood-entropy:softmax-cross-entropy`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/softmax-cross-entropy.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: logit bars flowing through a softmax lens into a probability simplex, with the true class token highlighted and a loss heat glow becoming strongest for confident wrong probability
Scene/backdrop: clean ML courseware canvas with subtle probability grid
Subject: logit bars, softmax lens, probability simplex, true-class marker, penalty glow
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, left-to-right transformation, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact class names, dense numbers, generic AI iconography
```

#### kl-divergence

- Key: `probability-likelihood-entropy:kl-divergence`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/kl-divergence.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: two translucent probability footprints on a triangular simplex, slightly offset, with a strong one-way comparison arrow and asymmetric shadow cost between them
Scene/backdrop: clean probability lab canvas
Subject: target distribution footprint, model distribution footprint, directional comparison arrow, mismatch shadow
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered simplex, readable at page-card size
Color palette: deep ink, cyan, violet, amber, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: ruler-like distance metaphor, exact numeric probabilities, decorative triangles
```

### lu-decomposition

#### lu-factorization-core

- Key: `lu-decomposition:lu-factorization-core`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/lu-factorization-core.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a square matrix block separating into a lower-triangular flow channel and an upper-triangular stair structure, with a solution token moving forward then backward through them
Scene/backdrop: clean numerical linear algebra canvas
Subject: original matrix, lower triangular factor, upper triangular factor, forward substitution path, backward substitution path
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, left-to-right solve pipeline, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense numeric matrix entries, generic factory machinery, unreadable labels
```

#### lup-pivoting-core

- Key: `lu-decomposition:lup-pivoting-core`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/lup-pivoting-core.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a matrix row-swap scene where rows slide on rails to move the strongest pivot tile into the active elimination position before triangular factorization begins
Scene/backdrop: clean numerical methods canvas with subtle matrix grid
Subject: row rails, pivot candidates, selected stable pivot, triangular elimination path
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered row-swap action, readable at page-card size
Color palette: deep ink, cyan, amber, coral warning accent, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense numbers, casino imagery, generic puzzle blocks
```

### sparse-matrices

#### sparse-nnz-core

- Key: `sparse-matrices:sparse-nnz-core`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/sparse-nnz-core.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a large mostly empty matrix grid with a few bright nonzero cells connected into a compact storage list, emphasizing that only meaningful entries are carried forward
Scene/backdrop: clean data-structure canvas
Subject: sparse grid, highlighted nonzero cells, compact value storage strip, light index markers
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, grid on left and compact storage on right, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense spreadsheets, random noise texture, decorative checkerboards
```

#### sparse-csr-rowptr-core

- Key: `sparse-matrices:sparse-csr-rowptr-core`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/sparse-csr-rowptr-core.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a sparse matrix whose rows connect to intervals on two compact arrays, with row pointer markers acting like bookmarks that show each row's start and stop window
Scene/backdrop: clean numerical data-structure canvas
Subject: sparse rows, compact values array, compact column-index array, row pointer bookmarks
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, matrix above arrays, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense array numbers, generic database icons, decorative grid clutter
```

### condition-numbers

#### condition-number-core

- Key: `condition-numbers:condition-number-core`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/condition-number-core.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a unit circle with a tiny input-noise halo being transformed into a long thin ellipse where the same small perturbation becomes a large output uncertainty shadow
Scene/backdrop: clean numerical stability canvas with subtle before-and-after frames
Subject: input unit circle, stretched ellipse, small perturbation halo, amplified output shadow
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, before-and-after sensitivity view, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: generic warning signs, dense matrix numbers, photorealistic scenes
```

#### residual-error-bound

- Key: `condition-numbers:residual-error-bound`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/residual-error-bound.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a solver panel showing a tiny residual gauge while a nearby solution marker casts a much larger displaced error shadow inside an ill-conditioned narrow corridor
Scene/backdrop: clean numerical analysis canvas
Subject: residual gauge, exact solution marker, approximate solution marker, amplified error corridor
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, solver panel and geometry side by side, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, generic red alert graphics, crowded labels
```

### eigenvalues-eigenvectors

#### eigenpair

- Key: `eigenvalues-eigenvectors:eigenpair`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/eigenpair.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: several input arrows entering a linear transform field, most rotate away, but one highlighted arrow remains on the same line and only changes length to show an eigenvector direction
Scene/backdrop: clean linear algebra canvas with subtle transform field
Subject: preserved eigen-direction line, highlighted arrow before and after, other arrows bending away
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered preserved direction, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense matrix values, generic compass imagery, abstract wallpaper
```

#### characteristic-polynomial

- Key: `eigenvalues-eigenvectors:characteristic-polynomial`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/characteristic-polynomial.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a transform dial sweeping across a sequence of grid panels, with root markers lighting up exactly when a grid panel collapses along a preserved direction
Scene/backdrop: clean algebra canvas with subtle parameter track
Subject: parameter dial, grid panels, collapse moment, glowing root markers
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, timeline of transform states, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: polynomial equations, dense graphs, generic root icons
```

#### rayleigh-quotient

- Key: `eigenvalues-eigenvectors:rayleigh-quotient`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/rayleigh-quotient.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a unit direction arrow rotating around a circle while a linked marker rises and falls on a smooth energy landscape, showing direction-dependent matrix stretch
Scene/backdrop: clean spectral analysis canvas
Subject: rotating unit vector, energy surface, high ridge direction, low valley direction
Style/medium: polished vector-like educational illustration with gentle 3D depth, raster PNG
Composition/framing: 16:9, direction circle and energy surface side by side, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact numeric axes, random mountain scenery, dense labels
```

### markov-chains

#### markov-property-core

- Key: `markov-chains:markov-property-core`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/markov-property-core.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a state-transition graph where the current state node is bright, older path trails fade behind it, and all future transition arrows start only from the current state
Scene/backdrop: clean probability process canvas
Subject: state nodes, faded history trail, highlighted current state, outgoing transition arrows
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered graph, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: board game imagery, dense edge labels, generic network wallpaper
```

#### markov-transition-matrix-core

- Key: `markov-chains:markov-transition-matrix-core`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/markov-transition-matrix-core.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a column-stochastic transition matrix shown as vertical probability chutes, each column splitting probability tokens into next-state nodes
Scene/backdrop: clean stochastic process canvas
Subject: matrix columns, probability tokens, outgoing splits, next-state nodes receiving mass
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, matrix on left and state nodes on right, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense decimals, generic spreadsheet cells, decorative networks
```

#### markov-stationary-pagerank-core

- Key: `markov-chains:markov-stationary-pagerank-core`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/markov-stationary-pagerank-core.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a directed web graph where random-walk flow settles into stable node sizes, with a few soft teleport jump arrows showing damping that prevents traps
Scene/backdrop: clean network probability canvas
Subject: directed graph, flow trails, stable node weights, damping jump arrows
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, graph centered with flow motion cues, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: real website logos, dense labels, generic social network art
```

### finite-difference-methods

#### finite-difference-derivative-core

- Key: `finite-difference-methods:finite-difference-derivative-core`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/finite-difference-derivative-core.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a smooth curve with a current sample point and a nearby forward sample point connected by a secant line, plus a faint tangent line showing what the secant approaches as the step shrinks
Scene/backdrop: clean numerical calculus canvas without numeric axes
Subject: curve, current point, forward point, secant line, tangent reference, small step marker
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered curve segment, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense tick labels, generic chalkboard
```

#### finite-difference-error-balance

- Key: `finite-difference-methods:finite-difference-error-balance`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/finite-difference-error-balance.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: an error tradeoff scene with one slope representing truncation error at large steps and another representing roundoff noise at tiny steps, meeting in a clear best-step window
Scene/backdrop: clean numerical methods canvas with a simple abstract error landscape
Subject: large-step blur, tiny-step noisy cancellation, central stable window
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, U-shaped tradeoff without numeric labels, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact plots with numbers, generic warning icons, photorealistic scenes
```

#### finite-difference-gradient-jacobian

- Key: `finite-difference-methods:finite-difference-gradient-jacobian`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/finite-difference-gradient-jacobian.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a multivariable input point with small perturbation arrows along several coordinate directions, each arrow producing a separate output-change tile that together form a gradient or Jacobian view
Scene/backdrop: clean vector calculus canvas
Subject: input point, coordinate perturbation arrows, output-change tiles, assembled sensitivity panel
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, input on left and sensitivity panel on right, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense tables, code screenshots, generic data dashboard
```

### nonlinear-equations

#### nonlinear-root-residual

- Key: `nonlinear-equations:nonlinear-root-residual`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/nonlinear-root-residual.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a smooth nonlinear curve crossing a horizontal zero line, with a current guess point showing a vertical residual gap and the true root crossing highlighted
Scene/backdrop: clean root-finding canvas without numeric axes
Subject: nonlinear curve, zero line, current guess, residual gap, root crossing
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, curve and residual centered, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense graph labels, generic warning graphics
```

#### newton-step

- Key: `nonlinear-equations:newton-step`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/newton-step.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a nonlinear curve with a current guess point, a tangent line drawn from that point to the zero axis, and the tangent intersection highlighted as the next Newton step
Scene/backdrop: clean numerical root-finding canvas
Subject: curve, current point, tangent line, zero-axis intersection, next-step marker
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, tangent geometry centered, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense coordinate ticks, photorealistic objects
```

#### multidimensional-newton

- Key: `nonlinear-equations:multidimensional-newton`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/multidimensional-newton.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a multidimensional residual contour field with a current point, a transparent local linear plane, and a correction arrow solved from that local model toward a lower-residual region
Scene/backdrop: clean numerical analysis canvas with subtle contour lines
Subject: residual contours, current point, local linear plane, correction direction arrow
Style/medium: polished vector-like educational illustration with light 3D depth, raster PNG
Composition/framing: 16:9, centered local model, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense surface labels, generic terrain landscape
```

### optimization

#### optimization-minimizer

- Key: `optimization:optimization-minimizer`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/optimization-minimizer.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a smooth loss landscape with several basins, a shallow local valley and a deeper global valley clearly distinguished by lighting and marker size
Scene/backdrop: clean optimization canvas with subtle contour shadows
Subject: objective landscape, local basin, global basin, descent path markers
Style/medium: polished vector-like educational illustration with gentle 3D depth, raster PNG
Composition/framing: 16:9, landscape centered, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: photorealistic mountains, exact axes, generic target icons
```

#### optimization-steepest-descent

- Key: `optimization:optimization-steepest-descent`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/optimization-steepest-descent.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a contour-map loss valley where a parameter point follows negative-gradient arrows downhill, with a faint overshoot ghost path showing what happens when steps are too large
Scene/backdrop: clean optimization contour canvas
Subject: contour lines, parameter point, negative-gradient steps, overshoot ghost path
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, valley path centered, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equation labels, generic hiking scene, photorealistic landscape
```

#### optimization-newton-step

- Key: `optimization:optimization-newton-step`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/optimization-newton-step.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a narrow curved loss valley with a plain gradient step bouncing across the walls and a curvature-aware Newton step bending along the valley toward the minimum
Scene/backdrop: clean optimization canvas with subtle contour bands
Subject: narrow valley, gradient step, curvature-corrected step, target minimum
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, side-by-side step comparison within one valley, readable at page-card size
Color palette: deep ink, cyan, amber, violet, coral accent, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact Hessian notation, dense labels, photorealistic terrain
```

### training-diagnostics

#### gradient-update-diagnostics

- Key: `training-diagnostics:gradient-update-diagnostics`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/gradient-update-diagnostics.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a compact training diagnostics dashboard with a loss curve, gradient norm pulses, and parameter update arrows on a small parameter plane, all visually linked as one training state
Scene/backdrop: clean ML monitoring canvas
Subject: loss trend, gradient norm pulses, update arrows, stable versus unstable training cues
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, dashboard layout without text-heavy labels, readable at page-card size
Color palette: deep ink, cyan, amber, coral, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: real product dashboard, tiny text, generic stock charts
```

#### validation-gap

- Key: `training-diagnostics:validation-gap`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/validation-gap.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: two clean learning curves over training time, one continuing to improve and one flattening then drifting worse, with the growing gap between them shaded as a generalization warning
Scene/backdrop: clean ML diagnostics canvas
Subject: train curve, validation curve, shaded gap, subtle overfitting warning cue
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, curve panel centered, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact numeric axes, real dashboard screenshots, crowded labels
```

### least-squares-fitting

#### least-squares-residual-objective

- Key: `least-squares-fitting:least-squares-residual-objective`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/least-squares-residual-objective.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: scattered data points around a fit line, with vertical residual segments and translucent square blocks beside them showing how residuals are squared and accumulated
Scene/backdrop: clean regression canvas without numeric axes
Subject: data points, fit line, residual segments, squared error blocks
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, regression plot centered, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense tick labels, real spreadsheet screenshots
```

#### least-squares-normal-equations

- Key: `least-squares-fitting:least-squares-normal-equations`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/least-squares-normal-equations.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a column-space plane in 3D, an observation vector projecting onto the plane, and a residual arrow standing perpendicular to the plane
Scene/backdrop: clean linear algebra canvas with subtle depth
Subject: column space plane, observed vector, projection point, orthogonal residual arrow
Style/medium: polished vector-like educational illustration with gentle 3D depth, raster PNG
Composition/framing: 16:9, plane and vectors centered, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense coordinate labels, photorealistic room scenes
```

#### least-squares-svd-pseudoinverse

- Key: `least-squares-fitting:least-squares-svd-pseudoinverse`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/least-squares-svd-pseudoinverse.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a rectangular least-squares system passing through SVD singular-direction filters, weak directions softened, then recombining into a stable solution vector
Scene/backdrop: clean numerical linear algebra canvas
Subject: rectangular system block, singular direction channels, filtered weak channel, recombined solution
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, left-to-right filtered solve pipeline, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense numeric matrices, generic water filters, photorealistic machinery
```

### svd

#### singular-value-decomposition

- Key: `svd:singular-value-decomposition`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/singular-value-decomposition.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: an input shape passing through three clean panels: rotate into special directions, stretch along orthogonal axes with different strengths, then rotate into the output orientation
Scene/backdrop: clean SVD courseware canvas
Subject: input shape, first rotation panel, diagonal stretch panel, final rotation panel, output shape
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, three-stage pipeline, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense matrix notation, generic abstract blocks, photorealistic machinery
```

#### rank-from-singular-values

- Key: `svd:rank-from-singular-values`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/rank-from-singular-values.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a singular-value spectrum shown as energy bars, with bright active bars standing above a calm floor and near-zero bars fading into the floor to show lost directions
Scene/backdrop: clean spectral analysis canvas
Subject: singular value bars, active directions, near-zero directions, effective-rank cutoff glow
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, spectrum centered with direction icons, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact numeric bar labels, generic finance chart, decorative histogram wallpaper
```

#### svd-pseudoinverse

- Key: `svd:svd-pseudoinverse`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/svd-pseudoinverse.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: singular-direction channels flowing backward through inverse-scaling gates, with strong channels passing cleanly and a near-zero weak channel shown as a guarded noisy amplifier
Scene/backdrop: clean numerical linear algebra canvas
Subject: singular direction channels, inverse scaling gates, weak near-zero channel guard, reconstructed input
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, backward-flow pipeline, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense equations, generic machine parts, noisy abstract background
```

#### svd-low-rank

- Key: `svd:svd-low-rank`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/svd-low-rank.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: an image-like matrix reconstructed from the first few bright singular layers, with later low-energy detail layers fading into a residual mist
Scene/backdrop: clean matrix compression canvas
Subject: original matrix image, leading singular layers, reconstructed low-rank image, faint residual layer
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, decomposition-to-reconstruction flow, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: real copyrighted photos, dense labels, generic compression icons
```

### pca

#### pca-centered-projection

- Key: `pca:pca-centered-projection`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/pca-centered-projection.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: an offset point cloud moving toward its mean center, then projecting onto a long principal axis that captures the widest spread
Scene/backdrop: clean dimensionality-reduction canvas
Subject: original shifted cloud, mean-centering arrow, centered cloud, principal projection axis
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, two-step centering and projection flow, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact numeric axes, generic scatterplot clutter, photorealistic scenes
```

#### pca-covariance-diagonalization

- Key: `pca:pca-covariance-diagonalization`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/pca-covariance-diagonalization.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a tilted correlated point-cloud ellipse rotating into principal-component axes where the spread becomes aligned with two clean perpendicular directions
Scene/backdrop: clean PCA canvas with subtle before-and-after frames
Subject: correlated ellipse, rotation arrow, principal axes, axis-aligned variance spread
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, before-and-after rotation view, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense covariance matrix entries, generic scatterplot noise, decorative spirals
```

#### pca-svd-explained-variance

- Key: `pca:pca-svd-explained-variance`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/pca-svd-explained-variance.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: descending principal-component energy bars feeding into a cumulative explained-variance band, showing that the first few components retain most of the signal
Scene/backdrop: clean PCA analysis canvas
Subject: singular-value energy bars, cumulative retention band, selected leading components, faded trailing components
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, energy spectrum centered, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact numeric chart labels, generic finance bars, dense text
```

### deep-architecture-math

#### convolution-output-size

- Key: `deep-architecture-math:convolution-output-size`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/convolution-output-size.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a convolution kernel window sliding across a padded input image grid, with each valid landing position lighting up one cell in a smaller output feature map
Scene/backdrop: clean deep-learning architecture canvas
Subject: input grid, padding border, sliding kernel, stride steps, output feature map cells
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, input grid on left and output map on right, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: real photos, dense labels, generic neural network wallpaper
```

#### scaled-dot-product-attention

- Key: `deep-architecture-math:scaled-dot-product-attention`
- Status: `generated`
- Asset: `/math-lab/concepts/generated/scaled-dot-product-attention.png`

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: one query token comparing to several key tokens with different brightness links, a softmax-like weight ribbon, and value vectors blending into one output representation
Scene/backdrop: clean Transformer math canvas
Subject: query token, key tokens, weighted attention links, value vectors, blended output token
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, attention flow centered, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: generic robot brains, dense token text, brand-like icons
```

