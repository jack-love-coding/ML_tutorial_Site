"""Language-neutral optimizer-state animations backed by the shared PR1 traces."""

from __future__ import annotations

import json
from pathlib import Path

from manim import *


ROOT = Path(__file__).resolve().parents[3]
TRAJECTORIES = ROOT / "public/notebooks/optimizer-comparison/optimizer-comparison-trajectories.json"


def numeric_anchor(kind: str) -> dict:
    """Read the first practical step, rather than copying numbers into a scene."""
    rows = json.loads(TRAJECTORIES.read_text(encoding="utf-8"))["rows"]
    return next(
        row for row in rows
        if row["comparison"] == "predeclared-practical" and row["optimizer"] == kind and row["update"] == 1
    )


class OptimizerStateScene(Scene):
    KIND = "sgd"
    DISPLAY = "SGD"
    EQUATION = r"\theta_{t+1}=\theta_t-\eta g_t"
    STATE_LABEL = r"g_t"
    SHAPE = "circle"

    def construct(self):
        anchor = numeric_anchor(self.KIND)
        self.camera.background_color = "#f7f9fc"
        formula = MathTex(self.EQUATION, font_size=43, color="#285c9e").to_edge(UP, buff=0.45)
        terrain = self.terrain()
        axes = terrain[0]
        marker = self.marker().move_to(axes.c2p(-2.45, 2.2))
        start = marker.get_center()
        middle = axes.c2p(-0.7, 0.48)
        target = axes.c2p(0.7, -0.15)
        path = VMobject(color="#253858", stroke_width=6).set_points_as_corners([start, middle, target])
        state = self.state_card(anchor)
        legend = self.legend()

        self.play(Write(formula), Create(terrain), FadeIn(legend), run_time=3)
        self.play(FadeIn(marker), Create(path), run_time=4)
        self.play(FadeIn(state, shift=UP * 0.2), run_time=2)
        self.wait(4)
        self.play(marker.animate.move_to(middle), Indicate(state, color="#c47b13"), run_time=4)
        self.wait(4)
        self.play(marker.animate.move_to(target), Flash(target, color="#2e7d4f", flash_radius=0.5), run_time=4)
        insight = MathTex(r"\theta_t\;\longrightarrow\;\theta_{t+1}", font_size=38, color="#142033").to_edge(DOWN, buff=0.4)
        self.play(FadeIn(insight), run_time=2)
        self.wait(13)

    def terrain(self):
        axes = Axes(
            x_range=[-3, 3, 1], y_range=[-2.2, 2.8, 1], x_length=7.8, y_length=4.6,
            axis_config={"color": "#8693a7", "include_ticks": False}, tips=False,
        ).shift(LEFT * 2.05 + DOWN * 0.55)
        contours = VGroup(*[
            Ellipse(width=6.4 - index * 0.9, height=3.5 - index * 0.46, color="#b4c2d5", stroke_width=2)
            .move_to(axes.c2p(0.2, 0.15))
            for index in range(5)
        ])
        contours[-1].set_color("#5b8dc9")
        minimum = Star(n=4, outer_radius=0.18, inner_radius=0.05, color="#2e7d4f", fill_opacity=1).move_to(axes.c2p(0.7, -0.15))
        return VGroup(axes, contours, minimum).set_z_index(0)

    def marker(self):
        if self.SHAPE == "square":
            return Square(side_length=0.26, color="#c05931", fill_opacity=1)
        if self.SHAPE == "triangle":
            return Triangle(color="#6a4c93", fill_opacity=1).scale(0.18)
        if self.SHAPE == "diamond":
            return Square(side_length=0.25, color="#1d7b78", fill_opacity=1).rotate(PI / 4)
        return Dot(radius=0.14, color="#285c9e")

    def state_card(self, anchor):
        update = f"{anchor['updateNorm']:.6f}"
        loss = f"{anchor['trainLoss']:.6f}"
        rows = VGroup(
            MathTex(self.STATE_LABEL, font_size=35, color="#142033"),
            MathTex(rf"\left\lVert\Delta\theta_1\right\rVert={update}", font_size=29, color="#142033"),
            MathTex(rf"L(\theta_1)={loss}", font_size=29, color="#142033"),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.17)
        card = rows
        card.add_background_rectangle(color=WHITE, opacity=0.98, buff=0.3).to_edge(RIGHT, buff=0.55).shift(DOWN * 0.45)
        return card

    def legend(self):
        dot = self.marker().scale(0.72)
        label = MathTex(r"\theta_t", font_size=31, color="#384861")
        return VGroup(dot, label).arrange(RIGHT, buff=0.15).to_corner(UL, buff=0.42)


class SgdStateScene(OptimizerStateScene):
    KIND = "sgd"
    DISPLAY = "SGD"
    EQUATION = r"\theta_{t+1}=\theta_t-\eta g_t"
    STATE_LABEL = r"g_t"
    SHAPE = "circle"


class MomentumStateScene(OptimizerStateScene):
    KIND = "momentum"
    DISPLAY = "Momentum"
    EQUATION = r"v_t=0.9v_{t-1}+g_t\quad;\quad\theta_{t+1}=\theta_t-\eta v_t"
    STATE_LABEL = r"v_t"
    SHAPE = "square"


class RmspropStateScene(OptimizerStateScene):
    KIND = "rmsprop"
    DISPLAY = "RMSProp"
    EQUATION = r"s_t=0.95s_{t-1}+0.05g_t^2\quad;\quad\theta_{t+1}=\theta_t-\eta\frac{g_t}{\sqrt{s_t}+\epsilon}"
    STATE_LABEL = r"s_t"
    SHAPE = "triangle"


class AdamStateScene(OptimizerStateScene):
    KIND = "adam"
    DISPLAY = "Adam"
    EQUATION = r"m_t, v_t\rightarrow\hat m_t,\hat v_t\quad;\quad\theta_{t+1}=\theta_t-\eta\frac{\hat m_t}{\sqrt{\hat v_t}+\epsilon}"
    STATE_LABEL = r"m_t, v_t, t"
    SHAPE = "diamond"
