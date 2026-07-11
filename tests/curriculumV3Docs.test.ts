import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { renderCurriculumV3Docs } from '../scripts/generateCurriculumV3Docs.ts'

test('V3 docs are generated from the typed blueprint', () => {
  const rendered = renderCurriculumV3Docs()
  assert.deepEqual([...rendered.keys()].sort(), [
    'README.md',
    'content-audit.md',
    'coverage.md',
    'implementation-backlog.md',
    'module-inventory.md',
    'project-map.md',
  ])
  assert.match(rendered.get('module-inventory.md') ?? '', /56 instructional modules/)
  assert.match(rendered.get('content-audit.md') ?? '', /53 current modules/)
  assert.match(rendered.get('project-map.md') ?? '', /project-small-transformer/)
  assert.match(rendered.get('coverage.md') ?? '', /llm-adaptation-and-rag/)
})

test('checked-in V3 docs match deterministic rendering', () => {
  for (const [filename, markdown] of renderCurriculumV3Docs()) {
    assert.equal(readFileSync(new URL(`../docs/curriculum-v3/${filename}`, import.meta.url), 'utf8'), markdown)
  }
})

test('mathematics-to-code pilot design is approved and whitespace-clean', () => {
  const design = readFileSync(
    new URL('../docs/superpowers/specs/2026-07-11-math-to-code-pilot-design.md', import.meta.url),
    'utf8',
  )
  assert.match(design, /^\*\*Status:\*\* Approved$/m)
  assert.doesNotMatch(design, /[ \t]+$/m)
})
