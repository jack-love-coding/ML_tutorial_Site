import type { AlgorithmModuleDefinition, LocalizedCopy } from '../types/ml'
import { simulateLinearRegression } from '../simulations/linearRegression'

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

export const linearRegressionModule: AlgorithmModuleDefinition = {
  slug: 'linear-regression',
  route: '/learn/linear-regression',
  titleKey: 'modules.linearRegression.title',
  kickerKey: 'modules.linearRegression.kicker',
  introKey: 'modules.linearRegression.intro',
  summaryKey: 'modules.linearRegression.summary',
  theme: '#edf7f2',
  accent: '#db6c3a',
  chapters: [
    {
      id: 'fit-line',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.fitLine.title',
      markdown: loc(
        `在线性回归里，我们先不急着谈训练算法，而是先问一个更朴素的问题：如果横轴是房屋面积，纵轴是房价，一条直线到底在表达什么？

$$\\hat{y}=wx+b$$

- $x$ 是面积
- $w$ 是斜率，表示面积每增加 1 平方米，预测价格大约增加多少
- $b$ 是截距，表示整条线被整体抬高或压低了多少

散点是一个个真实样本，直线是模型对“总体趋势”的概括。  
本章最重要的直觉是：回归线不是装饰物，而是模型对面积和价格关系的正式表达。`,
        `In linear regression, do not start with the optimizer. Start with the simpler question: if area is on the x-axis and price is on the y-axis, what is a line actually saying?

$$\\hat{y}=wx+b$$

- $x$ is the area
- $w$ is the slope, telling us how much price changes per extra square meter
- $b$ is the intercept, shifting the whole line up or down

The dots are real houses. The line is the model’s summary of the overall trend.  
The key intuition in this chapter is that the regression line is the model’s formal statement about the relationship itself.`,
      ),
      callout: loc(
        '先盯住散点和直线的相对位置，不急着看损失公式。',
        'Start with the relative position of the dots and the line before focusing on loss.',
      ),
      experimentPrompt: loc(
        '先用“面积主导”预设，观察每个点离回归线有多远，再想一想斜率和截距分别在控制什么。',
        'Use the baseline preset first and ask what the slope and intercept are each controlling.',
      ),
      presetId: 'baseline-fit',
      metricEmphasis: ['loss'],
    },
    {
      id: 'residual-loss',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.residualLoss.title',
      markdown: loc(
        `直线画出来之后，下一步就要问：它画得好不好？

每个点到直线的竖直距离，就是这个样本的残差。  
残差告诉我们单个样本错了多少，而 **MSE** 把所有残差平方后取平均，变成训练时真正优化的目标：

$$\\text{MSE}=\\frac{1}{N}\\sum_i (\\hat{y}_i-y_i)^2$$

为什么这里主讲 MSE？

- 它会放大大误差，让模型认真修正明显偏离的样本
- 它和后面的梯度更新配合得很自然
- 它能和你前面学过的 loss function 内容直接接上

MAE 仍然会作为对比出现，但本模块把它放在提醒位置，而不是展开第二套训练流程。`,
        `Once the line is drawn, the next question is: how good is it?

The vertical distance from each point to the line is the residual.  
Residuals describe per-sample error, while **MSE** averages the squared residuals into the objective that training actually minimizes:

$$\\text{MSE}=\\frac{1}{N}\\sum_i (\\hat{y}_i-y_i)^2$$

Why focus on MSE here?

- it amplifies larger mistakes
- it works naturally with gradient-based updates
- it connects directly to the earlier loss-function lesson

MAE still appears as a comparison, but this module keeps it in that comparison role instead of building a second full training flow.`,
      ),
      callout: loc(
        '先看残差，再看 MSE 怎样把所有样本的误差重新汇总成一个训练目标。',
        'Look at residuals first, then watch MSE aggregate them into one objective.',
      ),
      experimentPrompt: loc(
        '打开离群点后，观察残差线和 MSE 是否会立刻被少数大误差拖着走。',
        'Enable the outlier and see how quickly a few large residuals start to dominate MSE.',
      ),
      presetId: 'residual-focus',
      metricEmphasis: ['loss'],
    },
    {
      id: 'training-motion',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.trainingMotion.title',
      markdown: loc(
        `有了目标函数之后，线性回归的训练就不再神秘了：它只是不断微调斜率和截距，让 MSE 下降。

本章最值得看的不是“线又动了一下”，而是：

- 斜率如何逐步朝正确方向旋转
- 截距如何上下平移，把整条线推向数据云
- 损失如何随着这些小更新逐渐下降

如果学生能把参数平面上的轨迹，和数据空间里的直线移动连起来，后面再看逻辑回归就会轻松很多。`,
        `Once the objective is clear, linear-regression training stops feeling mysterious: it just keeps adjusting slope and intercept to reduce MSE.

The important thing here is not merely that the line moves. It is that:

- the slope rotates toward a better direction
- the intercept shifts the whole line up or down
- the loss falls as those small updates accumulate

If students can connect the parameter trajectory to the line movement in data space, logistic regression becomes much easier later.`,
      ),
      callout: loc(
        '一边看左侧的直线，一边看右侧参数轨迹。同一轮更新，要在两个视图里同时读懂。',
        'Read the line and the parameter trajectory together. One update should make sense in both views.',
      ),
      experimentPrompt: loc(
        '点击播放后，再改学习率和训练轮数，比较“收敛更快”和“抖动更大”之间的取舍。',
        'Play the training, then adjust learning rate and epochs to compare faster movement with less stable updates.',
      ),
      presetId: 'training-playback',
      metricEmphasis: ['loss'],
    },
    {
      id: 'model-limits',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.modelLimits.title',
      markdown: loc(
        `线性回归最重要的边界，不在“有没有训练够”，而在“它只能表达一条线”。

如果房价和面积的关系本身带一点弯曲，或者数据里混入了明显离群点，那么再努力训练，模型也只能在“一条直线”这个表达框架里妥协。

这时学生应该看见两件事：

1. 损失可能已经下降了很多，但仍然留有系统性误差
2. 问题不一定出在优化器，更可能出在线性模型的表达能力

逻辑回归同样从线性打分出发，但它预测的不是连续房价，而是类别概率。  
两者共享“参数在推动决策”的直觉，只是任务、损失和输出解释不同。`,
        `The most important limit of linear regression is not whether we trained long enough. It is that the model can only express one line.

If the relationship between area and price bends slightly, or if the dataset contains a strong outlier, training harder still leaves the model inside a single straight-line family.

Students should notice two things:

1. loss may fall a lot while systematic error remains
2. the bottleneck may be model expressivity rather than the optimizer

Logistic regression also starts from a linear score, but it predicts class probability rather than continuous price.  
The parameter intuition carries over, while the task, the loss, and the output meaning change.`,
      ),
      callout: loc(
        '明确区分“优化没做好”和“模型本身不够表达”。',
        'Separate insufficient optimization from insufficient model expressivity.',
      ),
      experimentPrompt: loc(
        '切到“线性边界”预设后，观察高面积样本为什么会系统性偏离回归线，然后顺着桥接卡进入逻辑回归。',
        'Switch to the limits preset and inspect why larger homes drift systematically away from the line.',
      ),
      presetId: 'limits-bridge',
      metricEmphasis: ['loss'],
    },
  ],
  controls: [
    { key: 'learningRate', type: 'range', labelKey: 'controls.learningRate', category: 'optimization', min: 0.02, max: 0.24, step: 0.01, format: 'number' },
    { key: 'epochs', type: 'range', labelKey: 'controls.epochs', category: 'optimization', min: 16, max: 72, step: 2, format: 'integer' },
    { key: 'playbackMs', type: 'range', labelKey: 'controls.animationSpeed', category: 'playback', min: 70, max: 260, step: 10, format: 'speed' },
    { key: 'datasetNoise', type: 'range', labelKey: 'controls.datasetNoise', category: 'data', min: 0, max: 0.35, step: 0.01, format: 'number' },
    { key: 'outlierStrength', type: 'range', labelKey: 'controls.outlierStrength', category: 'data', min: 0, max: 120, step: 2, format: 'number' },
  ],
  presets: [
    {
      id: 'baseline-fit',
      label: loc('面积主导', 'Baseline fit'),
      description: loc('低噪声、无离群点，先把“散点 + 直线”这层关系看清楚。', 'Low noise and no outlier so the scatter-line relationship is easy to read.'),
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
      label: loc('残差放大镜', 'Residual focus'),
      description: loc('打开离群点，让残差线和 MSE 的变化更容易被看见。', 'Enable an outlier so the residuals and MSE response become more visible.'),
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
      label: loc('训练动态', 'Training playback'),
      description: loc('让斜率和截距从明显错误的位置开始，方便观察参数如何一路收敛。', 'Start the line from a clearly wrong state so the parameter trajectory is easy to follow.'),
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
      label: loc('线性边界', 'Limits bridge'),
      description: loc('让高面积样本略带弯曲，再叠加离群点，观察“一条线不够”时会发生什么。', 'Bend the larger-home samples slightly and add an outlier to show the limit of one line.'),
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
  }),
  simulate: simulateLinearRegression,
}
