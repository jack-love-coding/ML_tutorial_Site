"""Manifest-bound, language-neutral Manim scenes for Phase 29 logistic regression.

Each scene reads its numerical labels from the published Banknote package at
construction time. This prevents a copied number in an animation from quietly
drifting away from the reproducible Notebook and interaction assets.
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path
from typing import Any

from manim import (
    BLUE, GREEN, ORANGE, RED, WHITE,
    Axes, Create, DashedLine, Dot, FadeIn, FadeOut, Line, MathTex,
    Rectangle, Scene, Transform, UP, DOWN, LEFT, RIGHT, VGroup, Write,
)


ROOT = Path(__file__).resolve().parents[3]
PHASE_DIR = ROOT / "public" / "logistic-regression" / "phase-29"
MANIFEST_PATH = PHASE_DIR / "manifest.json"
CONTRACT_VERSION = "logistic-regression-phase-29-v1"

# Color roles are repeated in every scene. Shape and line-style changes also
# communicate state, so color is never the sole teaching signal.
PALETTE = {"score": BLUE, "probability": GREEN, "loss": RED, "gradient": ORANGE, "structure": WHITE}

SCENE_ANCHORS = {
    "linear-score-to-sigmoid": {
        "linear-score": "phase29-linear-score",
        "sigmoid-probability": "phase29-sigmoid-probability",
    },
    "likelihood-to-bce-gradient": {
        "threshold-decisions": "phase29-threshold-decisions",
        "log-loss": "phase29-log-loss",
    },
    "log-loss-confident-mistake": {"log-loss": "phase29-log-loss"},
    "regularization-confidence-field": {"regularization": "phase29-regularization"},
}


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_phase29_anchors(scene_id: str) -> dict[str, Any]:
    """Load verified JSON anchors for one scene without importing browser code."""
    if scene_id not in SCENE_ANCHORS:
        raise ValueError(f"Unknown logistic media scene: {scene_id}")
    if not MANIFEST_PATH.is_file():
        raise RuntimeError(f"Missing Phase 29 manifest: {MANIFEST_PATH}")
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if manifest.get("contractVersion") != CONTRACT_VERSION:
        raise RuntimeError("Phase 29 manifest contract version drifted")
    records = {record.get("id"): record for record in manifest.get("assets", [])}
    anchors: dict[str, Any] = {}
    for asset_id, expected_cell in SCENE_ANCHORS[scene_id].items():
        record = records.get(asset_id)
        if not isinstance(record, dict):
            raise RuntimeError(f"Missing manifest asset for {asset_id}")
        if record.get("sourceCellId") != expected_cell:
            raise RuntimeError(f"Source cell drift for {asset_id}")
        relative_path = record.get("path")
        if not isinstance(relative_path, str) or relative_path.startswith("/") or ".." in Path(relative_path).parts:
            raise RuntimeError(f"Unsafe manifest path for {asset_id}")
        path = PHASE_DIR / relative_path
        if not path.is_file() or record.get("sha256") != _sha256(path):
            raise RuntimeError(f"Interaction hash drift for {asset_id}")
        payload = json.loads(path.read_text(encoding="utf-8"))
        if payload.get("id") != asset_id or payload.get("sceneId") != asset_id or payload.get("sourceCellId") != expected_cell:
            raise RuntimeError(f"Interaction identity drift for {asset_id}")
        anchors[asset_id] = payload
    return anchors


def _fmt(value: float, digits: int = 4) -> str:
    if not math.isfinite(value):
        raise ValueError("Media anchors must be finite")
    return f"{value:.{digits}f}"


def _equation(tex: str, color=WHITE, scale: float = 0.9) -> MathTex:
    return MathTex(tex, color=color).scale(scale)


class LinearScoreToSigmoidScene(Scene):
    """Weighted score, log-odds, and bounded probability for the canonical row."""

    def construct(self) -> None:
        anchors = load_phase29_anchors("linear-score-to-sigmoid")
        row = anchors["linear-score"]["data"]["oneRow"]
        probability, logit = float(row["probability"]), float(row["logit"])

        formula = _equation(r"z=\mathbf{w}^{\top}\mathbf{x}+b", PALETTE["score"]).to_edge(UP)
        log_odds = _equation(r"z=\log\frac{p}{1-p}", PALETTE["score"], 0.72).next_to(formula, DOWN, buff=0.22)
        number_line = Line(LEFT * 5.7 + DOWN * 1.55, RIGHT * 5.7 + DOWN * 1.55, color=WHITE, stroke_width=4)
        zero_tick = Line(DOWN * 1.78, DOWN * 1.3, color=WHITE, stroke_width=4)
        score_dot = Dot(number_line.get_left(), color=PALETTE["score"], radius=0.12)
        score_label = _equation(rf"z={_fmt(logit, 2)}", PALETTE["score"], 0.65).next_to(score_dot, UP, buff=0.18)
        dashed = DashedLine(score_dot.get_center(), number_line.get_center(), color=PALETTE["score"], dash_length=0.12)
        score_card = VGroup(
            Rectangle(width=3.5, height=1.1, color=PALETTE["score"], stroke_width=3),
            _equation(rf"\sigma({_fmt(logit, 2)})={probability:.2e}", PALETTE["probability"], 0.52),
        ).arrange(DOWN, buff=0).to_edge(DOWN)

        axes = Axes(x_range=[-8, 8, 2], y_range=[0, 1, 0.25], x_length=9.2, y_length=3.2, tips=False, axis_config={"stroke_color": WHITE, "stroke_opacity": 0.55}).shift(RIGHT * 1.2)
        curve = axes.plot(lambda z: 1 / (1 + math.exp(-z)), x_range=[-8, 8], color=PALETTE["probability"], stroke_width=6)
        half = DashedLine(axes.c2p(-8, 0.5), axes.c2p(8, 0.5), color=WHITE, dash_length=0.12)
        neutral = Dot(axes.c2p(0, 0.5), color=WHITE, radius=0.09)
        neutral_label = _equation(r"z=0\;\Longleftrightarrow\;p=0.5", WHITE, 0.56).next_to(neutral, UP, buff=0.15)
        clipped_dot = Dot(axes.c2p(-8, 1 / (1 + math.exp(8))), color=PALETTE["score"], radius=0.09)

        self.play(Write(formula), FadeIn(log_odds), Create(number_line), FadeIn(zero_tick))
        self.play(FadeIn(score_dot), FadeIn(score_label), Create(dashed), FadeIn(score_card))
        self.wait(1)
        self.play(FadeOut(number_line), FadeOut(zero_tick), FadeOut(score_dot), FadeOut(score_label), FadeOut(dashed))
        self.play(FadeIn(axes), Create(curve), Create(half), FadeIn(neutral), FadeIn(neutral_label))
        self.play(FadeIn(clipped_dot))
        # Keep the completed visual as the learner-controlled poster frame.
        self.wait(36.067)


class LikelihoodBceGradientScene(Scene):
    """Bernoulli product → log-sum → stable BCE → batch gradient direction."""

    def construct(self) -> None:
        anchors = load_phase29_anchors("likelihood-to-bce-gradient")
        likelihood, gradient = anchors["threshold-decisions"]["data"], anchors["log-loss"]["data"]
        rows = likelihood["likelihoodRows"]
        product, log_sum = float(likelihood["probabilityProduct"]), float(likelihood["logLikelihood"])
        bce = float(gradient["finiteDifference"]["objective"])
        sample_gradient = gradient["finiteDifference"]["steps"][5]["analyticGradient"]

        bernoulli = _equation(r"P(y\mid p)=p^y(1-p)^{1-y}", PALETTE["probability"], 0.78).to_edge(UP)
        terms = VGroup(*[_equation(rf"q_{{{i + 1}}}={float(row['probabilityTerm']):.4f}", PALETTE["probability"], 0.54) for i, row in enumerate(rows)]).arrange(RIGHT, buff=0.34).shift(UP * 1.35)
        product_formula = _equation(rf"\prod_i q_i={product:.6f}", PALETTE["loss"], 0.7).shift(UP * 0.32)
        log_formula = _equation(rf"\sum_i\log q_i={log_sum:.4f}", PALETTE["score"], 0.7).shift(DOWN * 0.5)
        bce_formula = _equation(rf"\mathrm{{BCE}}=\operatorname{{softplus}}(z)-yz={bce:.4f}", PALETTE["loss"], 0.58).shift(DOWN * 1.42)
        arrow = Line(LEFT * 4.5 + DOWN * 2.35, RIGHT * 4.5 + DOWN * 2.35, color=PALETTE["gradient"], stroke_width=6)
        row_gradient = _equation(r"\nabla_w\ell_i=(p_i-y_i)x_i", PALETTE["gradient"], 0.56).next_to(arrow, UP, buff=0.18)
        gradient_label = _equation(rf"\nabla L=\frac{{X^\top(p-y)}}{{n}}\quad g_1={float(sample_gradient[0]):.4f}", PALETTE["gradient"], 0.58).next_to(arrow, UP, buff=0.18)
        descent = _equation(r"\theta\leftarrow\theta-\eta\nabla L", PALETTE["gradient"], 0.74).next_to(arrow, DOWN, buff=0.18)

        self.play(Write(bernoulli), FadeIn(terms))
        self.play(Write(product_formula), Write(log_formula))
        self.play(Write(bce_formula))
        self.play(Create(arrow), FadeIn(row_gradient), Write(descent))
        self.play(Transform(row_gradient, gradient_label))
        self.wait(40)


class ConfidentMistakeScene(Scene):
    """Stable logit-domain loss, finite differences, and a high-loss cue."""

    def construct(self) -> None:
        anchors = load_phase29_anchors("log-loss-confident-mistake")
        data = anchors["log-loss"]["data"]
        acceptance = data["finiteDifference"]["acceptance"]
        h, error = float(acceptance["h"]), float(acceptance["observed"])
        objective = float(data["finiteDifference"]["objective"])

        axes = Axes(x_range=[-7, 7, 2], y_range=[0, 7, 1], x_length=9.6, y_length=4.0, tips=False, axis_config={"stroke_color": WHITE, "stroke_opacity": 0.55}).shift(DOWN * 0.55)
        loss_curve = axes.plot(lambda z: math.log1p(math.exp(min(30, max(-30, z)))), x_range=[-7, 7], color=PALETTE["loss"], stroke_width=6)
        formula = _equation(r"\ell(z,y)=\operatorname{softplus}(z)-yz", PALETTE["loss"], 0.78).to_edge(UP)
        stable = _equation(rf"L(\theta)={objective:.4f}", PALETTE["loss"], 0.62).next_to(formula, DOWN, buff=0.2)
        check = _equation(rf"\frac{{L(\theta+h e_j)-L(\theta-h e_j)}}{{2h}}\approx\frac{{\partial L}}{{\partial\theta_j}}\quad h={h:.0e},\;|\Delta|={error:.2e}", PALETTE["gradient"], 0.48).to_edge(DOWN)
        marker = Dot(axes.c2p(4.5, math.log1p(math.exp(4.5))), color=PALETTE["loss"], radius=0.1)
        marker_line = DashedLine(axes.c2p(4.5, 0), marker.get_center(), color=PALETTE["loss"], dash_length=0.12)

        self.play(Write(formula), FadeIn(stable), FadeIn(axes), Create(loss_curve))
        self.play(FadeIn(marker), Create(marker_line), Write(check))
        self.wait(33.333)


class RegularizationConfidenceScene(Scene):
    """Show L2 as a changed objective with separately labeled parameter states."""

    def construct(self) -> None:
        anchors = load_phase29_anchors("regularization-confidence-field")
        l2, scratch = anchors["regularization"]["data"]["l2"], anchors["regularization"]["data"]["scratch"]
        l2_strength, l2_loss = float(l2["l2"]), float(l2["objectiveValue"])
        scratch_loss = float(scratch["trace"][-1]["objective"])

        objective = _equation(rf"L_{{L2}}=\mathrm{{BCE}}+\frac{{{l2_strength:.2f}}}{{2}}\lVert\mathbf{{w}}\rVert_2^2", PALETTE["gradient"], 0.76).to_edge(UP)
        left = Rectangle(width=4.6, height=4.3, color=PALETTE["score"], stroke_width=3).shift(LEFT * 2.7 + DOWN * 0.65)
        right = Rectangle(width=4.6, height=4.3, color=PALETTE["gradient"], stroke_width=3).shift(RIGHT * 2.7 + DOWN * 0.65)
        left_line = Line(left.get_bottom() + RIGHT * 0.6, left.get_top() + LEFT * 0.6, color=PALETTE["score"], stroke_width=7)
        right_line = DashedLine(right.get_bottom() + RIGHT * 0.6, right.get_top() + LEFT * 0.6, color=PALETTE["gradient"], stroke_width=7, dash_length=0.15)
        left_label = _equation(rf"\mathrm{{BCE}}={scratch_loss:.4f}", PALETTE["score"], 0.55).next_to(left, DOWN, buff=0.15)
        right_label = _equation(rf"L_{{L2}}={l2_loss:.4f}", PALETTE["gradient"], 0.55).next_to(right, DOWN, buff=0.15)
        dots = VGroup(*[Dot(point, radius=0.07, color=PALETTE["probability"]) for point in [left.get_center()+LEFT+DOWN*.65, left.get_center()+RIGHT*.5+UP*.85, right.get_center()+LEFT+DOWN*.65, right.get_center()+RIGHT*.5+UP*.85]])
        distinction = _equation(r"\text{same data}\;\not\Rightarrow\;\text{same objective}", WHITE, 0.54).to_edge(DOWN)

        self.play(Write(objective), Create(left), Create(right), FadeIn(dots))
        self.play(Create(left_line), Create(right_line), FadeIn(left_label), FadeIn(right_label))
        self.play(Write(distinction))
        self.wait(34.333)
