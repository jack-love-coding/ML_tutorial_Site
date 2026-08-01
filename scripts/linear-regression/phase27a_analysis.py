"""Pure Bike Sharing analysis used by the Phase 27A teaching assets."""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import Lasso, LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


TOTAL_ROWS = 17_379
TRAIN_END = 10_427
VALIDATION_END = 13_903
SOURCE_SHA256 = "e03de4ee4ef4dc376ac6e04bf829673c6269e8eba5c60fa121640fa2f829504f"
LEAKAGE_COLUMNS = ("casual", "registered")
CORE_FEATURES = ("temp", "hum", "windspeed", "workingday", "hr")


@dataclass(frozen=True)
class PartitionedBikeData:
    train: pd.DataFrame
    validation: pd.DataFrame
    test: pd.DataFrame


@dataclass(frozen=True)
class StageSpec:
    id: str
    order: int
    features: tuple[str, ...]
    estimator: str = "ols"
    alpha: float | None = None
    includes_atemp: bool = False


@dataclass
class StageFit:
    spec: StageSpec
    pipeline: Pipeline
    train_metrics: dict[str, float]
    validation_metrics: dict[str, float]
    validation_prediction: np.ndarray


def load_bike_data(path: Path) -> pd.DataFrame:
    frame = pd.read_csv(path)
    if len(frame) != TOTAL_ROWS:
        raise ValueError(f"expected {TOTAL_ROWS} rows, observed {len(frame)}")
    if not np.array_equal(frame["instant"].to_numpy(), np.arange(1, TOTAL_ROWS + 1)):
        raise ValueError("Bike rows are not in the locked instant order")
    if not np.array_equal(
        frame["casual"].to_numpy() + frame["registered"].to_numpy(),
        frame["cnt"].to_numpy(),
    ):
        raise ValueError("target leakage identity drifted")
    frame = frame.copy()
    frame["dteday"] = pd.to_datetime(frame["dteday"], format="%Y-%m-%d")
    frame["timestamp"] = frame["dteday"] + pd.to_timedelta(frame["hr"], unit="h")
    return frame


def split_chronologically(frame: pd.DataFrame) -> PartitionedBikeData:
    parts = PartitionedBikeData(
        train=frame.iloc[:TRAIN_END].copy(),
        validation=frame.iloc[TRAIN_END:VALIDATION_END].copy(),
        test=frame.iloc[VALIDATION_END:].copy(),
    )
    expected = (TRAIN_END, VALIDATION_END - TRAIN_END, TOTAL_ROWS - VALIDATION_END)
    observed = tuple(len(part) for part in (parts.train, parts.validation, parts.test))
    if observed != expected:
        raise ValueError(f"split sizes drifted: {observed}")
    instants = [
        set(part["instant"].astype(int).tolist())
        for part in (parts.train, parts.validation, parts.test)
    ]
    if any(instants[left] & instants[right] for left in range(3) for right in range(left + 1, 3)):
        raise ValueError("split partitions overlap")
    return parts


def engineer_cycle_features(frame: pd.DataFrame) -> pd.DataFrame:
    result = frame.copy()
    angle = 2.0 * math.pi * result["hr"].astype(float) / 24.0
    result["hour_sin"] = np.sin(angle)
    result["hour_cos"] = np.cos(angle)
    result["workingday_hour_sin"] = result["workingday"] * result["hour_sin"]
    result["workingday_hour_cos"] = result["workingday"] * result["hour_cos"]
    return result


def stage_specs() -> tuple[StageSpec, ...]:
    categorical = (
        "temp",
        "hum",
        "windspeed",
        "workingday",
        "holiday",
        "yr",
        "hr",
        "season",
        "weathersit",
        "weekday",
        "mnth",
    )
    enriched = (
        "temp",
        "hum",
        "windspeed",
        "workingday",
        "holiday",
        "yr",
        "season",
        "weathersit",
        "weekday",
        "mnth",
        "hour_sin",
        "hour_cos",
        "workingday_hour_sin",
        "workingday_hour_cos",
    )
    return (
        StageSpec("temperature-only", 0, ("temp",)),
        StageSpec("core-five", 1, CORE_FEATURES),
        StageSpec("calendar-categories", 2, categorical),
        StageSpec("calendar-weather-cycle", 3, enriched),
        StageSpec(
            "ridge-with-atemp",
            4,
            (*enriched, "atemp"),
            estimator="ridge",
            alpha=10.0,
            includes_atemp=True,
        ),
        StageSpec(
            "lasso-with-atemp",
            5,
            (*enriched, "atemp"),
            estimator="lasso",
            alpha=1.0,
            includes_atemp=True,
        ),
    )


def polynomial_degree_metrics(
    parts: PartitionedBikeData,
    degrees: Iterable[int] = (1, 2, 3, 5, 8),
) -> list[dict[str, float | int]]:
    """Compare polynomial temperature curves without using the test partition."""
    train_temperature = parts.train["temp"].to_numpy(float)
    validation_temperature = parts.validation["temp"].to_numpy(float)
    train_target = parts.train["cnt"].to_numpy(float)
    validation_target = parts.validation["cnt"].to_numpy(float)
    rows: list[dict[str, float | int]] = []
    for degree in degrees:
        coefficients = np.polyfit(train_temperature, train_target, int(degree))
        train_prediction = np.polyval(coefficients, train_temperature)
        validation_prediction = np.polyval(coefficients, validation_temperature)
        rows.append(
            {
                "degree": int(degree),
                "trainRmse": metric_set(train_target, train_prediction)["rmse"],
                "validationRmse": metric_set(validation_target, validation_prediction)["rmse"],
            }
        )
    return rows


def _pipeline_for(spec: StageSpec) -> Pipeline:
    categorical = [
        feature
        for feature in ("season", "weathersit", "weekday", "mnth")
        if feature in spec.features
    ]
    binary = [
        feature
        for feature in ("workingday", "holiday", "yr")
        if feature in spec.features
    ]
    continuous = [
        feature
        for feature in (
            "temp",
            "atemp",
            "hum",
            "windspeed",
            "hr",
            "hour_sin",
            "hour_cos",
            "workingday_hour_sin",
            "workingday_hour_cos",
        )
        if feature in spec.features
    ]
    transformers: list[tuple[str, Any, list[str]]] = []
    if continuous:
        transformers.append(("continuous", StandardScaler(), continuous))
    if binary:
        transformers.append(("binary", "passthrough", binary))
    if categorical:
        transformers.append(
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore", drop="first", sparse_output=False),
                categorical,
            )
        )
    preprocessor = ColumnTransformer(
        transformers,
        remainder="drop",
        verbose_feature_names_out=False,
    )
    if spec.estimator == "ridge":
        estimator = Ridge(alpha=float(spec.alpha))
    elif spec.estimator == "lasso":
        estimator = Lasso(alpha=float(spec.alpha), max_iter=50_000, tol=1e-8)
    else:
        estimator = LinearRegression()
    return Pipeline((("preprocess", preprocessor), ("model", estimator)))


def metric_set(actual: np.ndarray, prediction: np.ndarray) -> dict[str, float]:
    return {
        "mse": float(mean_squared_error(actual, prediction)),
        "rmse": float(mean_squared_error(actual, prediction) ** 0.5),
        "mae": float(mean_absolute_error(actual, prediction)),
        "r2": float(r2_score(actual, prediction)),
    }


def deterministic_sample(frame: pd.DataFrame, count: int) -> pd.DataFrame:
    """Return an ordered, repeatable sample that covers the full partition."""
    if count <= 0:
        raise ValueError("sample count must be positive")
    if frame.empty:
        raise ValueError("cannot sample an empty frame")
    positions = np.linspace(0, len(frame) - 1, min(count, len(frame)), dtype=int)
    return frame.iloc[np.unique(positions)].copy()


def univariate_sufficient_statistics(
    frame: pd.DataFrame,
    feature: str = "temp",
    target: str = "cnt",
) -> dict[str, float | int]:
    """Sufficient statistics for exact browser-side OLS and outlier updates."""
    x = frame[feature].to_numpy(float)
    y = frame[target].to_numpy(float)
    return {
        "n": int(len(frame)),
        "sumX": float(x.sum()),
        "sumY": float(y.sum()),
        "sumXX": float(x @ x),
        "sumXY": float(x @ y),
        "sumYY": float(y @ y),
    }


def gradient_descent_suite(
    train: pd.DataFrame,
    learning_rates: Iterable[float] = (0.01, 0.1, 0.5),
    max_updates: int = 1_500,
) -> list[dict[str, Any]]:
    """Create train-only traces with an explicit, data-derived terminal status."""
    suite: list[dict[str, Any]] = []
    for learning_rate in learning_rates:
        result = core_gradient_descent(
            train,
            learning_rate=float(learning_rate),
            max_updates=max_updates,
        )
        final = result["trace"][-1]
        if not math.isfinite(float(final["mse"])) or float(final["mse"]) > 1e12:
            status = "diverged"
        elif float(final["gradientNorm"]) <= float(result["gradientTolerance"]):
            status = "converged"
        else:
            status = "max-updates"
        suite.append({**result, "status": status})
    return suite


def binned_feature_profile(
    frame: pd.DataFrame,
    feature: str,
    bins: int = 12,
) -> list[dict[str, float]]:
    """Training-only marginal means for a compact, honest visual fallback."""
    values = frame[[feature, "cnt"]].dropna().sort_values(feature)
    groups = pd.qcut(values[feature], q=min(bins, values[feature].nunique()), duplicates="drop")
    profile = values.groupby(groups, observed=True).agg(x=(feature, "mean"), y=("cnt", "mean"))
    return [
        {"x": float(row.x), "y": float(row.y)}
        for row in profile.itertuples(index=False)
    ]


def fit_stages(parts: PartitionedBikeData) -> list[StageFit]:
    train = engineer_cycle_features(parts.train)
    validation = engineer_cycle_features(parts.validation)
    y_train = train["cnt"].to_numpy(float)
    y_validation = validation["cnt"].to_numpy(float)
    fits: list[StageFit] = []
    for spec in stage_specs():
        if set(spec.features) & set(LEAKAGE_COLUMNS):
            raise ValueError(f"stage {spec.id} contains target leakage")
        pipeline = _pipeline_for(spec)
        pipeline.fit(train.loc[:, list(spec.features)], y_train)
        train_prediction = pipeline.predict(train.loc[:, list(spec.features)])
        validation_prediction = pipeline.predict(validation.loc[:, list(spec.features)])
        fits.append(
            StageFit(
                spec=spec,
                pipeline=pipeline,
                train_metrics=metric_set(y_train, train_prediction),
                validation_metrics=metric_set(y_validation, validation_prediction),
                validation_prediction=np.asarray(validation_prediction, dtype=float),
            )
        )
    return fits


def select_stage(fits: Iterable[StageFit], tolerance: float = 0.01) -> StageFit:
    ordered = sorted(fits, key=lambda fit: fit.spec.order)
    best_rmse = min(fit.validation_metrics["rmse"] for fit in ordered)
    threshold = best_rmse * (1.0 + tolerance)
    return next(fit for fit in ordered if fit.validation_metrics["rmse"] <= threshold)


def refit_and_test(
    selected: StageFit,
    parts: PartitionedBikeData,
) -> tuple[Pipeline, dict[str, float], np.ndarray]:
    development = engineer_cycle_features(
        pd.concat((parts.train, parts.validation), ignore_index=True)
    )
    test = engineer_cycle_features(parts.test)
    pipeline = _pipeline_for(selected.spec)
    pipeline.fit(
        development.loc[:, list(selected.spec.features)],
        development["cnt"].to_numpy(float),
    )
    prediction = np.asarray(
        pipeline.predict(test.loc[:, list(selected.spec.features)]),
        dtype=float,
    )
    return pipeline, metric_set(test["cnt"].to_numpy(float), prediction), prediction


def core_gradient_descent(
    train: pd.DataFrame,
    learning_rate: float = 0.1,
    max_updates: int = 1_500,
    tolerance: float = 1e-8,
) -> dict[str, Any]:
    continuous = ("temp", "hum", "windspeed", "hr")
    scaler = StandardScaler()
    scaled = scaler.fit_transform(train.loc[:, list(continuous)])
    matrix = np.column_stack(
        (
            scaled[:, 0],
            scaled[:, 1],
            scaled[:, 2],
            train["workingday"].to_numpy(float),
            scaled[:, 3],
        )
    )
    target = train["cnt"].to_numpy(float)
    weights = np.zeros(matrix.shape[1], dtype=float)
    intercept = 0.0
    trace: list[dict[str, float | int]] = []
    for update in range(max_updates + 1):
        residual = matrix @ weights + intercept - target
        mse = float(np.mean(residual**2))
        grad_w = 2.0 * matrix.T @ residual / len(matrix)
        grad_b = float(2.0 * np.mean(residual))
        grad_norm = float(np.linalg.norm(np.append(grad_w, grad_b)))
        if update < 20 or update % 10 == 0 or grad_norm <= tolerance:
            trace.append(
                {
                    "update": update,
                    "mse": mse,
                    "gradientNorm": grad_norm,
                    "intercept": float(intercept),
                    **{
                        f"weight_{feature}": float(weights[index])
                        for index, feature in enumerate(CORE_FEATURES)
                    },
                }
            )
        if grad_norm <= tolerance:
            break
        weights -= learning_rate * grad_w
        intercept -= learning_rate * grad_b
    reference = LinearRegression().fit(matrix, target)
    return {
        "trace": trace,
        "updates": update,
        "learningRate": learning_rate,
        "gradientTolerance": tolerance,
        "weights": weights,
        "intercept": float(intercept),
        "scalerMean": scaler.mean_,
        "scalerScale": scaler.scale_,
        "maxParameterDeltaVsSklearn": float(
            max(
                np.max(np.abs(weights - reference.coef_)),
                abs(intercept - reference.intercept_),
            )
        ),
    }


def coefficient_rows(pipeline: Pipeline) -> list[dict[str, float | str]]:
    preprocessor: ColumnTransformer = pipeline.named_steps["preprocess"]
    model = pipeline.named_steps["model"]
    names = preprocessor.get_feature_names_out()
    values = np.asarray(model.coef_, dtype=float).reshape(-1)
    return [
        {"feature": str(name), "coefficient": float(value)}
        for name, value in zip(names, values, strict=True)
    ]


def coefficient_spaces(pipeline: Pipeline) -> dict[str, Any]:
    """Return model-space and raw-unit coefficients for an already fitted pipeline."""
    preprocessor: ColumnTransformer = pipeline.named_steps["preprocess"]
    model = pipeline.named_steps["model"]
    names = [str(name) for name in preprocessor.get_feature_names_out()]
    model_values = np.asarray(model.coef_, dtype=float).reshape(-1)
    raw_values = model_values.copy()
    raw_intercept = float(model.intercept_)
    continuous_transformer = preprocessor.named_transformers_.get("continuous")
    continuous_columns: list[str] = []
    for name, _transformer, columns in preprocessor.transformers_:
        if name == "continuous":
            continuous_columns = [str(column) for column in columns]
            break
    if isinstance(continuous_transformer, StandardScaler):
        for column, mean, scale in zip(
            continuous_columns,
            continuous_transformer.mean_,
            continuous_transformer.scale_,
            strict=True,
        ):
            index = names.index(column)
            raw_values[index] = model_values[index] / float(scale)
            raw_intercept -= model_values[index] * float(mean) / float(scale)
    return {
        "modelSpace": {
            "intercept": float(model.intercept_),
            "rows": [
                {"feature": name, "coefficient": float(value)}
                for name, value in zip(names, model_values, strict=True)
            ],
        },
        "rawContinuousUnits": {
            "intercept": raw_intercept,
            "rows": [
                {"feature": name, "coefficient": float(value)}
                for name, value in zip(names, raw_values, strict=True)
            ],
        },
    }


def residual_records(
    partition: pd.DataFrame,
    prediction: np.ndarray,
) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for row, predicted in zip(partition.itertuples(index=False), prediction, strict=True):
        actual = float(row.cnt)
        result.append(
            {
                "instant": int(row.instant),
                "timestamp": pd.Timestamp(row.timestamp).isoformat(),
                "hour": int(row.hr),
                "workingday": int(row.workingday),
                "actual": actual,
                "prediction": float(predicted),
                "residual": float(predicted - actual),
            }
        )
    return result


def named_failure_cases(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    frame = pd.DataFrame(records)
    chosen: list[tuple[str, pd.Series]] = []
    chosen.append(("negative-prediction", frame.sort_values(["prediction", "instant"]).iloc[0]))
    morning = frame.loc[frame["hour"].between(7, 9)].assign(
        underprediction=lambda value: value["actual"] - value["prediction"]
    )
    chosen.append(
        ("morning-peak-underprediction", morning.sort_values(["underprediction", "instant"], ascending=[False, True]).iloc[0])
    )
    evening = frame.loc[frame["hour"].between(16, 19)].assign(
        underprediction=lambda value: value["actual"] - value["prediction"]
    )
    chosen.append(
        ("evening-peak-underprediction", evening.sort_values(["underprediction", "instant"], ascending=[False, True]).iloc[0])
    )
    excluded = {int(row["instant"]) for _, row in chosen}
    remaining = frame.loc[~frame["instant"].isin(excluded)].assign(
        absolute_residual=lambda value: value["residual"].abs()
    )
    chosen.append(
        ("large-residual", remaining.sort_values(["absolute_residual", "instant"], ascending=[False, True]).iloc[0])
    )
    return [
        {
            "role": role,
            **{
                key: value.item() if hasattr(value, "item") else value
                for key, value in row.items()
                if key not in {"underprediction", "absolute_residual"}
            },
        }
        for role, row in chosen
    ]


def finite_tree(value: Any, path: str = "$") -> None:
    if isinstance(value, (float, np.floating)) and not math.isfinite(float(value)):
        raise ValueError(f"non-finite number at {path}")
    if isinstance(value, dict):
        for key, entry in value.items():
            finite_tree(entry, f"{path}.{key}")
    elif isinstance(value, (list, tuple)):
        for index, entry in enumerate(value):
            finite_tree(entry, f"{path}[{index}]")
