import type { AlgorithmModuleDefinition, LocalizedCopy } from '../types/ml.ts'
import { simulateLinearRegression } from '../simulations/linearRegression.ts'
import { algorithmCheckpointsBySlug } from './algorithmCheckpoints.ts'
import {
  linearRegressionChapterAssets,
  type LinearRegressionChapterId,
} from './linearRegressionAssets.ts'

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

interface LinearRegressionTeachingFrame {
  coreQuestion: LocalizedCopy
  concept: LocalizedCopy
  workedExample: LocalizedCopy
  formula: LocalizedCopy
  commonMistake: LocalizedCopy
  visualAnimation: LocalizedCopy
  experimentDesign: LocalizedCopy
  sourceReference: LocalizedCopy
}

export const linearRegressionChapterContentBindings = linearRegressionChapterAssets

function withTeachingFrame(base: LocalizedCopy, _frame: LinearRegressionTeachingFrame): LocalizedCopy {
  // Phase 27A renders the dedicated typed lesson blocks. Keep the legacy chapter
  // markdown unchanged for route/checkpoint compatibility without appending the
  // repeated planning template to learner-facing content.
  return base
}

const linearRegressionTeachingFrames: Record<
  LinearRegressionChapterId,
  LinearRegressionTeachingFrame
> = {
  'fit-line': {
    coreQuestion: loc(
      '怎样用五个已知字段回答“这个小时会租出多少辆车”，同时不偷看目标答案？',
      'How can five known fields answer “how many bikes will be rented this hour” without leaking the target?',
    ),
    concept: loc(
      '每一行先成为按固定顺序排列的特征向量，再由同一组权重和截距生成预测。目标 cnt 保留“租车次数”这个真实单位。',
      'Each row first becomes a feature vector in a fixed order, then the same weights and intercept produce a prediction. The cnt target stays in real rental-count units.',
    ),
    workedExample: loc(
      '代表训练行 instant=11550 先按 temp、hum、windspeed、workingday、hr 排列。把该行代入 xᵀw+b 得到一项预测；页面数值来自绑定结果，不在正文复制第二份完整精度。',
      'Representative training row instant=11550 is ordered as temp, hum, windspeed, workingday, hr. Substituting it into xᵀw+b gives one prediction; page values come from the bound result rather than a second full-precision copy in prose.',
    ),
    formula: loc(
      '$$\\hat y_i=x_i^\\top w+b$$\n\n$x_i$ 是第 i 行五维输入，$w$ 是同序权重，$b$ 是截距，$\\hat y_i$ 是 cnt 预测。',
      '$$\\hat y_i=x_i^\\top w+b$$\n\n$x_i$ is the five-feature row, $w$ follows the same order, $b$ is the intercept, and $\\hat y_i$ predicts cnt.',
    ),
    commonMistake: loc(
      'casual 和 registered 不能作为输入：casual + registered = cnt，加入它们等于把答案拆开后交给模型。',
      'casual and registered cannot be inputs: casual + registered = cnt, so including them hands the target to the model in two pieces.',
    ),
    visualAnimation: loc(
      '本章只需要一行字段到点积的静态顺序图；动画不是理解公式的前提。',
      'This chapter needs only a static row-to-dot-product order diagram; animation is not required to understand the formula.',
    ),
    experimentDesign: loc(
      '先预测符号与大致范围，再查看代表行结果，解释每个字段如何进入同一个点积。',
      'Predict the sign and rough range first, then reveal the representative-row result and explain how each field enters one dot product.',
    ),
    sourceReference: loc(
      '本地 UCI Bike Sharing 快照、数据字典、D2L 线性回归与站内损失函数章节。',
      'Local UCI Bike Sharing snapshot and dictionary, D2L linear regression, and the site Loss Functions lesson.',
    ),
  },
  multivariate: {
    coreQuestion: loc(
      '一行预测怎样推广为整批矩阵预测，同时保持切分和预处理不泄漏？',
      'How does one-row prediction become a batch matrix prediction without split or preprocessing leakage?',
    ),
    concept: loc(
      '先按时间切分，再只用训练集拟合连续特征的均值和尺度；workingday 保持 0/1。每种拟合方法接收同一设计矩阵。',
      'Split chronologically first, fit continuous-feature means and scales on training data only, and keep workingday as 0/1. Every fitting method receives the same design matrix.',
    ),
    workedExample: loc(
      '17,379 行按原顺序取前 80% 训练、后 20% 留出。代表行与整批都使用 temp、hum、windspeed、workingday、hr 这一唯一顺序。',
      'The 17,379 rows keep their order: first 80% for training and final 20% held out. Both the representative row and the batch use the single order temp, hum, windspeed, workingday, hr.',
    ),
    formula: loc(
      '$$\\hat y=Xw+b\\mathbf 1$$\n\nX 的每一列与 w 的同一位置一一对应。',
      '$$\\hat y=Xw+b\\mathbf 1$$\n\nEach column of X corresponds to the same position in w.',
    ),
    commonMistake: loc(
      '不能先对全体数据 fit scaler 再切分；那会让留出期的统计量参与训练规则。',
      'Do not fit the scaler on all data before splitting; that lets held-out-period statistics shape the training rule.',
    ),
    visualAnimation: loc(
      '矩阵示意图用文字和列标签固定顺序，颜色仅作为辅助，不承担唯一含义。',
      'The matrix diagram locks order with text and column labels; color is supporting information, not the only signal.',
    ),
    experimentDesign: loc(
      '尝试调换两列并解释为什么宽度仍正确却语义已经错误，再重置到固定顺序。',
      'Imagine swapping two columns and explain why the width still looks valid while the semantics are wrong, then reset to the fixed order.',
    ),
    sourceReference: loc(
      '本地固定时间切分、scikit-learn StandardScaler 训练集拟合约定与 CS357 设计矩阵。',
      'Local locked chronological split, scikit-learn train-only StandardScaler convention, and CS357 design matrices.',
    ),
  },
  'residual-loss': {
    coreQuestion: loc(
      '一个样本的预测偏差怎样汇总成整批 MSE 和参数梯度？',
      'How does one sample’s prediction miss aggregate into batch MSE and parameter gradients?',
    ),
    concept: loc(
      '统一使用 residual = prediction - actual。单行先给出损失与梯度贡献，整批再取平均。',
      'Use residual = prediction - actual everywhere. Derive one-row loss and gradient contributions first, then average over the batch.',
    ),
    workedExample: loc(
      '若一行残差 r_i 为正，预测偏高；它对 MSE 的贡献是 r_i²，对权重未平均的贡献是 2r_i x_i，对截距是 2r_i。',
      'If one residual r_i is positive, the prediction is high. It contributes r_i² to MSE, 2r_i x_i to the unaveraged weight gradient, and 2r_i to the intercept gradient.',
    ),
    formula: loc(
      '$$r=\\hat y-y,\\quad \\mathrm{MSE}=r^\\top r/n,\\quad \\nabla_w=2X^\\top r/n,\\quad \\partial_b=2\\mathbf1^\\top r/n$$',
      '$$r=\\hat y-y,\\quad \\mathrm{MSE}=r^\\top r/n,\\quad \\nabla_w=2X^\\top r/n,\\quad \\partial_b=2\\mathbf1^\\top r/n$$',
    ),
    commonMistake: loc(
      '不要在某一章把残差改写成 actual - prediction；符号翻转会同时翻转梯度。',
      'Do not silently switch residuals to actual - prediction in another chapter; that flips the gradient too.',
    ),
    visualAnimation: loc(
      '残差段同时带“预测偏高/偏低”文字与正负号，避免只靠颜色判断。',
      'Residual segments carry high/low text and signs so meaning never depends on color alone.',
    ),
    experimentDesign: loc(
      '先判断代表行残差正负，再展开 r_i²、2r_i x_i 与整批平均的关系。',
      'Predict the representative residual sign, then expand the connection among r_i², 2r_i x_i, and the batch average.',
    ),
    sourceReference: loc(
      '站内损失函数章节、Phase 27 纯数学测试和 scikit-learn 回归指标。',
      'The site Loss Functions lesson, Phase 27 pure-math tests, and scikit-learn regression metrics.',
    ),
  },
  'training-motion': {
    coreQuestion: loc(
      'NumPy 批量梯度下降怎样从零初始化走到稳定解，并知道何时停止？',
      'How does NumPy batch gradient descent move from zero initialization to a stable fit and know when to stop?',
    ),
    concept: loc(
      '每次更新都使用整批 X 与 y；轨迹同时记录 MSE、梯度范数和有限性。停止条件属于算法定义，不靠“看起来平了”。',
      'Every update uses the full X and y batch. The trace records MSE, gradient norm, and finiteness; stopping is an algorithm contract, not a visual guess.',
    ),
    workedExample: loc(
      '一次更新先计算 predictions、residuals、grad_w 和 grad_b，再按 learning_rate 同时更新 w 与 b。参考输出绑定保存完整轨迹。',
      'One update computes predictions, residuals, grad_w, and grad_b before learning_rate updates w and b together. The bound reference output stores the complete trace.',
    ),
    formula: loc(
      '$$w_{t+1}=w_t-\\eta\\nabla_w,\\qquad b_{t+1}=b_t-\\eta\\partial_b$$',
      '$$w_{t+1}=w_t-\\eta\\nabla_w,\\qquad b_{t+1}=b_t-\\eta\\partial_b$$',
    ),
    commonMistake: loc(
      '三种方法系数接近只能说明实现与优化完成度一致，不能证明线性模型足够表达 Bike 需求。',
      'Three methods agreeing shows implementation and optimization agreement, not that a linear model adequately represents Bike demand.',
    ),
    visualAnimation: loc(
      '轨迹图用更新编号、MSE 与 gradient_norm 数字标签承载信息；reduced motion 下仍可逐行阅读。',
      'The trace carries update number, MSE, and gradient_norm as text; reduced-motion mode remains fully readable row by row.',
    ),
    experimentDesign: loc(
      '先预测加大学习率会更快还是震荡，再运行浏览器中的有界回放并与固定完整轨迹区分。',
      'Predict whether a larger learning rate will move faster or oscillate, then run the bounded browser replay while keeping it distinct from the locked full trace.',
    ),
    sourceReference: loc(
      'NumPy 向量运算、站内梯度下降章节与锁定 Notebook 轨迹。',
      'NumPy vector operations, the site Gradient Descent lesson, and the locked Notebook trace.',
    ),
  },
  polynomial: {
    coreQuestion: loc(
      '同一切分、同一设计矩阵下，梯度下降、正规方程参考和 sklearn 是否得到同一个 OLS 解？',
      'On the same split and design matrix, do gradient descent, the normal-equation reference, and sklearn reach the same OLS solution?',
    ),
    concept: loc(
      '正规方程描述非迭代参考关系；可执行代码用 lstsq 直接解最小二乘，不显式形成可能不稳定的逆矩阵。',
      'The normal equation states a non-iterative reference relation; executable code uses lstsq to solve least squares directly instead of forming a potentially unstable inverse.',
    ),
    workedExample: loc(
      '先给 X 增加一列 1 得到 X_tilde。解出的 theta[0] 是 b，theta[1:] 是 w；随后在完全相同数据上比较三种 OLS 方法。',
      'Add a column of ones to X to form X_tilde. The solution maps theta[0] to b and theta[1:] to w, then all three OLS methods are compared on identical data.',
    ),
    formula: loc(
      'X_tilde = [1, X]\n\ntheta = (X_tilde^T X_tilde)^+ X_tilde^T y\n\ntheta[0] = b，theta[1:] = w',
      'X_tilde = [1, X]\n\ntheta = (X_tilde^T X_tilde)^+ X_tilde^T y\n\ntheta[0] = b and theta[1:] = w',
    ),
    commonMistake: loc(
      '不要把公式中的伪逆写成运行时显式求逆；np.linalg.lstsq 更稳定，还能报告 rank 与 singular_values。',
      'Do not turn the pseudoinverse notation into an explicit runtime inverse; np.linalg.lstsq is more stable and also reports rank and singular_values.',
    ),
    visualAnimation: loc(
      '三方法对照以方法名、最大参数差和指标差呈现；形状与文字同时区分，不只使用颜色。',
      'The three-method comparison shows method names, maximum parameter deltas, and metric deltas; shapes and text supplement color.',
    ),
    experimentDesign: loc(
      '先判断三种 OLS 方法应不应该一致，再把同一 Bike 案例的 hr 多项式扩展作为简短容量观察。',
      'First decide whether the three OLS methods should agree, then use an hr polynomial extension of the same Bike case as a concise capacity observation.',
    ),
    sourceReference: loc(
      'NumPy lstsq、scikit-learn LinearRegression、CS357 最小二乘与锁定双语 Notebook。',
      'NumPy lstsq, scikit-learn LinearRegression, CS357 least squares, and the locked bilingual Notebooks.',
    ),
  },
  'model-limits': {
    coreQuestion: loc(
      '标准化空间里的系数怎样翻译回原始单位，又怎样避免把关联说成因果？',
      'How do standardized-space coefficients translate back to original units without turning association into causation?',
    ),
    concept: loc(
      '模型空间系数适合比较同一预处理后的参数；原始单位系数回答输入增加一个原始单位时预测怎样变化。',
      'Model-space coefficients describe the fitted transformed design; original-unit coefficients describe prediction change per original input unit.',
    ),
    workedExample: loc(
      '连续特征满足 x_scaled=(x-mean)/scale，因此 w_original=w_model/scale；截距还要扣除各列均值带来的平移。',
      'For continuous features x_scaled=(x-mean)/scale, so w_original=w_model/scale; the intercept also subtracts the shifts introduced by feature means.',
    ),
    formula: loc(
      '$$w_j^{raw}=w_j^{model}/s_j,\\qquad b^{raw}=b^{model}-\\sum_j w_j^{model}\\mu_j/s_j$$',
      '$$w_j^{raw}=w_j^{model}/s_j,\\qquad b^{raw}=b^{model}-\\sum_j w_j^{model}\\mu_j/s_j$$',
    ),
    commonMistake: loc(
      '“保持其它已建模特征不变”是条件解释，不是温度或湿度造成租车变化的因果结论。',
      '“Holding other modeled features fixed” is a conditional interpretation, not a causal claim that temperature or humidity produces the demand change.',
    ),
    visualAnimation: loc(
      '系数表明确分成 model space 与 original units 两栏，并保留特征名和单位。',
      'The coefficient table separates model space from original units and retains feature names and units.',
    ),
    experimentDesign: loc(
      '选择一个系数，先给出条件解释，再指出季节、天气类别和小时周期等遗漏因素。',
      'Choose one coefficient, give a conditional interpretation, then name omitted factors such as season, weather category, and cyclical hour structure.',
    ),
    sourceReference: loc(
      '固定 StandardScaler 参数、锁定系数表与 scikit-learn coef_/intercept_。',
      'Locked StandardScaler parameters, coefficient table, and scikit-learn coef_/intercept_.',
    ),
  },
  overfitting: {
    coreQuestion: loc(
      '优化已经完成后，留出残差还暴露了哪些模型限制？',
      'After optimization is complete, which model limitations remain visible in held-out residuals?',
    ),
    concept: loc(
      '先看 loss、梯度范数和三方法一致性确认拟合完成，再看小时曲线、需求增大时的残差扩散和真实失败记录。',
      'First use loss, gradient norm, and three-method agreement to confirm fitting is complete; then inspect hourly shape, widening spread at higher demand, and real failure records.',
    ),
    workedExample: loc(
      'instant=17213 是负预测；15628 与 14965 分别是早晚高峰低估；15604 是排除前三例后的大残差。负预测不裁剪，因为裁剪会改变指标。',
      'instant=17213 is the negative prediction; 15628 and 14965 are morning and evening peak underpredictions; 15604 is the large residual after excluding those cases. The negative prediction is not clipped because clipping would change metrics.',
    ),
    formula: loc(
      '$$\\mathrm{MSE}=\\frac1n\\sum r_i^2,\\quad \\mathrm{MAE}=\\frac1n\\sum |r_i|,\\quad R^2=1-\\frac{\\sum r_i^2}{\\sum(y_i-\\bar y)^2}$$',
      '$$\\mathrm{MSE}=\\frac1n\\sum r_i^2,\\quad \\mathrm{MAE}=\\frac1n\\sum |r_i|,\\quad R^2=1-\\frac{\\sum r_i^2}{\\sum(y_i-\\bar y)^2}$$',
    ),
    commonMistake: loc(
      '三方法一致不等于残差随机；持续的小时形状与高需求扩散属于模型空间限制，不是“再训练几轮”能修复。',
      'Method agreement does not make residuals random; persistent hourly shape and high-demand spread are model-space limits, not something a few more epochs will fix.',
    ),
    visualAnimation: loc(
      '诊断图同时提供小时标签、需求分箱、误差方向和表格说明，关键结论不只存在于动画里。',
      'Diagnostic views include hour labels, demand bins, error direction, and table explanations; key conclusions never exist only in motion.',
    ),
    experimentDesign: loc(
      '先选“优化没完成”或“模型限制”，再展开四个已解析案例；最后只做一次简短 raw cnt 与 log1p(cnt) 对照。',
      'Choose “unfinished optimization” or “model limitation” before expanding the four resolved cases; finish with one concise raw-cnt versus log1p(cnt) comparison.',
    ),
    sourceReference: loc(
      '锁定留出残差、NIST 残差诊断思路与本地完整残差下载。',
      'Locked held-out residuals, NIST residual-diagnostic guidance, and the local complete-residual download.',
    ),
  },
  regularization: {
    coreQuestion: loc(
      '只加入 atemp 后为什么 temp 系数会不稳定，Ridge 与 Lasso 又改变了什么目标？',
      'Why can adding only atemp destabilize the temp coefficient, and how do Ridge and Lasso change the objective?',
    ),
    concept: loc(
      '保持行、切分、目标和预处理不变，只添加 atemp。高度相关输入可以让单个 OLS 系数大幅移动，即使预测和误差变化较小。',
      'Keep rows, split, target, and preprocessing fixed and add only atemp. Correlated inputs can move individual OLS coefficients substantially even when predictions and errors move little.',
    ),
    workedExample: loc(
      '先对比 base OLS 与 add-only-atemp OLS 的 temp/atemp 系数，再查看 Ridge 的整体收缩和 Lasso 的稀疏偏好。',
      'First compare temp/atemp coefficients for base OLS and add-only-atemp OLS, then inspect Ridge’s smooth shrinkage and Lasso’s sparse preference.',
    ),
    formula: loc(
      '$$J_{OLS}=\\mathrm{MSE},\\quad J_{Ridge}=\\mathrm{MSE}+\\alpha\\lVert w\\rVert_2^2,\\quad J_{Lasso}=\\mathrm{MSE}+\\alpha\\lVert w\\rVert_1$$',
      '$$J_{OLS}=\\mathrm{MSE},\\quad J_{Ridge}=\\mathrm{MSE}+\\alpha\\lVert w\\rVert_2^2,\\quad J_{Lasso}=\\mathrm{MSE}+\\alpha\\lVert w\\rVert_1$$',
    ),
    commonMistake: loc(
      'Ridge、Lasso 与 OLS 的目标函数不同，因此系数不应被要求与 OLS 完全一致；这不是三方法 OLS 对照失败。',
      'Ridge, Lasso, and OLS have different objective functions, so their coefficients are not expected to match OLS exactly; this is not a failure of the three-method OLS comparison.',
    ),
    visualAnimation: loc(
      '综合复盘面板把收敛、方法一致性、残差形状和系数稳定性放在同一页，但保留此前分阶段讲解。',
      'The combined review panel places convergence, method agreement, residual shape, and coefficient stability together without replacing the earlier staged explanation.',
    ),
    experimentDesign: loc(
      '先预测加 atemp 后哪个系数会移动，再比较 Ridge/Lasso；最后写出线性边界并进入 Phase 28 表格回归项目。',
      'Predict which coefficient will move after atemp is added, then compare Ridge/Lasso; finish by stating the linear boundary and continue to the Phase 28 tabular-regression project.',
    ),
    sourceReference: loc(
      '锁定 atemp 诊断、scikit-learn Ridge/Lasso 与 Phase 28 项目交接。',
      'Locked atemp diagnostic, scikit-learn Ridge/Lasso, and the Phase 28 project handoff.',
    ),
  },
}

export const linearRegressionModule: AlgorithmModuleDefinition = {
  slug: 'linear-regression',
  titleKey: 'modules.linearRegression.title',
  kickerKey: 'modules.linearRegression.kicker',
  introKey: 'modules.linearRegression.intro',
  summaryKey: 'modules.linearRegression.summary',
  route: '/learn/linear-regression',
  theme: '#2f6feb',
  accent: '#14b8a6',
  checkpoints: algorithmCheckpointsBySlug['linear-regression'],
  sourceNote: loc(
    '课程使用本地 UCI Bike Sharing hourly 快照、60/20/20 时间切分与已执行双语 Notebook；公开资料集中放在第八章末尾。',
    'This course uses the local UCI Bike Sharing hourly snapshot, a chronological 60/20/20 split, and executed bilingual notebooks; public references are collected at the end of chapter eight.',
  ),
  chapters: [
    {
      id: 'fit-line',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.fitLine.title',
      estimatedMinutes: 9,
      markdown: loc(
        `从一个真实问题开始：已知某小时的 temp、hum、windspeed、workingday、hr，预测原始租车次数 cnt。主线不切换数据集，也不把目标做缩放。

casual 和 registered 明确排除，因为 casual + registered = cnt；把它们放进 X 会发生目标泄漏。

代表训练行是 instant=11550。单行预测写成 $\\hat y_i=x_i^\\top w+b$，其中 x、w、b 与代码变量同名。

### 运行结果
参考输出绑定：\`representative-training-row\`。页面从 \`linearRegressionChapterAssets\` 读取该行，不复制另一张完整精度表。

### sklearn 对照
\`\`\`python
model = LinearRegression().fit(X_train, y_train)
prediction = model.predict(X_train[row_index:row_index + 1])
\`\`\`

sklearn 的 predict 与 NumPy 的点积回答同一个问题。

### 解释
预测保留“辆次/小时”的单位；权重项是条件贡献，截距是共同基线。

### 下一步
下一章 \`multivariate\` 把一行点积推广为整批 X @ w + b。`,
        `Start with one real question: given temp, hum, windspeed, workingday, and hr for an hour, predict raw rental count cnt. The main path never switches datasets or scales the target.

casual and registered are excluded because casual + registered = cnt; putting them in X leaks the target.

The representative training row is instant=11550. Its prediction is $\\hat y_i=x_i^\\top w+b$, using the same x, w, and b names as code.

### Run Result
Reference Output binding: \`representative-training-row\`. The page reads this row through \`linearRegressionChapterAssets\` instead of copying another full-precision table.

### sklearn Comparison
\`\`\`python
model = LinearRegression().fit(X_train, y_train)
prediction = model.predict(X_train[row_index:row_index + 1])
\`\`\`

sklearn predict and the NumPy dot product answer the same question.

### Interpretation
The prediction remains in rentals per hour. Weight terms are conditional contributions; the intercept is the shared baseline.

### Next Step
Chapter \`multivariate\` generalizes one row to batch X @ w + b.`,
      ),
      callout: loc(
        '先守住字段语义：ID 用于追踪，五个特征进入模型，cnt 是目标，casual/registered 是泄漏列。',
        'Protect field semantics first: the ID tracks a row, five features enter the model, cnt is the target, and casual/registered leak it.',
      ),
      experimentPrompt: loc(
        '查看结果前，先写下 instant=11550 的预测应高于还是低于真实 cnt，并说明理由。',
        'Before revealing the result, predict whether instant=11550 is above or below actual cnt and explain why.',
      ),
      presetId: 'baseline-fit',
      metricEmphasis: ['loss'],
    },
    {
      id: 'multivariate',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.multivariate.title',
      estimatedMinutes: 10,
      markdown: loc(
        `固定特征顺序只有一个：temp、hum、windspeed、workingday、hr。17,379 行保持时间顺序，前 80% 是训练集，后 20% 是 held-out test。

连续列只在训练集上 fit StandardScaler；留出集只能 transform。workingday 保持二元 0/1，不参与标准化。代码中的批量形式就是 X @ w + b。

$$\\hat y=Xw+b\\mathbf1$$

### 运行结果
参考输出绑定：\`batch-contract\`，记录切分、特征顺序和训练集统计量。

### sklearn 对照
\`\`\`python
continuous = ["temp", "hum", "windspeed", "hr"]
feature_order = ["temp", "hum", "windspeed", "workingday", "hr"]
scaler = StandardScaler().fit(train[continuous])  # train-only
X_train = assemble(scaler.transform(train[continuous]), train["workingday"])
X_test = assemble(scaler.transform(test[continuous]), test["workingday"])
predictions = X_test @ w + b
sklearn_predictions = model.predict(X_test)
\`\`\`

### 解释
列宽正确不代表列语义正确；交换 hum 与 windspeed 会静默改变每个权重的含义。

### 下一步
\`residual-loss\` 从一项 prediction - actual 推广到残差向量和 MSE。`,
        `There is one fixed feature order: temp, hum, windspeed, workingday, hr. The 17,379 rows retain chronological order: first 80% train and final 20% held-out test.

Continuous columns fit StandardScaler on training data only; the holdout is transform-only. workingday stays binary 0/1 and is not standardized. In code, the batch form is X @ w + b.

$$\\hat y=Xw+b\\mathbf1$$

### Run Result
Reference Output binding: \`batch-contract\`, which records the split, feature order, and training-only statistics.

### sklearn Comparison
\`\`\`python
continuous = ["temp", "hum", "windspeed", "hr"]
feature_order = ["temp", "hum", "windspeed", "workingday", "hr"]
scaler = StandardScaler().fit(train[continuous])  # train-only
X_train = assemble(scaler.transform(train[continuous]), train["workingday"])
X_test = assemble(scaler.transform(test[continuous]), test["workingday"])
predictions = X_test @ w + b
sklearn_predictions = model.predict(X_test)
\`\`\`

### Interpretation
Correct width does not guarantee correct semantics; swapping hum and windspeed silently changes every weight meaning.

### Next Step
\`residual-loss\` moves from one prediction - actual term to a residual vector and MSE.`,
      ),
      callout: loc(
        '切分先于预处理；同一 X、同一 b 约定才让三种拟合方法可比较。',
        'Split before preprocessing; the same X and intercept convention make three fitting methods comparable.',
      ),
      experimentPrompt: loc(
        '如果先在全部 17,379 行上 fit scaler，哪一条留出信息会提前进入训练？',
        'If the scaler were fit on all 17,379 rows, which held-out information would enter training early?',
      ),
      presetId: 'multivariate-plane',
      metricEmphasis: ['loss'],
    },
    {
      id: 'residual-loss',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.residualLoss.title',
      estimatedMinutes: 10,
      markdown: loc(
        `全课程固定残差符号：residual = prediction - actual，即 $r_i=\\hat y_i-y_i$。

单行从 $r_i^2$、$2r_ix_i$ 和 $2r_i$ 出发；整批为：

$$\\mathrm{MSE}=r^Tr/n,\\quad \\nabla_w=2X^Tr/n,\\quad \\partial_b=2\\mathbf1^Tr/n$$

### 运行结果
参考输出绑定：\`residuals-and-metrics\`。完整 3,476 行残差保留在注册下载，不在页面一次性渲染。

### sklearn 对照
\`\`\`python
residuals = predictions - y_test
mse = mean_squared_error(y_test, predictions)
mae = mean_absolute_error(y_test, predictions)
r2 = r2_score(y_test, predictions)
\`\`\`

### 解释
正残差表示预测偏高，负残差表示预测偏低。MSE 用平方强调大偏差，MAE 保留 cnt 的原单位，R² 比较相对基准。

### 下一步
\`training-motion\` 把这些批量梯度放进可执行 NumPy 更新循环。`,
        `The entire course fixes one residual sign: residual = prediction - actual, so $r_i=\\hat y_i-y_i$.

Start from one-row contributions $r_i^2$, $2r_ix_i$, and $2r_i$; the batch form is:

$$\\mathrm{MSE}=r^Tr/n,\\quad \\nabla_w=2X^Tr/n,\\quad \\partial_b=2\\mathbf1^Tr/n$$

### Run Result
Reference Output binding: \`residuals-and-metrics\`. The complete 3,476-row residual file remains a registered download rather than one oversized page table.

### sklearn Comparison
\`\`\`python
residuals = predictions - y_test
mse = mean_squared_error(y_test, predictions)
mae = mean_absolute_error(y_test, predictions)
r2 = r2_score(y_test, predictions)
\`\`\`

### Interpretation
A positive residual means the prediction is high; a negative one means it is low. MSE emphasizes large misses, MAE keeps cnt units, and R² compares with a baseline.

### Next Step
\`training-motion\` places these batch gradients inside an executable NumPy update loop.`,
      ),
      callout: loc(
        '残差符号、公式、NumPy 和 sklearn 指标必须始终一致。',
        'Residual sign, formulas, NumPy, and sklearn metrics must remain consistent.',
      ),
      experimentPrompt: loc(
        '先判断代表行的 r_i 符号，再解释为什么它对 grad_w 的方向会随 x_i 改变。',
        'Predict the representative row’s r_i sign, then explain why its grad_w direction depends on x_i.',
      ),
      presetId: 'residual-focus',
      metricEmphasis: ['loss'],
    },
    {
      id: 'training-motion',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.trainingMotion.title',
      estimatedMinutes: 11,
      markdown: loc(
        `NumPy batch gradient descent 从 w=0、b=0 开始。每次迭代用完整训练批次计算 predictions、residuals、grad_w、grad_b，再统一更新。

### 运行结果
参考输出绑定：\`gradient-descent-result\`。完整轨迹记录 update、MSE、gradient_norm、w、b 和停止原因；每步都必须通过 isfinite 检查。

### sklearn 对照
\`\`\`python
for update in range(max_updates):
    predictions = X_train @ w + b
    residuals = predictions - y_train
    grad_w = 2 * X_train.T @ residuals / len(y_train)
    grad_b = 2 * residuals.mean()
    gradient_norm = np.sqrt(grad_w @ grad_w + grad_b ** 2)
    if not np.isfinite(gradient_norm):
        raise FloatingPointError("non-finite batch GD state")
    w -= learning_rate * grad_w
    b -= learning_rate * grad_b
    if gradient_norm <= gradient_tolerance:
        stop_reason = "gradient_tolerance"
        break

sklearn_fit = LinearRegression().fit(X_train, y_train)
\`\`\`

### 解释
NumPy 批量梯度下降解释参数怎样学到；sklearn fit 是连续实践对照。浏览器的短回放不冒充完整数据重训。

### 下一步
\`polynomial\` 用同一切分比较 GD、稳定 lstsq 参考和 sklearn。`,
        `NumPy batch gradient descent starts from w=0 and b=0. Every iteration uses the complete training batch to compute predictions, residuals, grad_w, and grad_b before one joint update.

### Run Result
Reference Output binding: \`gradient-descent-result\`. The complete trace records update, MSE, gradient_norm, w, b, and stop reason; every state must pass an isfinite guard.

### sklearn Comparison
\`\`\`python
for update in range(max_updates):
    predictions = X_train @ w + b
    residuals = predictions - y_train
    grad_w = 2 * X_train.T @ residuals / len(y_train)
    grad_b = 2 * residuals.mean()
    gradient_norm = np.sqrt(grad_w @ grad_w + grad_b ** 2)
    if not np.isfinite(gradient_norm):
        raise FloatingPointError("non-finite batch GD state")
    w -= learning_rate * grad_w
    b -= learning_rate * grad_b
    if gradient_norm <= gradient_tolerance:
        stop_reason = "gradient_tolerance"
        break

sklearn_fit = LinearRegression().fit(X_train, y_train)
\`\`\`

### Interpretation
NumPy batch gradient descent explains how parameters are learned; sklearn fit is the continuous practical counterpart. The short browser replay does not pretend to refit the complete dataset.

### Next Step
\`polynomial\` compares GD, the stable lstsq reference, and sklearn on the same split.`,
      ),
      callout: loc(
        '先证明优化完成，再讨论残差模式；不要把模型限制误判成“还没收敛”。',
        'Prove optimization completion before diagnosing residual patterns; do not mislabel model limits as unfinished convergence.',
      ),
      experimentPrompt: loc(
        '先预测 learning_rate 增大时轨迹会怎样，再观察 loss 与 gradient_norm 是否给出同一停止判断。',
        'Predict what a larger learning_rate will do, then check whether loss and gradient_norm support the same stopping conclusion.',
      ),
      presetId: 'training-playback',
      metricEmphasis: ['loss'],
    },
    {
      id: 'polynomial',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.polynomial.title',
      estimatedMinutes: 12,
      markdown: loc(
        `本章保留旧 ID，但责任改为三方法 OLS 对照。概念上的 normal equation / 正规方程使用增广设计：

X_tilde = [1, X]

theta = (X_tilde^T X_tilde)^+ X_tilde^T y

theta[0] = b，theta[1:] = w

### 运行结果
参考输出绑定：\`method-comparison\`。NumPy 批量梯度下降、np.linalg.lstsq 与 scikit-learn 使用相同切分、相同设计矩阵和相同截距约定。

### sklearn 对照
\`\`\`python
X_tilde = np.column_stack([np.ones(len(X_train)), X_train])
theta, residuals, rank, singular_values = np.linalg.lstsq(
    X_tilde, y_train, rcond=None
)
b_reference = theta[0]
w_reference = theta[1:]
sklearn_model = LinearRegression(fit_intercept=True).fit(X_train, y_train)
\`\`\`

可执行代码使用 np.linalg.lstsq，因为它比显式形成逆矩阵更稳定，并保留 rank 与 singular_values 诊断。

### 解释
三种未正则 OLS 方法应在锁定容差内一致；这验证实现，不代表残差已经没有结构。随后只做同一 Bike 案例的简短 hr 多项式容量观察。

### 下一步
\`model-limits\` 把模型空间系数翻译回原始单位。`,
        `This chapter keeps its old ID but now owns the three-method OLS comparison. The conceptual normal equation uses an augmented design:

X_tilde = [1, X]

theta = (X_tilde^T X_tilde)^+ X_tilde^T y

theta[0] = b and theta[1:] = w

### Run Result
Reference Output binding: \`method-comparison\`. NumPy batch gradient descent, np.linalg.lstsq, and scikit-learn use the same split, same design matrix, and same intercept convention.

### sklearn Comparison
\`\`\`python
X_tilde = np.column_stack([np.ones(len(X_train)), X_train])
theta, residuals, rank, singular_values = np.linalg.lstsq(
    X_tilde, y_train, rcond=None
)
b_reference = theta[0]
w_reference = theta[1:]
sklearn_model = LinearRegression(fit_intercept=True).fit(X_train, y_train)
\`\`\`

Executable code uses np.linalg.lstsq because it is more stable than forming an explicit inverse and retains rank and singular_values diagnostics.

### Interpretation
The three unregularized OLS methods should agree within the locked tolerance. That validates implementation, not residual adequacy. A concise hr polynomial observation then extends capacity on the same Bike case.

### Next Step
\`model-limits\` translates model-space coefficients back to original units.`,
      ),
      callout: loc(
        '正规方程是关系，lstsq 是稳定实现；两者不是“手推公式”和“另一个算法”的冲突。',
        'The normal equation is the relation and lstsq is the stable implementation; they are not competing stories.',
      ),
      experimentPrompt: loc(
        '先预测三种 OLS 的系数差应多大，再解释为什么多项式扩展改变容量却仍对参数线性。',
        'Predict the three OLS coefficient delta, then explain why polynomial expansion changes capacity while remaining linear in parameters.',
      ),
      presetId: 'polynomial-curve',
      metricEmphasis: ['loss'],
    },
    {
      id: 'model-limits',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.modelLimits.title',
      estimatedMinutes: 9,
      markdown: loc(
        `StandardScaler 让模型空间系数可稳定训练，但解释时要回到原始单位：

$$w_j^{raw}=w_j^{model}/scale_j$$

$$b^{raw}=b^{model}-\\sum_j w_j^{model}mean_j/scale_j$$

workingday 没有缩放，所以它的二元变化直接保留。

### 运行结果
参考输出绑定：\`coefficient-table\`，并列模型空间与原始单位的 coef_、intercept_。

### sklearn 对照
\`\`\`python
w_model = sklearn_model.coef_
b_model = sklearn_model.intercept_
w_original = w_model / scaler.scale_
b_original = b_model - np.sum(w_model * scaler.mean_ / scaler.scale_)
\`\`\`

### 解释
“保持其它已建模特征不变”时，一个原始单位变化对应多少 cnt 预测变化。这是条件关联，不是因果结论；hour 也不是周期特征的完整表达。

### 下一步
\`overfitting\` 在确认优化完成后读取留出残差结构。`,
        `StandardScaler supports stable fitting in model space, but interpretation should return to original units:

$$w_j^{raw}=w_j^{model}/scale_j$$

$$b^{raw}=b^{model}-\\sum_j w_j^{model}mean_j/scale_j$$

workingday is unscaled, so its binary change stays direct.

### Run Result
Reference Output binding: \`coefficient-table\`, placing model-space and original-unit coef_ and intercept_ side by side.

### sklearn Comparison
\`\`\`python
w_model = sklearn_model.coef_
b_model = sklearn_model.intercept_
w_original = w_model / scaler.scale_
b_original = b_model - np.sum(w_model * scaler.mean_ / scaler.scale_)
\`\`\`

### Interpretation
Holding other modeled features fixed, an original-unit change maps to a cnt prediction change. This is conditional association, not a causal conclusion; raw hour is also not a complete cyclical representation.

### Next Step
\`overfitting\` reads held-out residual structure after optimization is confirmed.`,
      ),
      callout: loc(
        '先说明系数所在空间和单位，再做条件解释；不能只比较绝对值大小。',
        'Name coefficient space and units before interpreting conditionally; do not compare magnitudes alone.',
      ),
      experimentPrompt: loc(
        '任选 temp 或 hum：先写一个合格的条件解释，再写一句不能推出的因果说法。',
        'Choose temp or hum: write one valid conditional interpretation and one causal statement that cannot be concluded.',
      ),
      presetId: 'limits-bridge',
      metricEmphasis: ['loss'],
    },
    {
      id: 'overfitting',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.overfitting.title',
      estimatedMinutes: 12,
      markdown: loc(
        `先确认优化结束：loss 已稳定、gradient_norm 足够小、三种 OLS 在容差内一致。随后留出 MSE、MAE、R² 仍显示模型并未解释全部需求结构。

小时残差曲线暴露早晚高峰非线性；需求更高时残差离散程度增大，表现为 widening spread。

### 运行结果
绑定：\`heldout-diagnostics\` 与 \`named-cases\`。可展开记录包括：

- instant=17213：negative prediction / 负预测，不裁剪
- instant=15628：早高峰低估
- instant=14965：晚高峰低估
- instant=15604：排除前三例后的大残差

### sklearn 对照
\`\`\`python
heldout = pd.DataFrame({
    "prediction": model.predict(X_test),
    "actual": y_test,
})
heldout["residual"] = heldout["prediction"] - heldout["actual"]
metrics = {
    "MSE": mean_squared_error(y_test, heldout["prediction"]),
    "MAE": mean_absolute_error(y_test, heldout["prediction"]),
    "R2": r2_score(y_test, heldout["prediction"]),
}
\`\`\`

### 解释
raw cnt 是主结论。log1p(cnt) 只做一次简短对照：它会改变残差形状和系数解释，不能与 raw 指标混成一张排行榜。

### 下一步
\`regularization\` 用 add-only-atemp 对照分离共线性与正则目标。`,
        `First confirm optimization is complete: loss is stable, gradient_norm is small, and three OLS methods agree within tolerance. Held-out MSE, MAE, and R² still show that the model does not explain all demand structure.

The hourly residual curve exposes nonlinear morning/evening peaks; residual spread widens as demand grows.

### Run Result
Bindings: \`heldout-diagnostics\` and \`named-cases\`. Expandable records include:

- instant=17213: negative prediction, not clipped
- instant=15628: morning-peak underprediction
- instant=14965: evening-peak underprediction
- instant=15604: large residual after excluding the first three

### sklearn Comparison
\`\`\`python
heldout = pd.DataFrame({
    "prediction": model.predict(X_test),
    "actual": y_test,
})
heldout["residual"] = heldout["prediction"] - heldout["actual"]
metrics = {
    "MSE": mean_squared_error(y_test, heldout["prediction"]),
    "MAE": mean_absolute_error(y_test, heldout["prediction"]),
    "R2": r2_score(y_test, heldout["prediction"]),
}
\`\`\`

### Interpretation
Raw cnt remains the main conclusion. log1p(cnt) is one concise comparison: it changes residual shape and coefficient meaning, so its metrics do not join a raw-target ranking.

### Next Step
\`regularization\` uses an add-only-atemp comparison to separate collinearity from regularized objectives.`,
      ),
      callout: loc(
        '方法一致证明优化，不证明模型充分；残差结构才回答模型遗漏了什么。',
        'Method agreement proves optimization, not model adequacy; residual structure shows what the model misses.',
      ),
      experimentPrompt: loc(
        '先把四个案例归类为负预测、高峰低估或大残差，再说明哪一种模式是线性 hour 特征难以表达的。',
        'Classify the four cases as negative prediction, peak underprediction, or large residual, then identify which pattern a linear hour feature misses.',
      ),
      presetId: 'overfit-warning',
      metricEmphasis: ['loss'],
    },
    {
      id: 'regularization',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.regularization.title',
      estimatedMinutes: 11,
      markdown: loc(
        `控制变量：行、时间切分、raw cnt、原五个特征和预处理全部不变，只加入 atemp。temp 与 atemp 高度相关，OLS 可以在两列之间重新分配系数。

$$J_{OLS}=MSE$$
$$J_{Ridge}=MSE+\\alpha\\lVert w\\rVert_2^2$$
$$J_{Lasso}=MSE+\\alpha\\lVert w\\rVert_1$$

### 运行结果
参考输出绑定：\`model-limit-review\`。综合复盘 combined review 同时列出收敛、三方法 OLS 一致、小时/扩散残差与 temp/atemp 系数稳定性。

### sklearn 对照
\`\`\`python
ols_atemp = LinearRegression().fit(X_train_with_atemp, y_train)
ridge_atemp = Ridge(alpha=ridge_alpha).fit(X_train_with_atemp, y_train)
lasso_atemp = Lasso(alpha=lasso_alpha).fit(X_train_with_atemp, y_train)
\`\`\`

### 解释
Ridge、Lasso 与 OLS 的目标函数不同，因此系数不需要与 OLS 相等。Ridge 倾向平滑分担相关特征，Lasso 倾向把部分系数压到零。

### 下一步
线性边界已经明确：一阶 hour 难以表达双峰，相关特征让单个系数不稳定。下一站是 Phase 28 / 阶段 28 的表格回归项目。`,
        `Controlled comparison: rows, chronological split, raw cnt, the original five features, and preprocessing all stay fixed; only atemp is added. Because temp and atemp are highly correlated, OLS can redistribute their coefficients.

$$J_{OLS}=MSE$$
$$J_{Ridge}=MSE+\\alpha\\lVert w\\rVert_2^2$$
$$J_{Lasso}=MSE+\\alpha\\lVert w\\rVert_1$$

### Run Result
Reference Output binding: \`model-limit-review\`. The combined review places convergence, three-method OLS agreement, hourly/spread residuals, and temp/atemp coefficient stability together.

### sklearn Comparison
\`\`\`python
ols_atemp = LinearRegression().fit(X_train_with_atemp, y_train)
ridge_atemp = Ridge(alpha=ridge_alpha).fit(X_train_with_atemp, y_train)
lasso_atemp = Lasso(alpha=lasso_alpha).fit(X_train_with_atemp, y_train)
\`\`\`

### Interpretation
Ridge, Lasso, and OLS have different objectives, so their coefficients are not expected to equal OLS. Ridge tends to share correlated effects smoothly; Lasso tends to push some coefficients to zero.

### Next Step
The linear boundary is explicit: a first-order hour feature misses two peaks, and correlated features destabilize individual coefficients. Continue to the Phase 28 tabular-regression project.`,
      ),
      callout: loc(
        '先做 add-only-atemp OLS 对照，再单独说明 Ridge/Lasso 的不同目标。',
        'Run the add-only-atemp OLS comparison first, then explain Ridge/Lasso as different objectives.',
      ),
      experimentPrompt: loc(
        '预测加入 atemp 后 temp 系数、留出预测和误差会怎样变化，再用结果修正解释。',
        'Predict how adding atemp changes the temp coefficient, held-out predictions, and error, then revise your explanation from the result.',
      ),
      presetId: 'regularized-balance',
      metricEmphasis: ['loss'],
    },
  ],
  controls: [
    { key: 'learningRate', type: 'range', labelKey: 'controls.learningRate', category: 'optimization', min: 0.02, max: 0.24, step: 0.01, format: 'number' },
    { key: 'epochs', type: 'range', labelKey: 'controls.epochs', category: 'optimization', min: 16, max: 72, step: 2, format: 'integer' },
    { key: 'playbackMs', type: 'range', labelKey: 'controls.animationSpeed', category: 'playback', min: 70, max: 260, step: 10, format: 'speed' },
    { key: 'datasetNoise', type: 'range', labelKey: 'controls.datasetNoise', category: 'data', min: 0, max: 0.35, step: 0.01, format: 'number' },
    { key: 'outlierStrength', type: 'range', labelKey: 'controls.outlierStrength', category: 'data', min: 0, max: 120, step: 2, format: 'number' },
    { key: 'featureNoise', type: 'range', labelKey: 'controls.featureNoise', category: 'data', min: 0, max: 0.45, step: 0.01, format: 'number' },
    { key: 'polynomialDegree', type: 'range', labelKey: 'controls.polynomialDegree', category: 'architecture', min: 1, max: 7, step: 1, format: 'integer' },
    { key: 'lambda', type: 'range', labelKey: 'controls.lambda', category: 'optimization', min: 0, max: 0.8, step: 0.01, format: 'number' },
    { key: 'elasticAlpha', type: 'range', labelKey: 'controls.elasticAlpha', category: 'optimization', min: 0, max: 1, step: 0.05, format: 'percent' },
    { key: 'validationSplit', type: 'range', labelKey: 'controls.validationSplit', category: 'data', min: 0.18, max: 0.48, step: 0.01, format: 'percent' },
    {
      key: 'regularizationType',
      type: 'select',
      labelKey: 'controls.regularizationType',
      category: 'optimization',
      options: [
        { value: 'none', labelKey: 'controls.options.none' },
        { value: 'l1', labelKey: 'controls.options.l1' },
        { value: 'l2', labelKey: 'controls.options.l2' },
        { value: 'elastic', labelKey: 'controls.options.elastic' },
      ],
    },
  ],
  presets: [
    {
      id: 'baseline-fit',
      label: loc('Bike 单行预测', 'Bike row prediction'),
      description: loc('用代表训练行连接固定字段顺序、点积与原始 cnt 预测。', 'Connect the representative row, fixed feature order, dot product, and raw cnt prediction.'),
      config: {
        scenario: 'linear',
        learningRate: 0.11,
        epochs: 36,
        datasetNoise: 0.05,
        includeOutlier: false,
        outlierStrength: 36,
        initialSlope: -0.3,
        initialIntercept: 0.52,
      },
    },
    {
      id: 'residual-focus',
      label: loc('残差与 MSE', 'Residual and MSE'),
      description: loc('固定 residual = prediction - actual，连接单行贡献与整批平均。', 'Fix residual = prediction - actual and connect one-row contributions to the batch mean.'),
      config: {
        scenario: 'linear',
        learningRate: 0.1,
        epochs: 34,
        datasetNoise: 0.11,
        includeOutlier: true,
        outlierStrength: 54,
        initialSlope: -0.24,
        initialIntercept: 0.5,
      },
    },
    {
      id: 'training-playback',
      label: loc('批量 GD 回放', 'Batch GD playback'),
      description: loc('观察有界浏览器轨迹，同时与完整锁定训练轨迹保持清楚边界。', 'Observe a bounded browser trace while keeping it distinct from the complete locked fit trace.'),
      config: {
        scenario: 'linear',
        learningRate: 0.14,
        epochs: 48,
        datasetNoise: 0.08,
        includeOutlier: false,
        outlierStrength: 42,
        initialSlope: -0.42,
        initialIntercept: 0.64,
      },
    },
    {
      id: 'limits-bridge',
      label: loc('系数解释', 'Coefficient interpretation'),
      description: loc('区分模型空间、原始单位和条件非因果解释。', 'Separate model space, original units, and conditional noncausal interpretation.'),
      config: {
        scenario: 'curved',
        learningRate: 0.12,
        epochs: 44,
        datasetNoise: 0.07,
        includeOutlier: true,
        outlierStrength: 46,
        initialSlope: -0.28,
        initialIntercept: 0.54,
      },
    },
    {
      id: 'multivariate-plane',
      label: loc('五特征批量预测', 'Five-feature batch prediction'),
      description: loc('固定 temp、hum、windspeed、workingday、hr 的列顺序。', 'Lock the temp, hum, windspeed, workingday, hr column order.'),
      config: {
        scenario: 'multivariate',
        learningRate: 0.08,
        epochs: 46,
        featureNoise: 0.08,
        datasetNoise: 0.08,
        includeOutlier: false,
      },
    },
    {
      id: 'polynomial-curve',
      label: loc('三方法与容量', 'Three methods and capacity'),
      description: loc('先核对三种 OLS，再观察同一 Bike 案例的多项式容量。', 'Check three OLS methods before observing polynomial capacity on the same Bike case.'),
      config: {
        scenario: 'polynomial',
        learningRate: 0.07,
        epochs: 54,
        datasetNoise: 0.1,
        polynomialDegree: 2,
        validationSplit: 0.32,
        regularizationType: 'none',
        lambda: 0,
      },
    },
    {
      id: 'overfit-warning',
      label: loc('留出残差诊断', 'Held-out residual diagnosis'),
      description: loc('在同一 Bike 留出集上观察小时非线性、扩散和真实失败案例。', 'Inspect hourly nonlinearity, widening spread, and real failures on the same Bike holdout.'),
      config: {
        scenario: 'overfit',
        learningRate: 0.06,
        epochs: 70,
        datasetNoise: 0.18,
        polynomialDegree: 7,
        validationSplit: 0.35,
        regularizationType: 'none',
        lambda: 0,
      },
    },
    {
      id: 'regularized-balance',
      label: loc('atemp 稳定性', 'atemp stability'),
      description: loc('只加入 atemp，再区分 OLS、Ridge 与 Lasso 的目标。', 'Add only atemp, then separate OLS, Ridge, and Lasso objectives.'),
      config: {
        scenario: 'regularized',
        learningRate: 0.055,
        epochs: 70,
        datasetNoise: 0.16,
        polynomialDegree: 7,
        validationSplit: 0.35,
        regularizationType: 'l2',
        elasticAlpha: 0.5,
        lambda: 0.28,
      },
    },
  ],
  createDefaultConfig: () => ({
    learningRate: 0.11,
    epochs: 36,
    playbackMs: 120,
    datasetNoise: 0.05,
    outlierStrength: 36,
    includeOutlier: false,
    scenario: 'linear',
    initialSlope: -0.3,
    initialIntercept: 0.52,
    featureNoise: 0.08,
    polynomialDegree: 2,
    validationSplit: 0.32,
    regularizationType: 'none',
    elasticAlpha: 0.5,
    lambda: 0,
  }),
  simulate: simulateLinearRegression,
}

linearRegressionModule.chapters = linearRegressionModule.chapters.map((chapter) => {
  const frame = linearRegressionTeachingFrames[chapter.id as LinearRegressionChapterId]
  return {
    ...chapter,
    markdown: withTeachingFrame(chapter.markdown, frame),
  }
})
