import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

const scenes = {
  'fit-line': 'FitLineScene.vue',
  multivariate: 'MultivariateScene.vue',
  'residual-loss': 'ResidualLossScene.vue',
  'training-motion': 'TrainingMotionScene.vue',
  polynomial: 'PolynomialScene.vue',
  'model-limits': 'ModelLimitsScene.vue',
  overfitting: 'OverfittingScene.vue',
  regularization: 'RegularizationScene.vue',
}

test('observation shell lazily maps every chapter to a dedicated scene', () => {
  const shell = read('src/components/LinearRegressionObservationLab.vue')
  assert.match(shell, /sceneId: LinearRegressionObservationSceneId/)
  assert.match(shell, /controls: LinearRegressionObservationControl\[\]/)
  assert.match(shell, /loadLinearRegressionInteractionAsset/)
  assert.doesNotMatch(shell, /resultLines|chapterDefaults|controlLabels/)
  for (const [sceneId, filename] of Object.entries(scenes)) {
    assert.match(shell, new RegExp(`${sceneId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]?: defineAsyncComponent`))
    assert.match(shell, new RegExp(filename.replace('.', '\\.')))
  }
})

test('all eight scenes expose SVG, controls, text fallback, and accessible descriptions', () => {
  for (const filename of Object.values(scenes)) {
    const path = `src/components/linear-regression/${filename}`
    assert.equal(existsSync(new URL(path, root)), true, path)
    const source = read(path)
    assert.match(source, /linear-interaction-scene/)
    assert.match(source, /linear-interaction-scene__controls/)
    assert.match(source, /<svg/)
    assert.match(source, /role="img"/)
    assert.match(source, /aria-label|aria-labelledby/)
    assert.match(source, /<details/)
    assert.match(source, /<table/)
    assert.doesNotMatch(source, /v-html|<iframe|证据/)
  }
})

test('outlier scene is draggable, keyboard operable, bounded, and clearly labeled as teaching data', () => {
  const source = read('src/components/linear-regression/ResidualLossScene.vue')
  assert.match(source, /fitUnivariateFromStatistics/)
  assert.match(source, /pointerdown|@pointerdown/)
  assert.match(source, /pointermove|@pointermove/)
  assert.match(source, /keydown|@keydown/)
  assert.match(source, /role="slider"/)
  assert.match(source, /教学新增样本/)
  assert.match(source, /clampFinite/)
})

test('training and regularization motion is user controlled and cleaned up', () => {
  for (const filename of ['TrainingMotionScene.vue', 'RegularizationScene.vue']) {
    const source = read(`src/components/linear-regression/${filename}`)
    assert.match(source, /onBeforeUnmount/)
    assert.match(source, /clearInterval|cancelAnimationFrame/)
    assert.match(source, /prefers-reduced-motion/)
    assert.match(source, /aria-pressed/)
    assert.match(source, /step|单步/i)
  }
})

test('responsive styles preserve three-control desktop and one-column mobile layouts', () => {
  const css = read('src/styles/modules/linear-regression.css')
  assert.match(css, /\.linear-interaction-scene__controls\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s)
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.linear-interaction-scene__controls,[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.linear-interaction-scene/)
  assert.match(css, /touch-action:\s*none/)
})
