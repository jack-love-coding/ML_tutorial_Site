#!/usr/bin/env python3
"""Generate, execute, validate, and atomically publish numerical-methods Batch 2 notebooks."""

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
from typing import Any

import nbformat
from nbclient import NotebookClient


REPO_ROOT = Path(__file__).resolve().parents[2]
DATASET_DIR = REPO_ROOT / "public/datasets/numerical-methods"
NOTEBOOK_DIR = REPO_ROOT / "public/notebooks/numerical-methods"
OUTPUT_DIR = NOTEBOOK_DIR / "batch-2-outputs"
SMS_DATASET_PATH = DATASET_DIR / "sms-spam.csv"
SMS_MANIFEST_PATH = DATASET_DIR / "sms-spam-manifest.json"
AMES_DATASET_PATH = DATASET_DIR / "ames-housing-numeric.csv"
AMES_MANIFEST_PATH = DATASET_DIR / "manifest.json"
REQUIREMENTS_PATH = NOTEBOOK_DIR / "requirements.txt"
GENERATOR_PATH = Path(__file__).resolve()
SPARSE_NOTEBOOK_PATH = NOTEBOOK_DIR / "sparse-matrices-sms.zh-CN.ipynb"
PCA_NOTEBOOK_PATH = NOTEBOOK_DIR / "pca-ames.zh-CN.ipynb"
CONTRACT_VERSION = "numerical-methods-batch-2-v1"

SPARSE_OUTPUT_FILE = "sms-sparse-summary.json"
PCA_OUTPUT_FILE = "ames-pca-summary.json"


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def json_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode("utf-8")


def markdown(cell_id: str, source: str) -> nbformat.NotebookNode:
    cell = nbformat.v4.new_markdown_cell(source.strip())
    cell["id"] = cell_id
    return cell


def code(cell_id: str, source: str) -> nbformat.NotebookNode:
    cell = nbformat.v4.new_code_cell(source.strip())
    cell["id"] = cell_id
    return cell


def notebook(cells: list[nbformat.NotebookNode]) -> nbformat.NotebookNode:
    result = nbformat.v4.new_notebook(
        cells=cells,
        metadata={
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "version": f"{sys.version_info.major}.{sys.version_info.minor}"},
            "mlAtlas": {"contractVersion": CONTRACT_VERSION, "locale": "zh-CN"},
        },
    )
    return result


def sparse_notebook(dataset_sha: str) -> nbformat.NotebookNode:
    return notebook([
        markdown(
            "sparse-intro",
            """
# 稀疏矩阵：从短信文本到 CSR

本 Notebook 使用本地 UCI SMS Spam Collection 快照，手写确定性的 token、词表、TF-IDF 与 CSR 检查。目标不是训练垃圾短信分类器，而是观察真实文本怎样形成一个“行数不算夸张、列数很多、绝大多数位置为零”的矩阵。

固定约定：token 正则为 `[a-z0-9']+`，最低文档频率为 5，IDF 为 `log((1+n)/(1+df))+1`，最后逐行做 L2 归一化。
""",
        ),
        code(
            "sparse-imports",
            f"""
from collections import Counter
from pathlib import Path
import hashlib
import json
import os
import re

import numpy as np
import pandas as pd
from scipy import sparse

EXPECTED_SHA256 = "{dataset_sha}"
TOKEN_PATTERN = re.compile(r"[a-z0-9']+")
MIN_DOCUMENT_FREQUENCY = 5

def locate_dataset():
    candidates = [
        Path("sms-spam.csv"),
        Path(os.environ["ML_ATLAS_SMS_DATA_PATH"]) if os.environ.get("ML_ATLAS_SMS_DATA_PATH") else None,
        Path("public/datasets/numerical-methods/sms-spam.csv"),
    ]
    for candidate in candidates:
        if candidate is not None and candidate.is_file():
            return candidate
    raise FileNotFoundError("Place sms-spam.csv beside this Notebook or set ML_ATLAS_SMS_DATA_PATH")

dataset_path = locate_dataset()
observed_sha = hashlib.sha256(dataset_path.read_bytes()).hexdigest()
assert observed_sha == EXPECTED_SHA256
sms = pd.read_csv(dataset_path)
assert list(sms.columns) == ["sms_id", "label", "message"]
assert len(sms) == 5574
print(f"dataset={{dataset_path.name}} · rows={{len(sms)}} · sha256={{observed_sha[:12]}}…")
""",
        ),
        markdown(
            "sparse-token-contract",
            """
## 1. 先定义“列是什么”

每条短信是一行，每个保留 token 是一列。词表必须先固定，矩阵的列坐标才有稳定含义。这里使用全语料建立表示，只讲存储结构，不做训练/测试评估。
""",
        ),
        code(
            "sparse-build-vocabulary",
            """
documents = [TOKEN_PATTERN.findall(message.lower()) for message in sms["message"]]
document_frequency = Counter()
for tokens in documents:
    document_frequency.update(set(tokens))

vocabulary = sorted(
    token for token, frequency in document_frequency.items()
    if frequency >= MIN_DOCUMENT_FREQUENCY
)
token_to_column = {token: index for index, token in enumerate(vocabulary)}
print(f"documents = {len(documents)}")
print(f"vocabulary = {len(vocabulary)} tokens (minimum df = {MIN_DOCUMENT_FREQUENCY})")
print("first 12 columns =", vocabulary[:12])
""",
        ),
        markdown(
            "sparse-csr",
            """
## 2. 从非零计数构造 CSR

对每条短信只记录实际出现的词。CSR 的 `indptr[i]:indptr[i+1]` 给出第 `i` 行在 `indices` 和 `data` 中的窗口，不需要扫描整行词表。
""",
        ),
        code(
            "sparse-build-csr",
            """
rows, columns, values = [], [], []
for row_index, tokens in enumerate(documents):
    counts = Counter(token for token in tokens if token in token_to_column)
    for token in sorted(counts, key=token_to_column.__getitem__):
        rows.append(row_index)
        columns.append(token_to_column[token])
        values.append(float(counts[token]))

counts_csr = sparse.csr_matrix(
    (values, (rows, columns)),
    shape=(len(documents), len(vocabulary)),
    dtype=np.float64,
)
counts_csr.sort_indices()

df = np.asarray((counts_csr > 0).sum(axis=0)).ravel()
idf = np.log((1 + counts_csr.shape[0]) / (1 + df)) + 1
tfidf = counts_csr.multiply(idf).tocsr()
row_norms = np.sqrt(np.asarray(tfidf.multiply(tfidf).sum(axis=1)).ravel())
safe_norms = np.where(row_norms == 0, 1.0, row_norms)
tfidf = sparse.diags(1 / safe_norms) @ tfidf
tfidf = tfidf.tocsr()

print("shape =", list(tfidf.shape))
print("nnz =", tfidf.nnz)
print("indptr length =", len(tfidf.indptr))
print("all non-empty row norms ≈ 1:", np.max(np.abs(np.sqrt(np.asarray(tfidf.multiply(tfidf).sum(axis=1)).ravel())[row_norms > 0] - 1)))
""",
        ),
        markdown(
            "sparse-costs",
            """
## 3. Dense 与 CSR 的真实存储差距

Dense `float64` 会给每个“短信 × token”位置分配 8 字节。CSR 只保存非零值、列索引和行指针。下面用 NumPy/SciPy 数组真实的 `nbytes` 计算，不把索引开销藏起来。
""",
        ),
        code(
            "sparse-storage",
            """
dense_bytes = tfidf.shape[0] * tfidf.shape[1] * np.dtype(np.float64).itemsize
csr_bytes = tfidf.data.nbytes + tfidf.indices.nbytes + tfidf.indptr.nbytes
density = tfidf.nnz / (tfidf.shape[0] * tfidf.shape[1])
compression = dense_bytes / csr_bytes

print(f"density = {density:.8f} ({density * 100:.5f}%)")
print(f"dense float64 = {dense_bytes / 1024**2:.3f} MiB")
print(f"CSR arrays = {csr_bytes / 1024**2:.3f} MiB")
print(f"dense / CSR = {compression:.2f}x")
""",
        ),
        markdown(
            "sparse-matvec",
            """
## 4. 手动扫描一行，与库运算对齐

下面对固定行手动遍历 `indptr` 窗口，计算和一个确定性向量的点积，再与 SciPy 的矩阵向量乘法结果比较。
""",
        ),
        code(
            "sparse-manual-check",
            """
probe = np.sin(np.arange(tfidf.shape[1], dtype=float) * 0.017)
row_index = 17
start, end = tfidf.indptr[row_index], tfidf.indptr[row_index + 1]
manual = 0.0
for entry_index in range(start, end):
    manual += tfidf.data[entry_index] * probe[tfidf.indices[entry_index]]
library = float((tfidf @ probe)[row_index])
manual_difference = abs(manual - library)

top_df_columns = np.argsort(-df, kind="stable")[:8]
top_document_frequency = [
    {"token": vocabulary[int(column)], "documents": int(df[int(column)])}
    for column in top_df_columns
]
print(f"row {row_index} window = [{start}, {end}) · entries = {end - start}")
print(f"manual = {manual:.12f} · SciPy = {library:.12f}")
print(f"absolute difference = {manual_difference:.3e}")
print("highest document-frequency tokens =", top_document_frequency)
""",
        ),
        code(
            "sparse-summary",
            """
summary = {
    "contractVersion": "numerical-methods-batch-2-v1",
    "outputId": "sms-sparse-summary",
    "datasetSha256": EXPECTED_SHA256,
    "rows": int(tfidf.shape[0]),
    "columns": int(tfidf.shape[1]),
    "nnz": int(tfidf.nnz),
    "density": float(density),
    "averageNonzerosPerRow": float(tfidf.nnz / tfidf.shape[0]),
    "denseBytesFloat64": int(dense_bytes),
    "csrBytes": int(csr_bytes),
    "denseToCsrRatio": float(compression),
    "manualRow": {
        "rowIndex": row_index,
        "start": int(start),
        "end": int(end),
        "entries": int(end - start),
        "manualDot": float(manual),
        "libraryDot": float(library),
        "absoluteDifference": float(manual_difference),
    },
    "topDocumentFrequency": top_document_frequency,
    "labelCounts": {key: int(value) for key, value in sms["label"].value_counts().sort_index().items()},
}

output_dir = Path(os.environ.get("ML_ATLAS_NUMERICAL_BATCH2_OUTPUT_DIR", "batch-2-outputs"))
output_dir.mkdir(parents=True, exist_ok=True)
(output_dir / "sms-sparse-summary.json").write_text(
    json.dumps(summary, ensure_ascii=False, indent=2, allow_nan=False) + "\\n",
    encoding="utf-8",
)
print(json.dumps(summary, ensure_ascii=False, indent=2))
""",
        ),
    ])


def pca_notebook(dataset_sha: str) -> nbformat.NotebookNode:
    return notebook([
        markdown(
            "pca-intro",
            """
# PCA：用 Ames 房屋特征重新建立坐标轴

本 Notebook 复用前三章的 Ames 数值快照。PCA 只读取八个房屋特征，不读取标签来决定主方向。流程固定为：派生房龄、标准化、SVD、解释方差、投影与重建。
""",
        ),
        code(
            "pca-imports",
            f"""
from pathlib import Path
import hashlib
import json
import os

import numpy as np
import pandas as pd

EXPECTED_SHA256 = "{dataset_sha}"
FEATURES = [
    "overall_quality",
    "first_floor_sqft",
    "second_floor_sqft",
    "living_area_sqft",
    "basement_sqft",
    "garage_cars",
    "garage_area_sqft",
    "house_age_at_sale",
]

def locate_dataset():
    candidates = [
        Path("ames-housing-numeric.csv"),
        Path(os.environ["ML_ATLAS_AMES_DATA_PATH"]) if os.environ.get("ML_ATLAS_AMES_DATA_PATH") else None,
        Path("public/datasets/numerical-methods/ames-housing-numeric.csv"),
    ]
    for candidate in candidates:
        if candidate is not None and candidate.is_file():
            return candidate
    raise FileNotFoundError("Place ames-housing-numeric.csv beside this Notebook or set ML_ATLAS_AMES_DATA_PATH")

dataset_path = locate_dataset()
observed_sha = hashlib.sha256(dataset_path.read_bytes()).hexdigest()
assert observed_sha == EXPECTED_SHA256
ames = pd.read_csv(dataset_path)
ames["house_age_at_sale"] = ames["year_sold"] - ames["year_built"]
print(f"dataset={{dataset_path.name}} · rows={{len(ames)}} · sha256={{observed_sha[:12]}}…")
""",
        ),
        markdown(
            "pca-standardize",
            """
## 1. 中心化还不够：先统一量纲

房屋质量是 1–10 分，面积是平方英尺，房龄是年。若只减均值，面积的数值尺度会主导方差。这里对每列做总体标准化 `Z=(F-μ)/σ`，让 PCA 比较相关结构而不是单位大小。
""",
        ),
        code(
            "pca-build-design",
            """
F = ames[FEATURES].to_numpy(dtype=float)
means = F.mean(axis=0)
scales = F.std(axis=0, ddof=0)
assert np.all(scales > 0)
Z = (F - means) / scales

print("shape =", list(Z.shape))
print("max |column mean| =", np.max(np.abs(Z.mean(axis=0))))
print("max |column std - 1| =", np.max(np.abs(Z.std(axis=0, ddof=0) - 1)))
""",
        ),
        markdown(
            "pca-svd",
            """
## 2. SVD 给出主方向和方向强度

`Z = U Σ Vᵀ`。`Vᵀ` 的每一行是一个主方向；`σ²/(n-1)` 是该方向上的样本方差。解释方差比只比较这些方差在总方差中的占比。
""",
        ),
        code(
            "pca-factor",
            """
U, singular_values, Vt = np.linalg.svd(Z, full_matrices=False)
component_variance = singular_values**2 / (len(Z) - 1)
explained_ratio = component_variance / component_variance.sum()
cumulative_ratio = np.cumsum(explained_ratio)
k90 = int(np.searchsorted(cumulative_ratio, 0.90) + 1)

covariance = Z.T @ Z / (len(Z) - 1)
covariance_eigenvalues = np.linalg.eigvalsh(covariance)[::-1]
spectral_difference = float(np.max(np.abs(component_variance - covariance_eigenvalues)))

print("singular values =", np.round(singular_values, 6).tolist())
print("explained variance ratio =", np.round(explained_ratio, 8).tolist())
print("cumulative ratio =", np.round(cumulative_ratio, 8).tolist())
print("components for at least 90% =", k90)
print(f"max |SVD variance - covariance eigenvalue| = {spectral_difference:.3e}")
""",
        ),
        markdown(
            "pca-loadings",
            """
## 3. 新坐标轴是原始特征的线性组合

载荷的绝对值越大，表示该原始标准化特征对当前主方向贡献越大。符号只表示轴的方向；整条主方向同时乘以 `-1` 仍是同一个 PCA 轴。
""",
        ),
        code(
            "pca-loadings-table",
            """
def strongest_loadings(component_index, count=4):
    loading = Vt[component_index]
    order = np.argsort(-np.abs(loading), kind="stable")[:count]
    return [
        {"feature": FEATURES[int(index)], "loading": float(loading[int(index)])}
        for index in order
    ]

pc1_loadings = strongest_loadings(0)
pc2_loadings = strongest_loadings(1)
print("PC1 strongest loadings =", pc1_loadings)
print("PC2 strongest loadings =", pc2_loadings)
""",
        ),
        markdown(
            "pca-reconstruct",
            """
## 4. 保留几个主成分，就是保留多少结构

投影 `scores = Z V_k`，重建 `Z_hat = scores V_kᵀ`。下面比较只保留 2 个方向与达到至少 90% 累积解释方差所需方向的标准化重建 RMSE。
""",
        ),
        code(
            "pca-reconstruction",
            """
def reconstruct(kept_components):
    basis = Vt[:kept_components].T
    scores = Z @ basis
    reconstructed = scores @ basis.T
    rmse = float(np.sqrt(np.mean((Z - reconstructed) ** 2)))
    return scores, reconstructed, rmse

scores_two, reconstructed_two, rmse_two = reconstruct(2)
scores_90, reconstructed_90, rmse_90 = reconstruct(k90)
formula_rmse_two = float(np.sqrt(np.sum(singular_values[2:] ** 2) / Z.size))
rmse_formula_difference = abs(rmse_two - formula_rmse_two)

print(f"2 components: explained = {cumulative_ratio[1]:.8f} · standardized RMSE = {rmse_two:.8f}")
print(f"{k90} components: explained = {cumulative_ratio[k90 - 1]:.8f} · standardized RMSE = {rmse_90:.8f}")
print(f"reconstruction RMSE formula difference = {rmse_formula_difference:.3e}")
""",
        ),
        code(
            "pca-summary",
            """
summary = {
    "contractVersion": "numerical-methods-batch-2-v1",
    "outputId": "ames-pca-summary",
    "datasetSha256": EXPECTED_SHA256,
    "rows": int(Z.shape[0]),
    "columns": int(Z.shape[1]),
    "features": FEATURES,
    "singularValues": [float(value) for value in singular_values],
    "explainedVarianceRatio": [float(value) for value in explained_ratio],
    "cumulativeExplainedVariance": [float(value) for value in cumulative_ratio],
    "componentsForAtLeast90Percent": k90,
    "twoComponentExplainedVariance": float(cumulative_ratio[1]),
    "twoComponentStandardizedRmse": rmse_two,
    "k90StandardizedRmse": rmse_90,
    "spectralDifference": spectral_difference,
    "reconstructionFormulaDifference": float(rmse_formula_difference),
    "pc1StrongestLoadings": pc1_loadings,
    "pc2StrongestLoadings": pc2_loadings,
}

output_dir = Path(os.environ.get("ML_ATLAS_NUMERICAL_BATCH2_OUTPUT_DIR", "batch-2-outputs"))
output_dir.mkdir(parents=True, exist_ok=True)
(output_dir / "ames-pca-summary.json").write_text(
    json.dumps(summary, ensure_ascii=False, indent=2, allow_nan=False) + "\\n",
    encoding="utf-8",
)
print(json.dumps(summary, ensure_ascii=False, indent=2))
""",
        ),
    ])


def execute_notebook(
    source_notebook: nbformat.NotebookNode,
    destination: Path,
    working_directory: Path,
) -> None:
    client = NotebookClient(
        source_notebook,
        timeout=180,
        kernel_name="python3",
        allow_errors=False,
        record_timing=False,
        resources={"metadata": {"path": str(working_directory)}},
    )
    client.execute(cwd=str(working_directory))
    destination.write_text(nbformat.writes(source_notebook), encoding="utf-8")


def validate_summary(path: Path, output_id: str, dataset_sha: str) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if value.get("contractVersion") != CONTRACT_VERSION:
        raise ValueError(f"Unexpected contract in {path}")
    if value.get("outputId") != output_id:
        raise ValueError(f"Unexpected output id in {path}")
    if value.get("datasetSha256") != dataset_sha:
        raise ValueError(f"Unexpected dataset hash in {path}")

    def assert_finite(item: Any, key_path: str = "root") -> None:
        if isinstance(item, float) and not (item == item and abs(item) != float("inf")):
            raise ValueError(f"Non-finite number at {key_path}")
        if isinstance(item, list):
            for index, nested in enumerate(item):
                assert_finite(nested, f"{key_path}[{index}]")
        if isinstance(item, dict):
            for key, nested in item.items():
                assert_finite(nested, f"{key_path}.{key}")

    assert_finite(value)
    return value


def artifact_entry(path: Path, public_path: str, **extra: Any) -> dict[str, Any]:
    return {
        **extra,
        "publicPath": public_path,
        "sha256": sha256_file(path),
        "bytes": path.stat().st_size,
    }


def execute_transaction() -> tuple[Path, Path, Path]:
    sms_manifest = json.loads(SMS_MANIFEST_PATH.read_text(encoding="utf-8"))
    ames_manifest = json.loads(AMES_MANIFEST_PATH.read_text(encoding="utf-8"))
    sms_sha = sms_manifest["file"]["sha256"]
    ames_sha = ames_manifest["file"]["sha256"]
    if sha256_file(SMS_DATASET_PATH) != sms_sha or sha256_file(AMES_DATASET_PATH) != ames_sha:
        raise ValueError("Committed dataset does not match its manifest")

    token = uuid.uuid4().hex
    transaction_dir = Path(tempfile.mkdtemp(prefix=f"ml-atlas-batch2-{token}-", dir=NOTEBOOK_DIR))
    sparse_temp = NOTEBOOK_DIR / f".{SPARSE_NOTEBOOK_PATH.name}.{token}.tmp"
    pca_temp = NOTEBOOK_DIR / f".{PCA_NOTEBOOK_PATH.name}.{token}.tmp"
    previous_output = os.environ.get("ML_ATLAS_NUMERICAL_BATCH2_OUTPUT_DIR")
    previous_sms = os.environ.get("ML_ATLAS_SMS_DATA_PATH")
    previous_ames = os.environ.get("ML_ATLAS_AMES_DATA_PATH")
    previous_path = os.environ.get("PATH", "")
    try:
        os.environ["ML_ATLAS_NUMERICAL_BATCH2_OUTPUT_DIR"] = str(transaction_dir)
        os.environ["ML_ATLAS_SMS_DATA_PATH"] = str(SMS_DATASET_PATH)
        os.environ["ML_ATLAS_AMES_DATA_PATH"] = str(AMES_DATASET_PATH)
        os.environ["PATH"] = f"{Path(sys.executable).parent}{os.pathsep}{previous_path}"

        execute_notebook(sparse_notebook(sms_sha), sparse_temp, REPO_ROOT)
        execute_notebook(pca_notebook(ames_sha), pca_temp, REPO_ROOT)
        sparse_summary = validate_summary(transaction_dir / SPARSE_OUTPUT_FILE, "sms-sparse-summary", sms_sha)
        pca_summary = validate_summary(transaction_dir / PCA_OUTPUT_FILE, "ames-pca-summary", ames_sha)
        if sparse_summary["rows"] != 5574 or sparse_summary["nnz"] <= sparse_summary["rows"]:
            raise ValueError("Unexpected sparse summary shape")
        if pca_summary["rows"] != 2927 or pca_summary["columns"] != 8:
            raise ValueError("Unexpected PCA summary shape")

        manifest = {
            "contractVersion": CONTRACT_VERSION,
            "datasets": [
                {"id": "sms-spam", "publicPath": sms_manifest["file"]["publicPath"], "sha256": sms_sha},
                {"id": "ames-housing-numeric", "publicPath": ames_manifest["file"]["publicPath"], "sha256": ames_sha},
            ],
            "generator": {
                "path": "scripts/numerical-methods/generate-batch-2-notebooks.py",
                "sha256": sha256_file(GENERATOR_PATH),
            },
            "requirements": {
                "publicPath": "/notebooks/numerical-methods/requirements.txt",
                "sha256": sha256_file(REQUIREMENTS_PATH),
            },
            "notebooks": [
                artifact_entry(sparse_temp, "/notebooks/numerical-methods/sparse-matrices-sms.zh-CN.ipynb", moduleId="sparse-matrices"),
                artifact_entry(pca_temp, "/notebooks/numerical-methods/pca-ames.zh-CN.ipynb", moduleId="pca"),
            ],
            "outputs": [
                artifact_entry(transaction_dir / SPARSE_OUTPUT_FILE, f"/notebooks/numerical-methods/batch-2-outputs/{SPARSE_OUTPUT_FILE}", outputId="sms-sparse-summary"),
                artifact_entry(transaction_dir / PCA_OUTPUT_FILE, f"/notebooks/numerical-methods/batch-2-outputs/{PCA_OUTPUT_FILE}", outputId="ames-pca-summary"),
            ],
        }
        (transaction_dir / "manifest.json").write_bytes(json_bytes(manifest))
        return transaction_dir, sparse_temp, pca_temp
    except Exception:
        shutil.rmtree(transaction_dir, ignore_errors=True)
        sparse_temp.unlink(missing_ok=True)
        pca_temp.unlink(missing_ok=True)
        raise
    finally:
        for key, previous in (
            ("ML_ATLAS_NUMERICAL_BATCH2_OUTPUT_DIR", previous_output),
            ("ML_ATLAS_SMS_DATA_PATH", previous_sms),
            ("ML_ATLAS_AMES_DATA_PATH", previous_ames),
        ):
            if previous is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = previous
        os.environ["PATH"] = previous_path


def compare_committed(transaction_dir: Path, sparse_temp: Path, pca_temp: Path) -> None:
    differences: list[str] = []
    for current, generated in ((SPARSE_NOTEBOOK_PATH, sparse_temp), (PCA_NOTEBOOK_PATH, pca_temp)):
        if not current.is_file() or current.read_bytes() != generated.read_bytes():
            differences.append(str(current.relative_to(REPO_ROOT)))
    generated_files = {path.relative_to(transaction_dir) for path in transaction_dir.rglob("*") if path.is_file()}
    committed_files = {path.relative_to(OUTPUT_DIR) for path in OUTPUT_DIR.rglob("*") if path.is_file()} if OUTPUT_DIR.is_dir() else set()
    for relative_path in sorted(generated_files | committed_files):
        generated = transaction_dir / relative_path
        current = OUTPUT_DIR / relative_path
        if not generated.is_file() or not current.is_file() or generated.read_bytes() != current.read_bytes():
            differences.append(str(current.relative_to(REPO_ROOT)))
    if differences:
        raise RuntimeError(f"Committed Batch 2 artifacts differ: {', '.join(differences)}")


def validate_standalone(
    notebook_path: Path,
    dataset_path: Path,
    dataset_filename: str,
    output_filename: str,
    output_id: str,
    dataset_sha: str,
    data_environment_key: str,
) -> None:
    temporary_dir = Path(tempfile.mkdtemp(prefix="ml-atlas-batch2-download-"))
    standalone_output = temporary_dir / "outputs"
    previous_output = os.environ.get("ML_ATLAS_NUMERICAL_BATCH2_OUTPUT_DIR")
    previous_data = os.environ.pop(data_environment_key, None)
    previous_path = os.environ.get("PATH", "")
    try:
        shutil.copy2(dataset_path, temporary_dir / dataset_filename)
        downloaded = nbformat.read(notebook_path, as_version=4)
        os.environ["ML_ATLAS_NUMERICAL_BATCH2_OUTPUT_DIR"] = str(standalone_output)
        os.environ["PATH"] = f"{Path(sys.executable).parent}{os.pathsep}{previous_path}"
        client = NotebookClient(
            downloaded,
            timeout=180,
            kernel_name="python3",
            allow_errors=False,
            record_timing=False,
            resources={"metadata": {"path": str(temporary_dir)}},
        )
        client.execute(cwd=str(temporary_dir))
        validate_summary(standalone_output / output_filename, output_id, dataset_sha)
    finally:
        if previous_output is None:
            os.environ.pop("ML_ATLAS_NUMERICAL_BATCH2_OUTPUT_DIR", None)
        else:
            os.environ["ML_ATLAS_NUMERICAL_BATCH2_OUTPUT_DIR"] = previous_output
        if previous_data is not None:
            os.environ[data_environment_key] = previous_data
        os.environ["PATH"] = previous_path
        shutil.rmtree(temporary_dir, ignore_errors=True)


def publish(transaction_dir: Path, sparse_temp: Path, pca_temp: Path) -> None:
    token = uuid.uuid4().hex
    output_backup = NOTEBOOK_DIR / f".batch-2-outputs.{token}.bak"
    sparse_backup = NOTEBOOK_DIR / f".{SPARSE_NOTEBOOK_PATH.name}.{token}.bak"
    pca_backup = NOTEBOOK_DIR / f".{PCA_NOTEBOOK_PATH.name}.{token}.bak"
    try:
        if OUTPUT_DIR.exists():
            OUTPUT_DIR.rename(output_backup)
        transaction_dir.rename(OUTPUT_DIR)
        if SPARSE_NOTEBOOK_PATH.exists():
            SPARSE_NOTEBOOK_PATH.rename(sparse_backup)
        sparse_temp.rename(SPARSE_NOTEBOOK_PATH)
        if PCA_NOTEBOOK_PATH.exists():
            PCA_NOTEBOOK_PATH.rename(pca_backup)
        pca_temp.rename(PCA_NOTEBOOK_PATH)
    except Exception:
        if OUTPUT_DIR.exists() and output_backup.exists():
            shutil.rmtree(OUTPUT_DIR, ignore_errors=True)
        if output_backup.exists():
            output_backup.rename(OUTPUT_DIR)
        for current, backup in ((SPARSE_NOTEBOOK_PATH, sparse_backup), (PCA_NOTEBOOK_PATH, pca_backup)):
            if current.exists() and backup.exists():
                current.unlink(missing_ok=True)
            if backup.exists():
                backup.rename(current)
        raise
    finally:
        shutil.rmtree(output_backup, ignore_errors=True)
        sparse_backup.unlink(missing_ok=True)
        pca_backup.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Regenerate and compare without publishing")
    args = parser.parse_args()
    NOTEBOOK_DIR.mkdir(parents=True, exist_ok=True)
    transaction_dir, sparse_temp, pca_temp = execute_transaction()
    try:
        sms_sha = json.loads(SMS_MANIFEST_PATH.read_text(encoding="utf-8"))["file"]["sha256"]
        ames_sha = json.loads(AMES_MANIFEST_PATH.read_text(encoding="utf-8"))["file"]["sha256"]
        if args.check:
            compare_committed(transaction_dir, sparse_temp, pca_temp)
            validate_standalone(
                sparse_temp, SMS_DATASET_PATH, "sms-spam.csv", SPARSE_OUTPUT_FILE,
                "sms-sparse-summary", sms_sha, "ML_ATLAS_SMS_DATA_PATH",
            )
            validate_standalone(
                pca_temp, AMES_DATASET_PATH, "ames-housing-numeric.csv", PCA_OUTPUT_FILE,
                "ames-pca-summary", ames_sha, "ML_ATLAS_AMES_DATA_PATH",
            )
            print("Batch 2 notebook artifacts are current and standalone downloads rerun successfully.")
        else:
            publish(transaction_dir, sparse_temp, pca_temp)
            print(f"Published {SPARSE_NOTEBOOK_PATH.relative_to(REPO_ROOT)}")
            print(f"Published {PCA_NOTEBOOK_PATH.relative_to(REPO_ROOT)}")
            print(f"Published {OUTPUT_DIR.relative_to(REPO_ROOT)}")
    finally:
        if transaction_dir.exists():
            shutil.rmtree(transaction_dir, ignore_errors=True)
        sparse_temp.unlink(missing_ok=True)
        pca_temp.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
