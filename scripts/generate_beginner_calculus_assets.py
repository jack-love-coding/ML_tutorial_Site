from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "math-lab" / "generated"
WIDTH = 1536
HEIGHT = 864

INK = "#10162f"
MUTED = "#5f6c85"
PAPER = "#fffaf1"
PANEL = "#ffffff"
BLUE = "#3868ff"
GREEN = "#0f9f7a"
ORANGE = "#d65a31"
CORAL = "#ef6f6c"
YELLOW = "#f2b84b"
RED = "#d9463f"
GRID = "#dfe6f1"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
  candidates = [
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/Library/Fonts/Arial Unicode.ttf",
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/System/Library/Fonts/STHeiti Light.ttc",
  ]
  for candidate in candidates:
    path = Path(candidate)
    if path.exists():
      return ImageFont.truetype(str(path), size=size)
  return ImageFont.load_default()


TITLE = font(58, True)
H2 = font(34, True)
BODY = font(26)
SMALL = font(22)
MONO = font(24)


def canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
  image = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
  draw = ImageDraw.Draw(image)
  for x in range(72, WIDTH - 72, 72):
    draw.line((x, 120, x, HEIGHT - 90), fill=GRID, width=1)
  for y in range(144, HEIGHT - 90, 72):
    draw.line((72, y, WIDTH - 72, y), fill=GRID, width=1)
  return image, draw


def arrow(draw: ImageDraw.ImageDraw, start: tuple[float, float], end: tuple[float, float], fill: str, width: int = 6) -> None:
  draw.line((*start, *end), fill=fill, width=width)
  angle = math.atan2(end[1] - start[1], end[0] - start[0])
  length = 22
  spread = 0.48
  left = (end[0] - length * math.cos(angle - spread), end[1] - length * math.sin(angle - spread))
  right = (end[0] - length * math.cos(angle + spread), end[1] - length * math.sin(angle + spread))
  draw.polygon([end, left, right], fill=fill)


def card(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], title: str, body: str, accent: str = BLUE) -> None:
  draw.rounded_rectangle(xy, radius=22, fill=PANEL, outline="#d8dfeb", width=3)
  x1, y1, _, _ = xy
  draw.rectangle((x1, y1, x1 + 12, xy[3]), fill=accent)
  draw.text((x1 + 30, y1 + 22), title, fill=INK, font=H2)
  draw.text((x1 + 30, y1 + 72), body, fill=MUTED, font=BODY)


def plot_axes(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int]) -> None:
  x1, y1, x2, y2 = box
  draw.rounded_rectangle(box, radius=24, fill="#fffef8", outline="#d8dfeb", width=3)
  draw.line((x1 + 44, y2 - 48, x2 - 34, y2 - 48), fill="#79849a", width=3)
  draw.line((x1 + 64, y2 - 30, x1 + 64, y1 + 34), fill="#79849a", width=3)


def save(image: Image.Image, filename: str) -> None:
  OUT_DIR.mkdir(parents=True, exist_ok=True)
  image.save(OUT_DIR / filename)


def derivative_window() -> None:
  image, draw = canvas()
  draw.text((80, 54), "导数：把观察窗口缩到当前点", fill=INK, font=TITLE)
  plot = (88, 154, 930, 712)
  plot_axes(draw, plot)
  x1, y1, x2, y2 = plot

  def px(x: float) -> float:
    return x1 + 64 + ((x + 2.8) / 5.6) * (x2 - x1 - 110)

  def py(y: float) -> float:
    return y2 - 48 - ((y + 0.1) / 3.7) * (y2 - y1 - 96)

  points = []
  for i in range(160):
    x = -2.6 + i * 5.2 / 159
    y = 0.32 * (x - 0.3) ** 2 + 0.22
    points.append((px(x), py(y)))
  draw.line(points, fill=BLUE, width=8, joint="curve")
  x0 = 0.65
  y0 = 0.32 * (x0 - 0.3) ** 2 + 0.22
  slope = 0.64 * (x0 - 0.3)
  for h, color, offset in [(1.2, CORAL, 0), (0.55, ORANGE, 18), (0.18, GREEN, 34)]:
    yh = 0.32 * (x0 + h - 0.3) ** 2 + 0.22
    draw.line((px(x0), py(y0) + offset, px(x0 + h), py(yh) + offset), fill=color, width=6)
    draw.ellipse((px(x0 + h) - 9, py(yh) + offset - 9, px(x0 + h) + 9, py(yh) + offset + 9), fill=color)
  draw.line((px(x0 - 1.1), py(y0 + slope * -1.1), px(x0 + 1.1), py(y0 + slope * 1.1)), fill=GREEN, width=7)
  draw.ellipse((px(x0) - 13, py(y0) - 13, px(x0) + 13, py(y0) + 13), fill=YELLOW, outline=INK, width=3)
  draw.text((px(x0) - 12, py(y0) + 24), "x", fill=INK, font=SMALL)
  draw.text((px(x0 + 1.2) - 34, py(y0) + 70), "x+h", fill=INK, font=SMALL)
  arrow(draw, (px(x0 + 1.8), py(y0) - 70), (px(x0 + 0.25), py(y0) - 16), ORANGE)
  draw.text((px(x0 + 1.82), py(y0) - 104), "h 变小", fill=ORANGE, font=BODY)

  card(draw, (984, 170, 1438, 390), "h 表格", "h=1    slope≈0.86\nh=0.5  slope≈0.61\nh=0.1  slope≈0.41\nh=0.01 slope≈0.36", GREEN)
  card(draw, (984, 438, 1438, 652), "读图顺序", "先看一段平均坡度\n再把窗口缩小\n最后读当前切线", ORANGE)
  save(image, "beginner-derivative-window-longform.png")


def partial_gradient() -> None:
  image, draw = canvas()
  draw.text((80, 54), "梯度：很多方向的局部变化率", fill=INK, font=TITLE)
  card(draw, (84, 170, 440, 364), "参数旋钮", "theta_1\n只动第一个方向", ORANGE)
  card(draw, (84, 432, 440, 626), "参数旋钮", "theta_2\n只动第二个方向", CORAL)
  plot = (510, 158, 1030, 680)
  plot_axes(draw, plot)
  cx, cy = 770, 430
  for radius in [220, 170, 122, 76, 36]:
    draw.ellipse((cx - radius * 1.25, cy - radius * 0.7, cx + radius * 1.25, cy + radius * 0.7), outline="#adc0ff", width=5)
  point = (cx - 126, cy - 46)
  draw.ellipse((point[0] - 14, point[1] - 14, point[0] + 14, point[1] + 14), fill=YELLOW, outline=INK, width=3)
  arrow(draw, point, (point[0] + 96, point[1] - 70), GREEN, width=8)
  arrow(draw, (312, 267), (520, 324), ORANGE, width=6)
  arrow(draw, (312, 529), (520, 480), CORAL, width=6)
  card(draw, (1086, 204, 1450, 590), "梯度向量", "grad L = [\ndL/dtheta_1,\ndL/dtheta_2\n]\n\n负梯度用于下降", GREEN)
  save(image, "beginner-partial-gradient-longform.png")


def chain_backprop() -> None:
  image, draw = canvas()
  draw.text((80, 54), "链式法则：把责任沿计算图传回去", fill=INK, font=TITLE)
  nodes = [
    (120, 250, "x"),
    (320, 250, "z=wx+b"),
    (560, 250, "sigmoid"),
    (810, 250, "loss"),
  ]
  for x, y, label in nodes:
    draw.rounded_rectangle((x, y, x + 150, y + 96), radius=18, fill=PANEL, outline=INK, width=3)
    draw.text((x + 75, y + 34), label, fill=INK, font=BODY, anchor="mm")
  for a, b in zip(nodes, nodes[1:]):
    arrow(draw, (a[0] + 150, a[1] + 48), (b[0], b[1] + 48), BLUE, width=7)
  draw.text((438, 186), "forward", fill=BLUE, font=BODY)
  for a, b in zip(reversed(nodes[1:]), reversed(nodes[:-1])):
    arrow(draw, (a[0], a[1] + 132), (b[0] + 150, b[1] + 132), ORANGE, width=7)
  draw.text((442, 426), "backward", fill=ORANGE, font=BODY)
  card(draw, (1020, 194, 1440, 404), "局部导数", "dL/dw =\n(dL/dyhat)\n(dyhat/dz)\n(dz/dw)", GREEN)
  card(draw, (1020, 456, 1440, 634), "一句话", "上游梯度 × 本地导数\n= 传回去的责任", ORANGE)
  save(image, "beginner-chain-rule-backprop-longform.png")


def learning_rate_behavior() -> None:
  image, draw = canvas()
  draw.text((80, 54), "学习率：同一个坡度，不同步长", fill=INK, font=TITLE)
  panels = [
    (92, 184, 468, 652, "eta small", YELLOW, [(-1.8, 1.62), (-1.45, 1.05), (-1.18, 0.7), (-0.92, 0.42), (-0.7, 0.25)]),
    (582, 184, 958, 652, "eta ok", GREEN, [(-1.8, 1.62), (-0.68, 0.23), (-0.24, 0.03), (-0.08, 0.0)]),
    (1072, 184, 1448, 652, "eta large", RED, [(-1.8, 1.62), (1.55, 1.2), (-1.35, 0.91), (1.18, 0.7), (-1.05, 0.55)]),
  ]
  for x1, y1, x2, y2, label, color, steps in panels:
    plot_axes(draw, (x1, y1, x2, y2))
    draw.text((x1 + 34, y1 + 28), label, fill=color, font=H2)

    def px(x: float) -> float:
      return x1 + 64 + ((x + 2.2) / 4.4) * (x2 - x1 - 110)

    def py(y: float) -> float:
      return y2 - 48 - (y / 2.3) * (y2 - y1 - 108)

    curve = []
    for i in range(100):
      t = -2.1 + i * 4.2 / 99
      curve.append((px(t), py(0.5 * t * t)))
    draw.line(curve, fill=BLUE, width=7, joint="curve")
    mapped = [(px(x), py(y)) for x, y in steps]
    draw.line(mapped, fill=color, width=6)
    for point in mapped:
      draw.ellipse((point[0] - 8, point[1] - 8, point[0] + 8, point[1] + 8), fill=color)
  save(image, "beginner-learning-rate-behavior-longform.png")


def main() -> None:
  derivative_window()
  partial_gradient()
  chain_backprop()
  learning_rate_behavior()


if __name__ == "__main__":
  main()
