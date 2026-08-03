import test from 'node:test'
import assert from 'node:assert/strict'
import { housingProjectLessons } from '../src/data/housingProjectLesson.ts'
import { housingProjectChapterIds } from '../src/types/housingProjectLesson.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

const requiredKinds = new Set(['explanation', 'formula', 'code', 'runtime-output', 'observation-lab'])

test('six preserved chapters provide a complete bilingual teaching flow', () => {
  assert.deepEqual(Object.keys(housingProjectLessons), [...housingProjectChapterIds])
  for (const chapterId of housingProjectChapterIds) {
    const lesson = housingProjectLessons[chapterId]
    const kinds = new Set(lesson.blocks.map((block) => block.kind))
    for (const kind of requiredKinds) assert.ok(kinds.has(kind), `${chapterId} missing ${kind}`)
    assert.ok(kinds.has('figure') || kinds.has('table'), `${chapterId} missing a figure or data table`)
    const explanationBlocks = lesson.blocks.filter((block) => block.kind === 'explanation')
    assert.ok(explanationBlocks.some((block) => block.tone === 'question'))
    assert.ok(explanationBlocks.some((block) => block.tone === 'misconception' || block.tone === 'leakage'))
    assert.ok(explanationBlocks.some((block) => block.tone === 'conclusion'))
    assert.equal(lesson.blocks.filter((block) => block.kind === 'observation-lab').length, 1)
    for (const block of lesson.blocks) {
      assert.ok(block.title['zh-CN'].trim())
      assert.ok(block.title.en.trim())
      for (const value of Object.values(block)) {
        if (value && typeof value === 'object' && 'zh-CN' in value && 'en' in value) {
          assert.ok(String(value['zh-CN']).trim())
          assert.ok(String(value.en).trim())
        }
      }
    }
  }
})

test('all formulas render through the safe Markdown and KaTeX pipeline', () => {
  for (const lesson of Object.values(housingProjectLessons)) {
    for (const block of lesson.blocks) {
      if (block.kind !== 'formula') continue
      const html = renderMarkdownWithMath(block.formula)
      assert.match(html, /class="katex"/)
      assert.doesNotMatch(html, /katex-error|\$\$|haty/)
    }
  }
})

test('learner copy has no inline reference markers or audit jargon', () => {
  const source = JSON.stringify(housingProjectLessons)
  assert.doesNotMatch(source, /Ref ID|REF-[A-Z]|观察证据|Evidence|evidence/)
  assert.doesNotMatch(source, /```|\\\(|\\\[/)
  assert.doesNotMatch(source, /\$[0-9]/, 'currency amounts must not be parsed as inline TeX')
})

test('test results and references unlock only in the final review chapter', () => {
  for (const chapterId of housingProjectChapterIds.slice(0, -1)) {
    const serialized = JSON.stringify(housingProjectLessons[chapterId])
    assert.doesNotMatch(serialized, /0\.724508|0\.529685|0\.610048|final-test-residuals/)
    assert.equal(housingProjectLessons[chapterId].references, undefined)
    assert.equal(housingProjectLessons[chapterId].downloads, undefined)
  }
  const finalLesson = housingProjectLessons['review-next-iteration']
  assert.ok(finalLesson.references && finalLesson.references.length >= 4)
  assert.ok(finalLesson.downloads && finalLesson.downloads.length >= 8)
})
