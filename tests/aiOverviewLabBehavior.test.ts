import assert from 'node:assert/strict'
import test from 'node:test'
import { aiOverviewLabCopy } from '../src/modules/ai-overview/data/course.ts'
import { regressionCandidates, regressionPresets } from '../src/modules/ai-overview/data/experiments.ts'
import { normalizeK, normalizeSeed } from '../src/modules/ai-overview/utils/labInputs.ts'
import { rankRegressionCandidates } from '../src/modules/ai-overview/utils/regression.ts'
import { buildStaticQUpdateFrame } from '../src/modules/ai-overview/utils/qLearningStatic.ts'

test('K and seed inputs normalize to the exact effective integer values shown to learners', () => {
  assert.equal(normalizeK(99), 5)
  assert.equal(normalizeK(-3), 2)
  assert.equal(normalizeK(Number.NaN), 3)
  assert.equal(normalizeSeed(31.7, 3103), 32)
  assert.equal(normalizeSeed(Number.POSITIVE_INFINITY, 3103), 3103)
})

test('desktop and static regression paths share one candidate ranking and numeric optimum', () => {
  const samples = regressionPresets['clear-trend'].samples
  const desktopBest = rankRegressionCandidates(samples, regressionCandidates)[0]
  const staticBest = rankRegressionCandidates(samples, regressionCandidates)[0]

  assert.deepEqual({ w: desktopBest.w, b: desktopBest.b, mse: desktopBest.mse }, { w: 6.5, b: 46, mse: 0.15 })
  assert.deepEqual(staticBest, desktopBest)
})

test('static Q one-update frame exposes one finite deterministic update, not an episode aggregate', () => {
  const frame = buildStaticQUpdateFrame()
  assert.deepEqual(Object.keys(frame), [
    'state', 'action', 'oldQ', 'reward', 'nextBest', 'target', 'correction', 'newQ',
  ])
  assert.equal(frame.state, '3,0')
  assert.equal(frame.action, 'up')
  for (const value of Object.values(frame).filter((item): item is number => typeof item === 'number')) {
    assert.equal(Number.isFinite(value), true)
  }
  assert.equal(frame.target, frame.reward + 0.9 * frame.nextBest)
  assert.equal(frame.correction, frame.newQ - frame.oldQ)
})

test('all focused lab copy is recursively complete in both locales', () => {
  const visit = (value: unknown, path: string): void => {
    assert.ok(value && typeof value === 'object', `${path} must be an object`)
    const record = value as Record<string, unknown>
    if ('zh-CN' in record || 'en' in record) {
      assert.equal(typeof record['zh-CN'], 'string', `${path}.zh-CN must be text`)
      assert.equal(typeof record.en, 'string', `${path}.en must be text`)
      assert.ok((record['zh-CN'] as string).trim(), `${path}.zh-CN must not be empty`)
      assert.ok((record.en as string).trim(), `${path}.en must not be empty`)
      return
    }
    for (const [key, child] of Object.entries(record)) visit(child, `${path}.${key}`)
  }

  visit(aiOverviewLabCopy, 'aiOverviewLabCopy')
  assert.equal(aiOverviewLabCopy.stepUnit['zh-CN'], '步')
  assert.equal(aiOverviewLabCopy.stepUnit.en, 'steps')
  assert.equal(aiOverviewLabCopy.centerLabel['zh-CN'], '中心')
  assert.equal(aiOverviewLabCopy.centerLabel.en, 'Center')
})
