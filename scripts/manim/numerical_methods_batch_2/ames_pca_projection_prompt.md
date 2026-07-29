# Manim Animation: Ames standardization, PCA, and reconstruction

## Production identity

This document is the NarrativeComposer handoff consumed by the CodeGenerator after the full six-role Math-To-Manim pipeline: ConceptAnalyzer → PrerequisiteExplorer → MathematicalEnricher → VisualDesigner → NarrativeComposer → CodeGenerator. The dependency graph is stored in `ames_pca_projection_tree.json`. The final artifact is a silent, Simplified-Chinese scientific teaching animation grounded in the executed `pca-ames.zh-CN.ipynb` Notebook and the same local Ames housing snapshot used by the earlier numerical-method lessons.

The learning objective is narrow and complete: after 80 seconds, a learner should be able to explain why the eight features must be standardized, how covariance eigenvectors define rotated principal axes, how the SVD and covariance routes agree, why the 90% rule selects `k = 4`, and how reconstruction RMSE describes information loss. The lesson must also state that PCA is unsupervised: it does not inspect sale price and does not promise better price prediction.

**Exact duration:** 80 seconds.

**Delivery:** 1920×1080, 30 fps, H.264 MP4, one silent video stream, no audio stream.

**Locale inside the video:** `zh-CN`. English is reserved for the external summary and the bilingual label inventory. Standard identifiers such as `PCA`, `PC1`, `PC2`, `SVD`, `RMSE`, `ddof`, and matrix letters remain in their conventional forms.

## ConceptAnalyzer output

The main conceptual obstacle is that PCA is often described as “reducing dimensions” before the learner understands what is preserved. The animation must first establish variance as spread after standardization, then show that changing basis can concentrate spread into the first few coordinates. Only after that should it discuss choosing `k`. The principal components are directions, represented by columns of `V`; projected scores are coordinates `T = ZV`. Those two objects must not be called by the same name on screen.

The second obstacle is scale. Ames area columns are measured in square feet, quality is an ordinal score, garage cars is a count, and house age is measured in years. Without standardization, a high-variance unit could dominate the covariance matrix for numerical reasons unrelated to the intended comparison. The production contract uses column means and population standard deviations, `ddof = 0`. This choice must be stated because changing it can alter exact outputs slightly.

The third obstacle is interpreting explained variance as predictive importance. The animation explicitly withholds the sale-price target. A direction can explain large variation in the eight input features without being the most useful direction for predicting a separate target. The last scene must therefore state the boundary in plain Chinese. Do not show price, regression coefficients, feature importance, accuracy, or a target arrow.

The fourth obstacle is treating a two-dimensional scatter plot as the actual dataset. The visual point cloud is only a schematic for rotated axes. The authoritative calculation uses a `2927 × 8` standardized matrix. A permanent note in the rotation segment says `二维点云仅解释方向；真实计算使用 8 维数据`.

## PrerequisiteExplorer output

The minimum foundations are mean and standard deviation, variance and covariance, orthogonal unit vectors, matrix multiplication, projection, eigenvectors, and the idea of reconstruction. The dependency tree places scaling before covariance, then connects covariance eigenvectors and the SVD route, and finally introduces cumulative explained variance and reconstruction. The learner does not need a proof of the spectral theorem, iterative eigensolvers, randomized SVD, whitening, kernel PCA, or supervised dimensionality reduction. Do not branch into those topics.

Notation must remain consistent. `X` is the raw eight-column numeric table. `Z` is its standardized version. `n = 2927`, `d = 8`, and `Z ∈ R^(2927×8)`. The population covariance-style matrix is `C = ZᵀZ / n`. Its eigenpairs satisfy `Cv_j = λ_jv_j`, with eigenvalues sorted descending. `V_k` contains the first `k` direction vectors. Scores are `T_k = ZV_k`. Reconstruction in standardized feature space is `Z_hat_k = T_kV_kᵀ`.

## MathematicalEnricher output

The eight features are `overall_quality`, `first_floor_sqft`, `second_floor_sqft`, `living_area_sqft`, `basement_sqft`, `garage_cars`, `garage_area_sqft`, and `house_age_at_sale`. They form 2,927 complete numeric rows in the local snapshot. Each column uses `z_ij = (x_ij − μ_j) / σ_j`, where `σ_j` is the population standard deviation. The resulting column means are numerically near zero and column population standard deviations are one.

The covariance route constructs `C = ZᵀZ/n` and computes a symmetric eigendecomposition. The SVD route computes `Z = UΣVᵀ`. Both yield the same right-side directions, and their spectrum satisfies `λ_j = σ_j²/n`. In the executed Notebook the maximum absolute difference between the two explained-variance-ratio vectors is `1.332 × 10⁻¹⁵`, a numerical-agreement check rather than a new statistical metric.

The first four explained-variance ratios are `0.518075870456838`, `0.19923611508890943`, `0.12135149015146957`, and `0.08284263453370773`. On screen they are rounded to `51.81%`, `19.92%`, `12.14%`, and `8.28%`. The first two accumulate to `0.7173119855457475`, displayed as `71.73%`. The first four accumulate to `0.9215061102309249`, displayed as `92.15%`. The first cumulative value at or above 90% occurs at `k = 4`, written `k₉₀ = 4`. Never claim that four dimensions contain exactly 90%; they contain approximately 92.15% under this contract.

Reconstruction uses `T_k = ZV_k` and `Z_hat_k = T_kV_kᵀ`. The reported RMSE spans all standardized matrix elements. At `k = 2` it is `0.531684130338919`, displayed as `0.531684`. At `k = 4` it is `0.2801676101355673`, displayed as `0.280168`. Units are standardized-feature units, not square feet, years, dollars, or a prediction error. The drop shows that retaining more orthogonal directions reconstructs the standardized inputs more closely.

Principal-axis sign is arbitrary: multiplying a direction and its scores by `−1` produces the same subspace and reconstruction. The animation need not teach sign ambiguity, but it must avoid assigning semantic “positive” and “negative” meanings to the drawn arrow directions. The point-cloud orientation is a visual aid, not a claim about exact feature loadings.

## VisualDesigner output

Use the same ML Atlas visual system as the prior numerical videos: background `#F7F3EA`, paper `#FFFEF8`, navy `#102A43`, data blue `#2F6FED`, teal `#1F8A85`, orange `#F2994A`, and gray `#8FA3B8`. Chinese text uses PingFang SC, with Noto Sans CJK SC as the intended fallback. Maintain at least 96 pixels of horizontal safety and 64 pixels vertically. Important numerical anchors must remain readable for more than two seconds.

The opening table should contain eight compact labeled columns and one illustrative row. It is not a data browser. The rotation scene should use a deterministic elongated point cloud, two old gray axes, a solid teal PC1 arrow, and a solid orange PC2 arrow. Labels, arrow orientations, and orthogonality communicate meaning together so color is not the only carrier. Do not use a 3D plot; it would conflict with the explicit high-dimensional disclaimer and add no conceptual value.

The component-selection scene uses four horizontal bars, each with a PC number and percentage. Bar length reinforces the number but does not replace it. A separate summary card holds the cumulative percentages and `k₉₀ = 4`. This is the poster segment; it must show all four individual bars, both cumulative values, the threshold rule, and the selected dimension at once.

Do not draw arrows from SMS sparse storage into PCA. This animation is an independent Ames dense-feature case. Do not use the generated two-case illustration inside Manim; redraw the necessary deterministic vectors so the video remains reproducible and drift-checkable.

## NarrativeComposer storyboard

### 0:00–0:08 — The exact PCA question

Open with an eight-column Ames feature table and title `8 个房屋特征，可以压缩成几个方向？`. Add `Ames 本地数值快照 · 2,927 行`. Reveal a shape card containing `Z ∈ R²⁹²⁷ˣ⁸`, `8 个连续或有序数值特征`, and `不使用房价标签`. The opening must signal that this is a different data case from the SMS lesson and an unsupervised input analysis.

### 0:08–0:20 — Standardize first

On the left, list representative raw units: area in square feet, quality on a 1–10 scale, and house age in years. State `量纲不同，方差不能直接比较`. On the right, introduce the standardized matrix and write `zᵢⱼ = (xᵢⱼ − μⱼ) / σⱼ`, `mean(Z[:, j]) ≈ 0`, `std(Z[:, j]) = 1`, and `使用总体标准差 ddof = 0`. The arrow between cards means transformation of the same eight columns, not train/test preprocessing.

### 0:20–0:34 — Rotate to principal axes

Draw the deterministic elongated 2D point cloud and old reference axes. Create a long teal direction labeled `PC1：最大方差方向` and an orthogonal orange direction labeled `PC2：与 PC1 正交`. Beside it, show `C = ZᵀZ / n`, `Cvⱼ = λⱼvⱼ`, and `λ₁ ≥ λ₂ ≥ … ≥ λ₈`. Add `vⱼ 互相正交，长度为 1`. Keep the disclaimer `二维点云仅解释方向；真实计算使用 8 维数据` visible throughout this segment.

### 0:34–0:47 — Covariance and SVD agree

Place two equal cards side by side. The covariance route is `C = ZᵀZ/n`, `C = VΛVᵀ`, `列 vⱼ 是主方向`. The SVD route is `Z = UΣVᵀ`, `λⱼ = σⱼ²/n`, `右奇异向量仍是 vⱼ`. Between the cards write `同一谱`. Along the bottom show `本例两种路线的解释方差比最大差 1.332 × 10⁻¹⁵`. Describe this as numerical agreement, never as explained variance or reconstruction error.

### 0:47–1:02 — Select k with a declared rule

Build four labeled bars: `PC1 51.81%`, `PC2 19.92%`, `PC3 12.14%`, `PC4 8.28%`. On the summary card show `前 2 维：71.73%`, `前 4 维：92.15%`, `k₉₀ = 4`, and `阈值规则：累计比例 ≥ 90%`. Highlight the summary card after the fourth bar. The selected dimension comes from the rule; it is not described as universally optimal. Extract the poster at second 57 from this stable composition.

### 1:02–1:12 — Projection and reconstruction

Write `Tₖ = ZVₖ` followed by `投影到 k 个主成分`, then `Ẑₖ = TₖVₖᵀ` followed by `回到 8 维标准化特征空间`. A result card states `标准化单位下的 RMSE`, `k = 2 → 0.531684`, and `k = 4 → 0.280168`. Add `保留更多方向，重构误差下降`. Do not label these numbers as house-price errors.

### 1:12–1:20 — Interpretation boundary

End on `PCA 保留输入特征的主要变化方向` and `它不看房价标签，也不自动保证预测更好`. The final card reads `标准化规则、阈值和业务解释必须写清楚` and `本例选择 k = 4，因为累计解释方差首次达到 90%`. Hold the final frame without a promotional outro.

## CodeGenerator and verification contract

Implement a deterministic Manim `Scene` with fixed cut timestamps `[0, 8, 20, 34, 47, 62, 72, 80]`. Each method may finish early and wait, but no animation may overrun the next cut. Generate the point cloud from a fixed analytic sequence, not random runtime state. Use vector objects and `Text`; do not load remote resources, a runtime dataset, or LaTeX. The render process must disable cache, set 1920×1080 at 30 fps, validate H.264 and silence, extract the poster at second 57, and publish the whole public numerical-method package only after validation.

The quality check must reject drift in shape, feature count, standardization convention, the first four explained-variance ratios, two cumulative values, `k90`, both reconstruction RMSE values, and spectral agreement. It must also reject a missing six-role pipeline, malformed bilingual labels, empty transcript or English summary, missing media, or a duration difference above 0.20 seconds. The transcript is the accessibility fallback for this silent animation and must preserve the same mathematical qualifications and standardized-unit wording.
