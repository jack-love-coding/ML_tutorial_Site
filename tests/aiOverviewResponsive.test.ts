import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

test('all eight chapters own at least one declared primary companion', async () => {
  const { chapterCompanionKinds } = await import('../src/data/aiOverviewModule.ts')
  assert.ok(chapterCompanionKinds, 'chapterCompanionKinds must be exported')
  assert.deepEqual(Object.keys(chapterCompanionKinds), [
    'three-problems',
    'ai-world-map',
    'ml-common-language',
    'supervised-linear-regression',
    'learning-paradigms',
    'unsupervised-kmeans',
    'reinforcement-q-learning',
    'choose-learning-approach',
  ])
  for (const kinds of Object.values(chapterCompanionKinds)) assert.ok(kinds.length > 0)
})

test('runtime media registers three complete Manim videos without inventing a deferred URL', async () => {
  const { aiOverviewRuntimeMediaAssets } = await import('../src/modules/ai-overview/data/media.ts')
  assert.ok(Array.isArray(aiOverviewRuntimeMediaAssets), 'runtime media registry must be exported')
  const videos = aiOverviewRuntimeMediaAssets.filter((asset) => asset.kind === 'manim-video')
  assert.deepEqual(videos.map((asset) => asset.id), [
    'linear-regression-video',
    'kmeans-video',
    'q-learning-video',
  ])
  for (const video of videos) {
    assert.equal(video.availability, 'available')
    if (video.availability !== 'available') continue
    assert.match(video.publicPath, /^\/manim\/ai-overview\/.+\.mp4$/)
    assert.match(video.posterPath ?? '', /^\/manim\/ai-overview\/.+-poster\.png$/)
    assert.match(video.transcriptPath ?? '', /^docs\/curriculum-v3\/ai-overview\/manim\/.+-transcript\.zh-CN\.md$/)
    assert.ok(existsSync(resolve(root, `public${video.publicPath}`)))
    assert.ok(existsSync(resolve(root, `public${video.posterPath}`)))
    assert.ok(existsSync(resolve(root, video.transcriptPath!)))
  }

  const deferred = aiOverviewRuntimeMediaAssets.find((asset) => asset.id === 'traffic-signals')
  assert.deepEqual(deferred && { availability: deferred.availability, publicPath: deferred.publicPath }, {
    availability: 'deferred',
    publicPath: null,
  })
})

test('runtime Manim transcripts and labels exactly mirror the authoritative docs artifacts', async () => {
  const { aiOverviewRuntimeMediaAssets } = await import('../src/modules/ai-overview/data/media.ts')
  const contracts = [
    ['linear-regression-video', 'linear-regression-parameter-search', 32],
    ['kmeans-video', 'kmeans-convergence', 25],
    ['q-learning-video', 'q-learning-strategy', 57],
  ] as const

  for (const [assetId, sourceId, labelCount] of contracts) {
    const asset = aiOverviewRuntimeMediaAssets.find((candidate) => candidate.id === assetId)
    assert.ok(asset?.kind === 'manim-video', `${assetId} must be a Manim asset`)
    const authoritativeTranscript = read(`docs/curriculum-v3/ai-overview/manim/${sourceId}-transcript.zh-CN.md`)
    const authoritativeLabels = JSON.parse(read(`docs/curriculum-v3/ai-overview/manim/${sourceId}-labels.json`)).labels
    assert.equal(asset.transcriptZhCN, authoritativeTranscript)
    assert.match(asset.transcriptZhCN, /^# .+中文字幕稿/m)
    assert.match(asset.transcriptZhCN, /^## 0:00/m)
    assert.equal(asset.bilingualLabels.length, labelCount)
    assert.deepEqual(asset.bilingualLabels, authoritativeLabels)
  }
})

test('media figure localizes captions and keeps English support and Chinese transcript explicit', () => {
  const source = read('src/modules/ai-overview/components/OverviewMediaFigure.vue')
  assert.match(source, /asset\.availability === 'available'\s*\?\s*withPublicBase\(props\.asset\.publicPath\)/)
  assert.match(source, /props\.asset\.posterPath\s*\?\s*withPublicBase\(props\.asset\.posterPath\)/)
  assert.match(source, /asset\.caption\[locale\]/)
  assert.match(source, /v-if="locale === 'en'"/)
  assert.match(source, /<table/)
  assert.match(source, /label\['zh-CN'\]/)
  assert.match(source, /label\.en/)
  assert.match(source, /<details[^>]+v-if="asset\.kind === 'manim-video'"/)
  assert.match(source, /asset\.transcriptPath/)
  assert.match(source, /asset\.transcriptZhCN/)
  assert.doesNotMatch(source, /withPublicBase\(props\.asset\.transcriptPath\)/)
})

test('course-scoped CSS preserves responsive, motion, focus, overflow, and print fallbacks', () => {
  const css = read('src/styles/modules/ai-overview.css')
  assert.match(css, /\.algorithm-view--ai-overview \.overview-media-figure,[\s\S]+border:\s*1px solid var\(--line\);[\s\S]+background:\s*var\(--surface\)/)
  assert.match(css, /\.algorithm-lab__check\s*\{[^}]*min-height:\s*44px/s)
  assert.match(css, /\.q-lab summary\s*\{[^}]*min-height:\s*44px/s)
  assert.match(css, /\.overview-media-figure__table-wrap:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--ai-overview-accent\)/s)
  assert.match(css, /\.overview-media-figure__table-wrap,[^}]+overflow-x:\s*auto/s)
  assert.match(css, /@media\s*\(max-width:\s*760px\)/)
  assert.match(css, /\.algorithm-lab--desktop\s*\{[^}]*display:\s*none/s)
  assert.match(css, /\.algorithm-static-fallback\s*\{[^}]*display:\s*block/s)
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/)
  assert.match(css, /transition(?:-duration)?:\s*(?:none|0s)/)
  assert.match(css, /@media\s+print/)
  assert.doesNotMatch(css, /\.overview-lab__scenario/)
})

test('AI Overview print isolates the knowledge-map path without changing other routes', () => {
  const css = read('src/styles/modules/ai-overview.css')
  const headerCss = read('src/styles/layout/site-header.css')
  const algorithmView = read('src/views/AlgorithmView.vue')
  const lessonPage = read('src/lessons/LessonPage.vue')

  assert.match(algorithmView, /<LessonPage[\s\S]+<AlgorithmCheckpointQuiz/)
  assert.match(lessonPage, /lesson-page--\$\{props\.variant\}/)
  assert.match(headerCss, /body:has\(\.algorithm-view--ai-overview\) \.site-header\s*\{[^}]*display:\s*none\s*!important/s)
  assert.doesNotMatch(css, /\.site-header/)
  assert.match(css, /\.algorithm-view--ai-overview\s*>\s*:not\(\.lesson-page--ai-overview\)\s*\{[^}]*display:\s*none\s*!important/s)
  assert.match(css, /\.story-card:not\(\[data-section-id='choose-learning-approach'\]\)/)
  assert.doesNotMatch(css, /@media print\s*\{[^}]*\n\s*\.site-header\s*\{/s)
})

test('interactive visual status is reinforced by text, shape, or ARIA state', () => {
  const chapterSources = [
    'TraditionalAiStepper.vue',
    'ParadigmDecisionTree.vue',
    'AlgorithmStaticFallback.vue',
    'QLearningLab.vue',
  ].map((file) => read(`src/modules/ai-overview/${file.includes('Lab') || file.includes('Fallback') ? 'labs' : 'components'}/${file}`)).join('\n')

  assert.match(chapterSources, /aria-(?:current|pressed)/)
  assert.match(chapterSources, /(?:step-shape|branch-shape|data-frame-id|actionSymbols)/)
})
