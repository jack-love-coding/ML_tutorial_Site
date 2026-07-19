import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createServer } from 'vite'
import { mathToCodeModules } from '../src/modules/math-lab/data/mathToCode/modules.ts'
import { DEFAULT_PARAMETERS, MATH_TO_CODE_SAMPLES } from '../src/modules/math-lab/data/mathToCode/sharedTask.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'
import {
  learningRouteById,
  mathToCodePilotModuleIds,
  routeNavigationForModule,
} from '../src/modules/math-lab/data/learningRoutes.ts'
import {
  centralDifference,
  evaluatePredictionTask,
  meanSquaredError,
  predictBatch,
  predictOne,
} from '../src/modules/math-lab/utils/mathToCode.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'
import { withPublicBase } from '../src/utils/publicPath.ts'

const root = new URL('../', import.meta.url)
const moduleIds = [...mathToCodePilotModuleIds]
type PilotModule = (typeof mathToCodeModules)[number]

interface TeachingContract {
  concepts: Array<{
    id: string
    formula: string
    codeIncludes?: string[]
    examplePatterns: RegExp[]
  }>
  sections: Array<{
    id: string
    patterns: RegExp[]
  }>
}

const teachingContracts: Record<string, TeachingContract> = {
  'calculus-functions-rate-change': {
    concepts: [
      {
        id: 'function-prediction-mapping',
        formula: '\\hat y=w_1x_1+w_2x_2+b',
        codeIncludes: ['features = [2, 3]', 'weights = [4, -1]', 'prediction = weights[0] * features[0] + weights[1] * features[1] + bias', '# 10'],
        examplePatterns: [/prediction\s*=\s*10/],
      },
      {
        id: 'prediction-residual-error',
        formula: 'r=\\hat y-y,\\qquad \\operatorname{MSE}=\\frac{1}{n}\\sum_{i=1}^{n}(\\hat y_i-y_i)^2',
        examplePatterns: [/prediction\s*=\s*10/, /target\s*=\s*9/, /residual\s*=\s*1/, /MSE\s*=\s*1/],
      },
    ],
    sections: [
      { id: 'shared-prediction-task', patterns: [/\\hat y=w_1x_1\+w_2x_2\+b=8\+\(-3\)\+5=10/, /prediction\s*=\s*10/, /target\s*=\s*9/] },
      { id: 'worked-prediction', patterns: [/8\+\(-3\)\+5=10/, /r=\\hat y-y=10-9=1/] },
      { id: 'python-translation', patterns: [/prediction = weighted_sum \+ bias\s*(?:#|#\s*)10/, /residual = prediction - target\s*(?:#|#\s*)1/] },
    ],
  },
  'linear-algebra-feature-space': {
    concepts: [
      {
        id: 'unit-bearing-linear-functional',
        formula: '\\hat y=w^\\mathsf T x+b',
        codeIncludes: ['x = np.array([2.0, 3.0])', 'w = np.array([4.0, -1.0])', 'prediction = w @ x + 5.0', '# [8. -3.] 10.0'],
        examplePatterns: [/4×2\+\(-1\)×3=5/, /prediction\s+10/],
      },
      {
        id: 'dimensionless-projection',
        formula: '\\operatorname{proj}_v(u)=\\frac{u^\\mathsf T v}{v^\\mathsf T v}v',
        examplePatterns: [/u=\[3,4\]/, /v=\[4,0\]/, /\[3,0\]/],
      },
    ],
    sections: [
      { id: 'vectors-shared-task', patterns: [/x = \[2, 3\]/, /w = \[4, -1\]/, /y_hat = 10/, /y = 9/, /L = 1/, /y_hat = w\^T x \+ b/] },
      { id: 'vectors-worked-shared', patterns: [/w\^T x = 4\*2 \+ \(-1\)\*3 = 5/, /y_hat = 5 \+ 5 = 10/, /L = \(10 - 9\)\^2 = 1/] },
      { id: 'vectors-code', patterns: [/weighted_sum = w @ x/, /y_hat = weighted_sum \+ b/, /L = \(y_hat - y\) \*\* 2/, /\[\s*8\.?\s*,?\s*-3\.?\]/, /5\.0/, /10\.0/, /1\.0/] },
    ],
  },
  'linear-algebra-matrix-transformations': {
    concepts: [
      {
        id: 'batch-affine-map',
        formula: '\\hat y=Xw+b',
        codeIncludes: ['X = np.array([[2., 3.], [1., 4.]])', 'predictions = X @ w + 5.0', 'predictions.shape == (2,)', '# [10.  5.]'],
        examplePatterns: [/\(2,2\) @ \(2,\) -> \(2,\)/, /\[10,5\]/],
      },
      {
        id: 'batch-mse',
        formula: 'L=\\frac1n\\sum_i(\\hat y_i-y_i)^2',
        examplePatterns: [/\[1,-2\]/, /\[1,4\]/, /MSE=2\.5/],
      },
    ],
    sections: [
      { id: 'matrices-shared-task', patterns: [/X(?::| =).*\(2,\s?2\)/s, /w(?::| =).*\(2,\)/s, /y_hat = Xw ?\+ ?b/, /(?:MSE|L =?)\s*2\.5/] },
      { id: 'matrices-worked-shared', patterns: [/(?:\[5,0\]|\\begin\{bmatrix\}5\\\\0\\end\{bmatrix\})/, /\[10,\s?5\]/, /\[1,-2\]/, /\[1,4\]/, /2\.5/] },
      { id: 'matrices-code', patterns: [/weighted\s*=\s*X\s*@\s*w/, /y_hat\s*=\s*weighted\s*\+\s*b/, /residuals\s*=\s*y_hat\s*-\s*y/, /L\s*=\s*(?:np\.)?mean\(residuals\s*\*\*\s*2\)/, /2\.5/] },
    ],
  },
  'calculus-derivatives-local-change': {
    concepts: [
      {
        id: 'central-difference-sensitivity',
        formula: '\\frac{L(\\theta+h)-L(\\theta-h)}{2h}',
        codeIncludes: ['plus, minus = fn(value + h), fn(value - h)', 'result = (plus - minus) / (2 * h)', 'h <= 0', 'isfinite'],
        examplePatterns: [/\[0,-5,-1\]/],
      },
      {
        id: 'motion-local-slope',
        formula: "s'(t)=2t",
        examplePatterns: [/s\(t\)=t\^2/, /t=3/, /0\.1/, /6 meters\/second/],
      },
    ],
    sections: [
      { id: 'derivatives-worked-shared', patterns: [/L\s*=\s*2\.5/, /dL\/dw_?1\s*=\s*1\*2\s*\+\s*\(-2\)\*1\s*=\s*0/, /dL\/dw_?2\s*=\s*1\*3\s*\+\s*\(-2\)\*4\s*=\s*-5/, /dL\/db\s*=\s*1\s*\+\s*\(-2\)\s*=\s*-1/] },
      { id: 'derivatives-code', patterns: [/return \(fn\(theta \+ h\) - fn\(theta - h\)\) \/ \(2 \* h\)/, /candidate_w = w\.copy\(\)/, /gradient_w.*\[0\.0, -5\.0\]/s, /gradient_b.*-1\.0/s] },
    ],
  },
  'numpy-mathematics-implementation': {
    concepts: [
      {
        id: 'checked-numpy-batch',
        formula: '\\hat y=Xw+b',
        codeIncludes: ['np.asarray([[2., 3.], [1., 4.]], dtype=float)', 'predictions = X @ w + 5.0', 'MSE = np.mean((predictions - targets) ** 2)', '# [10.0, 5.0]', '# 2.5', 'np.isfinite'],
        examplePatterns: [/predictions = \[10\.0, 5\.0\]/, /MSE = 2\.5/],
      },
      {
        id: 'numpy-broadcast-contract',
        formula: '(n,)+(n,)\\to(n,)',
        examplePatterns: [/2D prediction column/, /1D target/, /pairwise matrix/],
      },
    ],
    sections: [
      { id: 'numpy-worked-shared', patterns: [/predictions = (?:weighted_sums \+ b|X @ w \+ b)/, /predictions = \[10\.0, 5\.0\]/, /\[1(?:\.0)?,\s*-2(?:\.0)?\]/, /\[1(?:\.0)?,\s*4(?:\.0)?\]/, /(?:MSE =|mse ==|MSE)\s*2\.5/, /\[0(?:\.0)?,\s*-5(?:\.0)?/, /-1(?:\.0)?/] },
      { id: 'numpy-code', patterns: [/np\.asarray\([^\n]+dtype=float\)\.copy\(\)/, /X\.shape\[1\] != w\.shape\[0\]/, /np\.isfinite/, /predictions\.shape != targets\.shape/, /candidate_w = normalized_w\.copy\(\)/, /return predictions, L, gradient_w, gradient_b/, /\[10\., 5\.\]/, /\[0\., -5\.\]/] },
    ],
  },
  'math-to-code-guided-studio': {
    concepts: [
      {
        id: 'studio-forward-error-chain',
        formula: '\\hat y=Xw+b,\\quad L=\\frac1n\\sum_i(\\hat y_i-y_i)^2',
        examplePatterns: [/predictions=\[10,5\]/, /residuals=\[1,-2\]/, /squares=\[1,4\]/, /MSE=2\.5/],
      },
      {
        id: 'studio-local-sensitivity',
        formula: '\\frac{L(\\theta+h)-L(\\theta-h)}{2h}',
        examplePatterns: [/w=\[0,-5\]/, /b=-1/],
      },
    ],
    sections: [
      { id: 'studio-reproduce-task', patterns: [/X = \[\[2\.0, 3\.0\], \[1\.0, 4\.0\]\]/, /w = \[4\.0, -1\.0\]/, /b = 5\.0/, /targets = \[9\.0, 7\.0\]/, /np\.isfinite/] },
      { id: 'studio-vector-prediction', patterns: [/weighted_sum = float\(contributions\.sum\(\)\)/, /weighted_sum_at = float\(x @ w\)/, /prediction = weighted_sum \+ b/, /\[8\.0,\s*-3\.0\]/, /10\.0/] },
      { id: 'studio-batch-prediction', patterns: [/weighted_batch = X @ w/, /predictions = weighted_batch \+ b/, /weighted_batch = \[5\.0, 0\.0\]/, /predictions = \[10\.0, 5\.0\]/] },
      { id: 'studio-error-comparison', patterns: [/residuals = predictions - targets/, /squared_errors = residuals \*\* 2/, /MSE = float\(np\.mean\(squared_errors\)\)/, /residuals = \[1\.0, -2\.0\]/, /MSE = 2\.5/] },
      { id: 'studio-numerical-sensitivity', patterns: [/candidate_predictions = X @ candidate_w \+ candidate_b/, /denominator = 2 \* h/, /candidate_w = w\.copy\(\)/, /gradient_b = central_difference_safe/, /\[0\.0, -5\.0\] -1\.0/] },
    ],
  },
}

function teachingContractIssues(module: PilotModule): string[] {
  const contract = teachingContracts[module.id]
  if (!contract) return [`${module.id}: missing teaching contract`]
  const issues: string[] = []
  for (const expected of contract.concepts) {
    const concept = module.concepts.find(({ id }) => id === expected.id)
    if (!concept) {
      issues.push(`${module.id}: missing concept ${expected.id}`)
      continue
    }
    if (concept.formulaLatex !== expected.formula) issues.push(`${module.id}/${expected.id}: formula drift`)
    for (const token of expected.codeIncludes ?? []) {
      if (!(concept.codeExample ?? '').includes(token)) issues.push(`${module.id}/${expected.id}: code missing ${token}`)
    }
    const example = `${concept.numericalExample['zh-CN']}\n${concept.numericalExample.en}`
    for (const pattern of expected.examplePatterns) {
      if (!pattern.test(example)) issues.push(`${module.id}/${expected.id}: example missing ${pattern}`)
    }
  }
  for (const expected of contract.sections) {
    const section = module.sections.find(({ id }) => id === expected.id)
    if (!section) {
      issues.push(`${module.id}: missing section ${expected.id}`)
      continue
    }
    for (const locale of ['zh-CN', 'en'] as const) {
      for (const pattern of expected.patterns) {
        if (!pattern.test(section.content[locale])) issues.push(`${module.id}/${expected.id}/${locale}: missing ${pattern}`)
      }
    }
  }
  return issues
}

function assertGloballyUnique(
  category: string,
  entries: Array<{ moduleId: string, id: string }>,
) {
  const owners = new Map<string, string>()
  for (const entry of entries) {
    const previousOwner = owners.get(entry.id)
    assert.equal(previousOwner, undefined, `${category} id ${entry.id} is shared by ${previousOwner} and ${entry.moduleId}`)
    owners.set(entry.id, entry.moduleId)
  }
}

function combinedModuleText(module: (typeof mathToCodeModules)[number]) {
  return [
    ...module.sections.flatMap((section) => [section.content['zh-CN'], section.content.en]),
    ...module.concepts.flatMap((concept) => [concept.formulaLatex, concept.codeExample ?? '']),
  ].join('\n')
}

function markdownFragmentIssues(content: string, sectionIds: ReadonlySet<string>): string[] {
  const issues: string[] = []
  for (const match of content.matchAll(/\]\(#([^)]*)\)/g)) {
    const fragment = match[1]!
    if (fragment.length === 0) {
      issues.push('empty fragment')
    } else if (!/^[a-z0-9-]+$/.test(fragment)) {
      issues.push(`unsafe fragment ${fragment}`)
    } else if (!sectionIds.has(fragment)) {
      issues.push(`unknown section ${fragment}`)
    }
  }
  return issues
}

test('the pilot consumes exactly six registered modules with globally unique teaching IDs', () => {
  assert.equal(mathToCodeModules.length, 6)
  assert.deepEqual(mathToCodeModules.map(({ id }) => id), moduleIds)
  assert.deepEqual(learningRouteById['math-to-code-pilot'].chapterModuleIds, moduleIds)

  for (const module of mathToCodeModules) {
    const registered = mathLabModuleRegistry[module.id]
    assert.ok(registered, `${module.id} is not registered`)
    if (module.id === 'calculus-functions-rate-change' || module.id === 'calculus-derivatives-local-change') {
      const omittedPracticeId = module.id === 'calculus-functions-rate-change' ? 'layered-practice' : 'derivatives-practice'
      assert.equal(registered.sections.some(({ id }) => id === omittedPracticeId), false)
      for (const sourceSection of module.sections.filter(({ id }) => id !== omittedPracticeId)) {
        const runtimeSection = registered.sections.find(({ id }) => id === sourceSection.id)
        assert.ok(runtimeSection, `${module.id} must preserve ${sourceSection.id}`)
        assert.equal(runtimeSection.content, sourceSection.content)
      }
      assert.deepEqual(registered.concepts.map(({ id }) => id), module.concepts.map(({ id }) => id))
      assert.ok(registered.concepts.some((concept) => concept.codeOutput), `${module.id} needs reference output`)
    } else {
      assert.equal(registered.sections, module.sections, `${module.id} does not expose the promoted section record`)
      assert.equal(registered.concepts, module.concepts, `${module.id} does not expose the promoted concept record`)
    }
    assert.equal(registered.labs, module.labs, `${module.id} does not expose the promoted lab record`)
    assert.equal(registered.quizzes, module.quizzes, `${module.id} does not expose the promoted quiz record`)
    assert.equal(registered.misconceptions, module.misconceptions, `${module.id} does not expose the promoted misconception record`)
  }

  for (const [category, select] of [
    ['section', (module: (typeof mathToCodeModules)[number]) => module.sections],
    ['concept', (module: (typeof mathToCodeModules)[number]) => module.concepts],
    ['lab', (module: (typeof mathToCodeModules)[number]) => module.labs],
    ['visual', (module: (typeof mathToCodeModules)[number]) => module.visuals],
    ['quiz', (module: (typeof mathToCodeModules)[number]) => module.quizzes],
    ['misconception', (module: (typeof mathToCodeModules)[number]) => module.misconceptions],
  ] as const) {
    assertGloballyUnique(category, mathToCodeModules.flatMap((module) => (
      select(module).map(({ id }) => ({ moduleId: module.id, id }))
    )))
  }

  const allDomIds = mathToCodeModules.flatMap((module) => [
    ...module.sections.map(({ id }) => ({ moduleId: module.id, category: 'section', id })),
    ...module.labs.map(({ id }) => ({ moduleId: module.id, category: 'lab', id })),
    ...module.visuals.map(({ id }) => ({ moduleId: module.id, category: 'visual', id })),
  ])
  const globalOwners = new Map<string, string>()
  for (const entry of allDomIds) {
    const owner = `${entry.moduleId}/${entry.category}`
    assert.equal(globalOwners.get(entry.id), undefined, `DOM id ${entry.id} collides between ${globalOwners.get(entry.id)} and ${owner}`)
    globalOwners.set(entry.id, owner)
  }
})

test('module-local references and route-level prerequisite/next references all resolve', () => {
  for (const module of mathToCodeModules) {
    const sectionIds = new Set(module.sections.map(({ id }) => id))
    const labIds = new Set(module.labs.map(({ id }) => id))
    const visualIds = new Set(module.visuals.map(({ id }) => id))
    const misconceptionIds = new Set(module.misconceptions.map(({ id }) => id))
    const reviewIds = new Set([...sectionIds, ...labIds, ...visualIds])
    const domIds = [...sectionIds, ...labIds, ...visualIds]
    assert.equal(new Set(domIds).size, domIds.length, `${module.id} has a cross-category DOM id collision`)

    assert.deepEqual(module.toc.map(({ id }) => id), module.sections.map(({ id }) => id))
    for (const section of module.sections) {
      for (const labId of section.labIds ?? []) assert.ok(labIds.has(labId), `${module.id}/${section.id} references unknown lab ${labId}`)
      for (const visualId of section.visualIds ?? []) assert.ok(visualIds.has(visualId), `${module.id}/${section.id} references unknown visual ${visualId}`)
      for (const locale of ['zh-CN', 'en'] as const) {
        assert.deepEqual(markdownFragmentIssues(section.content[locale], sectionIds), [], `${module.id}/${section.id}/${locale}`)
      }
    }
    for (const quiz of module.quizzes) {
      assert.ok(quiz.misconceptionTags.length > 0, `${module.id}/${quiz.id} needs a misconception reference`)
      for (const tag of quiz.misconceptionTags) assert.ok(misconceptionIds.has(tag), `${module.id}/${quiz.id} references unknown misconception ${tag}`)
      assert.ok(quiz.revisitVisualId && reviewIds.has(quiz.revisitVisualId), `${module.id}/${quiz.id} has an invalid review reference`)
    }
    for (const dependency of [...module.prerequisites, ...module.nextModuleIds]) {
      assert.ok(mathLabModuleRegistry[dependency], `${module.id} references unknown module ${dependency}`)
    }
  }
  const sectionIds = new Set(['legal-target'])
  assert.deepEqual(markdownFragmentIssues('[legal](#legal-target)', sectionIds), [])
  assert.deepEqual(markdownFragmentIssues('看这里](#)', sectionIds), ['empty fragment'])
  assert.deepEqual(markdownFragmentIssues('[unsafe](#Bad Target)', sectionIds), ['unsafe fragment Bad Target'])
})

test('each module binds exact concept formulas and code to exact worked sections and outputs', () => {
  assert.deepEqual(Object.keys(teachingContracts), moduleIds)
  for (const module of mathToCodeModules) {
    assert.deepEqual(teachingContractIssues(module), [], module.id)
  }
})

test('exact teaching contracts reject changed worked outputs, MSE, and concept code', () => {
  const matrices = structuredClone(mathToCodeModules.find(({ id }) => id === 'linear-algebra-matrix-transformations')!)
  const matrixWorked = matrices.sections.find(({ id }) => id === 'matrices-worked-shared')!
  matrixWorked.content.en = matrixWorked.content.en.replace('[10,5]', '[99,99]')
  assert.ok(teachingContractIssues(matrices).some((issue) => issue.includes('matrices-worked-shared/en')))

  const numpy = structuredClone(mathToCodeModules.find(({ id }) => id === 'numpy-mathematics-implementation')!)
  const numpyWorked = numpy.sections.find(({ id }) => id === 'numpy-worked-shared')!
  numpyWorked.content.en = numpyWorked.content.en.replace('MSE = 2.5', 'MSE = 9.9')
  assert.ok(teachingContractIssues(numpy).some((issue) => issue.includes('numpy-worked-shared/en')))

  const functions = structuredClone(mathToCodeModules.find(({ id }) => id === 'calculus-functions-rate-change')!)
  const functionConcept = functions.concepts.find(({ id }) => id === 'function-prediction-mapping')!
  functionConcept.codeExample = functionConcept.codeExample!.replace('# 10', '# 99')
  assert.ok(teachingContractIssues(functions).some((issue) => issue.includes('function-prediction-mapping: code')))
})

test('all lessons preserve the shared x, w, b, y_hat, y, L formula-to-code vocabulary', () => {
  const vocabulary = {
    x: /(?:\bx\b|\\mathbf x|features|matrix X|输入矩阵 X)/i,
    w: /(?:\bw\b|\\mathbf w|weights|权重 w)/i,
    b: /(?:\bb\b|bias|偏置 b)/i,
    y_hat: /(?:y_hat|\\hat y|prediction|预测)/i,
    y: /(?:\by\b|targets?|目标 y)/i,
    L: /(?:\bL\b|MSE|loss|损失)/i,
  }

  for (const module of mathToCodeModules) {
    const text = combinedModuleText(module)
    for (const [symbol, pattern] of Object.entries(vocabulary)) {
      assert.match(text, pattern, `${module.id} lost shared vocabulary ${symbol}`)
    }
  }
})

test('Task 1 utilities remain the exact numerical oracle for outputs and derivatives', () => {
  assert.equal(predictOne([2, 3], [4, -1], 5), 10)
  assert.deepEqual(predictBatch([[2, 3], [1, 4]], [4, -1], 5), [10, 5])
  assert.equal(meanSquaredError([10, 5], [9, 7]), 2.5)
  assert.ok(Math.abs(centralDifference((value) => value * value, 3, 1e-4) - 6) < 1e-6)

  const evaluation = evaluatePredictionTask({ samples: MATH_TO_CODE_SAMPLES, parameters: DEFAULT_PARAMETERS })
  assert.deepEqual(evaluation.matrix, [[2, 3], [1, 4]])
  assert.deepEqual(evaluation.targets, [9, 7])
  assert.deepEqual(evaluation.predictions, [10, 5])
  assert.equal(evaluation.mse, 2.5)
  assert.ok(Math.abs(evaluation.parameterDerivatives.weights[0]! - 0) < 1e-8)
  assert.ok(Math.abs(evaluation.parameterDerivatives.weights[1]! + 5) < 1e-8)
  assert.ok(Math.abs(evaluation.parameterDerivatives.bias + 1) < 1e-8)
})

test('bilingual titles and bodies stay paired and render through the safe Markdown path', () => {
  for (const module of mathToCodeModules) {
    assert.ok(module.title['zh-CN'].trim() && module.title.en.trim())
    assert.equal(module.sections.length, module.toc.length)
    for (const [index, section] of module.sections.entries()) {
      const toc = module.toc[index]!
      assert.equal(toc.id, section.id)
      assert.deepEqual(toc.title, section.title)
      for (const locale of ['zh-CN', 'en'] as const) {
        assert.ok(section.title[locale].trim(), `${module.id}/${section.id}/${locale} has no title`)
        assert.ok(section.content[locale].trim(), `${module.id}/${section.id}/${locale} has no body`)
        const html = renderMarkdownWithMath(section.content[locale])
        assert.doesNotMatch(html, /<script|<iframe|<style|javascript:|onerror\s*=|onclick\s*=/i)
        assert.doesNotMatch(html, /katex-error|\$\$|\\\[|\\\]/)
      }
    }
  }

  const hostile = renderMarkdownWithMath('<script>alert(1)</script><img src="/safe.png" onerror="alert(2)"><a href="javascript:alert(3)">bad</a>')
  assert.doesNotMatch(hostile, /<script|onerror|javascript:/i)
})

test('pilot asset records are explicit and any declared public file exists after base normalization', () => {
  const publicFileFor = (path: string) => {
    const withoutBase = path.replace(/^\/ML_tutorial_Site\//, '/').replace(/^\//, '')
    return new URL(`../public/${withoutBase}`, import.meta.url)
  }
  for (const module of mathToCodeModules) {
    assert.equal(module.visuals.length, 0, `${module.id} unexpectedly gained a visual; add explicit asset assertions`)
    assert.equal(module.importedAssetPaths?.length ?? 0, 0, `${module.id} unexpectedly gained an imported asset; add explicit asset assertions`)
    for (const asset of module.visuals) {
      for (const path of [asset.assetPath, asset.posterPath].filter((value): value is string => Boolean(value))) {
        assert.match(path, /^\//, `${module.id}/${asset.id} must use a public-root path`)
        const rebased = withPublicBase(path, '/ML_tutorial_Site/')
        assert.match(rebased, /^\/ML_tutorial_Site\//)
        assert.ok(existsSync(publicFileFor(rebased)), `${module.id}/${asset.id} missing ${path}`)
      }
    }
    for (const path of module.importedAssetPaths ?? []) {
      assert.match(path, /^\//, `${module.id} imported asset must use a public-root path`)
      const rebased = withPublicBase(path, '/ML_tutorial_Site/')
      assert.ok(existsSync(publicFileFor(rebased)), `${module.id} missing ${path}`)
    }
    for (const reference of module.sourceReferences ?? []) {
      assert.match(reference.href, /^https:\/\//, `${module.id} source reference is not deployable`)
    }
  }
  // The pilot intentionally declares no runtime visual assets. The repository's
  // public-path utility behavior and real Math Lab asset existence are covered in math-lab-core.test.ts.
  assert.equal(withPublicBase('#shared-prediction-task', '/ML_tutorial_Site/'), '#shared-prediction-task')
})

test('interactive labs expose bounded controls, reset actions, static fallbacks, and no evidence contract', async () => {
  const functionsSource = readFileSync(new URL('../src/modules/math-lab/labs/PredictionMappingLab.vue', import.meta.url), 'utf8')
  const studioSource = readFileSync(new URL('../src/modules/math-lab/labs/MathToCodeStudioLab.vue', import.meta.url), 'utf8')
  for (const source of [functionsSource, studioSource]) {
    assert.match(source, /<button[^>]*type="button"[^>]*@click="reset"/)
    assert.match(source, /<table[\s>]/)
    assert.match(source, /prefers-reduced-motion/)
    assert.doesNotMatch(source, /evidence-change|ExperimentEvidence|defineEmits|recordLearningProgress|localStorage/i)
  }
  assert.match(functionsSource, /const MIN_W1 = 2/)
  assert.match(functionsSource, /const MAX_W1 = 6/)
  assert.match(functionsSource, /const STEP_W1 = 0\.5/)
  assert.match(functionsSource, /Number\.isFinite/)
  assert.match(studioSource, /const MAX_ABS_INPUT = 1_000_000/)
  assert.match(studioSource, /Number\.isFinite\(candidate\)/)
  assert.match(studioSource, /Math\.abs\(candidate\) > MAX_ABS_INPUT/)

  const server = await createServer({ root: new URL('.', root).pathname, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
  try {
    for (const [path, locale] of [
      ['/src/modules/math-lab/labs/PredictionMappingLab.vue', 'en'],
      ['/src/modules/math-lab/labs/MathToCodeStudioLab.vue', 'zh-CN'],
    ] as const) {
      const component = (await server.ssrLoadModule(path)).default
      const html = await renderToString(createSSRApp({ render: () => h(component, { locale }) }))
      assert.match(html, /<table[\s>]/)
      assert.match(html, /type="(?:range|number)"/)
      assert.match(html, /<button[^>]*type="button"/)
    }
  } finally {
    await server.close()
  }
})

test('route query navigation remains route-scoped without front-end completion controls', () => {
  const studio = mathToCodeModules.at(-1)!
  assert.equal(studio.id, 'math-to-code-guided-studio')
  assert.equal(studio.completionMode, 'self-attested')
  assert.ok(mathToCodeModules.slice(0, -1).every(({ completionMode }) => completionMode === undefined))

  for (const [index, moduleId] of moduleIds.entries()) {
    assert.deepEqual(routeNavigationForModule('math-to-code-pilot', moduleId), {
      routeId: 'math-to-code-pilot',
      displayOrder: index + 1,
      effectivePrerequisiteIds: index === 0 ? [] : [moduleIds[index - 1]],
      entryAssumptions: learningRouteById['math-to-code-pilot'].entryAssumptions,
      previousModuleId: moduleIds[index - 1],
      nextModuleId: moduleIds[index + 1],
    })
  }
  assert.equal(routeNavigationForModule('math-to-code-pilot', 'pca'), undefined)
  assert.equal(routeNavigationForModule('invalid-route', moduleIds[0]!), undefined)

  const page = readFileSync(new URL('../src/modules/math-lab/pages/MathLabModulePage.vue', import.meta.url), 'utf8')
  const completion = readFileSync(new URL('../src/modules/math-lab/components/SelfPacedCompletionButton.vue', import.meta.url), 'utf8')
  assert.match(page, /routeNavigationForModule\(route\.query\.route, moduleId\.value\)/)
  assert.match(page, /query:\s*\{\s*route:\s*routeNavigation\.value\.routeId\s*\}/)
  assert.doesNotMatch(page, /moduleDefinition\.completionMode === 'self-attested'/)
  assert.doesNotMatch(page, /SelfPacedCompletionButton/)
  assert.match(completion, /self-paced local navigation state, not a graded or formal acceptance/i)
})

test('production browser probe checks dashboard route order and exact adjacent hrefs', () => {
  const probe = readFileSync(new URL('../scripts/qa/mathToCodePilotBrowserMatrix.js', import.meta.url), 'utf8')
  assert.match(probe, /\/math-lab['"`]/)
  assert.match(probe, /dashboardOrders/)
  assert.match(probe, /\[1,\s*2,\s*3,\s*4,\s*5,\s*6\]/)
  assert.match(probe, /expectedRouteHrefs/)
  assert.match(probe, /chapterOrderOk/)
  assert.match(probe, /matrixAContract/)
  assert.match(probe, /versionedCompletion/)
  assert.doesNotMatch(probe, /method:\s*['"]HEAD['"]/)
})
