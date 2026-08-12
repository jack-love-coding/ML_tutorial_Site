import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const metadataPath = resolve(root, 'public/manim/optimizer-comparison/metadata.json')
const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'))
const expectedKinds = ['sgd', 'momentum', 'rmsprop', 'adam']
const expectedShapes = { sgd: 'circle', momentum: 'square', rmsprop: 'triangle', adam: 'diamond' }
const expectedMarkerGeometry = {
  sgd: /<circle id="parameter-marker"[^>]*\bcx="122"/,
  momentum: /<rect id="parameter-marker"[^>]*\bwidth="28"/,
  rmsprop: /<polygon id="parameter-marker"[^>]*\bpoints="122,160 105,190 139,190"/,
  adam: /<rect id="parameter-marker"[^>]*\btransform="rotate\(45 122 178\)"/,
}
const sha256 = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')

test('optimizer media packages publish all source artifacts and deterministic numeric anchors', () => {
  assert.equal(metadata.metadataVersion, 1)
  assert.equal(metadata.generatedBy, 'scripts/manim/render_optimizer_comparison.py')
  assert.equal(metadata.manimVersion, 'Manim Community v0.20.1')
  assert.deepEqual(metadata.assets.map((asset: { kind: string }) => asset.kind), expectedKinds)

  for (const asset of metadata.assets) {
    const video = resolve(root, `public${asset.assetPath}`)
    const poster = resolve(root, `public${asset.posterPath}`)
    assert.equal(existsSync(video), true)
    assert.equal(existsSync(poster), true)
    assert.equal(sha256(video), asset.sha256)
    assert.equal(sha256(poster), asset.posterSha256)
    assert.equal(asset.shape, expectedShapes[asset.kind as keyof typeof expectedShapes])
    const posterSource = readFileSync(poster, 'utf8')
    assert.match(posterSource, expectedMarkerGeometry[asset.kind as keyof typeof expectedMarkerGeometry])
    assert.match(posterSource, new RegExp(`data-shape="${asset.shape}"|id="parameter-marker"`))
    assert.equal(asset.numericAnchor.comparison, 'predeclared-practical')
    assert.equal(asset.numericAnchor.update, 1)
    assert.equal(asset.markers.length, 5)
    assert.ok(asset.markers.every((marker: { startSeconds: number }) => marker.startSeconds >= 0 && marker.startSeconds < asset.durationSeconds))
    assert.equal(asset.durationSeconds, 40)
    assert.match(readFileSync(resolve(root, asset.prompt), 'utf8'), /40-second/)
    assert.equal(JSON.parse(readFileSync(resolve(root, asset.knowledgeTree), 'utf8')).visualContract.durationSeconds, 40)
    for (const source of [asset.prompt, asset.knowledgeTree, asset.transcriptZhCN, asset.transcriptEn]) {
      assert.equal(existsSync(resolve(root, source)), true, `${source} should exist`)
      assert.notEqual(readFileSync(resolve(root, source), 'utf8').trim(), '')
    }
  }
})

test('each optimizer media package is 1080p30 and lasts 35–55 seconds', () => {
  for (const asset of metadata.assets) {
    const video = resolve(root, `public${asset.assetPath}`)
    const result = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate:format=duration', '-of', 'json', video], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    const payload = JSON.parse(result.stdout)
    assert.equal(payload.streams[0].width, 1920)
    assert.equal(payload.streams[0].height, 1080)
    assert.equal(payload.streams[0].r_frame_rate, '30/1')
    assert.ok(Number(payload.format.duration) >= 35 && Number(payload.format.duration) <= 55)
  }
})

test('renderer has selective preview, publish, and read-only integrity paths', () => {
  const renderer = readFileSync(resolve(root, 'scripts/manim/render_optimizer_comparison.py'), 'utf8')
  const scene = readFileSync(resolve(root, 'scripts/manim/scenes/optimizer_comparison.py'), 'utf8')
  assert.match(renderer, /--scene/)
  assert.match(renderer, /--quality/)
  assert.match(renderer, /--check/)
  assert.match(renderer, /source_durations/)
  assert.match(renderer, /Source duration drift/)
  assert.match(renderer, /numericAnchor/)
  assert.match(renderer, /Marker bounds failed/)
  assert.match(scene, /TRAJECTORIES/)
  assert.match(scene, /numeric_anchor/)
  assert.match(scene, /SHAPE = "circle"/)
  assert.match(scene, /SHAPE = "square"/)
  assert.match(scene, /SHAPE = "triangle"/)
  assert.match(scene, /SHAPE = "diamond"/)
  assert.doesNotMatch(scene, /Text\(/)
  assert.doesNotMatch(scene, /shared-engine anchor|step 1 update norm|loss after step 1|parameter position|state changes the next step/)
})

test('published optimizer package drift check passes without writing assets', () => {
  const result = spawnSync('python3', ['scripts/manim/render_optimizer_comparison.py', '--check'], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /ffprobe, source-duration, marker, transcript, numeric-anchor, and hash contracts/)
})

test('published optimizer package supports focused read-only checks', () => {
  const result = spawnSync('python3', ['scripts/manim/render_optimizer_comparison.py', '--check', '--scene', 'sgd'], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /sgd assets match ffprobe, source-duration/)
})
