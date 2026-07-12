import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { aiOverviewVisualCopy } from '../src/modules/ai-overview/data/course.ts'

const root = process.cwd()
const labsDirectory = join(root, 'src/modules/ai-overview/labs')
const source = (fileName: string) => readFileSync(join(labsDirectory, fileName), 'utf8')

test('compatibility shell delegates chapter rendering to AiOverviewChapterLab', () => {
  const shell = readFileSync(join(root, 'src/components/AiOverviewLessonLab.vue'), 'utf8')
  assert.match(shell, /import AiOverviewChapterLab from ['"]\.\.\/modules\/ai-overview\/labs\/AiOverviewChapterLab\.vue['"]/)
  assert.match(shell, /<AiOverviewChapterLab\s+:section="section"/)
})

test('chapter router maps the three algorithm chapters and preserves concept visuals', () => {
  const router = source('AiOverviewChapterLab.vue')
  for (const fileName of ['RegressionLab.vue', 'KMeansLab.vue', 'QLearningLab.vue', 'AlgorithmStaticFallback.vue']) {
    assert.match(router, new RegExp(fileName.replace('.', '\\.')))
  }
  assert.match(router, /supervised-linear-regression/)
  assert.match(router, /unsupervised-kmeans/)
  assert.match(router, /reinforcement-q-learning/)
  assert.match(router, /typeof window !== ['"]undefined['"]|typeof window === ['"]undefined['"]/)
  assert.match(router, /matchMedia\(['"]\(max-width: 760px\)['"]\)/)
  assert.match(router, /prefers-reduced-motion: reduce/)
  assert.match(router, /@media \(max-width:760px\)/)
  assert.match(router, /onBeforeUnmount/)
})

test('regression lab uses shared math and exposes complete labeled controls', () => {
  const regressionSource = source('RegressionLab.vue')
  assert.match(regressionSource, /from ['"]\.\.\/utils\/regression(?:\.ts)?['"]/)
  assert.match(regressionSource, /meanSquaredError/)
  assert.match(regressionSource, /regressionRows/)
  assert.match(regressionSource, /rankRegressionCandidates/)
  assert.match(regressionSource, /\[\.\.\.ranked\.value\]\.reverse\(\)/)
  assert.match(regressionSource, /regressionPresets/)
  assert.match(regressionSource, /regressionCandidates/)
  assert.match(regressionSource, /clear-trend/)
  assert.match(regressionSource, /onBeforeUnmount/)
  for (const token of ['type="range"', 'currentValue', 'reset', 'pause', 'residual']) {
    assert.match(regressionSource, new RegExp(token))
  }
})

test('K-means lab replays shared deterministic history with accessible controls', () => {
  const kmeansSource = source('KMeansLab.vue')
  assert.match(kmeansSource, /from ['"]\.\.\/utils\/kmeans(?:\.ts)?['"]/)
  assert.match(kmeansSource, /runKMeans/)
  assert.match(kmeansSource, /history/)
  assert.match(kmeansSource, /withinGroupDistanceTotal/)
  assert.match(kmeansSource, /onBeforeUnmount/)
  assert.match(kmeansSource, /type="number"/)
  assert.match(kmeansSource, /normalizeK/)
  assert.match(kmeansSource, /normalizeSeed/)
  assert.match(kmeansSource, /aiOverviewLabCopy\.centerLabel/)
  assert.doesNotMatch(kmeansSource, /`Center \$\{index \+ 1\}`/)
  assert.match(kmeansSource, /reset/)
  assert.match(kmeansSource, /pause/)
})

test('Q-learning lab uses episode utilities and exposes policy plus full table', () => {
  const qLearningSource = source('QLearningLab.vue')
  assert.match(qLearningSource, /from ['"]\.\.\/utils\/qLearning(?:\.ts)?['"]/)
  assert.match(qLearningSource, /stepQLearningSession/)
  assert.match(qLearningSource, /runEpisode/)
  assert.match(qLearningSource, /structuredClone\(qTable\.value\)/)
  assert.doesNotMatch(qLearningSource, /trainEpisodes/)
  assert.match(qLearningSource, /createSeededRandom\(effectiveSeed\.value\)/)
  assert.match(qLearningSource, /aiOverviewLabCopy\.actions\[action\]/)
  assert.match(qLearningSource, /result\.reachedGoal/)
  assert.match(qLearningSource, /currentState\.value = \{ \.\.\.qLearningEnvironment\.start \}/)
  assert.match(qLearningSource, /episodeStep/)
  assert.match(qLearningSource, /lastUpdate/)
  assert.match(qLearningSource, /aiOverviewLabCopy\.stepUnit/)
  assert.doesNotMatch(qLearningSource, /\$\{evaluation\.steps\} steps/)
  assert.doesNotMatch(qLearningSource, /\{\{\s*action\s*\}\}/)
  assert.match(qLearningSource, /explorationRate/)
  assert.match(qLearningSource, /learningRate/)
  assert.match(qLearningSource, /discountFactor/)
  assert.match(qLearningSource, /<details>/)
  assert.match(qLearningSource, /onBeforeUnmount/)
  assert.match(qLearningSource, /reset/)
  assert.match(qLearningSource, /pause/)
  assert.match(qLearningSource, /Number\.isFinite/)
  assert.doesNotMatch(qLearningSource, /watch\(\[seed, explorationRate\], reset\)/)
})

test('static fallback derives exactly four states per algorithm without range controls', () => {
  const staticSource = source('AlgorithmStaticFallback.vue')
  assert.match(staticSource, /StaticAlgorithmFrame/)
  assert.match(staticSource, /meanSquaredError/)
  assert.match(staticSource, /rankRegressionCandidates/)
  assert.match(staticSource, /regressionCandidates/)
  assert.match(staticSource, /runKMeans/)
  assert.match(staticSource, /trainEpisodes/)
  assert.match(staticSource, /evaluateGreedyPolicy/)
  assert.match(staticSource, /createQTable/)
  assert.match(staticSource, /initial/)
  assert.match(staticSource, /one-update/)
  assert.match(staticSource, /intermediate/)
  assert.match(staticSource, /(?:converged|evaluated)/)
  assert.doesNotMatch(staticSource, /type="range"/)
  assert.match(staticSource, /frames\.length === 4|slice\(0, 4\)/)
  assert.doesNotMatch(staticSource, /reachedGoal:\s*evaluated\.reachedGoal\s*\?\s*['"]yes['"]/)
  assert.match(staticSource, /localizedValue/)
  assert.match(staticSource, /(?:aiOverviewLabCopy|localizedLabCopy)\.phases/)
})

test('all visible lab chrome is centralized and bilingual', () => {
  const requiredCopy = [
    'lab', 'preset', 'slope', 'intercept', 'singleStep', 'autoRun', 'pause', 'speed',
    'reset', 'residuals', 'currentValue', 'history', 'previous', 'next', 'seed',
    'clusterCount', 'phase', 'withinGroupDistance', 'explorationRate', 'oneAction',
    'oneEpisode', 'learningRate', 'discountFactor', 'policy', 'fullQTable', 'staticFallback',
  ] as const
  for (const key of requiredCopy) {
    const copy = aiOverviewVisualCopy[key]
    assert.ok(copy?.['zh-CN'].trim(), `${key} needs zh-CN copy`)
    assert.ok(copy?.en.trim(), `${key} needs en copy`)
  }
})
