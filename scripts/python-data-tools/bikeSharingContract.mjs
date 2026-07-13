import { createHash } from 'node:crypto'

export const BIKE_SHARING_COLUMNS = Object.freeze([
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

const PYTHON_DATA_TOOLS_CONTRACT_VERSION = 'python-data-tools-v1'
const BIKE_SHARING_DICTIONARY_VERSION = 'bike-sharing-hour-v1'
const BIKE_SHARING_PROVENANCE = Object.freeze({
  name: 'Bike Sharing Dataset',
  repository: 'UCI Machine Learning Repository',
  page: 'https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset',
  download: 'https://archive.ics.uci.edu/static/public/275/bike+sharing+dataset.zip',
  doi: '10.24432/C5W894',
  retrievedAt: '2026-07-14',
})
const BIKE_SHARING_LICENSE = Object.freeze({
  id: 'CC-BY-4.0',
  name: 'Creative Commons Attribution 4.0 International',
  url: 'https://creativecommons.org/licenses/by/4.0/',
})
const PYTHON_DATA_TOOLS_REQUIREMENTS = Object.freeze([
  'numpy==2.4.6',
  'pandas==3.0.3',
  'matplotlib==3.10.9',
  'seaborn==0.13.2',
  'plotly==6.9.0',
  'nbformat==5.10.4',
  'jupyterlab==4.6.1',
])
const PYTHON_DATA_TOOLS_CELL_ROLES = Object.freeze([
  'question',
  'setup',
  'data',
  'compute',
  'visualize',
  'interpret',
  'limit',
  'handoff',
])
const FIELD_CONTRACTS = Object.freeze({
  instant: { type: 'integer', role: 'identifier-time', range: { minimum: 1 } },
  dteday: { type: 'date', role: 'identifier-time', range: { minimum: '2011-01-01', maximum: '2012-12-31' } },
  season: { type: 'integer-category', role: 'calendar-category', categories: ['1', '2', '3', '4'] },
  yr: { type: 'integer-category', role: 'identifier-time', categories: ['0', '1'] },
  mnth: { type: 'integer-category', role: 'identifier-time', range: { minimum: 1, maximum: 12 } },
  hr: { type: 'integer-category', role: 'identifier-time', range: { minimum: 0, maximum: 23 } },
  holiday: { type: 'binary-category', role: 'calendar-category', categories: ['0', '1'] },
  weekday: { type: 'integer-category', role: 'identifier-time', categories: ['0', '1', '2', '3', '4', '5', '6'] },
  workingday: { type: 'binary-category', role: 'calendar-category', categories: ['0', '1'] },
  weathersit: { type: 'integer-category', role: 'weather-category', categories: ['1', '2', '3', '4'] },
  temp: { type: 'number', role: 'normalized-continuous', normalization: 'celsius / 41' },
  atemp: { type: 'number', role: 'normalized-continuous', normalization: 'apparent celsius / 50' },
  hum: { type: 'number', role: 'normalized-continuous', normalization: 'relative humidity / 100' },
  windspeed: { type: 'number', role: 'normalized-continuous', normalization: 'wind speed / 67' },
  casual: { type: 'integer', role: 'count' },
  registered: { type: 'integer', role: 'count' },
  cnt: { type: 'integer', role: 'count' },
})
const EXPECTED_EXECUTION = Object.freeze({
  cleanKernel: true,
  runOrder: 'top-to-bottom',
  networkAccess: false,
  hiddenState: false,
  randomSeedRequired: true,
  hiddenSampling: false,
  numericJson: 'finite-only',
})

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function parseCsvRows(source) {
  const rows = []
  let row = []
  let cell = ''
  let index = 0
  let line = 1
  let rowLine = 1
  let quoted = false
  let closedQuote = false

  const finishCell = () => {
    row.push(cell)
    cell = ''
    closedQuote = false
  }
  const finishRow = () => {
    finishCell()
    rows.push({ cells: row, line: rowLine })
    row = []
    rowLine = line + 1
  }

  while (index < source.length) {
    const character = source[index]

    if (quoted) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          cell += '"'
          index += 2
          continue
        }
        quoted = false
        closedQuote = true
        index += 1
        continue
      }
      if (character === '\r' && source[index + 1] === '\n') {
        cell += '\r\n'
        line += 1
        index += 2
        continue
      }
      if (character === '\n' || character === '\r') {
        cell += character
        line += 1
        index += 1
        continue
      }
      cell += character
      index += 1
      continue
    }

    if (closedQuote && character !== ',' && character !== '\r' && character !== '\n') {
      throw new Error(`CSV row ${rowLine}: unexpected character ${JSON.stringify(character)} after closing quote`)
    }
    if (character === '"') {
      if (cell.length > 0 || closedQuote) {
        throw new Error(`CSV row ${rowLine}: unexpected quote in unquoted cell`)
      }
      quoted = true
      index += 1
      continue
    }
    if (character === ',') {
      finishCell()
      index += 1
      continue
    }
    if (character === '\r' || character === '\n') {
      finishRow()
      if (character === '\r' && source[index + 1] === '\n') index += 1
      line += 1
      rowLine = line
      index += 1
      continue
    }
    cell += character
    index += 1
  }

  if (quoted) throw new Error(`CSV row ${rowLine}: unterminated quoted cell`)
  finishRow()
  return rows
}

export function parseBikeSharingCsv(source) {
  if (typeof source !== 'string') throw new TypeError('Bike Sharing CSV source must be a string')
  const normalized = source.replace(/^\uFEFF/, '').replace(/(?:\r\n|\n|\r)+$/, '')
  if (!normalized) throw new Error('Bike Sharing CSV is empty; expected a header and data rows')

  const parsedRows = parseCsvRows(normalized)
  const header = parsedRows[0].cells
  const headerWidth = Math.max(header.length, BIKE_SHARING_COLUMNS.length)
  for (let index = 0; index < headerWidth; index += 1) {
    if (header[index] !== BIKE_SHARING_COLUMNS[index]) {
      throw new Error(
        `Bike Sharing header column ${index + 1}: expected ${JSON.stringify(BIKE_SHARING_COLUMNS[index] ?? '<no column>')}, received ${JSON.stringify(header[index] ?? '<missing>')} (expected ${BIKE_SHARING_COLUMNS.length} columns, received ${header.length})`,
      )
    }
  }
  if (parsedRows.length === 1) {
    throw new Error('Bike Sharing CSV has no data rows')
  }

  const records = parsedRows.slice(1).map(({ cells, line }) => {
    if (cells.length !== BIKE_SHARING_COLUMNS.length) {
      throw new Error(
        `Bike Sharing CSV source row ${line} has ${cells.length} columns; expected ${BIKE_SHARING_COLUMNS.length}`,
      )
    }
    return Object.fromEntries(BIKE_SHARING_COLUMNS.map((column, index) => [column, cells[index]]))
  })

  return { columns: [...BIKE_SHARING_COLUMNS], records }
}

function formatDiagnosticValue(value) {
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'bigint') return `${value}n`
  if (typeof value === 'symbol') return String(value)
  if (value === null || typeof value !== 'object') return String(value)

  try {
    const seen = new WeakSet()
    const serialized = JSON.stringify(value, (_key, nestedValue) => {
      if (typeof nestedValue === 'bigint') return `${nestedValue}n`
      if (typeof nestedValue === 'symbol') return String(nestedValue)
      if (nestedValue !== null && typeof nestedValue === 'object') {
        if (seen.has(nestedValue)) return '[Circular]'
        seen.add(nestedValue)
      }
      return nestedValue
    })
    return serialized ?? Object.prototype.toString.call(value)
  } catch {
    try {
      return Object.prototype.toString.call(value)
    } catch {
      return '<unformattable value>'
    }
  }
}

function isDigitString(value) {
  return typeof value === 'string' && /^\d+$/.test(value)
}

function isIntegerInRange(value, minimum, maximum = Number.POSITIVE_INFINITY) {
  if (!isDigitString(value)) return false
  const integer = BigInt(value)
  return integer >= BigInt(minimum)
    && (maximum === Number.POSITIVE_INFINITY || integer <= BigInt(maximum))
}

function isCalendarDate(value) {
  if (typeof value !== 'string') return false
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
}

export function validateBikeSharingRecords(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return ['Bike Sharing dataset has no records']
  }

  const issues = []
  const seenInstants = new Set()
  const integerRanges = {
    season: [1, 4],
    yr: [0, 1],
    mnth: [1, 12],
    hr: [0, 23],
    holiday: [0, 1],
    weekday: [0, 6],
    workingday: [0, 1],
    weathersit: [1, 4],
  }
  const normalizedColumns = ['temp', 'atemp', 'hum', 'windspeed']
  const countColumns = ['casual', 'registered', 'cnt']

  records.forEach((record, index) => {
    const row = index + 2
    const instant = record?.instant
    if (!isIntegerInRange(instant, 1)) {
      issues.push(`Row ${row}, instant: expected a positive integer; observed ${formatDiagnosticValue(instant)}`)
    } else if (seenInstants.has(BigInt(instant))) {
      issues.push(`Row ${row}, instant: duplicate value ${formatDiagnosticValue(instant)}`)
    } else {
      seenInstants.add(BigInt(instant))
    }

    if (!isCalendarDate(record?.dteday)) {
      issues.push(`Row ${row}, dteday: expected a valid YYYY-MM-DD calendar date; observed ${formatDiagnosticValue(record?.dteday)}`)
    }

    for (const [column, [minimum, maximum]] of Object.entries(integerRanges)) {
      const value = record?.[column]
      if (!isIntegerInRange(value, minimum, maximum)) {
        issues.push(`Row ${row}, ${column}: expected an integer from ${minimum} to ${maximum}; observed ${formatDiagnosticValue(value)}`)
      }
    }
    for (const column of normalizedColumns) {
      const value = record?.[column]
      const numeric = typeof value === 'string' && value !== '' ? Number(value) : Number.NaN
      if (!Number.isFinite(numeric) || numeric < 0 || numeric > 1) {
        issues.push(`Row ${row}, ${column}: expected a finite normalized value from 0 to 1; observed ${formatDiagnosticValue(value)}`)
      }
    }
    for (const column of countColumns) {
      const value = record?.[column]
      if (!isIntegerInRange(value, 0)) {
        issues.push(`Row ${row}, ${column}: expected a nonnegative integer; observed ${formatDiagnosticValue(value)}`)
      }
    }
    if (countColumns.every((column) => isIntegerInRange(record?.[column], 0))) {
      const expected = BigInt(record.casual) + BigInt(record.registered)
      if (BigInt(record.cnt) !== expected) {
        issues.push(`Row ${row}, cnt: expected casual + registered = ${expected}; observed ${formatDiagnosticValue(record.cnt)}`)
      }
    }
  })

  return issues
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function hasNonemptyLocalizedCopy(value) {
  return isRecord(value)
    && typeof value['zh-CN'] === 'string'
    && value['zh-CN'].trim().length > 0
    && typeof value.en === 'string'
    && value.en.trim().length > 0
}

function arraysEqual(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index])
}

export function validatePythonDataToolsArtifacts({
  manifest,
  dictionary,
  environment,
  requirements,
} = {}) {
  const issues = []
  const manifestRecord = isRecord(manifest) ? manifest : {}
  const manifestDataset = isRecord(manifestRecord.dataset) ? manifestRecord.dataset : {}
  const manifestLicense = isRecord(manifestDataset.license) ? manifestDataset.license : {}
  const manifestFile = isRecord(manifestRecord.file) ? manifestRecord.file : {}
  const dictionaryRecord = isRecord(dictionary) ? dictionary : {}
  const environmentRecord = isRecord(environment) ? environment : {}
  const environmentDataset = isRecord(environmentRecord.dataset) ? environmentRecord.dataset : {}
  const execution = isRecord(environmentRecord.execution) ? environmentRecord.execution : {}

  if (!isRecord(manifest)) issues.push('Manifest must be a JSON object')
  if (manifestRecord.contractVersion !== PYTHON_DATA_TOOLS_CONTRACT_VERSION) {
    issues.push(`Manifest contractVersion: expected ${PYTHON_DATA_TOOLS_CONTRACT_VERSION}; observed ${formatDiagnosticValue(manifestRecord.contractVersion)}`)
  }
  if (manifestRecord.dictionaryVersion !== BIKE_SHARING_DICTIONARY_VERSION) {
    issues.push(`Manifest.dictionaryVersion: expected ${BIKE_SHARING_DICTIONARY_VERSION}; observed ${formatDiagnosticValue(manifestRecord.dictionaryVersion)}`)
  }
  if (!isRecord(manifestRecord.dataset)) issues.push('Manifest dataset must be a JSON object')
  for (const [property, expected] of Object.entries(BIKE_SHARING_PROVENANCE)) {
    if (manifestDataset[property] !== expected) {
      issues.push(`Manifest dataset.${property}: expected ${formatDiagnosticValue(expected)}; observed ${formatDiagnosticValue(manifestDataset[property])}`)
    }
  }
  if (!isRecord(manifestDataset.license)) issues.push('Manifest dataset.license must be a JSON object')
  for (const [property, expected] of Object.entries(BIKE_SHARING_LICENSE)) {
    if (manifestLicense[property] !== expected) {
      issues.push(`Manifest dataset.license.${property}: expected ${formatDiagnosticValue(expected)}; observed ${formatDiagnosticValue(manifestLicense[property])}`)
    }
  }
  if (!isRecord(manifestRecord.file)) issues.push('Manifest file must be a JSON object')
  for (const [property, expected] of Object.entries({
    upstreamName: 'hour.csv',
    encoding: 'utf-8',
    delimiter: 'comma',
  })) {
    if (manifestFile[property] !== expected) {
      issues.push(`Manifest file.${property}: expected ${formatDiagnosticValue(expected)}; observed ${formatDiagnosticValue(manifestFile[property])}`)
    }
  }
  if (manifestFile.publicPath !== '/datasets/python-data-tools/bike-sharing-hour.csv') {
    issues.push(`Manifest file.publicPath: expected "/datasets/python-data-tools/bike-sharing-hour.csv"; observed ${formatDiagnosticValue(manifestFile.publicPath)}`)
  }
  if (typeof manifestFile.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(manifestFile.sha256)) {
    issues.push(`Manifest file.sha256 must be 64 lowercase hexadecimal characters; observed ${formatDiagnosticValue(manifestFile.sha256)}`)
  }

  if (!isRecord(dictionary)) issues.push('Data dictionary must be a JSON object')
  if (dictionaryRecord.version !== BIKE_SHARING_DICTIONARY_VERSION) {
    issues.push(`Data dictionary.version: expected ${BIKE_SHARING_DICTIONARY_VERSION}; observed ${formatDiagnosticValue(dictionaryRecord.version)}`)
  }
  if (dictionaryRecord.version !== manifestRecord.dictionaryVersion) {
    issues.push(`Data dictionary.version must equal manifest.dictionaryVersion ${formatDiagnosticValue(manifestRecord.dictionaryVersion)}; observed ${formatDiagnosticValue(dictionaryRecord.version)}`)
  }
  const fields = Array.isArray(dictionaryRecord.fields) ? dictionaryRecord.fields : []
  if (!Array.isArray(dictionaryRecord.fields)) {
    issues.push(`Data dictionary fields must be an array; observed ${formatDiagnosticValue(dictionaryRecord.fields)}`)
  }
  if (fields.length !== BIKE_SHARING_COLUMNS.length) {
    issues.push(`Data dictionary fields: expected ${BIKE_SHARING_COLUMNS.length} entries; observed ${fields.length}`)
  }
  BIKE_SHARING_COLUMNS.forEach((name, index) => {
    const field = isRecord(fields[index]) ? fields[index] : {}
    const position = index + 1
    if (!isRecord(fields[index])) {
      issues.push(`Data dictionary field ${position} must be an object for ${name}; observed ${formatDiagnosticValue(fields[index])}`)
      return
    }
    if (field.name !== name) {
      issues.push(`Data dictionary field ${position}: expected name ${name}; observed ${formatDiagnosticValue(field.name)}`)
    }
    if (!hasNonemptyLocalizedCopy(field.label)) {
      issues.push(`Data dictionary field ${position} (${name}) label must contain nonempty zh-CN and en strings`)
    }
    if (!hasNonemptyLocalizedCopy(field.description)) {
      issues.push(`Data dictionary field ${position} (${name}) description must contain nonempty zh-CN and en strings`)
    }

    const expected = FIELD_CONTRACTS[name]
    for (const property of ['type', 'role']) {
      if (field[property] !== expected[property]) {
        issues.push(`Data dictionary field ${position} (${name}) ${property}: expected ${expected[property]}; observed ${formatDiagnosticValue(field[property])}`)
      }
    }
    if (expected.normalization) {
      if (field.normalization !== expected.normalization) {
        issues.push(`Data dictionary field ${position} (${name}) normalization: expected ${expected.normalization}; observed ${formatDiagnosticValue(field.normalization)}`)
      }
      if (!isRecord(field.range) || field.range.minimum !== 0 || field.range.maximum !== 1) {
        issues.push(`Data dictionary field ${position} (${name}) normalized range must be exactly 0 to 1`)
      }
    }
    if (expected.range) {
      const range = isRecord(field.range) ? field.range : {}
      const expectedKeys = Object.keys(expected.range)
      const rangeKeys = Object.keys(range)
      if (!arraysEqual([...rangeKeys].sort(), [...expectedKeys].sort())
        || expectedKeys.some((key) => range[key] !== expected.range[key])) {
        issues.push(`Data dictionary field ${position} (${name}) range: expected ${formatDiagnosticValue(expected.range)}; observed ${formatDiagnosticValue(field.range)}`)
      }
    }
    if (expected.categories) {
      const categories = isRecord(field.categories) ? field.categories : {}
      const categoryKeys = Object.keys(categories)
      if (!arraysEqual(categoryKeys, expected.categories)) {
        issues.push(`Data dictionary field ${position} (${name}) category keys: expected ${formatDiagnosticValue(expected.categories)}; observed ${formatDiagnosticValue(categoryKeys)}`)
      }
      for (const category of expected.categories) {
        if (!hasNonemptyLocalizedCopy(categories[category])) {
          issues.push(`Data dictionary field ${position} (${name}) category ${category} must contain nonempty zh-CN and en strings`)
        }
      }
    }
    if (expected.role === 'count'
      && (!isRecord(field.range) || field.range.minimum !== 0 || Object.hasOwn(field.range, 'maximum'))) {
      issues.push(`Data dictionary field ${position} (${name}) count range must have minimum 0 and no maximum`)
    }
    if (name === 'cnt' && field.relationship !== 'cnt = casual + registered') {
      issues.push(`Data dictionary field ${position} (cnt) relationship must be "cnt = casual + registered"; observed ${formatDiagnosticValue(field.relationship)}`)
    }
  })

  if (!isRecord(environment)) issues.push('Environment must be a JSON object')
  if (environmentRecord.contractVersion !== PYTHON_DATA_TOOLS_CONTRACT_VERSION
    || environmentRecord.contractVersion !== manifestRecord.contractVersion) {
    issues.push(`Environment contractVersion must equal manifest.contractVersion and ${PYTHON_DATA_TOOLS_CONTRACT_VERSION}; observed ${formatDiagnosticValue(environmentRecord.contractVersion)}`)
  }
  if (environmentRecord.python !== '3.12.13') {
    issues.push(`Environment python: expected 3.12.13; observed ${formatDiagnosticValue(environmentRecord.python)}`)
  }
  for (const [property, expected] of Object.entries({
    generatedAt: '2026-07-14',
    generatedOn: 'darwin-arm64',
  })) {
    if (environmentRecord[property] !== expected) {
      issues.push(`Environment.${property}: expected ${formatDiagnosticValue(expected)}; observed ${formatDiagnosticValue(environmentRecord[property])}`)
    }
  }
  if (!isRecord(environmentRecord.dataset)) issues.push('Environment dataset must be a JSON object')
  for (const property of ['publicPath', 'sha256']) {
    if (environmentDataset[property] !== manifestFile[property]) {
      issues.push(`Environment dataset.${property} must equal manifest.file.${property} ${formatDiagnosticValue(manifestFile[property])}; observed ${formatDiagnosticValue(environmentDataset[property])}`)
    }
  }
  if (!isRecord(environmentRecord.execution)) issues.push('Environment execution must be a JSON object')
  const expectedExecutionKeys = [...Object.keys(EXPECTED_EXECUTION), 'cellRoles']
  const executionKeys = Object.keys(execution)
  if (!arraysEqual([...executionKeys].sort(), [...expectedExecutionKeys].sort())) {
    issues.push(`Environment execution keys: expected ${formatDiagnosticValue(expectedExecutionKeys)}; observed ${formatDiagnosticValue(executionKeys)}`)
  }
  for (const [property, expected] of Object.entries(EXPECTED_EXECUTION)) {
    if (execution[property] !== expected) {
      issues.push(`Environment execution.${property}: expected ${formatDiagnosticValue(expected)}; observed ${formatDiagnosticValue(execution[property])}`)
    }
  }
  if (!arraysEqual(execution.cellRoles, PYTHON_DATA_TOOLS_CELL_ROLES)) {
    issues.push(`Environment execution.cellRoles: expected ${formatDiagnosticValue(PYTHON_DATA_TOOLS_CELL_ROLES)}; observed ${formatDiagnosticValue(execution.cellRoles)}`)
  }

  if (typeof requirements !== 'string') {
    issues.push(`Requirements must be text; observed ${formatDiagnosticValue(requirements)}`)
  } else {
    const expectedRequirements = `${PYTHON_DATA_TOOLS_REQUIREMENTS.join('\n')}\n`
    if (requirements !== expectedRequirements) {
      issues.push('Requirements bytes must exactly contain the seven ordered pins with LF separators and exactly one trailing LF')
    }
    const pins = requirements.replace(/(?:\r\n|\n|\r)+$/, '').split(/\r?\n/)
    const width = Math.max(pins.length, PYTHON_DATA_TOOLS_REQUIREMENTS.length)
    for (let index = 0; index < width; index += 1) {
      if (pins[index] !== PYTHON_DATA_TOOLS_REQUIREMENTS[index]) {
        issues.push(`Requirements pin ${index + 1}: expected ${formatDiagnosticValue(PYTHON_DATA_TOOLS_REQUIREMENTS[index] ?? '<no pin>')}; observed ${formatDiagnosticValue(pins[index] ?? '<missing>')}`)
      }
    }
  }

  return issues
}

export function verifyBikeSharingSnapshot(bytes, manifest) {
  const byteView = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  const source = new TextDecoder('utf-8', { fatal: true }).decode(byteView)
  const { columns, records } = parseBikeSharingCsv(source)
  const observed = {
    sha256: sha256(byteView),
    bytes: byteView.byteLength,
    rows: records.length,
    columns: columns.length,
    columnOrder: columns,
  }
  const issues = validateBikeSharingRecords(records)
  const expected = manifest?.file ?? {}

  for (const field of ['sha256', 'bytes', 'rows', 'columns']) {
    if (observed[field] !== expected[field]) {
      issues.push(
        `Manifest file.${field} mismatch: expected ${formatDiagnosticValue(expected[field])}, observed ${formatDiagnosticValue(observed[field])}`,
      )
    }
  }
  if (!Array.isArray(expected.columnOrder)
    || expected.columnOrder.length !== observed.columnOrder.length
    || expected.columnOrder.some((column, index) => column !== observed.columnOrder[index])) {
    issues.push(
      `Manifest file.columnOrder mismatch: expected ${formatDiagnosticValue(expected.columnOrder)}, observed ${formatDiagnosticValue(observed.columnOrder)}`,
    )
  }

  return { observed, issues }
}
