# Architecture

**Analysis Date:** 2026-06-25
**Mapped Commit:** `95a3eab`

## Pattern Overview

**Overall:** Static Vue learning application with three parallel course products.

**Key Characteristics:**
- Browser-only app with static assets and client-side routing.
- Course content is mostly typed TypeScript data rather than a CMS.
- Interactive labs combine Vue state, deterministic utilities, D3, Three.js, Manim media, and checkpoint state.
- Current information architecture is split across algorithm modules, Math Lab, and Data Lab.

## Layers

**Application Shell:**
- Purpose: Global layout, language toggle, and navigation.
- Contains: `src/components/AppShell.vue`, `src/i18n/messages.ts`, `src/data/navigationMenus.ts`.
- Depends on: Vue Router, vue-i18n, registered module data.
- Used by: `src/App.vue` and all page routes.

**Routing Layer:**
- Purpose: Map URLs to lazy page components.
- Contains: `src/router/index.ts`.
- Depends on: Vue Router and page-level lazy imports.
- Used by: the Vite app entry through `src/main.ts`.

**Course Data Layer:**
- Purpose: Store typed lessons, sections, assets, labs, quiz items, and source references.
- Contains: `src/data/**`, `src/modules/math-lab/data/**`, `src/modules/data-lab/data/**`.
- Depends on: Type definitions and simulation/lab helpers.
- Used by: page components, navigation menus, tests, and progress flows.

**Page Composition Layer:**
- Purpose: Assemble modules into learning pages and route-specific lesson experiences.
- Contains: `src/views/HomeView.vue`, `src/views/AlgorithmView.vue`, Math Lab pages, Data Lab pages.
- Depends on: course data, lab components, progress utilities, i18n.
- Used by: router.

**Interaction and Simulation Layer:**
- Purpose: Deterministic math, data, and model behavior for labs.
- Contains: `src/simulations/**`, `src/utils/**`, `src/modules/*/utils/**`, `src/modules/*/labs/**`.
- Depends on: browser APIs, D3/Three.js for rendering, typed configs.
- Used by: lab components and tests.

**Persistence Layer:**
- Purpose: Store progress in browser localStorage with JSON fallback handling.
- Contains: `src/utils/progressStorage.ts` and three progress wrappers.
- Depends on: localStorage-compatible `StorageLike`.
- Used by: home, module pages, checkpoint quizzes, route progress updates.

## Data Flow

**Algorithm Lesson Route:**
1. Vue Router matches `/learn/:slug` or bespoke chapter routes.
2. `src/views/AlgorithmView.vue` resolves a module from `src/data/moduleCatalog.ts`.
3. The experiment store ensures a module experiment exists.
4. The view chooses a bespoke component based on slug flags such as `isGradientPage`, `isMlpPage`, or workflow-module grouping.
5. Lab components call simulations/utilities and emit checkpoint/progress events.
6. Progress writes to `ml-atlas:algorithm-progress:v1`.

**Math Lab Route:**
1. Router matches `/math-lab` or `/math-lab/modules/:moduleId`.
2. Math Lab pages read modules from `src/modules/math-lab/data/modules.ts`.
3. Labs resolve by `componentName` and use utilities under `src/modules/math-lab/utils/`.
4. Quizzes and checkpoint reports write Math Lab progress.

**Data Lab Route:**
1. Router matches `/data-lab` or `/data-lab/modules/:moduleId`.
2. Data Lab pages read modules from `src/modules/data-lab/data/modules.ts`.
3. Labs use deterministic table transforms and visual components.
4. Quizzes write Data Lab progress.

## Key Abstractions

**AlgorithmModuleDefinition:**
- Purpose: Top-level algorithm course schema.
- Location: `src/types/ml.ts`.
- Pattern: typed data plus simulation callbacks and experiment controls.

**MathLabModule:**
- Purpose: Math concept course schema with concepts, visuals, labs, quizzes, misconceptions, and prerequisites.
- Location: `src/modules/math-lab/types/mathLab.ts`.
- Pattern: typed data with richer prerequisite and route metadata.

**DataLabModule:**
- Purpose: Data-processing course schema with sections, labs, visuals, quizzes, and source references.
- Location: `src/modules/data-lab/types/dataLab.ts`.
- Pattern: typed data for table and feature-engineering lessons.

**ThreeSceneController:**
- Purpose: Lifecycle contract for Three.js labs.
- Location: `src/modules/math-lab/types/mathLab.ts`.
- Pattern: `mount`, optional `update`, and `dispose`.

## Current Architecture Tension

- There is no canonical curriculum catalog that can answer "what is the next lesson?" across all domains.
- Navigation groups are hand-authored separately from module ordering.
- `HomeView.vue` is a decision surface, marketing page, roadmap, Math Lab continue view, and full catalog preview at the same time.
- `AlgorithmView.vue` centralizes many route-specific branches and keeps growing as more bespoke lessons are added.
- Progress cannot currently produce one unified continue-learning recommendation.

## Target Refactor Direction

- Introduce a `src/curriculum/` read model that adapts existing algorithm, math, and data modules.
- Keep original content modules as source of truth during the first milestone.
- Derive tracks, navigation, route redirects, and progress recommendations from the catalog.
- Introduce a Lesson Block Renderer only after catalog and routing compatibility are stable.

---
*Architecture analysis: 2026-06-25*
