# Phase 24C Spine Progressive Disclosure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present the eleven-stage Curriculum Spine as a compact journey with one hash-addressable stage detail at a time.

**Architecture:** Add pure stage-hash navigation helpers, split the Spine rail and detail into focused components, and let `CurriculumSpineView.vue` compose them from the existing `curriculumSpineStages` contract. Preserve `/spine`, the flat core track, all course routes, and progress independence.

**Tech Stack:** Vue 3, TypeScript, Vue Router, vue-i18n, Node test runner, CSS

## Global Constraints

- Phase 24A and Phase 24B must be merged or explicitly used as reviewed stacked bases.
- `curriculumSpineStages` remains the route source of truth.
- Show all eleven stages in the rail but emphasize only one detail at a time.
- Valid hashes restore a stage; invalid or absent hashes display stage 0 without throwing.
- Progress may recommend a stage but must not silently replace the URL hash.
- Preserve `/tracks/core-learning-path`, legacy URLs, Topic Library roles, checkpoints, and Progress V1/V2.
- Keep bilingual copy, keyboard access, non-color active state, reduced motion, and 390px readability.
- This phase has its own verification, commit, and PR.

---

### Task 1: Add pure Spine hash navigation helpers

**Files:**
- Create: `src/curriculum/spineNavigation.ts`
- Create: `tests/curriculumSpineNavigation.test.ts`

**Interfaces:**
- Produces: `SpineStageNavigation`, `stageIdFromHash(hash)`, and `buildSpineStageNavigation(stageId)`.
- Consumed by: `CurriculumSpineView.vue`, `SpineStageRail.vue`, and `SpineStageDetail.vue`.

- [ ] **Step 1: Write failing helper tests**

```ts
test('spine hash navigation restores known stages and falls back to stage zero', () => {
  assert.equal(stageIdFromHash('#training-motion'), 'training-motion')
  assert.equal(stageIdFromHash('training-motion'), 'training-motion')
  assert.equal(stageIdFromHash('#unknown'), 'orientation')
  assert.equal(stageIdFromHash(''), 'orientation')
})

test('spine navigation exposes previous and next stages', () => {
  const middle = buildSpineStageNavigation('training-motion')
  assert.equal(middle.current.id, 'training-motion')
  assert.equal(middle.previous?.id, 'linear-regression')
  assert.equal(middle.next?.id, 'classification-probability')
  assert.equal(buildSpineStageNavigation('orientation').previous, undefined)
  assert.equal(buildSpineStageNavigation('sequence-attention').next, undefined)
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/curriculumSpineNavigation.test.ts`

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement the pure helpers**

```ts
import { curriculumSpineStages } from './spine.ts'
import type { CurriculumSpineStage } from './types.ts'

export interface SpineStageNavigation {
  index: number
  current: CurriculumSpineStage
  previous?: CurriculumSpineStage
  next?: CurriculumSpineStage
}

const stageById = new Map(curriculumSpineStages.map((stage) => [stage.id, stage]))
const fallbackStage = curriculumSpineStages[0]!

export function stageIdFromHash(hash: string): string {
  const candidate = hash.replace(/^#/, '')
  return stageById.has(candidate) ? candidate : fallbackStage.id
}

export function buildSpineStageNavigation(stageId: string): SpineStageNavigation {
  const current = stageById.get(stageId) ?? fallbackStage
  const index = Math.max(0, curriculumSpineStages.findIndex((stage) => stage.id === current.id))
  return {
    index,
    current,
    previous: curriculumSpineStages[index - 1],
    next: curriculumSpineStages[index + 1],
  }
}
```

- [ ] **Step 4: Run and confirm GREEN**

Run: `node --test tests/curriculumSpineNavigation.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/spineNavigation.ts tests/curriculumSpineNavigation.test.ts
git commit -m "feat: add spine hash navigation helpers"
```

### Task 2: Extract the stage rail and stage detail

**Files:**
- Create: `src/components/curriculum/SpineStageRail.vue`
- Create: `src/components/curriculum/SpineStageDetail.vue`
- Modify: `tests/curriculumSpineLanding.test.ts`

**Interfaces:**
- `SpineStageRail` props: `{ stages: CurriculumSpineStage[]; activeStageId: string; locale: AppLocale }`.
- `SpineStageDetail` props: `{ navigation: SpineStageNavigation; locale: AppLocale }`.
- Both components use `/spine#<stage-id>` links; detail resolves module routes through `resolveCanonicalLearnRoute`.

- [ ] **Step 1: Write failing component-contract tests**

```ts
test('spine landing uses focused rail and detail components', () => {
  const rail = read('src/components/curriculum/SpineStageRail.vue')
  const detail = read('src/components/curriculum/SpineStageDetail.vue')
  assert.match(rail, /aria-current/)
  assert.match(rail, /activeStageId/)
  assert.match(rail, /`#\$\{stage\.id\}`|#\$\{stage\.id\}/)
  assert.match(detail, /navigation\.current/)
  assert.match(detail, /requiredModuleIds/)
  assert.match(detail, /supportModuleIds/)
  assert.match(detail, /projectModuleIds/)
  assert.match(detail, /navigation\.previous/)
  assert.match(detail, /navigation\.next/)
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/curriculumSpineLanding.test.ts`

Expected: FAIL because the new components do not exist.

- [ ] **Step 3: Implement accessible component contracts**

```vue
<!-- SpineStageRail.vue core template -->
<nav class="spine-stage-rail" :aria-label="labels.stageNav">
  <router-link
    v-for="(stage, index) in stages"
    :key="stage.id"
    :to="{ path: '/spine', hash: `#${stage.id}` }"
    :aria-current="stage.id === activeStageId ? 'step' : undefined"
    :class="{ 'is-active': stage.id === activeStageId }"
  >
    <span>{{ String(index + 1).padStart(2, '0') }}</span>
    <strong>{{ stage.title[locale] }}</strong>
  </router-link>
</nav>
```

```vue
<!-- SpineStageDetail.vue core structure -->
<article class="spine-stage-detail">
  <header>
    <span>{{ labels.stage }} {{ navigation.index + 1 }}</span>
    <h2>{{ navigation.current.title[locale] }}</h2>
    <strong>{{ navigation.current.learnerQuestion[locale] }}</strong>
    <p>{{ navigation.current.bridge[locale] }}</p>
  </header>
  <div class="spine-stage-detail__modules">
    <section v-for="group in moduleGroups" :key="group.id">
      <h3>{{ group.title }}</h3>
      <ul>
        <li v-for="module in group.modules" :key="module.id">
          <router-link :to="moduleRoute(module.id)">{{ module.title[locale] }}</router-link>
          <p v-if="group.id === 'required'">{{ module.summary[locale] }}</p>
        </li>
      </ul>
    </section>
  </div>
  <section class="spine-stage-detail__outcome">
    <h3>{{ labels.outcome }}</h3>
    <ul><li v-for="outcome in navigation.current.outcomes" :key="outcome.en">{{ outcome[locale] }}</li></ul>
  </section>
  <nav class="spine-stage-detail__pager">
    <router-link v-if="navigation.previous" :to="{ path: '/spine', hash: `#${navigation.previous.id}` }">{{ labels.previous }}</router-link>
    <router-link v-if="navigation.next" :to="{ path: '/spine', hash: `#${navigation.next.id}` }">{{ labels.next }}</router-link>
  </nav>
</article>
```

Build `moduleGroups` inside `SpineStageDetail.vue` from `curriculumModuleById`, omitting unresolved IDs while preserving the required/topics/projects order:

```ts
const props = defineProps<{
  navigation: SpineStageNavigation
  locale: AppLocale
}>()

const labels = computed(() => props.locale === 'zh-CN'
  ? {
      stage: '阶段',
      required: '主线必修',
      topics: '专题学习',
      projects: '项目实践',
      outcome: '完成后你将能够',
      previous: '上一阶段',
      next: '下一阶段',
    }
  : {
      stage: 'Stage',
      required: 'Core lessons',
      topics: 'Topic Library',
      projects: 'Projects',
      outcome: 'After this stage, you can',
      previous: 'Previous stage',
      next: 'Next stage',
    })

const moduleGroups = computed(() => [
  { id: 'required', title: labels.value.required, moduleIds: props.navigation.current.requiredModuleIds },
  { id: 'topics', title: labels.value.topics, moduleIds: props.navigation.current.supportModuleIds },
  { id: 'projects', title: labels.value.projects, moduleIds: props.navigation.current.projectModuleIds ?? [] },
].map((group) => ({
  ...group,
  modules: group.moduleIds
    .map((moduleId) => curriculumModuleById.get(moduleId))
    .filter((module): module is CurriculumModule => Boolean(module)),
})).filter((group) => group.modules.length > 0))

function moduleRoute(moduleId: string) {
  return resolveCanonicalLearnRoute(moduleId) ?? `/learn/${moduleId}`
}
```

- [ ] **Step 4: Run and confirm GREEN**

Run: `node --test tests/curriculumSpineLanding.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/curriculum/SpineStageRail.vue src/components/curriculum/SpineStageDetail.vue tests/curriculumSpineLanding.test.ts
git commit -m "feat: add focused spine stage components"
```

### Task 3: Recompose the Spine view and consolidate curriculum styles

**Files:**
- Modify: `src/views/CurriculumSpineView.vue`
- Modify: `src/styles/views/curriculum.css`
- Modify: `tests/curriculumSpineLanding.test.ts`
- Test: `tests/curriculumSpineNavigation.test.ts`

**Interfaces:**
- Consumes `stageIdFromHash(route.hash)` and `buildSpineStageNavigation()`.
- Produces one active detail and a full compact rail; no progress/storage dependency.

- [ ] **Step 1: Update the landing test to reject the old all-stage list**

```ts
test('spine page derives one active detail from the route hash', () => {
  const source = read('src/views/CurriculumSpineView.vue')
  assert.match(source, /useRoute/)
  assert.match(source, /stageIdFromHash/)
  assert.match(source, /buildSpineStageNavigation/)
  assert.match(source, /SpineStageRail/)
  assert.match(source, /SpineStageDetail/)
  assert.doesNotMatch(source, /v-for="stage in stageCards"[\s\S]*class="spine-stage-card"/)
  assert.doesNotMatch(source, /migrateLearningProgressV2|localStorage/)
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/curriculumSpineLanding.test.ts tests/curriculumSpineNavigation.test.ts`

Expected: FAIL while the old all-stage card list remains.

- [ ] **Step 3: Implement the page compositor**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SpineStageDetail from '../components/curriculum/SpineStageDetail.vue'
import SpineStageRail from '../components/curriculum/SpineStageRail.vue'
import { buildSpineStageNavigation, stageIdFromHash } from '../curriculum/spineNavigation.ts'
import { curriculumSpineStages } from '../curriculum/spine.ts'
import type { AppLocale } from '../types/ml.ts'

const route = useRoute()
const { locale } = useI18n()
const currentLocale = computed(() => locale.value as AppLocale)
const activeStageId = computed(() => stageIdFromHash(route.hash))
const stageNavigation = computed(() => buildSpineStageNavigation(activeStageId.value))
</script>

<template>
  <div class="curriculum-page curriculum-spine-page">
    <section class="curriculum-hero curriculum-spine-hero">
      <div>
        <span class="eyebrow">{{ labels.eyebrow }}</span>
        <h1>{{ labels.title }}</h1>
        <p>{{ labels.body }}</p>
        <div class="curriculum-actions curriculum-spine-hero__actions">
          <router-link to="/learn/ai-overview">{{ labels.start }}</router-link>
          <router-link to="/tracks/core-learning-path">{{ labels.flatList }}</router-link>
        </div>
      </div>
      <div class="curriculum-hero__metrics">
        <article><span>{{ labels.stages }}</span><strong>{{ curriculumSpineStages.length }}</strong></article>
        <article><span>{{ labels.activeStage }}</span><strong>{{ stageNavigation.index + 1 }}</strong></article>
      </div>
    </section>
    <SpineStageRail :stages="curriculumSpineStages" :active-stage-id="activeStageId" :locale="currentLocale" />
    <SpineStageDetail :navigation="stageNavigation" :locale="currentLocale" />
  </div>
</template>
```

Replace `.spine-stage-nav`, `.spine-stage-list`, and `.spine-stage-card*` rules with `.spine-stage-rail` and `.spine-stage-detail*`. At 390px, the rail may scroll horizontally only inside its own container; `document.documentElement.scrollWidth` must still equal `clientWidth`. Use text plus `aria-current="step"` for the active stage.

- [ ] **Step 4: Run focused tests and build**

Run: `node --test tests/curriculumSpineLanding.test.ts tests/curriculumSpineNavigation.test.ts tests/curriculumRoutingNavigation.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: PASS with only the pre-existing chunk warning.

- [ ] **Step 5: Commit**

```bash
git add src/views/CurriculumSpineView.vue src/styles/views/curriculum.css tests/curriculumSpineLanding.test.ts tests/curriculumSpineNavigation.test.ts
git commit -m "refactor: focus spine on one active stage"
```

### Task 4: Document and verify Phase 24C

**Files:**
- Create: `docs/refactor/summaries/phase-24c.md`
- Modify: `.planning/ROADMAP.md`
- Modify: `.planning/STATE.md`
- Modify: `tests/curriculumMilestoneAudit.test.ts`

**Interfaces:**
- Produces complete Phase 24 IA traceability and closes the three-phase design.

- [ ] **Step 1: Add failing audit coverage**

```ts
assert.ok(existsSync(new URL('docs/refactor/summaries/phase-24c.md', root)))
assert.match(stateSource, /Phase 24C Spine progressive disclosure implementation completed/)
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/curriculumMilestoneAudit.test.ts`

Expected: FAIL.

- [ ] **Step 3: Add final summary and state records**

Record hash behavior, extracted components, preserved flat track/routes/progress, CSS ownership, exact verification evidence, and any remaining pre-existing warnings. Do not declare unrelated curriculum/content work complete.

- [ ] **Step 4: Run complete verification**

Run: `npm test`

Expected: all tests pass.

Run: `npm run build && npm run build:pages && git diff --check`

Expected: both builds pass with only pre-existing chunk warnings; no whitespace errors.

Browser-check:

- `/spine`
- `/spine#training-motion`
- `/spine#sequence-attention`
- `/spine#unknown`
- `/tracks/core-learning-path`
- representative legacy Math Lab, Data Lab, and Algorithm routes

At desktop and 390px, verify one active detail, previous/next navigation, hash restoration, invalid-hash fallback, no page overflow, bilingual labels, and zero console errors.

- [ ] **Step 5: Commit**

```bash
git add docs/refactor/summaries/phase-24c.md .planning/ROADMAP.md .planning/STATE.md tests/curriculumMilestoneAudit.test.ts
git commit -m "docs: complete phase 24 information architecture refactor"
```
