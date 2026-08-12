import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const scenes = [
  ['TrainingLedgerScene', 'training-loop'],
  ['BatchNoiseScene', 'sgd-batch-noise'],
  ['MomentumRmspropScene', 'momentum-rmsprop'],
  ['AdamDecayScene', 'adam-weight-decay'],
  ['ScheduleCadenceScene', 'learning-rate-schedules'],
  ['CurveDiagnosisScene', 'curve-diagnosis'],
]

test('optimizer course owns six lazy, chapter-specific scene entry points', () => {
  const shell = read('src/modules/optimizer-comparison/OptimizerPagedLesson.vue')
  for (const [name, id] of scenes) {
    assert.match(shell, new RegExp(`defineAsyncComponent\\(\\(\\) => import\\('./labs/${name}\\.vue'\\)\\)`))
    assert.match(read(`src/modules/optimizer-comparison/labs/${name}.vue`), new RegExp(`scene="${id}"`))
  }
  assert.match(shell, /AlgorithmCheckpointQuiz v-if="chapter\.id === 'curve-diagnosis'"/)
  assert.match(shell, /withPublicBase\(item\.path\)/)
})

test('interaction shell has keyboard, finite engine, reduced-motion, and textual fallback contracts', () => {
  const source = read('src/modules/optimizer-comparison/labs/OptimizerInteractionScene.vue')
  for (const token of ['stepOptimizer', 'learningRateForStep', 'Number.isFinite', "prefers-reduced-motion: reduce", "event.key === 'ArrowRight'", "event.key.toLowerCase() === 'r'", 'copy.fallback', 'play', 'pause', 'reset']) assert.match(source, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(source, /Train\/validation\/test is 960\/206\/206/)
  assert.match(source, /do not name a universal winner/)
})

test('optimizer CSS prevents the main lesson and scene grids from overflowing at mobile widths', () => {
  const css = read('src/styles/modules/optimizer-comparison.css')
  assert.match(css, /min-width: 0/)
  assert.match(css, /@media \(max-width:520px\)/)
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/)
})
