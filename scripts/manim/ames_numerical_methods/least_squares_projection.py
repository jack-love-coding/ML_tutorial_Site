"""Deterministic 78-second Ames least-squares projection lesson."""

from __future__ import annotations

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Arrow,
    Create,
    DashedLine,
    Dot,
    FadeIn,
    FadeOut,
    Group,
    Line,
    Polygon,
    RightAngle,
    Scene,
    SurroundingRectangle,
    Transform,
    VGroup,
    Write,
)

from common import card, cn_text, disclaimer, equation, fit_width, reading_column, title_block, top_heading
from palette import BACKGROUND, DATA_BLUE, GRID, MUTED, NAVY, ORANGE, PALE_BLUE, PALE_ORANGE, PALE_TEAL, TEAL


class LeastSquaresProjectionScene(Scene):
    """Approved 0–78 second storyboard, using notebook output IDs verbatim."""

    def construct(self):
        self.camera.background_color = BACKGROUND
        self._opening()
        self._advance_to(7)
        self._design_contract()
        self._advance_to(18)
        self._projection()
        self._advance_to(34)
        self._orthogonality()
        self._advance_to(48)
        self._two_checks()
        self._advance_to(61)
        self._normal_equations()
        self._advance_to(70)
        self._handoff()
        self._advance_to(78)

    def _clear(self, *, run_time: float = 0.55):
        if self.mobjects:
            self.play(FadeOut(Group(*self.mobjects)), run_time=run_time)

    def _opening(self):
        table = VGroup(
            cn_text("Ames 数值快照", font_size=26, color=DATA_BLUE, weight="SEMIBOLD"),
            cn_text("质量评分   居住面积   地下室   车库   房龄", font_size=23, color=MUTED),
            cn_text("7        1,710      856      2     43", font_size=23, color=NAVY),
            cn_text("6        1,262      900      1     31", font_size=23, color=NAVY),
            cn_text("8        2,198    1,140      3     12", font_size=23, color=NAVY),
            cn_text("⋮            ⋮          ⋮        ⋮      ⋮", font_size=23, color=GRID),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        table_card = card(*table, width=6.1, height=3.1).shift(LEFT * 3.25)
        heading = title_block(
            "数值方法 · 第一章",
            "Ames 最小二乘：从数据到投影",
            "同一份本地快照 · 2,927 套房屋",
        ).shift(RIGHT * 2.05)
        fit_width(heading, 6.2)
        self.play(FadeIn(table_card), Write(heading[0]), run_time=1.2)
        self.play(Write(heading[1]), FadeIn(heading[2]), run_time=1.2)
        count = cn_text("n = 2,927", font_size=31, color=ORANGE, weight="SEMIBOLD").next_to(heading, DOWN, buff=0.48)
        self.play(FadeIn(count), run_time=0.8)

    def _design_contract(self):
        self._clear()
        title = top_heading("五个标准化特征 + 一列截距")
        feature_names = reading_column(
            cn_text("整体质量", font_size=24, color=NAVY),
            cn_text("居住面积", font_size=24, color=NAVY),
            cn_text("地下室面积", font_size=24, color=NAVY),
            cn_text("车库面积", font_size=24, color=NAVY),
            cn_text("售出时房龄", font_size=24, color=NAVY),
        )
        standardize = equation("zⱼ = (xⱼ − μⱼ) / sⱼ", font_size=27, color=TEAL)
        feature_card = card(
            cn_text("标准化的 5 个特征", font_size=26, color=DATA_BLUE, weight="SEMIBOLD"),
            feature_names,
            standardize,
            width=5.2,
            height=4.9,
        ).shift(LEFT * 3.45 + DOWN * 0.1)
        shapes = reading_column(
            equation("X ∈ R²⁹²⁷ˣ⁶", font_size=34, color=DATA_BLUE),
            equation("β ∈ R⁶", font_size=34, color=TEAL),
            equation("y, r ∈ R²⁹²⁷", font_size=34, color=ORANGE),
            cn_text("数值秩 = 6", font_size=29, color=NAVY, weight="SEMIBOLD"),
            cn_text("房价单位：kUSD", font_size=23, color=MUTED),
            cn_text("本节：无权重、无正则", font_size=22, color=MUTED),
        )
        shape_card = card(*shapes, width=5.7, height=4.9).shift(RIGHT * 3.25 + DOWN * 0.1)
        self.play(FadeIn(title), FadeIn(feature_card), run_time=1.25)
        for item in shape_card[1]:
            self.play(FadeIn(item), run_time=0.52)
        self.add(shape_card[0])
        self.bring_to_back(shape_card[0])

    def _projection_diagram(self, *, scale: float = 1.0) -> VGroup:
        plane = Polygon(
            (-3.1, -1.3, 0),
            (1.6, -1.3, 0),
            (3.0, 0.25, 0),
            (-1.7, 0.25, 0),
            stroke_color=DATA_BLUE,
            stroke_width=2.6,
            fill_color=PALE_BLUE,
            fill_opacity=0.82,
        )
        origin = Dot((-1.5, -0.75, 0), radius=0.07, color=NAVY)
        y_hat_point = (0.8, -0.18, 0)
        y_point = (1.1, 1.78, 0)
        predicted = Arrow(origin.get_center(), y_hat_point, buff=0, color=TEAL, stroke_width=6, max_tip_length_to_length_ratio=0.12)
        target = Arrow(origin.get_center(), y_point, buff=0, color=DATA_BLUE, stroke_width=5, max_tip_length_to_length_ratio=0.1)
        residual = DashedLine(y_hat_point, y_point, color=ORANGE, stroke_width=5, dash_length=0.14)
        plane_label = cn_text("Col(X)", font_size=25, color=DATA_BLUE).move_to((-1.7, -1.0, 0))
        y_hat_label = equation("ŷ = Xβ", font_size=26, color=TEAL).next_to(predicted.get_end(), RIGHT, buff=0.12)
        y_label = equation("y", font_size=28, color=DATA_BLUE).next_to(target.get_end(), UP, buff=0.1)
        r_label = equation("r", font_size=27, color=ORANGE).next_to(residual, RIGHT, buff=0.14)
        group = VGroup(plane, origin, predicted, target, residual, plane_label, y_hat_label, y_label, r_label)
        group.scale(scale)
        return group

    def _projection(self):
        self._clear()
        title = top_heading("在列空间中寻找离 y 最近的预测")
        diagram = self._projection_diagram(scale=1.15).shift(LEFT * 1.3 + DOWN * 0.25)
        formulas = card(
            equation("β̂ = argminβ ||Xβ − y||²", font_size=28, color=NAVY),
            equation("ŷ = Xβ̂ ∈ Col(X)", font_size=28, color=TEAL),
            equation("y = ŷ + r", font_size=28, color=DATA_BLUE),
            equation("r = y − ŷ", font_size=28, color=ORANGE),
            width=5.2,
            height=3.1,
        ).shift(RIGHT * 4.05 + DOWN * 0.25)
        note = disclaimer().to_edge(DOWN, buff=0.5)
        self.play(FadeIn(title), Create(diagram[0]), run_time=1.3)
        self.play(Create(diagram[2]), Create(diagram[3]), run_time=1.25)
        self.play(Create(diagram[4]), FadeIn(VGroup(*diagram[1:2], *diagram[5:])), run_time=1.05)
        self.play(FadeIn(formulas), FadeIn(note), run_time=1.15)

    def _orthogonality(self):
        self._clear()
        title = top_heading("最近点的残差与每一列正交")
        diagram = self._projection_diagram(scale=0.95).shift(LEFT * 3.25 + DOWN * 0.35)
        # A geometric right-angle marker supplements the text, so color is not
        # the only carrier of orthogonality.
        base_line = Line((0.3, -0.75, 0), (1.2, -0.5, 0), color=TEAL)
        residual_line = Line((1.2, -0.5, 0), (1.43, 0.37, 0), color=ORANGE)
        angle = RightAngle(base_line, residual_line, length=0.22, color=NAVY)
        marker = VGroup(base_line, residual_line, angle).shift(LEFT * 3.25 + DOWN * 0.35)
        derivation = card(
            equation("∇β ||Xβ − y||² = −2Xᵀr", font_size=27, color=NAVY),
            equation("Xᵀr ≈ 0", font_size=39, color=TEAL),
            cn_text("每一项 xⱼᵀr 都接近 0", font_size=25, color=MUTED),
            equation("max |Xᵀr| = 3.726 × 10⁻¹⁰", font_size=29, color=ORANGE),
            cn_text("检查：一阶最优条件", font_size=24, color=DATA_BLUE, weight="SEMIBOLD"),
            width=6.6,
            height=3.8,
        ).shift(RIGHT * 3.25 + DOWN * 0.2)
        note = disclaimer().to_edge(DOWN, buff=0.5)
        self.play(FadeIn(title), FadeIn(diagram), run_time=1.2)
        self.play(Create(marker), run_time=0.8)
        for item in derivation[1]:
            self.play(FadeIn(item), run_time=0.62)
        self.add(derivation[0])
        self.bring_to_back(derivation[0])
        self.play(FadeIn(note), run_time=0.55)

    def _two_checks(self):
        self._clear()
        title = top_heading("两个数，回答两个不同问题")
        diagram = self._projection_diagram(scale=0.65).shift(LEFT * 4.35 + UP * 0.1)
        diagram_note = disclaimer().scale(0.9).next_to(diagram, DOWN, buff=0.3)
        error_card = card(
            cn_text("预测误差", font_size=27, color=DATA_BLUE, weight="SEMIBOLD"),
            equation("RMSE = ||r||₂ / √2927", font_size=25, color=NAVY),
            equation("= 35.834182 kUSD", font_size=32, color=ORANGE),
            cn_text("预测通常相差多远？", font_size=23, color=MUTED),
            width=4.8,
            height=2.75,
        ).shift(RIGHT * 2.7 + UP * 1.25)
        optimality_card = card(
            cn_text("最优性检查", font_size=27, color=TEAL, weight="SEMIBOLD"),
            equation("max |Xᵀr|", font_size=25, color=NAVY),
            equation("= 3.726 × 10⁻¹⁰", font_size=32, color=TEAL),
            cn_text("当前系数满足一阶条件吗？", font_size=23, color=MUTED),
            width=4.8,
            height=2.75,
        ).shift(RIGHT * 2.7 + DOWN * 1.65)
        warning = cn_text("正交成立，不代表 RMSE 很小", font_size=24, color=ORANGE, weight="SEMIBOLD").to_edge(DOWN, buff=0.5)
        self.play(FadeIn(title), FadeIn(diagram), FadeIn(diagram_note), run_time=1.2)
        self.play(FadeIn(error_card), run_time=1.05)
        self.play(FadeIn(optimality_card), run_time=1.05)
        self.play(FadeIn(warning), run_time=0.75)

    def _normal_equations(self):
        self._clear()
        title = top_heading("把正交条件整理成下一章的线性系统")
        chain = VGroup(
            equation("Xᵀr = 0", font_size=34, color=TEAL),
            cn_text("⇓  代入 r = y − Xβ", font_size=23, color=MUTED),
            equation("Xᵀ(Xβ − y) = 0", font_size=34, color=NAVY),
            cn_text("⇓  整理", font_size=23, color=MUTED),
            equation("XᵀXβ = Xᵀy", font_size=38, color=DATA_BLUE),
        ).arrange(DOWN, buff=0.3).shift(LEFT * 2.9 + DOWN * 0.15)
        system = card(
            equation("G = XᵀX", font_size=31, color=DATA_BLUE),
            equation("c = Xᵀy", font_size=31, color=TEAL),
            equation("Gβ = c", font_size=42, color=NAVY),
            cn_text("G 是 6 × 6 Gram 矩阵", font_size=24, color=MUTED),
            width=5.1,
            height=3.8,
        ).shift(RIGHT * 3.7 + DOWN * 0.15)
        self.play(FadeIn(title), run_time=0.6)
        for item in chain:
            self.play(Write(item), run_time=0.58)
        self.play(FadeIn(system), run_time=1.0)

    def _handoff(self):
        self._clear()
        heading = title_block(
            "正规方程是教学连接",
            "不显式求 G⁻¹",
            "直接最小二乘在实践中通常优先 QR、SVD 或 library lstsq",
        )
        fit_width(heading, 11.7)
        question = card(
            cn_text("能否把 G 分解一次，求解多个右端项？", font_size=36, color=NAVY, weight="SEMIBOLD"),
            cn_text("下一段：LUP 分解与复用", font_size=29, color=DATA_BLUE),
            width=10.6,
            height=2.2,
        ).next_to(heading, DOWN, buff=0.65)
        self.play(FadeIn(heading[0]), Write(heading[1]), run_time=1.15)
        self.play(FadeIn(heading[2]), FadeIn(question), run_time=1.2)
        self.play(FadeIn(SurroundingRectangle(question, color=ORANGE, buff=0.12)), run_time=0.65)

    def _advance_to(self, timestamp: float):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
