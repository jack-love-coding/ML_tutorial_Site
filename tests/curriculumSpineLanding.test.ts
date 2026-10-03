import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { curriculumModuleById } from '../src/curriculum/catalog.ts'
import { curriculumSpineStages } from '../src/curriculum/spine.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('spine landing route is a dedicated stage view while preserving the flat core track', () => {
  const routerSource = read('src/router/index.ts')
  const navigationSource = read('src/data/navigationMenus.ts')
  const homeSource = read('src/views/HomeView.vue')
  const progressSource = read('src/views/CurriculumProgressView.vue')

  assert.match(routerSource, /path: '\/spine'/)
  assert.match(routerSource, /CurriculumSpineView\.vue/)
  assert.match(routerSource, /path: '\/tracks\/:trackId'/)
  assert.match(navigationSource, /route: '\/spine'/)
  assert.match(navigationSource, /id: 'reference-syllabus'/)
  assert.match(navigationSource, /'\/spine'/)
  assert.match(navigationSource, /'\/tracks\/core-learning-path'/)
  assert.match(navigationSource, /'\/learn'/)
  assert.match(homeSource, /\/spine/)
  assert.match(progressSource, /route: '\/spine'/)
  assert.match(progressSource, /route: '\/tracks\/core-learning-path'/)
})

test('spine landing renders selectable units and chapter links from the reading sequence', () => {
  const source = read('src/views/CurriculumSpineView.vue')
  for (const token of ['teachingUnits', 'expandReadingStep', 'readingLocation', 'legacySpineUnitIds', 'activeUnitId', 'publicationStatus', 'unit.optional']) assert.ok(source.includes(token))
  assert.doesNotMatch(source, /localStorage|learningProgress/)
})


test('spine landing stage references resolve to current catalog modules', () => {
  assert.equal(curriculumSpineStages.length, 6)

  for (const stage of curriculumSpineStages) {
    const allModuleIds = [
      ...stage.requiredModuleIds,
      ...stage.supportModuleIds,
      ...(stage.projectModuleIds ?? []),
    ]

    assert.ok(stage.requiredModuleIds.length > 0, `${stage.id} should have at least one required module`)
    for (const moduleId of allModuleIds) {
      assert.ok(curriculumModuleById.has(moduleId), `${stage.id} references unknown module ${moduleId}`)
    }
  }

  assert.ok(
    curriculumSpineStages.some((stage) => stage.projectModuleIds?.includes('housing-price-project')),
    'stage landing should expose recommended project validation capstones',
  )
  assert.ok(
    curriculumSpineStages.some((stage) => stage.requiredModuleIds.includes('splits-generalization')),
    'stage landing should expose the filled sequence/embedding bridge as a required module',
  )
  assert.equal(
    curriculumSpineStages.some((stage) =>
      stage.knownGaps?.some((gap) => gap.en.includes('sequence/embedding bridge')),
    ),
    false,
    'stage landing should not keep the old sequence/embedding known gap after the bridge module ships',
  )
})
