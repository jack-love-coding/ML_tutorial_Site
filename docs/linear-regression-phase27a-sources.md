# Phase 27A 线性回归课程资料与许可记录

访问日期：2026-08-01。

本轮八章正文由项目重新编写。外部资料仅用于核对概念范围、教学顺序、API 行为和残差诊断原则；没有翻译或整段改写外部教材。课程正文不插入引用标记，公开资料统一显示在第八章末尾。

## 数据集

### UCI Bike Sharing Dataset

- 页面：https://archive.ics.uci.edu/dataset/275/bike%2Bsharing%2Bdataset
- 数据论文：Fanaee-T, Hadi, and Gama, Joao. “Event labeling combining ensemble detectors and background knowledge.” Progress in Artificial Intelligence (2014).
- 许可：CC BY 4.0。
- 本项目使用范围：使用 hourly 数据的本地快照进行时间切分、统计分析、模型训练、Notebook 执行和 Matplotlib 图表生成；页面标明数据集名称与许可。
- 本地文件：`public/datasets/python-data-tools/bike-sharing-hour.csv`。
- 锁定 SHA-256：`e03de4ee4ef4dc376ac6e04bf829673c6269e8eba5c60fa121640fa2f829504f`。

## 教学与技术资料

### Dive into Deep Learning — Linear Regression

- 页面：https://d2l.ai/chapter_linear-regression/linear-regression.html
- 项目许可：https://github.com/d2l-ai/d2l-en
- 许可说明：书籍文本采用 CC BY-SA 4.0；示例代码按仓库说明适用修改版 MIT 许可。
- 本项目使用范围：只参考从模型、损失到优化的概念组织；课程正文和代码示例重新编写，没有复制书籍段落。

### Stanford CS229 — Linear Regression Notes

- 页面：https://cs229.stanford.edu/summer2019/cs229-notes1.pdf
- 本项目使用范围：核对最小二乘、梯度下降和正规方程的数学定义；没有复制讲义段落或插图。

### scikit-learn — Linear Models

- 页面：https://scikit-learn.org/stable/modules/linear_model.html
- 本项目使用范围：核对 `LinearRegression`、`Ridge` 和 `Lasso` 的目标与参数行为；页面代码针对 Bike Sharing 流程重新编写。

### scikit-learn — Common pitfalls and recommended practices

- 页面：https://scikit-learn.org/stable/common_pitfalls.html
- 本项目使用范围：核对预处理一致性、训练集拟合 transformer 和数据泄漏的通用规范；泄漏示例结合本数据集重新设计。

### scikit-learn — Common pitfalls in the interpretation of coefficients

- 页面：https://scikit-learn.org/stable/auto_examples/inspection/plot_linear_model_coefficient_interpretation.html
- 本项目使用范围：核对标准化、共线性和条件系数解释边界；页面图表由本项目 Notebook 使用 Bike Sharing 数据生成。

### NIST/SEMATECH e-Handbook — Residual Analysis

- 页面：https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd44.htm
- 本项目使用范围：核对残差随机性、结构性模式和残差图的诊断原则；没有复制 NIST 图表或段落。

## 本地生成资产

- 生成入口：`scripts/linear-regression/build-phase-27a-assets.py`。
- 纯计算模块：`scripts/linear-regression/phase27a_analysis.py`。
- 发布目录：`public/linear-regression/phase-27a/`。
- 图表均由 Matplotlib 基于本地真实数据生成，不使用 AI 图片模拟数据图。
- 每张图的 Notebook cell ID、双语标题、alt、图注、阅读提示、文字版结果和文件哈希记录在 `linear-regression-course-summary.json` 与 `output-manifest.json` 中。
- 原 Phase 27 九文件 Notebook 下载包保持原路径与字节不变；Phase 27A 作为补充资产包发布。
