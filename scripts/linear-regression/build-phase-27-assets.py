#!/usr/bin/env python3
"""Verify and prepare the staging-only Phase 27 linear-regression asset shell."""

from __future__ import annotations

import argparse
import contextlib
import hashlib
import json
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
