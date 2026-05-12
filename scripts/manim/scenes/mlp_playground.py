from __future__ import annotations

import math

from manim import (
    BLUE,
    DOWN,
    GREEN,
    ORANGE,
    RED,
    UP,
    WHITE,
    YELLOW,
    Arrow,
    Axes,
    Circle,
    Create,
    DashedLine,
    Dot,
    FadeIn,
    FadeOut,
    Line,
    NumberPlane,
    Scene,
    Text,
    Transform,
    VGroup,
)


def sigmoid_curve(x: float) -> float:
    return 2 / (1 + math.exp(-2 * x)) - 1


class AffineActivationScene(Scene):
    def construct(self):
        plane = NumberPlane(
            x_range=[-4, 4, 1],
            y_range=[-3, 3, 1],
            background_line_style={"stroke_opacity": 0.18},
        ).scale(0.78).shift([-3.05, 0, 0])
        title = Text("Affine score, then activation", font_size=30).to_edge(UP)
        separator = Line(plane.c2p(-3.4, 2.4), plane.c2p(3.4, -2.1), color=GREEN, stroke_width=6)
        score_arrow = Arrow([0.2, 0, 0], [1.65, 0, 0], color=GREEN, buff=0)
        node = Circle(radius=0.48, color=GREEN).shift([0, 0, 0])
        node_wave = Axes(
            x_range=[-2.5, 2.5, 1],
            y_range=[-1.2, 1.2, 1],
            x_length=3.0,
            y_length=1.75,
            tips=False,
            axis_config={"stroke_opacity": 0.55},
        ).shift([3.1, 0, 0])
        curve = node_wave.plot(sigmoid_curve, color=BLUE, stroke_width=6)
        caption = Text("linear split becomes a nonlinear response", font_size=24).to_edge(DOWN)

        self.play(FadeIn(title), FadeIn(plane), Create(separator))
        self.play(FadeIn(node), Create(score_arrow), FadeIn(caption))
        self.play(FadeIn(node_wave), Create(curve))
        self.wait(0.7)


class HiddenRewriteScene(Scene):
    def construct(self):
        title = Text("Hidden space can make classes readable", font_size=30).to_edge(UP)
        left_axes = Axes(x_range=[-2, 2, 1], y_range=[-2, 2, 1], x_length=3.2, y_length=3.2, tips=False).shift([-3.2, 0, 0])
        right_axes = Axes(x_range=[-2, 2, 1], y_range=[-2, 2, 1], x_length=3.2, y_length=3.2, tips=False).shift([3.2, 0, 0])
        left_points = VGroup()
        right_points = VGroup()
        for i in range(18):
            t = i / 17
            x = -1.45 + 2.9 * t
            left_points.add(Dot(left_axes.c2p(x, x + 0.35 * math.sin(8 * t)), color=BLUE, radius=0.045))
            left_points.add(Dot(left_axes.c2p(x, -x + 0.35 * math.cos(8 * t)), color=ORANGE, radius=0.045))
            right_points.add(Dot(right_axes.c2p(-1.1 + 0.35 * math.sin(9 * t), -1.5 + 3 * t), color=BLUE, radius=0.045))
            right_points.add(Dot(right_axes.c2p(1.1 + 0.35 * math.cos(9 * t), -1.5 + 3 * t), color=ORANGE, radius=0.045))
        network = VGroup(
            Circle(radius=0.22, color=WHITE).shift([-0.5, 0.75, 0]),
            Circle(radius=0.22, color=WHITE).shift([-0.5, -0.75, 0]),
            Circle(radius=0.22, color=GREEN).shift([0.5, 0.45, 0]),
            Circle(radius=0.22, color=GREEN).shift([0.5, -0.45, 0]),
        )
        arrows = VGroup(
            Arrow([-1.35, 0, 0], [-0.8, 0, 0], color=GREEN, buff=0),
            Arrow([0.85, 0, 0], [1.35, 0, 0], color=GREEN, buff=0),
        )
        boundary = DashedLine(right_axes.c2p(0, -1.7), right_axes.c2p(0, 1.7), color=GREEN, stroke_width=5)
        caption = Text("the final layer reads a simpler hidden layout", font_size=24).to_edge(DOWN)

        self.play(FadeIn(title), FadeIn(left_axes), FadeIn(left_points))
        self.play(FadeIn(network), FadeIn(arrows), Transform(left_points.copy(), right_points), FadeIn(right_axes))
        self.play(FadeIn(right_points), Create(boundary), FadeIn(caption))
        self.wait(0.7)


class BackpropResponsibilityScene(Scene):
    def construct(self):
        title = Text("Backprop assigns responsibility", font_size=30).to_edge(UP)
        layers = [
            [(-3, 0.7), (-3, -0.7)],
            [(-1, 1.1), (-1, 0), (-1, -1.1)],
            [(1.1, 0.7), (1.1, -0.7)],
            [(3, 0)],
        ]
        dots = VGroup()
        links = VGroup()
        for layer in layers:
            for x, y in layer:
                dots.add(Dot([x, y, 0], color=GREEN if x not in [-3, 3] else BLUE, radius=0.13))
        for left, right in zip(layers[:-1], layers[1:]):
            for source in left:
                for target in right:
                    links.add(Line([source[0], source[1], 0], [target[0], target[1], 0], color=WHITE, stroke_opacity=0.35))
        loss = Dot([3.9, 0, 0], color=RED, radius=0.22)
        forward = Arrow([-3.8, 1.8, 0], [3.8, 1.8, 0], color=BLUE, buff=0)
        backward = VGroup(
            Arrow([3.65, -0.15, 0], [1.3, -0.6, 0], color=RED, buff=0, stroke_width=8),
            Arrow([1.0, -0.55, 0], [-1.0, -1.05, 0], color=RED, buff=0, stroke_width=6),
            Arrow([-1.1, -1.0, 0], [-3.0, -0.65, 0], color=RED, buff=0, stroke_width=4),
        )
        caption = Text("local derivatives carry the loss signal backward", font_size=24).to_edge(DOWN)

        self.play(FadeIn(title), FadeIn(links), FadeIn(dots))
        self.play(Create(forward), FadeIn(loss))
        self.play(FadeOut(forward), FadeIn(backward), FadeIn(caption))
        self.wait(0.7)


class CapacityOverfittingScene(Scene):
    def construct(self):
        title = Text("Capacity changes boundary complexity", font_size=30).to_edge(UP)
        axes_group = VGroup()
        curves = VGroup()
        captions = VGroup()
        labels = ["underfit", "balanced", "overfit"]
        for index, x_shift in enumerate([-3.6, 0, 3.6]):
            axes = Axes(x_range=[-2, 2, 1], y_range=[-2, 2, 1], x_length=2.6, y_length=2.6, tips=False).shift([x_shift, 0, 0])
            axes_group.add(axes)
            for i in range(18):
                t = i / 17
                color = BLUE if i < 9 else ORANGE
                x = -1.5 + 3 * t
                y = (0.6 if color == BLUE else -0.6) + 0.38 * math.sin(8 * t + index)
                axes_group.add(Dot(axes.c2p(x, y), color=color, radius=0.035))
            if index == 0:
                curve = axes.plot(lambda x: 0.65 * x, color=GREEN, stroke_width=5)
            elif index == 1:
                curve = axes.plot(lambda x: 0.65 * math.tanh(1.4 * x), color=GREEN, stroke_width=5)
            else:
                curve = axes.plot(lambda x: 0.55 * math.sin(4.2 * x) + 0.2 * x, color=GREEN, stroke_width=5)
            curves.add(curve)
            captions.add(Text(labels[index], font_size=21).next_to(axes, DOWN, buff=0.22))
        footer = Text("training loss alone cannot choose the right boundary", font_size=24).to_edge(DOWN)

        self.play(FadeIn(title), FadeIn(axes_group))
        self.play(Create(curves[0]), FadeIn(captions[0]))
        self.play(Create(curves[1]), FadeIn(captions[1]))
        self.play(Create(curves[2]), FadeIn(captions[2]), FadeIn(footer))
        self.wait(0.7)
