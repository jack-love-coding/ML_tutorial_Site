import { createHash } from 'node:crypto'
import { createOptimizerState, stepOptimizer } from '../../src/simulations/optimizers/index.ts'
import type { OptimizerConfig, OptimizerKind } from '../../src/types/optimizer.ts'

export interface BenchmarkRow {
  benchmark: string
  comparison: 'first-step-norm-matched' | 'predeclared-practical'
  optimizer: OptimizerKind
  update: number
  parameter: number
  trainLoss: number
  updateNorm: number
}

interface BenchmarkDefinition {
  id: string
  label: string
  selectionPolicy: string
  configs: OptimizerConfig[]
}

const round = (value: number) => Number(value.toFixed(12))
const vectorNorm = (values: readonly number[]) => Math.sqrt(values.reduce((sum, value) => sum + value * value, 0))
const hash = (value: string) => createHash('sha256').update(value).digest('hex')

export const initialParameters = Array.from({ length: 17 }, (_, index) => Math.sin((index + 1) * 1.7) * 0.16)
export const initialization = {
  algorithm: 'fixed-sine-v1: sin((index + 1) * 1.7) * 0.16; seed is intentionally not used',
  sha256: hash(JSON.stringify(initialParameters.map(round))),
}

function circleData() {
  return Array.from({ length: 80 }, (_, index) => {
    const angle = index * 2.399963229728653
    const radius = index % 2 === 0 ? 1.4 + (index % 5) * 0.08 : 3.8 + (index % 7) * 0.06
    return { x: Math.cos(angle) * radius / 4, y: Math.sin(angle) * radius / 4, label: index % 2 === 0 ? 1 : -1 }
  })
}

function gradientsFor(parameters: readonly number[], data = circleData()) {
  const gradients = Array<number>(17).fill(0)
  let loss = 0
  for (const point of data) {
    const hidden = Array.from({ length: 4 }, (_, unit) => Math.tanh(
      parameters[unit * 2]! * point.x + parameters[unit * 2 + 1]! * point.y + parameters[8 + unit]!,
    ))
    const outputInput = hidden.reduce((sum, value, unit) => sum + value * parameters[12 + unit]!, parameters[16]!)
    const output = Math.tanh(outputInput)
    const outputError = (output - point.label) * (1 - output ** 2)
    loss += 0.5 * (output - point.label) ** 2
    for (let unit = 0; unit < 4; unit += 1) {
      gradients[12 + unit]! += outputError * hidden[unit]!
      const hiddenError = outputError * parameters[12 + unit]! * (1 - hidden[unit]! ** 2)
      gradients[unit * 2]! += hiddenError * point.x
      gradients[unit * 2 + 1]! += hiddenError * point.y
      gradients[8 + unit]! += hiddenError
    }
    gradients[16]! += outputError
  }
  return { gradients: gradients.map((gradient) => gradient / data.length), loss: loss / data.length }
}

const practicalConfigs: OptimizerConfig[] = [
  { kind: 'sgd', learningRate: 0.04 },
  { kind: 'momentum', learningRate: 0.025, momentum: 0.9 },
  { kind: 'rmsprop', learningRate: 0.02, alpha: 0.95, epsilon: 1e-8 },
  { kind: 'adam', learningRate: 0.02, beta1: 0.9, beta2: 0.999, epsilon: 1e-8 },
]

function cloneWithLearningRate(config: OptimizerConfig, learningRate: number): OptimizerConfig {
  return { ...config, learningRate, weightDecay: config.weightDecay ? { ...config.weightDecay } : undefined } as OptimizerConfig
}

function firstStepNorm(config: OptimizerConfig) {
  const { gradients } = gradientsFor(initialParameters)
  const trace = stepOptimizer(initialParameters, gradients, config, createOptimizerState(config, initialParameters.length))
  return vectorNorm(trace.parametersAfter.map((value, index) => value - initialParameters[index]!))
}

const matchingTargetNorm = firstStepNorm(practicalConfigs[0]!)
const matchedConfigs = practicalConfigs.map((config) => {
  const unitNorm = firstStepNorm(cloneWithLearningRate(config, 1))
  return cloneWithLearningRate(config, matchingTargetNorm / unitNorm)
})

export const benchmarkDefinitions: BenchmarkDefinition[] = [
  {
    id: 'circle-2-4-1-tanh-first-step-norm-matched',
    label: 'First-step update-norm-matched comparison',
    selectionPolicy: 'Learning rates are derived from the common initial full-batch gradient so every optimizer has the same first full-vector update norm.',
    configs: matchedConfigs,
  },
  {
    id: 'circle-2-4-1-tanh-predeclared-practical',
    label: 'Predeclared practical settings comparison',
    selectionPolicy: 'Practical learning rates were predeclared before training; this result is intentionally separate from the matched comparison.',
    configs: practicalConfigs,
  },
]

export function generateTrajectoryPackage() {
  const data = circleData()
  const rows: BenchmarkRow[] = []
  const benchmarks = benchmarkDefinitions.map((definition) => {
    const firstStepUpdateNorms: Record<OptimizerKind, number> = { sgd: 0, momentum: 0, rmsprop: 0, adam: 0 }
    for (const config of definition.configs) {
      let parameters = [...initialParameters]
      let state = createOptimizerState(config, parameters.length)
      const initial = gradientsFor(parameters, data)
      rows.push({ benchmark: definition.id, comparison: definition.id.includes('matched') ? 'first-step-norm-matched' : 'predeclared-practical', optimizer: config.kind, update: 0, parameter: round(vectorNorm(parameters)), trainLoss: round(initial.loss), updateNorm: 0 })
      for (let update = 1; update <= 40; update += 1) {
        const current = gradientsFor(parameters, data)
        const trace = stepOptimizer(parameters, current.gradients, config, state)
        const updateNorm = vectorNorm(trace.parametersAfter.map((value, index) => value - parameters[index]!))
        parameters = trace.parametersAfter
        state = trace.state
        const after = gradientsFor(parameters, data)
        if (update === 1) firstStepUpdateNorms[config.kind] = round(updateNorm)
        rows.push({ benchmark: definition.id, comparison: definition.id.includes('matched') ? 'first-step-norm-matched' : 'predeclared-practical', optimizer: config.kind, update, parameter: round(vectorNorm(parameters)), trainLoss: round(after.loss), updateNorm: round(updateNorm) })
      }
    }
    return {
      id: definition.id,
      label: definition.label,
      updates: 40,
      selectionPolicy: definition.selectionPolicy,
      optimizers: definition.configs,
      firstStepUpdateNorms,
    }
  })
  if (rows.length !== 2 * 4 * 41) throw new Error(`expected 328 trajectory rows, received ${rows.length}`)
  return { version: 'optimizer-comparison-v2', rows, benchmarks, initialization }
}

if (import.meta.url === `file://${process.argv[1]}`) process.stdout.write(`${JSON.stringify(generateTrajectoryPackage())}\n`)
