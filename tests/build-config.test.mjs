import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('vite build config does not manually split runtime vendor chunks', () => {
  const source = read('vite.config.ts')

  assert.doesNotMatch(source, /rolldownOptions/)
  assert.doesNotMatch(source, /codeSplitting/)
  assert.doesNotMatch(source, /vendor-vue|vendor-three|vendor-math-render|vendor-d3/)
  assert.match(source, /chunkSizeWarningLimit:\s*1400/)
})
