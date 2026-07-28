import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { lossFunctionsModule } from '../src/data/lossFunctionsModule.ts'
import {
  lossFunctionsChapterBindings,
  lossFunctionsTopics,
} from '../src/data/lossFunctionsAssets.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const chapters = new Map(lossFunctionsModule.chapters.map((chapter) => [chapter.id, chapter]))

function chapter(id) {
  const value = chapters.get(id)
  assert.ok(value, `${id} chapter must exist`)
  return value
}

function assertMatchesBothLocales(section, patterns) {
  for (const locale of ['zh-CN', 'en']) {
    const markdown = section.markdown[locale]
    for (const pattern of patterns) {
      assert.match(markdown, pattern, `${section.id}/${locale} should match ${pattern}`)
    }
  }
}

test('loss-functions chapter contract begins with the locked seven bilingual chapters', () => {
  assert.deepEqual(
    lossFunctionsModule.chapters.map(({ id }) => id),
    [
      'why-loss',
      'regression-losses',
      'classification-losses',
      'likelihood-intuition',
      'negative-log',
      'mle-bridge',
      'gradient-verification',
    ],
  )
  assert.equal(existsSync(resolve(root, 'src/data/lossFunctionsAssets.ts')), true)

  for (const chapter of lossFunctionsModule.chapters) {
    assert.ok(chapter.markdown['zh-CN'].trim(), `${chapter.id} zh-CN markdown`)
    assert.ok(chapter.markdown.en.trim(), `${chapter.id} English markdown`)
    assert.ok(chapter.callout['zh-CN'].trim(), `${chapter.id} zh-CN callout`)
    assert.ok(chapter.callout.en.trim(), `${chapter.id} English callout`)
    assert.ok(chapter.experimentPrompt?.['zh-CN'].trim(), `${chapter.id} zh-CN handoff`)
    assert.ok(chapter.experimentPrompt?.en.trim(), `${chapter.id} English handoff`)
  }

  const gradient = lossFunctionsModule.chapters.at(-1)
  assert.equal(gradient?.id, 'gradient-verification')
  assert.equal(gradient?.embeddedLabId, 'loss-gradient-verification-lab')
})

test('why-loss traces one real row from error through loss contribution and mean objective', () => {
  const section = chapter('why-loss')
  assert.deepEqual(section.outputIds, ['delivery-representative-rows'])
  assert.deepEqual(section.codeCellIds, ['delivery-loss-functions', 'delivery-build-output'])
  assertMatchesBothLocales(section, [
    /(?:核心问题|Core Question)/,
    /(?:概念解释|Concept Explanation)/,
    /(?:公式|Formula)/,
    /(?:代码与结果连接|Code and Output Connection)/,
    /(?:常见误解|Common Mistake)/,
    /(?:下一步|Next Step)/,
    /LaDe-D/,
    /r_i\s*=/,
    /\\hat\s*y_i/,
    /(?:单样本|per-example)/i,
    /(?:均值目标|mean objective)/i,
    /(?:梯度|gradient)/i,
    /regression_losses/,
    /left_fold_mean/,
  ])
})

test('regression-losses binds real MSE and MAE rows distributions and gradient scales', () => {
  const section = chapter('regression-losses')
  assert.deepEqual(section.outputIds, [
    'delivery-representative-rows',
    'delivery-loss-distribution',
    'delivery-high-contribution-rows',
  ])
  assert.deepEqual(section.assetIds, ['regression-loss-summary', 'delivery-losses-plot'])
  assertMatchesBothLocales(section, [
    /(?:核心问题|Core Question)/,
    /(?:公式|Formula)/,
    /(?:代码与结果连接|Code and Output Connection)/,
    /(?:常见误解|Common Mistake)/,
    /(?:下一步|Next Step)/,
    /(?:典型行|typical row)/i,
    /(?:长时配送行|long-duration row)/i,
    /(?:逐行|per-row)/i,
    /(?:总体|aggregate)/i,
    /\\operatorname\{MSE\}/,
    /\\operatorname\{MAE\}/,
    /mse_mean_gradients/,
    /mae_mean_subgradients/,
  ])
})

test('classification-losses makes stable logit BCE canonical and keeps Softmax concise', () => {
  const section = chapter('classification-losses')
  assert.deepEqual(section.outputIds, [
    'manufacturing-bce-contributions',
    'manufacturing-confident-error',
    'bce-stability-probes',
  ])
  assert.deepEqual(section.assetIds, [
    'bce-gradient-summary',
    'manufacturing-bce-gradients-plot',
  ])
  assertMatchesBothLocales(section, [
    /(?:核心问题|Core Question)/,
    /(?:公式|Formula)/,
    /(?:代码与结果连接|Code and Output Connection)/,
    /(?:常见误解|Common Mistake)/,
    /(?:下一步|Next Step)/,
    /SECOM/,
    /p\s*=\s*\\sigma\(z\)/,
    /softplus\(z\)\s*-\s*y\s*z/,
    /np\.logaddexp/,
    /stable_bce_from_logits/,
    /p\s*-\s*y/,
    /(?:自信地判错|confidently wrong)/i,
  ])

  for (const locale of ['zh-CN', 'en']) {
    const softmaxMentions = section.markdown[locale].match(/softmax/gi)?.length ?? 0
    assert.ok(softmaxMentions >= 1 && softmaxMentions <= 6, `${locale} Softmax should stay concise`)
  }
  for (const sectionId of [
    'why-loss',
    'regression-losses',
    'likelihood-intuition',
    'negative-log',
    'mle-bridge',
    'gradient-verification',
  ]) {
    assert.doesNotMatch(chapter(sectionId).markdown['zh-CN'], /Softmax/i)
    assert.doesNotMatch(chapter(sectionId).markdown.en, /Softmax/i)
  }
})

test('first three chapters reference the locked topic code identities without copied result authority', () => {
  assert.deepEqual(
    lossFunctionsTopics['delivery-losses'].codeCellIds,
    [
      'delivery-imports',
      'delivery-loss-functions',
      'delivery-artifact-helpers',
      'delivery-local-paths',
      'delivery-build-output',
    ],
  )
  assert.deepEqual(
    lossFunctionsTopics['manufacturing-bce-gradients'].codeCellIds,
    [
      'manufacturing-imports',
      'manufacturing-stable-bce',
      'manufacturing-central-difference',
      'manufacturing-gradient-sweeps',
      'manufacturing-artifact-helpers',
      'manufacturing-local-paths',
      'manufacturing-build-output',
    ],
  )
  for (const id of ['why-loss', 'regression-losses', 'classification-losses']) {
    assert.deepEqual(chapter(id).outputIds, lossFunctionsChapterBindings[id].outputIds)
    assert.deepEqual(chapter(id).codeCellIds, lossFunctionsChapterBindings[id].codeCellIds)
  }

  const prose = ['why-loss', 'regression-losses', 'classification-losses']
    .flatMap((id) => Object.values(chapter(id).markdown))
    .join('\n')
  assert.doesNotMatch(prose, /21178\.123|106\.0849|531\.306864|0\.997872637/)
})
