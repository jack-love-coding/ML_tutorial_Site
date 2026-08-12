import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')

test('shared ChapteredMediaPlayer owns base-safe sources, keyboard-native marker seeking, and poster fallback', () => {
  const source = read('src/components/ChapteredMediaPlayer.vue')
  assert.match(source, /withPublicBase\(assetPath\)/)
  assert.match(source, /withPublicBase\(posterPath\)/)
  assert.match(source, /<button[\s\S]*type="button"[\s\S]*@click="seek\(marker\.startSeconds\)"/)
  assert.match(source, /@error="failed = true"/)
  assert.ok(source.includes('<img\n      v-else'))
  assert.match(source, /<MarkdownMathContent :source="localized\(transcript\)"/)
})

test('shared player defaults to poster for reduced motion and cleans up media listeners', () => {
  const source = read('src/components/ChapteredMediaPlayer.vue')
  assert.match(source, /window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)/)
  assert.match(source, /motionQuery\.addEventListener\('change', updateMotionPreference\)/)
  assert.match(source, /motionQuery\?\.removeEventListener\('change', updateMotionPreference\)/)
  assert.match(source, /video\.value\?\.pause\(\)/)
  assert.match(source, /reducedMotion\.value = false/)
})

test('MLP and Gradient Descent delegate chaptered media without changing course-local lesson contracts', () => {
  const neural = read('src/lessons/NeuralGuidedLesson.vue')
  const gradient = read('src/components/gradient-descent/GradientLessonBlock.vue')
  assert.match(neural, /import ChapteredMediaPlayer from '\.\.\/components\/ChapteredMediaPlayer\.vue'/)
  assert.match(neural, /:asset-path="activeVisual\.assetPath"/)
  assert.match(neural, /:poster-path="activeVisual\.posterPath \?\? activeVisual\.assetPath"/)
  assert.match(gradient, /import ChapteredMediaPlayer from '\.\.\/ChapteredMediaPlayer\.vue'/)
  assert.match(gradient, /:asset-path="block\.assetPath"/)
  assert.match(gradient, /:chapter-markers="block\.chapterMarkers"/)
  assert.doesNotMatch(neural, /function seekVideo/)
  assert.doesNotMatch(gradient, /function seek\(/)
})
