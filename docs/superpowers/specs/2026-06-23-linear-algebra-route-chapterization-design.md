# Linear Algebra Route Chapterization Design

Date: 2026-06-23
Branch: `codex/linear-algebra-route-chapterization`
Status: Draft for user review

## Goal

Split the current linear algebra material into a clear teaching route instead of keeping vectors, matrices, rank, SVD, and PCA inside one dense chapter. The route should continue the line already built for vectors, distance, matrix transforms, column space, rank, and null space, then extend naturally into eigenvalues, SVD, PCA, and a final applied project.

The central teaching rule is: do not append a shallow "where AI uses this" note at the end of each chapter. Each chapter should be driven by a concrete real-world or AI case study. The case should create the need for the mathematics, carry the examples, and return in the final analysis.

## Target Learner Experience

Learners should feel that every mathematical object appears because a practical question forced it to appear:

- A vector appears because we need a stable way to represent a learner, product, user, sentence, or image.
- A distance or similarity score appears because we need to rank nearby items or semantically similar texts.
- A matrix appears because we need to remix features into new representations.
- Rank and null space appear because models have expressive limits and blind spots.
- Eigenvectors appear because repeated transformations leave some directions stable.
- SVD appears because large matrices often contain simpler low-rank structure.
- PCA appears because high-dimensional data needs interpretable projection, compression, and diagnosis.

The route should make formulas, diagrams, experiments, and case analysis point to the same variables and the same story.

## Proposed Route

### Chapter 1: Vectors and Feature Space

Core question: How can real objects become coordinates in one shared space?

Main case studies:

- Learner records: `[practice_count, mistake_count, score, review_gap]`
- User and product profiles in recommendation
- Sentence embeddings as high-dimensional coordinates

Teaching arc:

1. Start with an ordinary object such as a learner record or product.
2. Show why isolated numbers are not enough; they need to describe one object in one coordinate system.
3. Introduce vectors as ordered coordinates and arrows.
4. Explain vector difference as a change direction between two objects.
5. Use 2D and 3D diagrams only as visible shadows of higher-dimensional spaces.

Expected interactive lab:

- Reuse and refine the feature vector story lab.
- Let learners choose object types, adjust feature values, and see the point or arrow move.
- Show the difference vector between two records with a sentence-level explanation.

Expected assessment:

- Identify why a row of features is one vector, not unrelated cells.
- Explain what a difference vector means in a concrete case.

### Chapter 2: Distance, Norm, Dot Product, and Similarity

Core question: Why are "nearby" and "similar" not always the same?

Main case study:

- Semantic search: a user searches "how to sleep better"; the system compares the query embedding to article embeddings.

Teaching arc:

1. Begin with search ranking rather than formulas.
2. Show two possible ranking questions: which article is closest in position, and which points in the most similar semantic direction?
3. Introduce Euclidean norm as a ruler for a vector.
4. Introduce Euclidean distance as the norm of a difference vector.
5. Introduce dot product as length plus angle.
6. Introduce cosine similarity as direction after length is divided away.
7. Analyze why long documents, high-frequency terms, or scale differences can change distance without changing semantic direction.

Expected interactive lab:

- Expand the vector similarity lab around search candidates.
- Let learners modify query/article vectors, weights, and normalization.
- Show ranking changes under Euclidean distance and cosine similarity side by side.

Expected assessment:

- Explain a case where cosine similarity is high but Euclidean distance is not small.
- Explain why feature scaling or dimension weights change a practical ranking.

### Chapter 3: Matrices and Linear Transformations

Core question: How do features get remixed into new representations?

Main case studies:

- A neural-network linear layer transforming raw features into hidden features.
- A housing or learner-state model that mixes input columns into intermediate concepts such as "space value," "maintenance risk," or "study momentum."

Teaching arc:

1. Start from a realistic table of input features.
2. Ask how a model can create new features from old ones.
3. Introduce a matrix as a feature mixer and space transformer.
4. Explain matrix-vector multiplication by rows and by columns.
5. Emphasize the column view: `Ax = x1 a1 + x2 a2 + ...`.
6. Show how changing columns moves basis directions and transforms the grid.
7. Separate linear transformation from affine layer `Wx + b`.

Expected interactive lab:

- Reuse matrix transform lab and column-combination visualization.
- Let learners move matrix columns, inspect determinant, and read the output as a column combination.

Expected assessment:

- Given a small matrix and vector, explain the output as a weighted mixture of columns.
- Identify why adding bias makes a layer affine rather than purely linear.

### Chapter 4: Column Space, Rank, and Null Space

Core question: What can a model express, and what changes can it not see?

Main case studies:

- Recommendation-system blind spots when behavior features repeat the same preference signal.
- Duplicate or correlated features in tabular ML.
- Inputs that change but produce the same model output.

Teaching arc:

1. Begin with a model receiving many features that are partly redundant.
2. Show that adding more columns does not always add new independent directions.
3. Introduce column space as all outputs the matrix can reach.
4. Introduce rank as the number of effective independent output directions.
5. Introduce null space as input directions erased by the matrix.
6. Connect rank deficiency to compression, ambiguity, and blind spots.

Expected interactive lab:

- Reuse and refine the matrix column-space lab.
- Include cases for full rank, rank 1 collapse, and null-space directions.
- Let learners toggle correlated features and observe reachable outputs.

Expected assessment:

- Distinguish rank from nonzero-entry count.
- Explain what it means when two different inputs produce the same output.

### Chapter 5: Eigenvalues and Stable Directions

Core question: Which directions remain stable after repeated transformation?

Main case studies:

- PageRank and link networks.
- Long-run behavior of simple state transitions.
- Repeated influence propagation in a recommendation or graph setting.

Teaching arc:

1. Start from a network where importance moves through links.
2. Show repeated matrix multiplication as repeated redistribution.
3. Introduce eigenvectors as directions that keep their line after transformation.
4. Introduce eigenvalues as scale factors along those directions.
5. Use power iteration to show why one dominant direction can emerge.
6. Relate this to Markov chains and PageRank without duplicating the full Markov chapter.

Expected interactive lab:

- Reuse the existing power iteration lab.
- Add route-specific framing around network influence and stable direction.

Expected assessment:

- Explain why an eigenvector does not need to keep the same coordinates after transformation, only the same line.
- Explain when power iteration converges quickly or slowly.

### Chapter 6: SVD and Low-Rank Structure

Core question: What is the most important structure inside an arbitrary matrix?

Main case studies:

- Image compression from a grayscale image matrix.
- User-item recommendation matrix with hidden preference directions.
- Noise filtering by keeping large singular values and discarding small ones.

Teaching arc:

1. Start from a large matrix that feels too detailed to inspect directly.
2. Show that some matrices have a few strong patterns plus many small details.
3. Introduce SVD as `A = U Sigma V^T`.
4. Explain right singular vectors as input-side directions, left singular vectors as output-side directions, and singular values as strengths.
5. Show rank-k approximation as keeping the strongest directions.
6. Discuss the ambiguity of small singular values: sometimes fine detail, sometimes noise.
7. Connect to pseudoinverse and condition number only after the low-rank story is visible.

Expected interactive lab:

- Reuse SVD low-rank approximation lab.
- Add an image-compression mode if feasible.
- Let learners keep `k` singular values and see reconstruction quality, retained energy, and error.

Expected assessment:

- Explain why SVD works for rectangular matrices.
- Explain why the best rank-k approximation is useful but can lose meaningful detail.

### Chapter 7: PCA and High-Dimensional Visualization

Core question: How can high-dimensional data be projected into fewer meaningful directions?

Main case studies:

- Embedding visualization for text clusters.
- Feature compression and denoising.
- Detecting outliers, batch effects, or dataset drift.

Teaching arc:

1. Start with high-dimensional points that cannot be directly plotted.
2. Show why projecting onto arbitrary axes can hide structure.
3. Introduce centering as moving the data cloud to its own mean.
4. Introduce variance direction and covariance.
5. Connect PCA to SVD of the centered matrix.
6. Show explained variance and the cost of discarding directions.
7. Warn that PCA is unsupervised: maximum variance may not be the best classification direction.

Expected interactive lab:

- Reuse PCA projection lab.
- Add an embedding-style scenario with clusters, outliers, and optional labels.
- Let learners toggle centering, scaling, number of components, and label overlay.

Expected assessment:

- Explain why centering is required.
- Explain why PCA does not guarantee class separation.
- Interpret explained variance in a realistic projection report.

### Chapter 8: Integrated Project - Mini Semantic Search System

Core question: How do the previous ideas work together in one AI workflow?

Main case study:

- A mini semantic search system that embeds short documents, retrieves similar results, compresses or visualizes embeddings, and analyzes failure cases.

Teaching arc:

1. Convert short text items into vectors.
2. Compare query and document vectors with cosine similarity and distance.
3. Store document embeddings as a matrix.
4. Analyze rank or low-rank structure in the embedding matrix.
5. Use SVD or PCA to compress and visualize the document space.
6. Inspect why some retrieval results are good and why some fail.
7. Ask learners to produce a short model report rather than only answer formula questions.

Expected interactive lab:

- A route-level capstone workbench.
- Include fixed local example embeddings, not runtime calls to external APIs.
- Provide a small document set with transparent labels and precomputed vectors.

Expected assessment:

- Explain the full path from text to vector, vector to ranking, matrix to compression, and projection to visualization.
- Identify one real failure mode and connect it to distance, rank, SVD, or PCA.

## Content Restructuring

The existing `vectors-matrices-norms` module should stop carrying the whole linear algebra story alone. It can become two smaller modules:

1. `linear-algebra-vectors-similarity`
2. `linear-algebra-matrices-rank`

Existing SVD and PCA modules should become later chapters in the same route rather than isolated topics. The route should preserve the existing typed `MathLabModule` schema and avoid ad hoc content objects.

The existing beginner linear algebra module can remain as the zero-base entry point, but it should link into this formal route more explicitly:

- beginner chapter: intuition and first exposure
- formal route: detailed case studies, formulas, labs, and assessment

## Visual and Media Strategy

Use visuals only where they teach a relationship:

- Feature cards to vector coordinates
- Query/document vectors and ranking changes
- Matrix columns mixing into output
- Rank collapse and null-space erasure
- PageRank stable direction
- Singular values as descending strengths
- PCA projection before and after centering/scaling

Manim scenes should be short and focused on motion:

- Ruler moves from norm to distance
- Cosine changes as angle changes
- Matrix columns combine into output
- Rank-2 plane collapses into rank-1 line
- Power iteration converges to a dominant direction
- Singular-value truncation reconstructs an image
- PCA rotates axes and projects points

Generated images should avoid heavy text and should not replace the interactive labs. They are anchors for a case study, not the full explanation.

## Interaction Strategy

Each chapter should have one primary lab. Avoid multiple small widgets that fragment attention. A good lab should expose:

- a clear task prompt
- a small set of meaningful controls
- current numeric values
- visual feedback
- reset state
- keyboard-accessible controls
- bilingual success criteria

Labs should reuse existing utility functions where possible. If new math is needed, add it to `src/modules/math-lab/utils/` or adjacent tested utilities, not inside Vue templates.

## Testing and Acceptance

Minimum acceptance for the restructuring:

- The linear algebra route has separate chapters or modules in the intended order.
- Each chapter includes bilingual copy, concepts, visuals or videos, one lab or strong fallback, quizzes, misconceptions, and source references.
- The beginner entry still works and links naturally into the formal route.
- Existing SVD and PCA tests remain passing.
- New route or module registration is covered by layout tests.
- Any new math helpers for SVD/PCA/case studies have unit tests.
- Public assets use `/` public paths and remain compatible with GitHub Pages base handling.
- `npm test` passes.
- `npm run build` passes or any warnings are documented.

## Implementation Boundary Decisions

The implementation plan should use these decisions instead of reopening the scope:

1. Represent the route as separate `MathLabModule`s for clearer navigation, testing, and lazy loading.
2. Treat chapters 1-7 as the first implementation scope.
3. Save the chapter 8 capstone mini semantic search workbench for a second pass after the route split is stable.
4. Add only the minimum new SVD/PCA Manim scenes needed for continuity in the first pass; expand media after the content and route structure are stable.

## Suggested Implementation Phases

Phase 1 should split and register the route structure without changing the existing learning behavior more than necessary.

- Create the route/module ordering for chapters 1-7.
- Move or wrap existing vector, matrix, eigenvalue, SVD, and PCA content into the new route boundaries.
- Keep existing labs functional and reuse them before adding new controls.
- Add layout tests for route order, bilingual content, and asset presence.

Phase 2 should deepen the case studies.

- Expand each chapter's opening case and final case analysis.
- Add or revise static visuals where the case needs a visual anchor.
- Improve quiz feedback so it points back to the relevant case and lab.

Phase 3 should add richer media and the capstone.

- Add SVD/PCA Manim scenes beyond the minimum continuity scenes.
- Build the mini semantic search workbench with local fixed embeddings.
- Add capstone assessment and model-report style feedback.

## Non-Goals

- Do not call external embedding APIs at runtime.
- Do not introduce a new UI framework.
- Do not rewrite unrelated math modules.
- Do not turn each chapter into a long static article without interaction.
- Do not remove existing tests or generated assets unless they are replaced deliberately.
