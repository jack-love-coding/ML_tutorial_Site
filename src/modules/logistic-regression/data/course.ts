import type { LocalizedCopy } from '../../../types/ml.ts'
import { LOGISTIC_CHAPTER_IDS, type LogisticChapterId, type LogisticCourseBlock, type LogisticCourseChapter } from '../types.ts'

const loc = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })
const titles: Record<LogisticCourseBlock['kind'], LocalizedCopy> = {
  question: loc('问题', 'Question'), explanation: loc('数据与直觉', 'Data and intuition'), formula: loc('数学连接', 'Math connection'), code: loc('NumPy 代码', 'NumPy code'), 'runtime-output': loc('运行结果', 'Runtime output'), prediction: loc('先预测', 'Predict first'), animation: loc('动画', 'Animation'), figure: loc('图表', 'Figure'), table: loc('数据表', 'Data table'), 'observation-lab': loc('观察台', 'Observation lab'), observation: loc('观察结果', 'What changed'), misconception: loc('常见误区', 'Common misconception'), conclusion: loc('本章结论', 'Chapter conclusion'),
}
const block = (kind: LogisticCourseBlock['kind'], zhCN: string, en: string, extra: Pick<LogisticCourseBlock, 'code' | 'sceneId' | 'assetId'> = {}): LogisticCourseBlock => ({ kind, title: titles[kind], body: loc(zhCN, en), ...extra })
const lab = (sceneId: LogisticChapterId, zhCN: string, en: string) => block('observation-lab', zhCN, en, { sceneId })
const media = (assetId: string, zhCN: string, en: string) => block('animation', zhCN, en, { assetId })

const scoreCode = `import numpy as np
x = np.array([1.12398219, 1.15041157, -0.97464306, 0.33523124])
w = np.array([-29.26704041, -30.65058621, -28.82668548, -0.69667880])
b = -14.04352802
z = w @ x + b
p = 1 / (1 + np.exp(-z))
print(f"z={z:.6f}, p={p:.6g}")`

const linearScore: readonly LogisticCourseBlock[] = [
  block('question', '一条真实 Banknote 记录怎样从四个输入得到一个可解释的 class 1 分数？', 'How does one real Banknote record turn four inputs into an interpretable class 1 score?'),
  block('explanation', '本课程只使用本地 UCI Banknote 快照。四个小波派生特征是 `variance`、`skewness`、`curtosis`、`entropy`；目标只称 class 0 与 class 1，不赋予额外语义。按固定 960/206/206 顺序切分，标准化只在训练集拟合。下面从训练 row 1 开始，再扩展到 batch。', 'This course uses only the local UCI Banknote snapshot. Its four wavelet-derived features are `variance`, `skewness`, `curtosis`, and `entropy`; labels are called only class 0 and class 1, with no added meaning. The fixed 960/206/206 split is retained and standardization is fit on training data only. We start with training row 1, then extend to a batch.'),
  block('formula', String.raw`把一行标准化特征写作 $\mathbf{x}\in\mathbb{R}^4$，参数写作 $\mathbf{w}\in\mathbb{R}^4$：

$$z=\mathbf{w}^{\top}\mathbf{x}+b=\sum_{j=1}^{4}w_jx_j+b.$$

每项 $w_jx_j$ 都可检查；矩阵形式为 $\mathbf z=X\mathbf w+b\mathbf1$。$z$ 是 class 1 的 log-odds，不是类别。`, String.raw`Write one standardized row as $\mathbf{x}\in\mathbb{R}^4$ and parameters as $\mathbf{w}\in\mathbb{R}^4$:

$$z=\mathbf{w}^{\top}\mathbf{x}+b=\sum_{j=1}^{4}w_jx_j+b.$$

Each $w_jx_j$ is inspectable; the batch form is $\mathbf z=X\mathbf w+b\mathbf1$. $z$ is class 1 log-odds, not a class.`),
  block('code', '特征、权重和截距按页面声明的顺序排列。', 'Features, weights, and intercept use the declared page order.', { code: scoreCode }),
  block('runtime-output', '锁定的真实行输出：\n\n```text\nz=-54.337769, p=2.52004e-24\ncontributions=-32.895632, -35.260789, 28.095729, -0.233548\nintercept=-14.043528\n```', 'Locked real-row output:\n\n```text\nz=-54.337769, p=2.52004e-24\ncontributions=-32.895632, -35.260789, 28.095729, -0.233548\nintercept=-14.043528\n```'),
  block('prediction', '先预测：如果所有贡献与截距相加为 $z=0$，class 1 概率是多少？', 'Predict first: if all contributions and the intercept sum to $z=0$, what is the class 1 probability?'),
  media('linear-score-to-sigmoid', '动画把同一行的贡献、log-odds 与概率连起来，可暂停并展开字幕。', 'The animation connects the same row’s contributions, log-odds, and probability; pause it or open its transcript.'),
  lab('linear-score', '切换冻结的近边界、正确且自信和高损失行，检查贡献如何改变总分。', 'Switch among frozen near-boundary, correct-and-confident, and high-loss rows to inspect how contributions change the total.'),
  block('observation', String.raw`row 1 的 $z<0$，所以 class 1 概率低于 $0.5$。这是默认决策桥梁，不是训练目标。`, String.raw`Row 1 has $z<0$, so class 1 probability is below $0.5$. This is a default decision bridge, not the training objective.`),
  block('misconception', '原始值大不等于影响大。影响由训练集标准化后的特征、对应权重与截距共同决定。', 'A large raw value does not mean large influence. Influence comes from the training-standardized feature, its matching weight, and the intercept.'),
  block('conclusion', '逻辑回归先输出可审计分数。下一章把分数稳定地变成概率。', 'Logistic regression first emits an auditable score. Next we turn that score into probability stably.'),
]

const sigmoidProbability: readonly LogisticCourseBlock[] = [
  block('question', '为什么无限范围的分数可以表示成 0 到 1 之间的概率？', 'Why can an unbounded score be represented as a probability between 0 and 1?'),
  block('explanation', '分数保留样本排序，但没有概率上界。sigmoid 把 row 1 的极端负分数、近边界 row 926 和正分数放到同一条曲线上。', 'Scores preserve example ordering but have no probability bounds. Sigmoid puts row 1’s extreme negative score, near-boundary row 926, and positive scores on one curve.'),
  block('formula', String.raw`$$p=\sigma(z)=\frac{1}{1+e^{-z}},\qquad \operatorname{odds}=\frac{p}{1-p},\qquad z=\log\frac{p}{1-p}.$$

$z=0$ 时 $p=0.5$、odds 为 $1$。稳定实现对正负 $z$ 分支计算，避免极端分数溢出。`, String.raw`$$p=\sigma(z)=\frac{1}{1+e^{-z}},\qquad \operatorname{odds}=\frac{p}{1-p},\qquad z=\log\frac{p}{1-p}.$$

At $z=0$, $p=0.5$ and odds are $1$. A stable implementation branches on the sign of $z$ to avoid extreme-score overflow.`),
  block('code', '先实现稳定 sigmoid，再查看零分数和极端分数。', 'Implement a stable sigmoid, then inspect zero and extreme scores.', { code: `def sigmoid(z):\n    return np.where(z >= 0, 1 / (1 + np.exp(-z)), np.exp(z) / (1 + np.exp(z)))\nfor z in [-20., -8., 0., 8., 20.]:\n    print(z, sigmoid(z))` }),
  block('runtime-output', '发布读数：\n\n```text\nz=-20 -> 2.0611536e-09\nz=0   -> 0.5\nz=20  -> 0.9999999979388463\nrow 1 log-odds=-54.33776892070457\n```', 'Published readings:\n\n```text\nz=-20 -> 2.0611536e-09\nz=0   -> 0.5\nz=20  -> 0.9999999979388463\nrow 1 log-odds=-54.33776892070457\n```'),
  block('prediction', '先预测：把 $z$ 从 0 改到 2，概率会线性增加 0.2 吗？', 'Predict first: if $z$ changes from 0 to 2, will probability rise linearly by 0.2?'),
  media('linear-score-to-sigmoid', '暂停动画，对比零分数、近边界与饱和区域的变化速度。', 'Pause the animation to compare change near zero, near the boundary, and in saturation.'),
  lab('sigmoid-probability', '拖动有限范围内的 logit，切换 probability、odds 与 log-odds 读数。', 'Drag a bounded logit and switch among probability, odds, and log-odds readings.'),
  block('observation', 'sigmoid 保留排序，却压缩两端距离：饱和区继续增大分数只带来很小概率变化。', 'Sigmoid preserves order but compresses both ends: increasing a saturated score changes probability only slightly.'),
  block('misconception', '概率接近 1 不是客观确定性，只是当前特征和参数下的模型输出。', 'A probability near 1 is not objective certainty; it is a model output under current features and parameters.'),
  block('conclusion', '有了每行概率，就能问参数怎样让已观察标签更可能。下一章从 Bernoulli 似然开始。', 'With a probability for each row, we can ask how parameters make observed labels more likely. Next starts with Bernoulli likelihood.'),
]

const likelihood: readonly LogisticCourseBlock[] = [
  block('question', '为什么要先最大化已观察标签的概率，而不是直接数“预测对了几条”？', 'Why first maximize the probability of observed labels instead of directly counting “how many predictions are right”?'),
  block('explanation', '对一条有标签记录，模型只应获得它实际标签的概率。先看 row 1，再累计近边界、正确且自信和高损失三条冻结记录。默认 $p\ge0.5$ 到 class 1 只是桥梁；阈值选择与分类指标属于下一阶段。', 'For one labeled record, the model should receive the probability of its observed label. Start with row 1, then accumulate frozen near-boundary, correct-and-confident, and high-loss rows. Default $p\ge0.5$ to class 1 is only a bridge; threshold selection and classification metrics belong to the next phase.'),
  block('formula', String.raw`对一行 $y\in\{0,1\}$，$q=p^y(1-p)^{1-y}$。独立多行的似然为

$$\mathcal L=\prod_iq_i,\qquad \log\mathcal L=\sum_i\log q_i.$$

最大化 log-likelihood 等价于最小化 $-\frac1n\sum_i\log q_i$，即平均 BCE。`, String.raw`For one row with $y\in\{0,1\}$, $q=p^y(1-p)^{1-y}$. For independent rows,

$$\mathcal L=\prod_iq_i,\qquad \log\mathcal L=\sum_i\log q_i.$$

Maximizing log-likelihood is equivalent to minimizing $-\frac1n\sum_i\log q_i$, the mean BCE.`),
  block('code', '概率乘积很快变小；对数把乘法改成逐项可累加的和。', 'Probability products get tiny quickly; logarithms turn multiplication into an incrementally addable sum.', { code: `q = np.array([1.0, 0.5428568222, 1.0, 0.0152700870])\nprint(q.prod(), np.log(q).sum(), -np.log(q).mean())` }),
  block('runtime-output', '冻结四行小批量：\n\n```text\nproduct likelihood = 0.008289470886818511\nlog likelihood     = -4.79276913734611\nmean BCE           = 1.1981922843365275\n```', 'Frozen four-row mini-batch:\n\n```text\nproduct likelihood = 0.008289470886818511\nlog likelihood     = -4.79276913734611\nmean BCE           = 1.1981922843365275\n```'),
  block('prediction', '先预测：加入一条真实标签概率很小的行，乘积与 log-sum 会朝哪边变化？', 'Predict first: after adding a row with tiny observed-label probability, how do the product and log sum change?'),
  media('likelihood-to-bce-gradient', '动画从一行 Bernoulli 贡献展开到乘积、对数和与平均损失。', 'The animation expands one Bernoulli contribution into product, log sum, and mean loss.'),
  lab('threshold-decisions', '逐行累积冻结记录，比较概率乘积和 log-likelihood。', 'Accumulate frozen rows one at a time and compare probability-product and log-likelihood.'),
  block('observation', 'row 919 的标签为 class 1，却只得到 `0.01527008697` 的 class 1 概率，显著拉低似然。对数和保留排序并避免长乘积下溢。', 'Row 919 has class 1 but receives only `0.01527008697` class 1 probability, strongly lowering likelihood. The log sum preserves ordering and avoids long-product underflow.'),
  block('misconception', '默认 0.5 阈值不在似然定义里。先拟合概率，后续课程再选择阈值。', 'The default 0.5 threshold is not in the likelihood definition. Fit probabilities first; select a threshold later.'),
  block('conclusion', 'log-likelihood 给出可微目标。下一章把它写成稳定 BCE 并推导梯度。', 'Log-likelihood gives a differentiable objective. Next we write stable BCE and derive its gradient.'),
]

const logLoss: readonly LogisticCourseBlock[] = [
  block('question', '怎样用稳定损失和可核对梯度告诉参数该向哪里更新？', 'How can stable loss and checkable gradients tell parameters where to update?'),
  block('explanation', '对极端错误先计算 `log(p)` 容易不稳定，更安全的是直接从 logit 计算。仍先看一条高损失真实行，再平均到 960 条训练记录。', 'Computing `log(p)` for extreme errors can be unstable; it is safer to work directly from logits. We still start with one real high-loss row, then average over 960 training rows.'),
  block('formula', String.raw`$$\ell(z,y)=\operatorname{softplus}(z)-yz,\qquad \frac{\partial\ell}{\partial z}=p-y.$$

一行的系数贡献是 $\nabla_{\mathbf w}\ell=(p-y)\mathbf x$；批量为

$$\nabla_{\mathbf w}L=\frac{X^{\top}(\mathbf p-\mathbf y)}n,\qquad \frac{\partial L}{\partial b}=\operatorname{mean}(\mathbf p-\mathbf y).$$`, String.raw`$$\ell(z,y)=\operatorname{softplus}(z)-yz,\qquad \frac{\partial\ell}{\partial z}=p-y.$$

One row contributes $\nabla_{\mathbf w}\ell=(p-y)\mathbf x$; in a batch,

$$\nabla_{\mathbf w}L=\frac{X^{\top}(\mathbf p-\mathbf y)}n,\qquad \frac{\partial L}{\partial b}=\operatorname{mean}(\mathbf p-\mathbf y).$$`),
  block('code', '中心差分在训练前核对解析梯度。', 'Use central difference before training to check the analytic gradient.', { code: `def bce_from_logits(z, y):\n    return np.mean(np.logaddexp(0.0, z) - y * z)\ndef centered(loss, theta, j, h=1e-6):\n    plus, minus = theta.copy(), theta.copy()\n    plus[j] += h; minus[j] -= h\n    return (loss(plus) - loss(minus)) / (2 * h)` }),
  block('runtime-output', '发布的参数顺序为 `[variance, skewness, curtosis, entropy, intercept]`：\n\n```text\nmean stable BCE = 0.7455450279170539\nh = 1e-6\nmax |analytic - centered| = 7.450942640652158e-11\n```', 'Published parameter order is `[variance, skewness, curtosis, entropy, intercept]`:\n\n```text\nmean stable BCE = 0.7455450279170539\nh = 1e-6\nmax |analytic - centered| = 7.450942640652158e-11\n```'),
  block('prediction', '先预测：真实标签为 1 且 $p$ 很小时，$p-y$ 的符号是什么？沿负梯度更新会怎样改变 logit？', 'Predict first: with observed label 1 and small $p$, what is the sign of $p-y$? What does negative-gradient motion do to the logit?'),
  media('log-loss-confident-mistake', '动画展示高置信错误的损失和残差信号如何接到梯度检查。', 'The animation shows a confident mistake’s loss and how its residual connects to the gradient check.'),
  lab('log-loss', '选择发布差分步长，比较解析梯度、中心差分与每个参数误差。', 'Choose a published finite-difference step and compare analytic gradient, central difference, and per-parameter error.'),
  block('observation', '步长并非越小越好：太大有截断误差，太小会被浮点舍入影响。发布的 `1e-6` 检查确认解析梯度后才让其驱动训练。', 'A step is not simply better when smaller: large steps have truncation error and tiny ones feel floating-point rounding. The published `1e-6` check confirms the analytic gradient before training uses it.'),
  block('misconception', '一个高损失样本不要求模型单独“修好它”。batch 梯度平均所有行贡献，服务于声明的整体目标。', 'A high-loss row does not require the model to “fix it” alone. Batch gradient averages every row’s contribution for the declared global objective.'),
  block('conclusion', '损失、梯度和检查现已对齐。下一章用同一目标做确定性训练，并在同一合同下比较 sklearn。', 'Loss, gradient, and check now align. Next we train deterministically with the same objective and compare scikit-learn under the same contract.'),
]

const regularization: readonly LogisticCourseBlock[] = [
  block('question', '怎样区分“两个实现对齐”与“已经换了一个 L2 目标函数”？', 'How do we distinguish “two implementations align” from “we changed to an L2 objective”?'),
  block('explanation', '先固定训练集标准化、特征顺序、截距和未正则化稳定 BCE。scratch 和 scikit-learn 只有在这些条件、停止规则和容差一致后才可比较；之后才加入 L2。', 'First fix train-only standardization, feature order, intercept, and unregularized stable BCE. Scratch and scikit-learn are comparable only after these conditions, stopping rule, and tolerance align; only then add L2.'),
  block('formula', String.raw`基线是 $L_{\mathrm{BCE}}=\operatorname{mean}(\operatorname{softplus}(z)-yz)$，更新为 $\theta\leftarrow\theta-\eta\nabla L_{\mathrm{BCE}}$。

L2 改变问题：$$L_{\mathrm{L2}}=L_{\mathrm{BCE}}+\frac{\lambda}{2}\lVert\mathbf w\rVert_2^2.$$ 截距不受惩罚。`, String.raw`The baseline is $L_{\mathrm{BCE}}=\operatorname{mean}(\operatorname{softplus}(z)-yz)$, updated by $\theta\leftarrow\theta-\eta\nabla L_{\mathrm{BCE}}$.

L2 changes the problem: $$L_{\mathrm{L2}}=L_{\mathrm{BCE}}+\frac{\lambda}{2}\lVert\mathbf w\rVert_2^2.$$ The intercept is not penalized.`),
  block('code', '明确 scratch 停止条件，再声明库的同一目标和配置。', 'State scratch stopping explicitly, then declare the library’s matching objective and configuration.', { code: `# scratch: Armijo line search, l2=0\nwhile gradient_norm > 1e-8:\n    theta = theta - accepted_step * gradient\n# same scaled X, feature order, intercept, l2=0\nLogisticRegression(C=float('inf'), solver='lbfgs', tol=1e-12, max_iter=5000)` }),
  block('runtime-output', '发布对齐：\n\n```text\nscratch stop: iteration 90542 (gradient-norm)\nterminal mean BCE: 0.011867429046995634\nmax parameter delta: 0.00015996734427758952\nmax validation probability delta: 8.860994619164231e-07\nL2 objective (lambda=0.05): 0.3463182734496942\n```', 'Published alignment:\n\n```text\nscratch stop: iteration 90542 (gradient-norm)\nterminal mean BCE: 0.011867429046995634\nmax parameter delta: 0.00015996734427758952\nmax validation probability delta: 8.860994619164231e-07\nL2 objective (lambda=0.05): 0.3463182734496942\n```'),
  block('prediction', '先预测：若保留库的默认正则化再称它和 scratch “不同”，能说明实现差异吗？', 'Predict first: if a library default regularizer remains and then it is called “different” from scratch, does that establish an implementation difference?'),
  media('regularization-confidence-field', '动画先固定未正则化对照，再显式加 L2；它不是“L2 永远更好”的排名。', 'The animation fixes unregularized parity first, then explicitly adds L2; it is not a ranking that says L2 is always better.'),
  lab('regularization', '回放发布的 scratch、对齐 sklearn 与 L2 结果；复杂训练不会在浏览器重新拟合。', 'Replay published scratch, aligned scikit-learn, and L2 results; complex training is not refit in the browser.'),
  block('observation', '小的参数和验证概率差说明两个声明的未正则化实现数值对齐。L2 属于不同目标，不能称为同一训练只换了库。', 'Small parameter and validation-probability deltas show numerical alignment for declared unregularized implementations. L2 is a different objective, not the same training with another library.'),
  block('misconception', '正则化不是自动改善一切的开关，系数也不是因果效应。它是此处明示目标函数的一项。', 'Regularization is not a switch that automatically improves everything, and coefficients are not causal effects. Here it is an explicit objective term.'),
  block('conclusion', '模型和概率生成合同已经冻结。最后一章检查概率刻度与线性边界的限制。', 'The model and probability-generation contract are now frozen. The final chapter checks probability scale and linear-boundary limits.'),
]

const limits: readonly LogisticCourseBlock[] = [
  block('question', '默认类别不变时，概率质量也一定相同吗？训练更久能把直线变成圆吗？', 'When default classes stay the same, is probability quality necessarily the same? Can longer training turn a line into a circle?'),
  block('explanation', '校准只使用冻结 validation logits：保留样本排序和默认 0.5 类别，控制地 sharpen 或 soften 概率。XOR 与同心圆是明确标注的 synthetic 容量诊断，不参与 Banknote 拟合、选择或评估。', 'Calibration uses only frozen validation logits: it retains ordering and default 0.5 classes while deliberately sharpening or softening probabilities. XOR and concentric circles are explicitly synthetic capacity diagnostics and never participate in Banknote fitting, selection, or evaluation.'),
  block('formula', String.raw`校准关心概率和频率是否匹配，默认桥梁仍是 $p\ge0.5$。温度变换为

$$p_T=\sigma(z/T),\qquad T>0.$$

它改变概率刻度但不改变排序。单条线性边界 $\mathbf w^\top\mathbf x+b=0$ 无法同时分开 XOR 对角类或内外两圈。`, String.raw`Calibration asks whether probabilities match frequencies while the default bridge remains $p\ge0.5$. A temperature transform is

$$p_T=\sigma(z/T),\qquad T>0.$$

It changes probability scale but not ordering. One linear boundary $\mathbf w^\top\mathbf x+b=0$ cannot separate XOR diagonals or inner and outer circles simultaneously.`),
  block('code', '同一冻结 logit 生成三个概率刻度；不会重新训练，也不会查看保留的最终记录。', 'One frozen logit set generates three probability scales; this does not retrain or inspect reserved final records.', { code: `def calibrated_probability(logits, temperature):\n    return sigmoid(logits / temperature)\noriginal = calibrated_probability(validation_logits, 1.0)\nsharpened = calibrated_probability(validation_logits, 0.65)\nsoftened = calibrated_probability(validation_logits, 1.75)` }),
  block('runtime-output', '发布的 validation 对照固定默认阈值准确率为 `0.9902912621359223`；original、sharpened、softened 的校准误差不同。页面不展示最终保留集的标签、指标或结果。', 'The published validation contrast fixes default-threshold accuracy at `0.9902912621359223`; original, sharpened, and softened have different calibration error. This page does not show labels, metrics, or outcomes from the reserved final split.'),
  block('prediction', '先预测：若 logits 符号不变，默认 0.5 类别会变吗？若线性边界训练更久，会变成圆吗？', 'Predict first: if logit signs do not change, do default 0.5 classes change? If a linear boundary trains longer, does it become a circle?'),
  lab('linear-limits', '切换三个冻结概率刻度，再在 separate synthetic XOR 与 circles 视图检查线性限制。', 'Switch three frozen probability scales, then inspect the linear limit in separate synthetic XOR and circles views.'),
  block('observation', '默认类别不变不代表概率质量相同。优化器只能在函数族内找参数，不能让一条直线表示非线性拓扑。', 'Unchanged default classes do not imply identical probability quality. An optimizer can choose parameters within a function family but cannot make one line represent nonlinear topology.'),
  block('misconception', '不要用此 validation 对照挑阈值，也不要把 synthetic XOR/circles 当作 Banknote 结果。阈值扫描、混淆矩阵、precision、recall、F1、ROC、AUC 留给下一阶段。', 'Do not choose a threshold from this validation contrast or treat synthetic XOR/circles as Banknote results. Threshold sweeps, confusion matrices, precision, recall, F1, ROC, and AUC wait for the next phase.'),
  block('conclusion', '本课程冻结训练与概率生成合同。下一课将在 validation 数据上选择操作阈值，并只在那个合同下首次检查冻结的最终结果。', 'This course freezes the training and probability-generation contract. The next course will choose an operating threshold on validation data and inspect the frozen final result only under that contract.'),
]

export const logisticCourseChapters: readonly LogisticCourseChapter[] = [
  { id: 'linear-score', title: loc('线性分数：从一条真实记录开始', 'Linear score: start with one real record'), blocks: linearScore, media: ['linear-score-to-sigmoid'] },
  { id: 'sigmoid-probability', title: loc('Sigmoid：把分数变成概率', 'Sigmoid: turn scores into probability'), blocks: sigmoidProbability, media: ['linear-score-to-sigmoid'] },
  { id: 'threshold-decisions', title: loc('似然：让已观察标签更可能', 'Likelihood: make observed labels more likely'), blocks: likelihood, media: ['likelihood-to-bce-gradient'] },
  { id: 'log-loss', title: loc('Log loss：稳定损失与梯度', 'Log loss: stable loss and gradients'), blocks: logLoss, media: ['log-loss-confident-mistake'] },
  { id: 'regularization', title: loc('训练与 L2：对齐后再改变目标', 'Training and L2: align before changing the objective'), blocks: regularization, media: ['regularization-confidence-field'] },
  { id: 'linear-limits', title: loc('概率校准与线性边界的限制', 'Calibration and the limits of a linear boundary'), blocks: limits },
]

export const logisticCourseReferences = [
  { href: 'https://archive.ics.uci.edu/dataset/267/banknote+authentication', label: loc('UCI Banknote Authentication 数据集（CC BY 4.0）', 'UCI Banknote Authentication dataset (CC BY 4.0)') },
  { href: 'https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression', label: loc('scikit-learn：Logistic Regression', 'scikit-learn: Logistic Regression') },
  { href: 'https://scikit-learn.org/stable/common_pitfalls.html', label: loc('scikit-learn：常见陷阱与数据泄漏', 'scikit-learn: Common pitfalls and data leakage') },
  { href: 'https://d2l.ai/chapter_linear-classification/softmax-regression.html', label: loc('动手学深度学习：线性分类与交叉熵', 'Dive into Deep Learning: linear classification and cross-entropy') },
] as const
export const logisticCourseDownloads = [
  { path: '/logistic-regression/phase-29/banknote-logistic-regression.zh-CN.ipynb', label: loc('已执行 Banknote Notebook（中文）', 'Executed Banknote notebook (Chinese)'), kind: 'notebook' },
  { path: '/logistic-regression/phase-29/banknote-logistic-regression.en.ipynb', label: loc('已执行 Banknote Notebook（English）', 'Executed Banknote notebook (English)'), kind: 'notebook' },
  { path: '/logistic-regression/phase-29/manifest.json', label: loc('可复现资产清单', 'Reproducible asset manifest'), kind: 'json' },
  { path: '/logistic-regression/phase-29/outputs/gradient-check.json', label: loc('梯度检查输出', 'Gradient-check output'), kind: 'json' },
] as const
export const logisticCourseChapterOrder = LOGISTIC_CHAPTER_IDS
