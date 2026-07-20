"""Deterministic 80-second lesson: three solvers on logit-bias residual."""

from __future__ import annotations

import math

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Arrow,
    Axes,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    Group,
    Line,
    Scene,
    SurroundingRectangle,
    VGroup,
    Write,
)

from common import card, cn_text, equation, fit_width, title_block, top_heading
from palette import BACKGROUND, DATA_BLUE, GRID, MUTED, NAVY, ORANGE, RED, TEAL


LOGITS = (-3.2, -2.1, -1.4, -0.9, -0.4, -0.1, 0.2, 0.5, 0.9, 1.3, 2.0, 3.1)
TARGET = 0.62
ROOT = 0.730290740297536


def sigmoid(value: float) -> float:
    if value >= 0:
        return 1 / (1 + math.exp(-value))
    exponential = math.exp(value)
    return exponential / (1 + exponential)


def residual(bias: float) -> float:
    return sum(sigmoid(logit + bias) for logit in LOGITS) / len(LOGITS) - TARGET


def derivative(bias: float) -> float:
    probabilities = [sigmoid(logit + bias) for logit in LOGITS]
    return sum(value * (1 - value) for value in probabilities) / len(probabilities)


class CalibrationRootFindingScene(Scene):
    """Approved 0–80 second storyboard anchored to the executed Notebook."""

    def construct(self):
        self.camera.background_color = BACKGROUND
        self._opening()
        self._advance_to(9)
        self._root_contract()
        self._advance_to(20)
        self._bisection()
        self._advance_to(34)
        self._newton()
        self._advance_to(48)
        self._secant()
        self._advance_to(61)
        self._costs()
        self._advance_to(71)
        self._failures()
        self._advance_to(77)
        self._handoff()
        self._advance_to(80)

    def _clear(self, *, run_time: float = 0.5):
        if self.mobjects:
            self.play(FadeOut(Group(*self.mobjects)), run_time=run_time)

    def _axes(self, *, x_length: float = 7.3, y_length: float = 4.4):
        axes = Axes(
            x_range=[-4, 4, 2],
            y_range=[-0.32, 0.32, 0.16],
            x_length=x_length,
            y_length=y_length,
            axis_config={"color": GRID, "stroke_width": 2, "include_ticks": True},
            tips=False,
        )
        curve = axes.plot(residual, x_range=[-4, 4], color=DATA_BLUE, stroke_width=5)
        return axes, curve

    def _opening(self):
        axes, curve = self._axes(x_length=6.4, y_length=3.8)
        axes.shift(LEFT * 3.2 + DOWN * 0.45)
        curve = axes.plot(residual, x_range=[-4, 4], color=DATA_BLUE, stroke_width=5)
        root = Dot(axes.c2p(ROOT, 0), radius=0.1, color=TEAL)
        root_label = equation("b* = 0.7302907403", font_size=23, color=TEAL).next_to(root, UP, buff=0.15)
        heading = title_block(
            "数值方法 · 非线性求根",
            "同一条残差曲线，哪里等于零？",
            "二分 · Newton · 割线",
        ).shift(RIGHT * 2.8 + UP * 0.5)
        fit_width(heading, 6.7)
        formula = card(
            equation("F(b) = mean(σ(z+b)) − 0.62", font_size=30),
            equation("目标：F(b) = 0", font_size=34, color=TEAL),
            cn_text("沿用上一章的 12 个固定 logit", font_size=22, color=MUTED),
            width=6.1,
            height=2.35,
        ).shift(RIGHT * 3.2 + DOWN * 1.65)
        self.play(FadeIn(axes), Create(curve), FadeIn(root), FadeIn(root_label), run_time=1.25)
        self.play(Write(heading[0]), Write(heading[1]), FadeIn(heading[2]), run_time=1.3)
        self.play(FadeIn(formula), run_time=0.85)

    def _root_contract(self):
        self._clear()
        title = top_heading("连续 + 单调 + 两端异号：区间内有且只有一个根")
        axes, curve = self._axes(x_length=7.0, y_length=4.2)
        axes.shift(LEFT * 3.1 + DOWN * 0.35)
        curve = axes.plot(residual, x_range=[-4, 4], color=DATA_BLUE, stroke_width=5)
        left = Dot(axes.c2p(-4, residual(-4)), color=ORANGE)
        right = Dot(axes.c2p(4, residual(4)), color=TEAL)
        root = Dot(axes.c2p(ROOT, 0), color=RED)
        labels = VGroup(
            equation("F(−4) < 0", font_size=22, color=ORANGE).next_to(left, UP, buff=0.1),
            equation("F(4) > 0", font_size=22, color=TEAL).next_to(right, DOWN, buff=0.1),
            equation("F(b*) = 0", font_size=22, color=RED).next_to(root, UP, buff=0.12),
        )
        contract = card(
            cn_text("存在性", font_size=28, color=DATA_BLUE, weight="SEMIBOLD"),
            cn_text("连续函数在异号端点之间穿过 0", font_size=23),
            cn_text("唯一性", font_size=28, color=TEAL, weight="SEMIBOLD"),
            equation("F′(b) = mean(pᵢ(1−pᵢ)) > 0", font_size=25),
            cn_text("固定区间：[−4, 4]", font_size=24, color=ORANGE),
            width=5.5,
            height=3.8,
        ).shift(RIGHT * 4.0 + DOWN * 0.2)
        self.play(FadeIn(title), FadeIn(axes), Create(curve), run_time=1.0)
        self.play(FadeIn(left), FadeIn(right), FadeIn(root), FadeIn(labels), run_time=1.0)
        self.play(FadeIn(contract), run_time=1.0)

    def _bisection(self):
        self._clear()
        title = top_heading("二分法：每一步只保留仍然异号的半个区间")
        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[-0.3, 0.3, 0.15],
            x_length=8.0,
            y_length=4.4,
            axis_config={"color": GRID, "stroke_width": 2},
            tips=False,
        ).shift(LEFT * 2.2 + DOWN * 0.35)
        curve = axes.plot(residual, x_range=[-4, 4], color=DATA_BLUE, stroke_width=5)
        intervals = [(-4, 4), (0, 4), (0, 2), (0, 1), (0.5, 1), (0.5, 0.75)]
        bars = VGroup()
        for index, (left, right) in enumerate(intervals):
            y = -0.25 + index * 0.035
            bar = Line(axes.c2p(left, y), axes.c2p(right, y), color=TEAL if index == len(intervals) - 1 else ORANGE, stroke_width=6)
            bars.add(bar)
        mids = [0, 2, 1, 0.5, 0.75]
        dots = VGroup(*[Dot(axes.c2p(value, residual(value)), radius=0.065, color=ORANGE) for value in mids])
        side = card(
            cn_text("不读取导数", font_size=25, color=TEAL, weight="SEMIBOLD"),
            equation("区间宽度每次减半", font_size=27),
            equation("37 次更新", font_size=35, color=ORANGE),
            equation("39 次函数求值", font_size=29, color=DATA_BLUE),
            cn_text("始终保留含根区间", font_size=23, color=MUTED),
            width=4.2,
            height=3.6,
        ).shift(RIGHT * 4.9 + DOWN * 0.25)
        self.play(FadeIn(title), FadeIn(axes), Create(curve), run_time=0.9)
        for bar, dot in zip(bars[:-1], dots, strict=True):
            self.play(Create(bar), FadeIn(dot), run_time=0.48)
        self.play(Create(bars[-1]), FadeIn(side), run_time=1.0)

    def _newton(self):
        self._clear()
        title = top_heading("Newton 法：用当前切线预测下一次与横轴的交点")
        axes = Axes(
            x_range=[-0.2, 1.1, 0.2],
            y_range=[-0.14, 0.08, 0.05],
            x_length=8.0,
            y_length=4.6,
            axis_config={"color": GRID, "stroke_width": 2},
            tips=False,
        ).shift(LEFT * 2.1 + DOWN * 0.35)
        curve = axes.plot(residual, x_range=[-0.2, 1.1], color=DATA_BLUE, stroke_width=5)
        values = [0.0, 0.7140231519, 0.7302709206, 0.7302907403]
        paths = VGroup()
        for current, nxt in zip(values[:-1], values[1:], strict=True):
            current_point = axes.c2p(current, residual(current))
            intercept = axes.c2p(nxt, 0)
            vertical = Line(axes.c2p(current, 0), current_point, color=GRID, stroke_width=2)
            tangent = Line(current_point, intercept, color=RED, stroke_width=4)
            paths.add(VGroup(vertical, tangent, Dot(current_point, radius=0.07, color=RED), Dot(intercept, radius=0.06, color=TEAL)))
        sequence = card(
            cn_text("初始 b₀ = 0", font_size=24, color=MUTED),
            equation("0 → 0.714023", font_size=27),
            equation("→ 0.730271", font_size=27),
            equation("→ 0.730291", font_size=30, color=TEAL),
            equation("3 次更新", font_size=33, color=ORANGE),
            width=4.2,
            height=3.8,
        ).shift(RIGHT * 4.9 + DOWN * 0.25)
        update = equation("bₖ₊₁ = bₖ − F(bₖ) / F′(bₖ)", font_size=25, color=NAVY).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(title), FadeIn(axes), Create(curve), run_time=0.9)
        for path in paths:
            self.play(Create(path[0]), Create(path[1]), FadeIn(path[2]), FadeIn(path[3]), run_time=0.75)
        self.play(FadeIn(sequence), FadeIn(update), run_time=0.9)

    def _secant(self):
        self._clear()
        title = top_heading("割线法：用两个历史函数值代替解析导数")
        axes = Axes(
            x_range=[-1.2, 1.2, 0.4],
            y_range=[-0.3, 0.1, 0.1],
            x_length=8.0,
            y_length=4.6,
            axis_config={"color": GRID, "stroke_width": 2},
            tips=False,
        ).shift(LEFT * 2.1 + DOWN * 0.35)
        curve = axes.plot(residual, x_range=[-1.2, 1.2], color=DATA_BLUE, stroke_width=5)
        values = [-1.0, 1.0, 0.748418, 0.729906, 0.730290, 0.730291]
        points = [Dot(axes.c2p(value, residual(value)), radius=0.07, color=ORANGE) for value in values]
        chords = VGroup(*[
            Line(axes.c2p(left, residual(left)), axes.c2p(right, residual(right)), color=ORANGE, stroke_width=3.5)
            for left, right in zip(values[:-1], values[1:], strict=True)
        ])
        sequence = card(
            cn_text("初始点：−1 与 1", font_size=24, color=MUTED),
            cn_text("两点决定一条割线", font_size=26, color=ORANGE, weight="SEMIBOLD"),
            equation("5 次更新", font_size=34, color=ORANGE),
            equation("7 次函数求值", font_size=29, color=DATA_BLUE),
            cn_text("不需要解析导数", font_size=23, color=TEAL),
            width=4.2,
            height=3.55,
        ).shift(RIGHT * 4.9 + DOWN * 0.25)
        self.play(FadeIn(title), FadeIn(axes), Create(curve), run_time=0.9)
        self.play(FadeIn(points[0]), FadeIn(points[1]), Create(chords[0]), run_time=0.85)
        for index in range(2, len(points)):
            self.play(FadeIn(points[index]), Create(chords[index - 1]), run_time=0.55)
        self.play(FadeIn(sequence), run_time=0.9)

    def _costs(self):
        self._clear()
        title = top_heading("不能只数迭代：每种更新读取的信息不同")
        headers = VGroup(*[
            cn_text(value, font_size=23, color=NAVY, weight="SEMIBOLD")
            for value in ["方法", "更新", "函数", "导数", "保留区间"]
        ]).arrange(RIGHT, buff=0.95)
        rows = VGroup()
        values = [
            ("二分", "37", "39", "0", "是", TEAL),
            ("Newton", "3", "4", "4", "否", RED),
            ("割线", "5", "7", "0", "否", ORANGE),
        ]
        for method, updates, fn, derivative_count, bracket, color in values:
            row = VGroup(
                cn_text(method, font_size=25, color=color, weight="SEMIBOLD"),
                equation(updates, font_size=25),
                equation(fn, font_size=25),
                equation(derivative_count, font_size=25),
                cn_text(bracket, font_size=25, color=NAVY),
            ).arrange(RIGHT, buff=1.35)
            rows.add(row)
        rows.arrange(DOWN, aligned_edge=LEFT, buff=0.55)
        table = card(headers, rows, width=10.9, height=4.0, buff=0.55).shift(DOWN * 0.15)
        note = cn_text("速度、稳定性、导数成本与函数调用要一起比较", font_size=26, color=NAVY, weight="SEMIBOLD").to_edge(DOWN, buff=0.45)
        self.play(FadeIn(title), FadeIn(table), run_time=1.15)
        self.play(FadeIn(note), Create(SurroundingRectangle(note, color=DATA_BLUE, buff=0.12)), run_time=0.85)

    def _failures(self):
        self._clear()
        title = top_heading("求解器必须先检查失败条件，再报告近似根")
        bracket = card(
            cn_text("无效区间 [−4, −3]", font_size=27, color=ORANGE, weight="SEMIBOLD"),
            cn_text("两端残差同号", font_size=24),
            cn_text("二分法应拒绝启动", font_size=27, color=RED, weight="SEMIBOLD"),
            width=5.6,
            height=2.8,
        ).shift(LEFT * 3.5 + DOWN * 0.2)
        saturated = card(
            cn_text("sigmoid 饱和区", font_size=27, color=DATA_BLUE, weight="SEMIBOLD"),
            equation("F′(b) 很小", font_size=27),
            cn_text("Newton 步可能离开保护域", font_size=26, color=RED, weight="SEMIBOLD"),
            cn_text("可阻尼、保留区间或回退二分", font_size=22, color=MUTED),
            width=5.9,
            height=3.1,
        ).shift(RIGHT * 3.5 + DOWN * 0.2)
        self.play(FadeIn(title), FadeIn(bracket), run_time=0.95)
        self.play(FadeIn(saturated), run_time=0.95)

    def _handoff(self):
        self._clear(run_time=0.35)
        heading = title_block(
            "结论",
            "非线性求根回答：哪里等于零？",
            "固定根 b* = 0.7302907403 · 平均概率 ≈ 0.62",
        )
        fit_width(heading, 11.6)
        boundary = card(
            cn_text("匹配一个平均值只解决这个标量方程", font_size=27, color=NAVY, weight="SEMIBOLD"),
            cn_text("下一章把求零扩展为最小化目标函数", font_size=26, color=TEAL),
            width=10.4,
            height=1.8,
        ).next_to(heading, DOWN, buff=0.6)
        self.play(FadeIn(heading[0]), Write(heading[1]), FadeIn(heading[2]), run_time=0.95)
        self.play(FadeIn(boundary), run_time=0.7)

    def _advance_to(self, timestamp: float):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
