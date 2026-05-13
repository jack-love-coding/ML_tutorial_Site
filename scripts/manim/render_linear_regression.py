from __future__ import annotations

import argparse
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCENE_FILE = ROOT / "scripts" / "manim" / "scenes" / "linear_regression.py"
PUBLIC_DIR = ROOT / "public" / "manim" / "linear-regression"
SCENES = {
    "LinearRegressionFitComparisonScene": "fit-comparison.mp4",
    "RegularizationGeometryScene": "regularization-geometry.mp4",
}

POSTER_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="California Housing fit comparison poster">
  <rect width="960" height="540" fill="#f8fbff"/>
  <g stroke="#d7dee9" stroke-width="1">
    <path d="M112 96V438M232 96V438M352 96V438M472 96V438M592 96V438M712 96V438M832 96V438"/>
    <path d="M96 138H864M96 210H864M96 282H864M96 354H864M96 426H864"/>
  </g>
  <path d="M96 426H864M96 96V426" stroke="#667085" stroke-width="3"/>
  <g fill="#3868ff" stroke="#ffffff" stroke-width="4">
    <circle cx="156" cy="390" r="10"/><circle cx="226" cy="310" r="10"/><circle cx="314" cy="274" r="10"/>
    <circle cx="410" cy="228" r="10"/><circle cx="518" cy="302" r="10"/><circle cx="626" cy="178" r="10"/>
    <circle cx="748" cy="214" r="10"/>
  </g>
  <g fill="#db6c3a" stroke="#ffffff" stroke-width="4">
    <circle cx="192" cy="332" r="10"/><circle cx="366" cy="360" r="10"/><circle cx="574" cy="254" r="10"/><circle cx="828" cy="304" r="10"/>
  </g>
  <path d="M130 382 C260 318 382 238 520 190 C640 150 760 168 846 284" fill="none" stroke="#21846f" stroke-width="10" stroke-linecap="round"/>
  <path d="M130 390 C210 170 300 416 392 226 C520 -18 648 482 846 220" fill="none" stroke="#db6c3a" stroke-width="8" stroke-linecap="round" opacity="0.72"/>
  <text x="88" y="70" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Underfit, better fit, overfit</text>
  <text x="88" y="500" fill="#475467" font-family="Arial, sans-serif" font-size="24">California Housing: MedInc to median house value</text>
</svg>
"""

REGULARIZATION_POSTER_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Regularization geometry poster">
  <rect width="960" height="540" fill="#f8fbff"/>
  <g transform="translate(480 286)">
    <ellipse cx="0" cy="0" rx="332" ry="218" fill="none" stroke="#d7dee9" stroke-width="2"/>
    <ellipse cx="-8" cy="-4" rx="244" ry="156" fill="none" stroke="#c5d0df" stroke-width="2"/>
    <ellipse cx="-18" cy="-10" rx="154" ry="94" fill="none" stroke="#adb9ca" stroke-width="2"/>
    <path d="M0 -162 L162 0 L0 162 L-162 0 Z" fill="rgba(56,104,255,0.08)" stroke="#3868ff" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="0" cy="0" r="142" fill="rgba(33,132,111,0.08)" stroke="#21846f" stroke-width="8"/>
    <path d="M-132 34 C-78 -42 -20 -96 52 -112 C112 -126 166 -86 206 -28" fill="none" stroke="#db6c3a" stroke-width="9" stroke-linecap="round"/>
    <circle cx="0" cy="-162" r="12" fill="#3868ff"/>
    <circle cx="100" cy="-100" r="12" fill="#21846f"/>
  </g>
  <text x="92" y="78" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">L1 corners, L2 smooth shrinkage</text>
  <text x="92" y="496" fill="#475467" font-family="Arial, sans-serif" font-size="24">Regularization changes where the loss contours first touch the budget.</text>
</svg>
"""

POSTERS = {
    "fit-comparison.mp4": POSTER_SVG,
    "regularization-geometry.mp4": REGULARIZATION_POSTER_SVG,
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
    media_path = ROOT / "media" / "videos" / "linear_regression" / "480p15" / f"{scene_name}.mp4"
    if not media_path.exists():
        raise FileNotFoundError(f"Expected Manim output not found: {media_path}")
    return media_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Render linear regression teaching videos.")
    parser.add_argument("--skip-render", action="store_true", help="Only rewrite poster SVG.")
    args = parser.parse_args()

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    for output_name, poster in POSTERS.items():
        (PUBLIC_DIR / output_name.replace(".mp4", ".svg")).write_text(poster, encoding="utf8")

    if not args.skip_render:
        for scene_name, output_name in SCENES.items():
            output = render_scene(scene_name)
            shutil.copyfile(output, PUBLIC_DIR / output_name)


if __name__ == "__main__":
    main()
