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

POSTER_SVGS = {
    "AffineActivationScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Affine score and activation poster">
  <rect width="960" height="540" fill="#f6f7f9"/>
  <g stroke="#d9dee8" stroke-width="1">
    <path d="M96 110H422M96 164H422M96 218H422M96 272H422M96 326H422M96 380H422"/>
    <path d="M150 80V410M204 80V410M258 80V410M312 80V410M366 80V410"/>
  </g>
  <path d="M96 245H422M259 80V410" stroke="#8b95a5" stroke-width="2"/>
  <path d="M116 338C182 302 247 258 306 204C347 166 376 137 410 112" fill="none" stroke="#172033" stroke-width="7" stroke-linecap="round"/>
  <path d="M118 292C178 267 251 218 318 156" fill="none" stroke="#256bd9" stroke-width="4" stroke-dasharray="10 9"/>
  <g fill="#256bd9" stroke="#fff" stroke-width="3">
    <circle cx="154" cy="154" r="8"/><circle cx="194" cy="184" r="8"/><circle cx="246" cy="166" r="8"/><circle cx="316" cy="122" r="8"/>
  </g>
  <g fill="#e26d3d" stroke="#fff" stroke-width="3">
    <circle cx="152" cy="345" r="8"/><circle cx="218" cy="326" r="8"/><circle cx="290" cy="344" r="8"/><circle cx="360" cy="298" r="8"/>
  </g>
  <g transform="translate(502 138)">
    <circle cx="78" cy="132" r="54" fill="#fff" stroke="#172033" stroke-width="5"/>
    <path d="M45 141C61 146 59 117 76 117C94 117 91 146 112 137" fill="none" stroke="#4d63ff" stroke-width="5" stroke-linecap="round"/>
    <path d="M0 132H24M132 132H182" stroke="#172033" stroke-width="5" stroke-linecap="round"/>
    <path d="M182 132L164 121V143Z" fill="#172033"/>
  </g>
  <g transform="translate(715 122)">
    <path d="M0 250H170M0 250V28" stroke="#8b95a5" stroke-width="2"/>
    <path d="M2 214C38 212 54 156 82 138C111 119 111 70 168 62" fill="none" stroke="#256bd9" stroke-width="8" stroke-linecap="round"/>
    <path d="M2 226C43 220 58 178 84 160C114 139 122 98 168 88" fill="none" stroke="#e26d3d" stroke-width="8" stroke-linecap="round" opacity=".72"/>
  </g>
  <text x="84" y="56" fill="#101828" font-family="Arial, sans-serif" font-size="34" font-weight="700">Affine score, then activation</text>
  <text x="84" y="486" fill="#667085" font-family="Arial, sans-serif" font-size="22">A directional score becomes a nonlinear response field.</text>
</svg>
""",
    "HiddenRewriteScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Hidden representation rewrite poster">
  <rect width="960" height="540" fill="#f6f7f9"/>
  <g stroke="#d9dee8" stroke-width="1">
    <path d="M86 150H350M86 214H350M86 278H350M86 342H350M86 406H350"/>
    <path d="M150 104V430M214 104V430M278 104V430M646 150H884M646 214H884M646 278H884M646 342H884M646 406H884"/>
    <path d="M706 104V430M766 104V430M826 104V430"/>
  </g>
  <path d="M86 430H350M86 104V430M646 430H884M646 104V430" stroke="#8b95a5" stroke-width="2"/>
  <g fill="#256bd9" stroke="#fff" stroke-width="3">
    <circle cx="122" cy="166" r="8"/><circle cx="166" cy="206" r="8"/><circle cx="226" cy="270" r="8"/><circle cx="306" cy="338" r="8"/>
    <circle cx="698" cy="166" r="8"/><circle cx="732" cy="196" r="8"/><circle cx="772" cy="226" r="8"/><circle cx="812" cy="246" r="8"/>
  </g>
  <g fill="#e26d3d" stroke="#fff" stroke-width="3">
    <circle cx="124" cy="342" r="8"/><circle cx="172" cy="302" r="8"/><circle cx="230" cy="238" r="8"/><circle cx="308" cy="174" r="8"/>
    <circle cx="700" cy="334" r="8"/><circle cx="744" cy="360" r="8"/><circle cx="790" cy="384" r="8"/><circle cx="832" cy="396" r="8"/>
  </g>
  <path d="M684 286C734 262 794 250 864 226" stroke="#172033" stroke-width="6" stroke-dasharray="12 10" fill="none"/>
  <g transform="translate(420 180)" fill="#fff" stroke="#172033" stroke-width="3">
    <circle cx="0" cy="44" r="21"/><circle cx="0" cy="134" r="21"/><circle cx="108" cy="18" r="21"/><circle cx="108" cy="88" r="21"/><circle cx="108" cy="158" r="21"/>
  </g>
  <g stroke="#4d63ff" stroke-width="4" stroke-linecap="round">
    <path d="M450 224C485 209 500 205 528 198"/><path d="M450 224C486 248 501 259 528 268"/><path d="M450 314C486 294 501 286 528 268"/><path d="M450 314C486 326 501 337 528 338"/>
  </g>
  <text x="84" y="62" fill="#101828" font-family="Arial, sans-serif" font-size="34" font-weight="700">Hidden space rewrites geometry</text>
  <text x="84" y="486" fill="#667085" font-family="Arial, sans-serif" font-size="22">The final layer reads a cleaner representation than the raw input plane.</text>
</svg>
""",
    "BackpropResponsibilityScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Backpropagation responsibility poster">
  <rect width="960" height="540" fill="#f6f7f9"/>
  <g stroke="#cfd6e2" stroke-width="5" stroke-opacity=".72" stroke-linecap="round">
    <path d="M140 210L334 150M140 330L334 150M140 210L334 270M140 330L334 270M334 150L560 210M334 270L560 210M334 150L560 330M334 270L560 330M560 210L782 270M560 330L782 270"/>
  </g>
  <g fill="#fff" stroke="#172033" stroke-width="5">
    <circle cx="140" cy="210" r="31"/><circle cx="140" cy="330" r="31"/>
    <circle cx="334" cy="150" r="29"/><circle cx="334" cy="270" r="29"/>
    <circle cx="560" cy="210" r="29"/><circle cx="560" cy="330" r="29"/>
  </g>
  <circle cx="782" cy="270" r="38" fill="#fff" stroke="#172033" stroke-width="6"/>
  <circle cx="850" cy="270" r="27" fill="#ffe9e2" stroke="#e26d3d" stroke-width="5"/>
  <text x="839" y="279" fill="#e26d3d" font-family="Arial, sans-serif" font-size="28" font-weight="700">L</text>
  <g fill="none" stroke="#e26d3d" stroke-linecap="round">
    <path d="M824 270C756 256 682 232 590 213" stroke-width="9"/>
    <path d="M824 270C754 294 682 318 590 329" stroke-width="8" opacity=".82"/>
    <path d="M532 329C474 319 418 294 365 276" stroke-width="7" opacity=".7"/>
    <path d="M306 267C246 280 202 307 168 326" stroke-width="6" opacity=".58"/>
  </g>
  <text x="84" y="62" fill="#101828" font-family="Arial, sans-serif" font-size="34" font-weight="700">Loss signal flows backward</text>
  <text x="84" y="486" fill="#667085" font-family="Arial, sans-serif" font-size="22">Gradients assign responsibility to links and biases across the graph.</text>
</svg>
""",
    "CapacityOverfittingScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Capacity overfitting poster">
  <rect width="960" height="540" fill="#f6f7f9"/>
  <g font-family="Arial, sans-serif">
    <g transform="translate(70 130)">
      <rect width="236" height="246" rx="10" fill="#fff" stroke="#d9dee8"/>
      <path d="M24 214H214M24 214V26" stroke="#8b95a5" stroke-width="2"/>
      <path d="M30 184L210 68" stroke="#172033" stroke-width="7" stroke-linecap="round" fill="none"/>
      <g fill="#256bd9" stroke="#fff" stroke-width="3"><circle cx="58" cy="72" r="8"/><circle cx="104" cy="98" r="8"/><circle cx="154" cy="112" r="8"/></g>
      <g fill="#e26d3d" stroke="#fff" stroke-width="3"><circle cx="70" cy="188" r="8"/><circle cx="134" cy="172" r="8"/><circle cx="190" cy="184" r="8"/></g>
      <text x="24" y="284" fill="#667085" font-size="22" font-weight="700">underfit</text>
    </g>
    <g transform="translate(362 130)">
      <rect width="236" height="246" rx="10" fill="#fff" stroke="#d9dee8"/>
      <path d="M24 214H214M24 214V26" stroke="#8b95a5" stroke-width="2"/>
      <path d="M30 202C82 178 102 130 128 106C156 80 180 70 210 62" stroke="#172033" stroke-width="7" stroke-linecap="round" fill="none"/>
      <g fill="#256bd9" stroke="#fff" stroke-width="3"><circle cx="56" cy="72" r="8"/><circle cx="104" cy="86" r="8"/><circle cx="154" cy="78" r="8"/></g>
      <g fill="#e26d3d" stroke="#fff" stroke-width="3"><circle cx="68" cy="188" r="8"/><circle cx="134" cy="174" r="8"/><circle cx="192" cy="184" r="8"/></g>
      <text x="24" y="284" fill="#667085" font-size="22" font-weight="700">balanced</text>
    </g>
    <g transform="translate(654 130)">
      <rect width="236" height="246" rx="10" fill="#fff" stroke="#d9dee8"/>
      <path d="M24 214H214M24 214V26" stroke="#8b95a5" stroke-width="2"/>
      <path d="M30 188C52 116 78 222 104 166C132 92 158 206 178 96C190 38 202 110 212 64" stroke="#172033" stroke-width="7" stroke-linecap="round" fill="none"/>
      <g fill="#256bd9" stroke="#fff" stroke-width="3"><circle cx="58" cy="72" r="8"/><circle cx="104" cy="98" r="8"/><circle cx="154" cy="78" r="8"/></g>
      <g fill="#e26d3d" stroke="#fff" stroke-width="3"><circle cx="66" cy="190" r="8"/><circle cx="136" cy="174" r="8"/><circle cx="194" cy="190" r="8"/></g>
      <text x="24" y="284" fill="#667085" font-size="22" font-weight="700">overfit</text>
    </g>
  </g>
  <text x="84" y="62" fill="#101828" font-family="Arial, sans-serif" font-size="34" font-weight="700">Capacity changes boundary shape</text>
  <text x="84" y="486" fill="#667085" font-family="Arial, sans-serif" font-size="22">Training loss alone cannot choose the right boundary.</text>
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
