import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('Part B browser release matrix covers every unit, locale, viewport, progress, and planned redirect', () => {
  const matrix = read('scripts/qa/aiFoundationStageBBrowserMatrix.js')
  const runner = read('scripts/qa/run-ai-foundation-stage-b-browser-matrix.mjs')
  const packageSource = read('package.json')
  for (const unitId of [
    '07-ml-experiment-design', '08-linear-regression-optimization', '09-logistic-regression-thresholds',
    '10-classic-classifiers', '11-decision-trees', '12-bagging-random-forests',
    '13-gradient-boosting', '14-tabular-pipeline',
  ]) assert.match(matrix, new RegExp(unitId))
  assert.match(matrix, /const locales = \['zh-CN', 'en'\]/)
  assert.match(matrix, /const widths = \[1440, 768, 390\]/)
  assert.match(matrix, /overview\.links !== 14/)
  assert.match(matrix, /page\.keyboard\.press\('Space'\)/)
  assert.match(matrix, /15-mlp-backpropagation/)
  assert.match(matrix, /katexErrors === 0/)
  assert.match(runner, /runBoundedProcess/)
  assert.match(runner, /stopProcess/)
  assert.match(packageSource, /"test:course-b:browser"/)
})
