import test from 'node:test'
import assert from 'node:assert/strict'
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
