#!/usr/bin/env python3
"""Render and drift-check the three deterministic Ames numerical-method videos."""

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
SCENE_DIR = ROOT / "scripts/manim/ames_numerical_methods"
DOCS_DIR = ROOT / "docs/curriculum-v3/numerical-methods/manim"
PUBLIC_DIR = ROOT / "public/manim/numerical-methods"
OUTPUT_DIR = ROOT / "public/notebooks/numerical-methods/outputs"


SCENES = [
    {
        "id": "least-squares-projection",
        "stem": "least_squares_projection",
        "className": "LeastSquaresProjectionScene",
        "durationSeconds": 78,
        "posterSecond": 56,
        "cuts": [0, 7, 18, 34, 48, 61, 70, 78],
        "outputId": "ames-least-squares-summary",
    },
    {
        "id": "lup-factor-reuse",
        "stem": "lup_factor_reuse",
        "className": "LupFactorReuseScene",
        "durationSeconds": 80,
        "posterSecond": 70,
        "cuts": [0, 8, 21, 36, 50, 62, 74, 80],
        "outputId": "ames-lu-summary",
    },
    {
        "id": "condition-number-sensitivity",
        "stem": "condition_number_sensitivity",
        "className": "ConditionNumberSensitivityScene",
        "durationSeconds": 82,
        "posterSecond": 80,
        "cuts": [0, 8, 22, 34, 49, 62, 76, 82],
        "outputId": "ames-conditioning-summary",
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


def assert_equal(actual: Any, expected: Any, label: str) -> None:
    if actual != expected:
        raise RuntimeError(f"Notebook contract drift for {label}: {actual!r} != {expected!r}")


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError) as error:
        raise RuntimeError(f"Cannot read required JSON {path.relative_to(ROOT)}: {error}") from error
    if not isinstance(value, dict):
        raise RuntimeError(f"Expected JSON object in {path.relative_to(ROOT)}")
    return value


def validate_notebook_contract() -> None:
    least_squares = load_json(OUTPUT_DIR / "ames-least-squares-summary.json")
    assert_equal(least_squares.get("outputId"), "ames-least-squares-summary", "least-squares outputId")
    assert_equal(least_squares.get("rows"), 2927, "least-squares rows")
    assert_equal(least_squares.get("rank"), 6, "least-squares rank")
    assert_equal(least_squares.get("rmseKusd"), 35.834182, "least-squares RMSE")
    assert_equal(least_squares.get("maxNormalEquationResidual"), 3.726e-10, "X-transpose residual")

    lu = load_json(OUTPUT_DIR / "ames-lu-summary.json")
    assert_equal(lu.get("outputId"), "ames-lu-summary", "LUP outputId")
    assert_equal(lu.get("systemShape"), [6, 6], "LUP system shape")
    assert_equal(lu.get("manualPivotRows"), [0, 1, 2, 3, 4], "LUP pivot rows")
    assert_equal(lu.get("factorizationResidualInfinity"), 4.547e-13, "LUP factorization residual")
    assert_equal(lu.get("solveResidualInfinity"), 1.455e-11, "LUP solve residual")
    assert_equal(lu.get("manualVsScipyMaxAbs"), 7.105e-15, "manual-vs-SciPy difference")
    assert_equal(lu.get("luVsLstsqMaxAbs"), 1.918e-13, "LU-vs-lstsq difference")
    assert_equal(lu.get("reusedLogPriceIntercept"), 12.0212213, "reused log-price intercept")

    condition = load_json(OUTPUT_DIR / "ames-conditioning-summary.json")
    assert_equal(condition.get("outputId"), "ames-conditioning-summary", "conditioning outputId")
    exact = {
        "rawDesignCondition": 13044.220254,
        "standardizedDesignCondition": 3.222571,
        "standardizedGramCondition": 10.384962,
        "designConditionSquared": 10.384962,
        "nearDuplicateDesignCondition": 26644.503135,
        "relativeTargetPerturbation": 1e-05,
        "relativeCoefficientChange": 0.00329613,
        "observedAmplification": 329.613418,
        "twoByTwoCondition": 40002.000075,
        "twoByTwoBaseSolution": [1.0, 1.0],
        "twoByTwoPerturbedSolution": [0.0, 2.0],
    }
    for key, expected in exact.items():
        assert_equal(condition.get(key), expected, f"conditioning {key}")


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
        tree = load_json(SCENE_DIR / f"{stem}_tree.json")
        labels = load_json(DOCS_DIR / f"{scene['id']}-labels.json")
        prompt = SCENE_DIR / f"{stem}_prompt.md"
        transcript = DOCS_DIR / f"{scene['id']}-transcript.zh-CN.md"
        summary = DOCS_DIR / f"{scene['id']}-summary.en.md"
        for required in (source, prompt, transcript, summary):
            if not required.is_file() or not required.read_text(encoding="utf-8").strip():
                raise RuntimeError(f"Required source document is missing or empty: {required.relative_to(ROOT)}")
        assert_equal(tree.get("pipeline"), expected_pipeline, f"{scene['id']} pipeline")
        assert_equal(labels.get("localeInVideo"), "zh-CN", f"{scene['id']} labels locale")
        assert_equal(labels.get("durationSeconds"), scene["durationSeconds"], f"{scene['id']} labels duration")
        if not isinstance(labels.get("labels"), list) or not labels["labels"]:
            raise RuntimeError(f"Labels are missing for {scene['id']}")
        for label in labels["labels"]:
            if set(label) != {"zh-CN", "en"} or not all(isinstance(value, str) and value for value in label.values()):
                raise RuntimeError(f"Malformed bilingual label for {scene['id']}: {label!r}")

    common_source = (SCENE_DIR / "common.py").read_text(encoding="utf-8")
    least_source = (SCENE_DIR / "least_squares_projection.py").read_text(encoding="utf-8")
    if "高维关系示意，不按实际尺度" not in common_source or "disclaimer()" not in least_source:
        raise RuntimeError("Least-squares scene lost the mandatory high-dimensional disclaimer")
    lup_source = (SCENE_DIR / "lup_factor_reuse.py").read_text(encoding="utf-8")
    required_lup = ["[0, 1, 2, 3, 4]", "本例未换行 ≠ 算法不检查主元", "P 只置换方程行"]
    if any(value not in lup_source for value in required_lup):
        raise RuntimeError("LUP source lost the truthful no-swap pivot contract")
    condition_source = (SCENE_DIR / "condition_number_sensitivity.py").read_text(encoding="utf-8")
    required_condition = [
        "329.613418 不是条件数",
        "b → b′",
        "两个相邻系统",
        "disclaimer()",
        "z_living 与 η 均已标准化；相加后不再缩放",
    ]
    if any(value not in condition_source for value in required_condition):
        raise RuntimeError("Conditioning source lost a mandatory sensitivity qualification")
    condition_documents = [
        SCENE_DIR / "condition_number_sensitivity.py",
        SCENE_DIR / "condition_number_sensitivity_prompt.md",
        DOCS_DIR / "condition-number-sensitivity-transcript.zh-CN.md",
        DOCS_DIR / "condition-number-sensitivity-labels.json",
    ]
    forbidden_rescaling_claims = ["再次标准化", "re-standardization", "standardized again"]
    for document in condition_documents:
        content = document.read_text(encoding="utf-8")
        if any(claim in content for claim in forbidden_rescaling_claims):
            raise RuntimeError(f"Conditioning document incorrectly claims a second scaling pass: {document.relative_to(ROOT)}")


def repo_path(path: str, media_dir: Path = PUBLIC_DIR) -> Path:
    numerical_prefix = "/manim/numerical-methods/"
    if path.startswith(numerical_prefix):
        return media_dir / path.removeprefix(numerical_prefix)
    if path.startswith("/manim/"):
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
        "source": f"scripts/manim/ames_numerical_methods/{stem}.py",
        "tree": f"scripts/manim/ames_numerical_methods/{stem}_tree.json",
        "prompt": f"scripts/manim/ames_numerical_methods/{stem}_prompt.md",
        "transcript": f"docs/curriculum-v3/numerical-methods/manim/{slug}-transcript.zh-CN.md",
        "englishSummary": f"docs/curriculum-v3/numerical-methods/manim/{slug}-summary.en.md",
        "labels": f"docs/curriculum-v3/numerical-methods/manim/{slug}-labels.json",
        "mp4": f"/manim/numerical-methods/{slug}.mp4",
        "poster": f"/manim/numerical-methods/{slug}-poster.png",
    }


def metadata(integrity: dict[str, str]) -> dict[str, Any]:
    return {
        "schemaVersion": 1,
        "render": {
            "width": 1920,
            "height": 1080,
            "fps": 30,
            "videoCodec": "h264",
            "localeInVideo": "zh-CN",
            "command": "python scripts/manim/render_ames_numerical_methods.py",
            "checkCommand": "python scripts/manim/render_ames_numerical_methods.py --check",
            "publication": "validated temporary batch followed by atomic directory replacement",
        },
        "notebookOutputs": [
            "/notebooks/numerical-methods/outputs/ames-least-squares-summary.json",
            "/notebooks/numerical-methods/outputs/ames-lu-summary.json",
            "/notebooks/numerical-methods/outputs/ames-conditioning-summary.json",
        ],
        "scenes": [scene_record(scene) for scene in SCENES],
        "integrity": integrity,
    }


def paths_for_integrity() -> list[str]:
    paths = [
        "scripts/manim/render_ames_numerical_methods.py",
        "scripts/manim/ames_numerical_methods/palette.py",
        "scripts/manim/ames_numerical_methods/common.py",
        "public/notebooks/numerical-methods/outputs/ames-least-squares-summary.json",
        "public/notebooks/numerical-methods/outputs/ames-lu-summary.json",
        "public/notebooks/numerical-methods/outputs/ames-conditioning-summary.json",
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
    run([
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-ss",
        str(timestamp),
        "-i",
        str(video),
        "-frames:v",
        "1",
        "-vf",
        "scale=1920:1080",
        str(output),
    ])


def ffprobe(path: Path) -> dict[str, Any]:
    result = subprocess.run([
        "ffprobe",
        "-v",
        "error",
        "-show_streams",
        "-show_format",
        "-of",
        "json",
        str(path),
    ], check=True, capture_output=True, text=True)
    return json.loads(result.stdout)


def verify_video(video: Path, expected_duration: int) -> dict[str, Any]:
    if not video.is_file():
        raise RuntimeError(f"Missing rendered video: {video.relative_to(ROOT)}")
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
        raise RuntimeError(f"Missing poster: {poster.relative_to(ROOT)}")
    probe = ffprobe(poster)
    streams = [stream for stream in probe.get("streams", []) if stream.get("codec_type") == "video"]
    if len(streams) != 1 or (streams[0].get("width"), streams[0].get("height"), streams[0].get("codec_name")) != (1920, 1080, "png"):
        raise RuntimeError(f"Unexpected poster format for {poster.name}: {streams}")


def verify_batch(media_dir: Path) -> None:
    for scene in SCENES:
        verify_video(media_dir / f"{scene['id']}.mp4", scene["durationSeconds"])
        verify_poster(media_dir / f"{scene['id']}-poster.png")
    expected_metadata = json_bytes(metadata(collect_integrity(media_dir)))
    metadata_path = media_dir / "metadata.json"
    if not metadata_path.is_file() or metadata_path.read_bytes() != expected_metadata:
        raise RuntimeError(f"metadata/source/document/output drift in media batch: {media_dir}")


def publish_batch(batch_dir: Path) -> None:
    """Replace the complete public package only after a batch passes verification."""

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
    batch_dir = Path(tempfile.mkdtemp(prefix=".numerical-methods-batch-", dir=PUBLIC_DIR.parent))
    try:
        for index, scene in enumerate(SCENES, start=1):
            print(f"Rendering scene {index}/{len(SCENES)} into temporary batch: {scene['id']}", flush=True)
            render_scene(scene, batch_dir)
        write_if_changed(batch_dir / "metadata.json", json_bytes(metadata(collect_integrity(batch_dir))))
        verify_batch(batch_dir)
        print("Temporary batch verified; publishing the complete numerical-method package.", flush=True)
        publish_batch(batch_dir)
    finally:
        if batch_dir.exists():
            shutil.rmtree(batch_dir, ignore_errors=True)
    print("Rendered, verified, and atomically published 3/3 Ames numerical-method scenes.")


def check_all() -> None:
    validate_package_sources()
    verify_batch(PUBLIC_DIR)
    print("Ames numerical-method Manim assets are in sync (3 scenes, documents, notebook anchors, media, and hashes).")


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
