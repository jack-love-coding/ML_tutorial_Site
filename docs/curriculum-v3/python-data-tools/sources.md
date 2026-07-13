# Bike Sharing 数据来源与快照政策

## 来源与许可

课程使用 UCI Machine Learning Repository 的 **Bike Sharing Dataset**，上游文件为 `hour.csv`。

- 官方数据集页面：https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset
- DOI：`10.24432/C5W894`
- 许可：[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- 固定下载地址：https://archive.ics.uci.edu/static/public/275/bike+sharing+dataset.zip

仓库中的不可变本地快照位于 `public/datasets/python-data-tools/bike-sharing-hour.csv`；其来源、列顺序、行数、字节数与 SHA-256 保存在 `public/datasets/python-data-tools/manifest.json`，字段释义保存在相邻的 `data-dictionary.json`。

The local immutable snapshot lives at `public/datasets/python-data-tools/bike-sharing-hour.csv`. Its provenance, schema, row count, byte count, and SHA-256 are recorded in the adjacent manifest, with field semantics in `data-dictionary.json`.

## 运行时政策 / Runtime policy

浏览器课程和 notebook 在运行时绝不从远程地址抓取数据，只读取已验证的本地快照。这样可避免上游变化或网络状态改变教学结果，并使所有示例可复现。

The browser lesson and notebook never fetch remote data at runtime; they read only the verified local snapshot. This keeps results reproducible and isolates learners from upstream or network drift.

## 维护者更新步骤

只有维护者需要联网更新快照。在仓库根目录运行：

```sh
node scripts/python-data-tools/fetch-bike-sharing.mjs
node scripts/python-data-tools/verify-bike-sharing.mjs
```

抓取工具只访问上述 UCI 固定下载地址，在 OS 临时目录中解压，并在写入仓库前验证 UTF-8、固定 17 列 schema、数据行和计数不变量。每次维护者抓取都会在候选 manifest 中记录运行时真实的 UTC 检索日期，而不是复用旧快照的日期。

The fetch tool records the actual UTC retrieval date in the candidate manifest. Every hash, schema, row-count, and invariant drift requires manual review before commit. Every date, hash, schema, or provenance change also requires a contract-version decision before commit.

提交更新前必须人工审查日期、hash、schema、row count、provenance 与 invariant 的任何漂移，并决定是否更新 contract version；变化不能仅因脚本成功而自动接受。当前 V1 manifest 的 `2026-07-14` 是已审核快照的确定性来源记录。未来抓取产生不同日期时，V1 验证器会将其视为 provenance drift，维护者必须在提交前明确审查并决定合同版本。

本快照没有人为注入损坏、缺失值或清洗步骤。清洗教学属于 Data Lab，应在其独立实验数据和逻辑中完成，不得污染这份可核验的官方快照。
