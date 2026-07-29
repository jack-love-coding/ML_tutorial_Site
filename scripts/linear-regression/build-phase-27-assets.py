#!/usr/bin/env python3
"""Verify and prepare the staging-only Phase 27 linear-regression asset shell."""

from __future__ import annotations

import argparse
import csv
import contextlib
import hashlib
import json
import math
import os
import platform
import re
import shutil
import subprocess
import sys
import sysconfig
import tempfile
import uuid
import venv
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterator


REPO_ROOT = Path(__file__).resolve().parents[2]
REQUIREMENTS_PATH = REPO_ROOT / "scripts/linear-regression/requirements.txt"
INHERITED_REQUIREMENTS_PATH = REPO_ROOT / "scripts/loss-functions/requirements.txt"
ENVIRONMENT_CONTRACT_PATH = (
    REPO_ROOT / "scripts/linear-regression/environment-contract.json"
)
SOURCE_BRIDGE_PATH = REPO_ROOT / "scripts/linear-regression/verify-bike-source.mjs"
SOURCE_CSV_PATH = (
    REPO_ROOT / "public/datasets/python-data-tools/bike-sharing-hour.csv"
)
SOURCE_DICTIONARY_PATH = (
    REPO_ROOT / "public/datasets/python-data-tools/data-dictionary.json"
)
DEFAULT_WHEEL_CACHE = REPO_ROOT / ".cache/numerical-methods/batch-4-wheelhouse"
DEFAULT_STAGING_ROOT = REPO_ROOT / ".cache/linear-regression/phase-27-staging"
DEFAULT_PUBLIC_ROOT = REPO_ROOT / "public"
WHEEL_CACHE_MANIFEST_NAME = "batch-4-wheel-cache-manifest.json"

CONTRACT_VERSION = "linear-regression-phase-27-v1"
ENVIRONMENT_CONTRACT_VERSION = "linear-regression-phase-27-environment-v1"
SOURCE_CONTRACT_VERSION = "linear-regression-bike-source-v1"
SOURCE_SHA256 = "e03de4ee4ef4dc376ac6e04bf829673c6269e8eba5c60fa121640fa2f829504f"
SOURCE_ROWS = 17_379
SPLIT_INDEX = 13_903
FEATURE_ORDER = ("temp", "hum", "windspeed", "workingday", "hr")
CONTINUOUS_FEATURES = ("temp", "hum", "windspeed", "hr")
NOTEBOOK_LOCALES = ("zh-CN", "en")
CANDIDATE_STAGING_IGNORE_ENTRY = "/.cache/linear-regression/phase-27-staging"
EXPECTED_CANDIDATE_FILES = (
    "notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb",
    "notebooks/linear-regression/bike-linear-regression.en.ipynb",
    "notebooks/linear-regression/linear-regression-summary.json",
    "notebooks/linear-regression/gradient-descent-trace.csv",
    "notebooks/linear-regression/coefficients.csv",
    "notebooks/linear-regression/heldout-residuals.csv",
    "notebooks/linear-regression/requirements.txt",
    "notebooks/linear-regression/environment.json",
    "notebooks/linear-regression/output-manifest.json",
)
EXPECTED_ENVIRONMENT_PINS = {
    "numpy": "2.4.6",
    "pandas": "3.0.3",
    "scipy": "1.17.1",
    "nbformat": "5.10.4",
    "nbclient": "0.11.0",
    "jupyterlab": "4.6.1",
    "ipykernel": "7.3.0",
    "scikit-learn": "1.9.0",
}
SUMMARY_CONTRACT_VERSION = "linear-regression-phase-27-summary-v1"
CANDIDATE_CONTRACT_VERSION = "linear-regression-phase-27-candidate-v1"
SELECTION_RULE_VERSION = "bike-linear-regression-teaching-rows-v1"
METHOD_TOLERANCE = 1e-6
GD_LEARNING_RATE = 0.1
GD_MAX_UPDATES = 5_000
GD_GRADIENT_TOLERANCE = 1e-8
RIDGE_ALPHA = 300.0
LASSO_ALPHA = 0.1
EXPECTED_REFERENCE_WEIGHTS = (
    62.7238909530,
    -37.1164156021,
    0.8094458662,
    2.3797186778,
    47.9014338433,
)
EXPECTED_REFERENCE_INTERCEPT = 173.0103284947
EXPECTED_TEST_METRICS = {
    "mse": 40_142.538619,
    "mae": 135.296640,
    "r2": 0.174252,
}
IMPORT_NAMES = {
    "numpy": "numpy",
    "pandas": "pandas",
    "scipy": "scipy",
    "nbformat": "nbformat",
    "nbclient": "nbclient",
    "jupyterlab": "jupyterlab",
    "ipykernel": "ipykernel",
    "scikit-learn": "sklearn",
}


class Phase27Error(RuntimeError):
    """Fail-closed Phase 27 asset error."""


@dataclass(frozen=True)
class NotebookCodeCell:
    cell_id: str
    source: str


@dataclass(frozen=True)
class NotebookJob:
    locale: str
    notebook_path: str
    proof_id: str
    fresh_kernel: bool = True
    execution_count_starts_at: int = 1
    allow_errors: bool = False
    timeout_seconds: int = 180
    record_timing: bool = False
    working_directory: str = "notebooks/linear-regression"
    kernel_name_published: bool = False
    strip_widget_state: bool = True


@dataclass
class CandidateTransaction:
    root: Path

    def __enter__(self) -> CandidateTransaction:
        self.root = validate_candidate_staging_root(self.root)
        _remove_candidate_root(self.root)
        self.root.mkdir(parents=True, exist_ok=False)
        return self

    def __exit__(self, exception_type, exception, traceback) -> bool:
        if exception_type is not None:
            _remove_candidate_root(self.root)
        return False


@dataclass(frozen=True)
class IsolatedEnvironment:
    root: Path
    python: Path
    kernel_name: str
    kernel_prefix: Path
    environment: dict[str, str]
    observed_versions: dict[str, str]


SHARED_CODE_CELLS = (
    NotebookCodeCell(
        "imports-and-contract",
        """from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

FEATURE_ORDER = ("temp", "hum", "windspeed", "workingday", "hr")
CONTINUOUS_FEATURES = ("temp", "hum", "windspeed", "hr")
SPLIT_INDEX = 13_903
DATASET_PATH = Path("../../datasets/python-data-tools/bike-sharing-hour.csv")""",
    ),
    NotebookCodeCell(
        "load-local-source",
        """frame = pd.read_csv(DATASET_PATH)
assert len(frame) == 17_379
assert tuple(frame.columns) == (
    "instant", "dteday", "season", "yr", "mnth", "hr", "holiday",
    "weekday", "workingday", "weathersit", "temp", "atemp", "hum",
    "windspeed", "casual", "registered", "cnt",
)
assert np.array_equal(frame["casual"] + frame["registered"], frame["cnt"])""",
    ),
    NotebookCodeCell(
        "split-and-scale-shell",
        """train = frame.iloc[:SPLIT_INDEX].copy()
held_out = frame.iloc[SPLIT_INDEX:].copy()
scaler = StandardScaler()
X_train_continuous = scaler.fit_transform(train.loc[:, CONTINUOUS_FEATURES])
X_held_out_continuous = scaler.transform(held_out.loc[:, CONTINUOUS_FEATURES])
# Plan 27-03 materializes X_train and X_held_out in canonical FEATURE_ORDER.""",
    ),
    NotebookCodeCell(
        "normal-equation-shell",
        """# Conceptual relation: theta = pinv(X_tilde) @ y
# Executable reference: numpy.linalg.lstsq avoids an explicit matrix inverse.
X_tilde = np.column_stack([np.ones(len(X_train)), X_train])
theta, *_ = np.linalg.lstsq(X_tilde, y_train, rcond=None)
b = theta[0]
w = theta[1:]
sklearn_model = LinearRegression(fit_intercept=True)""",
    ),
    NotebookCodeCell(
        "deterministic-row-roles",
        """TEACHING_ROW_INSTANTS = {
    "representative-training-row": 11_550,
    "negative-prediction": 17_213,
    "morning-peak-underprediction": 15_628,
    "evening-peak-underprediction": 14_965,
    "large-residual": 15_604,
}""",
    ),
)

MARKDOWN_BY_LOCALE = {
    "zh-CN": {
        "title": (
            "# Bike Sharing 线性回归\n"
            "本 Notebook 只读取仓库内已验证的 17,379 行快照，并使用固定时间顺序划分。"
        ),
        "source-boundary": (
            "## 同一数据、同一特征顺序\n"
            "主设计矩阵固定为 temp、hum、windspeed、workingday、hr。"
            "casual 与 registered 因为满足 casual + registered = cnt，必须排除。"
        ),
        "normal-equation": (
            "## 正规方程与稳定实现\n"
            "概念映射为 `X_tilde = [1, X]`、`theta = pinv(X_tilde) @ y`、"
            "`theta[0] = b`、`theta[1:] = w`。代码使用 `numpy.linalg.lstsq`，"
            "避免显式求逆并提高数值稳定性。三种方法的角色分别是 NumPy batch "
            "gradient descent、正规方程数值参考和 scikit-learn LinearRegression。"
        ),
        "row-roles": (
            "## 可复核记录\n"
            "普通训练行、负预测、早高峰低估、晚高峰低估和大残差记录都由固定筛选规则"
            "与最低 instant 并列规则确定；完整计算与输出由 Plan 27-03 生成。"
        ),
        "handoff": (
            "## 下一步\n"
            "此共享代码壳冻结数据、公式、变量和角色；Plan 27-03 在同一壳内完成三方法"
            "拟合、完整表格和两个独立内核执行。"
        ),
    },
    "en": {
        "title": (
            "# Bike Sharing linear regression\n"
            "This Notebook reads only the verified 17,379-row repository snapshot and "
            "uses the fixed chronological split."
        ),
        "source-boundary": (
            "## One source and one feature order\n"
            "The primary design is temp, hum, windspeed, workingday, hr. "
            "casual and registered are excluded because casual + registered = cnt."
        ),
        "normal-equation": (
            "## Normal equation and stable implementation\n"
            "The conceptual mapping is `X_tilde = [1, X]`, "
            "`theta = pinv(X_tilde) @ y`, `theta[0] = b`, and `theta[1:] = w`. "
            "The code uses `numpy.linalg.lstsq` instead of an explicit inverse for "
            "numerical stability. The three roles are NumPy batch gradient descent, "
            "the normal equation numerical reference, and scikit-learn LinearRegression."
        ),
        "row-roles": (
            "## Auditable rows\n"
            "The ordinary training row, negative prediction, morning and evening peak "
            "underpredictions, and large residual use deterministic filters and the "
            "lowest-instant tie-break. Plan 27-03 generates their complete results."
        ),
        "handoff": (
            "## Next step\n"
            "This shared shell freezes source, formula, variables, and row roles. "
            "Plan 27-03 completes all three fits, full tables, and two independent kernels."
        ),
    },
}

CELL_ORDER = (
    ("markdown", "title"),
    ("code", "imports-and-contract"),
    ("markdown", "source-boundary"),
    ("code", "load-local-source"),
    ("code", "split-and-scale-shell"),
    ("markdown", "normal-equation"),
    ("code", "normal-equation-shell"),
    ("markdown", "row-roles"),
    ("code", "deterministic-row-roles"),
    ("markdown", "handoff"),
)

TEACHING_ROWS = (
    {
        "role": "representative-training-row",
        "instant": 11_550,
        "partition": "train",
        "rule": (
            "inclusive training cnt IQR, minimum absolute base-OLS residual, "
            "lowest instant tie-break"
        ),
    },
    {
        "role": "negative-prediction",
        "instant": 17_213,
        "partition": "held-out",
        "rule": "minimum raw-count prediction, lowest instant tie-break",
    },
    {
        "role": "morning-peak-underprediction",
        "instant": 15_628,
        "partition": "held-out",
        "rule": (
            "hr 7-9, maximum positive actual - prediction, lowest instant tie-break"
        ),
    },
    {
        "role": "evening-peak-underprediction",
        "instant": 14_965,
        "partition": "held-out",
        "rule": (
            "hr 16-19, maximum positive actual - prediction, lowest instant tie-break"
        ),
    },
    {
        "role": "large-residual",
        "instant": 15_604,
        "partition": "held-out",
        "rule": (
            "exclude prior named rows, maximum absolute residual, lowest instant tie-break"
        ),
    },
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _reject_json_constant(value: str) -> None:
    raise Phase27Error(f"Non-finite JSON constant is forbidden: {value}")


def read_strict_json(path: Path) -> Any:
    try:
        return json.loads(
            path.read_text(encoding="utf-8"),
            parse_constant=_reject_json_constant,
        )
    except (OSError, json.JSONDecodeError) as error:
        raise Phase27Error(f"Invalid JSON at {path}: {error}") from error


def strict_json_bytes(value: Any) -> bytes:
    return (
        json.dumps(
            value,
            ensure_ascii=False,
            indent=2,
            sort_keys=True,
            allow_nan=False,
        )
        + "\n"
    ).encode("utf-8")


def validate_notebook_code_cells(
    code_cells: tuple[NotebookCodeCell, ...],
) -> None:
    if not code_cells:
        raise Phase27Error("The shared Notebook blueprint requires code cells")
    forbidden_patterns = (
        (r"\brequests\b|\burllib\b|\bsocket\b", "network"),
        (r"https?://|archive\.ics\.uci\.edu|fetch_ucirepo", "remote URL"),
        (r"(?:^|\n)\s*[!%]\s*(?:pip|conda|uv)\b", "shell install"),
        (r"\bsubprocess\b|\bos\.system\b|\bPopen\b", "shell command"),
        (r"<script\b|javascript:|display\s*\(\s*HTML", "raw HTML/script"),
        (r"<iframe\b", "uncontrolled iframe"),
        (r"\bipywidgets\b|\bwidget_state\b", "widget state"),
    )
    seen_ids: set[str] = set()
    for cell in code_cells:
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", cell.cell_id):
            raise Phase27Error(f"Invalid Notebook code-cell ID: {cell.cell_id!r}")
        if cell.cell_id in seen_ids:
            raise Phase27Error(f"Duplicate Notebook code-cell ID: {cell.cell_id}")
        if not cell.source.strip():
            raise Phase27Error(f"Notebook code cell {cell.cell_id} is empty")
        seen_ids.add(cell.cell_id)
        for pattern, label in forbidden_patterns:
            if re.search(pattern, cell.source, flags=re.IGNORECASE):
                raise Phase27Error(
                    f"Notebook code cell {cell.cell_id} contains forbidden {label}"
                )


def build_notebook_blueprint(locale: str) -> list[dict[str, str]]:
    if locale not in NOTEBOOK_LOCALES:
        raise Phase27Error(f"Unsupported Notebook locale: {locale}")
    validate_notebook_code_cells(SHARED_CODE_CELLS)
    if tuple(MARKDOWN_BY_LOCALE) != NOTEBOOK_LOCALES:
        raise Phase27Error("Markdown locale order drifted")
    markdown_ids = tuple(MARKDOWN_BY_LOCALE[NOTEBOOK_LOCALES[0]])
    if any(tuple(MARKDOWN_BY_LOCALE[item]) != markdown_ids for item in NOTEBOOK_LOCALES):
        raise Phase27Error("Locale markdown dictionaries must use identical cell IDs")
    code = {cell.cell_id: cell.source.strip() for cell in SHARED_CODE_CELLS}
    expected_ids = set(code) | set(markdown_ids)
    ordered_ids = [cell_id for _, cell_id in CELL_ORDER]
    if len(ordered_ids) != len(set(ordered_ids)) or set(ordered_ids) != expected_ids:
        raise Phase27Error("Notebook ordered cell inventory drifted")
    return [
        {
            "id": cell_id,
            "kind": kind,
            "source": (
                code[cell_id]
                if kind == "code"
                else MARKDOWN_BY_LOCALE[locale][cell_id].strip()
            ),
        }
        for kind, cell_id in CELL_ORDER
    ]


def candidate_jobs() -> tuple[NotebookJob, ...]:
    return tuple(
        NotebookJob(
            locale=locale,
            notebook_path=(
                f"notebooks/linear-regression/bike-linear-regression.{locale}.ipynb"
            ),
            proof_id=f"clean-kernel-bike-linear-regression-{locale}",
        )
        for locale in NOTEBOOK_LOCALES
    )


def candidate_contract_snapshot() -> dict[str, Any]:
    if (
        len(EXPECTED_CANDIDATE_FILES) != 9
        or len(set(EXPECTED_CANDIDATE_FILES)) != 9
    ):
        raise Phase27Error("Candidate inventory must contain exactly nine unique members")
    for relative_path in EXPECTED_CANDIDATE_FILES:
        path = Path(relative_path)
        if path.is_absolute() or ".." in path.parts or path.as_posix() != relative_path:
            raise Phase27Error(f"Unsafe candidate inventory path: {relative_path}")
    jobs = candidate_jobs()
    if len({job.proof_id for job in jobs}) != 2:
        raise Phase27Error("Two locale jobs require distinct fresh-kernel proofs")
    return {
        "contractVersion": CONTRACT_VERSION,
        "inventory": {
            "paths": list(EXPECTED_CANDIDATE_FILES),
            "locales": list(NOTEBOOK_LOCALES),
            "partialSelectionAllowed": False,
            "publicationAllowed": False,
        },
        "features": {
            "order": list(FEATURE_ORDER),
            "continuous": list(CONTINUOUS_FEATURES),
            "binaryUnscaled": ["workingday"],
            "collinearityOnly": ["atemp"],
            "leakageExcluded": ["casual", "registered"],
        },
        "split": {
            "kind": "chronological-first-80-percent",
            "index": SPLIT_INDEX,
            "trainRows": SPLIT_INDEX,
            "testRows": SOURCE_ROWS - SPLIT_INDEX,
        },
        "teachingRows": list(TEACHING_ROWS),
        "blueprints": {
            locale: build_notebook_blueprint(locale) for locale in NOTEBOOK_LOCALES
        },
        "executionJobs": [
            {
                "locale": job.locale,
                "notebookPath": job.notebook_path,
                "proofId": job.proof_id,
                "freshKernel": job.fresh_kernel,
                "executionCountStartsAt": job.execution_count_starts_at,
                "allowErrors": job.allow_errors,
                "timeoutSeconds": job.timeout_seconds,
                "recordTiming": job.record_timing,
                "workingDirectory": job.working_directory,
                "kernelNamePublished": job.kernel_name_published,
                "stripWidgetState": job.strip_widget_state,
            }
            for job in jobs
        ],
    }


def validate_candidate_staging_root(staging_root: Path) -> Path:
    if str(staging_root).startswith(("http://", "https://")):
        raise Phase27Error("Remote candidate staging roots are forbidden")
    resolved = staging_root.resolve()
    public_root = DEFAULT_PUBLIC_ROOT.resolve()
    if resolved == public_root or resolved.is_relative_to(public_root):
        raise Phase27Error("Candidate generation cannot target public/")
    if resolved != DEFAULT_STAGING_ROOT.resolve():
        raise Phase27Error(
            "Candidate staging root must resolve exactly to "
            ".cache/linear-regression/phase-27-staging"
        )
    if staging_root.is_symlink():
        raise Phase27Error("Candidate staging root may not be a symlink")
    ignore_entries = {
        line.strip()
        for line in (REPO_ROOT / ".gitignore").read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    }
    if CANDIDATE_STAGING_IGNORE_ENTRY not in ignore_entries:
        raise Phase27Error("The exact Phase 27 staging root is not ignored")
    return resolved


def read_environment_pins(path: Path = REQUIREMENTS_PATH) -> dict[str, str]:
    if not path.is_file():
        raise Phase27Error(f"Missing exact environment requirements: {path}")
    pins: dict[str, str] = {}
    for line_number, raw_line in enumerate(
        path.read_text(encoding="utf-8").splitlines(),
        start=1,
    ):
        if not raw_line or raw_line.count("==") != 1:
            raise Phase27Error(
                f"Requirement line {line_number} is not one exact pin: {raw_line!r}"
            )
        name, version = raw_line.split("==", 1)
        normalized = name.lower()
        if not name or not version or normalized in pins:
            raise Phase27Error(f"Invalid requirement line {line_number}: {raw_line!r}")
        pins[normalized] = version
    if pins != EXPECTED_ENVIRONMENT_PINS:
        raise Phase27Error("Phase 27 exact environment pins drifted")
    if (
        path.resolve() == REQUIREMENTS_PATH.resolve()
        and path.read_bytes() != INHERITED_REQUIREMENTS_PATH.read_bytes()
    ):
        raise Phase27Error("Phase 27 requirements drifted from inherited audited bytes")
    return pins


def python_identity() -> dict[str, str]:
    return {
        "implementation": platform.python_implementation(),
        "version": platform.python_version(),
        "cacheTag": sys.implementation.cache_tag or "",
    }


def platform_identity() -> dict[str, str]:
    return {
        "system": platform.system(),
        "machine": platform.machine(),
        "pythonPlatform": sysconfig.get_platform(),
    }


def validate_environment_contract(
    contract_path: Path = ENVIRONMENT_CONTRACT_PATH,
    wheel_cache: Path = DEFAULT_WHEEL_CACHE,
) -> dict[str, Any]:
    contract = read_strict_json(contract_path)
    if contract.get("contractVersion") != ENVIRONMENT_CONTRACT_VERSION:
        raise Phase27Error("Phase 27 environment contract version drifted")
    pins = read_environment_pins()
    expected_requirements = {
        "path": "scripts/linear-regression/requirements.txt",
        "sha256": sha256_file(REQUIREMENTS_PATH),
        "sourcePath": "scripts/loss-functions/requirements.txt",
        "sourceSha256": sha256_file(INHERITED_REQUIREMENTS_PATH),
        "pins": pins,
    }
    if contract.get("requirements") != expected_requirements:
        raise Phase27Error("Environment requirements identity or pin table drifted")
    current_python = python_identity()
    current_platform = platform_identity()
    if contract.get("python") != current_python or contract.get("platform") != current_platform:
        raise Phase27Error("Environment Python/platform identity drifted")
    if contract.get("installation") != {
        "networkAccess": False,
        "pipArguments": [
            "--no-index",
            "--find-links=<audited-wheel-cache>",
            "--requirement=scripts/linear-regression/requirements.txt",
        ],
    }:
        raise Phase27Error("Environment installation must remain no-index and offline")
    if contract.get("execution") != {
        "jobCount": 2,
        "allowErrors": False,
        "timeoutSeconds": 180,
        "recordTiming": False,
        "workingDirectory": "notebooks/linear-regression",
        "executionCountStartsAt": 1,
        "temporaryKernelNamePublished": False,
        "stripWidgetState": True,
    }:
        raise Phase27Error("Environment execution identity drifted")

    wheel_contract = contract.get("wheelCache", {})
    manifest_path = wheel_cache.resolve() / WHEEL_CACHE_MANIFEST_NAME
    if (
        wheel_contract.get("path")
        != ".cache/numerical-methods/batch-4-wheelhouse"
        or wheel_contract.get("manifest") != WHEEL_CACHE_MANIFEST_NAME
        or wheel_contract.get("sourceContractVersion")
        != "numerical-methods-batch-4-v1"
        or not manifest_path.is_file()
    ):
        raise Phase27Error("Audited wheel-cache identity drifted")
    if sha256_file(manifest_path) != wheel_contract.get("manifestSha256"):
        raise Phase27Error("Audited wheel-cache manifest SHA-256 drifted")
    manifest = read_strict_json(manifest_path)
    if (
        manifest.get("contractVersion") != wheel_contract.get("sourceContractVersion")
        or manifest.get("requirements", {}).get("sha256")
        != sha256_file(INHERITED_REQUIREMENTS_PATH)
        or manifest.get("requirements", {}).get("pins") != pins
        or manifest.get("python") != current_python
        or manifest.get("platform") != current_platform
    ):
        raise Phase27Error("Audited wheel-cache source identity drifted")
    wheel_entries = manifest.get("wheels")
    if (
        not isinstance(wheel_entries, list)
        or len(wheel_entries) != wheel_contract.get("wheelCount")
        or len(wheel_entries) != 99
    ):
        raise Phase27Error("Audited wheel-cache count drifted")
    expected_names: set[str] = set()
    for entry in wheel_entries:
        if not isinstance(entry, dict) or not isinstance(entry.get("file"), str):
            raise Phase27Error("Audited wheel-cache entry is invalid")
        path = wheel_cache.resolve() / entry["file"]
        expected_names.add(path.name)
        if (
            not path.is_file()
            or path.stat().st_size != entry.get("bytes")
            or sha256_file(path) != entry.get("sha256")
        ):
            raise Phase27Error(f"Audited wheel artifact drifted: {path.name}")
    if {path.name for path in wheel_cache.resolve().glob("*.whl")} != expected_names:
        raise Phase27Error("Audited wheel cache has added or missing wheel artifacts")
    return {
        "pins": pins,
        "python": current_python,
        "platform": current_platform,
        "wheelCount": len(wheel_entries),
        "installation": "pip --no-index --find-links=<audited-wheel-cache>",
    }


def run_command(
    command: list[str],
    *,
    environment: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[str]:
    completed = subprocess.run(
        command,
        cwd=REPO_ROOT,
        env=environment,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    if completed.returncode != 0:
        raise Phase27Error(
            f"Command failed ({completed.returncode}): {' '.join(command)}\n"
            f"{completed.stdout}"
        )
    return completed


def isolated_environment_variables(root: Path) -> dict[str, str]:
    environment = os.environ.copy()
    environment.update(
        {
            "PIP_NO_INDEX": "1",
            "PIP_DISABLE_PIP_VERSION_CHECK": "1",
            "PIP_NO_INPUT": "1",
            "JUPYTER_PATH": str(root / "kernel-prefix/share/jupyter"),
            "JUPYTER_CONFIG_DIR": str(root / "jupyter-config"),
            "JUPYTER_RUNTIME_DIR": str(root / "jupyter-runtime"),
            "IPYTHONDIR": str(root / "ipython"),
            "PIP_CACHE_DIR": str(root / "pip-cache"),
            "XDG_CACHE_HOME": str(root / "xdg-cache"),
            "PYTHONDONTWRITEBYTECODE": "1",
        }
    )
    for key in ("JUPYTER_CONFIG_DIR", "JUPYTER_RUNTIME_DIR", "IPYTHONDIR"):
        Path(environment[key]).mkdir(parents=True, exist_ok=True)
    return environment


def _install_loopback_only_network_guard(
    root: Path,
    environment: dict[str, str],
) -> None:
    guard_root = root / "network-guard"
    guard_root.mkdir(parents=True, exist_ok=False)
    guard_source = r'''
import ipaddress
import socket


class OfflineNetworkError(RuntimeError):
    pass


def _is_loopback(host):
    if host in {"localhost", "localhost.localdomain"}:
        return True
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False


def _check(address):
    if isinstance(address, str):
        return
    if not isinstance(address, tuple) or not address or not _is_loopback(address[0]):
        raise OfflineNetworkError(f"Network access blocked during Phase 27: {address!r}")


_create_connection = socket.create_connection
_connect = socket.socket.connect
_connect_ex = socket.socket.connect_ex
_getaddrinfo = socket.getaddrinfo


def guarded_create_connection(address, *args, **kwargs):
    _check(address)
    return _create_connection(address, *args, **kwargs)


def guarded_connect(instance, address):
    _check(address)
    return _connect(instance, address)


def guarded_connect_ex(instance, address):
    _check(address)
    return _connect_ex(instance, address)


def guarded_getaddrinfo(host, *args, **kwargs):
    if host is not None and not _is_loopback(host):
        raise OfflineNetworkError(f"DNS/network access blocked during Phase 27: {host!r}")
    return _getaddrinfo(host, *args, **kwargs)


socket.create_connection = guarded_create_connection
socket.socket.connect = guarded_connect
socket.socket.connect_ex = guarded_connect_ex
socket.getaddrinfo = guarded_getaddrinfo
'''.lstrip()
    (guard_root / "sitecustomize.py").write_text(
        guard_source,
        encoding="utf-8",
        newline="\n",
    )
    environment["PYTHONPATH"] = str(guard_root)
    environment["ML_ATLAS_PHASE27_NETWORK_BLOCKED"] = "1"


def isolated_venv_python(root: Path) -> Path:
    return root / ("Scripts/python.exe" if os.name == "nt" else "bin/python")


def verify_isolated_imports_and_kernel(
    python: Path,
    pins: dict[str, str],
    kernel_name: str,
    environment: dict[str, str],
) -> dict[str, str]:
    payload = json.dumps(
        {"pins": pins, "imports": IMPORT_NAMES, "kernelName": kernel_name}
    )
    code = r'''
import importlib
import importlib.metadata
import json
import os
from pathlib import Path
import sys
from jupyter_client.kernelspec import KernelSpecManager

payload = json.loads(os.environ["ML_ATLAS_PHASE27_VERIFY_PAYLOAD"])
observed = {}
for distribution, expected in payload["pins"].items():
    importlib.import_module(payload["imports"][distribution])
    version = importlib.metadata.version(distribution)
    if version != expected:
        raise RuntimeError(f"{distribution}: expected {expected}, observed {version}")
    observed[distribution] = version

manager = KernelSpecManager()
spec = manager.get_kernel_spec(payload["kernelName"])
if Path(spec.argv[0]).resolve() != Path(sys.executable).resolve():
    raise RuntimeError(f"Kernel interpreter drift: {spec.argv[0]} != {sys.executable}")
print(json.dumps({"versions": observed, "kernelName": payload["kernelName"]}, sort_keys=True))
'''
    worker_environment = environment.copy()
    worker_environment["ML_ATLAS_PHASE27_VERIFY_PAYLOAD"] = payload
    output = run_command(
        [str(python), "-c", code],
        environment=worker_environment,
    ).stdout.strip().splitlines()
    if not output:
        raise Phase27Error("Isolated environment verification produced no result")
    result = json.loads(output[-1])
    if result.get("kernelName") != kernel_name or result.get("versions") != pins:
        raise Phase27Error("Isolated environment package or kernel identity drifted")
    return result["versions"]


@contextlib.contextmanager
def isolated_environment(
    wheel_cache: Path = DEFAULT_WHEEL_CACHE,
) -> Iterator[IsolatedEnvironment]:
    verified = validate_environment_contract(wheel_cache=wheel_cache)
    temporary = tempfile.TemporaryDirectory(prefix="ml-atlas-phase27-environment-")
    root = Path(temporary.name)
    python = isolated_venv_python(root / "venv")
    kernel_prefix = root / "kernel-prefix"
    kernel_name = f"ml-atlas-phase27-{uuid.uuid4().hex}"
    environment = isolated_environment_variables(root)
    _install_loopback_only_network_guard(root, environment)
    try:
        venv.EnvBuilder(
            with_pip=True,
            clear=True,
            symlinks=(os.name != "nt"),
        ).create(root / "venv")
        run_command(
            [
                str(python),
                "-m",
                "pip",
                "install",
                "--no-index",
                f"--find-links={wheel_cache.resolve()}",
                "--requirement",
                str(REQUIREMENTS_PATH),
            ],
            environment=environment,
        )
        run_command(
            [
                str(python),
                "-m",
                "ipykernel",
                "install",
                "--prefix",
                str(kernel_prefix),
                "--name",
                kernel_name,
                "--display-name",
                "ML Atlas Phase 27 Isolated Kernel",
            ],
            environment=environment,
        )
        observed = verify_isolated_imports_and_kernel(
            python,
            verified["pins"],
            kernel_name,
            environment,
        )
        yield IsolatedEnvironment(
            root=root,
            python=python,
            kernel_name=kernel_name,
            kernel_prefix=kernel_prefix,
            environment=environment,
            observed_versions=observed,
        )
    finally:
        temporary.cleanup()


def verify_environment(wheel_cache: Path = DEFAULT_WHEEL_CACHE) -> None:
    temporary_root: Path | None = None
    with isolated_environment(wheel_cache) as isolated:
        temporary_root = isolated.root
        if isolated.observed_versions != EXPECTED_ENVIRONMENT_PINS:
            raise Phase27Error("Isolated environment package versions drifted")
    if temporary_root is None or temporary_root.exists():
        raise Phase27Error("Temporary venv, kernelspec, or Jupyter state was not removed")
    print(
        "Verified the exact offline Phase 27 environment and removed its temporary "
        "venv, kernelspec, and scoped Jupyter state."
    )


def verify_source_contract() -> dict[str, Any]:
    completed = run_command(["node", str(SOURCE_BRIDGE_PATH)])
    try:
        contract = json.loads(completed.stdout)
    except json.JSONDecodeError as error:
        raise Phase27Error("Bike source bridge emitted invalid JSON") from error
    if (
        contract.get("contractVersion") != SOURCE_CONTRACT_VERSION
        or contract.get("source", {}).get("sha256") != SOURCE_SHA256
        or contract.get("source", {}).get("rows") != SOURCE_ROWS
        or contract.get("schema", {}).get("columnOrder") is None
        or contract.get("features", {}).get("order") != list(FEATURE_ORDER)
        or contract.get("features", {}).get("continuous")
        != list(CONTINUOUS_FEATURES)
        or contract.get("features", {}).get("binaryUnscaled") != ["workingday"]
        or contract.get("features", {}).get("leakageExcluded")
        != ["casual", "registered"]
        or contract.get("split", {}).get("index") != SPLIT_INDEX
        or contract.get("target", {}).get("relationship")
        != "cnt = casual + registered"
        or contract.get("target", {}).get("residualSign") != "prediction - actual"
        or contract.get("boundaryRecords", {}).get("trainEnd", {}).get("instant")
        != "13903"
        or contract.get("boundaryRecords", {}).get("testStart", {}).get("instant")
        != "13904"
    ):
        raise Phase27Error("Bike source bridge identity, split, or feature roles drifted")
    return contract


def load_verified_bike_frame(path: Path = SOURCE_CSV_PATH) -> Any:
    """Load the immutable Bike source after asserting its complete trust contract."""
    try:
        import numpy as np
        import pandas as pd
    except ImportError as error:
        raise Phase27Error(
            "Bike calculations must run inside the audited Phase 27 environment"
        ) from error

    if path.resolve() != SOURCE_CSV_PATH.resolve():
        raise Phase27Error("Bike calculations require the committed source path")
    if not path.is_file() or sha256_file(path) != SOURCE_SHA256:
        raise Phase27Error("Bike source SHA-256 drifted before fitting")
    frame = pd.read_csv(path)
    expected_columns = (
        "instant",
        "dteday",
        "season",
        "yr",
        "mnth",
        "hr",
        "holiday",
        "weekday",
        "workingday",
        "weathersit",
        "temp",
        "atemp",
        "hum",
        "windspeed",
        "casual",
        "registered",
        "cnt",
    )
    if tuple(frame.columns) != expected_columns or len(frame) != SOURCE_ROWS:
        raise Phase27Error("Bike source schema or row count drifted before fitting")
    expected_instants = np.arange(1, SOURCE_ROWS + 1, dtype=np.int64)
    if not np.array_equal(frame["instant"].to_numpy(), expected_instants):
        raise Phase27Error("Bike source row order drifted before fitting")
    if not np.array_equal(
        frame["casual"].to_numpy() + frame["registered"].to_numpy(),
        frame["cnt"].to_numpy(),
    ):
        raise Phase27Error("Bike target relationship drifted before fitting")
    if set(frame["workingday"].unique()) != {0, 1}:
        raise Phase27Error("Bike workingday is no longer an unscaled binary field")
    dictionary = read_strict_json(SOURCE_DICTIONARY_PATH)
    fields = {item.get("name"): item for item in dictionary.get("fields", [])}
    if (
        dictionary.get("version") != "bike-sharing-hour-v1"
        or fields.get("cnt", {}).get("relationship")
        != "cnt = casual + registered"
        or fields.get("workingday", {}).get("type") != "binary-category"
        or any(feature not in fields for feature in FEATURE_ORDER)
    ):
        raise Phase27Error("Bike data dictionary roles drifted before fitting")
    return frame


def make_chronological_split(frame: Any) -> tuple[Any, Any]:
    if len(frame) != SOURCE_ROWS or SPLIT_INDEX != int(len(frame) * 0.8):
        raise Phase27Error("Chronological split size drifted")
    train = frame.iloc[:SPLIT_INDEX].copy()
    held_out = frame.iloc[SPLIT_INDEX:].copy()
    train_end = train.iloc[-1]
    test_start = held_out.iloc[0]
    if (
        int(train_end["instant"]) != 13_903
        or str(train_end["dteday"]) != "2012-08-07"
        or int(train_end["hr"]) != 11
        or int(test_start["instant"]) != 13_904
        or str(test_start["dteday"]) != "2012-08-07"
        or int(test_start["hr"]) != 12
    ):
        raise Phase27Error("Chronological split boundary rows drifted")
    return train, held_out


def fit_training_scaler(train: Any) -> dict[str, Any]:
    try:
        import numpy as np
        from sklearn.preprocessing import StandardScaler
    except ImportError as error:
        raise Phase27Error("Train-only scaling requires the audited environment") from error

    scaler = StandardScaler()
    values = train.loc[:, list(CONTINUOUS_FEATURES)].to_numpy(dtype=float)
    scaler.fit(values)
    if (
        not np.isfinite(scaler.mean_).all()
        or not np.isfinite(scaler.scale_).all()
        or np.any(scaler.scale_ <= 0)
    ):
        raise Phase27Error("Train-only scaler emitted invalid statistics")
    return {
        "scaler": scaler,
        "means": {
            feature: float(scaler.mean_[index])
            for index, feature in enumerate(CONTINUOUS_FEATURES)
        },
        "scales": {
            feature: float(scaler.scale_[index])
            for index, feature in enumerate(CONTINUOUS_FEATURES)
        },
    }


def build_model_matrix(frame: Any, scaler_contract: dict[str, Any]) -> Any:
    try:
        import numpy as np
    except ImportError as error:
        raise Phase27Error("Model-matrix construction requires NumPy") from error

    if "workingday" in scaler_contract["means"] or "workingday" in scaler_contract["scales"]:
        raise Phase27Error("workingday must never enter the scaler contract")
    continuous = scaler_contract["scaler"].transform(
        frame.loc[:, list(CONTINUOUS_FEATURES)].to_numpy(dtype=float)
    )
    continuous_index = {
        feature: index for index, feature in enumerate(CONTINUOUS_FEATURES)
    }
    columns = []
    for feature in FEATURE_ORDER:
        if feature == "workingday":
            column = frame["workingday"].to_numpy(dtype=float)
            if not np.isin(column, [0.0, 1.0]).all():
                raise Phase27Error("workingday must remain binary and unscaled")
        else:
            column = continuous[:, continuous_index[feature]]
        columns.append(column)
    matrix = np.column_stack(columns)
    if (
        matrix.shape != (len(frame), len(FEATURE_ORDER))
        or not np.isfinite(matrix).all()
    ):
        raise Phase27Error("Canonical model matrix is malformed or non-finite")
    return matrix


def _metric_record(actual: Any, prediction: Any) -> dict[str, float]:
    try:
        import numpy as np
        from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    except ImportError as error:
        raise Phase27Error("Regression metrics require the audited environment") from error

    values = {
        "mse": float(mean_squared_error(actual, prediction)),
        "mae": float(mean_absolute_error(actual, prediction)),
        "r2": float(r2_score(actual, prediction)),
    }
    if not np.isfinite(list(values.values())).all():
        raise Phase27Error("Regression metrics became non-finite")
    return values


def _gradient_state(
    matrix: Any,
    targets: Any,
    weights: Any,
    intercept: float,
) -> tuple[float, Any, float, float]:
    try:
        import numpy as np
    except ImportError as error:
        raise Phase27Error("Batch gradient descent requires NumPy") from error

    residuals = matrix @ weights + intercept - targets
    mse = float(np.mean(residuals * residuals))
    weight_gradient = (2.0 / len(matrix)) * (matrix.T @ residuals)
    intercept_gradient = float(2.0 * np.mean(residuals))
    gradient_norm = float(
        np.linalg.norm(np.append(weight_gradient, intercept_gradient))
    )
    if not np.isfinite(
        np.concatenate(
            [
                np.asarray([mse, intercept_gradient, gradient_norm]),
                np.asarray(weight_gradient),
                np.asarray(residuals),
            ]
        )
    ).all():
        raise Phase27Error("Batch gradient descent reached a non-finite state")
    return mse, weight_gradient, intercept_gradient, gradient_norm


def run_numpy_batch_gd(matrix: Any, targets: Any) -> dict[str, Any]:
    try:
        import numpy as np
    except ImportError as error:
        raise Phase27Error("Batch gradient descent requires NumPy") from error

    weights = np.zeros(matrix.shape[1], dtype=float)
    intercept = 0.0
    trace: list[dict[str, Any]] = []
    for update in range(GD_MAX_UPDATES + 1):
        mse, weight_gradient, intercept_gradient, gradient_norm = _gradient_state(
            matrix,
            targets,
            weights,
            intercept,
        )
        trace.append(
            {
                "update": update,
                "mse": mse,
                "gradientNorm": gradient_norm,
                "intercept": float(intercept),
                "weights": [float(value) for value in weights],
            }
        )
        if gradient_norm <= GD_GRADIENT_TOLERANCE:
            if update != 772:
                raise Phase27Error(
                    f"Locked batch GD stop drifted: expected 772, observed {update}"
                )
            return {
                "method": "numpy-batch-gradient-descent",
                "weights": weights.copy(),
                "intercept": float(intercept),
                "updates": update,
                "mse": mse,
                "gradientNorm": gradient_norm,
                "reason": "gradient-tolerance",
                "trace": trace,
            }
        if update == GD_MAX_UPDATES:
            raise Phase27Error("Locked batch GD hit its update cap")
        weights = weights - GD_LEARNING_RATE * weight_gradient
        intercept = float(intercept - GD_LEARNING_RATE * intercept_gradient)
    raise Phase27Error("Batch GD reached an unreachable state")


def fit_lstsq_reference(matrix: Any, targets: Any) -> dict[str, Any]:
    try:
        import numpy as np
    except ImportError as error:
        raise Phase27Error("Least-squares reference requires NumPy") from error

    augmented = np.column_stack([np.ones(len(matrix), dtype=float), matrix])
    theta, residual_sums, rank, singular_values = np.linalg.lstsq(
        augmented,
        targets,
        rcond=None,
    )
    if rank != augmented.shape[1] or not np.isfinite(theta).all():
        raise Phase27Error("Augmented least-squares reference lost rank or finiteness")
    return {
        "method": "numpy-lstsq",
        "weights": theta[1:].copy(),
        "intercept": float(theta[0]),
        "rank": int(rank),
        "singularValues": [float(value) for value in singular_values],
        "conditionNumber": float(np.linalg.cond(augmented)),
        "residualSums": [float(value) for value in residual_sums],
        "predictions": augmented @ theta,
    }


def fit_sklearn_reference(matrix: Any, targets: Any) -> dict[str, Any]:
    try:
        import numpy as np
        from sklearn.linear_model import LinearRegression
    except ImportError as error:
        raise Phase27Error("scikit-learn reference requires the audited environment") from error

    model = LinearRegression(fit_intercept=True)
    model.fit(matrix, targets)
    weights = np.asarray(model.coef_, dtype=float)
    intercept = float(model.intercept_)
    if not np.isfinite(np.append(weights, intercept)).all():
        raise Phase27Error("scikit-learn reference emitted non-finite parameters")
    return {
        "method": "sklearn-linear-regression",
        "model": model,
        "weights": weights,
        "intercept": intercept,
        "rank": int(model.rank_),
        "singularValues": [float(value) for value in model.singular_],
        "predictions": model.predict(matrix),
    }


def compute_method_deltas(
    gd: dict[str, Any],
    lstsq: dict[str, Any],
    sklearn: dict[str, Any],
    held_out_matrix: Any,
) -> dict[str, Any]:
    try:
        import numpy as np
    except ImportError as error:
        raise Phase27Error("Method comparison requires NumPy") from error

    reference_parameters = np.append(lstsq["intercept"], lstsq["weights"])
    reference_predictions = (
        held_out_matrix @ lstsq["weights"] + lstsq["intercept"]
    )
    methods = {}
    for name, result in (
        ("numpyBatchGradientDescent", gd),
        ("numpyLstsq", lstsq),
        ("sklearnLinearRegression", sklearn),
    ):
        parameters = np.append(result["intercept"], result["weights"])
        predictions = held_out_matrix @ result["weights"] + result["intercept"]
        methods[name] = {
            "maxCoefficientDelta": float(
                np.max(np.abs(parameters - reference_parameters))
            ),
            "maxPredictionDelta": float(
                np.max(np.abs(predictions - reference_predictions))
            ),
        }
    max_coefficient_delta = max(
        item["maxCoefficientDelta"] for item in methods.values()
    )
    max_prediction_delta = max(
        item["maxPredictionDelta"] for item in methods.values()
    )
    if (
        max_coefficient_delta > METHOD_TOLERANCE
        or max_prediction_delta > METHOD_TOLERANCE
    ):
        raise Phase27Error(
            "The three unregularized methods exceeded the 1e-6 agreement tolerance"
        )
    return {
        "tolerance": METHOD_TOLERANCE,
        "byMethod": methods,
        "maxCoefficientDelta": max_coefficient_delta,
        "maxPredictionDelta": max_prediction_delta,
        "agrees": True,
    }


def _timestamp(record: Any) -> str:
    return f"{record['dteday']} {int(record['hr']):02d}:00"


def _teaching_row_record(
    frame: Any,
    predictions: Any,
    position: int,
    role: str,
    explanation_en: str,
    explanation_zh: str,
) -> dict[str, Any]:
    record = frame.iloc[position]
    prediction = float(predictions[position])
    actual = float(record["cnt"])
    return {
        "role": role,
        "instant": int(record["instant"]),
        "timestamp": _timestamp(record),
        "hour": int(record["hr"]),
        "actual": actual,
        "prediction": prediction,
        "residual": prediction - actual,
        "explanationRole": {"en": explanation_en, "zh-CN": explanation_zh},
    }


def select_teaching_rows(
    train: Any,
    held_out: Any,
    train_matrix: Any,
    held_out_matrix: Any,
    lstsq: dict[str, Any],
) -> dict[str, Any]:
    try:
        import numpy as np
    except ImportError as error:
        raise Phase27Error("Teaching-row selection requires NumPy") from error

    train_predictions = train_matrix @ lstsq["weights"] + lstsq["intercept"]
    held_predictions = held_out_matrix @ lstsq["weights"] + lstsq["intercept"]
    train_actual = train["cnt"].to_numpy(dtype=float)
    held_actual = held_out["cnt"].to_numpy(dtype=float)
    train_residuals = train_predictions - train_actual
    held_residuals = held_predictions - held_actual
    q1, q3 = np.quantile(train_actual, [0.25, 0.75])
    eligible = np.flatnonzero((train_actual >= q1) & (train_actual <= q3))
    representative_position = min(
        eligible,
        key=lambda position: (
            abs(float(train_residuals[position])),
            int(train.iloc[position]["instant"]),
        ),
    )
    representative = _teaching_row_record(
        train,
        train_predictions,
        int(representative_position),
        "representative-training-row",
        "ordinary training row inside the inclusive target IQR",
        "训练目标四分位区间内的普通训练行",
    )
    transformed = train_matrix[int(representative_position)]
    residual = representative["residual"]
    representative.update(
        {
            "rawFeatures": {
                feature: float(train.iloc[int(representative_position)][feature])
                for feature in FEATURE_ORDER
            },
            "transformedValues": [float(value) for value in transformed],
            "lossContribution": float(residual * residual),
            "unaveragedWeightGradientContribution": [
                float(2.0 * residual * value) for value in transformed
            ],
            "unaveragedInterceptGradientContribution": float(2.0 * residual),
        }
    )

    def lowest_instant(candidates: Any, score: Any, *, maximize: bool) -> int:
        ordered = sorted(
            (int(position) for position in candidates),
            key=lambda position: (
                -float(score[position]) if maximize else float(score[position]),
                int(held_out.iloc[position]["instant"]),
            ),
        )
        if not ordered:
            raise Phase27Error("A required held-out teaching role has no candidates")
        return ordered[0]

    all_positions = np.arange(len(held_out))
    negative_position = lowest_instant(
        all_positions,
        held_predictions,
        maximize=False,
    )
    underprediction = held_actual - held_predictions
    hours = held_out["hr"].to_numpy(dtype=int)
    morning_positions = np.flatnonzero(
        (hours >= 7) & (hours <= 9) & (underprediction > 0)
    )
    morning_position = lowest_instant(
        morning_positions,
        underprediction,
        maximize=True,
    )
    evening_positions = np.flatnonzero(
        (hours >= 16) & (hours <= 19) & (underprediction > 0)
    )
    evening_position = lowest_instant(
        evening_positions,
        underprediction,
        maximize=True,
    )
    excluded = {negative_position, morning_position, evening_position}
    remaining = [position for position in all_positions if position not in excluded]
    large_position = lowest_instant(
        remaining,
        np.abs(held_residuals),
        maximize=True,
    )
    cases = [
        _teaching_row_record(
            held_out,
            held_predictions,
            negative_position,
            "negative-prediction",
            "lowest raw-count prediction",
            "最低原始租车数预测",
        ),
        _teaching_row_record(
            held_out,
            held_predictions,
            morning_position,
            "morning-peak-underprediction",
            "largest positive morning actual-minus-prediction gap",
            "早高峰最大的实际值减预测值正差距",
        ),
        _teaching_row_record(
            held_out,
            held_predictions,
            evening_position,
            "evening-peak-underprediction",
            "largest positive evening actual-minus-prediction gap",
            "晚高峰最大的实际值减预测值正差距",
        ),
        _teaching_row_record(
            held_out,
            held_predictions,
            large_position,
            "large-residual",
            "largest remaining absolute residual",
            "排除前三行后的最大绝对残差",
        ),
    ]
    resolved = [representative["instant"], *[case["instant"] for case in cases]]
    expected = [11_550, 17_213, 15_628, 14_965, 15_604]
    if resolved != expected:
        raise Phase27Error(
            f"Deterministic teaching-row selection drifted: {resolved} != {expected}"
        )
    return {
        "selectionRuleVersion": SELECTION_RULE_VERSION,
        "representativeTrainingRow": representative,
        "namedCases": cases,
    }


def compute_residual_diagnostics(
    held_out: Any,
    predictions: Any,
) -> dict[str, Any]:
    try:
        import numpy as np
        import pandas as pd
    except ImportError as error:
        raise Phase27Error("Held-out diagnostics require the audited environment") from error

    actual = held_out["cnt"].to_numpy(dtype=float)
    residuals = predictions - actual
    diagnostic_frame = pd.DataFrame(
        {
            "hour": held_out["hr"].to_numpy(dtype=int),
            "prediction": predictions,
            "residual": residuals,
            "absoluteResidual": np.abs(residuals),
        }
    )
    hourly = (
        diagnostic_frame.groupby("hour", sort=True)["residual"]
        .mean()
        .reindex(range(24))
    )
    if hourly.isna().any():
        raise Phase27Error("Held-out hourly residual summary lost an hour")
    bin_ids, edges = pd.qcut(
        diagnostic_frame["prediction"],
        q=4,
        labels=False,
        retbins=True,
        duplicates="raise",
    )
    diagnostic_frame["bin"] = bin_ids.astype(int) + 1
    prediction_bins = []
    for bin_id in range(1, 5):
        values = diagnostic_frame.loc[diagnostic_frame["bin"] == bin_id]
        prediction_bins.append(
            {
                "bin": bin_id,
                "lowerPrediction": float(edges[bin_id - 1]),
                "upperPrediction": float(edges[bin_id]),
                "rows": int(len(values)),
                "residualStdDev": float(values["residual"].std(ddof=0)),
                "mae": float(values["absoluteResidual"].mean()),
            }
        )
    return {
        "residualSign": "prediction - actual",
        "hourlyResiduals": [
            {"hour": int(hour), "meanResidual": float(value)}
            for hour, value in hourly.items()
        ],
        "predictionBins": prediction_bins,
    }


def _extended_atemp_matrix(
    frame: Any,
    scaler: Any,
) -> Any:
    try:
        import numpy as np
    except ImportError as error:
        raise Phase27Error("Collinearity comparison requires NumPy") from error

    continuous = ("temp", "atemp", "hum", "windspeed", "hr")
    standardized = scaler.transform(frame.loc[:, list(continuous)].to_numpy(float))
    return np.column_stack(
        [
            standardized[:, 0],
            standardized[:, 1],
            standardized[:, 2],
            standardized[:, 3],
            frame["workingday"].to_numpy(float),
            standardized[:, 4],
        ]
    )


def compute_collinearity_comparison(
    train: Any,
    held_out: Any,
    base_test_mse: float,
) -> dict[str, Any]:
    try:
        import numpy as np
        from sklearn.linear_model import Lasso, LinearRegression, Ridge
        from sklearn.preprocessing import StandardScaler
    except ImportError as error:
        raise Phase27Error("Collinearity comparison requires scikit-learn") from error

    extended_continuous = ("temp", "atemp", "hum", "windspeed", "hr")
    scaler = StandardScaler().fit(
        train.loc[:, list(extended_continuous)].to_numpy(float)
    )
    train_matrix = _extended_atemp_matrix(train, scaler)
    test_matrix = _extended_atemp_matrix(held_out, scaler)
    train_targets = train["cnt"].to_numpy(float)
    test_targets = held_out["cnt"].to_numpy(float)
    ols = LinearRegression(fit_intercept=True).fit(train_matrix, train_targets)
    ridge = Ridge(alpha=RIDGE_ALPHA, fit_intercept=True).fit(
        train_matrix,
        train_targets,
    )
    lasso = Lasso(
        alpha=LASSO_ALPHA,
        fit_intercept=True,
        max_iter=100_000,
        tol=1e-10,
        selection="cyclic",
    ).fit(train_matrix, train_targets)
    row_index = np.arange(len(train_targets), dtype=float)
    perturbation = (
        0.13524512 * np.where((row_index.astype(int) // 24) % 2 == 0, 1.0, -1.0)
        + 0.03349182 * np.linspace(-1.0, 1.0, len(train_targets))
    )
    ols_perturbed = LinearRegression(fit_intercept=True).fit(
        train_matrix,
        train_targets + perturbation,
    )
    ridge_perturbed = Ridge(alpha=RIDGE_ALPHA, fit_intercept=True).fit(
        train_matrix,
        train_targets + perturbation,
    )
    ols_change = float(np.linalg.norm(ols_perturbed.coef_ - ols.coef_))
    ridge_change = float(np.linalg.norm(ridge_perturbed.coef_ - ridge.coef_))
    if ridge_change >= ols_change:
        raise Phase27Error("Locked Ridge stability comparison no longer stabilizes")
    return {
        "addedFeature": "atemp",
        "unchangedContract": [
            "rows",
            "split",
            "target",
            "base-features",
            "preprocessing",
        ],
        "featureOrder": [
            "temp",
            "atemp",
            "hum",
            "windspeed",
            "workingday",
            "hr",
        ],
        "tempAtempTrainingCorrelation": float(
            np.corrcoef(
                train["temp"].to_numpy(float),
                train["atemp"].to_numpy(float),
            )[0, 1]
        ),
        "conditionNumber": float(
            np.linalg.cond(
                np.column_stack([np.ones(len(train_matrix)), train_matrix])
            )
        ),
        "ols": {
            "objective": "mse",
            "weights": [float(value) for value in ols.coef_],
            "intercept": float(ols.intercept_),
            "tempCoefficient": float(ols.coef_[0]),
            "atempCoefficient": float(ols.coef_[1]),
            "testMetrics": _metric_record(
                test_targets,
                ols.predict(test_matrix),
            ),
            "baseTestMse": base_test_mse,
            "perturbationL2": ols_change,
        },
        "ridge": {
            "objective": "mse-plus-l2",
            "alpha": RIDGE_ALPHA,
            "weights": [float(value) for value in ridge.coef_],
            "intercept": float(ridge.intercept_),
            "testMetrics": _metric_record(
                test_targets,
                ridge.predict(test_matrix),
            ),
            "perturbationL2": ridge_change,
        },
        "lasso": {
            "objective": "mse-plus-l1",
            "alpha": LASSO_ALPHA,
            "weights": [float(value) for value in lasso.coef_],
            "intercept": float(lasso.intercept_),
            "testMetrics": _metric_record(
                test_targets,
                lasso.predict(test_matrix),
            ),
            "sameObjectiveAsOls": False,
        },
        "perturbation": {
            "version": "alternating-day-plus-linear-v1",
            "formula": (
                "0.13524512 * alternating_24_row_blocks "
                "+ 0.03349182 * linear_minus_one_to_one"
            ),
        },
    }


def compute_log_target_comparison(
    train_matrix: Any,
    held_out_matrix: Any,
    train_targets: Any,
    held_out_targets: Any,
) -> dict[str, Any]:
    try:
        import numpy as np
        from sklearn.linear_model import LinearRegression
    except ImportError as error:
        raise Phase27Error("log1p comparison requires the audited environment") from error

    model = LinearRegression(fit_intercept=True)
    log_targets = np.log1p(train_targets)
    model.fit(train_matrix, log_targets)
    log_predictions = model.predict(held_out_matrix)
    count_predictions = np.expm1(log_predictions)
    if not np.isfinite(count_predictions).all():
        raise Phase27Error("log1p inverse-transformed predictions became non-finite")
    return {
        "targetTransform": "log1p",
        "inverseTransform": "expm1",
        "coefficientScale": "log1p-rental-count",
        "rawTargetObjectiveComparable": False,
        "logSpaceMetrics": _metric_record(
            np.log1p(held_out_targets),
            log_predictions,
        ),
        "inverseTransformedCountMetrics": _metric_record(
            held_out_targets,
            count_predictions,
        ),
        "weights": [float(value) for value in model.coef_],
        "intercept": float(model.intercept_),
    }


def _convert_coefficients(
    weights: Any,
    intercept: float,
    scaler_contract: dict[str, Any],
) -> dict[str, Any]:
    converted = []
    original_intercept = float(intercept)
    for index, feature in enumerate(FEATURE_ORDER):
        weight = float(weights[index])
        if feature == "workingday":
            converted.append(weight)
            continue
        scale = scaler_contract["scales"][feature]
        mean = scaler_contract["means"][feature]
        converted.append(weight / scale)
        original_intercept -= weight * mean / scale
    if not all(math.isfinite(value) for value in [*converted, original_intercept]):
        raise Phase27Error("Original-unit coefficient conversion became non-finite")
    return {"weights": converted, "intercept": original_intercept}


def compute_complete_candidate_model() -> dict[str, Any]:
    try:
        import numpy as np
    except ImportError as error:
        raise Phase27Error("Candidate calculation requires the audited environment") from error

    frame = load_verified_bike_frame()
    train, held_out = make_chronological_split(frame)
    scaler = fit_training_scaler(train)
    train_matrix = build_model_matrix(train, scaler)
    held_out_matrix = build_model_matrix(held_out, scaler)
    train_targets = train["cnt"].to_numpy(dtype=float)
    held_out_targets = held_out["cnt"].to_numpy(dtype=float)
    lstsq = fit_lstsq_reference(train_matrix, train_targets)
    sklearn = fit_sklearn_reference(train_matrix, train_targets)
    gd = run_numpy_batch_gd(train_matrix, train_targets)
    deltas = compute_method_deltas(gd, lstsq, sklearn, held_out_matrix)
    reference_train_predictions = (
        train_matrix @ lstsq["weights"] + lstsq["intercept"]
    )
    reference_test_predictions = (
        held_out_matrix @ lstsq["weights"] + lstsq["intercept"]
    )
    train_metrics = _metric_record(train_targets, reference_train_predictions)
    test_metrics = _metric_record(held_out_targets, reference_test_predictions)
    for observed, expected in zip(
        [*lstsq["weights"], lstsq["intercept"]],
        [*EXPECTED_REFERENCE_WEIGHTS, EXPECTED_REFERENCE_INTERCEPT],
        strict=True,
    ):
        if abs(float(observed) - expected) > 1e-9:
            raise Phase27Error("Locked least-squares parameter anchor drifted")
    for name, expected in EXPECTED_TEST_METRICS.items():
        if abs(test_metrics[name] - expected) > 1e-6:
            raise Phase27Error(f"Locked held-out {name} anchor drifted")

    selected = select_teaching_rows(
        train,
        held_out,
        train_matrix,
        held_out_matrix,
        lstsq,
    )
    residual_diagnostics = compute_residual_diagnostics(
        held_out,
        reference_test_predictions,
    )
    collinearity = compute_collinearity_comparison(
        train,
        held_out,
        test_metrics["mse"],
    )
    log1p = compute_log_target_comparison(
        train_matrix,
        held_out_matrix,
        train_targets,
        held_out_targets,
    )
    original = _convert_coefficients(
        lstsq["weights"],
        lstsq["intercept"],
        scaler,
    )
    summary = {
        "contractVersion": SUMMARY_CONTRACT_VERSION,
        "source": {
            "path": "datasets/python-data-tools/bike-sharing-hour.csv",
            "sha256": SOURCE_SHA256,
            "rows": SOURCE_ROWS,
            "target": "cnt",
            "targetRelationship": "cnt = casual + registered",
        },
        "features": {
            "order": list(FEATURE_ORDER),
            "continuous": list(CONTINUOUS_FEATURES),
            "binaryUnscaled": ["workingday"],
            "collinearityOnly": ["atemp"],
            "leakageExcluded": ["casual", "registered"],
        },
        "split": {
            "kind": "chronological-first-80-percent",
            "index": SPLIT_INDEX,
            "trainRows": len(train),
            "testRows": len(held_out),
            "trainEnd": {
                "instant": 13_903,
                "timestamp": "2012-08-07 11:00",
            },
            "testStart": {
                "instant": 13_904,
                "timestamp": "2012-08-07 12:00",
            },
        },
        "preprocessing": {
            "fitPartition": "train-only",
            "standardized": list(CONTINUOUS_FEATURES),
            "unscaled": ["workingday"],
            "ddof": 0,
            "means": scaler["means"],
            "scales": scaler["scales"],
        },
        "optimization": {
            "config": {
                "initialization": "zeros",
                "learningRate": GD_LEARNING_RATE,
                "maxUpdates": GD_MAX_UPDATES,
                "gradientTolerance": GD_GRADIENT_TOLERANCE,
            },
            "result": {
                "updates": gd["updates"],
                "reason": gd["reason"],
                "mse": gd["mse"],
                "gradientNorm": gd["gradientNorm"],
                "weights": [float(value) for value in gd["weights"]],
                "intercept": gd["intercept"],
            },
        },
        "methods": {
            "tolerance": METHOD_TOLERANCE,
            "roles": {
                "numpyBatchGradientDescent": (
                    "transparent iterative parameter learning"
                ),
                "normalEquation": "non-iterative numerical reference",
                "scikitLearnLinearRegression": "practical API counterpart",
            },
            "normalEquation": {
                "term": {"en": "normal equation", "zh-CN": "正规方程"},
                "augmentedDesign": "X_tilde = [1, X]",
                "formula": "theta = (X_tilde^T X_tilde)^+ X_tilde^T y",
                "interceptMapping": "theta[0] = b",
                "weightMapping": "theta[1:] = w",
                "implementation": "numpy.linalg.lstsq",
                "rationale": (
                    "Use the stable least-squares solver instead of explicitly "
                    "forming an inverse / 使用稳定最小二乘求解器而非显式求逆"
                ),
                "rank": lstsq["rank"],
                "singularValues": lstsq["singularValues"],
                "conditionNumber": lstsq["conditionNumber"],
                "weights": [float(value) for value in lstsq["weights"]],
                "intercept": lstsq["intercept"],
            },
            "numpyBatchGradientDescent": {
                "weights": [float(value) for value in gd["weights"]],
                "intercept": gd["intercept"],
            },
            "scikitLearnLinearRegression": {
                "fitIntercept": True,
                "weights": [float(value) for value in sklearn["weights"]],
                "intercept": sklearn["intercept"],
                "rank": sklearn["rank"],
                "singularValues": sklearn["singularValues"],
            },
            "agreement": deltas,
        },
        "metrics": {"train": train_metrics, "test": test_metrics},
        "coefficients": {
            "modelSpace": {
                "featureOrder": list(FEATURE_ORDER),
                "weights": [float(value) for value in lstsq["weights"]],
                "intercept": lstsq["intercept"],
            },
            "originalDatasetUnits": {
                "featureOrder": list(FEATURE_ORDER),
                **original,
                "interpretation": (
                    "conditional association holding modeled features fixed; not causal"
                ),
            },
        },
        "selectionRuleVersion": selected["selectionRuleVersion"],
        "representativeTrainingRow": selected["representativeTrainingRow"],
        "diagnostics": {
            "stagedOrder": [
                "optimization-complete",
                "hourly-residual-shape",
                "prediction-bin-spread",
                "named-heldout-cases",
                "coefficient-stability",
                "log1p-comparison",
                "combined-review",
            ],
            **residual_diagnostics,
            "namedCases": selected["namedCases"],
            "collinearity": collinearity,
            "log1p": log1p,
        },
    }
    return {
        "frame": frame,
        "train": train,
        "heldOut": held_out,
        "trainMatrix": train_matrix,
        "heldOutMatrix": held_out_matrix,
        "trainTargets": train_targets,
        "heldOutTargets": held_out_targets,
        "testPredictions": reference_test_predictions,
        "lstsq": lstsq,
        "sklearn": sklearn,
        "gd": gd,
        "summary": summary,
    }


def _format_csv_number(value: Any) -> str:
    number = float(value)
    if not math.isfinite(number):
        raise Phase27Error("Candidate CSV cannot contain a non-finite number")
    return format(number, ".17g")


def _write_csv(
    path: Path,
    fieldnames: list[str],
    rows: list[dict[str, Any]],
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            if set(row) != set(fieldnames):
                raise Phase27Error(f"Candidate CSV row keys drifted for {path.name}")
            writer.writerow(row)


def write_data_candidate_bundle(staging_root: Path) -> dict[str, Any]:
    root = staging_root.resolve()
    model = compute_complete_candidate_model()
    notebook_root = root / "notebooks/linear-regression"
    notebook_root.mkdir(parents=True, exist_ok=True)
    summary_path = notebook_root / "linear-regression-summary.json"
    summary_path.write_bytes(strict_json_bytes(model["summary"]))

    trace_rows = []
    trace_fields = [
        "update",
        "mse",
        "gradient_norm",
        "intercept",
        *FEATURE_ORDER,
    ]
    for point in model["gd"]["trace"]:
        trace_rows.append(
            {
                "update": point["update"],
                "mse": _format_csv_number(point["mse"]),
                "gradient_norm": _format_csv_number(point["gradientNorm"]),
                "intercept": _format_csv_number(point["intercept"]),
                **{
                    feature: _format_csv_number(point["weights"][index])
                    for index, feature in enumerate(FEATURE_ORDER)
                },
            }
        )
    _write_csv(
        notebook_root / "gradient-descent-trace.csv",
        trace_fields,
        trace_rows,
    )

    coefficient_rows: list[dict[str, Any]] = []
    methods = (
        (
            "numpy-batch-gradient-descent",
            model["gd"]["weights"],
            model["gd"]["intercept"],
        ),
        (
            "numpy-lstsq",
            model["lstsq"]["weights"],
            model["lstsq"]["intercept"],
        ),
        (
            "sklearn-linear-regression",
            model["sklearn"]["weights"],
            model["sklearn"]["intercept"],
        ),
    )
    for method, weights, intercept in methods:
        coefficient_rows.append(
            {
                "method": method,
                "space": "model",
                "feature": "intercept",
                "coefficient": _format_csv_number(intercept),
            }
        )
        coefficient_rows.extend(
            {
                "method": method,
                "space": "model",
                "feature": feature,
                "coefficient": _format_csv_number(weights[index]),
            }
            for index, feature in enumerate(FEATURE_ORDER)
        )
    original = model["summary"]["coefficients"]["originalDatasetUnits"]
    coefficient_rows.append(
        {
            "method": "numpy-lstsq",
            "space": "original-dataset-unit",
            "feature": "intercept",
            "coefficient": _format_csv_number(original["intercept"]),
        }
    )
    coefficient_rows.extend(
        {
            "method": "numpy-lstsq",
            "space": "original-dataset-unit",
            "feature": feature,
            "coefficient": _format_csv_number(original["weights"][index]),
        }
        for index, feature in enumerate(FEATURE_ORDER)
    )
    _write_csv(
        notebook_root / "coefficients.csv",
        ["method", "space", "feature", "coefficient"],
        coefficient_rows,
    )

    residual_rows = []
    for (_, record), prediction in zip(
        model["heldOut"].iterrows(),
        model["testPredictions"],
        strict=True,
    ):
        actual = float(record["cnt"])
        residual_rows.append(
            {
                "instant": int(record["instant"]),
                "timestamp": _timestamp(record),
                "hr": int(record["hr"]),
                "actual": _format_csv_number(actual),
                "prediction": _format_csv_number(prediction),
                "residual": _format_csv_number(float(prediction) - actual),
            }
        )
    _write_csv(
        notebook_root / "heldout-residuals.csv",
        ["instant", "timestamp", "hr", "actual", "prediction", "residual"],
        residual_rows,
    )
    return {
        "summary": model["summary"],
        "paths": [
            summary_path,
            notebook_root / "gradient-descent-trace.csv",
            notebook_root / "coefficients.csv",
            notebook_root / "heldout-residuals.csv",
        ],
    }


def _run_isolated_worker(
    isolated: IsolatedEnvironment,
    function_name: str,
    arguments: list[Path],
) -> None:
    payload = json.dumps(
        {
            "generator": str(Path(__file__).resolve()),
            "function": function_name,
            "arguments": [str(argument) for argument in arguments],
        }
    )
    worker = r'''
import importlib.util
import json
import os
from pathlib import Path
import sys

payload = json.loads(os.environ["ML_ATLAS_PHASE27_WORKER_PAYLOAD"])
spec = importlib.util.spec_from_file_location("phase27_worker_module", payload["generator"])
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)
function = getattr(module, payload["function"])
function(*(Path(value) for value in payload["arguments"]))
'''
    environment = isolated.environment.copy()
    environment["ML_ATLAS_PHASE27_WORKER_PAYLOAD"] = payload
    environment["ML_ATLAS_PHASE27_KERNEL_NAME"] = isolated.kernel_name
    run_command(
        [str(isolated.python), "-c", worker],
        environment=environment,
    )


def prepare_data_candidates(
    staging_root: Path = DEFAULT_STAGING_ROOT,
    wheel_cache: Path = DEFAULT_WHEEL_CACHE,
) -> dict[str, Any]:
    root = validate_candidate_staging_root(staging_root)
    try:
        verify_source_contract()
        validate_environment_contract(wheel_cache=wheel_cache)
        with CandidateTransaction(root) as transaction:
            with isolated_environment(wheel_cache) as isolated:
                _run_isolated_worker(
                    isolated,
                    "write_data_candidate_bundle",
                    [transaction.root],
                )
            expected = {
                "notebooks/linear-regression/linear-regression-summary.json",
                "notebooks/linear-regression/gradient-descent-trace.csv",
                "notebooks/linear-regression/coefficients.csv",
                "notebooks/linear-regression/heldout-residuals.csv",
            }
            actual = {
                path.relative_to(transaction.root).as_posix()
                for path in transaction.root.rglob("*")
                if path.is_file()
            }
            if actual != expected:
                raise Phase27Error(
                    f"Intermediate data-candidate inventory drifted: {sorted(actual)}"
                )
        return {
            "stagingRoot": root.relative_to(REPO_ROOT).as_posix(),
            "candidateFilesCreated": 4,
            "publicationAllowed": False,
        }
    except BaseException:
        _remove_candidate_root(root)
        raise


def _remove_candidate_root(root: Path) -> None:
    if root.is_symlink() or root.is_file():
        root.unlink(missing_ok=True)
    elif root.exists():
        shutil.rmtree(root)


def verify_candidate_inventory(
    staging_root: Path,
    *,
    enforce_staging_root: bool = True,
) -> dict[str, Any]:
    root = (
        validate_candidate_staging_root(staging_root)
        if enforce_staging_root
        else staging_root.resolve()
    )
    if not root.is_dir():
        raise Phase27Error("Complete nine-member candidate inventory is missing")
    actual: set[str] = set()
    for path in root.rglob("*"):
        if path.is_symlink():
            raise Phase27Error(f"Candidate symlinks are forbidden: {path}")
        if path.is_file():
            actual.add(path.relative_to(root).as_posix())
    expected = set(EXPECTED_CANDIDATE_FILES)
    if actual != expected:
        raise Phase27Error(
            "Complete nine-member candidate inventory drifted: "
            f"missing={sorted(expected - actual)}, unexpected={sorted(actual - expected)}"
        )
    return {"inventoryCount": len(actual), "paths": sorted(actual)}


def prepare_candidates(
    staging_root: Path = DEFAULT_STAGING_ROOT,
    wheel_cache: Path = DEFAULT_WHEEL_CACHE,
) -> dict[str, Any]:
    root = validate_candidate_staging_root(staging_root)
    try:
        source = verify_source_contract()
        verify_environment(wheel_cache)
        with CandidateTransaction(root):
            snapshot = candidate_contract_snapshot()
        return {
            "stagingRoot": root.relative_to(REPO_ROOT).as_posix(),
            "sourceSha256": source["source"]["sha256"],
            "inventoryCount": len(snapshot["inventory"]["paths"]),
            "candidateFilesCreated": 0,
            "publicationAllowed": False,
        }
    except BaseException:
        _remove_candidate_root(root)
        raise


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group(required=True)
    modes.add_argument("--verify-environment", action="store_true")
    modes.add_argument("--prepare-data-candidates", action="store_true")
    modes.add_argument("--prepare-candidates", action="store_true")
    modes.add_argument("--verify-candidates", action="store_true")
    parser.add_argument("--staging-root", type=Path, default=DEFAULT_STAGING_ROOT)
    parser.add_argument("--wheel-cache", type=Path, default=DEFAULT_WHEEL_CACHE)
    parser.add_argument("--topic")
    parser.add_argument("--locale")
    parser.add_argument("--file")
    parser.add_argument("--offline", action="store_true")
    args = parser.parse_args()

    if not args.offline:
        raise Phase27Error("Every Phase 27 candidate mode requires --offline")
    if args.topic is not None or args.locale is not None or args.file is not None:
        raise Phase27Error(
            "Partial topic, locale, or file selectors are forbidden; "
            "the complete nine-member inventory is indivisible"
        )
    if args.verify_environment:
        verify_environment(args.wheel_cache)
        return
    if args.prepare_data_candidates:
        result = prepare_data_candidates(args.staging_root, args.wheel_cache)
        print(
            "Prepared the finite full-fit Phase 27 data candidates: "
            f"{result['candidateFilesCreated']} files, no public mutation."
        )
        return
    if args.prepare_candidates:
        result = prepare_candidates(args.staging_root, args.wheel_cache)
        print(
            "Prepared only the fresh ignored Phase 27 transaction shell: "
            f"{result['inventoryCount']} declared members, "
            f"{result['candidateFilesCreated']} candidate files, no public mutation."
        )
        return
    verify_source_contract()
    validate_environment_contract(wheel_cache=args.wheel_cache)
    result = verify_candidate_inventory(args.staging_root)
    print(f"Verified the complete {result['inventoryCount']}-member candidate inventory.")


if __name__ == "__main__":
    try:
        main()
    except (Phase27Error, ValueError, OSError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1) from error
