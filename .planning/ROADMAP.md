# Roadmap: ML Atlas Curriculum V2

**Created:** 2026-06-25
**Milestone Goal:** Build a unified curriculum model, routes, progress, homepage IA, and lesson-rendering path without breaking existing content, URLs, or local progress.

## Phase 1: Unified Curriculum Contract

**Goal:** Create a catalog read model that adapts Algorithm, Math Lab, and Data Lab content into one typed curriculum contract.

**Deliverables:**
- `src/curriculum/types.ts`
- `src/curriculum/catalog.ts`
- `src/curriculum/tracks.ts`
- `src/curriculum/prerequisites.ts`
- `src/curriculum/validation.ts`
- `src/curriculum/adapters/algorithmAdapter.ts`
- `src/curriculum/adapters/mathLabAdapter.ts`
- `src/curriculum/adapters/dataLabAdapter.ts`
- `tests/curriculumCatalog.test.ts`
- `tests/curriculumPrerequisites.test.ts`
- `tests/curriculumLocalization.test.ts`

**Must Not Do:**
- Do not change homepage behavior.
- Do not move all lesson body content.
- Do not change routes or progress storage.

**Exit Criteria:**
- Catalog lists current modules with unique canonical IDs, source mappings, domains, levels, localized title/summary, estimated minutes, prerequisites, outcomes, and lesson references.
- Prerequisite validation catches missing IDs and cycles.
- `npm test`, `npm run build`, and `npm run build:pages` pass.

## Phase 2: Routing and Navigation Unification

**Goal:** Introduce canonical curriculum routes and catalog-derived navigation while preserving legacy URLs.

**Deliverables:**
- Canonical `/learn/:moduleId` and `/learn/:moduleId/:lessonId` route support.
- Legacy redirect or direct-support table for `/math-lab/*`, `/data-lab/*`, and bespoke chapter routes.
- Navigation groups derived from curriculum track/domain/project metadata.
- Route and navigation tests.

**Must Not Do:**
- Do not modify progress storage.
- Do not delete legacy route handlers until tests prove compatibility.

**Exit Criteria:**
- Existing deep links remain reachable.
- Navigation presents Learning Path, Topic Library, Projects, and Progress structure.
- GitHub Pages build passes.

## Phase 3: Progress V2

**Goal:** Merge three v1 progress stores into an idempotent unified progress model.

**Deliverables:**
- `LearningProgressV2` type and storage wrapper.
- v1 reader/normalizer/merger/migration marker.
- Continue-learning selector using canonical lesson IDs.
- Migration tests for missing stores, corrupted JSON, duplicate runs, and conflict behavior.

**Must Not Do:**
- Do not delete v1 storage keys.
- Do not require backend storage.

**Exit Criteria:**
- Same v1 input always produces the same v2 output.
- v1 data remains intact after migration.
- Continue-learning can cross Algorithm, Math Lab, and Data Lab.

## Phase 4: Homepage and Information Architecture

**Goal:** Turn homepage into a decision surface instead of a full mixed catalog.

**Deliverables:**
- First screen with start, continue, and recommended next lesson.
- Route choices for core path, deep-learning path, math deepening, projects, and topic library.
- Unified progress summary.
- Mobile and bilingual layout checks.

**Must Not Do:**
- Do not rewrite lesson body content.
- Do not change lab internals.

**Exit Criteria:**
- A new student can identify first step, current stage, and why the next lesson matters.
- Homepage no longer duplicates a contradictory long learning path.

## Phase 5: LessonPage and Block Renderer

**Goal:** Create a generic lesson skeleton and renderer proven by three pilot modules.

**Deliverables:**
- `src/lessons/LessonPage.vue`
- `src/lessons/LessonBlockRenderer.vue`
- Lab registry for complex existing components.
- Adapter blocks for AI Overview, Gradient Descent, and MLP.
- Parity tests for pilot modules and route behavior.

**Must Not Do:**
- Do not migrate every course.
- Do not force complex labs into weak generic blocks.

**Exit Criteria:**
- Pilot modules follow "problem -> prediction -> intuition -> example -> formula -> lab -> reflection -> checkpoint -> next step".
- Old module pages remain usable for non-pilot modules.

## Phase 6: Teaching Interaction Protocol

**Goal:** Standardize what counts as an effective core-course interaction.

**Deliverables:**
- Protocol fields for learning goal, prediction prompt, manipulable variables, observable metrics, success criteria, reflection prompt, and evidence.
- Pilot upgrades for selected labs such as Gradient Descent, data split/fit/transform, classification threshold, CNN shape, Attention, or RAG.
- Tests for protocol completeness and evidence shape.

**Must Not Do:**
- Do not bulk-redesign all labs.
- Do not promote static tab switches as mastery evidence.

**Exit Criteria:**
- Core pilot interactions require prediction and explanation, not only clicking tabs.
- Checkpoints can point back to evidence and misconceptions.

## Phase 7: Milestone Audit

**Goal:** Verify Curriculum V2 is safe to ship and ready for later content migration.

**Deliverables:**
- Reachability audit for current modules and lessons.
- Legacy URL audit.
- Progress retention audit.
- Bilingual completeness audit.
- Build and GitHub Pages audit.
- UI/mobile fallback review for changed surfaces.

**Must Not Do:**
- Do not add new courses.
- Do not broaden scope beyond audit fixes.

**Exit Criteria:**
- No current content is unreachable.
- Old progress is retained.
- Tests and builds pass.
- Remaining risks are documented for the next milestone.

---
*Roadmap created: 2026-06-25*
