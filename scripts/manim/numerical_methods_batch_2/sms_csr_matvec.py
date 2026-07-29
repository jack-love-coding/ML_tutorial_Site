"""Deterministic 75-second lesson: UCI SMS text matrix, CSR, and matvec."""

from __future__ import annotations

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
    RoundedRectangle,
    Scene,
    SurroundingRectangle,
    VGroup,
    Write,
)

from common import card, cn_text, equation, fit_width, title_block, top_heading
from palette import BACKGROUND, DATA_BLUE, GRID, MUTED, NAVY, ORANGE, PALE_BLUE, PALE_ORANGE, PALE_TEAL, PAPER, TEAL


class SmsCsrMatvecScene(Scene):
    """Approved 0–75 second storyboard anchored to the executed Notebook."""

    def construct(self):
        self.camera.background_color = BACKGROUND
        self._opening()
        self._advance_to(7)
        self._why_sparse()
        self._advance_to(18)
        self._row_contract()
        self._advance_to(31)
        self._csr_contract()
        self._advance_to(46)
        self._matvec()
        self._advance_to(59)
        self._memory()
        self._advance_to(69)
        self._handoff()
        self._advance_to(75)

    def _clear(self, *, run_time: float = 0.5):
        if self.mobjects:
            self.play(FadeOut(Group(*self.mobjects)), run_time=run_time)

    def _matrix(self, rows: int, cols: int, occupied: set[tuple[int, int]], *, cell: float = 0.34) -> VGroup:
        cells = VGroup()
        for row in range(rows):
            for col in range(cols):
                active = (row, col) in occupied
                square = Rectangle(
                    width=cell,
                    height=cell,
                    stroke_color=GRID,
                    stroke_width=0.8,
                    fill_color=TEAL if active else PAPER,
                    fill_opacity=1 if active else 0.45,
                )
                square.move_to((col * cell, -row * cell, 0))
                cells.add(square)
        cells.center()
        return cells

    def _strip(self, label: str, values: list[str], color=TEAL) -> VGroup:
        label_box = RoundedRectangle(width=1.35, height=0.58, corner_radius=0.1, stroke_color=color, fill_color=PAPER, fill_opacity=1)
        label_text = cn_text(label, font_size=20, color=color, weight="SEMIBOLD").move_to(label_box)
        boxes = VGroup()
        for value in values:
            box = RoundedRectangle(width=0.7 if len(value) < 4 else 1.0, height=0.58, corner_radius=0.08, stroke_color=GRID, fill_color=PAPER, fill_opacity=1)
            text = cn_text(value, font_size=18, color=NAVY).move_to(box)
            boxes.add(VGroup(box, text))
        boxes.arrange(RIGHT, buff=0.08)
        return VGroup(VGroup(label_box, label_text), boxes).arrange(RIGHT, buff=0.18)

    def _opening(self):
        matrix = self._matrix(7, 13, {(0, 2), (0, 10), (1, 6), (2, 1), (2, 11), (3, 8), (4, 4), (5, 0), (5, 9), (6, 5)})
        matrix.scale(1.2).shift(LEFT * 3.5 + DOWN * 0.2)
        heading = title_block(
            "数值方法 · 稀疏矩阵",
            "短信如何变成可计算的矩阵？",
            "UCI SMS Spam Collection · 完整 5,574 行快照",
        ).shift(RIGHT * 2.5 + UP * 0.35)
        fit_width(heading, 7.0)
        shape = card(
            equation("X ∈ R⁵⁵⁷⁴ˣ¹⁸⁸¹", font_size=36, color=DATA_BLUE),
            equation("nnz = 69,798", font_size=34, color=ORANGE),
            cn_text("没有训练分类器", font_size=23, color=MUTED),
            width=5.5,
            height=2.35,
        ).shift(RIGHT * 3.2 + DOWN * 2.0)
        self.play(FadeIn(matrix), Write(heading[0]), run_time=1.0)
        self.play(Write(heading[1]), FadeIn(heading[2]), run_time=1.05)
        self.play(FadeIn(shape), run_time=0.85)

    def _why_sparse(self):
        self._clear()
        title = top_heading("词表很宽，但一条短信只用到很少的词")
        dense = self._matrix(8, 14, {(0, 1), (0, 9), (1, 5), (2, 12), (3, 2), (4, 7), (5, 0), (5, 11), (6, 4), (7, 8)})
        dense.scale(1.25)
        left_card = card(
            cn_text("如果逐格存储", font_size=27, color=DATA_BLUE, weight="SEMIBOLD"),
            dense,
            cn_text("大部分位置都是 0", font_size=24, color=MUTED),
            width=6.0,
            height=4.6,
        ).shift(LEFT * 3.35 + DOWN * 0.2)
        right_card = card(
            cn_text("只记录非零项", font_size=27, color=TEAL, weight="SEMIBOLD"),
            equation("密度 = nnz / (n × d)", font_size=28),
            equation("= 0.66571%", font_size=39, color=ORANGE),
            cn_text("平均每行 12.522 个非零项", font_size=25, color=NAVY),
            cn_text("稀疏是数据结构属性", font_size=23, color=MUTED),
            width=5.5,
            height=4.6,
        ).shift(RIGHT * 3.6 + DOWN * 0.2)
        self.play(FadeIn(title), FadeIn(left_card), run_time=1.15)
        self.play(FadeIn(right_card), run_time=1.15)
        self.play(Create(SurroundingRectangle(right_card, color=TEAL, buff=0.1)), run_time=0.7)

    def _row_contract(self):
        self._clear()
        title = top_heading("固定词表后，每条短信成为一行")
        message = card(
            cn_text("一条短信", font_size=25, color=DATA_BLUE, weight="SEMIBOLD"),
            cn_text("WINNER! claim your prize now", font_size=26, color=NAVY),
            width=5.6,
            height=1.7,
        ).shift(LEFT * 3.4 + UP * 1.25)
        tokens = VGroup(*[
            RoundedRectangle(width=1.15, height=0.58, corner_radius=0.12, stroke_color=TEAL, fill_color=PALE_TEAL, fill_opacity=1)
            for _ in range(5)
        ]).arrange(RIGHT, buff=0.14)
        token_texts = ["winner", "claim", "your", "prize", "now"]
        for box, value in zip(tokens, token_texts, strict=True):
            box.add(cn_text(value, font_size=18, color=TEAL).move_to(box))
        tokens.shift(LEFT * 3.4 + DOWN * 0.45)
        row = self._strip("第 i 行", ["0", "…", "1", "0", "2", "…", "1"], DATA_BLUE).shift(RIGHT * 3.4 + DOWN * 0.1)
        arrow_one = Arrow(message.get_bottom(), tokens.get_top(), buff=0.15, color=DATA_BLUE)
        arrow_two = Arrow(tokens.get_right(), row.get_left(), buff=0.2, color=TEAL)
        note = card(
            cn_text("本例词项权重：TF–IDF", font_size=25, color=NAVY),
            equation("每一行再做 L2 归一化", font_size=24, color=MUTED),
            cn_text("词表只保留 df ≥ 5 的词", font_size=24, color=MUTED),
            width=6.4,
            height=1.8,
        ).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(title), FadeIn(message), run_time=0.9)
        self.play(Create(arrow_one), FadeIn(tokens), run_time=1.0)
        self.play(Create(arrow_two), FadeIn(row), run_time=1.0)
        self.play(FadeIn(note), run_time=0.85)

    def _csr_contract(self):
        self._clear()
        title = top_heading("CSR 用三条数组定位每一行的非零项")
        strips = VGroup(
            self._strip("data", ["0.19", "0.31", "…", "0.42"], TEAL),
            self._strip("indices", ["12", "87", "…", "1830"], DATA_BLUE),
            self._strip("indptr", ["0", "…", "283", "299", "…", "69798"], ORANGE),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.5).shift(LEFT * 2.45 + DOWN * 0.1)
        brace = Line((2.7, -0.7, 0), (2.7, 0.4, 0), color=ORANGE, stroke_width=6)
        row_card = card(
            cn_text("第 17 行（从 1 开始）", font_size=27, color=ORANGE, weight="SEMIBOLD"),
            equation("indptr[16:18] = [283, 299]", font_size=27, color=NAVY),
            equation("非零切片 [283, 299)", font_size=31, color=TEAL),
            cn_text("共有 16 个非零项", font_size=25, color=MUTED),
            width=5.0,
            height=3.3,
        ).shift(RIGHT * 4.0 + DOWN * 0.1)
        self.play(FadeIn(title), run_time=0.6)
        for strip in strips:
            self.play(FadeIn(strip), run_time=0.78)
        self.play(Create(brace), FadeIn(row_card), run_time=1.1)

    def _matvec(self):
        self._clear()
        title = top_heading("矩阵向量乘法只访问这一行的 16 个非零项")
        formula = card(
            equation("(Xw)₁₇ = Σⱼ X₁₇,ⱼ wⱼ", font_size=36, color=NAVY),
            equation("= Σₖ data[k] · w[indices[k]]", font_size=31, color=TEAL),
            equation("k ∈ [283, 299)", font_size=28, color=ORANGE),
            width=7.0,
            height=3.0,
        ).shift(LEFT * 3.0 + DOWN * 0.1)
        result = card(
            cn_text("同一个固定权重向量", font_size=24, color=MUTED),
            equation("手算 CSR = −0.497805956", font_size=28, color=TEAL),
            equation("library CSR = −0.497805956", font_size=28, color=DATA_BLUE),
            equation("差 = 0", font_size=38, color=ORANGE),
            width=5.6,
            height=3.4,
        ).shift(RIGHT * 3.85 + DOWN * 0.1)
        connector = Arrow(formula.get_right(), result.get_left(), buff=0.25, color=DATA_BLUE)
        note = cn_text("跳过所有隐含的 0，结果不变", font_size=25, color=NAVY, weight="SEMIBOLD").to_edge(DOWN, buff=0.55)
        self.play(FadeIn(title), FadeIn(formula), run_time=1.1)
        self.play(Create(connector), FadeIn(result), run_time=1.15)
        self.play(FadeIn(note), run_time=0.7)

    def _memory(self):
        self._clear()
        title = top_heading("同一矩阵，不同存储方式")
        dense = card(
            cn_text("稠密 float64", font_size=28, color=DATA_BLUE, weight="SEMIBOLD"),
            equation("5,574 × 1,881 × 8 bytes", font_size=25, color=NAVY),
            equation("79.992 MiB", font_size=42, color=ORANGE),
            cn_text("每个 0 也占空间", font_size=23, color=MUTED),
            width=5.5,
            height=3.4,
        ).shift(LEFT * 3.5 + DOWN * 0.1)
        csr = card(
            cn_text("CSR 三数组", font_size=28, color=TEAL, weight="SEMIBOLD"),
            cn_text("data + indices + indptr", font_size=25, color=NAVY),
            equation("0.820 MiB", font_size=42, color=TEAL),
            equation("约小 97.55 倍", font_size=28, color=ORANGE),
            width=5.5,
            height=3.4,
        ).shift(RIGHT * 3.5 + DOWN * 0.1)
        self.play(FadeIn(title), FadeIn(dense), run_time=1.05)
        self.play(FadeIn(csr), run_time=1.05)
        self.play(Create(SurroundingRectangle(csr, color=TEAL, buff=0.1)), run_time=0.75)

    def _handoff(self):
        self._clear()
        heading = title_block(
            "结论",
            "稀疏存储改变计算成本，不改变数学结果",
            "5,574 行原始顺序与 403 条重复消息均保留",
        )
        fit_width(heading, 11.8)
        boundary = card(
            cn_text("本节只解释表示、存储和 matvec", font_size=29, color=NAVY, weight="SEMIBOLD"),
            cn_text("分类训练、去重策略与业务决策留给后续课程", font_size=25, color=MUTED),
            width=10.7,
            height=1.8,
        ).next_to(heading, DOWN, buff=0.65)
        self.play(FadeIn(heading[0]), Write(heading[1]), run_time=1.05)
        self.play(FadeIn(heading[2]), FadeIn(boundary), run_time=1.05)

    def _advance_to(self, timestamp: float):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
