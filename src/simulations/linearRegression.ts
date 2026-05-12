import type {
  ExperimentConfig,
  FitDiagnosticItem,
  FitDiagnostics,
  ModuleSimulation,
  MultivariateRegressionSample,
  PlotPoint,
  RegressionMeta,
  TrainingSnapshot,
} from '../types/ml'
import {
  californiaHousingRegressionMeta,
  californiaHousingSubset,
} from '../data/californiaHousingSubset.ts'

type LinearRegressionScenario =
  | 'linear'
  | 'curved'
  | 'multivariate'
  | 'polynomial'
  | 'overfit'
  | 'regularized'

type RegularizationType = 'none' | 'l1' | 'l2'

interface NormalizedStats {
  meanX: number
  meanY: number
  scaleX: number
  scaleY: number
}

interface FeatureStats {
  means: number[]
  scales: number[]
  meanY: number
  scaleY: number
}

interface PolynomialData {
  training: PlotPoint[]
  validation: PlotPoint[]
  all: PlotPoint[]
  meanX: number
  scaleX: number
  meanY: number
  scaleY: number
  meta?: RegressionMeta
}

interface PolynomialModel {
  weights: number[]
  bias: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function average(values: number[]) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function stddev(values: number[], mean: number) {
  if (!values.length) return 1
  const variance = average(values.map((value) => (value - mean) ** 2))
  return Math.sqrt(variance) || 1
}

function dot(left: number[], right: number[]) {
  return left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0)
}

function solveLinearSystem(matrix: number[][], vector: number[]) {
  const size = vector.length
  const augmented = matrix.map((row, index) => [...row, vector[index] ?? 0])

  for (let column = 0; column < size; column += 1) {
    let pivotRow = column
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(augmented[row]![column]!) > Math.abs(augmented[pivotRow]![column]!)) {
        pivotRow = row
      }
    }

    const pivot = augmented[pivotRow]![column] || 1e-8
    ;[augmented[column], augmented[pivotRow]] = [augmented[pivotRow]!, augmented[column]!]

    for (let entry = column; entry <= size; entry += 1) {
      augmented[column]![entry] = augmented[column]![entry]! / pivot
    }

    for (let row = 0; row < size; row += 1) {
      if (row === column) continue
      const factor = augmented[row]![column] ?? 0
      for (let entry = column; entry <= size; entry += 1) {
        augmented[row]![entry] = augmented[row]![entry]! - factor * augmented[column]![entry]!
      }
    }
  }

  return augmented.map((row) => row[size] ?? 0)
}

function createHousingSamples(
  noise: number,
  includeOutlier: boolean,
  outlierStrength: number,
  scenario: LinearRegressionScenario,
): PlotPoint[] {
  const baseSamples = [
    { x: 41, y: 102 },
    { x: 46, y: 111 },
    { x: 52, y: 121 },
    { x: 58, y: 132 },
    { x: 64, y: 141 },
    { x: 88, y: 176 },
    { x: 94, y: 187 },
    { x: 101, y: 199 },
    { x: 109, y: 212 },
    { x: 118, y: 226 },
    { x: 151, y: 272 },
    { x: 158, y: 284 },
    { x: 167, y: 298 },
    { x: 179, y: 315 },
    { x: 214, y: 354 },
    { x: 229, y: 371 },
  ]

  const noiseScale = noise * 22

  const adjusted = baseSamples.map((sample, index) => {
    const deterministicNoise =
      Math.sin(index * 1.43) * noiseScale + Math.cos(index * 0.64) * noiseScale * 0.4
    const curvedPremium =
      scenario === 'curved'
        ? Math.max(sample.x - 118, 0) ** 2 * 0.014 + Math.max(sample.x - 136, 0) * 0.18
        : 0

    return {
      x: sample.x,
      y: sample.y + deterministicNoise + curvedPremium,
      split: 'train' as const,
    }
  })

  if (includeOutlier) {
    adjusted.push({
      x: 126,
      y: 182 + outlierStrength,
      split: 'train',
    })
  }

  return adjusted
}

function normalizeSamples(samples: PlotPoint[]) {
  const meanX = average(samples.map((sample) => sample.x))
  const meanY = average(samples.map((sample) => sample.y))
  const scaleX = stddev(samples.map((sample) => sample.x), meanX)
  const scaleY = stddev(samples.map((sample) => sample.y), meanY)

  return {
    stats: { meanX, meanY, scaleX, scaleY },
    samples: samples.map((sample) => ({
      x: (sample.x - meanX) / scaleX,
      y: (sample.y - meanY) / scaleY,
    })),
  }
}

function toActualFit(stats: NormalizedStats, slopeNorm: number, interceptNorm: number) {
  const slope = (stats.scaleY * slopeNorm) / stats.scaleX
  const intercept = stats.meanY + stats.scaleY * interceptNorm - slope * stats.meanX
  return { slope, intercept }
}

function predictLine(area: number, slope: number, intercept: number) {
  return slope * area + intercept
}

function computeLineLoss(samples: PlotPoint[], slope: number, intercept: number) {
  const residuals = samples.map((sample) => predictLine(sample.x, slope, intercept) - sample.y)
  const mse = average(residuals.map((residual) => residual ** 2))
  const mae = average(residuals.map((residual) => Math.abs(residual)))
  return { mse, mae, residuals }
}

function statusKeyFor(
  step: number,
  loss: number,
  deltaLoss: number,
  gradientNorm: number,
  scenario: LinearRegressionScenario,
  includeOutlier: boolean,
) {
  if (step === 0) return 'initializing'
  if (gradientNorm > 0.9) return 'coarse-search'
  if (deltaLoss > 3.5) return 'settling'
  if (deltaLoss > 0.6) return 'refining'
  if (scenario === 'curved' || includeOutlier) {
    return loss > 120 ? 'capacity-limit' : 'refining'
  }
  return 'plateau'
}

function buildLineSnapshot(
  step: number,
  samples: PlotPoint[],
  stats: NormalizedStats,
  slopeNorm: number,
  interceptNorm: number,
  gradSlope: number,
  gradIntercept: number,
  stepSize: number,
  previousLoss: number | undefined,
  scenario: LinearRegressionScenario,
  includeOutlier: boolean,
): TrainingSnapshot {
  const fit = toActualFit(stats, slopeNorm, interceptNorm)
  const { mse, mae } = computeLineLoss(samples, fit.slope, fit.intercept)
  const highlightIndex = step % samples.length
  const highlightedSample = samples[highlightIndex] ?? samples[0]!
  const highlightedPrediction = predictLine(highlightedSample.x, fit.slope, fit.intercept)
  const residual = highlightedPrediction - highlightedSample.y
  const gradientNorm = Math.hypot(gradSlope, gradIntercept)
  const deltaLoss = previousLoss === undefined ? 0 : previousLoss - mse

  return {
    step,
    loss: mse,
    regressionSamples: samples,
    regressionFit: fit,
    derivedMetrics: {
      mse,
      trainMse: mse,
      mae,
      slope: fit.slope,
      intercept: fit.intercept,
      gradientNorm,
      stepSize,
      highlightIndex,
      statusKey: statusKeyFor(step, mse, deltaLoss, gradientNorm, scenario, includeOutlier),
      scenario,
      modelComplexity: 1,
      weightNorm: Math.abs(fit.slope),
      activeWeights: Math.abs(fit.slope) > 0.001 ? 1 : 0,
      regularizationPenalty: 0,
      weights: [fit.slope],
    },
    selectedObservation: {
      area: highlightedSample.x,
      actualPrice: highlightedSample.y,
      predictedPrice: highlightedPrediction,
      residual,
      mse: residual ** 2,
      mae: Math.abs(residual),
      gradientSlope: gradSlope,
      gradientIntercept: gradIntercept,
    },
    sampleLossBreakdown: samples.slice(0, 4).map((sample, index) => {
      const prediction = predictLine(sample.x, fit.slope, fit.intercept)
      return {
        id: `house-${index}`,
        label: `H${index + 1}`,
        target: sample.y,
        prediction,
        loss: (prediction - sample.y) ** 2,
      }
    }),
  }
}

function simulateSimpleLine(config: ExperimentConfig, scenario: LinearRegressionScenario) {
  const learningRate = clamp(Number(config.learningRate ?? 0.12), 0.01, 0.4)
  const epochs = Math.max(12, Math.round(Number(config.epochs ?? 40)))
  const datasetNoise = clamp(Number(config.datasetNoise ?? 0.08), 0, 0.35)
  const outlierStrength = clamp(Number(config.outlierStrength ?? 42), 0, 120)
  const includeOutlier = Boolean(config.includeOutlier ?? false)
  const initialSlope = Number(config.initialSlope ?? -0.25)
  const initialIntercept = Number(config.initialIntercept ?? 0.55)

  const samples = createHousingSamples(datasetNoise, includeOutlier, outlierStrength, scenario)
  const normalized = normalizeSamples(samples)

  let slopeNorm = initialSlope
  let interceptNorm = initialIntercept
  let previousLoss: number | undefined

  const snapshots: TrainingSnapshot[] = []

  for (let step = 0; step <= epochs; step += 1) {
    const errors = normalized.samples.map(
      (sample) => slopeNorm * sample.x + interceptNorm - sample.y,
    )
    const gradSlope =
      average(errors.map((error, index) => error * normalized.samples[index]!.x)) * 2
    const gradIntercept = average(errors) * 2
    const stepSize = Math.hypot(learningRate * gradSlope, learningRate * gradIntercept)

    const snapshot = buildLineSnapshot(
      step,
      samples,
      normalized.stats,
      slopeNorm,
      interceptNorm,
      gradSlope,
      gradIntercept,
      stepSize,
      previousLoss,
      scenario,
      includeOutlier,
    )

    snapshots.push(snapshot)
    previousLoss = snapshot.loss

    if (step === epochs) break

    slopeNorm -= learningRate * gradSlope
    interceptNorm -= learningRate * gradIntercept
  }

  return { snapshots }
}

function createMultivariateSamples(noise: number): MultivariateRegressionSample[] {
  const rows = [
    [46, 29],
    [51, 25],
    [57, 31],
    [63, 21],
    [86, 18],
    [92, 9],
    [96, 16],
    [104, 7],
    [111, 22],
    [118, 12],
    [151, 5],
    [158, 14],
    [166, 3],
    [173, 9],
    [184, 18],
    [218, 4],
    [231, 11],
    [246, 2],
  ]

  return rows.map(([area, age], index) => {
    const deterministicNoise =
      Math.sin(index * 1.17) * noise * 28 + Math.cos(index * 0.51) * noise * 14
    return {
      area,
      age,
      price:
        46 +
        area * 1.36 -
        age * 2.85 +
        Math.max(area - 170, 0) * 0.42 -
        Math.max(age - 24, 0) * 1.2 +
        deterministicNoise,
      split: 'train',
    }
  })
}

function normalizeFeatureRows(rows: number[][], yValues: number[]) {
  const columns = rows[0]?.length ?? 0
  const means = Array.from({ length: columns }, (_, column) =>
    average(rows.map((row) => row[column] ?? 0)),
  )
  const scales = means.map((mean, column) =>
    stddev(rows.map((row) => row[column] ?? 0), mean),
  )
  const meanY = average(yValues)
  const scaleY = stddev(yValues, meanY)

  return {
    stats: { means, scales, meanY, scaleY },
    rows: rows.map((row) => row.map((value, index) => (value - means[index]!) / scales[index]!)),
    y: yValues.map((value) => (value - meanY) / scaleY),
  }
}

function actualMultivariatePlane(stats: FeatureStats, weights: number[], bias: number) {
  const actualWeights = weights.map(
    (weight, index) => (stats.scaleY * weight) / (stats.scales[index] ?? 1),
  )
  const intercept =
    stats.meanY +
    stats.scaleY * bias -
    actualWeights.reduce((sum, weight, index) => sum + weight * (stats.means[index] ?? 0), 0)

  return { weights: actualWeights, intercept }
}

function predictMultivariate(sample: MultivariateRegressionSample, weights: number[], intercept: number) {
  return sample.area * (weights[0] ?? 0) + sample.age * (weights[1] ?? 0) + intercept
}

function simulateMultivariate(config: ExperimentConfig): ModuleSimulation {
  const learningRate = clamp(Number(config.learningRate ?? 0.08), 0.01, 0.22)
  const epochs = Math.max(18, Math.round(Number(config.epochs ?? 46)))
  const featureNoise = clamp(Number(config.featureNoise ?? config.datasetNoise ?? 0.1), 0, 0.45)
  const samples = createMultivariateSamples(featureNoise)
  const normalized = normalizeFeatureRows(
    samples.map((sample) => [sample.area, sample.age]),
    samples.map((sample) => sample.price),
  )

  let weights = [-0.32, 0.26]
  let bias = 0.16
  const snapshots: TrainingSnapshot[] = []

  for (let step = 0; step <= epochs; step += 1) {
    const predictions = normalized.rows.map((row) => dot(row, weights) + bias)
    const errors = predictions.map((prediction, index) => prediction - normalized.y[index]!)
    const gradWeights = weights.map(
      (_, featureIndex) =>
        average(errors.map((error, rowIndex) => error * normalized.rows[rowIndex]![featureIndex]!)) * 2,
    )
    const gradBias = average(errors) * 2
    const plane = actualMultivariatePlane(normalized.stats, weights, bias)
    const multivariateResiduals = samples.map((sample) => {
      const predictedPrice = predictMultivariate(sample, plane.weights, plane.intercept)
      return {
        area: sample.area,
        age: sample.age,
        actualPrice: sample.price,
        predictedPrice,
        residual: predictedPrice - sample.price,
      }
    })
    const residuals = multivariateResiduals.map((segment) => segment.residual)
    const mse = average(residuals.map((residual) => residual ** 2))
    const highlightIndex = step % samples.length
    const highlighted = samples[highlightIndex] ?? samples[0]!
    const highlightedPrediction = predictMultivariate(highlighted, plane.weights, plane.intercept)

    snapshots.push({
      step,
      loss: mse,
      regressionSamples: samples.map((sample) => ({ x: sample.area, y: sample.price, split: 'train' })),
      multivariateSamples: samples,
      multivariatePlane: plane,
      multivariateResiduals,
      derivedMetrics: {
        scenario: 'multivariate',
        mse,
        trainMse: mse,
        mae: average(residuals.map((residual) => Math.abs(residual))),
        weights: plane.weights,
        intercept: plane.intercept,
        gradientNorm: Math.hypot(...gradWeights, gradBias),
        stepSize: Math.hypot(...gradWeights.map((gradient) => gradient * learningRate), gradBias * learningRate),
        highlightIndex,
        modelComplexity: 2,
        weightNorm: Math.hypot(...plane.weights),
        activeWeights: plane.weights.filter((weight) => Math.abs(weight) > 0.04).length,
        regularizationPenalty: 0,
        statusKey: step === 0 ? 'initializing' : mse > 180 ? 'coarse-search' : 'refining',
      },
      selectedObservation: {
        area: highlighted.area,
        age: highlighted.age,
        actualPrice: highlighted.price,
        predictedPrice: highlightedPrediction,
        residual: highlightedPrediction - highlighted.price,
      },
    })

    if (step === epochs) break

    weights = weights.map((weight, index) => weight - learningRate * gradWeights[index]!)
    bias -= learningRate * gradBias
  }

  return { snapshots }
}

function truePolynomialPrice(area: number, index: number, noise: number) {
  const centered = area - 112
  const curve = 88 + area * 1.06 + centered ** 2 * 0.012 - centered ** 3 * 0.000018
  const deterministicNoise = Math.sin(index * 1.9) * noise * 36 + Math.cos(index * 0.73) * noise * 16
  return curve + deterministicNoise
}

function createPolynomialData(noise: number, validationSplit: number, scenario: LinearRegressionScenario): PolynomialData {
  const areas = [
    36, 42, 48, 55, 63, 91, 98, 106, 114, 123, 153, 160, 169, 181, 193, 224, 238, 254,
  ]
  const all = areas.map((area, index) => ({
    x: area,
    y: truePolynomialPrice(area, index, noise),
    split: 'train' as const,
  }))

  const validationCount = Math.max(2, Math.round(all.length * validationSplit))
  const validation = all
    .filter((_, index) => index % 3 === 1)
    .slice(0, validationCount)
    .map((sample, index) => ({
      ...sample,
      y: sample.y + (scenario === 'overfit' ? (index % 2 === 0 ? 42 : -34) : 0),
      split: 'validation' as const,
    }))
  const validationSet = new Set(validation.map((sample) => sample.x))
  const training = all
    .filter((sample) => !validationSet.has(sample.x))
    .map((sample) => ({ ...sample, split: 'train' as const }))
  const visibleAll = [
    ...training,
    ...validation,
  ].sort((left, right) => left.x - right.x)
  const meanX = average(training.map((sample) => sample.x))
  const scaleX = (Math.max(...training.map((sample) => sample.x)) - Math.min(...training.map((sample) => sample.x))) / 2 || 1
  const meanY = average(training.map((sample) => sample.y))
  const scaleY = stddev(training.map((sample) => sample.y), meanY)

  return { training, validation, all: visibleAll, meanX, scaleX, meanY, scaleY }
}

function createCaliforniaHousingPolynomialData(): PolynomialData {
  const all = californiaHousingSubset
    .map((sample) => ({
      x: sample.medInc,
      y: sample.medianHouseValue,
      split: sample.split,
    }))
    .sort((left, right) => left.x - right.x)
  const training = all.filter((sample) => sample.split === 'train')
  const validation = all.filter((sample) => sample.split === 'validation')
  const meanX = average(training.map((sample) => sample.x))
  const scaleX = (Math.max(...training.map((sample) => sample.x)) - Math.min(...training.map((sample) => sample.x))) / 2 || 1
  const meanY = average(training.map((sample) => sample.y))
  const scaleY = stddev(training.map((sample) => sample.y), meanY)

  return {
    training,
    validation,
    all,
    meanX,
    scaleX,
    meanY,
    scaleY,
    meta: californiaHousingRegressionMeta,
  }
}

function polynomialFeatures(area: number, degree: number, meanX: number, scaleX: number) {
  const normalized = (area - meanX) / scaleX
  return Array.from({ length: degree }, (_, index) => normalized ** (index + 1))
}

function predictPolynomial(area: number, weights: number[], bias: number, data: PolynomialData) {
  const normalizedY = dot(polynomialFeatures(area, weights.length, data.meanX, data.scaleX), weights) + bias
  return data.meanY + normalizedY * data.scaleY
}

function sampleMse(samples: PlotPoint[], weights: number[], bias: number, data: PolynomialData) {
  const residuals = samples.map((sample) => predictPolynomial(sample.x, weights, bias, data) - sample.y)
  return {
    mse: average(residuals.map((residual) => residual ** 2)),
    mae: average(residuals.map((residual) => Math.abs(residual))),
    residuals,
  }
}

function regularizationPenalty(weights: number[], type: RegularizationType, lambda: number) {
  if (type === 'l2') return lambda * average(weights.map((weight) => weight ** 2))
  if (type === 'l1') return lambda * average(weights.map((weight) => Math.abs(weight)))
  return 0
}

function buildFitCurve(weights: number[], bias: number, data: PolynomialData) {
  const minX = Math.min(...data.all.map((sample) => sample.x)) - 4
  const maxX = Math.max(...data.all.map((sample) => sample.x)) + 4
  return Array.from({ length: 64 }, (_, index) => {
    const x = minX + (index / 63) * (maxX - minX)
    return { x, y: predictPolynomial(x, weights, bias, data) }
  })
}

function buildFitCurveForModel(model: PolynomialModel, data: PolynomialData, padding = 0.18) {
  const minX = Math.min(...data.all.map((sample) => sample.x)) - padding
  const maxX = Math.max(...data.all.map((sample) => sample.x)) + padding

  return Array.from({ length: 72 }, (_, index) => {
    const x = minX + (index / 71) * (maxX - minX)
    return { x, y: predictPolynomial(x, model.weights, model.bias, data) }
  })
}

function fitClosedFormPolynomial(data: PolynomialData, degree: number, type: RegularizationType, lambda: number): PolynomialModel {
  const features = data.training.map((sample) => polynomialFeatures(sample.x, degree, data.meanX, data.scaleX))
  const targets = data.training.map((sample) => (sample.y - data.meanY) / data.scaleY)
  const width = degree + 1
  const regularizationScale = type === 'l2' ? lambda : 0
  const matrix = Array.from({ length: width }, () => Array.from({ length: width }, () => 0))
  const vector = Array.from({ length: width }, () => 0)

  features.forEach((row, rowIndex) => {
    const withBias = [...row, 1]
    withBias.forEach((left, leftIndex) => {
      vector[leftIndex] += (left * targets[rowIndex]!) / features.length
      withBias.forEach((right, rightIndex) => {
        matrix[leftIndex]![rightIndex] += (left * right) / features.length
      })
    })
  })

  for (let index = 0; index < degree; index += 1) {
    matrix[index]![index] += regularizationScale || 1e-6
  }

  const coefficients = solveLinearSystem(matrix, vector)
  const rawWeights = coefficients.slice(0, degree)
  const bias = coefficients[degree] ?? 0
  const weights =
    type === 'l1'
      ? rawWeights.map((weight) => Math.sign(weight) * Math.max(0, Math.abs(weight) - lambda * 0.28))
      : rawWeights

  return { weights, bias }
}

function modelMetrics(model: PolynomialModel, data: PolynomialData, type: RegularizationType, lambda: number) {
  const trainLoss = sampleMse(data.training, model.weights, model.bias, data)
  const validationLoss = sampleMse(data.validation, model.weights, model.bias, data)
  const curve = buildFitCurveForModel(model, data)
  const secondDiffs = curve.slice(2).map((point, index) => {
    const previous = curve[index]!
    const middle = curve[index + 1]!
    return point.y - 2 * middle.y + previous.y
  })

  return {
    trainLoss,
    validationLoss,
    regularizationPenalty: regularizationPenalty(model.weights, type, lambda),
    weightNorm: Math.hypot(...model.weights),
    activeWeights: model.weights.filter((weight) => Math.abs(weight) > 0.08).length,
    roughness: average(secondDiffs.map((value) => value ** 2)),
    curve,
  }
}

function createFitDiagnostics(data: PolynomialData): FitDiagnostics {
  const definitions: Array<Pick<FitDiagnosticItem, 'id' | 'degree' | 'label' | 'cause' | 'response'>> = [
    {
      id: 'underfit',
      degree: 1,
      label: { 'zh-CN': '欠拟合', en: 'Underfit' },
      cause: {
        'zh-CN': '模型太简单，只能画直线，抓不住收入和房价之间的弯曲趋势。',
        en: 'The model is too simple: one line misses the curved income-value pattern.',
      },
      response: {
        'zh-CN': '增加有效特征或提高多项式阶数，先让模型具备表达主趋势的能力。',
        en: 'Add useful features or raise degree so the model can express the main trend.',
      },
    },
    {
      id: 'balanced',
      degree: 3,
      label: { 'zh-CN': '泛化较好', en: 'Better generalization' },
      cause: {
        'zh-CN': '三阶曲线保留了主要弯曲，又没有为了少数训练点剧烈摆动。',
        en: 'The cubic curve captures the bend without swinging hard for a few training points.',
      },
      response: {
        'zh-CN': '用验证误差选择复杂度，而不是只看训练误差最低。',
        en: 'Choose complexity by validation error, not by the lowest training error alone.',
      },
    },
    {
      id: 'overfit',
      degree: 7,
      label: { 'zh-CN': '过拟合', en: 'Overfit' },
      cause: {
        'zh-CN': '高阶曲线权重很大，训练点附近贴得更紧，但验证点误差明显变差。',
        en: 'The high-degree curve uses large weights to hug training points, then misses validation points.',
      },
      response: {
        'zh-CN': '降低阶数、增加数据、早停，或进入下一章用正则化惩罚过大的权重。',
        en: 'Lower degree, add data, stop earlier, or use regularization to penalize large weights.',
      },
    },
  ]

  return {
    sourceNote: {
      'zh-CN': 'California Housing 子集：x 为 MedInc，y 为街区房价中位数，单位为 10 万美元。',
      en: 'California Housing subset: x is MedInc and y is median house value in $100k units.',
    },
    items: definitions.map((definition) => {
      const model = fitClosedFormPolynomial(data, definition.degree, 'none', 0)
      const metrics = modelMetrics(model, data, 'none', 0)

      return {
        ...definition,
        trainMse: metrics.trainLoss.mse,
        validationMse: metrics.validationLoss.mse,
        weightNorm: metrics.weightNorm,
        activeWeights: metrics.activeWeights,
        roughness: metrics.roughness,
        curve: metrics.curve,
      }
    }),
  }
}

function interpolateModel(start: PolynomialModel, end: PolynomialModel, progress: number): PolynomialModel {
  return {
    weights: end.weights.map((weight, index) => (start.weights[index] ?? 0) + (weight - (start.weights[index] ?? 0)) * progress),
    bias: start.bias + (end.bias - start.bias) * progress,
  }
}

function simulateCaliforniaPolynomialFamily(config: ExperimentConfig, scenario: LinearRegressionScenario): ModuleSimulation {
  const epochs = Math.max(24, Math.round(Number(config.epochs ?? 70)))
  const degree = Math.max(1, Math.min(7, Math.round(Number(config.polynomialDegree ?? 7))))
  const regularizationType = String(config.regularizationType ?? (scenario === 'regularized' ? 'l2' : 'none')) as RegularizationType
  const lambda = scenario === 'regularized' ? clamp(Number(config.lambda ?? 0.28), 0, 0.8) : 0
  const data = createCaliforniaHousingPolynomialData()
  const diagnostics = createFitDiagnostics(data)
  const finalModel = fitClosedFormPolynomial(data, degree, regularizationType, lambda)
  const initialModel: PolynomialModel = {
    weights: Array.from({ length: degree }, (_, index) => (index === 0 ? -0.18 : 0.03 / (index + 1))),
    bias: -0.08,
  }
  const snapshots: TrainingSnapshot[] = []

  for (let step = 0; step <= epochs; step += 1) {
    const progress = step / Math.max(epochs, 1)
    const easedProgress = 1 - (1 - progress) ** 2.2
    const model = interpolateModel(initialModel, finalModel, easedProgress)
    const metrics = modelMetrics(model, data, regularizationType, lambda)
    const loss = metrics.trainLoss.mse + metrics.regularizationPenalty * data.scaleY
    const highlightIndex = step % data.all.length
    const highlighted = data.all[highlightIndex] ?? data.all[0]!
    const highlightedPrediction = predictPolynomial(highlighted.x, model.weights, model.bias, data)

    snapshots.push({
      step,
      loss,
      regressionSamples: data.all,
      validationSamples: data.validation,
      fitCurve: metrics.curve,
      regressionMeta: data.meta,
      fitDiagnostics: diagnostics,
      derivedMetrics: {
        scenario,
        dataSource: 'california-housing',
        mse: loss,
        trainMse: metrics.trainLoss.mse,
        validationMse: metrics.validationLoss.mse,
        mae: metrics.trainLoss.mae,
        weights: model.weights.map((weight) => weight * data.scaleY),
        intercept: data.meanY + model.bias * data.scaleY,
        gradientNorm: Math.hypot(
          ...finalModel.weights.map((weight, index) => weight - (model.weights[index] ?? 0)),
          finalModel.bias - model.bias,
        ),
        stepSize: Math.abs(1 - easedProgress),
        highlightIndex,
        polynomialDegree: degree,
        modelComplexity: degree,
        regularizationType,
        lambda,
        regularizationPenalty: metrics.regularizationPenalty,
        weightNorm: metrics.weightNorm,
        activeWeights: metrics.activeWeights,
        roughness: metrics.roughness,
        statusKey:
          scenario === 'overfit' && metrics.validationLoss.mse > metrics.trainLoss.mse * 1.18
            ? 'overfitting'
            : regularizationType !== 'none'
              ? 'regularized'
              : 'refining',
      },
      selectedObservation: {
        area: highlighted.x,
        actualPrice: highlighted.y,
        predictedPrice: highlightedPrediction,
        residual: highlightedPrediction - highlighted.y,
      },
    })
  }

  return { snapshots }
}

function simulatePolynomialFamily(config: ExperimentConfig, scenario: LinearRegressionScenario): ModuleSimulation {
  const learningRate = clamp(Number(config.learningRate ?? 0.065), 0.01, 0.16)
  const epochs = Math.max(24, Math.round(Number(config.epochs ?? 58)))
  const datasetNoise = clamp(Number(config.datasetNoise ?? 0.12), 0, 0.42)
  const degree = Math.max(1, Math.min(7, Math.round(Number(config.polynomialDegree ?? (scenario === 'polynomial' ? 2 : 6)))))
  const validationSplit = clamp(Number(config.validationSplit ?? 0.32), 0.18, 0.48)
  const regularizationType = String(config.regularizationType ?? (scenario === 'regularized' ? 'l2' : 'none')) as RegularizationType
  const lambda = scenario === 'regularized' ? clamp(Number(config.lambda ?? 0.25), 0, 0.8) : 0
  const data = createPolynomialData(datasetNoise, validationSplit, scenario)
  const trainFeatures = data.training.map((sample) =>
    polynomialFeatures(sample.x, degree, data.meanX, data.scaleX),
  )
  const trainY = data.training.map((sample) => (sample.y - data.meanY) / data.scaleY)
  let weights = Array.from({ length: degree }, (_, index) => (index === 0 ? -0.16 : 0.12 / (index + 1)))
  let bias = 0.08
  const snapshots: TrainingSnapshot[] = []

  for (let step = 0; step <= epochs; step += 1) {
    const predictions = trainFeatures.map((features) => dot(features, weights) + bias)
    const errors = predictions.map((prediction, index) => prediction - trainY[index]!)
    const gradWeights = weights.map((weight, featureIndex) => {
      const mseGradient =
        average(errors.map((error, rowIndex) => error * trainFeatures[rowIndex]![featureIndex]!)) * 2
      if (regularizationType === 'l2') return mseGradient + 2 * lambda * weight
      if (regularizationType === 'l1') return mseGradient + lambda * Math.sign(weight)
      return mseGradient
    })
    const gradBias = average(errors) * 2
    const trainLoss = sampleMse(data.training, weights, bias, data)
    const validationLoss = sampleMse(data.validation, weights, bias, data)
    const penalty = regularizationPenalty(weights, regularizationType, lambda)
    const loss = trainLoss.mse + penalty * data.scaleY
    const highlightIndex = step % data.all.length
    const highlighted = data.all[highlightIndex] ?? data.all[0]!
    const highlightedPrediction = predictPolynomial(highlighted.x, weights, bias, data)

    snapshots.push({
      step,
      loss,
      regressionSamples: data.all,
      validationSamples: data.validation,
      fitCurve: buildFitCurve(weights, bias, data),
      derivedMetrics: {
        scenario,
        mse: loss,
        trainMse: trainLoss.mse,
        validationMse: validationLoss.mse,
        mae: trainLoss.mae,
        weights: weights.map((weight) => weight * data.scaleY),
        intercept: data.meanY + bias * data.scaleY,
        gradientNorm: Math.hypot(...gradWeights, gradBias),
        stepSize: Math.hypot(...gradWeights.map((gradient) => gradient * learningRate), gradBias * learningRate),
        highlightIndex,
        polynomialDegree: degree,
        modelComplexity: degree,
        regularizationType,
        lambda,
        regularizationPenalty: penalty,
        weightNorm: Math.hypot(...weights),
        activeWeights: weights.filter((weight) => Math.abs(weight) > 0.08).length,
        statusKey:
          scenario === 'overfit' && validationLoss.mse > trainLoss.mse * 1.18
            ? 'overfitting'
            : regularizationType !== 'none'
              ? 'regularized'
              : 'refining',
      },
      selectedObservation: {
        area: highlighted.x,
        actualPrice: highlighted.y,
        predictedPrice: highlightedPrediction,
        residual: highlightedPrediction - highlighted.y,
      },
    })

    if (step === epochs) break

    weights = weights.map((weight, index) => {
      const next = weight - learningRate * gradWeights[index]!
      if (regularizationType === 'l1') {
        const shrink = learningRate * lambda * 0.36
        return Math.sign(next) * Math.max(0, Math.abs(next) - shrink)
      }
      return next
    })
    bias -= learningRate * gradBias
  }

  return { snapshots }
}

export function simulateLinearRegression(config: ExperimentConfig): ModuleSimulation {
  const scenario = String(config.scenario ?? 'linear') as LinearRegressionScenario

  if (scenario === 'multivariate') return simulateMultivariate(config)
  if (scenario === 'overfit' || scenario === 'regularized') {
    return simulateCaliforniaPolynomialFamily(config, scenario)
  }
  if (scenario === 'polynomial') {
    return simulatePolynomialFamily(config, scenario)
  }

  return simulateSimpleLine(config, scenario)
}
