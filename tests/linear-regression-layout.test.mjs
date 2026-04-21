import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const componentPath = new URL('../src/components/LinearRegressionLessonLab.vue', import.meta.url)

test('linear regression module is inserted into the guided course flow', () => {
  const moduleCatalogSource = readFileSync(
    new URL('../src/data/moduleCatalog.ts', import.meta.url),
    'utf8',
  )

  assert.match(moduleCatalogSource, /linearRegressionModule/)

  const lossIndex = moduleCatalogSource.indexOf('lossFunctionsModule')
  const gradientIndex = moduleCatalogSource.indexOf('gradientDescentModule')
  const linearIndex = moduleCatalogSource.indexOf('linearRegressionModule')
  const legacyIndex = moduleCatalogSource.indexOf('...legacyModuleOrder.filter')

  assert.notEqual(lossIndex, -1)
  assert.notEqual(gradientIndex, -1)
  assert.notEqual(linearIndex, -1)
  assert.notEqual(legacyIndex, -1)
  assert.ok(lossIndex < gradientIndex, 'loss functions should stay first')
  assert.ok(gradientIndex < linearIndex, 'linear regression should follow gradient descent')
  assert.ok(linearIndex < legacyIndex, 'linear regression should come before the legacy modules')
})

test('algorithm view has a dedicated linear regression lesson branch', () => {
  const algorithmViewSource = readFileSync(
    new URL('../src/views/AlgorithmView.vue', import.meta.url),
    'utf8',
  )

  assert.match(algorithmViewSource, /LinearRegressionLessonLab/)
  assert.match(algorithmViewSource, /LinearRegressionResults/)
  assert.match(algorithmViewSource, /slug\.value === 'linear-regression'/)
})

test('linear regression lesson lab uses a unified experiment card layout', () => {
  assert.ok(existsSync(componentPath), 'linear regression lesson lab component should exist')

  const componentSource = readFileSync(componentPath, 'utf8')
  const styleSource = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

  assert.match(componentSource, /class="linear-regression-lab"/)
  assert.match(componentSource, /class="linear-regression-lab__workspace"/)
  assert.match(componentSource, /class="linear-regression-lab__viz"/)
  assert.match(componentSource, /class="linear-regression-lab__controls"/)
  assert.match(componentSource, /class="linear-regression-lab__readout"/)
  assert.match(styleSource, /\.linear-regression-lab__workspace\s*\{/)
})
