import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const matrixPath = new URL('../scripts/qa/logisticRegressionBrowserMatrix.js', import.meta.url)
const chapterIds = ['linear-score', 'sigmoid-probability', 'threshold-decisions', 'log-loss', 'regularization', 'linear-limits']
const keyIds = ['linear-score', 'threshold-decisions', 'log-loss', 'linear-limits']
const browserCases = [
  ...chapterIds.map((chapterId) => ({ chapterId, locale: 'zh-CN', width: 1200 })),
  ...keyIds.flatMap((chapterId) => ['zh-CN', 'en'].flatMap((locale) => [1440, 768, 390].map((width) => ({ chapterId, locale, width })))),
]

test('Phase 29 release matrix locks exactly thirty locale, route, and viewport records', () => {
  assert.equal(browserCases.length, 30)
  assert.equal(new Set(browserCases.map((entry) => `${entry.chapterId}/${entry.locale}/${entry.width}`)).size, 30)
  assert.ok(existsSync(matrixPath), 'missing deterministic Phase 29 browser matrix')
  const source = readFileSync(matrixPath, 'utf8')
  for (const entry of browserCases) {
    assert.match(source, new RegExp(entry.chapterId))
    assert.match(source, new RegExp(entry.locale.replace('-', '\\-')))
    assert.match(source, new RegExp(String(entry.width)))
  }
  assert.match(source, /cases/)
  assert.match(source, /failures/)
  assert.match(source, /results/)
  assert.match(source, /interactions/)
  assert.match(source, /failureInjections/)
  assert.match(source, /expectedCaseKeys/)
  assert.match(source, /exactCases/)
  assert.match(source, /new Set\(resultKeys\)/)
})

test('Phase 29 release matrix requires all scene interactions and complete failure fallbacks', () => {
  const source = readFileSync(matrixPath, 'utf8')
  for (const id of chapterIds) assert.match(source, new RegExp(id))
  for (const requirement of ['keyboard', 'reset', 'copy', 'reduced', 'asset', 'corruption', 'MP4', 'transcript', 'poster', 'overflow']) {
    assert.match(source, new RegExp(requirement, 'i'))
  }
  assert.match(source, /same-origin|origin/i)
  assert.match(source, /lazy|current chapter/i)
  assert.match(source, /reserved test|test records|test labels/i)
  assert.match(source, /exactInteractions/)
  assert.match(source, /exactFailures/)
  assert.match(source, /asset-http-failure/)
  assert.match(source, /asset-corruption/)
  assert.match(source, /mp4-failure/)
  assert.match(source, /copy-failure/)
})

test('Phase 29 runs the real Pages browser matrix as an executable CI gate', () => {
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  const workflow = readFileSync(new URL('../.github/workflows/deploy-pages.yml', import.meta.url), 'utf8')
  const runner = readFileSync(new URL('../scripts/qa/run-logistic-regression-browser-matrix.mjs', import.meta.url), 'utf8')
  assert.match(packageJson.scripts['test:phase29:browser'], /build:pages.*run-logistic-regression-browser-matrix/)
  assert.match(workflow, /Phase 29 browser release matrix/)
  assert.match(runner, /--strictPort/)
  assert.match(runner, /run-code.*logisticRegressionBrowserMatrix/)
  assert.equal(packageJson.devDependencies['@playwright/cli'], '0.1.18', 'the mandatory browser CLI is an exact audited dependency')
  assert.match(runner, /npm.*exec.*--no.*playwright-cli/)
  assert.doesNotMatch(runner, /--package', '@playwright\/cli'/)
  assert.match(runner, /BROWSER_COMMAND_TIMEOUT_MS/)
  assert.match(runner, /terminateProcess/)
  assert.match(runner, /runCli\(\['close'\]\)/)
})

test('Phase 29 release scope keeps Phase 30 metrics and evaluation disclosure out of learner contracts', () => {
  const component = readFileSync(new URL('../src/components/LogisticRegressionPagedLesson.vue', import.meta.url), 'utf8')
  assert.doesNotMatch(component, /precision|recall|F1|ROC|AUC|confusion matrix/i)
  assert.doesNotMatch(component, /test labels|test metrics|测试集(标签|指标)/i)
  assert.match(component, /Phase 30|下一阶段|next.*phase/i)
})
