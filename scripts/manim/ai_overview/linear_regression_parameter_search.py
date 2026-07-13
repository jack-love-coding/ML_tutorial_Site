"""Deterministic 85-second linear-regression parameter-search lesson."""

import json
from pathlib import Path

from manim import (
    Axes, BackgroundRectangle, Create, DashedLine, Dot, DOWN, FadeIn, FadeOut, Group, LEFT, Line, MathTex,
    RIGHT, Scene, SurroundingRectangle, Text, Transform, UP, VGroup, Write, config,
)

from palette import BACKGROUND, BLUE, CHINESE_FONT, GREEN, GRID, INK, MUTED, ORANGE, PAPER, PINK, RED, YELLOW


SAMPLES = [(1, 52), (2, 59), (3, 65), (4, 72), (5, 78)]
FIXTURE = json.loads((Path(__file__).resolve().parents[3] / "public/manim/ai-overview/experiment-fixture.json").read_text(encoding="utf-8"))
CANDIDATES = FIXTURE["regression"]["candidateTimeline"]


class LinearRegressionParameterSearch(Scene):
    """Approved storyboard 9.1, using the clear-trend lab fixture verbatim."""

    def construct(self):
        self.camera.background_color = BACKGROUND
        self._question()
        self._advance_to(8)
        axes, dots = self._data_plot()
        self._advance_to(18)
        line, formula = self._candidate_line(axes)
        self._advance_to(30)
        self._one_sample(axes, line, formula)
        self._advance_to(44)
        self._mse_table()
        self._advance_to(55)
        self._parameter_search(axes, dots)
        self._advance_to(75)
        self._conclusion(axes)
        self._advance_to(85)

    def _question(self):
        badge = Text("监督学习 · 线性回归", font=CHINESE_FONT, font_size=28, color=BLUE)
        badge.to_edge(UP, buff=0.65)
        title = Text("练习时长能预测下一次得分吗？", font=CHINESE_FONT, font_size=48, color=INK)
        subtitle = Text("输入 x：练习时长（小时）   输出 ŷ：预测得分", font=CHINESE_FONT, font_size=28, color=MUTED)
        subtitle.next_to(title, direction=(0, -1, 0), buff=0.45)
        self.play(FadeIn(badge), Write(title), run_time=1.6)
        self.play(FadeIn(subtitle), run_time=1.1)
        self.wait(1.0)
        self.play(FadeOut(VGroup(badge, title, subtitle)), run_time=0.8)

    def _data_plot(self):
        title = Text("共享数据：清晰趋势 clear-trend", font=CHINESE_FONT, font_size=32, color=INK).to_edge(UP, buff=0.3)
        axes = Axes(
            x_range=[0, 6, 1], y_range=[45, 85, 10], x_length=9.2, y_length=5.2,
            axis_config={"color": MUTED, "include_ticks": True}, tips=False,
        ).shift(0.25 * LEFT + 0.25 * DOWN)
        labels = axes.get_axis_labels(
            Text("练习时长 x（小时）", font=CHINESE_FONT, font_size=22, color=MUTED),
            Text("下一次得分 y", font=CHINESE_FONT, font_size=22, color=MUTED),
        )
        dots = VGroup(*[Dot(axes.c2p(x, y), radius=0.1, color=PINK) for x, y in SAMPLES])
        values = Text("(1,52)  (2,59)  (3,65)  (4,72)  (5,78)", font=CHINESE_FONT, font_size=22, color=MUTED)
        values.to_edge((0, -1, 0), buff=0.2)
        self.play(FadeIn(title), Create(axes), FadeIn(labels), run_time=1.8)
        self.play(*[FadeIn(dot) for dot in dots], FadeIn(values), run_time=2.0)
        self.add(axes, dots)
        self._plot_title = title
        self._plot_labels = labels
        self._plot_values = values
        return axes, dots

    def _candidate_line(self, axes):
        line = Line(axes.c2p(0, 47), axes.c2p(6, 83), color=BLUE, stroke_width=5)
        formula = MathTex(r"\hat{y}=wx+b", color=INK).scale(1.05).to_corner(UP + RIGHT, buff=0.55)
        role_w = Text("w：斜率，控制每多练 1 小时提高多少分", font=CHINESE_FONT, font_size=22, color=BLUE)
        role_b = Text("b：截距，控制整条直线的上下位置", font=CHINESE_FONT, font_size=22, color=ORANGE)
        roles = VGroup(role_w, role_b).arrange((0, -1, 0), aligned_edge=LEFT, buff=0.22).to_corner(UP + LEFT, buff=0.55)
        params = MathTex(r"w=6,\quad b=47", color=INK).scale(0.72).next_to(formula, (0, -1, 0), buff=0.18)
        self.play(Create(line), Write(formula), run_time=1.8)
        self.play(FadeIn(roles), FadeIn(params), run_time=1.2)
        self.play(line.animate.set_color(ORANGE), run_time=0.8)
        self.play(line.animate.set_color(BLUE), run_time=0.8)
        self.wait(0.8)
        self._roles = roles
        self._params = params
        return line, formula

    def _one_sample(self, axes, line, formula):
        self.play(FadeOut(VGroup(self._roles, self._params, self._plot_title, self._plot_values, formula)), run_time=0.7)
        predicted = axes.c2p(1, 53)
        observed = axes.c2p(1, 52)
        residual = DashedLine(observed, predicted, color=RED, stroke_width=5)
        focus = SurroundingRectangle(Dot(observed), color=YELLOW, buff=0.16)
        calc = VGroup(
            Text("取第 1 个样本：x=1，y=52", font=CHINESE_FONT, font_size=25, color=INK),
            MathTex(r"\hat y=6\times1+47=53", color=BLUE).scale(0.76),
            MathTex(r"y-\hat y=52-53=-1", color=RED).scale(0.76),
            MathTex(r"(y-\hat y)^2=(-1)^2=1", color=ORANGE).scale(0.76),
        ).arrange((0, -1, 0), aligned_edge=LEFT, buff=0.25).to_corner(UP + RIGHT, buff=0.35)
        calc_background = BackgroundRectangle(calc, color=BACKGROUND, fill_opacity=0.96, buff=0.18)
        self.play(FadeIn(focus), Create(residual), run_time=1.2)
        self.play(FadeIn(calc_background), run_time=0.35)
        for item in calc:
            self.play(Write(item), run_time=0.75)
        self.wait(1.0)
        self.play(FadeOut(VGroup(calc_background, calc, focus, residual)), run_time=0.7)

    def _mse_table(self):
        title = Text("把 5 个平方误差汇总", font=CHINESE_FONT, font_size=34, color=INK).to_edge(UP, buff=0.35)
        header = Text("x       1      2      3      4      5", font=CHINESE_FONT, font_size=24, color=MUTED)
        pred = Text("ŷ      53     59     65     71     77", font=CHINESE_FONT, font_size=24, color=BLUE)
        sq = Text("平方误差  1      0      0      1      1", font=CHINESE_FONT, font_size=24, color=ORANGE)
        table = VGroup(header, pred, sq).arrange((0, -1, 0), aligned_edge=LEFT, buff=0.35)
        table.set_stroke(GRID, width=1, background=True).move_to((0, 0.4, 0))
        mse = MathTex(r"\mathrm{MSE}=\frac{1+0+0+1+1}{5}=0.6", color=INK).scale(1.05).next_to(table, (0, -1, 0), buff=0.6)
        self.play(FadeIn(title), FadeIn(table), run_time=1.3)
        self.play(Write(mse), run_time=1.4)
        self.play(FadeIn(SurroundingRectangle(mse, color=YELLOW, buff=0.22)), run_time=0.7)
        self.wait(1.0)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.7)

    def _parameter_search(self, axes, dots):
        title = Text("可见参数搜索：同步比较直线、残差与 MSE", font=CHINESE_FONT, font_size=31, color=INK).to_edge(UP, buff=0.25)
        self.add(axes, dots)
        leaderboard = VGroup(
            Text("当前候选        MSE", font=CHINESE_FONT, font_size=22, color=MUTED),
            *[
                Text(f"w={candidate['w']:g}, b={candidate['b']:g}      {candidate['mse']:.2f}", font=CHINESE_FONT, font_size=21, color=INK)
                for candidate in CANDIDATES
            ],
        ).arrange((0, -1, 0), aligned_edge=LEFT, buff=0.12).to_edge(RIGHT, buff=0.35)
        self.play(FadeIn(title), FadeIn(leaderboard[0]), run_time=0.8)
        current_line = None
        current_residuals = None
        current_mse = None
        current_best = None
        current_marker = None
        for index, candidate in enumerate(CANDIDATES):
            w, b = candidate["w"], candidate["b"]
            new_line = Line(axes.c2p(0, b), axes.c2p(5.7, 5.7 * w + b), color=BLUE, stroke_width=4)
            new_residuals = VGroup(*[
                DashedLine(axes.c2p(x, y), axes.c2p(x, y - residual), color=RED, stroke_width=3)
                for (x, y), residual in zip(SAMPLES, candidate["residuals"])
            ])
            new_mse = Text(f"当前 MSE = {candidate['mse']:.2f}", font=CHINESE_FONT, font_size=23, color=ORANGE)
            new_mse.to_corner(LEFT + DOWN, buff=0.35)
            best = candidate["currentBest"]
            new_best = Text(
                f"当前最佳：w={best['w']:g}, b={best['b']:g}, MSE={best['mse']:.2f}",
                font=CHINESE_FONT, font_size=22, color=GREEN,
            ).next_to(new_mse, UP, aligned_edge=LEFT, buff=0.16)
            best_index = next(
                candidate_index for candidate_index, row in enumerate(CANDIDATES)
                if row["w"] == best["w"] and row["b"] == best["b"]
            )
            new_marker = SurroundingRectangle(leaderboard[best_index + 1], color=GREEN, buff=0.08)
            if current_line is None:
                self.play(
                    Create(new_line), FadeIn(new_residuals), FadeIn(new_mse), FadeIn(new_best),
                    FadeIn(leaderboard[index + 1]), FadeIn(new_marker), run_time=1.8,
                )
                current_line = new_line
                current_residuals = new_residuals
                current_mse = new_mse
                current_best = new_best
                current_marker = new_marker
            else:
                self.play(
                    current_line.animate.become(new_line),
                    Transform(current_residuals, new_residuals),
                    Transform(current_mse, new_mse),
                    Transform(current_best, new_best),
                    Transform(current_marker, new_marker),
                    FadeIn(leaderboard[index + 1]),
                    run_time=2.0,
                )
        self.wait(0.7)
        self._search_group = VGroup(
            title, axes, dots, leaderboard, current_line, current_residuals, current_mse, current_best, current_marker,
        )

    def _conclusion(self, axes):
        self.play(FadeOut(self._search_group), run_time=0.7)
        title = Text("当前最优：w=6.5，b=46，MSE=0.15", font=CHINESE_FONT, font_size=40, color=INK).to_edge(UP, buff=0.55)
        best_line = Line(axes.c2p(0, 46), axes.c2p(6, 85), color=GREEN, stroke_width=7)
        dots = VGroup(*[Dot(axes.c2p(x, y), radius=0.11, color=PINK) for x, y in SAMPLES])
        note = Text("这里逐个尝试候选参数，是教学简化。", font=CHINESE_FONT, font_size=28, color=MUTED)
        handoff = Text("后续：用梯度下降更系统地寻找更小的误差。", font=CHINESE_FONT, font_size=29, color=BLUE)
        notes = VGroup(note, handoff).arrange((0, -1, 0), buff=0.3).to_edge((0, -1, 0), buff=0.45)
        self.play(FadeIn(title), Create(axes), FadeIn(dots), Create(best_line), run_time=1.8)
        self.play(FadeIn(notes), run_time=1.1)
        self.play(FadeIn(SurroundingRectangle(title, color=YELLOW, buff=0.22)), run_time=0.8)

    def _advance_to(self, timestamp):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
