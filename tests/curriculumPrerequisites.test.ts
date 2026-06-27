import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumCatalog } from '../src/curriculum/catalog.ts'
import {
  findMissingPrerequisites,
  findPrerequisiteCycles,
  trackRespectsPrerequisites,
} from '../src/curriculum/prerequisites.ts'
import { curriculumSpineRequiredModuleIds } from '../src/curriculum/spine.ts'
import { curriculumTracks } from '../src/curriculum/tracks.ts'

test('curriculum prerequisites point at known modules and form a DAG', () => {
  assert.deepEqual(findMissingPrerequisites(curriculumCatalog), [])
  assert.deepEqual(findPrerequisiteCycles(curriculumCatalog), [])
})

test('core learning track is explicit and prerequisite-safe', () => {
  const coreTrack = curriculumTracks.find((track) => track.id === 'core-learning-path')

  assert.ok(coreTrack)
  assert.equal(coreTrack.kind, 'core')
  assert.deepEqual(coreTrack.moduleIds, curriculumSpineRequiredModuleIds())
  assert.deepEqual(coreTrack.moduleIds.slice(0, 5), [
    'ai-overview',
    'python-notebook',
    'numerical-data',
    'categorical-data',
    'dataset-quality',
  ])
  assert.deepEqual(trackRespectsPrerequisites(curriculumCatalog, coreTrack.moduleIds), [])
})

test('topic and project tracks use known catalog IDs', () => {
  const knownIds = new Set(curriculumCatalog.map((moduleDefinition) => moduleDefinition.id))

  for (const track of curriculumTracks) {
    assert.ok(track.title['zh-CN'].trim().length > 0)
    assert.ok(track.title.en.trim().length > 0)
    assert.ok(track.description['zh-CN'].trim().length > 0)
    assert.ok(track.description.en.trim().length > 0)

    for (const moduleId of track.moduleIds) {
      assert.ok(knownIds.has(moduleId), `${track.id} references unknown module ${moduleId}`)
    }
  }
})
