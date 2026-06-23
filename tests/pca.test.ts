import test from 'node:test'
import assert from 'node:assert/strict'
import { mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import { evaluatePcaProjection } from '../src/modules/math-lab/utils/pca.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

test('pca module preserves source coverage with bilingual repair and inline projection lab', () => {
  const moduleDefinition = mathLabModules.find((candidate) => candidate.id === 'pca')
  assert.ok(moduleDefinition)

  assert.equal(moduleDefinition.title['zh-CN'], '主成分分析（PCA）')
  assert.equal(moduleDefinition.title.en, 'Principal Component Analysis (PCA)')
  assert.ok(moduleDefinition.learningObjectives.length >= 6)
  assert.ok(moduleDefinition.concepts.length >= 3)
  assert.ok(moduleDefinition.quizzes.length >= 3)
  assert.ok(moduleDefinition.misconceptions.length >= 3)
  assert.ok(moduleDefinition.labs.some((lab) => lab.id === 'pca-projection-lab'))
  assert.ok(moduleDefinition.labs.some((lab) => lab.componentName === 'PcaProjectionLab'))
  assert.ok(moduleDefinition.sections.some((section) => section.labIds?.includes('pca-projection-lab')))

  assert.deepEqual(moduleDefinition.sections.map((section) => section.id), [
    'pca-learning-objectives',
    'pca-what-problem-it-solves',
    'pca-centering-and-covariance',
    'pca-diagonalization-and-projection',
    'pca-svd-route-and-explained-variance',
    'pca-algorithm-and-terminology',
    'pca-ml-connections-and-failure-modes',
    'pca-review-questions',
  ])

  const zhBody = moduleDefinition.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = moduleDefinition.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /中心化/)
  assert.match(zhBody, /协方差矩阵/)
  assert.match(zhBody, /总方差/)
  assert.match(zhBody, /主方向/)
  assert.match(zhBody, /Z=XV_k/)
  assert.match(zhBody, /SVD/)
  assert.match(zhBody, /解释方差/)
  assert.match(zhBody, /特征缩放/)
  assert.match(zhBody, /embedding 可视化/)
  assert.match(zhBody, /离群点/)
  assert.match(zhBody, /批次/)
  assert.match(moduleDefinition.misconceptions.map((item) => item.statement['zh-CN']).join('\n'), /PCA 会自动找到最能分类的方向/)
  assert.match(enBody, /Centering and the Covariance Matrix/)
  assert.match(enBody, /Covariance Diagonalization/)
  assert.match(enBody, /The SVD Route/)
  assert.match(enBody, /Explained Variance/)
  assert.match(enBody, /Failure Modes/)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Course Staff|changelog|site\.baseurl/)
  assert.doesNotMatch(zhBody, /without loss of important|In simpler words|Consider a large dataset|Another approach is/)
  assert.doesNotMatch(enBody, /学习目标|复习问题|中心化|协方差矩阵/)
})

test('pca module markdown renders formulas without raw delimiters', () => {
  const moduleDefinition = mathLabModules.find((candidate) => candidate.id === 'pca')
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

test('pca utility exposes centering, shift invariance, and reconstruction trends', () => {
  const oneComponent = evaluatePcaProjection({
    datasetKind: 'lecture',
    keptComponents: 1,
    meanShift: 0,
  })
  const twoComponents = evaluatePcaProjection({
    datasetKind: 'lecture',
    keptComponents: 2,
    meanShift: 0,
  })
  const shifted = evaluatePcaProjection({
    datasetKind: 'lecture',
    keptComponents: 1,
    meanShift: 3,
  })
  const balanced = evaluatePcaProjection({
    datasetKind: 'orthogonal',
    keptComponents: 1,
    meanShift: 0,
  })

  const centeredMean = oneComponent.centeredPoints.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 },
  )
  assert.ok(Math.abs(centeredMean.x) < 1e-12)
  assert.ok(Math.abs(centeredMean.y) < 1e-12)

  assert.ok(oneComponent.eigenvalues[0] >= oneComponent.eigenvalues[1])
  assert.ok(oneComponent.retainedVariance > balanced.retainedVariance)
  assert.ok(twoComponents.retainedVariance > oneComponent.retainedVariance)
  assert.ok(twoComponents.reconstructionRmse < 1e-12)
  assert.ok(oneComponent.reconstructionRmse > twoComponents.reconstructionRmse)
  assert.deepEqual(
    shifted.covariance.map((row) => row.map((value) => Number(value.toFixed(10)))),
    oneComponent.covariance.map((row) => row.map((value) => Number(value.toFixed(10)))),
  )
})
