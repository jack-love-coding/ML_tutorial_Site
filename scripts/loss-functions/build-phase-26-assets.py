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
import zlib
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
DEFAULT_PUBLIC_ROOT = REPO_ROOT / "public"
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
DATASET_CANDIDATE_PATHS = CANDIDATE_PATHS[:5]
GENERATOR_RELATIVE_PATH = "scripts/loss-functions/build-phase-26-assets.py"
# The complete package was built and independently validated by Plan 26-04 before
# publication code was added.  Publication verifies that exact generator identity
# instead of rewriting any of the 16 already-approved candidate bytes.
VALIDATED_CANDIDATE_GENERATOR_SHA256 = (
    "69f41c2a125456b07695528a5f9687d291177949b777178fbfcbb4527658f652"
)
PUBLIC_GROUP_PATHS = (
    "datasets/loss-functions",
    "notebooks/loss-functions",
)
PUBLICATION_FAILURE_POINTS = frozenset({"pre-swap", "mid-swap", "post-swap"})
LADE_REFERENCE_PREDICTION_MINUTES = 175
SECOM_OOF_FOLDS = 5
SECOM_OOF_RANDOM_STATE = 20_260_728
SECOM_CONFIDENT_ERROR_THRESHOLD = 0.9
SECOM_PUBLISHED_PREFIX_FIELDS = (
    "course_row_id",
    "timestamp",
    "defect_label",
)
SECOM_MEASUREMENT_FIELDS = tuple(
    f"measurement_{index:03d}" for index in range(590)
)
SECOM_PUBLISHED_FIELDS = (
    *SECOM_PUBLISHED_PREFIX_FIELDS,
    *SECOM_MEASUREMENT_FIELDS,
)

NOTEBOOK_ARTIFACT_HELPERS = r'''import struct
import zlib


def write_strict_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(
        value,
        ensure_ascii=False,
        indent=2,
        sort_keys=True,
        allow_nan=False,
    ) + "\n"
    path.write_text(payload, encoding="utf-8", newline="\n")


def _png_chunk(kind, payload):
    return (
        struct.pack(">I", len(payload))
        + kind
        + payload
        + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)
    )


def write_pattern_plot(path, *, title, description, non_color_encoding, series):
    width, height = 960, 540
    pixels = bytearray([248, 250, 252] * width * height)

    def set_pixel(x, y, color):
        if 0 <= x < width and 0 <= y < height:
            offset = (y * width + x) * 3
            pixels[offset : offset + 3] = bytes(color)

    def line(x0, y0, x1, y1, color, dashed=False):
        dx = abs(x1 - x0)
        sx = 1 if x0 < x1 else -1
        dy = -abs(y1 - y0)
        sy = 1 if y0 < y1 else -1
        error = dx + dy
        step = 0
        while True:
            if not dashed or (step // 7) % 2 == 0:
                set_pixel(x0, y0, color)
                set_pixel(x0, y0 + 1, color)
            if x0 == x1 and y0 == y1:
                break
            doubled = 2 * error
            if doubled >= dy:
                error += dy
                x0 += sx
            if doubled <= dx:
                error += dx
                y0 += sy
            step += 1

    left, right, top, bottom = 80, 900, 55, 470
    line(left, bottom, right, bottom, (30, 41, 59))
    line(left, top, left, bottom, (30, 41, 59))
    flattened = [abs(float(value)) for _, values in series for value in values]
    maximum = max(flattened, default=1.0) or 1.0
    colors = ((35, 85, 155), (178, 72, 56), (52, 125, 83), (111, 78, 153))
    for series_index, (_, values) in enumerate(series):
        values = [float(value) for value in values]
        if not values:
            continue
        for index, value in enumerate(values):
            x = left + round(index * (right - left) / max(1, len(values) - 1))
            y = bottom - round(abs(value) / maximum * (bottom - top - 20))
            if index:
                previous = float(values[index - 1])
                previous_x = left + round((index - 1) * (right - left) / max(1, len(values) - 1))
                previous_y = bottom - round(abs(previous) / maximum * (bottom - top - 20))
                line(
                    previous_x,
                    previous_y,
                    x,
                    y,
                    colors[series_index % len(colors)],
                    dashed=series_index % 2 == 1,
                )
            marker = 4 + series_index
            for marker_y in range(y - marker, y + marker + 1):
                for marker_x in range(x - marker, x + marker + 1):
                    if series_index % 2 == 0:
                        draw = abs(marker_x - x) + abs(marker_y - y) <= marker
                    else:
                        draw = (
                            abs(marker_x - x) == marker
                            or abs(marker_y - y) == marker
                        )
                    if draw:
                        set_pixel(
                            marker_x,
                            marker_y,
                            colors[series_index % len(colors)],
                        )

    raw = b"".join(
        b"\x00" + bytes(pixels[row * width * 3 : (row + 1) * width * 3])
        for row in range(height)
    )
    metadata = {
        "Title": title,
        "Description": description,
        "NonColorEncoding": non_color_encoding,
        "Software": "ML Atlas Phase 26 deterministic stdlib PNG writer",
    }
    png = bytearray(b"\x89PNG\r\n\x1a\n")
    png.extend(
        _png_chunk(
            b"IHDR",
            struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0),
        )
    )
    for key, value in metadata.items():
        png.extend(_png_chunk(b"tEXt", key.encode("latin1") + b"\x00" + value.encode("latin1")))
    png.extend(_png_chunk(b"IDAT", zlib.compress(raw, level=9)))
    png.extend(_png_chunk(b"IEND", b""))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(bytes(png))'''

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
        """def left_fold_mean(values):
    values = np.asarray(values, dtype=np.float64)
    total = 0.0
    for value in values:
        total += float(value) / values.size
    return total


def regression_losses(targets, predictions):
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
        "mse": left_fold_mean(squared),
        "mae": left_fold_mean(absolute),
        "mse_per_element_gradients": 2.0 * residuals,
        "mae_per_element_subgradients": np.sign(residuals),
        "mae_differentiable": residuals != 0.0,
        "mse_mean_gradients": 2.0 * residuals / targets.size,
        "mae_mean_subgradients": np.sign(residuals) / targets.size,
    }""",
    ),
    NotebookCodeCell(
        "delivery-artifact-helpers",
        NOTEBOOK_ARTIFACT_HELPERS,
    ),
    NotebookCodeCell(
        "delivery-local-paths",
        """DATASET_PATH = Path("../../datasets/loss-functions/lade-delivery-jilin.csv")
DATASET_MANIFEST_PATH = Path("../../datasets/loss-functions/lade-delivery-jilin-manifest.json")
SUMMARY_PATH = Path("outputs/regression-loss-summary.json")
PLOT_PATH = Path("outputs/delivery-losses.png")""",
    ),
    NotebookCodeCell(
        "delivery-build-output",
        """frame = pd.read_csv(DATASET_PATH)
dataset_manifest = json.loads(DATASET_MANIFEST_PATH.read_text(encoding="utf-8"))
targets = frame["delivery_duration_minutes"].to_numpy(dtype=np.float64)
predictions = np.full(targets.shape, 175.0, dtype=np.float64)
evaluated = regression_losses(targets, predictions)

rows = []
for index, course_row_id in enumerate(frame["course_row_id"].astype(str)):
    rows.append({
        "courseRowId": course_row_id,
        "targetMinutes": float(targets[index]),
        "predictionMinutes": float(predictions[index]),
        "residualMinutes": float(evaluated["residuals"][index]),
        "mseLoss": float(evaluated["squared"][index]),
        "maeLoss": float(evaluated["absolute"][index]),
        "msePerElementGradient": float(evaluated["mse_per_element_gradients"][index]),
        "maePerElementSubgradient": float(evaluated["mae_per_element_subgradients"][index]),
        "maeDifferentiable": bool(evaluated["mae_differentiable"][index]),
        "mseMeanObjectiveGradient": float(evaluated["mse_mean_gradients"][index]),
        "maeMeanObjectiveSubgradient": float(evaluated["mae_mean_subgradients"][index]),
    })

rows_by_id = {row["courseRowId"]: row for row in rows}
representative_rows = [
    {"role": reference["role"], **rows_by_id[reference["courseRowId"]]}
    for reference in dataset_manifest["teachingReference"]["representativeRows"]
]
high_contribution_rows = sorted(
    rows,
    key=lambda row: (-row["mseLoss"], row["courseRowId"]),
)[:5]
histogram_counts, histogram_edges = np.histogram(
    evaluated["absolute"],
    bins=np.asarray([0, 15, 30, 60, 120, 240, 480, 960, 1920, 3840], dtype=np.float64),
)
summary = {
    "contractVersion": "loss-functions-phase-26-output-v1",
    "topicId": "delivery-losses",
    "dataset": {
        "datasetId": dataset_manifest["datasetId"],
        "sha256": dataset_manifest["published"]["sha256"],
        "rowCount": int(targets.size),
    },
    "referencePredictionMinutes": 175,
    "aggregate": {
        "mse": evaluated["mse"],
        "mae": evaluated["mae"],
        "rowCount": int(targets.size),
    },
    "rows": rows,
    "representativeRows": representative_rows,
    "highContributionRows": high_contribution_rows,
    "distribution": {
        "metric": "absolute residual minutes",
        "binEdges": [float(value) for value in histogram_edges],
        "counts": [int(value) for value in histogram_counts],
    },
    "plot": {
        "path": "outputs/delivery-losses.png",
        "width": 960,
        "height": 540,
        "nonColorEncoding": "MSE solid diamond line; MAE dashed square line",
    },
}
write_strict_json(SUMMARY_PATH, summary)
write_pattern_plot(
    PLOT_PATH,
    title="Delivery loss distribution",
    description="Real LaDe delivery rows summarized by MSE and MAE contribution scale.",
    non_color_encoding="MSE solid diamond line; MAE dashed square line",
    series=(
        ("MSE solid diamond", [row["mseLoss"] for row in high_contribution_rows]),
        ("MAE dashed square", [row["maeLoss"] for row in high_contribution_rows]),
    ),
)
print(json.dumps({
    "topicId": summary["topicId"],
    "rowCount": summary["aggregate"]["rowCount"],
    "mse": summary["aggregate"]["mse"],
    "mae": summary["aggregate"]["mae"],
}, sort_keys=True, allow_nan=False))""",
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
        "manufacturing-gradient-sweeps",
        """LOCKED_STEPS = tuple(10.0 ** -power for power in range(1, 10))
LOCKED_TOLERANCE = 5e-7


def evaluate_gradient_sweep(kind, targets, outputs, index):
    targets = np.asarray(targets, dtype=np.float64)
    outputs = np.asarray(outputs, dtype=np.float64)
    if kind == "mse":
        objective = lambda values: float(np.mean((values - targets) ** 2))
        analytic = float(2.0 * (outputs[index] - targets[index]) / targets.size)
        differentiable = True
    elif kind == "mae":
        objective = lambda values: float(np.mean(np.abs(values - targets)))
        residual = float(outputs[index] - targets[index])
        analytic = float(np.sign(residual) / targets.size)
        differentiable = residual != 0.0
    elif kind == "bce":
        objective = lambda values: float(
            np.mean(np.logaddexp(0.0, values) - targets * values)
        )
        logit = float(outputs[index])
        if logit >= 0.0:
            probability = float(1.0 / (1.0 + np.exp(-logit)))
        else:
            exponential = float(np.exp(logit))
            probability = exponential / (1.0 + exponential)
        analytic = float((probability - targets[index]) / targets.size)
        differentiable = True
    else:
        raise ValueError(f"unsupported loss kind: {kind}")
    rows = []
    for step in LOCKED_STEPS:
        numerical = coordinate_central_difference(objective, outputs, index, step)
        absolute_error = abs(analytic - numerical)
        rows.append({
            "step": step,
            "analyticValue": analytic,
            "numericalValue": numerical,
            "absoluteError": absolute_error,
            "scaledRelativeError": absolute_error / max(1.0, abs(analytic), abs(numerical)),
            "tolerance": LOCKED_TOLERANCE,
            "differentiable": differentiable,
            "status": (
                "kink"
                if not differentiable
                else "pass" if absolute_error <= LOCKED_TOLERANCE else "fail"
            ),
            "note": (
                "A symmetric difference is not a unique derivative at the MAE kink."
                if not differentiable
                else None
            ),
        })
    return rows""",
    ),
    NotebookCodeCell(
        "manufacturing-artifact-helpers",
        NOTEBOOK_ARTIFACT_HELPERS,
    ),
    NotebookCodeCell(
        "manufacturing-local-paths",
        """DATASET_PATH = Path("../../datasets/loss-functions/secom-manufacturing.csv")
DATASET_MANIFEST_PATH = Path("../../datasets/loss-functions/secom-manufacturing-manifest.json")
SUMMARY_PATH = Path("outputs/bce-gradient-summary.json")
PLOT_PATH = Path("outputs/manufacturing-bce-gradients.png")""",
    ),
    NotebookCodeCell(
        "manufacturing-build-output",
        """frame = pd.read_csv(DATASET_PATH)
dataset_manifest = json.loads(DATASET_MANIFEST_PATH.read_text(encoding="utf-8"))
rows = dataset_manifest["auxiliaryPredictions"]["rows"]
labels = np.asarray([row["label"] for row in rows], dtype=np.float64)
logits = np.asarray([row["logit"] for row in rows], dtype=np.float64)
losses, per_logit_gradients, mean_gradients = stable_bce_from_logits(logits, labels)
if not np.allclose(losses, [row["stableBce"] for row in rows], rtol=0.0, atol=1e-12):
    raise RuntimeError("locked OOF BCE values drifted")
if not np.allclose(
    per_logit_gradients,
    [row["perLogitGradient"] for row in rows],
    rtol=0.0,
    atol=1e-15,
):
    raise RuntimeError("locked OOF gradients drifted")

fixed_probes = []
for logit in (-1000.0, -20.0, 0.0, 20.0, 1000.0):
    for label in (0, 1):
        if logit >= 0.0:
            probability = float(1.0 / (1.0 + np.exp(-logit)))
        else:
            exponential = float(np.exp(logit))
            probability = exponential / (1.0 + exponential)
        with np.errstate(divide="ignore", invalid="ignore", over="ignore"):
            naive_value = float(
                -(label * np.log(probability) + (1 - label) * np.log1p(-probability))
            )
        if np.isfinite(naive_value):
            naive = {"status": "finite", "value": naive_value}
        elif np.isnan(naive_value):
            naive = {"status": "nan", "value": None}
        elif naive_value > 0:
            naive = {"status": "inf", "value": None}
        else:
            naive = {"status": "-inf", "value": None}
        epsilon = 1e-12
        clipped_probability = float(np.clip(probability, epsilon, 1.0 - epsilon))
        clipped_value = float(
            -(label * np.log(clipped_probability)
              + (1 - label) * np.log1p(-clipped_probability))
        )
        stable_value = float(np.logaddexp(0.0, logit) - label * logit)
        fixed_probes.append({
            "source": "synthetic-stability-probe",
            "logit": logit,
            "label": label,
            "probability": probability,
            "naive": naive,
            "clipped": {
                "method": "clipped-probability-bce",
                "status": "finite",
                "value": clipped_value,
                "probability": probability,
                "clippedProbability": clipped_probability,
                "epsilon": epsilon,
                "objectiveChanged": clipped_probability != probability,
            },
            "stable": {
                "method": "stable-logit-bce",
                "status": "finite",
                "value": stable_value,
            },
        })

sweeps = {
    "mse": evaluate_gradient_sweep("mse", [1.0, 2.0], [1.5, 3.0], 1),
    "mae": evaluate_gradient_sweep("mae", [0.0, 2.0], [1.0, 3.0], 0),
    "mae-kink": evaluate_gradient_sweep("mae", [1.0, 2.0], [1.0, 3.0], 0),
    "bce": evaluate_gradient_sweep("bce", [0.0, 1.0], [0.2, -0.4], 1),
}
summary = {
    "contractVersion": "loss-functions-phase-26-output-v1",
    "topicId": "manufacturing-bce-gradients",
    "dataset": {
        "datasetId": dataset_manifest["datasetId"],
        "sha256": dataset_manifest["published"]["sha256"],
        "rowCount": int(labels.size),
        "declaredFeatureCount": dataset_manifest["published"]["declaredFeatureCount"],
        "observedFeatureCount": dataset_manifest["published"]["observedFeatureCount"],
    },
    "aggregate": {
        "meanStableBce": float(np.mean(losses)),
        "rowCount": int(labels.size),
    },
    "rows": rows,
    "highContributionRows": dataset_manifest["auxiliaryPredictions"]["highestContributionRows"],
    "confidentError": dataset_manifest["auxiliaryPredictions"]["confidentError"],
    "fixedProbes": fixed_probes,
    "finiteDifferenceSweeps": sweeps,
    "plot": {
        "path": "outputs/manufacturing-bce-gradients.png",
        "width": 960,
        "height": 540,
        "nonColorEncoding": "Smooth losses use solid circles; MAE kink uses dashed squares",
    },
}
write_strict_json(SUMMARY_PATH, summary)
write_pattern_plot(
    PLOT_PATH,
    title="Manufacturing BCE and gradient verification",
    description="Real SECOM BCE contributions and finite gradient-check errors.",
    non_color_encoding="Smooth losses use solid circle lines; MAE kink uses dashed square line",
    series=(
        ("MSE solid circle", [row["absoluteError"] for row in sweeps["mse"]]),
        ("MAE dashed square", [row["absoluteError"] for row in sweeps["mae-kink"]]),
        ("BCE solid diamond", [row["absoluteError"] for row in sweeps["bce"]]),
    ),
)
print(json.dumps({
    "topicId": summary["topicId"],
    "rowCount": summary["aggregate"]["rowCount"],
    "meanStableBce": summary["aggregate"]["meanStableBce"],
    "confidentErrorStatus": summary["confidentError"]["selectionStatus"],
}, sort_keys=True, allow_nan=False))""",
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
            ("code", "delivery-artifact-helpers"),
            ("code", "delivery-local-paths"),
            ("code", "delivery-build-output"),
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
            ("code", "manufacturing-gradient-sweeps"),
            ("code", "manufacturing-artifact-helpers"),
            ("code", "manufacturing-local-paths"),
            ("code", "manufacturing-build-output"),
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
        cell.metadata.clear()
    notebook.metadata.clear()
    notebook.metadata["kernelspec"] = {
        "display_name": "Python 3",
        "language": "python",
        "name": "python3",
    }
    notebook.metadata["language_info"] = {"name": "python"}
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
        "datasetCandidatePaths": list(DATASET_CANDIDATE_PATHS),
        "datasetContracts": {
            "lade": {
                "expectedRows": LADE_EXPECTED_ROWS,
                "publishedFields": list(LADE_PUBLISHED_FIELDS),
                "referencePredictionMinutes": LADE_REFERENCE_PREDICTION_MINUTES,
            },
            "secom": {
                "expectedRows": SECOM_EXPECTED_ROWS,
                "declaredFeatureCount": SECOM.declared_feature_count,
                "observedFeatureCount": SECOM.observed_feature_count,
                "oofFoldCount": SECOM_OOF_FOLDS,
                "oofRandomState": SECOM_OOF_RANDOM_STATE,
            },
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


def _candidate_source_identity(source: SourceContract, path: Path) -> dict[str, Any]:
    return {
        "pageUrl": source.page_url,
        "downloadUrl": source.download_url,
        "retrievedAt": "2026-07-28",
        "revisionOrDoi": source.revision_or_doi,
        "license": source.license,
        "attribution": source.attribution,
        "sourceSha256": sha256_file(path),
        "sourceBytes": path.stat().st_size,
    }


def _published_file_identity(
    path: Path,
    *,
    staging_relative_path: str,
    row_count: int,
    columns: tuple[str, ...],
    units: dict[str, str],
    missing_value_policy: str,
    representative_row_ids: list[str],
) -> dict[str, Any]:
    return {
        "path": staging_relative_path,
        "sha256": sha256_file(path),
        "bytes": path.stat().st_size,
        "rowCount": row_count,
        "columns": list(columns),
        "units": units,
        "missingValuePolicy": missing_value_policy,
        "representativeRowIds": representative_row_ids,
    }


def _write_csv(
    path: Path,
    fieldnames: tuple[str, ...],
    rows: Iterator[dict[str, Any]] | list[dict[str, Any]],
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=fieldnames,
            lineterminator="\n",
            extrasaction="raise",
        )
        writer.writeheader()
        writer.writerows(rows)


def _regression_teaching_row(role: str, row: dict[str, Any]) -> dict[str, Any]:
    target = float(row["delivery_duration_minutes"])
    prediction = float(LADE_REFERENCE_PREDICTION_MINUTES)
    residual = prediction - target
    return {
        "role": role,
        "courseRowId": row["course_row_id"],
        "sourceRowNumber": row["source_row_number"],
        "targetMinutes": int(target) if target.is_integer() else target,
        "predictionMinutes": LADE_REFERENCE_PREDICTION_MINUTES,
        "residualMinutes": int(residual) if residual.is_integer() else residual,
        "squaredError": residual * residual,
        "absoluteError": abs(residual),
        "mseOutputGradient": 2.0 * residual,
        "maeOutputSubgradient": 0.0 if residual == 0.0 else math.copysign(1.0, residual),
        "maeDifferentiable": residual != 0.0,
        "maeStatus": "kink" if residual == 0.0 else "smooth",
    }


def _typescript_mean(values: list[float]) -> float:
    count = len(values)
    if count == 0:
        raise Phase26Error("Cannot average an empty vector")
    total = 0.0
    for value in values:
        total += value / count
    return total


def _select_lade_representatives(
    rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    zero = next(
        (row for row in rows if row["delivery_duration_minutes"] == 0),
        None,
    )
    typical = next(
        (
            row
            for row in rows
            if row["delivery_duration_minutes"] == LADE_REFERENCE_PREDICTION_MINUTES
        ),
        None,
    )
    maximum = max(
        rows,
        key=lambda row: (
            float(row["delivery_duration_minutes"]),
            -int(row["source_row_number"]),
        ),
    )
    if zero is None or typical is None:
        raise Phase26Error(
            "LaDe representative selection requires real zero-duration and "
            "175-minute zero-residual rows"
        )
    return [
        _regression_teaching_row("zero-duration", zero),
        _regression_teaching_row("typical-zero-residual", typical),
        _regression_teaching_row("long-duration", maximum),
    ]


def _build_lade_candidate(source_cache: Path, dataset_root: Path) -> dict[str, Any]:
    source_path = source_cache / LADE.cache_name
    validated = validate_lade_source(source_path)
    rows = validated["normalizedRows"]
    representatives = _select_lade_representatives(rows)
    candidate_path = dataset_root / "lade-delivery-jilin.csv"
    _write_csv(candidate_path, LADE_PUBLISHED_FIELDS, rows)

    residuals = [
        float(LADE_REFERENCE_PREDICTION_MINUTES)
        - float(row["delivery_duration_minutes"])
        for row in rows
    ]
    aggregate = {
        "mse": _typescript_mean(
            [residual * residual for residual in residuals]
        ),
        "mae": _typescript_mean([abs(residual) for residual in residuals]),
        "rowCount": len(residuals),
    }
    manifest = {
        "contractVersion": CONTRACT_VERSION,
        "datasetId": LADE.dataset_id,
        "source": _candidate_source_identity(LADE, source_path),
        "transform": {
            "version": TRANSFORM_VERSION,
            "generator": GENERATOR_RELATIVE_PATH,
            "generatorSha256": sha256_file(Path(__file__)),
            "rules": [
                "Derive delivery_duration_minutes from accept_time and delivery_time with rollover handling",
                "Assign stable source-order course_row_id values",
                "Retain exactly the approved eight-field privacy-minimized derivative",
            ],
            "targetDefinition": (
                "delivery_duration_minutes = delivery_time - accept_time "
                "with month/day rollover handling"
            ),
            "labelMapping": None,
            "fieldRemovalPolicy": {
                "allowedFields": list(LADE_PUBLISHED_FIELDS),
                "removedSourceFields": list(LADE_REMOVED_FIELDS),
                "policy": (
                    "Exclude order, region, courier, AOI identifier, GPS, coordinate, "
                    "and precise stop fields"
                ),
            },
            "missingValuePolicy": "Reject missing required fields; derived durations must be finite",
        },
        "published": _published_file_identity(
            candidate_path,
            staging_relative_path=DATASET_CANDIDATE_PATHS[0],
            row_count=len(rows),
            columns=LADE_PUBLISHED_FIELDS,
            units={"delivery_duration_minutes": "minutes"},
            missing_value_policy="No missing values in the approved eight published fields",
            representative_row_ids=[
                row["courseRowId"] for row in representatives
            ],
        ),
        "observedFacts": validated["facts"],
        "teachingReference": {
            "kind": "complete-file-fixed-median-arithmetic-baseline",
            "deploymentModel": False,
            "predictionMinutes": LADE_REFERENCE_PREDICTION_MINUTES,
            "aggregate": aggregate,
            "representativeRows": representatives,
        },
    }
    manifest_path = dataset_root / "lade-delivery-jilin-manifest.json"
    manifest_path.write_bytes(strict_json_bytes(manifest))
    return manifest


def _read_secom_rows(
    path: Path,
) -> tuple[list[list[str]], list[int], list[str]]:
    validate_secom_archive(path)
    try:
        with zipfile.ZipFile(path) as archive:
            data_lines = _decode_zip_member(archive, "secom.data").splitlines()
            label_lines = _decode_zip_member(
                archive,
                "secom_labels.data",
            ).splitlines()
    except (OSError, zipfile.BadZipFile, KeyError) as error:
        raise Phase26Error(f"Cannot read normalized SECOM source rows: {error}") from error

    measurements = [line.split() for line in data_lines]
    labels: list[int] = []
    timestamps: list[str] = []
    for line in label_lines:
        raw_label, timestamp = line.split(maxsplit=1)
        labels.append(0 if int(raw_label) == -1 else 1)
        timestamps.append(timestamp.strip().strip('"'))
    return measurements, labels, timestamps


def _stable_sigmoid_scalar(logit: float) -> float:
    if logit >= 0.0:
        exponential = math.exp(-logit)
        return 1.0 / (1.0 + exponential)
    exponential = math.exp(logit)
    return exponential / (1.0 + exponential)


def _stable_bce_scalar(logit: float, label: int) -> float:
    return max(logit, 0.0) + math.log1p(math.exp(-abs(logit))) - label * logit


def _fit_secom_oof_predictions(
    measurements: list[list[str]],
    labels: list[int],
) -> dict[str, Any]:
    try:
        import numpy as np
        from sklearn.impute import SimpleImputer
        from sklearn.linear_model import LogisticRegression
        from sklearn.model_selection import StratifiedKFold
        from sklearn.preprocessing import StandardScaler
    except ImportError as error:
        raise Phase26Error(
            "SECOM OOF generation must run inside the audited Phase 26 environment"
        ) from error

    features = np.asarray(
        [
            [np.nan if value == "NaN" else float(value) for value in row]
            for row in measurements
        ],
        dtype=np.float64,
    )
    targets = np.asarray(labels, dtype=np.int64)
    if features.shape != (SECOM_EXPECTED_ROWS, 590):
        raise Phase26Error(f"SECOM OOF feature shape drifted: {features.shape}")
    if targets.shape != (SECOM_EXPECTED_ROWS,):
        raise Phase26Error(f"SECOM OOF label shape drifted: {targets.shape}")

    logits = np.empty(targets.size, dtype=np.float64)
    fold_ids = np.empty(targets.size, dtype=np.int64)
    retained_feature_counts: list[int] = []
    splitter = StratifiedKFold(
        n_splits=SECOM_OOF_FOLDS,
        shuffle=True,
        random_state=SECOM_OOF_RANDOM_STATE,
    )
    for fold_number, (train_indices, held_out_indices) in enumerate(
        splitter.split(features, targets),
        start=1,
    ):
        imputer = SimpleImputer(strategy="median", keep_empty_features=True)
        train_imputed = imputer.fit_transform(features[train_indices])
        held_out_imputed = imputer.transform(features[held_out_indices])
        if not np.isfinite(train_imputed).all() or not np.isfinite(
            held_out_imputed
        ).all():
            raise Phase26Error(
                f"SECOM fold {fold_number} train-only median imputation remained non-finite"
            )
        keep = np.ptp(train_imputed, axis=0) > 0.0
        if not keep.any():
            raise Phase26Error(f"SECOM fold {fold_number} removed every feature")
        retained_feature_counts.append(int(np.count_nonzero(keep)))
        scaler = StandardScaler()
        train_scaled = scaler.fit_transform(train_imputed[:, keep])
        held_out_scaled = scaler.transform(held_out_imputed[:, keep])
        model = LogisticRegression(
            C=1.0,
            penalty="l2",
            solver="lbfgs",
            max_iter=5000,
            tol=1e-10,
        )
        model.fit(train_scaled, targets[train_indices])
        fold_logits = np.asarray(
            model.decision_function(held_out_scaled),
            dtype=np.float64,
        )
        if fold_logits.shape != (len(held_out_indices),) or not np.isfinite(
            fold_logits
        ).all():
            raise Phase26Error(
                f"SECOM fold {fold_number} produced malformed or non-finite logits"
            )
        logits[held_out_indices] = fold_logits
        fold_ids[held_out_indices] = fold_number

    if not np.isfinite(logits).all() or set(fold_ids.tolist()) != set(
        range(1, SECOM_OOF_FOLDS + 1)
    ):
        raise Phase26Error("SECOM OOF assignment is incomplete")

    rows: list[dict[str, Any]] = []
    for index, (label, logit, fold_id) in enumerate(
        zip(labels, logits.tolist(), fold_ids.tolist(), strict=True),
        start=1,
    ):
        probability = _stable_sigmoid_scalar(float(logit))
        stable_bce = _stable_bce_scalar(float(logit), label)
        per_logit_gradient = probability - label
        rows.append(
            {
                "courseRowId": f"secom-{index:04d}",
                "label": label,
                "fold": int(fold_id),
                "logit": float(logit),
                "probability": probability,
                "stableBce": stable_bce,
                "perLogitGradient": per_logit_gradient,
                "meanObjectiveGradient": per_logit_gradient / len(labels),
            }
        )

    ranked = sorted(
        rows,
        key=lambda row: (-float(row["stableBce"]), str(row["courseRowId"])),
    )
    confident_errors = [
        row
        for row in ranked
        if (
            (row["label"] == 0 and row["probability"] >= SECOM_CONFIDENT_ERROR_THRESHOLD)
            or (
                row["label"] == 1
                and row["probability"] <= 1.0 - SECOM_CONFIDENT_ERROR_THRESHOLD
            )
        )
    ]
    if confident_errors:
        selected = confident_errors[0]
        confident_error: dict[str, Any] = {
            "selectionStatus": "real-oof-row",
            "source": "real-secom-oof-row",
            "confidenceThreshold": SECOM_CONFIDENT_ERROR_THRESHOLD,
            **selected,
        }
    else:
        fallback_logit = 6.0
        fallback_label = 0
        fallback_probability = _stable_sigmoid_scalar(fallback_logit)
        fallback_gradient = fallback_probability - fallback_label
        confident_error = {
            "selectionStatus": "teaching-logit-fallback",
            "source": "synthetic-teaching-logit",
            "courseRowId": None,
            "confidenceThreshold": SECOM_CONFIDENT_ERROR_THRESHOLD,
            "label": fallback_label,
            "fold": None,
            "logit": fallback_logit,
            "probability": fallback_probability,
            "stableBce": _stable_bce_scalar(fallback_logit, fallback_label),
            "perLogitGradient": fallback_gradient,
            "meanObjectiveGradient": None,
        }
    return {
        "kind": "deterministic-five-fold-out-of-fold-logistic",
        "foldCount": SECOM_OOF_FOLDS,
        "randomState": SECOM_OOF_RANDOM_STATE,
        "preprocessing": {
            "fitBoundary": "train-fold-only",
            "imputation": "median",
            "constantFeatureRemoval": True,
            "standardization": "StandardScaler",
            "retainedFeatureCountByFold": retained_feature_counts,
        },
        "model": {
            "type": "LogisticRegression",
            "penalty": "l2",
            "C": 1.0,
            "solver": "lbfgs",
            "maxIter": 5000,
            "tolerance": 1e-10,
        },
        "scoresAreAuxiliaryInputs": True,
        "parameterTrainingLesson": False,
        "rows": rows,
        "aggregate": {
            "meanStableBce": math.fsum(row["stableBce"] for row in rows) / len(rows),
            "labelCounts": {
                "0": labels.count(0),
                "1": labels.count(1),
            },
        },
        "highestContributionRows": ranked[:5],
        "confidentError": confident_error,
    }


def _build_secom_candidate(source_cache: Path, dataset_root: Path) -> dict[str, Any]:
    source_path = source_cache / SECOM.cache_name
    measurements, labels, timestamps = _read_secom_rows(source_path)
    candidate_rows: list[dict[str, Any]] = []
    missing_value_count = 0
    for index, (values, label, timestamp) in enumerate(
        zip(measurements, labels, timestamps, strict=True),
        start=1,
    ):
        normalized_values = []
        for value in values:
            if value == "NaN":
                normalized_values.append("")
                missing_value_count += 1
            else:
                normalized_values.append(value)
        row = {
            "course_row_id": f"secom-{index:04d}",
            "timestamp": timestamp,
            "defect_label": label,
            **dict(zip(SECOM_MEASUREMENT_FIELDS, normalized_values, strict=True)),
        }
        candidate_rows.append(row)

    candidate_path = dataset_root / "secom-manufacturing.csv"
    _write_csv(candidate_path, SECOM_PUBLISHED_FIELDS, candidate_rows)
    oof = _fit_secom_oof_predictions(measurements, labels)
    representative_ids = [
        row["courseRowId"] for row in oof["highestContributionRows"]
    ]
    confident_id = oof["confidentError"].get("courseRowId")
    if confident_id is not None and confident_id not in representative_ids:
        representative_ids.append(confident_id)
    manifest = {
        "contractVersion": CONTRACT_VERSION,
        "datasetId": SECOM.dataset_id,
        "source": _candidate_source_identity(SECOM, source_path),
        "transform": {
            "version": TRANSFORM_VERSION,
            "generator": GENERATOR_RELATIVE_PATH,
            "generatorSha256": sha256_file(Path(__file__)),
            "rules": [
                "Preserve exactly 590 observed measurement fields without padding or truncation",
                "Map raw -1 pass labels to 0 and raw 1 fail labels to 1",
                "Preserve raw NaN values as empty canonical CSV fields",
            ],
            "targetDefinition": (
                "defect_label: 0 means pass and 1 means fail in the in-house line test"
            ),
            "labelMapping": {"-1": 0, "1": 1},
            "fieldRemovalPolicy": {
                "removedSourceFields": [],
                "policy": "No measurement field is padded, truncated, or silently repaired",
            },
            "missingValuePolicy": (
                "Preserve raw NaN as empty CSV fields; no canonical imputation"
            ),
        },
        "published": {
            **_published_file_identity(
                candidate_path,
                staging_relative_path=DATASET_CANDIDATE_PATHS[2],
                row_count=len(candidate_rows),
                columns=SECOM_PUBLISHED_FIELDS,
                units={
                    "timestamp": "source timestamp",
                    "defect_label": "binary 0/1",
                    "measurements": "source-defined process measurements",
                },
                missing_value_policy=(
                    "Preserve raw NaN as empty CSV fields; no canonical imputation"
                ),
                representative_row_ids=representative_ids,
            ),
            "declaredFeatureCount": SECOM.declared_feature_count,
            "observedFeatureCount": SECOM.observed_feature_count,
            "missingValueCount": missing_value_count,
            "labelCounts": {"0": labels.count(0), "1": labels.count(1)},
        },
        "auxiliaryPredictions": oof,
    }
    manifest_path = dataset_root / "secom-manufacturing-manifest.json"
    manifest_path.write_bytes(strict_json_bytes(manifest))
    return manifest


def _attribution_text() -> str:
    return """# Phase 26 Loss Functions Dataset Attribution

## LaDe-D Jilin delivery data

- Source: Cainiao-AI LaDe, pinned revision `be2cec02775cafc8d52230303f32134382bcc50b`
- Source page: https://huggingface.co/datasets/Cainiao-AI/LaDe
- License: Apache-2.0
- Attribution: Cainiao-AI LaDe dataset card and the LaDe paper, arXiv:2306.10675
- Course derivative: all 31,415 Jilin delivery rows with exactly eight coarse fields.
  Order, region, courier, AOI identifier, GPS, coordinate, and precise stop fields
  are excluded under the approved privacy boundary.

## UCI SECOM manufacturing data

- Source: UCI Machine Learning Repository SECOM dataset
- DOI: 10.24432/C54305
- Source page: https://archive.ics.uci.edu/dataset/179/secom
- License: CC BY 4.0
- Course derivative: all 1,567 rows, raw missing values preserved, `-1` mapped
  to pass label `0`, and `1` mapped to fail label `1`.
- Schema note: upstream metadata declares 591 features while the pinned raw file
  contains exactly 590 measurement values per row. The course copy records both
  facts and does not pad, truncate, or impute the canonical CSV.
"""


def build_dataset_candidates(source_cache: Path, staging_root: Path) -> dict[str, Any]:
    dataset_root = staging_root / "datasets/loss-functions"
    dataset_root.mkdir(parents=True, exist_ok=True)
    lade_manifest = _build_lade_candidate(source_cache, dataset_root)
    secom_manifest = _build_secom_candidate(source_cache, dataset_root)
    (dataset_root / "ATTRIBUTION.md").write_text(
        _attribution_text(),
        encoding="utf-8",
        newline="\n",
    )
    return {
        "lade": lade_manifest,
        "secom": secom_manifest,
    }


def _validate_candidate_source_manifest(
    value: Any,
    source: SourceContract,
) -> None:
    if not isinstance(value, dict):
        raise Phase26Error(f"{source.dataset_id} source manifest is missing")
    required = {
        "pageUrl": source.page_url,
        "downloadUrl": source.download_url,
        "retrievedAt": "2026-07-28",
        "revisionOrDoi": source.revision_or_doi,
        "license": source.license,
        "attribution": source.attribution,
        "sourceSha256": source.sha256,
    }
    for key, expected in required.items():
        if value.get(key) != expected:
            raise Phase26Error(
                f"{source.dataset_id} source manifest {key}, license, or identity drifted"
            )
    if not isinstance(value.get("sourceBytes"), int) or value["sourceBytes"] <= 0:
        raise Phase26Error(f"{source.dataset_id} source byte count is invalid")
    if (
        source.expected_bytes is not None
        and value["sourceBytes"] != source.expected_bytes
    ):
        raise Phase26Error(f"{source.dataset_id} source byte count drifted")


def _validate_candidate_generator(
    value: Any,
    dataset_id: str,
    expected_generator_sha256: str,
) -> None:
    if not isinstance(value, dict):
        raise Phase26Error(f"{dataset_id} transform manifest is missing")
    if (
        value.get("version") != TRANSFORM_VERSION
        or value.get("generator") != GENERATOR_RELATIVE_PATH
        or value.get("generatorSha256") != expected_generator_sha256
    ):
        raise Phase26Error(f"{dataset_id} generator or transformation hash drifted")
    if not isinstance(value.get("rules"), list) or not value["rules"]:
        raise Phase26Error(f"{dataset_id} transformation rules are missing")


def _verify_lade_candidate(
    dataset_root: Path,
    expected_generator_sha256: str,
) -> dict[str, Any]:
    candidate_path = dataset_root / "lade-delivery-jilin.csv"
    manifest_path = dataset_root / "lade-delivery-jilin-manifest.json"
    manifest = read_strict_json(manifest_path)
    if (
        manifest.get("contractVersion") != CONTRACT_VERSION
        or manifest.get("datasetId") != LADE.dataset_id
    ):
        raise Phase26Error("LaDe candidate manifest contract or dataset ID drifted")
    _validate_candidate_source_manifest(manifest.get("source"), LADE)
    transform = manifest.get("transform")
    _validate_candidate_generator(
        transform,
        LADE.dataset_id,
        expected_generator_sha256,
    )
    if transform.get("targetDefinition") != (
        "delivery_duration_minutes = delivery_time - accept_time "
        "with month/day rollover handling"
    ):
        raise Phase26Error("LaDe target definition drifted")
    if transform.get("labelMapping") is not None:
        raise Phase26Error("LaDe candidate must not invent a label mapping")
    removal = transform.get("fieldRemovalPolicy")
    if removal != {
        "allowedFields": list(LADE_PUBLISHED_FIELDS),
        "removedSourceFields": list(LADE_REMOVED_FIELDS),
        "policy": (
            "Exclude order, region, courier, AOI identifier, GPS, coordinate, "
            "and precise stop fields"
        ),
    }:
        raise Phase26Error("LaDe privacy field-removal policy drifted")

    rows: list[dict[str, Any]] = []
    try:
        with candidate_path.open(encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            if tuple(reader.fieldnames or ()) != LADE_PUBLISHED_FIELDS:
                raise Phase26Error("LaDe candidate privacy schema drifted")
            for expected_number, source_row in enumerate(reader, start=1):
                try:
                    source_number = int(source_row["source_row_number"])
                    duration = float(source_row["delivery_duration_minutes"])
                except (TypeError, ValueError) as error:
                    raise Phase26Error(
                        f"LaDe candidate row {expected_number} contains invalid numbers"
                    ) from error
                row = {
                    **source_row,
                    "source_row_number": source_number,
                    "delivery_duration_minutes": (
                        int(duration) if duration.is_integer() else duration
                    ),
                }
                if (
                    source_number != expected_number
                    or row["course_row_id"] != f"lade-jilin-{expected_number:05d}"
                ):
                    raise Phase26Error(
                        f"LaDe candidate stable course ID drifted at row {expected_number}"
                    )
                for field in ("city", "aoi_type", "accept_time", "delivery_time", "ds"):
                    if not row[field]:
                        raise Phase26Error(
                            f"LaDe candidate row {expected_number} has empty {field}"
                        )
                _validate_lade_candidate(row, row_number=expected_number)
                rows.append(row)
    except OSError as error:
        raise Phase26Error(f"Cannot read LaDe candidate: {error}") from error
    if len(rows) != LADE_EXPECTED_ROWS:
        raise Phase26Error(
            f"LaDe candidate row count drift: expected {LADE_EXPECTED_ROWS}, got {len(rows)}"
        )
    validate_lade_candidates(rows)

    representatives = _select_lade_representatives(rows)
    residuals = [
        float(LADE_REFERENCE_PREDICTION_MINUTES)
        - float(row["delivery_duration_minutes"])
        for row in rows
    ]
    aggregate = {
        "mse": _typescript_mean(
            [residual * residual for residual in residuals]
        ),
        "mae": _typescript_mean([abs(residual) for residual in residuals]),
        "rowCount": len(rows),
    }
    durations = [float(row["delivery_duration_minutes"]) for row in rows]
    observed_facts = manifest.get("observedFacts")
    if not isinstance(observed_facts, dict) or any(
        (
            observed_facts.get("rowCount") != len(rows),
            observed_facts.get("publishedFields") != list(LADE_PUBLISHED_FIELDS),
            observed_facts.get("removedFields") != list(LADE_REMOVED_FIELDS),
            observed_facts.get("durationMinimumMinutes") != min(durations),
            observed_facts.get("durationMaximumMinutes") != max(durations),
            observed_facts.get("durationMedianMinutes") != median(durations),
            observed_facts.get("zeroDurationRows")
            != sum(duration == 0 for duration in durations),
            observed_facts.get("over24HourRows")
            != sum(duration > 24 * 60 for duration in durations),
        )
    ):
        raise Phase26Error("LaDe candidate observed facts drifted")

    teaching = manifest.get("teachingReference")
    if teaching != {
        "kind": "complete-file-fixed-median-arithmetic-baseline",
        "deploymentModel": False,
        "predictionMinutes": LADE_REFERENCE_PREDICTION_MINUTES,
        "aggregate": aggregate,
        "representativeRows": representatives,
    }:
        raise Phase26Error(
            "LaDe representative rows or MSE/MAE teaching arithmetic drifted"
        )
    published = manifest.get("published")
    expected_published = _published_file_identity(
        candidate_path,
        staging_relative_path=DATASET_CANDIDATE_PATHS[0],
        row_count=len(rows),
        columns=LADE_PUBLISHED_FIELDS,
        units={"delivery_duration_minutes": "minutes"},
        missing_value_policy="No missing values in the approved eight published fields",
        representative_row_ids=[
            row["courseRowId"] for row in representatives
        ],
    )
    if published != expected_published:
        raise Phase26Error("LaDe published candidate hash, schema, or manifest drifted")
    return {
        "rowCount": len(rows),
        "columnCount": len(LADE_PUBLISHED_FIELDS),
        "durationMinimumMinutes": min(durations),
        "durationMedianMinutes": median(durations),
        "durationMaximumMinutes": max(durations),
        "referencePredictionMinutes": LADE_REFERENCE_PREDICTION_MINUTES,
        "aggregate": aggregate,
        "representativeRoles": [
            row["role"] for row in representatives
        ],
    }


def _verify_secom_oof(
    value: Any,
    labels_by_id: dict[str, int],
) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise Phase26Error("SECOM auxiliary OOF prediction contract is missing")
    if (
        value.get("kind")
        != "deterministic-five-fold-out-of-fold-logistic"
        or value.get("foldCount") != SECOM_OOF_FOLDS
        or value.get("randomState") != SECOM_OOF_RANDOM_STATE
        or value.get("scoresAreAuxiliaryInputs") is not True
        or value.get("parameterTrainingLesson") is not False
    ):
        raise Phase26Error("SECOM OOF identity or auxiliary-input boundary drifted")
    preprocessing = value.get("preprocessing")
    if not isinstance(preprocessing, dict) or any(
        (
            preprocessing.get("fitBoundary") != "train-fold-only",
            preprocessing.get("imputation") != "median",
            preprocessing.get("constantFeatureRemoval") is not True,
            preprocessing.get("standardization") != "StandardScaler",
            not isinstance(preprocessing.get("retainedFeatureCountByFold"), list),
            len(preprocessing.get("retainedFeatureCountByFold", []))
            != SECOM_OOF_FOLDS,
        )
    ):
        raise Phase26Error("SECOM OOF train-fold-only preprocessing drifted")
    if value.get("model") != {
        "type": "LogisticRegression",
        "penalty": "l2",
        "C": 1.0,
        "solver": "lbfgs",
        "maxIter": 5000,
        "tolerance": 1e-10,
    }:
        raise Phase26Error("SECOM OOF logistic model contract drifted")

    rows = value.get("rows")
    if not isinstance(rows, list) or len(rows) != SECOM_EXPECTED_ROWS:
        raise Phase26Error("SECOM OOF score row count drifted")
    seen: set[str] = set()
    for row in rows:
        if not isinstance(row, dict):
            raise Phase26Error("SECOM OOF row is malformed")
        course_id = row.get("courseRowId")
        if course_id in seen or course_id not in labels_by_id:
            raise Phase26Error(f"SECOM OOF course ID drifted: {course_id!r}")
        seen.add(course_id)
        label = labels_by_id[course_id]
        if row.get("label") != label or row.get("fold") not in range(
            1,
            SECOM_OOF_FOLDS + 1,
        ):
            raise Phase26Error(f"SECOM OOF label/fold drifted for {course_id}")
        try:
            logit = float(row["logit"])
            probability = float(row["probability"])
            stable_bce = float(row["stableBce"])
            gradient = float(row["perLogitGradient"])
            mean_gradient = float(row["meanObjectiveGradient"])
        except (KeyError, TypeError, ValueError) as error:
            raise Phase26Error(
                f"SECOM OOF row {course_id} contains malformed numeric values"
            ) from error
        if not all(
            math.isfinite(number)
            for number in (
                logit,
                probability,
                stable_bce,
                gradient,
                mean_gradient,
            )
        ):
            raise Phase26Error(f"SECOM OOF row {course_id} is non-finite")
        expected_probability = _stable_sigmoid_scalar(logit)
        expected_gradient = expected_probability - label
        if any(
            (
                abs(probability - expected_probability) > 1e-15,
                abs(stable_bce - _stable_bce_scalar(logit, label)) > 1e-12,
                abs(gradient - expected_gradient) > 1e-15,
                abs(mean_gradient - expected_gradient / SECOM_EXPECTED_ROWS)
                > 1e-18,
            )
        ):
            raise Phase26Error(
                f"SECOM OOF BCE or gradient arithmetic drifted for {course_id}"
            )
    if seen != set(labels_by_id):
        raise Phase26Error("SECOM OOF score inventory is incomplete")

    ranked = sorted(
        rows,
        key=lambda row: (-float(row["stableBce"]), str(row["courseRowId"])),
    )
    if value.get("highestContributionRows") != ranked[:5]:
        raise Phase26Error("SECOM OOF contribution ranking drifted")
    aggregate = value.get("aggregate")
    expected_aggregate = {
        "meanStableBce": math.fsum(float(row["stableBce"]) for row in rows)
        / len(rows),
        "labelCounts": {
            "0": sum(label == 0 for label in labels_by_id.values()),
            "1": sum(label == 1 for label in labels_by_id.values()),
        },
    }
    if aggregate != expected_aggregate:
        raise Phase26Error("SECOM OOF aggregate BCE drifted")

    confident = value.get("confidentError")
    if not isinstance(confident, dict) or confident.get(
        "confidenceThreshold"
    ) != SECOM_CONFIDENT_ERROR_THRESHOLD:
        raise Phase26Error("SECOM confident-error selection contract drifted")
    if confident.get("selectionStatus") == "real-oof-row":
        course_id = confident.get("courseRowId")
        matching = next(
            (row for row in rows if row["courseRowId"] == course_id),
            None,
        )
        if (
            confident.get("source") != "real-secom-oof-row"
            or matching is None
            or any(confident.get(key) != matching.get(key) for key in matching)
            or not (
                (
                    matching["label"] == 0
                    and matching["probability"] >= SECOM_CONFIDENT_ERROR_THRESHOLD
                )
                or (
                    matching["label"] == 1
                    and matching["probability"]
                    <= 1.0 - SECOM_CONFIDENT_ERROR_THRESHOLD
                )
            )
        ):
            raise Phase26Error(
                "SECOM real confident-error provenance or threshold drifted"
            )
    elif confident.get("selectionStatus") == "teaching-logit-fallback":
        if (
            confident.get("source") != "synthetic-teaching-logit"
            or confident.get("courseRowId") is not None
            or confident.get("meanObjectiveGradient") is not None
        ):
            raise Phase26Error(
                "SECOM teaching-logit fallback is mislabeled as a real row"
            )
    else:
        raise Phase26Error("SECOM confident-error status is unsupported")
    return {
        "meanStableBce": expected_aggregate["meanStableBce"],
        "confidentErrorStatus": confident["selectionStatus"],
    }


def _verify_secom_candidate(
    dataset_root: Path,
    expected_generator_sha256: str,
) -> dict[str, Any]:
    candidate_path = dataset_root / "secom-manufacturing.csv"
    manifest_path = dataset_root / "secom-manufacturing-manifest.json"
    manifest = read_strict_json(manifest_path)
    if (
        manifest.get("contractVersion") != CONTRACT_VERSION
        or manifest.get("datasetId") != SECOM.dataset_id
    ):
        raise Phase26Error("SECOM candidate manifest contract or dataset ID drifted")
    _validate_candidate_source_manifest(manifest.get("source"), SECOM)
    transform = manifest.get("transform")
    _validate_candidate_generator(
        transform,
        SECOM.dataset_id,
        expected_generator_sha256,
    )
    if transform.get("labelMapping") != {"-1": 0, "1": 1}:
        raise Phase26Error("SECOM candidate label mapping drifted")
    if transform.get("missingValuePolicy") != (
        "Preserve raw NaN as empty CSV fields; no canonical imputation"
    ):
        raise Phase26Error("SECOM candidate missing-value policy drifted")
    if transform.get("fieldRemovalPolicy") != {
        "removedSourceFields": [],
        "policy": "No measurement field is padded, truncated, or silently repaired",
    }:
        raise Phase26Error("SECOM candidate field policy drifted")

    labels_by_id: dict[str, int] = {}
    missing_value_count = 0
    try:
        with candidate_path.open(encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            if tuple(reader.fieldnames or ()) != SECOM_PUBLISHED_FIELDS:
                raise Phase26Error(
                    "SECOM candidate schema drifted; exact observed width remains 590"
                )
            for expected_number, row in enumerate(reader, start=1):
                course_id = row["course_row_id"]
                if course_id != f"secom-{expected_number:04d}":
                    raise Phase26Error(
                        f"SECOM candidate stable course ID drifted at row {expected_number}"
                    )
                try:
                    label = int(row["defect_label"])
                except (TypeError, ValueError) as error:
                    raise Phase26Error(
                        f"SECOM candidate row {expected_number} has invalid label"
                    ) from error
                if label not in {0, 1}:
                    raise Phase26Error(
                        f"SECOM candidate row {expected_number} uses a non-binary label"
                    )
                try:
                    datetime.strptime(row["timestamp"], "%d/%m/%Y %H:%M:%S")
                except ValueError as error:
                    raise Phase26Error(
                        f"SECOM candidate row {expected_number} has invalid timestamp"
                    ) from error
                for field in SECOM_MEASUREMENT_FIELDS:
                    value = row[field]
                    if value == "":
                        missing_value_count += 1
                        continue
                    try:
                        numeric = float(value)
                    except ValueError as error:
                        raise Phase26Error(
                            f"SECOM candidate row {expected_number} field {field} is invalid"
                        ) from error
                    if not math.isfinite(numeric):
                        raise Phase26Error(
                            f"SECOM candidate row {expected_number} field {field} is non-finite"
                        )
                labels_by_id[course_id] = label
    except OSError as error:
        raise Phase26Error(f"Cannot read SECOM candidate: {error}") from error
    if len(labels_by_id) != SECOM_EXPECTED_ROWS:
        raise Phase26Error(
            f"SECOM candidate row count drift: expected {SECOM_EXPECTED_ROWS}, "
            f"got {len(labels_by_id)}"
        )
    if Counter(labels_by_id.values()) != Counter({0: 1463, 1: 104}):
        raise Phase26Error("SECOM candidate label counts drifted")

    oof = _verify_secom_oof(
        manifest.get("auxiliaryPredictions"),
        labels_by_id,
    )
    auxiliary = manifest["auxiliaryPredictions"]
    representative_ids = [
        row["courseRowId"] for row in auxiliary["highestContributionRows"]
    ]
    confident_id = auxiliary["confidentError"].get("courseRowId")
    if confident_id is not None and confident_id not in representative_ids:
        representative_ids.append(confident_id)
    expected_published = {
        **_published_file_identity(
            candidate_path,
            staging_relative_path=DATASET_CANDIDATE_PATHS[2],
            row_count=SECOM_EXPECTED_ROWS,
            columns=SECOM_PUBLISHED_FIELDS,
            units={
                "timestamp": "source timestamp",
                "defect_label": "binary 0/1",
                "measurements": "source-defined process measurements",
            },
            missing_value_policy=(
                "Preserve raw NaN as empty CSV fields; no canonical imputation"
            ),
            representative_row_ids=representative_ids,
        ),
        "declaredFeatureCount": 591,
        "observedFeatureCount": 590,
        "missingValueCount": missing_value_count,
        "labelCounts": {
            "0": sum(label == 0 for label in labels_by_id.values()),
            "1": sum(label == 1 for label in labels_by_id.values()),
        },
    }
    if manifest.get("published") != expected_published:
        raise Phase26Error("SECOM candidate hash, 590/591 schema, or manifest drifted")
    return {
        "rowCount": SECOM_EXPECTED_ROWS,
        "columnCount": len(SECOM_PUBLISHED_FIELDS),
        "declaredFeatureCount": 591,
        "observedFeatureCount": 590,
        "missingValueCount": missing_value_count,
        "oof": oof,
    }


def verify_dataset_candidates(
    staging_root: Path,
    *,
    expected_generator_sha256: str = VALIDATED_CANDIDATE_GENERATOR_SHA256,
) -> dict[str, Any]:
    dataset_root = staging_root / "datasets/loss-functions"
    if not dataset_root.is_dir():
        raise Phase26Error(f"Candidate dataset group is missing: {dataset_root}")
    actual = {
        path.name
        for path in dataset_root.iterdir()
        if path.is_file()
    }
    expected = {
        Path(relative_path).name
        for relative_path in DATASET_CANDIDATE_PATHS
    }
    if actual != expected:
        raise Phase26Error(
            f"Candidate dataset inventory drifted: "
            f"missing={sorted(expected - actual)}, unexpected={sorted(actual - expected)}"
        )
    attribution_path = dataset_root / "ATTRIBUTION.md"
    if attribution_path.read_text(encoding="utf-8") != _attribution_text():
        raise Phase26Error("Candidate dataset attribution or license evidence drifted")
    result = {
        "lade": _verify_lade_candidate(
            dataset_root,
            expected_generator_sha256,
        ),
        "secom": _verify_secom_candidate(
            dataset_root,
            expected_generator_sha256,
        ),
    }
    return result


def _run_isolated_worker(
    isolated: IsolatedEnvironment,
    function_name: str,
    arguments: list[str],
) -> None:
    payload = json.dumps(
        {
            "generator": str(Path(__file__).resolve()),
            "function": function_name,
            "arguments": arguments,
        }
    )
    worker = r'''
import importlib.util
import json
import os
from pathlib import Path
import sys

payload = json.loads(os.environ["ML_ATLAS_PHASE26_WORKER_PAYLOAD"])
spec = importlib.util.spec_from_file_location("phase26_worker_module", payload["generator"])
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)
function = getattr(module, payload["function"])
function(*(Path(value) for value in payload["arguments"]))
'''
    environment = isolated.environment.copy()
    environment["ML_ATLAS_PHASE26_WORKER_PAYLOAD"] = payload
    environment["ML_ATLAS_PHASE26_KERNEL_NAME"] = isolated.kernel_name
    run_command(
        [str(isolated.python), "-c", worker],
        environment=environment,
    )


def prepare_dataset_candidates(
    cache: Path,
    staging_root: Path,
    wheel_cache: Path = DEFAULT_WHEEL_CACHE,
) -> dict[str, Any]:
    validated_root = validate_candidate_staging_root(staging_root)
    try:
        verify_source_cache(cache)
        validate_environment_contract(wheel_cache=wheel_cache)
        with candidate_transaction(validated_root) as transaction:
            with isolated_environment(wheel_cache) as isolated:
                _run_isolated_worker(
                    isolated,
                    "build_dataset_candidates",
                    [str(cache.resolve()), str(transaction.root)],
                )
            return verify_dataset_candidates(
                transaction.root,
                expected_generator_sha256=sha256_file(Path(__file__)),
            )
    except BaseException:
        _remove_candidate_root(validated_root)
        raise


def _notebook_job_payload(job: NotebookExecutionJob) -> dict[str, Any]:
    return {
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


def _build_notebook_document(topic_id: str, locale: str) -> Any:
    try:
        import nbformat
    except ImportError as error:
        raise Phase26Error(
            "Notebook generation must run inside the audited Phase 26 environment"
        ) from error
    notebook = nbformat.v4.new_notebook()
    notebook.metadata = {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3",
        },
        "language_info": {"name": "python"},
    }
    cells = []
    for blueprint in notebook_blueprint(topic_id, locale):
        if blueprint["kind"] == "markdown":
            cell = nbformat.v4.new_markdown_cell(blueprint["source"])
        else:
            cell = nbformat.v4.new_code_cell(blueprint["source"])
        cell["id"] = blueprint["id"]
        cell["metadata"] = {}
        cells.append(cell)
    notebook.cells = cells
    return notebook


def _execute_notebook_document(
    notebook: Any,
    job: NotebookExecutionJob,
    kernel_name: str,
    working_directory: Path,
) -> Any:
    namespace: dict[str, Any] = {}
    exec(NOTEBOOK_EXECUTION_WORKER_SOURCE, namespace)
    return namespace["execute_candidate_notebook"](
        notebook,
        _notebook_job_payload(job),
        kernel_name,
        working_directory,
    )


def build_notebook_candidates(staging_root: Path) -> None:
    try:
        import nbformat
    except ImportError as error:
        raise Phase26Error(
            "Notebook generation must run inside the audited Phase 26 environment"
        ) from error
    kernel_name = os.environ.get("ML_ATLAS_PHASE26_KERNEL_NAME")
    if not kernel_name or not re.fullmatch(r"ml-atlas-phase26-[a-f0-9]{32}", kernel_name):
        raise Phase26Error("Runtime-only isolated kernelspec identity is missing")
    notebook_root = staging_root / "notebooks/loss-functions"
    notebook_root.mkdir(parents=True, exist_ok=True)
    (notebook_root / "outputs").mkdir(parents=True, exist_ok=True)
    for job in candidate_execution_jobs():
        notebook = _build_notebook_document(job.topic_id, job.locale)
        executed = _execute_notebook_document(
            notebook,
            job,
            kernel_name,
            notebook_root,
        )
        destination = staging_root / job.notebook_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(
            nbformat.writes(executed, version=4),
            encoding="utf-8",
            newline="\n",
        )


def _candidate_environment_record(
    observed_versions: dict[str, str],
) -> dict[str, Any]:
    contract = read_strict_json(ENVIRONMENT_CONTRACT_PATH)
    return {
        "contractVersion": "loss-functions-phase-26-candidate-environment-v1",
        "requirements": {
            "path": "notebooks/loss-functions/requirements.txt",
            "sha256": sha256_file(REQUIREMENTS_PATH),
            "pins": EXPECTED_ENVIRONMENT_PINS,
        },
        "python": contract["python"],
        "platform": contract["platform"],
        "packages": observed_versions,
        "wheelCache": {
            "sourceContractVersion": contract["wheelCache"][
                "sourceContractVersion"
            ],
            "manifestSha256": contract["wheelCache"]["manifestSha256"],
            "wheelCount": contract["wheelCache"]["wheelCount"],
        },
        "execution": {
            "networkAccess": False,
            "freshKernelJobs": 4,
            "allowErrors": False,
            "kernelNamePublished": False,
            "temporaryPathsPublished": False,
        },
    }


def _notebook_source_text(cell: dict[str, Any]) -> str:
    source = cell.get("source", "")
    if isinstance(source, list):
        return "".join(source)
    if isinstance(source, str):
        return source
    raise Phase26Error(f"Notebook cell {cell.get('id')} has malformed source")


def _notebook_code_payload(notebook: dict[str, Any]) -> list[dict[str, str]]:
    return [
        {
            "id": str(cell.get("id")),
            "source": _notebook_source_text(cell),
        }
        for cell in notebook.get("cells", [])
        if cell.get("cell_type") == "code"
    ]


def _notebook_output_payload(notebook: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        {
            "id": str(cell.get("id")),
            "outputs": cell.get("outputs", []),
        }
        for cell in notebook.get("cells", [])
        if cell.get("cell_type") == "code"
    ]


def _sha256_json(value: Any) -> str:
    return hashlib.sha256(strict_json_bytes(value)).hexdigest()


def _candidate_role(relative_path: str) -> str:
    if relative_path.endswith("outputs/manifest.json"):
        return "candidate-manifest"
    if relative_path.endswith(".ipynb"):
        return "executed-notebook"
    if relative_path.endswith("-manifest.json"):
        return "dataset-manifest"
    if relative_path.endswith(".csv"):
        return "dataset"
    if relative_path.endswith(".png"):
        return "plot"
    if relative_path.endswith("summary.json"):
        return "locked-summary"
    if relative_path.endswith("requirements.txt"):
        return "requirements"
    if relative_path.endswith("environment.json"):
        return "environment"
    if relative_path.endswith("ATTRIBUTION.md"):
        return "attribution"
    raise Phase26Error(f"Candidate inventory member has no role: {relative_path}")


def build_candidate_manifest(staging_root: Path) -> dict[str, Any]:
    inventory = candidate_inventory()
    execution_proofs: list[dict[str, Any]] = []
    locale_notebooks: dict[str, dict[str, dict[str, Any]]] = {
        topic_id: {} for topic_id in NOTEBOOK_TOPIC_IDS
    }
    for job in inventory.execution_jobs:
        path = staging_root / job.notebook_path
        notebook = read_strict_json(path)
        code_payload = _notebook_code_payload(notebook)
        output_payload = _notebook_output_payload(notebook)
        locale_notebooks[job.topic_id][job.locale] = {
            "code": code_payload,
            "outputs": output_payload,
        }
        execution_proofs.append(
            {
                **_notebook_job_payload(job),
                "notebookSha256": sha256_file(path),
                "codeSha256": _sha256_json(code_payload),
                "normalizedOutputSha256": _sha256_json(output_payload),
            }
        )

    locale_parity: dict[str, Any] = {}
    for topic_id, locales in locale_notebooks.items():
        zh = locales["zh-CN"]
        en = locales["en"]
        if zh["code"] != en["code"]:
            raise Phase26Error(f"{topic_id} locale code parity drifted")
        if zh["outputs"] != en["outputs"]:
            raise Phase26Error(f"{topic_id} locale output parity drifted")
        locale_parity[topic_id] = {
            "locales": list(NOTEBOOK_LOCALES),
            "codeCellIds": [cell["id"] for cell in zh["code"]],
            "codeSha256": _sha256_json(zh["code"]),
            "normalizedOutputSha256": _sha256_json(zh["outputs"]),
        }

    members: list[dict[str, Any]] = []
    for relative_path in inventory.paths:
        path = staging_root / relative_path
        role = _candidate_role(relative_path)
        if role == "candidate-manifest":
            members.append(
                {
                    "path": relative_path,
                    "role": role,
                    "sha256": None,
                    "bytes": None,
                    "selfHashExcluded": True,
                }
            )
        else:
            if not path.is_file():
                raise Phase26Error(
                    f"Candidate inventory member is missing before manifest: {relative_path}"
                )
            members.append(
                {
                    "path": relative_path,
                    "role": role,
                    "sha256": sha256_file(path),
                    "bytes": path.stat().st_size,
                }
            )

    dataset_root = staging_root / "datasets/loss-functions"
    lade = read_strict_json(
        dataset_root / "lade-delivery-jilin-manifest.json"
    )
    secom = read_strict_json(
        dataset_root / "secom-manufacturing-manifest.json"
    )
    environment_path = staging_root / "notebooks/loss-functions/environment.json"
    manifest = {
        "contractVersion": "loss-functions-phase-26-candidate-v1",
        "packageComplete": True,
        "publicationAllowed": False,
        "requirements": ["LOSS-01", "LOSS-02", "LOSS-03"],
        "generator": {
            "path": GENERATOR_RELATIVE_PATH,
            "sha256": sha256_file(Path(__file__)),
        },
        "datasets": {
            LADE.dataset_id: {
                "sourceSha256": lade["source"]["sourceSha256"],
                "candidateSha256": lade["published"]["sha256"],
                "rowCount": lade["published"]["rowCount"],
            },
            SECOM.dataset_id: {
                "sourceSha256": secom["source"]["sourceSha256"],
                "candidateSha256": secom["published"]["sha256"],
                "rowCount": secom["published"]["rowCount"],
                "declaredFeatureCount": 591,
                "observedFeatureCount": 590,
            },
        },
        "environment": {
            "path": "notebooks/loss-functions/environment.json",
            "sha256": sha256_file(environment_path),
            "requirementsSha256": sha256_file(REQUIREMENTS_PATH),
        },
        "inventory": members,
        "executionProofs": execution_proofs,
        "localeParity": locale_parity,
        "standaloneRerunExpectation": {
            "notebookCount": 4,
            "freshKernelEach": True,
            "offline": True,
            "allowErrors": False,
            "normalizedOutputsMustMatch": True,
            "datasetPathsArePackageRelative": True,
        },
        "canonicalPayloadSha256": None,
    }
    manifest["canonicalPayloadSha256"] = _sha256_json(manifest)
    manifest_path = staging_root / CANDIDATE_PATHS[-1]
    manifest_path.write_bytes(strict_json_bytes(manifest))
    return manifest


def _parse_png_contract(path: Path) -> dict[str, Any]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n" or len(data) < 33:
        raise Phase26Error(f"Candidate plot is not a valid PNG: {path}")
    offset = 8
    width: int | None = None
    height: int | None = None
    metadata: dict[str, str] = {}
    saw_end = False
    while offset < len(data):
        if offset + 12 > len(data):
            raise Phase26Error(f"Candidate PNG chunk is truncated: {path}")
        length = int.from_bytes(data[offset : offset + 4], "big")
        kind = data[offset + 4 : offset + 8]
        payload = data[offset + 8 : offset + 8 + length]
        checksum = int.from_bytes(
            data[offset + 8 + length : offset + 12 + length],
            "big",
        )
        if len(payload) != length or zlib.crc32(kind + payload) & 0xFFFFFFFF != checksum:
            raise Phase26Error(f"Candidate PNG chunk checksum drifted: {path}")
        if kind == b"IHDR":
            width = int.from_bytes(payload[:4], "big")
            height = int.from_bytes(payload[4:8], "big")
        elif kind == b"tEXt":
            key, separator, value = payload.partition(b"\x00")
            if not separator:
                raise Phase26Error(f"Candidate PNG text metadata is malformed: {path}")
            metadata[key.decode("latin1")] = value.decode("latin1")
        elif kind == b"IEND":
            saw_end = True
        offset += 12 + length
    if not saw_end or width != 960 or height != 540:
        raise Phase26Error(f"Candidate plot dimensions or IEND drifted: {path}")
    for key in ("Title", "Description", "NonColorEncoding", "Software"):
        if not metadata.get(key):
            raise Phase26Error(f"Candidate plot metadata {key} is missing: {path}")
    if not re.search(
        r"solid|hatched|circle|square|diamond|line",
        metadata["NonColorEncoding"],
        flags=re.IGNORECASE,
    ):
        raise Phase26Error(f"Candidate plot lacks a non-color encoding: {path}")
    return {
        "width": width,
        "height": height,
        "metadata": metadata,
    }


def _verify_executed_notebook(
    staging_root: Path,
    job: NotebookExecutionJob,
) -> dict[str, Any]:
    path = staging_root / job.notebook_path
    notebook = read_strict_json(path)
    if notebook.get("nbformat") != 4:
        raise Phase26Error(f"{job.proof_id} Notebook format drifted")
    if notebook.get("metadata") != {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3",
        },
        "language_info": {"name": "python"},
    }:
        raise Phase26Error(
            f"{job.proof_id} contains a machine-specific or unexpected kernelspec"
        )
    expected_blueprint = notebook_blueprint(job.topic_id, job.locale)
    cells = notebook.get("cells")
    if not isinstance(cells, list) or len(cells) != len(expected_blueprint):
        raise Phase26Error(f"{job.proof_id} cell inventory drifted")
    execution_count = 1
    for cell, expected in zip(cells, expected_blueprint, strict=True):
        if (
            cell.get("id") != expected["id"]
            or cell.get("cell_type") != expected["kind"]
            or _notebook_source_text(cell).strip() != expected["source"].strip()
        ):
            raise Phase26Error(f"{job.proof_id} code/locale cell parity drifted")
        if cell.get("metadata") != {}:
            raise Phase26Error(f"{job.proof_id} retained runtime cell metadata")
        if expected["kind"] == "code":
            if cell.get("execution_count") != execution_count:
                raise Phase26Error(
                    f"{job.proof_id} fresh execution count drifted at "
                    f"{expected['id']}"
                )
            execution_count += 1
            outputs = cell.get("outputs")
            if not isinstance(outputs, list):
                raise Phase26Error(f"{job.proof_id} code output list is malformed")
            if any(output.get("output_type") == "error" for output in outputs):
                raise Phase26Error(f"{job.proof_id} contains an error output")
        elif "execution_count" in cell or "outputs" in cell:
            raise Phase26Error(f"{job.proof_id} markdown contains execution state")
    serialized = path.read_text(encoding="utf-8")
    if re.search(
        r"ml-atlas-phase26-[a-f0-9]{16,}|(?:/private)?/(?:tmp|var/folders)/",
        serialized,
    ):
        raise Phase26Error(f"{job.proof_id} leaked a temporary path or kernelspec")
    return {
        "notebookSha256": sha256_file(path),
        "code": _notebook_code_payload(notebook),
        "outputs": _notebook_output_payload(notebook),
    }


def _finite_difference_row(
    kind: str,
    targets: list[float],
    outputs: list[float],
    index: int,
    step: float,
) -> dict[str, Any]:
    def objective(values: list[float]) -> float:
        if kind == "mse":
            return math.fsum(
                (output - target) ** 2
                for target, output in zip(targets, values, strict=True)
            ) / len(targets)
        if kind == "mae":
            return math.fsum(
                abs(output - target)
                for target, output in zip(targets, values, strict=True)
            ) / len(targets)
        if kind == "bce":
            return math.fsum(
                _stable_bce_scalar(output, int(target))
                for target, output in zip(targets, values, strict=True)
            ) / len(targets)
        raise Phase26Error(f"Unsupported finite-difference loss: {kind}")

    residual = outputs[index] - targets[index]
    if kind == "mse":
        analytic = 2.0 * residual / len(targets)
        differentiable = True
    elif kind == "mae":
        analytic = (0.0 if residual == 0.0 else math.copysign(1.0, residual)) / len(
            targets
        )
        differentiable = residual != 0.0
    else:
        analytic = (
            _stable_sigmoid_scalar(outputs[index]) - targets[index]
        ) / len(targets)
        differentiable = True
    plus = list(outputs)
    minus = list(outputs)
    plus[index] += step
    minus[index] -= step
    numerical = (objective(plus) - objective(minus)) / (2.0 * step)
    absolute_error = abs(analytic - numerical)
    return {
        "step": step,
        "analyticValue": analytic,
        "numericalValue": numerical,
        "absoluteError": absolute_error,
        "scaledRelativeError": absolute_error
        / max(1.0, abs(analytic), abs(numerical)),
        "tolerance": 5e-7,
        "differentiable": differentiable,
        "status": (
            "kink"
            if not differentiable
            else "pass"
            if absolute_error <= 5e-7
            else "fail"
        ),
        "note": (
            "A symmetric difference is not a unique derivative at the MAE kink."
            if not differentiable
            else None
        ),
    }


def _verify_regression_summary(staging_root: Path) -> dict[str, Any]:
    path = staging_root / "notebooks/loss-functions/outputs/regression-loss-summary.json"
    summary = read_strict_json(path)
    lade = read_strict_json(
        staging_root
        / "datasets/loss-functions/lade-delivery-jilin-manifest.json"
    )
    rows = summary.get("rows")
    if (
        summary.get("contractVersion") != "loss-functions-phase-26-output-v1"
        or summary.get("topicId") != "delivery-losses"
        or not isinstance(rows, list)
        or len(rows) != LADE_EXPECTED_ROWS
        or summary.get("referencePredictionMinutes")
        != LADE_REFERENCE_PREDICTION_MINUTES
    ):
        raise Phase26Error("Regression loss summary contract or row count drifted")
    squared: list[float] = []
    absolute: list[float] = []
    for index, row in enumerate(rows):
        try:
            target = float(row["targetMinutes"])
            prediction = float(row["predictionMinutes"])
            residual = prediction - target
        except (KeyError, TypeError, ValueError) as error:
            raise Phase26Error(
                f"Regression summary row {index + 1} is malformed"
            ) from error
        expected = {
            "courseRowId": f"lade-jilin-{index + 1:05d}",
            "targetMinutes": target,
            "predictionMinutes": float(LADE_REFERENCE_PREDICTION_MINUTES),
            "residualMinutes": residual,
            "mseLoss": residual * residual,
            "maeLoss": abs(residual),
            "msePerElementGradient": 2.0 * residual,
            "maePerElementSubgradient": (
                0.0 if residual == 0.0 else math.copysign(1.0, residual)
            ),
            "maeDifferentiable": residual != 0.0,
            "mseMeanObjectiveGradient": 2.0 * residual / LADE_EXPECTED_ROWS,
            "maeMeanObjectiveSubgradient": (
                0.0
                if residual == 0.0
                else math.copysign(1.0, residual) / LADE_EXPECTED_ROWS
            ),
        }
        if any(
            (
                row.get("courseRowId") != expected["courseRowId"],
                row.get("predictionMinutes") != expected["predictionMinutes"],
                abs(float(row.get("residualMinutes", math.inf)) - residual) > 1e-12,
                abs(float(row.get("mseLoss", math.inf)) - expected["mseLoss"])
                > 1e-9,
                abs(float(row.get("maeLoss", math.inf)) - expected["maeLoss"])
                > 1e-12,
                abs(
                    float(row.get("msePerElementGradient", math.inf))
                    - expected["msePerElementGradient"]
                )
                > 1e-12,
                row.get("maePerElementSubgradient")
                != expected["maePerElementSubgradient"],
                row.get("maeDifferentiable") is not expected["maeDifferentiable"],
                abs(
                    float(row.get("mseMeanObjectiveGradient", math.inf))
                    - expected["mseMeanObjectiveGradient"]
                )
                > 1e-15,
                abs(
                    float(row.get("maeMeanObjectiveSubgradient", math.inf))
                    - expected["maeMeanObjectiveSubgradient"]
                )
                > 1e-15,
            )
        ):
            raise Phase26Error(
                f"Regression summary loss or gradient drifted at row {index + 1}"
            )
        squared.append(residual * residual)
        absolute.append(abs(residual))
    expected_aggregate = {
        "mse": _typescript_mean(squared),
        "mae": _typescript_mean(absolute),
        "rowCount": len(rows),
    }
    if any(
        (
            abs(summary.get("aggregate", {}).get("mse", math.inf) - expected_aggregate["mse"])
            > 1e-10,
            abs(summary.get("aggregate", {}).get("mae", math.inf) - expected_aggregate["mae"])
            > 1e-12,
            summary.get("aggregate", {}).get("rowCount") != len(rows),
            summary.get("dataset")
            != {
                "datasetId": LADE.dataset_id,
                "sha256": lade["published"]["sha256"],
                "rowCount": LADE_EXPECTED_ROWS,
            },
        )
    ):
        raise Phase26Error(
            "Regression summary aggregate or dataset hash drifted: "
            f"observedAggregate={summary.get('aggregate')!r}, "
            f"expectedAggregate={expected_aggregate!r}, "
            f"observedDataset={summary.get('dataset')!r}, "
            f"expectedDataset={{'datasetId': {LADE.dataset_id!r}, "
            f"'sha256': {lade['published']['sha256']!r}, "
            f"'rowCount': {LADE_EXPECTED_ROWS}}}"
        )
    reference_roles = {
        row["courseRowId"]: row["role"]
        for row in lade["teachingReference"]["representativeRows"]
    }
    expected_representatives = [
        {"role": reference_roles[row["courseRowId"]], **row}
        for row in rows
        if row["courseRowId"] in reference_roles
    ]
    expected_representatives.sort(
        key=lambda row: [
            "zero-duration",
            "typical-zero-residual",
            "long-duration",
        ].index(row["role"])
    )
    if summary.get("representativeRows") != expected_representatives:
        raise Phase26Error("Regression representative rows drifted")
    expected_high = sorted(
        rows,
        key=lambda row: (-float(row["mseLoss"]), str(row["courseRowId"])),
    )[:5]
    if summary.get("highContributionRows") != expected_high:
        raise Phase26Error("Regression high-contribution ranking drifted")
    return {
        "rowCount": len(rows),
        "mse": expected_aggregate["mse"],
        "mae": expected_aggregate["mae"],
    }


def _verify_bce_summary(staging_root: Path) -> dict[str, Any]:
    path = staging_root / "notebooks/loss-functions/outputs/bce-gradient-summary.json"
    summary = read_strict_json(path)
    secom = read_strict_json(
        staging_root / "datasets/loss-functions/secom-manufacturing-manifest.json"
    )
    rows = summary.get("rows")
    locked_rows = secom["auxiliaryPredictions"]["rows"]
    if (
        summary.get("contractVersion") != "loss-functions-phase-26-output-v1"
        or summary.get("topicId") != "manufacturing-bce-gradients"
        or rows != locked_rows
    ):
        raise Phase26Error("BCE summary real OOF rows or output contract drifted")
    expected_mean = math.fsum(float(row["stableBce"]) for row in rows) / len(rows)
    if (
        abs(summary.get("aggregate", {}).get("meanStableBce", math.inf) - expected_mean)
        > 1e-12
        or summary.get("aggregate", {}).get("rowCount") != SECOM_EXPECTED_ROWS
        or summary.get("dataset")
        != {
            "datasetId": SECOM.dataset_id,
            "sha256": secom["published"]["sha256"],
            "rowCount": SECOM_EXPECTED_ROWS,
            "declaredFeatureCount": 591,
            "observedFeatureCount": 590,
        }
    ):
        raise Phase26Error("BCE summary aggregate or dataset contract drifted")
    if (
        summary.get("highContributionRows")
        != secom["auxiliaryPredictions"]["highestContributionRows"]
        or summary.get("confidentError")
        != secom["auxiliaryPredictions"]["confidentError"]
    ):
        raise Phase26Error("BCE summary contribution/confident-error provenance drifted")

    expected_probes: list[dict[str, Any]] = []
    for logit in (-1000.0, -20.0, 0.0, 20.0, 1000.0):
        for label in (0, 1):
            probability = _stable_sigmoid_scalar(logit)
            try:
                naive_value = -(
                    label * math.log(probability)
                    + (1 - label) * math.log1p(-probability)
                )
            except ValueError:
                if probability == 0.0:
                    naive = nonfinite_result("nan" if label == 0 else "inf")
                else:
                    naive = nonfinite_result("inf" if label == 0 else "nan")
            else:
                naive = {"status": "finite", "value": naive_value}
            epsilon = 1e-12
            clipped_probability = min(
                1.0 - epsilon,
                max(epsilon, probability),
            )
            clipped_value = -(
                label * math.log(clipped_probability)
                + (1 - label) * math.log1p(-clipped_probability)
            )
            expected_probes.append(
                {
                    "source": "synthetic-stability-probe",
                    "logit": logit,
                    "label": label,
                    "probability": probability,
                    "naive": naive,
                    "clipped": {
                        "method": "clipped-probability-bce",
                        "status": "finite",
                        "value": clipped_value,
                        "probability": probability,
                        "clippedProbability": clipped_probability,
                        "epsilon": epsilon,
                        "objectiveChanged": clipped_probability != probability,
                    },
                    "stable": {
                        "method": "stable-logit-bce",
                        "status": "finite",
                        "value": _stable_bce_scalar(logit, label),
                    },
                }
            )
    probes = summary.get("fixedProbes")
    if not isinstance(probes, list) or len(probes) != 10:
        raise Phase26Error("BCE fixed-probe inventory drifted")
    for probe_index, (observed, expected) in enumerate(
        zip(probes, expected_probes, strict=True)
    ):
        observed_naive_value = observed["naive"]["value"]
        expected_naive_value = expected["naive"]["value"]
        naive_value_matches = (
            observed_naive_value is None
            and expected_naive_value is None
        ) or (
            observed_naive_value is not None
            and expected_naive_value is not None
            and abs(observed_naive_value - expected_naive_value) <= 1e-12
        )
        if (
            observed["source"] != expected["source"]
            or observed["logit"] != expected["logit"]
            or observed["label"] != expected["label"]
            or abs(observed["probability"] - expected["probability"]) > 1e-15
            or observed["naive"]["status"] != expected["naive"]["status"]
            or not naive_value_matches
            or abs(observed["clipped"]["value"] - expected["clipped"]["value"])
            > 1e-12
            or observed["clipped"]["objectiveChanged"]
            is not expected["clipped"]["objectiveChanged"]
            or abs(observed["stable"]["value"] - expected["stable"]["value"])
            > 1e-12
        ):
            raise Phase26Error(
                "BCE fixed naive/clipped/stable probe drifted at "
                f"index {probe_index}: observed={observed!r}, expected={expected!r}"
            )

    sweep_inputs = {
        "mse": ("mse", [1.0, 2.0], [1.5, 3.0], 1),
        "mae": ("mae", [0.0, 2.0], [1.0, 3.0], 0),
        "mae-kink": ("mae", [1.0, 2.0], [1.0, 3.0], 0),
        "bce": ("bce", [0.0, 1.0], [0.2, -0.4], 1),
    }
    expected_sweeps = {
        key: [
            _finite_difference_row(kind, targets, outputs, index, 10.0**-power)
            for power in range(1, 10)
        ]
        for key, (kind, targets, outputs, index) in sweep_inputs.items()
    }
    observed_sweeps = summary.get("finiteDifferenceSweeps")
    if not isinstance(observed_sweeps, dict):
        raise Phase26Error("Finite-difference sweep output is missing")
    for key, expected_rows in expected_sweeps.items():
        observed_rows = observed_sweeps.get(key)
        if not isinstance(observed_rows, list) or len(observed_rows) != 9:
            raise Phase26Error(f"{key} finite-difference sweep inventory drifted")
        for observed, expected in zip(observed_rows, expected_rows, strict=True):
            if any(
                (
                    observed["step"] != expected["step"],
                    abs(observed["analyticValue"] - expected["analyticValue"])
                    > 1e-15,
                    abs(observed["numericalValue"] - expected["numericalValue"])
                    > 1e-9,
                    abs(observed["absoluteError"] - expected["absoluteError"])
                    > 1e-9,
                    observed["differentiable"] is not expected["differentiable"],
                    observed["status"] != expected["status"],
                )
            ):
                raise Phase26Error(f"{key} finite-difference arithmetic drifted")
    return {
        "rowCount": len(rows),
        "meanStableBce": expected_mean,
        "confidentErrorStatus": summary["confidentError"]["selectionStatus"],
    }


def _verify_candidate_manifest(
    staging_root: Path,
    notebook_results: dict[str, dict[str, Any]],
    expected_generator_sha256: str,
) -> dict[str, Any]:
    path = staging_root / CANDIDATE_PATHS[-1]
    manifest = read_strict_json(path)
    if (
        manifest.get("contractVersion")
        != "loss-functions-phase-26-candidate-v1"
        or manifest.get("packageComplete") is not True
        or manifest.get("publicationAllowed") is not False
        or manifest.get("requirements") != ["LOSS-01", "LOSS-02", "LOSS-03"]
        or manifest.get("generator")
        != {
            "path": GENERATOR_RELATIVE_PATH,
            "sha256": expected_generator_sha256,
        }
    ):
        raise Phase26Error("Complete candidate manifest header or generator drifted")
    inventory = manifest.get("inventory")
    if (
        not isinstance(inventory, list)
        or [entry.get("path") for entry in inventory] != list(CANDIDATE_PATHS)
        or len(inventory) != 16
    ):
        raise Phase26Error("Complete candidate manifest inventory drifted")
    for entry in inventory:
        member_path = staging_root / entry["path"]
        if not member_path.is_file():
            raise Phase26Error(
                f"Complete candidate manifest member is missing: {entry['path']}"
            )
        if entry.get("role") == "candidate-manifest":
            if entry != {
                "path": CANDIDATE_PATHS[-1],
                "role": "candidate-manifest",
                "sha256": None,
                "bytes": None,
                "selfHashExcluded": True,
            }:
                raise Phase26Error("Candidate manifest self-entry drifted")
        elif (
            entry.get("role") != _candidate_role(entry["path"])
            or entry.get("sha256") != sha256_file(member_path)
            or entry.get("bytes") != member_path.stat().st_size
        ):
            raise Phase26Error(
                f"Complete candidate manifest hash drifted: {entry['path']}"
            )
    canonical_hash = manifest.get("canonicalPayloadSha256")
    canonical = dict(manifest)
    canonical["canonicalPayloadSha256"] = None
    if canonical_hash != _sha256_json(canonical):
        raise Phase26Error("Candidate manifest canonical payload hash drifted")

    proofs = manifest.get("executionProofs")
    if not isinstance(proofs, list) or len(proofs) != 4:
        raise Phase26Error("Candidate manifest clean-kernel proof inventory drifted")
    for job in candidate_execution_jobs():
        proof = next(
            (entry for entry in proofs if entry.get("proofId") == job.proof_id),
            None,
        )
        result = notebook_results[job.proof_id]
        expected = {
            **_notebook_job_payload(job),
            "notebookSha256": result["notebookSha256"],
            "codeSha256": _sha256_json(result["code"]),
            "normalizedOutputSha256": _sha256_json(result["outputs"]),
        }
        if proof != expected:
            raise Phase26Error(
                f"Candidate manifest clean-kernel proof drifted: {job.proof_id}"
            )
    parity = manifest.get("localeParity")
    for topic_id in NOTEBOOK_TOPIC_IDS:
        zh = notebook_results[f"clean-kernel-{topic_id}-zh-CN"]
        en = notebook_results[f"clean-kernel-{topic_id}-en"]
        if zh["code"] != en["code"] or zh["outputs"] != en["outputs"]:
            raise Phase26Error(f"{topic_id} verified locale output parity drifted")
        expected = {
            "locales": list(NOTEBOOK_LOCALES),
            "codeCellIds": [cell["id"] for cell in zh["code"]],
            "codeSha256": _sha256_json(zh["code"]),
            "normalizedOutputSha256": _sha256_json(zh["outputs"]),
        }
        if parity.get(topic_id) != expected:
            raise Phase26Error(f"{topic_id} candidate locale parity hash drifted")
    if manifest.get("standaloneRerunExpectation") != {
        "notebookCount": 4,
        "freshKernelEach": True,
        "offline": True,
        "allowErrors": False,
        "normalizedOutputsMustMatch": True,
        "datasetPathsArePackageRelative": True,
    }:
        raise Phase26Error("Candidate standalone-rerun expectation drifted")
    return manifest


def verify_candidates(
    staging_root: Path,
    *,
    enforce_staging_root: bool = True,
    expected_generator_sha256: str = VALIDATED_CANDIDATE_GENERATOR_SHA256,
) -> dict[str, Any]:
    if enforce_staging_root:
        validate_candidate_staging_root(staging_root)
    actual_files: set[str] = set()
    for group_relative_path in PUBLIC_GROUP_PATHS:
        group_root = staging_root / group_relative_path
        if not group_root.is_dir():
            continue
        for path in group_root.rglob("*"):
            if path.is_symlink():
                raise Phase26Error(
                    f"Symlinks are forbidden in candidate inventory: {path}"
                )
            if path.is_file():
                actual_files.add(path.relative_to(staging_root).as_posix())
    if actual_files != set(CANDIDATE_PATHS):
        raise Phase26Error(
            f"Complete candidate inventory drifted: "
            f"missing={sorted(set(CANDIDATE_PATHS) - actual_files)}, "
            f"unexpected={sorted(actual_files - set(CANDIDATE_PATHS))}"
        )
    dataset_result = verify_dataset_candidates(
        staging_root,
        expected_generator_sha256=expected_generator_sha256,
    )
    requirements_path = staging_root / "notebooks/loss-functions/requirements.txt"
    if requirements_path.read_bytes() != REQUIREMENTS_PATH.read_bytes():
        raise Phase26Error("Candidate requirements drifted from exact audited pins")
    environment_path = staging_root / "notebooks/loss-functions/environment.json"
    environment = read_strict_json(environment_path)
    if (
        environment.get("contractVersion")
        != "loss-functions-phase-26-candidate-environment-v1"
        or environment.get("requirements")
        != {
            "path": "notebooks/loss-functions/requirements.txt",
            "sha256": sha256_file(REQUIREMENTS_PATH),
            "pins": EXPECTED_ENVIRONMENT_PINS,
        }
        or environment.get("packages") != EXPECTED_ENVIRONMENT_PINS
        or environment.get("execution")
        != {
            "networkAccess": False,
            "freshKernelJobs": 4,
            "allowErrors": False,
            "kernelNamePublished": False,
            "temporaryPathsPublished": False,
        }
    ):
        raise Phase26Error("Candidate environment or exact package pins drifted")
    if re.search(
        r"ml-atlas-phase26-[a-f0-9]{16,}|(?:/private)?/(?:tmp|var/folders)/",
        environment_path.read_text(encoding="utf-8"),
    ):
        raise Phase26Error("Candidate environment leaked a temporary path or kernelspec")

    notebook_results = {
        job.proof_id: _verify_executed_notebook(staging_root, job)
        for job in candidate_execution_jobs()
    }
    regression = _verify_regression_summary(staging_root)
    bce = _verify_bce_summary(staging_root)
    plots = {
        "delivery": _parse_png_contract(
            staging_root / "notebooks/loss-functions/outputs/delivery-losses.png"
        ),
        "manufacturing": _parse_png_contract(
            staging_root
            / "notebooks/loss-functions/outputs/manufacturing-bce-gradients.png"
        ),
    }
    manifest = _verify_candidate_manifest(
        staging_root,
        notebook_results,
        expected_generator_sha256,
    )
    return {
        "inventoryCount": len(manifest["inventory"]),
        "executionProofCount": len(manifest["executionProofs"]),
        "datasets": dataset_result,
        "regression": regression,
        "bce": bce,
        "plots": plots,
    }


def prepare_candidates(
    cache: Path,
    staging_root: Path,
    wheel_cache: Path = DEFAULT_WHEEL_CACHE,
) -> dict[str, Any]:
    validated_root = validate_candidate_staging_root(staging_root)
    try:
        verify_source_cache(cache)
        validate_environment_contract(wheel_cache=wheel_cache)
        with candidate_transaction(validated_root) as transaction:
            with isolated_environment(wheel_cache) as isolated:
                _run_isolated_worker(
                    isolated,
                    "build_dataset_candidates",
                    [str(cache.resolve()), str(transaction.root)],
                )
                notebook_root = transaction.root / "notebooks/loss-functions"
                notebook_root.mkdir(parents=True, exist_ok=True)
                (notebook_root / "requirements.txt").write_bytes(
                    REQUIREMENTS_PATH.read_bytes()
                )
                (notebook_root / "environment.json").write_bytes(
                    strict_json_bytes(
                        _candidate_environment_record(
                            isolated.observed_versions
                        )
                    )
                )
                _run_isolated_worker(
                    isolated,
                    "build_notebook_candidates",
                    [str(transaction.root)],
                )
            build_candidate_manifest(transaction.root)
            return verify_candidates(
                transaction.root,
                expected_generator_sha256=sha256_file(Path(__file__)),
            )
    except BaseException:
        _remove_candidate_root(validated_root)
        raise


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


def _remove_transaction_path(path: Path) -> None:
    if path.is_symlink() or path.is_file():
        path.unlink()
    elif path.is_dir():
        shutil.rmtree(path)


@contextlib.contextmanager
def _publication_lock(public_root: Path) -> Iterator[None]:
    public_root.mkdir(parents=True, exist_ok=True)
    lock_path = public_root / ".loss-functions-publication.lock"
    try:
        descriptor = os.open(
            lock_path,
            os.O_CREAT | os.O_EXCL | os.O_WRONLY,
            0o600,
        )
    except FileExistsError as error:
        raise Phase26Error(
            f"Another loss-functions publication owns the transaction lock: {lock_path}"
        ) from error
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            handle.write(f"pid={os.getpid()}\n")
        yield
    finally:
        lock_path.unlink(missing_ok=True)


def _assert_publication_root(public_root: Path, enforce_public_root: bool) -> Path:
    resolved = public_root.resolve()
    expected = DEFAULT_PUBLIC_ROOT.resolve()
    if enforce_public_root and resolved != expected:
        raise Phase26Error(
            f"Published root must resolve exactly to the repository public directory: {expected}"
        )
    if resolved == REPO_ROOT.resolve() or not resolved.is_relative_to(REPO_ROOT.resolve()):
        if enforce_public_root:
            raise Phase26Error(
                f"Published root must stay inside the repository public directory: {resolved}"
            )
    return resolved


def _compare_candidate_and_public_bytes(
    staging_root: Path,
    public_root: Path,
) -> None:
    for relative_path in CANDIDATE_PATHS:
        candidate_path = staging_root / relative_path
        published_path = public_root / relative_path
        if not published_path.is_file():
            raise Phase26Error(
                f"Published inventory member is missing after swap: {relative_path}"
            )
        if candidate_path.read_bytes() != published_path.read_bytes():
            raise Phase26Error(
                f"Published bytes differ from the validated candidate: {relative_path}"
            )


def publish_candidates(
    staging_root: Path,
    *,
    public_root: Path = DEFAULT_PUBLIC_ROOT,
    source_cache: Path = DEFAULT_SOURCE_CACHE,
    wheel_cache: Path = DEFAULT_WHEEL_CACHE,
    enforce_staging_root: bool = True,
    enforce_public_root: bool = True,
    failure_point: str | None = None,
) -> dict[str, Any]:
    """Publish both generator-owned groups as one verified rollback transaction."""
    if failure_point is not None and failure_point not in PUBLICATION_FAILURE_POINTS:
        raise Phase26Error(f"Unsupported publication failure point: {failure_point}")
    if enforce_staging_root:
        validated_staging_root = validate_candidate_staging_root(staging_root)
    else:
        validated_staging_root = staging_root.resolve()
    validated_public_root = _assert_publication_root(
        public_root,
        enforce_public_root,
    )

    validate_authorization()
    verify_source_cache(source_cache)
    validate_environment_contract(wheel_cache=wheel_cache)
    candidate_result = verify_candidates(
        validated_staging_root,
        enforce_staging_root=False,
        expected_generator_sha256=VALIDATED_CANDIDATE_GENERATOR_SHA256,
    )

    transaction_id = uuid.uuid4().hex
    transaction_root = (
        validated_public_root / f".loss-functions-publication-{transaction_id}"
    )
    backup_root = (
        validated_public_root / f".loss-functions-publication-backup-{transaction_id}"
    )
    group_records = [
        (
            relative_path,
            transaction_root / relative_path,
            validated_public_root / relative_path,
            backup_root / relative_path,
        )
        for relative_path in PUBLIC_GROUP_PATHS
    ]
    installed_destinations: set[Path] = set()

    with _publication_lock(validated_public_root):
        try:
            for relative_path, staged_group, _, _ in group_records:
                candidate_group = validated_staging_root / relative_path
                staged_group.parent.mkdir(parents=True, exist_ok=True)
                shutil.copytree(candidate_group, staged_group)
            verify_candidates(
                transaction_root,
                enforce_staging_root=False,
                expected_generator_sha256=VALIDATED_CANDIDATE_GENERATOR_SHA256,
            )
            _compare_candidate_and_public_bytes(
                validated_staging_root,
                transaction_root,
            )

            if failure_point == "pre-swap":
                raise Phase26Error("Injected publication failure at pre-swap")

            for index, (_, staged_group, destination, backup) in enumerate(
                group_records
            ):
                if destination.is_symlink():
                    raise Phase26Error(
                        f"Published group cannot be a symlink: {destination}"
                    )
                backup.parent.mkdir(parents=True, exist_ok=True)
                if destination.exists():
                    destination.replace(backup)
                destination.parent.mkdir(parents=True, exist_ok=True)
                staged_group.replace(destination)
                installed_destinations.add(destination)
                if failure_point == "mid-swap" and index == 0:
                    raise Phase26Error("Injected publication failure at mid-swap")

            if failure_point == "post-swap":
                raise Phase26Error("Injected publication failure at post-swap")

            public_result = verify_candidates(
                validated_public_root,
                enforce_staging_root=False,
                expected_generator_sha256=VALIDATED_CANDIDATE_GENERATOR_SHA256,
            )
            _compare_candidate_and_public_bytes(
                validated_staging_root,
                validated_public_root,
            )
        except BaseException:
            rollback_errors: list[str] = []
            for _, _, destination, backup in reversed(group_records):
                try:
                    if backup.exists():
                        _remove_transaction_path(destination)
                        backup.parent.mkdir(parents=True, exist_ok=True)
                        backup.replace(destination)
                    elif destination in installed_destinations:
                        _remove_transaction_path(destination)
                except OSError as error:
                    rollback_errors.append(f"{destination}: {error}")
            if rollback_errors:
                raise Phase26Error(
                    "Publication failed and rollback could not restore every group: "
                    + "; ".join(rollback_errors)
                )
            raise
        else:
            _remove_transaction_path(backup_root)
            return {
                **public_result,
                "publishedGroups": list(PUBLIC_GROUP_PATHS),
                "publishedBytes": sum(
                    (validated_public_root / relative_path).stat().st_size
                    for relative_path in CANDIDATE_PATHS
                ),
                "candidateGeneratorSha256": (
                    VALIDATED_CANDIDATE_GENERATOR_SHA256
                ),
            }
        finally:
            _remove_transaction_path(transaction_root)
            _remove_transaction_path(backup_root)


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
    modes.add_argument("--prepare-dataset-candidates", action="store_true")
    modes.add_argument("--prepare-candidates", action="store_true")
    modes.add_argument("--verify-candidates", action="store_true")
    modes.add_argument("--publish-candidates", action="store_true")
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

    inherently_offline_modes = (
        args.prepare_dataset_candidates
        or args.prepare_candidates
        or args.generate
        or args.publish_candidates
    )
    if not args.offline and not inherently_offline_modes:
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

    if args.prepare_dataset_candidates:
        verified = prepare_dataset_candidates(
            args.source_cache,
            args.staging_root,
            args.wheel_cache,
        )
        print(
            "Prepared complete staging-only dataset candidates: "
            f"LaDe {verified['lade']['rowCount']} rows, "
            f"SECOM {verified['secom']['rowCount']} rows with "
            f"{verified['secom']['observedFeatureCount']} observed measurements."
        )
        return

    if args.generate or args.prepare_candidates:
        candidate = prepare_candidates(
            args.source_cache,
            args.staging_root,
            args.wheel_cache,
        )
        print(
            "Prepared the complete offline candidate package "
            f"({candidate['inventoryCount']} members, "
            f"{candidate['executionProofCount']} fresh-kernel proofs) in "
            f"{args.staging_root}"
        )
        return

    if args.verify_candidates:
        verify_source_cache(args.source_cache)
        validate_environment_contract(wheel_cache=args.wheel_cache)
        verified = verify_candidates(args.staging_root)
        print(
            "Verified the complete staging-only candidate package: "
            f"{verified['inventoryCount']} members, "
            f"{verified['executionProofCount']} clean-kernel proofs."
        )
        return

    if args.publish_candidates:
        published = publish_candidates(
            args.staging_root,
            source_cache=args.source_cache,
            wheel_cache=args.wheel_cache,
        )
        print(
            "Published the exact complete Phase 26 package atomically: "
            f"{published['inventoryCount']} members, "
            f"{published['executionProofCount']} clean-kernel proofs, "
            f"{published['publishedBytes']} bytes."
        )
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
