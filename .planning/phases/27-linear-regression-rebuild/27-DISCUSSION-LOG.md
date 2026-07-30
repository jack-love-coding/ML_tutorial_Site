# Phase 27: Linear Regression Rebuild - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-29
**Phase:** 27-linear-regression-rebuild
**Areas discussed:** 核心真实案例、八章课程重排、三种拟合方法、残差与模型局限

---

## 核心真实案例

### 数据集

| Option | Description | Selected |
|--------|-------------|----------|
| Bike Sharing | 预测每小时租车量，复用本地 UCI 数据并承接 Python Data Tools | ✓ |
| LaDe 配送数据 | 延续 Phase 26，但现有字段不利于解释多变量系数 | |
| California Housing | 复用现有视觉资产，但会与 Phase 28 房价项目重叠 | |

**User's choice:** Bike Sharing。
**Notes:** 仓库检查后，推荐由 LaDe 调整为 Bike Sharing；用户接受调整。

### 目标形式

| Option | Description | Selected |
|--------|-------------|----------|
| 原始 `cnt` | 保留租车数量单位和直观残差 | |
| `log1p(cnt)` | 改善误差形态，但增加反变换解释 | |
| 原始 `cnt` 主线 + `log1p(cnt)` 附加对照 | 保留直观主线并展示目标变换影响 | ✓ |

**User's choice:** 主线使用原始 `cnt`，附加 `log1p(cnt)`。
**Notes:** 附加内容不复制完整主线。

### 特征范围

| Option | Description | Selected |
|--------|-------------|----------|
| 小型固定特征组 | `temp`、`hum`、`windspeed`、`workingday`、`hr`，以 `atemp` 做共线性对照 | ✓ |
| 只使用天气变量 | 容易解释，但诊断覆盖不足 | |
| 完整特征工程 | 更接近项目，但会越过 Phase 27 边界 | |

**User's choice:** 小型固定特征组。
**Notes:** 明确排除满足 `casual + registered = cnt` 的泄漏列。

### 数据划分

| Option | Description | Selected |
|--------|-------------|----------|
| 时间顺序 80/20 | 前 80% 训练、后 20% 测试，避免未来记录混入训练 | ✓ |
| 按日期分组随机划分 | 避免同日跨集合，但增加分组解释 | |
| 固定种子普通随机划分 | 简单但相邻小时可能造成乐观结果 | |

**User's choice:** 时间顺序 80/20。
**Notes:** 三种拟合方法和全部发布结果共用一份冻结划分。

---

## 八章课程重排

### 重构力度

| Option | Description | Selected |
|--------|-------------|----------|
| 保留八个 ID，重写顺序与职责 | 保护旧链接并形成新的连续主线 | ✓ |
| 保持现有标题和顺序 | 只补数据与 Notebook，主线仍然分散 | |
| 精简为六章 | 页面更短，但会削弱旧章节与深链接 | |

**User's choice:** 保留八个章节 ID，重写顺序与职责。
**Notes:** 旧 URL 与进度身份必须保持兼容。

### 叙事方式

| Option | Description | Selected |
|--------|-------------|----------|
| 真实案例驱动 | 真实问题推动公式、代码和输出出现 | ✓ |
| 数学推导驱动 | 数学整齐，但进入真实问题较晚 | |
| 工具使用驱动 | 先用 sklearn，再补原理 | ✓（组合） |

**User's choice:** “在案例驱动的每一步用 sklearn 展示是如何获得结果的”。
**Notes:** sklearn 是贯穿案例的实践对照，不是独立 API 章节。

### 高级内容位置

| Option | Description | Selected |
|--------|-------------|----------|
| 八章全部属于连续主线 | 多项式、过拟合、正则化继续使用同一案例 | ✓ |
| 六章核心 + 两个附录 | 主线紧凑，但诊断可能被跳过 | |
| 四章入门 + 四章高级 | 层级清楚但重新割裂 | |

**User's choice:** 八章全部属于连续主线。
**Notes:** 后三章缩短为同一 Bike Sharing 案例的诊断扩展。

### 从单条记录到矩阵

| Option | Description | Selected |
|--------|-------------|----------|
| 每一步“单条 → 批量” | 每个概念立即从一个样本扩展到矩阵 | ✓ |
| 先完整讲标量、后切矩阵 | 初期容易，但切换跨度大 | |
| 一开始直接使用矩阵 | 简洁但不适合弱基础学习者 | |

**User's choice:** 每一步“单条记录 → 一批记录”。
**Notes:** 预测、残差和梯度都遵循相同节奏。

---

## 三种拟合方法

### 方法分工

| Option | Description | Selected |
|--------|-------------|----------|
| 明确分工 | NumPy 解释训练，正规方程作基准，sklearn 作实践与核对 | ✓ |
| 平均讲解 | 每种方法完整展开，重复较多 | |
| sklearn 为主 | 实用但不足以完成梯度教学 | |

**User's choice:** 明确分工。
**Notes:** 三种方法必须共享同一目标、数据和预处理。

### 特征缩放

| Option | Description | Selected |
|--------|-------------|----------|
| 三种方法共用训练集缩放 | 连续特征统一标准化，`workingday` 保持二值 | ✓ |
| 仅梯度下降标准化 | 系数不能直接逐项比较 | |
| 全部使用原始特征 | 梯度下降受尺度差异影响 | |

**User's choice:** 三种方法共用训练集拟合的缩放参数。
**Notes:** 同时展示模型空间系数和原始单位解释。

### 正则化范围

| Option | Description | Selected |
|--------|-------------|----------|
| 主比较为无正则化 OLS | 三种方法同目标；Ridge/Lasso 后置 | ✓ |
| 主比较直接用 Ridge | 跳过普通最小二乘基线 | |
| OLS/Ridge/Lasso 混表 | 容易混淆实现差异与目标差异 | |

**User's choice:** 主比较严格使用无正则化 OLS。
**Notes:** Ridge/Lasso 必须标注为改变了目标函数。

### 对齐结果深度

| Option | Description | Selected |
|--------|-------------|----------|
| 页面摘要 + Notebook 完整核验 | 页面保留关键值，Notebook 保存轨迹、容差和断言 | ✓ |
| 页面只比较 MSE | 无法证明系数和预测一致 | |
| 页面展示完整轨迹 | 透明但挤压教学内容 | |

**User's choice:** 页面摘要 + Notebook 完整核验。
**Notes:** 超出容差的候选结果不得发布。

---

## 残差与模型局限

### 局限范围

| Option | Description | Selected |
|--------|-------------|----------|
| 非线性、异方差、共线性全部讲 | 每类使用一个真实、明确的现象 | ✓ |
| 重点讲非线性与异方差 | 共线性仅简述 | |
| 重点讲共线性与正则化 | 残差教学较弱 | |

**User's choice:** 三类全部进入主线。
**Notes:** 分别使用小时弯曲模式、随需求扩大的残差散布、`temp`/`atemp` 系数变化。

### 优化与模型的诊断顺序

| Option | Description | Selected |
|--------|-------------|----------|
| 先分步诊断 | 先确认收敛与方法对齐，再解释残差模式 | ✓ |
| 只用综合面板 | 集中但缺少阅读顺序 | ✓（后置） |
| 只看测试残差 | 无法排除未收敛 | |

**User's choice:** “先 1 后 2”。
**Notes:** 先逐步教学，再用综合面板复盘；综合面板不替代分步讲解。

### 系数稳定性

| Option | Description | Selected |
|--------|-------------|----------|
| 受控模型对照 | 只加入 `atemp`，比较 OLS 与 Ridge 的系数和预测 | ✓ |
| 相关矩阵和 VIF | 指标完整但难与预测连接 | |
| 特征扰动滑块 | 直观但偏离冻结真实数据 | |

**User's choice:** 受控模型对照。
**Notes:** 划分、缩放、目标和其他特征保持不变。

### 残差展示粒度

| Option | Description | Selected |
|--------|-------------|----------|
| 指标 → 图形 → 真实记录 | 三级展开完整但默认内容较多 | ✓（折叠记录） |
| 指标与图形 | 默认页面保持清楚 | ✓（默认） |
| 完整测试集表格 | 信息过量 | |

**User's choice:** “1+2”。
**Notes:** 默认显示指标和图形，三至五条代表记录折叠展开，完整输出留在 Notebook；`log1p(cnt)` 只做精简对照。

---

## the agent's Discretion

- 将八个已批准的教学职责映射到保留的章节 ID，并确定最终双语标题。
- 从锁定运行结果中选择代表性记录、绘图范围、学习率、停止规则和数值容差。
- 在现有交互、Notebook 图和静态/Manim 素材之间选择最小充分的视觉方案。

## Deferred Ideas

- Phase 28：完整的防泄漏表格回归项目、受控改进和房价项目。
- 后续课程：更广泛的类别编码、周期特征工程和模型选择。
- 后端评估、云端进度、checkpoint 持久化和大型练习库。
