import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const json = (path) => JSON.parse(read(path))

test('six chapters map one-to-one to lazy real-result scenes', () => {
  const shell = read('src/components/HousingProjectObservationLab.vue')
  const expected = {
    'data-contract': 'DataContractScene.vue',
    'training-eda': 'TrainingEdaScene.vue',
    'leakage-boundary': 'LeakageBoundaryScene.vue',
    'baseline-contributions': 'BaselineContributionsScene.vue',
    'ridge-selection': 'RidgeSelectionScene.vue',
    'final-review': 'FinalReviewScene.vue',
  }
  for (const [scene, component] of Object.entries(expected)) {
    assert.match(shell, new RegExp(`'${scene}'[\\s\\S]*${component.replace('.', '\\.')}`))
  }
  assert.equal((shell.match(/defineAsyncComponent\(\(\) => import/g) ?? []).length, 6)
})

test('baseline row contributions reproduce each published prediction', () => {
  const asset = json('public/tabular-regression/interactions/linear-baseline.json')
  for (const sample of asset.samples) {
    const reconstructed = sample.intercept + Object.values(sample.contributions).reduce((sum, value) => sum + value, 0)
    assert.ok(Math.abs(reconstructed - sample.prediction) < 1e-10)
    assert.ok(Number.isFinite(sample.actual) && Number.isFinite(sample.prediction))
  }
})

test('validation scene is locked while final review contains the one test result', () => {
  const validation = json('public/tabular-regression/interactions/evaluation.json')
  const finalReview = json('public/tabular-regression/interactions/review-next-iteration.json')
  assert.equal(validation.testLocked, true)
  assert.equal('testMetrics' in validation, false)
  assert.deepEqual(finalReview.testMetrics, {
    rmse: 0.7245084534899455,
    mae: 0.5296847058600581,
    r2: 0.610047983086448,
  })
})

test('interaction controls remain bounded selects/buttons with text fallbacks', () => {
  for (const component of [
    'DataContractScene.vue', 'TrainingEdaScene.vue', 'LeakageBoundaryScene.vue',
    'BaselineContributionsScene.vue', 'RidgeSelectionScene.vue', 'FinalReviewScene.vue',
  ]) {
    const source = read(`src/components/housing-project-scenes/${component}`)
    assert.match(source, /<details>/)
    assert.match(source, /<svg/)
    assert.doesNotMatch(source, /v-html|Math\.random|setInterval|requestAnimationFrame/)
  }
})
