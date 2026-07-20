import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { diagnosticQuestions, scoreDiagnostic } from '../src/modules/math-lab/data/diagnostic.ts'
import { beginnerFoundationModules } from '../src/modules/math-lab/data/beginnerFoundationModules.ts'
import {
  learningRoutes,
  linearAlgebraRouteModuleIds,
  nextModuleForRoute,
  routeProgressSummary,
} from '../src/modules/math-lab/data/learningRoutes.ts'
import {
  aiMathPathModuleIds,
  mathLearningPhases,
} from '../src/modules/math-lab/data/mathCourseOrder.ts'
import {
  checkpointReportForModule,
  linearAlgebraCheckpointReportPrompts,
  observationPrompts,
  observationPromptForModule,
} from '../src/modules/math-lab/data/checkpointReports.ts'
import { mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import { continueMathLabModuleId, resolveMathLabModuleId } from '../src/modules/math-lab/utils/continueRoute.ts'
import {
  buildCheckpointReportMarkdown,
  checkpointReportStorageKey,
  createDefaultCheckpointReport,
  isCheckpointReportComplete,
  loadCheckpointReport,
  saveCheckpointReport,
} from '../src/modules/math-lab/utils/checkpointReports.ts'
import {
  calibrationBins,
  convolutionOutputSize,
  evaluateAttention,
  evaluateAttentionMatrix,
  evaluateAttentionShape,
  evaluateAutodiffGraph,
  evaluateJacobianProducts,
  evaluateKLDirections,
  evaluateProbabilityLab,
  evaluateTensorShape,
  evaluateTrainingScenario,
  klDivergence,
  softmax,
} from '../src/modules/math-lab/utils/aiBridgeMath.ts'
import {
  angleBetween,
  columnSpaceKind2x2,
  cosineSimilarity,
  cosineSimilarityN,
  determinant2x2,
  dot,
  dotN,
  euclideanDistance,
  gradientDescentStep,
  infinityNorm,
  isInvertible2x2,
  l1Norm,
  l2NormN,
  matrixColumns2x2,
  matrixVectorMultiply,
  nullDirection2x2,
  norm,
  projection,
  rank2x2,
  vectorDifference,
} from '../src/modules/math-lab/utils/math.ts'
import {
  directionalDerivative2D,
  evaluatePartialDerivativePoint,
  quadraticGradient2D,
  quadraticLoss2D,
  sampleQuadraticSlice,
} from '../src/modules/math-lab/utils/calculus.ts'
import {
  evaluateBatchGradientNoise,
} from '../src/modules/math-lab/utils/stochasticGradients.ts'
import {
  evaluateEigenDirection,
} from '../src/modules/math-lab/utils/eigenDirections.ts'
import {
  matrixFromBasisVectors,
  evaluateMatrixTransform,
} from '../src/modules/math-lab/utils/linearTransforms.ts'
import {
  evaluateOptimizerRace,
} from '../src/modules/math-lab/utils/optimizers.ts'
import {
  evaluateBackpropBlockStory,
  evaluateConditionalBayes,
  evaluateDistributionBuilder,
  evaluateFeatureVectorStory,
  evaluateLocalChangeStory,
} from '../src/modules/math-lab/utils/beginnerFoundations.ts'
import {
  estimateIntegralXSquared,
  estimatePiMonteCarlo,
  findLcgPeriod,
  lcgConfigForKind,
  lcgSequence,
  monteCarloPiStandardError,
} from '../src/modules/math-lab/utils/monteCarlo.ts'
import { estimateLuReuseCost, evaluateLu2x2, evaluateLup2x2 } from '../src/modules/math-lab/utils/luDecomposition.ts'
import {
  conditionNumber2x2,
  evaluateConditioning,
  formatConditionAngleDegrees,
  makeColumnMatrix,
} from '../src/modules/math-lab/utils/conditionNumbers.ts'
import { evaluatePowerIteration } from '../src/modules/math-lab/utils/eigenPower.ts'
import {
  buildPageRankTransition,
  buildWeatherTransition,
  iterateMarkovChain,
  l1Distance,
  maxColumnSumError,
  stationaryDistributionPower,
} from '../src/modules/math-lab/utils/markovChains.ts'
import {
  evaluateFiniteDifference,
  evaluateLectureGradient,
  evaluateLectureJacobian,
  finiteDifferenceDerivative,
} from '../src/modules/math-lab/utils/finiteDifference.ts'
import {
  evaluateNewtonSystemStep,
  evaluateNonlinearRootFinding,
} from '../src/modules/math-lab/utils/nonlinearEquations.ts'
import {
  csrMatVec,
  denseToCoo,
  denseToCsr,
  estimateSparseStorage,
  sparseLectureMatrix,
} from '../src/modules/math-lab/utils/sparseMatrix.ts'
import { evaluateQuizAnswer, scoreQuiz } from '../src/modules/math-lab/utils/quiz.ts'
import {
  appendQuizAttempt,
  createDefaultProgress,
  loadMathLabProgress,
  markModuleComplete,
  markRouteModuleComplete,
  saveMathLabProgress,
  setDiagnosticResult,
  type StorageLike,
} from '../src/modules/math-lab/utils/progress.ts'
import { evaluateTaylorApproximation } from '../src/modules/math-lab/utils/taylorSeries.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'
import { withPublicBase } from '../src/utils/publicPath.ts'

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike & { dump: () => Record<string, string> } {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
    dump: () => Object.fromEntries(values),
  }
}

test('math lab vector utilities compute dot, norm, cosine, angle, and projection', () => {
  const a = { x: 3, y: 4 }
  const b = { x: 4, y: 0 }

  assert.equal(dot(a, b), 12)
  assert.equal(norm(a), 5)
  assert.equal(cosineSimilarity(a, b), 0.6)
  assert.equal(Math.round(angleBetween(a, b)), 53)
  assert.deepEqual(projection(a, b), { x: 3, y: 0 })
})

test('linear algebra vector metrics handle distance, norms, dot, cosine, and zero-vector fallback', () => {
  const studentA = [2, 5, 80]
  const studentB = [3, 4, 82]

  assert.deepEqual(vectorDifference(studentB, studentA), [1, -1, 2])
  assert.equal(Math.abs(euclideanDistance(studentA, studentB) - Math.sqrt(6)) < 1e-12, true)
  assert.equal(l1Norm([1, -1, 2]), 4)
  assert.equal(l2NormN([3, 4, 12]), 13)
  assert.equal(infinityNorm([1, -7, 4]), 7)
  assert.equal(dotN([1, 2, 3], [4, 5, 6]), 32)
  assert.equal(cosineSimilarityN([1, 0, 0], [10, 0, 0]), 1)
  assert.equal(cosineSimilarityN([0, 0, 0], [1, 2, 3]), 0)
  assert.deepEqual(vectorDifference([1, Number.NaN, 3], [1, 2]), [0, -2, 3])
  assert.equal(dotN([1, Number.POSITIVE_INFINITY, 3], [2, 5, 4]), 14)
  assert.equal(l1Norm([Number.NaN, Number.NEGATIVE_INFINITY, -2]), 2)
})

test('math lab matrix and gradient utilities expose the expected teaching behavior', () => {
  const matrix = [
    [2, 1],
    [3, 4],
  ] as const

  assert.deepEqual(matrixVectorMultiply(matrix, { x: 2, y: 1 }), { x: 5, y: 10 })
  assert.equal(determinant2x2(matrix), 5)
  assert.equal(isInvertible2x2(matrix), true)
  assert.deepEqual(gradientDescentStep({ x: 2, y: -1 }, { x: 4, y: -2 }, 0.1), {
    x: 1.6,
    y: -0.8,
  })
})

test('calculus utilities keep quadratic loss, partials, gradient, and direction derivative consistent', () => {
  const point = { x: 2, y: -1 }
  const direction = { x: 3, y: 4 }
  const loss = quadraticLoss2D(point)
  const gradient = quadraticGradient2D(point)
  const derivative = directionalDerivative2D(point, direction)
  const evaluation = evaluatePartialDerivativePoint({ ...point, direction })
  const xSlice = sampleQuadraticSlice({ point, axis: 'x', radius: 1, samples: 3 })

  assert.equal(Math.abs(loss - 2.76) < 1e-12, true)
  assert.equal(Math.abs(gradient.x - 2.56) < 1e-12, true)
  assert.equal(Math.abs(gradient.y + 0.4) < 1e-12, true)
  assert.equal(Math.abs(derivative - 1.216) < 1e-12, true)
  assert.deepEqual(evaluation.gradient, gradient)
  assert.equal(evaluation.partialX, gradient.x)
  assert.equal(evaluation.partialY, gradient.y)
  assert.equal(Math.abs(evaluation.directionalDerivative - derivative) < 1e-12, true)
  assert.deepEqual(xSlice.map((sample) => sample.x), [1, 2, 3])
  assert.deepEqual(xSlice.map((sample) => sample.y), [-1, -1, -1])
})

test('stochastic gradient utilities make mini-batch noise reproducible and full batch exact', () => {
  const noisy = evaluateBatchGradientNoise({
    datasetSize: 12,
    batchSize: 3,
    seed: 23,
    learningRate: 0.08,
    includeOutlier: true,
    shuffle: true,
    theta: { x: 0.4, y: -0.2 },
  })
  const replay = evaluateBatchGradientNoise({
    datasetSize: 12,
    batchSize: 3,
    seed: 23,
    learningRate: 0.08,
    includeOutlier: true,
    shuffle: true,
    theta: { x: 0.4, y: -0.2 },
  })
  const full = evaluateBatchGradientNoise({
    datasetSize: 12,
    batchSize: 12,
    seed: 23,
    learningRate: 0.08,
    includeOutlier: true,
    shuffle: true,
    theta: { x: 0.4, y: -0.2 },
  })

  assert.deepEqual(noisy.batchIndices, replay.batchIndices)
  assert.deepEqual(noisy.batchGradient, replay.batchGradient)
  assert.equal(noisy.gradientError > 0, true)
  assert.equal(noisy.path.length, 9)
  assert.equal(Math.abs(full.batchGradient.x - full.fullGradient.x) < 1e-12, true)
  assert.equal(Math.abs(full.batchGradient.y - full.fullGradient.y) < 1e-12, true)
  assert.equal(full.gradientError < 1e-12, true)
  assert.equal(full.gradientAngle, 0)
})

test('linear algebra matrix helpers expose column combinations, rank, and null directions', () => {
  const fullRank = [
    [1, 0],
    [0, 1],
  ] as const
  const rankOne = [
    [2, 4],
    [1, 2],
  ] as const
  const zero = [
    [0, 0],
    [0, 0],
  ] as const

  assert.deepEqual(matrixColumns2x2(rankOne), [{ x: 2, y: 1 }, { x: 4, y: 2 }])
  assert.equal(rank2x2(fullRank), 2)
  assert.equal(rank2x2(rankOne), 1)
  assert.equal(rank2x2(zero), 0)
  assert.equal(columnSpaceKind2x2(fullRank), 'plane')
  assert.equal(columnSpaceKind2x2(rankOne), 'line')
  assert.equal(columnSpaceKind2x2(zero), 'point')

  const nullDirection = nullDirection2x2(rankOne)
  assert.ok(nullDirection)
  const collapsed = matrixVectorMultiply(rankOne, nullDirection!)
  assert.equal(Math.abs(collapsed.x) < 1e-8, true)
  assert.equal(Math.abs(collapsed.y) < 1e-8, true)
  assert.equal(nullDirection2x2(fullRank), null)
})

test('linear transform utilities evaluate draggable basis vectors as matrix columns', () => {
  const matrix = matrixFromBasisVectors({ x: 2, y: 1 }, { x: -0.5, y: 3 })
  const evaluation = evaluateMatrixTransform({
    basisI: { x: 2, y: 1 },
    basisJ: { x: -0.5, y: 3 },
    probe: { x: 1.5, y: -0.5 },
  })
  const collapsed = evaluateMatrixTransform({
    basisI: { x: 2, y: 1 },
    basisJ: { x: 4, y: 2 },
  })

  assert.deepEqual(matrix, [[2, -0.5], [1, 3]])
  assert.deepEqual(evaluation.matrix, matrix)
  assert.equal(evaluation.rank, 2)
  assert.equal(evaluation.orientation, 'preserved')
  assert.equal(evaluation.invertible, true)
  assert.equal(Math.abs(evaluation.determinant - 6.5) < 1e-12, true)
  assert.equal(evaluation.areaScale, 6.5)
  assert.deepEqual(evaluation.transformedProbe, { x: 3.25, y: 0 })
  assert.equal(collapsed.rank, 1)
  assert.equal(collapsed.orientation, 'collapsed')
  assert.equal(collapsed.invertible, false)
  assert.equal(collapsed.areaScale, 0)
})

test('optimizer race utilities expose deterministic paths and optimizer state', () => {
  const race = evaluateOptimizerRace({
    preset: 'narrow-ravine',
    start: { x: 2.4, y: -1.6 },
    learningRate: 0.08,
    steps: 12,
    momentumBeta: 0.85,
    beta2: 0.95,
    epsilon: 1e-8,
  })

  assert.deepEqual(race.optimizerOrder, ['sgd', 'momentum', 'rmsprop', 'adam'])
  assert.equal(race.runs.sgd.path.length, 13)
  assert.equal(race.runs.momentum.path.length, 13)
  assert.equal(race.runs.rmsprop.path.length, 13)
  assert.equal(race.runs.adam.path.length, 13)
  assert.equal(race.runs.sgd.losses[0], race.runs.adam.losses[0])
  assert.equal(Number.isFinite(race.runs.sgd.finalLoss), true)
  assert.equal(Number.isFinite(race.runs.adam.finalLoss), true)
  assert.equal(race.runs.momentum.state.velocity.x !== 0 || race.runs.momentum.state.velocity.y !== 0, true)
  assert.equal(race.runs.rmsprop.state.squareAverage.x > 0, true)
  assert.equal(race.runs.adam.state.firstMoment.x !== 0 || race.runs.adam.state.firstMoment.y !== 0, true)
  assert.equal(race.runs.adam.state.secondMoment.x > 0, true)
  assert.equal(race.runs.adam.state.biasCorrection.t, 12)
  assert.equal(Math.min(...race.optimizerOrder.map((key) => race.runs[key].finalLoss)) <= race.runs.sgd.finalLoss, true)
})

test('eigen direction utilities connect alignment, Rayleigh quotient, and power iteration residuals', () => {
  const starting = evaluateEigenDirection({
    matrixKind: 'well-separated',
    vector: { x: 1, y: 0 },
    iterations: 0,
  })
  const iterated = evaluateEigenDirection({
    matrixKind: 'well-separated',
    vector: { x: 1, y: 0 },
    iterations: 8,
  })

  assert.equal(Math.abs(norm(iterated.normalizedVector) - 1) < 1e-12, true)
  assert.equal(Number.isFinite(iterated.rayleighQuotient), true)
  assert.equal(iterated.residualNorm >= 0, true)
  assert.equal(iterated.powerPath.length, 9)
  assert.equal(Number.isFinite(iterated.angleToImage), true)
  assert.equal(typeof iterated.nearEigenDirection, 'boolean')
  assert.equal(iterated.residualNorm < starting.residualNorm, true)
  assert.equal(iterated.angleToImage < starting.angleToImage, true)
})

test('AI bridge math utilities validate shapes, autodiff, probability, diagnostics, and architecture formulas', () => {
  const shape = evaluateTensorShape({ batchSize: 8, inputDim: 6, hiddenDim: 4, biasDim: 4 })
  assert.deepEqual(shape.inputShape, [8, 6])
  assert.deepEqual(shape.outputShape, [8, 4])
  assert.equal(shape.biasCompatible, true)
  assert.equal(shape.parameterCount, 28)
  assert.equal(evaluateTensorShape({ batchSize: 8, inputDim: 6, hiddenDim: 4, biasDim: 5 }).biasCompatible, false)

  const autodiff = evaluateAutodiffGraph({ w: 1.4, x: 2, b: -0.5, y: 1.2 })
  assert.equal(Math.abs(autodiff.gradients.w - autodiff.finiteDifferenceW) < 1e-8, true)
  assert.equal(autodiff.gradientCheckError < 1e-8, true)
  const jacobianProducts = evaluateJacobianProducts({
    x: 2,
    y: 3,
    upstream: [5, 7],
    tangent: [0.5, -1],
  })
  assert.deepEqual(jacobianProducts.jacobian, [[4, 1], [3, 2]])
  assert.deepEqual(jacobianProducts.vjp, [41, 19])
  assert.deepEqual(jacobianProducts.jvp, [1, -0.5])

  const probabilities = softmax([1.5, 0.3, -0.8])
  assert.equal(Math.abs(probabilities.reduce((sum, value) => sum + value, 0) - 1) < 1e-12, true)
  const probabilityLab = evaluateProbabilityLab({ logits: [1.5, 0.3, -0.8], temperature: 1, targetIndex: 0 })
  assert.equal(probabilityLab.crossEntropy > 0, true)
  assert.equal(probabilityLab.klFromUniform > 0, true)
  assert.equal(klDivergence([0.8, 0.2], [0.5, 0.5]) > 0, true)
  const klDirections = evaluateKLDirections([0.8, 0.2], [0.5, 0.5])
  assert.equal(klDirections.asymmetry > 0, true)
  const bins = calibrationBins([
    { confidence: 0.2, correct: false },
    { confidence: 0.8, correct: true },
    { confidence: 0.9, correct: false },
  ], 2)
  assert.equal(bins.length, 2)
  assert.equal(bins[1]!.count, 2)
  assert.equal(bins[1]!.gap > 0, true)

  const healthy = evaluateTrainingScenario('healthy', 20)
  const overfitting = evaluateTrainingScenario('overfitting', 20)
  assert.equal(healthy.last.trainLoss < healthy.first.trainLoss, true)
  assert.equal(overfitting.last.valLoss > overfitting.bestVal.valLoss, true)

  assert.equal(convolutionOutputSize(32, 3, 1, 1), 32)
  const attention = evaluateAttention([1, 0], [[1, 0], [0, 1]])
  assert.equal(attention.weights[0] > attention.weights[1], true)
  const attentionMatrix = evaluateAttentionMatrix([[1, 0], [0, 1]])
  assert.equal(attentionMatrix.length, 2)
  assert.equal(attentionMatrix[0]![0] > attentionMatrix[0]![1], true)
  const attentionShape = evaluateAttentionShape({ batchSize: 2, tokens: 4, hiddenDim: 12, heads: 3 })
  assert.equal(attentionShape.valid, true)
  assert.deepEqual(attentionShape.splitShape, [2, 3, 4, 4])
  assert.equal(evaluateAttentionShape({ batchSize: 2, tokens: 4, hiddenDim: 10, heads: 3 }).valid, false)
})

test('math lab modules include the zero-base AI math path with the linear algebra route split', () => {
  assert.equal(mathLabModules.length, 33)
  assert.deepEqual(
    mathLabModules.map((moduleDefinition) => moduleDefinition.order),
    Array.from({ length: 33 }, (_, index) => index + 1),
  )
  assert.deepEqual(
    mathLabModules.map((moduleDefinition) => moduleDefinition.id),
    [
      'beginner-linear-algebra',
      'linear-algebra-feature-space',
      'linear-algebra-distance-similarity',
      'linear-algebra-matrix-transformations',
      'linear-algebra-rank-null-space',
      'eigenvalues-eigenvectors',
      'svd',
      'tensor-shapes-vectorization',
      'calculus-functions-rate-change',
      'calculus-derivatives-local-change',
      'calculus-partial-derivatives-gradients',
      'calculus-gradient-descent',
      'calculus-sgd-batch-noise',
      'calculus-optimizer-comparison',
      'calculus-training-code-diagnostics',
      'taylor-series',
      'matrix-calculus-autodiff',
      'beginner-probability-distributions',
      'monte-carlo',
      'probability-likelihood-entropy',
      'markov-chains',
      'least-squares-fitting',
      'lu-decomposition',
      'condition-numbers',
      'sparse-matrices',
      'pca',
      'finite-difference-methods',
      'nonlinear-equations',
      'optimization',
      'training-diagnostics',
      'deep-architecture-math',
      'numpy-mathematics-implementation',
      'math-to-code-guided-studio',
    ],
  )
  for (const moduleDefinition of mathLabModules) {
    assert.equal(typeof moduleDefinition.title['zh-CN'], 'string', `${moduleDefinition.id} needs a Chinese title`)
    assert.equal(moduleDefinition.title['zh-CN'].trim().length > 0, true, `${moduleDefinition.id} needs a Chinese title`)
    assert.equal(typeof moduleDefinition.title.en, 'string', `${moduleDefinition.id} needs an English title`)
    assert.equal(moduleDefinition.title.en.trim().length > 0, true, `${moduleDefinition.id} needs an English title`)
  }

  for (const moduleDefinition of mathLabModules) {
    assert.equal('attribution' in moduleDefinition, false, `${moduleDefinition.id} should not expose migrated attribution`)
    assert.equal(moduleDefinition.sections.length >= 3, true, `${moduleDefinition.id} needs complete lesson sections`)
    assert.equal(moduleDefinition.toc.length > 0, true, `${moduleDefinition.id} needs toc entries`)
    const deliberatelyStaticPilotIds = new Set(['linear-algebra-feature-space', 'calculus-derivatives-local-change', 'numpy-mathematics-implementation'])
    assert.equal(moduleDefinition.labs.length >= 1 || deliberatelyStaticPilotIds.has(moduleDefinition.id), true, `${moduleDefinition.id} needs a matching lab or an explicit static pilot contract`)
    assert.equal(moduleDefinition.sourceNoteFile?.endsWith('.md'), true, `${moduleDefinition.id} should track source filename internally`)

    const englishBody = moduleDefinition.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')
    assert.equal(englishBody.length > 900, true, `${moduleDefinition.id} should include complete instructional body`)
    if (moduleDefinition.id === 'tensor-shapes-vectorization') {
      assert.match(englishBody, /Beginner bridge|Broadcasting and Vectorization|shape/i)
    } else if (moduleDefinition.id === 'matrix-calculus-autodiff') {
      assert.match(englishBody, /chain rule|Computation Graph and Backpropagation|local linearization/i)
    } else if (moduleDefinition.id === 'probability-likelihood-entropy') {
      assert.match(englishBody, /distribution-first bridge|softmax|cross entropy/i)
    } else if (moduleDefinition.id === 'beginner-linear-algebra') {
      assert.match(englishBody, /data becomes a vector|matrix as a space machine/i)
    } else if (moduleDefinition.id === 'calculus-functions-rate-change') {
      assert.match(englishBody, /average rate of change|function|input-output/i)
    } else if (moduleDefinition.id === 'calculus-derivatives-local-change') {
      assert.match(englishBody, /derivative|central difference|local slope/i)
    } else if (moduleDefinition.id === 'linear-algebra-feature-space') {
      assert.match(englishBody, /unit-bearing linear functional|dimensionless geometry/i)
    } else if (moduleDefinition.id === 'linear-algebra-matrix-transformations') {
      assert.match(englishBody, /shape ledger|broadcasting|batch/i)
    } else if (moduleDefinition.id === 'numpy-mathematics-implementation') {
      assert.match(englishBody, /np\.asarray|broadcasting|MSE/i)
    } else if (moduleDefinition.id === 'math-to-code-guided-studio') {
      assert.match(englishBody, /Stage goal|numerical sensitivity|Probability Preview/i)
    } else if (moduleDefinition.id === 'calculus-partial-derivatives-gradients') {
      assert.match(englishBody, /partial derivative|gradient|parameter/i)
    } else if (moduleDefinition.id === 'calculus-gradient-descent') {
      assert.match(englishBody, /negative gradient|learning rate|oscillation/i)
    } else if (moduleDefinition.id === 'calculus-sgd-batch-noise') {
      assert.match(englishBody, /mini-batch|SGD|epoch/i)
    } else if (moduleDefinition.id === 'calculus-optimizer-comparison') {
      assert.match(englishBody, /Momentum|RMSProp|Adam/)
    } else if (moduleDefinition.id === 'calculus-training-code-diagnostics') {
      assert.match(englishBody, /loss\.backward|optimizer\.step|gradient norm/)
    } else if (moduleDefinition.id === 'beginner-probability-distributions') {
      assert.match(englishBody, /sample space|random variable|normal distribution|Bayes update|calibration/i)
    } else if (moduleDefinition.id === 'training-diagnostics') {
      assert.match(englishBody, /gradient norm|validation loss/i)
    } else if (moduleDefinition.id === 'deep-architecture-math') {
      assert.match(englishBody, /Attention|Transformer|Residual/)
    } else if (moduleDefinition.id === 'taylor-series') {
      assert.match(englishBody, /Learning Objectives|Taylor Series Expansion|Taylor Series Error/)
    } else if (moduleDefinition.id === 'monte-carlo') {
      assert.match(englishBody, /Where Reproducible Randomness Comes From|Writing Areas and Integrals as Sample Averages/)
    } else if (moduleDefinition.id === 'vectors-matrices-norms') {
      assert.match(englishBody, /Vectors: Coordinates, Linear Combinations, and Span|Dot Product: Reading Angle as Similarity/)
    } else if (moduleDefinition.id === 'lu-decomposition') {
      assert.match(englishBody, /Basic Idea: The .Undo. button for Linear Operations|Back Substitution Algorithm for Upper Triangular Systems/)
    } else {
      assert.match(englishBody, /Learning Objectives|Learning objectives|Dense Matrices/)
    }
    const aiBridgeIds = new Set([
      'tensor-shapes-vectorization',
      'matrix-calculus-autodiff',
      'probability-likelihood-entropy',
      'training-diagnostics',
      'deep-architecture-math',
    ])
    if (moduleDefinition.id === 'linear-algebra-feature-space') {
      assert.doesNotMatch(englishBody, /Three-Layer Practice/)
      assert.match(englishBody, /Shared Case: Three Learning Profiles|Hand the Same Profiles to Similarity/)
    } else if (moduleDefinition.id === 'linear-algebra-matrix-transformations') {
      assert.doesNotMatch(englishBody, /Three-Layer Practice/)
      assert.match(englishBody, /Three Profile Rows Produce Three Scores|Matrices Transform Batches/)
    } else if (moduleDefinition.id === 'calculus-functions-rate-change') {
      assert.doesNotMatch(englishBody, /Three-Layer Practice/)
      assert.match(englishBody, /controlled experiment|Summary and Handoff/i)
    } else if (moduleDefinition.id === 'calculus-derivatives-local-change') {
      assert.doesNotMatch(englishBody, /Three-Layer Practice/)
      assert.match(englishBody, /Use a Derivative to Estimate a Small Change|Summary and Handoff/i)
    } else if (moduleDefinition.id === 'beginner-linear-algebra') {
      assert.match(englishBody, /Shape Ledger|Batch Prediction|Summary/i)
    } else if (moduleDefinition.id === 'beginner-probability-distributions') {
      assert.match(englishBody, /Empirical Frequency|Summary and the Route Ahead/i)
    } else if (![
      'least-squares-fitting',
      'eigenvalues-eigenvectors',
      'svd',
      'pca',
      'numpy-mathematics-implementation',
      'math-to-code-guided-studio',
    ].includes(moduleDefinition.id) && !aiBridgeIds.has(moduleDefinition.id)) {
      assert.match(englishBody, /Review Questions/)
    }
    assert.doesNotMatch(englishBody, /CS\s*357|Course Staff|changelog|site\.baseurl/)
  }

  for (let index = 0; index < 30; index += 1) {
    assert.deepEqual(mathLabModules[index].nextModuleIds, [mathLabModules[index + 1].id])
  }
  assert.deepEqual(mathLabModules[30]?.nextModuleIds, [])
  assert.deepEqual(mathLabModules[31]?.nextModuleIds, ['math-to-code-guided-studio'])
  assert.deepEqual(mathLabModules[32]?.nextModuleIds, [])
})

test('primary math path prerequisites do not point at retired calculus bridge', () => {
  const retiredPrimaryIds = new Set(['beginner-calculus'])
  const byId = Object.fromEntries(mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))

  for (const moduleDefinition of mathLabModules) {
    for (const prerequisite of moduleDefinition.prerequisites) {
      assert.equal(
        retiredPrimaryIds.has(prerequisite),
        false,
        `${moduleDefinition.id} should not depend on retired prerequisite ${prerequisite}`,
      )
    }
  }

  assert.deepEqual(byId['beginner-probability-distributions']!.prerequisites, ['calculus-training-code-diagnostics'])
})

test('math lab continue route redirects retired calculus progress to the new route start', () => {
  assert.equal(resolveMathLabModuleId('beginner-calculus'), 'calculus-functions-rate-change')
  assert.equal(resolveMathLabModuleId('not-a-real-module'), undefined)

  assert.equal(
    continueMathLabModuleId({
      lastVisitedModuleId: 'beginner-calculus',
      diagnosticResult: undefined,
    }),
    'calculus-functions-rate-change',
  )
  assert.equal(
    continueMathLabModuleId({
      lastVisitedModuleId: undefined,
      diagnosticResult: {
        linearAlgebra: 1,
        calculus: 0,
        probability: 1,
        optimization: 1,
        recommendedStartModuleId: 'beginner-calculus',
        weakConcepts: ['derivative'],
      },
    }),
    'calculus-functions-rate-change',
  )
  assert.equal(
    continueMathLabModuleId({
      lastVisitedModuleId: 'missing-module',
      diagnosticResult: undefined,
    }),
    mathLabModules[0]!.id,
  )
})

test('linear algebra route split exposes eight case-driven chapters', () => {
  const routeIds = [
    'linear-algebra-feature-space',
    'linear-algebra-distance-similarity',
    'linear-algebra-matrix-transformations',
    'linear-algebra-rank-null-space',
    'least-squares-fitting',
    'eigenvalues-eigenvectors',
    'svd',
    'pca',
  ]
  const byId = Object.fromEntries(mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))

  assert.deepEqual(routeIds, linearAlgebraRouteModuleIds)

  for (const id of routeIds) {
    const moduleDefinition = byId[id]
    assert.ok(moduleDefinition, `${id} should be registered`)
    assert.ok(moduleDefinition.title['zh-CN'])
    assert.ok(moduleDefinition.title.en)
    assert.ok(moduleDefinition.subtitle['zh-CN'])
    assert.ok(moduleDefinition.subtitle.en)
    assert.ok(moduleDefinition.learningObjectives.length >= 3, `${id} should define learning objectives`)
    assert.ok(moduleDefinition.concepts.length >= 1, `${id} should define concepts`)
    assert.ok(moduleDefinition.sections.length >= 4, `${id} should define case-driven sections`)
    assert.ok(moduleDefinition.labs.length >= 1 || id === 'linear-algebra-feature-space', `${id} should expose one matching lab or the static vector pilot`)
    assert.ok(moduleDefinition.quizzes.length >= 2, `${id} should include checkpoint questions`)
    assert.ok(moduleDefinition.misconceptions.length >= 2, `${id} should include misconception feedback`)
    assert.ok(moduleDefinition.sourceReferences?.length, `${id} should have source references`)
  }

  assert.match(
    byId['linear-algebra-distance-similarity']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /语义搜索|embedding|检索/,
  )
  assert.match(
    byId['linear-algebra-matrix-transformations']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /Xw\+b|批量|广播/,
  )
  assert.match(
    byId['linear-algebra-rank-null-space']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /推荐系统|盲区|重复特征/,
  )

  assert.deepEqual(byId['least-squares-fitting']!.prerequisites, [
    'linear-algebra-feature-space',
    'linear-algebra-matrix-transformations',
  ])
  assert.deepEqual(byId['eigenvalues-eigenvectors']!.prerequisites, ['linear-algebra-rank-null-space'])
  assert.deepEqual(byId.svd!.prerequisites, [
    'least-squares-fitting',
    'eigenvalues-eigenvectors',
    'linear-algebra-rank-null-space',
  ])
  assert.equal(byId.svd!.prerequisites.includes('condition-numbers'), false)
  assert.deepEqual(byId.pca!.prerequisites, [
    'svd',
    'least-squares-fitting',
    'eigenvalues-eigenvectors',
    'linear-algebra-rank-null-space',
  ])
  assert.equal(byId.pca!.prerequisites.includes('vectors-matrices-norms'), false)
  assert.ok(byId['eigenvalues-eigenvectors']!.sourceReferences?.length)
  assert.ok(byId.svd!.sourceReferences?.length)
  assert.ok(byId.pca!.sourceReferences?.length)

  const root = new URL('../', import.meta.url)
  const modulesSource = readFileSync(new URL('src/modules/math-lab/data/modules.ts', root), 'utf8')
  assert.doesNotMatch(modulesSource, /withLinearAlgebraRouteReferences|linearAlgebraRouteReferenceIds/)

  for (const sourcePath of [
    'src/modules/math-lab/data/eigenvaluesModule.ts',
    'src/modules/math-lab/data/svdModule.ts',
    'src/modules/math-lab/data/pcaModule.ts',
  ]) {
    const source = readFileSync(new URL(sourcePath, root), 'utf8')
    assert.match(source, /sourceReferences:\s*\[/, `${sourcePath} should own source references`)
  }
})

test('five math learning phases are the single source for the main path order', () => {
  assert.equal(mathLearningPhases.length, 5)
  assert.deepEqual(
    mathLearningPhases.map((phase) => phase.id),
    [
      'representation-geometry',
      'change-training',
      'uncertainty-probability',
      'data-geometry-numerics',
      'deep-architecture',
    ],
  )

  const flattenedIds = mathLearningPhases.flatMap((phase) => phase.moduleIds)
  assert.deepEqual(flattenedIds, aiMathPathModuleIds)
  assert.equal(new Set(flattenedIds).size, flattenedIds.length)
  assert.deepEqual(
    mathLabModules.slice(0, aiMathPathModuleIds.length).map((moduleDefinition) => moduleDefinition.id),
    aiMathPathModuleIds,
  )

  const mainRoute = learningRoutes.find((candidate) => candidate.id === 'ai-math-main-path')
  assert.ok(mainRoute)
  assert.deepEqual(mainRoute.chapterModuleIds, aiMathPathModuleIds)
  assert.equal(aiMathPathModuleIds.at(-1), 'deep-architecture-math')
  assert.ok(aiMathPathModuleIds.indexOf('tensor-shapes-vectorization') < aiMathPathModuleIds.indexOf('calculus-functions-rate-change'))
  assert.ok(aiMathPathModuleIds.indexOf('least-squares-fitting') < aiMathPathModuleIds.indexOf('pca'))
})

test('calculus route exposes seven ordered beginner chapters from change to training code', () => {
  const routeIds = [
    'calculus-functions-rate-change',
    'calculus-derivatives-local-change',
    'calculus-partial-derivatives-gradients',
    'calculus-gradient-descent',
    'calculus-sgd-batch-noise',
    'calculus-optimizer-comparison',
    'calculus-training-code-diagnostics',
  ]
  const byId = Object.fromEntries(mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))
  const expectedPrimaryLabs: Record<string, string> = {
    'calculus-functions-rate-change': 'PredictionMappingLab',
    'calculus-partial-derivatives-gradients': 'PartialDerivativeContourLab',
    'calculus-gradient-descent': 'MathGradientLab',
    'calculus-sgd-batch-noise': 'BatchGradientNoiseLab',
    'calculus-optimizer-comparison': 'OptimizerRaceLab',
    'calculus-training-code-diagnostics': 'TrainingDiagnosticsLab',
  }
  const expectedSupportLabs: Record<string, string[]> = {
    'calculus-training-code-diagnostics': ['BackpropBlockLab'],
  }
  const expectedTaskLabs = new Set([
    'calculus-partial-derivatives-gradients',
    'calculus-sgd-batch-noise',
    'calculus-optimizer-comparison',
  ])

  const requiredChineseAnchors: Record<string, string[]> = {
    'calculus-functions-rate-change': ['输入', '参数', '控制变量实验'],
    'calculus-derivatives-local-change': ['中央差分', '局部', '不等于梯度下降'],
    'calculus-partial-derivatives-gradients': ['旋钮', '偏导数', '梯度指向'],
    'calculus-gradient-descent': ['负梯度', '学习率', '震荡'],
    'calculus-sgd-batch-noise': ['batch size', 'iteration', 'epoch'],
    'calculus-optimizer-comparison': ['Momentum', 'RMSProp', 'Adam'],
    'calculus-training-code-diagnostics': ['zero_grad', 'loss.backward', 'optimizer.step'],
  }

  for (const id of routeIds) {
    const moduleDefinition = byId[id]
    assert.ok(moduleDefinition, `${id} should be registered`)
    assert.equal(moduleDefinition.difficulty, 'foundation')
    assert.equal(moduleDefinition.enhancementTier, id === 'calculus-derivatives-local-change' ? 'core' : 'interactive')
    assert.ok(moduleDefinition.title['zh-CN'])
    assert.ok(moduleDefinition.title.en)
    assert.ok(moduleDefinition.subtitle['zh-CN'])
    assert.ok(moduleDefinition.subtitle.en)
    assert.ok(moduleDefinition.learningObjectives.length >= 3, `${id} should define learning objectives`)
    assert.ok(moduleDefinition.concepts.length >= 1, `${id} should define concepts`)
    assert.ok(moduleDefinition.sections.length >= 4, `${id} should define route sections`)
    assert.ok(moduleDefinition.labs.length >= 1 || id === 'calculus-derivatives-local-change', `${id} should expose one matching lab or the static derivative pilot`)
    assert.ok(moduleDefinition.quizzes.length >= 2, `${id} should include checkpoint questions`)
    assert.ok(moduleDefinition.misconceptions.length >= 2, `${id} should include misconception feedback`)
    assert.equal(moduleDefinition.sourceNoteFile, 'math-lab-calculus-route-sources.md')
    assert.ok(moduleDefinition.sourceReferences?.length, `${id} should have source references`)
    if (expectedPrimaryLabs[id]) assert.equal(moduleDefinition.labs[0]?.componentName, expectedPrimaryLabs[id], `${id} should use the planned primary lab`)
    if (expectedTaskLabs.has(id)) {
      const labTask = moduleDefinition.labs[0]?.task
      assert.ok(labTask, `${id} should turn its lab into a task`)
      assert.ok(labTask.predictionPrompt['zh-CN'])
      assert.ok(labTask.predictionPrompt.en)
      assert.ok(labTask.reflectionPrompt['zh-CN'])
      assert.ok(labTask.reflectionPrompt.en)
    }
    for (const componentName of expectedSupportLabs[id] ?? []) {
      assert.ok(moduleDefinition.labs.some((lab) => lab.componentName === componentName), `${id} should include ${componentName}`)
    }

    assert.ok(
      moduleDefinition.concepts.some((concept) =>
        concept.variables.length > 0 &&
        concept.variables.every((variable) => variable.symbol && variable.description['zh-CN'] && variable.description.en),
      ),
      `${id} should include a concept with variable explanations`,
    )

    for (const quiz of moduleDefinition.quizzes) {
      assert.ok(quiz.explanation['zh-CN'], `${id} quiz ${quiz.id} should explain the answer in Chinese`)
      assert.ok(quiz.explanation.en, `${id} quiz ${quiz.id} should explain the answer in English`)
      assert.ok(quiz.misconceptionTags.length >= 1, `${id} quiz ${quiz.id} should link to a misconception`)
    }

    const visualIds = new Set(moduleDefinition.visuals.map((visual) => visual.id))
    const labIds = new Set(moduleDefinition.labs.map((lab) => lab.id))
    for (const section of moduleDefinition.sections) {
      for (const visualId of section.visualIds ?? []) {
        assert.equal(visualIds.has(visualId), true, `${id} references missing visual ${visualId}`)
      }
      for (const labId of section.labIds ?? []) {
        assert.equal(labIds.has(labId), true, `${id} references missing lab ${labId}`)
      }
    }

    const englishBody = moduleDefinition.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')
    if (id === 'calculus-functions-rate-change') {
      assert.doesNotMatch(englishBody, /Three-Layer Practice/)
      assert.match(englishBody, /controlled experiment|Summary and Handoff/i)
    } else if (id === 'calculus-derivatives-local-change') {
      assert.doesNotMatch(englishBody, /Three-Layer Practice/)
      assert.match(englishBody, /Use a Derivative to Estimate a Small Change|Summary and Handoff/i)
    } else {
      assert.match(englishBody, /Review Questions/)
    }

    const zhBody = moduleDefinition.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
    for (const anchor of requiredChineseAnchors[id] ?? []) {
      assert.match(zhBody, new RegExp(anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${id} should include ${anchor}`)
    }
  }

  assert.deepEqual(
    routeIds.map((id) => byId[id]?.nextModuleIds[0]),
    [
      'calculus-derivatives-local-change',
      'calculus-partial-derivatives-gradients',
      'calculus-gradient-descent',
      'calculus-sgd-batch-noise',
      'calculus-optimizer-comparison',
      'calculus-training-code-diagnostics',
      'taylor-series',
    ],
  )
})

test('learning routes expose a linear algebra route with next-step progress', () => {
  assert.deepEqual(linearAlgebraRouteModuleIds, [
    'linear-algebra-feature-space',
    'linear-algebra-distance-similarity',
    'linear-algebra-matrix-transformations',
    'linear-algebra-rank-null-space',
    'least-squares-fitting',
    'eigenvalues-eigenvectors',
    'svd',
    'pca',
  ])

  const route = learningRoutes.find((candidate) => candidate.id === 'linear-algebra-route')
  assert.ok(route)
  assert.equal(route.title['zh-CN'], '线性代数路线')
  assert.equal(route.title.en, 'Linear Algebra Route')
  assert.deepEqual(route.chapterModuleIds, linearAlgebraRouteModuleIds)

  const summary = routeProgressSummary(route, [
    'linear-algebra-feature-space',
    'linear-algebra-distance-similarity',
  ])
  assert.equal(summary.completedCount, 2)
  assert.equal(summary.totalCount, 8)
  assert.equal(summary.nextModuleId, 'linear-algebra-matrix-transformations')
  assert.equal(summary.completedModuleId, 'linear-algebra-distance-similarity')

  assert.equal(nextModuleForRoute(route, linearAlgebraRouteModuleIds), undefined)
})

test('linear algebra checkpoint report prompts cover every route chapter', () => {
  assert.deepEqual(
    linearAlgebraCheckpointReportPrompts.map((prompt) => prompt.moduleId),
    linearAlgebraRouteModuleIds,
  )

  for (const prompt of linearAlgebraCheckpointReportPrompts) {
    assert.equal(prompt.fields.length, 4, `${prompt.moduleId} should have four report fields`)
    assert.deepEqual(
      prompt.fields.map((field) => field.key),
      ['setup', 'observation', 'explanation', 'nextStep'],
    )
    assert.ok(prompt.staticEvidence.metrics.length >= 2, `${prompt.moduleId} needs static evidence`)
    assert.ok(prompt.staticEvidence.summary['zh-CN'])
    assert.ok(prompt.staticEvidence.summary.en)
    assert.ok(prompt.task['zh-CN'])
    assert.ok(prompt.task.en)
  }

  for (const moduleId of [
    'linear-algebra-distance-similarity',
    'linear-algebra-rank-null-space',
    'least-squares-fitting',
    'svd',
    'pca',
  ]) {
    assert.ok(observationPromptForModule(moduleId), `${moduleId} should have an observation prompt`)
  }

  assert.equal(observationPrompts.length, 5)
  for (const prompt of observationPrompts) {
    assert.ok(prompt.title['zh-CN'])
    assert.ok(prompt.title.en)
    assert.ok(prompt.body['zh-CN'])
    assert.ok(prompt.body.en)
    assert.ok(prompt.targetLabId)
  }
})

test('checkpoint report storage handles drafts, completion, and malformed records', () => {
  const storage = createMemoryStorage()
  const report = createDefaultCheckpointReport('linear-algebra-route', 'svd', '2026-06-23T00:00:00.000Z')

  assert.equal(isCheckpointReportComplete(report), false)

  const draftStorage = createMemoryStorage()
  const draft = saveCheckpointReport({
    ...report,
    answers: {
      ...report.answers,
      setup: 'I kept rank k = 2.',
    },
  }, draftStorage)
  const loadedDraft = loadCheckpointReport('svd', draftStorage)

  assert.equal(draft.completed, false)
  assert.equal(isCheckpointReportComplete(draft), false)
  assert.equal(loadedDraft?.answers.setup, 'I kept rank k = 2.')
  assert.equal(loadedDraft?.completed, false)
  assert.equal(loadedDraft ? isCheckpointReportComplete(loadedDraft) : true, false)

  const tooShort = saveCheckpointReport({
    ...report,
    answers: {
      setup: 'short',
      observation: 'short',
      explanation: 'too short',
      nextStep: 'short',
    },
  }, createMemoryStorage())
  assert.equal(tooShort.completed, false)
  assert.equal(isCheckpointReportComplete(tooShort), false)

  const saved = saveCheckpointReport({
    ...report,
    answers: {
      setup: 'I kept rank k = 2.',
      observation: 'Retained energy stayed high while fine detail faded.',
      explanation: 'The first singular layers carry the main structure.',
      nextStep: 'I would compare validation quality across k values.',
    },
  }, storage)

  assert.equal(isCheckpointReportComplete(saved), true)

  const loaded = loadCheckpointReport('svd', storage)
  assert.equal(loaded?.answers.setup, 'I kept rank k = 2.')
  assert.equal(loaded?.moduleId, 'svd')

  const mismatchedStorage = createMemoryStorage({
    [checkpointReportStorageKey('svd')]: JSON.stringify({
      ...saved,
      moduleId: 'pca',
    }),
  })
  assert.equal(loadCheckpointReport('svd', mismatchedStorage), undefined)

  const brokenStorage = createMemoryStorage({
    [checkpointReportStorageKey('svd')]: '{bad json',
  })
  assert.equal(loadCheckpointReport('svd', brokenStorage), undefined)
})

test('checkpoint report storage tolerates write failures and malformed evidence', () => {
  const report = {
    ...createDefaultCheckpointReport('linear-algebra-route', 'svd', '2026-06-23T00:00:00.000Z'),
    answers: {
      setup: 'I kept rank k = 2.',
      observation: 'Retained energy stayed high while fine detail faded.',
      explanation: 'The first singular layers carry the main structure.',
      nextStep: 'I would compare validation quality across k values.',
    },
  }
  const throwingStorage: StorageLike = {
    getItem: () => null,
    setItem: () => {
      throw new Error('quota exceeded')
    },
    removeItem: () => undefined,
  }

  assert.doesNotThrow(() => saveCheckpointReport(report, throwingStorage))
  const saved = saveCheckpointReport(report, throwingStorage)
  assert.equal(saved.completed, true)

  const malformedEvidenceStorage = createMemoryStorage({
    [checkpointReportStorageKey('svd')]: JSON.stringify({
      ...report,
      evidence: {
        moduleId: 'svd',
        sourceId: 'broken-evidence',
        summary: 'not localized copy',
        metrics: 'not metric array',
        prompt: null,
      },
    }),
  })
  const loaded = loadCheckpointReport('svd', malformedEvidenceStorage)
  assert.equal(loaded?.evidence, undefined)

  const markdown = buildCheckpointReportMarkdown(
    'linear-algebra-route',
    loaded ? [loaded] : [],
    mathLabModules,
    'en',
    '2026-06-23T12:00:00.000Z',
  )
  assert.match(markdown, /Kept rank/)
})

test('checkpoint report markdown export includes evidence and missing answer markers', () => {
  const complete = {
    ...createDefaultCheckpointReport('linear-algebra-route', 'svd', '2026-06-23T00:00:00.000Z'),
    evidence: checkpointReportForModule('svd')!.staticEvidence,
    answers: {
      setup: 'I kept rank k = 2.',
      observation: 'Energy stayed high.',
      explanation: 'Large singular values carry the dominant layers.',
      nextStep: 'Try k = 3 and compare downstream quality.',
    },
  }
  const partial = createDefaultCheckpointReport('linear-algebra-route', 'pca', '2026-06-23T00:00:00.000Z')

  const markdown = buildCheckpointReportMarkdown(
    'linear-algebra-route',
    [complete, partial],
    mathLabModules,
    'en',
    '2026-06-23T12:00:00.000Z',
  )

  assert.match(markdown, /# Linear Algebra Route Report/)
  assert.match(markdown, /## Singular Value Decomposition/)
  assert.match(markdown, /I kept rank k = 2/)
  assert.match(markdown, /Kept rank/)
  assert.match(markdown, /## Principal Component Analysis/)
  assert.match(markdown, /Not answered yet/)

  const allReports = linearAlgebraRouteModuleIds.map((moduleId) => ({
    ...createDefaultCheckpointReport('linear-algebra-route', moduleId, '2026-06-23T00:00:00.000Z'),
    evidence: checkpointReportForModule(moduleId)!.staticEvidence,
  }))
  const fullMarkdown = buildCheckpointReportMarkdown(
    'linear-algebra-route',
    allReports,
    mathLabModules,
    'zh-CN',
    '2026-06-23T12:00:00.000Z',
  )
  for (const moduleId of linearAlgebraRouteModuleIds) {
    const moduleDefinition = mathLabModules.find((candidate) => candidate.id === moduleId)!
    assert.ok(fullMarkdown.includes(moduleDefinition.title['zh-CN']))
  }
})

test('learning routes expose a calculus route with next-step progress', () => {
  const calculusRouteModuleIds = [
    'calculus-functions-rate-change',
    'calculus-derivatives-local-change',
    'calculus-partial-derivatives-gradients',
    'calculus-gradient-descent',
    'calculus-sgd-batch-noise',
    'calculus-optimizer-comparison',
    'calculus-training-code-diagnostics',
  ]

  const route = learningRoutes.find((candidate) => candidate.id === 'calculus-route')
  assert.ok(route)
  assert.equal(route.title['zh-CN'], '微积分学习路线')
  assert.equal(route.title.en, 'Calculus Learning Route')
  assert.deepEqual(route.chapterModuleIds, calculusRouteModuleIds)

  const summary = routeProgressSummary(route, [
    'calculus-functions-rate-change',
    'calculus-derivatives-local-change',
  ])
  assert.equal(summary.completedCount, 2)
  assert.equal(summary.totalCount, 7)
  assert.equal(summary.nextModuleId, 'calculus-partial-derivatives-gradients')
  assert.equal(summary.completedModuleId, 'calculus-derivatives-local-change')

  assert.equal(nextModuleForRoute(route, calculusRouteModuleIds), undefined)
})

test('later linear algebra route chapters use concrete case studies instead of shallow AI footnotes', () => {
  const eigenModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'eigenvalues-eigenvectors')
  const svdModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'svd')
  const pcaModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'pca')
  assert.ok(eigenModule)
  assert.ok(svdModule)
  assert.ok(pcaModule)

  const eigenText = eigenModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const svdText = svdModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const pcaText = pcaModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')

  assert.match(eigenText, /PageRank/)
  assert.match(eigenText, /网页|链接/)
  assert.match(eigenText, /稳定.*方向|方向.*稳定/)
  assert.match(svdText, /图片压缩/)
  assert.match(svdText, /用户[-—]物品/)
  assert.match(svdText, /低秩/)
  assert.match(svdText, /噪声/)
  assert.match(pcaText, /embedding 可视化/i)
  assert.match(pcaText, /离群点/)
  assert.match(pcaText, /批次/)
  assert.match(pcaText, /中心化/)

  assert.doesNotMatch(`${eigenText}\n${svdText}\n${pcaText}`, /它在 AI 里出现在哪里/)
})

test('zero-base beginner modules expose complete bilingual teaching surfaces', () => {
  const beginnerModules = beginnerFoundationModules.filter((moduleDefinition) =>
    [
      'beginner-linear-algebra',
      'beginner-probability-distributions',
    ].includes(moduleDefinition.id),
  )

  assert.equal(beginnerModules.length, 2)

  for (const moduleDefinition of beginnerModules) {
    assert.equal(moduleDefinition.difficulty, 'foundation')
    assert.equal(moduleDefinition.sections.length >= 6, true, `${moduleDefinition.id} needs a full reader flow`)
    assert.equal(moduleDefinition.concepts.length >= 3, true, `${moduleDefinition.id} needs concept cards`)
    assert.equal(moduleDefinition.quizzes.length >= 3, true, `${moduleDefinition.id} needs checkpoints`)
    assert.equal(moduleDefinition.misconceptions.length >= 3, true, `${moduleDefinition.id} needs misconception cards`)
    assert.equal(moduleDefinition.sourceReferences?.length >= 3, true, `${moduleDefinition.id} needs public source records`)
    assert.equal(moduleDefinition.sourceNoteFile, 'math-lab-beginner-bridge-sources.md')
    assert.equal(moduleDefinition.visuals.some((visual) => visual.type === 'image'), true)
    assert.equal(moduleDefinition.sections.some((section) => section.labIds?.length), true)

    const zhBody = moduleDefinition.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
    const enBody = moduleDefinition.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')
    assert.equal(zhBody.length > 2800, true, `${moduleDefinition.id} Chinese body should be detailed`)
    assert.equal(enBody.length > 3600, true, `${moduleDefinition.id} English body should be detailed`)
    assert.doesNotMatch(`${zhBody}\n${enBody}`, /3Blue1Brown says|Seeing Theory says|StatQuest says|GPT-5\.5|Cleaned Source|Course Staff|changelog|site\.baseurl/)
    assert.doesNotMatch(zhBody, /A vector is|The derivative is|Probability distribution is/)
    assert.doesNotMatch(enBody, /向量只是|导数就是|古典概率/)

    const html = renderMarkdownWithMath([
      ...moduleDefinition.concepts.map((concept) => `$$${concept.formulaLatex}$$`),
      ...moduleDefinition.sections.map((section) => `${section.title.en}\n\n${section.content.en}`),
      ...moduleDefinition.quizzes.map((quizItem) => `${quizItem.prompt.en}\n\n${quizItem.explanation.en}`),
    ].join('\n\n'))
    assert.match(html, /katex/)
    assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)

    for (const reference of moduleDefinition.sourceReferences ?? []) {
      assert.match(reference.href, /^https:\/\//)
    }
  }

  const byId = Object.fromEntries(beginnerModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))
  assert.ok(byId['beginner-linear-algebra']!.labs.some((lab) => lab.componentName === 'FeatureVectorStoryLab'))
  assert.ok(byId['beginner-probability-distributions']!.labs.some((lab) => lab.componentName === 'DistributionBuilderLab'))
  assert.ok(byId['beginner-probability-distributions']!.labs.some((lab) => lab.componentName === 'ConditionalBayesLab'))
})

test('beginner linear algebra wires vector similarity lab and misconception guardrail', () => {
  const linear = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'beginner-linear-algebra')
  assert.ok(linear)

  const similarityLab = linear.labs.find((lab) => lab.id === 'beginner-vector-similarity-lab')
  assert.equal(similarityLab?.componentName, 'VectorSimilarityLab')
  assert.equal(similarityLab?.type, 'interactive-visual')
  assert.equal(similarityLab?.successCriteria.length, 3)

  const distanceSection = linear.sections.find((section) => section.id === 'beginner-linear-distance-similarity')
  assert.deepEqual(distanceSection?.labIds, [
    'beginner-feature-vector-story-lab',
    'beginner-vector-similarity-lab',
  ])
  const distanceSectionProse = `${distanceSection?.content['zh-CN']}\n${distanceSection?.content.en}`
  assert.doesNotMatch(distanceSectionProse, /VectorSimilarityLab/)
  assert.match(distanceSectionProse, /向量相似度实验/)
  assert.match(distanceSectionProse, /Vector Similarity Lab/)

  const normDistanceConcept = linear.concepts.find((concept) => concept.id === 'beginner-vector-norm-distance')
  assert.ok(normDistanceConcept)
  assert.match(normDistanceConcept.formulaLatex, /\\\|\\mathbf\{x\}-\\mathbf\{y\}\\\|_2/)
  assert.ok(normDistanceConcept.variables.every((item) => item.description['zh-CN'].length > 0 && item.description.en.length > 0))
  assert.match(normDistanceConcept.modelConnection['zh-CN'], /embedding|检索|评分/)
  assert.match(normDistanceConcept.modelConnection.en, /embedding|retrieval|scoring/)
  assert.match(normDistanceConcept.codeExample ?? '', /const x = \[2, 5, 80\]/)
  assert.match(normDistanceConcept.codeExample ?? '', /const y = \[3, 4, 82\]/)
  assert.match(normDistanceConcept.codeExample ?? '', /const distance = /)

  const guardrailQuiz = linear.quizzes.find((quizItem) => quizItem.id === 'beginner-linear-cosine-distance')
  assert.ok(guardrailQuiz)
  assert.deepEqual(guardrailQuiz.misconceptionTags, ['cosine-distance-confusion'])
  assert.equal(guardrailQuiz.revisitVisualId, 'beginner-vector-similarity-lab')
  assert.match(guardrailQuiz.explanation['zh-CN'], /方向/)
  assert.match(guardrailQuiz.explanation.en, /direction/)

  const guardrailMisconception = linear.misconceptions.find((item) => item.id === 'cosine-distance-confusion')
  assert.ok(guardrailMisconception)
  assert.match(guardrailMisconception.statement['zh-CN'], /cosine/)
  assert.match(guardrailMisconception.correction.en, /Euclidean distance/)
})

test('zero-base foundation expansion wires longform visuals and concept bridges', () => {
  const byId = Object.fromEntries(
    [...mathLabModules, ...beginnerFoundationModules].map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
  )
  const root = new URL('../', import.meta.url)
  const expectedLongformAssets = {
    'beginner-linear-algebra': [
      'beginner-vector-feature-space-longform',
      'beginner-vector-distance-similarity-longform',
      'beginner-linear-combination-span-longform',
      'beginner-matrix-transform-longform',
    ],
    'beginner-probability-distributions': [
      'beginner-probability-why-longform',
      'beginner-sample-space-random-variable-longform',
      'beginner-distribution-frequency-longform',
      'beginner-conditional-probability-longform',
      'beginner-bayes-update-longform',
      'beginner-expectation-variance-longform',
      'beginner-calibration-confidence-longform',
      'beginner-softmax-cross-entropy-longform',
    ],
  } as const

  for (const [moduleId, assetIds] of Object.entries(expectedLongformAssets)) {
    const moduleDefinition = byId[moduleId]!
    const sectionVisualIds = new Set(moduleDefinition.sections.flatMap((section) => section.visualIds ?? []))

    for (const assetId of assetIds) {
      const asset = moduleDefinition.visuals.find((candidate) => candidate.id === assetId)
      assert.ok(asset, `${assetId} should be registered as a module visual`)
      assert.equal(asset?.type, 'image')
      assert.match(asset?.assetPath ?? '', /^\/math-lab\/generated\/[a-z0-9-]+-longform\.png$/)
      assert.doesNotMatch(asset?.assetPath ?? '', /^https?:\/\//)
      assert.doesNotMatch(asset?.assetPath ?? '', /^[A-Za-z]:\\/)
      assert.ok(sectionVisualIds.has(assetId), `${assetId} should be referenced by a section visualIds entry`)
      assert.ok(existsSync(new URL(`public/${asset!.assetPath!.replace(/^\//, '')}`, root)), `${asset!.assetPath} should exist`)
      assert.ok((asset?.alt?.['zh-CN'] ?? '').length > 20, `${assetId} needs Chinese alt text`)
      assert.ok((asset?.transcript?.en ?? '').length > 60, `${assetId} needs English transcript text`)
    }
  }

  const linearBody = byId['beginner-linear-algebra']!.sections.map((section) => section.content['zh-CN']).join('\n')
  assert.match(linearBody, /向量回答的是：一个对象在每个特征方向上走了多少/)
  assert.match(linearBody, /矩阵回答的是：多个输入特征如何被加权混合成新的表达/)

  const probabilityBody = byId['beginner-probability-distributions']!.sections.map((section) => section.content['zh-CN']).join('\n')
  assert.match(probabilityBody, /概率回答的是：在明确的样本空间里，长期会怎样分配结果/)
  assert.match(probabilityBody, /分布回答的是：很多次观察后，结果会留下什么形状/)
  assert.match(probabilityBody, /条件概率是在已知信息下重看样本空间/)
  assert.match(probabilityBody, /贝叶斯更新把旧信念改成新信念/)
  assert.match(probabilityBody, /校准要检查/)
})

test('formal math modules include beginner bridge copy after the foundation expansion', () => {
  const byId = Object.fromEntries(mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))
  const formalBridgeExpectations = [
    ['linear-algebra-feature-space', /带单位线性泛函/],
    ['linear-algebra-distance-similarity', /搜索[\s\S]*语义|embedding 空间/],
    ['linear-algebra-matrix-transformations', /Xw\+b|批量预测/],
    ['linear-algebra-rank-null-space', /推荐系统为什么会有盲区/],
    ['taylor-series', /从零基础微积分带过来的检查表/],
    ['finite-difference-methods', /导数的零基础直觉是“局部变化率”/],
    ['matrix-calculus-autodiff', /把“导数是局部变化率”升级成“局部线性映射”/],
    ['probability-likelihood-entropy', /从零基础概率章节带过来的检查表/],
  ] as const

  for (const [moduleId, pattern] of formalBridgeExpectations) {
    const moduleDefinition = byId[moduleId]!
    const source = moduleDefinition.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
    assert.match(source, pattern, `${moduleId} should include the expected beginner bridge`)
  }
})

test('key math foundation topics are connected to interactive or video enhancements', () => {
  const byId = Object.fromEntries(mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))

  assert.ok(byId['taylor-series']!.labs.some((lab) => lab.componentName === 'TaylorSeriesLab'))
  assert.ok(byId['monte-carlo']!.labs.some((lab) => lab.componentName === 'MonteCarloLab'))
  assert.ok(byId['linear-algebra-feature-space']!.labs.some((lab) => lab.componentName === 'FeatureVectorStoryLab'))
  assert.ok(byId['linear-algebra-distance-similarity']!.labs.some((lab) => lab.componentName === 'VectorSimilarityLab'))
  assert.ok(byId['linear-algebra-matrix-transformations']!.labs.some((lab) => lab.componentName === 'MathToCodeMatrixLab'))
  assert.ok(byId['linear-algebra-rank-null-space']!.labs.some((lab) => lab.componentName === 'MatrixColumnSpaceLab'))
  assert.ok(byId['lu-decomposition']!.labs.some((lab) => lab.componentName === 'LuDecompositionLab'))
  assert.ok(byId['sparse-matrices']!.labs.some((lab) => lab.componentName === 'SparseMatrixLab'))
  assert.ok(byId['condition-numbers']!.labs.some((lab) => lab.componentName === 'ConditionNumbersLab'))
  assert.ok(byId['eigenvalues-eigenvectors']!.labs.some((lab) => lab.componentName === 'EigenDirectionLab'))
  assert.ok(byId['markov-chains']!.labs.some((lab) => lab.componentName === 'MarkovChainLab'))
  assert.ok(byId['finite-difference-methods']!.labs.some((lab) => lab.componentName === 'FiniteDifferenceLab'))
  assert.ok(byId['nonlinear-equations']!.labs.some((lab) => lab.componentName === 'NonlinearEquationsLab'))
  assert.ok(byId.optimization!.labs.some((lab) => lab.componentName === 'MathGradientLab'))
  assert.ok(byId['tensor-shapes-vectorization']!.labs.some((lab) => lab.componentName === 'TensorShapeLab'))
  assert.ok(byId['matrix-calculus-autodiff']!.labs.some((lab) => lab.componentName === 'AutodiffGraphLab'))
  assert.ok(byId['probability-likelihood-entropy']!.labs.some((lab) => lab.componentName === 'ProbabilityEntropyLab'))
  assert.ok(byId['training-diagnostics']!.labs.some((lab) => lab.componentName === 'TrainingDiagnosticsLab'))
  assert.ok(byId['deep-architecture-math']!.labs.some((lab) => lab.componentName === 'ArchitectureMathLab'))
  assert.ok(byId.svd!.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
  assert.ok(byId.pca!.labs.some((lab) => lab.componentName === 'PcaProjectionLab'))
})

test('AI bridge modules include complete V1 teaching surfaces', () => {
  const bridgeModules = mathLabModules.filter((moduleDefinition) =>
    [
      'tensor-shapes-vectorization',
      'matrix-calculus-autodiff',
      'probability-likelihood-entropy',
      'training-diagnostics',
      'deep-architecture-math',
    ].includes(moduleDefinition.id),
  )

  assert.equal(bridgeModules.length, 5)

  for (const moduleDefinition of bridgeModules) {
    assert.equal(moduleDefinition.learningObjectives.length >= 3, true)
    assert.equal(moduleDefinition.concepts.length >= 2, true)
    assert.equal(moduleDefinition.sections.length >= 5, true)
    assert.equal(moduleDefinition.quizzes.length >= 3, true)
    assert.equal(moduleDefinition.misconceptions.length >= 3, true)
    assert.equal(moduleDefinition.sections.some((section) => section.labIds?.length), true)
    assert.equal(moduleDefinition.visuals.some((visual) => visual.type === 'image'), true)
    assert.equal(moduleDefinition.visuals.some((visual) => visual.type === 'manim-video'), true)
    assert.equal(moduleDefinition.sourceReferences?.length > 0, true)
    assert.equal(moduleDefinition.sourceNoteFile, 'math-lab-ai-foundation-sources.md')
    assert.equal(moduleDefinition.sourceReferences?.every((source) => source.href.startsWith('https://')), true)

    const html = renderMarkdownWithMath([
      ...moduleDefinition.concepts.map((concept) => `$$${concept.formulaLatex}$$`),
      ...moduleDefinition.sections.map((section) => `${section.title.en}\n\n${section.content.en}`),
    ].join('\n\n'))
    assert.match(html, /katex/)
    assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)

    if (moduleDefinition.id === 'probability-likelihood-entropy') {
      const englishSource = moduleDefinition.sections.map((section) => section.content.en).join('\n')
      const chineseSource = moduleDefinition.sections.map((section) => section.content['zh-CN']).join('\n')
      assert.match(chineseSource, /古典概率/)
      assert.match(chineseSource, /样本空间/)
      assert.match(chineseSource, /频率/)
      assert.match(englishSource, /classical probability/i)
      assert.match(englishSource, /sample space/i)
      assert.match(englishSource, /frequency/i)
      assert.match(englishSource, /event repeats many times/i)
      assert.match(englishSource, /distribution-first bridge/i)
      assert.match(englishSource, /\/math-lab\/generated\/beginner-probability-story\.png/)
      assert.ok(moduleDefinition.quizzes.some((quiz) => quiz.id === 'probability-beginner-distribution'))
      assert.ok(moduleDefinition.misconceptions.some((misconception) => misconception.id === 'probability-one-trial'))
    }
  }
})

test('taylor module presents hand-written bilingual content as an integrated reader chapter', () => {
  const taylor = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'taylor-series')
  assert.ok(taylor)

  assert.equal(taylor.title['zh-CN'], '泰勒级数')
  assert.equal(taylor.title.en, 'Taylor Series')
  assert.ok(taylor.learningObjectives.length >= 4)
  assert.ok(taylor.concepts.length >= 1)
  assert.ok(taylor.quizzes.length >= 2)
  assert.ok(taylor.misconceptions.length >= 2)
  assert.ok(taylor.quizzes.some((quiz) => quiz.id === 'taylor-series-beginner-local-change'))
  assert.ok(taylor.misconceptions.some((misconception) => misconception.id === 'calculus-is-global-formula'))
  assert.ok(taylor.labs.some((lab) => lab.componentName === 'TaylorSeriesLab'))
  assert.ok(taylor.visuals.some((visual) => visual.id === 'taylor-polynomial-video'))
  assert.ok(taylor.sections.some((section) => section.visualIds?.includes('taylor-polynomial-video')))
  assert.ok(taylor.sections.some((section) => section.labIds?.includes('taylor-series-lab')))
  assert.deepEqual(
    taylor.sections.map((section) => section.id),
    [
      'taylor-series-zero-base-story',
      'taylor-series-learning-objectives',
      'taylor-series-polynomial-overview',
      'taylor-series-taylor-series-expansion',
      'taylor-series-taylor-series-error',
      'taylor-series-ml-summary',
      'taylor-series-review-questions',
    ],
  )

  const zhBody = taylor.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = taylor.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /学习目标/)
  assert.match(zhBody, /函数可以先理解成一台输入输出机器/)
  assert.match(zhBody, /平均变化率/)
  assert.match(zhBody, /瞬时变化率/)
  assert.match(zhBody, /导数就是此刻速度/)
  assert.match(zhBody, /多项式概览/)
  assert.match(zhBody, /Taylor 级数展开/)
  assert.match(zhBody, /Taylor 级数误差/)
  assert.match(zhBody, /Lagrange 余项/)
  assert.match(zhBody, /梯度下降/)
  assert.match(enBody, /Learning Objectives/)
  assert.match(enBody, /a function can first be understood as an input-output machine/i)
  assert.match(enBody, /average rate of change/i)
  assert.match(enBody, /instantaneous rate of change/i)
  assert.match(enBody, /derivative is current speed/i)
  assert.match(enBody, /local map of a complex function/)
  assert.match(enBody, /\/math-lab\/generated\/beginner-calculus-story\.png/)
  assert.match(enBody, /Polynomial Overview/)
  assert.match(enBody, /Taylor Series Expansion/)
  assert.match(enBody, /Taylor Series Error/)
  assert.match(enBody, /Taylor Remainder Theorem/)
  assert.match(enBody, /Lagrange/)
  assert.match(enBody, /gradient descent/i)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Source Note/)
  assert.doesNotMatch(zhBody, /泰勒系列扩展包|当时|A Taylor series is|How would we|Suppose that/)
})

test('taylor module markdown renders formulas without raw delimiters', () => {
  const taylor = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'taylor-series')
  assert.ok(taylor)

  const source = taylor.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(source)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('monte carlo module presents repaired bilingual content and inline sampling lab', () => {
  const monteCarlo = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'monte-carlo')
  assert.ok(monteCarlo)

  assert.equal(monteCarlo.title['zh-CN'], '随机数生成器与蒙特卡洛方法')
  assert.equal(monteCarlo.title.en, 'Random Number Generators and Monte Carlo Methods')
  assert.ok(monteCarlo.learningObjectives.length >= 4)
  assert.ok(monteCarlo.concepts.length >= 1)
  assert.ok(monteCarlo.quizzes.length >= 2)
  assert.ok(monteCarlo.misconceptions.length >= 2)
  assert.ok(monteCarlo.labs.some((lab) => lab.componentName === 'MonteCarloLab'))
  assert.ok(monteCarlo.visuals.some((visual) => visual.id === 'monte-carlo-sampling-video'))
  assert.ok(monteCarlo.sections.some((section) => section.visualIds?.includes('monte-carlo-sampling-video')))
  assert.ok(monteCarlo.sections.some((section) => section.labIds?.includes('monte-carlo-sampling-lab')))

  const zhBody = monteCarlo.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = monteCarlo.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /伪随机方法/)
  assert.match(zhBody, /公平骰子、大气噪声、热噪声/)
  assert.match(zhBody, /线性同余生成器/)
  assert.match(zhBody, /def lcg_gen_next/)
  assert.match(zhBody, /黄油面包/)
  assert.match(zhBody, /投掷实验重复/)
  assert.match(zhBody, /\/math-lab\/generated\/monte-carlo-sampling-illustration\.png/)
  assert.match(zhBody, /典型误差规模|误差为什么通常按/)
  assert.match(zhBody, /def f\(x: float, y: float\)/)
  assert.match(zhBody, /估计器账本：目标、样本路径与误差不是同一件事/)
  assert.match(zhBody, /小批量梯度下降/)
  assert.match(enBody, /True Random and Pseudorandom/)
  assert.match(enBody, /linear congruential generator/)
  assert.match(enBody, /Will my buttered bread land face-down/)
  assert.match(enBody, /Estimator Ledger: Target, Sample Path, and Error Are Different Objects/)
  assert.match(enBody, /Mini-batch gradient descent/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Source Note/)
  assert.doesNotMatch(zhBody, /One of the most common applications|Consider using Monte Carlo|Below is the Python code|What is a pseudo-random/)
  assert.doesNotMatch(enBody, /随机数生成器具有|蒙特卡洛方法通常|复习问题/)
})

test('monte carlo module markdown renders formulas without raw delimiters', () => {
  const monteCarlo = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'monte-carlo')
  assert.ok(monteCarlo)

  const source = monteCarlo.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(source)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('linear algebra vector and matrix route modules present case-driven bilingual content', () => {
  const routeIds = [
    'linear-algebra-feature-space',
    'linear-algebra-distance-similarity',
    'linear-algebra-matrix-transformations',
    'linear-algebra-rank-null-space',
  ]

  for (const id of routeIds) {
    const moduleDefinition = mathLabModules.find((candidate) => candidate.id === id)
    assert.ok(moduleDefinition, `${id} should exist`)
    assert.ok(moduleDefinition.sections.every((section) => section.title['zh-CN'] && section.title.en))
    assert.ok(moduleDefinition.concepts.every((concept) => concept.name['zh-CN'] && concept.name.en))
    assert.ok(moduleDefinition.quizzes.every((quiz) => quiz.explanation['zh-CN'] && quiz.explanation.en))
    assert.ok(moduleDefinition.misconceptions.every((item) => item.correction['zh-CN'] && item.correction.en))
  }

  const byId = Object.fromEntries(mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))
  assert.ok(byId['linear-algebra-feature-space']!.labs.some((lab) => lab.componentName === 'FeatureVectorStoryLab'))
  assert.ok(byId['linear-algebra-distance-similarity']!.labs.some((lab) => lab.componentName === 'VectorSimilarityLab'))
  assert.ok(byId['linear-algebra-matrix-transformations']!.labs.some((lab) => lab.componentName === 'MathToCodeMatrixLab'))
  assert.ok(byId['linear-algebra-rank-null-space']!.labs.some((lab) => lab.componentName === 'MatrixColumnSpaceLab'))

  assert.match(
    byId['linear-algebra-distance-similarity']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /搜索[\s\S]*语义|embedding 空间/,
  )
  assert.match(byId['linear-algebra-matrix-transformations']!.sections.map((section) => section.content['zh-CN']).join('\n'), /Xw\+b|批量|广播/)
  assert.match(byId['linear-algebra-rank-null-space']!.sections.map((section) => section.content['zh-CN']).join('\n'), /推荐系统|盲区/)
})

test('linear algebra route markdown renders formulas without raw delimiters', () => {
  const routeIds = [
    'linear-algebra-feature-space',
    'linear-algebra-distance-similarity',
    'linear-algebra-matrix-transformations',
    'linear-algebra-rank-null-space',
  ]

  for (const id of routeIds) {
    const moduleDefinition = mathLabModules.find((candidate) => candidate.id === id)
    assert.ok(moduleDefinition, `${id} should exist`)
    const source = [
      ...moduleDefinition.learningObjectives.map((item) => item['zh-CN']),
      ...moduleDefinition.concepts.flatMap((concept) => [
        concept.plainExplanation['zh-CN'],
        concept.geometricIntuition['zh-CN'],
        concept.numericalExample['zh-CN'],
      ]),
      ...moduleDefinition.sections.map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`),
      ...moduleDefinition.quizzes.map((quiz) => `${quiz.prompt['zh-CN']}\n\n${quiz.explanation['zh-CN']}`),
      ...moduleDefinition.misconceptions.map((item) => `${item.correction['zh-CN']}\n\n${item.example['zh-CN']}`),
    ].join('\n\n')
    const html = renderMarkdownWithMath(source)

    assert.match(html, /katex|向量|矩阵|rank|cosine|embedding/i)
    assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
  }
})

test('linear algebra route keeps vector similarity and column space guardrails', () => {
  const byId = Object.fromEntries(mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))
  assert.ok(byId['linear-algebra-distance-similarity']!.quizzes.some((quiz) => quiz.misconceptionTags.includes('cosine-distance-confusion')))
  assert.ok(byId['linear-algebra-rank-null-space']!.quizzes.some((quiz) => quiz.misconceptionTags.includes('rank-is-nonzero-entry-count')))
  assert.ok(byId['linear-algebra-rank-null-space']!.misconceptions.some((item) => item.id === 'null-space-is-empty'))
})

test('lu decomposition module presents repaired bilingual content and inline LU lab', () => {
  const luModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'lu-decomposition')
  assert.ok(luModule)

  assert.equal(luModule.title['zh-CN'], '用 LU 分解求解线性方程')
  assert.equal(luModule.title.en, 'LU Decomposition for Solving Linear Equations')
  assert.ok(luModule.learningObjectives.length >= 5)
  assert.ok(luModule.concepts.length >= 2)
  assert.ok(luModule.quizzes.length >= 3)
  assert.ok(luModule.misconceptions.length >= 3)
  assert.ok(luModule.labs.some((lab) => lab.componentName === 'LuDecompositionLab'))
  assert.ok(luModule.sections.some((section) => section.labIds?.includes('lu-decomposition-solve-lab')))
  assert.ok(luModule.sections.length >= 16)
  assert.ok(luModule.sections.some((section) => section.id === 'lu-decomposition-basic-idea-the-undo-button-for-linear-operations'))
  assert.ok(luModule.sections.some((section) => section.id === 'lu-decomposition-back-substitution-algorithm-for-upper-triangular-systems'))
  assert.ok(luModule.sections.some((section) => section.id === 'lu-decomposition-the-lu-decomposition-algorithm'))
  assert.ok(luModule.sections.some((section) => section.id === 'lu-decomposition-the-lup-decomposition-algorithm'))
  assert.ok(luModule.sections.some((section) => section.id === 'lu-decomposition-review-questions'))

  const zhBody = luModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = luModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(enBody, /Matrix-vector multiplication: given/)
  assert.match(enBody, /def back_sub/)
  assert.match(enBody, /def forward_sub/)
  assert.match(enBody, /def lu_decomp/)
  assert.match(enBody, /def lup_decomp/)
  assert.match(enBody, /Given a factorization/)
  assert.match(enBody, /The lab below uses the same/)
  assert.match(enBody, /Schur complement/)
  assert.match(enBody, /Partial pivoting/)
  assert.match(enBody, /inverse iteration/)
  assert.match(zhBody, /矩阵-向量乘法可以这样理解/)
  assert.match(zhBody, /回代算法/)
  assert.match(zhBody, /前代算法/)
  assert.match(zhBody, /LU 分解的性质如下/)
  assert.match(zhBody, /怎样求这个矩阵的 LUP 分解/)
  assert.match(zhBody, /给定分解/)
  assert.doesNotMatch(
    zhBody,
    /Matrix-vector multiplication: given|The properties of this algorithm are|How can we solve|What is the cost of matrix-matrix multiplication|Given a factorization/,
  )
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|Cleaned Source|Source Note|Errata/)
})

test('lu decomposition module markdown renders formulas without raw delimiters', () => {
  const luModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'lu-decomposition')
  assert.ok(luModule)

  const source = luModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const objectiveSource = luModule.learningObjectives.map((objective) => objective['zh-CN']).join('\n\n')
  const html = renderMarkdownWithMath(`${objectiveSource}\n\n${source}`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /Amathbf|mathcalO|times2/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('sparse matrices module presents repaired bilingual content and inline CSR lab', () => {
  const sparseModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'sparse-matrices')
  assert.ok(sparseModule)

  assert.equal(sparseModule.title['zh-CN'], '稀疏矩阵')
  assert.equal(sparseModule.title.en, 'Sparse Matrices')
  assert.ok(sparseModule.learningObjectives.length >= 5)
  assert.ok(sparseModule.concepts.length >= 2)
  assert.ok(sparseModule.quizzes.length >= 3)
  assert.ok(sparseModule.misconceptions.length >= 3)
  assert.ok(sparseModule.labs.some((lab) => lab.componentName === 'SparseMatrixLab'))
  assert.ok(sparseModule.sections.some((section) => section.labIds?.includes('sparse-matrix-storage-lab')))

  const zhBody = sparseModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = sparseModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /Dense 矩阵：所有位置都要存/)
  assert.match(zhBody, /COO：把非零项写成三元组/)
  assert.match(zhBody, /CSR：用 rowptr 把每一行切出来/)
  assert.match(zhBody, /CSR 矩阵向量乘法/)
  assert.match(zhBody, /推荐系统/)
  assert.match(zhBody, /\\operatorname\{nnz\}\(A\)/)
  assert.match(enBody, /Dense Matrices: Every Position Is Stored/)
  assert.match(enBody, /COO: Store Nonzeros as Triples/)
  assert.match(enBody, /CSR: Use rowptr to Slice Each Row/)
  assert.match(enBody, /Sparse Structure in Machine Learning/)
  assert.match(enBody, /def csr_mat_vec/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|Cleaned Source|Source Note|Course Staff|changelog/)
  assert.doesNotMatch(zhBody, /Some types of matrices contain too many zeros|What does it mean for a matrix to be sparse/)
  assert.doesNotMatch(enBody, /什么叫稀疏矩阵|推荐系统|图学习/)
})

test('sparse matrices module markdown renders formulas without raw delimiters', () => {
  const sparseModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'sparse-matrices')
  assert.ok(sparseModule)

  const source = sparseModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(source)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('condition numbers module preserves lecture coverage with bilingual repair and inline lab', () => {
  const conditionModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'condition-numbers')
  assert.ok(conditionModule)

  assert.equal(conditionModule.title['zh-CN'], '条件数与敏感性')
  assert.equal(conditionModule.title.en, 'Condition Numbers')
  assert.ok(conditionModule.learningObjectives.length >= 5)
  assert.ok(conditionModule.concepts.length >= 2)
  assert.ok(conditionModule.quizzes.length >= 3)
  assert.ok(conditionModule.misconceptions.length >= 3)
  assert.ok(conditionModule.labs.some((lab) => lab.componentName === 'ConditionNumbersLab'))
  assert.ok(conditionModule.sections.some((section) => section.labIds?.includes('condition-number-amplification-lab')))

  const sectionIds = conditionModule.sections.map((section) => section.id)
  assert.ok(sectionIds.includes('condition-numbers-sensitivity-of-solutions-of-linear-systems-and-error-bound'))
  assert.ok(sectionIds.includes('condition-numbers-condition-number'))
  assert.ok(sectionIds.includes('condition-numbers-residual-vs-error'))
  assert.ok(sectionIds.includes('condition-numbers-alternative-definitions-of-relative-residual'))
  assert.ok(sectionIds.includes('condition-numbers-gaussian-elimination-with-partial-pivoting-is-guaranteed-to-produce-a-small-residual'))
  assert.ok(sectionIds.includes('condition-numbers-accuracy-rule-of-thumb-for-conditioning'))

  const zhBody = conditionModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = conditionModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /线性系统解的敏感性与误差界/)
  assert.match(zhBody, /诱导矩阵范数/)
  assert.match(zhBody, /正交矩阵/)
  assert.match(zhBody, /行列式不是判断/)
  assert.match(zhBody, /残差与误差不是一回事/)
  assert.match(zhBody, /带部分主元/)
  assert.match(zhBody, /16-10=6/)
  assert.match(zhBody, /特征缩放/)
  assert.match(zhBody, /\\operatorname\{cond\}\(X\^TX\)=\\operatorname\{cond\}\(X\)\^2/)
  assert.match(enBody, /Sensitivity of Linear-System Solutions/)
  assert.match(enBody, /Induced Matrix Norms/)
  assert.match(enBody, /Residual and Error Are Not the Same Thing/)
  assert.match(enBody, /Gaussian elimination with partial pivoting/)
  assert.match(enBody, /Feature scaling/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Course Staff|changelog/)
  assert.doesNotMatch(zhBody, /Suppose we start|The condition number of a matrix|What is the 2-norm|How many accurate decimal digits/)
  assert.doesNotMatch(enBody, /条件数是衡量|残差与误差|特征缩放/)
})

test('condition numbers module markdown renders formulas without raw delimiters', () => {
  const conditionModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'condition-numbers')
  assert.ok(conditionModule)

  const source = conditionModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(source)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('eigenvalues module presents repaired bilingual content with inline power iteration lab', () => {
  const eigenModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'eigenvalues-eigenvectors')
  assert.ok(eigenModule)

  assert.equal(eigenModule.title['zh-CN'], '特征值与特征向量')
  assert.equal(eigenModule.title.en, 'Eigenvalues and Eigenvectors')
  assert.ok(eigenModule.learningObjectives.length >= 5)
  assert.ok(eigenModule.concepts.length >= 3)
  assert.ok(eigenModule.quizzes.length >= 4)
  assert.ok(eigenModule.misconceptions.length >= 3)
  assert.ok(eigenModule.labs.some((lab) => lab.componentName === 'EigenDirectionLab'))
  assert.ok(eigenModule.sections.some((section) => section.labIds?.includes('eigen-power-iteration-lab')))

  const sectionIds = eigenModule.sections.map((section) => section.id)
  assert.ok(sectionIds.includes('eigenvalues-eigenvectors-definition-and-small-example'))
  assert.ok(sectionIds.includes('eigenvalues-eigenvectors-diagonalization'))
  assert.ok(sectionIds.includes('eigenvalues-eigenvectors-shifts-and-inverses'))
  assert.ok(sectionIds.includes('eigenvalues-eigenvectors-power-iteration'))
  assert.ok(sectionIds.includes('eigenvalues-eigenvectors-inverse-shifted-and-costs'))
  assert.ok(sectionIds.includes('eigenvalues-eigenvectors-orthogonal-bases'))
  assert.ok(sectionIds.includes('v3-eigen-shared-covariance'))
  assert.ok(sectionIds.includes('v3-eigen-numpy-output'))
  assert.ok(sectionIds.includes('v3-eigen-summary'))
  assert.equal(sectionIds.includes('eigenvalues-eigenvectors-review-questions'), false)

  const zhBody = eigenModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = eigenModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /特征多项式/)
  assert.match(zhBody, /可对角化/)
  assert.match(zhBody, /平移逆迭代/)
  assert.match(zhBody, /Rayleigh quotient/)
  assert.match(zhBody, /Gram-Schmidt/)
  assert.match(zhBody, /谱间隔/)
  assert.match(zhBody, /PCA/)
  assert.match(zhBody, /PageRank/)
  assert.match(enBody, /Characteristic Polynomial/)
  assert.match(enBody, /Diagonalization/)
  assert.match(enBody, /shifted inverse iteration/i)
  assert.match(enBody, /Rayleigh quotient iteration/i)
  assert.match(enBody, /Gram-Schmidt/)
  assert.match(enBody, /Spectral Structure in Machine Learning/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Course Staff|changelog/)
  assert.doesNotMatch(zhBody, /An \*\*_eigenvalue_\*\*|Power iteration allows us|The following code snippet performs power iteration/)
  assert.doesNotMatch(enBody, /特征值|特征向量|平移逆迭代|复习问题/)
})

test('eigenvalues module markdown renders formulas without raw delimiters', () => {
  const eigenModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'eigenvalues-eigenvectors')
  assert.ok(eigenModule)

  const source = eigenModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const objectiveSource = eigenModule.learningObjectives.map((objective) => objective['zh-CN']).join('\n\n')
  const conceptSource = eigenModule.concepts
    .map((concept) => `${concept.plainExplanation['zh-CN']}\n\n${concept.numericalExample['zh-CN']}`)
    .join('\n\n')
  const quizSource = eigenModule.quizzes
    .map((quiz) => `${quiz.prompt['zh-CN']}\n\n${quiz.explanation['zh-CN']}`)
    .join('\n\n')
  const misconceptionSource = eigenModule.misconceptions
    .map((misconception) => `${misconception.correction['zh-CN']}\n\n${misconception.example['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(`${objectiveSource}\n\n${conceptSource}\n\n${source}\n\n${quizSource}\n\n${misconceptionSource}`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /Amathbf|lambdamathbf/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('markov chains module preserves lecture coverage with bilingual repair and inline PageRank lab', () => {
  const markovModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'markov-chains')
  assert.ok(markovModule)

  assert.equal(markovModule.title['zh-CN'], '马尔可夫链')
  assert.equal(markovModule.title.en, 'Markov chains')
  assert.ok(markovModule.learningObjectives.length >= 5)
  assert.ok(markovModule.concepts.length >= 3)
  assert.ok(markovModule.quizzes.length >= 3)
  assert.ok(markovModule.misconceptions.length >= 3)
  assert.ok(markovModule.labs.some((lab) => lab.componentName === 'MarkovChainLab'))
  assert.ok(markovModule.sections.some((section) => section.labIds?.includes('markov-chain-pagerank-lab')))

  const sectionIds = markovModule.sections.map((section) => section.id)
  assert.ok(sectionIds.includes('markov-chains-graphs-as-matrices'))
  assert.ok(sectionIds.includes('markov-chains-property-and-matrix'))
  assert.ok(sectionIds.includes('markov-chains-weather-example'))
  assert.ok(sectionIds.includes('markov-chains-stationary-distribution'))
  assert.ok(sectionIds.includes('markov-chains-pagerank'))
  assert.ok(sectionIds.includes('probability-route-markov-summary'))

  const zhBody = markovModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = markovModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /从图到邻接矩阵/)
  assert.match(zhBody, /带权有向图/)
  assert.match(zhBody, /列表示当前状态、行表示下一状态/)
  assert.match(zhBody, /天气状态转移图/)
  assert.match(zhBody, /稳定分布/)
  assert.match(zhBody, /特征值 1/)
  assert.match(zhBody, /PageRank/)
  assert.match(zhBody, /阻尼因子/)
  assert.match(zhBody, /MCMC/)
  assert.match(enBody, /From Graphs to Adjacency Matrices/)
  assert.match(enBody, /column-stochastic/)
  assert.match(enBody, /Weather Example/)
  assert.match(enBody, /A Stationary Distribution Is the Eigenvalue-1 Direction/)
  assert.match(enBody, /PageRank/)
  assert.match(enBody, /damping factor/)
  assert.match(enBody, /MCMC/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Course Staff|changelog/)
  assert.doesNotMatch(zhBody, /A graph, at an abstract level|Suppose we want to build|Page Rank is a straightforward algorithm/)
  assert.doesNotMatch(enBody, /无向图|稳定分布|复习问题/)
})

test('markov chains module markdown renders formulas without raw delimiters', () => {
  const markovModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'markov-chains')
  assert.ok(markovModule)

  const source = markovModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const objectiveSource = markovModule.learningObjectives.map((objective) => objective['zh-CN']).join('\n\n')
  const conceptSource = markovModule.concepts
    .map((concept) => `${concept.plainExplanation['zh-CN']}\n\n${concept.numericalExample['zh-CN']}`)
    .join('\n\n')
  const quizSource = markovModule.quizzes
    .map((quiz) => `${quiz.prompt['zh-CN']}\n\n${quiz.explanation['zh-CN']}`)
    .join('\n\n')
  const misconceptionSource = markovModule.misconceptions
    .map((misconception) => `${misconception.correction['zh-CN']}\n\n${misconception.example['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(`${objectiveSource}\n\n${conceptSource}\n\n${source}\n\n${quizSource}\n\n${misconceptionSource}`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('finite difference module preserves lecture coverage with bilingual repair and inline step-size lab', () => {
  const finiteModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'finite-difference-methods')
  assert.ok(finiteModule)

  assert.equal(finiteModule.title['zh-CN'], '有限差分方法')
  assert.equal(finiteModule.title.en, 'Finite Difference Methods')
  assert.ok(finiteModule.learningObjectives.length >= 5)
  assert.ok(finiteModule.concepts.length >= 3)
  assert.ok(finiteModule.quizzes.length >= 3)
  assert.ok(finiteModule.misconceptions.length >= 3)
  assert.ok(finiteModule.labs.some((lab) => lab.componentName === 'FiniteDifferenceLab'))
  assert.ok(finiteModule.sections.some((section) => section.labIds?.includes('finite-difference-error-lab')))

  const sectionIds = finiteModule.sections.map((section) => section.id)
  assert.ok(sectionIds.includes('finite-difference-methods-derivative-from-samples'))
  assert.ok(sectionIds.includes('finite-difference-methods-three-stencils'))
  assert.ok(sectionIds.includes('finite-difference-methods-step-size-error'))
  assert.ok(sectionIds.includes('finite-difference-methods-gradient-checking'))
  assert.ok(sectionIds.includes('finite-difference-methods-jacobian'))
  assert.ok(sectionIds.includes('finite-difference-methods-review-questions'))

  const zhBody = finiteModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = finiteModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /前向差分/)
  assert.match(zhBody, /后向差分/)
  assert.match(zhBody, /中心差分/)
  assert.match(zhBody, /截断误差/)
  assert.match(zhBody, /相消误差/)
  assert.match(zhBody, /f\(x\)=2x\^2\+15x\+1/)
  assert.match(zhBody, /gradient check/)
  assert.match(zhBody, /Jacobian/)
  assert.match(zhBody, /\/math-lab\/cs357-assets\/figs\/finite_diff_errors\.png/)
  assert.match(enBody, /Forward difference/)
  assert.match(enBody, /Backward difference/)
  assert.match(enBody, /Central difference/)
  assert.match(enBody, /roundoff and cancellation/)
  assert.match(enBody, /gradient check/i)
  assert.match(enBody, /Jacobian approximation/)
  assert.match(enBody, /Black-box model debugging/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Course Staff|changelog/)
  assert.doesNotMatch(zhBody, /For a given smooth function|Using a similar approach|Assume .*we are trying/)
  assert.doesNotMatch(enBody, /有限差分|复习问题|学习目标/)
})

test('finite difference module markdown renders formulas without raw delimiters', () => {
  const finiteModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'finite-difference-methods')
  assert.ok(finiteModule)

  const source = finiteModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const objectiveSource = finiteModule.learningObjectives.map((objective) => objective['zh-CN']).join('\n\n')
  const conceptSource = finiteModule.concepts
    .map((concept) => `${concept.plainExplanation['zh-CN']}\n\n${concept.numericalExample['zh-CN']}`)
    .join('\n\n')
  const quizSource = finiteModule.quizzes
    .map((quiz) => `${quiz.prompt['zh-CN']}\n\n${quiz.explanation['zh-CN']}`)
    .join('\n\n')
  const misconceptionSource = finiteModule.misconceptions
    .map((misconception) => `${misconception.correction['zh-CN']}\n\n${misconception.example['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(`${objectiveSource}\n\n${conceptSource}\n\n${source}\n\n${quizSource}\n\n${misconceptionSource}`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('nonlinear equations module preserves lecture coverage with bilingual repair and inline root-finding lab', () => {
  const nonlinearModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'nonlinear-equations')
  assert.ok(nonlinearModule)

  assert.equal(nonlinearModule.title['zh-CN'], '求解非线性方程')
  assert.equal(nonlinearModule.title.en, 'Solving Nonlinear Equations')
  assert.ok(nonlinearModule.learningObjectives.length >= 5)
  assert.ok(nonlinearModule.concepts.length >= 3)
  assert.ok(nonlinearModule.quizzes.length >= 3)
  assert.ok(nonlinearModule.misconceptions.length >= 3)
  assert.ok(nonlinearModule.labs.some((lab) => lab.componentName === 'NonlinearEquationsLab'))
  assert.ok(nonlinearModule.sections.some((section) => section.labIds?.includes('nonlinear-equations-root-finding-lab')))

  const sectionIds = nonlinearModule.sections.map((section) => section.id)
  assert.ok(sectionIds.includes('nonlinear-equations-root-of-a-function'))
  assert.ok(sectionIds.includes('nonlinear-equations-convergence-and-cost'))
  assert.ok(sectionIds.includes('nonlinear-equations-bisection-method'))
  assert.ok(sectionIds.includes('nonlinear-equations-newton-and-secant-methods'))
  assert.ok(sectionIds.includes('nonlinear-equations-nonlinear-system-of-equations'))
  assert.ok(sectionIds.includes('nonlinear-equations-review-questions'))

  const zhBody = nonlinearModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = nonlinearModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /二分法/)
  assert.match(zhBody, /Newton 法/)
  assert.match(zhBody, /割线法/)
  assert.match(zhBody, /Jacobian/)
  assert.match(zhBody, /x\^3-x-1/)
  assert.match(zhBody, /多维 Newton/)
  assert.match(zhBody, /隐式层/)
  assert.match(zhBody, /\/math-lab\/cs357-assets\/figs\/cubic\.png/)
  assert.match(enBody, /Bisection Method/)
  assert.match(enBody, /Newton's method/)
  assert.match(enBody, /secant method/)
  assert.match(enBody, /Jacobian/)
  assert.match(enBody, /implicit layers/)
  assert.match(enBody, /Production solvers/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Course Staff|changelog/)
  assert.doesNotMatch(zhBody, /Linear functions are trivial|The bisection method is the simplest|What is the convergence rate/)
  assert.doesNotMatch(enBody, /二分法|割线法|复习问题|学习目标/)
})

test('nonlinear equations module markdown renders formulas without raw delimiters', () => {
  const nonlinearModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'nonlinear-equations')
  assert.ok(nonlinearModule)

  const source = nonlinearModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const objectiveSource = nonlinearModule.learningObjectives.map((objective) => objective['zh-CN']).join('\n\n')
  const conceptSource = nonlinearModule.concepts
    .map((concept) => `${concept.plainExplanation['zh-CN']}\n\n${concept.numericalExample['zh-CN']}`)
    .join('\n\n')
  const quizSource = nonlinearModule.quizzes
    .map((quiz) => `${quiz.prompt['zh-CN']}\n\n${quiz.explanation['zh-CN']}`)
    .join('\n\n')
  const misconceptionSource = nonlinearModule.misconceptions
    .map((misconception) => `${misconception.correction['zh-CN']}\n\n${misconception.example['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(`${objectiveSource}\n\n${conceptSource}\n\n${source}\n\n${quizSource}\n\n${misconceptionSource}`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('optimization module preserves lecture coverage with bilingual repair and inline gradient lab', () => {
  const optimizationModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'optimization')
  assert.ok(optimizationModule)

  assert.equal(optimizationModule.title['zh-CN'], '优化')
  assert.equal(optimizationModule.title.en, 'Optimization')
  assert.ok(optimizationModule.learningObjectives.length >= 6)
  assert.ok(optimizationModule.concepts.length >= 3)
  assert.ok(optimizationModule.quizzes.length >= 3)
  assert.ok(optimizationModule.misconceptions.length >= 3)
  assert.ok(optimizationModule.labs.some((lab) => lab.componentName === 'MathGradientLab'))
  assert.ok(optimizationModule.visuals.some((visual) => visual.id === 'gradient-descent-video'))
  assert.ok(optimizationModule.sections.some((section) => section.visualIds?.includes('gradient-descent-video')))
  assert.ok(optimizationModule.sections.some((section) => section.labIds?.includes('optimization-gradient-lab')))

  const sectionIds = optimizationModule.sections.map((section) => section.id)
  assert.deepEqual(sectionIds, [
    'optimization-learning-objectives',
    'optimization-problem-statement',
    'optimization-local-global',
    'optimization-one-dimensional-tests',
    'optimization-golden-section',
    'optimization-newton-1d',
    'optimization-gradient-hessian',
    'optimization-steepest-descent',
    'optimization-newton-nd',
    'optimization-ml-practice',
    'optimization-review-questions',
  ])

  const zhBody = optimizationModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = optimizationModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /无约束优化/)
  assert.match(zhBody, /约束优化/)
  assert.match(zhBody, /局部最小值/)
  assert.match(zhBody, /黄金分割搜索/)
  assert.match(zhBody, /12\.36/)
  assert.match(zhBody, /一维 Newton/)
  assert.match(zhBody, /Hessian/)
  assert.match(zhBody, /最速下降/)
  assert.match(zhBody, /线搜索/)
  assert.match(zhBody, /小批量梯度下降/)
  assert.match(zhBody, /\/math-lab\/cs357-assets\/figs\/ternery_search_optimization\.png/)
  assert.match(zhBody, /\/math-lab\/cs357-assets\/figs\/steepest_contour_map_1\.png/)
  assert.match(enBody, /Unconstrained optimization/)
  assert.match(enBody, /Golden Section Search/)
  assert.match(enBody, /Newton Optimization in 1-D/)
  assert.match(enBody, /Multidimensional Optimization/)
  assert.match(enBody, /Steepest Descent/)
  assert.match(enBody, /Hessian Linear System/)
  assert.match(enBody, /Feature scaling/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Course Staff|changelog|site\.baseurl/)
  assert.doesNotMatch(zhBody, /The goal of optimization is|First, let's learn|Consider running Golden Section|Using Taylor Expansion/)
  assert.doesNotMatch(enBody, /学习目标|复习问题|最速下降|黄金分割搜索/)
})

test('optimization module markdown renders formulas without raw delimiters', () => {
  const optimizationModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'optimization')
  assert.ok(optimizationModule)

  const sectionSource = optimizationModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const objectiveSource = optimizationModule.learningObjectives.map((objective) => objective['zh-CN']).join('\n\n')
  const conceptSource = optimizationModule.concepts
    .map((concept) => `${concept.plainExplanation['zh-CN']}\n\n${concept.geometricIntuition['zh-CN']}\n\n${concept.numericalExample['zh-CN']}`)
    .join('\n\n')
  const quizSource = optimizationModule.quizzes
    .map((quiz) => `${quiz.prompt['zh-CN']}\n\n${quiz.explanation['zh-CN']}`)
    .join('\n\n')
  const misconceptionSource = optimizationModule.misconceptions
    .map((misconception) => `${misconception.correction['zh-CN']}\n\n${misconception.example['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(`${objectiveSource}\n\n${conceptSource}\n\n${sectionSource}\n\n${quizSource}\n\n${misconceptionSource}`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('taylor approximation utilities expose expected error trends', () => {
  const degreeOne = evaluateTaylorApproximation('sin', 0.8, 0, 1)
  const degreeThree = evaluateTaylorApproximation('sin', 0.8, 0, 3)
  const degreeFive = evaluateTaylorApproximation('sin', 0.8, 0, 5)
  assert.ok(degreeThree.error < degreeOne.error)
  assert.ok(degreeFive.error < degreeThree.error)

  const expApprox = evaluateTaylorApproximation('exp', 1.1, 0, 5)
  assert.ok(expApprox.remainderBound >= expApprox.error)
  assert.ok(expApprox.nextTermEstimate > 0)
})

test('beginner foundation utilities expose vector, local change, and distribution trends', () => {
  const closeVectors = evaluateFeatureVectorStory({
    left: [2, 5, 1],
    right: [3, 4, 1],
    matrix: [[1, 0.5], [0.2, 1]],
  })
  const farVectors = evaluateFeatureVectorStory({
    left: [2, 5, 1],
    right: [8, 1, 4],
    matrix: [[1, 0.5], [0.2, 1]],
  })

  assert.ok(closeVectors.distance < farVectors.distance)
  assert.ok(closeVectors.cosine > farVectors.cosine)
  assert.deepEqual(closeVectors.difference, [1, -1, 0])
  assert.deepEqual(closeVectors.projectedLeft.map((value) => Number(value.toFixed(2))), [4.5, 5.4])

  const wideChange = evaluateLocalChangeStory({ x: 1, h: 0.8, learningRate: 0.2 })
  const narrowChange = evaluateLocalChangeStory({ x: 1, h: 0.05, learningRate: 0.2 })
  assert.ok(narrowChange.secantError < wideChange.secantError)
  assert.equal(Number(narrowChange.derivative.toFixed(6)), 1)
  assert.equal(narrowChange.currentLoss, narrowChange.y)
  assert.ok(narrowChange.nextLoss < narrowChange.currentLoss)
  assert.ok(narrowChange.hRows.at(-1)!.error < narrowChange.hRows[0]!.error)
  assert.equal(narrowChange.learningRateScenarios.length, 3)

  const backprop = evaluateBackpropBlockStory({ x: 1.2, weight: 1.4, bias: -0.3, target: 0.8 })
  assert.ok(Math.abs(backprop.dLossDWeight - backprop.numericalWeightGradient) < 1e-5)
  assert.equal(Number(backprop.dLossDBias.toFixed(8)), Number(backprop.dLossDZ.toFixed(8)))
  assert.equal(Number(backprop.dLossDWeight.toFixed(8)), Number((backprop.dLossDZ * backprop.x).toFixed(8)))

  const uniform = evaluateDistributionBuilder({ kind: 'uniform', sampleCount: 600, seed: 11, targetBin: 2 })
  const normal = evaluateDistributionBuilder({ kind: 'normal', sampleCount: 600, seed: 11, targetBin: 2 })
  const binomial = evaluateDistributionBuilder({ kind: 'binomial', sampleCount: 600, seed: 11, targetBin: 4 })

  assert.equal(uniform.samples.length, 600)
  assert.equal(evaluateDistributionBuilder({ kind: 'uniform', sampleCount: 600, seed: 11, targetBin: 2 }).samples[0], uniform.samples[0])
  assert.equal(uniform.bins.reduce((sum, bin) => sum + bin.count, 0), 600)
  assert.ok(Math.abs(uniform.probabilities.reduce((sum, value) => sum + value, 0) - 1) < 1e-12)
  assert.ok(Math.abs(uniform.theoreticalProbabilities.reduce((sum, value) => sum + value, 0) - 1) < 1e-12)
  assert.ok(uniform.maxFrequencyError >= 0)
  assert.ok(uniform.stabilityScore >= 0 && uniform.stabilityScore <= 1)
  assert.ok(Math.abs(uniform.targetFrequency - uniform.targetProbability) === uniform.targetError)
  assert.ok(normal.variance < uniform.variance)
  assert.ok(binomial.mean > uniform.mean)
  assert.ok(uniform.targetFrequency >= 0 && uniform.targetFrequency <= 1)

  const bayes = evaluateConditionalBayes({
    priorSpam: 0.08,
    signalGivenSpam: 0.82,
    signalGivenNotSpam: 0.12,
    populationSize: 1000,
  })
  assert.ok(Math.abs(bayes.evidence - (0.08 * 0.82 + 0.92 * 0.12)) < 1e-12)
  assert.ok(Math.abs(bayes.posteriorSpam - 0.3727272727272727) < 1e-10)
  assert.ok(bayes.ignoredBaseRatePosterior > bayes.posteriorSpam)
  assert.equal(bayes.spamCount + bayes.notSpamCount, 1000)
  assert.equal(bayes.signalCount, bayes.signalSpamCount + bayes.signalNotSpamCount)
})

test('monte carlo utilities expose reproducible sampling and expected error scaling', () => {
  const stableConfig = lcgConfigForKind('stable', 17)
  const shortConfig = lcgConfigForKind('short-cycle', 17)
  const shortSequence = lcgSequence(shortConfig, 6)
  const shortPeriod = findLcgPeriod(shortConfig, 100)

  assert.equal(shortSequence.length, 6)
  assert.ok(shortSequence.every((value) => value > 0 && value < shortConfig.modulus))
  assert.ok(shortPeriod && shortPeriod < shortConfig.modulus)
  assert.equal(findLcgPeriod(stableConfig, 500), undefined)

  const se100 = monteCarloPiStandardError(100)
  const se400 = monteCarloPiStandardError(400)
  assert.ok(se400 < se100)
  assert.ok(Math.abs(se100 / se400 - 2) < 1e-12)

  const piEstimate = estimatePiMonteCarlo({
    samples: 3000,
    seed: 17,
    generatorKind: 'stable',
    visiblePoints: 50,
  })
  assert.equal(piEstimate.points.length, 50)
  assert.ok(piEstimate.estimate > 2.9 && piEstimate.estimate < 3.35)
  assert.ok(piEstimate.standardError > 0)

  const integralEstimate = estimateIntegralXSquared(8000, 23, 'stable')
  assert.ok(integralEstimate.absoluteError < 0.02)
})

test('lu utilities expose factorization, solve residuals, pivot warnings, and reuse savings', () => {
  const evaluation = evaluateLu2x2({
    a11: 4,
    a12: 2,
    a21: 3,
    a22: 5,
    b1: 6,
    b2: 7,
  })

  assert.equal(evaluation.multiplier, 0.75)
  assert.equal(evaluation.schurComplement, 3.5)
  assert.ok(Math.abs(evaluation.x[0] - 8 / 7) < 1e-12)
  assert.ok(Math.abs(evaluation.x[1] - 5 / 7) < 1e-12)
  assert.ok(evaluation.residualNorm < 1e-12)

  const pivotCandidate = evaluateLu2x2({
    a11: 0.25,
    a12: 2,
    a21: 3,
    a22: 5,
    b1: 6,
    b2: 7,
  }, 0.08)
  assert.equal(pivotCandidate.needsPivot, true)

  const pivoted = evaluateLup2x2({
    a11: 0.25,
    a12: 2,
    a21: 3,
    a22: 5,
    b1: 6,
    b2: 7,
  })
  assert.equal(pivoted.pivoted, true)
  assert.deepEqual(pivoted.permutation, [[0, 1], [1, 0]])
  assert.ok(Math.abs(pivoted.determinant - (-4.75)) < 1e-12)
  assert.ok(pivoted.residualNorm < 1e-12)

  const nearSingular = evaluateLu2x2({
    a11: 4,
    a12: 2,
    a21: 3,
    a22: 1.5,
    b1: 6,
    b2: 7,
  }, 0.08)
  assert.equal(nearSingular.singular, true)

  const oneRhs = estimateLuReuseCost(160, 1)
  const sixRhs = estimateLuReuseCost(160, 6)
  assert.ok(sixRhs.factorOnceCost < sixRhs.refactorEachSolveCost)
  assert.ok(sixRhs.speedup > oneRhs.speedup)
})

test('condition number utilities expose sensitivity trends and residual-error bounds', () => {
  assert.equal(formatConditionAngleDegrees(35), '35')
  assert.equal(formatConditionAngleDegrees(0.5), '0.50')
  assert.equal(formatConditionAngleDegrees(0.005), '0.005')

  const wellConditioned = makeColumnMatrix(80, 1)
  const illConditioned = makeColumnMatrix(5, 1)

  assert.ok(conditionNumber2x2(illConditioned) > conditionNumber2x2(wellConditioned))

  const stable = evaluateConditioning({
    columnAngleDegrees: 80,
    secondColumnScale: 1,
    perturbationPower: -6,
    perturbationAngleDegrees: 90,
    inputDigits: 16,
  })
  const sensitive = evaluateConditioning({
    columnAngleDegrees: 5,
    secondColumnScale: 1,
    perturbationPower: -6,
    perturbationAngleDegrees: 90,
    inputDigits: 16,
  })

  assert.ok(sensitive.conditionNumber > stable.conditionNumber)
  assert.ok(sensitive.relativeOutputError > stable.relativeOutputError)
  assert.ok(sensitive.errorBound >= sensitive.relativeOutputError)
  assert.ok(Math.abs(sensitive.relativeResidual - sensitive.relativeInputError) < 1e-12)
  assert.ok(sensitive.relativeSolveResidual < 1e-12)
  assert.ok(sensitive.expectedDigits < stable.expectedDigits)
})

test('eigen power iteration utility exposes spectral gap, residual, and sign-flip behavior', () => {
  const early = evaluatePowerIteration({
    matrixKind: 'well-separated',
    iterations: 2,
    initialAngleRadians: 0.6,
  })
  const later = evaluatePowerIteration({
    matrixKind: 'well-separated',
    iterations: 12,
    initialAngleRadians: 0.6,
  })
  const slowGap = evaluatePowerIteration({
    matrixKind: 'slow-gap',
    iterations: 12,
    initialAngleRadians: 0.6,
  })
  const signFlip = evaluatePowerIteration({
    matrixKind: 'sign-flip',
    iterations: 6,
    initialAngleRadians: 0.6,
  })

  assert.equal(later.iterates.length, 13)
  assert.ok(later.residualNorm < early.residualNorm)
  assert.ok(Math.abs(later.rayleighQuotient - later.dominantEigenvalue) < 0.01)
  assert.ok(slowGap.spectralRatio > later.spectralRatio)
  assert.ok(signFlip.dominantEigenvalue < 0)
  assert.equal(signFlip.iterates.length, 7)
})

test('markov chain utilities expose column-stochastic updates, stationarity, and PageRank damping', () => {
  const weather = buildWeatherTransition(0)
  const rainyStart = [0, 1, 0]
  const rainyHistory = iterateMarkovChain(weather, rainyStart, 1)

  assert.ok(maxColumnSumError(weather) < 1e-12)
  assert.deepEqual(rainyHistory[1]!.map((value) => Number(value.toFixed(12))), [0.2, 0.4, 0.4])

  const stickyWeather = buildWeatherTransition(0.6)
  assert.ok(maxColumnSumError(stickyWeather) < 1e-12)
  assert.ok(stickyWeather[0]![0]! > weather[0]![0]!)

  const pageRank = buildPageRankTransition(0.85)
  assert.ok(maxColumnSumError(pageRank.transitionMatrix) < 1e-12)
  assert.ok(pageRank.transitionMatrix.every((row) => row.every((value) => value > 0)))

  const stationary = stationaryDistributionPower(pageRank.transitionMatrix)
  const totalProbability = stationary.vector.reduce((acc, value) => acc + value, 0)
  assert.ok(Math.abs(totalProbability - 1) < 1e-12)
  assert.ok(stationary.residual < 1e-10)

  const history = iterateMarkovChain(pageRank.transitionMatrix, [1, 0, 0, 0, 0, 0], 20)
  assert.ok(l1Distance(history[20]!, stationary.vector) < l1Distance(history[0]!, stationary.vector))
})

test('finite difference utilities expose stencil accuracy and gradient/Jacobian trends', () => {
  const quadratic = (x: number) => 2 * x ** 2 + 15 * x + 1

  assert.equal(finiteDifferenceDerivative(quadratic, 10, 0.01, 'forward').toFixed(2), '55.02')
  assert.equal(finiteDifferenceDerivative(quadratic, 10, 0.01, 'backward').toFixed(2), '54.98')
  assert.equal(finiteDifferenceDerivative(quadratic, 10, 0.01, 'central').toFixed(2), '55.00')

  const forwardWide = evaluateFiniteDifference({
    functionKind: 'exp-shift',
    method: 'forward',
    x: 0.4,
    h: 1e-1,
  })
  const forwardNarrow = evaluateFiniteDifference({
    functionKind: 'exp-shift',
    method: 'forward',
    x: 0.4,
    h: 1e-4,
  })
  const centralNarrow = evaluateFiniteDifference({
    functionKind: 'exp-shift',
    method: 'central',
    x: 0.4,
    h: 1e-4,
  })
  const tiny = evaluateFiniteDifference({
    functionKind: 'exp-shift',
    method: 'forward',
    x: 0.4,
    h: 1e-12,
  })

  assert.ok(forwardNarrow.absoluteError < forwardWide.absoluteError)
  assert.ok(centralNarrow.absoluteError < forwardNarrow.absoluteError)
  assert.ok(tiny.roundingEstimate > forwardNarrow.roundingEstimate)
  assert.equal(centralNarrow.functionEvaluations, 2)
  assert.equal(forwardNarrow.functionEvaluations, 1)

  const gradientForward = evaluateLectureGradient(0.05, 'forward')
  const gradientCentral = evaluateLectureGradient(0.05, 'central')
  assert.ok(gradientCentral.errorNorm < gradientForward.errorNorm)
  assert.deepEqual(gradientForward.approximation.map((value) => Number(value.toFixed(4))), [14.985, 74.4575])

  const jacobianForward = evaluateLectureJacobian(0.1, 'forward')
  const jacobianCentral = evaluateLectureJacobian(0.1, 'central')
  assert.deepEqual(jacobianForward.approximation.map((row) => row.map((value) => Number(value.toFixed(1)))), [
    [54.2, 18],
    [3, 7],
  ])
  assert.ok(jacobianCentral.maxError < jacobianForward.maxError)
})

test('nonlinear equation utilities expose bisection, Newton, secant, and system Newton trends', () => {
  const early = evaluateNonlinearRootFinding({
    functionKind: 'cubic',
    iterations: 2,
    newtonStart: 1,
    secantPrevious: 2,
  })
  const later = evaluateNonlinearRootFinding({
    functionKind: 'cubic',
    iterations: 6,
    newtonStart: 1,
    secantPrevious: 2,
  })

  assert.ok(later.bisection.intervalWidth < early.bisection.intervalWidth)
  assert.ok(later.bisection.residual < early.bisection.residual)
  assert.ok(later.newton.residual < later.bisection.residual)
  assert.ok(later.secant.residual < early.secant.residual)
  assert.ok(Math.abs(later.newton.approximation - later.trueRoot) < 1e-8)
  assert.equal(later.secant.functionEvaluations, 8)

  const flat = evaluateNonlinearRootFinding({
    functionKind: 'flat',
    iterations: 6,
    newtonStart: 1,
    secantPrevious: -1,
  })
  assert.ok(flat.newton.residual > later.newton.residual)

  const firstSystemStep = evaluateNewtonSystemStep({ x: 1, y: 1 })
  assert.deepEqual(firstSystemStep.step.map((value) => Number(value.toFixed(2))), [-1.5, 0.25])
  assert.deepEqual(firstSystemStep.next.map((value) => Number(value.toFixed(2))), [-0.5, 1.25])
  assert.ok(firstSystemStep.nextResidualNorm > firstSystemStep.residualNorm)

  const thirdSystemStep = evaluateNewtonSystemStep({ x: -0.08333333, y: 1.04166667 })
  assert.ok(thirdSystemStep.nextResidualNorm < thirdSystemStep.residualNorm)
})

test('sparse matrix utilities expose COO, CSR, matvec, and storage estimates', () => {
  const coo = denseToCoo(sparseLectureMatrix)
  const csr = denseToCsr(sparseLectureMatrix)

  assert.equal(coo.entries.length, 12)
  assert.deepEqual(coo.entries[0], { row: 0, column: 0, value: 1 })
  assert.deepEqual(coo.entries[coo.entries.length - 1], { row: 4, column: 4, value: 12 })
  assert.deepEqual(csr.rowptr, [0, 2, 5, 9, 11, 12])
  assert.deepEqual(csr.col, [0, 3, 0, 1, 3, 0, 2, 3, 4, 2, 3, 4])
  assert.deepEqual(csr.data, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  assert.deepEqual(csrMatVec(csr, [1, 2, 3, 4, 5]), [9, 31, 104, 74, 60])

  const estimate = estimateSparseStorage({ size: 1000, nonzerosPerRow: 4 })
  assert.equal(estimate.nnz, 4000)
  assert.equal(estimate.denseElements, 1_000_000)
  assert.equal(estimate.csrElements, 9001)
  assert.equal(estimate.density, 0.004)
  assert.ok(estimate.denseBytes > estimate.csrBytes)
  assert.ok(estimate.denseMatVecOps > estimate.sparseMatVecOps)
})

test('markdown renderer supports formulas, tables, code blocks, images, and callouts', () => {
  const html = renderMarkdownWithMath(`
## Heading

Inline math \\(x^2\\), dollar math $y = mx+b$, and display math:

<div>\\[
B = Q R
\\]</div>

\\[
A = U\\Sigma V^T
\\]

| Method | Error |
| --- | --- |
| central | low |

\`\`\`python
print("ok")
\`\`\`

![figure](/manim/math-lab/vector-dot-product.svg)

<details>
  <summary><strong>Answer</strong></summary>
  Keep the full worked solution visible on demand.
</details>

> Review this numerical assumption.
`)

  assert.match(html, /katex/)
  assert.match(html, /<table>/)
  assert.match(html, /<pre><code/)
  assert.match(html, /<img/)
  assert.match(html, /<details>/)
  assert.match(html, /<blockquote>/)
})

test('public asset paths are rebased for GitHub Pages project deployments', () => {
  assert.equal(withPublicBase('/math-lab/cs357-assets/figs/vector_example.png', '/ML_tutorial_Site/'), '/ML_tutorial_Site/math-lab/cs357-assets/figs/vector_example.png')
  assert.equal(withPublicBase('/manim/math-lab/vector-dot-product.mp4', '/ML_tutorial_Site/'), '/ML_tutorial_Site/manim/math-lab/vector-dot-product.mp4')
  assert.equal(withPublicBase('/ML_tutorial_Site/math-lab/cs357-assets/figs/vector_example.png', '/ML_tutorial_Site/'), '/ML_tutorial_Site/math-lab/cs357-assets/figs/vector_example.png')
  assert.equal(withPublicBase('https://example.com/asset.png', '/ML_tutorial_Site/'), 'https://example.com/asset.png')
  assert.equal(withPublicBase('#section', '/ML_tutorial_Site/'), '#section')
})

test('markdown renderer sanitizes raw html while preserving teaching markup', () => {
  const html = renderMarkdownWithMath(`
<img src="/math-lab/cs357-assets/figs/vector_example.png" alt="Vector" width="300" height="200" onerror="alert(1)" style="color: red" />
<a href="javascript:alert(1)" title="bad">unsafe link</a>
<a href="https://example.com/math" title="safe">safe link</a>
<script>alert(1)</script>
<iframe src="https://example.com"></iframe>
<style>.bad { color: red }</style>
<details open>
  <summary><strong>Answer</strong></summary>
  <div class="figure" style="color: red"><span id="safe-note">Allowed teaching note</span></div>
</details>
`)

  assert.match(html, /<img/)
  assert.match(html, /src="\/math-lab\/cs357-assets\/figs\/vector_example\.png"/)
  assert.match(html, /alt="Vector"/)
  assert.match(html, /width="300"/)
  assert.match(html, /height="200"/)
  assert.doesNotMatch(html, /onerror/)
  assert.doesNotMatch(html, /style=/)
  assert.doesNotMatch(html, /javascript:/)
  assert.match(html, /<a title="bad">unsafe link<\/a>/)
  assert.match(html, /<a href="https:\/\/example\.com\/math" title="safe">safe link<\/a>/)
  assert.doesNotMatch(html, /<script/)
  assert.doesNotMatch(html, /<iframe/)
  assert.doesNotMatch(html, /<style/)
  assert.match(html, /<details open>/)
  assert.match(html, /<summary><strong>Answer<\/strong><\/summary>/)
  assert.match(html, /<div class="figure"><span id="safe-note">Allowed teaching note<\/span><\/div>/)
})

test('markdown renderer strips xmp raw-text html payloads', () => {
  const html = renderMarkdownWithMath(`
<xmp>
<script>alert(1)</script>
<img src=x onerror=alert(1)>
</xmp>
`)

  assert.doesNotMatch(html, /<\/?xmp/i)
  assert.doesNotMatch(html, /<script/i)
  assert.doesNotMatch(html, /onerror/i)
  assert.doesNotMatch(html, /<img src=x/i)
})

test('markdown renderer escapes html payloads inside code blocks', () => {
  const html = renderMarkdownWithMath(`
\`\`\`html
<img src=x onerror=alert(1)>
\`\`\`
`)

  assert.match(html, /<pre><code/)
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/)
  assert.doesNotMatch(html, /<img src=x/i)
})

test('markdown renderer does not parse math delimiters inside code blocks', () => {
  const html = renderMarkdownWithMath(`
\`\`\`python
price = "$5"
print("not math: $x$")
\`\`\`

Actual math: $x^2$
`)

  assert.match(html, /not math: \$x\$/)
  assert.match(html, /katex/)
})

test('markdown renderer normalizes double-escaped math delimiters', () => {
  const html = renderMarkdownWithMath(String.raw`
Inline double escaped \\(x^2\\), normal inline \(y = mx+b\), and a block:

\\[
A = U\Sigma V^T
\\]
`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\{1,2}[\[\]\(\)]/)
})

test('markdown renderer supports legacy single-dollar display blocks', () => {
  const html = renderMarkdownWithMath(`
Legacy block:

$
\\begin{align}
f(x) &= f(a) + f'(a)(x-a)
\\end{align}
$
`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\$\s*<br|\\begin/)
})

test('diagnostic scoring recommends the earliest weak math foundation module', () => {
  const allCorrect = Object.fromEntries(
    diagnosticQuestions.map((question) => [question.id, question.answer]),
  )
  const strong = scoreDiagnostic(allCorrect)
  assert.equal(strong.recommendedStartModuleId, 'beginner-linear-algebra')
  assert.equal(strong.weakConcepts.length, 0)

  const weakLinearAlgebra = scoreDiagnostic({ ...allCorrect, 'diag-dot': 'elementwise' })
  assert.equal(weakLinearAlgebra.recommendedStartModuleId, 'beginner-linear-algebra')
  assert.ok(weakLinearAlgebra.weakConcepts.includes('dot-product'))

  const weakCalculus = scoreDiagnostic({ ...allCorrect, 'diag-derivative': 'global-average' })
  assert.equal(weakCalculus.recommendedStartModuleId, 'calculus-functions-rate-change')

  const weakProbability = scoreDiagnostic({ ...allCorrect, 'diag-entropy': 'coordinates' })
  assert.equal(weakProbability.recommendedStartModuleId, 'beginner-probability-distributions')
})

test('quiz scoring returns misconception feedback for incorrect answers', () => {
  const quiz = {
    id: 'sample-checkpoint',
    type: 'single-choice' as const,
    prompt: { 'zh-CN': '哪个方向是下降方向？', en: 'Which direction descends?' },
    choices: [
      { id: 'correct', label: { 'zh-CN': '负梯度', en: 'Negative gradient' } },
      { id: 'distractor', label: { 'zh-CN': '正梯度', en: 'Positive gradient' } },
    ],
    answer: 'correct',
    explanation: { 'zh-CN': '最小化沿负梯度移动。', en: 'Minimization moves along the negative gradient.' },
    misconceptionTags: ['gradient-direction'],
  }

  assert.equal(evaluateQuizAnswer(quiz, quiz.answer as string).correct, true)
  const incorrect = evaluateQuizAnswer(quiz, 'distractor')
  assert.equal(incorrect.correct, false)
  assert.deepEqual(incorrect.misconceptionTags, quiz.misconceptionTags)

  const summary = scoreQuiz([quiz], {
    [quiz.id]: quiz.answer as string,
  })
  assert.equal(summary.correct, 1)
  assert.equal(summary.total, 1)
})

test('math lab progress persists diagnostic, completion, and quiz attempts in storage', () => {
  const storage = createMemoryStorage()
  const diagnostic = scoreDiagnostic(
    Object.fromEntries(diagnosticQuestions.map((question) => [question.id, question.answer])),
  )
  const quizAttempt = {
    quizId: 'taylor-series-checkpoint',
    moduleId: 'taylor-series',
    selected: 'correct',
    correct: true,
    misconceptionTags: [],
    attemptedAt: '2026-05-05T00:00:00.000Z',
  }

  let progress = setDiagnosticResult(createDefaultProgress('2026-05-05T00:00:00.000Z'), diagnostic)
  progress = appendQuizAttempt(progress, quizAttempt)
  progress = markModuleComplete(progress, 'taylor-series')
  saveMathLabProgress(progress, storage)

  const reloaded = loadMathLabProgress(storage)
  assert.equal(reloaded.diagnosticResult?.recommendedStartModuleId, 'beginner-linear-algebra')
  assert.deepEqual(reloaded.completedModuleIds, ['taylor-series'])
  assert.equal(reloaded.quizAttempts.length, 1)
})

test('math lab progress serializes versioned route completion and sanitizes malformed legacy data', () => {
  const storage = createMemoryStorage()
  let progress = createDefaultProgress('2026-07-11T00:00:00.000Z')
  progress = markRouteModuleComplete(progress, 'math-to-code-pilot', 'math-to-code-v1', 'calculus-functions-rate-change')
  progress = markRouteModuleComplete(progress, 'math-to-code-pilot', 'math-to-code-v1', 'calculus-functions-rate-change')
  saveMathLabProgress(progress, storage)

  assert.deepEqual(loadMathLabProgress(storage).routeCompletions, {
    'math-to-code-pilot': {
      version: 'math-to-code-v1',
      completedModuleIds: ['calculus-functions-rate-change'],
    },
  })

  const legacy = createMemoryStorage({
    'ml-atlas:math-lab-progress:v1': JSON.stringify({
      completedModuleIds: ['taylor-series'],
      quizAttempts: [],
      weakConceptTags: [],
      mastery: [],
      updatedAt: '2026-01-01T00:00:00.000Z',
    }),
  })
  assert.deepEqual(loadMathLabProgress(legacy).completedModuleIds, ['taylor-series'])
  assert.deepEqual(loadMathLabProgress(legacy).routeCompletions, {})

  const malformed = createMemoryStorage({
    'ml-atlas:math-lab-progress:v1': JSON.stringify({
      completedModuleIds: [],
      routeCompletions: {
        'math-to-code-pilot': { version: 42, completedModuleIds: 'all' },
        'calculus-route': { version: 'v1', completedModuleIds: ['calculus-functions-rate-change', 7] },
      },
    }),
  })
  assert.deepEqual(loadMathLabProgress(malformed).routeCompletions, {
    'calculus-route': { version: 'v1', completedModuleIds: ['calculus-functions-rate-change'] },
  })
})
