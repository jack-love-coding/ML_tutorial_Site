import '../scripts/register-ts-resolver.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { vectorReadingFigures } from '../scripts/generate-vector-reading-figures.ts'
import { MATH_TO_CODE_SAMPLES, DEFAULT_PARAMETERS } from '../src/modules/math-lab/data/mathToCode/sharedTask.ts'
import { predictBatch } from '../src/modules/math-lab/utils/mathToCode.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'
import { readingContext, selectedReadingStep, teachingUnits, textbookRouteId } from '../src/curriculum/reading.ts'
import { mathVisualLessonAnchors, projectMathReading } from '../src/modules/math-lab/utils/readingSelection.ts'

test('vector examples preserve ordered features, row shapes and predictions independently in NumPy', () => {
  const result = spawnSync('python3', ['-c', `import json,numpy as np
X=np.array([[2,3],[1,4]]);w=np.array([4,-1]);b=5
print(json.dumps(dict(difference=(X[1]-X[0]).tolist(),shape=list(X.shape),row=list(X[0].shape),slice=list(X[:1].shape),predictions=(X@w+b).tolist(),transposed=(X.T@w+b).tolist(),three_rows=(np.vstack([X,[3,2]])@w+b).tolist())))`], { encoding: 'utf8', timeout: 20000 })
  assert.equal(result.status, 0, result.stderr)
  const expected = JSON.parse(result.stdout)
  const matrix = MATH_TO_CODE_SAMPLES.map(sample => sample.features)
  assert.deepEqual(matrix, [[2, 3], [1, 4]])
  assert.deepEqual(matrix[1]!.map((value, i) => value - matrix[0]![i]!), expected.difference)
  assert.deepEqual(expected.shape, [2, 2])
  assert.deepEqual(expected.row, [2])
  assert.deepEqual(expected.slice, [1, 2])
  assert.deepEqual(predictBatch(matrix, DEFAULT_PARAMETERS.weights, DEFAULT_PARAMETERS.bias), expected.predictions)
  assert.deepEqual(expected.predictions, [10, 5])
  assert.notDeepEqual(expected.transposed, expected.predictions)
  assert.deepEqual(predictBatch([...matrix, [3, 2]], DEFAULT_PARAMETERS.weights, DEFAULT_PARAMETERS.bias), expected.three_rows)
  const code = mathLabModuleRegistry['beginner-linear-algebra']!.concepts.find(concept => concept.id === 'beginner-feature-vector')!
  const reference = spawnSync('python3', ['-c', code.codeExample!], { encoding: 'utf8', timeout: 20000 })
  assert.equal(reference.status, 0, reference.stderr)
  assert.equal(reference.stdout.trim(), code.codeOutput!.en)
})

test('vector reading figures are reproducible, explained bilingually, and appear once with compatible anchors', () => {
  const module = mathLabModuleRegistry['beginner-linear-algebra']!
  const selected = teachingUnits.flatMap(unit => unit.readings).find(step => step.moduleId === module.id)!.lessonIds!
  assert.equal(selected.length, 4)
  const assets = module.sections.filter(section => selected.includes(section.id)).flatMap(section => section.visualIds ?? [])
  assert.deepEqual(assets, ['beginner-linear-algebra-story', 'beginner-linear-shape-ledger', 'beginner-matrix-transform-longform'])
  for (const [filename, svg] of Object.entries(vectorReadingFigures())) {
    assert.equal(readFileSync(new URL('../public/math-lab/diagrams/matrices/' + filename, import.meta.url), 'utf8'), svg)
    assert.match(svg, /viewBox="0 0 360 /)
    assert.ok([...svg.matchAll(/font-size="(\d+)"/g)].every(match => Number(match[1]) >= 20))
    const asset = module.visuals.find(asset => asset.assetPath?.endsWith('/' + filename))!
    assert.ok(asset)
    assert.equal(module.sections.filter(section => section.visualIds?.includes(asset.id)).length, 1)
    for (const locale of ['zh-CN', 'en'] as const) assert.ok(asset.caption![locale].length > 100)
  }
  const anchors = module.visuals.flatMap(asset => [asset.id, ...asset.legacyAnchorIds ?? []])
  assert.equal(anchors.length, new Set(anchors).size)
  for (const id of ['linear-algebra-feature-cards', 'beginner-vector-feature-space-longform', 'beginner-vector-feature-space-longform--minimum-linear-shape-ledger']) assert.ok(anchors.includes(id))
  assert.equal(module.sections.length, 8)
  assert.deepEqual(module.labs.map(lab => lab.id), ['beginner-feature-vector-story-lab', 'beginner-vector-similarity-lab'])
  assert.equal(module.concepts.find(concept => concept.id === 'beginner-feature-vector')!.codeOutput!.en, 'x.shape = (2,)\nX.shape = (2, 2)\npredictions = [10.0, 5.0]\npredictions.shape = (2,)')
  const codeIds = module.sections.flatMap(section => section.codeConceptIds ?? [])
  assert.deepEqual(codeIds, ['beginner-feature-vector'])
  for (const id of codeIds) assert.ok(module.concepts.find(concept => concept.id === id)?.codeExample)
  assert.deepEqual(projectMathReading(module, { moduleId: module.id, lessonIds: selected }).sections.find(section => section.id === 'minimum-linear-batch-output')!.codeConceptIds, codeIds)
})

test('visual links retain their selected reading while unknown anchors and full-topic links keep their fallback', () => {
  const module = mathLabModuleRegistry['beginner-linear-algebra']!
  for (const anchor of ['beginner-linear-algebra-story', 'linear-algebra-feature-cards', 'beginner-vector-feature-space-longform', 'beginner-vector-feature-space-longform--minimum-linear-shape-ledger']) {
    const lesson = mathVisualLessonAnchors(module)[anchor]
    assert.equal(lesson, anchor.endsWith('--minimum-linear-shape-ledger') ? 'minimum-linear-shape-ledger' : 'beginner-linear-data-vector')
    const step = selectedReadingStep(textbookRouteId, module.id, anchor)
    assert.equal(projectMathReading(module, step).sections.length, 4)
    assert.equal(selectedReadingStep(undefined, module.id, anchor), undefined)
    const context = readingContext(textbookRouteId, '/math-lab/modules/' + module.id, '#' + anchor)!
    assert.equal(context.lesson.lessonId, lesson)
    assert.equal(context.next?.lessonId, lesson === 'minimum-linear-shape-ledger' ? 'beginner-linear-matrix-machine' : 'minimum-linear-shape-ledger')
  }
  assert.equal(selectedReadingStep(textbookRouteId, module.id, 'unknown'), undefined)
  assert.equal(selectedReadingStep('unknown-route', module.id, 'beginner-linear-algebra-story'), undefined)
  const repeat = structuredClone(module)
  repeat.sections[1]!.visualIds = ['beginner-linear-algebra-story']
  assert.equal(mathVisualLessonAnchors(repeat)['beginner-linear-algebra-story--minimum-linear-shape-ledger'], 'minimum-linear-shape-ledger')
})
