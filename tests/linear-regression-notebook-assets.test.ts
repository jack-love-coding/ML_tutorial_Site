import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, resolve } from 'node:path'
import test from 'node:test'
import { withPublicBase } from '../src/utils/publicPath.ts'

const root = resolve(import.meta.dirname, '..')
const generatorPath = resolve(root, 'scripts/linear-regression/build-phase-27-assets.py')
const sourceBridgePath = resolve(root, 'scripts/linear-regression/verify-bike-source.mjs')
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
const candidatePackageRoot = resolve(
  stagingRoot,
  'notebooks/linear-regression',
)
const publicPackageRelativePath = 'notebooks/linear-regression'
const publicationLockName = '.linear-regression-publication.lock'

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

const EXPECTED_PUBLIC_FILES = Object.freeze(
  EXPECTED_CANDIDATE_FILES.map((path) =>
    path.replace('notebooks/linear-regression/', '')),
)

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

function runGenerator(args: readonly string[]) {
  return spawnSync('python3', [generatorPath, ...args], {
    cwd: root,
    encoding: 'utf8',
  })
}

function runProbe(source: string, args: readonly string[] = []) {
  const loader = [
    'import importlib.util, json, pathlib, sys',
    'generator_path = pathlib.Path(sys.argv[1])',
    'spec = importlib.util.spec_from_file_location("phase27_assets", generator_path)',
    'module = importlib.util.module_from_spec(spec)',
    'sys.modules[spec.name] = module',
    'spec.loader.exec_module(module)',
    source,
  ].join('\n')
  return spawnSync('python3', ['-c', loader, generatorPath, ...args], {
    cwd: root,
    encoding: 'utf8',
  })
}

function readContractSnapshot() {
  const probe = runProbe([
    'snapshot = module.candidate_contract_snapshot()',
    'print(json.dumps(snapshot, ensure_ascii=False, sort_keys=True, allow_nan=False))',
  ].join('\n'))
  assert.equal(probe.status, 0, probe.stderr)
  return JSON.parse(probe.stdout)
}

function readCandidateJson(relativePath: string) {
  return JSON.parse(readFileSync(resolve(stagingRoot, relativePath), 'utf8'))
}

function readPublicJson(relativePath: string) {
  const source = readFileSync(resolve(publicRoot, relativePath), 'utf8')
  assert.doesNotMatch(source, /:\s*(?:NaN|Infinity|-Infinity)\b/)
  return JSON.parse(source)
}

function readCsvRows(relativePath: string) {
  const lines = readFileSync(resolve(stagingRoot, relativePath), 'utf8')
    .trim()
    .split(/\r?\n/)
  const header = lines[0]!.split(',')
  return lines.slice(1).map((line) => Object.fromEntries(
    line.split(',').map((value, index) => [header[index]!, value]),
  ))
}

function closeTo(actual: number, expected: number, tolerance: number) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  )
}

function treeSnapshot(treeRoot: string) {
  if (!existsSync(treeRoot)) return {}
  const entries: Record<
    string,
    { kind: 'directory', mode: number }
    | { kind: 'file', mode: number, bytes: number, sha256: string }
  > = {}
  const rootStatus = statSync(treeRoot)
  entries['.'] = {
    kind: 'directory',
    mode: rootStatus.mode & 0o777,
  }
  const visit = (directory: string) => {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name)
      const status = statSync(path)
      const relativePath = relative(treeRoot, path)
      if (status.isDirectory()) {
        entries[relativePath] = {
          kind: 'directory',
          mode: status.mode & 0o777,
        }
        visit(path)
      } else {
        entries[relativePath] = {
          kind: 'file',
          mode: status.mode & 0o777,
          bytes: status.size,
          sha256: sha256(path),
        }
      }
    }
  }
  visit(treeRoot)
  return entries
}

function seedCompletePublicTarget(temporaryPublicRoot: string) {
  const target = resolve(temporaryPublicRoot, publicPackageRelativePath)
  mkdirSync(resolve(temporaryPublicRoot, 'notebooks'), { recursive: true })
  cpSync(candidatePackageRoot, target, { recursive: true })
  EXPECTED_PUBLIC_FILES.forEach((name, index) => {
    const path = resolve(target, name)
    writeFileSync(path, `seeded-prior-${index}-${name}\n`, 'utf8')
    chmodSync(path, index % 2 === 0 ? 0o640 : 0o600)
  })
  chmodSync(target, 0o750)
  return target
}

function publicationResidue(temporaryPublicRoot: string) {
  return Object.keys(treeSnapshot(temporaryPublicRoot)).filter((path) =>
    path.split('/').some((component) =>
      component === publicationLockName
      || component.startsWith('.linear-regression-publication-'),
    ),
  )
}

function publishFixture(
  fixturePublicRoot: string,
  failurePoint?: string,
) {
  return runProbe([
    'result = module.publish_candidates_atomically(',
    '    pathlib.Path(sys.argv[2]),',
    '    public_root=pathlib.Path(sys.argv[3]),',
    '    enforce_staging_root=False,',
    '    enforce_public_root=False,',
    ...(failurePoint === undefined
      ? []
      : [`    failure_point=${JSON.stringify(failurePoint)},`]),
    ')',
    'print(json.dumps(result, sort_keys=True, allow_nan=False))',
  ].join('\n'), [stagingRoot, fixturePublicRoot])
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

test('source bridge delegates to the existing Bike authority and reports immutable boundaries', () => {
  const source = readFileSync(sourceBridgePath, 'utf8')
  assert.match(source, /from ['"]\.\.\/python-data-tools\/bikeSharingContract\.mjs['"]/)
  assert.match(source, /verifyBikeSharingSnapshot/)
  assert.match(source, /validatePythonDataToolsArtifacts/)
  assert.match(source, /parseBikeSharingCsv/)
  assert.doesNotMatch(source, /function\s+parseCsv|split\s*\(\s*['"]\\n/)

  const bridge = spawnSync('node', [sourceBridgePath], {
    cwd: root,
    encoding: 'utf8',
  })
  assert.equal(bridge.status, 0, bridge.stderr)
  const contract = JSON.parse(bridge.stdout)
  assert.equal(contract.contractVersion, 'linear-regression-bike-source-v1')
  assert.equal(contract.source.rows, 17_379)
  assert.equal(
    contract.source.sha256,
    'e03de4ee4ef4dc376ac6e04bf829673c6269e8eba5c60fa121640fa2f829504f',
  )
  assert.deepEqual(contract.schema.columnOrder, [
    'instant',
    'dteday',
    'season',
    'yr',
    'mnth',
    'hr',
    'holiday',
    'weekday',
    'workingday',
    'weathersit',
    'temp',
    'atemp',
    'hum',
    'windspeed',
    'casual',
    'registered',
    'cnt',
  ])
  assert.deepEqual(contract.features.order, EXPECTED_FEATURE_ORDER)
  assert.deepEqual(contract.features.continuous, EXPECTED_CONTINUOUS_FEATURES)
  assert.deepEqual(contract.features.leakageExcluded, ['casual', 'registered'])
  assert.equal(contract.target.relationship, 'cnt = casual + registered')
  assert.equal(contract.split.index, 13_903)
  assert.equal(contract.boundaryRecords.first.instant, '1')
  assert.equal(contract.boundaryRecords.trainEnd.instant, '13903')
  assert.equal(contract.boundaryRecords.testStart.instant, '13904')
  assert.equal(contract.boundaryRecords.last.instant, '17379')
})

test('inventory shell exposes one exact package with no partial or public mode', () => {
  const snapshot = readContractSnapshot()
  assert.deepEqual(snapshot.inventory.paths, EXPECTED_CANDIDATE_FILES)
  assert.deepEqual(snapshot.inventory.locales, ['zh-CN', 'en'])
  assert.equal(snapshot.inventory.partialSelectionAllowed, false)
  assert.equal(snapshot.inventory.publicationAllowed, false)
  assert.deepEqual(snapshot.features.order, EXPECTED_FEATURE_ORDER)
  assert.deepEqual(snapshot.features.continuous, EXPECTED_CONTINUOUS_FEATURES)
  assert.equal(snapshot.split.index, 13_903)

  const help = runGenerator(['--help'])
  assert.equal(help.status, 0, help.stderr)
  assert.match(help.stdout, /--verify-environment/)
  assert.match(help.stdout, /--prepare-candidates/)
  assert.match(help.stdout, /--verify-candidates/)
  assert.match(help.stdout, /--publish-candidates/)
  assert.doesNotMatch(help.stdout, /--check/)
})

test('environment shell validates every audited wheel and exact isolated settings', () => {
  const verified = runProbe([
    'result = module.validate_environment_contract()',
    'print(json.dumps(result, sort_keys=True, allow_nan=False))',
  ].join('\n'))
  assert.equal(verified.status, 0, verified.stderr)
  const result = JSON.parse(verified.stdout)
  assert.deepEqual(result.pins, {
    ipykernel: '7.3.0',
    jupyterlab: '4.6.1',
    nbclient: '0.11.0',
    nbformat: '5.10.4',
    numpy: '2.4.6',
    pandas: '3.0.3',
    'scikit-learn': '1.9.0',
    scipy: '1.17.1',
  })
  assert.equal(result.wheelCount, 99)
  assert.equal(result.installation, 'pip --no-index --find-links=<audited-wheel-cache>')

  const source = readFileSync(generatorPath, 'utf8')
  assert.match(source, /TemporaryDirectory\(prefix="ml-atlas-phase27-environment-/)
  assert.match(source, /PIP_NO_INDEX/)
  assert.match(source, /JUPYTER_CONFIG_DIR/)
  assert.match(source, /JUPYTER_RUNTIME_DIR/)
  assert.match(source, /ipykernel/)
  assert.match(source, /finally:/)
  assert.doesNotMatch(source, /pip\s+install(?![\s\S]{0,120}--no-index)/)
})

test('environment and source drift fail before candidate transaction work', () => {
  const environmentDrift = runProbe([
    'import tempfile',
    'contract = module.read_strict_json(module.ENVIRONMENT_CONTRACT_PATH)',
    'contract["execution"]["jobCount"] = 1',
    'with tempfile.TemporaryDirectory() as directory:',
    '    path = pathlib.Path(directory) / "environment.json"',
    '    path.write_bytes(module.strict_json_bytes(contract))',
    '    module.validate_environment_contract(contract_path=path)',
  ].join('\n'))
  assert.notEqual(environmentDrift.status, 0)
  assert.match(environmentDrift.stderr, /environment|execution|drift/i)

  for (const mutation of [
    'contract["source"]["sha256"] = "0" * 64',
    'contract["split"]["index"] = 1',
    'contract["features"]["order"] = list(reversed(contract["features"]["order"]))',
  ]) {
    const sourceDrift = runProbe([
      'original_run_command = module.run_command',
      'contract = json.loads(original_run_command(["node", str(module.SOURCE_BRIDGE_PATH)]).stdout)',
      mutation,
      'class Completed:',
      '    stdout = json.dumps(contract)',
      'module.run_command = lambda *args, **kwargs: Completed()',
      'module.verify_source_contract()',
    ].join('\n'))
    assert.notEqual(sourceDrift.status, 0)
    assert.match(sourceDrift.stderr, /source|split|feature|drift/i)
  }
})

test('kernel shell declares two independent clean-kernel locale jobs', () => {
  const snapshot = readContractSnapshot()
  assert.equal(snapshot.executionJobs.length, 2)
  assert.deepEqual(
    snapshot.executionJobs.map((job: { locale: string }) => job.locale),
    ['zh-CN', 'en'],
  )
  assert.equal(
    new Set(snapshot.executionJobs.map((job: { proofId: string }) => job.proofId)).size,
    2,
  )
  for (const job of snapshot.executionJobs) {
    assert.equal(job.freshKernel, true)
    assert.equal(job.executionCountStartsAt, 1)
    assert.equal(job.allowErrors, false)
    assert.equal(job.timeoutSeconds, 180)
    assert.equal(job.recordTiming, false)
    assert.equal(job.workingDirectory, 'notebooks/linear-regression')
    assert.equal(job.kernelNamePublished, false)
    assert.equal(job.stripWidgetState, true)
  }
})

test('locale parity shell shares ordered code while localizing complete markdown', () => {
  const snapshot = readContractSnapshot()
  const zh = snapshot.blueprints['zh-CN']
  const en = snapshot.blueprints.en
  assert.deepEqual(
    zh.map((cell: { id: string }) => cell.id),
    en.map((cell: { id: string }) => cell.id),
  )
  assert.deepEqual(
    zh.filter((cell: { kind: string }) => cell.kind === 'code'),
    en.filter((cell: { kind: string }) => cell.kind === 'code'),
  )
  assert.notDeepEqual(
    zh.filter((cell: { kind: string }) => cell.kind === 'markdown'),
    en.filter((cell: { kind: string }) => cell.kind === 'markdown'),
  )
  assert.equal(zh.some((cell: { source: string }) => /正规方程/.test(cell.source)), true)
  assert.equal(en.some((cell: { source: string }) => /normal equation/.test(cell.source)), true)
  for (const blueprint of [zh, en]) {
    const text = blueprint.map((cell: { source: string }) => cell.source).join('\n')
    assert.match(text, /X_tilde\s*=\s*\[1,\s*X\]/)
    assert.match(text, /pinv\(X_tilde\)/)
    assert.match(text, /theta\[0\]\s*=\s*b/)
    assert.match(text, /theta\[1:\]\s*=\s*w/)
    assert.match(text, /numpy\.linalg\.lstsq/)
    assert.match(text, /gradient descent/i)
    assert.match(text, /scikit-learn/)
  }
})

test('teaching role shell freezes all five deterministic IDs and selection rules', () => {
  const snapshot = readContractSnapshot()
  assert.deepEqual(snapshot.teachingRows, TEACHING_ROW_ROLES)
})

test('safety shell rejects network shell install HTML widget iframe and unsafe source', () => {
  for (const unsafe of [
    'import requests',
    'import urllib.request',
    'DATA = "https://example.com/data.csv"',
    '!pip install numpy',
    'import subprocess; subprocess.run(["sh"])',
    'display(HTML("<script>alert(1)</script>"))',
    'import ipywidgets',
    '<iframe src="https://example.com"></iframe>',
  ]) {
    const injection = runProbe([
      `bad = module.NotebookCodeCell("bad-cell", ${JSON.stringify(unsafe)})`,
      'module.validate_notebook_code_cells((bad,))',
    ].join('\n'))
    assert.notEqual(injection.status, 0, unsafe)
    assert.match(injection.stderr, /forbidden|unsafe|network|shell|HTML|widget|iframe/i)
  }
})

test('staging shell rejects public roots remote roots and every subset selector', () => {
  const publicAttempt = runGenerator([
    '--prepare-candidates',
    '--offline',
    '--staging-root',
    resolve(root, 'public/notebooks/linear-regression'),
  ])
  assert.notEqual(publicAttempt.status, 0)
  assert.match(publicAttempt.stderr, /public|staging/i)

  const remoteAttempt = runGenerator([
    '--prepare-candidates',
    '--offline',
    '--staging-root',
    'https://example.com/phase-27',
  ])
  assert.notEqual(remoteAttempt.status, 0)
  assert.match(remoteAttempt.stderr, /remote|staging/i)

  for (const selector of [
    ['--topic', 'bike-linear-regression'],
    ['--locale', 'zh-CN'],
    ['--file', 'coefficients.csv'],
  ]) {
    const attempt = runGenerator([
      '--prepare-candidates',
      '--offline',
      '--staging-root',
      stagingRoot,
      ...selector,
    ])
    assert.notEqual(attempt.status, 0)
    assert.match(attempt.stderr, /partial|selector|topic|locale|file/i)
  }
  assert.equal(existsSync(resolve(root, 'public/notebooks/linear-regression')), false)
})

test('cleanup shell removes stale bytes and injected transaction failures', () => {
  const temporaryRoot = mkdtempSync(resolve(tmpdir(), 'phase-27-transaction-'))
  try {
    const probe = runProbe([
      'root = pathlib.Path(sys.argv[2])',
      'module.validate_candidate_staging_root = lambda path: path.resolve()',
      '(root / "stale.txt").write_text("stale", encoding="utf-8")',
      'try:',
      '    with module.CandidateTransaction(root) as transaction:',
      '        print(json.dumps({"staleExists": (transaction.root / "stale.txt").exists()}))',
      '        (transaction.root / "partial.txt").write_text("partial", encoding="utf-8")',
      '        raise module.Phase27Error("injected candidate failure")',
      'except module.Phase27Error:',
      '    pass',
      'print(json.dumps({"rootExists": root.exists()}))',
    ].join('\n'), [temporaryRoot])
    assert.equal(probe.status, 0, probe.stderr)
    const lines = probe.stdout.trim().split('\n').map((line) => JSON.parse(line))
    assert.deepEqual(lines, [
      { staleExists: false },
      { rootExists: false },
    ])
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true })
  }
})

test('candidate verification shell fails closed on missing unexpected or partial inventory', () => {
  const probe = runProbe([
    'import tempfile',
    'with tempfile.TemporaryDirectory() as directory:',
    '    root = pathlib.Path(directory)',
    '    try:',
    '        module.verify_candidate_inventory(root, enforce_staging_root=False)',
    '    except module.Phase27Error as error:',
    '        print(str(error))',
    '    else:',
    '        raise RuntimeError("missing inventory was accepted")',
    '    for relative_path in module.EXPECTED_CANDIDATE_FILES:',
    '        path = root / relative_path',
    '        path.parent.mkdir(parents=True, exist_ok=True)',
    '        path.write_text("placeholder", encoding="utf-8")',
    '    extra = root / "notebooks/linear-regression/unexpected.txt"',
    '    extra.write_text("unexpected", encoding="utf-8")',
    '    try:',
    '        module.verify_candidate_inventory(root, enforce_staging_root=False)',
    '    except module.Phase27Error as error:',
    '        print(str(error))',
    '    else:',
    '        raise RuntimeError("unexpected inventory was accepted")',
  ].join('\n'))
  assert.equal(probe.status, 0, probe.stderr)
  assert.match(probe.stdout, /inventory|missing|nine|9/i)
  assert.match(probe.stdout, /unexpected\.txt/)
})

test('numerical contract emits complete coefficient GD and residual tables [owner Plan 27-03]', () => {
  const help = runGenerator(['--help'])
  assert.equal(help.status, 0, help.stderr)
  assert.match(help.stdout, /--prepare-data-candidates/)

  const summary = readCandidateJson(
    'notebooks/linear-regression/linear-regression-summary.json',
  )
  assert.equal(summary.contractVersion, 'linear-regression-phase-27-summary-v1')
  assert.deepEqual(summary.source, {
    path: 'datasets/python-data-tools/bike-sharing-hour.csv',
    sha256: 'e03de4ee4ef4dc376ac6e04bf829673c6269e8eba5c60fa121640fa2f829504f',
    rows: 17_379,
    target: 'cnt',
    targetRelationship: 'cnt = casual + registered',
  })
  assert.deepEqual(summary.features, {
    order: EXPECTED_FEATURE_ORDER,
    continuous: EXPECTED_CONTINUOUS_FEATURES,
    binaryUnscaled: ['workingday'],
    collinearityOnly: ['atemp'],
    leakageExcluded: ['casual', 'registered'],
  })
  assert.equal(summary.split.index, 13_903)
  assert.equal(summary.split.trainRows, 13_903)
  assert.equal(summary.split.testRows, 3_476)
  assert.equal(summary.split.trainEnd.instant, 13_903)
  assert.equal(summary.split.testStart.instant, 13_904)
  assert.deepEqual(summary.preprocessing.standardized, EXPECTED_CONTINUOUS_FEATURES)
  assert.deepEqual(summary.preprocessing.unscaled, ['workingday'])
  closeTo(summary.preprocessing.means.temp, 0.4991699633, 1e-10)
  closeTo(summary.preprocessing.means.hum, 0.6229957563, 1e-10)
  closeTo(summary.preprocessing.means.windspeed, 0.1940965907, 1e-10)
  closeTo(summary.preprocessing.means.hr, 11.5465726822, 1e-10)
  closeTo(summary.preprocessing.scales.temp, 0.1977090288, 1e-10)
  closeTo(summary.preprocessing.scales.hum, 0.1981871966, 1e-10)
  closeTo(summary.preprocessing.scales.windspeed, 0.1230187786, 1e-10)
  closeTo(summary.preprocessing.scales.hr, 6.9119866040, 1e-10)

  assert.deepEqual(summary.optimization.config, {
    initialization: 'zeros',
    learningRate: 0.1,
    maxUpdates: 5_000,
    gradientTolerance: 1e-8,
  })
  assert.equal(summary.optimization.result.updates, 772)
  assert.equal(summary.optimization.result.reason, 'gradient-tolerance')
  assert.ok(summary.optimization.result.gradientNorm <= 1e-8)
  assert.equal(summary.methods.tolerance, 1e-6)
  assert.equal(summary.methods.normalEquation.term.en, 'normal equation')
  assert.equal(summary.methods.normalEquation.term['zh-CN'], '正规方程')
  assert.equal(summary.methods.normalEquation.augmentedDesign, 'X_tilde = [1, X]')
  assert.equal(
    summary.methods.normalEquation.formula,
    'theta = (X_tilde^T X_tilde)^+ X_tilde^T y',
  )
  assert.equal(summary.methods.normalEquation.interceptMapping, 'theta[0] = b')
  assert.equal(summary.methods.normalEquation.weightMapping, 'theta[1:] = w')
  assert.equal(summary.methods.normalEquation.implementation, 'numpy.linalg.lstsq')
  assert.match(summary.methods.normalEquation.rationale, /inverse|求逆/)
  assert.equal(summary.methods.normalEquation.rank, 6)
  assert.ok(summary.methods.normalEquation.conditionNumber > 3.3)
  assert.ok(summary.methods.normalEquation.conditionNumber < 3.4)

  const expectedWeights = [
    62.7238909530,
    -37.1164156021,
    0.8094458662,
    2.3797186778,
    47.9014338433,
  ]
  summary.methods.normalEquation.weights.forEach((value: number, index: number) =>
    closeTo(value, expectedWeights[index]!, 1e-9))
  closeTo(summary.methods.normalEquation.intercept, 173.0103284947, 1e-9)
  assert.ok(summary.methods.agreement.maxCoefficientDelta <= 1e-6)
  assert.ok(summary.methods.agreement.maxPredictionDelta <= 1e-6)
  closeTo(summary.metrics.test.mse, 40_142.538619, 1e-6)
  closeTo(summary.metrics.test.mae, 135.296640, 1e-6)
  closeTo(summary.metrics.test.r2, 0.174252, 1e-6)

  assert.equal(summary.representativeTrainingRow.instant, 11_550)
  assert.equal(summary.representativeTrainingRow.role, 'representative-training-row')
  assert.deepEqual(
    summary.diagnostics.namedCases.map((row: { instant: number }) => row.instant),
    [17_213, 15_628, 14_965, 15_604],
  )
  for (const row of summary.diagnostics.namedCases) {
    closeTo(row.residual, row.prediction - row.actual, 1e-12)
    assert.equal(typeof row.timestamp, 'string')
    assert.equal(typeof row.explanationRole.en, 'string')
    assert.equal(typeof row.explanationRole['zh-CN'], 'string')
  }
  assert.equal(summary.diagnostics.hourlyResiduals.length, 24)
  assert.equal(summary.diagnostics.predictionBins.length, 4)
  assert.equal(summary.diagnostics.collinearity.addedFeature, 'atemp')
  assert.deepEqual(summary.diagnostics.collinearity.unchangedContract, [
    'rows',
    'split',
    'target',
    'base-features',
    'preprocessing',
  ])
  assert.equal(summary.diagnostics.collinearity.ridge.objective, 'mse-plus-l2')
  assert.equal(summary.diagnostics.collinearity.lasso.objective, 'mse-plus-l1')
  assert.equal(summary.diagnostics.log1p.rawTargetObjectiveComparable, false)
  assert.equal(summary.diagnostics.log1p.inverseTransform, 'expm1')

  const trace = readCsvRows(
    'notebooks/linear-regression/gradient-descent-trace.csv',
  )
  assert.equal(trace.length, 773)
  assert.equal(Number(trace[0]!.update), 0)
  assert.equal(Number(trace.at(-1)!.update), 772)
  assert.ok(Number(trace.at(-1)!.gradient_norm) <= 1e-8)
  assert.equal(
    trace.every((row) => Object.values(row).every((value) => Number.isFinite(Number(value)))),
    true,
  )

  const coefficients = readCsvRows(
    'notebooks/linear-regression/coefficients.csv',
  )
  assert.equal(
    new Set(coefficients.map((row) => row.method)).has('numpy-batch-gradient-descent'),
    true,
  )
  assert.equal(
    new Set(coefficients.map((row) => row.method)).has('numpy-lstsq'),
    true,
  )
  assert.equal(
    new Set(coefficients.map((row) => row.method)).has('sklearn-linear-regression'),
    true,
  )
  assert.equal(
    coefficients.every((row) => Number.isFinite(Number(row.coefficient))),
    true,
  )

  const residuals = readCsvRows(
    'notebooks/linear-regression/heldout-residuals.csv',
  )
  assert.equal(residuals.length, 3_476)
  assert.equal(Number(residuals[0]!.instant), 13_904)
  assert.equal(Number(residuals.at(-1)!.instant), 17_379)
  for (const row of residuals) {
    closeTo(
      Number(row.residual),
      Number(row.prediction) - Number(row.actual),
      1e-9,
    )
  }
})
test('candidate verification [27-W0-02] seals independent locale jobs and exact hashes [owner Plan 27-03]', () => {
  const verified = runGenerator([
    '--verify-candidates',
    '--staging-root',
    stagingRoot,
    '--offline',
  ])
  assert.equal(verified.status, 0, verified.stderr)
  assert.match(verified.stdout, /nine-member|9-member|9 member/i)

  const notebookRoot = resolve(stagingRoot, 'notebooks/linear-regression')
  const actual = readdirSync(notebookRoot).sort()
  assert.deepEqual(actual, EXPECTED_CANDIDATE_FILES.map((path) =>
    path.replace('notebooks/linear-regression/', '')).sort())

  const zh = readCandidateJson(
    'notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb',
  )
  const en = readCandidateJson(
    'notebooks/linear-regression/bike-linear-regression.en.ipynb',
  )
  const zhCode = zh.cells
    .filter((cell: { cell_type: string }) => cell.cell_type === 'code')
    .map((cell: { id: string, source: readonly string[] | string }) => ({
      id: cell.id,
      source: cell.source,
    }))
  const enCode = en.cells
    .filter((cell: { cell_type: string }) => cell.cell_type === 'code')
    .map((cell: { id: string, source: readonly string[] | string }) => ({
      id: cell.id,
      source: cell.source,
    }))
  assert.deepEqual(zhCode, enCode)
  assert.notDeepEqual(
    zh.cells.filter((cell: { cell_type: string }) => cell.cell_type === 'markdown'),
    en.cells.filter((cell: { cell_type: string }) => cell.cell_type === 'markdown'),
  )
  for (const notebook of [zh, en]) {
    const codeCells = notebook.cells.filter(
      (cell: { cell_type: string }) => cell.cell_type === 'code',
    )
    assert.deepEqual(
      codeCells.map((cell: { execution_count: number }) => cell.execution_count),
      codeCells.map((_: unknown, index: number) => index + 1),
    )
    assert.equal(
      codeCells.every((cell: { outputs: readonly { output_type: string }[] }) =>
        cell.outputs.every((output) => output.output_type !== 'error')),
      true,
    )
    const completeText = JSON.stringify(notebook)
    assert.match(completeText, /normal equation|正规方程/)
    assert.match(completeText, /X_tilde = \[1, X\]/)
    assert.match(
      completeText,
      /theta = \(X_tilde\^T X_tilde\)\^\+ X_tilde\^T y/,
    )
    assert.match(completeText, /numpy\.linalg\.lstsq/)
    assert.match(completeText, /11550/)
    assert.match(completeText, /17213/)
    assert.match(completeText, /15628/)
    assert.match(completeText, /14965/)
    assert.match(completeText, /15604/)
    assert.doesNotMatch(completeText, /ml-atlas-phase27-[a-f0-9]{16,}/)
    assert.doesNotMatch(completeText, /\/(?:private\/)?(?:tmp|var\/folders)\//)
  }

  const manifest = readCandidateJson(
    'notebooks/linear-regression/output-manifest.json',
  )
  assert.equal(manifest.contractVersion, 'linear-regression-phase-27-candidate-v1')
  assert.equal(manifest.packageComplete, true)
  assert.equal(manifest.publicationAllowed, false)
  assert.deepEqual(manifest.requirements, ['LINR-02', 'LINR-03', 'LINR-04'])
  assert.deepEqual(
    manifest.inventory.map((entry: { path: string }) => entry.path),
    EXPECTED_CANDIDATE_FILES,
  )
  assert.equal(manifest.inventory.length, 9)
  for (const entry of manifest.inventory.slice(0, -1)) {
    const path = resolve(stagingRoot, entry.path)
    assert.equal(entry.bytes, readFileSync(path).byteLength)
    assert.equal(entry.sha256, sha256(path))
  }
  assert.deepEqual(
    manifest.executionProofs.map((proof: { proofId: string }) => proof.proofId),
    [
      'clean-kernel-bike-linear-regression-zh-CN',
      'clean-kernel-bike-linear-regression-en',
    ],
  )
  assert.equal(new Set(
    manifest.executionProofs.map((proof: { proofId: string }) => proof.proofId),
  ).size, 2)
  assert.equal(
    manifest.executionProofs[0].codeSha256,
    manifest.executionProofs[1].codeSha256,
  )
  assert.equal(
    manifest.executionProofs[0].normalizedOutputSha256,
    manifest.executionProofs[1].normalizedOutputSha256,
  )
  assert.deepEqual(manifest.contract.features.order, EXPECTED_FEATURE_ORDER)
  assert.equal(manifest.contract.split.index, 13_903)
  assert.equal(manifest.contract.residualSign, 'prediction - actual')
  assert.equal(manifest.contract.methodTolerance, 1e-6)
  assert.equal(manifest.selectionRuleVersion, 'bike-linear-regression-teaching-rows-v1')
  assert.deepEqual(manifest.teachingRows, TEACHING_ROW_ROLES)
  assert.deepEqual(manifest.resolvedInstants, [
    11_550,
    17_213,
    15_628,
    14_965,
    15_604,
  ])
  assert.equal(manifest.environment.path, 'notebooks/linear-regression/environment.json')
  assert.equal(manifest.rerun.command, [
    'python3 scripts/linear-regression/build-phase-27-assets.py',
    '--prepare-candidates',
    '--staging-root .cache/linear-regression/phase-27-staging',
    '--offline',
  ].join(' '))
})

test('candidate verification [27-W0-02] rejects changed contract code output and inventory [owner Plan 27-03]', () => {
  const mutations = [
    {
      name: 'changed summary source hash',
      path: 'notebooks/linear-regression/linear-regression-summary.json',
      mutate(value: Record<string, any>) {
        value.source.sha256 = '0'.repeat(64)
      },
    },
    {
      name: 'changed method tolerance',
      path: 'notebooks/linear-regression/linear-regression-summary.json',
      mutate(value: Record<string, any>) {
        value.methods.tolerance = 1e-3
      },
    },
    {
      name: 'changed teaching selection',
      path: 'notebooks/linear-regression/linear-regression-summary.json',
      mutate(value: Record<string, any>) {
        value.diagnostics.namedCases.reverse()
      },
    },
    {
      name: 'changed notebook code',
      path: 'notebooks/linear-regression/bike-linear-regression.en.ipynb',
      mutate(value: Record<string, any>) {
        value.cells.find((cell: Record<string, any>) =>
          cell.cell_type === 'code').source = ['FEATURE_ORDER = ()\n']
      },
    },
    {
      name: 'changed selection filter and tie-break',
      path: 'notebooks/linear-regression/output-manifest.json',
      mutate(value: Record<string, any>) {
        value.teachingRows[2].rule = 'hr 6-9, highest instant tie-break'
      },
    },
  ]

  for (const mutation of mutations) {
    const temporaryRoot = mkdtempSync(resolve(tmpdir(), 'phase-27-corruption-'))
    try {
      cpSync(stagingRoot, temporaryRoot, { recursive: true })
      const path = resolve(temporaryRoot, mutation.path)
      const value = JSON.parse(readFileSync(path, 'utf8'))
      mutation.mutate(value)
      writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
      const probe = runProbe([
        'root = pathlib.Path(sys.argv[2])',
        'module.verify_candidates(root, enforce_staging_root=False)',
      ].join('\n'), [temporaryRoot])
      assert.notEqual(probe.status, 0, mutation.name)
      assert.match(probe.stderr, /drift|hash|source|tolerance|selection|code|candidate/i)
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  }

  const temporaryRoot = mkdtempSync(resolve(tmpdir(), 'phase-27-inventory-'))
  try {
    cpSync(stagingRoot, temporaryRoot, { recursive: true })
    writeFileSync(
      resolve(temporaryRoot, 'notebooks/linear-regression/unexpected.txt'),
      'unexpected',
      'utf8',
    )
    const probe = runProbe([
      'root = pathlib.Path(sys.argv[2])',
      'module.verify_candidates(root, enforce_staging_root=False)',
    ].join('\n'), [temporaryRoot])
    assert.notEqual(probe.status, 0)
    assert.match(probe.stderr, /inventory|unexpected/i)
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true })
  }
})
test('publication accepts exactly one complete-package path and preserves frozen candidate provenance', () => {
  const help = runGenerator(['--help'])
  assert.equal(help.status, 0, help.stderr)
  assert.match(help.stdout, /--publish-candidates/)
  assert.doesNotMatch(help.stdout, /--publish-topic|--publish-locale|--publish-file/)

  for (const selector of [
    ['--topic', 'bike-linear-regression'],
    ['--locale', 'zh-CN'],
    ['--file', 'coefficients.csv'],
  ]) {
    const attempt = runGenerator([
      '--publish-candidates',
      '--staging-root',
      stagingRoot,
      ...selector,
    ])
    assert.notEqual(attempt.status, 0)
    assert.match(attempt.stderr, /partial|selector|topic|locale|file/i)
  }

  const manifest = readCandidateJson(
    'notebooks/linear-regression/output-manifest.json',
  )
  const source = readFileSync(generatorPath, 'utf8')
  assert.equal(manifest.generator.sha256.length, 64)
  assert.notEqual(manifest.generator.sha256, sha256(generatorPath))
  assert.match(source, /VALIDATED_CANDIDATE_GENERATOR_SHA256/)
  assert.match(source, new RegExp(manifest.generator.sha256))
})

test('publication succeeds from an absent target as one complete directory move', () => {
  const temporaryDirectory = mkdtempSync(
    resolve(tmpdir(), 'phase-27-absent-target-'),
  )
  try {
    const fixturePublicRoot = resolve(temporaryDirectory, 'public')
    mkdirSync(fixturePublicRoot, { recursive: true })
    const candidateBefore = treeSnapshot(candidatePackageRoot)
    const published = publishFixture(fixturePublicRoot)
    assert.equal(published.status, 0, published.stderr)
    const result = JSON.parse(published.stdout)
    assert.equal(result.inventoryCount, 9)
    assert.equal(result.priorTarget, 'absent')
    assert.equal(result.backupCreated, false)

    const target = resolve(fixturePublicRoot, publicPackageRelativePath)
    assert.deepEqual(treeSnapshot(target), candidateBefore)
    assert.deepEqual(
      readdirSync(target).sort(),
      [...EXPECTED_PUBLIC_FILES].sort(),
    )
    assert.deepEqual(treeSnapshot(candidatePackageRoot), candidateBefore)
    assert.deepEqual(publicationResidue(fixturePublicRoot), [])
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

test('replacement succeeds from a seeded existing target without partial visibility or residue', () => {
  const temporaryDirectory = mkdtempSync(
    resolve(tmpdir(), 'phase-27-seeded-replacement-'),
  )
  try {
    const fixturePublicRoot = resolve(temporaryDirectory, 'public')
    const target = seedCompletePublicTarget(fixturePublicRoot)
    const seeded = treeSnapshot(target)
    assert.notDeepEqual(seeded, treeSnapshot(candidatePackageRoot))

    const published = publishFixture(fixturePublicRoot)
    assert.equal(published.status, 0, published.stderr)
    const result = JSON.parse(published.stdout)
    assert.equal(result.inventoryCount, 9)
    assert.equal(result.priorTarget, 'seeded-existing-target')
    assert.equal(result.backupCreated, true)
    assert.deepEqual(treeSnapshot(target), treeSnapshot(candidatePackageRoot))
    assert.deepEqual(
      readdirSync(target).sort(),
      [...EXPECTED_PUBLIC_FILES].sort(),
    )
    assert.deepEqual(publicationResidue(fixturePublicRoot), [])
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

test('rollback restores absent or seeded targets after every transaction-stage failure and interrupt', () => {
  const failurePoints = [
    'candidate-verification',
    'temporary-preparation',
    'backup-move',
    'target-move',
    'post-move-verification',
    'final-verification',
    'cleanup',
    'interrupt',
  ]
  for (const fixture of ['absent target', 'seeded existing target'] as const) {
    for (const failurePoint of failurePoints) {
      const temporaryDirectory = mkdtempSync(
        resolve(
          tmpdir(),
          `phase-27-${fixture.replaceAll(' ', '-')}-${failurePoint}-`,
        ),
      )
      try {
        const fixturePublicRoot = resolve(temporaryDirectory, 'public')
        mkdirSync(fixturePublicRoot, { recursive: true })
        const target = resolve(fixturePublicRoot, publicPackageRelativePath)
        if (fixture === 'seeded existing target') {
          seedCompletePublicTarget(fixturePublicRoot)
        }
        const before = treeSnapshot(target)
        const failed = publishFixture(fixturePublicRoot, failurePoint)
        assert.notEqual(failed.status, 0, `${fixture}: ${failurePoint}`)
        assert.match(
          failed.stderr,
          /injected publication (?:failure|interrupt)/i,
          `${fixture}: ${failurePoint}`,
        )
        assert.deepEqual(
          treeSnapshot(target),
          before,
          `${fixture}: ${failurePoint}`,
        )
        assert.deepEqual(
          publicationResidue(fixturePublicRoot),
          [],
          `${fixture}: ${failurePoint}`,
        )
      } finally {
        rmSync(temporaryDirectory, { recursive: true, force: true })
      }
    }
  }
})

test('publication lock contention fails without changing seeded public bytes or modes', () => {
  const temporaryDirectory = mkdtempSync(
    resolve(tmpdir(), 'phase-27-lock-contention-'),
  )
  try {
    const fixturePublicRoot = resolve(temporaryDirectory, 'public')
    const target = seedCompletePublicTarget(fixturePublicRoot)
    const before = treeSnapshot(target)
    const lockPath = resolve(fixturePublicRoot, publicationLockName)
    writeFileSync(lockPath, 'held-by-test\n', { mode: 0o600 })
    const failed = publishFixture(fixturePublicRoot)
    assert.notEqual(failed.status, 0)
    assert.match(failed.stderr, /lock|another.*publication/i)
    assert.deepEqual(treeSnapshot(target), before)
    assert.deepEqual(publicationResidue(fixturePublicRoot), [
      publicationLockName,
    ])
    rmSync(lockPath)
    assert.deepEqual(publicationResidue(fixturePublicRoot), [])
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

test('publication corruption matrix fails before public mutation and removes private residue', () => {
  const cases = [
    {
      name: 'source SHA',
      mutation: [
        'path = candidate / "notebooks/linear-regression/linear-regression-summary.json"',
        'value = module.read_strict_json(path)',
        'value["source"]["sha256"] = "0" * 64',
        'path.write_bytes(module.strict_json_bytes(value))',
      ],
      reseal: 'notebooks/linear-regression/linear-regression-summary.json',
    },
    {
      name: 'row order',
      mutation: [
        'path = candidate / "notebooks/linear-regression/heldout-residuals.csv"',
        'rows = path.read_text(encoding="utf-8").splitlines()',
        'rows[2], rows[3] = rows[3], rows[2]',
        'path.write_text("\\n".join(rows) + "\\n", encoding="utf-8")',
      ],
      reseal: 'notebooks/linear-regression/heldout-residuals.csv',
    },
    {
      name: 'split boundary',
      mutation: [
        'path = candidate / "notebooks/linear-regression/linear-regression-summary.json"',
        'value = module.read_strict_json(path)',
        'value["split"]["index"] = 1',
        'path.write_bytes(module.strict_json_bytes(value))',
      ],
      reseal: 'notebooks/linear-regression/linear-regression-summary.json',
    },
    {
      name: 'leakage feature',
      mutation: [
        'path = candidate / "notebooks/linear-regression/linear-regression-summary.json"',
        'value = module.read_strict_json(path)',
        'value["features"]["order"].append("casual")',
        'path.write_bytes(module.strict_json_bytes(value))',
      ],
      reseal: 'notebooks/linear-regression/linear-regression-summary.json',
    },
    {
      name: 'workingday scaling',
      mutation: [
        'path = candidate / "notebooks/linear-regression/linear-regression-summary.json"',
        'value = module.read_strict_json(path)',
        'value["preprocessing"]["standardized"].append("workingday")',
        'value["preprocessing"]["unscaled"] = []',
        'path.write_bytes(module.strict_json_bytes(value))',
      ],
      reseal: 'notebooks/linear-regression/linear-regression-summary.json',
    },
    {
      name: 'residual sign',
      mutation: [
        'path = candidate / "notebooks/linear-regression/linear-regression-summary.json"',
        'value = module.read_strict_json(path)',
        'value["diagnostics"]["residualSign"] = "actual - prediction"',
        'path.write_bytes(module.strict_json_bytes(value))',
      ],
      reseal: 'notebooks/linear-regression/linear-regression-summary.json',
    },
    {
      name: 'method tolerance',
      mutation: [
        'path = candidate / "notebooks/linear-regression/linear-regression-summary.json"',
        'value = module.read_strict_json(path)',
        'value["methods"]["tolerance"] = 0.001',
        'path.write_bytes(module.strict_json_bytes(value))',
      ],
      reseal: 'notebooks/linear-regression/linear-regression-summary.json',
    },
    {
      name: 'locked metric',
      mutation: [
        'path = candidate / "notebooks/linear-regression/linear-regression-summary.json"',
        'value = module.read_strict_json(path)',
        'value["metrics"]["test"]["mse"] += 1',
        'path.write_bytes(module.strict_json_bytes(value))',
      ],
      reseal: 'notebooks/linear-regression/linear-regression-summary.json',
    },
    {
      name: 'CSV shape',
      mutation: [
        'path = candidate / "notebooks/linear-regression/coefficients.csv"',
        'rows = path.read_text(encoding="utf-8").splitlines()',
        'rows[0] += ",unexpected"',
        'path.write_text("\\n".join(rows) + "\\n", encoding="utf-8")',
      ],
      reseal: 'notebooks/linear-regression/coefficients.csv',
    },
    {
      name: 'environment identity',
      mutation: [
        'path = candidate / "notebooks/linear-regression/environment.json"',
        'value = module.read_strict_json(path)',
        'value["packages"]["numpy"] = "0.0.0"',
        'path.write_bytes(module.strict_json_bytes(value))',
      ],
      reseal: 'notebooks/linear-regression/environment.json',
    },
    {
      name: 'generator identity',
      mutation: [
        'manifest_path = candidate / "notebooks/linear-regression/output-manifest.json"',
        'manifest = module.read_strict_json(manifest_path)',
        'manifest["generator"]["sha256"] = "0" * 64',
        'manifest["canonicalPayloadSha256"] = None',
        'manifest["canonicalPayloadSha256"] = module._sha256_json(manifest)',
        'manifest_path.write_bytes(module.strict_json_bytes(manifest))',
      ],
    },
    {
      name: 'code output parity',
      mutation: [
        'path = candidate / "notebooks/linear-regression/bike-linear-regression.en.ipynb"',
        'value = module.read_strict_json(path)',
        'cell = next(item for item in value["cells"] if item["cell_type"] == "code")',
        'cell["source"] = ["FEATURE_ORDER = ()\\n"]',
        'path.write_bytes(module.strict_json_bytes(value))',
      ],
      reseal: 'notebooks/linear-regression/bike-linear-regression.en.ipynb',
    },
    {
      name: 'file hash',
      mutation: [
        'path = candidate / "notebooks/linear-regression/coefficients.csv"',
        'path.write_bytes(path.read_bytes() + b"tampered\\n")',
      ],
    },
    {
      name: 'unexpected file',
      mutation: [
        'path = candidate / "notebooks/linear-regression/unexpected.txt"',
        'path.write_text("unexpected\\n", encoding="utf-8")',
      ],
    },
    {
      name: 'missing file',
      mutation: [
        'path = candidate / "notebooks/linear-regression/coefficients.csv"',
        'path.unlink()',
      ],
    },
    {
      name: 'nonfinite JSON',
      mutation: [
        'path = candidate / "notebooks/linear-regression/linear-regression-summary.json"',
        'value = module.read_strict_json(path)',
        'value["metrics"]["test"]["mse"] = float("nan")',
        'path.write_text(json.dumps(value, allow_nan=True), encoding="utf-8")',
      ],
    },
  ]

  for (const corruption of cases) {
    const temporaryDirectory = mkdtempSync(
      resolve(tmpdir(), `phase-27-corrupt-${corruption.name.replaceAll(' ', '-')}-`),
    )
    try {
      const copiedCandidate = resolve(temporaryDirectory, 'candidate')
      const fixturePublicRoot = resolve(temporaryDirectory, 'public')
      cpSync(stagingRoot, copiedCandidate, { recursive: true })
      const target = seedCompletePublicTarget(fixturePublicRoot)
      const before = treeSnapshot(target)
      const reseal = corruption.reseal === undefined
        ? []
        : [
            'manifest_path = candidate / "notebooks/linear-regression/output-manifest.json"',
            'manifest = module.read_strict_json(manifest_path)',
            `member = candidate / ${JSON.stringify(corruption.reseal)}`,
            `entry = next(item for item in manifest["inventory"] if item["path"] == ${JSON.stringify(corruption.reseal)})`,
            'entry["sha256"] = module.sha256_file(member)',
            'entry["bytes"] = member.stat().st_size',
            'manifest["canonicalPayloadSha256"] = None',
            'manifest["canonicalPayloadSha256"] = module._sha256_json(manifest)',
            'manifest_path.write_bytes(module.strict_json_bytes(manifest))',
          ]
      const failed = runProbe([
        'candidate = pathlib.Path(sys.argv[2])',
        ...corruption.mutation,
        ...reseal,
        'module.publish_candidates_atomically(',
        '    candidate,',
        '    public_root=pathlib.Path(sys.argv[3]),',
        '    enforce_staging_root=False,',
        '    enforce_public_root=False,',
        ')',
      ].join('\n'), [copiedCandidate, fixturePublicRoot])
      assert.notEqual(failed.status, 0, corruption.name)
      assert.match(
        failed.stderr,
        /candidate|code|CSV|environment|feature|generator|hash|inventory|metric|non-finite|residual|row|scal|source|split|tolerance|unexpected/i,
        corruption.name,
      )
      assert.deepEqual(treeSnapshot(target), before, corruption.name)
      assert.deepEqual(publicationResidue(fixturePublicRoot), [], corruption.name)
    } finally {
      rmSync(temporaryDirectory, { recursive: true, force: true })
    }
  }
})

test('public inventory public hash strict JSON CSV and parity lock the exact nine-member generation', () => {
  const target = resolve(publicRoot, publicPackageRelativePath)
  assert.deepEqual(
    readdirSync(target).sort(),
    [...EXPECTED_PUBLIC_FILES].sort(),
  )
  assert.deepEqual(treeSnapshot(target), treeSnapshot(candidatePackageRoot))
  assert.deepEqual(publicationResidue(publicRoot), [])

  const manifest = readPublicJson(
    'notebooks/linear-regression/output-manifest.json',
  )
  assert.equal(manifest.packageComplete, true)
  assert.equal(manifest.publicationAllowed, false)
  assert.equal(manifest.inventory.length, 9)
  assert.equal(
    manifest.generator.sha256,
    'c7220cb2c10bc73cfe1ec68de023e0f64e873c44218dc1692e31ffbd8b0e5047',
  )
  for (const entry of manifest.inventory) {
    const publishedPath = resolve(publicRoot, entry.path)
    assert.equal(existsSync(publishedPath), true, entry.path)
    if (entry.selfHashExcluded === true) continue
    assert.equal(sha256(publishedPath), entry.sha256, entry.path)
    assert.equal(statSync(publishedPath).size, entry.bytes, entry.path)
    assert.deepEqual(
      readFileSync(publishedPath),
      readFileSync(resolve(stagingRoot, entry.path)),
      entry.path,
    )
  }

  for (const name of [
    'bike-linear-regression.zh-CN.ipynb',
    'bike-linear-regression.en.ipynb',
    'linear-regression-summary.json',
    'environment.json',
    'output-manifest.json',
  ]) {
    assert.doesNotThrow(() =>
      readPublicJson(`notebooks/linear-regression/${name}`))
  }

  const zh = readPublicJson(
    'notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb',
  )
  const en = readPublicJson(
    'notebooks/linear-regression/bike-linear-regression.en.ipynb',
  )
  const normalized = (notebook: Record<string, any>) =>
    notebook.cells
      .filter((cell: Record<string, any>) => cell.cell_type === 'code')
      .map((cell: Record<string, any>) => ({
        id: cell.id,
        source: cell.source,
        outputs: cell.outputs,
      }))
  assert.deepEqual(normalized(zh), normalized(en))
  const executableCode = normalized(en)
    .flatMap((cell: { source: string[] | string }) => cell.source)
    .join('\n')
  assert.doesNotMatch(
    executableCode,
    /archive\.ics\.uci\.edu|https?:\/\/|requests|urllib|pip install/i,
  )

  const residualLines = readFileSync(
    resolve(target, 'heldout-residuals.csv'),
    'utf8',
  ).trim().split(/\r?\n/)
  assert.equal(residualLines.length, 3_477)
  assert.equal(
    residualLines[0],
    'instant,timestamp,hr,actual,prediction,residual',
  )
  residualLines.slice(1).forEach((line, index) => {
    const [instant, , , actual, prediction, residual] = line.split(',')
    assert.equal(Number(instant), 13_904 + index)
    closeTo(
      Number(residual),
      Number(prediction) - Number(actual),
      1e-9,
    )
  })

  assert.equal(
    readFileSync(resolve(target, 'gradient-descent-trace.csv'), 'utf8')
      .trim().split(/\r?\n/).length,
    774,
  )
  assert.equal(
    readFileSync(resolve(target, 'coefficients.csv'), 'utf8')
      .trim().split(/\r?\n/)[0],
    'method,space,feature,coefficient',
  )
})

test.todo('offline rerun [27-W0-02] leaves repository bytes and mtimes unchanged [owner Plan 27-04]')
test.todo('base paths [27-W0-02] resolve every public member for root and Pages [owner Plan 27-04]')
