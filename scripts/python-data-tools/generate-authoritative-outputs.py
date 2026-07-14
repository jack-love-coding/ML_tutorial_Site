#!/usr/bin/env python3
"""Execute the Chinese master notebook and atomically publish authoritative outputs."""

from __future__ import annotations

import argparse
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


def _manifest(environment: dict, data_manifest: dict, font_metadata: dict, notebook_path: Path, directory: Path, observed: dict) -> dict:
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
        observed = validate_outputs(transaction_dir, data_manifest["file"]["sha256"])
        manifest = _manifest(environment, data_manifest, font_metadata, notebook_temp, transaction_dir, observed)
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
    for generated in sorted(transaction_dir.iterdir()):
        committed = OUTPUT_DIR / generated.name
        if not committed.is_file() or committed.read_bytes() != generated.read_bytes():
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
