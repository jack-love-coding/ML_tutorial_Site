import type {
  AlgorithmModuleDefinition,
  LocalizedCopy,
  ModuleSourceReference,
  ModuleVisualAsset,
  MlpPlaygroundFocus,
  StorySection,
} from '../types/ml'
import { simulateMLP } from '../simulations/mlp'
import { algorithmCheckpointsBySlug } from './algorithmCheckpoints'

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
  pytorchAutograd: {
    label: loc('PyTorch：自动微分机制', 'PyTorch: Autograd mechanics'),
    href: 'https://docs.pytorch.org/docs/stable/notes/autograd.html',
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

interface MlpLessonSupplement {
  variables: LocalizedCopy
  workedExample: LocalizedCopy
  visualGuide: LocalizedCopy
  misconception: LocalizedCopy
}

const mlpLessonSupplements: Record<string, MlpLessonSupplement> = {
  linearLimits: {
    variables: loc(
      String.raw`$x_1,x_2$ 是二维输入，$w_1,w_2$ 决定直线方向，$b$ 平移直线。预测类别由 $z$ 的符号决定，因此 $z=0$ 永远只是一条直线。`,
      String.raw`$x_1,x_2$ are the two inputs, $w_1,w_2$ orient the line, and $b$ shifts it. The class is read from the sign of $z$, so $z=0$ is always a line.`,
    ),
    workedExample: loc(
      String.raw`把四个 XOR 点代入 $z=w_1x_1+w_2x_2+b$。如果同号点都要求 $z>0$，异号点都要求 $z<0$，四个不等式相加会互相矛盾。这说明失败来自模型族，而不是训练次数不够。`,
      String.raw`Substitute all four XOR points into $z=w_1x_1+w_2x_2+b$. Requiring both equal-sign points to have $z>0$ and both mixed-sign points to have $z<0$ produces contradictory inequalities. The model family is the limitation, not the epoch count.`,
    ),
    visualGuide: loc(
      '先看散点的四个象限，再看白色零等值线。0 层时无论怎样训练都只能得到一条直线；加入隐藏层后，多个隐藏响应可以拼出折线边界。',
      'Read the four quadrants first, then the white zero contour. With zero hidden layers it stays a line; hidden responses can combine into a bent boundary.',
    ),
    misconception: loc(
      '误区：把 XOR 失败归因于学习率或随机初始化。若模型只能表示直线，再好的优化器也找不到不存在的弯曲边界。',
      'Misconception: blaming learning rate or initialization. An optimizer cannot find a curved boundary that the model cannot represent.',
    ),
  },
  neuronAffine: {
    variables: loc(
      String.raw`$\mathbf{x}$ 是输入向量，$\mathbf{w}_j$ 是第 $j$ 个神经元观察输入的方向，$b_j$ 是偏置，$a_j=\mathbf{w}_j^\top\mathbf{x}+b_j$ 是激活前分数。`,
      String.raw`$\mathbf{x}$ is the input, $\mathbf{w}_j$ is neuron $j$'s reading direction, $b_j$ is its bias, and $a_j=\mathbf{w}_j^\top\mathbf{x}+b_j$ is the pre-activation score.`,
    ),
    workedExample: loc(
      String.raw`对 $\mathbf{x}=[1,3]$、$\mathbf{w}=[2,-1]$、$b=0.5$，分数为 $2-3+0.5=-0.5$。把 $x_1$ 增加 0.1 会让分数增加 0.2，而把 $x_2$ 增加 0.1 会让分数减少 0.1。`,
      String.raw`For $\mathbf{x}=[1,3]$, $\mathbf{w}=[2,-1]$, and $b=0.5$, the score is $2-3+0.5=-0.5$. Increasing $x_1$ by 0.1 adds 0.2 to the score; increasing $x_2$ by 0.1 subtracts 0.1.`,
    ),
    visualGuide: loc(
      '权重线的颜色表示正负、粗细表示绝对值；节点热力图中的渐变方向应与权重方向一致。偏置变化会移动整片颜色，但不会旋转方向。',
      'Link color shows sign and thickness shows magnitude. A node heatmap should vary along its weight direction; changing bias shifts the colors without rotating that direction.',
    ),
    misconception: loc(
      '误区：把单个隐藏神经元当成一个完整类别检测器。单元只产生可被后续层组合的局部响应。',
      'Misconception: treating one hidden neuron as a complete class detector. It only produces a local response for later layers to combine.',
    ),
  },
  activations: {
    variables: loc(
      String.raw`隐藏输出写成 $h_j=\phi(a_j)$。tanh 输出在 $[-1,1]$，sigmoid 输出在 $[0,1]$，ReLU 为 $\max(0,a_j)$；linear 则令 $h_j=a_j$。`,
      String.raw`A hidden output is $h_j=\phi(a_j)$. tanh lies in $[-1,1]$, sigmoid in $[0,1]$, ReLU is $\max(0,a_j)$, and linear leaves $h_j=a_j$.`,
    ),
    workedExample: loc(
      String.raw`当 $a=-2,0,2$ 时，ReLU 给出 $0,0,2$；tanh 约为 $-0.964,0,0.964$。同一组仿射分数经过不同激活后，后续层看到的信号范围与梯度都不同。`,
      String.raw`For $a=-2,0,2$, ReLU returns $0,0,2$, while tanh is about $-0.964,0,0.964$. The same affine scores produce different ranges and gradients after activation.`,
    ),
    visualGuide: loc(
      '切换激活函数时不要同时改网络结构。观察节点热力图的截断或饱和区域，并把它与梯度强度和损失变化对应起来。',
      'Change only the activation. Match clipped or saturated heatmap regions with gradient strength and loss movement.',
    ),
    misconception: loc(
      '误区：认为非线性越强越好。饱和的 sigmoid/tanh 或大量关闭的 ReLU 都可能让梯度变弱。',
      'Misconception: assuming stronger nonlinearity is always better. Saturated sigmoid/tanh units or many inactive ReLUs can weaken gradients.',
    ),
  },
  hiddenRepresentation: {
    variables: loc(
      String.raw`第一层用 $\mathbf{h}=\phi(W_1\mathbf{x}+\mathbf{b}_1)$ 把原坐标映射到隐藏坐标，输出层再计算 $o=W_2\mathbf{h}+b_2$。`,
      String.raw`The first layer maps input coordinates to hidden coordinates with $\mathbf{h}=\phi(W_1\mathbf{x}+\mathbf{b}_1)$; the output layer reads them with $o=W_2\mathbf{h}+b_2$.`,
    ),
    workedExample: loc(
      String.raw`两个隐藏单元可以分别响应 $x_1+x_2>0$ 与 $x_1-x_2>0$。输出层组合这两个响应后，能区分原空间中单条直线无法同时处理的多个区域。`,
      String.raw`Two hidden units can respond to $x_1+x_2>0$ and $x_1-x_2>0$. Combining them lets the output separate multiple regions that one line in input space cannot handle.`,
    ),
    visualGuide: loc(
      '按输入节点、第一隐藏层、第二隐藏层、输出节点的顺序读小热力图。寻找哪些局部响应被输出层以正权重加入、以负权重扣除。',
      'Read heatmaps from input to hidden layers to output. Identify which local responses the output adds with positive links and subtracts with negative links.',
    ),
    misconception: loc(
      '误区：把隐藏层图案直接命名成“圆”“猫耳”等固定语义。这里能确认的是数值响应与组合关系，不是人类概念标签。',
      'Misconception: assigning fixed human labels such as “circle detector” to every hidden pattern. The view proves numeric responses and combinations, not semantic names.',
    ),
  },
  forwardOutput: {
    variables: loc(
      String.raw`每层依次计算 $\mathbf{a}^{(l)}=W^{(l)}\mathbf{h}^{(l-1)}+\mathbf{b}^{(l)}$ 与 $\mathbf{h}^{(l)}=\phi(\mathbf{a}^{(l)})$。最后输出在分类中读作分数，在回归中读作连续预测。`,
      String.raw`Each layer computes $\mathbf{a}^{(l)}=W^{(l)}\mathbf{h}^{(l-1)}+\mathbf{b}^{(l)}$ and $\mathbf{h}^{(l)}=\phi(\mathbf{a}^{(l)})$. The final output is a class score or a continuous regression prediction.`,
    ),
    workedExample: loc(
      String.raw`若 $\mathbf{h}=[0.8,-0.4]$、$\mathbf{v}=[1.2,-0.7]$、$c=0.1$，则 $o=1.34$。把第一条输出权重改为负数会立即翻转第一个隐藏响应的贡献方向。`,
      String.raw`With $\mathbf{h}=[0.8,-0.4]$, $\mathbf{v}=[1.2,-0.7]$, and $c=0.1$, $o=1.34$. Making the first output weight negative immediately reverses that hidden unit's contribution.`,
    ),
    visualGuide: loc(
      '从当前样本沿连接向右追踪。先读节点响应，再读连接正负与粗细，最后对照输出热力图和当前预测，避免跳过中间量。',
      'Trace the current sample left to right: node responses, link signs and magnitudes, then the output heatmap and prediction.',
    ),
    misconception: loc(
      '误区：把分类输出的原始分数直接当成概率。除非模型明确经过 sigmoid 或 softmax，否则它只是可比较的分数。',
      'Misconception: treating a raw classification score as a probability. It is only a score unless sigmoid or softmax is explicitly applied.',
    ),
  },
  backprop: {
    variables: loc(
      String.raw`用伴随量 $\bar v=\partial L/\partial v$ 记录损失对中间量的敏感度。沿单路径有 $\bar u=\bar v\,\partial v/\partial u$；若 $u$ 流向多个下游节点，则必须把各分支贡献相加。参数更新仍是 $\theta\leftarrow\theta-\eta\nabla_\theta L$。`,
      String.raw`Use the adjoint $\bar v=\partial L/\partial v$ for loss sensitivity to an intermediate value. Along one path, $\bar u=\bar v\,\partial v/\partial u$; if $u$ fans out, contributions from every child must be summed. Parameters update with $\theta\leftarrow\theta-\eta\nabla_\theta L$.`,
    ),
    workedExample: loc(
      String.raw`默认标量网络得到 $z^{(1)}=0.64$、$h=0.564900$、$\hat y=0.585893$ 与 $L=0.017278$。反向计算给出 $\partial L/\partial w^{(1)}=0.109724$；当 $\eta=0.1$ 时，$w^{(1)}$ 从 $0.7$ 更新为 $0.689028$，重新前向后的损失为 $0.013425$。`,
      String.raw`The default scalar network gives $z^{(1)}=0.64$, $h=0.564900$, $\hat y=0.585893$, and $L=0.017278$. Backward computation gives $\partial L/\partial w^{(1)}=0.109724$; with $\eta=0.1$, $w^{(1)}$ changes from $0.7$ to $0.689028$, and a new forward pass gives loss $0.013425$.`,
    ),
    visualGuide: loc(
      '蓝色实线表示前向依赖，橙色虚线高亮当前反向步骤；节点下方的 bar 数值是伴随量。先读输出误差，再逐边查看“上游梯度 × 局部导数”，最后对照参数表中的梯度与 −ηg。',
      'Blue solid links show forward dependencies; the orange dashed link marks the current backward step. The bar value below a node is its adjoint. Read the output error first, inspect upstream gradient times local derivative, then compare the gradient with −ηg in the parameter table.',
    ),
    misconception: loc(
      '误区：反向传播会倒着生成输入，或每个节点只接收一条梯度。它实际复用前向缓存计算导数；当计算图发生分支时，同一变量的伴随量是所有下游贡献之和。',
      'Misconception: backpropagation reconstructs the input, or every node receives only one gradient. It reuses forward caches to compute derivatives, and a branched variable accumulates contributions from every downstream path.',
    ),
  },
  trainingDynamics: {
    variables: loc(
      String.raw`$\eta$ 是学习率，$B$ 是批大小，$g_B$ 是该批样本估计的梯度。一次更新为 $W_{t+1}=W_t-\eta g_B$。`,
      String.raw`$\eta$ is learning rate, $B$ is batch size, and $g_B$ is the batch gradient estimate. One update is $W_{t+1}=W_t-\eta g_B$.`,
    ),
    workedExample: loc(
      String.raw`同一初始状态下分别用 $\eta=0.03$ 与 $0.3$ 单步 20 次。前者通常平滑下降；后者可能越过低损失区域并震荡。再增大 batch，可减少梯度噪声但不会修复过大的步长。`,
      String.raw`From the same initial state, step 20 times with $\eta=0.03$ and $0.3$. The first is usually smooth; the second may overshoot and oscillate. A larger batch reduces noise but cannot fix an excessive step size.`,
    ),
    visualGuide: loc(
      '同时读取 epoch、训练损失、测试损失和梯度强度。平滑下降、带噪下降、横盘和发散是不同状态，不能只用最终一次读数判断。',
      'Read epoch, train loss, test loss, and gradient norm together. Smooth decline, noisy decline, plateau, and divergence are different states.',
    ),
    misconception: loc(
      '误区：损失抖动就一定说明模型错了。小批量梯度本来就有噪声；关键是长期趋势、有限值和测试表现。',
      'Misconception: any loss jitter means the model is wrong. Mini-batch gradients are noisy; inspect the long-run trend, finite values, and test behavior.',
    ),
  },
  capacityGeneralization: {
    variables: loc(
      String.raw`总目标为 $L_{total}=L_{data}+\lambda R(W)$。L2 用 $R(W)=\frac12\sum w^2$ 平滑收缩权重，L1 用 $R(W)=\sum |w|$ 更容易把部分连接压到零。`,
      String.raw`The total objective is $L_{total}=L_{data}+\lambda R(W)$. L2 uses $\frac12\sum w^2$ for smooth shrinkage; L1 uses $\sum |w|$ and more readily drives some links to zero.`,
    ),
    workedExample: loc(
      String.raw`先用 2 个隐藏单元训练高噪声圆环，再改为 8-8-6。若训练损失下降而测试损失上升，容量增加主要记住了训练噪声。此时比较 $\lambda=0$ 与轻量 L2，而不是继续盲目加层。`,
      String.raw`Train noisy circles with 2 hidden units, then 8-8-6. If train loss drops while test loss rises, added capacity is memorizing noise. Compare $\lambda=0$ with light L2 instead of blindly adding layers.`,
    ),
    visualGuide: loc(
      '把边界弯曲程度、训练/测试损失差距、权重范数和有效连接数一起读。颜色只表示预测方向，不单独证明泛化。',
      'Read boundary curvature, the train/test gap, weight norm, and active links together. Color shows prediction direction, not generalization by itself.',
    ),
    misconception: loc(
      '误区：测试集表现不好就不断用测试结果调参。实验台用测试读数解释泛化；真实项目应另设验证集选择方案，并把测试集留到最后。',
      'Misconception: repeatedly tuning on test results. The lab uses test readouts for intuition; a real project should select with validation data and reserve test data for the end.',
    ),
  },
}

function markdownSections(markdown: string) {
  const sections = new Map<string, string>()
  const matches = [...markdown.matchAll(/^### (.+)$/gm)]
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index]
    if (match.index === undefined) continue
    const start = match.index + match[0].length
    const end = matches[index + 1]?.index ?? markdown.length
    sections.set(match[1].trim(), markdown.slice(start, end).trim())
  }
  return sections
}

function structuredMlpLesson(id: string, markdown: LocalizedCopy, conclusion: LocalizedCopy): LocalizedCopy {
  const supplement = mlpLessonSupplements[id]
  const build = (language: 'zh-CN' | 'en') => {
    const sections = markdownSections(markdown[language])
    const zh = language === 'zh-CN'
    const take = (...names: string[]) => names.map((name) => sections.get(name)).find(Boolean) ?? ''
    const parts = [
      [zh ? '本章问题' : 'Chapter question', take(zh ? '核心问题' : 'Core Question')],
      [zh ? '直觉' : 'Intuition', take(zh ? '直觉' : 'Concept')],
      [zh ? '变量与公式' : 'Variables and formula', take(zh ? '公式' : 'Formula') || supplement.variables[language]],
      [zh ? '手算或代码例子' : 'Worked or code example', take(zh ? '最小例子' : 'Minimal Example') || supplement.workedExample[language]],
      [zh ? '读图提示' : 'How to read the visual', supplement.visualGuide[language]],
      [zh ? '常见误区' : 'Common misconception', supplement.misconception[language]],
      [zh ? '实验任务' : 'Lab task', take(zh ? '实验' : 'Experiment')],
      [zh ? '本章结论' : 'Chapter conclusion', conclusion[language]],
    ]
    return parts.map(([heading, body]) => `### ${heading}\n${body}`).join('\n\n')
  }
  return { 'zh-CN': build('zh-CN'), en: build('en') }
}

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
    markdown: structuredMlpLesson(id, markdown, callout),
    callout,
    experimentPrompt,
    playgroundFocus,
    visualIds,
    sources: sourceRefs,
  }
}

const backpropAnimationTranscript = loc(
  String.raw`#### 0:00｜前向计算与缓存

输入先经过仿射变换和 tanh。动画依次保存 $z^{(1)}$、$h$、$z^{(2)}$ 与 $\hat y$，因为反向传播需要复用这些中间量，而不是重新猜测它们。

#### 0:24｜从损失得到输出误差

平方损失先产生 $\partial L/\partial\hat y=\hat y-y$。输出 tanh 再提供局部导数 $1-\hat y^2$，两者相乘得到 $\delta^{(2)}$。

#### 0:52｜沿单路径应用链式法则

橙色信号沿计算图向左移动。每经过一条边，都把上游伴随量乘以当前局部导数，最终得到隐藏层权重与偏置的梯度。

#### 1:28｜展开网络并累加分支

当 $x_1$ 同时流向两个隐藏单元时，反向传播会沿两条路径产生贡献。$\bar x_1$ 是这些贡献的和，而不是任选其中一条。

#### 2:00｜Reverse-mode 与 VJP

自动微分记录前向操作形成 tape，再按逆拓扑顺序执行 vector–Jacobian product。框架的 backward 操作正是在系统化执行这些局部规则。

#### 2:28｜参数更新与重新前向

梯度本身不是更新量。学习率和负号将其变为 $\Delta\theta=-\eta\nabla_\theta L$。动画更新参数后重新前向，比较更新前后的预测与损失。`,
  String.raw`#### 0:00 | Forward computation and cache

The input passes through affine transforms and tanh. The animation stores $z^{(1)}$, $h$, $z^{(2)}$, and $\hat y$ because backpropagation reuses these intermediates instead of reconstructing them.

#### 0:24 | From loss to output error

Squared loss first gives $\partial L/\partial\hat y=\hat y-y$. Output tanh contributes the local derivative $1-\hat y^2$; multiplying them gives $\delta^{(2)}$.

#### 0:52 | Chain rule along one path

The orange signal moves left through the graph. At each edge, the upstream adjoint is multiplied by the local derivative, eventually producing gradients for hidden weights and biases.

#### 1:28 | Expand the network and accumulate branches

When $x_1$ feeds two hidden units, the reverse pass receives one contribution from each path. $\bar x_1$ is their sum, not a choice between them.

#### 2:00 | Reverse mode and VJP

Automatic differentiation records forward operations on a tape and then executes vector–Jacobian products in reverse topological order. A framework backward call systematically applies these local rules.

#### 2:28 | Parameter update and another forward pass

A gradient is not itself an update. The learning rate and minus sign produce $\Delta\theta=-\eta\nabla_\theta L$. After updating the parameters, the animation runs forward again and compares prediction and loss.`,
)

export const mlpVisuals: ModuleVisualAsset[] = [
  {
    id: 'affine-activation-map',
    type: 'image',
    title: loc('仿射分数到激活响应', 'Affine score to activation response'),
    caption: loc(
      '一个神经元先给输入平面打出有方向的分数，再由激活函数把分数折成非线性信号。',
      'A neuron first assigns an oriented score to the plane; the activation bends that score into a nonlinear signal.',
    ),
    assetPath: '/mlp/generated/affine-activation-map.png',
  },
  {
    id: 'hidden-space-rewrite',
    type: 'image',
    title: loc('隐藏层重写表示空间', 'Hidden layer rewrites representation space'),
    caption: loc(
      '原本纠缠的点云，在隐藏层输出坐标中可以变成更容易线性读出的结构。',
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
      '动画展示同一条仿射分数线如何被 tanh、ReLU 和 sigmoid 改写。',
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
      '把输入空间和隐藏空间并排观察，看到非线性表示如何让最后一层更容易工作。',
      'Input space and hidden space are shown side by side so the final layer becomes easier to interpret.',
    ),
    assetPath: '/manim/mlp/hidden-rewrite.mp4',
    posterPath: '/manim/mlp/hidden-rewrite.svg',
  },
  {
    id: 'mlp-backprop-video',
    type: 'manim-video',
    title: loc('从前向缓存到参数更新', 'From forward cache to parameter update'),
    caption: loc(
      '动画从标量链式法则展开到矩阵 VJP、分支累加与一次完整参数更新。公式与章节互动计算图使用同一套确定性数值。',
      'The animation grows from a scalar chain rule into matrix VJPs, branch accumulation, and one complete parameter update using the same deterministic values as the chapter lab.',
    ),
    alt: loc(
      '反向传播计算图动画：前向值向右流动，梯度沿局部导数向左传播并更新参数。',
      'Backpropagation computation graph animation: forward values flow right, gradients propagate left through local derivatives, and parameters update.',
    ),
    transcript: backpropAnimationTranscript,
    chapterMarkers: [
      { id: 'forward-cache', startSeconds: 0, title: loc('前向计算与缓存', 'Forward cache') },
      { id: 'output-error', startSeconds: 24, title: loc('输出误差信号', 'Output error') },
      { id: 'scalar-chain', startSeconds: 52, title: loc('标量链式法则', 'Scalar chain rule') },
      { id: 'branch-sum', startSeconds: 88, title: loc('分支梯度累加', 'Branch accumulation') },
      { id: 'reverse-vjp', startSeconds: 120, title: loc('Reverse-mode 与 VJP', 'Reverse mode and VJP') },
      { id: 'parameter-update', startSeconds: 148, title: loc('参数更新', 'Parameter update') },
    ],
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
  checkpoints: algorithmCheckpointsBySlug.mlp,
  sourceNote: loc(
    '本页内容综合改写自 D2L、Google Machine Learning Crash Course、OpenStax 和 TensorFlow Playground。OpenStax 内容按 CC BY-NC-SA 使用，TensorFlow Playground 作为 Apache-2.0 交互参考。',
    'This lesson synthesizes and rewrites ideas from D2L, Google Machine Learning Crash Course, OpenStax, and TensorFlow Playground. OpenStax material is used under CC BY-NC-SA; TensorFlow Playground is used as an Apache-2.0 interaction reference.',
  ),
  chapters: [
    chapter(
      'linearLimits',
      loc('线性模型为什么会在 XOR 上失败', 'Why linear models fail on XOR'),
      loc(
        `### 核心问题
逻辑回归已经能输出概率，为什么还需要 MLP？

### 直觉
线性分类器只能把平面切成两个半面。XOR、同心圆和螺旋数据不是“一刀切开”的结构，所以继续调学习率只是在错误的边界族里优化。MLP 的入口动机是先把空间改写成更容易切开的样子。

### 最小例子
四个点 $(-1,-1),(1,1)$ 属于一类，$(-1,1),(1,-1)$ 属于另一类。任意一条直线只要把一条对角线放在同侧，就会破坏另一条对角线的要求。

### 公式
线性分类器只能学习

$$z=w_1x_1+w_2x_2+b$$

再接 sigmoid 或 tanh 只会改变分数尺度，不会让决策边界从直线变成曲线。

### 实验
选择 XOR，先把隐藏层删到 0 层，再加回一层。比较 output 等值线是否从错误的一刀切变成可以弯折的边界。`,
        `### Core Question
Logistic regression can already output probabilities, so why do we need an MLP?

### Concept
A linear classifier can only cut the plane in two. XOR, circles, and spirals are not one-cut structures, so tuning the learning rate only optimizes the wrong boundary family. The MLP is introduced because it can rewrite the space before the final split.

### Minimal Example
Let $(-1,-1),(1,1)$ be one class and $(-1,1),(1,-1)$ the other. Any single line that puts one diagonal together breaks the other diagonal.

### Formula
A linear classifier only learns

$$z=w_1x_1+w_2x_2+b$$

Adding sigmoid or tanh changes the score scale, but the decision boundary remains a line.

### Experiment
Choose XOR, remove hidden layers, and then add one hidden layer. Compare whether the output contour starts to bend.`,
      ),
      loc('先把失败归因于表达能力，而不是归因于优化器。', 'Attribute the failure to representation capacity before blaming the optimizer.'),
      loc('用 XOR 对比 0 层和 1 层隐藏层，观察 output 等值线。', 'Use XOR with zero hidden layers and then one hidden layer; compare the output contour.'),
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

### 直觉
每个隐藏神经元都会把输入坐标投影到一个方向，再加上偏置。权重决定看哪个方向，偏置决定从哪里开始响应。这一步仍然是线性的，但它为后面的激活函数准备了可被弯折的分数。

### 最小例子
若 $w=[2,-1]$，$b=0.5$，点 $x=[1,3]$ 的神经元分数是

$$a=w^Tx+b=2\\cdot1-1\\cdot3+0.5=-0.5$$

这个数不是最终类别，只是该神经元对这个点的局部响应。

### 公式
$$a_j=\\mathbf{w}_j^T\\mathbf{x}+b_j$$

多个神经元同时给出多个方向的分数，组成隐藏向量的原料。

### 实验
打开输入特征开关，比较只使用 $x_1,x_2$ 与加入 $x_1^2,x_2^2,x_1x_2$ 时，输入节点小热力图如何变化。`,
        `### Core Question
What does a hidden unit look at?

### Concept
Each hidden neuron projects the input onto a direction and adds a bias. The weights decide which direction it reads; the bias decides where the response starts.

### Minimal Example
If $w=[2,-1]$, $b=0.5$, and $x=[1,3]$, then

$$a=w^Tx+b=2\\cdot1-1\\cdot3+0.5=-0.5$$

This number is not the final class. It is one neuron's local response.

### Formula
$$a_j=\\mathbf{w}_j^T\\mathbf{x}+b_j$$

Several neurons produce several directional scores that become the hidden vector.

### Experiment
Toggle input features and compare the tiny heatmaps for $x_1,x_2$ versus $x_1^2,x_2^2,x_1x_2$.`,
      ),
      loc('把神经元读成“方向 + 偏置 + 响应”，比读成黑箱更有用。', 'Read a neuron as direction plus bias plus response, not as a black box.'),
      loc('检查每个输入节点热力图，理解每个特征给网络提供了什么信号。', 'Inspect each input node heatmap to see what signal each feature provides.'),
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

### 直觉
如果层与层之间没有非线性，多个矩阵相乘仍然只是一个矩阵。模型看起来更深，但可表达的边界没有变。激活函数把仿射分数改写成非线性响应，后面的层才能组合出折线、弧线和局部区域。

### 最小例子
若第一层输出 $W_1x+b_1$，第二层再做 $W_2h+b_2$，没有激活时：

$$W_2(W_1x+b_1)+b_2=(W_2W_1)x+W_2b_1+b_2$$

它仍然是一层仿射模型。

### 实验
保持数据集和结构不变，只切换 tanh、ReLU、sigmoid、linear。比较隐藏节点热力图、输出边界和 loss 曲线。`,
        `### Core Question
Why must a nonlinear activation sit between linear layers?

### Concept
Without nonlinearity, multiplying several matrices still gives one matrix. The model appears deeper, but the boundary family does not change. Activations rewrite affine scores into nonlinear responses that later layers can combine into bends, arcs, and local regions.

### Minimal Example
If layer one returns $W_1x+b_1$ and layer two applies $W_2h+b_2$, then without activation:

$$W_2(W_1x+b_1)+b_2=(W_2W_1)x+W_2b_1+b_2$$

The result is still one affine model.

### Experiment
Keep dataset and architecture fixed, then switch tanh, ReLU, sigmoid, and linear. Compare hidden-node heatmaps, output boundary, and loss curves.`,
      ),
      loc('激活函数是表达能力的开关，不是装饰。', 'Activation is the switch for expressive power, not decoration.'),
      loc('只改 activation，观察每个节点热力图如何换形状。', 'Change only activation and watch every node heatmap change shape.'),
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

### 直觉
输出层并不是直接在原始平面上硬画一条复杂曲线。它读取隐藏层提供的新坐标。只要隐藏空间里的两类样本变得更容易分开，最后一层就可以用相对简单的组合完成分类。

### 公式
$$\\mathbf{h}=\\phi(W_1\\mathbf{x}+\\mathbf{b}_1),\\quad \\hat{y}=g(W_2\\mathbf{h}+b_2)$$

隐藏层负责表示重组，输出层负责读出预测。

### 实验
观察每个隐藏节点的小热力图，再看输出节点如何叠加它们。切换 circle、XOR、spiral，比较哪些节点负责哪些局部区域。`,
        `### Core Question
Why can an MLP draw boundaries that logistic regression cannot?

### Concept
The output layer does not directly force a complex curve onto raw input space. It reads new coordinates supplied by the hidden layer. Once hidden space makes the classes easier to separate, the final layer can use a simpler combination.

### Formula
$$\\mathbf{h}=\\phi(W_1\\mathbf{x}+\\mathbf{b}_1),\\quad \\hat{y}=g(W_2\\mathbf{h}+b_2)$$

The hidden layer rewrites representation; the output layer reads prediction.

### Experiment
Inspect each hidden-node heatmap, then watch how the output node combines them. Switch circle, XOR, and spiral to compare which nodes cover which regions.`,
      ),
      loc('把“原空间难分”和“隐藏空间好读”这两件事对上。', 'Connect hard input separation with readable hidden representations.'),
      loc('比较隐藏节点小热力图和最终 output 热力图之间的组合关系。', 'Compare hidden-node heatmaps with the final output heatmap.'),
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

### 直觉
前向传播就是把输入特征依次送过每一层：输入节点给出原始或手工特征，隐藏节点给出响应，输出节点把响应组合成最终分数。分类任务通常读符号或概率式分数，回归任务直接读连续数值。

### 最小例子
若某点的两个隐藏响应是 $h=[0.8,-0.4]$，输出权重是 $v=[1.2,-0.7]$，偏置 $c=0.1$：

$$o=v^Th+c=1.2\\cdot0.8-0.7\\cdot(-0.4)+0.1=1.34$$

分类时这个正分数偏向正类，回归时它会被读成连续预测。

### 实验
在分类和回归之间切换。比较输出热力图：分类看正负区域，回归看连续高度场。`,
        `### Core Question
What values does one prediction pass through?

### Concept
Forward propagation sends features through the layers: input nodes provide raw or engineered features, hidden nodes respond, and the output node combines responses into a final score. Classification reads sign or probability-like score; regression reads a continuous value.

### Minimal Example
If a point has hidden response $h=[0.8,-0.4]$, output weights $v=[1.2,-0.7]$, and bias $c=0.1$:

$$o=v^Th+c=1.2\\cdot0.8-0.7\\cdot(-0.4)+0.1=1.34$$

For classification, the positive score favors the positive class. For regression, it is read as a continuous prediction.

### Experiment
Switch between classification and regression. Compare the output heatmap: classification shows positive and negative regions, while regression shows a continuous surface.`,
      ),
      loc('前向传播是一条数据流，不是一组孤立公式。', 'Forward propagation is a data flow, not a set of isolated formulas.'),
      loc('切换分类/回归任务，观察输出节点语义如何变化。', 'Switch classification and regression and watch what the output node means.'),
      'loss',
      ['hidden-space-rewrite'],
      [sources.d2lMlp, sources.openStax, sources.tensorflowPlayground],
    ),
    chapter(
      'backprop',
      loc('反向传播：从局部导数到完整参数更新', 'Backpropagation: from local derivatives to a complete update'),
      loc(
        String.raw`### 核心问题
损失只出现在网络末端，前面每一层的权重为什么仍能得到准确的修改方向？

### 直觉
一次预测是一串复合函数。前向传播从左到右计算并缓存中间量；反向传播从标量损失 $L$ 出发，沿计算图反向复用这些缓存。每经过一个运算节点，就把上游敏感度乘以该节点的局部导数。这个过程不是倒着生成输入，而是在高效计算所有参数对同一个损失的偏导数。

把 $\bar v=\partial L/\partial v$ 称为变量 $v$ 的伴随量。若 $v=f(u)$，则 $\bar u=\bar v\,\partial v/\partial u$。若 $u$ 同时流向多个下游运算，$\bar u$ 必须把每条路径的贡献相加。这就是计算图中“连乘”和“分支求和”同时存在的原因。

### 公式
#### 1. 前向传播先保存什么

本章使用与课程 MLP 训练器一致的 tanh 输出和单样本平方损失：

$$
z^{(1)}=w^{(1)}x+b^{(1)},\quad
h=\tanh z^{(1)},\quad
z^{(2)}=w^{(2)}h+b^{(2)}
$$

$$
\hat y=\tanh z^{(2)},\qquad
L=\frac12(\hat y-y)^2
$$

前向阶段缓存 $x,z^{(1)},h,z^{(2)},\hat y,y$。损失前面的 $1/2$ 会与平方求导产生的 $2$ 抵消。

#### 2. 标量网络逐步反传

先对预测求导，再通过输出 tanh：

$$
\frac{\partial L}{\partial\hat y}=\hat y-y,\qquad
\delta^{(2)}=\frac{\partial L}{\partial z^{(2)}}=(\hat y-y)(1-\hat y^2)
$$

输出层参数的梯度为

$$
\frac{\partial L}{\partial w^{(2)}}=\delta^{(2)}h,\qquad
\frac{\partial L}{\partial b^{(2)}}=\delta^{(2)}
$$

隐藏值先收到 $\bar h=w^{(2)}\delta^{(2)}$，再乘隐藏 tanh 的局部导数：

$$
\delta^{(1)}=\frac{\partial L}{\partial z^{(1)}}=w^{(2)}\delta^{(2)}(1-h^2)
$$

因此

$$
\frac{\partial L}{\partial w^{(1)}}=\delta^{(1)}x,\qquad
\frac{\partial L}{\partial b^{(1)}}=\delta^{(1)}
$$

#### 3. 推广到 $2\to2\to1$ 矩阵网络

令 $\mathbf{x}\in\mathbb{R}^{2\times1}$、$W^{(1)}\in\mathbb{R}^{2\times2}$、$\mathbf{b}^{(1)}\in\mathbb{R}^{2\times1}$、$W^{(2)}\in\mathbb{R}^{1\times2}$。前向为

$$
\mathbf{z}^{(1)}=W^{(1)}\mathbf{x}+\mathbf{b}^{(1)},\quad
\mathbf{h}=\tanh\mathbf{z}^{(1)},\quad
z^{(2)}=W^{(2)}\mathbf{h}+b^{(2)}
$$

反向时

$$
\nabla_{W^{(2)}}L=\delta^{(2)}\mathbf{h}^{\mathsf T},\qquad
\boldsymbol{\delta}^{(1)}=\left((W^{(2)})^{\mathsf T}\delta^{(2)}\right)\odot(1-\mathbf{h}\odot\mathbf{h})
$$

$$
\nabla_{W^{(1)}}L=\boldsymbol{\delta}^{(1)}\mathbf{x}^{\mathsf T},\qquad
\nabla_{\mathbf{b}^{(1)}}L=\boldsymbol{\delta}^{(1)}
$$

矩阵转置不是记号装饰：它保证外积结果分别得到 $1\times2$ 和 $2\times2$ 的梯度矩阵。

#### 4. Reverse-mode 自动微分在做什么

自动微分把前向运算记录成 tape。损失节点从 $\bar L=1$ 开始，系统按逆拓扑顺序访问节点。每个节点只需执行一次 vector–Jacobian product：

$$
\bar{\mathbf{u}}\mathrel{+}=J_f(\mathbf{u})^{\mathsf T}\bar{\mathbf{v}},\qquad \mathbf{v}=f(\mathbf{u})
$$

符号 $\mathrel{+}=$ 很重要：它表示同一个变量可能从多个下游分支收到梯度。框架的 backward() 主要是在自动建立这个 tape、按逆序执行局部 VJP，并把结果累积到参数的 gradient 字段；它没有改变链式法则本身。

#### 5. 梯度如何变成更新

$$
\theta_{\mathrm{new}}=\theta-\eta\frac{\partial L}{\partial\theta},\qquad
\Delta\theta=-\eta\frac{\partial L}{\partial\theta}
$$

梯度、更新量和更新后的参数是三个不同数值。学习率太大时，即使梯度完全正确，一步更新后的损失仍可能上升。

### 最小例子
默认单路径使用 $x=1.2$、$y=0.4$、$w^{(1)}=0.7$、$b^{(1)}=-0.2$、$w^{(2)}=1.1$、$b^{(2)}=0.05$、$\eta=0.1$。下面的 NumPy 代码逐行复现前向、反向和参数更新：

~~~python
import numpy as np

x, y = 1.2, 0.4
w1, b1, w2, b2 = 0.7, -0.2, 1.1, 0.05
eta = 0.1

z1 = w1 * x + b1
h = np.tanh(z1)
z2 = w2 * h + b2
y_hat = np.tanh(z2)
loss = 0.5 * (y_hat - y) ** 2

delta2 = (y_hat - y) * (1 - y_hat**2)
dw2, db2 = delta2 * h, delta2
delta1 = w2 * delta2 * (1 - h**2)
dw1, db1 = delta1 * x, delta1

w1_new = w1 - eta * dw1
print(f"z1={z1:.6f}, h={h:.6f}, y_hat={y_hat:.6f}, loss={loss:.6f}")
print(f"dw1={dw1:.6f}, w1_new={w1_new:.6f}")
~~~

~~~text
z1=0.640000, h=0.564900, y_hat=0.585893, loss=0.017278
dw1=0.109724, w1_new=0.689028
~~~

可用中心差分独立检查解析梯度：

$$
\frac{\partial L}{\partial\theta}\approx\frac{L(\theta+\varepsilon)-L(\theta-\varepsilon)}{2\varepsilon}
$$

实验台使用 $\varepsilon=10^{-5}$；默认场景中解析梯度与数值梯度的相对误差低于 $10^{-9}$。

### 实验
先在“正常传播”中依次单步执行前向、反向和更新，点击 $W^{(1)}_{11}$ 对照局部导数、参数梯度与 $-\eta g$。再切换“tanh 饱和”，观察隐藏层前面的梯度如何变小。最后展开 $2\to2\to1$ 并选择“分支累加”，确认 $\bar x_1$ 等于两条反向贡献之和。`,
        String.raw`### Core Question
The loss appears only at the end of the network. Why can every earlier weight still receive an exact direction of change?

### Concept
A prediction is a composition of functions. The forward pass evaluates them from left to right and caches intermediate values. Backpropagation starts from the scalar loss and reuses those caches in the opposite direction. At each operation, it multiplies the upstream sensitivity by the local derivative. It is not reconstructing the input; it is efficiently computing the partial derivative of one loss with respect to every parameter.

Call $\bar v=\partial L/\partial v$ the adjoint of $v$. If $v=f(u)$, then $\bar u=\bar v\,\partial v/\partial u$. If $u$ feeds multiple downstream operations, $\bar u$ must sum the contribution from every path. Computation graphs therefore require both multiplication along paths and addition across branches.

### Formula
#### 1. What the forward pass caches

This chapter uses the same tanh output and per-sample squared loss as the course MLP trainer:

$$
z^{(1)}=w^{(1)}x+b^{(1)},\quad
h=\tanh z^{(1)},\quad
z^{(2)}=w^{(2)}h+b^{(2)}
$$

$$
\hat y=\tanh z^{(2)},\qquad
L=\frac12(\hat y-y)^2
$$

The forward pass caches $x,z^{(1)},h,z^{(2)},\hat y,y$. The factor $1/2$ cancels the $2$ produced when the square is differentiated.

#### 2. Backpropagate through a scalar network

Differentiate the loss with respect to the prediction, then pass through output tanh:

$$
\frac{\partial L}{\partial\hat y}=\hat y-y,\qquad
\delta^{(2)}=\frac{\partial L}{\partial z^{(2)}}=(\hat y-y)(1-\hat y^2)
$$

The output-layer gradients are

$$
\frac{\partial L}{\partial w^{(2)}}=\delta^{(2)}h,\qquad
\frac{\partial L}{\partial b^{(2)}}=\delta^{(2)}
$$

The hidden value first receives $\bar h=w^{(2)}\delta^{(2)}$, then passes through the local tanh derivative:

$$
\delta^{(1)}=\frac{\partial L}{\partial z^{(1)}}=w^{(2)}\delta^{(2)}(1-h^2)
$$

Therefore

$$
\frac{\partial L}{\partial w^{(1)}}=\delta^{(1)}x,\qquad
\frac{\partial L}{\partial b^{(1)}}=\delta^{(1)}
$$

#### 3. Extend to a $2\to2\to1$ matrix network

Let $\mathbf{x}\in\mathbb{R}^{2\times1}$, $W^{(1)}\in\mathbb{R}^{2\times2}$, $\mathbf{b}^{(1)}\in\mathbb{R}^{2\times1}$, and $W^{(2)}\in\mathbb{R}^{1\times2}$. The forward pass is

$$
\mathbf{z}^{(1)}=W^{(1)}\mathbf{x}+\mathbf{b}^{(1)},\quad
\mathbf{h}=\tanh\mathbf{z}^{(1)},\quad
z^{(2)}=W^{(2)}\mathbf{h}+b^{(2)}
$$

The reverse pass gives

$$
\nabla_{W^{(2)}}L=\delta^{(2)}\mathbf{h}^{\mathsf T},\qquad
\boldsymbol{\delta}^{(1)}=\left((W^{(2)})^{\mathsf T}\delta^{(2)}\right)\odot(1-\mathbf{h}\odot\mathbf{h})
$$

$$
\nabla_{W^{(1)}}L=\boldsymbol{\delta}^{(1)}\mathbf{x}^{\mathsf T},\qquad
\nabla_{\mathbf{b}^{(1)}}L=\boldsymbol{\delta}^{(1)}
$$

The transposes are not decorative notation: the outer products must produce gradient matrices with shapes $1\times2$ and $2\times2$.

#### 4. What reverse-mode automatic differentiation does

Automatic differentiation records forward operations on a tape. Starting from $\bar L=1$, the system visits operations in reverse topological order. Each operation only needs a vector–Jacobian product:

$$
\bar{\mathbf{u}}\mathrel{+}=J_f(\mathbf{u})^{\mathsf T}\bar{\mathbf{v}},\qquad \mathbf{v}=f(\mathbf{u})
$$

The $\mathrel{+}=$ matters because one variable may receive gradients from several downstream branches. A framework backward() call mainly builds or traverses this tape, executes the local VJPs in reverse order, and accumulates the results in parameter gradient fields. It does not replace the chain rule with different mathematics.

#### 5. Turn gradients into updates

$$
\theta_{\mathrm{new}}=\theta-\eta\frac{\partial L}{\partial\theta},\qquad
\Delta\theta=-\eta\frac{\partial L}{\partial\theta}
$$

The gradient, update amount, and updated parameter are three different values. With an excessive learning rate, the loss can rise after one step even when every gradient is correct.

### Minimal Example
The default single path uses $x=1.2$, $y=0.4$, $w^{(1)}=0.7$, $b^{(1)}=-0.2$, $w^{(2)}=1.1$, $b^{(2)}=0.05$, and $\eta=0.1$. This NumPy code reproduces the forward pass, backward pass, and update line by line:

~~~python
import numpy as np

x, y = 1.2, 0.4
w1, b1, w2, b2 = 0.7, -0.2, 1.1, 0.05
eta = 0.1

z1 = w1 * x + b1
h = np.tanh(z1)
z2 = w2 * h + b2
y_hat = np.tanh(z2)
loss = 0.5 * (y_hat - y) ** 2

delta2 = (y_hat - y) * (1 - y_hat**2)
dw2, db2 = delta2 * h, delta2
delta1 = w2 * delta2 * (1 - h**2)
dw1, db1 = delta1 * x, delta1

w1_new = w1 - eta * dw1
print(f"z1={z1:.6f}, h={h:.6f}, y_hat={y_hat:.6f}, loss={loss:.6f}")
print(f"dw1={dw1:.6f}, w1_new={w1_new:.6f}")
~~~

~~~text
z1=0.640000, h=0.564900, y_hat=0.585893, loss=0.017278
dw1=0.109724, w1_new=0.689028
~~~

Independently check an analytic gradient with a central difference:

$$
\frac{\partial L}{\partial\theta}\approx\frac{L(\theta+\varepsilon)-L(\theta-\varepsilon)}{2\varepsilon}
$$

The lab uses $\varepsilon=10^{-5}$; in the default scenario, analytic and numerical gradients have relative error below $10^{-9}$.

### Experiment
In Normal flow, step through forward, backward, and update, then select $W^{(1)}_{11}$ and compare its local derivative, parameter gradient, and $-\eta g$. Switch to Saturated tanh and watch gradients before the hidden activation shrink. Finally expand to $2\to2\to1$, choose Branch accumulation, and verify that $\bar x_1$ equals the sum of two backward contributions.`,
      ),
      loc('反向传播把全局损失拆成可复用的局部 VJP；路径上连乘、分支处求和，梯度再经学习率变成参数更新。', 'Backpropagation decomposes one global loss into reusable local VJPs: multiply along paths, sum at branches, then use the learning rate to turn gradients into updates.'),
      loc('先预测一个参数会怎样改变，再逐步执行前向、反向和更新，并用中心差分核对梯度。', 'Predict how one parameter will change, then step through forward, backward, and update and verify the gradient with a central difference.'),
      'loss',
      ['mlp-backprop-video'],
      [sources.d2lBackprop, sources.pytorchAutograd, sources.openStax],
    ),
    chapter(
      'trainingDynamics',
      loc('训练动态要同时看数据、损失曲线和网络内部状态', 'Training dynamics require data, loss curves, and internal network state together'),
      loc(
        `### 核心问题
怎么判断网络是在学习、震荡还是卡住？

### 直觉
只看最终准确率会漏掉很多问题。学习率过高时，loss 曲线可能抖动；batch 太小时，路径会有噪声；特征开关不合适时，网络会花容量去补基础信号的缺口。高质量调参要同时看训练/测试 loss、节点热力图和权重变化。

### 公式
$$w\\leftarrow w-\\eta\\frac{\\partial L}{\\partial w}$$

$\\eta$ 控制每次更新多大，batch size 控制梯度估计使用多少样本。

### 实验
把 learning rate 从 0.03 提到 0.3，再调整 batch size。观察 loss 曲线是否平滑、震荡或突然变差。`,
        `### Core Question
How do we tell whether the network is learning, oscillating, or stuck?

### Concept
Final accuracy alone misses many problems. A high learning rate can make loss oscillate; small batches add noise; poor feature choices force the network to spend capacity compensating for missing signals. Good tuning reads train/test loss, node heatmaps, and weight changes together.

### Formula
$$w\\leftarrow w-\\eta\\frac{\\partial L}{\\partial w}$$

$\\eta$ controls update size, while batch size controls how many examples estimate the gradient.

### Experiment
Raise learning rate from 0.03 to 0.3, then change batch size. Watch whether loss is smooth, oscillatory, or unstable.`,
      ),
      loc('训练诊断要把曲线、热力图和权重状态放在一起读。', 'Training diagnosis reads curves, heatmaps, and weight state together.'),
      loc('调整 learning rate 和 batch size，比较训练/测试 loss 的形状。', 'Tune learning rate and batch size and compare train/test loss curves.'),
      'loss',
      ['backprop-responsibility'],
      [sources.d2lBackprop, sources.tensorflowPlaygroundGithub],
    ),
    chapter(
      'capacityGeneralization',
      loc('容量、正则化和泛化决定边界是否只是在记住噪声', 'Capacity, regularization, and generalization decide whether the boundary is memorizing noise'),
      loc(
        `### 核心问题
为什么更大的网络不一定更好？

### 直觉
更多层和更多神经元会提高可表达的函数复杂度。它能修正欠拟合，也可能追着噪声画出过度弯曲的边界。正则化通过惩罚权重大小，让网络少依赖过大的局部响应。

### 公式
$$L_{total}=L_{data}+\\lambda R(W)$$

L2 常用 $R(W)=\\frac12\\sum w^2$，L1 常用 $R(W)=\\sum |w|$。

### 实验
增加隐藏层和神经元，再提高 noise。比较没有正则、L1、L2 时，权重线、测试 loss 和边界曲率如何变化。`,
        `### Core Question
Why is a larger network not always better?

### Concept
More layers and neurons increase the complexity of functions the network can express. That can fix underfitting, but it can also chase noise with overly curved boundaries. Regularization penalizes weight size so the network relies less on extreme local responses.

### Formula
$$L_{total}=L_{data}+\\lambda R(W)$$

L2 often uses $R(W)=\\frac12\\sum w^2$; L1 often uses $R(W)=\\sum |w|$.

### Experiment
Add hidden layers and neurons, then increase noise. Compare no regularization, L1, and L2 through link weights, test loss, and boundary curvature.`,
      ),
      loc('容量解决欠拟合，正则化和测试集告诉你有没有开始记噪声。', 'Capacity fixes underfitting, while regularization and test data reveal noise memorization.'),
      loc('提高网络容量和噪声，再切换 L1/L2 正则化，观察测试 loss。', 'Increase capacity and noise, then switch L1/L2 regularization and inspect test loss.'),
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
      description: loc('一层 4 个神经元再接一层 2 个神经元，适合观察节点热力图。', 'A 4-neuron layer followed by a 2-neuron layer for reading node heatmaps.'),
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
