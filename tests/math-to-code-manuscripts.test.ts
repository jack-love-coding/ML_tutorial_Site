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

type RequiredSectionId = typeof REQUIRED_SECTION_IDS[number]

function readManuscript(): string {
  return readFileSync(manuscriptUrl, 'utf8')
}

function sliceSecondLevelSections(manuscript: string): Map<RequiredSectionId, string> {
  const headings = [...manuscript.matchAll(/^##\s+(.+?)\s+\{#([a-z0-9-]+)\}\s*$/gm)]
  const headingIds = headings.map((match) => match[2]!)

  assert.equal([...manuscript.matchAll(/^##\s+.+$/gm)].length, REQUIRED_SECTION_IDS.length)
  assert.deepEqual(headingIds, REQUIRED_SECTION_IDS)
  assert.equal(new Set(headingIds).size, REQUIRED_SECTION_IDS.length)

  return new Map(headings.map((heading, index) => [
    heading[2] as RequiredSectionId,
    manuscript.slice(heading.index, headings[index + 1]?.index ?? manuscript.length),
  ]))
}

test('all twelve IDs belong to unique second-level headings in contract order', () => {
  const manuscript = readManuscript()
  const sections = sliceSecondLevelSections(manuscript)

  assert.equal(sections.size, 12)
  for (const id of REQUIRED_SECTION_IDS) {
    assert.match(sections.get(id)!, new RegExp(`^##\\s+.+\\{#${id}\\}\\s*$`, 'm'))
    assert.equal([...manuscript.matchAll(new RegExp(`\\{#${id}\\}`, 'g'))].length, 1)
  }
})

test('shared prediction section keeps one concrete task, object, units, and formula together', () => {
  const sharedTask = sliceSecondLevelSections(readManuscript()).get('shared-prediction-task')!

  assert.match(sharedTask, /features\s*=\s*\[2,\s*3\]/)
  assert.match(sharedTask, /weights\s*=\s*\[4,\s*-1\]/)
  assert.match(sharedTask, /bias\s*=\s*5\b/)
  assert.match(sharedTask, /(?:关卡|任务)[^\n]{0,40}预计完成时长/)
  assert.match(sharedTask, /(?:prediction|预测)[^\n]{0,50}10\s*分钟/)
  assert.match(sharedTask, /(?:target|目标)[^\n]{0,50}9\s*分钟/)
  assert.match(sharedTask, /y_hat = w\^T x \+ b/)
})

test('worked motion example and controlled experiment preserve their numerical evidence', () => {
  const sections = sliceSecondLevelSections(readManuscript())
  const motion = sections.get('worked-motion-example')!
  const experiment = sections.get('controlled-experiment')!

  assert.match(motion, /s\(t\)=s_0\+vt/)
  assert.match(motion, /s\(4\)=2\+3\\times4=14\\text\{ 米\}/)
  for (const row of ['| 0 | 2 | — |', '| 1 | 5 | 3 |', '| 2 | 8 | 3 |', '| 3 | 11 | 3 |', '| 4 | 14 | 3 |']) {
    assert.ok(motion.includes(row), `missing motion table row: ${row}`)
  }

  assert.match(experiment, /固定下列所有量/)
  assert.match(experiment, /\\mathbf x=\[2,3\].*w_2=-1.*b=5.*y=9/s)
  assert.match(experiment, /只改变 \$w_1\$/)
  assert.match(experiment, /\\hat y\(w_1\)=w_1\\times2\+\(-1\)\\times3\+5=2w_1\+2/)
  for (const row of ['| 2 | 6 | -3 | 9 |', '| 3 | 8 | -1 | 1 |', '| 4 | 10 | 1 | 1 |', '| 5 | 12 | 3 | 9 |', '| 6 | 14 | 5 | 25 |']) {
    assert.ok(experiment.includes(row), `missing controlled-experiment row: ${row}`)
  }
})

test('every misconception explains cause, diagnosis, and repair', () => {
  const misconceptionSection = sliceSecondLevelSections(readManuscript()).get('misconceptions')!
  const headings = [...misconceptionSection.matchAll(/^### 误区[一二三四五六七八九十\d：:].*$/gm)]

  assert.ok(headings.length >= 2)
  for (const [index, heading] of headings.entries()) {
    const misconception = misconceptionSection.slice(
      heading.index,
      headings[index + 1]?.index ?? misconceptionSection.length,
    )
    assert.match(misconception, /\*\*为什么容易发生：\*\*/)
    assert.match(misconception, /\*\*本例诊断：\*\*/)
    assert.match(misconception, /\*\*修复动作：\*\*/)
  }
})

test('all nine exercises include hint, reasoning, and a valid relevant review link', () => {
  const manuscript = readManuscript()
  const sections = sliceSecondLevelSections(manuscript)
  const practice = sections.get('layered-practice')!
  const exercises = [...practice.matchAll(/^\*\*练习 ([123][ABC])\*\*.*$/gm)]
  const expectedReviewTargets: Record<string, RequiredSectionId> = {
    '1A': 'shared-prediction-task',
    '1B': 'mapping-intuition',
    '1C': 'formal-definition',
    '2A': 'worked-prediction',
    '2B': 'python-translation',
    '2C': 'controlled-experiment',
    '3A': 'controlled-experiment',
    '3B': 'worked-motion-example',
    '3C': 'python-translation',
  }

  assert.deepEqual(exercises.map((match) => match[1]), Object.keys(expectedReviewTargets))
  for (const [index, exerciseHeading] of exercises.entries()) {
    const exerciseId = exerciseHeading[1]!
    const exercise = practice.slice(
      exerciseHeading.index,
      exercises[index + 1]?.index ?? practice.length,
    )
    assert.match(exercise, /\*\*提示：\*\*/)
    assert.match(exercise, /\*\*参考推理：\*\*/)
    const reviewLinks = [...exercise.matchAll(/\[回看：[^\]]+\]\(#([a-z0-9-]+)\)/g)]
    assert.equal(reviewLinks.length, 1, `exercise ${exerciseId} must have one review link`)
    assert.equal(reviewLinks[0]![1], expectedReviewTargets[exerciseId])
    assert.ok(sections.has(reviewLinks[0]![1] as RequiredSectionId))
  }
})

test('manuscript rejects unfinished markers, unsafe HTML, and summative pass language', () => {
  const manuscript = readManuscript()

  assert.doesNotMatch(
    manuscript,
    /\b(?:TODO|TBD|FIXME|XXX)\b|(?:^|\s)(?:待补|待写|占位文本|内容未完成)(?:\s|$)|lorem ipsum/i,
  )
  assert.doesNotMatch(
    manuscript,
    /<script\b|<iframe\b|<object\b|<embed\b|\son[a-z]+\s*=|(?:href|src)\s*=\s*["']?\s*javascript:/i,
  )
  assert.match(manuscript, /不做正式评分|不计分/)
  assert.doesNotMatch(manuscript, /通过条件|及格(?:线)?|合格(?:线)?|评分标准|正式评分[：:]|满分|得分[：:]/)
  assert.match(manuscript, /^### 第一层[：:].*概念/m)
  assert.match(manuscript, /^### 第二层[：:].*(?:手算|读码)/m)
  assert.match(manuscript, /^### 第三层[：:].*开放观察/m)
  assert.match(manuscript, /下一课[^\n]{0,80}向量|向量课/)
})
