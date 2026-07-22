"""Reading-safe deterministic drawing helpers for numerical-methods Batch 4."""

from __future__ import annotations

from typing import Literal

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    BackgroundRectangle,
    Dot,
    Line,
    RoundedRectangle,
    Square,
    Text,
    VGroup,
)

from palette import (
    BACKGROUND,
    CHINESE_FONT,
    DATA_BLUE,
    GRID,
    HIGH_CONTRAST_SURFACE,
    HIGH_CONTRAST_TEXT,
    MUTED,
)


StatusCue = Literal["square", "circle", "diamond", "accept", "reject"]
STATUS_SYMBOLS: dict[StatusCue, str] = {
    "square": "■",
    "circle": "●",
    "diamond": "◇",
    "accept": "✓",
    "reject": "×",
}


def cn_text(
    value: str,
    *,
    font_size: int = 30,
    color=HIGH_CONTRAST_TEXT,
    weight: str = "NORMAL",
) -> Text:
    """Create Chinese-capable text using the centralized deterministic fallback."""

    return Text(value, font=CHINESE_FONT, font_size=font_size, color=color, weight=weight)


def equation(value: str, *, font_size: int = 31, color=HIGH_CONTRAST_TEXT) -> Text:
    """Use fixed Unicode formulas to avoid a LaTeX runtime and font drift."""

    return cn_text(value, font_size=font_size, color=color)


def fit_width(mobject, max_width: float):
    if mobject.width > max_width:
        mobject.scale_to_fit_width(max_width)
    return mobject


def top_heading(value: str, *, font_size: int = 35) -> Text:
    return fit_width(
        cn_text(value, font_size=font_size, color=HIGH_CONTRAST_TEXT, weight="SEMIBOLD"),
        12.25,
    ).to_edge(UP, buff=0.5)


def title_block(kicker: str, title: str, subtitle: str | None = None) -> VGroup:
    items = [
        cn_text(kicker, font_size=25, color=DATA_BLUE, weight="SEMIBOLD"),
        cn_text(title, font_size=45, color=HIGH_CONTRAST_TEXT, weight="SEMIBOLD"),
    ]
    if subtitle:
        items.append(cn_text(subtitle, font_size=25, color=MUTED))
    return VGroup(*items).arrange(DOWN, buff=0.28)


def card(*items, width: float = 5.6, height: float = 2.2, buff: float = 0.22) -> VGroup:
    body = VGroup(*items).arrange(DOWN, aligned_edge=LEFT, buff=buff)
    panel = RoundedRectangle(
        corner_radius=0.18,
        width=max(width, body.width + 0.55),
        height=max(height, body.height + 0.5),
        stroke_color=GRID,
        stroke_width=1.6,
        fill_color=HIGH_CONTRAST_SURFACE,
        fill_opacity=1,
    )
    body.move_to(panel)
    return VGroup(panel, body)


def disclaimer(
    value: str,
    *,
    font_size: int = 22,
    color=HIGH_CONTRAST_TEXT,
    fill_opacity: float = 0.93,
) -> VGroup:
    """Provide a readable static fallback for caveats otherwise shown in motion."""

    text = cn_text(value, font_size=font_size, color=color)
    background = BackgroundRectangle(text, color=BACKGROUND, fill_opacity=fill_opacity, buff=0.12)
    return VGroup(background, text)


def square_marker(*, side_length: float = 0.22, color, fill_color=HIGH_CONTRAST_SURFACE) -> Square:
    return Square(
        side_length=side_length,
        color=color,
        fill_color=fill_color,
        fill_opacity=1,
    )


def circle_marker(*, radius: float = 0.11, color) -> Dot:
    return Dot(radius=radius, color=color)


def diamond_marker(*, side_length: float = 0.18, color, fill_color=HIGH_CONTRAST_SURFACE) -> Square:
    return square_marker(side_length=side_length, color=color, fill_color=fill_color).rotate(0.7853981633974483)


def cross_marker(*, size: float = 0.36, color, stroke_width: float = 6) -> VGroup:
    half = size / 2
    return VGroup(
        Line(LEFT * half + UP * half, RIGHT * half + DOWN * half, color=color, stroke_width=stroke_width),
        Line(LEFT * half + DOWN * half, RIGHT * half + UP * half, color=color, stroke_width=stroke_width),
    )


def status_label(
    cue: StatusCue,
    value: str,
    *,
    font_size: int = 24,
    color=HIGH_CONTRAST_TEXT,
    weight: str = "NORMAL",
) -> Text:
    """Pair every color/shape cue with a stable written symbol and label."""

    return cn_text(
        f"{STATUS_SYMBOLS[cue]} {value}",
        font_size=font_size,
        color=color,
        weight=weight,
    )
