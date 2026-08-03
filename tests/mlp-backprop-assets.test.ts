import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const metadataPath = resolve(root, 'public/manim/mlp/metadata.json')
const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'))
const scene = metadata.scenes.find((item: { scene: string }) => item.scene === 'BackpropResponsibilityScene')
const sha256 = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')

test('backprop animation package publishes source artifacts, transcripts, and stable hashes', () => {
  assert.equal(metadata.metadataVersion, 2)
  assert.match(metadata.manimVersion, /Manim Community v0\.20\.1/)
  assert.ok(scene)

  const paths = [scene.prompt, scene.knowledgeTree, scene.transcriptZhCN, scene.transcriptEn]
  for (const path of paths) assert.equal(existsSync(resolve(root, path)), true, `${path} should exist`)

  const video = resolve(root, `public${scene.assetPath}`)
  const poster = resolve(root, `public${scene.posterPath}`)
  assert.equal(sha256(video), scene.sha256)
  assert.equal(sha256(poster), scene.posterSha256)
  assert.equal(scene.chapters.length, 6)
  assert.deepEqual(scene.chapters.map((chapter: { startSeconds: number }) => chapter.startSeconds), [0, 24, 52, 88, 120, 148])
  assert.ok(scene.chapters.every((chapter: { startSeconds: number }) => chapter.startSeconds < scene.durationSeconds))
})

test('published backprop video is 1080p30 and lasts between 150 and 180 seconds', () => {
  const video = resolve(root, `public${scene.assetPath}`)
  const probe = spawnSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate:format=duration',
    '-of', 'json', video,
  ], { encoding: 'utf8' })
  assert.equal(probe.status, 0, probe.stderr)
  const payload = JSON.parse(probe.stdout)
  const stream = payload.streams[0]
  const duration = Number(payload.format.duration)
  assert.equal(stream.width, 1920)
  assert.equal(stream.height, 1080)
  assert.equal(stream.r_frame_rate, '30/1')
  assert.ok(duration >= 150 && duration <= 180)
  assert.equal(duration, scene.durationSeconds)
})

test('Manim scene follows the reverse knowledge tree and selective publish renderer', () => {
  const source = readFileSync(resolve(root, 'scripts/manim/scenes/mlp_playground.py'), 'utf8')
  const renderer = readFileSync(resolve(root, 'scripts/manim/render_mlp.py'), 'utf8')
  const prompt = readFileSync(resolve(root, scene.prompt), 'utf8')
  const tree = JSON.parse(readFileSync(resolve(root, scene.knowledgeTree), 'utf8'))

  for (const section of ['forward-cache', 'output-error', 'scalar-chain', 'branch-sum', 'reverse-vjp', 'parameter-update']) {
    assert.match(source, new RegExp(`next_section\\("${section}"\\)`))
  }
  assert.ok(source.includes('r"\\bar{\\mathbf u}\\mathrel{+}=J_f'))
  assert.match(renderer, /--scene/)
  assert.match(renderer, /--quality/)
  assert.match(renderer, /--check/)
  assert.match(renderer, /PUBLISHED_MANIM_VERSION = "Manim Community v0\.20\.1"/)
  assert.match(renderer, /if shutil\.which\("manim"\)/)
  assert.match(renderer, /1920,1080/)
  assert.match(prompt, /Function composition → local derivative/)
  assert.equal(tree.visualContract.durationSeconds, 172.2)
  assert.equal(tree.root.concept, 'reverse-mode backpropagation')
})

test('MLP asset drift check is read-only and passes for the published package', () => {
  const check = spawnSync('python3', ['scripts/manim/render_mlp.py', '--check'], {
    cwd: root,
    encoding: 'utf8',
  })
  assert.equal(check.status, 0, check.stderr)
  assert.match(check.stdout, /assets match posters, probes, hashes, chapters, and source records/)
})

test('localized transcripts cover every animation chapter without inline citations', () => {
  for (const path of [scene.transcriptZhCN, scene.transcriptEn]) {
    const transcript = readFileSync(resolve(root, path), 'utf8')
    for (const timestamp of ['0:00', '0:24', '0:52', '1:28', '2:00', '2:28']) assert.match(transcript, new RegExp(timestamp.replace(':', '\\:')))
    assert.doesNotMatch(transcript, /\[[^\]]+\]\(https?:\/\//)
    assert.doesNotMatch(transcript, /### Ref ID|来源参考/)
  }
})
