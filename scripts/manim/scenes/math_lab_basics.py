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
    LEFT,
    Line,
    NumberPlane,
    RIGHT,
    RoundedRectangle,
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


class VectorSpanNormScene(Scene):
    def construct(self):
        plane = NumberPlane(
            x_range=[-4, 4, 1],
            y_range=[-3, 3, 1],
            background_line_style={"stroke_opacity": 0.2},
        )
        title = Text("Span asks where combinations can reach", font_size=31).to_edge(UP)
        v1 = Arrow(plane.c2p(0, 0), plane.c2p(2.2, 0.8), color=BLUE, buff=0)
        v2 = Arrow(plane.c2p(0, 0), plane.c2p(-0.7, 1.9), color=GREEN, buff=0)
        combo = Arrow(plane.c2p(0, 0), plane.c2p(1.5, 2.7), color=ORANGE, buff=0)
        parallelogram = VGroup(
            Line(plane.c2p(2.2, 0.8), plane.c2p(1.5, 2.7), color=WHITE, stroke_opacity=0.58),
            Line(plane.c2p(-0.7, 1.9), plane.c2p(1.5, 2.7), color=WHITE, stroke_opacity=0.58),
        )
        caption = Text("independent directions sweep out a plane", font_size=25).to_edge(DOWN)

        self.play(FadeIn(plane), FadeIn(title), Create(v1), Create(v2), FadeIn(caption))
        self.wait(0.3)
        self.play(Create(parallelogram), Create(combo))
        self.wait(0.4)

        v2_dependent = Arrow(plane.c2p(0, 0), plane.c2p(1.3, 0.47), color=GREEN, buff=0)
        span_line = Line(plane.c2p(-3.4, -1.24), plane.c2p(3.4, 1.24), color=YELLOW, stroke_width=7)
        collapse_caption = Text("dependent directions collapse span to a line", font_size=25).to_edge(DOWN)
        self.play(FadeOut(parallelogram), FadeOut(combo), Transform(v2, v2_dependent), Create(span_line), Transform(caption, collapse_caption))
        self.wait(0.5)

        true_vector = Arrow(plane.c2p(0, 0), plane.c2p(2.4, 1.6), color=BLUE, buff=0)
        approx_vector = Arrow(plane.c2p(0, 0), plane.c2p(1.7, 1.1), color=GREEN, buff=0)
        error_vector = Arrow(plane.c2p(1.7, 1.1), plane.c2p(2.4, 1.6), color=RED, buff=0)
        error_caption = Text("a norm turns the error vector into one size", font_size=25).to_edge(DOWN)
        self.play(
            FadeOut(v1),
            FadeOut(v2),
            FadeOut(span_line),
            Create(true_vector),
            Create(approx_vector),
            Transform(caption, error_caption),
        )
        self.wait(0.3)
        self.play(Create(error_vector))
        self.wait(0.7)


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


class BeginnerDerivativeWindowScene(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-2.8, 2.8, 1],
            y_range=[-0.2, 3.2, 0.5],
            x_length=8.5,
            y_length=4.5,
            tips=False,
            axis_config={"stroke_opacity": 0.55},
        )
        title = Text("Derivative: shrink the window", font_size=31).to_edge(UP)
        curve = axes.plot(lambda x: 0.35 * (x - 0.25) ** 2 + 0.25, color=BLUE, stroke_width=5)
        x0 = 0.7
        y0 = 0.35 * (x0 - 0.25) ** 2 + 0.25
        slope = 0.7 * (x0 - 0.25)
        point = Dot(axes.c2p(x0, y0), color=YELLOW)
        question = Text("How can one point have a slope?", font_size=23).next_to(title, DOWN, buff=0.25)
        caption = Text("wide secant reads average change", font_size=25).to_edge(DOWN)

        self.play(FadeIn(title), FadeIn(question), FadeIn(axes), Create(curve), FadeIn(point), FadeIn(caption), run_time=3)
        self.wait(4)

        secant = None
        for h, label in [(1.2, "h = 1.2"), (0.55, "h = 0.55"), (0.18, "h = 0.18"), (0.06, "h = 0.06")]:
            yh = 0.35 * (x0 + h - 0.25) ** 2 + 0.25
            next_point = Dot(axes.c2p(x0 + h, yh), color=ORANGE)
            next_secant = Line(axes.c2p(x0, y0), axes.c2p(x0 + h, yh), color=ORANGE, stroke_width=6)
            next_caption = Text(f"{label}: window shrinks", font_size=25).to_edge(DOWN)
            if secant is None:
                secant = next_secant
                self.play(FadeOut(caption), run_time=0.3)
                caption = next_caption
                self.play(Create(secant), FadeIn(next_point), FadeIn(caption), run_time=3.7)
            else:
                self.play(FadeOut(caption), run_time=0.3)
                caption = next_caption
                self.play(Transform(secant, next_secant), FadeIn(next_point), FadeIn(caption), run_time=3.7)
            self.wait(2.5)

        tangent = Line(
            axes.c2p(x0 - 1.1, y0 - 1.1 * slope),
            axes.c2p(x0 + 1.1, y0 + 1.1 * slope),
            color=GREEN,
            stroke_width=7,
        )
        final_caption = Text("limit: tangent slope at this point", font_size=25).to_edge(DOWN)
        summary = Text("In training, this slope tells the parameter how loss changes.", font_size=23).next_to(axes, DOWN, buff=0.25)
        self.play(FadeOut(caption), run_time=0.3)
        caption = final_caption
        self.play(Create(tangent), FadeIn(caption), FadeOut(question), run_time=3.7)
        self.wait(3)
        self.play(FadeIn(summary), run_time=3)
        self.wait(5)


class BeginnerChainRuleBackpropScene(Scene):
    def construct(self):
        title = Text("Chain rule sends responsibility backward", font_size=30).to_edge(UP)
        labels = ["x", "z = w·x + b", "ŷ = σ(z)", "L"]
        nodes = VGroup()
        for index, label in enumerate(labels):
            box = RoundedRectangle(width=1.95, height=0.8, corner_radius=0.12, color=WHITE)
            text = Text(label, font_size=23)
            group = VGroup(box, text).move_to(LEFT * 4.2 + RIGHT * index * 2.75)
            nodes.add(group)
        forward = VGroup(
            *[Arrow(nodes[i].get_right(), nodes[i + 1].get_left(), color=BLUE, buff=0.08) for i in range(3)]
        )
        backward = VGroup(
            *[Arrow(nodes[i + 1].get_bottom(), nodes[i].get_bottom(), color=ORANGE, buff=0.08).shift(DOWN * 0.72) for i in range(3)]
        )
        setup = Text("Forward pass stores the local pieces.", font_size=23).next_to(title, DOWN, buff=0.25)
        caption = Text("forward pass computes values", font_size=25).to_edge(DOWN)

        self.play(FadeIn(title), FadeIn(setup), FadeIn(nodes), Create(forward), FadeIn(caption), run_time=3)
        self.wait(4)
        back_caption = Text("backward pass multiplies upstream gradient by local derivative", font_size=24).to_edge(DOWN)
        next_setup = Text("Backward pass reuses those pieces in reverse.", font_size=23).next_to(title, DOWN, buff=0.25)
        self.play(FadeOut(caption), FadeOut(setup), run_time=0.4)
        caption = back_caption
        setup = next_setup
        self.play(Create(backward), FadeIn(caption), FadeIn(setup), run_time=3.6)
        self.wait(5)
        chips = VGroup(
            Text("∂L/∂ŷ", font_size=24, color=GREEN).next_to(backward[2], DOWN, buff=0.28),
            Text("∂ŷ/∂z", font_size=24, color=GREEN).next_to(backward[1], DOWN, buff=0.28),
            Text("∂z/∂w", font_size=24, color=GREEN).next_to(backward[0], DOWN, buff=0.28),
        )
        final_caption = Text("multiply local pieces to get ∂L/∂w", font_size=25).to_edge(DOWN)
        self.play(FadeOut(caption), run_time=0.3)
        caption = final_caption
        self.play(FadeIn(chips), FadeIn(caption), run_time=3.7)
        self.wait(5)
        formula = Text("∂L/∂w = ∂L/∂ŷ × ∂ŷ/∂z × ∂z/∂w", font_size=24, color=YELLOW).next_to(nodes, UP, buff=0.62)
        bias_note = Text("∂L/∂b follows the same path, with ∂z/∂b = 1", font_size=23, color=GREEN).next_to(chips, DOWN, buff=0.42)
        self.play(FadeIn(formula), run_time=3)
        self.wait(5)
        self.play(FadeOut(caption), run_time=0.3)
        caption = Text("Backprop is chain rule bookkeeping on a graph.", font_size=25).to_edge(DOWN)
        self.play(FadeIn(bias_note), FadeIn(caption), run_time=2.7)
        self.wait(8)


class BeginnerLearningRateBehaviorScene(Scene):
    def construct(self):
        title = Text("Same slope, different step size", font_size=31).to_edge(UP)
        valley = VGroup(
            *[
                Circle(radius=radius, color=ORANGE, stroke_opacity=0.25).stretch(1.55, 0)
                for radius in [0.6, 1.0, 1.45, 1.95, 2.55]
            ]
        )
        labels = VGroup(
            Text("small η", font_size=23, color=YELLOW).shift(LEFT * 4 + UP * 2),
            Text("steady η", font_size=23, color=GREEN).shift(UP * 2),
            Text("large η", font_size=23, color=RED).shift(RIGHT * 4 + UP * 2),
        )
        caption = Text("learning rate controls how far the local slope is used", font_size=25).to_edge(DOWN)

        small_points = [[-4.8, 1.25, 0], [-4.25, 0.95, 0], [-3.82, 0.68, 0], [-3.48, 0.45, 0], [-3.2, 0.27, 0]]
        steady_points = [[-1.05, 1.25, 0], [-0.42, 0.45, 0], [-0.14, 0.14, 0], [0.0, 0.0, 0]]
        large_points = [[3.0, 1.25, 0], [4.55, 0.42, 0], [2.65, 0.72, 0], [4.25, 0.22, 0], [2.95, 0.48, 0]]
        small_path = VGroup(*[Line(small_points[i], small_points[i + 1], color=YELLOW, stroke_width=6) for i in range(len(small_points) - 1)])
        steady_path = VGroup(*[Line(steady_points[i], steady_points[i + 1], color=GREEN, stroke_width=6) for i in range(len(steady_points) - 1)])
        large_path = VGroup(*[Line(large_points[i], large_points[i + 1], color=RED, stroke_width=6) for i in range(len(large_points) - 1)])
        small_dots = VGroup(*[Dot(point, color=WHITE, radius=0.045) for point in small_points])
        steady_dots = VGroup(*[Dot(point, color=WHITE, radius=0.045) for point in steady_points])
        large_dots = VGroup(*[Dot(point, color=WHITE, radius=0.045) for point in large_points])

        self.play(FadeIn(title), FadeIn(valley), FadeIn(labels), FadeIn(caption), run_time=3)
        self.wait(4)
        small_caption = Text("small η: safe, but progress is slow", font_size=25).to_edge(DOWN)
        self.play(FadeOut(caption), run_time=0.3)
        caption = small_caption
        self.play(FadeIn(caption), Create(small_path), FadeIn(small_dots), run_time=4.7)
        self.wait(4)
        steady_caption = Text("steady η: reaches low loss in fewer steps", font_size=25).to_edge(DOWN)
        self.play(FadeOut(caption), run_time=0.3)
        caption = steady_caption
        self.play(FadeIn(caption), Create(steady_path), FadeIn(steady_dots), run_time=4.7)
        self.wait(4)
        large_caption = Text("large η: jumps across the valley and oscillates", font_size=25).to_edge(DOWN)
        self.play(FadeOut(caption), run_time=0.3)
        caption = large_caption
        self.play(FadeIn(caption), Create(large_path), FadeIn(large_dots), run_time=4.7)
        self.wait(4)
        final_caption = Text("A learning rate decides how far to trust one local slope.", font_size=25).to_edge(DOWN)
        self.play(FadeOut(caption), run_time=0.3)
        caption = final_caption
        self.play(FadeIn(caption), run_time=2.7)
        self.wait(8)


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


class MonteCarloSamplingScene(Scene):
    def construct(self):
        axes = Axes(
            x_range=[0, 1.05, 0.25],
            y_range=[0, 1.05, 0.25],
            x_length=4.8,
            y_length=4.8,
            tips=False,
            axis_config={"stroke_opacity": 0.55},
        ).shift(DOWN * 0.15)
        title = Text("Monte Carlo turns area into a count", font_size=31).to_edge(UP)
        square = VGroup(
            Line(axes.c2p(0, 0), axes.c2p(1, 0), color=WHITE, stroke_opacity=0.7),
            Line(axes.c2p(1, 0), axes.c2p(1, 1), color=WHITE, stroke_opacity=0.7),
            Line(axes.c2p(1, 1), axes.c2p(0, 1), color=WHITE, stroke_opacity=0.7),
            Line(axes.c2p(0, 1), axes.c2p(0, 0), color=WHITE, stroke_opacity=0.7),
        )
        arc = axes.plot(lambda x: math.sqrt(max(0, 1 - x * x)), x_range=[0, 1], color=GREEN, stroke_width=6)
        caption = Text("count points inside the quarter circle", font_size=25).to_edge(DOWN)

        samples = [
            (0.07, 0.18), (0.14, 0.82), (0.22, 0.41), (0.31, 0.92), (0.38, 0.12),
            (0.46, 0.55), (0.53, 0.73), (0.61, 0.22), (0.68, 0.64), (0.75, 0.33),
            (0.82, 0.49), (0.88, 0.18), (0.94, 0.79), (0.17, 0.24), (0.28, 0.68),
            (0.35, 0.35), (0.43, 0.87), (0.57, 0.46), (0.65, 0.83), (0.72, 0.11),
            (0.84, 0.38), (0.91, 0.55), (0.11, 0.57), (0.24, 0.91), (0.49, 0.28),
            (0.58, 0.66), (0.69, 0.72), (0.77, 0.58), (0.86, 0.08), (0.96, 0.29),
        ]
        dots = VGroup(
            *[
                Dot(
                    axes.c2p(x, y),
                    radius=0.042,
                    color=BLUE if x * x + y * y <= 1 else ORANGE,
                )
                for x, y in samples
            ]
        )
        inside_count = sum(1 for x, y in samples if x * x + y * y <= 1)
        counter = Text(f"{inside_count} of {len(samples)} samples land inside", font_size=25).to_edge(DOWN)
        pi_caption = Text("the fraction becomes an area estimate", font_size=25).to_edge(DOWN)

        self.play(FadeIn(title), FadeIn(axes), Create(square), Create(arc), FadeIn(caption))
        self.wait(0.3)
        self.play(FadeIn(VGroup(*dots[:10])), run_time=0.8)
        self.play(FadeIn(VGroup(*dots[10:20])), run_time=0.8)
        self.play(FadeIn(VGroup(*dots[20:])), Transform(caption, counter), run_time=0.8)
        self.wait(0.4)
        self.play(Transform(caption, pi_caption))
        self.wait(0.6)
