---
phase: 30-classification-decisions-rebuild
verified: 2026-08-29T18:32:23+08:00
status: passed
score: 6/6 requirements verified
behavior_unverified: 0
---

# Phase 30: Classification Decisions Rebuild Verification

**Phase goal:** Rebuild `classification` around held-out probability scores so learners can calculate metrics, interpret ranking, select a cost-aware threshold, and inspect subgroup and example-level errors.

**Result:** Passed. The implementation is reproducible from the frozen Phase 29 handoff, keeps validation selection separate from the one-time locked test evaluation, and preserves the existing route and supporting multiclass material.

## Requirement evidence

| Requirement | Status | Evidence |
| --- | --- | --- |
| CLAS-01 | ✓ VERIFIED | `ClassificationLessonLab.vue` renders an exact six-column chain for stable row ID, model score, probability, current threshold, predicted class, and actual label. The browser matrix verifies all columns in both locales and three viewport widths. |
| CLAS-02 | ✓ VERIFIED | `engine.ts` computes confusion counts, precision, recall, and F1 from the fixed validation records. TypeScript tests reproduce every published threshold-sweep value and the selected-threshold matrix. |
| CLAS-03 | ✓ VERIFIED | Lesson copy, checkpoint feedback, and browser assertions state that ROC/AUC measures ranking across thresholds and does not select the operating threshold. ROC/AUC remains unchanged when the displayed operating threshold changes. |
| CLAS-04 | ✓ VERIFIED | The published policy assigns FP cost 1 and FN cost 5, selects threshold 0.09 on validation only, reports five-fold threshold variation 0.01–0.5, and then applies the frozen choice once to the locked test aggregate. |
| CLAS-05 | ✓ VERIFIED | The lesson shows Banknote feature slices and stable named validation errors. It explicitly states that feature slices are not demographic attributes and are not a fairness audit; no row-level test sample is disclosed. |
| CLAS-06 | ✓ VERIFIED | Existing multiclass and softmax chapter content remains registered and accessible as supporting material; fixed binary held-out evidence is the primary workflow. |

## Numerical and disclosure checks

- Validation selection: threshold `0.09`; TP 90, FP 2, TN 113, FN 1; cost 7.
- Fold variation: `0.5, 0.5, 0.09, 0.5, 0.01`; reported range `0.01–0.5`.
- Locked test, evaluated once: TP 91, FP 4, TN 110, FN 1; cost 9.
- Published learner records contain 206 validation rows and no train or row-level test records.
- The locked test panel is invariant under learner threshold interaction and cannot trigger threshold reselection.
- The Python builder validates the Phase 29 source and handoff hashes before producing the package. The TypeScript loader recomputes every published SHA-256 value before use.
- Two consecutive clean builder runs produced identical hashes for the manifest, all five JSON outputs, and both executed Notebooks after stable cell IDs were fixed.

## Release gates

| Gate | Result |
| --- | --- |
| `npm test` | PASS — 1,140 tests; 1,112 passed, 28 existing skips, 0 failures |
| `npm run build` | PASS — production build; existing large-chunk advisory only |
| `npm run build:pages` | PASS — GitHub Pages build; existing large-chunk advisory only |
| `npm run test:phase30:browser` | PASS — 6 locale/viewport cases, interaction and HTTP fallback, 0 failures |
| `npm run security:audit` | PASS — 0 vulnerabilities |

## Browser evidence

- Chinese and English at 1440px, 768px, and 390px all returned 200 and had no horizontal overflow.
- Normal cases had no console errors; reduced-motion was active and every Notebook link used the `/ML_tutorial_Site/` base.
- Keyboard threshold adjustment changed validation confusion evidence while the locked-test summary remained byte-for-byte unchanged.
- Forced manifest HTTP failure rendered the localized fixed-data fallback.
- No learner-visible test row/sample identifiers were found.

## Compatibility and scope

- Existing `/learn/classification` deep links and module IDs remain unchanged.
- Existing progress stores and checkpoint identities remain intact.
- Unit 09 of AI Foundations references the canonical logistic/classification resources; B-stage units remain planned and do not create incomplete course links.
- The root MLP worktree's `.planning/config.json` and `docs/gpt_advice.md` were not touched.

No Phase 30-owned implementation or acceptance gap remains. Production deployment would still require calibration-drift monitoring and protected-attribute fairness evidence beyond these pedagogical feature slices; that future concern is recorded in the V3 audit and is not part of this teaching-phase acceptance contract.

## Freshness revalidation — 2026-08-29

The milestone closeout added only Phase 30 summary and validation provenance after
the original verification report; no Phase 30 implementation, test, asset, or
runtime contract changed. The Pages build and the complete Phase 30 browser matrix
were rerun from `cacf301`: all six bilingual responsive cases, keyboard threshold
interaction, locked-test invariance, and the localized asset-failure fallback
passed. This refresh supersedes the planning-only freshness warning.
