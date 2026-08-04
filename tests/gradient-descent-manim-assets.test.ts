import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const metadata = JSON.parse(readFileSync(resolve(root, 'public/manim/gradient-descent/metadata.json'), 'utf8'))
const sha256 = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')

test('gradient-rule Manim package publishes exact 1080p30 media and stable hashes', () => {
  assert.equal(metadata.manimVersion, 'Manim Community v0.20.1')
  const video = resolve(root, `public${metadata.assetPath}`)
  const poster = resolve(root, `public${metadata.posterPath}`)
  assert.equal(sha256(video), metadata.sha256)
  assert.equal(sha256(poster), metadata.posterSha256)
  assert.equal(metadata.width, 1920)
  assert.equal(metadata.height, 1080)
  assert.equal(metadata.fps, 30)
  assert.ok(metadata.durationSeconds >= 75 && metadata.durationSeconds <= 90)
  assert.equal(metadata.durationSeconds, 84)
})

test('animation follows the reverse knowledge tree and exact seven-part storyboard', () => {
  const source = readFileSync(resolve(root, 'scripts/manim/scenes/gradient_descent_deep_dive.py'), 'utf8')
  const tree = JSON.parse(readFileSync(resolve(root, metadata.knowledgeTree), 'utf8'))
  const expected = [
    'data-model', 'prediction-error', 'loss-slice', 'uphill-gradient',
    'negative-direction', 'learning-rate', 'update-verify',
  ]
  assert.deepEqual(metadata.chapters.map((chapter: { id: string }) => chapter.id), expected)
  assert.deepEqual(metadata.chapters.map((chapter: { startSeconds: number }) => chapter.startSeconds), [0, 12, 24, 36, 48, 60, 72])
  for (const id of expected) assert.match(source, new RegExp(`next_section\\("${id}"\\)`))
  for (const value of ['0.600000', '-3.2,-0.4', '0.02', '6.064,47.008', '0.440192', '0.060000']) {
    assert.ok(source.includes(value), value)
  }
  assert.equal(tree.root.concept, 'one exact gradient-descent update')
  assert.equal(tree.visualContract.durationSeconds, 82)
  assert.equal(tree.visualContract.languageNeutral, true)
})

test('prompt and transcripts cover all segments without inline citations', () => {
  const prompt = readFileSync(resolve(root, metadata.prompt), 'utf8')
  assert.match(prompt, /Function composition and numerical authority/)
  assert.match(prompt, /Blue only for the prediction line/)
  for (const transcriptPath of [metadata.transcriptZhCN, metadata.transcriptEn]) {
    const transcript = readFileSync(resolve(root, transcriptPath), 'utf8')
    for (const timestamp of ['0:00', '0:12', '0:24', '0:36', '0:48', '1:00', '1:12']) {
      assert.match(transcript, new RegExp(timestamp.replace(':', '\\:')))
    }
    assert.doesNotMatch(transcript, /\[[^\]]+\]\(https?:\/\//)
    assert.doesNotMatch(transcript, /来源参考|### Ref ID/)
  }
})

test('selective renderer check mode validates probe, hashes, and source records', () => {
  const renderer = readFileSync(resolve(root, 'scripts/manim/render_gradient_descent.py'), 'utf8')
  assert.match(renderer, /--scene/)
  assert.match(renderer, /--quality/)
  assert.match(renderer, /--check/)
  assert.match(renderer, /1920,1080/)
  const result = spawnSync('python3', ['scripts/manim/render_gradient_descent.py', '--check'], {
    cwd: root,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /assets match probes, hashes, chapters, and source records/)
})
