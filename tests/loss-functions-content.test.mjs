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
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

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

test('likelihood-intuition starts after practical losses and scores observed data under a model', () => {
  assert.ok(
    lossFunctionsModule.chapters.findIndex(({ id }) => id === 'likelihood-intuition')
      > lossFunctionsModule.chapters.findIndex(({ id }) => id === 'classification-losses'),
  )
  const section = chapter('likelihood-intuition')
  assert.deepEqual(section.outputIds, ['manufacturing-bce-contributions'])
  assert.equal(section.embeddedLabId, 'likelihood-intuition-lab')
  assertMatchesBothLocales(section, [
    /(?:核心问题|Core Question)/,
    /(?:概念解释|Concept Explanation)/,
    /(?:公式|Formula)/,
    /(?:代码与结果连接|Code and Output Connection)/,
    /(?:常见误解|Common Mistake)/,
    /(?:下一步|Next Step)/,
    /(?:已观察数据|observed data)/i,
    /(?:模型给出的概率|probability assigned by a model)/i,
    /\\prod/,
  ])
})

test('negative-log connects probability products stable BCE and Bernoulli NLL', () => {
  const section = chapter('negative-log')
  assert.deepEqual(section.outputIds, ['bce-stability-probes'])
  assert.equal(section.embeddedLabId, 'negative-log-lab')
  assertMatchesBothLocales(section, [
    /(?:核心问题|Core Question)/,
    /(?:概念解释|Concept Explanation)/,
    /(?:公式|Formula)/,
    /(?:代码与结果连接|Code and Output Connection)/,
    /(?:常见误解|Common Mistake)/,
    /(?:下一步|Next Step)/,
    /(?:连乘变成求和|products? (?:become|into) sums?)/i,
    /(?:不可能观察|unlikely observation)/i,
    /Bernoulli/,
    /negative log-likelihood/i,
    /np\.logaddexp/,
  ])
})

test('mle-bridge equates maximum likelihood with minimum NLL and defers parameter gradients', () => {
  const section = chapter('mle-bridge')
  assert.deepEqual(section.outputIds, [
    'delivery-representative-rows',
    'manufacturing-bce-contributions',
  ])
  assert.equal(section.embeddedLabId, 'mle-bridge-lab')
  assertMatchesBothLocales(section, [
    /(?:核心问题|Core Question)/,
    /(?:概念解释|Concept Explanation)/,
    /(?:公式|Formula)/,
    /(?:代码与结果连接|Code and Output Connection)/,
    /(?:常见误解|Common Mistake)/,
    /(?:下一步|Next Step)/,
    /\\arg\\max/,
    /\\arg\\min/,
    /(?:最大化似然|maximize likelihood)/i,
    /(?:最小化负对数似然|minimize negative log-likelihood)/i,
    /(?:链式法则|chain rule)/i,
    /(?:线性回归|linear regression)/i,
    /(?:逻辑回归|logistic regression)/i,
  ])
})

test('gradient-verification binds analytic central-difference errors h sweep and MAE kink', () => {
  const section = chapter('gradient-verification')
  assert.deepEqual(section.outputIds, ['loss-gradient-sweeps'])
  assert.deepEqual(section.codeCellIds, [
    'manufacturing-central-difference',
    'manufacturing-gradient-sweeps',
  ])
  assert.equal(section.embeddedLabId, 'loss-gradient-verification-lab')
  assertMatchesBothLocales(section, [
    /(?:核心问题|Core Question)/,
    /(?:概念解释|Concept Explanation)/,
    /(?:公式|Formula)/,
    /(?:代码与结果连接|Code and Output Connection)/,
    /(?:常见误解|Common Mistake)/,
    /(?:下一步|Next Step)/,
    /coordinate_central_difference/,
    /analytic/i,
    /central difference|中心差分/i,
    /absolute error|绝对误差/i,
    /scaled relative error|带尺度的相对误差/i,
    /10\^\{-1\}/,
    /10\^\{-9\}/,
    /5\\times10\^\{-7\}/,
    /MAE/,
    /(?:尖点|kink)/i,
    /(?:子梯度 0|subgradient 0)/i,
  ])
})

test('all seven bilingual chapters expose one dominant safe teaching loop', () => {
  const requiredHeadings = [
    /(?:核心问题|Core Question)/,
    /(?:概念解释|Concept Explanation)/,
    /(?:公式|Formula)/,
    /(?:代码与结果连接|Code and Output Connection)/,
    /(?:常见误解|Common Mistake)/,
    /(?:下一步|Next Step)/,
  ]

  for (const section of lossFunctionsModule.chapters) {
    assert.deepEqual(section.topicIds, lossFunctionsChapterBindings[section.id].topicIds)
    assert.deepEqual(section.outputIds, lossFunctionsChapterBindings[section.id].outputIds)
    assert.deepEqual(section.assetIds, lossFunctionsChapterBindings[section.id].assetIds)
    assert.deepEqual(section.codeCellIds, lossFunctionsChapterBindings[section.id].codeCellIds)

    for (const locale of ['zh-CN', 'en']) {
      const markdown = section.markdown[locale]
      for (const heading of requiredHeadings) {
        assert.match(markdown, heading, `${section.id}/${locale} teaching loop`)
      }
      assert.doesNotMatch(markdown, /<script\b|<iframe\b|javascript:|\son[a-z]+\s*=/i)
      const html = renderMarkdownWithMath(markdown)
      assert.doesNotMatch(html, /\$\$|<script|<iframe|javascript:|onerror\s*=|onclick\s*=/i)

      const teachingSections = markdown.match(/^### /gm)?.length ?? 0
      const exerciseSections = markdown.match(/^### (?:练习|Exercise|Quiz)/gim)?.length ?? 0
      assert.ok(teachingSections >= 5, `${section.id}/${locale} needs a complete teaching loop`)
      assert.ok(exerciseSections < teachingSections, `${section.id}/${locale} teaching must dominate`)
    }
    assert.doesNotMatch(section.markdown['zh-CN'], /证据/)
  }
})

test('loss-functions content keeps deferred parameter training and decision scope out', () => {
  const source = lossFunctionsModule.chapters.flatMap(({ markdown }) => Object.values(markdown)).join('\n')
  assert.doesNotMatch(source, /\\frac\{\\partial L\}\{\\partial (?:w|b)\}/)
  assert.doesNotMatch(source, /(?:theta|w|b)\s*-=\s*|optimizer\.(?:step|zero_grad)|model\.fit\(/i)
  assert.doesNotMatch(source, /(?:choose|tune|optimi[sz]e).{0,30}(?:threshold|decision cutoff)/i)
  assert.doesNotMatch(source, /multi-?head attention|one-vs-rest|def multiclass_gradient/i)
})
