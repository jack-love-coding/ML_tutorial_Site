import type { LocalizedCopy, MathLabModuleId } from '../types/mathLab'

export type ConceptIllustrationStatus = 'prompt-ready' | 'generated'

export interface ConceptIllustration {
  key: `${MathLabModuleId}:${string}`
  moduleId: MathLabModuleId
  conceptId: string
  status: ConceptIllustrationStatus
  title: LocalizedCopy
  assetPath: string
  alt?: LocalizedCopy
  caption?: LocalizedCopy
  transcript: LocalizedCopy
  learningPurpose: LocalizedCopy
  prompt: string
}

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function illustration(input: ConceptIllustration): ConceptIllustration {
  return input
}

const zhTitlePrefix = '\u8bfe\u4ef6\u63d2\u56fe'
const zhAlt = '\u672c\u77e5\u8bc6\u70b9\u7684\u53ef\u89c6\u5316\u8bfe\u4ef6\u63d2\u56fe'
const zhCaption = '\u8fd9\u5f20\u56fe\u7528\u4e8e\u5e2e\u52a9\u7406\u89e3\u8be5\u77e5\u8bc6\u70b9\u7684\u6838\u5fc3\u5173\u7cfb\u3002'
const zhTranscript = '\u56fe\u50cf\u5c55\u793a\u8be5\u77e5\u8bc6\u70b9\u7684\u5173\u952e\u5bf9\u8c61\u3001\u7ed3\u6784\u548c\u76f8\u4e92\u5173\u7cfb\u3002'
const zhPurpose = '\u5e2e\u52a9\u5b66\u751f\u5efa\u7acb\u8be5\u77e5\u8bc6\u70b9\u7684\u89c6\u89c9\u76f4\u89c9\u3002'

export const conceptIllustrations: ConceptIllustration[] = [
  illustration({
    key: "vectors-matrices-norms:dot-product-cosine-similarity",
    moduleId: "vectors-matrices-norms",
    conceptId: "dot-product-cosine-similarity",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Dot Product and Cosine Similarity`, "Dot Product and Cosine Similarity illustration"),
    assetPath: "/math-lab/concepts/generated/dot-product-cosine-similarity.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Dot Product and Cosine Similarity."),
    caption: copy(zhCaption, "Use the image to build intuition for Dot Product and Cosine Similarity."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Dot Product and Cosine Similarity."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Dot Product and Cosine Similarity."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a clean courseware illustration of two feature vectors sharing an origin, the angle between them, and one vector casting a soft projection shadow onto the other vector to show cosine similarity
Scene/backdrop: light scientific canvas with a subtle coordinate grid and small feature-space markers
Subject: two high-contrast arrows, a translucent projection band, and a similarity glow that becomes strongest when directions align
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered concept, readable at page-card size
Color palette: deep ink, cyan, amber, white, restrained accents
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: generic abstract math wallpaper, unreadable labels, photorealistic classroom scenes`,
  }),
  illustration({
    key: "vectors-matrices-norms:matrix-as-linear-transform",
    moduleId: "vectors-matrices-norms",
    conceptId: "matrix-as-linear-transform",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Matrix as Linear Transform`, "Matrix as Linear Transform illustration"),
    assetPath: "/math-lab/concepts/generated/matrix-as-linear-transform.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Matrix as Linear Transform."),
    caption: copy(zhCaption, "Use the image to build intuition for Matrix as Linear Transform."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Matrix as Linear Transform."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Matrix as Linear Transform."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: an educational illustration showing a square coordinate grid entering a transparent matrix transform gate and leaving as a rotated, sheared parallelogram grid
Scene/backdrop: clean math lab canvas with subtle grid depth
Subject: input basis arrows, transformed basis arrows, and the deformed grid surface
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, left-to-right transformation flow, readable at page-card size
Color palette: deep ink, teal, violet, amber, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: random abstract cubes, photorealistic machinery, unreadable labels`,
  }),
  illustration({
    key: "vectors-matrices-norms:induced-matrix-norm",
    moduleId: "vectors-matrices-norms",
    conceptId: "induced-matrix-norm",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Induced Matrix Norm`, "Induced Matrix Norm illustration"),
    assetPath: "/math-lab/concepts/generated/induced-matrix-norm.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Induced Matrix Norm."),
    caption: copy(zhCaption, "Use the image to build intuition for Induced Matrix Norm."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Induced Matrix Norm."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Induced Matrix Norm."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a unit circle made of many small input arrows transformed into a stretched ellipse, with the longest output arrow glowing to represent maximum amplification
Scene/backdrop: clean scientific canvas with two faint coordinate frames
Subject: unit input boundary, transformed output ellipse, highlighted worst-case stretch direction
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, before-and-after panels connected by a matrix transform arrow
Color palette: deep ink, cyan, magenta, amber, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: generic wave patterns, random matrices filled with numbers, photorealistic scenes`,
  }),
  illustration({
    key: "tensor-shapes-vectorization:linear-layer-shape-contract",
    moduleId: "tensor-shapes-vectorization",
    conceptId: "linear-layer-shape-contract",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Linear Layer Shape Contract`, "Linear Layer Shape Contract illustration"),
    assetPath: "/math-lab/concepts/generated/linear-layer-shape-contract.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Linear Layer Shape Contract."),
    caption: copy(zhCaption, "Use the image to build intuition for Linear Layer Shape Contract."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Linear Layer Shape Contract."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Linear Layer Shape Contract."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a tensor-shape courseware diagram where parallel batch lanes enter a weight matrix panel, the feature axis is visibly consumed, and hidden output lanes emerge
Scene/backdrop: clean AI lab canvas with subtle array blocks
Subject: batch lanes preserved, feature columns reduced, hidden channels produced, small bias tile broadcast across outputs
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, left-to-right pipeline, readable at page-card size
Color palette: deep ink, cyan, green, amber, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: code screenshots, unreadable tensor labels, generic server racks`,
  }),
  illustration({
    key: "tensor-shapes-vectorization:broadcasting-compatibility",
    moduleId: "tensor-shapes-vectorization",
    conceptId: "broadcasting-compatibility",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Broadcasting Compatibility`, "Broadcasting Compatibility illustration"),
    assetPath: "/math-lab/concepts/generated/broadcasting-compatibility.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Broadcasting Compatibility."),
    caption: copy(zhCaption, "Use the image to build intuition for Broadcasting Compatibility."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Broadcasting Compatibility."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Broadcasting Compatibility."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a clear broadcasting diagram showing a small bias strip being copied across rows of a larger activation matrix, with compatible axes snapping into place and one incompatible ghost strip rejected
Scene/backdrop: clean courseware canvas with subtle tensor tiles
Subject: large matrix block, reusable bias strip, repeated translucent copies, one rejected mismatch cue
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered tensor blocks, readable at page-card size
Color palette: deep ink, cyan, mint, red-orange warning accent, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense code, random spreadsheets, decorative abstract blocks`,
  }),
  illustration({
    key: "taylor-series:taylor-polynomial",
    moduleId: "taylor-series",
    conceptId: "taylor-polynomial",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Taylor Polynomial`, "Taylor Polynomial illustration"),
    assetPath: "/math-lab/concepts/generated/taylor-polynomial.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Taylor Polynomial."),
    caption: copy(zhCaption, "Use the image to build intuition for Taylor Polynomial."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Taylor Polynomial."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Taylor Polynomial."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a teaching illustration of a smooth curve with several polynomial approximation ribbons of increasing accuracy hugging the curve near one glowing expansion center and drifting apart farther away
Scene/backdrop: clean scientific plotting canvas without numeric axes
Subject: true curve, first rough approximation, higher-order approximation, highlighted local neighborhood
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, central curve and expansion point, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense coordinate labels, generic chalkboard, photorealistic classroom scenes`,
  }),
  illustration({
    key: "taylor-series:taylor-remainder",
    moduleId: "taylor-series",
    conceptId: "taylor-remainder",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Taylor Remainder`, "Taylor Remainder illustration"),
    assetPath: "/math-lab/concepts/generated/taylor-remainder.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Taylor Remainder."),
    caption: copy(zhCaption, "Use the image to build intuition for Taylor Remainder."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Taylor Remainder."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Taylor Remainder."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a clean illustration of a true function curve and a truncated approximation curve with a shaded remainder band that grows wider as it moves away from the expansion center
Scene/backdrop: light courseware plotting canvas without numeric axes
Subject: true curve, approximation curve, shaded error region, center point, far-away warning region
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, wide curve view, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense tick labels, decorative math wallpaper`,
  }),
  illustration({
    key: "matrix-calculus-autodiff:local-linearization",
    moduleId: "matrix-calculus-autodiff",
    conceptId: "local-linearization",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Local Linearization`, "Local Linearization illustration"),
    assetPath: "/math-lab/concepts/generated/local-linearization.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Local Linearization."),
    caption: copy(zhCaption, "Use the image to build intuition for Local Linearization."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Local Linearization."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Local Linearization."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a curved surface with one glowing point and a transparent tangent plane touching it, showing small displacement arrows on the plane as the local linear approximation
Scene/backdrop: clean 3D math lab canvas with subtle contour shadows
Subject: curved surface, tangent plane, local point, small input and output displacement arrows
Style/medium: polished vector-like educational illustration with gentle 3D depth, raster PNG
Composition/framing: 16:9, centered surface and plane, readable at page-card size
Color palette: deep ink, cyan, violet, amber, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: photorealistic terrain, dense labels, generic neural network art`,
  }),
  illustration({
    key: "matrix-calculus-autodiff:vjp-jvp",
    moduleId: "matrix-calculus-autodiff",
    conceptId: "vjp-jvp",
    status: "generated",
    title: copy(`${zhTitlePrefix}: VJP and JVP`, "VJP and JVP illustration"),
    assetPath: "/math-lab/concepts/generated/vjp-jvp.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for VJP and JVP."),
    caption: copy(zhCaption, "Use the image to build intuition for VJP and JVP."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for VJP and JVP."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for VJP and JVP."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a computation graph with layered nodes, one bright tangent signal moving forward through the graph and one gradient signal moving backward through the same edges
Scene/backdrop: clean dark-on-light technical canvas with subtle node lanes
Subject: graph nodes, forward tangent arrows, backward adjoint arrows, no full Jacobian table
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, left-to-right graph, readable at page-card size
Color palette: deep ink, cyan for forward flow, amber for backward flow, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: code screenshots, crowded labels, generic AI brain imagery`,
  }),
  illustration({
    key: "monte-carlo:monte-carlo-estimator-core",
    moduleId: "monte-carlo",
    conceptId: "monte-carlo-estimator-core",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Monte Carlo Estimator`, "Monte Carlo Estimator illustration"),
    assetPath: "/math-lab/concepts/generated/monte-carlo-estimator-core.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Monte Carlo Estimator."),
    caption: copy(zhCaption, "Use the image to build intuition for Monte Carlo Estimator."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Monte Carlo Estimator."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Monte Carlo Estimator."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a square sampling window filled with random dots, a smooth target region inside it, highlighted accepted samples, and a small stabilization trail showing the estimate settling as samples increase
Scene/backdrop: clean statistics lab canvas
Subject: random sample cloud, target region, accepted versus rejected dots, stable estimate trail
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, sampling window centered with margin, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: casino imagery, dice, generic randomness wallpaper`,
  }),
  illustration({
    key: "probability-likelihood-entropy:softmax-cross-entropy",
    moduleId: "probability-likelihood-entropy",
    conceptId: "softmax-cross-entropy",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Softmax Cross-Entropy`, "Softmax Cross-Entropy illustration"),
    assetPath: "/math-lab/concepts/generated/softmax-cross-entropy.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Softmax Cross-Entropy."),
    caption: copy(zhCaption, "Use the image to build intuition for Softmax Cross-Entropy."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Softmax Cross-Entropy."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Softmax Cross-Entropy."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: logit bars flowing through a softmax lens into a probability simplex, with the true class token highlighted and a loss heat glow becoming strongest for confident wrong probability
Scene/backdrop: clean ML courseware canvas with subtle probability grid
Subject: logit bars, softmax lens, probability simplex, true-class marker, penalty glow
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, left-to-right transformation, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact class names, dense numbers, generic AI iconography`,
  }),
  illustration({
    key: "probability-likelihood-entropy:kl-divergence",
    moduleId: "probability-likelihood-entropy",
    conceptId: "kl-divergence",
    status: "generated",
    title: copy(`${zhTitlePrefix}: KL Divergence`, "KL Divergence illustration"),
    assetPath: "/math-lab/concepts/generated/kl-divergence.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for KL Divergence."),
    caption: copy(zhCaption, "Use the image to build intuition for KL Divergence."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for KL Divergence."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for KL Divergence."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: two translucent probability footprints on a triangular simplex, slightly offset, with a strong one-way comparison arrow and asymmetric shadow cost between them
Scene/backdrop: clean probability lab canvas
Subject: target distribution footprint, model distribution footprint, directional comparison arrow, mismatch shadow
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered simplex, readable at page-card size
Color palette: deep ink, cyan, violet, amber, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: ruler-like distance metaphor, exact numeric probabilities, decorative triangles`,
  }),
  illustration({
    key: "lu-decomposition:lu-factorization-core",
    moduleId: "lu-decomposition",
    conceptId: "lu-factorization-core",
    status: "generated",
    title: copy(`${zhTitlePrefix}: LU Factorization`, "LU Factorization illustration"),
    assetPath: "/math-lab/concepts/generated/lu-factorization-core.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for LU Factorization."),
    caption: copy(zhCaption, "Use the image to build intuition for LU Factorization."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for LU Factorization."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for LU Factorization."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a square matrix block separating into a lower-triangular flow channel and an upper-triangular stair structure, with a solution token moving forward then backward through them
Scene/backdrop: clean numerical linear algebra canvas
Subject: original matrix, lower triangular factor, upper triangular factor, forward substitution path, backward substitution path
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, left-to-right solve pipeline, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense numeric matrix entries, generic factory machinery, unreadable labels`,
  }),
  illustration({
    key: "lu-decomposition:lup-pivoting-core",
    moduleId: "lu-decomposition",
    conceptId: "lup-pivoting-core",
    status: "generated",
    title: copy(`${zhTitlePrefix}: LUP Pivoting`, "LUP Pivoting illustration"),
    assetPath: "/math-lab/concepts/generated/lup-pivoting-core.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for LUP Pivoting."),
    caption: copy(zhCaption, "Use the image to build intuition for LUP Pivoting."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for LUP Pivoting."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for LUP Pivoting."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a matrix row-swap scene where rows slide on rails to move the strongest pivot tile into the active elimination position before triangular factorization begins
Scene/backdrop: clean numerical methods canvas with subtle matrix grid
Subject: row rails, pivot candidates, selected stable pivot, triangular elimination path
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered row-swap action, readable at page-card size
Color palette: deep ink, cyan, amber, coral warning accent, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense numbers, casino imagery, generic puzzle blocks`,
  }),
  illustration({
    key: "sparse-matrices:sparse-nnz-core",
    moduleId: "sparse-matrices",
    conceptId: "sparse-nnz-core",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Sparse NNZ`, "Sparse NNZ illustration"),
    assetPath: "/math-lab/concepts/generated/sparse-nnz-core.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Sparse NNZ."),
    caption: copy(zhCaption, "Use the image to build intuition for Sparse NNZ."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Sparse NNZ."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Sparse NNZ."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a large mostly empty matrix grid with a few bright nonzero cells connected into a compact storage list, emphasizing that only meaningful entries are carried forward
Scene/backdrop: clean data-structure canvas
Subject: sparse grid, highlighted nonzero cells, compact value storage strip, light index markers
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, grid on left and compact storage on right, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense spreadsheets, random noise texture, decorative checkerboards`,
  }),
  illustration({
    key: "sparse-matrices:sparse-csr-rowptr-core",
    moduleId: "sparse-matrices",
    conceptId: "sparse-csr-rowptr-core",
    status: "generated",
    title: copy(`${zhTitlePrefix}: CSR Row Pointer`, "CSR Row Pointer illustration"),
    assetPath: "/math-lab/concepts/generated/sparse-csr-rowptr-core.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for CSR Row Pointer."),
    caption: copy(zhCaption, "Use the image to build intuition for CSR Row Pointer."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for CSR Row Pointer."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for CSR Row Pointer."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a sparse matrix whose rows connect to intervals on two compact arrays, with row pointer markers acting like bookmarks that show each row's start and stop window
Scene/backdrop: clean numerical data-structure canvas
Subject: sparse rows, compact values array, compact column-index array, row pointer bookmarks
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, matrix above arrays, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense array numbers, generic database icons, decorative grid clutter`,
  }),
  illustration({
    key: "condition-numbers:condition-number-core",
    moduleId: "condition-numbers",
    conceptId: "condition-number-core",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Condition Number`, "Condition Number illustration"),
    assetPath: "/math-lab/concepts/generated/condition-number-core.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Condition Number."),
    caption: copy(zhCaption, "Use the image to build intuition for Condition Number."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Condition Number."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Condition Number."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a unit circle with a tiny input-noise halo being transformed into a long thin ellipse where the same small perturbation becomes a large output uncertainty shadow
Scene/backdrop: clean numerical stability canvas with subtle before-and-after frames
Subject: input unit circle, stretched ellipse, small perturbation halo, amplified output shadow
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, before-and-after sensitivity view, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: generic warning signs, dense matrix numbers, photorealistic scenes`,
  }),
  illustration({
    key: "condition-numbers:residual-error-bound",
    moduleId: "condition-numbers",
    conceptId: "residual-error-bound",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Residual Error Bound`, "Residual Error Bound illustration"),
    assetPath: "/math-lab/concepts/generated/residual-error-bound.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Residual Error Bound."),
    caption: copy(zhCaption, "Use the image to build intuition for Residual Error Bound."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Residual Error Bound."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Residual Error Bound."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a solver panel showing a tiny residual gauge while a nearby solution marker casts a much larger displaced error shadow inside an ill-conditioned narrow corridor
Scene/backdrop: clean numerical analysis canvas
Subject: residual gauge, exact solution marker, approximate solution marker, amplified error corridor
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, solver panel and geometry side by side, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, generic red alert graphics, crowded labels`,
  }),
  illustration({
    key: "eigenvalues-eigenvectors:eigenpair",
    moduleId: "eigenvalues-eigenvectors",
    conceptId: "eigenpair",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Eigenpair`, "Eigenpair illustration"),
    assetPath: "/math-lab/concepts/generated/eigenpair.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Eigenpair."),
    caption: copy(zhCaption, "Use the image to build intuition for Eigenpair."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Eigenpair."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Eigenpair."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: several input arrows entering a linear transform field, most rotate away, but one highlighted arrow remains on the same line and only changes length to show an eigenvector direction
Scene/backdrop: clean linear algebra canvas with subtle transform field
Subject: preserved eigen-direction line, highlighted arrow before and after, other arrows bending away
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered preserved direction, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense matrix values, generic compass imagery, abstract wallpaper`,
  }),
  illustration({
    key: "eigenvalues-eigenvectors:characteristic-polynomial",
    moduleId: "eigenvalues-eigenvectors",
    conceptId: "characteristic-polynomial",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Characteristic Polynomial`, "Characteristic Polynomial illustration"),
    assetPath: "/math-lab/concepts/generated/characteristic-polynomial.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Characteristic Polynomial."),
    caption: copy(zhCaption, "Use the image to build intuition for Characteristic Polynomial."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Characteristic Polynomial."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Characteristic Polynomial."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a transform dial sweeping across a sequence of grid panels, with root markers lighting up exactly when a grid panel collapses along a preserved direction
Scene/backdrop: clean algebra canvas with subtle parameter track
Subject: parameter dial, grid panels, collapse moment, glowing root markers
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, timeline of transform states, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: polynomial equations, dense graphs, generic root icons`,
  }),
  illustration({
    key: "eigenvalues-eigenvectors:rayleigh-quotient",
    moduleId: "eigenvalues-eigenvectors",
    conceptId: "rayleigh-quotient",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Rayleigh Quotient`, "Rayleigh Quotient illustration"),
    assetPath: "/math-lab/concepts/generated/rayleigh-quotient.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Rayleigh Quotient."),
    caption: copy(zhCaption, "Use the image to build intuition for Rayleigh Quotient."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Rayleigh Quotient."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Rayleigh Quotient."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a unit direction arrow rotating around a circle while a linked marker rises and falls on a smooth energy landscape, showing direction-dependent matrix stretch
Scene/backdrop: clean spectral analysis canvas
Subject: rotating unit vector, energy surface, high ridge direction, low valley direction
Style/medium: polished vector-like educational illustration with gentle 3D depth, raster PNG
Composition/framing: 16:9, direction circle and energy surface side by side, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact numeric axes, random mountain scenery, dense labels`,
  }),
  illustration({
    key: "markov-chains:markov-property-core",
    moduleId: "markov-chains",
    conceptId: "markov-property-core",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Markov Property`, "Markov Property illustration"),
    assetPath: "/math-lab/concepts/generated/markov-property-core.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Markov Property."),
    caption: copy(zhCaption, "Use the image to build intuition for Markov Property."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Markov Property."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Markov Property."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a state-transition graph where the current state node is bright, older path trails fade behind it, and all future transition arrows start only from the current state
Scene/backdrop: clean probability process canvas
Subject: state nodes, faded history trail, highlighted current state, outgoing transition arrows
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered graph, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: board game imagery, dense edge labels, generic network wallpaper`,
  }),
  illustration({
    key: "markov-chains:markov-transition-matrix-core",
    moduleId: "markov-chains",
    conceptId: "markov-transition-matrix-core",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Transition Matrix`, "Transition Matrix illustration"),
    assetPath: "/math-lab/concepts/generated/markov-transition-matrix-core.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Transition Matrix."),
    caption: copy(zhCaption, "Use the image to build intuition for Transition Matrix."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Transition Matrix."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Transition Matrix."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a column-stochastic transition matrix shown as vertical probability chutes, each column splitting probability tokens into next-state nodes
Scene/backdrop: clean stochastic process canvas
Subject: matrix columns, probability tokens, outgoing splits, next-state nodes receiving mass
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, matrix on left and state nodes on right, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense decimals, generic spreadsheet cells, decorative networks`,
  }),
  illustration({
    key: "markov-chains:markov-stationary-pagerank-core",
    moduleId: "markov-chains",
    conceptId: "markov-stationary-pagerank-core",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Stationary Distribution and PageRank`, "Stationary Distribution and PageRank illustration"),
    assetPath: "/math-lab/concepts/generated/markov-stationary-pagerank-core.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Stationary Distribution and PageRank."),
    caption: copy(zhCaption, "Use the image to build intuition for Stationary Distribution and PageRank."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Stationary Distribution and PageRank."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Stationary Distribution and PageRank."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a directed web graph where random-walk flow settles into stable node sizes, with a few soft teleport jump arrows showing damping that prevents traps
Scene/backdrop: clean network probability canvas
Subject: directed graph, flow trails, stable node weights, damping jump arrows
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, graph centered with flow motion cues, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: real website logos, dense labels, generic social network art`,
  }),
  illustration({
    key: "finite-difference-methods:finite-difference-derivative-core",
    moduleId: "finite-difference-methods",
    conceptId: "finite-difference-derivative-core",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Finite Difference Derivative`, "Finite Difference Derivative illustration"),
    assetPath: "/math-lab/concepts/generated/finite-difference-derivative-core.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Finite Difference Derivative."),
    caption: copy(zhCaption, "Use the image to build intuition for Finite Difference Derivative."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Finite Difference Derivative."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Finite Difference Derivative."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a smooth curve with a current sample point and a nearby forward sample point connected by a secant line, plus a faint tangent line showing what the secant approaches as the step shrinks
Scene/backdrop: clean numerical calculus canvas without numeric axes
Subject: curve, current point, forward point, secant line, tangent reference, small step marker
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered curve segment, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense tick labels, generic chalkboard`,
  }),
  illustration({
    key: "finite-difference-methods:finite-difference-error-balance",
    moduleId: "finite-difference-methods",
    conceptId: "finite-difference-error-balance",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Finite Difference Error Balance`, "Finite Difference Error Balance illustration"),
    assetPath: "/math-lab/concepts/generated/finite-difference-error-balance.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Finite Difference Error Balance."),
    caption: copy(zhCaption, "Use the image to build intuition for Finite Difference Error Balance."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Finite Difference Error Balance."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Finite Difference Error Balance."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: an error tradeoff scene with one slope representing truncation error at large steps and another representing roundoff noise at tiny steps, meeting in a clear best-step window
Scene/backdrop: clean numerical methods canvas with a simple abstract error landscape
Subject: large-step blur, tiny-step noisy cancellation, central stable window
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, U-shaped tradeoff without numeric labels, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact plots with numbers, generic warning icons, photorealistic scenes`,
  }),
  illustration({
    key: "finite-difference-methods:finite-difference-gradient-jacobian",
    moduleId: "finite-difference-methods",
    conceptId: "finite-difference-gradient-jacobian",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Gradient and Jacobian Finite Differences`, "Gradient and Jacobian Finite Differences illustration"),
    assetPath: "/math-lab/concepts/generated/finite-difference-gradient-jacobian.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Gradient and Jacobian Finite Differences."),
    caption: copy(zhCaption, "Use the image to build intuition for Gradient and Jacobian Finite Differences."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Gradient and Jacobian Finite Differences."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Gradient and Jacobian Finite Differences."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a multivariable input point with small perturbation arrows along several coordinate directions, each arrow producing a separate output-change tile that together form a gradient or Jacobian view
Scene/backdrop: clean vector calculus canvas
Subject: input point, coordinate perturbation arrows, output-change tiles, assembled sensitivity panel
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, input on left and sensitivity panel on right, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense tables, code screenshots, generic data dashboard`,
  }),
  illustration({
    key: "nonlinear-equations:nonlinear-root-residual",
    moduleId: "nonlinear-equations",
    conceptId: "nonlinear-root-residual",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Nonlinear Root Residual`, "Nonlinear Root Residual illustration"),
    assetPath: "/math-lab/concepts/generated/nonlinear-root-residual.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Nonlinear Root Residual."),
    caption: copy(zhCaption, "Use the image to build intuition for Nonlinear Root Residual."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Nonlinear Root Residual."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Nonlinear Root Residual."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a smooth nonlinear curve crossing a horizontal zero line, with a current guess point showing a vertical residual gap and the true root crossing highlighted
Scene/backdrop: clean root-finding canvas without numeric axes
Subject: nonlinear curve, zero line, current guess, residual gap, root crossing
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, curve and residual centered, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense graph labels, generic warning graphics`,
  }),
  illustration({
    key: "nonlinear-equations:newton-step",
    moduleId: "nonlinear-equations",
    conceptId: "newton-step",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Newton Step`, "Newton Step illustration"),
    assetPath: "/math-lab/concepts/generated/newton-step.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Newton Step."),
    caption: copy(zhCaption, "Use the image to build intuition for Newton Step."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Newton Step."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Newton Step."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a nonlinear curve with a current guess point, a tangent line drawn from that point to the zero axis, and the tangent intersection highlighted as the next Newton step
Scene/backdrop: clean numerical root-finding canvas
Subject: curve, current point, tangent line, zero-axis intersection, next-step marker
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, tangent geometry centered, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense coordinate ticks, photorealistic objects`,
  }),
  illustration({
    key: "nonlinear-equations:multidimensional-newton",
    moduleId: "nonlinear-equations",
    conceptId: "multidimensional-newton",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Multidimensional Newton Step`, "Multidimensional Newton Step illustration"),
    assetPath: "/math-lab/concepts/generated/multidimensional-newton.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Multidimensional Newton Step."),
    caption: copy(zhCaption, "Use the image to build intuition for Multidimensional Newton Step."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Multidimensional Newton Step."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Multidimensional Newton Step."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a multidimensional residual contour field with a current point, a transparent local linear plane, and a correction arrow solved from that local model toward a lower-residual region
Scene/backdrop: clean numerical analysis canvas with subtle contour lines
Subject: residual contours, current point, local linear plane, correction direction arrow
Style/medium: polished vector-like educational illustration with light 3D depth, raster PNG
Composition/framing: 16:9, centered local model, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense surface labels, generic terrain landscape`,
  }),
  illustration({
    key: "optimization:optimization-minimizer",
    moduleId: "optimization",
    conceptId: "optimization-minimizer",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Optimization Minimizer`, "Optimization Minimizer illustration"),
    assetPath: "/math-lab/concepts/generated/optimization-minimizer.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Optimization Minimizer."),
    caption: copy(zhCaption, "Use the image to build intuition for Optimization Minimizer."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Optimization Minimizer."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Optimization Minimizer."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a smooth loss landscape with several basins, a shallow local valley and a deeper global valley clearly distinguished by lighting and marker size
Scene/backdrop: clean optimization canvas with subtle contour shadows
Subject: objective landscape, local basin, global basin, descent path markers
Style/medium: polished vector-like educational illustration with gentle 3D depth, raster PNG
Composition/framing: 16:9, landscape centered, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: photorealistic mountains, exact axes, generic target icons`,
  }),
  illustration({
    key: "optimization:optimization-steepest-descent",
    moduleId: "optimization",
    conceptId: "optimization-steepest-descent",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Steepest Descent`, "Steepest Descent illustration"),
    assetPath: "/math-lab/concepts/generated/optimization-steepest-descent.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Steepest Descent."),
    caption: copy(zhCaption, "Use the image to build intuition for Steepest Descent."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Steepest Descent."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Steepest Descent."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a contour-map loss valley where a parameter point follows negative-gradient arrows downhill, with a faint overshoot ghost path showing what happens when steps are too large
Scene/backdrop: clean optimization contour canvas
Subject: contour lines, parameter point, negative-gradient steps, overshoot ghost path
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, valley path centered, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equation labels, generic hiking scene, photorealistic landscape`,
  }),
  illustration({
    key: "optimization:optimization-newton-step",
    moduleId: "optimization",
    conceptId: "optimization-newton-step",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Newton Optimization Step`, "Newton Optimization Step illustration"),
    assetPath: "/math-lab/concepts/generated/optimization-newton-step.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Newton Optimization Step."),
    caption: copy(zhCaption, "Use the image to build intuition for Newton Optimization Step."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Newton Optimization Step."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Newton Optimization Step."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a narrow curved loss valley with a plain gradient step bouncing across the walls and a curvature-aware Newton step bending along the valley toward the minimum
Scene/backdrop: clean optimization canvas with subtle contour bands
Subject: narrow valley, gradient step, curvature-corrected step, target minimum
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, side-by-side step comparison within one valley, readable at page-card size
Color palette: deep ink, cyan, amber, violet, coral accent, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact Hessian notation, dense labels, photorealistic terrain`,
  }),
  illustration({
    key: "training-diagnostics:gradient-update-diagnostics",
    moduleId: "training-diagnostics",
    conceptId: "gradient-update-diagnostics",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Gradient Update Diagnostics`, "Gradient Update Diagnostics illustration"),
    assetPath: "/math-lab/concepts/generated/gradient-update-diagnostics.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Gradient Update Diagnostics."),
    caption: copy(zhCaption, "Use the image to build intuition for Gradient Update Diagnostics."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Gradient Update Diagnostics."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Gradient Update Diagnostics."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a compact training diagnostics dashboard with a loss curve, gradient norm pulses, and parameter update arrows on a small parameter plane, all visually linked as one training state
Scene/backdrop: clean ML monitoring canvas
Subject: loss trend, gradient norm pulses, update arrows, stable versus unstable training cues
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, dashboard layout without text-heavy labels, readable at page-card size
Color palette: deep ink, cyan, amber, coral, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: real product dashboard, tiny text, generic stock charts`,
  }),
  illustration({
    key: "training-diagnostics:validation-gap",
    moduleId: "training-diagnostics",
    conceptId: "validation-gap",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Validation Gap`, "Validation Gap illustration"),
    assetPath: "/math-lab/concepts/generated/validation-gap.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Validation Gap."),
    caption: copy(zhCaption, "Use the image to build intuition for Validation Gap."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Validation Gap."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Validation Gap."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: two clean learning curves over training time, one continuing to improve and one flattening then drifting worse, with the growing gap between them shaded as a generalization warning
Scene/backdrop: clean ML diagnostics canvas
Subject: train curve, validation curve, shaded gap, subtle overfitting warning cue
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, curve panel centered, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact numeric axes, real dashboard screenshots, crowded labels`,
  }),
  illustration({
    key: "least-squares-fitting:least-squares-residual-objective",
    moduleId: "least-squares-fitting",
    conceptId: "least-squares-residual-objective",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Least Squares Residual Objective`, "Least Squares Residual Objective illustration"),
    assetPath: "/math-lab/concepts/generated/least-squares-residual-objective.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Least Squares Residual Objective."),
    caption: copy(zhCaption, "Use the image to build intuition for Least Squares Residual Objective."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Least Squares Residual Objective."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Least Squares Residual Objective."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: scattered data points around a fit line, with vertical residual segments and translucent square blocks beside them showing how residuals are squared and accumulated
Scene/backdrop: clean regression canvas without numeric axes
Subject: data points, fit line, residual segments, squared error blocks
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, regression plot centered, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense tick labels, real spreadsheet screenshots`,
  }),
  illustration({
    key: "least-squares-fitting:least-squares-normal-equations",
    moduleId: "least-squares-fitting",
    conceptId: "least-squares-normal-equations",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Normal Equations`, "Normal Equations illustration"),
    assetPath: "/math-lab/concepts/generated/least-squares-normal-equations.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Normal Equations."),
    caption: copy(zhCaption, "Use the image to build intuition for Normal Equations."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Normal Equations."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Normal Equations."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a column-space plane in 3D, an observation vector projecting onto the plane, and a residual arrow standing perpendicular to the plane
Scene/backdrop: clean linear algebra canvas with subtle depth
Subject: column space plane, observed vector, projection point, orthogonal residual arrow
Style/medium: polished vector-like educational illustration with gentle 3D depth, raster PNG
Composition/framing: 16:9, plane and vectors centered, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact equations, dense coordinate labels, photorealistic room scenes`,
  }),
  illustration({
    key: "least-squares-fitting:least-squares-svd-pseudoinverse",
    moduleId: "least-squares-fitting",
    conceptId: "least-squares-svd-pseudoinverse",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Least Squares SVD Pseudoinverse`, "Least Squares SVD Pseudoinverse illustration"),
    assetPath: "/math-lab/concepts/generated/least-squares-svd-pseudoinverse.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Least Squares SVD Pseudoinverse."),
    caption: copy(zhCaption, "Use the image to build intuition for Least Squares SVD Pseudoinverse."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Least Squares SVD Pseudoinverse."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Least Squares SVD Pseudoinverse."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a rectangular least-squares system passing through SVD singular-direction filters, weak directions softened, then recombining into a stable solution vector
Scene/backdrop: clean numerical linear algebra canvas
Subject: rectangular system block, singular direction channels, filtered weak channel, recombined solution
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, left-to-right filtered solve pipeline, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense numeric matrices, generic water filters, photorealistic machinery`,
  }),
  illustration({
    key: "svd:singular-value-decomposition",
    moduleId: "svd",
    conceptId: "singular-value-decomposition",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Singular Value Decomposition`, "Singular Value Decomposition illustration"),
    assetPath: "/math-lab/concepts/generated/singular-value-decomposition.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Singular Value Decomposition."),
    caption: copy(zhCaption, "Use the image to build intuition for Singular Value Decomposition."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Singular Value Decomposition."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Singular Value Decomposition."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: an input shape passing through three clean panels: rotate into special directions, stretch along orthogonal axes with different strengths, then rotate into the output orientation
Scene/backdrop: clean SVD courseware canvas
Subject: input shape, first rotation panel, diagonal stretch panel, final rotation panel, output shape
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, three-stage pipeline, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense matrix notation, generic abstract blocks, photorealistic machinery`,
  }),
  illustration({
    key: "svd:rank-from-singular-values",
    moduleId: "svd",
    conceptId: "rank-from-singular-values",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Rank from Singular Values`, "Rank from Singular Values illustration"),
    assetPath: "/math-lab/concepts/generated/rank-from-singular-values.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Rank from Singular Values."),
    caption: copy(zhCaption, "Use the image to build intuition for Rank from Singular Values."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Rank from Singular Values."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Rank from Singular Values."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a singular-value spectrum shown as energy bars, with bright active bars standing above a calm floor and near-zero bars fading into the floor to show lost directions
Scene/backdrop: clean spectral analysis canvas
Subject: singular value bars, active directions, near-zero directions, effective-rank cutoff glow
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, spectrum centered with direction icons, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact numeric bar labels, generic finance chart, decorative histogram wallpaper`,
  }),
  illustration({
    key: "svd:svd-pseudoinverse",
    moduleId: "svd",
    conceptId: "svd-pseudoinverse",
    status: "generated",
    title: copy(`${zhTitlePrefix}: SVD Pseudoinverse`, "SVD Pseudoinverse illustration"),
    assetPath: "/math-lab/concepts/generated/svd-pseudoinverse.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for SVD Pseudoinverse."),
    caption: copy(zhCaption, "Use the image to build intuition for SVD Pseudoinverse."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for SVD Pseudoinverse."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for SVD Pseudoinverse."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: singular-direction channels flowing backward through inverse-scaling gates, with strong channels passing cleanly and a near-zero weak channel shown as a guarded noisy amplifier
Scene/backdrop: clean numerical linear algebra canvas
Subject: singular direction channels, inverse scaling gates, weak near-zero channel guard, reconstructed input
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, backward-flow pipeline, readable at page-card size
Color palette: deep ink, cyan, amber, coral, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense equations, generic machine parts, noisy abstract background`,
  }),
  illustration({
    key: "svd:svd-low-rank",
    moduleId: "svd",
    conceptId: "svd-low-rank",
    status: "generated",
    title: copy(`${zhTitlePrefix}: SVD Low-Rank Approximation`, "SVD Low-Rank Approximation illustration"),
    assetPath: "/math-lab/concepts/generated/svd-low-rank.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for SVD Low-Rank Approximation."),
    caption: copy(zhCaption, "Use the image to build intuition for SVD Low-Rank Approximation."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for SVD Low-Rank Approximation."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for SVD Low-Rank Approximation."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: an image-like matrix reconstructed from the first few bright singular layers, with later low-energy detail layers fading into a residual mist
Scene/backdrop: clean matrix compression canvas
Subject: original matrix image, leading singular layers, reconstructed low-rank image, faint residual layer
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, decomposition-to-reconstruction flow, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: real copyrighted photos, dense labels, generic compression icons`,
  }),
  illustration({
    key: "pca:pca-centered-projection",
    moduleId: "pca",
    conceptId: "pca-centered-projection",
    status: "generated",
    title: copy(`${zhTitlePrefix}: PCA Centered Projection`, "PCA Centered Projection illustration"),
    assetPath: "/math-lab/concepts/generated/pca-centered-projection.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for PCA Centered Projection."),
    caption: copy(zhCaption, "Use the image to build intuition for PCA Centered Projection."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for PCA Centered Projection."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for PCA Centered Projection."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: an offset point cloud moving toward its mean center, then projecting onto a long principal axis that captures the widest spread
Scene/backdrop: clean dimensionality-reduction canvas
Subject: original shifted cloud, mean-centering arrow, centered cloud, principal projection axis
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, two-step centering and projection flow, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact numeric axes, generic scatterplot clutter, photorealistic scenes`,
  }),
  illustration({
    key: "pca:pca-covariance-diagonalization",
    moduleId: "pca",
    conceptId: "pca-covariance-diagonalization",
    status: "generated",
    title: copy(`${zhTitlePrefix}: PCA Covariance Diagonalization`, "PCA Covariance Diagonalization illustration"),
    assetPath: "/math-lab/concepts/generated/pca-covariance-diagonalization.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for PCA Covariance Diagonalization."),
    caption: copy(zhCaption, "Use the image to build intuition for PCA Covariance Diagonalization."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for PCA Covariance Diagonalization."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for PCA Covariance Diagonalization."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a tilted correlated point-cloud ellipse rotating into principal-component axes where the spread becomes aligned with two clean perpendicular directions
Scene/backdrop: clean PCA canvas with subtle before-and-after frames
Subject: correlated ellipse, rotation arrow, principal axes, axis-aligned variance spread
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, before-and-after rotation view, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: dense covariance matrix entries, generic scatterplot noise, decorative spirals`,
  }),
  illustration({
    key: "pca:pca-svd-explained-variance",
    moduleId: "pca",
    conceptId: "pca-svd-explained-variance",
    status: "generated",
    title: copy(`${zhTitlePrefix}: PCA SVD Explained Variance`, "PCA SVD Explained Variance illustration"),
    assetPath: "/math-lab/concepts/generated/pca-svd-explained-variance.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for PCA SVD Explained Variance."),
    caption: copy(zhCaption, "Use the image to build intuition for PCA SVD Explained Variance."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for PCA SVD Explained Variance."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for PCA SVD Explained Variance."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: descending principal-component energy bars feeding into a cumulative explained-variance band, showing that the first few components retain most of the signal
Scene/backdrop: clean PCA analysis canvas
Subject: singular-value energy bars, cumulative retention band, selected leading components, faded trailing components
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, energy spectrum centered, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: exact numeric chart labels, generic finance bars, dense text`,
  }),
  illustration({
    key: "deep-architecture-math:convolution-output-size",
    moduleId: "deep-architecture-math",
    conceptId: "convolution-output-size",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Convolution Output Size`, "Convolution Output Size illustration"),
    assetPath: "/math-lab/concepts/generated/convolution-output-size.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Convolution Output Size."),
    caption: copy(zhCaption, "Use the image to build intuition for Convolution Output Size."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Convolution Output Size."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Convolution Output Size."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a convolution kernel window sliding across a padded input image grid, with each valid landing position lighting up one cell in a smaller output feature map
Scene/backdrop: clean deep-learning architecture canvas
Subject: input grid, padding border, sliding kernel, stride steps, output feature map cells
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, input grid on left and output map on right, readable at page-card size
Color palette: deep ink, cyan, amber, mint, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: real photos, dense labels, generic neural network wallpaper`,
  }),
  illustration({
    key: "deep-architecture-math:scaled-dot-product-attention",
    moduleId: "deep-architecture-math",
    conceptId: "scaled-dot-product-attention",
    status: "generated",
    title: copy(`${zhTitlePrefix}: Scaled Dot-Product Attention`, "Scaled Dot-Product Attention illustration"),
    assetPath: "/math-lab/concepts/generated/scaled-dot-product-attention.png",
    alt: copy(zhAlt, "The illustration visualizes the key objects and relationships for Scaled Dot-Product Attention."),
    caption: copy(zhCaption, "Use the image to build intuition for Scaled Dot-Product Attention."),
    transcript: copy(zhTranscript, "The illustration visualizes the key objects and relationships for Scaled Dot-Product Attention."),
    learningPurpose: copy(zhPurpose, "Help learners build a visual intuition for Scaled Dot-Product Attention."),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: one query token comparing to several key tokens with different brightness links, a softmax-like weight ribbon, and value vectors blending into one output representation
Scene/backdrop: clean Transformer math canvas
Subject: query token, key tokens, weighted attention links, value vectors, blended output token
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, attention flow centered, readable at page-card size
Color palette: deep ink, cyan, amber, violet, white
Constraints: absolutely no text, no letters, no numbers, no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: generic robot brains, dense token text, brand-like icons`,
  }),
]

const conceptIllustrationMap = new Map(conceptIllustrations.map((item) => [item.key, item]))

export function conceptIllustrationFor(moduleId: MathLabModuleId, conceptId: string) {
  return conceptIllustrationMap.get(`${moduleId}:${conceptId}`)
}
