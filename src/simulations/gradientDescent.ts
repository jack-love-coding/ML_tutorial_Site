import type { ExperimentConfig, ModuleSimulation, PlotPoint, TrainingSnapshot } from '../types/ml'
import { clamp, magnitude } from '../utils/math'
import { createSeededRandom } from '../utils/rng'
import {
  clampPointToLossDomain,
  defaultGradientLossFunctionId,
  getGradientLossFunctionDefinition,
  getNearestReferenceDistance,
} from './gradientLossFunctions'

function getNoiseScale(mode: string) {
  if (mode === 'mini-batch') return 0.12
  if (mode === 'stochastic') return 0.24
  return 0
}

function getStatusKey(
  previousLoss: number | undefined,
  currentLoss: number,
  gradientNorm: number,
  batchMode: string,
  functionId: string,
  referenceDistance: number | undefined,
) {
  if (functionId === 'multi-well' && gradientNorm < 0.26 && (referenceDistance ?? 0) > 0.8) {
    return 'observations.gradientTrappedLocal'
  }

  if (functionId === 'saddle' && gradientNorm < 0.12 && (referenceDistance ?? 0) < 0.28) {
    return 'observations.gradientSaddle'
  }

  if (previousLoss !== undefined && currentLoss > previousLoss + 0.02) {
    return 'observations.gradientOscillating'
  }

  if (gradientNorm < 0.12 && (referenceDistance ?? 0) > 0.55) {
    return 'observations.gradientFlatRegion'
  }

  if (batchMode === 'stochastic') return 'observations.gradientNoisy'
  return 'observations.gradientStable'
}

export function simulateGradientDescent(config: ExperimentConfig): ModuleSimulation {
  const functionId = String(config.lossFunction ?? defaultGradientLossFunctionId)
  const definition = getGradientLossFunctionDefinition(functionId)
  const learningRate = Number(config.learningRate)
  const iterations = Number(config.iterations)
  const batchMode = String(config.batchMode)
  const random = createSeededRandom(7)
  const noiseScale = getNoiseScale(batchMode)
  const snapshots: TrainingSnapshot[] = []
  const trajectory: PlotPoint[] = []

  const startPoint = clampPointToLossDomain(definition, {
    x: Number(config.startX ?? definition.defaultStart.x),
    y: Number(config.startY ?? definition.defaultStart.y),
  })

  let x = startPoint.x
  let y = startPoint.y

  for (let step = 0; step <= iterations; step += 1) {
    const gradient = definition.gradient(x, y)
    const point = { x, y }
    const loss = definition.loss(x, y)
    const gradientNorm = magnitude(gradient.x, gradient.y)
    const stepSize = learningRate * gradientNorm
    const referenceDistance = getNearestReferenceDistance(definition, point)
    const statusKey = getStatusKey(
      snapshots[snapshots.length - 1]?.loss,
      loss,
      gradientNorm,
      batchMode,
      definition.id,
      referenceDistance,
    )

    trajectory.push(point)
    snapshots.push({
      step,
      loss,
      point,
      gradient,
      trajectory: [...trajectory],
      extraMetric: gradientNorm,
      functionId: definition.id,
      referenceDistance,
      derivedMetrics: {
        stepSize,
        statusKey,
        gradientNorm,
      },
    })

    const nextX = x - learningRate * (gradient.x + (random() - 0.5) * noiseScale)
    const nextY = y - learningRate * (gradient.y + (random() - 0.5) * noiseScale)
    const nextPoint = clampPointToLossDomain(definition, { x: nextX, y: nextY })

    x = clamp(nextPoint.x, definition.domain.xMin, definition.domain.xMax)
    y = clamp(nextPoint.y, definition.domain.yMin, definition.domain.yMax)
  }

  return { snapshots }
}
