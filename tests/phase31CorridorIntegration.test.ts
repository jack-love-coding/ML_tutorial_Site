import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { aiFoundationCourse } from '../src/curriculum/courses/data/aiFoundation.ts'
import { curriculumModuleById } from '../src/curriculum/catalog.ts'
import {
  classicalSupervisedCorridor,
  classicalSupervisedCorridorById,
} from '../src/curriculum/milestones/classicalSupervisedCorridor.ts'
import { algorithmCheckpointsBySlug } from '../src/data/algorithmCheckpoints.ts'

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('Phase 31 owns one exact five-module canonical corridor', () => {
  assert.deepEqual(
    classicalSupervisedCorridor.map((step) => step.id),
    ['loss-functions', 'linear-regression', 'housing-price-project', 'logistic-regression', 'classification'],
  )
  assert.deepEqual(
    classicalSupervisedCorridor.map((step) => step.blueprintId),
    ['loss-functions', 'linear-regression', 'project-tabular-regression', 'logistic-regression', 'classification'],
  )

  for (const [index, step] of classicalSupervisedCorridor.entries()) {
    assert.equal(step.order, index + 1)
    assert.equal(step.route, `/learn/${step.id}`)
    assert.ok(step.title['zh-CN'].trim())
    assert.ok(step.title.en.trim())
    assert.ok(step.role['zh-CN'].trim())
    assert.ok(step.role.en.trim())
    assert.equal(step.previousModuleId, classicalSupervisedCorridor[index - 1]?.id)
    assert.equal(step.nextModuleId, classicalSupervisedCorridor[index + 1]?.id)
    assert.equal(classicalSupervisedCorridorById.get(step.id), step)
  }
})

test('catalog prerequisites express the same loss-to-decision chain without changing IDs or routes', () => {
  const expectedPrerequisites = new Map([
    ['loss-functions', []],
    ['linear-regression', ['loss-functions']],
    ['housing-price-project', ['linear-regression']],
    ['logistic-regression', ['loss-functions', 'linear-regression', 'housing-price-project']],
    ['classification', ['logistic-regression']],
  ])

  for (const step of classicalSupervisedCorridor) {
    const moduleDefinition = curriculumModuleById.get(step.id)
    assert.ok(moduleDefinition)
    assert.equal(moduleDefinition.route, step.route)
    assert.deepEqual(moduleDefinition.prerequisiteIds, expectedPrerequisites.get(step.id))
  }
})

test('AI Foundations units point to every corridor module through canonical resource references', () => {
  for (const step of classicalSupervisedCorridor) {
    assert.ok(step.courseUnitIds.length > 0)
    for (const unitId of step.courseUnitIds) {
      const unit = aiFoundationCourse.units.find((candidate) => candidate.id === unitId)
      assert.equal(unit?.publicationStatus, 'published')
      const references = unit?.steps.flatMap((studyStep) => studyStep.resourceRefs ?? []) ?? []
      assert.ok(
        references.some((reference) => reference.kind === 'curriculum' && reference.moduleId === step.id),
        `${unitId} must reference ${step.id}`,
      )
    }
  }
})

test('all five modules retain bilingual chapters and formative checkpoints', () => {
  for (const step of classicalSupervisedCorridor) {
    const moduleDefinition = curriculumModuleById.get(step.id)!
    assert.ok(moduleDefinition.lessons.length >= 6)
    assert.ok(moduleDefinition.outcomeIds.length > 0)
    for (const lesson of moduleDefinition.lessons) {
      assert.ok(lesson.title['zh-CN'].trim())
      assert.ok(lesson.title.en.trim())
      assert.ok(lesson.summary['zh-CN'].trim())
      assert.ok(lesson.summary.en.trim())
    }
    for (const checkpoint of algorithmCheckpointsBySlug[step.id]) {
      assert.ok(checkpoint.prompt['zh-CN'].trim())
      assert.ok(checkpoint.prompt.en.trim())
      assert.ok(checkpoint.explanation['zh-CN'].trim())
      assert.ok(checkpoint.explanation.en.trim())
      assert.ok(checkpoint.revisitChapterId)
    }
  }

  for (const path of [
    'src/data/lossFunctionsModule.ts',
    'src/data/linearRegressionModule.ts',
    'src/data/housingProjectLesson.ts',
    'src/data/logisticRegressionModule.ts',
    'src/data/classificationModule.ts',
  ]) {
    const source = read(path)
    assert.match(source, /核心问题|coreQuestion:|problem\(/)
    assert.match(source, /Core Question|coreQuestion:|problem\(/)
    assert.match(source, /误解|误区|misconception|commonMistake:/)
  }

  const housingBlocks = read('src/data/housingProjectLesson.ts')
  for (const blockKind of ['code', 'runtime-output', 'formula', 'misconception', 'observation-lab']) {
    assert.match(housingBlocks, new RegExp(`['"]${blockKind}['"]`))
  }
})

test('the shared navigator is visible but never gates lessons or writes progress', () => {
  const view = read('src/views/AlgorithmView.vue')
  const component = read('src/components/CorridorNavigator.vue')
  const contract = read('src/curriculum/milestones/classicalSupervisedCorridor.ts')
  assert.match(view, /<CorridorNavigator v-if="corridorModuleId"/)
  assert.match(component, /<nav class="corridor-nav"/)
  assert.match(component, /:aria-current="step\.id === moduleId \? 'step'/)
  assert.match(component, /courseUnitRoute\('ai-foundation'/)
  assert.doesNotMatch(`${component}\n${contract}`, /localStorage|sessionStorage|saveProgress|disabled=/)
})

test('Phase 31 browser gate covers bilingual desktop/mobile traversal and legacy-store preservation', () => {
  const matrix = read('scripts/qa/phase31CorridorBrowserMatrix.js')
  const runner = read('scripts/qa/run-phase31-corridor-browser-matrix.mjs')
  const packageSource = read('package.json')
  for (const step of classicalSupervisedCorridor) assert.match(matrix, new RegExp(step.id))
  assert.match(matrix, /const locales = \['zh-CN', 'en'\]/)
  assert.match(matrix, /const widths = \[1440, 390\]/)
  assert.match(matrix, /page\.keyboard\.press\('Enter'\)/)
  assert.match(matrix, /legacySentinels/)
  assert.match(matrix, /katexErrors === 0/)
  assert.match(runner, /runBoundedProcess/)
  assert.match(runner, /stopProcess/)
  assert.match(packageSource, /"test:phase31:browser"/)
})
