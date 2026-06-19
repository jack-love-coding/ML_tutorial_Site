from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCENE_FILE = ROOT / "scripts" / "manim" / "scenes" / "math_lab_basics.py"
PUBLIC_DIR = ROOT / "public" / "manim" / "math-lab"

SCENES = {
    "VectorDotProductScene": "vector-dot-product.mp4",
    "MatrixTransformScene": "matrix-transform.mp4",
    "VectorSpanNormScene": "vector-span-norm.mp4",
    "GradientDescentScene": "gradient-descent.mp4",
    "BeginnerDerivativeWindowScene": "beginner-derivative-window.mp4",
    "BeginnerChainRuleBackpropScene": "beginner-chain-rule-backprop.mp4",
    "BeginnerLearningRateBehaviorScene": "beginner-learning-rate-behavior.mp4",
    "TaylorPolynomialScene": "taylor-polynomial.mp4",
    "MonteCarloSamplingScene": "monte-carlo-sampling.mp4",
}

POSTER_SVGS = {
    "BeginnerDerivativeWindowScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Derivative window shrinking to tangent slope">
  <rect width="960" height="540" fill="#fffaf1"/>
  <g stroke="#dbe4f2" stroke-width="1">
    <path d="M90 120H870M90 190H870M90 260H870M90 330H870M90 400H870"/>
    <path d="M130 90V450M240 90V450M350 90V450M460 90V450M570 90V450M680 90V450M790 90V450"/>
  </g>
  <path d="M110 418H840M160 90V440" stroke="#7b8497" stroke-width="3"/>
  <path d="M180 134 C305 384 492 486 768 182" fill="none" stroke="#3868ff" stroke-width="9" stroke-linecap="round"/>
  <path d="M500 360L725 235" stroke="#ef6f6c" stroke-width="7" stroke-linecap="round"/>
  <path d="M500 360L628 304" stroke="#d65a31" stroke-width="7" stroke-linecap="round"/>
  <path d="M500 360L580 332" stroke="#0f9f7a" stroke-width="7" stroke-linecap="round"/>
  <path d="M394 385L650 292" stroke="#0f9f7a" stroke-width="7" stroke-linecap="round"/>
  <circle cx="500" cy="360" r="15" fill="#ffd84d" stroke="#10162f" stroke-width="4"/>
  <text x="82" y="70" fill="#10162f" font-family="Arial, sans-serif" font-size="34" font-weight="700">Derivative window shrinks to the tangent</text>
  <text x="82" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">Average change approaches local slope as h gets smaller.</text>
</svg>
""",
    "BeginnerChainRuleBackpropScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Chain rule backpropagation computation graph">
  <rect width="960" height="540" fill="#fffaf1"/>
  <text x="82" y="70" fill="#10162f" font-family="Arial, sans-serif" font-size="34" font-weight="700">Chain rule sends gradients backward</text>
  <g font-family="Arial, sans-serif" font-size="24" text-anchor="middle">
    <rect x="92" y="204" width="130" height="78" rx="14" fill="#ffffff" stroke="#10162f" stroke-width="3"/><text x="157" y="253" fill="#10162f">x</text>
    <rect x="292" y="204" width="150" height="78" rx="14" fill="#ffffff" stroke="#10162f" stroke-width="3"/><text x="367" y="253" fill="#10162f">z = w·x + b</text>
    <rect x="516" y="204" width="150" height="78" rx="14" fill="#ffffff" stroke="#10162f" stroke-width="3"/><text x="591" y="253" fill="#10162f">ŷ = σ(z)</text>
    <rect x="736" y="204" width="130" height="78" rx="14" fill="#ffffff" stroke="#10162f" stroke-width="3"/><text x="801" y="253" fill="#10162f">L</text>
  </g>
  <path d="M222 243H292M442 243H516M666 243H736" stroke="#3868ff" stroke-width="8"/>
  <path d="M736 342H666M516 342H442M292 342H222" stroke="#d65a31" stroke-width="8"/>
  <text x="482" y="174" fill="#3868ff" font-family="Arial, sans-serif" font-size="25">forward values</text>
  <text x="466" y="390" fill="#d65a31" font-family="Arial, sans-serif" font-size="25">upstream gradient × local derivative</text>
  <text x="82" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">Backpropagation is chain rule bookkeeping on a graph.</text>
</svg>
""",
    "BeginnerLearningRateBehaviorScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Learning rate paths comparing small steady and too large steps">
  <rect width="960" height="540" fill="#fffaf1"/>
  <text x="82" y="70" fill="#10162f" font-family="Arial, sans-serif" font-size="34" font-weight="700">Same slope, different step size</text>
  <g fill="none" stroke="#3868ff" stroke-width="7" stroke-linecap="round">
    <path d="M92 380 C150 120 248 120 306 380"/>
    <path d="M378 380 C436 120 534 120 592 380"/>
    <path d="M664 380 C722 120 820 120 878 380"/>
  </g>
  <path d="M120 190L150 250L176 292L202 324L224 346" stroke="#f2b84b" stroke-width="7" fill="none"/>
  <path d="M404 190L470 318L486 352" stroke="#0f9f7a" stroke-width="7" fill="none"/>
  <path d="M692 190L850 250L704 302L826 326" stroke="#d9463f" stroke-width="7" fill="none"/>
  <g font-family="Arial, sans-serif" font-size="24" font-weight="700">
    <text x="108" y="148" fill="#f2b84b">small η</text>
    <text x="396" y="148" fill="#0f9f7a">steady η</text>
    <text x="684" y="148" fill="#d9463f">large η</text>
  </g>
  <text x="82" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">A large step can reuse local slope information too far away.</text>
</svg>
""",
    "VectorSpanNormScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Vector span and norm poster">
  <rect width="960" height="540" fill="#f8fbff"/>
  <g stroke="#d7dee9" stroke-width="1">
    <path d="M120 90V450M220 90V450M320 90V450M420 90V450M520 90V450M620 90V450M720 90V450M820 90V450"/>
    <path d="M100 130H860M100 210H860M100 290H860M100 370H860M100 450H860"/>
  </g>
  <path d="M100 270H860" stroke="#667085" stroke-width="2"/>
  <path d="M480 90V450" stroke="#667085" stroke-width="2"/>
  <path d="M480 270L650 208" stroke="#3868ff" stroke-width="10" stroke-linecap="round"/>
  <path d="M642 193L690 194L657 229Z" fill="#3868ff"/>
  <path d="M480 270L425 125" stroke="#0f9f7a" stroke-width="10" stroke-linecap="round"/>
  <path d="M407 133L416 86L447 122Z" fill="#0f9f7a"/>
  <path d="M650 208L595 63M425 125L595 63" stroke="#8a96a8" stroke-width="5" stroke-dasharray="12 12"/>
  <path d="M480 270L595 63" stroke="#e26d3d" stroke-width="10" stroke-linecap="round"/>
  <path d="M576 62L618 22L612 79Z" fill="#e26d3d"/>
  <path d="M620 360L720 410" stroke="#d9463f" stroke-width="8" stroke-linecap="round"/>
  <path d="M707 392L748 424L696 426Z" fill="#d9463f"/>
  <text x="92" y="72" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Span, dependence, and norm</text>
  <text x="92" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">Combine directions, then measure the remaining error vector.</text>
</svg>
""",
    "TaylorPolynomialScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Taylor polynomial curves approaching sine near the center">
  <rect width="960" height="540" fill="#f8fbff"/>
  <g stroke="#d7dee9" stroke-width="1">
    <path d="M120 90V450M220 90V450M320 90V450M420 90V450M520 90V450M620 90V450M720 90V450M820 90V450"/>
    <path d="M100 130H860M100 210H860M100 290H860M100 370H860M100 450H860"/>
  </g>
  <path d="M100 270H860" stroke="#667085" stroke-width="2"/>
  <path d="M480 90V450" stroke="#667085" stroke-width="2"/>
  <path d="M110 278 C190 352 270 382 350 333 C430 284 510 178 590 207 C670 236 750 349 850 264" fill="none" stroke="#3868ff" stroke-width="9" stroke-linecap="round"/>
  <path d="M110 452 C230 367 330 304 430 279 C530 254 640 262 850 96" fill="none" stroke="#e26d3d" stroke-width="8" stroke-linecap="round" stroke-dasharray="20 16"/>
  <circle cx="480" cy="270" r="13" fill="#0f9f7a" stroke="#fff" stroke-width="5"/>
  <text x="92" y="72" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Taylor polynomials are local models</text>
  <text x="92" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">sin(x), center 0, degree 5 approximation</text>
</svg>
""",
    "MonteCarloSamplingScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Monte Carlo samples inside a quarter circle">
  <rect width="960" height="540" fill="#f7fbfa"/>
  <g transform="translate(245 92)">
    <rect x="0" y="0" width="356" height="356" rx="18" fill="#ffffff" stroke="#d9e3e1" stroke-width="4"/>
    <path d="M0 0 A356 356 0 0 1 356 356" fill="none" stroke="#247a73" stroke-width="12" stroke-linecap="round"/>
    <g fill="#247a73" stroke="#ffffff" stroke-width="3">
      <circle cx="34" cy="292" r="9"/><circle cx="80" cy="210" r="9"/><circle cx="142" cy="312" r="9"/>
      <circle cx="188" cy="160" r="9"/><circle cx="228" cy="238" r="9"/><circle cx="282" cy="182" r="9"/>
      <circle cx="315" cy="318" r="9"/><circle cx="58" cy="74" r="9"/><circle cx="108" cy="116" r="9"/>
    </g>
    <g fill="#d8663a" stroke="#ffffff" stroke-width="3">
      <circle cx="322" cy="70" r="9"/><circle cx="292" cy="118" r="9"/><circle cx="184" cy="42" r="9"/>
      <circle cx="334" cy="214" r="9"/>
    </g>
  </g>
  <text x="88" y="64" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Monte Carlo turns area into a count</text>
  <text x="88" y="500" fill="#475467" font-family="Arial, sans-serif" font-size="24">Count the fraction of samples inside the quarter circle, then scale the area.</text>
</svg>
""",
}

FALLBACK_TITLES = {
    "BeginnerDerivativeWindowScene": "Derivative window shrinks to the tangent",
    "BeginnerChainRuleBackpropScene": "Chain rule sends gradients backward",
    "BeginnerLearningRateBehaviorScene": "Same slope, different step size",
}


def render_scene(scene_name: str) -> Path:
    subprocess.run(
        [
            "manim",
            "-ql",
            "--format",
            "mp4",
            "--media_dir",
            str(ROOT / "media"),
            str(SCENE_FILE),
            scene_name,
        ],
        cwd=ROOT,
        check=True,
    )
    media_path = ROOT / "media" / "videos" / "math_lab_basics" / "480p15" / f"{scene_name}.mp4"
    if not media_path.exists():
        raise FileNotFoundError(f"Expected Manim output not found: {media_path}")
    return media_path


def write_fallback_video(scene_name: str, out_path: Path) -> None:
    from PIL import Image, ImageDraw, ImageFont
    import av

    title = FALLBACK_TITLES.get(scene_name, scene_name)
    font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 44)
    font_body = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 26)
    width, height = 960, 540
    container = av.open(str(out_path), "w")
    stream = container.add_stream("libx264", rate=15)
    stream.width = width
    stream.height = height
    stream.pix_fmt = "yuv420p"

    for frame_index in range(90):
        image = Image.new("RGB", (width, height), "#fffaf1")
        draw = ImageDraw.Draw(image)
        draw.text((72, 58), title, fill="#10162f", font=font_title)
        progress = frame_index / 89
        draw.rounded_rectangle((88, 150, 872, 410), radius=26, fill="#ffffff", outline="#d8dfeb", width=4)
        if scene_name == "BeginnerChainRuleBackpropScene":
            nodes = [(150, "x"), (340, "z = w·x + b"), (560, "ŷ = σ(z)"), (760, "L")]
            for x, label in nodes:
                draw.rounded_rectangle((x - 62, 235, x + 62, 300), radius=12, fill="#ffffff", outline="#10162f", width=3)
                draw.text((x - 42, 255), label, fill="#10162f", font=font_body)
            draw.line((212, 268, 278, 268, 498, 268, 698, 268), fill="#3868ff", width=7)
            x_back = 760 - progress * 610
            draw.line((760, 340, x_back, 340), fill="#d65a31", width=7)
        elif scene_name == "BeginnerLearningRateBehaviorScene":
            for offset, color in [(170, "#f2b84b"), (440, "#0f9f7a"), (710, "#d9463f")]:
                draw.arc((offset - 95, 180, offset + 95, 390), 190, 350, fill="#3868ff", width=7)
                draw.line((offset - 70, 230, offset - 70 + 130 * progress, 340 - 110 * abs(progress - 0.5)), fill=color, width=7)
        else:
            points = []
            for index in range(100):
                x = -2.4 + index * 4.8 / 99
                y = 0.35 * (x - 0.25) ** 2
                points.append((150 + index * 6.5, 360 - y * 95))
            draw.line(points, fill="#3868ff", width=7)
            x0 = 470
            h = 210 * (1 - progress) + 34
            draw.line((x0, 335, x0 + h, 280 + h * 0.12), fill="#d65a31", width=7)
            draw.line((380, 350, 610, 310), fill="#0f9f7a", width=7)
        draw.text((72, 462), "Fallback preview generated because Manim is unavailable in this environment.", fill="#475467", font=font_body)
        video_frame = av.VideoFrame.from_image(image)
        for packet in stream.encode(video_frame):
            container.mux(packet)

    for packet in stream.encode():
        container.mux(packet)
    container.close()


def write_metadata() -> None:
    metadata = {
        "generatedBy": "scripts/manim/render_math_lab.py",
        "scenes": [
            {
                "scene": scene,
                "assetPath": f"/manim/math-lab/{filename}",
                "posterPath": f"/manim/math-lab/{filename.replace('.mp4', '.svg')}",
            }
            for scene, filename in SCENES.items()
        ],
    }
    (PUBLIC_DIR / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf8")


def write_static_posters() -> None:
    for scene, svg in POSTER_SVGS.items():
        filename = SCENES[scene].replace(".mp4", ".svg")
        (PUBLIC_DIR / filename).write_text(svg, encoding="utf8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Render Math Intuition Lab Manim videos.")
    parser.add_argument("--skip-render", action="store_true", help="Only rewrite metadata.")
    args = parser.parse_args()

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    write_static_posters()

    if not args.skip_render:
        manim_path = shutil.which("manim")
        for scene_name, filename in SCENES.items():
            destination = PUBLIC_DIR / filename
            if manim_path:
                output = render_scene(scene_name)
                shutil.copyfile(output, destination)
            elif not destination.exists():
                write_fallback_video(scene_name, destination)

    write_metadata()


if __name__ == "__main__":
    main()
