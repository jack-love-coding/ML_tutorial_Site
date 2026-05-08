import math

from manim import (
    Axes,
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
    NumberPlane,
    DOWN,
    Scene,
    Text,
    Transform,
    UP,
    VGroup,
)


def taylor_sin(x, degree):
    total = 0
    for k in range((degree + 1) // 2):
        power = 2 * k + 1
        if power > degree:
            break
        total += ((-1) ** k) * x ** power / math.factorial(power)
    return total


class VectorDotProductScene(Scene):
    def construct(self):
        plane = NumberPlane(
            x_range=[-4, 4, 1],
            y_range=[-3, 3, 1],
            background_line_style={"stroke_opacity": 0.22},
        )
        title = Text("Dot product reads angle", font_size=34).to_edge(UP)
        a = Arrow(plane.c2p(0, 0), plane.c2p(2.4, 1.1), color=BLUE, buff=0)
        b = Arrow(plane.c2p(0, 0), plane.c2p(2.1, 1.7), color=GREEN, buff=0)
        label = Text("small angle -> positive dot", font_size=26).to_edge(DOWN)

        self.play(FadeIn(plane), FadeIn(title))
        self.play(Create(a), Create(b), FadeIn(label))
        self.wait(0.4)

        b_perp = Arrow(plane.c2p(0, 0), plane.c2p(-0.2, 2.7), color=GREEN, buff=0)
        label_perp = Text("near 90 degrees -> dot near 0", font_size=26).to_edge(DOWN)
        self.play(Transform(b, b_perp), Transform(label, label_perp))
        self.wait(0.4)

        b_opposite = Arrow(plane.c2p(0, 0), plane.c2p(-2.2, -1.4), color=GREEN, buff=0)
        label_opposite = Text("opposite direction -> negative dot", font_size=26).to_edge(DOWN)
        self.play(Transform(b, b_opposite), Transform(label, label_opposite))
        self.wait(0.6)


class MatrixTransformScene(Scene):
    def construct(self):
        plane = NumberPlane(
            x_range=[-4, 4, 1],
            y_range=[-3, 3, 1],
            background_line_style={"stroke_opacity": 0.22},
        )
        title = Text("A matrix moves the basis vectors", font_size=32).to_edge(UP)
        e1 = Arrow(plane.c2p(0, 0), plane.c2p(1, 0), color=BLUE, buff=0)
        e2 = Arrow(plane.c2p(0, 0), plane.c2p(0, 1), color=GREEN, buff=0)
        caption = Text("original grid", font_size=26).to_edge(DOWN)

        self.play(FadeIn(plane), FadeIn(title), Create(e1), Create(e2), FadeIn(caption))
        self.wait(0.4)

        transformed_plane = plane.copy()
        transformed_plane.apply_matrix([[1.4, 0.7], [-0.25, 1.05]])
        e1_next = Arrow(plane.c2p(0, 0), plane.c2p(1.4, -0.25), color=BLUE, buff=0)
        e2_next = Arrow(plane.c2p(0, 0), plane.c2p(0.7, 1.05), color=GREEN, buff=0)
        caption_next = Text("basis vectors move -> grid follows", font_size=26).to_edge(DOWN)

        self.play(Transform(plane, transformed_plane), Transform(e1, e1_next), Transform(e2, e2_next), Transform(caption, caption_next))
        self.wait(0.6)

        collapsed_plane = plane.copy()
        collapsed_plane.apply_matrix([[0.75, 0.75], [0.2, 0.2]])
        caption_collapse = Text("determinant near 0 -> space collapses", font_size=26).to_edge(DOWN)
        self.play(Transform(plane, collapsed_plane), FadeOut(e1), FadeOut(e2), Transform(caption, caption_collapse))
        self.wait(0.6)


class GradientDescentScene(Scene):
    def construct(self):
        title = Text("Gradient descent follows negative gradient", font_size=31).to_edge(UP)
        contours = VGroup(
            *[
                Circle(radius=radius, color=ORANGE, stroke_opacity=0.28).stretch(1.45, 0).rotate(-0.32)
                for radius in [0.7, 1.1, 1.55, 2.05, 2.6]
            ]
        )
        point = Dot([-2.6, 1.7, 0], color=BLUE)
        uphill = Arrow(point.get_center(), point.get_center() + [0.9, 0.6, 0], color=RED, buff=0)
        downhill = Arrow(point.get_center(), point.get_center() + [-0.9, -0.6, 0], color=GREEN, buff=0)
        caption = Text("gradient points uphill", font_size=26).to_edge(DOWN)

        self.play(FadeIn(title), FadeIn(contours), FadeIn(point), Create(uphill), FadeIn(caption))
        self.wait(0.4)
        caption_down = Text("negative gradient moves downhill", font_size=26).to_edge(DOWN)
        self.play(Create(downhill), Transform(caption, caption_down))
        self.wait(0.4)

        path_points = [
            [-2.6, 1.7, 0],
            [-1.85, 1.18, 0],
            [-1.25, 0.78, 0],
            [-0.78, 0.48, 0],
            [-0.42, 0.25, 0],
            [-0.16, 0.08, 0],
        ]
        path = VGroup(*[Line(path_points[i], path_points[i + 1], color=YELLOW) for i in range(len(path_points) - 1)])
        dots = VGroup(*[Dot(p, color=WHITE, radius=0.045) for p in path_points[1:]])
        caption_path = Text("step size is controlled by learning rate", font_size=26).to_edge(DOWN)
        self.play(FadeOut(uphill), FadeOut(downhill), Transform(caption, caption_path), Create(path), FadeIn(dots))
        self.wait(0.6)


class TaylorPolynomialScene(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-3.5, 3.5, 1],
            y_range=[-1.6, 1.6, 0.5],
            x_length=9,
            y_length=4.4,
            tips=False,
            axis_config={"stroke_opacity": 0.55},
        )
        title = Text("Taylor polynomials are local models", font_size=31).to_edge(UP)
        sine_curve = axes.plot(lambda x: math.sin(x), color=BLUE, stroke_width=5)
        center_dot = Dot(axes.c2p(0, 0), color=GREEN)
        caption = Text("center at 0: match height and slope", font_size=25).to_edge(DOWN)

        self.play(FadeIn(title), FadeIn(axes), Create(sine_curve), FadeIn(center_dot), FadeIn(caption))
        self.wait(0.3)

        linear = axes.plot(lambda x: taylor_sin(x, 1), color=ORANGE, stroke_width=5)
        linear_caption = Text("degree 1: tangent line", font_size=25).to_edge(DOWN)
        self.play(Create(linear), Transform(caption, linear_caption))
        self.wait(0.4)

        cubic = axes.plot(lambda x: taylor_sin(x, 3), color=ORANGE, stroke_width=5)
        cubic_caption = Text("degree 3: adds curvature correction", font_size=25).to_edge(DOWN)
        self.play(Transform(linear, cubic), Transform(caption, cubic_caption))
        self.wait(0.4)

        fifth = axes.plot(lambda x: taylor_sin(x, 5), color=ORANGE, stroke_width=5)
        window = axes.plot(lambda x: math.sin(x), x_range=[-1.2, 1.2], color=WHITE, stroke_width=8)
        final_caption = Text("degree 5: closer near the center", font_size=25).to_edge(DOWN)
        self.play(Transform(linear, fifth), Create(window), Transform(caption, final_caption))
        self.wait(0.7)
