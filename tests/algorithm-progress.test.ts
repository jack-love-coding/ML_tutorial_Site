import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { algorithmCheckpointsBySlug } from '../src/data/algorithmCheckpoints.ts'
import type { AlgorithmCheckpointItem, AlgorithmProgress, ModuleSlug } from '../src/types/ml.ts'
import {
  buildAlgorithmQuizAttempt,
  evaluateAlgorithmCheckpointAnswer,
  scoreAlgorithmCheckpoints,
} from '../src/utils/algorithmQuiz.ts'
import {
  algorithmProgressStorageKey,
  appendAlgorithmQuizAttempt,
  clearAlgorithmProgress,
  createDefaultAlgorithmProgress,
  loadAlgorithmProgress,
  markAlgorithmModuleComplete,
  saveAlgorithmProgress,
  setLastVisitedAlgorithmModule,
  shouldCompleteAlgorithmModule,
} from '../src/utils/algorithmProgress.ts'

const root = new URL('../', import.meta.url)

class MemoryStorage {
  data: Record<string, string>

  constructor(data: Record<string, string> = {}) {
    this.data = { ...data }
  }

  getItem(key: string) {
    return this.data[key] ?? null
  }

  setItem(key: string, value: string) {
    this.data[key] = value
  }

  removeItem(key: string) {
    delete this.data[key]
  }
}

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

function assertLocalized(copy: { 'zh-CN': string; en: string }, label: string) {
  assert.equal(typeof copy['zh-CN'], 'string', `${label} zh-CN should exist`)
  assert.equal(typeof copy.en, 'string', `${label} en should exist`)
  assert.ok(copy['zh-CN'].trim().length > 0, `${label} zh-CN should not be empty`)
  assert.ok(copy.en.trim().length > 0, `${label} en should not be empty`)
}

test('progress modules share one storage parsing helper', () => {
  const sharedSource = read('src/utils/progressStorage.ts')
  assert.match(sharedSource, /loadJsonProgress/)
  assert.match(sharedSource, /saveJsonProgress/)

  for (const path of [
    'src/utils/algorithmProgress.ts',
    'src/modules/math-lab/utils/progress.ts',
    'src/modules/data-lab/utils/progress.ts',
  ]) {
    const source = read(path)
    assert.match(source, /progressStorage/, `${path} should use the shared progress storage helper`)
    assert.doesNotMatch(source, /JSON\.parse/, `${path} should not duplicate JSON parsing`)
    assert.doesNotMatch(source, /JSON\.stringify/, `${path} should not duplicate JSON serialization`)
  }
})

test('algorithm checkpoint scoring records misconception feedback', () => {
  const checkpoint: AlgorithmCheckpointItem = {
    id: 'loss-rule',
    prompt: {
      'zh-CN': '为什么同一个误差可以对应不同的 loss？',
      en: 'Why can the same error map to different losses?',
    },
    choices: [
      {
        id: 'rule',
        label: {
          'zh-CN': 'loss 是我们选择的评分规则。',
          en: 'Loss is the scoring rule we choose.',
        },
      },
      {
        id: 'raw-gap',
        label: {
          'zh-CN': 'loss 永远等于原始误差。',
          en: 'Loss always equals the raw error.',
        },
      },
    ],
    answer: 'rule',
    explanation: {
      'zh-CN': '误差只是差距；loss 决定如何惩罚这个差距。',
      en: 'Error is the gap; loss decides how to penalize it.',
    },
    misconceptionTags: ['error-equals-loss'],
    revisitChapterId: 'why-loss',
  }

  const correct = evaluateAlgorithmCheckpointAnswer(checkpoint, 'rule')
  assert.equal(correct.correct, true)
  assert.deepEqual(correct.misconceptionTags, [])

  const incorrect = evaluateAlgorithmCheckpointAnswer(checkpoint, 'raw-gap')
  assert.equal(incorrect.correct, false)
  assert.equal(incorrect.expectedAnswer, 'rule')
  assert.deepEqual(incorrect.misconceptionTags, ['error-equals-loss'])

  const attempt = buildAlgorithmQuizAttempt('loss-functions', checkpoint, 'raw-gap', '2026-05-18T00:00:00.000Z')
  assert.equal(attempt.moduleSlug, 'loss-functions')
  assert.equal(attempt.quizId, 'loss-rule')
  assert.equal(attempt.correct, false)
  assert.deepEqual(attempt.misconceptionTags, ['error-equals-loss'])

  const score = scoreAlgorithmCheckpoints([checkpoint], { 'loss-rule': 'rule' })
  assert.equal(score.correct, 1)
  assert.equal(score.total, 1)
  assert.equal(score.score, 1)
  assert.deepEqual(score.misconceptionTags, [])
})

test('algorithm completion threshold follows the module-level checkpoint rule', () => {
  const attempts = [
    { correct: true },
    { correct: true },
    { correct: false },
  ]

  assert.equal(shouldCompleteAlgorithmModule(attempts), true)
  assert.equal(shouldCompleteAlgorithmModule([{ correct: true }, { correct: false }, { correct: false }]), false)
  assert.equal(shouldCompleteAlgorithmModule([]), false)
})

test('algorithm progress persists last visited, completion, and quiz attempts', () => {
  const storage = new MemoryStorage()
  const checkpoint = algorithmCheckpointsBySlug['loss-functions'][0]!
  const attempt = buildAlgorithmQuizAttempt(
    'loss-functions',
    checkpoint,
    checkpoint.answer,
    '2026-05-18T00:00:00.000Z',
  )

  let progress: AlgorithmProgress = createDefaultAlgorithmProgress('2026-05-18T00:00:00.000Z')
  progress = setLastVisitedAlgorithmModule(progress, 'classification')
  progress = appendAlgorithmQuizAttempt(progress, attempt)
  progress = markAlgorithmModuleComplete(progress, 'loss-functions')
  saveAlgorithmProgress(progress, storage)

  const reloaded = loadAlgorithmProgress(storage)
  assert.deepEqual(reloaded.completedModuleSlugs, ['loss-functions'])
  assert.equal(reloaded.lastVisitedModuleSlug, 'loss-functions')
  assert.equal(reloaded.quizAttempts.length, 1)
  assert.equal(reloaded.quizAttempts[0]?.correct, true)

  const corruptedStorage = new MemoryStorage({
    [algorithmProgressStorageKey]: '{bad json',
  })
  assert.deepEqual(loadAlgorithmProgress(corruptedStorage).completedModuleSlugs, [])

  clearAlgorithmProgress(storage)
  assert.deepEqual(loadAlgorithmProgress(storage).quizAttempts, [])
})

test('algorithm modules expose bilingual module-level checkpoints with revisit chapters', () => {
  const expectedSlugs: ModuleSlug[] = [
    'ai-overview',
    'python-notebook',
    'housing-price-project',
    'classification-project',
    'model-selection',
    'tree-forest',
    'cnn-visualization',
    'sequence-embedding-bridge',
    'attention-transformer',
    'optimizer-comparison',
    'llm-rag',
    'loss-functions',
    'gradient-descent',
    'linear-regression',
    'logistic-regression',
    'classification',
    'mlp',
  ]

  const chapterIdsBySlug: Record<ModuleSlug, Set<string>> = {
    'ai-overview': new Set(['what-is-ml', 'learning-types', 'deep-learning', 'generative-ai', 'training-flow']),
    'python-notebook': new Set(['notebook-rhythm', 'numpy-arrays', 'pandas-tables', 'sklearn-small-model', 'reproducible-handoff']),
    'housing-price-project': new Set(['csv-to-frame', 'eda-first-pass', 'cleaning-splits', 'linear-baseline', 'evaluation', 'review-next-iteration']),
    'classification-project': new Set(['problem-and-costs', 'text-to-features', 'pipeline-baseline', 'scores-thresholds', 'metrics-tradeoffs', 'error-review']),
    'model-selection': new Set(['one-split-risk', 'validation-role', 'cross-validation', 'pipeline-leakage', 'grid-search', 'final-refit']),
    'tree-forest': new Set(['non-gradient-model', 'rectangular-splits', 'split-criteria', 'depth-overfitting', 'random-forest', 'feature-importance']),
    'cnn-visualization': new Set(['image-volume', 'kernel-convolution', 'padding-stride-shape', 'channels-feature-maps', 'pooling-classifier-head', 'transfer-learning-review']),
    'sequence-embedding-bridge': new Set(['why-sequences', 'token-ids', 'embedding-lookup', 'positions-and-masks', 'shape-handoff']),
    'attention-transformer': new Set(['tokens-embeddings', 'qkv-scores', 'softmax-weighted-sum', 'multi-head-shapes', 'transformer-block', 'architecture-to-tools']),
    'optimizer-comparison': new Set(['training-loop', 'sgd-batch-noise', 'momentum-rmsprop', 'adam-weight-decay', 'learning-rate-schedules', 'curve-diagnosis']),
    'llm-rag': new Set(['tokenization-context', 'embeddings-similarity', 'chunking-retrieval', 'prompt-assembly', 'rag-evaluation', 'rag-is-not-training']),
    'loss-functions': new Set(['why-loss', 'regression-losses', 'classification-losses', 'likelihood-intuition', 'negative-log', 'mle-bridge']),
    'gradient-descent': new Set(['loss-function', 'landscape', 'gradient-rule', 'learning-rate', 'saddle-local-minima', 'noise-and-batch']),
    'linear-regression': new Set(['fit-line', 'residual-loss', 'training-motion', 'model-limits', 'multivariate', 'polynomial', 'overfitting', 'regularization']),
    'logistic-regression': new Set(['linear-score', 'sigmoid-probability', 'threshold-decisions', 'log-loss', 'regularization', 'linear-limits']),
    classification: new Set(['scores', 'thresholds', 'confusionMatrix', 'precisionRecall', 'costTradeoff', 'rocAuc', 'biasCalibration', 'multiclass']),
    mlp: new Set(['linearLimits', 'neuronAffine', 'activations', 'hiddenRepresentation', 'forwardOutput', 'backprop', 'trainingDynamics', 'capacityGeneralization']),
  }

  assert.deepEqual(Object.keys(algorithmCheckpointsBySlug), expectedSlugs)

  for (const slug of expectedSlugs) {
    const checkpoints = algorithmCheckpointsBySlug[slug]
    assert.equal(
      checkpoints.length >= 2,
      true,
      `${slug} should expose at least two module checkpoints`,
    )
    const chapterIds = chapterIdsBySlug[slug]

    for (const checkpoint of checkpoints) {
      assertLocalized(checkpoint.prompt, `${checkpoint.id} prompt`)
      assertLocalized(checkpoint.explanation, `${checkpoint.id} explanation`)
      assert.ok(checkpoint.choices.length >= 2, `${checkpoint.id} should have answer choices`)
      assert.equal(
        checkpoint.choices.some((choice) => choice.id === checkpoint.answer),
        true,
        `${checkpoint.id} answer should match a choice`,
      )
      assert.ok(
        checkpoint.misconceptionTags.length >= 1,
        `${checkpoint.id} should expose misconception tags`,
      )
      assert.ok(
        chapterIds.has(checkpoint.revisitChapterId),
        `${checkpoint.id} revisitChapterId should point to an existing chapter`,
      )

      for (const choice of checkpoint.choices) {
        assertLocalized(choice.label, `${checkpoint.id}/${choice.id} choice`)
      }
    }

    const moduleFileBySlug: Record<ModuleSlug, string> = {
      'ai-overview': 'aiOverviewModule',
      'python-notebook': 'pythonNotebookModule',
      'housing-price-project': 'housingPriceProjectModule',
      'classification-project': 'classificationProjectModule',
      'model-selection': 'modelSelectionModule',
      'tree-forest': 'treeForestModule',
      'cnn-visualization': 'cnnVisualizationModule',
      'sequence-embedding-bridge': 'sequenceEmbeddingBridgeModule',
      'attention-transformer': 'attentionTransformerModule',
      'optimizer-comparison': 'optimizerComparisonModule',
      'llm-rag': 'llmRagModule',
      'loss-functions': 'lossFunctionsModule',
      'gradient-descent': 'gradientDescentModule',
      'linear-regression': 'linearRegressionModule',
      'logistic-regression': 'logisticRegressionModule',
      classification: 'classificationModule',
      mlp: 'mlpModule',
    }
    const source = read(`src/data/${moduleFileBySlug[slug]}.ts`)
    assert.match(source, /checkpoints:/, `${slug} module should attach checkpoints`)
  }
})
