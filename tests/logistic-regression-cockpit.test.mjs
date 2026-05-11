import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const componentPath = new URL('../src/components/LogisticRegressionLessonLab.vue', import.meta.url)

test('logistic regression has a dedicated cockpit lesson lab', () => {
  assert.ok(existsSync(componentPath), 'logistic regression lesson lab component should exist')

  const algorithmViewSource = readFileSync(
    new URL('../src/views/AlgorithmView.vue', import.meta.url),
    'utf8',
  )
  const componentSource = readFileSync(componentPath, 'utf8')
  const styleSource = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

  assert.match(algorithmViewSource, /LogisticRegressionLessonLab/)
  assert.match(algorithmViewSource, /slug\.value === 'logistic-regression'/)
  assert.match(algorithmViewSource, /algorithm-view--logistic/)

  assert.match(componentSource, /class="logistic-regression-lab"/)
  assert.match(componentSource, /variant="cockpit"/)
  assert.match(componentSource, /ClassificationViz/)
  assert.match(componentSource, /#visual/)
  assert.match(componentSource, /#controls/)
  assert.match(componentSource, /#metrics/)
  assert.match(componentSource, /logistic-regression-lab__control-grid/)
  assert.match(componentSource, /logistic-regression-lab__readout/)
  assert.match(componentSource, /logistic-regression-lab__details logistic-regression-lab__details--teaching/)
  assert.match(componentSource, /logistic-regression-lab__details logistic-regression-lab__details--presets/)
  assert.match(styleSource, /\.logistic-regression-lab__visual\s*\{/)
  assert.match(styleSource, /\.logistic-regression-lab__control-grid\s*\{/)
  assert.match(styleSource, /\.lesson-workbench--cockpit/)
})

test('logistic regression cockpit keeps long teaching content collapsed by default', () => {
  const componentSource = readFileSync(componentPath, 'utf8')

  const metricsIndex = componentSource.indexOf('<template #metrics>')
  const teachingDetailsIndex = componentSource.indexOf('logistic-regression-lab__details--teaching')
  const presetsIndex = componentSource.indexOf('<template #presets>')
  const presetDetailsIndex = componentSource.indexOf('logistic-regression-lab__details--presets')

  assert.notEqual(metricsIndex, -1)
  assert.notEqual(teachingDetailsIndex, -1)
  assert.notEqual(presetsIndex, -1)
  assert.notEqual(presetDetailsIndex, -1)
  assert.ok(metricsIndex < teachingDetailsIndex, 'formula details should be behind the metrics strip')
  assert.ok(presetsIndex < presetDetailsIndex, 'preset list should be behind a lower detail section')
  assert.doesNotMatch(componentSource, /<details[^>]*open/)
})

test('logistic regression chapter changes preserve an active experiment', () => {
  const algorithmViewSource = readFileSync(
    new URL('../src/views/AlgorithmView.vue', import.meta.url),
    'utf8',
  )

  const onChapterChangeStart = algorithmViewSource.indexOf('function onChapterChange')
  const patchConfigStart = algorithmViewSource.indexOf('function patchConfig')
  assert.notEqual(onChapterChangeStart, -1)
  assert.notEqual(patchConfigStart, -1)

  const onChapterChangeBody = algorithmViewSource.slice(onChapterChangeStart, patchConfigStart)
  assert.match(onChapterChangeBody, /isLogisticRegressionPage\.value/)
  assert.match(onChapterChangeBody, /currentStep > 0|isPlaying/)
  assert.match(onChapterChangeBody, /return/)
  assert.match(onChapterChangeBody, /applyPreset/)
})
