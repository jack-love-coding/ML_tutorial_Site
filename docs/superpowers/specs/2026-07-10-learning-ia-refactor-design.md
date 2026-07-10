# Learning Information Architecture Refactor Design

**Date:** 2026-07-10

**Status:** Approved design; pending implementation plan

**Scope:** Learner-facing homepage, global navigation, Curriculum Spine landing, and Topic Library entry structure

## Context

Curriculum V2 already encodes the approved learning model:

- one data-first mixed spiral spine;
- Math Lab, Data Lab, model training, and deep learning as supporting topic areas;
- `attention-transformer` as the required Spine V1 endpoint;
- projects as recommended validation rather than hard blockers;
- progress and backend expansion deferred behind curriculum clarity and content quality.

The current interface only partially communicates that model. The curriculum data says “one primary spine,” but the learner-facing shell still presents several competing signals:

- the homepage gives a large visual role to progress and repeats route decisions in several sections;
- the top navigation exposes a very long topic menu containing most modules;
- the Spine page renders all eleven stages in full, which is comprehensive but difficult to scan as a journey;
- `AppShell.vue` and `HomeView.vue` combine data loading, view-model construction, interaction state, and large templates;
- navigation, homepage, and curriculum styles are overridden across base, pixel theme, responsive, and final override files.

This refactor makes the interface faithfully express the curriculum architecture without rewriting course bodies or changing progress storage.

## Goals

1. Make the default Data First spine the obvious first learning action.
2. Replace the internal phrase “支持镜头” with the learner-facing name “专题学习.”
3. Move detailed module discovery out of the global header and into Topic Library pages.
4. Turn `/spine` into a staged journey that highlights one stage at a time.
5. Reduce the responsibilities of `AppShell.vue`, `HomeView.vue`, and `CurriculumSpineView.vue` through focused components and selectors.
6. Preserve all existing curriculum content, legacy URLs, bilingual behavior, checkpoints, and Progress V1/V2 data.
7. Deliver the work incrementally, with each implementation phase independently testable and reviewable.

## Non-Goals

- No course-body rewrite or new course inventory.
- No changes to Algorithm, Math Lab, or Data Lab lesson renderers.
- No changes to the three Progress V1 localStorage keys or the Progress V2 schema.
- No backend, account, database, or durable synchronization work.
- No removal of legacy routes.
- No global brand redesign and no replacement of the existing pixel visual language.
- No broad CSS cleanup outside the navigation, homepage, Spine, and Topic Library surfaces touched here.
- No changes to the Phase 23 Architecture-to-Tools challenge implementation.

## Selected Approach

Use a progressive information-architecture refactor rather than a visual-only patch or a full portal rewrite.

This approach changes the learner-facing hierarchy and splits oversized components while continuing to use the approved `spine.ts`, curriculum roles, route manifest, catalog adapters, and existing routes. It avoids a large migration and keeps the refactor compatible with the repository’s Curriculum V2 guardrails.

## Learner-Facing Information Architecture

### Global Navigation

The top-level navigation becomes:

1. 课程首页 / Home
2. 默认学习主线 / Default Spine
3. 专题学习 / Topic Library
4. 项目实战 / Projects
5. 我的进度 / Progress
6. Language switch

Behavior:

- “默认学习主线” is a direct link to `/spine`, not an empty or near-empty dropdown.
- “专题学习” replaces every learner-facing use of “支持镜头” in navigation and discovery surfaces.
- The Topic Library dropdown contains only four category links:
  - 数学专题 / Math Topics
  - 数据专题 / Data Topics
  - 模型与训练 / Models and Training
  - 深度学习 / Deep Learning
- Individual module links are removed from the global header and remain discoverable on `/library/:domain`.
- “项目实战” links directly to `/tracks/project-practice`.
- “我的进度” remains available but uses secondary visual emphasis.
- Desktop and mobile navigation are generated from the same rendered navigation model.

### Homepage

The homepage has three levels of priority.

#### 1. Primary learning task

The hero explains what ML Atlas teaches and contains one primary action:

- learners without usable progress see “开始主线” and enter the first Spine module;
- returning learners see “继续学习,” with the current module as supporting context;
- “查看主线” remains a secondary action.

Progress metrics may appear in a compact form but must not occupy half of the first viewport or compete with the curriculum message.

#### 2. Spine preview

The homepage shows a compact route preview rather than four fully expanded stages. It contains:

- the Data First route promise;
- the recommended current stage;
- the adjacent next stage;
- a link to the complete Spine page.

Without progress, the preview begins at stage 0. Progress is used only to recommend a position; it never hides the full route or forces navigation.

#### 3. Secondary exploration

A compact link area exposes:

- 专题学习;
- 项目实战;
- 我的进度.

The current four-card route decision grid, duplicated route chips, four-stage full preview, and homepage readiness checklist are removed. Their detailed responsibilities belong to `/spine`, `/library/:domain`, the project track, and `/progress`.

### Default Spine Page

`/spine` keeps the approved eleven-stage Data First contract but changes how it is presented.

- The hero explains the learning endpoint, spiral learning method, and primary start/continue action.
- A compact stage rail shows all eleven stages and makes the active stage visually and semantically clear.
- Only one stage detail is emphasized at a time.
- The detail contains:
  - learner question;
  - bridge explaining why the stage comes now;
  - required modules;
  - Topic Library modules;
  - recommended project validation;
  - completion outcome;
  - previous/next stage navigation.
- The active stage is represented by a URL hash such as `/spine#training-motion`.
- A valid hash restores the same stage after refresh or sharing.
- A missing or invalid hash falls back to stage 0.
- Existing progress can produce a “recommended continuation” badge or action, but it does not silently rewrite the hash.
- `/tracks/core-learning-path` remains available as the flat module list.

### Topic Library

`/library/:domain` remains the detailed browse surface.

- Learner-facing labels use “专题学习,” not “支持镜头.”
- Domain tabs remain Math, Data, Models and Training, Deep Learning, and Projects where appropriate.
- Module cards retain curriculum-role context so required, just-in-time, project, advanced, reference, and overlap modules remain distinguishable.
- An invalid domain explicitly redirects to `/library/math` rather than rendering Math content under an invalid URL.

## Component Boundaries

### Application shell

`AppShell.vue` retains only the outer page shell and content slot.

New or extracted components:

- `SiteHeader.vue`
  - owns brand, language switch, and mobile-open state;
  - closes navigation after route changes;
  - depends on a rendered navigation model rather than raw curriculum data.
- `SiteNavigation.vue`
  - renders desktop and mobile navigation from the same input;
  - owns dropdown open/close and Escape behavior;
  - does not derive curriculum categories itself.

The implementation may use a smaller private navigation-item component if it removes meaningful desktop/mobile duplication. It should not create a component for every link.

### Homepage

`HomeView.vue` becomes a page compositor.

Extracted units:

- `HomeLearningHero.vue`
  - displays the route promise and primary/secondary actions;
  - receives continuation data as props.
- `HomeSpinePreview.vue`
  - displays the recommended stage and next stage;
  - receives a prepared view model, not raw progress storage.
- `HomeExploreLinks.vue`
  - renders Topic Library, projects, and progress as secondary destinations.
- `useLearningContinuation.ts`
  - wraps the existing Progress V2 migration/read behavior needed by the homepage;
  - exposes a safe, read-only continuation view model;
  - preserves the existing focus, visibility, and storage refresh behavior behind one composable boundary;
  - falls back to stage 0 if storage is unavailable or malformed.

### Spine page

`CurriculumSpineView.vue` becomes a page compositor.

Extracted units:

- `SpineStageRail.vue`
  - renders the compact eleven-stage navigation;
  - emits or links to a stage hash;
  - communicates active state through text and `aria-current`, not color alone.
- `SpineStageDetail.vue`
  - renders one stage’s question, bridge, module groups, outcome, and previous/next links;
  - contains no route parsing or progress loading.

Hash parsing and stage selection live in a small curriculum utility or composable with pure functions that can be unit tested without mounting the page.

## Data Flow

The data flow remains one-way:

```text
spine.ts + roles.ts + routeManifest.ts
                  |
                  v
       selectors / computed view models
                  |
       +----------+-----------+
       |          |           |
       v          v           v
  Navigation   Homepage    Spine / Library
       |          |           |
       +----------+-----------+
                  |
                  v
          existing course routes
```

Rules:

- Components do not duplicate stage titles, curriculum roles, module titles, or canonical routes.
- Navigation contains category-level information only.
- Curriculum Catalog remains adapter-first and does not absorb the three course bodies.
- Progress remains an optional read model for continuation; curriculum order is still defined by `spine.ts`.
- A missing catalog entry is omitted from the rendered link list and must fail a consistency test.

## Error and Edge-Case Behavior

- Invalid Topic Library domain: redirect to `/library/math`.
- Invalid Spine hash: select stage 0 without throwing.
- Missing module manifest entry: omit the broken link at runtime and fail catalog/navigation consistency tests.
- Corrupted or unavailable localStorage: show stage 0 start state and keep the homepage usable.
- No progress: show “开始主线.”
- Existing progress outside the required Spine, such as an advanced module: keep the direct “continue” destination but recommend the first incomplete Spine stage separately.
- Mobile menu route change: close the menu and all open category panels.
- Escape on an open category panel: close that panel and retain keyboard focus on its trigger where feasible.

## Styling Ownership

The pixel visual language, colors, borders, and typography remain.

For the touched surfaces:

- navigation layout and states belong to the layout/navigation stylesheet;
- homepage structure belongs to `home.css`;
- Spine and Topic Library structure belongs to `curriculum.css`;
- theme files provide tokens and theme-level appearance, not duplicate layout rules;
- final overrides are removed only when the same touched selector has a clear owner elsewhere.

The refactor must preserve:

- visible keyboard focus;
- high contrast;
- non-color state labels;
- reduced-motion behavior;
- readable 390px layouts;
- no horizontal overflow.

## Incremental Delivery

The implementation is split into three independently verified phases and PRs.

### Phase 24A: Navigation and naming

- Rename “支持镜头” to “专题学习.”
- Reduce the Topic Library menu to category links.
- Make Default Spine, Projects, and Progress direct links where no submenu is needed.
- Extract header/navigation responsibilities.
- Add invalid library-domain redirect behavior.

### Phase 24B: Homepage focus

- Extract homepage components and continuation composable.
- Make the Spine the single primary task.
- Replace duplicated route surfaces with compact Spine preview and secondary exploration links.
- Remove homepage readiness checklist.

### Phase 24C: Spine progressive disclosure

- Add hash-based active-stage selection.
- Extract stage rail and stage detail components.
- Show one emphasized stage with previous/next navigation.
- Preserve the flat core track and all existing course routes.
- Consolidate touched curriculum styles.

Each phase must start from the prior merged phase or use an explicitly reviewed stacked branch. Runtime work must not be mixed into the design commit.

## Testing Strategy

### Node and source-level tests

- Navigation model contains the approved five learner-facing destinations and bilingual labels.
- “专题学习” replaces learner-facing “支持镜头” on the scoped surfaces.
- Topic Library navigation contains category links and no per-module mega-menu inventory.
- Desktop and mobile navigation consume the same rendered model.
- Homepage uses the continuation composable and no longer contains the removed decision grid/readiness checklist.
- Spine hash parsing accepts known stage IDs and falls back on invalid input.
- Spine stage detail derives required, topic, project, outcome, previous, and next data from the approved contract.
- Invalid `/library/:domain` behavior is explicitly covered.
- Canonical and legacy routes remain present.
- Progress V1/V2 storage keys and schemas remain unchanged.
- Catalog, route manifest, roles, and Spine references stay consistent.

### Browser verification

Verify `/`, `/spine`, `/library/math`, `/tracks/project-practice`, and `/progress` in Chinese and English where relevant.

At desktop and 390px widths, verify:

- no horizontal overflow;
- the primary homepage action is obvious;
- the Topic Library menu fits the viewport;
- keyboard menu open/close and Escape behavior;
- mobile menu opens, navigates, and closes;
- valid Spine hashes restore the selected stage;
- invalid hashes fall back safely;
- previous/next stage links update the focused detail;
- legacy Math Lab, Data Lab, and Algorithm routes remain reachable;
- browser console has zero errors.

### Required commands

- `npm test`
- `npm run build`
- `npm run build:pages`
- `git diff --check`

## Acceptance Criteria

The refactor is complete when:

1. The homepage communicates one primary Data First learning path.
2. The global header no longer contains the full module inventory.
3. “专题学习” is the approved learner-facing name across navigation and discovery surfaces.
4. Progress remains accessible but visually secondary.
5. The homepage no longer duplicates route cards, four full stage details, and readiness checklist content.
6. `/spine` exposes all eleven stages while emphasizing only one stage detail at a time.
7. A Spine stage can be restored through a valid hash, with safe fallback for invalid hashes.
8. Topic Library categories and curriculum-role labels remain discoverable.
9. All existing course routes, bilingual content, checkpoints, and progress storage remain intact.
10. Desktop and 390px browser checks pass without overflow or console errors.
11. Full tests and both production builds pass, with only documented pre-existing warnings.
