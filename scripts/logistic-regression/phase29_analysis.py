"""Deterministic numerical authority for the Phase 29 logistic regression lesson.

This module deliberately has no publication side effects.  It verifies the committed
Banknote snapshot before deriving the train/validation-only teaching outputs used by
the notebook builder.  The held-out test partition is only exposed to the separate
frozen handoff builder; none of the analysis selection helpers read it.
"""

from __future__ import annotations

from dataclasses import dataclass
import csv
import hashlib
import json
import math
from pathlib import Path
import warnings
from typing import Any, Iterable, Literal

import numpy as np
from sklearn.linear_model import LogisticRegression


ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = ROOT / "public/datasets/numerical-methods/banknote-authentication.csv"
DATASET_MANIFEST_PATH = ROOT / "public/datasets/numerical-methods/banknote-authentication-manifest.json"
FEATURES = ("variance", "skewness", "curtosis", "entropy")
SPLIT_COUNTS = {"train": 960, "validation": 206, "test": 206}
PARAMETER_ORDER = (*FEATURES, "intercept")
FINITE_DIFFERENCE_PARAMETERS = np.asarray([0.2, -0.1, 0.05, 0.15, -0.3], dtype=float)
FINITE_DIFFERENCE_STEPS = (1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8)
SCRATCH_CONFIG = {
    "initialization": "zeros",
    "objective": "mean stable logit-domain BCE (l2=0)",
    "initialStep": 32.0,
    "armijoC": 1e-4,
    "armijoRho": 0.5,
    "maxBacktracks": 30,
    "minimumStep": 1e-12,
    "maxIterations": 100000,
    "gradientNormTolerance": 1e-8,
    "relativeObjectiveTolerance": 1e-14,
    "parameterStepNormTolerance": 1e-10,
}
SKLEARN_CONFIG = {
    "C": math.inf,
    "l1_ratio": 0.0,
    "solver": "lbfgs",
    "fit_intercept": True,
    "tol": 1e-12,
    "max_iter": 5000,
}
PARITY_LIMITS = {
    "coefficientAndIntercept": 2e-4,
    "validationProbability": 1e-6,
}


class BanknoteSourceError(ValueError):
    """Raised when the checked-in source snapshot no longer matches its contract."""


@dataclass(frozen=True)
class BanknoteSource:
    contract_version: str
    source_sha256: str
    feature_order: tuple[str, str, str, str]
    rows: tuple[dict[str, Any], ...]
    means: np.ndarray
    scales: np.ndarray

    def rows_for(self, split: Literal["train", "validation", "test"]) -> tuple[dict[str, Any], ...]:
        return tuple(row for row in self.rows if row["split"] == split)

    def matrix(self, split: Literal["train", "validation", "test"]) -> tuple[np.ndarray, np.ndarray, tuple[int, ...]]:
        rows = self.rows_for(split)
        values = np.asarray([[row[feature] for feature in self.feature_order] for row in rows], dtype=float)
        matrix = (values - self.means) / self.scales
        labels = np.asarray([row["label"] for row in rows], dtype=float)
        return matrix, labels, tuple(int(row["row_id"]) for row in rows)


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _finite(value: Any, name: str) -> float:
    numeric = float(value)
    if not math.isfinite(numeric):
        raise BanknoteSourceError(f"{name} must be finite")
    return numeric


def _stable_sigmoid(logits: np.ndarray) -> np.ndarray:
    return np.where(logits >= 0, 1.0 / (1.0 + np.exp(-logits)), np.exp(logits) / (1.0 + np.exp(logits)))


def _softplus(logits: np.ndarray) -> np.ndarray:
    return np.maximum(logits, 0.0) + np.log1p(np.exp(-np.abs(logits)))


def _mean_bce_and_gradient(matrix: np.ndarray, labels: np.ndarray, parameters: np.ndarray, l2: float = 0.0) -> tuple[float, np.ndarray, np.ndarray]:
    if matrix.ndim != 2 or matrix.shape[1] != 4 or labels.shape != (matrix.shape[0],) or parameters.shape != (5,):
        raise ValueError("Expected a [n, 4] matrix, n labels, and five parameters.")
    if not np.isfinite(matrix).all() or not np.isfinite(labels).all() or not np.isfinite(parameters).all():
        raise ValueError("Logistic analysis accepts finite values only.")
    logits = matrix @ parameters[:4] + parameters[4]
    probabilities = _stable_sigmoid(logits)
    residual = probabilities - labels
    bce = float(np.mean(_softplus(logits) - labels * logits))
    gradient = np.empty(5, dtype=float)
    gradient[:4] = matrix.T @ residual / matrix.shape[0] + l2 * parameters[:4]
    gradient[4] = float(np.mean(residual))
    objective = bce + 0.5 * l2 * float(parameters[:4] @ parameters[:4])
    return objective, gradient, logits


def load_banknote_source(dataset_path: Path = DATASET_PATH, manifest_path: Path = DATASET_MANIFEST_PATH) -> BanknoteSource:
    """Load and reject any dataset/schema/split/preprocessing drift before fitting."""
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    expected_hash = manifest["normalizedDataset"]["sha256"]
    actual_hash = _sha256(dataset_path)
    if actual_hash != expected_hash:
        raise BanknoteSourceError("Banknote CSV sha256 differs from its committed manifest.")
    expected_schema = ["banknote_id", *FEATURES, "class", "split"]
    expected_rows = int(manifest["normalizedDataset"]["rowCount"])
    expected_features = tuple(manifest["preprocessing"]["features"])
    if expected_features != FEATURES:
        raise BanknoteSourceError("Banknote feature order drifted.")
    parsed: list[dict[str, Any]] = []
    with dataset_path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != expected_schema:
            raise BanknoteSourceError("Banknote CSV header drifted.")
        for index, row in enumerate(reader, start=1):
            try:
                row_id = int(row["banknote_id"] or "")
                label = int(row["class"] or "")
            except ValueError as error:
                raise BanknoteSourceError(f"Invalid row id or class at CSV row {index}.") from error
            if row_id != index or label not in (0, 1):
                raise BanknoteSourceError(f"Invalid ordered row id or class at CSV row {index}.")
            split = row["split"]
            if split not in SPLIT_COUNTS:
                raise BanknoteSourceError(f"Invalid split at CSV row {index}.")
            values = {feature: _finite(row[feature], f"{feature} row {index}") for feature in FEATURES}
            parsed.append({"row_id": row_id, **values, "label": label, "split": split})
    if len(parsed) != expected_rows:
        raise BanknoteSourceError("Banknote CSV row count drifted.")
    for split, count in SPLIT_COUNTS.items():
        if sum(row["split"] == split for row in parsed) != count:
            raise BanknoteSourceError(f"Banknote {split} split count drifted.")
    train = [row for row in parsed if row["split"] == "train"]
    raw_train = np.asarray([[row[feature] for feature in FEATURES] for row in train], dtype=float)
    means = raw_train.mean(axis=0)
    scales = raw_train.std(axis=0, ddof=0)
    expected_means = np.asarray([manifest["preprocessing"]["trainMeans"][feature] for feature in FEATURES], dtype=float)
    expected_scales = np.asarray([manifest["preprocessing"]["trainScales"][feature] for feature in FEATURES], dtype=float)
    if not np.allclose(means, expected_means, rtol=0, atol=1e-12) or not np.allclose(scales, expected_scales, rtol=0, atol=1e-12):
        raise BanknoteSourceError("Train-only ddof=0 preprocessing statistics drifted.")
    if not np.isfinite(scales).all() or np.any(scales <= 0):
        raise BanknoteSourceError("Banknote preprocessing scale is invalid.")
    return BanknoteSource(
        contract_version=str(manifest["contractVersion"]),
        source_sha256=actual_hash,
        feature_order=FEATURES,
        rows=tuple(parsed),
        means=means,
        scales=scales,
    )


def _as_serializable_vector(values: Iterable[float]) -> list[float]:
    result = [float(value) for value in values]
    if not all(math.isfinite(value) for value in result):
        raise ValueError("Analysis produced a non-finite result.")
    return result


def train_scratch_logistic(source: BanknoteSource) -> dict[str, Any]:
    """Run the fixed, full-batch unregularized Armijo authority from zero."""
    matrix, labels, _ = source.matrix("train")
    parameters = np.zeros(5, dtype=float)
    objective, gradient, _ = _mean_bce_and_gradient(matrix, labels, parameters)
    trace: list[dict[str, Any]] = [{
        "iteration": 0,
        "objective": objective,
        "gradientNorm": float(np.linalg.norm(gradient)),
        "parameterStepNorm": 0.0,
        "acceptedStep": 0.0,
        "backtracks": 0,
        "parameters": _as_serializable_vector(parameters),
    }]
    terminal = {"reason": "max-iterations", "iteration": SCRATCH_CONFIG["maxIterations"]}
    for iteration in range(1, int(SCRATCH_CONFIG["maxIterations"]) + 1):
        gradient_norm = float(np.linalg.norm(gradient))
        gradient_square = float(gradient @ gradient)
        accepted: tuple[np.ndarray, float, np.ndarray, float, int] | None = None
        for backtracks in range(int(SCRATCH_CONFIG["maxBacktracks"]) + 1):
            step = float(SCRATCH_CONFIG["initialStep"] * SCRATCH_CONFIG["armijoRho"] ** backtracks)
            if step < SCRATCH_CONFIG["minimumStep"]:
                break
            candidate = parameters - step * gradient
            candidate_objective, candidate_gradient, _ = _mean_bce_and_gradient(matrix, labels, candidate)
            if math.isfinite(candidate_objective) and candidate_objective <= objective - SCRATCH_CONFIG["armijoC"] * step * gradient_square:
                accepted = candidate, candidate_objective, candidate_gradient, step, backtracks
                break
        if accepted is None:
            terminal = {"reason": "line-search-failed", "iteration": iteration - 1}
            break
        candidate, candidate_objective, candidate_gradient, step, backtracks = accepted
        parameter_step_norm = float(np.linalg.norm(candidate - parameters))
        relative_change = abs(objective - candidate_objective) / max(1.0, abs(objective))
        parameters, objective, gradient = candidate, candidate_objective, candidate_gradient
        trace.append({
            "iteration": iteration,
            "objective": objective,
            "gradientNorm": float(np.linalg.norm(gradient)),
            "parameterStepNorm": parameter_step_norm,
            "acceptedStep": step,
            "backtracks": backtracks,
            "relativeObjectiveChange": relative_change,
            "parameters": _as_serializable_vector(parameters),
        })
        # The pairwise stopping alternative guards against rounding-level Armijo
        # updates.  Checking it after each accepted state retains an exact record
        # of the state used for parity instead of emitting a pre-update snapshot.
        if float(np.linalg.norm(gradient)) <= SCRATCH_CONFIG["gradientNormTolerance"] and parameter_step_norm <= SCRATCH_CONFIG["parameterStepNormTolerance"]:
            terminal = {"reason": "gradient-norm", "iteration": iteration}
            break
        if relative_change <= SCRATCH_CONFIG["relativeObjectiveTolerance"] and parameter_step_norm <= SCRATCH_CONFIG["parameterStepNormTolerance"]:
            terminal = {"reason": "loss-and-step", "iteration": iteration}
            break
    validation_matrix, validation_labels, _ = source.matrix("validation")
    validation_objective, _, validation_logits = _mean_bce_and_gradient(validation_matrix, validation_labels, parameters)
    return {
        "featureOrder": list(source.feature_order),
        "interceptConvention": "explicit final parameter",
        "config": dict(SCRATCH_CONFIG),
        "parameters": _as_serializable_vector(parameters),
        "terminal": terminal,
        "trace": trace,
        "validation": {
            "meanBce": validation_objective,
            "logits": _as_serializable_vector(validation_logits),
            "probabilities": _as_serializable_vector(_stable_sigmoid(validation_logits)),
        },
    }


def compare_unregularized_sklearn(source: BanknoteSource, scratch: dict[str, Any] | None = None) -> dict[str, Any]:
    """Fit the declared sklearn 1.9 comparison and fail closed on parity drift."""
    scratch = scratch or train_scratch_logistic(source)
    matrix, labels, _ = source.matrix("train")
    with warnings.catch_warnings(record=True) as captured:
        warnings.simplefilter("always")
        model = LogisticRegression(**SKLEARN_CONFIG).fit(matrix, labels)
    warning_rows = [{"category": warning.category.__name__, "message": str(warning.message)} for warning in captured]
    if captured:
        detail = "; ".join(f"{warning.category.__name__}: {warning.message}" for warning in captured)
        raise RuntimeError(f"scikit-learn emitted a warning under the fixed Phase 29 contract: {detail}")
    validation_matrix, _, _ = source.matrix("validation")
    sklearn_parameters = np.concatenate((model.coef_[0], model.intercept_))
    sklearn_objective, _, _ = _mean_bce_and_gradient(matrix, labels, sklearn_parameters)
    scratch_parameters = np.asarray(scratch["parameters"], dtype=float)
    coefficient_delta = float(np.max(np.abs(sklearn_parameters - scratch_parameters)))
    probability_delta = float(np.max(np.abs(model.predict_proba(validation_matrix)[:, 1] - np.asarray(scratch["validation"]["probabilities"], dtype=float))))
    acceptance = {
        "coefficientAndInterceptLimit": PARITY_LIMITS["coefficientAndIntercept"],
        "validationProbabilityLimit": PARITY_LIMITS["validationProbability"],
        "passed": coefficient_delta <= PARITY_LIMITS["coefficientAndIntercept"] and probability_delta <= PARITY_LIMITS["validationProbability"],
    }
    if not acceptance["passed"]:
        raise RuntimeError(f"Fixed Phase 29 parity contract failed: coefficient={coefficient_delta}, probability={probability_delta}")
    return {
        "config": {**SKLEARN_CONFIG, "C": "infinity"},
        "nIter": int(model.n_iter_[0]),
        "warningsPolicy": "fail-on-every-captured-warning",
        "warnings": warning_rows,
        "parameters": _as_serializable_vector(sklearn_parameters),
        "objectiveValue": sklearn_objective,
        "validationProbabilities": _as_serializable_vector(model.predict_proba(validation_matrix)[:, 1]),
        "observed": {
            "maxCoefficientAndInterceptDelta": coefficient_delta,
            "maxValidationProbabilityDelta": probability_delta,
        },
        "acceptance": acceptance,
    }


def finite_difference_sweep(source: BanknoteSource) -> dict[str, Any]:
    matrix, labels, _ = source.matrix("train")
    analytic_objective, analytic, _ = _mean_bce_and_gradient(matrix, labels, FINITE_DIFFERENCE_PARAMETERS)
    rows: list[dict[str, Any]] = []
    for step in FINITE_DIFFERENCE_STEPS:
        numeric = np.empty(5, dtype=float)
        for index in range(5):
            plus = FINITE_DIFFERENCE_PARAMETERS.copy()
            minus = FINITE_DIFFERENCE_PARAMETERS.copy()
            plus[index] += step
            minus[index] -= step
            plus_objective, _, _ = _mean_bce_and_gradient(matrix, labels, plus)
            minus_objective, _, _ = _mean_bce_and_gradient(matrix, labels, minus)
            numeric[index] = (plus_objective - minus_objective) / (2.0 * step)
        errors = np.abs(numeric - analytic)
        rows.append({
            "h": step,
            "analyticGradient": _as_serializable_vector(analytic),
            "centeredGradient": _as_serializable_vector(numeric),
            "componentErrors": _as_serializable_vector(errors),
            "maxComponentError": float(np.max(errors)),
        })
    selected = next(row for row in rows if row["h"] == 1e-6)
    if selected["maxComponentError"] > 2e-9:
        raise RuntimeError("The fixed h=1e-6 Phase 29 finite-difference acceptance check failed.")
    return {
        "batch": {"split": "train", "rows": int(matrix.shape[0]), "standardized": True, "ddof": 0},
        "parameters": _as_serializable_vector(FINITE_DIFFERENCE_PARAMETERS),
        "objective": analytic_objective,
        "parameterOrder": list(PARAMETER_ORDER),
        "steps": rows,
        "renderingOnlyRounding": True,
        "claimsMonotonicError": False,
        "acceptance": {"h": 1e-6, "maxComponentErrorLimit": 2e-9, "observed": selected["maxComponentError"], "passed": True},
    }


def _calibration_bins(probabilities: np.ndarray, labels: np.ndarray) -> tuple[list[dict[str, Any]], float]:
    bins: list[dict[str, Any]] = []
    total = probabilities.size
    ece = 0.0
    for index in range(10):
        lower = index / 10.0
        upper = (index + 1) / 10.0
        mask = (probabilities >= lower) & (probabilities <= upper if index == 9 else probabilities < upper)
        count = int(np.sum(mask))
        if count == 0:
            bins.append({"lower": lower, "upper": upper, "count": 0, "meanProbability": None, "observedRate": None})
            continue
        average_probability = float(np.mean(probabilities[mask]))
        observed_rate = float(np.mean(labels[mask]))
        ece += count / total * abs(average_probability - observed_rate)
        bins.append({"lower": lower, "upper": upper, "count": count, "meanProbability": average_probability, "observedRate": observed_rate})
    return bins, float(ece)


def build_temperature_calibration(source: BanknoteSource, scratch: dict[str, Any] | None = None) -> dict[str, Any]:
    scratch = scratch or train_scratch_logistic(source)
    _, labels, _ = source.matrix("validation")
    logits = np.asarray(scratch["validation"]["logits"], dtype=float)
    modes = (("sharpened", 0.65), ("original", 1.0), ("softened", 1.75))
    original = _stable_sigmoid(logits)
    original_order = np.argsort(logits, kind="stable")
    summaries: list[dict[str, Any]] = []
    for mode, temperature in modes:
        probabilities = _stable_sigmoid(logits / temperature)
        bins, ece = _calibration_bins(probabilities, labels)
        summaries.append({
            "id": mode,
            "temperature": temperature,
            "probabilities": _as_serializable_vector(probabilities),
            "bins": bins,
            "expectedCalibrationError": ece,
            "fixedThresholdAccuracy": float(np.mean((probabilities >= 0.5) == labels)),
        })
        if not np.array_equal(np.argsort(logits / temperature, kind="stable"), original_order):
            raise RuntimeError("Positive calibration temperature changed validation ranking.")
        if not np.array_equal(probabilities >= 0.5, original >= 0.5):
            raise RuntimeError("Positive calibration temperature changed a fixed 0.5 label.")
    if len({summary["expectedCalibrationError"] for summary in summaries}) <= 1:
        raise RuntimeError("Controlled temperatures did not create a calibration teaching contrast.")
    return {
        "sourceSplit": "validation",
        "logits": _as_serializable_vector(logits),
        "modeRule": "positive logit temperatures 0.65, 1.0, and 1.75",
        "orderingPreserved": True,
        "defaultLabelsInvariant": True,
        "binRule": "ten equal-width bins; lower-inclusive/upper-exclusive except final upper-inclusive; retain empty bins with null rates",
        "modes": summaries,
    }


def select_teaching_rows(source: BanknoteSource, scratch: dict[str, Any] | None = None) -> dict[str, dict[str, Any]]:
    scratch = scratch or train_scratch_logistic(source)
    parameters = np.asarray(scratch["parameters"], dtype=float)
    rows = [row for row in source.rows if row["split"] in {"train", "validation"}]
    scored = []
    for row in rows:
        standardized = (np.asarray([row[feature] for feature in FEATURES]) - source.means) / source.scales
        logit = float(standardized @ parameters[:4] + parameters[4])
        probability = float(_stable_sigmoid(np.asarray([logit]))[0])
        bce = float(_softplus(np.asarray([logit]))[0] - row["label"] * logit)
        scored.append({**row, "standardized": _as_serializable_vector(standardized), "logit": logit, "probability": probability, "bce": bce})
    canonical = next(item for item in scored if item["row_id"] == 1)
    near_boundary = min(scored, key=lambda item: (abs(item["logit"]), item["row_id"]))
    correct_confident = max((item for item in scored if (item["probability"] >= 0.5) == bool(item["label"])), key=lambda item: (abs(item["logit"]), -item["row_id"]))
    high_loss = max(scored, key=lambda item: (item["bce"], -item["row_id"]))
    return {
        "canonical": {"name": "canonical-row", **canonical},
        "nearBoundary": {"name": "near-boundary", **near_boundary},
        "correctConfident": {"name": "correct-and-confident", **correct_confident},
        "highLoss": {"name": "high-loss", **high_loss},
    }


def build_one_row_trace(row: dict[str, Any], parameters: Iterable[float]) -> dict[str, Any]:
    values = np.asarray(list(parameters), dtype=float)
    if values.shape != (5,):
        raise ValueError("One-row trace needs five parameters.")
    features = np.asarray(row["standardized"], dtype=float)
    logit = float(features @ values[:4] + values[4])
    probability = float(_stable_sigmoid(np.asarray([logit]))[0])
    residual = probability - int(row["label"])
    return {
        "rowId": int(row["row_id"]), "split": row["split"], "label": int(row["label"]),
        "standardizedFeatures": _as_serializable_vector(features),
        "contributions": _as_serializable_vector(features * values[:4]), "intercept": float(values[4]),
        "logit": logit, "probability": probability, "bce": float(_softplus(np.asarray([logit]))[0] - int(row["label"]) * logit),
        "gradient": _as_serializable_vector(np.concatenate((features * residual, [residual]))),
    }


def build_batch_trace(source: BanknoteSource, parameters: Iterable[float], split: Literal["train", "validation"] = "train") -> dict[str, Any]:
    matrix, labels, row_ids = source.matrix(split)
    values = np.asarray(list(parameters), dtype=float)
    objective, gradient, logits = _mean_bce_and_gradient(matrix, labels, values)
    return {"split": split, "rowIds": list(row_ids), "meanBce": objective, "gradient": _as_serializable_vector(gradient), "logits": _as_serializable_vector(logits)}


def compare_l2_objective(source: BanknoteSource, scratch: dict[str, Any] | None = None, l2: float = 0.05) -> dict[str, Any]:
    """Expose a deliberately different, intercept-excluding L2 objective for teaching."""
    if not math.isfinite(l2) or l2 <= 0:
        raise ValueError("L2 teaching strength must be positive and finite.")
    matrix, labels, _ = source.matrix("train")
    parameters = np.asarray((scratch or train_scratch_logistic(source))["parameters"], dtype=float).copy()
    objective, gradient, _ = _mean_bce_and_gradient(matrix, labels, parameters, l2=l2)
    for _ in range(5000):
        next_parameters = parameters - 0.5 * gradient
        next_objective, next_gradient, _ = _mean_bce_and_gradient(matrix, labels, next_parameters, l2=l2)
        if next_objective > objective:
            break
        if float(np.linalg.norm(next_gradient)) <= 1e-8:
            parameters, objective, gradient = next_parameters, next_objective, next_gradient
            break
        parameters, objective, gradient = next_parameters, next_objective, next_gradient
    return {"objective": "mean BCE + 0.5*l2*sum(coefficients^2)", "l2": l2, "interceptPenalized": False, "parameters": _as_serializable_vector(parameters), "objectiveValue": objective}


def build_xor_diagnostic() -> dict[str, Any]:
    return {"kind": "synthetic-xor", "usedForBanknoteFit": False, "points": [{"x": 0.0, "y": 0.0, "label": 0}, {"x": 0.0, "y": 1.0, "label": 1}, {"x": 1.0, "y": 0.0, "label": 1}, {"x": 1.0, "y": 1.0, "label": 0}]}


def build_circle_diagnostic() -> dict[str, Any]:
    points = []
    for index in range(80):
        angle = 2 * math.pi * index / 80
        radius = 0.55 if index % 2 == 0 else 1.05
        points.append({"x": radius * math.cos(angle), "y": radius * math.sin(angle), "label": 0 if radius < 1 else 1})
    return {"kind": "synthetic-concentric-circles", "usedForBanknoteFit": False, "points": points}
