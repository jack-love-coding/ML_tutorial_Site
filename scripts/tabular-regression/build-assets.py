#!/usr/bin/env python3
"""Build and verify the Phase 28 California Housing teaching asset package."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import shutil
import sys
import tempfile
import urllib.request
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import nbformat
import numpy as np
import pandas as pd
import sklearn
from nbclient import NotebookClient
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler


ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "public/datasets/tabular-regression"
NOTEBOOK_DIR = ROOT / "public/notebooks/tabular-regression"
ASSET_DIR = ROOT / "public/tabular-regression"
SOURCE_URL = "https://lib.stat.cmu.edu/datasets/houses.zip"
SOURCE_SHA256 = "8b18f0a01cf9c99a65174d18fa582aa31971dfe55a26ad794f3299937c3708d7"
CONTRACT_VERSION = "tabular-regression-california-v1"
SEED = 42
FEATURES = [
    "MedInc",
    "HouseAge",
    "AveRooms",
    "AveBedrms",
    "Population",
    "AveOccup",
    "Latitude",
    "Longitude",
]
TARGET = "MedHouseVal"
ALPHAS = [0.01, 0.1, 1.0, 10.0, 100.0]
EXPECTED_ROWS = 20_640
TRAIN_ROWS = 12_384
VALIDATION_ROWS = 4_128
TEST_ROWS = 4_128
KERNEL_NAME = "ml-atlas-phase27a"


class AssetError(RuntimeError):
    pass


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def json_bytes(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True, allow_nan=False) + "\n"
    ).encode("utf-8")


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(json_bytes(value))


def finite_number(value: Any) -> float:
    number = float(value)
    if not math.isfinite(number):
        raise AssetError(f"Non-finite number: {value!r}")
    return number


def finite_list(values: Iterable[Any]) -> list[float]:
    return [finite_number(value) for value in values]


def acquire_archive(path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        request = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "ML-Atlas/1.0"})
        with urllib.request.urlopen(request, timeout=60) as response:
            payload = response.read()
        if sha256_bytes(payload) != SOURCE_SHA256:
            raise AssetError("Downloaded StatLib archive checksum does not match the pinned source")
        path.write_bytes(payload)
    if sha256_file(path) != SOURCE_SHA256:
        raise AssetError(f"Source archive checksum mismatch: {path}")
    return path


def parse_archive(archive_path: Path) -> pd.DataFrame:
    with zipfile.ZipFile(archive_path) as archive:
        raw_text = archive.read("cadata.txt").decode("latin-1")
    rows: list[list[float]] = []
    for line in raw_text.splitlines():
        parts = line.split()
        if len(parts) != 9:
            continue
        try:
            rows.append([float(part) for part in parts])
        except ValueError:
            continue
    raw = np.asarray(rows, dtype=np.float64)
    if raw.shape != (EXPECTED_ROWS, 9):
        raise AssetError(f"Unexpected StatLib matrix shape: {raw.shape}")
    households = raw[:, 6]
    if np.any(households <= 0):
        raise AssetError("Households must be positive before ratio features are calculated")
    frame = pd.DataFrame(
        {
            "row_id": [f"ca-{index:05d}" for index in range(1, EXPECTED_ROWS + 1)],
            "MedInc": raw[:, 1],
            "HouseAge": raw[:, 2],
            "AveRooms": raw[:, 3] / households,
            "AveBedrms": raw[:, 4] / households,
            "Population": raw[:, 5],
            "AveOccup": raw[:, 5] / households,
            "Latitude": raw[:, 7],
            "Longitude": raw[:, 8],
            "MedHouseVal": raw[:, 0] / 100_000.0,
        }
    )
    permutation = np.random.default_rng(SEED).permutation(EXPECTED_ROWS)
    split = np.full(EXPECTED_ROWS, "", dtype=object)
    split[permutation[:TRAIN_ROWS]] = "train"
    split[permutation[TRAIN_ROWS : TRAIN_ROWS + VALIDATION_ROWS]] = "validation"
    split[permutation[TRAIN_ROWS + VALIDATION_ROWS :]] = "test"
    frame["split"] = split
    validate_frame(frame)
    return frame


def validate_frame(frame: pd.DataFrame) -> None:
    expected_columns = ["row_id", *FEATURES, TARGET, "split"]
    if frame.columns.tolist() != expected_columns:
        raise AssetError(f"Unexpected columns: {frame.columns.tolist()}")
    if frame.shape != (EXPECTED_ROWS, len(expected_columns)):
        raise AssetError(f"Unexpected dataset shape: {frame.shape}")
    if frame["row_id"].duplicated().any() or frame.isna().any().any():
        raise AssetError("Dataset contains duplicate IDs or missing values")
    counts = frame["split"].value_counts().to_dict()
    if counts != {"train": TRAIN_ROWS, "validation": VALIDATION_ROWS, "test": TEST_ROWS}:
        raise AssetError(f"Unexpected split counts: {counts}")
    matrix = frame[[*FEATURES, TARGET]].to_numpy(dtype=float)
    if not np.isfinite(matrix).all():
        raise AssetError("Dataset contains NaN or Infinity")


def metric_payload(actual: np.ndarray, predicted: np.ndarray) -> dict[str, float]:
    return {
        "rmse": finite_number(mean_squared_error(actual, predicted) ** 0.5),
        "mae": finite_number(mean_absolute_error(actual, predicted)),
        "r2": finite_number(r2_score(actual, predicted)),
    }


@dataclass(frozen=True)
class Analysis:
    summary: dict[str, Any]
    validation_metrics: pd.DataFrame
    final_predictions: pd.DataFrame
    coefficient_path: pd.DataFrame
    interactions: dict[str, dict[str, Any]]
    figures: list[dict[str, Any]]


def sample_points(frame: pd.DataFrame, count: int, seed: int) -> list[dict[str, Any]]:
    if len(frame) <= count:
        sampled = frame
    else:
        sampled = frame.iloc[np.random.default_rng(seed).choice(len(frame), count, replace=False)]
    return [
        {
            key: value.item() if hasattr(value, "item") else value
            for key, value in row.items()
        }
        for row in sampled.to_dict(orient="records")
    ]


def binned_relation(train: pd.DataFrame, feature: str, bins: int = 18) -> list[dict[str, float]]:
    working = train[[feature, TARGET]].copy()
    working["bin"] = pd.qcut(working[feature], q=bins, duplicates="drop")
    grouped = working.groupby("bin", observed=True).agg(
        feature_mean=(feature, "mean"), target_mean=(TARGET, "mean"), count=(TARGET, "size")
    )
    return [
        {
            "x": finite_number(row.feature_mean),
            "y": finite_number(row.target_mean),
            "count": int(row.count),
        }
        for row in grouped.itertuples()
    ]


def analyze(frame: pd.DataFrame, figure_dir: Path) -> Analysis:
    train = frame.loc[frame["split"] == "train"].copy()
    validation = frame.loc[frame["split"] == "validation"].copy()
    test = frame.loc[frame["split"] == "test"].copy()
    x_train = train[FEATURES].to_numpy(dtype=float)
    y_train = train[TARGET].to_numpy(dtype=float)
    x_validation = validation[FEATURES].to_numpy(dtype=float)
    y_validation = validation[TARGET].to_numpy(dtype=float)
    x_test = test[FEATURES].to_numpy(dtype=float)
    y_test = test[TARGET].to_numpy(dtype=float)

    scaler = StandardScaler().fit(x_train)
    scaled_train = scaler.transform(x_train)
    scaled_validation = scaler.transform(x_validation)
    baseline = LinearRegression().fit(scaled_train, y_train)
    baseline_validation_prediction = baseline.predict(scaled_validation)
    baseline_metrics = metric_payload(y_validation, baseline_validation_prediction)

    validation_rows: list[dict[str, Any]] = [
        {"model": "LinearRegression", "alpha": "none", **baseline_metrics}
    ]
    coefficient_rows: list[dict[str, Any]] = []
    ridge_candidates: list[tuple[float, Ridge, dict[str, float]]] = []
    for alpha in ALPHAS:
        model = Ridge(alpha=alpha, solver="svd").fit(scaled_train, y_train)
        prediction = model.predict(scaled_validation)
        metrics = metric_payload(y_validation, prediction)
        validation_rows.append({"model": "Ridge", "alpha": alpha, **metrics})
        ridge_candidates.append((alpha, model, metrics))
        for feature, coefficient in zip(FEATURES, model.coef_, strict=True):
            coefficient_rows.append(
                {"model": "Ridge", "alpha": alpha, "feature": feature, "coefficient": finite_number(coefficient)}
            )
    for feature, coefficient in zip(FEATURES, baseline.coef_, strict=True):
        coefficient_rows.append(
            {"model": "LinearRegression", "alpha": "none", "feature": feature, "coefficient": finite_number(coefficient)}
        )
    best_alpha, _, best_ridge_metrics = min(ridge_candidates, key=lambda item: item[2]["rmse"])
    ridge_relative_improvement = (baseline_metrics["rmse"] - best_ridge_metrics["rmse"]) / baseline_metrics["rmse"]
    selected_model = "Ridge" if ridge_relative_improvement >= 0.01 else "LinearRegression"
    selected_alpha = best_alpha if selected_model == "Ridge" else None

    combined = frame.loc[frame["split"].isin(["train", "validation"])]
    combined_scaler = StandardScaler().fit(combined[FEATURES].to_numpy(dtype=float))
    combined_x = combined_scaler.transform(combined[FEATURES].to_numpy(dtype=float))
    if selected_model == "Ridge":
        final_model: LinearRegression | Ridge = Ridge(alpha=selected_alpha, solver="svd")
    else:
        final_model = LinearRegression()
    final_model.fit(combined_x, combined[TARGET].to_numpy(dtype=float))
    final_prediction = final_model.predict(combined_scaler.transform(x_test))
    final_metrics = metric_payload(y_test, final_prediction)

    predictions = test[["row_id", *FEATURES, TARGET]].copy()
    predictions["prediction"] = final_prediction
    predictions["residual"] = predictions[TARGET] - predictions["prediction"]
    predictions["abs_error"] = predictions["residual"].abs()
    predictions["target_capped"] = predictions[TARGET] >= 5.0
    predictions["failure_group"] = "ordinary"
    predictions.loc[predictions["target_capped"], "failure_group"] = "target-cap"
    high_occupancy = train["AveOccup"].quantile(0.99)
    predictions.loc[predictions["AveOccup"] >= high_occupancy, "failure_group"] = "high-occupancy"
    predictions.loc[predictions["abs_error"] >= predictions["abs_error"].quantile(0.99), "failure_group"] = "largest-error"

    named_failures = predictions.nlargest(8, "abs_error")[
        ["row_id", TARGET, "prediction", "residual", "abs_error", "Latitude", "Longitude", "failure_group"]
    ]
    group_metrics = []
    for group, subset in predictions.groupby("failure_group", sort=True):
        group_metrics.append(
            {
                "group": group,
                "count": int(len(subset)),
                "mae": finite_number(subset["abs_error"].mean()),
                "meanResidual": finite_number(subset["residual"].mean()),
            }
        )

    all_scaler = StandardScaler().fit(frame[FEATURES].to_numpy(dtype=float))
    training_stats = []
    for feature in FEATURES:
        series = train[feature]
        training_stats.append(
            {
                "feature": feature,
                "min": finite_number(series.min()),
                "q25": finite_number(series.quantile(0.25)),
                "median": finite_number(series.median()),
                "mean": finite_number(series.mean()),
                "q75": finite_number(series.quantile(0.75)),
                "max": finite_number(series.max()),
                "std": finite_number(series.std(ddof=0)),
                "correlationWithTarget": finite_number(train[[feature, TARGET]].corr().iloc[0, 1]),
            }
        )

    validation_sample = validation.iloc[:12].copy()
    validation_scaled = scaler.transform(validation_sample[FEATURES].to_numpy(dtype=float))
    contribution_rows = []
    for row_index, (_, sample) in enumerate(validation_sample.iterrows()):
        contributions = validation_scaled[row_index] * baseline.coef_
        contribution_rows.append(
            {
                "rowId": sample["row_id"],
                "actual": finite_number(sample[TARGET]),
                "prediction": finite_number(baseline.predict(validation_scaled[row_index : row_index + 1])[0]),
                "intercept": finite_number(baseline.intercept_),
                "contributions": {
                    feature: finite_number(value)
                    for feature, value in zip(FEATURES, contributions, strict=True)
                },
            }
        )

    split_counts = {"train": TRAIN_ROWS, "validation": VALIDATION_ROWS, "test": TEST_ROWS}
    schema = [
        {"name": "row_id", "role": "identifier", "unit": "none"},
        {"name": "MedInc", "role": "feature", "unit": "$10,000"},
        {"name": "HouseAge", "role": "feature", "unit": "years"},
        {"name": "AveRooms", "role": "feature", "unit": "rooms/household"},
        {"name": "AveBedrms", "role": "feature", "unit": "bedrooms/household"},
        {"name": "Population", "role": "feature", "unit": "people"},
        {"name": "AveOccup", "role": "feature", "unit": "people/household"},
        {"name": "Latitude", "role": "feature", "unit": "degrees"},
        {"name": "Longitude", "role": "feature", "unit": "degrees"},
        {"name": TARGET, "role": "target", "unit": "$100,000"},
        {"name": "split", "role": "partition", "unit": "none"},
    ]

    interactions = {
        "csv-to-frame": {
            "kind": "data-contract",
            "chapterId": "csv-to-frame",
            "sourceCellId": "load-and-contract",
            "rowCount": EXPECTED_ROWS,
            "featureCount": len(FEATURES),
            "splitCounts": split_counts,
            "schema": schema,
            "sampleRows": sample_points(train[["row_id", *FEATURES, TARGET]], 12, 2801),
        },
        "eda-first-pass": {
            "kind": "training-eda",
            "chapterId": "eda-first-pass",
            "sourceCellId": "training-only-eda",
            "trainingStats": training_stats,
            "relations": {feature: binned_relation(train, feature) for feature in FEATURES},
            "scatter": sample_points(train[["row_id", "MedInc", "Latitude", "Longitude", TARGET]], 420, 2802),
            "targetCapCount": int((train[TARGET] >= 5.0).sum()),
        },
        "cleaning-splits": {
            "kind": "leakage-boundary",
            "chapterId": "cleaning-splits",
            "sourceCellId": "train-only-preprocessing",
            "features": [
                {
                    "feature": feature,
                    "trainMean": finite_number(scaler.mean_[index]),
                    "trainScale": finite_number(scaler.scale_[index]),
                    "invalidFullMean": finite_number(all_scaler.mean_[index]),
                    "invalidFullScale": finite_number(all_scaler.scale_[index]),
                }
                for index, feature in enumerate(FEATURES)
            ],
            "rules": ["split-before-eda", "fit-on-train", "transform-validation-and-test", "open-test-once"],
        },
        "linear-baseline": {
            "kind": "baseline-contributions",
            "chapterId": "linear-baseline",
            "sourceCellId": "linear-baseline",
            "intercept": finite_number(baseline.intercept_),
            "standardizedCoefficients": {
                feature: finite_number(value)
                for feature, value in zip(FEATURES, baseline.coef_, strict=True)
            },
            "validationMetrics": baseline_metrics,
            "samples": contribution_rows,
        },
        "evaluation": {
            "kind": "ridge-selection",
            "chapterId": "evaluation",
            "sourceCellId": "ridge-validation-selection",
            "baseline": validation_rows[0],
            "ridgePath": validation_rows[1:],
            "bestRidgeAlpha": best_alpha,
            "relativeImprovement": finite_number(ridge_relative_improvement),
            "selectedModel": selected_model,
            "selectedAlpha": selected_alpha,
            "selectionThreshold": 0.01,
            "testLocked": True,
        },
        "review-next-iteration": {
            "kind": "final-review",
            "chapterId": "review-next-iteration",
            "sourceCellId": "final-test-review",
            "selectedModel": selected_model,
            "selectedAlpha": selected_alpha,
            "testMetrics": final_metrics,
            "residualSample": sample_points(
                predictions[["row_id", TARGET, "prediction", "residual", "abs_error", "failure_group"]],
                420,
                2803,
            ),
            "namedFailures": named_failures.to_dict(orient="records"),
            "groupMetrics": group_metrics,
            "limitations": [
                "1990-census-snapshot",
                "block-group-not-individual-home",
                "target-cap-near-500k",
                "linear-geographic-boundary",
                "association-not-causation",
            ],
        },
    }

    figure_dir.mkdir(parents=True, exist_ok=True)
    figures = build_figures(
        train,
        validation_rows,
        coefficient_rows,
        predictions,
        scaler,
        all_scaler,
        figure_dir,
    )

    summary = {
        "contractVersion": CONTRACT_VERSION,
        "dataset": {
            "rows": EXPECTED_ROWS,
            "features": FEATURES,
            "target": TARGET,
            "targetUnit": "$100,000",
            "rowMeaning": "1990 California census block group",
            "missingValues": 0,
            "splitCounts": split_counts,
            "splitSeed": SEED,
        },
        "preprocessing": {
            "fitPartition": "train",
            "scalerMean": finite_list(scaler.mean_),
            "scalerScale": finite_list(scaler.scale_),
        },
        "baselineValidation": baseline_metrics,
        "bestRidgeValidation": {"alpha": best_alpha, **best_ridge_metrics},
        "ridgeRelativeRmseImprovement": finite_number(ridge_relative_improvement),
        "selectionRule": "select Ridge only when validation RMSE improves by at least 1%",
        "selectedModel": selected_model,
        "selectedAlpha": selected_alpha,
        "finalRefitPartitions": ["train", "validation"],
        "finalTestEvaluationCount": 1,
        "finalTestMetrics": final_metrics,
        "namedFailureIds": named_failures["row_id"].tolist(),
    }
    return Analysis(
        summary=summary,
        validation_metrics=pd.DataFrame(validation_rows),
        final_predictions=predictions,
        coefficient_path=pd.DataFrame(coefficient_rows),
        interactions=interactions,
        figures=figures,
    )


def save_figure(path: Path) -> None:
    plt.tight_layout()
    plt.savefig(path, dpi=160, bbox_inches="tight", metadata={"Software": "ML Atlas"})
    plt.close()


def build_figures(
    train: pd.DataFrame,
    validation_rows: list[dict[str, Any]],
    coefficient_rows: list[dict[str, Any]],
    predictions: pd.DataFrame,
    train_scaler: StandardScaler,
    full_scaler: StandardScaler,
    figure_dir: Path,
) -> list[dict[str, Any]]:
    definitions = [
        ("train-target-distribution", "eda-first-pass", "training-only-eda", "train-target-distribution.png"),
        ("train-income-target", "eda-first-pass", "training-only-eda", "train-income-target.png"),
        ("train-geography", "eda-first-pass", "training-only-eda", "train-geography.png"),
        ("scaler-boundary", "cleaning-splits", "train-only-preprocessing", "scaler-boundary.png"),
        ("validation-ridge-path", "evaluation", "ridge-validation-selection", "validation-ridge-path.png"),
        ("final-predicted-actual", "review-next-iteration", "final-test-review", "final-predicted-actual.png"),
        ("final-residuals", "review-next-iteration", "final-test-review", "final-residuals.png"),
    ]

    plt.figure(figsize=(8, 4.8))
    plt.hist(train[TARGET], bins=36, color="#2563eb", edgecolor="white")
    plt.xlabel("Median block-group value ($100k)")
    plt.ylabel("Training rows")
    save_figure(figure_dir / definitions[0][3])

    sampled = train.iloc[np.random.default_rng(2804).choice(len(train), 1600, replace=False)]
    plt.figure(figsize=(8, 5))
    plt.scatter(sampled["MedInc"], sampled[TARGET], s=9, alpha=0.28, color="#0f766e")
    plt.xlabel("Median income ($10k)")
    plt.ylabel("Median block-group value ($100k)")
    save_figure(figure_dir / definitions[1][3])

    plt.figure(figsize=(8, 5))
    plot = plt.scatter(
        sampled["Longitude"], sampled["Latitude"], c=sampled[TARGET], s=11, alpha=0.5, cmap="viridis"
    )
    plt.xlabel("Longitude")
    plt.ylabel("Latitude")
    plt.colorbar(plot, label="Target ($100k)")
    save_figure(figure_dir / definitions[2][3])

    positions = np.arange(len(FEATURES))
    plt.figure(figsize=(9, 5))
    plt.bar(positions - 0.18, train_scaler.mean_, width=0.36, label="Train-only mean", color="#2563eb")
    plt.bar(positions + 0.18, full_scaler.mean_, width=0.36, label="Invalid full-data mean", color="#f97316")
    plt.xticks(positions, FEATURES, rotation=35, ha="right")
    plt.yscale("symlog")
    plt.legend()
    save_figure(figure_dir / definitions[3][3])

    ridge_rows = [row for row in validation_rows if row["model"] == "Ridge"]
    plt.figure(figsize=(8, 4.8))
    plt.semilogx([row["alpha"] for row in ridge_rows], [row["rmse"] for row in ridge_rows], marker="o")
    plt.axhline(validation_rows[0]["rmse"], color="#f97316", linestyle="--", label="Linear baseline")
    plt.xlabel("Ridge alpha")
    plt.ylabel("Validation RMSE")
    plt.legend()
    save_figure(figure_dir / definitions[4][3])

    plt.figure(figsize=(6.5, 6.5))
    plt.scatter(predictions[TARGET], predictions["prediction"], s=10, alpha=0.25, color="#2563eb")
    low = min(predictions[TARGET].min(), predictions["prediction"].min())
    high = max(predictions[TARGET].max(), predictions["prediction"].max())
    plt.plot([low, high], [low, high], color="#0f172a", linestyle="--")
    plt.xlabel("Actual ($100k)")
    plt.ylabel("Prediction ($100k)")
    save_figure(figure_dir / definitions[5][3])

    plt.figure(figsize=(8, 5))
    plt.scatter(predictions["prediction"], predictions["residual"], s=10, alpha=0.25, color="#7c3aed")
    plt.axhline(0, color="#0f172a", linestyle="--")
    plt.xlabel("Fitted value ($100k)")
    plt.ylabel("Residual: actual - prediction ($100k)")
    save_figure(figure_dir / definitions[6][3])

    return [
        {
            "id": figure_id,
            "chapterId": chapter_id,
            "sourceCellId": source_cell_id,
            "publicPath": f"/tabular-regression/figures/{filename}",
            "file": f"figures/{filename}",
        }
        for figure_id, chapter_id, source_cell_id, filename in definitions
    ]


def notebook_cells(locale: str) -> list[Any]:
    zh = locale == "zh-CN"
    title = "California Housing 端到端表格回归" if zh else "California Housing End-to-End Tabular Regression"
    intro = (
        "本 Notebook 使用网站发布的本地 CSV。每行是 1990 年人口普查街区组，不是单套房；所有模型选择发生在 validation，test 只在最后评价一次。"
        if zh
        else "This notebook uses the site's local CSV. Each row is a 1990 census block group, not an individual home; model selection uses validation and test is evaluated once at the end."
    )
    cells = [
        nbformat.v4.new_markdown_cell(f"# {title}\n\n{intro}", id="intro"),
        nbformat.v4.new_code_cell(
            """from pathlib import Path
import hashlib
import json
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

DATA_PATH = Path('../../datasets/tabular-regression/california-housing.csv').resolve()
EXPECTED_SHA256 = __DATA_SHA__
assert hashlib.sha256(DATA_PATH.read_bytes()).hexdigest() == EXPECTED_SHA256
FEATURES = ['MedInc', 'HouseAge', 'AveRooms', 'AveBedrms', 'Population', 'AveOccup', 'Latitude', 'Longitude']
TARGET = 'MedHouseVal'
df = pd.read_csv(DATA_PATH)
assert df.shape == (20640, 11)
print(df.shape)
print(df[['row_id', *FEATURES, TARGET, 'split']].head(3).to_string(index=False))""",
            id="load-and-contract",
        ),
        nbformat.v4.new_code_cell(
            """train = df[df['split'] == 'train'].copy()
validation = df[df['split'] == 'validation'].copy()
test = df[df['split'] == 'test'].copy()
print({'train': len(train), 'validation': len(validation), 'test': len(test)})
print('missing:', int(train.isna().sum().sum()))
print(train[[*FEATURES, TARGET]].describe().round(4).to_string())""",
            id="training-only-eda",
        ),
        nbformat.v4.new_code_cell(
            """scaler = StandardScaler().fit(train[FEATURES])
X_train = scaler.transform(train[FEATURES])
X_validation = scaler.transform(validation[FEATURES])
print('fit partition: train')
print(pd.DataFrame({'feature': FEATURES, 'mean': scaler.mean_, 'scale': scaler.scale_}).round(6).to_string(index=False))""",
            id="train-only-preprocessing",
        ),
        nbformat.v4.new_code_cell(
            """def metrics(actual, predicted):
    return {
        'rmse': float(mean_squared_error(actual, predicted) ** 0.5),
        'mae': float(mean_absolute_error(actual, predicted)),
        'r2': float(r2_score(actual, predicted)),
    }

baseline = LinearRegression().fit(X_train, train[TARGET])
baseline_validation = metrics(validation[TARGET], baseline.predict(X_validation))
print(baseline_validation)
print(pd.Series(baseline.coef_, index=FEATURES).round(6).to_string())""",
            id="linear-baseline",
        ),
        nbformat.v4.new_code_cell(
            """ridge_path = []
for alpha in [0.01, 0.1, 1.0, 10.0, 100.0]:
    ridge = Ridge(alpha=alpha, solver='svd').fit(X_train, train[TARGET])
    ridge_path.append({'alpha': alpha, **metrics(validation[TARGET], ridge.predict(X_validation))})
ridge_path = pd.DataFrame(ridge_path)
best = ridge_path.loc[ridge_path['rmse'].idxmin()]
relative_improvement = (baseline_validation['rmse'] - best['rmse']) / baseline_validation['rmse']
selected_model = 'Ridge' if relative_improvement >= 0.01 else 'LinearRegression'
print(ridge_path.round(8).to_string(index=False))
print({'best_alpha': float(best['alpha']), 'relative_improvement': float(relative_improvement), 'selected_model': selected_model})""",
            id="ridge-validation-selection",
        ),
        nbformat.v4.new_code_cell(
            """combined = df[df['split'].isin(['train', 'validation'])]
final_scaler = StandardScaler().fit(combined[FEATURES])
if selected_model == 'Ridge':
    final_model = Ridge(alpha=float(best['alpha']), solver='svd')
else:
    final_model = LinearRegression()
final_model.fit(final_scaler.transform(combined[FEATURES]), combined[TARGET])
test_prediction = final_model.predict(final_scaler.transform(test[FEATURES]))
test_metrics = metrics(test[TARGET], test_prediction)
residuals = pd.DataFrame({
    'row_id': test['row_id'].to_numpy(),
    'actual': test[TARGET].to_numpy(),
    'prediction': test_prediction,
    'residual': test[TARGET].to_numpy() - test_prediction,
})
residuals['abs_error'] = residuals['residual'].abs()
print(test_metrics)
print(residuals.nlargest(8, 'abs_error').round(6).to_string(index=False))""",
            id="final-test-review",
        ),
    ]
    for cell in cells:
        if cell.cell_type == "code":
            cell.metadata["mlAtlas"] = {"sourceCellId": cell.id}
    return cells


def build_notebooks(staging_notebooks: Path, dataset_sha: str) -> list[Path]:
    staging_notebooks.mkdir(parents=True, exist_ok=True)
    outputs: list[Path] = []
    for locale in ("zh-CN", "en"):
        notebook = nbformat.v4.new_notebook(
            cells=notebook_cells(locale),
            metadata={
                "kernelspec": {"display_name": "ML Atlas Phase 28", "language": "python", "name": KERNEL_NAME},
                "language_info": {"name": "python", "version": "3.12.13"},
                "mlAtlas": {"contractVersion": CONTRACT_VERSION, "locale": locale},
            },
        )
        for cell in notebook.cells:
            if cell.cell_type == "code":
                cell.source = cell.source.replace("__DATA_SHA__", repr(dataset_sha))
        notebook_path = staging_notebooks / f"california-housing-project.{locale}.ipynb"
        nbformat.write(notebook, notebook_path)
        client = NotebookClient(notebook, timeout=180, kernel_name=KERNEL_NAME, resources={"metadata": {"path": str(staging_notebooks)}})
        client.execute()
        nbformat.write(notebook, notebook_path)
        outputs.append(notebook_path)
    return outputs


def dataset_manifest(dataset_path: Path) -> dict[str, Any]:
    return {
        "contractVersion": CONTRACT_VERSION,
        "dataset": {
            "name": "California Housing",
            "rowMeaning": "1990 California census block group",
            "target": TARGET,
            "targetMeaning": "median block-group house value",
            "targetUnit": "$100,000",
            "features": FEATURES,
            "rows": EXPECTED_ROWS,
            "missingValues": 0,
        },
        "source": {
            "url": SOURCE_URL,
            "archiveSha256": SOURCE_SHA256,
            "archiveFile": "houses.zip/cadata.txt",
            "retrievedAt": "2026-08-04",
            "authors": "R. Kelley Pace and Ronald Barry",
            "paper": "Sparse Spatial Autoregressions, Statistics and Probability Letters 33 (1997) 291-297",
            "licenseScopeNote": "The scikit-learn loader code is BSD-3-Clause. That software license is not asserted as the dataset license; the data are derived from the 1990 U.S. Census and distributed by StatLib.",
        },
        "transformation": {
            "featureOrder": FEATURES,
            "ratioFeatures": {
                "AveRooms": "total rooms / households",
                "AveBedrms": "total bedrooms / households",
                "AveOccup": "population / households",
            },
            "targetScale": "median house value / 100000",
            "missingValueImputation": False,
            "outlierRemoval": False,
        },
        "split": {
            "algorithm": "numpy.random.default_rng(42).permutation",
            "counts": {"train": TRAIN_ROWS, "validation": VALIDATION_ROWS, "test": TEST_ROWS},
        },
        "file": {
            "publicPath": "/datasets/tabular-regression/california-housing.csv",
            "sha256": sha256_file(dataset_path),
            "bytes": dataset_path.stat().st_size,
            "rows": EXPECTED_ROWS,
            "columns": 11,
        },
    }


def publish_tree(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    backup = destination.with_name(f".{destination.name}.backup")
    if backup.exists():
        shutil.rmtree(backup)
    if destination.exists():
        os.replace(destination, backup)
    try:
        os.replace(source, destination)
    except Exception:
        if backup.exists() and not destination.exists():
            os.replace(backup, destination)
        raise
    if backup.exists():
        shutil.rmtree(backup)


def create_output_manifest(root: Path, excluded: set[str] | None = None) -> dict[str, Any]:
    excluded = excluded or set()
    files = []
    for path in sorted(item for item in root.rglob("*") if item.is_file()):
        relative = path.relative_to(root).as_posix()
        if relative in excluded:
            continue
        files.append({"path": relative, "sha256": sha256_file(path), "bytes": path.stat().st_size})
    return {"contractVersion": CONTRACT_VERSION, "files": files}


def build(archive_path: Path) -> None:
    archive = acquire_archive(archive_path)
    frame = parse_archive(archive)
    with tempfile.TemporaryDirectory(prefix="ml-atlas-phase28-") as temp_dir_name:
        temp_root = Path(temp_dir_name)
        data_dir = temp_root / "datasets/tabular-regression"
        notebook_dir = temp_root / "notebooks/tabular-regression"
        asset_dir = temp_root / "tabular-regression"
        figure_dir = asset_dir / "figures"
        interaction_dir = asset_dir / "interactions"
        data_dir.mkdir(parents=True, exist_ok=True)
        notebook_dir.mkdir(parents=True, exist_ok=True)
        interaction_dir.mkdir(parents=True, exist_ok=True)

        dataset_path = data_dir / "california-housing.csv"
        frame.to_csv(dataset_path, index=False, float_format="%.10g")
        published_frame = pd.read_csv(dataset_path)
        validate_frame(published_frame)
        dataset_sha = sha256_file(dataset_path)
        write_json(data_dir / "manifest.json", dataset_manifest(dataset_path))
        analysis = analyze(published_frame, figure_dir)
        write_json(
            data_dir / "data-dictionary.json",
            {
                "contractVersion": CONTRACT_VERSION,
                "columns": analysis.interactions["csv-to-frame"]["schema"],
            },
        )
        write_json(notebook_dir / "tabular-regression-summary.json", analysis.summary)
        analysis.validation_metrics.to_csv(notebook_dir / "validation-metrics.csv", index=False, float_format="%.12g")
        analysis.coefficient_path.to_csv(notebook_dir / "coefficient-path.csv", index=False, float_format="%.12g")
        analysis.final_predictions.to_csv(notebook_dir / "final-test-residuals.csv", index=False, float_format="%.12g")
        for chapter_id, payload in analysis.interactions.items():
            write_json(interaction_dir / f"{chapter_id}.json", payload)
        write_json(asset_dir / "figure-index.json", {"contractVersion": CONTRACT_VERSION, "figures": analysis.figures})

        build_notebooks(notebook_dir, dataset_sha)
        requirements = "\n".join(
            [
                "numpy==2.4.6",
                "pandas==3.0.3",
                "scikit-learn==1.9.0",
                "matplotlib==3.10.9",
                "nbformat==5.10.4",
                "nbclient==0.11.0",
                "ipykernel==7.3.0",
                "",
            ]
        )
        (notebook_dir / "requirements.txt").write_text(requirements, encoding="utf-8")
        write_json(
            notebook_dir / "environment.json",
            {
                "contractVersion": CONTRACT_VERSION,
                "python": "3.12.13",
                "packages": {
                    "numpy": np.__version__,
                    "pandas": pd.__version__,
                    "scikit-learn": sklearn.__version__,
                    "matplotlib": matplotlib.__version__,
                    "nbformat": nbformat.__version__,
                    "nbclient": "0.11.0",
                    "ipykernel": "7.3.0",
                },
                "execution": {"cleanKernel": True, "networkAccess": False, "finiteJsonOnly": True},
            },
        )

        interaction_manifest = {
            "contractVersion": CONTRACT_VERSION,
            "chapters": {
                chapter_id: {
                    "publicPath": f"/tabular-regression/interactions/{chapter_id}.json",
                    "sha256": sha256_file(interaction_dir / f"{chapter_id}.json"),
                    "sourceCellId": payload["sourceCellId"],
                    "kind": payload["kind"],
                }
                for chapter_id, payload in analysis.interactions.items()
            },
        }
        write_json(asset_dir / "interaction-manifest.json", interaction_manifest)
        write_json(notebook_dir / "output-manifest.json", create_output_manifest(notebook_dir, {"output-manifest.json"}))
        write_json(asset_dir / "manifest.json", create_output_manifest(asset_dir, {"manifest.json"}))

        verify_staged(data_dir, notebook_dir, asset_dir)
        publish_tree(data_dir, DATA_DIR)
        publish_tree(notebook_dir, NOTEBOOK_DIR)
        publish_tree(asset_dir, ASSET_DIR)


def verify_manifest(root: Path, manifest_path: Path) -> None:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    for entry in manifest["files"]:
        path = root / entry["path"]
        if not path.is_file() or sha256_file(path) != entry["sha256"] or path.stat().st_size != entry["bytes"]:
            raise AssetError(f"Manifest drift: {path}")


def verify_staged(data_dir: Path, notebook_dir: Path, asset_dir: Path) -> None:
    dataset_path = data_dir / "california-housing.csv"
    frame = pd.read_csv(dataset_path)
    validate_frame(frame)
    data_manifest = json.loads((data_dir / "manifest.json").read_text(encoding="utf-8"))
    if data_manifest["file"]["sha256"] != sha256_file(dataset_path):
        raise AssetError("Dataset manifest checksum mismatch")
    summary = json.loads((notebook_dir / "tabular-regression-summary.json").read_text(encoding="utf-8"))
    if summary["dataset"]["splitCounts"] != {"test": TEST_ROWS, "train": TRAIN_ROWS, "validation": VALIDATION_ROWS}:
        raise AssetError("Summary split counts drifted")
    if summary["finalTestEvaluationCount"] != 1:
        raise AssetError("Final test evaluation count must remain exactly one")
    if summary["selectedModel"] not in {"LinearRegression", "Ridge"}:
        raise AssetError("Unknown selected model")
    for locale in ("zh-CN", "en"):
        notebook_path = notebook_dir / f"california-housing-project.{locale}.ipynb"
        notebook = nbformat.read(notebook_path, as_version=4)
        if any(cell.cell_type == "code" and not cell.outputs for cell in notebook.cells):
            raise AssetError(f"Notebook has an unexecuted code cell: {notebook_path}")
    verify_manifest(notebook_dir, notebook_dir / "output-manifest.json")
    verify_manifest(asset_dir, asset_dir / "manifest.json")
    interactions = json.loads((asset_dir / "interaction-manifest.json").read_text(encoding="utf-8"))
    if set(interactions["chapters"]) != {
        "csv-to-frame",
        "eda-first-pass",
        "cleaning-splits",
        "linear-baseline",
        "evaluation",
        "review-next-iteration",
    }:
        raise AssetError("Interaction manifest chapter set drifted")


def check() -> None:
    for path in (DATA_DIR, NOTEBOOK_DIR, ASSET_DIR):
        if not path.is_dir():
            raise AssetError(f"Missing published asset directory: {path}")
    verify_staged(DATA_DIR, NOTEBOOK_DIR, ASSET_DIR)
    frame = pd.read_csv(DATA_DIR / "california-housing.csv")
    analysis = analyze(frame, Path(tempfile.mkdtemp(prefix="ml-atlas-phase28-check-figures-")))
    published = json.loads((NOTEBOOK_DIR / "tabular-regression-summary.json").read_text(encoding="utf-8"))
    if json_bytes(analysis.summary) != json_bytes(published):
        raise AssetError("Published summary does not match recomputed numerical results")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument(
        "--archive",
        type=Path,
        default=Path.home() / ".cache/ml-atlas/california-housing/houses.zip",
    )
    args = parser.parse_args()
    try:
        if args.check:
            check()
            print("Phase 28 assets verified")
        else:
            build(args.archive)
            check()
            print("Phase 28 assets built and verified")
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
