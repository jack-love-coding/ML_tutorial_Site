#!/usr/bin/env python3
"""Generate, execute, validate, and atomically publish Numerical Methods Batch 3."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import shutil
import sys
import tempfile
import uuid
from pathlib import Path
from typing import Any

import nbformat
from nbclient import NotebookClient


REPO_ROOT = Path(__file__).resolve().parents[2]
DATASET_DIR = REPO_ROOT / "public/datasets/numerical-methods"
NOTEBOOK_DIR = REPO_ROOT / "public/notebooks/numerical-methods"
OUTPUT_DIR = NOTEBOOK_DIR / "batch-3-outputs"
FIXTURE_PATH = DATASET_DIR / "logit-calibration-fixture.json"
FIXTURE_MANIFEST_PATH = DATASET_DIR / "logit-calibration-manifest.json"
REQUIREMENTS_PATH = NOTEBOOK_DIR / "requirements.txt"
NOTEBOOK_PATH = NOTEBOOK_DIR / "logit-bias-calibration.zh-CN.ipynb"
GENERATOR_PATH = Path(__file__).resolve()
CONTRACT_VERSION = "numerical-methods-batch-3-v1"
FINITE_OUTPUT_FILE = "finite-difference-calibration-summary.json"
ROOT_OUTPUT_FILE = "nonlinear-calibration-summary.json"


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def json_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode("utf-8")


def markdown(cell_id: str, source: str) -> nbformat.NotebookNode:
    cell = nbformat.v4.new_markdown_cell(source.strip())
    cell["id"] = cell_id
    return cell


def code(cell_id: str, source: str) -> nbformat.NotebookNode:
    cell = nbformat.v4.new_code_cell(source.strip())
    cell["id"] = cell_id
    return cell


def notebook(cells: list[nbformat.NotebookNode]) -> nbformat.NotebookNode:
    return nbformat.v4.new_notebook(
        cells=cells,
        metadata={
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "version": f"{sys.version_info.major}.{sys.version_info.minor}"},
            "mlAtlas": {"contractVersion": CONTRACT_VERSION, "locale": "zh-CN"},
        },
    )


def calibration_notebook(fixture_sha: str) -> nbformat.NotebookNode:
    return notebook([
        markdown(
            "calibration-intro",
            r"""
# 从有限差分到非线性求根：logit 偏置校准

这份 Notebook 用同一个标量问题连接两章数值方法。我们有 12 个固定 logit $z_i$，给它们共同加一个偏置 $b$，再观察平均 sigmoid 概率：

$$
p_i(b)=\sigma(z_i+b),\qquad
F(b)=\frac{1}{n}\sum_i p_i(b)-0.62.
$$

有限差分章节用附近的 $F(b\pm h)$ 检查 $F'(b)$；非线性方程章节继续求 $F(b)=0$。这只是确定性教学夹具，不训练模型，也不把“均值匹配”当成完整概率校准。
""",
        ),
        code(
            "calibration-load-fixture",
            f"""
from pathlib import Path
import hashlib
import json
import os

import numpy as np
from scipy.special import expit

EXPECTED_FIXTURE_SHA256 = "{fixture_sha}"

def locate_fixture():
    candidates = [
        Path("logit-calibration-fixture.json"),
        Path(os.environ["ML_ATLAS_CALIBRATION_FIXTURE_PATH"]) if os.environ.get("ML_ATLAS_CALIBRATION_FIXTURE_PATH") else None,
        Path("public/datasets/numerical-methods/logit-calibration-fixture.json"),
    ]
    for candidate in candidates:
        if candidate is not None and candidate.is_file():
            return candidate
    raise FileNotFoundError("Place logit-calibration-fixture.json beside this Notebook or set ML_ATLAS_CALIBRATION_FIXTURE_PATH")

fixture_path = locate_fixture()
observed_sha = hashlib.sha256(fixture_path.read_bytes()).hexdigest()
assert observed_sha == EXPECTED_FIXTURE_SHA256
fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
assert fixture["contractVersion"] == "numerical-methods-batch-3-v1"

logits = np.asarray(fixture["logits"], dtype=np.float64)
target_rate = float(fixture["targetPositiveRate"])
probe_bias = float(fixture["finiteDifferenceProbeBias"])
bracket = tuple(float(value) for value in fixture["rootBracket"])
newton_start = float(fixture["newtonStart"])
secant_starts = tuple(float(value) for value in fixture["secantStarts"])

assert logits.shape == (12,)
assert np.isfinite(logits).all()
assert 0 < target_rate < 1
assert bracket[0] < bracket[1]
print(f"fixture={{fixture_path.name}} · logits={{len(logits)}} · target={{target_rate:.2f}} · sha256={{observed_sha[:12]}}…")
""",
        ),
        markdown(
            "calibration-residual",
            r"""
## 1. 先固定同一个残差与解析导数

共同偏置不会改变样本排序，只会整体移动 sigmoid 概率。残差 $F(b)$ 在本例中严格单调递增，因为

$$
F'(b)=\frac{1}{n}\sum_i p_i(b)(1-p_i(b))>0.
$$

因此只要区间两端异号，根就是唯一的。解析导数用于核对有限差分；后面 Newton 法也会使用同一导数。
""",
        ),
        code(
            "calibration-functions",
            """
def probabilities(bias):
    return expit(logits + float(bias))

def residual(bias):
    return float(probabilities(bias).mean() - target_rate)

def residual_derivative(bias):
    p = probabilities(bias)
    return float(np.mean(p * (1.0 - p)))

baseline_mean = float(probabilities(0.0).mean())
probe_residual = residual(probe_bias)
probe_exact_derivative = residual_derivative(probe_bias)
print(f"mean probability at b=0 = {baseline_mean:.12f}")
print(f"F({probe_bias:.2f}) = {probe_residual:.12f}")
print(f"analytic F'({probe_bias:.2f}) = {probe_exact_derivative:.12f}")
print(f"bracket residuals = [{residual(bracket[0]):.12f}, {residual(bracket[1]):.12f}]")
""",
        ),
        markdown(
            "finite-difference-sweep",
            r"""
## 2. 同一导数，不同步长

前向差分只看 $F(b+h)-F(b)$，主截断误差为 $O(h)$；中心差分比较两侧，主截断误差为 $O(h^2)$：

$$
D_f(h)=\frac{F(b+h)-F(b)}{h},\qquad
D_c(h)=\frac{F(b+h)-F(b-h)}{2h}.
$$

步长从 $10^{-1}$ 缩到 $10^{-12}$。误差先下降，再因为相消与浮点舍入上升，所以“最小的 $h$”不是“最好的 $h$”。
""",
        ),
        code(
            "finite-difference-compute",
            """
def forward_difference(fn, point, step):
    return (fn(point + step) - fn(point)) / step

def central_difference(fn, point, step):
    return (fn(point + step) - fn(point - step)) / (2.0 * step)

step_exponents = list(range(-1, -13, -1))
step_sweep = []
for exponent in step_exponents:
    step = 10.0 ** exponent
    forward = forward_difference(residual, probe_bias, step)
    central = central_difference(residual, probe_bias, step)
    step_sweep.append({
        "exponent": exponent,
        "step": step,
        "forward": forward,
        "forwardAbsoluteError": abs(forward - probe_exact_derivative),
        "central": central,
        "centralAbsoluteError": abs(central - probe_exact_derivative),
    })

best_forward = min(step_sweep, key=lambda row: row["forwardAbsoluteError"])
best_central = min(step_sweep, key=lambda row: row["centralAbsoluteError"])
print(" exponent      forward error      central error")
for row in step_sweep:
    print(f"{row['exponent']:>9d}  {row['forwardAbsoluteError']:.3e}       {row['centralAbsoluteError']:.3e}")
print(f"best sampled forward h = {best_forward['step']:.0e} · error = {best_forward['forwardAbsoluteError']:.3e}")
print(f"best sampled central h = {best_central['step']:.0e} · error = {best_central['centralAbsoluteError']:.3e}")
""",
        ),
        code(
            "finite-difference-summary",
            """
finite_summary = {
    "contractVersion": "numerical-methods-batch-3-v1",
    "outputId": "finite-difference-calibration-summary",
    "fixtureSha256": EXPECTED_FIXTURE_SHA256,
    "logitCount": int(len(logits)),
    "targetPositiveRate": target_rate,
    "baselineMeanProbability": baseline_mean,
    "probeBias": probe_bias,
    "probeResidual": probe_residual,
    "analyticDerivative": probe_exact_derivative,
    "stepSweep": step_sweep,
    "bestSampledForward": best_forward,
    "bestSampledCentral": best_central,
}

output_dir = Path(os.environ.get("ML_ATLAS_NUMERICAL_BATCH3_OUTPUT_DIR", "batch-3-outputs"))
output_dir.mkdir(parents=True, exist_ok=True)
(output_dir / "finite-difference-calibration-summary.json").write_text(
    json.dumps(finite_summary, ensure_ascii=False, indent=2, allow_nan=False) + "\\n",
    encoding="utf-8",
)
print(json.dumps({
    "probeBias": finite_summary["probeBias"],
    "analyticDerivative": finite_summary["analyticDerivative"],
    "bestForwardStep": best_forward["step"],
    "bestForwardError": best_forward["forwardAbsoluteError"],
    "bestCentralStep": best_central["step"],
    "bestCentralError": best_central["centralAbsoluteError"],
}, ensure_ascii=False, indent=2))
""",
        ),
        markdown(
            "root-finding",
            r"""
## 3. 把同一个残差压到零

现在不再问某点斜率，而是找满足 $F(b)=0$ 的偏置。

- 二分法维护异号区间，每次把区间宽度减半。
- Newton 法使用 $b_{k+1}=b_k-F(b_k)/F'(b_k)$。
- 割线法用两个函数值近似导数，不需要解析 $F'(b)$。

下面的循环同时记录迭代点、残差、步长或区间宽度，以及函数/导数调用次数。停止条件固定为残差不超过 $10^{-12}$；二分法还会检查区间宽度，开放方法还会检查步长。
""",
        ),
        code(
            "root-finding-solvers",
            """
RESIDUAL_TOLERANCE = 1e-12
POSITION_TOLERANCE = 1e-10
MAX_ITERATIONS = 80

def bisection_trace(fn, initial_bracket):
    a, b = initial_bracket
    fa, fb = fn(a), fn(b)
    function_evaluations = 2
    if np.sign(fa) == np.sign(fb):
        raise ValueError("Bisection requires a sign-changing bracket")
    trace = []
    for iteration in range(1, MAX_ITERATIONS + 1):
        midpoint = (a + b) / 2.0
        fm = fn(midpoint)
        function_evaluations += 1
        trace.append({
            "iteration": iteration,
            "x": midpoint,
            "residual": fm,
            "bracketWidth": b - a,
        })
        if abs(fm) <= RESIDUAL_TOLERANCE or (b - a) / 2.0 <= POSITION_TOLERANCE:
            break
        if np.sign(fa) == np.sign(fm):
            a, fa = midpoint, fm
        else:
            b, fb = midpoint, fm
    return {
        "method": "bisection",
        "root": trace[-1]["x"],
        "residual": abs(trace[-1]["residual"]),
        "iterationCount": len(trace),
        "functionEvaluations": function_evaluations,
        "derivativeEvaluations": 0,
        "trace": trace,
    }

def newton_trace(fn, derivative, start):
    x = start
    function_evaluations = 0
    derivative_evaluations = 0
    trace = []
    for iteration in range(MAX_ITERATIONS + 1):
        fx = fn(x)
        function_evaluations += 1
        trace.append({"iteration": iteration, "x": x, "residual": fx})
        if abs(fx) <= RESIDUAL_TOLERANCE:
            break
        dfx = derivative(x)
        derivative_evaluations += 1
        if not np.isfinite(dfx) or abs(dfx) <= np.finfo(float).eps:
            raise ArithmeticError("Newton derivative is too small")
        step = -fx / dfx
        trace[-1]["step"] = step
        if abs(step) <= POSITION_TOLERANCE:
            break
        x = x + step
        if not np.isfinite(x) or abs(x) > 100:
            raise ArithmeticError("Newton iteration left the safeguarded teaching domain")
    return {
        "method": "newton",
        "root": trace[-1]["x"],
        "residual": abs(trace[-1]["residual"]),
        "iterationCount": len(trace) - 1,
        "functionEvaluations": function_evaluations,
        "derivativeEvaluations": derivative_evaluations,
        "trace": trace,
    }

def secant_trace(fn, starts):
    previous, current = starts
    previous_value, current_value = fn(previous), fn(current)
    function_evaluations = 2
    trace = [
        {"iteration": 0, "x": previous, "residual": previous_value},
        {"iteration": 1, "x": current, "residual": current_value},
    ]
    for iteration in range(2, MAX_ITERATIONS + 2):
        denominator = current_value - previous_value
        if abs(denominator) <= np.finfo(float).eps:
            raise ArithmeticError("Secant denominator is too small")
        step = -current_value * (current - previous) / denominator
        next_value_x = current + step
        if not np.isfinite(next_value_x) or abs(next_value_x) > 100:
            raise ArithmeticError("Secant iteration left the safeguarded teaching domain")
        next_value = fn(next_value_x)
        function_evaluations += 1
        trace[-1]["step"] = step
        trace.append({"iteration": iteration, "x": next_value_x, "residual": next_value})
        previous, previous_value = current, current_value
        current, current_value = next_value_x, next_value
        if abs(next_value) <= RESIDUAL_TOLERANCE or abs(step) <= POSITION_TOLERANCE:
            break
    return {
        "method": "secant",
        "root": trace[-1]["x"],
        "residual": abs(trace[-1]["residual"]),
        "iterationCount": len(trace) - 2,
        "functionEvaluations": function_evaluations,
        "derivativeEvaluations": 0,
        "trace": trace,
    }

bisection = bisection_trace(residual, bracket)
newton = newton_trace(residual, residual_derivative, newton_start)
secant = secant_trace(residual, secant_starts)
solver_results = [bisection, newton, secant]

for result in solver_results:
    print(
        f"{result['method']:>9s}: root={result['root']:.12f} · "
        f"|F|={result['residual']:.3e} · iterations={result['iterationCount']} · "
        f"F calls={result['functionEvaluations']} · F' calls={result['derivativeEvaluations']}"
    )
""",
        ),
        markdown(
            "root-finding-failures",
            r"""
## 4. 快不等于无条件可靠

本例的 $F'(b)$ 始终为正，Newton 从 $b=0$ 很快。但在极端负偏置处，sigmoid 饱和会让导数很小，裸 Newton 步可能直接冲出合理范围。二分法则必须先得到异号区间；目标率若超出可达到范围，区间不会异号。

实际求解器常使用 safeguarded Newton、Brent 法、阻尼或信赖域：先保留可靠边界，再在局部接受更快的开放步。这里固定记录失败条件，不把一次成功轨迹误写成全局保证。
""",
        ),
        code(
            "root-finding-failure-checks",
            """
failure_checks = {}
try:
    bisection_trace(residual, (-4.0, -3.0))
except ValueError as error:
    failure_checks["invalidBracket"] = str(error)

try:
    newton_trace(residual, residual_derivative, -8.0)
except ArithmeticError as error:
    failure_checks["saturatedNewton"] = str(error)

assert set(failure_checks) == {"invalidBracket", "saturatedNewton"}
print(json.dumps(failure_checks, ensure_ascii=False, indent=2))
""",
        ),
        code(
            "root-finding-summary",
            """
root_summary = {
    "contractVersion": "numerical-methods-batch-3-v1",
    "outputId": "nonlinear-calibration-summary",
    "fixtureSha256": EXPECTED_FIXTURE_SHA256,
    "logitCount": int(len(logits)),
    "targetPositiveRate": target_rate,
    "root": float(newton["root"]),
    "meanProbabilityAtRoot": float(probabilities(newton["root"]).mean()),
    "derivativeAtRoot": residual_derivative(newton["root"]),
    "residualTolerance": RESIDUAL_TOLERANCE,
    "positionTolerance": POSITION_TOLERANCE,
    "bracket": list(bracket),
    "solvers": solver_results,
    "failureChecks": failure_checks,
}

(output_dir / "nonlinear-calibration-summary.json").write_text(
    json.dumps(root_summary, ensure_ascii=False, indent=2, allow_nan=False) + "\\n",
    encoding="utf-8",
)
print(json.dumps({
    "root": root_summary["root"],
    "meanProbabilityAtRoot": root_summary["meanProbabilityAtRoot"],
    "derivativeAtRoot": root_summary["derivativeAtRoot"],
    "solverIterations": {row["method"]: row["iterationCount"] for row in solver_results},
    "failureChecks": failure_checks,
}, ensure_ascii=False, indent=2))
""",
        ),
        markdown(
            "calibration-boundary",
            r"""
## 5. 读完后应保留的边界

1. 有限差分是用函数值验证局部变化率，步长要在截断误差与浮点误差之间折中。
2. 求根算法比较的是可靠性、局部速度、导数需求和调用成本，不是只比迭代次数。
3. 匹配平均概率只解决这个标量方程，不代表每个概率都已校准；真实应用还需要独立数据、可靠性图和任务指标。
4. 下一章的数值优化会把“让残差为零”扩展为“沿着目标函数寻找更小值”，并加入下降、线搜索和停止判断。
""",
        ),
    ])


def execute_notebook(source: nbformat.NotebookNode, destination: Path, working_directory: Path) -> None:
    client = NotebookClient(
        source,
        timeout=180,
        kernel_name="python3",
        allow_errors=False,
        record_timing=False,
        resources={"metadata": {"path": str(working_directory)}},
    )
    client.execute(cwd=str(working_directory))
    destination.write_text(nbformat.writes(source), encoding="utf-8")


def assert_finite(value: Any, key_path: str = "root") -> None:
    if isinstance(value, float) and not math.isfinite(value):
        raise ValueError(f"Non-finite number at {key_path}")
    if isinstance(value, list):
        for index, nested in enumerate(value):
            assert_finite(nested, f"{key_path}[{index}]")
    if isinstance(value, dict):
        for key, nested in value.items():
            assert_finite(nested, f"{key_path}.{key}")


def validate_summary(path: Path, output_id: str, fixture_sha: str) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if value.get("contractVersion") != CONTRACT_VERSION:
        raise ValueError(f"Unexpected contract in {path}")
    if value.get("outputId") != output_id:
        raise ValueError(f"Unexpected output id in {path}")
    if value.get("fixtureSha256") != fixture_sha:
        raise ValueError(f"Unexpected fixture hash in {path}")
    assert_finite(value)
    return value


def artifact_entry(path: Path, public_path: str, **extra: Any) -> dict[str, Any]:
    return {
        **extra,
        "publicPath": public_path,
        "sha256": sha256_file(path),
        "bytes": path.stat().st_size,
    }


def execute_transaction() -> tuple[Path, Path]:
    fixture_manifest = json.loads(FIXTURE_MANIFEST_PATH.read_text(encoding="utf-8"))
    fixture_sha = fixture_manifest["fixture"]["sha256"]
    if sha256_file(FIXTURE_PATH) != fixture_sha:
        raise ValueError("Committed calibration fixture does not match its manifest")

    token = uuid.uuid4().hex
    transaction_dir = Path(tempfile.mkdtemp(prefix=f"ml-atlas-batch3-{token}-", dir=NOTEBOOK_DIR))
    notebook_temp = NOTEBOOK_DIR / f".{NOTEBOOK_PATH.name}.{token}.tmp"
    previous_output = os.environ.get("ML_ATLAS_NUMERICAL_BATCH3_OUTPUT_DIR")
    previous_fixture = os.environ.get("ML_ATLAS_CALIBRATION_FIXTURE_PATH")
    previous_path = os.environ.get("PATH", "")
    try:
        os.environ["ML_ATLAS_NUMERICAL_BATCH3_OUTPUT_DIR"] = str(transaction_dir)
        os.environ["ML_ATLAS_CALIBRATION_FIXTURE_PATH"] = str(FIXTURE_PATH)
        os.environ["PATH"] = f"{Path(sys.executable).parent}{os.pathsep}{previous_path}"
        execute_notebook(calibration_notebook(fixture_sha), notebook_temp, REPO_ROOT)

        finite_summary = validate_summary(
            transaction_dir / FINITE_OUTPUT_FILE,
            "finite-difference-calibration-summary",
            fixture_sha,
        )
        root_summary = validate_summary(
            transaction_dir / ROOT_OUTPUT_FILE,
            "nonlinear-calibration-summary",
            fixture_sha,
        )
        if finite_summary["logitCount"] != 12 or finite_summary["bestSampledCentral"]["step"] >= 1e-3:
            raise ValueError("Unexpected finite-difference summary")
        if abs(root_summary["meanProbabilityAtRoot"] - 0.62) > 1e-10:
            raise ValueError("Unexpected calibration root")
        if set(root_summary["failureChecks"]) != {"invalidBracket", "saturatedNewton"}:
            raise ValueError("Missing solver failure checks")

        manifest = {
            "contractVersion": CONTRACT_VERSION,
            "fixture": {
                "publicPath": fixture_manifest["fixture"]["publicPath"],
                "sha256": fixture_sha,
            },
            "generator": {
                "path": "scripts/numerical-methods/generate-batch-3-notebook.py",
                "sha256": sha256_file(GENERATOR_PATH),
            },
            "requirements": {
                "publicPath": "/notebooks/numerical-methods/requirements.txt",
                "sha256": sha256_file(REQUIREMENTS_PATH),
            },
            "notebook": artifact_entry(
                notebook_temp,
                "/notebooks/numerical-methods/logit-bias-calibration.zh-CN.ipynb",
                moduleIds=["finite-difference-methods", "nonlinear-equations"],
            ),
            "outputs": [
                artifact_entry(
                    transaction_dir / FINITE_OUTPUT_FILE,
                    f"/notebooks/numerical-methods/batch-3-outputs/{FINITE_OUTPUT_FILE}",
                    outputId="finite-difference-calibration-summary",
                ),
                artifact_entry(
                    transaction_dir / ROOT_OUTPUT_FILE,
                    f"/notebooks/numerical-methods/batch-3-outputs/{ROOT_OUTPUT_FILE}",
                    outputId="nonlinear-calibration-summary",
                ),
            ],
        }
        (transaction_dir / "manifest.json").write_bytes(json_bytes(manifest))
        return transaction_dir, notebook_temp
    except Exception:
        shutil.rmtree(transaction_dir, ignore_errors=True)
        notebook_temp.unlink(missing_ok=True)
        raise
    finally:
        for key, previous in (
            ("ML_ATLAS_NUMERICAL_BATCH3_OUTPUT_DIR", previous_output),
            ("ML_ATLAS_CALIBRATION_FIXTURE_PATH", previous_fixture),
        ):
            if previous is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = previous
        os.environ["PATH"] = previous_path


def compare_committed(transaction_dir: Path, notebook_temp: Path) -> None:
    differences: list[str] = []
    if not NOTEBOOK_PATH.is_file() or NOTEBOOK_PATH.read_bytes() != notebook_temp.read_bytes():
        differences.append(str(NOTEBOOK_PATH.relative_to(REPO_ROOT)))

    generated_files = {path.relative_to(transaction_dir) for path in transaction_dir.rglob("*") if path.is_file()}
    committed_files = {path.relative_to(OUTPUT_DIR) for path in OUTPUT_DIR.rglob("*") if path.is_file()} if OUTPUT_DIR.is_dir() else set()
    for relative_path in sorted(generated_files | committed_files):
        generated = transaction_dir / relative_path
        current = OUTPUT_DIR / relative_path
        if not generated.is_file() or not current.is_file() or generated.read_bytes() != current.read_bytes():
            differences.append(str(current.relative_to(REPO_ROOT)))
    if differences:
        raise RuntimeError(f"Committed Batch 3 artifacts differ: {', '.join(differences)}")


def validate_standalone(notebook_path: Path, fixture_sha: str) -> None:
    temporary_dir = Path(tempfile.mkdtemp(prefix="ml-atlas-batch3-download-"))
    standalone_output = temporary_dir / "outputs"
    previous_output = os.environ.get("ML_ATLAS_NUMERICAL_BATCH3_OUTPUT_DIR")
    previous_fixture = os.environ.pop("ML_ATLAS_CALIBRATION_FIXTURE_PATH", None)
    previous_path = os.environ.get("PATH", "")
    try:
        shutil.copy2(FIXTURE_PATH, temporary_dir / FIXTURE_PATH.name)
        downloaded = nbformat.read(notebook_path, as_version=4)
        os.environ["ML_ATLAS_NUMERICAL_BATCH3_OUTPUT_DIR"] = str(standalone_output)
        os.environ["PATH"] = f"{Path(sys.executable).parent}{os.pathsep}{previous_path}"
        client = NotebookClient(
            downloaded,
            timeout=180,
            kernel_name="python3",
            allow_errors=False,
            record_timing=False,
            resources={"metadata": {"path": str(temporary_dir)}},
        )
        client.execute(cwd=str(temporary_dir))
        validate_summary(
            standalone_output / FINITE_OUTPUT_FILE,
            "finite-difference-calibration-summary",
            fixture_sha,
        )
        validate_summary(
            standalone_output / ROOT_OUTPUT_FILE,
            "nonlinear-calibration-summary",
            fixture_sha,
        )
    finally:
        if previous_output is None:
            os.environ.pop("ML_ATLAS_NUMERICAL_BATCH3_OUTPUT_DIR", None)
        else:
            os.environ["ML_ATLAS_NUMERICAL_BATCH3_OUTPUT_DIR"] = previous_output
        if previous_fixture is not None:
            os.environ["ML_ATLAS_CALIBRATION_FIXTURE_PATH"] = previous_fixture
        os.environ["PATH"] = previous_path
        shutil.rmtree(temporary_dir, ignore_errors=True)


def publish(transaction_dir: Path, notebook_temp: Path) -> None:
    token = uuid.uuid4().hex
    output_backup = NOTEBOOK_DIR / f".batch-3-outputs.{token}.bak"
    notebook_backup = NOTEBOOK_DIR / f".{NOTEBOOK_PATH.name}.{token}.bak"
    try:
        if OUTPUT_DIR.exists():
            OUTPUT_DIR.rename(output_backup)
        transaction_dir.rename(OUTPUT_DIR)
        if NOTEBOOK_PATH.exists():
            NOTEBOOK_PATH.rename(notebook_backup)
        notebook_temp.rename(NOTEBOOK_PATH)
    except Exception:
        if OUTPUT_DIR.exists() and output_backup.exists():
            shutil.rmtree(OUTPUT_DIR, ignore_errors=True)
        if output_backup.exists():
            output_backup.rename(OUTPUT_DIR)
        if NOTEBOOK_PATH.exists() and notebook_backup.exists():
            NOTEBOOK_PATH.unlink(missing_ok=True)
        if notebook_backup.exists():
            notebook_backup.rename(NOTEBOOK_PATH)
        raise
    finally:
        shutil.rmtree(output_backup, ignore_errors=True)
        notebook_backup.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Regenerate and compare without publishing")
    args = parser.parse_args()
    NOTEBOOK_DIR.mkdir(parents=True, exist_ok=True)
    transaction_dir, notebook_temp = execute_transaction()
    fixture_sha = json.loads(FIXTURE_MANIFEST_PATH.read_text(encoding="utf-8"))["fixture"]["sha256"]
    try:
        if args.check:
            compare_committed(transaction_dir, notebook_temp)
            validate_standalone(notebook_temp, fixture_sha)
            print("Batch 3 Notebook artifacts are current and the standalone download reruns successfully.")
        else:
            publish(transaction_dir, notebook_temp)
            print(f"Published {NOTEBOOK_PATH.relative_to(REPO_ROOT)}")
            print(f"Published {OUTPUT_DIR.relative_to(REPO_ROOT)}")
    finally:
        if transaction_dir.exists():
            shutil.rmtree(transaction_dir, ignore_errors=True)
        notebook_temp.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
