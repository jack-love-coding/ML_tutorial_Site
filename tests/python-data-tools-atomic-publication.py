#!/usr/bin/env python3
"""Failure-injection check for Stage 3 atomic artifact publication."""

from __future__ import annotations

import importlib.util
import tempfile
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
GENERATOR_PATH = REPO_ROOT / "scripts/python-data-tools/generate-authoritative-outputs.py"


def load_generator():
    spec = importlib.util.spec_from_file_location("python_data_tools_generator", GENERATOR_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load authoritative output generator")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    generator = load_generator()
    with tempfile.TemporaryDirectory(prefix="python-data-tools-atomic-") as temporary:
        notebook_dir = Path(temporary)
        output_dir = notebook_dir / "outputs"
        notebook_path = notebook_dir / "lesson.ipynb"
        transaction_dir = notebook_dir / ".outputs.transaction"
        notebook_temp = notebook_dir / ".lesson.transaction.ipynb"

        output_dir.mkdir()
        (output_dir / "sentinel.txt").write_text("old-output", encoding="utf-8")
        notebook_path.write_text("old-notebook", encoding="utf-8")
        transaction_dir.mkdir()
        (transaction_dir / "sentinel.txt").write_text("new-output", encoding="utf-8")
        notebook_temp.write_text("new-notebook", encoding="utf-8")

        generator.NOTEBOOK_DIR = notebook_dir
        generator.OUTPUT_DIR = output_dir
        generator.NOTEBOOK_PATH = notebook_path
        rename_count = 0

        def fail_during_notebook_publication(source: Path, target: Path) -> None:
            nonlocal rename_count
            rename_count += 1
            if rename_count == 4:
                raise OSError("injected notebook publication failure")
            source.rename(target)

        try:
            generator.publish(transaction_dir, notebook_temp, fail_during_notebook_publication)
        except OSError as error:
            assert str(error) == "injected notebook publication failure"
        else:
            raise AssertionError("Injected publication failure did not propagate")

        assert notebook_path.read_text(encoding="utf-8") == "old-notebook"
        assert (output_dir / "sentinel.txt").read_text(encoding="utf-8") == "old-output"
        assert not transaction_dir.exists()
        assert not notebook_temp.exists()
        assert not list(notebook_dir.glob("*.bak"))
        print("Atomic publication rollback restored all committed artifacts.")


if __name__ == "__main__":
    main()
