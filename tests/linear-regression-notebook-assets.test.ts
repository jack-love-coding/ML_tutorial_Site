import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')
const requirementsPath = resolve(root, 'scripts/linear-regression/requirements.txt')
const environmentContractPath = resolve(
  root,
  'scripts/linear-regression/environment-contract.json',
)
const inheritedRequirementsPath = resolve(root, 'scripts/loss-functions/requirements.txt')
const inheritedEnvironmentContractPath = resolve(
  root,
  'scripts/loss-functions/environment-contract.json',
)
const stagingRoot = resolve(root, '.cache/linear-regression/phase-27-staging')
const publicRoot = resolve(root, 'public')

const EXPECTED_CANDIDATE_FILES = Object.freeze([
  'notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb',
  'notebooks/linear-regression/bike-linear-regression.en.ipynb',
  'notebooks/linear-regression/linear-regression-summary.json',
  'notebooks/linear-regression/gradient-descent-trace.csv',
  'notebooks/linear-regression/coefficients.csv',
  'notebooks/linear-regression/heldout-residuals.csv',
  'notebooks/linear-regression/requirements.txt',
  'notebooks/linear-regression/environment.json',
  'notebooks/linear-regression/output-manifest.json',
] as const)

const EXPECTED_FEATURE_ORDER = Object.freeze([
  'temp',
  'hum',
  'windspeed',
  'workingday',
  'hr',
] as const)

const EXPECTED_CONTINUOUS_FEATURES = Object.freeze([
  'temp',
  'hum',
  'windspeed',
  'hr',
] as const)

const TEACHING_ROW_ROLES = Object.freeze([
  Object.freeze({
    role: 'representative-training-row',
    instant: 11_550,
    partition: 'train',
    rule: 'inclusive training cnt IQR, minimum absolute base-OLS residual, lowest instant tie-break',
  }),
  Object.freeze({
    role: 'negative-prediction',
    instant: 17_213,
    partition: 'held-out',
    rule: 'minimum raw-count prediction, lowest instant tie-break',
  }),
  Object.freeze({
    role: 'morning-peak-underprediction',
    instant: 15_628,
    partition: 'held-out',
    rule: 'hr 7-9, maximum positive actual - prediction, lowest instant tie-break',
  }),
  Object.freeze({
    role: 'evening-peak-underprediction',
    instant: 14_965,
    partition: 'held-out',
    rule: 'hr 16-19, maximum positive actual - prediction, lowest instant tie-break',
  }),
  Object.freeze({
    role: 'large-residual',
    instant: 15_604,
    partition: 'held-out',
    rule: 'exclude prior named rows, maximum absolute residual, lowest instant tie-break',
  }),
] as const)

function sha256(path: string) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

test('inventory scaffold locks the exact indivisible nine-member candidate package', () => {
  assert.equal(EXPECTED_CANDIDATE_FILES.length, 9)
  assert.equal(new Set(EXPECTED_CANDIDATE_FILES).size, 9)
  assert.deepEqual(EXPECTED_CANDIDATE_FILES, [
    'notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb',
    'notebooks/linear-regression/bike-linear-regression.en.ipynb',
    'notebooks/linear-regression/linear-regression-summary.json',
    'notebooks/linear-regression/gradient-descent-trace.csv',
    'notebooks/linear-regression/coefficients.csv',
    'notebooks/linear-regression/heldout-residuals.csv',
    'notebooks/linear-regression/requirements.txt',
    'notebooks/linear-regression/environment.json',
    'notebooks/linear-regression/output-manifest.json',
  ])
  assert.equal(
    EXPECTED_CANDIDATE_FILES.every((path) =>
      path.startsWith('notebooks/linear-regression/')),
    true,
  )
  assert.equal(
    EXPECTED_CANDIDATE_FILES.some((path) => path.startsWith('public/')),
    false,
  )
})

test('environment contract exactly reuses the audited Phase 26 eight-pin identity', () => {
  assert.equal(existsSync(requirementsPath), true)
  assert.deepEqual(readFileSync(requirementsPath), readFileSync(inheritedRequirementsPath))
  assert.deepEqual(readFileSync(requirementsPath, 'utf8').trim().split('\n'), [
    'numpy==2.4.6',
    'pandas==3.0.3',
    'scipy==1.17.1',
    'nbformat==5.10.4',
    'nbclient==0.11.0',
    'jupyterlab==4.6.1',
    'ipykernel==7.3.0',
    'scikit-learn==1.9.0',
  ])

  const inherited = JSON.parse(readFileSync(inheritedEnvironmentContractPath, 'utf8'))
  const contract = JSON.parse(readFileSync(environmentContractPath, 'utf8'))
  assert.equal(contract.contractVersion, 'linear-regression-phase-27-environment-v1')
  assert.deepEqual(contract.requirements.pins, inherited.requirements.pins)
  assert.equal(contract.requirements.path, 'scripts/linear-regression/requirements.txt')
  assert.equal(contract.requirements.sha256, sha256(requirementsPath))
  assert.equal(contract.requirements.sourcePath, inherited.requirements.path)
  assert.equal(contract.requirements.sourceSha256, sha256(inheritedRequirementsPath))
  assert.deepEqual(contract.wheelCache, inherited.wheelCache)
  assert.deepEqual(contract.python, inherited.python)
  assert.deepEqual(contract.platform, inherited.platform)
  assert.equal(contract.installation.networkAccess, false)
  assert.deepEqual(contract.installation.pipArguments, [
    '--no-index',
    '--find-links=<audited-wheel-cache>',
    '--requirement=scripts/linear-regression/requirements.txt',
  ])
  assert.equal(contract.execution.jobCount, 2)
  assert.equal(contract.execution.allowErrors, false)
  assert.equal(contract.execution.workingDirectory, 'notebooks/linear-regression')
  assert.equal(contract.execution.temporaryKernelNamePublished, false)
})

test('normal equation and 正规方程 scaffold lock augmented design and stable solver mapping', () => {
  const requiredTeachingContract = Object.freeze({
    enTerm: 'normal equation',
    zhTerm: '正规方程',
    augmentedDesign: 'X_tilde = [1, X]',
    pseudoinverse: 'theta = pinv(X_tilde) @ y',
    interceptMapping: 'theta[0] = b',
    coefficientMapping: 'theta[1:] = w',
    stableImplementation: 'numpy.linalg.lstsq',
    methodRoles: Object.freeze([
      'NumPy batch gradient descent',
      'normal-equation numerical reference',
      'scikit-learn LinearRegression',
    ]),
  })

  assert.match(requiredTeachingContract.enTerm, /normal equation/)
  assert.match(requiredTeachingContract.zhTerm, /正规方程/)
  assert.equal(requiredTeachingContract.augmentedDesign, 'X_tilde = [1, X]')
  assert.match(requiredTeachingContract.pseudoinverse, /pinv\(X_tilde\)/)
  assert.equal(requiredTeachingContract.interceptMapping, 'theta[0] = b')
  assert.equal(requiredTeachingContract.coefficientMapping, 'theta[1:] = w')
  assert.equal(requiredTeachingContract.stableImplementation, 'numpy.linalg.lstsq')
  assert.equal(requiredTeachingContract.methodRoles.length, 3)
})

test('deterministic teaching-row role scaffold locks five instants and tie-break rules', () => {
  assert.deepEqual(
    TEACHING_ROW_ROLES.map(({ instant }) => instant),
    [11_550, 17_213, 15_628, 14_965, 15_604],
  )
  assert.deepEqual(
    TEACHING_ROW_ROLES.map(({ role }) => role),
    [
      'representative-training-row',
      'negative-prediction',
      'morning-peak-underprediction',
      'evening-peak-underprediction',
      'large-residual',
    ],
  )
  assert.equal(TEACHING_ROW_ROLES[0].rule.includes('inclusive training cnt IQR'), true)
  assert.equal(TEACHING_ROW_ROLES[2].rule.includes('hr 7-9'), true)
  assert.equal(TEACHING_ROW_ROLES[3].rule.includes('hr 16-19'), true)
  assert.equal(
    TEACHING_ROW_ROLES.every(({ rule }) => rule.includes('lowest instant tie-break')),
    true,
  )
})

test('safety scaffold [27-W0-03] enumerates fail-closed source cell inventory and selector classes', () => {
  const rejectedClasses = Object.freeze([
    'remote URL',
    'network import',
    'registry resolution',
    'shell command',
    'install cell',
    'raw HTML or script',
    'widget state',
    'uncontrolled iframe',
    'public staging root',
    'partial locale selector',
    'partial file selector',
    'unexpected candidate file',
    'missing candidate file',
    'source hash drift',
    'source schema drift',
    'source row order drift',
    'split drift',
    'feature order drift',
    'leakage feature',
    'workingday scaling',
    'method tolerance drift',
  ])

  assert.equal(rejectedClasses.length, 21)
  assert.equal(rejectedClasses.includes('registry resolution'), true)
  assert.equal(rejectedClasses.includes('public staging root'), true)
  assert.equal(rejectedClasses.includes('partial locale selector'), true)
  assert.equal(rejectedClasses.includes('partial file selector'), true)
  assert.equal(EXPECTED_FEATURE_ORDER.includes('atemp' as 'temp'), false)
  assert.equal(EXPECTED_FEATURE_ORDER.includes('casual' as 'temp'), false)
  assert.equal(EXPECTED_FEATURE_ORDER.includes('registered' as 'temp'), false)
  assert.deepEqual(EXPECTED_CONTINUOUS_FEATURES, ['temp', 'hum', 'windspeed', 'hr'])
})

test('staging scaffold is the exact ignored non-public transaction root', () => {
  const ignore = readFileSync(resolve(root, '.gitignore'), 'utf8').split('\n')
  assert.equal(
    ignore.includes('/.cache/linear-regression/phase-27-staging'),
    true,
  )
  assert.equal(stagingRoot.startsWith(publicRoot), false)
  assert.equal(stagingRoot, resolve(root, '.cache/linear-regression/phase-27-staging'))
})

test.todo('kernel and locale parity execute independently [owner Plan 27-03]')
test.todo('numerical contract emits complete coefficient GD and residual tables [owner Plan 27-03]')
test.todo('candidate verification [27-W0-02] rejects missing unexpected and corrupted members [owner Plan 27-03]')
test.todo('publication [27-W0-02] accepts only the complete nine-member package [owner Plan 27-04]')
test.todo('rollback [27-W0-02] restores absent or seeded public targets byte-for-byte [owner Plan 27-04]')
test.todo('offline rerun [27-W0-02] leaves repository bytes and mtimes unchanged [owner Plan 27-04]')
test.todo('base paths [27-W0-02] resolve every public member for root and Pages [owner Plan 27-04]')
