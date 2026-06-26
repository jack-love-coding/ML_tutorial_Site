import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

function assertFile(path) {
  const fileUrl = new URL(path, root)
  assert.ok(existsSync(fileUrl), `${path} should exist`)
  assert.ok(statSync(fileUrl).isFile(), `${path} should be a file`)
  assert.ok(statSync(fileUrl).size > 0, `${path} should not be empty`)
}

test('classification is registered between logistic regression and MLP', () => {
  const typesSource = read('src/types/ml.ts')
  const catalogSource = read('src/data/moduleCatalog.ts')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')
  const messagesSource = read('src/i18n/messages.ts')

  assert.match(typesSource, /\| 'classification'/)
  assert.match(catalogSource, /import \{ classificationModule \} from '\.\/classificationModule'/)

  const logisticIndex = catalogSource.indexOf('logisticRegressionModule,')
  const classificationIndex = catalogSource.indexOf('classificationModule,')
  const legacyIndex = catalogSource.indexOf('...legacyModuleOrder.filter')
  const mlpIndex = catalogSource.lastIndexOf('mlpModule')
  assert.ok(logisticIndex < classificationIndex, 'classification should follow logistic regression')
  assert.ok(classificationIndex < legacyIndex, 'classification should stay before the legacy filtered modules')
  assert.ok(classificationIndex < mlpIndex, 'classification should stay before MLP')

  assert.match(messagesSource, /classification: \{/)
  assert.match(algorithmViewSource, /ClassificationLessonLab/)
  assert.match(algorithmViewSource, /slug\.value === 'classification'/)
  assert.match(algorithmViewSource, /algorithm-view--classification/)
})

test('classification module declares the full lesson structure and public sources', () => {
  const moduleSource = read('src/data/classificationModule.ts')

  assert.equal([...moduleSource.matchAll(/\bchapter\(\s*'/g)].length, 8)
  for (const id of [
    'scores',
    'thresholds',
    'confusionMatrix',
    'precisionRecall',
    'costTradeoff',
    'rocAuc',
    'biasCalibration',
    'multiclass',
  ]) {
    assert.match(moduleSource, new RegExp(`'${id}'`))
    assert.match(moduleSource, new RegExp(`modules\\.classification\\.sections\\.\\$\\{id\\}\\.title`))
  }

  for (const url of [
    'developers.google.com/machine-learning/crash-course/classification',
    'developers.google.com/machine-learning/crash-course/classification/thresholding',
    'developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall',
    'developers.google.com/machine-learning/crash-course/classification/roc-and-auc',
    'developers.google.com/machine-learning/crash-course/classification/multiclass',
    'scikit-learn.org/stable/modules/model_evaluation.html',
    'd2l.ai/chapter_linear-classification/softmax-regression.html',
  ]) {
    assert.match(moduleSource, new RegExp(url.replaceAll('.', '\\.')))
  }

  assert.match(moduleSource, /CC BY 4\.0/)
  assert.match(moduleSource, /CC BY-SA 4\.0/)

  for (const assetPath of [
    '/classification/generated/threshold-score-ruler.png',
    '/classification/generated/confusion-matrix-outcomes.png',
    '/classification/generated/roc-auc-ranking.png',
    '/classification/generated/prediction-bias-calibration.png',
    '/manim/classification/threshold-sweep.mp4',
    '/manim/classification/confusion-update.mp4',
    '/manim/classification/roc-construction.mp4',
    '/manim/classification/softmax-simplex.mp4',
  ]) {
    assert.match(moduleSource, new RegExp(assetPath.replaceAll('/', '\\/').replaceAll('.', '\\.')))
  }
})

test('classification lesson lab wires D3, Three.js, controls, and source notes', () => {
  const componentSource = read('src/components/ClassificationLessonLab.vue')
  const styleSource = read('src/styles/modules/classification.css')
  const indexStyleSource = read('src/styles/index.css')

  assert.match(componentSource, /import \* as d3 from 'd3'/)
  assert.match(componentSource, /import \* as THREE from 'three'/)
  assert.match(componentSource, /LessonWorkbench/)
  assert.match(componentSource, /classification-lab__visual-grid/)
  assert.match(componentSource, /classification-confusion-grid/)
  assert.match(componentSource, /classification-roc-svg/)
  assert.match(componentSource, /simplexCanvasRef/)
  assert.match(componentSource, /classification-source-list/)

  for (const control of [
    'threshold',
    'prevalence',
    'separability',
    'falsePositiveCost',
    'falseNegativeCost',
    'calibrationShift',
    'temperature',
    'logitA',
    'logitB',
    'logitC',
  ]) {
    assert.match(componentSource, new RegExp(control))
  }

  assert.match(styleSource, /\.classification-lab__visual-grid/)
  assert.match(styleSource, /\.classification-simplex-canvas/)
  assert.match(indexStyleSource, /classification\.css/)
})

test('classification generated images and Manim assets are present', () => {
  for (const assetPath of [
    'public/classification/generated/threshold-score-ruler.png',
    'public/classification/generated/confusion-matrix-outcomes.png',
    'public/classification/generated/roc-auc-ranking.png',
    'public/classification/generated/prediction-bias-calibration.png',
    'public/manim/classification/threshold-sweep.mp4',
    'public/manim/classification/threshold-sweep.svg',
    'public/manim/classification/confusion-update.mp4',
    'public/manim/classification/confusion-update.svg',
    'public/manim/classification/roc-construction.mp4',
    'public/manim/classification/roc-construction.svg',
    'public/manim/classification/softmax-simplex.mp4',
    'public/manim/classification/softmax-simplex.svg',
  ]) {
    assertFile(assetPath)
  }

  const metadata = JSON.parse(read('public/manim/classification/metadata.json'))
  assert.equal(metadata.generatedBy, 'scripts/manim/render_classification.py')
  assert.equal(metadata.scenes.length, 4)
  for (const scene of metadata.scenes) {
    assert.match(scene.assetPath, /^\/manim\/classification\/.+\.mp4$/)
    assert.match(scene.posterPath, /^\/manim\/classification\/.+\.svg$/)
  }
})
