import type {
  EnhancementTier,
  LabConfig,
  LocalizedCopy,
  MathConcept,
  MathLabDifficulty,
  MathLabModule,
  MathLabSection,
  Misconception,
  QuizItem,
} from '../types/mathLab'

const md = String.raw

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function section(
  id: string,
  title: LocalizedCopy,
  content: LocalizedCopy,
  placements: Pick<MathLabSection, 'visualIds' | 'labIds'> = {},
): MathLabSection {
  return { id, level: 2, title, content, ...placements }
}

function concept(
  id: string,
  name: LocalizedCopy,
  formulaLatex: string,
  plainExplanation: LocalizedCopy,
  geometricIntuition: LocalizedCopy,
  numericalExample: LocalizedCopy,
  modelConnection: LocalizedCopy,
  variables: MathConcept['variables'],
  codeExample?: string,
): MathConcept {
  return {
    id,
    name,
    formulaLatex,
    variables,
    plainExplanation,
    geometricIntuition,
    numericalExample,
    modelConnection,
    codeExample,
  }
}

function variable(symbol: string, zh: string, en: string) {
  return { symbol, description: copy(zh, en) }
}

function lab(id: string, title: LocalizedCopy, componentName: string, successCriteria: LocalizedCopy[]): LabConfig {
  return {
    id,
    title,
    type: 'interactive-visual',
    componentName,
    successCriteria,
  }
}

function quiz(
  id: string,
  prompt: LocalizedCopy,
  correctId: string,
  correct: LocalizedCopy,
  distractor: LocalizedCopy,
  explanation: LocalizedCopy,
  tag: string,
): QuizItem {
  return {
    id,
    type: 'single-choice',
    prompt,
    choices: [
      { id: correctId, label: correct },
      { id: 'distractor', label: distractor },
    ],
    answer: correctId,
    explanation,
    misconceptionTags: [tag],
  }
}

function misconception(
  id: string,
  statement: LocalizedCopy,
  correction: LocalizedCopy,
  example: LocalizedCopy,
): Misconception {
  return { id, statement, correction, example }
}

function toc(sections: MathLabSection[]) {
  return sections.map((item) => ({
    id: item.id,
    level: item.level,
    title: item.title,
  }))
}

function moduleDefinition(input: {
  id: string
  title: LocalizedCopy
  subtitle: LocalizedCopy
  difficulty: MathLabDifficulty
  enhancementTier?: EnhancementTier
  accent: string
  theme: string
  estimatedMinutes: number
  aiModelConnections: LocalizedCopy[]
  learningObjectives: LocalizedCopy[]
  concepts: MathConcept[]
  sections: MathLabSection[]
  labs: LabConfig[]
  quizzes: QuizItem[]
  misconceptions: Misconception[]
}): MathLabModule {
  return {
    id: input.id,
    order: 0,
    enhancementTier: input.enhancementTier ?? 'interactive',
    title: input.title,
    subtitle: input.subtitle,
    difficulty: input.difficulty,
    estimatedMinutes: input.estimatedMinutes,
    prerequisites: [],
    aiModelConnections: input.aiModelConnections,
    learningObjectives: input.learningObjectives,
    concepts: input.concepts,
    sections: input.sections,
    toc: toc(input.sections),
    visuals: [],
    labs: input.labs,
    quizzes: input.quizzes,
    misconceptions: input.misconceptions,
    nextModuleIds: [],
    accent: input.accent,
    theme: input.theme,
    sourceNoteFile: 'math-lab-ai-foundation-gaps.md',
    originalSort: 0,
  }
}

const tensorSections = [
  section(
    'tensor-shapes-vectorization-why-shape-matters',
    copy('为什么 shape 是第一层数学直觉', 'Why Shape Is the First Mathematical Intuition'),
    copy(
      md`在 AI 代码里，很多错误不是公式不懂，而是没有把公式读成 shape。线性层

$$
Y = XW + b
$$

同时包含三件事：\(X\in\mathbb{R}^{B\times D}\) 表示一个 batch 的输入，\(W\in\mathbb{R}^{D\times H}\) 把每个样本从 \(D\) 维变到 \(H\) 维，\(b\) 被广播到每一行。输出是 \(Y\in\mathbb{R}^{B\times H}\)。

直觉上，batch 维不是一个新特征，它只是把很多样本并排处理。矩阵乘法真正混合的是最后的特征维度。学生如果把 batch 维和特征维混在一起，就会在 reshape、flatten、attention head 和 mini-batch 训练中反复出错。

手算例子：如果 \(B=8,D=6,H=4\)，则 \(X\) 是 \(8\times 6\)，\(W\) 是 \(6\times 4\)，输出是 \(8\times 4\)。参数量是 \(6\cdot4+4=28\)。如果 \(b\) 的长度是 5，它既不能当标量，也不能匹配 \(H=4\)，所以不能广播。`,
      md`In AI code, many mistakes come from reading a formula without reading its shape. A linear layer

$$
Y = XW + b
$$

contains three ideas at once: \(X\in\mathbb{R}^{B\times D}\) is a batch of inputs, \(W\in\mathbb{R}^{D\times H}\) moves each sample from \(D\) dimensions to \(H\) dimensions, and \(b\) is broadcast across rows. The output is \(Y\in\mathbb{R}^{B\times H}\).

The batch dimension is not a new feature; it is many examples processed side by side. Matrix multiplication mixes the feature dimension. If students confuse batch and feature axes, they will struggle with reshape, flatten, attention heads, and mini-batch training.

Hand calculation: if \(B=8,D=6,H=4\), then \(X\) is \(8\times 6\), \(W\) is \(6\times 4\), and the output is \(8\times 4\). The parameter count is \(6\cdot4+4=28\). If \(b\) has length 5, it is neither a scalar nor length \(H=4\), so it cannot broadcast safely.`,
    ),
  ),
  section(
    'tensor-shapes-vectorization-broadcasting',
    copy('Broadcasting 与向量化', 'Broadcasting and Vectorization'),
    copy(
      md`broadcasting 的作用不是“自动帮我猜形状”，而是在明确规则下复制较小的数组。常见规则是：从最后一维开始比较，两个维度相等或其中一个是 1 时，可以广播。

向量化则是把逐样本循环写成一次数组运算。它通常更快，也更接近线性代数表达。例如逐样本计算

$$
\mathbf{y}_i=\mathbf{x}_i W+\mathbf{b}
$$

可以合并成 \(Y=XW+b\)。这不是改变数学含义，而是把同一个线性变换同时作用到 batch 中的所有样本。

下面的实验把 \(X[B,D] @ W[D,H] + b \rightarrow Y[B,H]\) 展开成形状、参数量和内存读数。重点观察：改 \(B\) 只改变一次前向的样本数和激活内存；改 \(D,H\) 会改变权重矩阵和参数量。`,
      md`Broadcasting does not mean "the library guesses my shape." It repeats a smaller array under explicit rules. A common rule is: compare dimensions from the end; two dimensions are compatible if they are equal or one of them is 1.

Vectorization rewrites a per-example loop as one array operation. It is usually faster and closer to the linear algebra expression. For example,

$$
\mathbf{y}_i=\mathbf{x}_i W+\mathbf{b}
$$

can be batched as \(Y=XW+b\). The math is not changed; the same linear transform is applied to all examples in the batch.

The lab below expands \(X[B,D] @ W[D,H] + b \rightarrow Y[B,H]\) into shape, parameter, and memory readouts. Watch how changing \(B\) changes examples and activation memory, while changing \(D,H\) changes the weight matrix and parameter count.`,
    ),
    { labIds: ['tensor-shape-lab'] },
  ),
  section(
    'tensor-shapes-vectorization-ai-connection',
    copy('连接到模型实现', 'Connection to Model Implementation'),
    copy(
      md`shape 直觉会贯穿后续所有模型。CNN 中的 shape 包含空间维度和通道维度；RNN 和 Transformer 中还会加入序列长度；multi-head attention 会把隐藏维拆成 head 维和每个 head 的子维度。

一个稳健的调试习惯是：每写一行核心张量运算，就在旁边写出输入 shape、输出 shape 和被求和的维度。对 \(XW\) 来说，被消掉的是 \(D\)；对 attention 的 \(QK^\top\) 来说，被消掉的是每个 token 的特征维。这个习惯比记忆某个框架的错误信息更可靠。`,
      md`Shape intuition carries into every later model. CNNs add spatial and channel axes; RNNs and Transformers add sequence length; multi-head attention splits hidden width into head count and per-head width.

A reliable debugging habit is to write the input shape, output shape, and reduced dimension beside each core tensor operation. In \(XW\), \(D\) is reduced. In attention's \(QK^\top\), the per-token feature dimension is reduced. This habit is more reliable than memorizing a framework's error messages.`,
    ),
  ),
]

const autodiffSections = [
  section(
    'matrix-calculus-autodiff-local-linearization',
    copy('导数是局部线性化', 'A Derivative Is Local Linearization'),
    copy(
      md`矩阵微积分最重要的直觉不是更复杂的符号，而是：在当前点附近，复杂函数可以被一个线性函数近似。对标量函数有

$$
f(x+\Delta x)\approx f(x)+f'(x)\Delta x.
$$

对向量输入，导数变成 Jacobian：

$$
f(\mathbf{x}+\Delta\mathbf{x})\approx f(\mathbf{x})+J_f(\mathbf{x})\Delta\mathbf{x}.
$$

深度学习的反向传播并不显式构造所有 Jacobian。它更常做的是 vector-Jacobian product，把“上游梯度”乘过当前局部函数。这样可以避免巨大矩阵，同时保持链式法则的数学含义。`,
      md`The key intuition in matrix calculus is not heavier notation; it is local linearization. Near the current point, a complicated function can be approximated by a linear one:

$$
f(x+\Delta x)\approx f(x)+f'(x)\Delta x.
$$

For vector inputs, the derivative becomes a Jacobian:

$$
f(\mathbf{x}+\Delta\mathbf{x})\approx f(\mathbf{x})+J_f(\mathbf{x})\Delta\mathbf{x}.
$$

Backpropagation usually does not build every Jacobian explicitly. It more often computes vector-Jacobian products, pushing an upstream gradient through a local function. This avoids huge matrices while preserving the chain rule.`,
    ),
  ),
  section(
    'matrix-calculus-autodiff-computation-graph',
    copy('计算图与反向传播', 'Computation Graph and Backpropagation'),
    copy(
      md`把

$$
L=(wx+b-y)^2
$$

写成计算图，可以看到反向传播的全部结构。前向阶段保存 \(wx\)、\(\hat y=wx+b\)、\(r=\hat y-y\)、\(L=r^2\)。反向阶段先得到

$$
\frac{\partial L}{\partial \hat y}=2(\hat y-y),
$$

再继续传给 \(w,b,x\)：

$$
\frac{\partial L}{\partial w}=2(\hat y-y)x,\qquad
\frac{\partial L}{\partial b}=2(\hat y-y),\qquad
\frac{\partial L}{\partial x}=2(\hat y-y)w.
$$

下面的实验同时显示解析梯度和有限差分检查。有限差分不是训练方法，而是确认反向传播实现是否可信的诊断工具。`,
      md`Writing

$$
L=(wx+b-y)^2
$$

as a computation graph reveals the structure of backpropagation. The forward pass stores \(wx\), \(\hat y=wx+b\), \(r=\hat y-y\), and \(L=r^2\). The backward pass starts with

$$
\frac{\partial L}{\partial \hat y}=2(\hat y-y),
$$

then sends it to \(w,b,x\):

$$
\frac{\partial L}{\partial w}=2(\hat y-y)x,\qquad
\frac{\partial L}{\partial b}=2(\hat y-y),\qquad
\frac{\partial L}{\partial x}=2(\hat y-y)w.
$$

The lab shows analytic gradients and a finite-difference check. Finite differences are not the training method; they are a diagnostic for whether backpropagation is trustworthy.`,
    ),
    { labIds: ['autodiff-graph-lab'] },
  ),
  section(
    'matrix-calculus-autodiff-ai-connection',
    copy('从梯度到可训练模型', 'From Gradients to Trainable Models'),
    copy(
      md`自动微分让模型作者只需要写前向计算，系统负责把局部导数按图反向组合。代价是：如果前向中有不稳定操作，例如 \(\log(0)\)、过大的 exponent、错误的 detach 或 shape 错配，反向也会被污染。

因此学生需要同时建立两种直觉：数学上，梯度来自链式法则；工程上，梯度依赖前向图中每个节点的数值稳定性和连接关系。`,
      md`Automatic differentiation lets model authors write the forward computation while the system composes local derivatives backward through the graph. The cost is that unstable forward operations, such as \(\log(0)\), huge exponentials, accidental detach, or shape mismatch, contaminate the backward pass too.

Students need two intuitions at the same time: mathematically, gradients come from the chain rule; engineering-wise, gradients depend on the numerical stability and connectivity of every node in the forward graph.`,
    ),
  ),
]

const probabilitySections = [
  section(
    'probability-likelihood-entropy-distributions',
    copy('模型输出是一种分布语言', 'Model Outputs Are Distribution Language'),
    copy(
      md`分类模型通常不是直接输出“答案”，而是输出类别上的概率分布。logits \(\mathbf{z}\) 通过 softmax 变成概率：

$$
p_i=\frac{\exp(z_i/T)}{\sum_j \exp(z_j/T)}.
$$

温度 \(T\) 控制分布尖锐程度。\(T\) 小时，最大 logit 会占据更高概率；\(T\) 大时，概率更平缓。softmax 改变的是概率尺度，不改变 logits 的排序。

如果正确类别是 \(y\)，交叉熵为

$$
L=-\log p_y.
$$

这就是“正确类别概率越低，惩罚越大”的数学形式。`,
      md`A classifier usually does not output the answer directly; it outputs a probability distribution over classes. Logits \(\mathbf{z}\) become probabilities through softmax:

$$
p_i=\frac{\exp(z_i/T)}{\sum_j \exp(z_j/T)}.
$$

Temperature \(T\) controls sharpness. A small \(T\) gives the largest logit more probability; a large \(T\) flattens the distribution. Softmax changes probability scale, not logit ranking.

If the correct class is \(y\), cross entropy is

$$
L=-\log p_y.
$$

This is the mathematical form of "low probability on the correct class receives a large penalty."`,
    ),
    { labIds: ['probability-entropy-lab'] },
  ),
  section(
    'probability-likelihood-entropy-mle-kl',
    copy('似然、熵与 KL', 'Likelihood, Entropy, and KL'),
    copy(
      md`最大似然估计把“让数据出现得更可能”写成优化问题。为了避免很多概率连乘导致下溢，通常最大化 log likelihood，或者等价地最小化 negative log likelihood。

熵衡量一个分布自身的不确定性：

$$
H(p)=-\sum_i p_i\log p_i.
$$

KL divergence 比较两个分布：

$$
D_{\mathrm{KL}}(p\Vert q)=\sum_i p_i\log\frac{p_i}{q_i}.
$$

KL 不是距离，因为它不对称。它回答的是：如果真实分布像 \(p\)，却用 \(q\) 来编码，会多付多少信息代价。`,
      md`Maximum likelihood turns "make the observed data more likely" into an optimization problem. To avoid underflow from multiplying many probabilities, we usually maximize log likelihood, or equivalently minimize negative log likelihood.

Entropy measures a distribution's own uncertainty:

$$
H(p)=-\sum_i p_i\log p_i.
$$

KL divergence compares two distributions:

$$
D_{\mathrm{KL}}(p\Vert q)=\sum_i p_i\log\frac{p_i}{q_i}.
$$

KL is not a distance because it is asymmetric. It asks: if the true distribution behaves like \(p\), how much extra information cost do we pay by encoding with \(q\)?`,
    ),
  ),
  section(
    'probability-likelihood-entropy-ai-connection',
    copy('连接到分类、语言模型和校准', 'Connection to Classification, Language Models, and Calibration'),
    copy(
      md`交叉熵是分类、语言模型 next-token prediction 和很多对比学习目标的共同语言。语言模型在每个位置输出词表上的概率分布，训练时最小化正确 token 的负对数概率。

但概率高不等于模型一定可靠。校准问题关注的是：模型说 80% 的样本中，是否真的约有 80% 正确。温度缩放和验证集校准正是把概率解释和模型诊断连接起来。`,
      md`Cross entropy is shared by classification, language-model next-token prediction, and many contrastive objectives. A language model outputs a probability distribution over the vocabulary at each position, then minimizes the negative log probability of the correct token.

High probability does not automatically mean the model is reliable. Calibration asks: among predictions where the model says 80%, are about 80% actually correct? Temperature scaling and validation-set calibration connect probability interpretation to model diagnostics.`,
    ),
  ),
]

const diagnosticsSections = [
  section(
    'training-diagnostics-read-curves',
    copy('把训练曲线读成数学状态', 'Read Training Curves as Mathematical State'),
    copy(
      md`优化章节告诉我们参数怎样移动，但真实训练还要读曲线。最常见的三条读数是 train loss、validation loss 和 gradient norm。

健康训练通常表现为 train/val loss 同步下降，梯度范数逐步减小。学习率过大时，loss 会震荡或发散；过拟合时，train loss 继续下降但 validation loss 回升；梯度消失时，gradient norm 接近 0 但 loss 仍然高；梯度爆炸时，loss 和 gradient norm 一起急剧上升。

这些现象背后都是数学对象：目标函数形状、步长、链式法则连乘、模型容量和数据分布差异。`,
      md`The optimization chapter explains how parameters move, but real training also requires reading curves. The three most common readouts are train loss, validation loss, and gradient norm.

Healthy training often shows train and validation loss falling together while gradient norm shrinks. With a learning rate that is too high, loss oscillates or diverges. With overfitting, train loss keeps falling while validation loss rises. With vanishing gradients, gradient norm approaches zero while loss remains high. With exploding gradients, loss and gradient norm rise sharply together.

Behind these symptoms are mathematical objects: objective shape, step length, chain-rule products, model capacity, and data distribution shift.`,
    ),
    { labIds: ['training-diagnostics-lab'] },
  ),
  section(
    'training-diagnostics-interventions',
    copy('从现象到干预', 'From Symptom to Intervention'),
    copy(
      md`训练诊断的目标不是给每条曲线贴标签，而是选择干预。学习率过大时，先降低学习率或使用 schedule；梯度爆炸时，考虑 gradient clipping、初始化和 normalization；过拟合时，考虑更多数据、正则化、早停或降低容量；梯度消失时，考虑 ReLU、残差连接、normalization 和更好的初始化。

每个干预都应该能回到数学解释。例如 gradient clipping 是限制梯度范数，防止一步更新过大；早停是在 validation loss 最低附近选择参数；normalization 是控制中间激活的尺度。`,
      md`The goal of training diagnostics is not only labeling curves; it is choosing interventions. If the learning rate is too high, lower it or use a schedule. If gradients explode, consider clipping, initialization, and normalization. If the model overfits, consider more data, regularization, early stopping, or lower capacity. If gradients vanish, consider ReLU, residual connections, normalization, and better initialization.

Each intervention should map back to a mathematical explanation. Gradient clipping limits gradient norm and prevents a huge update. Early stopping chooses parameters near the best validation loss. Normalization controls intermediate activation scale.`,
    ),
  ),
  section(
    'training-diagnostics-ai-connection',
    copy('连接到实验记录', 'Connection to Experiment Tracking'),
    copy(
      md`真实项目中，训练诊断应该和实验记录绑定。每次改变学习率、batch size、初始化、正则化或模型容量，都应该记录曲线和关键超参数。这样学生会把“调参”看成有证据的数学实验，而不是盲目试错。

一个最低限度的记录包括：数据版本、模型版本、优化器、学习率 schedule、batch size、train/val loss、主要指标、gradient norm 或权重范数。`,
      md`In real projects, training diagnostics should be tied to experiment tracking. Every change to learning rate, batch size, initialization, regularization, or capacity should record curves and key hyperparameters. Students then see tuning as an evidence-based mathematical experiment rather than blind trial and error.

A minimal record includes data version, model version, optimizer, learning-rate schedule, batch size, train/validation loss, main metric, and gradient norm or weight norm.`,
    ),
  ),
]

const architectureSections = [
  section(
    'deep-architecture-math-cnn-attention',
    copy('CNN 与 Attention 的共同数学', 'The Shared Math of CNNs and Attention'),
    copy(
      md`CNN 和 Attention 看起来很不同，但都在做“按结构约束的信息汇聚”。CNN 用局部窗口和共享权重：

$$
\text{out}=\left\lfloor\frac{n+2p-k}{s}\right\rfloor+1.
$$

这个公式描述输入尺寸 \(n\)、padding \(p\)、kernel \(k\)、stride \(s\) 怎样决定输出空间大小。

Attention 用相似度加权：

$$
\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d}}\right)V.
$$

直觉上，CNN 固定邻域，Attention 动态选择相关 token。两者都不是魔法结构，而是把权重共享、点积、softmax 和矩阵乘法组合起来。`,
      md`CNNs and Attention look different, but both aggregate information under structural constraints. A CNN uses local windows and shared weights:

$$
\text{out}=\left\lfloor\frac{n+2p-k}{s}\right\rfloor+1.
$$

This formula shows how input size \(n\), padding \(p\), kernel \(k\), and stride \(s\) determine output spatial size.

Attention uses similarity-weighted aggregation:

$$
\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d}}\right)V.
$$

Intuitively, CNNs use fixed neighborhoods, while Attention dynamically selects relevant tokens. Neither is magic; both combine weight sharing, dot products, softmax, and matrix multiplication.`,
    ),
    { labIds: ['architecture-math-lab'] },
  ),
  section(
    'deep-architecture-math-residual-normalization',
    copy('Residual 与 Normalization 控制信息流', 'Residuals and Normalization Control Information Flow'),
    copy(
      md`深层网络的问题不只是表达能力，还包括信号能否稳定流动。残差连接

$$
\mathbf{y}=\mathbf{x}+F(\mathbf{x})
$$

给梯度提供一条更直接的路径。normalization 则把中间激活重新居中和缩放：

$$
\hat{x}=\frac{x-\mu}{\sqrt{\sigma^2+\epsilon}}.
$$

残差关注路径，normalization 关注尺度。它们一起解释了为什么现代深层模型可以堆得很深。`,
      md`Deep networks are not only about expressive power; they also require stable signal flow. A residual connection

$$
\mathbf{y}=\mathbf{x}+F(\mathbf{x})
$$

gives gradients a more direct path. Normalization recenters and rescales intermediate activations:

$$
\hat{x}=\frac{x-\mu}{\sqrt{\sigma^2+\epsilon}}.
$$

Residuals manage paths; normalization manages scale. Together they help explain why modern models can be stacked deeply.`,
    ),
  ),
  section(
    'deep-architecture-math-ai-connection',
    copy('从结构直觉到 Transformer', 'From Architecture Intuition to Transformers'),
    copy(
      md`Transformer 可以被读成数学模块的组合：embedding 是向量表示，attention 是点积相似度和概率权重，MLP 是逐 token 的非线性变换，residual 和 normalization 保持深层信息流稳定。

因此学习深度结构不应该只背组件名称。更可靠的路径是：每遇到一个结构，就问它改变了哪个张量 shape、用了哪种线性代数操作、概率权重在哪里产生、梯度路径如何通过。`,
      md`A Transformer can be read as a combination of mathematical modules: embeddings are vector representations, attention is dot-product similarity plus probability weights, the MLP is a per-token nonlinear transform, and residuals plus normalization stabilize deep information flow.

So learning deep architectures should not be memorizing component names. A stronger path is to ask, for every structure: which tensor shape changes, which linear algebra operation is used, where probability weights are created, and how gradients pass through it.`,
    ),
  ),
]

export const aiBridgeModules: MathLabModule[] = [
  moduleDefinition({
    id: 'tensor-shapes-vectorization',
    title: copy('张量形状与向量化', 'Tensor Shapes and Vectorization'),
    subtitle: copy('把数组维度、batch、broadcasting 和线性层计算连起来。', 'Connect array dimensions, batches, broadcasting, and linear-layer computation.'),
    difficulty: 'foundation',
    accent: '#3868ff',
    theme: '#eef3ff',
    estimatedMinutes: 20,
    aiModelConnections: [
      copy('线性层、embedding、CNN、attention head 和 batch 训练都依赖稳定的 shape 直觉。', 'Linear layers, embeddings, CNNs, attention heads, and batch training all depend on stable shape intuition.'),
    ],
    learningObjectives: [
      copy('能写出 \(X[B,D] @ W[D,H] + b\) 的输出形状。', 'Write the output shape of \(X[B,D] @ W[D,H] + b\).'),
      copy('区分 batch 维、特征维和被矩阵乘法消掉的维度。', 'Distinguish batch axes, feature axes, and the dimension reduced by matrix multiplication.'),
      copy('判断常见 broadcasting 是否安全。', 'Decide whether common broadcasting patterns are safe.'),
    ],
    concepts: [
      concept(
        'batched-linear-layer',
        copy('批量线性层', 'Batched Linear Layer'),
        'Y = XW + b,\\quad X\\in\\mathbb{R}^{B\\times D},\\ W\\in\\mathbb{R}^{D\\times H},\\ Y\\in\\mathbb{R}^{B\\times H}',
        copy('矩阵乘法混合特征维，batch 维只是并行处理多个样本。', 'Matrix multiplication mixes feature dimensions; the batch axis processes examples in parallel.'),
        copy('每一行样本都被同一个 \(W\) 送到新的特征空间。', 'Each row example is sent to a new feature space by the same \(W\).'),
        copy('当 \(B=8,D=6,H=4\) 时，输出是 \(8\times4\)，权重参数是 24 个。', 'With \(B=8,D=6,H=4\), the output is \(8\times4\), and the weight has 24 parameters.'),
        copy('这是 MLP、attention 投影和 embedding 后处理的共同计算形状。', 'This is the shared computation shape behind MLPs, attention projections, and embedding post-processing.'),
        [
          variable('B', 'batch 中样本数量', 'number of examples in the batch'),
          variable('D', '输入特征维度', 'input feature dimension'),
          variable('H', '输出或隐藏维度', 'output or hidden dimension'),
        ],
        'X = torch.randn(8, 6)\nW = torch.randn(6, 4)\nb = torch.randn(4)\nY = X @ W + b\nprint(Y.shape)  # torch.Size([8, 4])',
      ),
    ],
    sections: tensorSections,
    labs: [
      lab('tensor-shape-lab', copy('Shape 调试器', 'Shape Debugger'), 'TensorShapeLab', [
        copy('能说明 batch 维为什么不参与特征混合。', 'Explain why the batch axis does not participate in feature mixing.'),
        copy('能识别一个错误 bias shape。', 'Identify an invalid bias shape.'),
      ]),
    ],
    quizzes: [
      quiz('tensor-shape-output', copy('若 \(X\) 是 \(12\times5\)，\(W\) 是 \(5\times7\)，输出 shape 是什么？', 'If \(X\) is \(12\times5\) and \(W\) is \(5\times7\), what is the output shape?'), 'shape', copy('\(12\times7\)', '\(12\times7\)'), copy('\(5\times5\)', '\(5\times5\)'), copy('中间的 5 被矩阵乘法消掉，保留 batch 12 和输出维 7。', 'The middle 5 is reduced; batch 12 and output width 7 remain.'), 'shape-matmul'),
      quiz('tensor-shape-bias', copy('长度为 1 的 bias 为什么通常可以加到 \(B\times H\) 输出上？', 'Why can a length-1 bias usually be added to a \(B\times H\) output?'), 'broadcast', copy('它可以按广播规则复制到输出位置。', 'It can be repeated by broadcasting rules.'), copy('它会改变 batch size。', 'It changes the batch size.'), copy('长度 1 的维度可以广播；它不改变输出 shape。', 'A length-1 dimension can broadcast; it does not change output shape.'), 'broadcasting'),
    ],
    misconceptions: [
      misconception('batch-is-feature', copy('batch size 越大，单个样本的特征维度越高。', 'A larger batch size gives each example more features.'), copy('batch size 是一次处理多少样本，不是每个样本有多少特征。', 'Batch size is how many examples are processed at once, not how many features each example has.'), copy('把 \(B=32,D=128\) 改成 \(B=64,D=128\)，单个样本仍是 128 维。', 'Changing \(B=32,D=128\) to \(B=64,D=128\) keeps each example 128-dimensional.')),
      misconception('broadcast-guesses', copy('broadcasting 会自动修复任何 shape 错误。', 'Broadcasting automatically fixes any shape error.'), copy('broadcasting 只在维度相等或其中一个为 1 时成立。', 'Broadcasting only works when dimensions match or one is 1.'), copy('长度 5 的 bias 不能加到最后一维为 4 的输出上。', 'A length-5 bias cannot be added to an output whose last dimension is 4.')),
    ],
  }),
  moduleDefinition({
    id: 'matrix-calculus-autodiff',
    title: copy('矩阵微积分与自动微分', 'Matrix Calculus and Automatic Differentiation'),
    subtitle: copy('把局部线性化、计算图和反向传播连成一条链。', 'Connect local linearization, computation graphs, and backpropagation.'),
    difficulty: 'intermediate',
    accent: '#7c3aed',
    theme: '#f3e8ff',
    estimatedMinutes: 24,
    aiModelConnections: [
      copy('神经网络训练依赖自动微分把 loss 的梯度传回每个参数。', 'Neural-network training depends on automatic differentiation sending loss gradients back to every parameter.'),
    ],
    learningObjectives: [
      copy('把导数解释为局部线性化。', 'Interpret derivatives as local linearization.'),
      copy('在小计算图上手算反向梯度。', 'Compute backward gradients on a small computation graph.'),
      copy('用有限差分检查一个梯度。', 'Check a gradient with finite differences.'),
    ],
    concepts: [
      concept(
        'chain-rule-vjp',
        copy('链式法则与 VJP', 'Chain Rule and VJP'),
        '\\bar{x}=\\bar{y}\\frac{\\partial y}{\\partial x}',
        copy('反向传播把上游梯度乘过当前局部导数。', 'Backpropagation multiplies the upstream gradient through the local derivative.'),
        copy('梯度像责任信号，从 loss 沿图反向分配到每条输入边。', 'A gradient acts like a responsibility signal flowing backward from loss to input edges.'),
        copy('若 \(L=(wx+b-y)^2\)，则 \(\partial L/\partial w=2(wx+b-y)x\)。', 'If \(L=(wx+b-y)^2\), then \(\partial L/\partial w=2(wx+b-y)x\).'),
        copy('PyTorch、TensorFlow 和 JAX 都围绕计算图与自动微分构建训练循环。', 'PyTorch, TensorFlow, and JAX all build training loops around computation graphs and autodiff.'),
        [
          variable('\\bar{y}', '上游梯度', 'upstream gradient'),
          variable('\\partial y/\\partial x', '当前节点的局部导数', 'local derivative at the current node'),
        ],
        'w, x, b, y = 1.4, 2.0, -0.5, 1.2\npred = w * x + b\ngrad_w = 2 * (pred - y) * x\nprint(grad_w)',
      ),
    ],
    sections: autodiffSections,
    labs: [
      lab('autodiff-graph-lab', copy('计算图反向追踪', 'Computation Graph Trace'), 'AutodiffGraphLab', [
        copy('能解释 dL/dw 中为什么出现 x。', 'Explain why x appears in dL/dw.'),
        copy('能比较解析梯度和有限差分梯度。', 'Compare analytic and finite-difference gradients.'),
      ]),
    ],
    quizzes: [
      quiz('autodiff-chain-rule', copy('反向传播中“上游梯度”的作用是什么？', 'What does the upstream gradient do in backpropagation?'), 'upstream', copy('携带 loss 对当前节点输出的敏感性。', 'It carries loss sensitivity to the current node output.'), copy('自动把所有参数清零。', 'It automatically zeros every parameter.'), copy('局部导数必须乘以上游梯度，才能得到对更早变量的影响。', 'A local derivative must multiply the upstream gradient to affect earlier variables.'), 'chain-rule'),
      quiz('autodiff-finite-difference', copy('有限差分检查主要用于什么？', 'What is finite-difference checking mainly used for?'), 'check', copy('验证解析或自动微分梯度是否合理。', 'Validate whether analytic or autodiff gradients are reasonable.'), copy('替代所有深度学习训练。', 'Replace all deep-learning training.'), copy('有限差分成本高但直观，适合检查小例子。', 'Finite differences are expensive but intuitive, so they fit small checks.'), 'gradient-check'),
    ],
    misconceptions: [
      misconception('autodiff-magic', copy('自动微分不需要理解链式法则。', 'Autodiff means the chain rule no longer matters.'), copy('自动微分正是链式法则的系统化实现。', 'Autodiff is a systematic implementation of the chain rule.'), copy('detach 或原地修改会改变计算图，从而改变梯度。', 'Detach or in-place mutation changes the graph and therefore the gradient.')),
      misconception('jacobian-always-built', copy('反向传播总是显式构造完整 Jacobian。', 'Backpropagation always explicitly builds the full Jacobian.'), copy('实际系统通常计算 VJP/JVP，避免巨大矩阵。', 'Practical systems usually compute VJPs/JVPs to avoid huge matrices.'), copy('一个百万参数层的完整 Jacobian 通常不可承受。', 'A full Jacobian for a million-parameter layer is usually infeasible.')),
    ],
  }),
  moduleDefinition({
    id: 'probability-likelihood-entropy',
    title: copy('概率、似然与熵', 'Probability, Likelihood, and Entropy'),
    subtitle: copy('把模型输出读成分布，并理解交叉熵为什么训练分类器。', 'Read model outputs as distributions and understand why cross entropy trains classifiers.'),
    difficulty: 'foundation',
    accent: '#247a73',
    theme: '#e9f8f5',
    estimatedMinutes: 24,
    aiModelConnections: [
      copy('分类器、语言模型和校准方法都依赖概率分布、负对数似然和交叉熵。', 'Classifiers, language models, and calibration methods rely on distributions, negative log likelihood, and cross entropy.'),
    ],
    learningObjectives: [
      copy('解释 softmax 如何把 logits 变成概率。', 'Explain how softmax turns logits into probabilities.'),
      copy('把交叉熵读成正确类别的负对数概率。', 'Read cross entropy as negative log probability of the correct class.'),
      copy('区分熵、交叉熵和 KL divergence。', 'Distinguish entropy, cross entropy, and KL divergence.'),
    ],
    concepts: [
      concept(
        'softmax-cross-entropy',
        copy('Softmax 交叉熵', 'Softmax Cross Entropy'),
        'p_i=\\frac{e^{z_i/T}}{\\sum_j e^{z_j/T}},\\qquad L=-\\log p_y',
        copy('softmax 先给每个类别分配概率，交叉熵再惩罚正确类别概率过低。', 'Softmax assigns class probabilities; cross entropy penalizes low probability on the correct class.'),
        copy('logits 像未归一化分数，softmax 把分数压到概率单纯形上。', 'Logits are unnormalized scores; softmax moves them onto the probability simplex.'),
        copy('如果正确类概率是 0.8，loss 是 \(-\log 0.8\approx0.223\)。', 'If the target probability is 0.8, the loss is \(-\log 0.8\approx0.223\).'),
        copy('语言模型每个 token 位置都在最小化正确 token 的负对数概率。', 'A language model minimizes the negative log probability of the correct token at every position.'),
        [
          variable('z_i', '第 i 类 logit', 'logit for class i'),
          variable('T', 'softmax 温度', 'softmax temperature'),
          variable('p_y', '正确类别概率', 'target-class probability'),
        ],
        'import torch\nlogits = torch.tensor([1.5, 0.3, -0.8])\ntarget = torch.tensor([0])\nloss = torch.nn.functional.cross_entropy(logits[None, :], target)\nprint(loss.item())',
      ),
    ],
    sections: probabilitySections,
    labs: [
      lab('probability-entropy-lab', copy('Softmax 与交叉熵', 'Softmax and Cross Entropy'), 'ProbabilityEntropyLab', [
        copy('能说明温度如何改变分布尖锐程度。', 'Explain how temperature changes distribution sharpness.'),
        copy('能把正确类概率和交叉熵大小联系起来。', 'Connect target probability to cross-entropy size.'),
      ]),
    ],
    quizzes: [
      quiz('probability-ce', copy('交叉熵 \(-\log p_y\) 在什么时候变大？', 'When does cross entropy \(-\log p_y\) get large?'), 'low', copy('正确类别概率 \(p_y\) 很低时。', 'When target probability \(p_y\) is low.'), copy('所有 logits 都相等时一定为 0。', 'When all logits are equal it is always 0.'), copy('负对数会强烈惩罚接近 0 的正确类概率。', 'Negative log strongly penalizes target probabilities near 0.'), 'cross-entropy'),
      quiz('probability-kl', copy('KL divergence 为什么不是普通距离？', 'Why is KL divergence not an ordinary distance?'), 'asymmetric', copy('它通常不对称。', 'It is usually asymmetric.'), copy('它不能比较分布。', 'It cannot compare distributions.'), copy('\(D_{KL}(p\\Vert q)\) 和 \(D_{KL}(q\\Vert p)\) 通常不同。', '\(D_{KL}(p\\Vert q)\) and \(D_{KL}(q\\Vert p)\) usually differ.'), 'kl'),
    ],
    misconceptions: [
      misconception('softmax-certainty', copy('softmax 最大概率高就说明模型一定可靠。', 'A high softmax probability means the model is definitely reliable.'), copy('softmax 是模型内部分数的归一化，不自动保证校准。', 'Softmax normalizes internal scores; it does not automatically guarantee calibration.'), copy('模型可能对分布外样本也给出很高概率。', 'A model can assign high probability to out-of-distribution inputs.')),
      misconception('entropy-accuracy', copy('熵越低，分类准确率一定越高。', 'Lower entropy always means higher accuracy.'), copy('低熵只说明分布更尖锐，不说明尖锐地指向正确类别。', 'Low entropy means a sharper distribution, not necessarily a correct one.'), copy('模型可以非常自信地预测错误类别。', 'A model can confidently predict the wrong class.')),
    ],
  }),
  moduleDefinition({
    id: 'training-diagnostics',
    title: copy('训练诊断数学', 'Mathematics of Training Diagnostics'),
    subtitle: copy('把 loss 曲线、梯度范数和泛化差距读成可行动的训练信号。', 'Read loss curves, gradient norms, and generalization gaps as actionable training signals.'),
    difficulty: 'intermediate',
    accent: '#d65a31',
    theme: '#fff1e8',
    estimatedMinutes: 22,
    aiModelConnections: [
      copy('模型训练不是只看最终分数，还要读曲线、梯度和验证集行为。', 'Model training is not only final score; it requires reading curves, gradients, and validation behavior.'),
    ],
    learningObjectives: [
      copy('识别健康收敛、学习率过大、过拟合、梯度消失和梯度爆炸。', 'Recognize healthy convergence, high learning rate, overfitting, vanishing gradients, and exploding gradients.'),
      copy('把诊断现象连接到数学原因。', 'Connect diagnostic symptoms to mathematical causes.'),
      copy('为每类现象选择合理干预。', 'Choose reasonable interventions for each symptom.'),
    ],
    concepts: [
      concept(
        'gradient-update-diagnostics',
        copy('更新步与梯度范数', 'Update Step and Gradient Norm'),
        '\\theta_{t+1}=\\theta_t-\\eta\\nabla_\\theta L(\\theta_t),\\qquad \\|\\nabla_\\theta L\\|_2',
        copy('loss 曲线显示目标值变化，梯度范数显示每一步可用的下降信号强弱。', 'Loss curves show objective change; gradient norm shows the strength of the available descent signal.'),
        copy('学习率决定沿梯度方向走多远，梯度范数决定这个方向本身有多强。', 'Learning rate decides how far to move; gradient norm shows how strong the direction is.'),
        copy('若 \(\eta=0.1\)、梯度范数为 20，更新尺度约为 2，可能过大。', 'If \(\eta=0.1\) and gradient norm is 20, the update scale is about 2 and may be too large.'),
        copy('训练 dashboard 中的 loss、gradient norm 和 validation gap 都是优化状态的观测。', 'Loss, gradient norm, and validation gap in a training dashboard are observations of optimization state.'),
        [
          variable('\\eta', '学习率', 'learning rate'),
          variable('\\nabla_\\theta L', '参数梯度', 'parameter gradient'),
        ],
      ),
    ],
    sections: diagnosticsSections,
    labs: [
      lab('training-diagnostics-lab', copy('训练曲线诊断', 'Training Curve Diagnostics'), 'TrainingDiagnosticsLab', [
        copy('能根据曲线选择至少一个干预方向。', 'Choose at least one intervention from the curve shape.'),
        copy('能解释 train/val loss 分叉代表什么。', 'Explain what a train/validation loss split means.'),
      ]),
    ],
    quizzes: [
      quiz('diagnostics-overfit', copy('train loss 下降而 validation loss 上升，最像什么？', 'Train loss falls while validation loss rises. What does this most resemble?'), 'overfit', copy('过拟合。', 'Overfitting.'), copy('梯度消失。', 'Vanishing gradients.'), copy('训练集表现变好但验证集变差，是过拟合信号。', 'Training improves while validation worsens, which signals overfitting.'), 'overfitting'),
      quiz('diagnostics-exploding', copy('loss 和 gradient norm 同时急剧上升，优先怀疑什么？', 'Loss and gradient norm rise sharply together. What should be suspected first?'), 'exploding', copy('梯度爆炸或学习率过大。', 'Exploding gradients or too large a learning rate.'), copy('验证集太小导致没有梯度。', 'The validation set is too small to have gradients.'), copy('过大的更新会把参数推向更差区域。', 'Oversized updates can push parameters into worse regions.'), 'exploding-gradient'),
    ],
    misconceptions: [
      misconception('train-loss-only', copy('只要 train loss 降低，模型就一定更好。', 'If train loss decreases, the model is always better.'), copy('需要同时看 validation loss 和任务指标。', 'Validation loss and task metrics must also be checked.'), copy('过拟合时 train loss 降低但泛化变差。', 'During overfitting, train loss falls while generalization worsens.')),
      misconception('small-gradient-good', copy('梯度很小一定说明已经收敛到好解。', 'A tiny gradient always means convergence to a good solution.'), copy('也可能是梯度消失、饱和区或鞍点。', 'It may also be vanishing gradients, saturation, or a saddle point.'), copy('深层 sigmoid 网络可能 loss 仍高但前层梯度接近 0。', 'A deep sigmoid network may have high loss while early gradients are near 0.')),
    ],
  }),
  moduleDefinition({
    id: 'deep-architecture-math',
    title: copy('深度结构中的数学', 'Mathematics Inside Deep Architectures'),
    subtitle: copy('用线性代数、概率权重和尺度控制读懂 CNN、Attention 与 Transformer。', 'Use linear algebra, probability weights, and scale control to read CNNs, Attention, and Transformers.'),
    difficulty: 'advanced',
    accent: '#0f9f7a',
    theme: '#e9f8f5',
    estimatedMinutes: 26,
    aiModelConnections: [
      copy('CNN、Attention、Transformer、残差和 normalization 都是前置数学对象的组合。', 'CNNs, Attention, Transformers, residuals, and normalization combine the earlier mathematical objects.'),
    ],
    learningObjectives: [
      copy('用输出尺寸公式解释卷积层。', 'Explain convolution layers with the output-size formula.'),
      copy('把 attention 读成点积相似度和概率加权。', 'Read attention as dot-product similarity and probability weighting.'),
      copy('说明 residual 和 normalization 如何稳定深层信息流。', 'Explain how residuals and normalization stabilize deep information flow.'),
    ],
    concepts: [
      concept(
        'scaled-dot-product-attention',
        copy('缩放点积注意力', 'Scaled Dot-Product Attention'),
        '\\operatorname{softmax}\\left(\\frac{QK^\\top}{\\sqrt{d}}\\right)V',
        copy('query 和 key 做点积得到相关性，再用 softmax 变成对 value 的加权平均。', 'Queries and keys form dot-product relevance scores, then softmax turns them into a weighted average of values.'),
        copy('每个 token 都在根据相似度从其他 token 汇聚信息。', 'Each token gathers information from other tokens according to similarity.'),
        copy('如果某个 key 和 query 点积最大，它通常获得最高 attention 权重。', 'If one key has the largest dot product with the query, it usually receives the highest attention weight.'),
        copy('Transformer 的核心计算就是大量并行的线性投影、点积、softmax 和矩阵乘法。', 'The core Transformer computation is many parallel linear projections, dot products, softmaxes, and matrix multiplications.'),
        [
          variable('Q,K,V', 'query、key、value 矩阵', 'query, key, and value matrices'),
          variable('d', '每个 head 的特征维度', 'feature dimension per head'),
        ],
      ),
    ],
    sections: architectureSections,
    labs: [
      lab('architecture-math-lab', copy('结构里的数学', 'Math Inside Architectures'), 'ArchitectureMathLab', [
        copy('能计算一个简单卷积输出尺寸。', 'Compute a simple convolution output size.'),
        copy('能把 attention 权重解释成 softmax 后的相似度。', 'Explain attention weights as softmaxed similarities.'),
      ]),
    ],
    quizzes: [
      quiz('architecture-attention', copy('Attention 中 \(QK^\\top\) 的主要作用是什么？', 'What is the main role of \(QK^\\top\) in Attention?'), 'scores', copy('计算 token 之间的相似度分数。', 'Compute similarity scores between tokens.'), copy('直接删除所有低频特征。', 'Directly delete all low-frequency features.'), copy('点积越大，softmax 后通常权重越高。', 'A larger dot product usually gives a larger softmax weight.'), 'attention'),
      quiz('architecture-residual', copy('残差连接最直接帮助什么？', 'What does a residual connection most directly help?'), 'flow', copy('让信息和梯度有更直接的路径。', 'Give information and gradients a more direct path.'), copy('保证模型不需要训练数据。', 'Guarantee the model needs no training data.'), copy('残差连接把 \(x\) 加回输出，改善深层路径。', 'A residual connection adds \(x\) back into the output and improves deep paths.'), 'residual'),
    ],
    misconceptions: [
      misconception('attention-is-explanation', copy('Attention 权重总是可靠解释模型原因。', 'Attention weights are always a reliable explanation of model reasoning.'), copy('它们是计算中的加权系数，不自动等于因果解释。', 'They are computational weights, not automatically causal explanations.'), copy('不同层和 head 的权重可能表达不同角色。', 'Different layers and heads may play different roles.')),
      misconception('cnn-only-images', copy('卷积只能用于图片。', 'Convolution only works for images.'), copy('卷积是一种局部共享权重模式，也可用于序列和信号。', 'Convolution is a local weight-sharing pattern and can also apply to sequences and signals.'), copy('一维卷积常用于时间序列和文本特征。', '1D convolution is often used for time series and text features.')),
    ],
  }),
]
