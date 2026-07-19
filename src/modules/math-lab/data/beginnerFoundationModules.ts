import type {
  LabConfig,
  LocalizedCopy,
  MathConcept,
  MathLabComponentName,
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

function lab(id: string, title: LocalizedCopy, componentName: MathLabComponentName, successCriteria: LocalizedCopy[]): LabConfig {
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
    { visualIds: ['beginner-linear-algebra-story', 'linear-algebra-feature-cards', 'beginner-vector-feature-space-longform'] },
  ),
  section(
    'beginner-linear-distance-similarity',
    copy('第二步：长度、距离和相似度', 'Step 2: Length, Distance, and Similarity'),
    copy(
      md`向量长度可以先用勾股定理理解。二维向量 \((3,4)\) 的长度是

$$
\|\mathbf{x}\|_2=\sqrt{3^2+4^2}=5.
$$

两个向量的欧几里得距离也是同一个想法，只是先做差，再量这条差向量有多长：

$$
\|\mathbf{x}-\mathbf{y}\|_2=\sqrt{\sum_i (x_i-y_i)^2}.
$$

距离回答的是“位置多近”。如果 \(\mathbf{x}\) 和 \(\mathbf{y}\) 的差很短，它们在特征空间里靠得近。cosine similarity 回答的是“方向多像”。它看两支箭头的夹角，而不是只看终点离得多近。两个学生的分数规模可能都很高，但学习模式不同；两个句子的 embedding 长度可能不同，但方向很接近，语义就可能接近。

点积把“长度”和“夹角”放进同一个数：

$$
\mathbf{x}^{\top}\mathbf{y}=\|\mathbf{x}\|\,\|\mathbf{y}\|\cos\theta.
$$

如果我们只关心方向，就把长度除掉，得到 cosine similarity。文本检索里常说“找最相似的 embedding”，本质就是找方向最接近的向量。

有时还会给维度加权。权重不是装饰，它表示这次比较更在乎哪个维度。比较学习记录时，如果“错题数”比“练习次数”更重要，就可以让错题数这一维的权重大一些。向量相似度实验会让你调整权重，看距离和方向相似度怎样变化。

2D 或 3D 箭头只是一个入口，方便我们看见长度、差向量和夹角。真正的 embedding 可能有几百甚至几千维，画不出来，但逻辑没有换：数字组成向量，norm 量长度，distance 量位置差，cosine similarity 量方向像不像。`,
      md`Vector length can start from the Pythagorean theorem. The two-dimensional vector \((3,4)\) has length

$$
\|\mathbf{x}\|_2=\sqrt{3^2+4^2}=5.
$$

Euclidean distance uses the same idea. First subtract the vectors, then measure the length of that difference vector:

$$
\|\mathbf{x}-\mathbf{y}\|_2=\sqrt{\sum_i (x_i-y_i)^2}.
$$

Distance answers "how close are the positions?" If \(\mathbf{x}\) and \(\mathbf{y}\) have a short difference vector, they are near each other in feature space. Cosine similarity answers "how similar are the directions?" It looks at the angle between the arrows, not only how close their endpoints are. Two learners may both have large scores but different learning patterns; two sentence embeddings may have different lengths but very close directions, which can indicate similar meaning.

The dot product places length and angle into one number:

$$
\mathbf{x}^{\top}\mathbf{y}=\|\mathbf{x}\|\,\|\mathbf{y}\|\cos\theta.
$$

If we only care about direction, we divide away length and get cosine similarity. When text retrieval searches for the most similar embedding, it is often searching for vectors that point in nearby directions.

Sometimes the comparison also uses weights. A weight says which dimension matters more in this comparison. If mistakes matter more than practice count in a learner record, the mistakes dimension can receive a larger weight. The Vector Similarity Lab lets you adjust those weights and watch distance and direction similarity respond.

2D or 3D arrows are only a visual entry point. They make length, difference vectors, and angles visible. Real embeddings may have hundreds or thousands of dimensions, but the logic stays the same: numbers become vectors, norms measure length, distance measures position gap, and cosine similarity measures direction alignment.`,
    ),
    {
      visualIds: [
        'beginner-vector-distance-similarity-longform',
        'vector-distance-norm-intuition',
        'cosine-vs-distance-intuition',
        'high-dimensional-embedding-search',
        'vector-distance-norm-video',
        'cosine-similarity-angle-video',
      ],
      labIds: ['beginner-feature-vector-story-lab', 'beginner-vector-similarity-lab'],
    },
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
      md`先把一个学生很爱问的问题摆出来：学微积分，对我去买菜有帮助吗？

如果只是算“3 斤苹果，每斤 8 元，一共多少钱”，四则运算够了。可一旦你开始问“多买半斤会多花多少钱”“优惠从第几斤开始划算”“价格涨得快不快”，你就在问变化。微积分不会帮你砍价，但它会给你一套语言：一个量变了，另一个量怎么跟着变。

函数可以先理解成一台输入输出机器：你给它一个 \(x\)，它返回一个 \(y=f(x)\)。买菜时，输入 \(x\) 可以是重量，输出 \(f(x)\) 是价格；训练模型时，输入可以是一组参数，输出是 loss。函数回答的是：输入改变时输出按什么规则改变。如果把输入轻轻改一点，输出也会跟着变。微积分先问三个很朴素的问题：变快了吗？往哪个方向变？只看当前附近，能不能猜下一步？

平均变化率比较两个位置：

$$
\frac{f(x+h)-f(x)}{h}.
$$

它像是在问：“从 \(x\) 到 \(x+h\) 这一小段，平均每走一步，输出变多少？”如果 \(h\) 很大，这个平均值会把中间细节糊在一起；如果 \(h\) 很小，它就更像当前位置附近的变化。

举个很小的例子。若 \(f(x)=3x\)，买 \(x\) 斤菜要 \(3x\) 元，多一斤永远多 3 元，斜率一直是 3。若 \(f(x)=x^2\)，从 1 到 2 增加 3，从 4 到 5 增加 9，同样多走 1 步，输出增加得不一样。这里开始有“当前位置附近”的味道了。

这一章不打算把大学微积分一次塞完。我们只先拿到 AI 训练最常用的几件工具：函数、局部变化、梯度、链式法则、学习率和数值检查。学完后，你应该能听懂“为什么模型要算梯度”。更完整的 Jacobian、VJP、Hessian 和自动微分细节，后面再慢慢拆。`,
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
      md`平均变化率看一段路。导数看当前这一刻。

想象一辆小车沿弯路前进。全程平均速度当然有用，但如果你想知道“现在这一秒车有多快”，就不能只拿全程距离除以全程时间。你要把观察窗口缩小：先看 10 秒，再看 1 秒，再看 0.1 秒。窗口越小，越接近“此刻”。

平均变化率变成瞬时变化率，就是让 \(h\) 越来越接近 0：

$$
f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h}.
$$

导数回答的是：在当前点附近，输入动一点，输出会动多少。导数就是此刻速度。

这句话里的“速度”不只属于汽车。温度随时间变，价格随重量变，loss 随参数变，都可以谈速度。你可以问：输入稍微变大，输出是在上升、下降，还是几乎不动？如果上升，是慢慢上升，还是一下子冲上去？这些问题比“公式长什么样”更早，也更重要。`,
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
      md`把函数画成曲线后，导数会变成一个很直观的东西：当前点的切线斜率。切线不是整条曲线，它只贴住当前点附近。

斜率为正，往右一点输出会上升；斜率为负，往右一点输出会下降；斜率接近 0，附近比较平。先别急着背“正负号规则”，把它想成站在山坡上：脚下这小块地是往上倾、往下倾，还是差不多平？

如果输入不是一个数字，而是一整组模型参数 \(\theta=[\theta_1,\theta_2,\ldots]\)，每个方向都有自己的变化率。把所有方向的变化率收集起来，就是梯度：

$$
\nabla L(\theta)=\left[\frac{\partial L}{\partial \theta_1},\frac{\partial L}{\partial \theta_2},\ldots\right].
$$

梯度指向 loss 上升最快的方向。训练模型不想让 loss 上升，它想把错误压下去，所以走相反方向，也就是负梯度方向。

这里有个检查自己的问题：如果某个参数的梯度是负的，更新时减去它，参数会变大还是变小？答案是会变大。梯度下降不是“所有参数都变小”，而是“让 loss 往下降”。`,
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
      md`AI 模型通常不是只有一个输入。一个很小的模型也可能有权重 \(w\)、偏置 \(b\)，更大的神经网络会有成千上万个参数。学生第一次看到这么多参数，容易慌：难道要同时理解所有方向吗？

先别同时看。偏导数的入门读法是：先固定其他旋钮，只轻轻动一个参数，看 loss 怎么变。

例如 \(L(\theta_1,\theta_2)\) 有两个参数时，

$$
\frac{\partial L}{\partial \theta_1}
$$

表示只沿 \(\theta_1\) 方向轻轻移动时，loss 的局部变化率。另一个方向 \(\theta_2\) 也有自己的偏导。像调音台一样，一次只拧一个旋钮，听声音怎么变。等每个旋钮都试过，再把这些结果合成一张清单。

$$
\nabla L(\theta)=\left[\frac{\partial L}{\partial \theta_1},\frac{\partial L}{\partial \theta_2},\ldots\right].
$$

所以梯度不是魔法箭头，而是一张“每个旋钮往哪里调会让 loss 上升”的局部清单。训练要降低 loss，就把这张清单反过来用。

再问自己一句：偏导数为什么要“固定其他参数”？因为我们想知道一个旋钮自己的影响。如果所有旋钮一起动，loss 变了，你很难说到底是谁造成的。`,
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
      md`神经网络是一串函数拼起来的机器：输入先经过线性层，再经过激活函数，再进入 loss。一个参数对最终 loss 的影响，往往要穿过很多中间节点。

这听起来抽象。换个说法：你推倒第一张多米诺骨牌，最后一张会不会倒，不只看第一张，还看中间每一张有没有接上。链式法则说的就是这件事：沿路每个局部影响要连起来看。

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

反向传播就是把这个乘法沿计算图自动做完。它不是一次性猜出答案，而是从 loss 出发，带着“上游梯度”一步步往回走：到一个节点，就乘上这个节点自己的局部导数，再把责任传给前面的节点。

如果你只记一句话，记这个：反向传播不是黑盒魔法，它是链式法则的流水线版本。`,
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
      md`Taylor 展开可以先理解成“给复杂函数画一张附近可用的小地图”。地图不等于真实世界，但在你脚边这一小块地方，它够用。

零阶只记住当前高度，一阶加上当前斜率，二阶再加上弯曲程度：

$$
f(x+h)\approx f(x)+f'(x)h+\frac{f''(x)}{2}h^2.
$$

这张地图只在当前点附近可靠。离中心越远，地图越可能失真；阶数越高，通常能在附近捕捉更多形状，但仍然要看误差。

这和训练模型很像。每次更新参数时，优化器并不知道整个 loss 地形，只知道脚下附近的坡度。它先用局部地图猜一小步，再到新位置重新看。微积分里的“局部”二字，千万不要跳过。`,
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
      md`公式写对了，不代表代码一定写对。训练里最麻烦的 bug，常常不是程序崩溃，而是梯度悄悄错了一点，loss 还能跑，但方向不对。

最直接的检查办法，是回到平均变化率，用很小的 \(\epsilon\) 做有限差分：

$$
\frac{L(\theta+\epsilon)-L(\theta-\epsilon)}{2\epsilon}.
$$

你可以把它想成把旋钮往右拨一点、往左拨一点，看 loss 差多少。如果这个数和反向传播给出的梯度很接近，说明局部导数链条大概率没有写错。这个方法慢，不适合正式训练每一步都用，但很适合调试小模型、确认公式和代码是否一致。

还有一种常见情况：函数在某个点不可导。例如

$$
\operatorname{ReLU}(x)=\max(0,x)
$$

在 \(x=0\) 左右斜率突然改变。左边斜率是 0，右边斜率是 1，中间那个点没有唯一斜率。AI 框架通常会约定一个可用的次梯度或边界处理方式。

初学时先记住：不可导点不是“训练立刻完蛋”。真正要问的是，模型或框架在这个点采用了什么局部规则。`,
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
      md`训练模型时，loss 也是一台函数机器。输入是一大堆参数，输出是错误大小。我们无法一次看完整个高维地形，所以每一步只在当前参数附近问：轻轻改变参数，loss 会怎样变？

一阶局部模型写成

$$
L(\theta+\Delta)\approx L(\theta)+\nabla L(\theta)^\top\Delta.
$$

若选择 \(\Delta=-\eta\nabla L(\theta)\)，右边通常会下降，于是得到梯度下降：

$$
\theta_{\text{new}}=\theta-\eta\nabla L(\theta).
$$

这里 \(\eta\) 是学习率，也就是步长。步长太小，像下山时每次只挪半厘米，安全但慢；步长太大，可能一步跨过谷底，在两边来回跳。合适的学习率不是玄学，它是在问：当前这个坡度，我敢走多远？

这也是微积分真正进入 AI 的地方。导数告诉你脚下坡度，梯度告诉你多参数空间里的方向，学习率决定你相信这份局部信息到多远。`,
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
      md`收口时先别急着背公式。把同一个想法用三种话说出来：生活里的话、图像上的话、AI 训练里的话。能来回翻译，才算真的开始懂。

先回答这些问题：

1. 如果 \(f(x)\) 表示买 \(x\) 斤菜的价格，\(f(x+h)-f(x)\) 在生活里是什么意思？
2. 平均变化率为什么一定要比较两个位置？它和某一瞬间的速度有什么区别？
3. 让 \(h\) 逐渐变小时，割线斜率为什么会越来越像切线斜率？
4. 导数为正、为负、接近 0 时，函数在当前点附近分别发生什么？
5. 参数很多时，为什么要把每个方向的局部变化率收集成梯度？
6. 梯度指向 loss 上升最快方向，为什么训练要走负梯度？
7. 链式法则里的“上游梯度乘局部导数”，和“责任一站一站传回去”是同一件事吗？请用 \(x\to z\to \hat y\to L\) 说一遍。
8. Taylor 局部地图为什么只能在中心附近可信？学习率太大时，为什么容易把这张小地图用到太远？

再做几个小练习，纸笔就够。

练习一：比较两种价格函数。\(f(x)=3x\) 表示每斤 3 元，\(g(x)=x^2\) 表示价格随重量变得越来越快。分别算 \(x=0,1,2,3\) 的函数值，再看相邻两点的平均变化率。你会发现：直线的斜率稳定，曲线的斜率会随位置变化。

练习二：把 loss 想成一条山谷曲线。若当前点斜率为正，向右会升高，所以应该向左走；若斜率为负，向右会下降，所以应该向右走。不要只问“参数应该变大还是变小”，要问“这一步会不会让 loss 下降”。

练习三：画一张图。画原函数曲线、当前点的切线、从当前点沿负梯度走出的一小步。标出 \(x\)、\(h\)、\(f(x)\)、\(f(x+h)\)、\(f'(x)\) 和学习率 \(\eta\)。这张图会把平均变化、瞬时变化、切线、梯度、更新放到同一页。

练习四：用一句话解释一次训练。先前向传播算当前 loss，再反向传播得到每个参数的局部变化率，最后由优化器决定步长。说的时候故意加上“当前”两个字：当前 loss、当前参数、当前附近的梯度。这个小习惯很有用。

再用语言检查自己：

当你说“导数很大”时，补一句：在哪个点附近？
当你说“梯度方向”时，补一句：哪个 loss、哪组参数？
当你说“近似很好”时，补一句：离中心有多远？

最后把一个训练现象翻译成微积分语言：loss 来回跳动，常常是步长相对局部坡度太大；loss 长期不动，可能是坡度很小，也可能是学习率太小；训练集 loss 降了但验证集变差，说明局部下降没有自动变成泛化能力。

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
    'beginner-probability-why',
    copy('先问：为什么 AI 要学概率？', 'First Question: Why Does AI Need Probability?'),
    copy(
      md`很多同学第一次听到概率，会想到“猜中没有”。但 AI 更常遇到的问题不是猜一次，而是在不确定的世界里做一连串判断：这张图像像猫还是狗？这封邮件像正常邮件还是垃圾邮件？语言模型下一个 token 应该把多少可能性分给每个词？

所以本章的主线不是背公式，而是学会一种问法：**概率回答的是：在明确的样本空间里，长期会怎样分配结果**。如果你只看到一次结果，就像只看见一颗小球落进一个盒子；如果你重复观察很多次，盒子的高度才会慢慢显出规律。模型输出的概率条也是这样：它不是“真理标签”，而是模型当前把不确定性分到哪些结果上的声明。

请把概率当成 AI 的“不确定性语言”。样本空间告诉我们可能有哪些结果，随机变量把结果变成数字，分布描述长期形状，条件概率告诉我们知道一条信息后样本空间怎样缩小，贝叶斯更新把旧信念改成新信念，校准检查模型说出的概率是否贴近真实频率。`,
      md`Many beginners hear probability and think "did I guess correctly?" AI usually faces a broader problem: making decisions in an uncertain world. Does this image look more like a cat or a dog? Does this email look normal or spam? How much probability should a language model assign to each possible next token?

The main line of this chapter is not memorizing formulas. It is learning a way to ask: **probability answers how outcomes distribute in the long run once the sample space is clear**. One result is like seeing one bead fall into one bin. Repeated observations make the bin heights reveal a pattern. A model's probability bars work similarly: they are not truth itself; they are the model's current distribution of uncertainty over possible outcomes.

Treat probability as AI's language for uncertainty. A sample space names possible outcomes, a random variable turns outcomes into numbers, a distribution describes long-run shape, conditional probability shrinks the space after evidence, Bayes update turns an old belief into a new one, and calibration checks whether model probabilities match real frequencies.`,
    ),
    { visualIds: ['beginner-probability-story', 'beginner-probability-why-longform'] },
  ),
  section(
    'beginner-probability-sample-space',
    copy('第一步：样本空间、事件和随机变量', 'Step 1: Sample Space, Event, and Random Variable'),
    copy(
      md`概率不是一句“我感觉会发生”。它先要说清楚可能发生什么。所有可能结果组成样本空间。例如抛一枚硬币，样本空间是 \(\{\text{正面},\text{反面}\}\)；明天天气可以简化成 \(\{\text{晴天},\text{阴天},\text{雨天}\}\)；从三类图片中分类，样本空间可以是 \(\{\text{猫},\text{狗},\text{鸟}\}\)。

事件是样本空间中的一部分。比如“会下雨”是天气样本空间里的一个事件，“不是猫”是图片分类样本空间里的一个事件。随机变量把结果翻译成数字，例如把“正面”记为 1，“反面”记为 0，把预测是否正确记为 1 或 0。这样我们才能计算平均值、方差、频率和 loss。

老师会一直追问你三句话：样本空间是什么？我们关心哪个事件？随机变量 \(X\) 怎样把结果变成数？只要这三句话没说清楚，后面的概率、期望、方差和交叉熵都会飘起来。`,
      md`Probability is not a sentence like "I feel this will happen." It first has to name what can happen. All possible outcomes form the sample space. For a coin flip, the sample space is \(\{\text{heads},\text{tails}\}\). Tomorrow's weather might be simplified as \(\{\text{sunny},\text{cloudy},\text{rainy}\}\). For a three-class image classifier, it might be \(\{\text{cat},\text{dog},\text{bird}\}\).

An event is a part of the sample space. "It rains" is an event inside the weather sample space; "not cat" is an event inside an image-classification sample space. A random variable translates outcomes into numbers, such as heads \(\mapsto 1\), tails \(\mapsto 0\), or prediction-correct \(\mapsto 1\) and prediction-wrong \(\mapsto 0\). Then we can compute averages, variance, frequency, and loss.

A teacher will keep asking three questions: what is the sample space, which event do we care about, and how does the random variable \(X\) turn outcomes into numbers? If those are unclear, probability, expectation, variance, and cross entropy will all feel detached.`,
    ),
    { visualIds: ['beginner-probability-story', 'beginner-sample-space-random-variable-longform'] },
  ),
  section(
    'beginner-probability-distribution-shape',
    copy('第二步：频率多了，分布形状才出来', 'Step 2: Repeated Frequency Reveals Distribution Shape'),
    copy(
      md`一次结果可能很偶然，很多次结果会留下形状。**分布回答的是：很多次观察后，结果会留下什么形状**。把彩色小球重复倒进盒子里，某些盒子会越来越高，某些盒子会保持很低。每个盒子的相对高度就是频率；重复次数很多时，频率会更接近概率。

概率分布把每个可能值分配一个概率：

$$
\sum_i p_i=1,\qquad p_i\ge0.
$$

均匀分布表示各结果差不多一样可能；二项分布表示多次成功/失败试验里成功次数的规律；normal distribution 常出现在许多小影响相加后的测量误差或自然波动中。看实验时不要只问“这一次掉到哪里”，要问“样本数变多后，频率图正在靠近哪条长期形状”。`,
      md`One result can be accidental; many results leave a shape. **A distribution answers: after many observations, what shape do the results leave behind?** Drop colored beads into bins repeatedly. Some bins become tall; others remain short. Each bin's relative height is frequency. After many repeats, frequency often moves closer to probability.

A probability distribution assigns probability to each possible value:

$$
\sum_i p_i=1,\qquad p_i\ge0.
$$

A uniform distribution means outcomes are roughly equally likely. A binomial distribution describes how many successes appear in repeated success/failure trials. A normal distribution often appears when many small influences add together, such as measurement noise or natural variation. In the lab, do not only ask "where did this one sample land?" Ask "as sample count grows, which long-run shape is the histogram approaching?"`,
    ),
    {
      visualIds: ['beginner-distribution-frequency-longform', 'beginner-probability-frequency-video'],
      labIds: ['beginner-distribution-builder-lab'],
    },
  ),
  section(
    'beginner-probability-conditional',
    copy('第三步：条件概率是在已知信息下重看样本空间', 'Step 3: Conditional Probability Rereads the Space Under Evidence'),
    copy(
      md`条件概率是在已知信息下重看样本空间。它回答的是：“如果我已经知道一条信息，原来的概率还一样吗？” 公式写作

$$
P(A\mid B)=\frac{P(A\cap B)}{P(B)}.
$$

这里的竖线 \(\mid\) 可以读成“在……已经发生的条件下”。例如原来随机抽一封邮件，垃圾邮件比例可能只有 8%；但如果我们已经看到“含可疑链接”这个信号，样本空间就被筛成“带信号的邮件”，垃圾邮件比例会改变。

很多 AI 错误来自把条件说漏了。模型在训练集上 90% 准，不等于在新城市、新设备、新人群上仍然 90% 准；因为条件已经变了。读概率时请养成一个习惯：每说一个概率，就补一句“在什么条件下”。`,
      md`Conditional probability asks: "If I already know one piece of evidence, should the old probability stay the same?" The formula is

$$
P(A\mid B)=\frac{P(A\cap B)}{P(B)}.
$$

The vertical bar \(\mid\) reads as "given that." For example, if we randomly pick an email, the spam rate might be only 8%. But if we already know the email contains a suspicious link, the sample space is filtered to emails with that signal, and the spam proportion changes.

Many AI mistakes come from omitting the condition. A model that is 90% accurate on the training set is not automatically 90% accurate in a new city, on a new device, or for a new population, because the condition changed. Build the habit: whenever you state a probability, add "under what condition?"`,
    ),
    {
      visualIds: ['beginner-conditional-probability-longform'],
      labIds: ['beginner-conditional-bayes-lab'],
    },
  ),
  section(
    'beginner-probability-bayes',
    copy('第四步：贝叶斯更新把旧信念改成新信念', 'Step 4: Bayes Update Turns Old Belief into New Belief'),
    copy(
      md`贝叶斯公式看起来像一行符号，其实是一个很朴素的课堂动作：先说原来的基准比例，再看信号在不同情况中多常出现，最后得到已知信号之后的新比例。

$$
P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}.
$$

\(P(A)\) 是先验，表示看到信号前的基准比例；\(P(B\mid A)\) 是 likelihood，表示如果 \(A\) 真的成立，信号 \(B\) 有多常出现；\(P(B)\) 是归一化项，表示总体上看到这个信号的概率；\(P(A\mid B)\) 是后验，表示看到信号后我们应该更新到的新概率。

注意 base-rate effect：如果垃圾邮件本来很少，即使“可疑链接”对垃圾邮件很敏感，普通邮件中的少量误报也可能很多。贝叶斯更新提醒我们，不要只盯着信号有多强，还要把它放回整体分布里。`,
      md`Bayes' rule looks like a line of symbols, but it is a simple classroom move: start with the base rate, check how often the evidence appears under each case, then compute the new proportion after seeing the evidence.

$$
P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}.
$$

\(P(A)\) is the prior, the base rate before evidence. \(P(B\mid A)\) is the likelihood: if \(A\) is true, how often does evidence \(B\) appear? \(P(B)\) is the evidence: how often is this signal seen overall? \(P(A\mid B)\) is the posterior: the updated probability after seeing the evidence.

Watch the base-rate effect: if spam is rare, even a signal that catches spam well may still include many false alarms from normal email. Bayes update reminds us not to stare only at signal strength; put the signal back into the whole distribution.`,
    ),
    { visualIds: ['beginner-bayes-update-longform', 'beginner-conditional-bayes-video'] },
  ),
  section(
    'beginner-probability-expectation-variance',
    copy('第五步：期望读中心，方差读波动', 'Step 5: Expectation Reads Center, Variance Reads Spread'),
    copy(
      md`分布不仅告诉我们哪些结果可能出现，还告诉我们中心和波动。期望值是长期平均：

$$
\mathbb{E}[X]=\sum_i x_i p_i.
$$

方差衡量结果围绕平均值摆动多大：

$$
\operatorname{Var}(X)=\mathbb{E}[(X-\mathbb{E}[X])^2].
$$

如果两个模型平均表现相同，但一个波动很大，一个波动很小，使用体验会完全不同。一个推荐系统平均满意度一样，但天天忽高忽低，用户会觉得不稳定；一个生成模型平均质量不错，但输出方差很大，结果也会难以控制。AI 里的不确定性估计、采样稳定性和数据噪声判断都需要这两个读数。`,
      md`A distribution tells not only which outcomes can appear, but also where the center is and how much spread exists. Expected value is the long-run average:

$$
\mathbb{E}[X]=\sum_i x_i p_i.
$$

Variance measures how much outcomes move around the average:

$$
\operatorname{Var}(X)=\mathbb{E}[(X-\mathbb{E}[X])^2].
$$

If two models have the same average performance but one varies wildly while the other is stable, the user experience differs. A recommendation system with the same average satisfaction but daily swings feels unstable. A generative model with decent average quality but high variance is hard to control. AI uncertainty estimates, sampling stability, and data-noise checks all need these readouts.`,
    ),
    { visualIds: ['beginner-expectation-variance-longform'] },
  ),
  section(
    'beginner-probability-ai-output',
    copy('第六步：模型概率条也需要校准', 'Step 6: Model Probability Bars Need Calibration'),
    copy(
      md`分类器最后通常不会只输出一个词，而是输出一排概率。例如 \([0.7,0.2,0.1]\) 表示模型把 70% 的信心放在第一类，20% 放在第二类，10% 放在第三类。它们必须非负，并且总和为 1。

softmax 的作用就是把任意分数变成这样的概率条：

$$
p_i=\frac{e^{z_i}}{\sum_j e^{z_j}}.
$$

最高概率的类别是模型当前最倾向的答案，但概率高不等于永远可靠。校准要检查“模型说 70% 的样本，在真实世界里是不是大约 70% 正确”。如果模型经常把 90% 说成 60% 的真实正确率，它不是更聪明，而是过度自信。

读概率条时用三问检查：第一，它们是不是都非负且总和为 1？第二，最高条是否对应真实类别？第三，这个概率值在验证集上能不能当作频率来信任？`,
      md`A classifier usually does not output only one word. It outputs a row of probabilities. For example, \([0.7,0.2,0.1]\) means the model places 70% confidence on the first class, 20% on the second, and 10% on the third. The values must be nonnegative and sum to 1.

Softmax turns arbitrary scores into probability bars:

$$
p_i=\frac{e^{z_i}}{\sum_j e^{z_j}}.
$$

The largest probability gives the model's current favorite answer, but high probability does not mean permanent reliability. Calibration checks whether examples predicted at 70% confidence are correct about 70% of the time in reality. If a model often says 90% while real accuracy is 60%, it is not wiser; it is overconfident.

Use three checks when reading probability bars: are all values nonnegative and summing to 1? Is the tallest bar the true class? Can this probability value be trusted as frequency on validation data?`,
    ),
    { visualIds: ['beginner-calibration-confidence-longform'] },
  ),
  section(
    'beginner-probability-loss',
    copy('第七步：概率怎样变成 loss', 'Step 7: How Probability Becomes Loss'),
    copy(
      md`训练分类器时，我们希望模型把更多概率放在真实类别上。如果真实类别的概率是 \(q\)，交叉熵在 one-hot 标签下就是

$$
-\log q.
$$

当 \(q=0.8\) 时，损失约为 0.223；当 \(q=0.05\) 时，损失约为 2.996。概率放错地方时惩罚会迅速变大，这就是分类模型和语言模型训练中交叉熵常见的原因。语言模型预测下一个 token，本质上也是在词表这个巨大样本空间上输出概率分布。

把它读成老师的一句话：真实答案不是只要求你“选它”，还要求你“把足够多概率放到它身上”。交叉熵就是用真实类别检查模型概率放得对不对。`,
      md`When training a classifier, we want the model to place more probability on the true class. If the true class has probability \(q\), cross entropy with a one-hot target is

$$
-\log q.
$$

When \(q=0.8\), the loss is about 0.223. When \(q=0.05\), the loss is about 2.996. The penalty grows quickly when probability is placed in the wrong location. This is why cross entropy is common in classifier and language-model training. A language model predicting the next token is also outputting a probability distribution over a huge vocabulary sample space.

Read it as a teacher's sentence: the true answer does not merely ask you to "choose it"; it asks you to place enough probability on it. Cross entropy checks whether the model put probability in the right place.`,
    ),
    { visualIds: ['beginner-softmax-cross-entropy-longform', 'beginner-calibration-cross-entropy-video'] },
  ),
  section(
    'beginner-probability-checkpoint',
    copy('复习：把概率语言连成一条链', 'Review Questions: Connect the Probability Language Chain'),
    copy(
      md`请用本章语言回答下面的问题：

1. 样本空间和事件有什么区别？为什么不先列样本空间就很难谈概率？
2. 随机变量为什么不是“随机的变量名”，而是把结果映射成数字的规则？
3. 看到一次结果时，为什么不能立刻判断整个概率分布？
4. 频率和概率有什么关系？样本数增加时，直方图通常会怎样变化？
5. 条件概率中的“given”到底在缩小哪个样本空间？
6. 贝叶斯公式里的先验、likelihood、evidence 和后验分别是什么意思？
7. 均匀分布、二项分布和 normal distribution 的形状有什么不同？
8. 分类器输出的概率条为什么必须非负且总和为 1？
9. softmax 把 logits 变成概率后，为什么最高概率不等于绝对可靠？
10. 交叉熵为什么会严厉惩罚“真实类别概率很低”的模型？

额外练习一：为一个三分类任务写出样本空间，例如“晴天、阴天、雨天”。然后给出三组概率条：\([1/3,1/3,1/3]\)、\([0.8,0.1,0.1]\)、\([0.45,0.45,0.1]\)。分别说明哪一组最不确定，哪一组最尖锐，哪一组在两个类别之间犹豫。注意：这些概率条都不是最终事实，只是模型当前对样本空间的信念分配。

额外练习二：用“重复试验”解释频率。假设一个分桶在 10 次试验中出现 4 次，频率是 0.4；在 1000 次试验中出现 390 次，频率是 0.39。第二个读数通常更稳定，因为偶然波动被更多样本平均掉了。Monte Carlo 方法、数据集抽样和模型评估都依赖这个思想：一次观察只能提供样本，多次观察才逐渐显出规律。

额外练习三：比较均值和方差。两个分布可以有相同均值，但一个集中，一个分散。集中分布表示结果更稳定，分散分布表示不确定性更大。AI 生成模型采样时，温度变高通常会让分布更平，结果更有变化；温度变低会让分布更尖锐，结果更集中。理解这一点后，softmax 概率条就不只是“选最大”，而是模型不确定性的可视化。

再把概率语言连到训练数据：训练集里的类别比例本身就是一个经验分布。如果某个类别样本很少，模型看到它的机会也少；如果验证集分布和训练集分布差异很大，模型在验证集上的概率可能就不可靠。因此数据划分、重采样、类别权重和校准都不是额外装饰，而是在管理分布。学习 AI 概率时，要始终问：这些概率定义在哪个样本空间上？来自真实重复观察，还是来自模型分数的归一化？

最后用一句话串起来：样本空间给出可能结果，随机变量把结果变成数字，分布描述长期频率形状，期望和方差读中心与波动，softmax 把模型分数变成概率条，交叉熵用真实类别检查概率放得对不对。只要这条链条清楚，后续的似然、熵、KL divergence 和生成采样都会容易很多。

还要区分“真实世界的随机性”和“模型自己的不确定性”。天气本身有随机波动，测量会有噪声，数据集抽样也会带来波动；模型输出的概率则是它根据已学参数给出的信念。二者可能接近，也可能偏离。校准、验证集和误差分析的作用，就是检查模型信念是否贴近真实频率。不要把一次预测的最大概率当成真理，要把它当成需要用实际频率检查的数值声明。

学习时可以固定一个小例子反复使用：三类图片分类。样本空间是三类标签，随机变量可以记录预测是否正确，分布可以表示类别比例，softmax 给出模型的概率条，交叉熵惩罚真实类别概率过低。把所有新术语都放回这个例子里，就不容易迷路。

如果要继续练习，就把同一个例子改成文本下一个词预测：样本空间变成词表，概率条变得很长，但规则完全一样，真实 token 仍然对应一个需要被提高概率的结果和训练信号本身过程。

请检查三件事：看到一次结果时，不要立刻判断全部概率；看到概率条时，要问它们是否非负且总和为 1；看到“模型很自信”时，要继续问它是否校准。若这些问题能讲清楚，就可以进入 Monte Carlo、似然、熵和交叉熵章节。`,
      md`Use this chapter's language to answer:

1. What is the difference between sample space and event? Why is probability hard to discuss before naming the sample space?
2. Why is a random variable not a "random variable name," but a rule mapping outcomes to numbers?
3. Why can one observed outcome not determine the whole probability distribution?
4. How are frequency and probability related? What usually happens to a histogram as sample count grows?
5. In conditional probability, which sample space is being narrowed by "given"?
6. What do prior, likelihood, evidence, and posterior mean in Bayes' rule?
7. How do the shapes of a uniform distribution, a binomial distribution, and a normal distribution differ?
8. Why must classifier probability bars be nonnegative and sum to 1?
9. After softmax turns logits into probabilities, why does the highest probability not mean absolute reliability?
10. Why does cross entropy strongly penalize a model that assigns low probability to the true class?

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
        'beginner-vector-norm-distance',
        copy('向量长度与欧几里得距离', 'Vector Norm and Euclidean Distance'),
        '\\|\\mathbf{x}-\\mathbf{y}\\|_2=\\sqrt{\\sum_{i=1}^{n}(x_i-y_i)^2}',
        [
          variable('\\mathbf{x}', '第一个样本向量。', 'The first sample vector.'),
          variable('\\mathbf{y}', '第二个样本向量。', 'The second sample vector.'),
          variable('x_i-y_i', '两个样本在第 i 个维度上的差。', 'The difference between the two samples on dimension i.'),
          variable('n', '参与比较的维度数量。', 'The number of dimensions being compared.'),
        ],
        copy('欧几里得距离先把两个向量相减，再量差向量的长度。', 'Euclidean distance subtracts two vectors first, then measures the length of the difference vector.'),
        copy('二维时它就是两点之间的斜边；高维时仍然是在问两个位置隔了多远。', 'In 2D it is the diagonal between two points; in high dimensions it still asks how far apart two positions are.'),
        copy('\\([2,5,80]\\) 与 \\([3,4,82]\\) 的差是 \\([1,-1,2]\\)，距离是 \\(\\sqrt{6}\\)。', 'The difference between \\([2,5,80]\\) and \\([3,4,82]\\) is \\([1,-1,2]\\), so the distance is \\(\\sqrt{6}\\).'),
        copy('embedding 检索、推荐排序和模型 scoring 都会用距离或相似度判断两个向量是否接近。', 'Embedding retrieval, recommendation ranking, and model scoring use distance or similarity to judge whether two vectors are close.'),
        'const x = [2, 5, 80]\nconst y = [3, 4, 82]\nconst distance = Math.sqrt(x.reduce((sum, value, i) => sum + (value - y[i]) ** 2, 0))\nconsole.log(distance) // 2.449...',
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
        'linear-algebra-feature-cards',
        'linear-algebra-feature-cards.png',
        copy('对象怎样变成向量', 'How Objects Become Vectors'),
        copy('学习记录、推荐偏好和句子 embedding 被放进同一套向量语言。', 'Learner records, recommendation preferences, and sentence embeddings enter the same vector language.'),
      ),
      imageAsset(
        'beginner-vector-distance-similarity-longform',
        'beginner-vector-distance-similarity-longform.png',
        copy('距离与相似度：位置接近不等于方向接近', 'Distance and Similarity: Near Position Is Not Near Direction'),
        copy('图中比较欧氏距离、夹角和 cosine similarity，提醒学生区分“多远”和“多像”这两个向量问题。', 'The illustration compares Euclidean distance, angle, and cosine similarity so learners separate the vector questions "how far" and "how similar in direction."'),
      ),
      imageAsset(
        'vector-distance-norm-intuition',
        'vector-distance-norm-intuition.png',
        copy('距离和向量长度', 'Distance and Vector Length'),
        copy('一条线读向量自己的长度，另一条线读两个对象之间的距离。', 'One segment reads a vector length, and another reads the distance between two objects.'),
      ),
      imageAsset(
        'cosine-vs-distance-intuition',
        'cosine-vs-distance-intuition.png',
        copy('距离近和方向近', 'Nearby Distance and Nearby Direction'),
        copy('图中对比位置距离和方向相似度，帮助区分 Euclidean distance 与 cosine similarity。', 'The image contrasts position distance and directional similarity to separate Euclidean distance from cosine similarity.'),
      ),
      imageAsset(
        'high-dimensional-embedding-search',
        'high-dimensional-embedding-search.png',
        copy('高维 embedding 检索', 'High-Dimensional Embedding Search'),
        copy('句子进入高维表示后，仍然可以用 cosine similarity 做相似检索。', 'Sentences become high-dimensional representations and can still be retrieved with cosine similarity.'),
      ),
      manimAsset(
        'vector-distance-norm-video',
        'vector-distance-norm',
        copy('长度和距离使用同一把尺', 'Norm and Distance Use the Same Ruler'),
        copy(
          '动画先量从原点到向量终点的长度，再把尺子移到两个向量之间，说明欧几里得距离就是差向量的长度。',
          'The animation first measures the length from the origin to a vector endpoint, then moves the same ruler between two vectors to show Euclidean distance as the length of the difference vector.',
        ),
      ),
      manimAsset(
        'cosine-similarity-angle-video',
        'cosine-similarity-angle',
        copy('cosine similarity 看方向', 'Cosine Similarity Reads Direction'),
        copy(
          '动画保持方向但改变长度，再旋转方向，帮助区分距离会受长度影响，而 cosine similarity 主要跟夹角有关。',
          'The animation keeps direction while changing length, then rotates direction, separating distance changes from cosine similarity as an angle-based measure.',
        ),
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
      lab('beginner-vector-similarity-lab', copy('向量相似度实验', 'Vector Similarity Lab'), 'VectorSimilarityLab', [
        copy('能从勾股定理解释 norm 和欧几里得距离。', 'Explain norm and Euclidean distance from the Pythagorean theorem.'),
        copy('能区分距离回答“位置多近”，cosine similarity 回答“方向多像”。', 'Distinguish distance as position closeness from cosine similarity as direction alignment.'),
        copy('能说明维度权重会改变这次比较更在乎什么。', 'Explain how dimension weights change what the comparison cares about.'),
      ]),
    ],
    quizzes: [
      quiz('beginner-linear-vector', copy('为什么一排特征数可以看成向量？', 'Why can a row of feature values be read as a vector?'), 'same-sample', copy('因为它们描述同一个样本在多个方向上的位置。', 'Because they describe one sample position along several directions.'), copy('因为所有数字都必须相等。', 'Because all numbers must be equal.'), copy('向量把同一个对象的多个特征放进同一空间，方便比较方向和距离。', 'A vector places several features of one object in one space, making direction and distance comparable.'), 'vector-is-only-list', 'beginner-linear-algebra-story'),
      quiz('beginner-linear-dot', copy('两个非零向量点积为 0，最直接表示什么？', 'If two nonzero vectors have dot product 0, what does that most directly mean?'), 'orthogonal', copy('方向垂直，彼此没有投影重叠。', 'Their directions are perpendicular, with no projection overlap.'), copy('两个向量长度一定都是 0。', 'Both vector lengths must be 0.'), copy('点积包含 \\(\\cos\\theta\\)，非零向量点积为 0 表示夹角为 90 度。', 'The dot product contains \\(\\cos\\theta\\); for nonzero vectors, dot product 0 means a 90-degree angle.'), 'dot-product-angle'),
      quiz('beginner-linear-cosine-distance', copy('cosine similarity 很高时，欧几里得距离一定很短吗？', 'If cosine similarity is high, must Euclidean distance be short?'), 'not-always', copy('不一定。方向很像，只说明夹角小；长度差很大时，距离仍然可能很长。', 'Not always. Similar direction means a small angle; if lengths differ a lot, distance can still be large.'), copy('一定。cosine similarity 高就等于两个点重合。', 'Yes. High cosine similarity means the two points overlap.'), copy('cosine similarity 看方向，欧几里得距离看位置差。回到向量相似度实验，把一支箭头拉长但保持方向不变，就能看到方向相似度高而距离变长。', 'Cosine similarity reads direction, while Euclidean distance reads position gap. Revisit the Vector Similarity Lab and lengthen one arrow without changing its direction to see high direction similarity with a longer distance.'), 'cosine-distance-confusion', 'beginner-vector-similarity-lab'),
      quiz('beginner-linear-matrix', copy('矩阵乘向量更适合先理解成什么？', 'What is the best first intuition for matrix times vector?'), 'transform', copy('用输入坐标混合矩阵列向量，并变换空间。', 'Mixing matrix columns with input coordinates and transforming space.'), copy('逐项相乘后原样保留。', 'Elementwise multiplication with no mixing.'), copy('矩阵乘法会混合维度，不是逐项保留。', 'Matrix multiplication mixes dimensions; it does not preserve entries one by one.'), 'matrix-entrywise'),
    ],
    misconceptions: [
      misconception('vector-is-only-list', copy('向量只是普通列表。', 'A vector is only a plain list.'), copy('向量既是数据列表，也是特征空间里的方向、长度和位置。', 'A vector is both a data list and a direction, length, and position in feature space.'), copy('embedding 相似度要看方向，而不是只逐项读数字。', 'Embedding similarity reads direction, not only each number separately.')),
      misconception('dot-product-angle', copy('点积只是在算长度。', 'A dot product only measures length.'), copy('点积同时受长度和夹角影响。', 'A dot product depends on both lengths and angle.'), copy('两个长向量若近似垂直，点积也可以接近 0。', 'Two long vectors can still have dot product near 0 if nearly perpendicular.')),
      misconception('cosine-distance-confusion', copy('cosine similarity 高，欧氏距离就一定短。', 'High cosine similarity always means short Euclidean distance.'), copy('cosine similarity 看方向；Euclidean distance 看两个位置之间的差向量长度。', 'Cosine similarity reads direction; Euclidean distance reads the length of the difference vector between two positions.'), copy('两支箭头同向时 cosine similarity 可以是 1，但一支长度是另一支的很多倍，终点仍然相隔很远。', 'Two arrows can point in the same direction and have cosine similarity 1, but if one is many times longer than the other, their endpoints are still far apart.')),
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
    subtitle: copy('从买菜价格、小车速度和 loss 山谷出发，理解函数、斜率、变化率、梯度与训练更新。', 'Use average change, instantaneous change, and local maps to understand derivatives, gradients, and training updates.'),
    difficulty: 'foundation',
    estimatedMinutes: 52,
    prerequisites: ['beginner-linear-algebra'],
    aiModelConnections: [
      copy('导数和梯度告诉我们：参数轻轻动一下，loss 会往哪边变、变多少。', 'Derivatives and gradients explain how tiny parameter changes affect loss.'),
      copy('链式法则把最终 loss 的影响一层层传回每个权重。', 'The chain rule explains how backpropagation assigns loss responsibility to each weight.'),
      copy('Taylor 局部模型解释了为什么优化器只敢根据当前位置附近的信息迈小步。', 'Taylor local models connect to gradient descent, Newton methods, and numerical approximation.'),
    ],
    learningObjectives: [
      copy('能用买菜价格或小车速度解释“函数输入变了，输出怎么变”。', 'Distinguish average change from instantaneous change.'),
      copy('区分平均变化率和瞬时变化率，并能把导数说成当前点附近的斜率。', 'Explain a derivative as local speed near the current point.'),
      copy('把梯度解释成很多参数方向上的局部变化率清单。', 'Explain a gradient as local rates across many directions.'),
      copy('用链式法则解释反向传播怎样把 loss 责任传回参数。', 'Use the chain rule to explain how backpropagation sends loss responsibility back to parameters.'),
      copy('用数值梯度检查确认公式、代码和自动微分是否说的是同一件事。', 'Use numerical gradient checks to compare formulas, code, and autodiff.'),
      copy('用 Taylor 局部地图解释为什么学习率不能随便调大。', 'Connect Taylor local maps to optimization updates.'),
    ],
    concepts: [
      concept('beginner-average-change', copy('平均变化率', 'Average Rate of Change'), '\\frac{f(x+h)-f(x)}{h}', [variable('h', '观察窗口或步长。', 'Observation window or step size.')], copy('平均变化率比较两个位置：输入走了多少，输出跟着变了多少。', 'Average rate of change compares output change per input step between two positions.'), copy('像算一段路的平均坡度，也像算多买几斤菜平均每斤多花多少钱。', 'Like computing average slope over a road segment.'), copy('若 \\(f(2)=5\\)、\\(f(4)=9\\)，平均变化率是 \\((9-5)/2=2\\)。', 'If \\(f(2)=5\\) and \\(f(4)=9\\), the average rate is \\((9-5)/2=2\\).'), copy('有限差分和梯度检查从这个读法开始。', 'Finite differences and gradient checking start from this reading.')),
      concept('beginner-derivative', copy('导数', 'Derivative'), 'f\\prime(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}', [variable('h\\to0', '把观察窗口缩小到当前点附近。', 'Shrink the observation window near the current point.')], copy('导数是当前点附近的瞬时变化率，也就是这一下的斜率。', 'A derivative is instantaneous change, describing how output changes when input moves slightly right now.'), copy('图像上是当前点的切线斜率。', 'On a graph it is the tangent slope at the current point.'), copy('对 \\(f(x)=x^2\\)，在 \\(x=3\\) 处导数是 6。', 'For \\(f(x)=x^2\\), the derivative at \\(x=3\\) is 6.'), copy('反向传播需要每一层的局部导数。', 'Backpropagation needs local derivatives from each layer.')),
      concept('beginner-gradient-step', copy('梯度下降步', 'Gradient Descent Step'), '\\theta_{new}=\\theta-\\eta\\nabla L(\\theta)', [variable('\\eta', '学习率或步长。', 'Learning rate or step size.'), variable('\\nabla L', 'loss 上升最快的方向。', 'The direction where loss rises fastest.')], copy('最小化 loss 时，不是让参数都变小，而是沿着能让 loss 下降的方向走。', 'To minimize loss, move opposite the gradient.'), copy('像在山坡上看脚下坡度，然后往下降方向迈一步。', 'Like stepping along the steepest downhill direction on terrain.'), copy('若 \\(\\theta=2\\)、\\(\\nabla L=3\\)、\\(\\eta=0.1\\)，新参数是 1.7。', 'If \\(\\theta=2\\), \\(\\nabla L=3\\), and \\(\\eta=0.1\\), the new parameter is 1.7.'), copy('几乎所有可微模型训练都依赖这种局部更新思想。', 'Almost all differentiable model training relies on this local update idea.')),
      concept('beginner-partial-derivative', copy('偏导数', 'Partial Derivative'), '\\frac{\\partial L}{\\partial \\theta_i}', [variable('\\theta_i', '第 i 个参数旋钮。', 'The i-th parameter knob.'), variable('L', '训练时要降低的 loss。', 'The loss to reduce during training.')], copy('偏导数先固定其他参数，只看一个旋钮自己的局部影响。', 'A partial derivative holds other parameters fixed and reads one direction of local change.'), copy('像只转动控制台上的一个旋钮，观察 loss 表盘怎样动。', 'Like turning one knob on a control panel and watching the loss dial move.'), copy('若 \\(L(w,b)=0.5w^2+b\\)，则 \\(\\partial L/\\partial w=w\\)。', 'If \\(L(w,b)=0.5w^2+b\\), then \\(\\partial L/\\partial w=w\\).'), copy('神经网络每个权重和偏置都需要自己的偏导。', 'Each neural-network weight and bias needs its own partial derivative.')),
      concept('beginner-chain-rule', copy('链式法则', 'Chain Rule'), '\\frac{\\partial L}{\\partial w}=\\frac{\\partial L}{\\partial \\hat y}\\frac{\\partial \\hat y}{\\partial z}\\frac{\\partial z}{\\partial w}', [variable('\\hat y', '模型预测。', 'Model prediction.'), variable('z', '中间节点。', 'Intermediate node.')], copy('链式法则把沿路每一段局部影响连起来，读出参数对最终 loss 的影响。', 'The chain rule multiplies local effects along a path to get the parameter effect on final loss.'), copy('像沿着计算图把责任一站一站传回去。', 'Like passing responsibility backward station by station along a computation graph.'), copy('若上游梯度是 2，本地导数是 0.3，传回去就是 0.6。', 'If the upstream gradient is 2 and the local derivative is 0.3, the returned gradient is 0.6.'), copy('反向传播就是链式法则在计算图上的自动执行。', 'Backpropagation is the chain rule executed automatically on a computation graph.')),
      concept('beginner-gradient-check', copy('数值梯度检查', 'Numerical Gradient Check'), '\\frac{L(\\theta+\\epsilon)-L(\\theta-\\epsilon)}{2\\epsilon}', [variable('\\epsilon', '一个很小的扰动。', 'A tiny perturbation.'), variable('\\theta', '被检查的参数。', 'The parameter being checked.')], copy('用有限差分近似梯度，检查反向传播给出的方向是否靠谱。', 'Use finite differences to approximate a gradient and check whether backpropagation is reasonable.'), copy('像把旋钮分别往左右轻轻拨一下，再比较 loss 变化。', 'Like nudging a knob slightly left and right, then comparing loss change.'), copy('对 \\(L(\\theta)=0.5\\theta^2\\)，\\(\\epsilon\\) 很小时检查值接近 \\(\\theta\\)。', 'For \\(L(\\theta)=0.5\\theta^2\\), the check is close to \\(\\theta\\) when \\(\\epsilon\\) is small.'), copy('调试自定义 loss 或层时常用梯度检查。', 'Gradient checks are useful when debugging custom losses or layers.')),
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
      quiz('beginner-calculus-average', copy('如果买 2 斤和 5 斤菜的总价不同，平均变化率主要在比较什么？', 'What does average rate of change compare?'), 'two-points', copy('两个位置之间，输出变化除以输入变化。', 'Output change divided by input change between two positions.'), copy('函数在所有位置的最高值。', 'The highest value of the whole function.'), copy('平均变化率读一段区间。它问的是这段里平均每多 1 单位输入，输出多多少。', 'Average rate reads an interval, not the global maximum.'), 'average-vs-instant', 'beginner-calculus-story'),
      quiz('beginner-calculus-derivative', copy('导数最适合先理解成哪句话？', 'What is the best first intuition for a derivative?'), 'instant', copy('当前点附近的瞬时变化率。', 'The instantaneous rate of change near the current point.'), copy('整个函数的全局平均高度。', 'The global average height of the function.'), copy('导数来自把观察窗口缩小到当前点附近，所以它说的是“此刻这一下”的斜率。', 'A derivative comes from shrinking the observation window near the current point.'), 'calculus-is-global-formula'),
      quiz('beginner-calculus-gradient', copy('为什么梯度下降要减去梯度？', 'Why does gradient descent subtract the gradient?'), 'downhill', copy('梯度指向上升最快，负梯度指向下降。', 'The gradient points uphill, so negative gradient points downhill.'), copy('减号保证所有参数都变小。', 'The minus sign guarantees every parameter becomes smaller.'), copy('减去梯度是为了降低 loss。某些参数可能变大，关键是 loss 有没有往下走。', 'Subtracting the gradient aims to lower loss, not to make every parameter value smaller.'), 'gradient-means-smaller'),
      quiz('beginner-calculus-partial', copy('偏导数 \\(\\partial L/\\partial \\theta_i\\) 的入门读法是什么？', 'What is the beginner reading of \\(\\partial L/\\partial \\theta_i\\)?'), 'one-knob', copy('固定其他参数，只动第 i 个参数看 loss 怎么变。', 'Hold other parameters fixed and move parameter i to see how loss changes.'), copy('同时随机改变所有参数。', 'Randomly change all parameters at once.'), copy('偏导数先隔离一个方向。这样 loss 变了，我们才知道这个参数自己的局部影响。', 'A partial derivative reads local change along one parameter direction.'), 'partial-all-knobs', 'beginner-partial-gradient-longform'),
      quiz('beginner-calculus-chain', copy('反向传播最核心地复用了哪条规则？', 'Which rule does backpropagation reuse most centrally?'), 'chain-rule', copy('链式法则：上游梯度乘以局部导数。', 'The chain rule: upstream gradient times local derivative.'), copy('只比较训练集和验证集大小。', 'Only comparing training and validation set sizes.'), copy('反向传播沿计算图重复使用链式法则：每到一站，就把上游梯度乘上本地导数。', 'Backpropagation repeatedly applies the chain rule along the computation graph.'), 'backprop-not-magic', 'beginner-chain-rule-backprop-longform'),
      quiz('beginner-calculus-gradient-check', copy('数值梯度检查最适合用来做什么？', 'What is a numerical gradient check best used for?'), 'debug', copy('调试公式或反向传播实现是否合理。', 'Debug whether a formula or backprop implementation is reasonable.'), copy('替代每一步正式训练。', 'Replace every training step.'), copy('有限差分要反复算 loss，慢，但很适合在小模型上检查“公式、代码、自动微分”是否一致。', 'Finite differences are slow, so they are best for checking small models or local implementations.'), 'finite-difference-is-training'),
    ],
    misconceptions: [
      misconception('average-vs-instant', copy('平均变化率和导数是同一个东西。', 'Average change and derivative are the same thing.'), copy('平均变化率看一段区间；导数看窗口缩到当前点时的极限。', 'Average change reads an interval; a derivative is the limit as the window shrinks to the current point.'), copy('全程平均速度不等于某一秒的车速。买菜一整袋的平均单价，也不一定等于某个重量点附近的边际价格。', 'Average speed for a trip is not the speed at one second.')),
      misconception('calculus-is-global-formula', copy('导数就是整条曲线的全局平均。', 'A derivative is the global average of the whole curve.'), copy('导数是当前点附近的局部变化率。离开这个点，斜率可能已经变了。', 'A derivative is the local rate of change near the current point.'), copy('同一条曲线不同位置可以有不同斜率。', 'The same curve can have different slopes at different positions.')),
      misconception('gradient-means-smaller', copy('负梯度会让每个参数都变小。', 'Negative gradient makes every parameter smaller.'), copy('负梯度让 loss 局部下降；某些参数可能变大。看的是 loss，不是单个参数的大小。', 'Negative gradient locally lowers loss; some parameters may increase.'), copy('若梯度分量为负，减去它会让对应参数变大。', 'If a gradient component is negative, subtracting it increases that parameter.')),
      misconception('partial-all-knobs', copy('偏导数表示所有参数一起变化。', 'A partial derivative means all parameters change together.'), copy('偏导数先固定其他参数，只读一个方向。梯度才把多个方向收集起来。', 'A partial derivative holds other parameters fixed and reads one direction. The gradient collects many directions.'), copy('调权重 \\(w\\) 时，偏置 \\(b\\) 暂时当作不动的旋钮。这样才能看清 \\(w\\) 自己的影响。', 'When checking weight \\(w\\), bias \\(b\\) is temporarily treated as a fixed knob.')),
      misconception('backprop-not-magic', copy('反向传播是一个和导数无关的黑盒算法。', 'Backpropagation is a black-box algorithm unrelated to derivatives.'), copy('反向传播就是链式法则在计算图上的系统执行。', 'Backpropagation is the systematic execution of the chain rule on a computation graph.'), copy('每个节点只需要知道上游梯度和自己的局部导数，然后把结果传回去。', 'Each node needs the upstream gradient and its own local derivative.')),
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
    prerequisites: ['calculus-training-code-diagnostics'],
    aiModelConnections: [
      copy('分类器、语言模型和生成模型都会输出或使用概率分布。', 'Classifiers, language models, and generative models output or use probability distributions.'),
      copy('交叉熵、似然、采样和校准都需要先理解分布。', 'Cross entropy, likelihood, sampling, and calibration require distribution intuition first.'),
    ],
    learningObjectives: [
      copy('解释样本空间、事件和随机变量。', 'Explain sample space, event, and random variable.'),
      copy('把分布读成重复试验后留下的频率形状。', 'Read a distribution as the frequency shape left by repeated trials.'),
      copy('用条件概率和贝叶斯更新解释已知信息如何改变概率。', 'Use conditional probability and Bayes update to explain how evidence changes probability.'),
      copy('区分均匀分布、二项分布和 normal distribution 的基本形状。', 'Distinguish the basic shapes of uniform, binomial, and normal distributions.'),
      copy('把期望、方差、softmax、校准和交叉熵连接到模型训练。', 'Connect expectation, variance, softmax, calibration, and cross entropy to model training.'),
    ],
    concepts: [
      concept('beginner-sample-space', copy('样本空间', 'Sample Space'), '\\Omega=\\{\\omega_1,\\omega_2,\\ldots\\}', [variable('\\Omega', '所有可能结果的集合。', 'The set of all possible outcomes.')], copy('先列出可能结果，概率讨论才有对象。', 'List possible outcomes first so probability has objects to discuss.'), copy('像给随机实验画出所有出口。', 'Like drawing all exits of a random experiment.'), copy('三分类器的样本空间可以是 \\{猫,狗,鸟\\}。', 'A three-class classifier can have sample space \\{cat,dog,bird\\}.'), copy('分类模型的输出概率分布定义在类别样本空间上。', 'Classifier probability outputs are defined over a class sample space.')),
      concept('beginner-random-variable', copy('随机变量', 'Random Variable'), 'X:\\Omega\\to\\mathbb{R}', [variable('X', '把结果映射成数字的规则。', 'A rule mapping outcomes to numbers.')], copy('随机变量把文字结果变成可计算数字。', 'A random variable turns named outcomes into computable numbers.'), copy('像给每种结果贴一个数值标签。', 'Like attaching a numeric tag to each outcome.'), copy('硬币正面记 1、反面记 0。', 'Coin heads can map to 1 and tails to 0.'), copy('模型评估中的正确/错误、类别编号和 reward 都可以看成随机变量。', 'Correctness, class index, and reward in model evaluation can be random variables.')),
      concept('beginner-distribution', copy('概率分布', 'Probability Distribution'), '\\sum_i p_i=1,\\quad p_i\\ge0', [variable('p_i', '第 i 个结果的概率。', 'Probability of outcome i.')], copy('分布给每个可能结果分配非负概率，并且总和为 1。', 'A distribution assigns nonnegative probabilities to possible outcomes, summing to 1.'), copy('直方图越高，长期出现得越频繁。', 'A taller histogram bar means the outcome appears more often in the long run.'), copy('\\([0.7,0.2,0.1]\\) 是三类上的概率分布。', '\\([0.7,0.2,0.1]\\) is a distribution over three classes.'), copy('softmax 输出、采样温度和交叉熵都操作概率分布。', 'Softmax outputs, sampling temperature, and cross entropy operate on distributions.')),
      concept('beginner-conditional-probability', copy('条件概率', 'Conditional Probability'), 'P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}', [variable('A', '关心的事件。', 'event of interest'), variable('B', '已经知道的条件或信息。', 'known condition or evidence')], copy('条件概率是在已知条件成立的样本空间里重新计算比例。', 'Conditional probability recomputes proportion inside the space where evidence is known.'), copy('像先筛出“带信号”的样本，再数其中有多少属于目标事件。', 'Like filtering examples with a signal, then counting how many belong to the target event.'), copy('1000 封邮件中，带可疑链接的那部分才是计算后验时的新分母。', 'Among 1000 emails, the suspicious-link subset becomes the new denominator for posterior reading.'), copy('验证集切片、分布漂移和公平性分析都依赖“在什么条件下”的概率。', 'Validation slices, distribution shift, and fairness analysis all depend on probability under conditions.')),
      concept('beginner-bayes-update', copy('贝叶斯更新', 'Bayes Update'), 'P(A\\mid B)=\\frac{P(B\\mid A)P(A)}{P(B)}', [variable('P(A)', '看到信号前的先验。', 'prior before evidence'), variable('P(B\\mid A)', '事件成立时看到信号的 likelihood。', 'likelihood of evidence if the event is true'), variable('P(A\\mid B)', '看到信号后的后验。', 'posterior after evidence')], copy('贝叶斯更新把基准比例和信号强度合在一起。', 'Bayes update combines base rate and signal strength.'), copy('像先看班级里近视人数比例，再看“坐最后一排看不清”的信号怎样改变判断。', 'Like starting from the class base rate, then updating after evidence such as difficulty seeing from the back row.'), copy('先验 8%、命中率 82%、误报率 12% 时，后验不是 82%，而要重新按信号人数计算。', 'With 8% prior, 82% hit rate, and 12% false alarm rate, the posterior is not 82%; it must be recomputed from evidence counts.'), copy('垃圾邮件过滤、医学检测和异常检测都要避免忽略 base rate。', 'Spam filtering, medical tests, and anomaly detection must avoid ignoring base rate.')),
      concept('beginner-expectation-variance', copy('期望与方差', 'Expectation and Variance'), '\\mathbb{E}[X]=\\sum_i x_i p_i,\\quad \\operatorname{Var}(X)=\\mathbb{E}[(X-\\mathbb{E}[X])^2]', [variable('\\mathbb{E}[X]', '长期平均中心。', 'long-run average center'), variable('\\operatorname{Var}(X)', '围绕中心的波动大小。', 'spread around the center')], copy('期望读中心，方差读稳定性。', 'Expectation reads center; variance reads stability.'), copy('像看跷跷板的平衡点和球散开的程度。', 'Like reading a balance point and how widely balls scatter around it.'), copy('两个分布可以均值相同，但一个集中、一个分散。', 'Two distributions can share a mean while one is concentrated and the other is spread out.'), copy('采样稳定性、噪声判断和生成模型温度都需要中心与波动。', 'Sampling stability, noise checks, and generation temperature all need center and spread.')),
      concept('beginner-calibration', copy('校准', 'Calibration'), 'P(Y=1\\mid \\hat p\\approx c)\\approx c', [variable('\\hat p', '模型给出的预测概率。', 'model predicted probability'), variable('c', '某个置信度分箱。', 'a confidence bin')], copy('校准检查模型说出的概率能不能当作真实频率来信任。', 'Calibration checks whether model probabilities can be trusted as real frequencies.'), copy('像把所有“我有 70% 把握”的样本放在一起，看实际对了多少。', 'Like grouping all examples where the model says 70% and checking how many are actually correct.'), copy('若 90% 置信样本只有 60% 正确，模型过度自信。', 'If 90% confidence examples are only 60% correct, the model is overconfident.'), copy('风险控制、医疗分类和推荐排序不能只看 top-1 对错，还要看概率是否可信。', 'Risk control, medical classification, and recommendation ranking need trustworthy probabilities, not only top-1 correctness.')),
    ],
    sections: probabilitySections,
    visuals: [
      imageAsset('beginner-probability-story', 'beginner-probability-story.png', copy('概率分布入门故事', 'Beginner Probability Distribution Story'), copy('重复样本落入分桶，形成分布曲线，并连接到分类概率条。', 'Repeated samples fall into bins, form a distribution curve, and connect to classifier probability bars.')),
      imageAsset(
        'beginner-probability-why-longform',
        'beginner-probability-why-longform.png',
        copy('为什么 AI 要学概率', 'Why AI Needs Probability'),
        copy('用天气、邮件和 next token 例子说明概率是 AI 描述不确定性的语言，不是猜一次中不中。', 'Weather, email, and next-token examples show probability as AI uncertainty language, not one-time guessing.'),
      ),
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
        'beginner-conditional-probability-longform',
        'beginner-conditional-probability-longform.png',
        copy('条件概率：已知信息筛选样本空间', 'Conditional Probability: Evidence Filters the Sample Space'),
        copy('先从总体样本空间中筛出满足条件的样本，再在新的分母里计算目标事件比例。', 'Filter the overall sample space by evidence first, then compute the target event proportion inside the new denominator.'),
      ),
      imageAsset(
        'beginner-bayes-update-longform',
        'beginner-bayes-update-longform.png',
        copy('贝叶斯更新：先验、信号和后验', 'Bayes Update: Prior, Evidence, and Posterior'),
        copy('把垃圾邮件基准比例、信号命中率和误报率组合起来，展示后验概率为什么不同于单独的信号强度。', 'Combine spam base rate, signal hit rate, and false alarm rate to show why posterior probability differs from signal strength alone.'),
      ),
      imageAsset(
        'beginner-expectation-variance-longform',
        'beginner-expectation-variance-longform.png',
        copy('期望与方差：中心和波动', 'Expectation and Variance: Center and Spread'),
        copy('两组分布用同一均值但不同波动做对比，解释期望读长期中心，方差读不确定性大小。', 'Two distributions with the same mean but different spread explain that expectation reads long-run center while variance reads uncertainty size.'),
      ),
      imageAsset(
        'beginner-calibration-confidence-longform',
        'beginner-calibration-confidence-longform.png',
        copy('校准：高置信度也要接受频率检查', 'Calibration: High Confidence Needs Frequency Checks'),
        copy('把模型给出的置信度按分箱比较实际正确率，说明高概率不自动等于可靠。', 'Bin model confidence and compare actual accuracy to show that high probability is not automatically reliability.'),
      ),
      imageAsset(
        'beginner-softmax-cross-entropy-longform',
        'beginner-softmax-cross-entropy-longform.png',
        copy('Softmax 与交叉熵：把分数变成训练信号', 'Softmax and Cross Entropy: Turn Scores into a Training Signal'),
        copy('logits 经过 softmax 变成概率条，真实类别概率越低，交叉熵惩罚越大，从而驱动分类模型学习。', 'Logits become probability bars through softmax; the lower the true-class probability, the larger cross entropy becomes, driving classifier training.'),
      ),
      manimAsset('beginner-probability-frequency-video', 'beginner-probability-frequency', copy('一次结果到长期频率', 'One Outcome to Long-Run Frequency'), copy('动画展示单次结果如何波动，重复试验如何逐渐形成稳定的分布形状。', 'Animation showing how one outcome is noisy while repeated trials form a stable distribution shape.')),
      manimAsset('beginner-conditional-bayes-video', 'beginner-conditional-bayes', copy('条件筛选与贝叶斯更新', 'Conditional Filtering and Bayes Update'), copy('动画展示已知信息如何筛选样本空间，以及先验、likelihood、归一化项如何组合成后验。', 'Animation showing how evidence filters the sample space and how prior, likelihood, and evidence combine into a posterior.')),
      manimAsset('beginner-calibration-cross-entropy-video', 'beginner-calibration-cross-entropy', copy('校准与交叉熵', 'Calibration and Cross Entropy'), copy('动画连接概率条、校准分箱和真实类别概率过低时的负对数惩罚。', 'Animation connecting probability bars, calibration bins, and negative-log penalty when target probability is low.')),
    ],
    labs: [
      lab('beginner-distribution-builder-lab', copy('分布构造实验', 'Distribution Builder Lab'), 'DistributionBuilderLab', [
        copy('能解释样本数增加时频率形状为什么更稳定。', 'Explain why frequency shape stabilizes as sample count grows.'),
        copy('能比较均匀、二项和 normal distribution 的均值与方差。', 'Compare the mean and variance of uniform, binomial, and normal distributions.'),
      ]),
      lab('beginner-conditional-bayes-lab', copy('条件概率与贝叶斯实验', 'Conditional Probability and Bayes Lab'), 'ConditionalBayesLab', [
        copy('能说明已知信息如何改变分母和后验概率。', 'Explain how evidence changes the denominator and posterior probability.'),
        copy('能指出忽略 base rate 为什么会夸大概率。', 'Explain why ignoring base rate exaggerates probability.'),
      ]),
    ],
    quizzes: [
      quiz('beginner-probability-space', copy('样本空间回答什么问题？', 'What question does a sample space answer?'), 'possible', copy('可能有哪些结果。', 'Which outcomes are possible.'), copy('模型有多少层。', 'How many layers the model has.'), copy('概率必须先知道结果集合，才能给结果分配概率。', 'Probability must know the outcome set before assigning probabilities.'), 'sample-space', 'beginner-probability-story'),
      quiz('beginner-probability-distribution', copy('为什么不能用一次结果判断整个分布？', 'Why can one result not determine the whole distribution?'), 'sample', copy('一次结果只是一个样本，可能很偶然。', 'One outcome is just one sample and may be accidental.'), copy('因为概率分布不允许重复试验。', 'Because distributions forbid repeated trials.'), copy('分布描述长期频率形状，需要多次观察。', 'A distribution describes long-run frequency shape and needs repeated observation.'), 'one-trial'),
      quiz('beginner-probability-conditional', copy('条件概率 \\(P(A\\mid B)\\) 中，真正改变的是什么？', 'In conditional probability \\(P(A\\mid B)\\), what really changes?'), 'denominator', copy('分母变成满足条件 \\(B\\) 的样本空间。', 'The denominator becomes the sample space satisfying condition \\(B\\).'), copy('事件 \\(A\\) 的名字自动变成事件 \\(B\\)。', 'The name of event \\(A\\) automatically becomes event \\(B\\).'), copy('条件概率不是换个符号，而是在“已知 \\(B\\)”的样本里重新计算 \\(A\\) 的比例。回看条件概率图和贝叶斯实验。', 'Conditional probability is not just a new symbol; it recomputes the proportion of \\(A\\) inside examples where \\(B\\) is known. Revisit the conditional diagram and Bayes lab.'), 'conditional-denominator', 'beginner-conditional-probability-longform'),
      quiz('beginner-probability-bayes', copy('贝叶斯更新为什么不能只看 likelihood？', 'Why can Bayes update not look only at likelihood?'), 'base-rate', copy('还要乘上先验并除以总体信号概率。', 'It must also use the prior and divide by total evidence.'), copy('因为 likelihood 永远等于 0。', 'Because likelihood is always 0.'), copy('信号强不等于后验高。若目标事件本来很少，误报会明显影响后验。请回看贝叶斯更新图。', 'A strong signal does not guarantee a high posterior. If the target event is rare, false alarms strongly affect the posterior. Revisit the Bayes update image.'), 'bayes-base-rate', 'beginner-bayes-update-longform'),
      quiz('beginner-probability-expectation', copy('两个分布均值相同，使用体验一定一样吗？', 'If two distributions share the same mean, must they feel the same?'), 'variance', copy('不一定，还要看方差和波动。', 'No; variance and spread also matter.'), copy('一定一样，因为均值决定所有结果。', 'Yes, because the mean determines every outcome.'), copy('期望只读长期中心，方差读围绕中心的波动。生成采样和模型稳定性都需要两者一起看。', 'Expectation reads long-run center; variance reads spread around that center. Sampling and model stability need both.'), 'expectation-only', 'beginner-expectation-variance-longform'),
      quiz('beginner-probability-softmax', copy('分类器输出 \\([0.7,0.2,0.1]\\) 更接近什么？', 'A classifier output \\([0.7,0.2,0.1]\\) is closest to what?'), 'distribution', copy('类别样本空间上的概率分布。', 'A probability distribution over the class sample space.'), copy('二维坐标。', 'A two-dimensional coordinate.'), copy('非负且总和为 1 的概率条表示模型的不确定性分配。', 'Nonnegative probability bars summing to 1 represent how the model distributes uncertainty.'), 'probability-bars'),
      quiz('beginner-probability-calibration', copy('校准主要在检查哪件事？', 'What does calibration mainly check?'), 'frequency', copy('预测概率是否接近真实正确频率。', 'Whether predicted probabilities match observed correctness frequencies.'), copy('模型是否永远选择最大概率。', 'Whether the model always chooses the largest probability.'), copy('准确率只看 top-1 对错，校准还看概率数值能不能被信任。回看校准图。', 'Accuracy checks top-1 correctness; calibration checks whether probability values can be trusted. Revisit the calibration image.'), 'calibration', 'beginner-calibration-confidence-longform'),
    ],
    misconceptions: [
      misconception('sample-space', copy('不用列出可能结果也能严谨谈概率。', 'We can discuss probability rigorously without listing possible outcomes.'), copy('样本空间定义了概率要分配到哪些结果上。', 'The sample space defines which outcomes receive probability.'), copy('三分类和二分类的概率条长度不同，因为样本空间不同。', 'A three-class and two-class probability bar have different lengths because their sample spaces differ.')),
      misconception('one-trial', copy('看到一次结果，就知道整个分布。', 'Seeing one outcome reveals the whole distribution.'), copy('一次结果只是样本；分布要看重复试验后的形状。', 'One outcome is only a sample; a distribution is read from repeated-trial shape.'), copy('一次抽到高分不代表所有样本都高分。', 'Drawing one high value does not mean all samples are high.')),
      misconception('conditional-denominator', copy('条件概率只是把两个事件名字写在一起。', 'Conditional probability only writes two event names together.'), copy('条件会改变分母：只在满足条件的样本里重新计算比例。', 'The condition changes the denominator: recompute the proportion only inside examples satisfying the condition.'), copy('“随机邮件是垃圾邮件”和“带可疑链接的邮件是垃圾邮件”不是同一个概率。', '"A random email is spam" and "an email with a suspicious link is spam" are not the same probability.')),
      misconception('bayes-base-rate', copy('信号很准，所以后验概率就等于命中率。', 'A strong signal means the posterior equals the hit rate.'), copy('后验还要考虑先验和误报率。忽略 base rate 会夸大罕见事件。', 'Posterior also depends on prior and false alarm rate. Ignoring base rate exaggerates rare events.'), copy('疾病很罕见时，即使检测敏感，也要看假阳性会带来多少带信号样本。', 'When a disease is rare, even a sensitive test must be read together with false positives.')),
      misconception('expectation-only', copy('均值一样，两个分布就完全一样。', 'If means match, two distributions are identical.'), copy('均值只读中心；方差、偏斜和尾部仍可能不同。', 'Mean reads only center; variance, skew, and tails may still differ.'), copy('两条生成策略平均分相同，但一个稳定、一个忽高忽低，体验会不同。', 'Two generation strategies can share an average score while one is stable and the other swings wildly.')),
      misconception('probability-bars', copy('最高概率高，模型就一定可靠。', 'A high top probability means the model is certainly reliable.'), copy('概率条还需要校准检查。', 'Probability bars still need calibration checks.'), copy('模型说 90% 的样本若实际只有 60% 正确，就是过度自信。', 'If examples predicted at 90% are only 60% correct, the model is overconfident.')),
      misconception('calibration', copy('准确率高就说明所有概率都可信。', 'High accuracy means every probability is trustworthy.'), copy('准确率和校准是不同问题。概率要和实际频率对齐，才能作为风险数值使用。', 'Accuracy and calibration are different. Probabilities must match observed frequencies before being used as risk values.'), copy('一个模型可以 top-1 经常正确，但把 70% 说成 95%。', 'A model can often get top-1 right while reporting 95% for cases that behave like 70%.')),
    ],
    accent: '#247a73',
    theme: '#e9f8f5',
    sourceReferences: [sources.seeingTheory, sources.statQuest, sources.d2l, sources.mml],
  }),
]
