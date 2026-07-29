#!/usr/bin/env python3
"""Materialize the reviewed UCI SMS Spam Collection as a stable UTF-8 CSV."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile


REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = REPO_ROOT / "public/datasets/numerical-methods"
CSV_PATH = OUTPUT_DIR / "sms-spam.csv"
MANIFEST_PATH = OUTPUT_DIR / "sms-spam-manifest.json"
DICTIONARY_PATH = OUTPUT_DIR / "sms-spam-data-dictionary.json"

CONTRACT_VERSION = "numerical-methods-sms-v1"
SOURCE_ARCHIVE_SHA256 = "1587ea43e58e82b14ff1f5425c88e17f8496bfcdb67a583dbff9eefaf9963ce3"
SOURCE_TEXT_SHA256 = "7d039a24a6083ed9ef0f806ebad56bbb976e3aeb8de05669173bfdc4996c239d"
SOURCE_FILENAME = "SMSSpamCollection"
RETRIEVED_AT = "2026-07-20"


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        type=Path,
        required=True,
        help="Path to the reviewed UCI sms+spam+collection.zip archive",
    )
    return parser.parse_args()


def load_rows(source: Path) -> list[tuple[int, str, str]]:
    if not source.is_file():
        raise FileNotFoundError(source)
    observed_archive_hash = sha256_file(source)
    if observed_archive_hash != SOURCE_ARCHIVE_SHA256:
        raise ValueError(f"Unreviewed SMS archive SHA-256: {observed_archive_hash}")

    with ZipFile(source) as archive:
        names = set(archive.namelist())
        if names != {SOURCE_FILENAME, "readme"}:
            raise ValueError(f"Unexpected archive entries: {sorted(names)}")
        raw = archive.read(SOURCE_FILENAME)

    observed_text_hash = sha256_bytes(raw)
    if observed_text_hash != SOURCE_TEXT_SHA256:
        raise ValueError(f"Unreviewed SMS text SHA-256: {observed_text_hash}")

    rows: list[tuple[int, str, str]] = []
    for sms_id, line in enumerate(raw.decode("utf-8").splitlines(), start=1):
        label, separator, message = line.partition("\t")
        if separator != "\t" or label not in {"ham", "spam"} or not message:
            raise ValueError(f"Invalid source row {sms_id}")
        rows.append((sms_id, label, message))

    if len(rows) != 5574:
        raise ValueError(f"Expected 5574 messages, found {len(rows)}")
    label_counts = {label: sum(row[1] == label for row in rows) for label in ("ham", "spam")}
    if label_counts != {"ham": 4827, "spam": 747}:
        raise ValueError(f"Unexpected label counts: {label_counts}")
    return rows


def write_artifacts(rows: list[tuple[int, str, str]]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with CSV_PATH.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(["sms_id", "label", "message"])
        writer.writerows(rows)

    csv_hash = sha256_file(CSV_PATH)
    duplicate_messages = len(rows) - len({message for _, _, message in rows})
    manifest = {
        "contractVersion": CONTRACT_VERSION,
        "dataset": {
            "name": "SMS Spam Collection",
            "creators": ["Tiago Almeida", "José María Gómez Hidalgo"],
            "repository": "UCI Machine Learning Repository",
            "datasetId": 228,
            "doi": "10.24432/C5CC84",
            "page": "https://archive.ics.uci.edu/dataset/228/sms+spam+collection",
            "download": "https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip",
            "license": "CC BY 4.0",
            "retrievedAt": RETRIEVED_AT,
            "sourceArchiveSha256": SOURCE_ARCHIVE_SHA256,
            "sourceTextSha256": SOURCE_TEXT_SHA256,
        },
        "transformation": {
            "sourceFile": SOURCE_FILENAME,
            "operations": [
                "strict-utf8-decode",
                "split-leading-label-at-first-tab",
                "add-one-based-stable-row-id",
                "write-rfc4180-compatible-csv",
            ],
            "textNormalization": False,
            "deduplication": False,
            "randomSampling": False,
            "duplicateMessageCount": duplicate_messages,
        },
        "representationContract": {
            "documentId": "sms_id",
            "label": "label",
            "text": "message",
            "tokenPattern": "[a-z0-9']+",
            "minimumDocumentFrequency": 5,
            "idf": "log((1 + n_documents) / (1 + document_frequency)) + 1",
            "rowNormalization": "l2",
        },
        "file": {
            "publicPath": "/datasets/numerical-methods/sms-spam.csv",
            "encoding": "utf-8",
            "delimiter": "comma",
            "sha256": csv_hash,
            "bytes": CSV_PATH.stat().st_size,
            "rows": len(rows),
            "columns": 3,
            "columnOrder": ["sms_id", "label", "message"],
            "labelCounts": {"ham": 4827, "spam": 747},
        },
    }
    dictionary = {
        "contractVersion": CONTRACT_VERSION,
        "fields": [
            {
                "name": "sms_id",
                "unit": "row id",
                "zh-CN": "按 UCI 原始文件顺序生成的一基稳定消息编号。",
                "en": "One-based stable message id following the UCI source order.",
            },
            {
                "name": "label",
                "unit": "category",
                "zh-CN": "UCI 提供的 ham 或 spam 标签；本章只用来解释语料组成，不训练分类器。",
                "en": "The UCI ham or spam label; used only to describe the corpus, not to train a classifier in this lesson.",
            },
            {
                "name": "message",
                "unit": "UTF-8 text",
                "zh-CN": "未经改写、清洗或去重的原始短信文本。",
                "en": "Original SMS text without rewriting, cleaning, or deduplication.",
            },
        ],
    }

    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )
    DICTIONARY_PATH.write_text(
        json.dumps(dictionary, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    rows = load_rows(args.source)
    write_artifacts(rows)
    print(f"Wrote {CSV_PATH.relative_to(REPO_ROOT)}")
    print(f"Wrote {MANIFEST_PATH.relative_to(REPO_ROOT)}")
    print(f"Wrote {DICTIONARY_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
