from manim import (
    Arrow, Axes, Circle, Create, DashedLine, DecimalNumber, Dot, DOWN, FadeIn,
    FadeOut, GREEN, GrowArrow, LaggedStart, LEFT, Line, MathTex, ORANGE,
    PURPLE, ReplacementTransform, RIGHT, Scene, Text, Transform, UP, VGroup,
    WHITE, Write,
)


class GradientRuleDeepDiveScene(Scene):
    BACKGROUND = "#F7F8FA"
    INK = "#172033"
    MUTED = "#667085"
    PREDICTION = "#256BD9"
    ERROR = "#E26D3D"
    GRADIENT = "#7C3AED"
    UPDATE = "#2F855A"

    def construct(self):
        self.camera.background_color = self.BACKGROUND

        self.next_section("data-model")
        formula = MathTex(r"\hat y=wx+b", color=self.INK, font_size=54).to_edge(UP, buff=0.35)
        params = MathTex(r"(w,b)=(6,47)", color=self.PREDICTION, font_size=42).next_to(formula, DOWN, buff=0.25)
        table = MathTex(
            r"\begin{array}{c|ccccc}x&1&2&3&4&5\\y&52&59&65&72&78\end{array}",
            color=self.INK,
            font_size=43,
        ).move_to(0.25 * DOWN)
        self.play(Write(formula), FadeIn(params, shift=0.2 * DOWN), run_time=2.5)
        self.play(Write(table), run_time=3.0)
        self.wait(5.5)

        self.next_section("prediction-error")
        predictions = MathTex(
            r"\hat{\mathbf y}=[53,59,65,71,77]",
            color=self.PREDICTION,
            font_size=43,
        ).move_to(0.15 * UP)
        residuals = MathTex(
            r"\mathbf r=\mathbf y-\hat{\mathbf y}=[-1,0,0,1,1]",
            color=self.ERROR,
            font_size=40,
        ).next_to(predictions, DOWN, buff=0.45)
        loss = MathTex(r"L=\frac{1}{5}\sum_{i=1}^{5}r_i^2=0.600000", color=self.ERROR, font_size=43).next_to(residuals, DOWN, buff=0.45)
        self.play(FadeOut(table), ReplacementTransform(params, predictions), run_time=2.5)
        self.play(Write(residuals), run_time=2.5)
        self.play(Write(loss), run_time=2.5)
        self.wait(4.5)

        self.next_section("loss-slice")
        self.play(FadeOut(formula), FadeOut(predictions), FadeOut(residuals), FadeOut(loss), run_time=1.5)
        axes = Axes(
            x_range=[4, 8.1, 1], y_range=[0, 11, 2], x_length=9.2, y_length=5.5,
            axis_config={"color": self.MUTED, "include_numbers": True, "font_size": 24},
        ).shift(0.4 * DOWN)
        curve = axes.plot(
            lambda w: sum((target - (w * x_value + 47)) ** 2 for x_value, target in [(1, 52), (2, 59), (3, 65), (4, 72), (5, 78)]) / 5,
            x_range=[4, 8],
            color=self.ERROR,
        )
        current = Dot(axes.c2p(6, 0.6), color=self.GRADIENT, radius=0.11)
        optimum = Dot(axes.c2p(6.5, 0.1), color=self.UPDATE, radius=0.1)
        labels = VGroup(
            MathTex(r"L(w,47)", color=self.ERROR, font_size=38).to_corner(UP + LEFT),
            MathTex(r"(6,0.6)", color=self.GRADIENT, font_size=32).next_to(current, UP + LEFT),
            MathTex(r"(6.5,0.06)", color=self.UPDATE, font_size=31).next_to(optimum, DOWN + RIGHT),
        )
        self.play(Create(axes), Create(curve), run_time=3.0)
        self.play(FadeIn(current), FadeIn(optimum), FadeIn(labels), run_time=2.5)
        self.wait(6.5)

        self.next_section("uphill-gradient")
        tangent = Line(axes.c2p(5.35, 2.68), axes.c2p(6.55, -1.16), color=self.GRADIENT, stroke_width=5)
        uphill = Arrow(axes.c2p(6, 0.6), axes.c2p(5.35, 2.68), color=self.GRADIENT, stroke_width=8, buff=0.02)
        gradient_label = MathTex(r"\nabla L=(-3.2,-0.4)", color=self.GRADIENT, font_size=42).to_corner(UP + RIGHT)
        self.play(Create(tangent), GrowArrow(uphill), Write(gradient_label), run_time=3.5)
        self.wait(8.5)

        self.next_section("negative-direction")
        downhill = Arrow(axes.c2p(6, 0.6), axes.c2p(6.45, 0.12), color=self.UPDATE, stroke_width=9, buff=0.02)
        update_rule = MathTex(r"\theta_{t+1}=\theta_t-\eta\nabla L(\theta_t)", color=self.INK, font_size=46).to_edge(DOWN, buff=0.25)
        minus = MathTex(r"-\nabla L", color=self.UPDATE, font_size=42).next_to(downhill, UP + RIGHT)
        self.play(uphill.animate.set_opacity(0.28), tangent.animate.set_opacity(0.28), GrowArrow(downhill), run_time=3.0)
        self.play(Write(update_rule), FadeIn(minus), run_time=2.5)
        self.wait(6.5)

        self.next_section("learning-rate")
        eta = MathTex(r"\eta=0.02", color=self.UPDATE, font_size=45).to_corner(DOWN + LEFT)
        delta = MathTex(r"-\eta\nabla L=(0.064,0.008)", color=self.UPDATE, font_size=42).next_to(eta, UP, aligned_edge=LEFT)
        self.play(Write(eta), Write(delta), run_time=3.0)
        self.play(downhill.animate.scale(0.72, about_point=downhill.get_start()), run_time=2.0)
        self.wait(7.0)

        self.next_section("update-verify")
        self.play(*[FadeOut(mob) for mob in list(self.mobjects)], run_time=1.5)
        before = MathTex(r"(w,b)=(6,47)", color=self.GRADIENT, font_size=50).shift(1.6 * UP)
        arrow = Arrow(1.1 * LEFT + 0.4 * UP, 1.1 * RIGHT + 0.4 * UP, color=self.UPDATE, stroke_width=8)
        after = MathTex(r"(w,b)=(6.064,47.008)", color=self.UPDATE, font_size=50).shift(0.25 * DOWN)
        old_loss = MathTex(r"0.600000", color=self.ERROR, font_size=56).shift(2.0 * DOWN + 2.0 * LEFT)
        loss_arrow = Arrow(0.9 * LEFT + 2.0 * DOWN, 0.9 * RIGHT + 2.0 * DOWN, color=self.UPDATE, stroke_width=7)
        new_loss = MathTex(r"0.440192", color=self.UPDATE, font_size=56).shift(2.0 * DOWN + 2.0 * RIGHT)
        reference = MathTex(r"L_{\mathrm{LS}}=0.060000", color=self.MUTED, font_size=34).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(before), GrowArrow(arrow), FadeIn(after), run_time=3.0)
        self.play(FadeIn(old_loss), GrowArrow(loss_arrow), FadeIn(new_loss), run_time=3.0)
        self.play(FadeIn(reference), run_time=1.5)
        self.wait(2.5)
