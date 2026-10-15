import '../scripts/register-ts-resolver.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { categoricalEncodingExample, categoricalEncodingPython, type EncodingConfig } from '../src/modules/data-lab/utils/categoricalEncodingLesson.ts'
import { buildCategoricalVocabularyTaskSnapshot } from '../src/modules/data-lab/utils/categoricalVocabularyTask.ts'
import { dataLabModuleRegistry } from '../src/modules/data-lab/data/modules.ts'
import { categoricalFigures } from '../scripts/generate-categorical-figures.ts'

test('known, rare and OOV examples share the previous task vocabulary and fixed prediction slots', () => {
  const previous = buildCategoricalVocabularyTaskSnapshot({ scenarioId: 'safe-train-vocab', includeDistrict: true, includePropertyType: false, includeRecordId: false, rareThreshold: 2 })
  const tokens = ['north', 'south', '<RARE>', '<OOV>']
  assert.deepEqual(previous.trainVocabulary[0]!.tokens, tokens)
  for (const [district, active] of [['north', 0], ['south', 1], ['west', 2], ['airport', 3]] as const) {
    const example = categoricalEncodingExample({ district })
    assert.deepEqual(example.tokens, tokens)
    assert.deepEqual(example.active, [active])
    assert.equal(example.vector.reduce((a, b) => a + b, 0), 1)
  }
  assert.deepEqual(categoricalEncodingExample({ district: 'west', minFrequency: 1 }).mapped, ['west'])
  const cross = categoricalEncodingExample({ mode: 'cross' })
  assert.equal(cross.vector.length, 16)
  assert.deepEqual(cross.active, [5])
  assert.equal(cross.tokens[5], 'south×condo')
  assert.deepEqual(categoricalEncodingExample({ mode: 'multi-hot', tags: [] }).active, [])
  assert.deepEqual(categoricalEncodingExample({ mode: 'multi-hot', tags: ['roof', 'roof'] }).mapped, ['<OOV>'])
  assert.deepEqual(categoricalEncodingExample({ mode: 'hash', district: 'north', bucketCount: 4 }).vector, categoricalEncodingExample({ mode: 'hash', district: 'airport', bucketCount: 4 }).vector)
})

test('displayed Python reproduces browser tokens and vectors across all fitting controls and modes', () => {
  const cases: Partial<EncodingConfig>[] = []
  for (const minFrequency of [1, 2, 3]) for (const maxCategories of [2, 3, 4, 5, 6]) for (const district of ['north', 'south', 'west', 'harbor', 'airport', 'island']) {
    cases.push({ mode: 'one-hot', minFrequency, maxCategories, district })
    for (const propertyType of ['apartment', 'condo', 'house', 'loft', 'townhouse']) cases.push({ mode: 'cross', minFrequency, maxCategories, district, propertyType })
  }
  for (let bucketCount = 4; bucketCount <= 16; bucketCount++) for (const district of ['north', 'south', 'west', 'airport']) cases.push({ mode: 'hash', bucketCount, district })
  for (const tags of [[], ['subway', 'school'], ['roof'], ['roof', 'roof', 'gym'], ['park', 'parking', 'pet']]) cases.push({ mode: 'multi-hot', tags })
  const result = spawnSync('python3', ['-c', 'import json, sys\nfor snippet in json.load(sys.stdin):\n    exec(snippet, {})'], { input: JSON.stringify(cases.map(categoricalEncodingPython)), encoding: 'utf8', timeout: 20000, maxBuffer: 4 * 1024 * 1024 })
  assert.equal(result.status, 0, result.stderr)
  const outputs = result.stdout.trim().split('\n').map(line => JSON.parse(line))
  assert.equal(outputs.length, cases.length)
  cases.forEach((config, index) => {
    const { tokens, vector } = categoricalEncodingExample(config)
    assert.deepEqual(outputs[index], { tokens, vector }, JSON.stringify(config))
  })
})

test('categorical figures are reproducible and each lesson resource has one teaching location', () => {
  for (const [name, svg] of categoricalFigures()) assert.equal(readFileSync(new URL('../public/data-lab/diagrams/categorical/' + name, import.meta.url), 'utf8'), svg)
  const module = dataLabModuleRegistry['categorical-data']
  for (const lab of module.labs) assert.equal(module.sections.filter(section => section.labIds?.includes(lab.id)).length, 1)
  for (const id of ['categorical-vocabulary', 'categorical-sparsity']) {
    assert.equal(module.sections.filter(section => section.visualIds?.includes(id)).length, 1)
    assert.equal(module.visuals.find(asset => asset.id === id)?.layout, 'compact')
  }
  for (const locale of ['zh-CN', 'en'] as const) {
    const text = module.sections.find(section => section.id === 'vocabulary-contract')!.content[locale]
    for (const term of ['north', 'west', 'airport', 'RARE', 'OOV', "handle_unknown='ignore'"]) assert.ok(text.includes(term))
  }
})
