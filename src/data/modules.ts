import type { AlgorithmModuleDefinition } from '../types/ml'
import { simulateGradientDescent } from '../simulations/gradientDescent'
import { simulateLogisticRegression } from '../simulations/logisticRegression'
import { simulateMLP } from '../simulations/mlp'

export const moduleOrder: AlgorithmModuleDefinition[] = [
  {
    slug: 'gradient-descent',
    route: '/learn/gradient-descent',
    titleKey: 'modules.gradientDescent.title',
    kickerKey: 'modules.gradientDescent.kicker',
    introKey: 'modules.gradientDescent.intro',
    summaryKey: 'modules.gradientDescent.summary',
    theme: '#f4efe3',
    accent: '#ff7d4d',
    chapters: [
      {
        id: 'terrain',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.gradientDescent.sections.terrain.title',
        markdown: {
          'zh-CN':
            '把损失函数想成一张二维地形图。每个位置对应一组参数，地势越低代表损失越小。\n\n$$L(w_1, w_2)=0.4w_1^2+0.7w_2^2+0.18w_1w_2+0.25\\sin(1.7w_1)\\cos(1.3w_2)$$\n\n当学生拖动初始点时，他们其实是在为模型挑选“从山的哪里出发”。颜色与轨迹组合起来，会让优化问题从抽象函数变成一张可探索的地图。',
          en:
            'Think of the loss function as a 2D terrain. Every location is one parameter choice, and lower terrain means lower loss.\n\n$$L(w_1, w_2)=0.4w_1^2+0.7w_2^2+0.18w_1w_2+0.25\\sin(1.7w_1)\\cos(1.3w_2)$$\n\nWhen students drag the starting point, they are literally choosing where the model begins on the landscape. The color field plus trajectory makes optimization feel spatial instead of abstract.',
        },
        callout: {
          'zh-CN': '先只看地形和起点，不急着调大学习率。目标是让学生先建立“损失地貌”的直觉。',
          en: 'Start with the landscape and the initial point. The goal is to build intuition for the loss surface before turning up the learning rate.',
        },
        experimentPrompt: {
          'zh-CN': '试试把起点拖到右上角，再观察轨迹是否会沿着谷底弯曲前进。',
          en: 'Try moving the starting point into the upper-right corner and watch whether the path bends along the valley floor.',
        },
        presetId: 'stable-descent',
        focusTarget: 'trajectory',
        linkedInsightIds: ['gradient-status'],
        metricEmphasis: ['loss', 'step'],
      },
      {
        id: 'slope',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.gradientDescent.sections.slope.title',
        markdown: {
          'zh-CN':
            '梯度描述当前点附近最陡的上升方向，所以参数更新要沿着**负梯度**走。\n\n$$\\mathbf{w}_{t+1}=\\mathbf{w}_t-\\eta\\nabla L(\\mathbf{w}_t)$$\n\n箭头越长，说明这一刻仍存在较大的修正空间。学生通常会在这里第一次真正看懂“为什么要减去梯度”。',
          en:
            'The gradient describes the steepest local rise, so the update moves in the **negative gradient** direction.\n\n$$\\mathbf{w}_{t+1}=\\mathbf{w}_t-\\eta\\nabla L(\\mathbf{w}_t)$$\n\nA longer arrow means the model still needs a bigger correction. This is usually the moment when the minus sign in gradient descent finally becomes intuitive.',
        },
        callout: {
          'zh-CN': '把视线同时放在黑点和箭头上: 黑点代表当前位置，箭头代表“这一刻的建议方向”。',
          en: 'Watch the dot and the arrow together: the dot shows where the model is, and the arrow shows the local recommendation.',
        },
        experimentPrompt: {
          'zh-CN': '播放训练后按单步按钮，看看箭头长度是如何随着收敛逐渐变短的。',
          en: 'Play the training and then use single-step mode to see how the arrow shrinks as convergence progresses.',
        },
        presetId: 'stable-descent',
        focusTarget: 'gradient',
        linkedInsightIds: ['gradient-speed'],
        metricEmphasis: ['gradientNorm'],
      },
      {
        id: 'stability',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.gradientDescent.sections.stability.title',
        markdown: {
          'zh-CN':
            '学习率决定每一步迈多大。太小会走得很慢，太大则会越过谷底并来回震荡。\n\n$$\\eta \\uparrow \\Rightarrow \\text{faster updates, but less stable}$$\n\n把批量模式改成随机梯度后，轨迹会更抖，但也更像真实训练时的噪声优化。',
          en:
            'The learning rate sets the step size. Too small and optimization crawls; too large and the path overshoots the valley.\n\n$$\\eta \\uparrow \\Rightarrow \\text{faster updates, but less stable}$$\n\nIf you switch to stochastic updates, the path becomes noisier but also closer to real training behavior.',
        },
        callout: {
          'zh-CN': '这一章最重要的教学目标是对比“快”和“稳”之间的取舍，而不是追求最短轨迹。',
          en: 'The key teaching goal here is the tradeoff between speed and stability, not the shortest possible path.',
        },
        experimentPrompt: {
          'zh-CN': '切到“震荡发散”预设，再把学习率慢慢调回安全区间。',
          en: 'Switch to the oscillation preset, then gradually dial the learning rate back into a safe range.',
        },
        presetId: 'oscillation',
        focusTarget: 'point',
        linkedInsightIds: ['gradient-status', 'gradient-speed'],
        metricEmphasis: ['loss', 'gradientNorm'],
      },
    ],
    controls: [
      { key: 'learningRate', type: 'range', labelKey: 'controls.learningRate', category: 'optimization', min: 0.03, max: 0.95, step: 0.01, format: 'number' },
      { key: 'startX', type: 'range', labelKey: 'controls.startX', category: 'data', min: -2.8, max: 2.8, step: 0.1, format: 'number' },
      { key: 'startY', type: 'range', labelKey: 'controls.startY', category: 'data', min: -2.8, max: 2.8, step: 0.1, format: 'number' },
      {
        key: 'batchMode',
        type: 'select',
        labelKey: 'controls.batchMode',
        category: 'data',
        options: [
          { value: 'full', labelKey: 'controls.options.fullBatch' },
          { value: 'mini-batch', labelKey: 'controls.options.miniBatch' },
          { value: 'stochastic', labelKey: 'controls.options.stochastic' },
        ],
      },
      { key: 'iterations', type: 'range', labelKey: 'controls.iterations', category: 'optimization', min: 18, max: 90, step: 1, format: 'integer' },
      { key: 'playbackMs', type: 'range', labelKey: 'controls.animationSpeed', category: 'playback', min: 70, max: 300, step: 10, format: 'speed' },
    ],
    presets: [
      {
        id: 'stable-descent',
        label: { 'zh-CN': '稳定收敛', en: 'Stable convergence' },
        description: {
          'zh-CN': '中等学习率，轨迹会贴着谷底逐步下降。',
          en: 'A moderate learning rate that settles into the valley smoothly.',
        },
        config: { learningRate: 0.23, startX: 2.2, startY: -2.1, batchMode: 'mini-batch' },
      },
      {
        id: 'oscillation',
        label: { 'zh-CN': '震荡发散', en: 'Oscillation' },
        description: {
          'zh-CN': '把学习率抬高，观察轨迹如何频繁越过谷底。',
          en: 'Raise the learning rate and watch the path overshoot the valley again and again.',
        },
        config: { learningRate: 0.62, startX: 1.8, startY: -2.1, batchMode: 'full' },
      },
      {
        id: 'noisy-sgd',
        label: { 'zh-CN': '噪声 SGD', en: 'Noisy SGD' },
        description: {
          'zh-CN': '改用随机梯度，体验更接近真实训练的抖动轨迹。',
          en: 'Use stochastic updates for a path that feels closer to real noisy optimization.',
        },
        config: { learningRate: 0.3, startX: 2.5, startY: -1.6, batchMode: 'stochastic' },
      },
    ],
    createDefaultConfig: () => ({
      learningRate: 0.23,
      startX: 2.2,
      startY: -2.1,
      batchMode: 'mini-batch',
      iterations: 48,
      playbackMs: 140,
    }),
    simulate: simulateGradientDescent,
  },
  {
    slug: 'logistic-regression',
    route: '/learn/logistic-regression',
    titleKey: 'modules.logisticRegression.title',
    kickerKey: 'modules.logisticRegression.kicker',
    introKey: 'modules.logisticRegression.intro',
    summaryKey: 'modules.logisticRegression.summary',
    theme: '#e7f4f1',
    accent: '#1ea67a',
    chapters: [
      {
        id: 'boundary',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.logisticRegression.sections.boundary.title',
        markdown: {
          'zh-CN': `### 核心问题
逻辑回归为什么叫“回归”，但最后却在做分类？

### 概念直觉
逻辑回归先做一件和线性回归很像的事：把输入特征加权求和，得到一个线性打分。这个分数不是最终类别，而是模型站在当前参数下对“更像正类还是更像负类”的原始证据。

在二维平面里，所有打分等于 0 的点会组成一条直线。这条线就是决策边界：一侧更偏向正类，另一侧更偏向负类。

### 手算例子
假设一个邮件样本有两个特征：

- $x_1=2$ 表示可疑关键词数量
- $x_2=1$ 表示发件人风险分

当前参数是 $w_1=0.8, w_2=-0.5, b=-0.7$，则线性打分为：

$$z=0.8\\times2-0.5\\times1-0.7=0.4$$

这个 $0.4$ 还不是概率，但它已经说明样本位于边界的正类一侧。

### 公式
逻辑回归的第一步是线性打分：

$$z=\\mathbf{w}^\\top\\mathbf{x}+b$$

决策边界满足：

$$\\mathbf{w}^\\top\\mathbf{x}+b=0$$

在二维图里，$\\mathbf{w}$ 控制边界朝向，$b$ 控制边界平移。

### 常见误解
不要把逻辑回归理解成“直接输出 0 或 1”。它先输出线性打分，再把分数变成概率，最后才根据阈值给出类别。

### 交互实验设计
使用“线性可分”预设，观察边界如何旋转和平移。重点看同一套参数如何同时决定直线位置和背景置信度。

### 来源参考
- Google ML Crash Course: Logistic Regression
- mlcourse.ai Topic 4: Linear classification and logistic regression`,
          en: `### Core Question
Why is logistic regression called regression if it is used for classification?

### Concept
Logistic regression starts with something very close to linear regression: it computes a weighted sum of the input features. That value is not the final class. It is the raw evidence for whether the example looks more positive or negative under the current parameters.

In a 2D plane, all points with score 0 form a line. That line is the decision boundary: one side leans positive, the other side leans negative.

### Worked Example
Suppose an email has two features:

- $x_1=2$ suspicious keywords
- $x_2=1$ sender-risk score

With $w_1=0.8, w_2=-0.5, b=-0.7$, the linear score is:

$$z=0.8\\times2-0.5\\times1-0.7=0.4$$

This $0.4$ is not a probability yet, but it already says the example sits on the positive side of the boundary.

### Formula
The first step in logistic regression is the linear score:

$$z=\\mathbf{w}^\\top\\mathbf{x}+b$$

The decision boundary satisfies:

$$\\mathbf{w}^\\top\\mathbf{x}+b=0$$

In the 2D visualization, $\\mathbf{w}$ controls the boundary orientation and $b$ shifts it.

### Common Mistake
Do not read logistic regression as directly outputting 0 or 1. It first outputs a score, then maps that score to probability, then applies a threshold.

### Interaction Design
Use the linearly separable preset and watch the boundary rotate and shift. Focus on how one parameter set controls both the line and the confidence background.

### Source References
- Google ML Crash Course: Logistic Regression
- mlcourse.ai Topic 4: Linear classification and logistic regression`,
        },
        callout: {
          'zh-CN': '先让学生看懂“线的位置”和“背景置信度”是同一套参数的两种表现。',
          en: 'Help students connect the line position and the confidence background as two views of the same parameters.',
        },
        experimentPrompt: {
          'zh-CN': '点击“线性可分”预设，观察边界如何快速贴合主要样本簇。',
          en: 'Use the linearly separable preset and watch how quickly the boundary aligns with the main clusters.',
        },
        presetId: 'linearly-separable',
        focusTarget: 'boundary',
        linkedInsightIds: ['logistic-status'],
        metricEmphasis: ['accuracy', 'boundaryStrength'],
      },
      {
        id: 'sigmoid',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.logisticRegression.sections.sigmoid.title',
        markdown: {
          'zh-CN': `### 核心问题
线性打分怎样变成 0 到 1 之间的类别概率？

### 概念直觉
线性打分 $z$ 可以是任意实数，但分类概率必须落在 0 到 1 之间。sigmoid 函数的作用，就是把无界分数压缩成概率，同时保留“分数越大，越像正类”的顺序。

当 $z=0$ 时，概率正好是 0.5；当 $z$ 很大时，概率接近 1；当 $z$ 很小时，概率接近 0。

### 手算例子
延续上一章的打分 $z=0.4$：

$$\\sigma(0.4)=\\frac{1}{1+e^{-0.4}}\\approx0.60$$

所以模型不是说“绝对是正类”，而是说“正类概率大约 60%”。

### 公式
sigmoid 把线性打分映射成正类概率：

$$p(y=1\\mid\\mathbf{x})=\\sigma(z)=\\frac{1}{1+e^{-z}}$$

预测类别通常来自阈值规则：

$$\\hat{y}=1 \\quad \\text{if} \\quad p\\ge0.5$$

### 常见误解
不要把 0.5 阈值误解成永远最优。真实应用会根据误报成本、漏报成本和类别比例调整阈值。

### 交互实验设计
拖动学习率和训练轮数时，观察背景色如何从模糊过渡变成更明确的概率区域。边界附近通常最接近 0.5。

### 来源参考
- Google ML Crash Course: Logistic Regression probability
- D2L: Softmax regression and classification probability`,
          en: `### Core Question
How does a linear score become a class probability between 0 and 1?

### Concept
The linear score $z$ can be any real number, but a class probability must stay between 0 and 1. The sigmoid function compresses an unbounded score into a probability while preserving the ordering: larger scores mean stronger positive-class evidence.

When $z=0$, the probability is exactly 0.5. When $z$ is large, the probability approaches 1. When $z$ is very negative, the probability approaches 0.

### Worked Example
Using the previous score $z=0.4$:

$$\\sigma(0.4)=\\frac{1}{1+e^{-0.4}}\\approx0.60$$

So the model is not saying the example is certainly positive. It is saying the positive probability is about 60%.

### Formula
The sigmoid maps the score into positive-class probability:

$$p(y=1\\mid\\mathbf{x})=\\sigma(z)=\\frac{1}{1+e^{-z}}$$

A class prediction often comes from a threshold rule:

$$\\hat{y}=1 \\quad \\text{if} \\quad p\\ge0.5$$

### Common Mistake
Do not treat the 0.5 threshold as universally optimal. Real applications adjust thresholds based on false-positive cost, false-negative cost, and class balance.

### Interaction Design
Change learning rate and epochs, then watch the background color move from uncertain to more confident probability regions. Points near the boundary should stay closest to 0.5.

### Source References
- Google ML Crash Course: Logistic Regression probability
- D2L: Softmax regression and classification probability`,
        },
        callout: {
          'zh-CN': '把背景色当成概率地图，而不是只看最终分类对错。',
          en: 'Read the background as a probability map, not just as final right-or-wrong classification.',
        },
        experimentPrompt: {
          'zh-CN': '使用“线性可分”预设，观察边界两侧概率如何从 0.5 向 0 或 1 拉开。',
          en: 'Use the linearly separable preset and watch probabilities move away from 0.5 on each side of the boundary.',
        },
        presetId: 'linearly-separable',
        focusTarget: 'background',
        linkedInsightIds: ['logistic-status'],
        metricEmphasis: ['accuracy', 'boundaryStrength'],
      },
      {
        id: 'confidence',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.logisticRegression.sections.confidence.title',
        markdown: {
          'zh-CN': `### 核心问题
为什么“错得很自信”的分类器要被惩罚得更重？

### 概念直觉
逻辑回归训练时不是只数对错，而是看模型有没有把真实类别推到足够高的概率。交叉熵会奖励真实类别概率变大，也会严厉惩罚真实类别概率接近 0。

所以它不仅推动边界分开样本，也推动概率地图更诚实：该自信的地方更自信，不该自信的地方收敛回来。

### 手算例子
如果真实标签是 $y=1$：

- 模型给 $p=0.9$，损失是 $-\\log(0.9)\\approx0.105$
- 模型给 $p=0.1$，损失是 $-\\log(0.1)\\approx2.303$

同样是一个样本，概率方向错了以后，损失会迅速变大。

### 公式
二分类交叉熵为：

$$\\mathcal{L}= -\\frac{1}{N}\\sum_i \\left[y_i\\log \\hat{y}_i+(1-y_i)\\log(1-\\hat{y}_i)\\right]$$

如果把它放到概率建模里看，它就是 Bernoulli 模型下的负对数似然。

### 常见误解
不要把交叉熵理解成“分类版 MSE”。MSE 惩罚概率距离，交叉熵惩罚真实类别拿到的概率质量，特别在高置信错误时差异很大。

### 交互实验设计
打开训练播放，观察 loss 下降时边界如何移动。重点比较准确率已经不错但背景仍过度自信的区域。

### 来源参考
- Google ML Crash Course: Log Loss
- mlcourse.ai Topic 4: Logistic regression likelihood
- 站内损失函数与似然章节`,
          en: `### Core Question
Why should a classifier be punished more when it is confidently wrong?

### Concept
Logistic regression training does not merely count right and wrong labels. It checks whether the model gives the true class enough probability. Cross-entropy rewards larger true-class probability and heavily penalizes true-class probability near 0.

So it does not only separate examples. It also shapes the probability map: confident where the evidence supports it, less confident where it should hesitate.

### Worked Example
If the true label is $y=1$:

- with $p=0.9$, loss is $-\\log(0.9)\\approx0.105$
- with $p=0.1$, loss is $-\\log(0.1)\\approx2.303$

For the same example, putting probability in the wrong direction makes the loss grow quickly.

### Formula
Binary cross-entropy is:

$$\\mathcal{L}= -\\frac{1}{N}\\sum_i \\left[y_i\\log \\hat{y}_i+(1-y_i)\\log(1-\\hat{y}_i)\\right]$$

From the probabilistic view, this is the negative log-likelihood under a Bernoulli model.

### Common Mistake
Do not read cross-entropy as classification-flavored MSE. MSE penalizes probability distance; cross-entropy penalizes the probability mass assigned to the true class, especially under confident mistakes.

### Interaction Design
Play training and watch how the boundary moves while loss falls. Compare regions where accuracy is already good but the confidence background is still too aggressive.

### Source References
- Google ML Crash Course: Log Loss
- mlcourse.ai Topic 4: Logistic regression likelihood
- Site lesson: Loss Functions & Likelihood`,
        },
        callout: {
          'zh-CN': '重点观察真实类别概率变高时，loss 是否同步下降。',
          en: 'Focus on whether loss falls as the true-class probability rises.',
        },
        experimentPrompt: {
          'zh-CN': '先播放训练，再暂停在中间步骤，比较边界附近样本的概率和 loss。',
          en: 'Play training, pause midway, and compare probabilities and loss near the boundary.',
        },
        presetId: 'linearly-separable',
        focusTarget: 'background',
        linkedInsightIds: ['logistic-status'],
        metricEmphasis: ['loss', 'accuracy'],
      },
      {
        id: 'regularization',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.logisticRegression.sections.regularization.title',
        markdown: {
          'zh-CN': `### 核心问题
为什么逻辑回归还需要正则化？

### 概念直觉
当数据几乎线性可分时，逻辑回归可能不断放大权重，让概率背景变得越来越极端。边界位置也许变化不大，但模型会变得过度自信。

正则化给权重大小加成本。它不是让模型“不会学习”，而是提醒模型：不要为了少数样本把边界推得太激进。

### 手算例子
假设两个模型在训练集上交叉熵都接近：

- 模型 A：$\\lVert\\mathbf{w}\\rVert^2=4$
- 模型 B：$\\lVert\\mathbf{w}\\rVert^2=25$

如果 $\\lambda=0.02$，正则项分别是 $0.08$ 和 $0.50$。模型 B 的大权重会被额外惩罚。

### 公式
带 L2 正则的目标可以写成：

$$J(\\mathbf{w},b)=\\text{BCE}(\\mathbf{w},b)+\\lambda\\lVert\\mathbf{w}\\rVert^2$$

$\\lambda$ 越大，模型越不愿意使用很大的权重。

### 常见误解
正则化不是只在深度学习里有用。线性分类器同样会因为权重过大而出现过度自信或对噪声敏感。

### 交互实验设计
打开“正则过强”预设，然后逐步降低正则。观察边界是否从过于保守变得更贴近样本，同时注意置信背景是否变得更尖锐。

### 来源参考
- Google ML Crash Course: Logistic Regression regularization
- D2L: Weight decay and overfitting`,
          en: `### Core Question
Why does logistic regression need regularization?

### Concept
When data is almost linearly separable, logistic regression may keep increasing the weight magnitudes, making the probability background more extreme. The boundary may not move much, but the model becomes overconfident.

Regularization adds a cost to large weights. It does not prevent learning. It tells the model not to tilt too aggressively for a few examples.

### Worked Example
Suppose two models have similar cross-entropy on the training set:

- model A: $\\lVert\\mathbf{w}\\rVert^2=4$
- model B: $\\lVert\\mathbf{w}\\rVert^2=25$

With $\\lambda=0.02$, the regularization terms are $0.08$ and $0.50$. Model B pays much more for its larger weights.

### Formula
An L2-regularized objective can be written as:

$$J(\\mathbf{w},b)=\\text{BCE}(\\mathbf{w},b)+\\lambda\\lVert\\mathbf{w}\\rVert^2$$

Larger $\\lambda$ makes the model less willing to use large weights.

### Common Mistake
Regularization is not only useful in deep learning. Linear classifiers can also become overconfident or sensitive to noise when weights grow too large.

### Interaction Design
Open the over-regularized preset, then gradually reduce regularization. Watch whether the boundary moves from too conservative toward the samples, while the confidence field becomes sharper.

### Source References
- Google ML Crash Course: Logistic Regression regularization
- D2L: Weight decay and overfitting`,
        },
        callout: {
          'zh-CN': '调高正则强度时，重点观察边界是否更保守、置信度是否更平滑。',
          en: 'When you increase regularization, focus on whether the boundary becomes more conservative and the confidence field smoother.',
        },
        experimentPrompt: {
          'zh-CN': '打开“正则过强”预设，再把正则慢慢调低，比较边界变化。',
          en: 'Open the over-regularized preset, then gradually lower regularization and compare the boundary.',
        },
        presetId: 'over-regularized',
        focusTarget: 'background',
        linkedInsightIds: ['logistic-status'],
        metricEmphasis: ['loss', 'boundaryStrength'],
      },
      {
        id: 'limits',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.logisticRegression.sections.limits.title',
        markdown: {
          'zh-CN': `### 核心问题
什么时候问题不在优化器，而在线性模型的表达能力？

### 概念直觉
逻辑回归只能画出一条线性边界。只要数据的真实结构需要“弯曲”“围住”或“分成多块”，单条直线就会卡住。

这时继续训练、调大学习率或多跑 epoch 都只能有限改善。真正的问题是模型类不够表达这个决策边界。

### 手算例子
XOR 数据的四个角可以这样标注：

| 点 | 标签 |
|---|---|
| $(0,0)$ | 0 |
| $(1,1)$ | 0 |
| $(1,0)$ | 1 |
| $(0,1)$ | 1 |

任何一条直线都很难把两个对角的正类同时和两个负类分开。

### 公式
线性边界的限制可以概括为：

$$\\mathbf{w}^\\top\\mathbf{x}+b=0 \\Rightarrow \\text{one straight split}$$

如果任务需要非线性边界，就需要特征变换或更有表达力的模型。

### 常见误解
不要把 XOR 上的失败归咎于“训练还不够久”。如果模型家族不包含正确形状，再多训练也只能在错误形状里找较好的折中。

### 交互实验设计
切到 XOR 预设，播放到最后，观察准确率和 loss 是否进入平台期。然后把这个失败作为进入 MLP 的动机。

### 来源参考
- mlcourse.ai Topic 4: Linear models and non-linear separability
- D2L: Multilayer perceptrons motivation`,
          en: `### Core Question
When is the problem model expressivity rather than the optimizer?

### Concept
Logistic regression can only draw one linear boundary. If the true data structure needs a curve, an enclosure, or multiple separated regions, a single line gets stuck.

Training longer, increasing the learning rate, or adding epochs can only help a little. The deeper issue is that the model class cannot express the needed decision boundary.

### Worked Example
An XOR dataset can label the four corners like this:

| Point | Label |
|---|---|
| $(0,0)$ | 0 |
| $(1,1)$ | 0 |
| $(1,0)$ | 1 |
| $(0,1)$ | 1 |

No single straight line can cleanly separate the two diagonal positive points from the two negative points.

### Formula
The limitation of a linear boundary is:

$$\\mathbf{w}^\\top\\mathbf{x}+b=0 \\Rightarrow \\text{one straight split}$$

If the task needs a nonlinear boundary, the model needs feature transformation or greater expressive power.

### Common Mistake
Do not blame XOR failure on not training long enough. If the model family does not contain the right shape, more training only finds a better compromise inside the wrong family.

### Interaction Design
Switch to the XOR preset, play training to the end, and watch whether accuracy and loss plateau. Use that failure as the bridge into MLP.

### Source References
- mlcourse.ai Topic 4: Linear models and non-linear separability
- D2L: Multilayer perceptrons motivation`,
        },
        callout: {
          'zh-CN': '这里要把“训练不足”和“模型能力不足”明确区分开。',
          en: 'This section should clearly separate insufficient training from insufficient model capacity.',
        },
        experimentPrompt: {
          'zh-CN': '切到 XOR 预设后，再怎么训练，边界也无法真正绕开四团数据。',
          en: 'Switch to the XOR preset and notice that no amount of extra training can bend the boundary around all four clusters.',
        },
        presetId: 'xor-failure',
        focusTarget: 'boundary',
        linkedInsightIds: ['logistic-limits', 'logistic-status'],
        metricEmphasis: ['accuracy'],
      },
    ],
    controls: [
      { key: 'learningRate', type: 'range', labelKey: 'controls.learningRate', category: 'optimization', min: 0.02, max: 0.75, step: 0.01, format: 'number' },
      { key: 'regularization', type: 'range', labelKey: 'controls.regularization', category: 'optimization', min: 0, max: 0.18, step: 0.01, format: 'number' },
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
        label: { 'zh-CN': '线性可分', en: 'Linearly separable' },
        description: {
          'zh-CN': '一组更适合线性边界的数据，准确率会快速上升。',
          en: 'A friendlier dataset for a linear boundary, so accuracy rises quickly.',
        },
        config: { datasetKind: 'tilted', regularization: 0.03, learningRate: 0.16, noise: 0.08 },
      },
      {
        id: 'over-regularized',
        label: { 'zh-CN': '正则过强', en: 'Over-regularized' },
        description: {
          'zh-CN': '更强的正则会让边界更保守，也可能带来欠拟合。',
          en: 'Stronger regularization produces a safer but often weaker boundary.',
        },
        config: { datasetKind: 'blobs', regularization: 0.16, learningRate: 0.12, noise: 0.12 },
      },
      {
        id: 'xor-failure',
        label: { 'zh-CN': 'XOR 失效', en: 'XOR failure' },
        description: {
          'zh-CN': '线性模型面对 XOR 时会明显卡住。',
          en: 'A linear model stalls visibly on an XOR-style dataset.',
        },
        config: { datasetKind: 'xor', regularization: 0.01, learningRate: 0.14, noise: 0.1 },
      },
    ],
    createDefaultConfig: () => ({
      learningRate: 0.16,
      regularization: 0.03,
      epochs: 70,
      noise: 0.12,
      datasetKind: 'tilted',
      playbackMs: 120,
    }),
    simulate: simulateLogisticRegression,
  },
  {
    slug: 'mlp',
    route: '/learn/mlp',
    titleKey: 'modules.mlp.title',
    kickerKey: 'modules.mlp.kicker',
    introKey: 'modules.mlp.intro',
    summaryKey: 'modules.mlp.summary',
    theme: '#ecedf8',
    accent: '#4d63ff',
    chapters: [
      {
        id: 'features',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.mlp.sections.features.title',
        markdown: {
          'zh-CN': `### 核心问题
MLP 的隐藏层到底在“隐藏”什么？

### 概念直觉
隐藏层不是神秘黑箱。它先把原始坐标混合成一组新的特征，让原本难切开的数据在新空间里变得更容易切分。

每个隐藏单元都像一个小探测器：它对某些方向、区域或模式更敏感。多个隐藏单元组合起来，就得到一个新的表示空间。

### 手算例子
假设输入是 $\\mathbf{x}=[2,1]$，一个隐藏单元的权重是 $\\mathbf{w}=[0.5,-1]$，偏置是 $b=0.2$：

$$z=0.5\\times2-1\\times1+0.2=0.2$$

如果激活函数是 ReLU，则：

$$h=\\max(0,0.2)=0.2$$

这个隐藏单元对当前输入有轻微响应。

### 公式
单隐藏层 MLP 的第一步是：

$$\\mathbf{h}=\\phi(W_1\\mathbf{x}+\\mathbf{b}_1)$$

$W_1$ 负责混合输入，$\\mathbf{b}_1$ 负责平移响应区域，$\\phi$ 负责加入非线性。

### 常见误解
不要把隐藏层理解成“自动记答案”。它首先是在学习一组新特征；这些特征是否有用，还要看后面的 loss 如何反馈。

### 交互实验设计
使用“低容量欠拟合”预设，先看隐藏空间点云是否被拉开，再回到主图观察决策边界为什么仍然偏弱。

### 来源参考
- D2L: Multilayer Perceptrons
- OpenStax Principles of Data Science: Neural networks and backpropagation`,
          en: `### Core Question
What is actually hidden inside an MLP hidden layer?

### Concept
A hidden layer is not a mystical black box. It first mixes the original coordinates into new features so data that is hard to separate in input space can become easier to separate in representation space.

Each hidden unit acts like a small detector. It responds more strongly to certain directions, regions, or patterns. Combining many hidden units creates a new representation space.

### Worked Example
Suppose the input is $\\mathbf{x}=[2,1]$, one hidden unit has weights $\\mathbf{w}=[0.5,-1]$, and bias $b=0.2$:

$$z=0.5\\times2-1\\times1+0.2=0.2$$

If the activation is ReLU, then:

$$h=\\max(0,0.2)=0.2$$

This hidden unit responds slightly to the current input.

### Formula
The first step of a one-hidden-layer MLP is:

$$\\mathbf{h}=\\phi(W_1\\mathbf{x}+\\mathbf{b}_1)$$

$W_1$ mixes inputs, $\\mathbf{b}_1$ shifts response regions, and $\\phi$ adds nonlinearity.

### Common Mistake
Do not read hidden layers as automatically memorizing answers. They first learn new features; whether those features help depends on feedback from the loss.

### Interaction Design
Use the underfit preset. Inspect whether the hidden-space point cloud separates before returning to the main plot to explain why the boundary is still weak.

### Source References
- D2L: Multilayer Perceptrons
- OpenStax Principles of Data Science: Neural networks and backpropagation`,
        },
        callout: {
          'zh-CN': '先引导学生看隐藏空间中的点云，再回头看主图上的决策边界。',
          en: 'Ask students to inspect the hidden-space point cloud first, then return to the main decision boundary.',
        },
        experimentPrompt: {
          'zh-CN': '用“低容量欠拟合”预设观察隐藏空间还没有被充分拉开的样子。',
          en: 'Use the underfit preset to see what the hidden space looks like before it is properly separated.',
        },
        presetId: 'underfit',
        focusTarget: 'hidden',
        linkedInsightIds: ['mlp-capacity'],
        metricEmphasis: ['hiddenUnits'],
      },
      {
        id: 'activations',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.mlp.sections.activations.title',
        markdown: {
          'zh-CN': `### 核心问题
为什么 MLP 中间必须加入激活函数？

### 概念直觉
如果两层之间只有线性变换，那么多层线性变换合起来仍然只是一个线性变换。模型看起来变深了，但表达能力没有真正突破一条直线或一个平面。

激活函数把空间折弯、截断或压缩，让网络能够表示非线性边界。ReLU 像“只保留正响应”，tanh 像“把响应压到平滑区间”。

### 手算例子
同一个隐藏单元打分 $z=-0.6$：

- ReLU 输出 $\\max(0,-0.6)=0$
- tanh 输出 $\\tanh(-0.6)\\approx-0.54$
- sigmoid 输出 $\\sigma(-0.6)\\approx0.35$

同一个线性打分会因为激活函数不同，进入下一层时变成不同信号。

### 公式
隐藏层通常写成：

$$\\mathbf{h}=\\phi(\\mathbf{z}), \\quad \\mathbf{z}=W_1\\mathbf{x}+\\mathbf{b}_1$$

如果去掉 $\\phi$，多层网络会退化成一个更大的线性模型。

### 常见误解
不要把激活函数看成可有可无的装饰。它是 MLP 从线性模型变成非线性模型的关键。

### 交互实验设计
使用“激活函数对比”预设，只切换 activation，保持数据和隐藏单元数不变，观察隐藏表示和边界形状如何改变。

### 来源参考
- D2L: Activation functions
- OpenStax Principles of Data Science: Neural network layers`,
          en: `### Core Question
Why does an MLP need activation functions between layers?

### Concept
If layers only apply linear transformations, stacking them still produces one linear transformation. The model looks deeper, but it has not escaped a single line or plane.

Activation functions bend, clip, or squash the space so the network can express nonlinear boundaries. ReLU keeps positive responses; tanh compresses responses into a smooth interval.

### Worked Example
For the same hidden score $z=-0.6$:

- ReLU gives $\\max(0,-0.6)=0$
- tanh gives $\\tanh(-0.6)\\approx-0.54$
- sigmoid gives $\\sigma(-0.6)\\approx0.35$

The same linear score becomes different signals for the next layer depending on the activation.

### Formula
A hidden layer is usually:

$$\\mathbf{h}=\\phi(\\mathbf{z}), \\quad \\mathbf{z}=W_1\\mathbf{x}+\\mathbf{b}_1$$

Without $\\phi$, stacked layers collapse into a larger linear model.

### Common Mistake
Do not treat activation as decorative. It is the mechanism that turns an MLP from a linear model into a nonlinear one.

### Interaction Design
Use the activation contrast preset. Change only the activation while keeping data and hidden-unit count fixed, then compare the hidden representation and boundary shape.

### Source References
- D2L: Activation functions
- OpenStax Principles of Data Science: Neural network layers`,
        },
        callout: {
          'zh-CN': '只改激活函数，观察同一批隐藏单元如何用不同方式弯折空间。',
          en: 'Change only the activation and watch the same hidden units bend space differently.',
        },
        experimentPrompt: {
          'zh-CN': '在 tanh、ReLU 和 sigmoid 之间切换，比较隐藏空间点云和主图边界的同步变化。',
          en: 'Switch between tanh, ReLU, and sigmoid, then compare hidden-space movement with the main boundary.',
        },
        presetId: 'activation-compare',
        focusTarget: 'hidden',
        linkedInsightIds: ['mlp-status'],
        metricEmphasis: ['accuracy', 'hiddenUnits'],
      },
      {
        id: 'reconfigure',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.mlp.sections.reconfigure.title',
        markdown: {
          'zh-CN': `### 核心问题
隐藏层重组空间以后，输出层还需要做什么？

### 概念直觉
输出层通常不是直接解决原始空间里的难题。它面对的是隐藏层加工后的表示空间。如果隐藏层已经把两类样本拉得更开，输出层只需要在新空间里做一次更简单的分类。

这就是 MLP 的分工：隐藏层负责重组表示，输出层负责把表示变成最终预测。

### 手算例子
假设隐藏层输出两个特征 $\\mathbf{h}=[0.8,0.1]$，输出层参数是 $\\mathbf{v}=[2,-1]$，偏置 $c=-0.5$：

$$s=2\\times0.8-1\\times0.1-0.5=1.0$$

$$\\hat{y}=\\sigma(1.0)\\approx0.73$$

输出层读到的是“加工后的特征”，不是原始坐标。

### 公式
单隐藏层二分类 MLP 可以写成：

$$\\hat{y}=\\sigma(W_2\\mathbf{h}+\\mathbf{b}_2)$$

其中 $\\mathbf{h}$ 已经包含第一层的非线性变换结果。

### 常见误解
不要以为最后一层一定很复杂。很多时候，复杂性主要来自隐藏层如何改造空间，输出层只是读取改造后的表示。

### 交互实验设计
观察主图边界和隐藏空间点云。如果隐藏空间里点云已经更可分，主图上的非线性边界通常会更稳定。

### 来源参考
- D2L: MLP forward propagation
- OpenStax Principles of Data Science: Neural network output layer`,
          en: `### Core Question
After the hidden layer reorganizes the space, what does the output layer still do?

### Concept
The output layer is usually not solving the hard problem in the raw input space. It sees the representation created by the hidden layer. If that hidden representation has already separated the classes, the output layer only has to solve an easier classification problem.

This is the MLP division of labor: the hidden layer reshapes the representation, and the output layer turns that representation into a prediction.

### Worked Example
Suppose the hidden layer outputs $\\mathbf{h}=[0.8,0.1]$, the output weights are $\\mathbf{v}=[2,-1]$, and the bias is $c=-0.5$:

$$s=2\\times0.8-1\\times0.1-0.5=1.0$$

$$\\hat{y}=\\sigma(1.0)\\approx0.73$$

The output layer reads processed features, not raw coordinates.

### Formula
A one-hidden-layer binary MLP can be written as:

$$\\hat{y}=\\sigma(W_2\\mathbf{h}+\\mathbf{b}_2)$$

where $\\mathbf{h}$ already contains the nonlinear transformation from the first layer.

### Common Mistake
Do not assume the last layer is always the complex part. Often the hidden layer creates the useful representation, while the output layer reads it.

### Interaction Design
Compare the main boundary with the hidden-space point cloud. If points are more separable in hidden space, the nonlinear boundary in the main plot usually becomes more stable.

### Source References
- D2L: MLP forward propagation
- OpenStax Principles of Data Science: Neural network output layer`,
        },
        callout: {
          'zh-CN': '这一章要把“隐藏层负责变换，输出层负责切分”的分工讲清楚。',
          en: 'This section should make the division of labor clear: the hidden layer transforms, the output layer separates.',
        },
        experimentPrompt: {
          'zh-CN': '切换不同激活函数，观察隐藏表征会不会从平滑变成折线式扭曲。',
          en: 'Switch between activations and compare how the hidden representation bends the space.',
        },
        presetId: 'activation-compare',
        focusTarget: 'hidden',
        linkedInsightIds: ['mlp-status'],
        metricEmphasis: ['accuracy'],
      },
      {
        id: 'backprop',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.mlp.sections.backprop.title',
        markdown: {
          'zh-CN': `### 核心问题
网络怎么知道前面隐藏层的参数该往哪个方向改？

### 概念直觉
反向传播不是另一种模型，而是一种高效计算梯度的方法。前向传播先得到预测和损失；反向传播再把“输出错了多少”沿着计算图传回每一层，告诉每个参数它对损失的局部影响。

直觉上，后层先收到误差信号，前层再通过链式法则得到自己的责任份额。

### 手算例子
如果某个参数 $w$ 先影响隐藏值 $h$，隐藏值再影响损失 $L$，那么：

$$\\frac{\\partial L}{\\partial w}=\\frac{\\partial L}{\\partial h}\\cdot\\frac{\\partial h}{\\partial w}$$

假设 $\\frac{\\partial L}{\\partial h}=3$，$\\frac{\\partial h}{\\partial w}=0.2$，那么 $\\frac{\\partial L}{\\partial w}=0.6$。

### 公式
反向传播的核心是链式法则：

$$\\frac{\\partial L}{\\partial W_1}=\\frac{\\partial L}{\\partial \\mathbf{h}}\\frac{\\partial \\mathbf{h}}{\\partial W_1}$$

它把输出层的损失信号分解到前面每一层。

### 常见误解
不要把反向传播理解成“从后往前重新预测”。它是在同一个前向计算图上，反向计算梯度。

### 交互实验设计
播放训练时同时看 loss 曲线和边界变化。loss 的下降对应的是这些反向计算出的梯度在更新参数。

### 来源参考
- D2L: Forward propagation, backpropagation, and computational graphs
- OpenStax Principles of Data Science: Backpropagation`,
          en: `### Core Question
How does the network know how to change parameters in earlier hidden layers?

### Concept
Backpropagation is not a different model. It is an efficient way to compute gradients. The forward pass produces predictions and loss; the backward pass sends the loss signal back through the computation graph so each parameter gets its local effect on the loss.

Intuitively, later layers receive the error signal first, and earlier layers receive their share through the chain rule.

### Worked Example
If a parameter $w$ affects hidden value $h$, and $h$ affects loss $L$, then:

$$\\frac{\\partial L}{\\partial w}=\\frac{\\partial L}{\\partial h}\\cdot\\frac{\\partial h}{\\partial w}$$

If $\\frac{\\partial L}{\\partial h}=3$ and $\\frac{\\partial h}{\\partial w}=0.2$, then $\\frac{\\partial L}{\\partial w}=0.6$.

### Formula
Backpropagation is built on the chain rule:

$$\\frac{\\partial L}{\\partial W_1}=\\frac{\\partial L}{\\partial \\mathbf{h}}\\frac{\\partial \\mathbf{h}}{\\partial W_1}$$

It decomposes the output loss signal across earlier layers.

### Common Mistake
Do not read backpropagation as predicting again from the output backward. It computes gradients backward over the same forward computation graph.

### Interaction Design
While training plays, watch the loss curve and boundary movement together. The falling loss is the result of parameter updates driven by these backward gradients.

### Source References
- D2L: Forward propagation, backpropagation, and computational graphs
- OpenStax Principles of Data Science: Backpropagation`,
        },
        callout: {
          'zh-CN': '把反向传播读成“高效算梯度”，而不是新的预测流程。',
          en: 'Read backpropagation as efficient gradient computation, not as a new prediction process.',
        },
        experimentPrompt: {
          'zh-CN': '播放训练并关注 loss 曲线每次下降时，边界和隐藏空间是否同步改变。',
          en: 'Play training and watch whether the boundary and hidden representation change as the loss curve falls.',
        },
        presetId: 'capacity-boost',
        focusTarget: 'boundary',
        linkedInsightIds: ['mlp-status'],
        metricEmphasis: ['loss', 'accuracy'],
      },
      {
        id: 'capacity',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.mlp.sections.capacity.title',
        markdown: {
          'zh-CN': `### 核心问题
为什么增加隐藏单元能让边界变得更弯？

### 概念直觉
隐藏单元越多，网络拥有的“探测器”越多，可以组合出更丰富的空间变换。对双月、圆环或螺旋数据来说，这通常意味着更容易画出弯曲边界。

但容量不是越大越神。它只是让模型有能力表达更复杂的函数，是否真的学得好仍取决于数据、损失、优化和正则化。

### 手算例子
如果隐藏层有 3 个单元，输出层只能组合 3 个隐藏响应；如果有 9 个单元，输出层可以组合 9 个响应。后者通常能拼出更细的边界变化。

### 公式
可以粗略记成：

$$\\text{hidden units} \\uparrow \\Rightarrow \\text{capacity} \\uparrow \\Rightarrow \\text{richer boundaries}$$

这不是保证准确率上升的定理，而是表达能力增加的方向判断。

### 常见误解
不要把容量和泛化能力画等号。容量提高可以减少欠拟合，也可能让模型更容易贴住噪声。

### 交互实验设计
点击“容量提升”预设，再逐步减少 hiddenUnits，观察准确率、隐藏点云和边界形状如何同时退化。

### 来源参考
- D2L: Model selection, underfitting, and overfitting
- D2L: Multilayer perceptrons`,
          en: `### Core Question
Why do more hidden units let the boundary bend more?

### Concept
More hidden units give the network more detectors, which can combine into richer transformations of the space. For moons, circles, or spirals, this often makes it easier to draw curved boundaries.

But capacity is not magic. It only lets the model express more complex functions. Whether it learns well still depends on data, loss, optimization, and regularization.

### Worked Example
With 3 hidden units, the output layer combines 3 hidden responses. With 9 hidden units, it can combine 9 responses. The second model can usually piece together finer boundary changes.

### Formula
A rough teaching shorthand is:

$$\\text{hidden units} \\uparrow \\Rightarrow \\text{capacity} \\uparrow \\Rightarrow \\text{richer boundaries}$$

This is not a theorem that accuracy always rises; it is a direction of expressive power.

### Common Mistake
Do not equate capacity with generalization. Higher capacity can reduce underfitting, but it can also make the model follow noise.

### Interaction Design
Use the capacity boost preset, then gradually reduce hiddenUnits. Watch accuracy, hidden-space separation, and boundary shape degrade together.

### Source References
- D2L: Model selection, underfitting, and overfitting
- D2L: Multilayer perceptrons`,
        },
        callout: {
          'zh-CN': '对比低容量和高容量预设，让学生看到“能不能分开”与“分得多弯”是两件事。',
          en: 'Compare low- and high-capacity presets so students can separate “can it classify” from “how curved is the boundary.”',
        },
        experimentPrompt: {
          'zh-CN': '点击“容量提升”预设，再逐步减少隐藏单元，看准确率和边界如何同时退化。',
          en: 'Use the higher-capacity preset, then reduce the hidden units and watch the accuracy and boundary degrade together.',
        },
        presetId: 'capacity-boost',
        focusTarget: 'boundary',
        linkedInsightIds: ['mlp-capacity', 'mlp-status'],
        metricEmphasis: ['accuracy', 'hiddenUnits'],
      },
      {
        id: 'generalization',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.mlp.sections.generalization.title',
        markdown: {
          'zh-CN': `### 核心问题
MLP 能分开训练点以后，为什么还要担心过拟合？

### 概念直觉
MLP 的强表达能力是一把双刃剑。它可以弯出逻辑回归画不出的边界，也可能把噪声当成真实结构。

教学上要把两个现象分清楚：欠拟合是模型连主要结构都抓不住；过拟合是模型把训练集细节抓得太死，导致新样本表现变差。

### 手算例子
假设两个模型的表现是：

| 模型 | 训练准确率 | 验证准确率 |
|---|---:|---:|
| 小 MLP | 78% | 76% |
| 大 MLP | 98% | 72% |

大模型训练准确率更高，但验证准确率更低，这就是过拟合信号。

### 公式
泛化诊断常看训练误差和验证误差的差距：

$$\\text{generalization gap}=\\text{validation error}-\\text{training error}$$

差距越大，越需要检查容量、正则化、数据噪声和训练轮数。

### 常见误解
不要只用训练准确率判断 MLP 是否学得好。训练集表现很好，可能只是模型记住了训练样本。

### 交互实验设计
增加 hiddenUnits 并提高 epochs，观察边界是否变得过度弯曲。再增加噪声，讨论哪些弯曲像真实结构，哪些更像贴噪声。

### 来源参考
- D2L: Overfitting and regularization
- Google ML Crash Course: Generalization and loss curves`,
          en: `### Core Question
Why worry about overfitting after an MLP separates the training points?

### Concept
An MLP's expressive power cuts both ways. It can draw boundaries logistic regression cannot, but it can also treat noise as structure.

For teaching, separate two signals: underfitting means the model misses the main structure; overfitting means it follows training details so tightly that new examples suffer.

### Worked Example
Suppose two models behave like this:

| Model | Train accuracy | Validation accuracy |
|---|---:|---:|
| Small MLP | 78% | 76% |
| Large MLP | 98% | 72% |

The large model has higher training accuracy but worse validation accuracy, which is an overfitting signal.

### Formula
Generalization diagnostics often track the gap between validation and training error:

$$\\text{generalization gap}=\\text{validation error}-\\text{training error}$$

A larger gap suggests checking capacity, regularization, data noise, and training duration.

### Common Mistake
Do not judge an MLP only by training accuracy. Excellent training performance may mean the model has memorized the training samples.

### Interaction Design
Increase hiddenUnits and epochs, then watch whether the boundary becomes overly curved. Add noise and discuss which bends look like structure and which look like noise fitting.

### Source References
- D2L: Overfitting and regularization
- Google ML Crash Course: Generalization and loss curves`,
        },
        callout: {
          'zh-CN': '把“边界更灵活”和“泛化更好”分开讨论。',
          en: 'Discuss flexible boundaries and better generalization as separate claims.',
        },
        experimentPrompt: {
          'zh-CN': '提高隐藏单元和训练轮数，再增加噪声，观察边界是否开始追随局部噪声。',
          en: 'Increase hidden units and epochs, then add noise and watch whether the boundary starts following local noise.',
        },
        presetId: 'capacity-boost',
        focusTarget: 'boundary',
        linkedInsightIds: ['mlp-capacity', 'mlp-status'],
        metricEmphasis: ['accuracy', 'hiddenUnits'],
      },
    ],
    controls: [
      { key: 'hiddenUnits', type: 'range', labelKey: 'controls.hiddenUnits', category: 'architecture', min: 2, max: 12, step: 1, format: 'integer' },
      {
        key: 'activation',
        type: 'select',
        labelKey: 'controls.activation',
        category: 'architecture',
        options: [
          { value: 'tanh', labelKey: 'controls.options.tanh' },
          { value: 'relu', labelKey: 'controls.options.relu' },
          { value: 'sigmoid', labelKey: 'controls.options.sigmoid' },
        ],
      },
      { key: 'learningRate', type: 'range', labelKey: 'controls.learningRate', category: 'optimization', min: 0.02, max: 0.4, step: 0.01, format: 'number' },
      { key: 'epochs', type: 'range', labelKey: 'controls.epochs', category: 'optimization', min: 20, max: 100, step: 2, format: 'integer' },
      { key: 'noise', type: 'range', labelKey: 'controls.noise', category: 'data', min: 0.03, max: 0.28, step: 0.01, format: 'number' },
      {
        key: 'datasetKind',
        type: 'select',
        labelKey: 'controls.dataset',
        category: 'data',
        options: [
          { value: 'moons', labelKey: 'controls.options.moons' },
          { value: 'circles', labelKey: 'controls.options.circles' },
          { value: 'spiral', labelKey: 'controls.options.spiral' },
        ],
      },
      { key: 'playbackMs', type: 'range', labelKey: 'controls.animationSpeed', category: 'playback', min: 70, max: 300, step: 10, format: 'speed' },
    ],
    presets: [
      {
        id: 'underfit',
        label: { 'zh-CN': '低容量欠拟合', en: 'Underfit' },
        description: {
          'zh-CN': '少量隐藏单元配合双月数据，边界会明显偏弱。',
          en: 'A small hidden layer on the moons dataset creates a visibly weak boundary.',
        },
        config: { hiddenUnits: 3, activation: 'tanh', datasetKind: 'moons', learningRate: 0.1, noise: 0.09 },
      },
      {
        id: 'capacity-boost',
        label: { 'zh-CN': '容量提升', en: 'Capacity boost' },
        description: {
          'zh-CN': '增加隐藏单元后，模型能弯出更复杂的分界。',
          en: 'More hidden units let the model express a much richer boundary.',
        },
        config: { hiddenUnits: 9, activation: 'tanh', datasetKind: 'moons', learningRate: 0.12, noise: 0.08 },
      },
      {
        id: 'activation-compare',
        label: { 'zh-CN': '激活函数对比', en: 'Activation contrast' },
        description: {
          'zh-CN': '保持数据不变，只改激活函数，观察表示空间弯曲方式。',
          en: 'Keep the dataset fixed and only change activation to compare how the space bends.',
        },
        config: { hiddenUnits: 6, activation: 'relu', datasetKind: 'circles', learningRate: 0.09, noise: 0.07 },
      },
    ],
    createDefaultConfig: () => ({
      hiddenUnits: 6,
      activation: 'tanh',
      learningRate: 0.12,
      epochs: 72,
      noise: 0.09,
      datasetKind: 'moons',
      playbackMs: 120,
    }),
    simulate: simulateMLP,
  },
]

export const moduleRegistry = Object.fromEntries(
  moduleOrder.map((moduleDefinition) => [moduleDefinition.slug, moduleDefinition]),
) as Record<(typeof moduleOrder)[number]['slug'], AlgorithmModuleDefinition>
