import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

function walkFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      walkFiles(path, files)
    } else if (/\.(ts|vue)$/.test(entry)) {
      files.push(path)
    }
  }
  return files
}

test('MLP remains an independent guided module in the required-core order', () => {
  const catalogSource = read('src/data/moduleCatalog.ts')
  const mlpModuleSource = read('src/data/mlpModule.ts')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')
  const orderStart = catalogSource.indexOf('export const moduleOrder')
  const registryStart = catalogSource.indexOf('export const moduleRegistry')
  assert.ok(orderStart >= 0, 'moduleOrder should be exported')
  assert.ok(registryStart > orderStart, 'moduleRegistry should follow moduleOrder')
  const moduleOrderSource = catalogSource.slice(orderStart, registryStart)

  assert.match(catalogSource, /import\('\.\/mlpModule'\)/)
  assert.doesNotMatch(catalogSource, /import \{ mlpModule \}/)
  assert.ok(
    moduleOrderSource.indexOf('treeForestModule,') < moduleOrderSource.indexOf('mlpModule,'),
    'MLP should follow tree-forest in the public course order',
  )
  assert.ok(
    moduleOrderSource.indexOf('mlpModule,') < moduleOrderSource.indexOf('optimizerComparisonModule,'),
    'MLP should precede optimizer-comparison in the public course order',
  )

  assert.equal([...mlpModuleSource.matchAll(/titleKey: `modules\.mlp\.sections\.\$\{id\}\.title`/g)].length, 1)
  for (const id of [
    'linearLimits',
    'neuronAffine',
    'activations',
    'hiddenRepresentation',
    'forwardOutput',
    'backprop',
    'trainingDynamics',
    'capacityGeneralization',
  ]) {
    assert.match(mlpModuleSource, new RegExp(`'${id}'`))
  }

  assert.match(algorithmViewSource, /MlpPlaygroundCockpit/)
  assert.match(algorithmViewSource, /slug\.value === 'mlp'/)
  assert.match(algorithmViewSource, /visualAssetsFor/)
  assert.match(algorithmViewSource, /mlp-playground-stage/)
  assert.match(algorithmViewSource, /mlp-playground-jump/)
  assert.doesNotMatch(algorithmViewSource, /<MlpLessonLab/)
  assert.doesNotMatch(algorithmViewSource, /mlp-playground-rail/)
})

test('professional lesson labs keep the shared workbench shell where it is still used', () => {
  for (const path of [
    'src/components/GradientChapterLab.vue',
    'src/components/LinearRegressionLessonLab.vue',
  ]) {
    const source = read(path)
    assert.match(source, /LessonWorkbench/)
    assert.match(source, /#visual/)
    assert.match(source, /#controls/)
    assert.match(source, /#metrics/)
  }

  const workbenchSource = read('src/components/LessonWorkbench.vue')
  assert.match(workbenchSource, /variant\?: 'standard' \| 'cockpit'/)
  for (const slotName of ['task', 'visual', 'controls', 'metrics', 'presets', 'timeline']) {
    assert.match(workbenchSource, new RegExp(`name="${slotName}"`))
  }

  const mlpCockpitSource = read('src/components/MlpPlaygroundCockpit.vue')
  const outputMapSource = read('src/components/MlpOutputFitMap.vue')
  const networkGraphSource = read('src/components/MlpNetworkGraph.vue')
  const timelineSource = read('src/components/MlpTrainingTimeline.vue')

  assert.match(mlpCockpitSource, /createMlpPlaygroundSession/)
  assert.match(mlpCockpitSource, /MlpOutputFitMap/)
  assert.match(mlpCockpitSource, /MlpNetworkGraph/)
  assert.match(mlpCockpitSource, /MlpTrainingTimeline/)
  assert.match(outputMapSource, /from 'd3'/)
  assert.match(outputMapSource, /contours/)
  assert.match(outputMapSource, /data-testid="mlp-output-heatmap"/)
  assert.match(outputMapSource, /data-testid="mlp-output-contour"/)
  assert.match(networkGraphSource, /from 'd3'/)
  assert.match(networkGraphSource, /data-testid="mlp-network-graph"/)
  assert.match(timelineSource, /from 'd3'/)
  assert.match(timelineSource, /data-testid="mlp-training-timeline"/)
})

test('MLP module declares sources and project-local visual assets', () => {
  const mlpModuleSource = read('src/data/mlpModule.ts')
  const renderMlpSource = read('scripts/manim/render_mlp.py')
  for (const source of ['d2l.ai', 'developers.google.com', 'openstax.org', 'playground.tensorflow.org', 'github.com/tensorflow/playground']) {
    assert.match(mlpModuleSource, new RegExp(source.replaceAll('.', '\\.')))
  }

  for (const assetPath of [
    'public/mlp/generated/affine-activation-map.png',
    'public/mlp/generated/hidden-space-rewrite.png',
    'public/mlp/generated/backprop-responsibility.png',
    'public/mlp/generated/capacity-generalization.png',
    'public/manim/mlp/affine-activation.mp4',
    'public/manim/mlp/hidden-rewrite.mp4',
    'public/manim/mlp/backprop-responsibility.mp4',
    'public/manim/mlp/capacity-overfitting.mp4',
    'public/manim/mlp/affine-activation.svg',
    'public/manim/mlp/hidden-rewrite.svg',
    'public/manim/mlp/backprop-responsibility.svg',
    'public/manim/mlp/capacity-overfitting.svg',
  ]) {
    assert.ok(statSync(new URL(assetPath, root)).isFile(), `${assetPath} should exist`)
  }

  assert.match(renderMlpSource, /Training loss alone cannot choose the right boundary/)
  assert.match(renderMlpSource, /Hidden space rewrites geometry/)
})

test('source files do not keep common mojibake fragments', () => {
  const srcPath = fileURLToPath(new URL('../src', import.meta.url))
  const mojibake = /(鎷|閹|�|鈥|璇剧|鏁板|瀹為|绔犺|姊|鎹熷|绾挎|娴呭|闅愯|婵€|鍑嗙|骞惰)/
  const offenders = walkFiles(srcPath).filter((file) => mojibake.test(readFileSync(file, 'utf8')))

  assert.deepEqual(offenders, [])
})

test('MLP visible source stays readable in Chinese', () => {
  const visibleSources = [
    'src/components/MlpPlaygroundCockpit.vue',
    'src/data/mlpModule.ts',
    'src/views/AlgorithmView.vue',
  ].map(read).join('\n')

  for (const phrase of ['当前章节任务', '输出拟合图', '线性模型为什么会在 XOR 上失败', '回到 MLP 实验台']) {
    assert.match(visibleSources, new RegExp(phrase))
  }

  assert.doesNotMatch(visibleSources, /(鍥炲埌|瀹為獙|鏉ユ簮|鏀瑰啓|鐨勫師|鈫|鈻|鈪)/)
})
