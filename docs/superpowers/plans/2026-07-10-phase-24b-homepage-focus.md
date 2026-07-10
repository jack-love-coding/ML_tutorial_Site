# Phase 24B Homepage Focus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Data First Spine the homepage’s single primary task while preserving safe continuation and compact secondary discovery.

**Architecture:** Move Progress V2 refresh/listener logic behind one composable, build a small homepage view model from the approved Spine, and split the page into hero, Spine preview, and secondary-link components. Remove duplicated decision and readiness surfaces.

**Tech Stack:** Vue 3, TypeScript, vue-i18n, Node test runner, CSS

## Global Constraints

- Phase 24A must be merged or explicitly used as the reviewed stacked base.
- Use “专题学习” / “Topic Library.”
- Do not change Progress V1/V2 keys, schema, migration, or write paths.
- Progress may recommend a destination but cannot define curriculum order.
- Keep the homepage bilingual, keyboard accessible, reduced-motion safe, and readable at 390px.
- Do not touch course bodies, lesson renderers, checkpoints, or Phase 23 files.
- This phase has its own verification, commit, and PR.

---

### Task 1: Extract continuation and stage recommendation logic

**Files:**
- Create: `src/composables/useLearningContinuation.ts`
- Create: `tests/homeLearningContinuation.test.ts`
- Modify: `tests/homeCurriculumIA.test.ts`

**Interfaces:**
- Produces: `LearningContinuationModel`, `buildLearningContinuationModel(progress, locale)`, and `useLearningContinuation()`.
- Consumed by: `HomeView.vue` and Task 2 homepage components.

- [ ] **Step 1: Write failing pure-selector tests**

```ts
test('homepage continuation falls back to stage zero without progress', () => {
  const progress = createDefaultLearningProgressV2('2026-07-10T00:00:00.000Z')
  const model = buildLearningContinuationModel(progress, 'zh-CN')
  assert.equal(model.hasContinuation, false)
  assert.equal(model.primaryRoute, '/learn/ai-overview')
  assert.equal(model.recommendedStage.id, 'orientation')
  assert.equal(model.nextStage?.id, 'data-to-features')
})

test('advanced last-visited progress keeps continue route but recommends required spine separately', () => {
  const progress = createDefaultLearningProgressV2('2026-07-10T00:00:00.000Z')
  progress.lastVisited = {
    moduleId: 'llm-rag',
    source: 'algorithm',
    route: '/learn/llm-rag',
    visitedAt: '2026-07-10T01:00:00.000Z',
  }
  const model = buildLearningContinuationModel(progress, 'en')
  assert.equal(model.primaryRoute, '/learn/llm-rag')
  assert.equal(model.recommendedStage.id, 'orientation')
})
```

- [ ] **Step 2: Run tests and confirm RED**

Run: `node --test tests/homeLearningContinuation.test.ts tests/homeCurriculumIA.test.ts`

Expected: FAIL because the composable and selector do not exist.

- [ ] **Step 3: Implement the selector and composable**

```ts
export interface LearningContinuationModel {
  hasContinuation: boolean
  primaryRoute: string
  primaryTitle: string
  completedModuleCount: number
  checkpointAttemptCount: number
  recommendedStage: CurriculumSpineStage
  nextStage?: CurriculumSpineStage
}

export function buildLearningContinuationModel(
  progress: LearningProgressV2,
  locale: AppLocale,
): LearningContinuationModel {
  const target = selectContinueLearning(progress)
  const completedModuleCount = Object.values(progress.modules).filter((module) => module.completed).length
  const checkpointAttemptCount = Object.values(progress.modules).reduce((total, module) => total + module.attempts.length, 0)
  const hasContinuation = Boolean(progress.lastVisited || completedModuleCount || checkpointAttemptCount)
  const firstIncompleteModuleId = curriculumSpineRequiredModuleIds().find(
    (moduleId) => !progress.modules[moduleId]?.completed,
  ) ?? curriculumSpineStages[0]!.requiredModuleIds[0]!
  const stageIndex = Math.max(0, curriculumSpineStages.findIndex((stage) => stage.requiredModuleIds.includes(firstIncompleteModuleId)))
  const recommendedStage = curriculumSpineStages[stageIndex] ?? curriculumSpineStages[0]!
  const manifest = target ? curriculumRouteManifestById.get(target.moduleId) : curriculumRouteManifestById.get('ai-overview')

  return {
    hasContinuation,
    primaryRoute: target?.route ?? '/learn/ai-overview',
    primaryTitle: manifest?.title[locale] ?? (locale === 'zh-CN' ? 'AI 入门总览' : 'AI Overview'),
    completedModuleCount,
    checkpointAttemptCount,
    recommendedStage,
    nextStage: curriculumSpineStages[stageIndex + 1],
  }
}
```

`useLearningContinuation()` owns the existing `focus`, `visibilitychange`, and `storage` listeners and removes them in `onBeforeUnmount`. It returns a computed model and a `refresh()` function. Catch storage access failures and retain `createDefaultLearningProgressV2()`.

```ts
const progressStorageKeys = new Set([
  learningProgressV2StorageKey,
  learningProgressV2MigrationKey,
  algorithmProgressStorageKey,
  mathLabProgressStorageKey,
  dataLabProgressStorageKey,
])

export function useLearningContinuation(locale: ComputedRef<AppLocale>) {
  const progress = ref<LearningProgressV2>(createDefaultLearningProgressV2())

  function refresh() {
    try {
      progress.value = migrateLearningProgressV2()
    } catch {
      progress.value = createDefaultLearningProgressV2()
    }
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') refresh()
  }

  function onStorage(event: StorageEvent) {
    if (!event.key || progressStorageKeys.has(event.key)) refresh()
  }

  onMounted(() => {
    refresh()
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('storage', onStorage)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('focus', refresh)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('storage', onStorage)
  })

  return {
    model: computed(() => buildLearningContinuationModel(progress.value, locale.value)),
    refresh,
  }
}
```

- [ ] **Step 4: Run tests and confirm GREEN**

Run: `node --test tests/homeLearningContinuation.test.ts tests/homeCurriculumIA.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useLearningContinuation.ts tests/homeLearningContinuation.test.ts tests/homeCurriculumIA.test.ts
git commit -m "refactor: extract homepage continuation model"
```

### Task 2: Build focused homepage components

**Files:**
- Create: `src/components/home/HomeLearningHero.vue`
- Create: `src/components/home/HomeSpinePreview.vue`
- Create: `src/components/home/HomeExploreLinks.vue`
- Modify: `tests/homeCurriculumIA.test.ts`

**Interfaces:**
- `HomeLearningHero` consumes `LearningContinuationModel` and localized labels.
- `HomeSpinePreview` consumes `{ currentStage, nextStage }`.
- `HomeExploreLinks` receives no progress; it renders `/library/math`, `/tracks/project-practice`, and `/progress`.

- [ ] **Step 1: Add failing source-contract tests**

```ts
test('homepage is composed from focused learning components', () => {
  for (const path of [
    'src/components/home/HomeLearningHero.vue',
    'src/components/home/HomeSpinePreview.vue',
    'src/components/home/HomeExploreLinks.vue',
  ]) assert.ok(existsSync(new URL(path, root)))

  const hero = read('src/components/home/HomeLearningHero.vue')
  const preview = read('src/components/home/HomeSpinePreview.vue')
  const links = read('src/components/home/HomeExploreLinks.vue')
  assert.match(hero, /primaryRoute/)
  assert.match(preview, /recommendedStage|currentStage/)
  assert.match(links, /\/library\/math/)
  assert.match(links, /\/tracks\/project-practice/)
  assert.match(links, /\/progress/)
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/homeCurriculumIA.test.ts`

Expected: FAIL because the three SFCs do not exist.

- [ ] **Step 3: Implement component contracts**

```vue
<!-- HomeLearningHero.vue core template -->
<section class="home-learning-hero">
  <div>
    <span class="eyebrow">{{ labels.eyebrow }}</span>
    <h1>{{ labels.title }}</h1>
    <p>{{ labels.body }}</p>
    <div class="hero__actions">
      <router-link class="action-button action-button--primary" :to="model.primaryRoute">
        {{ model.hasContinuation ? labels.continueAction : labels.startAction }}
      </router-link>
      <router-link class="action-button" to="/spine">{{ labels.viewSpine }}</router-link>
    </div>
  </div>
  <aside class="home-learning-hero__status">
    <span>{{ labels.recommended }}</span>
    <strong>{{ localizedStageTitle }}</strong>
    <small>{{ model.completedModuleCount }} · {{ model.checkpointAttemptCount }}</small>
  </aside>
</section>
```

```vue
<!-- HomeSpinePreview.vue core template -->
<section class="home-spine-preview" aria-labelledby="home-spine-preview-title">
  <header>
    <span class="eyebrow">Data First</span>
    <h2 id="home-spine-preview-title">{{ labels.title }}</h2>
  </header>
  <article class="home-spine-preview__current">
    <span>{{ labels.current }}</span>
    <h3>{{ localized(currentStage.title) }}</h3>
    <p>{{ localized(currentStage.learnerQuestion) }}</p>
    <router-link :to="`/spine#${currentStage.id}`">{{ labels.openStage }}</router-link>
  </article>
  <article v-if="nextStage" class="home-spine-preview__next">
    <span>{{ labels.next }}</span>
    <strong>{{ localized(nextStage.title) }}</strong>
  </article>
</section>
```

```vue
<!-- HomeExploreLinks.vue core template -->
<nav class="home-explore-links" :aria-label="labels.ariaLabel">
  <router-link to="/library/math"><strong>{{ labels.library }}</strong><span>{{ labels.libraryHint }}</span></router-link>
  <router-link to="/tracks/project-practice"><strong>{{ labels.projects }}</strong><span>{{ labels.projectsHint }}</span></router-link>
  <router-link to="/progress"><strong>{{ labels.progress }}</strong><span>{{ labels.progressHint }}</span></router-link>
</nav>
```

- [ ] **Step 4: Run and confirm GREEN**

Run: `node --test tests/homeCurriculumIA.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/HomeLearningHero.vue src/components/home/HomeSpinePreview.vue src/components/home/HomeExploreLinks.vue tests/homeCurriculumIA.test.ts
git commit -m "feat: add focused homepage sections"
```

### Task 3: Recompose `HomeView` and remove duplicate surfaces

**Files:**
- Modify: `src/views/HomeView.vue`
- Modify: `src/styles/views/home.css`
- Modify: `tests/homeCurriculumIA.test.ts`
- Modify: `tests/math-lab-layout.test.mjs`
- Modify: `tests/data-lab-layout.test.mjs`

**Interfaces:**
- Consumes all Task 1 and Task 2 interfaces.
- Produces a page containing only hero, Spine preview, secondary exploration, and compact footer.

- [ ] **Step 1: Change tests to require the new composition and removed content**

```ts
test('homepage keeps one primary route and removes duplicated decision surfaces', () => {
  const home = read('src/views/HomeView.vue')
  assert.match(home, /useLearningContinuation/)
  assert.match(home, /HomeLearningHero/)
  assert.match(home, /HomeSpinePreview/)
  assert.match(home, /HomeExploreLinks/)
  assert.doesNotMatch(home, /homeDecisionCards|home-decision-grid/)
  assert.doesNotMatch(home, /readinessChecks|roadmap-checklist/)
  assert.doesNotMatch(home, /curriculumSpineStages\.slice\(0, 4\)/)
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/homeCurriculumIA.test.ts tests/math-lab-layout.test.mjs tests/data-lab-layout.test.mjs`

Expected: FAIL while the old structures remain.

- [ ] **Step 3: Replace the page with the minimal compositor**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import HomeExploreLinks from '../components/home/HomeExploreLinks.vue'
import HomeLearningHero from '../components/home/HomeLearningHero.vue'
import HomeSpinePreview from '../components/home/HomeSpinePreview.vue'
import { useLearningContinuation } from '../composables/useLearningContinuation.ts'
import type { AppLocale } from '../types/ml.ts'

const { locale } = useI18n()
const currentLocale = computed(() => locale.value as AppLocale)
const { model } = useLearningContinuation(currentLocale)
</script>

<template>
  <div class="home-view">
    <HomeLearningHero :model="model" :locale="currentLocale" />
    <HomeSpinePreview :current-stage="model.recommendedStage" :next-stage="model.nextStage" :locale="currentLocale" />
    <HomeExploreLinks :locale="currentLocale" />
    <footer class="home-footer">ML Atlas · Data First</footer>
  </div>
</template>
```

Delete obsolete homepage CSS selectors for the progress half-panel, decision grid/cards, four-stage roadmap, and readiness checklist. Add focused `.home-learning-hero`, `.home-spine-preview`, and `.home-explore-links` desktop/390px layouts. Do not alter unrelated Algorithm selectors that currently share `home.css`.

- [ ] **Step 4: Run focused tests and build**

Run: `node --test tests/homeLearningContinuation.test.ts tests/homeCurriculumIA.test.ts tests/math-lab-layout.test.mjs tests/data-lab-layout.test.mjs`

Expected: PASS.

Run: `npm run build`

Expected: PASS with only the pre-existing chunk warning.

- [ ] **Step 5: Commit**

```bash
git add src/views/HomeView.vue src/styles/views/home.css tests/homeCurriculumIA.test.ts tests/math-lab-layout.test.mjs tests/data-lab-layout.test.mjs
git commit -m "refactor: focus homepage on the default spine"
```

### Task 4: Document and verify Phase 24B

**Files:**
- Create: `docs/refactor/summaries/phase-24b.md`
- Modify: `.planning/ROADMAP.md`
- Modify: `.planning/STATE.md`
- Modify: `tests/curriculumMilestoneAudit.test.ts`

**Interfaces:**
- Produces Phase 24B traceability and the prerequisite for Phase 24C.

- [ ] **Step 1: Add failing audit coverage**

```ts
assert.ok(existsSync(new URL('docs/refactor/summaries/phase-24b.md', root)))
assert.match(stateSource, /Phase 24B homepage focus implementation completed/)
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/curriculumMilestoneAudit.test.ts`

Expected: FAIL.

- [ ] **Step 3: Add summary and planning records**

Record the extracted composable/components, removed duplicate surfaces, unchanged Progress schemas, focused/browser verification, and Phase 24C as the next step.

- [ ] **Step 4: Run complete verification**

Run: `npm test`

Expected: all tests pass.

Run: `npm run build && npm run build:pages && git diff --check`

Expected: both builds pass with only pre-existing chunk warnings; no whitespace errors.

Browser-check `/` in Chinese and English at desktop and 390px. Verify start and continue states, compact Spine recommendation, Topic Library/projects/progress links, no overflow, and zero console errors.

- [ ] **Step 5: Commit**

```bash
git add docs/refactor/summaries/phase-24b.md .planning/ROADMAP.md .planning/STATE.md tests/curriculumMilestoneAudit.test.ts
git commit -m "docs: complete phase 24b homepage focus"
```
