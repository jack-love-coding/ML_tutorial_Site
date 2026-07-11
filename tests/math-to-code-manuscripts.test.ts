import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const manuscriptUrl = new URL(
  '../docs/curriculum/v3/math-to-code/01-functions-mappings.zh-CN.md',
  import.meta.url,
)

const REQUIRED_SECTION_IDS = [
  'opening-question',
  'prerequisite-recap',
  'shared-prediction-task',
  'mapping-intuition',
  'formal-definition',
  'worked-prediction',
  'worked-motion-example',
  'python-translation',
  'controlled-experiment',
  'misconceptions',
  'layered-practice',
  'lesson-handoff',
] as const

test('Chinese functions-and-mappings manuscript satisfies the gold-lesson contract', () => {
  const manuscript = readFileSync(manuscriptUrl, 'utf8')

  const sectionOffsets = REQUIRED_SECTION_IDS.map((id) => {
    const matches = [...manuscript.matchAll(new RegExp(`\\{#${id}\\}`, 'g'))]
    assert.equal(matches.length, 1, `expected exactly one section ID: ${id}`)
    return matches[0]!.index
  })
  assert.deepEqual(sectionOffsets, [...sectionOffsets].sort((left, right) => left - right))

  assert.doesNotMatch(
    manuscript,
    /\b(?:TODO|TBD|FIXME|XXX)\b|(?:^|\s)(?:待补|待写|占位文本|内容未完成)(?:\s|$)|lorem ipsum/i,
  )
  assert.match(manuscript, /y_hat = w\^T x \+ b/)
  assert.match(manuscript, /(?:预测(?:值|结果)?|y_hat|\\hat\{y\})[^\n]{0,80}(?:=|为|得到)\s*10\b/)
  assert.match(manuscript, /features[^\n]{0,50}\[2,\s*3\]/)
  assert.match(manuscript, /weights[^\n]{0,50}\[4,\s*-1\]/)
  assert.match(manuscript, /bias[^\n]{0,30}5\b/)
  assert.match(manuscript, /target[^\n]{0,30}9\b/)

  assert.ok((manuscript.match(/^### 误区[一二三四五六七八九十\d：:]/gm) ?? []).length >= 2)
  assert.match(manuscript, /^### 第一层[：:].*概念/m)
  assert.match(manuscript, /^### 第二层[：:].*(?:手算|读码)/m)
  assert.match(manuscript, /^### 第三层[：:].*开放观察/m)
  assert.match(manuscript, /提示[：:]/)
  assert.match(manuscript, /参考推理[：:]/)
  assert.match(manuscript, /下一课[^\n]{0,80}向量|向量课/)
})
