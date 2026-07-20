"""Deterministic 80-second Ames LUP factor-and-reuse lesson."""

from __future__ import annotations

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Arrow,
    Create,
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

from common import card, cn_text, equation, fit_width, reading_column, title_block, top_heading
from palette import BACKGROUND, DATA_BLUE, GRID, MUTED, NAVY, ORANGE, PALE_BLUE, PALE_ORANGE, PALE_TEAL, TEAL


class LupFactorReuseScene(Scene):
    """Approved 0–80 second storyboard with truthful Ames pivot behavior."""

    def construct(self):
        self.camera.background_color = BACKGROUND
        self._opening()
        self._advance_to(8)
        self._pivot_checks()
        self._advance_to(21)
        self._factorization_roles()
        self._advance_to(36)
        self._triangular_solves()
        self._advance_to(50)
        self._residual_checks()
        self._advance_to(62)
        self._reuse_rhs()
        self._advance_to(74)
        self._handoff()
        self._advance_to(80)

    def _clear(self, *, run_time: float = 0.55):
        if self.mobjects:
            self.play(FadeOut(Group(*self.mobjects)), run_time=run_time)

    def _opening(self):
        heading = title_block(
            "数值方法 · 第二章",
            "把 6 × 6 系统变成可复用求解器",
            "来自上一章：G = XᵀX，c = Xᵀy",
        )
        fit_width(heading, 11.8)
        system = card(
            equation("Gβ = c", font_size=52, color=DATA_BLUE),
            cn_text("G ∈ R⁶ˣ⁶", font_size=27, color=MUTED),
            cn_text("目标：不显式计算 G⁻¹", font_size=28, color=ORANGE, weight="SEMIBOLD"),
            width=6.2,
            height=2.65,
        ).next_to(heading, DOWN, buff=0.52)
        self.play(FadeIn(heading[0]), Write(heading[1]), run_time=1.2)
        self.play(FadeIn(heading[2]), FadeIn(system), run_time=1.2)

    def _pivot_checks(self):
        self._clear()
        title = top_heading("部分主元：每一步都先检查候选行")
        rule = card(
            equation("pₖ = argmaxᵢ≥ₖ |Uᵢₖ|", font_size=31, color=DATA_BLUE),
            cn_text("选择当前列中绝对值最大的候选主元", font_size=23, color=MUTED),
            cn_text("P 只置换方程行，不置换特征列", font_size=23, color=NAVY),
            width=5.65,
            height=2.5,
        ).shift(LEFT * 3.55 + UP * 0.65)
        rows_title = cn_text("Notebook 记录的 pivot rows", font_size=25, color=TEAL, weight="SEMIBOLD")
        rows_title.move_to(RIGHT * 3.25 + UP * 1.85)
        row_items = VGroup(*[
            cn_text(f"第 {index + 1} 次：k={index}  →  pₖ={index}   保留当前行 ✓", font_size=24, color=NAVY)
            for index in range(5)
        ]).arrange(DOWN, aligned_edge=LEFT, buff=0.27).next_to(rows_title, DOWN, buff=0.35)
        literal = equation("[0, 1, 2, 3, 4]", font_size=32, color=TEAL).next_to(row_items, DOWN, buff=0.4)
        matrix_icon = self._matrix_icon("U", 6, 6).shift(LEFT * 3.6 + DOWN * 1.55)
        self.play(FadeIn(title), FadeIn(rule), FadeIn(rows_title), FadeIn(matrix_icon), run_time=1.2)
        for item in row_items:
            marker = SurroundingRectangle(item, color=ORANGE, buff=0.07)
            self.play(FadeIn(item), FadeIn(marker), run_time=0.75)
            self.play(FadeOut(marker), run_time=0.25)
        self.play(FadeIn(literal), run_time=0.65)
        notice = card(
            cn_text("本例 5 次均保留当前行", font_size=26, color=TEAL, weight="SEMIBOLD"),
            cn_text("本例未换行 ≠ 算法不检查主元", font_size=25, color=ORANGE, weight="SEMIBOLD"),
            width=6.4,
            height=1.35,
        ).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(notice), run_time=0.8)

    def _matrix_icon(self, label: str, rows: int, columns: int) -> VGroup:
        cells = VGroup()
        for i in range(rows):
            for j in range(columns):
                opacity = 0.75 if (label != "L" or j <= i) and (label != "U" or j >= i) else 0.12
                cell = RoundedRectangle(
                    width=0.34,
                    height=0.28,
                    corner_radius=0.03,
                    stroke_color=GRID,
                    stroke_width=0.6,
                    fill_color=DATA_BLUE if label in {"G", "U"} else TEAL,
                    fill_opacity=opacity,
                )
                cell.move_to(((j - (columns - 1) / 2) * 0.38, ((rows - 1) / 2 - i) * 0.32, 0))
                cells.add(cell)
        caption = cn_text(f"{label}  ·  {rows}×{columns}", font_size=22, color=NAVY).next_to(cells, DOWN, buff=0.18)
        return VGroup(cells, caption)

    def _factorization_roles(self):
        self._clear()
        title = top_heading("一般不变量：PG = LU")
        p_card = card(
            equation("P", font_size=45, color=ORANGE),
            cn_text("记录行置换", font_size=24, color=NAVY),
            cn_text("本例 P = I₆", font_size=23, color=MUTED),
            width=3.45,
            height=2.45,
        ).shift(LEFT * 4.55 + DOWN * 0.1)
        l_card = card(
            equation("L", font_size=45, color=TEAL),
            cn_text("保存消元倍数", font_size=24, color=NAVY),
            cn_text("单位下三角", font_size=23, color=MUTED),
            width=3.45,
            height=2.45,
        ).shift(DOWN * 0.1)
        u_card = card(
            equation("U", font_size=45, color=DATA_BLUE),
            cn_text("保留消元结果", font_size=24, color=NAVY),
            cn_text("上三角", font_size=23, color=MUTED),
            width=3.45,
            height=2.45,
        ).shift(RIGHT * 4.55 + DOWN * 0.1)
        invariant = card(
            equation("P · G = L · U", font_size=43, color=NAVY),
            cn_text("一般算法保留 P；Ames 这一例恰好无需换行", font_size=24, color=MUTED),
            width=9.8,
            height=1.55,
        ).to_edge(DOWN, buff=0.52)
        self.play(FadeIn(title), run_time=0.6)
        self.play(FadeIn(p_card), FadeIn(l_card), FadeIn(u_card), run_time=1.35)
        self.play(FadeIn(invariant), run_time=1.0)
        for object_ in (p_card, l_card, u_card):
            self.play(FadeIn(SurroundingRectangle(object_, color=GRID, buff=0.05)), run_time=0.36)

    def _triangular_solves(self):
        self._clear()
        title = top_heading("分解完成后：两次三角求解，不计算逆")
        lhs = card(
            cn_text("步骤 1 · 前代", font_size=27, color=TEAL, weight="SEMIBOLD"),
            equation("Lz = Pc", font_size=43, color=TEAL),
            cn_text("从上到下求 z", font_size=24, color=MUTED),
            width=4.6,
            height=2.6,
        ).shift(LEFT * 3.6)
        rhs = card(
            cn_text("步骤 2 · 回代", font_size=27, color=DATA_BLUE, weight="SEMIBOLD"),
            equation("Uβ = z", font_size=43, color=DATA_BLUE),
            cn_text("从下到上求 β", font_size=24, color=MUTED),
            width=4.6,
            height=2.6,
        ).shift(RIGHT * 3.6)
        arrow = Arrow(lhs.get_right(), rhs.get_left(), color=ORANGE, buff=0.25, stroke_width=6)
        no_inverse = card(
            cn_text("G⁻¹ 不进入计算流程", font_size=29, color=ORANGE, weight="SEMIBOLD"),
            equation("PG = LU  →  Lz = Pc  →  Uβ = z", font_size=29, color=NAVY),
            width=9.3,
            height=1.5,
        ).to_edge(DOWN, buff=0.52)
        self.play(FadeIn(title), FadeIn(lhs), run_time=1.0)
        self.play(Create(arrow), FadeIn(rhs), run_time=1.1)
        self.play(FadeIn(no_inverse), run_time=0.9)

    def _residual_checks(self):
        self._clear()
        title = top_heading("四个数分别检查不同环节")
        rows = [
            ("分解残差  ||PG − LU||∞", "4.547 × 10⁻¹³", TEAL),
            ("求解残差  ||Gβ − c||∞", "1.455 × 10⁻¹¹", DATA_BLUE),
            ("手写 LUP vs SciPy  最大差", "7.105 × 10⁻¹⁵", ORANGE),
            ("LU vs 上一章 lstsq  最大差", "1.918 × 10⁻¹³", NAVY),
        ]
        cards = VGroup(*[
            card(
                cn_text(label, font_size=23, color=NAVY),
                equation(value, font_size=31, color=color),
                width=5.7,
                height=1.42,
            )
            for label, value, color in rows
        ]).arrange_in_grid(rows=2, cols=2, buff=(0.45, 0.5)).shift(DOWN * 0.2)
        note = cn_text("绝对残差受当前量纲影响；实现一致也不等于问题不敏感", font_size=23, color=MUTED).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(title), run_time=0.55)
        for item in cards:
            self.play(FadeIn(item), run_time=0.75)
        self.play(FadeIn(note), run_time=0.6)

    def _reuse_rhs(self):
        self._clear()
        title = top_heading("X 不变 → G 不变 → 同一组 P、L、U 可以复用")
        pivot_badge = card(
            cn_text("pivot rows", font_size=19, color=MUTED),
            equation("[0,1,2,3,4]", font_size=22, color=TEAL),
            width=2.75,
            height=1.05,
        ).move_to(LEFT * 5.35 + UP * 2.45)
        invariant_badge = card(
            equation("PG = LU", font_size=25, color=NAVY),
            cn_text("本例 P=I₆", font_size=18, color=MUTED),
            width=2.6,
            height=1.05,
        ).move_to(RIGHT * 5.35 + UP * 2.45)
        left = card(
            cn_text("右端 1", font_size=23, color=MUTED),
            equation("c_price = Xᵀy_price", font_size=25, color=DATA_BLUE),
            cn_text("输出：房价系数 β", font_size=23, color=NAVY),
            width=4.35,
            height=2.35,
        ).shift(LEFT * 4.65 + DOWN * 0.45)
        solver = card(
            cn_text("共享求解器", font_size=25, color=NAVY, weight="SEMIBOLD"),
            equation("P · L · U", font_size=39, color=TEAL),
            cn_text("1 次分解", font_size=24, color=ORANGE),
            width=3.2,
            height=2.35,
        ).shift(DOWN * 0.45)
        right = card(
            cn_text("右端 2", font_size=23, color=MUTED),
            equation("c_log = Xᵀlog(y_USD)", font_size=23, color=DATA_BLUE),
            equation("截距 = 12.02122130", font_size=26, color=ORANGE),
            width=4.35,
            height=2.35,
        ).shift(RIGHT * 4.65 + DOWN * 0.45)
        arrow_left = Arrow(left.get_right(), solver.get_left(), buff=0.2, color=DATA_BLUE, stroke_width=5)
        arrow_right = Arrow(solver.get_right(), right.get_left(), buff=0.2, color=TEAL, stroke_width=5)
        summary = card(
            cn_text("1 次分解  |  2 次三角解", font_size=31, color=NAVY, weight="SEMIBOLD"),
            cn_text("只替换右端项；自然对数目标不改变左侧矩阵", font_size=22, color=MUTED),
            width=8.7,
            height=1.4,
        ).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(title), FadeIn(pivot_badge), FadeIn(invariant_badge), run_time=0.8)
        self.play(FadeIn(left), Create(arrow_left), FadeIn(solver), run_time=1.2)
        self.play(Create(arrow_right), FadeIn(right), run_time=1.2)
        self.play(FadeIn(summary), run_time=0.8)

    def _handoff(self):
        # Keep the poster composition from the previous segment on screen and
        # add the conceptual limit rather than replacing it.
        shade = RoundedRectangle(
            width=12.5,
            height=1.15,
            corner_radius=0.16,
            stroke_color=ORANGE,
            stroke_width=2,
            fill_color=PALE_ORANGE,
            fill_opacity=0.97,
        ).to_edge(DOWN, buff=0.46)
        text = VGroup(
            cn_text("小残差 ≠ 对输入不敏感", font_size=27, color=ORANGE, weight="SEMIBOLD"),
            cn_text("下一段：用条件数检查问题本身的敏感性", font_size=23, color=NAVY),
        ).arrange(RIGHT, buff=0.65).move_to(shade)
        self.play(FadeIn(shade), FadeIn(text), run_time=0.9)

    def _advance_to(self, timestamp: float):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
