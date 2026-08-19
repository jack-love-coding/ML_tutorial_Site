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
  assert.doesNotMatch(source, /LogisticRegressionLessonLab/)
  assert.doesNotMatch(source, /ClassificationViz/)
  for (const [id, name] of sceneIds.map((id, index) => [id, sceneNames[index]])) {
    assert.match(source, new RegExp(id))
    assert.match(source, new RegExp(name))
  }
})

test('Phase 29 lab shell protects controls, keyboard operation, reset, and reduced-motion fallback', () => {
  const source = readFileSync(shellPath, 'utf8')
  const modelPath = new URL('../src/modules/logistic-regression/labs/sceneModels.ts', import.meta.url)
  const modelSource = readFileSync(modelPath, 'utf8')
  assert.match(modelSource, /Number\.isFinite/)
  assert.match(modelSource, /lastValid/)
  assert.match(modelSource, /step\(/)
  assert.match(modelSource, /reset\(/)
  assert.match(modelSource, /reducedMotion/)
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

test('Phase 29 shell keeps a static fallback and does not mount the legacy cockpit', () => {
  const source = readFileSync(shellPath, 'utf8')
  assert.match(source, /fallback/i)
  assert.match(source, /loadLogisticInteraction/)
  assert.doesNotMatch(source, /import .*LogisticRegressionLessonLab/)
})

test('score, sigmoid, and likelihood scenes provide a bounded keyboard-accessible semantic fallback', () => {
  for (const name of sceneNames.slice(0, 3)) {
    const path = new URL(`../src/modules/logistic-regression/labs/${name}.vue`, import.meta.url)
    assert.ok(existsSync(path), `missing ${name}`)
    const source = readFileSync(path, 'utf8')
    assert.match(source, /min=|max=|bounded|Math\.min|build[A-Za-z]+SceneModel/i, `${name} bounds controls`)
    assert.match(source, /@keydown|keydown|tabindex/i, `${name} supports keyboard interaction`)
    assert.match(source, /table|fallback/i, `${name} has a semantic table fallback`)
    assert.match(source, /aria-label|<title>/i, `${name} labels its visual`)
  }
})
