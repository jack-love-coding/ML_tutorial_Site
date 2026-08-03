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

const { mlpModule } = await import('../src/data/mlpModule.ts')
const { mlpLessonFocusConfigs } = await import('../src/lessons/neuralGuided.ts')
const { normalizeMlpPlaygroundState } = await import('../src/simulations/mlpPlayground.ts')
const { renderMarkdownWithMath } = await import('../src/utils/markdownMath.ts')

const root = new URL('../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const chapterIds = [
  'linearLimits',
  'neuronAffine',
  'activations',
  'hiddenRepresentation',
  'forwardOutput',
  'backprop',
  'trainingDynamics',
  'capacityGeneralization',
]

const headings = {
  'zh-CN': ['本章问题', '直觉', '变量与公式', '手算或代码例子', '读图提示', '常见误区', '实验任务', '本章结论'],
  en: ['Chapter question', 'Intuition', 'Variables and formula', 'Worked or code example', 'How to read the visual', 'Common misconception', 'Lab task', 'Chapter conclusion'],
}

test('all eight MLP chapters expose the complete bilingual teaching sequence', () => {
  assert.deepEqual(mlpModule.chapters.map((section) => section.id), chapterIds)

  for (const section of mlpModule.chapters) {
    for (const locale of ['zh-CN', 'en']) {
      const source = section.markdown[locale]
      let cursor = -1
      for (const heading of headings[locale]) {
        const next = source.indexOf(`### ${heading}`)
        assert.ok(next > cursor, `${section.id}/${locale} should place ${heading} in order`)
        cursor = next
      }
      const minimumLength = locale === 'zh-CN' ? 500 : 1000
      assert.ok(source.length > minimumLength, `${section.id}/${locale} should contain a full lesson`)
      assert.doesNotMatch(source, /观察证据|本章观察证据|Evidence to watch|### Ref ID/)

      const html = renderMarkdownWithMath(source)
      assert.match(html, /<h3>/)
      assert.doesNotMatch(html, /katex-error|\$\$|<script|onerror=/i)
      assert.doesNotMatch(source, /\$(?:mathbf|eta|lambda)\b|\^\s*op(?:mathbf)?/)
    }
  }
})

test('MLP guided chapter contracts match controls, readouts, and finite presets', () => {
  assert.deepEqual(mlpLessonFocusConfigs.map((contract) => contract.chapterId), chapterIds)
  for (const contract of mlpLessonFocusConfigs) {
    assert.equal(contract.kind, 'mlp')
    assert.ok(contract.guidedControls.length >= 1 && contract.guidedControls.length <= 3)
    assert.equal(new Set(contract.guidedControls).size, contract.guidedControls.length)
    assert.ok(contract.resultReadouts.length >= 2 && contract.resultReadouts.length <= 3)
    assert.equal(new Set(contract.resultReadouts).size, contract.resultReadouts.length)
    assert.ok(contract.observation['zh-CN'] && contract.observation.en)

    for (const preset of [contract.initialState, contract.explorePreset]) {
      const normalized = normalizeMlpPlaygroundState(preset)
      for (const value of [
        normalized.learningRate,
        normalized.batchSize,
        normalized.noise,
        normalized.trainRatio,
        normalized.regularizationRate,
        ...normalized.networkShape,
      ]) {
        assert.ok(Number.isFinite(value), `${contract.chapterId} should only expose finite values`)
      }
    }
  }

  assert.equal(mlpLessonFocusConfigs[0].initialState.classificationDataset, 'xor')
  assert.deepEqual(mlpLessonFocusConfigs[0].initialState.networkShape, [])
})

test('MLP guided and exploration shells stay lazy and keep advanced editing out of guided mode', () => {
  const algorithm = read('src/views/AlgorithmView.vue')
  const explorer = read('src/views/NeuralExplorerView.vue')
  const cockpit = read('src/components/MlpPlaygroundCockpit.vue')
  const controller = read('src/composables/useMlpPlaygroundController.ts')

  assert.match(algorithm, /defineAsyncComponent\([\s\S]*components\/mlp\/MlpGuidedLab\.vue/)
  assert.match(explorer, /defineAsyncComponent\([\s\S]*components\/mlp\/MlpExplorerLab\.vue/)
  assert.match(cockpit, /props\.mode === 'explore'/)
  assert.match(cockpit, /lessonFocus\.value\?\.guidedControls/)
  assert.match(cockpit, /lessonFocus\.value\?\.resultReadouts/)
  assert.match(controller, /onBeforeUnmount\(dispose\)/)
  assert.match(controller, /window\.clearInterval/)
  assert.doesNotMatch(explorer, /saveAlgorithmProgress|localStorage|markModuleComplete/)
})
