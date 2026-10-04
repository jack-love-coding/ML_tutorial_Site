import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { generateCurriculumFiles } from '../scripts/generateCurriculumCatalogMetadata.ts'
import { curriculumModuleById } from '../src/curriculum/catalog.ts'
import { curriculumRouteManifestById } from '../src/curriculum/routeManifest.ts'
import { legacyAiOverviewLessons, resolveCanonicalLearnRedirect } from '../src/curriculum/routes.ts'

test('every generated projection matches the actual lazy-loaded runtime courses', async () => {
  for (const [name, source] of await generateCurriculumFiles()) {
    assert.equal(readFileSync(new URL(`../src/curriculum/generated/${name}`, import.meta.url), 'utf8'), source, name)
  }
})

test('retired AI overview chapter links resolve to real current chapters', () => {
  const ids = new Set(curriculumModuleById.get('ai-overview')!.lessons.map((lesson) => lesson.id))
  for (const [legacy, current] of Object.entries(legacyAiOverviewLessons)) {
    assert.ok(ids.has(current))
    assert.deepEqual(resolveCanonicalLearnRedirect('ai-overview', legacy), { path: `/learn/ai-overview/${current}` })
    assert.equal(resolveCanonicalLearnRedirect('ai-overview', current), undefined)
  }
})

test('Python and AI overview catalogues expose their current eight chapters', () => {
  for (const id of ['python-notebook', 'ai-overview']) {
    const module = curriculumModuleById.get(id)!
    assert.equal(module.lessons.length, 8)
    assert.equal(curriculumRouteManifestById.get(id)?.firstLessonId, module.lessons[0]?.id)
    for (const lesson of module.lessons) {
      assert.notEqual(lesson.title['zh-CN'], lesson.id)
      assert.notEqual(lesson.title.en, lesson.id)
    }
  }
  assert.equal(curriculumRouteManifestById.get('python-notebook')?.firstLessonId, 'notebook-workflow')
})
