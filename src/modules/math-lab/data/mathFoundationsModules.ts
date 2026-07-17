import type {
  EnhancementTier,
  LabConfig,
  LocalizedCopy,
  MathLabDifficulty,
  MathLabComponentName,
  MathLabModule,
  MathLabModuleId,
  VisualAsset,
} from '../types/mathLab'

type ModuleSeed = {
  id: MathLabModuleId
  order: number
  title: LocalizedCopy
  subtitle: LocalizedCopy
  difficulty: MathLabDifficulty
  enhancementTier: EnhancementTier
  accent: string
  theme: string
  prerequisites?: MathLabModuleId[]
  formula: string
  variables: Array<{ symbol: string; description: LocalizedCopy }>
  plainExplanation: LocalizedCopy
  geometricIntuition: LocalizedCopy
  numericalExample: LocalizedCopy
  codeExample: string
  modelConnection: LocalizedCopy
  learningObjectives: LocalizedCopy[]
  sections: Array<{
    id: string
    title: LocalizedCopy
    content: LocalizedCopy
  }>
  misconception: {
    id: string
    statement: LocalizedCopy
    correction: LocalizedCopy
    example: LocalizedCopy
  }
  quiz: {
    id: string
    prompt: LocalizedCopy
    correct: LocalizedCopy
    distractor: LocalizedCopy
    explanation: LocalizedCopy
    tag: string
  }
  labComponents?: MathLabComponentName[]
  visuals?: VisualAsset[]
}

const md = String.raw

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function variable(symbol: string, zh: string, en: string) {
  return { symbol, description: copy(zh, en) }
}

function labConfig(moduleId: MathLabModuleId, componentName: MathLabComponentName): LabConfig {
  return {
    id: `${moduleId}-${componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`,
    title: copy('互动实验', 'Interactive lab'),
    type: 'interactive-visual',
    componentName,
    successCriteria: [
      copy('能把滑块变化解释成公式中的一个量。', 'Explain how one control maps to one term in the formula.'),
      copy('能说出当前模型或数值方法的限制。', 'Name the limitation shown by the current model or numerical method.'),
    ],
  }
}

function manimAsset(
  id: string,
  title: LocalizedCopy,
  assetPath: string,
  posterPath: string,
  transcript: LocalizedCopy,
): VisualAsset {
  return {
    id,
    type: 'manim-video',
    title,
    assetPath,
    posterPath,
    transcript,
    learningPurpose: copy('用动画建立几何直觉。', 'Use motion to build geometric intuition.'),
  }
}

const seeds: ModuleSeed[] = [
  {
    id: 'taylor-series',
    order: 6,
    title: copy('泰勒近似', 'Taylor Approximation'),
    subtitle: copy('把复杂函数在一个点附近读成可计算的局部模型。', 'Read a complex function as a computable local model near one point.'),
    difficulty: 'foundation',
    enhancementTier: 'interactive',
    accent: '#d65a31',
    theme: '#fff1e8',
    formula: 'f(x) \\approx \\sum_{k=0}^{n}\\frac{f^{(k)}(a)}{k!}(x-a)^k',
    variables: [
      variable('a', '展开中心，也是“局部”二字的锚点。', 'Expansion center, the anchor for the word local.'),
      variable('n', '保留到第几阶，控制复杂度和误差。', 'Highest retained degree, controlling complexity and error.'),
    ],
    plainExplanation: copy('泰勒式不是在复制整个函数，而是在当前点附近做一个可调精度的替身。', 'A Taylor expression is not copying the whole function; it is a tunable local substitute.'),
    geometricIntuition: copy('一阶看斜率，二阶看弯曲，更高阶继续修正局部形状。', 'First order sees slope, second order sees curvature, and higher orders refine the local shape.'),
    numericalExample: copy('用 $x - x^3/6$ 近似 $\\sin x$，在 0 附近误差很小，远离 0 会变大。', 'Using $x - x^3/6$ for $\\sin x$ is accurate near 0 and weaker farther away.'),
    codeExample: 'import numpy as np\n\nx = 0.7\napprox = x - x**3 / 6 + x**5 / 120\nprint(approx, np.sin(x), abs(approx - np.sin(x)))',
    modelConnection: copy('优化、激活函数近似和数值库都依赖“先看局部变化”的思想。', 'Optimization, activation approximations, and numerical libraries all depend on local change.'),
    learningObjectives: [
      copy('解释为什么局部展开需要中心点。', 'Explain why a local expansion needs a center.'),
      copy('区分阶数增加和全局精确之间的差别。', 'Distinguish higher degree from global accuracy.'),
      copy('把泰勒一阶项连接到梯度更新。', 'Connect the first-order term to gradient updates.'),
    ],
    sections: [
      {
        id: 'local-model',
        title: copy('局部模型', 'Local model'),
        content: copy(
          md`泰勒近似回答的是一个很实际的问题：如果只允许我们在点 $a$ 附近观察函数，能不能写出一个便宜的替身？

$$
f(x) \approx f(a) + f'(a)(x-a) + \frac{f''(a)}{2}(x-a)^2
$$

这不是背公式，而是在把“当前位置、当前斜率、当前弯曲”逐层加回去。`,
          md`Taylor approximation answers a practical question: if we only inspect a function near $a$, can we build a cheap substitute?

$$
f(x) \approx f(a) + f'(a)(x-a) + \frac{f''(a)}{2}(x-a)^2
$$

The formula layers back the current value, current slope, and current curvature.`,
        ),
      },
      {
        id: 'model-error',
        title: copy('误差意识', 'Error awareness'),
        content: copy(
          md`阶数越高，局部形状通常越贴近，但它仍然服务于“附近”。机器学习里的近似计算也遵循同样的取舍：更复杂的近似更贵，过远的外推更危险。`,
          md`Higher order usually tracks the nearby shape better, but it still serves the neighborhood. Approximation in machine learning follows the same tradeoff: richer approximations cost more, and distant extrapolation is riskier.`,
        ),
      },
    ],
    misconception: {
      id: 'taylor-global',
      statement: copy('泰勒多项式阶数高，就能在任何地方都很准。', 'A high-degree Taylor polynomial is accurate everywhere.'),
      correction: copy('准确区域取决于中心点、阶数和函数本身。', 'Accuracy depends on the center, degree, and the function.'),
      example: copy('在 0 附近近似 $\\sin x$ 很好，不代表在很远处也同样可靠。', 'A good approximation of $\\sin x$ near 0 is not equally reliable far away.'),
    },
    quiz: {
      id: 'taylor-locality',
      prompt: copy('泰勒近似最先强调的是什么？', 'What does Taylor approximation emphasize first?'),
      correct: copy('函数在某个点附近的局部行为', 'The local behavior of a function near one point'),
      distractor: copy('数据集必须随机打乱', 'The dataset must be randomly shuffled'),
      explanation: copy('中心点决定了近似从哪里开始读函数。', 'The center decides where the approximation starts reading the function.'),
      tag: 'taylor-locality',
    },
    labComponents: ['NumericalMiniLab'],
  },
  {
    id: 'monte-carlo',
    order: 7,
    title: copy('随机采样与蒙特卡洛', 'Sampling and Monte Carlo'),
    subtitle: copy('用可重复的随机实验估计不可直接计算的量。', 'Estimate hard-to-compute quantities with repeatable random experiments.'),
    difficulty: 'foundation',
    enhancementTier: 'interactive',
    accent: '#247a73',
    theme: '#e9f8f5',
    formula: 'I \\approx \\frac{1}{N}\\sum_{i=1}^{N} f(X_i)',
    variables: [
      variable('N', '样本数量，决定估计的稳定程度。', 'Sample count, controlling estimate stability.'),
      variable('X_i', '第 i 次抽样得到的输入。', 'The input drawn on sample i.'),
    ],
    plainExplanation: copy('蒙特卡洛把“算不出来”改写成“抽很多次后取平均”。', 'Monte Carlo turns hard integration into repeated sampling and averaging.'),
    geometricIntuition: copy('每个样本像一次投票；样本越多，平均值越不容易被偶然事件拉偏。', 'Each sample is a vote; more samples make the average harder to skew by chance.'),
    numericalExample: copy('用正方形里的随机点估计圆的面积，可以得到 $\\pi$ 的近似。', 'Random points inside a square can estimate a circle area and approximate $\\pi$.'),
    codeExample: 'import numpy as np\n\nrng = np.random.default_rng(7)\nx = rng.random(10000)\nprint(np.mean(x**2), 1 / 3)',
    modelConnection: copy('dropout、数据增强、扩散采样和不确定性估计都需要理解随机采样。', 'Dropout, augmentation, diffusion sampling, and uncertainty estimates all rely on sampling.'),
    learningObjectives: [
      copy('解释样本均值为什么能近似期望。', 'Explain why a sample average can approximate an expectation.'),
      copy('理解样本数量与方差之间的关系。', 'Understand how sample count affects variance.'),
      copy('区分随机性和不可复现。', 'Separate randomness from irreproducibility.'),
    ],
    sections: [
      {
        id: 'sampling-average',
        title: copy('平均值就是估计器', 'The average is the estimator'),
        content: copy(
          md`当解析积分太贵时，我们可以从分布里抽样，把函数值平均起来。

$$
\mathbb{E}[f(X)] \approx \frac{1}{N}\sum_{i=1}^{N}f(X_i)
$$

关键不是一次抽样有多准，而是很多次抽样后的统计稳定性。`,
          md`When analytic integration is too expensive, draw samples and average the function values.

$$
\mathbb{E}[f(X)] \approx \frac{1}{N}\sum_{i=1}^{N}f(X_i)
$$

The point is not one perfect draw; it is statistical stability after many draws.`,
        ),
      },
      {
        id: 'variance',
        title: copy('方差而不是魔法', 'Variance, not magic'),
        content: copy(
          md`样本数翻倍不会让误差直接减半。蒙特卡洛误差通常按 $1/\sqrt{N}$ 下降，所以它可靠但不廉价。`,
          md`Doubling samples does not directly halve error. Monte Carlo error often falls like $1/\sqrt{N}$, so it is reliable but not free.`,
        ),
      },
    ],
    misconception: {
      id: 'monte-carlo-exact',
      statement: copy('样本足够多就一定得到精确答案。', 'Enough samples always produce the exact answer.'),
      correction: copy('更多样本降低波动，但结果仍是估计。', 'More samples reduce variance, but the result remains an estimate.'),
      example: copy('一万次投点估计 $\\pi$ 仍会有小幅波动。', 'Ten thousand random points still give a slightly moving estimate of $\\pi$.'),
    },
    quiz: {
      id: 'monte-carlo-average',
      prompt: copy('蒙特卡洛估计最核心的操作是什么？', 'What is the core operation in Monte Carlo estimation?'),
      correct: copy('对随机样本上的函数值取平均', 'Average function values over random samples'),
      distractor: copy('只计算一次最大值', 'Compute one maximum only'),
      explanation: copy('样本平均值是期望的可计算替身。', 'The sample average is a computable substitute for the expectation.'),
      tag: 'monte-carlo-average',
    },
    labComponents: ['NumericalMiniLab'],
  },
  {
    id: 'vectors-matrices-norms',
    order: 8,
    title: copy('向量、矩阵与范数', 'Vectors, Matrices, and Norms'),
    subtitle: copy('把模型里的数组读成方向、变换、尺度和距离。', 'Read model arrays as directions, transformations, scale, and distance.'),
    difficulty: 'foundation',
    enhancementTier: 'video',
    accent: '#3868ff',
    theme: '#eef3ff',
    formula: '\\|x\\|_2 = \\sqrt{x_1^2 + \\cdots + x_n^2}',
    variables: [
      variable('x', '一个向量，可以表示特征、误差或参数。', 'A vector representing features, errors, or parameters.'),
      variable('\\|x\\|_2', '向量长度，也常被用作误差大小。', 'Vector length, often used as error magnitude.'),
    ],
    plainExplanation: copy('向量给出方向和大小，矩阵描述如何移动、拉伸或旋转这些方向。', 'Vectors carry direction and magnitude; matrices move, stretch, or rotate them.'),
    geometricIntuition: copy('点积看对齐程度，范数看长度，矩阵乘法看空间如何被改造。', 'Dot products measure alignment, norms measure length, and matrix multiplication reshapes space.'),
    numericalExample: copy('向量 $(3,4)$ 的二范数是 5，因为 $\\sqrt{3^2+4^2}=5$。', 'The vector $(3,4)$ has 2-norm 5 because $\\sqrt{3^2+4^2}=5$.'),
    codeExample: 'import numpy as np\n\nx = np.array([3, 4])\ny = np.array([4, 0])\nprint(np.dot(x, y), np.linalg.norm(x))',
    modelConnection: copy('embedding 相似度、attention 点积、线性层和正则化都建立在这些对象上。', 'Embedding similarity, attention dot products, linear layers, and regularization all use these objects.'),
    learningObjectives: [
      copy('把点积解释成方向相似和长度的组合。', 'Interpret dot products as alignment combined with length.'),
      copy('把矩阵乘法解释成线性变换。', 'Interpret matrix multiplication as a linear transformation.'),
      copy('用范数描述误差大小。', 'Use norms to describe error magnitude.'),
    ],
    sections: [
      {
        id: 'vectors-as-geometry',
        title: copy('数组背后的几何', 'Geometry behind arrays'),
        content: copy(
          md`模型参数看起来只是数组，但向量视角会立刻给它们几何意义。点积可以写成：

$$
x^\top y = \|x\|\,\|y\|\cos\theta
$$

所以它同时关心长度和方向。`,
          md`Model parameters may look like arrays, but vectors immediately give them geometry. A dot product can be written as:

$$
x^\top y = \|x\|\,\|y\|\cos\theta
$$

It cares about both length and direction.`,
        ),
      },
      {
        id: 'matrices-as-layers',
        title: copy('矩阵就是空间操作', 'Matrices operate on space'),
        content: copy(
          md`线性层 $Wx+b$ 不是神秘模块。矩阵 $W$ 混合输入特征，偏置 $b$ 平移结果，后面的非线性再改变可表达的边界。`,
          md`A linear layer $Wx+b$ is not a black box. The matrix $W$ mixes input features, the bias $b$ shifts the result, and nonlinearities change the expressible boundaries.`,
        ),
      },
    ],
    misconception: {
      id: 'matrix-elementwise',
      statement: copy('矩阵乘法就是逐元素相乘。', 'Matrix multiplication is element-wise multiplication.'),
      correction: copy('矩阵乘法是在混合维度并改造空间。', 'Matrix multiplication mixes dimensions and transforms space.'),
      example: copy('线性层会把所有输入特征加权组合，而不是逐项保留。', 'A linear layer combines all input features instead of preserving them item by item.'),
    },
    quiz: {
      id: 'matrix-transform',
      prompt: copy('矩阵乘向量最适合被理解成什么？', 'What is the best intuition for multiplying a matrix by a vector?'),
      correct: copy('对向量做线性变换', 'Applying a linear transformation to the vector'),
      distractor: copy('随机交换标签', 'Randomly swapping labels'),
      explanation: copy('矩阵定义了基向量如何移动，因此改变整个空间。', 'A matrix defines how basis vectors move, which changes the whole space.'),
      tag: 'matrix-transform',
    },
    labComponents: ['VectorDotProductLab', 'MatrixTransformLab'],
    visuals: [
      manimAsset(
        'vector-dot-product-video',
        copy('点积如何读取相似度', 'How a dot product reads similarity'),
        '/manim/math-lab/vector-dot-product.mp4',
        '/manim/math-lab/vector-dot-product.svg',
        copy('两个向量的夹角变化时，投影长度和点积会同步变化。', 'As the angle changes, projection length and dot product move together.'),
      ),
      manimAsset(
        'matrix-transform-video',
        copy('矩阵如何改造平面', 'How a matrix reshapes the plane'),
        '/manim/math-lab/matrix-transform.mp4',
        '/manim/math-lab/matrix-transform.svg',
        copy('网格被拉伸和剪切，说明矩阵不是逐元素操作。', 'The grid stretches and shears, showing that a matrix is not an element-wise operation.'),
      ),
    ],
  },
  {
    id: 'lu-decomposition',
    order: 9,
    title: copy('线性方程组与 LU 分解', 'Linear Systems and LU Factorization'),
    subtitle: copy('把一次求解拆成可复用的三角步骤。', 'Split a solve into reusable triangular steps.'),
    difficulty: 'intermediate',
    enhancementTier: 'interactive',
    accent: '#7c5cff',
    theme: '#f0edff',
    prerequisites: ['vectors-matrices-norms'],
    formula: 'A = LU',
    variables: [
      variable('L', '下三角矩阵，负责前代。', 'Lower triangular matrix used in forward substitution.'),
      variable('U', '上三角矩阵，负责回代。', 'Upper triangular matrix used in back substitution.'),
    ],
    plainExplanation: copy('LU 分解先把矩阵拆好，后面遇到多个右端项时就不用从头开始。', 'LU factors the matrix once so multiple right-hand sides can reuse the work.'),
    geometricIntuition: copy('先做一组可控的消元，再把答案从三角结构里读出来。', 'Perform controlled elimination, then read the answer through triangular structure.'),
    numericalExample: copy('同一个 $A$ 要解多个 $b$ 时，分解一次比每次重新消元更划算。', 'When the same $A$ has many $b$ vectors, factoring once is cheaper than eliminating each time.'),
    codeExample: 'import numpy as np\n\nA = np.array([[4., 2.], [3., 5.]])\nb = np.array([6., 7.])\nprint(np.linalg.solve(A, b))',
    modelConnection: copy('最小二乘、二阶优化和数值后端都会反复遇到线性系统。', 'Least squares, second-order optimization, and numerical backends repeatedly meet linear systems.'),
    learningObjectives: [
      copy('解释前代和回代的顺序。', 'Explain the order of forward and back substitution.'),
      copy('理解为什么分解可以复用。', 'Understand why factorization can be reused.'),
      copy('识别主元太小带来的不稳定。', 'Recognize instability from small pivots.'),
    ],
    sections: [
      {
        id: 'factor-once',
        title: copy('分解一次，求解多次', 'Factor once, solve many times'),
        content: copy(
          md`如果直接解 $Ax=b$ 很贵，可以先把 $A$ 写成两个更容易处理的矩阵：

$$
A = LU
$$

然后依次解 $Ly=b$ 和 $Ux=y$。这把一个难问题拆成两个三角问题。`,
          md`If solving $Ax=b$ directly is expensive, first write $A$ as two easier matrices:

$$
A = LU
$$

Then solve $Ly=b$ and $Ux=y$. One hard solve becomes two triangular solves.`,
        ),
      },
      {
        id: 'stability',
        title: copy('稳定性比形式更重要', 'Stability matters more than form'),
        content: copy(
          md`分解不是为了让矩阵看起来整齐。真正要关心的是主元是否可靠、误差是否被放大，以及这个分解能否被后续计算安全复用。`,
          md`Factorization is not cosmetic. The real questions are whether pivots are reliable, whether errors are amplified, and whether the result can be reused safely.`,
        ),
      },
    ],
    misconception: {
      id: 'lu-cosmetic',
      statement: copy('LU 分解只是把矩阵写得更漂亮。', 'LU only rewrites a matrix in a nicer form.'),
      correction: copy('它的价值在于降低重复求解成本，并控制计算过程。', 'Its value is reducing repeated solve cost and structuring computation.'),
      example: copy('同一个系统换不同 $b$ 时，已分解的 $L,U$ 可以继续用。', 'For the same system with different $b$, the existing $L,U$ can be reused.'),
    },
    quiz: {
      id: 'lu-two-solves',
      prompt: copy('有了 $A=LU$ 后，解 $Ax=b$ 通常变成哪两步？', 'After $A=LU$, solving $Ax=b$ usually becomes which two steps?'),
      correct: copy('先解 $Ly=b$，再解 $Ux=y$', 'Solve $Ly=b$, then solve $Ux=y$'),
      distractor: copy('先随机采样，再排序标签', 'Sample randomly, then sort labels'),
      explanation: copy('三角系统可以按顺序逐个变量求出。', 'Triangular systems reveal variables in order.'),
      tag: 'lu-substitution',
    },
    labComponents: ['NumericalMiniLab'],
  },
  {
    id: 'sparse-matrices',
    order: 10,
    title: copy('稀疏矩阵', 'Sparse Matrices'),
    subtitle: copy('只存真正有信息的位置，让大规模线性代数可运行。', 'Store only informative entries so large linear algebra can run.'),
    difficulty: 'intermediate',
    enhancementTier: 'core',
    accent: '#0f9f7a',
    theme: '#eaf8f3',
    prerequisites: ['vectors-matrices-norms'],
    formula: '\\operatorname{nnz}(A) \\ll mn',
    variables: [
      variable('\\operatorname{nnz}(A)', '矩阵中的非零元素数量。', 'The number of nonzero entries in the matrix.'),
      variable('mn', '完整 dense 矩阵需要存储的位置数。', 'The number of entries in a dense matrix.'),
    ],
    plainExplanation: copy('稀疏矩阵不是小矩阵，而是大部分位置没有必要存。', 'A sparse matrix is not small; most positions are just unnecessary to store.'),
    geometricIntuition: copy('把空白区域从计算里拿掉，算法才有空间处理巨大图和词表。', 'Removing empty regions from computation makes huge graphs and vocabularies feasible.'),
    numericalExample: copy('一百万乘一百万的矩阵如果每行只有 20 个非零值，就不能按 dense 方式存。', 'A million by million matrix with 20 nonzeros per row cannot be stored densely.'),
    codeExample: 'rows = [0, 0, 2]\ncols = [1, 3, 2]\nvals = [4.0, -1.0, 2.5]\nprint(list(zip(rows, cols, vals)))',
    modelConnection: copy('推荐系统、图学习、词袋特征和 attention mask 都经常天然稀疏。', 'Recommenders, graph learning, bag-of-words features, and attention masks are often sparse.'),
    learningObjectives: [
      copy('区分 sparse 与 dense 的存储成本。', 'Distinguish sparse and dense storage cost.'),
      copy('解释非零元素数量如何决定计算量。', 'Explain how nonzero count drives compute.'),
      copy('理解稀疏结构为什么改变算法设计。', 'Understand why sparsity changes algorithm design.'),
    ],
    sections: [
      {
        id: 'storage',
        title: copy('存信息，不存空白', 'Store information, not blank space'),
        content: copy(
          md`当矩阵大到无法完整存储时，关键量变成非零元素数量：

$$
\operatorname{nnz}(A) \ll mn
$$

这意味着算法应该围绕非零项移动，而不是扫描每个位置。`,
          md`When a matrix is too large to store fully, the key quantity becomes the number of nonzeros:

$$
\operatorname{nnz}(A) \ll mn
$$

Algorithms should move around nonzero entries instead of scanning every position.`,
        ),
      },
      {
        id: 'model-scale',
        title: copy('规模来自结构', 'Scale comes from structure'),
        content: copy(
          md`稀疏性是一种结构假设。它告诉我们哪些连接不存在、哪些特征没有出现、哪些位置不需要参与计算。`,
          md`Sparsity is a structural assumption. It tells us which links do not exist, which features are absent, and which positions should skip computation.`,
        ),
      },
    ],
    misconception: {
      id: 'sparse-small',
      statement: copy('稀疏矩阵就是尺寸很小的矩阵。', 'A sparse matrix is simply a small matrix.'),
      correction: copy('它可以非常大，只是非零元素相对很少。', 'It can be huge while having relatively few nonzero entries.'),
      example: copy('网页图或用户物品矩阵通常巨大但稀疏。', 'Web graphs and user-item matrices are often huge but sparse.'),
    },
    quiz: {
      id: 'sparse-cost',
      prompt: copy('稀疏矩阵计算最关心哪个量？', 'Which quantity matters most for sparse matrix computation?'),
      correct: copy('非零元素数量', 'The number of nonzero entries'),
      distractor: copy('矩阵标题的长度', 'The length of the matrix title'),
      explanation: copy('真正参与计算的通常是非零项。', 'The entries that actually participate are usually the nonzeros.'),
      tag: 'sparse-nnz',
    },
    labComponents: ['NumericalMiniLab'],
  },
  {
    id: 'condition-numbers',
    order: 11,
    title: copy('条件数与敏感性', 'Conditioning and Sensitivity'),
    subtitle: copy('判断输入的小扰动会被结果放大多少。', 'Judge how much small input perturbations can be amplified.'),
    difficulty: 'intermediate',
    enhancementTier: 'core',
    accent: '#c2410c',
    theme: '#fff0e8',
    prerequisites: ['lu-decomposition'],
    formula: '\\kappa(A) = \\|A\\|\\|A^{-1}\\|',
    variables: [
      variable('\\kappa(A)', '条件数，衡量问题敏感性。', 'Condition number, measuring problem sensitivity.'),
      variable('A^{-1}', '逆矩阵；越放大误差，条件越差。', 'Inverse matrix; more error amplification means worse conditioning.'),
    ],
    plainExplanation: copy('条件数告诉你问题本身有多容易把小误差放大。', 'A condition number tells how easily the problem itself amplifies small errors.'),
    geometricIntuition: copy('如果变换把空间压得很扁，逆变换就会把噪声拉得很长。', 'If a transformation flattens space, the inverse stretches noise.'),
    numericalExample: copy('两列几乎平行的矩阵会让最小二乘解对噪声很敏感。', 'A matrix with nearly parallel columns makes least-squares solutions noise-sensitive.'),
    codeExample: 'import numpy as np\n\nA = np.array([[1, 1], [1, 1.0001]])\nprint(np.linalg.cond(A))',
    modelConnection: copy('特征缩放、病态 Hessian 和训练不稳定都可以用敏感性解释。', 'Feature scaling, ill-conditioned Hessians, and training instability can be read through sensitivity.'),
    learningObjectives: [
      copy('解释误差放大不一定来自代码错误。', 'Explain why amplified error is not always a coding bug.'),
      copy('识别接近奇异的线性系统。', 'Recognize nearly singular linear systems.'),
      copy('把条件数连接到特征缩放。', 'Connect conditioning to feature scaling.'),
    ],
    sections: [
      {
        id: 'amplification',
        title: copy('小扰动，大影响', 'Small perturbation, large effect'),
        content: copy(
          md`条件数大的问题，即使算法写对了，也可能给出不稳定结果。

$$
\frac{\|\Delta x\|}{\|x\|} \lesssim \kappa(A)\frac{\|\Delta b\|}{\|b\|}
$$

这条不等式提醒我们：输入误差会被问题结构放大。`,
          md`For a poorly conditioned problem, correct code can still produce unstable results.

$$
\frac{\|\Delta x\|}{\|x\|} \lesssim \kappa(A)\frac{\|\Delta b\|}{\|b\|}
$$

The inequality warns that input error can be amplified by problem structure.`,
        ),
      },
      {
        id: 'scaling',
        title: copy('先看尺度', 'Check scale first'),
        content: copy(
          md`训练模型前做特征缩放，不只是为了好看。尺度差异会改变目标函数地形，让优化器在狭长峡谷里来回震荡。`,
          md`Feature scaling before training is not cosmetic. Scale mismatch changes the objective landscape and can make optimizers bounce through narrow valleys.`,
        ),
      },
    ],
    misconception: {
      id: 'conditioning-bug',
      statement: copy('结果不稳定一定是实现写错了。', 'An unstable result always means the implementation is wrong.'),
      correction: copy('问题本身可能对扰动极其敏感。', 'The problem itself may be extremely sensitive to perturbations.'),
      example: copy('接近奇异的矩阵会放大输入中的微小噪声。', 'A nearly singular matrix can amplify tiny input noise.'),
    },
    quiz: {
      id: 'condition-meaning',
      prompt: copy('条件数很大通常说明什么？', 'What does a large condition number usually indicate?'),
      correct: copy('解对输入扰动很敏感', 'The solution is sensitive to input perturbations'),
      distractor: copy('矩阵一定是单位矩阵', 'The matrix must be the identity'),
      explanation: copy('条件数描述误差放大的潜力。', 'Condition number describes potential error amplification.'),
      tag: 'conditioning',
    },
    labComponents: ['NumericalMiniLab'],
  },
  {
    id: 'eigenvalues-eigenvectors',
    order: 12,
    title: copy('特征值与特征向量', 'Eigenvalues and Eigenvectors'),
    subtitle: copy('寻找在线性变换后方向仍不改变的结构。', 'Find directions that keep their line under a linear transformation.'),
    difficulty: 'intermediate',
    enhancementTier: 'interactive',
    accent: '#1d4ed8',
    theme: '#eaf1ff',
    prerequisites: ['vectors-matrices-norms'],
    formula: 'A\\mathbf{x}=\\lambda\\mathbf{x}',
    variables: [
      variable('\\mathbf{x}', '特征向量，变换后仍在同一方向线上。', 'Eigenvector, staying on the same direction line after transformation.'),
      variable('\\lambda', '特征值，表示该方向被缩放多少。', 'Eigenvalue, measuring scale along that direction.'),
    ],
    plainExplanation: copy('特征向量是矩阵最愿意“保留方向”的那些向量。', 'Eigenvectors are the directions a matrix preserves.'),
    geometricIntuition: copy('矩阵会改造大多数方向，但有些方向只被拉长、缩短或翻转。', 'A matrix changes most directions, but some are only stretched, shrunk, or flipped.'),
    numericalExample: copy('对角矩阵的坐标轴方向天然就是特征向量。', 'For a diagonal matrix, coordinate axes are natural eigenvectors.'),
    codeExample: 'import numpy as np\n\nA = np.array([[2, 1], [1, 3]])\nvalues, vectors = np.linalg.eig(A)\nprint(values)',
    modelConnection: copy('PCA、PageRank、谱聚类和训练动力学都依赖特征结构。', 'PCA, PageRank, spectral clustering, and training dynamics all rely on eigen-structure.'),
    learningObjectives: [
      copy('解释特征向量的几何意义。', 'Explain the geometry of eigenvectors.'),
      copy('理解特征值与缩放的关系。', 'Understand eigenvalues as scaling factors.'),
      copy('把幂迭代连接到主方向提取。', 'Connect power iteration to dominant direction extraction.'),
    ],
    sections: [
      {
        id: 'preserved-directions',
        title: copy('被保留的方向', 'Preserved directions'),
        content: copy(
          md`特征方程的意思很直白：

$$
A\mathbf{x}=\lambda\mathbf{x}
$$

矩阵 $A$ 作用之后，向量没有转到别的方向，只是按 $\\lambda$ 缩放。`,
          md`The eigen equation has a direct meaning:

$$
A\mathbf{x}=\lambda\mathbf{x}
$$

After applying $A$, the vector does not rotate into another direction; it scales by $\\lambda$.`,
        ),
      },
      {
        id: 'dominant-direction',
        title: copy('主方向', 'Dominant direction'),
        content: copy(
          md`反复乘同一个矩阵时，被最大特征值控制的方向会越来越显眼。这就是幂迭代背后的直觉。`,
          md`When the same matrix is applied repeatedly, the direction controlled by the largest eigenvalue becomes more visible. That is the intuition behind power iteration.`,
        ),
      },
    ],
    misconception: {
      id: 'eigen-any-vector',
      statement: copy('任何向量都是某个矩阵的特征向量。', 'Every vector is an eigenvector for a given matrix.'),
      correction: copy('只有变换后仍留在同一方向线上的向量才是。', 'Only vectors that stay on the same direction line qualify.'),
      example: copy('剪切矩阵会改变大多数方向，但仍可能保留某一条轴。', 'A shear changes most directions but can preserve one axis.'),
    },
    quiz: {
      id: 'eigen-property',
      prompt: copy('特征向量经过矩阵变换后有什么性质？', 'What happens to an eigenvector after matrix transformation?'),
      correct: copy('方向保持，只发生缩放', 'Its direction is preserved and only scaled'),
      distractor: copy('所有坐标都必须变成 0', 'All coordinates must become 0'),
      explanation: copy('特征值给出缩放倍数。', 'The eigenvalue gives the scaling factor.'),
      tag: 'eigen-direction',
    },
    labComponents: ['NumericalMiniLab'],
  },
  {
    id: 'markov-chains',
    order: 13,
    title: copy('马尔可夫链', 'Markov Chains'),
    subtitle: copy('用转移矩阵描述只依赖当前状态的随机过程。', 'Use transition matrices for random processes that depend only on the current state.'),
    difficulty: 'intermediate',
    enhancementTier: 'core',
    accent: '#0891b2',
    theme: '#e6f8fb',
    prerequisites: ['monte-carlo', 'eigenvalues-eigenvectors'],
    formula: '\\mathbf{x}_{k+1}=P\\mathbf{x}_{k}',
    variables: [
      variable('P', '转移矩阵，记录状态之间的概率流动。', 'Transition matrix recording probability flow between states.'),
      variable('\\mathbf{x}_k', '第 k 步的状态分布。', 'State distribution at step k.'),
    ],
    plainExplanation: copy('马尔可夫链只看现在，不追问更早的历史。', 'A Markov chain reads the present state and does not ask for earlier history.'),
    geometricIntuition: copy('状态分布像一团概率质量，每一步被矩阵重新分配。', 'A state distribution is probability mass redistributed by the matrix each step.'),
    numericalExample: copy('天气模型可以用“晴/雨”之间的转移概率预测长期分布。', 'A sunny/rainy weather model can use transition probabilities to predict long-run behavior.'),
    codeExample: 'import numpy as np\n\nP = np.array([[0.8, 0.3], [0.2, 0.7]])\nx = np.array([1.0, 0.0])\nfor _ in range(10):\n    x = P @ x\nprint(x)',
    modelConnection: copy('强化学习、语言序列、图随机游走和 PageRank 都使用转移思想。', 'Reinforcement learning, language sequences, graph random walks, and PageRank use transition thinking.'),
    learningObjectives: [
      copy('解释马尔可夫性质。', 'Explain the Markov property.'),
      copy('把状态更新写成矩阵乘法。', 'Write state updates as matrix multiplication.'),
      copy('连接稳定分布与特征向量。', 'Connect stationary distributions to eigenvectors.'),
    ],
    sections: [
      {
        id: 'state-update',
        title: copy('状态如何流动', 'How state flows'),
        content: copy(
          md`如果 $\\mathbf{x}_k$ 表示当前概率分布，那么下一步可以写成：

$$
\mathbf{x}_{k+1}=P\mathbf{x}_k
$$

矩阵 $P$ 的每一列或每一行记录概率如何转移，约定要在实现里保持一致。`,
          md`If $\\mathbf{x}_k$ is the current probability distribution, the next step can be written:

$$
\mathbf{x}_{k+1}=P\mathbf{x}_k
$$

The matrix $P$ records how probability moves; the row or column convention must stay consistent.`,
        ),
      },
      {
        id: 'stationary',
        title: copy('长期分布', 'Long-run distribution'),
        content: copy(
          md`当某个分布满足 $P\mathbf{x}=\mathbf{x}$，它就是稳定分布。这也是特征值 $1$ 对应的特征向量视角。`,
          md`When a distribution satisfies $P\mathbf{x}=\mathbf{x}$, it is stationary. This is also the eigenvector view for eigenvalue $1$.`,
        ),
      },
    ],
    misconception: {
      id: 'markov-random',
      statement: copy('马尔可夫链表示完全没有结构的随机。', 'A Markov chain means randomness with no structure.'),
      correction: copy('它有明确转移结构，只是不依赖更早历史。', 'It has transition structure; it just ignores earlier history.'),
      example: copy('当前位置决定下一页跳转概率，而不是整段浏览历史。', 'The current page can determine next-click probabilities without the full browsing history.'),
    },
    quiz: {
      id: 'markov-update',
      prompt: copy('马尔可夫链一步更新通常由什么控制？', 'What usually controls one Markov chain update?'),
      correct: copy('转移矩阵', 'A transition matrix'),
      distractor: copy('泰勒余项', 'A Taylor remainder'),
      explanation: copy('转移矩阵保存状态间的概率流动。', 'The transition matrix stores probability flow between states.'),
      tag: 'markov-transition',
    },
    labComponents: ['NumericalMiniLab'],
  },
  {
    id: 'finite-difference-methods',
    order: 14,
    title: copy('有限差分', 'Finite Differences'),
    subtitle: copy('用函数值的变化近似导数和梯度。', 'Approximate derivatives and gradients from changes in function values.'),
    difficulty: 'intermediate',
    enhancementTier: 'core',
    accent: '#e26d3d',
    theme: '#fff0e8',
    prerequisites: ['taylor-series'],
    formula: "f^{\\prime}(x) \\approx \\frac{f(x+h)-f(x)}{h}",
    variables: [
      variable('h', '微小步长，过大和过小都会出问题。', 'Small step size; too large and too small both cause problems.'),
      variable("f'(x)", '目标导数。', 'The derivative being approximated.'),
    ],
    plainExplanation: copy('有限差分用“向右挪一点后变了多少”来估计斜率。', 'Finite differences estimate slope by asking how much the function changes after a small move.'),
    geometricIntuition: copy('割线逐渐靠近切线，但数值舍入会在步长过小时出现。', 'A secant approaches a tangent, but rounding appears when the step is too tiny.'),
    numericalExample: copy('用 $h=10^{-4}$ 估计 $\\sin x$ 的导数，结果会接近 $\\cos x$。', 'Using $h=10^{-4}$ to estimate the derivative of $\\sin x$ gives a value near $\\cos x$.'),
    codeExample: 'import numpy as np\n\ndef f(x): return np.sin(x)\nh = 1e-4\nx = 0.7\nprint((f(x + h) - f(x)) / h, np.cos(x))',
    modelConnection: copy('当自动微分不可用时，有限差分常用于梯度检查。', 'When automatic differentiation is unavailable, finite differences are useful for gradient checking.'),
    learningObjectives: [
      copy('比较前向、后向和中心差分。', 'Compare forward, backward, and central differences.'),
      copy('理解步长选择的误差权衡。', 'Understand the error tradeoff in choosing step size.'),
      copy('用数值梯度检查反向传播。', 'Use numerical gradients to check backpropagation.'),
    ],
    sections: [
      {
        id: 'difference-quotient',
        title: copy('从差商读斜率', 'Read slope from a quotient'),
        content: copy(
          md`最直接的导数近似是前向差分：

$$
f'(x) \approx \frac{f(x+h)-f(x)}{h}
$$

它只需要两次函数值，但精度受步长影响很大。`,
          md`The most direct derivative approximation is forward difference:

$$
f'(x) \approx \frac{f(x+h)-f(x)}{h}
$$

It only needs two function values, but accuracy depends heavily on step size.`,
        ),
      },
      {
        id: 'step-size',
        title: copy('步长不是越小越好', 'Smaller is not always better'),
        content: copy(
          md`$h$ 太大时是截断误差，$h$ 太小时是浮点舍入误差。好的数值方法往往在这两者之间找平衡。`,
          md`When $h$ is too large, truncation error dominates; when it is too small, floating-point rounding dominates. Good numerical methods balance the two.`,
        ),
      },
    ],
    misconception: {
      id: 'finite-h-small',
      statement: copy('差分步长越小，结果一定越准。', 'A smaller finite-difference step is always more accurate.'),
      correction: copy('过小的步长会放大舍入误差。', 'An overly small step amplifies rounding error.'),
      example: copy('两个几乎相等的浮点数相减会损失有效数字。', 'Subtracting nearly equal floating-point numbers loses significant digits.'),
    },
    quiz: {
      id: 'finite-step',
      prompt: copy('有限差分中步长 $h$ 太小时最容易出现什么？', 'What often appears when finite-difference step $h$ is too small?'),
      correct: copy('舍入误差变明显', 'Rounding error becomes visible'),
      distractor: copy('矩阵自动变稀疏', 'The matrix automatically becomes sparse'),
      explanation: copy('过小差值会触发浮点消减。', 'Tiny differences can trigger floating-point cancellation.'),
      tag: 'finite-difference-step',
    },
    labComponents: ['NumericalMiniLab'],
  },
  {
    id: 'nonlinear-equations',
    order: 15,
    title: copy('非线性方程', 'Nonlinear Equations'),
    subtitle: copy('用迭代方法寻找函数等于零的位置。', 'Use iterative methods to find where a function equals zero.'),
    difficulty: 'intermediate',
    enhancementTier: 'core',
    accent: '#be4b83',
    theme: '#fdebf4',
    prerequisites: ['finite-difference-methods'],
    formula: "x_{k+1}=x_k-\\frac{f(x_k)}{f^{\\prime}(x_k)}",
    variables: [
      variable('x_k', '当前猜测。', 'Current guess.'),
      variable('f(x_k)', '当前残差，表示离根还有多远。', 'Current residual, showing how far the guess is from a root.'),
    ],
    plainExplanation: copy('求根不是一次猜中，而是用函数值和斜率不断修正猜测。', 'Root finding is not guessing once; it repeatedly corrects a guess with value and slope.'),
    geometricIntuition: copy('牛顿法沿当前切线走到横轴，再把那里当成新猜测。', 'Newton method follows the current tangent to the x-axis, then uses that point as the next guess.'),
    numericalExample: copy('求 $x^2-2=0$ 的正根，会逐步靠近 $\\sqrt{2}$。', 'Solving $x^2-2=0$ approaches the positive root $\\sqrt{2}$.'),
    codeExample: 'x = 1.0\nfor _ in range(6):\n    x = x - (x * x - 2) / (2 * x)\nprint(x)',
    modelConnection: copy('校准概率、隐式层和部分优化器都包含非线性方程求解。', 'Probability calibration, implicit layers, and some optimizers include nonlinear solves.'),
    learningObjectives: [
      copy('解释残差如何指导迭代。', 'Explain how residuals guide iteration.'),
      copy('理解牛顿法为什么需要导数。', 'Understand why Newton method needs a derivative.'),
      copy('识别初值不好导致的失败。', 'Recognize failures from poor initial guesses.'),
    ],
    sections: [
      {
        id: 'root-as-target',
        title: copy('根是目标，不是终点直觉', 'A root is a target'),
        content: copy(
          md`我们想让 $f(x)=0$。牛顿法用当前点的切线预测下一步：

$$
x_{k+1}=x_k-\frac{f(x_k)}{f'(x_k)}
$$

如果局部线性近似可靠，迭代会快速靠近根。`,
          md`We want $f(x)=0$. Newton method uses the tangent at the current point to predict the next step:

$$
x_{k+1}=x_k-\frac{f(x_k)}{f'(x_k)}
$$

If the local linear approximation is reliable, the iteration moves quickly toward the root.`,
        ),
      },
      {
        id: 'failure-modes',
        title: copy('迭代会失败', 'Iteration can fail'),
        content: copy(
          md`导数接近 0、初始点太远、函数形状太复杂，都可能让迭代跳走。数值方法要同时关心公式和保护策略。`,
          md`A near-zero derivative, a distant starting point, or a difficult function shape can send iteration away. Numerical methods need formulas and safeguards.`,
        ),
      },
    ],
    misconception: {
      id: 'newton-always',
      statement: copy('牛顿法总能收敛。', 'Newton method always converges.'),
      correction: copy('它依赖初始点、导数和函数局部形状。', 'It depends on the starting point, derivative, and local function shape.'),
      example: copy('切线太平时，下一步可能跳得非常远。', 'When the tangent is too flat, the next step can jump very far.'),
    },
    quiz: {
      id: 'newton-uses',
      prompt: copy('牛顿法每一步主要使用哪两类信息？', 'What two pieces of information does Newton method mainly use each step?'),
      correct: copy('函数值和导数', 'Function value and derivative'),
      distractor: copy('样本图片和颜色', 'Sample image and color'),
      explanation: copy('函数值给残差，导数给局部修正方向。', 'The value gives residual; the derivative gives local correction direction.'),
      tag: 'newton-method',
    },
    labComponents: ['NumericalMiniLab'],
  },
  {
    id: 'optimization',
    order: 16,
    title: copy('优化与梯度下降', 'Optimization and Gradient Descent'),
    subtitle: copy('把目标函数看成地形，沿下降方向移动参数。', 'Treat the objective as terrain and move parameters downhill.'),
    difficulty: 'intermediate',
    enhancementTier: 'video',
    accent: '#f59e0b',
    theme: '#fff7df',
    prerequisites: ['taylor-series', 'finite-difference-methods'],
    formula: 'x_{k+1}=x_k-\\alpha \\nabla f(x_k)',
    variables: [
      variable('\\alpha', '学习率，也就是每一步的长度。', 'Learning rate, the length of each step.'),
      variable('\\nabla f(x_k)', '当前位置最快上升方向。', 'Fastest rising direction at the current point.'),
    ],
    plainExplanation: copy('梯度指向上坡，所以最小化时要往反方向走。', 'The gradient points uphill, so minimization walks the other way.'),
    geometricIntuition: copy('学习率太小会慢，太大会越过谷底。', 'A tiny learning rate is slow; a large one can overshoot the valley.'),
    numericalExample: copy('对 $f(x)=x^2$，从 $x=3$ 出发会逐步靠近 0。', 'For $f(x)=x^2$, starting at $x=3$ steps toward 0.'),
    codeExample: 'x = 3.0\nalpha = 0.2\nfor _ in range(8):\n    grad = 2 * x\n    x -= alpha * grad\nprint(x)',
    modelConnection: copy('几乎所有可微模型训练都可以读成某种优化过程。', 'Almost every differentiable model training loop can be read as optimization.'),
    learningObjectives: [
      copy('解释负梯度方向。', 'Explain the negative gradient direction.'),
      copy('理解学习率影响轨迹。', 'Understand how learning rate shapes the path.'),
      copy('区分局部最优和全局最优。', 'Distinguish local and global optima.'),
    ],
    sections: [
      {
        id: 'gradient-step',
        title: copy('一步更新', 'One update step'),
        content: copy(
          md`梯度下降的核心规则很短：

$$
x_{k+1}=x_k-\alpha\nabla f(x_k)
$$

$\nabla f$ 告诉我们哪里上升最快，负号把方向翻到下降最快的一侧。`,
          md`The core gradient descent rule is short:

$$
x_{k+1}=x_k-\alpha\nabla f(x_k)
$$

$\nabla f$ points fastest uphill, and the minus sign flips the direction downhill.`,
        ),
      },
      {
        id: 'learning-rate',
        title: copy('步长控制行为', 'Step size controls behavior'),
        content: copy(
          md`学习率不是越大越好。它决定优化器是在谷底附近细致移动，还是反复跨过低点。`,
          md`A larger learning rate is not automatically better. It decides whether the optimizer moves carefully near the valley or repeatedly jumps over it.`,
        ),
      },
    ],
    misconception: {
      id: 'gradient-smaller',
      statement: copy('减去梯度只是为了让参数数值变小。', 'Subtracting the gradient only makes parameter values smaller.'),
      correction: copy('减号表示沿目标函数下降方向移动，不是让每个参数都变小。', 'The minus sign moves downhill in the objective, not necessarily toward smaller parameter values.'),
      example: copy('某个参数可能在下降过程中变大，只要 loss 下降即可。', 'A parameter can increase during descent if that lowers the loss.'),
    },
    quiz: {
      id: 'gradient-direction',
      prompt: copy('为什么梯度下降要减去梯度？', 'Why does gradient descent subtract the gradient?'),
      correct: copy('梯度指向最快上升方向', 'The gradient points fastest uphill'),
      distractor: copy('减号会自动消除所有噪声', 'The minus sign automatically removes all noise'),
      explanation: copy('最小化要沿上升方向的反方向移动。', 'Minimization moves opposite the rising direction.'),
      tag: 'negative-gradient',
    },
    labComponents: ['MathGradientLab'],
    visuals: [
      manimAsset(
        'gradient-descent-video',
        copy('梯度下降轨迹', 'Gradient descent trajectory'),
        '/manim/math-lab/gradient-descent.mp4',
        '/manim/math-lab/gradient-descent.svg',
        copy('轨迹沿着等高线的负梯度方向移动，步长影响是否稳定。', 'The path follows negative gradient directions across contours, and step size controls stability.'),
      ),
    ],
  },
  {
    id: 'least-squares-fitting',
    order: 17,
    title: copy('最小二乘拟合', 'Least-Squares Fitting'),
    subtitle: copy('用残差平方和把数据拟合写成优化问题。', 'Turn data fitting into optimization with squared residuals.'),
    difficulty: 'intermediate',
    enhancementTier: 'interactive',
    accent: '#2563eb',
    theme: '#edf4ff',
    prerequisites: ['optimization', 'vectors-matrices-norms'],
    formula: '\\min_x \\|Ax-b\\|_2^2',
    variables: [
      variable('A', '设计矩阵，包含输入特征。', 'Design matrix containing input features.'),
      variable('b', '观测目标。', 'Observed targets.'),
    ],
    plainExplanation: copy('最小二乘寻找让预测和观测整体差距最小的参数。', 'Least squares finds parameters that make predictions closest to observations overall.'),
    geometricIntuition: copy('预测落在模型能表达的子空间里，残差是到观测点的剩余距离。', 'Predictions live in the model subspace; residuals are the remaining distance to observations.'),
    numericalExample: copy('给散点拟合直线时，斜率和截距由所有残差共同决定。', 'When fitting a line to points, slope and intercept are decided by all residuals together.'),
    codeExample: 'import numpy as np\n\nA = np.array([[1, 1], [1, 2], [1, 3]])\nb = np.array([1.1, 1.9, 3.2])\nprint(np.linalg.lstsq(A, b, rcond=None)[0])',
    modelConnection: copy('线性回归、投影、校准和许多监督学习损失都从这里开始。', 'Linear regression, projection, calibration, and many supervised losses start here.'),
    learningObjectives: [
      copy('把残差写成向量。', 'Write residuals as a vector.'),
      copy('解释为什么平方会放大离群点。', 'Explain why squaring amplifies outliers.'),
      copy('连接几何投影和正规方程。', 'Connect geometric projection to normal equations.'),
    ],
    sections: [
      {
        id: 'residual-vector',
        title: copy('残差向量', 'Residual vector'),
        content: copy(
          md`拟合不是让每个点都完美命中，而是让残差向量整体尽量短：

$$
r = Ax-b,\qquad \min_x \|r\|_2^2
$$

平方让大误差更显眼，也让优化目标平滑。`,
          md`Fitting does not make every point perfect; it tries to make the residual vector short:

$$
r = Ax-b,\qquad \min_x \|r\|_2^2
$$

Squaring highlights large errors and gives a smooth objective.`,
        ),
      },
      {
        id: 'projection-view',
        title: copy('投影视角', 'Projection view'),
        content: copy(
          md`线性最小二乘可以看成把 $b$ 投影到 $A$ 的列空间。预测是模型能表达的最近点，残差垂直于这个空间。`,
          md`Linear least squares can be read as projecting $b$ onto the column space of $A$. The prediction is the closest expressible point, and the residual is orthogonal to that space.`,
        ),
      },
    ],
    misconception: {
      id: 'least-squares-perfect',
      statement: copy('最小二乘一定会穿过所有数据点。', 'Least squares always passes through every data point.'),
      correction: copy('它寻找整体残差最小的可表达解。', 'It finds the expressible solution with the smallest overall residual.'),
      example: copy('有噪声的数据通常无法被一条直线全部命中。', 'Noisy data usually cannot be hit exactly by one line.'),
    },
    quiz: {
      id: 'least-squares-objective',
      prompt: copy('最小二乘最小化的核心量是什么？', 'What is the core quantity minimized by least squares?'),
      correct: copy('残差平方和', 'The sum of squared residuals'),
      distractor: copy('样本编号之和', 'The sum of sample indexes'),
      explanation: copy('残差衡量预测和观测之间的差。', 'Residuals measure the gap between prediction and observation.'),
      tag: 'least-squares-residual',
    },
    labComponents: ['NumericalMiniLab'],
  },
  {
    id: 'svd',
    order: 18,
    title: copy('奇异值分解', 'Singular Value Decomposition'),
    subtitle: copy('把任意矩阵拆成方向、强度和方向的组合。', 'Decompose any matrix into directions, strengths, and directions.'),
    difficulty: 'advanced',
    enhancementTier: 'interactive',
    accent: '#7048e8',
    theme: '#f1edff',
    prerequisites: ['eigenvalues-eigenvectors', 'least-squares-fitting'],
    formula: 'A = U\\Sigma V^T',
    variables: [
      variable('U,V', '输入和输出空间中的正交方向。', 'Orthogonal directions in output and input spaces.'),
      variable('\\Sigma', '奇异值，表示每个方向的强度。', 'Singular values, showing the strength of each direction.'),
    ],
    plainExplanation: copy('SVD 把矩阵看成先旋转、再按方向缩放、再旋转。', 'SVD reads a matrix as rotate, scale by direction, then rotate again.'),
    geometricIntuition: copy('奇异值越大，对应方向保留的信息越强。', 'A larger singular value means the corresponding direction carries stronger information.'),
    numericalExample: copy('保留最大的几个奇异值，就能做低秩近似。', 'Keeping the largest singular values gives a low-rank approximation.'),
    codeExample: 'import numpy as np\n\nA = np.array([[3., 1.], [1., 3.], [1., 0.]])\nU, S, Vt = np.linalg.svd(A, full_matrices=False)\nprint(S)',
    modelConnection: copy('降维、压缩、推荐系统和权重分析都会用到 SVD。', 'Dimensionality reduction, compression, recommenders, and weight analysis use SVD.'),
    learningObjectives: [
      copy('解释 $U,\\Sigma,V^T$ 各自负责什么。', 'Explain what $U,\\Sigma,V^T$ each do.'),
      copy('理解奇异值和信息强度的关系。', 'Understand singular values as information strength.'),
      copy('用低秩近似描述压缩。', 'Describe compression with low-rank approximation.'),
    ],
    sections: [
      {
        id: 'three-parts',
        title: copy('三个部分', 'Three parts'),
        content: copy(
          md`SVD 写成：

$$
A = U\Sigma V^T
$$

$V^T$ 先选择输入方向，$\Sigma$ 按强度缩放，$U$ 把结果放到输出空间。`,
          md`SVD is written:

$$
A = U\Sigma V^T
$$

$V^T$ chooses input directions, $\Sigma$ scales by strength, and $U$ places the result in output space.`,
        ),
      },
      {
        id: 'low-rank',
        title: copy('低秩近似', 'Low-rank approximation'),
        content: copy(
          md`如果只保留前 $k$ 个最大奇异值，就得到 $A_k$。它牺牲细节，换来更小的表示和更稳定的结构。`,
          md`Keeping only the top $k$ singular values gives $A_k$. It trades detail for a smaller representation and more stable structure.`,
        ),
      },
    ],
    misconception: {
      id: 'svd-square',
      statement: copy('SVD 只适用于方阵。', 'SVD only works for square matrices.'),
      correction: copy('SVD 可以用于任意矩形矩阵。', 'SVD works for rectangular matrices too.'),
      example: copy('用户物品矩阵通常是矩形，也常用 SVD 分析。', 'User-item matrices are usually rectangular and are often analyzed with SVD.'),
    },
    quiz: {
      id: 'svd-strength',
      prompt: copy('SVD 中奇异值主要表示什么？', 'What do singular values mainly represent in SVD?'),
      correct: copy('不同方向上的缩放强度', 'Scaling strength along different directions'),
      distractor: copy('分类标签名称', 'Class label names'),
      explanation: copy('奇异值越大，该方向越重要。', 'A larger singular value means a more important direction.'),
      tag: 'svd-singular-values',
    },
    labComponents: ['NumericalMiniLab'],
  },
  {
    id: 'pca',
    order: 19,
    title: copy('主成分分析', 'Principal Component Analysis'),
    subtitle: copy('沿方差最大的方向重新表达数据。', 'Re-express data along directions of largest variance.'),
    difficulty: 'advanced',
    enhancementTier: 'interactive',
    accent: '#0f766e',
    theme: '#e6fbf6',
    prerequisites: ['svd'],
    formula: 'Z = X V_k',
    variables: [
      variable('X', '中心化后的数据矩阵。', 'Centered data matrix.'),
      variable('V_k', '保留的前 k 个主方向。', 'The top k retained principal directions.'),
    ],
    plainExplanation: copy('PCA 不是分类器，它只寻找数据自身变化最大的方向。', 'PCA is not a classifier; it finds where the data itself varies most.'),
    geometricIntuition: copy('把坐标轴转到数据云最舒展的方向，再决定保留几个轴。', 'Rotate axes toward the widest spread of the data cloud, then decide how many axes to keep.'),
    numericalExample: copy('二维数据如果大多沿一条斜线展开，第一主成分就会接近那条斜线。', 'If 2D data mostly stretches along one diagonal, the first component follows that diagonal.'),
    codeExample: 'import numpy as np\n\nX = np.array([[1, 2], [2, 3], [3, 5]], dtype=float)\nX = X - X.mean(axis=0)\n_, _, Vt = np.linalg.svd(X, full_matrices=False)\nprint(X @ Vt[:1].T)',
    modelConnection: copy('可视化 embedding、压缩特征和检查数据冗余时经常会用 PCA。', 'PCA is common for visualizing embeddings, compressing features, and checking redundancy.'),
    learningObjectives: [
      copy('解释为什么 PCA 要先中心化。', 'Explain why PCA centers data first.'),
      copy('理解主方向与方差的关系。', 'Understand principal directions as variance directions.'),
      copy('区分降维和监督分类。', 'Distinguish dimensionality reduction from supervised classification.'),
    ],
    sections: [
      {
        id: 'variance-directions',
        title: copy('方差方向', 'Variance directions'),
        content: copy(
          md`中心化数据后，PCA 寻找方差最大的方向，并把数据投影过去：

$$
Z = X V_k
$$

这里 $V_k$ 是保留下来的前 $k$ 个主方向。`,
          md`After centering data, PCA finds high-variance directions and projects onto them:

$$
Z = X V_k
$$

Here $V_k$ contains the top $k$ retained principal directions.`,
        ),
      },
      {
        id: 'interpretation',
        title: copy('降维的代价', 'The cost of reduction'),
        content: copy(
          md`PCA 保留的是方差信息，不是标签信息。它能让数据更紧凑，但新的坐标轴可能不再有原始特征那样清晰的语义。`,
          md`PCA keeps variance information, not label information. It makes data compact, but the new axes may be less interpretable than original features.`,
        ),
      },
    ],
    misconception: {
      id: 'pca-classifier',
      statement: copy('PCA 会自动找到最能分类的方向。', 'PCA automatically finds the best classification direction.'),
      correction: copy('PCA 不看标签，只看方差。', 'PCA ignores labels and only sees variance.'),
      example: copy('方差最大的方向不一定最能区分类别。', 'The highest-variance direction may not separate classes best.'),
    },
    quiz: {
      id: 'pca-uses',
      prompt: copy('PCA 选择主方向时主要看什么？', 'What does PCA mainly use when choosing principal directions?'),
      correct: copy('数据方差', 'Data variance'),
      distractor: copy('人工标签颜色', 'Manual label colors'),
      explanation: copy('主成分按解释方差从大到小排列。', 'Principal components are ordered by explained variance.'),
      tag: 'pca-variance',
    },
    labComponents: ['NumericalMiniLab'],
  },
]

export const mathFoundationsModules: MathLabModule[] = seeds.map((seed, index) => {
  const toc = seed.sections.map((section) => ({
    id: section.id,
    level: 2 as const,
    title: section.title,
  }))

  return {
    id: seed.id,
    enhancementTier: seed.enhancementTier,
    order: seed.order,
    title: seed.title,
    subtitle: seed.subtitle,
    difficulty: seed.difficulty,
    estimatedMinutes: seed.difficulty === 'advanced' ? 32 : seed.difficulty === 'intermediate' ? 26 : 20,
    prerequisites: seed.prerequisites ?? [],
    aiModelConnections: [
      seed.modelConnection,
      copy('把这一章当成后续机器学习模块的数学地基。', 'Use this chapter as mathematical groundwork for the later machine-learning modules.'),
    ],
    learningObjectives: seed.learningObjectives,
    concepts: [
      {
        id: `${seed.id}-core`,
        name: seed.title,
        formulaLatex: seed.formula,
        variables: seed.variables,
        plainExplanation: seed.plainExplanation,
        geometricIntuition: seed.geometricIntuition,
        numericalExample: seed.numericalExample,
        codeExample: seed.codeExample,
        modelConnection: seed.modelConnection,
      },
    ],
    sections: seed.sections.map((section) => ({
      id: section.id,
      level: 2,
      title: section.title,
      content: section.content,
    })),
    toc,
    visuals: seed.visuals ?? [],
    labs: (seed.labComponents ?? ['NumericalMiniLab']).map((componentName) => labConfig(seed.id, componentName)),
    quizzes: [
      {
        id: seed.quiz.id,
        type: 'single-choice',
        prompt: seed.quiz.prompt,
        choices: [
          { id: 'correct', label: seed.quiz.correct },
          { id: 'distractor', label: seed.quiz.distractor },
        ],
        answer: 'correct',
        explanation: seed.quiz.explanation,
        misconceptionTags: [seed.quiz.tag],
      },
    ],
    misconceptions: [seed.misconception],
    nextModuleIds: seeds[index + 1] ? [seeds[index + 1].id] : [],
    accent: seed.accent,
    theme: seed.theme,
  }
})
