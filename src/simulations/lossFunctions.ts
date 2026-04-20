import type {
  ExperimentConfig,
  LikelihoodCandidate,
  ModuleSimulation,
  PlotPoint,
  TrainingSnapshot,
} from '../types/ml'
import { generateDataset } from '../utils/datasets'
import { clamp, sigmoid } from '../utils/math'

const regressionDomain = { min: -3, max: 3 }
const probabilityMin = 0.01
const probabilityMax = 0.99

function makeCurve(
  min: number,
  max: number,
  count: number,
  fn: (value: number) => number,
): PlotPoint[] {
  return Array.from({ length: count }, (_, index) => {
    const x = min + (index / Math.max(count - 1, 1)) * (max - min)
    return { x, y: fn(x) }
  })
}

function safeProbability(value: number) {
  return clamp(value, probabilityMin, probabilityMax)
}

function mse(target: number, prediction: number) {
  return (prediction - target) ** 2
}

function mae(target: number, prediction: number) {
  return Math.abs(prediction - target)
}

function bce(label: number, probability: number) {
  const safe = safeProbability(probability)
  return -(label * Math.log(safe) + (1 - label) * Math.log(1 - safe))
}

function gaussianLikelihood(observation: number, mean: number, sigma: number) {
  const safeSigma = Math.max(0.18, sigma)
  const coefficient = 1 / (Math.sqrt(2 * Math.PI) * safeSigma)
  return coefficient * Math.exp(-((observation - mean) ** 2) / (2 * safeSigma ** 2))
}

function gaussianNll(observation: number, mean: number, sigma: number) {
  return -Math.log(Math.max(1e-8, gaussianLikelihood(observation, mean, sigma)))
}

function laplaceLikelihood(observation: number, mean: number, scale = 0.65) {
  return 1 / (2 * scale) * Math.exp(-Math.abs(observation - mean) / scale)
}

function laplaceNll(observation: number, mean: number, scale = 0.65) {
  return -Math.log(Math.max(1e-8, laplaceLikelihood(observation, mean, scale)))
}

function bernoulliLikelihood(label: number, probability: number) {
  const safe = safeProbability(probability)
  return label === 1 ? safe : 1 - safe
}

function bernoulliNll(label: number, probability: number) {
  return -Math.log(Math.max(1e-8, bernoulliLikelihood(label, probability)))
}

function jointBernoulliLikelihood(trialCount: number, observedSuccesses: number, probability: number) {
  const safe = safeProbability(probability)
  const failures = trialCount - observedSuccesses
  return safe ** observedSuccesses * (1 - safe) ** failures
}

function jointBernoulliLogLikelihood(trialCount: number, observedSuccesses: number, probability: number) {
  const safe = safeProbability(probability)
  const failures = trialCount - observedSuccesses
  return observedSuccesses * Math.log(safe) + failures * Math.log(1 - safe)
}

function buildBernoulliTerms(trialCount: number, observedSuccesses: number, probability: number) {
  const safe = safeProbability(probability)
  return Array.from({ length: trialCount }, (_, index) => (index < observedSuccesses ? safe : 1 - safe))
}

function softmax(logits: number[]) {
  const shifted = logits.map((value) => value - Math.max(...logits))
  const exps = shifted.map((value) => Math.exp(value))
  const total = exps.reduce((sum, value) => sum + value, 0)
  return exps.map((value) => value / total)
}

function softmaxCrossEntropy(probabilities: number[], trueIndex: number) {
  return -Math.log(Math.max(1e-8, probabilities[trueIndex] ?? 1e-8))
}

function binaryMarginForProbability(probability: number) {
  const safe = safeProbability(probability)
  return Math.log(safe / (1 - safe))
}

function softmaxLeadForProbability(probability: number, classCount: number) {
  const safe = safeProbability(probability)
  return Math.log(((classCount - 1) * safe) / (1 - safe))
}

function createRegressionSamples(noise: number, includeOutlier: boolean, outlierStrength: number) {
  const basePoints = [
    { x: -2.2, y: -0.86 },
    { x: -1.5, y: -0.48 },
    { x: -0.8, y: -0.12 },
    { x: -0.15, y: 0.18 },
    { x: 0.4, y: 0.64 },
    { x: 0.95, y: 1.01 },
    { x: 1.55, y: 1.52 },
    { x: 2.15, y: 1.86 },
  ]

  const adjusted = basePoints.map((point, index) => ({
    x: point.x,
    y: point.y + Math.sin(index * 1.7) * noise * 0.85,
  }))

  if (includeOutlier) {
    adjusted.push({
      x: 2.55,
      y: 0.72 + outlierStrength,
    })
  }

  return adjusted
}

function evaluateFitLoss(
  samples: PlotPoint[],
  slope: number,
  intercept: number,
  kind: 'mse' | 'mae',
) {
  const total = samples.reduce((sum, sample) => {
    const prediction = slope * sample.x + intercept
    return sum + (kind === 'mse' ? mse(sample.y, prediction) : mae(sample.y, prediction))
  }, 0)
  return total / samples.length
}

function fitRegressionLine(samples: PlotPoint[], kind: 'mse' | 'mae') {
  let best = { slope: 0.62, intercept: 0.42, loss: Number.POSITIVE_INFINITY }

  for (let slopeIndex = 0; slopeIndex <= 64; slopeIndex += 1) {
    const slope = -0.1 + (slopeIndex / 64) * 1.6
    for (let interceptIndex = 0; interceptIndex <= 64; interceptIndex += 1) {
      const intercept = -1.2 + (interceptIndex / 64) * 3.2
      const loss = evaluateFitLoss(samples, slope, intercept, kind)
      if (loss < best.loss) {
        best = { slope, intercept, loss }
      }
    }
  }

  for (let slopeIndex = 0; slopeIndex <= 48; slopeIndex += 1) {
    const slope = best.slope - 0.16 + (slopeIndex / 48) * 0.32
    for (let interceptIndex = 0; interceptIndex <= 48; interceptIndex += 1) {
      const intercept = best.intercept - 0.22 + (interceptIndex / 48) * 0.44
      const loss = evaluateFitLoss(samples, slope, intercept, kind)
      if (loss < best.loss) {
        best = { slope, intercept, loss }
      }
    }
  }

  return best
}

function computeBoundaryGrid(weights: number[], bias: number, gridSize: number) {
  const grid: number[] = []
  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      const x = -2.5 + (column / (gridSize - 1)) * 5
      const y = 2.5 - (row / (gridSize - 1)) * 5
      grid.push(sigmoid(weights[0] * x + weights[1] * y + bias))
    }
  }
  return grid
}

function buildWhyLossBreakdown(target: number, prediction: number, kind: 'mse' | 'mae') {
  const items = [
    { id: 'sample-a', label: 'A', target, prediction },
    { id: 'sample-b', label: 'B', target: target - 0.7, prediction: prediction - 0.35 },
    { id: 'sample-c', label: 'C', target: target + 0.55, prediction: prediction + 0.18 },
  ]

  return items.map((item) => ({
    ...item,
    loss: kind === 'mse' ? mse(item.target, item.prediction) : mae(item.target, item.prediction),
  }))
}

function buildLikelihoodCandidates(
  trialCount: number,
  observedSuccesses: number,
  candidateProbability: number,
) {
  const baseCandidates = [
    { label: 'p = 0.20', parameter: 0.2 },
    { label: 'p = 0.50', parameter: 0.5 },
    { label: 'p = 0.80', parameter: 0.8 },
    { label: 'your p', parameter: candidateProbability },
  ]

  const uniqueCandidates = baseCandidates.filter(
    (candidate, index, candidates) =>
      candidates.findIndex((entry) => Math.abs(entry.parameter - candidate.parameter) < 1e-6) === index,
  )

  return uniqueCandidates.map(
    (candidate): LikelihoodCandidate => ({
      ...candidate,
      likelihood: jointBernoulliLikelihood(trialCount, observedSuccesses, candidate.parameter),
      nll: -jointBernoulliLogLikelihood(trialCount, observedSuccesses, candidate.parameter),
    }),
  )
}

export function simulateLossFunctions(config: ExperimentConfig): ModuleSimulation {
  const regressionLossKind = String(config.regressionLossKind ?? 'mse') as 'mse' | 'mae'
  const distributionKind = String(config.distributionKind ?? 'gaussian') as
    | 'gaussian'
    | 'bernoulli'
    | 'laplace'

  const targetValue = Number(config.targetValue ?? 1.2)
  const predictionValue = Number(config.predictionValue ?? -0.35)
  const probability = safeProbability(Number(config.probability ?? 0.76))
  const classificationLabel = Number(config.classificationLabel ?? 1)
  const includeOutlier = Boolean(config.includeOutlier ?? true)
  const outlierStrength = Number(config.outlierStrength ?? 2.2)
  const datasetNoise = Number(config.datasetNoise ?? 0.12)
  const mean = Number(config.mean ?? 0.8)
  const sigma = Math.max(0.18, Number(config.sigma ?? 0.85))
  const decisionBias = Number(config.decisionBias ?? 0.05)
  const trialCount = Math.max(4, Math.round(Number(config.trialCount ?? 10)))
  const observedSuccesses = clamp(Math.round(Number(config.observedSuccesses ?? 8)), 0, trialCount)
  const candidateProbability = safeProbability(Number(config.candidateProbability ?? 0.8))

  const regressionCurves = {
    mse: makeCurve(regressionDomain.min, regressionDomain.max, 160, (value) => mse(targetValue, value)),
    mae: makeCurve(regressionDomain.min, regressionDomain.max, 160, (value) => mae(targetValue, value)),
  }

  const regressionSamples = createRegressionSamples(datasetNoise, includeOutlier, outlierStrength)
  const regressionFit = fitRegressionLine(regressionSamples, regressionLossKind)
  const regressionLoss = evaluateFitLoss(
    regressionSamples,
    regressionFit.slope,
    regressionFit.intercept,
    regressionLossKind,
  )

  const classificationCurves = {
    bcePositive: makeCurve(probabilityMin, probabilityMax, 160, (value) => bce(1, value)),
    bceNegative: makeCurve(probabilityMin, probabilityMax, 160, (value) => bce(0, value)),
  }

  const classificationSamples = generateDataset({
    kind: 'tilted',
    sampleCount: 60,
    noise: 0.06 + datasetNoise * 0.85,
    seed: 17,
  })
  const classificationWeights = [1.1, -0.9]
  const classificationGridSize = 34
  const boundaryGrid = computeBoundaryGrid(classificationWeights, decisionBias, classificationGridSize)

  const multiclassClassCount = 3
  const binaryMargin = binaryMarginForProbability(probability)
  const softmaxMargin = softmaxLeadForProbability(probability, multiclassClassCount)
  const multiclassLogits = [softmaxMargin, 0, 0]
  const multiclassExpScores = multiclassLogits.map((value) => Math.exp(value))
  const softmaxDenominator = multiclassExpScores.reduce((sum, value) => sum + value, 0)
  const multiclassProbabilities = softmax(multiclassLogits)
  const softmaxWorkedExampleRows = multiclassLogits.map((value, index) => ({
    id: `class-${index}`,
    label: String.fromCharCode(65 + index),
    input: value,
    output: multiclassExpScores[index] ?? 0,
    contribution: multiclassProbabilities[index] ?? 0,
  }))

  const jointLikelihood = jointBernoulliLikelihood(trialCount, observedSuccesses, candidateProbability)
  const jointLogLikelihood = jointBernoulliLogLikelihood(
    trialCount,
    observedSuccesses,
    candidateProbability,
  )
  const perSampleLikelihoods = buildBernoulliTerms(trialCount, observedSuccesses, candidateProbability)
  const likelihoodCandidates = buildLikelihoodCandidates(
    trialCount,
    observedSuccesses,
    candidateProbability,
  )

  const coinCurves = {
    likelihood: makeCurve(probabilityMin, probabilityMax, 160, (value) =>
      jointBernoulliLikelihood(trialCount, observedSuccesses, value),
    ),
    nll: makeCurve(probabilityMin, probabilityMax, 160, (value) =>
      -jointBernoulliLogLikelihood(trialCount, observedSuccesses, value),
    ),
  }

  const mleCurves =
    distributionKind === 'bernoulli'
      ? {
          likelihood: makeCurve(probabilityMin, probabilityMax, 160, (value) =>
            bernoulliLikelihood(classificationLabel, value),
          ),
          nll: makeCurve(probabilityMin, probabilityMax, 160, (value) =>
            bernoulliNll(classificationLabel, value),
          ),
        }
      : {
          likelihood: makeCurve(regressionDomain.min, regressionDomain.max, 160, (value) =>
            distributionKind === 'gaussian'
              ? gaussianLikelihood(targetValue, value, sigma)
              : laplaceLikelihood(targetValue, value),
          ),
          nll: makeCurve(regressionDomain.min, regressionDomain.max, 160, (value) =>
            distributionKind === 'gaussian'
              ? gaussianNll(targetValue, value, sigma)
              : laplaceNll(targetValue, value),
          ),
        }

  const currentLikelihood =
    distributionKind === 'gaussian'
      ? gaussianLikelihood(targetValue, mean, sigma)
      : distributionKind === 'laplace'
        ? laplaceLikelihood(targetValue, mean)
        : bernoulliLikelihood(classificationLabel, probability)

  const currentNll =
    distributionKind === 'gaussian'
      ? gaussianNll(targetValue, mean, sigma)
      : distributionKind === 'laplace'
        ? laplaceNll(targetValue, mean)
        : bernoulliNll(classificationLabel, probability)

  const sampleLossBreakdown = buildWhyLossBreakdown(targetValue, predictionValue, regressionLossKind)
  const positiveConfidence = bce(1, 0.99)
  const hesitantConfidence = bce(1, 0.55)
  const confidentMistake = bce(1, 0.01)

  const snapshot: TrainingSnapshot = {
    step: 0,
    loss: regressionLossKind === 'mse' ? mse(targetValue, predictionValue) : mae(targetValue, predictionValue),
    lossCurves: {
      ...regressionCurves,
      ...classificationCurves,
      coinLikelihood: coinCurves.likelihood,
      coinNll: coinCurves.nll,
      mleLikelihood: mleCurves.likelihood,
      mleNll: mleCurves.nll,
    },
    regressionSamples,
    regressionFit: {
      slope: regressionFit.slope,
      intercept: regressionFit.intercept,
    },
    classificationSamples,
    dataset: classificationSamples,
    params: {
      weights: classificationWeights,
      bias: decisionBias,
    },
    boundaryGrid,
    gridSize: classificationGridSize,
    probabilityBars: multiclassProbabilities,
    likelihoodCurve: coinCurves.likelihood,
    likelihoodCandidates,
    jointLikelihood,
    jointLogLikelihood,
    perSampleLikelihoods,
    selectedObservation: {
      residual: predictionValue - targetValue,
      mse: mse(targetValue, predictionValue),
      mae: mae(targetValue, predictionValue),
      totalRegressionLoss: regressionLoss,
      bce: bce(classificationLabel, probability),
      probability,
      multiclassCrossEntropy: softmaxCrossEntropy(multiclassProbabilities, 0),
      binaryMargin,
      softmaxMargin,
      softmaxDenominator,
      softmaxTrueProbability: multiclassProbabilities[0] ?? 0,
      softmaxCompetitorProbability: multiclassProbabilities[1] ?? 0,
      likelihood: currentLikelihood,
      nll: currentNll,
      equivalence:
        distributionKind === 'gaussian'
          ? 'MSE'
          : distributionKind === 'laplace'
            ? 'MAE'
            : 'BCE',
      classificationLabel,
      mean,
      sigma,
      trialCount,
      observedSuccesses,
      candidateProbability,
      coinLikelihood: jointLikelihood,
      coinLogLikelihood: jointLogLikelihood,
      coinNll: -jointLogLikelihood,
      confidentCorrectLoss: positiveConfidence,
      hesitantCorrectLoss: hesitantConfidence,
      confidentMistakeLoss: confidentMistake,
    },
    sampleLossBreakdown,
    workedExampleRows: softmaxWorkedExampleRows,
  }

  return { snapshots: [snapshot] }
}
