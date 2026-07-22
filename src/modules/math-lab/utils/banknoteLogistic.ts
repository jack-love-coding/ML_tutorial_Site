import {
  BANKNOTE_CONTRACT_VERSION,
  BANKNOTE_FEATURES,
  computeBanknotePreprocessing,
  type BanknoteRow,
  type BanknoteTarget,
} from './banknoteDataset.ts'

export type ParameterVector = [number, number, number, number, number]
export type FeatureVector = [number, number, number, number]
export type FeatureSpace = 'raw' | 'standardized'
export type TrainingMethod = 'fixed' | 'armijo'
export type TrainingPresetId =
  | 'raw-fixed'
  | 'standardized-too-small'
  | 'standardized-stable'
  | 'standardized-too-large'
  | 'standardized-armijo'

export type TerminalReason =
  | 'gradient-norm'
  | 'loss-and-step'
  | 'validation-patience'
  | 'max-iterations'
  | 'non-finite'
  | 'line-search-failed'

export type TerminalKind = 'mathematical-convergence' | 'model-selection' | 'safety'

export interface ArmijoConfig {
  initialStep: number
  c: number
  rho: number
  maxBacktracks: number
  minimumStep: number
}

export interface TrainingConfig {
  featureSpace: FeatureSpace
  method: TrainingMethod
  l2: number
  step: number
  maxIterations: number
  gradientTolerance: number
  relativeLossTolerance: number
  parameterStepTolerance: number
  validationMinDelta: number
  validationPatience: number
  armijo: ArmijoConfig | null
}

export interface TrainingPreset {
  id: TrainingPresetId
  config: TrainingConfig
}

export interface LossAndGradient {
  objective: number
  bce: number
  gradient: ParameterVector
}

export interface PreparedBanknoteTrainingData {
  featureSpace: FeatureSpace
  trainX: readonly FeatureVector[]
  trainY: readonly BanknoteTarget[]
  validationX: readonly FeatureVector[]
  validationY: readonly BanknoteTarget[]
  testX: readonly FeatureVector[]
  testY: readonly BanknoteTarget[]
}

export interface TracePoint {
  iteration: number
  trainBce: number
  validationBce: number
  objective: number
  gradientNorm: number
  parameterStepNorm: number
  acceptedStepSize: number
  backtrackCount: number
  relativeObjectiveChange: number | null
  isBestValidation: boolean
  parameters: ParameterVector
}

export interface BestValidationState {
  iteration: number
  bce: number
  parameters: ParameterVector
}

export interface TerminalState {
  kind: TerminalKind
  reason: TerminalReason
  iteration: number
  messageKey: `batch4.terminal.${TerminalReason}`
  attemptedIteration?: number
}

export interface TrainingRun {
  status: 'complete'
  contractVersion: typeof BANKNOTE_CONTRACT_VERSION
  runId?: TrainingPresetId
  featureSpace: FeatureSpace
  method: TrainingMethod
  config: TrainingConfig
  start: TracePoint
  firstBacktrack: TracePoint | null
  bestValidation: BestValidationState
  terminal: TerminalState
  eligibleForFinalSelection: boolean
  trace: TracePoint[]
}

export interface TrainingConfigIssue {
  field: string
  message: string
}

export interface TrainingValidationFailure {
  status: 'invalid-config'
  issues: TrainingConfigIssue[]
  message: string
}

export type TrainingResult = TrainingRun | TrainingValidationFailure

export interface StopEvaluation {
  iteration: number
  gradientNorm: number
  relativeObjectiveChange: number | null
  parameterStepNorm: number
  iterationsSinceBestValidation: number
  maxIterations: number
  gradientTolerance: number
  relativeLossTolerance: number
  parameterStepTolerance: number
  validationPatience: number
}

export interface ArmijoStepInput {
  features: readonly (readonly number[])[]
  targets: readonly BanknoteTarget[]
  parameters: readonly number[]
  current: LossAndGradient
  l2: number
  config: ArmijoConfig
}

export type ArmijoStepResult =
  | {
      accepted: true
      parameters: ParameterVector
      evaluation: LossAndGradient
      stepSize: number
      backtrackCount: number
    }
  | { accepted: false; reason: 'line-search-failed' }

export interface TerminalSuggestion {
  variable: 'learningRate' | 'initialStep' | 'maxIterations'
  messageKey: string
}

export interface TerminalFixture {
  fixtureId: string
  terminal: TerminalState
  trace: TracePoint[]
}

const sharedConfig = {
  l2: 1e-3,
  maxIterations: 500,
  gradientTolerance: 1e-5,
  relativeLossTolerance: 1e-10,
  parameterStepTolerance: 1e-7,
  validationMinDelta: 1e-7,
  validationPatience: 60,
} as const

export const BANKNOTE_TRAINING_CONSTANTS = {
  contractVersion: BANKNOTE_CONTRACT_VERSION,
  parameterOrder: [...BANKNOTE_FEATURES, 'intercept'] as const,
  ...sharedConfig,
  armijo: {
    initialStep: 32,
    c: 1e-4,
    rho: 0.5,
    maxBacktracks: 30,
    minimumStep: 1e-12,
  } satisfies ArmijoConfig,
  finalThreshold: 0.5,
  baselineC: 25 / 24,
} as const

function preset(
  id: TrainingPresetId,
  featureSpace: FeatureSpace,
  method: TrainingMethod,
  step: number,
): TrainingPreset {
  return {
    id,
    config: {
      featureSpace,
      method,
      step,
      ...sharedConfig,
      armijo: method === 'armijo' ? { ...BANKNOTE_TRAINING_CONSTANTS.armijo } : null,
    },
  }
}

export const BANKNOTE_TRAINING_PRESETS: Record<TrainingPresetId, TrainingPreset> = {
  'raw-fixed': preset('raw-fixed', 'raw', 'fixed', 4),
  'standardized-too-small': preset('standardized-too-small', 'standardized', 'fixed', 0.02),
  'standardized-stable': preset('standardized-stable', 'standardized', 'fixed', 4),
  'standardized-too-large': preset('standardized-too-large', 'standardized', 'fixed', 32),
  'standardized-armijo': preset('standardized-armijo', 'standardized', 'armijo', 32),
}

export const terminalSuggestions = {
  'validation-patience': {
    variable: 'learningRate',
    messageKey: 'batch4.suggestion.lower-learning-rate',
  },
  'max-iterations': {
    variable: 'maxIterations',
    messageKey: 'batch4.suggestion.raise-max-iterations',
  },
  'non-finite': {
    variable: 'learningRate',
    messageKey: 'batch4.suggestion.lower-learning-rate',
  },
  'line-search-failed': {
    variable: 'initialStep',
    messageKey: 'batch4.suggestion.lower-initial-step',
  },
} as const satisfies Record<
  Extract<TerminalReason, 'validation-patience' | 'max-iterations' | 'non-finite' | 'line-search-failed'>,
  TerminalSuggestion
>

export function stableSigmoid(value: number): number {
  if (value >= 0) return 1 / (1 + Math.exp(-value))
  const exponential = Math.exp(value)
  return exponential / (1 + exponential)
}

export function softplus(value: number): number {
  return Math.max(value, 0) + Math.log1p(Math.exp(-Math.abs(value)))
}

export function stableBinaryCrossEntropy(logit: number, target: BanknoteTarget): number {
  return softplus(logit) - target * logit
}

function cloneParameters(parameters: readonly number[]): ParameterVector {
  return [parameters[0]!, parameters[1]!, parameters[2]!, parameters[3]!, parameters[4]!]
}

function allFinite(values: readonly number[]): boolean {
  return values.every(Number.isFinite)
}

function vectorNorm(values: readonly number[]): number {
  return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0))
}

function validateObjectiveInput(
  features: readonly (readonly number[])[],
  targets: readonly BanknoteTarget[],
  parameters: readonly number[],
  l2: number,
): void {
  if (features.length === 0 || features.length !== targets.length) {
    throw new RangeError('Features and targets must have the same non-zero row count.')
  }
  if (parameters.length !== 5 || !allFinite(parameters)) {
    throw new RangeError('Logistic parameters must contain five finite values.')
  }
  if (!Number.isFinite(l2) || l2 < 0) throw new RangeError('L2 must be a finite nonnegative value.')
  features.forEach((row, index) => {
    if (row.length !== 4 || !allFinite(row)) {
      throw new RangeError(`Feature row ${index + 1} must contain four finite values.`)
    }
    if (targets[index] !== 0 && targets[index] !== 1) {
      throw new RangeError(`Target row ${index + 1} must be 0 or 1.`)
    }
  })
}

export function lossAndGrad(
  features: readonly (readonly number[])[],
  targets: readonly BanknoteTarget[],
  parameters: readonly number[],
  l2: number = BANKNOTE_TRAINING_CONSTANTS.l2,
): LossAndGradient {
  validateObjectiveInput(features, targets, parameters, l2)
  const gradient: ParameterVector = [0, 0, 0, 0, 0]
  let bceSum = 0

  for (let rowIndex = 0; rowIndex < features.length; rowIndex += 1) {
    const row = features[rowIndex]!
    const target = targets[rowIndex]!
    let logit = parameters[4]!
    for (let featureIndex = 0; featureIndex < 4; featureIndex += 1) {
      logit += row[featureIndex]! * parameters[featureIndex]!
    }
    const probability = stableSigmoid(logit)
    const residual = probability - target
    bceSum += stableBinaryCrossEntropy(logit, target)
    for (let featureIndex = 0; featureIndex < 4; featureIndex += 1) {
      gradient[featureIndex] += row[featureIndex]! * residual
    }
    gradient[4] += residual
  }

  const inverseRows = 1 / features.length
  let coefficientSquareSum = 0
  for (let index = 0; index < 4; index += 1) {
    coefficientSquareSum += parameters[index]! * parameters[index]!
    gradient[index] = gradient[index] * inverseRows + l2 * parameters[index]!
  }
  gradient[4] *= inverseRows
  const bce = bceSum * inverseRows
  return {
    objective: bce + 0.5 * l2 * coefficientSquareSum,
    bce,
    gradient,
  }
}

function dataBce(
  features: readonly (readonly number[])[],
  targets: readonly BanknoteTarget[],
  parameters: readonly number[],
): number {
  let total = 0
  for (let rowIndex = 0; rowIndex < features.length; rowIndex += 1) {
    const row = features[rowIndex]!
    let logit = parameters[4]!
    for (let featureIndex = 0; featureIndex < 4; featureIndex += 1) {
      logit += row[featureIndex]! * parameters[featureIndex]!
    }
    total += stableBinaryCrossEntropy(logit, targets[rowIndex]!)
  }
  return total / features.length
}

function candidateParameters(
  parameters: readonly number[],
  gradient: readonly number[],
  step: number,
): ParameterVector {
  return [
    parameters[0]! - step * gradient[0]!,
    parameters[1]! - step * gradient[1]!,
    parameters[2]! - step * gradient[2]!,
    parameters[3]! - step * gradient[3]!,
    parameters[4]! - step * gradient[4]!,
  ]
}

function finiteEvaluation(evaluation: LossAndGradient): boolean {
  return Number.isFinite(evaluation.objective)
    && Number.isFinite(evaluation.bce)
    && allFinite(evaluation.gradient)
}

export function armijoStep(input: ArmijoStepInput): ArmijoStepResult {
  const gradientSquareNorm = input.current.gradient.reduce((sum, value) => sum + value * value, 0)
  for (let backtrackCount = 0; backtrackCount <= input.config.maxBacktracks; backtrackCount += 1) {
    const stepSize = input.config.initialStep * input.config.rho ** backtrackCount
    if (!Number.isFinite(stepSize) || stepSize < input.config.minimumStep) break
    const parameters = candidateParameters(input.parameters, input.current.gradient, stepSize)
    if (!allFinite(parameters)) continue
    const evaluation = lossAndGrad(input.features, input.targets, parameters, input.l2)
    if (
      finiteEvaluation(evaluation)
      && evaluation.objective <= input.current.objective - input.config.c * stepSize * gradientSquareNorm
    ) {
      return { accepted: true, parameters, evaluation, stepSize, backtrackCount }
    }
  }
  return { accepted: false, reason: 'line-search-failed' }
}

function terminalState(
  reason: TerminalReason,
  iteration: number,
  attemptedIteration?: number,
): TerminalState {
  const kind: TerminalKind = reason === 'gradient-norm' || reason === 'loss-and-step'
    ? 'mathematical-convergence'
    : reason === 'validation-patience'
      ? 'model-selection'
      : 'safety'
  return {
    kind,
    reason,
    iteration,
    messageKey: `batch4.terminal.${reason}`,
    ...(attemptedIteration === undefined ? {} : { attemptedIteration }),
  }
}

export function shouldStop(input: StopEvaluation): TerminalState | null {
  if (input.gradientNorm <= input.gradientTolerance) {
    return terminalState('gradient-norm', input.iteration)
  }
  if (
    input.relativeObjectiveChange !== null
    && input.relativeObjectiveChange <= input.relativeLossTolerance
    && input.parameterStepNorm <= input.parameterStepTolerance
  ) {
    return terminalState('loss-and-step', input.iteration)
  }
  if (input.iterationsSinceBestValidation >= input.validationPatience) {
    return terminalState('validation-patience', input.iteration)
  }
  if (input.iteration >= input.maxIterations) {
    return terminalState('max-iterations', input.iteration)
  }
  return null
}

function assertRows(rows: readonly BanknoteRow[]): void {
  if (!Array.isArray(rows) || rows.length !== 1372) {
    throw new RangeError('The Banknote trainer requires the exact 1372-row local snapshot.')
  }
  const counts = { train: 0, validation: 0, test: 0 }
  const typedRows = rows as readonly BanknoteRow[]
  typedRows.forEach((row, index) => {
    if (row.banknoteId !== index + 1) throw new RangeError(`Banknote row ${index + 1} has an invalid ordered ID.`)
    if (!allFinite(BANKNOTE_FEATURES.map((feature) => row[feature]))) {
      throw new RangeError(`Banknote row ${index + 1} contains a non-finite feature.`)
    }
    if (row.target !== 0 && row.target !== 1) throw new RangeError(`Banknote row ${index + 1} has an invalid target.`)
    if (row.split !== 'train' && row.split !== 'validation' && row.split !== 'test') {
      throw new RangeError(`Banknote row ${index + 1} has an invalid split.`)
    }
    counts[row.split] += 1
  })
  if (counts.train !== 960 || counts.validation !== 206 || counts.test !== 206) {
    throw new RangeError('The Banknote trainer requires split counts 960/206/206.')
  }
}

export function prepareBanknoteTrainingData(
  rows: readonly BanknoteRow[],
  featureSpace: FeatureSpace,
): PreparedBanknoteTrainingData {
  assertRows(rows)
  if (featureSpace !== 'raw' && featureSpace !== 'standardized') {
    throw new RangeError('Feature space must be raw or standardized.')
  }
  const preprocessing = computeBanknotePreprocessing(rows)
  const featuresFor = (row: BanknoteRow): FeatureVector => BANKNOTE_FEATURES.map((feature) => (
    featureSpace === 'raw'
      ? row[feature]
      : (row[feature] - preprocessing.means[feature]) / preprocessing.scales[feature]
  )) as FeatureVector
  const split = (name: BanknoteRow['split']) => {
    const selected = rows.filter((row) => row.split === name)
    return {
      features: selected.map(featuresFor),
      targets: selected.map(({ target }) => target),
    }
  }
  const train = split('train')
  const validation = split('validation')
  const test = split('test')
  return {
    featureSpace,
    trainX: train.features,
    trainY: train.targets,
    validationX: validation.features,
    validationY: validation.targets,
    testX: test.features,
    testY: test.targets,
  }
}

function finiteWithin(value: number, minimum: number, maximum: number): boolean {
  return Number.isFinite(value) && value >= minimum && value <= maximum
}

export function validateTrainingConfig(config: TrainingConfig): TrainingConfigIssue[] {
  const issues: TrainingConfigIssue[] = []
  const issue = (field: string, message: string) => issues.push({ field, message })
  if (config.featureSpace !== 'raw' && config.featureSpace !== 'standardized') {
    issue('featureSpace', 'featureSpace must be raw or standardized')
  }
  if (config.method !== 'fixed' && config.method !== 'armijo') issue('method', 'method must be fixed or armijo')
  if (!finiteWithin(config.l2, 0, 1)) issue('l2', 'l2 must be finite and between 0 and 1')
  if (!finiteWithin(config.step, Number.MIN_VALUE, Number.MAX_VALUE)) {
    issue('step', 'step must be finite, positive, and no larger than Number.MAX_VALUE')
  }
  if (!Number.isInteger(config.maxIterations) || config.maxIterations < 1 || config.maxIterations > 500) {
    issue('maxIterations', 'maxIterations must be an integer from 1 to 500')
  }
  if (!finiteWithin(config.gradientTolerance, Number.MIN_VALUE, 1)) {
    issue('gradientTolerance', 'gradientTolerance must be finite and positive')
  }
  if (!finiteWithin(config.relativeLossTolerance, Number.MIN_VALUE, 1)) {
    issue('relativeLossTolerance', 'relativeLossTolerance must be finite and positive')
  }
  if (!finiteWithin(config.parameterStepTolerance, Number.MIN_VALUE, 1)) {
    issue('parameterStepTolerance', 'parameterStepTolerance must be finite and positive')
  }
  if (!finiteWithin(config.validationMinDelta, 0, 1)) {
    issue('validationMinDelta', 'validationMinDelta must be finite and between 0 and 1')
  }
  if (!Number.isInteger(config.validationPatience) || config.validationPatience < 1 || config.validationPatience > 500) {
    issue('validationPatience', 'validationPatience must be an integer from 1 to 500')
  }
  if (config.method === 'armijo') {
    if (!config.armijo) {
      issue('armijo', 'armijo settings are required for the Armijo method')
    } else {
      if (!finiteWithin(config.armijo.initialStep, Number.MIN_VALUE, Number.MAX_VALUE)) {
        issue('armijo.initialStep', 'initialStep must be finite and positive')
      }
      if (!finiteWithin(config.armijo.c, Number.MIN_VALUE, 0.49999999999999994)) {
        issue('armijo.c', 'c must be finite and between 0 and 0.5')
      }
      if (!finiteWithin(config.armijo.rho, Number.MIN_VALUE, 0.9999999999999999)) {
        issue('armijo.rho', 'rho must be finite and between 0 and 1')
      }
      if (!Number.isInteger(config.armijo.maxBacktracks)
        || config.armijo.maxBacktracks < 0
        || config.armijo.maxBacktracks > 30) {
        issue('armijo.maxBacktracks', 'maxBacktracks must be an integer from 0 to 30')
      }
      if (!finiteWithin(config.armijo.minimumStep, Number.MIN_VALUE, config.armijo.initialStep)) {
        issue('armijo.minimumStep', 'minimumStep must be finite, positive, and no larger than initialStep')
      }
    }
  }
  return issues
}

function completeRun(
  config: TrainingConfig,
  trace: TracePoint[],
  bestValidation: BestValidationState,
  firstBacktrack: TracePoint | null,
  terminal: TerminalState,
  runId?: TrainingPresetId,
): TrainingRun {
  return {
    status: 'complete',
    contractVersion: BANKNOTE_CONTRACT_VERSION,
    ...(runId === undefined ? {} : { runId }),
    featureSpace: config.featureSpace,
    method: config.method,
    config,
    start: trace[0]!,
    firstBacktrack,
    bestValidation,
    terminal,
    eligibleForFinalSelection: terminal.kind === 'mathematical-convergence',
    trace,
  }
}

export function trainLogistic(
  rows: readonly BanknoteRow[],
  config: TrainingConfig,
  runId?: TrainingPresetId,
): TrainingResult {
  const issues = validateTrainingConfig(config)
  if (issues.length > 0) {
    return {
      status: 'invalid-config',
      issues,
      message: `Invalid training configuration: ${issues.map(({ field, message }) => `${field} (${message})`).join('; ')}`,
    }
  }

  const data = prepareBanknoteTrainingData(rows, config.featureSpace)
  let parameters: ParameterVector = [0, 0, 0, 0, 0]
  let current = lossAndGrad(data.trainX, data.trainY, parameters, config.l2)
  const initialValidationBce = dataBce(data.validationX, data.validationY, parameters)
  const initial: TracePoint = {
    iteration: 0,
    trainBce: current.bce,
    validationBce: initialValidationBce,
    objective: current.objective,
    gradientNorm: vectorNorm(current.gradient),
    parameterStepNorm: 0,
    acceptedStepSize: 0,
    backtrackCount: 0,
    relativeObjectiveChange: null,
    isBestValidation: true,
    parameters: cloneParameters(parameters),
  }
  const trace = [initial]
  let bestValidation: BestValidationState = {
    iteration: 0,
    bce: initialValidationBce,
    parameters: cloneParameters(parameters),
  }
  let firstBacktrack: TracePoint | null = null

  for (let iteration = 1; iteration <= config.maxIterations; iteration += 1) {
    let nextParameters: ParameterVector
    let next: LossAndGradient
    let acceptedStepSize: number
    let backtrackCount: number

    if (config.method === 'armijo') {
      const step = armijoStep({
        features: data.trainX,
        targets: data.trainY,
        parameters,
        current,
        l2: config.l2,
        config: config.armijo!,
      })
      if (!step.accepted) {
        return completeRun(
          config,
          trace,
          bestValidation,
          firstBacktrack,
          terminalState('line-search-failed', trace.at(-1)!.iteration, iteration),
          runId,
        )
      }
      nextParameters = step.parameters
      next = step.evaluation
      acceptedStepSize = step.stepSize
      backtrackCount = step.backtrackCount
    } else {
      nextParameters = candidateParameters(parameters, current.gradient, config.step)
      if (!allFinite(nextParameters)) {
        return completeRun(
          config,
          trace,
          bestValidation,
          firstBacktrack,
          terminalState('non-finite', trace.at(-1)!.iteration, iteration),
          runId,
        )
      }
      next = lossAndGrad(data.trainX, data.trainY, nextParameters, config.l2)
      acceptedStepSize = config.step
      backtrackCount = 0
    }

    const parameterStepNorm = vectorNorm(nextParameters.map((value, index) => value - parameters[index]!))
    const validationBce = dataBce(data.validationX, data.validationY, nextParameters)
    const relativeObjectiveChange = Math.abs(next.objective - current.objective) / Math.max(1, Math.abs(current.objective))
    if (
      !allFinite(nextParameters)
      || !finiteEvaluation(next)
      || !Number.isFinite(parameterStepNorm)
      || !Number.isFinite(validationBce)
      || !Number.isFinite(relativeObjectiveChange)
    ) {
      return completeRun(
        config,
        trace,
        bestValidation,
        firstBacktrack,
        terminalState('non-finite', trace.at(-1)!.iteration, iteration),
        runId,
      )
    }

    const isBestValidation = validationBce < bestValidation.bce - config.validationMinDelta
    if (isBestValidation) {
      bestValidation = {
        iteration,
        bce: validationBce,
        parameters: cloneParameters(nextParameters),
      }
    }
    const point: TracePoint = {
      iteration,
      trainBce: next.bce,
      validationBce,
      objective: next.objective,
      gradientNorm: vectorNorm(next.gradient),
      parameterStepNorm,
      acceptedStepSize,
      backtrackCount,
      relativeObjectiveChange,
      isBestValidation,
      parameters: cloneParameters(nextParameters),
    }
    trace.push(point)
    if (firstBacktrack === null && backtrackCount > 0) firstBacktrack = point
    parameters = nextParameters
    current = next

    const terminal = shouldStop({
      iteration,
      gradientNorm: point.gradientNorm,
      relativeObjectiveChange,
      parameterStepNorm,
      iterationsSinceBestValidation: iteration - bestValidation.iteration,
      maxIterations: config.maxIterations,
      gradientTolerance: config.gradientTolerance,
      relativeLossTolerance: config.relativeLossTolerance,
      parameterStepTolerance: config.parameterStepTolerance,
      validationPatience: config.validationPatience,
    })
    if (terminal) return completeRun(config, trace, bestValidation, firstBacktrack, terminal, runId)
  }

  return completeRun(
    config,
    trace,
    bestValidation,
    firstBacktrack,
    terminalState('max-iterations', trace.at(-1)!.iteration),
    runId,
  )
}

export function runBanknotePreset(
  runId: TrainingPresetId,
  rows: readonly BanknoteRow[],
): TrainingRun {
  const presetDefinition = BANKNOTE_TRAINING_PRESETS[runId]
  if (!presetDefinition) throw new RangeError(`Unknown Banknote training preset: ${String(runId)}`)
  const result = trainLogistic(rows, {
    ...presetDefinition.config,
    armijo: presetDefinition.config.armijo ? { ...presetDefinition.config.armijo } : null,
  }, runId)
  if (result.status !== 'complete') {
    throw new Error(`Locked preset ${runId} failed validation: ${result.message}`)
  }
  return result
}

export function selectFinalTrainingRun(runs: readonly TrainingRun[]): TrainingRun | undefined {
  return runs
    .filter(({ terminal }) => terminal.kind === 'mathematical-convergence')
    .reduce<TrainingRun | undefined>((selected, candidate) => (
      selected === undefined || candidate.bestValidation.bce < selected.bestValidation.bce
        ? candidate
        : selected
    ), undefined)
}

const fixtureStart: TracePoint = {
  iteration: 0,
  trainBce: Math.LN2,
  validationBce: Math.LN2,
  objective: Math.LN2,
  gradientNorm: 0.44123397955093496,
  parameterStepNorm: 0,
  acceptedStepSize: 0,
  backtrackCount: 0,
  relativeObjectiveChange: null,
  isBestValidation: true,
  parameters: [0, 0, 0, 0, 0],
}

export function evaluateBatch4TerminalFixtures(): TerminalFixture[] {
  const common = {
    gradientTolerance: 1e-5,
    relativeLossTolerance: 1e-10,
    parameterStepTolerance: 1e-7,
    validationPatience: 60,
  }
  const evaluated = [
    {
      fixtureId: 'priority-gradient',
      terminal: shouldStop({
        ...common,
        iteration: 3,
        gradientNorm: 1e-6,
        relativeObjectiveChange: 0,
        parameterStepNorm: 0,
        iterationsSinceBestValidation: 60,
        maxIterations: 3,
      })!,
    },
    {
      fixtureId: 'priority-loss-step',
      terminal: shouldStop({
        ...common,
        iteration: 3,
        gradientNorm: 1,
        relativeObjectiveChange: 1e-12,
        parameterStepNorm: 1e-8,
        iterationsSinceBestValidation: 60,
        maxIterations: 3,
      })!,
    },
    {
      fixtureId: 'priority-validation',
      terminal: shouldStop({
        ...common,
        iteration: 60,
        gradientNorm: 1,
        relativeObjectiveChange: 1,
        parameterStepNorm: 1,
        iterationsSinceBestValidation: 60,
        maxIterations: 60,
      })!,
    },
    {
      fixtureId: 'priority-max',
      terminal: shouldStop({
        ...common,
        iteration: 5,
        gradientNorm: 1,
        relativeObjectiveChange: 1,
        parameterStepNorm: 1,
        iterationsSinceBestValidation: 0,
        maxIterations: 5,
      })!,
    },
  ]
  return [
    ...evaluated.map(({ fixtureId, terminal }) => ({ fixtureId, terminal, trace: [] })),
    {
      fixtureId: 'non-finite-probe',
      terminal: terminalState('non-finite', 0, 1),
      trace: [{ ...fixtureStart, parameters: cloneParameters(fixtureStart.parameters) }],
    },
    {
      fixtureId: 'line-search-probe',
      terminal: terminalState('line-search-failed', 0, 1),
      trace: [{ ...fixtureStart, parameters: cloneParameters(fixtureStart.parameters) }],
    },
  ]
}
