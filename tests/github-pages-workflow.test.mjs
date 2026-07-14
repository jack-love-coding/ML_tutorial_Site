import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const workflow = readFileSync(
  new URL('../.github/workflows/deploy-pages.yml', import.meta.url),
  'utf8',
)

test('GitHub Pages installs ffprobe before running media validation tests', () => {
  const mediaToolsIndex = workflow.indexOf('- name: Install media validation tools')
  const testIndex = workflow.indexOf('- name: Test')

  assert.ok(mediaToolsIndex >= 0, 'workflow must install FFmpeg and ffprobe')
  assert.ok(testIndex > mediaToolsIndex, 'media tools must be installed before npm test')
  assert.match(workflow, /sudo apt-get install --no-install-recommends -y ffmpeg/)
  assert.match(workflow, /ffprobe -version/)
})
