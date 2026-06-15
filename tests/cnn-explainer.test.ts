import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import {
  calculateConvCell,
  calculateMaxPoolCell,
  softmaxScores,
  summarizeLayerShape,
  tinyVggClassLabels,
} from '../src/utils/cnnExplainer.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('CNN explainer pure math computes convolution, pooling, softmax, and summaries', () => {
  const conv = calculateConvCell(
    [
      [
        [1, 2],
        [3, 4],
      ],
      [
        [2, 1],
        [0, -1],
      ],
    ],
    [
      [
        [1, 0],
        [0, 1],
      ],
      [
        [0.5, 0.5],
        [1, 0],
      ],
    ],
    0.25,
    0,
    0,
  )

  assert.equal(conv.channelContributions?.length, 2)
  assert.equal(conv.channelContributions?.[0]?.sum, 5)
  assert.equal(conv.channelContributions?.[1]?.sum, 1.5)
  assert.equal(conv.weightedSum, 6.75)

  const pooled = calculateMaxPoolCell(
    [
      [1, 3, 2],
      [4, 2, 8],
      [0, 5, 9],
    ],
    0,
    0,
  )

  assert.equal(pooled.poolMax, 4)
  assert.deepEqual(pooled.poolMaxPosition, { row: 1, col: 0 })

  const softmax = softmaxScores([1000, 1001, 999])
  assert.equal(Math.abs(softmax.probabilities.reduce((sum, value) => sum + value, 0) - 1) < 1e-12, true)
  assert.equal(softmax.probabilities[1]! > softmax.probabilities[0]!, true)

  const summary = summarizeLayerShape({
    kind: 'conv',
    outputShape: [32, 32, 16],
    parameterCount: 448,
    nodes: Array.from({ length: 16 }) as never[],
  })
  assert.equal(summary, 'conv: 32x32x16, 16 nodes, 448 params')
})

test('CNN explainer Tiny VGG assets, labels, and provenance are local and documented', () => {
  const modelPath = new URL('public/cnn-explainer/tiny-vgg/model.json', root)
  const weightsPath = new URL('public/cnn-explainer/tiny-vgg/group1-shard1of1.bin', root)
  const licensePath = new URL('public/cnn-explainer/tiny-vgg/LICENSE', root)
  const docsSource = read('docs/cnn-explainer-assets.md')
  const referenceSource = read('docs/ml-atlas-references.md')

  assert.ok(existsSync(modelPath))
  assert.ok(existsSync(weightsPath))
  assert.ok(existsSync(licensePath))
  assert.equal(statSync(weightsPath).size > 70_000, true)

  const model = JSON.parse(read('public/cnn-explainer/tiny-vgg/model.json'))
  assert.equal(model.format, 'layers-model')
  assert.equal(model.modelTopology.model_config.config.layers.length, 12)
  assert.equal(model.weightsManifest[0].paths.includes('group1-shard1of1.bin'), true)

  assert.deepEqual([...tinyVggClassLabels], [
    'lifeboat',
    'ladybug',
    'pizza',
    'bell pepper',
    'school bus',
    'koala',
    'espresso',
    'red panda',
    'orange',
    'sport car',
  ])

  assert.match(docsSource, /d0971f9447ed9806022a3d47587b62394682bc51/)
  assert.match(docsSource, /MIT/)
  assert.match(docsSource, /sample JPEG images were not migrated/)
  assert.match(referenceSource, /REF-CNN-EXPLAINER/)
})

test('CNN explainer lab is browser-local, lazy, and wired only into the CNN route', () => {
  const packageSource = read('package.json')
  const utilitySource = read('src/utils/cnnExplainer.ts')
  const componentSource = read('src/components/CnnExplainerLab.vue')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')
  const moduleSource = read('src/data/cnnVisualizationModule.ts')

  assert.match(packageSource, /"@tensorflow\/tfjs": "\^4\.22\.0"/)
  assert.match(utilitySource, /await import\('@tensorflow\/tfjs'\)/)
  assert.match(utilitySource, /withPublicBase\(tinyVggModelPath\)/)
  assert.match(componentSource, /accept="image\/png,image\/jpeg,image\/webp"/)
  assert.match(componentSource, /maxUploadBytes = 5 \* 1024 \* 1024/)
  assert.match(componentSource, /URL\.createObjectURL/)
  assert.match(componentSource, /URL\.revokeObjectURL/)
  assert.match(componentSource, /prefers-reduced-motion/)
  assert.match(componentSource, /MarkdownMathContent/)
  assert.match(algorithmViewSource, /import CnnExplainerLab/)
  assert.match(
    algorithmViewSource,
    /<CnnExplainerLab v-if="isCnnVisualizationPage && section\.id === activeChapter"/,
  )
  assert.match(moduleSource, /Tiny VGG/)
  assert.match(moduleSource, /browser-side forward pass/)
  assert.match(moduleSource, /REF-CNN-EXPLAINER/)
})
