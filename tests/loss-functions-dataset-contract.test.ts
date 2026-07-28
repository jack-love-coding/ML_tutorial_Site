import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')
const generatorPath = resolve(root, 'scripts/loss-functions/build-phase-26-assets.py')
const contractPath = resolve(root, 'docs/curriculum-v3/loss-functions/phase-26-data-contract.md')

function runGenerator(args: readonly string[], environment: NodeJS.ProcessEnv = process.env) {
  return spawnSync('python3', [generatorPath, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: environment,
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

function snapshot(path: string) {
  return {
    bytes: readFileSync(path),
    mtimeMs: statSync(path).mtimeMs,
  }
}

test('Phase 26 contract freezes the exact approved dual-source identities', () => {
  const contract = readFileSync(contractPath, 'utf8')
  assert.match(contract, /2026-07-28/)
  assert.match(contract, /approve-lade/)
  assert.match(contract, /be2cec02775cafc8d52230303f32134382bcc50b/)
  assert.match(contract, /12e2cf4664dd5b4475d39dddee8872f5a03b3082f08f0eece7f103baee6c6e73/)
  assert.match(contract, /10\.24432\/C54305/)
  assert.match(contract, /eea568baf3c2229096d7d294cf0b096b5502bd96d92c0b80a65b84714059be8e/)

  const probe = runProbe('print(json.dumps(module.contract_snapshot(), sort_keys=True, allow_nan=False))')
  assert.equal(probe.status, 0, probe.stderr)
  const snapshot = JSON.parse(probe.stdout)
  assert.deepEqual(snapshot.lade, {
    datasetId: 'lade-delivery-jilin',
    downloadUrl: 'https://huggingface.co/datasets/Cainiao-AI/LaDe/resolve/be2cec02775cafc8d52230303f32134382bcc50b/delivery/delivery_jl.csv',
    license: 'Apache-2.0',
    revisionOrDoi: 'be2cec02775cafc8d52230303f32134382bcc50b',
    sha256: '12e2cf4664dd5b4475d39dddee8872f5a03b3082f08f0eece7f103baee6c6e73',
  })
  assert.deepEqual(snapshot.secom, {
    datasetId: 'uci-secom',
    declaredFeatureCount: 591,
    downloadUrl: 'https://archive.ics.uci.edu/static/public/179/secom.zip',
    license: 'CC BY 4.0',
    observedFeatureCount: 590,
    revisionOrDoi: '10.24432/C54305',
    sha256: 'eea568baf3c2229096d7d294cf0b096b5502bd96d92c0b80a65b84714059be8e',
  })
})

test('source bootstrap, local generation, cache verification, and check are explicit exclusive modes', () => {
  const help = runGenerator(['--help'])
  assert.equal(help.status, 0, help.stderr)
  for (const mode of ['--bootstrap-sources', '--generate', '--verify-source-cache', '--check']) {
    assert.match(help.stdout, new RegExp(mode))
  }

  const conflicting = runGenerator(['--bootstrap-sources', '--check'])
  assert.notEqual(conflicting.status, 0)
  assert.match(conflicting.stderr, /not allowed with argument|mutually exclusive/)
})

test('strict JSON uses null plus status for non-finite probes and rejects bare non-finite numbers', () => {
  const valid = runProbe([
    'payload = {"probe": module.nonfinite_result("inf")}',
    'sys.stdout.buffer.write(module.strict_json_bytes(payload))',
  ].join('\n'))
  assert.equal(valid.status, 0, valid.stderr)
  assert.deepEqual(JSON.parse(valid.stdout), {
    probe: { status: 'inf', value: null },
  })
  assert.doesNotMatch(valid.stdout, /\b(?:NaN|Infinity|-Infinity)\b/)

  const invalid = runProbe('module.strict_json_bytes({"value": float("nan")})')
  assert.notEqual(invalid.status, 0)
  assert.match(invalid.stderr, /Out of range float values are not JSON compliant|non-finite/)
})

test('--check is offline and read-only and rejects committed byte drift', () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'phase-26-check-'))
  try {
    const regeneratedRoot = join(temporaryDirectory, 'regenerated')
    const publishedRoot = join(temporaryDirectory, 'published')
    mkdirSync(regeneratedRoot)
    mkdirSync(publishedRoot)
    const regeneratedArtifact = join(regeneratedRoot, 'artifact.json')
    const publishedArtifact = join(publishedRoot, 'artifact.json')
    const expectedBytes = '{"contractVersion":"loss-functions-phase-26-v1"}\n'
    writeFileSync(regeneratedArtifact, expectedBytes)
    writeFileSync(publishedArtifact, expectedBytes)

    const siteCustom = [
      'import socket',
      'def blocked(*args, **kwargs):',
      '    raise RuntimeError("network access blocked by test")',
      'socket.create_connection = blocked',
      'socket.socket.connect = blocked',
    ].join('\n')
    writeFileSync(join(temporaryDirectory, 'sitecustomize.py'), siteCustom)
    const environment = {
      ...process.env,
      PYTHONPATH: [temporaryDirectory, process.env.PYTHONPATH].filter(Boolean).join(':'),
    }
    const before = {
      regenerated: snapshot(regeneratedArtifact),
      published: snapshot(publishedArtifact),
    }
    const checked = runGenerator([
      '--check',
      '--offline',
      '--regenerated-root',
      regeneratedRoot,
      '--published-root',
      publishedRoot,
    ], environment)
    assert.equal(checked.status, 0, checked.stderr)
    const after = {
      regenerated: snapshot(regeneratedArtifact),
      published: snapshot(publishedArtifact),
    }
    assert.deepEqual(after, before)

    writeFileSync(publishedArtifact, '{"contractVersion":"tampered"}\n')
    const drifted = runGenerator([
      '--check',
      '--offline',
      '--regenerated-root',
      regeneratedRoot,
      '--published-root',
      publishedRoot,
    ], environment)
    assert.notEqual(drifted.status, 0)
    assert.match(drifted.stderr, /committed bytes differ|byte drift/i)
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

test('authorization drift fails closed before generation', () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'phase-26-contract-'))
  try {
    const changedContract = join(temporaryDirectory, 'contract.md')
    writeFileSync(changedContract, readFileSync(contractPath, 'utf8').replaceAll('approve-lade', 'reject-lade'))
    const probe = runProbe(
      'module.validate_contract(pathlib.Path(sys.argv[2]))',
      [changedContract],
    )
    assert.notEqual(probe.status, 0)
    assert.match(probe.stderr, /approval|approve-lade|contract/i)
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})
