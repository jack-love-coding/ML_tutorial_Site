import type { LocalizedCopy } from '../types/ml'
import type {
  LinearRegressionChapterLesson,
  LinearRegressionCodeBlock,
  LinearRegressionExplanationBlock,
  LinearRegressionFigureBlock,
  LinearRegressionFigureDefinition,
  LinearRegressionFigureId,
  LinearRegressionFormulaBlock,
  LinearRegressionObservationLabBlock,
  LinearRegressionObservationControl,
  LinearRegressionObservationSceneId,
  LinearRegressionRuntimeOutputBlock,
  LinearRegressionTableBlock,
} from '../types/linearRegressionLesson'

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function explanation(
  id: string,
  eyebrow: LocalizedCopy,
  title: LocalizedCopy,
  body: LocalizedCopy,
  tone: LinearRegressionExplanationBlock['tone'] = 'default',
): LinearRegressionExplanationBlock {
  return { id, kind: 'explanation', eyebrow, title, body, tone }
}

function formula(
  id: string,
  title: LocalizedCopy,
  source: string,
  body: LocalizedCopy,
  variables: LinearRegressionFormulaBlock['variables'],
): LinearRegressionFormulaBlock {
  return { id, kind: 'formula', title, formula: source, explanation: body, variables }
}

function code(
  id: string,
  title: LocalizedCopy,
  source: string,
  note?: LocalizedCopy,
): LinearRegressionCodeBlock {
  return { id, kind: 'code', title, language: 'python', code: source.trim(), note }
}

function output(
  id: string,
  title: LocalizedCopy,
  value: string,
  interpretation: LocalizedCopy,
): LinearRegressionRuntimeOutputBlock {
  return { id, kind: 'runtime-output', title, output: value.trim(), interpretation }
}

function figure(id: string, figureId: LinearRegressionFigureId): LinearRegressionFigureBlock {
  return { id, kind: 'figure', figureId, title: linearRegressionFigures[figureId].title }
}

function table(
  id: string,
  title: LocalizedCopy,
  columns: LocalizedCopy[],
  rows: LinearRegressionTableBlock['rows'],
  caption: LocalizedCopy,
): LinearRegressionTableBlock {
  return { id, kind: 'table', title, columns, rows, caption }
}

function lab(
  id: string,
  title: LocalizedCopy,
  prompt: LocalizedCopy,
  sceneId: LinearRegressionObservationSceneId,
  controls: LinearRegressionObservationControl[],
): LinearRegressionObservationLabBlock {
  return { id, kind: 'observation-lab', title, prompt, sceneId, controls }
}

export const linearRegressionFigures: Readonly<Record<LinearRegressionFigureId, LinearRegressionFigureDefinition>> = {
  'fit-line-temp': {
    id: 'fit-line-temp', chapterId: 'fit-line',
    publicPath: '/linear-regression/phase-27a/figures/fit-line-temp.png', sourceCellId: 'fit-line-chart',
    title: loc('训练集温度与租车量的第一条拟合直线', 'The first fitted line for training temperature and rentals'),
    alt: loc('训练集温度散点与线性回归拟合直线', 'Training temperature scatter plot with a fitted regression line'),
    caption: loc('直线概括整体上升趋势，但同一温度下租车量仍有很大差异。', 'The line captures the overall rise, while rentals still vary widely at the same temperature.'),
    readingHint: loc('先沿横轴比较温度，再观察点到直线的垂直距离。', "Compare temperature along the x-axis, then inspect each point's vertical distance to the line."),
    fallback: loc('训练集 10,427 行；温度系数 278.863，截距 16.610。', '10,427 training rows; temperature coefficient 278.863 and intercept 16.610.'),
  },
  'split-and-target': {
    id: 'split-and-target', chapterId: 'multivariate',
    publicPath: '/linear-regression/phase-27a/figures/split-and-target.png', sourceCellId: 'split-target-chart',
    title: loc('时间切分与目标分布', 'Chronological split and target distribution'),
    alt: loc('训练验证测试时间切分及目标分布直方图', 'Chronological train-validation-test split and target histograms'),
    caption: loc('三个集合保持时间顺序，后期租车量分布与训练期并不完全相同。', 'The partitions preserve time order, and later rental counts do not exactly match the training period.'),
    readingHint: loc('注意验证集不是从训练数据中随机抽出的。', 'Notice that validation rows were not randomly sampled from training.'),
    fallback: loc('训练 10,427 行，验证 3,476 行，测试 3,476 行，三段互不重叠。', 'Train 10,427 rows, validation 3,476 rows, test 3,476 rows; the partitions do not overlap.'),
  },
  'train-feature-relations': {
    id: 'train-feature-relations', chapterId: 'multivariate',
    publicPath: '/linear-regression/phase-27a/figures/train-feature-relations.png', sourceCellId: 'feature-relations-chart',
    title: loc('只使用训练集观察特征关系', 'Feature relationships inspected on training data only'),
    alt: loc('温度湿度风速小时与平均租车量的四幅关系图', 'Four relationship plots for temperature, humidity, windspeed, hour, and mean rentals'),
    caption: loc('小时的非线性形状提示单条直线不足以表达通勤节奏。', 'The nonlinear hourly shape suggests one straight effect cannot represent commuting rhythms.'),
    readingHint: loc('比较散点范围与橙色分组均值线。', 'Compare the scatter range with the orange grouped-mean line.'),
    fallback: loc('温度总体正相关；湿度总体负相关；小时关系明显弯曲；散点离散度很大。', 'Temperature is broadly positive, humidity broadly negative, hour strongly curved, with wide scatter throughout.'),
  },
  'residual-loss': {
    id: 'residual-loss', chapterId: 'residual-loss',
    publicPath: '/linear-regression/phase-27a/figures/residual-loss.png', sourceCellId: 'residual-loss-chart',
    title: loc('残差与损失函数', 'Residuals and loss functions'),
    alt: loc('预测实际差距以及绝对误差平方误差贡献对比', 'Prediction-to-actual gaps and absolute-versus-squared error contributions'),
    caption: loc('平方让大残差获得更高权重，因此 MSE 对异常大误差更敏感。', 'Squaring gives large residuals more weight, making MSE more sensitive to extreme errors.'),
    readingHint: loc('右图已归一化，比较两条曲线的增长速度。', 'The right panel is normalized; compare how quickly the two curves grow.'),
    fallback: loc('温度单特征训练集 RMSE 122.848、MAE 93.477、R² 0.170。', 'Temperature-only training RMSE 122.848, MAE 93.477, and R² 0.170.'),
  },
  'gradient-descent': {
    id: 'gradient-descent', chapterId: 'training-motion',
    publicPath: '/linear-regression/phase-27a/figures/gradient-descent.png', sourceCellId: 'gradient-descent-chart',
    title: loc('训练集标准化与梯度下降轨迹', 'Training-only scaling and gradient-descent trajectory'),
    alt: loc('特征标准化前后箱线图与损失梯度轨迹', 'Feature boxplots before and after scaling plus loss and gradient trajectories'),
    caption: loc('只用训练集拟合缩放参数后，不同特征进入相近数值尺度，优化更稳定。', 'After fitting scaling parameters on training only, features enter comparable ranges and optimization stabilizes.'),
    readingHint: loc('第三图使用对数坐标，下降后趋平表示接近最小值。', 'The third panel uses log scales; flattening after the drop indicates convergence.'),
    fallback: loc('学习率 0.1，765 次更新，最终 MSE 12080.871；与 sklearn 最大参数差 2.8×10⁻⁸。', 'Learning rate 0.1, 765 updates, final MSE 12080.871; maximum parameter difference from sklearn 2.8×10⁻⁸.'),
  },
  'hour-and-polynomial': {
    id: 'hour-and-polynomial', chapterId: 'polynomial',
    publicPath: '/linear-regression/phase-27a/figures/hour-and-polynomial.png', sourceCellId: 'hour-polynomial-chart',
    title: loc('小时周期与多项式复杂度', 'Hourly cycles and polynomial complexity'),
    alt: loc('工作日分时需求曲线与不同多项式次数训练验证误差', 'Hourly demand curves by working day and train-validation errors for polynomial degrees'),
    caption: loc('特征可以非线性变换，而模型对参数仍保持线性；复杂度必须由验证集检验。', 'Features may be transformed nonlinearly while the model remains linear in its parameters; validation must justify complexity.'),
    readingHint: loc('左图关注 23 点到 0 点的周期衔接，右图比较训练和验证 RMSE。', 'On the left, consider the 23-to-0 boundary; on the right, compare train and validation RMSE.'),
    fallback: loc('温度多项式 1–8 次的验证 RMSE 都约为 219，复杂曲线没有带来实质改进。', 'Temperature polynomial degrees 1–8 all validate near RMSE 219, so extra curvature adds no material gain.'),
  },
  'feature-stages': {
    id: 'feature-stages', chapterId: 'polynomial',
    publicPath: '/linear-regression/phase-27a/figures/feature-stages.png', sourceCellId: 'feature-stage-chart',
    title: loc('预先声明的特征阶段', 'Predeclared feature stages'),
    alt: loc('六个特征与正则化阶段的训练验证RMSE柱状图', 'Train and validation RMSE bars for six feature and regularization stages'),
    caption: loc('增加特征通常降低训练误差，但是否值得保留由验证误差和简洁性共同决定。', 'More features often lower training error, but validation performance and simplicity decide whether they stay.'),
    readingHint: loc('重点比较橙色验证柱，不要只看蓝色训练柱。', 'Focus on the orange validation bars rather than only the blue training bars.'),
    fallback: loc('验证 RMSE：temp 219.227，核心五特征 197.799，类别 182.321，周期交互 166.850。', 'Validation RMSE: temp 219.227, core five 197.799, categories 182.321, cyclical interactions 166.850.'),
  },
  coefficients: {
    id: 'coefficients', chapterId: 'model-limits',
    publicPath: '/linear-regression/phase-27a/figures/coefficients.png', sourceCellId: 'coefficient-chart',
    title: loc('条件系数的方向与大小', 'Direction and magnitude of conditional coefficients'),
    alt: loc('标准化连续特征和编码类别特征的系数条形图', 'Coefficient bars for standardized continuous and encoded categorical features'),
    caption: loc('系数描述其他入模变量保持不变时的条件关联，不能直接解释为因果效应。', 'Coefficients describe conditional associations while other included variables are held fixed; they are not direct causal effects.'),
    readingHint: loc('先确认特征经过何种缩放或编码，再解释系数。', "Check each feature's scaling or encoding before interpreting its coefficient."),
    fallback: loc('较大系数包括 yr +76.593、mnth_5 +75.880、hour_cos −66.098、hour_sin −59.706。', 'Large coefficients include yr +76.593, mnth_5 +75.880, hour_cos −66.098, and hour_sin −59.706.'),
  },
  'validation-diagnostics': {
    id: 'validation-diagnostics', chapterId: 'overfitting',
    publicPath: '/linear-regression/phase-27a/figures/validation-diagnostics.png', sourceCellId: 'diagnostic-chart',
    title: loc('验证集残差诊断', 'Validation residual diagnostics'),
    alt: loc('验证集预测实际对照残差拟合值和分小时残差图', 'Validation prediction-versus-actual, residual-versus-fitted, and hourly residual plots'),
    caption: loc('残差仍随时段呈现结构，说明线性模型遗漏了部分需求机制。', 'Residuals retain time-of-day structure, showing that the linear model misses part of the demand mechanism.'),
    readingHint: loc('随机云团较理想；可辨认的弧线或时段偏差表示系统性遗漏。', 'A random cloud is preferable; visible curves or hourly bias indicate systematic omissions.'),
    fallback: loc('验证 RMSE 166.850、MAE 127.004、R² 0.401；高峰时段存在系统性低估。', 'Validation RMSE 166.850, MAE 127.004, R² 0.401; peak periods show systematic underprediction.'),
  },
  regularization: {
    id: 'regularization', chapterId: 'regularization',
    publicPath: '/linear-regression/phase-27a/figures/regularization.png', sourceCellId: 'regularization-chart',
    title: loc('共线性与正则化系数路径', 'Collinearity and regularization coefficient paths'),
    alt: loc('温度体感温度相关散点及Ridge Lasso系数路径', 'Temperature-apparent-temperature correlation and Ridge/Lasso coefficient paths'),
    caption: loc('temp 与 atemp 高度相关；Ridge 平滑收缩，Lasso 会把部分系数压到零。', 'temp and atemp are highly correlated; Ridge shrinks smoothly while Lasso can drive coefficients to zero.'),
    readingHint: loc('沿横轴增大 alpha，观察两种方法如何处理相关特征。', 'Move right as alpha increases and compare how the methods handle correlated features.'),
    fallback: loc('训练集 temp/atemp 相关系数 0.992；Ridge(alpha=10) 验证 RMSE 167.036。', 'Training temp/atemp correlation is 0.992; Ridge(alpha=10) validation RMSE is 167.036.'),
  },
  'final-test': {
    id: 'final-test', chapterId: 'regularization',
    publicPath: '/linear-regression/phase-27a/figures/final-test.png', sourceCellId: 'final-test-chart',
    title: loc('冻结方案后的唯一一次测试集评价', 'The single test evaluation after freezing the design'),
    alt: loc('测试期实际预测时间序列与最终残差分布', 'Test-period actual and predicted time series with the final residual distribution'),
    caption: loc('测试集只回答冻结方案面对未来时段的表现，不再用于修改特征。', 'The test set only reports how the frozen design handles a later period; it is not used to revise features.'),
    readingHint: loc('左图只抽样显示以保持可读，指标使用全部 3,476 行。', 'The left panel is sampled for readability; metrics use all 3,476 rows.'),
    fallback: loc('测试 RMSE 163.111、MAE 120.989、R² 0.453，共评价 3,476 行一次。', 'Test RMSE 163.111, MAE 120.989, and R² 0.453 from one evaluation of 3,476 rows.'),
  },
}

const commonMistake = loc('常见误区', 'Common misconception')
const conclusion = loc('本章结论', 'Chapter conclusion')

export const linearRegressionLessons: Readonly<Record<string, LinearRegressionChapterLesson>> = {
  'fit-line': {
    id: 'fit-line',
    blocks: [
      explanation('fit-question', loc('问题引入', 'Question'), loc('一条直线究竟学到了什么？', 'What does one fitted line actually learn?'), loc('我们先把输入限制为归一化温度 `temp`，把目标设为每小时总租车量 `cnt`。任务不是马上追求高精度，而是看清一行数据怎样变成一个预测，以及斜率、截距和残差各自承担什么角色。', 'We begin with normalized temperature `temp` as the only input and hourly total rentals `cnt` as the target. The goal is not immediate accuracy, but a clear view of how one row becomes a prediction and what slope, intercept, and residual each mean.'), 'question'),
      explanation('fit-data', loc('数据观察', 'Data observation'), loc('先看训练期，而不是先看模型', 'Inspect the training period before the model'), loc('散点图中，每个点代表一个小时。相同温度下会出现完全不同的租车量，因为小时、工作日、季节和天气尚未进入模型。直线只能压缩出“平均趋势”，不能解释全部变化。', 'Each dot is one hour. The same temperature can correspond to very different rental counts because hour, workday, season, and weather are not yet modeled. The line can compress an average trend, not explain every variation.')),
      figure('fit-figure', 'fit-line-temp'),
      code('fit-code', loc('用 sklearn 拟合第一条直线', 'Fit the first line with sklearn'), `from sklearn.linear_model import LinearRegression

X_train = train[["temp"]]
y_train = train["cnt"]

model = LinearRegression()
model.fit(X_train, y_train)

print(model.intercept_)
print(model.coef_[0])
print(model.predict([[0.50]])[0])`, loc('这里的 0.50 是归一化温度，不是 0.5°C。', 'Here 0.50 is normalized temperature, not 0.5°C.')),
      output('fit-output', loc('真实运行输出', 'Actual runtime output'), `intercept = 16.610
slope(temp) = 278.863
prediction(temp=0.50) = 156.042`, loc('单行预测可以直接拆成 16.610 + 278.863 × 0.50。斜率为正表示训练期内温度较高通常伴随更高需求。', 'The one-row prediction is 16.610 + 278.863 × 0.50. The positive slope says warmer hours in the training period tend to have higher demand.')),
      formula('fit-formula', loc('预测、斜率与截距', 'Prediction, slope, and intercept'), String.raw`$$\hat y=b+w_{temp}x_{temp}$$`, loc('模型对每个输入只做乘法与加法。改变斜率会旋转直线，改变截距会整体上下平移直线。', 'The model only multiplies and adds. Changing the slope rotates the line; changing the intercept shifts it vertically.'), [
        { symbol: String.raw`$x_{temp}$`, meaning: loc('一个小时的归一化温度', 'normalized temperature for one hour') },
        { symbol: String.raw`$w_{temp}$`, meaning: loc('温度每增加 1 个归一化单位时预测的变化', 'prediction change for one normalized temperature unit') },
        { symbol: String.raw`$b$`, meaning: loc('输入为 0 时直线的基准预测', 'baseline prediction when the input is zero') },
      ]),
      explanation('fit-mistake', commonMistake, loc('相关趋势不是完整解释', 'A trend is not a complete explanation'), loc('不能从正斜率推出“升温造成租车量增加”。季节和年份同时影响温度与需求；当前直线只记录训练数据中的边际关联。', 'A positive slope does not prove that warming causes more rentals. Season and year influence both temperature and demand; this line records only a marginal association.'), 'misconception'),
      lab('fit-lab', loc('直线观察台', 'Line observation lab'), loc('改变样本温度、斜率或截距，观察当前直线、发布直线与单行预测怎样同步变化。', 'Change sample temperature, slope, or intercept and watch the current line, published line, and one-row prediction move together.'), 'fit-line', [
        { id: 'sample-temperature', kind: 'range', label: loc('样本温度', 'Sample temperature'), min: 0.05, max: 0.95, step: 0.05, defaultValue: 0.5 },
        { id: 'slope-multiplier', kind: 'range', label: loc('斜率倍率', 'Slope multiplier'), min: 0.5, max: 1.5, step: 0.1, defaultValue: 1, suffix: loc('×', '×') },
        { id: 'intercept-offset', kind: 'range', label: loc('截距偏移', 'Intercept offset'), min: -100, max: 100, step: 10, defaultValue: 0, suffix: loc(' 辆', ' rentals') },
      ]),
      explanation('fit-conclusion', conclusion, loc('先会读一行预测，再扩大模型', 'Read one prediction before expanding the model'), loc('线性回归首先是一条可拆解的计算规则：输入乘权重，再加截距。它容易解释，但单个温度远不足以描述小时需求。', 'Linear regression is first an inspectable computation: multiply inputs by weights, then add an intercept. It is easy to explain, but temperature alone is far from enough for hourly demand.'), 'conclusion'),
    ],
  },
  multivariate: {
    id: 'multivariate',
    blocks: [
      explanation('multi-question', loc('问题引入', 'Question'), loc('多列数据怎样安全地进入模型？', 'How do multiple columns enter the model safely?'), loc('加入更多字段之前，必须先固定时间切分、目标和禁用字段。否则模型可能看到未来统计量，甚至直接拿到目标答案。', 'Before adding columns, lock the chronological split, target, and forbidden fields. Otherwise the model may see future statistics—or receive the target itself.'), 'question'),
      table('multi-schema', loc('Bike Sharing 核心字段', 'Core Bike Sharing fields'), [loc('字段', 'Field'), loc('含义', 'Meaning'), loc('本课用途', 'Course role')], [
        { id: 'temp', cells: [loc('temp', 'temp'), loc('归一化温度', 'normalized temperature'), loc('正式特征', 'formal feature')] },
        { id: 'hr', cells: [loc('hr', 'hr'), loc('小时 0–23', 'hour 0–23'), loc('数值/周期特征', 'numeric/cyclical feature')] },
        { id: 'cnt', cells: [loc('cnt', 'cnt'), loc('总租车量', 'total rentals'), loc('预测目标', 'prediction target')] },
        { id: 'casual', cells: [loc('casual', 'casual'), loc('临时用户租车量', 'casual rentals'), loc('禁止作为特征', 'forbidden feature')] },
        { id: 'registered', cells: [loc('registered', 'registered'), loc('注册用户租车量', 'registered rentals'), loc('禁止作为特征', 'forbidden feature')] },
      ], loc('`casual + registered = cnt`，所以前两列是目标的组成部分。', '`casual + registered = cnt`, so those two columns are components of the target.')),
      code('multi-split-code', loc('按原始顺序切分 60/20/20', 'Chronological 60/20/20 split'), `train = data.iloc[:10427].copy()
validation = data.iloc[10427:13903].copy()
test = data.iloc[13903:].copy()

assert len(train) == 10427
assert len(validation) == 3476
assert len(test) == 3476
assert train["instant"].max() < validation["instant"].min()
assert validation["instant"].max() < test["instant"].min()`),
      output('multi-split-output', loc('真实运行输出', 'Actual runtime output'), `train      rows=10427  instant=1..10427
validation rows= 3476  instant=10428..13903
test       rows= 3476  instant=13904..17379
overlap = 0`, loc('验证集模拟稍后的时间段，测试集模拟更远的未来。它们不是随机抽样的训练数据。', 'Validation represents a later period and test an even later future. They are not random samples from training.')),
      figure('multi-split-figure', 'split-and-target'),
      figure('multi-relations-figure', 'train-feature-relations'),
      explanation('multi-leakage', loc('数据泄漏', 'Data leakage'), loc('三种“看起来能跑”的错误', 'Three errors that still appear to run'), loc('**目标泄漏：** 把 `casual` 或 `registered` 放入 X，模型几乎直接得到答案。\n\n**预处理泄漏：** 切分前在全量数据上 `fit` scaler，未来时期的均值和方差进入训练规则。\n\n**测试集泄漏：** 反复查看测试 RMSE 并据此增删特征，测试集就变成了隐藏的验证集。', '**Target leakage:** putting `casual` or `registered` into X nearly hands the answer to the model.\n\n**Preprocessing leakage:** fitting a scaler before splitting lets future means and variances shape training.\n\n**Test leakage:** repeatedly checking test RMSE while changing features turns test into a hidden validation set.'), 'leakage'),
      code('multi-matrix-code', loc('建立固定列顺序的设计矩阵', 'Build a design matrix with locked column order'), `features = ["temp", "hum", "windspeed", "workingday", "hr"]
forbidden = {"casual", "registered", "cnt"}

assert not (set(features) & forbidden)
X_train = train.loc[:, features]
y_train = train["cnt"]

print(X_train.shape)
print(X_train.columns.tolist())`),
      output('multi-matrix-output', loc('真实运行输出', 'Actual runtime output'), `(10427, 5)
['temp', 'hum', 'windspeed', 'workingday', 'hr']`, loc('矩阵有 10,427 行、5 列。权重向量必须沿同一列顺序解释。', 'The matrix has 10,427 rows and 5 columns. The weight vector must be interpreted in the same order.')),
      formula('multi-formula', loc('从单行点积到整批矩阵', 'From one dot product to a batch matrix'), String.raw`$$\hat{\mathbf y}=X\mathbf w+b\mathbf 1$$`, loc('X 的每一行是一个小时，每一列是一种特征；矩阵乘法一次产生整批预测。', 'Each row of X is one hour and each column is one feature; matrix multiplication produces the batch of predictions at once.'), [
        { symbol: String.raw`$X$`, meaning: loc('形状为 n×p 的设计矩阵', 'n×p design matrix') },
        { symbol: String.raw`$\mathbf w$`, meaning: loc('p 个特征权重', 'p feature weights') },
        { symbol: String.raw`$\hat{\mathbf y}$`, meaning: loc('n 个预测值', 'n predictions') },
      ]),
      lab('multi-lab', loc('切分与特征观察台', 'Split and feature observation lab'), loc('切换时间分区和特征阶段，核对边界、设计矩阵列顺序以及始终被排除的泄漏字段。', 'Switch the time partition and feature stage to verify boundaries, design-matrix column order, and leakage columns that always remain excluded.'), 'multivariate', [
        { id: 'partition', kind: 'select', label: loc('数据分区', 'Data partition'), defaultValue: 'train', options: [
          { value: 'train', label: loc('训练集', 'Training') },
          { value: 'validation', label: loc('验证集', 'Validation') },
          { value: 'test', label: loc('测试集（指标锁定）', 'Test (metrics locked)') },
        ] },
        { id: 'feature-stage', kind: 'select', label: loc('特征阶段', 'Feature stage'), defaultValue: 'core-five', options: [
          { value: 'temperature-only', label: loc('1 · 温度', '1 · temperature') },
          { value: 'core-five', label: loc('2 · 核心五列', '2 · core five') },
          { value: 'calendar-categories', label: loc('3 · 日历与类别', '3 · calendar and categories') },
          { value: 'calendar-weather-cycle', label: loc('4 · 周期交互', '4 · cyclical interactions') },
        ] },
      ]),
      explanation('multi-conclusion', conclusion, loc('先固定评价协议，再谈模型', 'Lock evaluation before discussing models'), loc('时间切分和防泄漏规则不是数据准备的附属步骤，而是让后续指标可信的前提。', 'Chronological splitting and leakage prevention are not side chores; they are prerequisites for trustworthy metrics.'), 'conclusion'),
    ],
  },
  'residual-loss': {
    id: 'residual-loss',
    blocks: [
      explanation('loss-question', loc('问题引入', 'Question'), loc('一个预测错了多少，整批模型又错了多少？', 'How wrong is one prediction, and how wrong is the whole model?'), loc('残差保留误差方向，损失函数把一组残差压缩成可比较的数值。不同指标强调不同类型的失败。', 'Residuals preserve error direction; loss functions compress many residuals into comparable numbers. Different metrics emphasize different failures.'), 'question'),
      formula('loss-residual-formula', loc('先固定残差方向', 'Fix the residual direction first'), String.raw`$$r_i=\hat y_i-y_i$$`, loc('本课统一使用 prediction − actual：正值表示预测偏高，负值表示预测偏低。', 'This course consistently uses prediction − actual: positive means overprediction, negative means underprediction.'), [
        { symbol: String.raw`$\hat y_i$`, meaning: loc('第 i 行预测', 'prediction for row i') },
        { symbol: String.raw`$y_i$`, meaning: loc('第 i 行实际租车量', 'actual rentals for row i') },
        { symbol: String.raw`$r_i$`, meaning: loc('带方向的预测误差', 'signed prediction error') },
      ]),
      code('loss-code', loc('从残差计算四个回归指标', 'Compute four regression metrics from residuals'), `prediction = model.predict(X_train)
residual = prediction - y_train.to_numpy()

mse = np.mean(residual ** 2)
rmse = np.sqrt(mse)
mae = np.mean(np.abs(residual))
r2 = 1 - np.sum(residual ** 2) / np.sum((y_train - y_train.mean()) ** 2)`),
      output('loss-output', loc('真实运行输出', 'Actual runtime output'), `temperature-only / training
MSE  = 15091.552
RMSE =   122.848
MAE  =    93.477
R²   =     0.170`, loc('RMSE 与 cnt 使用同一单位，更容易回答“典型误差大约是多少辆”；R²=0.170 表示单温度模型只解释了有限变化。', 'RMSE uses the same unit as cnt, so it answers the scale of a typical error. R²=0.170 shows that temperature alone explains limited variation.')),
      figure('loss-figure', 'residual-loss'),
      table('loss-table', loc('四个指标分别在意什么', 'What each metric emphasizes'), [loc('指标', 'Metric'), loc('计算', 'Computation'), loc('阅读方式', 'How to read it')], [
        { id: 'mse', cells: [loc('MSE', 'MSE'), loc('残差平方的平均', 'mean squared residual'), loc('大误差权重很高，单位是 cnt²', 'large errors dominate; unit is cnt²')] },
        { id: 'rmse', cells: [loc('RMSE', 'RMSE'), loc('MSE 开平方', 'square root of MSE'), loc('回到 cnt 单位', 'returns to cnt units')] },
        { id: 'mae', cells: [loc('MAE', 'MAE'), loc('绝对残差的平均', 'mean absolute residual'), loc('对极端误差较温和', 'less dominated by extremes')] },
        { id: 'r2', cells: [loc('R²', 'R²'), loc('与均值基线比较', 'comparison with mean baseline'), loc('越接近 1 越好，也可能为负', 'closer to 1 is better; can be negative')] },
      ], loc('模型选择以验证 RMSE 为主，MAE 与 R²提供补充视角。', 'Model selection uses validation RMSE primarily, with MAE and R² as secondary views.')),
      explanation('loss-tail', loc('图表解读', 'Chart interpretation'), loc('长尾目标让大误差不可忽略', 'A long-tailed target makes large errors matter'), loc('Bike Sharing 的高需求小时较少，却可能产生数百辆的残差。MSE 会显著放大这些失败；MAE 更接近每行等权。没有“永远最好”的指标，只有是否符合当前代价。', 'High-demand Bike Sharing hours are less common but can produce residuals of several hundred rentals. MSE magnifies these failures; MAE is closer to equal row weighting. No metric is universally best—it must match the cost we care about.')),
      explanation('loss-mistake', commonMistake, loc('不要只报一个小数', 'Do not report a number without context'), loc('指标必须同时说明数据分区、目标单位和模型版本。训练 RMSE 不能代替验证 RMSE，MSE 也不能被误读成“平均错了多少辆”。', 'A metric needs its partition, target unit, and model version. Training RMSE cannot replace validation RMSE, and MSE is not the average number of rentals missed.'), 'misconception'),
      lab('loss-lab', loc('残差与指标观察台', 'Residual and metric observation lab'), loc('选择真实训练样本，再拖动明确标注的“教学新增样本”，观察直线重拟合以及 MSE、RMSE、MAE 对大误差的不同响应。', 'Choose a real training sample, then drag the clearly labeled “teaching-added sample” to observe the refitted line and the different responses of MSE, RMSE, and MAE.'), 'residual-loss', [
        { id: 'metric', kind: 'select', label: loc('误差指标', 'Error metric'), defaultValue: 'mse', options: [
          { value: 'mse', label: loc('MSE · 平方误差', 'MSE · squared error') },
          { value: 'rmse', label: loc('RMSE · 均方根误差', 'RMSE · root mean squared error') },
          { value: 'mae', label: loc('MAE · 绝对误差', 'MAE · absolute error') },
        ] },
        { id: 'real-sample', kind: 'select', label: loc('真实样本', 'Real sample'), defaultValue: 'typical', options: [
          { value: 'typical', label: loc('典型训练样本', 'Typical training sample') },
          { value: 'high-demand', label: loc('高需求训练样本', 'High-demand training sample') },
          { value: 'largest-gap', label: loc('大残差训练样本', 'Large-residual training sample') },
        ] },
        { id: 'teaching-point', kind: 'drag-point', label: loc('教学新增样本', 'Teaching-added sample'), defaultValue: { x: 0.5, y: 600 }, xRange: [0, 1], yRange: [0, 1000], step: 5 },
      ]),
      explanation('loss-conclusion', conclusion, loc('残差保留结构，指标负责汇总', 'Residuals preserve structure; metrics summarize'), loc('指标适合比较方案，残差适合发现方案为什么失败。后面的训练和诊断需要同时保留两者。', 'Metrics compare alternatives; residuals reveal why an alternative fails. Training and diagnosis need both.'), 'conclusion'),
    ],
  },
  'training-motion': {
    id: 'training-motion',
    blocks: [
      explanation('training-question', loc('问题引入', 'Question'), loc('模型怎样一步步走到最小损失？', 'How does the model move toward minimum loss?'), loc('本章不用黑箱训练。我们用 NumPy 写出整批梯度下降，再让 sklearn 在同一设计矩阵上给出对照答案。', 'This chapter does not hide training. We write batch gradient descent in NumPy, then ask sklearn for a reference on the exact same design matrix.'), 'question'),
      explanation('training-scale', loc('数据观察', 'Data observation'), loc('先标准化，且只在训练集上 fit', 'Scale first—and fit on training only'), loc('`hr` 的范围是 0–23，而 `temp` 约为 0–1。若直接使用同一学习率，不同列的梯度尺度相差很大。StandardScaler 的均值和标准差只从训练集估计，再原样用于验证集。', '`hr` ranges from 0–23 while `temp` is roughly 0–1. One learning rate then acts on very different gradient scales. StandardScaler estimates means and standard deviations from training only, then applies them unchanged to validation.')),
      code('training-scale-code', loc('训练集拟合预处理', 'Fit preprocessing on training only'), `continuous = ["temp", "hum", "windspeed", "hr"]
scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(train[continuous])
X_validation_scaled = scaler.transform(validation[continuous])

assert scaler.n_samples_seen_ == 10427`),
      code('training-gd-code', loc('NumPy 整批梯度下降', 'NumPy batch gradient descent'), `weights = np.zeros(X_train.shape[1])
intercept = 0.0

for step in range(1500):
    prediction = X_train @ weights + intercept
    residual = prediction - y_train
    grad_w = 2 * X_train.T @ residual / len(X_train)
    grad_b = 2 * residual.mean()
    weights -= 0.1 * grad_w
    intercept -= 0.1 * grad_b
    if np.linalg.norm(np.r_[grad_w, grad_b]) <= 1e-8:
        break`),
      formula('training-gradient-formula', loc('梯度给出最陡上升方向', 'The gradient points uphill'), String.raw`$$\nabla_{\mathbf w}\mathrm{MSE}=\frac{2}{n}X^\top(X\mathbf w+b\mathbf1-\mathbf y)$$`, loc('更新时减去梯度，所以参数朝损失下降方向移动。学习率 η 决定每次跨多远。', 'Updates subtract the gradient, so parameters move downhill. The learning rate η controls the distance of each step.'), [
        { symbol: String.raw`$\eta$`, meaning: loc('学习率，本次固定为 0.1', 'learning rate, fixed here at 0.1') },
        { symbol: String.raw`$\nabla$`, meaning: loc('所有参数偏导数组成的向量', 'vector of partial derivatives for all parameters') },
        { symbol: String.raw`$n$`, meaning: loc('训练行数 10,427', '10,427 training rows') },
      ]),
      output('training-output', loc('真实运行输出', 'Actual runtime output'), `updates = 765
final training MSE = 12080.870645
gradient norm <= 1e-8
max parameter delta vs sklearn = 2.7627e-08`, loc('NumPy 与 sklearn 的参数差约 10⁻⁸，说明实现和收敛条件一致；这不表示线性模型已经足够表达需求。', 'NumPy and sklearn differ by about 10⁻⁸, confirming implementation and convergence agreement. It does not mean the linear model is expressive enough.')),
      figure('training-figure', 'gradient-descent'),
      explanation('training-mistake', commonMistake, loc('loss 不再下降有两种完全不同的原因', 'A flat loss can have two very different causes'), loc('一种是已经接近当前模型空间中的最优点；另一种是学习率过大导致震荡，或过小导致进展缓慢。必须同时查看 loss 与梯度范数，不能只凭曲线外观判断。', 'The model may be near the best point in its current function class, or the learning rate may be causing oscillation or slow progress. Inspect both loss and gradient norm rather than judging by curve shape alone.'), 'misconception'),
      lab('training-lab', loc('学习率观察台', 'Learning-rate observation lab'), loc('选择学习率并拖动更新步数，也可以播放、暂停或单步查看参数路径，区分稳定下降、缓慢下降与发散。', 'Choose a learning rate and scrub the update count, or play, pause, and step through the parameter path to distinguish stable descent, slow descent, and divergence.'), 'training-motion', [
        { id: 'learning-rate', kind: 'select', label: loc('学习率', 'Learning rate'), defaultValue: '0.1', options: [
          { value: '0.01', label: loc('0.01 · 缓慢', '0.01 · slow') },
          { value: '0.1', label: loc('0.1 · 稳定', '0.1 · stable') },
          { value: '0.5', label: loc('0.5 · 可能发散', '0.5 · may diverge') },
        ] },
        { id: 'update', kind: 'range', label: loc('更新步数', 'Update count'), min: 0, max: 1500, step: 1, defaultValue: 0 },
        { id: 'playback', kind: 'playback', label: loc('训练回放', 'Training playback'), defaultValue: 0 },
      ]),
      explanation('training-conclusion', conclusion, loc('预处理和优化属于同一训练协议', 'Preprocessing and optimization share one training protocol'), loc('Scaler 只能从训练集学习；梯度下降必须有明确学习率、停止条件和数值检查；sklearn 对照用于验证实现，而不是替代理解。', 'The scaler learns from training only. Gradient descent needs an explicit rate, stopping rule, and finite-value checks. The sklearn comparison validates implementation rather than replacing understanding.'), 'conclusion'),
    ],
  },
  polynomial: {
    id: 'polynomial',
    blocks: [
      explanation('poly-question', loc('问题引入', 'Question'), loc('线性模型能不能表达弯曲和周期？', 'Can a linear model represent curves and cycles?'), loc('“线性”指模型对参数线性，不要求原始输入只能原样进入。我们可以构造 `temp²`、类别指示列、`sin(hr)` 和 `cos(hr)`，然后仍用线性回归学习这些新列的权重。', '“Linear” means linear in parameters, not that raw inputs must enter unchanged. We can construct `temp²`, category indicators, `sin(hr)`, and `cos(hr)`, then use linear regression to learn weights for those columns.'), 'question'),
      formula('poly-formula', loc('对参数线性，对输入可以非线性', 'Linear in parameters, nonlinear in inputs'), String.raw`$$\hat y=b+w_1x+w_2x^2+w_3\sin(2\pi h/24)+w_4\cos(2\pi h/24)$$`, loc('只要每个 w 都是一阶相加，模型仍是线性回归；非线性来自预先构造的特征。', 'The model remains linear regression because each w is added at first order; nonlinearity comes from engineered features.'), [
        { symbol: String.raw`$x^2$`, meaning: loc('允许温度效应出现弯曲', 'allows curvature in the temperature effect') },
        { symbol: String.raw`$\sin,\cos$`, meaning: loc('把 23 点和 0 点放回相邻位置', 'make hour 23 adjacent to hour 0 again') },
      ]),
      code('poly-code', loc('构造周期与工作日交互', 'Build cyclical and workday-interaction features'), `angle = 2 * np.pi * data["hr"] / 24
data["hour_sin"] = np.sin(angle)
data["hour_cos"] = np.cos(angle)
data["workingday_hour_sin"] = data["workingday"] * data["hour_sin"]
data["workingday_hour_cos"] = data["workingday"] * data["hour_cos"]`),
      figure('poly-hour-figure', 'hour-and-polynomial'),
      output('poly-output', loc('多项式真实运行输出', 'Actual polynomial runtime output'), `degree  train_RMSE  validation_RMSE
1       122.848     219.227
2       122.828     218.901
3       122.808     218.867
5       122.359     219.051
8       122.028     219.046`, loc('次数升高持续改善训练 RMSE，却没有实质改善验证 RMSE。这正是“不预设特征越多越好”的例子。', 'Higher degree keeps improving training RMSE but does not materially improve validation RMSE. This is a concrete example of not assuming more features are better.')),
      figure('poly-stage-figure', 'feature-stages'),
      table('poly-stages-table', loc('特征阶段的验证结果', 'Validation results by feature stage'), [loc('阶段', 'Stage'), loc('主要新增信息', 'Main addition'), loc('验证 RMSE', 'Validation RMSE')], [
        { id: 's1', cells: [loc('1 · temp', '1 · temp'), loc('温度', 'temperature'), loc('219.227', '219.227')] },
        { id: 's2', cells: [loc('2 · 核心五列', '2 · core five'), loc('湿度、风速、工作日、小时', 'humidity, wind, workday, hour'), loc('197.799', '197.799')] },
        { id: 's3', cells: [loc('3 · 类别', '3 · categories'), loc('天气、季节、星期、月份', 'weather, season, weekday, month'), loc('182.321', '182.321')] },
        { id: 's4', cells: [loc('4 · 周期交互', '4 · cyclical interactions'), loc('sin/cos(hour) × workingday', 'sin/cos(hour) × workingday'), loc('166.850', '166.850')] },
      ], loc('阶段 4 获得最低验证 RMSE；后续 atemp 与正则化方案都没有在 1% 规则下胜出。', 'Stage 4 has the lowest validation RMSE; later atemp and regularized variants do not beat it under the 1% simplicity rule.')),
      explanation('poly-mistake', commonMistake, loc('小时不是普通连续直线', 'Hour is not an ordinary straight axis'), loc('把 hr 当作普通数值意味着 23 点与 0 点距离最远，和真实时间周期相反。sin/cos 编码保留周期邻接；工作日交互允许通勤日和休息日形成不同曲线。', 'Treating hr as ordinary numeric makes hour 23 farthest from hour 0, opposite the real cycle. Sin/cos preserves cyclical adjacency; workday interactions allow different commute and leisure curves.'), 'misconception'),
      lab('poly-lab', loc('特征阶段观察台', 'Feature-stage observation lab'), loc('切换预先声明的特征阶段和多项式次数，对照曲线以及训练、验证 RMSE；若差距在 1% 内，保留较简单方案。', 'Switch the predeclared feature stage and polynomial degree, comparing curves and train-validation RMSE; keep the simpler design when results are within 1%.'), 'polynomial', [
        { id: 'feature-stage', kind: 'select', label: loc('特征阶段', 'Feature stage'), defaultValue: 'calendar-weather-cycle', options: [
          { value: 'temperature-only', label: loc('1 · 温度', '1 · temperature') },
          { value: 'core-five', label: loc('2 · 核心五列', '2 · core five') },
          { value: 'calendar-categories', label: loc('3 · 日历与类别', '3 · calendar and categories') },
          { value: 'calendar-weather-cycle', label: loc('4 · 周期交互', '4 · cyclical interactions') },
        ] },
        { id: 'polynomial-degree', kind: 'select', label: loc('温度多项式次数', 'Temperature polynomial degree'), defaultValue: '3', options: [1, 2, 3, 5, 8].map((degree) => ({ value: String(degree), label: loc(`${degree} 次`, `degree ${degree}`) })) },
      ]),
      explanation('poly-conclusion', conclusion, loc('特征工程表达结构，验证集约束想象力', 'Feature engineering adds structure; validation constrains imagination'), loc('周期编码明显改善验证结果，单温度高次多项式没有。每个新增特征都要给出业务含义，并在未触碰测试集时接受验证。', 'Cyclical encoding clearly improves validation while high-degree temperature alone does not. Every new feature needs a meaningful role and validation before test is touched.'), 'conclusion'),
    ],
  },
  'model-limits': {
    id: 'model-limits',
    blocks: [
      explanation('coef-question', loc('问题引入', 'Question'), loc('系数能告诉我们什么，又不能告诉我们什么？', 'What can coefficients tell us—and what can they not?'), loc('系数是预测规则的一部分。解释前必须确认特征是否标准化、类别列以谁为基准，以及其他哪些变量同时进入模型。', 'Coefficients are parts of a prediction rule. Before interpreting them, check scaling, category baselines, and which other variables enter the model.'), 'question'),
      figure('coef-figure', 'coefficients'),
      formula('coef-formula', loc('从标准化系数回到原始单位', 'Return standardized coefficients to raw units'), String.raw`$$w_j^{raw}=w_j^{scaled}/s_j,\quad b^{raw}=b^{scaled}-\sum_jw_j^{scaled}\mu_j/s_j$$`, loc('连续变量除以训练标准差后进入模型，所以模型空间系数对应“一标准差变化”；换回原始单位需要除以 scale，并同步调整截距。', 'Continuous variables enter after division by the training standard deviation, so model-space coefficients represent one-standard-deviation changes. Raw-unit conversion divides by scale and adjusts the intercept.'), [
        { symbol: String.raw`$\mu_j$`, meaning: loc('训练集第 j 列均值', 'training mean of feature j') },
        { symbol: String.raw`$s_j$`, meaning: loc('训练集第 j 列标准差', 'training standard deviation of feature j') },
      ]),
      code('coef-code', loc('读取预处理后的特征名与系数', 'Read transformed feature names and coefficients'), `feature_names = pipeline.named_steps["preprocess"].get_feature_names_out()
coefficients = pipeline.named_steps["model"].coef_

coefficient_table = pd.DataFrame({
    "feature": feature_names,
    "coefficient": coefficients,
}).sort_values("coefficient", key=np.abs, ascending=False)`),
      output('coef-output', loc('真实运行输出（绝对值较大的部分）', 'Actual runtime output (larger absolute values)'), `yr             +76.593
mnth_5         +75.880
hour_cos       -66.098
mnth_6         +62.584
hour_sin       -59.706
weathersit_3   -54.580`, loc('连续列经过标准化，类别列是相对被删去基准类别的差异，因此这些数值不能直接跨编码方式比较。', 'Continuous columns are standardized and categorical columns are differences from omitted baselines, so these values cannot be compared without considering encoding.')),
      table('coef-contrast-table', loc('边际关系、条件系数与因果效应', 'Marginal relation, conditional coefficient, and causal effect'), [loc('概念', 'Concept'), loc('本课能否得到', 'Available here?'), loc('含义', 'Meaning')], [
        { id: 'marginal', cells: [loc('边际关系', 'Marginal relation'), loc('可以', 'Yes'), loc('单独看 temp 与 cnt 的总体趋势', 'overall temp-cnt trend alone')] },
        { id: 'conditional', cells: [loc('条件系数', 'Conditional coefficient'), loc('可以', 'Yes'), loc('保持其他入模特征不变时的预测关联', 'predictive association holding modeled features fixed')] },
        { id: 'causal', cells: [loc('因果效应', 'Causal effect'), loc('不可以', 'No'), loc('需要额外识别假设或实验设计', 'requires identification assumptions or experimental design')] },
      ], loc('预测模型的可解释性不等于因果识别。', 'Predictive interpretability is not causal identification.')),
      explanation('coef-mistake', commonMistake, loc('“保持其他变量不变”未必现实', '“Holding everything else fixed” may be unrealistic'), loc('天气、温度、体感温度和季节共同变化。条件系数只是在当前设计矩阵中做局部账本，不保证现实世界可以独立改变一个变量。', 'Weather, temperature, apparent temperature, and season co-move. A conditional coefficient is bookkeeping inside the current design matrix; it does not guarantee that one variable can change independently in reality.'), 'misconception'),
      lab('coef-lab', loc('系数空间观察台', 'Coefficient-space observation lab'), loc('选择特征和系数空间，再改变该特征的观察值；图中始终把结果表述为条件关联，而不是因果效应。', 'Choose a feature and coefficient space, then change the observed feature value; the chart always describes a conditional association, not a causal effect.'), 'model-limits', [
        { id: 'coefficient-space', kind: 'select', label: loc('系数空间', 'Coefficient space'), defaultValue: 'modelSpace', options: [
          { value: 'modelSpace', label: loc('模型空间', 'Model space') },
          { value: 'rawContinuousUnits', label: loc('原始连续单位', 'Raw continuous units') },
        ] },
        { id: 'feature', kind: 'select', label: loc('特征', 'Feature'), defaultValue: 'temp', options: [
          { value: 'temp', label: loc('温度 temp', 'Temperature temp') },
          { value: 'hum', label: loc('湿度 hum', 'Humidity hum') },
          { value: 'windspeed', label: loc('风速 windspeed', 'Windspeed') },
        ] },
        { id: 'feature-value', kind: 'range', label: loc('特征变化', 'Feature change'), min: -2, max: 2, step: 0.1, defaultValue: 0, suffix: loc('σ', 'σ') },
      ]),
      explanation('coef-conclusion', conclusion, loc('系数是模型语言，不是自然定律', 'Coefficients are model language, not natural law'), loc('解释系数必须绑定训练数据、预处理和共同入模变量。它能帮助检查预测规则，但不能独自回答因果问题。', 'Coefficient interpretation is bound to training data, preprocessing, and co-modeled variables. It helps inspect the prediction rule but cannot answer causal questions alone.'), 'conclusion'),
    ],
  },
  overfitting: {
    id: 'overfitting',
    blocks: [
      explanation('diag-question', loc('问题引入', 'Question'), loc('低训练误差为什么还不够？', 'Why is low training error not enough?'), loc('模型可能记住训练细节，也可能结构过于简单。我们用训练/验证误差和残差形状区分欠拟合、过拟合与数据时期变化。', 'A model may memorize training details or be structurally too simple. We use train-validation error and residual patterns to distinguish underfitting, overfitting, and period shift.'), 'question'),
      table('diag-patterns', loc('先看训练—验证组合', 'Read train and validation together'), [loc('现象', 'Pattern'), loc('可能解释', 'Possible interpretation'), loc('下一步', 'Next step')], [
        { id: 'under', cells: [loc('训练和验证都差', 'both poor'), loc('欠拟合或特征不足', 'underfitting or weak features'), loc('增加有含义的结构', 'add meaningful structure')] },
        { id: 'over', cells: [loc('训练很好、验证明显差', 'great train, much worse validation'), loc('过拟合', 'overfitting'), loc('降低复杂度或正则化', 'reduce complexity or regularize')] },
        { id: 'shift', cells: [loc('验证整体偏移', 'validation shifts overall'), loc('时间分布变化', 'temporal distribution shift'), loc('检查时期与漂移', 'inspect periods and drift')] },
      ], loc('单个指标不足以区分这些机制，必须继续看残差。', 'One metric cannot distinguish these mechanisms; residuals are the next step.')),
      code('diag-code', loc('在验证集绘制三类诊断', 'Create three validation diagnostics'), `validation_prediction = pipeline.predict(X_validation)
diagnostics = pd.DataFrame({
    "actual": y_validation,
    "prediction": validation_prediction,
    "residual": validation_prediction - y_validation,
    "hour": validation["hr"],
})

hourly_residual = diagnostics.groupby("hour")["residual"].agg(["mean", "median"])`),
      output('diag-output', loc('真实运行输出', 'Actual runtime output'), `selected stage: calendar-weather-cycle
train RMSE      95.337
validation RMSE 166.850
validation MAE  127.004
validation R²     0.401`, loc('验证误差明显高于训练误差，同时验证期目标水平更高。差距既包含泛化困难，也包含时间分布变化，不能简单归因于“训练轮数不够”。', 'Validation error is much higher while the later period also has greater demand. The gap combines generalization difficulty and temporal shift; it cannot be reduced to “not enough epochs.”')),
      figure('diag-figure', 'validation-diagnostics'),
      table('diag-cases', loc('具名失败案例', 'Named failure cases'), [loc('案例', 'Case'), loc('实际', 'Actual'), loc('预测', 'Prediction'), loc('残差', 'Residual')], [
        { id: 'neg', cells: [loc('03:00 负预测', '03:00 negative prediction'), loc('18', '18'), loc('−7.47', '−7.47'), loc('−25.47', '−25.47')] },
        { id: 'morning', cells: [loc('08:00 早高峰低估', '08:00 morning peak'), loc('788', '788'), loc('240.72', '240.72'), loc('−547.28', '−547.28')] },
        { id: 'evening', cells: [loc('17:00 晚高峰低估', '17:00 evening peak'), loc('957', '957'), loc('319.95', '319.95'), loc('−637.05', '−637.05')] },
      ], loc('残差定义为 prediction − actual，所以负值表示低估。', 'Residual is prediction − actual, so negative means underprediction.')),
      explanation('diag-reading', loc('图表解读', 'Chart interpretation'), loc('残差不是随机云团', 'Residuals are not a random cloud'), loc('高预测区间残差扩散，高峰时段平均残差明显为负。模型缺少更灵活的时段结构和需求上限约束；负预测也暴露了普通线性回归输出无边界。', 'Residual spread widens at high fitted values and peak-hour mean residuals are strongly negative. The model lacks flexible time structure and output constraints; negative predictions also expose the unbounded linear output.')),
      explanation('diag-mistake', commonMistake, loc('不要在测试集上反复诊断和改模型', 'Do not repeatedly diagnose and revise on test'), loc('本章的选择与诊断都使用验证集。测试集保留到下一章方案冻结后只评价一次，否则最终分数会乐观偏置。', 'Selection and diagnosis here use validation only. Test remains sealed until the next chapter freezes the design and evaluates once; otherwise the final score becomes optimistically biased.'), 'misconception'),
      lab('diag-lab', loc('诊断维度观察台', 'Diagnostic-view observation lab'), loc('切换复杂度、残差结构和具名案例视图，再选择模型阶段或失败案例；每次只回答一个诊断问题。', 'Switch among complexity, residual structure, and named-case views, then choose a model stage or failure case; answer one diagnostic question at a time.'), 'overfitting', [
        { id: 'diagnostic-view', kind: 'select', label: loc('诊断维度', 'Diagnostic view'), defaultValue: 'prediction-actual', options: [
          { value: 'complexity', label: loc('训练—验证误差', 'Train-validation error') },
          { value: 'prediction-actual', label: loc('预测值—实际值', 'Prediction vs actual') },
          { value: 'residual-fitted', label: loc('残差—拟合值', 'Residual vs fitted') },
          { value: 'hourly-residual', label: loc('分时段残差', 'Residual by hour') },
          { value: 'named-case', label: loc('具名失败案例', 'Named failure case') },
        ] },
        { id: 'model-complexity', kind: 'select', label: loc('模型复杂度', 'Model complexity'), defaultValue: 'calendar-weather-cycle', options: [
          { value: 'temperature-only', label: loc('温度单特征', 'Temperature only') },
          { value: 'core-five', label: loc('核心五特征', 'Core five') },
          { value: 'calendar-categories', label: loc('日历与类别', 'Calendar and categories') },
          { value: 'calendar-weather-cycle', label: loc('周期交互', 'Cyclical interactions') },
        ] },
        { id: 'named-case', kind: 'select', label: loc('具名案例', 'Named case'), defaultValue: 'morning-peak-underprediction', options: [
          { value: 'negative-prediction', label: loc('凌晨负预测', 'Nighttime negative prediction') },
          { value: 'morning-peak-underprediction', label: loc('早高峰低估', 'Morning peak underprediction') },
          { value: 'evening-peak-underprediction', label: loc('晚高峰低估', 'Evening peak underprediction') },
          { value: 'large-residual', label: loc('最大残差案例', 'Largest residual case') },
        ] },
      ]),
      explanation('diag-conclusion', conclusion, loc('残差结构比“再训练几轮”更有信息', 'Residual structure is more informative than “train longer”'), loc('优化已经收敛，剩余问题主要来自模型表达与时期变化。下一步是用正则化检查不稳定系数，并冻结最终方案。', 'Optimization has converged; remaining problems mainly reflect model capacity and period shift. Next we use regularization to inspect unstable coefficients and freeze the final design.'), 'conclusion'),
    ],
  },
  regularization: {
    id: 'regularization',
    blocks: [
      explanation('reg-question', loc('问题引入', 'Question'), loc('高度相关的特征会怎样影响系数？', 'How do highly correlated features affect coefficients?'), loc('`temp` 与 `atemp` 都表达温度，训练集相关系数达到 0.992。它们一起进入模型时，预测信息高度重复，OLS 系数可能在两列之间不稳定分配。', '`temp` and `atemp` both express temperature, with training correlation 0.992. When both enter, their predictive information is nearly duplicated and OLS may allocate coefficients unstably between them.'), 'question'),
      figure('reg-figure', 'regularization'),
      formula('reg-formula', loc('Ridge 与 Lasso 的目标', 'Ridge and Lasso objectives'), String.raw`$$\min_{w,b}\frac1n\lVert Xw+b\mathbf1-y\rVert_2^2+\lambda\lVert w\rVert_q$$`, loc('Ridge 使用 q=2，让系数平滑收缩；Lasso 使用 q=1，可能把部分系数压到恰好为 0。截距通常不参与惩罚。', 'Ridge uses q=2 for smooth shrinkage; Lasso uses q=1 and can drive some coefficients exactly to zero. The intercept is usually not penalized.'), [
        { symbol: String.raw`$\lambda$`, meaning: loc('正则强度；越大越偏好小系数', 'regularization strength; larger values prefer smaller coefficients') },
        { symbol: String.raw`$q=2$`, meaning: loc('Ridge 的平方范数', 'Ridge squared norm') },
        { symbol: String.raw`$q=1$`, meaning: loc('Lasso 的绝对值范数', 'Lasso absolute-value norm') },
      ]),
      code('reg-code', loc('只在正则化诊断中加入 atemp', 'Add atemp only for regularization diagnosis'), `ridge = Pipeline([
    ("preprocess", train_fitted_preprocessor),
    ("model", Ridge(alpha=10.0)),
])
ridge.fit(train[features_with_atemp], train["cnt"])

validation_prediction = ridge.predict(validation[features_with_atemp])
validation_rmse = mean_squared_error(
    validation["cnt"], validation_prediction
) ** 0.5`),
      output('reg-output', loc('真实运行输出', 'Actual runtime output'), `calendar-weather-cycle OLS   validation RMSE = 166.850
Ridge + atemp (alpha=10)     validation RMSE = 167.036
Lasso + atemp (alpha=1)      validation RMSE = 173.120

1% simplicity threshold = 168.519
selected = calendar-weather-cycle OLS`, loc('Ridge 与最优结果差距不到 1%，但它更复杂且没有改善 RMSE，因此按预先规则保留不含 atemp 的简单 OLS。', 'Ridge is within 1% of the best result, but it is more complex and does not improve RMSE, so the predeclared rule keeps the simpler OLS without atemp.')),
      explanation('reg-freeze', loc('最终流程', 'Final workflow'), loc('冻结后才打开测试集', 'Open test only after freezing'), loc('特征阶段与正则化方案确定后，把训练集和验证集合并为 13,903 行，重新拟合全部预处理和最终模型。随后在测试集 3,476 行上只调用一次评价，不再根据测试结果调整特征。', 'After freezing features and regularization, combine train and validation into 13,903 rows and refit all preprocessing and the final model. Then evaluate once on 3,476 test rows without revising features from the result.')),
      code('reg-final-code', loc('合并开发集并完成一次测试评价', 'Refit on development data and evaluate test once'), `development = pd.concat([train, validation], ignore_index=True)
final_pipeline.fit(development[final_features], development["cnt"])

test_prediction = final_pipeline.predict(test[final_features])
test_metrics = {
    "rmse": mean_squared_error(test["cnt"], test_prediction) ** 0.5,
    "mae": mean_absolute_error(test["cnt"], test_prediction),
    "r2": r2_score(test["cnt"], test_prediction),
}`),
      output('reg-final-output', loc('最终测试运行输出', 'Final test runtime output'), `refit rows = 13903
test rows  = 3476
RMSE = 163.111
MAE  = 120.989
R²   = 0.453
test evaluation count = 1`, loc('这个分数描述冻结线性方案面对更晚时间段的表现。它没有消除高峰低估和负预测等结构限制。', 'This score describes the frozen linear design on a later period. It does not remove structural limits such as peak underprediction and negative outputs.')),
      figure('reg-final-figure', 'final-test'),
      explanation('reg-mistake', commonMistake, loc('正则化不是自动提分按钮', 'Regularization is not an automatic score booster'), loc('它的主要价值是控制复杂度、改善系数稳定性。若验证结果没有改善，应如实保留简单模型，而不是为了使用 Ridge 或 Lasso 强行宣布成功。', 'Its main value is controlling complexity and improving coefficient stability. If validation does not improve, keep the simpler model rather than forcing a Ridge or Lasso success story.'), 'misconception'),
      lab('reg-lab', loc('正则化观察台', 'Regularization observation lab'), loc('切换 OLS、Ridge、Lasso 和正则强度，或沿路径播放、暂停、单步观察 `temp` 与 `atemp` 系数如何收缩，并始终对照验证 RMSE。', 'Switch among OLS, Ridge, and Lasso and adjust regularization, or play, pause, and step along the path to observe how `temp` and `atemp` coefficients shrink while always checking validation RMSE.'), 'regularization', [
        { id: 'model-type', kind: 'select', label: loc('模型类型', 'Model type'), defaultValue: 'ridge', options: [
          { value: 'ols', label: loc('OLS · 不正则化', 'OLS · unregularized') },
          { value: 'ridge', label: loc('Ridge · L2', 'Ridge · L2') },
          { value: 'lasso', label: loc('Lasso · L1', 'Lasso · L1') },
        ] },
        { id: 'alpha', kind: 'select', label: loc('正则强度 α', 'Regularization strength α'), defaultValue: '10', options: ['0.01', '0.1', '1', '10', '100', '1000', '10000'].map((alpha) => ({ value: alpha, label: loc(`α = ${alpha}`, `α = ${alpha}`) })) },
        { id: 'playback', kind: 'playback', label: loc('系数路径回放', 'Coefficient-path playback'), defaultValue: 0 },
      ]),
      explanation('reg-conclusion', conclusion, loc('完成一次诚实、可复现的线性回归流程', 'Complete one honest, reproducible linear-regression workflow'), loc('八章从单行预测走到时间切分、损失、优化、特征工程、系数边界、残差诊断和最终评价。最重要的结果不是某个分数，而是每一步都能由同一份数据、代码和 Notebook 重新得到。', 'The eight chapters move from one-row prediction through chronological splitting, loss, optimization, feature engineering, coefficient limits, residual diagnosis, and final evaluation. The most important result is not one score, but that every step can be reproduced from the same data, code, and notebooks.'), 'conclusion'),
    ],
    references: [
      { label: loc('UCI Bike Sharing Dataset', 'UCI Bike Sharing Dataset'), href: 'https://archive.ics.uci.edu/dataset/275/bike%2Bsharing%2Bdataset', note: loc('数据集与数据论文，CC BY 4.0。', 'Dataset and paper, CC BY 4.0.') },
      { label: loc('Dive into Deep Learning：Linear Regression', 'Dive into Deep Learning: Linear Regression'), href: 'https://d2l.ai/chapter_linear-regression/linear-regression.html', note: loc('参考概念组织与教学顺序。', 'Conceptual organization and teaching sequence.') },
      { label: loc('Stanford CS229 Linear Regression Notes', 'Stanford CS229 Linear Regression Notes'), href: 'https://cs229.stanford.edu/summer2019/cs229-notes1.pdf', note: loc('最小二乘与梯度推导。', 'Least squares and gradient derivation.') },
      { label: loc('scikit-learn Linear Models', 'scikit-learn Linear Models'), href: 'https://scikit-learn.org/stable/modules/linear_model.html', note: loc('线性模型、Ridge 与 Lasso。', 'Linear models, Ridge, and Lasso.') },
      { label: loc('scikit-learn Common Pitfalls', 'scikit-learn Common Pitfalls'), href: 'https://scikit-learn.org/stable/common_pitfalls.html', note: loc('预处理一致性与数据泄漏。', 'Consistent preprocessing and data leakage.') },
      { label: loc('NIST Residual Analysis', 'NIST Residual Analysis'), href: 'https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd44.htm', note: loc('残差图的诊断思路。', 'Diagnostic reasoning with residual plots.') },
    ],
    downloads: [
      { label: loc('中文已执行 Notebook', 'Executed Chinese notebook'), publicPath: '/linear-regression/phase-27a/bike-linear-regression-course.zh-CN.ipynb', kind: 'notebook' },
      { label: loc('英文已执行 Notebook', 'Executed English notebook'), publicPath: '/linear-regression/phase-27a/bike-linear-regression-course.en.ipynb', kind: 'notebook' },
      { label: loc('Bike Sharing 原始 CSV', 'Bike Sharing source CSV'), publicPath: '/datasets/python-data-tools/bike-sharing-hour.csv', kind: 'dataset' },
      { label: loc('特征阶段指标 CSV', 'Feature-stage metrics CSV'), publicPath: '/linear-regression/phase-27a/feature-stage-metrics.csv', kind: 'csv' },
      { label: loc('梯度下降轨迹 CSV', 'Gradient-descent trace CSV'), publicPath: '/linear-regression/phase-27a/gradient-descent-trace.csv', kind: 'csv' },
      { label: loc('测试残差 CSV', 'Test residuals CSV'), publicPath: '/linear-regression/phase-27a/test-residuals.csv', kind: 'csv' },
      { label: loc('v2 结果摘要 JSON', 'v2 result summary JSON'), publicPath: '/linear-regression/phase-27a/linear-regression-course-summary.json', kind: 'json' },
      { label: loc('完整资产清单', 'Complete asset manifest'), publicPath: '/linear-regression/phase-27a/output-manifest.json', kind: 'json' },
      { label: loc('原 Phase 27 Notebook（兼容下载）', 'Original Phase 27 notebook (compatibility download)'), publicPath: '/notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb', kind: 'notebook' },
    ],
  },
}

export function linearRegressionLessonFor(chapterId: string): LinearRegressionChapterLesson {
  return linearRegressionLessons[chapterId] ?? linearRegressionLessons['fit-line']!
}
