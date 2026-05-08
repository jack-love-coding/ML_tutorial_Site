export type MonteCarloGeneratorKind = 'stable' | 'short-cycle'

export interface LcgConfig {
  modulus: number
  multiplier: number
  increment: number
  seed: number
}

export interface MonteCarloPoint {
  x: number
  y: number
  inside: boolean
}

export interface PiEstimateOptions {
  samples: number
  seed: number
  generatorKind: MonteCarloGeneratorKind
  visiblePoints?: number
}

const stableModulus = 2_147_483_647

export function stableLcgConfig(seed: number): LcgConfig {
  return {
    modulus: stableModulus,
    multiplier: 48_271,
    increment: 0,
    seed: normalizeSeed(seed, stableModulus),
  }
}

export function shortCycleLcgConfig(seed: number): LcgConfig {
  return {
    modulus: 31,
    multiplier: 7,
    increment: 3,
    seed: normalizeSeed(seed, 31),
  }
}

export function lcgConfigForKind(kind: MonteCarloGeneratorKind, seed: number): LcgConfig {
  return kind === 'stable' ? stableLcgConfig(seed) : shortCycleLcgConfig(seed)
}

export function normalizeSeed(seed: number, modulus: number) {
  const integerSeed = Math.floor(Math.abs(seed))
  const normalized = integerSeed % modulus
  return normalized === 0 ? 1 : normalized
}

export function lcgStep(current: number, config: LcgConfig) {
  return (config.multiplier * current + config.increment) % config.modulus
}

export function lcgSequence(config: LcgConfig, length: number) {
  let state = normalizeSeed(config.seed, config.modulus)
  return Array.from({ length }, () => {
    state = lcgStep(state, config)
    return state
  })
}

export function findLcgPeriod(config: LcgConfig, maxSteps = 10_000) {
  let state = normalizeSeed(config.seed, config.modulus)
  const seen = new Map<number, number>()

  for (let step = 0; step <= maxSteps; step += 1) {
    if (seen.has(state)) {
      return step - seen.get(state)!
    }
    seen.set(state, step)
    state = lcgStep(state, config)
  }

  return undefined
}

export function createLcg(config: LcgConfig) {
  let state = normalizeSeed(config.seed, config.modulus)
  return () => {
    state = lcgStep(state, config)
    return state / config.modulus
  }
}

export function monteCarloPiStandardError(samples: number, successProbability = Math.PI / 4) {
  return 4 * Math.sqrt((successProbability * (1 - successProbability)) / Math.max(1, samples))
}

export function estimatePiMonteCarlo(options: PiEstimateOptions) {
  const sampleCount = Math.max(1, Math.floor(options.samples))
  const visibleLimit = Math.max(0, Math.floor(options.visiblePoints ?? 240))
  const random = createLcg(lcgConfigForKind(options.generatorKind, options.seed))
  const points: MonteCarloPoint[] = []
  let inside = 0

  for (let index = 0; index < sampleCount; index += 1) {
    const x = random()
    const y = random()
    const pointInside = x * x + y * y <= 1

    if (pointInside) inside += 1
    if (points.length < visibleLimit) points.push({ x, y, inside: pointInside })
  }

  const estimate = (4 * inside) / sampleCount
  const absoluteError = Math.abs(Math.PI - estimate)
  const insideRatio = inside / sampleCount

  return {
    samples: sampleCount,
    inside,
    insideRatio,
    estimate,
    absoluteError,
    scaledError: absoluteError * Math.sqrt(sampleCount),
    standardError: monteCarloPiStandardError(sampleCount, insideRatio),
    points,
  }
}

export function estimateIntegralXSquared(samples: number, seed: number, generatorKind: MonteCarloGeneratorKind) {
  const sampleCount = Math.max(1, Math.floor(samples))
  const random = createLcg(lcgConfigForKind(generatorKind, seed))
  let total = 0

  for (let index = 0; index < sampleCount; index += 1) {
    const x = random()
    total += x * x
  }

  const estimate = total / sampleCount
  return {
    estimate,
    actual: 1 / 3,
    absoluteError: Math.abs(estimate - 1 / 3),
  }
}
