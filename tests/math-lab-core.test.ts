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
      'Random Number Generators and Monte Carlo Method',
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
    assert.match(englishBody, /Learning Objectives|Learning objectives|Dense Matrices/)
    if (moduleDefinition.id !== 'pca') {
      assert.match(englishBody, /Review Questions/)
    }
    assert.doesNotMatch(englishBody, /CS\s*357|Course Staff|changelog|site\.baseurl/)
  }
})

test('key math foundation topics are connected to interactive or video enhancements', () => {
  const byId = Object.fromEntries(mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))

  assert.ok(byId['taylor-series']!.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
  assert.ok(byId['monte-carlo']!.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
  assert.ok(byId['vectors-matrices-norms']!.labs.some((lab) => lab.componentName === 'VectorDotProductLab'))
  assert.ok(byId['vectors-matrices-norms']!.labs.some((lab) => lab.componentName === 'MatrixTransformLab'))
  assert.ok(byId['lu-decomposition']!.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
  assert.ok(byId['eigenvalues-eigenvectors']!.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
  assert.ok(byId.optimization!.labs.some((lab) => lab.componentName === 'MathGradientLab'))
  assert.ok(byId.svd!.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
  assert.ok(byId.pca!.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
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
