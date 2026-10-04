"""Stage or check the existing classification project's frozen SMS reference, offline."""
from __future__ import annotations

import argparse
import contextlib
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import re
import runpy
import shutil
import subprocess
import sys
import tempfile
import uuid

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "scripts/classification-project/reference.py"
DATASET = ROOT / "public/datasets/numerical-methods/sms-spam.csv"
PACKAGE = Path("public/classification-project/v1")
RUNTIME = Path("src/data/generated/classificationProjectRuntime.ts")
IDS = ["setup", "vectorizer", "fit", "threshold", "evaluate", "review"]


def write_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, sort_keys=True, indent=2, allow_nan=False) + "\n", encoding="utf-8")


def digest(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def blocks():
    pairs = re.split(r"^# %% (\w+)\n", SOURCE.read_text(), flags=re.M)
    result = dict(zip(pairs[1::2], (value.strip() + "\n" for value in pairs[2::2])))
    if list(result) != IDS:
        raise ValueError("Reference code block order changed")
    return result


def worker(output: Path, kernel: str):
    import nbformat
    from nbclient import NotebookClient
    import pandas as pd
    from sklearn.model_selection import train_test_split

    raw = pd.read_csv(DATASET)
    normalized = raw.message.map(lambda text: " ".join(text.casefold().split()))
    if raw.groupby(normalized).label.nunique().max() != 1:
        raise ValueError("Duplicate groups have conflicting labels")
    data = raw.loc[~normalized.duplicated()].set_index("sms_id")
    remaining, test = train_test_split(data.index, test_size=0.2, random_state=42, stratify=data.label)
    train, valid = train_test_split(remaining, test_size=0.25, random_state=43, stratify=data.loc[remaining, "label"])
    protocol = {
        "contractVersion": "classification-project-sms-v1",
        "dataset": {"path": "/datasets/numerical-methods/sms-spam.csv", "sha256": digest(DATASET)},
        "groups": {"normalization": "casefold then collapse whitespace", "representative": "first source row", "excludedRows": len(raw) - len(data)},
        "split": {"testFraction": 0.2, "validationFractionOfRemaining": 0.25, "seeds": [42, 43], "stratifiedBy": "label"},
        "partitions": {"train": train.tolist(), "validation": valid.tolist(), "test": test.tolist()},
    }
    package = output / PACKAGE
    package.mkdir(parents=True)
    write_json(package / "split.json", protocol)
    shutil.copyfile(SOURCE, package / "reference.py")
    shutil.copyfile(ROOT / "scripts/linear-regression/requirements.txt", package / "requirements.txt")
    code = blocks()
    descriptions = {
        "zh-CN": [
            "读取短信与冻结划分。把 sms-spam.csv、split.json 和本 Notebook 放在同一目录，先按 requirements.txt 安装依赖。重复文本按大小写折叠及空白规范化分组，只保留第一条；三个集合没有同组消息。",
            "每个交叉验证训练折独立学习词表。正类为 spam；本节搭建流水线，下一节才拟合。",
            "只用 train 内部的三折交叉验证选择 C。refit 也只使用 train；validation 和 test 都没有参与词表或参数拟合。",
            "只在 validation 比较预先声明的阈值网格。误拦成本 5、漏拦成本 1；成本相同时依次选择较少 FP、较高阈值。预测标签始终为 spam/ham。",
            "模型与阈值锁定后才计算 test 汇总，不再据此调参。公开参考结果可以重复复现，但不能把多次挑选后的最好测试分数当作一次独立评估。",
            "只列 validation 的错误编号。用 df.loc[sms_id] 查看原文，解释词汇、短文本或上下文造成的失误。新一轮方案需要新的评估协议；不能用当前 test 重新挑阈值。",
        ],
        "en": [
            "Load SMS data and the frozen split. Keep sms-spam.csv, split.json and this Notebook together; install requirements.txt first. Case-folded, whitespace-normalized duplicates use their first row only, so no duplicate group spans splits.",
            "Every CV training fold learns its own vocabulary. Spam is positive. This cell defines the Pipeline; fitting starts in the next cell.",
            "Choose C using three-fold CV inside train only. Refit also uses train; neither validation nor test fits vocabulary or parameters.",
            "Compare the predeclared threshold grid on validation only, with FP cost 5 and FN cost 1. Break cost ties by fewer FP, then higher threshold. Predictions stay spam/ham strings.",
            "Summarize test only after the model and threshold are locked. Reproducing a public reference is allowed; choosing the best test score across revised runs is not an independent final evaluation.",
            "List validation error IDs only; inspect df.loc[sms_id] for vocabulary, short-text or context failures. A future experiment needs a new evaluation protocol; do not reselect thresholds using this test set.",
        ],
    }
    with tempfile.TemporaryDirectory(prefix="ml-atlas-sms-execution-") as directory:
        execution = Path(directory)
        shutil.copyfile(DATASET, execution / "sms-spam.csv")
        shutil.copyfile(package / "split.json", execution / "split.json")
        previous = Path.cwd()
        try:
            os.chdir(execution)
            with contextlib.redirect_stdout(io.StringIO()):
                namespace = runpy.run_path(str(SOURCE))
        finally:
            os.chdir(previous)
        summary = namespace["reference_summary"]
        write_json(package / "reference-summary.json", summary)
        write_json(package / "validation-predictions.json", namespace["validation_predictions"])
        reference_outputs = None
        for locale in ["zh-CN", "en"]:
            title = "短信分类：独立冻结的参考案例" if locale == "zh-CN" else "SMS classification: a frozen reference project"
            note = "UCI SMS Spam Collection，CC BY 4.0；原始语料也用于稀疏矩阵专题，本项目重新限定训练词表及独立划分，不能复用全语料词表。这是参考基准，不代表真实邮件流的未来表现。" if locale == "zh-CN" else "UCI SMS Spam Collection, CC BY 4.0. The corpus also appears in the sparse-matrix topic; this project uses a separate split and train-only vocabulary, never the full-corpus vocabulary. It is a reference benchmark, not a claim about future email traffic."
            nb = nbformat.v4.new_notebook()
            nb.cells = [nbformat.v4.new_markdown_cell(f"# {title}\n\n{note}", id="introduction")]
            for index, block_id in enumerate(IDS):
                nb.cells.extend([
                    nbformat.v4.new_markdown_cell(descriptions[locale][index], id=block_id + "-explanation"),
                    nbformat.v4.new_code_cell(code[block_id], id=block_id + "-code"),
                ])
            nb = NotebookClient(nb, kernel_name=kernel, timeout=180, allow_errors=False, record_timing=False,
                                resources={"metadata": {"path": str(execution)}}).execute()
            nb.metadata.kernelspec = {"display_name": "Python 3", "language": "python", "name": "python3"}
            normalized_outputs = [cell.outputs for cell in nb.cells if cell.cell_type == "code"]
            if reference_outputs is not None and normalized_outputs != reference_outputs:
                raise ValueError("Bilingual Notebook outputs differ")
            reference_outputs = normalized_outputs
            final_output = "".join(item.get("text", "") for item in normalized_outputs[-1])
            if json.loads(final_output) != summary:
                raise ValueError("Fresh Notebook differs from standalone reference")
            nbformat.write(nb, package / f"classification-project.{locale}.ipynb")
    runtime = output / RUNTIME
    runtime.parent.mkdir(parents=True)
    runtime.write_text("// Generated from the frozen SMS reference. Do not edit by hand.\n"
                       + "export const classificationProjectCode = " + json.dumps(code, ensure_ascii=False, indent=2) + " as const\n"
                       + "export const classificationProjectReference = " + json.dumps(summary, ensure_ascii=False, indent=2) + " as const\n")
    members = [{"path": "/" + path.relative_to(output / "public").as_posix(), "sha256": digest(path), "bytes": path.stat().st_size}
               for path in sorted(package.iterdir())]
    members.append({"path": "/datasets/numerical-methods/sms-spam.csv", "sha256": digest(DATASET), "bytes": DATASET.stat().st_size})
    write_json(package / "manifest.json", {
        "contractVersion": "classification-project-sms-v1", "members": members,
        "source": {"datasetManifest": "/datasets/numerical-methods/sms-spam-manifest.json", "license": "CC BY 4.0", "creators": ["Tiago Almeida", "José María Gómez Hidalgo"]},
        "policy": summary["policy"], "notebookExecutions": {"count": 2, "freshKernelEach": True, "network": False},
    })


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group(required=True)
    modes.add_argument("--stage", action="store_true")
    modes.add_argument("--check", action="store_true")
    modes.add_argument("--worker", type=Path, help=argparse.SUPPRESS)
    parser.add_argument("--kernel", help=argparse.SUPPRESS)
    args = parser.parse_args()
    if args.worker:
        if os.environ.get("ML_ATLAS_PHASE26_NETWORK_BLOCKED") != "1" or not args.kernel:
            raise ValueError("Worker requires the audited offline environment")
        worker(args.worker, args.kernel)
        return
    spec = importlib.util.spec_from_file_location("sms_offline_environment", ROOT / "scripts/loss-functions/build-phase-26-assets.py")
    environment = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = environment
    spec.loader.exec_module(environment)
    before = environment._git_visible_repository_snapshot()
    with tempfile.TemporaryDirectory(prefix="ml-atlas-sms-candidate-") as temporary:
        output = Path(temporary)
        with environment.isolated_environment(block_network=True) as isolated:
            subprocess.run([str(isolated.python), str(Path(__file__).resolve()), "--worker", str(output), "--kernel", isolated.kernel_name],
                           check=True, env=isolated.environment, timeout=480)
        if args.check:
            expected = {path.relative_to(output) for path in output.rglob("*") if path.is_file()}
            observed = {path.relative_to(ROOT) for path in (ROOT / PACKAGE).rglob("*") if path.is_file()} | {RUNTIME}
            if expected != observed:
                raise ValueError("Frozen reference file inventory differs")
            for relative in expected:
                if (ROOT / relative).read_bytes() != (output / relative).read_bytes():
                    raise ValueError(f"Frozen reference drift: {relative}")
            if environment._git_visible_repository_snapshot() != before:
                raise ValueError("Offline check changed repository bytes or mtimes")
            print("SMS reference and 2 fresh bilingual Notebook executions verified offline; no repository writes.")
        else:
            destination = ROOT / ".cache/classification-project" / ("candidate-" + uuid.uuid4().hex)
            shutil.copytree(output, destination)
            print(f"Validated candidate: {destination}")


if __name__ == "__main__":
    main()
