import test from 'node:test'
import assert from 'node:assert/strict'
import { dataLabModules } from '../src/modules/data-lab/data/modules.ts'
import { buildDataPipelineTaskSnapshot } from '../src/modules/data-lab/utils/pipelineTask.ts'
import { curveEpochs, generalizationCurves, generalizationCurveSnapshot } from '../src/modules/data-lab/utils/generalizationCurves.ts'

test('every Data Lab section resolves its actual visuals and labs', () => {
  for (const module of dataLabModules) for (const section of module.sections) {
    for (const id of section.visualIds ?? []) assert.ok(module.visuals.some(asset => asset.id === id), `${module.id}/${section.id}: missing ${id}`)
    for (const id of section.labIds ?? []) assert.ok(module.labs.some(lab => lab.id === id), `${module.id}/${section.id}: missing ${id}`)
  }
  const splits = dataLabModules.find(module => module.id === 'splits-generalization')!
  assert.equal(splits.labs[0]?.componentName, 'DataPipelineTaskLab')
  assert.deepEqual(splits.sections.find(section => section.id === 'fit-transform-rule')?.labIds, [splits.labs[0]!.id])
  const complexity = dataLabModules.find(module => module.id === 'complexity-regularization')!
  assert.equal(complexity.labs[0]?.componentName, 'GeneralizationCurveLab')
})

test('the leakage figure computes its worked example from the same rows as the lab', () => {
  const config = { includeRooms: true, includePrice: true, includeDistrict: true }
  const safe = buildDataPipelineTaskSnapshot({ ...config, scenarioId: 'safe' })
  const unsafe = buildDataPipelineTaskSnapshot({ ...config, scenarioId: 'fit-before-split' })
  assert.equal(safe.scalerStats[0]?.mean, 2.5)
  assert.ok(Math.abs(safe.scalerStats[0]!.transformedValidation - 1 / Math.sqrt(5)) < 1e-12)
  assert.equal(unsafe.scalerStats[0]?.mean, 3)
  assert.equal(unsafe.scalerStats[0]?.transformedValidation, 0)
  assert.deepEqual(safe.vocabulary, ['north', 'south', 'west'])
  assert.deepEqual(safe.matrixShapes, unsafe.matrixShapes, 'equal shape does not prove no leakage')
  const code = unsafe.codeLines.join('\n')
  assert.ok(code.indexOf('scaler.fit(raw_rows') < code.indexOf('= split('))
  assert.match(code, /encoder.fit\(X_train/)
  const vocabLeak = buildDataPipelineTaskSnapshot({ ...config, scenarioId: 'vocab-on-all' })
  assert.deepEqual(vocabLeak.vocabulary, ['east', 'north', 'south', 'west'])
  assert.match(vocabLeak.codeLines.join('\n'), /scaler.fit\(X_train/)
  assert.match(vocabLeak.codeLines.join('\n'), /encoder.fit\(raw_rows/)
  const empty = buildDataPipelineTaskSnapshot({ scenarioId: 'safe', includeRooms: false, includePrice: false, includeDistrict: false })
  assert.deepEqual(empty.scalerStats, [])
  assert.deepEqual(empty.vocabulary, [])
  assert.ok(!empty.codeLines.some(line => line.includes('.fit(')))
})

test('curve plots and explanations share finite comparable data and the validation minimum', () => {
  for (const [key, series] of Object.entries(generalizationCurves)) {
    for (const values of Object.values(series)) {
      assert.equal(values.length, curveEpochs.length)
      assert.ok(values.every(value => Number.isFinite(value) && value >= 0 && value <= 1.2))
    }
    const snapshot = generalizationCurveSnapshot(key as keyof typeof generalizationCurves, 5)
    assert.equal(snapshot.validation, series.validation[5])
    assert.equal(snapshot.bestEpoch, curveEpochs[series.validation.indexOf(Math.min(...series.validation))])
  }
  const at30 = generalizationCurveSnapshot('overfit', 3)
  const at50 = generalizationCurveSnapshot('overfit', 5)
  assert.equal(at30.bestEpoch, 30)
  assert.equal(at30.train, .18)
  assert.equal(at30.validation, .35)
  assert.equal(at50.train, .04)
  assert.equal(at50.validation, .70)
  assert.equal(generalizationCurveSnapshot('overfit', Number.NaN).index, 0)
  assert.equal(generalizationCurveSnapshot('overfit', 999).index, 5)
  assert.equal(generalizationCurveSnapshot('overfit', -1).index, 0)
})
