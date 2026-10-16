import '../scripts/register-ts-resolver.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { probabilityReadingFigures } from '../scripts/generate-probability-reading-figures.ts'
import { calibrationExample, distributionMoments, observedFrequency, probabilitySamples, probabilitySamplingOutput, softmaxExample, spreadExamples } from '../src/modules/math-lab/utils/probabilityReadingExamples.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'

test('probability figure values agree with independent NumPy sampling and softmax arithmetic', () => {
  const result = spawnSync('python3', ['-c', `import json,numpy as np
z=np.array([1.5,0.3,-0.8]);p=np.exp(z)/np.exp(z).sum()
samples=np.random.default_rng(7).choice([0,1],size=12,p=[.3,.7])
print(json.dumps(dict(probabilities=p.tolist(),loss=float(-np.log(p[2])),samples=samples.tolist())))`], { encoding: 'utf8', timeout: 20000 })
  assert.equal(result.status, 0, result.stderr)
  const expected = JSON.parse(result.stdout)
  assert.deepEqual(probabilitySamples, expected.samples)
  assert.equal(observedFrequency, .75)
  softmaxExample.probabilities.forEach((p, i) => assert.ok(Math.abs(p - expected.probabilities[i]) < 1e-14))
  assert.ok(Math.abs(softmaxExample.loss - expected.loss) < 1e-14)
  assert.equal(mathLabModuleRegistry['beginner-probability-distributions']!.concepts.find(c => c.id === 'beginner-distribution')!.codeOutput!.en, probabilitySamplingOutput)
})

test('spread and calibration examples identify their populations and valid numerical quantities', () => {
  assert.deepEqual(spreadExamples.map(({ mean, variance }) => ({ mean, variance })), [{ mean: 2, variance: 1 }, { mean: 2, variance: 4 }])
  assert.equal(calibrationExample.count, 10)
  assert.equal(calibrationExample.correct, 6)
  assert.equal(calibrationExample.accuracy, .6)
  assert.ok(Math.abs(calibrationExample.confidence - .9) < 1e-14)
  for (const [values, probabilities] of [[[], []], [[1], [.5]], [[NaN], [1]], [[1, 2], [2, -1]]]) assert.throws(() => distributionMoments(values!, probabilities!))
})

test('compact probability SVGs are reproducible, with readable labels and complete native bilingual explanations', () => {
  const module = mathLabModuleRegistry['beginner-probability-distributions']!
  assert.equal(module.sections.length, 12)
  const figures = probabilityReadingFigures()
  assert.equal(Object.keys(figures).length, 6)
  for (const [filename, svg] of Object.entries(figures)) {
    assert.equal(readFileSync(new URL(`../public/math-lab/diagrams/probability/${filename}`, import.meta.url), 'utf8'), svg)
    assert.match(svg, /viewBox="0 0 360 /)
    assert.ok([...svg.matchAll(/font-size="(\d+)"/g)].every(m => Number(m[1]) >= 20))
    const asset = module.visuals.find(asset => asset.assetPath?.endsWith('/' + filename))!
    assert.ok(asset)
    assert.equal(module.sections.filter(section => section.visualIds?.includes(asset.id)).length, 1)
    for (const locale of ['zh-CN', 'en'] as const) assert.ok(asset.caption![locale].length > 80)
  }
  const intro = module.visuals.find(v => v.id === 'beginner-probability-story')!
  assert.ok(intro.legacyAnchorIds?.includes('beginner-probability-why-longform'))
  assert.equal(module.visuals.filter(v => v.id === 'beginner-probability-why-longform').length, 0)
  assert.match(module.concepts.find(c => c.id === 'beginner-calibration')!.formulaLatex, /Y=\\hat Y/)
})
