# Python Data Tools Phase 1 Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a typed, offline-verifiable Bike Sharing dataset and notebook execution contract for the existing `python-notebook` course without changing its runtime lesson.

**Architecture:** Keep learner-facing runtime code untouched while adding a typed TypeScript contract, a checked-in UCI `hour.csv` snapshot, Node-based fetch/verification scripts, and versioned notebook-environment metadata. Tests import the TypeScript contract directly and exercise the pure verifier with synthetic rows before validating the real snapshot, so failures identify schema or invariant drift without requiring network access.

**Tech Stack:** Vue 3 repository conventions, TypeScript 5.9, Node 24 test runner, Node ESM scripts, UCI Bike Sharing CSV, JSON manifests, Markdown provenance docs.

---

## File map

### Create

- `src/data/pythonNotebookContract.ts` — typed eight-chapter order, cell roles, exercise mounts, authoritative outputs, final-report and Data Lab handoff metadata.
- `scripts/python-data-tools/bikeSharingContract.mjs` — pure CSV parsing, hashing, schema/range/invariant validation, and manifest comparison.
- `scripts/python-data-tools/verify-bike-sharing.mjs` — offline CLI around the pure verifier.
- `scripts/python-data-tools/fetch-bike-sharing.mjs` — explicit maintainer-only UCI download/update command.
- `scripts/python-data-tools/write-environment.mjs` — deterministic environment metadata writer bound to the current dataset manifest.
- `public/datasets/python-data-tools/bike-sharing-hour.csv` — immutable local `hour.csv` snapshot.
- `public/datasets/python-data-tools/manifest.json` — computed source, license, checksum, byte-size, row-count, column-count, and schema record.
- `public/datasets/python-data-tools/data-dictionary.json` — bilingual field semantics and allowed values.
- `public/notebooks/python-data-tools/environment.json` — Python/runtime contract bound to the dataset hash.
- `public/notebooks/python-data-tools/requirements.txt` — exact Python package pins.
- `docs/curriculum-v3/python-data-tools/sources.md` — attribution, license, update, and offline verification instructions.
- `tests/python-data-tools-contract.test.ts` — typed contract, pure verifier, real snapshot, environment, provenance, and runtime-boundary tests.

### Modify

- `.planning/STATE.md` — replace stale “V3.1 not started” status with factual completed-slice and current-stage state.
- `.planning/ROADMAP.md` — record AI Overview and Math-to-Code completion plus the five Python Data Tools stages.

### Explicitly unchanged

- `src/data/pythonNotebookModule.ts`
- `src/data/algorithmCheckpoints.ts`
- `src/components/AppliedWorkflowLessonLab.vue`
- routes, progress stores, Data Lab content, generated images, and `docs/gpt_advice.md`

## Task 1: Add the typed eight-chapter contract

**Files:**
- Create: `src/data/pythonNotebookContract.ts`
- Create: `tests/python-data-tools-contract.test.ts`

- [ ] **Step 1: Write the failing contract test**

Create `tests/python-data-tools-contract.test.ts` with the contract assertions below. The later tasks append verifier and artifact tests to this same file.

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  pythonDataToolsContract,
  pythonDataToolsOutputIds,
  type NotebookCellRole,
} from '../src/data/pythonNotebookContract.ts'

const root = new URL('../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')

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
  assert.deepEqual(pythonDataToolsContract.outputs.map(({ id }) => id), pythonDataToolsOutputIds)
  assert.ok(pythonDataToolsContract.outputs.every(({ generator }) => generator.startsWith('scripts/python-data-tools/')))
  assert.equal(new Set(pythonDataToolsContract.outputs.map(({ cellId }) => cellId)).size, pythonDataToolsOutputIds.length)
  assert.ok(pythonDataToolsContract.outputs.every(({ datasetBinding }) => datasetBinding === 'manifest:file.sha256'))
  assert.ok(pythonDataToolsContract.outputs.every(({ environmentContractVersion }) => environmentContractVersion === 'python-data-tools-v1'))
})

test('phase 1 preserves the existing runtime lesson and checkpoint boundary', () => {
  const moduleSource = read('src/data/pythonNotebookModule.ts')
  assert.match(moduleSource, /slug: 'python-notebook'/)
  assert.match(moduleSource, /route: '\/learn\/python-notebook'/)
  assert.equal([...moduleSource.matchAll(/chapter\(\s*'/g)].length, 5)
  for (const id of [
    'notebook-rhythm', 'numpy-arrays', 'pandas-tables',
    'sklearn-small-model', 'reproducible-handoff',
  ]) assert.match(moduleSource, new RegExp(`chapter\\(\\s*'${id}'`))
})
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run:

```bash
node --test tests/python-data-tools-contract.test.ts
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/data/pythonNotebookContract.ts`.

- [ ] **Step 3: Implement the minimal typed contract**

Create `src/data/pythonNotebookContract.ts`:

```ts
import type { LocalizedCopy } from '../types/ml.ts'

export type PythonDataToolsChapterId =
  | 'notebook-workflow'
  | 'numpy-foundations'
  | 'pandas-structures'
  | 'pandas-analysis'
  | 'matplotlib-visualization'
  | 'seaborn-statistics'
  | 'plotly-exploration'
  | 'analysis-report'

export type NotebookCellRole =
  | 'question' | 'setup' | 'data' | 'compute'
  | 'visualize' | 'interpret' | 'limit' | 'handoff'

export type PythonDataToolsOutputId =
  | 'dataset-shape-schema'
  | 'hourly-demand-profile'
  | 'workingday-comparison'
  | 'season-weather-distribution'
  | 'rider-composition'
  | 'pearson-correlation-matrix'
  | 'plotly-hourly-explorer'
  | 'final-analysis-evidence'

export type PythonDataToolsExerciseKind =
  | 'shape-index'
  | 'filter-groupby'
  | 'chart-choice'
  | 'interpret-correlation'
  | 'interactive-encoding'

export interface PythonDataToolsChapterContract {
  id: PythonDataToolsChapterId
  title: LocalizedCopy
  question: LocalizedCopy
}

export interface PythonDataToolsOutputContract {
  id: PythonDataToolsOutputId
  cellId: `output-${PythonDataToolsOutputId}`
  chapterId: PythonDataToolsChapterId
  kind: 'json' | 'png' | 'plotly-json'
  generator: `scripts/python-data-tools/${string}`
  datasetBinding: 'manifest:file.sha256'
  environmentContractVersion: 'python-data-tools-v1'
}

export interface PythonDataToolsContract {
  version: 'python-data-tools-v1'
  moduleId: 'python-notebook'
  route: '/learn/python-notebook'
  datasetPath: string
  environmentPath: string
  cellRoles: readonly NotebookCellRole[]
  chapters: readonly PythonDataToolsChapterContract[]
  exerciseMounts: readonly {
    chapterId: PythonDataToolsChapterId
    kind: PythonDataToolsExerciseKind
  }[]
  outputs: readonly PythonDataToolsOutputContract[]
  finalReport: {
    question: LocalizedCopy
    handoffRoute: '/data-lab'
    handoff: LocalizedCopy
  }
}

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

export const pythonDataToolsOutputIds = [
  'dataset-shape-schema',
  'hourly-demand-profile',
  'workingday-comparison',
  'season-weather-distribution',
  'rider-composition',
  'pearson-correlation-matrix',
  'plotly-hourly-explorer',
  'final-analysis-evidence',
] as const satisfies readonly PythonDataToolsOutputId[]

export const pythonDataToolsContract = {
  version: 'python-data-tools-v1',
  moduleId: 'python-notebook',
  route: '/learn/python-notebook',
  datasetPath: '/datasets/python-data-tools/bike-sharing-hour.csv',
  environmentPath: '/notebooks/python-data-tools/environment.json',
  cellRoles: [
    'question', 'setup', 'data', 'compute', 'visualize', 'interpret', 'limit', 'handoff',
  ],
  chapters: [
    { id: 'notebook-workflow', title: copy('Notebook 环境与可复现执行', 'Notebook Environment and Reproducible Execution'), question: copy('怎样让分析从干净内核按顺序重跑？', 'How can an analysis rerun in order from a clean kernel?') },
    { id: 'numpy-foundations', title: copy('NumPy 数组与向量化统计', 'NumPy Arrays and Vectorized Statistics'), question: copy('怎样用形状、索引和向量化计算读懂一列需求数据？', 'How do shape, indexing, and vectorized operations explain a demand column?') },
    { id: 'pandas-structures', title: copy('Pandas 表格结构', 'Pandas Table Structures'), question: copy('怎样保留共享单车字段的名称、类型和语义？', 'How do we preserve bike-sharing field names, types, and meaning?') },
    { id: 'pandas-analysis', title: copy('Pandas 分组分析', 'Pandas Grouped Analysis'), question: copy('怎样按时间、工作日和天气比较需求？', 'How can demand be compared by time, working day, and weather?') },
    { id: 'matplotlib-visualization', title: copy('Matplotlib 解释型图表', 'Explanatory Charts with Matplotlib'), question: copy('哪种图表能诚实地表达时段差异？', 'Which chart honestly communicates hourly differences?') },
    { id: 'seaborn-statistics', title: copy('Seaborn 分布、关系与相关', 'Distributions, Relationships, and Correlation with Seaborn'), question: copy('变量共同变化说明了什么，又不能说明什么？', 'What does co-variation show, and what can it not show?') },
    { id: 'plotly-exploration', title: copy('Plotly 交互探索', 'Interactive Exploration with Plotly'), question: copy('交互编码怎样帮助比较人群与条件？', 'How can interactive encodings compare rider groups and conditions?') },
    { id: 'analysis-report', title: copy('共享单车需求分析报告', 'Bike Sharing Demand Analysis Report'), question: copy('哪些证据可以支持对需求规律的解释？', 'Which evidence supports an explanation of demand patterns?') },
  ],
  exerciseMounts: [
    { chapterId: 'numpy-foundations', kind: 'shape-index' },
    { chapterId: 'pandas-analysis', kind: 'filter-groupby' },
    { chapterId: 'matplotlib-visualization', kind: 'chart-choice' },
    { chapterId: 'seaborn-statistics', kind: 'interpret-correlation' },
    { chapterId: 'plotly-exploration', kind: 'interactive-encoding' },
  ],
  outputs: [
    { id: 'dataset-shape-schema', cellId: 'output-dataset-shape-schema', chapterId: 'pandas-structures', kind: 'json', generator: 'scripts/python-data-tools/generate-authoritative-outputs.py', datasetBinding: 'manifest:file.sha256', environmentContractVersion: 'python-data-tools-v1' },
    { id: 'hourly-demand-profile', cellId: 'output-hourly-demand-profile', chapterId: 'matplotlib-visualization', kind: 'png', generator: 'scripts/python-data-tools/generate-authoritative-outputs.py', datasetBinding: 'manifest:file.sha256', environmentContractVersion: 'python-data-tools-v1' },
    { id: 'workingday-comparison', cellId: 'output-workingday-comparison', chapterId: 'pandas-analysis', kind: 'json', generator: 'scripts/python-data-tools/generate-authoritative-outputs.py', datasetBinding: 'manifest:file.sha256', environmentContractVersion: 'python-data-tools-v1' },
    { id: 'season-weather-distribution', cellId: 'output-season-weather-distribution', chapterId: 'seaborn-statistics', kind: 'png', generator: 'scripts/python-data-tools/generate-authoritative-outputs.py', datasetBinding: 'manifest:file.sha256', environmentContractVersion: 'python-data-tools-v1' },
    { id: 'rider-composition', cellId: 'output-rider-composition', chapterId: 'matplotlib-visualization', kind: 'png', generator: 'scripts/python-data-tools/generate-authoritative-outputs.py', datasetBinding: 'manifest:file.sha256', environmentContractVersion: 'python-data-tools-v1' },
    { id: 'pearson-correlation-matrix', cellId: 'output-pearson-correlation-matrix', chapterId: 'seaborn-statistics', kind: 'json', generator: 'scripts/python-data-tools/generate-authoritative-outputs.py', datasetBinding: 'manifest:file.sha256', environmentContractVersion: 'python-data-tools-v1' },
    { id: 'plotly-hourly-explorer', cellId: 'output-plotly-hourly-explorer', chapterId: 'plotly-exploration', kind: 'plotly-json', generator: 'scripts/python-data-tools/generate-authoritative-outputs.py', datasetBinding: 'manifest:file.sha256', environmentContractVersion: 'python-data-tools-v1' },
    { id: 'final-analysis-evidence', cellId: 'output-final-analysis-evidence', chapterId: 'analysis-report', kind: 'json', generator: 'scripts/python-data-tools/generate-authoritative-outputs.py', datasetBinding: 'manifest:file.sha256', environmentContractVersion: 'python-data-tools-v1' },
  ],
  finalReport: {
    question: copy('时间、工作日、季节、天气和用户构成怎样共同解释需求变化？', 'How do time, working days, seasons, weather, and rider composition explain demand changes?'),
    handoffRoute: '/data-lab',
    handoff: copy('本课程使用已准备好的快照；缺失、重复、异常类型和离群值处理请进入 Data Lab。', 'This course uses a prepared snapshot; use Data Lab for missing, duplicate, invalid-type, and outlier handling.'),
  },
} as const satisfies PythonDataToolsContract
```

- [ ] **Step 4: Run the focused test and build**

Run:

```bash
node --test tests/python-data-tools-contract.test.ts
npm run build
```

Expected: the three focused tests PASS; production build succeeds with only the existing large-chunk warning.

- [ ] **Step 5: Commit the typed contract**

```bash
git add src/data/pythonNotebookContract.ts tests/python-data-tools-contract.test.ts
git commit -m "feat: define Python data tools contract"
```

## Task 2: Build the pure offline dataset verifier

**Files:**
- Create: `scripts/python-data-tools/bikeSharingContract.mjs`
- Create: `scripts/python-data-tools/verify-bike-sharing.mjs`
- Modify: `tests/python-data-tools-contract.test.ts`

- [ ] **Step 1: Append failing pure-verifier tests**

Append imports and tests that use two synthetic valid records and explicit corruptions:

```ts
import {
  BIKE_SHARING_COLUMNS,
  parseBikeSharingCsv,
  validateBikeSharingRecords,
} from '../scripts/python-data-tools/bikeSharingContract.mjs'

const validCsv = `${BIKE_SHARING_COLUMNS.join(',')}\n1,2011-01-01,1,0,1,0,0,6,0,1,0.24,0.2879,0.81,0,3,13,16\n2,2011-01-01,1,0,1,1,0,6,0,1,0.22,0.2727,0.8,0,8,32,40\n`

test('pure bike-sharing verifier accepts valid records', () => {
  const parsed = parseBikeSharingCsv(validCsv)
  assert.deepEqual(parsed.columns, BIKE_SHARING_COLUMNS)
  assert.equal(parsed.records.length, 2)
  assert.deepEqual(validateBikeSharingRecords(parsed.records), [])
})

test('pure verifier reports schema, range, uniqueness, and count-sum failures', () => {
  assert.throws(() => parseBikeSharingCsv(validCsv.replace('instant,dteday', 'id,dteday')), /column 1.*instant/i)
  const parsed = parseBikeSharingCsv(validCsv)
  const broken = [
    parsed.records[0],
    { ...parsed.records[1], instant: '1', hr: '24', cnt: '39' },
  ]
  const issues = validateBikeSharingRecords(broken)
  assert.ok(issues.some((issue) => issue.includes('instant must be unique')))
  assert.ok(issues.some((issue) => issue.includes('hr must be an integer from 0 to 23')))
  assert.ok(issues.some((issue) => issue.includes('cnt must equal casual + registered')))
})
```

- [ ] **Step 2: Run the test and verify the missing verifier failure**

Run `node --test tests/python-data-tools-contract.test.ts`.

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/python-data-tools/bikeSharingContract.mjs`.

- [ ] **Step 3: Implement the pure verifier**

Create `scripts/python-data-tools/bikeSharingContract.mjs` with these public exports and rules:

```js
import { createHash } from 'node:crypto'

export const BIKE_SHARING_COLUMNS = [
  'instant', 'dteday', 'season', 'yr', 'mnth', 'hr', 'holiday', 'weekday',
  'workingday', 'weathersit', 'temp', 'atemp', 'hum', 'windspeed',
  'casual', 'registered', 'cnt',
]

export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')

function parseCsvLine(line) {
  const values = []
  let value = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"' && quoted && line[index + 1] === '"') { value += '"'; index += 1 }
    else if (char === '"') quoted = !quoted
    else if (char === ',' && !quoted) { values.push(value); value = '' }
    else value += char
  }
  if (quoted) throw new Error('CSV row has an unclosed quote')
  values.push(value)
  return values
}

export function parseBikeSharingCsv(source) {
  const lines = source.replace(/^\uFEFF/, '').trimEnd().split(/\r?\n/)
  const columns = parseCsvLine(lines.shift() ?? '')
  for (const [index, expected] of BIKE_SHARING_COLUMNS.entries()) {
    if (columns[index] !== expected) throw new Error(`column ${index + 1} must be ${expected}; received ${columns[index] ?? '[missing]'}`)
  }
  if (columns.length !== BIKE_SHARING_COLUMNS.length) throw new Error(`column count must be ${BIKE_SHARING_COLUMNS.length}; received ${columns.length}`)
  const records = lines.map((line, rowIndex) => {
    const values = parseCsvLine(line)
    if (values.length !== columns.length) throw new Error(`row ${rowIndex + 2} has ${values.length} columns; expected ${columns.length}`)
    return Object.fromEntries(columns.map((column, index) => [column, values[index]]))
  })
  return { columns, records }
}

const integerIn = (value, minimum, maximum) => Number.isInteger(Number(value)) && Number(value) >= minimum && Number(value) <= maximum
const finiteIn = (value, minimum, maximum) => Number.isFinite(Number(value)) && Number(value) >= minimum && Number(value) <= maximum

export function validateBikeSharingRecords(records) {
  const issues = []
  const instants = new Set()
  for (const [index, record] of records.entries()) {
    const row = index + 2
    if (!integerIn(record.instant, 1, Number.MAX_SAFE_INTEGER)) issues.push(`row ${row}: instant must be a positive integer`)
    if (instants.has(record.instant)) issues.push(`row ${row}: instant must be unique; repeated ${record.instant}`)
    instants.add(record.instant)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.dteday) || Number.isNaN(Date.parse(`${record.dteday}T00:00:00Z`))) issues.push(`row ${row}: dteday must be a valid YYYY-MM-DD date`)
    for (const [column, minimum, maximum] of [['season', 1, 4], ['yr', 0, 1], ['mnth', 1, 12], ['hr', 0, 23], ['holiday', 0, 1], ['weekday', 0, 6], ['workingday', 0, 1], ['weathersit', 1, 4]]) {
      if (!integerIn(record[column], minimum, maximum)) issues.push(`row ${row}: ${column} must be an integer from ${minimum} to ${maximum}`)
    }
    for (const column of ['temp', 'atemp', 'hum', 'windspeed']) {
      if (!finiteIn(record[column], 0, 1)) issues.push(`row ${row}: ${column} must be finite and normalized from 0 to 1`)
    }
    for (const column of ['casual', 'registered', 'cnt']) {
      if (!integerIn(record[column], 0, Number.MAX_SAFE_INTEGER)) issues.push(`row ${row}: ${column} must be a non-negative integer`)
    }
    if (Number(record.cnt) !== Number(record.casual) + Number(record.registered)) issues.push(`row ${row}: cnt must equal casual + registered`)
  }
  return issues
}

export function verifyBikeSharingSnapshot(bytes, manifest) {
  const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  const parsed = parseBikeSharingCsv(source)
  const issues = validateBikeSharingRecords(parsed.records)
  const observed = {
    sha256: sha256(bytes),
    bytes: bytes.byteLength,
    rows: parsed.records.length,
    columns: parsed.columns.length,
    columnOrder: parsed.columns,
  }
  for (const key of ['sha256', 'bytes', 'rows', 'columns']) {
    if (observed[key] !== manifest.file[key]) issues.push(`manifest ${key} mismatch: expected ${manifest.file[key]}, observed ${observed[key]}`)
  }
  if (JSON.stringify(observed.columnOrder) !== JSON.stringify(manifest.file.columnOrder)) issues.push('manifest columnOrder mismatch')
  return { observed, issues }
}
```

Create `scripts/python-data-tools/verify-bike-sharing.mjs`:

```js
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { verifyBikeSharingSnapshot } from './bikeSharingContract.mjs'

const root = new URL('../../', import.meta.url)
const datasetUrl = new URL('public/datasets/python-data-tools/bike-sharing-hour.csv', root)
const manifestUrl = new URL('public/datasets/python-data-tools/manifest.json', root)

try {
  const [bytes, manifestSource] = await Promise.all([readFile(datasetUrl), readFile(manifestUrl, 'utf8')])
  const result = verifyBikeSharingSnapshot(bytes, JSON.parse(manifestSource))
  if (result.issues.length) throw new Error(result.issues.join('\n'))
  console.log(`Bike Sharing snapshot verified: ${result.observed.rows} rows, sha256 ${result.observed.sha256}`)
} catch (error) {
  console.error(`Bike Sharing verification failed:\n${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}
```

- [ ] **Step 4: Run the pure tests**

Run `node --test tests/python-data-tools-contract.test.ts`.

Expected: all five tests PASS; the CLI is not run yet because the real snapshot does not exist.

- [ ] **Step 5: Commit the verifier**

```bash
git add scripts/python-data-tools/bikeSharingContract.mjs scripts/python-data-tools/verify-bike-sharing.mjs tests/python-data-tools-contract.test.ts
git commit -m "test: add Bike Sharing contract verifier"
```

## Task 3: Add and verify the authoritative UCI snapshot

**Files:**
- Create: `scripts/python-data-tools/fetch-bike-sharing.mjs`
- Create: `public/datasets/python-data-tools/bike-sharing-hour.csv`
- Create: `public/datasets/python-data-tools/manifest.json`
- Create: `public/datasets/python-data-tools/data-dictionary.json`
- Create: `docs/curriculum-v3/python-data-tools/sources.md`
- Modify: `tests/python-data-tools-contract.test.ts`

- [ ] **Step 1: Append failing real-artifact tests**

Append:

```ts
import { readFileSync as readBytes } from 'node:fs'
import { verifyBikeSharingSnapshot } from '../scripts/python-data-tools/bikeSharingContract.mjs'

test('checked-in UCI snapshot matches its computed manifest and invariants', () => {
  const bytes = readBytes(new URL('public/datasets/python-data-tools/bike-sharing-hour.csv', root))
  const manifest = JSON.parse(read('public/datasets/python-data-tools/manifest.json'))
  const result = verifyBikeSharingSnapshot(bytes, manifest)
  assert.deepEqual(result.issues, [])
  assert.equal(manifest.dataset.doi, '10.24432/C5W894')
  assert.equal(manifest.license.id, 'CC-BY-4.0')
  assert.equal(manifest.file.upstreamName, 'hour.csv')
})

test('bilingual data dictionary covers every authoritative field', () => {
  const dictionary = JSON.parse(read('public/datasets/python-data-tools/data-dictionary.json'))
  assert.deepEqual(dictionary.fields.map(({ name }: { name: string }) => name), BIKE_SHARING_COLUMNS)
  for (const field of dictionary.fields) {
    assert.ok(field.label['zh-CN'].trim())
    assert.ok(field.label.en.trim())
    assert.ok(field.description['zh-CN'].trim())
    assert.ok(field.description.en.trim())
    assert.ok(['identifier-time', 'calendar-category', 'weather-category', 'normalized-continuous', 'count'].includes(field.role))
  }
})

test('source record documents attribution, license, immutable local use, and update command', () => {
  const source = read('docs/curriculum-v3/python-data-tools/sources.md')
  for (const token of ['UCI Machine Learning Repository', '10.24432/C5W894', 'CC BY 4.0', 'hour.csv', 'verify-bike-sharing.mjs', 'fetch-bike-sharing.mjs']) assert.match(source, new RegExp(token.replaceAll('.', '\\.')))
  assert.match(source, /浏览器.*不.*远程|browser.*not.*remote/is)
})
```

- [ ] **Step 2: Run the test and verify missing artifacts fail**

Run `node --test tests/python-data-tools-contract.test.ts`.

Expected: FAIL with `ENOENT` for `public/datasets/python-data-tools/bike-sharing-hour.csv`.

- [ ] **Step 3: Implement the explicit fetch/update script**

Create `scripts/python-data-tools/fetch-bike-sharing.mjs`. It must:

1. Fetch only `https://archive.ics.uci.edu/static/public/275/bike+sharing+dataset.zip`.
2. Write the archive to an OS temporary directory, never the repository.
3. Use `unzip -p <temp-archive> hour.csv` through `execFile` rather than a shell command.
4. Validate the extracted bytes with `parseBikeSharingCsv()` and `validateBikeSharingRecords()` before writing.
5. Compute SHA-256, bytes, rows, columns, and column order from those exact bytes.
6. Write `bike-sharing-hour.csv` and a deterministic two-space-indented `manifest.json` using `writeFile` only after all checks pass.
7. Remove the temporary directory in `finally`.

Use this implementation:

```js
import { execFile as execFileCallback } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import {
  parseBikeSharingCsv,
  sha256,
  validateBikeSharingRecords,
} from './bikeSharingContract.mjs'

const execFile = promisify(execFileCallback)
const DATASET_URL = 'https://archive.ics.uci.edu/static/public/275/bike+sharing+dataset.zip'
const root = new URL('../../', import.meta.url)
const outputDirectory = new URL('public/datasets/python-data-tools/', root)
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'ml-atlas-bike-sharing-'))
const archivePath = join(temporaryDirectory, 'bike-sharing.zip')

try {
  const response = await fetch(DATASET_URL)
  if (!response.ok) throw new Error(`UCI download failed with HTTP ${response.status}`)
  await writeFile(archivePath, Buffer.from(await response.arrayBuffer()))
  const { stdout } = await execFile('unzip', ['-p', archivePath, 'hour.csv'], {
    encoding: 'buffer',
    maxBuffer: 16 * 1024 * 1024,
  })
  const csvBytes = Buffer.from(stdout)
  const parsed = parseBikeSharingCsv(new TextDecoder('utf-8', { fatal: true }).decode(csvBytes))
  const issues = validateBikeSharingRecords(parsed.records)
  if (issues.length) throw new Error(issues.join('\n'))

  const manifest = {
    contractVersion: 'python-data-tools-v1',
    dataset: {
      name: 'Bike Sharing Dataset',
      repository: 'UCI Machine Learning Repository',
      page: 'https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset',
      download: DATASET_URL,
      doi: '10.24432/C5W894',
    },
    license: {
      id: 'CC-BY-4.0',
      name: 'Creative Commons Attribution 4.0 International',
      url: 'https://creativecommons.org/licenses/by/4.0/',
    },
    retrievedAt: '2026-07-14',
    encoding: 'utf-8',
    delimiter: ',',
    dictionaryVersion: 'bike-sharing-hour-v1',
    file: {
      upstreamName: 'hour.csv',
      publicPath: '/datasets/python-data-tools/bike-sharing-hour.csv',
      sha256: sha256(csvBytes),
      bytes: csvBytes.byteLength,
      rows: parsed.records.length,
      columns: parsed.columns.length,
      columnOrder: parsed.columns,
    },
  }

  await mkdir(outputDirectory, { recursive: true })
  const csvTemporaryUrl = new URL('bike-sharing-hour.csv.next', outputDirectory)
  const manifestTemporaryUrl = new URL('manifest.json.next', outputDirectory)
  await Promise.all([
    writeFile(csvTemporaryUrl, csvBytes),
    writeFile(manifestTemporaryUrl, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8'),
  ])
  await rename(csvTemporaryUrl, new URL('bike-sharing-hour.csv', outputDirectory))
  await rename(manifestTemporaryUrl, new URL('manifest.json', outputDirectory))
  const committedBytes = await readFile(new URL('bike-sharing-hour.csv', outputDirectory))
  if (sha256(committedBytes) !== manifest.file.sha256) throw new Error('written snapshot hash differs from computed manifest hash')
  console.log(`Fetched ${manifest.file.rows} rows to ${new URL('bike-sharing-hour.csv', outputDirectory).pathname}`)
  console.log(`SHA-256 ${manifest.file.sha256}`)
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true })
}
```

- [ ] **Step 4: Fetch the snapshot and inspect the computed diff**

Run:

```bash
node scripts/python-data-tools/fetch-bike-sharing.mjs
node scripts/python-data-tools/verify-bike-sharing.mjs
```

Expected: the fetch command reports the local path and computed hash; the verifier reports a nonzero row count, 17 columns, and the same SHA-256. If the network or upstream archive is unavailable, stop without creating partial files and report the external blocker.

- [ ] **Step 5: Add the complete bilingual dictionary and provenance record**

Write `data-dictionary.json` with exactly 17 entries in `BIKE_SHARING_COLUMNS` order. Each entry must include `name`, bilingual `label`, bilingual `description`, `type`, `role`, and either `range`, `categories`, or `relationship`. Preserve the UCI normalization definitions:

- `temp`: Celsius divided by 41
- `atemp`: apparent Celsius divided by 50
- `hum`: humidity divided by 100
- `windspeed`: wind speed divided by 67
- `cnt`: `casual + registered`

Record the UCI category mappings for `season`, `yr`, `mnth`, `holiday`, `weekday`, `workingday`, and `weathersit` without inventing cleaned labels. Write `sources.md` with attribution, CC BY 4.0 link, immutable local-path policy, the exact fetch and verify commands, and the requirement to review hash/schema drift before committing an update.

Use this complete dictionary payload; category keys remain strings because JSON object keys are strings:

```json
{
  "version": "bike-sharing-hour-v1",
  "fields": [
    { "name": "instant", "label": { "zh-CN": "记录编号", "en": "Record index" }, "description": { "zh-CN": "每条小时记录的唯一顺序编号。", "en": "Unique sequential identifier for each hourly record." }, "type": "integer", "role": "identifier-time", "range": { "minimum": 1 } },
    { "name": "dteday", "label": { "zh-CN": "日期", "en": "Date" }, "description": { "zh-CN": "记录对应的日历日期，格式为 YYYY-MM-DD。", "en": "Calendar date for the record in YYYY-MM-DD format." }, "type": "date", "role": "identifier-time", "range": { "format": "YYYY-MM-DD" } },
    { "name": "season", "label": { "zh-CN": "季节", "en": "Season" }, "description": { "zh-CN": "UCI 提供的季节类别编码。", "en": "Season category code supplied by UCI." }, "type": "integer-category", "role": "calendar-category", "categories": { "1": { "zh-CN": "春季", "en": "spring" }, "2": { "zh-CN": "夏季", "en": "summer" }, "3": { "zh-CN": "秋季", "en": "fall" }, "4": { "zh-CN": "冬季", "en": "winter" } } },
    { "name": "yr", "label": { "zh-CN": "年份编码", "en": "Year code" }, "description": { "zh-CN": "数据集年份编码：0 表示 2011，1 表示 2012。", "en": "Dataset year code: 0 means 2011 and 1 means 2012." }, "type": "integer-category", "role": "identifier-time", "categories": { "0": { "zh-CN": "2011 年", "en": "2011" }, "1": { "zh-CN": "2012 年", "en": "2012" } } },
    { "name": "mnth", "label": { "zh-CN": "月份", "en": "Month" }, "description": { "zh-CN": "日历月份，1 到 12。", "en": "Calendar month from 1 through 12." }, "type": "integer-category", "role": "identifier-time", "range": { "minimum": 1, "maximum": 12 } },
    { "name": "hr", "label": { "zh-CN": "小时", "en": "Hour" }, "description": { "zh-CN": "一天中的小时，0 到 23。", "en": "Hour of day from 0 through 23." }, "type": "integer", "role": "identifier-time", "range": { "minimum": 0, "maximum": 23 } },
    { "name": "holiday", "label": { "zh-CN": "节假日", "en": "Holiday" }, "description": { "zh-CN": "该日期是否被标记为节假日。", "en": "Whether the date is marked as a holiday." }, "type": "integer-category", "role": "calendar-category", "categories": { "0": { "zh-CN": "否", "en": "no" }, "1": { "zh-CN": "是", "en": "yes" } } },
    { "name": "weekday", "label": { "zh-CN": "星期编码", "en": "Weekday code" }, "description": { "zh-CN": "星期日为 0、星期六为 6 的星期编码。", "en": "Weekday code with Sunday as 0 and Saturday as 6." }, "type": "integer-category", "role": "identifier-time", "categories": { "0": { "zh-CN": "星期日", "en": "Sunday" }, "1": { "zh-CN": "星期一", "en": "Monday" }, "2": { "zh-CN": "星期二", "en": "Tuesday" }, "3": { "zh-CN": "星期三", "en": "Wednesday" }, "4": { "zh-CN": "星期四", "en": "Thursday" }, "5": { "zh-CN": "星期五", "en": "Friday" }, "6": { "zh-CN": "星期六", "en": "Saturday" } } },
    { "name": "workingday", "label": { "zh-CN": "工作日", "en": "Working day" }, "description": { "zh-CN": "既不是周末也不是节假日时为 1。", "en": "Equals 1 when the day is neither a weekend nor a holiday." }, "type": "integer-category", "role": "calendar-category", "categories": { "0": { "zh-CN": "非工作日", "en": "non-working day" }, "1": { "zh-CN": "工作日", "en": "working day" } } },
    { "name": "weathersit", "label": { "zh-CN": "天气状况", "en": "Weather situation" }, "description": { "zh-CN": "UCI 按能见度和降水强度划分的天气类别。", "en": "UCI weather category based on visibility and precipitation severity." }, "type": "integer-category", "role": "weather-category", "categories": { "1": { "zh-CN": "晴朗、少云或局部多云", "en": "clear, few clouds, or partly cloudy" }, "2": { "zh-CN": "薄雾或多云", "en": "mist or cloudy" }, "3": { "zh-CN": "小雪或小雨并伴随雷暴或散云", "en": "light snow or rain with thunderstorm or scattered clouds" }, "4": { "zh-CN": "大雨、冰雹、雷暴、大雾或大雪", "en": "heavy rain, ice pellets, thunderstorm, mist, or snow" } } },
    { "name": "temp", "label": { "zh-CN": "归一化温度", "en": "Normalized temperature" }, "description": { "zh-CN": "摄氏温度除以 41 后的值。", "en": "Celsius temperature divided by 41." }, "type": "number", "role": "normalized-continuous", "range": { "minimum": 0, "maximum": 1, "normalization": "celsius / 41" } },
    { "name": "atemp", "label": { "zh-CN": "归一化体感温度", "en": "Normalized apparent temperature" }, "description": { "zh-CN": "摄氏体感温度除以 50 后的值。", "en": "Apparent Celsius temperature divided by 50." }, "type": "number", "role": "normalized-continuous", "range": { "minimum": 0, "maximum": 1, "normalization": "apparent celsius / 50" } },
    { "name": "hum", "label": { "zh-CN": "归一化湿度", "en": "Normalized humidity" }, "description": { "zh-CN": "相对湿度除以 100 后的值。", "en": "Relative humidity divided by 100." }, "type": "number", "role": "normalized-continuous", "range": { "minimum": 0, "maximum": 1, "normalization": "relative humidity / 100" } },
    { "name": "windspeed", "label": { "zh-CN": "归一化风速", "en": "Normalized wind speed" }, "description": { "zh-CN": "风速除以 67 后的值。", "en": "Wind speed divided by 67." }, "type": "number", "role": "normalized-continuous", "range": { "minimum": 0, "maximum": 1, "normalization": "wind speed / 67" } },
    { "name": "casual", "label": { "zh-CN": "临时用户数", "en": "Casual riders" }, "description": { "zh-CN": "该小时未注册用户的租车次数。", "en": "Number of rentals by unregistered users in the hour." }, "type": "integer", "role": "count", "range": { "minimum": 0 } },
    { "name": "registered", "label": { "zh-CN": "注册用户数", "en": "Registered riders" }, "description": { "zh-CN": "该小时注册用户的租车次数。", "en": "Number of rentals by registered users in the hour." }, "type": "integer", "role": "count", "range": { "minimum": 0 } },
    { "name": "cnt", "label": { "zh-CN": "总租车数", "en": "Total rentals" }, "description": { "zh-CN": "该小时临时用户和注册用户租车次数之和。", "en": "Total hourly rentals by casual and registered users." }, "type": "integer", "role": "count", "relationship": "cnt = casual + registered" }
  ]
}
```

Use this provenance record body after the title:

```markdown
## Source and attribution

The local snapshot is UCI Machine Learning Repository's **Bike Sharing Dataset**, file `hour.csv`, DOI `10.24432/C5W894`. It is distributed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The repository copy lives at `public/datasets/python-data-tools/bike-sharing-hour.csv` and its computed provenance is recorded in the adjacent `manifest.json`.

## Runtime policy

浏览器和课程 Notebook 只读取仓库内快照，不从远程地址补取数据。The browser and course notebook use only the repository snapshot and do not fetch a remote runtime copy.

## Maintainer update

Run `node scripts/python-data-tools/fetch-bike-sharing.mjs`, review the source, hash, schema, row-count, and invariant diff, then run `node scripts/python-data-tools/verify-bike-sharing.mjs`. A changed upstream hash is a review event, not an automatic content update.
```

- [ ] **Step 6: Run focused tests and offline verification**

Run:

```bash
node --test tests/python-data-tools-contract.test.ts
node scripts/python-data-tools/verify-bike-sharing.mjs
git diff --check
```

Expected: all focused tests PASS; offline verifier PASS; no whitespace errors.

- [ ] **Step 7: Commit the authoritative data contract**

```bash
git add scripts/python-data-tools/fetch-bike-sharing.mjs public/datasets/python-data-tools/bike-sharing-hour.csv public/datasets/python-data-tools/manifest.json public/datasets/python-data-tools/data-dictionary.json docs/curriculum-v3/python-data-tools/sources.md tests/python-data-tools-contract.test.ts
git commit -m "data: add verified Bike Sharing snapshot"
```

## Task 4: Lock the notebook execution environment

**Files:**
- Create: `scripts/python-data-tools/write-environment.mjs`
- Create: `public/notebooks/python-data-tools/environment.json`
- Create: `public/notebooks/python-data-tools/requirements.txt`
- Modify: `tests/python-data-tools-contract.test.ts`

- [ ] **Step 1: Append the failing environment test**

```ts
test('notebook environment uses exact pins and binds outputs to the dataset contract', () => {
  const manifest = JSON.parse(read('public/datasets/python-data-tools/manifest.json'))
  const environment = JSON.parse(read('public/notebooks/python-data-tools/environment.json'))
  const requirements = read('public/notebooks/python-data-tools/requirements.txt').trim().split('\n')
  assert.deepEqual(requirements, [
    'numpy==2.4.6',
    'pandas==3.0.3',
    'matplotlib==3.10.9',
    'seaborn==0.13.2',
    'plotly==6.9.0',
    'nbformat==5.10.4',
    'jupyterlab==4.6.1',
  ])
  assert.equal(environment.contractVersion, 'python-data-tools-v1')
  assert.equal(environment.python, '3.12.13')
  assert.equal(environment.dataset.sha256, manifest.file.sha256)
  assert.equal(environment.dataset.publicPath, manifest.file.publicPath)
  assert.equal(environment.execution.cleanKernel, true)
  assert.equal(environment.execution.networkAccess, false)
  assert.equal(environment.execution.hiddenState, false)
  assert.equal(environment.execution.numericJson, 'finite-only')
  assert.deepEqual(environment.execution.cellRoles, pythonDataToolsContract.cellRoles)
})
```

- [ ] **Step 2: Run the focused test and verify missing environment files fail**

Run `node --test tests/python-data-tools-contract.test.ts`.

Expected: FAIL with `ENOENT` for `public/notebooks/python-data-tools/environment.json`.

- [ ] **Step 3: Add exact requirements and the deterministic environment writer**

Create `requirements.txt` with exactly the seven ordered pins asserted above and a trailing newline.

Create `scripts/python-data-tools/write-environment.mjs`; it reads the checked-in dataset manifest, rejects a missing or non-64-character SHA-256, and writes the following deterministic object to `environment.json` using `JSON.stringify(environment, null, 2) + '\n'`:

```js
import { readFile, mkdir, writeFile } from 'node:fs/promises'

const root = new URL('../../', import.meta.url)
const manifest = JSON.parse(await readFile(new URL('public/datasets/python-data-tools/manifest.json', root), 'utf8'))
if (!/^[a-f0-9]{64}$/.test(manifest.file.sha256)) throw new Error('dataset manifest must contain a 64-character lowercase SHA-256')

const environment = {
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
    cellRoles: ['question', 'setup', 'data', 'compute', 'visualize', 'interpret', 'limit', 'handoff'],
  },
}

const output = new URL('public/notebooks/python-data-tools/environment.json', root)
await mkdir(new URL('./', output), { recursive: true })
await writeFile(output, `${JSON.stringify(environment, null, 2)}\n`, 'utf8')
console.log(`Wrote ${output.pathname}`)
```

Run `node scripts/python-data-tools/write-environment.mjs` to create the checked-in `environment.json` from the real manifest.

- [ ] **Step 4: Run focused tests and build**

Run:

```bash
node --test tests/python-data-tools-contract.test.ts
npm run build
```

Expected: all focused tests PASS; build succeeds with only the existing large-chunk warning.

- [ ] **Step 5: Commit the environment contract**

```bash
git add scripts/python-data-tools/write-environment.mjs public/notebooks/python-data-tools/environment.json public/notebooks/python-data-tools/requirements.txt tests/python-data-tools-contract.test.ts
git commit -m "chore: lock Python data tools environment"
```

## Task 5: Reconcile V3 planning state without changing runtime scope

**Files:**
- Modify: `.planning/STATE.md`
- Modify: `.planning/ROADMAP.md`
- Modify: `tests/python-data-tools-contract.test.ts`

- [ ] **Step 1: Append the failing planning-state test**

```ts
test('planning records completed V3.1 slices and the five Python data tools stages', () => {
  const state = read('.planning/STATE.md')
  const roadmap = read('.planning/ROADMAP.md')
  assert.doesNotMatch(state, /V3\.1 Minimum Mathematical Foundation is next and not started/)
  assert.match(state, /AI Overview.*completed/i)
  assert.match(state, /Math-to-Code.*completed/i)
  assert.match(state, /Python Data Tools.*Stage 1/i)
  for (const stage of [
    'Data and execution contract',
    'Eight-chapter Chinese master',
    'Notebook and real chart assets',
    'English parity and runtime refactor',
    'Consistency, browser, and build validation',
  ]) assert.match(roadmap, new RegExp(stage, 'i'))
})
```

- [ ] **Step 2: Run the focused test and verify stale planning state fails**

Run `node --test tests/python-data-tools-contract.test.ts`.

Expected: FAIL because `.planning/STATE.md` still says V3.1 is next and not started and the roadmap lacks the five stages.

- [ ] **Step 3: Update STATE with factual status**

Change the top status/current focus and bottom next command so they state:

- Curriculum V3.0 remains completed.
- The V3.1 AI Overview rebuild and Math-to-Code pilot are completed slices, not proof that all V3.1 is complete.
- Python Data Tools Stage 1 is current and preserves the current runtime lesson.
- Phase 24B/24C remain paused.

Add completed-work entries only for artifacts already present on `main`; do not invent PR numbers or test totals.

Use these exact top fields:

```markdown
**Updated:** 2026-07-14
**Status:** Curriculum V3.0 blueprint and audit are complete. The V3.1 AI Overview rebuild and Math-to-Code pilot are completed slices; Python Data Tools Stage 1 is current. Phase 24B Homepage Focus and Phase 24C Spine progressive disclosure remain paused.
```

Replace the `**Current focus:**` line with:

```markdown
**Current focus:** Establish the Python Data Tools data and execution contract without changing the current `python-notebook` runtime lesson, route, checkpoints, or progress behavior.
```

Append these factual decisions to `## Current Decisions`:

```markdown
- The V3.1 AI Overview rebuild and Math-to-Code pilot are completed curriculum slices; their completion does not mark all of V3.1 complete.
- Python Data Tools rebuilds the existing `python-notebook` module in five separately verified stages and preserves its ID and route.
- Python Data Tools Stage 1 establishes the Bike Sharing snapshot, typed chapter/output contract, exact environment, and offline verifier without changing runtime lesson content.
```

Replace `## Next Recommended Command` and its paragraph with:

```markdown
## Next Recommended Command

Complete and review Python Data Tools Stage 1 against its accepted data and execution contract. Keep Stages 2–5, Phase 24B Homepage Focus, and Phase 24C Spine progressive disclosure out of the Stage 1 diff.
```

- [ ] **Step 4: Add the five-stage roadmap section**

Replace the stale V3.1 “Next; not started” block with a factual V3.1 section and add this ordered Python Data Tools subsection:

```markdown
### Python Data Tools Course Rebuild

1. **Data and execution contract** — verified UCI snapshot, typed chapter/output contract, environment pins, and offline validation. No runtime lesson changes.
2. **Eight-chapter Chinese master** — complete Chinese teaching flow across Notebook, NumPy, Pandas, Matplotlib, Seaborn, Plotly, and final report.
3. **Notebook and real chart assets** — clean-kernel `.ipynb`, exact outputs, generated Matplotlib/Seaborn assets, and deterministic Plotly JSON.
4. **English parity and runtime refactor** — equivalent English content and migration of the existing `python-notebook` route to the new contract.
5. **Consistency, browser, and build validation** — data/code/output parity, bilingual checks, responsive browser checks, and production/Pages builds.
```

Mark only Stage 1 as current; Stages 2–5 remain planned.

- [ ] **Step 5: Run the planning and focused tests**

Run:

```bash
node --test tests/python-data-tools-contract.test.ts
git diff --check
```

Expected: all focused tests PASS; no whitespace errors.

- [ ] **Step 6: Commit planning reconciliation**

```bash
git add .planning/STATE.md .planning/ROADMAP.md tests/python-data-tools-contract.test.ts
git commit -m "docs: reconcile V3.1 curriculum state"
```

## Task 6: Run the stage-one acceptance gate

**Files:**
- Modify only if a verification failure exposes a stage-one defect; do not widen scope.

- [ ] **Step 1: Verify the local diff contains only stage-one files**

Run:

```bash
git status --short
git diff --stat main...HEAD
git diff --name-only main...HEAD
```

Expected: only the design/plan, typed contract, verifier/fetch scripts, Bike Sharing snapshot metadata/data, notebook environment files, source record, planning records, and focused test appear. `docs/gpt_advice.md` remains untracked and absent from every commit.

- [ ] **Step 2: Run the offline contract gate**

Run:

```bash
node scripts/python-data-tools/verify-bike-sharing.mjs
node --test tests/python-data-tools-contract.test.ts
```

Expected: verifier reports the manifest row count and SHA-256; all focused tests PASS.

- [ ] **Step 3: Run the repository acceptance commands**

Run:

```bash
npm test
npm run build
npm run build:pages
git diff --check main...HEAD
```

Expected: complete tests PASS; both builds succeed with at most the existing Vite large-chunk warning; diff check is clean.

- [ ] **Step 4: Confirm runtime preservation and prohibited-scope absence**

Run:

```bash
git diff --exit-code main...HEAD -- src/data/pythonNotebookModule.ts src/data/algorithmCheckpoints.ts src/components/AppliedWorkflowLessonLab.vue src/router
git diff --name-only main...HEAD | rg 'public/data-lab/generated|docs/gpt_advice.md' && exit 1 || true
```

Expected: both commands exit 0; runtime/checkpoint/router files and protected unrelated files are unchanged.

- [ ] **Step 5: Record the verification evidence without an extra code commit**

Use the final handoff to report:

- commit list and changed-file groups
- observed dataset row count and SHA-256
- focused test, full test, build, Pages build, and diff-check results
- the intentional runtime non-change
- remaining Stage 2–5 work

Do not amend previous commits solely to add transient command output, and do not merge or push without a separate user instruction.
