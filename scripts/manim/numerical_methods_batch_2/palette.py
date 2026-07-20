"""ML Atlas visual tokens for the sparse-matrix and PCA scenes."""

from __future__ import annotations

from manim import ManimColor
from manimpango import list_fonts


BACKGROUND = ManimColor("#F7F3EA")
PAPER = ManimColor("#FFFEF8")
NAVY = ManimColor("#102A43")
MUTED = ManimColor("#60758A")
GRID = ManimColor("#8FA3B8")
DATA_BLUE = ManimColor("#2F6FED")
TEAL = ManimColor("#1F8A85")
ORANGE = ManimColor("#F2994A")
PALE_BLUE = ManimColor("#DCEBFF")
PALE_TEAL = ManimColor("#DDF5F0")
PALE_ORANGE = ManimColor("#FFE8D2")
RED = ManimColor("#C94B55")
WHITE = ManimColor("#FFFFFF")

_FONT_PRIORITY = ("PingFang SC", "Noto Sans CJK SC")
_INSTALLED_FONTS = set(list_fonts())
CHINESE_FONT = next((font for font in _FONT_PRIORITY if font in _INSTALLED_FONTS), "sans-serif")
