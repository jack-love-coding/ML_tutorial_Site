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

test('tree forest module is registered after model selection', () => {
  const typesSource = read('src/types/ml.ts')
  const catalogSource = read('src/data/moduleCatalog.ts')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')
  const homeSource = read('src/views/HomeView.vue')
  const messagesSource = read('src/i18n/messages.ts')

  assert.match(typesSource, /\| 'tree-forest'/)
  assert.match(catalogSource, /import \{ treeForestModule \} from '\.\/treeForestModule'/)

  const modelSelectionIndex = catalogSource.indexOf('modelSelectionModule,')
  const treeForestIndex = catalogSource.indexOf('treeForestModule,')
  const lossIndex = catalogSource.indexOf('lossFunctionsModule,')

  assert.ok(treeForestIndex > modelSelectionIndex, 'tree-forest should follow model-selection')
  assert.ok(treeForestIndex < lossIndex, 'tree-forest should come before foundation loss modules')

  assert.match(algorithmViewSource, /slug\.value === 'tree-forest'/)
  assert.match(algorithmViewSource, /isTreeForestPage/)
  assert.match(homeSource, /tree-forest/)
  assert.match(homeSource, /决策树/)
  assert.match(messagesSource, /treeForest: \{/)
})

test('tree forest module covers splits, criteria, overfitting, forests, and importance', () => {
  const modulePath = new URL('src/data/treeForestModule.ts', root)
  assert.ok(existsSync(modulePath), 'src/data/treeForestModule.ts should exist')

  const moduleSource = read('src/data/treeForestModule.ts')

  assert.match(moduleSource, /slug: 'tree-forest'/)
  assert.match(moduleSource, /route: '\/learn\/tree-forest'/)
  assert.equal([...moduleSource.matchAll(/chapter\(\s*'/g)].length, 6)

  for (const id of [
    'non-gradient-model',
    'rectangular-splits',
    'split-criteria',
    'depth-overfitting',
    'random-forest',
    'feature-importance',
  ]) {
    assert.match(moduleSource, new RegExp(`chapter\\(\\s*'${id}'`))
  }

  for (const requiredConcept of [
    '决策树',
    'if-then split',
    '矩形区域',
    'Gini',
    'entropy',
    'MSE',
    'max_depth',
    'min_samples_leaf',
    '过拟合',
    'RandomForestClassifier',
    'bootstrap sample',
    'max_features',
    'feature_importances_',
    '重要性不等于因果',
    '老师会先问',
    '想一想',
  ]) {
    assert.match(moduleSource, new RegExp(escaped(requiredConcept)))
  }

  for (const refId of [
    'REF-SKLEARN-TREES',
    'REF-SKLEARN-RANDOM-FOREST',
    'REF-SKLEARN-ENSEMBLE-EXAMPLES',
    'REF-ISLR',
  ]) {
    assert.match(moduleSource, new RegExp(refId))
  }

  assert.doesNotMatch(moduleSource, /https?:\/\//)
  assert.doesNotMatch(moduleSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
})

test('tree forest exposes checkpoints, lab stages, and centralized references', () => {
  const checkpointSource = read('src/data/algorithmCheckpoints.ts')
  const labSource = read('src/components/AppliedWorkflowLessonLab.vue')
  const styleSource = read('src/styles/modules/workflow-lessons.css')
  const referenceSource = read('docs/ml-atlas-references.md')

  for (const token of [
    "'tree-forest': [",
    'tree-forest-depth-overfit',
    'tree-forest-importance-causality',
    'depth-overfitting',
    'feature-importance',
  ]) {
    assert.match(checkpointSource, new RegExp(escaped(token)))
  }

  for (const token of [
    "props.moduleSlug === 'tree-forest'",
    'treeForestStages',
    'selectedTreeForestStage',
    'workflow-lab__pipeline--tree-forest',
    'workflow-lab__focus--tree-forest',
  ]) {
    assert.match(labSource, new RegExp(escaped(token)))
  }

  assert.match(styleSource, /workflow-lab__focus--tree-forest/)
  assert.match(referenceSource, /REF-SKLEARN-TREES/)
  assert.match(referenceSource, /REF-SKLEARN-RANDOM-FOREST/)
  assert.match(referenceSource, /REF-SKLEARN-ENSEMBLE-EXAMPLES/)
  assert.match(referenceSource, /REF-ISLR/)
  assert.doesNotMatch(labSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
})
