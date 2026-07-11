# Linear Algebra Route Sources

This source note documents the case-driven linear algebra route split introduced after the vector, matrix, rank, and null-space expansion.

## Reused Local Assets

- `public/math-lab/generated/linear-algebra-feature-cards.png`
- `public/math-lab/generated/vector-distance-norm-intuition.png`
- `public/math-lab/generated/cosine-vs-distance-intuition.png`
- `public/math-lab/generated/high-dimensional-embedding-search.png`
- `public/math-lab/generated/matrix-column-combination.png`
- `public/math-lab/generated/column-space-rank-intuition.png`
- `public/math-lab/generated/null-space-invisible-direction.png`

## Existing Manim Videos

- `public/manim/math-lab/vector-distance-norm.mp4`
- `public/manim/math-lab/cosine-similarity-angle.mp4`
- `public/manim/math-lab/matrix-column-combination.mp4`
- `public/manim/math-lab/matrix-transform.mp4`
- `public/manim/math-lab/rank-flattening.mp4`
- `public/manim/math-lab/null-space-collapse.mp4`

## External References

- 3Blue1Brown, Essence of Linear Algebra: visual organization for vectors, matrix transformations, rank, and null space.
- Dive into Deep Learning, Linear Algebra: machine-learning notation and vector, matrix, norm framing.
- Mathematics for Machine Learning: vector spaces, matrix decompositions, and machine-learning connections.

## Mathematics-to-Code Promotions

- `linear-algebra-feature-space` now follows the approved vector manuscript: `x`, `w`, `b`, `y_hat`, `y`, and `L` stay aligned with the pilot prediction task; `w` remains a unit-bearing linear functional; and Euclidean length, angle, and projection appear only in a separate dimensionless, same-scale `u`/`v` example. `FeatureVectorStoryLab` is not mounted because its learner-record distance/cosine controls do not match this contract.
- `linear-algebra-matrix-transformations` now expands `Xw+b`, every intermediate shape, batch MSE, row/target alignment, broadcasting failures, and loop/vectorized agreement. `MatrixTransformLab` remains mounted only for the explicitly separate dimensionless grid-transform example, where its basis-vector variables and success criteria match the manuscript.
- Both promoted lessons are local formative teaching surfaces. This change adds no new progress or evidence persistence.

## Media Workflow Notes

The generated images above are reused local project assets under `public/math-lab/generated/`; runtime module references use public paths.

The videos above were rendered through `scripts/manim/render_math_lab.py` and registered in `public/manim/math-lab/metadata.json`.

Future project-bound teaching images should use the built-in image generation workflow, then be copied into `public/math-lab/generated/`. Future math videos should follow the Math-To-Manim workflow, then be registered in the Manim render script and metadata file.
