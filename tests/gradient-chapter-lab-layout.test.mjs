import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const componentSource = readFileSync(
  new URL('../src/components/GradientChapterLab.vue', import.meta.url),
  'utf8',
)

const styleSource = readFileSync(
  new URL('../src/style.css', import.meta.url),
  'utf8',
)

test('gradient chapter lab uses a unified workspace shell', () => {
  assert.match(componentSource, /class="gradient-chapter-lab__workspace"/)
  assert.match(componentSource, /variant="cockpit"/)
  assert.match(componentSource, /class="gradient-chapter-lab__taskbar"/)
  assert.match(componentSource, /class="gradient-chapter-lab__workspace-primary"/)
  assert.match(componentSource, /<details class="gradient-chapter-lab__details"/)
  assert.match(componentSource, /compact/)
  assert.doesNotMatch(componentSource, /class="gradient-chapter-lab__hero"/)
  assert.doesNotMatch(componentSource, /class="gradient-chapter-lab__terrain"/)

  const vizIndex = componentSource.indexOf('<GradientDescentViz')
  const primaryIndex = componentSource.indexOf('class="gradient-chapter-lab__workspace-primary"')
  const detailsIndex = componentSource.indexOf('class="gradient-chapter-lab__details"')

  assert.notEqual(vizIndex, -1)
  assert.notEqual(primaryIndex, -1)
  assert.notEqual(detailsIndex, -1)
  assert.ok(vizIndex < primaryIndex, 'visualization should appear before primary controls')
  assert.ok(primaryIndex < detailsIndex, 'low-frequency settings should move into collapsed details')
})

test('gradient chapter lab styles define the unified workspace grid', () => {
  assert.match(styleSource, /\.lesson-workbench--cockpit/)
  assert.match(styleSource, /minmax\(620px, 1fr\) minmax\(320px, 360px\)/)
  assert.match(styleSource, /\.gradient-chapter-lab__workspace\s*\{/)
  assert.match(styleSource, /\.gradient-chapter-lab__workspace-primary\s*\{/)
  assert.match(styleSource, /\.gradient-chapter-lab__taskbar\s*\{/)
  assert.match(styleSource, /\.gradient-chapter-lab__details\s*,/)
})
