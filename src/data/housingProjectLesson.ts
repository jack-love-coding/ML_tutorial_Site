import type { LocalizedCopy } from '../types/ml'
import type {
  HousingProjectChapterId,
  HousingProjectChapterLesson,
  HousingProjectFigureDefinition,
  HousingProjectFigureId,
  HousingProjectLessonBlock,
  HousingProjectSceneId,
} from '../types/housingProjectLesson'

const loc = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

export const housingProjectFigures: Record<HousingProjectFigureId, HousingProjectFigureDefinition> = {
  'train-target-distribution': {
    id: 'train-target-distribution', chapterId: 'eda-first-pass',
    publicPath: '/tabular-regression/figures/train-target-distribution.png', sourceCellId: 'train-only-eda',
    title: loc('训练集目标分布', 'Training-target distribution'),
    alt: loc('训练集房价中位数的直方图，在 5.0 附近有明显堆积', 'Histogram of training target values with a visible pile-up near 5.0'),
    caption: loc('只使用训练集绘制；右端尖峰来自数据集的目标上限。', 'Built from training rows only; the spike at the right comes from the dataset target cap.'),
    readingHint: loc('先找中心、偏斜与边界，再决定应该同时报告哪些误差指标。', 'Find the center, skew, and boundaries before choosing complementary error metrics.'),
    fallback: loc('训练目标为长尾分布，接近 5.0（约 50 万美元）的样本出现堆积。', 'The training target is right-skewed and piles up near 5.0 (about USD 500,000).'),
  },
  'train-income-target': {
    id: 'train-income-target', chapterId: 'eda-first-pass',
    publicPath: '/tabular-regression/figures/train-income-target.png', sourceCellId: 'train-only-eda',
    title: loc('收入与目标的训练集关系', 'Training relation between income and target'),
    alt: loc('收入中位数与房价中位数的散点图和分箱均值', 'Scatter and binned means of median income versus median house value'),
    caption: loc('收入与房价总体同向，但离散和上限截断说明单特征直线远远不够。', 'Income and value generally rise together, but spread and capping show that one feature is insufficient.'),
    readingHint: loc('同时看趋势和同一收入水平下的纵向离散。', 'Read both the trend and the vertical spread at a fixed income level.'),
    fallback: loc('MedInc 与目标呈明显正相关，但相同收入下仍有很大的房价值差异。', 'MedInc is positively associated with the target, yet values vary widely at similar income levels.'),
  },
  'train-geography': {
    id: 'train-geography', chapterId: 'eda-first-pass',
    publicPath: '/tabular-regression/figures/train-geography.png', sourceCellId: 'train-only-eda',
    title: loc('训练集地理结构', 'Geographic structure in the training set'),
    alt: loc('按目标值着色的加州经纬度散点图', 'California longitude-latitude scatter colored by target value'),
    caption: loc('沿海与城市区域形成非线性空间结构，普通线性经纬度项很难完整表达。', 'Coastal and urban patterns are nonlinear, which raw linear coordinates cannot fully express.'),
    readingHint: loc('关注区域团簇，而不是把颜色变化误读为因果关系。', 'Look for regional clusters without interpreting the color pattern as causal.'),
    fallback: loc('高价样本在旧金山湾区与洛杉矶沿海附近更密集，空间关系并非一条直线。', 'High-value rows cluster near the Bay Area and coastal Los Angeles; the spatial relation is not linear.'),
  },
  'scaler-boundary': {
    id: 'scaler-boundary', chapterId: 'cleaning-splits',
    publicPath: '/tabular-regression/figures/scaler-boundary.png', sourceCellId: 'train-only-preprocessing',
    title: loc('标准化参数的边界', 'Boundary for scaling statistics'),
    alt: loc('训练集均值与错误的全量均值对比图', 'Comparison of train-only means with incorrectly fitted full-data means'),
    caption: loc('差值可能很小，但规则必须明确：验证集与测试集不能参与拟合预处理。', 'The numerical gap may be small, but the rule is strict: validation and test rows never fit preprocessing.'),
    readingHint: loc('不要用“这次差得不多”替代实验边界。', 'Do not replace a sound evaluation boundary with “the difference is small this time.”'),
    fallback: loc('每个特征都有训练集统计量和全量统计量；正式流水线只使用训练集统计量。', 'Every feature has train-only and full-data statistics; the valid pipeline uses train-only values.'),
  },
  'validation-ridge-path': {
    id: 'validation-ridge-path', chapterId: 'evaluation',
    publicPath: '/tabular-regression/figures/validation-ridge-path.png', sourceCellId: 'ridge-validation-selection',
    title: loc('Ridge 验证路径', 'Ridge validation path'),
    alt: loc('不同 alpha 下验证集 RMSE 与线性回归基线的对照', 'Validation RMSE across Ridge alpha values compared with the linear baseline'),
    caption: loc('本次 Ridge 没有达到 1% 改善门槛，因此保留更简单的 LinearRegression。', 'Ridge does not meet the 1% improvement threshold, so the simpler LinearRegression is retained.'),
    readingHint: loc('看相对改善是否越过预先声明的门槛，而不是只找最小小数。', 'Check whether relative improvement clears the declared threshold, not merely which decimal is smallest.'),
    fallback: loc('alpha 从 0.01 到 100 时，验证 RMSE 均未优于 0.731391 的线性基线。', 'Across alpha 0.01 to 100, validation RMSE does not improve on the 0.731391 linear baseline.'),
  },
  'final-predicted-actual': {
    id: 'final-predicted-actual', chapterId: 'review-next-iteration',
    publicPath: '/tabular-regression/figures/final-predicted-actual.png', sourceCellId: 'final-test-review',
    title: loc('最终预测值与真实值', 'Final predictions versus actual values'),
    alt: loc('最终测试集预测值与真实值散点图', 'Scatter of final test predictions against actual values'),
    caption: loc('理想点应落在对角线上；高价端的系统偏离暴露了线性模型边界。', 'Ideal points lie on the diagonal; systematic deviation at the high end exposes the linear model boundary.'),
    readingHint: loc('先找整体贴合，再找在哪些真实值区间持续偏离。', 'Inspect overall alignment, then identify target ranges with persistent deviation.'),
    fallback: loc('预测总体随真实值上升，但在高价上限附近普遍偏低。', 'Predictions generally rise with actual values but tend to underpredict near the target cap.'),
  },
  'final-residuals': {
    id: 'final-residuals', chapterId: 'review-next-iteration',
    publicPath: '/tabular-regression/figures/final-residuals.png', sourceCellId: 'final-test-review',
    title: loc('最终测试残差', 'Final test residuals'),
    alt: loc('最终测试集残差与预测值的关系图', 'Final test residuals plotted against predictions'),
    caption: loc('残差并非完全随机，高价截断和地理非线性仍留下结构。', 'Residuals are not fully random; target capping and nonlinear geography leave structure.'),
    readingHint: loc('观察零线两侧是否均匀，以及误差带是否随预测值改变。', 'Check symmetry around zero and whether error spread changes with prediction.'),
    fallback: loc('残差带在不同预测区间宽度不同，并存在若干绝对误差超过 3 的失败样本。', 'Residual spread changes across prediction ranges, with several named failures above 3 in absolute error.'),
  },
}

const problem = (id: string, title: LocalizedCopy, body: LocalizedCopy): HousingProjectLessonBlock => ({
  id, kind: 'explanation', title, body, eyebrow: loc('本章问题', 'Chapter question'), tone: 'question',
})
const explanation = (id: string, title: LocalizedCopy, body: LocalizedCopy, tone: 'default' | 'misconception' | 'leakage' = 'default'): HousingProjectLessonBlock => ({
  id, kind: 'explanation', title, body, eyebrow: tone === 'misconception' ? loc('常见误区', 'Common misconception') : loc('数据观察', 'Data observation'), tone,
})
const conclusion = (id: string, body: LocalizedCopy): HousingProjectLessonBlock => ({
  id, kind: 'explanation', title: loc('本章结论', 'Chapter conclusion'), body, eyebrow: loc('项目结论', 'Project conclusion'), tone: 'conclusion',
})
const figure = (id: string, figureId: HousingProjectFigureId): HousingProjectLessonBlock => ({
  id, kind: 'figure', figureId, title: housingProjectFigures[figureId].title,
})
const lab = (id: string, sceneId: HousingProjectSceneId, title: LocalizedCopy, prompt: LocalizedCopy): HousingProjectLessonBlock => ({
  id, kind: 'observation-lab', sceneId, title, prompt,
})

const lessons: Record<HousingProjectChapterId, HousingProjectChapterLesson> = {
  'csv-to-frame': {
    id: 'csv-to-frame', blocks: [
      problem('contract-question', loc('CSV 读进来以后，模型到底在预测什么？', 'After loading the CSV, what exactly will the model predict?'), loc(
        '先不要训练。我们要把一行数据代表什么、目标单位是什么、哪些列可以作为特征说清楚。California Housing 的一行代表一个 **1990 年人口普查街区组**，不是一栋独立住宅；`MedHouseVal` 的单位是 **10 万美元**。',
        'Do not train yet. First define what one row represents, the target unit, and which columns are usable features. A California Housing row is a **1990 census block group**, not an individual home; `MedHouseVal` is measured in **USD 100,000 units**.',
      )),
      explanation('contract-observation', loc('先建立数据契约', 'Start with a data contract'), loc(
        '数据共有 20,640 行、8 个数值特征和 1 个目标。`row_id` 只用于追踪样本，`split` 只用于固定实验边界，两者都不能进入模型。经纬度是特征，但其系数只表达条件关联。',
        'The package has 20,640 rows, eight numeric features, and one target. `row_id` traces samples and `split` freezes evaluation boundaries; neither enters the model. Coordinates are features, but their coefficients express conditional association only.',
      )),
      { id: 'contract-code', kind: 'code', language: 'python', title: loc('读取本地数据并检查形状', 'Load the local data and inspect its shape'), code: `import pandas as pd\n\ndf = pd.read_csv("california-housing.csv")\nfeatures = [\n    "MedInc", "HouseAge", "AveRooms", "AveBedrms",\n    "Population", "AveOccup", "Latitude", "Longitude",\n]\ntarget = "MedHouseVal"\n\nprint(df.shape)\nprint(df[features + [target]].head(3).to_string(index=False))`, note: loc('课程与 Notebook 都读取同一份本地 CSV；网站运行时不访问网络。', 'The lesson and notebooks read the same local CSV; the runtime makes no network request.') },
      { id: 'contract-output', kind: 'runtime-output', title: loc('真实运行输出', 'Real runtime output'), output: `(20640, 11)\n MedInc  HouseAge  AveRooms  AveBedrms  Population  AveOccup  Latitude  Longitude  MedHouseVal\n 8.3252      41.0   6.984127   1.023810       322.0  2.555556     37.88    -122.23        4.526\n 8.3014      21.0   6.238137   0.971880      2401.0  2.109842     37.86    -122.22        3.585\n 7.2574      52.0   8.288136   1.073446       496.0  2.802260     37.85    -122.24        3.521`, interpretation: loc('11 列包含 8 个特征、目标、稳定行号和固定分区。建模矩阵只取上面声明的 8 个特征。', 'The 11 columns include eight features, the target, stable row ID, and frozen partition. The design matrix uses only the declared eight features.') },
      { id: 'contract-formula', kind: 'formula', title: loc('把表格写成监督学习对象', 'Write the table as a supervised-learning object'), formula: String.raw`$$X\in\mathbb{R}^{20640\times 8},\qquad y\in\mathbb{R}^{20640}$$`, explanation: loc('每一行 $x_i$ 对应一个街区组，$y_i$ 是该街区组的房价中位数。矩阵形状先确定，后面的缩放、拟合和预测才有共同语言。', 'Each row $x_i$ is a block group and $y_i$ is its median house value. Fixing the shapes gives scaling, fitting, and prediction a common language.'), variables: [{ symbol: String.raw`$X$`, meaning: loc('八列特征组成的设计矩阵', 'Design matrix with eight feature columns') }, { symbol: String.raw`$y$`, meaning: loc('单位为 10 万美元的目标向量', 'Target vector in USD 100,000 units') }] },
      { id: 'contract-table', kind: 'table', title: loc('三类非模型字段', 'Three non-model roles'), columns: [loc('字段', 'Field'), loc('作用', 'Purpose'), loc('是否进入模型', 'Used by model')], rows: [
        { id: 'row', cells: [loc('row_id', 'row_id'), loc('追踪与复盘具体样本', 'Trace concrete rows'), loc('否', 'No')] },
        { id: 'split', cells: [loc('split', 'split'), loc('冻结 train/validation/test', 'Freeze train/validation/test'), loc('否', 'No')] },
        { id: 'target', cells: [loc('MedHouseVal', 'MedHouseVal'), loc('监督学习目标', 'Supervised target'), loc('只作为 y', 'Only as y')] },
      ], caption: loc('先把角色写清楚，能避免把标识、分区或目标误塞进特征矩阵。', 'Declaring roles prevents identifiers, partitions, or the target from leaking into the feature matrix.') },
      explanation('contract-misconception', loc('一行不是一套房', 'One row is not one house'), loc('把预测解释成“某栋房子的成交价”会夸大数据粒度。本项目只能学习街区组层面的统计关系，也不能代表 1990 年之后的市场。', 'Calling the target “the sale price of a home” overstates the data granularity. This project learns block-group associations and does not represent markets after 1990.'), 'misconception'),
      lab('contract-lab', 'data-contract', loc('数据契约检查台', 'Data-contract inspector'), loc('切换字段和样本，确认每列角色、单位与一行数据的真实含义。', 'Switch fields and rows to verify every role, unit, and the actual meaning of one observation.')),
      conclusion('contract-conclusion', loc('项目不是从调用模型开始，而是从可审计的数据契约开始：样本粒度、目标单位、特征边界和分区字段都必须先固定。', 'A project starts with an auditable data contract—not a model call. Freeze sample granularity, target units, feature boundaries, and partition fields first.')),
    ],
  },
  'eda-first-pass': {
    id: 'eda-first-pass', blocks: [
      problem('eda-question', loc('训练之前，哪些数据形状会限制线性模型？', 'Which data shapes constrain a linear model before training?'), loc('EDA 的目标不是收集漂亮图，而是把观察转成建模决定。本章严格只看训练集，验证集用于选择，测试集继续封存。', 'EDA is not a chart gallery; each observation should lead to a modeling decision. This chapter sees training rows only. Validation is for selection, and test remains sealed.')),
      explanation('eda-observation', loc('三次检查：分布、关系、空间', 'Three checks: distribution, relation, space'), loc('目标分布检查上限与长尾；单特征关系检查线性趋势和离散；经纬度图检查空间结构。训练集没有缺失值，但这不等于可以省略 schema 与有限值检查。', 'The target distribution reveals capping and skew; feature relations reveal trend and spread; coordinates reveal spatial structure. Training rows have no missing values, but schema and finite-value checks still matter.')),
      { id: 'eda-code', kind: 'code', language: 'python', title: loc('只对训练集做第一轮 EDA', 'Run the first EDA pass on training rows only'), code: `train = df.loc[df["split"] == "train"].copy()\n\nprint(train.shape)\nprint(train[features + [target]].isna().sum().sum())\nprint(train[target].describe().round(3))\nprint("target cap rows:", int((train[target] >= 5.0).sum()))`, note: loc('任何由数据学到的统计结论都从 `train` 产生。', 'Any learned statistical conclusion is produced from `train`.') },
      { id: 'eda-output', kind: 'runtime-output', title: loc('真实运行输出', 'Real runtime output'), output: `(12384, 11)\n0\ncount    12384.000\nmean         2.068\nstd          1.156\nmin          0.150\n25%          1.200\n50%          1.800\n75%          2.650\nmax          5.000\ntarget cap rows: 576`, interpretation: loc('训练目标右偏且在 5.0 附近堆积。RMSE 会强调大误差，MAE 保留目标单位，两者应同时查看。', 'The training target is right-skewed and capped near 5.0. RMSE emphasizes large misses while MAE retains target units, so read both.') },
      { id: 'eda-formula', kind: 'formula', title: loc('分箱均值不是一条拟合线', 'A binned mean is not a fitted line'), formula: String.raw`$$\bar y_b=\frac{1}{|B_b|}\sum_{i\in B_b}y_i$$`, explanation: loc('把某个特征分成若干区间 $B_b$，只用训练行计算区间目标均值，可以看趋势是否平滑、单调或弯曲；它仍然是描述性观察，不是模型。', 'Partition one feature into bins $B_b$ and compute target means from training rows. This reveals whether the relationship is smooth, monotone, or curved; it remains descriptive, not a model.'), variables: [{ symbol: String.raw`$B_b$`, meaning: loc('第 b 个训练特征区间', 'The b-th training-feature bin') }, { symbol: String.raw`$\bar y_b$`, meaning: loc('该区间的目标均值', 'Mean target in that bin') }] },
      figure('eda-target-figure', 'train-target-distribution'),
      figure('eda-relation-figure', 'train-income-target'),
      figure('eda-geography-figure', 'train-geography'),
      explanation('eda-misconception', loc('没有缺失值，不代表数据已经“干净”', 'No missing values does not mean “clean”'), loc('目标上限、极端入住人数、不同量纲和非线性地理结构都不会出现在 `isna()` 结果里。清洗首先是约束输入边界和评估边界。', 'Target capping, extreme occupancy, incompatible scales, and nonlinear geography do not appear in `isna()`. Cleaning first means constraining input and evaluation boundaries.'), 'misconception'),
      lab('eda-lab', 'training-eda', loc('训练集 EDA 观察台', 'Training-only EDA lab'), loc('切换特征与关系/地理视图，把每次观察写成一个具体的建模或评估提醒。', 'Switch features and relation/geography views, then turn each observation into one modeling or evaluation warning.')),
      conclusion('eda-conclusion', loc('本轮 EDA 得到三个决定：保留多指标评估、使用统一缩放流水线、在复盘中重点检查高价上限与空间残差。', 'This EDA yields three decisions: use multiple metrics, keep scaling in one pipeline, and inspect high-end and spatial residuals during review.')),
    ],
  },
  'cleaning-splits': {
    id: 'cleaning-splits', blocks: [
      problem('split-question', loc('为什么“先缩放再切分”会让评估失真？', 'Why does scaling before splitting distort evaluation?'), loc('StandardScaler 会从输入学习均值和尺度。只要验证集或测试集参与这些统计量，它们就已经影响训练流程，即使差值看起来很小。', 'StandardScaler learns means and scales. If validation or test rows affect these values, they influence the training pipeline—even when the numerical difference looks small.')),
      explanation('split-observation', loc('固定 60/20/20，再学习规则', 'Freeze 60/20/20, then learn rules'), loc(
        '本项目用 seed 42 固定互斥分区：训练 12,384、验证 4,128、测试 4,128。EDA 和 scaler 只拟合训练集；验证集只比较预先声明的方案；测试集只在最终模型冻结后打开一次。',
        'Seed 42 freezes disjoint partitions: 12,384 train, 4,128 validation, and 4,128 test rows. EDA and the scaler fit train only; validation compares declared options; test opens once after the final model is frozen.',
      )),
      { id: 'split-code', kind: 'code', language: 'python', title: loc('把预处理与模型绑进 Pipeline', 'Bind preprocessing and model in one Pipeline'), code: `from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LinearRegression\n\ntrain = df[df["split"] == "train"]\nvalidation = df[df["split"] == "validation"]\ntest = df[df["split"] == "test"]\n\nmodel = Pipeline([\n    ("scale", StandardScaler()),\n    ("regressor", LinearRegression()),\n])\nmodel.fit(train[features], train[target])\nvalidation_pred = model.predict(validation[features])`, note: loc('测试变量可以存在，但选择完成前不读取它的标签、指标或残差。', 'The test variable may exist, but its labels, metrics, and residuals remain unread until selection is frozen.') },
      { id: 'split-output', kind: 'runtime-output', title: loc('真实运行输出', 'Real runtime output'), output: `split counts: {'train': 12384, 'validation': 4128, 'test': 4128}\ntrain scaler MedInc mean: 3.860184\ntrain scaler MedInc scale: 1.893749\nvalidation transform finite: True\ntest metrics: LOCKED`, interpretation: loc('这里的 `LOCKED` 是流程约束，不是缺失功能。前五章不会加载最终测试指标资产。', '`LOCKED` is an evaluation constraint, not missing functionality. The first five chapters do not load final test metrics.') },
      { id: 'split-formula', kind: 'formula', title: loc('训练集统计量定义缩放', 'Training statistics define scaling'), formula: String.raw`$$\mu_j^{\text{train}}=\frac{1}{n_{\text{train}}}\sum_{i\in\text{train}}x_{ij},\qquad \tilde x_{ij}=\frac{x_{ij}-\mu_j^{\text{train}}}{\sigma_j^{\text{train}}}$$`, explanation: loc('验证和测试行只代入训练集学到的 $\mu_j$ 与 $\sigma_j$。它们不参与这两个量的计算。', 'Validation and test rows only use $\mu_j$ and $\sigma_j$ learned from training rows; they never contribute to those estimates.'), variables: [{ symbol: String.raw`$\mu_j^{\text{train}}$`, meaning: loc('第 j 个特征的训练集均值', 'Training mean of feature j') }, { symbol: String.raw`$\sigma_j^{\text{train}}$`, meaning: loc('第 j 个特征的训练集尺度', 'Training scale of feature j') }] },
      figure('split-figure', 'scaler-boundary'),
      explanation('split-leakage', loc('三种常见泄漏', 'Three common leakage paths'), loc('切分前拟合 scaler；根据测试指标挑 alpha；把 `MedHouseVal` 或由目标派生的列放进特征矩阵。三者都会让结果比真实部署场景更乐观。', 'Fitting the scaler before splitting, choosing alpha from test metrics, or placing `MedHouseVal` or target-derived columns in the design matrix all make results unrealistically optimistic.'), 'leakage'),
      lab('split-lab', 'leakage-boundary', loc('数据泄漏边界台', 'Leakage-boundary lab'), loc('切换特征，对比正确的训练集统计量与错误的全量统计量，并复述 `fit` 与 `transform` 的边界。', 'Switch features, compare valid train-only statistics with invalid full-data statistics, and restate the boundary between `fit` and `transform`.')),
      conclusion('split-conclusion', loc('可信评估来自流程隔离：训练集学习规则，验证集选择方案，测试集只负责一次最终回答。', 'Trustworthy evaluation comes from isolation: train learns rules, validation selects, and test answers once at the end.')),
    ],
  },
  'linear-baseline': {
    id: 'linear-baseline', blocks: [
      problem('baseline-question', loc('八列特征如何共同组成一个可复查的预测？', 'How do eight features form one inspectable prediction?'), loc('先建立最简单、可重复、可解释的基线。它不需要赢，只需要成为后续改动的诚实参照。', 'Build the simplest reproducible, interpretable baseline. It does not need to win; it needs to become an honest reference for later changes.')),
      explanation('baseline-observation', loc('标准化改变系数单位，不改变预测目标单位', 'Scaling changes coefficient units, not target units'), loc('Pipeline 先把每个特征变为训练集标准差单位，再拟合 LinearRegression。预测仍以 10 万美元为单位；标准化系数可用于比较同一模型内部各特征的线性贡献。', 'The pipeline converts each feature to training-standard-deviation units before LinearRegression. Predictions remain in USD 100,000 units; standardized coefficients help compare linear contributions within this model.')),
      { id: 'baseline-code', kind: 'code', language: 'python', title: loc('拟合基线并拆解单行预测', 'Fit the baseline and decompose one prediction'), code: `model.fit(train[features], train[target])\nvalidation_pred = model.predict(validation[features])\n\nscaled_row = model.named_steps["scale"].transform(\n    validation[features].iloc[[0]]\n)[0]\ncoef = model.named_steps["regressor"].coef_\nintercept = model.named_steps["regressor"].intercept_\ncontribution = scaled_row * coef\nprint(intercept, contribution.sum(), intercept + contribution.sum())`, note: loc('页面中的样本贡献来自这段已执行计算，不在浏览器里重新拟合。', 'The page sample contributions come from this executed computation; the browser never refits the model.') },
      { id: 'baseline-output', kind: 'runtime-output', title: loc('真实运行输出', 'Real runtime output'), output: `intercept: 2.067531\nsum(feature contributions): 2.059657\nprediction: 4.127188\nactual: 4.526000\nvalidation RMSE: 0.731391\nvalidation MAE: 0.540029\nvalidation R²: 0.600227`, interpretation: loc('截距加八个贡献严格等于预测。这个拆解解释的是模型如何计算，不表示某个特征对现实房价具有因果效应。', 'The intercept plus eight contributions exactly equals the prediction. This explains model arithmetic, not a causal effect on real housing value.') },
      { id: 'baseline-formula', kind: 'formula', title: loc('从矩阵到单行贡献', 'From matrix form to row contributions'), formula: String.raw`$$\hat y_i=b+\sum_{j=1}^{8}w_j\tilde x_{ij}$$`, explanation: loc('每项 $w_j\tilde x_{ij}$ 是这个样本在第 j 个标准化特征上的线性贡献。正值抬高预测，负值压低预测。', 'Each $w_j\tilde x_{ij}$ is the row-level linear contribution of standardized feature j. Positive values raise the prediction and negative values lower it.'), variables: [{ symbol: String.raw`$b$`, meaning: loc('所有标准化特征为 0 时的基线预测', 'Baseline prediction when standardized features are zero') }, { symbol: String.raw`$w_j\tilde x_{ij}$`, meaning: loc('第 j 个特征对第 i 行的模型贡献', 'Model contribution of feature j to row i') }] },
      { id: 'baseline-table', kind: 'table', title: loc('验证集基线指标', 'Validation baseline metrics'), columns: [loc('指标', 'Metric'), loc('结果', 'Result'), loc('回答的问题', 'Question answered')], rows: [
        { id: 'rmse', cells: [loc('RMSE', 'RMSE'), loc('0.731391', '0.731391'), loc('大误差被更重惩罚时，典型偏差多大？', 'How large is error when big misses weigh more?')] },
        { id: 'mae', cells: [loc('MAE', 'MAE'), loc('0.540029', '0.540029'), loc('平均绝对偏差约多少万美元？', 'What is the mean absolute miss in target units?')] },
        { id: 'r2', cells: [loc('R²', 'R²'), loc('0.600227', '0.600227'), loc('相对猜均值解释了多少变化？', 'How much variation is explained versus the mean?')] },
      ], caption: loc('这些是验证集结果，不是最终测试成绩。', 'These are validation results, not final test performance.') },
      explanation('baseline-misconception', loc('贡献不是原因', 'Contribution is not causation'), loc('经纬度贡献很大，只说明当前线性模型在控制其他输入后如何组合坐标。它可能同时承载区域、交通、就业与历史结构，不能解读成移动一度经纬度会造成房价变化。', 'Large coordinate contributions describe how this linear model combines coordinates while holding inputs fixed. They may proxy region, access, jobs, and history; they do not mean moving one degree causes a value change.'), 'misconception'),
      lab('baseline-lab', 'baseline-contributions', loc('单行预测拆解台', 'Row-prediction decomposition'), loc('选择真实验证样本，观察截距与八项贡献怎样相加，并比较预测与真实目标。', 'Select a real validation row, inspect how the intercept and eight contributions add up, and compare prediction with target.')),
      conclusion('baseline-conclusion', loc('基线把完整流程固定下来：同一组特征、同一个训练集 scaler、同一个验证集和可逐项复查的预测计算。', 'The baseline freezes the full process: one feature set, one train-fitted scaler, one validation set, and prediction arithmetic that can be inspected term by term.')),
    ],
  },
  evaluation: {
    id: 'evaluation', blocks: [
      problem('evaluation-question', loc('Ridge 的 RMSE 小一点，就一定应该换模型吗？', 'If Ridge RMSE is slightly smaller, must we switch models?'), loc('模型选择规则要在看到结果前声明。本项目以验证 RMSE 为主、MAE 和 R²为辅助；改善不足 1% 时保留更简单方案。测试集此时仍然锁定。', 'Declare the selection rule before seeing results. This project prioritizes validation RMSE, uses MAE and R² as support, and keeps the simpler model unless improvement reaches 1%. Test remains locked.')),
      explanation('evaluation-observation', loc('只改变一个因素：正则强度', 'Change one factor: regularization strength'), loc('Ridge 与基线使用完全相同的八个特征、训练行、StandardScaler 和验证行。候选 alpha 固定为 0.01、0.1、1、10、100，所以差异只来自 L2 惩罚。', 'Ridge and baseline use identical features, training rows, StandardScaler, and validation rows. Alpha candidates are frozen at 0.01, 0.1, 1, 10, and 100, so only the L2 penalty changes.')),
      { id: 'evaluation-code', kind: 'code', language: 'python', title: loc('在验证集上比较固定候选', 'Compare frozen candidates on validation'), code: `from sklearn.linear_model import Ridge\nfrom sklearn.metrics import root_mean_squared_error\n\nfor alpha in [0.01, 0.1, 1.0, 10.0, 100.0]:\n    candidate = Pipeline([\n        ("scale", StandardScaler()),\n        ("regressor", Ridge(alpha=alpha, solver="svd")),\n    ])\n    candidate.fit(train[features], train[target])\n    pred = candidate.predict(validation[features])\n    print(alpha, root_mean_squared_error(validation[target], pred))`, note: loc('这里没有一行读取测试标签；选择信息完全来自验证集。', 'No line reads test labels; selection information comes entirely from validation.') },
      { id: 'evaluation-output', kind: 'runtime-output', title: loc('真实运行输出', 'Real runtime output'), output: `LinearRegression  RMSE=0.731390951\nRidge alpha=0.01 RMSE=0.731391004\nRidge alpha=0.10 RMSE=0.731391481\nRidge alpha=1.00 RMSE=0.731396339\nRidge alpha=10.0 RMSE=0.731453604\nRidge alpha=100  RMSE=0.732714796\nselected: LinearRegression\ntest: LOCKED`, interpretation: loc('最小 Ridge RMSE 仍略高于基线，因此相对改善为负。即使它只差极小，小数点竞争也没有越过 1% 规则。', 'The best Ridge RMSE is still slightly worse than baseline, so relative improvement is negative. Decimal-place competition does not clear the 1% rule.') },
      { id: 'evaluation-formula', kind: 'formula', title: loc('Ridge 的目标与选择门槛', 'Ridge objective and selection threshold'), formula: String.raw`$$\min_{w,b}\;\frac{1}{n}\sum_{i=1}^{n}(y_i-b-x_i^\top w)^2+\alpha\lVert w\rVert_2^2$$\n\n$$\text{improvement}=\frac{\operatorname{RMSE}_{base}-\operatorname{RMSE}_{candidate}}{\operatorname{RMSE}_{base}}$$`, explanation: loc('Ridge 用系数平方和换取更稳定的参数。是否采用它由预先声明的验证改善门槛决定，而不是由测试集决定。', 'Ridge trades coefficient magnitude for stability. Adoption is decided by a declared validation threshold, never by test results.'), variables: [{ symbol: String.raw`$\alpha$`, meaning: loc('L2 正则强度', 'L2 regularization strength') }, { symbol: String.raw`$\lVert w\rVert_2^2$`, meaning: loc('所有斜率系数平方和', 'Sum of squared slope coefficients') }] },
      figure('evaluation-figure', 'validation-ridge-path'),
      explanation('evaluation-misconception', loc('最小验证小数不等于有意义的改善', 'The smallest validation decimal is not meaningful improvement'), loc('在同一验证集上比较很多方案会逐渐过拟合验证集。固定候选、设置改善门槛并优先简单模型，是控制这种选择偏差的基本做法。', 'Comparing many options on one validation set gradually overfits that set. Freeze candidates, set a meaningful threshold, and prefer simplicity to limit selection bias.'), 'misconception'),
      lab('evaluation-lab', 'ridge-selection', loc('Ridge 选择路径台', 'Ridge selection-path lab'), loc('切换 alpha 和指标，观察数值变化是否真的越过 1% 门槛；测试结果始终保持锁定。', 'Switch alpha and metric, then judge whether the change truly clears 1%; test results remain locked.')),
      conclusion('evaluation-conclusion', loc('本项目冻结 LinearRegression。下一步是在训练集与验证集合并数据上重新拟合同一流水线，然后只打开一次测试集。', 'This project freezes LinearRegression. Next, refit the same pipeline on train plus validation, then open test exactly once.')),
    ],
  },
  'review-next-iteration': {
    id: 'review-next-iteration', blocks: [
      problem('review-question', loc('一个最终分数，能告诉我们模型在哪里失败吗？', 'Can one final score tell us where the model fails?'), loc('最终测试只回答冻结模型在未参与选择的数据上表现如何。真正的复盘还要读预测—真实图、残差结构、分组误差和具名失败样本。', 'The final test answers how the frozen model performs on unseen selection-independent data. A real review also reads prediction-vs-actual, residual structure, group errors, and named failures.')),
      explanation('review-observation', loc('冻结后合并训练与验证，再评价一次', 'Refit after freezing, then evaluate once'), loc('特征、预处理和模型类型已经冻结。我们在 16,512 条训练+验证数据上重新拟合 StandardScaler 与 LinearRegression，最后一次读取 4,128 条测试标签。', 'Features, preprocessing, and model type are now frozen. Refit StandardScaler and LinearRegression on 16,512 train-plus-validation rows, then read the 4,128 test labels once.')),
      { id: 'review-code', kind: 'code', language: 'python', title: loc('最终重拟合与残差表', 'Final refit and residual table'), code: `development = df[df["split"].isin(["train", "validation"])]\ntest = df[df["split"] == "test"]\n\nfinal_model.fit(development[features], development[target])\npred = final_model.predict(test[features])\nresiduals = pd.DataFrame({\n    "row_id": test["row_id"],\n    "actual": test[target],\n    "prediction": pred,\n})\nresiduals["residual"] = residuals["actual"] - residuals["prediction"]\nresiduals["abs_error"] = residuals["residual"].abs()`, note: loc('这是本项目唯一一次最终测试评价；页面数值可由下载的残差 CSV 复算。', 'This is the project’s only final test evaluation; page metrics can be recomputed from the downloadable residual CSV.') },
      { id: 'review-output', kind: 'runtime-output', title: loc('最终测试运行结果', 'Final test runtime output'), output: `selected model: LinearRegression\ntest rows: 4128\nRMSE: 0.724508\nMAE: 0.529685\nR²: 0.610048\nlargest error row: ca-06689\nactual=5.000010 prediction=0.833245 residual=4.166765`, interpretation: loc('模型平均绝对偏差约 5.30 万美元，但最大的失败超过 41.7 万美元。整体指标与失败样本必须同时报告。', 'Mean absolute error is about USD 52,968, while the largest miss exceeds USD 416,000. Aggregate metrics and concrete failures must be reported together.') },
      { id: 'review-formula', kind: 'formula', title: loc('从逐行残差复算指标', 'Recompute metrics from row residuals'), formula: String.raw`$$r_i=y_i-\hat y_i,\qquad \operatorname{MAE}=\frac{1}{n}\sum_i|r_i|,\qquad \operatorname{RMSE}=\sqrt{\frac{1}{n}\sum_i r_i^2}$$`, explanation: loc('发布的 `final-test-residuals.csv` 含每行真实值、预测值和残差，因此页面指标不是不可核对的截图。', 'The published `final-test-residuals.csv` contains actual, predicted, and residual values for every row, so page metrics are auditable rather than screenshots.'), variables: [{ symbol: String.raw`$r_i$`, meaning: loc('真实值减预测值；正值表示低估', 'Actual minus predicted; positive means underprediction') }, { symbol: String.raw`$n$`, meaning: loc('最终测试行数 4,128', 'Final test row count, 4,128') }] },
      figure('review-prediction-figure', 'final-predicted-actual'),
      figure('review-residual-figure', 'final-residuals'),
      { id: 'review-table', kind: 'table', title: loc('具名失败样本', 'Named failure cases'), columns: [loc('row_id', 'row_id'), loc('真实值', 'Actual'), loc('预测值', 'Prediction'), loc('残差', 'Residual')], rows: [
        { id: 'ca-06689', cells: [loc('ca-06689', 'ca-06689'), loc('5.000', '5.000'), loc('0.833', '0.833'), loc('+4.167（严重低估）', '+4.167 (large underprediction)')] },
        { id: 'ca-04493', cells: [loc('ca-04493', 'ca-04493'), loc('1.125', '1.125'), loc('4.863', '4.863'), loc('-3.738（严重高估）', '-3.738 (large overprediction)')] },
        { id: 'ca-13767', cells: [loc('ca-13767', 'ca-13767'), loc('5.000', '5.000'), loc('1.369', '1.369'), loc('+3.631（严重低估）', '+3.631 (large underprediction)')] },
      ], caption: loc('正残差表示模型低估。高价上限样本集中出现大正残差，说明误差不是纯随机噪声。', 'Positive residuals indicate underprediction. Large positive errors cluster near the target cap, so the errors are not pure random noise.') },
      explanation('review-misconception', loc('R² 约 0.61 不代表“模型准确率 61%”', 'R² near 0.61 is not “61% accuracy”'), loc('R² 比较残差平方和与猜训练目标均值的基准，它没有分类准确率含义，也不能掩盖具体人群或区域中的系统失败。', 'R² compares residual sum of squares with a mean-prediction baseline. It is not classification accuracy and cannot hide systematic failures in particular groups or regions.'), 'misconception'),
      lab('review-lab', 'final-review', loc('最终残差复盘台', 'Final residual review lab'), loc('切换失败组与具名样本，把最终指标、误差方向、地理位置和数据限制连成一次完整复盘。', 'Switch failure groups and named rows to connect final metrics, error direction, location, and dataset limitations in one review.')),
      conclusion('review-conclusion', loc('这条项目链已经闭合：本地数据契约 → 训练集 EDA → 防泄漏流水线 → 诚实基线 → 验证选择 → 一次测试与失败复盘。下一轮应优先研究非线性地理特征和目标上限，而不是继续在同一测试集上试模型。', 'The project loop is complete: local contract → training-only EDA → leakage-safe pipeline → honest baseline → validation selection → one test and failure review. Next, study nonlinear geography and target capping instead of trying more models on the same test set.')),
    ],
    references: [
      { label: loc('scikit-learn：California Housing 数据集', 'scikit-learn: California Housing dataset'), href: 'https://scikit-learn.org/stable/datasets/real_world.html#california-housing-dataset', note: loc('字段、目标与数据粒度说明。', 'Feature, target, and sample-granularity documentation.') },
      { label: loc('scikit-learn：常见陷阱与数据泄漏', 'scikit-learn: Common pitfalls and leakage'), href: 'https://scikit-learn.org/stable/common_pitfalls.html', note: loc('预处理边界与 Pipeline 规范。', 'Preprocessing boundaries and Pipeline guidance.') },
      { label: loc('scikit-learn：线性模型', 'scikit-learn: Linear models'), href: 'https://scikit-learn.org/stable/modules/linear_model.html', note: loc('LinearRegression 与 Ridge 定义。', 'Definitions of LinearRegression and Ridge.') },
      { label: loc('StatLib：California Housing 原始数据', 'StatLib: original California Housing data'), href: 'https://lib.stat.cmu.edu/datasets/', note: loc('本地数据包的原始公开来源；许可证范围记录在项目文档。', 'Original public source for the local package; license scope is documented in the project notes.') },
    ],
    downloads: [
      { kind: 'dataset', publicPath: '/datasets/tabular-regression/california-housing.csv', label: loc('完整 California Housing CSV', 'Full California Housing CSV') },
      { kind: 'json', publicPath: '/datasets/tabular-regression/manifest.json', label: loc('数据来源与哈希 manifest', 'Dataset provenance and hash manifest') },
      { kind: 'notebook', publicPath: '/notebooks/tabular-regression/california-housing-project.zh-CN.ipynb', label: loc('中文已执行 Notebook', 'Executed Chinese notebook') },
      { kind: 'notebook', publicPath: '/notebooks/tabular-regression/california-housing-project.en.ipynb', label: loc('英文已执行 Notebook', 'Executed English notebook') },
      { kind: 'csv', publicPath: '/notebooks/tabular-regression/validation-metrics.csv', label: loc('验证集模型对照', 'Validation model comparison') },
      { kind: 'csv', publicPath: '/notebooks/tabular-regression/coefficient-path.csv', label: loc('系数路径', 'Coefficient path') },
      { kind: 'csv', publicPath: '/notebooks/tabular-regression/final-test-residuals.csv', label: loc('最终测试逐行残差', 'Final test row residuals') },
      { kind: 'json', publicPath: '/tabular-regression/manifest.json', label: loc('图表与互动资产清单', 'Figure and interaction manifest') },
    ],
  },
}

export function housingProjectLessonFor(id: string): HousingProjectChapterLesson {
  return lessons[id as HousingProjectChapterId] ?? lessons['csv-to-frame']
}

export const housingProjectLessons = lessons
