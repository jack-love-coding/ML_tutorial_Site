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
  const validation = execFileSync('python3', [renderer, '--validate-sources'], { cwd: root, encoding: 'utf8' })
  assert.match(validation, /4 logistic scenes/i)
  assert.throws(
    () => execFileSync('python3', [renderer, '--scene', 'unknown-scene', '--quality', 'preview'], { cwd: root, encoding: 'utf8', stdio: 'pipe' }),
    /invalid choice|unknown/i,
  )
})

test('published binary checks stay deferred until Plan 29-04 publishes a metadata package', () => {
  assert.equal(existsSync(metadataPath), false, 'Plan 29-03 authors sources without replacing the existing binaries')
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
