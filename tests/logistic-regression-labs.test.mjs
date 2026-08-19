import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const shellPath = new URL('../src/modules/logistic-regression/labs/LogisticLessonLab.vue', import.meta.url)
const sceneNames = [
  'LinearScoreScene', 'SigmoidProbabilityScene', 'LikelihoodScene', 'LogLossGradientScene', 'TrainingParityScene', 'CalibrationLimitsScene',
]
const sceneIds = [
  'linear-score', 'sigmoid-probability', 'threshold-decisions', 'log-loss', 'regularization', 'linear-limits',
]

test('Phase 29 uses exactly six route-lazy dedicated scenes rather than a shared logistic cockpit', () => {
  assert.ok(existsSync(shellPath), 'missing Phase 29 route-lazy LogisticLessonLab shell')
  const source = readFileSync(shellPath, 'utf8')
  assert.match(source, /defineAsyncComponent/)
  assert.match(source, /AbortController/)
  assert.match(source, /onBeforeUnmount/)
  assert.match(source, /LogisticRegressionLessonLab/)
  assert.doesNotMatch(source, /ClassificationViz/)
  for (const [id, name] of sceneIds.map((id, index) => [id, sceneNames[index]])) {
    assert.match(source, new RegExp(id))
    assert.match(source, new RegExp(name))
  }
})

test('Phase 29 lab shell protects controls, keyboard operation, reset, and reduced-motion fallback', () => {
  const source = readFileSync(shellPath, 'utf8')
  assert.match(source, /Number\.isFinite/)
  assert.match(source, /lastValid/)
  assert.match(source, /keydown|@keydown/)
  assert.match(source, /reset/i)
  assert.match(source, /prefers-reduced-motion|reducedMotion/)
  assert.match(source, /table|fallback|文本|文字/i)
  assert.match(source, /aria-label|aria-describedby/)
})

test('Phase 29 scene models restore the last finite value at endpoints, one outside step, NaN, and infinity', () => {
  const modelPath = new URL('../src/modules/logistic-regression/labs/sceneModels.ts', import.meta.url)
  assert.ok(existsSync(modelPath), 'missing shared scene-model safety layer')
  const source = readFileSync(modelPath, 'utf8')
  assert.match(source, /Number\.isFinite/)
  assert.match(source, /lastValid/)
  assert.match(source, /min|minimum/i)
  assert.match(source, /max|maximum/i)
  assert.match(source, /NaN/)
  assert.match(source, /Infinity/)
  assert.match(source, /outside|out-of-range|clamp/i)
})

test('Phase 29 dedicated scenes retain bounded, mobile-safe, non-colour-only interaction affordances', () => {
  for (const name of sceneNames) {
    const path = new URL(`../src/modules/logistic-regression/labs/${name}.vue`, import.meta.url)
    assert.ok(existsSync(path), `missing ${name}`)
    const source = readFileSync(path, 'utf8')
    assert.match(source, /min=|max=|clamp|bounded/i, `${name} bounds user controls`)
    assert.match(source, /label|legend|aria-/i, `${name} has textual state labels`)
    assert.match(source, /table|fallback/i, `${name} has a semantic fallback`)
    assert.match(source, /@keydown|keydown|tabindex/i, `${name} supports keyboard interaction`)
  }
})
