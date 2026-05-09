import test from 'node:test'
import assert from 'node:assert/strict'
import { mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import { evaluateSvdLowRank } from '../src/modules/math-lab/utils/svd.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

test('svd module preserves lecture coverage with bilingual repair and inline low-rank lab', () => {
  const svdModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'svd')
  assert.ok(svdModule)

  assert.equal(svdModule.title['zh-CN'], '奇异值分解（SVD）')
  assert.equal(svdModule.title.en, 'Singular Value Decomposition (SVD)')
  assert.ok(svdModule.learningObjectives.length >= 5)
  assert.ok(svdModule.concepts.length >= 4)
  assert.ok(svdModule.quizzes.length >= 4)
  assert.ok(svdModule.misconceptions.length >= 3)
  assert.ok(svdModule.labs.some((lab) => lab.id === 'svd-low-rank-lab'))
  assert.ok(svdModule.labs.some((lab) => lab.componentName === 'NumericalMiniLab'))
  assert.ok(svdModule.sections.some((section) => section.labIds?.includes('svd-low-rank-lab')))

  const sectionIds = svdModule.sections.map((section) => section.id)
  assert.deepEqual(sectionIds, [
    'svd-learning-objectives',
    'svd-from-eigenvectors-to-two-bases',
    'svd-where-the-pieces-come-from',
    'svd-full-reduced-and-cost',
    'svd-computing-the-lecture-example',
    'svd-rank-range-nullspace-pseudoinverse',
    'svd-norm-condition-and-solving',
    'svd-low-rank-approximation-and-ml',
    'svd-review-questions',
  ])

  const zhBody = svdModule.sections.map((section) => `${section.title['zh-CN']}\n${section.content['zh-CN']}`).join('\n')
  const enBody = svdModule.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')

  assert.match(zhBody, /从特征向量到两个正交基/)
  assert.match(zhBody, /任意实矩阵/)
  assert.match(zhBody, /A\^TA/)
  assert.match(zhBody, /Reduced SVD|reduced SVD/)
  assert.match(zhBody, /20\.916/)
  assert.match(zhBody, /U_R=AV_R\\Sigma_R\^{-1}/)
  assert.match(zhBody, /Moore-Penrose pseudoinverse/)
  assert.match(zhBody, /\\kappa_2\(A\)/)
  assert.match(zhBody, /\\|A-A_k\\|_2=\\sigma_\{k\+1\}/)
  assert.match(zhBody, /推荐系统/)
  assert.match(zhBody, /\/math-lab\/cs357-assets\/figs\/reduced_svd\.svg/)
  assert.match(zhBody, /\/math-lab\/cs357-assets\/figs\/lowrank\.png/)
  assert.match(enBody, /From Eigenvectors to Two Orthogonal Bases/)
  assert.match(enBody, /Where Singular Values and Singular Vectors Come From/)
  assert.match(enBody, /Moore-Penrose pseudoinverse/)
  assert.match(enBody, /recommender systems/)
  assert.match(enBody, /once the SVD is available/i)
  assert.doesNotMatch(`${zhBody}\n${enBody}`, /GPT-5\.5|GPT 精讲|原讲义|Cleaned Source|Course Staff|changelog|site\.baseurl/)
  assert.doesNotMatch(zhBody, /An m \\times n real matrix|The time-complexity|The following figure depicts|The figure below show/)
  assert.doesNotMatch(enBody, /学习目标|复习问题|奇异值分解|低秩近似/)
})

test('svd module markdown renders formulas without raw delimiters', () => {
  const svdModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === 'svd')
  assert.ok(svdModule)

  const sectionSource = svdModule.sections
    .map((section) => `${section.title['zh-CN']}\n\n${section.content['zh-CN']}`)
    .join('\n\n')
  const objectiveSource = svdModule.learningObjectives.map((objective) => objective['zh-CN']).join('\n\n')
  const conceptSource = svdModule.concepts
    .map((concept) => `${concept.plainExplanation['zh-CN']}\n\n${concept.geometricIntuition['zh-CN']}\n\n${concept.numericalExample['zh-CN']}`)
    .join('\n\n')
  const quizSource = svdModule.quizzes
    .map((quiz) => `${quiz.prompt['zh-CN']}\n\n${quiz.explanation['zh-CN']}`)
    .join('\n\n')
  const misconceptionSource = svdModule.misconceptions
    .map((misconception) => `${misconception.correction['zh-CN']}\n\n${misconception.example['zh-CN']}`)
    .join('\n\n')
  const html = renderMarkdownWithMath(`${objectiveSource}\n\n${conceptSource}\n\n${sectionSource}\n\n${quizSource}\n\n${misconceptionSource}`)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\\\(|\\\)|\\\[|\\\]|\$\$/)
})

test('svd low-rank utility exposes retained energy, approximation error, and conditioning trends', () => {
  const rankOne = evaluateSvdLowRank({
    spectrumKind: 'lecture',
    keptRank: 1,
    tolerance: 1e-2,
  })
  const rankTwo = evaluateSvdLowRank({
    spectrumKind: 'lecture',
    keptRank: 2,
    tolerance: 1e-2,
  })
  const full = evaluateSvdLowRank({
    spectrumKind: 'lecture',
    keptRank: 4,
    tolerance: 1e-2,
  })
  const illConditioned = evaluateSvdLowRank({
    spectrumKind: 'ill-conditioned',
    keptRank: 2,
    tolerance: 1e-4,
  })

  assert.equal(rankOne.effectiveRank, 3)
  assert.ok(rankTwo.retainedEnergy > rankOne.retainedEnergy)
  assert.equal(Number(rankOne.spectralError.toFixed(5)), 6.53207)
  assert.equal(Number(rankTwo.spectralError.toFixed(5)), 4.22807)
  assert.equal(full.spectralError, 0)
  assert.equal(full.frobeniusError, 0)
  assert.ok(illConditioned.conditionNumber > rankOne.conditionNumber)
  assert.ok(rankTwo.compressedStorage < rankTwo.originalStorage)
  assert.deepEqual(full.residualMatrix.flat().map((value) => Number(value.toFixed(12))), Array(16).fill(0))
})
