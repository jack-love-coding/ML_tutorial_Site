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
  assert.match(registry, /controller\.abort\(\)/)
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
