#!/usr/bin/env python3
"""Build, execute, verify, and publish the Ames numerical-methods notebook."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sys
import tempfile
import uuid
from pathlib import Path

import nbformat
from nbclient import NotebookClient


REPO_ROOT = Path(__file__).resolve().parents[2]
NOTEBOOK_DIR = REPO_ROOT / "public/notebooks/numerical-methods"
NOTEBOOK_PATH = NOTEBOOK_DIR / "ames-housing-numerical-methods.zh-CN.ipynb"
OUTPUT_DIR = NOTEBOOK_DIR / "outputs"
DATA_MANIFEST_PATH = REPO_ROOT / "public/datasets/numerical-methods/manifest.json"
DATASET_PATH = REPO_ROOT / "public/datasets/numerical-methods/ames-housing-numeric.csv"
REQUIREMENTS_PATH = NOTEBOOK_DIR / "requirements.txt"
ENVIRONMENT_PATH = NOTEBOOK_DIR / "environment.json"
GENERATOR_PATH = Path(__file__).resolve()
CONTRACT_VERSION = "numerical-methods-ames-v1"
SUMMARY_FILES = (
    "ames-least-squares-summary.json",
    "ames-lu-summary.json",
    "ames-conditioning-summary.json",
)


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def json_bytes(payload: object) -> bytes:
    return (json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True, allow_nan=False) + "\n").encode("utf-8")


def markdown_cell(cell_id: str, source: str):
    return nbformat.v4.new_markdown_cell(source.strip(), id=cell_id)


def code_cell(cell_id: str, chapter_id: str, role: str, source: str, output_id: str | None = None):
    metadata = {
        "mlAtlas": {
            "chapterId": chapter_id,
            "role": role,
            "sourceCellId": cell_id,
        }
    }
    if output_id:
        metadata["mlAtlas"]["outputId"] = output_id
    return nbformat.v4.new_code_cell(source.strip(), id=cell_id, metadata=metadata)


def build_notebook():
    data_manifest = json.loads(DATA_MANIFEST_PATH.read_text(encoding="utf-8"))
    cells = [
        markdown_cell(
            "intro",
            r"""
# Ames Housing 数值方法：从最小二乘到 LU 与条件数

**Ames Housing Numerical Methods: Least Squares, LU, and Conditioning**

这份 Notebook 与 ML Atlas 的三个章节共用同一份本地数据和同一组数值约定。我们先把房屋特征写成设计矩阵，用最小二乘拟合价格；随后把正规方程当作线性系统，用一次 LUP 分解复用多个右端项；最后检查尺度和近共线性怎样放大误差。

This notebook keeps one dataset and one numerical convention across three lessons: formulate a least-squares model, solve its normal system with reusable LUP factors, and diagnose sensitivity through condition numbers.

> 数据已经在维护者边界完成列选择、严格数值转换和三条异常记录排除。本 Notebook 不再次教授清洗，也不会联网下载数据。
""",
        ),
        code_cell(
            "setup-environment",
            "shared-setup",
            "setup",
            r"""
import hashlib
import json
import os
import sys
from importlib import metadata as importlib_metadata
from pathlib import Path

import numpy as np
import pandas as pd
import scipy
from IPython.display import display
from scipy.linalg import lu_factor, lu_solve

EXPECTED_VERSIONS = {
    "numpy": "2.4.6",
    "pandas": "3.0.3",
    "scipy": "1.17.1",
    "nbformat": "5.10.4",
    "nbclient": "0.11.0",
    "jupyterlab": "4.6.1",
    "ipykernel": "7.3.0",
}
observed_versions = {name: importlib_metadata.version(name) for name in EXPECTED_VERSIONS}
if observed_versions != EXPECTED_VERSIONS:
    raise RuntimeError(f"环境版本不匹配：{observed_versions}")
if sys.version_info[:3] != (3, 12, 13):
    raise RuntimeError(f"Python 必须为 3.12.13，当前为 {sys.version.split()[0]}")

EXPECTED_DATA_SHA256 = "763867f46c9a8616d7e7ea7599f4ab1cf408609c8aea06e496e65f9330df20fc"
EXPECTED_COLUMNS = [
    "ames_order", "overall_quality", "year_built", "year_sold",
    "first_floor_sqft", "second_floor_sqft", "living_area_sqft",
    "basement_sqft", "garage_cars", "garage_area_sqft", "sale_price_usd",
]
data_override = os.environ.get("ML_ATLAS_AMES_DATA_PATH")
data_candidates = [
    *([Path(data_override)] if data_override else []),
    Path("ames-housing-numeric.csv"),
    Path("../../datasets/numerical-methods/ames-housing-numeric.csv"),
]
DATA_PATH = next((candidate.resolve() for candidate in data_candidates if candidate.is_file()), None)
if DATA_PATH is None:
    raise FileNotFoundError(
        "找不到 ames-housing-numeric.csv：请把网页下载的 CSV 与 Notebook 放在同一目录，"
        "或设置 ML_ATLAS_AMES_DATA_PATH。"
    )
DATA_SHA256 = hashlib.sha256(DATA_PATH.read_bytes()).hexdigest()
if DATA_SHA256 != EXPECTED_DATA_SHA256:
    raise RuntimeError("本地 Ames CSV 与 Notebook 内置 SHA-256 不一致")

OUTPUT_DIR = Path(os.environ.get("ML_ATLAS_NUMERICAL_OUTPUT_DIR", "outputs"))
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def write_summary(filename, payload):
    destination = OUTPUT_DIR / filename
    destination.write_text(
        json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )
    display({"application/json": payload}, raw=True)
    return destination

observed_versions
""",
        ),
        code_cell(
            "load-reviewed-snapshot",
            "shared-setup",
            "data",
            r"""
ames = pd.read_csv(DATA_PATH)
if ames.columns.tolist() != EXPECTED_COLUMNS:
    raise RuntimeError(f"CSV 列顺序漂移：{ames.columns.tolist()}")
if ames.shape != (2927, 11) or ames.isna().any().any():
    raise RuntimeError(f"CSV shape/完整性漂移：{ames.shape}")

ames["house_age_at_sale"] = ames["year_sold"] - ames["year_built"]
if (ames["house_age_at_sale"] < 0).any():
    raise RuntimeError("清洗后快照不应产生负房龄")

print(f"rows={len(ames)}, columns={len(EXPECTED_COLUMNS)}")
print(ames[["ames_order", "overall_quality", "living_area_sqft", "sale_price_usd"]].head(3).to_string(index=False))
""",
        ),
        markdown_cell(
            "least-squares-heading",
            r"""
## 1. 最小二乘：把房屋特征写成投影问题

设标准化后的五个特征组成 $Z\in\mathbb{R}^{n\times 5}$，在左侧加一列 1 得到 $X=[\mathbf 1, Z]$。房价以千美元表示为 $y$。我们要找

$$
\hat\beta=\arg\min_\beta\|X\beta-y\|_2^2.
$$

对目标求导得到 $X^\top(X\beta-y)=0$，也就是 $X^\top X\beta=X^\top y$。这说明残差与 $X$ 的每一列正交。下面用显式逐行累加形成正规方程作为最小实现，再用 `numpy.linalg.lstsq` 作为更稳健的库基准。

The manual path exposes the normal equations; the library path solves least squares without requiring us to form the Gram matrix in production code.
""",
        ),
        code_cell(
            "least-squares-compute",
            "least-squares-fitting",
            "compute",
            r"""
FEATURES = [
    "overall_quality",
    "living_area_sqft",
    "basement_sqft",
    "garage_area_sqft",
    "house_age_at_sale",
]

feature_values = ames[FEATURES].to_numpy(dtype=float)
feature_means = feature_values.mean(axis=0)
feature_scales = feature_values.std(axis=0, ddof=0)
z = (feature_values - feature_means) / feature_scales
x_design = np.column_stack([np.ones(len(z)), z])
y_kusd = ames["sale_price_usd"].to_numpy(dtype=float) / 1000.0

# NumPy 最小实现：显式逐行累加 X.T @ X 与 X.T @ y。
gram_manual = np.zeros((x_design.shape[1], x_design.shape[1]))
rhs_manual = np.zeros(x_design.shape[1])
for row, target in zip(x_design, y_kusd, strict=True):
    gram_manual += np.outer(row, row)
    rhs_manual += row * target
beta_normal = np.linalg.solve(gram_manual, rhs_manual)

# 库基准：直接求解最小二乘问题。
beta_lstsq, residual_squares, rank, singular_values = np.linalg.lstsq(x_design, y_kusd, rcond=None)
prediction = x_design @ beta_lstsq
residual = y_kusd - prediction

print("rank:", rank)
print("beta (kUSD):", np.round(beta_lstsq, 6).tolist())
print("max |normal - lstsq|:", f"{np.max(np.abs(beta_normal - beta_lstsq)):.3e}")
""",
        ),
        code_cell(
            "least-squares-summary",
            "least-squares-fitting",
            "interpret",
            r"""
coefficient_names = ["intercept_kusd", *[f"{name}_per_standard_deviation_kusd" for name in FEATURES]]
least_squares_summary = {
    "contractVersion": "numerical-methods-ames-v1",
    "datasetSha256": DATA_SHA256,
    "outputId": "ames-least-squares-summary",
    "rows": int(len(ames)),
    "featureOrder": FEATURES,
    "rank": int(rank),
    "coefficients": {
        name: round(float(value), 6)
        for name, value in zip(coefficient_names, beta_lstsq, strict=True)
    },
    "featureMeans": {
        name: round(float(value), 6)
        for name, value in zip(FEATURES, feature_means, strict=True)
    },
    "featurePopulationScales": {
        name: round(float(value), 6)
        for name, value in zip(FEATURES, feature_scales, strict=True)
    },
    "rmseKusd": round(float(np.sqrt(np.mean(residual ** 2))), 6),
    "maeKusd": round(float(np.mean(np.abs(residual))), 6),
    "rSquared": round(float(1 - residual @ residual / ((y_kusd - y_kusd.mean()) @ (y_kusd - y_kusd.mean()))), 8),
    "residualSumSquares": round(float(residual @ residual), 6),
    "maxNormalEquationResidual": float(f"{np.max(np.abs(x_design.T @ residual)):.3e}"),
    "manualVsLibraryMaxAbs": float(f"{np.max(np.abs(beta_normal - beta_lstsq)):.3e}"),
}
_ = write_summary("ames-least-squares-summary.json", least_squares_summary)
""",
            "ames-least-squares-summary",
        ),
        markdown_cell(
            "lu-heading",
            r"""
## 2. LU：同一个正规方程怎样复用分解

最小二乘得到的方阵系统是 $G\beta=c$，其中 $G=X^\top X$、$c=X^\top y$。带部分主元选择的分解写成

$$
PG=LU.
$$

先解 $Lz=Pc$，再解 $U\beta=z$。如果换一个目标、保留同一批特征，$G$ 不变，因此可以复用 $P,L,U$，只重新做两次三角求解。

The factorization is the expensive reusable step; forward and backward substitution handle each new right-hand side.
""",
        ),
        code_cell(
            "manual-lup-functions",
            "lu-decomposition",
            "compute",
            r"""
def lup_factor_manual(matrix):
    upper = np.array(matrix, dtype=float, copy=True)
    n = upper.shape[0]
    if upper.ndim != 2 or upper.shape[1] != n or n == 0:
        raise ValueError("matrix must be a non-empty square array")
    pivot_tolerance = np.finfo(float).eps * max(1, n) * max(1.0, np.linalg.norm(upper, ord=np.inf))
    lower = np.eye(n)
    permutation = np.eye(n)
    pivot_rows = []
    for column in range(n - 1):
        pivot = column + int(np.argmax(np.abs(upper[column:, column])))
        if abs(upper[pivot, column]) <= pivot_tolerance:
            raise np.linalg.LinAlgError("matrix is singular to working precision")
        pivot_rows.append(pivot)
        if pivot != column:
            upper[[column, pivot], :] = upper[[pivot, column], :]
            permutation[[column, pivot], :] = permutation[[pivot, column], :]
            lower[[column, pivot], :column] = lower[[pivot, column], :column]
        for row in range(column + 1, n):
            multiplier = upper[row, column] / upper[column, column]
            lower[row, column] = multiplier
            upper[row, column:] -= multiplier * upper[column, column:]
    if abs(upper[-1, -1]) <= pivot_tolerance:
        raise np.linalg.LinAlgError("matrix is singular to working precision")
    return permutation, lower, upper, pivot_rows

def forward_substitution(lower, rhs):
    solution = np.zeros_like(rhs, dtype=float)
    tolerance = np.finfo(float).eps * max(1, len(rhs)) * max(1.0, np.linalg.norm(lower, ord=np.inf))
    for row in range(len(rhs)):
        if abs(lower[row, row]) <= tolerance:
            raise np.linalg.LinAlgError("lower-triangular diagonal is singular to working precision")
        solution[row] = (rhs[row] - lower[row, :row] @ solution[:row]) / lower[row, row]
    return solution

def backward_substitution(upper, rhs):
    solution = np.zeros_like(rhs, dtype=float)
    tolerance = np.finfo(float).eps * max(1, len(rhs)) * max(1.0, np.linalg.norm(upper, ord=np.inf))
    for row in range(len(rhs) - 1, -1, -1):
        if abs(upper[row, row]) <= tolerance:
            raise np.linalg.LinAlgError("upper-triangular diagonal is singular to working precision")
        solution[row] = (rhs[row] - upper[row, row + 1:] @ solution[row + 1:]) / upper[row, row]
    return solution

def lup_solve_manual(permutation, lower, upper, rhs):
    intermediate = forward_substitution(lower, permutation @ rhs)
    return backward_substitution(upper, intermediate)

gram = x_design.T @ x_design
rhs_price = x_design.T @ y_kusd
permutation, lower, upper, pivot_rows = lup_factor_manual(gram)
beta_lup_manual = lup_solve_manual(permutation, lower, upper, rhs_price)

# SciPy 库实现；同一个 factorization 再解 log(price) 的右端项。
scipy_factor = lu_factor(gram)
beta_lup_scipy = lu_solve(scipy_factor, rhs_price)
rhs_log_price = x_design.T @ np.log(ames["sale_price_usd"].to_numpy(dtype=float))
beta_log_price = lu_solve(scipy_factor, rhs_log_price)

print("manual pivots:", pivot_rows)
print("max |manual LUP - SciPy|:", f"{np.max(np.abs(beta_lup_manual - beta_lup_scipy)):.3e}")
print("reused factor, log-price intercept:", f"{beta_log_price[0]:.6f}")
""",
        ),
        code_cell(
            "lu-summary",
            "lu-decomposition",
            "interpret",
            r"""
lu_summary = {
    "contractVersion": "numerical-methods-ames-v1",
    "datasetSha256": DATA_SHA256,
    "outputId": "ames-lu-summary",
    "systemShape": list(gram.shape),
    "manualPivotRows": [int(value) for value in pivot_rows],
    "solutionKusd": [round(float(value), 6) for value in beta_lup_manual],
    "factorizationResidualInfinity": float(f"{np.linalg.norm(permutation @ gram - lower @ upper, ord=np.inf):.3e}"),
    "solveResidualInfinity": float(f"{np.linalg.norm(gram @ beta_lup_manual - rhs_price, ord=np.inf):.3e}"),
    "manualVsScipyMaxAbs": float(f"{np.max(np.abs(beta_lup_manual - beta_lup_scipy)):.3e}"),
    "luVsLstsqMaxAbs": float(f"{np.max(np.abs(beta_lup_scipy - beta_lstsq)):.3e}"),
    "reusedLogPriceIntercept": round(float(beta_log_price[0]), 8),
}
_ = write_summary("ames-lu-summary.json", lu_summary)
""",
            "ames-lu-summary",
        ),
        markdown_cell(
            "conditioning-heading",
            r"""
## 3. 条件数：算法没有出错，问题仍可能很敏感

2-范数条件数是最大与最小奇异值之比：

$$
\kappa_2(A)=\frac{\sigma_{\max}(A)}{\sigma_{\min}(A)}.
$$

$\kappa$ 接近 1 表示各方向缩放接近；很大的 $\kappa$ 表示至少一个方向被压得很薄，微小输入误差可能变成明显解误差。形成正规方程还会近似平方条件数：$\kappa_2(X^\top X)\approx\kappa_2(X)^2$。

We compare the raw and standardized Ames design, then add an explicitly synthetic near-duplicate feature to isolate the failure mode without altering the dataset snapshot.
""",
        ),
        code_cell(
            "conditioning-compute",
            "condition-numbers",
            "compute",
            r"""
x_raw = np.column_stack([np.ones(len(feature_values)), feature_values])

def condition_from_singular_values(matrix):
    values = np.linalg.svd(matrix, compute_uv=False)
    return float(values[0] / values[-1])

raw_condition_manual = condition_from_singular_values(x_raw)
raw_condition_library = float(np.linalg.cond(x_raw))
standard_condition_manual = condition_from_singular_values(x_design)
standard_condition_library = float(np.linalg.cond(x_design))
gram_condition = float(np.linalg.cond(gram))

# 诊断场景：living_area 的近副本，加上与数据行号绑定的微小确定性扰动。
diagnostic_noise = np.sin(ames["ames_order"].to_numpy(dtype=float) * 0.017)
diagnostic_noise = (diagnostic_noise - diagnostic_noise.mean()) / diagnostic_noise.std(ddof=0)
near_duplicate = z[:, 1] + 1e-4 * diagnostic_noise
x_near = np.column_stack([x_design, near_duplicate])
u_near, singular_near, _ = np.linalg.svd(x_near, full_matrices=False)
near_condition = float(singular_near[0] / singular_near[-1])

beta_near = np.linalg.lstsq(x_near, y_kusd, rcond=None)[0]
relative_target_perturbation = 1e-5
delta_y = u_near[:, -1] * (relative_target_perturbation * np.linalg.norm(y_kusd))
beta_near_perturbed = np.linalg.lstsq(x_near, y_kusd + delta_y, rcond=None)[0]
relative_coefficient_change = float(np.linalg.norm(beta_near_perturbed - beta_near) / np.linalg.norm(beta_near))

# 可手算的 2×2 极端例子：小残差不等于小解误差。
tiny_angle_matrix = np.array([[1.0, 1.0], [1.0, 1.0001]])
base_rhs = np.array([2.0, 2.0001])
perturbed_rhs = np.array([2.0, 2.0002])
base_solution = np.linalg.solve(tiny_angle_matrix, base_rhs)
perturbed_solution = np.linalg.solve(tiny_angle_matrix, perturbed_rhs)

print("cond(raw X):", f"{raw_condition_library:.6f}")
print("cond(standardized X):", f"{standard_condition_library:.6f}")
print("cond(near-duplicate X):", f"{near_condition:.6f}")
print("2x2 solutions:", np.round(base_solution, 6).tolist(), "->", np.round(perturbed_solution, 6).tolist())
""",
        ),
        code_cell(
            "conditioning-summary",
            "condition-numbers",
            "interpret",
            r"""
conditioning_summary = {
    "contractVersion": "numerical-methods-ames-v1",
    "datasetSha256": DATA_SHA256,
    "outputId": "ames-conditioning-summary",
    "rawDesignCondition": round(raw_condition_library, 6),
    "rawManualVsLibraryAbs": float(f"{abs(raw_condition_manual - raw_condition_library):.3e}"),
    "standardizedDesignCondition": round(standard_condition_library, 6),
    "standardizedManualVsLibraryAbs": float(f"{abs(standard_condition_manual - standard_condition_library):.3e}"),
    "standardizedGramCondition": round(gram_condition, 6),
    "designConditionSquared": round(standard_condition_library ** 2, 6),
    "nearDuplicateDesignCondition": round(near_condition, 6),
    "relativeTargetPerturbation": relative_target_perturbation,
    "relativeCoefficientChange": round(relative_coefficient_change, 8),
    "observedAmplification": round(relative_coefficient_change / relative_target_perturbation, 6),
    "twoByTwoCondition": round(float(np.linalg.cond(tiny_angle_matrix)), 6),
    "twoByTwoBaseSolution": [round(float(value), 6) for value in base_solution],
    "twoByTwoPerturbedSolution": [round(float(value), 6) for value in perturbed_solution],
}
_ = write_summary("ames-conditioning-summary.json", conditioning_summary)
""",
            "ames-conditioning-summary",
        ),
        markdown_cell(
            "handoff",
            r"""
## 小结与下一步 / Handoff

- `lstsq` 直接回答过定约束的拟合问题；正规方程负责把故事连接到方阵求解，但会平方条件数。
- LUP 的价值不只是“解一次”，而是固定左侧矩阵后复用分解。
- 条件数描述问题本身的敏感度；残差只描述计算得到的解代回方程后是否接近。
- 下一批将把相同数值观念带到稀疏文本矩阵和 PCA/TruncatedSVD，并专门展示“中心化会破坏稀疏性”。

`lstsq` solves the fitting problem directly, LUP exposes reusable square-system work, and conditioning tells us when a mathematically valid problem is intrinsically sensitive.
""",
        ),
    ]

    notebook = nbformat.v4.new_notebook(cells=cells)
    notebook.metadata = {
        "kernelspec": {
            "display_name": "Python 3 (ML Atlas Numerical Methods)",
            "language": "python",
            "name": "python3",
        },
        "language_info": {"name": "python", "version": "3.12.13"},
        "mlAtlas": {
            "contractVersion": CONTRACT_VERSION,
            "dataset": {
                "publicPath": data_manifest["file"]["publicPath"],
                "sha256": data_manifest["file"]["sha256"],
            },
            "chapterIds": ["least-squares-fitting", "lu-decomposition", "condition-numbers"],
            "outputIds": [
                "ames-least-squares-summary",
                "ames-lu-summary",
                "ames-conditioning-summary",
            ],
            "outputManifest": "outputs/manifest.json",
            "generator": "scripts/numerical-methods/generate-ames-notebook.py",
        },
    }
    return notebook


def strip_transient_metadata(notebook) -> None:
    notebook.metadata.pop("widgets", None)
    for cell in notebook.cells:
        cell.metadata.pop("execution", None)
        cell.metadata.pop("collapsed", None)
        cell.metadata.pop("scrolled", None)


def write_notebook(path: Path, notebook) -> None:
    path.write_text(nbformat.writes(notebook, version=4), encoding="utf-8")


def validate_summary(path: Path, output_id: str, dataset_sha256: str) -> dict:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("contractVersion") != CONTRACT_VERSION:
        raise ValueError(f"Wrong contractVersion in {path.name}")
    if payload.get("datasetSha256") != dataset_sha256:
        raise ValueError(f"Wrong dataset SHA-256 in {path.name}")
    if payload.get("outputId") != output_id:
        raise ValueError(f"Wrong outputId in {path.name}")

    def assert_finite(value: object) -> None:
        if isinstance(value, float) and not (float("-inf") < value < float("inf")):
            raise ValueError(f"Non-finite value in {path.name}")
        if isinstance(value, dict):
            for child in value.values():
                assert_finite(child)
        if isinstance(value, list):
            for child in value:
                assert_finite(child)

    assert_finite(payload)
    return payload


def execute_transaction() -> tuple[Path, Path]:
    data_manifest = json.loads(DATA_MANIFEST_PATH.read_text(encoding="utf-8"))
    expected_packages = json.loads(ENVIRONMENT_PATH.read_text(encoding="utf-8"))["packages"]
    from importlib import metadata as importlib_metadata

    observed_packages = {name: importlib_metadata.version(name) for name in expected_packages}
    if observed_packages != expected_packages:
        raise RuntimeError(f"Generation environment mismatch: {observed_packages}")
    if sys.version_info[:3] != (3, 12, 13):
        raise RuntimeError(f"Python 3.12.13 required, observed {sys.version.split()[0]}")

    transaction_dir = Path(tempfile.mkdtemp(prefix=".ames-numerical-outputs-", dir=NOTEBOOK_DIR))
    notebook_temp = NOTEBOOK_DIR / f".{NOTEBOOK_PATH.name}.{uuid.uuid4().hex}.tmp"
    previous_output_dir = os.environ.get("ML_ATLAS_NUMERICAL_OUTPUT_DIR")
    previous_path = os.environ.get("PATH", "")
    try:
        notebook = build_notebook()
        os.environ["ML_ATLAS_NUMERICAL_OUTPUT_DIR"] = str(transaction_dir)
        os.environ["PATH"] = f"{Path(sys.executable).parent}{os.pathsep}{previous_path}"
        client = NotebookClient(
            notebook,
            timeout=180,
            kernel_name="python3",
            allow_errors=False,
            record_timing=False,
            resources={"metadata": {"path": str(NOTEBOOK_DIR)}},
        )
        client.execute(cwd=str(NOTEBOOK_DIR))
        strip_transient_metadata(notebook)
        write_notebook(notebook_temp, notebook)

        output_ids = (
            "ames-least-squares-summary",
            "ames-lu-summary",
            "ames-conditioning-summary",
        )
        for filename, output_id in zip(SUMMARY_FILES, output_ids, strict=True):
            validate_summary(transaction_dir / filename, output_id, data_manifest["file"]["sha256"])

        manifest = {
            "contractVersion": CONTRACT_VERSION,
            "dataset": {
                "publicPath": data_manifest["file"]["publicPath"],
                "sha256": data_manifest["file"]["sha256"],
            },
            "notebook": {
                "publicPath": "/notebooks/numerical-methods/ames-housing-numerical-methods.zh-CN.ipynb",
                "sha256": sha256_file(notebook_temp),
                "bytes": notebook_temp.stat().st_size,
            },
            "environment": {
                "publicPath": "/notebooks/numerical-methods/environment.json",
                "sha256": sha256_file(ENVIRONMENT_PATH),
            },
            "requirements": {
                "publicPath": "/notebooks/numerical-methods/requirements.txt",
                "sha256": sha256_file(REQUIREMENTS_PATH),
            },
            "generator": {
                "path": "scripts/numerical-methods/generate-ames-notebook.py",
                "sha256": sha256_file(GENERATOR_PATH),
            },
            "outputs": [
                {
                    "outputId": output_id,
                    "publicPath": f"/notebooks/numerical-methods/outputs/{filename}",
                    "sha256": sha256_file(transaction_dir / filename),
                    "bytes": (transaction_dir / filename).stat().st_size,
                }
                for filename, output_id in zip(SUMMARY_FILES, output_ids, strict=True)
            ],
        }
        (transaction_dir / "manifest.json").write_bytes(json_bytes(manifest))
        return transaction_dir, notebook_temp
    except Exception:
        shutil.rmtree(transaction_dir, ignore_errors=True)
        notebook_temp.unlink(missing_ok=True)
        raise
    finally:
        if previous_output_dir is None:
            os.environ.pop("ML_ATLAS_NUMERICAL_OUTPUT_DIR", None)
        else:
            os.environ["ML_ATLAS_NUMERICAL_OUTPUT_DIR"] = previous_output_dir
        os.environ["PATH"] = previous_path


def compare_committed(transaction_dir: Path, notebook_temp: Path) -> None:
    differences: list[str] = []
    if not NOTEBOOK_PATH.is_file() or NOTEBOOK_PATH.read_bytes() != notebook_temp.read_bytes():
        differences.append(str(NOTEBOOK_PATH.relative_to(REPO_ROOT)))
    generated = {path.relative_to(transaction_dir) for path in transaction_dir.rglob("*") if path.is_file()}
    committed = {path.relative_to(OUTPUT_DIR) for path in OUTPUT_DIR.rglob("*") if path.is_file()} if OUTPUT_DIR.is_dir() else set()
    for relative_path in sorted(generated | committed):
        candidate = transaction_dir / relative_path
        current = OUTPUT_DIR / relative_path
        if not candidate.is_file() or not current.is_file() or candidate.read_bytes() != current.read_bytes():
            differences.append(str(current.relative_to(REPO_ROOT)))
    if differences:
        raise RuntimeError(f"Committed numerical artifacts differ: {', '.join(differences)}")


def validate_standalone_download(notebook_path: Path) -> None:
    """Execute the downloadable Notebook with only its sibling CSV available."""
    data_manifest = json.loads(DATA_MANIFEST_PATH.read_text(encoding="utf-8"))
    temporary_dir = Path(tempfile.mkdtemp(prefix="ml-atlas-ames-download-"))
    standalone_output_dir = temporary_dir / "outputs"
    previous_output_dir = os.environ.get("ML_ATLAS_NUMERICAL_OUTPUT_DIR")
    previous_data_path = os.environ.pop("ML_ATLAS_AMES_DATA_PATH", None)
    previous_path = os.environ.get("PATH", "")
    try:
        shutil.copy2(DATASET_PATH, temporary_dir / "ames-housing-numeric.csv")
        notebook = nbformat.read(notebook_path, as_version=4)
        os.environ["ML_ATLAS_NUMERICAL_OUTPUT_DIR"] = str(standalone_output_dir)
        os.environ["PATH"] = f"{Path(sys.executable).parent}{os.pathsep}{previous_path}"
        client = NotebookClient(
            notebook,
            timeout=180,
            kernel_name="python3",
            allow_errors=False,
            record_timing=False,
            resources={"metadata": {"path": str(temporary_dir)}},
        )
        client.execute(cwd=str(temporary_dir))
        output_ids = (
            "ames-least-squares-summary",
            "ames-lu-summary",
            "ames-conditioning-summary",
        )
        for filename, output_id in zip(SUMMARY_FILES, output_ids, strict=True):
            validate_summary(standalone_output_dir / filename, output_id, data_manifest["file"]["sha256"])
    finally:
        if previous_output_dir is None:
            os.environ.pop("ML_ATLAS_NUMERICAL_OUTPUT_DIR", None)
        else:
            os.environ["ML_ATLAS_NUMERICAL_OUTPUT_DIR"] = previous_output_dir
        if previous_data_path is not None:
            os.environ["ML_ATLAS_AMES_DATA_PATH"] = previous_data_path
        os.environ["PATH"] = previous_path
        shutil.rmtree(temporary_dir, ignore_errors=True)


def publish(transaction_dir: Path, notebook_temp: Path) -> None:
    token = uuid.uuid4().hex
    output_backup = NOTEBOOK_DIR / f".outputs.{token}.bak"
    notebook_backup = NOTEBOOK_DIR / f".{NOTEBOOK_PATH.name}.{token}.bak"
    try:
        if OUTPUT_DIR.exists():
            OUTPUT_DIR.rename(output_backup)
        transaction_dir.rename(OUTPUT_DIR)
        if NOTEBOOK_PATH.exists():
            NOTEBOOK_PATH.rename(notebook_backup)
        notebook_temp.rename(NOTEBOOK_PATH)
    except Exception:
        if OUTPUT_DIR.exists() and output_backup.exists():
            shutil.rmtree(OUTPUT_DIR, ignore_errors=True)
        if output_backup.exists():
            output_backup.rename(OUTPUT_DIR)
        if NOTEBOOK_PATH.exists() and notebook_backup.exists():
            NOTEBOOK_PATH.unlink(missing_ok=True)
        if notebook_backup.exists():
            notebook_backup.rename(NOTEBOOK_PATH)
        raise
    finally:
        shutil.rmtree(output_backup, ignore_errors=True)
        notebook_backup.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Regenerate in a transaction and compare without publishing")
    args = parser.parse_args()

    NOTEBOOK_DIR.mkdir(parents=True, exist_ok=True)
    transaction_dir, notebook_temp = execute_transaction()
    try:
        if args.check:
            compare_committed(transaction_dir, notebook_temp)
            validate_standalone_download(notebook_temp)
            print("Ames numerical notebook artifacts are current and standalone downloads rerun successfully.")
        else:
            publish(transaction_dir, notebook_temp)
            print(f"Published {NOTEBOOK_PATH.relative_to(REPO_ROOT)}")
            print(f"Published {OUTPUT_DIR.relative_to(REPO_ROOT)}")
    finally:
        if transaction_dir.exists():
            shutil.rmtree(transaction_dir, ignore_errors=True)
        notebook_temp.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
