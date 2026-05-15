from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCENE_FILE = ROOT / "scripts" / "manim" / "scenes" / "classification.py"
PUBLIC_DIR = ROOT / "public" / "manim" / "classification"

SCENES = {
    "ThresholdSweepScene": "threshold-sweep.mp4",
    "ConfusionUpdateScene": "confusion-update.mp4",
    "RocConstructionScene": "roc-construction.mp4",
    "SoftmaxSimplexScene": "softmax-simplex.mp4",
}

POSTER_TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="{aria}">
  <rect width="960" height="540" fill="#f7fbfb"/>
  <rect x="72" y="76" width="816" height="376" rx="16" fill="#fff" stroke="#d9e5e4" stroke-width="3"/>
  {body}
  <text x="92" y="54" fill="#101828" font-family="Arial, sans-serif" font-size="34" font-weight="700">{title}</text>
  <text x="92" y="500" fill="#667085" font-family="Arial, sans-serif" font-size="22">{caption}</text>
</svg>
"""

POSTERS = {
    "threshold-sweep.mp4": POSTER_TEMPLATE.format(
        aria="Threshold sweep poster",
        title="Threshold sweep",
        caption="The model scores stay fixed while the action boundary moves.",
        body="""
  <line x1="126" x2="834" y1="298" y2="298" stroke="#172033" stroke-width="5" stroke-linecap="round"/>
  <rect x="126" y="160" width="360" height="210" fill="#3f6dff" opacity=".08"/>
  <rect x="486" y="160" width="348" height="210" fill="#0f9f8f" opacity=".10"/>
  <line x1="486" x2="486" y1="132" y2="398" stroke="#172033" stroke-width="8" stroke-dasharray="14 12"/>
  <g stroke="#fff" stroke-width="4">
    <circle cx="170" cy="268" r="12" fill="#3f6dff"/><circle cx="246" cy="320" r="12" fill="#3f6dff"/>
    <circle cx="366" cy="274" r="12" fill="#f97352"/><circle cx="510" cy="326" r="12" fill="#f97352"/>
    <circle cx="642" cy="262" r="12" fill="#f97352"/><circle cx="726" cy="314" r="12" fill="#3f6dff"/>
  </g>
""",
    ),
    "confusion-update.mp4": POSTER_TEMPLATE.format(
        aria="Confusion matrix poster",
        title="Confusion matrix update",
        caption="Every classification result contributes to TP, FP, TN, or FN.",
        body="""
  <g transform="translate(260 128)">
    <rect width="180" height="150" fill="#0f9f8f" opacity=".12" stroke="#172033" stroke-width="4"/>
    <rect x="180" width="180" height="150" fill="#f97352" opacity=".13" stroke="#172033" stroke-width="4"/>
    <rect y="150" width="180" height="150" fill="#f97352" opacity=".13" stroke="#172033" stroke-width="4"/>
    <rect x="180" y="150" width="180" height="150" fill="#0f9f8f" opacity=".12" stroke="#172033" stroke-width="4"/>
    <text x="72" y="88" font-family="Arial" font-size="36" font-weight="700" fill="#0f9f8f">TP</text>
    <text x="252" y="88" font-family="Arial" font-size="36" font-weight="700" fill="#f97352">FN</text>
    <text x="72" y="238" font-family="Arial" font-size="36" font-weight="700" fill="#f97352">FP</text>
    <text x="252" y="238" font-family="Arial" font-size="36" font-weight="700" fill="#0f9f8f">TN</text>
  </g>
  <path d="M150 186C196 178 214 154 256 150" fill="none" stroke="#f97352" stroke-width="7" stroke-linecap="round"/>
  <path d="M150 344C198 348 220 388 260 398" fill="none" stroke="#3f6dff" stroke-width="7" stroke-linecap="round"/>
""",
    ),
    "roc-construction.mp4": POSTER_TEMPLATE.format(
        aria="ROC construction poster",
        title="ROC construction",
        caption="Each threshold adds one point to the ROC curve.",
        body="""
  <g transform="translate(184 118)">
    <line x1="0" x2="0" y1="294" y2="0" stroke="#172033" stroke-width="4"/>
    <line x1="0" x2="420" y1="294" y2="294" stroke="#172033" stroke-width="4"/>
    <line x1="0" x2="420" y1="294" y2="0" stroke="#98a2b3" stroke-width="4" stroke-dasharray="12 12"/>
    <path d="M0 294C76 128 164 56 420 24" fill="none" stroke="#172033" stroke-width="10" stroke-linecap="round"/>
    <path d="M0 294C76 128 164 56 420 24L420 294Z" fill="#3f6dff" opacity=".14"/>
    <circle cx="58" cy="172" r="12" fill="#f97352"/><circle cx="142" cy="82" r="12" fill="#f97352"/>
    <circle cx="276" cy="42" r="12" fill="#f97352"/>
  </g>
""",
    ),
    "softmax-simplex.mp4": POSTER_TEMPLATE.format(
        aria="Softmax simplex poster",
        title="Softmax simplex",
        caption="Three class probabilities share a total budget of one.",
        body="""
  <path d="M480 132L278 398H682Z" fill="#e6f4f2" stroke="#172033" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="504" cy="286" r="18" fill="#f97352" stroke="#fff" stroke-width="5"/>
  <text x="470" y="114" font-family="Arial" font-size="34" font-weight="700" fill="#f97352">A</text>
  <text x="238" y="430" font-family="Arial" font-size="34" font-weight="700" fill="#3f6dff">B</text>
  <text x="700" y="430" font-family="Arial" font-size="34" font-weight="700" fill="#0f9f8f">C</text>
  <rect x="728" y="226" width="34" height="142" fill="#f97352" opacity=".78"/>
  <rect x="776" y="292" width="34" height="76" fill="#3f6dff" opacity=".78"/>
  <rect x="824" y="328" width="34" height="40" fill="#0f9f8f" opacity=".78"/>
""",
    ),
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
    media_path = ROOT / "media" / "videos" / "classification" / "480p15" / f"{scene_name}.mp4"
    if not media_path.exists():
        raise FileNotFoundError(f"Expected Manim output not found: {media_path}")
    return media_path


def write_metadata() -> None:
    metadata = {
        "generatedBy": "scripts/manim/render_classification.py",
        "scenes": [
            {
                "scene": scene,
                "assetPath": f"/manim/classification/{filename}",
                "posterPath": f"/manim/classification/{filename.replace('.mp4', '.svg')}",
            }
            for scene, filename in SCENES.items()
        ],
    }
    (PUBLIC_DIR / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf8")


def write_posters() -> None:
    for filename, svg in POSTERS.items():
        (PUBLIC_DIR / filename.replace(".mp4", ".svg")).write_text(svg, encoding="utf8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Render classification teaching videos.")
    parser.add_argument("--skip-render", action="store_true", help="Only rewrite poster SVGs and metadata.")
    args = parser.parse_args()

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    write_posters()

    if not args.skip_render:
        for scene_name, filename in SCENES.items():
            output = render_scene(scene_name)
            shutil.copyfile(output, PUBLIC_DIR / filename)

    write_metadata()


if __name__ == "__main__":
    main()
