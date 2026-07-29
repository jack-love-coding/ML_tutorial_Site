import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import test from 'node:test'

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
  assert.doesNotMatch(help.stdout, /--publish-candidates|--check/)
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
test.todo('candidate verification [27-W0-02] rejects missing unexpected and corrupted members [owner Plan 27-03]')
test.todo('publication [27-W0-02] accepts only the complete nine-member package [owner Plan 27-04]')
test.todo('rollback [27-W0-02] restores absent or seeded public targets byte-for-byte [owner Plan 27-04]')
test.todo('offline rerun [27-W0-02] leaves repository bytes and mtimes unchanged [owner Plan 27-04]')
test.todo('base paths [27-W0-02] resolve every public member for root and Pages [owner Plan 27-04]')
