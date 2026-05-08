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
    "GradientDescentScene": "gradient-descent.mp4",
    "TaylorPolynomialScene": "taylor-polynomial.mp4",
}

POSTER_SVGS = {
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
        for scene_name, filename in SCENES.items():
            output = render_scene(scene_name)
            shutil.copyfile(output, PUBLIC_DIR / filename)

    write_metadata()


if __name__ == "__main__":
    main()
