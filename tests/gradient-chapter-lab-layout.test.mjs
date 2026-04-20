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
  assert.match(componentSource, /class="panel gradient-chapter-lab__workspace"/)
  assert.match(componentSource, /class="gradient-chapter-lab__workspace-primary"/)
  assert.match(componentSource, /class="gradient-chapter-lab__workspace-secondary"/)

  const vizIndex = componentSource.indexOf('<GradientDescentViz')
  const primaryIndex = componentSource.indexOf('class="gradient-chapter-lab__workspace-primary"')
  const secondaryIndex = componentSource.indexOf('class="gradient-chapter-lab__workspace-secondary"')

  assert.notEqual(vizIndex, -1)
  assert.notEqual(primaryIndex, -1)
  assert.notEqual(secondaryIndex, -1)
  assert.ok(vizIndex < primaryIndex, 'visualization should appear before primary controls')
  assert.ok(primaryIndex < secondaryIndex, 'secondary settings should follow the primary workspace')
})

test('gradient chapter lab styles define the unified workspace grid', () => {
  assert.match(styleSource, /\.gradient-chapter-lab__workspace\s*\{/)
  assert.match(styleSource, /\.gradient-chapter-lab__workspace-primary\s*\{/)
  assert.match(styleSource, /\.gradient-chapter-lab__workspace-secondary\s*\{/)
})
