import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { registerHooks } from 'node:module'
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
  assert.equal(byName.temp.normalization, 'celsius / 41')
  assert.equal(byName.atemp.normalization, 'apparent celsius / 50')
  assert.equal(byName.hum.normalization, 'relative humidity / 100')
  assert.equal(byName.windspeed.normalization, 'wind speed / 67')
  assert.equal(byName.cnt.relationship, 'cnt = casual + registered')
  assert.deepEqual(byName.season.categories, { 1: 'spring', 2: 'summer', 3: 'fall', 4: 'winter' })
  assert.deepEqual(byName.yr.categories, { 0: '2011', 1: '2012' })
  assert.deepEqual(byName.weekday.categories, {
    0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
    4: 'Thursday', 5: 'Friday', 6: 'Saturday',
  })
  assert.deepEqual(byName.weathersit.categories, {
    1: 'clear/few/partly cloudy',
    2: 'mist/cloudy',
    3: 'light snow/rain with thunderstorm/scattered clouds',
    4: 'heavy rain/ice pellets/thunderstorm/mist/snow',
  })
  assert.deepEqual(byName.holiday.categories, { 0: 'no', 1: 'yes' })
  assert.deepEqual(byName.workingday.categories, {
    0: 'weekend or holiday',
    1: 'neither weekend nor holiday',
  })
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
