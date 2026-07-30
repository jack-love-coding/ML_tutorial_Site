import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, resolve } from 'node:path'
import test from 'node:test'
import {
  evaluateBceStabilityProbe,
  evaluateLossGradient,
  evaluateStepSweep,
} from '../src/simulations/lossFunctionsMath.ts'
import { withPublicBase } from '../src/utils/publicPath.ts'

const root = resolve(import.meta.dirname, '..')
const generatorPath = resolve(root, 'scripts/loss-functions/build-phase-26-assets.py')
const stagingRoot = resolve(root, '.cache/loss-functions/phase-26-staging')
const publicRoot = resolve(root, 'public')
const requirementsPath = resolve(root, 'scripts/loss-functions/requirements.txt')
const environmentContractPath = resolve(root, 'scripts/loss-functions/environment-contract.json')
const numericalRequirementsPath = resolve(root, 'public/notebooks/numerical-methods/requirements.txt')
const numericalWheelCache = resolve(root, '.cache/numerical-methods/batch-4-wheelhouse')
const requireLocalReleaseAssets =
  process.env.ML_ATLAS_REQUIRE_LOCAL_RELEASE_ASSETS === '1'
const phase26ReleaseAssetsAvailable =
  existsSync(stagingRoot) && existsSync(numericalWheelCache)
const phase26ReleaseTest =
  requireLocalReleaseAssets || phase26ReleaseAssetsAvailable ? test : test.skip

function sha256(path: string) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function candidatePath(relativePath: string) {
  return resolve(stagingRoot, relativePath)
}

function publishedPath(relativePath: string) {
  return resolve(publicRoot, relativePath)
}

function readStrictJson(path: string) {
  const source = readFileSync(path, 'utf8')
  assert.doesNotMatch(source, /:\s*(?:NaN|Infinity|-Infinity)\b/)
  return JSON.parse(source)
}

function codeCells(notebook: {
  cells: Array<{ cell_type: string, id: string, source: string[], outputs?: unknown[] }>
}) {
  return notebook.cells.filter((cell) => cell.cell_type === 'code')
}

function normalizedCodeOutputs(notebook: {
  cells: Array<{ cell_type: string, id: string, source: string[], outputs?: unknown[] }>
}) {
  return codeCells(notebook).map(({ id, outputs }) => ({ id, outputs: outputs ?? [] }))
}

function closeTo(actual: number, expected: number, tolerance = 1e-12) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} should be within ${tolerance} of ${expected}`,
  )
}

function pngContract(path: string) {
  const bytes = readFileSync(path)
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  const width = bytes.readUInt32BE(16)
  const height = bytes.readUInt32BE(20)
  const metadata: Record<string, string> = {}
  let offset = 8
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset)
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii')
    const payload = bytes.subarray(offset + 8, offset + 8 + length)
    if (type === 'tEXt') {
      const separator = payload.indexOf(0)
      metadata[payload.subarray(0, separator).toString('latin1')] = payload
        .subarray(separator + 1)
        .toString('latin1')
    }
    offset += 12 + length
  }
  return { width, height, metadata }
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

function treeSnapshot(treeRoot: string) {
  if (!existsSync(treeRoot)) return {}
  const entries: Record<string, string> = {}
  const visit = (directory: string) => {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name)
      const status = statSync(path)
      if (status.isDirectory()) {
        visit(path)
      } else {
        entries[relative(treeRoot, path)] = sha256(path)
      }
    }
  }
  visit(treeRoot)
  return entries
}

function repositoryState() {
  const listed = spawnSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: root, encoding: 'utf8' },
  )
  assert.equal(listed.status, 0, listed.stderr)
  const entries: Record<string, { sha256: string, size: number, mtimeMs: number }> = {}
  for (const relativePath of listed.stdout.split('\0').filter(Boolean).sort()) {
    const path = resolve(root, relativePath)
    const status = statSync(path)
    entries[relativePath] = {
      sha256: sha256(path),
      size: status.size,
      mtimeMs: status.mtimeMs,
    }
  }
  return entries
}

function seedPreviousPublicPackage(publicRoot: string) {
  const datasetRoot = resolve(publicRoot, 'datasets/loss-functions')
  const notebookRoot = resolve(publicRoot, 'notebooks/loss-functions')
  mkdirSync(datasetRoot, { recursive: true })
  mkdirSync(notebookRoot, { recursive: true })
  writeFileSync(resolve(datasetRoot, 'previous-dataset.txt'), 'previous dataset bytes\n')
  writeFileSync(resolve(notebookRoot, 'previous-notebook.txt'), 'previous notebook bytes\n')
}

function publicationResidue(publicRoot: string) {
  return Object.keys(treeSnapshot(publicRoot)).filter((path) =>
    path.split('/').some((component) =>
      component === '.loss-functions-publication.lock'
      || component.startsWith('.loss-functions-publication-'),
    ),
  )
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

phase26ReleaseTest('environment verification rejects Python platform requirements and wheel cache drift', () => {
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
  const transactionRoot = mkdtempSync(resolve(tmpdir(), 'phase-26-transaction-'))
  try {
    const successful = runProbe([
      'root = pathlib.Path(sys.argv[2])',
      'module.validate_candidate_staging_root = lambda path: path.resolve()',
      '(root / "stale.txt").write_text("stale", encoding="utf-8")',
      'with module.candidate_transaction(root) as transaction:',
      '    print(json.dumps({',
      '        "staleExists": (transaction.root / "stale.txt").exists(),',
      '        "jobCount": len(transaction.execution_jobs),',
      '    }, sort_keys=True))',
      '    (transaction.root / "candidate.txt").write_text("complete", encoding="utf-8")',
    ].join('\n'), [transactionRoot])
    assert.equal(successful.status, 0, successful.stderr)
    assert.deepEqual(JSON.parse(successful.stdout), {
      jobCount: 4,
      staleExists: false,
    })
    assert.equal(existsSync(resolve(transactionRoot, 'candidate.txt')), true)

    const failed = runProbe([
      'root = pathlib.Path(sys.argv[2])',
      'module.validate_candidate_staging_root = lambda path: path.resolve()',
      'with module.candidate_transaction(root) as transaction:',
      '    (transaction.root / "partial.txt").write_text("partial", encoding="utf-8")',
      '    raise module.Phase26Error("injected candidate failure")',
    ].join('\n'), [transactionRoot])
    assert.notEqual(failed.status, 0)
    assert.match(failed.stderr, /injected candidate failure/)
    assert.equal(existsSync(transactionRoot), false)
    assert.equal(existsSync(resolve(root, 'public/phase-26-candidate-test')), false)
  } finally {
    rmSync(transactionRoot, { recursive: true, force: true })
  }
})

test('dataset-candidate mode is explicit, staging-only, and validates both real sources before Notebook execution', () => {
  const help = runGenerator(['--help'])
  assert.equal(help.status, 0, help.stderr)
  assert.match(help.stdout, /--prepare-dataset-candidates/)

  const snapshot = readContractSnapshot()
  assert.deepEqual(snapshot.datasetCandidatePaths, [
    'datasets/loss-functions/lade-delivery-jilin.csv',
    'datasets/loss-functions/lade-delivery-jilin-manifest.json',
    'datasets/loss-functions/secom-manufacturing.csv',
    'datasets/loss-functions/secom-manufacturing-manifest.json',
    'datasets/loss-functions/ATTRIBUTION.md',
  ])
  assert.equal(snapshot.datasetContracts.lade.expectedRows, 31_415)
  assert.equal(snapshot.datasetContracts.lade.referencePredictionMinutes, 175)
  assert.equal(snapshot.datasetContracts.secom.expectedRows, 1_567)
  assert.equal(snapshot.datasetContracts.secom.declaredFeatureCount, 591)
  assert.equal(snapshot.datasetContracts.secom.observedFeatureCount, 590)
  assert.equal(snapshot.datasetContracts.secom.oofFoldCount, 5)
  assert.equal(snapshot.datasetContracts.secom.oofRandomState, 20_260_728)
})

phase26ReleaseTest('all four candidate Notebooks execute independently in clean kernels without errors', () => {
  const manifest = readStrictJson(candidatePath('notebooks/loss-functions/outputs/manifest.json'))
  assert.equal(manifest.executionProofs.length, 4)
  assert.equal(new Set(manifest.executionProofs.map((proof: { proofId: string }) => proof.proofId)).size, 4)

  for (const job of readContractSnapshot().executionJobs) {
    const path = candidatePath(job.notebookPath)
    const notebook = readStrictJson(path)
    const code = codeCells(notebook)
    assert.deepEqual(
      code.map((cell: { execution_count: number }) => cell.execution_count),
      code.map((_: unknown, index: number) => index + 1),
    )
    assert.equal(
      code.some((cell: { outputs?: Array<{ output_type?: string }> }) =>
        (cell.outputs ?? []).some((output) => output.output_type === 'error')),
      false,
    )
    assert.deepEqual(notebook.metadata.kernelspec, {
      display_name: 'Python 3',
      language: 'python',
      name: 'python3',
    })
    assert.deepEqual(notebook.metadata.language_info, { name: 'python' })
    assert.doesNotMatch(
      readFileSync(path, 'utf8'),
      /ml-atlas-phase26-[a-f0-9]{16,}|(?:\/private)?\/(?:tmp|var\/folders)\//,
    )

    const proof = manifest.executionProofs.find(
      (entry: { proofId: string }) => entry.proofId === job.proofId,
    )
    assert.ok(proof)
    assert.equal(proof.freshKernel, true)
    assert.equal(proof.allowErrors, false)
    assert.equal(proof.executionCountStartsAt, 1)
    assert.equal(proof.kernelNamePublished, false)
    assert.equal(proof.notebookPath, job.notebookPath)
    assert.equal(proof.notebookSha256, sha256(path))
  }
})

phase26ReleaseTest('locale pairs retain exact code cell IDs, sources, and normalized output hashes', () => {
  const manifest = readStrictJson(candidatePath('notebooks/loss-functions/outputs/manifest.json'))
  for (const topicId of ['delivery-losses', 'manufacturing-bce-gradients']) {
    const zh = readStrictJson(candidatePath(`notebooks/loss-functions/${topicId}.zh-CN.ipynb`))
    const en = readStrictJson(candidatePath(`notebooks/loss-functions/${topicId}.en.ipynb`))
    assert.deepEqual(
      codeCells(zh).map(({ id, source }) => ({ id, source })),
      codeCells(en).map(({ id, source }) => ({ id, source })),
    )
    assert.deepEqual(normalizedCodeOutputs(zh), normalizedCodeOutputs(en))
    assert.notDeepEqual(
      zh.cells.filter((cell: { cell_type: string }) => cell.cell_type === 'markdown')
        .map((cell: { source: string[] }) => cell.source),
      en.cells.filter((cell: { cell_type: string }) => cell.cell_type === 'markdown')
        .map((cell: { source: string[] }) => cell.source),
    )

    const parity = manifest.localeParity[topicId]
    assert.equal(parity.codeSha256.length, 64)
    assert.equal(parity.normalizedOutputSha256.length, 64)
    assert.deepEqual(
      parity.codeCellIds,
      codeCells(zh).map(({ id }) => id),
    )
  }
})

phase26ReleaseTest('real delivery rows expose full MSE MAE objectives and output-gradient parity', () => {
  const summary = readStrictJson(
    candidatePath('notebooks/loss-functions/outputs/regression-loss-summary.json'),
  )
  assert.equal(summary.topicId, 'delivery-losses')
  assert.equal(summary.rows.length, 31_415)
  assert.equal(summary.referencePredictionMinutes, 175)

  const targets = summary.rows.map((row: { targetMinutes: number }) => row.targetMinutes)
  const predictions = summary.rows.map((row: { predictionMinutes: number }) => row.predictionMinutes)
  const mse = evaluateLossGradient('mse', targets, predictions)
  const mae = evaluateLossGradient('mae', targets, predictions)
  closeTo(summary.aggregate.mse, mse.meanObjective, 1e-10)
  closeTo(summary.aggregate.mae, mae.meanObjective, 1e-12)
  for (const index of [0, 299, 6_863, 25_597, 31_414]) {
    const row = summary.rows[index]
    closeTo(row.mseLoss, mse.perElementLosses[index]!)
    closeTo(row.maeLoss, mae.perElementLosses[index]!)
    closeTo(row.msePerElementGradient, mse.perElementGradients[index]!)
    closeTo(row.maePerElementSubgradient, mae.perElementGradients[index]!)
    closeTo(row.mseMeanObjectiveGradient, mse.meanObjectiveGradients[index]!, 1e-15)
    closeTo(row.maeMeanObjectiveSubgradient, mae.meanObjectiveGradients[index]!, 1e-15)
    assert.equal(row.maeDifferentiable, mae.differentiable[index])
  }
  assert.deepEqual(
    summary.representativeRows.map((row: { role: string }) => row.role),
    ['zero-duration', 'typical-zero-residual', 'long-duration'],
  )
  assert.equal(summary.highContributionRows.length, 5)
  assert.equal(summary.highContributionRows[0].courseRowId, 'lade-jilin-25598')
})

phase26ReleaseTest('real manufacturing BCE, fixed probes, gradients, and finite differences match TypeScript', () => {
  const summary = readStrictJson(
    candidatePath('notebooks/loss-functions/outputs/bce-gradient-summary.json'),
  )
  assert.equal(summary.topicId, 'manufacturing-bce-gradients')
  assert.equal(summary.rows.length, 1_567)
  const labels = summary.rows.map((row: { label: number }) => row.label)
  const logits = summary.rows.map((row: { logit: number }) => row.logit)
  const bce = evaluateLossGradient('bce', labels, logits)
  closeTo(summary.aggregate.meanStableBce, bce.meanObjective, 1e-12)
  for (const index of [0, 100, 999, 1_355, 1_566]) {
    const row = summary.rows[index]
    closeTo(row.stableBce, bce.perElementLosses[index]!, 1e-12)
    closeTo(row.perLogitGradient, bce.perElementGradients[index]!, 1e-15)
    closeTo(row.meanObjectiveGradient, bce.meanObjectiveGradients[index]!, 1e-18)
  }

  const typescriptProbes = evaluateBceStabilityProbe()
  assert.equal(summary.fixedProbes.length, 10)
  summary.fixedProbes.forEach((row: {
    logit: number
    label: number
    naive: { status: string, value: number | null }
    clipped: { value: number, objectiveChanged: boolean }
    stable: { value: number }
  }, index: number) => {
    const expected = typescriptProbes[index]!
    assert.deepEqual([row.logit, row.label], [expected.logit, expected.label])
    closeTo(row.clipped.value, expected.clipped.value, 1e-12)
    assert.equal(row.clipped.objectiveChanged, expected.clipped.objectiveChanged)
    closeTo(row.stable.value, expected.stable.value, 1e-12)
    if (expected.naive.value === null) {
      assert.equal(row.naive.value, null)
      assert.match(row.naive.status, /^(?:inf|-inf|nan)$/)
    } else {
      closeTo(row.naive.value ?? Number.NaN, expected.naive.value, 1e-12)
    }
  })

  const sweepInputs = {
    mse: { kind: 'mse' as const, targets: [1, 2], outputs: [1.5, 3], index: 1 },
    mae: { kind: 'mae' as const, targets: [0, 2], outputs: [1, 3], index: 0 },
    'mae-kink': { kind: 'mae' as const, targets: [1, 2], outputs: [1, 3], index: 0 },
    bce: { kind: 'bce' as const, targets: [0, 1], outputs: [0.2, -0.4], index: 1 },
  }
  for (const [key, input] of Object.entries(sweepInputs)) {
    const expected = evaluateStepSweep(input)
    const actual = summary.finiteDifferenceSweeps[key]
    assert.equal(actual.length, 9)
    actual.forEach((row: {
      step: number
      analyticValue: number
      numericalValue: number
      absoluteError: number
      status: string
    }, index: number) => {
      closeTo(row.step, expected[index]!.step)
      closeTo(row.analyticValue, expected[index]!.analyticValue, 1e-15)
      closeTo(row.numericalValue, expected[index]!.numericalValue, 1e-7)
      closeTo(row.absoluteError, expected[index]!.absoluteError, 1e-7)
      assert.equal(row.status, expected[index]!.status)
    })
  }
})

phase26ReleaseTest('candidate plots have deterministic dimensions, metadata, and non-color encodings', () => {
  for (const [relativePath, title] of [
    ['notebooks/loss-functions/outputs/delivery-losses.png', 'Delivery loss distribution'],
    ['notebooks/loss-functions/outputs/manufacturing-bce-gradients.png', 'Manufacturing BCE and gradient verification'],
  ] as const) {
    const path = candidatePath(relativePath)
    assert.equal(existsSync(path), true)
    const plot = pngContract(path)
    assert.deepEqual([plot.width, plot.height], [960, 540])
    assert.equal(plot.metadata.Title, title)
    assert.match(plot.metadata.Description, /real|finite|gradient|loss/i)
    assert.match(plot.metadata.NonColorEncoding, /solid|hatched|circle|square|line/i)
  }
})

phase26ReleaseTest('complete candidate manifest covers all 16 members, hashes, requirements, and rerun expectations', () => {
  const path = candidatePath('notebooks/loss-functions/outputs/manifest.json')
  const manifest = readStrictJson(path)
  assert.equal(manifest.contractVersion, 'loss-functions-phase-26-candidate-v1')
  assert.equal(manifest.packageComplete, true)
  assert.equal(manifest.publicationAllowed, false)
  assert.deepEqual(manifest.requirements, ['LOSS-01', 'LOSS-02', 'LOSS-03'])
  assert.equal(manifest.generator.path, 'scripts/loss-functions/build-phase-26-assets.py')
  assert.equal(
    manifest.generator.sha256,
    '69f41c2a125456b07695528a5f9687d291177949b777178fbfcbb4527658f652',
  )
  assert.equal(manifest.inventory.length, 16)
  assert.deepEqual(
    manifest.inventory.map((entry: { path: string }) => entry.path),
    readContractSnapshot().inventory.paths,
  )
  for (const entry of manifest.inventory) {
    const memberPath = candidatePath(entry.path)
    assert.equal(existsSync(memberPath), true, entry.path)
    if (entry.path.endsWith('/manifest.json') && entry.role === 'candidate-manifest') {
      assert.equal(entry.sha256, null)
      assert.equal(entry.bytes, null)
      assert.equal(entry.selfHashExcluded, true)
    } else {
      assert.equal(entry.sha256, sha256(memberPath), entry.path)
      assert.equal(entry.bytes, statSync(memberPath).size, entry.path)
    }
  }
  assert.equal(manifest.standaloneRerunExpectation.notebookCount, 4)
  assert.equal(manifest.standaloneRerunExpectation.freshKernelEach, true)
  assert.equal(manifest.standaloneRerunExpectation.offline, true)
  assert.equal(manifest.standaloneRerunExpectation.normalizedOutputsMustMatch, true)
  assert.equal(manifest.canonicalPayloadSha256.length, 64)
})

phase26ReleaseTest('candidate verification rejects changed output values and incomplete manifest inventory', () => {
  const probe = runProbe([
    'import shutil, tempfile',
    'source = pathlib.Path(sys.argv[2])',
    'with tempfile.TemporaryDirectory() as directory:',
    '    root = pathlib.Path(directory) / "candidate"',
    '    shutil.copytree(source, root)',
    '    summary_path = root / "notebooks/loss-functions/outputs/bce-gradient-summary.json"',
    '    summary = module.read_strict_json(summary_path)',
    '    summary["aggregate"]["meanStableBce"] += 1.0',
    '    summary_path.write_bytes(module.strict_json_bytes(summary))',
    '    try:',
    '        module.verify_candidates(root, enforce_staging_root=False)',
    '    except module.Phase26Error as error:',
    '        print(str(error))',
    '    else:',
    '        raise RuntimeError("changed output value was accepted")',
  ].join('\n'), [stagingRoot])
  assert.equal(probe.status, 0, probe.stderr)
  assert.match(probe.stdout, /BCE|summary|hash|output|drift/i)

  const manifestProbe = runProbe([
    'import shutil, tempfile',
    'source = pathlib.Path(sys.argv[2])',
    'with tempfile.TemporaryDirectory() as directory:',
    '    root = pathlib.Path(directory) / "candidate"',
    '    shutil.copytree(source, root)',
    '    path = root / "notebooks/loss-functions/outputs/manifest.json"',
    '    manifest = module.read_strict_json(path)',
    '    manifest["inventory"].pop()',
    '    path.write_bytes(module.strict_json_bytes(manifest))',
    '    try:',
    '        module.verify_candidates(root, enforce_staging_root=False)',
    '    except module.Phase26Error as error:',
    '        print(str(error))',
    '    else:',
    '        raise RuntimeError("incomplete manifest was accepted")',
  ].join('\n'), [stagingRoot])
  assert.equal(manifestProbe.status, 0, manifestProbe.stderr)
  assert.match(manifestProbe.stdout, /inventory|manifest|16|complete|drift/i)
})

test('publication CLI accepts only the complete inventory and rejects topic or locale subsets', () => {
  const help = runGenerator(['--help'])
  assert.equal(help.status, 0, help.stderr)
  assert.match(help.stdout, /--publish-candidates/)

  for (const selector of [
    ['--topic', 'delivery-losses'],
    ['--locale', 'zh-CN'],
  ]) {
    const partialAttempt = runGenerator([
      '--publish-candidates',
      '--staging-root',
      stagingRoot,
      ...selector,
    ])
    assert.notEqual(partialAttempt.status, 0)
    assert.match(partialAttempt.stderr, /partial|selector|topic|locale/i)
  }
})

phase26ReleaseTest('publication atomically swaps both owned groups with the exact complete inventory', () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'phase-26-publication-'))
  try {
    const publicRoot = resolve(temporaryDirectory, 'public')
    seedPreviousPublicPackage(publicRoot)
    const published = runProbe(
      [
        'result = module.publish_candidates(',
        '    pathlib.Path(sys.argv[2]),',
        '    public_root=pathlib.Path(sys.argv[3]),',
        '    enforce_public_root=False,',
        ')',
        'print(json.dumps(result, sort_keys=True, allow_nan=False))',
      ].join('\n'),
      [stagingRoot, publicRoot],
    )
    assert.equal(published.status, 0, published.stderr)
    const result = JSON.parse(published.stdout)
    assert.equal(result.inventoryCount, 16)
    assert.equal(result.executionProofCount, 4)

    const expected = treeSnapshot(stagingRoot)
    const actual = treeSnapshot(publicRoot)
    assert.deepEqual(actual, expected)
    assert.deepEqual(publicationResidue(publicRoot), [])
    assert.equal(existsSync(resolve(publicRoot, 'datasets/loss-functions/previous-dataset.txt')), false)
    assert.equal(existsSync(resolve(publicRoot, 'notebooks/loss-functions/previous-notebook.txt')), false)

    for (const relativePath of Object.keys(actual).filter((path) => path.endsWith('.json'))) {
      const source = readFileSync(resolve(publicRoot, relativePath), 'utf8')
      assert.doesNotMatch(source, /:\s*(?:NaN|Infinity|-Infinity)\b/)
      assert.doesNotThrow(() => JSON.parse(source))
    }
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

phase26ReleaseTest('publication rollback restores both previous groups after pre mid or post swap failure', () => {
  for (const failurePoint of ['pre-swap', 'mid-swap', 'post-swap']) {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), `phase-26-rollback-${failurePoint}-`))
    try {
      const publicRoot = resolve(temporaryDirectory, 'public')
      seedPreviousPublicPackage(publicRoot)
      const before = treeSnapshot(publicRoot)
      const failed = runProbe(
        [
          'module.publish_candidates(',
          '    pathlib.Path(sys.argv[2]),',
          '    public_root=pathlib.Path(sys.argv[3]),',
          '    enforce_public_root=False,',
          '    failure_point=sys.argv[4],',
          ')',
        ].join('\n'),
        [stagingRoot, publicRoot, failurePoint],
      )
      assert.notEqual(failed.status, 0)
      assert.match(failed.stderr, /injected publication failure/i)
      assert.deepEqual(treeSnapshot(publicRoot), before)
      assert.deepEqual(publicationResidue(publicRoot), [])
    } finally {
      rmSync(temporaryDirectory, { recursive: true, force: true })
    }
  }
})

phase26ReleaseTest('publication refuses unexpected inventory and candidate hash drift before replacing public bytes', () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'phase-26-publication-corruption-'))
  try {
    const copiedStagingRoot = resolve(temporaryDirectory, 'candidate')
    const publicRoot = resolve(temporaryDirectory, 'public')
    cpSync(stagingRoot, copiedStagingRoot, { recursive: true })
    seedPreviousPublicPackage(publicRoot)
    const before = treeSnapshot(publicRoot)

    const unexpectedPath = resolve(
      copiedStagingRoot,
      'notebooks/loss-functions/outputs/unexpected.json',
    )
    writeFileSync(unexpectedPath, '{}\n')
    const unexpected = runProbe(
      [
        'module.publish_candidates(',
        '    pathlib.Path(sys.argv[2]),',
        '    public_root=pathlib.Path(sys.argv[3]),',
        '    enforce_staging_root=False,',
        '    enforce_public_root=False,',
        ')',
      ].join('\n'),
      [copiedStagingRoot, publicRoot],
    )
    assert.notEqual(unexpected.status, 0)
    assert.match(unexpected.stderr, /inventory|unexpected/i)
    assert.deepEqual(treeSnapshot(publicRoot), before)
    rmSync(unexpectedPath)

    const summaryPath = resolve(
      copiedStagingRoot,
      'notebooks/loss-functions/outputs/regression-loss-summary.json',
    )
    writeFileSync(summaryPath, '{"tampered":true}\n')
    const drifted = runProbe(
      [
        'module.publish_candidates(',
        '    pathlib.Path(sys.argv[2]),',
        '    public_root=pathlib.Path(sys.argv[3]),',
        '    enforce_staging_root=False,',
        '    enforce_public_root=False,',
        ')',
      ].join('\n'),
      [copiedStagingRoot, publicRoot],
    )
    assert.notEqual(drifted.status, 0)
    assert.match(drifted.stderr, /hash|summary|drift/i)
    assert.deepEqual(treeSnapshot(publicRoot), before)
    assert.deepEqual(publicationResidue(publicRoot), [])
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

phase26ReleaseTest('publication standards JSON remains strict across every published JSON member', () => {
  for (const relativePath of readContractSnapshot().inventory.paths as string[]) {
    if (!relativePath.endsWith('.json')) continue
    const source = readFileSync(candidatePath(relativePath), 'utf8')
    assert.doesNotMatch(source, /:\s*(?:NaN|Infinity|-Infinity)\b/)
    assert.doesNotThrow(() => JSON.parse(source))
  }
})

phase26ReleaseTest('offline check reruns all four public Notebooks standalone without repository writes', () => {
  const before = repositoryState()
  const checked = runGenerator(['--check', '--offline'])
  assert.equal(checked.status, 0, checked.stderr)
  assert.match(checked.stdout, /4 independently rerun public Notebooks/i)
  assert.match(checked.stdout, /network blocked|offline wheelhouse/i)
  assert.deepEqual(repositoryState(), before)
  assert.deepEqual(publicationResidue(publicRoot), [])
})

test('public hash and locale parity corruption fail closed before standalone acceptance', () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'phase-26-public-hash-'))
  try {
    const copiedPublicRoot = resolve(temporaryDirectory, 'public')
    cpSync(resolve(publicRoot, 'datasets/loss-functions'), resolve(copiedPublicRoot, 'datasets/loss-functions'), {
      recursive: true,
    })
    cpSync(resolve(publicRoot, 'notebooks/loss-functions'), resolve(copiedPublicRoot, 'notebooks/loss-functions'), {
      recursive: true,
    })
    const notebookPath = resolve(
      copiedPublicRoot,
      'notebooks/loss-functions/delivery-losses.en.ipynb',
    )
    const notebook = JSON.parse(readFileSync(notebookPath, 'utf8'))
    const codeCell = notebook.cells.find((cell: { cell_type: string }) => cell.cell_type === 'code')
    codeCell.source = [...codeCell.source, '\n# locale drift\n']
    writeFileSync(notebookPath, `${JSON.stringify(notebook, null, 1)}\n`)

    const drifted = runProbe(
      'module.verify_candidates(pathlib.Path(sys.argv[2]), enforce_staging_root=False)',
      [copiedPublicRoot],
    )
    assert.notEqual(drifted.status, 0)
    assert.match(drifted.stderr, /code|locale|hash|drift/i)
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

test('public hashes strict finite statuses and SECOM 590 591 schema remain locked', () => {
  const manifest = readStrictJson(
    publishedPath('notebooks/loss-functions/outputs/manifest.json'),
  )
  assert.equal(manifest.inventory.length, 16)
  for (const entry of manifest.inventory) {
    const path = publishedPath(entry.path)
    assert.equal(existsSync(path), true)
    if (entry.selfHashExcluded === true) continue
    assert.equal(sha256(path), entry.sha256)
    assert.equal(statSync(path).size, entry.bytes)
  }

  const secom = readStrictJson(
    publishedPath('datasets/loss-functions/secom-manufacturing-manifest.json'),
  )
  assert.equal(secom.published.declaredFeatureCount, 591)
  assert.equal(secom.published.observedFeatureCount, 590)

  const bce = readStrictJson(
    publishedPath('notebooks/loss-functions/outputs/bce-gradient-summary.json'),
  )
  assert.equal(bce.fixedProbes.length, 10)
  for (const probe of bce.fixedProbes) {
    assert.equal(Number.isFinite(probe.stable.value), true)
    if (probe.naive.status !== 'finite') assert.equal(probe.naive.value, null)
  }
  assert.equal(bce.finiteDifferenceSweeps['mae-kink'][0].status, 'kink')
  assert.equal(bce.finiteDifferenceSweeps['mae-kink'][0].differentiable, false)
})

test('public assets resolve locally for root and ML_tutorial_Site base paths', () => {
  const paths = readContractSnapshot().inventory.paths as string[]
  for (const relativePath of paths) {
    const rootRelative = `/${relativePath}`
    assert.equal(withPublicBase(rootRelative, '/'), rootRelative)
    assert.equal(
      withPublicBase(rootRelative, '/ML_tutorial_Site/'),
      `/ML_tutorial_Site/${relativePath}`,
    )
    assert.equal(existsSync(publishedPath(relativePath)), true)
  }

  for (const notebookName of [
    'delivery-losses.zh-CN.ipynb',
    'delivery-losses.en.ipynb',
    'manufacturing-bce-gradients.zh-CN.ipynb',
    'manufacturing-bce-gradients.en.ipynb',
  ]) {
    const notebook = readStrictJson(
      publishedPath(`notebooks/loss-functions/${notebookName}`),
    )
    const code = codeCells(notebook)
      .flatMap((cell) => cell.source)
      .join('\n')
    assert.doesNotMatch(code, /huggingface\.co|archive\.ics\.uci\.edu|https?:\/\//i)
  }
})
