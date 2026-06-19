import type {
  LabConfig,
  LocalizedCopy,
  MathConcept,
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

function section(
  id: string,
  title: LocalizedCopy,
  content: LocalizedCopy,
  placements: Pick<MathLabSection, 'visualIds' | 'labIds'> = {},
): MathLabSection {
  return { id, level: 2, title, content, ...placements }
}

function variable(symbol: string, zh: string, en: string) {
  return { symbol, description: copy(zh, en) }
}

function concept(
  id: string,
  name: LocalizedCopy,
  formulaLatex: string,
  variables: MathConcept['variables'],
  plainExplanation: LocalizedCopy,
  geometricIntuition: LocalizedCopy,
  numericalExample: LocalizedCopy,
  modelConnection: LocalizedCopy,
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

function imageAsset(id: string, filename: string, title: LocalizedCopy, transcript: LocalizedCopy): VisualAsset {
  return {
    id,
    type: 'image',
    title,
    assetPath: `/math-lab/generated/${filename}`,
    transcript,
    alt: transcript,
    caption: transcript,
    learningPurpose: copy(
      '作为零基础章节的视觉锚点，先建立直觉，再进入公式和实验。',
      'Serve as a beginner visual anchor before formulas and labs.',
    ),
  }
}

function manimAsset(id: string, filename: string, title: LocalizedCopy, transcript: LocalizedCopy): VisualAsset {
  return {
    id,
    type: 'manim-video',
    title,
    assetPath: `/manim/math-lab/${filename}.mp4`,
    posterPath: `/manim/math-lab/${filename}.svg`,
    transcript,
    alt: transcript,
    caption: transcript,
    learningPurpose: copy(
      '用短动画展示静态图难以表达的连续变化过程。',
      'Use a short animation to show the process behind the static diagram.',
    ),
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
  revisitVisualId?: string,
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
    revisitVisualId,
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

const sources = {
  eola: {
    label: copy('3Blue1Brown：线性代数的本质', '3Blue1Brown: Essence of Linear Algebra'),
    href: 'https://www.3blue1brown.com/topics/linear-algebra',
    usage: copy('参考“把矩阵看成空间变换”的视觉组织方式。', 'Reference for organizing matrices as transformations of space.'),
  },
  calculus: {
    label: copy('3Blue1Brown：微积分的本质', '3Blue1Brown: Essence of Calculus'),
    href: 'https://www.3blue1brown.com/topics/calculus',
    usage: copy('参考“局部变化率”和“贴近曲线的线”这类视觉直觉。', 'Reference for local rates of change and tangent-line intuition.'),
  },
  seeingTheory: {
    label: copy('Seeing Theory：概率分布', 'Seeing Theory: Probability Distributions'),
    href: 'https://seeing-theory.brown.edu/probability-distributions/index.html',
    usage: copy('参考用重复采样和分布形状解释概率的交互方式。', 'Reference for explaining probability through repeated samples and distribution shapes.'),
  },
  statQuest: {
    label: copy('StatQuest：统计学基础视频索引', 'StatQuest: Statistics Fundamentals Video Index'),
    href: 'https://statquest.org/video_index.html',
    usage: copy('参考把术语拆成小步例子的讲解节奏。', 'Reference for the small-step explanation rhythm for statistical vocabulary.'),
  },
  d2l: {
    label: copy('Dive into Deep Learning：预备知识', 'Dive into Deep Learning: Preliminaries'),
    href: 'https://d2l.ai/chapter_preliminaries/index.html',
    license: 'CC BY-SA 4.0',
    usage: copy('校准 AI 数学预备知识的覆盖范围。', 'Calibrate the scope of AI math preliminaries.'),
  },
  mml: {
    label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'),
    href: 'https://mml-book.github.io/',
    usage: copy('校准线代、微积分、概率与机器学习之间的边界。', 'Calibrate boundaries between linear algebra, calculus, probability, and machine learning.'),
  },
} satisfies Record<string, SourceReference>

function moduleDefinition(input: Omit<MathLabModule, 'order' | 'toc' | 'nextModuleIds' | 'sourceNoteFile' | 'importedAssetPaths'>): MathLabModule {
  return {
    ...input,
    order: 0,
    toc: input.sections.map((item) => ({ id: item.id, level: item.level, title: item.title })),
    nextModuleIds: [],
    sourceNoteFile: 'math-lab-beginner-bridge-sources.md',
    importedAssetPaths: input.visuals
      .flatMap((visual) => [visual.assetPath, visual.posterPath])
      .filter((path): path is string => Boolean(path)),
  }
}

const linearSections = [
  section(
    'beginner-linear-data-vector',
    copy('第一步：数据怎样变成向量', 'Step 1: How Data Becomes a Vector'),
    copy(
      md`先把“向量”想成一张有方向的特征卡。一个学生的学习记录可以写成 \([2,5,80]\)：本周练习 2 次、错 5 题、测验 80 分。一张图片可以写成很多像素值，一句话可以写成 embedding，一个房子可以写成面积、房龄、位置等特征。**data becomes a vector** 的意思不是把现实变成抽象符号，而是把同一个对象的多个观察值放进同一个坐标空间。

向量回答的是：一个对象在每个特征方向上走了多少。如果只有两个特征，例如练习次数和错题数，我们可以把 \([2,5]\) 画成平面上的点，也可以画成从原点出发的箭头。箭头的方向表示“这个样本偏向哪里”，箭头的长度表示“这个样本整体有多大”。当特征更多时，我们画不出全部维度，但同样的规则仍然成立：每个数字回答同一个样本沿某个特征方向走了多少。

向量最有用的地方是可以做比较。两个学习记录 \(\mathbf{x}=[2,5,80]\)、\(\mathbf{y}=[3,4,82]\) 的差是 \(\mathbf{y}-\mathbf{x}=[1,-1,2]\)。这不是三个孤立数字，而是“多练一次、少错一题、分数高两分”的变化方向。AI 模型训练、推荐系统、图像检索和文本检索都在反复处理这样的方向与距离。`,
      md`Think of a vector as a feature card with direction. A learner record might be \([2,5,80]\): two practice sessions, five mistakes, and a quiz score of 80. An image can become pixel values, a sentence can become an embedding, and a house can become features such as size, age, and location. **Data becomes a vector** does not mean reality disappears into symbols. It means several observations about the same object are placed in one coordinate space.

A vector answers: how far did one object move along each feature direction? With only two features, such as practice count and mistakes, \([2,5]\) can be drawn as a point on a plane or as an arrow from the origin. The arrow direction tells where the example leans; its length tells how large the whole feature package is. When there are more features, the picture is harder to draw, but the rule is unchanged: each number says how far this same example moves along one feature axis.

The useful move is comparison. For two learner records \(\mathbf{x}=[2,5,80]\) and \(\mathbf{y}=[3,4,82]\), the difference is \(\mathbf{y}-\mathbf{x}=[1,-1,2]\). That is not three isolated numbers; it is the change direction "one more practice session, one fewer mistake, two more score points." Model training, recommendation systems, image retrieval, and text retrieval keep reusing this language of direction and distance.`,
    ),
    { visualIds: ['beginner-linear-algebra-story', 'beginner-vector-feature-space-longform'] },
  ),
  section(
    'beginner-linear-distance-similarity',
    copy('第二步：长度、距离和相似度', 'Step 2: Length, Distance, and Similarity'),
    copy(
      md`向量长度可以先用勾股定理理解。二维向量 \((3,4)\) 的长度是

$$
\|\mathbf{x}\|_2=\sqrt{3^2+4^2}=5.
$$

如果两个向量之间的差很短，它们的位置接近；如果夹角很小，它们的方向接近。距离和方向不是同一件事。两个学生的分数规模可能都很高，但学习模式不同；两个句子的 embedding 长度可能不同，但方向很接近，语义就可能接近。

点积把“长度”和“夹角”放进同一个数：

$$
\mathbf{x}^{\top}\mathbf{y}=\|\mathbf{x}\|\,\|\mathbf{y}\|\cos\theta.
$$

如果我们只关心方向，就把长度除掉，得到 cosine similarity。文本检索里常说“找最相似的 embedding”，本质就是找方向最接近的向量。`,
      md`Vector length can start from the Pythagorean theorem. The two-dimensional vector \((3,4)\) has length

$$
\|\mathbf{x}\|_2=\sqrt{3^2+4^2}=5.
$$

If the difference between two vectors is short, their positions are close. If their angle is small, their directions are close. Distance and direction are not the same idea. Two learners may both have large scores but different learning patterns; two sentence embeddings may have different lengths but very close directions, which can indicate similar meaning.

The dot product places length and angle into one number:

$$
\mathbf{x}^{\top}\mathbf{y}=\|\mathbf{x}\|\,\|\mathbf{y}\|\cos\theta.
$$

If we only care about direction, we divide away length and get cosine similarity. When text retrieval searches for the most similar embedding, it is often searching for vectors that point in nearby directions.`,
    ),
    { visualIds: ['beginner-vector-distance-similarity-longform'], labIds: ['beginner-feature-vector-story-lab'] },
  ),
  section(
    'beginner-linear-combination-span',
    copy('第三步：线性组合和 span', 'Step 3: Linear Combination and Span'),
    copy(
      md`线性代数的核心动作是“按比例混合方向”。给定两个方向 \(\mathbf{v}_1,\mathbf{v}_2\)，我们可以写

$$
c_1\mathbf{v}_1+c_2\mathbf{v}_2.
$$

这里 \(c_1,c_2\) 是混合比例。把所有可能比例都试一遍，能到达的区域叫做 span。两支方向不同的箭头通常能铺满一个平面；如果一支只是另一支的倍数，它们只能覆盖一条线。这个直觉会在神经网络里反复出现：线性层不是凭空创造特征，而是在把已有输入方向重新混合。

手算例子：\(\mathbf{v}_1=[2,1]\)、\(\mathbf{v}_2=[-1,1]\)，则 \(3\mathbf{v}_1+2\mathbf{v}_2=[4,5]\)。这句话比“数组相加”更有几何含义：我们沿第一个方向走 3 份，再沿第二个方向走 2 份，最后到达一个新位置。`,
      md`The core action in linear algebra is "mix directions by proportions." Given two directions \(\mathbf{v}_1,\mathbf{v}_2\), we can write

$$
c_1\mathbf{v}_1+c_2\mathbf{v}_2.
$$

The numbers \(c_1,c_2\) are mixing weights. The set of every place reachable by all possible weights is called the span. Two arrows with different directions usually cover a plane; if one is just a multiple of the other, they cover only a line. This intuition appears again in neural networks: a linear layer does not create features from nowhere; it remixes existing input directions.

Worked example: if \(\mathbf{v}_1=[2,1]\) and \(\mathbf{v}_2=[-1,1]\), then \(3\mathbf{v}_1+2\mathbf{v}_2=[4,5]\). This is more geometric than "add arrays": walk three copies along the first direction, then two copies along the second, and you arrive at a new place.`,
    ),
    { visualIds: ['beginner-linear-combination-span-longform'] },
  ),
  section(
    'beginner-linear-matrix-machine',
    copy('第四步：把矩阵看成空间机器', 'Step 4: A Matrix as a Space Machine'),
    copy(
      md`矩阵最容易被误读成表格。更好的入门图像是：**matrix as a space machine**。矩阵回答的是：多个输入特征如何被加权混合成新的表达。一个 \(2\times2\) 矩阵的两列告诉我们原来的横轴和纵轴会被送到哪里。于是整个网格会跟着拉伸、旋转、剪切或压扁。

例如

$$
A=\begin{bmatrix}2&1\\0&3\end{bmatrix},\qquad \mathbf{x}=\begin{bmatrix}4\\-1\end{bmatrix}.
$$

按列阅读时，

$$
A\mathbf{x}=4\begin{bmatrix}2\\0\end{bmatrix}-1\begin{bmatrix}1\\3\end{bmatrix}=\begin{bmatrix}7\\-3\end{bmatrix}.
$$

神经网络里的线性层 \(W\mathbf{x}+\mathbf{b}\) 就是在做类似事情：\(W\) 负责混合和变形，\(\mathbf{b}\) 负责平移。后面的激活函数再把直线边界弯成更复杂的边界。`,
      md`Matrices are often misread as tables. The better first picture is **matrix as a space machine**. A matrix answers: how are multiple input features weighted and mixed into a new representation? In a \(2\times2\) matrix, the two columns tell where the old horizontal and vertical axes go. The whole grid then stretches, rotates, shears, or flattens with those axes.

For example,

$$
A=\begin{bmatrix}2&1\\0&3\end{bmatrix},\qquad \mathbf{x}=\begin{bmatrix}4\\-1\end{bmatrix}.
$$

Read by columns:

$$
A\mathbf{x}=4\begin{bmatrix}2\\0\end{bmatrix}-1\begin{bmatrix}1\\3\end{bmatrix}=\begin{bmatrix}7\\-3\end{bmatrix}.
$$

A neural-network linear layer \(W\mathbf{x}+\mathbf{b}\) does a related job: \(W\) mixes and transforms, while \(\mathbf{b}\) shifts. Later activation functions bend straight boundaries into more complex boundaries.`,
    ),
    { visualIds: ['beginner-matrix-transform-longform'] },
  ),
  section(
    'beginner-linear-ai-path',
    copy('第五步：它怎样服务 AI', 'Step 5: How This Serves AI'),
    copy(
      md`AI 里许多看似高级的对象都能先用向量和矩阵读懂。embedding 是向量，所以可以比较距离和方向；attention 用点积比较 query 和 key 的相似度；线性层用矩阵混合特征；正则化会惩罚过大的权重范数；梯度也是向量，所以训练时可以沿它的反方向移动。

零基础学习时，不必一次记住所有名称。先保留三句检查表：

1. 这个对象是不是一排特征？如果是，先把它看成向量。
2. 这个操作是不是把一排特征变成另一排特征？如果是，先找矩阵怎样移动方向。
3. 这个问题是不是在比较“多远”或“多像”？如果是，先看距离、长度、点积或 cosine similarity。

后面的 SVD、PCA、Transformer 和优化章节都会用到这三句。`,
      md`Many advanced-looking AI objects can first be read with vectors and matrices. An embedding is a vector, so distance and direction can compare it. Attention uses dot products to compare queries and keys. Linear layers use matrices to mix features. Regularization penalizes large weight norms. Gradients are vectors too, so training can move opposite to them.

As a beginner, do not try to memorize every name at once. Keep this checklist:

1. Is this object a row of features? If yes, read it as a vector first.
2. Does this operation turn one row of features into another? If yes, ask how the matrix moves directions.
3. Is this question comparing "how far" or "how similar"? If yes, start with distance, length, dot product, or cosine similarity.

Later chapters on SVD, PCA, Transformers, and optimization all reuse this checklist.`,
    ),
  ),
  section(
    'beginner-linear-checkpoint',
    copy('复习问题', 'Review Questions'),
    copy(
      md`看完本章后，尝试用自己的话回答下面的问题。不要只背术语，要把每个答案都说回“特征空间里的方向、长度、混合和变形”。

1. 为什么 \([2,5]\) 不是两个抽屉，而是同一个样本在两个方向上的坐标？
2. 如果两个学习记录相减得到 \([1,-1]\)，这表示哪种变化方向？
3. 为什么距离短表示位置接近，而 cosine similarity 高表示方向接近？这两件事为什么不能混为一谈？
4. 点积公式 \(\mathbf{x}^{\top}\mathbf{y}=\|\mathbf{x}\|\,\|\mathbf{y}\|\cos\theta\) 里，长度和夹角各自扮演什么角色？
5. 线性组合 \(c_1\mathbf{v}_1+c_2\mathbf{v}_2\) 为什么可以解释“用几个基础方向到达新位置”？
6. 矩阵的列向量为什么可以看成新坐标轴？矩阵乘向量为什么不是逐项相乘？
7. 神经网络线性层 \(W\mathbf{x}+\mathbf{b}\) 中，\(W\) 和 \(\mathbf{b}\) 分别在做什么？
8. embedding 检索、attention 点积和梯度更新分别复用了本章哪些直觉？

额外练习：自己设计一个三维特征向量，例如“每天阅读分钟数、错题数量、复习间隔天数”。先写出两个样本，再计算它们的差向量，并用自然语言解释每个分量。然后思考：如果某个矩阵把“阅读分钟数”和“复习间隔”混合到同一个新特征里，这个新特征可能代表什么学习状态？这个练习的目的不是算得很复杂，而是把“数字列表、空间位置、变化方向、矩阵混合”连成一个故事。

如果这些问题能讲清楚，就可以进入更正式的“向量、矩阵与范数”章节。遇到新公式时，先问它在比较距离、读方向，还是在混合空间。`,
      md`After this chapter, answer the questions below in your own words. Do not only memorize terms; connect every answer back to directions, lengths, mixing, and transforms in feature space.

1. Why is \([2,5]\) one sample coordinate in two directions rather than two separate boxes?
2. If two learner records subtract to \([1,-1]\), what change direction does that represent?
3. Why does short distance mean nearby position, while high cosine similarity means nearby direction? Why should those ideas not be merged?
4. In \(\mathbf{x}^{\top}\mathbf{y}=\|\mathbf{x}\|\,\|\mathbf{y}\|\cos\theta\), what roles do length and angle play?
5. Why can a linear combination \(c_1\mathbf{v}_1+c_2\mathbf{v}_2\) explain reaching a new position with a few base directions?
6. Why can matrix columns be read as new coordinate axes? Why is matrix-vector multiplication not element-by-element multiplication?
7. In a neural-network layer \(W\mathbf{x}+\mathbf{b}\), what do \(W\) and \(\mathbf{b}\) do?
8. Which intuitions from this chapter reappear in embedding retrieval, attention dot products, and gradient updates?

If those answers make sense, move into the formal vectors, matrices, and norms chapter. When you meet a new formula, first ask whether it compares distance, reads direction, or mixes space.`,
    ),
  ),
]

const calculusSections = [
  section(
    'beginner-calculus-input-output',
    copy('第一步：函数是一台输入输出机器', 'Step 1: A Function Is an Input-Output Machine'),
    copy(
      md`微积分先不要从长公式开始。函数可以先理解成一台输入输出机器：你给它一个 \(x\)，它返回一个 \(y=f(x)\)。函数回答的是：输入改变时输出按什么规则改变。如果把输入轻轻改一点，输出也会跟着变。微积分最关心的问题就是：**变化有多快？方向是什么？这个局部信息能不能预测附近的结果？**

平均变化率比较两个位置：

$$
\frac{f(x+h)-f(x)}{h}.
$$

它像是在问“从 \(x\) 到 \(x+h\) 这段路平均每走一步，高度变多少”。如果 \(h\) 很大，这个平均值会掩盖中间细节；如果 \(h\) 很小，它就更接近当前位置附近的变化。

这一章的目标不是把大学微积分全部讲完，而是给 AI 训练够用的第一层语言：函数、局部变化、梯度、链式法则、学习率和数值检查。学完后你应该能读懂“为什么模型要算梯度”，但更完整的 Jacobian、VJP、Hessian 和自动微分细节会在后续章节继续展开。`,
      md`Do not start calculus with long formulas. A function can first be understood as an input-output machine: you give it \(x\), and it returns \(y=f(x)\). A function answers: by what rule does the output change when the input changes? If the input moves a little, the output moves too. Calculus asks: **how fast is the change, which direction does it point, and can this local information predict nearby results?**

The average change compares two positions:

$$
\frac{f(x+h)-f(x)}{h}.
$$

It asks, "from \(x\) to \(x+h\), how much does the height change per step on average?" If \(h\) is large, the average hides details in the middle. If \(h\) is small, it better describes what is happening near the current point.

This chapter is not the whole university calculus course. It is the first AI-ready layer: functions, local change, gradients, chain rule, learning rate, and numerical checks. After it, you should understand why model training computes gradients, while deeper Jacobian, VJP, Hessian, and autodiff details continue in later chapters.`,
    ),
    { visualIds: ['beginner-calculus-story', 'beginner-function-machine-longform'] },
  ),
  section(
    'beginner-calculus-average-instant',
    copy('第二步：从平均变化到瞬时变化', 'Step 2: From Average Change to Instantaneous Change'),
    copy(
      md`想象一辆小车沿弯路前进。全程平均速度有用，但如果你想知道“此刻”车正快慢如何，就要把观察窗口缩小。平均变化率变成瞬时变化率的过程，就是让 \(h\) 越来越接近 0：

$$
f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h}.
$$

导数回答的是：在当前点附近，输入动一点，输出会动多少。导数就是此刻速度。这里的“速度”不只适用于位置，也适用于任何输入输出关系：输入稍微变大，输出是在上升、下降，还是几乎不变？上升或下降得快不快？`,
      md`Imagine a small car moving along a curved road. The average speed for the whole trip is useful, but if you want to know the speed "right now," the observation window must shrink. The average rate of change becomes the instantaneous rate of change by letting \(h\) approach 0:

$$
f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h}.
$$

The derivative answers: near the current point, how much does the output move when the input moves a little? The derivative is current speed. That "speed" is not only for position. It applies to any input-output relationship: if the input moves slightly, does the output rise, fall, or barely change? How fast does it rise or fall?`,
    ),
    { visualIds: ['beginner-average-to-derivative-longform', 'beginner-derivative-window-longform', 'beginner-derivative-window-video'], labIds: ['beginner-local-change-story-lab'] },
  ),
  section(
    'beginner-calculus-tangent-gradient',
    copy('第三步：切线、斜率和梯度', 'Step 3: Tangent, Slope, and Gradient'),
    copy(
      md`在图像上，导数表现为切线斜率。切线不是整条曲线，它只贴住当前点附近。斜率为正，说明往右一点输出会上升；斜率为负，说明往右一点输出会下降；斜率接近 0，说明附近比较平。

如果输入不是一个数字，而是一整组模型参数 \(\theta=[\theta_1,\theta_2,\ldots]\)，每个方向都有自己的变化率。把所有方向的变化率收集起来，就是梯度：

$$
\nabla L(\theta)=\left[\frac{\partial L}{\partial \theta_1},\frac{\partial L}{\partial \theta_2},\ldots\right].
$$

梯度指向 loss 上升最快的方向；训练模型想让 loss 下降，所以沿负梯度方向走。`,
      md`On a graph, a derivative appears as tangent slope. A tangent is not the whole curve; it only touches the current neighborhood. A positive slope means the output rises if you move right. A negative slope means it falls. A slope near 0 means the neighborhood is flat.

If the input is not one number but a whole parameter vector \(\theta=[\theta_1,\theta_2,\ldots]\), each direction has its own rate of change. Collect those local rates into the gradient:

$$
\nabla L(\theta)=\left[\frac{\partial L}{\partial \theta_1},\frac{\partial L}{\partial \theta_2},\ldots\right].
$$

The gradient points toward fastest loss increase. Model training wants loss to decrease, so it moves along the negative gradient.`,
    ),
    { visualIds: ['beginner-derivative-tangent-longform'] },
  ),
  section(
    'beginner-calculus-partial-gradient',
    copy('第四步：偏导数是只动一个旋钮', 'Step 4: A Partial Derivative Moves One Knob'),
    copy(
      md`AI 模型通常不是只有一个输入。一个很小的模型也可能有权重 \(w\)、偏置 \(b\)，更大的神经网络会有成千上万甚至更多参数。偏导数的入门读法是：**先固定其他旋钮，只轻轻动一个参数，看 loss 怎么变。**

例如 \(L(\theta_1,\theta_2)\) 有两个参数时，

$$
\frac{\partial L}{\partial \theta_1}
$$

表示只沿 \(\theta_1\) 方向轻轻移动时，loss 的局部变化率。另一个方向 \(\theta_2\) 也有自己的偏导。把所有方向收集起来，就是梯度：

$$
\nabla L(\theta)=\left[\frac{\partial L}{\partial \theta_1},\frac{\partial L}{\partial \theta_2},\ldots\right].
$$

所以梯度不是一个魔法箭头，而是一张“每个旋钮往哪里调会让 loss 上升”的局部清单。训练要降低 loss，于是把这张清单反过来用。`,
      md`AI models rarely have only one input. Even a tiny model may have a weight \(w\) and a bias \(b\), while larger neural networks have thousands or millions of parameters. The beginner reading of a partial derivative is: **hold the other knobs fixed, move one parameter a little, and watch how loss changes.**

For a two-parameter loss \(L(\theta_1,\theta_2)\),

$$
\frac{\partial L}{\partial \theta_1}
$$

means the local rate of loss change when only the \(\theta_1\) direction moves. The \(\theta_2\) direction has its own partial derivative. Collect all directions and you get the gradient:

$$
\nabla L(\theta)=\left[\frac{\partial L}{\partial \theta_1},\frac{\partial L}{\partial \theta_2},\ldots\right].
$$

The gradient is not magic. It is a local list of how each knob would raise loss. Training lowers loss by using that list in the opposite direction.`,
    ),
    { visualIds: ['beginner-partial-gradient-longform'] },
  ),
  section(
    'beginner-calculus-chain-backprop',
    copy('第五步：链式法则把责任传回参数', 'Step 5: Chain Rule Sends Responsibility Back'),
    copy(
      md`神经网络是一串函数拼起来的机器：输入先经过线性层，再经过激活函数，再进入 loss。一个参数对最终 loss 的影响，往往要穿过很多中间节点。链式法则说：**总影响 = 沿路每个局部影响相乘。**

如果

$$
z=wx+b,\qquad \hat y=\sigma(z),\qquad L=\frac{1}{2}(\hat y-y)^2,
$$

那么权重 \(w\) 的责任可以写成

$$
\frac{\partial L}{\partial w}
=
\frac{\partial L}{\partial \hat y}
\frac{\partial \hat y}{\partial z}
\frac{\partial z}{\partial w}.
$$

反向传播就是把这个乘法沿计算图自动做完。它不是一次性猜出答案，而是从 loss 出发，带着“上游梯度”一步步乘过每个节点的局部导数。`,
      md`A neural network is a machine made by composing functions: an input passes through a linear layer, an activation, and finally a loss. A parameter's effect on final loss usually passes through many middle nodes. The chain rule says: **total effect equals the product of the local effects along the path.**

If

$$
z=wx+b,\qquad \hat y=\sigma(z),\qquad L=\frac{1}{2}(\hat y-y)^2,
$$

then the responsibility of weight \(w\) can be written as

$$
\frac{\partial L}{\partial w}
=
\frac{\partial L}{\partial \hat y}
\frac{\partial \hat y}{\partial z}
\frac{\partial z}{\partial w}.
$$

Backpropagation performs this multiplication along the computation graph. It does not guess the answer all at once; it starts from loss and carries an upstream gradient backward through each local derivative.`,
    ),
    { visualIds: ['beginner-chain-rule-backprop-longform', 'beginner-chain-rule-backprop-video'], labIds: ['beginner-backprop-block-lab'] },
  ),
  section(
    'beginner-calculus-taylor-map',
    copy('第六步：Taylor 是局部地图', 'Step 6: Taylor as a Local Map'),
    copy(
      md`Taylor 展开可以理解成“给复杂函数画一张附近可用的小地图”。零阶只记住当前高度，一阶加上当前斜率，二阶再加上弯曲程度：

$$
f(x+h)\approx f(x)+f'(x)h+\frac{f''(x)}{2}h^2.
$$

这张地图只在当前点附近可靠。离中心越远，地图越可能失真；阶数越高，通常能在附近捕捉更多形状，但仍然要看误差。**Taylor as a local map** 是后续优化章节的核心直觉：先用局部模型判断下一步往哪走。`,
      md`A Taylor expansion can be read as "drawing a small nearby map for a complicated function." Order zero keeps the current height, first order adds current slope, and second order adds curvature:

$$
f(x+h)\approx f(x)+f'(x)h+\frac{f''(x)}{2}h^2.
$$

This map is reliable near the current point. Farther from the center, the map can distort. Higher degree usually captures more nearby shape, but error still matters. **Taylor as a local map** is the core intuition for later optimization chapters: build a local model first, then decide where to step.`,
    ),
    { visualIds: ['beginner-gradient-taylor-update-longform'] },
  ),
  section(
    'beginner-calculus-gradient-checking',
    copy('第七步：数值梯度检查和不可导点', 'Step 7: Gradient Checks and Nondifferentiable Points'),
    copy(
      md`代码里的梯度也需要被检查。最直接的办法是回到平均变化率，用很小的 \(\epsilon\) 做有限差分：

$$
\frac{L(\theta+\epsilon)-L(\theta-\epsilon)}{2\epsilon}.
$$

如果这个数和反向传播给出的梯度很接近，说明局部导数链条大概率没有写错。这个方法慢，不适合正式训练每一步都用，但很适合调试小模型、确认公式和代码是否一致。

还有一种常见情况：函数在某个点不可导。例如

$$
\operatorname{ReLU}(x)=\max(0,x)
$$

在 \(x=0\) 左右斜率突然改变。AI 框架通常会约定一个可用的次梯度或边界处理方式。初学时先记住：不可导点不是训练完全不能进行，而是要知道局部规则由框架或模型定义决定。`,
      md`Gradients in code should also be checked. The most direct check returns to average change and uses a small \(\epsilon\) finite difference:

$$
\frac{L(\theta+\epsilon)-L(\theta-\epsilon)}{2\epsilon}.
$$

If this number is close to the backprop gradient, the local-derivative chain is probably wired correctly. This method is slow, so it is not used at every training step, but it is excellent for debugging small models and verifying that formulas and code agree.

Another common case is a function that is not differentiable at one point. For example,

$$
\operatorname{ReLU}(x)=\max(0,x)
$$

changes slope abruptly at \(x=0\). AI frameworks usually choose a usable subgradient or boundary convention. As a beginner, remember: a nondifferentiable point does not automatically stop training, but the local rule depends on the framework or model definition.`,
    ),
  ),
  section(
    'beginner-calculus-ai-training',
    copy('第八步：它怎样变成训练规则', 'Step 8: How It Becomes a Training Rule'),
    copy(
      md`训练模型时，loss 是一台把参数输入、错误大小输出的机器。我们无法一次看完整个高维地形，所以每一步只在当前参数附近问：轻轻改变参数，loss 会怎样变？

一阶局部模型写成

$$
L(\theta+\Delta)\approx L(\theta)+\nabla L(\theta)^\top\Delta.
$$

若选择 \(\Delta=-\eta\nabla L(\theta)\)，右边通常会下降，于是得到梯度下降：

$$
\theta_{\text{new}}=\theta-\eta\nabla L(\theta).
$$

这里 \(\eta\) 是学习率，也就是步长。步长太小会慢，太大会越过谷底甚至发散。`,
      md`During training, loss is a machine that takes parameters as input and returns error size. We cannot inspect the whole high-dimensional terrain at once, so each step asks a local question: if the current parameters move a little, how does loss change?

The first-order local model is

$$
L(\theta+\Delta)\approx L(\theta)+\nabla L(\theta)^\top\Delta.
$$

Choosing \(\Delta=-\eta\nabla L(\theta)\) usually lowers the right side, giving gradient descent:

$$
\theta_{\text{new}}=\theta-\eta\nabla L(\theta).
$$

Here \(\eta\) is the learning rate, or step size. Too small is slow; too large can jump over the valley or diverge.`,
    ),
    { visualIds: ['beginner-learning-rate-behavior-longform', 'beginner-learning-rate-behavior-video'] },
  ),
  section(
    'beginner-calculus-checkpoint',
    copy('复习问题', 'Review Questions'),
    copy(
      md`如果你能解释平均变化率、瞬时变化率、切线斜率、梯度和 Taylor 局部地图之间的关系，就已经抓住 AI 微积分的第一层直觉。进入 Taylor 章节前，请回答：

1. 平均变化率为什么需要两个位置？它和某一瞬间的速度有什么区别？
2. 让 \(h\) 逐渐变小时，割线斜率为什么会越来越像切线斜率？
3. 导数为正、为负、接近 0 时，函数在当前点附近分别发生什么？
4. 参数很多时，为什么要把每个方向的局部变化率收集成梯度？
5. 梯度指向 loss 上升最快方向，为什么训练要走负梯度？
6. Taylor 局部地图为什么只能在中心附近可信？距离中心变远时要检查什么？
7. 学习率太小、合适、太大时，训练轨迹会怎样变化？

额外练习一：用 \(f(x)=x^2\) 做一个小表格。分别计算 \(x=0,1,2,3\) 时的函数值，再用相邻两点估计平均变化率。你会看到越靠右，曲线升高得越快；这不是因为公式变了，而是当前位置附近的斜率变大了。接着把观察窗口从 \(h=1\) 改成 \(h=0.5\)、\(h=0.1\)，比较平均变化率怎样靠近当前点的导数。

额外练习二：把 loss 想成一条山谷曲线。若当前点斜率为正，向右会升高，因此应该向左走；若斜率为负，向右会下降，因此应该向右走。这个方向判断比“参数应该变大还是变小”的说法更可靠，因为不同参数的梯度分量符号可能不同。真正要问的是：这一步是否让 loss 下降。

额外练习三：解释 Taylor 近似时，不要说“用多项式替代函数”就结束。要补上四个限制：中心在哪里、离中心多远、保留到几阶、误差项是否可控。机器学习里的每次参数更新也有类似限制：当前梯度只描述当前附近，如果学习率太大，就把局部信息拿到太远的地方使用，训练就可能震荡或发散。

再把这些概念连回一个完整训练步骤：先用前向传播算出当前 loss，再用反向传播得到每个参数的局部变化率，最后由优化器决定步长。这里的每个环节都在使用“局部”二字。导数只描述当前点附近，梯度只描述当前参数附近，Taylor 近似也只描述中心附近。初学者最容易犯的错误，是把局部信息当成全局保证；真正可靠的做法，是每走一步都重新计算局部信息。

如果你会画图，可以画三条线：原函数曲线、当前点的切线、从当前点沿负梯度走出的一小步。然后在图上标出 \(x\)、\(h\)、\(f(x)\)、\(f(x+h)\)、\(f'(x)\) 和学习率 \(\eta\)。这张图会把“平均变化、瞬时变化、切线、梯度、更新”放到同一页，比单独背公式更接近 AI 训练时的真实使用方式。

还可以用语言检查自己：当你说“导数很大”时，必须补充是哪个点附近；当你说“梯度方向”时，必须补充是哪个 loss 和哪组参数；当你说“近似很好”时，必须补充离中心有多远。只要这三个补充习惯稳定下来，微积分就不再像一串孤立技巧，而会变成读模型行为的工具。

最后，试着把一个错误训练现象说成微积分语言：loss 来回跳动通常意味着步长相对局部坡度太大；loss 长期不动可能是坡度很小，也可能是学习率太小；验证集变差则说明局部下降没有转化成泛化。

请确认你知道：导数不是整条曲线的平均值，梯度不是让每个参数都变小，Taylor 近似也不是永远准确的全局公式。`,
      md`If you can connect average change, instantaneous change, tangent slope, gradient, and the Taylor local map, you have the first layer of AI calculus intuition. Before entering the Taylor chapter, answer:

1. Why does average rate of change need two positions? How is it different from speed at one instant?
2. Why does secant slope behave more like tangent slope as \(h\) shrinks?
3. What happens near the current point when a derivative is positive, negative, or near zero?
4. When there are many parameters, why collect local rates from every direction into a gradient?
5. If the gradient points fastest uphill for loss, why does training move along negative gradient?
6. Why is a Taylor local map trustworthy only near its center? What should be checked farther away?
7. How do training paths change when the learning rate is too small, reasonable, or too large?

Check that you know: a derivative is not the global average of the curve, a gradient does not make every parameter smaller, and a Taylor approximation is not a globally accurate formula forever.`,
    ),
  ),
]

const probabilitySections = [
  section(
    'beginner-probability-sample-space',
    copy('第一步：样本空间是可能结果清单', 'Step 1: A Sample Space Lists Possible Outcomes'),
    copy(
      md`概率不是一句“我感觉会发生”。它先要说清楚可能发生什么。概率回答的是：在明确的样本空间里，长期会怎样分配结果。所有可能结果组成样本空间。例如掷一枚硬币，样本空间是 \(\{\text{正面},\text{反面}\}\)；从三类图片中分类，样本空间可以是 \(\{\text{猫},\text{狗},\text{鸟}\}\)。

事件是样本空间中的一部分。随机变量把结果翻译成数字，例如把“正面”记为 1，“反面”记为 0。这样我们就能计算平均值、方差和分布形状。零基础时先记住：样本空间回答“可能有哪些结果”，随机变量回答“怎样把结果变成可计算的数”。`,
      md`Probability is not a sentence like "I feel this will happen." It first has to name what can happen. Probability answers: within a clearly defined sample space, how do outcomes distribute in the long run? All possible outcomes form the sample space. For a coin flip, the sample space is \(\{\text{heads},\text{tails}\}\). For a three-class image classifier, it might be \(\{\text{cat},\text{dog},\text{bird}\}\).

An event is a part of the sample space. A random variable translates outcomes into numbers, such as heads \(\mapsto 1\) and tails \(\mapsto 0\). Then we can compute averages, variance, and distribution shape. As a beginner, keep this split: sample space asks "what outcomes are possible"; random variable asks "how do we turn outcomes into computable numbers?"`,
    ),
    { visualIds: ['beginner-probability-story', 'beginner-sample-space-random-variable-longform'] },
  ),
  section(
    'beginner-probability-distribution-shape',
    copy('第二步：分布是很多次结果留下的形状', 'Step 2: A Distribution Is the Shape Left by Many Trials'),
    copy(
      md`一次结果可能很偶然，很多次结果会留下形状。分布回答的是：很多次观察后，结果会留下什么形状。把彩色小球重复倒进盒子里，某些盒子会越来越高，某些盒子会保持很低。每个盒子的相对高度就是频率；重复次数很多时，频率会更接近概率。

概率分布把每个可能值分配一个概率：

$$
\sum_i p_i=1,\qquad p_i\ge0.
$$

均匀分布表示各结果差不多一样可能；二项分布表示多次成功/失败试验里成功次数的规律；normal distribution 常出现在许多小影响相加后的测量误差或自然波动中。`,
      md`One result can be accidental; many results leave a shape. A distribution answers: after many observations, what shape do the results leave behind? Drop colored beads into bins repeatedly. Some bins become tall; others remain short. Each bin's relative height is frequency. After many repeats, frequency often moves closer to probability.

A probability distribution assigns probability to each possible value:

$$
\sum_i p_i=1,\qquad p_i\ge0.
$$

A uniform distribution means outcomes are roughly equally likely. A binomial distribution describes how many successes appear in repeated success/failure trials. A normal distribution often appears when many small influences add together, such as measurement noise or natural variation.`,
    ),
    { visualIds: ['beginner-distribution-frequency-longform'], labIds: ['beginner-distribution-builder-lab'] },
  ),
  section(
    'beginner-probability-ai-output',
    copy('第三步：分类器输出的是分布', 'Step 3: A Classifier Outputs a Distribution'),
    copy(
      md`分类器最后通常不会只输出一个词，而是输出一排概率。例如 \([0.7,0.2,0.1]\) 表示模型把 70% 的信心放在第一类，20% 放在第二类，10% 放在第三类。它们必须非负，并且总和为 1。

softmax 的作用就是把任意分数变成这样的概率条：

$$
p_i=\frac{e^{z_i}}{\sum_j e^{z_j}}.
$$

最高概率的类别是模型当前最倾向的答案，但概率高不等于永远可靠。校准要检查“模型说 70% 的样本，在真实世界里是不是大约 70% 正确”。`,
      md`A classifier usually does not output only one word. It outputs a row of probabilities. For example, \([0.7,0.2,0.1]\) means the model places 70% confidence on the first class, 20% on the second, and 10% on the third. The values must be nonnegative and sum to 1.

Softmax turns arbitrary scores into probability bars:

$$
p_i=\frac{e^{z_i}}{\sum_j e^{z_j}}.
$$

The largest probability gives the model's current favorite answer, but high probability does not mean permanent reliability. Calibration checks whether examples predicted at 70% confidence are correct about 70% of the time in reality.`,
    ),
  ),
  section(
    'beginner-probability-expectation-variance',
    copy('第四步：平均值和波动大小', 'Step 4: Average and Spread'),
    copy(
      md`分布不仅告诉我们哪些结果可能出现，还告诉我们中心和波动。期望值是长期平均：

$$
\mathbb{E}[X]=\sum_i x_i p_i.
$$

方差衡量结果围绕平均值摆动多大：

$$
\operatorname{Var}(X)=\mathbb{E}[(X-\mathbb{E}[X])^2].
$$

如果两个模型平均表现相同，但一个波动很大，一个波动很小，使用体验会完全不同。AI 里的不确定性估计、采样稳定性和数据噪声判断都需要这两个读数。`,
      md`A distribution tells not only which outcomes can appear, but also where the center is and how much spread exists. Expected value is the long-run average:

$$
\mathbb{E}[X]=\sum_i x_i p_i.
$$

Variance measures how much outcomes move around the average:

$$
\operatorname{Var}(X)=\mathbb{E}[(X-\mathbb{E}[X])^2].
$$

If two models have the same average performance but one varies wildly while the other is stable, the user experience differs. AI uncertainty estimates, sampling stability, and data-noise checks all need these readouts.`,
    ),
    { visualIds: ['beginner-expectation-variance-longform'] },
  ),
  section(
    'beginner-probability-loss',
    copy('第五步：概率怎样变成 loss', 'Step 5: How Probability Becomes Loss'),
    copy(
      md`训练分类器时，我们希望模型把更多概率放在真实类别上。如果真实类别的概率是 \(q\)，交叉熵在 one-hot 标签下就是

$$
-\log q.
$$

当 \(q=0.8\) 时，损失约为 0.223；当 \(q=0.05\) 时，损失约为 2.996。概率放错地方时惩罚会迅速变大，这就是分类模型和语言模型训练中交叉熵常见的原因。语言模型预测下一个 token，本质上也是在词表这个巨大样本空间上输出概率分布。`,
      md`When training a classifier, we want the model to place more probability on the true class. If the true class has probability \(q\), cross entropy with a one-hot target is

$$
-\log q.
$$

When \(q=0.8\), the loss is about 0.223. When \(q=0.05\), the loss is about 2.996. The penalty grows quickly when probability is placed in the wrong location. This is why cross entropy is common in classifier and language-model training. A language model predicting the next token is also outputting a probability distribution over a huge vocabulary sample space.`,
    ),
    { visualIds: ['beginner-softmax-cross-entropy-longform'] },
  ),
  section(
    'beginner-probability-checkpoint',
    copy('复习问题', 'Review Questions'),
    copy(
      md`请用本章语言回答下面的问题：

1. 样本空间和事件有什么区别？为什么不先列样本空间就很难谈概率？
2. 随机变量为什么不是“随机的变量名”，而是把结果映射成数字的规则？
3. 看到一次结果时，为什么不能立刻判断整个概率分布？
4. 频率和概率有什么关系？样本数增加时，直方图通常会怎样变化？
5. 均匀分布、二项分布和 normal distribution 的形状有什么不同？
6. 分类器输出的概率条为什么必须非负且总和为 1？
7. softmax 把 logits 变成概率后，为什么最高概率不等于绝对可靠？
8. 交叉熵为什么会严厉惩罚“真实类别概率很低”的模型？

额外练习一：为一个三分类任务写出样本空间，例如“晴天、阴天、雨天”。然后给出三组概率条：\([1/3,1/3,1/3]\)、\([0.8,0.1,0.1]\)、\([0.45,0.45,0.1]\)。分别说明哪一组最不确定，哪一组最尖锐，哪一组在两个类别之间犹豫。注意：这些概率条都不是最终事实，只是模型当前对样本空间的信念分配。

额外练习二：用“重复试验”解释频率。假设一个分桶在 10 次试验中出现 4 次，频率是 0.4；在 1000 次试验中出现 390 次，频率是 0.39。第二个读数通常更稳定，因为偶然波动被更多样本平均掉了。Monte Carlo 方法、数据集抽样和模型评估都依赖这个思想：一次观察只能提供样本，多次观察才逐渐显出规律。

额外练习三：比较均值和方差。两个分布可以有相同均值，但一个集中，一个分散。集中分布表示结果更稳定，分散分布表示不确定性更大。AI 生成模型采样时，温度变高通常会让分布更平，结果更有变化；温度变低会让分布更尖锐，结果更集中。理解这一点后，softmax 概率条就不只是“选最大”，而是模型不确定性的可视化。

再把概率语言连到训练数据：训练集里的类别比例本身就是一个经验分布。如果某个类别样本很少，模型看到它的机会也少；如果验证集分布和训练集分布差异很大，模型在验证集上的概率可能就不可靠。因此数据划分、重采样、类别权重和校准都不是额外装饰，而是在管理分布。学习 AI 概率时，要始终问：这些概率定义在哪个样本空间上？来自真实重复观察，还是来自模型分数的归一化？

最后用一句话串起来：样本空间给出可能结果，随机变量把结果变成数字，分布描述长期频率形状，期望和方差读中心与波动，softmax 把模型分数变成概率条，交叉熵用真实类别检查概率放得对不对。只要这条链条清楚，后续的似然、熵、KL divergence 和生成采样都会容易很多。

还要区分“真实世界的随机性”和“模型自己的不确定性”。天气本身有随机波动，测量会有噪声，数据集抽样也会带来波动；模型输出的概率则是它根据已学参数给出的信念。二者可能接近，也可能偏离。校准、验证集和误差分析的作用，就是检查模型信念是否贴近真实频率。不要把一次预测的最大概率当成真理，要把它当成需要证据校验的数值声明。

学习时可以固定一个小例子反复使用：三类图片分类。样本空间是三类标签，随机变量可以记录预测是否正确，分布可以表示类别比例，softmax 给出模型的概率条，交叉熵惩罚真实类别概率过低。把所有新术语都放回这个例子里，就不容易迷路。

如果要继续练习，就把同一个例子改成文本下一个词预测：样本空间变成词表，概率条变得很长，但规则完全一样，真实 token 仍然对应一个需要被提高概率的结果和训练信号本身过程。

请检查三件事：看到一次结果时，不要立刻判断全部概率；看到概率条时，要问它们是否非负且总和为 1；看到“模型很自信”时，要继续问它是否校准。若这些问题能讲清楚，就可以进入 Monte Carlo、似然、熵和交叉熵章节。`,
      md`Use this chapter's language to answer:

1. What is the difference between sample space and event? Why is probability hard to discuss before naming the sample space?
2. Why is a random variable not a "random variable name," but a rule mapping outcomes to numbers?
3. Why can one observed outcome not determine the whole probability distribution?
4. How are frequency and probability related? What usually happens to a histogram as sample count grows?
5. How do the shapes of a uniform distribution, a binomial distribution, and a normal distribution differ?
6. Why must classifier probability bars be nonnegative and sum to 1?
7. After softmax turns logits into probabilities, why does the highest probability not mean absolute reliability?
8. Why does cross entropy strongly penalize a model that assigns low probability to the true class?

Check three habits: after one outcome, do not infer the whole probability; after seeing probability bars, ask whether they are nonnegative and sum to 1; after seeing "the model is confident," ask whether it is calibrated. If those questions make sense, move into Monte Carlo, likelihood, entropy, and cross entropy.`,
    ),
  ),
]

export const beginnerFoundationModules: MathLabModule[] = [
  moduleDefinition({
    id: 'beginner-linear-algebra',
    enhancementTier: 'interactive',
    title: copy('AI 零基础线性代数', 'Linear Algebra for AI Beginners'),
    subtitle: copy('从特征卡、箭头、距离和空间变形开始，把 AI 中的向量与矩阵讲成可看见的对象。', 'Start from feature cards, arrows, distance, and space transforms so vectors and matrices become visible AI objects.'),
    difficulty: 'foundation',
    estimatedMinutes: 34,
    prerequisites: [],
    aiModelConnections: [
      copy('embedding、attention 点积、线性层和梯度都先以向量或矩阵形式出现。', 'Embeddings, attention dot products, linear layers, and gradients first appear as vectors or matrices.'),
      copy('本章是正式线代、SVD、PCA 和 Transformer 数学的零基础入口。', 'This chapter is the zero-base entry to formal linear algebra, SVD, PCA, and Transformer math.'),
    ],
    learningObjectives: [
      copy('把一排特征数解释成同一个样本在特征空间中的位置和方向。', 'Explain a row of feature values as one sample position and direction in feature space.'),
      copy('用距离、长度、点积和 cosine similarity 比较向量。', 'Compare vectors with distance, length, dot product, and cosine similarity.'),
      copy('把矩阵乘法解释成空间变形和列向量线性组合。', 'Interpret matrix multiplication as a space transform and column-vector combination.'),
      copy('说清楚这些对象怎样连接到 embedding、线性层和 attention。', 'Connect these objects to embeddings, linear layers, and attention.'),
    ],
    concepts: [
      concept(
        'beginner-feature-vector',
        copy('特征向量', 'Feature Vector'),
        '\\mathbf{x}=[x_1,x_2,\\ldots,x_n]^\\top',
        [variable('x_i', '第 i 个特征值。', 'The i-th feature value.'), variable('n', '特征数量，也就是维度。', 'The number of features, or dimension.')],
        copy('向量把同一个样本的多个特征放进一个有顺序的空间位置。', 'A vector places several features of the same sample into one ordered position in space.'),
        copy('二维时像箭头；高维时仍然有方向、长度和距离。', 'In 2D it looks like an arrow; in high dimensions it still has direction, length, and distance.'),
        copy('学习记录 \\([2,5]\\) 可以读作练习 2 次、错 5 题的状态点。', 'A learning record \\([2,5]\\) can mean a state point with 2 practices and 5 mistakes.'),
        copy('图像像素、文本 embedding、用户画像和梯度都可写成向量。', 'Image pixels, text embeddings, user profiles, and gradients can all be vectors.'),
        'const x = [2, 5, 80]\nconst y = [3, 4, 82]\nconst diff = y.map((value, i) => value - x[i])\nconsole.log(diff) // [1, -1, 2]',
      ),
      concept(
        'beginner-dot-product',
        copy('点积与方向相似度', 'Dot Product and Direction Similarity'),
        '\\mathbf{x}^{\\top}\\mathbf{y}=\\|\\mathbf{x}\\|\\,\\|\\mathbf{y}\\|\\cos\\theta',
        [variable('\\theta', '两个向量之间的夹角。', 'The angle between two vectors.'), variable('\\|\\mathbf{x}\\|', '向量长度。', 'Vector length.')],
        copy('点积同时读长度和方向；归一化后得到只看方向的 cosine similarity。', 'Dot product reads length and direction together; normalization gives cosine similarity that focuses on direction.'),
        copy('同向为正，垂直接近 0，反向为负。', 'Aligned vectors are positive, perpendicular vectors are near zero, and opposite vectors are negative.'),
        copy('\\((3,4)\\cdot(4,0)=12\\)，cosine similarity 为 \\(12/(5\\cdot4)=0.6\\)。', '\\((3,4)\\cdot(4,0)=12\\), so cosine similarity is \\(12/(5\\cdot4)=0.6\\).'),
        copy('检索最相似文本 embedding 时常用 cosine similarity。', 'Cosine similarity is common when retrieving the most similar text embedding.'),
      ),
      concept(
        'beginner-matrix-transform',
        copy('矩阵变换', 'Matrix Transform'),
        'A\\mathbf{x}=x_1\\mathbf{a}_1+\\cdots+x_n\\mathbf{a}_n',
        [variable('\\mathbf{a}_j', '矩阵第 j 列，也就是第 j 个基方向的去向。', 'Column j of the matrix, where basis direction j lands.'), variable('x_j', '输入向量在第 j 个方向上的坐标。', 'Input coordinate along direction j.')],
        copy('矩阵用输入坐标混合自己的列向量，得到新向量。', 'A matrix mixes its columns using input coordinates to produce a new vector.'),
        copy('移动基方向会让整个空间跟着拉伸、旋转、剪切或压扁。', 'Moving basis directions stretches, rotates, shears, or flattens the whole space.'),
        copy('\\(A[[4],[-1]]\\) 可以按列读成 4 份第一列减 1 份第二列。', '\\(A[[4],[-1]]\\) can be read by columns as 4 copies of the first column minus 1 copy of the second.'),
        copy('线性层 \\(W\\mathbf{x}+\\mathbf{b}\\) 用矩阵混合输入特征。', 'A linear layer \\(W\\mathbf{x}+\\mathbf{b}\\) uses a matrix to mix input features.'),
      ),
    ],
    sections: linearSections,
    visuals: [
      imageAsset('beginner-linear-algebra-story', 'beginner-linear-algebra-story.png', copy('线性代数入门故事', 'Beginner Linear Algebra Story'), copy('特征卡变成向量，向量被比较和混合，矩阵把网格变形。', 'Feature cards become vectors, vectors are compared and mixed, and a matrix transforms the grid.')),
      imageAsset(
        'beginner-vector-feature-space-longform',
        'beginner-vector-feature-space-longform.png',
        copy('向量：把一排特征放进同一个空间', 'Vector: Put Features into One Space'),
        copy('学习次数、错题数和分数被写成同一个向量，展示二维箭头和三维特征空间如何帮助比较方向、距离和变化。', 'Practice count, mistakes, and score are placed in one vector, showing how 2D arrows and 3D feature space support comparisons of direction, distance, and change.'),
      ),
      imageAsset(
        'beginner-vector-distance-similarity-longform',
        'beginner-vector-distance-similarity-longform.png',
        copy('距离与相似度：位置接近不等于方向接近', 'Distance and Similarity: Near Position Is Not Near Direction'),
        copy('图中比较欧氏距离、夹角和 cosine similarity，提醒学生区分“多远”和“多像”这两个向量问题。', 'The illustration compares Euclidean distance, angle, and cosine similarity so learners separate the vector questions "how far" and "how similar in direction."'),
      ),
      imageAsset(
        'beginner-linear-combination-span-longform',
        'beginner-linear-combination-span-longform.png',
        copy('线性组合与 span：用基础方向到达新位置', 'Linear Combination and Span: Reach New Places with Base Directions'),
        copy('两支基础箭头按比例混合，形成一条线或一个平面，解释 span、线性相关和线性层混合特征的关系。', 'Two base arrows are mixed by weights to form a line or plane, connecting span, dependence, and how linear layers remix input features.'),
      ),
      imageAsset(
        'beginner-matrix-transform-longform',
        'beginner-matrix-transform-longform.png',
        copy('矩阵变换：一台空间变形机器', 'Matrix Transform: A Space Machine'),
        copy('矩阵的列向量决定基方向去哪里，整个网格随之拉伸、旋转、剪切，并连接到神经网络的线性层。', 'Matrix columns decide where basis directions land, causing the whole grid to stretch, rotate, or shear and linking directly to neural-network linear layers.'),
      ),
    ],
    labs: [
      lab('beginner-feature-vector-story-lab', copy('特征向量故事实验', 'Feature Vector Story Lab'), 'FeatureVectorStoryLab', [
        copy('能解释向量差表示哪种样本变化。', 'Explain what change a vector difference represents.'),
        copy('能比较距离和 cosine similarity 的不同含义。', 'Compare the meanings of distance and cosine similarity.'),
      ]),
    ],
    quizzes: [
      quiz('beginner-linear-vector', copy('为什么一排特征数可以看成向量？', 'Why can a row of feature values be read as a vector?'), 'same-sample', copy('因为它们描述同一个样本在多个方向上的位置。', 'Because they describe one sample position along several directions.'), copy('因为所有数字都必须相等。', 'Because all numbers must be equal.'), copy('向量把同一个对象的多个特征放进同一空间，方便比较方向和距离。', 'A vector places several features of one object in one space, making direction and distance comparable.'), 'vector-is-only-list', 'beginner-linear-algebra-story'),
      quiz('beginner-linear-dot', copy('两个非零向量点积为 0，最直接表示什么？', 'If two nonzero vectors have dot product 0, what does that most directly mean?'), 'orthogonal', copy('方向垂直，彼此没有投影重叠。', 'Their directions are perpendicular, with no projection overlap.'), copy('两个向量长度一定都是 0。', 'Both vector lengths must be 0.'), copy('点积包含 \\(\\cos\\theta\\)，非零向量点积为 0 表示夹角为 90 度。', 'The dot product contains \\(\\cos\\theta\\); for nonzero vectors, dot product 0 means a 90-degree angle.'), 'dot-product-angle'),
      quiz('beginner-linear-matrix', copy('矩阵乘向量更适合先理解成什么？', 'What is the best first intuition for matrix times vector?'), 'transform', copy('用输入坐标混合矩阵列向量，并变换空间。', 'Mixing matrix columns with input coordinates and transforming space.'), copy('逐项相乘后原样保留。', 'Elementwise multiplication with no mixing.'), copy('矩阵乘法会混合维度，不是逐项保留。', 'Matrix multiplication mixes dimensions; it does not preserve entries one by one.'), 'matrix-entrywise'),
    ],
    misconceptions: [
      misconception('vector-is-only-list', copy('向量只是普通列表。', 'A vector is only a plain list.'), copy('向量既是数据列表，也是特征空间里的方向、长度和位置。', 'A vector is both a data list and a direction, length, and position in feature space.'), copy('embedding 相似度要看方向，而不是只逐项读数字。', 'Embedding similarity reads direction, not only each number separately.')),
      misconception('dot-product-angle', copy('点积只是在算长度。', 'A dot product only measures length.'), copy('点积同时受长度和夹角影响。', 'A dot product depends on both lengths and angle.'), copy('两个长向量若近似垂直，点积也可以接近 0。', 'Two long vectors can still have dot product near 0 if nearly perpendicular.')),
      misconception('matrix-entrywise', copy('矩阵乘法就是逐项相乘。', 'Matrix multiplication is elementwise multiplication.'), copy('矩阵乘法包含乘法和求和，按列看是线性组合。', 'Matrix multiplication includes products and sums; by columns it is a linear combination.'), copy('线性层会把多个输入特征加权混合成新特征。', 'A linear layer mixes many input features into new features.')),
    ],
    accent: '#3868ff',
    theme: '#eef3ff',
    sourceReferences: [sources.eola, sources.d2l, sources.mml],
  }),
  moduleDefinition({
    id: 'beginner-calculus',
    enhancementTier: 'interactive',
    title: copy('AI 零基础微积分', 'Calculus for AI Beginners'),
    subtitle: copy('从平均变化、瞬时变化和局部地图理解导数、梯度与训练更新。', 'Use average change, instantaneous change, and local maps to understand derivatives, gradients, and training updates.'),
    difficulty: 'foundation',
    estimatedMinutes: 52,
    prerequisites: ['beginner-linear-algebra'],
    aiModelConnections: [
      copy('导数和梯度解释了参数微小变化如何影响 loss。', 'Derivatives and gradients explain how tiny parameter changes affect loss.'),
      copy('链式法则解释了反向传播怎样把 loss 的责任分配到每个权重。', 'The chain rule explains how backpropagation assigns loss responsibility to each weight.'),
      copy('Taylor 局部模型连接到梯度下降、Newton 法和数值近似。', 'Taylor local models connect to gradient descent, Newton methods, and numerical approximation.'),
    ],
    learningObjectives: [
      copy('区分平均变化率和瞬时变化率。', 'Distinguish average change from instantaneous change.'),
      copy('把导数解释成当前点附近的局部速度。', 'Explain a derivative as local speed near the current point.'),
      copy('把梯度解释成多个方向的局部变化率。', 'Explain a gradient as local rates across many directions.'),
      copy('用链式法则解释反向传播如何把 loss 责任传回参数。', 'Use the chain rule to explain how backpropagation sends loss responsibility back to parameters.'),
      copy('用数值梯度检查确认公式、代码和自动微分是否一致。', 'Use numerical gradient checks to compare formulas, code, and autodiff.'),
      copy('用 Taylor 局部地图连接优化更新。', 'Connect Taylor local maps to optimization updates.'),
    ],
    concepts: [
      concept('beginner-average-change', copy('平均变化率', 'Average Rate of Change'), '\\frac{f(x+h)-f(x)}{h}', [variable('h', '观察窗口或步长。', 'Observation window or step size.')], copy('平均变化率比较两个位置之间每单位输入带来的输出变化。', 'Average rate of change compares output change per input step between two positions.'), copy('像计算一段路的平均坡度。', 'Like computing average slope over a road segment.'), copy('若 \\(f(2)=5\\)、\\(f(4)=9\\)，平均变化率是 \\((9-5)/2=2\\)。', 'If \\(f(2)=5\\) and \\(f(4)=9\\), the average rate is \\((9-5)/2=2\\).'), copy('有限差分和梯度检查从这个读法开始。', 'Finite differences and gradient checking start from this reading.')),
      concept('beginner-derivative', copy('导数', 'Derivative'), 'f\\prime(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}', [variable('h\\to0', '把观察窗口缩小到当前点附近。', 'Shrink the observation window near the current point.')], copy('导数是瞬时变化率，描述此刻输入轻微变化时输出怎样变。', 'A derivative is instantaneous change, describing how output changes when input moves slightly right now.'), copy('图像上是当前点的切线斜率。', 'On a graph it is the tangent slope at the current point.'), copy('对 \\(f(x)=x^2\\)，在 \\(x=3\\) 处导数是 6。', 'For \\(f(x)=x^2\\), the derivative at \\(x=3\\) is 6.'), copy('反向传播需要每一层的局部导数。', 'Backpropagation needs local derivatives from each layer.')),
      concept('beginner-gradient-step', copy('梯度下降步', 'Gradient Descent Step'), '\\theta_{new}=\\theta-\\eta\\nabla L(\\theta)', [variable('\\eta', '学习率或步长。', 'Learning rate or step size.'), variable('\\nabla L', 'loss 上升最快的方向。', 'The direction where loss rises fastest.')], copy('最小化 loss 时沿梯度反方向移动。', 'To minimize loss, move opposite the gradient.'), copy('像在山坡上往最陡下降方向迈一步。', 'Like stepping along the steepest downhill direction on terrain.'), copy('若 \\(\\theta=2\\)、\\(\\nabla L=3\\)、\\(\\eta=0.1\\)，新参数是 1.7。', 'If \\(\\theta=2\\), \\(\\nabla L=3\\), and \\(\\eta=0.1\\), the new parameter is 1.7.'), copy('几乎所有可微模型训练都依赖这种局部更新思想。', 'Almost all differentiable model training relies on this local update idea.')),
      concept('beginner-partial-derivative', copy('偏导数', 'Partial Derivative'), '\\frac{\\partial L}{\\partial \\theta_i}', [variable('\\theta_i', '第 i 个参数旋钮。', 'The i-th parameter knob.'), variable('L', '训练时要降低的 loss。', 'The loss to reduce during training.')], copy('偏导数固定其他参数，只看一个方向的局部变化率。', 'A partial derivative holds other parameters fixed and reads one direction of local change.'), copy('像只转动控制台上的一个旋钮，观察 loss 表盘怎样动。', 'Like turning one knob on a control panel and watching the loss dial move.'), copy('若 \\(L(w,b)=0.5w^2+b\\)，则 \\(\\partial L/\\partial w=w\\)。', 'If \\(L(w,b)=0.5w^2+b\\), then \\(\\partial L/\\partial w=w\\).'), copy('神经网络每个权重和偏置都需要自己的偏导。', 'Each neural-network weight and bias needs its own partial derivative.')),
      concept('beginner-chain-rule', copy('链式法则', 'Chain Rule'), '\\frac{\\partial L}{\\partial w}=\\frac{\\partial L}{\\partial \\hat y}\\frac{\\partial \\hat y}{\\partial z}\\frac{\\partial z}{\\partial w}', [variable('\\hat y', '模型预测。', 'Model prediction.'), variable('z', '中间节点。', 'Intermediate node.')], copy('链式法则把沿路每个局部影响相乘，得到参数对最终 loss 的影响。', 'The chain rule multiplies local effects along a path to get the parameter effect on final loss.'), copy('像沿着计算图把责任一站一站传回去。', 'Like passing responsibility backward station by station along a computation graph.'), copy('若上游梯度是 2，本地导数是 0.3，传回去就是 0.6。', 'If the upstream gradient is 2 and the local derivative is 0.3, the returned gradient is 0.6.'), copy('反向传播就是链式法则在计算图上的自动执行。', 'Backpropagation is the chain rule executed automatically on a computation graph.')),
      concept('beginner-gradient-check', copy('数值梯度检查', 'Numerical Gradient Check'), '\\frac{L(\\theta+\\epsilon)-L(\\theta-\\epsilon)}{2\\epsilon}', [variable('\\epsilon', '一个很小的扰动。', 'A tiny perturbation.'), variable('\\theta', '被检查的参数。', 'The parameter being checked.')], copy('用有限差分近似梯度，检查反向传播结果是否合理。', 'Use finite differences to approximate a gradient and check whether backpropagation is reasonable.'), copy('像把旋钮分别往左右轻轻拨一下，再比较 loss 变化。', 'Like nudging a knob slightly left and right, then comparing loss change.'), copy('对 \\(L(\\theta)=0.5\\theta^2\\)，\\(\\epsilon\\) 很小时检查值接近 \\(\\theta\\)。', 'For \\(L(\\theta)=0.5\\theta^2\\), the check is close to \\(\\theta\\) when \\(\\epsilon\\) is small.'), copy('调试自定义 loss 或层时常用梯度检查。', 'Gradient checks are useful when debugging custom losses or layers.')),
    ],
    sections: calculusSections,
    visuals: [
      imageAsset('beginner-calculus-story', 'beginner-calculus-story.png', copy('微积分入门故事', 'Beginner Calculus Story'), copy('小车路径、切线斜率、局部变化框和 loss 山谷中的梯度步。', 'A car path, tangent slope, local-change boxes, and a gradient step in a loss valley.')),
      imageAsset(
        'beginner-function-machine-longform',
        'beginner-function-machine-longform.png',
        copy('函数：输入输出机器', 'Function: Input-Output Machine'),
        copy('生活输入进入函数机器后变成输出，旁边用表格和曲线说明函数规则如何连接到模型预测。', 'Life inputs go through a function machine and become outputs, with tables and curves showing how function rules connect to model prediction.'),
      ),
      imageAsset(
        'beginner-average-to-derivative-longform',
        'beginner-average-to-derivative-longform.png',
        copy('从平均变化到导数', 'From Average Change to Derivative'),
        copy('割线窗口逐步缩小，平均变化率靠近当前点斜率，帮助学生理解导数来自局部观察窗口。', 'The secant window shrinks and average rate approaches the current-point slope, showing that a derivative comes from a local observation window.'),
      ),
      imageAsset(
        'beginner-derivative-window-longform',
        'beginner-derivative-window-longform.png',
        copy('导数：把观察窗口缩到当前点', 'Derivative: Shrink the Window to the Current Point'),
        copy('同一条曲线中，较大的割线窗口逐步缩小到当前点附近，并用表格展示 h 变小时平均变化率怎样靠近导数。', 'On one curve, a wide secant window shrinks toward the current point, with a table showing average rates approaching the derivative as h gets smaller.'),
      ),
      imageAsset(
        'beginner-derivative-tangent-longform',
        'beginner-derivative-tangent-longform.png',
        copy('导数与切线：当前点附近的速度', 'Derivative and Tangent: Speed Near the Current Point'),
        copy('曲线、切线和正负斜率一起展示导数怎样描述当前点附近的上升、下降或变平。', 'A curve, tangent line, and positive or negative slopes show how a derivative describes rising, falling, or flattening near the current point.'),
      ),
      imageAsset(
        'beginner-partial-gradient-longform',
        'beginner-partial-gradient-longform.png',
        copy('梯度：很多方向的局部变化率', 'Gradient: Local Rates in Many Directions'),
        copy('两个参数旋钮分别产生自己的偏导，多个局部变化率合成梯度，连接到 loss 地形上的方向箭头。', 'Two parameter knobs each produce a partial derivative; many local rates combine into a gradient direction on the loss landscape.'),
      ),
      imageAsset(
        'beginner-chain-rule-backprop-longform',
        'beginner-chain-rule-backprop-longform.png',
        copy('链式法则：把责任沿计算图传回去', 'Chain Rule: Send Responsibility Back Through the Graph'),
        copy('计算图先从输入前向得到 loss，再把上游梯度乘过局部导数，得到参数的梯度责任。', 'A computation graph runs forward to loss, then sends upstream gradients backward through local derivatives to get parameter responsibilities.'),
      ),
      imageAsset(
        'beginner-gradient-taylor-update-longform',
        'beginner-gradient-taylor-update-longform.png',
        copy('梯度与 Taylor：用局部地图更新参数', 'Gradient and Taylor: Update Parameters with a Local Map'),
        copy('loss 地形中标出梯度、负梯度、Taylor 局部地图和学习率，解释为什么训练沿负梯度迈小步。', 'A loss landscape marks the gradient, negative gradient, Taylor local map, and learning rate to explain why training takes small downhill steps.'),
      ),
      imageAsset(
        'beginner-learning-rate-behavior-longform',
        'beginner-learning-rate-behavior-longform.png',
        copy('学习率：同一个坡度，不同步长', 'Learning Rate: Same Slope, Different Step Sizes'),
        copy('三条轨迹对比小学习率、合适学习率和过大学习率在同一 loss 谷中的不同训练行为。', 'Three paths compare small, reasonable, and too-large learning rates inside the same loss valley.'),
      ),
      manimAsset('beginner-derivative-window-video', 'beginner-derivative-window', copy('导数窗口动画', 'Derivative Window Animation'), copy('割线窗口逐步缩小，展示平均变化率怎样靠近当前点的切线斜率。', 'A secant window shrinks and shows average change approaching the tangent slope at the current point.')),
      manimAsset('beginner-chain-rule-backprop-video', 'beginner-chain-rule-backprop', copy('链式法则反传动画', 'Chain Rule Backprop Animation'), copy('动画沿计算图展示前向值和反向梯度如何通过局部导数连接起来。', 'Animation showing how forward values and backward gradients connect through local derivatives in a computation graph.')),
      manimAsset('beginner-learning-rate-behavior-video', 'beginner-learning-rate-behavior', copy('学习率行为动画', 'Learning-Rate Behavior Animation'), copy('动画对比小步、合适步长和过大步长在 loss 谷中的轨迹差异。', 'Animation comparing small, reasonable, and too-large step sizes in a loss valley.')),
    ],
    labs: [
      lab('beginner-local-change-story-lab', copy('局部变化故事实验', 'Local Change Story Lab'), 'LocalChangeStoryLab', [
        copy('能说明窗口变小时平均斜率如何接近导数。', 'Explain how average slope approaches the derivative as the window shrinks.'),
        copy('能解释学习率如何影响下一步 loss。', 'Explain how learning rate affects the next loss.'),
      ]),
      lab('beginner-backprop-block-lab', copy('反传积木实验', 'Backprop Blocks Lab'), 'BackpropBlockLab', [
        copy('能指出上游梯度和局部导数在计算图中的位置。', 'Identify upstream gradients and local derivatives in the computation graph.'),
        copy('能比较解析梯度和数值梯度检查。', 'Compare the analytic gradient with a numerical gradient check.'),
      ]),
    ],
    quizzes: [
      quiz('beginner-calculus-average', copy('平均变化率主要比较什么？', 'What does average rate of change compare?'), 'two-points', copy('两个位置之间输出变化除以输入变化。', 'Output change divided by input change between two positions.'), copy('函数在所有位置的最高值。', 'The highest value of the whole function.'), copy('平均变化率读一段区间，不是全局最高点。', 'Average rate reads an interval, not the global maximum.'), 'average-vs-instant', 'beginner-calculus-story'),
      quiz('beginner-calculus-derivative', copy('导数最适合先理解成什么？', 'What is the best first intuition for a derivative?'), 'instant', copy('当前点附近的瞬时变化率。', 'The instantaneous rate of change near the current point.'), copy('整个函数的全局平均高度。', 'The global average height of the function.'), copy('导数来自把观察窗口缩小到当前点附近。', 'A derivative comes from shrinking the observation window near the current point.'), 'calculus-is-global-formula'),
      quiz('beginner-calculus-gradient', copy('为什么梯度下降要减去梯度？', 'Why does gradient descent subtract the gradient?'), 'downhill', copy('梯度指向上升最快，负梯度指向下降。', 'The gradient points uphill, so negative gradient points downhill.'), copy('减号保证所有参数都变小。', 'The minus sign guarantees every parameter becomes smaller.'), copy('减去梯度是为了降低 loss，不是为了让每个参数数值变小。', 'Subtracting the gradient aims to lower loss, not to make every parameter value smaller.'), 'gradient-means-smaller'),
      quiz('beginner-calculus-partial', copy('偏导数 \\(\\partial L/\\partial \\theta_i\\) 的入门读法是什么？', 'What is the beginner reading of \\(\\partial L/\\partial \\theta_i\\)?'), 'one-knob', copy('固定其他参数，只动第 i 个参数看 loss 怎么变。', 'Hold other parameters fixed and move parameter i to see how loss changes.'), copy('同时随机改变所有参数。', 'Randomly change all parameters at once.'), copy('偏导数读一个参数方向上的局部变化率。', 'A partial derivative reads local change along one parameter direction.'), 'partial-all-knobs', 'beginner-partial-gradient-longform'),
      quiz('beginner-calculus-chain', copy('反向传播最核心地复用了哪条规则？', 'Which rule does backpropagation reuse most centrally?'), 'chain-rule', copy('链式法则：上游梯度乘以局部导数。', 'The chain rule: upstream gradient times local derivative.'), copy('只比较训练集和验证集大小。', 'Only comparing training and validation set sizes.'), copy('反向传播沿计算图重复使用链式法则。', 'Backpropagation repeatedly applies the chain rule along the computation graph.'), 'backprop-not-magic', 'beginner-chain-rule-backprop-longform'),
      quiz('beginner-calculus-gradient-check', copy('数值梯度检查最适合用来做什么？', 'What is a numerical gradient check best used for?'), 'debug', copy('调试公式或反向传播实现是否合理。', 'Debug whether a formula or backprop implementation is reasonable.'), copy('替代每一步正式训练。', 'Replace every training step.'), copy('有限差分较慢，适合检查小模型或局部实现。', 'Finite differences are slow, so they are best for checking small models or local implementations.'), 'finite-difference-is-training'),
    ],
    misconceptions: [
      misconception('average-vs-instant', copy('平均变化率和导数是同一个东西。', 'Average change and derivative are the same thing.'), copy('平均变化率看一段区间；导数看窗口缩到当前点时的极限。', 'Average change reads an interval; a derivative is the limit as the window shrinks to the current point.'), copy('全程平均速度不等于某一秒的车速。', 'Average speed for a trip is not the speed at one second.')),
      misconception('calculus-is-global-formula', copy('导数就是整条曲线的全局平均。', 'A derivative is the global average of the whole curve.'), copy('导数是当前点附近的局部变化率。', 'A derivative is the local rate of change near the current point.'), copy('同一条曲线不同位置可以有不同斜率。', 'The same curve can have different slopes at different positions.')),
      misconception('gradient-means-smaller', copy('负梯度会让每个参数都变小。', 'Negative gradient makes every parameter smaller.'), copy('负梯度让 loss 局部下降；某些参数可能变大。', 'Negative gradient locally lowers loss; some parameters may increase.'), copy('若梯度分量为负，减去它会让对应参数变大。', 'If a gradient component is negative, subtracting it increases that parameter.')),
      misconception('partial-all-knobs', copy('偏导数表示所有参数一起变化。', 'A partial derivative means all parameters change together.'), copy('偏导数先固定其他参数，只读一个方向。梯度才把多个方向收集起来。', 'A partial derivative holds other parameters fixed and reads one direction. The gradient collects many directions.'), copy('调权重 \\(w\\) 时，偏置 \\(b\\) 暂时当作不动的旋钮。', 'When checking weight \\(w\\), bias \\(b\\) is temporarily treated as a fixed knob.')),
      misconception('backprop-not-magic', copy('反向传播是一个和导数无关的黑盒算法。', 'Backpropagation is a black-box algorithm unrelated to derivatives.'), copy('反向传播就是链式法则在计算图上的系统执行。', 'Backpropagation is the systematic execution of the chain rule on a computation graph.'), copy('每个节点只需要知道上游梯度和自己的局部导数。', 'Each node needs the upstream gradient and its own local derivative.')),
      misconception('finite-difference-is-training', copy('数值梯度检查可以替代正式训练里的反向传播。', 'Numerical gradient checks can replace backpropagation during normal training.'), copy('有限差分要反复重新算 loss，通常太慢；它主要用于调试和验证。', 'Finite differences repeatedly recompute loss and are usually too slow; they are mainly for debugging and verification.'), copy('检查一个小模型的 \\(dL/dw\\) 很有用，但大模型每步都这样做会非常慢。', 'Checking \\(dL/dw\\) for a tiny model is useful, but doing it every step for a large model is very slow.')),
      misconception('relu-stops-training', copy('ReLU 在 0 不可导，所以神经网络无法训练。', 'Because ReLU is nondifferentiable at 0, neural networks cannot train.'), copy('框架会为边界点采用约定或次梯度；大多数位置仍有清晰局部斜率。', 'Frameworks use a convention or subgradient at the boundary; most locations still have a clear local slope.'), copy('ReLU 在负区间斜率为 0，正区间斜率为 1，只有边界点需要约定。', 'ReLU has slope 0 on the negative side and 1 on the positive side; only the boundary needs a convention.')),
    ],
    accent: '#d65a31',
    theme: '#fff1e8',
    sourceReferences: [sources.calculus, sources.d2l, sources.mml],
  }),
  moduleDefinition({
    id: 'beginner-probability-distributions',
    enhancementTier: 'interactive',
    title: copy('AI 零基础概率分布', 'Probability Distributions for AI Beginners'),
    subtitle: copy('从样本空间、随机变量、重复试验和概率条理解 AI 的不确定性语言。', 'Start from sample spaces, random variables, repeated trials, and probability bars to understand AI uncertainty.'),
    difficulty: 'foundation',
    estimatedMinutes: 36,
    prerequisites: ['beginner-calculus'],
    aiModelConnections: [
      copy('分类器、语言模型和生成模型都会输出或使用概率分布。', 'Classifiers, language models, and generative models output or use probability distributions.'),
      copy('交叉熵、似然、采样和校准都需要先理解分布。', 'Cross entropy, likelihood, sampling, and calibration require distribution intuition first.'),
    ],
    learningObjectives: [
      copy('解释样本空间、事件和随机变量。', 'Explain sample space, event, and random variable.'),
      copy('把分布读成重复试验后留下的频率形状。', 'Read a distribution as the frequency shape left by repeated trials.'),
      copy('区分均匀分布、二项分布和 normal distribution 的基本形状。', 'Distinguish the basic shapes of uniform, binomial, and normal distributions.'),
      copy('把分类器概率条连接到 softmax、校准和交叉熵。', 'Connect classifier probability bars to softmax, calibration, and cross entropy.'),
    ],
    concepts: [
      concept('beginner-sample-space', copy('样本空间', 'Sample Space'), '\\Omega=\\{\\omega_1,\\omega_2,\\ldots\\}', [variable('\\Omega', '所有可能结果的集合。', 'The set of all possible outcomes.')], copy('先列出可能结果，概率讨论才有对象。', 'List possible outcomes first so probability has objects to discuss.'), copy('像给随机实验画出所有出口。', 'Like drawing all exits of a random experiment.'), copy('三分类器的样本空间可以是 \\{猫,狗,鸟\\}。', 'A three-class classifier can have sample space \\{cat,dog,bird\\}.'), copy('分类模型的输出概率分布定义在类别样本空间上。', 'Classifier probability outputs are defined over a class sample space.')),
      concept('beginner-random-variable', copy('随机变量', 'Random Variable'), 'X:\\Omega\\to\\mathbb{R}', [variable('X', '把结果映射成数字的规则。', 'A rule mapping outcomes to numbers.')], copy('随机变量把文字结果变成可计算数字。', 'A random variable turns named outcomes into computable numbers.'), copy('像给每种结果贴一个数值标签。', 'Like attaching a numeric tag to each outcome.'), copy('硬币正面记 1、反面记 0。', 'Coin heads can map to 1 and tails to 0.'), copy('模型评估中的正确/错误、类别编号和 reward 都可以看成随机变量。', 'Correctness, class index, and reward in model evaluation can be random variables.')),
      concept('beginner-distribution', copy('概率分布', 'Probability Distribution'), '\\sum_i p_i=1,\\quad p_i\\ge0', [variable('p_i', '第 i 个结果的概率。', 'Probability of outcome i.')], copy('分布给每个可能结果分配非负概率，并且总和为 1。', 'A distribution assigns nonnegative probabilities to possible outcomes, summing to 1.'), copy('直方图越高，长期出现得越频繁。', 'A taller histogram bar means the outcome appears more often in the long run.'), copy('\\([0.7,0.2,0.1]\\) 是三类上的概率分布。', '\\([0.7,0.2,0.1]\\) is a distribution over three classes.'), copy('softmax 输出、采样温度和交叉熵都操作概率分布。', 'Softmax outputs, sampling temperature, and cross entropy operate on distributions.')),
    ],
    sections: probabilitySections,
    visuals: [
      imageAsset('beginner-probability-story', 'beginner-probability-story.png', copy('概率分布入门故事', 'Beginner Probability Distribution Story'), copy('重复样本落入分桶，形成分布曲线，并连接到分类概率条。', 'Repeated samples fall into bins, form a distribution curve, and connect to classifier probability bars.')),
      imageAsset(
        'beginner-sample-space-random-variable-longform',
        'beginner-sample-space-random-variable-longform.png',
        copy('样本空间与随机变量', 'Sample Space and Random Variable'),
        copy('硬币、天气和课程标签先列出所有可能结果，再用随机变量把结果映射成可计算数字。', 'Coins, weather, and course labels first list all possible outcomes, then random variables map outcomes into computable numbers.'),
      ),
      imageAsset(
        'beginner-distribution-frequency-longform',
        'beginner-distribution-frequency-longform.png',
        copy('分布与频率：很多次结果留下形状', 'Distribution and Frequency: Many Trials Leave a Shape'),
        copy('重复抽样形成柱状图，样本越多频率形状越稳定，说明概率分布不是一次结果，而是长期模式。', 'Repeated sampling forms a histogram; with more samples the frequency shape stabilizes, showing that a distribution is a long-run pattern, not one outcome.'),
      ),
      imageAsset(
        'beginner-expectation-variance-longform',
        'beginner-expectation-variance-longform.png',
        copy('期望与方差：中心和波动', 'Expectation and Variance: Center and Spread'),
        copy('两组分布用同一均值但不同波动做对比，解释期望读长期中心，方差读不确定性大小。', 'Two distributions with the same mean but different spread explain that expectation reads long-run center while variance reads uncertainty size.'),
      ),
      imageAsset(
        'beginner-softmax-cross-entropy-longform',
        'beginner-softmax-cross-entropy-longform.png',
        copy('Softmax 与交叉熵：把分数变成训练信号', 'Softmax and Cross Entropy: Turn Scores into a Training Signal'),
        copy('logits 经过 softmax 变成概率条，真实类别概率越低，交叉熵惩罚越大，从而驱动分类模型学习。', 'Logits become probability bars through softmax; the lower the true-class probability, the larger cross entropy becomes, driving classifier training.'),
      ),
    ],
    labs: [
      lab('beginner-distribution-builder-lab', copy('分布构造实验', 'Distribution Builder Lab'), 'DistributionBuilderLab', [
        copy('能解释样本数增加时频率形状为什么更稳定。', 'Explain why frequency shape stabilizes as sample count grows.'),
        copy('能比较均匀、二项和 normal distribution 的均值与方差。', 'Compare the mean and variance of uniform, binomial, and normal distributions.'),
      ]),
    ],
    quizzes: [
      quiz('beginner-probability-space', copy('样本空间回答什么问题？', 'What question does a sample space answer?'), 'possible', copy('可能有哪些结果。', 'Which outcomes are possible.'), copy('模型有多少层。', 'How many layers the model has.'), copy('概率必须先知道结果集合，才能给结果分配概率。', 'Probability must know the outcome set before assigning probabilities.'), 'sample-space', 'beginner-probability-story'),
      quiz('beginner-probability-distribution', copy('为什么不能用一次结果判断整个分布？', 'Why can one result not determine the whole distribution?'), 'sample', copy('一次结果只是一个样本，可能很偶然。', 'One outcome is just one sample and may be accidental.'), copy('因为概率分布不允许重复试验。', 'Because distributions forbid repeated trials.'), copy('分布描述长期频率形状，需要多次观察。', 'A distribution describes long-run frequency shape and needs repeated observation.'), 'one-trial'),
      quiz('beginner-probability-softmax', copy('分类器输出 \\([0.7,0.2,0.1]\\) 更接近什么？', 'A classifier output \\([0.7,0.2,0.1]\\) is closest to what?'), 'distribution', copy('类别样本空间上的概率分布。', 'A probability distribution over the class sample space.'), copy('二维坐标。', 'A two-dimensional coordinate.'), copy('非负且总和为 1 的概率条表示模型的不确定性分配。', 'Nonnegative probability bars summing to 1 represent how the model distributes uncertainty.'), 'probability-bars'),
    ],
    misconceptions: [
      misconception('sample-space', copy('不用列出可能结果也能严谨谈概率。', 'We can discuss probability rigorously without listing possible outcomes.'), copy('样本空间定义了概率要分配到哪些结果上。', 'The sample space defines which outcomes receive probability.'), copy('三分类和二分类的概率条长度不同，因为样本空间不同。', 'A three-class and two-class probability bar have different lengths because their sample spaces differ.')),
      misconception('one-trial', copy('看到一次结果，就知道整个分布。', 'Seeing one outcome reveals the whole distribution.'), copy('一次结果只是样本；分布要看重复试验后的形状。', 'One outcome is only a sample; a distribution is read from repeated-trial shape.'), copy('一次抽到高分不代表所有样本都高分。', 'Drawing one high value does not mean all samples are high.')),
      misconception('probability-bars', copy('最高概率高，模型就一定可靠。', 'A high top probability means the model is certainly reliable.'), copy('概率条还需要校准检查。', 'Probability bars still need calibration checks.'), copy('模型说 90% 的样本若实际只有 60% 正确，就是过度自信。', 'If examples predicted at 90% are only 60% correct, the model is overconfident.')),
    ],
    accent: '#247a73',
    theme: '#e9f8f5',
    sourceReferences: [sources.seeingTheory, sources.statQuest, sources.d2l, sources.mml],
  }),
]
