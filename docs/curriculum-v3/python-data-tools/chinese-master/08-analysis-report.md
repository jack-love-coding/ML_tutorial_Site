# 第八章：共享单车需求分析报告

章节 ID：`analysis-report`

## 核心问题

哪些证据可以支持对需求规律的解释？

## 本章目标

你将把前七章的输出组织成一份可复现报告：每条结论明确观察到什么、引用哪份证据、怎样解释，以及哪些结论不能从当前数据推出。

## 前置连接

我们已经建立可复现环境，理解数组与表格结构，生成分组口径，设计静态与交互图，并限定描述统计和相关解释。报告章不再发明新指标，而是审计这些证据是否共同回答课程问题。

## 概念与直觉

数据报告不是图表合集。一个可审查结论需要四个部分：

1. **观察**：在明确范围内看到了什么模式。
2. **证据**：引用哪个输出、字段、单位和聚合口径。
3. **解释**：该模式怎样帮助回答问题。
4. **限制**：哪些混杂、样本或方法边界阻止更强结论。

五个证据维度分别是时间、工作日、季节、天气和用户构成。它们可能共同变化，不能把其中一个维度孤立写成唯一原因。

## 逐步代码

### 1. 建立权威证据登记表

<!-- cell: ch08-evidence-register role: compute -->
```python
evidence_register = pd.DataFrame([
    {
        "dimension": "数据结构",
        "output_id": "dataset-shape-schema",
        "metric": "schema 与字段角色",
        "aggregation": "完整快照",
    },
    {
        "dimension": "时间",
        "output_id": "hourly-demand-profile",
        "metric": "mean_rentals",
        "aggregation": "按 hr 的平均每小时需求",
    },
    {
        "dimension": "工作日",
        "output_id": "workingday-comparison",
        "metric": "observations / mean / median",
        "aggregation": "按 workingday 与 hr",
    },
    {
        "dimension": "季节与天气",
        "output_id": "season-weather-distribution",
        "metric": "分布与组样本数",
        "aggregation": "按 season / weathersit",
    },
    {
        "dimension": "用户构成",
        "output_id": "rider-composition",
        "metric": "casual / registered",
        "aggregation": "完整快照累计租车次数",
    },
    {
        "dimension": "变量关系",
        "output_id": "pearson-correlation-matrix",
        "metric": "Pearson r 与有效样本",
        "aggregation": "显式数值字段",
    },
    {
        "dimension": "交互核对",
        "output_id": "plotly-hourly-explorer",
        "metric": "mean / median / observations",
        "aggregation": "固定默认筛选状态",
    },
])
evidence_register
```

登记表迫使报告说明每个数字从哪里来。精确值在阶段三由对应输出读取，不在 Markdown 中手抄。

### 2. 生成最终证据清单

<!-- cell: ch08-final-evidence role: handoff output: final-analysis-evidence -->
```python
final_analysis_evidence = {
    "contract_version": "python-data-tools-v1",
    "question": "时间、工作日、季节、天气和用户构成怎样共同解释需求变化？",
    "source_outputs": evidence_register["output_id"].tolist(),
    "required_dimensions": ["时间", "工作日", "季节", "天气", "用户构成"],
    "claim_template": ["观察", "证据", "解释", "限制"],
    "excludes": ["预测", "因果识别", "显著性判断", "数据清洗"],
    "handoff_route": "/data-lab",
}
final_analysis_evidence
```

阶段三会把报告实际引用的指标、值、单位、聚合口径、数据 hash 和环境版本加入这一 JSON；网页与 Notebook 从同一文件读取，避免三处手抄。

## 输出与阅读

`final-analysis-evidence` 是报告证据索引，不是新的分析来源。它必须引用前面七个输出，并在生成时补全真实数值。阅读报告时，可以从任一结论反向找到输出、生成代码、数据快照与环境版本。

## 证据解释

以下是阶段三填入真实值后的写作骨架，不预判具体方向或峰值：

### 结论一：时间结构

- 观察：指出 `hourly-demand-profile` 中可重复的日内结构。
- 证据：写明 `hr`、`mean_rentals`、单位和涉及的具体小时，引用输出 ID。
- 解释：说明该结构如何回答“需求何时变化”。
- 限制：按小时聚合会混合不同年份、季节、天气和日期类型。

### 结论二：工作日状态

- 观察：对齐同一小时比较工作日与周末/节假日。
- 证据：引用 `workingday-comparison` 的均值、中位数和样本数。
- 解释：描述日期类型与日内模式的关联。
- 限制：这不是随机实验，不能写成“工作日导致需求变化”。

### 结论三：季节与天气

- 观察：比较条件分布的中心、范围和组大小。
- 证据：引用 `season-weather-distribution`，同时报告样本数。
- 解释：说明季节/天气条件与需求分布共同变化。
- 限制：少数组、时间季节性和未控制变量限制结论，相关不代表因果。

### 结论四：用户构成

- 观察：比较临时用户与注册用户的累计构成，并结合逐小时视图。
- 证据：引用 `rider-composition` 与 `plotly-hourly-explorer` 的固定默认状态。
- 解释：说明总需求由哪两类计数构成以及模式是否一致。
- 限制：累计量受观察期和记录数影响，不能直接代表个人行为或用户人数。

### 结论五：数值变量关系

- 观察：描述散点与 `pearson-correlation-matrix` 中的线性关联。
- 证据：写明字段、Pearson 系数、有效样本和关系图形。
- 解释：把相关作为共同变化线索，而不是机制证明。
- 限制：Pearson 只描述线性关联，对离群值和样本选择敏感；相关不代表因果。

## 限制或误区

报告不得使用“证明”“导致”“唯一原因”“预测准确”等越界语言。不能从聚合数据推断单个用户行为，也不能把归一化字段直接写成原始单位。若图表和数值表口径不同，应先修复生成链，而不是挑选更符合预期的一份。

本课程还没有处理缺失、重复、异常类型、无效类别或离群值策略。当前快照通过阶段一契约验证；当分析对象换成原始脏数据时，应进入 `/data-lab` 记录清洗规则、影响行数和处理前后差异。

## 最终报告自检

- [ ] 五个证据维度都有输出引用，而不是只放图。
- [ ] 每个精确值都有单位、分组键、聚合口径与输出 ID。
- [ ] 每条结论都按“观察—证据—解释—限制”组织。
- [ ] 工作日、季节、天气和相关关系都没有被写成因果证明。
- [ ] 交互图的默认筛选状态可见，关键结论有静态文字。
- [ ] 数据 hash、环境契约和 clean-kernel 执行信息可追溯。
- [ ] 报告不包含预测、显著性检验、p 值或置信区间教学。
- [ ] 数据清洗问题明确交接到 `/data-lab`。

本自检不计分、不提交、不写入学习进度，也不作为课程门槛；它帮助作者在发布前发现证据链断点。

## 下一步

完成本课程后，若要处理缺失、重复、异常类型和离群值，请进入 `/data-lab`。阶段三会先把本母版转换为可从干净内核运行的 Notebook 与真实输出；在那些输出生成前，本章不填入任何推测数值。
