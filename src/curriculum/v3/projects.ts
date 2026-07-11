import type { CurriculumV3ProjectBlueprint } from './types.ts'

export const curriculumV3ProjectPrerequisites = {
  'project-math-to-code': ['gradient-descent', 'monte-carlo'],
  'project-tabular-regression': ['linear-regression', 'data-exploration-pipelines'],
  'project-classification-evaluation': ['classification', 'model-selection'],
  'project-neural-representation': ['optimizer-comparison', 'cnn-visualization'],
  'project-small-transformer': ['decoding-sampling'],
  'project-llm-application': ['peft-lora', 'llm-evaluation-reliability'],
} as const

const projectCapabilities = {
  'project-math-to-code': ['formula-to-code', 'numerical-verification'],
  'project-tabular-regression': ['data-pipeline', 'honest-baseline', 'residual-analysis'],
  'project-classification-evaluation': ['threshold-decision', 'cross-validation', 'leakage-diagnosis'],
  'project-neural-representation': ['backprop-implementation', 'optimizer-comparison', 'representation-inspection'],
  'project-small-transformer': ['causal-language-model', 'training-loop', 'sampling'],
  'project-llm-application': ['parameter-efficient-adaptation', 'rag-evaluation', 'hallucination-analysis'],
} as const

const deliverables = [
  'reproducible-config',
  'baseline',
  'controlled-improvement',
  'metrics-and-plots',
  'failure-examples',
  'formula-code-behavior-explanation',
  'limitations-reflection',
] as const

const projectRevisits = {
  'project-math-to-code': ['vector', 'matrix-multiplication', 'gradient', 'probability-distribution', 'random-seed'],
  'project-tabular-regression': ['fit-transform-pipeline', 'linear-regression-model', 'regression-residual', 'data-leakage'],
  'project-classification-evaluation': ['decision-boundary', 'threshold', 'confusion-matrix', 'cross-validation', 'data-leakage'],
  'project-neural-representation': ['mlp-forward-pass', 'backpropagation', 'optimizer', 'convolution-kernel'],
  'project-small-transformer': ['tokenization', 'token-embedding', 'self-attention', 'transformer-block', 'causal-transformer-training', 'autoregressive-decoding'],
  'project-llm-application': ['context-window', 'lora', 'retrieval-augmented-generation', 'retrieval-evidence', 'llm-evaluation-rubric'],
} as const

const projectDetails = {
  'project-math-to-code': {
    arcId: 'calculus-probability-optimization', order: 1,
    title: { 'zh-CN': '从公式到可验证代码', en: 'From formulas to verified code' },
    question: { 'zh-CN': '如何证明代码真的实现了数学定义？', en: 'How can code be shown to implement the mathematical definition?' },
  },
  'project-tabular-regression': {
    arcId: 'classical-supervised-learning', order: 2,
    title: { 'zh-CN': '表格回归全流程', en: 'End-to-end tabular regression' },
    question: { 'zh-CN': '如何建立诚实且可复现的回归基线？', en: 'How do we build an honest, reproducible regression baseline?' },
  },
  'project-classification-evaluation': {
    arcId: 'generalization-evaluation', order: 3,
    title: { 'zh-CN': '分类决策与评估', en: 'Classification decisions and evaluation' },
    question: { 'zh-CN': '阈值与验证设计如何改变分类结论？', en: 'How do thresholds and validation design change classification conclusions?' },
  },
  'project-neural-representation': {
    arcId: 'deep-learning-structures', order: 4,
    title: { 'zh-CN': '神经表示诊断', en: 'Neural representation diagnostics' },
    question: { 'zh-CN': '优化过程如何塑造中间表示？', en: 'How does optimization shape intermediate representations?' },
  },
  'project-small-transformer': {
    arcId: 'transformers-language-models', order: 5,
    title: { 'zh-CN': '训练小型 Transformer', en: 'Train a small Transformer' },
    question: { 'zh-CN': '如何训练并诊断一个因果语言模型？', en: 'How do we train and diagnose a causal language model?' },
  },
  'project-llm-application': {
    arcId: 'llm-adaptation-retrieval', order: 6,
    title: { 'zh-CN': '可靠的 LLM 应用', en: 'Reliable LLM application' },
    question: { 'zh-CN': '如何用证据评估适配、检索与幻觉？', en: 'How do we evaluate adaptation, retrieval, and hallucination with evidence?' },
  },
} as const

export const curriculumV3Projects: CurriculumV3ProjectBlueprint[] = Object.entries(
  curriculumV3ProjectPrerequisites,
).map(([id, prerequisiteIds]) => {
  const projectId = id as keyof typeof curriculumV3ProjectPrerequisites
  const details = projectDetails[projectId]
  return {
    id: projectId,
    arcId: details.arcId,
    order: details.order,
    role: 'project',
    title: details.title,
    learnerQuestion: details.question,
    outcomes: [{
      'zh-CN': `提交可复现证据，展示 ${details.title['zh-CN']} 的基线、改进与局限。`,
      en: `Submit reproducible evidence for the baseline, improvement, and limitations of ${details.title.en}.`,
    }],
    prerequisiteIds: [...prerequisiteIds],
    introduces: [...projectCapabilities[projectId]],
    revisits: [...projectRevisits[projectId]],
    mathCapabilities: ['formula-code-behavior-explanation'],
    pythonCapabilities: ['reproducible-experiment'],
    projectIds: [],
    sourceModuleIds: [],
    migrationAction: 'add',
    authoring: { zhCN: 'planned', review: 'planned', en: 'planned', runtime: 'planned' },
    capabilityIds: [...projectCapabilities[projectId]],
    deliverables: [...deliverables],
    evidenceRequirements: ['executable-artifact', 'metric-backed-claim', 'documented-failure-case'],
  }
})
