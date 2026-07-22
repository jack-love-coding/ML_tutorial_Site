#!/usr/bin/env python3
"""Build Numerical Methods Batch 4 artifacts in an audited isolated environment."""

from __future__ import annotations

import argparse
import contextlib
import hashlib
import json
import os
import platform
import shutil
import subprocess
import sys
import sysconfig
import tempfile
import uuid
import venv
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

    validate_environment_cache(args.wheel_cache)
    if args.refresh_source:
        raise Batch4Error("Dataset refresh is added by Plan 25-02 Task 2.")
    if args.check:
        raise Batch4Error("Notebook check is added by Plan 25-03.")
    raise Batch4Error("Notebook generation is added by Plan 25-03.")


if __name__ == "__main__":
    try:
        main()
    except Batch4Error as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1) from error
