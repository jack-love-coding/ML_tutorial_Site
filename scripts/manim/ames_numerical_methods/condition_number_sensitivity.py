"""Deterministic 82-second Ames conditioning and sensitivity lesson."""

from __future__ import annotations

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Arrow,
    Circle,
    Create,
    DashedLine,
    Ellipse,
    FadeIn,
    FadeOut,
    Group,
    Line,
    RoundedRectangle,
    Scene,
    SurroundingRectangle,
    VGroup,
    Write,
)

from common import card, cn_text, disclaimer, equation, fit_width, reading_column, title_block, top_heading
from palette import BACKGROUND, DATA_BLUE, GRID, MUTED, NAVY, ORANGE, PALE_BLUE, PALE_ORANGE, PALE_TEAL, RED, TEAL


class ConditionNumberSensitivityScene(Scene):
    """Approved 0–82 second storyboard with exact notebook diagnostics."""

    def construct(self):
        self.camera.background_color = BACKGROUND
        self._opening()
        self._advance_to(8)
        self._scale_comparison()
        self._advance_to(22)
        self._gram_square()
        self._advance_to(34)
        self._near_duplicate()
        self._advance_to(49)
        self._observed_amplification()
        self._advance_to(62)
        self._neighboring_systems()
        self._advance_to(76)
        self._responses()
        self._advance_to(82)

    def _clear(self, *, run_time: float = 0.55):
        if self.mobjects:
            self.play(FadeOut(Group(*self.mobjects)), run_time=run_time)

    def _opening(self):
        heading = title_block(
            "数值方法 · 第三章",
            "小残差，不等于低敏感性",
            "求解准确性与问题条件是两件事",
        )
        fit_width(heading, 11.5)
        cards = VGroup(
            card(
                cn_text("当前方程算得准吗？", font_size=28, color=DATA_BLUE, weight="SEMIBOLD"),
                equation("||Gβ − c||∞", font_size=31, color=NAVY),
                cn_text("看残差", font_size=24, color=MUTED),
                width=5.3,
                height=2.3,
            ),
            card(
                cn_text("输入稍变，解会稳吗？", font_size=28, color=TEAL, weight="SEMIBOLD"),
                equation("κ₂", font_size=40, color=NAVY),
                cn_text("看条件数", font_size=24, color=MUTED),
                width=5.3,
                height=2.3,
            ),
        ).arrange(RIGHT, buff=0.55).next_to(heading, DOWN, buff=0.6)
        self.play(FadeIn(heading[0]), Write(heading[1]), run_time=1.2)
        self.play(FadeIn(heading[2]), FadeIn(cards), run_time=1.2)

    def _ellipse_map(self, label: str, condition: str, *, color, wide: bool) -> VGroup:
        source = Circle(radius=0.62, color=GRID, fill_color=PALE_BLUE, fill_opacity=0.72)
        target = Ellipse(
            width=3.45 if wide else 2.25,
            height=0.74 if wide else 1.45,
            color=color,
            fill_color=PALE_ORANGE if wide else PALE_TEAL,
            fill_opacity=0.82,
        )
        source.shift(LEFT * 1.2)
        target.shift(RIGHT * 1.0)
        arrow = Arrow(source.get_right(), target.get_left(), color=NAVY, buff=0.12, stroke_width=4)
        heading = cn_text(label, font_size=25, color=NAVY, weight="SEMIBOLD").next_to(VGroup(source, target), UP, buff=0.25)
        value = equation(condition, font_size=27, color=color).next_to(VGroup(source, target), DOWN, buff=0.25)
        return VGroup(source, target, arrow, heading, value)

    def _scale_comparison(self):
        self._clear()
        title = top_heading("相同房屋信息，不同单位尺度")
        raw = self._ellipse_map("未缩放 X", "κ₂(X_raw) = 13044.220254", color=ORANGE, wide=True)
        raw.scale(0.92).shift(LEFT * 3.65 + DOWN * 0.15)
        scaled = self._ellipse_map("标准化 X", "κ₂(X_scaled) = 3.222571", color=TEAL, wide=False)
        scaled.scale(0.92).shift(RIGHT * 3.65 + DOWN * 0.15)
        operator = equation("zⱼ = (xⱼ − μⱼ) / sⱼ", font_size=27, color=DATA_BLUE).move_to((0, -2.25, 0))
        note = disclaimer().to_edge(DOWN, buff=0.5)
        self.play(FadeIn(title), Create(raw[0]), Create(raw[1]), Create(raw[2]), FadeIn(raw[3:]), run_time=1.5)
        self.play(Create(scaled[0]), Create(scaled[1]), Create(scaled[2]), FadeIn(scaled[3:]), run_time=1.5)
        self.play(FadeIn(operator), FadeIn(note), run_time=0.9)
        limit = cn_text("标准化改善单位尺度，但不会增加信息或消除真实共线性", font_size=23, color=MUTED)
        limit.next_to(title, DOWN, buff=0.28)
        self.play(FadeIn(limit), run_time=0.75)

    def _gram_square(self):
        self._clear()
        title = top_heading("形成 Gram 矩阵，会平方方向差异")
        svd = card(
            equation("X = UΣVᵀ", font_size=35, color=DATA_BLUE),
            equation("κ₂(X) = σmax / σmin", font_size=31, color=NAVY),
            cn_text("奇异值描述不同方向的拉伸", font_size=24, color=MUTED),
            width=5.7,
            height=3.0,
        ).shift(LEFT * 3.5 + DOWN * 0.1)
        gram = card(
            equation("XᵀX = VΣ²Vᵀ", font_size=34, color=TEAL),
            equation("κ₂(XᵀX) = κ₂(X)²", font_size=32, color=ORANGE),
            equation("3.222571² ≈ 10.384962", font_size=31, color=NAVY),
            cn_text("前提：满列秩；这里统一使用 2-范数", font_size=22, color=MUTED),
            width=6.2,
            height=3.25,
        ).shift(RIGHT * 3.45 + DOWN * 0.1)
        warning = cn_text("正规方程的条件数比原设计矩阵更不利", font_size=26, color=ORANGE, weight="SEMIBOLD").to_edge(DOWN, buff=0.55)
        self.play(FadeIn(title), FadeIn(svd), run_time=1.1)
        self.play(Create(Arrow(svd.get_right(), gram.get_left(), buff=0.22, color=GRID, stroke_width=4)), FadeIn(gram), run_time=1.2)
        self.play(FadeIn(warning), run_time=0.8)

    def _near_duplicate(self):
        self._clear()
        title = top_heading("诊断场景：构造一列几乎重复的居住面积")
        formula_card = card(
            equation("z_duplicate = z_living + 10⁻⁴ η", font_size=30, color=DATA_BLUE),
            cn_text("z_living 与 η 均已标准化；相加后不再缩放", font_size=23, color=MUTED),
            cn_text("只用于诊断，不写回下载 CSV", font_size=24, color=ORANGE, weight="SEMIBOLD"),
            equation("X_near ∈ R²⁹²⁷ˣ⁷", font_size=26, color=NAVY),
            width=6.25,
            height=3.2,
        ).shift(LEFT * 3.4 + DOWN * 0.15)
        line_a = Line((0.8, -1.7, 0), (5.35, 1.65, 0), color=DATA_BLUE, stroke_width=7)
        line_b = DashedLine((0.85, -1.58, 0), (5.4, 1.77, 0), color=TEAL, stroke_width=6, dash_length=0.18)
        labels = VGroup(
            cn_text("z_living", font_size=23, color=DATA_BLUE),
            cn_text("z_duplicate", font_size=23, color=TEAL),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.15).move_to((3.65, -2.0, 0))
        condition = card(
            cn_text("近重复设计", font_size=24, color=MUTED),
            equation("κ₂(X_near) = 26644.503135", font_size=31, color=ORANGE),
            cn_text("仍然满列秩，但已病态", font_size=23, color=NAVY),
            width=5.8,
            height=1.85,
        ).shift(RIGHT * 3.4 + UP * 1.8)
        note = disclaimer().to_edge(DOWN, buff=0.5)
        self.play(FadeIn(title), FadeIn(formula_card), run_time=1.1)
        self.play(Create(line_a), Create(line_b), FadeIn(labels), run_time=1.3)
        self.play(FadeIn(condition), FadeIn(note), run_time=1.0)

    def _observed_amplification(self):
        self._clear()
        title = top_heading("沿最敏感方向加入一次固定目标扰动")
        target = card(
            cn_text("相对目标扰动", font_size=24, color=MUTED),
            equation("||δy||₂ / ||y||₂", font_size=27, color=NAVY),
            equation("= 10⁻⁵", font_size=36, color=DATA_BLUE),
            width=3.75,
            height=2.55,
        ).shift(LEFT * 4.6 + UP * 0.15)
        coefficient = card(
            cn_text("相对系数变化", font_size=24, color=MUTED),
            equation("||δβ||₂ / ||β||₂", font_size=27, color=NAVY),
            equation("= 0.00329613", font_size=33, color=TEAL),
            width=3.9,
            height=2.55,
        ).shift(UP * 0.15)
        amplification = card(
            cn_text("本次观察放大", font_size=24, color=MUTED),
            equation("0.00329613 / 10⁻⁵", font_size=26, color=NAVY),
            equation("= 329.613418 ×", font_size=33, color=ORANGE),
            width=4.0,
            height=2.55,
        ).shift(RIGHT * 4.65 + UP * 0.15)
        arrows = VGroup(
            Arrow(target.get_right(), coefficient.get_left(), buff=0.15, color=GRID, stroke_width=4),
            Arrow(coefficient.get_right(), amplification.get_left(), buff=0.15, color=GRID, stroke_width=4),
        )
        warning = card(
            cn_text("329.613418 不是条件数", font_size=32, color=ORANGE, weight="SEMIBOLD"),
            cn_text("它只是这一次、这个方向上的观察值；κ₂(X_near)=26644.503135", font_size=22, color=NAVY),
            width=9.5,
            height=1.5,
        ).to_edge(DOWN, buff=0.53)
        self.play(FadeIn(title), FadeIn(target), run_time=0.9)
        self.play(Create(arrows[0]), FadeIn(coefficient), run_time=1.0)
        self.play(Create(arrows[1]), FadeIn(amplification), run_time=1.0)
        self.play(FadeIn(warning), run_time=0.9)
        self.play(FadeIn(SurroundingRectangle(warning, color=ORANGE, buff=0.07)), run_time=0.55)

    def _neighboring_systems(self):
        self._clear()
        title = top_heading("同一个 A、两个相邻右端项、两个各自唯一的解")
        matrix = card(
            equation("A = [[1, 1], [1, 1.0001]]", font_size=29, color=NAVY),
            equation("κ₂(A) = 40002.000075", font_size=29, color=ORANGE),
            width=6.6,
            height=1.55,
        ).next_to(title, DOWN, buff=0.32)
        base = card(
            cn_text("系统 1", font_size=25, color=DATA_BLUE, weight="SEMIBOLD"),
            equation("b = [2, 2.0001]ᵀ", font_size=28, color=NAVY),
            equation("x = [1, 1]ᵀ", font_size=32, color=DATA_BLUE),
            equation("||Ax − b|| ≈ 0", font_size=24, color=MUTED),
            width=5.2,
            height=3.1,
        ).shift(LEFT * 3.65 + DOWN * 1.2)
        perturbed = card(
            cn_text("系统 2", font_size=25, color=TEAL, weight="SEMIBOLD"),
            equation("b′ = [2, 2.0002]ᵀ", font_size=28, color=NAVY),
            equation("x′ = [0, 2]ᵀ", font_size=32, color=TEAL),
            equation("||Ax′ − b′|| ≈ 0", font_size=24, color=MUTED),
            width=5.2,
            height=3.1,
        ).shift(RIGHT * 3.65 + DOWN * 1.2)
        arrow = Arrow(base.get_right(), perturbed.get_left(), buff=0.25, color=ORANGE, stroke_width=5)
        label = cn_text("b → b′", font_size=25, color=ORANGE, weight="SEMIBOLD").next_to(arrow, UP, buff=0.12)
        note = cn_text("不是同一右端项出现两个解；这是两个相邻系统", font_size=25, color=ORANGE, weight="SEMIBOLD").to_edge(DOWN, buff=0.5)
        self.play(FadeIn(title), FadeIn(matrix), run_time=1.0)
        self.play(FadeIn(base), run_time=1.0)
        self.play(Create(arrow), FadeIn(label), FadeIn(perturbed), run_time=1.2)
        self.play(FadeIn(note), run_time=0.8)

    def _summary_card(self, heading: str, value: str, *, color, width: float = 3.6) -> VGroup:
        return card(
            cn_text(heading, font_size=22, color=MUTED),
            equation(value, font_size=26, color=color),
            width=width,
            height=1.45,
        )

    def _responses(self):
        self._clear()
        title = top_heading("诊断之后，选择与问题匹配的处理")
        conditions = VGroup(
            self._summary_card("未缩放", "κ = 13044.220254", color=ORANGE),
            self._summary_card("标准化", "κ = 3.222571", color=TEAL),
            self._summary_card("近重复", "κ = 26644.503135", color=ORANGE),
        ).arrange(RIGHT, buff=0.28).next_to(title, DOWN, buff=0.36)
        warning = card(
            cn_text("329.613418 × 是特定扰动的观察放大，不是条件数", font_size=24, color=ORANGE, weight="SEMIBOLD"),
            width=11.1,
            height=0.95,
        ).next_to(conditions, DOWN, buff=0.28)
        two_by_two = card(
            equation("A: κ₂=40002.000075", font_size=21, color=NAVY),
            equation("b→b′  |  [1,1]ᵀ→[0,2]ᵀ", font_size=21, color=DATA_BLUE),
            cn_text("两个相邻系统", font_size=18, color=MUTED),
            width=4.2,
            height=1.25,
        ).to_corner(DOWN + RIGHT, buff=0.52)
        responses = card(
            cn_text("可用处理", font_size=24, color=DATA_BLUE, weight="SEMIBOLD"),
            cn_text("缩放  ·  去重或重参数化  ·  更多有效数据  ·  正则化", font_size=24, color=NAVY),
            cn_text("更高浮点精度不能补回近重复特征缺少的可辨识信息", font_size=21, color=ORANGE),
            cn_text("下一章：稀疏矩阵", font_size=21, color=TEAL, weight="SEMIBOLD"),
            width=8.1,
            height=2.0,
        ).to_corner(DOWN + LEFT, buff=0.52)
        self.play(FadeIn(title), FadeIn(conditions), run_time=1.0)
        self.play(FadeIn(warning), run_time=0.65)
        self.play(FadeIn(responses), FadeIn(two_by_two), run_time=0.85)

    def _advance_to(self, timestamp: float):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
