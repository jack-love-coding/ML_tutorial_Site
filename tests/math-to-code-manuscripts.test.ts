import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  centralDifference,
  evaluatePredictionTask,
  meanSquaredError,
  predictBatch,
} from '../src/modules/math-lab/utils/mathToCode.ts'

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
    auxiliaryEvidence: [/u = \[3, 4\]/, /v = \[4, 0\]/, /\|\|u\|\| = 5/, /proj_v\(u\) = \[3, 0\]/],
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
    auxiliaryEvidence: [/sensor_grid/, /# \(2, 3\)/, /wrong_column_bias/, /# \(3, 3\)/, /fixed_column_bias/, /\[\[11\. 22\. 33\.\]/],
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

test('vectors keeps dimensional geometry out of the unit-bearing prediction functional', () => {
  const manuscript = readRemainingLesson('02-vectors-samples.zh-CN.md')
  const sections = sliceRemainingLesson(manuscript, 'vectors')
  const predictionSections = [
    'vectors-shared-task',
    'vectors-intuition',
    'vectors-formal',
    'vectors-worked-shared',
    'vectors-code',
    'vectors-experiment',
  ].map((id) => sections.get(id)!).join('\n')
  const auxiliary = sections.get('vectors-worked-auxiliary')!

  assert.match(predictionSections, /线性泛函/)
  assert.match(predictionSections, /w_1.*分钟\/基础任务.*w_2.*分钟\/提示请求/s)
  assert.match(predictionSections, /w_jx_j|w_j x_j/)
  assert.doesNotMatch(predictionSections, /\lVert\s*(?:\\mathbf\s*)?w|proj(?:ection)?_?w|operatorname\{proj\}.*w|w.*夹角|单位权重方向/s)
  assert.match(auxiliary, /无量纲/)
  assert.match(auxiliary, /同一尺度/)
  assert.doesNotMatch(auxiliary, /完成时长|权重|y_hat|\bw\s*=|\bx\s*=/)
})

test('vector geometry exercises keep u and v conditions, notation, and review links', () => {
  const manuscript = readRemainingLesson('02-vectors-samples.zh-CN.md')
  const practice = sliceRemainingLesson(manuscript, 'vectors').get('vectors-practice')!
  const exercises = [...practice.matchAll(/^\*\*练习 ([123][ABC])\*\*.*$/gm)]
  const exercise = (id: string): string => {
    const index = exercises.findIndex((heading) => heading[1] === id)
    assert.notEqual(index, -1)
    return practice.slice(exercises[index]!.index, exercises[index + 1]?.index ?? practice.length)
  }

  const exercise1C = exercise('1C')
  assert.match(exercise1C, /无量纲.*同尺度|同尺度.*无量纲/s)
  assert.match(exercise1C, /\[回看：[^\]]+\]\(#vectors-worked-auxiliary\)/)

  const exercise2C = exercise('2C')
  assert.match(exercise2C, /分母是 \$v\^Tv=2\$/)
  assert.doesNotMatch(exercise2C, /w\^Tw|w.*(?:范数|长度|夹角|投影)/s)

  const exercise3B = exercise('3B')
  assert.match(exercise3B, /2[^\n]{0,20}0\.2[^\n]{0,30}4[^\n]{0,20}40/)
  assert.doesNotMatch(practice, /(?:norm|\\lVert)\s*\(?w|proj(?:ection)?_?w|w\^Tw|w[^\n]{0,80}(?:范数|夹角|投影)/)
})

function extractMarkedPythonReference(codeSection: string): string {
  const block = codeSection.match(/```python\n(# MATH_TO_CODE_REFERENCE_BEGIN[\s\S]*?# MATH_TO_CODE_REFERENCE_END)\n```/)
  assert.ok(block, 'missing single marked Python reference implementation')
  return block[1]!
}

test('NumPy reference block encodes every Task 1 validation and copy contract', () => {
  const manuscript = readRemainingLesson('05-numpy-implementation.zh-CN.md')
  const sections = sliceRemainingLesson(manuscript, 'numpy')
  const codeSection = sections.get('numpy-code')!
  const code = extractMarkedPythonReference(codeSection)

  assert.equal([...codeSection.matchAll(/# MATH_TO_CODE_REFERENCE_BEGIN/g)].length, 1)
  assert.equal([...codeSection.matchAll(/# MATH_TO_CODE_REFERENCE_END/g)].length, 1)

  for (const name of ['X', 'w', 'predictions', 'targets']) {
    assert.match(code, new RegExp(`${name} = np\\.asarray\\([^\\n]+dtype=float\\)\\.copy\\(\\)`))
  }
  assert.match(code, /X\.ndim != 2/)
  assert.match(code, /w\.ndim != 1/)
  assert.match(code, /predictions\.ndim != 1/)
  assert.match(code, /targets\.ndim != 1/)
  assert.match(code, /X\.shape\[0\] == 0|X\.size == 0/)
  assert.match(code, /predictions\.size == 0/)
  assert.match(code, /X\.shape\[1\] != w\.shape\[0\]/)
  assert.match(code, /predictions\.shape != targets\.shape/)
  for (const name of ['X', 'w', 'predictions', 'targets']) {
    assert.match(code, new RegExp(`np\\.isfinite\\(${name}\\)\\.all\\(\\)`))
  }
  assert.match(code, /np\.isfinite\(b\)/)
  assert.match(code, /np\.isfinite\(theta\)/)
  assert.match(code, /np\.isfinite\(h\)/)
  assert.match(code, /h <= 0/)
  assert.match(code, /np\.isfinite\(result\)/)
  assert.match(code, /np\.isfinite\(left\)/)
  assert.match(code, /np\.isfinite\(right\)/)
  assert.match(code, /normalized_X = _matrix\(X\)/)
  assert.match(code, /normalized_y = _vector\(y, "y"\)/)
  assert.match(code, /normalized_w = _vector\(w, "w"\)/)
  assert.match(code, /candidate_w = normalized_w\.copy\(\)/)
  assert.doesNotMatch(code, /\bzip\s*\(/)
  const evaluateBody = code.slice(code.indexOf('def evaluate'))
  assert.doesNotMatch(evaluateBody, /predict_batch\(X,|mse_loss\([^\n]+, y\)/)

  const workedShared = sections.get('numpy-worked-shared')!
  const workedAuxiliary = sections.get('numpy-worked-auxiliary')!
  assert.match(workedShared, /print\(predictions\)\s+# \[10\.  5\.\]/)
  assert.match(workedAuxiliary, /# \[\[11\. 22\. 33\.\]\n#  \[41\. 52\. 63\.\]\]/)
})

test('NumPy central difference rejects non-finite perturbation points before calling fn', () => {
  const codeSection = sliceRemainingLesson(
    readRemainingLesson('05-numpy-implementation.zh-CN.md'),
    'numpy',
  ).get('numpy-code')!
  const code = extractMarkedPythonReference(codeSection)
  const central = code.slice(code.indexOf('def central_difference'), code.indexOf('def evaluate'))

  assert.match(central, /left_theta = theta - h/)
  assert.match(central, /right_theta = theta \+ h/)
  assert.match(central, /denominator = 2 \* h/)
  for (const name of ['left_theta', 'right_theta', 'denominator']) {
    assert.match(central, new RegExp(`np\\.isfinite\\(${name}\\)`))
  }
  assert.match(central, /left = _scalar\(fn\(left_theta\)/)
  assert.match(central, /right = _scalar\(fn\(right_theta\)/)
  assert.match(central, /result = \(right - left\) \/ denominator/)
  assert.ok(central.indexOf('np.isfinite(left_theta)') < central.indexOf('fn(left_theta)'))
  assert.ok(central.indexOf('np.isfinite(right_theta)') < central.indexOf('fn(right_theta)'))
  assert.ok(central.indexOf('np.isfinite(denominator)') < central.indexOf('fn(left_theta)'))
})

test('NumPy manuscript contract agrees with the executable Task 1 implementation', () => {
  assert.deepEqual(predictBatch([[2, 3], [1, 4]], [4, -1], 5), [10, 5])
  assert.equal(meanSquaredError([10, 5], [9, 7]), 2.5)
  const evaluation = evaluatePredictionTask({
    samples: [{ features: [2, 3], target: 9 }, { features: [1, 4], target: 7 }],
    parameters: { weights: [4, -1], bias: 5 },
    derivativeStep: 1e-4,
  })
  assert.ok(Math.abs(evaluation.parameterDerivatives.weights[0]!) < 1e-8)
  assert.ok(Math.abs(evaluation.parameterDerivatives.weights[1]! + 5) < 1e-8)
  assert.ok(Math.abs(evaluation.parameterDerivatives.bias + 1) < 1e-8)
  assert.throws(() => predictBatch([[1, 2]], [1], 0), /same length/)
  assert.throws(() => meanSquaredError([[1]] as unknown as number[], [1]), /finite/)
  assert.throws(() => centralDifference(() => Number.POSITIVE_INFINITY, 1, 1e-4), /finite/)
})

const guidedStudioUrl = new URL(
  '../docs/curriculum/v3/math-to-code/06-guided-studio.zh-CN.md',
  import.meta.url,
)

const GUIDED_STUDIO_STAGE_IDS = [
  'studio-reproduce-task',
  'studio-scalar-baseline',
  'studio-vector-prediction',
  'studio-batch-prediction',
  'studio-error-comparison',
  'studio-numerical-sensitivity',
  'studio-probability-preview',
  'studio-failure-analysis',
  'studio-reflection',
] as const

type GuidedStudioStageId = typeof GUIDED_STUDIO_STAGE_IDS[number]

function readGuidedStudio(): string {
  return readFileSync(guidedStudioUrl, 'utf8')
}

function sliceGuidedStudioStages(manuscript: string): Map<GuidedStudioStageId, string> {
  const headings = [...manuscript.matchAll(/^##\s+(.+?)\s+\{#([a-z0-9-]+)\}\s*$/gm)]

  assert.equal([...manuscript.matchAll(/^##\s+.+$/gm)].length, GUIDED_STUDIO_STAGE_IDS.length)
  assert.deepEqual(headings.map((heading) => heading[2]), GUIDED_STUDIO_STAGE_IDS)
  assert.equal(new Set(headings.map((heading) => heading[2])).size, GUIDED_STUDIO_STAGE_IDS.length)

  return new Map(headings.map((heading, index) => [
    heading[2] as GuidedStudioStageId,
    manuscript.slice(heading.index, headings[index + 1]?.index ?? manuscript.length),
  ]))
}

function extractGuidedStudioPython(stage: string, id: GuidedStudioStageId): string {
  const blocks = [...stage.matchAll(/```python\n([\s\S]*?)\n```/g)]
  assert.equal(blocks.length, 1, `${id} must contain exactly one executable Python block`)
  return blocks[0]![1]!
}

function guidedStudioPythonByStage(): Map<GuidedStudioStageId, string> {
  const stages = sliceGuidedStudioStages(readGuidedStudio())
  return new Map(GUIDED_STUDIO_STAGE_IDS.map((id) => [
    id,
    extractGuidedStudioPython(stages.get(id)!, id),
  ]))
}

test('guided studio keeps nine stable stage IDs in learning order', () => {
  const stages = sliceGuidedStudioStages(readGuidedStudio())

  assert.equal(stages.size, 9)
  for (const id of GUIDED_STUDIO_STAGE_IDS) {
    assert.match(stages.get(id)!, new RegExp(`^##\\s+.+\\{#${id}\\}\\s*$`, 'm'))
  }
})

test('guided studio stages form a detailed sequentially executable notebook', () => {
  const stages = sliceGuidedStudioStages(readGuidedStudio())

  assert.match(readGuidedStudio().slice(0, readGuidedStudio().indexOf('## ')), /按阶段 1.*阶段 9.*同一.*notebook/s)
  for (const [index, id] of GUIDED_STUDIO_STAGE_IDS.entries()) {
    const stage = stages.get(id)!
    assert.ok(stage.length >= 650, `${id} is too thin to support independent study`)
    assert.match(stage, /^### 本阶段目标$/m, `${id} lacks a goal`)
    assert.match(stage, /^### 前置输入$/m, `${id} lacks prerequisite inputs`)
    assert.match(stage, /^### Starter code 与操作步骤$/m, `${id} lacks starter code or steps`)
    assert.match(stage, /^### 预期中间结果$/m, `${id} lacks inspectable intermediate results`)
    assert.match(stage, /^### 观察提示$/m, `${id} lacks observation guidance`)
    assert.match(stage, /^### 常见失败与修复$/m, `${id} lacks failure diagnosis and repair`)
    assert.match(stage, /^### 反思$/m, `${id} lacks reflection`)
    extractGuidedStudioPython(stage, id)
    if (index > 0) {
      const priorStage = `阶段 ${index}`
      const prerequisite = stage.slice(stage.indexOf('### 前置输入'), stage.indexOf('### Starter code'))
      assert.match(prerequisite, new RegExp(`${priorStage}.*(?:同一.*notebook|保留|沿用|继承|复用)`, 's'))
    }
  }
})

test('guided studio Python blocks preserve producer-before-consumer dataflow', () => {
  const code = guidedStudioPythonByStage()
  const stageCode = GUIDED_STUDIO_STAGE_IDS.map((id) => code.get(id)!)
  const producers: Array<[string, number, RegExp]> = [
    ['X', 0, /^X\s*=/m],
    ['w', 0, /^w\s*=/m],
    ['b', 0, /^b\s*=/m],
    ['targets', 0, /^targets\s*=/m],
    ['x', 1, /^x\s*=\s*X\[0\]\.copy\(\)/m],
    ['prediction', 2, /^prediction\s*=/m],
    ['predictions', 3, /^predictions\s*=/m],
    ['residuals', 4, /^residuals\s*=/m],
    ['MSE', 4, /^MSE\s*=/m],
    ['gradient_w', 5, /^gradient_w\s*=/m],
    ['gradient_b', 5, /^gradient_b\s*=/m],
  ]

  for (const [name, producerIndex, definition] of producers) {
    assert.match(stageCode[producerIndex]!, definition, `${name} is not defined by its producer stage`)
    for (let index = 0; index < producerIndex; index += 1) {
      assert.doesNotMatch(stageCode[index]!, new RegExp(`\\b${name}\\b`), `${name} is used before definition`)
    }
  }
  for (const [shared, producerIndex] of [['X', 0], ['w', 0], ['b', 0], ['targets', 0], ['x', 1]] as const) {
    for (const laterCode of stageCode.slice(producerIndex + 1)) {
      assert.doesNotMatch(laterCode, new RegExp(`^${shared}\\s*=`, 'm'), `${shared} must be inherited, not redefined`)
    }
  }
  assert.match(stageCode[3]!, /\bX\b.*\bw\b.*\bb\b/s)
  assert.match(stageCode[4]!, /\bpredictions\b.*\btargets\b/s)
  for (const inherited of ['X', 'w', 'b', 'targets']) {
    assert.match(stageCode[5]!, new RegExp(`\\b${inherited}\\b`))
  }
  assert.match(stageCode[8]!, /\bpredictions\b.*\btargets\b.*\bMSE\b.*\bgradient_w\b.*\bgradient_b\b/s)
})

test('guided studio code and expected outputs agree with the executable Task 1 oracle', () => {
  const stages = sliceGuidedStudioStages(readGuidedStudio())
  const code = guidedStudioPythonByStage()
  const evaluation = evaluatePredictionTask({
    samples: [{ features: [2, 3], target: 9 }, { features: [1, 4], target: 7 }],
    parameters: { weights: [4, -1], bias: 5 },
    derivativeStep: 1e-4,
  })
  const residuals = evaluation.predictions.map((prediction, index) => prediction - evaluation.targets[index]!)
  const squaredErrors = residuals.map((residual) => residual ** 2)

  assert.deepEqual(evaluation.predictions, [10, 5])
  assert.deepEqual(residuals, [1, -2])
  assert.deepEqual(squaredErrors, [1, 4])
  assert.equal(evaluation.mse, 2.5)
  assert.ok(Math.abs(evaluation.parameterDerivatives.weights[0]!) < 1e-8)
  assert.ok(Math.abs(evaluation.parameterDerivatives.weights[1]! + 5) < 1e-8)
  assert.ok(Math.abs(evaluation.parameterDerivatives.bias + 1) < 1e-8)

  const reproduceCode = code.get('studio-reproduce-task')!
  assert.match(reproduceCode, /^X\s*=\s*np\.asarray\(\[\[2\.0, 3\.0\], \[1\.0, 4\.0\]\]/m)
  assert.match(reproduceCode, /^w\s*=\s*np\.asarray\(\[4\.0, -1\.0\]/m)
  assert.match(reproduceCode, /^b\s*=\s*float\(5\.0\)/m)
  assert.match(reproduceCode, /^targets\s*=\s*np\.asarray\(\[9\.0, 7\.0\]/m)

  const scalarCode = code.get('studio-scalar-baseline')!
  assert.match(scalarCode, /for\s+index\s+in\s+range\(w\.size\)/)
  assert.match(scalarCode, /weighted_sum_scalar\s*\+=\s*x\[index\]\s*\*\s*w\[index\]/)
  assert.match(scalarCode, /prediction_scalar\s*=\s*weighted_sum_scalar\s*\+\s*b/)
  assert.match(code.get('studio-vector-prediction')!, /weighted_sum\s*=\s*float\(contributions\.sum\(\)\)[\s\S]*prediction\s*=\s*weighted_sum\s*\+\s*b/)
  assert.match(code.get('studio-batch-prediction')!, /weighted_batch\s*=\s*X\s*@\s*w[\s\S]*predictions\s*=\s*weighted_batch\s*\+\s*b/)
  assert.match(code.get('studio-error-comparison')!, /residuals\s*=\s*predictions\s*-\s*targets[\s\S]*squared_errors\s*=\s*residuals\s*\*\*\s*2[\s\S]*MSE\s*=\s*float\(np\.mean\(squared_errors\)\)/)
  const sensitivityCode = code.get('studio-numerical-sensitivity')!
  assert.match(sensitivityCode, /candidate_predictions\s*=\s*X\s*@\s*candidate_w\s*\+\s*candidate_b/)
  assert.match(sensitivityCode, /result\s*=\s*\(right\s*-\s*left\)\s*\/\s*denominator/)
  assert.match(sensitivityCode, /gradient_w\.append\(central_difference_safe\(loss_for_weight,\s*w\[j\],\s*h=1e-4\)\)/)
  assert.match(sensitivityCode, /gradient_b\s*=\s*central_difference_safe\(lambda candidate:\s*mse_for\(w,\s*candidate\),\s*b,\s*h=1e-4\)/)

  assert.match(stages.get('studio-batch-prediction')!, new RegExp(`predictions = \\[${evaluation.predictions.join('\\.0, ')}\\.0\\]`))
  assert.match(stages.get('studio-error-comparison')!, new RegExp(`residuals = \\[${residuals.join('\\.0, ')}\\.0\\]`))
  assert.match(stages.get('studio-error-comparison')!, new RegExp(`squared_errors = \\[${squaredErrors.join('\\.0, ')}\\.0\\]`))
  assert.match(stages.get('studio-error-comparison')!, new RegExp(`MSE = ${evaluation.mse}`))
  assert.match(stages.get('studio-numerical-sensitivity')!, /\[0\.0, -5\.0\].*-1\.0/s)
})

test('guided studio Python guards preserve Task 1 shape, finite-value, and mutation safety', () => {
  const code = guidedStudioPythonByStage()
  const reproduce = code.get('studio-reproduce-task')!
  const batch = code.get('studio-batch-prediction')!
  const sensitivity = code.get('studio-numerical-sensitivity')!
  const failure = code.get('studio-failure-analysis')!

  assert.match(reproduce, /dtype=float/)
  assert.match(reproduce, /X\.ndim\s*!=\s*2/)
  assert.match(reproduce, /w\.ndim\s*!=\s*1/)
  assert.match(reproduce, /targets\.ndim\s*!=\s*1/)
  assert.match(reproduce, /X\.shape\[0\]\s*==\s*0|X\.size\s*==\s*0/)
  assert.match(reproduce, /np\.isfinite\(X\)\.all\(\)/)
  assert.match(reproduce, /np\.isfinite\(w\)\.all\(\)/)
  assert.match(reproduce, /np\.isfinite\(targets\)\.all\(\)/)
  assert.match(reproduce, /np\.isfinite\(b\)/)
  assert.match(batch, /X\.shape\[1\]\s*!=\s*w\.shape\[0\]/)
  assert.match(batch, /predictions\.shape\s*!=\s*targets\.shape/)
  assert.match(sensitivity, /candidate_w\s*=\s*w\.copy\(\)/)
  assert.match(sensitivity, /np\.isfinite\(h\)/)
  assert.match(sensitivity, /h\s*<=\s*0/)
  assert.match(sensitivity, /np\.isfinite\(left_theta\)/)
  assert.match(sensitivity, /np\.isfinite\(right_theta\)/)
  assert.match(sensitivity, /denominator\s*=\s*2\s*\*\s*h/)
  assert.match(sensitivity, /np\.isfinite\(denominator\)/)
  assert.match(sensitivity, /np\.isfinite\(result\)/)
  const leftResultCheck = sensitivity.indexOf('if not np.isfinite(left):')
  const rightEvaluation = sensitivity.indexOf('fn(right_theta)')
  const rightResultCheck = sensitivity.indexOf('if not np.isfinite(right):')
  const differenceEvaluation = sensitivity.indexOf('result =')
  for (const position of [leftResultCheck, rightEvaluation, rightResultCheck, differenceEvaluation]) {
    assert.notEqual(position, -1)
  }
  assert.ok(leftResultCheck < rightEvaluation)
  assert.ok(rightResultCheck < differenceEvaluation)
  assert.match(failure, /target_column\s*=\s*targets\[:,\s*None\]/)
  assert.match(failure, /cross_residuals\s*=\s*predictions\s*-\s*target_column/)
  assert.match(failure, /wrong_axis\s*=\s*\(X\s*\*\s*w\)\.sum\(axis=0\)/)
  assert.match(failure, /right_axis\s*=\s*\(X\s*\*\s*w\)\.sum\(axis=1\)/)
})

test('numerical sensitivity stage separates local evidence from optimization', () => {
  const sensitivity = sliceGuidedStudioStages(readGuidedStudio()).get('studio-numerical-sensitivity')!

  assert.match(sensitivity, /h\s*=\s*1e-4|10\^\{-4\}/)
  assert.match(sensitivity, /dL\/dw_1\s*=\s*0/)
  assert.match(sensitivity, /dL\/dw_2\s*=\s*-5/)
  assert.match(sensitivity, /dL\/db\s*=\s*-1/)
  assert.match(sensitivity, /局部/)
  assert.match(sensitivity, /不等于梯度下降|不是梯度下降/)
})

test('probability stage is visibly a non-blocking preview with a reproducible simulation', () => {
  const preview = sliceGuidedStudioStages(readGuidedStudio()).get('studio-probability-preview')!

  assert.match(preview, /预告（非完整概率课程）|预告：非完整概率课程/)
  assert.match(preview, /rng\s*=\s*np\.random\.default_rng\(2026\)/)
  assert.match(preview, /可选扩展/)
  assert.match(preview, /不影响|不阻塞/)
  assert.doesNotMatch(preview, /已经掌握概率|替代.*概率课程|覆盖概率课程全部/)
})

test('reflection stage preserves the formal project prerequisite boundary', () => {
  const reflection = sliceGuidedStudioStages(readGuidedStudio()).get('studio-reflection')!

  assert.match(
    reflection,
    /正式的\s*`?project-math-to-code`?.*Gradient Descent.*Monte Carlo\s*之后/s,
  )
  assert.match(reflection, /当前.*guided studio|本页.*guided studio/i)
  assert.match(reflection, /不是.*正式的\s*`?project-math-to-code`?/s)
})

test('guided studio stages contain no unsafe, unfinished, or summative workflow language', () => {
  const stages = sliceGuidedStudioStages(readGuidedStudio())
  const forbiddenWorkflow = /上传|提交|评分|通过|证书|及格|合格|得分|满分|\b(?:upload|submit|grade|grading|pass|certificate|score)\b/i
  const unsafeOrUnfinished = /\b(?:TODO|TBD|FIXME|XXX)\b|待补|待写|占位文本|内容未完成|lorem ipsum|<script\b|<iframe\b|<object\b|<embed\b|\son[a-z]+\s*=|javascript:/i

  for (const [id, stage] of stages) {
    assert.doesNotMatch(stage, forbiddenWorkflow, `${id} introduces a summative workflow`)
    assert.doesNotMatch(stage, unsafeOrUnfinished, `${id} contains unsafe or unfinished content`)
  }
})
