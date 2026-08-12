#!/usr/bin/env python3
"""Selective renderer and read-only validator for optimizer comparison media."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCENE_FILE = ROOT / "scripts/manim/scenes/optimizer_comparison.py"
PUBLIC_DIR = ROOT / "public/manim/optimizer-comparison"
TRAJECTORIES = ROOT / "public/notebooks/optimizer-comparison/optimizer-comparison-trajectories.json"
PUBLISHED_MANIM_VERSION = "Manim Community v0.20.1"
SCENES = {
    "sgd": {"className": "SgdStateScene", "video": "sgd-state.mp4", "shape": "circle", "markers": [0, 9, 18, 27, 35]},
    "momentum": {"className": "MomentumStateScene", "video": "momentum-state.mp4", "shape": "square", "markers": [0, 9, 18, 27, 35]},
    "rmsprop": {"className": "RmspropStateScene", "video": "rmsprop-state.mp4", "shape": "triangle", "markers": [0, 9, 18, 27, 35]},
    "adam": {"className": "AdamStateScene", "video": "adam-state.mp4", "shape": "diamond", "markers": [0, 9, 18, 27, 35]},
}
SOURCES = {
    "sgd": {"prompt": "scripts/manim/optimizer_comparison/sgd-state-prompt.md", "knowledgeTree": "scripts/manim/optimizer_comparison/sgd-state-tree.json", "transcriptZhCN": "docs/curriculum-v3/optimizer-comparison/manim/sgd-state-transcript.zh-CN.md", "transcriptEn": "docs/curriculum-v3/optimizer-comparison/manim/sgd-state-transcript.en.md"},
    "momentum": {"prompt": "scripts/manim/optimizer_comparison/momentum-state-prompt.md", "knowledgeTree": "scripts/manim/optimizer_comparison/momentum-state-tree.json", "transcriptZhCN": "docs/curriculum-v3/optimizer-comparison/manim/momentum-state-transcript.zh-CN.md", "transcriptEn": "docs/curriculum-v3/optimizer-comparison/manim/momentum-state-transcript.en.md"},
    "rmsprop": {"prompt": "scripts/manim/optimizer_comparison/rmsprop-state-prompt.md", "knowledgeTree": "scripts/manim/optimizer_comparison/rmsprop-state-tree.json", "transcriptZhCN": "docs/curriculum-v3/optimizer-comparison/manim/rmsprop-state-transcript.zh-CN.md", "transcriptEn": "docs/curriculum-v3/optimizer-comparison/manim/rmsprop-state-transcript.en.md"},
    "adam": {"prompt": "scripts/manim/optimizer_comparison/adam-state-prompt.md", "knowledgeTree": "scripts/manim/optimizer_comparison/adam-state-tree.json", "transcriptZhCN": "docs/curriculum-v3/optimizer-comparison/manim/adam-state-transcript.zh-CN.md", "transcriptEn": "docs/curriculum-v3/optimizer-comparison/manim/adam-state-transcript.en.md"},
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def probe(path: Path) -> dict:
    output = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate:format=duration", "-of", "json", str(path)], check=True, capture_output=True, text=True)
    payload = json.loads(output.stdout)
    stream = payload["streams"][0]
    numerator, denominator = stream["r_frame_rate"].split("/", 1)
    return {"durationSeconds": round(float(payload["format"]["duration"]), 3), "width": int(stream["width"]), "height": int(stream["height"]), "fps": float(numerator) / float(denominator)}


def anchor(kind: str) -> dict:
    rows = json.loads(TRAJECTORIES.read_text(encoding="utf-8"))["rows"]
    return next(row for row in rows if row["comparison"] == "predeclared-practical" and row["optimizer"] == kind and row["update"] == 1)


def poster(kind: str) -> str:
    scene = SCENES[kind]
    anchor_row = anchor(kind)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="{kind} optimizer state poster">
  <rect width="960" height="540" fill="#f7f9fc"/>
  <g fill="none" stroke="#b4c2d5" stroke-width="3"><ellipse cx="334" cy="292" rx="250" ry="144"/><ellipse cx="334" cy="292" rx="200" ry="112"/><ellipse cx="334" cy="292" rx="146" ry="82"/><ellipse cx="334" cy="292" rx="92" ry="52"/></g>
  <path d="M122 178L270 270L370 286" fill="none" stroke="#253858" stroke-width="8" stroke-linecap="round"/>
  <circle cx="370" cy="286" r="13" fill="#2e7d4f"/><path d="M370 262V310M346 286H394" stroke="#2e7d4f" stroke-width="5"/>
  <rect x="565" y="142" width="330" height="232" rx="18" fill="#fff" stroke="#d3dce9" stroke-width="3"/>
  <text x="80" y="76" fill="#142033" font-family="Arial, sans-serif" font-size="45" font-weight="700">{scene['className'].replace('StateScene', '')}</text>
  <text x="592" y="204" fill="#50617c" font-family="Arial, sans-serif" font-size="23" font-weight="700">SHARED-ENGINE ANCHOR</text>
  <text x="592" y="258" fill="#142033" font-family="Arial, sans-serif" font-size="27">step 1 update norm {anchor_row['updateNorm']:.6f}</text>
  <text x="592" y="305" fill="#142033" font-family="Arial, sans-serif" font-size="27">loss {anchor_row['trainLoss']:.6f}</text>
  <text x="80" y="480" fill="#50617c" font-family="Arial, sans-serif" font-size="25">{scene['shape']} marker + labelled state preserve meaning without color alone</text>
</svg>\n'''


def manim_version() -> str:
    return subprocess.run(["manim", "--version"], check=True, capture_output=True, text=True).stdout.strip()


def metadata_payload() -> dict:
    assets = []
    for kind, scene in SCENES.items():
        video = PUBLIC_DIR / scene["video"]
        poster_path = PUBLIC_DIR / scene["video"].replace(".mp4", ".svg")
        assets.append({
            "id": f"{kind}-state", "kind": kind, "scene": scene["className"],
            "assetPath": f"/manim/optimizer-comparison/{video.name}", "posterPath": f"/manim/optimizer-comparison/{poster_path.name}",
            "shape": scene["shape"], "markers": [{"id": f"{kind}-{index + 1}", "startSeconds": seconds} for index, seconds in enumerate(scene["markers"])],
            "numericAnchor": {"comparison": "predeclared-practical", "update": 1, "updateNorm": anchor(kind)["updateNorm"], "trainLoss": anchor(kind)["trainLoss"]},
            "sha256": sha256(video), "posterSha256": sha256(poster_path), **probe(video), **SOURCES[kind],
        })
    return {"metadataVersion": 1, "generatedBy": "scripts/manim/render_optimizer_comparison.py", "manimVersion": PUBLISHED_MANIM_VERSION, "sourceEngine": "/notebooks/optimizer-comparison/optimizer-comparison-trajectories.json", "assets": assets}


def render(kind: str, quality: str) -> None:
    if shutil.which("manim") is None:
        raise RuntimeError("manim is required to render optimizer comparison scenes")
    if manim_version() != PUBLISHED_MANIM_VERSION:
        raise RuntimeError(f"Rendering requires {PUBLISHED_MANIM_VERSION}; found {manim_version()}")
    scene = SCENES[kind]
    args = ["-ql"] if quality == "preview" else ["-r", "1920,1080", "--fps", "30"]
    media_dir = ROOT / "media"
    subprocess.run(["manim", *args, "--format", "mp4", "--media_dir", str(media_dir), str(SCENE_FILE), scene["className"]], cwd=ROOT, check=True)
    quality_dir = "480p15" if quality == "preview" else "1080p30"
    output = media_dir / "videos" / "optimizer_comparison" / quality_dir / f"{scene['className']}.mp4"
    if not output.is_file():
        raise FileNotFoundError(output)
    if quality == "publish":
        PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copy2(output, PUBLIC_DIR / scene["video"])


def publish_posters() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    for kind, scene in SCENES.items():
        (PUBLIC_DIR / scene["video"].replace(".mp4", ".svg")).write_text(poster(kind), encoding="utf-8")


def check() -> None:
    metadata_path = PUBLIC_DIR / "metadata.json"
    if not SCENE_FILE.is_file() or not TRAJECTORIES.is_file() or not metadata_path.is_file():
        raise SystemExit("Optimizer comparison package is incomplete")
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    if metadata.get("metadataVersion") != 1 or metadata.get("generatedBy") != "scripts/manim/render_optimizer_comparison.py":
        raise SystemExit("Optimizer comparison metadata contract drifted")
    if metadata.get("manimVersion") != PUBLISHED_MANIM_VERSION:
        raise SystemExit("Optimizer comparison Manim version drifted")
    records = {record.get("kind"): record for record in metadata.get("assets", [])}
    if set(records) != set(SCENES):
        raise SystemExit("Optimizer comparison asset inventory drifted")
    for kind, scene in SCENES.items():
        record = records[kind]
        video = PUBLIC_DIR / scene["video"]
        poster_path = PUBLIC_DIR / scene["video"].replace(".mp4", ".svg")
        if not video.is_file() or not poster_path.is_file():
            raise SystemExit(f"Missing published optimizer asset for {kind}")
        if poster_path.read_text(encoding="utf-8") != poster(kind):
            raise SystemExit(f"Poster drift for {kind}")
        if record.get("sha256") != sha256(video) or record.get("posterSha256") != sha256(poster_path):
            raise SystemExit(f"Hash integrity drift for {kind}")
        if record.get("numericAnchor") != {"comparison": "predeclared-practical", "update": 1, "updateNorm": anchor(kind)["updateNorm"], "trainLoss": anchor(kind)["trainLoss"]}:
            raise SystemExit(f"Shared engine numeric anchor drift for {kind}")
        if [marker.get("startSeconds") for marker in record.get("markers", [])] != scene["markers"]:
            raise SystemExit(f"Marker list drift for {kind}")
        info = probe(video)
        if any(record.get(field) != info[field] for field in info) or info["width"] != 1920 or info["height"] != 1080 or info["fps"] != 30 or not 35 <= info["durationSeconds"] <= 55:
            raise SystemExit(f"ffprobe contract failed for {kind}: {info}")
        if any(marker < 0 or marker >= info["durationSeconds"] for marker in scene["markers"]):
            raise SystemExit(f"Marker bounds failed for {kind}")
        for source_path in SOURCES[kind].values():
            source = ROOT / source_path
            if not source.is_file() or not source.read_text(encoding="utf-8").strip():
                raise SystemExit(f"Source/transcript contract failed for {kind}: {source_path}")
    print("Optimizer comparison assets match ffprobe, marker, transcript, source, numeric-anchor, and hash contracts.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Render or verify optimizer comparison Manim packages.")
    parser.add_argument("--scene", choices=sorted(SCENES), help="Render only one optimizer scene.")
    parser.add_argument("--quality", choices=["preview", "publish"], default="preview")
    parser.add_argument("--check", action="store_true", help="Read-only asset integrity verification.")
    args = parser.parse_args()
    if args.check:
        if args.scene:
            parser.error("--check cannot be combined with --scene")
        check()
        return
    for kind in ([args.scene] if args.scene else list(SCENES)):
        render(kind, args.quality)
    if args.quality == "publish":
        publish_posters()
        (PUBLIC_DIR / "metadata.json").write_text(json.dumps(metadata_payload(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
