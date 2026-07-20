"""Small deterministic drawing helpers shared by the three numerical scenes."""

from __future__ import annotations

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    BackgroundRectangle,
    RoundedRectangle,
    Text,
    VGroup,
)

from palette import BACKGROUND, CHINESE_FONT, DATA_BLUE, GRID, MUTED, NAVY, PAPER


def cn_text(value: str, *, font_size: int = 30, color=NAVY, weight: str = "NORMAL") -> Text:
    """Create one Chinese-safe text object using the production font contract."""

    return Text(value, font=CHINESE_FONT, font_size=font_size, color=color, weight=weight)


def title_block(kicker: str, title: str, subtitle: str | None = None) -> VGroup:
    badge = cn_text(kicker, font_size=25, color=DATA_BLUE, weight="SEMIBOLD")
    heading = cn_text(title, font_size=45, color=NAVY, weight="SEMIBOLD")
    items = [badge, heading]
    if subtitle:
        items.append(cn_text(subtitle, font_size=25, color=MUTED))
    group = VGroup(*items).arrange(DOWN, buff=0.28)
    return group


def card(*items, width: float = 5.6, height: float = 2.2, buff: float = 0.22) -> VGroup:
    """Place a reading-safe group on a warm white rounded panel."""

    body = VGroup(*items).arrange(DOWN, aligned_edge=LEFT, buff=buff)
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


def equation(value: str, *, font_size: int = 31, color=NAVY) -> Text:
    """Render an exact Unicode formula without introducing a LaTeX runtime."""

    return cn_text(value, font_size=font_size, color=color)


def disclaimer() -> VGroup:
    text = cn_text("高维关系示意，不按实际尺度", font_size=20, color=MUTED)
    background = BackgroundRectangle(text, color=BACKGROUND, fill_opacity=0.93, buff=0.12)
    return VGroup(background, text)


def reading_column(*items, buff: float = 0.24) -> VGroup:
    return VGroup(*items).arrange(DOWN, aligned_edge=LEFT, buff=buff)


def split_layout(left: VGroup, right: VGroup, *, left_shift: float = 3.35, right_shift: float = 3.35) -> VGroup:
    left.move_to(LEFT * left_shift)
    right.move_to(RIGHT * right_shift)
    return VGroup(left, right)


def fit_width(mobject, max_width: float):
    if mobject.width > max_width:
        mobject.scale_to_fit_width(max_width)
    return mobject


def top_heading(value: str, *, font_size: int = 35) -> Text:
    heading = cn_text(value, font_size=font_size, color=NAVY, weight="SEMIBOLD")
    fit_width(heading, 12.25)
    return heading.to_edge(UP, buff=0.5)
