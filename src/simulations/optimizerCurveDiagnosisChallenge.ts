export type OptimizerCurveScenarioId =
  | 'lr-divergence'
  | 'small-batch-noise'
  | 'ravine-zigzag'
  | 'schedule-plateau'

export type OptimizerCurveIssue =
  | 'learning-rate-too-high'
  | 'batch-noise-too-high'
  | 'momentum-or-adaptive-needed'
  | 'schedule-needed'

export type OptimizerCurveExperiment =
  | 'lower-learning-rate'
  | 'increase-batch-size'
  | 'add-momentum-or-adam'
  | 'add-or-move-lr-decay'

export interface OptimizerCurvePrediction {
  issue: OptimizerCurveIssue
  nextExperiment: OptimizerCurveExperiment
}

export interface OptimizerCurvePoint {
  step: number
  trainLoss: number
  validationLoss: number
  learningRate: number
}

export interface OptimizerCurveScenario {
  id: OptimizerCurveScenarioId
  optimizer: string
  batchSize: number
  learningRate: number
  note: string
  points: OptimizerCurvePoint[]
  expectedIssue: OptimizerCurveIssue
  expectedExperiment: OptimizerCurveExperiment
}

export interface OptimizerCurveDiagnosisSnapshot {
  scenario: OptimizerCurveScenario
  evidence: {
    finalTrainLoss: number
    finalValidationLoss: number
    trainVolatility: number
    validationVolatility: number
    plateauDelta: number
    hasNonFiniteLoss: boolean
    learningRateChanges: number
  }
  result: {
    issueCorrect: boolean
    experimentCorrect: boolean
    allCorrect: boolean
  }
}

interface OptimizerCurveChallengeInput {
  scenarioId: string
  prediction: {
    issue: string
    nextExperiment: string
  }
}

const issues: OptimizerCurveIssue[] = [
  'learning-rate-too-high',
  'batch-noise-too-high',
  'momentum-or-adaptive-needed',
  'schedule-needed',
]

const experiments: OptimizerCurveExperiment[] = [
  'lower-learning-rate',
  'increase-batch-size',
  'add-momentum-or-adam',
  'add-or-move-lr-decay',
]

export const optimizerCurveDiagnosisScenarios: OptimizerCurveScenario[] = [
  {
    id: 'lr-divergence',
    optimizer: 'SGD',
    batchSize: 64,
    learningRate: 0.8,
    note: 'same model, same seed, only learning rate is aggressive',
    expectedIssue: 'learning-rate-too-high',
    expectedExperiment: 'lower-learning-rate',
    points: [
      { step: 0, trainLoss: 1.2, validationLoss: 1.25, learningRate: 0.8 },
      { step: 1, trainLoss: 1.35, validationLoss: 1.38, learningRate: 0.8 },
      { step: 2, trainLoss: 1.9, validationLoss: 1.95, learningRate: 0.8 },
      { step: 3, trainLoss: Number.POSITIVE_INFINITY, validationLoss: Number.POSITIVE_INFINITY, learningRate: 0.8 },
    ],
  },
  {
    id: 'small-batch-noise',
    optimizer: 'SGD',
    batchSize: 8,
    learningRate: 0.04,
    note: 'same learning rate, very small batch',
    expectedIssue: 'batch-noise-too-high',
    expectedExperiment: 'increase-batch-size',
    points: [
      { step: 0, trainLoss: 1.2, validationLoss: 1.18, learningRate: 0.04 },
      { step: 1, trainLoss: 0.92, validationLoss: 1.05, learningRate: 0.04 },
      { step: 2, trainLoss: 1.08, validationLoss: 0.98, learningRate: 0.04 },
      { step: 3, trainLoss: 0.76, validationLoss: 0.91, learningRate: 0.04 },
      { step: 4, trainLoss: 0.88, validationLoss: 0.84, learningRate: 0.04 },
    ],
  },
  {
    id: 'ravine-zigzag',
    optimizer: 'SGD',
    batchSize: 64,
    learningRate: 0.08,
    note: 'same task, narrow valley, no momentum',
    expectedIssue: 'momentum-or-adaptive-needed',
    expectedExperiment: 'add-momentum-or-adam',
    points: [
      { step: 0, trainLoss: 1.1, validationLoss: 1.12, learningRate: 0.08 },
      { step: 1, trainLoss: 0.98, validationLoss: 1.0, learningRate: 0.08 },
      { step: 2, trainLoss: 1.02, validationLoss: 1.03, learningRate: 0.08 },
      { step: 3, trainLoss: 0.91, validationLoss: 0.94, learningRate: 0.08 },
      { step: 4, trainLoss: 0.94, validationLoss: 0.96, learningRate: 0.08 },
      { step: 5, trainLoss: 0.86, validationLoss: 0.89, learningRate: 0.08 },
    ],
  },
  {
    id: 'schedule-plateau',
    optimizer: 'AdamW',
    batchSize: 64,
    learningRate: 0.003,
    note: 'same optimizer, constant learning rate after early progress',
    expectedIssue: 'schedule-needed',
    expectedExperiment: 'add-or-move-lr-decay',
    points: [
      { step: 0, trainLoss: 1.3, validationLoss: 1.28, learningRate: 0.003 },
      { step: 1, trainLoss: 0.82, validationLoss: 0.86, learningRate: 0.003 },
      { step: 2, trainLoss: 0.66, validationLoss: 0.71, learningRate: 0.003 },
      { step: 3, trainLoss: 0.64, validationLoss: 0.69, learningRate: 0.003 },
      { step: 4, trainLoss: 0.63, validationLoss: 0.68, learningRate: 0.003 },
      { step: 5, trainLoss: 0.625, validationLoss: 0.675, learningRate: 0.003 },
    ],
  },
]

function finiteLosses(points: OptimizerCurvePoint[], key: 'trainLoss' | 'validationLoss') {
  return points.map((point) => point[key]).filter(Number.isFinite)
}

function volatility(values: number[]) {
  if (values.length < 2) return 0
  return values.slice(1).reduce((sum, value, index) => sum + Math.abs(value - values[index]!), 0)
}

function normalizeIssue(value: string): OptimizerCurveIssue {
  return issues.includes(value as OptimizerCurveIssue) ? (value as OptimizerCurveIssue) : 'batch-noise-too-high'
}

function normalizeExperiment(value: string): OptimizerCurveExperiment {
  return experiments.includes(value as OptimizerCurveExperiment)
    ? (value as OptimizerCurveExperiment)
    : 'increase-batch-size'
}

export function evaluateOptimizerCurveDiagnosisChallenge(
  input: OptimizerCurveChallengeInput,
): OptimizerCurveDiagnosisSnapshot {
  const scenario =
    optimizerCurveDiagnosisScenarios.find((item) => item.id === input.scenarioId) ??
    optimizerCurveDiagnosisScenarios[0]!
  const trainLosses = finiteLosses(scenario.points, 'trainLoss')
  const validationLosses = finiteLosses(scenario.points, 'validationLoss')
  const issue = normalizeIssue(input.prediction.issue)
  const nextExperiment = normalizeExperiment(input.prediction.nextExperiment)
  const finalTrainLoss = trainLosses.at(-1) ?? Number.POSITIVE_INFINITY
  const finalValidationLoss = validationLosses.at(-1) ?? Number.POSITIVE_INFINITY
  const tail = trainLosses.slice(Math.max(0, trainLosses.length - 3))
  const plateauDelta = tail.length >= 2 ? Math.abs(tail.at(-1)! - tail[0]!) : 0
  const learningRates = new Set(scenario.points.map((point) => point.learningRate))
  const issueCorrect = issue === scenario.expectedIssue
  const experimentCorrect = nextExperiment === scenario.expectedExperiment

  return {
    scenario,
    evidence: {
      finalTrainLoss,
      finalValidationLoss,
      trainVolatility: volatility(trainLosses),
      validationVolatility: volatility(validationLosses),
      plateauDelta,
      hasNonFiniteLoss: scenario.points.some(
        (point) => !Number.isFinite(point.trainLoss) || !Number.isFinite(point.validationLoss),
      ),
      learningRateChanges: Math.max(0, learningRates.size - 1),
    },
    result: {
      issueCorrect,
      experimentCorrect,
      allCorrect: issueCorrect && experimentCorrect,
    },
  }
}
