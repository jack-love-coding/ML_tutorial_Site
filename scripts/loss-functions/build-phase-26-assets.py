#!/usr/bin/env python3
"""Build and verify the fail-closed Phase 26 loss-functions data assets."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
import shutil
import sys
import tempfile
import urllib.request
import uuid
import zipfile
from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from statistics import median
from typing import Any, Iterator


REPO_ROOT = Path(__file__).resolve().parents[2]
PHASE_DIR = REPO_ROOT / ".planning/phases/26-loss-functions-rebuild"
RESEARCH_PATH = PHASE_DIR / "26-RESEARCH.md"
CONTRACT_PATH = REPO_ROOT / "docs/curriculum-v3/loss-functions/phase-26-data-contract.md"
CONTRACT_VERSION = "loss-functions-phase-26-v1"
TRANSFORM_VERSION = "phase-26-normalization-v1"
APPROVAL_DECISION = "approve-lade"
DEFAULT_SOURCE_CACHE = REPO_ROOT / ".cache/loss-functions/phase-26-sources"
DEFAULT_STAGING_ROOT = REPO_ROOT / ".cache/loss-functions/phase-26-staging"
SOURCE_CACHE_MANIFEST = "source-cache-manifest.json"


class Phase26Error(RuntimeError):
    """Fail-closed Phase 26 asset error."""


@dataclass(frozen=True)
class SourceContract:
    dataset_id: str
    cache_name: str
    download_url: str
    page_url: str
    revision_or_doi: str
    license: str
    attribution: str
    sha256: str
    expected_bytes: int | None = None
    declared_feature_count: int | None = None
    observed_feature_count: int | None = None


LADE = SourceContract(
    dataset_id="lade-delivery-jilin",
    cache_name="lade-delivery-jilin.csv",
    download_url=(
        "https://huggingface.co/datasets/Cainiao-AI/LaDe/resolve/"
        "be2cec02775cafc8d52230303f32134382bcc50b/delivery/delivery_jl.csv"
    ),
    page_url="https://huggingface.co/datasets/Cainiao-AI/LaDe",
    revision_or_doi="be2cec02775cafc8d52230303f32134382bcc50b",
    license="Apache-2.0",
    attribution="Cainiao-AI LaDe dataset card and the LaDe paper, arXiv:2306.10675",
    sha256="12e2cf4664dd5b4475d39dddee8872f5a03b3082f08f0eece7f103baee6c6e73",
    expected_bytes=4_736_342,
)

SECOM = SourceContract(
    dataset_id="uci-secom",
    cache_name="uci-secom.zip",
    download_url="https://archive.ics.uci.edu/static/public/179/secom.zip",
    page_url="https://archive.ics.uci.edu/dataset/179/secom",
    revision_or_doi="10.24432/C54305",
    license="CC BY 4.0",
    attribution="UCI Machine Learning Repository SECOM dataset, DOI 10.24432/C54305",
    sha256="eea568baf3c2229096d7d294cf0b096b5502bd96d92c0b80a65b84714059be8e",
    declared_feature_count=591,
    observed_feature_count=590,
)

SOURCE_CONTRACTS = (LADE, SECOM)
LADE_SOURCE_FIELDS = (
    "order_id",
    "region_id",
    "city",
    "courier_id",
    "lng",
    "lat",
    "aoi_id",
    "aoi_type",
    "accept_time",
    "accept_gps_time",
    "accept_gps_lng",
    "accept_gps_lat",
    "delivery_time",
    "delivery_gps_time",
    "delivery_gps_lng",
    "delivery_gps_lat",
    "ds",
)
LADE_PUBLISHED_FIELDS = (
    "course_row_id",
    "source_row_number",
    "city",
    "aoi_type",
    "accept_time",
    "delivery_time",
    "ds",
    "delivery_duration_minutes",
)
LADE_REMOVED_FIELDS = (
    "order_id",
    "region_id",
    "courier_id",
    "lng",
    "lat",
    "aoi_id",
    "accept_gps_time",
    "accept_gps_lng",
    "accept_gps_lat",
    "delivery_gps_time",
    "delivery_gps_lng",
    "delivery_gps_lat",
)
SECOM_ARCHIVE_MEMBERS = ("secom.data", "secom_labels.data", "secom.names")
LADE_EXPECTED_ROWS = 31_415
SECOM_EXPECTED_ROWS = 1_567
SECOM_EXPECTED_LABEL_COUNTS = {-1: 1_463, 1: 104}

RESEARCH_ANCHORS = (
    "## Open Questions (RESOLVED)",
    "2026-07-28 the product owner gave the explicit response `approve-lade`",
    LADE.revision_or_doi,
    LADE.sha256,
    "`courier_id`, GPS coordinates, and precise stop fields",
)

CONTRACT_ANCHORS = (
    f"**Contract version:** `{CONTRACT_VERSION}`",
    f"**Authorization decision:** `{APPROVAL_DECISION}`",
    LADE.download_url,
    LADE.sha256,
    LADE.license,
    LADE.attribution,
    SECOM.download_url,
    SECOM.revision_or_doi,
    SECOM.sha256,
    SECOM.license,
    *LADE_PUBLISHED_FIELDS,
    *LADE_REMOVED_FIELDS,
    "GPS coordinates",
    "precise stop fields",
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def strict_json_bytes(value: Any) -> bytes:
    """Serialize standards JSON and reject bare NaN/Infinity."""

    return (
        json.dumps(
            value,
            ensure_ascii=False,
            indent=2,
            sort_keys=True,
            allow_nan=False,
        )
        + "\n"
    ).encode("utf-8")


def nonfinite_result(status: str) -> dict[str, str | None]:
    if status not in {"inf", "-inf", "nan"}:
        raise Phase26Error(f"Unsupported non-finite status: {status!r}")
    return {"status": status, "value": None}


def _reject_json_constant(value: str) -> None:
    raise Phase26Error(f"Non-finite JSON constant is forbidden: {value}")


def read_strict_json(path: Path) -> Any:
    try:
        return json.loads(
            path.read_text(encoding="utf-8"),
            parse_constant=_reject_json_constant,
        )
    except (OSError, json.JSONDecodeError) as error:
        raise Phase26Error(f"Invalid JSON at {path}: {error}") from error


def contract_snapshot() -> dict[str, Any]:
    return {
        "contractVersion": CONTRACT_VERSION,
        "transformVersion": TRANSFORM_VERSION,
        "approval": APPROVAL_DECISION,
        "lade": {
            "datasetId": LADE.dataset_id,
            "downloadUrl": LADE.download_url,
            "revisionOrDoi": LADE.revision_or_doi,
            "license": LADE.license,
            "sha256": LADE.sha256,
        },
        "secom": {
            "datasetId": SECOM.dataset_id,
            "downloadUrl": SECOM.download_url,
            "revisionOrDoi": SECOM.revision_or_doi,
            "license": SECOM.license,
            "sha256": SECOM.sha256,
            "declaredFeatureCount": SECOM.declared_feature_count,
            "observedFeatureCount": SECOM.observed_feature_count,
        },
        "publication": {
            "allowedFields": list(LADE_PUBLISHED_FIELDS),
            "removedFields": list(LADE_REMOVED_FIELDS),
        },
    }


def _require_anchors(path: Path, anchors: tuple[str, ...], label: str) -> None:
    if not path.is_file():
        raise Phase26Error(f"Missing {label}: {path}")
    text = path.read_text(encoding="utf-8")
    missing = [anchor for anchor in anchors if anchor not in text]
    if missing:
        raise Phase26Error(f"{label} drifted; missing exact approval/contract anchors: {missing}")


def validate_contract(path: Path = CONTRACT_PATH) -> None:
    _require_anchors(path, CONTRACT_ANCHORS, "Phase 26 data contract")


def validate_authorization() -> None:
    _require_anchors(RESEARCH_PATH, RESEARCH_ANCHORS, "resolved Phase 26 research approval")
    validate_contract()


def _parse_lade_timestamp(value: str, *, field: str, row_number: int) -> datetime:
    for pattern in ("%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            parsed = datetime.strptime(value, pattern)
            if pattern.startswith("%m"):
                return parsed.replace(year=2000)
            return parsed
        except ValueError:
            continue
    raise Phase26Error(
        f"LaDe row {row_number} has invalid {field} timestamp: {value!r}"
    )


def _delivery_duration_minutes(
    accept_value: str,
    delivery_value: str,
    *,
    row_number: int,
) -> float | int:
    accept_time = _parse_lade_timestamp(
        accept_value,
        field="accept_time",
        row_number=row_number,
    )
    delivery_time = _parse_lade_timestamp(
        delivery_value,
        field="delivery_time",
        row_number=row_number,
    )
    if delivery_time < accept_time:
        try:
            delivery_time = delivery_time.replace(year=accept_time.year + 1)
        except ValueError as error:
            raise Phase26Error(
                f"LaDe row {row_number} timestamp rollover is invalid"
            ) from error
    duration = (delivery_time - accept_time).total_seconds() / 60.0
    if not math.isfinite(duration) or duration < 0:
        raise Phase26Error(
            f"LaDe row {row_number} has non-finite or negative delivery duration: {duration}"
        )
    return int(duration) if duration.is_integer() else duration


def _validate_lade_candidate(candidate: dict[str, Any], *, row_number: int) -> None:
    if tuple(candidate) != LADE_PUBLISHED_FIELDS:
        unexpected = sorted(set(candidate) - set(LADE_PUBLISHED_FIELDS))
        missing = sorted(set(LADE_PUBLISHED_FIELDS) - set(candidate))
        raise Phase26Error(
            f"LaDe normalized row {row_number} violates privacy schema: "
            f"missing={missing}, unexpected={unexpected}"
        )
    lowered_fields = " ".join(candidate).lower()
    if any(token in lowered_fields for token in ("courier", "gps", "latitude", "longitude", "stop")):
        raise Phase26Error(
            f"LaDe normalized row {row_number} contains a denied privacy field"
        )
    duration = candidate["delivery_duration_minutes"]
    if not isinstance(duration, (int, float)) or not math.isfinite(duration):
        raise Phase26Error(
            f"LaDe normalized row {row_number} has invalid derived duration"
        )


def validate_lade_candidates(candidates: list[dict[str, Any]]) -> None:
    course_ids: set[str] = set()
    for row_number, candidate in enumerate(candidates, start=1):
        _validate_lade_candidate(candidate, row_number=row_number)
        course_row_id = candidate["course_row_id"]
        if course_row_id in course_ids:
            raise Phase26Error(f"Duplicate LaDe course ID: {course_row_id}")
        course_ids.add(course_row_id)


def validate_lade_source(
    path: Path,
    *,
    expected_rows: int = LADE_EXPECTED_ROWS,
) -> dict[str, Any]:
    try:
        with path.open(encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            if tuple(reader.fieldnames or ()) != LADE_SOURCE_FIELDS:
                raise Phase26Error(
                    "LaDe source field/schema drift: "
                    f"expected {list(LADE_SOURCE_FIELDS)}, got {reader.fieldnames}"
                )
            source_rows = list(reader)
    except OSError as error:
        raise Phase26Error(f"Cannot read LaDe source {path}: {error}") from error

    if len(source_rows) != expected_rows:
        raise Phase26Error(
            f"LaDe row count drift: expected {expected_rows}, got {len(source_rows)}"
        )

    normalized_rows: list[dict[str, Any]] = []
    durations: list[float | int] = []
    for source_row_number, row in enumerate(source_rows, start=1):
        for required_field in ("city", "aoi_type", "accept_time", "delivery_time", "ds"):
            if not row.get(required_field):
                raise Phase26Error(
                    f"LaDe row {source_row_number} has empty required field {required_field}"
                )
        duration = _delivery_duration_minutes(
            row["accept_time"],
            row["delivery_time"],
            row_number=source_row_number,
        )
        course_row_id = f"lade-jilin-{source_row_number:05d}"
        candidate = {
            "course_row_id": course_row_id,
            "source_row_number": source_row_number,
            "city": row["city"],
            "aoi_type": row["aoi_type"],
            "accept_time": row["accept_time"],
            "delivery_time": row["delivery_time"],
            "ds": row["ds"],
            "delivery_duration_minutes": duration,
        }
        normalized_rows.append(candidate)
        durations.append(duration)

    validate_lade_candidates(normalized_rows)
    facts = {
        "rowCount": len(normalized_rows),
        "sourceFields": list(LADE_SOURCE_FIELDS),
        "publishedFields": list(LADE_PUBLISHED_FIELDS),
        "removedFields": list(LADE_REMOVED_FIELDS),
        "durationMinimumMinutes": min(durations),
        "durationMaximumMinutes": max(durations),
        "durationMedianMinutes": median(durations),
        "zeroDurationRows": sum(duration == 0 for duration in durations),
        "over24HourRows": sum(duration > 24 * 60 for duration in durations),
    }
    return {"facts": facts, "normalizedRows": normalized_rows}


def _decode_zip_member(archive: zipfile.ZipFile, name: str) -> str:
    info = archive.getinfo(name)
    if info.file_size > 10 * 1024 * 1024:
        raise Phase26Error(f"SECOM archive member is unexpectedly large: {name}")
    try:
        return archive.read(name).decode("utf-8")
    except (OSError, UnicodeDecodeError) as error:
        raise Phase26Error(f"Cannot decode SECOM archive member {name}: {error}") from error


def validate_secom_archive(
    path: Path,
    *,
    expected_rows: int = SECOM_EXPECTED_ROWS,
    expected_label_counts: dict[int, int] | None = None,
) -> dict[str, int]:
    expected_counts = expected_label_counts or SECOM_EXPECTED_LABEL_COUNTS
    try:
        with zipfile.ZipFile(path) as archive:
            members = tuple(sorted(archive.namelist()))
            if members != tuple(sorted(SECOM_ARCHIVE_MEMBERS)):
                raise Phase26Error(
                    f"SECOM archive member drift: expected {list(SECOM_ARCHIVE_MEMBERS)}, "
                    f"got {list(members)}"
                )
            data_text = _decode_zip_member(archive, "secom.data")
            labels_text = _decode_zip_member(archive, "secom_labels.data")
            names_text = _decode_zip_member(archive, "secom.names")
    except (OSError, zipfile.BadZipFile, KeyError) as error:
        raise Phase26Error(f"Invalid SECOM archive {path}: {error}") from error

    if not re.search(r"Number of Attributes:\s*591\b", names_text):
        raise Phase26Error(
            "SECOM metadata must preserve the upstream declared 591-feature count"
        )

    data_lines = data_text.splitlines()
    label_lines = labels_text.splitlines()
    if len(data_lines) != expected_rows:
        raise Phase26Error(
            f"SECOM row count drift: expected {expected_rows}, got {len(data_lines)}"
        )
    if len(label_lines) != expected_rows:
        raise Phase26Error(
            f"SECOM label row count drift: expected {expected_rows}, got {len(label_lines)}"
        )

    missing_value_count = 0
    for row_number, line in enumerate(data_lines, start=1):
        values = line.split()
        if len(values) != 590:
            raise Phase26Error(
                f"SECOM row {row_number} observed {len(values)} values; exact raw width is 590"
            )
        for column_number, value in enumerate(values, start=1):
            if value == "NaN":
                missing_value_count += 1
                continue
            try:
                numeric = float(value)
            except ValueError as error:
                raise Phase26Error(
                    f"SECOM row {row_number} column {column_number} is not numeric or NaN"
                ) from error
            if not math.isfinite(numeric):
                raise Phase26Error(
                    f"SECOM row {row_number} column {column_number} is non-finite"
                )

    labels: list[int] = []
    for row_number, line in enumerate(label_lines, start=1):
        fields = line.split(maxsplit=1)
        if len(fields) != 2 or not fields[1].strip():
            raise Phase26Error(
                f"SECOM label row {row_number} must contain a label and timestamp"
            )
        try:
            raw_label = int(fields[0])
        except ValueError as error:
            raise Phase26Error(f"SECOM label row {row_number} is not an integer") from error
        if raw_label not in {-1, 1}:
            raise Phase26Error(
                f"SECOM label row {row_number} uses unsupported label {raw_label}; "
                "only -1 -> 0 and 1 -> 1 are allowed"
            )
        try:
            timestamp = fields[1].strip().strip('"')
            datetime.strptime(timestamp, "%d/%m/%Y %H:%M:%S")
        except ValueError as error:
            raise Phase26Error(
                f"SECOM label row {row_number} has invalid timestamp {fields[1]!r}"
            ) from error
        labels.append(raw_label)

    counts = Counter(labels)
    if dict(counts) != expected_counts:
        raise Phase26Error(
            f"SECOM label-count drift: expected {expected_counts}, got {dict(counts)}"
        )
    return {
        "rowCount": len(data_lines),
        "passCount": counts[-1],
        "failCount": counts[1],
        "declaredFeatureCount": 591,
        "observedFeatureCount": 590,
        "missingValueCount": missing_value_count,
    }


def _source_manifest_entry(source: SourceContract, path: Path) -> dict[str, Any]:
    return {
        "datasetId": source.dataset_id,
        "cacheFile": source.cache_name,
        "downloadUrl": source.download_url,
        "pageUrl": source.page_url,
        "retrievedAt": "2026-07-28",
        "revisionOrDoi": source.revision_or_doi,
        "license": source.license,
        "attribution": source.attribution,
        "sha256": sha256_file(path),
        "bytes": path.stat().st_size,
        "declaredFeatureCount": source.declared_feature_count,
        "observedFeatureCount": source.observed_feature_count,
    }


def validate_source_contents(cache: Path) -> dict[str, Any]:
    lade = validate_lade_source(cache / LADE.cache_name)
    secom = validate_secom_archive(cache / SECOM.cache_name)
    return {
        "lade": lade["facts"],
        "secom": secom,
    }


def source_cache_manifest(cache: Path, validation: dict[str, Any]) -> dict[str, Any]:
    return {
        "contractVersion": CONTRACT_VERSION,
        "transformVersion": TRANSFORM_VERSION,
        "approval": APPROVAL_DECISION,
        "sources": {
            source.dataset_id: _source_manifest_entry(source, cache / source.cache_name)
            for source in SOURCE_CONTRACTS
        },
        "validation": validation,
        "transform": {
            "ladeTargetDefinition": (
                "delivery_duration_minutes = delivery_time - accept_time "
                "with month/day rollover handling"
            ),
            "secomLabelMapping": {"-1": 0, "1": 1},
            "secomMissingValuePolicy": "Preserve raw NaN as missing; no imputation",
        },
        "publication": {
            "allowedFields": list(LADE_PUBLISHED_FIELDS),
            "removedFields": list(LADE_REMOVED_FIELDS),
        },
    }


def _validate_source_file(source: SourceContract, path: Path) -> None:
    if not path.is_file():
        raise Phase26Error(f"Missing cached {source.dataset_id} source: {path}")
    observed_hash = sha256_file(path)
    if observed_hash != source.sha256:
        raise Phase26Error(
            f"{source.dataset_id} SHA-256 drift: expected {source.sha256}, got {observed_hash}"
        )
    if source.expected_bytes is not None and path.stat().st_size != source.expected_bytes:
        raise Phase26Error(
            f"{source.dataset_id} byte-length drift: expected {source.expected_bytes}, "
            f"got {path.stat().st_size}"
        )


def verify_source_cache(cache: Path) -> dict[str, Any]:
    validate_authorization()
    for source in SOURCE_CONTRACTS:
        _validate_source_file(source, cache / source.cache_name)

    validation = validate_source_contents(cache)
    manifest_path = cache / SOURCE_CACHE_MANIFEST
    manifest = read_strict_json(manifest_path)
    expected = source_cache_manifest(cache, validation)
    if manifest != expected:
        raise Phase26Error("Source-cache manifest, license, attribution, or identity drifted")
    return manifest


def _download_exact_source(source: SourceContract, destination: Path) -> None:
    request = urllib.request.Request(
        source.download_url,
        headers={"User-Agent": "ML-Atlas-Phase-26-source-bootstrap/1.0"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response, destination.open("wb") as handle:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                handle.write(chunk)
    except OSError as error:
        raise Phase26Error(f"Failed to bootstrap exact source {source.download_url}: {error}") from error
    _validate_source_file(source, destination)


def _replace_directory_transaction(stage: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    backup = destination.parent / f".{destination.name}.backup-{uuid.uuid4().hex}"
    had_destination = destination.exists()
    try:
        if had_destination:
            destination.replace(backup)
        stage.replace(destination)
    except BaseException:
        if destination.exists():
            shutil.rmtree(destination)
        if backup.exists():
            backup.replace(destination)
        raise
    else:
        if backup.exists():
            shutil.rmtree(backup)


def bootstrap_sources(cache: Path) -> None:
    validate_authorization()
    cache_parent = cache.parent
    cache_parent.mkdir(parents=True, exist_ok=True)
    temporary = tempfile.mkdtemp(prefix=".phase-26-sources-", dir=cache_parent)
    stage = Path(temporary)
    try:
        for source in SOURCE_CONTRACTS:
            _download_exact_source(source, stage / source.cache_name)
        validation = validate_source_contents(stage)
        (stage / SOURCE_CACHE_MANIFEST).write_bytes(
            strict_json_bytes(source_cache_manifest(stage, validation))
        )
        for source in SOURCE_CONTRACTS:
            _validate_source_file(source, stage / source.cache_name)
        _replace_directory_transaction(stage, cache)
        verify_source_cache(cache)
    finally:
        if stage.exists():
            shutil.rmtree(stage)


def _iter_tree_files(root: Path) -> Iterator[tuple[str, Path]]:
    if not root.is_dir():
        raise Phase26Error(f"Expected directory does not exist: {root}")
    for path in sorted(root.rglob("*")):
        if path.is_symlink():
            raise Phase26Error(f"Symlinks are forbidden in checked artifact trees: {path}")
        if path.is_file():
            yield path.relative_to(root).as_posix(), path


def compare_committed_tree(regenerated_root: Path, published_root: Path) -> None:
    regenerated = dict(_iter_tree_files(regenerated_root))
    published = dict(_iter_tree_files(published_root))
    if regenerated.keys() != published.keys():
        missing = sorted(regenerated.keys() - published.keys())
        unexpected = sorted(published.keys() - regenerated.keys())
        raise Phase26Error(
            f"Committed inventory drift: missing={missing}, unexpected={unexpected}"
        )
    for relative_path, expected_path in regenerated.items():
        actual_path = published[relative_path]
        if expected_path.read_bytes() != actual_path.read_bytes():
            raise Phase26Error(f"Committed bytes differ from regenerated expectations: {relative_path}")


def generate_contract_candidate(cache: Path, staging_root: Path) -> None:
    verify_source_cache(cache)
    if staging_root.resolve().is_relative_to((REPO_ROOT / "public").resolve()):
        raise Phase26Error("Local generation may not write into public/")
    staging_root.mkdir(parents=True, exist_ok=True)
    target = staging_root / "source-contract.json"
    with tempfile.NamedTemporaryFile(dir=staging_root, delete=False) as handle:
        temporary = Path(handle.name)
        handle.write(strict_json_bytes(contract_snapshot()))
    temporary.replace(target)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group(required=True)
    modes.add_argument("--bootstrap-sources", action="store_true")
    modes.add_argument("--generate", action="store_true")
    modes.add_argument("--verify-source-cache", action="store_true")
    modes.add_argument("--check", action="store_true")
    parser.add_argument("--source-cache", type=Path, default=DEFAULT_SOURCE_CACHE)
    parser.add_argument("--staging-root", type=Path, default=DEFAULT_STAGING_ROOT)
    parser.add_argument("--regenerated-root", type=Path)
    parser.add_argument("--published-root", type=Path)
    parser.add_argument("--offline", action="store_true")
    args = parser.parse_args()

    validate_authorization()
    if args.bootstrap_sources:
        if args.offline:
            raise Phase26Error("--bootstrap-sources is the only online mode and rejects --offline")
        bootstrap_sources(args.source_cache)
        print(f"Bootstrapped and pinned two official sources in {args.source_cache}")
        return

    if not args.offline:
        raise Phase26Error("Local generation, source-cache verification, and --check require --offline")

    if args.verify_source_cache:
        verify_source_cache(args.source_cache)
        print("Phase 26 source cache matches exact identities, licenses, and hashes.")
        return

    if args.generate:
        generate_contract_candidate(args.source_cache, args.staging_root)
        print(f"Generated an offline contract candidate in {args.staging_root}")
        return

    if bool(args.regenerated_root) != bool(args.published_root):
        raise Phase26Error("--regenerated-root and --published-root must be provided together")
    if args.regenerated_root and args.published_root:
        compare_committed_tree(args.regenerated_root, args.published_root)
        print("Committed bytes match regenerated expectations; check was offline and read-only.")
        return

    verify_source_cache(args.source_cache)
    print("Source cache is current; full public artifact checking is added in Plan 26-05.")


if __name__ == "__main__":
    try:
        main()
    except (Phase26Error, ValueError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1) from error
