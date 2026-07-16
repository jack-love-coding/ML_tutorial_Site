# Chapter 1: Notebook Environment and Reproducible Execution

Chapter ID: `notebook-workflow`

## Core question

How can an analysis rerun in order from a clean kernel?

## Learning goals

You will build an execution chain that supports “Restart Kernel and Run All”: establish imports, confirm versions, locate local data, load the table, and check the entry point. Anyone with the same repository and locked environment should be able to run from the first cell to the last without guessing which cells you previously clicked.

## Where this chapter begins

This course assumes that you already know how to call functions and libraries. Rather than reteaching Python syntax, this chapter places those foundations inside a reproducible data-analysis workflow.

## Concept and intuition

A Notebook looks like a document, but its variables live in a continuously running kernel. The order of cells on the page is not necessarily the order in which the kernel executed them. If you run cell ten and then return to cell two, the screen may temporarily show results that a clean kernel cannot reproduce.

Reliable analysis follows an explicit dependency chain: the question determines the required data, calculations turn that data into runtime results, those results support an interpretation, and the analysis then states its limits. Every variable must be created before its first use; the data must come from a fixed snapshot in the repository; and versions, paths, and inputs must remain inspectable.

## Step-by-step code

### 1. Fix the imports and display versions

<!-- cell: ch01-imports role: setup -->
```python
from pathlib import Path

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import plotly
import seaborn as sns

{
    "numpy": np.__version__,
    "pandas": pd.__version__,
    "matplotlib": matplotlib.__version__,
    "seaborn": sns.__version__,
    "plotly": plotly.__version__,
}
```

Version information is not decoration. Chart defaults and API behavior can change between releases; the versions locked in the environment description allow Stage 3 to regenerate the same runtime results.

### 2. Locate the data with a relative path

<!-- cell: ch01-data-path role: setup -->
```python
DATA_PATH = Path("../../datasets/python-data-tools/bike-sharing-hour.csv")
DATA_PATH
```

The relative path starts from the Notebook directory. Do not replace it with a machine-specific path such as `/Users/...`, and do not fetch the UCI source at runtime. The first choice works on only one computer; the second lets network and upstream changes alter the input.

### 3. Confirm that the file exists before reading it

<!-- cell: ch01-path-check role: data -->
```python
if not DATA_PATH.is_file():
    raise FileNotFoundError(
        f"找不到课程数据：{DATA_PATH}。请从仓库内的 notebooks 目录运行。"
    )
```

Failing early is more useful than encountering an ambiguous downstream error. The message identifies both the missing object and the direction for fixing the problem.

### 4. Create the single `rides` entry point

<!-- cell: ch01-load-rides role: data -->
```python
rides = pd.read_csv(DATA_PATH)
rides.shape, rides.columns.tolist()
```

For now, treat `rides` as the entry point to the raw table. Chapter 3 will parse the date and examine column types systematically. Later chapters will not download the data again or read a different copy.

### 5. Record a minimal reproducibility check

<!-- cell: ch01-repro-check role: compute -->
```python
repro_check = {
    "rows": len(rides),
    "columns": rides.shape[1],
    "first_record_id": int(rides.loc[0, "instant"]),
    "last_record_id": int(rides.loc[rides.index[-1], "instant"]),
}
repro_check
```

This is not a complete data validator; the Stage 1 scripts already check the hash, schema, and invariants. It gives learners a quick way to confirm that this Notebook loaded the expected shape and record range.

### 6. Make hidden state visible as a risk

<!-- cell: ch01-hidden-state-demo role: limit -->
```python
# 如果在创建 rides 之前先执行 `rides.head()`，干净内核会抛出 NameError。
# 正确做法不是“多点几次”，而是 Restart Kernel and Run All，修复依赖顺序。
hidden_state_rule = "变量必须在首次使用前由上游单元格创建"
hidden_state_rule
```

## Runtime result and how to read it

This chapter does not bind an authoritative runtime result. After running it, you should see the locked library versions, the local relative path, the table shape, and an ordered list of column names. Chapter 3 will produce the precise schema that belongs in the report as `dataset-shape-schema`.

## Analysis findings

- Observation: a clean kernel knows only the definitions that have actually run from top to bottom.
- Runtime result: the version dictionary, existence check, and `repro_check` are all calculated from the current input.
- Interpretation: explicit environment, path, and ordering choices reduce accidental “works only on the author's computer” state.
- Limitation: a Notebook that runs from start to finish does not guarantee that its conclusions are correct; field meanings, aggregation rules, and chart design still require scrutiny.

## Keep in mind

A common mistake is treating any result already visible beside a cell as “reproducible.” It may have come from an old kernel or even from code that has since changed. There is only one dependable test: restart the kernel, run the document once in order, and confirm that it produces the same kinds of results.

Another mistake is rereading or copying the data in every chapter. That creates multiple sources. The whole course maintains one entry point through `DATA_PATH` and `rides`.

## Reading check

After closing and restarting the kernel, if the third cell says the file cannot be found, first inspect the Notebook location and relative path instead of changing to an absolute path. If a cell before step six refers to a variable that has not yet been created, repair the dependency order instead of relying on an old kernel.

## Next step

The next chapter extracts the one-dimensional `demand` array from `rides["cnt"]`. You will use NumPy shape, indexing, and vectorized statistics to understand the hourly total-rental column.
