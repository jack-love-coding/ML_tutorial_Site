import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function source(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8')
}

test('registry routes all seven loss chapters explicitly and never falls through to MLE', () => {
  const registry = source('src/components/LossFunctionsLessonLab.vue')
  const expectedBranches = [
    ['why-loss', 'WhyLossLab'],
    ['regression-losses', 'RegressionLossLab'],
    ['classification-losses', 'ClassificationLossLab'],
    ['likelihood-intuition', 'LikelihoodIntuitionLab'],
    ['negative-log', 'NegativeLogLab'],
    ['mle-bridge', 'MleBridgeLab'],
    ['gradient-verification', 'LossGradientVerificationLab'],
  ]

  for (const [chapterId, componentName] of expectedBranches) {
    assert.match(registry, new RegExp(`section\\.id === '${chapterId}'`))
    assert.match(registry, new RegExp(`<${componentName}`))
  }

  assert.doesNotMatch(registry, /<MleBridgeLab\s+v-else(?:\s|>)/)
  assert.match(registry, /loss-lab-unsupported/)
})

test('registry loading validates base-safe summaries and aborts stale result requests', () => {
  const registry = source('src/components/LossFunctionsLessonLab.vue')

  assert.match(registry, /withPublicBase/)
  assert.match(registry, /parseLossFunctionsOutput/)
  assert.match(registry, /new AbortController\(\)/)
  assert.match(registry, /controller\?\.abort\(\)/)
  assert.match(registry, /watch\(\s*\(\) => props\.section\.id/)
  assert.doesNotMatch(registry, /secom-manufacturing\.csv/)
})

test('gradient lab uses the pure authority with bounded selections reset and honest MAE kink status', () => {
  const gradient = source('src/components/LossGradientVerificationLab.vue')

  assert.match(gradient, /evaluateLossGradient/)
  assert.match(gradient, /evaluateStepSweep/)
  assert.match(gradient, /LOCKED_FINITE_DIFFERENCE_STEPS/)
  assert.match(gradient, /type="button"[^>]*@click="reset"/)
  assert.match(gradient, /<select[^>]*v-model="lossKind"/)
  assert.match(gradient, /<select[^>]*v-model="selectedElementId"/)
  assert.match(gradient, /<select[^>]*v-model\.number="selectedStep"/)
  assert.match(gradient, /nondifferentiable|不可微/)
  assert.match(gradient, /status.*kink|kink.*status/s)
  assert.doesNotMatch(gradient, /type="number"/)
})

test('locked result panel selects typed rows plots probes and h sweeps without hiding fallback teaching', () => {
  const results = source('src/components/LossFunctionsResults.vue')

  assert.match(results, /lossFunctionsChapterBindings/)
  assert.match(results, /parseLossFunctionsOutput/)
  assert.match(results, /withPublicBase/)
  assert.match(results, /representativeRows/)
  assert.match(results, /highContributionRows/)
  assert.match(results, /confidentError/)
  assert.match(results, /fixedProbes/)
  assert.match(results, /finiteDifferenceSweeps/)
  assert.match(results, /loss-results__fallback/)
  assert.match(results, /<CodeLab/)
})

test('download area exposes the complete local registry through base-safe bilingual links', () => {
  const downloads = source('src/components/LossFunctionsDownloads.vue')

  assert.match(downloads, /lossFunctionsAssets/)
  assert.match(downloads, /withPublicBase\(asset\.publicPath\)/)
  assert.match(downloads, /executed-notebook/)
  assert.match(downloads, /dataset-manifest/)
  assert.match(downloads, /attribution/)
  assert.match(downloads, /requirements/)
  assert.match(downloads, /environment/)
  assert.match(downloads, /locked-summary/)
  assert.match(downloads, /plot/)
  assert.match(downloads, /output-manifest/)
  assert.match(downloads, /:download="asset\.filename"/)
})

test('result code copy reuses the shared text-only CodeLab presentation', () => {
  const results = source('src/components/LossFunctionsResults.vue')
  const codeLab = source('src/modules/math-lab/components/CodeLab.vue')

  assert.match(results, /import CodeLab from/)
  assert.match(results, /:copy-label=/)
  assert.match(results, /:copied-label=/)
  assert.match(codeLab, /navigator\.clipboard\.writeText\(props\.code\)/)
  assert.doesNotMatch(results, /v-html/)
})

test('primary why-loss lab traces one validated real row through the complete objective loop', () => {
  const why = source('src/components/WhyLossLab.vue')

  assert.match(why, /RegressionLossSummary/)
  assert.match(why, /representativeRows/)
  assert.match(why, /selectedRowId/)
  assert.match(why, /evaluateLossGradient/)
  assert.match(why, /perElementLosses/)
  assert.match(why, /perElementGradients/)
  assert.match(why, /meanObjective/)
  assert.match(why, /locked-real-row/)
  assert.match(why, /type="button"[^>]*@click="reset"/)
  assert.doesNotMatch(why, /type="number"/)
})

test('regression lab compares typical zero-residual and long-duration real rows with pure MSE and MAE', () => {
  const regression = source('src/components/RegressionLossLab.vue')

  assert.match(regression, /RegressionLossSummary/)
  assert.match(regression, /typical-zero-residual/)
  assert.match(regression, /long-duration/)
  assert.match(regression, /evaluateLossGradient\('mse'/)
  assert.match(regression, /evaluateLossGradient\('mae'/)
  assert.match(regression, /msePerElementGradient|perElementGradients/)
  assert.match(regression, /maePerElementSubgradient|differentiable/)
  assert.match(regression, /outlierInfluence/)
  assert.match(regression, /type="button"[^>]*@click="reset"/)
})

test('classification lab separates real label logit probability BCE and gradient from bounded teaching controls', () => {
  const classification = source('src/components/ClassificationLossLab.vue')

  assert.match(classification, /BceGradientSummary/)
  assert.match(classification, /confidentError/)
  assert.match(classification, /selectionStatus/)
  assert.match(classification, /real-secom-oof-row/)
  assert.match(classification, /teaching-fallback/)
  assert.match(classification, /evaluateLossGradient\('bce'/)
  assert.match(classification, /stableSigmoid/)
  assert.match(classification, /selectedBceRowId/)
  assert.match(classification, /Number\.isFinite/)
  assert.match(classification, /type="button"[^>]*@click="resetRealRow"/)
  assert.doesNotMatch(classification, /(?:min|max)="[-+]?1000"/)
})

test('loss lab styles preserve tables focus and teaching meaning at 390px and reduced motion', () => {
  const styles = [
    source('src/styles/modules/loss-functions.css'),
    source('src/styles/modules/loss-functions-visuals.css'),
  ].join('\n')

  assert.match(styles, /\.loss-table-scroll[\s\S]*overflow-x:\s*auto/)
  assert.match(styles, /\.loss-real-row-select/)
  assert.match(styles, /:focus-visible/)
  assert.match(styles, /@media\s*\(max-width:\s*520px\)/)
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/)
  assert.match(styles, /\.is-pass|\.is-kink/)
  assert.match(styles, /grid-template-columns:\s*1fr/)
})

test('loss page keeps lazy story composition while placing chapter results beside each lab and downloads once at the end', () => {
  const view = source('src/views/AlgorithmView.vue')
  const lossBranchStart = view.indexOf('v-else-if="isLossFunctionsPage"')
  const checkpointStart = view.indexOf('<AlgorithmCheckpointQuiz')
  const downloadsStart = view.indexOf('<LossFunctionsDownloads')

  assert.match(view, /defineAsyncComponent\(\s*\(\) => import\('\.\.\/components\/LossFunctionsDownloads\.vue'\)/)
  assert.match(
    view,
    /<LossFunctionsLessonLab[\s\S]*?<LossFunctionsResults[\s\S]*?:active-section="section"/,
  )
  assert.equal(view.match(/<LossFunctionsDownloads/g)?.length, 1)
  assert.ok(lossBranchStart >= 0)
  assert.ok(checkpointStart > lossBranchStart)
  assert.ok(downloadsStart > checkpointStart)
  assert.doesNotMatch(
    view.slice(checkpointStart, downloadsStart),
    /<LossFunctionsResults/,
  )
})

test('committed loss browser matrix covers bilingual root and seven deep links with local-only responsive interactions', () => {
  const matrix = source('scripts/qa/lossFunctionsBrowserMatrix.js')
  const chapterIds = [
    'why-loss',
    'regression-losses',
    'classification-losses',
    'likelihood-intuition',
    'negative-log',
    'mle-bridge',
    'gradient-verification',
  ]

  assert.match(matrix, /zh-CN/)
  assert.match(matrix, /width:\s*390,\s*height:\s*844/)
  assert.match(matrix, /prefers-reduced-motion|reducedMotion/)
  assert.match(matrix, /\/learn\/loss-functions/)
  for (const chapterId of chapterIds) {
    assert.match(matrix, new RegExp(chapterId))
  }
  assert.match(matrix, /code-lab|copy/i)
  assert.match(matrix, /loss-real-row-select/)
  assert.match(matrix, /confident/i)
  assert.match(matrix, /kink|不可微/)
  assert.match(matrix, /1000/)
  assert.match(matrix, /algorithm-checkpoint/)
  assert.match(matrix, /data-loss-downloads/)
  assert.match(matrix, /scrollWidth/)
  assert.match(matrix, /overlap/)
  assert.match(matrix, /pageerror/)
  assert.match(matrix, /request/)
  assert.match(matrix, /new URL/)
})
