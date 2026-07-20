#!/usr/bin/env python3
"""Materialize the reviewed Ames Housing numeric snapshot from CRAN package data."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import pandas as pd

try:
    import pyreadr
except ImportError as error:  # pragma: no cover - maintainer-only dependency guard
    raise SystemExit(
        "pyreadr==0.5.3 is required to read ames_raw.rda; install it in a temporary maintainer environment."
    ) from error


REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = REPO_ROOT / "public/datasets/numerical-methods"
CSV_PATH = OUTPUT_DIR / "ames-housing-numeric.csv"
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"
DICTIONARY_PATH = OUTPUT_DIR / "data-dictionary.json"
CONTRACT_VERSION = "numerical-methods-ames-v1"
EXPECTED_RDA_SHA256 = "ca0a3c2e6d35f9bef9ebcb1c5926154853f9ff68843d83eb53ab57255367247c"
SOURCE_ARCHIVE_SHA256 = "13e2d24a129904f9edc92692f24330fea256a765eab7baf893b9695ca7031920"
RETRIEVED_AT = "2026-07-20"

SOURCE_COLUMNS = {
    "Order": "ames_order",
    "Overall Qual": "overall_quality",
    "Year Built": "year_built",
    "Yr Sold": "year_sold",
    "1st Flr SF": "first_floor_sqft",
    "2nd Flr SF": "second_floor_sqft",
    "Gr Liv Area": "living_area_sqft",
    "Total Bsmt SF": "basement_sqft",
    "Garage Cars": "garage_cars",
    "Garage Area": "garage_area_sqft",
    "SalePrice": "sale_price_usd",
}
EXCLUDED_ROWS = {
    1342: ["basement_sqft"],
    2237: ["garage_area_sqft", "garage_cars"],
}
TEMPORAL_ANOMALY_ROWS = {
    2181: {"year_built": 2008, "year_sold": 2007},
}

DICTIONARY = {
    "contractVersion": CONTRACT_VERSION,
    "fields": [
        {"name": "ames_order", "unit": "row id", "zh-CN": "上游 Ames 数据的稳定记录序号，仅用于排序。", "en": "Stable row order from the upstream Ames data; used only for ordering."},
        {"name": "overall_quality", "unit": "1-10 score", "zh-CN": "整体材料与装修质量评分。", "en": "Overall material and finish quality score."},
        {"name": "year_built", "unit": "year", "zh-CN": "原始建造年份。", "en": "Original construction year."},
        {"name": "year_sold", "unit": "year", "zh-CN": "房屋售出年份。", "en": "Year of sale."},
        {"name": "first_floor_sqft", "unit": "square feet", "zh-CN": "一层面积。", "en": "First-floor area."},
        {"name": "second_floor_sqft", "unit": "square feet", "zh-CN": "二层面积。", "en": "Second-floor area."},
        {"name": "living_area_sqft", "unit": "square feet", "zh-CN": "地面以上居住面积。", "en": "Above-ground living area."},
        {"name": "basement_sqft", "unit": "square feet", "zh-CN": "地下室总面积。", "en": "Total basement area."},
        {"name": "garage_cars", "unit": "cars", "zh-CN": "车库容量。", "en": "Garage capacity measured in cars."},
        {"name": "garage_area_sqft", "unit": "square feet", "zh-CN": "车库面积。", "en": "Garage area."},
        {"name": "sale_price_usd", "unit": "US dollars", "zh-CN": "房屋成交价格，作为回归目标。", "en": "Sale price used as the regression target."},
    ],
}


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="Path to AmesHousing/data/ames_raw.rda")
    return parser.parse_args()


def load_source(path: Path) -> pd.DataFrame:
    if not path.is_file():
        raise FileNotFoundError(path)
    observed_hash = sha256_file(path)
    if observed_hash != EXPECTED_RDA_SHA256:
        raise ValueError(f"Unreviewed ames_raw.rda SHA-256: {observed_hash}")

    objects = pyreadr.read_r(str(path))
    if set(objects) != {"ames_raw"}:
        raise ValueError(f"Expected only ames_raw in RDA, found {sorted(objects)}")
    frame = objects["ames_raw"]
    missing_columns = set(SOURCE_COLUMNS).difference(frame.columns)
    if missing_columns:
        raise ValueError(f"Missing reviewed Ames columns: {sorted(missing_columns)}")
    if len(frame) != 2930:
        raise ValueError(f"Expected 2930 upstream rows, found {len(frame)}")
    return frame


def materialize(frame: pd.DataFrame) -> pd.DataFrame:
    selected = frame[list(SOURCE_COLUMNS)].rename(columns=SOURCE_COLUMNS).copy()

    missing_by_order = {
        int(row.ames_order): sorted(row.index[row.isna()].tolist())
        for _, row in selected[selected.isna().any(axis=1)].iterrows()
    }
    if missing_by_order != EXCLUDED_ROWS:
        raise ValueError(f"Unexpected missing-value pattern: {missing_by_order}")

    selected = selected.dropna().sort_values("ames_order", kind="stable").reset_index(drop=True)
    for column in selected.columns:
        numeric = pd.to_numeric(selected[column], errors="raise")
        if not (numeric % 1 == 0).all():
            raise ValueError(f"Expected integer-valued column: {column}")
        selected[column] = numeric.astype("int64")

    observed_temporal_anomalies = {
        int(row.ames_order): {
            "year_built": int(row.year_built),
            "year_sold": int(row.year_sold),
        }
        for _, row in selected[selected["year_sold"] < selected["year_built"]].iterrows()
    }
    if observed_temporal_anomalies != TEMPORAL_ANOMALY_ROWS:
        raise ValueError(f"Unexpected temporal anomaly pattern: {observed_temporal_anomalies}")
    selected = selected[~selected["ames_order"].isin(TEMPORAL_ANOMALY_ROWS)].reset_index(drop=True)

    if len(selected) != 2927:
        raise ValueError(f"Expected 2927 reviewed rows, found {len(selected)}")
    if selected.isna().any().any():
        raise ValueError("Published snapshot must not contain missing values")
    if selected["ames_order"].duplicated().any():
        raise ValueError("ames_order must remain unique")
    if not selected["ames_order"].is_monotonic_increasing:
        raise ValueError("ames_order must be sorted")
    if (selected["year_sold"] < selected["year_built"]).any():
        raise ValueError("year_sold must not precede year_built")
    if (selected["sale_price_usd"] <= 0).any():
        raise ValueError("sale_price_usd must be positive")
    return selected


def write_artifacts(frame: pd.DataFrame) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    frame.to_csv(CSV_PATH, index=False, lineterminator="\n")
    csv_hash = sha256_file(CSV_PATH)

    manifest = {
        "contractVersion": CONTRACT_VERSION,
        "dataset": {
            "name": "Ames Housing",
            "originalAuthor": "Dean De Cock",
            "articleDoi": "10.1080/10691898.2011.11889627",
            "distribution": {
                "name": "AmesHousing",
                "version": "0.0.4",
                "repository": "CRAN",
                "page": "https://cran.r-project.org/package=AmesHousing",
                "download": "https://cran.r-project.org/src/contrib/AmesHousing_0.0.4.tar.gz",
                "license": "GPL-2",
                "licenseScope": "CRAN package distribution",
                "retrievedAt": RETRIEVED_AT,
                "sourceArchiveSha256": SOURCE_ARCHIVE_SHA256,
                "rawDataSha256": EXPECTED_RDA_SHA256,
            },
        },
        "transformation": {
            "sourceObject": "ames_raw",
            "sourceRows": 2930,
            "operations": [
                "select-reviewed-numeric-columns",
                "strict-integer-conversion",
                "drop-only-reviewed-incomplete-rows",
                "drop-reviewed-temporal-anomaly-row",
                "rename-columns-to-snake-case",
                "sort-by-ames-order",
            ],
            "excludedRows": [
                {"amesOrder": order, "missingFields": fields}
                for order, fields in EXCLUDED_ROWS.items()
            ] + [
                {"amesOrder": order, "invalidValues": values}
                for order, values in TEMPORAL_ANOMALY_ROWS.items()
            ],
            "imputation": False,
            "randomSampling": False,
            "outlierRemoval": False,
        },
        "modelContract": {
            "rowId": "ames_order",
            "target": "sale_price_usd",
            "defaultFeatures": [
                "overall_quality",
                "living_area_sqft",
                "basement_sqft",
                "garage_area_sqft",
                "house_age_at_sale",
            ],
            "derivedFeatures": {
                "house_age_at_sale": "year_sold - year_built",
            },
        },
        "file": {
            "publicPath": "/datasets/numerical-methods/ames-housing-numeric.csv",
            "encoding": "utf-8",
            "delimiter": "comma",
            "sha256": csv_hash,
            "bytes": CSV_PATH.stat().st_size,
            "rows": len(frame),
            "columns": len(frame.columns),
            "columnOrder": frame.columns.tolist(),
        },
    }

    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )
    DICTIONARY_PATH.write_text(
        json.dumps(DICTIONARY, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    write_artifacts(materialize(load_source(args.source)))
    print(f"Wrote {CSV_PATH.relative_to(REPO_ROOT)}")
    print(f"Wrote {MANIFEST_PATH.relative_to(REPO_ROOT)}")
    print(f"Wrote {DICTIONARY_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
