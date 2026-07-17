import { algorithmCheckpointsBySlug } from '../../data/algorithmCheckpoints.ts'
import { messages } from '../../i18n/messages.ts'
import type { LocalizedCopy, ModuleSlug } from '../../types/ml.ts'
import type { CurriculumDomain, CurriculumLevel, CurriculumModule } from '../types.ts'

interface AlgorithmLessonManifest {
  id: string
  titleKey?: string
}

interface AlgorithmModuleManifest {
  slug: ModuleSlug
  route: string
  titleKey: string
  summaryKey: string
  domain: CurriculumDomain
  level: CurriculumLevel
  lessons: AlgorithmLessonManifest[]
  prerequisites?: string[]
  related?: string[]
}

function copy(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function readMessage(locale: keyof typeof messages, key: string) {
  let value: unknown = messages[locale]

  for (const part of key.split('.')) {
    if (!value || typeof value !== 'object' || !(part in value)) return undefined
    value = (value as Record<string, unknown>)[part]
  }

  return typeof value === 'string' ? value : undefined
}

function messageCopy(key: string, fallback: string): LocalizedCopy {
  return copy(readMessage('zh-CN', key) ?? fallback, readMessage('en', key) ?? fallback)
}

const algorithmManifests: AlgorithmModuleManifest[] = [
  {
    slug: 'ai-overview',
    route: '/learn/ai-overview',
    titleKey: 'modules.aiOverview.title',
    summaryKey: 'modules.aiOverview.summary',
    domain: 'foundation',
    level: 'beginner',
    lessons: [
      { id: 'what-is-ml', titleKey: 'modules.aiOverview.sections.whatisml.title' },
      { id: 'learning-types', titleKey: 'modules.aiOverview.sections.learningtypes.title' },
      { id: 'deep-learning', titleKey: 'modules.aiOverview.sections.deeplearning.title' },
      { id: 'generative-ai', titleKey: 'modules.aiOverview.sections.generativeai.title' },
      { id: 'training-flow', titleKey: 'modules.aiOverview.sections.trainingflow.title' },
    ],
    related: ['beginner-linear-algebra', 'numerical-data'],
  },
  {
    slug: 'python-notebook',
    route: '/learn/python-notebook',
    titleKey: 'modules.pythonNotebook.title',
    summaryKey: 'modules.pythonNotebook.summary',
    domain: 'foundation',
    level: 'beginner',
    lessons: [
      { id: 'notebook-rhythm', titleKey: 'modules.pythonNotebook.sections.notebookRhythm.title' },
      { id: 'numpy-arrays', titleKey: 'modules.pythonNotebook.sections.numpyArrays.title' },
      { id: 'pandas-tables', titleKey: 'modules.pythonNotebook.sections.pandasTables.title' },
      { id: 'sklearn-small-model', titleKey: 'modules.pythonNotebook.sections.sklearnSmallModel.title' },
      { id: 'reproducible-handoff', titleKey: 'modules.pythonNotebook.sections.reproducibleHandoff.title' },
    ],
  },
  {
    slug: 'housing-price-project',
    route: '/learn/housing-price-project',
    titleKey: 'modules.housingPriceProject.title',
    summaryKey: 'modules.housingPriceProject.summary',
    domain: 'project',
    level: 'beginner',
    lessons: [
      { id: 'csv-to-frame' },
      { id: 'eda-first-pass' },
      { id: 'cleaning-splits' },
      { id: 'linear-baseline' },
      { id: 'evaluation' },
      { id: 'review-next-iteration' },
    ],
  },
  {
    slug: 'classification-project',
    route: '/learn/classification-project',
    titleKey: 'modules.classificationProject.title',
    summaryKey: 'modules.classificationProject.summary',
    domain: 'project',
    level: 'intermediate',
    lessons: [
      { id: 'problem-and-costs' },
      { id: 'text-to-features' },
      { id: 'pipeline-baseline' },
      { id: 'scores-thresholds' },
      { id: 'metrics-tradeoffs' },
      { id: 'error-review' },
    ],
  },
  {
    slug: 'model-selection',
    route: '/learn/model-selection',
    titleKey: 'modules.modelSelection.title',
    summaryKey: 'modules.modelSelection.summary',
    domain: 'model',
    level: 'intermediate',
    lessons: [
      { id: 'one-split-risk' },
      { id: 'validation-role' },
      { id: 'cross-validation' },
      { id: 'pipeline-leakage' },
      { id: 'grid-search' },
      { id: 'final-refit' },
    ],
  },
  {
    slug: 'tree-forest',
    route: '/learn/tree-forest',
    titleKey: 'modules.treeForest.title',
    summaryKey: 'modules.treeForest.summary',
    domain: 'model',
    level: 'intermediate',
    lessons: [
      { id: 'non-gradient-model' },
      { id: 'rectangular-splits' },
      { id: 'split-criteria' },
      { id: 'depth-overfitting' },
      { id: 'random-forest' },
      { id: 'feature-importance' },
    ],
  },
  {
    slug: 'cnn-visualization',
    route: '/learn/cnn-visualization',
    titleKey: 'modules.cnnVisualization.title',
    summaryKey: 'modules.cnnVisualization.summary',
    domain: 'deep-learning',
    level: 'intermediate',
    lessons: [
      { id: 'image-volume' },
      { id: 'kernel-convolution' },
      { id: 'padding-stride-shape' },
      { id: 'channels-feature-maps' },
      { id: 'pooling-classifier-head' },
      { id: 'transfer-learning-review' },
    ],
  },
  {
    slug: 'sequence-embedding-bridge',
    route: '/learn/sequence-embedding-bridge',
    titleKey: 'modules.sequenceEmbeddingBridge.title',
    summaryKey: 'modules.sequenceEmbeddingBridge.summary',
    domain: 'deep-learning',
    level: 'intermediate',
    lessons: [
      { id: 'why-sequences', titleKey: 'modules.sequenceEmbeddingBridge.sections.whySequences.title' },
      { id: 'token-ids', titleKey: 'modules.sequenceEmbeddingBridge.sections.tokenIds.title' },
      { id: 'embedding-lookup', titleKey: 'modules.sequenceEmbeddingBridge.sections.embeddingLookup.title' },
      { id: 'positions-and-masks', titleKey: 'modules.sequenceEmbeddingBridge.sections.positionsAndMasks.title' },
      { id: 'shape-handoff', titleKey: 'modules.sequenceEmbeddingBridge.sections.shapeHandoff.title' },
    ],
    related: ['tensor-shapes-vectorization', 'attention-transformer'],
  },
  {
    slug: 'attention-transformer',
    route: '/learn/attention-transformer',
    titleKey: 'modules.attentionTransformer.title',
    summaryKey: 'modules.attentionTransformer.summary',
    domain: 'deep-learning',
    level: 'advanced',
    lessons: [
      { id: 'tokens-embeddings' },
      { id: 'qkv-scores' },
      { id: 'softmax-weighted-sum' },
      { id: 'multi-head-shapes' },
      { id: 'transformer-block' },
      { id: 'architecture-to-tools' },
    ],
    related: ['sequence-embedding-bridge', 'llm-rag'],
  },
  {
    slug: 'optimizer-comparison',
    route: '/learn/optimizer-comparison',
    titleKey: 'modules.optimizerComparison.title',
    summaryKey: 'modules.optimizerComparison.summary',
    domain: 'model',
    level: 'intermediate',
    lessons: [
      { id: 'training-loop' },
      { id: 'sgd-batch-noise' },
      { id: 'momentum-rmsprop' },
      { id: 'adam-weight-decay' },
      { id: 'learning-rate-schedules' },
      { id: 'curve-diagnosis' },
    ],
  },
  {
    slug: 'llm-rag',
    route: '/learn/llm-rag',
    titleKey: 'modules.llmRag.title',
    summaryKey: 'modules.llmRag.summary',
    domain: 'deep-learning',
    level: 'advanced',
    lessons: [
      { id: 'causal-language-modeling', titleKey: 'modules.llmRag.sections.causalLanguageModeling.title' },
      { id: 'decoding-generation', titleKey: 'modules.llmRag.sections.decodingGeneration.title' },
      { id: 'tokenization-context' },
      { id: 'embeddings-similarity' },
      { id: 'chunking-retrieval' },
      { id: 'prompt-assembly' },
      { id: 'rag-evaluation' },
      { id: 'rag-is-not-training' },
    ],
    prerequisites: ['attention-transformer'],
    related: ['attention-transformer', 'linear-algebra-distance-similarity'],
  },
  {
    slug: 'loss-functions',
    route: '/learn/loss-functions',
    titleKey: 'modules.lossFunctions.title',
    summaryKey: 'modules.lossFunctions.summary',
    domain: 'model',
    level: 'beginner',
    lessons: [
      { id: 'why-loss', titleKey: 'modules.lossFunctions.sections.whyLoss.title' },
      { id: 'regression-losses', titleKey: 'modules.lossFunctions.sections.regressionLosses.title' },
      { id: 'classification-losses', titleKey: 'modules.lossFunctions.sections.classificationLosses.title' },
      { id: 'likelihood-intuition', titleKey: 'modules.lossFunctions.sections.likelihoodIntuition.title' },
      { id: 'negative-log', titleKey: 'modules.lossFunctions.sections.negativeLog.title' },
      { id: 'mle-bridge', titleKey: 'modules.lossFunctions.sections.mleBridge.title' },
    ],
  },
  {
    slug: 'gradient-descent',
    route: '/learn/gradient-descent',
    titleKey: 'modules.gradientDescent.title',
    summaryKey: 'modules.gradientDescent.summary',
    domain: 'model',
    level: 'beginner',
    lessons: [
      { id: 'loss-function', titleKey: 'modules.gradientDescent.sections.lossFunction.title' },
      { id: 'landscape', titleKey: 'modules.gradientDescent.sections.landscape.title' },
      { id: 'gradient-rule', titleKey: 'modules.gradientDescent.sections.gradientRule.title' },
      { id: 'learning-rate', titleKey: 'modules.gradientDescent.sections.learningRate.title' },
      { id: 'saddle-local-minima', titleKey: 'modules.gradientDescent.sections.saddleLocalMinima.title' },
      { id: 'noise-and-batch', titleKey: 'modules.gradientDescent.sections.noiseAndBatch.title' },
    ],
    prerequisites: ['loss-functions'],
  },
  {
    slug: 'linear-regression',
    route: '/learn/linear-regression',
    titleKey: 'modules.linearRegression.title',
    summaryKey: 'modules.linearRegression.summary',
    domain: 'model',
    level: 'beginner',
    lessons: [
      { id: 'fit-line' },
      { id: 'residual-loss' },
      { id: 'training-motion' },
      { id: 'model-limits' },
      { id: 'multivariate' },
      { id: 'polynomial' },
      { id: 'overfitting' },
      { id: 'regularization' },
    ],
    prerequisites: ['loss-functions'],
  },
  {
    slug: 'logistic-regression',
    route: '/learn/logistic-regression',
    titleKey: 'modules.logisticRegression.title',
    summaryKey: 'modules.logisticRegression.summary',
    domain: 'model',
    level: 'beginner',
    lessons: [
      { id: 'linear-score' },
      { id: 'sigmoid-probability' },
      { id: 'threshold-decisions' },
      { id: 'log-loss' },
      { id: 'regularization' },
      { id: 'linear-limits' },
    ],
    prerequisites: ['loss-functions'],
  },
  {
    slug: 'classification',
    route: '/learn/classification',
    titleKey: 'modules.classification.title',
    summaryKey: 'modules.classification.summary',
    domain: 'model',
    level: 'intermediate',
    lessons: [
      { id: 'scores' },
      { id: 'thresholds' },
      { id: 'confusionMatrix' },
      { id: 'precisionRecall' },
      { id: 'costTradeoff' },
      { id: 'rocAuc' },
      { id: 'biasCalibration' },
      { id: 'multiclass' },
    ],
    prerequisites: ['logistic-regression'],
  },
  {
    slug: 'mlp',
    route: '/learn/mlp',
    titleKey: 'modules.mlp.title',
    summaryKey: 'modules.mlp.summary',
    domain: 'deep-learning',
    level: 'intermediate',
    lessons: [
      { id: 'linearLimits' },
      { id: 'neuronAffine' },
      { id: 'activations' },
      { id: 'hiddenRepresentation' },
      { id: 'forwardOutput' },
      { id: 'backprop' },
      { id: 'trainingDynamics' },
      { id: 'capacityGeneralization' },
    ],
    prerequisites: ['classification'],
  },
]

export function adaptAlgorithmModules(): CurriculumModule[] {
  return algorithmManifests.map((manifest) => {
    const summary = messageCopy(manifest.summaryKey, manifest.slug)

    return {
      id: manifest.slug,
      source: { namespace: 'algorithm', id: manifest.slug },
      domain: manifest.domain,
      level: manifest.level,
      title: messageCopy(manifest.titleKey, manifest.slug),
      summary,
      route: manifest.route,
      estimatedMinutes: manifest.lessons.length * 12,
      prerequisiteIds: manifest.prerequisites ?? [],
      outcomeIds: algorithmCheckpointsBySlug[manifest.slug].map((checkpoint) => checkpoint.id),
      lessons: manifest.lessons.map((lesson) => ({
        id: lesson.id,
        sourceId: lesson.id,
        title: lesson.titleKey ? messageCopy(lesson.titleKey, lesson.id) : copy(lesson.id, lesson.id),
        summary,
        route: `${manifest.route}/${lesson.id}`,
        estimatedMinutes: 12,
      })),
      relatedModuleIds: manifest.related ?? [],
      legacyRoute: manifest.route,
    }
  })
}
