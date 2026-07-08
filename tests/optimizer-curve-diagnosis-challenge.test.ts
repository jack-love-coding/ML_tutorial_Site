import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  evaluateOptimizerCurveDiagnosisChallenge,
  optimizerCurveDiagnosisScenarios,
} from '../src/simulations/optimizerCurveDiagnosisChallenge.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('optimizer curve diagnosis covers all required scenario causes', () => {
  assert.deepEqual(optimizerCurveDiagnosisScenarios.map((scenario) => scenario.id), [
    'lr-divergence',
    'small-batch-noise',
    'ravine-zigzag',
    'schedule-plateau',
  ])

  const divergence = evaluateOptimizerCurveDiagnosisChallenge({
    scenarioId: 'lr-divergence',
    prediction: {
      issue: 'learning-rate-too-high',
      nextExperiment: 'lower-learning-rate',
    },
  })
  assert.equal(divergence.evidence.hasNonFiniteLoss, true)
  assert.equal(divergence.result.allCorrect, true)

  const batchNoise = evaluateOptimizerCurveDiagnosisChallenge({
    scenarioId: 'small-batch-noise',
    prediction: {
      issue: 'batch-noise-too-high',
      nextExperiment: 'increase-batch-size',
    },
  })
  assert.ok(batchNoise.evidence.trainVolatility > batchNoise.evidence.validationVolatility)
  assert.equal(batchNoise.result.allCorrect, true)

  const ravine = evaluateOptimizerCurveDiagnosisChallenge({
    scenarioId: 'ravine-zigzag',
    prediction: {
      issue: 'momentum-or-adaptive-needed',
      nextExperiment: 'add-momentum-or-adam',
    },
  })
  assert.ok(ravine.evidence.trainVolatility > 0)
  assert.equal(ravine.result.allCorrect, true)

  const schedule = evaluateOptimizerCurveDiagnosisChallenge({
    scenarioId: 'schedule-plateau',
    prediction: {
      issue: 'schedule-needed',
      nextExperiment: 'add-or-move-lr-decay',
    },
  })
  assert.equal(schedule.evidence.learningRateChanges, 0)
  assert.ok(schedule.evidence.plateauDelta < 0.05)
  assert.equal(schedule.result.allCorrect, true)
})

test('optimizer curve diagnosis normalizes invalid predictions', () => {
  const snapshot = evaluateOptimizerCurveDiagnosisChallenge({
    scenarioId: 'unknown-scenario',
    prediction: {
      issue: 'not-a-real-issue',
      nextExperiment: 'not-a-real-experiment',
    },
  })

  assert.equal(snapshot.scenario.id, 'lr-divergence')
  assert.equal(snapshot.result.issueCorrect, false)
  assert.equal(snapshot.result.experimentCorrect, false)
  assert.equal(snapshot.result.allCorrect, false)
})

test('optimizer curve challenge component gates evidence behind a check action', () => {
  const componentSource = read('src/components/OptimizerCurveDiagnosisChallengeLab.vue')
  assert.match(componentSource, /optimizer-curve-challenge/)
  assert.match(componentSource, /evaluateOptimizerCurveDiagnosisChallenge/)
  assert.match(componentSource, /learning-rate-too-high/)
  assert.match(componentSource, /batch-noise-too-high/)
  assert.match(componentSource, /momentum-or-adaptive-needed/)
  assert.match(componentSource, /schedule-needed/)
  assert.match(componentSource, /hasChecked/)
  assert.match(componentSource, /revealEvidence/)
  assert.match(componentSource, /v-if="hasChecked"/)
  assert.match(componentSource, /setupNote/)
  assert.doesNotMatch(componentSource, /activeScenario\.note/)

  const workflowSource = read('src/components/AppliedWorkflowLessonLab.vue')
  assert.match(workflowSource, /OptimizerCurveDiagnosisChallengeLab/)
  assert.match(workflowSource, /moduleSlug === 'optimizer-comparison'/)
  assert.match(workflowSource, /section\.id === 'curve-diagnosis'/)
})
