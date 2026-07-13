#!/usr/bin/env python3
"""Render and drift-check the three deterministic AI Overview Manim packages."""

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


ROOT = Path(__file__).resolve().parents[2]
SCENE_DIR = ROOT / "scripts/manim/ai_overview"
PUBLIC_DIR = ROOT / "public/manim/ai-overview"
DOCS_DIR = ROOT / "docs/curriculum-v3/ai-overview/manim"
METADATA_PATH = PUBLIC_DIR / "metadata.json"
FIXTURE_PATH = PUBLIC_DIR / "experiment-fixture.json"
EXPERIMENT_SOURCE = ROOT / "src/modules/ai-overview/data/experiments.ts"
KMEANS_SOURCE = ROOT / "src/modules/ai-overview/utils/kmeans.ts"
Q_SOURCE = ROOT / "src/modules/ai-overview/utils/qLearning.ts"


SCENES = [
    {
        "id": "linear-regression-parameter-search",
        "stem": "linear_regression_parameter_search",
        "className": "LinearRegressionParameterSearch",
        "durationSeconds": 85,
        "posterSecond": 82,
        "keyframes": [("shared-data", 15), ("sample-error", 36), ("leaderboard", 70)],
        "contract": {"presetId": "clear-trend", "durationSeconds": 85, "storyboardCuts": [0, 8, 18, 30, 44, 55, 75, 85]},
    },
    {
        "id": "kmeans-convergence",
        "stem": "kmeans_convergence",
        "className": "KMeansConvergence",
        "durationSeconds": 88,
        "posterSecond": 85,
        "keyframes": [("initial-centers", 13), ("mean-update", 47), ("converged", 77)],
        "contract": {"seed": 3103, "k": 3, "durationSeconds": 88, "storyboardCuts": [0, 8, 16, 28, 38, 52, 72, 80, 88]},
    },
    {
        "id": "q-learning-strategy",
        "stem": "q_learning_strategy",
        "className": "QLearningStrategy",
        "durationSeconds": 90,
        "posterSecond": 87,
        "keyframes": [("environment", 6), ("numeric-update", 30), ("training", 65), ("evaluation", 78)],
        "contract": {"seed": 7107, "rewards": {"goal": 10, "step": -1, "collision": -3}, "durationSeconds": 90, "storyboardCuts": [0, 8, 18, 34, 44, 70, 82, 90]},
    },
]


REGRESSION_SAMPLES = [
    {"id": "s1", "x": 1, "y": 52}, {"id": "s2", "x": 2, "y": 59},
    {"id": "s3", "x": 3, "y": 65}, {"id": "s4", "x": 4, "y": 72},
    {"id": "s5", "x": 5, "y": 78},
]
REGRESSION_CANDIDATES = [
    {"w": 4, "b": 48}, {"w": 5, "b": 48}, {"w": 6, "b": 47},
    {"w": 6.5, "b": 46}, {"w": 6.6, "b": 45.8}, {"w": 7, "b": 45},
    {"w": 5.5, "b": 50},
]
KMEANS_POINTS = [
    {"id": "l1", "x": 92, "y": 28}, {"id": "l2", "x": 88, "y": 33},
    {"id": "l3", "x": 95, "y": 37}, {"id": "l4", "x": 76, "y": 64},
    {"id": "l5", "x": 72, "y": 71}, {"id": "l6", "x": 81, "y": 68},
    {"id": "l7", "x": 48, "y": 31}, {"id": "l8", "x": 43, "y": 37},
    {"id": "l9", "x": 51, "y": 42}, {"id": "l10", "x": 61, "y": 88},
    {"id": "l11", "x": 56, "y": 82}, {"id": "l12", "x": 65, "y": 93},
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def json_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def write_if_changed(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists() or path.read_bytes() != content:
        path.write_bytes(content)


def checked_fixture() -> dict[str, Any]:
    fixture = {
        "schemaVersion": 1,
        "checkedSources": {
            "experiments": {"path": "src/modules/ai-overview/data/experiments.ts", "sha256": sha256(EXPERIMENT_SOURCE)},
            "kmeans": {"path": "src/modules/ai-overview/utils/kmeans.ts", "sha256": sha256(KMEANS_SOURCE)},
            "qLearning": {"path": "src/modules/ai-overview/utils/qLearning.ts", "sha256": sha256(Q_SOURCE)},
        },
        "regression": {"presetId": "clear-trend", "samples": REGRESSION_SAMPLES, "candidates": REGRESSION_CANDIDATES},
        "kmeans": {
            "seed": 3103, "k": 3, "points": KMEANS_POINTS,
            "initialCenters": [[43, 37], [88, 33], [56, 82]],
            "finalCenters": [[47.333333333333336, 36.666666666666664], [91.66666666666667, 32.666666666666664], [68.5, 77.66666666666667]],
            "assignments": [1, 1, 1, 2, 2, 2, 0, 0, 0, 2, 2, 2],
            "withinGroupDistanceTotals": [2441, 1293.5, 1293.5], "convergedIteration": 2,
        },
        "qLearning": {
            "seed": 7107,
            "environment": {
                "width": 4, "height": 4, "start": {"row": 3, "column": 0}, "goal": {"row": 0, "column": 3},
                "obstacles": [{"row": 1, "column": 1}, {"row": 2, "column": 2}],
                "rewards": {"goal": 10, "step": -1, "collision": -3},
            },
            "training": {"episodes": 50, "explorationRate": 0.3, "learningRate": 0.5, "discountFactor": 0.9},
        },
    }
    _validate_typescript_contract()
    return fixture


def _validate_typescript_contract() -> None:
    text = EXPERIMENT_SOURCE.read_text(encoding="utf-8")
    required = [
        "AI_OVERVIEW_SEEDS = { kmeans: 3103, qLearning: 7107 }",
        "'clear-trend': { id: 'clear-trend'",
        "goalReward: 10, stepReward: -1, collisionReward: -3",
        "start: { row: 3, column: 0 }, goal: { row: 0, column: 3 }",
        "obstacles: [{ row: 1, column: 1 }, { row: 2, column: 2 }]",
    ]
    missing = [snippet for snippet in required if snippet not in text]
    for sample in REGRESSION_SAMPLES:
        token = f"{{ id: '{sample['id']}', x: {sample['x']}, y: {sample['y']} }}"
        if token not in text:
            missing.append(token)
    for point in KMEANS_POINTS:
        token = f"{{ id: '{point['id']}', x: {point['x']}, y: {point['y']} }}"
        if token not in text:
            missing.append(token)
    if missing:
        raise RuntimeError("AI Overview TypeScript contract drift: " + "; ".join(missing))


def repo_path(path: str) -> Path:
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
        "source": f"scripts/manim/ai_overview/{stem}.py",
        "tree": f"scripts/manim/ai_overview/{stem}_tree.json",
        "prompt": f"scripts/manim/ai_overview/{stem}_prompt.md",
        "transcript": f"docs/curriculum-v3/ai-overview/manim/{slug}-transcript.zh-CN.md",
        "englishSummary": f"docs/curriculum-v3/ai-overview/manim/{slug}-summary.en.md",
        "labels": f"docs/curriculum-v3/ai-overview/manim/{slug}-labels.json",
        "mp4": f"/manim/ai-overview/{slug}.mp4",
        "poster": f"/manim/ai-overview/{slug}-poster.png",
        "keyframes": [
            {"id": frame_id, "timestampSeconds": second, "path": f"/manim/ai-overview/{slug}-keyframe-{frame_id}.png"}
            for frame_id, second in scene["keyframes"]
        ],
        "contract": scene["contract"],
    }


def metadata(integrity: dict[str, str]) -> dict[str, Any]:
    return {
        "schemaVersion": 1,
        "render": {"width": 1920, "height": 1080, "fps": 30, "command": "python scripts/manim/render_ai_overview.py"},
        "fixture": "/manim/ai-overview/experiment-fixture.json",
        "palette": "scripts/manim/ai_overview/palette.py",
        "scenes": [scene_record(scene) for scene in SCENES],
        "integrity": integrity,
    }


def paths_for_integrity() -> list[str]:
    paths = ["scripts/manim/ai_overview/palette.py", "/manim/ai-overview/experiment-fixture.json"]
    for scene in SCENES:
        record = scene_record(scene)
        paths.extend([record[key] for key in ["source", "tree", "prompt", "transcript", "englishSummary", "labels", "mp4", "poster"]])
        paths.extend(frame["path"] for frame in record["keyframes"])
    return paths


def collect_integrity() -> dict[str, str]:
    result = {}
    for path in paths_for_integrity():
        target = repo_path(path)
        if not target.is_file():
            raise RuntimeError(f"Required Manim package file is missing: {path}")
        result[path] = sha256(target)
    return result


def run(command: list[str], *, env: dict[str, str] | None = None) -> None:
    print("+", " ".join(command), flush=True)
    subprocess.run(command, cwd=ROOT, env=env, check=True)


def render_scene(scene: dict[str, Any]) -> None:
    source = SCENE_DIR / f"{scene['stem']}.py"
    output = PUBLIC_DIR / f"{scene['id']}.mp4"
    with tempfile.TemporaryDirectory(prefix=f"ml-atlas-{scene['stem']}-") as tmp:
        media_dir = Path(tmp)
        env = os.environ.copy()
        env["PYTHONPATH"] = str(SCENE_DIR) + os.pathsep + env.get("PYTHONPATH", "")
        run([
            sys.executable, "-m", "manim", str(source), scene["className"],
            "--format", "mp4", "--resolution", "1920,1080", "--frame_rate", "30",
            "--media_dir", str(media_dir), "--output_file", f"{scene['id']}.mp4",
        ], env=env)
        candidates = list(media_dir.rglob(f"{scene['id']}.mp4"))
        if len(candidates) != 1:
            raise RuntimeError(f"Expected one rendered MP4 for {scene['id']}, found {len(candidates)}")
        shutil.copy2(candidates[0], output)

    extract_frame(output, PUBLIC_DIR / f"{scene['id']}-poster.png", scene["posterSecond"])
    for frame_id, timestamp in scene["keyframes"]:
        extract_frame(output, PUBLIC_DIR / f"{scene['id']}-keyframe-{frame_id}.png", timestamp)
    verify_video(output, scene["durationSeconds"])


def extract_frame(video: Path, output: Path, timestamp: int) -> None:
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(timestamp), "-i", str(video), "-frames:v", "1", "-vf", "scale=1920:1080", str(output)])


def verify_video(video: Path, expected_duration: int) -> None:
    result = subprocess.run([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height,r_frame_rate:format=duration", "-of", "json", str(video),
    ], check=True, capture_output=True, text=True)
    probe = json.loads(result.stdout)
    stream = probe["streams"][0]
    duration = float(probe["format"]["duration"])
    if (stream["width"], stream["height"], stream["r_frame_rate"]) != (1920, 1080, "30/1"):
        raise RuntimeError(f"Unexpected video format for {video.name}: {stream}")
    if abs(duration - expected_duration) > 0.2:
        raise RuntimeError(f"Unexpected duration for {video.name}: {duration:.3f}s, expected {expected_duration}s")


def render_all() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    write_if_changed(FIXTURE_PATH, json_bytes(checked_fixture()))
    for index, scene in enumerate(SCENES, start=1):
        print(f"Rendering scene {index}/{len(SCENES)}: {scene['id']}", flush=True)
        render_scene(scene)
    write_if_changed(METADATA_PATH, json_bytes(metadata(collect_integrity())))
    print("Rendered 3/3 AI Overview Manim scenes and refreshed metadata.")


def check_all() -> None:
    expected_fixture = json_bytes(checked_fixture())
    if not FIXTURE_PATH.is_file() or FIXTURE_PATH.read_bytes() != expected_fixture:
        raise RuntimeError("experiment-fixture.json drift; run python scripts/manim/render_ai_overview.py")
    for scene in SCENES:
        verify_video(PUBLIC_DIR / f"{scene['id']}.mp4", scene["durationSeconds"])
    expected_metadata = json_bytes(metadata(collect_integrity()))
    if not METADATA_PATH.is_file() or METADATA_PATH.read_bytes() != expected_metadata:
        raise RuntimeError("metadata/source/output drift; run python scripts/manim/render_ai_overview.py")
    print("AI Overview Manim assets are in sync (3 scenes, fixture, metadata, sources, and outputs).")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify all generated bytes and media without writing")
    args = parser.parse_args()
    try:
        check_all() if args.check else render_all()
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
