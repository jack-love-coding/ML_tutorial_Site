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
PURPLE = "#6f42c1"
RED = "#d9463f"
GRID = "#dfe6f1"


def font(size: int) -> ImageFont.FreeTypeFont:
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


TITLE = font(58)
H2 = font(34)
BODY = font(26)
SMALL = font(21)


def canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
  image = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
  draw = ImageDraw.Draw(image)
  for x in range(72, WIDTH - 72, 72):
    draw.line((x, 120, x, HEIGHT - 90), fill=GRID, width=1)
  for y in range(144, HEIGHT - 90, 72):
    draw.line((72, y, WIDTH - 72, y), fill=GRID, width=1)
  return image, draw


def save(image: Image.Image, filename: str) -> None:
  OUT_DIR.mkdir(parents=True, exist_ok=True)
  image.save(OUT_DIR / filename)


def arrow(draw: ImageDraw.ImageDraw, start: tuple[float, float], end: tuple[float, float], fill: str, width: int = 6) -> None:
  draw.line((*start, *end), fill=fill, width=width)
  angle = math.atan2(end[1] - start[1], end[0] - start[0])
  length = 22
  spread = 0.48
  left = (end[0] - length * math.cos(angle - spread), end[1] - length * math.sin(angle - spread))
  right = (end[0] - length * math.cos(angle + spread), end[1] - length * math.sin(angle + spread))
  draw.polygon([end, left, right], fill=fill)


def card(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], title: str, body: str, accent: str) -> None:
  draw.rounded_rectangle(xy, radius=22, fill=PANEL, outline="#d8dfeb", width=3)
  x1, y1, _, y2 = xy
  draw.rectangle((x1, y1, x1 + 12, y2), fill=accent)
  draw.text((x1 + 32, y1 + 24), title, fill=INK, font=H2)
  draw.multiline_text((x1 + 32, y1 + 78), body, fill=MUTED, font=BODY, spacing=8)


def probability_why() -> None:
  image, draw = canvas()
  draw.text((80, 54), "为什么 AI 要学概率？", fill=INK, font=TITLE)
  card(draw, (76, 156, 438, 340), "不是只猜一次", "一次结果可能偶然\n长期频率才显出规律", BLUE)
  card(draw, (76, 388, 438, 572), "先列样本空间", "天气、邮件、类别、token\n都要先说可能结果", GREEN)
  card(draw, (76, 620, 438, 780), "AI 用途", "分类概率、生成采样\n风险判断、校准检查", ORANGE)

  draw.rounded_rectangle((520, 150, 1438, 780), radius=30, fill=PANEL, outline="#d8dfeb", width=3)
  labels = [("天气", BLUE), ("邮件", GREEN), ("图片类别", ORANGE), ("next token", PURPLE)]
  for index, (label, color) in enumerate(labels):
    y = 220 + index * 118
    draw.rounded_rectangle((590, y, 780, y + 72), radius=16, fill="#fffef8", outline=color, width=4)
    draw.text((685, y + 37), label, fill=INK, font=BODY, anchor="mm")
    arrow(draw, (800, y + 36), (920, y + 36), color, width=7)
    for step in range(5):
      width = [82, 52, 104, 34, 66][(index + step) % 5]
      draw.rectangle((950 + step * 76, y + 16, 950 + step * 76 + width, y + 56), fill=color, outline=INK, width=2)
    draw.text((1400, y + 40), "概率条", fill=MUTED, font=SMALL, anchor="mm")
  draw.text((770, 708), "概率：把不确定性分配到可能结果上", fill=INK, font=H2)
  save(image, "beginner-probability-why-longform.png")


def conditional_probability() -> None:
  image, draw = canvas()
  draw.text((80, 54), "条件概率：证据筛选样本空间", fill=INK, font=TITLE)
  card(draw, (72, 168, 426, 366), "先看总体", "随机抽一封邮件\n垃圾邮件只是少数", BLUE)
  card(draw, (72, 438, 426, 636), "再加条件", "已知：含可疑链接\n分母换成带信号邮件", ORANGE)

  draw.rounded_rectangle((500, 150, 960, 704), radius=28, fill=PANEL, outline="#d8dfeb", width=3)
  draw.text((730, 198), "总体样本空间 Ω", fill=INK, font=H2, anchor="mm")
  for row in range(7):
    for col in range(9):
      x = 570 + col * 38
      y = 252 + row * 42
      color = CORAL if (row + col) % 9 == 0 or (row == 4 and col == 5) else BLUE
      draw.ellipse((x - 11, y - 11, x + 11, y + 11), fill=color, outline=INK, width=1)
  draw.rounded_rectangle((550, 514, 908, 620), radius=18, outline=ORANGE, width=6)
  draw.text((730, 664), "条件 B：只留下带信号样本", fill=ORANGE, font=BODY, anchor="mm")

  arrow(draw, (986, 424), (1080, 424), GREEN, width=9)
  draw.rounded_rectangle((1110, 230, 1452, 620), radius=28, fill=PANEL, outline="#d8dfeb", width=3)
  draw.text((1280, 282), "在 B 里重新数 A", fill=INK, font=H2, anchor="mm")
  draw.text((1280, 358), "P(A | B)", fill=PURPLE, font=H2, anchor="mm")
  draw.text((1280, 430), "= A 且 B 的数量 / B 的数量", fill=MUTED, font=BODY, anchor="mm")
  draw.rectangle((1190, 492, 1370, 536), fill=CORAL, outline=INK, width=2)
  draw.rectangle((1190, 536, 1370, 580), fill=BLUE, outline=INK, width=2)
  draw.text((1420, 516), "目标事件 A", fill=CORAL, font=SMALL, anchor="mm")
  draw.text((1420, 560), "其他", fill=BLUE, font=SMALL, anchor="mm")
  save(image, "beginner-conditional-probability-longform.png")


def bayes_update() -> None:
  image, draw = canvas()
  draw.text((80, 54), "贝叶斯更新：先验 + 证据 = 后验", fill=INK, font=TITLE)
  card(draw, (74, 166, 426, 356), "先验 prior", "随机邮件中\n垃圾邮件约 8%", BLUE)
  card(draw, (74, 424, 426, 614), "likelihood", "垃圾邮件里\n82% 有可疑链接", ORANGE)
  card(draw, (74, 646, 426, 804), "误报", "普通邮件里\n12% 也有信号", CORAL)

  draw.rounded_rectangle((510, 162, 1460, 788), radius=28, fill=PANEL, outline="#d8dfeb", width=3)
  draw.text((986, 218), "1000 封邮件的证据账本", fill=INK, font=H2, anchor="mm")
  draw.text((640, 292), "垃圾 80", fill=CORAL, font=BODY)
  draw.text((900, 292), "普通 920", fill=BLUE, font=BODY)
  draw.rectangle((620, 320, 700, 378), fill=CORAL, outline=INK, width=2)
  draw.rectangle((700, 320, 1340, 378), fill=BLUE, outline=INK, width=2)
  arrow(draw, (980, 408), (980, 492), GREEN, width=8)
  draw.text((980, 454), "筛选：含可疑链接", fill=GREEN, font=BODY, anchor="mm")
  draw.rectangle((620, 526, 686, 588), fill=CORAL, outline=INK, width=2)
  draw.rectangle((686, 526, 796, 588), fill=BLUE, outline=INK, width=2)
  draw.text((650, 624), "66 真阳性", fill=CORAL, font=SMALL, anchor="mm")
  draw.text((742, 624), "110 误报", fill=BLUE, font=SMALL, anchor="mm")
  draw.text((1120, 552), "后验 = 66 / (66 + 110) ≈ 37.5%", fill=INK, font=H2, anchor="mm")
  draw.text((1120, 626), "不是 82%，因为 base rate 和误报也进来了", fill=MUTED, font=BODY, anchor="mm")
  save(image, "beginner-bayes-update-longform.png")


def calibration_confidence() -> None:
  image, draw = canvas()
  draw.text((80, 54), "校准：高置信度也要看真实频率", fill=INK, font=TITLE)
  card(draw, (72, 162, 426, 356), "模型说", "很多样本：\n我有 70%、90% 把握", BLUE)
  card(draw, (72, 430, 426, 624), "老师追问", "这些样本真实世界里\n到底对了多少？", ORANGE)
  card(draw, (72, 672, 426, 824), "结论", "概率要能当频率读\n才算校准", GREEN)

  draw.rounded_rectangle((504, 150, 1454, 760), radius=28, fill=PANEL, outline="#d8dfeb", width=3)
  draw.text((980, 206), "按置信度分箱，对比真实正确率", fill=INK, font=H2, anchor="mm")
  x0, y0 = 620, 640
  draw.line((x0, y0, 1340, y0), fill=INK, width=3)
  draw.line((x0, y0, x0, 278), fill=INK, width=3)
  bins = [(0.2, 0.18), (0.4, 0.36), (0.6, 0.54), (0.8, 0.62), (0.95, 0.66)]
  for index, (confidence, accuracy) in enumerate(bins):
    x = x0 + 70 + index * 132
    conf_h = confidence * 300
    acc_h = accuracy * 300
    draw.rectangle((x, y0 - conf_h, x + 44, y0), fill="#d8e8ff", outline=BLUE, width=3)
    draw.rectangle((x + 52, y0 - acc_h, x + 96, y0), fill="#dff5eb", outline=GREEN, width=3)
    draw.text((x + 48, y0 + 34), f"{int(confidence * 100)}%", fill=INK, font=SMALL, anchor="mm")
  draw.line((x0, y0, x0 + 660, y0 - 300), fill=PURPLE, width=5)
  draw.text((1254, 292), "理想校准线", fill=PURPLE, font=BODY, anchor="mm")
  draw.rectangle((1120, 402, 1170, 438), fill="#d8e8ff", outline=BLUE, width=3)
  draw.text((1256, 424), "模型置信度", fill=BLUE, font=SMALL, anchor="mm")
  draw.rectangle((1120, 462, 1170, 498), fill="#dff5eb", outline=GREEN, width=3)
  draw.text((1256, 484), "真实正确率", fill=GREEN, font=SMALL, anchor="mm")
  save(image, "beginner-calibration-confidence-longform.png")


def main() -> None:
  probability_why()
  conditional_probability()
  bayes_update()
  calibration_confidence()


if __name__ == "__main__":
  main()
