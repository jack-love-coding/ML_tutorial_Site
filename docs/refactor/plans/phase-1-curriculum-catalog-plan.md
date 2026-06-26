# Phase 1 Curriculum Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a unified Curriculum Catalog read model over existing Algorithm, Math Lab, and Data Lab content without changing runtime routes, homepage behavior, or progress storage.

**Architecture:** Add `src/curriculum/` as a pure TypeScript layer. Adapters convert existing source modules into a canonical catalog shape, validation utilities check IDs/localization/prerequisites/tracks, and tests prove the read model before any app surface consumes it.

**Tech Stack:** Vue 3 project, TypeScript ESM modules, Node test runner, existing typed course data from `src/data/moduleCatalog.ts`, `src/modules/math-lab/data/modules.ts`, and `src/modules/data-lab/data/modules.ts`.

---

## File Structure

- Create: `src/curriculum/types.ts` - canonical module, lesson, source namespace, domain, level, track, and validation types.
- Create: `src/curriculum/adapters/algorithmAdapter.ts` - adapts `AlgorithmModuleDefinition`.
- Create: `src/curriculum/adapters/mathLabAdapter.ts` - adapts `MathLabModule`.
- Create: `src/curriculum/adapters/dataLabAdapter.ts` - adapts `DataLabModule`.
- Create: `src/curriculum/catalog.ts` - combines adapters and exposes lookup helpers.
- Create: `src/curriculum/tracks.ts` - defines core track, topic-library tracks, project grouping, and track validation input.
- Create: `src/curriculum/prerequisites.ts` - validates missing prerequisite IDs and cycles.
- Create: `src/curriculum/validation.ts` - validates localization, duplicate IDs, missing lessons, and source mappings.
- Create: `tests/curriculumCatalog.test.ts` - catalog completeness and source mapping tests.
- Create: `tests/curriculumPrerequisites.test.ts` - prerequisite graph and track-order tests.
- Create: `tests/curriculumLocalization.test.ts` - bilingual title/summary and lesson copy tests.

## Task 1: Failing Catalog Completeness Tests

**Files:**
- Create: `tests/curriculumCatalog.test.ts`
- No production files yet.

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { moduleOrder } from '../src/data/moduleCatalog.ts'
import { mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import { dataLabModules } from '../src/modules/data-lab/data/modules.ts'
import {
  curriculumCatalog,
  curriculumModuleById,
  curriculumModulesBySource,
} from '../src/curriculum/catalog.ts'

test('curriculum catalog adapts every existing module exactly once', () => {
  const expectedCount = moduleOrder.length + mathLabModules.length + dataLabModules.length

  assert.equal(curriculumCatalog.length, expectedCount)
  assert.equal(new Set(curriculumCatalog.map((module) => module.id)).size, expectedCount)

  for (const moduleDefinition of moduleOrder) {
    const adapted = curriculumModulesBySource.algorithm.get(moduleDefinition.slug)
    assert.ok(adapted, `${moduleDefinition.slug} should map from algorithm source`)
    assert.equal(curriculumModuleById.get(adapted.id), adapted)
  }

  for (const moduleDefinition of mathLabModules) {
    const adapted = curriculumModulesBySource.mathLab.get(moduleDefinition.id)
    assert.ok(adapted, `${moduleDefinition.id} should map from math lab source`)
    assert.equal(curriculumModuleById.get(adapted.id), adapted)
  }

  for (const moduleDefinition of dataLabModules) {
    const adapted = curriculumModulesBySource.dataLab.get(moduleDefinition.id)
    assert.ok(adapted, `${moduleDefinition.id} should map from data lab source`)
    assert.equal(curriculumModuleById.get(adapted.id), adapted)
  }
})

test('catalog records legacy route and source namespace for every module', () => {
  for (const moduleDefinition of curriculumCatalog) {
    assert.ok(moduleDefinition.route.startsWith('/'), `${moduleDefinition.id} needs a public route`)
    assert.match(moduleDefinition.source.namespace, /^(algorithm|math-lab|data-lab)$/)
    assert.ok(moduleDefinition.source.id.length > 0)
    assert.ok(moduleDefinition.estimatedMinutes > 0)
    assert.ok(moduleDefinition.lessons.length > 0, `${moduleDefinition.id} needs at least one lesson`)
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/curriculumCatalog.test.ts
```

Expected: FAIL because `src/curriculum/catalog.ts` does not exist.

## Task 2: Add Canonical Curriculum Types

**Files:**
- Create: `src/curriculum/types.ts`

- [ ] **Step 1: Implement canonical types**

```ts
import type { LocalizedCopy } from '../types/ml'

export type CurriculumSourceNamespace = 'algorithm' | 'math-lab' | 'data-lab'

export type CurriculumDomain =
  | 'foundation'
  | 'math'
  | 'data'
  | 'model'
  | 'deep-learning'
  | 'project'

export type CurriculumLevel = 'beginner' | 'intermediate' | 'advanced'

export interface CurriculumSourceRef {
  namespace: CurriculumSourceNamespace
  id: string
}

export interface CurriculumLesson {
  id: string
  sourceId: string
  title: LocalizedCopy
  summary: LocalizedCopy
  route?: string
  estimatedMinutes?: number
}

export interface CurriculumModule {
  id: string
  source: CurriculumSourceRef
  domain: CurriculumDomain
  level: CurriculumLevel
  title: LocalizedCopy
  summary: LocalizedCopy
  route: string
  estimatedMinutes: number
  prerequisiteIds: string[]
  outcomeIds: string[]
  lessons: CurriculumLesson[]
  relatedModuleIds: string[]
  legacyRoute?: string
}

export interface CurriculumTrack {
  id: string
  title: LocalizedCopy
  description: LocalizedCopy
  moduleIds: string[]
  kind: 'core' | 'topic-library' | 'project' | 'advanced'
}
```

- [ ] **Step 2: Run type-aware tests**

Run:

```bash
npm test -- tests/curriculumCatalog.test.ts
```

Expected: still FAIL because catalog implementation is not present.

## Task 3: Add Source Adapters

**Files:**
- Create: `src/curriculum/adapters/algorithmAdapter.ts`
- Create: `src/curriculum/adapters/mathLabAdapter.ts`
- Create: `src/curriculum/adapters/dataLabAdapter.ts`

- [ ] **Step 1: Implement Algorithm adapter**

```ts
import type { AlgorithmModuleDefinition, LocalizedCopy } from '../../types/ml'
import type { CurriculumDomain, CurriculumLevel, CurriculumModule } from '../types'

const algorithmDomainBySlug: Record<string, CurriculumDomain> = {
  'ai-overview': 'foundation',
  'python-notebook': 'foundation',
  'housing-price-project': 'project',
  'classification-project': 'project',
  'model-selection': 'model',
  'tree-forest': 'model',
  'cnn-visualization': 'deep-learning',
  'attention-transformer': 'deep-learning',
  'optimizer-comparison': 'model',
  'llm-rag': 'deep-learning',
  'loss-functions': 'model',
  'gradient-descent': 'model',
  'linear-regression': 'model',
  'logistic-regression': 'model',
  classification: 'model',
  mlp: 'deep-learning',
}

const algorithmLevelBySlug: Record<string, CurriculumLevel> = {
  'ai-overview': 'beginner',
  'python-notebook': 'beginner',
  'housing-price-project': 'beginner',
  'classification-project': 'intermediate',
  'model-selection': 'intermediate',
  'tree-forest': 'intermediate',
  'cnn-visualization': 'intermediate',
  'attention-transformer': 'advanced',
  'optimizer-comparison': 'intermediate',
  'llm-rag': 'advanced',
  'loss-functions': 'beginner',
  'gradient-descent': 'beginner',
  'linear-regression': 'beginner',
  'logistic-regression': 'beginner',
  classification: 'intermediate',
  mlp: 'intermediate',
}

function keyAsCopy(key: string): LocalizedCopy {
  return { 'zh-CN': key, en: key }
}

export function adaptAlgorithmModule(moduleDefinition: AlgorithmModuleDefinition): CurriculumModule {
  return {
    id: moduleDefinition.slug,
    source: { namespace: 'algorithm', id: moduleDefinition.slug },
    domain: algorithmDomainBySlug[moduleDefinition.slug] ?? 'model',
    level: algorithmLevelBySlug[moduleDefinition.slug] ?? 'intermediate',
    title: keyAsCopy(moduleDefinition.titleKey),
    summary: keyAsCopy(moduleDefinition.summaryKey),
    route: moduleDefinition.route,
    estimatedMinutes: moduleDefinition.chapters.reduce(
      (sum, chapter) => sum + (chapter.estimatedMinutes ?? 12),
      0,
    ),
    prerequisiteIds: [],
    outcomeIds: moduleDefinition.checkpoints.map((checkpoint) => checkpoint.id),
    lessons: moduleDefinition.chapters.map((chapter) => ({
      id: chapter.id,
      sourceId: chapter.id,
      title: chapter.title ?? keyAsCopy(chapter.titleKey),
      summary: chapter.pageSummary ?? chapter.callout,
      estimatedMinutes: chapter.estimatedMinutes,
    })),
    relatedModuleIds: [],
    legacyRoute: moduleDefinition.route,
  }
}
```

- [ ] **Step 2: Implement Math Lab adapter**

```ts
import type { MathLabModule } from '../../modules/math-lab/types/mathLab'
import type { CurriculumModule } from '../types'

export function adaptMathLabModule(moduleDefinition: MathLabModule): CurriculumModule {
  return {
    id: moduleDefinition.id,
    source: { namespace: 'math-lab', id: moduleDefinition.id },
    domain: 'math',
    level: moduleDefinition.difficulty === 'foundation' ? 'beginner' : moduleDefinition.difficulty,
    title: moduleDefinition.title,
    summary: moduleDefinition.subtitle,
    route: `/math-lab/modules/${moduleDefinition.id}`,
    estimatedMinutes: moduleDefinition.estimatedMinutes,
    prerequisiteIds: moduleDefinition.prerequisites,
    outcomeIds: moduleDefinition.learningObjectives.map((_, index) => `${moduleDefinition.id}:objective-${index + 1}`),
    lessons: moduleDefinition.sections.map((section) => ({
      id: section.id,
      sourceId: section.id,
      title: section.title,
      summary: section.content,
    })),
    relatedModuleIds: moduleDefinition.nextModuleIds,
    legacyRoute: `/math-lab/modules/${moduleDefinition.id}`,
  }
}
```

- [ ] **Step 3: Implement Data Lab adapter**

```ts
import type { DataLabModule } from '../../modules/data-lab/types/dataLab'
import type { CurriculumModule } from '../types'

export function adaptDataLabModule(moduleDefinition: DataLabModule): CurriculumModule {
  return {
    id: moduleDefinition.id,
    source: { namespace: 'data-lab', id: moduleDefinition.id },
    domain: 'data',
    level: moduleDefinition.order <= 2 ? 'beginner' : 'intermediate',
    title: moduleDefinition.title,
    summary: moduleDefinition.subtitle,
    route: `/data-lab/modules/${moduleDefinition.id}`,
    estimatedMinutes: moduleDefinition.estimatedMinutes,
    prerequisiteIds: [],
    outcomeIds: moduleDefinition.learningObjectives.map((_, index) => `${moduleDefinition.id}:objective-${index + 1}`),
    lessons: moduleDefinition.sections.map((section) => ({
      id: section.id,
      sourceId: section.id,
      title: section.title,
      summary: section.content,
    })),
    relatedModuleIds: [],
    legacyRoute: `/data-lab/modules/${moduleDefinition.id}`,
  }
}
```

- [ ] **Step 4: Run catalog test**

Run:

```bash
npm test -- tests/curriculumCatalog.test.ts
```

Expected: still FAIL because combined catalog is not exported.

## Task 4: Combine Catalog and Lookups

**Files:**
- Create: `src/curriculum/catalog.ts`

- [ ] **Step 1: Implement catalog aggregation**

```ts
import { moduleOrder } from '../data/moduleCatalog'
import { dataLabModules } from '../modules/data-lab/data/modules'
import { mathLabModules } from '../modules/math-lab/data/modules'
import { adaptAlgorithmModule } from './adapters/algorithmAdapter'
import { adaptDataLabModule } from './adapters/dataLabAdapter'
import { adaptMathLabModule } from './adapters/mathLabAdapter'
import type { CurriculumModule } from './types'

const algorithmModules = moduleOrder.map(adaptAlgorithmModule)
const mathModules = mathLabModules.map(adaptMathLabModule)
const dataModules = dataLabModules.map(adaptDataLabModule)

export const curriculumCatalog: CurriculumModule[] = [
  ...algorithmModules,
  ...mathModules,
  ...dataModules,
]

export const curriculumModuleById = new Map(
  curriculumCatalog.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
)

export const curriculumModulesBySource = {
  algorithm: new Map(algorithmModules.map((moduleDefinition) => [moduleDefinition.source.id, moduleDefinition])),
  mathLab: new Map(mathModules.map((moduleDefinition) => [moduleDefinition.source.id, moduleDefinition])),
  dataLab: new Map(dataModules.map((moduleDefinition) => [moduleDefinition.source.id, moduleDefinition])),
}
```

- [ ] **Step 2: Run catalog test**

Run:

```bash
npm test -- tests/curriculumCatalog.test.ts
```

Expected: PASS unless a canonical ID collision appears. If a collision appears, adjust only the adapter for the colliding namespace and keep `source.id` unchanged.

## Task 5: Localization and Validation Tests

**Files:**
- Create: `tests/curriculumLocalization.test.ts`
- Create: `src/curriculum/validation.ts`

- [ ] **Step 1: Write the failing localization test**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumCatalog } from '../src/curriculum/catalog.ts'
import { validateCurriculumLocalization } from '../src/curriculum/validation.ts'

test('curriculum catalog exposes bilingual module and lesson copy', () => {
  const errors = validateCurriculumLocalization(curriculumCatalog)

  assert.deepEqual(errors, [])

  for (const moduleDefinition of curriculumCatalog) {
    assert.ok(moduleDefinition.title['zh-CN'].trim().length > 0)
    assert.ok(moduleDefinition.title.en.trim().length > 0)
    assert.ok(moduleDefinition.summary['zh-CN'].trim().length > 0)
    assert.ok(moduleDefinition.summary.en.trim().length > 0)

    for (const lesson of moduleDefinition.lessons) {
      assert.ok(lesson.title['zh-CN'].trim().length > 0, `${moduleDefinition.id}/${lesson.id} title zh-CN`)
      assert.ok(lesson.title.en.trim().length > 0, `${moduleDefinition.id}/${lesson.id} title en`)
      assert.ok(lesson.summary['zh-CN'].trim().length > 0, `${moduleDefinition.id}/${lesson.id} summary zh-CN`)
      assert.ok(lesson.summary.en.trim().length > 0, `${moduleDefinition.id}/${lesson.id} summary en`)
    }
  }
})
```

- [ ] **Step 2: Implement validation helper**

```ts
import type { CurriculumModule } from './types'

function hasBothLocales(copy: { 'zh-CN': string; en: string }) {
  return copy['zh-CN'].trim().length > 0 && copy.en.trim().length > 0
}

export function validateCurriculumLocalization(modules: CurriculumModule[]) {
  const errors: string[] = []

  for (const moduleDefinition of modules) {
    if (!hasBothLocales(moduleDefinition.title)) errors.push(`${moduleDefinition.id}:title`)
    if (!hasBothLocales(moduleDefinition.summary)) errors.push(`${moduleDefinition.id}:summary`)

    for (const lesson of moduleDefinition.lessons) {
      if (!hasBothLocales(lesson.title)) errors.push(`${moduleDefinition.id}/${lesson.id}:title`)
      if (!hasBothLocales(lesson.summary)) errors.push(`${moduleDefinition.id}/${lesson.id}:summary`)
    }
  }

  return errors
}

export function validateUniqueCurriculumIds(modules: CurriculumModule[]) {
  const seen = new Set<string>()
  const duplicates: string[] = []

  for (const moduleDefinition of modules) {
    if (seen.has(moduleDefinition.id)) duplicates.push(moduleDefinition.id)
    seen.add(moduleDefinition.id)
  }

  return duplicates
}
```

- [ ] **Step 3: Run localization test**

Run:

```bash
npm test -- tests/curriculumLocalization.test.ts
```

Expected: PASS.

## Task 6: Prerequisites and Tracks

**Files:**
- Create: `src/curriculum/prerequisites.ts`
- Create: `src/curriculum/tracks.ts`
- Create: `tests/curriculumPrerequisites.test.ts`

- [ ] **Step 1: Write prerequisite tests**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumCatalog } from '../src/curriculum/catalog.ts'
import { curriculumTracks } from '../src/curriculum/tracks.ts'
import {
  findMissingPrerequisites,
  findPrerequisiteCycles,
  trackRespectsPrerequisites,
} from '../src/curriculum/prerequisites.ts'

test('curriculum prerequisites point at known modules and form a DAG', () => {
  assert.deepEqual(findMissingPrerequisites(curriculumCatalog), [])
  assert.deepEqual(findPrerequisiteCycles(curriculumCatalog), [])
})

test('core learning track is explicit and prerequisite-safe', () => {
  const coreTrack = curriculumTracks.find((track) => track.id === 'core-learning-path')

  assert.ok(coreTrack)
  assert.equal(coreTrack.kind, 'core')
  assert.deepEqual(coreTrack.moduleIds.slice(0, 5), [
    'ai-overview',
    'beginner-linear-algebra',
    'numerical-data',
    'loss-functions',
    'linear-regression',
  ])
  assert.deepEqual(trackRespectsPrerequisites(curriculumCatalog, coreTrack.moduleIds), [])
})
```

- [ ] **Step 2: Implement prerequisite helpers**

```ts
import type { CurriculumModule } from './types'

export function findMissingPrerequisites(modules: CurriculumModule[]) {
  const ids = new Set(modules.map((moduleDefinition) => moduleDefinition.id))
  const missing: string[] = []

  for (const moduleDefinition of modules) {
    for (const prerequisiteId of moduleDefinition.prerequisiteIds) {
      if (!ids.has(prerequisiteId)) missing.push(`${moduleDefinition.id}->${prerequisiteId}`)
    }
  }

  return missing
}

export function findPrerequisiteCycles(modules: CurriculumModule[]) {
  const byId = new Map(modules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const cycles: string[] = []

  function visit(id: string, trail: string[]) {
    if (visiting.has(id)) {
      cycles.push([...trail, id].join(' -> '))
      return
    }
    if (visited.has(id)) return

    const moduleDefinition = byId.get(id)
    if (!moduleDefinition) return

    visiting.add(id)
    for (const prerequisiteId of moduleDefinition.prerequisiteIds) visit(prerequisiteId, [...trail, id])
    visiting.delete(id)
    visited.add(id)
  }

  for (const moduleDefinition of modules) visit(moduleDefinition.id, [])

  return cycles
}

export function trackRespectsPrerequisites(modules: CurriculumModule[], moduleIds: string[]) {
  const position = new Map(moduleIds.map((id, index) => [id, index]))
  const byId = new Map(modules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))
  const violations: string[] = []

  for (const moduleId of moduleIds) {
    const moduleDefinition = byId.get(moduleId)
    if (!moduleDefinition) continue
    const modulePosition = position.get(moduleId) ?? -1

    for (const prerequisiteId of moduleDefinition.prerequisiteIds) {
      const prerequisitePosition = position.get(prerequisiteId)
      if (prerequisitePosition !== undefined && prerequisitePosition > modulePosition) {
        violations.push(`${moduleId} appears before ${prerequisiteId}`)
      }
    }
  }

  return violations
}
```

- [ ] **Step 3: Implement tracks**

```ts
import type { CurriculumTrack } from './types'

const copy = (zhCN: string, en: string) => ({ 'zh-CN': zhCN, en })

export const curriculumTracks: CurriculumTrack[] = [
  {
    id: 'core-learning-path',
    kind: 'core',
    title: copy('核心学习路径', 'Core Learning Path'),
    description: copy('从 AI 地图、数据、损失、优化到 MLP 的主线。', 'The main route from the AI map, data, loss, optimization, and MLP.'),
    moduleIds: [
      'ai-overview',
      'beginner-linear-algebra',
      'numerical-data',
      'loss-functions',
      'linear-regression',
      'gradient-descent',
      'logistic-regression',
      'classification',
      'model-selection',
      'mlp',
    ],
  },
  {
    id: 'math-topic-library',
    kind: 'topic-library',
    title: copy('数学专题库', 'Math Topic Library'),
    description: copy('按需补充向量、矩阵、微积分、概率和数值稳定。', 'Just-in-time support for vectors, matrices, calculus, probability, and numerical stability.'),
    moduleIds: [],
  },
  {
    id: 'data-topic-library',
    kind: 'topic-library',
    title: copy('数据专题库', 'Data Topic Library'),
    description: copy('理解表格、特征、清洗、划分、EDA 和正则化。', 'Understand tables, features, cleaning, splits, EDA, and regularization.'),
    moduleIds: ['numerical-data', 'categorical-data', 'dataset-quality', 'splits-generalization', 'complexity-regularization'],
  },
  {
    id: 'project-practice',
    kind: 'project',
    title: copy('项目实战', 'Project Practice'),
    description: copy('在阶段总结中完成端到端项目。', 'Complete end-to-end projects as stage summaries.'),
    moduleIds: ['housing-price-project', 'classification-project'],
  },
]
```

- [ ] **Step 4: Run prerequisite tests**

Run:

```bash
npm test -- tests/curriculumPrerequisites.test.ts
```

Expected: PASS. If Math Lab prerequisites point to legacy IDs that are missing from the combined catalog, keep the failure and fix by adding an explicit legacy-to-canonical mapping inside `mathLabAdapter.ts`.

## Task 7: Full Validation

**Files:**
- No new files.
- Modify tests only if TypeScript import paths need `.ts` suffix alignment.

- [ ] **Step 1: Run focused tests**

Run:

```bash
npm test -- tests/curriculumCatalog.test.ts tests/curriculumPrerequisites.test.ts tests/curriculumLocalization.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run full test suite**

Run:

```bash
npm test
```

Expected: PASS with existing suite plus three new test files.

- [ ] **Step 3: Run production builds**

Run:

```bash
npm run build
npm run build:pages
```

Expected: PASS. Existing large-chunk warning may remain, but Phase 1 should not add a new runtime import from homepage or router into `src/curriculum/`.

- [ ] **Step 4: Review diff scope**

Run:

```bash
git status --short
git diff -- src/curriculum tests/curriculumCatalog.test.ts tests/curriculumPrerequisites.test.ts tests/curriculumLocalization.test.ts
```

Expected: only `src/curriculum/**` and the three curriculum tests changed for implementation. Planning docs may already exist on the branch.

## Task 8: Phase 1 Commit Boundary

**Files:**
- Stage only Phase 1 implementation files and tests after validation passes.

- [ ] **Step 1: Stage implementation scope**

Run:

```bash
git add src/curriculum tests/curriculumCatalog.test.ts tests/curriculumPrerequisites.test.ts tests/curriculumLocalization.test.ts
```

- [ ] **Step 2: Commit Phase 1 implementation**

Run:

```bash
git commit -m "feat: add curriculum catalog read model"
```

Expected: one reviewable Phase 1 implementation commit. Keep planning-document commits separate if the branch includes them.

## Self-Review

- Spec coverage: Covers Phase 1 acceptance criteria from `docs/refactor/decisions/phase-1.md`.
- Scope check: Does not modify routes, homepage, progress storage, lesson renderer, or source course content.
- Type consistency: Canonical types use `CurriculumModule`, `CurriculumLesson`, and `CurriculumTrack`; tests import those through catalog/tracks helpers.
- Risk note: Algorithm adapter uses i18n keys as bilingual fallback copy until Phase 2 decides whether catalog should resolve vue-i18n messages at build/runtime. This is acceptable for read-model validation but should be revisited before user-facing catalog UI consumes titles directly.
