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
  curriculumLibraryDomains,
  isCurriculumLibraryDomain,
  resolveCurriculumLibraryDomain,
} from '../src/curriculum/library.ts'
import {
  coreLearningPathModuleIds,
  curriculumRouteManifestById,
} from '../src/curriculum/routeManifest.ts'
import { resolveCanonicalLearnRoute } from '../src/curriculum/routes.ts'
import { curriculumSpineRequiredModuleIds } from '../src/curriculum/spine.ts'
import { curriculumTracks } from '../src/curriculum/tracks.ts'
import { getNavigationAriaCurrent } from '../src/components/navigation/types.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('curriculum navigation exposes direct primary destinations and one category menu', () => {
  assert.deepEqual(
    curriculumNavigationMenus.map((menu) => menu.id),
    ['learning-path', 'topic-library', 'projects', 'progress'],
  )

  const byId = new Map(curriculumNavigationMenus.map((item) => [item.id, item]))
  assert.equal(byId.get('learning-path')?.route, '/spine')
  assert.equal(byId.get('projects')?.route, '/tracks/project-practice')
  assert.equal(byId.get('progress')?.route, '/progress')
  assert.equal(byId.get('topic-library')?.label['zh-CN'], '专题学习')
  assert.equal(byId.get('topic-library')?.label.en, 'Topic Library')
  const topicItems = byId.get('topic-library')?.groups.flatMap((group) => group.items) ?? []
  assert.deepEqual(
    topicItems.map((item) => item.route),
    ['/library/math', '/library/data', '/library/model', '/library/deep-learning'],
  )
  assert.equal(topicItems.some((item) => item.route.startsWith('/learn/')), false)
  assert.equal(topicItems.some((item) => item.route.startsWith('/math-lab/modules/')), false)

  for (const menu of curriculumNavigationMenus) {
    assert.ok(menu.label['zh-CN'].trim().length > 0)
    assert.ok(menu.label.en.trim().length > 0)
  }
})

test('topic library domains are bilingual and reject invalid route params', () => {
  assert.deepEqual(curriculumLibraryDomains.map((domain) => domain.id), [
    'math',
    'data',
    'model',
    'deep-learning',
    'project',
  ])
  assert.equal(isCurriculumLibraryDomain('deep-learning'), true)
  assert.equal(isCurriculumLibraryDomain('unknown'), false)
  assert.equal(resolveCurriculumLibraryDomain('unknown'), 'math')
  for (const domain of curriculumLibraryDomains) {
    assert.ok(domain.title['zh-CN'].trim())
    assert.ok(domain.title.en.trim())
  }
})

test('invalid topic library domains redirect to the math library', () => {
  const routerSource = read('src/router/index.ts')
  assert.match(routerSource, /redirectInvalidLibraryDomain/)
  assert.match(routerSource, /path: '\/library\/:domain'/)
  assert.match(routerSource, /beforeEnter: redirectInvalidLibraryDomain/)
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
  assert.ok(spineRequiredIds.indexOf('sequence-embedding-bridge') > spineRequiredIds.indexOf('cnn-visualization'))
  assert.ok(spineRequiredIds.indexOf('sequence-embedding-bridge') < spineRequiredIds.indexOf('attention-transformer'))
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

test('app shell delegates header and controlled navigation rendering', () => {
  const appShellSource = read('src/components/AppShell.vue')
  const headerSource = read('src/components/navigation/SiteHeader.vue')
  const renderedNavigationSource = read('src/components/navigation/SiteNavigation.vue')
  const navigationSource = read('src/data/navigationMenus.ts')
  const routesSource = read('src/curriculum/routes.ts')

  assert.match(appShellSource, /<SiteHeader/)
  assert.doesNotMatch(appShellSource, /curriculumNavigationMenus|openNavigationMenuId/)
  assert.doesNotMatch(appShellSource, /coreExperimentNavigationGroups/)
  assert.doesNotMatch(appShellSource, /moduleOrder/)
  assert.match(headerSource, /curriculumNavigationMenus/)
  assert.match(headerSource, /<SiteNavigation/)
  assert.match(headerSource, /openItemId/)
  assert.match(headerSource, /route\.fullPath/)
  assert.match(headerSource, /mobileMenuTrigger/)
  assert.match(headerSource, /nextTick\(.*\.focus/s)
  assert.match(headerSource, /closeNavigation\(isMenuOpen\.value\)/)
  assert.doesNotMatch(headerSource, /overviewLink|utilityLinks/)
  assert.match(renderedNavigationSource, /mobile: boolean/)
  assert.match(renderedNavigationSource, /openItemId/)
  assert.match(renderedNavigationSource, /aria-expanded/)
  assert.match(renderedNavigationSource, /keydown\.esc/)
  assert.match(renderedNavigationSource, /toggleButtons/)
  assert.match(renderedNavigationSource, /nextTick\(.*\.focus/s)
  assert.match(renderedNavigationSource, /navigateAndRestoreFocus/)
  assert.match(renderedNavigationSource, /emit\('toggle'/)
  assert.match(renderedNavigationSource, /emit\('close'/)
  assert.match(renderedNavigationSource, /emit\('navigate'/)
  assert.doesNotMatch(renderedNavigationSource, /const openItemId = ref/)
  assert.doesNotMatch(navigationSource, /coreLearningPathModuleIds\.map\(moduleLink\)/)
  assert.doesNotMatch(navigationSource, /curriculumCatalog/)
  assert.doesNotMatch(navigationSource, /curriculumTracks/)
  assert.doesNotMatch(routesSource, /curriculumCatalog/)
  assert.doesNotMatch(routesSource, /curriculumModuleById/)
})

test('navigation ARIA distinguishes exact pages from active sections', () => {
  assert.equal(getNavigationAriaCurrent(true, true), 'page')
  assert.equal(getNavigationAriaCurrent(false, true), 'location')
  assert.equal(getNavigationAriaCurrent(false, false), undefined)

  const renderedNavigationSource = read('src/components/navigation/SiteNavigation.vue')
  assert.match(renderedNavigationSource, /getNavigationAriaCurrent/)
  assert.doesNotMatch(renderedNavigationSource, /item\.active \? 'page'/)
  assert.doesNotMatch(renderedNavigationSource, /link\.active \? 'page'/)
})
