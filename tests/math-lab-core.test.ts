import test from 'node:test'
import assert from 'node:assert/strict'
import { diagnosticQuestions, scoreDiagnostic } from '../src/modules/math-lab/data/diagnostic.ts'
import { mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import {
  angleBetween,
  cosineSimilarity,
  determinant2x2,
  dot,
  gradientDescentStep,
  isInvertible2x2,
  matrixVectorMultiply,
  norm,
  projection,
} from '../src/modules/math-lab/utils/math.ts'
import {
  estimateIntegralXSquared,
  estimatePiMonteCarlo,
  findLcgPeriod,
  lcgConfigForKind,
  lcgSequence,
  monteCarloPiStandardError,
} from '../src/modules/math-lab/utils/monteCarlo.ts'
import { estimateLuReuseCost, evaluateLu2x2 } from '../src/modules/math-lab/utils/luDecomposition.ts'
import { conditionNumber2x2, evaluateConditioning, makeColumnMatrix } from '../src/modules/math-lab/utils/conditionNumbers.ts'
import { evaluatePowerIteration } from '../src/modules/math-lab/utils/eigenPower.ts'
import {
  buildPageRankTransition,
  buildWeatherTransition,
  iterateMarkovChain,
  l1Distance,
  maxColumnSumError,
  stationaryDistributionPower,
} from '../src/modules/math-lab/utils/markovChains.ts'
import {
  evaluateFiniteDifference,
  evaluateLectureGradient,
  evaluateLectureJacobian,
  finiteDifferenceDerivative,
} from '../src/modules/math-lab/utils/finiteDifference.ts'
import {
  csrMatVec,
  denseToCoo,
  denseToCsr,
  estimateSparseStorage,
  sparseLectureMatrix,
} from '../src/modules/math-lab/utils/sparseMatrix.ts'
import { evaluateQuizAnswer, scoreQuiz } from '../src/modules/math-lab/utils/quiz.ts'
import {
  appendQuizAttempt,
  createDefaultProgress,
  loadMathLabProgress,
  markModuleComplete,
  saveMathLabProgress,
  setDiagnosticResult,
  type StorageLike,
} from '../src/modules/math-lab/utils/progress.ts'
import { evaluateTaylorApproximation } from '../src/modules/math-lab/utils/taylorSeries.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'
import { withPublicBase } from '../src/utils/publicPath.ts'

function createMemoryStorage(): StorageLike {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

test('math lab vector utilities compute dot, norm, cosine, angle, and projection', () => {
  const a = { x: 3, y: 4 }
  const b = { x: 4, y: 0 }

  assert.equal(dot(a, b), 12)
  assert.equal(norm(a), 5)
  assert.equal(cosineSimilarity(a, b), 0.6)
  assert.equal(Math.round(angleBetween(a, b)), 53)
  assert.deepEqual(projection(a, b), { x: 3, y: 0 })
})

test('math lab matrix and gradient utilities expose the expected teaching behavior', () => {
  const matrix = [
    [2, 1],
    [3, 4],
  ] as const

  assert.deepEqual(matrixVectorMultiply(matrix, { x: 2, y: 1 }), { x: 5, y: 10 })
  assert.equal(determinant2x2(matrix), 5)
  assert.equal(isInvertible2x2(matrix), true)
  assert.deepEqual(gradientDescentStep({ x: 2, y: -1 }, { x: 4, y: -2 }, 0.1), {
    x: 1.6,
    y: -0.8,
  })
})

test('imported math foundation modules include complete topics 6-19', () => {
  assert.equal(mathLabModules.length, 14)
  assert.deepEqual(
    mathLabModules.map((moduleDefinition) => moduleDefinition.order),
    [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  )
  assert.deepEqual(
    mathLabModules.map((moduleDefinition) => moduleDefinition.id),
    [
      'taylor-series',
      'monte-carlo',
      'vectors-matrices-norms',
      'lu-decomposition',
      'sparse-matrices',
      'condition-numbers',
      'eigenvalues-eigenvectors',
      'markov-chains',
      'finite-difference-methods',
      'nonlinear-equations',
      'optimization',
      'least-squares-fitting',
      'svd',
      'pca',
    ],
  )
  assert.deepEqual(
    mathLabModules.map((moduleDefinition) => moduleDefinition.title.en),
    [
      'Taylor Series',
      'Random Number Generators and Monte Carlo Methods',
      'Vectors, Matrices, and Norms',
      'LU Decomposition for Solving Linear Equations',
      'Sparse Matrices',
      'Condition Numbers',
      'Eigenvalues and Eigenvectors',
      'Markov chains',
      'Finite Difference Methods',
      'Solving Nonlinear Equations',
      'Optimization',
      'Least Squares Fitting',
      'Singular Value Decomposition (SVD)',
      'Principal Component Analysis (PCA)',
    ],
  )

  for (const moduleDefinition of mathLabModules) {
    assert.equal('attribution' in moduleDefinition, false, `${moduleDefinition.id} should not expose migrated attribution`)
    assert.equal(moduleDefinition.sections.length >= 3, true, `${moduleDefinition.id} needs complete lesson sections`)
    assert.equal(moduleDefinition.toc.length > 0, true, `${moduleDefinition.id} needs toc entries`)
    assert.equal(moduleDefinition.labs.length >= 1, true, `${moduleDefinition.id} needs an interactive lab entry`)
    assert.equal(moduleDefinition.sourceNoteFile?.endsWith('.md'), true, `${moduleDefinition.id} should track source filename internally`)
    assert.equal(moduleDefinition.originalSort, moduleDefinition.order)

    const englishBody = moduleDefinition.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')
    assert.equal(englishBody.length > 4000, true, `${moduleDefinition.id} should not use the previous shortened body`)
    if (moduleDefinition.id === 'taylor-series') {
      assert.match(englishBody, /Learning Objectives|Taylor Series Expansion|Taylor Series Error/)
    } else if (moduleDefinition.id === 'monte-carlo') {
      assert.match(englishBody, /Where Reproducible Randomness Comes From|Writing Areas and Integrals as Sample Averages/)
    } else if (moduleDefinition.id === 'vectors-matrices-norms') {
      assert.match(englishBody, /Vectors: Coordinates, Linear Combinations, and Span|Dot Product: Reading Angle as Similarity/)
    } else if (moduleDefinition.id === 'lu-decomposition') {
      assert.match(englishBody, /Basic Idea: The .Undo. button for Linear Operations|Back Substitution Algorithm for Upper Triangular Systems/)
    } else {
      assert.match(englishBody, /Learning Objectives|Learning objectives|Dense Matrices/)
    }
    if (moduleDefinition.id !== 'pca') {
      assert.match(englishBody, /Review Questions/)
    }
    assert.doesNotMatch(englishBody, /CS\s*357|Course Staff|changelog|site\.baseurl/)
  }
})

test('key math foundation topics are connected to interactive or video enhancements', () => {
  const byId = Object.fromEntries(mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))

  assert.ok(byId['taylor-series']!.labs.some((lab) => lab.componentName === 'TaylorSeriesLab'))
  assert.ok(byId['monte-carlo']!.labs.some((lab) => lab.componentName === 'MonteCarloLab'))
  assert.ok(byId['vectors-matrices-norms']!.labs.some((lab) => lab.componentName === 'VectorDotProductLab'))
  assert.ok(byId['vectors-matrices-norms']!.labs.some((lab) => lab.componentName === 'MatrixTransformLab'))
  assert.ok(byId['lu-decomposition']!.labs.some((lab) => lab.componentName === 'LuDecompositionLab'))
  assert.ok(byId['sparse-matrices']!.labs.some((lab) => lab.componentName === 'SparseMatrixLab'))
  assert.ok(byId['condition-numbers']!.labs.some((lab) => lab.componentName === 'ConditionNumbersLab'))
  assert.ok(byId['eigenvalues-eigenvectors']!.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
  assert.ok(byId['markov-chains']!.labs.some((lab) => lab.componentName === 'MarkovChainLab'))
  assert.ok(byId['finite-difference-methods']!.labs.some((lab) => lab.componentName === 'FiniteDifferenceLab'))
  assert.ok(byId.optimization!.labs.some((lab) => lab.componentName === 'MathGradientLab'))
  assert.ok(byId.svd!.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
  assert.ok(byId.pca!.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
})

test('taylor module presents hand-written bilingual content as an integrated reader chapter', () => {
  const taylor = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'taylor-series')
  assert.ok(taylor)

  assert.equal(taylor.title['zh-CN'], '泰勒级数')
  assert.equal(taylor.title.en, 'Taylor Series')
  assert.ok(taylor.learningObjectives.length >= 4)
  assert.ok(taylor.concepts.length >= 1)
  assert.ok(taylor.quizzes.length >= 2)
  assert.ok(taylor.misconceptions.length >= 2)
  assert.ok(taylor.labs.some((lab) => lab.componentName === 'TaylorSeriesLab'))
  assert.ok(taylor.visuals.some((visual) => visual.id === 'taylor-polynomial-video'))
  assert.ok(taylor.sections.some((section) => section.visualIds?.includes('taylor-polynomial-video')))
  assert.ok(taylor.sections.some((section) => section.labIds?.includes('taylor-series-lab')))
  assert.deepEqual(
    taylor.sections.map((section) => section.id),
    [
      'taylor-series-learning-objectives',
      'taylor-series-polynomial-overview',
      'taylor-series-taylor-series-expansion',
      'taylor-series-taylor-series-error',
      'taylor-series-ml-summary',
      'taylor-series-review-questions',
    ],
  )

  const zhBody = taylor.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = taylor.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /学习目标/)
  assert.match(zhBody, /多项式概览/)
  assert.match(zhBody, /Taylor 级数展开/)
  assert.match(zhBody, /Taylor 级数误差/)
  assert.match(zhBody, /Lagrange 余项/)
  assert.match(zhBody, /梯度下降/)
  assert.match(enBody, /Learning Objectives/)
  assert.match(enBody, /Polynomial Overview/)
  assert.match(enBody, /Taylor Series Expansion/)
  assert.match(enBody, /Taylor Series Error/)
  assert.match(enBody, /Taylor Remainder Theorem/)
  assert.match(enBody, /Lagrange/)
  assert.match(enBody, /gradient descent/i)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Source Note/)
  assert.doesNotMatch(zhBody, /泰勒系列扩展包|当时|A Taylor series is|How would we|Suppose that/)
})

test('taylor module markdown renders formulas without raw delimiters', () => {
  const taylor = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'taylor-series')
  assert.ok(taylor)

  const source = taylor.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(source)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('monte carlo module presents repaired bilingual content and inline sampling lab', () => {
  const monteCarlo = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'monte-carlo')
  assert.ok(monteCarlo)

  assert.equal(monteCarlo.title['zh-CN'], '随机数生成器与蒙特卡洛方法')
  assert.equal(monteCarlo.title.en, 'Random Number Generators and Monte Carlo Methods')
  assert.ok(monteCarlo.learningObjectives.length >= 4)
  assert.ok(monteCarlo.concepts.length >= 1)
  assert.ok(monteCarlo.quizzes.length >= 2)
  assert.ok(monteCarlo.misconceptions.length >= 2)
  assert.ok(monteCarlo.labs.some((lab) => lab.componentName === 'MonteCarloLab'))
  assert.ok(monteCarlo.visuals.some((visual) => visual.id === 'monte-carlo-sampling-video'))
  assert.ok(monteCarlo.sections.some((section) => section.visualIds?.includes('monte-carlo-sampling-video')))
  assert.ok(monteCarlo.sections.some((section) => section.labIds?.includes('monte-carlo-sampling-lab')))

  const zhBody = monteCarlo.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = monteCarlo.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /伪随机方法/)
  assert.match(zhBody, /公平骰子、大气噪声、热噪声/)
  assert.match(zhBody, /线性同余生成器/)
  assert.match(zhBody, /def lcg_gen_next/)
  assert.match(zhBody, /黄油面包/)
  assert.match(zhBody, /投掷实验重复/)
  assert.match(zhBody, /\/math-lab\/generated\/monte-carlo-sampling-illustration\.png/)
  assert.match(zhBody, /典型误差规模|误差为什么通常按/)
  assert.match(zhBody, /def f\(x: float, y: float\)/)
  assert.match(zhBody, /什么是伪随机数生成器/)
  assert.match(zhBody, /小批量梯度下降/)
  assert.match(enBody, /True Random and Pseudorandom/)
  assert.match(enBody, /linear congruential generator/)
  assert.match(enBody, /Will my buttered bread land face-down/)
  assert.match(enBody, /What is a pseudorandom number generator/)
  assert.match(enBody, /Mini-batch gradient descent/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Source Note/)
  assert.doesNotMatch(zhBody, /One of the most common applications|Consider using Monte Carlo|Below is the Python code|What is a pseudo-random/)
  assert.doesNotMatch(enBody, /随机数生成器具有|蒙特卡洛方法通常|复习问题/)
})

test('monte carlo module markdown renders formulas without raw delimiters', () => {
  const monteCarlo = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'monte-carlo')
  assert.ok(monteCarlo)

  const source = monteCarlo.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(source)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('vectors matrices norms module presents repaired bilingual content and inline labs', () => {
  const vectorModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'vectors-matrices-norms')
  assert.ok(vectorModule)

  assert.equal(vectorModule.title['zh-CN'], '向量、矩阵与范数')
  assert.equal(vectorModule.title.en, 'Vectors, Matrices, and Norms')
  assert.ok(vectorModule.learningObjectives.length >= 4)
  assert.ok(vectorModule.concepts.length >= 3)
  assert.ok(vectorModule.quizzes.length >= 3)
  assert.ok(vectorModule.misconceptions.length >= 3)
  assert.ok(vectorModule.labs.some((lab) => lab.componentName === 'VectorDotProductLab'))
  assert.ok(vectorModule.labs.some((lab) => lab.componentName === 'MatrixTransformLab'))
  assert.ok(vectorModule.visuals.some((visual) => visual.id === 'vector-span-norm-video'))
  assert.ok(vectorModule.visuals.some((visual) => visual.id === 'vector-dot-product-video'))
  assert.ok(vectorModule.visuals.some((visual) => visual.id === 'matrix-transform-video'))
  assert.ok(vectorModule.sections.some((section) => section.visualIds?.includes('vector-span-norm-video')))
  assert.ok(vectorModule.sections.some((section) => section.visualIds?.includes('vector-dot-product-video')))
  assert.ok(vectorModule.sections.some((section) => section.visualIds?.includes('matrix-transform-video')))
  assert.ok(vectorModule.sections.some((section) => section.labIds?.includes('vector-dot-product-lab')))
  assert.ok(vectorModule.sections.some((section) => section.labIds?.includes('matrix-transform-lab')))

  const zhBody = vectorModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = vectorModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /向量：坐标、线性组合与 span/)
  assert.match(zhBody, /点积：把夹角读成相似度/)
  assert.match(zhBody, /矩阵：看列向量如何移动空间/)
  assert.match(zhBody, /\/math-lab\/generated\/vector-matrix-norms-illustration\.png/)
  assert.match(zhBody, /向量空间/)
  assert.match(zhBody, /置换矩阵/)
  assert.match(zhBody, /P\\mathbf\{x\}=\[2,4,1,3\]\^\\top/)
  assert.match(zhBody, /\\sqrt\{78\}/)
  assert.match(zhBody, /\\lambda\^2 - 23\\lambda \+ 49 = 0/)
  assert.match(zhBody, /submultiplicative/)
  assert.match(zhBody, /Embedding 相似度/)
  assert.match(enBody, /Vectors: Coordinates/)
  assert.match(enBody, /Matrix Norms: How Much a Linear Layer Can Amplify/)
  assert.match(enBody, /Special Matrices, Rank, and Representing Linear Transformations/)
  assert.match(enBody, /Frobenius example/)
  assert.match(enBody, /lower bound on/)
  assert.match(enBody, /What is a vector space/)
  assert.match(enBody, /Gradient norms/)
  const objectiveSource = vectorModule.learningObjectives.map((objective) => `${objective['zh-CN']}\n${objective.en}`).join('\n')
  assert.match(objectiveSource, /Recognize zero, identity, diagonal, triangular, permutation, and block matrices/)
  assert.match(objectiveSource, /Perform matrix-vector multiplication/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Source Note/)
  assert.doesNotMatch(zhBody, /A \*\*_vector_\*\* is an array|Perform matrix-vector multiplications|What is a vector space/)
})

test('vectors matrices norms module markdown renders formulas without raw delimiters', () => {
  const vectorModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'vectors-matrices-norms')
  assert.ok(vectorModule)

  const source = vectorModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(source)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('lu decomposition module presents repaired bilingual content and inline LU lab', () => {
  const luModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'lu-decomposition')
  assert.ok(luModule)

  assert.equal(luModule.title['zh-CN'], '用 LU 分解求解线性方程')
  assert.equal(luModule.title.en, 'LU Decomposition for Solving Linear Equations')
  assert.ok(luModule.learningObjectives.length >= 5)
  assert.ok(luModule.concepts.length >= 2)
  assert.ok(luModule.quizzes.length >= 3)
  assert.ok(luModule.misconceptions.length >= 3)
  assert.ok(luModule.labs.some((lab) => lab.componentName === 'LuDecompositionLab'))
  assert.ok(luModule.sections.some((section) => section.labIds?.includes('lu-decomposition-solve-lab')))
  assert.ok(luModule.sections.length >= 16)
  assert.ok(luModule.sections.some((section) => section.id === 'lu-decomposition-basic-idea-the-undo-button-for-linear-operations'))
  assert.ok(luModule.sections.some((section) => section.id === 'lu-decomposition-back-substitution-algorithm-for-upper-triangular-systems'))
  assert.ok(luModule.sections.some((section) => section.id === 'lu-decomposition-the-lu-decomposition-algorithm'))
  assert.ok(luModule.sections.some((section) => section.id === 'lu-decomposition-the-lup-decomposition-algorithm'))
  assert.ok(luModule.sections.some((section) => section.id === 'lu-decomposition-review-questions'))

  const zhBody = luModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = luModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(enBody, /Matrix-vector multiplication: given/)
  assert.match(enBody, /def back_sub/)
  assert.match(enBody, /def forward_sub/)
  assert.match(enBody, /def lu_decomp/)
  assert.match(enBody, /def lup_decomp/)
  assert.match(enBody, /Given a factorization/)
  assert.match(enBody, /The lab below uses the same/)
  assert.match(enBody, /Schur complement/)
  assert.match(enBody, /Partial pivoting/)
  assert.match(enBody, /inverse iteration/)
  assert.match(zhBody, /矩阵-向量乘法可以这样理解/)
  assert.match(zhBody, /回代算法/)
  assert.match(zhBody, /前代算法/)
  assert.match(zhBody, /LU 分解的性质如下/)
  assert.match(zhBody, /怎样求这个矩阵的 LUP 分解/)
  assert.match(zhBody, /给定分解/)
  assert.doesNotMatch(
    zhBody,
    /Matrix-vector multiplication: given|The properties of this algorithm are|How can we solve|What is the cost of matrix-matrix multiplication|Given a factorization/,
  )
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|Cleaned Source|Source Note|Errata/)
})

test('lu decomposition module markdown renders formulas without raw delimiters', () => {
  const luModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'lu-decomposition')
  assert.ok(luModule)

  const source = luModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const objectiveSource = luModule.learningObjectives.map((objective) => objective['zh-CN']).join('\n\n')
  const html = renderMarkdownWithMath(`${objectiveSource}\n\n${source}`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /Amathbf|mathcalO|times2/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('sparse matrices module presents repaired bilingual content and inline CSR lab', () => {
  const sparseModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'sparse-matrices')
  assert.ok(sparseModule)

  assert.equal(sparseModule.title['zh-CN'], '稀疏矩阵')
  assert.equal(sparseModule.title.en, 'Sparse Matrices')
  assert.ok(sparseModule.learningObjectives.length >= 5)
  assert.ok(sparseModule.concepts.length >= 2)
  assert.ok(sparseModule.quizzes.length >= 3)
  assert.ok(sparseModule.misconceptions.length >= 3)
  assert.ok(sparseModule.labs.some((lab) => lab.componentName === 'SparseMatrixLab'))
  assert.ok(sparseModule.sections.some((section) => section.labIds?.includes('sparse-matrix-storage-lab')))

  const zhBody = sparseModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = sparseModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /Dense 矩阵：所有位置都要存/)
  assert.match(zhBody, /COO：把非零项写成三元组/)
  assert.match(zhBody, /CSR：用 rowptr 把每一行切出来/)
  assert.match(zhBody, /CSR 矩阵向量乘法/)
  assert.match(zhBody, /推荐系统/)
  assert.match(zhBody, /\\operatorname\{nnz\}\(A\)/)
  assert.match(enBody, /Dense Matrices: Every Position Is Stored/)
  assert.match(enBody, /COO: Store Nonzeros as Triples/)
  assert.match(enBody, /CSR: Use rowptr to Slice Each Row/)
  assert.match(enBody, /Sparse Structure in Machine Learning/)
  assert.match(enBody, /def csr_mat_vec/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|Cleaned Source|Source Note|Course Staff|changelog/)
  assert.doesNotMatch(zhBody, /Some types of matrices contain too many zeros|What does it mean for a matrix to be sparse/)
  assert.doesNotMatch(enBody, /什么叫稀疏矩阵|推荐系统|图学习/)
})

test('sparse matrices module markdown renders formulas without raw delimiters', () => {
  const sparseModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'sparse-matrices')
  assert.ok(sparseModule)

  const source = sparseModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(source)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('condition numbers module preserves lecture coverage with bilingual repair and inline lab', () => {
  const conditionModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'condition-numbers')
  assert.ok(conditionModule)

  assert.equal(conditionModule.title['zh-CN'], '条件数与敏感性')
  assert.equal(conditionModule.title.en, 'Condition Numbers')
  assert.ok(conditionModule.learningObjectives.length >= 5)
  assert.ok(conditionModule.concepts.length >= 2)
  assert.ok(conditionModule.quizzes.length >= 3)
  assert.ok(conditionModule.misconceptions.length >= 3)
  assert.ok(conditionModule.labs.some((lab) => lab.componentName === 'ConditionNumbersLab'))
  assert.ok(conditionModule.sections.some((section) => section.labIds?.includes('condition-number-amplification-lab')))

  const sectionIds = conditionModule.sections.map((section) => section.id)
  assert.ok(sectionIds.includes('condition-numbers-sensitivity-of-solutions-of-linear-systems-and-error-bound'))
  assert.ok(sectionIds.includes('condition-numbers-condition-number'))
  assert.ok(sectionIds.includes('condition-numbers-residual-vs-error'))
  assert.ok(sectionIds.includes('condition-numbers-alternative-definitions-of-relative-residual'))
  assert.ok(sectionIds.includes('condition-numbers-gaussian-elimination-with-partial-pivoting-is-guaranteed-to-produce-a-small-residual'))
  assert.ok(sectionIds.includes('condition-numbers-accuracy-rule-of-thumb-for-conditioning'))

  const zhBody = conditionModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = conditionModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /线性系统解的敏感性与误差界/)
  assert.match(zhBody, /诱导矩阵范数/)
  assert.match(zhBody, /正交矩阵/)
  assert.match(zhBody, /行列式不是判断/)
  assert.match(zhBody, /残差与误差不是一回事/)
  assert.match(zhBody, /带部分主元/)
  assert.match(zhBody, /16-10=6/)
  assert.match(zhBody, /特征缩放/)
  assert.match(zhBody, /\\operatorname\{cond\}\(X\^TX\)=\\operatorname\{cond\}\(X\)\^2/)
  assert.match(enBody, /Sensitivity of Linear-System Solutions/)
  assert.match(enBody, /Induced Matrix Norms/)
  assert.match(enBody, /Residual and Error Are Not the Same Thing/)
  assert.match(enBody, /Gaussian elimination with partial pivoting/)
  assert.match(enBody, /Feature scaling/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Course Staff|changelog/)
  assert.doesNotMatch(zhBody, /Suppose we start|The condition number of a matrix|What is the 2-norm|How many accurate decimal digits/)
  assert.doesNotMatch(enBody, /条件数是衡量|残差与误差|特征缩放/)
})

test('condition numbers module markdown renders formulas without raw delimiters', () => {
  const conditionModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'condition-numbers')
  assert.ok(conditionModule)

  const source = conditionModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(source)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('eigenvalues module presents repaired bilingual content with inline power iteration lab', () => {
  const eigenModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'eigenvalues-eigenvectors')
  assert.ok(eigenModule)

  assert.equal(eigenModule.title['zh-CN'], '特征值与特征向量')
  assert.equal(eigenModule.title.en, 'Eigenvalues and Eigenvectors')
  assert.ok(eigenModule.learningObjectives.length >= 5)
  assert.ok(eigenModule.concepts.length >= 3)
  assert.ok(eigenModule.quizzes.length >= 4)
  assert.ok(eigenModule.misconceptions.length >= 3)
  assert.ok(eigenModule.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
  assert.ok(eigenModule.sections.some((section) => section.labIds?.includes('eigen-power-iteration-lab')))

  const sectionIds = eigenModule.sections.map((section) => section.id)
  assert.ok(sectionIds.includes('eigenvalues-eigenvectors-definition-and-small-example'))
  assert.ok(sectionIds.includes('eigenvalues-eigenvectors-diagonalization'))
  assert.ok(sectionIds.includes('eigenvalues-eigenvectors-shifts-and-inverses'))
  assert.ok(sectionIds.includes('eigenvalues-eigenvectors-power-iteration'))
  assert.ok(sectionIds.includes('eigenvalues-eigenvectors-inverse-shifted-and-costs'))
  assert.ok(sectionIds.includes('eigenvalues-eigenvectors-orthogonal-bases'))
  assert.ok(sectionIds.includes('eigenvalues-eigenvectors-review-questions'))

  const zhBody = eigenModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = eigenModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /特征多项式/)
  assert.match(zhBody, /可对角化/)
  assert.match(zhBody, /平移逆迭代/)
  assert.match(zhBody, /Rayleigh quotient/)
  assert.match(zhBody, /Gram-Schmidt/)
  assert.match(zhBody, /谱间隔/)
  assert.match(zhBody, /PCA/)
  assert.match(zhBody, /PageRank/)
  assert.match(enBody, /Characteristic Polynomial/)
  assert.match(enBody, /Diagonalization/)
  assert.match(enBody, /shifted inverse iteration/i)
  assert.match(enBody, /Rayleigh quotient iteration/i)
  assert.match(enBody, /Gram-Schmidt/)
  assert.match(enBody, /Spectral Structure in Machine Learning/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Course Staff|changelog/)
  assert.doesNotMatch(zhBody, /An \*\*_eigenvalue_\*\*|Power iteration allows us|The following code snippet performs power iteration/)
  assert.doesNotMatch(enBody, /特征值|特征向量|平移逆迭代|复习问题/)
})

test('eigenvalues module markdown renders formulas without raw delimiters', () => {
  const eigenModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'eigenvalues-eigenvectors')
  assert.ok(eigenModule)

  const source = eigenModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const objectiveSource = eigenModule.learningObjectives.map((objective) => objective['zh-CN']).join('\n\n')
  const conceptSource = eigenModule.concepts
    .map((concept) => `${concept.plainExplanation['zh-CN']}\n\n${concept.numericalExample['zh-CN']}`)
    .join('\n\n')
  const quizSource = eigenModule.quizzes
    .map((quiz) => `${quiz.prompt['zh-CN']}\n\n${quiz.explanation['zh-CN']}`)
    .join('\n\n')
  const misconceptionSource = eigenModule.misconceptions
    .map((misconception) => `${misconception.correction['zh-CN']}\n\n${misconception.example['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(`${objectiveSource}\n\n${conceptSource}\n\n${source}\n\n${quizSource}\n\n${misconceptionSource}`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /Amathbf|lambdamathbf/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('markov chains module preserves lecture coverage with bilingual repair and inline PageRank lab', () => {
  const markovModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'markov-chains')
  assert.ok(markovModule)

  assert.equal(markovModule.title['zh-CN'], '马尔可夫链')
  assert.equal(markovModule.title.en, 'Markov chains')
  assert.ok(markovModule.learningObjectives.length >= 5)
  assert.ok(markovModule.concepts.length >= 3)
  assert.ok(markovModule.quizzes.length >= 3)
  assert.ok(markovModule.misconceptions.length >= 3)
  assert.ok(markovModule.labs.some((lab) => lab.componentName === 'MarkovChainLab'))
  assert.ok(markovModule.sections.some((section) => section.labIds?.includes('markov-chain-pagerank-lab')))

  const sectionIds = markovModule.sections.map((section) => section.id)
  assert.ok(sectionIds.includes('markov-chains-graphs-as-matrices'))
  assert.ok(sectionIds.includes('markov-chains-property-and-matrix'))
  assert.ok(sectionIds.includes('markov-chains-weather-example'))
  assert.ok(sectionIds.includes('markov-chains-stationary-distribution'))
  assert.ok(sectionIds.includes('markov-chains-pagerank'))
  assert.ok(sectionIds.includes('markov-chains-review-questions'))

  const zhBody = markovModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = markovModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /从图到邻接矩阵/)
  assert.match(zhBody, /带权有向图/)
  assert.match(zhBody, /列表示当前状态、行表示下一状态/)
  assert.match(zhBody, /天气状态转移图/)
  assert.match(zhBody, /稳定分布/)
  assert.match(zhBody, /特征值 1/)
  assert.match(zhBody, /PageRank/)
  assert.match(zhBody, /阻尼因子/)
  assert.match(zhBody, /MCMC/)
  assert.match(enBody, /From Graphs to Adjacency Matrices/)
  assert.match(enBody, /column-stochastic/)
  assert.match(enBody, /Weather Example/)
  assert.match(enBody, /A Stationary Distribution Is the Eigenvalue-1 Direction/)
  assert.match(enBody, /PageRank/)
  assert.match(enBody, /damping factor/)
  assert.match(enBody, /MCMC/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Course Staff|changelog/)
  assert.doesNotMatch(zhBody, /A graph, at an abstract level|Suppose we want to build|Page Rank is a straightforward algorithm/)
  assert.doesNotMatch(enBody, /无向图|稳定分布|复习问题/)
})

test('markov chains module markdown renders formulas without raw delimiters', () => {
  const markovModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'markov-chains')
  assert.ok(markovModule)

  const source = markovModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const objectiveSource = markovModule.learningObjectives.map((objective) => objective['zh-CN']).join('\n\n')
  const conceptSource = markovModule.concepts
    .map((concept) => `${concept.plainExplanation['zh-CN']}\n\n${concept.numericalExample['zh-CN']}`)
    .join('\n\n')
  const quizSource = markovModule.quizzes
    .map((quiz) => `${quiz.prompt['zh-CN']}\n\n${quiz.explanation['zh-CN']}`)
    .join('\n\n')
  const misconceptionSource = markovModule.misconceptions
    .map((misconception) => `${misconception.correction['zh-CN']}\n\n${misconception.example['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(`${objectiveSource}\n\n${conceptSource}\n\n${source}\n\n${quizSource}\n\n${misconceptionSource}`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('finite difference module preserves lecture coverage with bilingual repair and inline step-size lab', () => {
  const finiteModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'finite-difference-methods')
  assert.ok(finiteModule)

  assert.equal(finiteModule.title['zh-CN'], '有限差分方法')
  assert.equal(finiteModule.title.en, 'Finite Difference Methods')
  assert.ok(finiteModule.learningObjectives.length >= 5)
  assert.ok(finiteModule.concepts.length >= 3)
  assert.ok(finiteModule.quizzes.length >= 3)
  assert.ok(finiteModule.misconceptions.length >= 3)
  assert.ok(finiteModule.labs.some((lab) => lab.componentName === 'FiniteDifferenceLab'))
  assert.ok(finiteModule.sections.some((section) => section.labIds?.includes('finite-difference-error-lab')))

  const sectionIds = finiteModule.sections.map((section) => section.id)
  assert.ok(sectionIds.includes('finite-difference-methods-derivative-from-samples'))
  assert.ok(sectionIds.includes('finite-difference-methods-three-stencils'))
  assert.ok(sectionIds.includes('finite-difference-methods-step-size-error'))
  assert.ok(sectionIds.includes('finite-difference-methods-gradient-checking'))
  assert.ok(sectionIds.includes('finite-difference-methods-jacobian'))
  assert.ok(sectionIds.includes('finite-difference-methods-review-questions'))

  const zhBody = finiteModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = finiteModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /前向差分/)
  assert.match(zhBody, /后向差分/)
  assert.match(zhBody, /中心差分/)
  assert.match(zhBody, /截断误差/)
  assert.match(zhBody, /相消误差/)
  assert.match(zhBody, /f\(x\)=2x\^2\+15x\+1/)
  assert.match(zhBody, /gradient check/)
  assert.match(zhBody, /Jacobian/)
  assert.match(zhBody, /\/math-lab\/cs357-assets\/figs\/finite_diff_errors\.png/)
  assert.match(enBody, /Forward difference/)
  assert.match(enBody, /Backward difference/)
  assert.match(enBody, /Central difference/)
  assert.match(enBody, /roundoff and cancellation/)
  assert.match(enBody, /gradient check/i)
  assert.match(enBody, /Jacobian approximation/)
  assert.match(enBody, /Black-box model debugging/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Course Staff|changelog/)
  assert.doesNotMatch(zhBody, /For a given smooth function|Using a similar approach|Assume .*we are trying/)
  assert.doesNotMatch(enBody, /有限差分|复习问题|学习目标/)
})

test('finite difference module markdown renders formulas without raw delimiters', () => {
  const finiteModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'finite-difference-methods')
  assert.ok(finiteModule)

  const source = finiteModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const objectiveSource = finiteModule.learningObjectives.map((objective) => objective['zh-CN']).join('\n\n')
  const conceptSource = finiteModule.concepts
    .map((concept) => `${concept.plainExplanation['zh-CN']}\n\n${concept.numericalExample['zh-CN']}`)
    .join('\n\n')
  const quizSource = finiteModule.quizzes
    .map((quiz) => `${quiz.prompt['zh-CN']}\n\n${quiz.explanation['zh-CN']}`)
    .join('\n\n')
  const misconceptionSource = finiteModule.misconceptions
    .map((misconception) => `${misconception.correction['zh-CN']}\n\n${misconception.example['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(`${objectiveSource}\n\n${conceptSource}\n\n${source}\n\n${quizSource}\n\n${misconceptionSource}`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('taylor approximation utilities expose expected error trends', () => {
  const degreeOne = evaluateTaylorApproximation('sin', 0.8, 0, 1)
  const degreeThree = evaluateTaylorApproximation('sin', 0.8, 0, 3)
  const degreeFive = evaluateTaylorApproximation('sin', 0.8, 0, 5)
  assert.ok(degreeThree.error < degreeOne.error)
  assert.ok(degreeFive.error < degreeThree.error)

  const expApprox = evaluateTaylorApproximation('exp', 1.1, 0, 5)
  assert.ok(expApprox.remainderBound >= expApprox.error)
  assert.ok(expApprox.nextTermEstimate > 0)
})

test('monte carlo utilities expose reproducible sampling and expected error scaling', () => {
  const stableConfig = lcgConfigForKind('stable', 17)
  const shortConfig = lcgConfigForKind('short-cycle', 17)
  const shortSequence = lcgSequence(shortConfig, 6)
  const shortPeriod = findLcgPeriod(shortConfig, 100)

  assert.equal(shortSequence.length, 6)
  assert.ok(shortSequence.every((value) => value > 0 && value < shortConfig.modulus))
  assert.ok(shortPeriod && shortPeriod < shortConfig.modulus)
  assert.equal(findLcgPeriod(stableConfig, 500), undefined)

  const se100 = monteCarloPiStandardError(100)
  const se400 = monteCarloPiStandardError(400)
  assert.ok(se400 < se100)
  assert.ok(Math.abs(se100 / se400 - 2) < 1e-12)

  const piEstimate = estimatePiMonteCarlo({
    samples: 3000,
    seed: 17,
    generatorKind: 'stable',
    visiblePoints: 50,
  })
  assert.equal(piEstimate.points.length, 50)
  assert.ok(piEstimate.estimate > 2.9 && piEstimate.estimate < 3.35)
  assert.ok(piEstimate.standardError > 0)

  const integralEstimate = estimateIntegralXSquared(8000, 23, 'stable')
  assert.ok(integralEstimate.absoluteError < 0.02)
})

test('lu utilities expose factorization, solve residuals, pivot warnings, and reuse savings', () => {
  const evaluation = evaluateLu2x2({
    a11: 4,
    a12: 2,
    a21: 3,
    a22: 5,
    b1: 6,
    b2: 7,
  })

  assert.equal(evaluation.multiplier, 0.75)
  assert.equal(evaluation.schurComplement, 3.5)
  assert.ok(Math.abs(evaluation.x[0] - 8 / 7) < 1e-12)
  assert.ok(Math.abs(evaluation.x[1] - 5 / 7) < 1e-12)
  assert.ok(evaluation.residualNorm < 1e-12)

  const pivotCandidate = evaluateLu2x2({
    a11: 0.25,
    a12: 2,
    a21: 3,
    a22: 5,
    b1: 6,
    b2: 7,
  }, 0.08)
  assert.equal(pivotCandidate.needsPivot, true)

  const nearSingular = evaluateLu2x2({
    a11: 4,
    a12: 2,
    a21: 3,
    a22: 1.5,
    b1: 6,
    b2: 7,
  }, 0.08)
  assert.equal(nearSingular.singular, true)

  const oneRhs = estimateLuReuseCost(160, 1)
  const sixRhs = estimateLuReuseCost(160, 6)
  assert.ok(sixRhs.factorOnceCost < sixRhs.refactorEachSolveCost)
  assert.ok(sixRhs.speedup > oneRhs.speedup)
})

test('condition number utilities expose sensitivity trends and residual-error bounds', () => {
  const wellConditioned = makeColumnMatrix(80, 1)
  const illConditioned = makeColumnMatrix(5, 1)

  assert.ok(conditionNumber2x2(illConditioned) > conditionNumber2x2(wellConditioned))

  const stable = evaluateConditioning({
    columnAngleDegrees: 80,
    secondColumnScale: 1,
    perturbationPower: -6,
    perturbationAngleDegrees: 90,
    inputDigits: 16,
  })
  const sensitive = evaluateConditioning({
    columnAngleDegrees: 5,
    secondColumnScale: 1,
    perturbationPower: -6,
    perturbationAngleDegrees: 90,
    inputDigits: 16,
  })

  assert.ok(sensitive.conditionNumber > stable.conditionNumber)
  assert.ok(sensitive.relativeOutputError > stable.relativeOutputError)
  assert.ok(sensitive.errorBound >= sensitive.relativeOutputError)
  assert.ok(Math.abs(sensitive.relativeResidual - sensitive.relativeInputError) < 1e-12)
  assert.ok(sensitive.expectedDigits < stable.expectedDigits)
})

test('eigen power iteration utility exposes spectral gap, residual, and sign-flip behavior', () => {
  const early = evaluatePowerIteration({
    matrixKind: 'well-separated',
    iterations: 2,
    initialAngleRadians: 0.6,
  })
  const later = evaluatePowerIteration({
    matrixKind: 'well-separated',
    iterations: 12,
    initialAngleRadians: 0.6,
  })
  const slowGap = evaluatePowerIteration({
    matrixKind: 'slow-gap',
    iterations: 12,
    initialAngleRadians: 0.6,
  })
  const signFlip = evaluatePowerIteration({
    matrixKind: 'sign-flip',
    iterations: 6,
    initialAngleRadians: 0.6,
  })

  assert.equal(later.iterates.length, 13)
  assert.ok(later.residualNorm < early.residualNorm)
  assert.ok(Math.abs(later.rayleighQuotient - later.dominantEigenvalue) < 0.01)
  assert.ok(slowGap.spectralRatio > later.spectralRatio)
  assert.ok(signFlip.dominantEigenvalue < 0)
  assert.equal(signFlip.iterates.length, 7)
})

test('markov chain utilities expose column-stochastic updates, stationarity, and PageRank damping', () => {
  const weather = buildWeatherTransition(0)
  const rainyStart = [0, 1, 0]
  const rainyHistory = iterateMarkovChain(weather, rainyStart, 1)

  assert.ok(maxColumnSumError(weather) < 1e-12)
  assert.deepEqual(rainyHistory[1]!.map((value) => Number(value.toFixed(12))), [0.2, 0.4, 0.4])

  const stickyWeather = buildWeatherTransition(0.6)
  assert.ok(maxColumnSumError(stickyWeather) < 1e-12)
  assert.ok(stickyWeather[0]![0]! > weather[0]![0]!)

  const pageRank = buildPageRankTransition(0.85)
  assert.ok(maxColumnSumError(pageRank.transitionMatrix) < 1e-12)
  assert.ok(pageRank.transitionMatrix.every((row) => row.every((value) => value > 0)))

  const stationary = stationaryDistributionPower(pageRank.transitionMatrix)
  const totalProbability = stationary.vector.reduce((acc, value) => acc + value, 0)
  assert.ok(Math.abs(totalProbability - 1) < 1e-12)
  assert.ok(stationary.residual < 1e-10)

  const history = iterateMarkovChain(pageRank.transitionMatrix, [1, 0, 0, 0, 0, 0], 20)
  assert.ok(l1Distance(history[20]!, stationary.vector) < l1Distance(history[0]!, stationary.vector))
})

test('finite difference utilities expose stencil accuracy and gradient/Jacobian trends', () => {
  const quadratic = (x: number) => 2 * x ** 2 + 15 * x + 1

  assert.equal(finiteDifferenceDerivative(quadratic, 10, 0.01, 'forward').toFixed(2), '55.02')
  assert.equal(finiteDifferenceDerivative(quadratic, 10, 0.01, 'backward').toFixed(2), '54.98')
  assert.equal(finiteDifferenceDerivative(quadratic, 10, 0.01, 'central').toFixed(2), '55.00')

  const forwardWide = evaluateFiniteDifference({
    functionKind: 'exp-shift',
    method: 'forward',
    x: 0.4,
    h: 1e-1,
  })
  const forwardNarrow = evaluateFiniteDifference({
    functionKind: 'exp-shift',
    method: 'forward',
    x: 0.4,
    h: 1e-4,
  })
  const centralNarrow = evaluateFiniteDifference({
    functionKind: 'exp-shift',
    method: 'central',
    x: 0.4,
    h: 1e-4,
  })
  const tiny = evaluateFiniteDifference({
    functionKind: 'exp-shift',
    method: 'forward',
    x: 0.4,
    h: 1e-12,
  })

  assert.ok(forwardNarrow.absoluteError < forwardWide.absoluteError)
  assert.ok(centralNarrow.absoluteError < forwardNarrow.absoluteError)
  assert.ok(tiny.roundingEstimate > forwardNarrow.roundingEstimate)
  assert.equal(centralNarrow.functionEvaluations, 2)
  assert.equal(forwardNarrow.functionEvaluations, 1)

  const gradientForward = evaluateLectureGradient(0.05, 'forward')
  const gradientCentral = evaluateLectureGradient(0.05, 'central')
  assert.ok(gradientCentral.errorNorm < gradientForward.errorNorm)
  assert.deepEqual(gradientForward.approximation.map((value) => Number(value.toFixed(4))), [14.985, 74.4575])

  const jacobianForward = evaluateLectureJacobian(0.1, 'forward')
  const jacobianCentral = evaluateLectureJacobian(0.1, 'central')
  assert.deepEqual(jacobianForward.approximation.map((row) => row.map((value) => Number(value.toFixed(1)))), [
    [54.2, 18],
    [3, 7],
  ])
  assert.ok(jacobianCentral.maxError < jacobianForward.maxError)
})

test('sparse matrix utilities expose COO, CSR, matvec, and storage estimates', () => {
  const coo = denseToCoo(sparseLectureMatrix)
  const csr = denseToCsr(sparseLectureMatrix)

  assert.equal(coo.entries.length, 12)
  assert.deepEqual(coo.entries[0], { row: 0, column: 0, value: 1 })
  assert.deepEqual(coo.entries[coo.entries.length - 1], { row: 4, column: 4, value: 12 })
  assert.deepEqual(csr.rowptr, [0, 2, 5, 9, 11, 12])
  assert.deepEqual(csr.col, [0, 3, 0, 1, 3, 0, 2, 3, 4, 2, 3, 4])
  assert.deepEqual(csr.data, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  assert.deepEqual(csrMatVec(csr, [1, 2, 3, 4, 5]), [9, 31, 104, 74, 60])

  const estimate = estimateSparseStorage({ size: 1000, nonzerosPerRow: 4 })
  assert.equal(estimate.nnz, 4000)
  assert.equal(estimate.denseElements, 1_000_000)
  assert.equal(estimate.csrElements, 9001)
  assert.equal(estimate.density, 0.004)
  assert.ok(estimate.denseBytes > estimate.csrBytes)
  assert.ok(estimate.denseMatVecOps > estimate.sparseMatVecOps)
})

test('markdown renderer supports formulas, tables, code blocks, images, and callouts', () => {
  const html = renderMarkdownWithMath(`
## Heading

Inline math \\(x^2\\), dollar math $y = mx+b$, and display math:

<div>\\[
B = Q R
\\]</div>

\\[
A = U\\Sigma V^T
\\]

| Method | Error |
| --- | --- |
| central | low |

\`\`\`python
print("ok")
\`\`\`

![figure](/manim/math-lab/vector-dot-product.svg)

<details>
  <summary><strong>Answer</strong></summary>
  Keep the full worked solution visible on demand.
</details>

> Review this numerical assumption.
`)

  assert.match(html, /katex/)
  assert.match(html, /<table>/)
  assert.match(html, /<pre><code/)
  assert.match(html, /<img/)
  assert.match(html, /<details>/)
  assert.match(html, /<blockquote>/)
})

test('public asset paths are rebased for GitHub Pages project deployments', () => {
  assert.equal(withPublicBase('/math-lab/cs357-assets/figs/vector_example.png', '/ML_tutorial_Site/'), '/ML_tutorial_Site/math-lab/cs357-assets/figs/vector_example.png')
  assert.equal(withPublicBase('/manim/math-lab/vector-dot-product.mp4', '/ML_tutorial_Site/'), '/ML_tutorial_Site/manim/math-lab/vector-dot-product.mp4')
  assert.equal(withPublicBase('/ML_tutorial_Site/math-lab/cs357-assets/figs/vector_example.png', '/ML_tutorial_Site/'), '/ML_tutorial_Site/math-lab/cs357-assets/figs/vector_example.png')
  assert.equal(withPublicBase('https://example.com/asset.png', '/ML_tutorial_Site/'), 'https://example.com/asset.png')
  assert.equal(withPublicBase('#section', '/ML_tutorial_Site/'), '#section')
})

test('markdown renderer sanitizes raw html while preserving teaching markup', () => {
  const html = renderMarkdownWithMath(`
<img src="/math-lab/cs357-assets/figs/vector_example.png" alt="Vector" width="300" height="200" onerror="alert(1)" style="color: red" />
<a href="javascript:alert(1)" title="bad">unsafe link</a>
<a href="https://example.com/math" title="safe">safe link</a>
<script>alert(1)</script>
<iframe src="https://example.com"></iframe>
<style>.bad { color: red }</style>
<details open>
  <summary><strong>Answer</strong></summary>
  <div class="figure" style="color: red"><span id="safe-note">Allowed teaching note</span></div>
</details>
`)

  assert.match(html, /<img/)
  assert.match(html, /src="\/math-lab\/cs357-assets\/figs\/vector_example\.png"/)
  assert.match(html, /alt="Vector"/)
  assert.match(html, /width="300"/)
  assert.match(html, /height="200"/)
  assert.doesNotMatch(html, /onerror/)
  assert.doesNotMatch(html, /style=/)
  assert.doesNotMatch(html, /javascript:/)
  assert.match(html, /<a title="bad">unsafe link<\/a>/)
  assert.match(html, /<a href="https:\/\/example\.com\/math" title="safe">safe link<\/a>/)
  assert.doesNotMatch(html, /<script/)
  assert.doesNotMatch(html, /<iframe/)
  assert.doesNotMatch(html, /<style/)
  assert.match(html, /<details open>/)
  assert.match(html, /<summary><strong>Answer<\/strong><\/summary>/)
  assert.match(html, /<div class="figure"><span id="safe-note">Allowed teaching note<\/span><\/div>/)
})

test('markdown renderer escapes html payloads inside code blocks', () => {
  const html = renderMarkdownWithMath(`
\`\`\`html
<img src=x onerror=alert(1)>
\`\`\`
`)

  assert.match(html, /<pre><code/)
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/)
  assert.doesNotMatch(html, /<img src=x/i)
})

test('markdown renderer does not parse math delimiters inside code blocks', () => {
  const html = renderMarkdownWithMath(`
\`\`\`python
price = "$5"
print("not math: $x$")
\`\`\`

Actual math: $x^2$
`)

  assert.match(html, /not math: \$x\$/)
  assert.match(html, /katex/)
})

test('markdown renderer normalizes double-escaped math delimiters', () => {
  const html = renderMarkdownWithMath(String.raw`
Inline double escaped \\(x^2\\), normal inline \(y = mx+b\), and a block:

\\[
A = U\Sigma V^T
\\]
`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\{1,2}[\[\]\(\)]/)
})

test('markdown renderer supports legacy single-dollar display blocks', () => {
  const html = renderMarkdownWithMath(`
Legacy block:

$
\\begin{align}
f(x) &= f(a) + f'(a)(x-a)
\\end{align}
$
`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\$\s*<br|\\begin/)
})

test('diagnostic scoring recommends the earliest weak math foundation module', () => {
  const allCorrect = Object.fromEntries(
    diagnosticQuestions.map((question) => [question.id, question.answer]),
  )
  const strong = scoreDiagnostic(allCorrect)
  assert.equal(strong.recommendedStartModuleId, 'taylor-series')
  assert.equal(strong.weakConcepts.length, 0)

  const weakLinearAlgebra = scoreDiagnostic({ ...allCorrect, 'diag-dot': 'elementwise' })
  assert.equal(weakLinearAlgebra.recommendedStartModuleId, 'vectors-matrices-norms')
  assert.ok(weakLinearAlgebra.weakConcepts.includes('dot-product'))

  const weakProbability = scoreDiagnostic({ ...allCorrect, 'diag-entropy': 'coordinates' })
  assert.equal(weakProbability.recommendedStartModuleId, 'monte-carlo')
})

test('quiz scoring returns misconception feedback for incorrect answers', () => {
  const quiz = {
    id: 'sample-checkpoint',
    type: 'single-choice' as const,
    prompt: { 'zh-CN': '哪个方向是下降方向？', en: 'Which direction descends?' },
    choices: [
      { id: 'correct', label: { 'zh-CN': '负梯度', en: 'Negative gradient' } },
      { id: 'distractor', label: { 'zh-CN': '正梯度', en: 'Positive gradient' } },
    ],
    answer: 'correct',
    explanation: { 'zh-CN': '最小化沿负梯度移动。', en: 'Minimization moves along the negative gradient.' },
    misconceptionTags: ['gradient-direction'],
  }

  assert.equal(evaluateQuizAnswer(quiz, quiz.answer as string).correct, true)
  const incorrect = evaluateQuizAnswer(quiz, 'distractor')
  assert.equal(incorrect.correct, false)
  assert.deepEqual(incorrect.misconceptionTags, quiz.misconceptionTags)

  const summary = scoreQuiz([quiz], {
    [quiz.id]: quiz.answer as string,
  })
  assert.equal(summary.correct, 1)
  assert.equal(summary.total, 1)
})

test('math lab progress persists diagnostic, completion, and quiz attempts in storage', () => {
  const storage = createMemoryStorage()
  const diagnostic = scoreDiagnostic(
    Object.fromEntries(diagnosticQuestions.map((question) => [question.id, question.answer])),
  )
  const quizAttempt = {
    quizId: 'taylor-series-checkpoint',
    moduleId: 'taylor-series',
    selected: 'correct',
    correct: true,
    misconceptionTags: [],
    attemptedAt: '2026-05-05T00:00:00.000Z',
  }

  let progress = setDiagnosticResult(createDefaultProgress('2026-05-05T00:00:00.000Z'), diagnostic)
  progress = appendQuizAttempt(progress, quizAttempt)
  progress = markModuleComplete(progress, 'taylor-series')
  saveMathLabProgress(progress, storage)

  const reloaded = loadMathLabProgress(storage)
  assert.equal(reloaded.diagnosticResult?.recommendedStartModuleId, 'taylor-series')
  assert.deepEqual(reloaded.completedModuleIds, ['taylor-series'])
  assert.equal(reloaded.quizAttempts.length, 1)
})
