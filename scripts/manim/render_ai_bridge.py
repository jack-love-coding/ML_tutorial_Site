from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCENE_FILE = ROOT / "scripts" / "manim" / "scenes" / "ai_bridge_math.py"
PUBLIC_DIR = ROOT / "public" / "manim" / "math-ai"

SCENES = {
    "TensorBroadcastingScene": "tensor-broadcasting.mp4",
    "AutodiffVjpFlowScene": "autodiff-vjp-flow.mp4",
    "SoftmaxCrossEntropyScene": "softmax-cross-entropy.mp4",
    "TrainingLossDiagnosticsScene": "training-loss-diagnostics.mp4",
    "AttentionConvResidualScene": "attention-conv-residual.mp4",
}

POSTER_SVGS = {
    "TensorBroadcastingScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Tensor shape broadcasting poster">
  <rect width="960" height="540" fill="#f7fbff"/>
  <g transform="translate(92 126)" fill="#d8f6ff" stroke="#10162f" stroke-width="3">
    <rect width="210" height="250" rx="16"/>
    <g opacity=".45"><path d="M52 0V250M104 0V250M156 0V250M0 50H210M0 100H210M0 150H210M0 200H210"/></g>
  </g>
  <g transform="translate(376 116)" fill="#e7ddff" stroke="#10162f" stroke-width="3">
    <rect width="150" height="270" rx="16"/>
    <g opacity=".45"><path d="M50 0V270M100 0V270M0 68H150M0 136H150M0 204H150"/></g>
  </g>
  <g transform="translate(620 138)" fill="#dffbe9" stroke="#10162f" stroke-width="3">
    <rect width="168" height="226" rx="16"/>
    <g opacity=".45"><path d="M56 0V226M112 0V226M0 45H168M0 90H168M0 135H168M0 180H168"/></g>
  </g>
  <g stroke="#10162f" stroke-width="8" stroke-linecap="round" fill="none">
    <path d="M318 255H356"/><path d="M542 255H592"/>
  </g>
  <path d="M594 255L572 241V269Z" fill="#10162f"/>
  <g fill="#ffd84d" stroke="#10162f" stroke-width="3">
    <circle cx="574" cy="180" r="18"/><circle cx="574" cy="230" r="18"/><circle cx="574" cy="280" r="18"/>
  </g>
</svg>
""",
    "AutodiffVjpFlowScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Autodiff VJP flow poster">
  <rect width="960" height="540" fill="#fffef7"/>
  <g stroke="#10162f" stroke-width="5" opacity=".35">
    <path d="M150 178L365 230M150 362L365 230M365 230L570 270M365 320L570 270M570 270L770 270"/>
  </g>
  <g fill="#d8f6ff" stroke="#10162f" stroke-width="5"><circle cx="150" cy="178" r="42"/><circle cx="150" cy="362" r="42"/></g>
  <g fill="#dffbe9" stroke="#10162f" stroke-width="5"><circle cx="365" cy="230" r="42"/><circle cx="365" cy="320" r="42"/></g>
  <circle cx="570" cy="270" r="48" fill="#e7ddff" stroke="#10162f" stroke-width="5"/>
  <circle cx="770" cy="270" r="52" fill="#ffd6c8" stroke="#10162f" stroke-width="5"/>
  <g stroke="#d65a31" stroke-width="12" stroke-linecap="round" fill="none">
    <path d="M730 270C660 252 626 246 596 258"/><path d="M528 270C468 254 430 240 398 232"/><path d="M330 230C260 210 220 190 184 178"/>
  </g>
  <rect x="354" y="418" width="250" height="62" rx="12" fill="#fff2ad" stroke="#10162f" stroke-width="4" transform="rotate(-8 479 449)"/>
</svg>
""",
    "SoftmaxCrossEntropyScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Probability simplex and softmax poster">
  <rect width="960" height="540" fill="#f8fbff"/>
  <path d="M168 372L304 136L448 372Z" fill="#ffffff" stroke="#10162f" stroke-width="5"/>
  <circle cx="330" cy="270" r="19" fill="#ffd84d" stroke="#10162f" stroke-width="4"/>
  <path d="M616 408V154" stroke="#10162f" stroke-width="5" stroke-linecap="round"/>
  <path d="M584 408H858" stroke="#10162f" stroke-width="5" stroke-linecap="round"/>
  <g stroke="#10162f" stroke-width="4">
    <rect x="626" y="304" width="46" height="104" fill="#d8f6ff"/>
    <rect x="704" y="182" width="46" height="226" fill="#ffd84d"/>
    <rect x="782" y="348" width="46" height="60" fill="#d8f6ff"/>
  </g>
  <circle cx="727" cy="158" r="34" fill="none" stroke="#d65a31" stroke-width="7"/>
</svg>
""",
    "TrainingLossDiagnosticsScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Training diagnostics curve poster">
  <rect width="960" height="540" fill="#fff8f3"/>
  <g stroke="#10162f" stroke-width="5" stroke-linecap="round">
    <path d="M112 430H854"/><path d="M112 430V102"/>
  </g>
  <path d="M132 128C236 202 318 274 430 322C556 376 684 398 832 410" fill="none" stroke="#3868ff" stroke-width="10" stroke-linecap="round"/>
  <path d="M132 150C254 214 356 276 466 300C600 330 700 322 832 242" fill="none" stroke="#d65a31" stroke-width="10" stroke-linecap="round"/>
  <path d="M132 390C220 358 280 406 356 334C430 264 502 382 576 248C652 112 728 260 832 126" fill="none" stroke="#0f9f7a" stroke-width="8" stroke-linecap="round" opacity=".75"/>
  <g stroke="#ffd84d" stroke-width="7" stroke-linecap="round">
    <path d="M188 424V374"/><path d="M292 424V344"/><path d="M396 424V392"/><path d="M500 424V276"/><path d="M604 424V316"/><path d="M708 424V180"/>
  </g>
</svg>
""",
    "AttentionConvResidualScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Architecture math flow poster">
  <rect width="960" height="540" fill="#f4fbf8"/>
  <g transform="translate(96 104)" fill="#d8f6ff" stroke="#10162f" stroke-width="3">
    <rect width="190" height="190" rx="14"/>
    <g opacity=".45"><path d="M47 0V190M94 0V190M141 0V190M0 47H190M0 94H190M0 141H190"/></g>
    <rect x="48" y="48" width="94" height="94" fill="#fff2ad" opacity=".85"/>
  </g>
  <g fill="#dffbe9" stroke="#10162f" stroke-width="5">
    <circle cx="424" cy="154" r="28"/><circle cx="504" cy="112" r="28"/><circle cx="596" cy="164" r="28"/><circle cx="506" cy="228" r="28"/>
  </g>
  <circle cx="746" cy="166" r="36" fill="#ffd84d" stroke="#10162f" stroke-width="5"/>
  <g stroke="#0f9f7a" stroke-width="6" stroke-linecap="round" opacity=".65">
    <path d="M424 154L746 166"/><path d="M504 112L746 166"/><path d="M596 164L746 166"/><path d="M506 228L746 166"/>
  </g>
  <path d="M174 410H650" stroke="#10162f" stroke-width="8" stroke-linecap="round" opacity=".38"/>
  <path d="M174 410C326 336 496 336 650 410" fill="none" stroke="#ffd84d" stroke-width="9" stroke-linecap="round"/>
  <rect x="690" y="362" width="106" height="96" rx="14" fill="#e7ddff" stroke="#10162f" stroke-width="5"/>
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
    media_path = ROOT / "media" / "videos" / "ai_bridge_math" / "480p15" / f"{scene_name}.mp4"
    if not media_path.exists():
        raise FileNotFoundError(f"Expected Manim output not found: {media_path}")
    return media_path


def write_metadata() -> None:
    metadata = {
        "generatedBy": "scripts/manim/render_ai_bridge.py",
        "scenes": [
            {
                "scene": scene,
                "assetPath": f"/manim/math-ai/{filename}",
                "posterPath": f"/manim/math-ai/{filename.replace('.mp4', '.svg')}",
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
    parser = argparse.ArgumentParser(description="Render Math Lab AI Bridge Manim videos.")
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
