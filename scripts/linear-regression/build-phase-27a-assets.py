#!/usr/bin/env python3
"""Build the reproducible Phase 27A Bike Sharing teaching asset bundle."""

from __future__ import annotations

import argparse
import hashlib
import json
import platform
import shutil
import sys
import tempfile
from pathlib import Path
from typing import Any, Callable

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import nbformat
import numpy as np
import pandas as pd
import sklearn
from nbclient import NotebookClient
from nbformat.v4 import new_code_cell, new_markdown_cell, new_notebook
from jupyter_client.kernelspec import KernelSpecManager
from sklearn.linear_model import Lasso, LinearRegression, Ridge
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

from phase27a_analysis import (
    CORE_FEATURES,
    LEAKAGE_COLUMNS,
    SOURCE_SHA256,
    TRAIN_END,
    VALIDATION_END,
    coefficient_rows,
    coefficient_spaces,
    core_gradient_descent,
    binned_feature_profile,
    deterministic_sample,
    engineer_cycle_features,
    finite_tree,
    fit_stages,
    gradient_descent_suite,
    load_bike_data,
    metric_set,
    named_failure_cases,
    polynomial_degree_metrics,
    refit_and_test,
    residual_records,
    select_stage,
    split_chronologically,
    univariate_sufficient_statistics,
)


ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / "public/datasets/python-data-tools/bike-sharing-hour.csv"
DEFAULT_OUTPUT = ROOT / "public/linear-regression/phase-27a"
PUBLIC_PREFIX = "/linear-regression/phase-27a"
CONTRACT_VERSION = "linear-regression-phase-27a-summary-v2"
PACKAGE_VERSION = "27A.1"
INTERACTION_CONTRACT_VERSION = "linear-regression-phase-27b-interaction-v1"
INTERACTION_MANIFEST_VERSION = "linear-regression-phase-27b-interaction-manifest-v1"

COLORS = {
    "ink": "#20304a",
    "muted": "#6b7890",
    "blue": "#2563eb",
    "cyan": "#0891b2",
    "orange": "#ea580c",
    "green": "#15803d",
    "red": "#dc2626",
    "grid": "#d9e2ef",
    "paper": "#ffffff",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def json_ready(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): json_ready(entry) for key, entry in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_ready(entry) for entry in value]
    if isinstance(value, np.ndarray):
        return [json_ready(entry) for entry in value.tolist()]
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return float(value)
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    return value


def interaction_base(scene_id: str, source_cell_id: str) -> dict[str, str]:
    return {
        "contractVersion": INTERACTION_CONTRACT_VERSION,
        "sceneId": scene_id,
        "sourceCellId": source_cell_id,
    }


def xy_points(
    frame: pd.DataFrame,
    x: str,
    y: str,
    *,
    split: str | None = None,
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for row in frame.itertuples(index=False):
        entry: dict[str, Any] = {"x": float(getattr(row, x)), "y": float(getattr(row, y))}
        if hasattr(row, "instant"):
            entry["instant"] = int(row.instant)
        if split is not None:
            entry["split"] = split
        rows.append(entry)
    return rows


def write_interaction_assets(
    root: Path,
    parts: Any,
    fits: list[Any],
    selected: Any,
    validation_records: list[dict[str, Any]],
    paths: dict[str, Any],
) -> dict[str, Any]:
    """Publish small browser assets derived only from the locked analysis flow."""
    output = root / "interactions"
    output.mkdir(parents=True, exist_ok=True)
    train = engineer_cycle_features(parts.train)
    validation = engineer_cycle_features(parts.validation)
    test = engineer_cycle_features(parts.test)

    line = LinearRegression().fit(train[["temp"]], train["cnt"])
    line_prediction = line.predict(train[["temp"]])
    baseline = {
        "slope": float(line.coef_[0]),
        "intercept": float(line.intercept_),
        "mse": float(mean_squared_error(train["cnt"], line_prediction)),
    }
    train_points = xy_points(deterministic_sample(train, 180), "temp", "cnt", split="train")
    point_domain = {
        "x": [float(train.temp.min()), float(train.temp.max())],
        "y": [0.0, float(train.cnt.max())],
    }

    fit_line = {
        **interaction_base("fit-line", "fit-line-chart"),
        "points": train_points,
        "domain": point_domain,
        "baseline": {"slope": baseline["slope"], "intercept": baseline["intercept"]},
    }

    matrix_columns = [
        *dict.fromkeys(
            feature
            for fit in fits
            for feature in fit.spec.features
            if feature not in LEAKAGE_COLUMNS and feature != "cnt"
        ),
        "cnt",
    ]
    multivariate = {
        **interaction_base("multivariate", "split-target-chart"),
        "partitions": [
            {
                "id": identifier,
                "start": int(start),
                "end": int(end),
                "rows": int(len(part)),
                "targetMean": float(part.cnt.mean()),
            }
            for identifier, start, end, part in (
                ("train", 0, TRAIN_END, parts.train),
                ("validation", TRAIN_END, VALIDATION_END, parts.validation),
                ("test", VALIDATION_END, len(parts.train) + len(parts.validation) + len(parts.test), parts.test),
            )
        ],
        "sampleRows": {
            identifier: [
                {column: float(getattr(row, column)) for column in matrix_columns}
                for row in deterministic_sample(part, 8).itertuples(index=False)
            ]
            for identifier, part in (
                ("train", train),
                ("validation", validation),
                ("test", test),
            )
        },
        "stages": [
            {
                "id": fit.spec.id,
                "features": list(fit.spec.features),
                "trainRmse": float(fit.train_metrics["rmse"]),
                "validationRmse": float(fit.validation_metrics["rmse"]),
            }
            for fit in fits
        ],
        "forbiddenFeatures": [*LEAKAGE_COLUMNS, "cnt"],
    }

    residual_loss = {
        **interaction_base("residual-loss", "residual-loss-chart"),
        "points": train_points,
        "domain": point_domain,
        "statistics": univariate_sufficient_statistics(train),
        "baseline": baseline,
    }

    traces = gradient_descent_suite(train)
    training_motion = {
        **interaction_base("training-motion", "gradient-descent-chart"),
        "traces": [
            {
                "learningRate": float(trace["learningRate"]),
                "status": trace["status"],
                "points": [
                    {
                        "update": int(point["update"]),
                        "mse": float(point["mse"]),
                        "gradientNorm": float(point["gradientNorm"]),
                        "intercept": float(point["intercept"]),
                        "weightTemp": float(point["weight_temp"]),
                    }
                    for point in trace["trace"]
                ],
            }
            for trace in traces
        ],
    }

    temperature_sample = deterministic_sample(train, 120)
    polynomial_curves = []
    grid = np.linspace(float(train.temp.min()), float(train.temp.max()), 81)
    for metric in polynomial_degree_metrics(parts):
        degree = int(metric["degree"])
        coefficients = np.polyfit(train.temp.to_numpy(float), train.cnt.to_numpy(float), degree)
        polynomial_curves.append(
            {
                **metric,
                "points": [{"x": float(x), "y": float(y)} for x, y in zip(grid, np.polyval(coefficients, grid), strict=True)],
            }
        )
    # Compare every stage against the same validation-hour target curve used for
    # selection, never against the locked test partition.
    hourly_actual = validation.groupby("hr", observed=True).cnt.mean()
    stage_hourly_predictions = []
    for fit in fits:
        predictions = fit.validation_prediction
        hourly = pd.DataFrame({"hr": validation.hr.to_numpy(int), "prediction": predictions}).groupby("hr", observed=True).prediction.mean()
        stage_hourly_predictions.append(
            {
                "id": fit.spec.id,
                "trainRmse": float(fit.train_metrics["rmse"]),
                "validationRmse": float(fit.validation_metrics["rmse"]),
                "points": [{"x": float(hour), "y": float(value)} for hour, value in hourly.items()],
            }
        )
    polynomial = {
        **interaction_base("polynomial", "hour-polynomial-chart"),
        "temperaturePoints": xy_points(temperature_sample, "temp", "cnt", split="train"),
        "polynomialCurves": polynomial_curves,
        "hourlyActual": [{"x": float(hour), "y": float(value)} for hour, value in hourly_actual.items()],
        "stageHourlyPredictions": stage_hourly_predictions,
    }

    spaces = coefficient_spaces(selected.pipeline)
    model_limits = {
        **interaction_base("model-limits", "coefficient-chart"),
        "spaces": spaces,
        "featureProfiles": [
            {
                "feature": feature,
                "domain": [float(train[feature].min()), float(train[feature].max())],
                "reference": float(train[feature].median()),
                "marginal": binned_feature_profile(train, feature),
            }
            for feature in ("temp", "hum", "windspeed", "hr")
        ],
    }

    validation_frame = pd.DataFrame(validation_records)
    hourly_residuals = validation_frame.groupby("hour", observed=True).residual.agg(
        mean="mean", mae=lambda values: float(np.mean(np.abs(values)))
    )
    prediction_sample = deterministic_sample(validation_frame, 240)
    overfitting = {
        **interaction_base("overfitting", "diagnostic-chart"),
        "complexity": [
            {
                "id": fit.spec.id,
                "trainRmse": float(fit.train_metrics["rmse"]),
                "validationRmse": float(fit.validation_metrics["rmse"]),
            }
            for fit in fits
        ],
        "hourlyResiduals": [
            {"hour": int(hour), "mean": float(row["mean"]), "mae": float(row["mae"])}
            for hour, row in hourly_residuals.iterrows()
        ],
        "predictionSample": [
            {
                "actual": float(row.actual),
                "prediction": float(row.prediction),
                "residual": float(row.residual),
                "hour": int(row.hour),
            }
            for row in prediction_sample.itertuples(index=False)
        ],
        "namedCases": [
            {
                "role": row["role"],
                "instant": int(row["instant"]),
                "timestamp": str(row["timestamp"]),
                "hour": int(row["hour"]),
                "actual": float(row["actual"]),
                "prediction": float(row["prediction"]),
                "residual": float(row["residual"]),
            }
            for row in named_failure_cases(validation_records)
        ],
    }

    regular_features = list(paths["features"])
    scaler = StandardScaler().fit(train[regular_features])
    x_train = scaler.transform(train[regular_features])
    x_validation = scaler.transform(validation[regular_features])
    ols = LinearRegression().fit(x_train, train.cnt.to_numpy(float))
    regularization = {
        **interaction_base("regularization", "regularization-chart"),
        "correlation": float(train[["temp", "atemp"]].corr().iloc[0, 1]),
        "temperatureSample": [
            {"temp": float(row.temp), "atemp": float(row.atemp)}
            for row in deterministic_sample(train, 180).itertuples(index=False)
        ],
        "ols": {
            "validationRmse": float(mean_squared_error(validation.cnt, ols.predict(x_validation)) ** 0.5),
            "coefficients": {
                feature: float(value)
                for feature, value in zip(regular_features, ols.coef_, strict=True)
            },
        },
        "paths": [*paths["ridge"], *paths["lasso"]],
    }

    assets = [
        fit_line,
        multivariate,
        residual_loss,
        training_motion,
        polynomial,
        model_limits,
        overfitting,
        regularization,
    ]
    manifest_assets = []
    for asset in assets:
        finite_tree(asset)
        filename = f"{asset['sceneId']}.json"
        path = output / filename
        path.write_text(json.dumps(json_ready(asset), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        manifest_assets.append(
            {
                "sceneId": asset["sceneId"],
                "publicPath": f"{PUBLIC_PREFIX}/interactions/{filename}",
                "sourceCellId": asset["sourceCellId"],
                "sha256": sha256(path),
                "bytes": path.stat().st_size,
            }
        )
    manifest = {
        "contractVersion": INTERACTION_MANIFEST_VERSION,
        "datasetSha256": SOURCE_SHA256,
        "assets": manifest_assets,
    }
    (root / "interaction-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return manifest


def setup_plot() -> None:
    plt.rcParams.update(
        {
            "figure.dpi": 120,
            "savefig.dpi": 160,
            "font.size": 10,
            "axes.titlesize": 13,
            "axes.labelsize": 10,
            "axes.edgecolor": COLORS["muted"],
            "axes.grid": True,
            "grid.color": COLORS["grid"],
            "grid.alpha": 0.7,
            "grid.linewidth": 0.7,
            "figure.facecolor": COLORS["paper"],
            "axes.facecolor": COLORS["paper"],
        }
    )


def save_figure(path: Path) -> None:
    plt.tight_layout()
    plt.savefig(path, bbox_inches="tight")
    plt.close()


def plot_fit_line(train: pd.DataFrame, output: Path) -> dict[str, Any]:
    sample = train.iloc[::12]
    model = LinearRegression().fit(train[["temp"]], train["cnt"])
    grid = np.linspace(train["temp"].min(), train["temp"].max(), 160)
    grid_frame = pd.DataFrame({"temp": grid})
    prediction = model.predict(grid_frame)
    plt.figure(figsize=(9.6, 5.4))
    plt.scatter(sample["temp"], sample["cnt"], s=11, alpha=0.3, color=COLORS["cyan"], label="training observations")
    plt.plot(grid, prediction, linewidth=3, color=COLORS["orange"], label="fitted line")
    plt.xlabel("Normalized temperature (temp)")
    plt.ylabel("Hourly rentals (cnt)")
    plt.title("A first line through the training data")
    plt.legend(frameon=False)
    save_figure(output)
    return {"intercept": float(model.intercept_), "slope": float(model.coef_[0])}


def plot_split_and_target(parts: Any, output: Path) -> dict[str, Any]:
    fig, axes = plt.subplots(2, 1, figsize=(9.6, 7.2), gridspec_kw={"height_ratios": [1, 2]})
    split_sizes = [len(parts.train), len(parts.validation), len(parts.test)]
    axes[0].barh(["chronological rows"], [split_sizes[0]], color=COLORS["blue"], label="train")
    axes[0].barh(["chronological rows"], [split_sizes[1]], left=[split_sizes[0]], color=COLORS["orange"], label="validation")
    axes[0].barh(["chronological rows"], [split_sizes[2]], left=[sum(split_sizes[:2])], color=COLORS["green"], label="test")
    axes[0].set_xlim(0, sum(split_sizes))
    axes[0].set_xlabel("Row position in time order")
    axes[0].legend(ncol=3, frameon=False, loc="upper center")
    bins = np.arange(0, 1001, 40)
    axes[1].hist(parts.train["cnt"], bins=bins, alpha=0.75, color=COLORS["blue"], label="train")
    axes[1].hist(parts.validation["cnt"], bins=bins, alpha=0.55, color=COLORS["orange"], label="validation")
    axes[1].set_xlabel("Hourly rentals (cnt)")
    axes[1].set_ylabel("Rows")
    axes[1].set_title("Target distribution changes over time")
    axes[1].legend(frameon=False)
    save_figure(output)
    return {
        "trainTarget": parts.train["cnt"].describe().round(3).to_dict(),
        "validationTarget": parts.validation["cnt"].describe().round(3).to_dict(),
    }


def plot_train_relations(train: pd.DataFrame, output: Path) -> dict[str, Any]:
    fig, axes = plt.subplots(2, 2, figsize=(9.6, 7.4))
    sample = train.iloc[::8]
    for axis, feature, label in zip(
        axes.flat,
        ("temp", "hum", "windspeed", "hr"),
        ("temperature", "humidity", "windspeed", "hour"),
        strict=True,
    ):
        axis.scatter(sample[feature], sample["cnt"], s=9, alpha=0.28, color=COLORS["cyan"])
        grouped = train.groupby(feature, observed=True)["cnt"].mean()
        axis.plot(grouped.index, grouped.values, linewidth=2.3, color=COLORS["orange"])
        axis.set_xlabel(label)
        axis.set_ylabel("mean cnt")
    fig.suptitle("Training-only feature relationships", y=1.01, fontsize=14)
    save_figure(output)
    return train.loc[:, [*CORE_FEATURES, "cnt"]].corr(numeric_only=True).round(4).to_dict()


def plot_residual_loss(train: pd.DataFrame, output: Path) -> dict[str, Any]:
    model = LinearRegression().fit(train[["temp"]], train["cnt"])
    sample = train.iloc[::70].copy()
    sample["prediction"] = model.predict(sample[["temp"]])
    sample["residual"] = sample["prediction"] - sample["cnt"]
    worst = sample.reindex(sample["residual"].abs().sort_values(ascending=False).index).head(16)
    fig, axes = plt.subplots(1, 2, figsize=(9.6, 4.7))
    axes[0].scatter(sample["prediction"], sample["cnt"], s=14, alpha=0.5, color=COLORS["blue"])
    low = min(sample["prediction"].min(), sample["cnt"].min())
    high = max(sample["prediction"].max(), sample["cnt"].max())
    axes[0].plot([low, high], [low, high], color=COLORS["ink"], linestyle="--")
    axes[0].set_xlabel("prediction")
    axes[0].set_ylabel("actual cnt")
    axes[0].set_title("Each vertical gap is a residual")
    positions = np.arange(len(worst))
    mae_weight = worst["residual"].abs().to_numpy()
    mse_weight = worst["residual"].pow(2).to_numpy()
    axes[1].plot(positions, mae_weight / mae_weight.max(), marker="o", color=COLORS["green"], label="|residual| (MAE)")
    axes[1].plot(positions, mse_weight / mse_weight.max(), marker="o", color=COLORS["red"], label="residual² (MSE)")
    axes[1].set_xlabel("large-error observations")
    axes[1].set_ylabel("relative contribution")
    axes[1].set_title("Squaring amplifies large errors")
    axes[1].legend(frameon=False)
    save_figure(output)
    prediction = model.predict(train[["temp"]])
    return metric_set(train["cnt"].to_numpy(float), prediction)


def plot_gradient_descent(gd: dict[str, Any], train: pd.DataFrame, output: Path) -> dict[str, Any]:
    trace = pd.DataFrame(gd["trace"])
    scaler = StandardScaler().fit(train[["temp", "hum", "windspeed", "hr"]])
    standardized = scaler.transform(train[["temp", "hum", "windspeed", "hr"]])
    fig, axes = plt.subplots(1, 3, figsize=(11.4, 4.2))
    axes[0].boxplot([train["temp"], train["hum"], train["windspeed"], train["hr"]], tick_labels=["temp", "hum", "wind", "hr"])
    axes[0].set_title("Before scaling")
    axes[1].boxplot([standardized[:, i] for i in range(4)], tick_labels=["temp", "hum", "wind", "hr"])
    axes[1].set_title("After train-only scaling")
    axes[2].plot(trace["update"], trace["mse"], color=COLORS["blue"], label="MSE")
    axes[2].set_yscale("log")
    axes[2].set_xlabel("gradient updates")
    axes[2].set_ylabel("training MSE (log scale)")
    twin = axes[2].twinx()
    twin.plot(trace["update"], trace["gradientNorm"], color=COLORS["orange"], alpha=0.75, label="gradient norm")
    twin.set_yscale("log")
    twin.set_ylabel("gradient norm")
    axes[2].set_title("Optimization settles")
    save_figure(output)
    return {
        "rawStandardDeviation": train[["temp", "hum", "windspeed", "hr"]].std().round(6).to_dict(),
        "scaledMean": standardized.mean(axis=0).round(10).tolist(),
        "scaledStandardDeviation": standardized.std(axis=0).round(10).tolist(),
    }


def plot_hour_and_polynomial(parts: Any, output: Path) -> dict[str, Any]:
    train = parts.train
    hourly = train.groupby(["workingday", "hr"], observed=True)["cnt"].mean().unstack(0)
    poly_metrics = polynomial_degree_metrics(parts)
    fig, axes = plt.subplots(1, 2, figsize=(9.6, 4.6))
    axes[0].plot(hourly.index, hourly.get(0), marker="o", color=COLORS["green"], label="non-working day")
    axes[0].plot(hourly.index, hourly.get(1), marker="o", color=COLORS["blue"], label="working day")
    axes[0].set_xticks(range(0, 24, 3))
    axes[0].set_xlabel("hour")
    axes[0].set_ylabel("mean cnt")
    axes[0].set_title("Hour is cyclic, and workdays differ")
    axes[0].legend(frameon=False)
    frame = pd.DataFrame(poly_metrics)
    axes[1].plot(frame["degree"], frame["trainRmse"], marker="o", color=COLORS["blue"], label="train")
    axes[1].plot(frame["degree"], frame["validationRmse"], marker="o", color=COLORS["orange"], label="validation")
    axes[1].set_xlabel("temperature polynomial degree")
    axes[1].set_ylabel("RMSE")
    axes[1].set_title("More curvature is not automatically better")
    axes[1].legend(frameon=False)
    save_figure(output)
    return {"polynomialDegrees": poly_metrics}


def plot_feature_stages(fits: list[Any], output: Path) -> dict[str, Any]:
    labels = [fit.spec.id for fit in fits]
    train_rmse = [fit.train_metrics["rmse"] for fit in fits]
    validation_rmse = [fit.validation_metrics["rmse"] for fit in fits]
    x = np.arange(len(labels))
    width = 0.37
    plt.figure(figsize=(10.4, 5.2))
    plt.bar(x - width / 2, train_rmse, width, color=COLORS["blue"], label="train")
    plt.bar(x + width / 2, validation_rmse, width, color=COLORS["orange"], label="validation")
    plt.xticks(x, [label.replace("-", "\n") for label in labels], fontsize=8)
    plt.ylabel("RMSE")
    plt.title("Validation decides whether a feature stage earns its complexity")
    plt.legend(frameon=False)
    save_figure(output)
    return {"bestValidationRmse": min(validation_rmse)}


def plot_coefficients(fit: Any, output: Path) -> dict[str, Any]:
    rows = coefficient_rows(fit.pipeline)
    ranked = sorted(rows, key=lambda row: abs(float(row["coefficient"])), reverse=True)[:16]
    ranked.reverse()
    plt.figure(figsize=(9.6, 6.2))
    colors = [COLORS["blue"] if float(row["coefficient"]) >= 0 else COLORS["orange"] for row in ranked]
    plt.barh([str(row["feature"]) for row in ranked], [float(row["coefficient"]) for row in ranked], color=colors)
    plt.axvline(0, color=COLORS["ink"], linewidth=1)
    plt.xlabel("coefficient in the fitted feature space")
    plt.title("Conditional coefficients are associations, not causal effects")
    save_figure(output)
    return {"largestAbsolute": list(reversed(ranked[-5:]))}


def plot_validation_diagnostics(validation: pd.DataFrame, prediction: np.ndarray, output: Path) -> dict[str, Any]:
    residual = prediction - validation["cnt"].to_numpy(float)
    frame = validation.copy()
    frame["prediction"] = prediction
    frame["residual"] = residual
    hourly = frame.groupby("hr", observed=True)["residual"].agg(["mean", "median"])
    fig, axes = plt.subplots(1, 3, figsize=(12, 4.3))
    sample = frame.iloc[::6]
    axes[0].scatter(sample["cnt"], sample["prediction"], s=10, alpha=0.35, color=COLORS["blue"])
    limit = max(sample["cnt"].max(), sample["prediction"].max())
    axes[0].plot([0, limit], [0, limit], linestyle="--", color=COLORS["ink"])
    axes[0].set_xlabel("actual")
    axes[0].set_ylabel("prediction")
    axes[0].set_title("Prediction vs actual")
    axes[1].scatter(sample["prediction"], sample["residual"], s=10, alpha=0.35, color=COLORS["orange"])
    axes[1].axhline(0, linestyle="--", color=COLORS["ink"])
    axes[1].set_xlabel("fitted value")
    axes[1].set_ylabel("prediction - actual")
    axes[1].set_title("Residual structure remains")
    axes[2].plot(hourly.index, hourly["mean"], marker="o", color=COLORS["red"], label="mean")
    axes[2].plot(hourly.index, hourly["median"], marker="o", color=COLORS["green"], label="median")
    axes[2].axhline(0, linestyle="--", color=COLORS["ink"])
    axes[2].set_xticks(range(0, 24, 3))
    axes[2].set_xlabel("hour")
    axes[2].set_ylabel("residual")
    axes[2].set_title("Errors by time of day")
    axes[2].legend(frameon=False)
    save_figure(output)
    return {"hourlyResidual": hourly.round(4).reset_index().to_dict(orient="records")}


def regularization_paths(parts: Any) -> dict[str, Any]:
    train = engineer_cycle_features(parts.train)
    validation = engineer_cycle_features(parts.validation)
    features = ["temp", "atemp", "hum", "windspeed", "workingday", "hour_sin", "hour_cos"]
    scaler = StandardScaler().fit(train[features])
    x_train = scaler.transform(train[features])
    x_validation = scaler.transform(validation[features])
    y_train = train["cnt"].to_numpy(float)
    y_validation = validation["cnt"].to_numpy(float)
    alphas = np.logspace(-2, 4, 25)
    ridge_rows: list[dict[str, Any]] = []
    lasso_rows: list[dict[str, Any]] = []
    for alpha in alphas:
        for kind, estimator, rows in (
            ("ridge", Ridge(alpha=float(alpha)), ridge_rows),
            ("lasso", Lasso(alpha=float(alpha), max_iter=50_000, tol=1e-7), lasso_rows),
        ):
            estimator.fit(x_train, y_train)
            rows.append(
                {
                    "model": kind,
                    "alpha": float(alpha),
                    "validationRmse": float(mean_squared_error(y_validation, estimator.predict(x_validation)) ** 0.5),
                    "coefficients": {feature: float(value) for feature, value in zip(features, estimator.coef_, strict=True)},
                }
            )
    return {"features": features, "ridge": ridge_rows, "lasso": lasso_rows}


def plot_regularization(parts: Any, paths: dict[str, Any], output: Path) -> dict[str, Any]:
    train = parts.train
    fig, axes = plt.subplots(1, 3, figsize=(12.4, 4.4))
    axes[0].scatter(train.iloc[::8]["temp"], train.iloc[::8]["atemp"], s=10, alpha=0.35, color=COLORS["cyan"])
    corr = float(train[["temp", "atemp"]].corr().iloc[0, 1])
    axes[0].set_xlabel("temp")
    axes[0].set_ylabel("atemp")
    axes[0].set_title(f"Collinearity: r = {corr:.3f}")
    for model_name, color, axis in (("ridge", COLORS["blue"], axes[1]), ("lasso", COLORS["orange"], axes[2])):
        frame = paths[model_name]
        for feature in ("temp", "atemp", "hum", "hour_sin", "hour_cos"):
            axis.plot([row["alpha"] for row in frame], [row["coefficients"][feature] for row in frame], label=feature)
        axis.set_xscale("log")
        axis.axhline(0, color=COLORS["ink"], linewidth=0.8)
        axis.set_xlabel("alpha")
        axis.set_ylabel("coefficient")
        axis.set_title(f"{model_name.title()} coefficient path")
        axis.legend(frameon=False, fontsize=7)
    save_figure(output)
    return {"tempAtempCorrelation": corr}


def plot_final_test(test: pd.DataFrame, prediction: np.ndarray, output: Path) -> dict[str, Any]:
    actual = test["cnt"].to_numpy(float)
    residual = prediction - actual
    fig, axes = plt.subplots(1, 2, figsize=(9.6, 4.5))
    sample = np.arange(0, len(test), 18)
    axes[0].plot(test.iloc[sample]["timestamp"], actual[sample], color=COLORS["ink"], linewidth=1.4, label="actual")
    axes[0].plot(test.iloc[sample]["timestamp"], prediction[sample], color=COLORS["blue"], linewidth=1.4, label="prediction")
    axes[0].set_xlabel("test time")
    axes[0].set_ylabel("cnt")
    axes[0].set_title("Frozen model on the untouched test period")
    axes[0].tick_params(axis="x", rotation=25)
    axes[0].legend(frameon=False)
    axes[1].hist(residual, bins=35, color=COLORS["orange"], alpha=0.8)
    axes[1].axvline(0, color=COLORS["ink"], linestyle="--")
    axes[1].set_xlabel("prediction - actual")
    axes[1].set_ylabel("test rows")
    axes[1].set_title("Final residual distribution")
    save_figure(output)
    return {"residualQuantiles": {str(q): float(np.quantile(residual, q)) for q in (0, 0.1, 0.5, 0.9, 1)}}


FIGURE_META: dict[str, dict[str, Any]] = {
    "fit-line-temp": {"chapterId": "fit-line", "sourceCellId": "fit-line-chart", "title": {"zh-CN": "训练集温度与租车量的第一条拟合直线", "en": "The first fitted line for training temperature and rentals"}, "alt": {"zh-CN": "训练集温度散点与线性回归拟合直线", "en": "Training temperature scatter plot with a fitted regression line"}, "caption": {"zh-CN": "直线概括整体上升趋势，但同一温度下租车量仍有很大差异。", "en": "The line captures the overall rise, while rentals still vary widely at the same temperature."}, "readingHint": {"zh-CN": "先沿横轴比较温度，再观察点到直线的垂直距离。", "en": "Compare temperature along the x-axis, then inspect each point's vertical distance to the line."}},
    "split-and-target": {"chapterId": "multivariate", "sourceCellId": "split-target-chart", "title": {"zh-CN": "时间切分与目标分布", "en": "Chronological split and target distribution"}, "alt": {"zh-CN": "训练验证测试时间切分及目标分布直方图", "en": "Chronological train-validation-test split and target histograms"}, "caption": {"zh-CN": "三个集合保持时间顺序，后期租车量分布与训练期并不完全相同。", "en": "The three partitions preserve time order, and later rental counts do not exactly match the training period."}, "readingHint": {"zh-CN": "注意验证集不是从训练数据中随机抽出的。", "en": "Notice that validation rows were not randomly sampled from training."}},
    "train-feature-relations": {"chapterId": "multivariate", "sourceCellId": "feature-relations-chart", "title": {"zh-CN": "只使用训练集观察特征关系", "en": "Feature relationships inspected on training data only"}, "alt": {"zh-CN": "温度湿度风速小时与平均租车量的四幅关系图", "en": "Four relationship plots for temperature, humidity, windspeed, hour and mean rentals"}, "caption": {"zh-CN": "小时的非线性形状提示单条直线不足以表达通勤节奏。", "en": "The nonlinear hourly shape suggests one straight effect cannot represent commuting rhythms."}, "readingHint": {"zh-CN": "比较散点范围与橙色分组均值线。", "en": "Compare the scatter range with the orange grouped-mean line."}},
    "residual-loss": {"chapterId": "residual-loss", "sourceCellId": "residual-loss-chart", "title": {"zh-CN": "残差与损失函数", "en": "Residuals and loss functions"}, "alt": {"zh-CN": "预测与实际差距以及绝对误差平方误差贡献对比", "en": "Prediction-to-actual gaps and a comparison of absolute versus squared error contributions"}, "caption": {"zh-CN": "平方让大残差获得更高权重，因此 MSE 对异常大误差更敏感。", "en": "Squaring gives large residuals more weight, making MSE more sensitive to extreme errors."}, "readingHint": {"zh-CN": "右图已归一化，比较两条曲线的增长速度。", "en": "The right panel is normalized; compare how quickly the two curves grow."}},
    "gradient-descent": {"chapterId": "training-motion", "sourceCellId": "gradient-descent-chart", "title": {"zh-CN": "训练集标准化与梯度下降轨迹", "en": "Training-only scaling and gradient-descent trajectory"}, "alt": {"zh-CN": "特征标准化前后箱线图与损失梯度轨迹", "en": "Feature boxplots before and after scaling plus loss and gradient trajectories"}, "caption": {"zh-CN": "只用训练集拟合缩放参数后，不同特征进入相近数值尺度，优化更稳定。", "en": "After fitting scaling parameters on training only, features enter comparable ranges and optimization stabilizes."}, "readingHint": {"zh-CN": "第三图使用对数坐标，下降后趋平表示接近最小值。", "en": "The third panel uses log scales; flattening after the drop indicates convergence."}},
    "hour-and-polynomial": {"chapterId": "polynomial", "sourceCellId": "hour-polynomial-chart", "title": {"zh-CN": "小时周期与多项式复杂度", "en": "Hourly cycles and polynomial complexity"}, "alt": {"zh-CN": "工作日分时需求曲线与不同多项式次数训练验证误差", "en": "Hourly demand curves by working day and train-validation errors for polynomial degrees"}, "caption": {"zh-CN": "特征可以非线性变换，而模型对参数仍保持线性；复杂度必须由验证集检验。", "en": "Features may be transformed nonlinearly while the model remains linear in its parameters; validation must justify complexity."}, "readingHint": {"zh-CN": "左图关注 23 点到 0 点的周期衔接，右图比较训练和验证 RMSE。", "en": "On the left, consider the 23-to-0 boundary; on the right, compare train and validation RMSE."}},
    "feature-stages": {"chapterId": "polynomial", "sourceCellId": "feature-stage-chart", "title": {"zh-CN": "预先声明的特征阶段", "en": "Predeclared feature stages"}, "alt": {"zh-CN": "六个特征与正则化阶段的训练验证RMSE柱状图", "en": "Train and validation RMSE bars for six feature and regularization stages"}, "caption": {"zh-CN": "增加特征通常降低训练误差，但是否值得保留由验证误差和简洁性共同决定。", "en": "More features often lower training error, but validation performance and simplicity decide whether they stay."}, "readingHint": {"zh-CN": "重点比较橙色验证柱，不要只看蓝色训练柱。", "en": "Focus on the orange validation bars rather than only the blue training bars."}},
    "coefficients": {"chapterId": "model-limits", "sourceCellId": "coefficient-chart", "title": {"zh-CN": "条件系数的方向与大小", "en": "Direction and magnitude of conditional coefficients"}, "alt": {"zh-CN": "标准化连续特征和编码类别特征的系数条形图", "en": "Coefficient bars for standardized continuous and encoded categorical features"}, "caption": {"zh-CN": "系数描述其他入模变量保持不变时的条件关联，不能直接解释为因果效应。", "en": "Coefficients describe conditional associations while other included variables are held fixed; they are not direct causal effects."}, "readingHint": {"zh-CN": "先确认特征经过何种缩放或编码，再解释系数。", "en": "Check each feature's scaling or encoding before interpreting its coefficient."}},
    "validation-diagnostics": {"chapterId": "overfitting", "sourceCellId": "diagnostic-chart", "title": {"zh-CN": "验证集残差诊断", "en": "Validation residual diagnostics"}, "alt": {"zh-CN": "验证集预测实际对照残差拟合值和分小时残差图", "en": "Validation prediction-versus-actual, residual-versus-fitted, and hourly residual plots"}, "caption": {"zh-CN": "残差仍随时段呈现结构，说明线性模型遗漏了部分需求机制。", "en": "Residuals retain time-of-day structure, showing that the linear model misses part of the demand mechanism."}, "readingHint": {"zh-CN": "随机云团较理想；可辨认的弧线或时段偏差表示系统性遗漏。", "en": "A random cloud is preferable; visible curves or hourly bias indicate systematic omissions."}},
    "regularization": {"chapterId": "regularization", "sourceCellId": "regularization-chart", "title": {"zh-CN": "共线性与正则化系数路径", "en": "Collinearity and regularization coefficient paths"}, "alt": {"zh-CN": "温度体感温度相关散点及Ridge Lasso系数路径", "en": "Temperature-apparent-temperature correlation and Ridge/Lasso coefficient paths"}, "caption": {"zh-CN": "temp 与 atemp 高度相关；Ridge 平滑收缩，Lasso 会把部分系数压到零。", "en": "temp and atemp are highly correlated; Ridge shrinks smoothly while Lasso can drive coefficients to zero."}, "readingHint": {"zh-CN": "沿横轴增大 alpha，观察两种方法如何处理相关特征。", "en": "Move right as alpha increases and compare how the methods handle correlated features."}},
    "final-test": {"chapterId": "regularization", "sourceCellId": "final-test-chart", "title": {"zh-CN": "冻结方案后的唯一一次测试集评价", "en": "The single test evaluation after freezing the design"}, "alt": {"zh-CN": "测试期实际预测时间序列与最终残差分布", "en": "Test-period actual and predicted time series with the final residual distribution"}, "caption": {"zh-CN": "测试集只回答冻结方案面对未来时段的表现，不再用于修改特征。", "en": "The test set only reports how the frozen design handles a later period; it is not used to revise features."}, "readingHint": {"zh-CN": "左图只抽样显示以保持可读，指标使用全部 3476 行。", "en": "The left panel is sampled for readability; metrics use all 3,476 rows."}},
}


def figure_entry(slug: str, path: Path, fallback: dict[str, Any]) -> dict[str, Any]:
    meta = FIGURE_META[slug]
    return {
        "id": slug,
        **meta,
        "publicPath": f"{PUBLIC_PREFIX}/figures/{path.name}",
        "sha256": sha256(path),
        "width": 1536,
        "loading": "lazy",
        "fallback": json_ready(fallback),
    }


def build_notebook(locale: str) -> Any:
    zh = locale == "zh-CN"
    title = "线性回归：Bike Sharing 八章可复现实验" if zh else "Linear Regression: an eight-chapter Bike Sharing experiment"
    intro = (
        "本 Notebook 使用原始时间顺序切分数据。所有探索、缩放与特征选择都避开测试集。"
        if zh
        else "This notebook preserves chronological order. Exploration, scaling, and feature selection all avoid the test set."
    )
    cells = [
        new_markdown_cell(f"# {title}\n\n{intro}", id="course-introduction"),
        new_code_cell(
            """from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

DATA_PATH = next(path for path in (
    Path('../../datasets/python-data-tools/bike-sharing-hour.csv'),
    Path('../../../datasets/python-data-tools/bike-sharing-hour.csv'),
    Path('.build-input.csv'),
) if path.exists())
data = pd.read_csv(DATA_PATH)
data['dteday'] = pd.to_datetime(data['dteday'])
data['timestamp'] = data['dteday'] + pd.to_timedelta(data['hr'], unit='h')
train = data.iloc[:10427].copy()
validation = data.iloc[10427:13903].copy()
test = data.iloc[13903:].copy()
print({'train': len(train), 'validation': len(validation), 'test': len(test)})""",
            id="load-and-split",
        ),
        new_code_cell(
            """line = LinearRegression().fit(train[['temp']], train['cnt'])
single_prediction = float(line.predict(pd.DataFrame({'temp': [0.5]}))[0])
print({'intercept': round(float(line.intercept_), 3), 'slope': round(float(line.coef_[0]), 3), 'prediction_at_temp_0.5': round(single_prediction, 3)})
sample = train.iloc[::12]
grid = np.linspace(train['temp'].min(), train['temp'].max(), 160)
plt.scatter(sample['temp'], sample['cnt'], s=9, alpha=.25)
plt.plot(grid, line.predict(pd.DataFrame({'temp': grid})), color='darkorange', linewidth=3)
plt.xlabel('temp'); plt.ylabel('cnt'); plt.show()""",
            id="fit-line-chart",
        ),
        new_code_cell(
            """print(train[['instant', 'timestamp', 'temp', 'hum', 'windspeed', 'workingday', 'hr', 'cnt']].head())
print('leakage identity:', bool((data['casual'] + data['registered'] == data['cnt']).all()))
print('ranges:', train['instant'].iloc[[0, -1]].tolist(), validation['instant'].iloc[[0, -1]].tolist(), test['instant'].iloc[[0, -1]].tolist())""",
            id="split-target-chart",
        ),
        new_code_cell(
            """print(train[['temp', 'hum', 'windspeed', 'workingday', 'hr', 'cnt']].describe().round(3))
print(train[['temp', 'hum', 'windspeed', 'workingday', 'hr', 'cnt']].corr().round(3))""",
            id="feature-relations-chart",
        ),
        new_code_cell(
            """train_prediction = line.predict(train[['temp']])
residual = train_prediction - train['cnt'].to_numpy()
metrics = {'MSE': mean_squared_error(train['cnt'], train_prediction), 'RMSE': mean_squared_error(train['cnt'], train_prediction) ** .5, 'MAE': mean_absolute_error(train['cnt'], train_prediction), 'R2': r2_score(train['cnt'], train_prediction)}
print({key: round(float(value), 3) for key, value in metrics.items()})
print('largest absolute residual:', round(float(np.abs(residual).max()), 3))""",
            id="residual-loss-chart",
        ),
        new_code_cell(
            """features = ['temp', 'hum', 'windspeed', 'workingday', 'hr']
scaler = StandardScaler().fit(train[['temp', 'hum', 'windspeed', 'hr']])
print('train-only scaler mean:', np.round(scaler.mean_, 4))
print('The published gradient-descent-trace.csv records the NumPy optimization and sklearn agreement.')""",
            id="gradient-descent-chart",
        ),
        new_code_cell(
            """hourly = train.groupby(['workingday', 'hr'])['cnt'].mean().unstack(0)
print(hourly.round(2).head(8))
angle = 2 * np.pi * train['hr'] / 24
print(pd.DataFrame({'hr': train['hr'].head(), 'sin_hr': np.sin(angle.head()), 'cos_hr': np.cos(angle.head())}).round(3))""",
            id="hour-polynomial-chart",
        ),
        new_code_cell(
            """stage_metrics = pd.read_csv('feature-stage-metrics.csv')
print(stage_metrics.round(3).to_string(index=False))""",
            id="feature-stage-chart",
        ),
        new_code_cell(
            """summary = pd.read_json('linear-regression-course-summary.json', typ='series')
print('Selected stage:', summary['selection']['selectedStageId'])
print('Interpret coefficients only after checking scaling and encoding; association is not causation.')""",
            id="coefficient-chart",
        ),
        new_code_cell(
            """residuals = pd.read_csv('test-residuals.csv')
print(residuals[['actual', 'prediction', 'residual']].describe().round(3))
print('Named failure cases are published in the summary JSON.')""",
            id="diagnostic-chart",
        ),
        new_code_cell(
            """print('temp/atemp training correlation:', round(float(train[['temp', 'atemp']].corr().iloc[0, 1]), 4))
print('Ridge shares shrinkage across correlated variables; Lasso can set coefficients exactly to zero.')""",
            id="regularization-chart",
        ),
        new_code_cell(
            """final_metrics = summary['finalTest']['metrics']
print({key: round(float(value), 3) for key, value in final_metrics.items()})
print('The test partition was evaluated once after feature and regularization decisions were frozen.')""",
            id="final-test-chart",
        ),
    ]
    notebook = new_notebook(
        cells=cells,
        metadata={
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "version": platform.python_version()},
            "mlAtlas": {"contractVersion": CONTRACT_VERSION, "locale": locale, "datasetSha256": SOURCE_SHA256},
        },
    )
    return notebook


def execute_notebook(notebook: Any, workdir: Path) -> Any:
    kernels = KernelSpecManager().find_kernel_specs()
    kernel_name = "python3" if "python3" in kernels else "ml-atlas-phase27a"
    if kernel_name not in kernels:
        raise RuntimeError("A Python 3 Jupyter kernel is required to execute Phase 27A notebooks")
    return NotebookClient(
        notebook,
        timeout=300,
        kernel_name=kernel_name,
        record_timing=False,
        resources={"metadata": {"path": str(workdir)}},
    ).execute()


def write_manifest(root: Path) -> None:
    members = []
    for path in sorted(entry for entry in root.rglob("*") if entry.is_file() and entry.name != "output-manifest.json"):
        relative = path.relative_to(root).as_posix()
        members.append(
            {
                "relativePath": relative,
                "publicPath": f"{PUBLIC_PREFIX}/{relative}",
                "bytes": path.stat().st_size,
                "sha256": sha256(path),
            }
        )
    manifest = {
        "contractVersion": "linear-regression-phase-27a-manifest-v1",
        "packageVersion": PACKAGE_VERSION,
        "datasetSha256": SOURCE_SHA256,
        "members": members,
    }
    (root / "output-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_bundle(root: Path) -> None:
    root.mkdir(parents=True, exist_ok=True)
    figures_dir = root / "figures"
    figures_dir.mkdir(parents=True, exist_ok=True)
    setup_plot()

    frame = load_bike_data(DATASET)
    parts = split_chronologically(frame)
    fits = fit_stages(parts)
    selected = select_stage(fits)
    final_pipeline, final_metrics, final_prediction = refit_and_test(selected, parts)
    gd = core_gradient_descent(parts.train)
    validation_records = residual_records(engineer_cycle_features(parts.validation), selected.validation_prediction)
    test_records = residual_records(engineer_cycle_features(parts.test), final_prediction)
    paths = regularization_paths(parts)
    interaction_manifest = write_interaction_assets(
        root,
        parts,
        fits,
        selected,
        validation_records,
        paths,
    )

    plotters: list[tuple[str, Callable[[Path], dict[str, Any]]]] = [
        ("fit-line-temp", lambda path: plot_fit_line(parts.train, path)),
        ("split-and-target", lambda path: plot_split_and_target(parts, path)),
        ("train-feature-relations", lambda path: plot_train_relations(parts.train, path)),
        ("residual-loss", lambda path: plot_residual_loss(parts.train, path)),
        ("gradient-descent", lambda path: plot_gradient_descent(gd, parts.train, path)),
        ("hour-and-polynomial", lambda path: plot_hour_and_polynomial(parts, path)),
        ("feature-stages", lambda path: plot_feature_stages(fits, path)),
        ("coefficients", lambda path: plot_coefficients(selected, path)),
        ("validation-diagnostics", lambda path: plot_validation_diagnostics(parts.validation, selected.validation_prediction, path)),
        ("regularization", lambda path: plot_regularization(parts, paths, path)),
        ("final-test", lambda path: plot_final_test(parts.test, final_prediction, path)),
    ]
    figure_entries = []
    for slug, plotter in plotters:
        path = figures_dir / f"{slug}.png"
        fallback = plotter(path)
        figure_entries.append(figure_entry(slug, path, fallback))

    stage_rows = []
    for fit in fits:
        stage_rows.append(
            {
                "stage_id": fit.spec.id,
                "order": fit.spec.order,
                "feature_count_before_encoding": len(fit.spec.features),
                "estimator": fit.spec.estimator,
                "alpha": fit.spec.alpha,
                "includes_atemp": fit.spec.includes_atemp,
                **{f"train_{key}": value for key, value in fit.train_metrics.items()},
                **{f"validation_{key}": value for key, value in fit.validation_metrics.items()},
            }
        )
    pd.DataFrame(stage_rows).to_csv(root / "feature-stage-metrics.csv", index=False, float_format="%.12g")
    pd.DataFrame(gd["trace"]).to_csv(root / "gradient-descent-trace.csv", index=False, float_format="%.12g")
    pd.DataFrame(test_records).to_csv(root / "test-residuals.csv", index=False, float_format="%.12g")

    summary = {
        "contractVersion": CONTRACT_VERSION,
        "packageVersion": PACKAGE_VERSION,
        "generatedFrom": "scripts/linear-regression/build-phase-27a-assets.py",
        "source": {
            "dataset": "UCI Bike Sharing Dataset hour.csv",
            "localPublicPath": "/datasets/python-data-tools/bike-sharing-hour.csv",
            "sha256": SOURCE_SHA256,
            "rows": len(frame),
            "license": "CC BY 4.0",
        },
        "split": {
            "strategy": "chronological-60-20-20",
            "train": {"startRow": 0, "endRowExclusive": TRAIN_END, "rows": len(parts.train), "instantRange": [int(parts.train.instant.iloc[0]), int(parts.train.instant.iloc[-1])]},
            "validation": {"startRow": TRAIN_END, "endRowExclusive": VALIDATION_END, "rows": len(parts.validation), "instantRange": [int(parts.validation.instant.iloc[0]), int(parts.validation.instant.iloc[-1])]},
            "test": {"startRow": VALIDATION_END, "endRowExclusive": len(frame), "rows": len(parts.test), "instantRange": [int(parts.test.instant.iloc[0]), int(parts.test.instant.iloc[-1])]},
            "mutuallyExclusive": True,
        },
        "trainingOnlyExploration": {
            "missingValues": {column: int(value) for column, value in parts.train.isna().sum().items()},
            "target": json_ready(parts.train["cnt"].describe().round(6).to_dict()),
            "coreFeatures": json_ready(parts.train.loc[:, [*CORE_FEATURES, "cnt"]].describe().round(6).to_dict()),
        },
        "leakage": {
            "forbiddenFeatureColumns": list(LEAKAGE_COLUMNS),
            "targetIdentity": "casual + registered = cnt",
            "preprocessorsFitOn": "train-only-during-selection",
            "testUsage": "single-final-evaluation-after-freeze",
        },
        "featureStages": [
            {
                "id": fit.spec.id,
                "order": fit.spec.order,
                "features": list(fit.spec.features),
                "estimator": fit.spec.estimator,
                "alpha": fit.spec.alpha,
                "includesAtemp": fit.spec.includes_atemp,
                "trainMetrics": fit.train_metrics,
                "validationMetrics": fit.validation_metrics,
            }
            for fit in fits
        ],
        "polynomialDiagnostics": polynomial_degree_metrics(parts),
        "selection": {
            "primaryMetric": "validation-rmse",
            "secondaryMetrics": ["mae", "r2"],
            "simplicityTolerance": 0.01,
            "selectedStageId": selected.spec.id,
            "bestValidationRmse": min(fit.validation_metrics["rmse"] for fit in fits),
            "selectedValidationMetrics": selected.validation_metrics,
        },
        "gradientDescent": {
            "features": list(CORE_FEATURES),
            "learningRate": gd["learningRate"],
            "updates": gd["updates"],
            "gradientTolerance": gd["gradientTolerance"],
            "finalMse": gd["trace"][-1]["mse"],
            "maxParameterDeltaVsSklearn": gd["maxParameterDeltaVsSklearn"],
            "scalerFitRows": len(parts.train),
        },
        "coefficientInterpretation": {
            "selectedStage": coefficient_rows(selected.pipeline),
            "finalRefit": coefficient_rows(final_pipeline),
            "selectedStageSpaces": coefficient_spaces(selected.pipeline),
            "finalRefitSpaces": coefficient_spaces(final_pipeline),
            "tempAtempTrainingCorrelation": float(parts.train[["temp", "atemp"]].corr().iloc[0, 1]),
        },
        "validationDiagnostics": {
            "metrics": selected.validation_metrics,
            "namedFailureCases": named_failure_cases(validation_records),
        },
        "regularization": paths,
        "finalTest": {
            "refitRows": len(parts.train) + len(parts.validation),
            "evaluatedRows": len(parts.test),
            "evaluationCount": 1,
            "stageId": selected.spec.id,
            "metrics": final_metrics,
            "namedFailureCases": named_failure_cases(test_records),
        },
        "figures": figure_entries,
        "downloads": {
            "notebookZh": f"{PUBLIC_PREFIX}/bike-linear-regression-course.zh-CN.ipynb",
            "notebookEn": f"{PUBLIC_PREFIX}/bike-linear-regression-course.en.ipynb",
            "summary": f"{PUBLIC_PREFIX}/linear-regression-course-summary.json",
            "stageMetrics": f"{PUBLIC_PREFIX}/feature-stage-metrics.csv",
            "gradientTrace": f"{PUBLIC_PREFIX}/gradient-descent-trace.csv",
            "residuals": f"{PUBLIC_PREFIX}/test-residuals.csv",
            "interactionManifest": f"{PUBLIC_PREFIX}/interaction-manifest.json",
            "manifest": f"{PUBLIC_PREFIX}/output-manifest.json",
        },
        "interactions": {
            "contractVersion": interaction_manifest["contractVersion"],
            "manifest": f"{PUBLIC_PREFIX}/interaction-manifest.json",
            "sceneIds": [asset["sceneId"] for asset in interaction_manifest["assets"]],
        },
    }
    finite_tree(summary)
    (root / "linear-regression-course-summary.json").write_text(json.dumps(json_ready(summary), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    (root / "requirements.txt").write_text(
        f"numpy=={np.__version__}\npandas=={pd.__version__}\nscikit-learn=={sklearn.__version__}\nmatplotlib=={matplotlib.__version__}\nnbformat=={nbformat.__version__}\nnbclient==0.11.0\nipykernel==7.3.0\n",
        encoding="utf-8",
    )
    environment = {
        "contractVersion": "linear-regression-phase-27a-environment-v1",
        "python": platform.python_version(),
        "platform": platform.platform(),
        "dependencies": {
            "numpy": np.__version__,
            "pandas": pd.__version__,
            "scikit-learn": sklearn.__version__,
            "matplotlib": matplotlib.__version__,
            "nbformat": nbformat.__version__,
            "nbclient": "0.11.0",
            "ipykernel": "7.3.0",
        },
    }
    (root / "environment.json").write_text(json.dumps(environment, indent=2) + "\n", encoding="utf-8")

    build_input = root / ".build-input.csv"
    shutil.copyfile(DATASET, build_input)
    try:
        for locale, filename in (("zh-CN", "bike-linear-regression-course.zh-CN.ipynb"), ("en", "bike-linear-regression-course.en.ipynb")):
            executed = execute_notebook(build_notebook(locale), root)
            nbformat.write(executed, root / filename)
    finally:
        build_input.unlink(missing_ok=True)

    write_manifest(root)


def tree_hashes(root: Path) -> dict[str, str]:
    return {path.relative_to(root).as_posix(): sha256(path) for path in sorted(root.rglob("*")) if path.is_file()}


def publish(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="phase27a-assets-", dir=output.parent) as temporary:
        staged = Path(temporary) / "bundle"
        build_bundle(staged)
        backup = output.with_name(f"{output.name}.backup")
        if backup.exists():
            shutil.rmtree(backup)
        try:
            if output.exists():
                output.rename(backup)
            staged.rename(output)
            if backup.exists():
                shutil.rmtree(backup)
        except Exception:
            if output.exists():
                shutil.rmtree(output)
            if backup.exists():
                backup.rename(output)
            raise


def check(output: Path) -> None:
    if not output.exists():
        raise SystemExit(f"asset bundle does not exist: {output}")
    with tempfile.TemporaryDirectory(prefix="phase27a-check-") as temporary:
        candidate = Path(temporary) / "bundle"
        build_bundle(candidate)
        expected = tree_hashes(candidate)
        observed = tree_hashes(output)
        if expected != observed:
            missing = sorted(set(expected) - set(observed))
            extra = sorted(set(observed) - set(expected))
            changed = sorted(key for key in set(expected) & set(observed) if expected[key] != observed[key])
            raise SystemExit(f"asset bundle drifted; missing={missing}, extra={extra}, changed={changed}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.check:
        check(args.output_root.resolve())
    else:
        publish(args.output_root.resolve())


if __name__ == "__main__":
    main()
