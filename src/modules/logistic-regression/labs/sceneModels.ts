import {
  bernoulliLogLikelihood,
  oneRowLogisticTerms,
  sigmoidOddsTerms,
  temperatureProbability,
} from '../engine.ts'
import type { LogisticPublishedInteractionAsset } from '../types.ts'

export interface SemanticRow {
  label: string
  value: string
  emphasis?: 'normal' | 'positive' | 'warning'
}

export interface ScenePoint {
  x: number
  y: number
  label: string
  kind?: string
}

export interface BoundedNumber {
  value: number
  lastValid: number
  valid: boolean
}

const finite = (value: unknown, fallback = 0): number => typeof value === 'number' && Number.isFinite(value) ? value : fallback
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const numberList = (value: unknown): number[] => Array.isArray(value) ? value.map((entry) => finite(entry)).filter(Number.isFinite) : []
const text = (value: unknown, fallback = '—'): string => typeof value === 'string' ? value : fallback
const bounded = (value: unknown, minimum: number, maximum: number, lastValid: number): BoundedNumber => {
  // Preserve the last learner-safe value instead of injecting NaN or Infinity into SVG attributes.
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    return { value: lastValid, lastValid, valid: false }
  }
  return { value, lastValid: value, valid: true }
}

export const clampFinite = bounded
export const sceneNumber = (value: number, digits = 4): string => Number.isFinite(value) ? value.toFixed(digits) : '—'
export const scenePercent = (value: number): string => Number.isFinite(value) ? `${(value * 100).toFixed(2)}%` : '—'
export const scaleCoordinate = (value: number, minimum: number, maximum: number, outputMinimum: number, outputMaximum: number): number => {
  const safe = bounded(value, minimum, maximum, (minimum + maximum) / 2).value
  const ratio = (safe - minimum) / Math.max(maximum - minimum, Number.EPSILON)
  return outputMinimum + ratio * (outputMaximum - outputMinimum)
}

function oneRow(data: Record<string, unknown>) {
  const row = record(data.oneRow)
  const features = numberList(row.standardizedFeatures)
  const contributions = numberList(row.contributions)
  const intercept = finite(row.intercept)
  const parameters = features.map((feature, index) => feature === 0 ? 0 : contributions[index]! / feature)
  const target = finite(row.label) === 1 ? 1 : 0
  if (features.length === 4 && parameters.length === 4) {
    try { return oneRowLogisticTerms({ features, parameters: [...parameters, intercept], target }) }
    catch { /* Published fallback remains available below. */ }
  }
  const logit = finite(row.logit)
  const probability = finite(row.probability)
  return {
    features,
    contributions,
    intercept,
    target,
    logit,
    probability,
    bce: finite(row.bce),
    defaultClass: probability >= 0.5 ? 1 : 0,
    featureGradient: numberList(row.gradient).slice(0, 4),
    interceptGradient: numberList(row.gradient)[4] ?? 0,
  }
}

type LinearAsset = LogisticPublishedInteractionAsset & { sceneId: 'linear-score' }
type SigmoidAsset = LogisticPublishedInteractionAsset & { sceneId: 'sigmoid-probability' }
type LikelihoodAsset = LogisticPublishedInteractionAsset & { sceneId: 'threshold-decisions' }
type LossAsset = LogisticPublishedInteractionAsset & { sceneId: 'log-loss' }
type TrainingAsset = LogisticPublishedInteractionAsset & { sceneId: 'regularization' }
type LimitsAsset = LogisticPublishedInteractionAsset & { sceneId: 'linear-limits' }

export function buildLinearScoreSceneModel(asset: LinearAsset, rowId = 'canonical') {
  const data = record(asset.data)
  const rows = record(data.teachingRows)
  const selected = record(rows[rowId])
  const fallback = record(rows.canonical)
  const row = Object.keys(selected).length ? selected : fallback
  const standardized = numberList(row.standardized)
  const base = oneRow({ oneRow: { ...record(data.oneRow), standardizedFeatures: standardized, label: row.label, logit: row.logit, probability: row.probability, bce: row.bce } })
  const featureNames = ['variance', 'skewness', 'curtosis', 'entropy']
  const contributions = base.contributions.length ? base.contributions : standardized.map((value, index) => value * finite(base.features[index]))
  const extent = Math.max(1, ...contributions.map((value) => Math.abs(value)), Math.abs(base.intercept))
  const terms = contributions.map((value, index) => ({
    label: featureNames[index]!, value, x: 36 + index * 66, y: scaleCoordinate(value, -extent, extent, 166, 26),
  }))
  const total = finite(row.logit, contributions.reduce((sum, value) => sum + value, base.intercept))
  return {
    rowId: Number(row.row_id ?? 0), split: text(row.split), rowName: text(row.name, rowId), target: finite(row.label) === 1 ? 1 : 0,
    terms, intercept: base.intercept, total, probability: finite(row.probability), defaultClass: finite(row.probability) >= 0.5 ? 1 : 0,
    table: [
      ...terms.map((term) => ({ label: `${term.label} contribution`, value: sceneNumber(term.value, 6) })),
      { label: 'intercept', value: sceneNumber(base.intercept, 6) },
      { label: 'logit z', value: sceneNumber(total, 6) },
      { label: 'probability σ(z)', value: sceneNumber(finite(row.probability), 8) },
    ] satisfies SemanticRow[],
  }
}

export const linearScoreModel = buildLinearScoreSceneModel

export function buildSigmoidProbabilitySceneModel(asset: SigmoidAsset, logit: unknown, lastValid = 0, representation: 'probability' | 'odds' = 'probability') {
  const control = asset.controls[0]
  const safe = bounded(logit, finite(control?.minimum, -20), finite(control?.maximum, 20), lastValid)
  const terms = sigmoidOddsTerms(safe.value)
  const curve = numberList(record(asset.data).extremeScores).map((value) => {
    const item = sigmoidOddsTerms(value)
    return { x: scaleCoordinate(value, -20, 20, 18, 282), y: scaleCoordinate(item.probability, 0, 1, 150, 20), label: `z=${value}` }
  })
  const visibleValue = representation === 'odds'
    ? terms.odds === null ? 'outside display range' : sceneNumber(terms.odds, 8)
    : sceneNumber(terms.probability, 8)
  return {
    logit: safe.value, lastValid: safe.lastValid, inputValid: safe.valid, representation, terms, curve,
    point: { x: scaleCoordinate(safe.value, -20, 20, 18, 282), y: scaleCoordinate(terms.probability, 0, 1, 150, 20), label: 'current probability' },
    table: [
      { label: 'logit = log-odds', value: sceneNumber(terms.logit, 6) },
      { label: representation === 'odds' ? 'odds = exp(z)' : 'probability = σ(z)', value: visibleValue },
      { label: '0.5 bridge → class', value: `class ${terms.defaultClass}` },
      { label: 'input status', value: safe.valid ? 'finite and bounded' : 'last valid value restored', emphasis: safe.valid ? 'positive' : 'warning' },
    ] satisfies SemanticRow[],
  }
}

export const sigmoidProbabilityModel = buildSigmoidProbabilitySceneModel

export function buildLikelihoodSceneModel(asset: LikelihoodAsset, requestedRows: unknown, lastValid = 1) {
  const data = record(asset.data)
  const rows = Array.isArray(data.likelihoodRows) ? data.likelihoodRows.map(record) : []
  const safe = bounded(requestedRows, 1, Math.max(rows.length, 1), lastValid)
  const count = Math.max(1, Math.min(rows.length, Math.round(safe.value)))
  const selected = rows.slice(0, count)
  const probabilityTerms = selected.map((row) => Math.max(0, Math.min(1, finite(row.probabilityTerm))))
  const logTerms = selected.map((row) => finite(row.logTerm))
  const product = probabilityTerms.reduce((total, value) => total * value, 1)
  const logLikelihood = logTerms.reduce((total, value) => total + value, 0)
  const meanBce = -logLikelihood / Math.max(count, 1)
  return {
    count, lastValid: safe.lastValid, inputValid: safe.valid,
    steps: selected.map((row, index) => ({ index: index + 1, rowId: Number(row.rowId), split: text(row.split), label: finite(row.label) === 1 ? 1 : 0, probabilityTerm: probabilityTerms[index]!, logTerm: logTerms[index]!, cumulativeProduct: probabilityTerms.slice(0, index + 1).reduce((total, value) => total * value, 1), cumulativeLogLikelihood: logTerms.slice(0, index + 1).reduce((total, value) => total + value, 0) })),
    product, productStatus: product === 0 ? 'underflowed' : 'finite', logLikelihood, meanBce,
    table: [
      { label: 'probability product', value: product === 0 ? 'underflowed to 0' : sceneNumber(product, 12), emphasis: product === 0 ? 'warning' : 'normal' },
      { label: 'log-likelihood Σ log p', value: sceneNumber(logLikelihood, 8) },
      { label: 'mean BCE = −log L / n', value: sceneNumber(meanBce, 8) },
      { label: 'rows accumulated', value: `${count}` },
    ] satisfies SemanticRow[],
  }
}

export const likelihoodModel = buildLikelihoodSceneModel

export function buildLogLossGradientSceneModel(asset: LossAsset, step: unknown, lastValid = 1e-6) {
  const data = record(asset.data)
  const finiteDifference = record(data.finiteDifference)
  const steps = Array.isArray(finiteDifference.steps) ? finiteDifference.steps.map(record) : []
  const allowed = steps.map((item) => finite(item.h)).filter((value) => value > 0)
  const candidate = typeof step === 'number' && Number.isFinite(step) && allowed.includes(step) ? step : lastValid
  const selected = steps.find((item) => finite(item.h) === candidate) ?? steps.find((item) => finite(item.h) === lastValid) ?? steps[0] ?? {}
  const analytic = numberList(selected.analyticGradient)
  const numeric = numberList(selected.centeredGradient)
  const errors = numberList(selected.componentErrors)
  const order = Array.isArray(finiteDifference.parameterOrder) ? finiteDifference.parameterOrder.map((item) => text(item)) : []
  const row = oneRow(data)
  return {
    step: finite(selected.h, lastValid), lastValid: finite(selected.h, lastValid), inputValid: candidate === step,
    parameterRows: analytic.map((value, index) => ({ label: order[index] ?? `θ${index}`, analytic: value, numeric: numeric[index] ?? 0, error: errors[index] ?? Math.abs(value - (numeric[index] ?? 0)) })),
    rowGradient: [...row.featureGradient, row.interceptGradient], rowBce: row.bce,
    table: analytic.map((value, index) => ({ label: order[index] ?? `θ${index}`, value: `analytic ${sceneNumber(value, 9)} · centered ${sceneNumber(numeric[index] ?? 0, 9)} · error ${sceneNumber(errors[index] ?? 0, 12)}` })) as SemanticRow[],
  }
}

export const logLossGradientModel = buildLogLossGradientSceneModel

export function buildTrainingParitySceneModel(asset: TrainingAsset, requested: unknown, lastValid: 'scratch' | 'sklearn' | 'l2' = 'scratch', traceIndex = 0) {
  const data = record(asset.data)
  const mode = requested === 'scratch' || requested === 'sklearn' || requested === 'l2' ? requested : lastValid
  const selected = record(data[mode])
  const scratch = record(data.scratch)
  const trace = Array.isArray(scratch.trace) ? scratch.trace.map(record) : []
  const boundedIndex = Math.max(0, Math.min(trace.length - 1, Number.isFinite(traceIndex) ? Math.round(traceIndex) : 0))
  const activeTrace = trace[boundedIndex] ?? {}
  const parameters = numberList(selected.parameters)
  const objective = finite(selected.objectiveValue, finite(activeTrace.objective))
  const title = mode === 'l2' ? 'L2 changes the objective' : mode === 'sklearn' ? 'precomputed sklearn parity' : 'scratch Armijo trace'
  return {
    mode, lastValid: mode, traceIndex: boundedIndex, traceLength: trace.length,
    title, parameters, objective, activeTrace,
    table: [
      { label: 'mode', value: title },
      { label: 'objective', value: sceneNumber(objective, 9) },
      { label: 'parameters', value: parameters.map((value) => sceneNumber(value, 5)).join(', ') },
      { label: 'replay boundary', value: 'published deterministic trace — no browser fitting' },
    ] satisfies SemanticRow[],
  }
}

export const trainingParityModel = buildTrainingParitySceneModel

export function buildCalibrationLimitsSceneModel(asset: LimitsAsset, requestedMode: unknown, lastValid: 'original' | 'sharpened' | 'softened' = 'original', requestedView: 'banknote' | 'xor' | 'circles' = 'banknote') {
  const data = record(asset.data)
  const calibration = record(data.calibration)
  const modes = Array.isArray(calibration.modes) ? calibration.modes.map(record) : []
  const mode = requestedMode === 'original' || requestedMode === 'sharpened' || requestedMode === 'softened' ? requestedMode : lastValid
  const selected = modes.find((item) => item.id === mode) ?? modes.find((item) => item.id === lastValid) ?? modes[0] ?? {}
  const bins = Array.isArray(selected.bins) ? selected.bins.map(record).slice(0, 12) : []
  const source = requestedView === 'xor' ? record(data.xor) : requestedView === 'circles' ? record(data.circles) : undefined
  const points = source && Array.isArray(source.points) ? source.points.map(record).slice(0, 96).map((point, index) => ({ x: finite(point.x), y: finite(point.y), label: `synthetic point ${index + 1}, class ${finite(point.label)}`, kind: finite(point.label) === 1 ? 'class-1' : 'class-0' })) : []
  const expectedCalibrationError = finite(selected.expectedCalibrationError)
  const accuracy = finite(selected.fixedThresholdAccuracy)
  return {
    mode, lastValid: mode, view: requestedView, bins: bins.map((bin) => ({ lower: finite(bin.lower), upper: finite(bin.upper), count: finite(bin.count), meanProbability: typeof bin.meanProbability === 'number' ? bin.meanProbability : null, observedRate: typeof bin.observedRate === 'number' ? bin.observedRate : null })),
    expectedCalibrationError, accuracy, points,
    dataKind: source ? 'synthetic diagnostic — never used for Banknote fitting' : 'frozen Banknote validation logits',
    table: source
      ? [{ label: 'data provenance', value: 'synthetic diagnostic only; it cannot alter Banknote rows or calibration', emphasis: 'warning' }, { label: 'geometry', value: text(source.kind) }, { label: 'points', value: `${points.length}` }]
      : [{ label: 'data provenance', value: 'frozen Banknote validation logits' }, { label: 'mode', value: mode }, { label: 'expected calibration error', value: sceneNumber(expectedCalibrationError, 8) }, { label: 'fixed 0.5 validation accuracy', value: scenePercent(accuracy) }],
  }
}

export const calibrationLimitsModel = buildCalibrationLimitsSceneModel

/** User-started playback state used by scenes. Reduced motion retains explicit step/reset only. */
export function createScenePlayback(maximum: number, reducedMotion = false) {
  let current = 0
  let timer: ReturnType<typeof setInterval> | undefined
  const safeMaximum = Math.max(0, Math.floor(finite(maximum)))
  const stop = () => { if (timer) clearInterval(timer); timer = undefined }
  return {
    get value() { return current },
    get playing() { return Boolean(timer) },
    step() { current = Math.min(safeMaximum, current + 1); return current },
    reset() { stop(); current = 0; return current },
    play(callback: (value: number) => void, interval = 700) {
      if (reducedMotion || timer) return false
      timer = setInterval(() => { const value = this.step(); callback(value); if (value >= safeMaximum) stop() }, Math.max(200, finite(interval, 700)))
      return true
    },
    dispose: stop,
  }
}
