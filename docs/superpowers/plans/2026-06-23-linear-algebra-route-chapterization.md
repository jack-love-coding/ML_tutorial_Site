# Linear Algebra Route Chapterization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the dense linear algebra material into a staged route from feature vectors through PCA, with case-driven chapters and preserved existing labs/tests.

**Architecture:** Keep the existing `MathLabModule` schema and route model. Add focused route modules for the first four linear algebra chapters, reuse/refine existing eigenvalue, SVD, and PCA modules as later chapters, and update route/navigation tests so the learning path is explicit and stable.

**Tech Stack:** Vue 3, TypeScript, Vite, Node test runner, existing Math Lab typed data, existing Manim/image asset pipeline. Use built-in `imagegen` only for project-bound raster teaching images, and use the Math-To-Manim workflow for any new SVD/PCA educational video scenes.

---

## File Structure

Create:

- `src/modules/math-lab/data/linearAlgebraRouteModules.ts`
  - Owns the four new route modules:
    - `linear-algebra-feature-space`
    - `linear-algebra-distance-similarity`
    - `linear-algebra-matrix-transformations`
    - `linear-algebra-rank-null-space`
  - Reuses existing lab component names and public assets.
  - Provides helper constructors local to the file: `copy`, `section`, `concept`, `imageAsset`, `manimAsset`, `lab`, `quiz`, `misconception`.

- `docs/math-lab-linear-algebra-route-sources.md`
  - Records the case-study design, local assets, and media workflow.
  - Documents whether each asset is reused, generated with built-in `imagegen`, or rendered by Manim.

Modify:

- `src/modules/math-lab/data/modules.ts`
  - Import `linearAlgebraRouteModules`.
  - Replace the single `vectors-matrices-norms` route position with the four new route modules.
  - Keep `eigenvalues-eigenvectors`, `svd`, and `pca` after the four new modules.
  - Leave the old `buildVectorMatrixNormsModule` import in place only if another route or compatibility path still needs it. If no longer used, remove its import and builder branch.

- `src/data/navigationMenus.ts`
  - Replace the old `vectors-matrices-norms` navigation item with four route items.
  - Move `svd` and `pca` into the same linear-algebra route group so the sequence is visible in the app shell.

- `src/modules/math-lab/pages/MathLabModulePage.vue`
  - No route split should require page layout changes. Only update this file if new labs or visual types are introduced.

- `tests/math-lab-core.test.ts`
  - Update the expected path length and module order.
  - Add route-specific tests for chapter IDs, next links, content completeness, labs, quizzes, misconceptions, and case-study language.
  - Preserve existing SVD/PCA/eigenvalue coverage tests.

- `tests/math-lab-layout.test.mjs`
  - Add checks for the new source document and any new public assets.
  - Add checks if any new Manim scenes are registered.

- `tests/site-navigation.test.ts`
  - Update expected Math Lab navigation routes.

Optional later media files in this plan:

- `scripts/manim/scenes/math_lab_basics.py`
- `scripts/manim/render_math_lab.py`
- `public/manim/math-lab/*.mp4`
- `public/manim/math-lab/*.svg`
- `public/manim/math-lab/metadata.json`
- `public/math-lab/generated/*.png`

Only touch optional media files if the implementation reaches Task 7.

---

### Task 1: Lock the New Route Order with Failing Tests

**Files:**
- Modify: `tests/math-lab-core.test.ts`
- Modify: `tests/site-navigation.test.ts`

- [ ] **Step 1: Update the Math Lab route order test**

In `tests/math-lab-core.test.ts`, find the test named `math lab modules include the zero-base AI math path from 1-22`.

Rename it to:

```ts
test('math lab modules include the zero-base AI math path with the linear algebra route split', () => {
```

Replace the expected `ids` assertion with:

```ts
assert.deepEqual(ids, [
  'beginner-linear-algebra',
  'linear-algebra-feature-space',
  'linear-algebra-distance-similarity',
  'linear-algebra-matrix-transformations',
  'linear-algebra-rank-null-space',
  'eigenvalues-eigenvectors',
  'svd',
  'pca',
  'tensor-shapes-vectorization',
  'beginner-calculus',
  'taylor-series',
  'matrix-calculus-autodiff',
  'beginner-probability-distributions',
  'monte-carlo',
  'probability-likelihood-entropy',
  'lu-decomposition',
  'sparse-matrices',
  'condition-numbers',
  'markov-chains',
  'finite-difference-methods',
  'nonlinear-equations',
  'optimization',
  'training-diagnostics',
  'least-squares-fitting',
  'deep-architecture-math',
])
```

Keep the loop that checks `moduleDefinition.order`, but it will now expect 25 modules.

- [ ] **Step 2: Add a route-specific module completeness test**

Append this test near the existing Math Lab module tests:

```ts
test('linear algebra route split exposes seven ordered case-driven chapters', () => {
  const routeIds = [
    'linear-algebra-feature-space',
    'linear-algebra-distance-similarity',
    'linear-algebra-matrix-transformations',
    'linear-algebra-rank-null-space',
    'eigenvalues-eigenvectors',
    'svd',
    'pca',
  ]
  const byId = Object.fromEntries(mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))

  assert.deepEqual(
    routeIds.map((id) => byId[id]?.nextModuleIds[0]),
    [
      'linear-algebra-distance-similarity',
      'linear-algebra-matrix-transformations',
      'linear-algebra-rank-null-space',
      'eigenvalues-eigenvectors',
      'svd',
      'pca',
      'tensor-shapes-vectorization',
    ],
  )

  for (const id of routeIds) {
    const moduleDefinition = byId[id]
    assert.ok(moduleDefinition, `${id} should be registered`)
    assert.ok(moduleDefinition.title['zh-CN'])
    assert.ok(moduleDefinition.title.en)
    assert.ok(moduleDefinition.subtitle['zh-CN'])
    assert.ok(moduleDefinition.subtitle.en)
    assert.ok(moduleDefinition.learningObjectives.length >= 3, `${id} should define learning objectives`)
    assert.ok(moduleDefinition.concepts.length >= 1, `${id} should define concepts`)
    assert.ok(moduleDefinition.sections.length >= 4, `${id} should define case-driven sections`)
    assert.ok(moduleDefinition.labs.length >= 1, `${id} should expose one primary lab`)
    assert.ok(moduleDefinition.quizzes.length >= 2, `${id} should include checkpoint questions`)
    assert.ok(moduleDefinition.misconceptions.length >= 2, `${id} should include misconception feedback`)
    assert.ok(moduleDefinition.sourceReferences?.length, `${id} should have source references`)
  }

  assert.match(
    byId['linear-algebra-distance-similarity']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /语义搜索|embedding|检索/,
  )
  assert.match(
    byId['linear-algebra-matrix-transformations']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /线性层|房价|中间表示/,
  )
  assert.match(
    byId['linear-algebra-rank-null-space']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /推荐系统|盲区|重复特征/,
  )
})
```

- [ ] **Step 3: Update site navigation test expectations**

In `tests/site-navigation.test.ts`, replace any expected `/math-lab/modules/vectors-matrices-norms` entry with:

```ts
'/math-lab/modules/linear-algebra-feature-space',
'/math-lab/modules/linear-algebra-distance-similarity',
'/math-lab/modules/linear-algebra-matrix-transformations',
'/math-lab/modules/linear-algebra-rank-null-space',
```

Keep existing checks for:

```ts
'/math-lab/modules/eigenvalues-eigenvectors',
'/math-lab/modules/svd',
'/math-lab/modules/pca',
```

- [ ] **Step 4: Run the focused tests and verify they fail**

Run:

```bash
npm test -- tests/math-lab-core.test.ts tests/site-navigation.test.ts
```

Expected: FAIL because the four new module IDs are not registered and navigation still points to `vectors-matrices-norms`.

- [ ] **Step 5: Commit the failing tests**

```bash
git add tests/math-lab-core.test.ts tests/site-navigation.test.ts
git commit -m "Add linear algebra route split tests"
```

---

### Task 2: Add Four Route Modules with Existing Labs and Assets

**Files:**
- Create: `src/modules/math-lab/data/linearAlgebraRouteModules.ts`
- Modify: `src/modules/math-lab/data/modules.ts`
- Test: `tests/math-lab-core.test.ts`

- [ ] **Step 1: Create the route module file**

Create `src/modules/math-lab/data/linearAlgebraRouteModules.ts` with this structure:

```ts
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

function misconception(id: string, statement: LocalizedCopy, correction: LocalizedCopy, example: LocalizedCopy): Misconception {
  return { id, statement, correction, example }
}

function moduleDefinition(input: Omit<MathLabModule, 'order' | 'toc' | 'nextModuleIds'>): MathLabModule {
  return {
    ...input,
    order: 0,
    toc: input.sections.map((item) => ({ id: item.id, level: item.level, title: item.title })),
    nextModuleIds: [],
  }
}

const sources: Record<string, SourceReference> = {
  essenceLinearAlgebra: {
    label: copy('3Blue1Brown：线性代数的本质', '3Blue1Brown: Essence of Linear Algebra'),
    href: 'https://www.3blue1brown.com/topics/linear-algebra',
    usage: copy('参考向量、矩阵变换、rank 和几何直觉的可视化组织方式。', 'Reference for visual organization of vectors, transformations, rank, and geometric intuition.'),
  },
  d2lLinearAlgebra: {
    label: copy('Dive into Deep Learning：线性代数', 'Dive into Deep Learning: Linear Algebra'),
    href: 'https://d2l.ai/chapter_preliminaries/linear-algebra.html',
    usage: copy('参考机器学习中向量、矩阵、范数和张量的基础表达。', 'Reference for vectors, matrices, norms, and tensor notation in machine learning.'),
  },
  mml: {
    label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'),
    href: 'https://mml-book.github.io/',
    usage: copy('参考线性代数、向量空间、矩阵分解与机器学习联系。', 'Reference for linear algebra, vector spaces, matrix decompositions, and machine-learning connections.'),
  },
}

export const linearAlgebraRouteModules: MathLabModule[] = [
  moduleDefinition({
    id: 'linear-algebra-feature-space',
    enhancementTier: 'interactive',
    title: copy('向量与特征空间', 'Vectors and Feature Space'),
    subtitle: copy('从学习记录、用户画像和句子 embedding 出发，理解现实对象怎样进入同一个坐标空间。', 'Use learner records, user profiles, and sentence embeddings to understand how real objects enter one coordinate space.'),
    difficulty: 'foundation',
    estimatedMinutes: 34,
    prerequisites: ['beginner-linear-algebra'],
    aiModelConnections: [
      copy('推荐、检索和分类都先把对象写成向量；本章把这个表示动作讲清楚。', 'Recommendation, retrieval, and classification first write objects as vectors; this chapter clarifies that representation step.'),
    ],
    learningObjectives: [
      copy('把一个现实对象解释成同一特征空间中的坐标。', 'Explain a real object as coordinates in one feature space.'),
      copy('用向量差描述两个对象之间的变化方向。', 'Use vector differences to describe the direction of change between two objects.'),
      copy('说明 2D/3D 箭头为什么只是高维向量的可视化入口。', 'Explain why 2D/3D arrows are visual entry points for high-dimensional vectors.'),
    ],
    concepts: [
      concept(
        'feature-vector-space',
        copy('特征向量', 'Feature Vector'),
        '\\mathbf{x}=[x_1,x_2,\\ldots,x_n]^\\top',
        [variable('x_i', '同一个对象在第 i 个特征方向上的坐标。', 'The coordinate of the same object along feature direction i.')],
        copy('向量把同一个对象的多个观察值放进一个有顺序的坐标系统。', 'A vector places multiple observations about one object into an ordered coordinate system.'),
        copy('在二维里可以画成箭头；在高维里仍然表示方向、位置和变化。', 'In 2D it can be drawn as an arrow; in high dimensions it still represents direction, position, and change.'),
        copy('学习记录 \\([2,5,80]\\) 可以读成练习 2 次、错 5 题、得 80 分。', 'A learner record \\([2,5,80]\\) can mean 2 practice sessions, 5 mistakes, and a score of 80.'),
        copy('Embedding、用户画像和模型输入特征都依赖这个表示动作。', 'Embeddings, user profiles, and model input features all depend on this representation step.'),
      ),
    ],
    sections: [
      section(
        'feature-space-case',
        copy('案例：一条学习记录怎样变成向量', 'Case: How a Learner Record Becomes a Vector'),
        copy(
          md`先看一个学生的学习记录：练习次数、错题数、测验分数和复习间隔。单独看每个数字，它们只是表格里的格子；放在一起，它们描述的是同一个学习状态。向量的第一步不是抽象，而是把“同一个对象的多项观察”放进同一个坐标空间。`,
          md`Start with one learner record: practice count, mistake count, quiz score, and review gap. Each number alone is only a cell in a table; together they describe one learning state. The first step of vectors is not abstraction for its own sake, but placing several observations about the same object into one coordinate space.`,
        ),
        { visualIds: ['linear-algebra-feature-cards'], labIds: ['feature-vector-story-lab'] },
      ),
      section(
        'feature-space-difference-vector',
        copy('差向量：两个对象之间发生了什么变化', 'Difference Vector: What Changed Between Two Objects'),
        copy(
          md`如果学生 A 是 \([2,5,80]\)，学生 B 是 \([3,4,82]\)，那么 \(\mathbf{b}-\mathbf{a}=[1,-1,2]\)。这不是三个孤立数字，而是“多练一次、少错一题、高两分”的变化方向。`,
          md`If learner A is \([2,5,80]\) and learner B is \([3,4,82]\), then \(\mathbf{b}-\mathbf{a}=[1,-1,2]\). That is not three isolated numbers; it is the change direction: one more practice session, one fewer mistake, and two more score points.`,
        ),
      ),
      section(
        'feature-space-high-dimensional',
        copy('高维向量：画不出来，但规则没有变', 'High-Dimensional Vectors: Hard to Draw, Same Rules'),
        copy(
          md`句子 embedding 可能有几百维。我们画不出每个维度，但仍然可以比较方向、长度和差向量。二维箭头只是入口，不是定义本身。`,
          md`A sentence embedding may have hundreds of dimensions. We cannot draw every dimension, but we can still compare direction, length, and difference vectors. A 2D arrow is an entry point, not the definition itself.`,
        ),
        { visualIds: ['high-dimensional-embedding-search'] },
      ),
      section(
        'feature-space-case-review',
        copy('案例复盘：表示决定了后续比较', 'Case Review: Representation Decides Later Comparison'),
        copy(
          md`同一个学生、商品或句子可以有不同特征设计。选择哪些维度，决定了后面距离、相似度、矩阵变换和降维分析能看见什么。`,
          md`The same learner, product, or sentence can be represented with different feature designs. The chosen dimensions decide what later distance, similarity, matrix transforms, and dimensionality reduction can see.`,
        ),
      ),
    ],
    visuals: [
      imageAsset('linear-algebra-feature-cards', 'linear-algebra-feature-cards.png', copy('对象怎样变成向量', 'How Objects Become Vectors'), copy('学习记录、推荐偏好和句子 embedding 被放进同一套向量语言。', 'Learner records, recommendation preferences, and sentence embeddings enter the same vector language.')),
      imageAsset('high-dimensional-embedding-search', 'high-dimensional-embedding-search.png', copy('高维 embedding 检索', 'High-Dimensional Embedding Search'), copy('句子进入高维表示后，仍然可以用方向和距离做比较。', 'Sentences become high-dimensional representations and can still be compared by direction and distance.')),
    ],
    labs: [
      lab('feature-vector-story-lab', copy('特征向量故事实验', 'Feature Vector Story Lab'), 'FeatureVectorStoryLab', [
        copy('能解释向量差表示哪种样本变化。', 'Explain what sample change a vector difference represents.'),
      ]),
    ],
    quizzes: [
      quiz('feature-space-one-object', copy('为什么一排特征可以看成一个向量？', 'Why can a row of features be viewed as one vector?'), 'same-object', copy('因为它们描述同一个对象在多个方向上的坐标。', 'Because they describe one object along several feature directions.'), copy('因为这些数字必须全部相等。', 'Because the numbers must all be equal.'), copy('向量把同一个对象的多个观察值放进同一空间，后续才能比较变化和相似度。', 'A vector places several observations about one object in one space, so later change and similarity can be compared.'), 'vector-is-only-list', 'linear-algebra-feature-cards'),
      quiz('feature-space-difference', copy('向量 \\([1,-1,2]\\) 作为两个学习记录的差，最合理的解释是什么？', 'As the difference between two learner records, what does \\([1,-1,2]\\) most reasonably mean?'), 'change-direction', copy('多练一次、少错一题、分数高两分。', 'One more practice session, one fewer mistake, and two more score points.'), copy('三个学生的编号。', 'The IDs of three learners.'), copy('差向量描述的是同一组维度上的变化方向。', 'A difference vector describes change along the same dimensions.'), 'difference-is-random-list'),
    ],
    misconceptions: [
      misconception('vector-is-only-list', copy('向量只是普通列表。', 'A vector is just a plain list.'), copy('向量同时是数据表示和空间位置；后续比较依赖这个空间解释。', 'A vector is both data representation and spatial position; later comparison depends on this spatial reading.'), copy('embedding 相似度比较的不是单个数字，而是整体方向。', 'Embedding similarity compares overall direction, not one number at a time.')),
      misconception('difference-is-random-list', copy('两个向量相减只是得到另一串没意义的数。', 'Subtracting two vectors only gives another meaningless list.'), copy('差向量说明从一个对象到另一个对象要沿每个特征方向走多少。', 'A difference vector says how far to move along each feature direction from one object to another.'), copy('\\([1,-1,2]\\) 可以读成多练、少错、分数提高。', '\\([1,-1,2]\\) can be read as more practice, fewer mistakes, and a higher score.')),
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
]
```

This creates only the first module. Later steps in this task add the remaining three modules into the same exported array.

- [ ] **Step 2: Add the distance/similarity module to the exported array**

Before the closing `]` of `linearAlgebraRouteModules`, add another `moduleDefinition(...)` object with:

```ts
moduleDefinition({
  id: 'linear-algebra-distance-similarity',
  enhancementTier: 'interactive',
  title: copy('距离、范数与相似度', 'Distance, Norms, and Similarity'),
  subtitle: copy('用语义搜索案例区分“位置多近”和“方向多像”。', 'Use semantic search to separate position closeness from directional similarity.'),
  difficulty: 'foundation',
  estimatedMinutes: 38,
  prerequisites: ['linear-algebra-feature-space'],
  aiModelConnections: [
    copy('语义检索、推荐排序和 embedding 检查都需要区分距离和方向相似度。', 'Semantic retrieval, recommendation ranking, and embedding inspection need the distinction between distance and directional similarity.'),
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
      copy('两支箭头可以方向很像但长度差很大，因此 cosine 高而距离不短。', 'Two arrows can point in similar directions but have very different lengths, so cosine can be high while distance is not small.'),
      copy('若 \\((3,4)\\) 和 \\((30,40)\\) 同向，cosine 为 1，但欧氏距离很大。', 'If \\((3,4)\\) and \\((30,40)\\) point in the same direction, cosine is 1 but Euclidean distance is large.'),
      copy('语义搜索常用 cosine similarity 排序 embedding，因为问题通常是“语义方向像不像”。', 'Semantic search often ranks embeddings by cosine similarity because the question is usually whether semantic directions align.'),
    ),
  ],
  sections: [
    section('distance-search-case', copy('案例：搜索为什么不只数关键词', 'Case: Why Search Does Not Only Count Keywords'), copy(md`用户搜索“怎么提高睡眠质量”，一篇文章标题可能是“改善入睡困难的生活习惯”。关键词不完全相同，但语义方向接近。我们需要把 query 和文档放进 embedding 空间，再比较方向和距离。`, md`A user searches "how to sleep better," while an article may be titled "habits that improve difficulty falling asleep." Keywords differ, but semantic direction can be close. We need to place the query and documents into embedding space, then compare direction and distance.`), { visualIds: ['cosine-vs-distance-intuition', 'high-dimensional-embedding-search'], labIds: ['vector-similarity-lab'] }),
    section('distance-norm-ruler', copy('norm：先量一支向量自己的长度', 'Norm: First Measure One Vector'), copy(md`norm 是尺子。对 \((3,4)\)，欧氏 norm 是 \(5\)。语义 embedding 里，norm 可能混入文本长度、频率或模型尺度，所以不能把“长度大”直接当成“语义更好”。`, md`A norm is a ruler. For \((3,4)\), the Euclidean norm is \(5\). In semantic embeddings, norm can mix in text length, frequency, or model scale, so "larger length" should not be read as "better meaning."`), { visualIds: ['vector-distance-norm-video'] }),
    section('distance-cosine-ranking', copy('两套排序：距离最近与方向最像', 'Two Rankings: Closest Distance and Most Similar Direction'), copy(md`同一组候选文章，用 Euclidean distance 和 cosine similarity 可能得到不同排序。这个差异不是 bug，而是两个问题不同：位置多近，还是方向多像。`, md`The same article candidates can rank differently under Euclidean distance and cosine similarity. This is not a bug; the two questions differ: how close are positions, or how aligned are directions?`), { visualIds: ['cosine-similarity-angle-video'] }),
    section('distance-search-review', copy('案例复盘：相似度指标就是产品决策', 'Case Review: A Similarity Metric Is a Product Decision'), copy(md`如果产品希望短答案优先，可能需要长度归一化；如果希望按主题方向找文章，cosine 更自然；如果某些维度更重要，就需要权重。指标不是装饰，它决定用户看到什么。`, md`If a product wants short answers first, it may need length normalization; if it wants topic direction, cosine is more natural; if some dimensions matter more, weights are needed. A metric is not decoration; it decides what users see.`)),
  ],
  visuals: [
    imageAsset('vector-distance-norm-intuition', 'vector-distance-norm-intuition.png', copy('距离和向量长度', 'Distance and Vector Length'), copy('一条线读向量自己的长度，另一条线读两个对象之间的距离。', 'One segment reads a vector length, and another reads the distance between two objects.')),
    imageAsset('cosine-vs-distance-intuition', 'cosine-vs-distance-intuition.png', copy('距离近和方向近', 'Nearby Distance and Nearby Direction'), copy('图中对比位置距离和方向相似度，帮助区分 Euclidean distance 与 cosine similarity。', 'The image contrasts position distance and directional similarity to separate Euclidean distance from cosine similarity.')),
    imageAsset('high-dimensional-embedding-search', 'high-dimensional-embedding-search.png', copy('高维 embedding 检索', 'High-Dimensional Embedding Search'), copy('句子进入高维表示后，仍然可以用 cosine similarity 做相似检索。', 'Sentences become high-dimensional representations and can still be retrieved with cosine similarity.')),
    manimAsset('vector-distance-norm-video', 'vector-distance-norm', copy('长度和距离使用同一把尺', 'Norm and Distance Use the Same Ruler'), copy('动画先量从原点到向量终点的长度，再把尺子移到两个向量之间。', 'The animation first measures the length from the origin to a vector endpoint, then moves the same ruler between two vectors.')),
    manimAsset('cosine-similarity-angle-video', 'cosine-similarity-angle', copy('cosine similarity 看方向', 'Cosine Similarity Reads Direction'), copy('动画保持方向但改变长度，再旋转方向，区分距离和方向相似度。', 'The animation keeps direction while changing length, then rotates direction to separate distance from directional similarity.')),
  ],
  labs: [
    lab('vector-similarity-lab', copy('向量相似度实验', 'Vector Similarity Lab'), 'VectorSimilarityLab', [
      copy('能区分距离回答“位置多近”，cosine similarity 回答“方向多像”。', 'Distinguish distance as position closeness from cosine similarity as direction alignment.'),
      copy('能说明维度权重会改变这次比较更在乎什么。', 'Explain how dimension weights change what the comparison cares about.'),
    ]),
  ],
  quizzes: [
    quiz('distance-cosine-high-distance-long', copy('cosine similarity 很高时，欧几里得距离一定很短吗？', 'If cosine similarity is high, must Euclidean distance be short?'), 'not-always', copy('不一定；方向很像但长度差很大时，距离仍然可能很长。', 'Not always; if direction is similar but lengths differ a lot, distance can still be large.'), copy('一定，因为 cosine 高就表示两个点重合。', 'Yes, because high cosine means the points overlap.'), copy('cosine 看夹角，Euclidean distance 看终点之间的差向量长度。', 'Cosine reads angle; Euclidean distance reads the length of the difference vector between endpoints.'), 'cosine-distance-confusion', 'cosine-similarity-angle-video'),
    quiz('distance-ranking-product-choice', copy('为什么搜索系统常需要选择相似度指标？', 'Why does a search system need to choose a similarity metric?'), 'ranking-changes', copy('因为不同指标会改变候选结果排序。', 'Because different metrics change the ranking of candidates.'), copy('因为所有指标都会给完全相同的排序。', 'Because all metrics always give exactly the same ranking.'), copy('指标决定系统是在重视位置差、方向、长度还是某些加权维度。', 'The metric decides whether the system cares about position gap, direction, length, or weighted dimensions.'), 'metric-is-decorative'),
  ],
  misconceptions: [
    misconception('cosine-distance-confusion', copy('cosine 高就等于距离短。', 'High cosine means short distance.'), copy('cosine 主要看方向；距离还会受长度差影响。', 'Cosine mainly reads direction; distance is also affected by length differences.'), copy('同向但长度相差十倍的两个向量 cosine 为 1，但终点相距很远。', 'Two vectors in the same direction but with tenfold length difference have cosine 1, but their endpoints are far apart.')),
    misconception('metric-is-decorative', copy('相似度指标只是显示用的小数。', 'A similarity metric is just a displayed decimal.'), copy('相似度指标决定排序、推荐和检索结果，是产品行为的一部分。', 'A similarity metric determines ranking, recommendation, and retrieval results; it is part of product behavior.'), copy('把 cosine 换成加权距离，用户看到的文章可能完全不同。', 'Switching from cosine to weighted distance can show the user a very different set of articles.')),
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
})
```

- [ ] **Step 3: Add matrix transformation and rank/null-space modules**

Add two more `moduleDefinition(...)` objects using the same pattern:

```ts
moduleDefinition({
  id: 'linear-algebra-matrix-transformations',
  enhancementTier: 'interactive',
  title: copy('矩阵与线性变换', 'Matrices and Linear Transformations'),
  subtitle: copy('用神经网络线性层和房价特征混合案例理解矩阵如何重新组织特征。', 'Use neural-network layers and housing-feature mixing to understand how matrices reorganize features.'),
  difficulty: 'foundation',
  estimatedMinutes: 40,
  prerequisites: ['linear-algebra-distance-similarity'],
  aiModelConnections: [copy('线性层用矩阵把输入特征混合成隐藏表示。', 'Linear layers use matrices to mix input features into hidden representations.')],
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
      [variable('\\mathbf{a}_j', '矩阵第 j 列，也就是第 j 个基方向的去向。', 'Column j of the matrix, where basis direction j lands.'), variable('x_j', '输入向量在第 j 个方向上的坐标。', 'Input coordinate along direction j.')],
      copy('矩阵用输入坐标混合自己的列向量，得到新向量。', 'A matrix mixes its columns using input coordinates to produce a new vector.'),
      copy('移动基方向会让整个空间跟着拉伸、旋转、剪切或压扁。', 'Moving basis directions stretches, rotates, shears, or flattens the whole space.'),
      copy('若列为 \\((2,0)\\)、\\((1,3)\\)，输入 \\((4,-1)\\) 输出为 \\(4(2,0)-1(1,3)=(7,-3)\\)。', 'If columns are \\((2,0)\\), \\((1,3)\\), input \\((4,-1)\\) gives \\(4(2,0)-1(1,3)=(7,-3)\\).'),
      copy('神经网络线性层 \\(W\\mathbf{x}+\\mathbf{b}\\) 中，\\(W\\) 负责混合输入特征。', 'In a neural-network layer \\(W\\mathbf{x}+\\mathbf{b}\\), \\(W\\) mixes input features.'),
    ),
  ],
  sections: [
    section('matrix-transform-case', copy('案例：模型怎样创造中间特征', 'Case: How a Model Creates Intermediate Features'), copy(md`房价模型可能输入面积、房龄、地铁距离和学区评分。矩阵不是把这些数字逐项保留，而是把它们重新混合成“空间价值”“维护风险”或“通勤便利”等中间方向。`, md`A housing model may receive area, building age, subway distance, and school score. A matrix does not preserve those numbers one by one; it remixes them into intermediate directions such as space value, maintenance risk, or commute convenience.`), { visualIds: ['matrix-column-combination-image', 'matrix-column-combination-video'], labIds: ['matrix-transform-lab'] }),
    section('matrix-column-reading', copy('列向量读法：输入坐标是混合比例', 'Column Reading: Input Coordinates Are Mixing Weights'), copy(md`如果 \(A=[\mathbf{a}_1\ \mathbf{a}_2]\)，那么 \(A\mathbf{x}=x_1\mathbf{a}_1+x_2\mathbf{a}_2\)。这个读法直接告诉我们：输入每个坐标都在选择要加入多少个输出方向。`, md`If \(A=[\mathbf{a}_1\ \mathbf{a}_2]\), then \(A\mathbf{x}=x_1\mathbf{a}_1+x_2\mathbf{a}_2\). This reading says directly: each input coordinate chooses how much of one output direction to add.`), { visualIds: ['matrix-transform-video'] }),
    section('matrix-affine-layer', copy('线性层为什么常写成 \\(Wx+b\\)', 'Why a Layer Is Often Written \\(Wx+b\\)'), copy(md`矩阵 \(W\) 混合特征，bias \(\mathbf{b}\) 平移结果。纯 \(W\mathbf{x}\) 保持原点不动，是线性变换；\(W\mathbf{x}+\mathbf{b}\) 多了平移，严格说是仿射变换。`, md`The matrix \(W\) mixes features, and bias \(\mathbf{b}\) shifts the result. Pure \(W\mathbf{x}\) keeps the origin fixed and is linear; \(W\mathbf{x}+\mathbf{b}\) adds translation, so strictly it is affine.`)),
    section('matrix-case-review', copy('案例复盘：矩阵决定模型先看见什么组合', 'Case Review: The Matrix Decides Which Mixtures the Model Sees First'), copy(md`线性层之后的激活函数很重要，但第一步仍是矩阵混合。若某些输入维度被赋予相近权重，模型会把它们看成同一类中间信号。`, md`Activation functions matter, but the first step is still matrix mixing. If some input dimensions receive similar weights, the model treats them as one kind of intermediate signal.`)),
  ],
  visuals: [
    imageAsset('matrix-column-combination-image', 'matrix-column-combination.png', copy('矩阵列向量的线性组合', 'Matrix Columns as a Linear Combination'), copy('输入坐标作为比例，混合矩阵列向量得到输出。', 'Input coordinates act as weights that mix matrix columns into the output.')),
    manimAsset('matrix-column-combination-video', 'matrix-column-combination', copy('按列读矩阵乘向量', 'Read Matrix-Vector Multiplication by Columns'), copy('动画把矩阵两列看成两个方向，再用输入坐标把这些列首尾相接。', 'The animation treats the two matrix columns as directions and places them head-to-tail using input coordinates.')),
    manimAsset('matrix-transform-video', 'matrix-transform', copy('矩阵移动基向量', 'A Matrix Moves the Basis Vectors'), copy('动画展示基向量移动后，整张网格如何跟随变形。', 'The animation shows how the grid follows after basis vectors move.')),
  ],
  labs: [
    lab('matrix-transform-lab', copy('矩阵变换实验', 'Matrix Transformation Lab'), 'MatrixTransformLab', [
      copy('能根据基向量去向描述矩阵如何移动空间。', 'Describe how a matrix moves space from where basis vectors land.'),
      copy('能把输出解释成列向量线性组合。', 'Explain the output as a linear combination of columns.'),
    ]),
  ],
  quizzes: [
    quiz('matrix-column-reading', copy('按列读法中，\\(A\\mathbf{x}\\) 是什么？', 'In the column reading, what is \\(A\\mathbf{x}\\)?'), 'column-combination', copy('用输入坐标加权混合矩阵列向量。', 'A weighted mixture of matrix columns using input coordinates.'), copy('矩阵和向量逐项相乘，不求和。', 'Elementwise multiplication with no summation.'), copy('矩阵乘向量会把列向量按输入坐标加起来。', 'Matrix-vector multiplication adds columns weighted by input coordinates.'), 'matrix-vector-entrywise', 'matrix-column-combination-video'),
    quiz('matrix-affine-not-linear', copy('为什么 \\(W\\mathbf{x}+\\mathbf{b}\\) 不再是纯线性变换？', 'Why is \\(W\\mathbf{x}+\\mathbf{b}\\) not a pure linear transformation?'), 'bias-shifts-origin', copy('因为 bias 会移动原点。', 'Because the bias shifts the origin.'), copy('因为矩阵里有负数。', 'Because the matrix has negative entries.'), copy('纯线性变换必须保持原点不动，bias 引入平移。', 'A pure linear transform must keep the origin fixed; bias introduces translation.'), 'affine-is-linear'),
  ],
  misconceptions: [
    misconception('matrix-vector-entrywise', copy('矩阵乘向量就是逐项相乘。', 'Matrix times vector is elementwise multiplication.'), copy('矩阵乘向量包含乘法和求和，按列看是线性组合。', 'Matrix times vector includes multiplication and summation; by columns it is a linear combination.'), copy('\\(A\\mathbf{x}\\) 可以读成 \\(x_1\\mathbf{a}_1+x_2\\mathbf{a}_2\\)。', '\\(A\\mathbf{x}\\) can be read as \\(x_1\\mathbf{a}_1+x_2\\mathbf{a}_2\\).')),
    misconception('affine-is-linear', copy('只要有矩阵就是线性变换。', 'Anything with a matrix is a linear transformation.'), copy('加上 bias 后会平移原点，所以是仿射变换。', 'Adding a bias shifts the origin, so the transform is affine.'), copy('神经网络常说 linear layer，但数学表达 \\(Wx+b\\) 是 affine map。', 'Neural networks often say linear layer, but mathematically \\(Wx+b\\) is an affine map.')),
  ],
  accent: '#e26d3d',
  theme: '#fff4ed',
  sourceNoteFile: 'math-lab-linear-algebra-route-sources.md',
  importedAssetPaths: ['/math-lab/generated/matrix-column-combination.png', '/manim/math-lab/matrix-column-combination.mp4', '/manim/math-lab/matrix-column-combination.svg', '/manim/math-lab/matrix-transform.mp4', '/manim/math-lab/matrix-transform.svg'],
  sourceReferences: [sources.essenceLinearAlgebra, sources.d2lLinearAlgebra, sources.mml],
}),
moduleDefinition({
  id: 'linear-algebra-rank-null-space',
  enhancementTier: 'interactive',
  title: copy('列空间、rank 与 null space', 'Column Space, Rank, and Null Space'),
  subtitle: copy('用推荐系统盲区、重复特征和信息压缩理解矩阵能表达什么、看不见什么。', 'Use recommendation blind spots, duplicate features, and compression to understand what a matrix can express and cannot see.'),
  difficulty: 'intermediate',
  estimatedMinutes: 42,
  prerequisites: ['linear-algebra-matrix-transformations'],
  aiModelConnections: [copy('低 rank 权重、重复特征和 null-space 方向会限制模型输出能变化的方向。', 'Low-rank weights, duplicate features, and null-space directions limit how model outputs can change.')],
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
      [variable('\\operatorname{Col}(A)', '所有列向量线性组合能到达的输出集合。', 'The set of outputs reachable by linear combinations of columns.'), variable('\\operatorname{rank}(A)', '列空间的维度。', 'The dimension of the column space.'), variable('\\mathcal{N}(A)', '被矩阵压到零的输入方向集合。', 'The input directions collapsed to zero by the matrix.')],
      copy('矩阵输出只能落在列空间中；rank 描述可达方向数量；null space 描述看不见的输入变化。', 'Matrix outputs can only land in the column space; rank describes the number of reachable directions; null space describes invisible input changes.'),
      copy('rank=2 像一片平面，rank=1 像一条线，null direction 像被压没的箭头。', 'Rank 2 looks like a plane, rank 1 like a line, and a null direction like an arrow flattened away.'),
      copy('若第二列是第一列的两倍，输出只能沿一条方向变化。', 'If the second column is twice the first, outputs can only vary along one direction.'),
      copy('推荐系统中重复行为特征不会增加真正的新方向，可能造成模型盲区。', 'In recommendation, repeated behavior features do not add truly new directions and can create blind spots.'),
    ),
  ],
  sections: [
    section('rank-recommender-case', copy('案例：推荐系统为什么会有盲区', 'Case: Why Recommenders Have Blind Spots'), copy(md`用户行为矩阵看起来有很多列：点击、收藏、加购、观看时长。但如果这些列高度相关，它们可能只表达同一个偏好方向。更多列不一定意味着更多信息。`, md`A user-behavior matrix may appear to have many columns: clicks, saves, carts, and watch time. If those columns are highly correlated, they may express only one preference direction. More columns do not always mean more information.`), { visualIds: ['column-space-rank-image', 'rank-flattening-video'], labIds: ['matrix-column-space-lab'] }),
    section('rank-column-space', copy('column space：模型所有可能输出在哪里', 'Column Space: Where Can Outputs Land?'), copy(md`矩阵的所有输出都是列向量的线性组合。column space 不是输入空间，而是输出能到达的区域。rank 就是这个区域的维度。`, md`All matrix outputs are linear combinations of columns. The column space is not input space; it is the region where outputs can land. Rank is the dimension of this region.`)),
    section('rank-null-space', copy('null space：输入变了，输出却没变', 'Null Space: Input Changes, Output Does Not'), copy(md`如果存在非零 \(\mathbf{x}\) 使 \(A\mathbf{x}=0\)，说明模型有某个输入方向完全看不见。实际系统里，这意味着某些用户行为变化不会影响输出。`, md`If a nonzero \(\mathbf{x}\) satisfies \(A\mathbf{x}=0\), the model cannot see that input direction at all. In a real system, some behavior changes may not affect output.`), { visualIds: ['null-space-invisible-direction-image', 'null-space-collapse-video'] }),
    section('rank-case-review', copy('案例复盘：压缩、重复与盲区是一件事的三面', 'Case Review: Compression, Duplication, and Blind Spots'), copy(md`低 rank 可能是好事：压缩掉噪声和重复信息。也可能是风险：模型无法区分本该区分的输入。判断要回到任务和数据。`, md`Low rank can be good: it compresses noise and repeated information. It can also be risky: the model cannot distinguish inputs that should differ. Judgment must return to the task and data.`)),
  ],
  visuals: [
    imageAsset('column-space-rank-image', 'column-space-rank-intuition.png', copy('列空间和 rank', 'Column Space and Rank'), copy('两列独立时输出可以铺开平面；两列共线时输出被压到一条线上。', 'Independent columns can spread outputs across a plane; collinear columns collapse outputs onto a line.')),
    imageAsset('null-space-invisible-direction-image', 'null-space-invisible-direction.png', copy('null space：看不见的输入方向', 'Null Space: Input Directions the Matrix Cannot See'), copy('一个输入方向经过矩阵后变成零输出，另一个方向产生可见输出。', 'One input direction becomes zero output after the matrix, while another produces a visible output.')),
    manimAsset('rank-flattening-video', 'rank-flattening', copy('rank 怎样把平面压成线', 'How Rank Flattens a Plane to a Line'), copy('动画展示两列独立时输出铺开平面，两列同向时输出压成一条线。', 'The animation shows independent columns spreading outputs across a plane and aligned columns collapsing outputs to a line.')),
    manimAsset('null-space-collapse-video', 'null-space-collapse', copy('null space：矩阵看不见的方向', 'Null Space: Directions the Matrix Cannot See'), copy('动画展示 null-space 方向怎样被矩阵压到零向量。', 'The animation shows how a null-space direction collapses to the zero vector.')),
  ],
  labs: [
    lab('matrix-column-space-lab', copy('列空间与秩实验', 'Column Space and Rank Lab'), 'MatrixColumnSpaceLab', [
      copy('能根据两列是否独立判断 rank=2、rank=1 或 rank=0 的可达区域。', 'Use column independence to identify the reachable region for rank=2, rank=1, or rank=0.'),
      copy('能说明非零 null-space 方向为什么会被压到零输出。', 'Explain why a nonzero null-space direction collapses to zero output.'),
    ]),
  ],
  quizzes: [
    quiz('rank-independent-directions', copy('rank 最可靠的读法是什么？', 'What is the most reliable reading of rank?'), 'independent-directions', copy('列空间中的独立输出方向数。', 'The number of independent output directions in the column space.'), copy('矩阵里非零数字的个数。', 'The number of nonzero entries in the matrix.'), copy('rank 是 column space 的维度，不是非零格子数。', 'Rank is the dimension of the column space, not the count of nonzero cells.'), 'rank-is-nonzero-entry-count', 'rank-flattening-video'),
    quiz('null-space-output-same', copy('非零方向落在 null space 中表示什么？', 'What does it mean when a nonzero direction lies in the null space?'), 'erased-input', copy('沿这个方向改变输入，输出会被压到零或保持不变。', 'Changing input along this direction is collapsed to zero or leaves output unchanged.'), copy('这个方向一定是模型最重要的方向。', 'This direction must be the model’s most important direction.'), copy('null space 是矩阵看不见的输入方向集合。', 'Null space is the set of input directions the matrix cannot see.'), 'null-space-is-empty'),
  ],
  misconceptions: [
    misconception('rank-is-nonzero-entry-count', copy('rank 就是非零数字个数。', 'Rank is the count of nonzero numbers.'), copy('rank 看独立方向，重复方向不会增加 rank。', 'Rank reads independent directions; repeated directions do not increase rank.'), copy('两列成倍数时，即使四个元素都非零，rank 也可能是 1。', 'When two columns are multiples, rank can be 1 even if all four entries are nonzero.')),
    misconception('null-space-is-empty', copy('null space 就是什么都没有。', 'Null space means there is nothing there.'), copy('null space 可以包含真实输入方向，只是这些方向被矩阵压成零输出。', 'Null space can contain real input directions, but the matrix collapses them to zero output.'), copy('两个不同用户特征如果差在 null-space 方向上，线性部分可能给出相同输出。', 'If two user feature vectors differ along a null-space direction, the linear part may produce the same output.')),
  ],
  accent: '#6f42c1',
  theme: '#f3eefc',
  sourceNoteFile: 'math-lab-linear-algebra-route-sources.md',
  importedAssetPaths: ['/math-lab/generated/column-space-rank-intuition.png', '/math-lab/generated/null-space-invisible-direction.png', '/manim/math-lab/rank-flattening.mp4', '/manim/math-lab/rank-flattening.svg', '/manim/math-lab/null-space-collapse.mp4', '/manim/math-lab/null-space-collapse.svg'],
  sourceReferences: [sources.essenceLinearAlgebra, sources.d2lLinearAlgebra, sources.mml],
})
```

- [ ] **Step 4: Register the new modules**

In `src/modules/math-lab/data/modules.ts`, add:

```ts
import { linearAlgebraRouteModules } from './linearAlgebraRouteModules.ts'
```

Update `aiMathPath` so the beginning is:

```ts
const aiMathPath: MathLabModuleId[] = [
  'beginner-linear-algebra',
  'linear-algebra-feature-space',
  'linear-algebra-distance-similarity',
  'linear-algebra-matrix-transformations',
  'linear-algebra-rank-null-space',
  'eigenvalues-eigenvectors',
  'svd',
  'pca',
  'tensor-shapes-vectorization',
```

Remove the old `'vectors-matrices-norms'` entry from `aiMathPath`.

Update `allModulesById` to include the new modules:

```ts
const allModulesById = Object.fromEntries(
  [...beginnerFoundationModules, ...linearAlgebraRouteModules, ...importedFoundationModules, ...aiBridgeModules].map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
) as Record<MathLabModuleId, MathLabModule | undefined>
```

Keep the `buildVectorMatrixNormsModule` builder branch for now so imported notes can still be repaired if referenced during future migration, but route navigation will no longer expose that old module.

- [ ] **Step 5: Run focused tests**

Run:

```bash
npm test -- tests/math-lab-core.test.ts
```

Expected: the route-order tests pass. Some older tests that explicitly search for `vectors-matrices-norms` will fail until Task 3 updates them.

- [ ] **Step 6: Commit the route modules**

```bash
git add src/modules/math-lab/data/linearAlgebraRouteModules.ts src/modules/math-lab/data/modules.ts tests/math-lab-core.test.ts
git commit -m "Add split linear algebra route modules"
```

---

### Task 3: Update Existing Tests and Navigation for the New Route

**Files:**
- Modify: `tests/math-lab-core.test.ts`
- Modify: `tests/math-lab-layout.test.mjs`
- Modify: `tests/site-navigation.test.ts`
- Modify: `src/data/navigationMenus.ts`
- Create: `docs/math-lab-linear-algebra-route-sources.md`

- [ ] **Step 1: Replace old vector/matrix module tests**

In `tests/math-lab-core.test.ts`, find the tests named:

```ts
test('vectors matrices norms module presents repaired bilingual content and inline labs', () => {
test('vectors matrices norms module markdown renders formulas without raw delimiters', () => {
test('vectors matrices norms module wires column space rank lab and guardrails', () => {
```

Replace them with route-specific tests:

```ts
test('linear algebra vector and matrix route modules present case-driven bilingual content', () => {
  const routeIds = [
    'linear-algebra-feature-space',
    'linear-algebra-distance-similarity',
    'linear-algebra-matrix-transformations',
    'linear-algebra-rank-null-space',
  ]

  for (const id of routeIds) {
    const moduleDefinition = mathLabModules.find((candidate) => candidate.id === id)
    assert.ok(moduleDefinition, `${id} should exist`)
    assert.ok(moduleDefinition.sections.every((section) => section.title['zh-CN'] && section.title.en))
    assert.ok(moduleDefinition.concepts.every((concept) => concept.name['zh-CN'] && concept.name.en))
    assert.ok(moduleDefinition.quizzes.every((quiz) => quiz.explanation['zh-CN'] && quiz.explanation.en))
    assert.ok(moduleDefinition.misconceptions.every((item) => item.correction['zh-CN'] && item.correction.en))
  }

  const byId = Object.fromEntries(mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))
  assert.ok(byId['linear-algebra-feature-space']!.labs.some((lab) => lab.componentName === 'FeatureVectorStoryLab'))
  assert.ok(byId['linear-algebra-distance-similarity']!.labs.some((lab) => lab.componentName === 'VectorSimilarityLab'))
  assert.ok(byId['linear-algebra-matrix-transformations']!.labs.some((lab) => lab.componentName === 'MatrixTransformLab'))
  assert.ok(byId['linear-algebra-rank-null-space']!.labs.some((lab) => lab.componentName === 'MatrixColumnSpaceLab'))

  assert.match(byId['linear-algebra-distance-similarity']!.sections.map((section) => section.content['zh-CN']).join('\n'), /语义搜索/)
  assert.match(byId['linear-algebra-matrix-transformations']!.sections.map((section) => section.content['zh-CN']).join('\n'), /房价|线性层/)
  assert.match(byId['linear-algebra-rank-null-space']!.sections.map((section) => section.content['zh-CN']).join('\n'), /推荐系统|盲区/)
})

test('linear algebra route markdown renders formulas without raw delimiters', () => {
  const routeIds = [
    'linear-algebra-feature-space',
    'linear-algebra-distance-similarity',
    'linear-algebra-matrix-transformations',
    'linear-algebra-rank-null-space',
  ]

  for (const id of routeIds) {
    const moduleDefinition = mathLabModules.find((candidate) => candidate.id === id)
    assert.ok(moduleDefinition, `${id} should exist`)
    const source = [
      ...moduleDefinition.learningObjectives.map((item) => item['zh-CN']),
      ...moduleDefinition.concepts.flatMap((concept) => [
        concept.plainExplanation['zh-CN'],
        concept.geometricIntuition['zh-CN'],
        concept.numericalExample['zh-CN'],
      ]),
      ...moduleDefinition.sections.map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`),
      ...moduleDefinition.quizzes.map((quiz) => `${quiz.prompt['zh-CN']}\n\n${quiz.explanation['zh-CN']}`),
      ...moduleDefinition.misconceptions.map((item) => `${item.correction['zh-CN']}\n\n${item.example['zh-CN']}`),
    ].join('\n\n')
    const html = renderMarkdownWithMath(source)

    assert.match(html, /katex|向量|矩阵|rank|cosine|embedding/i)
    assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
  }
})

test('linear algebra route keeps vector similarity and column space guardrails', () => {
  const byId = Object.fromEntries(mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))
  assert.ok(byId['linear-algebra-distance-similarity']!.quizzes.some((quiz) => quiz.misconceptionTags.includes('cosine-distance-confusion')))
  assert.ok(byId['linear-algebra-rank-null-space']!.quizzes.some((quiz) => quiz.misconceptionTags.includes('rank-is-nonzero-entry-count')))
  assert.ok(byId['linear-algebra-rank-null-space']!.misconceptions.some((item) => item.id === 'null-space-is-empty'))
})
```

- [ ] **Step 2: Update layout asset/source checks**

In `tests/math-lab-layout.test.mjs`, add this assertion near the existing source-doc checks:

```js
assert.ok(existsSync(new URL('docs/math-lab-linear-algebra-route-sources.md', root)))
```

Add source matching:

```js
const linearAlgebraRouteSource = read('src/modules/math-lab/data/linearAlgebraRouteModules.ts')
const linearAlgebraRouteDoc = read('docs/math-lab-linear-algebra-route-sources.md')

for (const assetPath of [
  'linear-algebra-feature-cards.png',
  'vector-distance-norm-intuition.png',
  'cosine-vs-distance-intuition.png',
  'high-dimensional-embedding-search.png',
  'matrix-column-combination.png',
  'column-space-rank-intuition.png',
  'null-space-invisible-direction.png',
]) {
  assert.match(linearAlgebraRouteSource, new RegExp(assetPath.replace('.', '\\.')))
  assert.match(linearAlgebraRouteDoc, new RegExp(assetPath.replace('.', '\\.')))
}
```

- [ ] **Step 3: Update app navigation**

In `src/data/navigationMenus.ts`, change the `linear-algebra` group items to:

```ts
items: [
  mathModule('linear-algebra-feature-space', '向量与特征空间', 'Vectors and Feature Space'),
  mathModule('linear-algebra-distance-similarity', '距离、范数与相似度', 'Distance, Norms, and Similarity'),
  mathModule('linear-algebra-matrix-transformations', '矩阵与线性变换', 'Matrices and Linear Transformations'),
  mathModule('linear-algebra-rank-null-space', '列空间、rank 与 null space', 'Column Space, Rank, and Null Space'),
  mathModule('eigenvalues-eigenvectors', '特征值与特征向量', 'Eigenvalues and Eigenvectors'),
  mathModule('svd', '奇异值分解（SVD）', 'Singular Value Decomposition (SVD)'),
  mathModule('pca', '主成分分析（PCA）', 'Principal Component Analysis (PCA)'),
],
```

Remove `svd` and `pca` from the `data-geometry-architectures` group so they do not appear twice.

- [ ] **Step 4: Create the source note**

Create `docs/math-lab-linear-algebra-route-sources.md`:

```md
# Linear Algebra Route Sources

This source note documents the case-driven linear algebra route split introduced after the first vector/matrix/rank expansion.

## Reused Local Assets

- `public/math-lab/generated/linear-algebra-feature-cards.png`
- `public/math-lab/generated/vector-distance-norm-intuition.png`
- `public/math-lab/generated/cosine-vs-distance-intuition.png`
- `public/math-lab/generated/high-dimensional-embedding-search.png`
- `public/math-lab/generated/matrix-column-combination.png`
- `public/math-lab/generated/column-space-rank-intuition.png`
- `public/math-lab/generated/null-space-invisible-direction.png`
- `public/manim/math-lab/vector-distance-norm.mp4`
- `public/manim/math-lab/cosine-similarity-angle.mp4`
- `public/manim/math-lab/matrix-column-combination.mp4`
- `public/manim/math-lab/rank-flattening.mp4`
- `public/manim/math-lab/null-space-collapse.mp4`

## External References

- 3Blue1Brown, Essence of Linear Algebra: used for visual organization of vectors, matrix transformations, rank, and null space.
- Dive into Deep Learning, Linear Algebra: used for machine-learning notation and vector/matrix/norm framing.
- Mathematics for Machine Learning: used for vector spaces, matrix decompositions, and ML connections.

## Media Workflow Notes

Existing generated images were produced with Codex's built-in image generation workflow and are stored locally under `public/math-lab/generated/`.

Existing videos were rendered through `scripts/manim/render_math_lab.py` and stored locally under `public/manim/math-lab/`.

Future project-bound teaching images should use the built-in `imagegen` path by default, then be copied into `public/math-lab/generated/` and referenced through public paths. Future math videos should follow the Math-To-Manim prerequisite-first workflow, then be registered in `scripts/manim/render_math_lab.py` and `public/manim/math-lab/metadata.json`.
```

- [ ] **Step 5: Run focused tests**

Run:

```bash
npm test -- tests/math-lab-core.test.ts tests/math-lab-layout.test.mjs tests/site-navigation.test.ts
```

Expected: PASS for updated route, source, and navigation checks.

- [ ] **Step 6: Commit navigation and test updates**

```bash
git add tests/math-lab-core.test.ts tests/math-lab-layout.test.mjs tests/site-navigation.test.ts src/data/navigationMenus.ts docs/math-lab-linear-algebra-route-sources.md
git commit -m "Wire split linear algebra route navigation"
```

---

### Task 4: Refine Eigenvalue, SVD, and PCA Chapters into the Route Narrative

**Files:**
- Modify: `src/modules/math-lab/data/eigenvaluesModule.ts`
- Modify: `src/modules/math-lab/data/svdModule.ts`
- Modify: `src/modules/math-lab/data/pcaModule.ts`
- Modify: `tests/math-lab-core.test.ts`
- Modify: `tests/math-lab-svd.test.ts`
- Modify: `tests/pca.test.ts`

- [ ] **Step 1: Add failing route narrative assertions**

In `tests/math-lab-core.test.ts`, add:

```ts
test('later linear algebra route chapters use concrete case studies instead of shallow AI footnotes', () => {
  const eigenModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'eigenvalues-eigenvectors')
  const svdModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'svd')
  const pcaModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'pca')
  assert.ok(eigenModule)
  assert.ok(svdModule)
  assert.ok(pcaModule)

  const eigenText = eigenModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const svdText = svdModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const pcaText = pcaModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')

  assert.match(eigenText, /PageRank|网页|链接网络|稳定方向/)
  assert.match(svdText, /图片压缩|用户[-—]物品|低秩|噪声/)
  assert.match(pcaText, /embedding 可视化|离群点|批次|中心化/)

  assert.doesNotMatch(`${eigenText}\n${svdText}\n${pcaText}`, /它在 AI 里出现在哪里/)
})
```

- [ ] **Step 2: Update SVD test expectations only where necessary**

In `tests/math-lab-svd.test.ts`, keep all current assertions. Add:

```ts
assert.match(zhBody, /图片压缩/)
assert.match(zhBody, /用户[-—]物品/)
assert.match(zhBody, /小奇异值/)
```

- [ ] **Step 3: Update PCA test expectations only where necessary**

In `tests/pca.test.ts`, keep all current assertions. Add:

```ts
assert.match(zhBody, /embedding 可视化/)
assert.match(zhBody, /离群点/)
assert.match(zhBody, /批次/)
```

If `zhBody` is not already defined in the test, create it with:

```ts
const zhBody = moduleDefinition.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
```

- [ ] **Step 4: Run the tests and verify failure**

Run:

```bash
npm test -- tests/math-lab-core.test.ts tests/math-lab-svd.test.ts tests/pca.test.ts
```

Expected: FAIL until module copy is expanded.

- [ ] **Step 5: Refine eigenvalue sections**

In `src/modules/math-lab/data/eigenvaluesModule.ts`, update the opening or power-iteration section content to include a concrete PageRank/link-network case. Add this paragraph to the Chinese content near the first explanation of repeated multiplication:

```md
把这个想法放进 PageRank：每个网页把重要性沿链接分给其他网页，整张网络就像一个转移矩阵。反复乘这个矩阵，不是在背公式，而是在模拟“重要性流动很多轮以后还会剩下什么方向”。最后稳定下来的方向就是网页重要性的长期结构。
```

Add the English counterpart:

```md
Place the same idea inside PageRank: each page sends importance through its outgoing links, so the whole web acts like a transition matrix. Repeated multiplication is not formula memorization; it simulates which direction remains after importance has flowed for many rounds. The stable direction becomes the long-run structure of page importance.
```

- [ ] **Step 6: Refine SVD sections**

In `src/modules/math-lab/data/svdModule.ts`, update the low-rank section to include image compression, user-item recommendation, and noise interpretation:

```md
图片压缩可以把灰度图看成矩阵。大的奇异值通常保留主要轮廓和大块结构，小的奇异值保留纹理、边缘细节，也可能混入噪声。用户-物品评分矩阵也是类似语言：少数强方向可能对应动作片偏好、文艺片偏好或价格敏感度。低秩近似不是“随便丢掉小数字”，而是在任务允许时保留最强结构。
```

English:

```md
Image compression can read a grayscale image as a matrix. Large singular values often preserve the main silhouette and large structures; small singular values preserve texture and edge detail, and may also contain noise. A user-item rating matrix uses similar language: a few strong directions may correspond to action-movie preference, art-film preference, or price sensitivity. Low-rank approximation is not "dropping small numbers at random"; it keeps the strongest structure when the task allows it.
```

- [ ] **Step 7: Refine PCA sections**

In `src/modules/math-lab/data/pcaModule.ts`, update the ML connections/failure modes section with:

```md
Embedding 可视化是 PCA 最容易被误用也最有用的场景之一。把几百维句子向量投到二维，可以快速看到主题簇、离群点和批次效应；但这张图不是最终证明，因为 PCA 只保留最大方差方向。若分类信息藏在低方差方向，PCA 的第一张图可能很好看，却没有解释真正的标签差异。
```

English:

```md
Embedding visualization is one of the most useful and most easily misused PCA scenarios. Projecting hundreds-dimensional sentence vectors to two dimensions can quickly reveal topic clusters, outliers, and batch effects; but the plot is not final proof because PCA keeps maximum-variance directions. If class information lies in a low-variance direction, the first PCA plot may look clean while missing the real label difference.
```

- [ ] **Step 8: Run tests**

Run:

```bash
npm test -- tests/math-lab-core.test.ts tests/math-lab-svd.test.ts tests/pca.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit chapter refinements**

```bash
git add src/modules/math-lab/data/eigenvaluesModule.ts src/modules/math-lab/data/svdModule.ts src/modules/math-lab/data/pcaModule.ts tests/math-lab-core.test.ts tests/math-lab-svd.test.ts tests/pca.test.ts
git commit -m "Refine later linear algebra chapters with case studies"
```

---

### Task 5: Add Minimum SVD/PCA Manim Continuity Scenes

Use the `Math-To-Manim` workflow for this task. The target concepts are:

- SVD low-rank reconstruction from singular values
- PCA centering and projection

Do not add the full capstone workbench in this task.

**Files:**
- Modify: `scripts/manim/scenes/math_lab_basics.py`
- Modify: `scripts/manim/render_math_lab.py`
- Modify: `public/manim/math-lab/metadata.json`
- Create: `public/manim/math-lab/svd-low-rank-reconstruction.mp4`
- Create: `public/manim/math-lab/svd-low-rank-reconstruction.svg`
- Create: `public/manim/math-lab/pca-centering-projection.mp4`
- Create: `public/manim/math-lab/pca-centering-projection.svg`
- Modify: `src/modules/math-lab/data/svdModule.ts`
- Modify: `src/modules/math-lab/data/pcaModule.ts`
- Modify: `tests/math-lab-layout.test.mjs`

- [ ] **Step 1: Add failing layout checks**

In `tests/math-lab-layout.test.mjs`, update the metadata count from `17` to `19`.

Add a test:

```js
test('SVD and PCA route Manim continuity scenes are registered', () => {
  const sceneSource = read('scripts/manim/scenes/math_lab_basics.py')
  const renderSource = read('scripts/manim/render_math_lab.py')

  for (const sceneName of [
    'SvdLowRankReconstructionScene',
    'PcaCenteringProjectionScene',
  ]) {
    assert.match(sceneSource, new RegExp(`class ${sceneName}`))
    assert.match(renderSource, new RegExp(sceneName))
  }

  for (const assetPath of [
    'public/manim/math-lab/svd-low-rank-reconstruction.mp4',
    'public/manim/math-lab/svd-low-rank-reconstruction.svg',
    'public/manim/math-lab/pca-centering-projection.mp4',
    'public/manim/math-lab/pca-centering-projection.svg',
  ]) {
    assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
  }
})
```

- [ ] **Step 2: Verify failure**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: FAIL because the scenes and assets are missing.

- [ ] **Step 3: Add Manim scene classes**

In `scripts/manim/scenes/math_lab_basics.py`, add:

```python
class SvdLowRankReconstructionScene(Scene):
    def construct(self):
        title = Text("SVD keeps the strongest matrix directions", font_size=30).to_edge(UP)
        bars = VGroup(
            *[
                RoundedRectangle(width=0.62, height=height, corner_radius=0.06, color=color, fill_opacity=0.72)
                for height, color in [(2.4, BLUE), (1.55, GREEN), (0.75, ORANGE), (0.35, RED)]
            ]
        ).arrange(RIGHT, buff=0.28).shift(LEFT * 3.1)
        labels = VGroup(*[Text(f"s{i + 1}", font_size=22).next_to(bars[i], DOWN, buff=0.16) for i in range(4)])
        original = RoundedRectangle(width=2.1, height=2.1, corner_radius=0.14, color=WHITE).shift(RIGHT * 1.6)
        coarse = RoundedRectangle(width=2.1, height=2.1, corner_radius=0.14, color=BLUE).shift(RIGHT * 1.6)
        detail_lines = VGroup(
            Line(original.get_left() + UP * 0.65, original.get_right() + UP * 0.65, color=WHITE, stroke_opacity=0.5),
            Line(original.get_left(), original.get_right(), color=WHITE, stroke_opacity=0.5),
            Line(original.get_left() + DOWN * 0.65, original.get_right() + DOWN * 0.65, color=WHITE, stroke_opacity=0.5),
        )
        caption = Text("keep k = 1: main structure remains", font_size=25).to_edge(DOWN)

        self.play(FadeIn(title), FadeIn(bars), FadeIn(labels), FadeIn(original), FadeIn(caption))
        self.wait(0.5)
        self.play(Transform(original, coarse), FadeOut(bars[1]), FadeOut(bars[2]), FadeOut(bars[3]), FadeOut(labels[1]), FadeOut(labels[2]), FadeOut(labels[3]))
        self.wait(0.4)
        more_caption = Text("increase k: details return, storage increases", font_size=25).to_edge(DOWN)
        self.play(FadeIn(detail_lines), FadeIn(bars[1]), FadeIn(labels[1]), Transform(caption, more_caption))
        self.wait(0.8)


class PcaCenteringProjectionScene(Scene):
    def construct(self):
        plane = NumberPlane(
            x_range=[-4, 4, 1],
            y_range=[-3, 3, 1],
            background_line_style={"stroke_opacity": 0.22},
        )
        title = Text("PCA centers the cloud, then projects variance", font_size=29).to_edge(UP)
        points = VGroup(
            *[
                Dot(plane.c2p(x + 1.2, y + 0.7), color=BLUE, radius=0.055)
                for x, y in [(-1.6, -0.8), (-1.0, -0.55), (-0.4, -0.1), (0.2, 0.05), (0.8, 0.45), (1.5, 0.7)]
            ]
        )
        mean = Dot(plane.c2p(1.2, 0.7), color=YELLOW, radius=0.09)
        pc1 = Line(plane.c2p(-2.6, -1.05), plane.c2p(2.8, 1.15), color=GREEN, stroke_width=7)
        caption = Text("before centering: the cloud carries its offset", font_size=25).to_edge(DOWN)

        self.play(FadeIn(plane), FadeIn(title), FadeIn(points), FadeIn(mean), FadeIn(caption))
        self.wait(0.5)

        centered = VGroup(
            *[
                Dot(plane.c2p(x, y), color=BLUE, radius=0.055)
                for x, y in [(-1.6, -0.8), (-1.0, -0.55), (-0.4, -0.1), (0.2, 0.05), (0.8, 0.45), (1.5, 0.7)]
            ]
        )
        centered_caption = Text("after centering: PCA reads variation around the mean", font_size=25).to_edge(DOWN)
        self.play(Transform(points, centered), mean.animate.move_to(plane.c2p(0, 0)), Transform(caption, centered_caption))
        self.wait(0.4)
        projection_caption = Text("project onto the direction with largest variance", font_size=25).to_edge(DOWN)
        self.play(Create(pc1), Transform(caption, projection_caption))
        self.wait(0.8)
```

If `RoundedRectangle` is already imported, no import change is needed. If not, add it to the `from manim import (...)` list.

- [ ] **Step 4: Register scenes and posters**

In `scripts/manim/render_math_lab.py`, add:

```python
"SvdLowRankReconstructionScene": "svd-low-rank-reconstruction.mp4",
"PcaCenteringProjectionScene": "pca-centering-projection.mp4",
```

Add entries to `FALLBACK_TITLES`:

```python
"SvdLowRankReconstructionScene": "SVD keeps the strongest matrix directions",
"PcaCenteringProjectionScene": "PCA centers the cloud, then projects variance",
```

Add SVG poster entries to `POSTER_SVGS`. If the current file has a helper for linear algebra posters, reuse it; otherwise add concise static SVG strings with readable labels and no dense paragraphs.

- [ ] **Step 5: Render metadata and scenes**

Run:

```bash
python scripts/manim/render_math_lab.py --skip-render
python scripts/manim/render_math_lab.py --scene SvdLowRankReconstructionScene --scene PcaCenteringProjectionScene --force
```

Expected: two MP4s and two SVG posters exist under `public/manim/math-lab/`.

- [ ] **Step 6: Wire videos into SVD and PCA modules**

In `src/modules/math-lab/data/svdModule.ts`, add a `VisualAsset` entry:

```ts
{
  id: 'svd-low-rank-reconstruction-video',
  type: 'manim-video',
  title: copy('SVD 低秩重建', 'SVD Low-Rank Reconstruction'),
  assetPath: '/manim/math-lab/svd-low-rank-reconstruction.mp4',
  posterPath: '/manim/math-lab/svd-low-rank-reconstruction.svg',
  transcript: copy(
    md`动画把奇异值看成按强度排列的方向，只保留前几个方向时，主结构先回来，细节随后恢复。`,
    md`The animation reads singular values as directions ordered by strength. Keeping the first few directions restores the main structure first, and details return later.`,
  ),
  learningPurpose: copy(
    '把低秩近似从公式连接到“先保留主结构，再恢复细节”的直觉。',
    'Connect low-rank approximation to the intuition of keeping main structure first and restoring detail later.',
  ),
}
```

Add its ID to the low-rank section `visualIds`.

In `src/modules/math-lab/data/pcaModule.ts`, add:

```ts
{
  id: 'pca-centering-projection-video',
  type: 'manim-video',
  title: copy('PCA 中心化与投影', 'PCA Centering and Projection'),
  assetPath: '/manim/math-lab/pca-centering-projection.mp4',
  posterPath: '/manim/math-lab/pca-centering-projection.svg',
  transcript: copy(
    md`动画先把数据云移到均值为零的位置，再沿最大方差方向投影，说明 PCA 为什么必须先中心化。`,
    md`The animation first moves the data cloud to zero mean, then projects along the maximum-variance direction, showing why PCA must center first.`,
  ),
  learningPurpose: copy(
    '帮助学生把中心化、主方向和投影损失连成一个连续动作。',
    'Help learners connect centering, principal direction, and projection loss as one continuous action.',
  ),
}
```

Add its ID to the centering or SVD-route section `visualIds`.

- [ ] **Step 7: Run layout tests**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs tests/math-lab-svd.test.ts tests/pca.test.ts
```

Expected: PASS.

- [ ] **Step 8: Clean Manim temporary output**

If Manim generated local temp files, remove only untracked temp directories:

```bash
rm -rf media scripts/manim/scenes/__pycache__
git status --short
```

Expected: no `media/` or `__pycache__/` remains.

- [ ] **Step 9: Commit media continuity scenes**

```bash
git add scripts/manim/scenes/math_lab_basics.py scripts/manim/render_math_lab.py public/manim/math-lab/metadata.json public/manim/math-lab/svd-low-rank-reconstruction.mp4 public/manim/math-lab/svd-low-rank-reconstruction.svg public/manim/math-lab/pca-centering-projection.mp4 public/manim/math-lab/pca-centering-projection.svg src/modules/math-lab/data/svdModule.ts src/modules/math-lab/data/pcaModule.ts tests/math-lab-layout.test.mjs
git commit -m "Add SVD and PCA Manim route scenes"
```

---

### Task 6: Optional Teaching Images for Route Case Studies

Use this task only if the route pages feel visually under-anchored after Tasks 2-4. Use the `imagegen` skill in built-in mode by default.

**Files:**
- Create: `public/math-lab/generated/semantic-search-ranking-case.png`
- Create: `public/math-lab/generated/svd-image-compression-case.png`
- Create: `public/math-lab/generated/pca-embedding-visualization-case.png`
- Modify: `src/modules/math-lab/data/linearAlgebraRouteModules.ts`
- Modify: `src/modules/math-lab/data/svdModule.ts`
- Modify: `src/modules/math-lab/data/pcaModule.ts`
- Modify: `docs/math-lab-linear-algebra-route-sources.md`
- Modify: `tests/math-lab-layout.test.mjs`

- [ ] **Step 1: Add failing asset tests**

In `tests/math-lab-layout.test.mjs`, add the three new PNGs to asset existence checks:

```js
for (const assetPath of [
  'public/math-lab/generated/semantic-search-ranking-case.png',
  'public/math-lab/generated/svd-image-compression-case.png',
  'public/math-lab/generated/pca-embedding-visualization-case.png',
]) {
  assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
}
```

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: FAIL because the images do not exist.

- [ ] **Step 2: Generate images with built-in imagegen**

Use the built-in image generation tool, not CLI fallback. Generate each asset with exact text kept sparse.

Prompt for `semantic-search-ranking-case.png`:

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab teaching infographic
Primary request: Chinese-primary classroom infographic explaining semantic search ranking with query embedding and document embeddings
Subject: a query card labeled "睡眠质量" mapped into a vector space, three article cards mapped nearby, side-by-side ranking by cosine similarity and Euclidean distance
Style/medium: clean educational illustration, high contrast, modern classroom diagram
Composition/framing: landscape 16:9, clear central vector space, sparse labels, no dense paragraphs
Text (verbatim): "Query embedding", "Document embeddings", "cosine 排序", "distance 排序"
Constraints: no logos, no watermark, no fake UI brand, readable text, avoid decorative clutter
```

Prompt for `svd-image-compression-case.png`:

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab teaching infographic
Primary request: Chinese-primary diagram showing SVD low-rank image compression
Subject: grayscale image matrix, descending singular value bars, rank-1/rank-5/rank-20 reconstructions with increasing detail
Style/medium: clean scientific teaching infographic
Composition/framing: landscape 16:9, left-to-right learning flow
Text (verbatim): "原图矩阵", "奇异值", "低秩重建", "保留主结构"
Constraints: no logos, no watermark, readable text, mathematically plausible diagram
```

Prompt for `pca-embedding-visualization-case.png`:

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab teaching infographic
Primary request: Chinese-primary diagram showing PCA projection of high-dimensional embeddings
Subject: high-dimensional point cloud, centering around mean, projection onto two principal axes, visible clusters and one outlier
Style/medium: clean classroom infographic
Composition/framing: landscape 16:9, three panels: center, rotate axes, project to 2D
Text (verbatim): "中心化", "主方向", "2D 投影", "离群点"
Constraints: no logos, no watermark, readable text, avoid claiming PCA is a classifier
```

After generation, copy selected images from `$CODEX_HOME/generated_images/...` into `public/math-lab/generated/` with the filenames above.

- [ ] **Step 3: Inspect generated images**

Use `view_image` or local image inspection to verify:

- required text is readable enough
- no watermark or unrelated logo
- semantic-search image clearly separates cosine ranking and distance ranking
- SVD image shows descending singular values and increasing reconstruction detail
- PCA image shows centering and projection, not supervised classification

If a generated image fails, regenerate only that image with a tighter prompt.

- [ ] **Step 4: Wire images to modules**

Add `imageAsset(...)` entries:

- `semantic-search-ranking-case` in `linearAlgebraRouteModules.ts`
- `svd-image-compression-case` in `svdModule.ts`
- `pca-embedding-visualization-case` in `pcaModule.ts`

Add each new image ID to the relevant case-study section `visualIds`.

- [ ] **Step 5: Update source document**

Append to `docs/math-lab-linear-algebra-route-sources.md`:

```md
## Generated Route Case Images

These images were generated with Codex's built-in `imagegen` workflow, then copied into `public/math-lab/generated/` for local runtime use.

- `public/math-lab/generated/semantic-search-ranking-case.png`
- `public/math-lab/generated/svd-image-compression-case.png`
- `public/math-lab/generated/pca-embedding-visualization-case.png`
```

- [ ] **Step 6: Run layout tests**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit image assets**

```bash
git add public/math-lab/generated/semantic-search-ranking-case.png public/math-lab/generated/svd-image-compression-case.png public/math-lab/generated/pca-embedding-visualization-case.png src/modules/math-lab/data/linearAlgebraRouteModules.ts src/modules/math-lab/data/svdModule.ts src/modules/math-lab/data/pcaModule.ts docs/math-lab-linear-algebra-route-sources.md tests/math-lab-layout.test.mjs
git commit -m "Add linear algebra route case images"
```

---

### Task 7: Final Verification and Cleanup

**Files:**
- No planned source edits unless verification reveals a concrete issue.

- [ ] **Step 1: Run full test suite**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: build succeeds. Existing Vite chunk-size warnings are acceptable if unchanged.

- [ ] **Step 3: Check worktree**

Run:

```bash
git status --short
```

Expected: clean after commits.

- [ ] **Step 4: Review route manually through source**

Run:

```bash
node -e "import('./src/modules/math-lab/data/modules.ts').then(({mathLabModules}) => console.log(mathLabModules.map((m) => `${m.order}. ${m.id} -> ${m.nextModuleIds.join(',')}`).join('\n')))"
```

Expected: the beginning of output is:

```text
1. beginner-linear-algebra -> linear-algebra-feature-space
2. linear-algebra-feature-space -> linear-algebra-distance-similarity
3. linear-algebra-distance-similarity -> linear-algebra-matrix-transformations
4. linear-algebra-matrix-transformations -> linear-algebra-rank-null-space
5. linear-algebra-rank-null-space -> eigenvalues-eigenvectors
6. eigenvalues-eigenvectors -> svd
7. svd -> pca
8. pca -> tensor-shapes-vectorization
```

- [ ] **Step 5: Stop on any verification failure**

If any command in this task fails, do not create a generic cleanup commit. Inspect the failing test or build error, add a concrete follow-up task that names the exact files and assertions involved, then implement and commit that targeted fix before reporting completion.

---

## Self-Review Notes

Spec coverage:

- Route split into separate modules: Tasks 1-3.
- Case-driven chapters instead of AI footnotes: Tasks 2 and 4.
- Existing labs reused first: Tasks 2-3.
- SVD/PCA media continuity using Math-To-Manim: Task 5.
- Optional image generation with built-in imagegen and workspace persistence: Task 6.
- Tests/build verification: Task 7.

Scope decision:

- Chapter 8 capstone semantic search workbench is intentionally excluded from this implementation plan. It should receive its own spec/plan after chapters 1-7 are stable.

Risk controls:

- Keep the old imported `vectors-matrices-norms` builder branch during the first split to avoid accidental import regressions.
- Do not modify existing generated image assets unless Task 6 explicitly creates new sibling assets.
- Do not use external embedding APIs at runtime.
