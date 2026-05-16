from __future__ import annotations

from manim import (
    BLUE,
    Brace,
    GREEN,
    ORANGE,
    PURPLE,
    RED,
    RIGHT,
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
    Text,
    Transform,
    UP,
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


class CategoricalOneHotFlowScene(Scene):
    def construct(self):
        tokens = VGroup(
            *[
                Rectangle(width=1.18, height=0.42, color=color, fill_opacity=0.22)
                .shift((-5.0, 1.15 - index * 0.55, 0))
                for index, color in enumerate([BLUE, GREEN, ORANGE, PURPLE, RED])
            ]
        )
        token_label = Text("category values", font_size=22).next_to(tokens, UP, buff=0.25)

        vocab = VGroup(
            *[
                Rectangle(width=1.36, height=0.44, color=WHITE, fill_opacity=0.08)
                .shift((-1.7, 1.35 - index * 0.45, 0))
                for index in range(7)
            ]
        )
        vocab[5].set_color(ORANGE).set_fill(ORANGE, opacity=0.18)
        vocab[6].set_color(RED).set_fill(RED, opacity=0.16)
        vocab_label = Text("frozen vocabulary", font_size=22).next_to(vocab, UP, buff=0.25)

        one_hot = VGroup(
            *[
                Rectangle(width=0.44, height=0.7, color=GREEN if index == 2 else WHITE, fill_opacity=0.55 if index == 2 else 0.08)
                .shift((1.5 + index * 0.48, 0.35, 0))
                for index in range(7)
            ]
        )
        vector_label = Text("one-hot vector", font_size=22).next_to(one_hot, UP, buff=0.32)
        sparse = VGroup(
            Rectangle(width=2.2, height=0.72, color=GREEN, fill_opacity=0.16).shift((4.35, -1.2, 0)),
            Text("{2: 1}", font_size=28).shift((4.35, -1.2, 0)),
        )
        sparse_label = Text("sparse index", font_size=22).next_to(sparse, UP, buff=0.2)

        arrows = VGroup(
            Arrow(tokens.get_right(), vocab.get_left(), buff=0.22, color=WHITE),
            Arrow(vocab.get_right(), one_hot.get_left(), buff=0.22, color=WHITE),
            Arrow(one_hot.get_bottom(), sparse.get_top(), buff=0.18, color=WHITE),
        )

        self.play(FadeIn(tokens), FadeIn(token_label))
        self.play(Create(arrows[0]), FadeIn(vocab), FadeIn(vocab_label), run_time=0.8)
        self.play(Create(arrows[1]), FadeIn(one_hot), FadeIn(vector_label), run_time=0.8)
        self.play(Create(arrows[2]), FadeIn(sparse), FadeIn(sparse_label), run_time=0.7)
        self.wait(0.5)


class FeatureCrossSparsityScene(Scene):
    def construct(self):
        feature_a = VGroup(
            *[
                Rectangle(width=0.42, height=0.5, color=GREEN if index == 1 else BLUE, fill_opacity=0.58 if index == 1 else 0.12)
                .shift((-5.0, 0.85 - index * 0.58, 0))
                for index in range(4)
            ]
        )
        feature_b = VGroup(
            *[
                Rectangle(width=0.42, height=0.5, color=ORANGE if index == 2 else BLUE, fill_opacity=0.58 if index == 2 else 0.12)
                .shift((-4.15, 0.85 - index * 0.58, 0))
                for index in range(4)
            ]
        )
        labels = VGroup(
            Text("A", font_size=24).next_to(feature_a, UP, buff=0.2),
            Text("B", font_size=24).next_to(feature_b, UP, buff=0.2),
        )
        brace = Brace(VGroup(feature_a, feature_b), RIGHT, color=WHITE)

        grid = VGroup()
        for row in range(4):
            for col in range(4):
                cell = Square(side_length=0.42)
                active = row == 1 and col == 2
                cell.set_stroke(WHITE, opacity=0.64, width=1)
                cell.set_fill(ORANGE if active else BLUE, opacity=0.62 if active else 0.08)
                cell.shift((-1.0 + col * 0.45, 0.72 - row * 0.45, 0))
                grid.add(cell)
        grid_label = Text("cross grid", font_size=22).next_to(grid, UP, buff=0.3)

        crossed_vector = VGroup(
            *[
                Rectangle(width=0.2, height=0.42, color=ORANGE if index == 6 else WHITE, fill_opacity=0.66 if index == 6 else 0.07)
                .shift((2.3 + index * 0.22, 0.15, 0))
                for index in range(16)
            ]
        )
        vector_label = Text("wide sparse vector", font_size=22).next_to(crossed_vector, UP, buff=0.32)
        warning = Text("dimension = |A| × |B|", font_size=24, color=ORANGE).shift((3.9, -1.35, 0))

        arrows = VGroup(
            Arrow(brace.get_right(), grid.get_left(), buff=0.22, color=WHITE),
            Arrow(grid.get_right(), crossed_vector.get_left(), buff=0.24, color=WHITE),
        )

        self.play(FadeIn(feature_a), FadeIn(feature_b), FadeIn(labels), FadeIn(brace))
        self.play(Create(arrows[0]), FadeIn(grid), FadeIn(grid_label), run_time=0.8)
        self.play(Create(arrows[1]), FadeIn(crossed_vector), FadeIn(vector_label), FadeIn(warning), run_time=0.8)
        self.wait(0.5)
