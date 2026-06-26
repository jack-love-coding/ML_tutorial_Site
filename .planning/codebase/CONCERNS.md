# Codebase Concerns

**Analysis Date:** 2026-06-25
**Mapped Commit:** `95a3eab`

## Tech Debt

**Three parallel course systems:**
- Issue: Algorithm modules, Math Lab, and Data Lab each have separate schemas, pages, routes, navigation, and progress.
- Files: `src/types/ml.ts`, `src/modules/math-lab/types/mathLab.ts`, `src/modules/data-lab/types/dataLab.ts`.
- Impact: Students cannot easily see one canonical learning path, and code cannot produce one continue-learning recommendation.
- Fix approach: Create a Curriculum V2 read model with adapters first, then gradually migrate source content.

**Module order conflicts with learning prerequisites:**
- Issue: `src/data/moduleCatalog.ts` places applied projects and advanced topics before loss, gradient descent, linear/logistic regression, classification, and MLP.
- Impact: Homepage and navigation can imply contradictory learning sequences.
- Fix approach: Separate canonical track order from legacy module registration order.

**Homepage owns too much curriculum logic:**
- Issue: `src/views/HomeView.vue` hand-authors a long route and directly imports Math Lab progress.
- Impact: The first page is both a decision surface and a catalog, and it cannot represent cross-domain progress accurately.
- Fix approach: Derive homepage start/continue/recommendation data from Curriculum Catalog and Progress V2.

**AlgorithmView conditional growth:**
- Issue: `src/views/AlgorithmView.vue` selects lesson experiences through many `isXxxPage` branches.
- Impact: Every new bespoke lesson increases central branching and regression risk.
- Fix approach: Introduce a generic lesson renderer and lab registry after catalog and route compatibility are stable.

## Known Bugs

No confirmed runtime bugs were reproduced during this mapping pass. Structural concerns are planning risks rather than verified broken behavior.

## Security Considerations

**Markdown rendering:**
- Risk: Course content could accidentally render unsafe HTML.
- Current mitigation: `src/utils/markdownMath.ts` uses markdown-it, KaTeX, and sanitize-html; tests cover malicious HTML and math delimiter cases.
- Recommendation: Keep all Curriculum V2 markdown blocks on the same safe rendering path.

**User input in labs:**
- Risk: NaN, Infinity, or out-of-range inputs can destabilize visualizations.
- Current mitigation: Several lab utilities are deterministic and tested.
- Recommendation: New lab protocol should require explicit variable ranges and fallback messages.

## Performance Bottlenecks

**Large build chunks:**
- Problem: Baseline builds warn for chunks over `1400 kB`.
- Measurement: `modules-*.js` about `1,537.54 kB`, `dist-*.js` about `1,082.26 kB`, `AlgorithmView-*.js` about `551.88 kB`.
- Cause: Centralized content registration and large page/lab surfaces.
- Improvement path: Keep routes lazy, introduce adapters without eager-importing all domains into initial surfaces, and later split lesson renderer/lab registry carefully.

## Fragile Areas

**Legacy URL compatibility:**
- Why fragile: Current router mixes bespoke chapter redirects and generic slug matching.
- Files: `src/router/index.ts`, `src/views/AlgorithmView.vue`.
- Safe modification: Add route tests before changing route order.

**Progress storage migration:**
- Why fragile: Three v1 stores use different IDs and payload shapes.
- Files: `src/utils/algorithmProgress.ts`, `src/modules/math-lab/utils/progress.ts`, `src/modules/data-lab/utils/progress.ts`.
- Safe modification: Write v2 migration tests for missing, corrupted, duplicated, and partially migrated stores before implementation.

**Generated/static asset references:**
- Why fragile: Many course modules reference local public assets.
- Files: `public/**`, course data modules in `src/data/` and `src/modules/**/data/`.
- Safe modification: Catalog validation should check referenced assets exist and public base paths are used.

## Missing Critical Features

**Unified curriculum catalog:**
- Problem: No single contract for module, lesson, track, domain, prerequisites, routes, localization, and outcomes.
- Blocks: unified navigation, unified progress, homepage recommendation, route normalization, and generic lesson rendering.

**Unified progress model:**
- Problem: Continue-learning surfaces are namespace-specific.
- Blocks: cross-domain weak-concept recommendations and one student state.

**Interaction protocol:**
- Problem: Some labs are true variable-manipulation experiments, while others are static workflow tabs.
- Blocks: consistent "predict -> operate -> observe -> explain -> checkpoint" learning design.

## Test Coverage Gaps

**Curriculum graph:**
- What's not tested: Cross-domain prerequisite graph and canonical track order.
- Priority: High for Phase 1.

**Progress migration:**
- What's not tested: v1 to v2 merge behavior.
- Priority: High for Phase 3.

**Homepage decision quality:**
- What's not tested: Whether the homepage only presents start, continue, route choice, progress, and exploration surfaces.
- Priority: Medium for Phase 4.

---
*Concerns audit: 2026-06-25*
