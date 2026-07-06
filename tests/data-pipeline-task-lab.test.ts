import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { buildDataPipelineTaskSnapshot } from '../src/modules/data-lab/utils/pipelineTask.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('safe data pipeline fits preprocessing on train only and exposes matrix shapes', () => {
  const snapshot = buildDataPipelineTaskSnapshot({
    scenarioId: 'safe',
    includeRooms: true,
    includePrice: true,
    includeDistrict: true,
  })

  assert.equal(snapshot.safe, true)
  assert.deepEqual(snapshot.leakageReasons, [])
  assert.deepEqual(snapshot.splitCounts, { train: 4, validation: 1, test: 1 })
  assert.deepEqual(snapshot.fitSources, { scaler: 'train', vocabulary: 'train' })
  assert.deepEqual(snapshot.featureCounts, { numeric: 2, categoricalSlots: 3, total: 5 })
  assert.deepEqual(snapshot.matrixShapes, {
    train: '[4,5]',
    validation: '[1,5]',
    test: '[1,5]',
  })
  assert.ok(snapshot.codeLines.some((line) => line.includes('fit(X_train')))
})

test('unsafe scaler scenario reports leakage and keeps feature shape visible', () => {
  const snapshot = buildDataPipelineTaskSnapshot({
    scenarioId: 'fit-before-split',
    includeRooms: true,
    includePrice: false,
    includeDistrict: false,
  })

  assert.equal(snapshot.safe, false)
  assert.equal(snapshot.fitSources.scaler, 'all')
  assert.equal(snapshot.fitSources.vocabulary, 'none')
  assert.equal(snapshot.featureCounts.total, 1)
  assert.deepEqual(snapshot.matrixShapes, {
    train: '[4,1]',
    validation: '[1,1]',
    test: '[1,1]',
  })
  assert.ok(snapshot.leakageReasons.some((reason) => reason.includes('scaler')))
})

test('unsafe vocabulary scenario reports category leakage', () => {
  const snapshot = buildDataPipelineTaskSnapshot({
    scenarioId: 'vocab-on-all',
    includeRooms: false,
    includePrice: false,
    includeDistrict: true,
  })

  assert.equal(snapshot.safe, false)
  assert.equal(snapshot.fitSources.scaler, 'none')
  assert.equal(snapshot.fitSources.vocabulary, 'all')
  assert.equal(snapshot.featureCounts.numeric, 0)
  assert.equal(snapshot.featureCounts.categoricalSlots, 4)
  assert.equal(snapshot.featureCounts.total, 4)
  assert.ok(snapshot.leakageReasons.some((reason) => reason.includes('vocabulary')))
})

test('data pipeline task lab is wired into numerical data as a lazy Data Lab lab', () => {
  const labPath = 'src/modules/data-lab/labs/DataPipelineTaskLab.vue'
  const componentSource = read(labPath)
  const moduleSource = read('src/modules/data-lab/data/modules.ts')
  const modulePageSource = read('src/modules/data-lab/pages/DataLabModulePage.vue')
  const typeSource = read('src/modules/data-lab/types/dataLab.ts')
  const styleSource = read('src/styles/modules/data-lab.css')

  assert.ok(existsSync(new URL(labPath, root)), `${labPath} should exist`)
  assert.match(componentSource, /buildDataPipelineTaskSnapshot/)
  assert.match(componentSource, /split \/ fit \/ transform/i)
  assert.match(componentSource, /\[B,F\]/)
  assert.match(componentSource, /data-pipeline-task-lab__scenarios/)
  assert.match(typeSource, /DataPipelineTaskLab/)
  assert.match(modulePageSource, /DataPipelineTaskLab: defineAsyncComponent/)
  assert.match(moduleSource, /data-pipeline-task-lab/)
  assert.match(moduleSource, /split \/ fit \/ transform/)
  assert.match(moduleSource, /labIds: \['pandas-pipeline-lab', 'data-pipeline-task-lab'\]/)
  assert.match(styleSource, /data-pipeline-task-lab__readouts/)
})
