"""Notebook-bound lesson: fixed step 32 versus Armijo backtracking."""

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
    Arrow,
    Axes,
    Create,
    DashedVMobject,
    FadeIn,
    FadeOut,
    Group,
    Scene,
    VGroup,
    VMobject,
    Write,
)

from common import (
    card,
    circle_marker,
    cn_text,
    cross_marker,
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
OPTIMIZATION_OUTPUT_ID = "banknote-logistic-optimization-summary"
SCENE_ID = "banknote-fixed-vs-armijo"
FIXED_RUN_ID = "standardized-too-large"
ARMIJO_RUN_ID = "standardized-armijo"
EXPECTED_INITIAL_STEP = 32.0
EXPECTED_ACCEPTED_STEP = 16.0
EXPECTED_C = 1e-4
EXPECTED_RHO = 0.5
EXPECTED_FIRST_BACKTRACKS = 1
EXPECTED_FIXED_TERMINAL_ITERATION = 73
EXPECTED_ARMIJO_TERMINAL_ITERATION = 48
REPO_ROOT = Path(__file__).resolve().parents[3]
OPTIMIZATION_SUMMARY_PATH = (
    REPO_ROOT / "public/notebooks/numerical-methods/batch-4-outputs/optimization-summary.json"
)
TRACE_PATH = REPO_ROOT / "public/notebooks/numerical-methods/batch-4-outputs/banknote-training-traces.json"


@dataclass(frozen=True)
class LockedSceneInputs:
    summary: Mapping[str, Any]
    fixed_run: Mapping[str, Any]
    armijo_run: Mapping[str, Any]
    fixed_trace: tuple[Mapping[str, Any], ...]
    armijo_trace: tuple[Mapping[str, Any], ...]
    start: Mapping[str, Any]
    fixed_first: Mapping[str, Any]
    armijo_first: Mapping[str, Any]
    initial_step: float
    accepted_step: float
    c: float
    rho: float
    first_backtracks: int


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


def _locked_run(summary: Mapping[str, Any], run_id: str) -> Mapping[str, Any]:
    runs = _mapping(summary.get("runs"), "optimization-summary.runs")
    run = _mapping(runs.get(run_id), f"optimization-summary.runs.{run_id}")
    if run.get("runId") != run_id:
        raise RuntimeError(f"{SCENE_ID}: run ID mismatch for {run_id}")
    return run


def _trace_run(trace_file: Mapping[str, Any], run_id: str) -> Mapping[str, Any]:
    runs = trace_file.get("runs")
    if not isinstance(runs, list):
        raise RuntimeError(f"{SCENE_ID}: trace runs must be a list")
    matches = [run for run in runs if isinstance(run, dict) and run.get("runId") == run_id]
    if len(matches) != 1:
        raise RuntimeError(f"{SCENE_ID}: expected one trace for {run_id}")
    return matches[0]


def _validate_trace(run: Mapping[str, Any], summary_run: Mapping[str, Any]) -> tuple[Mapping[str, Any], ...]:
    for field in ("featureSpace", "method", "config", "start", "firstBacktrack", "bestValidation", "terminal"):
        if run.get(field) != summary_run.get(field):
            raise RuntimeError(f"{SCENE_ID}: trace {field} does not match optimization summary")

    rows = run.get("trace")
    if not isinstance(rows, list) or len(rows) < 2:
        raise RuntimeError(f"{SCENE_ID}: {run.get('runId')} trace must include start and an update")
    if len(rows) != _nonnegative_int(summary_run.get("traceRowCount"), "traceRowCount"):
        raise RuntimeError(f"{SCENE_ID}: trace row count does not match optimization summary")

    checked: list[Mapping[str, Any]] = []
    previous_iteration = -1
    numeric_fields = (
        "trainBce",
        "validationBce",
        "objective",
        "gradientNorm",
        "parameterStepNorm",
        "acceptedStepSize",
    )
    for index, value in enumerate(rows):
        row = _mapping(value, f"{run.get('runId')}.trace[{index}]")
        iteration = _nonnegative_int(row.get("iteration"), f"trace[{index}].iteration")
        if iteration <= previous_iteration:
            raise RuntimeError(f"{SCENE_ID}: trace iterations must increase")
        previous_iteration = iteration
        for field in numeric_fields:
            number = _finite_number(row.get(field), f"trace[{index}].{field}")
            if field in ("trainBce", "objective") and number <= 0:
                raise RuntimeError(f"{SCENE_ID}: trace[{index}].{field} must be positive")
        _nonnegative_int(row.get("backtrackCount"), f"trace[{index}].backtrackCount")
        parameters = row.get("parameters")
        if not isinstance(parameters, list) or len(parameters) != 5:
            raise RuntimeError(f"{SCENE_ID}: trace[{index}] must contain five parameters")
        for parameter_index, parameter in enumerate(parameters):
            _finite_number(parameter, f"trace[{index}].parameters[{parameter_index}]")
        checked.append(row)

    terminal = _mapping(summary_run.get("terminal"), f"{summary_run.get('runId')}.terminal")
    if checked[-1].get("iteration") != terminal.get("iteration"):
        raise RuntimeError(f"{SCENE_ID}: terminal iteration must be the last accepted trace row")
    return tuple(checked)


def _close(left: Any, right: Any, *, tolerance: float = 1e-12) -> bool:
    return abs(_finite_number(left, "left comparison") - _finite_number(right, "right comparison")) <= tolerance


def _armijo_limit(row: Mapping[str, Any], *, alpha: float, c: float) -> float:
    objective = _finite_number(row.get("objective"), "current objective")
    gradient_norm = _finite_number(row.get("gradientNorm"), "current gradient norm")
    return objective - c * alpha * gradient_norm * gradient_norm


def load_locked_inputs() -> LockedSceneInputs:
    """Load and fail closed on the exact reject/accept and terminal anchors."""

    summary = _load_object(OPTIMIZATION_SUMMARY_PATH)
    trace_file = _load_object(TRACE_PATH)
    for name, value in (("summary", summary), ("trace", trace_file)):
        if value.get("contractVersion") != CONTRACT_VERSION:
            raise RuntimeError(f"{SCENE_ID}: {name} contractVersion mismatch")
    if summary.get("outputId") != OPTIMIZATION_OUTPUT_ID:
        raise RuntimeError(f"{SCENE_ID}: optimization outputId mismatch")
    if summary.get("datasetSha256") != trace_file.get("datasetSha256"):
        raise RuntimeError(f"{SCENE_ID}: dataset hash mismatch")
    if summary.get("constantsSha256") != trace_file.get("constantsSha256"):
        raise RuntimeError(f"{SCENE_ID}: constants hash mismatch")

    constants = _mapping(summary.get("constants"), "optimization-summary.constants")
    if constants.get("contractVersion") != CONTRACT_VERSION:
        raise RuntimeError(f"{SCENE_ID}: constants contractVersion mismatch")
    constants_runs = _mapping(constants.get("runs"), "optimization-summary.constants.runs")
    fixed_constant = _mapping(constants_runs.get(FIXED_RUN_ID), f"constants.runs.{FIXED_RUN_ID}")
    armijo_constant = _mapping(constants_runs.get(ARMIJO_RUN_ID), f"constants.runs.{ARMIJO_RUN_ID}")
    armijo_constants = _mapping(constants.get("armijo"), "optimization-summary.constants.armijo")

    fixed_run = _locked_run(summary, FIXED_RUN_ID)
    armijo_run = _locked_run(summary, ARMIJO_RUN_ID)
    fixed_config = _mapping(fixed_run.get("config"), f"{FIXED_RUN_ID}.config")
    armijo_config = _mapping(armijo_run.get("config"), f"{ARMIJO_RUN_ID}.config")
    armijo_config_inner = _mapping(armijo_config.get("armijo"), f"{ARMIJO_RUN_ID}.config.armijo")

    if fixed_run.get("featureSpace") != "standardized" or armijo_run.get("featureSpace") != "standardized":
        raise RuntimeError(f"{SCENE_ID}: both runs must use standardized features")
    if fixed_run.get("method") != "fixed" or fixed_constant.get("method") != "fixed":
        raise RuntimeError(f"{SCENE_ID}: {FIXED_RUN_ID} must remain fixed step")
    if armijo_run.get("method") != "armijo" or armijo_constant.get("method") != "armijo":
        raise RuntimeError(f"{SCENE_ID}: {ARMIJO_RUN_ID} must remain Armijo")

    initial_step = _finite_number(armijo_constants.get("initialStep"), "armijo.initialStep")
    if not _close(initial_step, EXPECTED_INITIAL_STEP):
        raise RuntimeError(f"{SCENE_ID}: canonical initial step must remain 32")
    if not _close(initial_step, fixed_config.get("step")):
        raise RuntimeError(f"{SCENE_ID}: fixed step must equal the Armijo initial trial")
    if not _close(initial_step, fixed_constant.get("step")):
        raise RuntimeError(f"{SCENE_ID}: fixed constant step drifted")
    if not _close(initial_step, armijo_config.get("step")):
        raise RuntimeError(f"{SCENE_ID}: Armijo config step drifted")
    if not _close(initial_step, armijo_config_inner.get("initialStep")):
        raise RuntimeError(f"{SCENE_ID}: nested Armijo initial step drifted")
    if not _close(initial_step, armijo_constant.get("initialStep")):
        raise RuntimeError(f"{SCENE_ID}: Armijo constant run step drifted")

    c = _finite_number(armijo_constants.get("c"), "armijo.c")
    rho = _finite_number(armijo_constants.get("rho"), "armijo.rho")
    if not (0 < c < 0.5 and 0 < rho < 1):
        raise RuntimeError(f"{SCENE_ID}: invalid Armijo sufficient-decrease constants")
    if not _close(c, EXPECTED_C) or not _close(rho, EXPECTED_RHO):
        raise RuntimeError(f"{SCENE_ID}: canonical Armijo c/rho constants drifted")
    for field, expected in (("c", c), ("rho", rho)):
        if not _close(armijo_config_inner.get(field), expected):
            raise RuntimeError(f"{SCENE_ID}: Armijo {field} mismatch")

    fixed_trace = _validate_trace(_trace_run(trace_file, FIXED_RUN_ID), fixed_run)
    armijo_trace = _validate_trace(_trace_run(trace_file, ARMIJO_RUN_ID), armijo_run)
    start = armijo_trace[0]
    fixed_first = fixed_trace[1]
    armijo_first = armijo_trace[1]
    if fixed_trace[0] != start or fixed_run.get("start") != start or armijo_run.get("start") != start:
        raise RuntimeError(f"{SCENE_ID}: the compared runs must share the exact iteration-0 state")
    if fixed_first.get("iteration") != 1 or armijo_first.get("iteration") != 1:
        raise RuntimeError(f"{SCENE_ID}: first-step anchors must be iteration 1")
    if not _close(fixed_first.get("acceptedStepSize"), initial_step):
        raise RuntimeError(f"{SCENE_ID}: fixed run must apply the full initial trial step")
    if _nonnegative_int(fixed_first.get("backtrackCount"), "fixed first backtrackCount") != 0:
        raise RuntimeError(f"{SCENE_ID}: fixed step must not report a backtrack")

    armijo_check = _mapping(summary.get("armijoCheck"), "optimization-summary.armijoCheck")
    if not _close(armijo_check.get("initialTrialStep"), initial_step):
        raise RuntimeError(f"{SCENE_ID}: first rejected trial step drifted")
    if armijo_check.get("initialTrialAccepted") is not False:
        raise RuntimeError(f"{SCENE_ID}: the initial Armijo trial must be rejected")
    accepted_step = _finite_number(armijo_check.get("firstAcceptedStep"), "armijoCheck.firstAcceptedStep")
    first_backtracks = _nonnegative_int(
        armijo_check.get("firstBacktrackCount"), "armijoCheck.firstBacktrackCount"
    )
    if first_backtracks != EXPECTED_FIRST_BACKTRACKS:
        raise RuntimeError(f"{SCENE_ID}: first acceptance must follow exactly one contraction")
    if not _close(accepted_step, EXPECTED_ACCEPTED_STEP) or not _close(accepted_step, initial_step * rho):
        raise RuntimeError(f"{SCENE_ID}: first acceptance must follow exactly one contraction")
    if not _close(armijo_first.get("acceptedStepSize"), accepted_step):
        raise RuntimeError(f"{SCENE_ID}: first accepted trace step drifted")
    if _nonnegative_int(armijo_first.get("backtrackCount"), "Armijo first backtrackCount") != first_backtracks:
        raise RuntimeError(f"{SCENE_ID}: first accepted trace backtrack count drifted")
    if armijo_run.get("firstBacktrack") != armijo_first:
        raise RuntimeError(f"{SCENE_ID}: firstBacktrack must be the first accepted trace row")
    if armijo_check.get("allAcceptedRowsSatisfySufficientDecrease") is not True:
        raise RuntimeError(f"{SCENE_ID}: summary does not certify all Armijo accepts")

    fixed_parameters = fixed_first.get("parameters")
    armijo_parameters = armijo_first.get("parameters")
    if not isinstance(fixed_parameters, list) or not isinstance(armijo_parameters, list):
        raise RuntimeError(f"{SCENE_ID}: first-step parameters are absent")
    trial_scale = initial_step / accepted_step
    for index, (fixed_parameter, armijo_parameter) in enumerate(zip(fixed_parameters, armijo_parameters)):
        expected_fixed_parameter = _finite_number(
            armijo_parameter, f"Armijo first parameters[{index}]"
        ) * trial_scale
        if not _close(fixed_parameter, expected_fixed_parameter):
            raise RuntimeError(f"{SCENE_ID}: alpha-32 and alpha-16 candidates do not share one direction")

    rejected_limit = _armijo_limit(start, alpha=initial_step, c=c)
    accepted_limit = _armijo_limit(start, alpha=accepted_step, c=c)
    if _finite_number(fixed_first.get("objective"), "rejected objective") <= rejected_limit:
        raise RuntimeError(f"{SCENE_ID}: locked step-32 candidate no longer fails sufficient decrease")
    if _finite_number(armijo_first.get("objective"), "accepted objective") > accepted_limit:
        raise RuntimeError(f"{SCENE_ID}: locked step-16 candidate no longer satisfies sufficient decrease")

    for previous, accepted in zip(armijo_trace, armijo_trace[1:]):
        alpha = _finite_number(accepted.get("acceptedStepSize"), "accepted step")
        if _finite_number(accepted.get("objective"), "accepted objective") > _armijo_limit(previous, alpha=alpha, c=c) + 1e-12:
            raise RuntimeError(f"{SCENE_ID}: accepted Armijo row violates sufficient decrease")

    fixed_terminal = _mapping(fixed_run.get("terminal"), f"{FIXED_RUN_ID}.terminal")
    armijo_terminal = _mapping(armijo_run.get("terminal"), f"{ARMIJO_RUN_ID}.terminal")
    if (fixed_terminal.get("kind"), fixed_terminal.get("reason"), fixed_terminal.get("iteration")) != (
        "model-selection",
        "validation-patience",
        EXPECTED_FIXED_TERMINAL_ITERATION,
    ):
        raise RuntimeError(f"{SCENE_ID}: fixed terminal semantics drifted")
    if (armijo_terminal.get("kind"), armijo_terminal.get("reason"), armijo_terminal.get("iteration")) != (
        "mathematical-convergence",
        "gradient-norm",
        EXPECTED_ARMIJO_TERMINAL_ITERATION,
    ):
        raise RuntimeError(f"{SCENE_ID}: Armijo terminal semantics drifted")

    return LockedSceneInputs(
        summary=summary,
        fixed_run=fixed_run,
        armijo_run=armijo_run,
        fixed_trace=fixed_trace,
        armijo_trace=armijo_trace,
        start=start,
        fixed_first=fixed_first,
        armijo_first=armijo_first,
        initial_step=initial_step,
        accepted_step=accepted_step,
        c=c,
        rho=rho,
        first_backtracks=first_backtracks,
    )


def _fmt(value: Any, digits: int = 6) -> str:
    return f"{_finite_number(value, 'display value'):.{digits}f}"


class BanknoteFixedVsArmijoScene(Scene):
    """Seven-beat, 72-second comparison sourced only from locked Notebook JSON."""

    def construct(self):
        self.camera.background_color = BACKGROUND
        self.locked = load_locked_inputs()
        self._opening()
        self._advance_to(8)
        self._objective_boundary()
        self._advance_to(18)
        self._fixed_overshoot()
        self._advance_to(30)
        self._reject_full_trial()
        self._advance_to(43)
        self._accept_backtracked_trial()
        self._advance_to(55)
        self._locked_trajectories()
        self._advance_to(65)
        self._poster_ready_conclusion()
        self._advance_to(72)

    def _clear(self, *, run_time: float = 0.5):
        if self.mobjects:
            self.play(FadeOut(Group(*self.mobjects)), run_time=run_time)

    def _opening(self):
        heading = title_block(
            "数值方法 · 步长选择",
            f"固定 {_fmt(self.locked.initial_step, 0)}，还是先检查再接受？",
            "同一标准化 Banknote 起点 · 同一训练梯度",
        )
        fit_width(heading, 11.8)
        comparison = card(
            status_label("square", "固定步长", font_size=27, color=ORANGE, weight="SEMIBOLD"),
            equation(f"直接采用 α = {_fmt(self.locked.initial_step, 0)}", font_size=32, color=ORANGE),
            status_label("circle", "Armijo 回溯", font_size=27, color=TEAL, weight="SEMIBOLD"),
            equation(f"先试 α = {_fmt(self.locked.initial_step, 0)}，再检查充分下降", font_size=30, color=TEAL),
            width=8.8,
            height=3.3,
        ).next_to(heading, DOWN, buff=0.55)
        self.play(Write(heading[0]), Write(heading[1]), run_time=1.2)
        self.play(FadeIn(heading[2]), FadeIn(comparison), run_time=1.0)

    def _objective_boundary(self):
        self._clear()
        title = top_heading("充分下降只检查惩罚训练目标；验证 BCE 不参与接受或拒绝")
        formula = card(
            equation("J(θ) = 训练 BCE + λ/2 · ||w||²", font_size=34, color=NAVY),
            equation("d = −g", font_size=31, color=DATA_BLUE),
            equation("J(θ + αd) ≤ J(θ) + cα(g·d)", font_size=31, color=TEAL),
            equation("= J(θ) − cα||g||²", font_size=29, color=TEAL),
            width=8.2,
            height=3.6,
        ).shift(LEFT * 2.3 + DOWN * 0.15)
        constants = card(
            cn_text("锁定回溯常数", font_size=27, color=DATA_BLUE, weight="SEMIBOLD"),
            equation(f"c = {self.locked.c:g}", font_size=28),
            equation(f"ρ = {self.locked.rho:g}", font_size=28),
            cn_text("验证集只在步后更新检查点", font_size=22, color=RED),
            width=4.5,
            height=3.3,
        ).shift(RIGHT * 4.7 + DOWN * 0.15)
        self.play(FadeIn(title), FadeIn(formula), run_time=1.1)
        self.play(FadeIn(constants), run_time=0.9)

    def _fixed_overshoot(self):
        self._clear()
        title = top_heading(
            f"固定步长 {_fmt(self.locked.initial_step, 0)}：候选目标上升，仍被直接采用"
        )
        start = card(
            cn_text("迭代 0", font_size=26, color=DATA_BLUE, weight="SEMIBOLD"),
            equation(f"J = {_fmt(self.locked.start['objective'])}", font_size=31),
            equation(f"||g|| = {_fmt(self.locked.start['gradientNorm'])}", font_size=27, color=MUTED),
            width=4.0,
            height=2.8,
        ).shift(LEFT * 4.2 + DOWN * 0.1)
        candidate = card(
            square_marker(side_length=0.34, color=ORANGE, fill_color=PALE_BLUE),
            cn_text(
                f"固定 {_fmt(self.locked.fixed_first['acceptedStepSize'], 0)} · 直接采用",
                font_size=27,
                color=ORANGE,
                weight="SEMIBOLD",
            ),
            equation(f"J = {_fmt(self.locked.fixed_first['objective'])}", font_size=31, color=RED),
            equation(f"训练 BCE = {_fmt(self.locked.fixed_first['trainBce'])}", font_size=25),
            cn_text("目标上升：首步越过可接受区域", font_size=22, color=RED),
            width=5.2,
            height=3.6,
        ).shift(RIGHT * 3.6 + DOWN * 0.1)
        arrow = Arrow(start.get_right(), candidate.get_left(), buff=0.25, color=ORANGE)
        alpha = equation(f"α = {_fmt(self.locked.fixed_first['acceptedStepSize'], 0)}", font_size=29, color=ORANGE).next_to(
            arrow, UP, buff=0.15
        )
        self.play(FadeIn(title), FadeIn(start), run_time=0.8)
        self.play(Create(arrow), FadeIn(alpha), FadeIn(candidate), run_time=1.1)

    def _reject_full_trial(self):
        self._clear()
        title = top_heading(
            f"Armijo 第一次试 {_fmt(self.locked.initial_step, 0)}：同一候选未达到充分下降，因此拒绝"
        )
        limit = _armijo_limit(self.locked.start, alpha=self.locked.initial_step, c=self.locked.c)
        left = card(
            cn_text("当前有限状态", font_size=26, color=DATA_BLUE, weight="SEMIBOLD"),
            equation(f"J₀ = {_fmt(self.locked.start['objective'])}", font_size=31),
            equation(f"试探 α = {_fmt(self.locked.initial_step, 0)}", font_size=29, color=ORANGE),
            width=4.1,
            height=2.8,
        ).shift(LEFT * 4.4 + DOWN * 0.15)
        trial = card(
            status_label("reject", "拒绝 · 不写入轨迹", font_size=28, color=RED, weight="SEMIBOLD"),
            equation(f"候选 J = {_fmt(self.locked.fixed_first['objective'])}", font_size=29, color=RED),
            equation(f"允许上界 = {_fmt(limit)}", font_size=27, color=TEAL),
            equation(f"{_fmt(self.locked.fixed_first['objective'])} > {_fmt(limit)}", font_size=28, color=RED),
            width=5.8,
            height=3.4,
        ).shift(RIGHT * 3.5 + DOWN * 0.15)
        arrow = Arrow(left.get_right(), trial.get_left(), buff=0.25, color=ORANGE)
        reject_x = cross_marker(size=0.36, color=RED).next_to(arrow, UP, buff=0.15)
        boundary = disclaimer("比较的是 J = 训练 BCE + L2；不读取验证 BCE", font_size=24).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(title), FadeIn(left), run_time=0.8)
        self.play(Create(arrow), FadeIn(reject_x), FadeIn(trial), run_time=1.1)
        self.play(FadeIn(boundary), run_time=0.7)

    def _accept_backtracked_trial(self):
        self._clear()
        title = top_heading(
            "回退一次："
            f"{_fmt(self.locked.initial_step, 0)} × {self.locked.rho:g} = "
            f"{_fmt(self.locked.accepted_step, 0)}；新候选满足充分下降"
        )
        limit = _armijo_limit(self.locked.start, alpha=self.locked.accepted_step, c=self.locked.c)
        backtrack = card(
            cn_text("一次回溯", font_size=27, color=DATA_BLUE, weight="SEMIBOLD"),
            equation(
                f"{_fmt(self.locked.initial_step, 0)} × {self.locked.rho:g} = {_fmt(self.locked.accepted_step, 0)}",
                font_size=33,
                color=TEAL,
            ),
            equation(f"backtrack count = {self.locked.first_backtracks}", font_size=25),
            width=4.8,
            height=2.8,
        ).shift(LEFT * 4.1 + DOWN * 0.1)
        accepted = card(
            circle_marker(radius=0.17, color=TEAL),
            status_label("accept", "接受 · 写入迭代 1", font_size=28, color=TEAL, weight="SEMIBOLD"),
            equation(f"候选 J = {_fmt(self.locked.armijo_first['objective'])}", font_size=29, color=TEAL),
            equation(f"允许上界 = {_fmt(limit)}", font_size=27),
            equation(f"{_fmt(self.locked.armijo_first['objective'])} ≤ {_fmt(limit)}", font_size=28, color=TEAL),
            width=5.8,
            height=3.6,
        ).shift(RIGHT * 3.5 + DOWN * 0.1)
        arrow = Arrow(backtrack.get_right(), accepted.get_left(), buff=0.25, color=TEAL)
        note = disclaimer("验证 BCE 仍不参与线搜索；接受之后才更新验证检查点", font_size=24).to_edge(
            DOWN, buff=0.45
        )
        self.play(FadeIn(title), FadeIn(backtrack), run_time=0.8)
        self.play(Create(arrow), FadeIn(accepted), run_time=1.1)
        self.play(FadeIn(note), run_time=0.7)

    def _locked_trajectories(self):
        self._clear()
        title = top_heading(
            f"完整已接受轨迹：固定 {_fmt(self.locked.initial_step, 0)} 震荡；"
            "Armijo 只保留通过检查的状态"
        )
        all_rows = self.locked.fixed_trace + self.locked.armijo_trace
        x_max = max(int(row["iteration"]) for row in all_rows)
        log_values = [math.log10(float(row["objective"])) for row in all_rows]
        y_min = math.floor(min(log_values))
        y_max = math.ceil(max(log_values))
        if y_min == y_max:
            y_max += 1
        axes = Axes(
            x_range=[0, x_max, max(1, x_max // 4)],
            y_range=[y_min, y_max, 1],
            x_length=8.6,
            y_length=4.7,
            axis_config={"color": GRID, "stroke_width": 2, "include_ticks": True},
            tips=False,
        ).shift(LEFT * 1.8 + DOWN * 0.35)

        def trajectory(rows: tuple[Mapping[str, Any], ...], color) -> VMobject:
            line = VMobject(color=color, stroke_width=5)
            line.set_points_as_corners(
                [axes.c2p(float(row["iteration"]), math.log10(float(row["objective"]))) for row in rows]
            )
            return line

        fixed_line = DashedVMobject(trajectory(self.locked.fixed_trace, ORANGE), num_dashes=34)
        armijo_line = trajectory(self.locked.armijo_trace, TEAL)
        fixed_end = self.locked.fixed_trace[-1]
        armijo_end = self.locked.armijo_trace[-1]
        fixed_marker = square_marker(side_length=0.22, color=ORANGE, fill_color=PAPER).move_to(
            axes.c2p(float(fixed_end["iteration"]), math.log10(float(fixed_end["objective"])))
        )
        armijo_marker = circle_marker(radius=0.11, color=TEAL).move_to(
            axes.c2p(float(armijo_end["iteration"]), math.log10(float(armijo_end["objective"])))
        )
        labels = card(
            status_label(
                "square",
                f"固定 {_fmt(self.locked.initial_step, 0)} · 虚线",
                font_size=25,
                color=ORANGE,
                weight="SEMIBOLD",
            ),
            status_label("circle", "Armijo · 实线", font_size=25, color=TEAL, weight="SEMIBOLD"),
            cn_text("纵轴：log₁₀ 惩罚训练目标", font_size=21, color=MUTED),
            cn_text("拒绝试探不进入轨迹", font_size=22, color=RED),
            width=4.2,
            height=3.0,
        ).shift(RIGHT * 4.75 + DOWN * 0.1)
        x_label = cn_text("迭代（Notebook 已接受状态）", font_size=21, color=MUTED).next_to(axes, DOWN, buff=0.18)
        self.play(FadeIn(title), FadeIn(axes), FadeIn(x_label), FadeIn(labels), run_time=1.0)
        self.play(Create(fixed_line), FadeIn(fixed_marker), run_time=1.3)
        self.play(Create(armijo_line), FadeIn(armijo_marker), run_time=1.3)

    def _poster_ready_conclusion(self):
        self._clear(run_time=0.35)
        fixed_terminal = _mapping(self.locked.fixed_run.get("terminal"), "fixed terminal")
        armijo_terminal = _mapping(self.locked.armijo_run.get("terminal"), "Armijo terminal")
        armijo_best = _mapping(self.locked.armijo_run.get("bestValidation"), "Armijo best validation")
        heading = title_block(
            "结论",
            "先检查充分下降，再决定是否采用步长",
            "同一首个"
            f" {_fmt(self.locked.initial_step, 0)} 候选：固定法采用；"
            f"Armijo 拒绝后接受 {_fmt(self.locked.accepted_step, 0)}",
        )
        fit_width(heading, 11.7)
        fixed = card(
            square_marker(side_length=0.34, color=ORANGE, fill_color=PALE_BLUE),
            cn_text(
                f"固定 {_fmt(self.locked.initial_step, 0)}",
                font_size=28,
                color=ORANGE,
                weight="SEMIBOLD",
            ),
            cn_text("首步目标上升仍采用", font_size=23, color=RED),
            status_label("square", f"迭代 {fixed_terminal['iteration']} · 验证耐心停止", font_size=23),
            width=5.3,
            height=3.1,
        ).shift(LEFT * 3.35 + DOWN * 1.2)
        armijo = card(
            circle_marker(radius=0.17, color=TEAL),
            cn_text(
                f"Armijo：{_fmt(self.locked.initial_step, 0)} × → "
                f"{_fmt(self.locked.accepted_step, 0)} ✓",
                font_size=28,
                color=TEAL,
                weight="SEMIBOLD",
            ),
            cn_text(f"一次回溯 · 只保留已接受状态", font_size=23),
            status_label("circle", f"迭代 {armijo_terminal['iteration']} · 梯度范数收敛", font_size=23),
            equation(f"最佳验证 BCE {_fmt(armijo_best['bce'])}", font_size=22, color=MUTED),
            width=5.7,
            height=3.25,
        ).shift(RIGHT * 3.35 + DOWN * 1.2)
        boundary = disclaimer(
            "接受规则只读 J = 训练 BCE + L2；验证 BCE 不参与线搜索",
            font_size=23,
        ).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(heading[0]), Write(heading[1]), FadeIn(heading[2]), run_time=0.9)
        self.play(FadeIn(fixed), FadeIn(armijo), run_time=0.9)
        self.play(FadeIn(boundary), run_time=0.6)

    def _advance_to(self, timestamp: float):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
