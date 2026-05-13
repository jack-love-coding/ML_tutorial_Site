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
  SourceReference,
  VisualAsset,
} from '../types/mathLab'

const md = String.raw

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function variable(symbol: string, zh: string, en: string) {
  return { symbol, description: copy(zh, en) }
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

function imageAsset(
  id: string,
  filename: string,
  title: LocalizedCopy,
  transcript: LocalizedCopy,
): VisualAsset {
  return {
    id,
    type: 'image',
    title,
    assetPath: `/math-lab/ai-bridge/generated/${filename}`,
    transcript,
    caption: transcript,
    alt: transcript,
    learningPurpose: copy('作为本章的无文字概念视觉锚点。', 'Serve as a text-free conceptual visual anchor for the chapter.'),
  }
}

function manimAsset(
  id: string,
  filename: string,
  title: LocalizedCopy,
  transcript: LocalizedCopy,
): VisualAsset {
  return {
    id,
    type: 'manim-video',
    title,
    assetPath: `/manim/math-ai/${filename}.mp4`,
    posterPath: `/manim/math-ai/${filename}.svg`,
    transcript,
    learningPurpose: copy('用动画把本章关键结构从静态公式变成过程。', 'Use motion to turn the chapter structure into a process.'),
  }
}

const sources = {
  d2lPreliminaries: {
    label: copy('D2L：预备知识', 'D2L: Preliminaries'),
    href: 'https://d2l.ai/chapter_preliminaries/index.html',
    license: 'CC BY-SA 4.0',
    usage: copy('参考 ndarray、线性代数、自动微分、概率和优化的覆盖顺序。', 'Reference for ndarray, linear algebra, autodiff, probability, and optimization coverage.'),
  },
  mitMatrixCalculus: {
    label: copy('MIT 18.S096：机器学习矩阵微积分', 'MIT 18.S096: Matrix Calculus for Machine Learning'),
    href: 'https://ocw.mit.edu/courses/18-s096-matrix-calculus-for-machine-learning-and-beyond-january-iap-2023/',
    usage: copy('参考局部线性化、Jacobian 和矩阵导数语言。', 'Reference for local linearization, Jacobians, and matrix-derivative language.'),
  },
  mml: {
    label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'),
    href: 'https://mml-book.github.io/',
    usage: copy('校准线性代数、向量微积分、概率、优化和 PCA 的概念边界。', 'Calibrate the boundaries of linear algebra, vector calculus, probability, optimization, and PCA.'),
  },
  googleMlcc: {
    label: copy('Google Machine Learning Crash Course', 'Google Machine Learning Crash Course'),
    href: 'https://developers.google.com/machine-learning/crash-course',
    license: 'CC BY 4.0',
    usage: copy('参考初学者视角下的 loss、分类概率、泛化和训练诊断。', 'Reference for beginner-facing loss, classification probability, generalization, and training diagnostics.'),
  },
  cs231n: {
    label: copy('Stanford CS231n Notes', 'Stanford CS231n Notes'),
    href: 'https://cs231n.github.io/',
    usage: copy('参考反向传播、CNN、优化和训练技巧的组织方式。', 'Reference for backpropagation, CNNs, optimization, and training-practice organization.'),
  },
  cs224n: {
    label: copy('Stanford CS224N', 'Stanford CS224N'),
    href: 'https://web.stanford.edu/class/cs224n/',
    usage: copy('参考 self-attention、Transformer 和 NLP 模型中的数学结构。', 'Reference for self-attention, Transformers, and mathematical structure in NLP models.'),
  },
  cs229: {
    label: copy('Stanford CS229 Notes', 'Stanford CS229 Notes'),
    href: 'https://cs229.stanford.edu/main_notes.pdf',
    usage: copy('参考最大似然、概率模型、逻辑回归、反向传播和 PCA 的推导边界。', 'Reference for maximum likelihood, probabilistic models, logistic regression, backpropagation, and PCA boundaries.'),
  },
} satisfies Record<string, SourceReference>

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
  visuals: VisualAsset[]
  labs: LabConfig[]
  quizzes: QuizItem[]
  misconceptions: Misconception[]
  sourceReferences: SourceReference[]
}): MathLabModule {
  return {
    id: input.id,
    order: 0,
    enhancementTier: input.enhancementTier ?? 'video',
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
    visuals: input.visuals,
    labs: input.labs,
    quizzes: input.quizzes,
    misconceptions: input.misconceptions,
    nextModuleIds: [],
    accent: input.accent,
    theme: input.theme,
    sourceNoteFile: 'math-lab-ai-foundation-sources.md',
    originalSort: 0,
    sourceReferences: input.sourceReferences,
    importedAssetPaths: input.visuals
      .flatMap((visual) => [visual.assetPath, visual.posterPath])
      .filter((path): path is string => Boolean(path)),
  }
}

const tensorSections = [
  section(
    'tensor-shapes-vectorization-reading-shapes',
    copy('先读 shape，再读公式', 'Read Shape Before Reading the Formula'),
    copy(
      md`AI 代码里的线性层常写成

$$
Y = XW+b.
$$

它不是一个孤立公式，而是一个 shape 合同：\(X\in\mathbb{R}^{B\times D}\)、\(W\in\mathbb{R}^{D\times H}\)、\(b\in\mathbb{R}^{H}\) 或标量，输出 \(Y\in\mathbb{R}^{B\times H}\)。中间的 \(D\) 被矩阵乘法消掉，\(B\) 被保留下来，因为 batch 维只是“同时处理多少个样本”。

手算例子：若 \(B=8,D=6,H=4\)，矩阵乘法产生 \(8\times4\) 个输出，每个输出需要 6 次乘加。权重参数是 \(6\cdot4=24\)，bias 若长度为 4，则总参数为 28。`,
      md`A linear layer in AI code is often written as

$$
Y = XW+b.
$$

This is not just a formula; it is a shape contract: \(X\in\mathbb{R}^{B\times D}\), \(W\in\mathbb{R}^{D\times H}\), \(b\in\mathbb{R}^{H}\) or scalar, and \(Y\in\mathbb{R}^{B\times H}\). Matrix multiplication removes the shared \(D\) dimension, while \(B\) remains because the batch axis only says how many examples are processed at once.

Worked example: if \(B=8,D=6,H=4\), matmul produces \(8\times4\) outputs and each output uses 6 multiply-adds. The weight matrix has \(6\cdot4=24\) parameters; a length-4 bias gives 28 parameters in total.`,
    ),
    { visualIds: ['tensor-shape-pipeline-image'] },
  ),
  section(
    'tensor-shapes-vectorization-matmul-reduction',
    copy('矩阵乘法消掉的是中间维', 'Matmul Reduces the Shared Dimension'),
    copy(
      md`读 ` + '`A[m,n] @ B[n,p] -> C[m,p]`' + md` 时，不要把每个维度都当成同一种东西。中间维 \(n\) 表示每个输出元素的求和长度，它在结果里消失；左边剩下 \(m\)，右边剩下 \(p\)。

这条规则解释了为什么 \(X[B,D] @ W[D,H]\) 输出 \(Y[B,H]\)。batch 维 \(B\) 没有参与求和，它只是让同一个线性变换重复作用到许多样本上。特征维 \(D\) 才是每个样本内部被混合的方向。`,
      md`When reading ` + '`A[m,n] @ B[n,p] -> C[m,p]`' + md`, do not treat every dimension as the same kind of object. The shared \(n\) dimension is the summation length for each output entry, so it disappears. The left side keeps \(m\), and the right side keeps \(p\).

This explains why \(X[B,D] @ W[D,H]\) produces \(Y[B,H]\). The batch axis \(B\) is not reduced; it repeats the same linear transform across many examples. The feature axis \(D\) is the direction being mixed inside each example.`,
    ),
    { visualIds: ['tensor-broadcasting-video'] },
  ),
  section(
    'tensor-shapes-vectorization-broadcasting-rules',
    copy('Broadcasting 是规则，不是猜测', 'Broadcasting Is a Rule, Not a Guess'),
    copy(
      md`broadcasting 常从最后一维向前比较。两个维度相等，或其中一个为 1，才可以广播。例如 \(Y[B,H]+b[H]\) 合法，因为 \(b\) 可以复制到每一行；\(Y[B,H]+b[1]\) 也合法，因为标量式维度能扩展；但 \(Y[B,4]+b[6]\) 不合法。

向量化和 broadcasting 常一起出现。逐样本循环

$$
\mathbf{y}_i=\mathbf{x}_iW+\mathbf{b}
$$

可以写成一次 \(Y=XW+b\)。这改变的是执行方式，不改变数学含义。`,
      md`Broadcasting usually compares dimensions from the end. Dimensions are compatible only when they match or one of them is 1. For example, \(Y[B,H]+b[H]\) is valid because \(b\) can be copied across rows; \(Y[B,H]+b[1]\) is also valid because a scalar-like dimension can expand; \(Y[B,4]+b[6]\) is invalid.

Vectorization and broadcasting often appear together. The per-example loop

$$
\mathbf{y}_i=\mathbf{x}_iW+\mathbf{b}
$$

can be written as one operation \(Y=XW+b\). The execution changes; the mathematical meaning does not.`,
    ),
    { labIds: ['tensor-shape-lab'] },
  ),
  section(
    'tensor-shapes-vectorization-memory-performance',
    copy('性能读数：参数、乘加和激活内存', 'Performance Readouts: Parameters, Ops, and Activation Memory'),
    copy(
      md`shape 也是成本语言。改变 \(B\) 会改变一次前向传播处理的样本数和激活内存；改变 \(D,H\) 会改变权重参数和每一步计算量。对 \(X[B,D] @ W[D,H]\)，乘加规模是 \(B\cdot D\cdot H\)，输出激活若用 float32，大约占 \(4BH\) 字节。

这就是为什么大 batch 不会让单个样本更有特征，但会让一次迭代的显存压力更高。反过来，增大 hidden size 会增加模型容量，也会增加参数和计算。`,
      md`Shape is also a cost language. Changing \(B\) changes how many examples are processed in one forward pass and how much activation memory is needed; changing \(D,H\) changes weights and compute. For \(X[B,D] @ W[D,H]\), multiply-add cost is \(B\cdot D\cdot H\), and a float32 output activation takes about \(4BH\) bytes.

This is why a larger batch does not give each example more features, but it does increase per-step memory pressure. Increasing hidden width increases model capacity, parameters, and compute.`,
    ),
  ),
  section(
    'tensor-shapes-vectorization-debugging',
    copy('调试 reshape、flatten 和 attention head', 'Debugging Reshape, Flatten, and Attention Heads'),
    copy(
      md`一个稳健习惯是：每写一行核心张量运算，就写出输入 shape、输出 shape、被求和或被拆分的维度。flatten 不是“随便摊平”，而是决定哪些轴被合并；multi-head attention 也不是改变 token 数，而是把 hidden width 拆成 head 数和每个 head 的子维度。

如果 \(X\) 从 \`[B,T,H]\` 重排成 \`[B,T,N,d]\`，必须满足 \(H=N\cdot d\)。错把 \(T\) 当成 \(H\) 去拆 head，会让模型把序列位置当成特征通道。`,
      md`A reliable habit is to write input shape, output shape, and the reduced or split dimension beside each core tensor operation. Flattening is not arbitrary; it decides which axes are merged. Multi-head attention does not change token count; it splits hidden width into head count and per-head width.

If \(X\) moves from \`[B,T,H]\` to \`[B,T,N,d]\`, then \(H=N\cdot d\) must hold. Splitting heads along \(T\) instead of \(H\) makes the model confuse sequence positions with feature channels.`,
    ),
  ),
]

const autodiffSections = [
  section(
    'matrix-calculus-autodiff-local-linearization',
    copy('导数是局部线性化', 'A Derivative Is Local Linearization'),
    copy(
      md`矩阵微积分最重要的直觉是局部线性化。对标量函数，

$$
f(x+\Delta x)\approx f(x)+f'(x)\Delta x.
$$

对向量输入，导数变成 Jacobian：

$$
f(\mathbf{x}+\Delta\mathbf{x})\approx f(\mathbf{x})+J_f(\mathbf{x})\Delta\mathbf{x}.
$$

这不是多写几个符号，而是在说：复杂函数在当前点附近可以被一个线性映射近似。神经网络的每层都在前向中保存这些局部关系，反向时再把它们组合起来。`,
      md`The central intuition in matrix calculus is local linearization. For a scalar function,

$$
f(x+\Delta x)\approx f(x)+f'(x)\Delta x.
$$

For vector inputs, the derivative becomes a Jacobian:

$$
f(\mathbf{x}+\Delta\mathbf{x})\approx f(\mathbf{x})+J_f(\mathbf{x})\Delta\mathbf{x}.
$$

This is not heavier notation for its own sake. It says a complicated function can be approximated near the current point by a linear map. Neural-network layers save these local relationships during the forward pass and compose them backward.`,
    ),
    { visualIds: ['autodiff-local-linearization-image'] },
  ),
  section(
    'matrix-calculus-autodiff-vjp-jvp',
    copy('Jacobian、VJP 与 JVP', 'Jacobian, VJP, and JVP'),
    copy(
      md`完整 Jacobian 常常太大，所以实际自动微分系统更常计算乘积。反向模式常用 vector-Jacobian product：

$$
\bar{\mathbf{x}}=\bar{\mathbf{y}}J_f(\mathbf{x}),
$$

它把上游梯度 \(\bar{\mathbf{y}}\) 传回输入。前向模式常用 Jacobian-vector product：

$$
\dot{\mathbf{y}}=J_f(\mathbf{x})\dot{\mathbf{x}}.
$$

深度学习训练的标量 loss 对大量参数求梯度，通常更适合反向模式；检查局部敏感性或少量输入方向时，JVP 也很有用。`,
      md`A full Jacobian is often too large, so practical autodiff systems usually compute products. Reverse mode uses a vector-Jacobian product:

$$
\bar{\mathbf{x}}=\bar{\mathbf{y}}J_f(\mathbf{x}),
$$

which sends the upstream gradient \(\bar{\mathbf{y}}\) back to inputs. Forward mode uses a Jacobian-vector product:

$$
\dot{\mathbf{y}}=J_f(\mathbf{x})\dot{\mathbf{x}}.
$$

Training a scalar loss with many parameters usually favors reverse mode; checking local sensitivity along a few input directions can favor JVPs.`,
    ),
    { visualIds: ['autodiff-vjp-flow-video'] },
  ),
  section(
    'matrix-calculus-autodiff-computation-graph',
    copy('计算图与反向传播', 'Computation Graph and Backpropagation'),
    copy(
      md`对

$$
L=(wx+b-y)^2
$$

前向阶段保存 \(wx\)、\(\hat y=wx+b\)、\(r=\hat y-y\)、\(L=r^2\)。反向阶段从 \(\partial L/\partial \hat y=2(\hat y-y)\) 开始，再传给 \(w,b,x\)：

$$
\frac{\partial L}{\partial w}=2(\hat y-y)x,\quad
\frac{\partial L}{\partial b}=2(\hat y-y),\quad
\frac{\partial L}{\partial x}=2(\hat y-y)w.
$$

实验会把每条边的前向值、局部导数和反向梯度放在同一张图上。`,
      md`For

$$
L=(wx+b-y)^2,
$$

the forward pass stores \(wx\), \(\hat y=wx+b\), \(r=\hat y-y\), and \(L=r^2\). The backward pass starts from \(\partial L/\partial \hat y=2(\hat y-y)\), then sends gradients to \(w,b,x\):

$$
\frac{\partial L}{\partial w}=2(\hat y-y)x,\quad
\frac{\partial L}{\partial b}=2(\hat y-y),\quad
\frac{\partial L}{\partial x}=2(\hat y-y)w.
$$

The lab places each edge's forward value, local derivative, and backward gradient in one graph.`,
    ),
    { labIds: ['autodiff-graph-lab'] },
  ),
  section(
    'matrix-calculus-autodiff-gradient-checking',
    copy('有限差分用于检查，不用于训练', 'Finite Differences Check Gradients; They Do Not Train Models'),
    copy(
      md`有限差分用很小的扰动估计导数：

$$
\frac{\partial L}{\partial w}\approx \frac{L(w+\epsilon)-L(w-\epsilon)}{2\epsilon}.
$$

它直观但成本高，而且在 \(\epsilon\) 太大时有截断误差，太小时有舍入误差。因此它适合小例子和单元测试，不适合替代深度学习里的反向传播。`,
      md`Finite differences estimate a derivative with a small perturbation:

$$
\frac{\partial L}{\partial w}\approx \frac{L(w+\epsilon)-L(w-\epsilon)}{2\epsilon}.
$$

They are intuitive but expensive. If \(\epsilon\) is too large, truncation error dominates; if it is too small, roundoff error dominates. They are useful for small examples and tests, not as a replacement for backpropagation in deep learning.`,
    ),
  ),
  section(
    'matrix-calculus-autodiff-stability',
    copy('前向数值稳定性会污染反向', 'Forward Stability Contaminates the Backward Pass'),
    copy(
      md`自动微分不会替你修复前向图。若前向中出现 \(\log(0)\)、过大的 exponent、意外 detach、原地修改或错误 shape，反向传播会沿同一张图把问题传回参数。

因此要同时检查两件事：数学上，梯度是否来自正确的链式法则；工程上，前向图是否连接完整且数值稳定。这个习惯比把自动微分当成黑箱更可靠。`,
      md`Autodiff does not repair the forward graph for you. If the forward pass contains \(\log(0)\), huge exponentials, accidental detach, in-place mutation, or shape errors, backpropagation sends that problem back through the same graph.

Check two things at once: mathematically, whether the gradient follows the intended chain rule; engineering-wise, whether the forward graph is connected and numerically stable. This habit is more reliable than treating autodiff as a black box.`,
    ),
  ),
]

const probabilitySections = [
  section(
    'probability-likelihood-entropy-distribution-language',
    copy('模型输出是一种分布语言', 'Model Outputs Are Distribution Language'),
    copy(
      md`分类模型通常不直接输出答案，而是输出类别上的分布。logits \(\mathbf{z}\) 通过 softmax 变成概率：

$$
p_i=\frac{\exp(z_i/T)}{\sum_j \exp(z_j/T)}.
$$

温度 \(T\) 控制分布尖锐程度。小温度会放大最大 logit 的优势，大温度会让分布更平。softmax 改变概率尺度，不改变 logits 排序。`,
      md`A classifier usually does not output an answer directly; it outputs a distribution over classes. Logits \(\mathbf{z}\) become probabilities through softmax:

$$
p_i=\frac{\exp(z_i/T)}{\sum_j \exp(z_j/T)}.
$$

Temperature \(T\) controls sharpness. A small temperature amplifies the largest logit; a large temperature flattens the distribution. Softmax changes probability scale, not logit ranking.`,
    ),
    { visualIds: ['probability-simplex-image'] },
  ),
  section(
    'probability-likelihood-entropy-nll-mle',
    copy('从似然到负对数似然', 'From Likelihood to Negative Log Likelihood'),
    copy(
      md`最大似然把“让观测数据更可能出现”写成优化问题。若独立样本的概率为 \(p(y_i\mid x_i,\theta)\)，则似然是连乘：

$$
\mathcal{L}(\theta)=\prod_i p(y_i\mid x_i,\theta).
$$

实际训练通常最小化 negative log likelihood：

$$
-\sum_i \log p(y_i\mid x_i,\theta),
$$

因为 log 把连乘变加和，也减少数值下溢。`,
      md`Maximum likelihood turns "make the observed data more likely" into an optimization problem. If independent samples have probabilities \(p(y_i\mid x_i,\theta)\), the likelihood is a product:

$$
\mathcal{L}(\theta)=\prod_i p(y_i\mid x_i,\theta).
$$

Training usually minimizes negative log likelihood:

$$
-\sum_i \log p(y_i\mid x_i,\theta),
$$

because logs turn products into sums and reduce numerical underflow.`,
    ),
    { visualIds: ['softmax-cross-entropy-video'] },
  ),
  section(
    'probability-likelihood-entropy-ce-kl',
    copy('熵、交叉熵和 KL 不同', 'Entropy, Cross Entropy, and KL Are Different'),
    copy(
      md`熵衡量一个分布自己的不确定性：

$$
H(p)=-\sum_i p_i\log p_i.
$$

交叉熵用一个分布的真值权重去评估另一个分布：

$$
H(p,q)=-\sum_i p_i\log q_i.
$$

KL divergence 比较两个分布：

$$
D_{\mathrm{KL}}(p\Vert q)=\sum_i p_i\log\frac{p_i}{q_i}.
$$

KL 通常不对称，所以不是普通距离。`,
      md`Entropy measures a distribution's own uncertainty:

$$
H(p)=-\sum_i p_i\log p_i.
$$

Cross entropy uses one distribution's target weights to evaluate another:

$$
H(p,q)=-\sum_i p_i\log q_i.
$$

KL divergence compares two distributions:

$$
D_{\mathrm{KL}}(p\Vert q)=\sum_i p_i\log\frac{p_i}{q_i}.
$$

KL is usually asymmetric, so it is not an ordinary distance.`,
    ),
    { labIds: ['probability-entropy-lab'] },
  ),
  section(
    'probability-likelihood-entropy-calibration',
    copy('校准：高概率不等于可靠', 'Calibration: High Probability Is Not Reliability'),
    copy(
      md`如果模型说“80% 置信”的样本中只有 60% 真的正确，它就是过度自信。校准关注预测概率和实际频率是否一致。temperature scaling 会在验证集上调整 softmax 温度，使概率更接近可解释频率。

这和准确率不同。准确率只问最大类别是否对，校准还问概率数值本身能不能被信任。`,
      md`If examples predicted with 80% confidence are correct only 60% of the time, the model is overconfident. Calibration asks whether predicted probabilities match observed frequencies. Temperature scaling adjusts softmax temperature on a validation set so probabilities behave more like interpretable frequencies.

This differs from accuracy. Accuracy asks whether the top class is right; calibration asks whether the probability values themselves can be trusted.`,
    ),
  ),
  section(
    'probability-likelihood-entropy-ai-connection',
    copy('连接到分类器和语言模型', 'Connection to Classifiers and Language Models'),
    copy(
      md`交叉熵是分类器和语言模型 next-token prediction 的共同语言。语言模型在每个位置输出词表分布，训练时最小化正确 token 的负对数概率。

手算例子：若正确类概率是 0.8，则 loss 为 \(-\log 0.8\approx0.223\)；若正确类概率降到 0.05，则 loss 为 \(-\log 0.05\approx2.996\)。这就是模型把概率质量放错位置时惩罚会迅速变大的原因。`,
      md`Cross entropy is shared by classifiers and language-model next-token prediction. A language model outputs a vocabulary distribution at each position, then minimizes the negative log probability of the correct token.

Worked example: if the target probability is 0.8, the loss is \(-\log 0.8\approx0.223\); if the target probability drops to 0.05, the loss is \(-\log 0.05\approx2.996\). This is why the penalty grows quickly when probability mass is placed on the wrong outcomes.`,
    ),
  ),
]

const diagnosticsSections = [
  section(
    'training-diagnostics-read-curves',
    copy('把训练曲线读成数学状态', 'Read Training Curves as Mathematical State'),
    copy(
      md`真实训练要同时看 train loss、validation loss 和 gradient norm。健康训练通常表现为 train/val loss 同步下降，梯度范数逐步减小。学习率过大时，loss 会震荡或发散；过拟合时，train loss 继续下降但 validation loss 回升；梯度消失时，gradient norm 接近 0 但 loss 仍高；梯度爆炸时，loss 和 gradient norm 一起急剧上升。

这些曲线背后对应目标函数形状、步长、链式法则连乘、模型容量和数据分布差异。`,
      md`Real training should read train loss, validation loss, and gradient norm together. Healthy training often shows train and validation loss falling together while gradient norm shrinks. A learning rate that is too high can make loss oscillate or diverge; overfitting makes train loss keep falling while validation loss rises; vanishing gradients show tiny gradient norm while loss stays high; exploding gradients make loss and gradient norm rise sharply together.

Behind these curves are objective geometry, step size, chain-rule products, model capacity, and data distribution differences.`,
    ),
    { visualIds: ['training-diagnostics-dashboard-image'] },
  ),
  section(
    'training-diagnostics-validation-gap',
    copy('Validation gap 是泛化读数', 'Validation Gap Is a Generalization Readout'),
    copy(
      md`validation gap 可以粗略写成

$$
L_{val}-L_{train}.
$$

gap 不是坏事本身，因为验证集通常更难；但 gap 持续扩大时，说明模型在训练集上的改进没有转化为泛化。此时应优先检查数据切分、正则化、早停、容量和数据增强，而不是继续盲目训练。`,
      md`A validation gap can be written roughly as

$$
L_{val}-L_{train}.
$$

A gap is not automatically bad because validation data is often harder. But a widening gap means improvement on the training set is not becoming generalization. Check data splits, regularization, early stopping, capacity, and augmentation before blindly training longer.`,
    ),
    { visualIds: ['training-loss-diagnostics-video'] },
  ),
  section(
    'training-diagnostics-gradient-norm',
    copy('Gradient norm 是更新信号强度', 'Gradient Norm Is Update-Signal Strength'),
    copy(
      md`梯度下降更新为

$$
\theta_{t+1}=\theta_t-\eta\nabla_\theta L(\theta_t).
$$

学习率 \(\eta\) 决定沿梯度方向走多远，梯度范数 \(\|\nabla_\theta L\|_2\) 表示当前下降信号多强。若 \(\eta=0.1\) 且梯度范数为 20，更新尺度约为 2，可能已经过大。`,
      md`Gradient descent updates by

$$
\theta_{t+1}=\theta_t-\eta\nabla_\theta L(\theta_t).
$$

The learning rate \(\eta\) decides how far to move, while gradient norm \(\|\nabla_\theta L\|_2\) measures how strong the current descent signal is. If \(\eta=0.1\) and the gradient norm is 20, the update scale is about 2 and may be too large.`,
    ),
    { labIds: ['training-diagnostics-lab'] },
  ),
  section(
    'training-diagnostics-interventions',
    copy('从现象到干预', 'From Symptom to Intervention'),
    copy(
      md`诊断的目标不是给曲线贴标签，而是选择干预。学习率过大时，降低学习率或使用 schedule；梯度爆炸时，考虑 clipping、初始化和 normalization；过拟合时，考虑更多数据、正则化、早停或降低容量；梯度消失时，考虑 ReLU、残差连接、normalization 和更好的初始化。

每个干预都应能回到数学解释。例如 gradient clipping 限制梯度范数，早停在 validation loss 最低附近选参数，normalization 控制中间激活尺度。`,
      md`The goal of diagnosis is not only labeling curves; it is choosing interventions. If learning rate is too high, lower it or use a schedule. If gradients explode, consider clipping, initialization, and normalization. If the model overfits, consider more data, regularization, early stopping, or lower capacity. If gradients vanish, consider ReLU, residual connections, normalization, and better initialization.

Each intervention should map back to mathematics. Gradient clipping limits gradient norm, early stopping chooses parameters near the best validation loss, and normalization controls intermediate activation scale.`,
    ),
  ),
  section(
    'training-diagnostics-logs',
    copy('把调参变成可追溯实验', 'Turn Tuning Into Traceable Experiments'),
    copy(
      md`真实项目中，每次改变学习率、batch size、初始化、正则化或模型容量，都应记录曲线和关键超参数。最低限度的记录包括：数据版本、模型版本、优化器、学习率 schedule、batch size、train/val loss、任务指标、gradient norm 或权重范数。

这样学生会把“调参”看成有证据的数学实验，而不是盲目试错。`,
      md`In real projects, every change to learning rate, batch size, initialization, regularization, or capacity should record curves and key hyperparameters. A minimum record includes data version, model version, optimizer, learning-rate schedule, batch size, train/validation loss, task metrics, and gradient norm or weight norm.

Students then see tuning as evidence-based mathematical experimentation rather than blind trial and error.`,
    ),
  ),
]

const architectureSections = [
  section(
    'deep-architecture-math-cnn-local-sharing',
    copy('CNN 是局部共享线性变换', 'CNNs Are Local Shared Linear Transforms'),
    copy(
      md`卷积层不是“图片专用魔法”。它在局部窗口上重复使用同一组权重。二维输出尺寸常写成

$$
n_{out}=\left\lfloor\frac{n+2p-k}{s}\right\rfloor+1.
$$

这里 \(n\) 是输入尺寸，\(p\) 是 padding，\(k\) 是 kernel，\(s\) 是 stride。手算例子：\(n=32,k=3,p=1,s=1\) 时，输出仍是 32。`,
      md`A convolution layer is not image-only magic. It reuses the same weights over local windows. A common 2D output-size formula is

$$
n_{out}=\left\lfloor\frac{n+2p-k}{s}\right\rfloor+1.
$$

Here \(n\) is input size, \(p\) is padding, \(k\) is kernel size, and \(s\) is stride. Worked example: with \(n=32,k=3,p=1,s=1\), the output size remains 32.`,
    ),
    { visualIds: ['architecture-stack-image'] },
  ),
  section(
    'deep-architecture-math-attention',
    copy('Attention 是相似度和概率加权', 'Attention Is Similarity and Probability Weighting'),
    copy(
      md`scaled dot-product attention 写成

$$
\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d}}\right)V.
$$

\(QK^\top\) 计算 token 之间的点积相似度，除以 \(\sqrt d\) 控制分数尺度，softmax 变成权重，再对 \(V\) 加权求和。它把向量点积、概率分布和矩阵乘法连成一个结构。`,
      md`Scaled dot-product attention is written as

$$
\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d}}\right)V.
$$

\(QK^\top\) computes dot-product similarity between tokens, division by \(\sqrt d\) controls score scale, softmax turns scores into weights, and the weights average \(V\). It combines dot products, probability distributions, and matrix multiplication.`,
    ),
    { visualIds: ['attention-conv-residual-video'] },
  ),
  section(
    'deep-architecture-math-multi-head-shape',
    copy('Multi-head attention 是 hidden width 的拆分', 'Multi-Head Attention Splits Hidden Width'),
    copy(
      md`如果输入是 \`[B,T,H]\`，有 \(N\) 个 head，每个 head 宽度为 \(d\)，则通常要求 \(H=N\cdot d\)。形状会被临时重排成 \`[B,N,T,d]\` 或类似布局，让每个 head 独立计算 \(QK^\top\)。

这个拆分不改变 token 数 \(T\)，也不改变 batch size \(B\)。它让不同 head 能在不同子空间里读取关系。`,
      md`If input shape is \`[B,T,H]\`, with \(N\) heads and per-head width \(d\), then usually \(H=N\cdot d\). Shape is temporarily rearranged to \`[B,N,T,d]\` or a similar layout so each head computes \(QK^\top\) separately.

This split does not change token count \(T\) or batch size \(B\). It lets different heads read relationships in different subspaces.`,
    ),
    { labIds: ['architecture-math-lab'] },
  ),
  section(
    'deep-architecture-math-residual-normalization',
    copy('Residual 和 normalization 稳定深层信息流', 'Residuals and Normalization Stabilize Deep Information Flow'),
    copy(
      md`残差连接把层写成

$$
\mathbf{y}=\mathbf{x}+F(\mathbf{x}).
$$

这给信息和梯度提供更直接的路径。Normalization 则控制中间激活的均值和尺度，减少深层堆叠时的数值漂移。它们不是用来替代学习，而是让很深的组合更容易优化。`,
      md`A residual connection writes a layer as

$$
\mathbf{y}=\mathbf{x}+F(\mathbf{x}).
$$

This gives information and gradients a more direct path. Normalization controls the mean and scale of intermediate activations, reducing numerical drift in deep stacks. These mechanisms do not replace learning; they make very deep compositions easier to optimize.`,
    ),
  ),
  section(
    'deep-architecture-math-composition',
    copy('把结构读成前置数学对象的组合', 'Read Architectures as Compositions of Earlier Math'),
    copy(
      md`CNN、attention、residual 和 normalization 看起来是不同模块，但都能拆回前置数学对象：局部线性变换、点积、softmax、矩阵乘法、向量范数和尺度控制。

学生读新模型时，可以先问三个问题：shape 怎么流动？哪些维度被求和或拆分？概率权重或归一化在哪里改变尺度？这样比背每个架构名更稳。`,
      md`CNNs, attention, residuals, and normalization look like different modules, but they decompose into earlier mathematical objects: local linear transforms, dot products, softmax, matrix multiplication, vector norms, and scale control.

When reading a new model, ask three questions first: how does shape flow, which dimensions are reduced or split, and where do probability weights or normalization change scale? This is more robust than memorizing architecture names.`,
    ),
  ),
]

export const aiBridgeModules: MathLabModule[] = [
  moduleDefinition({
    id: 'tensor-shapes-vectorization',
    title: copy('张量 shape 与向量化', 'Tensor Shapes and Vectorization'),
    subtitle: copy('把 AI 代码中的数组读成维度合同、广播规则和计算成本。', 'Read AI arrays as shape contracts, broadcasting rules, and compute cost.'),
    difficulty: 'foundation',
    accent: '#3868ff',
    theme: '#eef3ff',
    estimatedMinutes: 30,
    aiModelConnections: [
      copy('线性层、CNN、Transformer 和 batch 训练都依赖稳定的 shape 直觉。', 'Linear layers, CNNs, Transformers, and batch training all depend on shape intuition.'),
    ],
    learningObjectives: [
      copy('区分 batch 维、特征维和隐藏维。', 'Distinguish batch, feature, and hidden dimensions.'),
      copy('解释矩阵乘法消掉哪个维度。', 'Explain which dimension matmul reduces.'),
      copy('判断 broadcasting 是否合法并估算参数与激活成本。', 'Judge broadcasting compatibility and estimate parameter and activation cost.'),
    ],
    concepts: [
      concept(
        'linear-layer-shape-contract',
        copy('线性层 shape 合同', 'Linear-Layer Shape Contract'),
        'X[B,D]W[D,H]+b[H]\\rightarrow Y[B,H]',
        copy('shape 合同说明哪些维度保留、哪些维度被求和、bias 怎样复制。', 'A shape contract states which dimensions remain, which are summed, and how bias is copied.'),
        copy('batch 像一叠样本纸；权重矩阵对每张纸做同一个特征变换。', 'The batch is a stack of examples; the weight matrix applies the same feature transform to each sheet.'),
        copy('若 \(B=8,D=6,H=4\)，输出为 \(8\times4\)，参数量为 \(6\cdot4+4=28\)。', 'If \(B=8,D=6,H=4\), output is \(8\times4\), and parameter count is \(6\cdot4+4=28\).'),
        copy('Transformer、CNN 和 MLP 的调试都从确认 shape 合同开始。', 'Transformer, CNN, and MLP debugging all start by checking shape contracts.'),
        [
          variable('B', 'batch size，一次处理的样本数。', 'batch size, the number of examples processed together'),
          variable('D', '输入特征维度。', 'input feature dimension'),
          variable('H', '输出或隐藏维度。', 'output or hidden dimension'),
        ],
        'B, D, H = 8, 6, 4\nparams = D * H + H\nactivation_bytes = B * H * 4\nprint(params, activation_bytes)',
      ),
      concept(
        'broadcasting-compatibility',
        copy('Broadcasting 兼容性', 'Broadcasting Compatibility'),
        'a_i=b_i\\ \\text{or}\\ a_i=1\\ \\text{or}\\ b_i=1',
        copy('从最后一维向前比较，只有相等或有一方为 1 时才可广播。', 'Compare from the last dimension; dimensions are compatible only when equal or one is 1.'),
        copy('长度 1 的轴像可复制模板，不匹配的非 1 轴不能自动修复。', 'A length-1 axis is a repeatable template; a mismatched non-1 axis is not automatically repaired.'),
        copy('`[8,4]+[4]` 合法，`[8,4]+[6]` 不合法。', '`[8,4]+[4]` is valid; `[8,4]+[6]` is invalid.'),
        copy('bias、mask、attention logits 和 normalization 都会依赖 broadcasting。', 'Biases, masks, attention logits, and normalization all rely on broadcasting.'),
        [
          variable('a_i,b_i', '从右向左比较的两个维度。', 'two dimensions compared from right to left'),
        ],
      ),
    ],
    sections: tensorSections,
    visuals: [
      imageAsset(
        'tensor-shape-pipeline-image',
        'tensor-shape-pipeline.png',
        copy('张量 shape 流', 'Tensor shape flow'),
        copy('无文字插图展示 batch、权重变换和广播向量的关系。', 'A text-free illustration of batch tensors, weight transforms, and a broadcast vector.'),
      ),
      manimAsset(
        'tensor-broadcasting-video',
        'tensor-broadcasting',
        copy('Broadcasting 展开过程', 'Broadcasting expansion'),
        copy('动画展示小 bias 如何按规则复制到输出张量上。', 'Animation showing how a small bias expands across an output tensor under broadcasting rules.'),
      ),
    ],
    labs: [
      lab('tensor-shape-lab', copy('Shape 调试器', 'Shape Debugger'), 'TensorShapeLab', [
        copy('能指出 \(XW\) 中被消掉的是 \(D\)。', 'Identify that \(D\) is reduced in \(XW\).'),
        copy('能判断 bias 是否可广播。', 'Judge whether a bias can broadcast.'),
      ]),
    ],
    quizzes: [
      quiz('tensor-batch-feature', copy('把 \(B\) 从 8 改成 16，单个样本的特征维会怎样？', 'If \(B\) changes from 8 to 16, what happens to one example\'s feature dimension?'), 'unchanged', copy('不变。', 'It stays unchanged.'), copy('一定翻倍。', 'It always doubles.'), copy('batch size 只表示一次处理多少样本。', 'Batch size only says how many examples are processed together.'), 'batch-is-feature'),
      quiz('tensor-matmul-reduction', copy('`A[m,n] @ B[n,p]` 中哪个维度被求和消掉？', 'In `A[m,n] @ B[n,p]`, which dimension is reduced?'), 'n', copy('中间维 \(n\)。', 'The shared dimension \(n\).'), copy('batch 维 \(m\)。', 'The batch-like dimension \(m\).'), copy('结果保留左侧 \(m\) 和右侧 \(p\)。', 'The result keeps left \(m\) and right \(p\).'), 'matmul-shape'),
      quiz('tensor-broadcast', copy('`[8,4] + [6]` 为什么不合法？', 'Why is `[8,4] + [6]` invalid?'), 'mismatch', copy('最后一维 4 和 6 不相等，也没有一方为 1。', 'The last dimensions 4 and 6 differ, and neither is 1.'), copy('因为所有 bias 都必须是二维。', 'Because every bias must be 2D.'), copy('broadcasting 不是猜测，只按兼容规则扩展。', 'Broadcasting follows compatibility rules; it does not guess.'), 'broadcasting'),
    ],
    misconceptions: [
      misconception('batch-is-feature', copy('batch size 越大，单个样本的特征越多。', 'A larger batch gives each example more features.'), copy('batch size 是同时处理多少样本，不是每个样本有多少特征。', 'Batch size is how many examples are processed together, not how many features each example has.'), copy('`[32,128]` 改成 `[64,128]` 时，单个样本仍是 128 维。', '`[32,128]` becoming `[64,128]` keeps each example 128-dimensional.')),
      misconception('broadcast-guesses', copy('broadcasting 会自动修复任何 shape 错误。', 'Broadcasting automatically fixes any shape error.'), copy('只有维度相等或其中一个为 1 时才成立。', 'It works only when dimensions match or one is 1.'), copy('长度 5 的 bias 不能加到最后一维为 4 的输出上。', 'A length-5 bias cannot be added to an output with last dimension 4.')),
      misconception('flatten-free', copy('flatten 只是视觉整理，不会改变模型含义。', 'Flattening is only visual cleanup and does not change model meaning.'), copy('flatten 决定哪些轴被合并，会改变后续层读到的结构。', 'Flattening decides which axes merge and changes what later layers read.'), copy('把 `[B,T,H]` 误摊成 `[B,H*T]` 会丢掉 token 轴的显式结构。', 'Flattening `[B,T,H]` into `[B,H*T]` removes the explicit token axis.')),
    ],
    sourceReferences: [sources.d2lPreliminaries, sources.mml],
  }),
  moduleDefinition({
    id: 'matrix-calculus-autodiff',
    title: copy('矩阵微积分与自动微分', 'Matrix Calculus and Automatic Differentiation'),
    subtitle: copy('把局部线性化、Jacobian 乘积和计算图反向传播连成一条链。', 'Connect local linearization, Jacobian products, and computation-graph backpropagation.'),
    difficulty: 'intermediate',
    accent: '#7c3aed',
    theme: '#f3e8ff',
    estimatedMinutes: 34,
    aiModelConnections: [
      copy('神经网络训练依赖自动微分把 loss 的梯度传回每个参数。', 'Neural-network training depends on autodiff sending loss gradients back to every parameter.'),
    ],
    learningObjectives: [
      copy('把导数解释为局部线性化。', 'Interpret derivatives as local linearization.'),
      copy('区分 Jacobian、VJP 和 JVP 的用途。', 'Distinguish Jacobians, VJPs, and JVPs.'),
      copy('在小计算图上手算并检查反向梯度。', 'Compute and check backward gradients on a small graph.'),
    ],
    concepts: [
      concept(
        'local-linearization',
        copy('局部线性化', 'Local Linearization'),
        'f(\\mathbf{x}+\\Delta\\mathbf{x})\\approx f(\\mathbf{x})+J_f(\\mathbf{x})\\Delta\\mathbf{x}',
        copy('导数描述当前点附近输入扰动怎样线性影响输出。', 'The derivative describes how a small input perturbation linearly affects output near the current point.'),
        copy('切平面是曲面在一个点附近的线性替身。', 'A tangent plane is a local linear substitute for a surface.'),
        copy('若 \(f(x)=x^2\)，在 \(x=3\) 附近，\(f(3+\Delta)\approx9+6\Delta\)。', 'If \(f(x)=x^2\), near \(x=3\), \(f(3+\Delta)\approx9+6\Delta\).'),
        copy('梯度下降、backprop 和敏感性分析都依赖局部线性化。', 'Gradient descent, backpropagation, and sensitivity analysis all rely on local linearization.'),
        [variable('J_f', '函数 \(f\) 在当前点的 Jacobian。', 'Jacobian of \(f\) at the current point')],
      ),
      concept(
        'vjp-jvp',
        copy('VJP 与 JVP', 'VJP and JVP'),
        '\\bar{\\mathbf{x}}=\\bar{\\mathbf{y}}J_f(\\mathbf{x}),\\qquad \\dot{\\mathbf{y}}=J_f(\\mathbf{x})\\dot{\\mathbf{x}}',
        copy('VJP 把上游梯度向后传，JVP 把一个输入方向向前传。', 'A VJP sends upstream gradients backward; a JVP sends one input direction forward.'),
        copy('VJP 像把责任从 loss 沿边分配回去，JVP 像预测一阵小风会把输出吹向哪里。', 'A VJP distributes responsibility back from loss; a JVP predicts how one small directional push moves output.'),
        copy('对 \(y=x^2\)，若 \(x=3\)，上游梯度为 5，则 VJP 为 \(5\cdot6=30\)。', 'For \(y=x^2\), if \(x=3\) and upstream gradient is 5, the VJP is \(5\cdot6=30\).'),
        copy('现代 autodiff 系统通常避免显式构造巨大 Jacobian。', 'Modern autodiff systems usually avoid explicitly constructing huge Jacobians.'),
        [
          variable('\\bar{\\mathbf{y}}', '上游梯度。', 'upstream gradient'),
          variable('\\dot{\\mathbf{x}}', '输入扰动方向。', 'input perturbation direction'),
        ],
        'w, x, b, y = 1.4, 2.0, -0.5, 1.2\npred = w * x + b\ngrad_w = 2 * (pred - y) * x\nprint(grad_w)',
      ),
    ],
    sections: autodiffSections,
    visuals: [
      imageAsset('autodiff-local-linearization-image', 'autodiff-local-linearization.png', copy('局部线性化曲面', 'Local linearization surface'), copy('无文字插图展示曲面、切平面和梯度信号流。', 'A text-free illustration of a surface, tangent plane, and gradient signal flow.')),
      manimAsset('autodiff-vjp-flow-video', 'autodiff-vjp-flow', copy('VJP 责任回传', 'VJP responsibility flow'), copy('动画沿计算图展示上游梯度如何乘过局部导数。', 'Animation showing an upstream gradient multiplying through local derivatives in a computation graph.')),
    ],
    labs: [
      lab('autodiff-graph-lab', copy('计算图反向追踪', 'Computation Graph Trace'), 'AutodiffGraphLab', [
        copy('能解释 dL/dw 中为什么出现 x。', 'Explain why x appears in dL/dw.'),
        copy('能比较解析梯度和有限差分梯度。', 'Compare analytic and finite-difference gradients.'),
      ]),
    ],
    quizzes: [
      quiz('autodiff-local', copy('导数的局部线性化直觉是什么？', 'What is the local-linearization intuition for a derivative?'), 'linear', copy('在当前点附近用线性映射近似函数变化。', 'Approximate function change near the current point with a linear map.'), copy('让函数在全局都变成直线。', 'Turn the function into a line globally.'), copy('局部近似只在当前点附近可信。', 'The local approximation is trustworthy only near the current point.'), 'local-linearization'),
      quiz('autodiff-vjp', copy('反向传播更常计算什么来避免完整 Jacobian？', 'What does backprop often compute to avoid a full Jacobian?'), 'vjp', copy('vector-Jacobian product。', 'A vector-Jacobian product.'), copy('所有参数的笛卡尔积。', 'The Cartesian product of all parameters.'), copy('VJP 把上游梯度乘过局部 Jacobian。', 'A VJP multiplies the upstream gradient through the local Jacobian.'), 'vjp'),
      quiz('autodiff-finite-difference', copy('有限差分检查主要用于什么？', 'What is finite-difference checking mainly used for?'), 'check', copy('验证解析或自动微分梯度是否合理。', 'Validate whether analytic or autodiff gradients are reasonable.'), copy('替代所有深度学习训练。', 'Replace all deep-learning training.'), copy('有限差分成本高但直观，适合小例子。', 'Finite differences are expensive but intuitive, so they fit small checks.'), 'gradient-check'),
    ],
    misconceptions: [
      misconception('autodiff-magic', copy('自动微分不需要理解链式法则。', 'Autodiff means the chain rule no longer matters.'), copy('自动微分正是链式法则的系统化实现。', 'Autodiff is a systematic implementation of the chain rule.'), copy('detach 或原地修改会改变计算图，从而改变梯度。', 'Detach or in-place mutation changes the graph and therefore the gradient.')),
      misconception('jacobian-always-built', copy('反向传播总是显式构造完整 Jacobian。', 'Backpropagation always explicitly builds the full Jacobian.'), copy('实际系统通常计算 VJP/JVP，避免巨大矩阵。', 'Practical systems usually compute VJPs/JVPs to avoid huge matrices.'), copy('百万参数层的完整 Jacobian 通常不可承受。', 'A full Jacobian for a million-parameter layer is usually infeasible.')),
      misconception('gradient-check-training', copy('有限差分既然能算梯度，就可以直接训练深度网络。', 'Since finite differences compute gradients, they can directly train deep networks.'), copy('有限差分需要大量函数评估，适合检查小例子，不适合大模型训练。', 'Finite differences need many function evaluations, so they fit small checks rather than large-model training.'), copy('一个百万参数模型做中心差分大约需要两百万次 loss 评估。', 'A million-parameter model would need about two million loss evaluations for central differences.')),
    ],
    sourceReferences: [sources.mitMatrixCalculus, sources.mml, sources.cs229, sources.cs231n],
  }),
  moduleDefinition({
    id: 'probability-likelihood-entropy',
    title: copy('概率、似然与熵', 'Probability, Likelihood, and Entropy'),
    subtitle: copy('把模型输出读成分布，并理解交叉熵、KL 和校准。', 'Read model outputs as distributions and understand cross entropy, KL, and calibration.'),
    difficulty: 'foundation',
    accent: '#247a73',
    theme: '#e9f8f5',
    estimatedMinutes: 32,
    aiModelConnections: [
      copy('分类器、语言模型和校准方法都依赖概率分布、负对数似然和交叉熵。', 'Classifiers, language models, and calibration methods rely on distributions, negative log likelihood, and cross entropy.'),
    ],
    learningObjectives: [
      copy('解释 softmax 如何把 logits 变成概率。', 'Explain how softmax turns logits into probabilities.'),
      copy('把交叉熵读成正确类别的负对数概率。', 'Read cross entropy as negative log probability of the correct class.'),
      copy('区分熵、交叉熵、KL divergence 和校准。', 'Distinguish entropy, cross entropy, KL divergence, and calibration.'),
    ],
    concepts: [
      concept(
        'softmax-cross-entropy',
        copy('Softmax 交叉熵', 'Softmax Cross Entropy'),
        'p_i=\\frac{e^{z_i/T}}{\\sum_j e^{z_j/T}},\\qquad L=-\\log p_y',
        copy('softmax 给类别分配概率，交叉熵惩罚正确类别概率过低。', 'Softmax assigns class probabilities; cross entropy penalizes low probability on the correct class.'),
        copy('logits 像未归一化分数，softmax 把分数压到概率单纯形上。', 'Logits are unnormalized scores; softmax moves them onto the probability simplex.'),
        copy('若正确类概率是 0.8，loss 是 \(-\log 0.8\approx0.223\)。', 'If target probability is 0.8, loss is \(-\log 0.8\approx0.223\).'),
        copy('语言模型每个 token 位置都在最小化正确 token 的负对数概率。', 'A language model minimizes the negative log probability of the correct token at every position.'),
        [
          variable('z_i', '第 i 类 logit。', 'logit for class i'),
          variable('T', 'softmax 温度。', 'softmax temperature'),
          variable('p_y', '正确类别概率。', 'target-class probability'),
        ],
        'import math\np_y = 0.8\nprint(-math.log(p_y))',
      ),
      concept(
        'kl-divergence',
        copy('KL divergence', 'KL Divergence'),
        'D_{\\mathrm{KL}}(p\\Vert q)=\\sum_i p_i\\log\\frac{p_i}{q_i}',
        copy('KL 衡量用 \(q\) 编码来自 \(p\) 的样本要多付多少信息代价。', 'KL measures the extra information cost of encoding samples from \(p\) using \(q\).'),
        copy('方向换了，代价通常不同，所以 KL 不是普通距离。', 'Reversing direction usually changes the cost, so KL is not an ordinary distance.'),
        copy('若 \(p=[0.8,0.2]\)、\(q=[0.5,0.5]\)，则 KL 大于 0。', 'If \(p=[0.8,0.2]\) and \(q=[0.5,0.5]\), KL is positive.'),
        copy('蒸馏、变分推断和分布校准都需要小心 KL 的方向。', 'Distillation, variational inference, and distribution calibration all require care with KL direction.'),
        [
          variable('p', '被当作真实或目标的分布。', 'distribution treated as target or truth'),
          variable('q', '用于近似或编码的分布。', 'distribution used for approximation or coding'),
        ],
      ),
    ],
    sections: probabilitySections,
    visuals: [
      imageAsset('probability-simplex-image', 'probability-simplex.png', copy('概率单纯形直觉', 'Probability simplex intuition'), copy('无文字插图展示类别概率、分布尖锐度和样本流。', 'A text-free illustration of class probabilities, distribution sharpness, and sample flow.')),
      manimAsset('softmax-cross-entropy-video', 'softmax-cross-entropy', copy('Softmax 到交叉熵', 'Softmax to cross entropy'), copy('动画展示 logit、温度、目标概率和负对数损失的关系。', 'Animation showing how logits, temperature, target probability, and negative-log loss relate.')),
    ],
    labs: [
      lab('probability-entropy-lab', copy('Softmax 与交叉熵', 'Softmax and Cross Entropy'), 'ProbabilityEntropyLab', [
        copy('能说明温度如何改变分布尖锐程度。', 'Explain how temperature changes distribution sharpness.'),
        copy('能比较 KL 两个方向的差异。', 'Compare the two directions of KL.'),
      ]),
    ],
    quizzes: [
      quiz('probability-ce', copy('交叉熵 \(-\log p_y\) 在什么时候变大？', 'When does cross entropy \(-\log p_y\) get large?'), 'low', copy('正确类别概率 \(p_y\) 很低时。', 'When target probability \(p_y\) is low.'), copy('所有 logits 都相等时一定为 0。', 'When all logits are equal it is always 0.'), copy('负对数会强烈惩罚接近 0 的正确类概率。', 'Negative log strongly penalizes target probabilities near 0.'), 'cross-entropy'),
      quiz('probability-kl', copy('KL divergence 为什么不是普通距离？', 'Why is KL divergence not an ordinary distance?'), 'asymmetric', copy('它通常不对称。', 'It is usually asymmetric.'), copy('它不能比较分布。', 'It cannot compare distributions.'), copy('\(D_{KL}(p\\Vert q)\) 和 \(D_{KL}(q\\Vert p)\) 通常不同。', '\(D_{KL}(p\\Vert q)\) and \(D_{KL}(q\\Vert p)\) usually differ.'), 'kl'),
      quiz('probability-calibration', copy('校准主要检查什么？', 'What does calibration mainly check?'), 'frequency', copy('预测概率是否接近实际正确频率。', 'Whether predicted probabilities match observed correctness frequencies.'), copy('模型参数是否全为整数。', 'Whether model parameters are all integers.'), copy('准确率只看对错，校准还看概率数值是否可信。', 'Accuracy checks correctness; calibration checks whether probability values are trustworthy.'), 'calibration'),
    ],
    misconceptions: [
      misconception('softmax-certainty', copy('softmax 最大概率高就说明模型一定可靠。', 'A high softmax probability means the model is definitely reliable.'), copy('softmax 是模型内部分数的归一化，不自动保证校准。', 'Softmax normalizes internal scores; it does not automatically guarantee calibration.'), copy('模型可能对分布外样本也给出很高概率。', 'A model can assign high probability to out-of-distribution inputs.')),
      misconception('entropy-accuracy', copy('熵越低，分类准确率一定越高。', 'Lower entropy always means higher accuracy.'), copy('低熵只说明分布更尖锐，不说明尖锐地指向正确类别。', 'Low entropy means a sharper distribution, not necessarily a correct one.'), copy('模型可以非常自信地预测错误类别。', 'A model can confidently predict the wrong class.')),
      misconception('kl-distance', copy('KL divergence 和欧氏距离一样对称。', 'KL divergence is symmetric like Euclidean distance.'), copy('KL 的方向有含义，两个方向通常不同。', 'KL direction matters, and the two directions usually differ.'), copy('用窄分布近似宽分布，与用宽分布近似窄分布，惩罚不同。', 'Approximating a broad distribution with a narrow one differs from the reverse.')),
    ],
    sourceReferences: [sources.d2lPreliminaries, sources.googleMlcc, sources.mml, sources.cs229],
  }),
  moduleDefinition({
    id: 'training-diagnostics',
    title: copy('训练诊断数学', 'Mathematics of Training Diagnostics'),
    subtitle: copy('把 loss 曲线、梯度范数和泛化差距读成可行动的训练信号。', 'Read loss curves, gradient norms, and generalization gaps as actionable training signals.'),
    difficulty: 'intermediate',
    accent: '#d65a31',
    theme: '#fff1e8',
    estimatedMinutes: 32,
    aiModelConnections: [
      copy('模型训练不是只看最终分数，还要读曲线、梯度和验证集行为。', 'Model training is not only final score; it requires reading curves, gradients, and validation behavior.'),
    ],
    learningObjectives: [
      copy('识别健康收敛、学习率过大、过拟合、梯度消失和梯度爆炸。', 'Recognize healthy convergence, high learning rate, overfitting, vanishing gradients, and exploding gradients.'),
      copy('把诊断现象连接到数学原因。', 'Connect diagnostic symptoms to mathematical causes.'),
      copy('为每类现象选择合理干预并记录实验。', 'Choose interventions and record experiments for each symptom.'),
    ],
    concepts: [
      concept(
        'gradient-update-diagnostics',
        copy('更新步与梯度范数', 'Update Step and Gradient Norm'),
        '\\theta_{t+1}=\\theta_t-\\eta\\nabla_\\theta L(\\theta_t),\\qquad \\|\\nabla_\\theta L\\|_2',
        copy('loss 曲线显示目标值变化，梯度范数显示每一步可用下降信号强弱。', 'Loss curves show objective change; gradient norm shows the strength of the available descent signal.'),
        copy('学习率决定沿梯度方向走多远，梯度范数决定方向本身有多强。', 'Learning rate decides how far to move; gradient norm shows how strong the direction is.'),
        copy('若 \(\eta=0.1\)、梯度范数为 20，更新尺度约为 2，可能过大。', 'If \(\eta=0.1\) and gradient norm is 20, update scale is about 2 and may be too large.'),
        copy('训练 dashboard 中的 loss、gradient norm 和 validation gap 都是优化状态观测。', 'Loss, gradient norm, and validation gap in a training dashboard are observations of optimization state.'),
        [
          variable('\\eta', '学习率。', 'learning rate'),
          variable('\\nabla_\\theta L', '参数梯度。', 'parameter gradient'),
        ],
      ),
      concept(
        'validation-gap',
        copy('Validation gap', 'Validation Gap'),
        '\\Delta_{gap}=L_{val}-L_{train}',
        copy('validation gap 读的是训练集改进是否转化为泛化。', 'The validation gap reads whether training-set improvement becomes generalization.'),
        copy('两条 loss 曲线越分开，越要检查容量、正则化和数据分布。', 'The more the loss curves separate, the more capacity, regularization, and data distribution need checking.'),
        copy('train loss 为 0.08、val loss 为 0.42，则 gap 为 0.34。', 'If train loss is 0.08 and validation loss is 0.42, the gap is 0.34.'),
        copy('早停、正则化和数据增强都以 validation 行为作为证据。', 'Early stopping, regularization, and augmentation use validation behavior as evidence.'),
        [variable('L_{val}', '验证集 loss。', 'validation loss')],
      ),
    ],
    sections: diagnosticsSections,
    visuals: [
      imageAsset('training-diagnostics-dashboard-image', 'training-diagnostics-dashboard.png', copy('训练诊断曲线', 'Training diagnostic curves'), copy('无文字插图展示多条训练曲线、梯度脉冲和泛化间隔。', 'A text-free illustration of training curves, gradient pulses, and a generalization gap.')),
      manimAsset('training-loss-diagnostics-video', 'training-loss-diagnostics', copy('训练曲线诊断动画', 'Training-curve diagnostic animation'), copy('动画对比健康收敛、震荡、过拟合、梯度消失和梯度爆炸。', 'Animation comparing healthy convergence, oscillation, overfitting, vanishing gradients, and exploding gradients.')),
    ],
    labs: [
      lab('training-diagnostics-lab', copy('训练曲线诊断', 'Training Curve Diagnostics'), 'TrainingDiagnosticsLab', [
        copy('能根据曲线选择至少一个干预方向。', 'Choose at least one intervention from the curve shape.'),
        copy('能解释 train/val loss 分叉代表什么。', 'Explain what a train/validation loss split means.'),
      ]),
    ],
    quizzes: [
      quiz('diagnostics-overfit', copy('train loss 下降而 validation loss 上升，最像什么？', 'Train loss falls while validation loss rises. What does this most resemble?'), 'overfit', copy('过拟合。', 'Overfitting.'), copy('梯度消失。', 'Vanishing gradients.'), copy('训练集表现变好但验证集变差，是过拟合信号。', 'Training improves while validation worsens, which signals overfitting.'), 'overfitting'),
      quiz('diagnostics-exploding', copy('loss 和 gradient norm 同时急剧上升，优先怀疑什么？', 'Loss and gradient norm rise sharply together. What should be suspected first?'), 'exploding', copy('梯度爆炸或学习率过大。', 'Exploding gradients or too large a learning rate.'), copy('验证集太小导致没有梯度。', 'The validation set is too small to have gradients.'), copy('过大的更新会把参数推向更差区域。', 'Oversized updates can push parameters into worse regions.'), 'exploding-gradient'),
      quiz('diagnostics-gap', copy('validation gap 持续扩大时，优先说明什么？', 'What does a widening validation gap mainly suggest?'), 'generalization', copy('训练集改进没有转化为泛化。', 'Training improvement is not becoming generalization.'), copy('batch 维变成了特征维。', 'The batch axis became the feature axis.'), copy('gap 扩大时应检查容量、正则化、数据和早停。', 'A widening gap calls for checking capacity, regularization, data, and early stopping.'), 'validation-gap'),
    ],
    misconceptions: [
      misconception('train-loss-only', copy('只要 train loss 降低，模型就一定更好。', 'If train loss decreases, the model is always better.'), copy('需要同时看 validation loss 和任务指标。', 'Validation loss and task metrics must also be checked.'), copy('过拟合时 train loss 降低但泛化变差。', 'During overfitting, train loss falls while generalization worsens.')),
      misconception('small-gradient-good', copy('梯度很小一定说明已经收敛到好解。', 'A tiny gradient always means convergence to a good solution.'), copy('也可能是梯度消失、饱和区或鞍点。', 'It may also be vanishing gradients, saturation, or a saddle point.'), copy('深层 sigmoid 网络可能 loss 仍高但前层梯度接近 0。', 'A deep sigmoid network may have high loss while early gradients are near 0.')),
      misconception('more-epochs-fix', copy('所有训练问题都能靠训练更久解决。', 'Every training problem can be fixed by training longer.'), copy('震荡、过拟合和梯度爆炸通常需要改变干预，而不是只增加 epoch。', 'Oscillation, overfitting, and exploding gradients usually require interventions, not just more epochs.'), copy('学习率过大时训练更久可能只会继续震荡。', 'With too large a learning rate, training longer may only continue oscillation.')),
    ],
    sourceReferences: [sources.googleMlcc, sources.d2lPreliminaries, sources.cs231n],
  }),
  moduleDefinition({
    id: 'deep-architecture-math',
    title: copy('深度结构中的数学', 'Mathematics Inside Deep Architectures'),
    subtitle: copy('用线性代数、概率权重和尺度控制读懂 CNN、Attention 与 Transformer。', 'Use linear algebra, probability weights, and scale control to read CNNs, Attention, and Transformers.'),
    difficulty: 'advanced',
    accent: '#0f9f7a',
    theme: '#e9f8f5',
    estimatedMinutes: 36,
    aiModelConnections: [
      copy('CNN、Attention、Transformer、残差和 normalization 都是前置数学对象的组合。', 'CNNs, Attention, Transformers, residuals, and normalization combine earlier mathematical objects.'),
    ],
    learningObjectives: [
      copy('用输出尺寸公式解释卷积层。', 'Explain convolution layers with the output-size formula.'),
      copy('把 attention 读成点积相似度和概率加权。', 'Read attention as dot-product similarity and probability weighting.'),
      copy('说明 residual 和 normalization 如何稳定深层信息流。', 'Explain how residuals and normalization stabilize deep information flow.'),
    ],
    concepts: [
      concept(
        'convolution-output-size',
        copy('卷积输出尺寸', 'Convolution Output Size'),
        'n_{out}=\\left\\lfloor\\frac{n+2p-k}{s}\\right\\rfloor+1',
        copy('卷积输出尺寸由输入、padding、kernel 和 stride 共同决定。', 'Convolution output size is determined by input size, padding, kernel, and stride.'),
        copy('kernel 像一个局部窗口，在空间上滑动并共享同一组权重。', 'A kernel is a local window that slides spatially while sharing one weight set.'),
        copy('若 \(n=32,k=3,p=1,s=1\)，输出尺寸为 32。', 'If \(n=32,k=3,p=1,s=1\), output size is 32.'),
        copy('CNN、patch embedding 和局部特征抽取都需要这类尺寸读法。', 'CNNs, patch embeddings, and local feature extraction need this size reading.'),
        [
          variable('k', 'kernel 尺寸。', 'kernel size'),
          variable('s', 'stride。', 'stride'),
          variable('p', 'padding。', 'padding'),
        ],
      ),
      concept(
        'scaled-dot-product-attention',
        copy('缩放点积注意力', 'Scaled Dot-Product Attention'),
        '\\operatorname{softmax}\\left(\\frac{QK^\\top}{\\sqrt{d}}\\right)V',
        copy('query 和 key 做点积得到相关性，再用 softmax 变成对 value 的加权平均。', 'Queries and keys form dot-product relevance scores; softmax turns them into a weighted average of values.'),
        copy('每个 token 都根据相似度从其他 token 汇聚信息。', 'Each token gathers information from other tokens according to similarity.'),
        copy('若某个 key 和 query 点积最大，它通常获得最高 attention 权重。', 'If one key has the largest dot product with the query, it usually receives the highest attention weight.'),
        copy('Transformer 的核心计算是并行线性投影、点积、softmax 和矩阵乘法。', 'The core Transformer computation is parallel linear projections, dot products, softmaxes, and matrix multiplications.'),
        [
          variable('Q,K,V', 'query、key、value 矩阵。', 'query, key, and value matrices'),
          variable('d', '每个 head 的特征维度。', 'feature dimension per head'),
        ],
      ),
    ],
    sections: architectureSections,
    visuals: [
      imageAsset('architecture-stack-image', 'architecture-stack.png', copy('深度结构组合', 'Deep architecture composition'), copy('无文字插图展示卷积窗口、attention 连接、multi-head 通道、残差旁路和 normalization。', 'A text-free illustration of convolution windows, attention links, multi-head lanes, residual bypasses, and normalization.')),
      manimAsset('attention-conv-residual-video', 'attention-conv-residual', copy('结构中的数学流', 'Mathematical flow inside architectures'), copy('动画把卷积、attention、residual 和 normalization 串成一个数学过程。', 'Animation linking convolution, attention, residuals, and normalization as one mathematical process.')),
    ],
    labs: [
      lab('architecture-math-lab', copy('结构里的数学', 'Math Inside Architectures'), 'ArchitectureMathLab', [
        copy('能计算一个简单卷积输出尺寸。', 'Compute a simple convolution output size.'),
        copy('能把 attention 权重解释成 softmax 后的相似度。', 'Explain attention weights as softmaxed similarities.'),
      ]),
    ],
    quizzes: [
      quiz('architecture-attention', copy('Attention 中 \(QK^\\top\) 的主要作用是什么？', 'What is the main role of \(QK^\\top\) in Attention?'), 'scores', copy('计算 token 之间的相似度分数。', 'Compute similarity scores between tokens.'), copy('直接删除所有低频特征。', 'Directly delete all low-frequency features.'), copy('点积越大，softmax 后通常权重越高。', 'A larger dot product usually gives a larger softmax weight.'), 'attention'),
      quiz('architecture-residual', copy('残差连接最直接帮助什么？', 'What does a residual connection most directly help?'), 'flow', copy('让信息和梯度有更直接的路径。', 'Give information and gradients a more direct path.'), copy('保证模型不需要训练数据。', 'Guarantee the model needs no training data.'), copy('残差连接把 \(x\) 加回输出，改善深层路径。', 'A residual connection adds \(x\) back into the output and improves deep paths.'), 'residual'),
      quiz('architecture-head-shape', copy('multi-head attention 通常拆分的是哪个维度？', 'Which dimension does multi-head attention usually split?'), 'hidden', copy('hidden width。', 'The hidden width.'), copy('batch size。', 'The batch size.'), copy('head 数乘以每个 head 宽度应等于 hidden width。', 'Head count times per-head width should equal hidden width.'), 'multi-head-shape'),
    ],
    misconceptions: [
      misconception('attention-is-explanation', copy('Attention 权重总是可靠解释模型原因。', 'Attention weights are always a reliable explanation of model reasoning.'), copy('它们是计算中的加权系数，不自动等于因果解释。', 'They are computational weights, not automatically causal explanations.'), copy('不同层和 head 的权重可能表达不同角色。', 'Different layers and heads may play different roles.')),
      misconception('cnn-only-images', copy('卷积只能用于图片。', 'Convolution only works for images.'), copy('卷积是一种局部共享权重模式，也可用于序列和信号。', 'Convolution is a local weight-sharing pattern and can also apply to sequences and signals.'), copy('一维卷积常用于时间序列和文本特征。', '1D convolution is often used for time series and text features.')),
      misconception('residual-no-training', copy('有残差连接就不需要训练。', 'Residual connections remove the need for training.'), copy('残差连接改善信息和梯度路径，但参数仍需要通过 loss 学习。', 'Residuals improve information and gradient paths, but parameters still need to learn from loss.'), copy('残差网络仍然依赖反向传播和优化器。', 'Residual networks still depend on backpropagation and optimizers.')),
    ],
    sourceReferences: [sources.cs231n, sources.cs224n, sources.d2lPreliminaries],
  }),
]
