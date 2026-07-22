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


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument("--bootstrap-environment-cache", action="store_true")
    modes.add_argument("--verify-environment", action="store_true")
    modes.add_argument("--refresh-source", action="store_true")
    modes.add_argument("--check", action="store_true")
    parser.add_argument("--wheel-cache", type=Path, default=DEFAULT_WHEEL_CACHE)
    args = parser.parse_args()

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

    validate_environment_cache(args.wheel_cache)
    if args.check:
        raise Batch4Error("Notebook check is added by Plan 25-03.")
    raise Batch4Error("Notebook generation is added by Plan 25-03.")


if __name__ == "__main__":
    try:
        main()
    except Batch4Error as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1) from error
