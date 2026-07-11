import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mathToCodeModules } from '../src/modules/math-lab/data/mathToCode/modules.ts'

const byId = Object.fromEntries(mathToCodeModules.map((module) => [module.id, module]))

const sectionContracts = [
  ['linear-algebra-feature-space', 'vectors-worked-auxiliary', ['u = [3, 4]', 'v = [4, 0]', '[3,0]', '0.6'], ['u = [3, 4]', 'v = [4, 0]', '[3,0]', '0.6']],
  ['linear-algebra-matrix-transformations', 'matrices-worked-auxiliary', ['[[1, 0], [0, -1]]', '(u,-v)', '[2, 3] -> [2, -3]'], ['[[1, 0], [0, -1]]', '(u,-v)', '[2, 3] -> [2, -3]']],
  ['calculus-derivatives-local-change', 'derivatives-worked-auxiliary', ['s(t) = t^2', 't=3', 'h = 0.1', '9.61', '8.41', 'slope_at_3 = 6'], ['s(t) = t^2', 't=3', 'h = 0.1', '9.61', '8.41', 'slope_at_3 = 6']],
  ['numpy-mathematics-implementation', 'numpy-worked-auxiliary', ['sensor_grid', '(2, 3)', 'column_bias', 'wrong_column_bias', '(3, 3)', '[[11. 22. 33.]'], ['sensor_grid', '(2, 3)', 'column_bias', 'wrong_column_bias', '(3, 3)', '[[11. 22. 33.]']],
] as const

test('both worked examples preserve the approved variables, numbers, and formulas in both locales', () => {
  for (const [moduleId, sectionId, zhTokens, enTokens] of sectionContracts) {
    const section = byId[moduleId]!.sections.find(({ id }) => id === sectionId)!
    for (const token of zhTokens) assert.ok(section.content['zh-CN'].includes(token), `${sectionId}/zh needs ${token}`)
    for (const token of enTokens) assert.ok(section.content.en.includes(token), `${sectionId}/en needs ${token}`)
  }
})

const perSectionEnglishContracts: Record<string, Record<string, string[]>> = {
  'linear-algebra-feature-space': {
    'vectors-opening': ['x = [2, 3]', 'unit-bearing linear functional', 'dimensionless'],
    'vectors-recap': ['L=(\\hat y-y)^2', 'L=1', 'shape (2,)'],
    'vectors-shared-task': ['w^T x + b', 'minutes/base', 'y_hat = 10'],
    'vectors-intuition': ['+8 minutes', '-3 minutes', 'bias'],
    'vectors-formal': ['same dimension', '[2,3,1]', 'truncated', '(1,2)', '(2,1)'],
    'vectors-worked-shared': ['4*2 + (-1)*3 = 5', 'L = (10 - 9)^2 = 1'],
    'vectors-worked-auxiliary': ['u = [3, 4]', 'v = [4, 0]', '0.6'],
    'vectors-code': ['contributions = w * x', 'weighted_sum = w @ x', 'zip'],
    'vectors-experiment': ['[8,-2]', '[-4,1]', '[3,-1]', '36', '81'],
    'vectors-misconceptions': ['Dimension is not Euclidean norm', 'Elementwise multiplication', 'Matching lengths'],
    'vectors-practice': ['Exercise 1A', 'Exercise 3C'],
    'vectors-handoff': ['X = [[2, 3], [1, 4]]', 'predictions [10,5]', 'targets [9,7]'],
  },
  'linear-algebra-matrix-transformations': {
    'matrices-opening': ['X = [[2, 3], [1, 4]]', 'rows are samples', 'columns are features'],
    'matrices-recap': ['one row x', 'w^T x', '[10,5]'],
    'matrices-shared-task': ['Xw+b', 'residuals [1,-2]', 'MSE 2.5'],
    'matrices-intuition': ['Adding one row adds one output', 'geometric transformation'],
    'matrices-formal': ['(2,2) @ (2,) -> (2,)', '(n,1)', '(n,n)', 'Axis 0', 'axis 1'],
    'matrices-worked-shared': ['[[8,-3],[4,-4]]', '[5,0]', '[10,5]', '2.5'],
    'matrices-worked-auxiliary': ['[[1, 0], [0, -1]]', '[2, 3] -> [2, -3]'],
    'matrices-code': ['X.ndim==2', 'X.shape[1]==w.shape[0]', 'loop_predictions', 'X @ w + b'],
    'matrices-experiment': ['[3,2]', '[10,5,15]', 'swap the first two rows'],
    'matrices-misconceptions': ['Transposing X', 'Elementwise X*w', '(n,1)', 'Reordering rows'],
    'matrices-practice': ['Exercise 1A', 'Exercise 3C'],
    'matrices-handoff': ['predictions=[10,5]', 'MSE=2.5', 'not confuse estimating a derivative'],
  },
  'calculus-derivatives-local-change': {
    'derivatives-opening': ['MSE 2.5', 'central-difference', 'not gradient descent'],
    'derivatives-recap': ['Average rate', 'x,w,b -> y_hat', 'y_hat,y -> L'],
    'derivatives-shared-task': ['L(w,b)', '[0,-5]', '-1', 'copied parameter'],
    'derivatives-intuition': ['positive sensitivity', 'negative', 'locally flat', 'global guarantee'],
    'derivatives-formal': ['L(\\theta+h)-L(\\theta-h)', '2h', 'positive and finite', 'too small'],
    'derivatives-worked-shared': ['dL/dw1', 'dL/dw2', 'dL/db', '[0, -5, -1]'],
    'derivatives-worked-auxiliary': ['s(t) = t^2', '9.61', '8.41', 'slope_at_3 = 6'],
    'derivatives-code': ['def central_difference', 'candidate_w = w.copy()', 'gradient_b'],
    'derivatives-experiment': ['1, 0.1, 0.01, 1e-4', 'floating-point noise', 'only h changed'],
    'derivatives-misconceptions': ['not gradient descent', 'local', 'Smaller h', 'Mutating'],
    'derivatives-practice': ['Exercise 1A', 'Exercise 3C'],
    'derivatives-handoff': ['MSE 2.5', 'w=[0,-5]', 'b=-1', 'not introduce a learning-rate update'],
  },
  'numpy-mathematics-implementation': {
    'numpy-opening': ['Broadcasting', 'integer dtype', 'non-finite', '[10,5]', '2.5'],
    'numpy-recap': ['X has shape (n,d)', 'predictions and targets', 'Central difference'],
    'numpy-shared-task': ['predictions = X @ w + b', 'residuals', 'squared_errors', 'MSE 2.5'],
    'numpy-intuition': ['runtime type', 'shape alone', 'Intermediate arrays'],
    'numpy-formal': ['np.asarray', 'dtype=float', 'X.ndim==2', 'np.isfinite', 'axis 1'],
    'numpy-worked-shared': ['weighted_sums', 'predictions = [10.0, 5.0]', 'MSE = 2.5', '[0.0,-5.0]'],
    'numpy-worked-auxiliary': ['sensor_grid', 'column_bias', '(3,3)', '[[11. 22. 33.]'],
    'numpy-code': ['MATH_TO_CODE_REFERENCE_BEGIN', 'def evaluate', 'MATH_TO_CODE_REFERENCE_END'],
    'numpy-experiment': ['nested-loop', 'X @ w + b', 'allclose', 'two-row'],
    'numpy-misconceptions': ['(n,1)', 'Integer arrays', 'view', 'NaN'],
    'numpy-practice': ['Exercise 1A', 'Exercise 3C'],
    'numpy-handoff': ['predictions [10,5]', 'MSE 2.5', '[0,-5,-1]', 'Gradient Descent and Monte Carlo'],
  },
}

test('every English section preserves its approved semantic anchors rather than only length and labels', () => {
  for (const [moduleId, sectionContracts] of Object.entries(perSectionEnglishContracts)) {
    const module = byId[moduleId]!
    for (const [sectionId, tokens] of Object.entries(sectionContracts)) {
      const content = module.sections.find(({ id }) => id === sectionId)!.content.en
      for (const token of tokens) assert.ok(content.toLowerCase().includes(token.toLowerCase()), `${sectionId}/en needs ${token}`)
    }
  }
})

const practiceContracts: Record<string, Record<string, string[]>> = {
  'linear-algebra-feature-space': {
    '1A': ['[3,2]', '[2,3]', 'same level'], '1B': ['same dimension', 'meaning', 'units'],
    '1C': ['dot product of zero', 'u=[1,0]', 'v=[0,2]', 'nonzero', 'orthogonal'],
    '2A': ['[2,3]', '[3,-1]', 'b=5', 'y=9', 'prediction is 8', 'L=1'],
    '2B': ['w*x+b', '[13,2]', 'shape (2,)'], '2C': ['u=[2,0]', 'v=[1,1]', 'projection', '[1,1]'],
    '3A': ['0.5', '1', '2', 'bias does not scale'], '3B': ['2', '0.2', '4', '40', 'unit conversion'],
    '3C': ['order mismatch', 'missing reduction', 'name,value,weight,contribution'],
  },
  'linear-algebra-matrix-transformations': {
    '1A': ['(5,2) @ (2,)', '(5,)'], '1B': ['target', 'X', 'deploy'],
    '1C': ['sample matrix X', 'mirror matrix', 'coordinate transform'],
    '2A': ['[3,2]', '3*4', 'prediction 15'], '2B': ['axis=0', 'across rows', 'axis 1'],
    '2C': ['[10,5]', '[8,8]', '[2,-3]', '6.5'], '3A': ['permute rows', 'original indices'],
    '3B': ['four corners', 'horizontal coordinate', 'vertical sign'],
    '3C': ['ndim', 'sample count', 'feature count', 'target length', 'finite'],
  },
  'calculus-derivatives-local-change': {
    '1A': ['-5', 'increasing w2 by 1', 'local linear approximation'], '1B': ['partial derivative', 'other parameters be held fixed', 'attribution'],
    '1C': ['numerical derivative', 'analytic derivative', 'check each other'],
    '2A': ['h=0.5', 't^2', 'at 2', '2.5^2', '1.5^2', '=4'],
    '2B': ['denominator', 'h', '2h', '12'], '2C': ['residuals [1,-2]', 'dL/db', '-1'],
    '3A': ['multiple h', 'w2', '-5', 'log scale'], '3B': ['loss table', 'tangent direction', 'other parameters fixed'],
    '3C': ['shared array', 'w_before=w.copy()', 'array_equal'],
  },
  'numpy-mathematics-implementation': {
    '1A': ['(2,)', 'feature vector or predictions', 'axis semantics'], '1B': ['X*w', 'sample and feature axes', 'sum'],
    '1C': ['vectorized', 'hand-check', 'independent evidence'],
    '2A': ['sensor_grid[0]', 'column_bias[:, None]', '(3,3)'],
    '2B': ['np.mean(predictions-y)**2', 'cancel', 'np.mean((predictions-y)**2)'],
    '2C': ['h=0', 'raise', 'before calculation'], '3A': ['2', '1000', 'loop', 'vectorized', 'values before timing'],
    '3B': ['(2,1)', 'four cross combinations', 'shape check'],
    '3C': ['[10,5]', '2.5', '[0,-5,-1]', 'parameter unchanged', 'non-finite'],
  },
}

function exerciseBlock(content: string, id: string): string {
  const ids = ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C']
  const index = ids.indexOf(id)
  const next = ids[index + 1]
  return content.match(new RegExp(`Exercise ${id}[\\s\\S]*?${next ? `(?=Exercise ${next})` : '$'}`))?.[0] ?? ''
}

test('all 36 English exercises preserve the approved task, hint, reasoning, numbers, and backlink semantics', () => {
  for (const [moduleId, contracts] of Object.entries(practiceContracts)) {
    const module = byId[moduleId]!
    const content = module.sections.find(({ id }) => id.endsWith('-practice'))!.content.en
    for (const [exerciseId, tokens] of Object.entries(contracts)) {
      const block = exerciseBlock(content, exerciseId)
      assert.ok(block, `${moduleId}/${exerciseId}`)
      assert.match(block, /Hint:/)
      assert.match(block, /Reference reasoning:/)
      assert.match(block, /\]\(#[a-z0-9-]+\)/)
      for (const token of tokens) assert.ok(block.toLowerCase().includes(token.toLowerCase()), `${moduleId}/${exerciseId} needs ${token}`)
    }
  }
})

test('derivative and NumPy code sections contain complete copyable reference implementations and guards', () => {
  const derivative = byId['calculus-derivatives-local-change']!.sections.find(({ id }) => id === 'derivatives-code')!.content.en
  for (const token of ['import numpy as np', 'def mse_for', 'def central_difference', 'np.isfinite(theta)', 'h <= 0', 'candidate_w = w.copy()', 'gradient_w.append', 'gradient_b', 'about [0.0, -5.0], -1.0']) {
    assert.ok(derivative.includes(token), `derivative code needs ${token}`)
  }
  assert.ok((derivative.match(/```python/g) ?? []).length >= 2)

  const numpy = byId['numpy-mathematics-implementation']!.sections.find(({ id }) => id === 'numpy-code')!.content.en
  for (const token of ['MATH_TO_CODE_REFERENCE_BEGIN', 'def _matrix', 'def _vector', 'def _scalar', 'def predict_batch', 'def mse_loss', 'def central_difference', 'def evaluate', 'np.asarray', '.copy()', 'np.isfinite', 'prediction and target shapes must match', 'gradient_w', 'gradient_b', 'MATH_TO_CODE_REFERENCE_END']) {
    assert.ok(numpy.includes(token), `NumPy code needs ${token}`)
  }
  assert.match(numpy, /np\.testing\.assert_allclose\(predictions, \[10\., 5\.\]\)/)
})

test('generator --check is read-only and verifies generated bytes', () => {
  const generatedUrl = new URL('../src/modules/math-lab/data/mathToCode/runtimeLessonContent.generated.ts', import.meta.url)
  const before = readFileSync(generatedUrl)
  const result = spawnSync(process.execPath, ['scripts/generateMathToCodeRuntimeContent.mjs', '--check'], {
    cwd: new URL('../', import.meta.url), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.deepEqual(readFileSync(generatedUrl), before)
  assert.match(result.stdout, /up to date/i)
})

test('generator --check exits nonzero when target bytes drift', () => {
  const directory = mkdtempSync(join(tmpdir(), 'math-to-code-generator-'))
  const target = join(directory, 'runtimeLessonContent.generated.ts')
  try {
    writeFileSync(target, '// stale generated content\n')
    const result = spawnSync(process.execPath, [
      'scripts/generateMathToCodeRuntimeContent.mjs', '--check', '--target', target,
    ], { cwd: new URL('../', import.meta.url), encoding: 'utf8' })
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /out of date/i)
    assert.equal(readFileSync(target, 'utf8'), '// stale generated content\n')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('quiz misconception mappings protect derivative sign, missing bias, and sensor-axis semantics', () => {
  const expected = {
    'derivative-w2-check': ['derivative-sign-is-parameter-sign', /derivative.*sign.*local|导数.*符号.*局部/is],
    'numpy-output-check': ['numpy-missing-bias', /weighted sum.*bias|加权和.*偏置/is],
    'numpy-axis-check': ['numpy-sensor-axis', /sensor.*axis|传感器.*轴/is],
  } as const
  for (const [quizId, [tag, semantic]] of Object.entries(expected)) {
    const module = mathToCodeModules.find((candidate) => candidate.quizzes.some((quiz) => quiz.id === quizId))!
    const quiz = module.quizzes.find(({ id }) => id === quizId)!
    assert.deepEqual(quiz.misconceptionTags, [tag])
    const misconception = module.misconceptions.find(({ id }) => id === tag)!
    assert.ok(misconception)
    assert.match(Object.values(misconception).flatMap((value) => typeof value === 'object' ? Object.values(value) : [value]).join(' '), semantic)
  }
})

test('NumPy lesson owns an auditable internal source record', () => {
  const module = byId['numpy-mathematics-implementation']!
  assert.equal(module.sourceNoteFile, 'math-to-code-numpy-sources.md')
  const sourceUrl = new URL(`../docs/${module.sourceNoteFile}`, import.meta.url)
  assert.equal(existsSync(sourceUrl), true)
  const source = readFileSync(sourceUrl, 'utf8')
  assert.match(source, /05-numpy-implementation\.zh-CN\.md/)
  assert.match(source, /Task 1|mathToCode\.ts|sharedTask\.ts/)
  assert.match(source, /NumPy.*broadcasting.*matmul.*isfinite/is)
  assert.match(source, /runtime generation|运行时生成|reuse boundary|复用边界/is)
  const hrefs = (module.sourceReferences ?? []).map(({ href }) => href)
  assert.ok(hrefs.some((href) => href.includes('/basics.broadcasting.html')))
  assert.ok(hrefs.some((href) => href.includes('/numpy.matmul.html')))
  assert.ok(hrefs.some((href) => href.includes('/numpy.isfinite.html')))
  for (const href of hrefs) assert.match(href, /^https:\/\//)
})
