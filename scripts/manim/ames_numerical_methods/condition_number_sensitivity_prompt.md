# Manim Animation: Ames condition number and sensitivity

## Pipeline contract

This package is the CodeGenerator output of the six-role Math-To-Manim pipeline. Follow `condition_number_sensitivity_tree.json` from scaling and vector geometry through singular values, Gram squaring, and a near-null direction. Keep computational residual and problem conditioning distinct.

## Overview

Create a silent, 82-second Simplified-Chinese animation that compares raw, standardized, and near-duplicate Ames designs; explains the exact Gram-square relation for a full-column-rank matrix; and demonstrates sensitivity with both the notebook diagnostic and a transparent 2×2 pair of neighboring systems.

**Exact duration:** 82 seconds
**Output:** 1920×1080, 30 fps, H.264 MP4
**Locale:** zh-CN
**Norm:** every condition number is the spectral/2-norm condition number.

## Mathematical contract

- `κ₂(X)=||X||₂||X⁺||₂=σmax/σmin`.
- Raw Ames design condition number: `13044.220254`; standardized design: `3.222571`.
- For full column rank `X=UΣVᵀ`, `XᵀX=VΣ²Vᵀ`, hence exactly `κ₂(XᵀX)=κ₂(X)²`; here `3.222571²≈10.384962` after displayed rounding.
- Diagnostic-only near duplicate: `z_living` and deterministic row-index noise `η` are each already standardized, then combined as `z_duplicate=z_living+10^-4η` without rescaling the sum. It is not written to CSV. `X_near∈R^(2927×7)` remains full rank but has `κ₂=26644.503135`.
- A target perturbation of relative norm `10^-5` along the smallest-left-singular-vector direction yields relative coefficient change `0.00329613` and observed ratio `329.613418`. This observed ratio is not the condition number.
- Transparent example: `A=[[1,1],[1,1.0001]]`, `κ₂(A)=40002.000075`; `b=[2,2.0001]^T` gives `x=[1,1]^T`, while neighboring `b'=[2,2.0002]^T` gives `x'=[0,2]^T`. These are two systems with the same A and different right-hand sides; each has one unique solution and near-zero residual.
- Standardization does not remove genuine collinearity. More floating-point precision cannot restore identifiability missing from near-duplicate features.

## Visual system

Use background `#F7F3EA`, navy `#102A43`, blue `#2F6FED`, teal `#1F8A85`, orange `#F2994A`, gray `#8FA3B8`; PingFang SC with Noto Sans CJK SC fallback. Every ellipse or pair of near-parallel lines must display `高维关系示意，不按实际尺度`. Maintain 96/64 px safe margins and two-second holds on critical values.

## Scene sequence

### 0:00–0:08 — Two questions

Open with `小残差，不等于低敏感性`. Contrast `当前方程算得准吗？看残差` with `输入稍变，解会稳吗？看条件数`.

### 0:08–0:22 — Scale comparison

Compare raw and standardized direction-stretch ellipses with exact values `13044.220254` and `3.222571`. Show `z_j=(x_j-μ_j)/s_j`, the high-dimensional disclaimer, and `标准化改善单位尺度，但不会增加信息或消除真实共线性`.

### 0:22–0:34 — Gram squaring

Show `X=UΣVᵀ`, `κ₂(X)=σmax/σmin`, `XᵀX=VΣ²Vᵀ`, and `κ₂(XᵀX)=κ₂(X)²`. Display `3.222571²≈10.384962`, `满列秩`, and `2-范数`.

### 0:34–0:49 — Near-duplicate diagnostic

Draw two labeled, nearly parallel feature directions and add the fixed high-dimensional disclaimer. Display `z_duplicate=z_living+10^-4η`, `z_living 与 η 均已标准化；相加后不再缩放`, `只用于诊断，不写回下载 CSV`, `X_near∈R^(2927×7)`, and `κ₂(X_near)=26644.503135`.

### 0:49–1:02 — One observed amplification

Build a three-card pipeline: relative target perturbation `10^-5` → relative coefficient change `0.00329613` → observed amplification `329.613418×`. Add a large orange boxed sentence `329.613418 不是条件数` and repeat the actual near-design condition number.

### 1:02–1:16 — Two neighboring systems

Keep one exact A matrix and its condition number above two system cards. The first shows b and x; the second shows b' and x'. Join them only with `b→b'`. Both residuals are approximately zero. State `不是同一右端项出现两个解；这是两个相邻系统`.

### 1:16–1:22 — Responses and route handoff

Create a poster-ready summary with raw/scaled/near condition cards, the orange `329.613418不是条件数` warning, and a small 2×2 neighboring-system badge. List scaling, removing/reparameterizing duplicates, collecting more informative data, and regularization. End with `更高浮点精度不能补回近重复特征缺少的可辨识信息` and `下一章：稀疏矩阵`.

## Accessibility and correctness notes

Shapes and labels supplement every color difference. `329.613418` is never typeset after κ. The 2×2 segment never implies two solutions for one unchanged right-hand side. The poster is the final summary frame and must retain all three condition numbers, the orange warning, and the 2×2 badge.
