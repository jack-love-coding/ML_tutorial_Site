#!/usr/bin/env python3
"""Selective, fail-closed renderer for Phase 29 logistic-regression media.

``--validate-sources`` is deliberately read-only and validates the numerical
authority before Manim is launched. ``--check`` is also read-only and is the
release gate once Plan 29-04 has published all four binary packages.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import shutil
import subprocess
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
SCENE_FILE = ROOT / "scripts" / "manim" / "scenes" / "logistic_regression.py"
PUBLIC_DIR = ROOT / "public" / "manim" / "logistic-regression"
PUBLISHED_MANIM_VERSION = "Manim Community v0.20.1"
SCENES = {
    "linear-score-to-sigmoid": {
        "className": "LinearScoreToSigmoidScene", "video": "linear-score-to-sigmoid.mp4", "durationSeconds": 42,
        "markers": [0, 10, 21, 32],
    },
    "likelihood-to-bce-gradient": {
        "className": "LikelihoodBceGradientScene", "video": "likelihood-to-bce-gradient.mp4", "durationSeconds": 48,
        "markers": [0, 12, 24, 36],
    },
    "log-loss-confident-mistake": {
        "className": "ConfidentMistakeScene", "video": "log-loss-confident-mistake.mp4", "durationSeconds": 38,
        "markers": [0, 10, 20, 29],
    },
    "regularization-confidence-field": {
        "className": "RegularizationConfidenceScene", "video": "regularization-confidence-field.mp4", "durationSeconds": 38,
        "markers": [0, 10, 20, 29],
    },
}
SOURCES = {
    "linear-score-to-sigmoid": {
        "prompt": "scripts/manim/logistic_regression/linear-score-to-sigmoid-prompt.md",
        "knowledgeTree": "scripts/manim/logistic_regression/linear-score-to-sigmoid-tree.json",
        "transcriptZhCN": "docs/curriculum-v3/logistic-regression/manim/linear-score-to-sigmoid-transcript.zh-CN.md",
        "transcriptEn": "docs/curriculum-v3/logistic-regression/manim/linear-score-to-sigmoid-transcript.en.md",
    },
    "likelihood-to-bce-gradient": {
        "prompt": "scripts/manim/logistic_regression/likelihood-to-bce-gradient-prompt.md",
        "knowledgeTree": "scripts/manim/logistic_regression/likelihood-to-bce-gradient-tree.json",
        "transcriptZhCN": "docs/curriculum-v3/logistic-regression/manim/likelihood-to-bce-gradient-transcript.zh-CN.md",
        "transcriptEn": "docs/curriculum-v3/logistic-regression/manim/likelihood-to-bce-gradient-transcript.en.md",
    },
    "log-loss-confident-mistake": {
        "prompt": "scripts/manim/logistic_regression/log-loss-confident-mistake-prompt.md",
        "knowledgeTree": "scripts/manim/logistic_regression/log-loss-confident-mistake-tree.json",
        "transcriptZhCN": "docs/curriculum-v3/logistic-regression/manim/log-loss-confident-mistake-transcript.zh-CN.md",
        "transcriptEn": "docs/curriculum-v3/logistic-regression/manim/log-loss-confident-mistake-transcript.en.md",
    },
    "regularization-confidence-field": {
        "prompt": "scripts/manim/logistic_regression/regularization-confidence-field-prompt.md",
        "knowledgeTree": "scripts/manim/logistic_regression/regularization-confidence-field-tree.json",
        "transcriptZhCN": "docs/curriculum-v3/logistic-regression/manim/regularization-confidence-field-transcript.zh-CN.md",
        "transcriptEn": "docs/curriculum-v3/logistic-regression/manim/regularization-confidence-field-transcript.en.md",
    },
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _load_scene_module() -> Any:
    spec = importlib.util.spec_from_file_location("phase29_logistic_scenes", SCENE_FILE)
    if spec is None or spec.loader is None:
        raise RuntimeError("Could not load logistic Manim scene source")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def validate_sources(scene_id: str | None = None) -> None:
    """Verify identity, source-cell, hash, and finite-value contracts pre-render."""
    if not SCENE_FILE.is_file():
        raise SystemExit(f"Missing scene source: {SCENE_FILE}")
    module = _load_scene_module()
    scene_ids = [scene_id] if scene_id else list(SCENES)
    for selected in scene_ids:
        spec = SCENES[selected]
        if not isinstance(getattr(module, spec["className"], None), type):
            raise SystemExit(f"Scene class missing: {spec['className']}")
        try:
            anchors = module.load_phase29_anchors(selected)
        except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as error:
            raise SystemExit(f"Phase 29 anchor contract failed for {selected}: {error}") from error
        if not anchors:
            raise SystemExit(f"Empty anchor contract for {selected}")
    print(f"Validated {len(scene_ids)} logistic scenes against Phase 29 manifest identities, source cells, hashes, and numeric anchors.")


def manim_version() -> str:
    return subprocess.run(["manim", "--version"], check=True, capture_output=True, text=True).stdout.strip()


def render(scene_id: str, quality: str) -> None:
    validate_sources(scene_id)
    if shutil.which("manim") is None:
        raise RuntimeError("manim is required to render logistic-regression scenes")
    if manim_version() != PUBLISHED_MANIM_VERSION:
        raise RuntimeError(f"Rendering requires {PUBLISHED_MANIM_VERSION}; found {manim_version()}")
    scene = SCENES[scene_id]
    args = ["-ql"] if quality == "preview" else ["-r", "1920,1080", "--fps", "30"]
    media_dir = ROOT / "media"
    subprocess.run(
        ["manim", *args, "--format", "mp4", "--media_dir", str(media_dir), str(SCENE_FILE), scene["className"]],
        cwd=ROOT,
        check=True,
    )
    quality_dir = "480p15" if quality == "preview" else "1080p30"
    output = media_dir / "videos" / "logistic_regression" / quality_dir / f"{scene['className']}.mp4"
    if not output.is_file():
        raise FileNotFoundError(output)
    if quality == "publish":
        PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copy2(output, PUBLIC_DIR / scene["video"])


def poster(scene_id: str) -> str:
    """Language-neutral SVG poster, intentionally generated from named scene data."""
    labels = {
        "linear-score-to-sigmoid": (r"z=w^Tx+b", r"p=σ(z)", "#285c9e", "#2e7d4f"),
        "likelihood-to-bce-gradient": (r"∏qᵢ → ∑log qᵢ", r"θ ← θ−η∇L", "#b13a3a", "#c05931"),
        "log-loss-confident-mistake": (r"ℓ(z,y)=softplus(z)−yz", r"∂L/∂θ", "#b13a3a", "#c05931"),
        "regularization-confidence-field": (r"BCE + λ‖w‖²/2", r"λ = 0.05", "#285c9e", "#c05931"),
    }
    first, second, primary, secondary = labels[scene_id]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="{scene_id} mathematical teaching poster">
  <rect width="960" height="540" fill="#f7f9fc"/>
  <rect x="70" y="94" width="820" height="352" rx="26" fill="#ffffff" stroke="#c8d2e1" stroke-width="4"/>
  <path d="M124 388 C260 368 334 138 478 250 S722 310 832 144" fill="none" stroke="{primary}" stroke-width="12" stroke-linecap="round"/>
  <path d="M116 350 H848 M480 126 V414" stroke="#8392a8" stroke-width="3" stroke-dasharray="12 12"/>
  <circle cx="480" cy="250" r="18" fill="{secondary}" stroke="#ffffff" stroke-width="6"/>
  <path d="M576 308 L724 220" stroke="{secondary}" stroke-width="10" stroke-linecap="round"/>
  <path d="M704 202 L738 214 L716 240" fill="none" stroke="{secondary}" stroke-width="10" stroke-linecap="round"/>
  <text x="104" y="72" fill="#142033" font-family="serif" font-size="38">{first}</text>
  <text x="532" y="398" fill="#142033" font-family="serif" font-size="34">{second}</text>
</svg>\n'''


def probe(path: Path) -> dict[str, float | int]:
    output = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate,codec_name:format=duration", "-of", "json", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(output.stdout)
    stream = payload["streams"][0]
    numerator, denominator = stream["r_frame_rate"].split("/", 1)
    return {"durationSeconds": round(float(payload["format"]["duration"]), 3), "width": int(stream["width"]), "height": int(stream["height"]), "frameRate": float(numerator) / float(denominator), "codec": stream["codec_name"]}


def _source_duration(path: Path) -> float:
    match = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:-|–)?\s*seconds?\b", path.read_text(encoding="utf-8"), re.IGNORECASE)
    if match is None:
        raise SystemExit(f"Prompt duration declaration missing: {path}")
    return float(match.group(1))


def metadata_payload() -> dict[str, Any]:
    assets = []
    for scene_id, scene in SCENES.items():
        video = PUBLIC_DIR / scene["video"]
        poster_path = PUBLIC_DIR / scene["video"].replace(".mp4", ".svg")
        source = SOURCES[scene_id]
        assets.append({
            "id": scene_id,
            "scene": scene["className"],
            "assetPath": f"/manim/logistic-regression/{video.name}",
            "posterPath": f"/manim/logistic-regression/{poster_path.name}",
            "source": str(SCENE_FILE.relative_to(ROOT)),
            "markers": [{"id": f"{scene_id}-{index + 1}", "startSeconds": seconds} for index, seconds in enumerate(scene["markers"])],
            "sha256": sha256(video),
            "posterSha256": sha256(poster_path),
            **probe(video),
            **source,
        })
    return {"metadataVersion": 1, "generatedBy": "scripts/manim/render_logistic_regression.py", "manimVersion": PUBLISHED_MANIM_VERSION, "assets": assets}


def publish_posters() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    for scene_id, scene in SCENES.items():
        (PUBLIC_DIR / scene["video"].replace(".mp4", ".svg")).write_text(poster(scene_id), encoding="utf-8")


def check(scene_id: str | None = None) -> None:
    validate_sources(scene_id)
    metadata_path = PUBLIC_DIR / "metadata.json"
    if not metadata_path.is_file():
        raise SystemExit("Published logistic media metadata is not available yet")
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    if metadata.get("metadataVersion") != 1 or metadata.get("generatedBy") != "scripts/manim/render_logistic_regression.py":
        raise SystemExit("Logistic media metadata contract drifted")
    if metadata.get("manimVersion") != PUBLISHED_MANIM_VERSION:
        raise SystemExit("Published Manim version drifted")
    records = {record.get("id"): record for record in metadata.get("assets", [])}
    if set(records) != set(SCENES):
        raise SystemExit("Logistic media inventory drifted")
    for selected in ([scene_id] if scene_id else list(SCENES)):
        scene, record = SCENES[selected], records[selected]
        video, poster_path = PUBLIC_DIR / scene["video"], PUBLIC_DIR / scene["video"].replace(".mp4", ".svg")
        if not video.is_file() or not poster_path.is_file() or poster_path.read_text(encoding="utf-8") != poster(selected):
            raise SystemExit(f"Missing or drifted published asset for {selected}")
        if record.get("sha256") != sha256(video) or record.get("posterSha256") != sha256(poster_path):
            raise SystemExit(f"Published hash drift for {selected}")
        info = probe(video)
        if any(record.get(field) != info[field] for field in info) or info["width"] != 1920 or info["height"] != 1080 or info["frameRate"] != 30 or info["codec"] != "h264":
            raise SystemExit(f"ffprobe contract failed for {selected}: {info}")
        if abs(float(info["durationSeconds"]) - scene["durationSeconds"]) > 1.5:
            raise SystemExit(f"Duration drift for {selected}")
        if [marker.get("startSeconds") for marker in record.get("markers", [])] != scene["markers"] or any(seconds < 0 or seconds >= info["durationSeconds"] for seconds in scene["markers"]):
            raise SystemExit(f"Marker contract failed for {selected}")
        for source_path in SOURCES[selected].values():
            path = ROOT / source_path
            if not path.is_file() or not path.read_text(encoding="utf-8").strip():
                raise SystemExit(f"Missing source package member for {selected}: {source_path}")
        if abs(_source_duration(ROOT / SOURCES[selected]["prompt"]) - float(info["durationSeconds"])) > 1.5:
            raise SystemExit(f"Prompt duration drift for {selected}")
    print("Published logistic media package matches ffprobe, source, marker, hash, and manifest-anchor contracts.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Render or verify Phase 29 logistic-regression Manim media.")
    parser.add_argument("--scene", choices=sorted(SCENES), help="Select one scene; never renders other scenes.")
    parser.add_argument("--quality", choices=["preview", "publish"], default="preview")
    parser.add_argument("--validate-sources", action="store_true", help="Read-only numerical/source-contract validation.")
    parser.add_argument("--check", action="store_true", help="Read-only published package validation.")
    args = parser.parse_args()
    if args.validate_sources and args.check:
        parser.error("--validate-sources and --check are mutually exclusive")
    if args.validate_sources:
        validate_sources(args.scene)
        return
    if args.check:
        check(args.scene)
        return
    selected = [args.scene] if args.scene else list(SCENES)
    for scene_id in selected:
        render(scene_id, args.quality)
    if args.quality == "publish":
        publish_posters()
        if all((PUBLIC_DIR / scene["video"]).is_file() for scene in SCENES.values()) and all((ROOT / source_path).is_file() for source in SOURCES.values() for source_path in source.values()):
            (PUBLIC_DIR / "metadata.json").write_text(json.dumps(metadata_payload(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
