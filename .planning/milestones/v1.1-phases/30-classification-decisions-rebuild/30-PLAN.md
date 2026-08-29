---
phase: 30-classification-decisions-rebuild
plan: "01"
type: execute
wave: 1
depends_on: [29-logistic-regression-rebuild]
requirements: [CLAS-01, CLAS-02, CLAS-03, CLAS-04, CLAS-05, CLAS-06]
status: complete
completed: 2026-08-29
---

# Phase 30: Classification Decisions Rebuild Plan

## Objective

Turn the frozen Phase 29 Banknote probabilities into a bilingual, reproducible decision lesson. Learners must be able to trace score → probability → threshold → predicted class → actual label, calculate held-out metrics, select a validation-only operating threshold from explicit costs, and inspect errors without leaking test information into model selection.

## Scope and boundaries

- Reuse the hash-bound Phase 29 prediction handoff; do not retrain or replace the logistic model.
- Publish validation rows and validation-derived summaries only. Reveal the locked test set once as an aggregate summary after threshold selection; never publish row-level test records or use test results to reselect the threshold.
- Keep ROC/AUC as a ranking diagnostic, not a threshold selector.
- Use Banknote feature slices only as pedagogical stability checks. They are not demographic groups and do not constitute a fairness audit.
- Preserve the existing `classification` module identity, routes, checkpoint/progress behavior, and multiclass/softmax supporting content.
- Keep all assets local, hash-bound, abortable, GitHub Pages-safe, and available through bilingual executed Notebooks.

## Tasks

1. Build a finite-guarded TypeScript decision engine for confusion counts, precision/recall/F1, threshold sweeps, cost-aware selection, ROC curves, and AUC.
2. Build a deterministic Python authority from the Phase 29 handoff and publish a hash-bound local package containing validation predictions, 99 threshold points, ROC, fold variation, the selected cost policy, aggregate locked-test results, feature slices, named validation errors, and two executed Notebooks.
3. Add a strict WebCrypto loader that validates manifest shape, hashes, schemas, aborts, and Pages base paths before returning the complete study package.
4. Rebuild the classification lesson around fixed evidence, an exact decision-chain table, threshold interaction, confusion/metric views, ROC policy, cost selection, fold variation, locked-test summary, feature slices, named errors, and localized fallback.
5. Retain the synthetic simulation only as a failure fallback and keep multiclass/softmax available as supporting material.
6. Add numerical, asset, disclosure, curriculum, and real-browser release gates; update the AI Foundations unit 09 canonical resource description without publishing incomplete B-stage links.

## Acceptance contract

- Validation cost policy is fixed at false-positive cost 1 and false-negative cost 5.
- The selected validation threshold is `0.09`; validation confusion is TP 90, FP 2, TN 113, FN 1, total cost 7.
- Five row-ID-modulo folds report selected thresholds `0.5, 0.5, 0.09, 0.5, 0.01`, making the observed variation `0.01–0.5` explicit.
- The selected threshold is applied once to the locked test set, producing aggregate TP 91, FP 4, TN 110, FN 1, total cost 9. No default-threshold test comparison is published.
- TypeScript and executed Notebook outputs agree on threshold sweep, selected threshold, confusion metrics, ROC, and AUC.
- Chinese and English render at 1440px, 768px, and 390px with no horizontal overflow; reduced motion, keyboard interaction, GitHub Pages base paths, and asset-failure fallback work.
- `npm test`, `npm run build`, `npm run build:pages`, `npm run test:phase30:browser`, and `npm run security:audit` pass.
