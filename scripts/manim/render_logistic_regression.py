#!/usr/bin/env python3
"""Selective, fail-closed renderer for Phase 29 logistic-regression media.

``--validate-sources`` is deliberately read-only and validates the numerical
authority before Manim is launched. ``--check`` is also read-only and is the
release gate once Plan 29-04 has published all four binary packages.
"""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import math
import re
import shutil
import subprocess
import tempfile
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


def _load_scene_contract() -> tuple[set[str], str, dict[str, dict[str, str]]]:
    """Read the declarative scene contract without importing Manim."""
    tree = ast.parse(SCENE_FILE.read_text(encoding="utf-8"), filename=str(SCENE_FILE))
    class_names = {node.name for node in tree.body if isinstance(node, ast.ClassDef)}
    declarations: dict[str, Any] = {}
    for node in tree.body:
        if not isinstance(node, ast.Assign) or len(node.targets) != 1 or not isinstance(node.targets[0], ast.Name):
            continue
        name = node.targets[0].id
        if name in {"CONTRACT_VERSION", "SCENE_ANCHORS"}:
            declarations[name] = ast.literal_eval(node.value)
    contract_version = declarations.get("CONTRACT_VERSION")
    scene_anchors = declarations.get("SCENE_ANCHORS")
    if not isinstance(contract_version, str) or not isinstance(scene_anchors, dict):
        raise RuntimeError("Logistic scene contract declarations are missing or invalid")
    return class_names, contract_version, scene_anchors


def _load_phase29_anchors(
    scene_id: str,
    contract_version: str,
    scene_anchors: dict[str, dict[str, str]],
) -> dict[str, Any]:
    """Verify the same manifest-bound anchors used by the render-time scenes."""
    phase_dir = ROOT / "public" / "logistic-regression" / "phase-29"
    manifest_path = phase_dir / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("contractVersion") != contract_version:
        raise RuntimeError("Phase 29 manifest contract version drifted")
    records = {record.get("id"): record for record in manifest.get("assets", [])}
    anchors: dict[str, Any] = {}
    for asset_id, expected_cell in scene_anchors[scene_id].items():
        record = records.get(asset_id)
        if not isinstance(record, dict):
            raise RuntimeError(f"Missing manifest asset for {asset_id}")
        if record.get("sourceCellId") != expected_cell:
            raise RuntimeError(f"Source cell drift for {asset_id}")
        relative_path = record.get("path")
        if not isinstance(relative_path, str) or relative_path.startswith("/") or ".." in Path(relative_path).parts:
            raise RuntimeError(f"Unsafe manifest path for {asset_id}")
        path = phase_dir / relative_path
        if not path.is_file() or record.get("sha256") != sha256(path):
            raise RuntimeError(f"Interaction hash drift for {asset_id}")
        payload = json.loads(path.read_text(encoding="utf-8"))
        if payload.get("id") != asset_id or payload.get("sceneId") != asset_id or payload.get("sourceCellId") != expected_cell:
            raise RuntimeError(f"Interaction identity drift for {asset_id}")
        anchors[asset_id] = payload
    return anchors


def validate_sources(scene_id: str | None = None) -> None:
    """Verify identity, source-cell, hash, and finite-value contracts pre-render."""
    if not SCENE_FILE.is_file():
        raise SystemExit(f"Missing scene source: {SCENE_FILE}")
    class_names, contract_version, scene_anchors = _load_scene_contract()
    scene_ids = [scene_id] if scene_id else list(SCENES)
    for selected in scene_ids:
        spec = SCENES[selected]
        if spec["className"] not in class_names:
            raise SystemExit(f"Scene class missing: {spec['className']}")
        if selected not in scene_anchors:
            raise SystemExit(f"Scene anchor mapping missing: {selected}")
        try:
            anchors = _load_phase29_anchors(selected, contract_version, scene_anchors)
        except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as error:
            raise SystemExit(f"Phase 29 anchor contract failed for {selected}: {error}") from error
        if not anchors:
            raise SystemExit(f"Empty anchor contract for {selected}")
        if selected == "log-loss-confident-mistake":
            example = anchors["log-loss"]["data"].get("confidentMistake", {})
            logit, target, loss = example.get("logit"), example.get("label"), example.get("bce")
            if target != 1 or not all(isinstance(value, (int, float)) and math.isfinite(float(value)) for value in (logit, loss)) or not math.isclose(math.log1p(math.exp(float(logit))) - float(target) * float(logit), float(loss), rel_tol=0.0, abs_tol=1e-12):
                raise SystemExit("Confident-mistake media anchor must match the published high-loss y=1 row.")
    print(f"Validated {len(scene_ids)} logistic scenes against Phase 29 manifest identities, source cells, hashes, and numeric anchors.")


def manim_version() -> str:
    return subprocess.run(["manim", "--version"], check=True, capture_output=True, text=True).stdout.strip()


def render(scene_id: str, quality: str) -> Path:
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
    return output


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


def metadata_payload(output_dir: Path) -> dict[str, Any]:
    source_manifest = ROOT / "public" / "logistic-regression" / "phase-29" / "manifest.json"
    assets = []
    for scene_id, scene in SCENES.items():
        video = output_dir / scene["video"]
        poster_path = output_dir / scene["video"].replace(".mp4", ".svg")
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
            "sourceManifestSha256": sha256(source_manifest),
            "sourceSha256": sha256(ROOT / SCENE_FILE.relative_to(ROOT)),
            "promptSha256": sha256(ROOT / source["prompt"]),
            "knowledgeTreeSha256": sha256(ROOT / source["knowledgeTree"]),
            "transcriptZhCNSha256": sha256(ROOT / source["transcriptZhCN"]),
            "transcriptEnSha256": sha256(ROOT / source["transcriptEn"]),
            **probe(video),
            **source,
        })
    return {"metadataVersion": 1, "generatedBy": "scripts/manim/render_logistic_regression.py", "manimVersion": PUBLISHED_MANIM_VERSION, "assets": assets}


def publish_posters(output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for scene_id, scene in SCENES.items():
        (output_dir / scene["video"].replace(".mp4", ".svg")).write_text(poster(scene_id), encoding="utf-8")


def check(scene_id: str | None = None, output_dir: Path = PUBLIC_DIR) -> None:
    validate_sources(scene_id)
    metadata_path = output_dir / "metadata.json"
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
        video, poster_path = output_dir / scene["video"], output_dir / scene["video"].replace(".mp4", ".svg")
        if not video.is_file() or not poster_path.is_file() or poster_path.read_text(encoding="utf-8") != poster(selected):
            raise SystemExit(f"Missing or drifted published asset for {selected}")
        if record.get("sha256") != sha256(video) or record.get("posterSha256") != sha256(poster_path):
            raise SystemExit(f"Published hash drift for {selected}")
        source_manifest = ROOT / "public" / "logistic-regression" / "phase-29" / "manifest.json"
        if record.get("sourceManifestSha256") != sha256(source_manifest):
            raise SystemExit(f"Source manifest hash drift for {selected}")
        info = probe(video)
        if any(record.get(field) != info[field] for field in info) or info["width"] != 1920 or info["height"] != 1080 or info["frameRate"] != 30 or info["codec"] != "h264":
            raise SystemExit(f"ffprobe contract failed for {selected}: {info}")
        if abs(float(info["durationSeconds"]) - scene["durationSeconds"]) > 1.5:
            raise SystemExit(f"Duration drift for {selected}")
        if [marker.get("startSeconds") for marker in record.get("markers", [])] != scene["markers"] or any(seconds < 0 or seconds >= info["durationSeconds"] for seconds in scene["markers"]):
            raise SystemExit(f"Marker contract failed for {selected}")
        hash_fields = {
            "source": "sourceSha256", "prompt": "promptSha256", "knowledgeTree": "knowledgeTreeSha256",
            "transcriptZhCN": "transcriptZhCNSha256", "transcriptEn": "transcriptEnSha256",
        }
        for source_key, source_path in SOURCES[selected].items():
            path = ROOT / source_path
            if not path.is_file() or not path.read_text(encoding="utf-8").strip():
                raise SystemExit(f"Missing source package member for {selected}: {source_path}")
            if record.get(hash_fields[source_key]) != sha256(path):
                raise SystemExit(f"Source hash drift for {selected}: {source_key}")
        if abs(_source_duration(ROOT / SOURCES[selected]["prompt"]) - float(info["durationSeconds"])) > 1.5:
            raise SystemExit(f"Prompt duration drift for {selected}")
    print("Published logistic media package matches ffprobe, source, marker, hash, and manifest-anchor contracts.")


def publish(inject_failure: bool = False) -> None:
    """Render into a sibling staging directory and swap only after validation."""
    PUBLIC_DIR.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix=".logistic-regression-stage-", dir=PUBLIC_DIR.parent))
    backup = PUBLIC_DIR.parent / ".logistic-regression-backup"
    if backup.exists():
        raise RuntimeError(f"Refusing to overwrite an existing release backup: {backup}")
    published = False
    try:
        for scene_id in SCENES:
            shutil.copy2(render(scene_id, "publish"), staging / SCENES[scene_id]["video"])
        publish_posters(staging)
        (staging / "metadata.json").write_text(json.dumps(metadata_payload(staging), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        check(output_dir=staging)
        if PUBLIC_DIR.exists():
            PUBLIC_DIR.replace(backup)
        staging.replace(PUBLIC_DIR)
        published = True
        if inject_failure:
            raise RuntimeError("Injected failure after atomic swap")
        check()
        if backup.exists():
            shutil.rmtree(backup)
    except Exception:
        if published and PUBLIC_DIR.exists():
            shutil.rmtree(PUBLIC_DIR)
        if backup.exists():
            backup.replace(PUBLIC_DIR)
        raise
    finally:
        if staging.exists():
            shutil.rmtree(staging)


def main() -> None:
    parser = argparse.ArgumentParser(description="Render or verify Phase 29 logistic-regression Manim media.")
    parser.add_argument("--scene", choices=sorted(SCENES), help="Select one scene; never renders other scenes.")
    parser.add_argument("--quality", choices=["preview", "publish"], default="preview")
    parser.add_argument("--validate-sources", action="store_true", help="Read-only numerical/source-contract validation.")
    parser.add_argument("--check", action="store_true", help="Read-only published package validation.")
    parser.add_argument("--inject-failure", action="store_true", help="Exercise post-swap rollback; valid only with --quality publish.")
    args = parser.parse_args()
    if args.validate_sources and args.check:
        parser.error("--validate-sources and --check are mutually exclusive")
    if args.validate_sources:
        validate_sources(args.scene)
        return
    if args.check:
        check(args.scene)
        return
    if args.quality == "publish":
        if args.scene:
            parser.error("publication is an atomic four-scene release; omit --scene")
        publish(args.inject_failure)
        return
    if args.inject_failure:
        parser.error("--inject-failure requires --quality publish")
    for scene_id in ([args.scene] if args.scene else list(SCENES)):
        render(scene_id, args.quality)


if __name__ == "__main__":
    main()
