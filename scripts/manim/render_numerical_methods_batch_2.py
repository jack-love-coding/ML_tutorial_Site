#!/usr/bin/env python3
"""Render and drift-check the sparse-matrix and PCA numerical-method videos."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from typing import Any
import uuid


ROOT = Path(__file__).resolve().parents[2]
SCENE_DIR = ROOT / "scripts/manim/numerical_methods_batch_2"
DOCS_DIR = ROOT / "docs/curriculum-v3/numerical-methods/manim"
PUBLIC_DIR = ROOT / "public/manim/numerical-methods"
OUTPUT_DIR = ROOT / "public/notebooks/numerical-methods/batch-2-outputs"
METADATA_NAME = "batch-2-metadata.json"

SCENES = [
    {
        "id": "sms-csr-matvec",
        "stem": "sms_csr_matvec",
        "className": "SmsCsrMatvecScene",
        "durationSeconds": 75,
        "posterSecond": 63,
        "cuts": [0, 7, 18, 31, 46, 59, 69, 75],
        "outputId": "sms-sparse-summary",
    },
    {
        "id": "ames-pca-projection",
        "stem": "ames_pca_projection",
        "className": "AmesPcaProjectionScene",
        "durationSeconds": 80,
        "posterSecond": 57,
        "cuts": [0, 8, 20, 34, 47, 62, 72, 80],
        "outputId": "ames-pca-summary",
    },
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def json_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def write_if_changed(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists() or path.read_bytes() != content:
        path.write_bytes(content)


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError) as error:
        raise RuntimeError(f"Cannot read required JSON {path.relative_to(ROOT)}: {error}") from error
    if not isinstance(value, dict):
        raise RuntimeError(f"Expected JSON object in {path.relative_to(ROOT)}")
    return value


def assert_equal(actual: Any, expected: Any, label: str) -> None:
    if actual != expected:
        raise RuntimeError(f"Notebook contract drift for {label}: {actual!r} != {expected!r}")


def validate_notebook_contract() -> None:
    sparse = load_json(OUTPUT_DIR / "sms-sparse-summary.json")
    expected_sparse = {
        "outputId": "sms-sparse-summary",
        "rows": 5574,
        "columns": 1881,
        "nnz": 69798,
        "density": 0.006657132768967793,
        "averageNonzerosPerRow": 12.522066738428418,
        "denseBytesFloat64": 83877552,
        "csrBytes": 859876,
        "denseToCsrRatio": 97.54610199610177,
    }
    for key, expected in expected_sparse.items():
        assert_equal(sparse.get(key), expected, f"sparse {key}")
    expected_row = {
        "rowIndex": 17,
        "start": 283,
        "end": 299,
        "entries": 16,
        "manualDot": -0.49780595596063804,
        "libraryDot": -0.49780595596063804,
        "absoluteDifference": 0.0,
    }
    assert_equal(sparse.get("manualRow"), expected_row, "sparse manual row")

    pca = load_json(OUTPUT_DIR / "ames-pca-summary.json")
    expected_pca = {
        "outputId": "ames-pca-summary",
        "rows": 2927,
        "columns": 8,
        "componentsForAtLeast90Percent": 4,
        "twoComponentExplainedVariance": 0.7173119855457475,
        "twoComponentStandardizedRmse": 0.531684130338919,
        "k90StandardizedRmse": 0.2801676101355673,
        "spectralDifference": 1.3322676295501878e-15,
    }
    for key, expected in expected_pca.items():
        assert_equal(pca.get(key), expected, f"PCA {key}")
    assert_equal(
        pca.get("explainedVarianceRatio", [])[:4],
        [0.518075870456838, 0.19923611508890943, 0.12135149015146957, 0.08284263453370773],
        "PCA first four ratios",
    )
    assert_equal(pca.get("cumulativeExplainedVariance", [None] * 4)[3], 0.9215061102309249, "PCA four-component cumulative ratio")


def validate_package_sources() -> None:
    validate_notebook_contract()
    expected_pipeline = [
        "ConceptAnalyzer",
        "PrerequisiteExplorer",
        "MathematicalEnricher",
        "VisualDesigner",
        "NarrativeComposer",
        "CodeGenerator",
    ]
    for scene in SCENES:
        stem = scene["stem"]
        source = SCENE_DIR / f"{stem}.py"
        prompt = SCENE_DIR / f"{stem}_prompt.md"
        tree = load_json(SCENE_DIR / f"{stem}_tree.json")
        labels = load_json(DOCS_DIR / f"{scene['id']}-labels.json")
        transcript = DOCS_DIR / f"{scene['id']}-transcript.zh-CN.md"
        summary = DOCS_DIR / f"{scene['id']}-summary.en.md"
        for required in (source, prompt, transcript, summary):
            if not required.is_file() or not required.read_text(encoding="utf-8").strip():
                raise RuntimeError(f"Required source document is missing or empty: {required.relative_to(ROOT)}")
        if len(prompt.read_text(encoding="utf-8").split()) < 900:
            raise RuntimeError(f"NarrativeComposer prompt is unexpectedly shallow: {prompt.relative_to(ROOT)}")
        assert_equal(tree.get("pipeline"), expected_pipeline, f"{scene['id']} pipeline")
        assert_equal(tree.get("maxDepth"), 3, f"{scene['id']} prerequisite depth")
        assert_equal(labels.get("localeInVideo"), "zh-CN", f"{scene['id']} label locale")
        assert_equal(labels.get("durationSeconds"), scene["durationSeconds"], f"{scene['id']} label duration")
        if not isinstance(labels.get("labels"), list) or not labels["labels"]:
            raise RuntimeError(f"Labels are missing for {scene['id']}")
        for label in labels["labels"]:
            if set(label) != {"zh-CN", "en"} or not all(isinstance(value, str) and value for value in label.values()):
                raise RuntimeError(f"Malformed bilingual label for {scene['id']}: {label!r}")

    sparse_source = (SCENE_DIR / "sms_csr_matvec.py").read_text(encoding="utf-8")
    sparse_required = ["[283, 299)", "−0.497805956", "79.992 MiB", "0.820 MiB", "没有训练分类器"]
    if any(value not in sparse_source for value in sparse_required):
        raise RuntimeError("Sparse scene lost a required row, result, memory, or scope qualification")
    pca_source = (SCENE_DIR / "ames_pca_projection.py").read_text(encoding="utf-8")
    pca_required = ["ddof = 0", "二维点云仅解释方向", "92.15%", "0.280168", "不使用房价标签"]
    if any(value not in pca_source for value in pca_required):
        raise RuntimeError("PCA scene lost a required scale, dimensionality, result, or unsupervised qualification")


def repo_path(path: str, media_dir: Path = PUBLIC_DIR) -> Path:
    prefix = "/manim/numerical-methods/"
    if path.startswith(prefix):
        return media_dir / path.removeprefix(prefix)
    if path.startswith("/notebooks/"):
        return ROOT / "public" / path.lstrip("/")
    return ROOT / path


def scene_record(scene: dict[str, Any]) -> dict[str, Any]:
    slug = scene["id"]
    stem = scene["stem"]
    return {
        "id": slug,
        "className": scene["className"],
        "durationSeconds": scene["durationSeconds"],
        "storyboardCuts": scene["cuts"],
        "posterSecond": scene["posterSecond"],
        "outputId": scene["outputId"],
        "source": f"scripts/manim/numerical_methods_batch_2/{stem}.py",
        "tree": f"scripts/manim/numerical_methods_batch_2/{stem}_tree.json",
        "prompt": f"scripts/manim/numerical_methods_batch_2/{stem}_prompt.md",
        "transcript": f"docs/curriculum-v3/numerical-methods/manim/{slug}-transcript.zh-CN.md",
        "englishSummary": f"docs/curriculum-v3/numerical-methods/manim/{slug}-summary.en.md",
        "labels": f"docs/curriculum-v3/numerical-methods/manim/{slug}-labels.json",
        "mp4": f"/manim/numerical-methods/{slug}.mp4",
        "poster": f"/manim/numerical-methods/{slug}-poster.png",
    }


def metadata(integrity: dict[str, str]) -> dict[str, Any]:
    return {
        "schemaVersion": 1,
        "batchId": "numerical-methods-batch-2",
        "render": {
            "width": 1920,
            "height": 1080,
            "fps": 30,
            "videoCodec": "h264",
            "localeInVideo": "zh-CN",
            "command": "python scripts/manim/render_numerical_methods_batch_2.py",
            "checkCommand": "python scripts/manim/render_numerical_methods_batch_2.py --check",
            "publication": "validated temporary copy followed by atomic numerical-method directory replacement",
        },
        "notebookOutputs": [
            "/notebooks/numerical-methods/batch-2-outputs/sms-sparse-summary.json",
            "/notebooks/numerical-methods/batch-2-outputs/ames-pca-summary.json",
        ],
        "scenes": [scene_record(scene) for scene in SCENES],
        "integrity": integrity,
    }


def paths_for_integrity() -> list[str]:
    paths = [
        "scripts/manim/render_numerical_methods_batch_2.py",
        "scripts/manim/numerical_methods_batch_2/palette.py",
        "scripts/manim/numerical_methods_batch_2/common.py",
        "/notebooks/numerical-methods/batch-2-outputs/sms-sparse-summary.json",
        "/notebooks/numerical-methods/batch-2-outputs/ames-pca-summary.json",
    ]
    for scene in SCENES:
        record = scene_record(scene)
        paths.extend(record[key] for key in ["source", "tree", "prompt", "transcript", "englishSummary", "labels", "mp4", "poster"])
    return paths


def collect_integrity(media_dir: Path = PUBLIC_DIR) -> dict[str, str]:
    result: dict[str, str] = {}
    for path in paths_for_integrity():
        target = repo_path(path, media_dir)
        if not target.is_file():
            raise RuntimeError(f"Required Manim package file is missing: {path}")
        result[path] = sha256(target)
    return result


def run(command: list[str], *, env: dict[str, str] | None = None) -> None:
    print("+", " ".join(command), flush=True)
    subprocess.run(command, cwd=ROOT, env=env, check=True)


def render_scene(scene: dict[str, Any], destination_dir: Path) -> None:
    source = SCENE_DIR / f"{scene['stem']}.py"
    output = destination_dir / f"{scene['id']}.mp4"
    with tempfile.TemporaryDirectory(prefix=f"ml-atlas-{scene['stem']}-") as tmp:
        media_dir = Path(tmp)
        env = os.environ.copy()
        env["PYTHONPATH"] = str(SCENE_DIR) + os.pathsep + env.get("PYTHONPATH", "")
        run([
            sys.executable,
            "-m",
            "manim",
            str(source),
            scene["className"],
            "--format",
            "mp4",
            "--resolution",
            "1920,1080",
            "--frame_rate",
            "30",
            "--disable_caching",
            "--media_dir",
            str(media_dir),
            "--output_file",
            f"{scene['id']}.mp4",
        ], env=env)
        candidates = list(media_dir.rglob(f"{scene['id']}.mp4"))
        if len(candidates) != 1:
            raise RuntimeError(f"Expected one rendered MP4 for {scene['id']}, found {len(candidates)}")
        shutil.copy2(candidates[0], output)
    poster = destination_dir / f"{scene['id']}-poster.png"
    extract_poster(output, poster, scene["posterSecond"])
    verify_video(output, scene["durationSeconds"])
    verify_poster(poster)


def extract_poster(video: Path, output: Path, timestamp: int) -> None:
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(timestamp), "-i", str(video), "-frames:v", "1", "-vf", "scale=1920:1080", str(output)])


def ffprobe(path: Path) -> dict[str, Any]:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def verify_video(video: Path, expected_duration: int) -> dict[str, Any]:
    if not video.is_file():
        raise RuntimeError(f"Missing rendered video: {video}")
    probe = ffprobe(video)
    video_streams = [stream for stream in probe.get("streams", []) if stream.get("codec_type") == "video"]
    audio_streams = [stream for stream in probe.get("streams", []) if stream.get("codec_type") == "audio"]
    if len(video_streams) != 1 or audio_streams:
        raise RuntimeError(f"Expected one silent video stream in {video.name}")
    stream = video_streams[0]
    actual = (stream.get("width"), stream.get("height"), stream.get("r_frame_rate"), stream.get("codec_name"))
    if actual != (1920, 1080, "30/1", "h264"):
        raise RuntimeError(f"Unexpected video format for {video.name}: {actual}")
    duration = float(probe["format"]["duration"])
    if abs(duration - expected_duration) > 0.20:
        raise RuntimeError(f"Unexpected duration for {video.name}: {duration:.3f}s, expected {expected_duration}s")
    return {"width": 1920, "height": 1080, "fps": "30/1", "codec": "h264", "duration": duration}


def verify_poster(poster: Path) -> None:
    if not poster.is_file():
        raise RuntimeError(f"Missing poster: {poster}")
    streams = [stream for stream in ffprobe(poster).get("streams", []) if stream.get("codec_type") == "video"]
    if len(streams) != 1 or (streams[0].get("width"), streams[0].get("height"), streams[0].get("codec_name")) != (1920, 1080, "png"):
        raise RuntimeError(f"Unexpected poster format for {poster.name}: {streams}")


def verify_batch(media_dir: Path) -> None:
    for scene in SCENES:
        verify_video(media_dir / f"{scene['id']}.mp4", scene["durationSeconds"])
        verify_poster(media_dir / f"{scene['id']}-poster.png")
    expected_metadata = json_bytes(metadata(collect_integrity(media_dir)))
    metadata_path = media_dir / METADATA_NAME
    if not metadata_path.is_file() or metadata_path.read_bytes() != expected_metadata:
        raise RuntimeError(f"metadata/source/document/output drift in Batch 2 media: {media_dir}")


def publish_batch(batch_dir: Path) -> None:
    backup_dir = PUBLIC_DIR.parent / f".{PUBLIC_DIR.name}-previous-{uuid.uuid4().hex}"
    had_public_package = PUBLIC_DIR.exists()
    if had_public_package and not PUBLIC_DIR.is_dir():
        raise RuntimeError(f"Public package path is not a directory: {PUBLIC_DIR}")
    if had_public_package:
        os.replace(PUBLIC_DIR, backup_dir)
    published = False
    try:
        os.replace(batch_dir, PUBLIC_DIR)
        published = True
    except BaseException:
        if had_public_package and backup_dir.exists() and not PUBLIC_DIR.exists():
            os.replace(backup_dir, PUBLIC_DIR)
        raise
    finally:
        if published and backup_dir.exists():
            shutil.rmtree(backup_dir, ignore_errors=True)


def render_all() -> None:
    validate_package_sources()
    PUBLIC_DIR.parent.mkdir(parents=True, exist_ok=True)
    batch_dir = Path(tempfile.mkdtemp(prefix=".numerical-methods-batch-2-", dir=PUBLIC_DIR.parent))
    try:
        if PUBLIC_DIR.exists():
            shutil.copytree(PUBLIC_DIR, batch_dir, dirs_exist_ok=True)
        for index, scene in enumerate(SCENES, start=1):
            print(f"Rendering scene {index}/{len(SCENES)} into temporary package: {scene['id']}", flush=True)
            render_scene(scene, batch_dir)
        write_if_changed(batch_dir / METADATA_NAME, json_bytes(metadata(collect_integrity(batch_dir))))
        verify_batch(batch_dir)
        print("Temporary Batch 2 package verified; publishing the complete numerical-method directory.", flush=True)
        publish_batch(batch_dir)
    finally:
        if batch_dir.exists():
            shutil.rmtree(batch_dir, ignore_errors=True)
    print("Rendered, verified, and atomically published 2/2 numerical-method Batch 2 scenes.")


def check_all() -> None:
    validate_package_sources()
    verify_batch(PUBLIC_DIR)
    print("Numerical-method Batch 2 Manim assets are in sync (2 scenes, documents, Notebook anchors, media, and hashes).")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify source, documentation, media, and hashes without writing")
    args = parser.parse_args()
    try:
        check_all() if args.check else render_all()
    except (RuntimeError, FileNotFoundError, subprocess.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
