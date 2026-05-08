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


def main() -> None:
    parser = argparse.ArgumentParser(description="Render Math Intuition Lab Manim videos.")
    parser.add_argument("--skip-render", action="store_true", help="Only rewrite metadata.")
    args = parser.parse_args()

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    if not args.skip_render:
        for scene_name, filename in SCENES.items():
            output = render_scene(scene_name)
            shutil.copyfile(output, PUBLIC_DIR / filename)

    write_metadata()


if __name__ == "__main__":
    main()
