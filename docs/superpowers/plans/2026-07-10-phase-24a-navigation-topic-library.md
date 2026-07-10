# Phase 24A Navigation and Topic Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Default Spine, Topic Library, Projects, and Progress hierarchy explicit while removing the full module inventory from the global header.

**Architecture:** Add one typed Topic Library domain contract, simplify `curriculumNavigationMenus` to direct links plus one category menu, and render desktop/mobile navigation through extracted header components. Preserve all existing routes and legacy navigation exports.

**Tech Stack:** Vue 3, TypeScript, Vue Router, vue-i18n, Node test runner, CSS

## Global Constraints

- Use `LocalizedCopy` with complete `'zh-CN'` and `en` text.
- Learner-facing Chinese uses “专题学习”; English uses “Topic Library.”
- Do not expose individual curriculum modules in the global Topic Library dropdown.
- Do not change Progress V1/V2 storage, course bodies, checkpoints, or Phase 23 files.
- Keep all existing Math Lab, Data Lab, Algorithm, canonical, and legacy routes reachable.
- Preserve keyboard focus, Escape closing, mobile navigation, and 390px readability.
- This phase has its own verification, commit, and PR.

---

### Task 1: Define the Topic Library domain contract and redirect

**Files:**
- Create: `src/curriculum/library.ts`
- Modify: `src/views/CurriculumLibraryView.vue`
- Modify: `src/router/index.ts`
- Test: `tests/curriculumRoutingNavigation.test.ts`

**Interfaces:**
- Produces: `CurriculumLibraryDomainId`, `curriculumLibraryDomains`, `isCurriculumLibraryDomain(value)`, and `resolveCurriculumLibraryDomain(value)`.
- Consumed by: router guard, Topic Library view, and Task 2 navigation data.

- [ ] **Step 1: Write failing domain and router tests**

```ts
import {
  curriculumLibraryDomains,
  isCurriculumLibraryDomain,
  resolveCurriculumLibraryDomain,
} from '../src/curriculum/library.ts'

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
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test tests/curriculumRoutingNavigation.test.ts`

Expected: FAIL because `src/curriculum/library.ts` and the redirect guard do not exist.

- [ ] **Step 3: Implement the typed domain contract and guard**

```ts
// src/curriculum/library.ts
import type { LocalizedCopy } from '../types/ml.ts'

export type CurriculumLibraryDomainId = 'math' | 'data' | 'model' | 'deep-learning' | 'project'

export interface CurriculumLibraryDomain {
  id: CurriculumLibraryDomainId
  title: LocalizedCopy
  summary: LocalizedCopy
}

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

export const curriculumLibraryDomains: CurriculumLibraryDomain[] = [
  { id: 'math', title: copy('数学专题', 'Math Topics'), summary: copy('连接数学直觉与模型行为。', 'Connect mathematical intuition to model behavior.') },
  { id: 'data', title: copy('数据专题', 'Data Topics'), summary: copy('理解原始数据如何成为模型输入。', 'Understand how raw data becomes model input.') },
  { id: 'model', title: copy('模型与训练', 'Models and Training'), summary: copy('观察损失、优化、边界与评估。', 'Study loss, optimization, boundaries, and evaluation.') },
  { id: 'deep-learning', title: copy('深度学习', 'Deep Learning'), summary: copy('从 MLP 延伸到 CNN 与 Transformer。', 'Extend from MLPs to CNNs and Transformers.') },
  { id: 'project', title: copy('项目实战', 'Projects'), summary: copy('在端到端任务中整合知识。', 'Integrate knowledge in end-to-end tasks.') },
]

const domainIds = new Set(curriculumLibraryDomains.map((domain) => domain.id))

export function isCurriculumLibraryDomain(value: unknown): value is CurriculumLibraryDomainId {
  return typeof value === 'string' && domainIds.has(value as CurriculumLibraryDomainId)
}

export function resolveCurriculumLibraryDomain(value: unknown): CurriculumLibraryDomainId {
  return isCurriculumLibraryDomain(value) ? value : 'math'
}
```

```ts
// src/router/index.ts
import { isCurriculumLibraryDomain } from '../curriculum/library.ts'

function redirectInvalidLibraryDomain(to: RouteLocationNormalized) {
  const domain = routeParamValue(to.params.domain)
  return isCurriculumLibraryDomain(domain) ? true : { path: '/library/math' }
}
```

Add `beforeEnter: redirectInvalidLibraryDomain` to `/library/:domain`, and replace the local `libraryDomains` array in `CurriculumLibraryView.vue` with `curriculumLibraryDomains` plus `resolveCurriculumLibraryDomain(route.params.domain)`.

- [ ] **Step 4: Run the test and confirm GREEN**

Run: `node --test tests/curriculumRoutingNavigation.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/library.ts src/views/CurriculumLibraryView.vue src/router/index.ts tests/curriculumRoutingNavigation.test.ts
git commit -m "feat: define topic library domains"
```

### Task 2: Simplify the global navigation data

**Files:**
- Modify: `src/data/navigationMenus.ts`
- Modify: `tests/curriculumRoutingNavigation.test.ts`
- Test: `tests/site-navigation.test.ts`

**Interfaces:**
- Consumes: `curriculumLibraryDomains` from Task 1.
- Produces: `CurriculumNavigationMenu.route?: string`; only `topic-library` retains grouped dropdown content.

- [ ] **Step 1: Replace old IA expectations with failing direct-link/category tests**

```ts
test('curriculum navigation exposes direct primary destinations and one category menu', () => {
  const byId = new Map(curriculumNavigationMenus.map((item) => [item.id, item]))
  assert.equal(byId.get('learning-path')?.route, '/spine')
  assert.equal(byId.get('projects')?.route, '/tracks/project-practice')
  assert.equal(byId.get('progress')?.route, '/progress')
  assert.equal(byId.get('topic-library')?.label['zh-CN'], '专题学习')
  assert.equal(byId.get('topic-library')?.label.en, 'Topic Library')
  assert.deepEqual(byId.get('topic-library')?.groups.flatMap((group) => group.items.map((item) => item.route)), [
    '/library/math',
    '/library/data',
    '/library/model',
    '/library/deep-learning',
  ])
  assert.equal(byId.get('topic-library')?.groups.flatMap((group) => group.items).some((item) => item.route.startsWith('/learn/')), false)
  assert.equal(byId.get('topic-library')?.groups.flatMap((group) => group.items).some((item) => item.route.startsWith('/math-lab/modules/')), false)
})
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test tests/curriculumRoutingNavigation.test.ts tests/site-navigation.test.ts`

Expected: FAIL on the old “支持镜头” label, missing direct routes, and module-heavy groups.

- [ ] **Step 3: Implement the minimal navigation data change**

```ts
export interface CurriculumNavigationMenu {
  id: SiteNavigationMenuId
  label: LocalizedCopy
  route?: string
  groups: NavigationGroup[]
  activePrefixes: string[]
}

export const curriculumNavigationMenus: CurriculumNavigationMenu[] = [
  {
    id: 'learning-path',
    label: copy('默认学习主线', 'Default Spine'),
    route: '/spine',
    activePrefixes: ['/spine', '/tracks/core-learning-path', '/learn'],
    groups: [],
  },
  {
    id: 'topic-library',
    label: copy('专题学习', 'Topic Library'),
    activePrefixes: ['/library', '/math-lab', '/data-lab'],
    groups: [{
      id: 'topic-domains',
      label: copy('按专题浏览', 'Browse by topic'),
      items: curriculumLibraryDomains
        .filter((domain) => domain.id !== 'project')
        .map((domain) => ({ id: domain.id, route: `/library/${domain.id}`, label: domain.title })),
    }],
  },
  {
    id: 'projects',
    label: copy('项目实战', 'Projects'),
    route: '/tracks/project-practice',
    activePrefixes: ['/tracks/project-practice', '/projects', '/library/project'],
    groups: [],
  },
  {
    id: 'progress',
    label: copy('我的进度', 'Progress'),
    route: '/progress',
    activePrefixes: ['/progress'],
    groups: [],
  },
]
```

Keep `coreExperimentNavigationGroups`, `mathLabNavigationGroups`, and `dataLabNavigationGroups` exported unchanged for legacy consumers and tests.

- [ ] **Step 4: Run the focused tests and confirm GREEN**

Run: `node --test tests/curriculumRoutingNavigation.test.ts tests/site-navigation.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/navigationMenus.ts tests/curriculumRoutingNavigation.test.ts tests/site-navigation.test.ts
git commit -m "refactor: simplify curriculum navigation data"
```

### Task 3: Extract the header and shared navigation renderer

**Files:**
- Create: `src/components/navigation/types.ts`
- Create: `src/components/navigation/SiteHeader.vue`
- Create: `src/components/navigation/SiteNavigation.vue`
- Modify: `src/components/AppShell.vue`
- Modify: `tests/curriculumRoutingNavigation.test.ts`
- Modify: `tests/math-lab-layout.test.mjs`
- Modify: `tests/data-lab-layout.test.mjs`

**Interfaces:**
- `types.ts` produces `RenderedNavigationLink`, `RenderedNavigationGroup`, and `RenderedNavigationItem`.
- `SiteNavigation` props: `{ items: RenderedNavigationItem[]; mobile: boolean }`.
- `SiteNavigation` emits: `navigate` after link activation.
- `SiteHeader` owns locale rendering, open item state, route-change closure, and passes one view model to desktop/mobile instances.
- `AppShell` renders `<SiteHeader />` and `<slot />` only.

- [ ] **Step 1: Write failing component-boundary assertions**

```ts
test('app shell delegates header and navigation rendering', () => {
  const shell = read('src/components/AppShell.vue')
  const header = read('src/components/navigation/SiteHeader.vue')
  const navigation = read('src/components/navigation/SiteNavigation.vue')
  assert.match(shell, /<SiteHeader/)
  assert.doesNotMatch(shell, /curriculumNavigationMenus|openNavigationMenuId/)
  assert.match(header, /curriculumNavigationMenus/)
  assert.match(header, /<SiteNavigation/)
  assert.match(navigation, /props\.items|defineProps/)
  assert.match(navigation, /aria-expanded/)
  assert.match(navigation, /keydown\.esc/)
})
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test tests/curriculumRoutingNavigation.test.ts tests/math-lab-layout.test.mjs tests/data-lab-layout.test.mjs`

Expected: FAIL because the extracted components do not exist.

- [ ] **Step 3: Implement the shared rendered navigation type and components**

```ts
// src/components/navigation/types.ts
import type { SiteNavigationMenuId } from '../../data/navigationMenus.ts'

export interface RenderedNavigationLink {
  id: string
  route: string
  label: string
}

export interface RenderedNavigationGroup {
  id: string
  label: string
  items: RenderedNavigationLink[]
}

export interface RenderedNavigationItem {
  id: SiteNavigationMenuId
  label: string
  route?: string
  active: boolean
  groups: RenderedNavigationGroup[]
}
```

```ts
// SiteHeader.vue script contract
import type { RenderedNavigationItem } from './types.ts'

const renderedItems = computed<RenderedNavigationItem[]>(() =>
  curriculumNavigationMenus.map((item) => ({
    id: item.id,
    label: localizedText(item.label),
    route: item.route,
    active: item.activePrefixes.some((prefix) => route.path === prefix || route.path.startsWith(`${prefix}/`)),
    groups: item.groups.map((group) => ({
      id: group.id,
      label: localizedText(group.label),
      items: group.items.map((link) => ({ ...link, label: localizedText(link.label) })),
    })),
  })),
)
```

```vue
<!-- SiteNavigation.vue core branch -->
<script setup lang="ts">
import { ref } from 'vue'
import type { RenderedNavigationItem } from './types.ts'

const props = defineProps<{ items: RenderedNavigationItem[] }>()
const emit = defineEmits<{ navigate: [] }>()
const openItemId = ref<string | null>(null)

function toggleMenu(itemId: string) {
  openItemId.value = openItemId.value === itemId ? null : itemId
}

function closeMenu(itemId: string) {
  if (openItemId.value === itemId) openItemId.value = null
}
</script>

<template>
<template v-for="item in props.items" :key="item.id">
<router-link
  v-if="item.route"
  class="site-header__link"
  :class="{ 'is-current': item.active, 'site-header__link--secondary': item.id === 'progress' }"
  :to="item.route"
  @click="emit('navigate')"
>
  {{ item.label }}
</router-link>
<div v-else class="site-header__more" :class="{ 'is-open': openItemId === item.id }" @keydown.esc="closeMenu(item.id)">
  <button type="button" class="site-header__link site-header__more-button" :aria-expanded="openItemId === item.id" @click="toggleMenu(item.id)">
    {{ item.label }}
  </button>
  <div class="site-header__more-menu">
    <section v-for="group in item.groups" :key="group.id">
      <span>{{ group.label }}</span>
      <router-link v-for="link in group.items" :key="link.id" :to="link.route" @click="emit('navigate')">
        {{ link.label }}
      </router-link>
    </section>
  </div>
</div>
</template>
</template>
```

`AppShell.vue` becomes:

```vue
<script setup lang="ts">
import SiteHeader from './navigation/SiteHeader.vue'
</script>

<template>
  <div class="app-shell">
    <SiteHeader />
    <main class="site-main"><slot /></main>
  </div>
</template>
```

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run: `node --test tests/curriculumRoutingNavigation.test.ts tests/math-lab-layout.test.mjs tests/data-lab-layout.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/AppShell.vue src/components/navigation/types.ts src/components/navigation/SiteHeader.vue src/components/navigation/SiteNavigation.vue tests/curriculumRoutingNavigation.test.ts tests/math-lab-layout.test.mjs tests/data-lab-layout.test.mjs
git commit -m "refactor: extract site navigation components"
```

### Task 4: Give navigation styles one owner

**Files:**
- Modify: `src/styles/layout/site-header.css`
- Modify: `src/styles/themes/pixel-redesign.css`
- Modify: `src/styles/overrides/final-responsive.css`
- Modify: `src/styles/overrides/final-shell.css`
- Modify: `src/styles/index.css`
- Test: `tests/curriculumRoutingNavigation.test.ts`

**Interfaces:**
- Produces one final owner for `.site-header*`, `.site-header__nav*`, dropdown, mobile navigation, and `.locale-switch*` layout selectors.

- [ ] **Step 1: Add a failing ownership test**

```ts
test('site header layout selectors have one stylesheet owner', () => {
  const layout = read('src/styles/layout/site-header.css')
  const theme = read('src/styles/themes/pixel-redesign.css')
  const responsive = read('src/styles/overrides/final-responsive.css')
  const shell = read('src/styles/overrides/final-shell.css')
  assert.match(layout, /\.site-header__more-menu/)
  assert.match(layout, /\.site-header__nav--mobile/)
  assert.doesNotMatch(theme, /\.site-header__more-menu/)
  assert.doesNotMatch(responsive, /\.site-header__nav--mobile/)
  assert.doesNotMatch(shell, /\.site-header\s*\{/)
})
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test tests/curriculumRoutingNavigation.test.ts`

Expected: FAIL because navigation selectors are currently duplicated.

- [ ] **Step 3: Move scoped selectors without changing the pixel theme**

Move the final computed header/navigation rules, including their `1080px` and `720px` breakpoints, into `site-header.css`. Remove only the matching header/navigation blocks from `pixel-redesign.css`, `final-responsive.css`, and `final-shell.css`. Keep pixel variables and non-navigation theme rules unchanged.

Ensure the secondary progress link has a visible but quieter style:

```css
.site-header__link--secondary {
  color: var(--pixel-muted);
  background: transparent;
}

.site-header__link--secondary.is-current,
.site-header__link--secondary:focus-visible,
.site-header__link--secondary:hover {
  color: var(--pixel-ink);
  background: #dff8e8;
}
```

- [ ] **Step 4: Run focused tests and builds**

Run: `node --test tests/curriculumRoutingNavigation.test.ts tests/math-lab-layout.test.mjs tests/data-lab-layout.test.mjs`

Expected: PASS.

Run: `npm run build`

Expected: PASS with only the documented pre-existing large-chunk warning.

- [ ] **Step 5: Commit**

```bash
git add src/styles/layout/site-header.css src/styles/themes/pixel-redesign.css src/styles/overrides/final-responsive.css src/styles/overrides/final-shell.css src/styles/index.css tests/curriculumRoutingNavigation.test.ts
git commit -m "refactor: consolidate site header styles"
```

### Task 5: Document and verify Phase 24A

**Files:**
- Create: `docs/refactor/summaries/phase-24a.md`
- Modify: `.planning/ROADMAP.md`
- Modify: `.planning/STATE.md`
- Modify: `tests/curriculumMilestoneAudit.test.ts`

**Interfaces:**
- Produces Phase 24A traceability and the prerequisite for Phase 24B.

- [ ] **Step 1: Add a failing milestone assertion**

```ts
assert.ok(existsSync(new URL('docs/refactor/summaries/phase-24a.md', root)))
assert.match(stateSource, /Phase 24A navigation and Topic Library implementation completed/)
```

- [ ] **Step 2: Run the milestone test and confirm RED**

Run: `node --test tests/curriculumMilestoneAudit.test.ts`

Expected: FAIL because the summary and state entry do not exist.

- [ ] **Step 3: Add the summary and planning records**

Record exact deliverables, non-goals, verification commands, browser routes, desktop/390px results, and the next phase (`Phase 24B Homepage Focus`). Do not mark Phase 24B started.

- [ ] **Step 4: Run complete verification**

Run: `npm test`

Expected: all tests pass, zero failures.

Run: `npm run build && npm run build:pages && git diff --check`

Expected: both builds pass; only pre-existing chunk warnings; no whitespace errors.

Browser-check `/`, `/spine`, `/library/math`, `/tracks/project-practice`, and `/progress` at desktop and 390px. Verify keyboard dropdown open/close, Escape, mobile menu close after navigation, no overflow, and zero console errors.

- [ ] **Step 5: Commit**

```bash
git add docs/refactor/summaries/phase-24a.md .planning/ROADMAP.md .planning/STATE.md tests/curriculumMilestoneAudit.test.ts
git commit -m "docs: complete phase 24a navigation refactor"
```
