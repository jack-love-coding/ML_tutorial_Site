# Manim Animation: Ames least-squares projection

## Pipeline contract

This package is the CodeGenerator output of the six-role Math-To-Manim pipeline: ConceptAnalyzer → PrerequisiteExplorer → MathematicalEnricher → VisualDesigner → NarrativeComposer → CodeGenerator. Its prerequisite graph is `least_squares_projection_tree.json`. Do not skip the shape contract, projection interpretation, or distinction between prediction error and optimality.

## Overview

Create a silent, 78-second Simplified-Chinese animation that connects the local 2,927-row Ames numeric snapshot to a least-squares design matrix, column-space projection, residual orthogonality, and the 6×6 normal system used in the next lesson. The learner should understand why `Xᵀr≈0` and RMSE answer different questions.

**Exact duration:** 78 seconds
**Output:** 1920×1080, 30 fps, H.264 MP4
**Locale in video:** zh-CN
**Dataset contract:** `X∈R^(2927×6)`, five standardized features plus an intercept, `β∈R^6`, `y,r∈R^2927`, rank 6, target unit kUSD.
**Numerical anchors:** RMSE `35.834182 kUSD`; `max|Xᵀr|=3.726×10^-10`.

## Mathematical contract

- Standardization is `z_j=(x_j-μ_j)/s_j` using the population scale from the notebook.
- The objective is unweighted and unregularized: `β̂=argmin_β ||Xβ-y||²`.
- Prediction is `ŷ=Xβ̂∈Col(X)` and residual is always `r=y-ŷ`.
- `∇_β||Xβ-y||²=-2Xᵀr`; at the fitted point `Xᵀr≈0`.
- Substitution gives `Xᵀ(Xβ-y)=0`, then `XᵀXβ=Xᵀy`.
- Define `G=XᵀX` and `c=Xᵀy`, so `Gβ=c` is 6×6.
- The projection exists in `R^2927`; every 2D plane and arrow is explicitly labeled `高维关系示意，不按实际尺度`.
- Orthogonality does not imply small RMSE. Normal equations are a teaching bridge, not the production default; QR, SVD, or library `lstsq` are the practical handoff.

## Visual system

- Background `#F7F3EA`, navy `#102A43`, data blue `#2F6FED`, teal `#1F8A85`, orange `#F2994A`, gray `#8FA3B8`.
- Use `PingFang SC`, with `Noto Sans CJK SC` as the intended host fallback.
- Maintain at least 96 px horizontal and 64 px vertical safe margins.
- Never rely on color alone: use labels, solid/dashed arrows, cards, and a right-angle marker.
- Important numbers remain unchanged and readable for at least two seconds.

## Scene sequence

### 0:00–0:07 — Ames snapshot

Show a small housing-feature table and the title `Ames 最小二乘：从数据到投影`. Display `同一份本地快照 · 2,927 套房屋` and `n=2,927`. Do not imply sampling or a train/test split.

### 0:07–0:18 — Design contract

List the five features: overall quality, living area, basement area, garage area, and age at sale. Show the exact standardization formula, the intercept-column interpretation, `X∈R^(2927×6)`, `β∈R^6`, `y,r∈R^2927`, rank 6, kUSD, and the unweighted/unregularized scope.

### 0:18–0:34 — Column-space projection

Draw a labeled schematic plane `Col(X)`. A solid blue arrow is `y`, a solid teal arrow ending on the plane is `ŷ=Xβ`, and an orange dashed segment is `r=y-ŷ`. Keep the fixed disclaimer `高维关系示意，不按实际尺度`. Show the exact least-squares objective and decomposition `y=ŷ+r`.

### 0:34–0:48 — Orthogonality

Add a right-angle glyph between the residual and a direction in the sketched column space. Derive `∇=-2Xᵀr`, then `Xᵀr≈0`. Explain that each component is a column dot product. Display `max|Xᵀr|=3.726×10^-10` and label it `一阶最优条件`.

### 0:48–1:01 — Two checks

Retain a compact projection sketch and show two separately titled cards. Card one: `预测误差`, `RMSE=||r||₂/√2927=35.834182 kUSD`, `预测通常相差多远？`. Card two: `最优性检查`, `max|Xᵀr|=3.726×10^-10`, `当前系数满足一阶条件吗？`. Add `正交成立，不代表 RMSE 很小`. This is the poster segment.

### 1:01–1:10 — Normal system

Write the chain `Xᵀr=0 → Xᵀ(Xβ-y)=0 → XᵀXβ=Xᵀy`. Then define `G=XᵀX`, `c=Xᵀy`, and show `Gβ=c`, `G 是 6×6 Gram 矩阵`.

### 1:10–1:18 — LUP handoff

State `正规方程是教学连接`, `不显式求 G^-1`, and the practical QR/SVD/library-lstsq qualification. End on the question `能否把 G 分解一次，求解多个右端项？` and `下一段：LUP 分解与复用`.

## Accessibility and correctness notes

All formulas are rendered from exact Unicode strings, not generated approximations. The transcript repeats the same residual convention and units. The English document is a summary of this Chinese-only video, not a claim that an English render exists. The poster is extracted from the two-check segment and must preserve both numerical cards and the projection disclaimer.
