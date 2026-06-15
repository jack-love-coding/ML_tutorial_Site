import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

function escaped(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

test('classification project module is registered after housing project', () => {
  const typesSource = read('src/types/ml.ts')
  const catalogSource = read('src/data/moduleCatalog.ts')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')
  const homeSource = read('src/views/HomeView.vue')
  const messagesSource = read('src/i18n/messages.ts')

  assert.match(typesSource, /\| 'classification-project'/)
  assert.match(catalogSource, /import \{ classificationProjectModule \} from '\.\/classificationProjectModule'/)

  const housingIndex = catalogSource.indexOf('housingPriceProjectModule,')
  const classificationProjectIndex = catalogSource.indexOf('classificationProjectModule,')
  const lossIndex = catalogSource.indexOf('lossFunctionsModule,')

  assert.ok(classificationProjectIndex > housingIndex, 'classification-project should follow housing-price-project')
  assert.ok(classificationProjectIndex < lossIndex, 'classification-project should come before foundation loss modules')

  assert.match(algorithmViewSource, /slug\.value === 'classification-project'/)
  assert.match(algorithmViewSource, /isClassificationProjectPage/)
  assert.match(homeSource, /classification-project/)
  assert.match(homeSource, /垃圾邮件筛查/)
  assert.match(messagesSource, /classificationProject: \{/)
})

test('classification project covers text vectorization, thresholds, metrics, and review', () => {
  const modulePath = new URL('src/data/classificationProjectModule.ts', root)
  assert.ok(existsSync(modulePath), 'src/data/classificationProjectModule.ts should exist')

  const moduleSource = read('src/data/classificationProjectModule.ts')

  assert.match(moduleSource, /slug: 'classification-project'/)
  assert.match(moduleSource, /route: '\/learn\/classification-project'/)
  assert.equal([...moduleSource.matchAll(/chapter\(\s*'/g)].length, 6)

  for (const id of [
    'problem-and-costs',
    'text-to-features',
    'pipeline-baseline',
    'scores-thresholds',
    'metrics-tradeoffs',
    'error-review',
  ]) {
    assert.match(moduleSource, new RegExp(`chapter\\(\\s*'${id}'`))
  }

  for (const requiredConcept of [
    '垃圾邮件过滤',
    '正类',
    'false positive',
    'false negative',
    'TfidfVectorizer',
    'sparse matrix',
    'Pipeline',
    'train_test_split',
    'stratify',
    'predict_proba',
    'threshold',
    'precision',
    'recall',
    'ROC/AUC',
    'classification_report',
    '错误样本',
    '老师会先问',
  ]) {
    assert.match(moduleSource, new RegExp(escaped(requiredConcept)))
  }

  for (const refId of [
    'REF-SKLEARN-TEXT-FEATURES',
    'REF-SKLEARN-TEXT-GRID-SEARCH',
    'REF-SKLEARN-CLASSIFICATION-METRICS',
    'REF-GOOGLE-MLCC-CLASSIFICATION',
  ]) {
    assert.match(moduleSource, new RegExp(refId))
  }

  assert.doesNotMatch(moduleSource, /https?:\/\//)
  assert.doesNotMatch(moduleSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
})

test('classification project exposes checkpoints, lab stages, and centralized references', () => {
  const checkpointSource = read('src/data/algorithmCheckpoints.ts')
  const labSource = read('src/components/AppliedWorkflowLessonLab.vue')
  const styleSource = read('src/styles/modules/workflow-lessons.css')
  const referenceSource = read('docs/ml-atlas-references.md')

  for (const token of [
    "'classification-project': [",
    'classification-project-vectorizer-leakage',
    'classification-project-threshold-cost',
    'text-to-features',
    'scores-thresholds',
  ]) {
    assert.match(checkpointSource, new RegExp(escaped(token)))
  }

  for (const token of [
    "props.moduleSlug === 'classification-project'",
    'classificationStages',
    'selectedClassificationStage',
    'workflow-lab__pipeline--classification',
    'workflow-lab__focus--classification',
  ]) {
    assert.match(labSource, new RegExp(escaped(token)))
  }

  assert.match(styleSource, /workflow-lab__focus--classification/)
  assert.match(referenceSource, /REF-SKLEARN-TEXT-FEATURES/)
  assert.match(referenceSource, /REF-SKLEARN-TEXT-GRID-SEARCH/)
  assert.match(referenceSource, /REF-SKLEARN-CLASSIFICATION-METRICS/)
  assert.match(referenceSource, /REF-GOOGLE-MLCC-CLASSIFICATION/)
  assert.doesNotMatch(labSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
})
