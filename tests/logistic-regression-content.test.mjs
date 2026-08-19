import test from 'node:test'
import assert from 'node:assert/strict'

const courseUrl = new URL('../src/modules/logistic-regression/data/course.ts', import.meta.url)
const chapterIds = [
  'linear-score', 'sigmoid-probability', 'threshold-decisions', 'log-loss', 'regularization', 'linear-limits',
]
const requiredKinds = ['question', 'explanation', 'formula', 'code', 'runtime-output', 'observation-lab', 'conclusion']

async function course() {
  return import(courseUrl.href)
}

function localized(value, label) {
  assert.ok(value && typeof value === 'object', `${label} must be localized`)
  assert.match(value['zh-CN'], /[\u3400-\u9fff]/, `${label} Chinese copy`)
  assert.match(value.en, /[A-Za-z]/, `${label} English copy`)
}

test('Phase 29 registers six complete bilingual logistic chapters in the preserved order', async () => {
  const { logisticCourseChapters } = await course()
  assert.deepEqual(logisticCourseChapters.map((chapter) => chapter.id), chapterIds)
  for (const chapter of logisticCourseChapters) {
    localized(chapter.title, `${chapter.id} title`)
    assert.deepEqual(requiredKinds, requiredKinds.filter((kind) => chapter.blocks.some((block) => block.kind === kind)), `${chapter.id} teaching flow`)
    for (const block of chapter.blocks) {
      if (block.title) localized(block.title, `${chapter.id}/${block.kind} title`)
      if (block.body) localized(block.body, `${chapter.id}/${block.kind} body`)
    }
  }
})

test('Phase 29 learner copy keeps references and downloads in the final chapter only', async () => {
  const { logisticCourseChapters, logisticCourseReferences, logisticCourseDownloads } = await course()
  const finalChapter = logisticCourseChapters.at(-1)
  assert.equal(finalChapter?.id, 'linear-limits')
  assert.ok(logisticCourseReferences.length > 0)
  assert.ok(logisticCourseDownloads.length > 0)
  for (const chapter of logisticCourseChapters.slice(0, -1)) {
    const visible = JSON.stringify(chapter)
    assert.doesNotMatch(visible, /https?:\/\/|Ref ID|Evidence|证据/)
    assert.doesNotMatch(visible, /\bprecision\b|\brecall\b|\bF1\b|\bROC\b|\bAUC\b|confusion matrix/i)
  }
})

test('Phase 29 content marks capacity diagnostics synthetic and avoids reserved test disclosure', async () => {
  const { logisticCourseChapters } = await course()
  const visible = JSON.stringify(logisticCourseChapters)
  assert.match(visible, /synthetic/i)
  assert.match(visible, /XOR/)
  assert.match(visible, /circle/i)
  assert.doesNotMatch(visible, /test (label|metric|outcome)|测试集(标签|指标|结果)/i)
  assert.doesNotMatch(visible, /genuine|forged|真币|假币/i)
})
