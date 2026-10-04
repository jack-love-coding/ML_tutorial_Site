import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')

test('home has fixed bilingual learning entry points and no learning storage', () => {
  const source = read('src/views/HomeView.vue')
  for (const path of ['/learn/ai-overview', '/spine', '/library/math', '/tracks/project-practice']) assert.ok(source.includes(path))
  assert.match(source, /开始学习/)
  assert.match(source, /Start reading/)
  assert.doesNotMatch(source, /Progress|localStorage|addEventListener/)
})

test('reference syllabus keeps published units accessible without completion forms', () => {
  const overview = read('src/views/CourseOverviewView.vue')
  const unit = read('src/views/CourseUnitView.vue')
  assert.match(overview, /publicationStatus === 'published'/)
  assert.match(overview, /courseUnitsForStage/)
  assert.match(unit, /ReferenceExample/)
  assert.doesNotMatch(unit, /setCourse|loadCourseProgress|v-model/)
})
