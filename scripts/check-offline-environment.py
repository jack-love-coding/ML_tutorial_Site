"""Read-only preflight for the exact frozen Notebook environment; never downloads."""
from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]


def load_generator(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def check(cache_root: Path) -> dict:
    wheels = cache_root / "numerical-methods/batch-4-wheelhouse"
    contracts = []
    for name, generator in [
        ("loss-functions", "build-phase-26-assets.py"),
        ("linear-regression", "build-phase-27-assets.py"),
    ]:
        module = load_generator(name.replace("-", "_"), ROOT / "scripts" / name / generator)
        module.validate_environment_contract(wheel_cache=wheels)
        if name == "loss-functions":
            module.verify_source_cache(cache_root / "loss-functions/phase-26-sources")
        contract = json.loads((ROOT / "scripts" / name / "environment-contract.json").read_text())
        contracts.append(contract["contractVersion"])
    for relative in [
        "loss-functions/phase-26-staging/datasets/loss-functions",
        "loss-functions/phase-26-staging/notebooks/loss-functions",
        "linear-regression/phase-27-staging/notebooks/linear-regression",
    ]:
        directory = cache_root / relative
        if not directory.is_dir() or not any(directory.iterdir()):
            raise RuntimeError(f"Missing staged cache: {directory}")
    return {"contracts": contracts, "python": sys.version.split()[0], "wheels": 99, "network": False, "sourceCache": "hashes, bytes and contents verified", "stagedContent": "present; strict suite verifies contents"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache-root", type=Path, default=ROOT / ".cache")
    args = parser.parse_args()
    try:
        print(json.dumps(check(args.cache_root)))
    except Exception as error:
        print(f"Offline preflight failed: {error}", file=sys.stderr)
        sys.exit(1)
