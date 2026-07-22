"""Notebook-bound lesson: feature scale controls whether a fixed step is usable."""

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
    FadeIn,
    FadeOut,
    Group,
    Rectangle,
    Scene,
    VGroup,
    VMobject,
    Write,
)

from common import (
    card,
    circle_marker,
    cn_text,
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
SCENE_ID = "banknote-feature-scaling"
FEATURES = ("variance", "skewness", "curtosis", "entropy")
FEATURE_LABELS = {
    "variance": "方差",
    "skewness": "偏度",
    "curtosis": "峰度",
    "entropy": "熵",
}
RAW_RUN_ID = "raw-fixed"
STANDARDIZED_RUN_ID = "standardized-stable"
FIXED_STEP = 4.0
REPO_ROOT = Path(__file__).resolve().parents[3]
DATASET_MANIFEST_PATH = REPO_ROOT / "public/datasets/numerical-methods/banknote-authentication-manifest.json"
OPTIMIZATION_SUMMARY_PATH = (
    REPO_ROOT / "public/notebooks/numerical-methods/batch-4-outputs/optimization-summary.json"
)
TRACE_PATH = REPO_ROOT / "public/notebooks/numerical-methods/batch-4-outputs/banknote-training-traces.json"


@dataclass(frozen=True)
class LockedSceneInputs:
    dataset: Mapping[str, Any]
    summary: Mapping[str, Any]
    raw_run: Mapping[str, Any]
    standardized_run: Mapping[str, Any]
    raw_trace: tuple[Mapping[str, Any], ...]
    standardized_trace: tuple[Mapping[str, Any], ...]
    train_means: Mapping[str, float]
    train_scales: Mapping[str, float]
    split_counts: Mapping[str, int]
    ddof: int


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


def _positive_int(value: Any, name: str) -> int:
    number = _finite_number(value, name)
    if not number.is_integer() or number <= 0:
        raise RuntimeError(f"{SCENE_ID}: {name} must be a positive integer")
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
    for field in ("featureSpace", "method", "config", "terminal"):
        if run.get(field) != summary_run.get(field):
            raise RuntimeError(f"{SCENE_ID}: trace {field} does not match optimization summary")
    rows = run.get("trace")
    if not isinstance(rows, list) or not rows:
        raise RuntimeError(f"{SCENE_ID}: {run.get('runId')} trace is absent")
    checked: list[Mapping[str, Any]] = []
    previous_iteration = -1
    for index, row_value in enumerate(rows):
        row = _mapping(row_value, f"trace[{index}]")
        iteration = _positive_int(row.get("iteration"), f"trace[{index}].iteration") if index else 0
        if index == 0 and row.get("iteration") != 0:
            raise RuntimeError(f"{SCENE_ID}: trace must start at iteration 0")
        if iteration <= previous_iteration:
            raise RuntimeError(f"{SCENE_ID}: trace iterations must increase")
        previous_iteration = iteration
        for field in ("trainBce", "validationBce", "objective", "gradientNorm", "parameterStepNorm", "acceptedStepSize"):
            value = _finite_number(row.get(field), f"trace[{index}].{field}")
            if field == "trainBce" and value <= 0:
                raise RuntimeError(f"{SCENE_ID}: trace[{index}].trainBce must be positive for the log plot")
        checked.append(row)

    terminal = _mapping(summary_run.get("terminal"), f"{summary_run.get('runId')}.terminal")
    terminal_iteration = _positive_int(terminal.get("iteration"), "terminal.iteration")
    if checked[-1].get("iteration") != terminal_iteration:
        raise RuntimeError(f"{SCENE_ID}: trace terminal does not match optimization summary")
    if len(checked) != _positive_int(summary_run.get("traceRowCount"), "traceRowCount"):
        raise RuntimeError(f"{SCENE_ID}: trace row count does not match optimization summary")
    return tuple(checked)


def load_locked_inputs() -> LockedSceneInputs:
    """Load and fail closed on the dataset, output-ID, constants, and trace contract."""

    dataset = _load_object(DATASET_MANIFEST_PATH)
    summary = _load_object(OPTIMIZATION_SUMMARY_PATH)
    trace_file = _load_object(TRACE_PATH)

    for name, value in (("dataset", dataset), ("summary", summary), ("trace", trace_file)):
        if value.get("contractVersion") != CONTRACT_VERSION:
            raise RuntimeError(f"{SCENE_ID}: {name} contractVersion mismatch")
    if summary.get("outputId") != OPTIMIZATION_OUTPUT_ID:
        raise RuntimeError(f"{SCENE_ID}: optimization outputId mismatch")

    normalized = _mapping(dataset.get("normalizedDataset"), "dataset.normalizedDataset")
    loader = _mapping(summary.get("loader"), "optimization-summary.loader")
    dataset_sha = normalized.get("sha256")
    if not isinstance(dataset_sha, str) or not dataset_sha or summary.get("datasetSha256") != dataset_sha:
        raise RuntimeError(f"{SCENE_ID}: dataset hash mismatch")
    if loader.get("datasetSha256") != dataset_sha or trace_file.get("datasetSha256") != dataset_sha:
        raise RuntimeError(f"{SCENE_ID}: output dependency does not reference the locked dataset")
    if _positive_int(normalized.get("rowCount"), "dataset.rowCount") != _positive_int(
        loader.get("rowCount"), "loader.rowCount"
    ):
        raise RuntimeError(f"{SCENE_ID}: dataset row count mismatch")

    constants_hash = summary.get("constantsSha256")
    if not isinstance(constants_hash, str) or len(constants_hash) != 64:
        raise RuntimeError(f"{SCENE_ID}: constantsSha256 is absent")
    if trace_file.get("constantsSha256") != constants_hash:
        raise RuntimeError(f"{SCENE_ID}: trace constants hash mismatch")

    dataset_preprocessing = _mapping(dataset.get("preprocessing"), "dataset.preprocessing")
    output_preprocessing = _mapping(summary.get("preprocessing"), "optimization-summary.preprocessing")
    if dataset_preprocessing.get("fitSplit") != "train" or output_preprocessing.get("fitSplit") != "train":
        raise RuntimeError(f"{SCENE_ID}: standardization must be fit on train only")
    dataset_ddof = _finite_number(dataset_preprocessing.get("ddof"), "dataset.preprocessing.ddof")
    if dataset_ddof != 0:
        raise RuntimeError(f"{SCENE_ID}: dataset preprocessing must use ddof=0")
    if _finite_number(output_preprocessing.get("ddof"), "summary.preprocessing.ddof") != 0:
        raise RuntimeError(f"{SCENE_ID}: output preprocessing must use ddof=0")
    if tuple(dataset_preprocessing.get("features", ())) != FEATURES:
        raise RuntimeError(f"{SCENE_ID}: dataset feature order mismatch")
    if tuple(output_preprocessing.get("features", ())) != FEATURES:
        raise RuntimeError(f"{SCENE_ID}: optimization feature order mismatch")

    means = _mapping(dataset_preprocessing.get("trainMeans"), "dataset.preprocessing.trainMeans")
    scales = _mapping(dataset_preprocessing.get("trainScales"), "dataset.preprocessing.trainScales")
    output_means = _mapping(output_preprocessing.get("trainMeans"), "summary.preprocessing.trainMeans")
    output_scales = _mapping(output_preprocessing.get("trainScales"), "summary.preprocessing.trainScales")
    for feature in FEATURES:
        mean = _finite_number(means.get(feature), f"trainMeans.{feature}")
        scale = _finite_number(scales.get(feature), f"trainScales.{feature}")
        if scale <= 0:
            raise RuntimeError(f"{SCENE_ID}: trainScales.{feature} must be positive")
        if abs(mean - _finite_number(output_means.get(feature), f"output.trainMeans.{feature}")) > 1e-12:
            raise RuntimeError(f"{SCENE_ID}: train mean drift for {feature}")
        if abs(scale - _finite_number(output_scales.get(feature), f"output.trainScales.{feature}")) > 1e-12:
            raise RuntimeError(f"{SCENE_ID}: train scale drift for {feature}")

    split = _mapping(dataset.get("split"), "dataset.split")
    split_counts = _mapping(split.get("counts"), "dataset.split.counts")
    loader_counts = _mapping(loader.get("splitCounts"), "optimization-summary.loader.splitCounts")
    checked_counts: dict[str, int] = {}
    for split_name in ("train", "validation", "test"):
        count = _positive_int(split_counts.get(split_name), f"split.counts.{split_name}")
        if count != _positive_int(loader_counts.get(split_name), f"loader.splitCounts.{split_name}"):
            raise RuntimeError(f"{SCENE_ID}: split count mismatch for {split_name}")
        checked_counts[split_name] = count
    if sum(checked_counts.values()) != _positive_int(normalized.get("rowCount"), "dataset.rowCount"):
        raise RuntimeError(f"{SCENE_ID}: split counts do not sum to the locked dataset row count")

    constants = _mapping(summary.get("constants"), "optimization-summary.constants")
    if constants.get("contractVersion") != CONTRACT_VERSION:
        raise RuntimeError(f"{SCENE_ID}: constants contractVersion mismatch")
    constant_runs = _mapping(constants.get("runs"), "optimization-summary.constants.runs")
    raw_constant = _mapping(constant_runs.get(RAW_RUN_ID), f"constants.runs.{RAW_RUN_ID}")
    standardized_constant = _mapping(
        constant_runs.get(STANDARDIZED_RUN_ID), f"constants.runs.{STANDARDIZED_RUN_ID}"
    )
    raw_run = _locked_run(summary, RAW_RUN_ID)
    standardized_run = _locked_run(summary, STANDARDIZED_RUN_ID)
    for name, run, constant, expected_space in (
        (RAW_RUN_ID, raw_run, raw_constant, "raw"),
        (STANDARDIZED_RUN_ID, standardized_run, standardized_constant, "standardized"),
    ):
        config = _mapping(run.get("config"), f"{name}.config")
        if run.get("featureSpace") != expected_space or constant.get("featureSpace") != expected_space:
            raise RuntimeError(f"{SCENE_ID}: feature-space mismatch for {name}")
        if run.get("method") != "fixed" or constant.get("method") != "fixed":
            raise RuntimeError(f"{SCENE_ID}: method mismatch for {name}")
        if _finite_number(config.get("step"), f"{name}.config.step") != FIXED_STEP:
            raise RuntimeError(f"{SCENE_ID}: {name} must use fixed step {FIXED_STEP}")
        if _finite_number(constant.get("step"), f"constants.runs.{name}.step") != FIXED_STEP:
            raise RuntimeError(f"{SCENE_ID}: locked constant step mismatch for {name}")

    raw_trace_run = _trace_run(trace_file, RAW_RUN_ID)
    standardized_trace_run = _trace_run(trace_file, STANDARDIZED_RUN_ID)
    raw_trace = _validate_trace(raw_trace_run, raw_run)
    standardized_trace = _validate_trace(standardized_trace_run, standardized_run)

    return LockedSceneInputs(
        dataset=dataset,
        summary=summary,
        raw_run=raw_run,
        standardized_run=standardized_run,
        raw_trace=raw_trace,
        standardized_trace=standardized_trace,
        train_means={feature: float(means[feature]) for feature in FEATURES},
        train_scales={feature: float(scales[feature]) for feature in FEATURES},
        split_counts=checked_counts,
        ddof=int(dataset_ddof),
    )


def _format_decimal(value: Any, digits: int) -> str:
    return f"{_finite_number(value, 'display value'):.{digits}f}"


def _terminal_label(run: Mapping[str, Any]) -> str:
    terminal = _mapping(run.get("terminal"), f"{run.get('runId')}.terminal")
    reason = terminal.get("reason")
    labels = {
        "validation-patience": "验证耐心停止 · 模型选择",
        "gradient-norm": "梯度范数收敛 · 数学收敛",
    }
    if reason not in labels:
        raise RuntimeError(f"{SCENE_ID}: unsupported terminal reason {reason}")
    return labels[reason]


class BanknoteFeatureScalingScene(Scene):
    """Seven-beat, 72-second scene; all learner-visible data comes from locked JSON."""

    def construct(self):
        self.camera.background_color = BACKGROUND
        self.locked = load_locked_inputs()
        self._opening()
        self._advance_to(8)
        self._feature_scales()
        self._advance_to(18)
        self._train_only_standardization()
        self._advance_to(29)
        self._same_step_trajectories()
        self._advance_to(45)
        self._terminal_meanings()
        self._advance_to(57)
        self._penalty_geometry_caveat()
        self._advance_to(65)
        self._poster_ready_conclusion()
        self._advance_to(72)

    def _clear(self, *, run_time: float = 0.5):
        if self.mobjects:
            self.play(FadeOut(Group(*self.mobjects)), run_time=run_time)

    def _opening(self):
        row_count = _mapping(self.locked.dataset.get("normalizedDataset"), "normalizedDataset")["rowCount"]
        heading = title_block(
            "数值方法 · 特征尺度",
            "同一步长，为何走出两种训练轨迹？",
            f"本地 Banknote 数据 · {row_count} 行 · 四个连续特征",
        )
        fit_width(heading, 11.8)
        question = card(
            cn_text("固定步长", font_size=26, color=MUTED),
            equation(f"原始特征：α = {_format_decimal(self.locked.raw_run['config']['step'], 1)}", font_size=31, color=ORANGE),
            equation(
                f"标准化特征：α = {_format_decimal(self.locked.standardized_run['config']['step'], 1)}",
                font_size=31,
                color=TEAL,
            ),
            cn_text("只改变坐标尺度，不替换训练规则", font_size=23, color=NAVY),
            width=8.2,
            height=2.8,
        ).next_to(heading, DOWN, buff=0.65)
        self.play(Write(heading[0]), Write(heading[1]), run_time=1.2)
        self.play(FadeIn(heading[2]), FadeIn(question), run_time=1.0)

    def _feature_scales(self):
        self._clear()
        title = top_heading("原始列的训练集尺度不同；颜色之外，长度与数值也在说明差异")
        max_scale = max(self.locked.train_scales.values())
        rows = VGroup()
        for index, feature in enumerate(FEATURES):
            scale = self.locked.train_scales[feature]
            label = cn_text(f"{FEATURE_LABELS[feature]}  {feature}", font_size=23, color=NAVY)
            bar = Rectangle(
                width=4.8 * scale / max_scale,
                height=0.42,
                fill_color=ORANGE,
                fill_opacity=0.82,
                stroke_color=NAVY,
                stroke_width=1.3,
            )
            value = equation(f"训练尺度 {scale:.4f}", font_size=22, color=ORANGE)
            row = VGroup(label, bar, value).arrange(RIGHT, buff=0.25)
            row[0].set_width(2.25, stretch=True)
            rows.add(row)
        rows.arrange(DOWN, aligned_edge=LEFT, buff=0.38).shift(LEFT * 1.4 + DOWN * 0.25)
        max_feature = max(FEATURES, key=self.locked.train_scales.__getitem__)
        note = card(
            cn_text("梯度按坐标聚合", font_size=27, color=DATA_BLUE, weight="SEMIBOLD"),
            cn_text(f"最大训练尺度列：{FEATURE_LABELS[max_feature]}", font_size=24, color=NAVY),
            cn_text("统一 α 会被大尺度方向主导", font_size=24, color=RED, weight="SEMIBOLD"),
            width=4.5,
            height=2.45,
        ).shift(RIGHT * 4.5 + DOWN * 0.2)
        self.play(FadeIn(title), FadeIn(rows), run_time=1.25)
        self.play(FadeIn(note), run_time=0.9)

    def _train_only_standardization(self):
        self._clear()
        title = top_heading("D-03：只用训练集拟合均值与尺度，再原样复用")
        counts = self.locked.split_counts
        train = card(
            cn_text("训练集 · 拟合", font_size=27, color=DATA_BLUE, weight="SEMIBOLD"),
            equation(f"{counts['train']} 行", font_size=31, color=DATA_BLUE),
            equation(f"均值 + 总体尺度（ddof={self.locked.ddof}）", font_size=24),
            width=4.0,
            height=2.6,
        ).shift(LEFT * 4.5 + UP * 0.2)
        transform = card(
            cn_text("固定变换", font_size=27, color=TEAL, weight="SEMIBOLD"),
            equation("x′ = (x − 训练均值) / 训练尺度", font_size=26, color=TEAL),
            cn_text("不从留出数据重新拟合", font_size=22, color=RED),
            width=5.2,
            height=2.6,
        ).shift(UP * 0.2)
        held_out = card(
            cn_text("验证 / 测试 · 复用", font_size=26, color=ORANGE, weight="SEMIBOLD"),
            equation(f"{counts['validation']} / {counts['test']} 行", font_size=29, color=ORANGE),
            cn_text("沿用训练均值与尺度", font_size=22),
            width=4.0,
            height=2.6,
        ).shift(RIGHT * 4.5 + UP * 0.2)
        arrows = VGroup(
            Arrow(train.get_right(), transform.get_left(), buff=0.18, color=DATA_BLUE),
            Arrow(transform.get_right(), held_out.get_left(), buff=0.18, color=TEAL),
        )
        scales = card(
            cn_text("变换后：训练集每列尺度对齐", font_size=27, color=TEAL, weight="SEMIBOLD"),
            equation(
                " · ".join(
                    f"{FEATURE_LABELS[feature]} {self.locked.train_scales[feature] / self.locked.train_scales[feature]:.1f}"
                    for feature in FEATURES
                ),
                font_size=24,
                color=NAVY,
            ),
            width=10.4,
            height=1.55,
        ).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(title), FadeIn(train), run_time=0.8)
        self.play(Create(arrows[0]), FadeIn(transform), run_time=0.9)
        self.play(Create(arrows[1]), FadeIn(held_out), run_time=0.9)
        self.play(FadeIn(scales), run_time=0.8)

    def _same_step_trajectories(self):
        self._clear()
        title = top_heading("同一个固定步长：原始轨迹震荡，标准化轨迹稳定下降")
        all_rows = self.locked.raw_trace + self.locked.standardized_trace
        x_max = max(int(row["iteration"]) for row in all_rows)
        log_values = [math.log10(float(row["trainBce"])) for row in all_rows]
        y_min = math.floor(min(log_values))
        y_max = math.ceil(max(log_values))
        axes = Axes(
            x_range=[0, x_max, max(1, x_max // 4)],
            y_range=[y_min, y_max, 1],
            x_length=8.8,
            y_length=4.8,
            axis_config={"color": GRID, "stroke_width": 2, "include_ticks": True},
            tips=False,
        ).shift(LEFT * 1.7 + DOWN * 0.35)

        def trajectory(rows: tuple[Mapping[str, Any], ...], color) -> VMobject:
            line = VMobject(color=color, stroke_width=5)
            line.set_points_as_corners(
                [axes.c2p(float(row["iteration"]), math.log10(float(row["trainBce"]))) for row in rows]
            )
            return line

        raw_line = trajectory(self.locked.raw_trace, ORANGE)
        standardized_line = trajectory(self.locked.standardized_trace, TEAL)
        raw_end = self.locked.raw_trace[-1]
        standardized_end = self.locked.standardized_trace[-1]
        raw_marker = square_marker(side_length=0.20, color=ORANGE, fill_color=PAPER).move_to(
            axes.c2p(float(raw_end["iteration"]), math.log10(float(raw_end["trainBce"])))
        )
        standardized_marker = circle_marker(radius=0.11, color=TEAL).move_to(
            axes.c2p(float(standardized_end["iteration"]), math.log10(float(standardized_end["trainBce"])))
        )
        labels = card(
            equation(f"α = {_format_decimal(self.locked.raw_run['config']['step'], 1)}", font_size=29, color=NAVY),
            status_label("square", "原始：震荡后停止", font_size=25, color=ORANGE, weight="SEMIBOLD"),
            status_label("circle", "标准化：稳定下降", font_size=25, color=TEAL, weight="SEMIBOLD"),
            cn_text("纵轴：log₁₀ 训练 BCE", font_size=21, color=MUTED),
            cn_text("线条、形状与文字共同编码", font_size=20, color=MUTED),
            width=4.2,
            height=3.6,
        ).shift(RIGHT * 4.7 + DOWN * 0.15)
        x_label = cn_text("迭代（完整 Notebook 轨迹）", font_size=21, color=MUTED).next_to(axes, DOWN, buff=0.18)
        self.play(FadeIn(title), FadeIn(axes), FadeIn(x_label), FadeIn(labels), run_time=1.0)
        self.play(Create(raw_line), FadeIn(raw_marker), run_time=1.5)
        self.play(Create(standardized_line), FadeIn(standardized_marker), run_time=1.6)

    def _terminal_meanings(self):
        self._clear()
        title = top_heading("停止原因必须分开读：模型选择停止 ≠ 数学收敛")
        raw_terminal = _mapping(self.locked.raw_run.get("terminal"), "raw terminal")
        standardized_terminal = _mapping(self.locked.standardized_run.get("terminal"), "standardized terminal")
        raw_best = _mapping(self.locked.raw_run.get("bestValidation"), "raw bestValidation")
        standardized_best = _mapping(self.locked.standardized_run.get("bestValidation"), "standardized bestValidation")
        raw = card(
            square_marker(side_length=0.36, color=ORANGE, fill_color=PALE_BLUE),
            cn_text("原始特征 · 固定步长", font_size=27, color=ORANGE, weight="SEMIBOLD"),
            cn_text(_terminal_label(self.locked.raw_run), font_size=24, color=NAVY),
            equation(f"最佳验证：迭代 {raw_best['iteration']} · BCE {float(raw_best['bce']):.10f}", font_size=22),
            equation(f"终点：迭代 {raw_terminal['iteration']}", font_size=24, color=RED),
            cn_text("含义：耐心用尽；没有证明梯度收敛", font_size=21, color=MUTED),
            width=6.1,
            height=4.15,
        ).shift(LEFT * 3.35 + DOWN * 0.25)
        standardized = card(
            circle_marker(radius=0.18, color=TEAL),
            cn_text("标准化特征 · 固定步长", font_size=27, color=TEAL, weight="SEMIBOLD"),
            cn_text(_terminal_label(self.locked.standardized_run), font_size=24, color=NAVY),
            equation(
                f"最佳验证：迭代 {standardized_best['iteration']} · BCE {float(standardized_best['bce']):.10f}",
                font_size=22,
            ),
            equation(f"终点：迭代 {standardized_terminal['iteration']}", font_size=24, color=TEAL),
            cn_text("含义：梯度范数达到锁定容差", font_size=21, color=MUTED),
            width=6.1,
            height=4.15,
        ).shift(RIGHT * 3.35 + DOWN * 0.25)
        self.play(FadeIn(title), FadeIn(raw), run_time=1.0)
        self.play(FadeIn(standardized), run_time=1.0)

    def _penalty_geometry_caveat(self):
        self._clear()
        title = top_heading("这组配对说明步长可用性，不是最终质量排行榜")
        constants = _mapping(self.locked.summary.get("constants"), "summary.constants")
        raw_best = _mapping(self.locked.raw_run.get("bestValidation"), "raw bestValidation")
        standardized_best = _mapping(self.locked.standardized_run.get("bestValidation"), "standardized bestValidation")
        comparison = card(
            cn_text("锁定验证点", font_size=27, color=DATA_BLUE, weight="SEMIBOLD"),
            equation(f"原始：{float(raw_best['bce']):.10f}", font_size=28, color=ORANGE),
            equation(f"标准化：{float(standardized_best['bce']):.10f}", font_size=28, color=TEAL),
            width=4.8,
            height=3.1,
        ).shift(LEFT * 4.0 + DOWN * 0.1)
        caveat = card(
            cn_text("不可直接判定谁的最终模型更好", font_size=28, color=RED, weight="SEMIBOLD"),
            equation(f"同一系数空间 L2：λ = {float(constants['l2']):.3f}", font_size=27),
            cn_text("改变特征单位，也改变惩罚项的几何", font_size=24, color=NAVY),
            cn_text("这里只比较调节与早期轨迹", font_size=23, color=MUTED),
            width=7.0,
            height=3.5,
        ).shift(RIGHT * 2.9 + DOWN * 0.1)
        boundary = disclaimer("最终测试报告留给预先声明且数学收敛的候选运行", font_size=24).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(title), FadeIn(comparison), run_time=0.9)
        self.play(FadeIn(caveat), FadeIn(boundary), run_time=1.0)

    def _poster_ready_conclusion(self):
        self._clear()
        raw_terminal = _mapping(self.locked.raw_run.get("terminal"), "raw terminal")
        standardized_terminal = _mapping(self.locked.standardized_run.get("terminal"), "standardized terminal")
        heading = title_block(
            "结论",
            "先对齐尺度，再判断一个固定步长是否可用",
            "相同 α 保持实验可比；停止原因决定我们能说什么",
        )
        fit_width(heading, 12.0)
        heading.to_edge(UP, buff=0.45)
        raw = card(
            square_marker(side_length=0.34, color=ORANGE, fill_color=PAPER),
            cn_text("原始坐标", font_size=28, color=ORANGE, weight="SEMIBOLD"),
            equation(f"α={_format_decimal(self.locked.raw_run['config']['step'], 1)} · 震荡", font_size=29),
            cn_text(f"验证耐心停止 · 迭代 {raw_terminal['iteration']}", font_size=23, color=RED),
            width=5.3,
            height=2.75,
        ).shift(LEFT * 3.45 + DOWN * 0.7)
        standardized = card(
            circle_marker(radius=0.17, color=TEAL),
            cn_text("训练集标准化坐标", font_size=28, color=TEAL, weight="SEMIBOLD"),
            equation(f"α={_format_decimal(self.locked.standardized_run['config']['step'], 1)} · 稳定", font_size=29),
            cn_text(f"梯度范数收敛 · 迭代 {standardized_terminal['iteration']}", font_size=23, color=TEAL),
            width=5.5,
            height=2.75,
        ).shift(RIGHT * 3.45 + DOWN * 0.7)
        arrow = Arrow(raw.get_right(), standardized.get_left(), buff=0.25, color=DATA_BLUE)
        caveat = disclaimer("注意：特征换单位会改变同一系数 L2 的几何；不要据此排列最终质量", font_size=22, color=MUTED).to_edge(
            DOWN, buff=0.45
        )
        self.play(FadeIn(heading[0]), Write(heading[1]), FadeIn(heading[2]), run_time=1.0)
        self.play(FadeIn(raw), Create(arrow), FadeIn(standardized), run_time=1.1)
        self.play(FadeIn(caveat), run_time=0.7)

    def _advance_to(self, timestamp: float):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
