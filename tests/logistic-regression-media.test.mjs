import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
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

test('Phase 29 media metadata binds every MP4, poster, source, prompt, tree, transcript, marker, and hash', () => {
  assert.ok(existsSync(metadataPath), 'missing Phase 29 logistic media metadata')
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'))
  assert.deepEqual(metadata.assets.map((asset) => asset.id), expectedStems)
  for (const asset of metadata.assets) {
    const required = [asset.assetPath, asset.posterPath, asset.source, asset.prompt, asset.knowledgeTree, asset.transcriptZhCN, asset.transcriptEn]
    for (const path of required) assert.ok(existsSync(resolve(root, path.startsWith('/') ? `public${path}` : path)), `${asset.id} ${path} exists`)
    assert.match(asset.sha256, /^[a-f0-9]{64}$/)
    assert.match(asset.posterSha256, /^[a-f0-9]{64}$/)
    assert.equal(sha256(resolve(root, `public${asset.assetPath}`)), asset.sha256)
    assert.equal(sha256(resolve(root, `public${asset.posterPath}`)), asset.posterSha256)
    assert.equal(asset.width, 1920)
    assert.equal(asset.height, 1080)
    assert.equal(asset.frameRate, 30)
    assert.ok(asset.markers.every((marker) => marker.startSeconds >= 0 && marker.startSeconds < asset.durationSeconds))
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
