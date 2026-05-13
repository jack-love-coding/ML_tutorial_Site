from __future__ import annotations

import math

from manim import (
    BLUE,
    GREEN,
    ORANGE,
    RED,
    WHITE,
    YELLOW,
    Arrow,
    Circle,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    Line,
    Rectangle,
    Scene,
    Square,
    Transform,
    VGroup,
    VMobject,
)


def matrix_grid(rows: int, cols: int, cell: float = 0.24, color=BLUE) -> VGroup:
    cells = VGroup()
    for row in range(rows):
        for col in range(cols):
            square = Square(side_length=cell)
            square.set_fill(color, opacity=0.28 + 0.06 * ((row + col) % 2))
            square.set_stroke(WHITE, opacity=0.65, width=1.2)
            square.move_to([(col - (cols - 1) / 2) * cell, ((rows - 1) / 2 - row) * cell, 0])
            cells.add(square)
    return cells


def curve(points: list[tuple[float, float]], color=BLUE) -> VMobject:
    path = VMobject()
    path.set_points_smoothly([(x, y, 0) for x, y in points])
    path.set_stroke(color, width=5)
    return path


class TensorBroadcastingScene(Scene):
    def construct(self):
        x = matrix_grid(5, 4, color=BLUE).shift((-4.4, 0.35, 0))
        w = matrix_grid(4, 3, color=ORANGE).shift((-1.65, 0.35, 0))
        y = matrix_grid(5, 3, color=GREEN).shift((2.7, 0.35, 0))
        bias = VGroup(*[Circle(radius=0.08, color=YELLOW, fill_opacity=0.85).shift((0, 0.34 - i * 0.24, 0)) for i in range(3)])
        bias.shift((0.72, 0.24, 0))
        replicated = VGroup(*[bias.copy().shift((row * 0.34, -0.54 + row * 0.27, 0)) for row in range(5)])
        arrows = VGroup(
            Arrow(x.get_right(), w.get_left(), buff=0.18, color=WHITE),
            Arrow(w.get_right(), y.get_left(), buff=0.18, color=WHITE),
            Arrow(bias.get_right(), y.get_left() + (0, -0.55, 0), buff=0.16, color=YELLOW),
        )

        self.play(FadeIn(x), FadeIn(w), Create(arrows[0]))
        self.wait(0.2)
        self.play(FadeIn(bias), Create(arrows[1]), Create(arrows[2]))
        self.wait(0.2)
        self.play(Transform(bias, replicated), FadeIn(y), run_time=1.0)
        self.wait(0.6)


class AutodiffVjpFlowScene(Scene):
    def construct(self):
        left = VGroup(Dot((-4, 1.2, 0), color=BLUE), Dot((-4, -1.2, 0), color=BLUE))
        middle = VGroup(Dot((-1.6, 0.5, 0), color=GREEN), Dot((-1.6, -0.85, 0), color=GREEN))
        right = VGroup(Dot((1.0, 0, 0), color=ORANGE), Dot((3.5, 0, 0), color=RED))
        edges = VGroup()
        for source in [*left, *middle, right[0]]:
            for target in [*middle, right[0], right[1]]:
                if target.get_x() > source.get_x() and abs(target.get_x() - source.get_x()) < 3:
                    edges.add(Line(source.get_center(), target.get_center(), color=WHITE, stroke_opacity=0.35, stroke_width=4))
        reverse = VGroup(
            Arrow(right[1].get_center(), right[0].get_center(), buff=0.12, color=RED),
            Arrow(right[0].get_center(), middle[0].get_center(), buff=0.12, color=RED),
            Arrow(right[0].get_center(), middle[1].get_center(), buff=0.12, color=RED),
            Arrow(middle[0].get_center(), left[0].get_center(), buff=0.12, color=RED),
            Arrow(middle[1].get_center(), left[1].get_center(), buff=0.12, color=RED),
        )
        tangent = VGroup(
            Rectangle(width=2.0, height=0.7, color=YELLOW, fill_opacity=0.16).rotate(0.24).shift((-0.2, -2.2, 0)),
            Dot((-0.45, -2.16, 0), color=YELLOW),
        )

        self.play(FadeIn(edges), FadeIn(left), FadeIn(middle), FadeIn(right))
        self.wait(0.25)
        self.play(Create(tangent), run_time=0.6)
        self.play(Create(reverse), run_time=1.1)
        self.wait(0.6)


class SoftmaxCrossEntropyScene(Scene):
    def construct(self):
        base_x = [-1.8, -0.6, 0.6, 1.8]
        bars = VGroup(
            *[
                Rectangle(width=0.42, height=h, color=BLUE if i != 1 else YELLOW, fill_opacity=0.82)
                .shift((x, -1.7 + h / 2, 0))
                for i, (x, h) in enumerate(zip(base_x, [0.7, 1.8, 0.42, 0.34]))
            ]
        )
        triangle = VGroup(
            Line((-3.1, 1.45, 0), (-1.6, 3.2, 0), color=WHITE, stroke_opacity=0.45),
            Line((-1.6, 3.2, 0), (-0.1, 1.45, 0), color=WHITE, stroke_opacity=0.45),
            Line((-0.1, 1.45, 0), (-3.1, 1.45, 0), color=WHITE, stroke_opacity=0.45),
            Dot((-1.28, 2.38, 0), color=YELLOW),
        )
        flat = bars.copy()
        for index, bar in enumerate(flat):
            height = [1.0, 1.12, 0.92, 0.86][index]
            bar.stretch_to_fit_height(height)
            bar.move_to((base_x[index], -1.7 + height / 2, 0))
        sharp = bars.copy()
        for index, bar in enumerate(sharp):
            height = [0.35, 2.4, 0.18, 0.12][index]
            bar.stretch_to_fit_height(height)
            bar.move_to((base_x[index], -1.7 + height / 2, 0))
        pulse = Circle(radius=0.36, color=RED).move_to((base_x[1], 0.8, 0))

        self.play(FadeIn(triangle), FadeIn(bars))
        self.wait(0.2)
        self.play(Transform(bars, flat), run_time=0.7)
        self.play(Transform(bars, sharp), Create(pulse), run_time=0.8)
        self.wait(0.6)


class TrainingLossDiagnosticsScene(Scene):
    def construct(self):
        frame = VGroup(Line((-4.3, -1.8, 0), (4.4, -1.8, 0), color=WHITE, stroke_opacity=0.42), Line((-4.3, -1.8, 0), (-4.3, 2.2, 0), color=WHITE, stroke_opacity=0.42))
        healthy = curve([(-4, 1.8), (-2.5, 0.9), (-1.0, 0.34), (1.0, 0.02), (3.9, -0.22)], BLUE)
        val = curve([(-4, 1.9), (-2.5, 1.02), (-1.0, 0.48), (1.0, 0.18), (3.9, -0.03)], GREEN)
        overfit = curve([(-4, 1.9), (-2.5, 0.94), (-1.0, 0.5), (1.0, 0.7), (3.9, 1.24)], ORANGE)
        exploding = curve([(-4, 0.45), (-2.4, 0.34), (-1.0, 0.7), (1.1, 1.35), (3.7, 2.1)], RED)
        grad = VGroup(*[Line((x, -1.55, 0), (x, -1.55 + 0.18 + 0.5 * abs(math.sin(x * 1.7)), 0), color=YELLOW, stroke_width=4) for x in [-3.7, -2.8, -1.9, -1.0, -0.1, 0.8, 1.7, 2.6, 3.5]])

        self.play(FadeIn(frame), Create(healthy), Create(val), Create(grad))
        self.wait(0.25)
        self.play(Transform(val, overfit), run_time=0.8)
        self.wait(0.2)
        self.play(Transform(healthy, exploding), Transform(val, exploding.copy().shift((0, 0.28, 0))), run_time=0.85)
        self.wait(0.6)


class AttentionConvResidualScene(Scene):
    def construct(self):
        grid = matrix_grid(4, 4, cell=0.27, color=BLUE).shift((-3.6, 0.75, 0))
        window = Rectangle(width=0.58, height=0.58, color=YELLOW, fill_opacity=0.12).move_to(grid[5])
        tokens = VGroup(*[Dot((x, y, 0), color=GREEN) for x, y in [(-0.8, 1.3), (0.2, 1.75), (1.1, 1.05), (0.0, 0.55)]])
        query = Dot((2.8, 1.25, 0), color=YELLOW)
        attention = VGroup(*[Line(token.get_center(), query.get_center(), color=GREEN, stroke_opacity=0.32 + i * 0.14, stroke_width=3 + i) for i, token in enumerate(tokens)])
        residual = VGroup(
            Line((-2.7, -1.15, 0), (1.7, -1.15, 0), color=WHITE, stroke_opacity=0.45, stroke_width=5),
            Arrow((1.7, -1.15, 0), (3.2, -0.18, 0), color=ORANGE, buff=0.08),
            Arrow((-2.7, -1.15, 0), (3.2, -1.15, 0), color=YELLOW, buff=0.08),
        )
        norm = VGroup(
            Rectangle(width=0.82, height=1.15, color=RED, fill_opacity=0.2).shift((3.55, -0.65, 0)),
            VGroup(*[Line((3.25, -0.96 + i * 0.18, 0), (3.86, -0.96 + i * 0.18, 0), color=WHITE, stroke_opacity=0.35) for i in range(5)]),
        )

        self.play(FadeIn(grid), Create(window))
        self.play(window.animate.shift((0.56, -0.28, 0)), run_time=0.6)
        self.play(FadeIn(tokens), FadeIn(query), Create(attention), run_time=0.8)
        self.play(Create(residual), FadeIn(norm), run_time=0.9)
        self.wait(0.6)
