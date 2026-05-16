from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCENE_FILE = ROOT / "scripts" / "manim" / "scenes" / "data_lab.py"
PUBLIC_DIR = ROOT / "public" / "manim" / "data-lab"

SCENES = {
    "DataTypesFeatureFlowScene": "data-types-feature-flow.mp4",
    "DataCleaningFlowScene": "data-cleaning-flow.mp4",
    "EdaSplitApplyScene": "eda-split-apply.mp4",
    "PandasMethodChainScene": "pandas-method-chain.mp4",
    "CategoricalOneHotFlowScene": "categorical-one-hot-flow.mp4",
    "FeatureCrossSparsityScene": "feature-cross-sparsity.mp4",
}

POSTER_SVGS = {
    "DataTypesFeatureFlowScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Data types to feature vector poster">
  <rect width="960" height="540" fill="#f8fbff"/>
  <g transform="translate(90 120)">
    <rect width="220" height="210" rx="22" fill="#ffffff" stroke="#d7dee9" stroke-width="4"/>
    <g stroke="#d7dee9"><path d="M0 52H220M0 104H220M0 156H220M55 0V210M110 0V210M165 0V210"/></g>
  </g>
  <path d="M340 225H485" stroke="#0f1728" stroke-width="8" stroke-linecap="round"/>
  <path d="M475 200L520 225L475 250Z" fill="#0f1728"/>
  <g transform="translate(540 125)" fill="#d8f6ff" stroke="#0f1728" stroke-width="3">
    <rect x="0" y="0" width="52" height="72" rx="10"/><rect x="62" y="0" width="52" height="72" rx="10"/>
    <rect x="124" y="0" width="52" height="72" rx="10"/><rect x="186" y="0" width="52" height="72" rx="10"/>
    <rect x="0" y="96" width="52" height="72" rx="10" fill="#fff2ad"/><rect x="62" y="96" width="52" height="72" rx="10" fill="#fff2ad"/>
    <rect x="124" y="96" width="52" height="72" rx="10" fill="#fff2ad"/><rect x="186" y="96" width="52" height="72" rx="10" fill="#fff2ad"/>
  </g>
  <text x="90" y="76" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Column meaning becomes model input</text>
</svg>
""",
    "DataCleaningFlowScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Cleaning pipeline poster">
  <rect width="960" height="540" fill="#f7fbfa"/>
  <rect x="92" y="128" width="210" height="210" rx="22" fill="#fff4e8" stroke="#d7dee9" stroke-width="4"/>
  <circle cx="150" cy="185" r="16" fill="#be123c"/><circle cx="235" cy="255" r="16" fill="#f59e0b"/>
  <g fill="#ffffff" stroke="#0f9f7a" stroke-width="4"><rect x="385" y="120" width="70" height="230" rx="20"/><rect x="500" y="120" width="70" height="230" rx="20"/><rect x="615" y="120" width="70" height="230" rx="20"/></g>
  <path d="M315 235H370M458 235H488M573 235H603M690 235H760" stroke="#0f1728" stroke-width="8" stroke-linecap="round"/>
  <rect x="770" y="128" width="130" height="210" rx="22" fill="#e2f8ef" stroke="#d7dee9" stroke-width="4"/>
  <text x="90" y="76" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Cleaning is a reproducible pipeline</text>
</svg>
""",
    "EdaSplitApplyScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="EDA split apply combine poster">
  <rect width="960" height="540" fill="#fffaf4"/>
  <rect x="90" y="145" width="210" height="190" rx="22" fill="#ffffff" stroke="#d7dee9" stroke-width="4"/>
  <rect x="390" y="120" width="130" height="100" rx="18" fill="#e4f7ee" stroke="#0f9f7a" stroke-width="4"/>
  <rect x="390" y="260" width="130" height="100" rx="18" fill="#fff2ad" stroke="#d65a31" stroke-width="4"/>
  <rect x="640" y="175" width="44" height="150" rx="12" fill="#0f9f7a"/><rect x="715" y="225" width="44" height="100" rx="12" fill="#d65a31"/>
  <path d="M315 240H370M535 240H615" stroke="#0f1728" stroke-width="8" stroke-linecap="round"/>
  <text x="90" y="76" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Split, summarize, compare</text>
</svg>
""",
    "PandasMethodChainScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="pandas method chain poster">
  <rect width="960" height="540" fill="#fbf9ff"/>
  <rect x="82" y="160" width="180" height="170" rx="22" fill="#ffffff" stroke="#d7dee9" stroke-width="4"/>
  <g fill="#f1edff" stroke="#7048e8" stroke-width="4">
    <rect x="335" y="190" width="82" height="82" rx="20"/><rect x="455" y="190" width="82" height="82" rx="20"/>
    <rect x="575" y="190" width="82" height="82" rx="20"/><rect x="695" y="190" width="82" height="82" rx="20"/>
  </g>
  <path d="M275 232H322M420 232H442M540 232H562M660 232H682M780 232H835" stroke="#0f1728" stroke-width="8" stroke-linecap="round"/>
  <rect x="846" y="160" width="70" height="170" rx="18" fill="#e2f8ef" stroke="#0f9f7a" stroke-width="4"/>
  <text x="82" y="76" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">pandas workflows are table recipes</text>
</svg>
""",
    "CategoricalOneHotFlowScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="categorical one hot poster">
  <rect width="960" height="540" fill="#f8fffc"/>
  <g transform="translate(86 130)" fill="#ffffff" stroke="#0f766e" stroke-width="4">
    <rect width="170" height="58" rx="18"/><rect y="76" width="170" height="58" rx="18"/><rect y="152" width="170" height="58" rx="18"/>
  </g>
  <path d="M280 235H375" stroke="#0f1728" stroke-width="8" stroke-linecap="round"/>
  <g transform="translate(400 105)" fill="#ffffff" stroke="#2563eb" stroke-width="4">
    <rect width="210" height="280" rx="24"/>
    <path d="M0 56H210M0 112H210M0 168H210M0 224H210"/>
    <rect y="224" width="210" height="56" fill="#fff3cd"/>
  </g>
  <path d="M632 235H710" stroke="#0f1728" stroke-width="8" stroke-linecap="round"/>
  <g transform="translate(720 210)" stroke="#0f766e" stroke-width="4">
    <rect width="34" height="70" fill="#ffffff"/><rect x="42" width="34" height="70" fill="#ffffff"/>
    <rect x="84" width="34" height="70" fill="#f6c04d"/><rect x="126" width="34" height="70" fill="#ffffff"/>
    <rect x="168" width="34" height="70" fill="#ffffff"/>
  </g>
  <text x="86" y="76" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Vocabulary fixes category positions</text>
</svg>
""",
    "FeatureCrossSparsityScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="feature cross sparsity poster">
  <rect width="960" height="540" fill="#fffdfa"/>
  <g transform="translate(110 145)" stroke="#2563eb" stroke-width="4">
    <rect width="52" height="52" fill="#ffffff"/><rect y="62" width="52" height="52" fill="#f6c04d"/>
    <rect y="124" width="52" height="52" fill="#ffffff"/><rect y="186" width="52" height="52" fill="#ffffff"/>
    <rect x="82" width="52" height="52" fill="#ffffff"/><rect x="82" y="62" width="52" height="52" fill="#ffffff"/>
    <rect x="82" y="124" width="52" height="52" fill="#f6c04d"/><rect x="82" y="186" width="52" height="52" fill="#ffffff"/>
  </g>
  <path d="M280 260H360" stroke="#0f1728" stroke-width="8" stroke-linecap="round"/>
  <g transform="translate(390 145)" stroke="#0f766e" stroke-width="3" fill="#ffffff">
    <rect width="220" height="220" rx="16"/>
    <path d="M55 0V220M110 0V220M165 0V220M0 55H220M0 110H220M0 165H220"/>
    <rect x="110" y="55" width="55" height="55" fill="#f6c04d"/>
  </g>
  <path d="M635 260H710" stroke="#0f1728" stroke-width="8" stroke-linecap="round"/>
  <g transform="translate(725 238)" stroke="#0f1728" stroke-width="2">
    <rect width="22" height="44" fill="#ffffff"/><rect x="28" width="22" height="44" fill="#ffffff"/><rect x="56" width="22" height="44" fill="#ffffff"/>
    <rect x="84" width="22" height="44" fill="#f6c04d"/><rect x="112" width="22" height="44" fill="#ffffff"/><rect x="140" width="22" height="44" fill="#ffffff"/>
    <rect x="168" width="22" height="44" fill="#ffffff"/>
  </g>
  <text x="110" y="76" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Crossed categories multiply sparse slots</text>
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
    media_path = ROOT / "media" / "videos" / "data_lab" / "480p15" / f"{scene_name}.mp4"
    if not media_path.exists():
        raise FileNotFoundError(f"Expected Manim output not found: {media_path}")
    return media_path


def write_static_posters() -> None:
    for scene, svg in POSTER_SVGS.items():
        filename = SCENES[scene].replace(".mp4", ".svg")
        (PUBLIC_DIR / filename).write_text(svg, encoding="utf8")


def write_metadata() -> None:
    metadata = {
        "generatedBy": "scripts/manim/render_data_lab.py",
        "scenes": [
            {
                "scene": scene,
                "assetPath": f"/manim/data-lab/{filename}",
                "posterPath": f"/manim/data-lab/{filename.replace('.mp4', '.svg')}",
            }
            for scene, filename in SCENES.items()
        ],
    }
    (PUBLIC_DIR / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Render Data Lab Manim videos.")
    parser.add_argument("--skip-render", action="store_true", help="Only rewrite posters and metadata.")
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
