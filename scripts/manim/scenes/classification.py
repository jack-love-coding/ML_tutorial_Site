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
    Axes,
    Circle,
    Create,
    Dot,
    FadeIn,
    Line,
    MathTex,
    Rectangle,
    Scene,
    Square,
    Text,
    VGroup,
)


class ThresholdSweepScene(Scene):
    def construct(self):
        title = Text("Threshold turns scores into actions", font_size=30).to_edge(UP)
        axis = Line([-5.2, -0.4, 0], [5.2, -0.4, 0], color=WHITE, stroke_opacity=0.65)
        dots = VGroup()
        scores = [0.08, 0.18, 0.27, 0.39, 0.46, 0.54, 0.63, 0.72, 0.84, 0.91]
        labels = [0, 0, 0, 1, 0, 1, 1, 0, 1, 1]
        for index, (score, label) in enumerate(zip(scores, labels)):
            x = -5 + score * 10
            y = -0.05 + 0.28 * ((index % 3) - 1)
            dots.add(Dot([x, y, 0], color=ORANGE if label else BLUE, radius=0.085))

        threshold = Line([0, -1.35, 0], [0, 1.08, 0], color=YELLOW, stroke_width=7)
        left = Rectangle(width=5.1, height=2.35, color=BLUE, fill_opacity=0.08, stroke_opacity=0).shift([-2.55, -0.12, 0])
        right = Rectangle(width=5.1, height=2.35, color=ORANGE, fill_opacity=0.1, stroke_opacity=0).shift([2.55, -0.12, 0])
        caption = Text("Moving the threshold changes predictions, not the scores.", font_size=22).to_edge(DOWN)

        self.play(FadeIn(title), Create(axis), FadeIn(left), FadeIn(right), FadeIn(dots))
        self.play(Create(threshold), FadeIn(caption))
        self.play(threshold.animate.shift([1.5, 0, 0]), run_time=1.1)
        self.play(threshold.animate.shift([-2.2, 0, 0]), run_time=1.1)
        self.wait(0.6)


class ConfusionUpdateScene(Scene):
    def construct(self):
        title = Text("Every example lands in one of four cells", font_size=30).to_edge(UP)
        grid = VGroup()
        labels = [("TP", GREEN), ("FN", RED), ("FP", RED), ("TN", GREEN)]
        for row in range(2):
            for col in range(2):
                index = row * 2 + col
                cell = Square(side_length=1.65, color=WHITE, stroke_opacity=0.65)
                cell.set_fill(labels[index][1], opacity=0.1)
                cell.move_to([(col - 0.5) * 1.9, (0.5 - row) * 1.9, 0])
                grid.add(cell)
                grid.add(Text(labels[index][0], font_size=32, color=labels[index][1]).move_to(cell))

        examples = VGroup(
            Dot([-4.6, 1.4, 0], color=ORANGE),
            Dot([-4.35, 0.7, 0], color=ORANGE),
            Dot([-4.65, -0.2, 0], color=BLUE),
            Dot([-4.32, -1.0, 0], color=BLUE),
        )
        targets = [[-0.95, 0.95, 0], [0.95, 0.95, 0], [-0.95, -0.95, 0], [0.95, -0.95, 0]]
        caption = Text("Metrics are summaries of these four counts.", font_size=22).to_edge(DOWN)

        self.play(FadeIn(title), FadeIn(grid), FadeIn(examples))
        for dot, target in zip(examples, targets):
            self.play(dot.animate.move_to(target), run_time=0.35)
        self.play(FadeIn(caption))
        self.wait(0.7)


class RocConstructionScene(Scene):
    def construct(self):
        title = Text("ROC connects every threshold", font_size=30).to_edge(UP)
        axes = Axes(
            x_range=[0, 1, 0.25],
            y_range=[0, 1, 0.25],
            x_length=5.2,
            y_length=3.8,
            tips=False,
        ).shift([-0.45, -0.25, 0])
        baseline = axes.plot(lambda x: x, color=WHITE, stroke_opacity=0.35)
        curve = axes.plot(lambda x: 1 - math.exp(-3.2 * x), color=GREEN, stroke_width=6)
        markers = VGroup()
        for x in [0.12, 0.32, 0.58, 0.84]:
            markers.add(Dot(axes.c2p(x, 1 - math.exp(-3.2 * x)), color=ORANGE, radius=0.07))
        formula = MathTex(r"TPR=\frac{TP}{TP+FN},\quad FPR=\frac{FP}{FP+TN}", font_size=34).to_edge(DOWN)

        self.play(FadeIn(title), FadeIn(axes), Create(baseline))
        self.play(Create(curve), FadeIn(markers))
        self.play(FadeIn(formula))
        self.wait(0.7)


class SoftmaxSimplexScene(Scene):
    def construct(self):
        title = Text("Softmax shares one probability budget", font_size=30).to_edge(UP)
        triangle = VGroup(
            Line([0, 1.65, 0], [-2.3, -1.45, 0], color=WHITE),
            Line([-2.3, -1.45, 0], [2.3, -1.45, 0], color=WHITE),
            Line([2.3, -1.45, 0], [0, 1.65, 0], color=WHITE),
        )
        labels = VGroup(
            Text("A", font_size=30, color=ORANGE).move_to([0, 1.95, 0]),
            Text("B", font_size=30, color=BLUE).move_to([-2.55, -1.65, 0]),
            Text("C", font_size=30, color=GREEN).move_to([2.55, -1.65, 0]),
        )
        point = Dot([0.2, -0.1, 0], color=YELLOW, radius=0.11)
        bars = VGroup()
        probabilities = [0.62, 0.25, 0.13]
        colors = [ORANGE, BLUE, GREEN]
        for index, probability in enumerate(probabilities):
            bar = Rectangle(width=0.38, height=probability * 2.2, color=colors[index], fill_opacity=0.75)
            bar.move_to([3.3 + index * 0.55, -1.45 + probability * 1.1, 0])
            bars.add(bar)
        formula = MathTex(r"p_i=\frac{e^{z_i}}{\sum_j e^{z_j}}", font_size=38).to_edge(DOWN)

        self.play(FadeIn(title), Create(triangle), FadeIn(labels))
        self.play(FadeIn(point), FadeIn(bars), FadeIn(formula))
        self.play(point.animate.move_to([-0.55, -0.35, 0]), run_time=0.9)
        self.play(point.animate.move_to([0.95, -0.72, 0]), run_time=0.9)
        self.wait(0.6)
