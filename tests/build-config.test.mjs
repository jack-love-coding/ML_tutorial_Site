import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('vite build config splits large vendor and course-content chunks explicitly', () => {
  const source = read('vite.config.ts')

  assert.match(source, /rolldownOptions/)
  assert.match(source, /codeSplitting/)
  assert.match(source, /vendor-vue/)
  assert.match(source, /vendor-three/)
  assert.match(source, /vendor-math-render/)
  assert.match(source, /math-lab-imported-notes/)
  assert.match(source, /math-lab-foundations/)
  assert.match(source, /math-lab-topic-modules/)
  assert.match(source, /chunkSizeWarningLimit:\s*600/)
})
