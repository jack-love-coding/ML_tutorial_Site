# Requirements: ML Atlas Curriculum V2

**Defined:** 2026-06-25
**Core Value:** Students should always know where they are in the learning path, why the current lesson matters, and what evidence shows they are ready for the next step.

## v1 Requirements

### Curriculum Contract

- [ ] **CURR-01**: Every existing Algorithm, Math Lab, and Data Lab module appears in a unified curriculum catalog with a globally unique canonical ID.
- [ ] **CURR-02**: Every catalog module records its source namespace and legacy source ID.
- [ ] **CURR-03**: Every catalog module exposes bilingual title and summary copy.
- [ ] **CURR-04**: The core learning track is generated from catalog records and respects prerequisite ordering.
- [ ] **CURR-05**: Prerequisite validation fails on missing IDs or cycles.

### Routing and Navigation

- [ ] **ROUTE-01**: Canonical curriculum routes support `/learn/:moduleId` and `/learn/:moduleId/:lessonId`.
- [ ] **ROUTE-02**: Legacy `/math-lab/*`, `/data-lab/*`, and bespoke algorithm chapter URLs remain reachable through redirects or direct support.
- [ ] **ROUTE-03**: Top navigation can be derived from Learning Path, Topic Library, Projects, and Progress groups.
- [ ] **ROUTE-04**: Route and asset behavior remains compatible with GitHub Pages base path.

### Progress

- [ ] **PROG-01**: Progress V2 merges Algorithm, Math Lab, and Data Lab v1 progress without deleting v1 stores.
- [ ] **PROG-02**: Progress migration is idempotent and schema-versioned.
- [ ] **PROG-03**: Progress migration tolerates corrupted JSON, missing stores, and duplicate runs.
- [ ] **PROG-04**: Continue-learning can recommend the next lesson across all curriculum domains.

### Homepage and Information Architecture

- [ ] **HOME-01**: Homepage first screen presents start, continue, and one recommended next lesson instead of the full catalog.
- [ ] **HOME-02**: Homepage route choices separate core path, deep-learning path, math deepening, projects, and topic exploration.
- [ ] **HOME-03**: Homepage uses curriculum/progress data instead of duplicating a long hand-authored learning path.
- [ ] **HOME-04**: Homepage remains bilingual and mobile-readable.

### Lesson Renderer and Interaction

- [ ] **LESSON-01**: A generic LessonPage supports explanation, worked example, formula, visual, video, prediction, lab, reflection, and checkpoint blocks.
- [ ] **LESSON-02**: A lab registry embeds complex existing components without rewriting them into generic code.
- [ ] **LESSON-03**: AI Overview, Gradient Descent, and MLP render through the pilot LessonPage path with parity tests.
- [ ] **LAB-01**: New interaction protocol records learning goal, prediction prompt, manipulable variables, observable metrics, success criteria, reflection prompt, and evidence.
- [ ] **LAB-02**: Existing static workflow tabs are not promoted to core experiments until they satisfy the interaction protocol or are labeled as navigation/reading aids.

### Validation

- [ ] **VAL-01**: Each phase passes `npm test`.
- [ ] **VAL-02**: Each phase passes `npm run build`.
- [ ] **VAL-03**: Each phase passes `npm run build:pages`.
- [ ] **VAL-04**: Milestone audit verifies content reachability, route compatibility, progress retention, bilingual completeness, and UI fallback behavior.

## v2 Requirements

### Future Curriculum Expansion

- **FUT-01**: Add new courses after Curriculum V2 stabilizes.
- **FUT-02**: Add cloud-synced user accounts or cross-device progress.
- **FUT-03**: Add full browser visual regression for core pages.
- **FUT-04**: Migrate every Math Lab and Data Lab lesson body into block format.

## Out of Scope

| Feature | Reason |
| --- | --- |
| New UI framework | Existing stack and style rules require using current primitives. |
| Backend account system | Not needed for static-site curriculum coherence. |
| Deleting legacy routes in this milestone | Compatibility must survive until redirects are tested and shipped. |
| Deleting v1 progress stores | User progress retention and rollback are higher priority. |
| Bulk course rewrite | Too high risk; adapters and pilots must prove the contract first. |

## Traceability

| Requirement | Phase | Status |
| --- | --- | --- |
| CURR-01 | Phase 1 | Pending |
| CURR-02 | Phase 1 | Pending |
| CURR-03 | Phase 1 | Pending |
| CURR-04 | Phase 1 | Pending |
| CURR-05 | Phase 1 | Pending |
| ROUTE-01 | Phase 2 | Pending |
| ROUTE-02 | Phase 2 | Pending |
| ROUTE-03 | Phase 2 | Pending |
| ROUTE-04 | Phase 2 | Pending |
| PROG-01 | Phase 3 | Pending |
| PROG-02 | Phase 3 | Pending |
| PROG-03 | Phase 3 | Pending |
| PROG-04 | Phase 3 | Pending |
| HOME-01 | Phase 4 | Pending |
| HOME-02 | Phase 4 | Pending |
| HOME-03 | Phase 4 | Pending |
| HOME-04 | Phase 4 | Pending |
| LESSON-01 | Phase 5 | Pending |
| LESSON-02 | Phase 5 | Pending |
| LESSON-03 | Phase 5 | Pending |
| LAB-01 | Phase 6 | Pending |
| LAB-02 | Phase 6 | Pending |
| VAL-01 | Phases 1-7 | Pending |
| VAL-02 | Phases 1-7 | Pending |
| VAL-03 | Phases 1-7 | Pending |
| VAL-04 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0

---
*Requirements defined: 2026-06-25*
*Last updated: 2026-06-25 after initial Curriculum V2 planning*
