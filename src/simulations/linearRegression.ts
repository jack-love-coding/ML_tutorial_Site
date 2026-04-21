import type { ExperimentConfig, ModuleSimulation, PlotPoint, TrainingSnapshot } from '../types/ml'

type LinearRegressionScenario = 'linear' | 'curved'

interface NormalizedStats {
  meanX: number
  meanY: number
  scaleX: number
  scaleY: number
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

function createHousingSamples(
  noise: number,
  includeOutlier: boolean,
  outlierStrength: number,
  scenario: LinearRegressionScenario,
): PlotPoint[] {
  const baseSamples = [
    { x: 48, y: 118 },
    { x: 61, y: 132 },
    { x: 74, y: 149 },
    { x: 86, y: 171 },
    { x: 99, y: 191 },
    { x: 114, y: 216 },
    { x: 134, y: 242 },
    { x: 158, y: 279 },
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
    }
  })

  if (includeOutlier) {
    adjusted.push({
      x: 126,
      y: 182 + outlierStrength,
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

function predictPrice(area: number, slope: number, intercept: number) {
  return slope * area + intercept
}

function computeLoss(samples: PlotPoint[], slope: number, intercept: number) {
  const residuals = samples.map((sample) => predictPrice(sample.x, slope, intercept) - sample.y)
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

function buildSnapshot(
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
  const { mse, mae } = computeLoss(samples, fit.slope, fit.intercept)
  const highlightIndex = step % samples.length
  const highlightedSample = samples[highlightIndex] ?? samples[0]
  const highlightedPrediction = predictPrice(highlightedSample.x, fit.slope, fit.intercept)
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
      mae,
      slope: fit.slope,
      intercept: fit.intercept,
      gradientNorm,
      stepSize,
      highlightIndex,
      statusKey: statusKeyFor(step, mse, deltaLoss, gradientNorm, scenario, includeOutlier),
      scenario,
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
      const prediction = predictPrice(sample.x, fit.slope, fit.intercept)
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

export function simulateLinearRegression(config: ExperimentConfig): ModuleSimulation {
  const learningRate = clamp(Number(config.learningRate ?? 0.12), 0.01, 0.4)
  const epochs = Math.max(12, Math.round(Number(config.epochs ?? 40)))
  const datasetNoise = clamp(Number(config.datasetNoise ?? 0.08), 0, 0.35)
  const outlierStrength = clamp(Number(config.outlierStrength ?? 42), 0, 120)
  const includeOutlier = Boolean(config.includeOutlier ?? false)
  const scenario = String(config.scenario ?? 'linear') as LinearRegressionScenario
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
    const stepSize = Math.hypot(
      learningRate * gradSlope,
      learningRate * gradIntercept,
    )

    const snapshot = buildSnapshot(
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
