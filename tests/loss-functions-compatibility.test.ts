import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { algorithmCheckpointsBySlug } from '../src/data/algorithmCheckpoints.ts'
import { lossFunctionsModule } from '../src/data/lossFunctionsModule.ts'
import { resolveCanonicalLearnRoute } from '../src/curriculum/routes.ts'
import {
  learningProgressV2MigrationKey,
  learningProgressV2StorageKey,
} from '../src/curriculum/progress.ts'
import { mathLabProgressStorageKey } from '../src/modules/math-lab/utils/progress.ts'
import { dataLabProgressStorageKey } from '../src/modules/data-lab/utils/progress.ts'
import { algorithmProgressStorageKey } from '../src/utils/algorithmProgress.ts'
import { buildAlgorithmQuizAttempt } from '../src/utils/algorithmQuiz.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'
import { withPublicBase } from '../src/utils/publicPath.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const chapterIds = [
  'why-loss',
  'regression-losses',
  'classification-losses',
  'likelihood-intuition',
  'negative-log',
  'mle-bridge',
  'gradient-verification',
] as const

test('loss-functions identity and all seven canonical chapter deep links remain exact', () => {
  assert.equal(lossFunctionsModule.slug, 'loss-functions')
  assert.equal(lossFunctionsModule.route, '/learn/loss-functions')
  assert.deepEqual(lossFunctionsModule.chapters.map(({ id }) => id), chapterIds)
  assert.equal(resolveCanonicalLearnRoute('loss-functions'), '/learn/loss-functions')

  for (const chapterId of chapterIds) {
    assert.equal(
      resolveCanonicalLearnRoute('loss-functions', chapterId),
      `/learn/loss-functions/${chapterId}`,
    )
  }
})

test('loss-functions checkpoint identity, revisit links, and submission identity remain exact', () => {
  const checkpoints = algorithmCheckpointsBySlug['loss-functions']
  assert.deepEqual(
    checkpoints.map(({ id, revisitChapterId }) => ({ id, revisitChapterId })),
    [
      { id: 'loss-error-rule', revisitChapterId: 'why-loss' },
      { id: 'loss-nll-scale', revisitChapterId: 'negative-log' },
    ],
  )

  for (const checkpoint of checkpoints) {
    const attempt = buildAlgorithmQuizAttempt(
      'loss-functions',
      checkpoint,
      checkpoint.answer,
      '2026-07-28T00:00:00.000Z',
    )
    assert.equal(attempt.moduleSlug, 'loss-functions')
    assert.equal(attempt.quizId, checkpoint.id)
    assert.equal(attempt.correct, true)
  }
})

test('loss-functions progress storage identities remain byte-for-byte compatible', () => {
  assert.deepEqual(
    [algorithmProgressStorageKey, mathLabProgressStorageKey, dataLabProgressStorageKey],
    [
      'ml-atlas:algorithm-progress:v1',
      'ml-atlas:math-lab-progress:v1',
      'ml-atlas:data-lab-progress:v1',
    ],
  )
  assert.equal(learningProgressV2StorageKey, 'ml-atlas:learning-progress:v2')
  assert.equal(learningProgressV2MigrationKey, 'ml-atlas:learning-progress:v2:migration')
})

test('loss-functions asset registry lists the exact published local package', async () => {
  const assetModulePath = resolve(root, 'src/data/lossFunctionsAssets.ts')
  assert.equal(existsSync(assetModulePath), true, 'typed loss-functions asset registry must exist')

  const assets = await import('../src/data/lossFunctionsAssets.ts')
  const manifest = JSON.parse(
    readFileSync(resolve(root, 'public/notebooks/loss-functions/outputs/manifest.json'), 'utf8'),
  )

  assert.deepEqual(assets.lossFunctionsTopicIds, [
    'delivery-losses',
    'manufacturing-bce-gradients',
  ])
  assert.equal(assets.lossFunctionsAssets.length, 16)
  assert.deepEqual(
    assets.lossFunctionsAssets.map(({ publicPath }: { publicPath: string }) => publicPath),
    manifest.inventory.map(({ path }: { path: string }) => `/${path}`),
  )

  for (const asset of assets.lossFunctionsAssets) {
    assert.match(asset.publicPath, /^\/(datasets|notebooks)\/loss-functions\//)
    assert.doesNotMatch(asset.publicPath, /^(?:https?:|file:)|\/Users\//)
    assert.equal(existsSync(resolve(root, `public${asset.publicPath}`)), true, asset.publicPath)
  }
})

test('loss-functions assets and output plots resolve under root and Pages base paths', async () => {
  const assets = await import('../src/data/lossFunctionsAssets.ts')

  for (const asset of assets.lossFunctionsAssets) {
    assert.equal(withPublicBase(asset.publicPath, '/'), asset.publicPath)
    assert.equal(
      withPublicBase(asset.publicPath, '/ML_tutorial_Site/'),
      `/ML_tutorial_Site${asset.publicPath}`,
    )
  }

  for (const topic of Object.values(assets.lossFunctionsTopics)) {
    assert.equal(topic.notebooks.length, 2)
    assert.deepEqual(topic.notebooks.map(({ locale }) => locale), ['zh-CN', 'en'])
    assert.ok(topic.codeCellIds.length > 0)
    assert.match(topic.codeSha256, /^[a-f0-9]{64}$/)
  }
})

test('loss-functions runtime output validators accept published summaries and reject drift', async () => {
  const assets = await import('../src/data/lossFunctionsAssets.ts')
  const regression = JSON.parse(
    readFileSync(
      resolve(root, 'public/notebooks/loss-functions/outputs/regression-loss-summary.json'),
      'utf8',
    ),
  )
  const bce = JSON.parse(
    readFileSync(
      resolve(root, 'public/notebooks/loss-functions/outputs/bce-gradient-summary.json'),
      'utf8',
    ),
  )

  assert.equal(
    assets.parseLossFunctionsOutput('regression-loss-summary', regression).topicId,
    'delivery-losses',
  )
  assert.equal(
    assets.parseLossFunctionsOutput('bce-gradient-summary', bce).topicId,
    'manufacturing-bce-gradients',
  )

  assert.throws(
    () => assets.parseLossFunctionsOutput('unknown-output', regression),
    /output id/i,
  )
  assert.throws(
    () => assets.parseLossFunctionsOutput('regression-loss-summary', {
      ...regression,
      contractVersion: 'wrong',
    }),
    /contractVersion/,
  )
  assert.throws(
    () => assets.parseLossFunctionsOutput('regression-loss-summary', {
      ...regression,
      rows: [{ courseRowId: 'broken' }],
    }),
    /rows/,
  )
  assert.throws(
    () => assets.parseLossFunctionsOutput('regression-loss-summary', {
      ...regression,
      aggregate: { ...regression.aggregate, mse: Number.POSITIVE_INFINITY },
    }),
    /finite/,
  )
  assert.throws(
    () => assets.parseLossFunctionsOutput('bce-gradient-summary', {
      ...bce,
      fixedProbes: [
        {
          ...bce.fixedProbes[0],
          naive: { status: 'overflow', value: null },
        },
        ...bce.fixedProbes.slice(1),
      ],
    }),
    /status/,
  )
  assert.throws(
    () => assets.parseLossFunctionsOutput('bce-gradient-summary', {
      ...bce,
      finiteDifferenceSweeps: {
        ...bce.finiteDifferenceSweeps,
        mse: [
          {
            ...bce.finiteDifferenceSweeps.mse[0],
            status: 'maybe',
          },
          ...bce.finiteDifferenceSweeps.mse.slice(1),
        ],
      },
    }),
    /status/,
  )
})

test('loss-functions learner markdown stays on the shared sanitized math path', () => {
  for (const chapter of lossFunctionsModule.chapters) {
    for (const locale of ['zh-CN', 'en'] as const) {
      const html = renderMarkdownWithMath(chapter.markdown[locale])
      assert.doesNotMatch(html, /\$\$|<script|<iframe|javascript:|onerror\s*=|onclick\s*=/i)
      assert.match(html, /<span class="katex|<div class="katex/)
    }
  }
})

test('loss-functions chapter deep links continue through the existing generic lazy route', () => {
  const routerSource = readFileSync(resolve(root, 'src/router/index.ts'), 'utf8')
  assert.match(routerSource, /path:\s*'\/learn\/:moduleId\/:lessonId'/)
  assert.match(routerSource, /component:\s*\(\)\s*=>\s*import\('\.\.\/views\/AlgorithmView\.vue'\)/)
  assert.match(routerSource, /resolveCanonicalLearnRedirect\(moduleId,\s*lessonId\)/)
  assert.doesNotMatch(routerSource, /gradient-verification/)
})
