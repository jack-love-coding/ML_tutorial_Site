# Numerical Methods Batch 2 Contract

**Status:** Completed on 2026-07-20

**Modules:** `sparse-matrices`, `pca`

**Route:** `numerical-deepening-path`

## Teaching boundary

This batch contains two adjacent but distinct data cases.

1. `sparse-matrices` uses the UCI SMS Spam Collection to explain a deterministic token-to-column contract, TF-IDF, COO/CSR storage, real memory cost, and CSR matrix-vector multiplication. It does not train or evaluate a spam classifier.
2. `pca` reuses the reviewed Ames numeric snapshot to explain standardization, the SVD route to PCA, explained variance, loadings, projection, and reconstruction. Sale price does not determine the PCA directions.

The route must explicitly state that ordinary centered PCA is not a direct follow-up operator for a sparse text matrix: centering can destroy sparsity, and sparse text commonly uses an uncentered truncated SVD instead.

## Locked artifacts

### Sparse text case

- Dataset: `public/datasets/numerical-methods/sms-spam.csv`
- Dataset contract: 5,574 rows, 4,827 ham, 747 spam, source order and duplicates retained
- Source: UCI dataset 228, DOI `10.24432/C5CC84`, CC BY 4.0
- Token contract: lowercase, `[a-z0-9']+`, minimum document frequency 5
- Matrix: shape `[5574, 1881]`, `nnz=69798`, density `0.665713%`
- Storage: dense float64 `83,877,552` bytes, CSR `859,876` bytes, ratio `97.5461x`
- Notebook: `sparse-matrices-sms.zh-CN.ipynb`
- Output: `batch-2-outputs/sms-sparse-summary.json`

### Ames PCA case

- Dataset: `public/datasets/numerical-methods/ames-housing-numeric.csv`
- Feature matrix: 2,927 rows and eight standardized numeric features
- First four explained ratios: `0.51807587`, `0.19923612`, `0.12135149`, `0.08284263`
- Two components: `71.7312%`, standardized reconstruction RMSE `0.531684`
- Four components: `92.1506%`, standardized reconstruction RMSE `0.280168`
- Notebook: `pca-ames.zh-CN.ipynb`
- Output: `batch-2-outputs/ames-pca-summary.json`

## Learner-facing structure

Each module must provide:

- detailed Chinese and English teaching copy;
- exactly one primary interactive lab already owned by the module;
- one chapter-specific Manim video with poster and bilingual transcript/summary;
- one shared illustration that distinguishes sparse storage from PCA reconstruction;
- one downloadable executed Notebook, its local dataset, pinned requirements, and locked page output;
- a direct bridge to the next route chapter;
- existing URL, checkpoint, route query, and Progress behavior unchanged.

Learner-facing Chinese copy must not use `证据` as a generic UI label.

## Acceptance

- `numericalDeepeningModuleIds` and the five-phase Math Lab overview use the same exact chapter order.
- Both dataset hashes and all generated Notebook/output hashes are locked in manifests.
- Both downloaded Notebooks rerun with only their sibling CSV and pinned requirements.
- Sparse storage counts include value and index arrays; no index cost is hidden.
- PCA distinguishes explained variance, standardized reconstruction error, and prediction error.
- PCA direction sign ambiguity and train-only preprocessing behavior are stated.
- Public assets resolve through the existing base-safe path utilities.
- `npm test`, `npm run build`, `npm run build:pages`, generator checks, Manim checks, and desktop/390px browser checks pass.
