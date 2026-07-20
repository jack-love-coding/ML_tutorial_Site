# 数值方法路线第一批契约：Ames Housing 线性系统

## 目标与边界

第一批把三个现有 Math Lab 章节串成同一条机器学习案例线：

1. `least-squares-fitting`：从 Ames Housing 特征矩阵建立最小二乘问题。
2. `lu-decomposition`：把同一个正规方程写成线性系统，比较手写 LUP 与 SciPy 求解。
3. `condition-numbers`：沿同一个设计矩阵解释尺度、近共线性、条件数、残差与参数误差。

三个稳定 module ID、直接 URL、现有实验和已有学习进度全部保留。新内容通过 adapter 和共享 companion 接入，不复制模块，也不迁移正文到新的 schema。

本批不重新教授数据清洗。仓库直接发布一个已经完成列选择、类型转换与完整行筛选的数值快照；Notebook 只验证契约并进入数值计算。

## 教学交付

每章目标时长为 60–75 分钟，并包含：

- 完整推导，但不要求定理证明。
- 一个贯穿三章的真实 Ames Housing 案例。
- 一个 NumPy 最小实现和一个成熟库实现。
- 固定代码输出，页面结果必须能由下载 Notebook 复现。
- 一个现有交互实验的案例化增强。
- 一个 60–90 秒中文屏幕标签的 Manim 动画、双语 transcript 与静态 poster。
- 少量 checkpoint；网站以教学为主，不承担教师验收。

共享 Notebook 的三个稳定输出 ID 为：

- `ames-least-squares-summary`
- `ames-lu-summary`
- `ames-conditioning-summary`

## 数据契约

本批使用 CRAN `AmesHousing` 0.0.4 源码包内的 `ames_raw.rda`，发布完整数值行的不可变本地快照：

- 上游记录数：2,930。
- 排除记录：`Order=1342`（地下室面积缺失）、`Order=2237`（车库车辆数与面积缺失）和 `Order=2181`（建造年 2008 晚于售出年 2007）。
- 发布记录数：2,927。
- 不插值、不随机抽样、不拆分训练/验证集。
- `ames_order` 只用于稳定行顺序，不进入模型。
- 目标：`sale_price_usd`。
- 默认模型特征：`overall_quality`、`living_area_sqft`、`basement_sqft`、`garage_area_sqft`、`house_age_at_sale`。
- `house_age_at_sale = year_sold - year_built` 在 Notebook 中确定性派生。

浏览器和仓库内 Notebook 只读取本地 CSV，不访问远程网络。网页分别下载 Notebook 与 CSV 时保留规范文件名；把两者放在同一目录即可重新执行，也可通过 `ML_ATLAS_AMES_DATA_PATH` 指定本地 CSV。维护者生成器校验上游 RDA 的固定 SHA-256，任何来源、schema、行数或 hash 漂移都必须人工审查并升级契约版本。

## 数值约定

- 房价在模型中换算为千美元，避免仅因显示单位造成过大的中间量。
- 五个默认特征使用全快照均值与总体标准差标准化，截距列不标准化。
- 最小二乘库基准为 `numpy.linalg.lstsq`；正规方程只用于连接后续 LU，不宣传为默认生产求解方式。
- 手写 LUP 必须执行部分主元选择；成熟库基准为 `scipy.linalg.lu_factor` 与 `lu_solve`。
- 条件数以 2-范数定义，手算路径由奇异值比值给出，库基准为 `numpy.linalg.cond`。
- 近共线性场景是显式诊断场景，不污染真实数据快照。
- 所有公开 JSON 数值必须有限并显式舍入；不得依赖平台末位浮动。

## 路线与进度兼容

复用 `numerical-deepening-path`，按完整九章路线展示：

1. `least-squares-fitting`
2. `lu-decomposition`
3. `condition-numbers`
4. `sparse-matrices`
5. `pca`
6. `finite-difference-methods`
7. `nonlinear-equations`
8. `optimization`
9. `training-diagnostics`

不添加新的 localStorage 数据源，不删除旧路由，不更改 module ID。路线继续使用既有全局完成记录，避免清空历史进度。

## 验收条件

- 数据 manifest 锁定来源版本、许可范围、RDA hash、CSV hash、schema、行数和排除记录。
- Notebook 从干净 kernel 自上而下执行，无网络访问、无隐藏状态、无错误输出和本机绝对路径。
- 仅把网页下载的 Notebook 与 CSV 放进同一临时目录时，Notebook 仍能完整执行并复现三个固定输出。
- 三个页面显示同一个 Notebook 和 CSV 下载入口，并显示各自章节的固定输出。
- LUP 解与最小二乘正规方程系数一致；分解与求解残差在容差内。
- 标准化后的设计矩阵条件数小于原始设计矩阵；正规方程条件数近似为设计矩阵条件数的平方。
- 每章恰好关联一个交互实验和一个 Manim 资产；视频失效或 reduced motion 时仍可读取 poster 与 transcript。
- `npm test`、`npm run build` 与 `npm run build:pages` 通过。
