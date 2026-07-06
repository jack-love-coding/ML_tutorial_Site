import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import {
  buildCategoricalVocabularyTaskSnapshot,
  type CategoricalVocabularyTaskConfig,
} from '../src/modules/data-lab/utils/categoricalVocabularyTask.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

function buildSnapshot(config: Partial<CategoricalVocabularyTaskConfig> = {}) {
  return buildCategoricalVocabularyTaskSnapshot({
    scenarioId: 'safe-train-vocab',
    includeDistrict: true,
    includePropertyType: false,
    includeRecordId: false,
    rareThreshold: 2,
    ...config,
  })
}

test('safe categorical vocabulary task reuses train slots with stable rare and OOV handling', () => {
  const snapshot = buildSnapshot()
  const districtVocabulary = snapshot.trainVocabulary.find((item) => item.feature === 'district')
  const validationRow = snapshot.transformRows.find((row) => row.split === 'validation')
  const rareTrainRow = snapshot.transformRows.find((row) => row.raw.district === 'west')

  assert.equal(snapshot.safe, true)
  assert.deepEqual(snapshot.warnings, [])
  assert.equal(snapshot.fitSource, 'train')
  assert.equal(snapshot.slotAlignment.every((slot) => slot.aligned), true)
  assert.deepEqual(districtVocabulary?.tokens, ['north', 'south', '<RARE>', '<OOV>'])
  assert.deepEqual(districtVocabulary?.rareValues, ['west'])
  assert.equal(rareTrainRow?.mapped.district, '<RARE>')
  assert.equal(validationRow?.mapped.district, '<OOV>')
  assert.ok(validationRow?.activeSlots.includes('district:<OOV>'))
  assert.deepEqual(snapshot.featureCounts, { selectedFeatures: 1, categoricalSlots: 4, total: 4 })
  assert.deepEqual(snapshot.matrixShapes, {
    train: '[5,4]',
    validation: '[1,4]',
    test: '[1,4]',
    serving: '[1,4]',
  })
})

test('validation recompute scenario reports slot drift against train vocabulary', () => {
  const snapshot = buildSnapshot({
    scenarioId: 'validation-recomputed',
    rareThreshold: 1,
  })

  assert.equal(snapshot.safe, false)
  assert.equal(snapshot.fitSource, 'validation')
  assert.ok(snapshot.warnings.some((warning) => warning.includes('validation vocabulary')))
  assert.ok(snapshot.slotAlignment.some((slot) => !slot.aligned))
  assert.ok(
    snapshot.slotAlignment.some((slot) => slot.trainSlot === 'district:north' && slot.validationSlot === 'district:harbor'),
  )
})

test('all-data vocabulary scenario reports leakage from held-out categories', () => {
  const snapshot = buildSnapshot({
    scenarioId: 'all-data-vocab',
    rareThreshold: 1,
  })
  const districtVocabulary = snapshot.trainVocabulary.find((item) => item.feature === 'district')

  assert.equal(snapshot.safe, false)
  assert.equal(snapshot.fitSource, 'all')
  assert.ok(snapshot.warnings.some((warning) => warning.includes('leaks validation/test categories')))
  assert.ok(districtVocabulary?.tokens.includes('harbor'))
  assert.ok(districtVocabulary?.tokens.includes('airport'))
})

test('high-cardinality ID scenario reports memorization risk and shape growth', () => {
  const withoutId = buildSnapshot({ scenarioId: 'safe-train-vocab', rareThreshold: 1 })
  const withId = buildSnapshot({
    scenarioId: 'id-high-cardinality',
    includeRecordId: true,
    rareThreshold: 1,
  })

  assert.equal(withId.safe, false)
  assert.ok(withId.warnings.some((warning) => warning.includes('high-cardinality ID')))
  assert.ok(withId.featureCounts.total > withoutId.featureCounts.total)
  assert.ok(withId.trainVocabulary.some((item) => item.feature === 'recordId'))
})

test('categorical vocabulary task lab is wired into categorical data as a lazy Data Lab lab', () => {
  const labPath = 'src/modules/data-lab/labs/CategoricalVocabularyTaskLab.vue'
  const componentSource = read(labPath)
  const moduleSource = read('src/modules/data-lab/data/modules.ts')
  const modulePageSource = read('src/modules/data-lab/pages/DataLabModulePage.vue')
  const typeSource = read('src/modules/data-lab/types/dataLab.ts')
  const styleSource = read('src/styles/modules/data-lab.css')

  assert.ok(existsSync(new URL(labPath, root)), `${labPath} should exist`)
  assert.match(componentSource, /buildCategoricalVocabularyTaskSnapshot/)
  assert.match(componentSource, /Vocabulary Contract Task Lab/)
  assert.match(componentSource, /\[B,F\]/)
  assert.match(componentSource, /categorical-vocabulary-task-lab__scenarios/)
  assert.match(typeSource, /CategoricalVocabularyTaskLab/)
  assert.match(modulePageSource, /CategoricalVocabularyTaskLab: defineAsyncComponent/)
  assert.match(moduleSource, /categorical-vocabulary-task-lab/)
  assert.match(moduleSource, /词表契约任务实验/)
  assert.match(
    moduleSource,
    /labIds: \['categorical-vocabulary-task-lab', 'categorical-encoding-lab'\]/,
  )
  assert.match(styleSource, /categorical-vocabulary-task-lab__slot-map/)
})
