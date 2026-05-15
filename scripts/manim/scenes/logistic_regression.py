from __future__ import annotations

import numpy as np

from manim import (
    BLUE,
    GREEN,
    ORANGE,
    RED,
    WHITE,
    Axes,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    Line,
    Scene,
    Text,
    Transform,
    VGroup,
)


def sigmoid(value: float) -> float:
    return 1 / (1 + np.exp(-value))


class LinearScoreToSigmoidScene(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-6, 6, 2],
            y_range=[0, 1.05, 0.25],
            x_length=10,
            y_length=4.8,
            tips=False,
            axis_config={"stroke_color": WHITE, "stroke_opacity": 0.42},
        ).shift(0.35 * np.array([0, -0.18, 0]))
        title = Text("Linear score -> sigmoid probability", font_size=34).to_edge(np.array([0, 1, 0]))
        subtitle = Text("z can be unbounded; probability cannot", font_size=24, color=WHITE).next_to(
            title, np.array([0, -1, 0]), buff=0.18
        )
        curve = axes.plot(lambda x: sigmoid(x), x_range=[-6, 6], color=GREEN, stroke_width=7)
        half_line = Line(
            axes.c2p(-6, 0.5),
            axes.c2p(6, 0.5),
            color=WHITE,
            stroke_opacity=0.28,
        )
        zero_line = Line(
            axes.c2p(0, 0),
            axes.c2p(0, 1),
            color=WHITE,
            stroke_opacity=0.28,
        )
        dot = Dot(axes.c2p(-3.2, sigmoid(-3.2)), color=BLUE, radius=0.08)
        label = Text("negative evidence", font_size=28, color=BLUE).to_edge(np.array([0, -1, 0]))

        self.play(FadeIn(axes), FadeIn(title), FadeIn(subtitle), Create(curve), FadeIn(half_line), FadeIn(zero_line))
        self.play(FadeIn(dot), FadeIn(label))
        self.wait(0.5)

        mid_dot = Dot(axes.c2p(0, 0.5), color=WHITE, radius=0.09)
        mid_label = Text("z = 0 maps to p = 0.5", font_size=28, color=WHITE).to_edge(np.array([0, -1, 0]))
        self.play(Transform(dot, mid_dot), Transform(label, mid_label))
        self.wait(0.6)

        high_dot = Dot(axes.c2p(3.2, sigmoid(3.2)), color=ORANGE, radius=0.08)
        high_label = Text("positive evidence", font_size=28, color=ORANGE).to_edge(np.array([0, -1, 0]))
        self.play(Transform(dot, high_dot), Transform(label, high_label))
        self.wait(0.9)
        self.play(FadeOut(dot), FadeOut(label))


class LogLossConfidentMistakeScene(Scene):
    def construct(self):
        axes = Axes(
            x_range=[0.01, 1.0, 0.2],
            y_range=[0, 4.8, 1],
            x_length=10,
            y_length=4.8,
            tips=False,
            axis_config={"stroke_color": WHITE, "stroke_opacity": 0.42},
        ).shift(0.35 * np.array([0, -0.2, 0]))
        title = Text("Log loss punishes confident mistakes", font_size=34).to_edge(np.array([0, 1, 0]))
        subtitle = Text("true-class probability near zero makes loss explode", font_size=23, color=WHITE).next_to(
            title, np.array([0, -1, 0]), buff=0.18
        )
        positive_curve = axes.plot(lambda p: -np.log(max(p, 0.01)), x_range=[0.01, 0.99], color=GREEN, stroke_width=7)
        dot_good = Dot(axes.c2p(0.9, -np.log(0.9)), color=GREEN, radius=0.08)
        dot_bad = Dot(axes.c2p(0.1, -np.log(0.1)), color=RED, radius=0.1)
        label = Text("p(true class)=0.9: small loss", font_size=28, color=GREEN).to_edge(np.array([0, -1, 0]))

        self.play(FadeIn(axes), FadeIn(title), FadeIn(subtitle), Create(positive_curve))
        self.play(FadeIn(dot_good), FadeIn(label))
        self.wait(0.7)
        bad_label = Text("p(true class)=0.1: much larger loss", font_size=28, color=RED).to_edge(np.array([0, -1, 0]))
        self.play(Transform(dot_good, dot_bad), Transform(label, bad_label))
        self.wait(1.0)
        self.play(FadeOut(dot_good), FadeOut(label))


class RegularizationConfidenceFieldScene(Scene):
    def construct(self):
        title = Text("Regularization restrains confidence", font_size=34).to_edge(np.array([0, 1, 0]))
        subtitle = Text("similar boundary, smaller weights, smoother probability field", font_size=23, color=WHITE).next_to(
            title, np.array([0, -1, 0]), buff=0.18
        )
        left_label = Text("large weights", font_size=28, color=ORANGE).shift(np.array([-3.2, -2.7, 0]))
        right_label = Text("regularized", font_size=28, color=GREEN).shift(np.array([3.2, -2.7, 0]))

        left_points = VGroup()
        right_points = VGroup()
        for x, y, color in [
            (-4.6, -0.9, BLUE),
            (-4.1, -1.2, BLUE),
            (-3.5, -0.7, BLUE),
            (-2.8, -1.1, BLUE),
            (-2.4, -0.55, BLUE),
            (-3.5, 0.7, ORANGE),
            (-2.9, 1.0, ORANGE),
            (-2.2, 0.65, ORANGE),
            (-1.8, 1.15, ORANGE),
            (-3.0, 0.1, ORANGE),
        ]:
            left_points.add(Dot(np.array([x, y, 0]), radius=0.06, color=color))
        for x, y, color in [
            (1.5, -0.9, BLUE),
            (2.0, -1.2, BLUE),
            (2.7, -0.7, BLUE),
            (3.4, -1.1, BLUE),
            (3.8, -0.55, BLUE),
            (2.3, 0.7, ORANGE),
            (2.9, 1.0, ORANGE),
            (3.6, 0.65, ORANGE),
            (4.1, 1.15, ORANGE),
            (3.0, 0.1, ORANGE),
        ]:
            right_points.add(Dot(np.array([x, y, 0]), radius=0.06, color=color))

        sharp_boundary = Line(np.array([-3.9, -2.05, 0]), np.array([-2.0, 2.0, 0]), color=ORANGE, stroke_width=8)
        smooth_boundary = Line(np.array([2.0, -1.8, 0]), np.array([4.0, 1.8, 0]), color=GREEN, stroke_width=8)
        sharp_bg = VGroup(
            Line(np.array([-5.0, -1.8, 0]), np.array([-2.1, 1.8, 0]), color=BLUE, stroke_opacity=0.25, stroke_width=22),
            Line(np.array([-4.5, -1.9, 0]), np.array([-1.6, 1.7, 0]), color=ORANGE, stroke_opacity=0.28, stroke_width=22),
        )
        smooth_bg = VGroup(
            Line(np.array([1.1, -1.8, 0]), np.array([4.5, 1.8, 0]), color=BLUE, stroke_opacity=0.12, stroke_width=32),
            Line(np.array([1.6, -1.9, 0]), np.array([5.0, 1.7, 0]), color=ORANGE, stroke_opacity=0.14, stroke_width=32),
        )

        self.play(FadeIn(title), FadeIn(subtitle))
        self.play(FadeIn(sharp_bg), FadeIn(left_points), Create(sharp_boundary), FadeIn(left_label))
        self.wait(0.7)
        self.play(FadeIn(smooth_bg), FadeIn(right_points), Create(smooth_boundary), FadeIn(right_label))
        self.wait(1.0)
