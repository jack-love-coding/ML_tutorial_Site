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

## Media Workflow Notes

The generated images above are reused local project assets under `public/math-lab/generated/`; runtime module references use public paths.

The videos above were rendered through `scripts/manim/render_math_lab.py` and registered in `public/manim/math-lab/metadata.json`.

Future project-bound teaching images should use the built-in image generation workflow, then be copied into `public/math-lab/generated/`. Future math videos should follow the Math-To-Manim workflow, then be registered in the Manim render script and metadata file.
