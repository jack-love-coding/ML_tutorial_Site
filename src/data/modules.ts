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
          'zh-CN':
            '逻辑回归最终学到的是一个线性分界面。在二维平面里，它就是一条不断移动和旋转的直线。\n\n$$p(y=1\\mid x)=\\sigma(w_1x_1+w_2x_2+b)$$\n\n背景热力图代表模型对不同区域的置信度，散点则告诉你当前边界到底切得准不准。',
          en:
            'Logistic regression ultimately learns a linear separating surface. In 2D, that surface becomes a line that rotates and shifts during training.\n\n$$p(y=1\\mid x)=\\sigma(w_1x_1+w_2x_2+b)$$\n\nThe background heatmap shows confidence across the plane, while the data points tell you whether the current split is actually useful.',
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
        id: 'confidence',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.logisticRegression.sections.confidence.title',
        markdown: {
          'zh-CN':
            '在逻辑回归里，交叉熵更像是“边界调整信号”。当模型把真实类别推向更高概率区域时，损失就会下降；当它错得很自信时，损失会迅速升高。\n\n$$\\mathcal{L}=-\\frac{1}{N}\\sum_i \\left[y_i\\log \\hat{y}_i+(1-y_i)\\log(1-\\hat{y}_i)\\right]+\\lambda\\lVert w \\rVert^2$$\n\n这一页不再完整重讲交叉熵本身，而是重点观察：**它怎样推动这条线性边界移动，怎样让背景置信度变得更合理**。正则项则会压制过大的权重，避免边界为了少数样本过度倾斜。\n\n如果你想先补清“为什么错误且自信会被罚得更重”“交叉熵和似然是什么关系”，可以回到 [损失函数与似然](/learn/loss-functions)。',
          en:
            'Inside logistic regression, cross-entropy acts like a boundary-shaping signal. When the model pushes the true class toward higher probability, the loss falls; when it is confidently wrong, the loss rises sharply.\n\n$$\\mathcal{L}=-\\frac{1}{N}\\sum_i \\left[y_i\\log \\hat{y}_i+(1-y_i)\\log(1-\\hat{y}_i)\\right]+\\lambda\\lVert w \\rVert^2$$\n\nThis page does not fully reteach cross-entropy. The focus here is **how that loss moves the linear boundary and reshapes the confidence field**. Regularization keeps the weights from tilting too aggressively for a few awkward samples.\n\nIf you want the full explanation of confident mistakes, likelihood, and why cross-entropy has this form, jump back to [Loss Functions & Likelihood](/learn/loss-functions).',
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
          'zh-CN':
            '线性模型只能画出一条直线，所以一旦数据本身是非线性结构，准确率就会停在某个上限附近。\n\n$$\\text{one linear boundary} \\Rightarrow \\text{limited expressivity}$$\n\n这正是引出多层感知机的最佳时机: 不是训练不够久，而是模型表示能力不够。',
          en:
            'A linear model can only draw one line. Once the dataset itself is nonlinear, accuracy will stall around a ceiling.\n\n$$\\text{one linear boundary} \\Rightarrow \\text{limited expressivity}$$\n\nThis is the perfect bridge into multilayer perceptrons: the issue is not training longer, but representation capacity.',
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
          'zh-CN':
            '隐藏层先把原始输入映射到一个新的特征空间。每个隐藏单元都在学习自己敏感的方向。\n\n$$h=\\phi(W_1x+b_1)$$\n\n右下角的小图并不是装饰，它在告诉学生: 神经网络真正做的是**重新组织表示空间**。',
          en:
            'The hidden layer first maps raw inputs into a new feature space. Each hidden unit learns a direction it responds to strongly.\n\n$$h=\\phi(W_1x+b_1)$$\n\nThe small representation plot is not decorative; it shows that the network is really **reorganizing the space** before the final decision.',
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
        id: 'reconfigure',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.mlp.sections.reconfigure.title',
        markdown: {
          'zh-CN':
            '输出层并没有直接解决原问题，而是在新的表示空间里做一次更简单的分类。\n\n$$\\hat{y}=\\sigma(W_2h+b_2)$$\n\n当隐藏层已经把数据拉开时，输出层面对的是一个“更好切”的版本。',
          en:
            'The output layer is not solving the original problem directly. It classifies in the transformed feature space created by the hidden layer.\n\n$$\\hat{y}=\\sigma(W_2h+b_2)$$\n\nOnce the hidden layer separates the data, the output layer only has to solve an easier version of the task.',
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
        id: 'capacity',
        eyebrowKey: 'common.chapter',
        titleKey: 'modules.mlp.sections.capacity.title',
        markdown: {
          'zh-CN':
            '隐藏单元越多，模型可表达的边界通常越丰富，但也更容易学到过于复杂的形状。\n\n$$\\text{capacity} \\uparrow \\Rightarrow \\text{richer boundaries}$$\n\n对本科生来说，这一章最重要的是形成“容量不是越大越神，而是更有表达力”的认识。',
          en:
            'More hidden units usually mean richer boundaries, but also a greater ability to learn overly complex shapes.\n\n$$\\text{capacity} \\uparrow \\Rightarrow \\text{richer boundaries}$$\n\nFor an introductory audience, the key idea is that capacity is not magic; it simply gives the model more expressive power.',
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
