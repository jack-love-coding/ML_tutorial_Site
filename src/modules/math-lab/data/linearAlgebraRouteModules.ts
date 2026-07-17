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
      '作为案例分析的视觉锚点，帮助学生先看见问题结构，再进入公式。',
      'Serve as a visual anchor for the case study before formulas appear.',
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
      '用短动画展示静态图难以表达的连续变化。',
      'Use a short animation to show continuous change that a static image cannot show.',
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

function misconception(id: string, statement: LocalizedCopy, correction: LocalizedCopy, example: LocalizedCopy): Misconception {
  return { id, statement, correction, example }
}

const sources: Record<string, SourceReference> = {
  essenceLinearAlgebra: {
    label: copy('3Blue1Brown：线性代数的本质', '3Blue1Brown: Essence of Linear Algebra'),
    href: 'https://www.3blue1brown.com/topics/linear-algebra',
    usage: copy(
      '参考向量、矩阵变换、rank 和几何直觉的可视化组织方式。',
      'Reference for visual organization of vectors, transformations, rank, and geometric intuition.',
    ),
  },
  d2lLinearAlgebra: {
    label: copy('Dive into Deep Learning：线性代数', 'Dive into Deep Learning: Linear Algebra'),
    href: 'https://d2l.ai/chapter_preliminaries/linear-algebra.html',
    usage: copy(
      '参考机器学习中向量、矩阵、范数和张量的基础表达。',
      'Reference for vectors, matrices, norms, and tensor notation in machine learning.',
    ),
  },
  mml: {
    label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'),
    href: 'https://mml-book.github.io/',
    usage: copy(
      '参考线性代数、向量空间、矩阵分解与机器学习联系。',
      'Reference for linear algebra, vector spaces, matrix decompositions, and machine-learning connections.',
    ),
  },
}

function moduleDefinition(input: Omit<MathLabModule, 'order' | 'toc' | 'nextModuleIds'>): MathLabModule {
  return {
    ...input,
    order: 0,
    toc: input.sections.map((item) => ({ id: item.id, level: item.level, title: item.title })),
    nextModuleIds: [],
    importedAssetPaths:
      input.importedAssetPaths ??
      input.visuals.flatMap((visual) => [visual.assetPath, visual.posterPath]).filter((path): path is string => Boolean(path)),
  }
}

export const linearAlgebraRouteModules: MathLabModule[] = [
  moduleDefinition({
    id: 'linear-algebra-feature-space',
    enhancementTier: 'interactive',
    title: copy('向量与特征空间', 'Vectors and Feature Space'),
    subtitle: copy(
      '从学习记录、用户画像和句子 embedding 出发，理解现实对象怎样进入同一个坐标空间。',
      'Use learner records, user profiles, and sentence embeddings to understand how real objects enter one coordinate space.',
    ),
    difficulty: 'foundation',
    estimatedMinutes: 34,
    prerequisites: ['beginner-linear-algebra'],
    aiModelConnections: [
      copy(
        '推荐、检索和分类都先把对象写成向量；本章把这个表示动作讲清楚。',
        'Recommendation, retrieval, and classification first write objects as vectors; this chapter clarifies that representation step.',
      ),
    ],
    learningObjectives: [
      copy('把一个现实对象解释成同一特征空间中的坐标。', 'Explain a real object as coordinates in one feature space.'),
      copy('用向量差描述两个对象之间的变化方向。', 'Use vector differences to describe the direction of change between two objects.'),
      copy(
        '说明 2D/3D 箭头为什么只是高维向量的可视化入口。',
        'Explain why 2D/3D arrows are visual entry points for high-dimensional vectors.',
      ),
    ],
    concepts: [
      concept(
        'feature-vector-space',
        copy('特征向量', 'Feature Vector'),
        '\\mathbf{x}=[x_1,x_2,\\ldots,x_n]^\\top',
        [variable('x_i', '同一个对象在第 i 个特征方向上的坐标。', 'The coordinate of the same object along feature direction i.')],
        copy(
          '向量把同一个对象的多个观察值放进一个有顺序的坐标系统。',
          'A vector places multiple observations about one object into an ordered coordinate system.',
        ),
        copy(
          '在二维里可以画成箭头；在高维里仍然表示方向、位置和变化。',
          'In 2D it can be drawn as an arrow; in high dimensions it still represents direction, position, and change.',
        ),
        copy(
          '学习记录 \\([2,5,80]\\) 可以读成练习 2 次、错 5 题、得 80 分。',
          'A learner record \\([2,5,80]\\) can mean 2 practice sessions, 5 mistakes, and a score of 80.',
        ),
        copy(
          'Embedding、用户画像和模型输入特征都依赖这个表示动作。',
          'Embeddings, user profiles, and model input features all depend on this representation step.',
        ),
        md`const learner = [2, 5, 80]
const nextLearner = [3, 4, 82]
const change = nextLearner.map((value, index) => value - learner[index]!)
// [1, -1, 2]`,
      ),
    ],
    sections: [
      section(
        'feature-space-case',
        copy('案例：一条学习记录怎样变成向量', 'Case: How a Learner Record Becomes a Vector'),
        copy(
          md`先看一个学生的学习记录：练习次数、错题数、测验分数和复习间隔。单独看每个数字，它们只是表格里的格子；放在一起，它们描述的是同一个学习状态。向量的第一步不是抽象，而是把“同一个对象的多项观察”放进同一个坐标空间。学习目标不是背下“向量等于数组”，而是能说清楚：每个坐标代表哪个特征方向，整个对象位于哪里，两个对象之间怎样变化。

这也是机器学习输入层最朴素的故事。学习记录、用户画像、商品属性和句子 embedding 都会先被整理成特征向量。后续模型不直接处理“学生”或“句子”这些完整现实对象，而是处理这些对象在特征空间里的坐标。`,
          md`Start with one learner record: practice count, mistake count, quiz score, and review gap. Each number alone is only a cell in a table; together they describe one learning state. Learning objectives in this chapter are to read each coordinate as a feature direction, place the whole object in a shared feature space, and describe how one object changes into another.

This is also the simplest story of a machine-learning input layer. Learner records, user profiles, product attributes, and sentence embeddings are first organized as feature vectors. Later models do not directly process the full real-world object named "student" or "sentence"; they process coordinates for that object inside a feature space.`,
        ),
        { visualIds: ['linear-algebra-feature-cards'], labIds: ['feature-vector-story-lab'] },
      ),
      section(
        'feature-space-difference-vector',
        copy('差向量：两个对象之间发生了什么变化', 'Difference Vector: What Changed Between Two Objects'),
        copy(
          md`如果学生 A 是 \([2,5,80]\)，学生 B 是 \([3,4,82]\)，那么 \(\mathbf{b}-\mathbf{a}=[1,-1,2]\)。这不是三个孤立数字，而是“多练一次、少错一题、高两分”的变化方向。差向量会迫使我们保持维度含义一致：第一个位置仍然是练习次数，第二个位置仍然是错题数，第三个位置仍然是测验分数。

这一步很适合训练“从数字回到故事”的习惯。模型训练日志里常看到向量更新、embedding 偏移和特征漂移；如果你能把差向量读成变化方向，就不会把这些记录误解成无意义的数字串。`,
          md`If learner A is \([2,5,80]\) and learner B is \([3,4,82]\), then \(\mathbf{b}-\mathbf{a}=[1,-1,2]\). That is not three isolated numbers; it is the change direction: one more practice session, one fewer mistake, and two more score points. The difference vector forces the dimensions to keep their meaning: first position is still practice count, second is still mistakes, and third is still quiz score.

This is a good place to practice moving from numbers back to story. Training logs often contain vector updates, embedding shifts, and feature drift. If you can read a difference vector as a change direction, those records stop looking like meaningless numeric strings.`,
        ),
      ),
      section(
        'feature-space-high-dimensional',
        copy('高维向量：画不出来，但规则没有变', 'High-Dimensional Vectors: Hard to Draw, Same Rules'),
        copy(
          md`句子 embedding 可能有几百维。我们画不出每个维度，但仍然可以比较方向、长度和差向量。二维箭头只是入口，不是定义本身。你可以把高维向量想成一张很长的特征卡：每一格都不是孤立评价，而是同一个对象在某个学习到的方向上的坐标。

高维难画，并不代表高维不可理解。我们保留三件事：坐标表示对象，差向量表示变化，后面的距离和相似度会比较这些对象之间的关系。`,
          md`A sentence embedding may have hundreds of dimensions. We cannot draw every dimension, but we can still compare direction, length, and difference vectors. A 2D arrow is an entry point, not the definition itself. You can treat a high-dimensional vector as a long feature card: each slot is not an isolated rating, but the coordinate of the same object along one learned direction.

High dimensions are hard to draw, but they are not impossible to reason about. Keep three ideas: coordinates represent an object, a difference vector represents change, and later distance or similarity compares relationships between those objects.`,
        ),
        { visualIds: ['high-dimensional-embedding-search'] },
      ),
      section(
        'feature-space-case-review',
        copy('案例复盘：表示决定了后续比较', 'Case Review: Representation Decides Later Comparison'),
        copy(
          md`同一个学生、商品或句子可以有不同特征设计。选择哪些维度，决定了后面距离、相似度、矩阵变换和降维分析能看见什么。如果把“复习间隔”漏掉，模型就很难知道学习者是否需要间隔重复；如果把文本做成 embedding，检索系统才有机会比较语义方向。

复习问题：这个对象有哪些特征？这些特征是否描述同一个对象？两个样本相减时，每个分量能不能用自然语言解释？如果答案都清楚，再进入距离、相似度和矩阵变换会轻松很多。`,
          md`The same learner, product, or sentence can be represented with different feature designs. The chosen dimensions decide what later distance, similarity, matrix transforms, and dimensionality reduction can see. If review gap is omitted, the model has trouble seeing spaced repetition needs; if text is represented as an embedding, a retrieval system can compare semantic direction.

Review Questions: Which features describe this object? Do those features describe the same object rather than unrelated rows? When two samples are subtracted, can every component be explained in ordinary language? If those answers are clear, distance, similarity, and matrix transformations become much easier to learn.`,
        ),
      ),
    ],
    visuals: [
      imageAsset(
        'linear-algebra-feature-cards',
        'linear-algebra-feature-cards.png',
        copy('对象怎样变成向量', 'How Objects Become Vectors'),
        copy(
          '学习记录、推荐偏好和句子 embedding 被放进同一套向量语言。',
          'Learner records, recommendation preferences, and sentence embeddings enter the same vector language.',
        ),
      ),
      imageAsset(
        'high-dimensional-embedding-search',
        'high-dimensional-embedding-search.png',
        copy('高维 embedding 检索', 'High-Dimensional Embedding Search'),
        copy(
          '句子进入高维表示后，仍然可以用方向和距离做比较。',
          'Sentences become high-dimensional representations and can still be compared by direction and distance.',
        ),
      ),
    ],
    labs: [
      lab('feature-vector-story-lab', copy('特征向量故事实验', 'Feature Vector Story Lab'), 'FeatureVectorStoryLab', [
        copy('能解释向量差表示哪种样本变化。', 'Explain what sample change a vector difference represents.'),
        copy('能把三维特征卡读成一个对象在特征空间中的坐标。', 'Read a three-feature card as one object in feature space.'),
      ]),
    ],
    quizzes: [
      quiz(
        'feature-space-one-object',
        copy('为什么一排特征可以看成一个向量？', 'Why can a row of features be viewed as one vector?'),
        'same-object',
        copy('因为它们描述同一个对象在多个方向上的坐标。', 'Because they describe one object along several feature directions.'),
        copy('因为这些数字必须全部相等。', 'Because the numbers must all be equal.'),
        copy(
          '向量把同一个对象的多个观察值放进同一空间，后续才能比较变化和相似度。',
          'A vector places several observations about one object in one space, so later change and similarity can be compared.',
        ),
        'vector-is-only-list',
        'linear-algebra-feature-cards',
      ),
      quiz(
        'feature-space-difference',
        copy('向量 \\([1,-1,2]\\) 作为两个学习记录的差，最合理的解释是什么？', 'As the difference between two learner records, what does \\([1,-1,2]\\) most reasonably mean?'),
        'change-direction',
        copy('多练一次、少错一题、分数高两分。', 'One more practice session, one fewer mistake, and two more score points.'),
        copy('三个学生的编号。', 'The IDs of three learners.'),
        copy('差向量描述的是同一组维度上的变化方向。', 'A difference vector describes change along the same dimensions.'),
        'difference-is-random-list',
      ),
    ],
    misconceptions: [
      misconception(
        'vector-is-only-list',
        copy('向量只是普通列表。', 'A vector is just a plain list.'),
        copy(
          '向量同时是数据表示和空间位置；后续比较依赖这个空间解释。',
          'A vector is both data representation and spatial position; later comparison depends on this spatial reading.',
        ),
        copy('embedding 相似度比较的不是单个数字，而是整体方向。', 'Embedding similarity compares overall direction, not one number at a time.'),
      ),
      misconception(
        'difference-is-random-list',
        copy('两个向量相减只是得到另一串没意义的数。', 'Subtracting two vectors only gives another meaningless list.'),
        copy(
          '差向量说明从一个对象到另一个对象要沿每个特征方向走多少。',
          'A difference vector says how far to move along each feature direction from one object to another.',
        ),
        copy('\\([1,-1,2]\\) 可以读成多练、少错、分数提高。', '\\([1,-1,2]\\) can be read as more practice, fewer mistakes, and a higher score.'),
      ),
    ],
    accent: '#3868ff',
    theme: '#eef3ff',
    sourceNoteFile: 'math-lab-linear-algebra-route-sources.md',
    importedAssetPaths: [
      '/math-lab/generated/linear-algebra-feature-cards.png',
      '/math-lab/generated/high-dimensional-embedding-search.png',
    ],
    sourceReferences: [sources.essenceLinearAlgebra, sources.d2lLinearAlgebra, sources.mml],
  }),
  moduleDefinition({
    id: 'linear-algebra-distance-similarity',
    enhancementTier: 'interactive',
    title: copy('距离、范数与相似度', 'Distance, Norms, and Similarity'),
    subtitle: copy(
      '用语义搜索案例区分“位置多近”和“方向多像”。',
      'Use semantic search to separate position closeness from directional similarity.',
    ),
    difficulty: 'foundation',
    estimatedMinutes: 38,
    prerequisites: ['linear-algebra-feature-space'],
    aiModelConnections: [
      copy(
        '语义检索、推荐排序和 embedding 检查都需要区分距离和方向相似度。',
        'Semantic retrieval, recommendation ranking, and embedding inspection need the distinction between distance and directional similarity.',
      ),
    ],
    learningObjectives: [
      copy('用 norm 解释一个向量自己的长度。', 'Use a norm to explain the length of one vector.'),
      copy('用 Euclidean distance 解释两个对象的位置差。', 'Use Euclidean distance to explain the position gap between two objects.'),
      copy('用 dot product 和 cosine similarity 解释方向相似度。', 'Use dot product and cosine similarity to explain directional similarity.'),
    ],
    concepts: [
      concept(
        'norm-distance-cosine-search',
        copy('距离与余弦相似度', 'Distance and Cosine Similarity'),
        '\\operatorname{cosine}(\\mathbf{x},\\mathbf{y})=\\frac{\\mathbf{x}^{\\top}\\mathbf{y}}{\\|\\mathbf{x}\\|_2\\|\\mathbf{y}\\|_2}',
        [
          variable('\\|\\mathbf{x}\\|_2', '向量自己的欧几里得长度。', 'The Euclidean length of one vector.'),
          variable('\\|\\mathbf{x}-\\mathbf{y}\\|_2', '两个向量终点之间的欧几里得距离。', 'The Euclidean distance between two vector endpoints.'),
          variable('\\theta', '两个向量之间的夹角。', 'The angle between two vectors.'),
        ],
        copy('距离看位置差，cosine similarity 看方向接近程度。', 'Distance reads position gap; cosine similarity reads directional alignment.'),
        copy(
          '两支箭头可以方向很像但长度差很大，因此 cosine 高而距离不短。',
          'Two arrows can point in similar directions but have very different lengths, so cosine can be high while distance is not small.',
        ),
        copy(
          '若 \\((3,4)\\) 和 \\((30,40)\\) 同向，cosine 为 1，但欧氏距离很大。',
          'If \\((3,4)\\) and \\((30,40)\\) point in the same direction, cosine is 1 but Euclidean distance is large.',
        ),
        copy(
          '语义搜索常用 cosine similarity 排序 embedding，因为问题通常是“语义方向像不像”。',
          'Semantic search often ranks embeddings by cosine similarity because the question is usually whether semantic directions align.',
        ),
      ),
    ],
    sections: [
      section(
        'distance-search-case',
        copy('案例：搜索为什么不只数关键词', 'Case: Why Search Does Not Only Count Keywords'),
        copy(
          md`用户搜索“怎么提高睡眠质量”，一篇文章标题可能是“改善入睡困难的生活习惯”。关键词不完全相同，但语义方向接近。我们需要把 query 和文档放进 embedding 空间，再比较方向和距离。本章学习目标对应到这个案例，就是先能说清 norm 在量什么，再能区分 Euclidean distance 和 cosine similarity，最后能解释指标选择怎样改变检索结果。`,
          md`A user searches "how to sleep better," while an article may be titled "habits that improve difficulty falling asleep." Keywords differ, but semantic direction can be close. We need to place the query and documents into embedding space, then compare direction and distance. Learning objectives in this chapter are to explain what a norm measures, separate Euclidean distance from cosine similarity, and describe how metric choice changes retrieval results.`,
        ),
        { visualIds: ['cosine-vs-distance-intuition', 'high-dimensional-embedding-search'], labIds: ['vector-similarity-lab'] },
      ),
      section(
        'distance-norm-ruler',
        copy('norm：先量一支向量自己的长度', 'Norm: First Measure One Vector'),
        copy(
          md`norm 是尺子。对 \((3,4)\)，欧氏 norm 是 \(5\)。语义 embedding 里，norm 可能混入文本长度、频率或模型尺度，所以不能把“长度大”直接当成“语义更好”。如果系统没有做归一化，长文档和短查询的比较可能被尺度影响；如果做了归一化，方向信息会变得更突出。

因此先问“我在量长度，还是在量两个点之间的差？”长度是一个向量自己的属性，距离是两个向量之间的关系。这个小区别会影响搜索、推荐和异常检测。`,
          md`A norm is a ruler. For \((3,4)\), the Euclidean norm is \(5\). In semantic embeddings, norm can mix in text length, frequency, or model scale, so "larger length" should not be read as "better meaning." Without normalization, comparison between long documents and short queries may be affected by scale; with normalization, direction becomes more prominent.

So first ask, "Am I measuring the length of one vector, or the gap between two points?" Length belongs to one vector. Distance is a relationship between two vectors. That small distinction affects search, recommendation, and anomaly detection.`,
        ),
        { visualIds: ['vector-distance-norm-intuition', 'vector-distance-norm-video'] },
      ),
      section(
        'distance-cosine-ranking',
        copy('两套排序：距离最近与方向最像', 'Two Rankings: Closest Distance and Most Similar Direction'),
        copy(
          md`同一组候选文章，用 Euclidean distance 和 cosine similarity 可能得到不同排序。这个差异不是 bug，而是两个问题不同：位置多近，还是方向多像。两个 embedding 方向几乎一样但长度差很大时，cosine 会认为它们相似，Euclidean distance 仍会觉得终点离得远。

点积把长度和夹角合在一起：\(\mathbf{x}^{\top}\mathbf{y}=\|\mathbf{x}\|\|\mathbf{y}\|\cos\theta\)。如果只想看方向，就要把长度除掉。`,
          md`The same article candidates can rank differently under Euclidean distance and cosine similarity. This is not a bug; the two questions differ: how close are positions, or how aligned are directions? When two embeddings point in almost the same direction but have very different lengths, cosine calls them similar while Euclidean distance still sees distant endpoints.

The dot product combines length and angle: \(\mathbf{x}^{\top}\mathbf{y}=\|\mathbf{x}\|\|\mathbf{y}\|\cos\theta\). If the task only wants direction, length must be divided away.`,
        ),
        { visualIds: ['cosine-similarity-angle-video'] },
      ),
      section(
        'distance-weighted-comparison',
        copy('加权比较：这次更在乎哪个维度', 'Weighted Comparison: Which Dimension Matters This Time'),
        copy(
          md`有些检索任务不是每个维度都同等重要。学习平台可能更在乎“错题主题”而不是“练习时长”，商品检索可能更在乎“用途”而不是“价格区间”。给某些维度更高权重，本质上是在改变这次比较的几何形状。权重不是公式上的装饰，而是产品判断。

这也是实验中要拖动权重滑杆的原因。你会看到同一批点因为权重不同而重新排序。`,
          md`Some retrieval tasks do not treat every dimension equally. A learning platform may care more about mistake topic than practice duration; product search may care more about use case than price band. Giving some dimensions higher weight changes the geometry of this comparison. Weights are not formula decoration; they encode a product judgment.

That is why the lab asks you to move weight sliders. The same set of points can be reordered when the weights change.`,
        ),
      ),
      section(
        'distance-search-review',
        copy('案例复盘：相似度指标就是产品决策', 'Case Review: A Similarity Metric Is a Product Decision'),
        copy(
          md`如果产品希望短答案优先，可能需要长度归一化；如果希望按主题方向找文章，cosine 更自然；如果某些维度更重要，就需要权重。指标不是装饰，它决定用户看到什么。

复习问题：norm 和 distance 的输入对象分别是什么？cosine similarity 为什么可以高但距离仍然长？把 cosine 换成加权距离时，检索结果为什么会变？`,
          md`If a product wants short answers first, it may need length normalization; if it wants topic direction, cosine is more natural; if some dimensions matter more, weights are needed. A metric is not decoration; it decides what users see.

Review Questions: What is the input object for a norm, and what is the input relationship for a distance? Why can cosine similarity be high while Euclidean distance is still long? Why can retrieval results change when cosine is replaced by weighted distance?`,
        ),
      ),
    ],
    visuals: [
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
        copy(
          '图中对比位置距离和方向相似度，帮助区分 Euclidean distance 与 cosine similarity。',
          'The image contrasts position distance and directional similarity to separate Euclidean distance from cosine similarity.',
        ),
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
          '动画先量从原点到向量终点的长度，再把尺子移到两个向量之间。',
          'The animation first measures the length from the origin to a vector endpoint, then moves the same ruler between two vectors.',
        ),
      ),
      manimAsset(
        'cosine-similarity-angle-video',
        'cosine-similarity-angle',
        copy('cosine similarity 看方向', 'Cosine Similarity Reads Direction'),
        copy(
          '动画保持方向但改变长度，再旋转方向，区分距离和方向相似度。',
          'The animation keeps direction while changing length, then rotates direction to separate distance from directional similarity.',
        ),
      ),
    ],
    labs: [
      lab('vector-similarity-lab', copy('向量相似度实验', 'Vector Similarity Lab'), 'VectorSimilarityLab', [
        copy('能区分距离回答“位置多近”，cosine similarity 回答“方向多像”。', 'Distinguish distance as position closeness from cosine similarity as direction alignment.'),
        copy('能说明维度权重会改变这次比较更在乎什么。', 'Explain how dimension weights change what the comparison cares about.'),
      ]),
    ],
    quizzes: [
      quiz(
        'distance-cosine-high-distance-long',
        copy('cosine similarity 很高时，欧几里得距离一定很短吗？', 'If cosine similarity is high, must Euclidean distance be short?'),
        'not-always',
        copy('不一定；方向很像但长度差很大时，距离仍然可能很长。', 'Not always; if direction is similar but lengths differ a lot, distance can still be large.'),
        copy('一定，因为 cosine 高就表示两个点重合。', 'Yes, because high cosine means the points overlap.'),
        copy(
          'cosine 看夹角，Euclidean distance 看终点之间的差向量长度。',
          'Cosine reads angle; Euclidean distance reads the length of the difference vector between endpoints.',
        ),
        'cosine-distance-confusion',
        'cosine-similarity-angle-video',
      ),
      quiz(
        'distance-ranking-product-choice',
        copy('为什么搜索系统常需要选择相似度指标？', 'Why does a search system need to choose a similarity metric?'),
        'ranking-changes',
        copy('因为不同指标会改变候选结果排序。', 'Because different metrics change the ranking of candidates.'),
        copy('因为所有指标都会给完全相同的排序。', 'Because all metrics always give exactly the same ranking.'),
        copy(
          '指标决定系统是在重视位置差、方向、长度还是某些加权维度。',
          'The metric decides whether the system cares about position gap, direction, length, or weighted dimensions.',
        ),
        'metric-is-decorative',
      ),
    ],
    misconceptions: [
      misconception(
        'cosine-distance-confusion',
        copy('cosine 高就等于距离短。', 'High cosine means short distance.'),
        copy('cosine 主要看方向；距离还会受长度差影响。', 'Cosine mainly reads direction; distance is also affected by length differences.'),
        copy(
          '同向但长度相差十倍的两个向量 cosine 为 1，但终点相距很远。',
          'Two vectors in the same direction but with tenfold length difference have cosine 1, but their endpoints are far apart.',
        ),
      ),
      misconception(
        'metric-is-decorative',
        copy('相似度指标只是显示用的小数。', 'A similarity metric is just a displayed decimal.'),
        copy(
          '相似度指标决定排序、推荐和检索结果，是产品行为的一部分。',
          'A similarity metric determines ranking, recommendation, and retrieval results; it is part of product behavior.',
        ),
        copy('把 cosine 换成加权距离，用户看到的文章可能完全不同。', 'Switching from cosine to weighted distance can show the user a very different set of articles.'),
      ),
    ],
    accent: '#0f9f7a',
    theme: '#ecfdf7',
    sourceNoteFile: 'math-lab-linear-algebra-route-sources.md',
    importedAssetPaths: [
      '/math-lab/generated/vector-distance-norm-intuition.png',
      '/math-lab/generated/cosine-vs-distance-intuition.png',
      '/math-lab/generated/high-dimensional-embedding-search.png',
      '/manim/math-lab/vector-distance-norm.mp4',
      '/manim/math-lab/vector-distance-norm.svg',
      '/manim/math-lab/cosine-similarity-angle.mp4',
      '/manim/math-lab/cosine-similarity-angle.svg',
    ],
    sourceReferences: [sources.essenceLinearAlgebra, sources.d2lLinearAlgebra, sources.mml],
  }),
  moduleDefinition({
    id: 'linear-algebra-matrix-transformations',
    enhancementTier: 'interactive',
    title: copy('矩阵与线性变换', 'Matrices and Linear Transformations'),
    subtitle: copy(
      '用神经网络线性层和房价特征混合案例理解矩阵如何重新组织特征。',
      'Use neural-network layers and housing-feature mixing to understand how matrices reorganize features.',
    ),
    difficulty: 'foundation',
    estimatedMinutes: 40,
    prerequisites: ['linear-algebra-distance-similarity'],
    aiModelConnections: [
      copy('线性层用矩阵把输入特征混合成隐藏表示。', 'Linear layers use matrices to mix input features into hidden representations.'),
    ],
    learningObjectives: [
      copy('把矩阵乘向量解释成矩阵列向量的线性组合。', 'Explain matrix-vector multiplication as a linear combination of matrix columns.'),
      copy('用基向量去向解释空间变形。', 'Explain space transformation through where basis vectors land.'),
      copy('区分线性变换和带 bias 的仿射变换。', 'Distinguish linear transformations from affine transforms with bias.'),
    ],
    concepts: [
      concept(
        'matrix-column-combination-transform',
        copy('矩阵乘向量', 'Matrix Times Vector'),
        'A\\mathbf{x}=x_1\\mathbf{a}_1+\\cdots+x_n\\mathbf{a}_n',
        [
          variable('\\mathbf{a}_j', '矩阵第 j 列，也就是第 j 个基方向的去向。', 'Column j of the matrix, where basis direction j lands.'),
          variable('x_j', '输入向量在第 j 个方向上的坐标。', 'Input coordinate along direction j.'),
        ],
        copy('矩阵用输入坐标混合自己的列向量，得到新向量。', 'A matrix mixes its columns using input coordinates to produce a new vector.'),
        copy('移动基方向会让整个空间跟着拉伸、旋转、剪切或压扁。', 'Moving basis directions stretches, rotates, shears, or flattens the whole space.'),
        copy(
          '若列为 \\((2,0)\\)、\\((1,3)\\)，输入 \\((4,-1)\\) 输出为 \\(4(2,0)-1(1,3)=(7,-3)\\)。',
          'If columns are \\((2,0)\\), \\((1,3)\\), input \\((4,-1)\\) gives \\(4(2,0)-1(1,3)=(7,-3)\\).',
        ),
        copy(
          '神经网络线性层 \\(W\\mathbf{x}+\\mathbf{b}\\) 中，\\(W\\) 负责混合输入特征。',
          'In a neural-network layer \\(W\\mathbf{x}+\\mathbf{b}\\), \\(W\\) mixes input features.',
        ),
      ),
    ],
    sections: [
      section(
        'matrix-transform-case',
        copy('案例：模型怎样创造中间特征', 'Case: How a Model Creates Intermediate Features'),
        copy(
          md`房价模型可能输入面积、房龄、地铁距离和学区评分。矩阵不是把这些数字逐项保留，而是把它们重新混合成“空间价值”“维护风险”或“通勤便利”等中间方向。本章学习目标在这个案例里很具体：按列读矩阵乘向量，看基向量落到哪里，并区分纯线性变换与加了 bias 的仿射层。

这也是神经网络线性层的基本动作。激活函数之前，线性层先用矩阵把输入特征混成中间表示。`,
          md`A housing model may receive area, building age, subway distance, and school score. A matrix does not preserve those numbers one by one; it remixes them into intermediate directions such as space value, maintenance risk, or commute convenience. Learning objectives in this chapter are concrete: read matrix-vector multiplication by columns, inspect where basis vectors land, and distinguish a pure linear transform from an affine layer with bias.

This is also the basic action of a neural-network linear layer. Before the activation function appears, the layer uses a matrix to mix input features into an intermediate representation.`,
        ),
        { visualIds: ['matrix-column-combination-image', 'matrix-column-combination-video'], labIds: ['matrix-transform-lab'] },
      ),
      section(
        'matrix-column-reading',
        copy('列向量读法：输入坐标是混合比例', 'Column Reading: Input Coordinates Are Mixing Weights'),
        copy(
          md`如果 \(A=[\mathbf{a}_1\ \mathbf{a}_2]\)，那么 \(A\mathbf{x}=x_1\mathbf{a}_1+x_2\mathbf{a}_2\)。这个读法直接告诉我们：输入每个坐标都在选择要加入多少个输出方向。逐项相乘的记忆法会漏掉“求和”和“混合”，也看不见输出为什么落在列空间里。

在房价例子中，面积这个坐标可能同时推动“空间价值”和“总价风险”，房龄也可能同时影响“维护风险”和“折旧程度”。矩阵列就是这些输入方向被送去的地方。`,
          md`If \(A=[\mathbf{a}_1\ \mathbf{a}_2]\), then \(A\mathbf{x}=x_1\mathbf{a}_1+x_2\mathbf{a}_2\). This reading says directly: each input coordinate chooses how much of one output direction to add. A memory trick based on elementwise multiplication misses summation and mixing, and it hides why the output lands in the column space.

In the housing example, the area coordinate may push both "space value" and "total price risk," while age may affect both "maintenance risk" and depreciation. Matrix columns are where those input directions are sent.`,
        ),
        { visualIds: ['matrix-transform-video'] },
      ),
      section(
        'matrix-basis-grid',
        copy('基向量去向：整张网格怎样变形', 'Basis Destinations: How the Whole Grid Deforms'),
        copy(
          md`二维里可以把矩阵看成一台空间机器：横轴基向量和纵轴基向量被送到哪里，整张网格就跟着拉伸、旋转、剪切或压扁。这个图像不是为了炫技，而是为了让你看出“矩阵是变换”而不只是表格。

当两个基方向仍然独立，空间可以铺开成一片区域；当它们被送到同一条线上，空间就被压扁。这会直接引出下一章的 rank。`,
          md`In 2D, a matrix can be read as a space machine: once the horizontal and vertical basis vectors move, the whole grid stretches, rotates, shears, or flattens with them. The picture is not decorative; it helps you see a matrix as a transformation rather than a table.

When the two basis directions remain independent, space can spread across an area. When they land on the same line, space is flattened. That observation leads directly into the next chapter on rank.`,
        ),
      ),
      section(
        'matrix-affine-layer',
        copy('线性层为什么常写成 \\(Wx+b\\)', 'Why a Layer Is Often Written \\(Wx+b\\)'),
        copy(
          md`矩阵 \(W\) 混合特征，bias \(\mathbf{b}\) 平移结果。纯 \(W\mathbf{x}\) 保持原点不动，是线性变换；\(W\mathbf{x}+\mathbf{b}\) 多了平移，严格说是仿射变换。深度学习里常把它叫 linear layer，是工程命名；数学上要知道 bias 已经让原点移动。

这个区分有助于理解决策边界。矩阵负责旋转、拉伸或混合特征，bias 负责把边界整体挪到更合适的位置。`,
          md`The matrix \(W\) mixes features, and bias \(\mathbf{b}\) shifts the result. Pure \(W\mathbf{x}\) keeps the origin fixed and is linear; \(W\mathbf{x}+\mathbf{b}\) adds translation, so strictly it is affine. Deep learning often calls this a linear layer as an engineering name, but mathematically the bias has moved the origin.

This distinction helps with decision boundaries. The matrix rotates, stretches, or mixes features, while the bias moves the whole boundary to a better location.`,
        ),
      ),
      section(
        'matrix-case-review',
        copy('案例复盘：矩阵决定模型先看见什么组合', 'Case Review: The Matrix Decides Which Mixtures the Model Sees First'),
        copy(
          md`线性层之后的激活函数很重要，但第一步仍是矩阵混合。若某些输入维度被赋予相近权重，模型会把它们看成同一类中间信号；若某些维度被压到很小，它们对输出几乎没有声音。

复习问题：\(A\mathbf{x}\) 为什么可以读成列向量线性组合？基向量去向怎样决定网格变形？为什么 \(W\mathbf{x}+\mathbf{b}\) 不是纯线性变换？`,
          md`Activation functions matter, but the first step is still matrix mixing. If some input dimensions receive similar weights, the model treats them as one kind of intermediate signal; if some dimensions are pushed near zero, they barely speak in the output.

Review Questions: Why can \(A\mathbf{x}\) be read as a linear combination of columns? How do basis-vector destinations determine grid deformation? Why is \(W\mathbf{x}+\mathbf{b}\) not a pure linear transformation?`,
        ),
      ),
    ],
    visuals: [
      imageAsset(
        'matrix-column-combination-image',
        'matrix-column-combination.png',
        copy('矩阵列向量的线性组合', 'Matrix Columns as a Linear Combination'),
        copy('输入坐标作为比例，混合矩阵列向量得到输出。', 'Input coordinates act as weights that mix matrix columns into the output.'),
      ),
      manimAsset(
        'matrix-column-combination-video',
        'matrix-column-combination',
        copy('按列读矩阵乘向量', 'Read Matrix-Vector Multiplication by Columns'),
        copy(
          '动画把矩阵两列看成两个方向，再用输入坐标把这些列首尾相接。',
          'The animation treats the two matrix columns as directions and places them head-to-tail using input coordinates.',
        ),
      ),
      manimAsset(
        'matrix-transform-video',
        'matrix-transform',
        copy('矩阵移动基向量', 'A Matrix Moves the Basis Vectors'),
        copy('动画展示基向量移动后，整张网格如何跟随变形。', 'The animation shows how the grid follows after basis vectors move.'),
      ),
    ],
    labs: [
      lab('matrix-transform-lab', copy('矩阵变换实验', 'Matrix Transformation Lab'), 'MatrixTransformLab', [
        copy('能根据基向量去向描述矩阵如何移动空间。', 'Describe how a matrix moves space from where basis vectors land.'),
        copy('能把输出解释成列向量线性组合。', 'Explain the output as a linear combination of columns.'),
      ]),
    ],
    quizzes: [
      quiz(
        'matrix-column-reading',
        copy('按列读法中，\\(A\\mathbf{x}\\) 是什么？', 'In the column reading, what is \\(A\\mathbf{x}\\)?'),
        'column-combination',
        copy('用输入坐标加权混合矩阵列向量。', 'A weighted mixture of matrix columns using input coordinates.'),
        copy('矩阵和向量逐项相乘，不求和。', 'Elementwise multiplication with no summation.'),
        copy('矩阵乘向量会把列向量按输入坐标加起来。', 'Matrix-vector multiplication adds columns weighted by input coordinates.'),
        'matrix-vector-entrywise',
        'matrix-column-combination-video',
      ),
      quiz(
        'matrix-affine-not-linear',
        copy('为什么 \\(W\\mathbf{x}+\\mathbf{b}\\) 不再是纯线性变换？', 'Why is \\(W\\mathbf{x}+\\mathbf{b}\\) not a pure linear transformation?'),
        'bias-shifts-origin',
        copy('因为 bias 会移动原点。', 'Because the bias shifts the origin.'),
        copy('因为矩阵里有负数。', 'Because the matrix has negative entries.'),
        copy('纯线性变换必须保持原点不动，bias 引入平移。', 'A pure linear transform must keep the origin fixed; bias introduces translation.'),
        'affine-is-linear',
      ),
    ],
    misconceptions: [
      misconception(
        'matrix-vector-entrywise',
        copy('矩阵乘向量就是逐项相乘。', 'Matrix times vector is elementwise multiplication.'),
        copy('矩阵乘向量包含乘法和求和，按列看是线性组合。', 'Matrix times vector includes multiplication and summation; by columns it is a linear combination.'),
        copy('\\(A\\mathbf{x}\\) 可以读成 \\(x_1\\mathbf{a}_1+x_2\\mathbf{a}_2\\)。', '\\(A\\mathbf{x}\\) can be read as \\(x_1\\mathbf{a}_1+x_2\\mathbf{a}_2\\).'),
      ),
      misconception(
        'affine-is-linear',
        copy('只要有矩阵就是线性变换。', 'Anything with a matrix is a linear transformation.'),
        copy('加上 bias 后会平移原点，所以是仿射变换。', 'Adding a bias shifts the origin, so the transform is affine.'),
        copy('神经网络常说 linear layer，但数学表达 \\(Wx+b\\) 是 affine map。', 'Neural networks often say linear layer, but mathematically \\(Wx+b\\) is an affine map.'),
      ),
    ],
    accent: '#e26d3d',
    theme: '#fff4ed',
    sourceNoteFile: 'math-lab-linear-algebra-route-sources.md',
    importedAssetPaths: [
      '/math-lab/generated/matrix-column-combination.png',
      '/manim/math-lab/matrix-column-combination.mp4',
      '/manim/math-lab/matrix-column-combination.svg',
      '/manim/math-lab/matrix-transform.mp4',
      '/manim/math-lab/matrix-transform.svg',
    ],
    sourceReferences: [sources.essenceLinearAlgebra, sources.d2lLinearAlgebra, sources.mml],
  }),
  moduleDefinition({
    id: 'linear-algebra-rank-null-space',
    enhancementTier: 'interactive',
    title: copy('列空间、rank 与 null space', 'Column Space, Rank, and Null Space'),
    subtitle: copy(
      '用推荐系统盲区、重复特征和信息压缩理解矩阵能表达什么、看不见什么。',
      'Use recommendation blind spots, duplicate features, and compression to understand what a matrix can express and cannot see.',
    ),
    difficulty: 'intermediate',
    estimatedMinutes: 42,
    prerequisites: ['linear-algebra-matrix-transformations'],
    aiModelConnections: [
      copy(
        '低 rank 权重、重复特征和 null-space 方向会限制模型输出能变化的方向。',
        'Low-rank weights, duplicate features, and null-space directions limit how model outputs can change.',
      ),
    ],
    learningObjectives: [
      copy('把 column space 解释成矩阵所有可能输出。', 'Explain column space as all possible matrix outputs.'),
      copy('把 rank 解释成有效独立输出方向数。', 'Explain rank as the number of effective independent output directions.'),
      copy('把 null space 解释成矩阵擦掉的输入变化。', 'Explain null space as input changes erased by a matrix.'),
    ],
    concepts: [
      concept(
        'column-space-rank-null',
        copy('列空间、rank 与 null space', 'Column Space, Rank, and Null Space'),
        '\\operatorname{Col}(A)=\\{A\\mathbf{x}\\},\\quad \\mathcal{N}(A)=\\{\\mathbf{x}:A\\mathbf{x}=\\mathbf{0}\\}',
        [
          variable('\\operatorname{Col}(A)', '所有列向量线性组合能到达的输出集合。', 'The set of outputs reachable by linear combinations of columns.'),
          variable('\\operatorname{rank}(A)', '列空间的维度。', 'The dimension of the column space.'),
          variable('\\mathcal{N}(A)', '被矩阵压到零的输入方向集合。', 'The input directions collapsed to zero by the matrix.'),
        ],
        copy(
          '矩阵输出只能落在列空间中；rank 描述可达方向数量；null space 描述看不见的输入变化。',
          'Matrix outputs can only land in the column space; rank describes the number of reachable directions; null space describes invisible input changes.',
        ),
        copy('rank=2 像一片平面，rank=1 像一条线，null direction 像被压没的箭头。', 'Rank 2 looks like a plane, rank 1 like a line, and a null direction like an arrow flattened away.'),
        copy('若第二列是第一列的两倍，输出只能沿一条方向变化。', 'If the second column is twice the first, outputs can only vary along one direction.'),
        copy(
          '推荐系统中重复行为特征不会增加真正的新方向，可能造成模型盲区。',
          'In recommendation, repeated behavior features do not add truly new directions and can create blind spots.',
        ),
      ),
    ],
    sections: [
      section(
        'rank-recommender-case',
        copy('案例：推荐系统为什么会有盲区', 'Case: Why Recommenders Have Blind Spots'),
        copy(
          md`用户行为矩阵看起来有很多列：点击、收藏、加购、观看时长。但如果这些列高度相关，它们可能只表达同一个偏好方向。更多列不一定意味着更多信息；重复特征会让矩阵看起来更宽，却没有增加真正独立的方向。本章学习目标在这个案例里就是看清三件事：输出能落在哪里，独立方向有几个，哪些输入变化会被模型看不见。

推荐系统的盲区常常不是“没有数据”，而是数据被组织成了重复方向。rank 和 null space 给我们一套检查语言。`,
          md`A user-behavior matrix may appear to have many columns: clicks, saves, carts, and watch time. If those columns are highly correlated, they may express only one preference direction. More columns do not always mean more information; duplicate features can make a matrix look wider without adding truly independent directions. Learning objectives in this chapter are to see where outputs can land, count independent directions, and identify input changes the model cannot see.

Recommendation blind spots are often not caused by having no data at all, but by organizing data into repeated directions. Rank and null space give us a checking language.`,
        ),
        { visualIds: ['column-space-rank-image', 'rank-flattening-video'], labIds: ['matrix-column-space-lab'] },
      ),
      section(
        'rank-column-space',
        copy('column space：模型所有可能输出在哪里', 'Column Space: Where Can Outputs Land?'),
        copy(
          md`矩阵的所有输出都是列向量的线性组合。column space 不是输入空间，而是输出能到达的区域。rank 就是这个区域的维度。两列独立时，二维输出可以铺开一片平面；两列共线时，所有输出都只能落在一条线上。

这句话对模型解释很有用：如果权重矩阵的列空间很窄，模型再努力也只能在少数输出方向上变化。`,
          md`All matrix outputs are linear combinations of columns. The column space is not input space; it is the region where outputs can land. Rank is the dimension of this region. With two independent columns, 2D outputs can spread across a plane; with collinear columns, every output must land on one line.

That statement is useful for model interpretation: if the column space of a weight matrix is narrow, the model can only vary along a small set of output directions.`,
        ),
      ),
      section(
        'rank-repeated-features',
        copy('重复特征：数字更多，不等于方向更多', 'Duplicate Features: More Numbers, Not More Directions'),
        copy(
          md`如果“收藏次数”几乎总是“点击次数”的两倍，那么这两列提供的方向很接近。它们可能让表格看起来丰富，却没有给模型新的独立视角。rank 会把这种重复压缩成“有效方向数”的问题，而不是被列数迷惑。

低 rank 有时是好消息，因为它说明数据可以压缩；有时是风险，因为模型可能分不清本该分开的用户行为。`,
          md`If save count is almost always twice click count, those two columns provide nearly the same direction. They may make the table look richer, but they do not give the model a new independent viewpoint. Rank turns this duplication into a question about effective directions instead of being fooled by column count.

Low rank can be good because it means the data can be compressed. It can also be risky because the model may fail to distinguish behaviors that should be separated.`,
        ),
      ),
      section(
        'rank-null-space',
        copy('null space：输入变了，输出却没变', 'Null Space: Input Changes, Output Does Not'),
        copy(
          md`如果存在非零 \(\mathbf{x}\) 使 \(A\mathbf{x}=0\)，说明模型有某个输入方向完全看不见。实际系统里，这意味着某些用户行为变化不会影响输出。两个用户如果只差在 null-space 方向上，线性部分会给出相同结果。

null space 不是“空无一物”。它可能包含真实的输入变化，只是这些变化被矩阵压到零，无法传到输出端。`,
          md`If a nonzero \(\mathbf{x}\) satisfies \(A\mathbf{x}=0\), the model cannot see that input direction at all. In a real system, some behavior changes may not affect output. If two users differ only along a null-space direction, the linear part gives the same result.

Null space does not mean "nothing exists." It can contain real input changes, but the matrix collapses those changes to zero so they do not reach the output.`,
        ),
        { visualIds: ['null-space-invisible-direction-image', 'null-space-collapse-video'] },
      ),
      section(
        'rank-case-review',
        copy('案例复盘：压缩、重复与盲区是一件事的三面', 'Case Review: Compression, Duplication, and Blind Spots'),
        copy(
          md`低 rank 可能是好事：压缩掉噪声和重复信息。也可能是风险：模型无法区分本该区分的输入。判断要回到任务和数据。如果任务只是发现大致偏好，压缩可能很稳；如果任务需要识别小众兴趣，盲区就会伤害推荐质量。

复习问题：column space 和输入空间有什么不同？rank 为什么不是非零数字个数？null space 中的非零方向为什么会让两个不同输入得到相同输出？`,
          md`Low rank can be good: it compresses noise and repeated information. It can also be risky: the model cannot distinguish inputs that should differ. Judgment must return to the task and data. If the task only needs broad preference, compression can be stable; if the task must recognize niche interests, blind spots can hurt recommendation quality.

Review Questions: How is column space different from input space? Why is rank not the count of nonzero entries? Why can a nonzero null-space direction make two different inputs produce the same output?`,
        ),
      ),
    ],
    visuals: [
      imageAsset(
        'column-space-rank-image',
        'column-space-rank-intuition.png',
        copy('列空间和 rank', 'Column Space and Rank'),
        copy(
          '两列独立时输出可以铺开平面；两列共线时输出被压到一条线上。',
          'Independent columns can spread outputs across a plane; collinear columns collapse outputs onto a line.',
        ),
      ),
      imageAsset(
        'null-space-invisible-direction-image',
        'null-space-invisible-direction.png',
        copy('null space：看不见的输入方向', 'Null Space: Input Directions the Matrix Cannot See'),
        copy(
          '一个输入方向经过矩阵后变成零输出，另一个方向产生可见输出。',
          'One input direction becomes zero output after the matrix, while another produces a visible output.',
        ),
      ),
      manimAsset(
        'rank-flattening-video',
        'rank-flattening',
        copy('rank 怎样把平面压成线', 'How Rank Flattens a Plane to a Line'),
        copy(
          '动画展示两列独立时输出铺开平面，两列同向时输出压成一条线。',
          'The animation shows independent columns spreading outputs across a plane and aligned columns collapsing outputs to a line.',
        ),
      ),
      manimAsset(
        'null-space-collapse-video',
        'null-space-collapse',
        copy('null space：矩阵看不见的方向', 'Null Space: Directions the Matrix Cannot See'),
        copy('动画展示 null-space 方向怎样被矩阵压到零向量。', 'The animation shows how a null-space direction collapses to the zero vector.'),
      ),
    ],
    labs: [
      lab('matrix-column-space-lab', copy('列空间与秩实验', 'Column Space and Rank Lab'), 'MatrixColumnSpaceLab', [
        copy(
          '能根据两列是否独立判断 rank=2、rank=1 或 rank=0 的可达区域。',
          'Use column independence to identify the reachable region for rank=2, rank=1, or rank=0.',
        ),
        copy('能说明非零 null-space 方向为什么会被压到零输出。', 'Explain why a nonzero null-space direction collapses to zero output.'),
      ]),
    ],
    quizzes: [
      quiz(
        'rank-independent-directions',
        copy('rank 最可靠的读法是什么？', 'What is the most reliable reading of rank?'),
        'independent-directions',
        copy('列空间中的独立输出方向数。', 'The number of independent output directions in the column space.'),
        copy('矩阵里非零数字的个数。', 'The number of nonzero entries in the matrix.'),
        copy('rank 是 column space 的维度，不是非零格子数。', 'Rank is the dimension of the column space, not the count of nonzero cells.'),
        'rank-is-nonzero-entry-count',
        'rank-flattening-video',
      ),
      quiz(
        'null-space-output-same',
        copy('非零方向落在 null space 中表示什么？', 'What does it mean when a nonzero direction lies in the null space?'),
        'erased-input',
        copy('沿这个方向改变输入，输出会被压到零或保持不变。', 'Changing input along this direction is collapsed to zero or leaves output unchanged.'),
        copy('这个方向一定是模型最重要的方向。', "This direction must be the model's most important direction."),
        copy('null space 是矩阵看不见的输入方向集合。', 'Null space is the set of input directions the matrix cannot see.'),
        'null-space-is-empty',
      ),
    ],
    misconceptions: [
      misconception(
        'rank-is-nonzero-entry-count',
        copy('rank 就是非零数字个数。', 'Rank is the count of nonzero numbers.'),
        copy('rank 看独立方向，重复方向不会增加 rank。', 'Rank reads independent directions; repeated directions do not increase rank.'),
        copy(
          '两列成倍数时，即使四个元素都非零，rank 也可能是 1。',
          'When two columns are multiples, rank can be 1 even if all four entries are nonzero.',
        ),
      ),
      misconception(
        'null-space-is-empty',
        copy('null space 就是什么都没有。', 'Null space means there is nothing there.'),
        copy(
          'null space 可以包含真实输入方向，只是这些方向被矩阵压成零输出。',
          'Null space can contain real input directions, but the matrix collapses them to zero output.',
        ),
        copy(
          '两个不同用户特征如果差在 null-space 方向上，线性部分可能给出相同输出。',
          'If two user feature vectors differ along a null-space direction, the linear part may produce the same output.',
        ),
      ),
    ],
    accent: '#6f42c1',
    theme: '#f3eefc',
    sourceNoteFile: 'math-lab-linear-algebra-route-sources.md',
    importedAssetPaths: [
      '/math-lab/generated/column-space-rank-intuition.png',
      '/math-lab/generated/null-space-invisible-direction.png',
      '/manim/math-lab/rank-flattening.mp4',
      '/manim/math-lab/rank-flattening.svg',
      '/manim/math-lab/null-space-collapse.mp4',
      '/manim/math-lab/null-space-collapse.svg',
    ],
    sourceReferences: [sources.essenceLinearAlgebra, sources.d2lLinearAlgebra, sources.mml],
  }),
]
