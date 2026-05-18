import type { AlgorithmModuleDefinition, LocalizedCopy } from '../types/ml'
import { simulateLogisticRegression } from '../simulations/logisticRegression'
import { algorithmCheckpointsBySlug } from './algorithmCheckpoints'

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

const googleLogisticSource = {
  label: loc('Google ML Crash Course：Logistic Regression', 'Google ML Crash Course: Logistic Regression'),
  href: 'https://developers.google.com/machine-learning/crash-course/logistic-regression',
}

const googleSigmoidSource = {
  label: loc('Google ML Crash Course：Sigmoid Function', 'Google ML Crash Course: Sigmoid Function'),
  href: 'https://developers.google.com/machine-learning/crash-course/logistic-regression/sigmoid-function',
}

const googleLossSource = {
  label: loc('Google ML Crash Course：Loss and Regularization', 'Google ML Crash Course: Loss and Regularization'),
  href: 'https://developers.google.com/machine-learning/crash-course/logistic-regression/loss-regularization',
}

export const logisticRegressionModule: AlgorithmModuleDefinition = {
  slug: 'logistic-regression',
  route: '/learn/logistic-regression',
  titleKey: 'modules.logisticRegression.title',
  kickerKey: 'modules.logisticRegression.kicker',
  introKey: 'modules.logisticRegression.intro',
  summaryKey: 'modules.logisticRegression.summary',
  theme: '#e7f4f1',
  accent: '#1ea67a',
  checkpoints: algorithmCheckpointsBySlug['logistic-regression'],
  visuals: [
    {
      id: 'probability-field-context',
      type: 'image',
      title: loc('概率背景中的线性边界', 'A linear boundary inside a probability field'),
      caption: loc(
        '蓝色和橙色区域不是硬分类结果，而是模型给正类概率逐渐变化的背景。',
        'The blue and orange regions are not hard labels; they show smoothly changing positive-class probability.',
      ),
      assetPath: '/logistic-regression/generated/probability-field-context.png',
    },
    {
      id: 'regularization-confidence-context',
      type: 'image',
      title: loc('正则化让概率背景更克制', 'Regularization makes confidence calmer'),
      caption: loc(
        '左侧代表过度尖锐的置信度，右侧代表受正则化约束后更平滑的概率场。',
        'The left side represents over-sharp confidence; the right side shows a smoother field under regularization.',
      ),
      assetPath: '/logistic-regression/generated/regularization-confidence-context.png',
    },
    {
      id: 'linear-score-to-sigmoid',
      type: 'manim-video',
      title: loc('从线性分数到 sigmoid 概率', 'From linear score to sigmoid probability'),
      caption: loc(
        '分数先决定样本在边界哪一侧，sigmoid 再把证据压缩到 0 到 1 的概率。',
        'The score first places the example relative to the boundary; sigmoid compresses that evidence to probability.',
      ),
      assetPath: '/manim/logistic-regression/linear-score-to-sigmoid.mp4',
      posterPath: '/manim/logistic-regression/linear-score-to-sigmoid.svg',
    },
    {
      id: 'log-loss-confident-mistake',
      type: 'manim-video',
      title: loc('Log loss 放大自信错误', 'Log loss amplifies confident mistakes'),
      caption: loc(
        '真实类别概率越接近 0，负对数损失上升越快。',
        'The closer the true-class probability gets to 0, the faster negative log loss rises.',
      ),
      assetPath: '/manim/logistic-regression/log-loss-confident-mistake.mp4',
      posterPath: '/manim/logistic-regression/log-loss-confident-mistake.svg',
    },
    {
      id: 'regularization-confidence-field',
      type: 'manim-video',
      title: loc('正则化限制权重放大', 'Regularization limits weight growth'),
      caption: loc(
        '边界位置可能变化不大，但权重范数会决定概率背景有多尖锐。',
        'The boundary may move only slightly, but the weight norm controls how sharp the probability field becomes.',
      ),
      assetPath: '/manim/logistic-regression/regularization-confidence-field.mp4',
      posterPath: '/manim/logistic-regression/regularization-confidence-field.svg',
    },
  ],
  chapters: [
    {
      id: 'linear-score',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.logisticRegression.sections.linearScore.title',
      title: loc('线性打分：先得到证据，再谈分类', 'Linear score: evidence before classification'),
      pageSummary: loc(
        '逻辑回归不是直接输出 0 或 1。它先用一组线性参数给样本打分，分数为 0 的位置就是当前阈值下的分界线。',
        'Logistic regression does not emit 0 or 1 directly. It first scores the example with linear parameters, and the zero-score set is the default boundary.',
      ),
      estimatedMinutes: 8,
      markdown: loc(
        `### 核心问题
逻辑回归为什么叫“回归”，却用于分类？

### 概念直觉
它的第一步和线性回归很像：把特征加权求和得到线性分数 \(z\)。这个分数是证据，不是概率，也不是最终类别。

在二维平面中，满足 \(w_1x_1+w_2x_2+b=0\) 的点组成一条直线。直线一侧更像正类，另一侧更像负类。

### 手算例子
某封邮件有两个特征：可疑关键词数 \(x_1=2\)，发件人风险 \(x_2=1\)。若 \(w_1=0.8,w_2=-0.5,b=-0.7\)，则

$$z=0.8\\times2-0.5\\times1-0.7=0.4$$

这个 0.4 只说明样本在边界的正类一侧，概率要到下一页才计算。

### 公式
$$z=\\mathbf{w}^\\top\\mathbf{x}+b$$

默认决策边界：

$$\\mathbf{w}^\\top\\mathbf{x}+b=0$$

### 常见误解
不要把逻辑回归理解成“套了一个分类 if 语句的线性回归”。分类来自分数、概率和阈值三步组合。`,
        `### Core Question
Why is logistic regression called regression if it is used for classification?

### Concept
Its first step resembles linear regression: features are linearly weighted into a score \(z\). That score is evidence, not yet probability or the final class.

In 2D, points satisfying \(w_1x_1+w_2x_2+b=0\) form a line. One side leans positive; the other side leans negative.

### Worked Example
Suppose an email has suspicious keyword count \(x_1=2\) and sender risk \(x_2=1\). With \(w_1=0.8,w_2=-0.5,b=-0.7\):

$$z=0.8\\times2-0.5\\times1-0.7=0.4$$

The score 0.4 only says the example is on the positive side of the boundary. The probability comes next.

### Formula
$$z=\\mathbf{w}^\\top\\mathbf{x}+b$$

Default boundary:

$$\\mathbf{w}^\\top\\mathbf{x}+b=0$$

### Common Mistake
Do not read logistic regression as linear regression with a classification if-statement. Classification comes from score, probability, and threshold together.`,
      ),
      callout: loc(
        '先看虚线边界的位置和方向，再看背景概率。它们是同一组参数的两种表现。',
        'Read the dashed boundary first, then the probability background. They are two views of the same parameters.',
      ),
      experimentPrompt: loc(
        '使用“线性可分”预设，观察边界如何旋转和平移到两类样本之间。',
        'Use the linearly separable preset and watch the boundary rotate and shift between the two classes.',
      ),
      presetId: 'linearly-separable',
      focusTarget: 'boundary',
      visualIds: ['probability-field-context', 'linear-score-to-sigmoid'],
      sources: [googleLogisticSource],
      metricEmphasis: ['accuracy', 'weightNorm'],
    },
    {
      id: 'sigmoid-probability',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.logisticRegression.sections.sigmoidProbability.title',
      title: loc('Sigmoid：把任意分数压成概率', 'Sigmoid: compress any score into probability'),
      pageSummary: loc(
        '线性分数可以无限大或无限小，但类别概率必须落在 0 到 1。sigmoid 保留顺序，同时把尺度变成概率。',
        'The score can be unbounded, but probability must stay between 0 and 1. Sigmoid preserves order while changing the scale.',
      ),
      estimatedMinutes: 7,
      markdown: loc(
        `### 核心问题
线性分数怎样变成“正类概率”？

### 概念直觉
sigmoid 函数把任意实数压到 0 和 1 之间。\(z=0\) 时概率正好是 0.5；\(z\) 越大，概率越接近 1；\(z\) 越小，概率越接近 0。

### 手算例子
延续上一页的 \(z=0.4\)：

$$\\sigma(0.4)=\\frac{1}{1+e^{-0.4}}\\approx0.60$$

模型不是说“绝对是正类”，而是说正类概率约为 60%。

### 公式
$$p(y=1\\mid\\mathbf{x})=\\sigma(z)=\\frac{1}{1+e^{-z}}$$

### 常见误解
概率接近 1 不代表客观确定，只代表模型在当前特征和参数下非常自信。`,
        `### Core Question
How does a linear score become a positive-class probability?

### Concept
The sigmoid function compresses any real number into the interval from 0 to 1. At \(z=0\), probability is exactly 0.5; larger \(z\) approaches 1, and smaller \(z\) approaches 0.

### Worked Example
Using the previous score \(z=0.4\):

$$\\sigma(0.4)=\\frac{1}{1+e^{-0.4}}\\approx0.60$$

The model is not saying the example is certainly positive. It is saying positive probability is about 60%.

### Formula
$$p(y=1\\mid\\mathbf{x})=\\sigma(z)=\\frac{1}{1+e^{-z}}$$

### Common Mistake
A probability near 1 does not mean objective certainty. It means the model is very confident under its current features and parameters.`,
      ),
      callout: loc(
        '边界附近概率最接近 0.5，离边界越远，概率越容易饱和。',
        'Probability is closest to 0.5 near the boundary and saturates farther away.',
      ),
      experimentPrompt: loc(
        '播放训练，观察背景从灰蓝过渡变成更明确的概率区域。',
        'Play training and watch the background move from uncertain colors into clearer probability regions.',
      ),
      presetId: 'linearly-separable',
      focusTarget: 'background',
      visualIds: ['linear-score-to-sigmoid'],
      sources: [googleSigmoidSource],
      metricEmphasis: ['meanTrueClassProbability', 'accuracy'],
    },
    {
      id: 'threshold-decisions',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.logisticRegression.sections.thresholdDecisions.title',
      title: loc('阈值：把概率翻译成业务决策', 'Thresholds: translate probability into decisions'),
      pageSummary: loc(
        '0.5 只是默认阈值。真实任务会根据误报、漏报和类别比例调整阈值。',
        '0.5 is only the default threshold. Real tasks adjust thresholds around false positives, false negatives, and class balance.',
      ),
      estimatedMinutes: 8,
      markdown: loc(
        `### 核心问题
为什么概率模型还需要阈值？

### 概念直觉
模型输出的是 \(p(y=1\\mid x)\)，但业务动作通常需要“判为正类”或“判为负类”。阈值就是这一步翻译规则。

阈值提高时，模型更谨慎，误报通常减少，但漏报可能增加。阈值降低时，模型更积极，召回可能提升，但误报也会增加。

### 手算例子
若正类概率为 0.62：

- 阈值 0.5：判为正类
- 阈值 0.7：判为负类

同一个模型、同一个概率，会因为决策成本不同而给出不同动作。

### 公式
$$\\hat{y}=1 \\quad \\text{if} \\quad p(y=1\\mid x)\\ge t$$

### 常见误解
不要把准确率当成唯一目标。欺诈、医疗筛查和垃圾邮件过滤对误报和漏报的成本不同。`,
        `### Core Question
Why does a probability model still need a threshold?

### Concept
The model outputs \(p(y=1\\mid x)\), while many applications need a positive or negative action. The threshold is that translation rule.

Raising the threshold makes the model more conservative, often reducing false positives while increasing false negatives. Lowering it makes the model more aggressive.

### Worked Example
If positive probability is 0.62:

- threshold 0.5: predict positive
- threshold 0.7: predict negative

The same model and probability can lead to different actions when costs differ.

### Formula
$$\\hat{y}=1 \\quad \\text{if} \\quad p(y=1\\mid x)\\ge t$$

### Common Mistake
Do not treat accuracy as the only target. Fraud detection, screening, and spam filtering value false positives and false negatives differently.`,
      ),
      callout: loc(
        '拖动阈值时，边界会随 logit 阈值平移，混淆矩阵会同步改变。',
        'When the threshold moves, the boundary shifts by the threshold logit and the confusion matrix changes with it.',
      ),
      experimentPrompt: loc(
        '保持模型参数不变，只调阈值，比较 precision 和 recall 的取舍。',
        'Keep model parameters fixed and adjust only the threshold to compare precision and recall.',
      ),
      presetId: 'threshold-tradeoff',
      focusTarget: 'boundary',
      sources: [googleLogisticSource],
      metricEmphasis: ['precision', 'recall'],
    },
    {
      id: 'log-loss',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.logisticRegression.sections.logLoss.title',
      title: loc('Log loss：错得越自信，惩罚越重', 'Log loss: confident mistakes cost more'),
      pageSummary: loc(
        '训练时不只数对错，还会看模型给真实类别分配了多少概率。真实类别概率越低，损失越大。',
        'Training does not merely count right and wrong. It checks how much probability the model assigns to the true class.',
      ),
      estimatedMinutes: 9,
      markdown: loc(
        `### 核心问题
为什么“自信地错”比“犹豫地错”更糟？

### 概念直觉
log loss 关注真实类别拿到的概率。如果真实标签是 1，而模型只给了 \(p=0.1\)，它不只是错了，还把概率大量分给了错误方向。

### 手算例子
真实标签为 \(y=1\)：

- \(p=0.9\)：损失为 \(-\\log(0.9)\\approx0.105\)
- \(p=0.1\)：损失为 \(-\\log(0.1)\\approx2.303\)

### 公式
$$\\mathcal{L}= -\\frac{1}{N}\\sum_i \\left[y_i\\log \\hat{y}_i+(1-y_i)\\log(1-\\hat{y}_i)\\right]$$

### 常见误解
交叉熵不是“分类版 MSE”。它来自概率建模中的负对数似然，特别不喜欢把真实类别概率压到接近 0。`,
        `### Core Question
Why is being confidently wrong worse than being uncertainly wrong?

### Concept
Log loss focuses on the probability assigned to the true class. If the true label is 1 and the model gives \(p=0.1\), it is not only wrong; it placed most probability in the wrong direction.

### Worked Example
For true label \(y=1\):

- \(p=0.9\): loss is \(-\\log(0.9)\\approx0.105\)
- \(p=0.1\): loss is \(-\\log(0.1)\\approx2.303\)

### Formula
$$\\mathcal{L}= -\\frac{1}{N}\\sum_i \\left[y_i\\log \\hat{y}_i+(1-y_i)\\log(1-\\hat{y}_i)\\right]$$

### Common Mistake
Cross-entropy is not classification-flavored MSE. It is negative log-likelihood under a probability model, and it strongly dislikes assigning near-zero probability to the true class.`,
      ),
      callout: loc(
        '观察 loss 下降时，真实类别平均概率是否同步升高。',
        'Watch whether the mean true-class probability rises as loss falls.',
      ),
      experimentPrompt: loc(
        '暂停在训练中段，比较边界附近样本的概率和样本损失。',
        'Pause midway and compare near-boundary probabilities with per-sample loss.',
      ),
      presetId: 'linearly-separable',
      focusTarget: 'background',
      visualIds: ['log-loss-confident-mistake'],
      sources: [googleLossSource],
      metricEmphasis: ['loss', 'meanTrueClassProbability'],
    },
    {
      id: 'regularization',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.logisticRegression.sections.regularization.title',
      title: loc('正则化：限制过度自信的权重', 'Regularization: restrain overconfident weights'),
      pageSummary: loc(
        '线性可分数据上，逻辑回归可能继续放大权重，让概率背景过度尖锐。L2 正则给大权重加成本。',
        'On nearly separable data, logistic regression may keep growing weights and sharpen the probability field. L2 regularization adds a cost to large weights.',
      ),
      estimatedMinutes: 8,
      markdown: loc(
        `### 核心问题
为什么线性分类器也需要正则化？

### 概念直觉
当数据几乎线性可分时，边界位置可能已经足够好，但模型仍能通过放大权重让概率更接近 0 或 1。这样训练集看起来更自信，却可能对噪声更敏感。

L2 正则化把权重大小写进目标函数，提醒模型不要为了少数样本过度倾斜。

### 手算例子
两个模型 BCE 接近：

- 模型 A：\(\lVert w\rVert^2=4\)
- 模型 B：\(\lVert w\rVert^2=25\)

若 \(\lambda=0.02\)，正则项分别是 0.08 和 0.50，模型 B 付出更大成本。

### 公式
$$J(\\mathbf{w},b)=\\text{BCE}(\\mathbf{w},b)+\\lambda\\lVert\\mathbf{w}\\rVert^2$$

### 常见误解
正则化不是让模型“不学习”，而是让模型少用过大的权重解释噪声。`,
        `### Core Question
Why does a linear classifier also need regularization?

### Concept
When data is nearly linearly separable, the boundary may already be good enough, but the model can still increase weights to push probabilities closer to 0 or 1. That can look confident on training data while becoming more sensitive to noise.

L2 regularization writes weight size into the objective and discourages over-tilting for a few examples.

### Worked Example
Two models have similar BCE:

- model A: \(\lVert w\rVert^2=4\)
- model B: \(\lVert w\rVert^2=25\)

With \(\lambda=0.02\), the regularization terms are 0.08 and 0.50, so model B pays more.

### Formula
$$J(\\mathbf{w},b)=\\text{BCE}(\\mathbf{w},b)+\\lambda\\lVert\\mathbf{w}\\rVert^2$$

### Common Mistake
Regularization does not stop learning. It discourages using oversized weights to explain noise.`,
      ),
      callout: loc(
        '提高正则强度时，重点看 weight norm 和概率背景是否变得更平滑。',
        'When regularization increases, focus on weight norm and whether the probability field becomes smoother.',
      ),
      experimentPrompt: loc(
        '从“正则过强”预设开始，逐步降低 regularization，比较边界与 weight norm。',
        'Start from the over-regularized preset, then lower regularization and compare the boundary and weight norm.',
      ),
      presetId: 'over-regularized',
      focusTarget: 'background',
      visualIds: ['regularization-confidence-context', 'regularization-confidence-field'],
      sources: [googleLossSource],
      metricEmphasis: ['weightNorm', 'regularizationPenalty'],
    },
    {
      id: 'linear-limits',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.logisticRegression.sections.linearLimits.title',
      title: loc('线性限制：有些边界一条线画不出来', 'Linear limits: one line cannot draw every boundary'),
      pageSummary: loc(
        'XOR 结构需要弯曲或分块边界。继续训练只能在错误模型族中找折中。',
        'XOR-style structure needs curved or piecewise boundaries. More training only finds a compromise inside the wrong model family.',
      ),
      estimatedMinutes: 8,
      markdown: loc(
        `### 核心问题
什么时候问题不在优化，而在模型表达能力？

### 概念直觉
逻辑回归的边界是一条直线。如果真实结构需要包围、弯曲或分成多块，单条直线就会失败。

### 手算例子
XOR 四个角可以标成：

| 点 | 标签 |
|---|---|
| \((0,0)\) | 0 |
| \((1,1)\) | 0 |
| \((1,0)\) | 1 |
| \((0,1)\) | 1 |

任何一条直线都很难把两个对角正类和两个对角负类同时分开。

### 公式
$$\\mathbf{w}^\\top\\mathbf{x}+b=0 \\Rightarrow \\text{one straight split}$$

### 常见误解
不要把 XOR 失败归因于训练不够久。如果模型族没有正确形状，再多训练也只能得到折中。`,
        `### Core Question
When is the issue model expressivity rather than optimization?

### Concept
The boundary of logistic regression is a line. If the true structure needs an enclosure, a curve, or separated regions, one line fails.

### Worked Example
XOR corners can be labeled as:

| Point | Label |
|---|---|
| \((0,0)\) | 0 |
| \((1,1)\) | 0 |
| \((1,0)\) | 1 |
| \((0,1)\) | 1 |

No single line cleanly separates the two diagonal positive points from the two diagonal negative points.

### Formula
$$\\mathbf{w}^\\top\\mathbf{x}+b=0 \\Rightarrow \\text{one straight split}$$

### Common Mistake
Do not blame XOR failure on not training long enough. If the model family lacks the right shape, more training only finds a compromise.`,
      ),
      callout: loc(
        '把“训练不够”和“模型族不够”区分开，是进入 MLP 的关键。',
        'Separating insufficient training from insufficient model capacity is the bridge into MLP.',
      ),
      experimentPrompt: loc(
        '切到 XOR 预设并播放到最后，观察准确率和 loss 是否进入平台期。',
        'Switch to the XOR preset and play to the end; watch accuracy and loss plateau.',
      ),
      presetId: 'xor-failure',
      focusTarget: 'boundary',
      sources: [googleLogisticSource],
      metricEmphasis: ['accuracy', 'loss'],
    },
  ],
  controls: [
    { key: 'learningRate', type: 'range', labelKey: 'controls.learningRate', category: 'optimization', min: 0.02, max: 0.75, step: 0.01, format: 'number' },
    { key: 'regularization', type: 'range', labelKey: 'controls.regularization', category: 'optimization', min: 0, max: 0.18, step: 0.01, format: 'number' },
    { key: 'threshold', type: 'range', labelKey: 'controls.threshold', category: 'optimization', min: 0.1, max: 0.9, step: 0.01, format: 'percent' },
    { key: 'epochs', type: 'range', labelKey: 'controls.epochs', category: 'optimization', min: 20, max: 120, step: 2, format: 'integer' },
    { key: 'noise', type: 'range', labelKey: 'controls.noise', category: 'data', min: 0.03, max: 0.45, step: 0.01, format: 'number' },
    {
      key: 'datasetKind',
      type: 'select',
      labelKey: 'controls.dataset',
      category: 'data',
      options: [
        { value: 'blobs', labelKey: 'controls.options.blobs' },
        { value: 'tilted', labelKey: 'controls.options.tilted' },
        { value: 'xor', labelKey: 'controls.options.xor' },
      ],
    },
    { key: 'playbackMs', type: 'range', labelKey: 'controls.animationSpeed', category: 'playback', min: 70, max: 300, step: 10, format: 'speed' },
  ],
  presets: [
    {
      id: 'linearly-separable',
      label: loc('线性可分', 'Linearly separable'),
      description: loc('清晰的线性结构，适合观察边界、概率背景和 sigmoid。', 'A clean linear structure for boundary, probability, and sigmoid intuition.'),
      config: { datasetKind: 'tilted', regularization: 0.03, learningRate: 0.16, noise: 0.08, threshold: 0.5 },
    },
    {
      id: 'threshold-tradeoff',
      label: loc('阈值取舍', 'Threshold tradeoff'),
      description: loc('保持模型可分，但提高阈值来观察 precision 与 recall 的取舍。', 'Keep the model separable and raise the threshold to inspect precision and recall tradeoffs.'),
      config: { datasetKind: 'tilted', regularization: 0.03, learningRate: 0.16, noise: 0.14, threshold: 0.66 },
    },
    {
      id: 'over-regularized',
      label: loc('正则过强', 'Over-regularized'),
      description: loc('强正则让边界更保守，概率背景更平滑。', 'Strong regularization makes the boundary conservative and the probability field smoother.'),
      config: { datasetKind: 'blobs', regularization: 0.16, learningRate: 0.12, noise: 0.12, threshold: 0.5 },
    },
    {
      id: 'xor-failure',
      label: loc('XOR 失败', 'XOR failure'),
      description: loc('非线性结构会暴露单条直线边界的能力上限。', 'A nonlinear structure exposes the limit of one straight boundary.'),
      config: { datasetKind: 'xor', regularization: 0.01, learningRate: 0.14, noise: 0.1, threshold: 0.5 },
    },
  ],
  sourceNote: loc(
    '本模块参考 Google Machine Learning Crash Course 的逻辑回归、sigmoid、log loss 与正则化结构，并改写为本站的分页实验课程。',
    'This module adapts the structure of Google Machine Learning Crash Course logistic regression, sigmoid, log loss, and regularization into this site’s paged lab format.',
  ),
  createDefaultConfig: () => ({
    learningRate: 0.16,
    regularization: 0.03,
    threshold: 0.5,
    epochs: 70,
    noise: 0.12,
    datasetKind: 'tilted',
    playbackMs: 120,
  }),
  simulate: simulateLogisticRegression,
}
