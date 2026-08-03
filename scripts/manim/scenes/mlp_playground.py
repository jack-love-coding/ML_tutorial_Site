from __future__ import annotations

import math

from manim import (
    BLUE,
    DOWN,
    GREY_B,
    GREY_D,
    GREEN,
    LEFT,
    ORANGE,
    RED,
    RIGHT,
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
    GrowArrow,
    Indicate,
    LaggedStart,
    Line,
    MathTex,
    NumberPlane,
    Rectangle,
    RoundedRectangle,
    Scene,
    SurroundingRectangle,
    Text,
    Transform,
    VGroup,
    Write,
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
    INK = "#172033"
    MUTED = "#667085"
    FORWARD = "#256BD9"
    LOCAL = "#287C55"
    GRADIENT = "#C74E2D"
    PARAMETER = "#7655B5"
    SURFACE = "#FFFFFF"
    BACKGROUND = "#F6F7F9"

    def make_node(self, symbol: str, value: str, position, color: str = INK) -> VGroup:
        circle = Circle(radius=0.43, color=color, stroke_width=4, fill_color=self.SURFACE, fill_opacity=1)
        label = MathTex(symbol, font_size=31, color=self.INK)
        number = MathTex(value, font_size=22, color=self.MUTED).next_to(circle, DOWN, buff=0.12)
        return VGroup(circle, label, number).move_to(position)

    def make_forward_arrow(self, source: VGroup, target: VGroup) -> Arrow:
        return Arrow(
            source.get_right(),
            target.get_left(),
            buff=0.08,
            color=self.FORWARD,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.12,
        )

    def clear_stage(self, run_time: float = 1.2):
        self.play(*[FadeOut(mob) for mob in list(self.mobjects)], run_time=run_time)

    def construct(self):
        self.camera.background_color = self.BACKGROUND

        # 0:00-0:24 — forward computation and cache
        self.next_section("forward-cache")
        title = Text("BACKPROPAGATION", font_size=38, color=self.INK, weight="BOLD").to_edge(UP, buff=0.35)
        subtitle = MathTex(
            r"x \rightarrow z^{(1)} \rightarrow h \rightarrow z^{(2)} \rightarrow \hat y \rightarrow L",
            font_size=34,
            color=self.FORWARD,
        ).next_to(title, DOWN, buff=0.22)
        self.play(FadeIn(title, shift=0.25 * DOWN), Write(subtitle), run_time=3)
        self.wait(2)

        nodes = VGroup(
            self.make_node(r"x", r"1.2", 5.3 * LEFT + 0.15 * DOWN),
            self.make_node(r"z^{(1)}", r"0.640000", 3.2 * LEFT + 0.15 * DOWN),
            self.make_node(r"h", r"0.564900", 1.15 * LEFT + 0.15 * DOWN, self.LOCAL),
            self.make_node(r"z^{(2)}", r"0.671390", 1.15 * RIGHT + 0.15 * DOWN),
            self.make_node(r"\hat y", r"0.585893", 3.2 * RIGHT + 0.15 * DOWN, self.LOCAL),
            self.make_node(r"L", r"0.017278", 5.3 * RIGHT + 0.15 * DOWN, self.GRADIENT),
        )
        forward_arrows = VGroup(*[
            self.make_forward_arrow(nodes[index], nodes[index + 1]) for index in range(len(nodes) - 1)
        ])
        cache = VGroup(
            RoundedRectangle(width=10.8, height=0.7, corner_radius=0.12, color=GREY_B, fill_color=self.SURFACE, fill_opacity=1),
            MathTex(
                r"\mathrm{cache}:\quad x,\ z^{(1)},\ h,\ z^{(2)},\ \hat y,\ y",
                font_size=30,
                color=self.INK,
            ),
        ).arrange().to_edge(DOWN, buff=0.45)
        self.play(LaggedStart(*[FadeIn(node, shift=0.18 * UP) for node in nodes], lag_ratio=0.16), run_time=5)
        self.play(LaggedStart(*[GrowArrow(arrow) for arrow in forward_arrows], lag_ratio=0.15), run_time=4)
        self.play(FadeIn(cache, shift=0.2 * UP), run_time=2)
        self.wait(8)

        # 0:24-0:52 — output error and the first adjoint
        self.next_section("output-error")
        self.play(FadeOut(cache), nodes.animate.scale(0.78).shift(0.6 * UP), forward_arrows.animate.scale(0.78).shift(0.6 * UP), run_time=2)
        loss_equation = MathTex(
            r"L=\frac12(\hat y-y)^2",
            font_size=42,
            color=self.INK,
        ).move_to(1.25 * DOWN)
        output_derivative = MathTex(
            r"\bar{\hat y}=\frac{\partial L}{\partial \hat y}=\hat y-y=0.185893",
            font_size=37,
            color=self.GRADIENT,
        ).next_to(loss_equation, DOWN, buff=0.38)
        delta_two = MathTex(
            r"\delta^{(2)}=\bar{\hat y}(1-\hat y^2)=0.122081",
            font_size=37,
            color=self.GRADIENT,
        ).next_to(output_derivative, DOWN, buff=0.32)
        self.play(Write(loss_equation), run_time=4)
        self.play(Indicate(nodes[-1], color=self.GRADIENT), Write(output_derivative), run_time=5)
        reverse_one = Arrow(nodes[-1].get_left(), nodes[-2].get_right(), buff=0.08, color=self.GRADIENT, stroke_width=8)
        self.play(GrowArrow(reverse_one), Write(delta_two), run_time=5)
        local_box = SurroundingRectangle(delta_two, color=self.LOCAL, buff=0.14, stroke_width=4)
        local_label = MathTex(r"1-\hat y^2", font_size=28, color=self.LOCAL).next_to(local_box, RIGHT, buff=0.25)
        self.play(Create(local_box), FadeIn(local_label), run_time=3)
        self.wait(8)
        self.play(FadeOut(local_box), FadeOut(local_label), run_time=1)

        # 0:52-1:28 — scalar chain rule
        self.next_section("scalar-chain")
        self.play(FadeOut(loss_equation), FadeOut(output_derivative), delta_two.animate.to_edge(DOWN, buff=0.35), run_time=2)
        reverse_arrows = VGroup(
            reverse_one,
            Arrow(nodes[-2].get_left(), nodes[-3].get_right(), buff=0.08, color=self.GRADIENT, stroke_width=7),
            Arrow(nodes[-3].get_left(), nodes[-4].get_right(), buff=0.08, color=self.GRADIENT, stroke_width=7),
            Arrow(nodes[-4].get_left(), nodes[-5].get_right(), buff=0.08, color=self.GRADIENT, stroke_width=6),
            Arrow(nodes[-5].get_left(), nodes[-6].get_right(), buff=0.08, color=self.GRADIENT, stroke_width=6),
        )
        self.play(LaggedStart(*[GrowArrow(arrow) for arrow in reverse_arrows[1:]], lag_ratio=0.24), run_time=6)
        chain = VGroup(
            MathTex(r"\bar h=w^{(2)}\delta^{(2)}=0.134290", color=self.GRADIENT, font_size=31),
            MathTex(r"\delta^{(1)}=\bar h(1-h^2)=0.091436", color=self.GRADIENT, font_size=31),
            MathTex(r"\frac{\partial L}{\partial w^{(1)}}=\delta^{(1)}x=0.109724", color=self.PARAMETER, font_size=31),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.23).move_to(1.25 * DOWN)
        self.play(Write(chain[0]), run_time=4)
        self.play(Write(chain[1]), Indicate(nodes[2], color=self.LOCAL), run_time=5)
        self.play(Write(chain[2]), Indicate(nodes[0], color=self.PARAMETER), run_time=5)
        product = MathTex(
            r"\frac{\partial L}{\partial w^{(1)}}="
            r"\frac{\partial L}{\partial \hat y}"
            r"\frac{\partial \hat y}{\partial z^{(2)}}"
            r"\frac{\partial z^{(2)}}{\partial h}"
            r"\frac{\partial h}{\partial z^{(1)}}"
            r"\frac{\partial z^{(1)}}{\partial w^{(1)}}",
            font_size=29,
            color=self.INK,
        ).to_edge(DOWN, buff=0.12)
        self.play(FadeOut(delta_two), chain.animate.shift(0.4 * UP), Write(product), run_time=5)
        self.wait(9)

        # 1:28-2:00 — expanded graph and branch accumulation
        self.next_section("branch-sum")
        self.clear_stage()
        branch_title = MathTex(r"2\to2\to1", font_size=42, color=self.INK).to_edge(UP, buff=0.35)
        x_nodes = VGroup(
            self.make_node(r"x_1", r"1.0", 5 * LEFT + 1.25 * UP),
            self.make_node(r"x_2", r"-0.5", 5 * LEFT + 1.25 * DOWN),
        )
        z_nodes = VGroup(
            self.make_node(r"z^{(1)}_1", r"0.9", 2.7 * LEFT + 1.25 * UP),
            self.make_node(r"z^{(1)}_2", r"-0.9", 2.7 * LEFT + 1.25 * DOWN),
        )
        h_nodes = VGroup(
            self.make_node(r"h_1", r"0.716", 0.45 * LEFT + 1.25 * UP, self.LOCAL),
            self.make_node(r"h_2", r"-0.716", 0.45 * LEFT + 1.25 * DOWN, self.LOCAL),
        )
        z2_node = self.make_node(r"z^{(2)}", r"1.196", 2 * RIGHT, self.INK)
        yhat_node = self.make_node(r"\hat y", r"0.832", 4.35 * RIGHT, self.LOCAL)
        branch_links = VGroup()
        for source in x_nodes:
            for target in z_nodes:
                branch_links.add(self.make_forward_arrow(source, target))
        for source, target in zip(z_nodes, h_nodes):
            branch_links.add(self.make_forward_arrow(source, target))
        for source in h_nodes:
            branch_links.add(self.make_forward_arrow(source, z2_node))
        branch_links.add(self.make_forward_arrow(z2_node, yhat_node))
        self.play(FadeIn(branch_title), FadeIn(x_nodes), FadeIn(z_nodes), FadeIn(h_nodes), FadeIn(z2_node), FadeIn(yhat_node), run_time=4)
        self.play(LaggedStart(*[GrowArrow(link) for link in branch_links], lag_ratio=0.08), run_time=5)
        branch_back = VGroup(
            Arrow(z_nodes[0].get_left(), x_nodes[0].get_right(), buff=0.06, color=self.GRADIENT, stroke_width=8),
            Arrow(z_nodes[1].get_left(), x_nodes[0].get_right(), buff=0.06, color=self.GRADIENT, stroke_width=8),
        )
        self.play(LaggedStart(*[GrowArrow(arrow) for arrow in branch_back], lag_ratio=0.35), run_time=5)
        branch_formula = MathTex(
            r"\bar x_1="
            r"\delta^{(1)}_1W^{(1)}_{11}"
            r"+"
            r"\delta^{(1)}_2W^{(1)}_{21}",
            font_size=37,
            color=self.GRADIENT,
        ).to_edge(DOWN, buff=0.55)
        sum_box = SurroundingRectangle(branch_formula, color=self.GRADIENT, buff=0.16, stroke_width=4)
        self.play(Write(branch_formula), run_time=5)
        self.play(Create(sum_box), Indicate(x_nodes[0], color=self.GRADIENT), run_time=3)
        self.wait(8.8)

        # 2:00-2:28 — reverse mode and vector-Jacobian products
        self.next_section("reverse-vjp")
        self.clear_stage()
        vjp_title = MathTex(r"\mathrm{reverse\ mode}", font_size=44, color=self.INK).to_edge(UP, buff=0.35)
        tape_symbols = [r"x", r"z^{(1)}", r"h", r"z^{(2)}", r"\hat y", r"L"]
        tape_cards = VGroup()
        for symbol in tape_symbols:
            card = RoundedRectangle(width=1.35, height=0.85, corner_radius=0.1, color=GREY_B, fill_color=self.SURFACE, fill_opacity=1)
            tape_cards.add(VGroup(card, MathTex(symbol, font_size=29, color=self.INK)))
        tape_cards.arrange(RIGHT, buff=0.32).move_to(0.75 * UP)
        forward_tape_arrow = Arrow(tape_cards.get_left() + 0.65 * DOWN, tape_cards.get_right() + 0.65 * DOWN, color=self.FORWARD, stroke_width=5)
        reverse_tape_arrow = Arrow(tape_cards.get_right() + 1.15 * DOWN, tape_cards.get_left() + 1.15 * DOWN, color=self.GRADIENT, stroke_width=7)
        self.play(FadeIn(vjp_title), LaggedStart(*[FadeIn(card, shift=0.15 * UP) for card in tape_cards], lag_ratio=0.12), run_time=5)
        self.play(GrowArrow(forward_tape_arrow), run_time=3)
        self.play(GrowArrow(reverse_tape_arrow), run_time=4)
        vjp_equation = MathTex(
            r"\bar{\mathbf u}\mathrel{+}=J_f(\mathbf u)^{\mathsf T}\bar{\mathbf v}",
            font_size=45,
            color=self.GRADIENT,
        ).move_to(1.35 * DOWN)
        self.play(Write(vjp_equation), run_time=5)
        plus_box = SurroundingRectangle(vjp_equation, color=self.LOCAL, buff=0.15, stroke_width=4)
        self.play(Create(plus_box), run_time=2)
        self.wait(7.8)

        # 2:28-2:50 — parameter update and a new forward pass
        self.next_section("parameter-update")
        self.clear_stage()
        update_title = MathTex(r"\theta_{\mathrm{new}}=\theta-\eta\nabla_\theta L", font_size=45, color=self.INK).to_edge(UP, buff=0.42)
        update_rows = VGroup(
            MathTex(r"w^{(1)}:\quad 0.700000\ -\ 0.1(0.109724)\ =\ 0.689028", font_size=33, color=self.PARAMETER),
            MathTex(r"b^{(1)}:\quad -0.200000\ -\ 0.1(0.091436)\ =\ -0.209144", font_size=33, color=self.PARAMETER),
            MathTex(r"w^{(2)}:\quad 1.100000\ -\ 0.1(0.068964)\ =\ 1.093104", font_size=33, color=self.PARAMETER),
            MathTex(r"b^{(2)}:\quad 0.050000\ -\ 0.1(0.122081)\ =\ 0.037792", font_size=33, color=self.PARAMETER),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3).move_to(0.15 * UP)
        loss_change = MathTex(
            r"L:\quad 0.017278\ \longrightarrow\ 0.013425",
            font_size=43,
            color=self.LOCAL,
        ).to_edge(DOWN, buff=0.65)
        self.play(Write(update_title), run_time=3)
        self.play(LaggedStart(*[Write(row) for row in update_rows], lag_ratio=0.25), run_time=7)
        self.play(Write(loss_change), run_time=4)
        self.play(Indicate(loss_change, color=self.LOCAL), run_time=3)
        final_box = Rectangle(width=12.2, height=6.2, color=self.LOCAL, stroke_width=5)
        self.play(Create(final_box), run_time=2)
        self.wait(4)


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
