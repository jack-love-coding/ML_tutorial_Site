export interface TokenLogit {
  token: string
  logit: number
}

export interface TokenProbability extends TokenLogit {
  probability: number
}

export interface NextTokenPair {
  position: number
  inputToken: string
  targetToken: string
}

export const generationTokenLogits: readonly TokenLogit[] = [
  { token: '模型', logit: 2.4 },
  { token: '学习', logit: 3.2 },
  { token: '生成', logit: 2.1 },
  { token: '答案', logit: 1.4 },
  { token: '。', logit: 0.7 },
]

function assertFiniteValues(values: readonly number[]) {
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new TypeError('logits must be a non-empty list of finite numbers')
  }
}

export function softmaxWithTemperature(
  logits: readonly number[],
  temperature: number,
): number[] {
  assertFiniteValues(logits)
  if (!Number.isFinite(temperature) || temperature <= 0) {
    throw new RangeError('temperature must be a positive finite number')
  }

  const scaled = logits.map((logit) => logit / temperature)
  const maximum = Math.max(...scaled)
  const exponentials = scaled.map((value) => Math.exp(value - maximum))
  const total = exponentials.reduce((sum, value) => sum + value, 0)
  return exponentials.map((value) => value / total)
}

export function topKTokenDistribution(
  candidates: readonly TokenLogit[],
  temperature: number,
  topK: number,
): TokenProbability[] {
  if (candidates.length === 0) throw new TypeError('candidates must not be empty')
  if (!Number.isInteger(topK) || topK < 1 || topK > candidates.length) {
    throw new RangeError('topK must be an integer within the candidate count')
  }

  const selected = [...candidates]
    .sort((left, right) => right.logit - left.logit)
    .slice(0, topK)
  const probabilities = softmaxWithTemperature(
    selected.map((candidate) => candidate.logit),
    temperature,
  )

  return selected.map((candidate, index) => ({
    ...candidate,
    probability: probabilities[index]!,
  }))
}

export function buildNextTokenPairs(tokens: readonly string[]): NextTokenPair[] {
  return tokens.slice(0, -1).map((inputToken, position) => ({
    position,
    inputToken,
    targetToken: tokens[position + 1]!,
  }))
}

export function buildCausalMask(size: number): boolean[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError('causal mask size must be a positive integer')
  }
  return Array.from({ length: size }, (_, queryIndex) =>
    Array.from({ length: size }, (_, keyIndex) => keyIndex <= queryIndex),
  )
}
