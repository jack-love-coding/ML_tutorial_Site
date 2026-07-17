#!/usr/bin/env python3
"""Build the Chinese Python Data Tools notebook from its Markdown master."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import nbformat


REPO_ROOT = Path(__file__).resolve().parents[2]
MASTER_DIR = REPO_ROOT / "docs/curriculum-v3/python-data-tools/chinese-master"
DATA_MANIFEST_PATH = REPO_ROOT / "public/datasets/python-data-tools/manifest.json"
CONTRACT_VERSION = "python-data-tools-v1"
CHAPTER_FILES = (
    "01-notebook-workflow.md",
    "02-numpy-foundations.md",
    "03-pandas-structures.md",
    "04-pandas-analysis.md",
    "05-matplotlib-visualization.md",
    "06-seaborn-statistics.md",
    "07-plotly-exploration.md",
    "08-analysis-report.md",
)
CELL_PATTERN = re.compile(
    r"<!-- cell: (?P<source_id>ch\d{2}-[a-z0-9-]+) role: "
    r"(?P<role>[a-z]+)(?: output: (?P<output_id>[a-z0-9-]+))? -->\n"
    r"```python\n(?P<code>[\s\S]*?)```"
)
VALID_ROLES = {
    "question", "setup", "data", "compute", "visualize", "interpret", "limit", "handoff",
}
OUTPUT_CELL_IDS = {
    "dataset-shape-schema": "output-dataset-shape-schema",
    "hourly-demand-profile": "output-hourly-demand-profile",
    "workingday-comparison": "output-workingday-comparison",
    "season-weather-distribution": "output-season-weather-distribution",
    "rider-composition": "output-rider-composition",
    "pearson-correlation-matrix": "output-pearson-correlation-matrix",
    "plotly-hourly-explorer": "output-plotly-hourly-explorer",
    "final-analysis-evidence": "output-final-analysis-evidence",
}


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _setup_suffix() -> str:
    return r'''

# 阶段三可复现输出脚手架：只负责版本、路径、字体与序列化，不重复分析逻辑。
import json
import os
import sys
from importlib import metadata as importlib_metadata
from matplotlib import font_manager
import plotly.io as pio

EXPECTED_VERSIONS = {
    "numpy": "2.4.6",
    "pandas": "3.0.3",
    "matplotlib": "3.10.9",
    "seaborn": "0.13.2",
    "plotly": "6.9.0",
    "nbformat": "5.10.4",
    "jupyterlab": "4.6.1",
    "nbclient": "0.11.0",
    "ipykernel": "7.3.0",
}
observed_versions = {name: importlib_metadata.version(name) for name in EXPECTED_VERSIONS}
if observed_versions != EXPECTED_VERSIONS:
    raise RuntimeError(f"环境版本不匹配：{observed_versions}")
if sys.version_info[:3] != (3, 12, 13):
    raise RuntimeError(f"Python 必须为 3.12.13，当前为 {sys.version.split()[0]}")

OUTPUT_DIR = Path(os.environ.get("ML_ATLAS_OUTPUT_DIR", "outputs"))
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
FONT_PATH = Path("../../fonts/python-data-tools/NotoSansSC-Variable.ttf")
if not FONT_PATH.is_file():
    raise FileNotFoundError(f"找不到课程中文字体：{FONT_PATH}")
font_manager.fontManager.addfont(FONT_PATH)
plt.rcParams.update({
    "font.family": "Noto Sans SC",
    "font.weight": 400,
    "axes.unicode_minus": False,
    "figure.dpi": 100,
})
pio.renderers.default = "json"

DATA_MANIFEST_PATH = Path("../../datasets/python-data-tools/manifest.json")
DATA_MANIFEST = json.loads(DATA_MANIFEST_PATH.read_text(encoding="utf-8"))
DATA_SHA256 = DATA_MANIFEST["file"]["sha256"]

def _json_default(value):
    if isinstance(value, np.integer):
        return int(value)
    if isinstance(value, np.floating):
        return float(value)
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    raise TypeError(f"不能序列化 {type(value).__name__}")

def write_json(filename, payload):
    destination = OUTPUT_DIR / filename
    destination.write_text(
        json.dumps(
            payload,
            ensure_ascii=False,
            sort_keys=True,
            indent=2,
            allow_nan=False,
            default=_json_default,
        ) + "\n",
        encoding="utf-8",
    )
    return destination

{name: observed_versions[name] for name in ("numpy", "pandas", "matplotlib", "seaborn", "plotly")}
'''.strip("\n")


def _publication_suffix(output_id: str) -> str:
    suffixes = {
        "dataset-shape-schema": r'''

dataset_shape_schema_output = {
    "contractVersion": "python-data-tools-v1",
    "datasetSha256": DATA_SHA256,
    **dataset_shape_schema,
}
_ = write_json("dataset-shape-schema.json", dataset_shape_schema_output)
''',
        "workingday-comparison": r'''

workingday_records = json.loads(
    workingday_hourly.rename(columns={
        "workingday_label": "workingdayLabel",
        "observations": "observations",
        "mean_rentals": "meanRentals",
        "median_rentals": "medianRentals",
        "total_rentals": "totalRentals",
    }).to_json(orient="records")
)
for record in workingday_records:
    for key in ("meanRentals", "medianRentals"):
        record[key] = round(float(record[key]), 6)
workingday_output = {
    "contractVersion": "python-data-tools-v1",
    "datasetSha256": DATA_SHA256,
    "aggregation": "workingday × hr; hourly cnt size, mean, median, and sum",
    "records": workingday_records,
}
_ = write_json("workingday-comparison.json", workingday_output)
''',
        "hourly-demand-profile": r'''

fig.savefig(
    OUTPUT_DIR / "hourly-demand-profile.png",
    dpi=160,
    facecolor="white",
    metadata={"Software": "ML Atlas python-data-tools-v1"},
)
''',
        "rider-composition": r'''

fig.savefig(
    OUTPUT_DIR / "rider-composition.png",
    dpi=160,
    facecolor="white",
    metadata={"Software": "ML Atlas python-data-tools-v1"},
)
''',
        "season-weather-distribution": r'''

fig.savefig(
    OUTPUT_DIR / "season-weather-distribution.png",
    dpi=160,
    facecolor="white",
    metadata={"Software": "ML Atlas python-data-tools-v1"},
)
''',
        "pearson-correlation-matrix": r'''

correlation_output = {
    "contractVersion": "python-data-tools-v1",
    "datasetSha256": DATA_SHA256,
    "method": "pearson",
    "columns": correlation_columns,
    "matrix": [
        [round(float(value), 8) for value in correlation_matrix.loc[row, correlation_columns]]
        for row in correlation_columns
    ],
    "nonMissing": {
        column: int(analysis_rides[column].notna().sum())
        for column in correlation_columns
    },
    "guardrail": {
        "zh-CN": "相关不代表因果；相关系数描述共同变化，不能证明一个变量导致另一个变量。",
        "en": "Correlation does not imply causation; association cannot prove that one variable causes another.",
    },
}
_ = write_json("pearson-correlation-matrix.json", correlation_output)
''',
        "plotly-hourly-explorer": r'''

plotly_output = json.loads(interactive_fig.to_json(remove_uids=True))
plotly_output["defaultFilterState"] = default_filter_state
_ = write_json("plotly-hourly-explorer.plotly.json", plotly_output)
''',
        "final-analysis-evidence": r'''

_ = write_json("final-analysis-evidence.json", final_analysis_evidence)
''',
    }
    return suffixes[output_id].strip("\n")


def _parse_chapter(path: Path, chapter_id: str, seen_ids: set[str]) -> list:
    source = path.read_text(encoding="utf-8")
    cells = []
    cursor = 0
    for match in CELL_PATTERN.finditer(source):
        markdown = source[cursor:match.start()].strip()
        if markdown:
            cells.append(nbformat.v4.new_markdown_cell(markdown))

        source_id = match.group("source_id")
        role = match.group("role")
        output_id = match.group("output_id")
        if source_id in seen_ids:
            raise ValueError(f"Duplicate source cell id {source_id} in {path}")
        if role not in VALID_ROLES:
            raise ValueError(f"Unknown cell role {role} in {path}: {source_id}")
        if output_id and output_id not in OUTPUT_CELL_IDS:
            raise ValueError(f"Unknown output id {output_id} in {path}: {source_id}")
        seen_ids.add(source_id)

        code = match.group("code").rstrip()
        if source_id == "ch01-imports":
            code = f"{code}\n\n{_setup_suffix()}"
        if output_id:
            code = f"{code}\n\n{_publication_suffix(output_id)}"
        cell_id = OUTPUT_CELL_IDS[output_id] if output_id else source_id
        metadata = {
            "mlAtlas": {
                "chapterId": chapter_id,
                "sourceCellId": source_id,
                "role": role,
            }
        }
        if output_id:
            metadata["mlAtlas"]["outputId"] = output_id
        cells.append(nbformat.v4.new_code_cell(code, metadata=metadata, id=cell_id))
        cursor = match.end()

    remainder = source[cursor:].strip()
    if remainder:
        cells.append(nbformat.v4.new_markdown_cell(remainder))
    unmatched = re.findall(r"```python", source)
    if len(unmatched) != sum(cell.cell_type == "code" for cell in cells):
        raise ValueError(f"Every Python block needs one valid marker in {path}")
    return cells


def build_notebook():
    manifest = json.loads(DATA_MANIFEST_PATH.read_text(encoding="utf-8"))
    master_paths = [MASTER_DIR / "README.md", *(MASTER_DIR / name for name in CHAPTER_FILES)]
    notebook = nbformat.v4.new_notebook()
    notebook.cells.append(
        nbformat.v4.new_markdown_cell((MASTER_DIR / "README.md").read_text(encoding="utf-8"))
    )
    seen_ids: set[str] = set()
    for filename in CHAPTER_FILES:
        chapter_id = filename.removesuffix(".md").split("-", 1)[1]
        notebook.cells.extend(_parse_chapter(MASTER_DIR / filename, chapter_id, seen_ids))

    if len(seen_ids) != 48:
        raise ValueError(f"Expected 48 source code cells, observed {len(seen_ids)}")
    markdown_index = 0
    for cell in notebook.cells:
        if cell.cell_type != "markdown":
            continue
        digest = hashlib.sha256(cell.source.encode("utf-8")).hexdigest()[:12]
        cell.id = f"md-{markdown_index:03d}-{digest}"
        markdown_index += 1
    notebook.metadata = {
        "kernelspec": {
            "display_name": "Python 3 (ML Atlas)",
            "language": "python",
            "name": "python3",
        },
        "language_info": {"name": "python", "version": "3.12.13"},
        "mlAtlas": {
            "contractVersion": CONTRACT_VERSION,
            "dataset": {
                "publicPath": manifest["file"]["publicPath"],
                "sha256": manifest["file"]["sha256"],
            },
            "masters": [
                {
                    "path": str(path.relative_to(REPO_ROOT)),
                    "sha256": sha256_file(path),
                }
                for path in master_paths
            ],
            "outputManifest": "outputs/manifest.json",
            "generator": "scripts/python-data-tools/generate-authoritative-outputs.py",
        },
    }
    return notebook


if __name__ == "__main__":
    print(nbformat.writes(build_notebook(), version=4))
