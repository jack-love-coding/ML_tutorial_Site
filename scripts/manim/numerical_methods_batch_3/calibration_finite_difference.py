"""Deterministic 78-second lesson: finite differences on logit-bias residual."""

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
    DashedLine,
    Dot,
    FadeIn,
    FadeOut,
    Group,
    Line,
    Scene,
    SurroundingRectangle,
    VGroup,
    VMobject,
    Write,
)

from common import card, cn_text, equation, fit_width, title_block, top_heading
from palette import BACKGROUND, DATA_BLUE, GRID, MUTED, NAVY, ORANGE, PALE_ORANGE, PAPER, RED, TEAL


LOGITS = (-3.2, -2.1, -1.4, -0.9, -0.4, -0.1, 0.2, 0.5, 0.9, 1.3, 2.0, 3.1)
TARGET = 0.62


def sigmoid(value: float) -> float:
    if value >= 0:
        return 1 / (1 + math.exp(-value))
    exponential = math.exp(value)
    return exponential / (1 + exponential)


def residual(bias: float) -> float:
    return sum(sigmoid(logit + bias) for logit in LOGITS) / len(LOGITS) - TARGET


class CalibrationFiniteDifferenceScene(Scene):
    """Approved 0–78 second storyboard anchored to the executed Notebook."""

    def construct(self):
        self.camera.background_color = BACKGROUND
        self._opening()
        self._advance_to(8)
        self._build_residual()
        self._advance_to(19)
        self._stencils()
        self._advance_to(32)
        self._error_curve()
        self._advance_to(47)
        self._cancellation()
        self._advance_to(60)
        self._locked_output()
        self._advance_to(70)
        self._handoff()
        self._advance_to(78)

    def _clear(self, *, run_time: float = 0.5):
        if self.mobjects:
            self.play(FadeOut(Group(*self.mobjects)), run_time=run_time)

    def _residual_axes(self, *, x_length: float = 7.1, y_length: float = 4.2):
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
        axes, curve = self._residual_axes(x_length=6.2, y_length=3.7)
        axes.shift(LEFT * 3.3 + DOWN * 0.45)
        curve = axes.plot(residual, x_range=[-4, 4], color=DATA_BLUE, stroke_width=5)
        root = Dot(axes.c2p(0.7302907403, 0), radius=0.09, color=TEAL)
        heading = title_block(
            "数值方法 · 有限差分",
            "只调用函数，也能检查局部斜率吗？",
            "12 个固定 logit · 一个偏置 b · 一个残差 F(b)",
        ).shift(RIGHT * 2.75 + UP * 0.45)
        fit_width(heading, 7.0)
        formula = card(
            equation("F(b) = mean(σ(z+b)) − 0.62", font_size=31, color=NAVY),
            equation("探针 b₀ = 0.35", font_size=30, color=ORANGE),
            cn_text("本节不训练模型", font_size=22, color=MUTED),
            width=6.0,
            height=2.25,
        ).shift(RIGHT * 3.2 + DOWN * 1.7)
        self.play(FadeIn(axes), Create(curve), FadeIn(root), run_time=1.25)
        self.play(Write(heading[0]), Write(heading[1]), FadeIn(heading[2]), run_time=1.3)
        self.play(FadeIn(formula), run_time=0.85)

    def _build_residual(self):
        self._clear()
        title = top_heading("先把模型输出变成一条可重复计算的残差曲线")
        logits = card(
            cn_text("固定输入", font_size=26, color=DATA_BLUE, weight="SEMIBOLD"),
            equation("z = [−3.2, …, 3.1]", font_size=30),
            cn_text("共 12 个 logit", font_size=23, color=MUTED),
            width=3.8,
            height=2.2,
        ).shift(LEFT * 4.6 + DOWN * 0.15)
        probabilities = card(
            cn_text("加偏置并压到 0–1", font_size=25, color=TEAL, weight="SEMIBOLD"),
            equation("pᵢ(b) = σ(zᵢ+b)", font_size=31, color=TEAL),
            width=4.2,
            height=2.2,
        ).shift(DOWN * 0.15)
        output = card(
            cn_text("取平均再减目标", font_size=25, color=ORANGE, weight="SEMIBOLD"),
            equation("F(b) = mean(pᵢ) − 0.62", font_size=29),
            equation("F(0.35) = −0.0607869881", font_size=27, color=RED),
            width=4.6,
            height=2.5,
        ).shift(RIGHT * 4.55 + DOWN * 0.15)
        first = Arrow(logits.get_right(), probabilities.get_left(), buff=0.2, color=DATA_BLUE)
        second = Arrow(probabilities.get_right(), output.get_left(), buff=0.2, color=TEAL)
        note = cn_text("负残差：当前平均概率仍低于 0.62", font_size=26, color=NAVY, weight="SEMIBOLD").to_edge(DOWN, buff=0.6)
        self.play(FadeIn(title), FadeIn(logits), run_time=0.8)
        self.play(Create(first), FadeIn(probabilities), run_time=1.0)
        self.play(Create(second), FadeIn(output), run_time=1.0)
        self.play(FadeIn(note), run_time=0.75)

    def _stencils(self):
        self._clear()
        title = top_heading("在 b₀ 左右采样：割线斜率逼近切线斜率")
        axes = Axes(
            x_range=[-0.15, 0.85, 0.25],
            y_range=[-0.16, 0.03, 0.05],
            x_length=7.0,
            y_length=4.5,
            axis_config={"color": GRID, "stroke_width": 2},
            tips=False,
        ).shift(LEFT * 3.2 + DOWN * 0.35)
        curve = axes.plot(residual, x_range=[-0.15, 0.85], color=DATA_BLUE, stroke_width=5)
        b0 = 0.35
        h = 0.20
        left = axes.c2p(b0 - h, residual(b0 - h))
        center = axes.c2p(b0, residual(b0))
        right = axes.c2p(b0 + h, residual(b0 + h))
        points = VGroup(Dot(left, color=ORANGE), Dot(center, color=RED), Dot(right, color=ORANGE))
        central_secant = Line(left, right, color=ORANGE, stroke_width=5)
        tangent = Line(
            axes.c2p(b0 - 0.3, residual(b0) - 0.3 * 0.1630982544),
            axes.c2p(b0 + 0.3, residual(b0) + 0.3 * 0.1630982544),
            color=TEAL,
            stroke_width=4,
        )
        formulas = card(
            cn_text("前向差分", font_size=26, color=DATA_BLUE, weight="SEMIBOLD"),
            equation("[F(b+h) − F(b)] / h", font_size=27),
            cn_text("中心差分", font_size=26, color=TEAL, weight="SEMIBOLD"),
            equation("[F(b+h) − F(b−h)] / 2h", font_size=27),
            cn_text("中心差分多看左侧，截断误差为 O(h²)", font_size=21, color=MUTED),
            width=5.7,
            height=3.7,
        ).shift(RIGHT * 3.7 + DOWN * 0.2)
        labels = VGroup(
            cn_text("F(b−h)", font_size=20, color=ORANGE).next_to(points[0], UP, buff=0.1),
            cn_text("F(b)", font_size=20, color=RED).next_to(points[1], DOWN, buff=0.1),
            cn_text("F(b+h)", font_size=20, color=ORANGE).next_to(points[2], UP, buff=0.1),
        )
        self.play(FadeIn(title), FadeIn(axes), Create(curve), run_time=1.0)
        self.play(FadeIn(points), FadeIn(labels), Create(central_secant), run_time=1.1)
        self.play(Create(tangent), FadeIn(formulas), run_time=1.1)

    def _error_curve(self):
        self._clear()
        title = top_heading("步长从 1e−1 扫到 1e−12：误差不是单调下降")
        axes = Axes(
            x_range=[-12, -1, 1],
            y_range=[-13, -3, 2],
            x_length=8.0,
            y_length=4.7,
            axis_config={"color": GRID, "stroke_width": 2, "font_size": 22},
            tips=False,
        ).shift(LEFT * 2.2 + DOWN * 0.35)
        forward_errors = [6.49e-6, 6.49e-6, 1.69e-7, 5.28e-8, 1.38e-8, 6.08e-10, 6.83e-9, 6.77e-8, 6.77e-7, 6.77e-6, 6.82e-5, 7.26e-4]
        central_errors = [6.20e-5, 6.49e-6, 1.69e-7, 5.28e-8, 8.27e-9, 5.32e-11, 5.32e-11, 2.34e-12, 4.87e-11, 4.95e-9, 4.95e-7, 4.95e-5]
        exponents = list(range(-12, 0))

        def polyline(values, color):
            line = VMobject(color=color, stroke_width=5)
            line.set_points_as_corners([axes.c2p(x, math.log10(y)) for x, y in zip(exponents, values, strict=True)])
            return line

        forward = polyline(forward_errors, ORANGE)
        central = polyline(central_errors, TEAL)
        best = Dot(axes.c2p(-5, math.log10(2.339e-12)), radius=0.10, color=TEAL)
        best_label = cn_text("中心差分最佳采样：h=1e−5", font_size=22, color=TEAL).next_to(best, UP, buff=0.15)
        side = card(
            cn_text("纵轴：log₁₀ 绝对误差", font_size=23, color=MUTED),
            cn_text("前向差分", font_size=27, color=ORANGE, weight="SEMIBOLD"),
            equation("最佳 h = 1e−7", font_size=25),
            cn_text("中心差分", font_size=27, color=TEAL, weight="SEMIBOLD"),
            equation("最佳 h = 1e−5", font_size=25),
            equation("h=1e−12：误差 6.200e−5", font_size=22, color=RED),
            width=4.0,
            height=4.15,
        ).shift(RIGHT * 4.85 + DOWN * 0.3)
        axis_label = cn_text("横轴：log₁₀ h", font_size=22, color=MUTED).next_to(axes, DOWN, buff=0.2)
        self.play(FadeIn(title), FadeIn(axes), FadeIn(axis_label), run_time=0.9)
        self.play(Create(forward), Create(central), run_time=1.35)
        self.play(FadeIn(best), FadeIn(best_label), FadeIn(side), run_time=1.0)

    def _cancellation(self):
        self._clear()
        title = top_heading("太大看见曲率，太小丢失有效数字")
        large = card(
            cn_text("h 过大", font_size=30, color=ORANGE, weight="SEMIBOLD"),
            equation("割线窗口太宽", font_size=27),
            cn_text("Taylor 高阶项没有消失", font_size=23, color=MUTED),
            equation("主导：截断误差", font_size=30, color=ORANGE),
            width=5.5,
            height=3.4,
        ).shift(LEFT * 3.5 + DOWN * 0.1)
        small = card(
            cn_text("h 过小", font_size=30, color=RED, weight="SEMIBOLD"),
            equation("F(b+h) ≈ F(b−h)", font_size=27),
            cn_text("相近浮点数相减后再除以 2h", font_size=22, color=MUTED),
            equation("主导：浮点相消", font_size=30, color=RED),
            width=5.7,
            height=3.4,
        ).shift(RIGHT * 3.5 + DOWN * 0.1)
        balance = card(
            equation("稳定窗口 = 截断与舍入之间的折中", font_size=28, color=TEAL),
            cn_text("最佳 h 随函数尺度、精度与模板变化", font_size=23, color=NAVY),
            width=8.0,
            height=1.4,
        ).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(title), FadeIn(large), run_time=1.0)
        self.play(FadeIn(small), run_time=1.0)
        self.play(FadeIn(balance), Create(SurroundingRectangle(balance, color=TEAL, buff=0.08)), run_time=0.9)

    def _locked_output(self):
        self._clear()
        title = top_heading("固定 Notebook 输出：差分值必须与同一解析导数对齐")
        derivative = card(
            cn_text("解析导数", font_size=26, color=DATA_BLUE, weight="SEMIBOLD"),
            equation("F′(b) = mean(pᵢ(1−pᵢ))", font_size=29),
            equation("F′(0.35) = 0.1630982544", font_size=33, color=DATA_BLUE),
            width=6.0,
            height=2.7,
        ).shift(LEFT * 3.4 + DOWN * 0.2)
        result = card(
            cn_text("中心差分 · h = 1e−5", font_size=26, color=TEAL, weight="SEMIBOLD"),
            equation("0.16309825440208314", font_size=31, color=TEAL),
            equation("绝对误差 = 2.339e−12", font_size=28, color=ORANGE),
            cn_text("最小步长 ≠ 最好步长", font_size=25, color=RED, weight="SEMIBOLD"),
            width=6.1,
            height=3.2,
        ).shift(RIGHT * 3.4 + DOWN * 0.2)
        arrow = Arrow(derivative.get_right(), result.get_left(), buff=0.25, color=TEAL)
        self.play(FadeIn(title), FadeIn(derivative), run_time=0.9)
        self.play(Create(arrow), FadeIn(result), run_time=1.1)

    def _handoff(self):
        self._clear()
        heading = title_block(
            "结论",
            "有限差分回答：这里有多陡？",
            "先扫描步长，再把近似与独立可算的导数对齐",
        )
        fit_width(heading, 11.6)
        boundary = card(
            cn_text("下一章保持同一个 F(b)", font_size=29, color=TEAL, weight="SEMIBOLD"),
            equation("从 F′(b) 转向求解 F(b) = 0", font_size=28, color=NAVY),
            cn_text("匹配平均概率不等于完成完整概率校准", font_size=22, color=MUTED),
            width=10.6,
            height=2.1,
        ).next_to(heading, DOWN, buff=0.65)
        self.play(FadeIn(heading[0]), Write(heading[1]), run_time=1.0)
        self.play(FadeIn(heading[2]), FadeIn(boundary), run_time=1.05)

    def _advance_to(self, timestamp: float):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
