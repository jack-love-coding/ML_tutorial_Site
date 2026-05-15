from __future__ import annotations

import argparse
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCENE_FILE = ROOT / "scripts" / "manim" / "scenes" / "logistic_regression.py"
PUBLIC_DIR = ROOT / "public" / "manim" / "logistic-regression"
SCENES = {
    "LinearScoreToSigmoidScene": "linear-score-to-sigmoid.mp4",
    "LogLossConfidentMistakeScene": "log-loss-confident-mistake.mp4",
    "RegularizationConfidenceFieldScene": "regularization-confidence-field.mp4",
}

POSTERS = {
    "linear-score-to-sigmoid.mp4": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Linear score to sigmoid poster">
  <rect width="960" height="540" fill="#f7fbfa"/>
  <path d="M110 430H850M110 100V430" stroke="#72817f" stroke-width="4"/>
  <path d="M130 400C236 398 314 380 394 306C474 232 515 156 610 132C688 112 764 110 834 110" fill="none" stroke="#1ea67a" stroke-width="12" stroke-linecap="round"/>
  <path d="M480 100V430M110 270H850" stroke="#b8c3c0" stroke-width="4" stroke-dasharray="12 12"/>
  <circle cx="420" cy="250" r="18" fill="#1ea67a" stroke="#fff" stroke-width="6"/>
  <text x="88" y="70" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Linear score becomes probability</text>
</svg>""",
    "log-loss-confident-mistake.mp4": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Log loss poster">
  <rect width="960" height="540" fill="#f7fbfa"/>
  <path d="M110 430H850M110 90V430" stroke="#72817f" stroke-width="4"/>
  <path d="M120 92C180 112 246 150 318 210C420 296 544 368 838 414" fill="none" stroke="#1ea67a" stroke-width="12" stroke-linecap="round"/>
  <circle cx="772" cy="404" r="17" fill="#1ea67a" stroke="#fff" stroke-width="6"/>
  <circle cx="206" cy="132" r="20" fill="#e35f45" stroke="#fff" stroke-width="6"/>
  <text x="88" y="70" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Confident mistakes become expensive</text>
</svg>""",
    "regularization-confidence-field.mp4": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Regularization confidence field poster">
  <rect width="960" height="540" fill="#f7fbfa"/>
  <rect x="70" y="100" width="370" height="320" rx="20" fill="#f55f45" opacity=".16"/>
  <rect x="520" y="100" width="370" height="320" rx="20" fill="#1ea67a" opacity=".13"/>
  <path d="M174 398C250 304 298 202 354 118" fill="none" stroke="#e35f45" stroke-width="10" stroke-linecap="round"/>
  <path d="M600 390C684 294 734 212 808 128" fill="none" stroke="#1ea67a" stroke-width="10" stroke-linecap="round"/>
  <g fill="#1f63d8" stroke="#fff" stroke-width="4">
    <circle cx="150" cy="320" r="12"/><circle cx="206" cy="356" r="12"/><circle cx="286" cy="312" r="12"/>
    <circle cx="594" cy="326" r="12"/><circle cx="664" cy="358" r="12"/><circle cx="752" cy="314" r="12"/>
  </g>
  <g fill="#e35f45" stroke="#fff" stroke-width="4">
    <circle cx="238" cy="172" r="12"/><circle cx="318" cy="208" r="12"/><circle cx="358" cy="158" r="12"/>
    <circle cx="662" cy="172" r="12"/><circle cx="744" cy="208" r="12"/><circle cx="808" cy="158" r="12"/>
  </g>
  <text x="88" y="70" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Regularization calms confidence</text>
</svg>""",
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
    media_path = ROOT / "media" / "videos" / "logistic_regression" / "480p15" / f"{scene_name}.mp4"
    if not media_path.exists():
        raise FileNotFoundError(f"Expected Manim output not found: {media_path}")
    return media_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Render logistic regression teaching videos.")
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
