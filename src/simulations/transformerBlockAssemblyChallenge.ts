export type TransformerBlockScenarioId =
  | 'missing-residual'
  | 'missing-layernorm'
  | 'missing-ffn'
  | 'attention-only'

export type TransformerBlockPart = 'self-attention' | 'residual' | 'layernorm' | 'ffn' | 'complete-block'

export type TransformerConsequence =
  | 'token-mixing'
  | 'signal-path'
  | 'normalization'
  | 'per-token-processing'

export interface LocalizedText {
  'zh-CN': string
  en: string
}

export interface TransformerBlockStep {
  part: TransformerBlockPart
  label: LocalizedText
  role: LocalizedText
  present: boolean
}

export interface TransformerBlockPrediction {
  part: string
  consequence: string
}

export interface TransformerBlockScenario {
  id: TransformerBlockScenarioId
  expectedPart: TransformerBlockPart
  expectedConsequence: TransformerConsequence
  blockTrace: TransformerBlockStep[]
  shapeInvariant: string
  failureConsequence: LocalizedText
}

export interface TransformerBlockChallengeInput {
  scenarioId: string
  prediction: TransformerBlockPrediction
}

export interface TransformerBlockChallengeSnapshot {
  scenario: TransformerBlockScenario
  evidence: {
    blockTrace: TransformerBlockStep[]
    shapeInvariant: string
    failureConsequence: LocalizedText
    expectedPart: TransformerBlockPart
    expectedConsequence: TransformerConsequence
  }
  result: {
    partCorrect: boolean
    consequenceCorrect: boolean
    allCorrect: boolean
  }
}

const text = (zhCN: string, en: string): LocalizedText => ({ 'zh-CN': zhCN, en })

const completeTrace: TransformerBlockStep[] = [
  {
    part: 'self-attention',
    label: text('self-attention', 'self-attention'),
    role: text('让 token 彼此交换信息。', 'Lets tokens exchange information.'),
    present: true,
  },
  {
    part: 'residual',
    label: text('residual', 'residual'),
    role: text('保留直接信号路径，让 block 学增量修改。', 'Keeps a direct signal path so the block learns an update.'),
    present: true,
  },
  {
    part: 'layernorm',
    label: text('LayerNorm', 'LayerNorm'),
    role: text('控制每个 token 表示的尺度，稳定深层训练。', 'Controls representation scale and stabilizes deep training.'),
    present: true,
  },
  {
    part: 'ffn',
    label: text('position-wise FFN', 'position-wise FFN'),
    role: text('对每个 token 做同一套非线性加工。', 'Applies the same nonlinear processing to each token.'),
    present: true,
  },
]

function traceWithout(part: TransformerBlockPart) {
  return completeTrace.map((step) => (step.part === part ? { ...step, present: false } : step))
}

export const transformerBlockScenarios: TransformerBlockScenario[] = [
  {
    id: 'missing-residual',
    expectedPart: 'residual',
    expectedConsequence: 'signal-path',
    blockTrace: traceWithout('residual'),
    shapeInvariant: '[B,T,H] -> [B,T,H]',
    failureConsequence: text(
      'shape 仍然能对上，但缺少直接信号路径，深层网络更难只学习增量修改。',
      'The shape still matches, but the direct signal path is gone, making deep layers harder to train as incremental updates.',
    ),
  },
  {
    id: 'missing-layernorm',
    expectedPart: 'layernorm',
    expectedConsequence: 'normalization',
    blockTrace: traceWithout('layernorm'),
    shapeInvariant: '[B,T,H] -> [B,T,H]',
    failureConsequence: text(
      'shape 不变，但表示尺度缺少控制，训练稳定性会变弱。',
      'The shape is unchanged, but representation scale is less controlled, weakening training stability.',
    ),
  },
  {
    id: 'missing-ffn',
    expectedPart: 'ffn',
    expectedConsequence: 'per-token-processing',
    blockTrace: traceWithout('ffn'),
    shapeInvariant: '[B,T,H] -> [B,T,H]',
    failureConsequence: text(
      'token 仍可通过 attention 交换信息，但缺少每个 token 内部的共享非线性加工。',
      'Tokens can still exchange information through attention, but each token misses shared nonlinear processing.',
    ),
  },
  {
    id: 'attention-only',
    expectedPart: 'complete-block',
    expectedConsequence: 'token-mixing',
    blockTrace: completeTrace.map((step) => ({
      ...step,
      present: step.part === 'self-attention',
    })),
    shapeInvariant: '[B,T,H] -> [B,T,H]',
    failureConsequence: text(
      'attention 只负责 token mixing；完整 block 还需要 residual、LayerNorm 和 FFN 才能稳定加工表示。',
      'Attention only handles token mixing; a complete block still needs residuals, LayerNorm, and an FFN to process representations stably.',
    ),
  },
]

const validParts = new Set<TransformerBlockPart>(['self-attention', 'residual', 'layernorm', 'ffn', 'complete-block'])
const validConsequences = new Set<TransformerConsequence>([
  'token-mixing',
  'signal-path',
  'normalization',
  'per-token-processing',
])

function scenarioById(id: string) {
  return transformerBlockScenarios.find((scenario) => scenario.id === id) ?? transformerBlockScenarios[0]!
}

function normalizedPrediction(prediction: TransformerBlockPrediction) {
  return {
    part: validParts.has(prediction.part as TransformerBlockPart)
      ? (prediction.part as TransformerBlockPart)
      : '',
    consequence: validConsequences.has(prediction.consequence as TransformerConsequence)
      ? (prediction.consequence as TransformerConsequence)
      : '',
  }
}

export function evaluateTransformerBlockAssemblyChallenge(
  input: TransformerBlockChallengeInput,
): TransformerBlockChallengeSnapshot {
  const scenario = scenarioById(input.scenarioId)
  const prediction = normalizedPrediction(input.prediction)
  const partCorrect = prediction.part === scenario.expectedPart
  const consequenceCorrect = prediction.consequence === scenario.expectedConsequence

  return {
    scenario,
    evidence: {
      blockTrace: scenario.blockTrace,
      shapeInvariant: scenario.shapeInvariant,
      failureConsequence: scenario.failureConsequence,
      expectedPart: scenario.expectedPart,
      expectedConsequence: scenario.expectedConsequence,
    },
    result: {
      partCorrect,
      consequenceCorrect,
      allCorrect: partCorrect && consequenceCorrect,
    },
  }
}
