import '../scripts/register-ts-resolver.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { partialGradientFigure } from '../scripts/generate-partial-gradient-figure.ts'
import { evaluatePartialDerivativePoint, quadraticLoss2D } from '../src/modules/math-lab/utils/calculus.ts'
import { partialGradientStart, partialGradientLevels, quadraticContourPoints, projectPartialPoint, partialVectorEnd } from '../src/modules/math-lab/utils/partialGradientGeometry.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'
import { projectMathReading } from '../src/modules/math-lab/utils/readingSelection.ts'
import { teachingUnits } from '../src/curriculum/reading.ts'

test('contours have the advertised loss and gradients are normal in the displayed coordinates', () => {
  assert.deepEqual(projectPartialPoint({ x: 0, y: 0 }), { x: 180, y: 180 })
  for (const level of partialGradientLevels) {
    const points = quadraticContourPoints(level, 720)
    for (let i = 1; i < points.length - 1; i++) {
      const p = points[i]!, previous = projectPartialPoint(points[i - 1]!), next = projectPartialPoint(points[i + 1]!)
      assert.ok(Math.abs(.72 * p.x ** 2 + .32 * p.x * p.y + .52 * p.y ** 2 - level) < 1e-12)
      const gradient = { x: 1.44 * p.x + .32 * p.y, y: .32 * p.x + 1.04 * p.y }
      const origin = projectPartialPoint(p), tip = projectPartialPoint(partialVectorEnd(p, gradient))
      const gx = tip.x - origin.x, gy = tip.y - origin.y, tx = next.x - previous.x, ty = next.y - previous.y
      const cosine = (gx * tx + gy * ty) / (Math.hypot(gx, gy) * Math.hypot(tx, ty))
      assert.ok(Math.abs(cosine) < .0001, 'a gradient must be perpendicular, including after projection')
    }
  }
  assert.deepEqual(quadraticContourPoints(0), [])
  assert.deepEqual(quadraticContourPoints(NaN), [])
  assert.deepEqual(partialVectorEnd({ x: 0, y: 0 }, { x: 0, y: 0 }), { x: 0, y: 0 })
})

test('lesson operations and finite differences agree with the existing loss calculation', () => {
  const start = evaluatePartialDerivativePoint(partialGradientStart.point)
  assert.ok(Math.abs(start.loss - 1.5476) < 1e-12)
  assert.ok(Math.abs(start.partialX - 1.664) < 1e-12)
  assert.ok(Math.abs(start.partialY + .696) < 1e-12)
  assert.equal(quadraticLoss2D({ x: 1.45, y: -1.1 }).toFixed(3), '1.633')
  assert.equal(quadraticLoss2D({ x: 1.4, y: -1.05 }).toFixed(3), '1.514')
  for (const point of [partialGradientStart.point, { x: -3, y: 3 }, { x: 3, y: -3 }, { x: 0, y: 0 }]) {
    const result = evaluatePartialDerivativePoint(point)
    for (const axis of ['x', 'y'] as const) {
      const finiteDifference = (quadraticLoss2D({ ...point, [axis]: point[axis] + .001 }) - quadraticLoss2D({ ...point, [axis]: point[axis] - .001 })) / .002
      assert.ok(Math.abs(finiteDifference - result.gradient[axis]) < 1e-8)
    }
    const tip = projectPartialPoint(partialVectorEnd(point, result.gradient))
    assert.ok(tip.x >= 0 && tip.x <= 360 && tip.y >= 0 && tip.y <= 360, 'boundary controls must not clip arrows')
  }
})

test('selected reading contains its explanation, figure and lab exactly once, and the SVG is reproducible', () => {
  const module = mathLabModuleRegistry['calculus-partial-derivatives-gradients']
  const step = teachingUnits[2]!.readings.find(step => step.moduleId === module.id)!
  const selected = projectMathReading(module, step)
  assert.equal(selected.sections.length, 2)
  assert.equal(selected.visuals.find(asset => asset.id === 'partial-gradient-image')?.assetPath, '/math-lab/diagrams/partials/gradient-contour.svg')
  assert.equal(module.sections.flatMap(section => section.labIds ?? []).filter(id => id === 'calculus-partial-derivative-lab').length, 1)
  for (const locale of ['zh-CN', 'en'] as const) {
    const text = selected.sections.map(section => section.content[locale]).join('\n')
    for (const value of ['1.548', '1.633', '1.514', '1.664', '-0.696', '/learn/gradient-descent/loss-function?route=core-learning-path']) assert.ok(text.includes(value), value)
  }
  assert.equal(readFileSync(new URL('../public/math-lab/diagrams/partials/gradient-contour.svg', import.meta.url), 'utf8'), partialGradientFigure())
})
