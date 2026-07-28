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

test('tampered source hashes and changed license evidence fail closed', () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'phase-26-integrity-'))
  try {
    const tamperedSource = join(temporaryDirectory, 'lade.csv')
    writeFileSync(tamperedSource, 'substituted delivery data\n')
    const hashProbe = runProbe(
      'module._validate_source_file(module.LADE, pathlib.Path(sys.argv[2]))',
      [tamperedSource],
    )
    assert.notEqual(hashProbe.status, 0)
    assert.match(hashProbe.stderr, /SHA-256 drift/)

    const changedContract = join(temporaryDirectory, 'contract.md')
    writeFileSync(changedContract, readFileSync(contractPath, 'utf8').replaceAll('Apache-2.0', 'Proprietary'))
    const licenseProbe = runProbe(
      'module.validate_contract(pathlib.Path(sys.argv[2]))',
      [changedContract],
    )
    assert.notEqual(licenseProbe.status, 0)
    assert.match(licenseProbe.stderr, /license|contract|Apache-2\.0/i)
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

test('LaDe validation locks row count, timestamp rollover, schema, and privacy-minimized candidates', () => {
  const probe = runProbe([
    'import csv, tempfile',
    'with tempfile.TemporaryDirectory() as directory:',
    '    path = pathlib.Path(directory) / "lade.csv"',
    '    rows = []',
    '    for accept_time, delivery_time in [',
    '        ("2022-01-31 23:30:00", "2022-02-01 00:30:00"),',
    '        ("2022-02-01 09:00:00", "2022-02-01 12:00:00"),',
    '    ]:',
    '        row = {field: "source-value" for field in module.LADE_SOURCE_FIELDS}',
    '        row.update({"city": "Jilin", "aoi_type": "residential", "accept_time": accept_time,',
    '                    "delivery_time": delivery_time, "ds": "2022-02-01"})',
    '        rows.append(row)',
    '    with path.open("w", encoding="utf-8", newline="") as handle:',
    '        writer = csv.DictWriter(handle, fieldnames=module.LADE_SOURCE_FIELDS)',
    '        writer.writeheader()',
    '        writer.writerows(rows)',
    '    result = module.validate_lade_source(path, expected_rows=2)',
    '    print(json.dumps({',
    '        "facts": result["facts"],',
    '        "first": result["normalizedRows"][0],',
    '        "keys": list(result["normalizedRows"][0]),',
    '    }, sort_keys=True))',
  ].join('\n'))
  assert.equal(probe.status, 0, probe.stderr)
  const validation = JSON.parse(probe.stdout)
  assert.equal(validation.facts.rowCount, 2)
  assert.equal(validation.first.delivery_duration_minutes, 60)
  assert.deepEqual(validation.keys, [
    'course_row_id',
    'source_row_number',
    'city',
    'aoi_type',
    'accept_time',
    'delivery_time',
    'ds',
    'delivery_duration_minutes',
  ])
  assert.equal('courier_id' in validation.first, false)
  assert.equal(Object.keys(validation.first).some((field) => /gps|lat|lng|stop/i.test(field)), false)

  const rowCount = runProbe([
    'import csv, tempfile',
    'with tempfile.TemporaryDirectory() as directory:',
    '    path = pathlib.Path(directory) / "lade.csv"',
    '    row = {field: "source-value" for field in module.LADE_SOURCE_FIELDS}',
    '    row.update({"city": "Jilin", "aoi_type": "residential",',
    '                "accept_time": "2022-01-01 00:00:00",',
    '                "delivery_time": "2022-01-01 01:00:00", "ds": "2022-01-01"})',
    '    with path.open("w", encoding="utf-8", newline="") as handle:',
    '        writer = csv.DictWriter(handle, fieldnames=module.LADE_SOURCE_FIELDS)',
    '        writer.writeheader(); writer.writerow(row)',
    '    module.validate_lade_source(path, expected_rows=2)',
  ].join('\n'))
  assert.notEqual(rowCount.status, 0)
  assert.match(rowCount.stderr, /row count/i)

  const invalidTimestamp = runProbe([
    'import csv, tempfile',
    'with tempfile.TemporaryDirectory() as directory:',
    '    path = pathlib.Path(directory) / "lade.csv"',
    '    row = {field: "source-value" for field in module.LADE_SOURCE_FIELDS}',
    '    row.update({"city": "Jilin", "aoi_type": "residential", "accept_time": "not-a-time",',
    '                "delivery_time": "2022-01-01 01:00:00", "ds": "2022-01-01"})',
    '    with path.open("w", encoding="utf-8", newline="") as handle:',
    '        writer = csv.DictWriter(handle, fieldnames=module.LADE_SOURCE_FIELDS)',
    '        writer.writeheader(); writer.writerow(row)',
    '    module.validate_lade_source(path, expected_rows=1)',
  ].join('\n'))
  assert.notEqual(invalidTimestamp.status, 0)
  assert.match(invalidTimestamp.stderr, /timestamp|accept_time/i)

  const unexpectedField = runProbe([
    'import csv, tempfile',
    'with tempfile.TemporaryDirectory() as directory:',
    '    path = pathlib.Path(directory) / "lade.csv"',
    '    fields = [*module.LADE_SOURCE_FIELDS, "unexpected_private_field"]',
    '    row = {field: "source-value" for field in fields}',
    '    row.update({"city": "Jilin", "aoi_type": "residential",',
    '                "accept_time": "2022-01-01 00:00:00",',
    '                "delivery_time": "2022-01-01 01:00:00", "ds": "2022-01-01"})',
    '    with path.open("w", encoding="utf-8", newline="") as handle:',
    '        writer = csv.DictWriter(handle, fieldnames=fields)',
    '        writer.writeheader(); writer.writerow(row)',
    '    module.validate_lade_source(path, expected_rows=1)',
  ].join('\n'))
  assert.notEqual(unexpectedField.status, 0)
  assert.match(unexpectedField.stderr, /unexpected|schema|field/i)
})

test('SECOM validation preserves missing values and enforces labels plus the declared 591 observed 590 contract', () => {
  const fixtureSource = [
    'import tempfile, zipfile',
    'def write_archive(path, *, width=590, labels=(-1, 1), declared=591):',
    '    first = ["NaN", *(["0"] * (width - 1))]',
    '    second = ["1"] * width',
    '    with zipfile.ZipFile(path, "w") as archive:',
    '        archive.writestr("secom.data", " ".join(first) + "\\n" + " ".join(second) + "\\n")',
    '        archive.writestr("secom_labels.data",',
    '            f"{labels[0]} 01/01/2008 00:00:00\\n{labels[1]} 01/01/2008 00:01:00\\n")',
    '        archive.writestr("secom.names", f"Number of Attributes: {declared}\\n")',
  ].join('\n')

  const valid = runProbe([
    fixtureSource,
    'with tempfile.TemporaryDirectory() as directory:',
    '    path = pathlib.Path(directory) / "secom.zip"',
    '    write_archive(path)',
    '    result = module.validate_secom_archive(',
    '        path, expected_rows=2, expected_label_counts={-1: 1, 1: 1})',
    '    print(json.dumps(result, sort_keys=True))',
  ].join('\n'))
  assert.equal(valid.status, 0, valid.stderr)
  assert.deepEqual(JSON.parse(valid.stdout), {
    declaredFeatureCount: 591,
    failCount: 1,
    missingValueCount: 1,
    observedFeatureCount: 590,
    passCount: 1,
    rowCount: 2,
  })

  const invalidLabel = runProbe([
    fixtureSource,
    'with tempfile.TemporaryDirectory() as directory:',
    '    path = pathlib.Path(directory) / "secom.zip"',
    '    write_archive(path, labels=(-1, 0))',
    '    module.validate_secom_archive(path, expected_rows=2)',
  ].join('\n'))
  assert.notEqual(invalidLabel.status, 0)
  assert.match(invalidLabel.stderr, /label/i)

  const padded = runProbe([
    fixtureSource,
    'with tempfile.TemporaryDirectory() as directory:',
    '    path = pathlib.Path(directory) / "secom.zip"',
    '    write_archive(path, width=591)',
    '    module.validate_secom_archive(path, expected_rows=2)',
  ].join('\n'))
  assert.notEqual(padded.status, 0)
  assert.match(padded.stderr, /590|feature|width/i)

  const hiddenDiscrepancy = runProbe([
    fixtureSource,
    'with tempfile.TemporaryDirectory() as directory:',
    '    path = pathlib.Path(directory) / "secom.zip"',
    '    write_archive(path, declared=590)',
    '    module.validate_secom_archive(path, expected_rows=2)',
  ].join('\n'))
  assert.notEqual(hiddenDiscrepancy.status, 0)
  assert.match(hiddenDiscrepancy.stderr, /591|declared|metadata/i)
})
