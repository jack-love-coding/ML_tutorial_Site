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

  assert.equal([...mlpModuleSource.matchAll(/modules\.mlp\.sections\.[^.]+\.title/g)].length, 6)
  for (const id of ['features', 'activations', 'reconfigure', 'backprop', 'capacity', 'generalization']) {
    assert.match(mlpModuleSource, new RegExp(`'${id}'`))
  }

  assert.match(algorithmViewSource, /MlpLessonLab/)
  assert.match(algorithmViewSource, /slug\.value === 'mlp'/)
})

test('three professional lesson labs use the shared workbench shell', () => {
  for (const path of [
    'src/components/GradientChapterLab.vue',
    'src/components/LinearRegressionLessonLab.vue',
    'src/components/MlpLessonLab.vue',
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

  const mlpSource = read('src/components/MlpLessonLab.vue')
  assert.doesNotMatch(mlpSource, /variant="cockpit"/)
})

test('source files do not keep common mojibake fragments', () => {
  const srcPath = fileURLToPath(new URL('../src', import.meta.url))
  const mojibake = /(鎷|閹|�|鈥|璇剧|鏁板|瀹為|绔犺|姊|鎹熷|绾挎|娴呭|闅愯|婵€|鍑嗙|骞惰)/
  const offenders = walkFiles(srcPath).filter((file) => mojibake.test(readFileSync(file, 'utf8')))

  assert.deepEqual(offenders, [])
})
