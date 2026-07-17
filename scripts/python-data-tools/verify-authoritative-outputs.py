#!/usr/bin/env python3
"""Validate committed Python Data Tools notebook assets without rewriting them."""

from __future__ import annotations

import importlib.util
from pathlib import Path


def load_generator():
    path = Path(__file__).with_name("generate-authoritative-outputs.py")
    spec = importlib.util.spec_from_file_location("python_data_tools_generate", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load generator: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    generator = load_generator()
    environment, data_manifest, font_metadata = generator.preflight()
    if not generator.NOTEBOOK_PATH.is_file():
        raise FileNotFoundError(generator.NOTEBOOK_PATH)
    observed = generator.validate_outputs(generator.OUTPUT_DIR, data_manifest["file"]["sha256"])
    cell_outputs_observed = generator.validate_cell_output_previews(
        generator.OUTPUT_DIR,
        generator.NOTEBOOK_PATH,
    )
    manifest_path = generator.OUTPUT_DIR / "manifest.json"
    if not manifest_path.is_file():
        raise FileNotFoundError(manifest_path)
    expected = generator._manifest(
        environment,
        data_manifest,
        font_metadata,
        generator.NOTEBOOK_PATH,
        generator.OUTPUT_DIR,
        observed,
        cell_outputs_observed,
    )
    import json
    actual = json.loads(manifest_path.read_text(encoding="utf-8"))
    if actual != expected:
        raise ValueError("Committed output manifest differs from observed artifacts")
    print("Python Data Tools committed Notebook and outputs satisfy the static contract.")


if __name__ == "__main__":
    main()
