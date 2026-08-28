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

test('gradient, parity, and calibration scenes preserve replay and synthetic-data boundaries', () => {
  for (const name of sceneNames.slice(3)) {
    const path = new URL(`../src/modules/logistic-regression/labs/${name}.vue`, import.meta.url)
    assert.ok(existsSync(path), `missing ${name}`)
    const source = readFileSync(path, 'utf8')
    assert.match(source, /build[A-Za-z]+SceneModel|published|replay/i, `${name} uses a pure model or frozen replay`)
    assert.match(source, /@keydown|keydown|tabindex/i, `${name} supports keyboard interaction`)
    assert.match(source, /table|fallback/i, `${name} has a semantic table fallback`)
    if (name !== 'LogLossGradientScene') assert.match(source, /reducedMotion|reduced motion|合成|synthetic/i, `${name} provides motion or provenance text`)
  }
  const finalSource = readFileSync(new URL('../src/modules/logistic-regression/labs/CalibrationLimitsScene.vue', import.meta.url), 'utf8')
  assert.match(finalSource, /synthetic.*never used|未用于 Banknote/i)
  assert.doesNotMatch(finalSource, /loadLogisticInteraction\(|fit\(|sklearn\.fit/i)
})

test('calibration synthetic fallbacks localize point labels, marker semantics, and legends for XOR and circles', async () => {
  const { buildCalibrationLimitsSceneModel } = await import(new URL('../src/modules/logistic-regression/labs/sceneModels.ts', import.meta.url).href)
  const limits = JSON.parse(readFileSync(new URL('../public/logistic-regression/phase-29/interactions/linear-limits.json', import.meta.url), 'utf8'))
  for (const view of ['xor', 'circles']) {
    const zh = buildCalibrationLimitsSceneModel(limits, 'original', 'original', view, 'zh-CN')
    const en = buildCalibrationLimitsSceneModel(limits, 'original', 'original', view, 'en')
    assert.match(zh.legend, /实心圆.*类别 1.*条纹圆.*类别 0/)
    assert.match(zh.points[0].label, /合成点 1，类别 [01]/)
    assert.ok(zh.table.some((row) => /实心标记|条纹标记/.test(row.value)), `${view} localizes marker rows`)
    assert.match(en.legend, /solid circle.*class 1.*striped circle.*class 0/)
    assert.match(en.points[0].label, /synthetic point 1, class [01]/)
    assert.ok(en.table.some((row) => /solid marker|striped marker/.test(row.value)), `${view} retains English marker rows`)
  }
  const component = readFileSync(new URL('../src/modules/logistic-regression/labs/CalibrationLimitsScene.vue', import.meta.url), 'utf8')
  assert.match(component, /view\.value,props\.locale/)
  assert.match(component, /\{\{ model\.legend \}\}/)
  assert.match(component, /\{\{ copy\.field \}\}.*\{\{ copy\.value \}\}/)
})

test('Phase 29 keeps complete data tables visible instead of exposing fake detail toggles', () => {
  for (const name of sceneNames) {
    const source = readFileSync(new URL(`../src/modules/logistic-regression/labs/${name}.vue`, import.meta.url), 'utf8')
    assert.match(source, /<table/, `${name} keeps its semantic fallback visible`)
    assert.doesNotMatch(source, /detailsOpen|aria-expanded=.*details|Show numeric detail|展开数值明细/, `${name} does not advertise a non-functional disclosure`)
  }
})

test('changing away from scratch playback clears its active interval before resetting the replay', () => {
  const source = readFileSync(new URL('../src/modules/logistic-regression/labs/TrainingParityScene.vue', import.meta.url), 'utf8')
  assert.match(source, /function stop\(\)\{if\(timer\)clearInterval\(timer\);timer=undefined\}/)
  assert.match(source, /function changeMode\(\)\{stop\(\);traceIndex\.value=0\}/)
  assert.match(source, /@change="changeMode"/)
})
