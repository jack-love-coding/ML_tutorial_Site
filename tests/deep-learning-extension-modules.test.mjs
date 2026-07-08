import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

function escaped(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const moduleExpectations = [
  {
    slug: 'cnn-visualization',
    file: 'cnnVisualizationModule',
    messageKey: 'cnnVisualization',
    route: '/learn/cnn-visualization',
    chapters: [
      'image-volume',
      'kernel-convolution',
      'padding-stride-shape',
      'channels-feature-maps',
      'pooling-classifier-head',
      'transfer-learning-review',
    ],
    concepts: [
      'CNN',
      'H × W × C',
      'kernel',
      'padding',
      'stride',
      'feature map',
      'Conv2d',
      'MaxPool2d',
      '参数共享',
      '迁移学习',
      '老师会先问',
      '想一想',
    ],
    refIds: [
      'REF-CS231N-CNN',
      'REF-D2L-CNN',
      'REF-PYTORCH-CV-TRANSFER',
      'REF-CONV-ARITHMETIC',
    ],
    checkpointIds: [
      'cnn-visualization-parameter-sharing',
      'cnn-visualization-shape',
    ],
    labTokens: [
      "props.moduleSlug === 'cnn-visualization'",
      'cnnStages',
      'selectedCnnStage',
      'workflow-lab__pipeline--cnn',
      'workflow-lab__focus--cnn',
    ],
  },
  {
    slug: 'sequence-embedding-bridge',
    file: 'sequenceEmbeddingBridgeModule',
    messageKey: 'sequenceEmbeddingBridge',
    route: '/learn/sequence-embedding-bridge',
    chapterCount: 5,
    chapters: [
      'why-sequences',
      'token-ids',
      'embedding-lookup',
      'positions-and-masks',
      'shape-handoff',
    ],
    concepts: [
      'token id',
      'embedding lookup',
      '[B,T,H]',
      'position',
      'attention mask',
      '表格',
      '图像',
      '老师会先问',
      '想一想',
    ],
    refIds: [
      'REF-HF-LLM-COURSE',
      'REF-D2L-ATTENTION',
      'REF-ANNOTATED-TRANSFORMER',
    ],
    checkpointIds: [
      'sequence-embedding-token-axis',
      'sequence-embedding-position-role',
    ],
    labTokens: [
      "props.moduleSlug === 'sequence-embedding-bridge'",
      'import SequenceBridgeShapeLab',
      '<SequenceBridgeShapeLab',
      'workflow-lab__pipeline--sequence-bridge',
    ],
  },
  {
    slug: 'attention-transformer',
    file: 'attentionTransformerModule',
    messageKey: 'attentionTransformer',
    route: '/learn/attention-transformer',
    chapters: [
      'tokens-embeddings',
      'qkv-scores',
      'softmax-weighted-sum',
      'multi-head-shapes',
      'transformer-block',
      'architecture-to-tools',
    ],
    concepts: [
      'Q/K/V',
      'score matrix',
      'softmax',
      'value weighted sum',
      '[B,T,H]',
      '[B,heads,T,d_{head}]',
      'MultiheadAttention',
      'LayerNorm',
      'position-wise FFN',
      '老师会先问',
      '想一想',
    ],
    refIds: [
      'REF-D2L-ATTENTION',
      'REF-D2L-TRANSFORMER',
      'REF-ANNOTATED-TRANSFORMER',
      'REF-HF-LLM-COURSE',
    ],
    checkpointIds: [
      'attention-transformer-softmax-dimension',
      'attention-transformer-qkv-role',
    ],
    labTokens: [
      "props.moduleSlug === 'attention-transformer'",
      'import AttentionQkvChallengeLab',
      '<AttentionQkvChallengeLab',
      "section.id === 'softmax-weighted-sum'",
      'import TransformerBlockAssemblyChallengeLab',
      '<TransformerBlockAssemblyChallengeLab',
      "section.id === 'transformer-block'",
      'attentionStages',
      'selectedAttentionStage',
      'workflow-lab__pipeline--attention',
      'workflow-lab__focus--attention',
    ],
  },
  {
    slug: 'optimizer-comparison',
    file: 'optimizerComparisonModule',
    messageKey: 'optimizerComparison',
    route: '/learn/optimizer-comparison',
    chapters: [
      'training-loop',
      'sgd-batch-noise',
      'momentum-rmsprop',
      'adam-weight-decay',
      'learning-rate-schedules',
      'curve-diagnosis',
    ],
    concepts: [
      'loss.backward()',
      'optimizer.step()',
      'zero_grad',
      'SGD',
      'Momentum',
      'RMSProp',
      'AdamW',
      'weight_decay',
      'learning rate schedule',
      'batch size',
      'loss 曲线',
      '老师会先问',
    ],
    refIds: [
      'REF-D2L-OPTIMIZATION',
      'REF-PYTORCH-OPTIMIZATION',
      'REF-PYTORCH-OPTIM',
      'REF-CS231N-NN3',
    ],
    checkpointIds: [
      'optimizer-comparison-loop-order',
      'optimizer-comparison-learning-rate',
    ],
    labTokens: [
      "props.moduleSlug === 'optimizer-comparison'",
      'optimizerStages',
      'selectedOptimizerStage',
      'workflow-lab__pipeline--optimizer',
      'workflow-lab__focus--optimizer',
    ],
  },
  {
    slug: 'llm-rag',
    file: 'llmRagModule',
    messageKey: 'llmRag',
    route: '/learn/llm-rag',
    chapters: [
      'tokenization-context',
      'embeddings-similarity',
      'chunking-retrieval',
      'prompt-assembly',
      'rag-evaluation',
      'rag-is-not-training',
    ],
    concepts: [
      'tokenization',
      'context window',
      'embedding',
      'cosine similarity',
      'chunk_size',
      'chunk_overlap',
      'retrieval',
      'reranking',
      'prompt assembly',
      'grounded answer',
      'RAG 不等于',
      '老师会先问',
    ],
    refIds: [
      'REF-HF-LLM-COURSE',
      'REF-HF-RAG-MILVUS',
      'REF-HF-RAG-ZEPHYR',
      'REF-MS-GENAI-BEGINNERS',
    ],
    checkpointIds: [
      'llm-rag-not-training',
      'llm-rag-failure-source',
    ],
    labTokens: [
      "props.moduleSlug === 'llm-rag'",
      'ragStages',
      'selectedRagStage',
      'workflow-lab__pipeline--rag',
      'workflow-lab__focus--rag',
    ],
  },
]

test('deep learning extension modules follow the required-core spine order', () => {
  const typesSource = read('src/types/ml.ts')
  const catalogSource = read('src/data/moduleCatalog.ts')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')
  const messagesSource = read('src/i18n/messages.ts')
  const orderStart = catalogSource.indexOf('export const moduleOrder')
  const registryStart = catalogSource.indexOf('export const moduleRegistry')
  assert.ok(orderStart >= 0, 'moduleOrder should be exported')
  assert.ok(registryStart > orderStart, 'moduleRegistry should follow moduleOrder')
  const moduleOrderSource = catalogSource.slice(orderStart, registryStart)

  const orderedCatalogTokens = [
    'treeForestModule,',
    'mlpModule,',
    'optimizerComparisonModule,',
    'cnnVisualizationModule,',
    'sequenceEmbeddingBridgeModule,',
    'attentionTransformerModule,',
    'llmRagModule,',
    '...legacyModuleOrder.filter',
  ]

  for (let index = 1; index < orderedCatalogTokens.length; index += 1) {
    assert.ok(
      moduleOrderSource.indexOf(orderedCatalogTokens[index]) > moduleOrderSource.indexOf(orderedCatalogTokens[index - 1]),
      `${orderedCatalogTokens[index]} should follow ${orderedCatalogTokens[index - 1]}`,
    )
  }

  for (const expectation of moduleExpectations) {
    assert.match(typesSource, new RegExp(`\\| '${expectation.slug}'`))
    assert.match(catalogSource, new RegExp(`import \\{ ${expectation.file} \\} from '\\./${expectation.file}'`))
    assert.match(algorithmViewSource, new RegExp(`slug\\.value === '${expectation.slug}'`))
    assert.match(messagesSource, new RegExp(`${expectation.messageKey}: \\{`))
  }
})

test('deep learning extension modules cover required learning loops and references', () => {
  for (const expectation of moduleExpectations) {
    const modulePath = new URL(`src/data/${expectation.file}.ts`, root)
    assert.ok(existsSync(modulePath), `src/data/${expectation.file}.ts should exist`)

    const moduleSource = read(`src/data/${expectation.file}.ts`)
    assert.match(moduleSource, new RegExp(`slug: '${expectation.slug}'`))
    assert.match(moduleSource, new RegExp(`route: '${expectation.route}'`))
    assert.equal([...moduleSource.matchAll(/chapter\(\s*'/g)].length, expectation.chapterCount ?? 6)

    for (const chapterId of expectation.chapters) {
      assert.match(moduleSource, new RegExp(`chapter\\(\\s*'${chapterId}'`))
    }

    for (const requiredConcept of expectation.concepts) {
      assert.match(moduleSource, new RegExp(escaped(requiredConcept)))
    }

    for (const refId of expectation.refIds) {
      assert.match(moduleSource, new RegExp(refId))
    }

    assert.doesNotMatch(moduleSource, /https?:\/\//)
    assert.doesNotMatch(moduleSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
  }
})

test('deep learning extension modules expose checkpoints, lab stages, and centralized references', () => {
  const checkpointSource = read('src/data/algorithmCheckpoints.ts')
  const labSource = read('src/components/AppliedWorkflowLessonLab.vue')
  const styleSource = read('src/styles/modules/workflow-lessons.css')
  const referenceSource = read('docs/ml-atlas-references.md')

  for (const expectation of moduleExpectations) {
    assert.match(checkpointSource, new RegExp(escaped(`'${expectation.slug}': [`)))

    for (const checkpointId of expectation.checkpointIds) {
      assert.match(checkpointSource, new RegExp(escaped(checkpointId)))
    }

    for (const labToken of expectation.labTokens) {
      assert.match(labSource, new RegExp(escaped(labToken)))
    }

    for (const refId of expectation.refIds) {
      assert.match(referenceSource, new RegExp(refId))
    }
  }

  for (const className of [
    'workflow-lab__focus--cnn',
    'sequence-shape-lab',
    'workflow-lab__focus--attention',
    'workflow-lab__focus--optimizer',
    'workflow-lab__focus--rag',
  ]) {
    assert.match(styleSource, new RegExp(className))
  }

  assert.doesNotMatch(labSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
})
