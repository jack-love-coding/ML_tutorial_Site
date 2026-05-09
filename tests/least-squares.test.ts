import test from 'node:test'
import assert from 'node:assert/strict'
import { mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import { evaluateLeastSquaresLine } from '../src/modules/math-lab/utils/leastSquares.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

test('least squares module preserves source coverage with bilingual repair and inline residual lab', () => {
  const moduleDefinition = mathLabModules.find((candidate) => candidate.id === 'least-squares-fitting')
  assert.ok(moduleDefinition)

  assert.equal(moduleDefinition.title['zh-CN'], '最小二乘拟合')
  assert.equal(moduleDefinition.title.en, 'Least Squares Fitting')
  assert.ok(moduleDefinition.learningObjectives.length >= 6)
  assert.ok(moduleDefinition.concepts.length >= 3)
  assert.ok(moduleDefinition.quizzes.length >= 3)
  assert.ok(moduleDefinition.misconceptions.length >= 3)
  assert.ok(moduleDefinition.labs.some((lab) => lab.id === 'least-squares-residual-lab'))
  assert.ok(moduleDefinition.sections.some((section) => section.labIds?.includes('least-squares-residual-lab')))

  const sectionIds = moduleDefinition.sections.map((section) => section.id)
  assert.deepEqual(sectionIds, [
    'least-squares-fitting-learning-objectives',
    'least-squares-fitting-data-to-system',
    'least-squares-fitting-residual-objective',
    'least-squares-fitting-normal-equations-projection',
    'least-squares-fitting-vs-interpolation',
    'least-squares-fitting-computational-methods',
    'least-squares-fitting-svd-solution',
    'least-squares-fitting-linear-vs-nonlinear',
    'least-squares-fitting-review-questions',
  ])

  const zhBody = moduleDefinition.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = moduleDefinition.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /超定系统/)
  assert.match(zhBody, /残差平方和/)
  assert.match(zhBody, /正规方程/)
  assert.match(zhBody, /投影/)
  assert.match(zhBody, /拟合不是插值/)
  assert.match(zhBody, /\\operatorname\{cond\}\(A\^TA\)=/)
  assert.match(zhBody, /SVD/)
  assert.match(zhBody, /伪逆/)
  assert.match(zhBody, /非线性最小二乘/)
  assert.match(zhBody, /交替最小二乘/)
  assert.match(enBody, /Overdetermined System/)
  assert.match(enBody, /Squared Residuals/)
  assert.match(enBody, /Normal Equations/)
  assert.match(enBody, /Computational Methods/)
  assert.match(enBody, /Pseudoinverse/)
  assert.match(enBody, /Linear Versus Nonlinear/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Course Staff|changelog|site\.baseurl/)
  assert.doesNotMatch(zhBody, /Given [<\\(]|It is important to understand|Another way to solve|What value does/)
  assert.doesNotMatch(enBody, /学习目标|复习问题|正规方程|拟合不是插值/)
})

test('least squares module markdown renders formulas without raw delimiters', () => {
  const moduleDefinition = mathLabModules.find((candidate) => candidate.id === 'least-squares-fitting')
  assert.ok(moduleDefinition)

  const sectionSource = moduleDefinition.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const objectiveSource = moduleDefinition.learningObjectives.map((objective) => objective['zh-CN']).join('\n\n')
  const conceptSource = moduleDefinition.concepts
    .map((concept) => `${concept.plainExplanation['zh-CN']}\n\n${concept.geometricIntuition['zh-CN']}\n\n${concept.numericalExample['zh-CN']}`)
    .join('\n\n')
  const quizSource = moduleDefinition.quizzes
    .map((quiz) => `${quiz.prompt['zh-CN']}\n\n${quiz.explanation['zh-CN']}`)
    .join('\n\n')
  const misconceptionSource = moduleDefinition.misconceptions
    .map((misconception) => `${misconception.correction['zh-CN']}\n\n${misconception.example['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(`${objectiveSource}\n\n${conceptSource}\n\n${sectionSource}\n\n${quizSource}\n\n${misconceptionSource}`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('least squares utility exposes optimum and residual orthogonality trends', () => {
  const evaluation = evaluateLeastSquaresLine({
    slope: 0.7,
    intercept: 1.1,
    outlierLift: 0,
  })
  const atOptimum = evaluateLeastSquaresLine({
    slope: evaluation.optimal.slope,
    intercept: evaluation.optimal.intercept,
    outlierLift: 0,
  })
  const poorFit = evaluateLeastSquaresLine({
    slope: evaluation.optimal.slope + 0.55,
    intercept: evaluation.optimal.intercept - 0.4,
    outlierLift: 0,
  })
  const outlierFit = evaluateLeastSquaresLine({
    slope: evaluation.optimal.slope,
    intercept: evaluation.optimal.intercept,
    outlierLift: 1.2,
  })

  assert.ok(atOptimum.current.sse <= poorFit.current.sse)
  assert.ok(atOptimum.current.normalResidualNorm < 1e-10)
  assert.ok(poorFit.current.normalResidualNorm > atOptimum.current.normalResidualNorm)
  assert.ok(outlierFit.optimal.slope > evaluation.optimal.slope)
  assert.ok(evaluation.conditionEstimate > 1)
})
