"""Deterministic 80-second lesson: Ames standardization, PCA, and reconstruction."""

from __future__ import annotations

import math

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Arrow,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    Group,
    Line,
    Rectangle,
    Scene,
    SurroundingRectangle,
    VGroup,
    Write,
)

from common import card, cn_text, disclaimer, equation, fit_width, title_block, top_heading
from palette import BACKGROUND, DATA_BLUE, GRID, MUTED, NAVY, ORANGE, PALE_BLUE, PALE_ORANGE, PALE_TEAL, PAPER, TEAL


class AmesPcaProjectionScene(Scene):
    """Approved 0–80 second storyboard anchored to the executed Ames PCA Notebook."""

    def construct(self):
        self.camera.background_color = BACKGROUND
        self._opening()
        self._advance_to(8)
        self._standardize()
        self._advance_to(20)
        self._rotate_axes()
        self._advance_to(34)
        self._eigen_connection()
        self._advance_to(47)
        self._choose_k()
        self._advance_to(62)
        self._reconstruction()
        self._advance_to(72)
        self._handoff()
        self._advance_to(80)

    def _clear(self, *, run_time: float = 0.5):
        if self.mobjects:
            self.play(FadeOut(Group(*self.mobjects)), run_time=run_time)

    def _feature_table(self) -> VGroup:
        headers = ["质量", "一层", "二层", "居住", "地下室", "车数", "车库", "房龄"]
        values = ["7", "1656", "0", "1656", "1080", "2", "528", "49"]
        rows = VGroup()
        for row_values, fill in ((headers, PALE_BLUE), (values, PAPER)):
            row = VGroup()
            for value in row_values:
                cell = Rectangle(width=0.82, height=0.62, stroke_color=GRID, stroke_width=1.1, fill_color=fill, fill_opacity=1)
                label = cn_text(value, font_size=17, color=NAVY).move_to(cell)
                row.add(VGroup(cell, label))
            row.arrange(RIGHT, buff=0)
            rows.add(row)
        rows.arrange(DOWN, buff=0)
        return rows

    def _scatter(self, *, rotated: bool) -> VGroup:
        points = VGroup()
        for index in range(37):
            x = -2.35 + index * 0.13
            y = 0.48 * x + 0.32 * math.sin(index * 1.7)
            if rotated:
                angle = -0.45
                px = x * math.cos(angle) - y * math.sin(angle)
                py = x * math.sin(angle) + y * math.cos(angle)
            else:
                px, py = x, y
            points.add(Dot((px, py, 0), radius=0.055, color=TEAL if index % 4 else DATA_BLUE))
        return points

    def _opening(self):
        table = self._feature_table().scale(0.95).shift(LEFT * 3.25 + DOWN * 0.35)
        heading = title_block(
            "数值方法 · 主成分分析",
            "8 个房屋特征，可以压缩成几个方向？",
            "Ames 本地数值快照 · 2,927 行",
        ).shift(RIGHT * 2.6 + UP * 0.5)
        fit_width(heading, 7.0)
        shape = card(
            equation("Z ∈ R²⁹²⁷ˣ⁸", font_size=38, color=DATA_BLUE),
            cn_text("8 个连续或有序数值特征", font_size=24, color=MUTED),
            cn_text("不使用房价标签", font_size=25, color=ORANGE, weight="SEMIBOLD"),
            width=5.8,
            height=2.35,
        ).shift(RIGHT * 3.2 + DOWN * 1.95)
        self.play(FadeIn(table), Write(heading[0]), run_time=1.0)
        self.play(Write(heading[1]), FadeIn(heading[2]), run_time=1.05)
        self.play(FadeIn(shape), run_time=0.85)

    def _standardize(self):
        self._clear()
        title = top_heading("先让不同单位的特征站在同一尺度上")
        raw = card(
            cn_text("原始列", font_size=28, color=DATA_BLUE, weight="SEMIBOLD"),
            cn_text("面积：平方英尺", font_size=24, color=NAVY),
            cn_text("质量：1–10 分", font_size=24, color=NAVY),
            cn_text("房龄：年", font_size=24, color=NAVY),
            cn_text("量纲不同，方差不能直接比较", font_size=23, color=ORANGE),
            width=5.4,
            height=3.7,
        ).shift(LEFT * 3.55 + DOWN * 0.1)
        standardized = card(
            cn_text("标准化矩阵 Z", font_size=28, color=TEAL, weight="SEMIBOLD"),
            equation("zᵢⱼ = (xᵢⱼ − μⱼ) / σⱼ", font_size=29, color=NAVY),
            equation("mean(Z[:, j]) ≈ 0", font_size=26, color=DATA_BLUE),
            equation("std(Z[:, j]) = 1", font_size=26, color=TEAL),
            cn_text("使用总体标准差 ddof = 0", font_size=22, color=MUTED),
            width=5.7,
            height=3.7,
        ).shift(RIGHT * 3.45 + DOWN * 0.1)
        arrow = Arrow(raw.get_right(), standardized.get_left(), buff=0.25, color=DATA_BLUE)
        self.play(FadeIn(title), FadeIn(raw), run_time=1.05)
        self.play(Create(arrow), FadeIn(standardized), run_time=1.1)

    def _rotate_axes(self):
        self._clear()
        title = top_heading("PCA 旋转坐标轴，让第一轴捕捉最大方差")
        origin = LEFT * 3.6 + DOWN * 0.45
        horizontal = Line(origin + LEFT * 2.5, origin + RIGHT * 2.5, color=GRID, stroke_width=2)
        vertical = Line(origin + DOWN * 1.8, origin + UP * 1.8, color=GRID, stroke_width=2)
        points = self._scatter(rotated=False).shift(origin)
        pc1 = Arrow(origin + LEFT * 2.55 + DOWN * 1.18, origin + RIGHT * 2.55 + UP * 1.18, buff=0, color=TEAL, stroke_width=6)
        pc2 = Arrow(origin + RIGHT * 0.75 + DOWN * 1.55, origin + LEFT * 0.75 + UP * 1.55, buff=0, color=ORANGE, stroke_width=5)
        labels = VGroup(
            cn_text("PC1：最大方差方向", font_size=24, color=TEAL, weight="SEMIBOLD").next_to(pc1.get_end(), UP, buff=0.1),
            cn_text("PC2：与 PC1 正交", font_size=23, color=ORANGE).next_to(pc2.get_end(), LEFT, buff=0.12),
        )
        formulas = card(
            equation("C = ZᵀZ / n", font_size=33, color=DATA_BLUE),
            equation("Cvⱼ = λⱼvⱼ", font_size=33, color=NAVY),
            equation("λ₁ ≥ λ₂ ≥ … ≥ λ₈", font_size=30, color=TEAL),
            cn_text("vⱼ 互相正交，长度为 1", font_size=24, color=MUTED),
            width=5.3,
            height=3.5,
        ).shift(RIGHT * 3.75 + DOWN * 0.1)
        note = disclaimer("二维点云仅解释方向；真实计算使用 8 维数据").to_edge(DOWN, buff=0.42)
        self.play(FadeIn(title), Create(horizontal), Create(vertical), FadeIn(points), run_time=1.15)
        self.play(Create(pc1), Create(pc2), FadeIn(labels), run_time=1.15)
        self.play(FadeIn(formulas), FadeIn(note), run_time=1.1)

    def _eigen_connection(self):
        self._clear()
        title = top_heading("协方差特征分解与 SVD 给出同一组主方向")
        left = card(
            cn_text("协方差路线", font_size=27, color=DATA_BLUE, weight="SEMIBOLD"),
            equation("C = ZᵀZ / n", font_size=29, color=NAVY),
            equation("C = VΛVᵀ", font_size=35, color=DATA_BLUE),
            cn_text("列 vⱼ 是主方向", font_size=24, color=MUTED),
            width=5.4,
            height=3.5,
        ).shift(LEFT * 3.55 + DOWN * 0.1)
        right = card(
            cn_text("SVD 路线", font_size=27, color=TEAL, weight="SEMIBOLD"),
            equation("Z = UΣVᵀ", font_size=35, color=TEAL),
            equation("λⱼ = σⱼ² / n", font_size=30, color=NAVY),
            cn_text("右奇异向量仍是 vⱼ", font_size=24, color=MUTED),
            width=5.4,
            height=3.5,
        ).shift(RIGHT * 3.55 + DOWN * 0.1)
        equal = equation("同一谱", font_size=29, color=ORANGE).move_to(DOWN * 0.1)
        check = cn_text("本例两种路线的解释方差比最大差 1.332 × 10⁻¹⁵", font_size=25, color=NAVY).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(title), FadeIn(left), run_time=1.0)
        self.play(FadeIn(right), FadeIn(equal), run_time=1.0)
        self.play(FadeIn(check), run_time=0.75)

    def _choose_k(self):
        self._clear()
        title = top_heading("累计解释方差决定保留多少维")
        bars = VGroup()
        ratios = [0.5181, 0.1992, 0.1214, 0.0828]
        colors = [DATA_BLUE, TEAL, ORANGE, GRID]
        for index, (ratio, color) in enumerate(zip(ratios, colors, strict=True)):
            bar = Rectangle(width=ratio * 7.2, height=0.52, stroke_width=0, fill_color=color, fill_opacity=1)
            label = cn_text(f"PC{index + 1}   {ratio * 100:.2f}%", font_size=22, color=NAVY).next_to(bar, LEFT, buff=0.18)
            bars.add(VGroup(bar, label))
        bars.arrange(DOWN, aligned_edge=RIGHT, buff=0.34).shift(LEFT * 1.7 + DOWN * 0.15)
        summary = card(
            equation("前 2 维：71.73%", font_size=30, color=DATA_BLUE),
            equation("前 4 维：92.15%", font_size=36, color=TEAL),
            equation("k₉₀ = 4", font_size=42, color=ORANGE),
            cn_text("阈值规则：累计比例 ≥ 90%", font_size=23, color=MUTED),
            width=5.1,
            height=3.4,
        ).shift(RIGHT * 4.0 + DOWN * 0.15)
        self.play(FadeIn(title), run_time=0.6)
        for bar in bars:
            self.play(FadeIn(bar), run_time=0.52)
        self.play(FadeIn(summary), run_time=1.05)
        self.play(Create(SurroundingRectangle(summary, color=TEAL, buff=0.1)), run_time=0.7)

    def _reconstruction(self):
        self._clear()
        title = top_heading("压缩后再还原：用重构误差衡量丢失的信息")
        chain = VGroup(
            equation("Tₖ = ZVₖ", font_size=35, color=DATA_BLUE),
            cn_text("投影到 k 个主成分", font_size=23, color=MUTED),
            equation("Ẑₖ = TₖVₖᵀ", font_size=35, color=TEAL),
            cn_text("回到 8 维标准化特征空间", font_size=23, color=MUTED),
        ).arrange(DOWN, buff=0.28).shift(LEFT * 3.45 + DOWN * 0.1)
        scores = card(
            cn_text("标准化单位下的 RMSE", font_size=26, color=NAVY, weight="SEMIBOLD"),
            equation("k = 2  →  0.531684", font_size=31, color=DATA_BLUE),
            equation("k = 4  →  0.280168", font_size=35, color=TEAL),
            cn_text("保留更多方向，重构误差下降", font_size=23, color=MUTED),
            width=5.5,
            height=3.5,
        ).shift(RIGHT * 3.65 + DOWN * 0.1)
        self.play(FadeIn(title), run_time=0.6)
        for item in chain:
            self.play(FadeIn(item), run_time=0.55)
        self.play(FadeIn(scores), run_time=1.0)

    def _handoff(self):
        self._clear()
        heading = title_block(
            "结论",
            "PCA 保留输入特征的主要变化方向",
            "它不看房价标签，也不自动保证预测更好",
        )
        fit_width(heading, 11.6)
        boundary = card(
            cn_text("标准化规则、阈值和业务解释必须写清楚", font_size=29, color=NAVY, weight="SEMIBOLD"),
            cn_text("本例选择 k = 4，因为累计解释方差首次达到 90%", font_size=25, color=TEAL),
            width=10.8,
            height=1.9,
        ).next_to(heading, DOWN, buff=0.65)
        self.play(FadeIn(heading[0]), Write(heading[1]), run_time=1.05)
        self.play(FadeIn(heading[2]), FadeIn(boundary), run_time=1.05)

    def _advance_to(self, timestamp: float):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
