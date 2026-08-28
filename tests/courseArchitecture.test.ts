import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { aiFoundationCourse } from '../src/curriculum/courses/data/aiFoundation.ts'
import { validateCourseDefinition } from '../src/curriculum/courses/validation.ts'
import {
  courseOverviewRoute,
  courseUnitRoute,
  resolveCourseOverview,
  resolveCourseUnit,
} from '../src/curriculum/courses/routes.ts'

const root = new URL('../', import.meta.url)
const expectedUnitIds = [
  '01-ai-map-python',
  '02-python-functions-debugging',
  '03-numpy-shapes-vectorization',
  '04-pandas-inspection',
  '05-pandas-cleaning-joins',
  '06-eda-visual-evidence',
  '07-ml-experiment-design',
  '08-linear-regression-optimization',
  '09-logistic-regression-thresholds',
  '10-classic-classifiers',
  '11-decision-trees',
  '12-bagging-random-forests',
  '13-gradient-boosting',
  '14-tabular-pipeline',
  '15-mlp-backpropagation',
  '16-pytorch-training-engineering',
  '17-cnn-image-classification',
  '18-transfer-learning-vit',
  '19-detection-segmentation',
  '20-nlp-tfidf-baseline',
  '21-rnn-lstm-attention-bridge',
  '22-attention-transformer',
  '23-pretrained-transformers',
  '24-llm-training-adaptation',
  '25-llm-applications-capstone',
]

function parseCsvRow(line: string) {
  const values: string[] = []
  let value = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"'
        index += 1
      } else quoted = !quoted
    } else if (character === ',' && !quoted) {
      values.push(value)
      value = ''
    } else value += character
  }
  values.push(value)
  return values
}

test('AI foundations contract preserves the authoritative 4-stage, 25-unit, 50-hour syllabus', () => {
  assert.equal(aiFoundationCourse.id, 'ai-foundation')
  assert.equal(aiFoundationCourse.stages.length, 4)
  assert.equal(aiFoundationCourse.units.length, 25)
  assert.equal(aiFoundationCourse.totalHours, 50)
  assert.equal(aiFoundationCourse.units.reduce((total, unit) => total + unit.estimatedHours, 0), 50)
  assert.deepEqual(aiFoundationCourse.units.map((unit) => unit.id), expectedUnitIds)
  assert.deepEqual(aiFoundationCourse.stages.map((stage) => stage.unitIds.length), [6, 8, 7, 4])
  assert.deepEqual(aiFoundationCourse.stages.map((stage) => stage.publicationStatus), ['published', 'published', 'planned', 'planned'])
  assert.deepEqual(aiFoundationCourse.units.map((unit) => unit.publicationStatus), [
    ...Array(14).fill('published'),
    ...Array(11).fill('planned'),
  ])
  assert.deepEqual(validateCourseDefinition(aiFoundationCourse), [])
})

test('every course unit is bilingual and owns a complete learning-loop contract', () => {
  for (const unit of aiFoundationCourse.units) {
    assert.ok(unit.title['zh-CN'] && unit.title.en)
    assert.ok(unit.coreQuestion['zh-CN'] && unit.coreQuestion.en)
    assert.ok(unit.knowledgeAndMethods['zh-CN'] && unit.knowledgeAndMethods.en)
    assert.ok(unit.teachingFocus['zh-CN'] && unit.teachingFocus.en)
    assert.ok(unit.practice['zh-CN'] && unit.practice.en)
    assert.ok(unit.datasets['zh-CN'] && unit.datasets.en)
    assert.ok(unit.tools['zh-CN'] && unit.tools.en)
    assert.ok(unit.deliverables['zh-CN'] && unit.deliverables.en)
    assert.ok(unit.acceptanceCriteria.length >= 3)
    const kinds = new Set(unit.steps.map((step) => step.kind))
    assert.ok(kinds.has('explanation'))
    assert.ok(kinds.has('code'))
    assert.ok(kinds.has('lab') || kinds.has('notebook'))
    assert.ok(kinds.has('misconception'))
    assert.ok(kinds.has('checkpoint'))
    assert.ok(kinds.has('deliverable'))
  }
})

test('every published asset exists locally and every public path stays base-safe', () => {
  for (const unit of aiFoundationCourse.units.filter((candidate) => candidate.publicationStatus === 'published')) {
    for (const resource of unit.steps.flatMap((step) => step.resourceRefs ?? [])) {
      if (resource.kind === 'asset') {
        assert.ok(resource.path.startsWith('/'), `${unit.id} asset should be a public-root path`)
        assert.ok(existsSync(new URL(`../public${resource.path}`, import.meta.url)), `${unit.id} is missing ${resource.path}`)
      }
      if (resource.kind === 'route') assert.ok(resource.route.startsWith('/'))
    }
  }
  const unitViewSource = readFileSync(new URL('../src/views/CourseUnitView.vue', import.meta.url), 'utf8')
  assert.match(unitViewSource, /withPublicBase\(resource\.path\)/)
})

test('Part B publishes eight specific teaching loops and canonical Phase 29/30 evidence', () => {
  const partB = aiFoundationCourse.units.slice(6, 14)
  assert.deepEqual(partB.map((unit) => unit.order), [7, 8, 9, 10, 11, 12, 13, 14])
  assert.ok(partB.every((unit) => unit.publicationStatus === 'published'))
  assert.ok(partB.every((unit) => unit.knowledgeAndMethods['zh-CN'].length > 180 && unit.knowledgeAndMethods.en.length > 240))
  assert.ok(partB.every((unit) => unit.referenceLinks.length > 0))
  assert.equal(new Set(partB.map((unit) => unit.steps.find((step) => step.kind === 'checkpoint')?.checkpoint?.question.en)).size, 8)

  const logistic = partB.find((unit) => unit.id === '09-logistic-regression-thresholds')!
  const logisticResources = logistic.steps.flatMap((step) => step.resourceRefs ?? [])
  assert.ok(logisticResources.some((resource) => resource.kind === 'curriculum' && resource.moduleId === 'logistic-regression' && resource.lessonId === 'linear-score'))
  assert.ok(logisticResources.some((resource) => resource.kind === 'curriculum' && resource.moduleId === 'classification' && resource.lessonId === 'costTradeoff'))
  assert.ok(logisticResources.some((resource) => resource.kind === 'asset' && resource.path.includes('/classification/phase-30/notebooks/')))
  assert.match(logistic.knowledgeAndMethods.en, /validation selects \$t=0\.09\$/)
  assert.match(logistic.steps.find((step) => step.kind === 'misconception')!.description.en, /test into validation/)

  const classic = partB.find((unit) => unit.id === '10-classic-classifiers')!
  assert.match(classic.knowledgeAndMethods.en, /KNN.*Naive Bayes.*RBF SVM/s)
  const boosting = partB.find((unit) => unit.id === '13-gradient-boosting')!
  assert.match(boosting.knowledgeAndMethods.en, /XGBoost.*LightGBM.*CatBoost/s)
  const pipeline = partB.find((unit) => unit.id === '14-tabular-pipeline')!
  assert.match(pipeline.knowledgeAndMethods.en, /ColumnTransformer.*OOF.*locked test/s)
})

test('checked-in CSV remains the audit source for sequence, topics, hours, and cumulative hours', () => {
  const csvUrl = new URL('../docs/curriculum/ai-foundation/AI基础前置课_50小时_25节.csv', import.meta.url)
  assert.ok(existsSync(csvUrl))
  const raw = readFileSync(csvUrl)
  assert.deepEqual([...raw.subarray(0, 3)], [0xef, 0xbb, 0xbf])
  const lines = raw.toString('utf8').replace(/^\uFEFF/, '').trim().split(/\r?\n/)
  const rows = lines.slice(1).map(parseCsvRow)
  assert.equal(rows.length, 25)
  assert.deepEqual(rows.map((row) => Number(row[0])), Array.from({ length: 25 }, (_, index) => index + 1))
  assert.deepEqual(rows.map((row) => row[4]), aiFoundationCourse.units.map((unit) => unit.title['zh-CN']))
  assert.deepEqual(rows.map((row) => Number(row[12])), Array(25).fill(2))
  assert.deepEqual(rows.map((row) => Number(row[13])), Array.from({ length: 25 }, (_, index) => (index + 1) * 2))
})

test('course routing publishes only complete units and redirects unknown or planned destinations', () => {
  assert.equal(courseOverviewRoute('ai-foundation'), '/courses/ai-foundation')
  assert.equal(courseUnitRoute('ai-foundation', expectedUnitIds[0]), '/courses/ai-foundation/units/01-ai-map-python')
  assert.equal(resolveCourseOverview('ai-foundation').kind, 'current')
  assert.deepEqual(resolveCourseOverview('missing-course'), {
    kind: 'redirect',
    course: aiFoundationCourse,
    path: '/courses/ai-foundation',
    query: { notice: 'unknown-course' },
  })
  assert.equal(resolveCourseUnit('ai-foundation', '01-ai-map-python').kind, 'current')
  assert.equal(resolveCourseUnit('ai-foundation', '07-ml-experiment-design').kind, 'current')
  assert.equal(resolveCourseUnit('ai-foundation', '14-tabular-pipeline').kind, 'current')
  assert.deepEqual(resolveCourseUnit('ai-foundation', '15-mlp-backpropagation'), {
    kind: 'redirect',
    course: aiFoundationCourse,
    unit: aiFoundationCourse.units[14],
    path: '/courses/ai-foundation',
    hash: '#stage-deep-learning-cv-nlp',
    query: { notice: 'planned-unit' },
  })
  assert.equal(resolveCourseUnit('ai-foundation', 'missing-unit').query?.notice, 'unknown-unit')
})

test('course routes are lazy, base-aware, and legacy routes remain registered', () => {
  const routerSource = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8')
  assert.match(routerSource, /path: '\/courses\/:courseId'/)
  assert.match(routerSource, /path: '\/courses\/:courseId\/units\/:unitId'/)
  assert.match(routerSource, /import\('\.\.\/views\/CourseOverviewView\.vue'\)/)
  assert.match(routerSource, /import\('\.\.\/views\/CourseUnitView\.vue'\)/)
  for (const route of ['/spine', '/learn/:moduleId', '/math-lab/modules/:moduleId', '/data-lab/modules/:moduleId']) {
    assert.ok(routerSource.includes(`path: '${route}'`), `${route} must remain registered`)
  }
  assert.match(routerSource, /createWebHistory\(import\.meta\.env\.BASE_URL\)/)
})
