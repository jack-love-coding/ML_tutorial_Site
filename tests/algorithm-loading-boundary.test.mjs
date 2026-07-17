import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('algorithm definitions and specialized lesson components stay behind async boundaries', () => {
  const catalogSource = read('src/data/moduleCatalog.ts')
  const viewSource = read('src/views/AlgorithmView.vue')
  const storeSource = read('src/stores/experiments.ts')

  assert.match(catalogSource, /loadAlgorithmModule/)
  assert.equal([...catalogSource.matchAll(/await import\('\.\//g)].length, 17)
  assert.doesNotMatch(catalogSource, /import \{ \w+Module \} from/)

  assert.match(viewSource, /await loadAlgorithmModule\(nextSlug\)/)
  assert.match(viewSource, /registerExperimentModule\(nextModuleDefinition\)/)
  assert.match(viewSource, /defineAsyncComponent/)
  assert.doesNotMatch(viewSource, /import LinearRegressionPagedLesson from/)
  assert.doesNotMatch(viewSource, /import CnnExplainerLab from/)

  assert.match(storeSource, /registeredModules/)
  assert.doesNotMatch(storeSource, /moduleCatalog/)
})
