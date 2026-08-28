#!/usr/bin/env python3
"""Build the deterministic Phase 28A gradient-descent teaching package."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import os
import platform
import shutil
import tempfile
from pathlib import Path
from typing import Any, Iterable

import nbclient
import nbformat
import numpy as np
import jupyter_client
from nbclient import NotebookClient
from nbformat.v4 import new_code_cell, new_markdown_cell, new_notebook
from jupyter_client.kernelspec import KernelSpecManager


ROOT = Path(__file__).resolve().parents[2]
PUBLIC_ROOT = ROOT / "public" / "gradient-descent" / "v1"
PUBLIC_PREFIX = "/gradient-descent/v1"
BIKE_TRACE = ROOT / "public" / "linear-regression" / "phase-27a" / "gradient-descent-trace.csv"
SAMPLES = [
    {"id": "s1", "x": 1.0, "y": 52.0},
    {"id": "s2", "x": 2.0, "y": 59.0},
    {"id": "s3", "x": 3.0, "y": 65.0},
    {"id": "s4", "x": 4.0, "y": 72.0},
    {"id": "s5", "x": 5.0, "y": 78.0},
]
SEED = 2801


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def evaluation(samples: list[dict[str, float]], weight: float, bias: float) -> dict[str, Any]:
    predictions = [weight * row["x"] + bias for row in samples]
    residuals = [row["y"] - prediction for row, prediction in zip(samples, predictions, strict=True)]
    count = len(samples)
    mse = sum(residual * residual for residual in residuals) / count
    gradient = {
        "weight": -(2 / count) * sum(row["x"] * residual for row, residual in zip(samples, residuals, strict=True)),
        "bias": -(2 / count) * sum(residuals),
    }
    return {
        "weight": weight,
        "bias": bias,
        "predictions": predictions,
        "residuals": residuals,
        "mse": mse,
        "gradient": gradient,
        "gradientNorm": math.hypot(gradient["weight"], gradient["bias"]),
    }


def lcg_shuffle(length: int, seed: int) -> list[int]:
    state = seed & 0xFFFFFFFF
    indices = list(range(length))
    for index in range(length - 1, 0, -1):
        state = (1664525 * state + 1013904223) & 0xFFFFFFFF
        target = math.floor((state / 2**32) * (index + 1))
        indices[index], indices[target] = indices[target], indices[index]
    return indices


def batches(mode: str, epoch: int, mini_batch_size: int = 2) -> list[list[int]]:
    if mode == "full":
        return [list(range(len(SAMPLES)))]
    size = 1 if mode == "stochastic" else mini_batch_size
    order = lcg_shuffle(len(SAMPLES), (SEED + ((epoch * 2654435761) & 0xFFFFFFFF)) & 0xFFFFFFFF)
    return [order[offset:offset + size] for offset in range(0, len(order), size)]


def trajectory(
    samples: list[dict[str, float]],
    weight: float,
    bias: float,
    rate: float,
    mode: str,
    epochs: int,
    threshold: float = 1e12,
) -> dict[str, Any]:
    rows: list[dict[str, Any]] = []
    processed = 0
    status = "max-updates"
    previous_mse = evaluation(samples, weight, bias)["mse"]
    for epoch in range(epochs):
        for batch_index, indices in enumerate(batches(mode, epoch)):
            subset = [samples[index] for index in indices]
            current = evaluation(subset, weight, bias)
            next_weight = weight - rate * current["gradient"]["weight"]
            next_bias = bias - rate * current["gradient"]["bias"]
            full = evaluation(samples, next_weight, next_bias)
            processed += len(subset)
            if not all(math.isfinite(value) for value in [next_weight, next_bias, full["mse"]]):
                status = "diverged-non-finite"
            elif max(abs(next_weight), abs(next_bias), full["mse"]) > threshold:
                status = "diverged-threshold"
            elif full["gradientNorm"] <= 1e-8:
                status = "converged"
            elif full["mse"] > previous_mse * 1.02:
                status = "oscillating"
            else:
                status = "running"
            rows.append({
                "update": len(rows) + 1,
                "epoch": epoch,
                "batchIndex": batch_index,
                "processedSamples": processed,
                "sampleIds": [samples[index]["id"] for index in indices],
                "before": {"weight": weight, "bias": bias},
                "gradient": current["gradient"],
                "after": {"weight": next_weight, "bias": next_bias},
                "fullMse": full["mse"],
                "status": status,
            })
            weight, bias = next_weight, next_bias
            previous_mse = full["mse"]
            if status.startswith("diverged") or status == "converged":
                return {"status": status, "updates": rows, "final": full}
    if status in {"running", "oscillating"}:
        status = "max-updates" if evaluation(samples, weight, bias)["mse"] <= rows[0]["fullMse"] else status
    return {"status": status, "updates": rows, "final": evaluation(samples, weight, bias)}


def terrain_payload() -> dict[str, Any]:
    definitions = {
        "tilted-ravine": {
            "domain": [-3.0, 3.0, -3.0, 3.0],
            "loss": lambda x, y: 0.08 * (x + y) ** 2 + 1.2 * (x - y) ** 2,
        },
        "rosenbrock": {
            "domain": [-2.0, 2.0, -1.0, 3.0],
            "loss": lambda x, y: (1 - x) ** 2 + 20 * (y - x * x) ** 2,
        },
        "saddle": {
            "domain": [-3.0, 3.0, -3.0, 3.0],
            "loss": lambda x, y: x * x - y * y,
        },
        "multi-well": {
            "domain": [-3.0, 3.0, -3.0, 3.0],
            "loss": lambda x, y: 0.08 * (x * x + y * y) + math.sin(2 * x) * math.sin(2 * y),
        },
    }
    terrains = []
    for identifier, definition in definitions.items():
        x_min, x_max, y_min, y_max = definition["domain"]
        xs = np.linspace(x_min, x_max, 25)
        ys = np.linspace(y_min, y_max, 25)
        values = [[float(definition["loss"](float(x), float(y))) for x in xs] for y in ys]
        terrains.append({"id": identifier, "domain": definition["domain"], "x": xs.tolist(), "y": ys.tolist(), "loss": values})
    return {"terrains": terrains}


def interaction_payloads() -> dict[str, Any]:
    anchor = evaluation(SAMPLES, 6.0, 47.0)
    updated_parameters = {
        "weight": 6.0 - 0.02 * anchor["gradient"]["weight"],
        "bias": 47.0 - 0.02 * anchor["gradient"]["bias"],
    }
    updated = evaluation(SAMPLES, **updated_parameters)
    loss_curve = [
        {"weight": float(weight), "mse": evaluation(SAMPLES, float(weight), 47.0)["mse"]}
        for weight in np.linspace(4.0, 8.0, 81)
    ]
    weight_values = np.linspace(4.0, 9.0, 31)
    bias_values = np.linspace(38.0, 54.0, 33)
    loss_grid = [[evaluation(SAMPLES, float(weight), float(bias))["mse"] for weight in weight_values] for bias in bias_values]
    row_contributions = []
    count = len(SAMPLES)
    for row, prediction, residual in zip(SAMPLES, anchor["predictions"], anchor["residuals"], strict=True):
        row_contributions.append({
            **row,
            "prediction": prediction,
            "residual": residual,
            "weightGradientContribution": -(2 / count) * row["x"] * residual,
            "biasGradientContribution": -(2 / count) * residual,
        })

    standardized_x = [(row["x"] - 3.0) / math.sqrt(2.0) for row in SAMPLES]
    standardized = [{**row, "x": x} for row, x in zip(SAMPLES, standardized_x, strict=True)]
    learning_rates = [
        {"id": "slow", "rate": 0.002},
        {"id": "stable", "rate": 0.02},
        {"id": "oscillating", "rate": 0.08},
        {"id": "divergent", "rate": 0.3},
    ]
    learning_paths = []
    for scale_id, data in [("raw", SAMPLES), ("standardized", standardized)]:
        start = {"weight": 0.0, "bias": 0.0}
        for definition in learning_rates:
            learning_paths.append({
                "scale": scale_id,
                **definition,
                "trajectory": trajectory(data, start["weight"], start["bias"], definition["rate"], "full", 60),
            })

    batching = [
        {"mode": mode, "trajectory": trajectory(SAMPLES, 0.0, 0.0, 0.005, mode, 40)}
        for mode in ["full", "mini-batch", "stochastic"]
    ]
    bike_preview = []
    if BIKE_TRACE.exists():
        with BIKE_TRACE.open(encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                bike_preview.append({
                    "update": int(row["update"]),
                    "mse": float(row["mse"]),
                    "gradientNorm": float(row["gradientNorm"]),
                })

    return {
        "loss-function": {
            "scene": "loss-function",
            "notebookCellId": "gd-loss-anchor",
            "samples": SAMPLES,
            "anchor": anchor,
            "lossCurve": loss_curve,
        },
        "landscape": {
            "scene": "landscape",
            "notebookCellId": "gd-parameter-landscape",
            "weightValues": weight_values.tolist(),
            "biasValues": bias_values.tolist(),
            "lossGrid": loss_grid,
            "optimum": {"weight": 6.5, "bias": 45.7, "mse": 0.06},
            "start": {"weight": 4.5, "bias": 51.0},
        },
        "gradient-rule": {
            "scene": "gradient-rule",
            "notebookCellId": "gd-one-update",
            "anchor": anchor,
            "rowContributions": row_contributions,
            "learningRate": 0.02,
            "updated": updated,
        },
        "learning-rate": {
            "scene": "learning-rate",
            "notebookCellId": "gd-learning-rate",
            "scaling": {"mean": 3.0, "scale": math.sqrt(2.0)},
            "paths": learning_paths,
        },
        "saddle-local-minima": {
            "scene": "saddle-local-minima",
            "notebookCellId": "gd-advanced-terrain",
            **terrain_payload(),
        },
        "noise-and-batch": {
            "scene": "noise-and-batch",
            "notebookCellId": "gd-real-batches",
            "seed": SEED,
            "miniBatchSize": 2,
            "paths": batching,
            "bikeTrace": {
                "path": "/linear-regression/phase-27a/gradient-descent-trace.csv",
                "sha256": sha256(BIKE_TRACE) if BIKE_TRACE.exists() else None,
                "preview": bike_preview,
            },
        },
    }


def output_text(output: dict[str, Any]) -> str:
    if output.get("output_type") == "stream":
        text = output.get("text", "")
        return "".join(text) if isinstance(text, list) else str(text)
    return ""


def build_notebook(locale: str) -> Any:
    zh = locale == "zh-CN"
    title = "梯度下降：从五行数据到真实更新" if zh else "Gradient Descent: From Five Rows to Real Updates"
    intro = (
        "本 Notebook 与网页共享同一份 5 行学习时长数据，依次复现预测、残差、MSE、梯度、一次更新、学习率和真实 batch。"
        if zh else
        "This notebook shares the same five-row study-hours dataset with the course and reproduces predictions, residuals, MSE, gradients, one update, learning-rate paths, and real batches."
    )
    cells = [
        new_markdown_cell(f"# {title}\n\n{intro}"),
        new_code_cell(
            "from pathlib import Path\nimport csv, math\nimport numpy as np\n\n"
            "rows = list(csv.DictReader(Path('study-score.csv').open(encoding='utf-8')))\n"
            "x = np.array([float(row['study_hours']) for row in rows])\n"
            "y = np.array([float(row['score']) for row in rows])\n"
            "print('x =', x.astype(int).tolist())\nprint('y =', y.astype(int).tolist())",
            metadata={"cellId": "gd-load-data"},
        ),
        new_code_cell(
            "w, b = 6.0, 47.0\ny_hat = w*x + b\nr = y-y_hat\nmse = np.mean(r**2)\n"
            "print('prediction =', y_hat.astype(int).tolist())\n"
            "print('residual =', r.astype(int).tolist())\nprint(f'MSE = {mse:.6f}')",
            metadata={"cellId": "gd-loss-anchor"},
        ),
        new_code_cell(
            "weight_grid = np.linspace(4, 9, 31)\nbias_grid = np.linspace(38, 54, 33)\n"
            "surface = np.array([[np.mean((y-(candidate_w*x+candidate_b))**2) for candidate_w in weight_grid] for candidate_b in bias_grid])\n"
            "minimum = np.unravel_index(np.argmin(surface), surface.shape)\n"
            "print('grid shape =', surface.shape)\nprint('best grid point =', float(weight_grid[minimum[1]]), float(bias_grid[minimum[0]]))",
            metadata={"cellId": "gd-parameter-landscape"},
        ),
        new_code_cell(
            "dw = -(2/len(x))*np.sum(x*r)\ndb = -(2/len(x))*np.sum(r)\neta = 0.02\n"
            "new_w, new_b = w-eta*dw, b-eta*db\nnew_mse = np.mean((y-(new_w*x+new_b))**2)\n"
            "print(f'gradient = ({dw:.6f}, {db:.6f})')\n"
            "print(f'updated = ({new_w:.6f}, {new_b:.6f})')\nprint(f'new MSE = {new_mse:.6f}')",
            metadata={"cellId": "gd-one-update"},
        ),
        new_code_cell(
            "def run(rate, steps=12):\n    w, b = 0.0, 0.0\n    losses = []\n    for _ in range(steps):\n        residual = y-(w*x+b)\n        w -= rate * (-(2/len(x))*np.sum(x*residual))\n        b -= rate * (-(2/len(x))*np.sum(residual))\n        losses.append(float(np.mean((y-(w*x+b))**2)))\n    return losses\n\n"
            "for rate in [0.002, 0.02, 0.08, 0.3]:\n    values = run(rate)\n    print(rate, [round(value, 4) for value in values[:4]], '->', f'{values[-1]:.4g}')",
            metadata={"cellId": "gd-learning-rate"},
        ),
        new_code_cell(
            "def terrain_values(name, x_value, y_value):\n"
            "    if name == 'saddle': return x_value**2-y_value**2\n"
            "    if name == 'rosenbrock': return (1-x_value)**2+20*(y_value-x_value**2)**2\n"
            "    if name == 'multi-well': return .08*(x_value**2+y_value**2)+np.sin(2*x_value)*np.sin(2*y_value)\n"
            "    return .08*(x_value+y_value)**2+1.2*(x_value-y_value)**2\n\n"
            "for name in ['tilted-ravine', 'rosenbrock', 'saddle', 'multi-well']:\n    print(name, round(float(terrain_values(name, 1.0, -0.5)), 6))",
            metadata={"cellId": "gd-advanced-terrain"},
        ),
        new_code_cell(
            "def lcg_order(seed):\n"
            "    state = seed & 0xffffffff\n    order = list(range(len(x)))\n"
            "    for index in range(len(order)-1, 0, -1):\n"
            "        state = (1664525*state+1013904223) & 0xffffffff\n"
            "        target = int((state/2**32)*(index+1))\n"
            "        order[index], order[target] = order[target], order[index]\n"
            "    return order\n\n"
            "order = lcg_order(2801)\nmini_batches = [order[offset:offset+2] for offset in range(0, len(order), 2)]\n"
            "print('mini-batch sample ids =', [[rows[index]['sample_id'] for index in batch] for batch in mini_batches])\n"
            "print('last mini-batch size =', len(mini_batches[-1]))",
            metadata={"cellId": "gd-real-batches"},
        ),
    ]
    cells[0]["id"] = "gd-course-introduction"
    for cell in cells[1:]:
        cell["id"] = cell.metadata["cellId"]
    notebook = new_notebook(cells=cells)
    notebook["id"] = f"gradient-descent-{locale}"
    notebook.metadata.kernelspec = {"display_name": "Python 3", "language": "python", "name": "python3"}
    notebook.metadata.language_info = {"name": "python", "version": platform.python_version()}
    notebook.metadata.course = {"moduleId": "gradient-descent", "locale": locale, "seed": SEED}
    return notebook


def execute_notebook(notebook: Any, workdir: Path) -> Any:
    kernels = KernelSpecManager().find_kernel_specs()
    kernel_name = "python3" if "python3" in kernels else "ml-atlas-phase27a"
    if kernel_name not in kernels:
        raise RuntimeError("A Python 3 Jupyter kernel is required to execute gradient-descent notebooks")
    client = NotebookClient(
        notebook,
        timeout=180,
        kernel_name=kernel_name,
        record_timing=False,
        resources={"metadata": {"path": str(workdir)}},
    )
    executed = client.execute()
    for cell in executed.cells:
        if cell.cell_type == "code":
            cell.pop("execution_count", None)
            for output in cell.get("outputs", []):
                output.pop("execution_count", None)
                output.pop("transient", None)
        cell.metadata.pop("execution", None)
    return executed


def build_package(target: Path) -> None:
    target.mkdir(parents=True, exist_ok=True)
    interactions_dir = target / "interactions"
    notebooks_dir = target / "notebooks"
    interactions_dir.mkdir()
    notebooks_dir.mkdir()

    with (target / "study-score.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(["sample_id", "study_hours", "score"])
        for row in SAMPLES:
            writer.writerow([row["id"], int(row["x"]), int(row["y"])])

    payloads = interaction_payloads()
    for chapter_id, payload in payloads.items():
        write_json(interactions_dir / f"{chapter_id}.json", payload)

    anchor = evaluation(SAMPLES, 6.0, 47.0)
    next_parameters = {
        "weight": 6.0 - 0.02 * anchor["gradient"]["weight"],
        "bias": 47.0 - 0.02 * anchor["gradient"]["bias"],
    }
    summary = {
        "schemaVersion": 1,
        "moduleId": "gradient-descent",
        "dataset": {"rows": 5, "seed": SEED},
        "anchor": anchor,
        "oneUpdate": {"learningRate": 0.02, "parameters": next_parameters, "evaluation": evaluation(SAMPLES, **next_parameters)},
        "leastSquares": evaluation(SAMPLES, 6.5, 45.7),
        "batchContract": {"seed": SEED, "miniBatchSize": 2, "finalMiniBatchSize": 1},
    }
    write_json(target / "gradient-descent-summary.json", summary)

    for locale in ["zh-CN", "en"]:
        notebook = execute_notebook(build_notebook(locale), target)
        nbformat.write(notebook, notebooks_dir / f"gradient-descent-from-scratch.{locale}.ipynb")

    requirements = (
        f"numpy=={np.__version__}\n"
        f"nbformat=={nbformat.__version__}\n"
        f"nbclient=={nbclient.__version__}\n"
        f"jupyter-client=={jupyter_client.__version__}\n"
        "ipykernel==7.3.0\n"
    )
    (target / "requirements.txt").write_text(requirements, encoding="utf-8")
    write_json(target / "environment.json", {
        "python": ".".join(platform.python_version_tuple()[:2]),
        "platformContract": "portable-cpython-3.12",
        "dependencies": {
            "numpy": np.__version__,
            "nbformat": nbformat.__version__,
            "nbclient": nbclient.__version__,
            "jupyter-client": jupyter_client.__version__,
            "ipykernel": "7.3.0",
        },
        "cleanKernel": True,
        "timingStripped": True,
    })

    manifest_entries = []
    for path in sorted(target.rglob("*")):
        if path.is_file() and path.name not in {"output-manifest.json", "interaction-manifest.json"}:
            manifest_entries.append({
                "path": f"gradient-descent/v1/{path.relative_to(target).as_posix()}",
                "sha256": sha256(path),
                "bytes": path.stat().st_size,
            })
    interaction_manifest = {
        "schemaVersion": 1,
        "moduleId": "gradient-descent",
        "chapters": [
            {
                "chapterId": chapter_id,
                "scene": payload["scene"],
                "notebookCellId": payload["notebookCellId"],
                "path": f"{PUBLIC_PREFIX}/interactions/{chapter_id}.json",
                "sha256": sha256(interactions_dir / f"{chapter_id}.json"),
            }
            for chapter_id, payload in payloads.items()
        ],
    }
    write_json(target / "interaction-manifest.json", interaction_manifest)
    manifest_entries.extend([
        {
            "path": "gradient-descent/v1/interaction-manifest.json",
            "sha256": sha256(target / "interaction-manifest.json"),
            "bytes": (target / "interaction-manifest.json").stat().st_size,
        },
    ])
    write_json(target / "output-manifest.json", {
        "schemaVersion": 1,
        "generatedBy": "scripts/gradient-descent/build-assets.py",
        "publicPrefix": PUBLIC_PREFIX,
        "files": sorted(manifest_entries, key=lambda item: item["path"]),
    })


def tree_snapshot(root: Path) -> dict[str, str]:
    return {path.relative_to(root).as_posix(): sha256(path) for path in sorted(root.rglob("*")) if path.is_file()}


def notebook_semantic_snapshot(path: Path) -> dict[str, Any]:
    notebook = nbformat.read(path, as_version=4)
    cells = []
    for cell in notebook.cells:
        cells.append({
            "id": cell.get("id"),
            "cell_type": cell.cell_type,
            "cellId": cell.get("metadata", {}).get("cellId"),
            "source": cell.source,
            "outputs": [
                {
                    "output_type": output.get("output_type"),
                    "name": output.get("name"),
                    "text": output_text(output),
                    "data": output.get("data"),
                }
                for output in cell.get("outputs", [])
            ],
        })
    return {"course": notebook.metadata.get("course"), "cells": cells}


def json_semantically_equal(left: Any, right: Any, *, ignore_integrity: bool = False) -> bool:
    if isinstance(left, bool) or isinstance(right, bool):
        return left is right
    if isinstance(left, (int, float)) and isinstance(right, (int, float)):
        return math.isclose(float(left), float(right), rel_tol=1e-12, abs_tol=1e-12)
    if isinstance(left, dict) and isinstance(right, dict):
        ignored_keys = {"sha256", "bytes"} if ignore_integrity else set()
        left_keys = set(left) - ignored_keys
        right_keys = set(right) - ignored_keys
        return left_keys == right_keys and all(
            json_semantically_equal(left[key], right[key], ignore_integrity=ignore_integrity)
            for key in left_keys
        )
    if isinstance(left, list) and isinstance(right, list):
        return len(left) == len(right) and all(
            json_semantically_equal(left_item, right_item, ignore_integrity=ignore_integrity)
            for left_item, right_item in zip(left, right)
        )
    return type(left) is type(right) and left == right


def check_package(staging: Path, published: Path) -> list[str]:
    differences: list[str] = []
    ignored = {
        "output-manifest.json",
        "notebooks/gradient-descent-from-scratch.zh-CN.ipynb",
        "notebooks/gradient-descent-from-scratch.en.ipynb",
    }
    staged_tree = tree_snapshot(staging)
    published_tree = tree_snapshot(published)
    for relative in sorted((set(staged_tree) | set(published_tree)) - ignored):
        if relative.endswith(".json") and relative in staged_tree and relative in published_tree:
            staged_json = json.loads((staging / relative).read_text(encoding="utf-8"))
            published_json = json.loads((published / relative).read_text(encoding="utf-8"))
            if not json_semantically_equal(
                staged_json,
                published_json,
                ignore_integrity=relative == "interaction-manifest.json",
            ):
                differences.append(relative)
        elif staged_tree.get(relative) != published_tree.get(relative):
            differences.append(relative)
    for locale in ["zh-CN", "en"]:
        relative = f"notebooks/gradient-descent-from-scratch.{locale}.ipynb"
        if notebook_semantic_snapshot(staging / relative) != notebook_semantic_snapshot(published / relative):
            differences.append(f"{relative} (semantic cells or outputs)")
    manifest = json.loads((published / "output-manifest.json").read_text(encoding="utf-8"))
    for member in manifest.get("files", []):
        relative = member["path"].removeprefix("gradient-descent/v1/")
        path = published / relative
        if not path.is_file() or sha256(path) != member["sha256"] or path.stat().st_size != member["bytes"]:
            differences.append(f"output-manifest.json -> {relative}")
    return differences


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    with tempfile.TemporaryDirectory(prefix="gradient-descent-assets-") as temp_dir:
        staging = Path(temp_dir) / "v1"
        build_package(staging)
        if args.check:
            if not PUBLIC_ROOT.exists():
                raise SystemExit("Gradient-descent asset package is missing")
            differences = check_package(staging, PUBLIC_ROOT)
            if differences:
                raise SystemExit("Gradient-descent asset drift detected: " + ", ".join(differences))
            print("Gradient-descent assets match notebooks, interactions, hashes, and numerical anchors")
            return
        PUBLIC_ROOT.parent.mkdir(parents=True, exist_ok=True)
        backup = PUBLIC_ROOT.with_name("v1.backup")
        if backup.exists():
            shutil.rmtree(backup)
        if PUBLIC_ROOT.exists():
            os.replace(PUBLIC_ROOT, backup)
        try:
            shutil.copytree(staging, PUBLIC_ROOT)
        except Exception:
            if PUBLIC_ROOT.exists():
                shutil.rmtree(PUBLIC_ROOT)
            if backup.exists():
                os.replace(backup, PUBLIC_ROOT)
            raise
        if backup.exists():
            shutil.rmtree(backup)
    print(f"Published deterministic assets to {PUBLIC_ROOT}")


if __name__ == "__main__":
    main()
