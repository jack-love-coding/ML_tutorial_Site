# Numerical Methods Batch 2 Completion

**Completed:** 2026-07-20

**Branch:** `codex/numerical-methods-batch-2`

**Scope:** `sparse-matrices` and `pca`

## Delivered

- Rebuilt both existing Math Lab lessons as detailed bilingual teaching flows without changing their URLs, checkpoint behavior, or Progress storage.
- Added a verified local snapshot of the UCI SMS Spam Collection, its source/manifest/data dictionary, and a deterministic TF-IDF/CSR Notebook that reruns beside the downloaded CSV.
- Added a standalone Ames PCA Notebook using the same fixed 2,927-row numeric snapshot as the earlier numerical-methods lessons.
- Put the exact Notebook outputs on each teaching page and aligned variable names across formulas, code, prose, labs, and videos.
- Upgraded `SparseMatrixLab` with the real SMS preset plus CSR/COO inspection; kept its synthetic density controls as a comparison mode.
- Clarified that `PcaProjectionLab` is a 2D geometric schematic while the fixed Ames computation is eight-dimensional.
- Added one shared generated illustration and two local 1080p/30fps Manim videos with posters, transcripts, English summaries, labels, prompts, and hash metadata.
- Reconciled the Numerical Methods route order and regenerated catalog documentation.

## Locked Results

### UCI SMS TF-IDF / CSR

- Shape: `5574×1881`
- Nonzeros: `69798`
- Density: `0.66571%`
- Dense `float64`: `79.992 MiB`
- CSR arrays: `0.820 MiB`
- Dense/CSR ratio: `97.55x`
- Row 17 window: `[283,299)`, 16 entries, manual/SciPy difference `0`

### Ames PCA

- Shape: `2927×8`
- First two components: `71.7312%` cumulative explained variance
- First four components: `92.1506%`
- Components needed for at least 90%: `4`
- Two-component standardized reconstruction RMSE: `0.531684`
- Four-component standardized reconstruction RMSE: `0.280168`
- Maximum SVD/covariance-spectrum difference: `1.332e-15`

## Validation

- Standalone Notebook generation and rerun checks: pass; repository copies are byte-identical to regenerated output.
- Batch 2 Manim metadata and media checks: pass.
- Existing Batch 1 Manim metadata check after reconciling stale tracked hashes: pass.
- `npm test`: pass, 708 tests, 0 failures.
- `npm run build`: pass with the existing large-chunk warning.
- `npm run build:pages`: pass with the existing large-chunk warning.
- `npm run security:audit`: pass, 0 vulnerabilities.
- Playwright desktop and 390×844 checks: Chinese sparse-matrix and English PCA content, downloads, fixed outputs, code-copy feedback, labs, illustrations, and videos load correctly; zero console errors and no horizontal overflow.

## Preserved Boundaries

- No new route, backend, browser Python runtime, progress store, scoring gate, or course inventory.
- No classifier is trained in the sparse-matrix lesson; the SMS labels describe corpus composition only.
- PCA remains an unlabeled reconstruction method; downstream task quality is not inferred from explained variance.
- Phase 24B Homepage Focus and Phase 24C Spine progressive disclosure remain paused.
