import '../scripts/register-ts-resolver.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { textbookReadings } from '../src/curriculum/reading.ts'
const { modelSelectionModule } = await import('../src/data/modelSelectionModule.ts')
const { treeForestModule } = await import('../src/data/treeForestModule.ts')

test('unit six reads the three existing six-chapter modules in order', () => {
  const readings = textbookReadings.filter(lesson => lesson.unitId === 'unit-6')
  assert.equal(readings.length, 18)
  assert.deepEqual(readings.map(lesson => lesson.moduleId), [
    ...Array(6).fill('tree-forest'), ...Array(6).fill('model-selection'), ...Array(6).fill('classification-project'),
  ])
})

test('split-variation examples keep the final test outside model comparison', () => {
  const first = modelSelectionModule.chapters.find(chapter => chapter.id === 'one-split-risk')!
  for (const locale of ['zh-CN', 'en'] as const) {
    const code = first.markdown[locale].match(/~~~python\n([\s\S]*?)~~~/)![1]!
    const loop = code.slice(code.indexOf('for seed'))
    assert.match(code, /X_dev, X_test, y_dev, y_test = train_test_split/)
    assert.match(loop, /X_dev, y_dev/)
    assert.match(loop, /make_pipeline\(StandardScaler\(\), Ridge/)
    assert.match(loop, /mean_absolute_error\(y_valid, pred\)/)
    assert.doesNotMatch(loop, /\b[XYxy]_test\b/)
    const final = modelSelectionModule.chapters.find(chapter => chapter.id === 'final-refit')!.markdown[locale]
    assert.match(final, /best_model\.predict\(X_test\)/)
  }
})

test('tree and forest comparison snippets predict on validation', () => {
  for (const chapter of treeForestModule.chapters) {
    for (const markdown of Object.values(chapter.markdown)) {
      for (const [, code] of markdown.matchAll(/~~~python\n([\s\S]*?)~~~/g)) {
        assert.doesNotMatch(code!, /\b[XYxy]_test\b/)
      }
    }
  }
  for (const id of ['rectangular-splits', 'random-forest']) {
    const chapter = treeForestModule.chapters.find(chapter => chapter.id === id)!
    for (const markdown of Object.values(chapter.markdown)) assert.match(markdown, /\.predict\(X_valid\)/)
  }
})
