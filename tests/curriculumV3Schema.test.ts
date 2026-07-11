import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumV3Arcs } from '../src/curriculum/v3/arcs.ts'
import { curriculumV3FoundationModules } from '../src/curriculum/v3/modules/foundations.ts'
import { curriculumV3MachineLearningModules } from '../src/curriculum/v3/modules/machineLearning.ts'
import { curriculumV3DeepLearningModules } from '../src/curriculum/v3/modules/deepLearning.ts'
import {
  curriculumV3InstructionalModuleById,
  curriculumV3InstructionalModules,
} from '../src/curriculum/v3/inventory.ts'

type DeepLearningModuleId = (typeof curriculumV3DeepLearningModules)[number]['id']
type IsExactlyString<T> = string extends T ? (T extends string ? true : false) : false
const deepLearningIdsRemainLiteral: IsExactlyString<DeepLearningModuleId> extends true ? never : true = true
void deepLearningIdsRemainLiteral

const expectedDeepLearningIds = [
  'neuron-activation-foundations', 'mlp', 'backpropagation-mechanism',
  'matrix-calculus-autodiff', 'initialization-normalization', 'optimizer-comparison',
  'deep-architecture-math', 'tensor-shapes-vectorization', 'cnn-visualization',
  'sequence-models-rnn', 'sequence-embedding-bridge', 'tokenization-language-modeling',
  'attention-qkv-multihead', 'transformer-blocks', 'small-transformer-training',
  'decoding-sampling', 'llm-inference-context', 'peft-lora', 'retrieval-rag-systems',
  'llm-evaluation-reliability',
] as const satisfies readonly DeepLearningModuleId[]

test('V3 instructional inventory has 56 ordered modules ending in reliable LLM systems', () => {
  assert.equal(curriculumV3DeepLearningModules.length, 20)
  assert.equal(curriculumV3InstructionalModules.length, 56)
  assert.equal(curriculumV3InstructionalModuleById.size, 56)
  assert.equal(curriculumV3InstructionalModules[0]?.id, 'ai-overview')
  assert.equal(curriculumV3InstructionalModules.at(-1)?.id, 'llm-evaluation-reliability')
})

test('Transformer and LLM modules expose required mathematical revisits', () => {
  assert.ok(curriculumV3InstructionalModuleById.get('attention-qkv-multihead')?.revisits.includes('matrix-multiplication'))
  assert.ok(curriculumV3InstructionalModuleById.get('decoding-sampling')?.revisits.includes('probability-distribution'))
  assert.ok(curriculumV3InstructionalModuleById.get('retrieval-rag-systems')?.revisits.includes('vector-similarity'))
})

test('deep learning evidence code IDs are stable and module-derived', () => {
  assert.deepEqual(curriculumV3DeepLearningModules.map((module) => module.id), expectedDeepLearningIds)
  for (const module of curriculumV3DeepLearningModules) {
    if (module.contentEvidence.scratchCodeId !== undefined) {
      assert.equal(module.contentEvidence.scratchCodeId, `${module.id}-scratch-code`)
    }
    if (module.contentEvidence.frameworkCodeId !== undefined) {
      assert.equal(module.contentEvidence.frameworkCodeId, `${module.id}-framework-code`)
    }
  }
})

test('Curriculum V3 defines ten ordered bilingual arcs', () => {
  assert.deepEqual(curriculumV3Arcs.map((arc) => arc.id), [
    'math-language',
    'linear-algebra',
    'calculus-probability-optimization',
    'data-to-features',
    'classical-supervised-learning',
    'generalization-evaluation',
    'neural-network-foundations',
    'deep-learning-structures',
    'transformers-language-models',
    'llm-adaptation-retrieval',
  ])
  assert.deepEqual(curriculumV3Arcs.map((arc) => arc.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  for (const arc of curriculumV3Arcs) {
    assert.ok(arc.title['zh-CN'].trim())
    assert.ok(arc.title.en.trim())
    assert.ok(arc.purpose['zh-CN'].trim())
    assert.ok(arc.purpose.en.trim())
  }
})

test('V3 machine learning inventory walks from data to reliable evaluation', () => {
  assert.equal(curriculumV3MachineLearningModules.length, 14)
  assert.equal(curriculumV3MachineLearningModules[0]?.id, 'numerical-data')
  assert.equal(curriculumV3MachineLearningModules.at(-1)?.id, 'training-diagnostics')
  const byId = new Map(curriculumV3MachineLearningModules.map((module) => [module.id, module]))
  assert.ok(byId.get('linear-regression')?.prerequisiteIds.includes('loss-functions'))
  assert.ok(byId.get('classification')?.prerequisiteIds.includes('logistic-regression'))
  assert.ok(byId.get('model-selection')?.prerequisiteIds.includes('splits-generalization'))
})

test('V3 foundations contain 22 substantive bilingual modules', () => {
  assert.equal(curriculumV3FoundationModules.length, 22)
  assert.deepEqual(
    curriculumV3FoundationModules.map((module) => module.id),
    [
      'ai-overview',
      'python-notebook',
      'calculus-functions-rate-change',
      'beginner-linear-algebra',
      'calculus-derivatives-local-change',
      'beginner-probability-distributions',
      'linear-algebra-feature-space',
      'linear-algebra-distance-similarity',
      'linear-algebra-matrix-transformations',
      'linear-algebra-rank-null-space',
      'least-squares-fitting',
      'eigenvalues-eigenvectors',
      'svd-pca-representation',
      'numerical-linear-algebra',
      'calculus-partial-derivatives-gradients',
      'chain-rule-local-approximation',
      'numerical-differentiation-root-finding',
      'probability-expectation-variance',
      'conditional-probability-markov',
      'probability-likelihood-entropy',
      'monte-carlo',
      'gradient-descent',
    ],
  )
  assert.deepEqual(
    curriculumV3FoundationModules.map((module) => module.order),
    Array.from({ length: 22 }, (_, index) => index + 1),
  )

  for (const module of curriculumV3FoundationModules) {
    assert.ok(module.title['zh-CN'].trim())
    assert.ok(module.title.en.trim())
    assert.ok(module.learnerQuestion['zh-CN'].trim())
    assert.ok(module.learnerQuestion.en.trim())
    assert.ok(module.outcomes[0]?.['zh-CN'].trim())
    assert.ok(module.outcomes[0]?.en.trim())
    assert.ok(module.mathCapabilities.length)
    assert.ok(module.pythonCapabilities.length)
    assert.ok(module.contentEvidence.formulaVocabulary.length)
    assert.equal(module.contentEvidence.intuitionId, `${module.id}-intuition`)
    assert.equal(module.contentEvidence.workedExampleId, `${module.id}-worked-example`)
    assert.equal(module.contentEvidence.experimentId, `${module.id}-experiment`)
    assert.equal(module.contentEvidence.failureCaseId, `${module.id}-failure-case`)
    assert.deepEqual(module.contentEvidence.exerciseKinds, [
      'concept',
      'calculation-code',
      'open-experiment',
    ])
    assert.deepEqual(module.authoring, {
      zhCN: 'planned',
      review: 'planned',
      en: 'planned',
      runtime: 'planned',
    })
  }

  for (const field of ['zh-CN', 'en'] as const) {
    assert.equal(
      new Set(curriculumV3FoundationModules.map((module) => module.learnerQuestion[field])).size,
      22,
    )
    assert.equal(
      new Set(curriculumV3FoundationModules.map((module) => module.outcomes[0]?.[field])).size,
      22,
    )
  }
})
