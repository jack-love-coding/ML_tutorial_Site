"""Deterministic Phase 30 classification decision analysis.

This module uses only the Python standard library so the numeric authority can be
replayed in CI before optional Notebook tooling is installed.
"""

from __future__ import annotations

import csv
import hashlib
import json
import math
from pathlib import Path
from typing import Any, Iterable


CONTRACT_VERSION = "classification-phase-30-v1"
FP_COST = 1.0
FN_COST = 5.0
THRESHOLDS = [round(index / 100, 2) for index in range(1, 100)]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def localized(zh_cn: str, en: str) -> dict[str, str]:
    return {"zh-CN": zh_cn, "en": en}


def load_inputs(root: Path) -> tuple[list[dict[str, Any]], dict[int, dict[str, float]], dict[str, Any]]:
    handoff_path = root / "public/logistic-regression/phase-29/frozen-predictions.json"
    phase29_manifest_path = root / "public/logistic-regression/phase-29/manifest.json"
    dataset_path = root / "public/datasets/numerical-methods/banknote-authentication.csv"
    dataset_manifest_path = root / "public/datasets/numerical-methods/banknote-authentication-manifest.json"

    phase29_manifest = json.loads(phase29_manifest_path.read_text(encoding="utf-8"))
    dataset_manifest = json.loads(dataset_manifest_path.read_text(encoding="utf-8"))
    expected_handoff_hash = phase29_manifest["predictionHandoff"]["sha256"]["json"]
    expected_dataset_hash = dataset_manifest["normalizedDataset"]["sha256"]
    if sha256(handoff_path) != expected_handoff_hash:
        raise RuntimeError("Phase 29 prediction handoff hash drifted.")
    if sha256(dataset_path) != expected_dataset_hash:
        raise RuntimeError("Banknote dataset hash drifted.")

    raw_rows = json.loads(handoff_path.read_text(encoding="utf-8"))
    rows: list[dict[str, Any]] = []
    for row in raw_rows:
        row_id = int(row["row_id"])
        split = str(row["split"])
        label = int(row["label"])
        logit = float(row["logit"])
        probability = float(row["probability"])
        if split not in {"train", "validation", "test"} or label not in {0, 1}:
            raise RuntimeError(f"Invalid frozen prediction row {row_id}.")
        if not all(math.isfinite(value) for value in (logit, probability)) or not 0 <= probability <= 1:
            raise RuntimeError(f"Non-finite frozen prediction row {row_id}.")
        rows.append({"rowId": row_id, "split": split, "label": label, "logit": logit, "probability": probability})

    features: dict[int, dict[str, float]] = {}
    with dataset_path.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            row_id = int(row["banknote_id"])
            features[row_id] = {
                "variance": float(row["variance"]),
                "skewness": float(row["skewness"]),
                "curtosis": float(row["curtosis"]),
                "entropy": float(row["entropy"]),
            }

    if len(rows) != len(features) or {row["rowId"] for row in rows} != set(features):
        raise RuntimeError("Prediction handoff and dataset row identities disagree.")
    return rows, features, {
        "datasetPath": "/datasets/numerical-methods/banknote-authentication.csv",
        "datasetSha256": expected_dataset_hash,
        "handoffPath": "/logistic-regression/phase-29/frozen-predictions.json",
        "handoffSha256": expected_handoff_hash,
        "handoffContractVersion": str(phase29_manifest["contractVersion"]),
    }


def decisions(rows: Iterable[dict[str, Any]], threshold: float) -> list[dict[str, Any]]:
    result = []
    for row in rows:
        predicted = int(row["probability"] >= threshold)
        if row["label"] == 1:
            outcome = "tp" if predicted == 1 else "fn"
        else:
            outcome = "fp" if predicted == 1 else "tn"
        result.append({**row, "threshold": threshold, "predicted": predicted, "outcome": outcome})
    return result


def safe_divide(numerator: float, denominator: float) -> float:
    return 0.0 if denominator == 0 else numerator / denominator


def confusion(rows: Iterable[dict[str, Any]]) -> dict[str, int]:
    matrix = {"tp": 0, "fp": 0, "tn": 0, "fn": 0}
    for row in rows:
        matrix[row["outcome"]] += 1
    return matrix


def metrics(matrix: dict[str, int]) -> dict[str, float]:
    total = sum(matrix.values())
    precision = safe_divide(matrix["tp"], matrix["tp"] + matrix["fp"])
    recall = safe_divide(matrix["tp"], matrix["tp"] + matrix["fn"])
    specificity = safe_divide(matrix["tn"], matrix["tn"] + matrix["fp"])
    return {
        "accuracy": safe_divide(matrix["tp"] + matrix["tn"], total),
        "precision": precision,
        "recall": recall,
        "specificity": specificity,
        "f1": safe_divide(2 * precision * recall, precision + recall),
        "fpr": safe_divide(matrix["fp"], matrix["fp"] + matrix["tn"]),
        "tpr": recall,
        "predictedPositiveRate": safe_divide(matrix["tp"] + matrix["fp"], total),
        "actualPositiveRate": safe_divide(matrix["tp"] + matrix["fn"], total),
    }


def evaluate(rows: list[dict[str, Any]], threshold: float) -> dict[str, Any]:
    matrix = confusion(decisions(rows, threshold))
    total_cost = matrix["fp"] * FP_COST + matrix["fn"] * FN_COST
    return {
        "threshold": threshold,
        "confusion": matrix,
        "metrics": metrics(matrix),
        "totalCost": total_cost,
        "costPerExample": safe_divide(total_cost, sum(matrix.values())),
    }


def select_threshold(points: list[dict[str, Any]]) -> dict[str, Any]:
    return min(points, key=lambda point: (point["totalCost"], abs(point["threshold"] - 0.5), point["threshold"]))


def roc(rows: list[dict[str, Any]]) -> dict[str, Any]:
    thresholds = [1.001, *sorted({row["probability"] for row in rows}, reverse=True), -0.001]
    points = []
    for threshold in thresholds:
        matrix = confusion(decisions(rows, max(0.0, min(1.0, threshold))))
        points.append({
            "threshold": threshold,
            "fpr": safe_divide(matrix["fp"], matrix["fp"] + matrix["tn"]),
            "tpr": safe_divide(matrix["tp"], matrix["tp"] + matrix["fn"]),
        })
    auc = sum(
        (current["fpr"] - previous["fpr"]) * (current["tpr"] + previous["tpr"]) * 0.5
        for previous, current in zip(points, points[1:])
    )
    return {
        "split": "validation",
        "auc": auc,
        "interpretation": localized(
            "AUC 汇总同一批 validation 分数的排序能力，不负责选择业务阈值。",
            "AUC summarizes ranking on the same validation scores; it does not choose an operating threshold.",
        ),
        "thresholdSelectionAllowed": False,
        "points": points,
    }


def subgroup_output(validation: list[dict[str, Any]], features: dict[int, dict[str, float]], threshold: float) -> dict[str, Any]:
    definitions = [
        (
            "variance-negative",
            localized("variance < 0", "variance < 0"),
            localized("纸币图像小波 variance 特征为负", "Banknote wavelet variance feature is negative"),
            lambda feature: feature["variance"] < 0,
        ),
        (
            "variance-nonnegative",
            localized("variance ≥ 0", "variance ≥ 0"),
            localized("纸币图像小波 variance 特征非负", "Banknote wavelet variance feature is non-negative"),
            lambda feature: feature["variance"] >= 0,
        ),
        (
            "entropy-negative",
            localized("entropy < 0", "entropy < 0"),
            localized("纸币图像 entropy 特征为负", "Banknote image entropy feature is negative"),
            lambda feature: feature["entropy"] < 0,
        ),
        (
            "entropy-nonnegative",
            localized("entropy ≥ 0", "entropy ≥ 0"),
            localized("纸币图像 entropy 特征非负", "Banknote image entropy feature is non-negative"),
            lambda feature: feature["entropy"] >= 0,
        ),
    ]
    groups = []
    for group_id, label, definition, predicate in definitions:
        group_rows = [row for row in validation if predicate(features[row["rowId"]])]
        evaluated = decisions(group_rows, threshold)
        matrix = confusion(evaluated)
        groups.append({
            "id": group_id,
            "label": label,
            "definition": definition,
            "count": len(group_rows),
            "positives": sum(row["label"] for row in group_rows),
            "confusion": matrix,
            "metrics": metrics(matrix),
        })

    errors = [row for row in decisions(validation, threshold) if row["outcome"] in {"fp", "fn"}]
    errors.sort(key=lambda row: (abs(row["probability"] - threshold), row["rowId"]))
    named_errors = [
        {
            **row,
            "features": features[row["rowId"]],
            "distanceFromThreshold": abs(row["probability"] - threshold),
        }
        for row in errors
    ]
    return {
        "split": "validation",
        "threshold": threshold,
        "protectedAttributeAnalysis": False,
        "limitation": localized(
            "这些只是按输入特征切分的教学诊断，不是人口属性，也不能替代公平性审计。",
            "These are pedagogical input-feature slices, not demographic attributes, and they do not replace a fairness audit.",
        ),
        "groups": groups,
        "namedErrors": named_errors,
    }


def build_outputs(root: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    rows, features, source = load_inputs(root)
    validation = [row for row in rows if row["split"] == "validation"]
    test = [row for row in rows if row["split"] == "test"]
    sweep_points = [evaluate(validation, threshold) for threshold in THRESHOLDS]
    selected = select_threshold(sweep_points)

    folds = []
    for fold in range(5):
        fold_rows = [row for row in validation if row["rowId"] % 5 == fold]
        fold_selected = select_threshold([evaluate(fold_rows, threshold) for threshold in THRESHOLDS])
        folds.append({
            "fold": fold,
            "rowCount": len(fold_rows),
            "selectedThreshold": fold_selected["threshold"],
            "minimumCost": fold_selected["totalCost"],
        })
    fold_thresholds = [fold["selectedThreshold"] for fold in folds]

    outputs = {
        "predictions": validation,
        "thresholdSweep": {
            "split": "validation",
            "falsePositiveCost": FP_COST,
            "falseNegativeCost": FN_COST,
            "thresholds": THRESHOLDS,
            "points": sweep_points,
        },
        "roc": roc(validation),
        "costSelection": {
            "selectionSplit": "validation",
            "finalEvaluationSplit": "test",
            "falsePositiveCost": FP_COST,
            "falseNegativeCost": FN_COST,
            "tieBreak": "closest-to-0.5-then-lower",
            "selectedThreshold": selected["threshold"],
            "foldRule": "row-id-modulo-5",
            "folds": folds,
            "variation": {"minimum": min(fold_thresholds), "maximum": max(fold_thresholds)},
            "validation": selected,
            "lockedTest": evaluate(test, selected["threshold"]),
            "testEvaluations": 1,
            "reselectionAllowed": False,
            "interpretation": localized(
                "阈值只由 validation 成本决定。折间阈值波动很大，说明策略不稳定；锁定后仍只在 test 上报告一次，不回头重选。",
                "Validation cost alone selects the threshold. Wide fold variation signals instability; after freezing, test is reported once without reselection.",
            ),
        },
        "subgroupErrors": subgroup_output(validation, features, selected["threshold"]),
    }
    return outputs, source
