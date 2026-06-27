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
  assert.match(navigationSource, /activePrefixes: \['\/spine', '\/tracks\/core-learning-path', '\/learn'\]/)
  assert.match(homeSource, /route: '\/spine'/)
  assert.match(progressSource, /route: '\/spine'/)
  assert.match(progressSource, /route: '\/tracks\/core-learning-path'/)
})

test('spine landing source renders stages, support lenses, project validation, and known gaps', () => {
  const spineSource = read('src/views/CurriculumSpineView.vue')
  const stylesSource = read('src/styles/views/curriculum.css')

  assert.match(spineSource, /curriculumSpineStages/)
  assert.match(spineSource, /requiredModuleIds/)
  assert.match(spineSource, /supportModuleIds/)
  assert.match(spineSource, /projectModuleIds/)
  assert.match(spineSource, /knownGaps/)
  assert.match(spineSource, /localizedText\(stage\.bridge\)/)
  assert.match(spineSource, /function localizedSupportNote/)
  assert.match(spineSource, /localizedText\(stage\.supportNote\)/)
  assert.match(spineSource, /resolveCanonicalLearnRoute/)
  assert.match(spineSource, /function stageLabel\(index: number\)/)
  assert.match(spineSource, /\/tracks\/core-learning-path/)
  assert.match(spineSource, /spine-stage-card/)
  assert.match(spineSource, /spine-stage-card__bridge/)
  assert.match(spineSource, /spine-stage-card__support-note/)
  assert.match(spineSource, /spine-stage-card__modules/)
  assert.match(spineSource, /spine-stage-card__gap/)
  assert.match(spineSource, /spine-stage-nav/)
  assert.match(spineSource, /why it comes next/)
  assert.doesNotMatch(spineSource, /known coverage gaps/)
  assert.doesNotMatch(spineSource, /labels\.stages }} {{ stage\.index/)
  assert.doesNotMatch(spineSource, /migrateLearningProgressV2|localStorage|learningProgress/)

  assert.match(stylesSource, /\.spine-stage-nav/)
  assert.match(stylesSource, /\.spine-stage-card/)
  assert.match(stylesSource, /\.spine-stage-card__bridge/)
  assert.match(stylesSource, /\.spine-stage-card__support-note/)
  assert.match(stylesSource, /\.spine-stage-card__modules/)
  assert.match(stylesSource, /\.spine-stage-card__gap/)
})

test('spine landing stage references resolve to current catalog modules', () => {
  assert.equal(curriculumSpineStages.length, 11)

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
    curriculumSpineStages.some((stage) => stage.requiredModuleIds.includes('sequence-embedding-bridge')),
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
