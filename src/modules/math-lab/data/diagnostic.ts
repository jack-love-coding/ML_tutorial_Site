import type {
  DiagnosticDimension,
  DiagnosticQuestion,
  DiagnosticResult,
  MathLabModuleId,
} from '../types/mathLab'

const dimensions: DiagnosticDimension[] = [
  'linearAlgebra',
  'calculus',
  'probability',
  'optimization',
]

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: 'diag-dot',
    dimension: 'linearAlgebra',
    prompt: {
      'zh-CN': '两个向量的点积最直接反映了什么？',
      en: 'What does the dot product of two vectors most directly reflect?',
    },
    choices: [
      { id: 'similarity', label: { 'zh-CN': '方向相似度和长度共同作用', en: 'Direction similarity combined with length' } },
      { id: 'elementwise', label: { 'zh-CN': '逐元素相除', en: 'Element-wise division' } },
      { id: 'random', label: { 'zh-CN': '随机投影误差', en: 'Random projection error' } },
    ],
    answer: 'similarity',
    weakConceptTag: 'dot-product',
    explanation: {
      'zh-CN': '点积同时受长度和夹角影响；归一化后就是 cosine similarity。',
      en: 'The dot product combines length and angle; after normalization it becomes cosine similarity.',
    },
  },
  {
    id: 'diag-matrix',
    dimension: 'linearAlgebra',
    prompt: {
      'zh-CN': '2x2 矩阵的 determinant 接近 0 时，通常说明什么？',
      en: 'When a 2x2 matrix has determinant close to 0, what usually happens?',
    },
    choices: [
      { id: 'collapse', label: { 'zh-CN': '空间被压扁，可逆性变差', en: 'Space collapses and invertibility weakens' } },
      { id: 'rotate', label: { 'zh-CN': '只发生旋转，不改变面积', en: 'It only rotates, preserving area' } },
      { id: 'probability', label: { 'zh-CN': '输出一定是概率分布', en: 'The output must be a probability distribution' } },
    ],
    answer: 'collapse',
    weakConceptTag: 'determinant',
    explanation: {
      'zh-CN': 'determinant 表示面积缩放。接近 0 时，二维区域接近被压成一条线。',
      en: 'The determinant measures area scaling. Near zero means a 2D region is nearly collapsed into a line.',
    },
  },
  {
    id: 'diag-derivative',
    dimension: 'calculus',
    prompt: {
      'zh-CN': '导数最适合被理解为哪种量？',
      en: 'What is the most useful intuition for a derivative?',
    },
    choices: [
      { id: 'local-rate', label: { 'zh-CN': '当前位置附近的局部变化率', en: 'The local rate of change near the current point' } },
      { id: 'global-average', label: { 'zh-CN': '整个函数的全局平均值', en: 'The global average of a function' } },
      { id: 'dimension', label: { 'zh-CN': '特征维度数量', en: 'The number of feature dimensions' } },
    ],
    answer: 'local-rate',
    weakConceptTag: 'derivative',
    explanation: {
      'zh-CN': '导数告诉我们“此刻轻微改变输入，输出会怎样变”。',
      en: 'A derivative tells us how the output changes when the input moves slightly right now.',
    },
  },
  {
    id: 'diag-gradient',
    dimension: 'calculus',
    prompt: {
      'zh-CN': '梯度下降为什么要减去梯度？',
      en: 'Why does gradient descent subtract the gradient?',
    },
    choices: [
      { id: 'negative', label: { 'zh-CN': '梯度指向最快上升方向，负梯度才是下降方向', en: 'The gradient points uphill, so negative gradient points downhill' } },
      { id: 'normalize', label: { 'zh-CN': '减号只是为了让参数更小', en: 'The minus sign only makes parameters smaller' } },
      { id: 'probability', label: { 'zh-CN': '减号把数值变成概率', en: 'The minus sign turns values into probabilities' } },
    ],
    answer: 'negative',
    weakConceptTag: 'negative-gradient',
    explanation: {
      'zh-CN': '梯度是最快上升方向；优化 loss 时要沿相反方向移动。',
      en: 'The gradient is the fastest rising direction, so loss minimization moves the other way.',
    },
  },
  {
    id: 'diag-entropy',
    dimension: 'probability',
    prompt: {
      'zh-CN': '分类模型输出 `[0.8, 0.1, 0.1]` 更接近什么？',
      en: 'A classifier output like `[0.8, 0.1, 0.1]` is best understood as what?',
    },
    choices: [
      { id: 'distribution', label: { 'zh-CN': '类别上的概率分布', en: 'A probability distribution over classes' } },
      { id: 'coordinates', label: { 'zh-CN': '二维坐标', en: 'A 2D coordinate' } },
      { id: 'weights', label: { 'zh-CN': '神经网络层数', en: 'The number of neural network layers' } },
    ],
    answer: 'distribution',
    weakConceptTag: 'probability-distribution',
    explanation: {
      'zh-CN': '分类输出通常表示模型对各类别的不确定性分配。',
      en: 'Classifier outputs usually represent how the model distributes uncertainty across classes.',
    },
  },
  {
    id: 'diag-learning-rate',
    dimension: 'optimization',
    prompt: {
      'zh-CN': '学习率过大时，训练轨迹最可能怎样？',
      en: 'What is most likely when the learning rate is too large?',
    },
    choices: [
      { id: 'oscillate', label: { 'zh-CN': '越过谷底并震荡或发散', en: 'Overshoot the valley and oscillate or diverge' } },
      { id: 'freeze', label: { 'zh-CN': '所有梯度自动变成 0', en: 'All gradients automatically become zero' } },
      { id: 'perfect', label: { 'zh-CN': '保证一步到最优点', en: 'Guarantee one-step convergence' } },
    ],
    answer: 'oscillate',
    weakConceptTag: 'learning-rate',
    explanation: {
      'zh-CN': '步长太大时，参数容易反复越过低谷。',
      en: 'A step that is too large can repeatedly jump across the valley.',
    },
  },
]

function emptyDimensionScores() {
  return Object.fromEntries(dimensions.map((dimension) => [dimension, { correct: 0, total: 0 }])) as Record<
    DiagnosticDimension,
    { correct: number; total: number }
  >
}

function recommendStartModule(scores: Record<DiagnosticDimension, number>): MathLabModuleId {
  if (scores.calculus < 0.75) return 'taylor-series'
  if (scores.probability < 0.75) return 'monte-carlo'
  if (scores.linearAlgebra < 0.75) return 'vectors-matrices-norms'
  if (scores.optimization < 0.75) return 'optimization'
  return 'taylor-series'
}

export function scoreDiagnostic(answers: Record<string, string>): DiagnosticResult {
  const counters = emptyDimensionScores()
  const weakConcepts: string[] = []

  for (const question of diagnosticQuestions) {
    const counter = counters[question.dimension]
    counter.total += 1
    if (answers[question.id] === question.answer) {
      counter.correct += 1
    } else {
      weakConcepts.push(question.weakConceptTag)
    }
  }

  const scores = Object.fromEntries(
    dimensions.map((dimension) => {
      const counter = counters[dimension]
      return [dimension, counter.total ? counter.correct / counter.total : 0]
    }),
  ) as Record<DiagnosticDimension, number>

  return {
    linearAlgebra: scores.linearAlgebra,
    calculus: scores.calculus,
    probability: scores.probability,
    optimization: scores.optimization,
    recommendedStartModuleId: recommendStartModule(scores),
    weakConcepts: Array.from(new Set(weakConcepts)),
  }
}
