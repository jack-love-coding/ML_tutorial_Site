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
      assert.match(englishBody, /From Polynomials to Local Models|Constructing the Taylor Polynomial/)
    } else if (moduleDefinition.id === 'monte-carlo') {
      assert.match(englishBody, /Where Reproducible Randomness Comes From|Writing Areas and Integrals as Sample Averages/)
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
  assert.ok(byId['lu-decomposition']!.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
  assert.ok(byId['eigenvalues-eigenvectors']!.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
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

  const zhBody = taylor.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = taylor.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /从多项式到局部模型/)
  assert.match(zhBody, /Lagrange 余项/)
  assert.match(zhBody, /梯度下降/)
  assert.match(enBody, /From Polynomials to Local Models/)
  assert.match(enBody, /Lagrange/)
  assert.match(enBody, /Gradient descent/)
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

  assert.match(zhBody, /可复现的随机数/)
  assert.match(zhBody, /线性同余生成器/)
  assert.match(zhBody, /\/math-lab\/generated\/monte-carlo-sampling-illustration\.png/)
  assert.match(zhBody, /典型误差规模|误差为什么通常按/)
  assert.match(zhBody, /小批量梯度下降/)
  assert.match(enBody, /Reproducible Randomness/)
  assert.match(enBody, /linear congruential generator/)
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
