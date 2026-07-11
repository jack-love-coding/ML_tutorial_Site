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

const REMAINING_LESSONS = [
  {
    file: '02-vectors-samples.zh-CN.md',
    prefix: 'vectors',
    formula: /y_hat = w\^T x \+ b/,
    sharedEvidence: [/w\^T x = 4\*2 \+ \(-1\)\*3 = 5/, /y_hat = 5 \+ 5 = 10/, /L = \(10 - 9\)\^2 = 1/],
    auxiliaryEvidence: [/\|\|x\|\| = sqrt\(13\)/, /proj_w\(x\)/, /5\/sqrt\(17\)/],
    handoff: [/X = \[\[2, 3\], \[1, 4\]\]/, /矩阵课/],
  },
  {
    file: '03-matrices-batches.zh-CN.md',
    prefix: 'matrices',
    formula: /y_hat = Xw \+ b/,
    sharedEvidence: [/X: \(2, 2\)/, /w: \(2,\)/, /Xw: \(2,\)/, /y_hat = \[10, 5\]/, /L = 2\.5/],
    auxiliaryEvidence: [/\[\[1, 0\], \[0, -1\]\]/, /\[2, 3\].*\[2, -3\]/s],
    handoff: [/predictions = \[10, 5\]/, /targets = \[9, 7\]/, /导数课/],
  },
  {
    file: '04-derivatives-error.zh-CN.md',
    prefix: 'derivatives',
    formula: /central_difference = \(L\(theta \+ h\) - L\(theta - h\)\) \/ \(2h\)/,
    sharedEvidence: [/L = 2\.5/, /dL\/dw_1 = 0/, /dL\/dw_2 = -5/, /dL\/db = -1/],
    auxiliaryEvidence: [/s\(t\) = t\^2/, /slope_at_3 = 6/, /h = 0\.1/],
    handoff: [/数值导数.*不等于梯度下降/s, /NumPy 课/],
  },
  {
    file: '05-numpy-implementation.zh-CN.md',
    prefix: 'numpy',
    formula: /predictions = X @ w \+ b/,
    sharedEvidence: [/X\.shape == \(2, 2\)/, /predictions.*\[10\.0, 5\.0\]/s, /mse == 2\.5/, /gradient.*\[0\.0, -5\.0, -1\.0\]/s],
    auxiliaryEvidence: [/broadcast/, /contributions\.shape == \(2, 2\)/, /\[\[8\.0, -3\.0\], \[4\.0, -4\.0\]\]/],
    handoff: [/Project 1/, /x, w, b, y_hat, y, L/],
  },
] as const

const LESSON_SECTION_SUFFIXES = [
  'opening',
  'recap',
  'shared-task',
  'intuition',
  'formal',
  'worked-shared',
  'worked-auxiliary',
  'code',
  'experiment',
  'misconceptions',
  'practice',
  'handoff',
] as const

function readRemainingLesson(file: string): string {
  return readFileSync(new URL(`../docs/curriculum/v3/math-to-code/${file}`, import.meta.url), 'utf8')
}

function sliceRemainingLesson(manuscript: string, prefix: string): Map<string, string> {
  const headings = [...manuscript.matchAll(/^##\s+(.+?)\s+\{#([a-z0-9-]+)\}\s*$/gm)]
  const expectedIds = LESSON_SECTION_SUFFIXES.map((suffix) => `${prefix}-${suffix}`)

  assert.equal([...manuscript.matchAll(/^##\s+.+$/gm)].length, 12)
  assert.deepEqual(headings.map((heading) => heading[2]), expectedIds)
  return new Map(headings.map((heading, index) => [
    heading[2]!,
    manuscript.slice(heading.index, headings[index + 1]?.index ?? manuscript.length),
  ]))
}

for (const lesson of REMAINING_LESSONS) {
  test(`${lesson.file} satisfies the complete manuscript contract`, () => {
    const manuscript = readRemainingLesson(lesson.file)
    const sections = sliceRemainingLesson(manuscript, lesson.prefix)

    assert.equal(sections.size, 12)
    assert.ok(manuscript.length >= 9_000, `${lesson.file} must be a substantive 60–90 minute lesson`)
    assert.match(manuscript.slice(0, manuscript.indexOf('## ')), /60–90 分钟/)
    assert.match(sections.get(`${lesson.prefix}-shared-task`)!, lesson.formula)
    assert.match(sections.get(`${lesson.prefix}-shared-task`)!, /x.*w.*b.*y_hat.*y.*L/s)
    const shared = sections.get(`${lesson.prefix}-worked-shared`)!
    const auxiliary = sections.get(`${lesson.prefix}-worked-auxiliary`)!

    for (const evidence of lesson.sharedEvidence) assert.match(shared, evidence)
    for (const evidence of lesson.auxiliaryEvidence) assert.match(auxiliary, evidence)
    const misconceptions = sections.get(`${lesson.prefix}-misconceptions`)!
    const misconceptionHeadings = [...misconceptions.matchAll(/^### 误区[一二三四五六七八九十\d：:].*$/gm)]
    assert.ok(misconceptionHeadings.length >= 3)
    for (const [index, heading] of misconceptionHeadings.entries()) {
      const item = misconceptions.slice(heading.index, misconceptionHeadings[index + 1]?.index ?? misconceptions.length)
      assert.match(item, /\*\*为什么容易发生：\*\*/)
      assert.match(item, /\*\*本例诊断：\*\*/)
      assert.match(item, /\*\*修复动作：\*\*/)
    }

    const practice = sections.get(`${lesson.prefix}-practice`)!
    assert.match(practice, /^### 第一层[：:].*概念/m)
    assert.match(practice, /^### 第二层[：:].*(?:手算|读码|调试)/m)
    assert.match(practice, /^### 第三层[：:].*开放观察/m)
    const exercises = [...practice.matchAll(/^\*\*练习 ([123][ABC])\*\*.*$/gm)]
    assert.deepEqual(exercises.map((exercise) => exercise[1]), ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C'])
    for (const [index, heading] of exercises.entries()) {
      const item = practice.slice(heading.index, exercises[index + 1]?.index ?? practice.length)
      assert.match(item, /\*\*提示：\*\*/)
      assert.match(item, /\*\*参考推理：\*\*/)
      const links = [...item.matchAll(/\[回看：[^\]]+\]\(#([a-z0-9-]+)\)/g)]
      assert.equal(links.length, 1)
      assert.ok(sections.has(links[0]![1]!))
    }
    const handoff = sliceRemainingLesson(manuscript, lesson.prefix).get(`${lesson.prefix}-handoff`)!

    for (const evidence of lesson.handoff) assert.match(handoff, evidence)
    assert.match(manuscript, /不做正式评分|不计分/)
    assert.doesNotMatch(manuscript, /\b(?:TODO|TBD|FIXME|XXX)\b|(?:待补|待写|占位文本|内容未完成)|lorem ipsum/i)
    assert.doesNotMatch(manuscript, /<script\b|<iframe\b|<object\b|<embed\b|\son[a-z]+\s*=|javascript:/i)
    assert.doesNotMatch(manuscript, /通过条件|及格(?:线)?|合格(?:线)?|评分标准|正式评分[：:]|满分|得分[：:]/)
  })
}
