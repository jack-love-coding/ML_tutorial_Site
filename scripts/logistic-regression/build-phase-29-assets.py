#!/usr/bin/env python3
"""Build the atomic, executed Phase 29 Banknote asset package.

The builder is intentionally the only writer for ``public/logistic-regression/
phase-29``.  It stages a complete tree, validates it, and swaps that tree only
after all generated numeric, notebook, figure, and integrity contracts agree.
"""

from __future__ import annotations

import argparse
import copy
import csv
import hashlib
import json
import math
import os
import platform
import shutil
import stat
import sys
import tempfile
from pathlib import Path
from typing import Any, Iterable

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import nbformat
from nbclient import NotebookClient
from jupyter_client.kernelspec import KernelSpecManager
from nbformat.v4 import new_code_cell, new_markdown_cell, new_notebook
import numpy as np
import pandas as pd
import sklearn

plt.rcParams["font.sans-serif"] = ["Hiragino Sans GB", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False

from phase29_analysis import (
    FEATURES,
    FINITE_DIFFERENCE_STEPS,
    PARITY_LIMITS,
    SCRATCH_CONFIG,
    SKLEARN_CONFIG,
    build_batch_trace,
    build_circle_diagnostic,
    build_one_row_trace,
    build_temperature_calibration,
    build_xor_diagnostic,
    compare_l2_objective,
    compare_unregularized_sklearn,
    finite_difference_sweep,
    load_banknote_source,
    select_teaching_rows,
    train_scratch_logistic,
)


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = ROOT / "public/logistic-regression/phase-29"
PUBLIC_PREFIX = "/logistic-regression/phase-29"
CONTRACT_VERSION = "logistic-regression-phase-29-v1"
LOCALES = ("zh-CN", "en")
SCENES = (
    "linear-score",
    "sigmoid-probability",
    "threshold-decisions",
    "log-loss",
    "regularization",
    "linear-limits",
)
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def strict_jsonable(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): strict_jsonable(entry) for key, entry in value.items()}
    if isinstance(value, (list, tuple)):
        return [strict_jsonable(entry) for entry in value]
    if isinstance(value, np.ndarray):
        return strict_jsonable(value.tolist())
    if isinstance(value, (np.floating, np.integer)):
        return strict_jsonable(value.item())
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError("Published Phase 29 JSON cannot contain NaN or Infinity.")
        return value
    return value


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(strict_jsonable(value), ensure_ascii=False, sort_keys=True, indent=2, allow_nan=False) + "\n", encoding="utf-8")


def tree_hashes(root: Path) -> dict[str, str]:
    return {path.relative_to(root).as_posix(): sha256(path) for path in sorted(root.rglob("*")) if path.is_file()}


def _asset_path(relative_path: str) -> str:
    return f"{PUBLIC_PREFIX}/{relative_path}"


def sampled_replay_trace(trace: list[dict[str, Any]], maximum_states: int = 800) -> tuple[list[dict[str, Any]], dict[str, int]]:
    """Bound browser payloads without changing the recorded scratch terminal state."""
    if maximum_states < 2:
        raise ValueError("Replay trace capacity must retain the first and final state.")
    if len(trace) <= maximum_states:
        return trace, {"acceptedStates": len(trace), "publishedStates": len(trace)}
    stride = math.ceil((len(trace) - 1) / (maximum_states - 1))
    selected = [state for index, state in enumerate(trace) if index % stride == 0 or index == len(trace) - 1]
    return selected, {"acceptedStates": len(trace), "publishedStates": len(selected)}


def _controls(scene: str) -> list[dict[str, Any]]:
    labels = {
        "linear-score": ("比较样本", "Comparison row", ["canonical", "nearBoundary", "correctConfident", "highLoss"]),
        "sigmoid-probability": ("分数", "Logit", None),
        "threshold-decisions": ("累积行数", "Rows accumulated", None),
        "log-loss": ("差分步长", "Finite-difference step", list(FINITE_DIFFERENCE_STEPS)),
        "regularization": ("对照目标", "Objective comparison", ["scratch", "sklearn", "l2"]),
        "linear-limits": ("概率模式", "Probability mode", ["sharpened", "original", "softened"]),
    }
    zh, en, values = labels[scene]
    control: dict[str, Any] = {"id": f"{scene}-control", "label": {"zh-CN": zh, "en": en}}
    if values is not None:
        control["options"] = [{"value": value, "label": {"zh-CN": str(value), "en": str(value)}} for value in values]
    else:
        control.update({"minimum": -20, "maximum": 20, "step": 0.1})
    return [control]


def _interaction_payloads(analysis: dict[str, Any]) -> dict[str, dict[str, Any]]:
    rows = analysis["rows"]
    canonical_trace = build_one_row_trace(rows["canonical"], analysis["scratch"]["parameters"])
    teaching_rows = {key: {**row, "trace": build_one_row_trace(row, analysis["scratch"]["parameters"])} for key, row in rows.items()}
    batch_trace = build_batch_trace(analysis["source"], analysis["scratch"]["parameters"], "train")
    replay_trace, trace_sampling = sampled_replay_trace(analysis["scratch"]["trace"])
    probability_terms = {
        "logit": canonical_trace["logit"],
        "probability": canonical_trace["probability"],
        "odds": math.exp(canonical_trace["logit"]) if canonical_trace["logit"] < math.log(sys.float_info.max) else None,
        "logOdds": canonical_trace["logit"],
    }
    likelihood_rows = []
    for row in (rows["canonical"], rows["nearBoundary"], rows["correctConfident"], rows["highLoss"]):
        trace = build_one_row_trace(row, analysis["scratch"]["parameters"])
        probability_term = trace["probability"] if trace["label"] == 1 else 1 - trace["probability"]
        likelihood_rows.append({"rowId": trace["rowId"], "split": trace["split"], "label": trace["label"], "probabilityTerm": probability_term, "logTerm": math.log(probability_term)})
    product = math.prod(item["probabilityTerm"] for item in likelihood_rows)
    source_cells = {
        "linear-score": "phase29-linear-score",
        "sigmoid-probability": "phase29-sigmoid-probability",
        "threshold-decisions": "phase29-threshold-decisions",
        "log-loss": "phase29-log-loss",
        "regularization": "phase29-regularization",
        "linear-limits": "phase29-linear-limits",
    }
    data = {
        "linear-score": {"teachingRows": teaching_rows, "oneRow": canonical_trace},
        "sigmoid-probability": {"oneRow": canonical_trace, "terms": probability_terms, "extremeScores": [-20.0, -8.0, 0.0, 8.0, 20.0]},
        "threshold-decisions": {"likelihoodRows": likelihood_rows, "probabilityProduct": product, "logLikelihood": sum(item["logTerm"] for item in likelihood_rows)},
        "log-loss": {"oneRow": canonical_trace, "confidentMistake": teaching_rows["highLoss"]["trace"], "batch": {"meanBce": batch_trace["meanBce"], "gradient": batch_trace["gradient"]}, "finiteDifference": analysis["finiteDifference"]},
        "regularization": {"scratch": {"parameters": analysis["scratch"]["parameters"], "terminal": analysis["scratch"]["terminal"], "trace": replay_trace, "traceSampling": trace_sampling, "validation": analysis["scratch"]["validation"]}, "sklearn": analysis["parity"], "l2": analysis["l2"]},
        "linear-limits": {"calibration": analysis["calibration"], "xor": analysis["xor"], "circles": analysis["circles"]},
    }
    return {
        scene: {
            "contractVersion": CONTRACT_VERSION,
            "id": scene,
            "chapterId": scene,
            "sceneId": scene,
            "controls": _controls(scene),
            "sourceCellId": source_cells[scene],
            "data": data[scene],
        }
        for scene in SCENES
    }


def _save_figure(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    plt.tight_layout()
    plt.savefig(path, dpi=144, bbox_inches="tight", metadata={"Software": "ML Atlas Phase 29"})
    plt.close()


def write_figures(root: Path, analysis: dict[str, Any]) -> dict[str, str]:
    figures = root / "figures"
    figures.mkdir(parents=True, exist_ok=True)
    source = analysis["source"]
    train, train_y, _ = source.matrix("train")
    validation, validation_y, _ = source.matrix("validation")
    paths: dict[str, str] = {}
    plt.figure(figsize=(6.8, 4.5)); plt.scatter(train[:, 0], train[:, 1], c=train_y, s=11, alpha=.7, cmap="coolwarm"); plt.xlabel("variance (standardized)"); plt.ylabel("skewness (standardized)"); plt.title("Banknote training projection / 训练投影")
    paths["banknote-projection.png"] = "figures/banknote-projection.png"; _save_figure(figures / "banknote-projection.png")
    trace = analysis["scratch"]["trace"]
    plt.figure(figsize=(6.8, 4.5)); plt.semilogy([item["iteration"] for item in trace], [item["objective"] for item in trace], color="#2563eb"); plt.xlabel("accepted iteration"); plt.ylabel("mean BCE"); plt.title("Scratch training trace / 手写训练轨迹")
    paths["training-trace.png"] = "figures/training-trace.png"; _save_figure(figures / "training-trace.png")
    scratch_p = np.asarray(analysis["scratch"]["validation"]["probabilities"]); sklearn_p = np.asarray(analysis["parity"]["validationProbabilities"])
    plt.figure(figsize=(5.4, 5.0)); plt.scatter(scratch_p, sklearn_p, s=13, color="#0891b2"); plt.plot([0, 1], [0, 1], "--", color="#64748b"); plt.xlabel("scratch probability"); plt.ylabel("sklearn probability"); plt.title("Aligned probability parity / 概率对照")
    paths["parity-probabilities.png"] = "figures/parity-probabilities.png"; _save_figure(figures / "parity-probabilities.png")
    plt.figure(figsize=(6.8, 4.5))
    for mode in analysis["calibration"]["modes"]:
        bins = [item for item in mode["bins"] if item["count"] > 0]
        plt.plot([item["meanProbability"] for item in bins], [item["observedRate"] for item in bins], marker="o", label=mode["id"])
    plt.plot([0, 1], [0, 1], "--", color="#64748b"); plt.xlabel("mean probability"); plt.ylabel("observed class 1 rate"); plt.title("Validation reliability / 验证集可靠性"); plt.legend()
    paths["calibration-reliability.png"] = "figures/calibration-reliability.png"; _save_figure(figures / "calibration-reliability.png")
    circles = analysis["circles"]["points"]
    plt.figure(figsize=(5.4, 5.0)); plt.scatter([item["x"] for item in circles], [item["y"] for item in circles], c=[item["label"] for item in circles], cmap="coolwarm", s=15); plt.gca().set_aspect("equal"); plt.title("Linear boundary limit / 线性边界局限")
    paths["linear-boundary-limits.png"] = "figures/linear-boundary-limits.png"; _save_figure(figures / "linear-boundary-limits.png")
    for path in (figures / name for name in paths):
        if not path.read_bytes().startswith(PNG_SIGNATURE):
            raise RuntimeError(f"Expected a PNG figure: {path}")
    return paths


def _notebook(locale: str) -> Any:
    if locale not in LOCALES:
        raise ValueError(f"Unsupported locale: {locale}")
    heading = "# 逻辑回归：从分数到概率" if locale == "zh-CN" else "# Logistic regression: from score to probability"
    intro = "本笔记本从本地 Banknote 数据契约重放 Phase 29 的训练与校准输出。" if locale == "zh-CN" else "This notebook replays Phase 29 training and calibration outputs from the local Banknote contract."
    analysis_code = """from phase29_analysis import load_banknote_source, train_scratch_logistic, compare_unregularized_sklearn, finite_difference_sweep, build_temperature_calibration\nsource = load_banknote_source()\nscratch = train_scratch_logistic(source)\nparity = compare_unregularized_sklearn(source, scratch)\nfinite_difference = finite_difference_sweep(source)\ncalibration = build_temperature_calibration(source, scratch)\nprint({'terminal': scratch['terminal'], 'parity': parity['observed'], 'finite_difference': finite_difference['acceptance'], 'calibration_modes': [mode['id'] for mode in calibration['modes']]})"""
    cells = [new_markdown_cell(heading + "\n\n" + intro)]
    cells[0]["id"] = "phase29-introduction"
    cells[0].metadata["cellId"] = "phase29-introduction"
    for scene in SCENES:
        code = analysis_code if scene == "linear-score" else f"assert source.contract_version\nprint('phase29 output bound: {scene}')"
        cell = new_code_cell(code)
        cell_id = f"phase29-{scene}"
        cell["id"] = cell_id
        cell.metadata["cellId"] = cell_id
        cells.append(cell)
    notebook = new_notebook(cells=cells, metadata={"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}, "language_info": {"name": "python", "version": platform.python_version()}, "mlAtlas": {"contractVersion": CONTRACT_VERSION, "locale": locale, "cleanKernel": True}})
    return notebook


def _execute_notebook(notebook: Any) -> Any:
    original_pythonpath = os.environ.get("PYTHONPATH")
    script_directory = str(Path(__file__).resolve().parent)
    os.environ["PYTHONPATH"] = script_directory if not original_pythonpath else f"{script_directory}{os.pathsep}{original_pythonpath}"
    try:
        kernels = KernelSpecManager().find_kernel_specs()
        kernel_name = "python3" if "python3" in kernels else "ml-atlas-phase27a"
        if kernel_name not in kernels:
            raise RuntimeError("A pinned local Python Jupyter kernel is required for Phase 29 notebook execution.")
        client = NotebookClient(notebook, timeout=300, kernel_name=kernel_name, shutdown_kernel="immediate", record_timing=False, resources={"metadata": {"path": str(ROOT)}})
        client.execute()
        for cell in notebook.cells:
            if cell.cell_type == "code":
                cell.execution_count = 1
                for output in cell.get("outputs", []):
                    output.pop("execution_count", None)
        return notebook
    finally:
        if original_pythonpath is None:
            os.environ.pop("PYTHONPATH", None)
        else:
            os.environ["PYTHONPATH"] = original_pythonpath


def write_notebooks(root: Path) -> dict[str, str]:
    paths: dict[str, str] = {}
    code_sources: list[list[str]] = []
    for locale in LOCALES:
        notebook = _execute_notebook(_notebook(locale))
        path = root / f"banknote-logistic-regression.{locale}.ipynb"
        nbformat.write(notebook, path)
        paths[locale] = path.name
        code_sources.append([cell.source for cell in notebook.cells if cell.cell_type == "code"])
    if code_sources[0] != code_sources[1]:
        raise RuntimeError("Bilingual notebooks must retain identical ordered code cells.")
    return paths


def _prediction_records(source: Any, parameters: Iterable[float]) -> list[dict[str, Any]]:
    values = np.asarray(list(parameters), dtype=float)
    model_hash = hashlib.sha256(json.dumps([float(value) for value in values], separators=(",", ":")).encode()).hexdigest()
    config_hash = hashlib.sha256(json.dumps({"scratch": SCRATCH_CONFIG, "sklearn": {**SKLEARN_CONFIG, "C": "infinity"}}, sort_keys=True, default=str, separators=(",", ":")).encode()).hexdigest()
    records = []
    for split in ("train", "validation", "test"):
        matrix, labels, row_ids = source.matrix(split)
        logits = matrix @ values[:4] + values[4]
        probabilities = 1 / (1 + np.exp(-logits))
        records.extend({"row_id": row_id, "split": split, "label": int(label), "logit": float(logit), "probability": float(probability), "feature_contract_version": source.contract_version, "model_hash": model_hash, "config_hash": config_hash} for row_id, label, logit, probability in zip(row_ids, labels, logits, probabilities, strict=True))
    return records


def write_outputs(root: Path, analysis: dict[str, Any]) -> dict[str, str]:
    output = root / "outputs"; output.mkdir(parents=True, exist_ok=True)
    trace_rows = []
    replay_trace, _ = sampled_replay_trace(analysis["scratch"]["trace"])
    for state in replay_trace:
        trace_rows.append({"iteration": state["iteration"], "objective": state["objective"], "gradient_norm": state["gradientNorm"], "parameter_step_norm": state["parameterStepNorm"], "accepted_step": state["acceptedStep"], "backtracks": state["backtracks"], **{f"parameter_{index}": value for index, value in enumerate(state["parameters"])}})
    pd.DataFrame(trace_rows).to_csv(output / "training-trace.csv", index=False, lineterminator="\n")
    write_json(output / "parity.json", analysis["parity"])
    write_json(output / "calibration.json", analysis["calibration"])
    write_json(output / "gradient-check.json", analysis["finiteDifference"])
    records = _prediction_records(analysis["source"], analysis["scratch"]["parameters"])
    columns = ["row_id", "split", "label", "logit", "probability", "feature_contract_version", "model_hash", "config_hash"]
    with (root / "frozen-predictions.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, lineterminator="\n")
        writer.writeheader(); writer.writerows(records)
    write_json(root / "frozen-predictions.json", records)
    return {"trainingTrace": "outputs/training-trace.csv", "parity": "outputs/parity.json", "calibration": "outputs/calibration.json", "gradientCheck": "outputs/gradient-check.json", "frozenCsv": "frozen-predictions.csv", "frozenJson": "frozen-predictions.json"}


def build_bundle(root: Path) -> None:
    source = load_banknote_source()
    scratch = train_scratch_logistic(source)
    parity = compare_unregularized_sklearn(source, scratch)
    finite_difference = finite_difference_sweep(source)
    analysis = {"source": source, "scratch": scratch, "parity": parity, "finiteDifference": finite_difference, "calibration": build_temperature_calibration(source, scratch), "rows": select_teaching_rows(source, scratch), "l2": compare_l2_objective(source, scratch), "xor": build_xor_diagnostic(), "circles": build_circle_diagnostic()}
    interactions = _interaction_payloads(analysis)
    for scene, payload in interactions.items():
        write_json(root / "interactions" / f"{scene}.json", payload)
    figures = write_figures(root, analysis)
    notebooks = write_notebooks(root)
    outputs = write_outputs(root, analysis)
    interaction_assets = []
    for scene in SCENES:
        relative_path = f"interactions/{scene}.json"
        interaction_assets.append({"id": scene, "chapterId": scene, "sceneId": scene, "controls": interactions[scene]["controls"], "sourceCellId": interactions[scene]["sourceCellId"], "path": relative_path, "sha256": sha256(root / relative_path)})
    file_hashes = tree_hashes(root)
    manifest = {
        "contractVersion": CONTRACT_VERSION, "locales": list(LOCALES), "notebookPath": _asset_path(notebooks["en"]), "notebooks": {locale: {"path": _asset_path(path), "sha256": sha256(root / path)} for locale, path in notebooks.items()},
        "atomicPublication": True, "rollbackOnFailure": True, "rejectAssetDrift": True, "cleanKernelVerified": True, "learnerFacingTestRecords": False, "testLabelsDisclosed": False, "testMetricsDisclosed": False,
        "assets": interaction_assets,
        "outputs": {key: _asset_path(value) for key, value in outputs.items() if not key.startswith("frozen")},
        "figures": [{"path": _asset_path(relative), "sha256": sha256(root / relative), "sourceCellId": "phase29-regularization" if name == "training-trace.png" else "phase29-linear-limits" if name in {"calibration-reliability.png", "linear-boundary-limits.png"} else "phase29-linear-score"} for name, relative in figures.items()],
        "predictionHandoff": {"csv": _asset_path(outputs["frozenCsv"]), "json": _asset_path(outputs["frozenJson"]), "sha256": {"csv": sha256(root / outputs["frozenCsv"]), "json": sha256(root / outputs["frozenJson"])}, "fields": ["row_id", "split", "label", "logit", "probability", "feature_contract_version", "model_hash", "config_hash"], "reservedFor": "phase-30"},
        "analysis": {"source": {"contractVersion": source.contract_version, "sha256": source.source_sha256, "featureOrder": list(FEATURES), "splitCounts": {"train": 960, "validation": 206, "test": 206}, "preprocessing": {"fitSplit": "train", "ddof": 0}}, "parity": {"scratch": {**SCRATCH_CONFIG, "terminal": scratch["terminal"]}, "sklearn": {"constructor": {**SKLEARN_CONFIG, "C": "infinity"}, "nIter": parity["nIter"], "warningsPolicy": parity["warningsPolicy"], "warnings": parity["warnings"]}, "acceptance": {"coefficientAndInterceptLimit": PARITY_LIMITS["coefficientAndIntercept"], "validationProbabilityLimit": PARITY_LIMITS["validationProbability"], **parity["observed"]}}, "finiteDifference": finite_difference, "calibrationRule": analysis["calibration"]["modeRule"]},
        "fileHashes": file_hashes,
    }
    write_json(root / "manifest.json", manifest)
    validate_bundle(root)


def validate_bundle(root: Path) -> None:
    manifest_path = root / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("contractVersion") != CONTRACT_VERSION or manifest.get("locales") != list(LOCALES):
        raise RuntimeError("Invalid Phase 29 manifest identity.")
    if len(manifest.get("assets", [])) != len(SCENES):
        raise RuntimeError("Incomplete Phase 29 scene inventory.")
    identities = set()
    for asset in manifest["assets"]:
        identity = asset["sceneId"]
        if identity not in SCENES or identity in identities or not asset["sourceCellId"].startswith("phase29-"):
            raise RuntimeError("Invalid interaction identity.")
        identities.add(identity)
        path = root / asset["path"]
        if not path.is_file() or sha256(path) != asset["sha256"]:
            raise RuntimeError("Interaction hash mismatch.")
        payload = json.loads(path.read_text(encoding="utf-8"))
        if payload["sceneId"] != identity or payload["sourceCellId"] != asset["sourceCellId"] or '"split": "test"' in path.read_text(encoding="utf-8"):
            raise RuntimeError("Invalid learner interaction payload.")
    for path, expected in manifest["fileHashes"].items():
        if not (root / path).is_file() or sha256(root / path) != expected:
            raise RuntimeError(f"Generated file hash mismatch: {path}")
    for locale, record in manifest["notebooks"].items():
        path = root / Path(record["path"]).name
        if locale not in LOCALES or sha256(path) != record["sha256"]:
            raise RuntimeError("Notebook hash mismatch.")
    frozen = json.loads((root / "frozen-predictions.json").read_text(encoding="utf-8"))
    if {record["split"] for record in frozen} != {"train", "validation", "test"}:
        raise RuntimeError("Frozen Phase 30 handoff must retain all declared splits.")


def publish(output: Path, inject_failure: str | None = None, bundle_builder: Any = build_bundle) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="phase29-assets-", dir=output.parent) as temporary:
        staged = Path(temporary) / "bundle"; bundle_builder(staged)
        backup = output.with_name(f"{output.name}.phase29-backup")
        if backup.exists(): shutil.rmtree(backup)
        existed = output.exists()
        moved_original = False
        published = False
        try:
            if inject_failure == "pre": raise RuntimeError("Injected publication failure before swap")
            if existed:
                os.replace(output, backup)
                moved_original = True
            if inject_failure == "mid": raise RuntimeError("Injected publication failure after backup")
            os.replace(staged, output)
            published = True
            if inject_failure == "post": raise RuntimeError("Injected publication failure after swap")
            if backup.exists(): shutil.rmtree(backup)
        except Exception:
            if published and output.exists():
                shutil.rmtree(output)
            if moved_original and backup.exists():
                os.replace(backup, output)
            raise


def check(output: Path) -> None:
    if not output.is_dir(): raise SystemExit(f"asset bundle does not exist: {output}")
    before = {path.relative_to(output).as_posix(): (sha256(path), path.stat().st_size, path.stat().st_mtime_ns) for path in output.rglob("*") if path.is_file()}
    with tempfile.TemporaryDirectory(prefix="phase29-check-") as temporary:
        candidate = Path(temporary) / "bundle"; build_bundle(candidate)
        if tree_hashes(candidate) != tree_hashes(output): raise SystemExit("Phase 29 asset drift detected.")
    after = {path.relative_to(output).as_posix(): (sha256(path), path.stat().st_size, path.stat().st_mtime_ns) for path in output.rglob("*") if path.is_file()}
    if before != after: raise SystemExit("Read-only Phase 29 check modified public assets.")


def rollback_probe(output_parent: Path) -> None:
    with tempfile.TemporaryDirectory(prefix="phase29-rollback-") as temporary:
        base = Path(temporary)
        for seeded in (False, True):
            target = base / ("seeded" if seeded else "absent") / "phase-29"
            if seeded:
                target.mkdir(parents=True); (target / "sentinel.txt").write_text("preserve", encoding="utf-8"); (target / "sentinel.txt").chmod(0o640)
            before = tree_hashes(target) if target.exists() else {}
            def transaction_fixture(staged: Path) -> None:
                staged.mkdir(parents=True)
                (staged / "complete-tree.txt").write_text("phase29 transaction fixture\n", encoding="utf-8")

            for failure in ("pre", "mid", "post"):
                try: publish(target, failure, transaction_fixture)
                except RuntimeError: pass
                else: raise RuntimeError("Failure injection did not fail.")
                after = tree_hashes(target) if target.exists() else {}
                if after != before: raise RuntimeError("Atomic publication rollback changed target bytes.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--rollback-probe", action="store_true")
    parser.add_argument("--inject-failure", choices=("pre", "mid", "post"))
    args = parser.parse_args()
    output = args.output_root.resolve()
    if args.rollback_probe: rollback_probe(output.parent); return
    if args.check: check(output); return
    publish(output, args.inject_failure)


if __name__ == "__main__":
    main()
