import { createHash } from 'node:crypto'
import { createOptimizerState, stepOptimizer } from '../../src/simulations/optimizers/index.ts'

export interface BanknoteMetrics { examples: number; loss: number; accuracy: number }
export interface BanknoteTransferArtifact {
  sourceDataset: string
  sourceSha256: string
  splitCounts: { train: number; validation: number; test: number }
  preprocessing: { fitSplit: 'train'; ddof: 0; means: Record<string, number>; scales: Record<string, number> }
  version: string
  model: { kind: 'standardized-logistic-regression'; parameterCount: 5; threshold: 0.5 }
  frozenSelection: { optimizer: 'adamw'; learningRate: number; beta1: number; beta2: number; epsilon: number; weightDecay: number; batchSize: number; epochs: number; reason: string }
  training: { split: 'train'; updates: number; batchOrder: 'fixed-source-order'; parametersAfterTraining: number[] }
  validationEvaluation: { evaluatedAfterTraining: true; metrics: BanknoteMetrics }
  finalTestEvaluation: { permittedAfterSelectionFreeze: true; evaluationCount: 1; selectionUsedTest: false; timing: string; metrics: BanknoteMetrics }
}

const features = ['variance', 'skewness', 'curtosis', 'entropy'] as const
const rounded = (value: number) => Number(value.toFixed(12))
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')

function parseRows(sourceText: string) {
  const lines = sourceText.trim().split('\n')
  const header = lines.shift()?.split(',') ?? []
  return lines.map((line) => Object.fromEntries(header.map((key, index) => [key, line.split(',')[index] ?? ''])))
}

function metricSummary(rows: readonly { features: number[]; label: number }[], parameters: readonly number[]): BanknoteMetrics {
  let correct = 0
  let loss = 0
  for (const row of rows) {
    const logit = parameters.slice(0, 4).reduce((sum, weight, index) => sum + weight * row.features[index]!, parameters[4]!)
    const probability = 1 / (1 + Math.exp(-logit))
    loss -= row.label * Math.log(Math.max(probability, 1e-12)) + (1 - row.label) * Math.log(Math.max(1 - probability, 1e-12))
    correct += Number((probability >= 0.5 ? 1 : 0) === row.label)
  }
  return { examples: rows.length, loss: rounded(loss / rows.length), accuracy: rounded(correct / rows.length) }
}

/** Pure authoring computation: source CSV text in, frozen published artifact out. */
export function computeBanknoteTransfer(sourceText: string): BanknoteTransferArtifact {
  const rows = parseRows(sourceText)
  const grouped = Object.fromEntries(['train', 'validation', 'test'].map((split) => [split, rows.filter((row) => row.split === split)])) as Record<'train' | 'validation' | 'test', Record<string, string>[]>
  const means = Object.fromEntries(features.map((feature) => [feature, grouped.train.reduce((sum, row) => sum + Number(row[feature]), 0) / grouped.train.length]))
  const scales = Object.fromEntries(features.map((feature) => [feature, Math.sqrt(grouped.train.reduce((sum, row) => sum + (Number(row[feature]) - means[feature]!) ** 2, 0) / grouped.train.length)]))
  const preprocessing = { fitSplit: 'train' as const, ddof: 0 as const, means, scales }
  const standardized = Object.fromEntries((['train', 'validation', 'test'] as const).map((split) => [split, grouped[split].map((row) => ({
    features: features.map((feature) => (Number(row[feature]) - means[feature]!) / scales[feature]!),
    label: Number(row.class),
  }))])) as Record<'train' | 'validation' | 'test', { features: number[]; label: number }[]>
  const frozenSelection = {
    optimizer: 'adamw' as const, learningRate: 0.01, beta1: 0.9, beta2: 0.999, epsilon: 1e-8, weightDecay: 0.0001, batchSize: 64, epochs: 16,
    reason: 'predeclared practical AdamW configuration; validation is recorded before the frozen test evaluation',
  }
  const config = { kind: 'adam' as const, learningRate: frozenSelection.learningRate, beta1: frozenSelection.beta1, beta2: frozenSelection.beta2, epsilon: frozenSelection.epsilon, weightDecay: { kind: 'adamw' as const, coefficient: frozenSelection.weightDecay } }
  let parameters = [0, 0, 0, 0, 0]
  let state = createOptimizerState(config, parameters.length)
  let updates = 0
  for (let epoch = 0; epoch < frozenSelection.epochs; epoch += 1) {
    for (let offset = 0; offset < standardized.train.length; offset += frozenSelection.batchSize) {
      const subset = standardized.train.slice(offset, offset + frozenSelection.batchSize)
      const gradients = Array<number>(5).fill(0)
      for (const row of subset) {
        const logit = parameters.slice(0, 4).reduce((sum, weight, index) => sum + weight * row.features[index]!, parameters[4]!)
        const error = 1 / (1 + Math.exp(-logit)) - row.label
        row.features.forEach((value, index) => { gradients[index]! += error * value })
        gradients[4]! += error
      }
      const trace = stepOptimizer(parameters, gradients.map((value) => value / subset.length), config, state)
      parameters = trace.parametersAfter
      state = trace.state
      updates += 1
    }
  }
  const validation = metricSummary(standardized.validation, parameters)
  const test = metricSummary(standardized.test, parameters)
  return {
    sourceDataset: '/datasets/numerical-methods/banknote-authentication.csv', sourceSha256: sha256(sourceText), splitCounts: { train: grouped.train.length, validation: grouped.validation.length, test: grouped.test.length }, preprocessing,
    version: 'banknote-transfer-v1', model: { kind: 'standardized-logistic-regression', parameterCount: 5, threshold: 0.5 }, frozenSelection,
    training: { split: 'train', updates, batchOrder: 'fixed-source-order', parametersAfterTraining: parameters.map(rounded) },
    validationEvaluation: { evaluatedAfterTraining: true, metrics: validation },
    finalTestEvaluation: { permittedAfterSelectionFreeze: true, evaluationCount: 1, selectionUsedTest: false, timing: 'after predeclared configuration freeze and validation recording', metrics: test },
  }
}
