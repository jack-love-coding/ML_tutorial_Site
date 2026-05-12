from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCENE_FILE = ROOT / "scripts" / "manim" / "scenes" / "mlp_playground.py"
PUBLIC_DIR = ROOT / "public" / "manim" / "mlp"

SCENES = {
    "AffineActivationScene": "affine-activation.mp4",
    "HiddenRewriteScene": "hidden-rewrite.mp4",
    "BackpropResponsibilityScene": "backprop-responsibility.mp4",
    "CapacityOverfittingScene": "capacity-overfitting.mp4",
}

POSTER_SVGS = {
    "AffineActivationScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Affine score and activation poster">
  <rect width="960" height="540" fill="#f8fbff"/>
  <g transform="translate(82 92)">
    <rect width="300" height="300" rx="18" fill="#fff" stroke="#d9e3ee" stroke-width="3"/>
    <path d="M30 208L266 72" stroke="#4f8b5c" stroke-width="7" stroke-linecap="round"/>
    <circle cx="74" cy="90" r="9" fill="#164b83"/><circle cx="118" cy="120" r="9" fill="#164b83"/><circle cx="192" cy="88" r="9" fill="#164b83"/>
    <circle cx="70" cy="228" r="9" fill="#e26d3d"/><circle cx="130" cy="238" r="9" fill="#e26d3d"/><circle cx="214" cy="222" r="9" fill="#e26d3d"/>
  </g>
  <g transform="translate(452 242)">
    <circle r="54" fill="#dff2d7" stroke="#4f8b5c" stroke-width="6"/>
    <path d="M-30 16C-12 18-14-18 5-18C24-18 18 18 38 12" fill="none" stroke="#2b6d3c" stroke-width="5"/>
    <path d="M-120 0H-62M62 0H146" stroke="#4f8b5c" stroke-width="6" stroke-linecap="round"/>
    <path d="M146 0L124-14L124 14Z" fill="#4f8b5c"/>
  </g>
  <path d="M660 350C700 344 700 172 744 166C788 160 790 92 878 88" fill="none" stroke="#164b83" stroke-width="12" stroke-linecap="round"/>
  <path d="M650 360C696 352 696 196 744 184C792 172 792 118 880 110" fill="none" stroke="#e26d3d" stroke-width="12" stroke-linecap="round" opacity=".7"/>
  <text x="78" y="56" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Affine score, then activation</text>
</svg>
""",
    "HiddenRewriteScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Hidden representation rewrite poster">
  <rect width="960" height="540" fill="#f8fbff"/>
  <g fill="none" stroke="#102a4c" stroke-width="4">
    <path d="M68 430V120M68 430H330M632 430V120M632 430H894"/>
  </g>
  <g>
    <circle cx="110" cy="170" r="8" fill="#256bd9"/><circle cx="150" cy="210" r="8" fill="#256bd9"/><circle cx="205" cy="270" r="8" fill="#256bd9"/><circle cx="280" cy="330" r="8" fill="#256bd9"/>
    <circle cx="105" cy="336" r="8" fill="#e26d3d"/><circle cx="160" cy="294" r="8" fill="#e26d3d"/><circle cx="218" cy="230" r="8" fill="#e26d3d"/><circle cx="285" cy="174" r="8" fill="#e26d3d"/>
    <circle cx="702" cy="170" r="8" fill="#256bd9"/><circle cx="740" cy="208" r="8" fill="#256bd9"/><circle cx="782" cy="248" r="8" fill="#256bd9"/>
    <circle cx="704" cy="332" r="8" fill="#e26d3d"/><circle cx="746" cy="368" r="8" fill="#e26d3d"/><circle cx="804" cy="392" r="8" fill="#e26d3d"/>
  </g>
  <path d="M710 284C760 250 815 234 874 214" stroke="#4f8b5c" stroke-width="7" stroke-dasharray="15 13" fill="none"/>
  <g stroke="#102a4c" stroke-width="4" fill="#dff2d7" transform="translate(470 270)">
    <circle cx="-80" cy="-48" r="22"/><circle cx="-80" cy="48" r="22"/><circle cx="28" cy="-76" r="22"/><circle cx="28" cy="0" r="22"/><circle cx="28" cy="76" r="22"/>
  </g>
  <text x="70" y="56" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Hidden space rewrites geometry</text>
</svg>
""",
    "BackpropResponsibilityScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Backpropagation responsibility poster">
  <rect width="960" height="540" fill="#fffaf6"/>
  <g stroke="#102a4c" stroke-width="5" stroke-opacity=".5">
    <path d="M145 210L350 150M145 330L350 150M145 210L350 270M145 330L350 270M350 150L570 210M350 270L570 210M350 150L570 330M350 270L570 330M570 210L790 270M570 330L790 270"/>
  </g>
  <g fill="#dff2d7" stroke="#4f8b5c" stroke-width="5">
    <circle cx="350" cy="150" r="31"/><circle cx="350" cy="270" r="31"/><circle cx="570" cy="210" r="31"/><circle cx="570" cy="330" r="31"/>
  </g>
  <g fill="#dcecff" stroke="#256bd9" stroke-width="5"><circle cx="145" cy="210" r="34"/><circle cx="145" cy="330" r="34"/></g>
  <circle cx="790" cy="270" r="38" fill="#ffe1d5" stroke="#e26d3d" stroke-width="6"/>
  <g fill="none" stroke="#e26d3d" stroke-width="9" stroke-linecap="round">
    <path d="M756 260C690 242 648 224 600 210"/><path d="M758 282C690 306 650 324 600 330"/><path d="M534 330C480 320 430 295 380 278"/><path d="M318 268C260 282 220 306 178 326"/>
  </g>
  <text x="72" y="56" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Loss signal flows backward</text>
</svg>
""",
    "CapacityOverfittingScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Capacity overfitting poster">
  <rect width="960" height="540" fill="#f8fbff"/>
  <g transform="translate(60 126)">
    <g stroke="#102a4c" stroke-width="4"><path d="M0 280V0M0 280H240"/></g>
    <path d="M0 238L238 60" stroke="#4f8b5c" stroke-width="7" fill="none"/>
    <g fill="#256bd9"><circle cx="38" cy="74" r="7"/><circle cx="74" cy="96" r="7"/><circle cx="126" cy="118" r="7"/></g>
    <g fill="#e26d3d"><circle cx="70" cy="226" r="7"/><circle cx="142" cy="208" r="7"/><circle cx="202" cy="218" r="7"/></g>
  </g>
  <g transform="translate(360 126)">
    <g stroke="#102a4c" stroke-width="4"><path d="M0 280V0M0 280H240"/></g>
    <path d="M0 260C72 220 100 158 132 128C166 96 190 78 238 70" stroke="#4f8b5c" stroke-width="7" fill="none"/>
    <g fill="#256bd9"><circle cx="34" cy="74" r="7"/><circle cx="78" cy="86" r="7"/><circle cx="144" cy="82" r="7"/></g>
    <g fill="#e26d3d"><circle cx="64" cy="226" r="7"/><circle cx="138" cy="214" r="7"/><circle cx="204" cy="218" r="7"/></g>
  </g>
  <g transform="translate(660 126)">
    <g stroke="#102a4c" stroke-width="4"><path d="M0 280V0M0 280H240"/></g>
    <path d="M6 230C32 170 58 262 84 202C112 136 144 228 168 122C190 44 214 118 238 68" stroke="#4f8b5c" stroke-width="7" fill="none"/>
    <g fill="#256bd9"><circle cx="36" cy="74" r="7"/><circle cx="80" cy="96" r="7"/><circle cx="142" cy="82" r="7"/></g>
    <g fill="#e26d3d"><circle cx="58" cy="230" r="7"/><circle cx="132" cy="210" r="7"/><circle cx="208" cy="226" r="7"/></g>
  </g>
  <text x="72" y="56" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Capacity changes boundary shape</text>
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
    media_path = ROOT / "media" / "videos" / "mlp_playground" / "480p15" / f"{scene_name}.mp4"
    if not media_path.exists():
        raise FileNotFoundError(f"Expected Manim output not found: {media_path}")
    return media_path


def write_metadata() -> None:
    metadata = {
        "generatedBy": "scripts/manim/render_mlp.py",
        "scenes": [
            {
                "scene": scene,
                "assetPath": f"/manim/mlp/{filename}",
                "posterPath": f"/manim/mlp/{filename.replace('.mp4', '.svg')}",
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
    parser = argparse.ArgumentParser(description="Render MLP Playground Manim videos.")
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

