from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCENE_FILE = ROOT / "scripts" / "manim" / "scenes" / "gradient_descent_deep_dive.py"
PUBLIC_DIR = ROOT / "public" / "manim" / "gradient-descent"
VIDEO = PUBLIC_DIR / "gradient-rule.mp4"
POSTER = PUBLIC_DIR / "gradient-rule.svg"
METADATA = PUBLIC_DIR / "metadata.json"
PUBLISHED_MANIM_VERSION = "Manim Community v0.20.1"
SCENE = "GradientRuleDeepDiveScene"
CHAPTERS = [
    {"id": "data-model", "startSeconds": 0},
    {"id": "prediction-error", "startSeconds": 12},
    {"id": "loss-slice", "startSeconds": 24},
    {"id": "uphill-gradient", "startSeconds": 36},
    {"id": "negative-direction", "startSeconds": 48},
    {"id": "learning-rate", "startSeconds": 60},
    {"id": "update-verify", "startSeconds": 72},
]
SOURCES = {
    "prompt": "scripts/manim/gradient-descent/gradient-rule-prompt.md",
    "knowledgeTree": "scripts/manim/gradient-descent/gradient-rule-tree.json",
    "transcriptZhCN": "docs/curriculum-v3/gradient-descent/manim/gradient-rule-transcript.zh-CN.md",
    "transcriptEn": "docs/curriculum-v3/gradient-descent/manim/gradient-rule-transcript.en.md",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def probe(path: Path) -> dict:
    result = subprocess.run([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height,r_frame_rate:format=duration",
        "-of", "json", str(path),
    ], check=True, capture_output=True, text=True)
    payload = json.loads(result.stdout)
    stream = payload["streams"][0]
    numerator, denominator = stream["r_frame_rate"].split("/", 1)
    return {
        "durationSeconds": round(float(payload["format"]["duration"]), 3),
        "width": int(stream["width"]),
        "height": int(stream["height"]),
        "fps": float(numerator) / float(denominator),
    }


def metadata_payload() -> dict:
    video = probe(VIDEO)
    return {
        "metadataVersion": 1,
        "generatedBy": "scripts/manim/render_gradient_descent.py",
        "manimVersion": PUBLISHED_MANIM_VERSION,
        "scene": SCENE,
        "assetPath": "/manim/gradient-descent/gradient-rule.mp4",
        "posterPath": "/manim/gradient-descent/gradient-rule.svg",
        "sha256": sha256(VIDEO),
        "posterSha256": sha256(POSTER),
        **video,
        **SOURCES,
        "chapters": CHAPTERS,
    }


def render(quality: str) -> None:
    if shutil.which("manim") is None:
        raise RuntimeError("manim is required to render the gradient-descent scene")
    args = ["-ql"] if quality == "preview" else ["-r", "1920,1080", "--fps", "30"]
    subprocess.run([
        "manim", *args, "--format", "mp4", "--media_dir", str(ROOT / "media"),
        str(SCENE_FILE), SCENE,
    ], cwd=ROOT, check=True)
    directory = "480p15" if quality == "preview" else "1080p30"
    source = ROOT / "media" / "videos" / "gradient_descent_deep_dive" / directory / f"{SCENE}.mp4"
    if not source.exists():
        raise FileNotFoundError(source)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, VIDEO)
    METADATA.write_text(json.dumps(metadata_payload(), indent=2) + "\n", encoding="utf-8")
    print(f"Published {VIDEO}")


def check() -> None:
    if not all(path.exists() for path in [SCENE_FILE, VIDEO, POSTER, METADATA]):
        raise SystemExit("Gradient-descent Manim package is incomplete")
    metadata = json.loads(METADATA.read_text(encoding="utf-8"))
    actual = metadata_payload()
    if metadata != actual:
        raise SystemExit("Gradient-descent Manim metadata or hashes drifted")
    if actual["width"] != 1920 or actual["height"] != 1080 or actual["fps"] != 30:
        raise SystemExit("Published gradient-descent video must be 1920x1080 at 30fps")
    if not 75 <= actual["durationSeconds"] <= 90:
        raise SystemExit(f"Published duration {actual['durationSeconds']} is outside 75–90 seconds")
    if any(not (ROOT / value).exists() for value in SOURCES.values()):
        raise SystemExit("A prompt, knowledge tree, or transcript is missing")
    print("Gradient-descent Manim assets match probes, hashes, chapters, and source records")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scene", default=SCENE, choices=[SCENE])
    parser.add_argument("--quality", default="publish", choices=["preview", "publish"])
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.check:
        check()
    else:
        render(args.quality)


if __name__ == "__main__":
    main()
