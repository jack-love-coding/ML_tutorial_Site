import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { createHash } from 'node:crypto'

const expectedIds = [
  'ai-overview-hero',
  'score-prediction',
  'pattern-discovery',
  'exercise-selection',
  'house-price',
  'user-segmentation',
  'spam-detection',
  'electricity-demand',
  'news-topics',
  'color-compression',
  'robot-control',
  'traffic-signals',
] as const

test('AI Overview image manifest records eleven available files and one auditable deferral', () => {
  const manifest = JSON.parse(readFileSync(new URL('../docs/curriculum-v3/ai-overview/assets.json', import.meta.url), 'utf8'))
  const images = manifest.assets.filter((asset: { kind: string }) => asset.kind === 'imagegen')
  const available = images.filter((asset: { availability?: string }) => asset.availability === 'available')
  const deferred = images.filter((asset: { availability?: string }) => asset.availability === 'deferred')

  assert.equal(images.length, 12)
  assert.deepEqual(images.map((asset: { id: string }) => asset.id), expectedIds)
  for (const asset of images) {
    assert.ok(asset.prompt.length > 200)
    assert.equal(asset.taxonomy, 'scientific-educational')
    if (asset.id === 'score-prediction') assert.deepEqual(asset.embeddedChinese, [], 'new teaching text belongs in bilingual HTML')
    else assert.ok(asset.embeddedChinese.length > 0)
    assert.ok(asset.correction === 'none' || asset.correction === 'deterministic-text-replacement')
  }

  assert.equal(available.length, 11)
  for (const asset of available) {
    assert.equal(typeof asset.publicPath, 'string')
    assert.ok(existsSync(new URL(`../public${asset.publicPath}`, import.meta.url)))
    assert.equal(typeof asset.generatedSource, 'string')
  }

  assert.deepEqual(deferred.map((asset: { id: string }) => asset.id), ['traffic-signals'])
  assert.equal(deferred[0].publicPath, null)
  assert.equal(deferred[0].generatedSource, null)
  assert.equal(deferred[0].deferral.date, '2026-07-13')
  assert.match(deferred[0].deferral.reason, /network error/i)
  assert.equal(deferred[0].deferral.placeholderCreated, false)
})

test('score illustration provenance matches runtime and its readable bilingual teaching fields', async () => {
  const manifest = JSON.parse(readFileSync(new URL('../docs/curriculum-v3/ai-overview/assets.json', import.meta.url), 'utf8'))
  const { aiOverviewMediaAssets } = await import('../src/modules/ai-overview/data/media.ts')
  for (const asset of aiOverviewMediaAssets) {
    const record = manifest.assets.find((entry: { id: string }) => entry.id === asset.id)
    assert.equal(record.publicPath, asset.publicPath)
    if (asset.id !== 'ai-overview-hero') {
      assert.equal(asset.taskFields?.length, 4)
      for (const field of asset.taskFields ?? []) for (const locale of ['zh-CN', 'en'] as const) {
        assert.ok(field.label[locale].trim() && field.value[locale].trim())
      }
    }
  }
  const record = manifest.assets.find((entry: { id: string }) => entry.id === 'score-prediction')
  const score = aiOverviewMediaAssets.find(asset => asset.id === 'score-prediction')!
  assert.equal(record.version, 2)
  assert.equal(createHash('sha256').update(readFileSync(new URL('../public' + record.publicPath, import.meta.url))).digest('hex'), record.sha256)
  assert.ok(existsSync(new URL('../public' + record.previousVersions[0].publicPath, import.meta.url)))
  assert.ok(score.alt?.['zh-CN'] && score.alt.en && score.readingGuide?.['zh-CN'] && score.readingGuide.en)
  assert.match(score.readingGuide.en, /duration only|no parameter update/)
  const source = readFileSync(new URL('../src/modules/ai-overview/components/OverviewMediaFigure.vue', import.meta.url), 'utf8')
  assert.match(source, /<dl class="overview-media-figure__task-fields"/)
  assert.match(source, /imageFailed/)
  assert.match(source, /asset.readingGuide\[locale\]/)
})

test('AI Overview prompt record names every asset specification', () => {
  const source = readFileSync(new URL('../docs/curriculum-v3/ai-overview/imagegen-prompts.md', import.meta.url), 'utf8')
  for (const id of expectedIds) assert.match(source, new RegExp(`^## ${id}$`, 'm'))
})

test('typed media registry exposes complete bilingual records', async () => {
  const { aiOverviewMediaAssets } = await import('../src/modules/ai-overview/data/media.ts')
  assert.deepEqual(aiOverviewMediaAssets.map((asset) => asset.id), expectedIds)
  assert.equal(aiOverviewMediaAssets.filter((asset) => asset.availability === 'available').length, 11)
  assert.deepEqual(
    aiOverviewMediaAssets.filter((asset) => asset.availability === 'deferred').map((asset) => asset.id),
    ['traffic-signals'],
  )
  for (const asset of aiOverviewMediaAssets) {
    assert.equal(asset.kind, 'imagegen')
    assert.ok(asset.title['zh-CN'] && asset.title.en)
    assert.ok(asset.caption['zh-CN'] && asset.caption.en)
    assert.ok(asset.englishSummary)
    assert.ok(asset.bilingualLabels.length > 0)
    if (asset.availability === 'available') {
      assert.ok(asset.publicPath.startsWith('/ai-overview/generated/'))
    } else {
      assert.equal(asset.publicPath, null)
    }
  }
})

test('runtime media figure does not request deferred asset paths', () => {
  const source = readFileSync(new URL('../src/modules/ai-overview/components/OverviewMediaFigure.vue', import.meta.url), 'utf8')
  assert.match(source, /asset\.availability === 'available'/)
})
