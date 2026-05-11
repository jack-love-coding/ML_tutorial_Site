import type { AlgorithmModuleDefinition, LocalizedCopy, StorySection } from '../types/ml'
import { simulateMLP } from '../simulations/mlp'

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function chapter(
  id: string,
  titleKey: string,
  markdown: LocalizedCopy,
  callout: LocalizedCopy,
  experimentPrompt: LocalizedCopy,
  presetId: string,
  focusTarget: StorySection['focusTarget'],
  metricEmphasis: string[],
): StorySection {
  return {
    id,
    eyebrowKey: 'common.chapter',
    titleKey,
    markdown,
    callout,
    experimentPrompt,
    presetId,
    focusTarget,
    metricEmphasis,
  }
}

export const mlpModule: AlgorithmModuleDefinition = {
  slug: 'mlp',
  route: '/learn/mlp',
  titleKey: 'modules.mlp.title',
  kickerKey: 'modules.mlp.kicker',
  introKey: 'modules.mlp.intro',
  summaryKey: 'modules.mlp.summary',
  theme: '#eef1ff',
  accent: '#4d63ff',
  chapters: [
    chapter(
      'features',
      'modules.mlp.sections.features.title',
      loc(
        `### 核心问题
MLP 的隐藏层到底在“隐藏”什么？

### 概念直觉
隐藏单元不是神秘盒子。每个隐藏单元都会学习一条方向、一个偏移和一种响应方式，把原始二维坐标改写成新的特征。多个隐藏单元合在一起，就形成了一个新的表示空间。

### 公式
单隐藏层的第一步可以写成：

$$\\mathbf{h}=\\phi(W_1\\mathbf{x}+\\mathbf{b}_1)$$

这里的 $W_1$ 和 $\\mathbf{b}_1$ 决定隐藏单元看什么方向，$\\phi$ 决定响应如何弯折。

### 交互任务
使用“低容量欠拟合”预设，先看输入空间边界，再看隐藏空间点云是否仍然混在一起。`,
        `### Core Question
What is hidden inside an MLP hidden layer?

### Concept
Hidden units are not magic boxes. Each unit learns a direction, an offset, and a response rule that rewrites raw 2D coordinates into a new feature. Several units together create a new representation space.

### Formula
The first step of a one-hidden-layer model is:

$$\\mathbf{h}=\\phi(W_1\\mathbf{x}+\\mathbf{b}_1)$$

$W_1$ and $\\mathbf{b}_1$ decide what each unit looks for, while $\\phi$ decides how the response bends.

### Interaction
Start with the underfit preset. Compare the input boundary with the hidden-space point cloud and check whether the classes are still tangled.`,
      ),
      loc(
        '先把隐藏层理解成特征改写器，而不是把它当成无法解释的黑箱。',
        'Read the hidden layer as a feature rewriter, not as an opaque black box.',
      ),
      loc(
        '降低 hiddenUnits，观察隐藏空间分离度和验证准确率如何一起变弱。',
        'Reduce hiddenUnits and watch hidden separation and validation accuracy weaken together.',
      ),
      'underfit',
      'hidden',
      ['hiddenSeparation', 'validationAccuracy'],
    ),
    chapter(
      'activations',
      'modules.mlp.sections.activations.title',
      loc(
        `### 核心问题
为什么多层线性变换中间必须加入激活函数？

### 概念直觉
如果没有激活函数，多层线性层仍然可以合并成一层线性变换，模型边界不会真正弯曲。激活函数让隐藏响应变成非线性特征，后面的输出层才有机会组合出弯曲边界。

### 公式
若去掉激活函数：

$$W_2(W_1\\mathbf{x}+\\mathbf{b}_1)+\\mathbf{b}_2=(W_2W_1)\\mathbf{x}+W_2\\mathbf{b}_1+\\mathbf{b}_2$$

它仍然是线性模型。

### 交互任务
只切换 activation，不改数据集和隐藏单元数，比较边界、隐藏点云和激活饱和比例。`,
        `### Core Question
Why does a multilayer model need activations between linear layers?

### Concept
Without activations, stacked linear layers collapse into one linear layer, so the boundary still cannot truly bend. Activations turn hidden responses into nonlinear features that the output layer can recombine.

### Formula
Without an activation:

$$W_2(W_1\\mathbf{x}+\\mathbf{b}_1)+\\mathbf{b}_2=(W_2W_1)\\mathbf{x}+W_2\\mathbf{b}_1+\\mathbf{b}_2$$

The model is still linear.

### Interaction
Change only activation. Compare the boundary, hidden point cloud, and activation saturation ratio.`,
      ),
      loc(
        '激活函数不是装饰，它决定隐藏特征能不能提供非线性表达。',
        'Activation is not decoration; it decides whether hidden features can be nonlinear.',
      ),
      loc(
        '在 tanh、ReLU、sigmoid 之间切换，观察哪些激活更容易让隐藏空间分开。',
        'Switch among tanh, ReLU, and sigmoid and compare which one separates hidden space more clearly.',
      ),
      'activation-compare',
      'hidden',
      ['activationSaturation', 'hiddenSeparation'],
    ),
    chapter(
      'reconfigure',
      'modules.mlp.sections.reconfigure.title',
      loc(
        `### 核心问题
隐藏层为什么能让输出层更容易分类？

### 概念直觉
MLP 的难点通常不是最后一层，而是隐藏层如何重新摆放样本。若隐藏空间已经把两类样本拉开，输出层只需要在新表示上读出一个相对简单的边界。

### 公式
输出层读取的是隐藏表示：

$$\\hat{y}=\\sigma(W_2\\mathbf{h}+\\mathbf{b}_2)$$

### 交互任务
同时看输入空间和隐藏空间。若隐藏点云更可分，主图上的非线性边界通常也更稳定。`,
        `### Core Question
Why does the hidden layer make classification easier for the output layer?

### Concept
The hard part is usually not the final layer. It is how the hidden layer rearranges examples. Once hidden space separates the classes, the output layer can read a simpler boundary.

### Formula
The output layer reads hidden features:

$$\\hat{y}=\\sigma(W_2\\mathbf{h}+\\mathbf{b}_2)$$

### Interaction
Watch input space and hidden space together. When hidden points separate better, the nonlinear boundary usually becomes steadier.`,
      ),
      loc(
        '把“输入空间难分”和“隐藏空间变得好分”这两个画面对上。',
        'Connect hard separation in input space with easier separation in hidden space.',
      ),
      loc(
        '切换双月、圆环、螺旋数据，比较隐藏层是否真的改写了几何结构。',
        'Switch moons, circles, and spiral datasets and compare whether the hidden layer rewrites the geometry.',
      ),
      'representation-map',
      'boundary',
      ['hiddenSeparation', 'validationAccuracy'],
    ),
    chapter(
      'backprop',
      'modules.mlp.sections.backprop.title',
      loc(
        `### 核心问题
网络怎样知道前面隐藏层参数该往哪里改？

### 概念直觉
反向传播不是另一种模型，而是高效计算梯度的方法。前向传播得到预测和损失，反向传播沿计算图把损失信号分配给每个参数。

### 公式
链式法则给出隐藏层参数的责任：

$$\\frac{\\partial L}{\\partial W_1}=\\frac{\\partial L}{\\partial \\mathbf{h}}\\frac{\\partial \\mathbf{h}}{\\partial W_1}$$

### 交互任务
播放训练，观察 loss 下降、边界移动和 gradient norm 变小是否同步发生。`,
        `### Core Question
How does the network know how to change earlier hidden-layer parameters?

### Concept
Backpropagation is not another model. It is an efficient way to compute gradients. The forward pass produces prediction and loss; the backward pass distributes that loss signal to each parameter.

### Formula
The chain rule assigns responsibility to hidden-layer parameters:

$$\\frac{\\partial L}{\\partial W_1}=\\frac{\\partial L}{\\partial \\mathbf{h}}\\frac{\\partial \\mathbf{h}}{\\partial W_1}$$

### Interaction
Play training and watch loss, boundary movement, and gradient norm together.`,
      ),
      loc(
        '反向传播要读成“高效算梯度”，不是从输出往输入重新预测。',
        'Read backpropagation as efficient gradient computation, not backward prediction.',
      ),
      loc(
        '用单步按钮看每一步之后 loss、边界和隐藏空间是否都发生变化。',
        'Use step mode to compare loss, boundary, and hidden-space changes after each update.',
      ),
      'representation-map',
      'boundary',
      ['loss', 'gradientNorm'],
    ),
    chapter(
      'capacity',
      'modules.mlp.sections.capacity.title',
      loc(
        `### 核心问题
为什么增加隐藏单元会让边界变得更弯？

### 概念直觉
隐藏单元越多，网络能组合的局部响应越多，表达能力通常越强。但容量只说明“能不能表达”，不保证“泛化一定更好”。

### 公式
教学上可以粗略记成：

$$\\text{hidden units}\\uparrow \\Rightarrow \\text{capacity}\\uparrow \\Rightarrow \\text{richer boundary}$$

### 交互任务
从容量提升预设开始，逐步减少隐藏单元，看边界、隐藏分离度和验证准确率如何退化。`,
        `### Core Question
Why do more hidden units let the boundary bend more?

### Concept
More hidden units let the network combine more local responses, so expressive capacity usually rises. Capacity says what can be represented; it does not guarantee better generalization.

### Formula
A useful teaching shorthand is:

$$\\text{hidden units}\\uparrow \\Rightarrow \\text{capacity}\\uparrow \\Rightarrow \\text{richer boundary}$$

### Interaction
Start from the capacity preset, then reduce hidden units and watch boundary shape, hidden separation, and validation accuracy degrade.`,
      ),
      loc(
        '容量提升能减少欠拟合，但也可能给噪声留下更多被记住的空间。',
        'More capacity can reduce underfitting, but it also gives noise more room to be memorized.',
      ),
      loc(
        '把 hiddenUnits 从 10 降到 2，观察表达能力的损失在哪里最先出现。',
        'Move hiddenUnits from 10 down to 2 and locate where expressive power fails first.',
      ),
      'capacity-boost',
      'boundary',
      ['hiddenUnits', 'weightNorm', 'validationAccuracy'],
    ),
    chapter(
      'generalization',
      'modules.mlp.sections.generalization.title',
      loc(
        `### 核心问题
训练集分开以后，为什么还要看验证集？

### 概念直觉
MLP 可以画出逻辑回归画不出的边界，也可能把噪声当成结构。专业训练不能只看训练准确率，还要看验证准确率、泛化差距和边界是否过度弯曲。

### 公式
这里用准确率差距做直观诊断：

$$\\text{gap}=\\text{train accuracy}-\\text{validation accuracy}$$

### 交互任务
提高噪声、隐藏单元和训练轮数，观察训练准确率是否继续上升，而验证准确率停滞或下降。`,
        `### Core Question
Why check validation after the training set is separated?

### Concept
An MLP can draw boundaries logistic regression cannot, but it can also treat noise as structure. Serious training must inspect validation accuracy, the generalization gap, and whether the boundary is overly curved.

### Formula
Use the accuracy gap as a direct diagnostic:

$$\\text{gap}=\\text{train accuracy}-\\text{validation accuracy}$$

### Interaction
Increase noise, hidden units, and epochs. Check whether training accuracy keeps rising while validation stalls or falls.`,
      ),
      loc(
        '不要只用训练准确率判断 MLP 是否学得好；验证集才检验新样本表现。',
        'Do not judge an MLP by training accuracy alone; validation checks new examples.',
      ),
      loc(
        '使用“泛化压力测试”预设，比较 train accuracy、validation accuracy 和 gap。',
        'Use the generalization stress preset and compare train accuracy, validation accuracy, and gap.',
      ),
      'generalization-stress',
      'boundary',
      ['trainAccuracy', 'validationAccuracy', 'generalizationGap'],
    ),
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
    { key: 'epochs', type: 'range', labelKey: 'controls.epochs', category: 'optimization', min: 20, max: 120, step: 2, format: 'integer' },
    { key: 'noise', type: 'range', labelKey: 'controls.noise', category: 'data', min: 0.03, max: 0.34, step: 0.01, format: 'number' },
    { key: 'validationSplit', type: 'range', labelKey: 'controls.validationSplit', category: 'data', min: 0.15, max: 0.45, step: 0.01, format: 'percent' },
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
      label: loc('低容量欠拟合', 'Underfit'),
      description: loc('少量隐藏单元配合双月数据，边界会明显偏弱。', 'Few hidden units on moons produce a visibly weak boundary.'),
      config: { hiddenUnits: 3, activation: 'tanh', datasetKind: 'moons', learningRate: 0.1, epochs: 64, noise: 0.09, validationSplit: 0.28 },
    },
    {
      id: 'activation-compare',
      label: loc('激活函数对比', 'Activation contrast'),
      description: loc('保持数据不变，只改激活函数，观察隐藏空间弯折方式。', 'Keep data fixed and change activation to compare hidden-space bending.'),
      config: { hiddenUnits: 6, activation: 'relu', datasetKind: 'circles', learningRate: 0.09, epochs: 76, noise: 0.07, validationSplit: 0.28 },
    },
    {
      id: 'representation-map',
      label: loc('表示重构', 'Representation map'),
      description: loc('用中等容量观察输入空间和隐藏空间如何逐步分开。', 'Use moderate capacity to compare input space and hidden space separation.'),
      config: { hiddenUnits: 7, activation: 'tanh', datasetKind: 'moons', learningRate: 0.12, epochs: 84, noise: 0.08, validationSplit: 0.28 },
    },
    {
      id: 'capacity-boost',
      label: loc('容量提升', 'Capacity boost'),
      description: loc('更多隐藏单元让模型表达更弯曲的边界。', 'More hidden units let the model express a more curved boundary.'),
      config: { hiddenUnits: 10, activation: 'tanh', datasetKind: 'moons', learningRate: 0.12, epochs: 88, noise: 0.08, validationSplit: 0.28 },
    },
    {
      id: 'generalization-stress',
      label: loc('泛化压力测试', 'Generalization stress'),
      description: loc('高容量、高噪声和更长训练用于暴露训练/验证差距。', 'High capacity, higher noise, and longer training expose the train/validation gap.'),
      config: { hiddenUnits: 12, activation: 'tanh', datasetKind: 'circles', learningRate: 0.15, epochs: 120, noise: 0.22, validationSplit: 0.4 },
    },
  ],
  createDefaultConfig: () => ({
    hiddenUnits: 7,
    activation: 'tanh',
    learningRate: 0.12,
    epochs: 84,
    noise: 0.09,
    datasetKind: 'moons',
    validationSplit: 0.28,
    playbackMs: 120,
  }),
  simulate: simulateMLP,
}
