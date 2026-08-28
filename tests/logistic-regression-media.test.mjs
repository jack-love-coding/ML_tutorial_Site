import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const metadataPath = resolve(root, 'public/manim/logistic-regression/metadata.json')
const registryUrl = new URL('../src/modules/logistic-regression/data/media.ts', import.meta.url)
const expectedStems = [
  'linear-score-to-sigmoid',
  'likelihood-to-bce-gradient',
  'log-loss-confident-mistake',
  'regularization-confidence-field',
]

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex')

test('Phase 29 registers four typed language-neutral media packages before attaching them to the course', async () => {
  const { logisticMediaRegistry } = await import(registryUrl.href)
  assert.deepEqual(Object.keys(logisticMediaRegistry), expectedStems)
  for (const [stem, media] of Object.entries(logisticMediaRegistry)) {
    assert.match(media.assetPath, new RegExp(`/${stem}\\.mp4$`))
    assert.match(media.posterPath, new RegExp(`/${stem}\\.svg$`))
    assert.ok(media.alt['zh-CN'].trim() && media.alt.en.trim(), `${stem} alt is bilingual`)
    assert.ok(media.transcript['zh-CN'].trim() && media.transcript.en.trim(), `${stem} transcript is bilingual`)
    assert.ok(media.chapterMarkers.length > 0, `${stem} has chapter markers`)
  }
})

test('Phase 29 source renderer maps exactly four manifest-bound scene IDs and rejects unknown selections before Manim', () => {
  const renderer = resolve(root, 'scripts/manim/render_logistic_regression.py')
  const sceneSource = resolve(root, 'scripts/manim/scenes/logistic_regression.py')
  assert.ok(existsSync(renderer), 'logistic renderer exists')
  assert.ok(existsSync(sceneSource), 'logistic scene source exists')
  const source = readFileSync(sceneSource, 'utf8')
  for (const className of ['LinearScoreToSigmoidScene', 'LikelihoodBceGradientScene', 'ConfidentMistakeScene', 'RegularizationConfidenceScene']) {
    assert.match(source, new RegExp(`class ${className}`), `${className} is declared`)
  }
  const validation = execFileSync('python3', ['-S', renderer, '--validate-sources'], { cwd: root, encoding: 'utf8' })
  assert.match(validation, /4 logistic scenes/i)
  assert.throws(
    () => execFileSync('python3', [renderer, '--scene', 'unknown-scene', '--quality', 'preview'], { cwd: root, encoding: 'utf8', stdio: 'pipe' }),
    /invalid choice|unknown/i,
  )
})

test('published release binds all four MP4/poster/transcript packages to metadata and the typed registry', async () => {
  const { logisticMediaRegistry, logisticMediaMetadataSha256 } = await import(registryUrl.href)
  assert.ok(existsSync(metadataPath), 'the published metadata package exists')
  assert.equal(sha256(metadataPath), logisticMediaMetadataSha256, 'runtime registry pins the complete metadata bytes')
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'))
  assert.deepEqual(metadata.assets.map((asset) => asset.id), expectedStems)
  for (const stem of expectedStems) {
    const asset = metadata.assets.find((entry) => entry.id === stem)
    const runtime = logisticMediaRegistry[stem]
    assert.ok(asset && runtime, `${stem} is present in metadata and registry`)
    assert.equal(runtime.assetPath, asset.assetPath)
    assert.equal(runtime.posterPath, asset.posterPath)
    assert.equal(runtime.package.sha256, asset.sha256)
    assert.equal(runtime.package.posterSha256, asset.posterSha256)
    assert.equal(runtime.package.sourceManifestSha256, asset.sourceManifestSha256)
    assert.deepEqual(runtime.chapterMarkers.map(({ id, startSeconds }) => ({ id, startSeconds })), asset.markers)
    for (const source of [asset.prompt, asset.knowledgeTree, asset.transcriptZhCN, asset.transcriptEn]) {
      assert.ok(existsSync(resolve(root, source)), `${stem} retains ${source}`)
    }
    for (const [locale, transcript] of [['zh-CN', asset.transcriptZhCN], ['en', asset.transcriptEn]]) {
      assert.equal(runtime.transcript[locale].trim(), readFileSync(resolve(root, transcript), 'utf8').trim())
    }
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,codec_name:format=duration', '-of', 'json', resolve(root, 'public', asset.assetPath.slice(1))], { encoding: 'utf8' }))
    assert.equal(probe.streams[0].codec_name, 'h264')
    assert.equal(probe.streams[0].width, 1920)
    assert.equal(probe.streams[0].height, 1080)
    assert.equal(probe.streams[0].r_frame_rate, '30/1')
    assert.ok(asset.durationSeconds > 0 && asset.markers.every((marker) => marker.startSeconds >= 0 && marker.startSeconds < asset.durationSeconds), `${stem} has duration-bounded markers`)
  }
})

test('Phase 29 media player contract preserves user-start, seeking, failures, reduced motion, base paths, and cleanup', () => {
  const player = readFileSync(resolve(root, 'src/components/ChapteredMediaPlayer.vue'), 'utf8')
  assert.match(player, /withPublicBase/)
  assert.match(player, /currentTime/)
  assert.match(player, /error|unavailable/i)
  assert.match(player, /prefers-reduced-motion|reducedMotion/)
  assert.match(player, /onBeforeUnmount|removeEventListener/)
  assert.match(player, /transcript/i)
  assert.match(player, /poster/i)
})
