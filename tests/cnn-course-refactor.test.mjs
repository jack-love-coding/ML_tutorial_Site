import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if ((specifier.startsWith('.') || specifier.startsWith('/')) && !/\.[cm]?[jt]sx?$/.test(specifier)) {
        return nextResolve(`${specifier}.ts`, context)
      }
      throw error
    }
  },
})

const { cnnVisualizationModule } = await import('../src/data/cnnVisualizationModule.ts')
const { cnnLessonFocusConfigs } = await import('../src/lessons/neuralGuided.ts')
const {
  assertFiniteCnnForwardPass,
  boundedCnnLayerIndex,
  boundedCnnNodeIndex,
  cnnLayerIndexForStage,
  nextCnnLayerIndex,
} = await import('../src/utils/cnnGuided.ts')
const { renderMarkdownWithMath } = await import('../src/utils/markdownMath.ts')

const root = new URL('../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const chapterIds = [
  'image-volume',
  'kernel-convolution',
  'padding-stride-shape',
  'channels-feature-maps',
  'pooling-classifier-head',
  'transfer-learning-review',
]
const headings = {
  'zh-CN': ['本章问题', '直觉', '变量与公式', '手算或代码例子', '读图提示', '常见误区', '实验任务', '本章结论'],
  en: ['Chapter question', 'Intuition', 'Variables and formula', 'Worked or code example', 'How to read the visual', 'Common misconception', 'Lab task', 'Chapter conclusion'],
}

function layer(index, kind, nodes = 1) {
  return {
    id: `${kind}-${index}`,
    name: `${kind}-${index}`,
    index,
    kind,
    inputShape: index ? [8, 8, nodes] : [64, 64, 3],
    outputShape: index ? [8, 8, nodes] : [64, 64, 3],
    parameterCount: kind === 'conv' || kind === 'dense' ? 10 : 0,
    nodes: Array.from({ length: nodes }, (_, nodeIndex) => ({
      id: `${kind}-${index}-${nodeIndex}`,
      layerName: `${kind}-${index}`,
      layerIndex: index,
      index: nodeIndex,
      kind,
      output: 0,
      bias: 0,
      inputLinks: [],
      outputLinks: [],
    })),
  }
}

const fixtureLayers = [
  layer(0, 'input', 3), layer(1, 'conv', 4), layer(2, 'pool', 4),
  layer(3, 'conv', 8), layer(4, 'pool', 8), layer(5, 'dense', 2),
]

test('all six CNN chapters expose the complete bilingual teaching sequence and runtime shape', () => {
  assert.deepEqual(cnnVisualizationModule.chapters.map((chapter) => chapter.id), chapterIds)
  for (const chapter of cnnVisualizationModule.chapters) {
    for (const locale of ['zh-CN', 'en']) {
      const source = chapter.markdown[locale]
      let cursor = -1
      for (const heading of headings[locale]) {
        const next = source.indexOf(`### ${heading}`)
        assert.ok(next > cursor, `${chapter.id}/${locale} should place ${heading} in order`)
        cursor = next
      }
      assert.ok(source.length > (locale === 'zh-CN' ? 700 : 1200))
      assert.doesNotMatch(source, /32\s*(?:×|\\times)\s*32\s*(?:×|\\times)\s*3/)
      assert.doesNotMatch(source, /观察证据|本章观察证据|Evidence to watch|### Ref ID/)
      const html = renderMarkdownWithMath(source)
      assert.match(html, /<h3>/)
      assert.doesNotMatch(html, /katex-error|\$\$|<script|onerror=/i)
    }
  }
  const completeLessonSource = cnnVisualizationModule.chapters
    .flatMap((chapter) => Object.values(chapter.markdown))
    .join('\n')
  assert.match(completeLessonSource, /64\s*(?:×|\\times)\s*64\s*(?:×|\\times)\s*3/)
})

test('CNN chapter contracts bind each chapter to bounded semantic controls and samples', () => {
  assert.deepEqual(cnnLessonFocusConfigs.map((contract) => contract.chapterId), chapterIds)
  for (const contract of cnnLessonFocusConfigs) {
    assert.equal(contract.kind, 'cnn')
    assert.ok(contract.guidedControls.length >= 1 && contract.guidedControls.length <= 5)
    assert.equal(new Set(contract.guidedControls).size, contract.guidedControls.length)
    assert.match(contract.initialSampleId, /^sample-[0-9]$/)
    assert.ok(contract.observation['zh-CN'] && contract.observation.en)
    assert.ok(cnnLayerIndexForStage(fixtureLayers, contract.stage) >= 0)
  }
})

test('CNN selection and forward-pass guards reject invalid derived state', () => {
  assert.equal(cnnLayerIndexForStage(fixtureLayers, 'input'), 0)
  assert.equal(cnnLayerIndexForStage(fixtureLayers, 'conv-block-1'), 1)
  assert.equal(cnnLayerIndexForStage(fixtureLayers, 'pool-1'), 2)
  assert.equal(cnnLayerIndexForStage(fixtureLayers, 'conv-block-2'), 3)
  assert.equal(cnnLayerIndexForStage(fixtureLayers, 'pool-2'), 4)
  assert.equal(cnnLayerIndexForStage(fixtureLayers, 'classifier'), 5)
  assert.equal(boundedCnnLayerIndex(fixtureLayers, Number.NaN), 0)
  assert.equal(boundedCnnLayerIndex(fixtureLayers, 999), 5)
  assert.equal(boundedCnnNodeIndex(fixtureLayers[0], Number.POSITIVE_INFINITY), 0)
  assert.equal(nextCnnLayerIndex(fixtureLayers, 5), 0)

  const valid = {
    layers: fixtureLayers,
    scores: [
      { id: 'a', label: 'a', logit: 1, probability: 0.75 },
      { id: 'b', label: 'b', logit: 0, probability: 0.25 },
    ],
    topPrediction: { id: 'a', label: 'a', logit: 1, probability: 0.75 },
    inputShape: [64, 64, 3],
  }
  assert.equal(assertFiniteCnnForwardPass(valid), valid)
  assert.throws(() => assertFiniteCnnForwardPass({ ...valid, inputShape: [32, 32, 3] }))
  assert.throws(() => assertFiniteCnnForwardPass({
    ...valid,
    scores: [{ id: 'a', label: 'a', logit: 1, probability: Number.NaN }],
  }))
})

test('CNN course uses a lightweight lazy lab while exploration retains the full inspector', () => {
  const shell = read('src/components/CnnExplainerLab.vue')
  const guided = read('src/components/cnn/CnnGuidedLab.vue')
  const explorer = read('src/components/cnn/CnnExplorerWorkbench.vue')
  const controller = read('src/composables/useCnnGuidedController.ts')
  const inference = read('src/composables/useCnnInference.ts')
  const playback = read('src/composables/useCnnPlayback.ts')
  const algorithm = read('src/views/AlgorithmView.vue')
  const explorerView = read('src/views/NeuralExplorerView.vue')

  assert.match(shell, /defineAsyncComponent/)
  assert.match(shell, /CnnGuidedLab/)
  assert.match(shell, /CnnExplorerWorkbench/)
  assert.match(algorithm, /defineAsyncComponent\([\s\S]*cnn\/CnnGuidedLab\.vue/)
  assert.doesNotMatch(algorithm, /CnnExplorerWorkbench|CnnExplorerLab/)
  assert.match(explorerView, /defineAsyncComponent\([\s\S]*cnn\/CnnExplorerLab\.vue/)
  assert.match(guided, /useCnnGuidedController/)
  assert.match(guided, /accept="image\/png,image\/jpeg,image\/webp"/)
  assert.equal((guided.match(/type="file"/g) ?? []).length, 1)
  assert.match(inference, /URL\.createObjectURL/)
  assert.match(inference, /URL\.revokeObjectURL/)
  assert.match(inference, /onBeforeUnmount\(dispose\)/)
  assert.match(playback, /prefers-reduced-motion/)
  assert.match(playback, /window\.clearInterval/)
  assert.match(controller, /boundedCnnLayerIndex/)
  assert.match(explorer, /class="cnn-explainer-explore"/)
  assert.doesNotMatch(explorerView, /saveAlgorithmProgress|localStorage|markModuleComplete/)
})

test('CNN mobile architecture is a vertical track with an inline current-stage fallback', () => {
  const track = read('src/components/cnn/CnnArchitectureTrack.vue')
  const guided = read('src/components/cnn/CnnGuidedLab.vue')
  const styles = read('src/styles/modules/neural-guided.css')
  assert.match(track, /name="mobile-detail"/)
  assert.match(guided, /#mobile-detail/)
  assert.match(styles, /@media \(min-width: 390px\) and \(max-width: 767px\)/)
  assert.match(styles, /\.cnn-guided-track ol\s*\{[\s\S]*display: grid/)
  assert.match(styles, /\.cnn-guided-track__mobile-detail\s*\{[\s\S]*display: grid/)
})
