"""Notebook-bound lesson: diagnose Banknote training traces before changing one variable."""

from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Axes,
    Create,
    DashedVMobject,
    FadeIn,
    FadeOut,
    Group,
    Line,
    Scene,
    VGroup,
    VMobject,
    Write,
)

from common import (
    card,
    circle_marker,
    cn_text,
    diamond_marker,
    disclaimer,
    equation,
    fit_width,
    square_marker,
    status_label,
    title_block,
    top_heading,
)
from palette import BACKGROUND, DATA_BLUE, GRID, MUTED, NAVY, ORANGE, PALE_BLUE, PAPER, RED, TEAL


CONTRACT_VERSION = "numerical-methods-batch-4-v1"
DIAGNOSTICS_OUTPUT_ID = "banknote-training-diagnostics-summary"
SCENE_ID = "banknote-training-diagnostics"
RUN_ORDER = (
    "raw-fixed",
    "standardized-too-small",
    "standardized-stable",
    "standardized-too-large",
    "standardized-armijo",
)
FOCUS_RUN_IDS = (
    "standardized-too-small",
    "standardized-stable",
    "standardized-too-large",
    "standardized-armijo",
)
SELECTED_RUN_ID = "standardized-armijo"
EXPECTED_DIAGNOSES = {
    "raw-fixed": (
        "validation improves and then degrades while steps remain large",
        "raw feature scales make the fixed step poorly conditioned",
        "standardize features while keeping the step at 4.0",
        "smoother descent and mathematical convergence",
    ),
    "standardized-too-small": (
        "loss falls safely but the gradient remains large at the iteration cap",
        "the fixed step is too small",
        "increase the fixed step from 0.02 to 4.0",
        "reach the gradient tolerance within 500 updates",
    ),
    "standardized-stable": (
        "training and validation losses settle with a small gradient",
        "standardization makes the fixed step usable",
        "replace the fixed step with Armijo from 32.0",
        "reject unsafe trials and converge in fewer accepted updates",
    ),
    "standardized-too-large": (
        "a low transient validation point is followed by deterioration",
        "the fixed step overshoots",
        "use Armijo backtracking instead of accepting 32.0",
        "accept 16.0 first and retain convergence eligibility",
    ),
    "standardized-armijo": (
        "the first trial is rejected and the gradient tolerance is reached",
        "sufficient decrease adapts the usable step",
        "keep the method and inspect the selected test endpoint",
        "the endpoint agrees closely with the library baseline",
    ),
}
EXPECTED_TERMINALS = {
    "raw-fixed": ("model-selection", "validation-patience", 112),
    "standardized-too-small": ("safety", "max-iterations", 500),
    "standardized-stable": ("mathematical-convergence", "gradient-norm", 484),
    "standardized-too-large": ("model-selection", "validation-patience", 73),
    "standardized-armijo": ("mathematical-convergence", "gradient-norm", 48),
}
REPO_ROOT = Path(__file__).resolve().parents[3]
DIAGNOSTICS_SUMMARY_PATH = (
    REPO_ROOT / "public/notebooks/numerical-methods/batch-4-outputs/training-diagnostics-summary.json"
)
TRACE_PATH = REPO_ROOT / "public/notebooks/numerical-methods/batch-4-outputs/banknote-training-traces.json"


@dataclass(frozen=True)
class LockedSceneInputs:
    summary: Mapping[str, Any]
    diagnoses: Mapping[str, Mapping[str, Any]]
    runs: Mapping[str, Mapping[str, Any]]
    traces: Mapping[str, tuple[Mapping[str, Any], ...]]
    best_rows: Mapping[str, Mapping[str, Any]]
    terminal_rows: Mapping[str, Mapping[str, Any]]
    final_report: Mapping[str, Any]
    baseline: Mapping[str, Any]
    comparison: Mapping[str, Any]


def _load_object(path: Path) -> Mapping[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError(f"{SCENE_ID}: cannot load locked JSON {path}") from error
    if not isinstance(value, dict):
        raise RuntimeError(f"{SCENE_ID}: {path} must contain a JSON object")
    return value


def _mapping(value: Any, name: str) -> Mapping[str, Any]:
    if not isinstance(value, dict):
        raise RuntimeError(f"{SCENE_ID}: missing object {name}")
    return value


def _finite_number(value: Any, name: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value)):
        raise RuntimeError(f"{SCENE_ID}: {name} must be finite")
    return float(value)


def _nonnegative_int(value: Any, name: str) -> int:
    number = _finite_number(value, name)
    if not number.is_integer() or number < 0:
        raise RuntimeError(f"{SCENE_ID}: {name} must be a non-negative integer")
    return int(number)


def _close(left: Any, right: Any, *, tolerance: float = 1e-12) -> bool:
    return abs(_finite_number(left, "left comparison") - _finite_number(right, "right comparison")) <= tolerance


def _trace_run(trace_file: Mapping[str, Any], run_id: str) -> Mapping[str, Any]:
    runs = trace_file.get("runs")
    if not isinstance(runs, list):
        raise RuntimeError(f"{SCENE_ID}: trace runs must be a list")
    matches = [run for run in runs if isinstance(run, dict) and run.get("runId") == run_id]
    if len(matches) != 1:
        raise RuntimeError(f"{SCENE_ID}: expected exactly one trace for {run_id}")
    return matches[0]


def _validate_diagnoses(summary: Mapping[str, Any]) -> Mapping[str, Mapping[str, Any]]:
    values = summary.get("diagnostics")
    if not isinstance(values, list) or len(values) != len(RUN_ORDER):
        raise RuntimeError(f"{SCENE_ID}: diagnostics must contain the locked five-run order")
    if tuple(summary.get("runOrder", ())) != RUN_ORDER:
        raise RuntimeError(f"{SCENE_ID}: diagnostic run order drifted")

    diagnoses: dict[str, Mapping[str, Any]] = {}
    for index, run_id in enumerate(RUN_ORDER):
        diagnosis = _mapping(values[index], f"diagnostics[{index}]")
        if diagnosis.get("runId") != run_id:
            raise RuntimeError(f"{SCENE_ID}: diagnosis order or run ID drifted for {run_id}")
        actual_chain = tuple(
            diagnosis.get(field)
            for field in ("visible", "plausibleCause", "changeOneVariable", "expectedNextRun")
        )
        if actual_chain != EXPECTED_DIAGNOSES[run_id]:
            raise RuntimeError(f"{SCENE_ID}: exact four-step diagnosis drifted for {run_id}")
        terminal = _mapping(diagnosis.get("terminal"), f"{run_id}.diagnostic.terminal")
        expected_terminal = EXPECTED_TERMINALS[run_id]
        actual_terminal = (terminal.get("kind"), terminal.get("reason"), terminal.get("iteration"))
        if actual_terminal != expected_terminal:
            raise RuntimeError(f"{SCENE_ID}: diagnostic terminal drifted for {run_id}")
        diagnoses[run_id] = diagnosis
    return diagnoses


def _validate_trace(
    run: Mapping[str, Any], diagnosis: Mapping[str, Any]
) -> tuple[tuple[Mapping[str, Any], ...], Mapping[str, Any], Mapping[str, Any]]:
    run_id = str(run.get("runId"))
    expected_kind, expected_reason, expected_iteration = EXPECTED_TERMINALS[run_id]
    terminal = _mapping(run.get("terminal"), f"{run_id}.terminal")
    diagnostic_terminal = _mapping(diagnosis.get("terminal"), f"{run_id}.diagnostic.terminal")
    if terminal != diagnostic_terminal:
        raise RuntimeError(f"{SCENE_ID}: trace and diagnosis terminals differ for {run_id}")
    if (terminal.get("kind"), terminal.get("reason"), terminal.get("iteration")) != (
        expected_kind,
        expected_reason,
        expected_iteration,
    ):
        raise RuntimeError(f"{SCENE_ID}: trace terminal semantics drifted for {run_id}")

    rows = run.get("trace")
    if not isinstance(rows, list) or len(rows) < 2:
        raise RuntimeError(f"{SCENE_ID}: {run_id} must include start and accepted updates")
    checked: list[Mapping[str, Any]] = []
    previous_iteration = -1
    for index, value in enumerate(rows):
        row = _mapping(value, f"{run_id}.trace[{index}]")
        iteration = _nonnegative_int(row.get("iteration"), f"{run_id}.trace[{index}].iteration")
        if iteration <= previous_iteration:
            raise RuntimeError(f"{SCENE_ID}: {run_id} iterations must increase")
        previous_iteration = iteration
        for field in (
            "trainBce",
            "validationBce",
            "objective",
            "gradientNorm",
            "parameterStepNorm",
            "acceptedStepSize",
        ):
            number = _finite_number(row.get(field), f"{run_id}.trace[{index}].{field}")
            if field in ("trainBce", "validationBce", "objective") and number <= 0:
                raise RuntimeError(f"{SCENE_ID}: {run_id} {field} must remain positive")
        _nonnegative_int(row.get("backtrackCount"), f"{run_id}.trace[{index}].backtrackCount")
        parameters = row.get("parameters")
        if not isinstance(parameters, list) or len(parameters) != 5:
            raise RuntimeError(f"{SCENE_ID}: {run_id} row must contain five parameters")
        for parameter_index, parameter in enumerate(parameters):
            _finite_number(parameter, f"{run_id}.trace[{index}].parameters[{parameter_index}]")
        checked.append(row)

    if checked[0] != run.get("start"):
        raise RuntimeError(f"{SCENE_ID}: {run_id} start record must equal trace row 0")
    if checked[-1].get("iteration") != expected_iteration:
        raise RuntimeError(f"{SCENE_ID}: {run_id} terminal must be the last accepted row")
    best = _mapping(run.get("bestValidation"), f"{run_id}.bestValidation")
    best_iteration = _nonnegative_int(best.get("iteration"), f"{run_id}.bestValidation.iteration")
    best_matches = [row for row in checked if row.get("iteration") == best_iteration]
    if len(best_matches) != 1:
        raise RuntimeError(f"{SCENE_ID}: {run_id} best-validation iteration is absent")
    best_row = best_matches[0]
    if not _close(best_row.get("validationBce"), best.get("bce")):
        raise RuntimeError(f"{SCENE_ID}: {run_id} best-validation BCE drifted")
    if best_row.get("isBestValidation") is not True:
        raise RuntimeError(f"{SCENE_ID}: {run_id} best marker is not flagged in the trace")
    return tuple(checked), best_row, checked[-1]


def _validate_action_mapping(
    diagnoses: Mapping[str, Mapping[str, Any]], runs: Mapping[str, Mapping[str, Any]]
) -> None:
    small_config = _mapping(runs["standardized-too-small"].get("config"), "too-small.config")
    stable_config = _mapping(runs["standardized-stable"].get("config"), "stable.config")
    large_config = _mapping(runs["standardized-too-large"].get("config"), "too-large.config")
    armijo_config = _mapping(runs["standardized-armijo"].get("config"), "armijo.config")
    if not _close(small_config.get("step"), 0.02) or not _close(stable_config.get("step"), 4.0):
        raise RuntimeError(f"{SCENE_ID}: slow-to-stable action mapping must be 0.02 to 4.0")
    if small_config.get("armijo") is not None or stable_config.get("armijo") is not None:
        raise RuntimeError(f"{SCENE_ID}: slow and stable comparison must keep the fixed method")
    if not _close(large_config.get("step"), 32.0) or not _close(armijo_config.get("step"), 32.0):
        raise RuntimeError(f"{SCENE_ID}: large-to-Armijo comparison must keep initial step 32")
    if large_config.get("armijo") is not None or not isinstance(armijo_config.get("armijo"), dict):
        raise RuntimeError(f"{SCENE_ID}: second comparison must change only fixed to Armijo")
    first_backtrack = _mapping(runs["standardized-armijo"].get("firstBacktrack"), "armijo.firstBacktrack")
    if not _close(first_backtrack.get("acceptedStepSize"), 16.0):
        raise RuntimeError(f"{SCENE_ID}: Armijo expected next trace must accept 16 first")
    if _nonnegative_int(first_backtrack.get("backtrackCount"), "armijo.firstBacktrack.backtrackCount") != 1:
        raise RuntimeError(f"{SCENE_ID}: Armijo first accepted row must record one backtrack")
    if "0.02 to 4.0" not in str(diagnoses["standardized-too-small"].get("changeOneVariable")):
        raise RuntimeError(f"{SCENE_ID}: too-small single-variable action text drifted")
    if "Armijo backtracking" not in str(diagnoses["standardized-too-large"].get("changeOneVariable")):
        raise RuntimeError(f"{SCENE_ID}: too-large single-variable action text drifted")


def load_locked_inputs() -> LockedSceneInputs:
    """Load the exact diagnostic chains, trace markers, and selected endpoint report."""

    summary = _load_object(DIAGNOSTICS_SUMMARY_PATH)
    trace_file = _load_object(TRACE_PATH)
    for name, value in (("diagnostics summary", summary), ("trace file", trace_file)):
        if value.get("contractVersion") != CONTRACT_VERSION:
            raise RuntimeError(f"{SCENE_ID}: {name} contractVersion mismatch")
    if summary.get("outputId") != DIAGNOSTICS_OUTPUT_ID:
        raise RuntimeError(f"{SCENE_ID}: diagnostics outputId mismatch")
    if summary.get("datasetSha256") != trace_file.get("datasetSha256"):
        raise RuntimeError(f"{SCENE_ID}: dataset hash mismatch")
    if summary.get("constantsSha256") != trace_file.get("constantsSha256"):
        raise RuntimeError(f"{SCENE_ID}: constants hash mismatch")

    diagnoses = _validate_diagnoses(summary)
    runs: dict[str, Mapping[str, Any]] = {}
    traces: dict[str, tuple[Mapping[str, Any], ...]] = {}
    best_rows: dict[str, Mapping[str, Any]] = {}
    terminal_rows: dict[str, Mapping[str, Any]] = {}
    for run_id in RUN_ORDER:
        run = _trace_run(trace_file, run_id)
        rows, best_row, terminal_row = _validate_trace(run, diagnoses[run_id])
        runs[run_id] = run
        traces[run_id] = rows
        best_rows[run_id] = best_row
        terminal_rows[run_id] = terminal_row
    _validate_action_mapping(diagnoses, runs)

    if summary.get("selectedRunId") != SELECTED_RUN_ID:
        raise RuntimeError(f"{SCENE_ID}: selected run must remain standardized-armijo")
    if runs[SELECTED_RUN_ID].get("eligibleForFinalSelection") is not True:
        raise RuntimeError(f"{SCENE_ID}: selected run must remain mathematically eligible")
    final_report = _mapping(summary.get("finalReport"), "finalReport")
    if final_report.get("runId") != SELECTED_RUN_ID:
        raise RuntimeError(f"{SCENE_ID}: final report belongs only to standardized-armijo")
    if final_report.get("checkpointIteration") != best_rows[SELECTED_RUN_ID].get("iteration"):
        raise RuntimeError(f"{SCENE_ID}: final report checkpoint must equal the selected best marker")
    if not _close(final_report.get("threshold"), 0.5) or final_report.get("rocAucInput") != "probabilities":
        raise RuntimeError(f"{SCENE_ID}: final report threshold or ROC-AUC input drifted")
    manual = _mapping(final_report.get("manual"), "finalReport.manual")
    for field in ("testBce", "accuracy", "rocAuc"):
        _finite_number(manual.get(field), f"finalReport.manual.{field}")
    if manual.get("confusionMatrix") != [[110, 4], [0, 92]]:
        raise RuntimeError(f"{SCENE_ID}: selected confusion matrix drifted")

    baseline = _mapping(summary.get("baseline"), "baseline")
    comparison = _mapping(summary.get("comparison"), "comparison")
    if baseline.get("endpointOnly") is not True or baseline.get("perIterationComparison") is not False:
        raise RuntimeError(f"{SCENE_ID}: baseline must remain an endpoint-only check")
    if comparison.get("endpointOnly") is not True or comparison.get("perIterationComparison") is not False:
        raise RuntimeError(f"{SCENE_ID}: comparison must remain endpoint-only")
    if not _close(comparison.get("predictionAgreement"), 1.0):
        raise RuntimeError(f"{SCENE_ID}: endpoint prediction agreement drifted")
    baseline_metrics = _mapping(baseline.get("metrics"), "baseline.metrics")
    for field in ("testBce", "accuracy", "rocAuc"):
        _finite_number(baseline_metrics.get(field), f"baseline.metrics.{field}")

    return LockedSceneInputs(
        summary=summary,
        diagnoses=diagnoses,
        runs=runs,
        traces=traces,
        best_rows=best_rows,
        terminal_rows=terminal_rows,
        final_report=final_report,
        baseline=baseline,
        comparison=comparison,
    )


def _fmt(value: Any, digits: int = 6) -> str:
    return f"{_finite_number(value, 'display value'):.{digits}f}"


def _terminal_zh(terminal: Mapping[str, Any]) -> str:
    labels = {
        ("safety", "max-iterations"): "安全上限 · 达到最大迭代",
        ("model-selection", "validation-patience"): "模型选择 · 验证耐心停止",
        ("mathematical-convergence", "gradient-norm"): "数学收敛 · 梯度范数达标",
    }
    key = (terminal.get("kind"), terminal.get("reason"))
    if key not in labels:
        raise RuntimeError(f"{SCENE_ID}: unsupported terminal label {key}")
    return labels[key]


class BanknoteTrainingDiagnosticsScene(Scene):
    """Seven-beat, 72-second trace diagnosis sourced only from locked Notebook outputs."""

    def construct(self):
        self.camera.background_color = BACKGROUND
        self.locked = load_locked_inputs()
        self._opening()
        self._advance_to(8)
        self._four_step_method()
        self._advance_to(18)
        self._slow_vs_stable()
        self._advance_to(32)
        self._large_vs_armijo()
        self._advance_to(46)
        self._marker_meanings()
        self._advance_to(58)
        self._selected_report()
        self._advance_to(65)
        self._poster_ready_conclusion()
        self._advance_to(72)

    def _clear(self, *, run_time: float = 0.5):
        if self.mobjects:
            self.play(FadeOut(Group(*self.mobjects)), run_time=run_time)

    def _opening(self):
        small_step = _mapping(self.locked.runs["standardized-too-small"].get("config"), "small config")["step"]
        stable_step = _mapping(self.locked.runs["standardized-stable"].get("config"), "stable config")["step"]
        large_step = _mapping(self.locked.runs["standardized-too-large"].get("config"), "large config")["step"]
        armijo_step = _mapping(self.locked.runs["standardized-armijo"].get("config"), "Armijo config")["step"]
        heading = title_block(
            "数值方法 · 训练诊断",
            "先读轨迹，再只改一个变量",
            "Banknote 真实运行 · 非评分诊断 · 合成支持示例保持独立",
        )
        fit_width(heading, 11.8)
        question = card(
            cn_text("看到慢、震荡或提前停止时，下一次运行该改什么？", font_size=29, color=NAVY),
            cn_text(
                f"比较 A：固定 {_fmt(small_step, 2)} → 固定 {_fmt(stable_step, 1)}",
                font_size=25,
                color=DATA_BLUE,
                weight="SEMIBOLD",
            ),
            cn_text(
                f"比较 B：固定 {_fmt(large_step, 0)} → Armijo（初始 {_fmt(armijo_step, 0)}）",
                font_size=25,
                color=TEAL,
                weight="SEMIBOLD",
            ),
            cn_text("每次只改变一个变量", font_size=23, color=RED),
            width=9.4,
            height=3.5,
        ).next_to(heading, DOWN, buff=0.5)
        self.play(Write(heading[0]), Write(heading[1]), run_time=1.2)
        self.play(FadeIn(heading[2]), FadeIn(question), run_time=1.0)

    def _four_step_method(self):
        self._clear()
        title = top_heading("固定诊断链：看见什么 → 可能原因 → 只改一个变量 → 预期下一条轨迹")
        steps = VGroup(
            card(cn_text("1  可见轨迹", font_size=27, color=DATA_BLUE, weight="SEMIBOLD"), cn_text("先描述，不先下结论", font_size=21), width=2.7, height=2.1),
            card(cn_text("2  可能原因", font_size=27, color=ORANGE, weight="SEMIBOLD"), cn_text("用机制解释形状", font_size=21), width=2.7, height=2.1),
            card(cn_text("3  一个改变", font_size=27, color=RED, weight="SEMIBOLD"), cn_text("其他设置保持不变", font_size=21), width=2.7, height=2.1),
            card(cn_text("4  下一条轨迹", font_size=27, color=TEAL, weight="SEMIBOLD"), cn_text("写出可检查的预期", font_size=21), width=2.7, height=2.1),
        ).arrange(RIGHT, buff=0.22).shift(DOWN * 0.15)
        connectors = VGroup(
            *[Line(steps[index].get_right(), steps[index + 1].get_left(), color=GRID, stroke_width=4) for index in range(3)]
        )
        note = cn_text("这是一条教学推理链，不是测验、打分或模型排行榜", font_size=24, color=NAVY).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(title), FadeIn(steps[0]), run_time=0.8)
        for connector, step in zip(connectors, steps[1:]):
            self.play(Create(connector), FadeIn(step), run_time=0.55)
        self.play(FadeIn(note), run_time=0.6)

    def _comparison_plot(
        self,
        problem_id: str,
        next_id: str,
        *,
        x_length: float = 6.6,
        y_length: float = 3.7,
    ) -> tuple[VGroup, Mapping[str, Any], Mapping[str, Any]]:
        problem_rows = self.locked.traces[problem_id]
        next_rows = self.locked.traces[next_id]
        all_rows = problem_rows + next_rows
        x_max = max(int(row["iteration"]) for row in all_rows)
        val_values = [float(row["validationBce"]) for row in all_rows]
        y_min = max(0.0, math.floor(min(val_values) * 10) / 10)
        y_max = math.ceil(max(val_values) * 10) / 10
        if y_max <= y_min:
            y_max = y_min + 0.1
        axes = Axes(
            x_range=[0, x_max, max(1, x_max // 4)],
            y_range=[y_min, y_max, max(0.1, (y_max - y_min) / 4)],
            x_length=x_length,
            y_length=y_length,
            axis_config={"color": GRID, "stroke_width": 2, "include_ticks": True},
            tips=False,
        )

        def path(rows: tuple[Mapping[str, Any], ...], color) -> VMobject:
            line = VMobject(color=color, stroke_width=5)
            line.set_points_as_corners(
                [axes.c2p(float(row["iteration"]), float(row["validationBce"])) for row in rows]
            )
            return line

        problem_line = DashedVMobject(path(problem_rows, ORANGE), num_dashes=32)
        next_line = path(next_rows, TEAL)
        problem_best_row = self.locked.best_rows[problem_id]
        next_best_row = self.locked.best_rows[next_id]
        problem_terminal_row = self.locked.terminal_rows[problem_id]
        next_terminal_row = self.locked.terminal_rows[next_id]
        problem_best = diamond_marker(side_length=0.18, color=DATA_BLUE, fill_color=PAPER).move_to(
            axes.c2p(float(problem_best_row["iteration"]), float(problem_best_row["validationBce"]))
        )
        next_best = diamond_marker(side_length=0.18, color=DATA_BLUE, fill_color=PAPER).move_to(
            axes.c2p(float(next_best_row["iteration"]), float(next_best_row["validationBce"]))
        )
        problem_terminal = square_marker(side_length=0.22, color=ORANGE, fill_color=PALE_BLUE).move_to(
            axes.c2p(float(problem_terminal_row["iteration"]), float(problem_terminal_row["validationBce"]))
        )
        next_terminal = circle_marker(radius=0.11, color=TEAL).move_to(
            axes.c2p(float(next_terminal_row["iteration"]), float(next_terminal_row["validationBce"]))
        )
        return (
            VGroup(axes, problem_line, next_line, problem_best, next_best, problem_terminal, next_terminal),
            problem_best_row,
            next_best_row,
        )

    def _slow_vs_stable(self):
        self._clear()
        problem_id = "standardized-too-small"
        next_id = "standardized-stable"
        problem_config = _mapping(self.locked.runs[problem_id].get("config"), "too-small config")
        next_config = _mapping(self.locked.runs[next_id].get("config"), "stable config")
        problem_step = problem_config["step"]
        next_step = next_config["step"]
        problem_terminal = _mapping(self.locked.runs[problem_id].get("terminal"), "small terminal")
        next_terminal = _mapping(self.locked.runs[next_id].get("terminal"), "stable terminal")
        plot, problem_best, next_best = self._comparison_plot(problem_id, next_id)
        plot.shift(LEFT * 3.0 + DOWN * 0.45)
        title = top_heading(
            f"比较 A：固定法只把步长从 {_fmt(problem_step, 2)} 改为 {_fmt(next_step, 1)}"
        )
        chain = card(
            cn_text(
                f"1 看见：损失安全下降，但 {int(problem_terminal['iteration'])} 次时梯度仍大",
                font_size=21,
                color=DATA_BLUE,
            ),
            cn_text(f"2 原因：固定步长 {_fmt(problem_step, 2)} 太小", font_size=21, color=ORANGE),
            cn_text(
                f"3 只改：{_fmt(problem_step, 2)} → {_fmt(next_step, 1)}；方法与标准化不变",
                font_size=21,
                color=RED,
            ),
            cn_text(
                f"4 预期：{int(problem_terminal['iteration'])} 次内达到梯度容差",
                font_size=21,
                color=TEAL,
            ),
            cn_text(
                f"◇ 最佳验证：{int(problem_best['iteration'])} / {_fmt(problem_best['validationBce'])}",
                font_size=19,
                color=MUTED,
            ),
            cn_text(
                f"■ {_fmt(problem_step, 2)}：迭代 {int(problem_terminal['iteration'])} · "
                f"{_terminal_zh(problem_terminal)}",
                font_size=18,
            ),
            cn_text(
                f"● {_fmt(next_step, 1)}：迭代 {int(next_terminal['iteration'])} · "
                f"{_terminal_zh(next_terminal)}",
                font_size=18,
            ),
            cn_text(
                f"{_fmt(next_step, 1)} 最佳验证 BCE {_fmt(next_best['validationBce'])}",
                font_size=18,
                color=MUTED,
            ),
            width=5.5,
            height=5.2,
        ).shift(RIGHT * 3.9 + DOWN * 0.45)
        legend = cn_text("虚线+方形：原运行   实线+圆形：下一运行   ◇：最佳验证", font_size=20, color=NAVY).to_edge(DOWN, buff=0.22)
        self.play(FadeIn(title), FadeIn(plot[0]), FadeIn(chain), run_time=1.0)
        self.play(Create(plot[1]), FadeIn(plot[3]), FadeIn(plot[5]), run_time=1.0)
        self.play(Create(plot[2]), FadeIn(plot[4]), FadeIn(plot[6]), FadeIn(legend), run_time=1.0)

    def _large_vs_armijo(self):
        self._clear()
        problem_id = "standardized-too-large"
        next_id = "standardized-armijo"
        problem_config = _mapping(self.locked.runs[problem_id].get("config"), "too-large config")
        next_config = _mapping(self.locked.runs[next_id].get("config"), "Armijo config")
        problem_step = problem_config["step"]
        next_initial_step = next_config["step"]
        problem_terminal = _mapping(self.locked.runs[problem_id].get("terminal"), "large terminal")
        next_terminal = _mapping(self.locked.runs[next_id].get("terminal"), "Armijo terminal")
        plot, problem_best, next_best = self._comparison_plot(problem_id, next_id)
        plot.shift(LEFT * 3.0 + DOWN * 0.45)
        title = top_heading(
            f"比较 B：初始步长保持 {_fmt(next_initial_step, 0)}，只把固定采用改为 Armijo 检查"
        )
        first = _mapping(self.locked.runs[next_id].get("firstBacktrack"), "Armijo first backtrack")
        chain = card(
            cn_text("1 看见：低验证点之后变差", font_size=21, color=DATA_BLUE),
            cn_text(
                f"2 原因：固定 {_fmt(problem_step, 0)} 越过可接受区域",
                font_size=21,
                color=ORANGE,
            ),
            cn_text("3 只改：固定采用 → Armijo 回溯", font_size=21, color=RED),
            cn_text(
                f"4 预期：先接受 {_fmt(first['acceptedStepSize'], 0)}，并保留收敛资格",
                font_size=21,
                color=TEAL,
            ),
            cn_text(
                f"◇ 固定最佳：{int(problem_best['iteration'])} / {_fmt(problem_best['validationBce'])}",
                font_size=19,
                color=MUTED,
            ),
            cn_text(
                f"■ 固定：迭代 {int(problem_terminal['iteration'])} · {_terminal_zh(problem_terminal)}",
                font_size=18,
            ),
            cn_text(
                f"● Armijo：首步 {_fmt(first['acceptedStepSize'], 0)} · 回溯 {int(first['backtrackCount'])} 次",
                font_size=18,
            ),
            cn_text(
                f"迭代 {int(next_terminal['iteration'])} · {_terminal_zh(next_terminal)}",
                font_size=18,
            ),
            cn_text(f"◇ 最佳验证 BCE {_fmt(next_best['validationBce'])}", font_size=18, color=MUTED),
            width=5.6,
            height=5.35,
        ).shift(RIGHT * 3.85 + DOWN * 0.45)
        legend = cn_text(
            f"虚线+方形：固定 {_fmt(problem_step, 0)}   实线+圆形：Armijo   ◇：最佳验证",
            font_size=20,
            color=NAVY,
        ).to_edge(DOWN, buff=0.22)
        self.play(FadeIn(title), FadeIn(plot[0]), FadeIn(chain), run_time=1.0)
        self.play(Create(plot[1]), FadeIn(plot[3]), FadeIn(plot[5]), run_time=1.0)
        self.play(Create(plot[2]), FadeIn(plot[4]), FadeIn(plot[6]), FadeIn(legend), run_time=1.0)

    def _marker_meanings(self):
        self._clear()
        title = top_heading("◇ 最佳验证点与终点回答不同问题，不能互相替代")
        best = card(
            diamond_marker(side_length=0.28, color=DATA_BLUE, fill_color=PAPER),
            cn_text("最佳验证检查点", font_size=28, color=DATA_BLUE, weight="SEMIBOLD"),
            cn_text("选择保存哪组参数", font_size=23),
            cn_text("不是数学收敛证明", font_size=22, color=RED),
            width=4.8,
            height=3.2,
        ).shift(LEFT * 3.6 + DOWN * 0.1)
        terminals = card(
            square_marker(side_length=0.27, color=ORANGE, fill_color=PALE_BLUE),
            cn_text("模型选择 / 安全终点", font_size=25, color=ORANGE, weight="SEMIBOLD"),
            cn_text("验证耐心停止 · 最大迭代", font_size=21),
            circle_marker(radius=0.12, color=TEAL),
            cn_text("数学收敛终点", font_size=25, color=TEAL, weight="SEMIBOLD"),
            cn_text("梯度范数达到锁定容差", font_size=21),
            width=5.5,
            height=3.8,
        ).shift(RIGHT * 3.4 + DOWN * 0.1)
        note = disclaimer("终点 kind / reason 来自 Notebook；形状与文字使含义不依赖颜色", font_size=24).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(title), FadeIn(best), run_time=0.9)
        self.play(FadeIn(terminals), FadeIn(note), run_time=1.0)

    def _selected_report(self):
        self._clear()
        manual = _mapping(self.locked.final_report.get("manual"), "finalReport.manual")
        baseline_metrics = _mapping(self.locked.baseline.get("metrics"), "baseline.metrics")
        title = top_heading("只有预先合格的 Armijo 检查点连接到紧凑测试报告")
        selected = card(
            cn_text("选中运行：standardized-armijo", font_size=26, color=TEAL, weight="SEMIBOLD"),
            cn_text(f"检查点迭代 {int(self.locked.final_report['checkpointIteration'])}", font_size=23),
            equation(f"测试 BCE = {_fmt(manual['testBce'])}", font_size=28),
            equation(f"准确率 = {_fmt(manual['accuracy'])}", font_size=26),
            equation(f"ROC-AUC = {_fmt(manual['rocAuc'])}", font_size=26),
            cn_text(f"混淆矩阵 {manual['confusionMatrix']}", font_size=22),
            width=5.7,
            height=4.4,
        ).shift(LEFT * 3.4 + DOWN * 0.25)
        baseline = card(
            cn_text("scikit-learn 1.9.0 · 仅终点核对", font_size=25, color=DATA_BLUE, weight="SEMIBOLD"),
            equation(f"测试 BCE = {_fmt(baseline_metrics['testBce'])}", font_size=27),
            equation(f"预测一致率 = {_fmt(self.locked.comparison['predictionAgreement'], 3)}", font_size=26),
            cn_text(f"库报告迭代 {int(self.locked.baseline['reportedIterations'])}", font_size=22),
            cn_text("不比较逐步轨迹", font_size=22, color=RED),
            width=5.2,
            height=3.7,
        ).shift(RIGHT * 3.65 + DOWN * 0.25)
        boundary = cn_text(
            f"阈值 {_fmt(self.locked.final_report['threshold'], 1)}；ROC-AUC 使用概率；"
            "没有阈值调优或求解器轨迹排名",
            font_size=23,
            color=NAVY,
        ).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(title), FadeIn(selected), run_time=0.9)
        self.play(FadeIn(baseline), FadeIn(boundary), run_time=0.9)

    def _poster_ready_conclusion(self):
        self._clear(run_time=0.35)
        small_terminal = _mapping(self.locked.runs["standardized-too-small"].get("terminal"), "small terminal")
        stable_terminal = _mapping(self.locked.runs["standardized-stable"].get("terminal"), "stable terminal")
        large_terminal = _mapping(self.locked.runs["standardized-too-large"].get("terminal"), "large terminal")
        armijo_terminal = _mapping(self.locked.runs["standardized-armijo"].get("terminal"), "Armijo terminal")
        small_step = _mapping(self.locked.runs["standardized-too-small"].get("config"), "small config")["step"]
        stable_step = _mapping(self.locked.runs["standardized-stable"].get("config"), "stable config")["step"]
        large_step = _mapping(self.locked.runs["standardized-too-large"].get("config"), "large config")["step"]
        first = _mapping(self.locked.runs["standardized-armijo"].get("firstBacktrack"), "Armijo first backtrack")
        heading = title_block(
            "诊断结论",
            "轨迹 → 原因 → 一个改变 → 下一条轨迹",
            "真实 Banknote 运行负责本页结论；合成过拟合/梯度示例仍是独立支持内容",
        )
        fit_width(heading, 11.7)
        slow = card(
            square_marker(side_length=0.26, color=ORANGE, fill_color=PALE_BLUE),
            cn_text(
                f"慢：固定 {_fmt(small_step, 2)}",
                font_size=26,
                color=ORANGE,
                weight="SEMIBOLD",
            ),
            cn_text(f"迭代 {small_terminal['iteration']} · 最大迭代", font_size=21),
            cn_text(f"只改步长 → 固定 {_fmt(stable_step, 1)}", font_size=22, color=RED),
            circle_marker(radius=0.11, color=TEAL),
            cn_text(f"迭代 {stable_terminal['iteration']} · 梯度范数收敛", font_size=21, color=TEAL),
            width=5.45,
            height=3.25,
        ).shift(LEFT * 3.35 + DOWN * 1.15)
        overshoot = card(
            square_marker(side_length=0.26, color=ORANGE, fill_color=PALE_BLUE),
            cn_text(
                f"越过：固定 {_fmt(large_step, 0)}",
                font_size=26,
                color=ORANGE,
                weight="SEMIBOLD",
            ),
            cn_text(f"迭代 {large_terminal['iteration']} · 验证耐心停止", font_size=21),
            cn_text("只改采用规则 → Armijo", font_size=22, color=RED),
            circle_marker(radius=0.11, color=TEAL),
            cn_text(
                f"先接受 {_fmt(first['acceptedStepSize'], 0)}；"
                f"迭代 {armijo_terminal['iteration']} · 梯度范数收敛",
                font_size=21,
                color=TEAL,
            ),
            width=5.65,
            height=3.25,
        ).shift(RIGHT * 3.35 + DOWN * 1.15)
        marker_note = status_label(
            "diamond",
            "最佳验证点选择检查点；■/● 终点写明 kind 与 reason",
            font_size=22,
            color=NAVY,
        ).to_edge(DOWN, buff=0.18)
        self.play(FadeIn(heading[0]), Write(heading[1]), FadeIn(heading[2]), run_time=0.9)
        self.play(FadeIn(slow), FadeIn(overshoot), run_time=0.9)
        self.play(FadeIn(marker_note), run_time=0.6)

    def _advance_to(self, timestamp: float):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
