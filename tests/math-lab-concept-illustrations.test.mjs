import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

const expectedConcepts = {
  'vectors-matrices-norms': [
    'dot-product-cosine-similarity',
    'matrix-as-linear-transform',
    'induced-matrix-norm',
  ],
  'tensor-shapes-vectorization': [
    'linear-layer-shape-contract',
    'broadcasting-compatibility',
  ],
  'taylor-series': ['taylor-polynomial', 'taylor-remainder'],
  'matrix-calculus-autodiff': ['local-linearization', 'vjp-jvp'],
  'monte-carlo': ['monte-carlo-estimator-core'],
  'probability-likelihood-entropy': ['softmax-cross-entropy', 'kl-divergence'],
  'lu-decomposition': ['lu-factorization-core', 'lup-pivoting-core'],
  'sparse-matrices': ['sparse-nnz-core', 'sparse-csr-rowptr-core'],
  'condition-numbers': ['condition-number-core', 'residual-error-bound'],
  'eigenvalues-eigenvectors': ['eigenpair', 'characteristic-polynomial', 'rayleigh-quotient'],
  'markov-chains': ['markov-property-core', 'markov-transition-matrix-core', 'markov-stationary-pagerank-core'],
  'finite-difference-methods': [
    'finite-difference-derivative-core',
    'finite-difference-error-balance',
    'finite-difference-gradient-jacobian',
  ],
  'nonlinear-equations': ['nonlinear-root-residual', 'newton-step', 'multidimensional-newton'],
  optimization: ['optimization-minimizer', 'optimization-steepest-descent', 'optimization-newton-step'],
  'training-diagnostics': ['gradient-update-diagnostics', 'validation-gap'],
  'least-squares-fitting': [
    'least-squares-residual-objective',
    'least-squares-normal-equations',
    'least-squares-svd-pseudoinverse',
  ],
  svd: ['singular-value-decomposition', 'rank-from-singular-values', 'svd-pseudoinverse', 'svd-low-rank'],
  pca: ['pca-centered-projection', 'pca-covariance-diagonalization', 'pca-svd-explained-variance'],
  'deep-architecture-math': ['convolution-output-size', 'scaled-dot-product-attention'],
}

test('math lab concept illustration registry covers every current concept', () => {
  const registrySource = read('src/modules/math-lab/data/conceptIllustrations.ts')

  const moduleIds = Object.keys(expectedConcepts)
  for (const moduleId of moduleIds) {
    assert.match(registrySource, new RegExp(`moduleId: ['"]${moduleId}['"]`))
  }

  const expectedPairs = Object.entries(expectedConcepts).flatMap(([moduleId, conceptIds]) =>
    conceptIds.map((conceptId) => `${moduleId}:${conceptId}`),
  )

  assert.equal(expectedPairs.length, 47)

  for (const pair of expectedPairs) {
    assert.match(registrySource, new RegExp(`key: ['"]${pair}['"]`), `${pair} should have a registry entry`)
  }
})

test('concept illustration records use local public PNG paths and complete prompt metadata', () => {
  const registrySource = read('src/modules/math-lab/data/conceptIllustrations.ts')

  const entries = [
    ...registrySource.matchAll(/key: ['"]([^'"]+)['"][\s\S]*?assetPath: ['"]([^'"]+)['"][\s\S]*?prompt: String\.raw`([\s\S]*?)`/g),
  ]
  assert.equal(entries.length, 47)

  for (const [, key, assetPath, prompt] of entries) {
    assert.match(assetPath, /^\/math-lab\/concepts\/generated\/[a-z0-9-]+\.png$/)
    assert.match(prompt, /Use case: infographic-diagram/)
    assert.match(prompt, /Asset type: ML Atlas Math Lab concept illustration/)
    assert.match(prompt, /Constraints:/)
    assert.doesNotMatch(prompt, /NEEDS_CONTENT|FILL_ME/i, `${key} prompt should be complete`)
  }
})

test('generated concept illustration assets exist when marked generated', () => {
  const registrySource = read('src/modules/math-lab/data/conceptIllustrations.ts')
  const generatedEntries = [...registrySource.matchAll(/status: ['"]generated['"][\s\S]*?assetPath: ['"]([^'"]+)['"]/g)]

  for (const [, assetPath] of generatedEntries) {
    const publicPath = `public/${assetPath.replace(/^\//, '')}`
    assert.ok(existsSync(new URL(publicPath, root)), `${assetPath} should exist`)
  }
})

test('module page renders concept illustration assets through public base helper', () => {
  const pageSource = read('src/modules/math-lab/pages/MathLabModulePage.vue')

  assert.match(pageSource, /conceptIllustrationFor/)
  assert.match(pageSource, /math-concept-illustration/)
  assert.match(pageSource, /withPublicBase/)
  assert.match(pageSource, /conceptIllustrationSrc/)
})
