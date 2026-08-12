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

test('optimizer course owns six lazy, chapter-specific scene entry points with semantic fallbacks', () => {
  const shell = read('src/modules/optimizer-comparison/OptimizerPagedLesson.vue')
  for (const [name, id] of scenes) {
    assert.match(shell, new RegExp(`defineAsyncComponent\\(\\(\\) => import\\('./labs/${name}\\.vue'\\)\\)`))
    const scene = read(`src/modules/optimizer-comparison/labs/${name}.vue`)
    assert.match(scene, /<table|<ol/, `${id} must retain a semantic table or ordered-log fallback`)
    assert.doesNotMatch(scene, /OptimizerInteractionScene/, `${id} must not delegate to a generic scene`)
  }
  assert.match(shell, /AlgorithmCheckpointQuiz v-if="chapter\.id === 'curve-diagnosis'"/)
  assert.match(shell, /withPublicBase\(item\.path\)/)
})

test('scene keyboard handlers are container-only and the final scene loads both published asset boundaries', () => {
  for (const [name] of scenes) {
    const source = read(`src/modules/optimizer-comparison/labs/${name}.vue`)
    assert.match(source, /@keydown\.self/, `${name} must not hijack descendant form controls`)
  }
  const curve = read('src/modules/optimizer-comparison/labs/CurveDiagnosisScene.vue')
  assert.match(curve, /optimizer-comparison-trajectories\.json/)
  assert.match(curve, /banknote-transfer\.json/)
  assert.match(curve, /no metric is substituted/)
})

test('optimizer CSS prevents the main lesson and scene grids from overflowing at mobile widths', () => {
  const css = read('src/styles/modules/optimizer-comparison.css')
  assert.match(css, /min-width: 0/)
  assert.match(css, /@media \(max-width:520px\)/)
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/)
})
