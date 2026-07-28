import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')
const generatorPath = resolve(root, 'scripts/loss-functions/build-phase-26-assets.py')
const stagingRoot = resolve(root, '.cache/loss-functions/phase-26-staging')
const requirementsPath = resolve(root, 'scripts/loss-functions/requirements.txt')
const environmentContractPath = resolve(root, 'scripts/loss-functions/environment-contract.json')
const numericalRequirementsPath = resolve(root, 'public/notebooks/numerical-methods/requirements.txt')
const numericalWheelCache = resolve(root, '.cache/numerical-methods/batch-4-wheelhouse')

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
    'spec = importlib.util.spec_from_file_location("phase26_assets", generator_path)',
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

test('candidate inventory is complete and indivisible', () => {
  const snapshot = readContractSnapshot()
  assert.deepEqual(snapshot.inventory.paths, [
    'datasets/loss-functions/lade-delivery-jilin.csv',
    'datasets/loss-functions/lade-delivery-jilin-manifest.json',
    'datasets/loss-functions/secom-manufacturing.csv',
    'datasets/loss-functions/secom-manufacturing-manifest.json',
    'datasets/loss-functions/ATTRIBUTION.md',
    'notebooks/loss-functions/delivery-losses.zh-CN.ipynb',
    'notebooks/loss-functions/delivery-losses.en.ipynb',
    'notebooks/loss-functions/manufacturing-bce-gradients.zh-CN.ipynb',
    'notebooks/loss-functions/manufacturing-bce-gradients.en.ipynb',
    'notebooks/loss-functions/outputs/regression-loss-summary.json',
    'notebooks/loss-functions/outputs/bce-gradient-summary.json',
    'notebooks/loss-functions/outputs/delivery-losses.png',
    'notebooks/loss-functions/outputs/manufacturing-bce-gradients.png',
    'notebooks/loss-functions/requirements.txt',
    'notebooks/loss-functions/environment.json',
    'notebooks/loss-functions/outputs/manifest.json',
  ])
  assert.deepEqual(snapshot.inventory.topicIds, [
    'delivery-losses',
    'manufacturing-bce-gradients',
  ])
  assert.deepEqual(snapshot.inventory.locales, ['zh-CN', 'en'])
  assert.equal(snapshot.inventory.partialSelectionAllowed, false)
  assert.equal(snapshot.inventory.publicationAllowed, false)
})

test('shared code and locale dictionaries produce paired notebooks with exact code parity', () => {
  const snapshot = readContractSnapshot()
  for (const topicId of ['delivery-losses', 'manufacturing-bce-gradients']) {
    const topic = snapshot.topics[topicId]
    assert.ok(topic)
    assert.ok(topic.codeCells.length >= 3)
    assert.deepEqual(Object.keys(topic.markdownByLocale).sort(), ['en', 'zh-CN'])
    assert.deepEqual(
      Object.keys(topic.markdownByLocale['zh-CN']).sort(),
      Object.keys(topic.markdownByLocale.en).sort(),
    )

    const zh = topic.blueprints['zh-CN']
    const en = topic.blueprints.en
    assert.deepEqual(zh.map((cell: { id: string }) => cell.id), en.map((cell: { id: string }) => cell.id))
    assert.deepEqual(
      zh.filter((cell: { kind: string }) => cell.kind === 'code'),
      en.filter((cell: { kind: string }) => cell.kind === 'code'),
    )
    assert.notDeepEqual(
      zh.filter((cell: { kind: string }) => cell.kind === 'markdown').map((cell: { source: string }) => cell.source),
      en.filter((cell: { kind: string }) => cell.kind === 'markdown').map((cell: { source: string }) => cell.source),
    )
  }
})

test('locale jobs require four distinct fresh kernel proof records', () => {
  const snapshot = readContractSnapshot()
  assert.equal(snapshot.executionJobs.length, 4)
  assert.deepEqual(
    snapshot.executionJobs.map((job: { topicId: string, locale: string }) => [job.topicId, job.locale]),
    [
      ['delivery-losses', 'zh-CN'],
      ['delivery-losses', 'en'],
      ['manufacturing-bce-gradients', 'zh-CN'],
      ['manufacturing-bce-gradients', 'en'],
    ],
  )
  assert.equal(
    new Set(snapshot.executionJobs.map((job: { proofId: string }) => job.proofId)).size,
    4,
  )
  for (const job of snapshot.executionJobs) {
    assert.equal(job.freshKernel, true)
    assert.equal(job.executionCountStartsAt, 1)
    assert.equal(job.allowErrors, false)
  }
})

test('staging candidate modes reject public roots and partial locale or topic selectors', () => {
  const help = runGenerator(['--help'])
  assert.equal(help.status, 0, help.stderr)
  assert.match(help.stdout, /--prepare-candidates/)
  assert.match(help.stdout, /--verify-candidates/)

  const publicRoot = resolve(root, 'public/phase-26-candidate-test')
  const publicAttempt = runGenerator([
    '--prepare-candidates',
    '--offline',
    '--staging-root',
    publicRoot,
  ])
  assert.notEqual(publicAttempt.status, 0)
  assert.match(publicAttempt.stderr, /public|staging/i)
  assert.equal(existsSync(publicRoot), false)
  rmSync(publicRoot, { recursive: true, force: true })

  for (const selector of [
    ['--topic', 'delivery-losses'],
    ['--locale', 'zh-CN'],
  ]) {
    const partialAttempt = runGenerator([
      '--prepare-candidates',
      '--offline',
      '--staging-root',
      stagingRoot,
      ...selector,
    ])
    assert.notEqual(partialAttempt.status, 0)
    assert.match(partialAttempt.stderr, /partial|selector|topic|locale/i)
  }

  const exactRootProbe = runProbe(
    'module.validate_candidate_staging_root(pathlib.Path(sys.argv[2])); print("accepted")',
    [stagingRoot],
  )
  assert.equal(exactRootProbe.status, 0, exactRootProbe.stderr)
  assert.equal(exactRootProbe.stdout.trim(), 'accepted')
})

test('network shell HTML and widget code are forbidden from candidate notebooks', () => {
  const snapshot = readContractSnapshot()
  const forbidden = [
    /\brequests\b/i,
    /\burllib\b/i,
    /hugging\s*face|huggingface/i,
    /archive\.ics\.uci\.edu|fetch_ucirepo/i,
    /(?:^|\n)\s*[!%]\s*(?:pip|conda|uv)\b/i,
    /<script\b|javascript:/i,
    /\b(?:ipywidgets|widget_state|display\s*\(\s*HTML)\b/i,
  ]
  for (const topic of Object.values(snapshot.topics) as Array<{
    codeCells: Array<{ id: string, source: string }>
  }>) {
    for (const cell of topic.codeCells) {
      for (const pattern of forbidden) {
        assert.doesNotMatch(cell.source, pattern, `${cell.id} contains ${pattern}`)
      }
    }
  }

  const injection = runProbe([
    'bad = module.NotebookCodeCell("bad-network", "import requests")',
    'module.validate_notebook_code_cells((bad,))',
  ].join('\n'))
  assert.notEqual(injection.status, 0)
  assert.match(injection.stderr, /forbidden|network|requests/i)
})

test('environment requirements exactly reuse the audited Numerical Methods pins', () => {
  assert.deepEqual(readFileSync(requirementsPath), readFileSync(numericalRequirementsPath))
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

  const contract = JSON.parse(readFileSync(environmentContractPath, 'utf8'))
  assert.equal(contract.contractVersion, 'loss-functions-phase-26-environment-v1')
  assert.equal(contract.requirements.path, 'scripts/loss-functions/requirements.txt')
  assert.equal(contract.requirements.sha256, sha256(requirementsPath))
  assert.equal(
    contract.requirements.sourceSha256,
    sha256(numericalRequirementsPath),
  )
  assert.equal(contract.wheelCache.path, '.cache/numerical-methods/batch-4-wheelhouse')
  assert.equal(contract.installation.networkAccess, false)
  assert.deepEqual(contract.installation.pipArguments, [
    '--no-index',
    '--find-links=<audited-wheel-cache>',
    '--requirement=scripts/loss-functions/requirements.txt',
  ])
})

test('environment verification rejects Python platform requirements and wheel cache drift', () => {
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
  assert.equal(result.installation, 'pip --no-index --find-links=<audited-wheel-cache>')
  assert.equal(result.wheelCount > 0, true)

  const drift = runProbe([
    'import tempfile',
    'contract = module.read_strict_json(module.ENVIRONMENT_CONTRACT_PATH)',
    'contract["python"]["version"] = "0.0.0"',
    'with tempfile.TemporaryDirectory() as directory:',
    '    path = pathlib.Path(directory) / "environment-contract.json"',
    '    path.write_bytes(module.strict_json_bytes(contract))',
    '    module.validate_environment_contract(contract_path=path)',
  ].join('\n'))
  assert.notEqual(drift.status, 0)
  assert.match(drift.stderr, /Python|platform|identity|drift/i)

  const missingWheels = runProbe([
    'import shutil, tempfile',
    'with tempfile.TemporaryDirectory() as directory:',
    '    cache = pathlib.Path(directory)',
    '    shutil.copy2(module.DEFAULT_WHEEL_CACHE / module.WHEEL_CACHE_MANIFEST_NAME,',
    '                 cache / module.WHEEL_CACHE_MANIFEST_NAME)',
    '    module.validate_environment_contract(wheel_cache=cache)',
  ].join('\n'))
  assert.notEqual(missingWheels.status, 0)
  assert.match(missingWheels.stderr, /wheel|artifact|missing|drift/i)
})

test('kernel jobs lock NotebookClient execution and deterministic normalization', () => {
  const snapshot = readContractSnapshot()
  assert.equal(snapshot.executionJobs.length, 4)
  for (const job of snapshot.executionJobs) {
    assert.equal(job.allowErrors, false)
    assert.equal(job.freshKernel, true)
    assert.equal(job.executionCountStartsAt, 1)
    assert.equal(job.timeoutSeconds, 180)
    assert.equal(job.recordTiming, false)
    assert.equal(job.workingDirectory, 'notebooks/loss-functions')
    assert.equal(job.kernelNamePublished, false)
    assert.equal(job.stripWidgetState, true)
  }

  const generator = readFileSync(generatorPath, 'utf8')
  assert.match(generator, /NotebookClient\(/)
  assert.match(generator, /allow_errors=False/)
  assert.match(generator, /record_timing=False/)
  assert.match(generator, /resources=\{"metadata": \{"path":/)
  assert.match(generator, /client\.execute\(cwd=/)
})

test('candidate transaction creates a fresh root and cleanup removes failed candidates', () => {
  rmSync(stagingRoot, { recursive: true, force: true })
  const successful = runProbe([
    'root = pathlib.Path(sys.argv[2])',
    'root.mkdir(parents=True)',
    '(root / "stale.txt").write_text("stale", encoding="utf-8")',
    'with module.candidate_transaction(root) as transaction:',
    '    print(json.dumps({',
    '        "root": transaction.root.relative_to(module.REPO_ROOT).as_posix(),',
    '        "staleExists": (transaction.root / "stale.txt").exists(),',
    '        "jobCount": len(transaction.execution_jobs),',
    '    }, sort_keys=True))',
    '    (transaction.root / "candidate.txt").write_text("complete", encoding="utf-8")',
  ].join('\n'), [stagingRoot])
  assert.equal(successful.status, 0, successful.stderr)
  assert.deepEqual(JSON.parse(successful.stdout), {
    jobCount: 4,
    root: '.cache/loss-functions/phase-26-staging',
    staleExists: false,
  })
  assert.equal(existsSync(resolve(stagingRoot, 'candidate.txt')), true)

  const failed = runProbe([
    'root = pathlib.Path(sys.argv[2])',
    'with module.candidate_transaction(root) as transaction:',
    '    (transaction.root / "partial.txt").write_text("partial", encoding="utf-8")',
    '    raise module.Phase26Error("injected candidate failure")',
  ].join('\n'), [stagingRoot])
  assert.notEqual(failed.status, 0)
  assert.match(failed.stderr, /injected candidate failure/)
  assert.equal(existsSync(stagingRoot), false)
  assert.equal(existsSync(resolve(root, 'public/phase-26-candidate-test')), false)
})
