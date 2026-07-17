#!/usr/bin/env python3
"""Execute the Chinese master notebook and atomically publish authoritative outputs."""

from __future__ import annotations

import argparse
import base64
import hashlib
import importlib.metadata
import importlib.util
import json
import math
import os
import shutil
import struct
import sys
import tempfile
import uuid
from collections.abc import Callable
from pathlib import Path

import nbformat
from nbclient import NotebookClient


REPO_ROOT = Path(__file__).resolve().parents[2]
NOTEBOOK_DIR = REPO_ROOT / "public/notebooks/python-data-tools"
NOTEBOOK_PATH = NOTEBOOK_DIR / "python-data-tools-bike-sharing.zh-CN.ipynb"
OUTPUT_DIR = NOTEBOOK_DIR / "outputs"
CELL_OUTPUTS_FILENAME = "cell-output-previews.json"
CELL_OUTPUTS_PUBLIC_PATH = f"/notebooks/python-data-tools/outputs/{CELL_OUTPUTS_FILENAME}"
CELL_PREVIEW_DIRECTORY = "cell-previews"
ENVIRONMENT_PATH = NOTEBOOK_DIR / "environment.json"
FONT_PATH = REPO_ROOT / "public/fonts/python-data-tools/NotoSansSC-Variable.ttf"
FONT_METADATA_PATH = REPO_ROOT / "public/fonts/python-data-tools/metadata.json"
GENERATOR_PATH = Path(__file__).resolve()
DATA_MANIFEST_PATH = REPO_ROOT / "public/datasets/python-data-tools/manifest.json"
EXPECTED_VERSIONS = {
    "numpy": "2.4.6",
    "pandas": "3.0.3",
    "matplotlib": "3.10.9",
    "seaborn": "0.13.2",
    "plotly": "6.9.0",
    "nbformat": "5.10.4",
    "jupyterlab": "4.6.1",
    "nbclient": "0.11.0",
    "ipykernel": "7.3.0",
}
OUTPUT_SPECS = {
    "dataset-shape-schema": {
        "filename": "dataset-shape-schema.json", "kind": "json", "sourceCellId": "ch03-schema-output",
    },
    "hourly-demand-profile": {
        "filename": "hourly-demand-profile.png", "kind": "png", "sourceCellId": "ch05-hourly-line",
        "dimensions": [1440, 768],
        "alt": "折线图比较 0–23 时的平均每小时租车次数，点和连线展示日内需求结构。",
    },
    "workingday-comparison": {
        "filename": "workingday-comparison.json", "kind": "json", "sourceCellId": "ch04-workingday-groups",
    },
    "season-weather-distribution": {
        "filename": "season-weather-distribution.png", "kind": "png", "sourceCellId": "ch06-season-boxplot",
        "dimensions": [2240, 800],
        "alt": "双面板箱线图分别比较四季和天气状况下的每小时租车需求分布。",
    },
    "rider-composition": {
        "filename": "rider-composition.png", "kind": "png", "sourceCellId": "ch05-rider-bars",
        "dimensions": [1120, 768],
        "alt": "从零开始的双柱图比较临时用户与注册用户累计租车次数，柱顶标注精确数值。",
    },
    "pearson-correlation-matrix": {
        "filename": "pearson-correlation-matrix.json", "kind": "json", "sourceCellId": "ch06-correlation-matrix",
    },
    "plotly-hourly-explorer": {
        "filename": "plotly-hourly-explorer.plotly.json", "kind": "plotly-json", "sourceCellId": "ch07-hourly-explorer",
    },
    "final-analysis-evidence": {
        "filename": "final-analysis-evidence.json", "kind": "json", "sourceCellId": "ch08-final-evidence",
    },
}

VISUAL_CELL_DESCRIPTIONS = {
    "ch05-hourly-line": {
        "zh-CN": "折线图展示 0–23 时的平均共享单车需求。",
        "en": "A line chart shows mean bike-sharing demand across hours 0–23.",
    },
    "ch05-workingday-lines": {
        "zh-CN": "两条折线比较工作日与周末或节假日的逐小时平均需求。",
        "en": "Two lines compare hourly mean demand on working days and weekends or holidays.",
    },
    "ch05-rider-bars": {
        "zh-CN": "柱状图比较临时用户与注册用户的累计租车次数。",
        "en": "A bar chart compares cumulative rentals by casual and registered riders.",
    },
    "ch05-misleading-axis": {
        "zh-CN": "并排柱状图对比截断纵轴与从零开始纵轴造成的视觉差异。",
        "en": "Side-by-side bars contrast a truncated y-axis with a zero-based y-axis.",
    },
    "ch06-season-boxplot": {
        "zh-CN": "双面板箱线图比较不同季节和天气状况下的需求分布。",
        "en": "Two box-plot panels compare demand distributions across seasons and weather conditions.",
    },
    "ch06-temperature-scatter": {
        "zh-CN": "散点图展示标准化气温与每小时租车需求的关系，并叠加趋势线。",
        "en": "A scatter plot relates normalized temperature to hourly rentals with a fitted trend line.",
    },
    "ch06-correlation-heatmap": {
        "zh-CN": "热力图展示七个数值字段之间的 Pearson 相关系数矩阵。",
        "en": "A heatmap shows the Pearson correlation matrix for seven numeric fields.",
    },
    "ch07-rider-facets": {
        "zh-CN": "Plotly 分面折线图按用户类型和日期类型比较逐小时平均需求。",
        "en": "A Plotly faceted line chart compares hourly mean demand by rider and day type.",
    },
}


def _load_builder():
    path = Path(__file__).with_name("build-notebook.py")
    spec = importlib.util.spec_from_file_location("python_data_tools_build_notebook", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load notebook builder: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _json_bytes(value) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2, allow_nan=False) + "\n").encode()


def _write_notebook(path: Path, notebook) -> None:
    path.write_text(nbformat.writes(notebook, version=4).rstrip() + "\n", encoding="utf-8")


def preflight() -> tuple[dict, dict, dict]:
    if sys.version_info[:3] != (3, 12, 13):
        raise RuntimeError(f"Python must be 3.12.13; observed {sys.version.split()[0]}")
    observed = {name: importlib.metadata.version(name) for name in EXPECTED_VERSIONS}
    if observed != EXPECTED_VERSIONS:
        raise RuntimeError(f"Dependency versions differ: expected {EXPECTED_VERSIONS}; observed {observed}")
    environment = json.loads(ENVIRONMENT_PATH.read_text(encoding="utf-8"))
    data_manifest = json.loads(DATA_MANIFEST_PATH.read_text(encoding="utf-8"))
    font_metadata = json.loads(FONT_METADATA_PATH.read_text(encoding="utf-8"))
    if environment["dataset"]["sha256"] != data_manifest["file"]["sha256"]:
        raise RuntimeError("Environment dataset hash does not match the data manifest")
    if sha256_file(FONT_PATH) != font_metadata["file"]["sha256"]:
        raise RuntimeError("Local chart font hash does not match font metadata")
    if FONT_PATH.stat().st_size != font_metadata["file"]["bytes"]:
        raise RuntimeError("Local chart font byte count does not match font metadata")
    return environment, data_manifest, font_metadata


def _strip_transient_metadata(notebook) -> None:
    notebook.metadata.pop("widgets", None)
    for cell in notebook.cells:
        cell.metadata.pop("execution", None)
        for output in cell.get("outputs", []):
            output.get("metadata", {}).pop("transient", None)


def _assert_finite(value, path: str = "root") -> None:
    if isinstance(value, float) and not math.isfinite(value):
        raise ValueError(f"Non-finite number at {path}")
    if isinstance(value, dict):
        for key, nested in value.items():
            _assert_finite(nested, f"{path}.{key}")
    elif isinstance(value, list):
        for index, nested in enumerate(value):
            _assert_finite(nested, f"{path}[{index}]")


def png_dimensions(path: Path) -> tuple[int, int]:
    data = path.read_bytes()[:24]
    if len(data) != 24 or data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        raise ValueError(f"Not a valid PNG: {path}")
    return struct.unpack(">II", data[16:24])


def _joined_text(value) -> str:
    if isinstance(value, list):
        return "".join(str(part) for part in value).rstrip("\n")
    return str(value).rstrip("\n")


def _visual_description(source_cell_id: str) -> dict[str, str]:
    description = VISUAL_CELL_DESCRIPTIONS.get(source_cell_id)
    if description is None:
        raise ValueError(f"Missing bilingual visual description for {source_cell_id}")
    return description


def extract_cell_output_previews(notebook, directory: Path, notebook_sha: str) -> dict:
    """Publish safe, local previews from the executed notebook without retaining HTML."""
    asset_directory = directory / CELL_PREVIEW_DIRECTORY
    asset_directory.mkdir(parents=True, exist_ok=True)
    cells = []

    for cell in notebook.cells:
        if cell.cell_type != "code":
            continue
        metadata = cell.get("metadata", {}).get("mlAtlas", {})
        source_cell_id = metadata.get("sourceCellId", cell.id)
        if not isinstance(source_cell_id, str) or not source_cell_id.startswith("ch"):
            raise ValueError(f"Invalid source cell id for output preview: {source_cell_id!r}")

        items = []
        for output_index, output in enumerate(cell.outputs, start=1):
            if output.output_type == "error":
                raise ValueError(f"Notebook output preview contains an error: {source_cell_id}")

            data = output.get("data", {})
            if "image/png" in data:
                filename = f"{source_cell_id}-{output_index}.png"
                path = asset_directory / filename
                try:
                    image_bytes = base64.b64decode(_joined_text(data["image/png"]), validate=True)
                except ValueError as error:
                    raise ValueError(f"Invalid PNG output for {source_cell_id}") from error
                path.write_bytes(image_bytes)
                width, height = png_dimensions(path)
                items.append({
                    "kind": "image",
                    "publicPath": f"/notebooks/python-data-tools/outputs/{CELL_PREVIEW_DIRECTORY}/{filename}",
                    "sha256": sha256_file(path),
                    "bytes": path.stat().st_size,
                    "width": width,
                    "height": height,
                    "description": _visual_description(source_cell_id),
                })
                continue

            if "application/json" in data:
                figure = data["application/json"]
                if not isinstance(figure, dict) or not isinstance(figure.get("data"), list) or not isinstance(figure.get("layout"), dict):
                    raise ValueError(f"Unsupported application/json output for {source_cell_id}")
                filename = f"{source_cell_id}-{output_index}.plotly.json"
                path = asset_directory / filename
                path.write_bytes(_json_bytes(figure))
                items.append({
                    "kind": "plotly",
                    "publicPath": f"/notebooks/python-data-tools/outputs/{CELL_PREVIEW_DIRECTORY}/{filename}",
                    "sha256": sha256_file(path),
                    "bytes": path.stat().st_size,
                    "description": _visual_description(source_cell_id),
                })
                continue

            text = None
            if output.output_type == "stream":
                text = _joined_text(output.get("text", ""))
            elif "text/plain" in data:
                text = _joined_text(data["text/plain"])
            if text:
                items.append({"kind": "text", "text": text})

        if not items:
            items.append({"kind": "success"})
        execution_count = cell.get("execution_count")
        if not isinstance(execution_count, int) or execution_count <= 0:
            raise ValueError(f"Missing execution count for {source_cell_id}")
        cells.append({
            "sourceCellId": source_cell_id,
            "executionCount": execution_count,
            "items": items,
        })

    payload = {
        "contractVersion": "python-data-tools-v1",
        "notebookSha256": notebook_sha,
        "cells": cells,
    }
    (directory / CELL_OUTPUTS_FILENAME).write_bytes(_json_bytes(payload))
    return payload


def validate_cell_output_previews(directory: Path, notebook_path: Path) -> dict:
    preview_path = directory / CELL_OUTPUTS_FILENAME
    if not preview_path.is_file():
        raise FileNotFoundError(preview_path)
    payload = json.loads(preview_path.read_text(encoding="utf-8"))
    notebook = nbformat.read(notebook_path, as_version=4)
    expected_cell_ids = [
        cell.get("metadata", {}).get("mlAtlas", {}).get("sourceCellId", cell.id)
        for cell in notebook.cells
        if cell.cell_type == "code"
    ]
    cells = payload.get("cells")
    if payload.get("contractVersion") != "python-data-tools-v1" or payload.get("notebookSha256") != sha256_file(notebook_path):
        raise ValueError("Cell output previews are not bound to the executed notebook")
    if not isinstance(cells, list) or [cell.get("sourceCellId") for cell in cells] != expected_cell_ids:
        raise ValueError("Cell output preview order differs from the executed notebook")

    referenced_assets = set()
    asset_count = 0
    for cell in cells:
        if not isinstance(cell.get("executionCount"), int) or cell["executionCount"] <= 0:
            raise ValueError(f"Invalid execution count in cell output preview: {cell.get('sourceCellId')}")
        items = cell.get("items")
        if not isinstance(items, list) or not items:
            raise ValueError(f"Empty cell output preview: {cell.get('sourceCellId')}")
        for item in items:
            kind = item.get("kind")
            if kind == "success":
                if set(item) != {"kind"}:
                    raise ValueError("Successful no-output preview must not contain extra fields")
                continue
            if kind == "text":
                if not isinstance(item.get("text"), str) or not item["text"]:
                    raise ValueError("Cell text output must be non-empty")
                continue
            if kind not in {"image", "plotly"}:
                raise ValueError(f"Unsupported cell output preview kind: {kind}")
            public_path = item.get("publicPath")
            expected_prefix = f"/notebooks/python-data-tools/outputs/{CELL_PREVIEW_DIRECTORY}/"
            if not isinstance(public_path, str) or not public_path.startswith(expected_prefix):
                raise ValueError(f"Invalid cell output asset path: {public_path}")
            asset_path = directory / CELL_PREVIEW_DIRECTORY / Path(public_path).name
            if not asset_path.is_file() or sha256_file(asset_path) != item.get("sha256") or asset_path.stat().st_size != item.get("bytes"):
                raise ValueError(f"Cell output asset integrity mismatch: {asset_path}")
            description = item.get("description")
            if not isinstance(description, dict) or not all(isinstance(description.get(locale), str) and description[locale] for locale in ("zh-CN", "en")):
                raise ValueError(f"Missing bilingual cell output description: {asset_path}")
            if kind == "image":
                if list(png_dimensions(asset_path)) != [item.get("width"), item.get("height")]:
                    raise ValueError(f"Cell output image dimensions differ: {asset_path}")
            else:
                figure = json.loads(asset_path.read_text(encoding="utf-8"))
                if not isinstance(figure.get("data"), list) or not isinstance(figure.get("layout"), dict):
                    raise ValueError(f"Invalid Plotly cell output: {asset_path}")
            referenced_assets.add(asset_path.relative_to(directory).as_posix())
            asset_count += 1

    observed_assets = {
        path.relative_to(directory).as_posix()
        for path in (directory / CELL_PREVIEW_DIRECTORY).glob("*")
        if path.is_file()
    }
    if observed_assets != referenced_assets:
        raise ValueError("Cell output preview directory contains missing or unreferenced assets")
    return {
        "sha256": sha256_file(preview_path),
        "bytes": preview_path.stat().st_size,
        "cellCount": len(cells),
        "assetCount": asset_count,
    }


def validate_outputs(directory: Path, dataset_sha: str) -> dict[str, dict]:
    observed = {}
    for output_id, output_spec in OUTPUT_SPECS.items():
        path = directory / output_spec["filename"]
        if not path.is_file():
            raise FileNotFoundError(f"Missing output {output_id}: {path}")
        record = {"sha256": sha256_file(path), "bytes": path.stat().st_size}
        if output_spec["kind"] == "png":
            dimensions = list(png_dimensions(path))
            if dimensions != output_spec["dimensions"]:
                raise ValueError(f"{output_id} dimensions: expected {output_spec['dimensions']}, observed {dimensions}")
            record["dimensions"] = dimensions
        else:
            payload = json.loads(path.read_text(encoding="utf-8"))
            _assert_finite(payload, output_id)
            if output_id != "plotly-hourly-explorer" and payload.get("datasetSha256", payload.get("dataset_sha256")) != dataset_sha:
                raise ValueError(f"{output_id} does not bind the verified dataset hash")
            if output_id == "workingday-comparison" and len(payload.get("records", [])) != 48:
                raise ValueError("workingday-comparison must contain 48 records")
            if output_id == "pearson-correlation-matrix":
                matrix = payload.get("matrix", [])
                if len(matrix) != 7 or any(len(row) != 7 for row in matrix):
                    raise ValueError("pearson-correlation-matrix must be 7 by 7")
            if output_id == "plotly-hourly-explorer":
                expected_filter = {"hours": [0, 23], "workingday_values": [0, 1], "metric": "mean_rentals", "hidden_groups": []}
                if payload.get("defaultFilterState") != expected_filter:
                    raise ValueError("Plotly defaultFilterState differs from the contract")
                if '"uid"' in path.read_text(encoding="utf-8"):
                    raise ValueError("Plotly output contains trace uid")
            record["records"] = len(payload.get("records", [])) if isinstance(payload, dict) else None
        observed[output_id] = record
    return observed


def _manifest(
    environment: dict,
    data_manifest: dict,
    font_metadata: dict,
    notebook_path: Path,
    directory: Path,
    observed: dict,
    cell_outputs_observed: dict,
) -> dict:
    output_records = []
    for output_id, output_spec in OUTPUT_SPECS.items():
        details = observed[output_id]
        record = {
            "id": output_id,
            "kind": output_spec["kind"],
            "publicPath": f"/notebooks/python-data-tools/outputs/{output_spec['filename']}",
            "sha256": details["sha256"],
            "bytes": details["bytes"],
            "cellId": f"output-{output_id}",
            "sourceCellId": output_spec["sourceCellId"],
        }
        if output_spec["kind"] == "png":
            record.update({
                "width": details["dimensions"][0],
                "height": details["dimensions"][1],
                "dpi": 160,
                "fontPublicPath": font_metadata["file"]["publicPath"],
                "alt": output_spec["alt"],
            })
        output_records.append(record)
    return {
        "contractVersion": "python-data-tools-v1",
        "generatedAt": environment["generatedAt"],
        "dataset": {
            "publicPath": data_manifest["file"]["publicPath"],
            "sha256": data_manifest["file"]["sha256"],
        },
        "environment": {"path": "/notebooks/python-data-tools/environment.json", "sha256": sha256_file(ENVIRONMENT_PATH)},
        "font": {"path": font_metadata["file"]["publicPath"], "sha256": font_metadata["file"]["sha256"]},
        "notebook": {
            "publicPath": "/notebooks/python-data-tools/python-data-tools-bike-sharing.zh-CN.ipynb",
            "sha256": sha256_file(notebook_path),
        },
        "cellOutputs": {
            "publicPath": CELL_OUTPUTS_PUBLIC_PATH,
            **cell_outputs_observed,
        },
        "generator": {
            "path": "scripts/python-data-tools/generate-authoritative-outputs.py",
            "sha256": sha256_file(GENERATOR_PATH),
        },
        "outputs": output_records,
    }


def generate_transaction() -> tuple[Path, Path]:
    environment, data_manifest, font_metadata = preflight()
    transaction_dir = Path(tempfile.mkdtemp(prefix=".python-data-tools-outputs-", dir=NOTEBOOK_DIR))
    notebook_temp = NOTEBOOK_DIR / f".{NOTEBOOK_PATH.name}.{uuid.uuid4().hex}.tmp"
    try:
        notebook = _load_builder().build_notebook()
        previous_output_dir = os.environ.get("ML_ATLAS_OUTPUT_DIR")
        previous_path = os.environ.get("PATH", "")
        os.environ["ML_ATLAS_OUTPUT_DIR"] = str(transaction_dir)
        os.environ["PATH"] = f"{Path(sys.executable).parent}{os.pathsep}{previous_path}"
        try:
            client = NotebookClient(
                notebook,
                timeout=120,
                kernel_name="python3",
                allow_errors=False,
                record_timing=False,
                resources={"metadata": {"path": str(NOTEBOOK_DIR)}},
            )
            client.execute(cwd=str(NOTEBOOK_DIR))
        finally:
            if previous_output_dir is None:
                os.environ.pop("ML_ATLAS_OUTPUT_DIR", None)
            else:
                os.environ["ML_ATLAS_OUTPUT_DIR"] = previous_output_dir
            os.environ["PATH"] = previous_path
        _strip_transient_metadata(notebook)
        _write_notebook(notebook_temp, notebook)
        extract_cell_output_previews(notebook, transaction_dir, sha256_file(notebook_temp))
        observed = validate_outputs(transaction_dir, data_manifest["file"]["sha256"])
        cell_outputs_observed = validate_cell_output_previews(transaction_dir, notebook_temp)
        manifest = _manifest(
            environment,
            data_manifest,
            font_metadata,
            notebook_temp,
            transaction_dir,
            observed,
            cell_outputs_observed,
        )
        (transaction_dir / "manifest.json").write_bytes(_json_bytes(manifest))
        return transaction_dir, notebook_temp
    except Exception:
        shutil.rmtree(transaction_dir, ignore_errors=True)
        notebook_temp.unlink(missing_ok=True)
        raise


def compare_committed(transaction_dir: Path, notebook_temp: Path) -> None:
    differences = []
    if not NOTEBOOK_PATH.is_file() or NOTEBOOK_PATH.read_bytes() != notebook_temp.read_bytes():
        differences.append(str(NOTEBOOK_PATH.relative_to(REPO_ROOT)))
    generated_files = {
        path.relative_to(transaction_dir)
        for path in transaction_dir.rglob("*")
        if path.is_file()
    }
    committed_files = {
        path.relative_to(OUTPUT_DIR)
        for path in OUTPUT_DIR.rglob("*")
        if path.is_file()
    } if OUTPUT_DIR.is_dir() else set()
    for relative_path in sorted(generated_files | committed_files):
        generated = transaction_dir / relative_path
        committed = OUTPUT_DIR / relative_path
        if not generated.is_file() or not committed.is_file() or committed.read_bytes() != generated.read_bytes():
            differences.append(str(committed.relative_to(REPO_ROOT)))
    if differences:
        raise RuntimeError(f"Committed authoritative artifacts differ: {', '.join(differences)}")


def publish(
    transaction_dir: Path,
    notebook_temp: Path,
    rename_operation: Callable[[Path, Path], None] | None = None,
) -> None:
    rename = rename_operation or (lambda source, target: source.rename(target))
    token = uuid.uuid4().hex
    output_backup = NOTEBOOK_DIR / f".outputs.{token}.bak"
    notebook_backup = NOTEBOOK_DIR / f".{NOTEBOOK_PATH.name}.{token}.bak"
    output_replaced = False
    notebook_replaced = False
    try:
        if OUTPUT_DIR.exists():
            rename(OUTPUT_DIR, output_backup)
        rename(transaction_dir, OUTPUT_DIR)
        output_replaced = True
        if NOTEBOOK_PATH.exists():
            rename(NOTEBOOK_PATH, notebook_backup)
        rename(notebook_temp, NOTEBOOK_PATH)
        notebook_replaced = True
    except Exception:
        if notebook_replaced:
            NOTEBOOK_PATH.unlink(missing_ok=True)
        if notebook_backup.exists():
            rename(notebook_backup, NOTEBOOK_PATH)
        if output_replaced:
            shutil.rmtree(OUTPUT_DIR, ignore_errors=True)
        if output_backup.exists():
            rename(output_backup, OUTPUT_DIR)
        raise
    finally:
        shutil.rmtree(output_backup, ignore_errors=True)
        notebook_backup.unlink(missing_ok=True)
        shutil.rmtree(transaction_dir, ignore_errors=True)
        notebook_temp.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Regenerate in a transaction and byte-compare committed artifacts")
    args = parser.parse_args()
    transaction_dir, notebook_temp = generate_transaction()
    try:
        if args.check:
            compare_committed(transaction_dir, notebook_temp)
            print("Python Data Tools authoritative artifacts are byte-identical.")
        else:
            publish(transaction_dir, notebook_temp)
            print(f"Published {NOTEBOOK_PATH.relative_to(REPO_ROOT)} and {len(OUTPUT_SPECS)} outputs.")
    finally:
        shutil.rmtree(transaction_dir, ignore_errors=True)
        notebook_temp.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
