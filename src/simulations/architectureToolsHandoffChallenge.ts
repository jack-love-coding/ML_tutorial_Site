import type { LocalizedCopy } from '../types/ml'

export type ArchitectureToolScenarioId =
  | 'tokenizer-boundary'
  | 'mask-visibility'
  | 'block-hidden-state'
  | 'logits-ranking'

export type ArchitectureToolPart = 'tokenizer' | 'attention-mask' | 'transformer-blocks' | 'output-head-logits'

export type ArchitectureConcept = 'token-ids' | 'visibility' | 'hidden-state-update' | 'next-token-scores'

export interface ArchitectureToolsPrediction {
  toolPart: string
  concept: string
}

export interface ArchitectureToolsTraceRow {
  label: LocalizedCopy
  value: string
  role: LocalizedCopy
}

export interface ArchitectureToolsScenario {
  id: ArchitectureToolScenarioId
  title: LocalizedCopy
  prompt: LocalizedCopy
  expectedToolPart: ArchitectureToolPart
  expectedConcept: ArchitectureConcept
  trace: ArchitectureToolsTraceRow[]
  shapeOrValueEvidence: string
  architectureLink: LocalizedCopy
  misconception: LocalizedCopy
}

export interface ArchitectureToolsChallengeInput {
  scenarioId: string
  prediction: ArchitectureToolsPrediction
}

export interface ArchitectureToolsChallengeSnapshot {
  scenario: ArchitectureToolsScenario
  evidence: {
    trace: ArchitectureToolsTraceRow[]
    shapeOrValueEvidence: string
    architectureLink: LocalizedCopy
    misconception: LocalizedCopy
    expectedToolPart: ArchitectureToolPart
    expectedConcept: ArchitectureConcept
  }
  result: {
    toolPartCorrect: boolean
    conceptCorrect: boolean
    allCorrect: boolean
  }
}

const text = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

export const architectureToolsScenarios: ArchitectureToolsScenario[] = [
  {
    id: 'tokenizer-boundary',
    title: text('token 边界', 'Token boundary'),
    prompt: text(
      '同一个可见词在请求 trace 里变成多个整数 id。判断负责对象和对应的架构概念。',
      'One visible word becomes multiple integer ids in the request trace. Identify the responsible object and concept.',
    ),
    expectedToolPart: 'tokenizer',
    expectedConcept: 'token-ids',
    trace: [
      {
        label: text('输入片段', 'Input fragment'),
        value: '"unbelievable"',
        role: text('用户看到的是一个词形。', 'The user sees one written word.'),
      },
      {
        label: text('token pieces', 'Token pieces'),
        value: '["un", "believ", "able"]',
        role: text('tokenizer 按词表切分文本。', 'The tokenizer segments text against a vocabulary.'),
      },
      {
        label: text('token ids', 'token ids'),
        value: '[402, 9182, 621]',
        role: text('模型接收的是整数索引，不是原始字符串。', 'The model receives integer indexes, not the raw string.'),
      },
    ],
    shapeOrValueEvidence: 'token ids [402, 9182, 621]',
    architectureLink: text(
      '这些 id 随后查 embedding 表，进入 [B,T,H] hidden states。',
      'These ids are used for embedding lookup before becoming [B,T,H] hidden states.',
    ),
    misconception: text(
      'tokenizer 做切分和 id 查找；它不是在理解词义，也不是 Transformer block。',
      'A tokenizer performs segmentation and id lookup; it is not semantic understanding and it is not a Transformer block.',
    ),
  },
  {
    id: 'mask-visibility',
    title: text('mask 可见性', 'Mask visibility'),
    prompt: text(
      '序列里有 padding / future token，但某些位置在 attention 前被屏蔽。判断负责对象和概念。',
      'The sequence contains padding or future tokens, but some positions are blocked before attention. Identify the object and concept.',
    ),
    expectedToolPart: 'attention-mask',
    expectedConcept: 'visibility',
    trace: [
      {
        label: text('token ids', 'token ids'),
        value: '[101, 734, 528, 0]',
        role: text('真实 token 和 padding token 同在一个 batch 行。', 'Real tokens and a padding token share one batch row.'),
      },
      {
        label: text('attention mask', 'attention mask'),
        value: '[0, 1, 1, 0]',
        role: text('0 表示不可见，1 表示允许参与这一行 attention。', '0 means hidden; 1 means allowed in this attention row.'),
      },
      {
        label: text('masked score', 'masked score'),
        value: '[-inf, 1.2, 0.7, -inf]',
        role: text('mask 在 softmax 前改写 score。', 'The mask edits scores before softmax.'),
      },
    ],
    shapeOrValueEvidence: 'attention mask [0, 1, 1, 0]',
    architectureLink: text(
      'visibility constraint 决定每个 query 允许看哪些 key。',
      'The visibility constraint decides which keys each query may attend to.',
    ),
    misconception: text(
      '被 mask 的 token 仍可能在张量里；不可见不等于不存在。',
      'A masked token can still be present in the tensor; invisible is not the same as absent.',
    ),
  },
  {
    id: 'block-hidden-state',
    title: text('hidden state 更新', 'Hidden-state update'),
    prompt: text(
      'trace 显示 block 前后 shape 没变，但每个 token 的表示数值被更新。判断负责对象和概念。',
      'The trace shows the same shape before and after the block, but token representations are updated. Identify the object and concept.',
    ),
    expectedToolPart: 'transformer-blocks',
    expectedConcept: 'hidden-state-update',
    trace: [
      {
        label: text('block input', 'Block input'),
        value: '[B,T,H] = [1,4,768]',
        role: text('输入是一批 token 的 hidden states。', 'The input is a batch of token hidden states.'),
      },
      {
        label: text('block stack', 'Block stack'),
        value: 'attention + residual/norm + FFN',
        role: text('多个子层协同更新表示。', 'Several sublayers work together to update representations.'),
      },
      {
        label: text('block output', 'Block output'),
        value: '[B,T,H] = [1,4,768]',
        role: text('shape 保持不变，但向量内容已经改变。', 'The shape stays fixed while vector contents change.'),
      },
    ],
    shapeOrValueEvidence: '[B,T,H] -> [B,T,H]',
    architectureLink: text(
      'Transformer blocks/model 负责反复更新 hidden states，而不是改变 token 数量或词表大小。',
      'Transformer blocks/the model repeatedly update hidden states rather than changing token count or vocabulary size.',
    ),
    misconception: text(
      'shape 不变不表示没有计算；block 的核心工作是更新 token 表示。',
      'Unchanged shape does not mean nothing happened; the block updates token representations.',
    ),
  },
  {
    id: 'logits-ranking',
    title: text('logits 排名', 'Logits ranking'),
    prompt: text(
      '最后一个位置输出了词表分数表，下一 token 来自分数排序或 softmax。判断负责对象和概念。',
      'The final position outputs vocabulary scores, and the next token comes from ranking or softmax. Identify the object and concept.',
    ),
    expectedToolPart: 'output-head-logits',
    expectedConcept: 'next-token-scores',
    trace: [
      {
        label: text('last hidden state', 'Last hidden state'),
        value: 'h[t] shape [H]',
        role: text('最后位置的表示进入输出头。', 'The final position representation enters the output head.'),
      },
      {
        label: text('logits', 'logits'),
        value: '{ "cat": 4.1, "car": 2.8, "the": 0.3 }',
        role: text('每个候选 token 有一个原始分数。', 'Each candidate token receives a raw score.'),
      },
      {
        label: text('next-token choice', 'next-token choice'),
        value: '"cat" ranks highest',
        role: text('排序或 softmax 决定候选优先级。', 'Ranking or softmax decides candidate priority.'),
      },
    ],
    shapeOrValueEvidence: 'next-token logits: cat 4.1 > car 2.8 > the 0.3',
    architectureLink: text(
      'output head/logits 把 hidden state 映射到词表分数，不是重新计算 Q/K/V。',
      'The output head/logits map a hidden state to vocabulary scores; they do not recompute Q/K/V.',
    ),
    misconception: text(
      'logits 是词表原始分数，不是概率本身，也不是 attention weight。',
      'Logits are raw vocabulary scores, not probabilities themselves and not attention weights.',
    ),
  },
]

const validToolParts = new Set<ArchitectureToolPart>([
  'tokenizer',
  'attention-mask',
  'transformer-blocks',
  'output-head-logits',
])

const validConcepts = new Set<ArchitectureConcept>([
  'token-ids',
  'visibility',
  'hidden-state-update',
  'next-token-scores',
])

function scenarioById(id: string) {
  return architectureToolsScenarios.find((scenario) => scenario.id === id) ?? architectureToolsScenarios[0]!
}

function normalizedPrediction(prediction: ArchitectureToolsPrediction) {
  return {
    toolPart: validToolParts.has(prediction.toolPart as ArchitectureToolPart)
      ? (prediction.toolPart as ArchitectureToolPart)
      : '',
    concept: validConcepts.has(prediction.concept as ArchitectureConcept)
      ? (prediction.concept as ArchitectureConcept)
      : '',
  }
}

export function evaluateArchitectureToolsHandoffChallenge(
  input: ArchitectureToolsChallengeInput,
): ArchitectureToolsChallengeSnapshot {
  const scenario = scenarioById(input.scenarioId)
  const prediction = normalizedPrediction(input.prediction)
  const toolPartCorrect = prediction.toolPart === scenario.expectedToolPart
  const conceptCorrect = prediction.concept === scenario.expectedConcept

  return {
    scenario,
    evidence: {
      trace: scenario.trace,
      shapeOrValueEvidence: scenario.shapeOrValueEvidence,
      architectureLink: scenario.architectureLink,
      misconception: scenario.misconception,
      expectedToolPart: scenario.expectedToolPart,
      expectedConcept: scenario.expectedConcept,
    },
    result: {
      toolPartCorrect,
      conceptCorrect,
      allCorrect: toolPartCorrect && conceptCorrect,
    },
  }
}
