import assert from 'node:assert/strict'
import test from 'node:test'
import { optimizerCourseChapters, optimizerCourseDownloads, optimizerCourseReferences } from '../src/modules/optimizer-comparison/data/course.ts'

const ids = ['training-loop', 'sgd-batch-noise', 'momentum-rmsprop', 'adam-weight-decay', 'learning-rate-schedules', 'curve-diagnosis']
const sequence = ['question', 'intuition', 'math-state', 'numpy-code', 'real-output', 'prediction', 'animation', 'interaction', 'observation', 'misconception', 'conclusion']

test('optimizer course preserves six legacy IDs with complete bilingual teaching flow', () => {
  assert.deepEqual(optimizerCourseChapters.map((chapter) => chapter.id), ids)
  for (const chapter of optimizerCourseChapters) {
    assert.deepEqual(chapter.blocks.map((item) => item.kind), sequence)
    assert.ok(chapter.title['zh-CN'].trim())
    assert.ok(chapter.title.en.trim())
    for (const item of chapter.blocks) {
      assert.ok(item.body['zh-CN'].trim(), `${chapter.id}/${item.kind} needs Chinese copy`)
      assert.ok(item.body.en.trim(), `${chapter.id}/${item.kind} needs English copy`)
    }
  }
})

test('only the final optimizer chapter exposes references and reproducible downloads', () => {
  assert.equal(optimizerCourseChapters.at(-1)?.id, 'curve-diagnosis')
  assert.ok(optimizerCourseReferences.length >= 2)
  assert.ok(optimizerCourseDownloads.length >= 3)
  assert.ok(optimizerCourseDownloads.every((item) => item.path.startsWith('/')))
})

test('learner-facing optimizer copy avoids internal evidence and Ref-ID terminology', () => {
  const visibleCopy = JSON.stringify(optimizerCourseChapters)
  assert.doesNotMatch(visibleCopy, /Ref ID|REF-|证据|Evidence/i)
})
