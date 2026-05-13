from __future__ import annotations

import numpy as np

from manim import (
    BLUE,
    GREEN,
    ORANGE,
    WHITE,
    Axes,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    Scene,
    Text,
    Transform,
    VGroup,
)


POINTS = [
    (1.4936, 0.6690, "train"),
    (1.6331, 0.6750, "train"),
    (1.8633, 1.0940, "validation"),
    (2.1518, 1.5280, "train"),
    (2.1987, 1.2400, "train"),
    (2.3171, 1.5950, "validation"),
    (2.5057, 1.5630, "train"),
    (2.6742, 1.3190, "train"),
    (2.8090, 0.8250, "validation"),
    (2.9514, 1.9810, "train"),
    (3.0682, 1.5650, "train"),
    (3.1779, 1.7110, "validation"),
    (3.3500, 1.7100, "train"),
    (3.5357, 1.9900, "train"),
    (3.6333, 1.7020, "validation"),
    (3.7364, 1.9040, "train"),
    (3.9861, 1.6390, "train"),
    (4.0326, 1.6470, "validation"),
    (4.1554, 3.1310, "train"),
    (4.4882, 1.4400, "train"),
    (4.6187, 2.0500, "validation"),
    (4.9583, 3.4280, "train"),
    (5.0699, 2.6610, "train"),
    (5.5360, 2.0480, "validation"),
    (6.0663, 3.7260, "train"),
    (6.8154, 2.6590, "train"),
    (7.7197, 1.9380, "validation"),
]


def fit_curve(degree: int) -> list[tuple[float, float]]:
    train = [(x, y) for x, y, split in POINTS if split == "train"]
    mean_x = np.mean([x for x, _ in train])
    scale_x = (max(x for x, _ in train) - min(x for x, _ in train)) / 2
    mean_y = np.mean([y for _, y in train])
    scale_y = np.std([y for _, y in train])

    def features(values: np.ndarray) -> np.ndarray:
        normalized = (values - mean_x) / scale_x
        return np.column_stack([normalized ** power for power in range(1, degree + 1)] + [np.ones(len(values))])

    x_train = np.array([x for x, _ in train])
    y_train = np.array([(y - mean_y) / scale_y for _, y in train])
    design = features(x_train)
    regularizer = 1e-6 * np.eye(design.shape[1])
    regularizer[-1, -1] = 0
    coefficients = np.linalg.solve(design.T @ design / len(train) + regularizer, design.T @ y_train / len(train))

    xs = np.linspace(1.35, 7.9, 96)
    ys = (features(xs) @ coefficients) * scale_y + mean_y
    return list(zip(xs, ys))


class LinearRegressionFitComparisonScene(Scene):
    def construct(self):
        axes = Axes(
            x_range=[1.2, 8.0, 1],
            y_range=[0.2, 4.1, 0.5],
            x_length=10,
            y_length=5.1,
            tips=False,
            axis_config={"stroke_color": WHITE, "stroke_opacity": 0.42},
        ).shift(0.25 * np.array([0, -0.1, 0]))
        title = Text("California Housing: fit complexity", font_size=34).to_edge(np.array([0, 1, 0]))
        subtitle = Text("MedInc -> median house value", font_size=24, color=WHITE).next_to(title, np.array([0, -1, 0]), buff=0.18)
        train_dots = VGroup()
        validation_dots = VGroup()

        for x, y, split in POINTS:
            dot = Dot(axes.c2p(x, y), radius=0.045, color=BLUE if split == "train" else ORANGE)
            if split == "train":
                train_dots.add(dot)
            else:
                validation_dots.add(dot)

        label = Text("degree 1: underfit", font_size=30, color=WHITE).to_edge(np.array([0, -1, 0]))
        curve = axes.plot_line_graph(
            x_values=[x for x, _ in fit_curve(1)],
            y_values=[y for _, y in fit_curve(1)],
            add_vertex_dots=False,
            line_color=WHITE,
            stroke_width=6,
        )

        self.play(FadeIn(axes), FadeIn(title), FadeIn(subtitle), FadeIn(train_dots), FadeIn(validation_dots))
        self.play(Create(curve), FadeIn(label))
        self.wait(0.7)

        cubic = axes.plot_line_graph(
            x_values=[x for x, _ in fit_curve(3)],
            y_values=[y for _, y in fit_curve(3)],
            add_vertex_dots=False,
            line_color=GREEN,
            stroke_width=7,
        )
        cubic_label = Text("degree 3: better validation fit", font_size=30, color=GREEN).to_edge(np.array([0, -1, 0]))
        self.play(Transform(curve, cubic), Transform(label, cubic_label))
        self.wait(0.8)

        overfit = axes.plot_line_graph(
            x_values=[x for x, _ in fit_curve(7)],
            y_values=[max(0.0, min(4.4, y)) for _, y in fit_curve(7)],
            add_vertex_dots=False,
            line_color=ORANGE,
            stroke_width=7,
        )
        overfit_label = Text("degree 7: lower train error, worse validation", font_size=28, color=ORANGE).to_edge(np.array([0, -1, 0]))
        self.play(Transform(curve, overfit), Transform(label, overfit_label))
        self.wait(1.0)
        self.play(FadeOut(label), FadeOut(curve))
        self.wait(0.2)


class RegularizationGeometryScene(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-3.2, 3.2, 1],
            y_range=[-2.4, 2.4, 1],
            x_length=9.2,
            y_length=5.6,
            tips=False,
            axis_config={"stroke_color": WHITE, "stroke_opacity": 0.36},
        )
        title = Text("Regularization geometry", font_size=34).to_edge(np.array([0, 1, 0]))
        subtitle = Text("Loss contours meet a parameter budget", font_size=24, color=WHITE).next_to(title, np.array([0, -1, 0]), buff=0.18)

        contours = VGroup()
        for width, height, opacity in [(5.8, 3.8, 0.24), (4.3, 2.7, 0.34), (2.7, 1.7, 0.5)]:
            contour = axes.plot_parametric_curve(
                lambda t, w=width, h=height: axes.c2p(
                    0.4 + w * np.cos(t) / 2,
                    -0.22 + h * np.sin(t) / 2,
                ),
                t_range=[0, 2 * np.pi],
                color=WHITE,
                stroke_opacity=opacity,
                stroke_width=3,
            )
            contours.add(contour)

        l1 = axes.plot_line_graph(
            x_values=[0, 1.65, 0, -1.65, 0],
            y_values=[1.65, 0, -1.65, 0, 1.65],
            add_vertex_dots=False,
            line_color=BLUE,
            stroke_width=7,
        )
        l2 = axes.plot_parametric_curve(
            lambda t: axes.c2p(1.2 * np.cos(t), 1.2 * np.sin(t)),
            t_range=[0, 2 * np.pi],
            color=GREEN,
            stroke_width=7,
        )
        path = axes.plot_parametric_curve(
            lambda t: axes.c2p(-1.55 + 3.7 * t, 0.55 - 1.75 * t + 0.32 * np.sin(5.4 * t)),
            t_range=[0, 1],
            color=ORANGE,
            stroke_width=6,
        )

        l1_label = Text("L1: corners favor sparse weights", font_size=28, color=BLUE).to_edge(np.array([0, -1, 0]))
        l2_label = Text("L2: smooth shrinkage", font_size=28, color=GREEN).to_edge(np.array([0, -1, 0]))
        elastic_label = Text("Elastic Net blends both budgets", font_size=28, color=ORANGE).to_edge(np.array([0, -1, 0]))

        self.play(FadeIn(axes), FadeIn(title), FadeIn(subtitle), FadeIn(contours))
        self.play(Create(l1), FadeIn(l1_label))
        self.wait(0.7)
        self.play(Transform(l1, l2), Transform(l1_label, l2_label))
        self.wait(0.7)
        self.play(Create(path), Transform(l1_label, elastic_label))
        self.wait(0.9)
        self.play(FadeOut(path), FadeOut(l1), FadeOut(l1_label))
        self.wait(0.2)
