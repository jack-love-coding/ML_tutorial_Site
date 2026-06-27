import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  curriculumNavigationMenus,
  coreExperimentNavigationGroups,
  dataLabNavigationGroups,
  mathLabNavigationGroups,
} from '../src/data/navigationMenus.ts'
import { curriculumCatalog } from '../src/curriculum/catalog.ts'
import {
  coreLearningPathModuleIds,
  curriculumRouteManifestById,
} from '../src/curriculum/routeManifest.ts'
import { resolveCanonicalLearnRoute } from '../src/curriculum/routes.ts'
import { curriculumSpineRequiredModuleIds } from '../src/curriculum/spine.ts'
import { curriculumTracks } from '../src/curriculum/tracks.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('curriculum navigation exposes the unified top-level IA', () => {
  assert.deepEqual(
    curriculumNavigationMenus.map((menu) => menu.id),
    ['learning-path', 'topic-library', 'projects', 'progress'],
  )

  const learningPath = curriculumNavigationMenus.find((menu) => menu.id === 'learning-path')
  const topicLibrary = curriculumNavigationMenus.find((menu) => menu.id === 'topic-library')
  const projects = curriculumNavigationMenus.find((menu) => menu.id === 'projects')
  const progress = curriculumNavigationMenus.find((menu) => menu.id === 'progress')

  assert.equal(learningPath?.label.en, 'Default Spine')
  assert.equal(learningPath?.label['zh-CN'], '默认学习主线')
  assert.equal(learningPath?.overviewLink?.route, '/spine')
  assert.equal(learningPath?.overviewLink?.label.en, 'Default Spine')
  assert.equal(learningPath?.utilityLinks[0]?.route, '/tracks/core-learning-path')
  assert.equal(learningPath?.utilityLinks[0]?.label.en, 'Flat Module List')
  assert.equal(learningPath?.groups.length, 0)

  assert.equal(topicLibrary?.label.en, 'Support Lenses')
  assert.equal(topicLibrary?.label['zh-CN'], '支持镜头')
  assert.deepEqual(topicLibrary?.groups.map((group) => group.id), [
    'math-lens',
    'data-lens',
    'model-lens',
    'deep-learning-lens',
  ])
  assert.equal(projects?.overviewLink?.route, '/tracks/project-practice')
  assert.equal(progress?.overviewLink?.route, '/progress')

  for (const menu of curriculumNavigationMenus) {
    assert.ok(menu.label['zh-CN'].trim().length > 0)
    assert.ok(menu.label.en.trim().length > 0)
  }
})

test('default learning path mirrors the approved Curriculum Spine V1 order', () => {
  const spineRequiredIds = curriculumSpineRequiredModuleIds()
  const coreTrack = curriculumTracks.find((track) => track.id === 'core-learning-path')

  assert.deepEqual(coreLearningPathModuleIds, spineRequiredIds)
  assert.deepEqual(coreTrack?.moduleIds, spineRequiredIds)
  assert.deepEqual(spineRequiredIds.slice(0, 5), [
    'ai-overview',
    'python-notebook',
    'numerical-data',
    'categorical-data',
    'dataset-quality',
  ])
  assert.ok(spineRequiredIds.includes('optimizer-comparison'))
  assert.equal(spineRequiredIds.at(-1), 'attention-transformer')
  assert.ok(!spineRequiredIds.includes('llm-rag'))
  assert.ok(!spineRequiredIds.includes('housing-price-project'))
  assert.ok(!spineRequiredIds.includes('classification-project'))
})

test('legacy navigation groups remain exported during Phase 2', () => {
  assert.ok(coreExperimentNavigationGroups.length > 0)
  assert.ok(mathLabNavigationGroups.length > 0)
  assert.ok(dataLabNavigationGroups.length > 0)
})

test('lightweight route manifest stays aligned with the full curriculum catalog', () => {
  assert.equal(curriculumRouteManifestById.size, curriculumCatalog.length)

  for (const moduleDefinition of curriculumCatalog) {
    const manifestEntry = curriculumRouteManifestById.get(moduleDefinition.id)

    assert.ok(manifestEntry, `${moduleDefinition.id} needs a lightweight route manifest entry`)
    assert.equal(manifestEntry.source, moduleDefinition.source.namespace)
    assert.equal(manifestEntry.route, moduleDefinition.route)
  }
})

test('canonical learn route resolver preserves current runtime destinations', () => {
  assert.equal(resolveCanonicalLearnRoute('gradient-descent'), '/learn/gradient-descent')
  assert.equal(
    resolveCanonicalLearnRoute('gradient-descent', 'loss-function'),
    '/learn/gradient-descent/loss-function',
  )
  assert.equal(
    resolveCanonicalLearnRoute('beginner-linear-algebra'),
    '/math-lab/modules/beginner-linear-algebra',
  )
  assert.equal(resolveCanonicalLearnRoute('numerical-data'), '/data-lab/modules/numerical-data')
  assert.equal(resolveCanonicalLearnRoute('missing-module'), undefined)
})

test('router wires canonical routes while preserving legacy deep links', () => {
  const routerSource = read('src/router/index.ts')

  assert.match(routerSource, /path: '\/learn\/:moduleId'/)
  assert.match(routerSource, /path: '\/learn\/:moduleId\/:lessonId'/)
  assert.match(routerSource, /resolveCanonicalLearnRoute/)
  assert.match(routerSource, /path: '\/spine'/)
  assert.match(routerSource, /path: '\/tracks\/:trackId'/)
  assert.match(routerSource, /path: '\/library\/:domain'/)
  assert.match(routerSource, /path: '\/progress'/)

  const linearChapterIndex = routerSource.indexOf("path: '/learn/linear-regression/:chapterId'")
  const logisticChapterIndex = routerSource.indexOf("path: '/learn/logistic-regression/:chapterId'")
  const cnnChapterIndex = routerSource.indexOf("path: '/learn/cnn-visualization/:chapterId'")
  const genericLessonIndex = routerSource.indexOf("path: '/learn/:moduleId/:lessonId'")

  assert.ok(linearChapterIndex > -1 && linearChapterIndex < genericLessonIndex)
  assert.ok(logisticChapterIndex > -1 && logisticChapterIndex < genericLessonIndex)
  assert.ok(cnnChapterIndex > -1 && cnnChapterIndex < genericLessonIndex)

  assert.match(routerSource, /path: '\/math-lab\/modules\/:moduleId'/)
  assert.match(routerSource, /path: '\/data-lab\/modules\/:moduleId'/)
})

test('app shell renders curriculum navigation instead of the old three-product menu', () => {
  const appShellSource = read('src/components/AppShell.vue')
  const navigationSource = read('src/data/navigationMenus.ts')
  const routesSource = read('src/curriculum/routes.ts')

  assert.match(appShellSource, /curriculumNavigationMenus/)
  assert.doesNotMatch(appShellSource, /coreExperimentNavigationGroups/)
  assert.doesNotMatch(appShellSource, /moduleOrder/)
  assert.doesNotMatch(navigationSource, /coreLearningPathModuleIds\.map\(moduleLink\)/)
  assert.doesNotMatch(navigationSource, /curriculumCatalog/)
  assert.doesNotMatch(navigationSource, /curriculumTracks/)
  assert.doesNotMatch(routesSource, /curriculumCatalog/)
  assert.doesNotMatch(routesSource, /curriculumModuleById/)
})
