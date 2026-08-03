# California Housing project sources

## Dataset identity

The Phase 28 project uses the complete California Housing data distributed from the Carnegie Mellon StatLib repository. The original archive is pinned as:

- URL: `https://lib.stat.cmu.edu/datasets/houses.zip`
- SHA-256: `8b18f0a01cf9c99a65174d18fa582aa31971dfe55a26ad794f3299937c3708d7`
- Retrieved: 2026-08-04
- Source file: `cadata.txt`

The data were assembled from 1990 U.S. Census block groups and described by R. Kelley Pace and Ronald Barry in “Sparse Spatial Autoregressions,” *Statistics and Probability Letters* 33 (1997), 291–297.

Each row represents a census block group, not an individual house. The target is the median block-group house value. The published project CSV applies the same ratio and target scaling transformations documented by scikit-learn's `fetch_california_housing` loader.

## License scope

The scikit-learn loader source is distributed under BSD-3-Clause. This software license is not asserted as the license of the dataset itself. The project manifest records the Census/StatLib provenance, paper attribution, source archive hash, and the exact local transformation separately.

## Course use

The teaching text is original to ML Atlas. Public references appear only in the final project chapter. The local CSV, executed Notebooks, figures, residual tables, and interaction payloads are published together so readers can reproduce every displayed numerical result without runtime network access.
