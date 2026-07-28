#!/usr/bin/env python3
"""Build and verify the fail-closed Phase 26 loss-functions data assets."""

from __future__ import annotations

import argparse
import contextlib
import csv
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
import urllib.request
import uuid
import venv
import zipfile
from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from statistics import median
from typing import Any, Iterator


REPO_ROOT = Path(__file__).resolve().parents[2]
PHASE_DIR = REPO_ROOT / ".planning/phases/26-loss-functions-rebuild"
RESEARCH_PATH = PHASE_DIR / "26-RESEARCH.md"
CONTRACT_PATH = REPO_ROOT / "docs/curriculum-v3/loss-functions/phase-26-data-contract.md"
REQUIREMENTS_PATH = REPO_ROOT / "scripts/loss-functions/requirements.txt"
NUMERICAL_REQUIREMENTS_PATH = (
    REPO_ROOT / "public/notebooks/numerical-methods/requirements.txt"
)
ENVIRONMENT_CONTRACT_PATH = (
    REPO_ROOT / "scripts/loss-functions/environment-contract.json"
)
DEFAULT_WHEEL_CACHE = REPO_ROOT / ".cache/numerical-methods/batch-4-wheelhouse"
WHEEL_CACHE_MANIFEST_NAME = "batch-4-wheel-cache-manifest.json"
CONTRACT_VERSION = "loss-functions-phase-26-v1"
TRANSFORM_VERSION = "phase-26-normalization-v1"
ENVIRONMENT_CONTRACT_VERSION = "loss-functions-phase-26-environment-v1"
APPROVAL_DECISION = "approve-lade"
DEFAULT_SOURCE_CACHE = REPO_ROOT / ".cache/loss-functions/phase-26-sources"
DEFAULT_STAGING_ROOT = REPO_ROOT / ".cache/loss-functions/phase-26-staging"
SOURCE_CACHE_MANIFEST = "source-cache-manifest.json"


class Phase26Error(RuntimeError):
    """Fail-closed Phase 26 asset error."""


@dataclass(frozen=True)
class SourceContract:
    dataset_id: str
    cache_name: str
    download_url: str
    page_url: str
    revision_or_doi: str
    license: str
    attribution: str
    sha256: str
    expected_bytes: int | None = None
    declared_feature_count: int | None = None
    observed_feature_count: int | None = None


@dataclass(frozen=True)
class NotebookCodeCell:
    cell_id: str
    source: str


@dataclass(frozen=True)
class NotebookTopicContract:
    topic_id: str
    code_cells: tuple[NotebookCodeCell, ...]
    markdown_by_locale: dict[str, dict[str, str]]
    cell_order: tuple[tuple[str, str], ...]


@dataclass(frozen=True)
class NotebookExecutionJob:
    topic_id: str
    locale: str
    notebook_path: str
    proof_id: str
    fresh_kernel: bool = True
    execution_count_starts_at: int = 1
    allow_errors: bool = False
    timeout_seconds: int = 180
    record_timing: bool = False
    working_directory: str = "notebooks/loss-functions"
    kernel_name_published: bool = False
    strip_widget_state: bool = True


@dataclass(frozen=True)
class CandidateInventory:
    paths: tuple[str, ...]
    topic_ids: tuple[str, ...]
    locales: tuple[str, ...]
    execution_jobs: tuple[NotebookExecutionJob, ...]


@dataclass(frozen=True)
class CandidateTransaction:
    root: Path
    inventory: CandidateInventory
    execution_jobs: tuple[NotebookExecutionJob, ...]


@dataclass(frozen=True)
class IsolatedEnvironment:
    root: Path
    python: Path
    kernel_name: str
    kernel_prefix: Path
    environment: dict[str, str]
    observed_versions: dict[str, str]


LADE = SourceContract(
    dataset_id="lade-delivery-jilin",
    cache_name="lade-delivery-jilin.csv",
    download_url=(
        "https://huggingface.co/datasets/Cainiao-AI/LaDe/resolve/"
        "be2cec02775cafc8d52230303f32134382bcc50b/delivery/delivery_jl.csv"
    ),
    page_url="https://huggingface.co/datasets/Cainiao-AI/LaDe",
    revision_or_doi="be2cec02775cafc8d52230303f32134382bcc50b",
    license="Apache-2.0",
    attribution="Cainiao-AI LaDe dataset card and the LaDe paper, arXiv:2306.10675",
    sha256="12e2cf4664dd5b4475d39dddee8872f5a03b3082f08f0eece7f103baee6c6e73",
    expected_bytes=4_736_342,
)

SECOM = SourceContract(
    dataset_id="uci-secom",
    cache_name="uci-secom.zip",
    download_url="https://archive.ics.uci.edu/static/public/179/secom.zip",
    page_url="https://archive.ics.uci.edu/dataset/179/secom",
    revision_or_doi="10.24432/C54305",
    license="CC BY 4.0",
    attribution="UCI Machine Learning Repository SECOM dataset, DOI 10.24432/C54305",
    sha256="eea568baf3c2229096d7d294cf0b096b5502bd96d92c0b80a65b84714059be8e",
    declared_feature_count=591,
    observed_feature_count=590,
)

SOURCE_CONTRACTS = (LADE, SECOM)
NOTEBOOK_LOCALES = ("zh-CN", "en")
NOTEBOOK_TOPIC_IDS = ("delivery-losses", "manufacturing-bce-gradients")
CANDIDATE_STAGING_IGNORE_ENTRY = "/.cache/loss-functions/phase-26-staging"
CANDIDATE_PATHS = (
    "datasets/loss-functions/lade-delivery-jilin.csv",
    "datasets/loss-functions/lade-delivery-jilin-manifest.json",
    "datasets/loss-functions/secom-manufacturing.csv",
    "datasets/loss-functions/secom-manufacturing-manifest.json",
    "datasets/loss-functions/ATTRIBUTION.md",
    "notebooks/loss-functions/delivery-losses.zh-CN.ipynb",
    "notebooks/loss-functions/delivery-losses.en.ipynb",
    "notebooks/loss-functions/manufacturing-bce-gradients.zh-CN.ipynb",
    "notebooks/loss-functions/manufacturing-bce-gradients.en.ipynb",
    "notebooks/loss-functions/outputs/regression-loss-summary.json",
    "notebooks/loss-functions/outputs/bce-gradient-summary.json",
    "notebooks/loss-functions/outputs/delivery-losses.png",
    "notebooks/loss-functions/outputs/manufacturing-bce-gradients.png",
    "notebooks/loss-functions/requirements.txt",
    "notebooks/loss-functions/environment.json",
    "notebooks/loss-functions/outputs/manifest.json",
)

DELIVERY_CODE_CELLS = (
    NotebookCodeCell(
        "delivery-imports",
        """from pathlib import Path
import json

import numpy as np
import pandas as pd""",
    ),
    NotebookCodeCell(
        "delivery-loss-functions",
        """def regression_losses(targets, predictions):
    targets = np.asarray(targets, dtype=np.float64)
    predictions = np.asarray(predictions, dtype=np.float64)
    if targets.shape != predictions.shape or targets.ndim != 1 or targets.size == 0:
        raise ValueError("targets and predictions must be equal non-empty vectors")
    if not np.isfinite(targets).all() or not np.isfinite(predictions).all():
        raise ValueError("targets and predictions must be finite")
    residuals = predictions - targets
    squared = residuals ** 2
    absolute = np.abs(residuals)
    return {
        "residuals": residuals,
        "squared": squared,
        "absolute": absolute,
        "mse": float(np.mean(squared)),
        "mae": float(np.mean(absolute)),
    }""",
    ),
    NotebookCodeCell(
        "delivery-local-paths",
        """DATASET_PATH = Path("../../datasets/loss-functions/lade-delivery-jilin.csv")
SUMMARY_PATH = Path("outputs/regression-loss-summary.json")
PLOT_PATH = Path("outputs/delivery-losses.png")""",
    ),
)

MANUFACTURING_CODE_CELLS = (
    NotebookCodeCell(
        "manufacturing-imports",
        """from pathlib import Path
import json

import numpy as np
import pandas as pd""",
    ),
    NotebookCodeCell(
        "manufacturing-stable-bce",
        """def stable_bce_from_logits(logits, targets):
    logits = np.asarray(logits, dtype=np.float64)
    targets = np.asarray(targets, dtype=np.float64)
    if logits.shape != targets.shape or logits.ndim != 1 or logits.size == 0:
        raise ValueError("logits and targets must be equal non-empty vectors")
    if not np.isfinite(logits).all() or not np.isfinite(targets).all():
        raise ValueError("logits and targets must be finite")
    if not np.isin(targets, (0.0, 1.0)).all():
        raise ValueError("targets must be binary")
    losses = np.logaddexp(0.0, logits) - targets * logits
    probabilities = np.empty_like(logits)
    nonnegative = logits >= 0.0
    probabilities[nonnegative] = 1.0 / (1.0 + np.exp(-logits[nonnegative]))
    negative_exponential = np.exp(logits[~nonnegative])
    probabilities[~nonnegative] = negative_exponential / (1.0 + negative_exponential)
    gradients = probabilities - targets
    return losses, gradients, gradients / logits.size""",
    ),
    NotebookCodeCell(
        "manufacturing-central-difference",
        """def coordinate_central_difference(objective, values, index, step):
    values = np.asarray(values, dtype=np.float64)
    if values.ndim != 1 or values.size == 0 or not np.isfinite(values).all():
        raise ValueError("values must be one finite non-empty vector")
    if not 0 <= index < values.size:
        raise IndexError("index is outside the vector")
    if not np.isfinite(step) or step <= 0.0:
        raise ValueError("step must be finite and positive")
    plus = values.copy()
    minus = values.copy()
    plus[index] += step
    minus[index] -= step
    return float((objective(plus) - objective(minus)) / (2.0 * step))""",
    ),
    NotebookCodeCell(
        "manufacturing-local-paths",
        """DATASET_PATH = Path("../../datasets/loss-functions/secom-manufacturing.csv")
SUMMARY_PATH = Path("outputs/bce-gradient-summary.json")
PLOT_PATH = Path("outputs/manufacturing-bce-gradients.png")""",
    ),
)

NOTEBOOK_TOPICS = {
    "delivery-losses": NotebookTopicContract(
        topic_id="delivery-losses",
        code_cells=DELIVERY_CODE_CELLS,
        markdown_by_locale={
            "zh-CN": {
                "delivery-title": "# 配送时长中的 MSE 与 MAE",
                "delivery-method": "使用同一组本地真实数据预测，逐行比较平方误差与绝对误差。",
            },
            "en": {
                "delivery-title": "# MSE and MAE for delivery duration",
                "delivery-method": (
                    "Use one local real-data prediction set to compare squared and absolute "
                    "error row by row."
                ),
            },
        },
        cell_order=(
            ("markdown", "delivery-title"),
            ("code", "delivery-imports"),
            ("markdown", "delivery-method"),
            ("code", "delivery-loss-functions"),
            ("code", "delivery-local-paths"),
        ),
    ),
    "manufacturing-bce-gradients": NotebookTopicContract(
        topic_id="manufacturing-bce-gradients",
        code_cells=MANUFACTURING_CODE_CELLS,
        markdown_by_locale={
            "zh-CN": {
                "manufacturing-title": "# 制造缺陷中的稳定 BCE 与梯度",
                "manufacturing-method": "在本地真实标签与固定 logits 上验证稳定 BCE 和输出梯度。",
            },
            "en": {
                "manufacturing-title": "# Stable BCE and gradients for manufacturing defects",
                "manufacturing-method": (
                    "Verify stable BCE and output gradients on local real labels and fixed logits."
                ),
            },
        },
        cell_order=(
            ("markdown", "manufacturing-title"),
            ("code", "manufacturing-imports"),
            ("markdown", "manufacturing-method"),
            ("code", "manufacturing-stable-bce"),
            ("code", "manufacturing-central-difference"),
            ("code", "manufacturing-local-paths"),
        ),
    ),
}

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

NOTEBOOK_EXECUTION_WORKER_SOURCE = r'''
from nbclient import NotebookClient


def execute_candidate_notebook(notebook, job, kernel_name, working_directory):
    client = NotebookClient(
        notebook,
        timeout=job["timeoutSeconds"],
        kernel_name=kernel_name,
        allow_errors=False,
        record_timing=False,
        resources={"metadata": {"path": str(working_directory)}},
    )
    client.execute(cwd=str(working_directory))

    expected_count = 1
    for cell in notebook.cells:
        cell.metadata.pop("execution", None)
        if cell.cell_type != "code":
            continue
        if cell.execution_count != expected_count:
            raise RuntimeError(
                f"Fresh execution count drift: expected {expected_count}, "
                f"observed {cell.execution_count}"
            )
        expected_count += 1
        for output in cell.get("outputs", []):
            output.get("metadata", {}).pop("execution", None)
            output.pop("transient", None)
    notebook.metadata.pop("widgets", None)
    notebook.metadata["kernelspec"] = {
        "display_name": "Python 3",
        "language": "python",
        "name": "python3",
    }
    notebook.metadata.setdefault("language_info", {})["name"] = "python"
    notebook.metadata["language_info"].pop("version", None)
    return notebook
'''.strip()
LADE_SOURCE_FIELDS = (
    "order_id",
    "region_id",
    "city",
    "courier_id",
    "lng",
    "lat",
    "aoi_id",
    "aoi_type",
    "accept_time",
    "accept_gps_time",
    "accept_gps_lng",
    "accept_gps_lat",
    "delivery_time",
    "delivery_gps_time",
    "delivery_gps_lng",
    "delivery_gps_lat",
    "ds",
)
LADE_PUBLISHED_FIELDS = (
    "course_row_id",
    "source_row_number",
    "city",
    "aoi_type",
    "accept_time",
    "delivery_time",
    "ds",
    "delivery_duration_minutes",
)
LADE_REMOVED_FIELDS = (
    "order_id",
    "region_id",
    "courier_id",
    "lng",
    "lat",
    "aoi_id",
    "accept_gps_time",
    "accept_gps_lng",
    "accept_gps_lat",
    "delivery_gps_time",
    "delivery_gps_lng",
    "delivery_gps_lat",
)
SECOM_ARCHIVE_MEMBERS = ("secom.data", "secom_labels.data", "secom.names")
LADE_EXPECTED_ROWS = 31_415
SECOM_EXPECTED_ROWS = 1_567
SECOM_EXPECTED_LABEL_COUNTS = {-1: 1_463, 1: 104}

RESEARCH_ANCHORS = (
    "## Open Questions (RESOLVED)",
    "2026-07-28 the product owner gave the explicit response `approve-lade`",
    LADE.revision_or_doi,
    LADE.sha256,
    "`courier_id`, GPS coordinates, and precise stop fields",
)

CONTRACT_ANCHORS = (
    f"**Contract version:** `{CONTRACT_VERSION}`",
    f"**Authorization decision:** `{APPROVAL_DECISION}`",
    LADE.download_url,
    LADE.sha256,
    LADE.license,
    LADE.attribution,
    SECOM.download_url,
    SECOM.revision_or_doi,
    SECOM.sha256,
    SECOM.license,
    *LADE_PUBLISHED_FIELDS,
    *LADE_REMOVED_FIELDS,
    "GPS coordinates",
    "precise stop fields",
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def strict_json_bytes(value: Any) -> bytes:
    """Serialize standards JSON and reject bare NaN/Infinity."""

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


def nonfinite_result(status: str) -> dict[str, str | None]:
    if status not in {"inf", "-inf", "nan"}:
        raise Phase26Error(f"Unsupported non-finite status: {status!r}")
    return {"status": status, "value": None}


def _reject_json_constant(value: str) -> None:
    raise Phase26Error(f"Non-finite JSON constant is forbidden: {value}")


def read_strict_json(path: Path) -> Any:
    try:
        return json.loads(
            path.read_text(encoding="utf-8"),
            parse_constant=_reject_json_constant,
        )
    except (OSError, json.JSONDecodeError) as error:
        raise Phase26Error(f"Invalid JSON at {path}: {error}") from error


def validate_notebook_code_cells(code_cells: tuple[NotebookCodeCell, ...]) -> None:
    if not code_cells:
        raise Phase26Error("Each Notebook topic requires at least one shared code cell")
    seen_ids: set[str] = set()
    forbidden_patterns = (
        (r"\brequests\b", "requests/network"),
        (r"\burllib\b", "urllib/network"),
        (r"hugging\s*face|huggingface", "Hugging Face/network"),
        (r"archive\.ics\.uci\.edu|fetch_ucirepo", "UCI/network"),
        (r"(?:^|\n)\s*[!%]\s*(?:pip|conda|uv)\b", "shell package install"),
        (r"<script\b|javascript:", "uncontrolled executable HTML"),
        (r"\b(?:ipywidgets|widget_state)\b|display\s*\(\s*HTML", "widget or raw HTML state"),
    )
    for cell in code_cells:
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", cell.cell_id):
            raise Phase26Error(f"Invalid Notebook code-cell ID: {cell.cell_id!r}")
        if cell.cell_id in seen_ids:
            raise Phase26Error(f"Duplicate Notebook code-cell ID: {cell.cell_id}")
        seen_ids.add(cell.cell_id)
        if not cell.source.strip():
            raise Phase26Error(f"Notebook code cell {cell.cell_id} has empty source")
        for pattern, label in forbidden_patterns:
            if re.search(pattern, cell.source, flags=re.IGNORECASE):
                raise Phase26Error(
                    f"Notebook code cell {cell.cell_id} contains forbidden {label} code"
                )


def validate_notebook_topic(topic: NotebookTopicContract) -> None:
    if topic.topic_id not in NOTEBOOK_TOPIC_IDS:
        raise Phase26Error(f"Unknown Notebook topic ID: {topic.topic_id}")
    validate_notebook_code_cells(topic.code_cells)
    if tuple(topic.markdown_by_locale) != NOTEBOOK_LOCALES:
        raise Phase26Error(
            f"{topic.topic_id} must define markdown dictionaries in exact locale order "
            f"{NOTEBOOK_LOCALES}"
        )
    markdown_ids = {
        locale: tuple(dictionary)
        for locale, dictionary in topic.markdown_by_locale.items()
    }
    if len(set(markdown_ids.values())) != 1:
        raise Phase26Error(
            f"{topic.topic_id} locale markdown dictionaries must use identical cell IDs"
        )
    for locale, dictionary in topic.markdown_by_locale.items():
        for cell_id, source in dictionary.items():
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", cell_id):
                raise Phase26Error(
                    f"{topic.topic_id}/{locale} has invalid markdown cell ID {cell_id!r}"
                )
            if not source.strip():
                raise Phase26Error(
                    f"{topic.topic_id}/{locale} markdown cell {cell_id} is empty"
                )

    code_by_id = {cell.cell_id: cell for cell in topic.code_cells}
    ordered_ids: set[str] = set()
    for kind, cell_id in topic.cell_order:
        if kind == "code":
            if cell_id not in code_by_id:
                raise Phase26Error(
                    f"{topic.topic_id} cell order references unknown code cell {cell_id}"
                )
        elif kind == "markdown":
            if cell_id not in topic.markdown_by_locale[NOTEBOOK_LOCALES[0]]:
                raise Phase26Error(
                    f"{topic.topic_id} cell order references unknown markdown cell {cell_id}"
                )
        else:
            raise Phase26Error(f"{topic.topic_id} has unsupported cell kind {kind!r}")
        if cell_id in ordered_ids:
            raise Phase26Error(f"{topic.topic_id} repeats ordered cell ID {cell_id}")
        ordered_ids.add(cell_id)
    expected_ids = set(code_by_id) | set(topic.markdown_by_locale[NOTEBOOK_LOCALES[0]])
    if ordered_ids != expected_ids:
        raise Phase26Error(
            f"{topic.topic_id} ordered cell inventory drifted: "
            f"missing={sorted(expected_ids - ordered_ids)}, "
            f"unexpected={sorted(ordered_ids - expected_ids)}"
        )


def notebook_blueprint(topic_id: str, locale: str) -> list[dict[str, str]]:
    if topic_id not in NOTEBOOK_TOPICS:
        raise Phase26Error(f"Unknown Notebook topic ID: {topic_id}")
    if locale not in NOTEBOOK_LOCALES:
        raise Phase26Error(f"Unsupported Notebook locale: {locale}")
    topic = NOTEBOOK_TOPICS[topic_id]
    validate_notebook_topic(topic)
    code_by_id = {cell.cell_id: cell.source.strip() for cell in topic.code_cells}
    markdown_by_id = topic.markdown_by_locale[locale]
    return [
        {
            "id": cell_id,
            "kind": kind,
            "source": (
                code_by_id[cell_id]
                if kind == "code"
                else markdown_by_id[cell_id].strip()
            ),
        }
        for kind, cell_id in topic.cell_order
    ]


def candidate_execution_jobs() -> tuple[NotebookExecutionJob, ...]:
    return tuple(
        NotebookExecutionJob(
            topic_id=topic_id,
            locale=locale,
            notebook_path=f"notebooks/loss-functions/{topic_id}.{locale}.ipynb",
            proof_id=f"clean-kernel-{topic_id}-{locale}",
        )
        for topic_id in NOTEBOOK_TOPIC_IDS
        for locale in NOTEBOOK_LOCALES
    )


def candidate_inventory() -> CandidateInventory:
    inventory = CandidateInventory(
        paths=CANDIDATE_PATHS,
        topic_ids=NOTEBOOK_TOPIC_IDS,
        locales=NOTEBOOK_LOCALES,
        execution_jobs=candidate_execution_jobs(),
    )
    if len(inventory.paths) != 16 or len(set(inventory.paths)) != len(inventory.paths):
        raise Phase26Error("Candidate inventory must contain exactly 16 unique package members")
    for relative_path in inventory.paths:
        path = Path(relative_path)
        if path.is_absolute() or ".." in path.parts or path.as_posix() != relative_path:
            raise Phase26Error(
                f"Candidate inventory paths must be normalized and staging-relative: {relative_path}"
            )
    if tuple(NOTEBOOK_TOPICS) != inventory.topic_ids:
        raise Phase26Error("Notebook topic definitions and candidate inventory drifted")
    proof_ids = [job.proof_id for job in inventory.execution_jobs]
    notebook_paths = [job.notebook_path for job in inventory.execution_jobs]
    if (
        len(inventory.execution_jobs) != 4
        or len(set(proof_ids)) != 4
        or len(set(notebook_paths)) != 4
    ):
        raise Phase26Error("Candidate inventory requires four distinct locale execution jobs")
    if any(path not in inventory.paths for path in notebook_paths):
        raise Phase26Error("A locale execution job references a Notebook outside the inventory")
    return inventory


def candidate_contract_snapshot() -> dict[str, Any]:
    inventory = candidate_inventory()
    topics: dict[str, Any] = {}
    for topic_id, topic in NOTEBOOK_TOPICS.items():
        validate_notebook_topic(topic)
        topics[topic_id] = {
            "codeCells": [
                {"id": cell.cell_id, "source": cell.source.strip()}
                for cell in topic.code_cells
            ],
            "markdownByLocale": topic.markdown_by_locale,
            "blueprints": {
                locale: notebook_blueprint(topic_id, locale)
                for locale in NOTEBOOK_LOCALES
            },
        }
    return {
        "inventory": {
            "paths": list(inventory.paths),
            "topicIds": list(inventory.topic_ids),
            "locales": list(inventory.locales),
            "partialSelectionAllowed": False,
            "publicationAllowed": False,
        },
        "topics": topics,
        "executionJobs": [
            {
                "topicId": job.topic_id,
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
            for job in inventory.execution_jobs
        ],
    }


def validate_candidate_staging_root(staging_root: Path) -> Path:
    resolved = staging_root.resolve()
    public_root = (REPO_ROOT / "public").resolve()
    expected = DEFAULT_STAGING_ROOT.resolve()
    if resolved == public_root or resolved.is_relative_to(public_root):
        raise Phase26Error("Candidate generation cannot target public/ or any public child")
    if resolved != expected:
        raise Phase26Error(
            "Candidate staging root must resolve exactly to "
            ".cache/loss-functions/phase-26-staging"
        )
    gitignore_path = REPO_ROOT / ".gitignore"
    ignore_entries = {
        line.strip()
        for line in gitignore_path.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    }
    if CANDIDATE_STAGING_IGNORE_ENTRY not in ignore_entries:
        raise Phase26Error(
            "Phase 26 candidate staging root is not protected by the exact .gitignore entry"
        )
    if staging_root.is_symlink():
        raise Phase26Error("Candidate staging root may not be a symlink")
    return resolved


def read_environment_pins(path: Path = REQUIREMENTS_PATH) -> dict[str, str]:
    if not path.is_file():
        raise Phase26Error(f"Missing exact environment requirements: {path}")
    pins: dict[str, str] = {}
    for line_number, raw_line in enumerate(
        path.read_text(encoding="utf-8").splitlines(),
        start=1,
    ):
        line = raw_line.strip()
        if not line:
            continue
        if line.count("==") != 1:
            raise Phase26Error(
                f"Requirement line {line_number} is not one exact pin: {raw_line!r}"
            )
        name, version = line.split("==", 1)
        normalized = name.lower()
        if not name or not version or normalized in pins:
            raise Phase26Error(
                f"Duplicate or invalid requirement line {line_number}: {raw_line!r}"
            )
        pins[normalized] = version
    if pins != EXPECTED_ENVIRONMENT_PINS:
        raise Phase26Error(
            "Phase 26 requirements must exactly reuse the audited Numerical Methods pins: "
            f"{pins}"
        )
    if (
        path.resolve() == REQUIREMENTS_PATH.resolve()
        and path.read_bytes() != NUMERICAL_REQUIREMENTS_PATH.read_bytes()
    ):
        raise Phase26Error(
            "Phase 26 requirements bytes drifted from the audited Numerical Methods source"
        )
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
        raise Phase26Error("Phase 26 environment contract version drifted")

    pins = read_environment_pins()
    requirements = contract.get("requirements", {})
    expected_requirements_hash = sha256_file(REQUIREMENTS_PATH)
    source_requirements_hash = sha256_file(NUMERICAL_REQUIREMENTS_PATH)
    if requirements != {
        "path": "scripts/loss-functions/requirements.txt",
        "sha256": expected_requirements_hash,
        "sourcePath": "public/notebooks/numerical-methods/requirements.txt",
        "sourceSha256": source_requirements_hash,
        "pins": pins,
    }:
        raise Phase26Error("Environment requirements identity or exact pin table drifted")

    current_python = python_identity()
    current_platform = platform_identity()
    if contract.get("python") != current_python or contract.get("platform") != current_platform:
        raise Phase26Error(
            "Environment Python/platform identity drifted from the audited wheel cache contract"
        )

    installation = contract.get("installation")
    if installation != {
        "networkAccess": False,
        "pipArguments": [
            "--no-index",
            "--find-links=<audited-wheel-cache>",
            "--requirement=scripts/loss-functions/requirements.txt",
        ],
    }:
        raise Phase26Error("Environment installation must remain pip no-index and offline")

    wheel_contract = contract.get("wheelCache", {})
    if (
        wheel_contract.get("path")
        != ".cache/numerical-methods/batch-4-wheelhouse"
        or wheel_contract.get("manifest") != WHEEL_CACHE_MANIFEST_NAME
        or wheel_contract.get("sourceContractVersion")
        != "numerical-methods-batch-4-v1"
    ):
        raise Phase26Error("Audited Numerical Methods wheel-cache identity drifted")

    manifest_path = wheel_cache.resolve() / WHEEL_CACHE_MANIFEST_NAME
    if not manifest_path.is_file():
        raise Phase26Error(
            f"Audited wheel cache is missing {WHEEL_CACHE_MANIFEST_NAME}: {wheel_cache}"
        )
    manifest = read_strict_json(manifest_path)
    if sha256_file(manifest_path) != wheel_contract.get("manifestSha256"):
        raise Phase26Error("Audited wheel-cache manifest SHA-256 drifted")
    if (
        manifest.get("contractVersion") != wheel_contract.get("sourceContractVersion")
        or manifest.get("requirements", {}).get("sha256")
        != source_requirements_hash
        or manifest.get("requirements", {}).get("pins") != pins
        or manifest.get("python") != current_python
        or manifest.get("platform") != current_platform
    ):
        raise Phase26Error(
            "Audited wheel-cache requirements, Python, or platform identity drifted"
        )

    wheel_entries = manifest.get("wheels")
    if (
        not isinstance(wheel_entries, list)
        or not wheel_entries
        or len(wheel_entries) != wheel_contract.get("wheelCount")
    ):
        raise Phase26Error("Audited wheel-cache manifest wheel count drifted")
    observed_names: set[str] = set()
    for entry in wheel_entries:
        if not isinstance(entry, dict) or not isinstance(entry.get("file"), str):
            raise Phase26Error("Audited wheel-cache manifest contains an invalid wheel entry")
        path = wheel_cache.resolve() / entry["file"]
        observed_names.add(path.name)
        if (
            not path.is_file()
            or path.stat().st_size != entry.get("bytes")
            or sha256_file(path) != entry.get("sha256")
        ):
            raise Phase26Error(f"Audited wheel artifact is missing or drifted: {path.name}")
    actual_names = {path.name for path in wheel_cache.resolve().glob("*.whl")}
    if actual_names != observed_names:
        raise Phase26Error("Audited wheel cache has added or missing wheel artifacts")

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
        rendered = " ".join(command)
        raise Phase26Error(
            f"Command failed ({completed.returncode}): {rendered}\n{completed.stdout}"
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
        }
    )
    for key in ("JUPYTER_CONFIG_DIR", "JUPYTER_RUNTIME_DIR", "IPYTHONDIR"):
        Path(environment[key]).mkdir(parents=True, exist_ok=True)
    return environment


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

payload = json.loads(os.environ["ML_ATLAS_PHASE26_VERIFY_PAYLOAD"])
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
    worker_environment["ML_ATLAS_PHASE26_VERIFY_PAYLOAD"] = payload
    output = run_command(
        [str(python), "-c", code],
        environment=worker_environment,
    ).stdout.strip().splitlines()
    if not output:
        raise Phase26Error("Isolated environment verification produced no result")
    result = json.loads(output[-1])
    if result.get("kernelName") != kernel_name or result.get("versions") != pins:
        raise Phase26Error("Isolated environment package or kernel identity drifted")
    return result["versions"]


@contextlib.contextmanager
def isolated_environment(
    wheel_cache: Path = DEFAULT_WHEEL_CACHE,
) -> Iterator[IsolatedEnvironment]:
    verified = validate_environment_contract(wheel_cache=wheel_cache)
    temporary = tempfile.TemporaryDirectory(prefix="ml-atlas-phase26-environment-")
    root = Path(temporary.name)
    python = isolated_venv_python(root / "venv")
    kernel_prefix = root / "kernel-prefix"
    kernel_name = f"ml-atlas-phase26-{uuid.uuid4().hex}"
    environment = isolated_environment_variables(root)
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
                "ML Atlas Phase 26 Isolated Kernel",
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
            raise Phase26Error("Isolated environment observed package versions drifted")
    if temporary_root is None or temporary_root.exists():
        raise Phase26Error(
            "Temporary Phase 26 environment, kernelspec, or scoped state was not removed"
        )
    print(
        "Verified the exact offline Phase 26 environment and removed its temporary "
        "venv, kernelspec, and scoped Jupyter state."
    )


def _remove_candidate_root(root: Path) -> None:
    if root.is_symlink() or root.is_file():
        root.unlink(missing_ok=True)
    elif root.exists():
        shutil.rmtree(root)


@contextlib.contextmanager
def candidate_transaction(staging_root: Path) -> Iterator[CandidateTransaction]:
    root = validate_candidate_staging_root(staging_root)
    _remove_candidate_root(root)
    root.mkdir(parents=True, exist_ok=False)
    try:
        inventory = candidate_inventory()
        transaction = CandidateTransaction(
            root=root,
            inventory=inventory,
            execution_jobs=inventory.execution_jobs,
        )
        yield transaction
    except BaseException:
        _remove_candidate_root(root)
        raise


def contract_snapshot() -> dict[str, Any]:
    return {
        "contractVersion": CONTRACT_VERSION,
        "transformVersion": TRANSFORM_VERSION,
        "approval": APPROVAL_DECISION,
        "lade": {
            "datasetId": LADE.dataset_id,
            "downloadUrl": LADE.download_url,
            "revisionOrDoi": LADE.revision_or_doi,
            "license": LADE.license,
            "sha256": LADE.sha256,
        },
        "secom": {
            "datasetId": SECOM.dataset_id,
            "downloadUrl": SECOM.download_url,
            "revisionOrDoi": SECOM.revision_or_doi,
            "license": SECOM.license,
            "sha256": SECOM.sha256,
            "declaredFeatureCount": SECOM.declared_feature_count,
            "observedFeatureCount": SECOM.observed_feature_count,
        },
        "publication": {
            "allowedFields": list(LADE_PUBLISHED_FIELDS),
            "removedFields": list(LADE_REMOVED_FIELDS),
        },
    }


def _require_anchors(path: Path, anchors: tuple[str, ...], label: str) -> None:
    if not path.is_file():
        raise Phase26Error(f"Missing {label}: {path}")
    text = path.read_text(encoding="utf-8")
    missing = [anchor for anchor in anchors if anchor not in text]
    if missing:
        raise Phase26Error(f"{label} drifted; missing exact approval/contract anchors: {missing}")


def validate_contract(path: Path = CONTRACT_PATH) -> None:
    _require_anchors(path, CONTRACT_ANCHORS, "Phase 26 data contract")


def validate_authorization() -> None:
    _require_anchors(RESEARCH_PATH, RESEARCH_ANCHORS, "resolved Phase 26 research approval")
    validate_contract()


def _parse_lade_timestamp(value: str, *, field: str, row_number: int) -> datetime:
    for pattern in ("%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            parsed = datetime.strptime(value, pattern)
            if pattern.startswith("%m"):
                return parsed.replace(year=2000)
            return parsed
        except ValueError:
            continue
    raise Phase26Error(
        f"LaDe row {row_number} has invalid {field} timestamp: {value!r}"
    )


def _delivery_duration_minutes(
    accept_value: str,
    delivery_value: str,
    *,
    row_number: int,
) -> float | int:
    accept_time = _parse_lade_timestamp(
        accept_value,
        field="accept_time",
        row_number=row_number,
    )
    delivery_time = _parse_lade_timestamp(
        delivery_value,
        field="delivery_time",
        row_number=row_number,
    )
    if delivery_time < accept_time:
        try:
            delivery_time = delivery_time.replace(year=accept_time.year + 1)
        except ValueError as error:
            raise Phase26Error(
                f"LaDe row {row_number} timestamp rollover is invalid"
            ) from error
    duration = (delivery_time - accept_time).total_seconds() / 60.0
    if not math.isfinite(duration) or duration < 0:
        raise Phase26Error(
            f"LaDe row {row_number} has non-finite or negative delivery duration: {duration}"
        )
    return int(duration) if duration.is_integer() else duration


def _validate_lade_candidate(candidate: dict[str, Any], *, row_number: int) -> None:
    if tuple(candidate) != LADE_PUBLISHED_FIELDS:
        unexpected = sorted(set(candidate) - set(LADE_PUBLISHED_FIELDS))
        missing = sorted(set(LADE_PUBLISHED_FIELDS) - set(candidate))
        raise Phase26Error(
            f"LaDe normalized row {row_number} violates privacy schema: "
            f"missing={missing}, unexpected={unexpected}"
        )
    lowered_fields = " ".join(candidate).lower()
    if any(token in lowered_fields for token in ("courier", "gps", "latitude", "longitude", "stop")):
        raise Phase26Error(
            f"LaDe normalized row {row_number} contains a denied privacy field"
        )
    duration = candidate["delivery_duration_minutes"]
    if not isinstance(duration, (int, float)) or not math.isfinite(duration):
        raise Phase26Error(
            f"LaDe normalized row {row_number} has invalid derived duration"
        )


def validate_lade_candidates(candidates: list[dict[str, Any]]) -> None:
    course_ids: set[str] = set()
    for row_number, candidate in enumerate(candidates, start=1):
        _validate_lade_candidate(candidate, row_number=row_number)
        course_row_id = candidate["course_row_id"]
        if course_row_id in course_ids:
            raise Phase26Error(f"Duplicate LaDe course ID: {course_row_id}")
        course_ids.add(course_row_id)


def validate_lade_source(
    path: Path,
    *,
    expected_rows: int = LADE_EXPECTED_ROWS,
) -> dict[str, Any]:
    try:
        with path.open(encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            if tuple(reader.fieldnames or ()) != LADE_SOURCE_FIELDS:
                raise Phase26Error(
                    "LaDe source field/schema drift: "
                    f"expected {list(LADE_SOURCE_FIELDS)}, got {reader.fieldnames}"
                )
            source_rows = list(reader)
    except OSError as error:
        raise Phase26Error(f"Cannot read LaDe source {path}: {error}") from error

    if len(source_rows) != expected_rows:
        raise Phase26Error(
            f"LaDe row count drift: expected {expected_rows}, got {len(source_rows)}"
        )

    normalized_rows: list[dict[str, Any]] = []
    durations: list[float | int] = []
    for source_row_number, row in enumerate(source_rows, start=1):
        for required_field in ("city", "aoi_type", "accept_time", "delivery_time", "ds"):
            if not row.get(required_field):
                raise Phase26Error(
                    f"LaDe row {source_row_number} has empty required field {required_field}"
                )
        duration = _delivery_duration_minutes(
            row["accept_time"],
            row["delivery_time"],
            row_number=source_row_number,
        )
        course_row_id = f"lade-jilin-{source_row_number:05d}"
        candidate = {
            "course_row_id": course_row_id,
            "source_row_number": source_row_number,
            "city": row["city"],
            "aoi_type": row["aoi_type"],
            "accept_time": row["accept_time"],
            "delivery_time": row["delivery_time"],
            "ds": row["ds"],
            "delivery_duration_minutes": duration,
        }
        normalized_rows.append(candidate)
        durations.append(duration)

    validate_lade_candidates(normalized_rows)
    facts = {
        "rowCount": len(normalized_rows),
        "sourceFields": list(LADE_SOURCE_FIELDS),
        "publishedFields": list(LADE_PUBLISHED_FIELDS),
        "removedFields": list(LADE_REMOVED_FIELDS),
        "durationMinimumMinutes": min(durations),
        "durationMaximumMinutes": max(durations),
        "durationMedianMinutes": median(durations),
        "zeroDurationRows": sum(duration == 0 for duration in durations),
        "over24HourRows": sum(duration > 24 * 60 for duration in durations),
    }
    return {"facts": facts, "normalizedRows": normalized_rows}


def _decode_zip_member(archive: zipfile.ZipFile, name: str) -> str:
    info = archive.getinfo(name)
    if info.file_size > 10 * 1024 * 1024:
        raise Phase26Error(f"SECOM archive member is unexpectedly large: {name}")
    try:
        return archive.read(name).decode("utf-8")
    except (OSError, UnicodeDecodeError) as error:
        raise Phase26Error(f"Cannot decode SECOM archive member {name}: {error}") from error


def validate_secom_archive(
    path: Path,
    *,
    expected_rows: int = SECOM_EXPECTED_ROWS,
    expected_label_counts: dict[int, int] | None = None,
) -> dict[str, int]:
    expected_counts = expected_label_counts or SECOM_EXPECTED_LABEL_COUNTS
    try:
        with zipfile.ZipFile(path) as archive:
            members = tuple(sorted(archive.namelist()))
            if members != tuple(sorted(SECOM_ARCHIVE_MEMBERS)):
                raise Phase26Error(
                    f"SECOM archive member drift: expected {list(SECOM_ARCHIVE_MEMBERS)}, "
                    f"got {list(members)}"
                )
            data_text = _decode_zip_member(archive, "secom.data")
            labels_text = _decode_zip_member(archive, "secom_labels.data")
            names_text = _decode_zip_member(archive, "secom.names")
    except (OSError, zipfile.BadZipFile, KeyError) as error:
        raise Phase26Error(f"Invalid SECOM archive {path}: {error}") from error

    if not re.search(r"Number of Attributes:\s*591\b", names_text):
        raise Phase26Error(
            "SECOM metadata must preserve the upstream declared 591-feature count"
        )

    data_lines = data_text.splitlines()
    label_lines = labels_text.splitlines()
    if len(data_lines) != expected_rows:
        raise Phase26Error(
            f"SECOM row count drift: expected {expected_rows}, got {len(data_lines)}"
        )
    if len(label_lines) != expected_rows:
        raise Phase26Error(
            f"SECOM label row count drift: expected {expected_rows}, got {len(label_lines)}"
        )

    missing_value_count = 0
    for row_number, line in enumerate(data_lines, start=1):
        values = line.split()
        if len(values) != 590:
            raise Phase26Error(
                f"SECOM row {row_number} observed {len(values)} values; exact raw width is 590"
            )
        for column_number, value in enumerate(values, start=1):
            if value == "NaN":
                missing_value_count += 1
                continue
            try:
                numeric = float(value)
            except ValueError as error:
                raise Phase26Error(
                    f"SECOM row {row_number} column {column_number} is not numeric or NaN"
                ) from error
            if not math.isfinite(numeric):
                raise Phase26Error(
                    f"SECOM row {row_number} column {column_number} is non-finite"
                )

    labels: list[int] = []
    for row_number, line in enumerate(label_lines, start=1):
        fields = line.split(maxsplit=1)
        if len(fields) != 2 or not fields[1].strip():
            raise Phase26Error(
                f"SECOM label row {row_number} must contain a label and timestamp"
            )
        try:
            raw_label = int(fields[0])
        except ValueError as error:
            raise Phase26Error(f"SECOM label row {row_number} is not an integer") from error
        if raw_label not in {-1, 1}:
            raise Phase26Error(
                f"SECOM label row {row_number} uses unsupported label {raw_label}; "
                "only -1 -> 0 and 1 -> 1 are allowed"
            )
        try:
            timestamp = fields[1].strip().strip('"')
            datetime.strptime(timestamp, "%d/%m/%Y %H:%M:%S")
        except ValueError as error:
            raise Phase26Error(
                f"SECOM label row {row_number} has invalid timestamp {fields[1]!r}"
            ) from error
        labels.append(raw_label)

    counts = Counter(labels)
    if dict(counts) != expected_counts:
        raise Phase26Error(
            f"SECOM label-count drift: expected {expected_counts}, got {dict(counts)}"
        )
    return {
        "rowCount": len(data_lines),
        "passCount": counts[-1],
        "failCount": counts[1],
        "declaredFeatureCount": 591,
        "observedFeatureCount": 590,
        "missingValueCount": missing_value_count,
    }


def _source_manifest_entry(source: SourceContract, path: Path) -> dict[str, Any]:
    return {
        "datasetId": source.dataset_id,
        "cacheFile": source.cache_name,
        "downloadUrl": source.download_url,
        "pageUrl": source.page_url,
        "retrievedAt": "2026-07-28",
        "revisionOrDoi": source.revision_or_doi,
        "license": source.license,
        "attribution": source.attribution,
        "sha256": sha256_file(path),
        "bytes": path.stat().st_size,
        "declaredFeatureCount": source.declared_feature_count,
        "observedFeatureCount": source.observed_feature_count,
    }


def validate_source_contents(cache: Path) -> dict[str, Any]:
    lade = validate_lade_source(cache / LADE.cache_name)
    secom = validate_secom_archive(cache / SECOM.cache_name)
    return {
        "lade": lade["facts"],
        "secom": secom,
    }


def source_cache_manifest(cache: Path, validation: dict[str, Any]) -> dict[str, Any]:
    return {
        "contractVersion": CONTRACT_VERSION,
        "transformVersion": TRANSFORM_VERSION,
        "approval": APPROVAL_DECISION,
        "sources": {
            source.dataset_id: _source_manifest_entry(source, cache / source.cache_name)
            for source in SOURCE_CONTRACTS
        },
        "validation": validation,
        "transform": {
            "ladeTargetDefinition": (
                "delivery_duration_minutes = delivery_time - accept_time "
                "with month/day rollover handling"
            ),
            "secomLabelMapping": {"-1": 0, "1": 1},
            "secomMissingValuePolicy": "Preserve raw NaN as missing; no imputation",
        },
        "publication": {
            "allowedFields": list(LADE_PUBLISHED_FIELDS),
            "removedFields": list(LADE_REMOVED_FIELDS),
        },
    }


def _validate_source_file(source: SourceContract, path: Path) -> None:
    if not path.is_file():
        raise Phase26Error(f"Missing cached {source.dataset_id} source: {path}")
    observed_hash = sha256_file(path)
    if observed_hash != source.sha256:
        raise Phase26Error(
            f"{source.dataset_id} SHA-256 drift: expected {source.sha256}, got {observed_hash}"
        )
    if source.expected_bytes is not None and path.stat().st_size != source.expected_bytes:
        raise Phase26Error(
            f"{source.dataset_id} byte-length drift: expected {source.expected_bytes}, "
            f"got {path.stat().st_size}"
        )


def verify_source_cache(cache: Path) -> dict[str, Any]:
    validate_authorization()
    for source in SOURCE_CONTRACTS:
        _validate_source_file(source, cache / source.cache_name)

    validation = validate_source_contents(cache)
    manifest_path = cache / SOURCE_CACHE_MANIFEST
    manifest = read_strict_json(manifest_path)
    expected = source_cache_manifest(cache, validation)
    if manifest != expected:
        raise Phase26Error("Source-cache manifest, license, attribution, or identity drifted")
    return manifest


def _download_exact_source(source: SourceContract, destination: Path) -> None:
    request = urllib.request.Request(
        source.download_url,
        headers={"User-Agent": "ML-Atlas-Phase-26-source-bootstrap/1.0"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response, destination.open("wb") as handle:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                handle.write(chunk)
    except OSError as error:
        raise Phase26Error(f"Failed to bootstrap exact source {source.download_url}: {error}") from error
    _validate_source_file(source, destination)


def _replace_directory_transaction(stage: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    backup = destination.parent / f".{destination.name}.backup-{uuid.uuid4().hex}"
    had_destination = destination.exists()
    try:
        if had_destination:
            destination.replace(backup)
        stage.replace(destination)
    except BaseException:
        if destination.exists():
            shutil.rmtree(destination)
        if backup.exists():
            backup.replace(destination)
        raise
    else:
        if backup.exists():
            shutil.rmtree(backup)


def bootstrap_sources(cache: Path) -> None:
    validate_authorization()
    cache_parent = cache.parent
    cache_parent.mkdir(parents=True, exist_ok=True)
    temporary = tempfile.mkdtemp(prefix=".phase-26-sources-", dir=cache_parent)
    stage = Path(temporary)
    try:
        for source in SOURCE_CONTRACTS:
            _download_exact_source(source, stage / source.cache_name)
        validation = validate_source_contents(stage)
        (stage / SOURCE_CACHE_MANIFEST).write_bytes(
            strict_json_bytes(source_cache_manifest(stage, validation))
        )
        for source in SOURCE_CONTRACTS:
            _validate_source_file(source, stage / source.cache_name)
        _replace_directory_transaction(stage, cache)
        verify_source_cache(cache)
    finally:
        if stage.exists():
            shutil.rmtree(stage)


def _iter_tree_files(root: Path) -> Iterator[tuple[str, Path]]:
    if not root.is_dir():
        raise Phase26Error(f"Expected directory does not exist: {root}")
    for path in sorted(root.rglob("*")):
        if path.is_symlink():
            raise Phase26Error(f"Symlinks are forbidden in checked artifact trees: {path}")
        if path.is_file():
            yield path.relative_to(root).as_posix(), path


def compare_committed_tree(regenerated_root: Path, published_root: Path) -> None:
    regenerated = dict(_iter_tree_files(regenerated_root))
    published = dict(_iter_tree_files(published_root))
    if regenerated.keys() != published.keys():
        missing = sorted(regenerated.keys() - published.keys())
        unexpected = sorted(published.keys() - regenerated.keys())
        raise Phase26Error(
            f"Committed inventory drift: missing={missing}, unexpected={unexpected}"
        )
    for relative_path, expected_path in regenerated.items():
        actual_path = published[relative_path]
        if expected_path.read_bytes() != actual_path.read_bytes():
            raise Phase26Error(f"Committed bytes differ from regenerated expectations: {relative_path}")


def prepare_candidate_contract(
    cache: Path,
    staging_root: Path,
    wheel_cache: Path = DEFAULT_WHEEL_CACHE,
) -> dict[str, Any]:
    validated_root = validate_candidate_staging_root(staging_root)
    try:
        verify_source_cache(cache)
        validate_environment_contract(wheel_cache=wheel_cache)
        with candidate_transaction(validated_root):
            return candidate_contract_snapshot()
    except BaseException:
        _remove_candidate_root(validated_root)
        raise


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group(required=True)
    modes.add_argument("--bootstrap-sources", action="store_true")
    modes.add_argument("--generate", action="store_true")
    modes.add_argument("--prepare-candidates", action="store_true")
    modes.add_argument("--verify-candidates", action="store_true")
    modes.add_argument("--verify-environment", action="store_true")
    modes.add_argument("--verify-source-cache", action="store_true")
    modes.add_argument("--check", action="store_true")
    parser.add_argument("--source-cache", type=Path, default=DEFAULT_SOURCE_CACHE)
    parser.add_argument("--staging-root", type=Path, default=DEFAULT_STAGING_ROOT)
    parser.add_argument("--wheel-cache", type=Path, default=DEFAULT_WHEEL_CACHE)
    parser.add_argument("--topic")
    parser.add_argument("--locale")
    parser.add_argument("--regenerated-root", type=Path)
    parser.add_argument("--published-root", type=Path)
    parser.add_argument("--offline", action="store_true")
    args = parser.parse_args()

    validate_authorization()
    if args.bootstrap_sources:
        if args.offline:
            raise Phase26Error("--bootstrap-sources is the only online mode and rejects --offline")
        bootstrap_sources(args.source_cache)
        print(f"Bootstrapped and pinned two official sources in {args.source_cache}")
        return

    if not args.offline:
        raise Phase26Error("Local generation, source-cache verification, and --check require --offline")

    if args.topic is not None or args.locale is not None:
        raise Phase26Error(
            "Partial topic or locale selectors are forbidden; prepare and verify the complete "
            "two-topic/four-locale candidate inventory"
        )

    if args.verify_source_cache:
        verify_source_cache(args.source_cache)
        print("Phase 26 source cache matches exact identities, licenses, and hashes.")
        return

    if args.verify_environment:
        validated_root = validate_candidate_staging_root(args.staging_root)
        try:
            verify_environment(args.wheel_cache)
        except BaseException:
            _remove_candidate_root(validated_root)
            raise
        return

    if args.generate or args.prepare_candidates:
        candidate = prepare_candidate_contract(
            args.source_cache,
            args.staging_root,
            args.wheel_cache,
        )
        print(
            "Prepared the complete offline candidate contract "
            f"({len(candidate['inventory']['paths'])} members, "
            f"{len(candidate['executionJobs'])} fresh-kernel jobs) in {args.staging_root}"
        )
        return

    if args.verify_candidates:
        verify_source_cache(args.source_cache)
        validate_candidate_staging_root(args.staging_root)
        validate_environment_contract(wheel_cache=args.wheel_cache)
        candidate_contract_snapshot()
        print("Verified the complete staging-only candidate inventory and locale contract.")
        return

    if bool(args.regenerated_root) != bool(args.published_root):
        raise Phase26Error("--regenerated-root and --published-root must be provided together")
    if args.regenerated_root and args.published_root:
        compare_committed_tree(args.regenerated_root, args.published_root)
        print("Committed bytes match regenerated expectations; check was offline and read-only.")
        return

    verify_source_cache(args.source_cache)
    print("Source cache is current; full public artifact checking is added in Plan 26-05.")


if __name__ == "__main__":
    try:
        main()
    except (Phase26Error, ValueError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1) from error
