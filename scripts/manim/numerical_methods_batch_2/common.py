"""Reading-safe deterministic drawing helpers for numerical-methods Batch 2."""

from __future__ import annotations

from manim import DOWN, UP, BackgroundRectangle, RoundedRectangle, Text, VGroup

from palette import BACKGROUND, CHINESE_FONT, DATA_BLUE, GRID, MUTED, NAVY, PAPER


def cn_text(value: str, *, font_size: int = 30, color=NAVY, weight: str = "NORMAL") -> Text:
    return Text(value, font=CHINESE_FONT, font_size=font_size, color=color, weight=weight)


def equation(value: str, *, font_size: int = 31, color=NAVY) -> Text:
    """Use fixed Unicode formulas to avoid a LaTeX runtime and font drift."""

    return cn_text(value, font_size=font_size, color=color)


def fit_width(mobject, max_width: float):
    if mobject.width > max_width:
        mobject.scale_to_fit_width(max_width)
    return mobject


def top_heading(value: str, *, font_size: int = 35) -> Text:
    return fit_width(cn_text(value, font_size=font_size, color=NAVY, weight="SEMIBOLD"), 12.25).to_edge(UP, buff=0.5)


def title_block(kicker: str, title: str, subtitle: str | None = None) -> VGroup:
    items = [
        cn_text(kicker, font_size=25, color=DATA_BLUE, weight="SEMIBOLD"),
        cn_text(title, font_size=45, color=NAVY, weight="SEMIBOLD"),
    ]
    if subtitle:
        items.append(cn_text(subtitle, font_size=25, color=MUTED))
    return VGroup(*items).arrange(DOWN, buff=0.28)


def card(*items, width: float = 5.6, height: float = 2.2, buff: float = 0.22) -> VGroup:
    body = VGroup(*items).arrange(DOWN, aligned_edge=(-1, 0, 0), buff=buff)
    panel = RoundedRectangle(
        corner_radius=0.18,
        width=max(width, body.width + 0.55),
        height=max(height, body.height + 0.5),
        stroke_color=GRID,
        stroke_width=1.6,
        fill_color=PAPER,
        fill_opacity=1,
    )
    body.move_to(panel)
    return VGroup(panel, body)


def disclaimer(value: str) -> VGroup:
    text = cn_text(value, font_size=20, color=MUTED)
    background = BackgroundRectangle(text, color=BACKGROUND, fill_opacity=0.93, buff=0.12)
    return VGroup(background, text)
