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
})

test('Phase 29 release scope keeps Phase 30 metrics and evaluation disclosure out of learner contracts', () => {
  const component = readFileSync(new URL('../src/components/LogisticRegressionPagedLesson.vue', import.meta.url), 'utf8')
  assert.doesNotMatch(component, /precision|recall|F1|ROC|AUC|confusion matrix/i)
  assert.doesNotMatch(component, /test labels|test metrics|测试集(标签|指标)/i)
  assert.match(component, /Phase 30|下一阶段|next.*phase/i)
})
