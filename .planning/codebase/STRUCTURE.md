# Codebase Structure

**Analysis Date:** 2026-06-25
**Mapped Commit:** `95a3eab`

## Directory Layout

```text
ML_tutorial_Site/
├── AGENTS.md                 # project development rules and Curriculum V2 guardrails
├── README.md                 # product overview and developer commands
├── package.json              # npm scripts and dependencies
├── vite.config.ts            # Vite build and GitHub Pages base configuration
├── public/                   # static images, Manim assets, icons, CNN model files
├── src/                      # Vue app, course data, simulations, utilities, styles
├── tests/                    # Node test runner coverage for content, utilities, layout
├── docs/                     # planning, source notes, import plans, refactor docs
└── .planning/                # GSD project memory and codebase maps
```

## Directory Purposes

**`src/data/`:**
- Purpose: Top-level algorithm and applied workflow module definitions.
- Contains: `aiOverviewModule.ts`, `moduleCatalog.ts`, `navigationMenus.ts`, `mlpModule.ts`, and related course modules.
- Key concern: `moduleCatalog.ts` currently defines algorithm order independently from Home and navigation group intent.

**`src/modules/math-lab/`:**
- Purpose: Math intuition product with typed modules, routes, labs, components, progress, and utilities.
- Contains: `types/mathLab.ts`, `data/modules.ts`, `pages/`, `labs/`, `components/`, `utils/`.
- Key concern: it has the richest prerequisite and learning-route metadata but is isolated from the algorithm route model.

**`src/modules/data-lab/`:**
- Purpose: Data-processing product with typed modules, pages, labs, visual assets, and progress.
- Contains: `types/dataLab.ts`, `data/modules.ts`, `pages/`, `labs/`, `utils/`.
- Key concern: it is a parallel course system with its own route and progress storage.

**`src/views/`:**
- Purpose: page-level route composition.
- Contains: `HomeView.vue` and `AlgorithmView.vue`.
- Key concern: both files carry information-architecture decisions that should eventually come from curriculum data.

**`src/components/`:**
- Purpose: shared and algorithm-specific Vue components.
- Contains: `AppShell.vue`, `MarkdownMathContent.vue`, lesson labs, visualizations, quiz components, and workbench shells.
- Key concern: several components are highly module-specific and selected by `AlgorithmView.vue` conditionals.

**`src/simulations/`:**
- Purpose: deterministic model behavior for algorithm labs.
- Contains: gradient descent, classification, linear/logistic regression, MLP, and loss simulations.

**`src/utils/`:**
- Purpose: shared helpers for progress, markdown rendering, public paths, math, datasets, and quiz scoring.
- Contains: `progressStorage.ts`, `algorithmProgress.ts`, `markdownMath.ts`, `publicPath.ts`.

**`src/styles/`:**
- Purpose: global tokens, resets, view styles, module styles, and theme overrides.
- Contains: `index.css`, `views/`, `modules/`, `foundation/`, and theme files.

**`public/`:**
- Purpose: runtime static assets.
- Contains: generated PNGs, Manim MP4/SVG files, icons, and TensorFlow.js CNN assets.

**`tests/`:**
- Purpose: Node tests for content registration, schemas, utilities, simulations, and layout invariants.

## Key File Locations

**Entry Points:**
- `src/main.ts` - Vue app bootstrap.
- `src/App.vue` - root app shell mount.
- `src/router/index.ts` - route table and route transition state.

**Course Schemas:**
- `src/types/ml.ts` - algorithm course and experiment types.
- `src/modules/math-lab/types/mathLab.ts` - Math Lab schema.
- `src/modules/data-lab/types/dataLab.ts` - Data Lab schema.

**Current Catalog and Navigation:**
- `src/data/moduleCatalog.ts` - algorithm module order and registry.
- `src/data/navigationMenus.ts` - top navigation groups for Math, Data, and modules.
- `src/views/HomeView.vue` - hand-authored homepage roadmap and Math Lab progress surface.

**Progress:**
- `src/utils/algorithmProgress.ts` - algorithm storage wrapper.
- `src/modules/math-lab/utils/progress.ts` - Math Lab storage wrapper.
- `src/modules/data-lab/utils/progress.ts` - Data Lab storage wrapper.
- `src/utils/progressStorage.ts` - shared JSON storage helper.

**Testing:**
- `tests/site-navigation.test.ts` - navigation structure.
- `tests/algorithm-progress.test.ts` - algorithm progress behavior.
- `tests/math-lab-core.test.ts` and `tests/data-lab.test.ts` - lab schema and utility behavior.
- `tests/build-config.test.mjs` - Vite build assumptions.

## Where to Add New Curriculum V2 Code

**Curriculum Contract:**
- Create `src/curriculum/types.ts`, `catalog.ts`, `tracks.ts`, `prerequisites.ts`, `validation.ts`.
- Add adapters in `src/curriculum/adapters/`.
- Add tests in `tests/curriculumCatalog.test.ts`, `tests/curriculumPrerequisites.test.ts`, and `tests/curriculumLocalization.test.ts`.

**Routing and Navigation:**
- Modify `src/router/index.ts` only after catalog tests exist.
- Derive navigation in or near `src/data/navigationMenus.ts` until a cleaner `src/curriculum/navigation.ts` is introduced.

**Progress V2:**
- Add a new module under `src/learning/` or `src/curriculum/progress/` after catalog IDs are stable.
- Keep v1 storage wrappers intact until migration tests pass and user data retention is decided.

**Lesson Renderer:**
- Create `src/lessons/LessonPage.vue`, `src/lessons/LessonBlockRenderer.vue`, and a lab registry only after catalog and route phases are stable.

## Special Directories

**`dist/`:**
- Build output, ignored by git.
- Produced by `npm run build` and `npm run build:pages`.

**`node_modules/`:**
- Dependency install output, ignored by git.

**`.planning/`:**
- GSD project memory and codebase maps.
- Should be reviewed as planning source, not runtime app code.

---
*Structure analysis: 2026-06-25*
