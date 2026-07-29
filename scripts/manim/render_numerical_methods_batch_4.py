#!/usr/bin/env python3
"""Render and drift-check the three Notebook-bound Banknote videos."""

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
from typing import Any, Mapping
import uuid


ROOT = Path(__file__).resolve().parents[2]
SCENE_DIR = ROOT / "scripts/manim/numerical_methods_batch_4"
DOCS_DIR = ROOT / "docs/curriculum-v3/numerical-methods/manim"
PUBLIC_DIR = ROOT / "public/manim/numerical-methods"
OUTPUT_DIR = ROOT / "public/notebooks/numerical-methods/batch-4-outputs"
OUTPUT_MANIFEST_PATH = OUTPUT_DIR / "manifest.json"
METADATA_NAME = "batch-4-metadata.json"
CONTRACT_VERSION = "numerical-methods-batch-4-v1"
PIPELINE = [
    "ConceptAnalyzer",
    "PrerequisiteExplorer",
    "MathematicalEnricher",
    "VisualDesigner",
    "NarrativeComposer",
    "CodeGenerator",
]
PRIOR_BATCH_METADATA = ("metadata.json", "batch-2-metadata.json", "batch-3-metadata.json")

SCENES = [
    {
        "id": "banknote-feature-scaling",
        "stem": "banknote_feature_scaling",
        "className": "BanknoteFeatureScalingScene",
        "durationSeconds": 72,
        "posterSecond": 68,
        "cuts": [0, 8, 18, 29, 45, 57, 65, 72],
        "outputIds": ["banknote-logistic-optimization-summary", "banknote-training-traces-json"],
        "moduleIds": ["optimization"],
        "sourceDependencies": [
            "public/datasets/numerical-methods/banknote-authentication-manifest.json"
        ],
        "valueBindingKeys": [
            "rowCount",
            "splitCounts",
            "trainScales",
            "rawStep",
            "standardizedStep",
            "rawBestValidation",
            "standardizedBestValidation",
            "rawTerminal",
            "standardizedTerminal",
            "l2",
        ],
    },
    {
        "id": "banknote-fixed-vs-armijo",
        "stem": "banknote_fixed_vs_armijo",
        "className": "BanknoteFixedVsArmijoScene",
        "durationSeconds": 72,
        "posterSecond": 68,
        "cuts": [0, 8, 18, 30, 43, 55, 65, 72],
        "outputIds": ["banknote-logistic-optimization-summary", "banknote-training-traces-json"],
        "moduleIds": ["optimization"],
        "sourceDependencies": [],
        "valueBindingKeys": [
            "initialTrialStep",
            "initialTrialAccepted",
            "firstAcceptedStep",
            "firstBacktrackCount",
            "allAcceptedRowsSatisfySufficientDecrease",
            "c",
            "rho",
            "startObjective",
            "startGradientNorm",
            "fixedFirstObjective",
            "fixedFirstTrainBce",
            "fixedFirstStep",
            "acceptedFirstObjective",
            "acceptedFirstTrainBce",
            "acceptedFirstStep",
            "acceptedFirstBacktracks",
            "fixedTerminal",
            "armijoTerminal",
            "armijoBestValidation",
        ],
    },
    {
        "id": "banknote-training-diagnostics",
        "stem": "banknote_training_diagnostics",
        "className": "BanknoteTrainingDiagnosticsScene",
        "durationSeconds": 72,
        "posterSecond": 68,
        "cuts": [0, 8, 18, 32, 46, 58, 65, 72],
        "outputIds": ["banknote-training-diagnostics-summary", "banknote-training-traces-json"],
        "moduleIds": ["training-diagnostics"],
        "sourceDependencies": [],
        "valueBindingKeys": [
            "runOrder",
            "diagnosticChains",
            "diagnosticTerminals",
            "traceValues",
            "bestValidation",
            "terminal",
            "tooSmallStep",
            "stableStep",
            "tooLargeStep",
            "armijoInitialStep",
            "armijoFirstAccepted",
            "selectedRunId",
            "finalReport",
            "baseline",
            "endpointComparison",
        ],
    },
]

if len(SCENES) != 3:
    raise RuntimeError("Batch 4 must declare exactly three canonical scenes")


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
        try:
            label = path.relative_to(ROOT)
        except ValueError:
            label = path
        raise RuntimeError(f"Cannot read required JSON {label}: {error}") from error
    if not isinstance(value, dict):
        raise RuntimeError(f"Expected JSON object in {path}")
    return value


def assert_equal(actual: Any, expected: Any, label: str) -> None:
    if actual != expected:
        raise RuntimeError(f"Batch 4 contract drift for {label}: {actual!r} != {expected!r}")


def require_mapping(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise RuntimeError(f"Expected object for {label}")
    return value


def require_list(value: Any, label: str) -> list[Any]:
    if not isinstance(value, list):
        raise RuntimeError(f"Expected list for {label}")
    return value


def repo_path(path: str, media_dir: Path = PUBLIC_DIR) -> Path:
    media_prefix = "/manim/numerical-methods/"
    if path.startswith(media_prefix):
        return media_dir / path.removeprefix(media_prefix)
    if path.startswith("/"):
        return ROOT / "public" / path.lstrip("/")
    return ROOT / path


def validate_hash_record(record: Mapping[str, Any], *, path_key: str, label: str) -> Path:
    public_or_repo_path = record.get(path_key)
    expected_hash = record.get("sha256")
    if not isinstance(public_or_repo_path, str) or not public_or_repo_path:
        raise RuntimeError(f"Missing path for {label}")
    if not isinstance(expected_hash, str) or len(expected_hash) != 64:
        raise RuntimeError(f"Missing SHA-256 for {label}")
    path = repo_path(public_or_repo_path)
    if not path.is_file():
        raise RuntimeError(f"Required Batch 4 dependency is missing: {public_or_repo_path}")
    if sha256(path) != expected_hash:
        raise RuntimeError(f"SHA-256 drift for {label}: {public_or_repo_path}")
    if "bytes" in record and path.stat().st_size != record["bytes"]:
        raise RuntimeError(f"Byte-count drift for {label}: {public_or_repo_path}")
    return path


def validate_notebook_contract() -> dict[str, Any]:
    manifest = load_json(OUTPUT_MANIFEST_PATH)
    assert_equal(manifest.get("contractVersion"), CONTRACT_VERSION, "output manifest contractVersion")

    dataset = require_mapping(manifest.get("dataset"), "output manifest dataset")
    dataset_path = validate_hash_record(dataset, path_key="publicPath", label="normalized dataset")
    dataset_manifest_record = require_mapping(dataset.get("manifest"), "dataset manifest record")
    dataset_manifest_path = validate_hash_record(
        dataset_manifest_record,
        path_key="publicPath",
        label="dataset manifest",
    )
    validate_hash_record(
        require_mapping(dataset.get("dataDictionary"), "dataset data dictionary record"),
        path_key="publicPath",
        label="dataset data dictionary",
    )
    validate_hash_record(
        require_mapping(manifest.get("generator"), "generator record"),
        path_key="path",
        label="Notebook generator",
    )
    validate_hash_record(
        require_mapping(manifest.get("requirements"), "requirements record"),
        path_key="publicPath",
        label="Numerical Methods requirements",
    )
    validate_hash_record(
        require_mapping(manifest.get("notebook"), "Notebook record"),
        path_key="publicPath",
        label="executed Notebook",
    )

    output_records = require_list(manifest.get("outputs"), "output records")
    expected_output_ids = [
        "banknote-logistic-optimization-summary",
        "banknote-training-diagnostics-summary",
        "banknote-training-traces-json",
        "banknote-training-traces-csv",
    ]
    assert_equal([record.get("outputId") for record in output_records], expected_output_ids, "output IDs")
    outputs_by_id: dict[str, dict[str, Any]] = {}
    for output_record_value in output_records:
        output_record = require_mapping(output_record_value, "output record")
        output_id = output_record.get("outputId")
        if not isinstance(output_id, str) or output_id in outputs_by_id:
            raise RuntimeError(f"Invalid or duplicate output ID: {output_id!r}")
        validate_hash_record(output_record, path_key="publicPath", label=output_id)
        outputs_by_id[output_id] = output_record

    dataset_manifest = load_json(dataset_manifest_path)
    assert_equal(dataset_manifest.get("contractVersion"), CONTRACT_VERSION, "dataset manifest contractVersion")
    normalized = require_mapping(dataset_manifest.get("normalizedDataset"), "normalized dataset contract")
    assert_equal(normalized.get("publicPath"), dataset.get("publicPath"), "dataset public path")
    assert_equal(normalized.get("sha256"), dataset.get("sha256"), "dataset manifest hash link")
    assert_equal(normalized.get("bytes"), dataset_path.stat().st_size, "dataset manifest byte link")
    assert_equal(normalized.get("rowCount"), 1372, "dataset row count")
    split = require_mapping(dataset_manifest.get("split"), "dataset split")
    assert_equal(split.get("counts"), {"train": 960, "validation": 206, "test": 206}, "split counts")
    preprocessing = require_mapping(dataset_manifest.get("preprocessing"), "dataset preprocessing")
    assert_equal(preprocessing.get("fitSplit"), "train", "train-only preprocessing")
    assert_equal(preprocessing.get("ddof"), 0, "population scaling")

    optimization = load_json(repo_path(outputs_by_id["banknote-logistic-optimization-summary"]["publicPath"]))
    diagnostics = load_json(repo_path(outputs_by_id["banknote-training-diagnostics-summary"]["publicPath"]))
    traces = load_json(repo_path(outputs_by_id["banknote-training-traces-json"]["publicPath"]))
    for label, value in (
        ("optimization summary", optimization),
        ("diagnostics summary", diagnostics),
        ("trace output", traces),
    ):
        assert_equal(value.get("contractVersion"), CONTRACT_VERSION, f"{label} contractVersion")
        assert_equal(value.get("datasetSha256"), dataset.get("sha256"), f"{label} dataset hash")
        assert_equal(value.get("constantsSha256"), manifest.get("constantsSha256"), f"{label} constants hash")
    assert_equal(
        optimization.get("outputId"),
        "banknote-logistic-optimization-summary",
        "optimization output ID",
    )
    assert_equal(
        diagnostics.get("outputId"),
        "banknote-training-diagnostics-summary",
        "diagnostics output ID",
    )
    trace_runs = require_list(traces.get("runs"), "trace runs")
    assert_equal(
        [run.get("runId") for run in trace_runs if isinstance(run, dict)],
        [
            "raw-fixed",
            "standardized-too-small",
            "standardized-stable",
            "standardized-too-large",
            "standardized-armijo",
        ],
        "trace run order",
    )

    return {
        "manifest": manifest,
        "datasetManifest": dataset_manifest,
        "outputsById": outputs_by_id,
        "optimization": optimization,
        "diagnostics": diagnostics,
        "traces": traces,
    }


def validate_label_anchors(labels_by_id: Mapping[str, dict[str, Any]], authority: Mapping[str, Any]) -> None:
    optimization = require_mapping(authority.get("optimization"), "optimization authority")
    diagnostics = require_mapping(authority.get("diagnostics"), "diagnostics authority")
    traces = require_mapping(authority.get("traces"), "trace authority")
    optimization_runs = require_mapping(optimization.get("runs"), "optimization runs")
    armijo_check = require_mapping(optimization.get("armijoCheck"), "Armijo check")

    feature_labels = labels_by_id["banknote-feature-scaling"]
    if feature_labels.get("lockedAnchors") is not None:
        raise RuntimeError("Feature-scaling labels must bind live output paths instead of duplicated anchors")
    raw = require_mapping(optimization_runs.get("raw-fixed"), "raw-fixed run")
    stable = require_mapping(optimization_runs.get("standardized-stable"), "standardized-stable run")
    assert_equal(require_mapping(raw.get("config"), "raw config").get("step"), 4.0, "raw fixed step")
    assert_equal(require_mapping(stable.get("config"), "stable config").get("step"), 4.0, "standardized fixed step")

    fixed_labels = labels_by_id["banknote-fixed-vs-armijo"]
    fixed_anchors = {
        "initialTrialStep": armijo_check.get("initialTrialStep"),
        "initialTrialAccepted": armijo_check.get("initialTrialAccepted"),
        "firstAcceptedStep": armijo_check.get("firstAcceptedStep"),
        "firstBacktrackCount": armijo_check.get("firstBacktrackCount"),
        "fixedTerminalIteration": require_mapping(
            require_mapping(optimization_runs.get("standardized-too-large"), "too-large run").get("terminal"),
            "too-large terminal",
        ).get("iteration"),
        "armijoTerminalIteration": require_mapping(
            require_mapping(optimization_runs.get("standardized-armijo"), "Armijo run").get("terminal"),
            "Armijo terminal",
        ).get("iteration"),
        "source": "banknote-logistic-optimization-summary plus banknote-training-traces.json",
    }
    assert_equal(fixed_labels.get("lockedAnchors"), fixed_anchors, "fixed-versus-Armijo anchors")

    trace_runs = {
        run.get("runId"): run
        for run in require_list(traces.get("runs"), "trace runs")
        if isinstance(run, dict) and isinstance(run.get("runId"), str)
    }
    too_small = require_mapping(trace_runs.get("standardized-too-small"), "too-small trace")
    stable_trace = require_mapping(trace_runs.get("standardized-stable"), "stable trace")
    too_large = require_mapping(trace_runs.get("standardized-too-large"), "too-large trace")
    armijo = require_mapping(trace_runs.get("standardized-armijo"), "Armijo trace")
    too_large_rows = require_list(too_large.get("trace"), "too-large accepted rows")
    final_report = require_mapping(diagnostics.get("finalReport"), "final report")
    manual = require_mapping(final_report.get("manual"), "manual report")
    baseline = require_mapping(diagnostics.get("baseline"), "baseline")
    baseline_metrics = require_mapping(baseline.get("metrics"), "baseline metrics")
    comparison = require_mapping(diagnostics.get("comparison"), "endpoint comparison")

    def compact_terminal(run: Mapping[str, Any], label: str) -> dict[str, Any]:
        terminal = require_mapping(run.get("terminal"), label)
        return {key: terminal.get(key) for key in ("kind", "reason", "iteration")}

    diagnostic_anchors = {
        "tooSmallStep": require_mapping(too_small.get("config"), "too-small config").get("step"),
        "stableStep": require_mapping(stable_trace.get("config"), "stable config").get("step"),
        "tooSmallBestIteration": require_mapping(too_small.get("bestValidation"), "too-small best").get("iteration"),
        "tooSmallBestValidationBce": require_mapping(too_small.get("bestValidation"), "too-small best").get("bce"),
        "tooSmallTerminal": compact_terminal(too_small, "too-small terminal"),
        "stableBestIteration": require_mapping(stable_trace.get("bestValidation"), "stable best").get("iteration"),
        "stableBestValidationBce": require_mapping(stable_trace.get("bestValidation"), "stable best").get("bce"),
        "stableTerminal": compact_terminal(stable_trace, "stable terminal"),
        "tooLargeStep": require_mapping(too_large.get("config"), "too-large config").get("step"),
        "tooLargeBestIteration": require_mapping(too_large.get("bestValidation"), "too-large best").get("iteration"),
        "tooLargeBestValidationBce": require_mapping(too_large.get("bestValidation"), "too-large best").get("bce"),
        "tooLargeTerminalValidationBce": require_mapping(
            too_large_rows[-1], "too-large terminal row"
        ).get("validationBce"),
        "tooLargeTerminal": compact_terminal(too_large, "too-large terminal"),
        "armijoFirstAcceptedStep": require_mapping(armijo.get("firstBacktrack"), "Armijo first acceptance").get("acceptedStepSize"),
        "armijoFirstBacktrackCount": require_mapping(armijo.get("firstBacktrack"), "Armijo first acceptance").get("backtrackCount"),
        "armijoBestIteration": require_mapping(armijo.get("bestValidation"), "Armijo best").get("iteration"),
        "armijoBestValidationBce": require_mapping(armijo.get("bestValidation"), "Armijo best").get("bce"),
        "armijoTerminal": compact_terminal(armijo, "Armijo terminal"),
        "selectedRunId": diagnostics.get("selectedRunId"),
        "manualTestBce": manual.get("testBce"),
        "manualAccuracy": manual.get("accuracy"),
        "manualRocAuc": manual.get("rocAuc"),
        "manualConfusionMatrix": manual.get("confusionMatrix"),
        "baselineVersion": baseline.get("version"),
        "baselineTestBce": baseline_metrics.get("testBce"),
        "predictionAgreement": comparison.get("predictionAgreement"),
        "source": "banknote-training-diagnostics-summary plus banknote-training-traces.json",
    }
    assert_equal(
        labels_by_id["banknote-training-diagnostics"].get("lockedAnchors"),
        diagnostic_anchors,
        "training-diagnostics anchors",
    )


def validate_prior_batch_integrity(media_dir: Path) -> None:
    if not media_dir.is_dir():
        raise RuntimeError(f"Numerical Methods public media directory is missing: {media_dir}")
    for metadata_name in PRIOR_BATCH_METADATA:
        metadata_path = media_dir / metadata_name
        metadata = load_json(metadata_path)
        integrity = require_mapping(metadata.get("integrity"), f"{metadata_name} integrity")
        if not integrity:
            raise RuntimeError(f"Prior batch metadata has no integrity entries: {metadata_name}")
        for path, expected_hash in integrity.items():
            if not isinstance(path, str) or not isinstance(expected_hash, str):
                raise RuntimeError(f"Malformed prior batch integrity entry in {metadata_name}")
            target = repo_path(path, media_dir)
            if not target.is_file() or sha256(target) != expected_hash:
                raise RuntimeError(f"Prior Batch 1-3 dependency drift: {path}")


def validate_package_sources() -> None:
    authority = validate_notebook_contract()
    expected_ids = [
        "banknote-feature-scaling",
        "banknote-fixed-vs-armijo",
        "banknote-training-diagnostics",
    ]
    assert_equal([scene.get("id") for scene in SCENES], expected_ids, "canonical scene IDs")
    assert_equal(len({scene.get("className") for scene in SCENES}), 3, "unique scene classes")
    outputs_by_id = require_mapping(authority.get("outputsById"), "output manifest index")
    output_ids_by_tree_path = {
        f"public{record['publicPath']}": output_id
        for output_id, record in outputs_by_id.items()
    }
    dataset_manifest_path = require_mapping(
        require_mapping(require_mapping(authority["manifest"], "manifest").get("dataset"), "dataset").get("manifest"),
        "dataset manifest record",
    ).get("publicPath")
    labels_by_id: dict[str, dict[str, Any]] = {}

    for scene in SCENES:
        scene_id = scene["id"]
        stem = scene["stem"]
        source = SCENE_DIR / f"{stem}.py"
        prompt = SCENE_DIR / f"{stem}_prompt.md"
        tree_path = SCENE_DIR / f"{stem}_tree.json"
        transcript = DOCS_DIR / f"{scene_id}-transcript.zh-CN.md"
        english_summary = DOCS_DIR / f"{scene_id}-summary.en.md"
        labels_path = DOCS_DIR / f"{scene_id}-labels.json"
        for role, path in (
            ("source", source),
            ("prompt", prompt),
            ("tree", tree_path),
            ("transcript", transcript),
            ("English summary", english_summary),
            ("labels", labels_path),
        ):
            if not path.is_file() or not path.read_bytes():
                raise RuntimeError(f"Missing or empty {role} for {scene_id}: {path.relative_to(ROOT)}")

        source_text = source.read_text(encoding="utf-8")
        for required_source in (
            f'SCENE_ID = "{scene_id}"',
            f'class {scene["className"]}(Scene):',
            "from common import (",
            "from palette import ",
        ):
            if required_source not in source_text:
                raise RuntimeError(f"Scene source contract drift for {scene_id}: {required_source}")

        tree = load_json(tree_path)
        for key, expected in (
            ("contractVersion", CONTRACT_VERSION),
            ("sceneId", scene_id),
            ("sceneClass", scene["className"]),
            ("durationSeconds", scene["durationSeconds"]),
            ("posterSecond", scene["posterSecond"]),
            ("storyboardCuts", scene["cuts"]),
            ("pipeline", PIPELINE),
            ("maxDepth", 3),
        ):
            assert_equal(tree.get(key), expected, f"{scene_id} tree {key}")
        nodes = require_list(tree.get("nodes"), f"{scene_id} nodes")
        if not nodes:
            raise RuntimeError(f"Scene tree is empty for {scene_id}")
        node_ids: list[str] = []
        depths: list[int] = []
        for node_value in nodes:
            node = require_mapping(node_value, f"{scene_id} node")
            node_id = node.get("id")
            depth = node.get("depth")
            if not isinstance(node_id, str) or not node_id or node_id in node_ids:
                raise RuntimeError(f"Invalid or duplicate node ID for {scene_id}: {node_id!r}")
            if isinstance(depth, bool) or not isinstance(depth, int) or depth < 0 or depth > 3:
                raise RuntimeError(f"Invalid tree depth for {scene_id}.{node_id}: {depth!r}")
            node_ids.append(node_id)
            depths.append(depth)
        assert_equal(max(depths), 3, f"{scene_id} exact tree depth")
        root = tree.get("root")
        roots = [node for node in nodes if isinstance(node, dict) and node.get("id") == root]
        if len(roots) != 1 or roots[0].get("depth") != 0:
            raise RuntimeError(f"Scene root must be the unique depth-0 output for {scene_id}")
        topological_order = require_list(tree.get("topologicalOrder"), f"{scene_id} topological order")
        assert_equal(set(topological_order), set(node_ids), f"{scene_id} topological node coverage")
        assert_equal(topological_order[-1], root, f"{scene_id} root ordering")

        output_dependencies = require_list(tree.get("outputDependencies"), f"{scene_id} output dependencies")
        resolved_output_ids: list[str] = []
        for dependency_value in output_dependencies:
            dependency = require_mapping(dependency_value, f"{scene_id} output dependency")
            path = dependency.get("path")
            if not isinstance(path, str) or path not in output_ids_by_tree_path:
                raise RuntimeError(f"Unknown Notebook output dependency for {scene_id}: {path!r}")
            output_id = output_ids_by_tree_path[path]
            if dependency.get("outputId") is not None:
                assert_equal(dependency.get("outputId"), output_id, f"{scene_id} dependency output ID")
            resolved_output_ids.append(output_id)
        assert_equal(resolved_output_ids, scene["outputIds"], f"{scene_id} output dependency order")

        source_dependencies = tree.get("sourceDependencies") or []
        source_dependency_paths = [
            require_mapping(value, f"{scene_id} source dependency").get("path")
            for value in require_list(source_dependencies, f"{scene_id} source dependencies")
        ]
        assert_equal(source_dependency_paths, scene["sourceDependencies"], f"{scene_id} source dependencies")
        if source_dependency_paths:
            assert_equal(
                f"/{source_dependency_paths[0].removeprefix('public/')}",
                dataset_manifest_path,
                f"{scene_id} dataset manifest dependency",
            )

        labels = load_json(labels_path)
        labels_by_id[scene_id] = labels
        for key, expected in (
            ("contractVersion", CONTRACT_VERSION),
            ("schemaVersion", 1),
            ("sceneId", scene_id),
            ("sceneClass", scene["className"]),
            ("durationSeconds", scene["durationSeconds"]),
            ("localeInVideo", "zh-CN"),
        ):
            assert_equal(labels.get(key), expected, f"{scene_id} labels {key}")
        value_bindings = require_mapping(labels.get("valueBindings"), f"{scene_id} value bindings")
        assert_equal(list(value_bindings), scene["valueBindingKeys"], f"{scene_id} value-binding keys")
        label_rows = require_list(labels.get("labels"), f"{scene_id} labels")
        if not label_rows:
            raise RuntimeError(f"Bilingual labels are absent for {scene_id}")
        label_ids: set[str] = set()
        for label_value in label_rows:
            label = require_mapping(label_value, f"{scene_id} bilingual label")
            if set(label) != {"id", "zh-CN", "en"}:
                raise RuntimeError(f"Malformed bilingual label keys for {scene_id}: {set(label)}")
            if not all(isinstance(label[key], str) and label[key].strip() for key in ("id", "zh-CN", "en")):
                raise RuntimeError(f"Empty bilingual label for {scene_id}")
            if label["id"] in label_ids:
                raise RuntimeError(f"Duplicate bilingual label ID for {scene_id}: {label['id']}")
            label_ids.add(label["id"])
        fallbacks = require_mapping(labels.get("fallbacks"), f"{scene_id} fallbacks")
        for fallback in ("reducedMotion", "videoFailure", "nonColor"):
            if fallback not in fallbacks or not fallbacks[fallback]:
                raise RuntimeError(f"Missing {fallback} fallback for {scene_id}")

    validate_label_anchors(labels_by_id, authority)
    validate_prior_batch_integrity(PUBLIC_DIR)


def scene_record(scene: Mapping[str, Any]) -> dict[str, Any]:
    slug = scene["id"]
    stem = scene["stem"]
    return {
        "id": slug,
        "className": scene["className"],
        "durationSeconds": scene["durationSeconds"],
        "storyboardCuts": scene["cuts"],
        "posterSecond": scene["posterSecond"],
        "outputIds": scene["outputIds"],
        "moduleIds": scene["moduleIds"],
        "source": f"scripts/manim/numerical_methods_batch_4/{stem}.py",
        "tree": f"scripts/manim/numerical_methods_batch_4/{stem}_tree.json",
        "prompt": f"scripts/manim/numerical_methods_batch_4/{stem}_prompt.md",
        "transcript": f"docs/curriculum-v3/numerical-methods/manim/{slug}-transcript.zh-CN.md",
        "englishSummary": f"docs/curriculum-v3/numerical-methods/manim/{slug}-summary.en.md",
        "labels": f"docs/curriculum-v3/numerical-methods/manim/{slug}-labels.json",
        "mp4": f"/manim/numerical-methods/{slug}.mp4",
        "poster": f"/manim/numerical-methods/{slug}-poster.png",
    }


def metadata(integrity: dict[str, str]) -> dict[str, Any]:
    output_manifest = load_json(OUTPUT_MANIFEST_PATH)
    return {
        "schemaVersion": 1,
        "batchId": "numerical-methods-batch-4",
        "render": {
            "width": 1920,
            "height": 1080,
            "fps": 30,
            "videoCodec": "h264",
            "localeInVideo": "zh-CN",
            "command": "python scripts/manim/render_numerical_methods_batch_4.py",
            "checkCommand": "python scripts/manim/render_numerical_methods_batch_4.py --check",
            "publication": "validated temporary copy followed by atomic numerical-method directory replacement",
        },
        "notebookOutputs": [record["publicPath"] for record in output_manifest["outputs"]],
        "scenes": [scene_record(scene) for scene in SCENES],
        "integrity": integrity,
    }


def paths_for_integrity() -> list[str]:
    manifest = load_json(OUTPUT_MANIFEST_PATH)
    paths = [
        "scripts/manim/render_numerical_methods_batch_4.py",
        "scripts/manim/numerical_methods_batch_4/common.py",
        "scripts/manim/numerical_methods_batch_4/palette.py",
        "public/notebooks/numerical-methods/batch-4-outputs/manifest.json",
        manifest["dataset"]["publicPath"],
        manifest["dataset"]["manifest"]["publicPath"],
        manifest["dataset"]["dataDictionary"]["publicPath"],
        manifest["generator"]["path"],
        manifest["requirements"]["publicPath"],
        manifest["notebook"]["publicPath"],
        *[record["publicPath"] for record in manifest["outputs"]],
    ]
    for scene in SCENES:
        record = scene_record(scene)
        paths.extend(
            record[key]
            for key in (
                "source",
                "tree",
                "prompt",
                "transcript",
                "englishSummary",
                "labels",
                "mp4",
                "poster",
            )
        )
    if len(paths) != len(set(paths)):
        raise RuntimeError("Batch 4 integrity manifest contains duplicate paths")
    return paths


def collect_integrity(media_dir: Path = PUBLIC_DIR) -> dict[str, str]:
    result: dict[str, str] = {}
    for path in paths_for_integrity():
        target = repo_path(path, media_dir)
        if not target.is_file():
            raise RuntimeError(f"Required Manim package dependency is missing: {path}")
        result[path] = sha256(target)
    return result


def target_media_names() -> set[str]:
    names = {METADATA_NAME}
    for scene in SCENES:
        names.add(f"{scene['id']}.mp4")
        names.add(f"{scene['id']}-poster.png")
    return names


def preserved_media_integrity(media_dir: Path) -> dict[str, str]:
    if not media_dir.exists():
        return {}
    if not media_dir.is_dir():
        raise RuntimeError(f"Public package path is not a directory: {media_dir}")
    excluded = target_media_names()
    result: dict[str, str] = {}
    for path in sorted(media_dir.rglob("*")):
        if path.is_file() and path.relative_to(media_dir).as_posix() not in excluded:
            result[path.relative_to(media_dir).as_posix()] = sha256(path)
    return result


def assert_preserved_media(media_dir: Path, expected: Mapping[str, str]) -> None:
    actual = preserved_media_integrity(media_dir)
    if actual != dict(expected):
        missing = sorted(set(expected) - set(actual))
        added = sorted(set(actual) - set(expected))
        changed = sorted(path for path in set(actual) & set(expected) if actual[path] != expected[path])
        raise RuntimeError(
            "Batch 1-3 media preservation failed: "
            f"missing={missing}, added={added}, changed={changed}"
        )


def run(command: list[str], *, env: dict[str, str] | None = None) -> None:
    print("+", " ".join(command), flush=True)
    subprocess.run(command, cwd=ROOT, env=env, check=True)


def render_scene(scene: Mapping[str, Any], destination_dir: Path) -> None:
    source = SCENE_DIR / f"{scene['stem']}.py"
    output = destination_dir / f"{scene['id']}.mp4"
    with tempfile.TemporaryDirectory(prefix=f"ml-atlas-{scene['stem']}-") as temporary:
        media_dir = Path(temporary)
        env = os.environ.copy()
        env["PYTHONPATH"] = str(SCENE_DIR) + os.pathsep + env.get("PYTHONPATH", "")
        run(
            [
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
            ],
            env=env,
        )
        candidates = list(media_dir.rglob(f"{scene['id']}.mp4"))
        if len(candidates) != 1:
            raise RuntimeError(f"Expected one rendered MP4 for {scene['id']}, found {len(candidates)}")
        shutil.copy2(candidates[0], output)
    poster = destination_dir / f"{scene['id']}-poster.png"
    extract_poster(output, poster, scene["posterSecond"])
    verify_video(output, scene["durationSeconds"])
    verify_poster(poster)


def extract_poster(video: Path, output: Path, timestamp: int) -> None:
    run(
        [
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
        ]
    )


def ffprobe(path: Path) -> dict[str, Any]:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    value = json.loads(result.stdout)
    if not isinstance(value, dict):
        raise RuntimeError(f"ffprobe returned malformed JSON for {path}")
    return value


def verify_video(video: Path, expected_duration: int) -> dict[str, Any]:
    if not video.is_file():
        raise RuntimeError(f"Missing rendered video: {video}")
    probe = ffprobe(video)
    streams = require_list(probe.get("streams"), f"{video.name} streams")
    video_streams = [stream for stream in streams if isinstance(stream, dict) and stream.get("codec_type") == "video"]
    audio_streams = [stream for stream in streams if isinstance(stream, dict) and stream.get("codec_type") == "audio"]
    if len(video_streams) != 1 or audio_streams:
        raise RuntimeError(f"Expected one silent video stream in {video.name}")
    stream = video_streams[0]
    actual = (stream.get("width"), stream.get("height"), stream.get("r_frame_rate"), stream.get("codec_name"))
    if actual != (1920, 1080, "30/1", "h264"):
        raise RuntimeError(f"Unexpected video format for {video.name}: {actual}")
    format_record = require_mapping(probe.get("format"), f"{video.name} format")
    duration = float(format_record["duration"])
    if abs(duration - expected_duration) > 0.20:
        raise RuntimeError(
            f"Unexpected duration for {video.name}: {duration:.3f}s, expected {expected_duration}s"
        )
    return {"width": 1920, "height": 1080, "fps": "30/1", "codec": "h264", "duration": duration}


def verify_poster(poster: Path) -> None:
    if not poster.is_file():
        raise RuntimeError(f"Missing poster: {poster}")
    streams = [
        stream
        for stream in require_list(ffprobe(poster).get("streams"), f"{poster.name} streams")
        if isinstance(stream, dict) and stream.get("codec_type") == "video"
    ]
    if len(streams) != 1 or (
        streams[0].get("width"),
        streams[0].get("height"),
        streams[0].get("codec_name"),
    ) != (1920, 1080, "png"):
        raise RuntimeError(f"Unexpected poster format for {poster.name}: {streams}")


def verify_batch(media_dir: Path) -> None:
    validate_prior_batch_integrity(media_dir)
    for scene in SCENES:
        verify_video(media_dir / f"{scene['id']}.mp4", scene["durationSeconds"])
        verify_poster(media_dir / f"{scene['id']}-poster.png")
    expected_metadata = json_bytes(metadata(collect_integrity(media_dir)))
    metadata_path = media_dir / METADATA_NAME
    if not metadata_path.is_file() or metadata_path.read_bytes() != expected_metadata:
        raise RuntimeError(f"metadata/source/document/output drift in Batch 4 media: {media_dir}")


def remove_path(path: Path) -> None:
    if path.is_dir():
        shutil.rmtree(path)
    elif path.exists():
        path.unlink()


def publish_batch(batch_dir: Path, preserved_before: Mapping[str, str]) -> None:
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
        verify_batch(PUBLIC_DIR)
        assert_preserved_media(PUBLIC_DIR, preserved_before)
    except BaseException:
        if published and PUBLIC_DIR.exists():
            failed_dir = PUBLIC_DIR.parent / f".{PUBLIC_DIR.name}-failed-{uuid.uuid4().hex}"
            os.replace(PUBLIC_DIR, failed_dir)
            remove_path(failed_dir)
        if had_public_package and backup_dir.exists():
            os.replace(backup_dir, PUBLIC_DIR)
            assert_preserved_media(PUBLIC_DIR, preserved_before)
        raise
    else:
        remove_path(backup_dir)


def render_all() -> None:
    validate_package_sources()
    preserved_before = preserved_media_integrity(PUBLIC_DIR)
    PUBLIC_DIR.parent.mkdir(parents=True, exist_ok=True)
    batch_dir = Path(tempfile.mkdtemp(prefix=".numerical-methods-batch-4-", dir=PUBLIC_DIR.parent))
    try:
        if PUBLIC_DIR.exists():
            shutil.copytree(PUBLIC_DIR, batch_dir, dirs_exist_ok=True)
        assert_preserved_media(batch_dir, preserved_before)
        for index, scene in enumerate(SCENES, start=1):
            print(f"Rendering scene {index}/{len(SCENES)} into temporary package: {scene['id']}", flush=True)
            render_scene(scene, batch_dir)
        write_if_changed(batch_dir / METADATA_NAME, json_bytes(metadata(collect_integrity(batch_dir))))
        verify_batch(batch_dir)
        assert_preserved_media(batch_dir, preserved_before)
        print("Temporary Batch 4 package verified; publishing the complete numerical-method directory.", flush=True)
        publish_batch(batch_dir, preserved_before)
    finally:
        if batch_dir.exists():
            shutil.rmtree(batch_dir)
    print("Rendered, verified, and atomically published 3/3 numerical-method Batch 4 scenes.")


def check_all() -> None:
    validate_package_sources()
    verify_batch(PUBLIC_DIR)
    print("Numerical-method Batch 4 Manim assets are in sync (3 scenes, documents, Notebook anchors, media, and hashes).")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Offline, write-free verification of source, dependencies, media, and hashes",
    )
    args = parser.parse_args()
    try:
        check_all() if args.check else render_all()
    except (RuntimeError, FileNotFoundError, json.JSONDecodeError, subprocess.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
