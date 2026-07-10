import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumV3Arcs } from '../src/curriculum/v3/arcs.ts'

test('Curriculum V3 defines ten ordered bilingual arcs', () => {
  assert.deepEqual(curriculumV3Arcs.map((arc) => arc.id), [
    'math-language',
    'linear-algebra',
    'calculus-probability-optimization',
    'data-to-features',
    'classical-supervised-learning',
    'generalization-evaluation',
    'neural-network-foundations',
    'deep-learning-structures',
    'transformers-language-models',
    'llm-adaptation-retrieval',
  ])
  assert.deepEqual(curriculumV3Arcs.map((arc) => arc.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  for (const arc of curriculumV3Arcs) {
    assert.ok(arc.title['zh-CN'].trim())
    assert.ok(arc.title.en.trim())
    assert.ok(arc.purpose['zh-CN'].trim())
    assert.ok(arc.purpose.en.trim())
  }
})
