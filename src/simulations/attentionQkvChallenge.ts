export type AttentionQkvScenarioId =
  | 'matching-key'
  | 'causal-mask'
  | 'padding-mask'
  | 'value-mixture'

export type AttentionMaskKind = 'none' | 'causal' | 'padding'

export interface AttentionQkvPrediction {
  topKeyId: string
  maskChangesTopKey: boolean
}

export interface AttentionQkvToken {
  id: string
  label: string
  query: number[]
  key: number[]
  value: number[]
  masked?: boolean
}

export interface AttentionQkvScenario {
  id: AttentionQkvScenarioId
  queryTokenId: string
  maskKind: AttentionMaskKind
  tokens: AttentionQkvToken[]
  expectedTopKeyId: string
  expectedMaskChangesTopKey: boolean
}

export interface AttentionQkvChallengeSnapshot {
  scenario: AttentionQkvScenario
  evidence: {
    rawScores: Array<{ keyId: string; score: number }>
    maskedScores: Array<{ keyId: string; score: number | null; masked: boolean }>
    weights: Array<{ keyId: string; weight: number; masked: boolean }>
    topKeyId: string
    rawTopKeyId: string
    rowWeightSum: number
    weightedValue: number[]
    valueContributions: Array<{ keyId: string; contribution: number[] }>
  }
  result: {
    topKeyCorrect: boolean
    maskEffectCorrect: boolean
    allCorrect: boolean
  }
}

export interface AttentionQkvChallengeInput {
  scenarioId: string
  prediction: AttentionQkvPrediction
}

export const attentionQkvScenarios: AttentionQkvScenario[] = [
  {
    id: 'matching-key',
    queryTokenId: 'alpha',
    maskKind: 'none',
    expectedTopKeyId: 'alpha',
    expectedMaskChangesTopKey: false,
    tokens: [
      { id: 'alpha', label: 'alpha', query: [1, 0], key: [1, 0], value: [1, 0] },
      { id: 'beta', label: 'beta', query: [0, 1], key: [0, 1], value: [0, 1] },
      { id: 'blend', label: 'blend', query: [0.4, 0.4], key: [0.3, 0.3], value: [0.5, 0.5] },
    ],
  },
  {
    id: 'causal-mask',
    queryTokenId: 'current',
    maskKind: 'causal',
    expectedTopKeyId: 'current',
    expectedMaskChangesTopKey: true,
    tokens: [
      { id: 'prompt', label: 'prompt', query: [0.1, 0.7], key: [0.6, 0.4], value: [0.9, 0.1] },
      { id: 'current', label: 'current', query: [1, 0], key: [0.8, 0.1], value: [0.2, 0.8] },
      { id: 'future', label: 'future', query: [0.2, 0.8], key: [2, 0], value: [0, 1] },
    ],
  },
  {
    id: 'padding-mask',
    queryTokenId: 'real-a',
    maskKind: 'padding',
    expectedTopKeyId: 'real-a',
    expectedMaskChangesTopKey: true,
    tokens: [
      { id: 'real-a', label: 'real A', query: [0.8, 0.2], key: [0.8, 0.2], value: [0.7, 0.3] },
      { id: 'real-b', label: 'real B', query: [0.2, 0.8], key: [0.3, 0.9], value: [0.2, 0.8] },
      { id: 'pad', label: '[PAD]', query: [0, 0], key: [1.6, 0.4], value: [1, 1], masked: true },
    ],
  },
  {
    id: 'value-mixture',
    queryTokenId: 'query',
    maskKind: 'none',
    expectedTopKeyId: 'right-value',
    expectedMaskChangesTopKey: false,
    tokens: [
      { id: 'query', label: 'query', query: [1, 1], key: [0.2, 0.2], value: [0.5, 0.5] },
      { id: 'left-value', label: 'left value', query: [0.3, 0.5], key: [1, 0.8], value: [1, 0] },
      { id: 'right-value', label: 'right value', query: [0.5, 0.3], key: [0.9, 1], value: [0, 1] },
    ],
  },
]

function dot(left: number[], right: number[]) {
  return left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0)
}

function round(value: number) {
  return Number(value.toFixed(6))
}

function softmax(scores: number[]) {
  if (scores.length === 0) return []
  const maxScore = Math.max(...scores)
  const exps = scores.map((score) => Math.exp(score - maxScore))
  const total = exps.reduce((sum, value) => sum + value, 0)
  return exps.map((value) => value / total)
}

function scenarioById(id: string) {
  return attentionQkvScenarios.find((scenario) => scenario.id === id) ?? attentionQkvScenarios[0]!
}

function isMasked(scenario: AttentionQkvScenario, keyIndex: number) {
  if (scenario.maskKind === 'none') return false
  if (scenario.maskKind === 'padding') return Boolean(scenario.tokens[keyIndex]?.masked)

  const queryIndex = scenario.tokens.findIndex((token) => token.id === scenario.queryTokenId)
  return keyIndex > queryIndex
}

function topKeyFromScores(scores: Array<{ keyId: string; score: number }>) {
  return scores.reduce((best, item) => (item.score > best.score ? item : best), scores[0]!).keyId
}

function normalizedPrediction(prediction: AttentionQkvPrediction, scenario: AttentionQkvScenario) {
  const tokenIds = new Set(scenario.tokens.map((token) => token.id))
  return {
    topKeyId: tokenIds.has(prediction.topKeyId) ? prediction.topKeyId : '',
    maskChangesTopKey: prediction.maskChangesTopKey === true,
  }
}

export function evaluateAttentionQkvChallenge(input: AttentionQkvChallengeInput): AttentionQkvChallengeSnapshot {
  const scenario = scenarioById(input.scenarioId)
  const queryToken = scenario.tokens.find((token) => token.id === scenario.queryTokenId) ?? scenario.tokens[0]!
  const scale = Math.sqrt(Math.max(1, queryToken.query.length))
  const rawScores = scenario.tokens.map((token) => ({
    keyId: token.id,
    score: round(dot(queryToken.query, token.key) / scale),
  }))
  const rawTopKeyId = topKeyFromScores(rawScores)
  const maskedScores = rawScores.map((score, index) => {
    const masked = isMasked(scenario, index)
    return { keyId: score.keyId, score: masked ? null : score.score, masked }
  })
  const unmaskedScores = maskedScores.filter((score) => !score.masked).map((score) => score.score ?? 0)
  const unmaskedWeights = softmax(unmaskedScores)
  let unmaskedIndex = 0
  const weights = maskedScores.map((score) => {
    if (score.masked) return { keyId: score.keyId, weight: 0, masked: true }
    const weight = unmaskedWeights[unmaskedIndex++] ?? 0
    return { keyId: score.keyId, weight: round(weight), masked: false }
  })
  const topKeyId = topKeyFromScores(weights.map((weight) => ({ keyId: weight.keyId, score: weight.weight })))
  const valueLength = Math.max(...scenario.tokens.map((token) => token.value.length))
  const valueContributions = scenario.tokens.map((token) => {
    const weight = weights.find((item) => item.keyId === token.id)?.weight ?? 0
    return {
      keyId: token.id,
      contribution: Array.from({ length: valueLength }, (_, index) => round((token.value[index] ?? 0) * weight)),
    }
  })
  const weightedValue = Array.from({ length: valueLength }, (_, index) =>
    round(valueContributions.reduce((sum, item) => sum + (item.contribution[index] ?? 0), 0)),
  )
  const prediction = normalizedPrediction(input.prediction, scenario)
  const topKeyCorrect = prediction.topKeyId === scenario.expectedTopKeyId
  const maskEffectCorrect = prediction.maskChangesTopKey === scenario.expectedMaskChangesTopKey

  return {
    scenario,
    evidence: {
      rawScores,
      maskedScores,
      weights,
      topKeyId,
      rawTopKeyId,
      rowWeightSum: round(weights.reduce((sum, item) => sum + item.weight, 0)),
      weightedValue,
      valueContributions,
    },
    result: {
      topKeyCorrect,
      maskEffectCorrect,
      allCorrect: topKeyCorrect && maskEffectCorrect,
    },
  }
}
