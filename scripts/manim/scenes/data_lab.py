from __future__ import annotations

from manim import (
    BLUE,
    GREEN,
    ORANGE,
    PURPLE,
    RED,
    WHITE,
    YELLOW,
    Arrow,
    Circle,
    Create,
    Dot,
    FadeIn,
    Line,
    Rectangle,
    Scene,
    Square,
    Transform,
    VGroup,
)


def table_grid(rows: int, cols: int, cell: float = 0.28, color=BLUE) -> VGroup:
    cells = VGroup()
    for row in range(rows):
        for col in range(cols):
            cell_box = Square(side_length=cell)
            cell_box.set_fill(color, opacity=0.18 + 0.06 * ((row + col) % 2))
            cell_box.set_stroke(WHITE, opacity=0.64, width=1)
            cell_box.move_to([(col - (cols - 1) / 2) * cell, ((rows - 1) / 2 - row) * cell, 0])
            cells.add(cell_box)
    return cells


class DataTypesFeatureFlowScene(Scene):
    def construct(self):
        raw = table_grid(5, 5, color=BLUE).shift((-4.5, 0.35, 0))
        type_bins = VGroup(
            Rectangle(width=0.9, height=0.42, color=GREEN, fill_opacity=0.22).shift((-1.5, 1.1, 0)),
            Rectangle(width=0.9, height=0.42, color=YELLOW, fill_opacity=0.22).shift((-1.5, 0.35, 0)),
            Rectangle(width=0.9, height=0.42, color=RED, fill_opacity=0.22).shift((-1.5, -0.4, 0)),
        )
        vector = VGroup(
            *[
                Rectangle(width=0.34, height=0.46, color=GREEN if i < 4 else ORANGE, fill_opacity=0.55)
                .shift((1.5 + i * 0.42, 0.35, 0))
                for i in range(8)
            ]
        )
        arrows = VGroup(
            Arrow(raw.get_right(), type_bins.get_left(), buff=0.18, color=WHITE),
            Arrow(type_bins.get_right(), vector.get_left(), buff=0.18, color=WHITE),
        )
        floating_columns = VGroup(raw[1].copy(), raw[7].copy(), raw[18].copy())

        self.play(FadeIn(raw), Create(arrows[0]))
        self.play(Transform(floating_columns, type_bins.copy()), FadeIn(type_bins), run_time=0.8)
        self.play(Create(arrows[1]), FadeIn(vector), run_time=0.8)
        self.wait(0.5)


class DataCleaningFlowScene(Scene):
    def construct(self):
        raw = table_grid(6, 5, color=ORANGE).shift((-4.3, 0.15, 0))
        warnings = VGroup(
            Circle(radius=0.09, color=RED, fill_opacity=0.9).move_to(raw[3]),
            Circle(radius=0.09, color=RED, fill_opacity=0.9).move_to(raw[11]),
            Circle(radius=0.09, color=YELLOW, fill_opacity=0.9).move_to(raw[23]),
        )
        gates = VGroup(
            Rectangle(width=0.74, height=1.7, color=BLUE, fill_opacity=0.18).shift((-1.6, 0.15, 0)),
            Rectangle(width=0.74, height=1.7, color=GREEN, fill_opacity=0.18).shift((-0.45, 0.15, 0)),
            Rectangle(width=0.74, height=1.7, color=YELLOW, fill_opacity=0.18).shift((0.7, 0.15, 0)),
        )
        clean = table_grid(5, 4, color=GREEN).shift((3.55, 0.15, 0))
        arrows = VGroup(
            Arrow(raw.get_right(), gates[0].get_left(), buff=0.16, color=WHITE),
            Arrow(gates[0].get_right(), gates[1].get_left(), buff=0.16, color=WHITE),
            Arrow(gates[1].get_right(), gates[2].get_left(), buff=0.16, color=WHITE),
            Arrow(gates[2].get_right(), clean.get_left(), buff=0.16, color=WHITE),
        )

        self.play(FadeIn(raw), FadeIn(warnings))
        self.play(Create(arrows[0]), FadeIn(gates[0]), run_time=0.5)
        self.play(Create(arrows[1]), FadeIn(gates[1]), Transform(warnings, warnings.copy().set_opacity(0.35)), run_time=0.6)
        self.play(Create(arrows[2]), FadeIn(gates[2]), run_time=0.5)
        self.play(Create(arrows[3]), FadeIn(clean), run_time=0.8)
        self.wait(0.5)


class EdaSplitApplyScene(Scene):
    def construct(self):
        table = table_grid(6, 5, color=BLUE).shift((-4.4, 0.2, 0))
        groups = VGroup(
            table_grid(3, 3, color=GREEN).shift((-1.65, 1.0, 0)),
            table_grid(3, 3, color=ORANGE).shift((-1.65, -0.75, 0)),
        )
        bars = VGroup(
            Rectangle(width=0.42, height=1.3, color=GREEN, fill_opacity=0.72).shift((1.45, -0.45, 0)),
            Rectangle(width=0.42, height=0.82, color=ORANGE, fill_opacity=0.72).shift((2.1, -0.69, 0)),
        )
        result = table_grid(3, 2, color=PURPLE).shift((3.7, 0.15, 0))
        arrows = VGroup(
            Arrow(table.get_right(), groups.get_left(), buff=0.16, color=WHITE),
            Arrow(groups.get_right(), bars.get_left(), buff=0.16, color=WHITE),
            Arrow(bars.get_right(), result.get_left(), buff=0.16, color=WHITE),
        )

        self.play(FadeIn(table))
        self.play(Create(arrows[0]), Transform(table.copy(), groups), FadeIn(groups), run_time=0.8)
        self.play(Create(arrows[1]), FadeIn(bars), run_time=0.7)
        self.play(Create(arrows[2]), FadeIn(result), run_time=0.7)
        self.wait(0.5)


class PandasMethodChainScene(Scene):
    def construct(self):
        start = table_grid(5, 4, color=BLUE).shift((-4.5, 0.15, 0))
        steps = VGroup(
            Rectangle(width=0.72, height=0.72, color=GREEN, fill_opacity=0.24).shift((-2.3, 0.15, 0)),
            Rectangle(width=0.72, height=0.72, color=YELLOW, fill_opacity=0.24).shift((-1.15, 0.15, 0)),
            Rectangle(width=0.72, height=0.72, color=ORANGE, fill_opacity=0.24).shift((0.0, 0.15, 0)),
            Rectangle(width=0.72, height=0.72, color=PURPLE, fill_opacity=0.24).shift((1.15, 0.15, 0)),
        )
        final = table_grid(3, 3, color=GREEN).shift((3.65, 0.15, 0))
        arrows = VGroup()
        previous = start
        for step in steps:
            arrows.add(Arrow(previous.get_right(), step.get_left(), buff=0.12, color=WHITE))
            previous = step
        arrows.add(Arrow(steps[-1].get_right(), final.get_left(), buff=0.12, color=WHITE))

        self.play(FadeIn(start))
        for index, step in enumerate(steps):
            self.play(Create(arrows[index]), FadeIn(step), run_time=0.45)
        self.play(Create(arrows[-1]), FadeIn(final), run_time=0.7)
        self.wait(0.5)
