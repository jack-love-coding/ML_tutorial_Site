import type {
  AlgorithmModuleDefinition,
  LocalizedCopy,
  ModuleSourceReference,
  ModuleVisualAsset,
  MlpPlaygroundFocus,
  StorySection,
} from '../types/ml'
import { simulateMLP } from '../simulations/mlp'

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

const sources = {
  d2lMlp: {
    label: loc('D2L：多层感知机', 'D2L: Multilayer Perceptrons'),
    href: 'https://d2l.ai/chapter_multilayer-perceptrons/mlp.html',
    license: 'CC BY-SA 4.0',
  },
  d2lBackprop: {
    label: loc('D2L：反向传播', 'D2L: Backpropagation'),
    href: 'https://d2l.ai/chapter_multilayer-perceptrons/backprop.html',
    license: 'CC BY-SA 4.0',
  },
  d2lGeneralization: {
    label: loc('D2L：深度学习中的泛化', 'D2L: Generalization in Deep Learning'),
    href: 'https://d2l.ai/chapter_multilayer-perceptrons/generalization-deep.html',
    license: 'CC BY-SA 4.0',
  },
  mlccHidden: {
    label: loc('Google MLCC：节点和隐藏层', 'Google MLCC: Nodes and Hidden Layers'),
    href: 'https://developers.google.com/machine-learning/crash-course/neural-networks/nodes-hidden-layers',
    license: 'CC BY 4.0',
  },
  mlccActivation: {
    label: loc('Google MLCC：激活函数', 'Google MLCC: Activation Functions'),
    href: 'https://developers.google.com/machine-learning/crash-course/neural-networks/activation-functions',
    license: 'CC BY 4.0',
  },
  openStax: {
    label: loc('OpenStax：神经网络导论', 'OpenStax: Introduction to Neural Networks'),
    href: 'https://openstax.org/books/principles-data-science/pages/7-1-introduction-to-neural-networks',
    license: 'CC BY-NC-SA 4.0',
  },
  tensorflowPlayground: {
    label: loc('TensorFlow Playground', 'TensorFlow Playground'),
    href: 'https://playground.tensorflow.org/',
    license: 'Apache-2.0',
  },
  tensorflowPlaygroundGithub: {
    label: loc('tensorflow/playground 源码', 'tensorflow/playground source'),
    href: 'https://github.com/tensorflow/playground',
    license: 'Apache-2.0',
  },
} satisfies Record<string, ModuleSourceReference>

function chapter(
  id: string,
  title: LocalizedCopy,
  markdown: LocalizedCopy,
  callout: LocalizedCopy,
  experimentPrompt: LocalizedCopy,
  playgroundFocus: MlpPlaygroundFocus,
  visualIds: string[],
  sourceRefs: ModuleSourceReference[],
): StorySection {
  return {
    id,
    eyebrowKey: 'common.chapter',
    titleKey: `modules.mlp.sections.${id}.title`,
    title,
    markdown,
    callout,
    experimentPrompt,
    playgroundFocus,
    visualIds,
    sources: sourceRefs,
  }
}

export const mlpVisuals: ModuleVisualAsset[] = [
  {
    id: 'affine-activation-map',
    type: 'image',
    title: loc('仿射变换到激活响应', 'Affine transform to activation response'),
    caption: loc(
      '一个神经元先把平面切成有方向的分数，再由激活函数把分数折成非线性信号。',
      'A neuron first assigns an oriented score to the plane; the activation bends that score into a nonlinear signal.',
    ),
    assetPath: '/mlp/generated/affine-activation-map.png',
  },
  {
    id: 'hidden-space-rewrite',
    type: 'image',
    title: loc('隐藏层重写表示空间', 'Hidden layer rewrites representation space'),
    caption: loc(
      '原本纠缠的点云，在隐藏层输出坐标中可能变成更容易线性读出的结构。',
      'A tangled input cloud can become easier to read linearly after the hidden layer maps it into a new coordinate system.',
    ),
    assetPath: '/mlp/generated/hidden-space-rewrite.png',
  },
  {
    id: 'backprop-responsibility',
    type: 'image',
    title: loc('损失信号沿计算图分配责任', 'Loss signal assigns responsibility through the graph'),
    caption: loc(
      '反向传播不是倒着预测，而是用链式法则把误差信号分配给每条边和每个偏置。',
      'Backpropagation is not reverse prediction; it uses the chain rule to assign error signal to each edge and bias.',
    ),
    assetPath: '/mlp/generated/backprop-responsibility.png',
  },
  {
    id: 'capacity-generalization',
    type: 'image',
    title: loc('容量与泛化的权衡', 'Capacity and generalization tradeoff'),
    caption: loc(
      '容量增加能画出更复杂的边界，也会给噪声留下更多被记住的空间。',
      'More capacity can draw richer boundaries, but it also gives noise more room to be memorized.',
    ),
    assetPath: '/mlp/generated/capacity-generalization.png',
  },
  {
    id: 'mlp-affine-activation-video',
    type: 'manim-video',
    title: loc('从线性分数到激活信号', 'From linear score to activation signal'),
    caption: loc(
      'Manim 动画展示同一条仿射分数线如何被 tanh、ReLU 和 sigmoid 改写。',
      'A Manim animation showing how tanh, ReLU, and sigmoid rewrite the same affine score.',
    ),
    assetPath: '/manim/mlp/affine-activation.mp4',
    posterPath: '/manim/mlp/affine-activation.svg',
  },
  {
    id: 'mlp-hidden-rewrite-video',
    type: 'manim-video',
    title: loc('隐藏空间重组', 'Hidden-space rearrangement'),
    caption: loc(
      '把输入空间和隐藏空间并排观看，看到非线性表示如何让最后一层更容易工作。',
      'Input space and hidden space are shown side by side so the final layer becomes easier to interpret.',
    ),
    assetPath: '/manim/mlp/hidden-rewrite.mp4',
    posterPath: '/manim/mlp/hidden-rewrite.svg',
  },
  {
    id: 'mlp-backprop-video',
    type: 'manim-video',
    title: loc('反向传播的责任分配', 'Backpropagation responsibility'),
    caption: loc(
      '动画沿计算图回传梯度，强调每个局部导数如何进入最终更新。',
      'The animation sends gradients backward through a computation graph and shows how local derivatives enter each update.',
    ),
    assetPath: '/manim/mlp/backprop-responsibility.mp4',
    posterPath: '/manim/mlp/backprop-responsibility.svg',
  },
  {
    id: 'mlp-capacity-video',
    type: 'manim-video',
    title: loc('容量和过拟合', 'Capacity and overfitting'),
    caption: loc(
      '边界从过于简单到过度弯曲，帮助区分欠拟合、合适容量和过拟合。',
      'The boundary moves from too simple to overly curved to separate underfitting, useful capacity, and overfitting.',
    ),
    assetPath: '/manim/mlp/capacity-overfitting.mp4',
    posterPath: '/manim/mlp/capacity-overfitting.svg',
  },
]

export const mlpModule: AlgorithmModuleDefinition = {
  slug: 'mlp',
  route: '/learn/mlp',
  titleKey: 'modules.mlp.title',
  kickerKey: 'modules.mlp.kicker',
  introKey: 'modules.mlp.intro',
  summaryKey: 'modules.mlp.summary',
  theme: '#eef1ff',
  accent: '#4d63ff',
  visuals: mlpVisuals,
  sourceNote: loc(
    '本页内容综合改写自 D2L、Google ML Crash Course、OpenStax 和 TensorFlow Playground。OpenStax 来源按 CC BY-NC-SA 使用，TensorFlow Playground 仅作为 Apache-2.0 交互参考。',
    'This lesson synthesizes and rewrites ideas from D2L, Google Machine Learning Crash Course, OpenStax, and TensorFlow Playground. OpenStax material is used under CC BY-NC-SA; TensorFlow Playground is used as an Apache-2.0 interaction reference.',
  ),
  chapters: [
    chapter(
      'linearLimits',
      loc('线性模型为什么会在 XOR 上失败', 'Why linear models fail on XOR'),
      loc(
        `### 核心问题
逻辑回归已经能输出概率，为什么还需要 MLP？

### 概念直觉
线性分类器只能把平面切成两半。XOR、同心圆和螺旋数据的类别结构不是“一刀切开”的结构，所以再调学习率也只能优化一条错误形状的边界。MLP 的入口动机不是“更神秘”，而是“先把空间改写成更容易切开的样子”。

### 最小手算例
四个点 $(-1,-1),(1,1)$ 属于一类，$(-1,1),(1,-1)$ 属于另一类。任意一条直线如果把左上和右下放在同一侧，就会同时影响左下和右上；这说明单条线无法同时满足四个约束。

### 公式
线性分类器只能学习

$$z=w_1x_1+w_2x_2+b$$

再接 sigmoid 或 tanh 只会改变分数尺度，不会让边界从直线变成弯曲曲线。

### 常见误解
XOR 失败不是训练轮数不够，也不是损失函数没有下降，而是模型族本身表达不了目标边界。

### 实验任务
在实验台选择 XOR，先把隐藏层删到 0 层，再播放训练；观察 loss 可能下降但边界形状仍然不对。然后加回一层隐藏层，比较输出热力图是否开始弯曲。`,
        `### Core Question
Logistic regression can already output probabilities, so why do we need an MLP?

### Concept
A linear classifier can only cut the plane in two. XOR, circles, and spirals are not one-cut structures, so tuning the learning rate only optimizes the wrong boundary family. The MLP is introduced because it can rewrite the space before the final split.

### Minimal Hand Example
Let $(-1,-1),(1,1)$ be one class and $(-1,1),(1,-1)$ the other. Any single line that puts the upper-left and lower-right points together will also constrain the other diagonal incorrectly, so one line cannot satisfy all four constraints.

### Formula
A linear classifier only learns

$$z=w_1x_1+w_2x_2+b$$

Adding sigmoid or tanh changes the score scale, but the decision boundary remains a line.

### Common Mistake
XOR failure is not mainly about too few epochs. It is a model-family mismatch.

### Experiment
Choose XOR, remove hidden layers, and play training. Watch loss move while the boundary shape remains wrong. Then add one hidden layer and compare whether the output heatmap bends.`,
      ),
      loc(
        '先把失败归因于表达能力，而不是归因于优化器。',
        'Attribute the failure to representation capacity before blaming the optimizer.',
      ),
      loc(
        '选择 XOR，分别使用 0 层和 1 层隐藏层，对比输出热力图。',
        'Use XOR with zero hidden layers and then one hidden layer; compare the output heatmap.',
      ),
      'dataset',
      ['capacity-generalization', 'mlp-capacity-video'],
      [sources.d2lMlp, sources.mlccHidden, sources.tensorflowPlayground],
    ),
    chapter(
      'neuronAffine',
      loc('一个神经元先学习一条有方向的仿射分数线', 'A neuron first learns an oriented affine score'),
      loc(
        `### 核心问题
隐藏单元到底在看什么？

### 概念直觉
每个隐藏神经元都会把输入坐标投影到一个方向，再加上偏置。权重决定“看哪个方向”，偏置决定“从哪里开始响应”。这一步还是线性的，但它为后面的激活函数准备了可被弯折的分数。

### 最小手算例
若 $w=[2,-1]$，$b=0.5$，点 $x=[1,3]$ 的神经元分数是

$$a=w^Tx+b=2\\cdot1-1\\cdot3+0.5=-0.5$$

这个数还不是最终类别，只是该神经元对这个点的局部响应。

### 公式

$$a_j=\\mathbf{w}_j^T\\mathbf{x}+b_j$$

$j$ 表示第 $j$ 个隐藏单元。多个神经元同时给出多个方向的分数，组成隐藏向量的原料。

### 常见误解
神经元不是直接存储训练样本。它先学习一个方向性检测器，后续层再组合这些检测器。

### 实验任务
打开输入特征开关，比较只使用 $x_1,x_2$ 与加入 $x_1^2,x_2^2,x_1x_2$ 时，输入节点小热力图如何变化。`,
        `### Core Question
What does a hidden unit look at?

### Concept
Each hidden neuron projects the input onto a direction and adds a bias. The weights decide which direction it reads; the bias decides where the response starts. This step is still linear, but it prepares a score that an activation can bend.

### Minimal Hand Example
If $w=[2,-1]$, $b=0.5$, and $x=[1,3]$, then

$$a=w^Tx+b=2\\cdot1-1\\cdot3+0.5=-0.5$$

This number is not the final class. It is the local response of one neuron.

### Formula

$$a_j=\\mathbf{w}_j^T\\mathbf{x}+b_j$$

The index $j$ names the hidden unit. Several neurons produce several directional scores that become the hidden vector.

### Common Mistake
A neuron is not a storage slot for examples. It first acts like a directional detector, and later layers combine those detectors.

### Experiment
Toggle input features and compare the tiny heatmaps for $x_1,x_2$ versus $x_1^2,x_2^2,x_1x_2$.`,
      ),
      loc(
        '把神经元读成“方向 + 偏置 + 响应”，比读成黑箱更有用。',
        'Read a neuron as direction plus bias plus response, not as a black box.',
      ),
      loc(
        '悬停或观察每个输入节点的小热力图，理解每个特征给网络提供了什么信号。',
        'Inspect each input node heatmap to see what signal each feature provides.',
      ),
      'features',
      ['affine-activation-map', 'mlp-affine-activation-video'],
      [sources.d2lMlp, sources.mlccHidden, sources.tensorflowPlaygroundGithub],
    ),
    chapter(
      'activations',
      loc('激活函数让多层网络不再退化成一层线性模型', 'Activations stop stacked layers from collapsing into one linear model'),
      loc(
        `### 核心问题
为什么两层线性变换中间必须加激活函数？

### 概念直觉
如果层与层之间没有非线性，多个矩阵相乘仍然只是一个矩阵。模型看起来更深，但可表达的边界没有变。激活函数把仿射分数改写成非线性响应，后面的层才能组合出折线、弧线和局部区域。

### 最小手算例
若第一层输出 $W_1x+b_1$，第二层再做 $W_2h+b_2$，没有激活时：

$$W_2(W_1x+b_1)+b_2=(W_2W_1)x+W_2b_1+b_2$$

它仍然是一层线性/仿射模型。

### 公式

$$h=\\phi(W_1x+b_1)$$

$\\phi$ 可以是 tanh、ReLU、sigmoid 或 linear。linear 适合作为对照，能直接暴露“无非线性”的退化。

### 常见误解
ReLU、tanh、sigmoid 不只是不同风格的按钮；它们会改变隐藏节点小热力图的形状、饱和区域和可训练性。

### 实验任务
保持数据集和网络结构不变，只切换 tanh、ReLU、sigmoid、linear。观察隐藏节点热力图、输出边界和 loss 曲线。`,
        `### Core Question
Why must a nonlinear activation sit between linear layers?

### Concept
Without nonlinearity, multiplying several matrices still gives one matrix. The model appears deeper, but the boundary family does not change. Activations rewrite affine scores into nonlinear responses that later layers can combine into bends, arcs, and local regions.

### Minimal Hand Example
If layer one returns $W_1x+b_1$ and layer two applies $W_2h+b_2$, then without activation:

$$W_2(W_1x+b_1)+b_2=(W_2W_1)x+W_2b_1+b_2$$

The result is still one affine model.

### Formula

$$h=\\phi(W_1x+b_1)$$

$\\phi$ may be tanh, ReLU, sigmoid, or linear. Linear is useful as a control case because it exposes the no-nonlinearity collapse.

### Common Mistake
ReLU, tanh, and sigmoid are not cosmetic choices. They change hidden heatmaps, saturation regions, and trainability.

### Experiment
Keep dataset and architecture fixed, then switch tanh, ReLU, sigmoid, and linear. Compare hidden-node heatmaps, output boundary, and loss curves.`,
      ),
      loc(
        '激活函数是表达能力的开关，不是装饰。',
        'Activation is the switch for expressive power, not decoration.',
      ),
      loc(
        '只改 activation，其他控件不动，观察每个节点热力图如何换形状。',
        'Change only activation and watch every node heatmap change shape.',
      ),
      'activations',
      ['affine-activation-map', 'mlp-affine-activation-video'],
      [sources.d2lMlp, sources.mlccActivation, sources.tensorflowPlayground],
    ),
    chapter(
      'hiddenRepresentation',
      loc('隐藏层把难分的输入空间重组成更好读的表示空间', 'Hidden layers rearrange hard input space into readable representations'),
      loc(
        `### 核心问题
MLP 为什么能画出逻辑回归画不出的边界？

### 概念直觉
输出层并不是直接在原始平面上硬画一条复杂曲线。它读取隐藏层提供的新坐标。只要隐藏空间里的两类样本变得更容易分开，最后一层就可以用相对简单的组合完成分类。

### 最小手算例
对 XOR，可以构造两个隐藏特征：

$$h_1=\\mathbb{1}[x_1+x_2>0],\\quad h_2=\\mathbb{1}[x_1-x_2>0]$$

原空间里对角纠缠的类别，在 $(h_1,h_2)$ 空间里会更接近“可读表格”。

### 公式

$$\\mathbf{h}=\\phi(W_1\\mathbf{x}+\\mathbf{b}_1),\\quad \\hat{y}=g(W_2\\mathbf{h}+b_2)$$

隐藏层负责表示重组，输出层负责读出预测。

### 常见误解
非线性边界不是最后一层凭空画出来的；它来自隐藏层多个局部响应的组合。

### 实验任务
在网络图中观察每个隐藏节点的小热力图，再看输出节点如何叠加它们。切换 circle、xor、spiral，比较哪些节点负责哪类局部区域。`,
        `### Core Question
Why can an MLP draw boundaries that logistic regression cannot?

### Concept
The output layer does not directly force a complex curve onto raw input space. It reads new coordinates supplied by the hidden layer. Once hidden space makes the classes easier to separate, the final layer can use a simpler combination.

### Minimal Hand Example
For XOR, two hidden features can be sketched as:

$$h_1=\\mathbb{1}[x_1+x_2>0],\\quad h_2=\\mathbb{1}[x_1-x_2>0]$$

The diagonal pattern in input space becomes closer to a readable table in $(h_1,h_2)$ space.

### Formula

$$\\mathbf{h}=\\phi(W_1\\mathbf{x}+\\mathbf{b}_1),\\quad \\hat{y}=g(W_2\\mathbf{h}+b_2)$$

The hidden layer rewrites representation; the output layer reads prediction.

### Common Mistake
The nonlinear boundary is not drawn from nowhere by the final layer. It comes from combining local hidden responses.

### Experiment
Inspect each hidden-node heatmap in the network graph, then watch how the output node combines them. Switch circle, XOR, and spiral to compare which nodes cover which regions.`,
      ),
      loc(
        '把“原空间难分”和“隐藏空间好读”这两件事对上。',
        'Connect hard input separation with readable hidden representations.',
      ),
      loc(
        '观察隐藏节点小热力图和输出热力图之间的组合关系。',
        'Compare hidden-node heatmaps with the final output heatmap.',
      ),
      'network',
      ['hidden-space-rewrite', 'mlp-hidden-rewrite-video'],
      [sources.d2lMlp, sources.mlccHidden, sources.openStax],
    ),
    chapter(
      'forwardOutput',
      loc('前向传播把特征、隐藏响应和输出层连成一次预测', 'Forward propagation connects features, hidden responses, and output into one prediction'),
      loc(
        `### 核心问题
一次预测到底经过哪些量？

### 概念直觉
前向传播就是把输入特征依次送过每一层：输入节点给出原始或手工特征，隐藏节点给出响应，输出节点把响应组合成最终分数。分类任务通常读符号或概率，回归任务直接读连续数值。

### 最小手算例
若某点的两个隐藏响应是 $h=[0.8,-0.4]$，输出权重是 $v=[1.2,-0.7]$，偏置 $c=0.1$：

$$o=v^Th+c=1.2\\cdot0.8-0.7\\cdot(-0.4)+0.1=1.34$$

分类时这个正分数偏向正类；回归时它会被当作连续预测或再被裁剪到可视范围。

### 公式

$$f(\\mathbf{x})=g(W_2\\phi(W_1\\mathbf{x}+\\mathbf{b}_1)+b_2)$$

$g$ 是输出层激活：分类里可用 tanh 作为可视化分数，回归里常用 linear。

### 常见误解
隐藏层和输出层不是互相竞争的两种解释。隐藏层提供表示，输出层做读出。

### 实验任务
在分类和回归之间切换。比较输出节点热力图：分类看正负区域，回归看连续高度场。`,
        `### Core Question
What values does one prediction pass through?

### Concept
Forward propagation sends features through the layers: input nodes provide raw or engineered features, hidden nodes respond, and the output node combines responses into a final score. Classification reads sign or probability-like score; regression reads a continuous value.

### Minimal Hand Example
If a point has hidden response $h=[0.8,-0.4]$, output weights $v=[1.2,-0.7]$, and bias $c=0.1$:

$$o=v^Th+c=1.2\\cdot0.8-0.7\\cdot(-0.4)+0.1=1.34$$

For classification, the positive score favors the positive class. For regression, it is read as a continuous prediction or clipped for display.

### Formula

$$f(\\mathbf{x})=g(W_2\\phi(W_1\\mathbf{x}+\\mathbf{b}_1)+b_2)$$

$g$ is the output activation: tanh is useful for visual classification scores, while regression often uses linear output.

### Common Mistake
The hidden layer and output layer are not competing explanations. The hidden layer represents; the output layer reads out.

### Experiment
Switch between classification and regression. Compare the output heatmap: classification shows positive and negative regions, while regression shows a continuous surface.`,
      ),
      loc(
        '前向传播是一条数据流，不是一组孤立公式。',
        'Forward propagation is a data flow, not a set of isolated formulas.',
      ),
      loc(
        '切换分类/回归任务，观察输出节点语义如何变化。',
        'Switch classification and regression and watch what the output node means.',
      ),
      'loss',
      ['hidden-space-rewrite'],
      [sources.d2lMlp, sources.openStax, sources.tensorflowPlayground],
    ),
    chapter(
      'backprop',
      loc('反向传播用链式法则给每条边分配责任', 'Backpropagation uses the chain rule to assign responsibility to every edge'),
      loc(
        `### 核心问题
前面的隐藏层怎么知道自己该往哪里改？

### 概念直觉
反向传播不是“倒着预测输入”，而是高效计算梯度。输出误差先告诉最后一层哪里错了，再通过每条连接的局部导数，把责任传回隐藏层的权重和偏置。

### 最小手算例
若损失对输出的导数是 $\\partial L/\\partial o=0.6$，输出对某隐藏值的导数是权重 $v_j=1.5$，则该隐藏值接收到的误差信号是

$$\\frac{\\partial L}{\\partial h_j}=0.6\\cdot1.5=0.9$$

这个信号还会继续乘上激活函数导数，再更新更前面的权重。

### 公式

$$\\frac{\\partial L}{\\partial W_1}=\\frac{\\partial L}{\\partial \\mathbf{h}}\\frac{\\partial \\mathbf{h}}{\\partial W_1}$$

链式法则让每个局部模块只需要知道自己的输入、输出和导数。

### 常见误解
反向传播不是一种新的模型，也不是只更新最后一层。它是把同一个损失函数的梯度分配给所有可训练参数。

### 实验任务
用 step 按钮单步训练，观察 loss、权重线粗细、bias 色块和输出热力图是否同步变化。`,
        `### Core Question
How do earlier hidden layers know how to change?

### Concept
Backpropagation is not reverse prediction. It is efficient gradient computation. The output error first tells the final layer what went wrong, then each local derivative sends responsibility back through weights and biases.

### Minimal Hand Example
If $\\partial L/\\partial o=0.6$ and the output derivative with respect to hidden value $h_j$ is weight $v_j=1.5$, then the hidden value receives

$$\\frac{\\partial L}{\\partial h_j}=0.6\\cdot1.5=0.9$$

That signal is multiplied by the activation derivative before earlier weights update.

### Formula

$$\\frac{\\partial L}{\\partial W_1}=\\frac{\\partial L}{\\partial \\mathbf{h}}\\frac{\\partial \\mathbf{h}}{\\partial W_1}$$

The chain rule lets each local module use its own input, output, and derivative.

### Common Mistake
Backpropagation is not a new model and it does not only update the last layer. It distributes the gradient of the same loss to every trainable parameter.

### Experiment
Use the Step button. Watch loss, link thickness, bias color, and output heatmap change together.`,
      ),
      loc(
        '反向传播是高效算梯度，而不是神经网络的第二套预测过程。',
        'Backpropagation is efficient gradient computation, not a second prediction process.',
      ),
      loc(
        '连续单步训练，追踪误差信号如何体现在权重线和输出热力图上。',
        'Step training and track how error signal appears in weights and output heatmaps.',
      ),
      'loss',
      ['backprop-responsibility', 'mlp-backprop-video'],
      [sources.d2lBackprop, sources.openStax],
    ),
    chapter(
      'trainingDynamics',
      loc('训练动态要同时看数据、损失曲线和网络内部状态', 'Training dynamics require data, loss curves, and internal network state together'),
      loc(
        `### 核心问题
怎么判断网络是在学习、震荡还是卡住？

### 概念直觉
只看最终准确率会漏掉很多问题。学习率过高时，loss 曲线可能抖动；batch 太小时，路径会有噪声；特征开关不合适时，网络会花容量去补基础特征的缺口。高质量调参要同时看训练/测试 loss、节点热力图和权重变化。

### 最小手算例
若当前权重梯度是 $0.8$，学习率是 $0.03$，一次更新移动 $0.024$。若学习率改成 $0.6$，同一梯度会移动 $0.48$，更容易跨过低损失区域。

### 公式

$$w\\leftarrow w-\\eta\\frac{\\partial L}{\\partial w}$$

$\\eta$ 控制每次更新多大，batch size 控制梯度估计使用多少样本。

### 常见误解
训练曲线下降不代表泛化一定好；测试 loss 与训练 loss 的分离才是更重要的诊断信号。

### 实验任务
把 learning rate 从 0.03 提到 0.3，再调 batch size。观察 loss 曲线是否平滑、震荡或突然变差。`,
        `### Core Question
How do we tell whether the network is learning, oscillating, or stuck?

### Concept
Final accuracy alone misses many problems. A high learning rate can make loss oscillate; small batches add noise; poor feature choices force the network to spend capacity compensating for missing signals. Good tuning reads train/test loss, node heatmaps, and weight changes together.

### Minimal Hand Example
If the current weight gradient is $0.8$ and learning rate is $0.03$, the update moves $0.024$. With learning rate $0.6$, the same gradient moves $0.48$, making it easier to jump across low-loss regions.

### Formula

$$w\\leftarrow w-\\eta\\frac{\\partial L}{\\partial w}$$

$\\eta$ controls update size, while batch size controls how many examples estimate the gradient.

### Common Mistake
A falling training curve does not guarantee generalization. The split between test loss and train loss is the stronger diagnostic.

### Experiment
Raise learning rate from 0.03 to 0.3, then change batch size. Watch whether loss is smooth, oscillatory, or unstable.`,
      ),
      loc(
        '训练诊断要把曲线、热力图和权重状态放在一起读。',
        'Training diagnosis reads curves, heatmaps, and weight state together.',
      ),
      loc(
        '调整 learning rate 和 batch size，比较训练/测试 loss 的形状。',
        'Tune learning rate and batch size and compare train/test loss curves.',
      ),
      'loss',
      ['backprop-responsibility'],
      [sources.d2lBackprop, sources.tensorflowPlaygroundGithub],
    ),
    chapter(
      'capacityGeneralization',
      loc('容量、正则化和泛化决定边界是否只是记住噪声', 'Capacity, regularization, and generalization decide whether the boundary is memorizing noise'),
      loc(
        `### 核心问题
为什么更大的网络不一定更好？

### 概念直觉
更多层和更多神经元会提高可表达的函数复杂度。它能修正欠拟合，也可能追着噪声画出过度弯曲的边界。正则化通过惩罚权重大小，让网络少依赖过大的局部响应。

### 最小手算例
若两个模型训练 loss 分别是 0.03 和 0.08，但测试 loss 分别是 0.30 和 0.12，第二个模型更值得信任。泛化看的是未见数据。

### 公式

$$L_{total}=L_{data}+\\lambda R(W)$$

L2 常用 $R(W)=\\frac12\\sum w^2$，L1 常用 $R(W)=\\sum |w|$。

### 常见误解
正则化不是为了让训练 loss 一定更低，而是为了控制复杂度和提高未见样本表现。

### 实验任务
增加隐藏层和神经元，再提高 noise。比较没有正则、L1、L2 时，权重线、测试 loss 和边界曲率如何变化。`,
        `### Core Question
Why is a larger network not always better?

### Concept
More layers and neurons increase the complexity of functions the network can express. That can fix underfitting, but it can also chase noise with overly curved boundaries. Regularization penalizes weight size so the network relies less on extreme local responses.

### Minimal Hand Example
If two models have train loss 0.03 and 0.08 but test loss 0.30 and 0.12, the second model is more trustworthy. Generalization is about unseen data.

### Formula

$$L_{total}=L_{data}+\\lambda R(W)$$

L2 often uses $R(W)=\\frac12\\sum w^2$; L1 often uses $R(W)=\\sum |w|$.

### Common Mistake
Regularization is not meant to always lower training loss. It controls complexity and can improve unseen-sample behavior.

### Experiment
Add hidden layers and neurons, then increase noise. Compare no regularization, L1, and L2 through link weights, test loss, and boundary curvature.`,
      ),
      loc(
        '容量解决欠拟合，但正则化和测试集告诉你有没有开始记噪声。',
        'Capacity fixes underfitting, while regularization and test data reveal noise memorization.',
      ),
      loc(
        '提高网络容量和噪声，再切换 L1/L2 正则化，观察测试 loss。',
        'Increase capacity and noise, then switch L1/L2 regularization and inspect test loss.',
      ),
      'generalization',
      ['capacity-generalization', 'mlp-capacity-video'],
      [sources.d2lGeneralization, sources.openStax, sources.tensorflowPlayground],
    ),
  ],
  controls: [
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
    { key: 'learningRate', type: 'range', labelKey: 'controls.learningRate', category: 'optimization', min: 0.001, max: 1, step: 0.001, format: 'number' },
    { key: 'noise', type: 'range', labelKey: 'controls.noise', category: 'data', min: 0, max: 0.5, step: 0.01, format: 'number' },
  ],
  presets: [
    {
      id: 'xor-linear-limit',
      label: loc('XOR 线性失败', 'XOR linear failure'),
      description: loc('移除隐藏层，暴露单条边界的表达限制。', 'Remove hidden layers to expose one-boundary limits.'),
      config: { hiddenUnits: 2, activation: 'linear', datasetKind: 'xor', learningRate: 0.03, epochs: 80, noise: 0.08, validationSplit: 0.5 },
    },
    {
      id: 'playground-default',
      label: loc('Playground 默认网络', 'Playground default network'),
      description: loc('一层 4 个神经元加一层 2 个神经元，适合观察节点热力图。', 'A 4-neuron layer followed by a 2-neuron layer for reading node heatmaps.'),
      config: { hiddenUnits: 6, activation: 'tanh', datasetKind: 'circles', learningRate: 0.03, epochs: 90, noise: 0.08, validationSplit: 0.5 },
    },
    {
      id: 'regularized-capacity',
      label: loc('容量与正则化', 'Capacity with regularization'),
      description: loc('提高容量和噪声，用测试集判断边界是否过度弯曲。', 'Increase capacity and noise, then use test data to judge boundary complexity.'),
      config: { hiddenUnits: 12, activation: 'tanh', datasetKind: 'spiral', learningRate: 0.03, epochs: 120, noise: 0.18, validationSplit: 0.5 },
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
