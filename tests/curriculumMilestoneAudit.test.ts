import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { algorithmProgressStorageKey } from '../src/utils/algorithmProgress.ts'
import { mathLabProgressStorageKey } from '../src/modules/math-lab/utils/progress.ts'
import { dataLabProgressStorageKey } from '../src/modules/data-lab/utils/progress.ts'
import { curriculumCatalog } from '../src/curriculum/catalog.ts'
import {
  coreLearningPathModuleIds,
  curriculumRouteManifest,
  curriculumRouteManifestById,
  projectPracticeModuleIds,
} from '../src/curriculum/routeManifest.ts'
import {
  curriculumSpineRequiredModuleIds,
  curriculumSpineStages,
  curriculumSpineValidationIssues,
} from '../src/curriculum/spine.ts'
import {
  resolveCanonicalLearnRedirect,
  resolveCanonicalLearnRoute,
} from '../src/curriculum/routes.ts'
import {
  learningProgressV2MigrationKey,
  learningProgressV2StorageKey,
  migrateLearningProgressV2,
} from '../src/curriculum/progress.ts'
import {
  validateCurriculumLocalization,
  validateUniqueCurriculumIds,
} from '../src/curriculum/validation.ts'
import { lessonInteractionProtocols } from '../src/lessons/interactionProtocol.ts'
import { lessonLabRegistry, lessonPagePilotSlugs } from '../src/lessons/labRegistry.ts'

class MemoryStorage {
  private values = new Map<string, string>()

  constructor(initial: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(initial)) this.values.set(key, value)
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }

  removeItem(key: string) {
    this.values.delete(key)
  }
}

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

function json(value: unknown) {
  return JSON.stringify(value)
}

test('milestone audit keeps current curriculum modules reachable through the manifest and canonical resolver', () => {
  assert.equal(curriculumRouteManifest.length, curriculumCatalog.length)
  assert.equal(curriculumRouteManifestById.size, curriculumCatalog.length)
  assert.deepEqual(validateUniqueCurriculumIds(curriculumCatalog), [])

  for (const moduleDefinition of curriculumCatalog) {
    const manifestEntry = curriculumRouteManifestById.get(moduleDefinition.id)

    assert.ok(manifestEntry, `${moduleDefinition.id} needs a manifest entry`)
    assert.equal(manifestEntry.route, moduleDefinition.route)
    assert.equal(manifestEntry.source, moduleDefinition.source.namespace)

    const resolvedRoute = resolveCanonicalLearnRoute(moduleDefinition.id, manifestEntry.firstLessonId)
    assert.ok(resolvedRoute, `${moduleDefinition.id} should resolve from canonical route helper`)

    if (moduleDefinition.source.namespace === 'algorithm') {
      assert.equal(resolvedRoute, manifestEntry.firstLessonId
        ? `/learn/${moduleDefinition.id}/${manifestEntry.firstLessonId}`
        : `/learn/${moduleDefinition.id}`)
      assert.equal(resolveCanonicalLearnRedirect(moduleDefinition.id, manifestEntry.firstLessonId), undefined)
    } else {
      assert.equal(resolvedRoute, moduleDefinition.route)
      assert.equal(resolveCanonicalLearnRedirect(moduleDefinition.id, manifestEntry.firstLessonId), moduleDefinition.route)
    }
  }

  for (const moduleId of [...coreLearningPathModuleIds, ...projectPracticeModuleIds]) {
    assert.ok(curriculumRouteManifestById.has(moduleId), `${moduleId} should stay in the route manifest`)
  }
})

test('milestone audit preserves legacy URL handlers alongside canonical routes', () => {
  const routerSource = read('src/router/index.ts')
  const fallbackScript = read('scripts/create-pages-fallbacks.mjs')

  for (const routePattern of [
    "path: '/learn/:moduleId'",
    "path: '/learn/:moduleId/:lessonId'",
    "path: '/math-lab/modules/:moduleId'",
    "path: '/data-lab/modules/:moduleId'",
    "path: '/learn/linear-regression/:chapterId'",
    "path: '/learn/logistic-regression/:chapterId'",
    "path: '/learn/cnn-visualization/:chapterId'",
    "path: '/spine'",
    "path: '/tracks/:trackId'",
    "path: '/library/:domain'",
    "path: '/progress'",
  ]) {
    assert.ok(routerSource.includes(routePattern), `${routePattern} should remain wired`)
  }

  assert.match(fallbackScript, /'\/spine'/)
  assert.match(fallbackScript, /data-lab\/modules/)
  assert.match(fallbackScript, /math-lab\/modules/)
})

test('milestone audit keeps progress v1 storage intact while writing progress v2', () => {
  const algorithmRaw = json({
    completedModuleSlugs: ['ai-overview'],
    lastVisitedModuleSlug: 'gradient-descent',
    quizAttempts: [],
    updatedAt: '2026-06-20T09:00:00.000Z',
  })
  const mathRaw = json({
    completedModuleIds: ['beginner-linear-algebra'],
    quizAttempts: [],
    updatedAt: '2026-06-21T09:00:00.000Z',
  })
  const dataRaw = json({
    completedModuleIds: ['numerical-data'],
    quizAttempts: [],
    updatedAt: '2026-06-22T09:00:00.000Z',
  })
  const storage = new MemoryStorage({
    [algorithmProgressStorageKey]: algorithmRaw,
    [mathLabProgressStorageKey]: mathRaw,
    [dataLabProgressStorageKey]: dataRaw,
  })

  const progress = migrateLearningProgressV2(storage, '2026-06-25T00:00:00.000Z')

  assert.equal(progress.modules['ai-overview']?.completed, true)
  assert.equal(progress.modules['beginner-linear-algebra']?.completed, true)
  assert.equal(progress.modules['numerical-data']?.completed, true)
  assert.equal(storage.getItem(algorithmProgressStorageKey), algorithmRaw)
  assert.equal(storage.getItem(mathLabProgressStorageKey), mathRaw)
  assert.equal(storage.getItem(dataLabProgressStorageKey), dataRaw)
  assert.ok(storage.getItem(learningProgressV2StorageKey))
  assert.ok(storage.getItem(learningProgressV2MigrationKey))
  assert.deepEqual(progress.migration?.sourceKeys, [
    algorithmProgressStorageKey,
    mathLabProgressStorageKey,
    dataLabProgressStorageKey,
  ])
})

test('milestone audit keeps bilingual catalog validation and pilot protocols complete', () => {
  assert.deepEqual(validateCurriculumLocalization(curriculumCatalog), [])

  const protocolModules = new Set(lessonInteractionProtocols.map((protocol) => protocol.moduleSlug))
  for (const slug of lessonPagePilotSlugs) {
    const protocol = lessonInteractionProtocols.find((item) => item.moduleSlug === slug)
    assert.ok(protocolModules.has(slug), `${slug} should keep a teaching interaction protocol`)
    assert.equal(protocol?.labId, lessonLabRegistry[slug].labId)
  }
})

test('milestone audit keeps the approved Curriculum Spine V1 contract valid', () => {
  assert.deepEqual(curriculumSpineValidationIssues(), [])
  assert.equal(curriculumSpineStages.at(0)?.id, 'orientation')

  const requiredIds = curriculumSpineRequiredModuleIds()
  assert.deepEqual(requiredIds.slice(0, 5), [
    'ai-overview',
    'python-notebook',
    'numerical-data',
    'categorical-data',
    'dataset-quality',
  ])
  assert.ok(requiredIds.includes('optimizer-comparison'))
  assert.ok(requiredIds.indexOf('optimizer-comparison') < requiredIds.indexOf('cnn-visualization'))
  assert.equal(requiredIds.at(-1), 'attention-transformer')
  assert.ok(!requiredIds.includes('llm-rag'))
  assert.ok(!requiredIds.includes('housing-price-project'))
  assert.ok(!requiredIds.includes('classification-project'))
})

test('milestone audit documents every completed phase and the current refactor state', () => {
  for (const path of [
    '.planning/PROJECT.md',
    '.planning/ROADMAP.md',
    '.planning/STATE.md',
    'docs/refactor/baseline.md',
    'docs/refactor/curriculum-v2-brief.md',
    'docs/refactor/designs/phase-9-curriculum-spine-v1.md',
  ]) {
    assert.ok(existsSync(new URL(path, root)), `${path} should exist`)
  }

  for (const phase of [1, 2, 3, 4, 5, 6]) {
    assert.ok(existsSync(new URL(`docs/refactor/decisions/phase-${phase}.md`, root)))
    assert.ok(existsSync(new URL(`docs/refactor/summaries/phase-${phase}.md`, root)))
  }
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-7.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-8.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-9.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-10.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-11.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-12.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-13.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-14.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-15.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-16.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-17.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-18.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-19.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-20.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-21.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-22.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-23.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/phase-24a.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/summaries/curriculum-v3-0.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/designs/phase-10-sequence-bridge-shape-lab.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/designs/phase-11-data-pipeline-task-lab.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/designs/phase-12-data-first-corridor-audit.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/designs/phase-13-categorical-vocabulary-contract-task-lab.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/designs/phase-14-data-quality-decision-record.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/designs/phase-15-curriculum-architecture-teaching-route-audit.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/designs/phase-17-mlp-backprop-mechanism-bridge.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/designs/phase-19-cnn-shape-parameter-challenge.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/designs/phase-20-optimizer-curve-diagnosis-challenge.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/designs/phase-21-attention-qkv-softmax-task.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/designs/phase-22-transformer-block-assembly-challenge.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/designs/phase-23-architecture-tools-handoff-challenge.md', root)))
  assert.ok(existsSync(new URL('docs/superpowers/specs/2026-07-08-cnn-shape-parameter-challenge-design.md', root)))
  assert.ok(existsSync(new URL('docs/superpowers/plans/2026-07-08-cnn-shape-parameter-challenge.md', root)))
  assert.ok(existsSync(new URL('docs/superpowers/specs/2026-07-08-optimizer-curve-diagnosis-design.md', root)))
  assert.ok(existsSync(new URL('docs/superpowers/plans/2026-07-08-optimizer-curve-diagnosis-challenge.md', root)))
  assert.ok(existsSync(new URL('docs/superpowers/specs/2026-07-08-attention-qkv-softmax-task-design.md', root)))
  assert.ok(existsSync(new URL('docs/superpowers/specs/2026-07-08-transformer-block-assembly-design.md', root)))
  assert.ok(existsSync(new URL('docs/superpowers/specs/2026-07-08-architecture-tools-handoff-design.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/audits/curriculum-v2-milestone-audit.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/audits/phase-12-data-first-corridor-audit.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/audits/phase-15-curriculum-architecture-teaching-route-audit.md', root)))
  assert.ok(existsSync(new URL('docs/refactor/audits/phase-18-optimizer-cnn-handoff-audit.md', root)))

  const roadmapSource = read('.planning/ROADMAP.md')
  assert.match(roadmapSource, /Phase 21: Attention Q\/K\/V Softmax Task/)
  assert.match(roadmapSource, /AttentionQkvChallengeLab/)
  assert.match(roadmapSource, /row-wise softmax/)
  assert.match(roadmapSource, /Phase 22: Transformer Block Assembly Challenge/)
  assert.match(roadmapSource, /TransformerBlockAssemblyChallengeLab/)
  assert.match(roadmapSource, /llm-rag` into required core/)
  assert.match(roadmapSource, /Phase 23: Architecture-to-Tools Handoff Challenge/)
  assert.match(roadmapSource, /ArchitectureToolsHandoffChallengeLab/)
  assert.match(roadmapSource, /real tokenizer integration/)
  assert.match(roadmapSource, /V3\.1 Minimum Mathematical Foundation/)

  const stateSource = read('.planning/STATE.md')
  assert.match(stateSource, /Phase 24A navigation and Topic Library implementation completed/)
  assert.match(stateSource, /Curriculum V3\.0 blueprint and audit are complete/)
  assert.match(stateSource, /classification audit of all 53 current modules/)
  assert.match(stateSource, /V3\.1 AI Overview rebuild and Math-to-Code pilot are completed slices/)
  assert.match(stateSource, /Python Data Tools Stage 1 is current/)
  assert.match(stateSource, /V3\.1 as a whole remains in progress/)
  assert.doesNotMatch(stateSource, /\bV3\.1 completed\b/i)
  assert.doesNotMatch(stateSource, /\bV3\.1 (?:as a whole )?is (?:fully )?complete\b/i)
  assert.doesNotMatch(stateSource, /V3\.1[^\n]*(?:\n[^\n]*){0,2}\*\*Status:\*\* Completed\b/i)
  assert.match(stateSource, /Phase 24B Homepage Focus and Phase 24C Spine progressive disclosure remain paused/)
  assert.match(stateSource, /Phase 15 - Curriculum Architecture and Teaching Route Audit/)
  assert.match(stateSource, /Phase 16 completed the role metadata and legacy order cleanup/)
  assert.match(stateSource, /Phase 17 MLP backprop mechanism bridge completed/)
  assert.match(stateSource, /Phase 18 optimizer-to-CNN handoff audit completed/)
  assert.match(stateSource, /Phase 19 design chooses a narrow `CnnShapeParameterChallengeLab`/)
  assert.match(stateSource, /Phase 19 CNN shape\/parameter challenge implementation completed/)
  assert.match(stateSource, /CnnShapeParameterChallengeLab/)
  assert.match(stateSource, /CNN shape\/parameter challenge/)
  assert.match(stateSource, /Phase 20 design chooses a narrow `OptimizerCurveDiagnosisChallengeLab`/)
  assert.match(stateSource, /Phase 20 optimizer curve diagnosis challenge implementation completed/)
  assert.match(stateSource, /OptimizerCurveDiagnosisChallengeLab/)
  assert.match(stateSource, /optimizer curve diagnosis/)
  assert.match(stateSource, /Phase 21 design chooses a narrow `AttentionQkvChallengeLab`/)
  assert.match(stateSource, /Attention Q\/K\/V Softmax Task Design/)
  assert.match(stateSource, /Phase 21 Attention Q\/K\/V softmax task implementation completed/)
  assert.match(stateSource, /AttentionQkvChallengeLab/)
  assert.match(stateSource, /top attended key and mask effect/)
  assert.match(stateSource, /Phase 22 audit keeps `llm-rag` as an advanced extension/)
  assert.match(stateSource, /Phase 22 design chooses a narrow `TransformerBlockAssemblyChallengeLab`/)
  assert.match(stateSource, /Transformer block assembly challenge design recorded/)
  assert.match(stateSource, /Phase 22 Transformer block assembly challenge implementation completed/)
  assert.match(stateSource, /TransformerBlockAssemblyChallengeLab/)
  assert.match(stateSource, /Phase 23 design chooses a narrow `ArchitectureToolsHandoffChallengeLab`/)
  assert.match(stateSource, /Architecture-to-tools handoff challenge design recorded/)
  assert.match(stateSource, /Phase 23 Architecture-to-tools handoff challenge implementation completed/)
  assert.match(stateSource, /architecture-tools-handoff-challenge\.test\.ts/)
  assert.match(stateSource, /optional `llm-rag` diagnostic task/)
  assert.match(stateSource, /tokenizer, attention mask, Transformer blocks\/model, and logits/)
  assert.match(stateSource, /matrix-calculus-autodiff` remains just-in-time support/)
  assert.match(stateSource, /CategoricalVocabularyTaskLab/)
  assert.match(stateSource, /DataQualityDecisionRecordLab/)
  assert.match(stateSource, /project readiness is useful but should wait/)
  assert.match(stateSource, /Current focus:\*\* Establish the Python Data Tools data and execution contract without changing the current `python-notebook` runtime lesson, route, checkpoints, or progress behavior\./)
})
