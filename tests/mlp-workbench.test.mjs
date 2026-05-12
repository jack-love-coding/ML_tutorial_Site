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

test('MLP is promoted to an independent guided module', () => {
  const catalogSource = read('src/data/moduleCatalog.ts')
  const mlpModuleSource = read('src/data/mlpModule.ts')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')

  assert.match(catalogSource, /import \{ mlpModule \} from '\.\/mlpModule'/)
  assert.match(catalogSource, /moduleDefinition\.slug !== 'mlp'/)
  assert.ok(
    catalogSource.indexOf('...legacyModuleOrder.filter') < catalogSource.lastIndexOf('mlpModule'),
    'MLP should follow the legacy logistic-regression module in the public course order',
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
  assert.match(mlpCockpitSource, /createMlpPlaygroundSession/)
  assert.match(mlpCockpitSource, /data-testid="mlp-output-heatmap"/)
  assert.match(mlpCockpitSource, /data-testid="mlp-network-graph"/)
})

test('MLP module declares sources and project-local visual assets', () => {
  const mlpModuleSource = read('src/data/mlpModule.ts')
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
  ]) {
    assert.ok(statSync(new URL(assetPath, root)).isFile(), `${assetPath} should exist`)
  }
})

test('source files do not keep common mojibake fragments', () => {
  const srcPath = fileURLToPath(new URL('../src', import.meta.url))
  const mojibake = /(鎷|閹|�|鈥|璇剧|鏁板|瀹為|绔犺|姊|鎹熷|绾挎|娴呭|闅愯|婵€|鍑嗙|骞惰)/
  const offenders = walkFiles(srcPath).filter((file) => mojibake.test(readFileSync(file, 'utf8')))

  assert.deepEqual(offenders, [])
})
