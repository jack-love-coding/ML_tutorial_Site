import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { registerHooks } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { algorithmCheckpointsBySlug } from '../src/data/algorithmCheckpoints.ts'
import {
  pythonDataToolsContract,
  pythonDataToolsOutputIds,
  type NotebookCellRole,
} from '../src/data/pythonNotebookContract.ts'
import {
  BIKE_SHARING_COLUMNS,
  parseBikeSharingCsv,
  sha256,
  validateBikeSharingRecords,
  verifyBikeSharingSnapshot,
} from '../scripts/python-data-tools/bikeSharingContract.mjs'

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === './algorithmCheckpoints') {
      return nextResolve('./algorithmCheckpoints.ts', context)
    }
    return nextResolve(specifier, context)
  },
})

const { pythonNotebookModule } = await import('../src/data/pythonNotebookModule.ts')

const chapterIds = [
  'notebook-workflow',
  'numpy-foundations',
  'pandas-structures',
  'pandas-analysis',
  'matplotlib-visualization',
  'seaborn-statistics',
  'plotly-exploration',
  'analysis-report',
] as const

const outputIds = [
  'dataset-shape-schema',
  'hourly-demand-profile',
  'workingday-comparison',
  'season-weather-distribution',
  'rider-composition',
  'pearson-correlation-matrix',
  'plotly-hourly-explorer',
  'final-analysis-evidence',
] as const

const validCsv = `${BIKE_SHARING_COLUMNS.join(',')}\n1,2011-01-01,1,0,1,0,0,6,0,1,0.24,0.2879,0.81,0,3,13,16\n2,2011-01-01,1,0,1,1,0,6,0,1,0.22,0.2727,0.8,0,8,32,40\n`

const validBytes = new TextEncoder().encode(validCsv)
const snapshotDirectory = new URL('../public/datasets/python-data-tools/', import.meta.url)
const notebookEnvironmentDirectory = new URL('../public/notebooks/python-data-tools/', import.meta.url)

const lockedRequirements = [
  'numpy==2.4.6',
  'pandas==3.0.3',
  'matplotlib==3.10.9',
  'seaborn==0.13.2',
  'plotly==6.9.0',
  'nbformat==5.10.4',
  'jupyterlab==4.6.1',
]

test('Python data tools contract fixes the eight-chapter bilingual course order', () => {
  assert.equal(pythonDataToolsContract.moduleId, 'python-notebook')
  assert.equal(pythonDataToolsContract.route, '/learn/python-notebook')
  assert.deepEqual(pythonDataToolsContract.chapters.map(({ id }) => id), chapterIds)
  for (const chapter of pythonDataToolsContract.chapters) {
    assert.ok(chapter.title['zh-CN'].trim())
    assert.ok(chapter.title.en.trim())
    assert.ok(chapter.question['zh-CN'].trim())
    assert.ok(chapter.question.en.trim())
  }
})

test('contract defines stable cell roles, exercise mounts, and authoritative outputs', () => {
  const roles: NotebookCellRole[] = [
    'question', 'setup', 'data', 'compute', 'visualize', 'interpret', 'limit', 'handoff',
  ]
  assert.deepEqual(pythonDataToolsContract.cellRoles, roles)
  assert.deepEqual(
    pythonDataToolsContract.exerciseMounts.map(({ chapterId, kind }) => [chapterId, kind]),
    [
      ['numpy-foundations', 'shape-index'],
      ['pandas-analysis', 'filter-groupby'],
      ['matplotlib-visualization', 'chart-choice'],
      ['seaborn-statistics', 'interpret-correlation'],
      ['plotly-exploration', 'interactive-encoding'],
    ],
  )
  assert.deepEqual(pythonDataToolsOutputIds, outputIds)
  assert.deepEqual(pythonDataToolsContract.outputs.map(({ id }) => id), outputIds)
  assert.ok(pythonDataToolsContract.outputs.every(({ generator }) => generator.startsWith('scripts/python-data-tools/')))
  assert.equal(new Set(pythonDataToolsContract.outputs.map(({ cellId }) => cellId)).size, pythonDataToolsOutputIds.length)
  assert.ok(pythonDataToolsContract.outputs.every(({ datasetBinding }) => datasetBinding === 'manifest:file.sha256'))
  assert.ok(pythonDataToolsContract.outputs.every(({ environmentContractVersion }) => environmentContractVersion === 'python-data-tools-v1'))
})

test('Python data tools environment locks dependencies and binds the verified dataset', async () => {
  const [requirementsSource, environmentSource, manifestSource] = await Promise.all([
    readFile(new URL('requirements.txt', notebookEnvironmentDirectory), 'utf8'),
    readFile(new URL('environment.json', notebookEnvironmentDirectory), 'utf8'),
    readFile(new URL('manifest.json', snapshotDirectory), 'utf8'),
  ])
  const environment = JSON.parse(environmentSource)
  const manifest = JSON.parse(manifestSource)

  assert.equal(requirementsSource, `${lockedRequirements.join('\n')}\n`)
  assert.deepEqual(environment, {
    contractVersion: 'python-data-tools-v1',
    python: '3.12.13',
    generatedAt: '2026-07-14',
    generatedOn: 'darwin-arm64',
    dataset: {
      publicPath: manifest.file.publicPath,
      sha256: manifest.file.sha256,
    },
    execution: {
      cleanKernel: true,
      runOrder: 'top-to-bottom',
      networkAccess: false,
      hiddenState: false,
      randomSeedRequired: true,
      hiddenSampling: false,
      numericJson: 'finite-only',
      cellRoles: pythonDataToolsContract.cellRoles,
    },
  })
})

test('environment writer is deterministic and rejects invalid hashes before overwriting', async () => {
  const { buildEnvironment, writeEnvironment } = await import('../scripts/python-data-tools/write-environment.mjs')
  const directory = await mkdtemp(join(tmpdir(), 'ml-atlas-environment-test-'))
  const manifestPath = join(directory, 'manifest.json')
  const outputPath = join(directory, 'environment.json')
  const validManifest = {
    contractVersion: 'python-data-tools-v1',
    file: {
      publicPath: '/datasets/python-data-tools/bike-sharing-hour.csv',
      sha256: 'a'.repeat(64),
    },
  }

  try {
    await writeFile(manifestPath, `${JSON.stringify(validManifest)}\n`)
    await writeEnvironment({ manifestPath, outputPath })
    const firstBytes = await readFile(outputPath)
    await writeEnvironment({ manifestPath, outputPath })
    assert.deepEqual(await readFile(outputPath), firstBytes)

    await writeFile(manifestPath, `${JSON.stringify({
      ...validManifest,
      file: { ...validManifest.file, sha256: 'INVALID' },
    })}\n`)
    await assert.rejects(
      writeEnvironment({ manifestPath, outputPath }),
      /manifest\.file\.sha256.*64 lowercase hexadecimal/i,
    )
    assert.deepEqual(await readFile(outputPath), firstBytes)

    assert.throws(
      () => buildEnvironment({ ...validManifest, contractVersion: 'python-data-tools-v2' }),
      /contractVersion.*python-data-tools-v1/i,
    )
    assert.throws(
      () => buildEnvironment({
        ...validManifest,
        file: { ...validManifest.file, publicPath: 'https://example.com/hour.csv' },
      }),
      /manifest\.file\.publicPath.*absolute local public path/i,
    )
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('environment writer reproduces the committed artifact byte for byte from the real manifest', async () => {
  const { writeEnvironment } = await import('../scripts/python-data-tools/write-environment.mjs')
  const directory = await mkdtemp(join(tmpdir(), 'ml-atlas-environment-drift-test-'))
  const outputPath = join(directory, 'environment.json')
  const committedBytes = await readFile(new URL('environment.json', notebookEnvironmentDirectory))

  try {
    await writeEnvironment({
      manifestPath: new URL('manifest.json', snapshotDirectory),
      outputPath,
    })
    assert.deepEqual(await readFile(outputPath), committedBytes)

    await writeEnvironment({
      manifestPath: new URL('manifest.json', snapshotDirectory),
      outputPath,
    })
    assert.deepEqual(await readFile(outputPath), committedBytes)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('environment publication preserves prior bytes and cleans its temp file when rename fails', async () => {
  const { writeEnvironment } = await import('../scripts/python-data-tools/write-environment.mjs')
  const directory = await mkdtemp(join(tmpdir(), 'ml-atlas-environment-atomic-test-'))
  const manifestPath = join(directory, 'manifest.json')
  const outputPath = join(directory, 'environment.json')
  const priorBytes = Buffer.from('prior environment bytes\n')
  const manifest = {
    contractVersion: 'python-data-tools-v1',
    file: {
      publicPath: '/datasets/python-data-tools/bike-sharing-hour.csv',
      sha256: 'b'.repeat(64),
    },
  }
  await Promise.all([
    writeFile(manifestPath, `${JSON.stringify(manifest)}\n`),
    writeFile(outputPath, priorBytes),
  ])

  try {
    await assert.rejects(
      writeEnvironment({
        manifestPath,
        outputPath,
        fileOperations: {
          async rename() {
            throw new Error('simulated atomic rename failure')
          },
        },
      }),
      /simulated atomic rename failure/i,
    )
    assert.deepEqual(await readFile(outputPath), priorBytes)
    assert.deepEqual((await readdir(directory)).sort(), ['environment.json', 'manifest.json'])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('phase 1 preserves the existing runtime lesson and checkpoint boundary', () => {
  assert.equal(pythonNotebookModule.slug, 'python-notebook')
  assert.equal(pythonNotebookModule.route, '/learn/python-notebook')
  assert.deepEqual(
    pythonNotebookModule.chapters.map(({ id }) => id),
    [
      'notebook-rhythm',
      'numpy-arrays',
      'pandas-tables',
      'sklearn-small-model',
      'reproducible-handoff',
    ],
  )
  assert.strictEqual(
    pythonNotebookModule.checkpoints,
    algorithmCheckpointsBySlug['python-notebook'],
  )
})

test('Bike Sharing CSV parser preserves the fixed schema and valid string records', () => {
  const parsed = parseBikeSharingCsv(`\uFEFF${validCsv.replaceAll('\n', '\r\n')}`)

  assert.deepEqual(parsed.columns, BIKE_SHARING_COLUMNS)
  assert.equal(parsed.records.length, 2)
  assert.equal(parsed.records[0].instant, '1')
  assert.equal(parsed.records[1].cnt, '40')
  assert.deepEqual(validateBikeSharingRecords(parsed.records), [])
})

test('Bike Sharing parser rejects schema drift with an actionable column position', () => {
  const wrongHeader = validCsv.replace('dteday', 'date')
  assert.throws(
    () => parseBikeSharingCsv(wrongHeader),
    /header column 2.*expected "dteday".*received "date"/i,
  )
})

test('Bike Sharing record validation reports duplicate ids, ranges, dates, and count arithmetic', () => {
  const { records } = parseBikeSharingCsv(validCsv)
  const invalid = records.map((record) => ({ ...record }))
  invalid[1].instant = '1'
  invalid[1].hr = '24'
  invalid[1].dteday = '2011-02-30'
  invalid[1].cnt = '41'

  const issues = validateBikeSharingRecords(invalid).join('\n')
  assert.match(issues, /row 3.*instant.*duplicate/i)
  assert.match(issues, /row 3.*hr.*0.*23/i)
  assert.match(issues, /row 3.*dteday.*2011-02-30/i)
  assert.match(issues, /row 3.*cnt.*casual.*registered/i)
})

test('Bike Sharing validation rejects non-finite and out-of-range normalized values', () => {
  const { records } = parseBikeSharingCsv(validCsv)
  const invalid = records.map((record) => ({ ...record }))
  invalid[0].temp = 'Infinity'
  invalid[0].hum = '1.01'

  const issues = validateBikeSharingRecords(invalid).join('\n')
  assert.match(issues, /row 2.*temp.*finite.*0.*1/i)
  assert.match(issues, /row 2.*hum.*0.*1/i)
})

test('Bike Sharing count arithmetic remains exact beyond Number safe integers', () => {
  const { records } = parseBikeSharingCsv(validCsv)
  const invalid = records.map((record) => ({ ...record }))
  invalid[0].casual = '9007199254740992'
  invalid[0].registered = '1'
  invalid[0].cnt = '9007199254740992'

  assert.match(
    validateBikeSharingRecords(invalid).join('\n'),
    /row 2.*cnt.*casual.*registered.*9007199254740993/i,
  )
})

test('Bike Sharing row validation returns diagnostics for Symbol and BigInt values', () => {
  const { records } = parseBikeSharingCsv(validCsv)
  const malformed: Record<string, unknown>[] = records.map((record) => ({ ...record }))
  malformed[0].temp = Symbol('not-numeric')
  malformed[0].hr = 24n

  let issues: string[] = []
  assert.doesNotThrow(() => {
    issues = validateBikeSharingRecords(malformed)
  })
  assert.match(issues.join('\n'), /row 2.*temp.*Symbol\(not-numeric\)/i)
  assert.match(issues.join('\n'), /row 2.*hr.*24n/i)
})

test('Bike Sharing parser handles escaped quoted cells and rejects empty datasets', () => {
  const quoted = validCsv.replace('2011-01-01', '"2011-""01""-01"')
  assert.equal(parseBikeSharingCsv(quoted).records[0].dteday, '2011-"01"-01')
  assert.throws(() => parseBikeSharingCsv(`${BIKE_SHARING_COLUMNS.join(',')}\n`), /no data rows/i)
  assert.match(validateBikeSharingRecords([]).join('\n'), /no records/i)
})

test('Bike Sharing snapshot verification reports hashes and manifest mismatches', () => {
  const expectedHash = sha256(validBytes)
  assert.match(expectedHash, /^[a-f0-9]{64}$/)
  assert.equal(expectedHash, '2f867b1b03a8882bbc55c55785e965af9dc83b8767830c8d16ead3a8884e95c1')

  const matching = verifyBikeSharingSnapshot(validBytes, {
    file: {
      sha256: expectedHash,
      bytes: validBytes.byteLength,
      rows: 2,
      columns: 17,
      columnOrder: BIKE_SHARING_COLUMNS,
    },
  })
  assert.deepEqual(matching.issues, [])

  const result = verifyBikeSharingSnapshot(validBytes, {
    file: {
      sha256: '0'.repeat(64),
      bytes: validBytes.byteLength + 1,
      rows: 3,
      columns: 16,
      columnOrder: [...BIKE_SHARING_COLUMNS].reverse(),
    },
  })

  assert.equal(result.observed.sha256, expectedHash)
  assert.equal(result.observed.rows, 2)
  assert.equal(result.observed.columns, 17)
  assert.deepEqual(result.observed.columnOrder, BIKE_SHARING_COLUMNS)
  const issues = result.issues.join('\n')
  for (const field of ['sha256', 'bytes', 'rows', 'columns', 'columnOrder']) {
    assert.match(issues, new RegExp(field, 'i'))
  }

  assert.throws(
    () => verifyBikeSharingSnapshot(Uint8Array.from([0xc3, 0x28]), { file: {} }),
    /encoded data was not valid|utf-8/i,
  )
})

test('committed Bike Sharing snapshot and manifest match the verified official bytes', async () => {
  const [bytes, manifestSource] = await Promise.all([
    readFile(new URL('bike-sharing-hour.csv', snapshotDirectory)),
    readFile(new URL('manifest.json', snapshotDirectory), 'utf8'),
  ])
  const manifest = JSON.parse(manifestSource)
  const result = verifyBikeSharingSnapshot(bytes, manifest)

  assert.deepEqual(result.issues, [])
  assert.equal(manifest.contractVersion, 'python-data-tools-v1')
  assert.equal(manifest.dataset.doi, '10.24432/C5W894')
  assert.equal(manifest.dataset.license.id, 'CC-BY-4.0')
  assert.equal(manifest.file.upstreamName, 'hour.csv')
  assert.equal(manifest.file.publicPath, '/datasets/python-data-tools/bike-sharing-hour.csv')
  assert.equal(manifest.file.encoding, 'utf-8')
  assert.equal(manifest.file.delimiter, 'comma')
  assert.equal(manifest.file.rows, result.observed.rows)
  assert.equal(manifest.file.bytes, bytes.byteLength)
  assert.equal(manifest.file.columns, BIKE_SHARING_COLUMNS.length)
  assert.deepEqual(manifest.file.columnOrder, BIKE_SHARING_COLUMNS)
  assert.ok(manifest.file.rows > 0)
  assert.match(manifest.file.sha256, /^[a-f0-9]{64}$/)
  assert.doesNotMatch(manifest.file.publicPath, /^https?:/)
})

test('Bike Sharing data dictionary preserves the exact schema and semantics', async () => {
  const dictionary = JSON.parse(
    await readFile(new URL('data-dictionary.json', snapshotDirectory), 'utf8'),
  )
  const acceptedRoles = new Set([
    'identifier-time',
    'calendar-category',
    'weather-category',
    'normalized-continuous',
    'count',
  ])

  assert.equal(dictionary.version, 'bike-sharing-hour-v1')
  assert.deepEqual(dictionary.fields.map(({ name }: { name: string }) => name), BIKE_SHARING_COLUMNS)
  assert.equal(dictionary.fields.length, 17)
  for (const field of dictionary.fields) {
    assert.ok(field.name)
    assert.ok(field.label['zh-CN'].trim())
    assert.ok(field.label.en.trim())
    assert.ok(field.description['zh-CN'].trim())
    assert.ok(field.description.en.trim())
    assert.ok(field.type)
    assert.ok(acceptedRoles.has(field.role), `unexpected role for ${field.name}: ${field.role}`)
    assert.ok(field.range || field.categories || field.relationship, `missing constraints for ${field.name}`)
  }

  const byName = Object.fromEntries(dictionary.fields.map((field: { name: string }) => [field.name, field]))
  const expectedRoles = {
    instant: 'identifier-time', dteday: 'identifier-time', season: 'calendar-category',
    yr: 'identifier-time', mnth: 'identifier-time', hr: 'identifier-time',
    holiday: 'calendar-category', weekday: 'identifier-time', workingday: 'calendar-category',
    weathersit: 'weather-category', temp: 'normalized-continuous',
    atemp: 'normalized-continuous', hum: 'normalized-continuous',
    windspeed: 'normalized-continuous', casual: 'count', registered: 'count', cnt: 'count',
  }
  assert.deepEqual(
    Object.fromEntries(dictionary.fields.map((field: { name: string, role: string }) => [field.name, field.role])),
    expectedRoles,
  )
  for (const field of dictionary.fields.filter((candidate: { categories?: unknown }) => candidate.categories)) {
    for (const [value, category] of Object.entries(field.categories)) {
      assert.equal(typeof category, 'object', `${field.name} category ${value} must be localized`)
      assert.ok(category['zh-CN'].trim(), `${field.name} category ${value} needs a zh-CN value`)
      assert.ok(category.en.trim(), `${field.name} category ${value} needs an en value`)
    }
  }
  assert.equal(byName.temp.normalization, 'celsius / 41')
  assert.equal(byName.atemp.normalization, 'apparent celsius / 50')
  assert.equal(byName.hum.normalization, 'relative humidity / 100')
  assert.equal(byName.windspeed.normalization, 'wind speed / 67')
  assert.equal(byName.cnt.relationship, 'cnt = casual + registered')
  assert.deepEqual(Object.keys(byName.season.categories), ['1', '2', '3', '4'])
  assert.deepEqual(Object.keys(byName.yr.categories), ['0', '1'])
  assert.deepEqual(Object.keys(byName.weekday.categories), ['0', '1', '2', '3', '4', '5', '6'])
  assert.deepEqual(Object.keys(byName.weathersit.categories), ['1', '2', '3', '4'])
  assert.deepEqual(Object.keys(byName.holiday.categories), ['0', '1'])
  assert.deepEqual(Object.keys(byName.workingday.categories), ['0', '1'])
})

test('Bike Sharing archive selector requires one unique hour.csv basename', async () => {
  const { selectHourCsvEntry } = await import('../scripts/python-data-tools/fetch-bike-sharing.mjs')

  assert.equal(selectHourCsvEntry(['README.txt', 'nested/hour.csv']), 'nested/hour.csv')
  assert.throws(() => selectHourCsvEntry(['day.csv']), /exactly one.*found 0/i)
  assert.throws(
    () => selectHourCsvEntry(['hour.csv', 'nested/hour.csv']),
    /exactly one.*found 2.*hour\.csv.*nested\/hour\.csv/i,
  )
})

test('Bike Sharing artifact publication is atomic and cleans transaction files', async () => {
  const { publishSnapshotPair } = await import('../scripts/python-data-tools/fetch-bike-sharing.mjs')
  const directory = await mkdtemp(join(tmpdir(), 'ml-atlas-publish-test-'))
  const csvPath = join(directory, 'snapshot.csv')
  const manifestPath = join(directory, 'manifest.json')
  await writeFile(csvPath, 'prior csv')
  await writeFile(manifestPath, 'prior manifest')

  try {
    await assert.rejects(
      publishSnapshotPair({
        csvPath,
        manifestPath,
        csvBytes: Buffer.from('new csv'),
        manifestBytes: Buffer.from('new manifest'),
        checkpoint(stage: string) {
          if (stage === 'csv-published') throw new Error('simulated manifest publication failure')
        },
      }),
      /simulated manifest publication failure/,
    )
    assert.equal(await readFile(csvPath, 'utf8'), 'prior csv')
    assert.equal(await readFile(manifestPath, 'utf8'), 'prior manifest')
    assert.deepEqual((await readdir(directory)).sort(), ['manifest.json', 'snapshot.csv'])

    await assert.rejects(
      publishSnapshotPair({
        csvPath,
        manifestPath,
        csvBytes: Buffer.from('unverified csv'),
        manifestBytes: Buffer.from('unverified manifest'),
        verify: async () => {
          throw new Error('simulated post-write verification failure')
        },
      }),
      /simulated post-write verification failure/,
    )
    assert.equal(await readFile(csvPath, 'utf8'), 'prior csv')
    assert.equal(await readFile(manifestPath, 'utf8'), 'prior manifest')
    assert.deepEqual((await readdir(directory)).sort(), ['manifest.json', 'snapshot.csv'])

    await publishSnapshotPair({
      csvPath,
      manifestPath,
      csvBytes: Buffer.from('new csv'),
      manifestBytes: Buffer.from('new manifest'),
      verify: async () => {
        assert.equal(await readFile(csvPath, 'utf8'), 'new csv')
        assert.equal(await readFile(manifestPath, 'utf8'), 'new manifest')
      },
    })
    assert.equal(await readFile(csvPath, 'utf8'), 'new csv')
    assert.equal(await readFile(manifestPath, 'utf8'), 'new manifest')
    assert.deepEqual((await readdir(directory)).sort(), ['manifest.json', 'snapshot.csv'])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('verified publication stays committed when one backup cleanup fails', async () => {
  const { publishSnapshotPair } = await import('../scripts/python-data-tools/fetch-bike-sharing.mjs')
  const directory = await mkdtemp(join(tmpdir(), 'ml-atlas-cleanup-test-'))
  const csvPath = join(directory, 'snapshot.csv')
  const manifestPath = join(directory, 'manifest.json')
  await writeFile(csvPath, 'prior csv')
  await writeFile(manifestPath, 'prior manifest')

  try {
    const result = await publishSnapshotPair({
      csvPath,
      manifestPath,
      csvBytes: Buffer.from('verified csv'),
      manifestBytes: Buffer.from('verified manifest'),
      transactionId: 'cleanup-failure',
      remove: async (path: string, options: { force?: boolean }) => {
        if (path === `${manifestPath}.previous.cleanup-failure`) {
          throw new Error('simulated second backup cleanup failure')
        }
        return rm(path, options)
      },
      verify: async () => {
        assert.equal(await readFile(csvPath, 'utf8'), 'verified csv')
        assert.equal(await readFile(manifestPath, 'utf8'), 'verified manifest')
      },
    })

    assert.equal(await readFile(csvPath, 'utf8'), 'verified csv')
    assert.equal(await readFile(manifestPath, 'utf8'), 'verified manifest')
    assert.equal(result.warnings.length, 1)
    assert.match(result.warnings[0], /second backup cleanup failure/i)
    assert.deepEqual((await readdir(directory)).sort(), [
      'manifest.json',
      'manifest.json.previous.cleanup-failure',
      'snapshot.csv',
    ])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('existing updater lock rejects without touching finals or transaction artifacts', async () => {
  const { publishSnapshotPair } = await import('../scripts/python-data-tools/fetch-bike-sharing.mjs')
  const directory = await mkdtemp(join(tmpdir(), 'ml-atlas-lock-test-'))
  const csvPath = join(directory, 'snapshot.csv')
  const manifestPath = join(directory, 'manifest.json')
  const lockPath = `${manifestPath}.lock`
  const staleNextPath = `${csvPath}.next.stale-owner`
  const stalePreviousPath = `${manifestPath}.previous.stale-owner`
  await Promise.all([
    writeFile(csvPath, 'prior csv'),
    writeFile(manifestPath, 'prior manifest'),
    writeFile(lockPath, 'stale-owner'),
    writeFile(staleNextPath, 'stale next'),
    writeFile(stalePreviousPath, 'stale previous'),
  ])
  const before = await Promise.all((await readdir(directory)).sort().map(async (name) => [
    name,
    await readFile(join(directory, name), 'utf8'),
  ]))

  try {
    await assert.rejects(
      publishSnapshotPair({
        csvPath,
        manifestPath,
        csvBytes: Buffer.from('new csv'),
        manifestBytes: Buffer.from('new manifest'),
        transactionId: 'new-owner',
      }),
      /lock.*already exists|already in progress/i,
    )
    const after = await Promise.all((await readdir(directory)).sort().map(async (name) => [
      name,
      await readFile(join(directory, name), 'utf8'),
    ]))
    assert.deepEqual(after, before)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('Bike Sharing response reader enforces the compressed download limit', async () => {
  const { readResponseBytes } = await import('../scripts/python-data-tools/fetch-bike-sharing.mjs')
  let reads = 0
  const chunks = [Uint8Array.from({ length: 6 }, () => 1), Uint8Array.from({ length: 3 }, () => 2)]
  const response = {
    headers: { get: () => null },
    body: {
      getReader() {
        return {
          async read() {
            const value = chunks[reads]
            reads += 1
            return value ? { done: false, value } : { done: true, value: undefined }
          },
          async cancel() {},
        }
      },
    },
  }

  await assert.rejects(readResponseBytes(response, 8), /exceeded.*8.*byte limit/i)
  assert.equal(reads, 2)
})

test('Bike Sharing source record documents attribution, local runtime, and review policy', async () => {
  const source = await readFile(
    new URL('../docs/curriculum-v3/python-data-tools/sources.md', import.meta.url),
    'utf8',
  )

  for (const required of [
    'UCI Machine Learning Repository',
    '10.24432/C5W894',
    'CC BY 4.0',
    'hour.csv',
    'node scripts/python-data-tools/fetch-bike-sharing.mjs',
    'node scripts/python-data-tools/verify-bike-sharing.mjs',
  ]) {
    assert.match(source, new RegExp(required.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
  assert.match(source, /浏览器.*不.*远程|不.*运行时.*远程/s)
  assert.match(source, /browser.*never fetch.*remote.*runtime/i)
  assert.match(source, /本地.*不可变.*快照|不可变.*本地.*快照/s)
  assert.match(source, /local immutable snapshot/i)
  assert.match(source, /hash.*schema.*row.*invariant.*manual review/is)
})
