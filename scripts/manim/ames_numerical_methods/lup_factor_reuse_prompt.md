# Manim Animation: Ames LUP factorization and reuse

## Pipeline contract

This package is the CodeGenerator output of the six-role Math-To-Manim pipeline. Follow `lup_factor_reuse_tree.json` from linear systems and matrix notation through elimination, partial-pivot checks, triangular solves, and factor reuse. The Ames notebook reports no actual row exchange; the video must never invent one.

## Overview

Create a silent, 80-second Simplified-Chinese animation that turns the 6×6 normal system `Gβ=c` into a reusable LUP solve. Separate the roles of pivot checks, factorization, forward/back substitution, numerical checks, and multiple right-hand sides.

**Exact duration:** 80 seconds
**Output:** 1920×1080, 30 fps, H.264 MP4
**Locale:** zh-CN
**System:** `G=XᵀX∈R^(6×6)`, `c=Xᵀy`; rank 6, so G is symmetric positive definite in this case.
**Pivot record:** `[0,1,2,3,4]`, therefore `P=I_6` for this Ames instance.

## Mathematical contract

- Partial pivot selection is `p_k=argmax_{i≥k}|U_ik|`.
- The invariant is `PG=LU`; P permutes equation rows, never feature columns.
- L stores elimination multipliers and U is upper triangular.
- Solve `Lz=Pc` by forward substitution, then `Uβ=z` by back substitution.
- Exact checks: factorization residual matrix infinity norm `4.547×10^-13`; solve residual vector infinity norm `1.455×10^-11`; manual-vs-SciPy max absolute difference `7.105×10^-15`; LU-vs-lstsq max absolute difference `1.918×10^-13`.
- With X unchanged, reuse one factorization for `C=[Xᵀy_price, Xᵀlog(y_USD)]`; the log-target intercept is `12.02122130` and the logarithm is natural.
- A changed sample set, features, weighting, or regularization changes the left-hand side. Small residuals do not establish low sensitivity.
- G is SPD here, so Cholesky is another valid square-system method; direct least squares usually uses QR/SVD. Do not add either algorithm to the main animation flow.

## Visual system

Use background `#F7F3EA`, navy `#102A43`, blue `#2F6FED`, teal `#1F8A85`, orange `#F2994A`, gray `#8FA3B8`; PingFang SC with Noto Sans CJK SC fallback. Maintain 96/64 px safe margins. No inverse animation and no row-swap arrows.

## Scene sequence

### 0:00–0:08 — Square system, no inverse

Open with `Gβ=c`, `G∈R^(6×6)`, and `目标：不显式计算 G^-1`. Tie G and c to `XᵀX` and `Xᵀy`.

### 0:08–0:21 — Five truthful pivot checks

Show `p_k=argmax_{i≥k}|U_ik|`, scan k=0 through 4, and reveal the exact list `[0,1,2,3,4]`. Every line says `保留当前行`. End with `本例 5 次均保留当前行` and `本例未换行 ≠ 算法不检查主元`. Never show a swap arrow.

### 0:21–0:36 — Factor roles

Present P, L, and U as separate labeled objects: P records equation-row permutations and is `I_6` here; L stores multipliers and is unit lower triangular; U is upper triangular. Join them with `P·G=L·U` and retain the general qualification.

### 0:36–0:50 — Triangular solves

Show forward substitution `Lz=Pc` followed by back substitution `Uβ=z`. A directional arrow must make the order explicit. Add `G^-1 不进入计算流程`.

### 0:50–1:02 — Four numerical checks

Display four separately titled cards with the exact values and correct norm meanings. State that absolute residuals depend on scale, and that implementation agreement does not prove low sensitivity.

### 1:02–1:14 — Reuse two right-hand sides

Show price and natural-log-price right-hand sides feeding one shared `P·L·U` solver. Label `1 次分解 | 2 次三角解`, retain `pivot rows [0,1,2,3,4]` and `PG=LU`, and show `截距=12.02122130`. This segment supplies the poster.

### 1:14–1:20 — Conditioning handoff

Keep the reuse composition visible and overlay `小残差 ≠ 对输入不敏感` plus `下一段：用条件数检查问题本身的敏感性`.

## Accessibility and correctness notes

The scan is conveyed by ordered text and check marks, not color alone. No Ames row is shown moving because none did. The transcript labels each residual separately. The poster must include the pivot list, `PG=LU`, and both right-hand-side channels.
