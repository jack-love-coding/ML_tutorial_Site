import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { matrix, predictions, rows, matrixFigure } from '../scripts/generate-matrix-figure.ts'
import { predictBatch } from '../src/modules/math-lab/utils/mathToCode.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'

test('matrix figure preserves samples while reducing features, including non-square input', () => {
  assert.deepEqual(rows.map(row => row.contributions), [[8, -3], [4, -4]])
  assert.deepEqual(predictions, [10, 5])
  assert.deepEqual(predictBatch([...matrix].reverse(), [4, -1], 5), [5, 10])
  assert.deepEqual(predictBatch([matrix[0]!], [4, -1], 5), [10])
  assert.throws(() => predictBatch([[2], [3]], [4, -1], 5), /same length/)
})

test('matrix figure is reproducible, used once, and explains axis meanings in both languages', () => {
  assert.equal(readFileSync(new URL('../public/math-lab/diagrams/matrices/batch-prediction.svg', import.meta.url), 'utf8'), matrixFigure())
  const module = mathLabModuleRegistry['beginner-linear-algebra']!
  assert.equal(module.sections.filter(section => section.visualIds?.includes('beginner-matrix-transform-longform')).length, 1)
  const section = module.sections.find(section => section.id === 'beginner-linear-matrix-machine')!
  assert.match(section.content['zh-CN'], /行代表样本/)
  assert.match(section.content.en, /Rows are samples/)
  assert.match(section.content.en, /different contract/)
  assert.equal(module.visuals.find(visual => visual.id === 'beginner-matrix-transform-longform')!.assetPath, '/math-lab/diagrams/matrices/batch-prediction.svg')
})
