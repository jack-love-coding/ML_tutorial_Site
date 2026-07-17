import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'

import {
  normalizeImageReference,
  resolveAssetTarget,
} from '../scripts/import-cs357-notes.mjs'

test('CS357 image normalization accepts normal files from nested note paths', () => {
  assert.deepEqual(
    normalizeImageReference('../../course/assets/img/figs/finite_diff_errors.png?raw=1'),
    {
      filename: 'finite_diff_errors.png',
      localPath: '/math-lab/cs357-assets/figs/finite_diff_errors.png',
    },
  )
})

test('CS357 image normalization rejects traversal after the trusted figures prefix', () => {
  assert.throws(
    () => normalizeImageReference('/assets/img/figs/../../import-cs357-notes.mjs'),
    /Unsafe CS357 asset filename/,
  )
  assert.throws(
    () => normalizeImageReference('/assets/img/figs/%2e%2e%2fescaped.mjs'),
    /Unsafe CS357 asset filename/,
  )
  assert.throws(
    () => normalizeImageReference(String.raw`/assets/img/figs/..\escaped.mjs`),
    /Unsafe CS357 asset filename/,
  )
})

test('CS357 asset targets remain direct children of the configured output directory', () => {
  const outputDir = path.resolve('/tmp/ml-atlas-cs357-assets')

  assert.equal(
    resolveAssetTarget('finite_diff_errors.png', outputDir),
    path.join(outputDir, 'finite_diff_errors.png'),
  )
  assert.throws(
    () => resolveAssetTarget('../../escaped.mjs', outputDir),
    /Unsafe CS357 asset filename/,
  )
  assert.throws(
    () => resolveAssetTarget('nested/figure.png', outputDir),
    /Unsafe CS357 asset filename/,
  )
})
