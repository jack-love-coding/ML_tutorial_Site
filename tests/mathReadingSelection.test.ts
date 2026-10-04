import '../scripts/register-ts-resolver.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'
import { projectMathReading } from '../src/modules/math-lab/utils/readingSelection.ts'
import { teachingUnits, selectedReadingStep, textbookRouteId } from '../src/curriculum/reading.ts'
import type { MathLabModuleId } from '../src/modules/math-lab/types/mathLab.ts'

test('all math bridges project exactly the selected body, contents and section resources', () => {
  for (const step of teachingUnits[2]!.readings) {
    const module = mathLabModuleRegistry[step.moduleId as MathLabModuleId]
    if (!module || !step.lessonIds) continue
    const original = JSON.stringify(module)
    const selected = projectMathReading(module, step)
    assert.deepEqual(selected.sections.map(section => section.id), step.lessonIds)
    assert.deepEqual(selected.toc.map(section => section.id), step.lessonIds)
    for (const section of selected.sections) {
      for (const id of section.visualIds ?? []) assert.ok(selected.visuals.some(asset => asset.id === id))
      for (const id of section.labIds ?? []) assert.ok(selected.labs.some(lab => lab.id === id))
    }
    assert.equal(JSON.stringify(module), original, 'projection must not mutate the course')
    assert.equal(projectMathReading(module), module)
    assert.equal(selectedReadingStep('invalid', module.id, ''), undefined)
    assert.equal(selectedReadingStep(textbookRouteId, module.id, 'unknown-section'), undefined)
  }
})

test('short bridges keep explicitly selected labs and do not expose hidden sections as supplements', () => {
  const project = (id: MathLabModuleId) => projectMathReading(mathLabModuleRegistry[id], selectedReadingStep(textbookRouteId, id, ''))
  assert.deepEqual(project('calculus-functions-rate-change').labs.map(lab => lab.id), ['prediction-mapping-lab'])
  assert.deepEqual(project('calculus-partial-derivatives-gradients').labs.map(lab => lab.id), ['calculus-partial-derivative-lab'])
  const vectors = project('beginner-linear-algebra')
  assert.deepEqual(vectors.labs, [])
  assert.ok(!vectors.visuals.some(asset => asset.id === 'cosine-similarity-angle-video'))
  assert.ok(!project('calculus-derivatives-local-change').visuals.some(asset => asset.id === 'minimum-derivative-window'))
  assert.ok(mathLabModuleRegistry['beginner-linear-algebra'].labs.length > 0)
})

test('invalid configured sections and labs fail explicitly instead of producing incomplete readings', () => {
  const module = mathLabModuleRegistry['calculus-functions-rate-change']
  assert.throws(() => projectMathReading(module, { moduleId: module.id, lessonIds: ['missing'] }), /Unknown reading section/)
  assert.throws(() => projectMathReading(module, { moduleId: module.id, lessonIds: ['mapping-intuition'], supplementalLabIds: ['missing'] }), /Unknown supplemental lab/)
})
