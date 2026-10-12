import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { baseline, rare, conditionalFigures } from '../scripts/generate-conditional-figures.ts'
import { CONDITIONAL_BAYES_EXAMPLE } from '../src/modules/math-lab/data/conditionalBayesExample.ts'
import { evaluateConditionalBayes } from '../src/modules/math-lab/utils/beginnerFoundations.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'

test('conditional figures distinguish the two denominators and keep expected counts exact', () => {
  assert.deepEqual([baseline.spamCount, baseline.notSpamCount, baseline.signalSpamCount, baseline.signalNotSpamCount, baseline.signalCount], [800, 9200, 656, 1104, 1760])
  assert.equal(baseline.signalSpamCount / baseline.spamCount, .82)
  assert.ok(Math.abs(baseline.posteriorSpam - 656 / 1760) < 1e-14)
  assert.deepEqual([rare.signalSpamCount, rare.signalNotSpamCount, rare.signalCount], [82, 1188, 1270])
  assert.ok(Math.abs(rare.posteriorSpam - 82 / 1270) < 1e-14)
  const equalPrior = evaluateConditionalBayes({ ...CONDITIONAL_BAYES_EXAMPLE, priorSpam: .5 })
  assert.ok(Math.abs(equalPrior.posteriorSpam - baseline.ignoredBaseRatePosterior) < 1e-14)
})

test('all selectable lab settings reproduce posterior from the displayed integer counts', () => {
  for (let prior = 1; prior <= 50; prior++) for (let hit = 10; hit <= 98; hit++) for (let falseAlarm = 1; falseAlarm <= 50; falseAlarm++) {
    const e = evaluateConditionalBayes({ populationSize: 10000, priorSpam: prior / 100, signalGivenSpam: hit / 100, signalGivenNotSpam: falseAlarm / 100 })
    assert.ok(Math.abs(e.signalSpamCount / e.signalCount - e.posteriorSpam) < 1e-12)
    assert.ok(Math.abs(e.signalCount / e.populationSize - e.evidence) < 1e-12)
  }
})

test('conditional diagrams and runtime resources stay reproducible and bilingual', () => {
  for (const [name, svg] of conditionalFigures()) assert.equal(readFileSync(new URL('../public/math-lab/diagrams/probability/' + name, import.meta.url), 'utf8'), svg)
  const course = mathLabModuleRegistry['beginner-probability-distributions']!
  for (const id of ['beginner-probability-conditional', 'beginner-probability-bayes']) {
    const section = course.sections.find(section => section.id === id)!
    for (const locale of ['zh-CN', 'en'] as const) assert.match(section.content[locale], /656|0\.3727/)
  }
  const video = course.visuals.find(asset => asset.id === 'beginner-conditional-bayes-video')!
  assert.match(video.transcript.en, /not proportional/)
  assert.match(video.transcript.en, /37.3%/)
})
