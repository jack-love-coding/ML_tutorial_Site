#!/usr/bin/env python3
"""Render and drift-check the finite-difference and root-finding videos."""

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
SCENE_DIR = ROOT / "scripts/manim/numerical_methods_batch_3"
DOCS_DIR = ROOT / "docs/curriculum-v3/numerical-methods/manim"
PUBLIC_DIR = ROOT / "public/manim/numerical-methods"
OUTPUT_DIR = ROOT / "public/notebooks/numerical-methods/batch-3-outputs"
FIXTURE_PATH = ROOT / "public/datasets/numerical-methods/logit-calibration-fixture.json"
METADATA_NAME = "batch-3-metadata.json"

SCENES = [
    {
        "id": "logit-calibration-finite-difference",
        "stem": "calibration_finite_difference",
        "className": "CalibrationFiniteDifferenceScene",
        "durationSeconds": 78,
        "posterSecond": 64,
        "cuts": [0, 8, 19, 32, 47, 60, 70, 78],
        "outputId": "finite-difference-calibration-summary",
    },
    {
        "id": "logit-calibration-root-finding",
        "stem": "calibration_root_finding",
        "className": "CalibrationRootFindingScene",
        "durationSeconds": 80,
        "posterSecond": 65,
        "cuts": [0, 9, 20, 34, 48, 61, 71, 77, 80],
        "outputId": "nonlinear-calibration-summary",
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
    fixture = load_json(FIXTURE_PATH)
    assert_equal(fixture.get("contractVersion"), "numerical-methods-batch-3-v1", "fixture contract")
    assert_equal(fixture.get("logits"), [-3.2, -2.1, -1.4, -0.9, -0.4, -0.1, 0.2, 0.5, 0.9, 1.3, 2.0, 3.1], "fixture logits")
    assert_equal(fixture.get("targetPositiveRate"), 0.62, "fixture target")

    finite = load_json(OUTPUT_DIR / "finite-difference-calibration-summary.json")
    expected_finite = {
        "outputId": "finite-difference-calibration-summary",
        "fixtureSha256": "f78fab203ad67476d26937fb7ae84e57b6aefaa86e4045f01b3b1c85b3b78bbc",
        "logitCount": 12,
        "targetPositiveRate": 0.62,
        "probeBias": 0.35,
        "probeResidual": -0.06078698810485639,
        "analyticDerivative": 0.1630982543997438,
    }
    for key, expected in expected_finite.items():
        assert_equal(finite.get(key), expected, f"finite difference {key}")
    assert_equal(finite.get("bestSampledForward", {}).get("step"), 1e-7, "forward best sampled step")
    assert_equal(finite.get("bestSampledForward", {}).get("forwardAbsoluteError"), 6.082833126086484e-10, "forward best sampled error")
    assert_equal(finite.get("bestSampledCentral", {}).get("step"), 1e-5, "central best sampled step")
    assert_equal(finite.get("bestSampledCentral", {}).get("centralAbsoluteError"), 2.3393509351876673e-12, "central best sampled error")
    assert_equal(finite.get("stepSweep", [])[-1].get("centralAbsoluteError"), 6.200323353955373e-05, "tiny-step central error")

    roots = load_json(OUTPUT_DIR / "nonlinear-calibration-summary.json")
    expected_roots = {
        "outputId": "nonlinear-calibration-summary",
        "fixtureSha256": "f78fab203ad67476d26937fb7ae84e57b6aefaa86e4045f01b3b1c85b3b78bbc",
        "root": 0.730290740297536,
        "meanProbabilityAtRoot": 0.619999999995351,
        "derivativeAtRoot": 0.15594569798407712,
        "bracket": [-4.0, 4.0],
    }
    for key, expected in expected_roots.items():
        assert_equal(roots.get(key), expected, f"root finding {key}")
    expected_solvers = [
        ("bisection", 37, 39, 0),
        ("newton", 3, 4, 4),
        ("secant", 5, 7, 0),
    ]
    actual_solvers = [
        (row.get("method"), row.get("iterationCount"), row.get("functionEvaluations"), row.get("derivativeEvaluations"))
        for row in roots.get("solvers", [])
    ]
    assert_equal(actual_solvers, expected_solvers, "solver evaluation counts")
    assert_equal(
        roots.get("failureChecks"),
        {
            "invalidBracket": "Bisection requires a sign-changing bracket",
            "saturatedNewton": "Newton iteration left the safeguarded teaching domain",
        },
        "root failure checks",
    )


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
        if len(prompt.read_text(encoding="utf-8").split()) < 1200:
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

    finite_source = (SCENE_DIR / "calibration_finite_difference.py").read_text(encoding="utf-8")
    finite_required = ["b₀ = 0.35", "0.1630982544", "h = 1e−5", "2.339e−12", "6.200e−5", "最小步长 ≠ 最好步长", "本节不训练模型", "匹配平均概率不等于完成完整概率校准"]
    if any(value not in finite_source for value in finite_required):
        raise RuntimeError("Finite-difference scene lost a required probe, output, error, or scope qualification")
    root_source = (SCENE_DIR / "calibration_root_finding.py").read_text(encoding="utf-8")
    root_required = ["b* = 0.7302907403", "37 次更新", "39 次函数求值", "3 次更新", "5 次更新", "7 次函数求值", "无效区间 [−4, −3]", "Newton 步可能离开保护域", "匹配一个平均值只解决这个标量方程", "下一章把求零扩展为最小化目标函数"]
    if any(value not in root_source for value in root_required):
        raise RuntimeError("Root-finding scene lost a required root, count, failure, or scope qualification")


def repo_path(path: str, media_dir: Path = PUBLIC_DIR) -> Path:
    prefix = "/manim/numerical-methods/"
    if path.startswith(prefix):
        return media_dir / path.removeprefix(prefix)
    if path.startswith("/notebooks/"):
        return ROOT / "public" / path.lstrip("/")
    if path.startswith("/datasets/"):
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
        "source": f"scripts/manim/numerical_methods_batch_3/{stem}.py",
        "tree": f"scripts/manim/numerical_methods_batch_3/{stem}_tree.json",
        "prompt": f"scripts/manim/numerical_methods_batch_3/{stem}_prompt.md",
        "transcript": f"docs/curriculum-v3/numerical-methods/manim/{slug}-transcript.zh-CN.md",
        "englishSummary": f"docs/curriculum-v3/numerical-methods/manim/{slug}-summary.en.md",
        "labels": f"docs/curriculum-v3/numerical-methods/manim/{slug}-labels.json",
        "mp4": f"/manim/numerical-methods/{slug}.mp4",
        "poster": f"/manim/numerical-methods/{slug}-poster.png",
    }


def metadata(integrity: dict[str, str]) -> dict[str, Any]:
    return {
        "schemaVersion": 1,
        "batchId": "numerical-methods-batch-3",
        "render": {
            "width": 1920,
            "height": 1080,
            "fps": 30,
            "videoCodec": "h264",
            "localeInVideo": "zh-CN",
            "command": "python scripts/manim/render_numerical_methods_batch_3.py",
            "checkCommand": "python scripts/manim/render_numerical_methods_batch_3.py --check",
            "publication": "validated temporary copy followed by atomic numerical-method directory replacement",
        },
        "notebookOutputs": [
            "/notebooks/numerical-methods/batch-3-outputs/finite-difference-calibration-summary.json",
            "/notebooks/numerical-methods/batch-3-outputs/nonlinear-calibration-summary.json",
        ],
        "scenes": [scene_record(scene) for scene in SCENES],
        "integrity": integrity,
    }


def paths_for_integrity() -> list[str]:
    paths = [
        "scripts/manim/render_numerical_methods_batch_3.py",
        "scripts/manim/numerical_methods_batch_3/palette.py",
        "scripts/manim/numerical_methods_batch_3/common.py",
        "/datasets/numerical-methods/logit-calibration-fixture.json",
        "/notebooks/numerical-methods/batch-3-outputs/finite-difference-calibration-summary.json",
        "/notebooks/numerical-methods/batch-3-outputs/nonlinear-calibration-summary.json",
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
        raise RuntimeError(f"metadata/source/document/output drift in Batch 3 media: {media_dir}")


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
    batch_dir = Path(tempfile.mkdtemp(prefix=".numerical-methods-batch-3-", dir=PUBLIC_DIR.parent))
    try:
        if PUBLIC_DIR.exists():
            shutil.copytree(PUBLIC_DIR, batch_dir, dirs_exist_ok=True)
        for index, scene in enumerate(SCENES, start=1):
            print(f"Rendering scene {index}/{len(SCENES)} into temporary package: {scene['id']}", flush=True)
            render_scene(scene, batch_dir)
        write_if_changed(batch_dir / METADATA_NAME, json_bytes(metadata(collect_integrity(batch_dir))))
        verify_batch(batch_dir)
        print("Temporary Batch 3 package verified; publishing the complete numerical-method directory.", flush=True)
        publish_batch(batch_dir)
    finally:
        if batch_dir.exists():
            shutil.rmtree(batch_dir, ignore_errors=True)
    print("Rendered, verified, and atomically published 2/2 numerical-method Batch 3 scenes.")


def check_all() -> None:
    validate_package_sources()
    verify_batch(PUBLIC_DIR)
    print("Numerical-method Batch 3 Manim assets are in sync (2 scenes, documents, Notebook anchors, media, and hashes).")


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
