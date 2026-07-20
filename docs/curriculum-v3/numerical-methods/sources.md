# Ames Housing 数据来源与快照政策

## 来源与许可范围

课程数据源自 Dean De Cock 的 Ames Housing 数据，并通过 CRAN `AmesHousing` 0.0.4 源码包取得。

- 原始教学论文：Dean De Cock, *Ames, Iowa: Alternative to the Boston Housing Data as an End of Semester Regression Project*。
- 论文 DOI：`10.1080/10691898.2011.11889627`
- CRAN 包页面：https://cran.r-project.org/package=AmesHousing
- 固定源码包：https://cran.r-project.org/src/contrib/AmesHousing_0.0.4.tar.gz
- 包版本：`0.0.4`
- CRAN 包声明许可：`GPL-2`
- 获取日期：`2026-07-20`
- 源码包 SHA-256：`13e2d24a129904f9edc92692f24330fea256a765eab7baf893b9695ca7031920`
- 包内 `data/ames_raw.rda` SHA-256：`ca0a3c2e6d35f9bef9ebcb1c5926154853f9ff68843d83eb53ab57255367247c`

许可说明仅陈述 CRAN 0.0.4 源码分发包的 `GPL-2` 声明，不把它扩大解释为原论文或其他 Ames 镜像的统一许可。课程提交的是由该固定包派生的数值 CSV，并在相邻 manifest 中保留完整转换记录。

## 本地快照

不可变快照位于：

`public/datasets/numerical-methods/ames-housing-numeric.csv`

相邻 `manifest.json` 锁定列顺序、排除记录、行数、字节数和 SHA-256；`data-dictionary.json` 提供中英文字段释义。转换只做：

1. 选择已批准的数值列。
2. 将上游 object 数值严格转换为整数。
3. 删除两个缺少选定值的记录，以及一条建造年晚于售出年的时间异常记录。
4. 改成适合教学的一致 snake_case 列名。
5. 按 `ames_order` 升序发布。

没有填补缺失值、按价格裁剪异常值、特征缩放、随机抽样或训练/验证拆分。缩放与诊断场景属于 Notebook 的数值教学步骤，不属于数据清洗。

## 运行时政策 / Runtime policy

Vue 页面与 Notebook 运行时只读取本地 CSV，不从 CRAN、OpenML、Kaggle 或其他镜像下载数据。仓库内执行使用已提交快照；网页下载后的 Notebook 优先读取同目录下规范命名的 `ames-housing-numeric.csv`，也接受 `ML_ATLAS_AMES_DATA_PATH`。这样可以避免镜像差异、网络状态和上游更新改变教学输出。

The Vue lesson and Notebook read only a local CSV at runtime. In the repository they use the committed snapshot; after download, the Notebook first looks for the canonically named sibling CSV and also accepts `ML_ATLAS_AMES_DATA_PATH`. They never fetch CRAN, OpenML, Kaggle, or another mirror.

## 维护者再生成

维护者先取得并解压固定源码包，再运行：

```sh
PYTHONPATH=/path/to/pyreadr \
python3 scripts/numerical-methods/build-ames-snapshot.py \
  --source /path/to/AmesHousing/data/ames_raw.rda
```

生成器要求 `pyreadr==0.5.3`，并在写入前校验固定 RDA hash、上游列、排除记录和全部数值不变量。任何差异都应停止生成并进入人工来源审查。

Notebook 与固定输出使用锁定环境生成；只读检查还会在临时目录中仅放入下载版 Notebook 与 CSV，完成一次独立重执行：

```sh
uv run --with-requirements public/notebooks/numerical-methods/requirements.txt -- \
  python scripts/numerical-methods/generate-ames-notebook.py --check
```
