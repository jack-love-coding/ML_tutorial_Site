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

test('model selection module is registered after classification project', () => {
  const typesSource = read('src/types/ml.ts')
  const catalogSource = read('src/data/moduleCatalog.ts')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')
  const messagesSource = read('src/i18n/messages.ts')

  assert.match(typesSource, /\| 'model-selection'/)
  assert.match(catalogSource, /import \{ modelSelectionModule \} from '\.\/modelSelectionModule'/)

  const classificationProjectIndex = catalogSource.indexOf('classificationProjectModule,')
  const modelSelectionIndex = catalogSource.indexOf('modelSelectionModule,')
  const lossIndex = catalogSource.indexOf('lossFunctionsModule,')

  assert.ok(modelSelectionIndex > classificationProjectIndex, 'model-selection should follow classification-project')
  assert.ok(modelSelectionIndex < lossIndex, 'model-selection should come before foundation loss modules')

  assert.match(algorithmViewSource, /slug\.value === 'model-selection'/)
  assert.match(algorithmViewSource, /isModelSelectionPage/)
  assert.match(messagesSource, /modelSelection: \{/)
})

test('model selection module covers split variance, CV, leakage, grid search, and final test', () => {
  const modulePath = new URL('src/data/modelSelectionModule.ts', root)
  assert.ok(existsSync(modulePath), 'src/data/modelSelectionModule.ts should exist')

  const moduleSource = read('src/data/modelSelectionModule.ts')

  assert.match(moduleSource, /slug: 'model-selection'/)
  assert.match(moduleSource, /route: '\/learn\/model-selection'/)
  assert.equal([...moduleSource.matchAll(/chapter\(\s*'/g)].length, 6)

  for (const id of [
    'one-split-risk',
    'validation-role',
    'cross-validation',
    'pipeline-leakage',
    'grid-search',
    'final-refit',
  ]) {
    assert.match(moduleSource, new RegExp(`chapter\\(\\s*'${id}'`))
  }

  for (const requiredConcept of [
    '模型选择',
    'train/test split',
    'validation',
    'cross_val_score',
    'K-fold CV',
    'mean',
    'std',
    'Pipeline',
    'StandardScaler',
    '数据泄漏',
    'GridSearchCV',
    'param_grid',
    'mean_test_score',
    'best_params_',
    'best_estimator_',
    '最终测试',
    '老师会先问',
    '想一想',
  ]) {
    assert.match(moduleSource, new RegExp(escaped(requiredConcept)))
  }

  for (const refId of [
    'REF-SKLEARN-CV',
    'REF-SKLEARN-GRIDSEARCHCV',
    'REF-SKLEARN-COMMON-PITFALLS',
    'REF-INRIA-SKLEARN-MOOC',
  ]) {
    assert.match(moduleSource, new RegExp(refId))
  }

  assert.doesNotMatch(moduleSource, /https?:\/\//)
  assert.doesNotMatch(moduleSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
})

test('model selection exposes checkpoints, lab stages, and centralized references', () => {
  const checkpointSource = read('src/data/algorithmCheckpoints.ts')
  const labSource = read('src/components/AppliedWorkflowLessonLab.vue')
  const styleSource = read('src/styles/modules/workflow-lessons.css')
  const referenceSource = read('docs/ml-atlas-references.md')

  for (const token of [
    "'model-selection': [",
    'model-selection-test-peeking',
    'model-selection-pipeline-cv',
    'validation-role',
    'pipeline-leakage',
  ]) {
    assert.match(checkpointSource, new RegExp(escaped(token)))
  }

  for (const token of [
    "props.moduleSlug === 'model-selection'",
    'modelSelectionStages',
    'selectedModelSelectionStage',
    'workflow-lab__pipeline--model-selection',
    'workflow-lab__focus--model-selection',
  ]) {
    assert.match(labSource, new RegExp(escaped(token)))
  }

  assert.match(styleSource, /workflow-lab__focus--model-selection/)
  assert.match(referenceSource, /REF-SKLEARN-CV/)
  assert.match(referenceSource, /REF-SKLEARN-GRIDSEARCHCV/)
  assert.match(referenceSource, /REF-SKLEARN-COMMON-PITFALLS/)
  assert.match(referenceSource, /REF-INRIA-SKLEARN-MOOC/)
  assert.doesNotMatch(labSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
})
