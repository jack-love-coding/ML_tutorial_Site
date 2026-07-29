#!/usr/bin/env python3
"""Build Numerical Methods Batch 4 artifacts in an audited isolated environment."""

from __future__ import annotations

import argparse
import contextlib
import csv
import hashlib
import json
import math
import os
import platform
import shutil
import subprocess
import sys
import sysconfig
import tempfile
import urllib.request
import uuid
import venv
import zipfile
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterator


REPO_ROOT = Path(__file__).resolve().parents[2]
PHASE_DIR = REPO_ROOT / ".planning/phases/25-numerical-methods-batch-4-logistic-regression-optimization-a"
RESEARCH_PATH = PHASE_DIR / "25-RESEARCH.md"
REQUIREMENTS_PATH = REPO_ROOT / "public/notebooks/numerical-methods/requirements.txt"
DEFAULT_WHEEL_CACHE = REPO_ROOT / ".cache/numerical-methods/batch-4-wheelhouse"
CACHE_MANIFEST_NAME = "batch-4-wheel-cache-manifest.json"
CONTRACT_VERSION = "numerical-methods-batch-4-v1"
DATASET_DIR = REPO_ROOT / "public/datasets/numerical-methods"
DATASET_PATH = DATASET_DIR / "banknote-authentication.csv"
DATASET_MANIFEST_PATH = DATASET_DIR / "banknote-authentication-manifest.json"
DATA_DICTIONARY_PATH = DATASET_DIR / "banknote-authentication-data-dictionary.json"
NOTEBOOK_DIR = REPO_ROOT / "public/notebooks/numerical-methods"
OUTPUT_DIR = NOTEBOOK_DIR / "batch-4-outputs"
NOTEBOOK_PATH = NOTEBOOK_DIR / "banknote-logistic-optimization.zh-CN.ipynb"
GENERATOR_PATH = Path(__file__).resolve()
OPTIMIZATION_OUTPUT_FILE = "optimization-summary.json"
DIAGNOSTICS_OUTPUT_FILE = "training-diagnostics-summary.json"
TRACE_JSON_FILE = "banknote-training-traces.json"
TRACE_CSV_FILE = "banknote-training-traces.csv"
OUTPUT_MANIFEST_FILE = "manifest.json"
SOURCE_URL = "https://archive.ics.uci.edu/static/public/267/banknote+authentication.zip"
SOURCE_PAGE = "https://archive.ics.uci.edu/dataset/267/banknote%2Bauthentication"
SOURCE_DOI = "10.24432/C55P57"
SOURCE_LICENSE = "CC BY 4.0"
SOURCE_ZIP_SHA256 = "1e2acd9a2085fadf3d8145c12d3d22af853320d52294a6590c2eaf75fdc05227"
SOURCE_MEMBER = "data_banknote_authentication.txt"
SOURCE_MEMBER_BYTES = 46_400
SOURCE_MEMBER_SHA256 = "d0539aaed2139ba7a587b3e34fb345ce503ff7d5d33dbf9912d8e195ce425cb9"
DATASET_HEADER = ["banknote_id", "variance", "skewness", "curtosis", "entropy", "class", "split"]
FEATURES = ["variance", "skewness", "curtosis", "entropy"]
SPLIT_SEEDS = {"trainHoldout": 20260725, "validationTest": 20260726}
LOCKED_MEANS = {
    "variance": 0.46886307781249986,
    "skewness": 1.9775978456250036,
    "curtosis": 1.3202396866562518,
    "entropy": -1.1418097847916664,
}
LOCKED_SCALES = {
    "variance": 2.8049705227712813,
    "skewness": 5.81400805653475,
    "curtosis": 4.234924404032209,
    "entropy": 2.0726581960156034,
}
BOOTSTRAP_COMMAND = (
    "python3 scripts/numerical-methods/generate-batch-4-notebook.py "
    "--bootstrap-environment-cache --wheel-cache .cache/numerical-methods/batch-4-wheelhouse"
)

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

APPROVAL_ANCHORS = (
    "approved scikit-learn==1.9.0",
    "https://pypi.org/project/scikit-learn/1.9.0/",
    "https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html",
    "https://github.com/scikit-learn/scikit-learn",
    "No alternate package name or publisher was approved.",
)

PARAMETER_ORDER = ["variance", "skewness", "curtosis", "entropy", "intercept"]
RUN_ORDER = [
    "raw-fixed",
    "standardized-too-small",
    "standardized-stable",
    "standardized-too-large",
    "standardized-armijo",
]
TRACE_CSV_HEADER = [
    "contract_version",
    "run_id",
    "iteration",
    "feature_space",
    "method",
    "train_bce",
    "validation_bce",
    "objective",
    "gradient_norm",
    "parameter_step_norm",
    "accepted_step_size",
    "backtrack_count",
    "relative_objective_change",
    "is_best_validation",
    "w_variance",
    "w_skewness",
    "w_curtosis",
    "w_entropy",
    "intercept",
]


class Batch4Error(RuntimeError):
    """Fail-closed Batch 4 build error."""


@dataclass(frozen=True)
class IsolatedEnvironment:
    root: Path
    python: Path
    kernel_name: str
    kernel_prefix: Path
    environment: dict[str, str]
    observed_versions: dict[str, str]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def json_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode("utf-8")


def run(command: list[str], *, environment: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
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
        raise Batch4Error(f"Command failed ({completed.returncode}): {rendered}\n{completed.stdout}")
    return completed


def verify_approval() -> None:
    if not RESEARCH_PATH.is_file():
        raise Batch4Error(f"Missing durable approval record: {RESEARCH_PATH.relative_to(REPO_ROOT)}")
    research = RESEARCH_PATH.read_text(encoding="utf-8")
    missing = [anchor for anchor in APPROVAL_ANCHORS if anchor not in research]
    if missing:
        raise Batch4Error(f"Exact scikit-learn approval or official identity anchor is missing: {missing}")


def read_pins() -> dict[str, str]:
    if not REQUIREMENTS_PATH.is_file():
        raise Batch4Error(f"Missing requirements: {REQUIREMENTS_PATH.relative_to(REPO_ROOT)}")
    pins: dict[str, str] = {}
    for line_number, raw_line in enumerate(REQUIREMENTS_PATH.read_text(encoding="utf-8").splitlines(), start=1):
        line = raw_line.strip()
        if not line:
            continue
        if line.count("==") != 1:
            raise Batch4Error(f"Requirement line {line_number} is not one exact pin: {raw_line!r}")
        name, version = line.split("==", 1)
        normalized = name.lower()
        if normalized in pins or not name or not version:
            raise Batch4Error(f"Duplicate or invalid requirement line {line_number}: {raw_line!r}")
        pins[normalized] = version
    if pins != {
        "numpy": "2.4.6",
        "pandas": "3.0.3",
        "scipy": "1.17.1",
        "nbformat": "5.10.4",
        "nbclient": "0.11.0",
        "jupyterlab": "4.6.1",
        "ipykernel": "7.3.0",
        "scikit-learn": "1.9.0",
    }:
        raise Batch4Error(f"Requirements do not match the approved eight-pin contract: {pins}")
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


def wheel_entries(directory: Path) -> list[dict[str, Any]]:
    wheels = sorted(path for path in directory.iterdir() if path.is_file() and path.suffix == ".whl")
    if not wheels:
        raise Batch4Error("Bootstrap downloaded no wheel files")
    unexpected = sorted(path.name for path in directory.iterdir() if path.is_file() and path.suffix != ".whl")
    if unexpected:
        raise Batch4Error(f"Bootstrap must contain wheels only before its manifest is written: {unexpected}")
    return [{"file": path.name, "bytes": path.stat().st_size, "sha256": sha256_file(path)} for path in wheels]


def bootstrap_environment_cache(wheel_cache: Path) -> None:
    verify_approval()
    pins = read_pins()
    wheel_cache = wheel_cache.resolve()
    wheel_cache.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix=".batch-4-wheelhouse-", dir=wheel_cache.parent))
    backup = wheel_cache.parent / f".{wheel_cache.name}.{uuid.uuid4().hex}.bak"
    bootstrap_environment = os.environ.copy()
    bootstrap_environment.update({"PIP_DISABLE_PIP_VERSION_CHECK": "1", "PIP_NO_INPUT": "1"})
    try:
        completed = run(
            [
                sys.executable,
                "-m",
                "pip",
                "download",
                "--only-binary=:all:",
                "--dest",
                str(staging),
                "--requirement",
                str(REQUIREMENTS_PATH),
            ],
            environment=bootstrap_environment,
        )
        entries = wheel_entries(staging)
        manifest = {
            "contractVersion": CONTRACT_VERSION,
            "bootstrapMode": "network-enabled-package-download-only",
            "requirements": {
                "path": str(REQUIREMENTS_PATH.relative_to(REPO_ROOT)),
                "sha256": sha256_file(REQUIREMENTS_PATH),
                "pins": pins,
            },
            "python": python_identity(),
            "platform": platform_identity(),
            "wheels": entries,
        }
        (staging / CACHE_MANIFEST_NAME).write_bytes(json_bytes(manifest))
        if wheel_cache.exists():
            wheel_cache.rename(backup)
        staging.rename(wheel_cache)
        shutil.rmtree(backup, ignore_errors=True)
        print(completed.stdout.rstrip())
        print(f"Bootstrapped {len(entries)} audited wheels in {wheel_cache.relative_to(REPO_ROOT)}")
    except BaseException:
        if wheel_cache.exists() and backup.exists():
            shutil.rmtree(wheel_cache, ignore_errors=True)
        if backup.exists():
            backup.rename(wheel_cache)
        raise
    finally:
        shutil.rmtree(staging, ignore_errors=True)
        shutil.rmtree(backup, ignore_errors=True)


def cache_failure(detail: str) -> Batch4Error:
    return Batch4Error(f"{detail}\nBootstrap exactly with:\n{BOOTSTRAP_COMMAND}")


def validate_environment_cache(wheel_cache: Path) -> dict[str, Any]:
    wheel_cache = wheel_cache.resolve()
    manifest_path = wheel_cache / CACHE_MANIFEST_NAME
    if not manifest_path.is_file():
        raise cache_failure(f"Batch 4 wheel cache is missing or has no {CACHE_MANIFEST_NAME}.")
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise cache_failure(f"Batch 4 wheel cache manifest is unreadable: {error}") from error
    expected = {
        "contractVersion": CONTRACT_VERSION,
        "requirementsSha256": sha256_file(REQUIREMENTS_PATH),
        "python": python_identity(),
        "platform": platform_identity(),
    }
    if manifest.get("contractVersion") != expected["contractVersion"]:
        raise cache_failure("Batch 4 wheel cache contract is stale.")
    if manifest.get("requirements", {}).get("sha256") != expected["requirementsSha256"]:
        raise cache_failure("Batch 4 wheel cache requirements hash is stale.")
    if manifest.get("requirements", {}).get("pins") != read_pins():
        raise cache_failure("Batch 4 wheel cache pin table is stale.")
    if manifest.get("python") != expected["python"] or manifest.get("platform") != expected["platform"]:
        raise cache_failure("Batch 4 wheel cache Python/platform identity is stale.")
    expected_wheels = manifest.get("wheels")
    if not isinstance(expected_wheels, list) or not expected_wheels:
        raise cache_failure("Batch 4 wheel cache has no audited wheel table.")
    observed_names: set[str] = set()
    for entry in expected_wheels:
        if not isinstance(entry, dict) or not isinstance(entry.get("file"), str):
            raise cache_failure("Batch 4 wheel cache contains an invalid wheel entry.")
        path = wheel_cache / entry["file"]
        observed_names.add(path.name)
        if (
            not path.is_file()
            or path.stat().st_size != entry.get("bytes")
            or sha256_file(path) != entry.get("sha256")
        ):
            raise cache_failure(f"Batch 4 wheel cache artifact drifted: {path.name}")
    actual_names = {path.name for path in wheel_cache.glob("*.whl")}
    if actual_names != observed_names:
        raise cache_failure("Batch 4 wheel cache has added or missing wheel files.")
    return manifest


def environment_for(root: Path) -> dict[str, str]:
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


def venv_python(root: Path) -> Path:
    return root / ("Scripts/python.exe" if os.name == "nt" else "bin/python")


def verify_imports_and_kernel(
    python: Path,
    pins: dict[str, str],
    kernel_name: str,
    environment: dict[str, str],
) -> dict[str, str]:
    payload = json.dumps({"pins": pins, "imports": IMPORT_NAMES, "kernelName": kernel_name})
    code = r'''
import importlib
import importlib.metadata
import json
import os
from pathlib import Path
import sys

from jupyter_client.kernelspec import KernelSpecManager

payload = json.loads(os.environ["ML_ATLAS_BATCH4_VERIFY_PAYLOAD"])
observed = {}
for distribution, expected in payload["pins"].items():
    module = payload["imports"][distribution]
    importlib.import_module(module)
    version = importlib.metadata.version(distribution)
    if version != expected:
        raise RuntimeError(f"{distribution}: expected {expected}, observed {version}")
    observed[distribution] = version

manager = KernelSpecManager()
spec = manager.get_kernel_spec(payload["kernelName"])
if Path(spec.argv[0]).resolve() != Path(sys.executable).resolve():
    raise RuntimeError(f"Kernel interpreter drift: {spec.argv[0]} != {sys.executable}")
print(json.dumps({"versions": observed, "kernelName": payload["kernelName"], "kernelArgv0": spec.argv[0]}, sort_keys=True))
'''
    worker_environment = environment.copy()
    worker_environment["ML_ATLAS_BATCH4_VERIFY_PAYLOAD"] = payload
    output = run([str(python), "-c", code], environment=worker_environment).stdout.strip().splitlines()
    if not output:
        raise Batch4Error("Isolated verification worker produced no result")
    result = json.loads(output[-1])
    if result.get("kernelName") != kernel_name or result.get("versions") != pins:
        raise Batch4Error(f"Isolated environment verification drifted: {result}")
    return result["versions"]


@contextlib.contextmanager
def isolated_environment(wheel_cache: Path) -> Iterator[IsolatedEnvironment]:
    validate_environment_cache(wheel_cache)
    pins = read_pins()
    temporary = tempfile.TemporaryDirectory(prefix="ml-atlas-batch4-environment-")
    root = Path(temporary.name)
    python = venv_python(root / "venv")
    kernel_prefix = root / "kernel-prefix"
    kernel_name = f"ml-atlas-batch4-{uuid.uuid4().hex}"
    environment = environment_for(root)
    try:
        # The repository's uv-managed CPython must be symlinked on macOS;
        # copying its launcher leaves ensurepip unable to resolve the runtime.
        venv.EnvBuilder(with_pip=True, clear=True, symlinks=(os.name != "nt")).create(root / "venv")
        run(
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
        run(
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
                "ML Atlas Numerical Methods Batch 4",
            ],
            environment=environment,
        )
        observed = verify_imports_and_kernel(python, pins, kernel_name, environment)
        yield IsolatedEnvironment(root, python, kernel_name, kernel_prefix, environment, observed)
    finally:
        temporary.cleanup()


def verify_environment(wheel_cache: Path) -> None:
    root: Path | None = None
    with isolated_environment(wheel_cache) as isolated:
        root = isolated.root
        print("Verified isolated Batch 4 environment:")
        for distribution, version in isolated.observed_versions.items():
            print(f"  {distribution}=={version}")
        print(f"  kernel={isolated.kernel_name}")
    if root is None or root.exists():
        raise Batch4Error("Temporary Batch 4 environment or kernelspec was not removed")
    print("Removed the temporary venv, kernelspec, and scoped Jupyter/IPython state.")


def download_source_zip(destination: Path) -> None:
    request = urllib.request.Request(
        SOURCE_URL,
        headers={"User-Agent": "ML-Atlas-Batch-4-Source-Refresh/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response, destination.open("wb") as output:
            total = 0
            while True:
                chunk = response.read(64 * 1024)
                if not chunk:
                    break
                total += len(chunk)
                if total > 2 * 1024 * 1024:
                    raise Batch4Error("UCI Banknote ZIP exceeded the bounded 2 MiB refresh limit")
                output.write(chunk)
    except Batch4Error:
        raise
    except Exception as error:
        raise Batch4Error(f"Unable to acquire the official UCI Banknote ZIP: {error}") from error
    observed = sha256_file(destination)
    if observed != SOURCE_ZIP_SHA256:
        raise Batch4Error(f"UCI Banknote ZIP hash drift: expected {SOURCE_ZIP_SHA256}, observed {observed}")


def extract_verified_member(zip_path: Path, destination: Path) -> None:
    try:
        with zipfile.ZipFile(zip_path) as archive:
            if SOURCE_MEMBER not in archive.namelist():
                raise Batch4Error(f"UCI ZIP does not contain {SOURCE_MEMBER}")
            info = archive.getinfo(SOURCE_MEMBER)
            if info.file_size != SOURCE_MEMBER_BYTES:
                raise Batch4Error(
                    f"UCI member byte drift: expected {SOURCE_MEMBER_BYTES}, observed {info.file_size}"
                )
            with archive.open(info) as source, destination.open("wb") as output:
                shutil.copyfileobj(source, output)
    except Batch4Error:
        raise
    except (OSError, zipfile.BadZipFile) as error:
        raise Batch4Error(f"Unable to read the verified UCI ZIP: {error}") from error
    observed = sha256_file(destination)
    if destination.stat().st_size != SOURCE_MEMBER_BYTES or observed != SOURCE_MEMBER_SHA256:
        raise Batch4Error(
            f"UCI member integrity drift: expected {SOURCE_MEMBER_SHA256}, observed {observed}"
        )


def run_dataset_worker(isolated: IsolatedEnvironment, raw_path: Path, output_dir: Path) -> dict[str, Any]:
    worker_code = r'''
import json
import os
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

raw_path = Path(os.environ["ML_ATLAS_BATCH4_RAW_PATH"])
output_dir = Path(os.environ["ML_ATLAS_BATCH4_REFRESH_OUTPUT"])
columns = ["variance", "skewness", "curtosis", "entropy", "class"]
features = columns[:4]
frame = pd.read_csv(raw_path, header=None, names=columns)
if frame.shape != (1372, 5):
    raise RuntimeError(f"Expected 1372x5 source rows, observed {frame.shape}")
if frame.isna().any().any():
    raise RuntimeError("Source contains missing values")
matrix = frame[features].to_numpy(dtype=np.float64)
if not np.isfinite(matrix).all():
    raise RuntimeError("Source contains non-finite feature values")
targets = frame["class"].to_numpy(dtype=np.int64)
if set(np.unique(targets).tolist()) != {0, 1}:
    raise RuntimeError("Source target must contain exactly class 0 and class 1")
if frame["class"].tolist() != targets.tolist():
    raise RuntimeError("Source target contains non-integer values")

row_indices = np.arange(len(frame), dtype=np.int64)
train_indices, holdout_indices = train_test_split(
    row_indices,
    test_size=412,
    stratify=targets,
    random_state=20260725,
)
validation_indices, test_indices = train_test_split(
    holdout_indices,
    test_size=206,
    stratify=targets[holdout_indices],
    random_state=20260726,
)

split = np.empty(len(frame), dtype=object)
split[train_indices] = "train"
split[validation_indices] = "validation"
split[test_indices] = "test"
if set(split.tolist()) != {"train", "validation", "test"}:
    raise RuntimeError("Split assignment is incomplete")

normalized = frame.copy()
normalized.insert(0, "banknote_id", np.arange(1, len(frame) + 1, dtype=np.int64))
normalized["class"] = targets
normalized["split"] = split
normalized.to_csv(
    output_dir / "banknote-authentication.csv",
    index=False,
    columns=["banknote_id", *features, "class", "split"],
    lineterminator="\n",
)

train_matrix = matrix[train_indices]
means = train_matrix.mean(axis=0)
scales = train_matrix.std(axis=0, ddof=0)
metadata = {
    "rowCount": int(len(frame)),
    "classCounts": {str(value): int((targets == value).sum()) for value in (0, 1)},
    "splitCounts": {name: int((split == name).sum()) for name in ("train", "validation", "test")},
    "splitClassCounts": {
        name: {str(value): int(((split == name) & (targets == value)).sum()) for value in (0, 1)}
        for name in ("train", "validation", "test")
    },
    "trainMeans": {feature: float(value) for feature, value in zip(features, means, strict=True)},
    "trainScales": {feature: float(value) for feature, value in zip(features, scales, strict=True)},
}
(output_dir / "worker-metadata.json").write_text(
    json.dumps(metadata, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
    encoding="utf-8",
)
print(json.dumps(metadata, sort_keys=True))
'''
    environment = isolated.environment.copy()
    environment.update(
        {
            "ML_ATLAS_BATCH4_RAW_PATH": str(raw_path),
            "ML_ATLAS_BATCH4_REFRESH_OUTPUT": str(output_dir),
        }
    )
    run([str(isolated.python), "-c", worker_code], environment=environment)
    metadata_path = output_dir / "worker-metadata.json"
    if not metadata_path.is_file():
        raise Batch4Error("Isolated dataset worker did not produce metadata")
    return json.loads(metadata_path.read_text(encoding="utf-8"))


def validate_normalized_dataset(path: Path, metadata: dict[str, Any]) -> None:
    rows: list[dict[str, str]] = []
    with path.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != DATASET_HEADER:
            raise Batch4Error(f"Normalized CSV header drift: {reader.fieldnames}")
        rows = list(reader)
    if len(rows) != 1372:
        raise Batch4Error(f"Normalized CSV row drift: {len(rows)}")
    ids: set[int] = set()
    class_counts: Counter[str] = Counter()
    split_counts: Counter[str] = Counter()
    split_class_counts: dict[str, Counter[str]] = defaultdict(Counter)
    for expected_id, row in enumerate(rows, start=1):
        try:
            banknote_id = int(row["banknote_id"])
            values = [float(row[feature]) for feature in FEATURES]
        except (TypeError, ValueError) as error:
            raise Batch4Error(f"Invalid normalized CSV row {expected_id}: {error}") from error
        if banknote_id != expected_id or banknote_id in ids:
            raise Batch4Error(f"Normalized banknote_id is not stable one-based order at row {expected_id}")
        if not all(math.isfinite(value) for value in values):
            raise Batch4Error(f"Non-finite normalized feature at row {expected_id}")
        if row["class"] not in {"0", "1"} or row["split"] not in {"train", "validation", "test"}:
            raise Batch4Error(f"Invalid class or split at normalized row {expected_id}")
        ids.add(banknote_id)
        class_counts[row["class"]] += 1
        split_counts[row["split"]] += 1
        split_class_counts[row["split"]][row["class"]] += 1
    expected_class_counts = {"0": 762, "1": 610}
    expected_split_counts = {"train": 960, "validation": 206, "test": 206}
    expected_split_classes = {
        "train": {"0": 533, "1": 427},
        "validation": {"0": 115, "1": 91},
        "test": {"0": 114, "1": 92},
    }
    if dict(class_counts) != expected_class_counts or metadata.get("classCounts") != expected_class_counts:
        raise Batch4Error("Normalized class counts do not match the locked contract")
    if dict(split_counts) != expected_split_counts or metadata.get("splitCounts") != expected_split_counts:
        raise Batch4Error("Normalized split counts do not match the locked contract")
    observed_split_classes = {name: dict(split_class_counts[name]) for name in expected_split_classes}
    if observed_split_classes != expected_split_classes or metadata.get("splitClassCounts") != expected_split_classes:
        raise Batch4Error("Normalized per-split class counts do not match the locked contract")
    for feature in FEATURES:
        observed_mean = metadata.get("trainMeans", {}).get(feature)
        observed_scale = metadata.get("trainScales", {}).get(feature)
        if not isinstance(observed_mean, (int, float)) or abs(observed_mean - LOCKED_MEANS[feature]) > 1e-15:
            raise Batch4Error(f"Locked training mean drift for {feature}: {observed_mean}")
        if not isinstance(observed_scale, (int, float)) or abs(observed_scale - LOCKED_SCALES[feature]) > 1e-15:
            raise Batch4Error(f"Locked training scale drift for {feature}: {observed_scale}")


def dataset_manifest(csv_path: Path, metadata: dict[str, Any], isolated: IsolatedEnvironment) -> dict[str, Any]:
    return {
        "contractVersion": CONTRACT_VERSION,
        "source": {
            "title": "Banknote Authentication",
            "officialPage": SOURCE_PAGE,
            "doi": SOURCE_DOI,
            "license": SOURCE_LICENSE,
            "zip": {"url": SOURCE_URL, "sha256": SOURCE_ZIP_SHA256},
            "member": {
                "name": SOURCE_MEMBER,
                "bytes": SOURCE_MEMBER_BYTES,
                "sha256": SOURCE_MEMBER_SHA256,
            },
        },
        "normalizedDataset": {
            "publicPath": "/datasets/numerical-methods/banknote-authentication.csv",
            "sha256": sha256_file(csv_path),
            "bytes": csv_path.stat().st_size,
            "schema": DATASET_HEADER,
            "rowCount": 1372,
            "classCounts": metadata["classCounts"],
        },
        "split": {
            "seeds": SPLIT_SEEDS,
            "algorithmCalls": [
                "train_test_split(ids, test_size=412, stratify=y, random_state=20260725)",
                "train_test_split(holdout_ids, test_size=206, stratify=holdout_y, random_state=20260726)",
            ],
            "counts": metadata["splitCounts"],
            "classCounts": metadata["splitClassCounts"],
        },
        "preprocessing": {
            "fitSplit": "train",
            "ddof": 0,
            "features": FEATURES,
            "trainMeans": metadata["trainMeans"],
            "trainScales": metadata["trainScales"],
        },
        "environment": {
            "requirementsPath": "public/notebooks/numerical-methods/requirements.txt",
            "requirementsSha256": sha256_file(REQUIREMENTS_PATH),
            "python": python_identity(),
            "packages": isolated.observed_versions,
            "installation": "pip --no-index --find-links=<audited-wheel-cache>",
            "kernelSelection": "unique temp-prefix kernelspec",
        },
    }


def data_dictionary() -> dict[str, Any]:
    return {
        "contractVersion": CONTRACT_VERSION,
        "dataset": "UCI Banknote Authentication",
        "attribution": {
            "officialPage": SOURCE_PAGE,
            "doi": SOURCE_DOI,
            "license": SOURCE_LICENSE,
            "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
            "classMeaning": "The UCI source does not define semantic meanings for class 0 and class 1.",
        },
        "fields": [
            {
                "name": "banknote_id",
                "unit": "row id",
                "zh-CN": "按 UCI 原始文件顺序生成的一基稳定行号。",
                "en": "One-based stable row id following the UCI source order.",
            },
            {
                "name": "variance",
                "unit": "continuous wavelet feature",
                "zh-CN": "UCI 提供的小波变换图像 variance 特征。",
                "en": "UCI variance feature derived from the wavelet-transformed image.",
            },
            {
                "name": "skewness",
                "unit": "continuous wavelet feature",
                "zh-CN": "UCI 提供的小波变换图像 skewness 特征。",
                "en": "UCI skewness feature derived from the wavelet-transformed image.",
            },
            {
                "name": "curtosis",
                "unit": "continuous wavelet feature",
                "zh-CN": "UCI 源文件拼写为 curtosis 的连续特征；本项目保留该拼写。",
                "en": "Continuous feature spelled curtosis by the UCI source; this project preserves that spelling.",
            },
            {
                "name": "entropy",
                "unit": "continuous wavelet feature",
                "zh-CN": "UCI 提供的小波变换图像 entropy 特征。",
                "en": "UCI entropy feature derived from the wavelet-transformed image.",
            },
            {
                "name": "class",
                "unit": "binary category",
                "zh-CN": "UCI 提供的 class 0 或 class 1；源页面未定义两类的人类语义。",
                "en": "UCI class 0 or class 1; the source page does not define human-readable meanings.",
            },
            {
                "name": "split",
                "unit": "dataset partition",
                "zh-CN": "固定的 train、validation 或 test 分配；划分后不再重排。",
                "en": "Persisted train, validation, or test assignment with no later reshuffling.",
            },
        ],
    }


def publish_dataset_transaction(transaction_dir: Path) -> None:
    destinations = [DATASET_PATH, DATASET_MANIFEST_PATH, DATA_DICTIONARY_PATH]
    sources = [transaction_dir / path.name for path in destinations]
    token = uuid.uuid4().hex
    backups = [path.with_name(f".{path.name}.{token}.bak") for path in destinations]
    try:
        for destination, backup in zip(destinations, backups, strict=True):
            if destination.exists():
                destination.replace(backup)
        for index, (source, destination) in enumerate(zip(sources, destinations, strict=True)):
            source.replace(destination)
            if index == 0 and os.environ.get("ML_ATLAS_BATCH4_REFRESH_FAIL_AFTER_REPLACE") == "1":
                raise Batch4Error("Injected refresh failure after the first replacement")
    except BaseException:
        for destination, backup in zip(destinations, backups, strict=True):
            if destination.exists():
                destination.unlink()
            if backup.exists():
                backup.replace(destination)
        raise
    finally:
        for backup in backups:
            backup.unlink(missing_ok=True)


def refresh_source(wheel_cache: Path) -> None:
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    transaction_dir = Path(tempfile.mkdtemp(prefix=".banknote-authentication-refresh-", dir=DATASET_DIR))
    zip_path = transaction_dir / "banknote-authentication.zip"
    raw_path = transaction_dir / SOURCE_MEMBER
    isolated_root: Path | None = None
    try:
        download_source_zip(zip_path)
        extract_verified_member(zip_path, raw_path)
        with isolated_environment(wheel_cache) as isolated:
            isolated_root = isolated.root
            metadata = run_dataset_worker(isolated, raw_path, transaction_dir)
            csv_path = transaction_dir / DATASET_PATH.name
            validate_normalized_dataset(csv_path, metadata)
            (transaction_dir / DATASET_MANIFEST_PATH.name).write_bytes(
                json_bytes(dataset_manifest(csv_path, metadata, isolated))
            )
            (transaction_dir / DATA_DICTIONARY_PATH.name).write_bytes(json_bytes(data_dictionary()))
        if isolated_root is None or isolated_root.exists():
            raise Batch4Error("Refresh temporary venv, kernelspec, or Jupyter state was not removed")
        publish_dataset_transaction(transaction_dir)
        print(f"Published {DATASET_PATH.relative_to(REPO_ROOT)}")
        print(f"Published {DATASET_MANIFEST_PATH.relative_to(REPO_ROOT)}")
        print(f"Published {DATA_DICTIONARY_PATH.relative_to(REPO_ROOT)}")
        print("Removed the refresh venv, kernelspec, and scoped Jupyter/IPython state.")
    finally:
        shutil.rmtree(transaction_dir, ignore_errors=True)


def locked_constants() -> dict[str, Any]:
    return {
        "contractVersion": CONTRACT_VERSION,
        "parameterOrder": PARAMETER_ORDER,
        "l2": 1e-3,
        "maxIterations": 500,
        "gradientTolerance": 1e-5,
        "relativeLossTolerance": 1e-10,
        "parameterStepTolerance": 1e-7,
        "validationMinDelta": 1e-7,
        "validationPatience": 60,
        "armijo": {
            "initialStep": 32.0,
            "c": 1e-4,
            "rho": 0.5,
            "maxBacktracks": 30,
            "minimumStep": 1e-12,
        },
        "runs": {
            "raw-fixed": {"featureSpace": "raw", "method": "fixed", "step": 4.0},
            "standardized-too-small": {
                "featureSpace": "standardized",
                "method": "fixed",
                "step": 0.02,
            },
            "standardized-stable": {
                "featureSpace": "standardized",
                "method": "fixed",
                "step": 4.0,
            },
            "standardized-too-large": {
                "featureSpace": "standardized",
                "method": "fixed",
                "step": 32.0,
            },
            "standardized-armijo": {
                "featureSpace": "standardized",
                "method": "armijo",
                "initialStep": 32.0,
            },
        },
        "finalThreshold": 0.5,
        "baselineC": 25 / 24,
    }


def constants_sha256() -> str:
    return hashlib.sha256(json_bytes(locked_constants())).hexdigest()


def notebook_cells(nbformat: Any, dataset_sha: str, constants_sha: str) -> list[Any]:
    def markdown(cell_id: str, source: str) -> Any:
        cell = nbformat.v4.new_markdown_cell(source.strip())
        cell["id"] = cell_id
        return cell

    def code(cell_id: str, source: str) -> Any:
        cell = nbformat.v4.new_code_cell(source.strip())
        cell["id"] = cell_id
        return cell

    load_source = r'''
from pathlib import Path
import csv
import hashlib
import json
import os
import sys

import numpy as np
import pandas
import scipy
from scipy.special import expit
import sklearn
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, log_loss, roc_auc_score

CONTRACT_VERSION = "numerical-methods-batch-4-v1"
EXPECTED_DATASET_SHA256 = "__DATASET_SHA256__"
EXPECTED_SCHEMA = ["banknote_id", "variance", "skewness", "curtosis", "entropy", "class", "split"]
FEATURES = ["variance", "skewness", "curtosis", "entropy"]
PARAMETER_ORDER = [*FEATURES, "intercept"]

def locate_dataset():
    candidates = [
        Path("banknote-authentication.csv"),
        Path(os.environ["ML_ATLAS_BANKNOTE_DATA_PATH"]) if os.environ.get("ML_ATLAS_BANKNOTE_DATA_PATH") else None,
        Path("public/datasets/numerical-methods/banknote-authentication.csv"),
    ]
    for candidate in candidates:
        if candidate is not None and candidate.is_file():
            return candidate
    raise FileNotFoundError("Place banknote-authentication.csv beside this Notebook or set ML_ATLAS_BANKNOTE_DATA_PATH")

dataset_path = locate_dataset()
observed_dataset_sha256 = hashlib.sha256(dataset_path.read_bytes()).hexdigest()
assert observed_dataset_sha256 == EXPECTED_DATASET_SHA256

# Pandas owns local loading. Schema, row ids, labels, split counts, and finiteness
# are validated before any feature or target array is converted to NumPy.
frame = pandas.read_csv(dataset_path)
assert list(frame.columns) == EXPECTED_SCHEMA
assert frame.shape == (1372, 7)
assert frame["banknote_id"].tolist() == list(range(1, 1373))
assert not frame.duplicated(subset=["banknote_id"]).any()
assert not frame.isna().any().any()
assert set(frame["class"].tolist()) == {0, 1}
assert set(frame["split"].tolist()) == {"train", "validation", "test"}
assert frame["split"].value_counts().to_dict() == {"train": 960, "validation": 206, "test": 206}
assert {
    split: frame.loc[frame["split"] == split, "class"].value_counts().sort_index().to_dict()
    for split in ("train", "validation", "test")
} == {
    "train": {0: 533, 1: 427},
    "validation": {0: 115, 1: 91},
    "test": {0: 114, 1: 92},
}
assert np.isfinite(frame[FEATURES].to_numpy(dtype=np.float64)).all()

split_frames = {name: frame.loc[frame["split"] == name] for name in ("train", "validation", "test")}
X_raw = {name: part[FEATURES].to_numpy(dtype=np.float64) for name, part in split_frames.items()}
y = {name: part["class"].to_numpy(dtype=np.float64) for name, part in split_frames.items()}
loader_record = {
    "library": "pandas",
    "call": "pandas.read_csv",
    "datasetPublicPath": "/datasets/numerical-methods/banknote-authentication.csv",
    "datasetSha256": observed_dataset_sha256,
    "schema": EXPECTED_SCHEMA,
    "schemaValidatedBeforeNumpy": True,
    "rowCount": int(len(frame)),
    "splitCounts": {name: int(len(part)) for name, part in split_frames.items()},
}
print(json.dumps({"loader": loader_record, "python": sys.version.split()[0]}, ensure_ascii=False, sort_keys=True))
'''.replace("__DATASET_SHA256__", dataset_sha)

    output_source = r'''
output_dir = Path(os.environ.get("ML_ATLAS_NUMERICAL_BATCH4_OUTPUT_DIR", "batch-4-outputs"))
output_dir.mkdir(parents=True, exist_ok=True)

def write_json(name, value):
    (output_dir / name).write_text(
        json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )

run_summaries = {
    run["runId"]: {
        "runId": run["runId"],
        "featureSpace": run["featureSpace"],
        "method": run["method"],
        "config": run["config"],
        "start": run["start"],
        "firstBacktrack": run["firstBacktrack"],
        "bestValidation": run["bestValidation"],
        "terminal": run["terminal"],
        "eligibleForFinalSelection": run["eligibleForFinalSelection"],
        "traceRowCount": len(run["trace"]),
    }
    for run in runs
}

optimization_summary = {
    "contractVersion": CONTRACT_VERSION,
    "outputId": "banknote-logistic-optimization-summary",
    "datasetSha256": observed_dataset_sha256,
    "constantsSha256": CONSTANTS_SHA256,
    "loader": loader_record,
    "preprocessing": preprocessing_record,
    "constants": CONSTANTS,
    "extremeLogitCheck": extreme_logit_check,
    "gradientCheck": gradient_check,
    "armijoCheck": armijo_check,
    "terminalFixtures": terminal_fixtures,
    "runOrder": RUN_ORDER,
    "runs": run_summaries,
    "finalSelection": {
        "rule": "mathematical-convergence eligibility, then lowest best validation BCE",
        "selectedRunId": selected_run["runId"],
        "selectedIteration": selected_run["bestValidation"]["iteration"],
        "transientUnstableMinimumCannotWin": True,
    },
    "ownership": "optimization owns the five-run numerical comparison",
}

diagnostic_steps = {
    "raw-fixed": {
        "visible": "validation improves and then degrades while steps remain large",
        "plausibleCause": "raw feature scales make the fixed step poorly conditioned",
        "changeOneVariable": "standardize features while keeping the step at 4.0",
        "expectedNextRun": "smoother descent and mathematical convergence",
    },
    "standardized-too-small": {
        "visible": "loss falls safely but the gradient remains large at the iteration cap",
        "plausibleCause": "the fixed step is too small",
        "changeOneVariable": "increase the fixed step from 0.02 to 4.0",
        "expectedNextRun": "reach the gradient tolerance within 500 updates",
    },
    "standardized-stable": {
        "visible": "training and validation losses settle with a small gradient",
        "plausibleCause": "standardization makes the fixed step usable",
        "changeOneVariable": "replace the fixed step with Armijo from 32.0",
        "expectedNextRun": "reject unsafe trials and converge in fewer accepted updates",
    },
    "standardized-too-large": {
        "visible": "a low transient validation point is followed by deterioration",
        "plausibleCause": "the fixed step overshoots",
        "changeOneVariable": "use Armijo backtracking instead of accepting 32.0",
        "expectedNextRun": "accept 16.0 first and retain convergence eligibility",
    },
    "standardized-armijo": {
        "visible": "the first trial is rejected and the gradient tolerance is reached",
        "plausibleCause": "sufficient decrease adapts the usable step",
        "changeOneVariable": "keep the method and inspect the selected test endpoint",
        "expectedNextRun": "the endpoint agrees closely with the library baseline",
    },
}

diagnostics_summary = {
    "contractVersion": CONTRACT_VERSION,
    "outputId": "banknote-training-diagnostics-summary",
    "datasetSha256": observed_dataset_sha256,
    "constantsSha256": CONSTANTS_SHA256,
    "runOrder": RUN_ORDER,
    "diagnostics": [
        {"runId": run_id, **diagnostic_steps[run_id], "terminal": run_summaries[run_id]["terminal"]}
        for run_id in RUN_ORDER
    ],
    "selectedRunId": selected_run["runId"],
    "finalReport": final_report,
    "baseline": baseline_report,
    "comparison": baseline_comparison,
    "ownership": "training-diagnostics owns cross-run reading and the compact final report",
}

trace_file = {
    "contractVersion": CONTRACT_VERSION,
    "datasetSha256": observed_dataset_sha256,
    "constantsSha256": CONSTANTS_SHA256,
    "parameterOrder": PARAMETER_ORDER,
    "runs": runs,
}

write_json("optimization-summary.json", optimization_summary)
write_json("training-diagnostics-summary.json", diagnostics_summary)
write_json("banknote-training-traces.json", trace_file)

csv_header = [
    "contract_version", "run_id", "iteration", "feature_space", "method",
    "train_bce", "validation_bce", "objective", "gradient_norm", "parameter_step_norm",
    "accepted_step_size", "backtrack_count", "relative_objective_change", "is_best_validation",
    "w_variance", "w_skewness", "w_curtosis", "w_entropy", "intercept",
]
with (output_dir / "banknote-training-traces.csv").open("w", encoding="utf-8", newline="") as handle:
    writer = csv.writer(handle, lineterminator="\n")
    writer.writerow(csv_header)
    for run in runs:
        for point in run["trace"]:
            writer.writerow([
                CONTRACT_VERSION, run["runId"], point["iteration"], run["featureSpace"], run["method"],
                point["trainBce"], point["validationBce"], point["objective"], point["gradientNorm"],
                point["parameterStepNorm"], point["acceptedStepSize"], point["backtrackCount"],
                "" if point["relativeObjectiveChange"] is None else point["relativeObjectiveChange"],
                "true" if point["isBestValidation"] else "false", *point["parameters"],
            ])

print(json.dumps({
    "outputs": ["optimization-summary.json", "training-diagnostics-summary.json", "banknote-training-traces.json", "banknote-training-traces.csv"],
    "runRows": {run["runId"]: len(run["trace"]) for run in runs},
    "selectedRunId": selected_run["runId"],
}, ensure_ascii=False, sort_keys=True))
'''

    return [
        markdown(
            "banknote-optimization-intro",
            r'''
# 从稳定 BCE 到训练诊断：Banknote Logistic Regression

这份共享 Notebook 用同一份本地 UCI Banknote 快照连接“数值优化”和“训练诊断”。先验证数据与划分，再手写稳定 BCE、梯度、Armijo 和停止状态机，最后只在端点与 scikit-learn 比较。五条训练轨迹是唯一的真实数据运行；极端 logit 与失败条件是独立探针，不会伪装成第六条运行。
''',
        ),
        code("banknote-load-local-csv", load_source),
        markdown(
            "banknote-preprocessing",
            r'''
## 1. 只用训练集拟合尺度

固定划分已经写入 CSV。均值与总体标准差只从 960 条训练记录计算，验证集和测试集只复用这些量。这样缩放改变的是优化条件，而不是偷看留出数据。
''',
        ),
        code(
            "banknote-train-only-standardization",
            r'''
train_mean = X_raw["train"].mean(axis=0)
train_scale = X_raw["train"].std(axis=0, ddof=0)
assert np.all(train_scale > 0)
X_standardized = {name: (matrix - train_mean) / train_scale for name, matrix in X_raw.items()}

locked_mean = np.array([0.46886307781249986, 1.9775978456250036, 1.3202396866562518, -1.1418097847916664])
locked_scale = np.array([2.8049705227712813, 5.81400805653475, 4.234924404032209, 2.0726581960156034])
# The normalized decimal CSV can round-trip a few ulps away from the raw-source
# statistics recorded in its manifest. This is far tighter than the 1e-9
# cross-runtime scalar contract while avoiding a parser-specific equality test.
assert np.allclose(train_mean, locked_mean, atol=1e-12, rtol=0)
assert np.allclose(train_scale, locked_scale, atol=1e-12, rtol=0)
preprocessing_record = {
    "fitSplit": "train",
    "ddof": 0,
    "features": FEATURES,
    "trainMeans": {name: float(value) for name, value in zip(FEATURES, train_mean, strict=True)},
    "trainScales": {name: float(value) for name, value in zip(FEATURES, train_scale, strict=True)},
}
print(json.dumps(preprocessing_record, ensure_ascii=False, sort_keys=True))
''',
        ),
        markdown(
            "stable-bce-explanation",
            r'''
## 2. 先让 BCE 在极端 logit 下仍然可信

概率域写法会在 $p=0$ 或 $p=1$ 处遇到 $\log 0$。权威实现直接计算 $\operatorname{logaddexp}(0,z)-yz$；naive 写法只留在隔离的比较探针里，非有限值绝不进入 JSON。
''',
        ),
        code(
            "stable-bce-and-extreme-logits",
            r'''
def stable_bce(logits, targets):
    logits = np.asarray(logits, dtype=np.float64)
    targets = np.asarray(targets, dtype=np.float64)
    return float(np.mean(np.logaddexp(0.0, logits) - targets * logits))

stable_wrong_positive = stable_bce(np.array([1000.0]), np.array([0.0]))
stable_wrong_negative = stable_bce(np.array([-1000.0]), np.array([1.0]))
stable_correct_positive = stable_bce(np.array([1000.0]), np.array([1.0]))
stable_correct_negative = stable_bce(np.array([-1000.0]), np.array([0.0]))
with np.errstate(divide="ignore", invalid="ignore", over="ignore"):
    naive_probabilities = expit(np.array([1000.0, -1000.0, 1000.0, -1000.0]))
    naive_targets = np.array([0.0, 1.0, 1.0, 0.0])
    naive_values = -(naive_targets * np.log(naive_probabilities) + (1.0 - naive_targets) * np.log(1.0 - naive_probabilities))

assert stable_wrong_positive == 1000.0 and stable_wrong_negative == 1000.0
assert stable_correct_positive == 0.0 and stable_correct_negative == 0.0
assert not np.isfinite(naive_values).all()
assert np.allclose(expit(np.array([-1000.0, 0.0, 1000.0])), np.array([0.0, 0.5, 1.0]))
extreme_logit_check = {
    "probeLogits": [1000.0, -1000.0],
    "naiveFinite": False,
    "naiveOutcomeKinds": ["positive-infinity", "positive-infinity", "not-a-number", "not-a-number"],
    "stableWrongPositive": stable_wrong_positive,
    "stableWrongNegative": stable_wrong_negative,
    "stableCorrectPositive": stable_correct_positive,
    "stableCorrectNegative": stable_correct_negative,
    "scipyExpitAgreement": True,
}
print(json.dumps(extreme_logit_check, ensure_ascii=False, sort_keys=True))
''',
        ),
        markdown(
            "objective-gradient-explanation",
            r'''
## 3. 同一个目标函数同时返回损失和梯度

训练目标在平均 BCE 上加入 $\lambda\lVert w\rVert_2^2/2$，但不惩罚截距。验证与测试只报告数据 BCE。下一单元用中心差分独立检查五个偏导。
''',
        ),
        code(
            "loss-and-gradient",
            r'''
L2 = 1e-3

def loss_and_grad(X, targets, parameters, l2=L2):
    parameters = np.asarray(parameters, dtype=np.float64)
    weights, intercept = parameters[:-1], parameters[-1]
    logits = X @ weights + intercept
    probabilities = expit(logits)
    residual = probabilities - targets
    bce = stable_bce(logits, targets)
    objective = bce + 0.5 * l2 * float(weights @ weights)
    gradient = np.r_[X.T @ residual / len(targets) + l2 * weights, residual.mean()]
    return {"objective": float(objective), "bce": float(bce), "gradient": gradient}

def validation_bce(X, targets, parameters):
    parameters = np.asarray(parameters, dtype=np.float64)
    return stable_bce(X @ parameters[:-1] + parameters[-1], targets)
''',
        ),
        code(
            "centered-gradient-check",
            r'''
probe_parameters = np.array([0.2, -0.1, 0.05, 0.15, -0.3], dtype=np.float64)
probe_step = 1e-6
analytic_probe = loss_and_grad(X_standardized["train"], y["train"], probe_parameters)
numeric_gradient = []
for index in range(len(probe_parameters)):
    delta = np.zeros_like(probe_parameters)
    delta[index] = probe_step
    plus = loss_and_grad(X_standardized["train"], y["train"], probe_parameters + delta)["objective"]
    minus = loss_and_grad(X_standardized["train"], y["train"], probe_parameters - delta)["objective"]
    numeric_gradient.append((plus - minus) / (2.0 * probe_step))
numeric_gradient = np.asarray(numeric_gradient)
gradient_error = np.abs(numeric_gradient - analytic_probe["gradient"])
max_gradient_error = float(gradient_error.max())
assert max_gradient_error <= 2e-9

unregularized_probe = loss_and_grad(X_standardized["train"], y["train"], probe_parameters, l2=0.0)
regularization_delta = analytic_probe["gradient"] - unregularized_probe["gradient"]
assert np.allclose(regularization_delta[:-1], L2 * probe_parameters[:-1], atol=1e-15, rtol=0)
assert regularization_delta[-1] == 0.0
gradient_check = {
    "probeParameters": probe_parameters.tolist(),
    "step": probe_step,
    "analytic": analytic_probe["gradient"].tolist(),
    "centeredDifference": numeric_gradient.tolist(),
    "absoluteErrors": gradient_error.tolist(),
    "maxAbsoluteError": max_gradient_error,
    "interceptExcludedFromL2": True,
}
print(json.dumps({"maxAbsoluteError": max_gradient_error, "interceptExcludedFromL2": True}, sort_keys=True))
''',
        ),
        markdown(
            "armijo-stopping-explanation",
            r'''
## 4. Armijo 只接受训练目标的充分下降

方向固定为负梯度。每次尝试只用训练目标判断是否充分下降；验证损失只在接受后更新模型选择检查点。停止优先级固定为梯度范数、损失与参数步长的合取、验证耐心，最后才是最大迭代数。
''',
        ),
        code(
            "armijo-and-stop-state",
            r'''
GRADIENT_TOLERANCE = 1e-5
RELATIVE_LOSS_TOLERANCE = 1e-10
PARAMETER_STEP_TOLERANCE = 1e-7
VALIDATION_MIN_DELTA = 1e-7
VALIDATION_PATIENCE = 60
MAX_ITERATIONS = 500

def terminal(kind, reason, iteration, attempted_iteration=None):
    value = {
        "kind": kind,
        "reason": reason,
        "iteration": int(iteration),
        "messageKey": f"batch4.terminal.{reason}",
    }
    if attempted_iteration is not None:
        value["attemptedIteration"] = int(attempted_iteration)
    return value

def armijo_step(X, targets, parameters, current, initial_step=32.0, c=1e-4, rho=0.5, max_backtracks=30, minimum_step=1e-12):
    gradient = current["gradient"]
    gradient_norm_squared = float(gradient @ gradient)
    for backtracks in range(max_backtracks + 1):
        alpha = float(initial_step * rho ** backtracks)
        if alpha < minimum_step:
            break
        candidate = parameters - alpha * gradient
        if not np.isfinite(candidate).all():
            continue
        candidate_state = loss_and_grad(X, targets, candidate)
        if not np.isfinite(candidate_state["objective"]) or not np.isfinite(candidate_state["gradient"]).all():
            continue
        right_hand_side = current["objective"] - c * alpha * gradient_norm_squared
        if candidate_state["objective"] <= right_hand_side:
            return {
                "accepted": True,
                "parameters": candidate,
                "state": candidate_state,
                "acceptedStepSize": alpha,
                "backtrackCount": backtracks,
                "armijoRightHandSide": float(right_hand_side),
            }
    return {"accepted": False, "reason": "line-search-failed"}

def should_stop(iteration, gradient_norm, relative_objective_change, parameter_step_norm, best_iteration, max_iterations=MAX_ITERATIONS):
    if gradient_norm <= GRADIENT_TOLERANCE:
        return terminal("mathematical-convergence", "gradient-norm", iteration)
    if relative_objective_change <= RELATIVE_LOSS_TOLERANCE and parameter_step_norm <= PARAMETER_STEP_TOLERANCE:
        return terminal("mathematical-convergence", "loss-and-step", iteration)
    if iteration - best_iteration >= VALIDATION_PATIENCE:
        return terminal("model-selection", "validation-patience", iteration)
    if iteration >= max_iterations:
        return terminal("safety", "max-iterations", iteration)
    return None
''',
        ),
        code(
            "train-logistic-state-machine",
            r'''
def trace_point(iteration, state, validation_loss, parameter_step_norm, accepted_step_size, backtrack_count, relative_change, is_best, parameters):
    return {
        "iteration": int(iteration),
        "trainBce": float(state["bce"]),
        "validationBce": float(validation_loss),
        "objective": float(state["objective"]),
        "gradientNorm": float(np.linalg.norm(state["gradient"])),
        "parameterStepNorm": float(parameter_step_norm),
        "acceptedStepSize": float(accepted_step_size),
        "backtrackCount": int(backtrack_count),
        "relativeObjectiveChange": None if relative_change is None else float(relative_change),
        "isBestValidation": bool(is_best),
        "parameters": np.asarray(parameters, dtype=np.float64).tolist(),
    }

def train_logistic(run_id, X_train, y_train, X_validation, y_validation, feature_space, method, step, max_iterations=MAX_ITERATIONS, armijo_max_backtracks=30):
    parameters = np.zeros(5, dtype=np.float64)
    current = loss_and_grad(X_train, y_train, parameters)
    current_validation = validation_bce(X_validation, y_validation, parameters)
    start = trace_point(0, current, current_validation, 0.0, 0.0, 0, None, True, parameters)
    trace = [start]
    best = {"iteration": 0, "bce": float(current_validation), "parameters": parameters.tolist()}
    first_backtrack = None
    terminal_state = None

    for iteration in range(1, max_iterations + 1):
        if method == "armijo":
            proposal = armijo_step(
                X_train, y_train, parameters, current,
                initial_step=step, max_backtracks=armijo_max_backtracks,
            )
            if not proposal["accepted"]:
                terminal_state = terminal("safety", "line-search-failed", iteration - 1, iteration)
                break
            candidate = proposal["parameters"]
            candidate_state = proposal["state"]
            accepted_step = proposal["acceptedStepSize"]
            backtracks = proposal["backtrackCount"]
        else:
            candidate = parameters - step * current["gradient"]
            if not np.isfinite(candidate).all():
                terminal_state = terminal("safety", "non-finite", iteration - 1, iteration)
                break
            # The explicit non-finite probe must terminate safely without
            # leaking parser-specific warnings or temporary kernel paths into
            # the published Notebook output.
            with np.errstate(over="ignore", invalid="ignore"):
                candidate_state = loss_and_grad(X_train, y_train, candidate)
            if not np.isfinite(candidate_state["objective"]) or not np.isfinite(candidate_state["gradient"]).all():
                terminal_state = terminal("safety", "non-finite", iteration - 1, iteration)
                break
            accepted_step = float(step)
            backtracks = 0

        candidate_validation = validation_bce(X_validation, y_validation, candidate)
        if not np.isfinite(candidate_validation):
            terminal_state = terminal("safety", "non-finite", iteration - 1, iteration)
            break
        parameter_step_norm = float(np.linalg.norm(candidate - parameters))
        relative_change = abs(candidate_state["objective"] - current["objective"]) / max(1.0, abs(current["objective"]))
        is_best = candidate_validation < best["bce"] - VALIDATION_MIN_DELTA
        if is_best:
            best = {"iteration": iteration, "bce": float(candidate_validation), "parameters": candidate.tolist()}
        point = trace_point(
            iteration, candidate_state, candidate_validation, parameter_step_norm,
            accepted_step, backtracks, relative_change, is_best, candidate,
        )
        trace.append(point)
        if first_backtrack is None and backtracks > 0:
            first_backtrack = point.copy()

        parameters = candidate
        current = candidate_state
        terminal_state = should_stop(
            iteration, point["gradientNorm"], relative_change,
            parameter_step_norm, best["iteration"], max_iterations,
        )
        if terminal_state is not None:
            break

    if terminal_state is None:
        raise RuntimeError(f"{run_id} ended without a terminal state")
    if terminal_state["iteration"] != trace[-1]["iteration"]:
        raise RuntimeError(f"{run_id} terminal does not retain the last finite trace row")
    eligible = terminal_state["kind"] == "mathematical-convergence"
    return {
        "runId": run_id,
        "featureSpace": feature_space,
        "method": method,
        "config": {
            "l2": L2,
            "step": float(step),
            "maxIterations": int(max_iterations),
            "gradientTolerance": GRADIENT_TOLERANCE,
            "relativeLossTolerance": RELATIVE_LOSS_TOLERANCE,
            "parameterStepTolerance": PARAMETER_STEP_TOLERANCE,
            "validationMinDelta": VALIDATION_MIN_DELTA,
            "validationPatience": VALIDATION_PATIENCE,
            "armijo": None if method == "fixed" else {
                "initialStep": float(step), "c": 1e-4, "rho": 0.5,
                "maxBacktracks": int(armijo_max_backtracks), "minimumStep": 1e-12,
            },
        },
        "start": start,
        "firstBacktrack": first_backtrack,
        "bestValidation": best,
        "terminal": terminal_state,
        "eligibleForFinalSelection": eligible,
        "trace": trace,
    }
''',
        ),
        markdown(
            "locked-five-runs-explanation",
            r'''
## 5. 五条固定运行：尺度、步长与线搜索

五条运行都从零参数开始，并按持久化的训练行顺序做全批量更新。raw 与 standardized 的 L2 几何并不相同，因此这里比较的是早期轨迹和可用步长，不把最终 BCE 当成单纯的模型优劣排名。
''',
        ),
        code(
            "locked-five-training-runs",
            r'''
RUN_ORDER = ["raw-fixed", "standardized-too-small", "standardized-stable", "standardized-too-large", "standardized-armijo"]
run_specs = [
    ("raw-fixed", "raw", "fixed", 4.0),
    ("standardized-too-small", "standardized", "fixed", 0.02),
    ("standardized-stable", "standardized", "fixed", 4.0),
    ("standardized-too-large", "standardized", "fixed", 32.0),
    ("standardized-armijo", "standardized", "armijo", 32.0),
]
runs = []
for run_id, feature_space, method, step in run_specs:
    matrices = X_raw if feature_space == "raw" else X_standardized
    runs.append(train_logistic(
        run_id, matrices["train"], y["train"], matrices["validation"], y["validation"],
        feature_space, method, step,
    ))

run_by_id = {run["runId"]: run for run in runs}
locked_terminals = {
    "raw-fixed": ("validation-patience", 112, 52),
    "standardized-too-small": ("max-iterations", 500, 500),
    "standardized-stable": ("gradient-norm", 484, 484),
    "standardized-too-large": ("validation-patience", 73, 13),
    "standardized-armijo": ("gradient-norm", 48, 48),
}
for run_id, (reason, terminal_iteration, best_iteration) in locked_terminals.items():
    run = run_by_id[run_id]
    assert run["terminal"]["reason"] == reason
    assert run["terminal"]["iteration"] == terminal_iteration
    assert run["bestValidation"]["iteration"] == best_iteration
assert run_by_id["standardized-armijo"]["firstBacktrack"]["iteration"] == 1
assert run_by_id["standardized-armijo"]["firstBacktrack"]["backtrackCount"] == 1
assert run_by_id["standardized-armijo"]["firstBacktrack"]["acceptedStepSize"] == 16.0

armijo_run = run_by_id["standardized-armijo"]
armijo_sufficient_decrease = []
for previous, current_point in zip(armijo_run["trace"], armijo_run["trace"][1:]):
    right_hand_side = previous["objective"] - 1e-4 * current_point["acceptedStepSize"] * previous["gradientNorm"] ** 2
    armijo_sufficient_decrease.append(current_point["objective"] <= right_hand_side + 1e-15)
assert all(armijo_sufficient_decrease)
armijo_check = {
    "initialTrialStep": 32.0,
    "initialTrialAccepted": False,
    "firstAcceptedStep": 16.0,
    "firstBacktrackCount": 1,
    "allAcceptedRowsSatisfySufficientDecrease": True,
}
print(json.dumps({run["runId"]: {"terminal": run["terminal"], "best": run["bestValidation"]["iteration"], "rows": len(run["trace"])} for run in runs}, sort_keys=True))
''',
        ),
        code(
            "terminal-priority-and-failure-probes",
            r'''
priority_fixtures = [
    should_stop(3, 1e-6, 1e-12, 1e-8, 0, 3),
    should_stop(3, 1e-4, 1e-12, 1e-8, 0, 3),
    should_stop(60, 1e-4, 1e-4, 1e-3, 0, 60),
    should_stop(5, 1e-4, 1e-4, 1e-3, 4, 5),
]
assert [item["reason"] for item in priority_fixtures] == [
    "gradient-norm", "loss-and-step", "validation-patience", "max-iterations",
]

line_search_probe = train_logistic(
    "line-search-probe", X_standardized["train"], y["train"],
    X_standardized["validation"], y["validation"], "standardized", "armijo", 32.0,
    max_iterations=10, armijo_max_backtracks=0,
)
non_finite_probe = train_logistic(
    "non-finite-probe", X_standardized["train"], y["train"],
    X_standardized["validation"], y["validation"], "standardized", "fixed", sys.float_info.max,
    max_iterations=10,
)
assert line_search_probe["terminal"] == terminal("safety", "line-search-failed", 0, 1)
assert non_finite_probe["terminal"] == terminal("safety", "non-finite", 0, 1)
assert len(line_search_probe["trace"]) == 1 and len(non_finite_probe["trace"]) == 1
terminal_fixtures = [
    {"fixtureId": "priority-gradient", "terminal": priority_fixtures[0]},
    {"fixtureId": "priority-loss-step", "terminal": priority_fixtures[1]},
    {"fixtureId": "priority-validation", "terminal": priority_fixtures[2]},
    {"fixtureId": "priority-max", "terminal": priority_fixtures[3]},
    {"fixtureId": "non-finite-probe", "terminal": non_finite_probe["terminal"], "lastFinite": non_finite_probe["trace"][-1]},
    {"fixtureId": "line-search-probe", "terminal": line_search_probe["terminal"], "lastFinite": line_search_probe["trace"][-1]},
]
print(json.dumps({row["fixtureId"]: row["terminal"] for row in terminal_fixtures}, sort_keys=True))
''',
        ),
        markdown(
            "final-selection-baseline-explanation",
            r'''
## 6. 先按数值资格选模型，再做一次库端点核对

只有数学收敛的运行能进入最终选择；这排除了 `standardized-too-large` 的短暂低验证损失。选中的 Armijo 最佳检查点在阈值 0.5 下报告测试 BCE、准确率、基于概率的 ROC-AUC 和混淆矩阵。LBFGS 只核对最终概率与参数方向，17 次库迭代不会与手写轨迹逐步对齐。
''',
        ),
        code(
            "final-report-and-sklearn-endpoint",
            r'''
eligible_runs = [run for run in runs if run["eligibleForFinalSelection"]]
selected_run = min(eligible_runs, key=lambda run: run["bestValidation"]["bce"])
assert selected_run["runId"] == "standardized-armijo"
assert run_by_id["standardized-too-large"]["bestValidation"]["bce"] < selected_run["bestValidation"]["bce"]
selected_parameters = np.asarray(selected_run["bestValidation"]["parameters"], dtype=np.float64)

manual_test_logits = X_standardized["test"] @ selected_parameters[:-1] + selected_parameters[-1]
manual_test_probabilities = expit(manual_test_logits)
manual_predictions = (manual_test_probabilities >= 0.5).astype(np.int64)
manual_metrics = {
    "testBce": stable_bce(manual_test_logits, y["test"]),
    "accuracy": float(accuracy_score(y["test"], manual_predictions)),
    "rocAuc": float(roc_auc_score(y["test"], manual_test_probabilities)),
    "confusionMatrix": confusion_matrix(y["test"], manual_predictions, labels=[0, 1]).tolist(),
}

baseline = LogisticRegression(
    C=25 / 24,
    l1_ratio=0.0,
    solver="lbfgs",
    fit_intercept=True,
    tol=1e-12,
    max_iter=5000,
)
baseline.fit(X_standardized["train"], y["train"].astype(np.int64))
baseline_probabilities = baseline.predict_proba(X_standardized["test"])[:, 1]
baseline_predictions = (baseline_probabilities >= 0.5).astype(np.int64)
baseline_parameters = np.r_[baseline.coef_[0], baseline.intercept_[0]]
baseline_metrics = {
    "testBce": float(log_loss(y["test"], baseline_probabilities, labels=[0, 1])),
    "accuracy": float(accuracy_score(y["test"], baseline_predictions)),
    "rocAuc": float(roc_auc_score(y["test"], baseline_probabilities)),
    "confusionMatrix": confusion_matrix(y["test"], baseline_predictions, labels=[0, 1]).tolist(),
}
probability_difference = np.abs(manual_test_probabilities - baseline_probabilities)
coefficient_cosine = float(
    selected_parameters[:-1] @ baseline_parameters[:-1]
    / (np.linalg.norm(selected_parameters[:-1]) * np.linalg.norm(baseline_parameters[:-1]))
)
baseline_comparison = {
    "predictionAgreement": float(np.mean(manual_predictions == baseline_predictions)),
    "maxProbabilityDifference": float(probability_difference.max()),
    "meanProbabilityDifference": float(probability_difference.mean()),
    "coefficientDirectionCosine": coefficient_cosine,
    "endpointOnly": True,
    "perIterationComparison": False,
}
final_report = {
    "runId": selected_run["runId"],
    "checkpointIteration": selected_run["bestValidation"]["iteration"],
    "threshold": 0.5,
    "rocAucInput": "probabilities",
    "manual": manual_metrics,
}
baseline_report = {
    "library": "scikit-learn",
    "version": sklearn.__version__,
    "class": "LogisticRegression",
    "config": {"C": 25 / 24, "l1_ratio": 0.0, "solver": "lbfgs", "fit_intercept": True, "tol": 1e-12, "max_iter": 5000},
    "trainingRows": 960,
    "reportedIterations": int(baseline.n_iter_[0]),
    "parameters": baseline_parameters.tolist(),
    "metrics": baseline_metrics,
    "endpointOnly": True,
    "perIterationComparison": False,
}

assert abs(manual_metrics["testBce"] - 0.0551101232) <= 1e-10
assert abs(baseline_metrics["testBce"] - 0.0550980756) <= 1e-10
assert manual_metrics["confusionMatrix"] == [[110, 4], [0, 92]]
assert baseline_metrics["confusionMatrix"] == [[110, 4], [0, 92]]
assert baseline_report["reportedIterations"] == 17
print(json.dumps({"selectedRunId": selected_run["runId"], "manual": manual_metrics, "baseline": baseline_metrics, "comparison": baseline_comparison}, sort_keys=True))
''',
        ),
        code(
            "publish-locked-notebook-outputs",
            output_source
            .replace("CONSTANTS_SHA256", f'"{constants_sha}"')
            .replace("CONSTANTS", repr(locked_constants())),
        ),
        markdown(
            "banknote-diagnostics-boundary",
            r'''
## 7. 读曲线时保留四个问题

1. 你直接看见了什么？
2. 哪个数值原因最合理？
3. 下一次只改变哪个变量？
4. 如果判断正确，下一条轨迹应怎样变化？

`validation-patience` 选择检查点但不证明收敛；`max-iterations`、`non-finite` 与 `line-search-failed` 是安全边界。下一步由浏览器中的确定性 TypeScript 独立复算同一公式与状态机，而不是执行这个 Python Notebook。
''',
        ),
    ]


def execute_isolated_worker(args: argparse.Namespace) -> None:
    import nbformat  # type: ignore[import-not-found]
    from nbclient import NotebookClient  # type: ignore[import-not-found]

    if not args.worker_notebook or not args.worker_output_dir or not args.worker_kernel_name:
        raise Batch4Error("The isolated Notebook worker is missing required paths or kernel identity")
    notebook_path = args.worker_notebook.resolve()
    output_dir = args.worker_output_dir.resolve()
    working_directory = (args.worker_working_directory or REPO_ROOT).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    worker_environment = os.environ.copy()
    worker_environment["ML_ATLAS_NUMERICAL_BATCH4_OUTPUT_DIR"] = str(output_dir)
    if args.worker_mode == "generate":
        if not args.worker_dataset or not args.worker_dataset.is_file():
            raise Batch4Error("The isolated generator requires the committed Banknote CSV")
        worker_environment["ML_ATLAS_BANKNOTE_DATA_PATH"] = str(args.worker_dataset.resolve())
        source = nbformat.v4.new_notebook(
            cells=notebook_cells(nbformat, sha256_file(args.worker_dataset), constants_sha256()),
            metadata={
                "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
                "language_info": {"name": "python", "version": f"{sys.version_info.major}.{sys.version_info.minor}"},
                "mlAtlas": {
                    "contractVersion": CONTRACT_VERSION,
                    "locale": "zh-CN",
                    "moduleIds": ["optimization", "training-diagnostics"],
                },
            },
        )
    elif args.worker_mode == "standalone":
        worker_environment.pop("ML_ATLAS_BANKNOTE_DATA_PATH", None)
        source = nbformat.read(notebook_path, as_version=4)
    else:
        raise Batch4Error(f"Unknown isolated worker mode: {args.worker_mode}")

    previous_environment = os.environ.copy()
    try:
        os.environ.clear()
        os.environ.update(worker_environment)
        client = NotebookClient(
            source,
            timeout=300,
            kernel_name=args.worker_kernel_name,
            allow_errors=False,
            record_timing=False,
            resources={"metadata": {"path": str(working_directory)}},
        )
        client.execute(cwd=str(working_directory))
        if args.worker_mode == "generate":
            notebook_path.write_text(nbformat.writes(source), encoding="utf-8")
    finally:
        os.environ.clear()
        os.environ.update(previous_environment)


def run_notebook_worker(
    isolated: IsolatedEnvironment,
    *,
    mode: str,
    notebook_path: Path,
    output_dir: Path,
    working_directory: Path,
    dataset_path: Path | None = None,
) -> None:
    command = [
        str(isolated.python),
        str(GENERATOR_PATH),
        "--isolated-worker",
        mode,
        "--worker-notebook",
        str(notebook_path),
        "--worker-output-dir",
        str(output_dir),
        "--worker-kernel-name",
        isolated.kernel_name,
        "--worker-working-directory",
        str(working_directory),
    ]
    if dataset_path is not None:
        command.extend(["--worker-dataset", str(dataset_path)])
    run(command, environment=isolated.environment)


def assert_finite(value: Any, key_path: str = "root") -> None:
    if isinstance(value, float) and not math.isfinite(value):
        raise Batch4Error(f"Non-finite number at {key_path}")
    if isinstance(value, list):
        for index, nested in enumerate(value):
            assert_finite(nested, f"{key_path}[{index}]")
    if isinstance(value, dict):
        for key, nested in value.items():
            assert_finite(nested, f"{key_path}.{key}")


def read_json_object(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise Batch4Error(f"Unable to read generated JSON {path.name}: {error}") from error
    if not isinstance(value, dict):
        raise Batch4Error(f"Generated JSON {path.name} must contain one object")
    assert_finite(value, path.name)
    return value


def artifact_entry(path: Path, public_path: str, **extra: Any) -> dict[str, Any]:
    return {
        **extra,
        "publicPath": public_path,
        "sha256": sha256_file(path),
        "bytes": path.stat().st_size,
    }


def validate_executed_notebook(path: Path) -> dict[str, Any]:
    value = read_json_object(path)
    metadata = value.get("metadata", {})
    if metadata.get("mlAtlas", {}).get("contractVersion") != CONTRACT_VERSION:
        raise Batch4Error("Executed Notebook contract metadata drifted")
    if metadata.get("mlAtlas", {}).get("locale") != "zh-CN":
        raise Batch4Error("Executed Notebook locale must be zh-CN")
    cells = value.get("cells")
    if not isinstance(cells, list) or not cells:
        raise Batch4Error("Executed Notebook has no cells")
    ids = [cell.get("id") for cell in cells]
    required_ids = {
        "banknote-load-local-csv",
        "stable-bce-and-extreme-logits",
        "loss-and-gradient",
        "centered-gradient-check",
        "armijo-and-stop-state",
        "train-logistic-state-machine",
        "locked-five-training-runs",
        "terminal-priority-and-failure-probes",
        "final-report-and-sklearn-endpoint",
        "publish-locked-notebook-outputs",
    }
    if len(ids) != len(set(ids)) or not required_ids.issubset(ids):
        raise Batch4Error("Executed Notebook cell IDs are missing or duplicated")
    code_cells = [cell for cell in cells if cell.get("cell_type") == "code"]
    if [cell.get("execution_count") for cell in code_cells] != list(range(1, len(code_cells) + 1)):
        raise Batch4Error("Executed Notebook is not a sequential clean-kernel run")
    for cell in code_cells:
        for output in cell.get("outputs", []):
            if output.get("output_type") == "error":
                raise Batch4Error(f"Executed Notebook contains an error in {cell.get('id')}")
        execution = cell.get("metadata", {}).get("execution", {})
        if execution:
            raise Batch4Error(f"Execution timing was not stripped from {cell.get('id')}")
    loader = next(cell for cell in code_cells if cell.get("id") == "banknote-load-local-csv")
    source = "".join(loader.get("source", [])) if isinstance(loader.get("source"), list) else loader.get("source", "")
    if "pandas.read_csv(dataset_path)" not in source:
        raise Batch4Error("Notebook must visibly load the local CSV with pandas.read_csv")
    schema_position = source.find("list(frame.columns) == EXPECTED_SCHEMA")
    numpy_position = source.find("to_numpy(dtype=np.float64)")
    if schema_position < 0 or numpy_position < 0 or schema_position > numpy_position:
        raise Batch4Error("Notebook must validate the seven-column schema before NumPy conversion")
    return value


def validate_csv_parity(path: Path, traces: dict[str, Any]) -> int:
    expected_rows: list[tuple[dict[str, Any], dict[str, Any]]] = []
    for run_value in traces["runs"]:
        for point in run_value["trace"]:
            expected_rows.append((run_value, point))
    with path.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != TRACE_CSV_HEADER:
            raise Batch4Error(f"Trace CSV header drifted: {reader.fieldnames}")
        rows = list(reader)
    if len(rows) != len(expected_rows):
        raise Batch4Error(f"Trace CSV/JSON row-count mismatch: {len(rows)} != {len(expected_rows)}")
    numeric_fields = {
        "train_bce": "trainBce",
        "validation_bce": "validationBce",
        "objective": "objective",
        "gradient_norm": "gradientNorm",
        "parameter_step_norm": "parameterStepNorm",
        "accepted_step_size": "acceptedStepSize",
    }
    for index, (csv_row, (run_value, point)) in enumerate(zip(rows, expected_rows, strict=True), start=2):
        if (
            csv_row["contract_version"] != CONTRACT_VERSION
            or csv_row["run_id"] != run_value["runId"]
            or int(csv_row["iteration"]) != point["iteration"]
            or csv_row["feature_space"] != run_value["featureSpace"]
            or csv_row["method"] != run_value["method"]
        ):
            raise Batch4Error(f"Trace CSV identity drift at row {index}")
        for csv_key, json_key in numeric_fields.items():
            if float(csv_row[csv_key]) != point[json_key]:
                raise Batch4Error(f"Trace CSV numeric drift at row {index}, field {csv_key}")
        if int(csv_row["backtrack_count"]) != point["backtrackCount"]:
            raise Batch4Error(f"Trace CSV backtrack drift at row {index}")
        expected_relative = point["relativeObjectiveChange"]
        if (csv_row["relative_objective_change"] == "") != (expected_relative is None):
            raise Batch4Error(f"Trace CSV nullable relative change drift at row {index}")
        if expected_relative is not None and float(csv_row["relative_objective_change"]) != expected_relative:
            raise Batch4Error(f"Trace CSV relative change drift at row {index}")
        if (csv_row["is_best_validation"] == "true") != point["isBestValidation"]:
            raise Batch4Error(f"Trace CSV best-validation drift at row {index}")
        csv_parameters = [
            float(csv_row["w_variance"]),
            float(csv_row["w_skewness"]),
            float(csv_row["w_curtosis"]),
            float(csv_row["w_entropy"]),
            float(csv_row["intercept"]),
        ]
        if csv_parameters != point["parameters"]:
            raise Batch4Error(f"Trace CSV parameter drift at row {index}")
        if not all(math.isfinite(float(csv_row[key])) for key in numeric_fields):
            raise Batch4Error(f"Trace CSV contains a non-finite value at row {index}")
    return len(rows)


def validate_generated_outputs(output_dir: Path, dataset_sha: str) -> dict[str, Any]:
    expected_files = {
        OPTIMIZATION_OUTPUT_FILE,
        DIAGNOSTICS_OUTPUT_FILE,
        TRACE_JSON_FILE,
        TRACE_CSV_FILE,
    }
    observed_files = {path.name for path in output_dir.iterdir() if path.is_file()}
    if observed_files != expected_files:
        raise Batch4Error(f"Generated output inventory drifted: {sorted(observed_files)}")
    optimization = read_json_object(output_dir / OPTIMIZATION_OUTPUT_FILE)
    diagnostics = read_json_object(output_dir / DIAGNOSTICS_OUTPUT_FILE)
    traces = read_json_object(output_dir / TRACE_JSON_FILE)
    expected_contract_fields = {
        "contractVersion": CONTRACT_VERSION,
        "datasetSha256": dataset_sha,
        "constantsSha256": constants_sha256(),
    }
    for name, value in (
        (OPTIMIZATION_OUTPUT_FILE, optimization),
        (DIAGNOSTICS_OUTPUT_FILE, diagnostics),
        (TRACE_JSON_FILE, traces),
    ):
        for key, expected in expected_contract_fields.items():
            if value.get(key) != expected:
                raise Batch4Error(f"{name} {key} drifted")
    if optimization.get("outputId") != "banknote-logistic-optimization-summary":
        raise Batch4Error("Optimization summary output ID drifted")
    if diagnostics.get("outputId") != "banknote-training-diagnostics-summary":
        raise Batch4Error("Diagnostics summary output ID drifted")
    if traces.get("parameterOrder") != PARAMETER_ORDER:
        raise Batch4Error("Trace parameter order drifted")
    runs = traces.get("runs")
    if not isinstance(runs, list) or [run_value.get("runId") for run_value in runs] != RUN_ORDER:
        raise Batch4Error("Trace run inventory drifted")
    terminal_anchors = {
        "raw-fixed": ("validation-patience", 112, 52),
        "standardized-too-small": ("max-iterations", 500, 500),
        "standardized-stable": ("gradient-norm", 484, 484),
        "standardized-too-large": ("validation-patience", 73, 13),
        "standardized-armijo": ("gradient-norm", 48, 48),
    }
    for run_value in runs:
        run_id = run_value["runId"]
        reason, terminal_iteration, best_iteration = terminal_anchors[run_id]
        trace = run_value.get("trace")
        if not isinstance(trace, list) or not trace or trace[0].get("iteration") != 0:
            raise Batch4Error(f"{run_id} trace does not begin at the finite initial state")
        if [point.get("iteration") for point in trace] != list(range(len(trace))):
            raise Batch4Error(f"{run_id} trace iteration sequence drifted")
        terminal_value = run_value.get("terminal", {})
        if terminal_value.get("reason") != reason or terminal_value.get("iteration") != terminal_iteration:
            raise Batch4Error(f"{run_id} terminal anchor drifted")
        if run_value.get("bestValidation", {}).get("iteration") != best_iteration:
            raise Batch4Error(f"{run_id} best-validation anchor drifted")
        if trace[-1].get("iteration") != terminal_iteration:
            raise Batch4Error(f"{run_id} terminal does not reference the last accepted finite row")
        if any(not isinstance(point.get("parameters"), list) or len(point["parameters"]) != 5 for point in trace):
            raise Batch4Error(f"{run_id} parameter trace drifted")
        should_be_eligible = terminal_value.get("kind") == "mathematical-convergence"
        if run_value.get("eligibleForFinalSelection") != should_be_eligible:
            raise Batch4Error(f"{run_id} final-selection eligibility drifted")
    armijo = next(run_value for run_value in runs if run_value["runId"] == "standardized-armijo")
    first_backtrack = armijo.get("firstBacktrack", {})
    if (
        first_backtrack.get("iteration") != 1
        or first_backtrack.get("backtrackCount") != 1
        or first_backtrack.get("acceptedStepSize") != 16.0
    ):
        raise Batch4Error("Armijo must reject 32 and accept 16 on the first update")
    if optimization.get("gradientCheck", {}).get("maxAbsoluteError", math.inf) > 2e-9:
        raise Batch4Error("Centered finite differences do not validate the analytic gradient")
    if optimization.get("gradientCheck", {}).get("interceptExcludedFromL2") is not True:
        raise Batch4Error("Gradient fixture did not prove intercept exclusion from L2")
    fixtures = optimization.get("terminalFixtures", [])
    if [fixture.get("terminal", {}).get("reason") for fixture in fixtures] != [
        "gradient-norm",
        "loss-and-step",
        "validation-patience",
        "max-iterations",
        "non-finite",
        "line-search-failed",
    ]:
        raise Batch4Error("Six terminal reasons or their priority fixtures drifted")
    for fixture in fixtures[-2:]:
        terminal_value = fixture["terminal"]
        if terminal_value.get("iteration") != 0 or terminal_value.get("attemptedIteration") != 1:
            raise Batch4Error("Safety fixtures must preserve finite iteration 0 and record attempted iteration 1")
    if optimization.get("finalSelection", {}).get("selectedRunId") != "standardized-armijo":
        raise Batch4Error("Final selection must exclude the unstable transient validation minimum")
    final_report = diagnostics.get("finalReport", {})
    if (
        final_report.get("runId") != "standardized-armijo"
        or final_report.get("threshold") != 0.5
        or final_report.get("rocAucInput") != "probabilities"
    ):
        raise Batch4Error("Compact final report ownership, threshold, or ROC-AUC input drifted")
    if diagnostics.get("comparison", {}).get("perIterationComparison") is not False:
        raise Batch4Error("Library comparison must remain endpoint-only")
    if diagnostics.get("baseline", {}).get("config", {}).get("C") != 25 / 24:
        raise Batch4Error("scikit-learn L2 mapping must remain C=25/24")
    if diagnostics.get("baseline", {}).get("version") != "1.9.0":
        raise Batch4Error("scikit-learn baseline pin drifted")
    if diagnostics.get("baseline", {}).get("reportedIterations") != 17:
        raise Batch4Error("scikit-learn endpoint iteration record drifted")
    row_count = validate_csv_parity(output_dir / TRACE_CSV_FILE, traces)
    return {
        "optimization": optimization,
        "diagnostics": diagnostics,
        "traces": traces,
        "csvRowCount": row_count,
    }


def output_manifest(
    notebook_path: Path,
    output_dir: Path,
    isolated: IsolatedEnvironment,
    cache_manifest: dict[str, Any],
    wheel_cache: Path,
    validated: dict[str, Any],
) -> dict[str, Any]:
    dataset_manifest_value = read_json_object(DATASET_MANIFEST_PATH)
    cache_manifest_path = wheel_cache.resolve() / CACHE_MANIFEST_NAME
    outputs = [
        artifact_entry(
            output_dir / OPTIMIZATION_OUTPUT_FILE,
            f"/notebooks/numerical-methods/batch-4-outputs/{OPTIMIZATION_OUTPUT_FILE}",
            outputId="banknote-logistic-optimization-summary",
        ),
        artifact_entry(
            output_dir / DIAGNOSTICS_OUTPUT_FILE,
            f"/notebooks/numerical-methods/batch-4-outputs/{DIAGNOSTICS_OUTPUT_FILE}",
            outputId="banknote-training-diagnostics-summary",
        ),
        artifact_entry(
            output_dir / TRACE_JSON_FILE,
            f"/notebooks/numerical-methods/batch-4-outputs/{TRACE_JSON_FILE}",
            outputId="banknote-training-traces-json",
            rowCount=validated["csvRowCount"],
        ),
        artifact_entry(
            output_dir / TRACE_CSV_FILE,
            f"/notebooks/numerical-methods/batch-4-outputs/{TRACE_CSV_FILE}",
            outputId="banknote-training-traces-csv",
            rowCount=validated["csvRowCount"],
            header=TRACE_CSV_HEADER,
        ),
    ]
    return {
        "contractVersion": CONTRACT_VERSION,
        "dataset": {
            "publicPath": "/datasets/numerical-methods/banknote-authentication.csv",
            "sha256": sha256_file(DATASET_PATH),
            "bytes": DATASET_PATH.stat().st_size,
            "manifest": artifact_entry(
                DATASET_MANIFEST_PATH,
                "/datasets/numerical-methods/banknote-authentication-manifest.json",
            ),
            "dataDictionary": artifact_entry(
                DATA_DICTIONARY_PATH,
                "/datasets/numerical-methods/banknote-authentication-data-dictionary.json",
            ),
            "split": dataset_manifest_value["split"],
            "preprocessing": dataset_manifest_value["preprocessing"],
        },
        "generator": {
            "path": "scripts/numerical-methods/generate-batch-4-notebook.py",
            "sha256": sha256_file(GENERATOR_PATH),
        },
        "requirements": {
            "publicPath": "/notebooks/numerical-methods/requirements.txt",
            "sha256": sha256_file(REQUIREMENTS_PATH),
            "pins": read_pins(),
        },
        "wheelCacheAudit": {
            "manifestFile": CACHE_MANIFEST_NAME,
            "manifestSha256": sha256_file(cache_manifest_path),
            "requirementsSha256": cache_manifest["requirements"]["sha256"],
            "wheelCount": len(cache_manifest["wheels"]),
            "installation": "pip --no-index --find-links=<audited-wheel-cache>",
        },
        "environment": {
            "python": python_identity(),
            "packages": isolated.observed_versions,
            "exactPinImportCount": 8,
            "ambientThirdPartyPackagesUsed": False,
            "kernel": {
                "selection": "unique temp-prefix kernelspec",
                "interpreter": "temporary venv",
                "generatedNotebook": "pass",
                "standaloneNotebook": "pass",
            },
        },
        "loader": validated["optimization"]["loader"],
        "constants": locked_constants(),
        "constantsSha256": constants_sha256(),
        "notebook": artifact_entry(
            notebook_path,
            "/notebooks/numerical-methods/banknote-logistic-optimization.zh-CN.ipynb",
            moduleIds=["optimization", "training-diagnostics"],
            locale="zh-CN",
            cleanKernel=True,
            cellErrors=0,
            timingStripped=True,
        ),
        "outputs": outputs,
        "standaloneRerun": {
            "status": "pass",
            "source": "copied download-form Notebook with local CSV beside it",
            "sameIsolatedKernelContract": True,
            "outputParity": True,
        },
        "mediaOutputsIncluded": False,
    }


def validate_standalone(
    isolated: IsolatedEnvironment,
    notebook_path: Path,
    generated_output_dir: Path,
    standalone_dir: Path,
) -> None:
    standalone_notebook = standalone_dir / NOTEBOOK_PATH.name
    standalone_dataset = standalone_dir / DATASET_PATH.name
    standalone_output = standalone_dir / "outputs"
    standalone_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(notebook_path, standalone_notebook)
    shutil.copy2(DATASET_PATH, standalone_dataset)
    run_notebook_worker(
        isolated,
        mode="standalone",
        notebook_path=standalone_notebook,
        output_dir=standalone_output,
        working_directory=standalone_dir,
    )
    validate_generated_outputs(standalone_output, sha256_file(DATASET_PATH))
    for name in (OPTIMIZATION_OUTPUT_FILE, DIAGNOSTICS_OUTPUT_FILE, TRACE_JSON_FILE, TRACE_CSV_FILE):
        if (standalone_output / name).read_bytes() != (generated_output_dir / name).read_bytes():
            raise Batch4Error(f"Standalone Notebook output drifted: {name}")


def execute_notebook_transaction(wheel_cache: Path) -> tuple[tempfile.TemporaryDirectory[str], Path, Path]:
    if not DATASET_PATH.is_file() or not DATASET_MANIFEST_PATH.is_file() or not DATA_DICTIONARY_PATH.is_file():
        raise Batch4Error("Committed Banknote dataset artifacts are required before Notebook generation")
    dataset_manifest_value = read_json_object(DATASET_MANIFEST_PATH)
    dataset_sha = sha256_file(DATASET_PATH)
    if dataset_manifest_value.get("normalizedDataset", {}).get("sha256") != dataset_sha:
        raise Batch4Error("Committed Banknote CSV does not match its dataset manifest")
    workspace = tempfile.TemporaryDirectory(prefix="ml-atlas-batch4-notebook-")
    workspace_root = Path(workspace.name)
    notebook_temp = workspace_root / NOTEBOOK_PATH.name
    output_temp = workspace_root / "outputs"
    standalone_dir = workspace_root / "standalone-download"
    isolated_root: Path | None = None
    try:
        cache_manifest = validate_environment_cache(wheel_cache)
        with isolated_environment(wheel_cache) as isolated:
            isolated_root = isolated.root
            run_notebook_worker(
                isolated,
                mode="generate",
                notebook_path=notebook_temp,
                output_dir=output_temp,
                working_directory=REPO_ROOT,
                dataset_path=DATASET_PATH,
            )
            validate_executed_notebook(notebook_temp)
            validated = validate_generated_outputs(output_temp, dataset_sha)
            validate_standalone(isolated, notebook_temp, output_temp, standalone_dir)
            manifest = output_manifest(
                notebook_temp,
                output_temp,
                isolated,
                cache_manifest,
                wheel_cache,
                validated,
            )
            (output_temp / OUTPUT_MANIFEST_FILE).write_bytes(json_bytes(manifest))
        if isolated_root is None or isolated_root.exists():
            raise Batch4Error("Temporary Batch 4 venv, kernelspec, worker, or Jupyter state was not removed")
        shutil.rmtree(standalone_dir, ignore_errors=True)
        return workspace, notebook_temp, output_temp
    except BaseException:
        workspace.cleanup()
        raise


def compare_committed(notebook_temp: Path, output_temp: Path) -> None:
    differences: list[str] = []
    if not NOTEBOOK_PATH.is_file() or NOTEBOOK_PATH.read_bytes() != notebook_temp.read_bytes():
        differences.append(str(NOTEBOOK_PATH.relative_to(REPO_ROOT)))
    expected_names = {
        OPTIMIZATION_OUTPUT_FILE,
        DIAGNOSTICS_OUTPUT_FILE,
        TRACE_JSON_FILE,
        TRACE_CSV_FILE,
        OUTPUT_MANIFEST_FILE,
    }
    committed_names = {path.name for path in OUTPUT_DIR.iterdir() if path.is_file()} if OUTPUT_DIR.is_dir() else set()
    generated_names = {path.name for path in output_temp.iterdir() if path.is_file()}
    if committed_names != expected_names or generated_names != expected_names:
        differences.append(str(OUTPUT_DIR.relative_to(REPO_ROOT)))
    for name in sorted(expected_names):
        committed = OUTPUT_DIR / name
        generated = output_temp / name
        if not committed.is_file() or not generated.is_file() or committed.read_bytes() != generated.read_bytes():
            differences.append(str(committed.relative_to(REPO_ROOT)))
    if differences:
        raise Batch4Error(f"Committed Batch 4 artifacts differ: {', '.join(dict.fromkeys(differences))}")


def publish_notebook_transaction(notebook_temp: Path, output_temp: Path) -> None:
    NOTEBOOK_DIR.mkdir(parents=True, exist_ok=True)
    token = uuid.uuid4().hex
    notebook_stage = NOTEBOOK_DIR / f".{NOTEBOOK_PATH.name}.{token}.tmp"
    output_stage = NOTEBOOK_DIR / f".batch-4-outputs.{token}.tmp"
    notebook_backup = NOTEBOOK_DIR / f".{NOTEBOOK_PATH.name}.{token}.bak"
    output_backup = NOTEBOOK_DIR / f".batch-4-outputs.{token}.bak"
    shutil.copy2(notebook_temp, notebook_stage)
    shutil.copytree(output_temp, output_stage)
    try:
        if NOTEBOOK_PATH.exists():
            NOTEBOOK_PATH.replace(notebook_backup)
        if OUTPUT_DIR.exists():
            OUTPUT_DIR.replace(output_backup)
        notebook_stage.replace(NOTEBOOK_PATH)
        output_stage.replace(OUTPUT_DIR)
        if os.environ.get("ML_ATLAS_BATCH4_PUBLISH_FAIL_AFTER_REPLACE") == "1":
            raise Batch4Error("Injected Notebook publication failure after replacement")
    except BaseException:
        if NOTEBOOK_PATH.exists():
            NOTEBOOK_PATH.unlink()
        if OUTPUT_DIR.exists():
            shutil.rmtree(OUTPUT_DIR)
        if notebook_backup.exists():
            notebook_backup.replace(NOTEBOOK_PATH)
        if output_backup.exists():
            output_backup.replace(OUTPUT_DIR)
        raise
    finally:
        notebook_stage.unlink(missing_ok=True)
        shutil.rmtree(output_stage, ignore_errors=True)
        notebook_backup.unlink(missing_ok=True)
        shutil.rmtree(output_backup, ignore_errors=True)


def generate_or_check(wheel_cache: Path, *, check: bool) -> None:
    workspace, notebook_temp, output_temp = execute_notebook_transaction(wheel_cache)
    try:
        if check:
            compare_committed(notebook_temp, output_temp)
            print("Batch 4 Notebook artifacts are current, finite, cache-only, and standalone-runnable.")
        else:
            publish_notebook_transaction(notebook_temp, output_temp)
            print(f"Published {NOTEBOOK_PATH.relative_to(REPO_ROOT)}")
            print(f"Published {OUTPUT_DIR.relative_to(REPO_ROOT)}")
    finally:
        workspace.cleanup()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument("--bootstrap-environment-cache", action="store_true")
    modes.add_argument("--verify-environment", action="store_true")
    modes.add_argument("--refresh-source", action="store_true")
    modes.add_argument("--check", action="store_true")
    modes.add_argument("--isolated-worker", choices=("generate", "standalone"), dest="worker_mode")
    parser.add_argument("--wheel-cache", type=Path, default=DEFAULT_WHEEL_CACHE)
    parser.add_argument("--worker-notebook", type=Path, help=argparse.SUPPRESS)
    parser.add_argument("--worker-output-dir", type=Path, help=argparse.SUPPRESS)
    parser.add_argument("--worker-kernel-name", help=argparse.SUPPRESS)
    parser.add_argument("--worker-working-directory", type=Path, help=argparse.SUPPRESS)
    parser.add_argument("--worker-dataset", type=Path, help=argparse.SUPPRESS)
    args = parser.parse_args()

    if args.worker_mode:
        execute_isolated_worker(args)
        return
    verify_approval()
    read_pins()
    if args.bootstrap_environment_cache:
        bootstrap_environment_cache(args.wheel_cache)
        return
    if args.verify_environment:
        verify_environment(args.wheel_cache)
        return
    if args.refresh_source:
        refresh_source(args.wheel_cache)
        return

    generate_or_check(args.wheel_cache, check=args.check)


if __name__ == "__main__":
    try:
        main()
    except Batch4Error as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1) from error
