import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { renderCurriculumCatalogMetadata } from '../scripts/generateCurriculumCatalogMetadata.ts'
import { curriculumCatalog } from '../src/curriculum/catalog.ts'
import {
  curriculumCatalogMetadata,
  curriculumMetadataById,
} from '../src/curriculum/catalogMetadata.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('generated curriculum metadata stays aligned with the canonical typed catalog', () => {
  assert.equal(curriculumCatalogMetadata.length, curriculumCatalog.length)
  assert.equal(curriculumMetadataById.size, curriculumCatalog.length)

  for (const moduleDefinition of curriculumCatalog) {
    const { lessons: _lessons, ...expectedMetadata } = moduleDefinition
    assert.deepEqual(curriculumMetadataById.get(moduleDefinition.id), expectedMetadata)
  }

  assert.equal(
    read('src/curriculum/generated/catalogMetadata.ts'),
    renderCurriculumCatalogMetadata(),
  )
})

test('runtime curriculum overview modules do not import complete lesson bodies', () => {
  for (const path of [
    'src/curriculum/roles.ts',
    'src/curriculum/spine.ts',
    'src/curriculum/tracks.ts',
    'src/views/CurriculumSpineView.vue',
    'src/views/CurriculumTrackView.vue',
    'src/views/CurriculumLibraryView.vue',
    'src/views/CurriculumProgressView.vue',
  ]) {
    assert.doesNotMatch(read(path), /from ['"](?:\.\.\/|\.\/)*curriculum\/catalog\.ts['"]|from ['"]\.\/catalog\.ts['"]/)
  }
})
