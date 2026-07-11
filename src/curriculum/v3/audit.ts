import { curriculumCatalog } from '../catalog.ts'
import type { CurriculumV3AuditEntry, CurriculumV3MigrationAction } from './types.ts'

const auditTargets: Record<string, string[]> = {
  'ai-overview': ['ai-overview'], 'python-notebook': ['python-notebook'],
  'housing-price-project': ['project-tabular-regression'], 'classification-project': ['project-classification-evaluation'],
  'model-selection': ['model-selection'], 'tree-forest': ['tree-forest'], 'cnn-visualization': ['cnn-visualization'],
  'sequence-embedding-bridge': ['sequence-embedding-bridge'],
  'attention-transformer': ['attention-qkv-multihead', 'transformer-blocks', 'small-transformer-training', 'decoding-sampling'],
  'optimizer-comparison': ['optimizer-comparison'],
  'llm-rag': ['llm-inference-context', 'peft-lora', 'retrieval-rag-systems', 'llm-evaluation-reliability'],
  'loss-functions': ['loss-functions'], 'gradient-descent': ['gradient-descent'], 'linear-regression': ['linear-regression'],
  'logistic-regression': ['logistic-regression'], classification: ['classification'], mlp: ['mlp'],
  'beginner-linear-algebra': ['beginner-linear-algebra'], 'linear-algebra-feature-space': ['linear-algebra-feature-space'],
  'linear-algebra-distance-similarity': ['linear-algebra-distance-similarity'],
  'linear-algebra-matrix-transformations': ['linear-algebra-matrix-transformations'],
  'linear-algebra-rank-null-space': ['linear-algebra-rank-null-space'], 'eigenvalues-eigenvectors': ['eigenvalues-eigenvectors'],
  svd: ['svd-pca-representation'], pca: ['svd-pca-representation'],
  'tensor-shapes-vectorization': ['tensor-shapes-vectorization'],
  'calculus-functions-rate-change': ['calculus-functions-rate-change'],
  'calculus-derivatives-local-change': ['calculus-derivatives-local-change'],
  'calculus-partial-derivatives-gradients': ['calculus-partial-derivatives-gradients'],
  'calculus-gradient-descent': ['gradient-descent'],
  'calculus-sgd-batch-noise': ['gradient-descent', 'optimizer-comparison'],
  'calculus-optimizer-comparison': ['optimizer-comparison'],
  'calculus-training-code-diagnostics': ['training-diagnostics'],
  'taylor-series': ['chain-rule-local-approximation'], 'matrix-calculus-autodiff': ['matrix-calculus-autodiff'],
  'beginner-probability-distributions': ['beginner-probability-distributions'], 'monte-carlo': ['monte-carlo'],
  'probability-likelihood-entropy': ['probability-likelihood-entropy'],
  'lu-decomposition': ['numerical-linear-algebra'], 'sparse-matrices': ['numerical-linear-algebra'],
  'condition-numbers': ['numerical-linear-algebra'], 'markov-chains': ['conditional-probability-markov'],
  'finite-difference-methods': ['numerical-differentiation-root-finding'],
  'nonlinear-equations': ['numerical-differentiation-root-finding'], optimization: ['gradient-descent'],
  'training-diagnostics': ['training-diagnostics'], 'least-squares-fitting': ['least-squares-fitting'],
  'deep-architecture-math': ['deep-architecture-math'], 'numerical-data': ['numerical-data'],
  'categorical-data': ['categorical-data'], 'dataset-quality': ['dataset-quality'],
  'splits-generalization': ['splits-generalization'], 'complexity-regularization': ['complexity-regularization'],
}

interface AuditEvidence {
  strengths: string[]
  contractGaps: string[]
}

const auditEvidence: Record<string, AuditEvidence> = {
  'ai-overview': {
    strengths: ['Uses house-price, spam, clustering, and RAG examples to distinguish learning types before tracing the complete training flow.'],
    contractGaps: ['Needs a learner-produced task-framing artifact that identifies inputs, targets, feedback, evaluation evidence, and a failure risk for one chosen AI use case.'],
  },
  'python-notebook': {
    strengths: ['Walks through NumPy shape checks, pandas tables, split/fit/predict/metric cells, and a reproducible notebook handoff.'],
    contractGaps: ['Needs an assessed rerun from a clean kernel with pinned dependencies, seeded output checks, and an intentionally broken shape or data-state diagnosis.'],
  },
  'housing-price-project': {
    strengths: ['Connects CSV inspection, EDA, leakage-safe cleaning and splits, a linear baseline, MAE, R², and a documented next iteration.'],
    contractGaps: ['Needs the V3 project deliverables to preserve a frozen config, controlled improvement against the baseline, residual plots, named failure examples, and limitations.'],
  },
  'classification-project': {
    strengths: ['Frames spam costs, vectorizes text, builds a LogisticRegression pipeline, varies score thresholds, compares precision/recall and ROC/AUC, and reviews errors.'],
    contractGaps: ['Needs cross-validated threshold selection, leakage tests for text preprocessing, calibration evidence, versioned false-positive/false-negative examples, and a limitations reflection.'],
  },
  'model-selection': {
    strengths: ['Connects one-split risk, validation roles, K-fold CV, pipeline leakage, param_grid and mean_test_score, then reserves final refit and test review.'],
    contractGaps: ['Needs an executable nested or locked-selection comparison that reports fold dispersion and demonstrates how repeated validation tuning biases the final claim.'],
  },
  'tree-forest': {
    strengths: ['Builds from 2D rectangular splits through Gini, entropy and MSE to max_depth overfitting, bagging, random features, and feature-importance pitfalls.'],
    contractGaps: ['Needs a scratch split calculation tied to code, train/validation depth curves, permutation-versus-impurity importance evidence, and a shortcut-feature failure case.'],
  },
  'cnn-visualization': {
    strengths: ['Makes local connectivity, weight sharing, kernel convolution, padding/stride output shapes, channel feature maps, pooling, and transfer learning visually computable.'],
    contractGaps: ['Needs a NumPy convolution checked against PyTorch, an assessed shape trace, learned-filter or activation inspection, and an aliasing or distribution-shift failure example.'],
  },
  'sequence-embedding-bridge': {
    strengths: ['Explicitly distinguishes token IDs from continuous features and traces embedding lookup from [B,T] to [B,T,H] with positions, masks, and attention handoff.'],
    contractGaps: ['Needs a small executable lookup-and-mask artifact plus a padding/position mistake whose tensor-level symptom learners must diagnose.'],
  },
  'attention-transformer': {
    strengths: ['Computes a four-token QKV attention matrix, softmax weighted sums, [B,T,H] to [B,heads,T,d_head] splits, and the residual Transformer block flow.'],
    contractGaps: ['Needs separate contracts for causal mask correctness, multi-head implementation, Transformer block invariants, small-model training evidence, and decoding/sampling failure analysis.'],
  },
  'optimizer-comparison': {
    strengths: ['Keeps one training loop fixed while comparing SGD noise, Momentum, RMSProp, Adam, weight decay, schedules, and curve-based diagnoses of speed and stability.'],
    contractGaps: ['Needs controlled seeds and budgets, matched hyperparameter rules, quantitative convergence/generalization comparisons, and an optimizer-specific divergence or instability case.'],
  },
  'llm-rag': {
    strengths: ['Separates RAG from training while covering token context, embedding similarity, chunk retrieval, prompt assembly, citation audit, and RAG evaluation.'],
    contractGaps: ['Needs distinct executable evidence for context limits, LoRA adaptation, retrieval quality, answer faithfulness, hallucination cases, and evaluation reliability.'],
  },
  'loss-functions': {
    strengths: ['Links MSE and MAE sensitivity plus classification cross-entropy to likelihood, negative log-likelihood, and the MLE interpretation of familiar losses.'],
    contractGaps: ['Needs code that verifies loss values and gradients on fixed examples, then contrasts outlier and overconfident-error behavior with learner explanations.'],
  },
  'gradient-descent': {
    strengths: ['Uses one interactive lab to connect a 3D loss surface, 2D contour map, negative-gradient updates, learning rate oscillation, saddle points, and batch noise.'],
    contractGaps: ['Needs a from-scratch update trace checked numerically, reproducible learning-rate sweeps, explicit convergence evidence, and a divergence diagnosis checkpoint.'],
  },
  'linear-regression': {
    strengths: ['Moves from fitting a line through residual loss and parameter motion to multivariate inputs, polynomial limits, overfitting, and regularization.'],
    contractGaps: ['Needs normal-equation and gradient solutions compared in code, residual diagnostics on held-out data, and a nonlinearity or collinearity failure case.'],
  },
  'logistic-regression': {
    strengths: ['Traces linear scores through sigmoid probabilities, threshold decisions and log loss, then examines regularization and the limits of a linear boundary.'],
    contractGaps: ['Needs a scratch gradient implementation matched to a library model, calibrated probability checks, and a nonlinearly separable failure example.'],
  },
  classification: {
    strengths: ['Lets learners change thresholds, prevalence, and error costs while confusion metrics, precision/recall, ROC/AUC, calibration bins, and the softmax simplex update together.'],
    contractGaps: ['Needs a held-out threshold decision with confidence intervals or fold variation, explicit cost justification, and saved misclassification evidence across subgroups.'],
  },
  mlp: {
    strengths: ['Connects affine neurons and activations to hidden representations, forward output, backpropagation, training dynamics, capacity, and generalization.'],
    contractGaps: ['Needs a NumPy forward/backward pass gradient-checked against finite differences, matched PyTorch training, hidden-layer probes, and saturation or overfit failures.'],
  },
  'beginner-linear-algebra': {
    strengths: ['Builds from feature cards and vectors through distance, span and a matrix-machine visual, then ends with an AI-path review and checkpoint.'],
    contractGaps: ['Needs executable vector and matrix calculations with shape assertions plus an assessment that distinguishes invalid distance and transformation interpretations.'],
  },
  'linear-algebra-feature-space': {
    strengths: ['Uses learner records, profiles and sentence embeddings to explain coordinate features, difference vectors, and high-dimensional shared spaces.'],
    contractGaps: ['Needs a code-built feature matrix with units and schema checks, followed by a counterexample showing incomparable or badly scaled coordinates.'],
  },
  'linear-algebra-distance-similarity': {
    strengths: ['Uses semantic search to compare norm distance, cosine ranking, and weighted combinations so position closeness is separated from directional similarity.'],
    contractGaps: ['Needs learners to reproduce rankings in code, test normalization and zero-vector edge cases, and justify metric choice from retrieval failures.'],
  },
  'linear-algebra-matrix-transformations': {
    strengths: ['Reads matrix columns and basis-grid motion before connecting affine feature mixing to neural-network layers and housing features.'],
    contractGaps: ['Needs elementwise and vectorized implementations with dimension checks plus a singular or ill-shaped transform failure learners must repair.'],
  },
  'linear-algebra-rank-null-space': {
    strengths: ['Uses recommendation blind spots, repeated features, column space and null space to explain what a matrix can express, ignore, or compress.'],
    contractGaps: ['Needs numerical rank experiments under tolerance, a computed null-space witness, and a feature-redundancy failure tied to model behavior.'],
  },
  'eigenvalues-eigenvectors': {
    strengths: ['Covers diagonalization, shifts, inverse and power iteration, Rayleigh quotients, orthogonal bases, failure cases, costs, and ML connections.'],
    contractGaps: ['Needs residual checks for computed eigenpairs, convergence traces for power iteration, and explicit repeated/dominant-eigenvalue failure diagnostics.'],
  },
  svd: {
    strengths: ['Derives the two singular-vector bases, reduced/full forms, pseudoinverse, condition links, and low-rank approximation with a worked lecture matrix.'],
    contractGaps: ['Needs reconstruction and approximation-error code linked to downstream PCA, with a rank-threshold sensitivity case and retained-variance decision checkpoint.'],
  },
  pca: {
    strengths: ['Centers data, forms covariance, compares eigendecomposition with the SVD route, projects components, reports explained variance, and names PCA failure modes.'],
    contractGaps: ['Needs one pipeline-safe PCA experiment fit only on training data, inverse-reconstruction evidence, and a scaling-sensitive component failure case.'],
  },
  'tensor-shapes-vectorization': {
    strengths: ['Treats tensor shapes as contracts across matmul, reductions, broadcasting, memory/performance, and systematic debugging.'],
    contractGaps: ['Needs executable shape assertions, vectorized-versus-loop equivalence and timing evidence, plus a silent broadcasting bug assessment.'],
  },
  'calculus-functions-rate-change': {
    strengths: ['Uses grocery and car cases to move from input-output functions and secant rates toward loss as a function.'],
    contractGaps: ['Needs learners to implement and plot a rate calculation, track units, and identify a nonlinear interval where average rate misrepresents local behavior.'],
  },
  'calculus-derivatives-local-change': {
    strengths: ['Shrinks a speedometer secant window to local change and uses derivative signs to reason near the current point.'],
    contractGaps: ['Needs symbolic, automatic and finite-difference derivatives compared numerically, including a nonsmooth-point or bad-step-size failure.'],
  },
  'calculus-partial-derivatives-gradients': {
    strengths: ['Uses one-parameter-at-a-time knobs before collecting partial derivatives into a multi-parameter gradient.'],
    contractGaps: ['Needs a multivariable gradient implemented and checked coordinate by coordinate, with a contour-direction prediction checkpoint.'],
  },
  'calculus-gradient-descent': {
    strengths: ['Explains the minus sign and learning-rate step length through a walk in a loss valley and a focused descent review.'],
    contractGaps: ['Must merge its intuition into the canonical gradient-descent experiment with update-code evidence and understep, oscillation, and divergence comparisons.'],
  },
  'calculus-sgd-batch-noise': {
    strengths: ['Contrasts full-batch and mini-batch gradient estimates and clarifies the relationship among samples, iterations, batches, and epochs.'],
    contractGaps: ['Needs seeded batch-size sweeps that quantify gradient variance and convergence, then connect the observed noise to optimizer choice.'],
  },
  'calculus-optimizer-comparison': {
    strengths: ['Organizes SGD, Momentum, RMSProp, and Adam by the optimization problem each method is intended to address.'],
    contractGaps: ['Needs to join the controlled optimizer benchmark with matched budgets, update-equation code, parameter trajectories, and failure-based selection criteria.'],
  },
  'calculus-training-code-diagnostics': {
    strengths: ['Maps gradient formulas onto training-loop order and backward semantics, then interprets training curves as diagnostic signals.'],
    contractGaps: ['Needs executable logging of loss, gradient norm and validation gap plus broken-loop cases such as missing zero_grad or incorrect update order.'],
  },
  'taylor-series': {
    strengths: ['Develops centered polynomial approximations, derivative terms and error bounds, then connects local approximation to ML with review questions.'],
    contractGaps: ['Should become optional depth inside local approximation, with numerical remainder plots and a radius-of-validity failure rather than a separate core stop.'],
  },
  'matrix-calculus-autodiff': {
    strengths: ['Connects local linearization, Jacobians, VJP/JVP operations, computation-graph backpropagation, gradient checking, and numerical stability.'],
    contractGaps: ['Needs a hand-derived graph matched to autograd tensor-by-tensor, with detach, accumulation, and finite-difference tolerance failures.'],
  },
  'beginner-probability-distributions': {
    strengths: ['Builds from sample spaces and random variables through distributions, conditional probability, Bayes, expectation/variance, AI outputs, loss, and a checkpoint.'],
    contractGaps: ['Needs reproducible simulation that compares empirical and theoretical probabilities plus assessment of independence, conditioning, and miscalibrated uncertainty.'],
  },
  'monte-carlo': {
    strengths: ['Uses seeded sampling, random variables, estimators, convergence error, code and a worked example to connect integrals with model expectations.'],
    contractGaps: ['Needs repeated-run uncertainty estimates, sample-size versus error plots, and a high-variance or biased-sampling failure learners must explain.'],
  },
  'probability-likelihood-entropy': {
    strengths: ['Treats model outputs as distributions and links likelihood, NLL/MLE, cross entropy, KL divergence, calibration, and AI behavior.'],
    contractGaps: ['Needs code-level probability normalization and CE/KL calculations, reliability plots, and an overconfident wrong-prediction failure case.'],
  },
  'lu-decomposition': {
    strengths: ['Goes from triangular substitution through LU and LUP algorithms, pivoting, a worked solve, review questions, and an ML connection.'],
    contractGaps: ['Must merge into numerical linear algebra with reconstruction/residual checks, repeated-right-hand-side cost evidence, and a no-pivot instability case.'],
  },
  'sparse-matrices': {
    strengths: ['Quantifies nnz costs and derives COO, CSR, and CSR matrix-vector multiplication before connecting sparse storage to ML.'],
    contractGaps: ['Must add dense-versus-sparse memory and runtime measurements, conversion correctness checks, and a sparsity-pattern case where the format loses its advantage.'],
  },
  'condition-numbers': {
    strengths: ['Uses numerical experiments and geometry to distinguish residual from solution error and explain amplification, conditioning, pivoting, and accuracy rules.'],
    contractGaps: ['Must merge into solver experiments that perturb inputs, compare predicted and observed error amplification, and diagnose a deceptively small residual.'],
  },
  'markov-chains': {
    strengths: ['Unifies graph matrices, weather transitions, stationary distributions, random walks, and PageRank with review questions and ML links.'],
    contractGaps: ['Should be retained as conditional-probability depth with a simulated transition chain and explicit non-ergodic or slow-mixing failure case.'],
  },
  'finite-difference-methods': {
    strengths: ['Compares derivative stencils, step-size error, gradient checking and Jacobian approximation, then connects them to ML implementations.'],
    contractGaps: ['Must merge with root finding through executable truncation-versus-roundoff sweeps and a gradient-check tolerance decision backed by error curves.'],
  },
  'nonlinear-equations': {
    strengths: ['Compares bisection, Newton and secant convergence before extending residual solving to systems through Jacobian linearization.'],
    contractGaps: ['Must merge into a shared solver lab with iteration traces, cost comparisons, stopping criteria, and derivative-zero or poor-initialization failures.'],
  },
  optimization: {
    strengths: ['Moves from local/global minima and one-dimensional tests through golden section and Newton to gradients, Hessians, steepest descent, and ML practice.'],
    contractGaps: ['Must merge its line-search and second-order depth into gradient descent with executable trajectories and nonconvex, indefinite-Hessian failure evidence.'],
  },
  'training-diagnostics': {
    strengths: ['Turns loss curves, validation gaps, gradient norms, interventions, and logs into an actionable training-state reading workflow.'],
    contractGaps: ['Needs one reproducible run per diagnosis, machine-readable logs, intervention-before/after comparisons, and a checkpoint requiring evidence-based next actions.'],
  },
  'least-squares-fitting': {
    strengths: ['Connects noisy data fitting to residual minimization, projection and normal equations, then compares interpolation, computational methods, and SVD solutions.'],
    contractGaps: ['Needs normal-equation, QR or SVD code comparisons with residual and conditioning evidence plus a rank-deficient fitting failure.'],
  },
  'deep-architecture-math': {
    strengths: ['Provides a compact mathematical reading of CNN local sharing, attention, multi-head shapes, residual normalization, and architectural composition.'],
    contractGaps: ['Should become optional architecture depth linked to dedicated CNN and Transformer labs, with tensor traces and a residual/normalization ablation rather than duplicate core coverage.'],
  },
  'numerical-data': {
    strengths: ['Builds an auditable numeric pipeline for semantic typing, outliers, binning and polynomial features, with scaling parameters fit on training data and saved column order.'],
    contractGaps: ['Needs an executable train/validation transform artifact with schema assertions and a leakage or unit-mismatch failure captured as assessment evidence.'],
  },
  'categorical-data': {
    strengths: ['Defines stable vocabularies, unknown handling, one-hot sparsity, high-cardinality risks and feature-cross dimensionality with pandas transfer examples.'],
    contractGaps: ['Needs a fitted vocabulary artifact tested on unseen categories, dimensionality metrics, and a rare-ID memorization failure evaluated on held-out data.'],
  },
  'dataset-quality': {
    strengths: ['Separates missing, bad, duplicate and outlier policies; audits label timing, leakage, imbalance, group coverage, and produces a data-quality report.'],
    contractGaps: ['Needs an executable data-quality decision record with assertions, before/after counts, group impact evidence, and a checkpoint that rejects an unsafe label or feature.'],
  },
  'splits-generalization': {
    strengths: ['Treats random, stratified and temporal splits as evaluation contracts and makes fit-on-train/transform-everywhere parameters explicit in a reproducible protocol.'],
    contractGaps: ['Needs code that proves set disjointness and parameter provenance, compares split strategies, and exposes entity or future-information leakage.'],
  },
  'complexity-regularization': {
    strengths: ['Links feature-width growth to train/validation curves, L2 weight budgets and early stopping, ending in a reviewable complexity-control report.'],
    contractGaps: ['Needs controlled feature and regularization sweeps with dimension, weight, and validation metrics plus an overfit intervention justified from curves.'],
  },
}

const splitIds = new Set(['attention-transformer', 'llm-rag'])
const keepIds = new Set([
  'numerical-data', 'categorical-data', 'dataset-quality', 'splits-generalization',
  'sequence-embedding-bridge',
])
const depthIds = new Set([
  'lu-decomposition', 'sparse-matrices', 'condition-numbers', 'finite-difference-methods',
  'nonlinear-equations', 'taylor-series', 'markov-chains', 'deep-architecture-math',
])
const targetUseCounts = Object.values(auditTargets).flat().reduce<Record<string, number>>((counts, id) => {
  counts[id] = (counts[id] ?? 0) + 1
  return counts
}, {})

function actionFor(currentId: string, targetIds: string[]): CurriculumV3AuditEntry['action'] {
  if (splitIds.has(currentId)) return 'split'
  if (keepIds.has(currentId)) return 'keep'
  if (targetIds.some((id) => targetUseCounts[id] > 1)) return 'merge'
  if (depthIds.has(currentId)) return 'demote-to-depth'
  return 'rebuild'
}

export const curriculumV3AuditEntries: CurriculumV3AuditEntry[] = curriculumCatalog.map((module) => {
  const targetModuleIds = auditTargets[module.id]
  if (!targetModuleIds) throw new Error(`Missing Curriculum V3 audit target for ${module.id}`)
  const evidence = auditEvidence[module.id]
  if (!evidence) throw new Error(`Missing Curriculum V3 audit evidence for ${module.id}`)
  const action = actionFor(module.id, targetModuleIds)
  const actionLabel: Record<Exclude<CurriculumV3MigrationAction, 'add'>, string> = {
    keep: '保留', rebuild: '重建', merge: '合并', split: '拆分',
    'demote-to-depth': '下沉为深度主题', 'retire-with-redirect': '重定向后退役',
  }
  return {
    currentModuleId: module.id,
    action,
    targetModuleIds,
    strengths: evidence.strengths,
    contractGaps: evidence.contractGaps,
    rationale: {
      'zh-CN': `${actionLabel[action]}现有“${module.title['zh-CN']}”内容，使其对齐 ${targetModuleIds.join('、')} 的证据闭环。`,
      en: `${action} the current ${module.title.en} material into the evidence loop defined by ${targetModuleIds.join(', ')}.`,
    },
  }
})

export const curriculumV3AuditByCurrentModuleId = new Map(
  curriculumV3AuditEntries.map((entry) => [entry.currentModuleId, entry]),
)
