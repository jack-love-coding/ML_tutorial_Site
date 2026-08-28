"""Publish deterministic Phase 30 JSON assets and executed bilingual notebooks."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import os
import sys
import tempfile
from pathlib import Path
from typing import Any

import nbformat
from nbclient import NotebookClient
from jupyter_client.kernelspec import KernelSpecManager

from phase30_analysis import CONTRACT_VERSION, build_outputs


ROOT = Path(__file__).resolve().parents[2]
PUBLIC_ROOT = ROOT / "public/classification/phase-30"
OUTPUT_ROOT = PUBLIC_ROOT / "outputs"
NOTEBOOK_ROOT = PUBLIC_ROOT / "notebooks"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def notebook(locale: str, outputs: dict[str, Any]) -> Any:
    zh = locale == "zh-CN"
    title = "分类决策：固定留出分数、阈值与误差分析" if zh else "Classification decisions: frozen holdout scores, thresholds, and errors"
    policy = (
        "本 Notebook 使用 Phase 29 冻结的 prediction handoff。所有阈值比较只发生在 validation；选定阈值锁定后，test 只汇总一次。"
        if zh else
        "This notebook uses the frozen Phase 29 prediction handoff. Every threshold comparison stays on validation; after the threshold is frozen, test is summarized once."
    )
    result_label = "已发布结果" if zh else "Published results"
    code = """from pathlib import Path
import json

root = Path.cwd()
while not (root / 'public' / 'classification' / 'phase-30').exists() and root != root.parent:
    root = root.parent
package = root / 'public' / 'classification' / 'phase-30'
sweep = json.loads((package / 'outputs' / 'threshold-sweep.json').read_text())
roc = json.loads((package / 'outputs' / 'roc.json').read_text())
decision = json.loads((package / 'outputs' / 'cost-selection.json').read_text())
errors = json.loads((package / 'outputs' / 'subgroup-errors.json').read_text())

summary = {
    'validation_rows': sum(decision['validation']['confusion'].values()),
    'selected_threshold': decision['selectedThreshold'],
    'validation_confusion': decision['validation']['confusion'],
    'validation_precision': decision['validation']['metrics']['precision'],
    'validation_recall': decision['validation']['metrics']['recall'],
    'validation_f1': decision['validation']['metrics']['f1'],
    'validation_auc': roc['auc'],
    'fold_threshold_range': decision['variation'],
    'locked_test_confusion': decision['lockedTest']['confusion'],
    'test_evaluations': decision['testEvaluations'],
    'named_validation_errors': len(errors['namedErrors']),
}
summary
"""
    nb = nbformat.v4.new_notebook()
    nb.metadata.update({"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}, "language_info": {"name": "python"}})
    nb.cells = [
        nbformat.v4.new_markdown_cell(f"# {title}\n\n{policy}"),
        nbformat.v4.new_code_cell(code),
        nbformat.v4.new_markdown_cell(
            (f"## {result_label}\n\nROC/AUC 描述跨阈值排序，不是阈值选择器。特征子组仅用于教学诊断，不是人口属性公平性审计。" if zh else
             f"## {result_label}\n\nROC/AUC describes ranking across thresholds, not threshold selection. Feature slices are pedagogical diagnostics, not a demographic fairness audit.")
        ),
    ]
    locale_id = "zh-cn" if zh else "en"
    for cell, suffix in zip(nb.cells, ("intro", "replay", "interpretation"), strict=True):
        cell.id = f"phase30-{locale_id}-{suffix}"
    return nb


def execute_notebook(nb: Any) -> Any:
    kernel_name = "ml-atlas-phase30"
    previous_jupyter_path = os.environ.get("JUPYTER_PATH")
    kernel_python = sys.executable
    if importlib.util.find_spec("ipykernel_launcher") is None:
        manager = KernelSpecManager()
        for discovered_name in manager.find_kernel_specs():
            candidate = manager.get_kernel_spec(discovered_name).argv[0]
            if Path(candidate).is_file():
                kernel_python = candidate
                break
        else:
            raise RuntimeError("An installed Python Jupyter kernel is required to execute Phase 30 notebooks.")
    with tempfile.TemporaryDirectory(prefix="ml-atlas-phase30-kernel-") as directory:
        jupyter_root = Path(directory) / "share/jupyter"
        kernel_root = jupyter_root / "kernels" / kernel_name
        kernel_root.mkdir(parents=True)
        write_json(kernel_root / "kernel.json", {
            "argv": [kernel_python, "-Xfrozen_modules=off", "-m", "ipykernel_launcher", "-f", "{connection_file}"],
            "display_name": "ML Atlas Phase 30",
            "language": "python",
        })
        os.environ["JUPYTER_PATH"] = str(jupyter_root)
        try:
            executed = NotebookClient(
                nb,
                timeout=60,
                kernel_name=kernel_name,
                shutdown_kernel="immediate",
                record_timing=False,
                resources={"metadata": {"path": str(ROOT)}},
            ).execute()
        finally:
            if previous_jupyter_path is None:
                os.environ.pop("JUPYTER_PATH", None)
            else:
                os.environ["JUPYTER_PATH"] = previous_jupyter_path

    executed.metadata.kernelspec = {"display_name": "Python 3", "language": "python", "name": "python3"}
    for cell in executed.cells:
        cell.metadata.pop("execution", None)
        if cell.cell_type == "code":
            cell.execution_count = 1
            for output in cell.get("outputs", []):
                output.pop("execution_count", None)
    return executed


def main() -> int:
    outputs, source = build_outputs(ROOT)
    files = {
        "predictions": OUTPUT_ROOT / "validation-predictions.json",
        "thresholdSweep": OUTPUT_ROOT / "threshold-sweep.json",
        "roc": OUTPUT_ROOT / "roc.json",
        "costSelection": OUTPUT_ROOT / "cost-selection.json",
        "subgroupErrors": OUTPUT_ROOT / "subgroup-errors.json",
    }
    for key, path in files.items():
        write_json(path, outputs[key])

    notebooks = {}
    for locale in ("zh-CN", "en"):
        path = NOTEBOOK_ROOT / f"classification-decisions.{locale}.ipynb"
        path.parent.mkdir(parents=True, exist_ok=True)
        nbformat.write(execute_notebook(notebook(locale, outputs)), path)
        notebooks[locale] = path

    def entry(path: Path) -> dict[str, str]:
        return {"path": "/" + str(path.relative_to(ROOT / "public")), "sha256": sha256(path)}

    manifest = {
        "contractVersion": CONTRACT_VERSION,
        "locales": ["zh-CN", "en"],
        "source": source,
        "policy": {
            "selectionSplit": "validation",
            "finalEvaluationSplit": "test",
            "testEvaluations": 1,
            "testReselectionAllowed": False,
            "subgroupSplit": "validation",
        },
        "outputs": {key: entry(path) for key, path in files.items()},
        "notebooks": {locale: entry(path) for locale, path in notebooks.items()},
    }
    write_json(PUBLIC_ROOT / "manifest.json", manifest)
    decision = outputs["costSelection"]
    print(json.dumps({
        "selectedThreshold": decision["selectedThreshold"],
        "validation": decision["validation"]["confusion"],
        "lockedTest": decision["lockedTest"]["confusion"],
        "foldVariation": decision["variation"],
    }, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
